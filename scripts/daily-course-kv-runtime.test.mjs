import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {Miniflare,Response as RuntimeResponse,convertV4MiniflareOptions} from 'miniflare';
import {mkdtemp} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';

test('workerd KV + SQLite: quota independence, pagination, atomic leases, tombstones and restart',async()=>{
  const pair=await crypto.subtle.generateKey({name:'RSASSA-PKCS1-v1_5',modulusLength:2048,publicExponent:new Uint8Array([1,0,1]),hash:'SHA-256'},true,['sign','verify']);
  const key=Buffer.from(await crypto.subtle.exportKey('pkcs8',pair.privateKey)).toString('base64');
  const pem='-----BEGIN '+'PRIVATE KEY-----\n'+key+'\n-----END '+'PRIVATE KEY-----';
  const bundled=await build({stdin:{contents:`
    import worker from './cloudflare-worker/lumina-push/src/index.js';
    import {kvCourseStore} from './cloudflare-worker/lumina-push/src/course-subscriptions.js';
    export {OwnerPushTestGuard} from './cloudflare-worker/lumina-push/src/owner-test-guard.js';
    export default {async fetch(request,env) {
      const p=new URL(request.url).pathname;
      if(p==='/tick'){await worker.scheduled({},env);return Response.json({ok:true});}
      if(p==='/store'){const b=await request.json();const s=kvCourseStore(env.COURSE_SUBSCRIPTIONS,env.OWNER_PUSH_TEST_GUARD);
        return Response.json(await s[b.method](...b.args));}
      if(p==='/seed'){const b=await request.json();await env.COURSE_SUBSCRIPTIONS.put(b.key,JSON.stringify(b.data));return Response.json({ok:true});}
      return worker.fetch(request,env);
    }};`,resolveDir:process.cwd()},bundle:true,write:false,format:'esm',platform:'browser',external:['cloudflare:workers']});
  let newest=9,firestore=0,sends=0,legacyMode=false;
  const persistence=await mkdtemp(path.join(tmpdir(),'cc-course-kv-'));
  const workerOptions={name:'course-kv-runtime',modules:true,script:bundled.outputFiles[0].text,compatibilityDate:'2026-09-13',
    kvNamespaces:['COURSE_SUBSCRIPTIONS'],
    durableObjects:{OWNER_PUSH_TEST_GUARD:{className:'OwnerPushTestGuard',useSQLite:true}},
    bindings:{COURSE_PUSH_ENABLED:'true',FIREBASE_PROJECT_ID:'synthetic',ALLOWED_ORIGIN:'https://polskieradio.cc',FIREBASE_WEB_API_KEY:'synthetic',
      FIREBASE_SERVICE_ACCOUNT_JSON:JSON.stringify({client_email:'synthetic@example.invalid',private_key:pem})},
    outboundService:async request=>{
      const url=new URL(request.url);
      if(url.hostname==='firestore.googleapis.com'){
        firestore++;
        if(!legacyMode)return new RuntimeResponse('',{status:429});
        const q=(await request.json()).structuredQuery;
        const encode=data=>Object.fromEntries(Object.entries(data).map(([k,v])=>[k,typeof v==='boolean'?{booleanValue:v}:typeof v==='number'?{integerValue:String(v)}:{stringValue:v}]));
        if(q.from[0].collectionId==='cc_daily_course_subscriptions')return RuntimeResponse.json(q.startAt?[]:[{document:{name:'projects/synthetic/databases/(default)/documents/cc_daily_course_subscriptions/old-student',fields:encode({uid:'old-student',enabled:true,preferredHour:7,lastLessonNumber:9,profileId:'',consentVersion:'daily-course-push-v1',consentedAt:'2026-10-09T00:00:00Z'})}}]);
        if(q.from[0].collectionId==='LuminaDeviceTokens')return RuntimeResponse.json([{document:{fields:encode({token:'synthetic-device'})}}]);
        throw Error('Unexpected legacy query');
      }
      if(url.hostname==='oauth2.googleapis.com')return RuntimeResponse.json({access_token:'synthetic'});
      if(url.hostname==='identitytoolkit.googleapis.com'){
        if(url.pathname.includes('/projects/')){const b=await request.json();return RuntimeResponse.json({users:[{localId:b.localId[0],email:'synthetic@example.invalid'}]});}
        return RuntimeResponse.json({users:[{localId:'student',email:'synthetic@example.invalid'}]});
      }
      if(url.hostname==='polskieradio.cc')return RuntimeResponse.json({version:1,lessons:[9,10].filter(n=>n<=newest).map(number=>({number,title:'Synthetic',availableAt:'2026-10-01T00:00:00Z',url:'https://polskieradio.cc/akademia/kurscodzienny/dzien-'+String(number).padStart(2,'0')}))});
      if(url.hostname==='fcm.googleapis.com'){sends++;return RuntimeResponse.json({name:'synthetic'});}
      throw Error('Unexpected synthetic provider');
    }};
  const options=convertV4MiniflareOptions({...workerOptions,resourcePersistencePath:persistence});
  let mf=new Miniflare(options);
  const call=async(method,...args)=>(await mf.dispatchFetch('https://synthetic.invalid/store',{method:'POST',body:JSON.stringify({method,args})})).json();
  const action=body=>mf.dispatchFetch('https://synthetic.invalid/v1/course/subscription',{method:'POST',headers:{origin:'https://polskieradio.cc',authorization:'Bearer synthetic','content-type':'application/json'},body:JSON.stringify(body)});
  const seed=(key,data)=>mf.dispatchFetch('https://synthetic.invalid/seed',{method:'POST',body:JSON.stringify({key,data})});
  try {
    const legacy={uid:'imported-student',enabled:true,preferredHour:7,lastLessonNumber:10,tokens:['synthetic-device']};
    assert.equal(await call('importLegacy','imported-student',legacy),true);
    assert.equal((await call('get','imported-student')).data.lastLessonNumber,10);
    assert.equal(await call('importLegacy','imported-student',{...legacy,lastLessonNumber:0}),false);
    await call('remove','imported-student');
    assert.equal(await call('importLegacy','imported-student',legacy),false,'backfill never overrides withdrawal');
    // An orphan discovery key must safely initialize to empty, not throw.
    await seed('account:'+'f'.repeat(64),'1');
    let r=await action({action:'subscribe',consent:true,preferredHour:20,fcmToken:'synthetic-device'});
    assert.equal(r.status,200);assert.equal((await r.json()).subscribed,true);
    let rec=await call('get','student');assert.equal(rec.data.preferredHour,20);
    const claims=await Promise.all([call('save','student',{leaseId:'one'},rec.revision),call('save','student',{leaseId:'two'},rec.revision)]);
    assert.equal(claims.filter(Boolean).length,1,'only one overlapping claim can succeed');
    rec=await call('get','student');assert.equal(await call('remove','student'),true);
    assert.equal(await call('save','student',{leaseUntil:0},rec.revision),false,'old completion cannot resurrect unsubscribe');
    // A lagging KV region can still return the record that was deleted.
    await seed('sub:student',{uid:'student',enabled:true,tokens:['synthetic-device'],lastLessonNumber:9});
    assert.equal(await call('get','student'),null,'tombstone wins over stale KV consent');
    await mf.dispose();mf=new Miniflare(options);
    assert.equal(await call('get','student'),null,'tombstone survives worker restart');
    assert.equal((await action({action:'subscribe',consent:true,preferredHour:7,fcmToken:'synthetic-device'})).status,200);
    assert.equal(await call('save','student',{leaseUntil:0},rec.revision),false,'old generation cannot modify re-enrollment');
    // More than one real KV page; also exercise empty/deleted records.
    for(let i=0;i<24;i++)await seed('sub:legacy-'+String(i).padStart(2,'0'),{uid:'legacy-'+String(i).padStart(2,'0'),enabled:true,lastLessonNumber:10,tokens:['synthetic-device']});
    const seen=new Set();let after='',pages=0;
    do {
      const pending=await call('pending',10,after);pending.forEach(row=>seen.add(row.uid));
      const oldCursor=await call('cursor');
      // Array properties are not JSON encoded: ask the actual cursor after a tick below.
      assert.ok(pending.length<=2);pages++;
      const kv=await mf.getKVNamespace('COURSE_SUBSCRIPTIONS');const listed=await kv.list({limit:2,cursor:after || undefined});
      after=listed.list_complete?'':listed.cursor;
      assert.equal(await call('advance',after,oldCursor?.revision),true);
    } while(after && pages<30);
    assert.ok(pages>=2);assert.equal(seen.size,25);
    assert.equal((await call('cursor')).after,'');
    newest=10;
    assert.equal((await mf.dispatchFetch('https://synthetic.invalid/tick')).status,200);
    assert.equal(sends,1,'student receives the next lesson exactly once');
    assert.equal((await mf.dispatchFetch('https://synthetic.invalid/tick')).status,200);
    assert.equal(sends,1,'second tick uses valid opaque cursors and does not repeat delivery');
    assert.equal((await action({action:'unsubscribe'})).status,200);
    assert.equal((await action({action:'status'})).status,200);
    assert.equal(await call('get','student'),null);
    assert.equal(firestore,0,'course never calls exhausted Firestore');
    assert.equal((await action({action:'subscribe',consent:true,fcmToken:'x'.repeat(513)})).status,400);
    await mf.dispose();
    legacyMode=true;
    workerOptions.bindings.COURSE_LEGACY_BACKFILL_ENABLED='true';
    mf=new Miniflare(convertV4MiniflareOptions({...workerOptions,resourcePersistencePath:persistence}));
    assert.equal((await mf.dispatchFetch('https://synthetic.invalid/tick')).status,200);
    assert.equal(sends,1,'import and delivery are separate bounded ticks');
    for(let i=0;i<5;i++)assert.equal((await mf.dispatchFetch('https://synthetic.invalid/tick')).status,200);
    assert.equal(sends,2,'pre-migration consent receives its missed lesson exactly once');
    const completedReads=firestore;
    await mf.dispatchFetch('https://synthetic.invalid/tick');
    assert.equal(firestore,completedReads,'completed migration performs no further Firestore reads');
    assert.equal((await call('get','old-student')).data.lastLessonNumber,10);
  } finally {await mf.dispose();}
});
