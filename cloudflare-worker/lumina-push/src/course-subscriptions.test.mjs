import test from 'node:test';
import assert from 'node:assert/strict';
import worker from './index.js';
import {courseSubscriptionAction,courseSubscriptionFailure,dispatchCourseLesson,latestCourseLesson,firestoreCourseStore,kvCourseStore,courseAccountState} from './course-subscriptions.js';
import {dailyCourseManifest} from '../../../scripts/daily-course-manifest.mjs';
const lesson = {number:8,title:'Wieża Babel',availableAt:'2026-10-08T00:00:00.000Z',url:'https://polskieradio.cc/akademia/kurscodzienny/dzien-08'};
test('quota and IAM failures never appear as a missing or successful subscription',async()=>{
  for (const providerStatus of [429,403,500]) {
    let mutations=0;
    const store=firestoreCourseStore({FIREBASE_PROJECT_ID:'synthetic'},'synthetic',async(_url,options)=>{
      if (options.method) mutations++;
      return new Response('private provider diagnostics',{status:providerStatus});
    });
    for (const action of ['status','subscribe']) {
      await assert.rejects(courseSubscriptionAction('student',{action,consent:true},{store}),error=>{
        assert.equal(error.message,'subscription_read_failed');
        assert.equal(error.providerStatus,providerStatus);
        const failure=courseSubscriptionFailure(error);
        assert.equal(failure.status,providerStatus===500?502:503);
        assert.equal(failure.body.subscribed,undefined);
        assert.doesNotMatch(JSON.stringify(failure),/private provider|synthetic|student/);
        assert.match(failure.body.error,providerStatus===429?/limit/:providerStatus===403?/uprawnień/:/ponownie/);
        return true;
      });
    }
    assert.equal(mutations,0);
  }
});
test('save and unsubscribe provider failures preserve safe diagnostics and do not confirm success',async()=>{
  for (const action of ['subscribe','unsubscribe']) {
    const store=firestoreCourseStore({FIREBASE_PROJECT_ID:'synthetic'},'synthetic',async(_url,options)=>{
      if (!options.method) return new Response('',{status:404});
      if (options.method==='POST') return Response.json([]);
      return new Response('private detail',{status:403});
    });
    await assert.rejects(courseSubscriptionAction('student',{action,consent:true},{store,tokens:async()=>['synthetic'],latest:async()=>lesson}),error=>{
      assert.equal(error.providerStatus,403);
      assert.equal(error.message,action==='subscribe'?'subscription_save_failed':'subscription_remove_failed');
      assert.equal(courseSubscriptionFailure(error).status,503);
      return true;
    });
  }
});
function fixture(initial) {
  let record=initial?{data:{uid:'student',enabled:true,lastLessonNumber:7,leaseUntil:0,attempts:0,...initial},revision:'1'}:null;
  let revision=1; let sends=0;
  const deps={
    store:{get:async()=>record?structuredClone(record):null,save:async(uid,data,rev)=>{
      if(rev && record?.revision!==rev)return false;
      record={data:{...record?.data,...data},revision:String(++revision)};return true;
    },remove:async()=>{record=null;return true;},pending:async n=>record && record.data.lastLessonNumber<n?[{...structuredClone(record),uid:'student'}]:[]},
    latest:async()=>lesson,tokens:async()=>['device'],send:async()=>{sends++;return true;}
  };
  return {deps,get record(){return record;},get sends(){return sends;}};
}
test('auth, exact consent and schema required; UID cannot be supplied by caller',async()=>{
  const f=fixture();
  assert.equal((await courseSubscriptionAction(null,{action:'subscribe',consent:true},f.deps)).status,401);
  for(const body of [{action:'subscribe'},{action:'subscribe',consent:'true'},{action:'subscribe',consent:true,uid:'victim'}])
    assert.equal((await courseSubscriptionAction('student',body,f.deps)).status,400);
  assert.equal(f.record,null);
});
test('subscription saved only after device registration; no old-lesson broadcast',async()=>{
  const f=fixture();f.deps.tokens=async()=>[];
  assert.equal((await courseSubscriptionAction('student',{action:'subscribe',consent:true},f.deps)).status,409);
  assert.equal(f.record,null);f.deps.tokens=async()=>['device'];
  const r=await courseSubscriptionAction('student',{action:'subscribe',consent:true},f.deps);
  assert.equal(r.body.subscribed,true);assert.equal(f.record.data.uid,'student');
  assert.equal(f.record.data.lastLessonNumber,8);assert.equal(f.record.data.consentVersion,'daily-course-push-v1');
  await dispatchCourseLesson(f.deps);assert.equal(f.sends,0);
});
test('preferred hour selection, validation, update and hour-filtered dispatch',async()=>{
  const f=fixture();
  const r1=await courseSubscriptionAction('student',{action:'subscribe',consent:true,preferredHour:99},f.deps);
  assert.equal(r1.status,200);
  assert.equal(r1.body.preferredHour,7);
  assert.equal(f.record.data.preferredHour,7);
  const s1=await courseSubscriptionAction('student',{action:'status'},f.deps);
  assert.equal(s1.body.subscribed,true);
  assert.equal(s1.body.preferredHour,7);
  const r2=await courseSubscriptionAction('student',{action:'subscribe',consent:true,preferredHour:20},f.deps);
  assert.equal(r2.status,200);
  assert.equal(r2.body.preferredHour,20);
  assert.equal(f.record.data.preferredHour,20);
  assert.equal(f.record.data.lastLessonNumber,8);
  f.record.data.lastLessonNumber=7;
  f.deps.currentHour=8;
  const d1=await dispatchCourseLesson(f.deps);
  assert.equal(d1.accepted,0);
  assert.equal(f.sends,0);
  f.deps.currentHour=20;
  const d2=await dispatchCourseLesson(f.deps);
  assert.equal(d2.accepted,1);
  assert.equal(f.sends,1);
});
test('write failure cannot announce successful subscription',async()=>{
  const f=fixture();f.deps.store.save=async()=>false;
  assert.equal((await courseSubscriptionAction('student',{action:'subscribe',consent:true},f.deps)).status,409);
});
test('unsubscribe removes preference, status is false, no send follows',async()=>{
  const f=fixture({});await courseSubscriptionAction('student',{action:'unsubscribe'},f.deps);
  assert.equal((await courseSubscriptionAction('student',{action:'status'},f.deps)).body.subscribed,false);
  await dispatchCourseLesson(f.deps);assert.equal(f.sends,0);
});
test('successful publication dispatch has stable URL and no second send',async()=>{
  const f=fixture({});f.deps.send=async(token,l)=>{assert.equal(l.url,lesson.url);return true;};
  assert.equal((await dispatchCourseLesson(f.deps)).accepted,1);
  assert.equal((await dispatchCourseLesson(f.deps)).selected,0);
});
test('active lease or failed compare-and-set prevent overlapping delivery',async()=>{
  const f=fixture({leaseUntil:Date.now()+120000});await dispatchCourseLesson(f.deps);assert.equal(f.sends,0);
  const g=fixture({});g.deps.store.save=async()=>false;await dispatchCourseLesson(g.deps);assert.equal(g.sends,0);
});
test('unsubscription during claim is not recreated or delivered',async()=>{
  const f=fixture({});const save=f.deps.store.save;
  f.deps.store.save=async(...args)=>{const ok=await save(...args);await f.deps.store.remove();return ok;};
  await dispatchCourseLesson(f.deps);assert.equal(f.sends,0);assert.equal(f.record,null);
});
test('FCM failure keeps lesson pending with backoff, never discards it',async()=>{
  const f=fixture({});f.deps.send=async()=>false;
  const now=Date.now();
  for(let i=0;i<3;i++)assert.equal((await dispatchCourseLesson(f.deps,now+i*3600000)).accepted,0);
  assert.equal(f.record.data.lastLessonNumber,7);
  assert.ok(f.record.data.leaseUntil>now+2*3600000);
});
test('backlog resumes oldest pending lesson and advances only after acceptance',async()=>{
  const f=fixture({lastLessonNumber:6});
  f.deps.lessons=async()=>[{...lesson,number:7,url:lesson.url.replace('08','07')},lesson];
  const numbers=[];f.deps.send=async(token,l)=>{numbers.push(l.number);return true;};
  await dispatchCourseLesson(f.deps);await dispatchCourseLesson(f.deps);
  assert.deepEqual(numbers,[7,8]);
});
test('newest eligible manifest lesson only; rejects external links and future dates',async()=>{
  const manifest={version:1,lessons:[lesson,{...lesson,number:9,availableAt:'2099-01-01',url:'https://polskieradio.cc/akademia/kurscodzienny/dzien-09'},{...lesson,number:10,url:'https://evil.example/'}]};
  assert.equal((await latestCourseLesson(async()=>Response.json(manifest),Date.parse('2026-10-08T12:00:00Z'))).number,8);
});
test('release manifest includes canonical sources once and excludes future days',()=>{
  const r=dailyCourseManifest(['akademia/kurscodzienny/dzien-08.html','akademia/kurscodzienny/dzien-08/index.html','akademia/kurscodzienny/dzien-09.html'],()=>'<title>Lesson</title>',Date.parse('2026-10-08T12:00Z'));
  assert.deepEqual(r.lessons.map(l=>l.number),[8]);
});
test('store precondition and batch bound; authenticated UID is the document path',async()=>{
  let request;
  const store=firestoreCourseStore({FIREBASE_PROJECT_ID:'synthetic'},'fake',async(url,opt)=>{request={url,opt};return Response.json({});});
  await store.save('student',{lastLessonNumber:8},'revision');
  assert.ok(request.url.includes('/cc_daily_course_subscriptions/student?'));
  assert.ok(request.url.includes('currentDocument.updateTime=revision'));
});
test('backend refuses foreign origin, unauthenticated and anonymous subscriptions',async t=>{
  const env={COURSE_PUSH_ENABLED:'true',ALLOWED_ORIGIN:'https://polskieradio.cc',FIREBASE_WEB_API_KEY:'synthetic'};
  const make=(origin,auth)=>new Request('https://push.example/v1/course/subscription',{method:'POST',headers:{origin,...(auth?{authorization:'Bearer fake'}:{})},body:JSON.stringify({action:'subscribe',consent:true})});
  assert.equal((await worker.fetch(make('https://evil.example'),env)).status,403);
  assert.equal((await worker.fetch(make(env.ALLOWED_ORIGIN),env)).status,401);
  t.mock.method(globalThis,'fetch',async()=>Response.json({users:[{localId:'anon'}]}));
  assert.equal((await worker.fetch(make(env.ALLOWED_ORIGIN,true),env)).status,401);
});
test('feature disabled does not call providers or send from scheduled handler',async()=>{
  await worker.scheduled({},{});
});
test('pilot preflight is disabled by default; rejects recipients and non-pilot accounts',async t=>{
  const origin='https://polskieradio.cc';
  const request=body=>new Request('https://push.example/v1/course/preflight',{method:'POST',headers:{origin,authorization:'Bearer synthetic'},...(body?{body}:{})});
  const env={ALLOWED_ORIGIN:origin,FIREBASE_WEB_API_KEY:'synthetic'};
  assert.equal((await worker.fetch(request(),env)).status,503);
  env.COURSE_PUSH_PILOT_UID='pilot';
  assert.equal((await worker.fetch(request('{"uid":"another"}'),env)).status,400);
  let calls=0;t.mock.method(globalThis,'fetch',async()=>{calls++;return Response.json({users:[{localId:'another',email:'synthetic@example.invalid'}]});});
  assert.equal((await worker.fetch(request(),env)).status,403);assert.equal(calls,1,'Must not use privileged OAuth for non-pilot');
});
test('round-robin bypasses leased, completed and failed students and wraps after end',async()=>{
  let after='';let revision=0;const delivered=[];
  const records=new Map(['a','b','c'].map(uid=>[uid,{uid,enabled:true,lastLessonNumber:7,leaseUntil:0}]));
  records.get('a').leaseUntil=Date.now()+3600000;
  const deps={lessons:async()=>[lesson],accountState:async()=> 'active',tokens:async uid=>[uid],
    send:async token=>{if(token==='b')throw Error('synthetic network failure');delivered.push(token);return true;},
    store:{cursor:async()=>({after,revision:'cursor'}),advance:async uid=>{after=uid;return true;},
      pending:async(n,cursor)=>[...records].filter(([uid])=>uid>cursor).slice(0,2).map(([uid,data])=>({uid,data:{...data},revision:'r'+revision})),
      save:async(uid,data)=>{Object.assign(records.get(uid),data);revision++;return true;},
      get:async uid=>({data:{...records.get(uid)},revision:'r'+revision}),remove:async uid=>records.delete(uid)}
  };
  await dispatchCourseLesson(deps);assert.equal(after,'b');
  await dispatchCourseLesson(deps);assert.deepEqual(delivered,['c']);assert.equal(after,'c');
  await dispatchCourseLesson(deps);assert.equal(after,'');
  assert.equal(records.get('b').lastLessonNumber,7);
});
test('deleted auth account preference is removed even when lesson already processed',async()=>{
  const f=fixture({lastLessonNumber:8});f.deps.store.pending=async()=>[{uid:'student',...f.record}];
  f.deps.accountState=async()=> 'deleted';
  const r=await dispatchCourseLesson(f.deps);assert.equal(r.removed,1);assert.equal(f.record,null);assert.equal(f.sends,0);
});
test('lookup failure never deletes consent or sends; disabled account remains retained',async()=>{
  for(const state of ['disabled','error']) {
    const f=fixture({});f.deps.accountState=async()=>{if(state==='error')throw Error('synthetic');return state;};
    await dispatchCourseLesson(f.deps);assert.ok(f.record);assert.equal(f.sends,0);
  }
});
test('unsubscribe then resubscribe during claim cannot deliver the old claimed lesson',async()=>{
  const f=fixture({});const save=f.deps.store.save;
  f.deps.store.save=async(...args)=>{const ok=await save(...args);await f.deps.store.remove();await save('student',{uid:'student',enabled:true,lastLessonNumber:8});return ok;};
  await dispatchCourseLesson(f.deps);assert.equal(f.sends,0);
});
test('account lookup uses only UID, distinguishes deleted/disabled, rejects errors and mismatch',async()=>{
  const env={FIREBASE_PROJECT_ID:'synthetic'};let request;
  const lookup=body=>async(url,opt)=>{request={url,opt};return Response.json(body);};
  assert.equal(await courseAccountState('student',env,'fake',lookup({users:[]})),'deleted');
  assert.deepEqual(JSON.parse(request.opt.body),{localId:['student']});
  assert.equal(await courseAccountState('student',env,'fake',lookup({users:[{localId:'student',email:'synthetic@example.invalid'}]})),'active');
  assert.equal(await courseAccountState('student',env,'fake',lookup({users:[{localId:'student',disabled:true}]})),'disabled');
  await assert.rejects(courseAccountState('student',env,'fake',async()=>new Response('',{status:403})));
  await assert.rejects(courseAccountState('student',env,'fake',lookup({users:[{localId:'another'}]})));
});
test('cursor query is bounded, exclusive and independent from lesson/failure watermark',async()=>{
  let query;const store=firestoreCourseStore({FIREBASE_PROJECT_ID:'synthetic'},'fake',async(url,opt)=>{query=JSON.parse(opt.body).structuredQuery;return Response.json([]);});
  await store.pending(8,'student');assert.equal(query.limit,2);assert.equal(query.where,undefined);
  assert.equal(query.orderBy[0].field.fieldPath,'__name__');assert.equal(query.startAt.before,false);
  assert.equal(query.startAt.values[0].referenceValue,'projects/synthetic/databases/(default)/documents/cc_daily_course_subscriptions/student');
});
test('deleted bound profile removes consent; an account without a profile can remain subscribed',async()=>{
  const f=fixture({profileId:'synthetic-profile'});f.deps.store.profileStillOwned=async()=>false;
  const result=await dispatchCourseLesson(f.deps);assert.equal(result.removed,1);assert.equal(f.record,null);assert.equal(f.sends,0);
  const g=fixture({profileId:''});g.deps.store.profileStillOwned=async()=>{throw Error('Must not check nonexistent binding');};
  assert.equal((await dispatchCourseLesson(g.deps)).accepted,1);
});
test('cursor create uses exists=false; deletion uses revision to preserve newer preference',async()=>{
  let request;const store=firestoreCourseStore({FIREBASE_PROJECT_ID:'synthetic'},'fake',async(url,opt)=>{request={url,opt};return Response.json({});});
  await store.advance('student');assert.ok(request.url.includes('currentDocument.exists=false'));
  await store.remove('student','r1');assert.ok(request.url.includes('currentDocument.updateTime=r1'));
});
test('kvCourseStore implements get, save, remove, cursor, advance and pending', async () => {
  const map = new Map();
  const mockKv = {
    async get(key, format) {
      const val = map.get(key);
      if (!val) return null;
      return format === 'json' ? JSON.parse(val) : val;
    },
    async put(key, value) {
      map.set(key, typeof value === 'string' ? value : JSON.stringify(value));
    },
    async delete(key) {
      map.delete(key);
    },
    async list({ prefix }) {
      const keys = [...map.keys()]
        .filter(k => k.startsWith(prefix))
        .map(name => ({ name }));
      return { keys };
    }
  };
  const store = kvCourseStore(mockKv);
  assert.equal(await store.get('student1'), null);
  assert.equal(await store.save('student1', { uid: 'student1', enabled: true, preferredHour: 7 }), true);
  const sub = await store.get('student1');
  assert.equal(sub.data.uid, 'student1');
  assert.equal(sub.data.preferredHour, 7);
  assert.equal(sub.revision, '1');

  // Pending listing
  const pending = await store.pending(8);
  assert.equal(pending.length, 1);
  assert.equal(pending[0].uid, 'student1');

  // Cursor & advance
  assert.equal(await store.cursor(), null);
  await store.advance('student1');
  const cur = await store.cursor();
  assert.equal(cur.after, 'student1');

  // Remove
  await store.remove('student1');
  assert.equal(await store.get('student1'), null);
});
