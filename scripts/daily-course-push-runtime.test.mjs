// Entirely synthetic, local workerd integration. Unexpected outbound I/O is blocked.
import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {Miniflare,convertV4MiniflareOptions,Response as RuntimeResponse} from 'miniflare';
import path from 'node:path';
test('workerd: account opt-in, manifest publication, scheduled send, revoke and fail-closed cleanup',async()=>{
  const pair=await crypto.subtle.generateKey({name:'RSASSA-PKCS1-v1_5',modulusLength:2048,publicExponent:new Uint8Array([1,0,1]),hash:'SHA-256'},true,['sign','verify']);
  const key=Buffer.from(await crypto.subtle.exportKey('pkcs8',pair.privateKey)).toString('base64');
  const pem='-----BEGIN '+'PRIVATE KEY-----\n'+key+'\n-----END '+'PRIVATE KEY-----';
  const bundled=await build({stdin:{contents:`import worker from './cloudflare-worker/lumina-push/src/index.js';
    export default {async fetch(request,env) {
      if(new URL(request.url).pathname==='/test-tick') {await worker.scheduled({},env);return Response.json({ok:true});}
      return worker.fetch(request,env);
    }};`,resolveDir:process.cwd()},bundle:true,write:false,format:'esm',platform:'browser'});
  const documents=new Map();let revision=0, sends=0, outbound=0, latest=8, account='active', failStage='';
  const fields=data=>Object.fromEntries(Object.entries(data).map(([k,v])=>[k,typeof v==='boolean'?{booleanValue:v}:typeof v==='number'?{integerValue:String(v)}:{stringValue:v}]));
  const project='projects/synthetic/databases/(default)/documents/';
  const response=data=>RuntimeResponse.json(data);
  const options={modules:true,script:bundled.outputFiles[0].text,compatibilityDate:'2026-09-13',
    bindings:{COURSE_PUSH_ENABLED:'true',COURSE_PUSH_PILOT_UID:'student',FIREBASE_PROJECT_ID:'synthetic',ALLOWED_ORIGIN:'https://polskieradio.cc',FIREBASE_WEB_API_KEY:'synthetic',
      FIREBASE_SERVICE_ACCOUNT_JSON:JSON.stringify({client_email:'synthetic@example.invalid',private_key:pem})},
    outboundService:async request=>{
      outbound++;const url=new URL(request.url);
      if ((failStage==='service_account_authorization' && url.hostname==='oauth2.googleapis.com') ||
          (failStage==='account_lookup' && url.hostname==='identitytoolkit.googleapis.com' && url.pathname.includes('/projects/')) ||
          (failStage==='device_registry' && url.hostname==='firestore.googleapis.com') ||
          (failStage==='lesson_manifest' && url.hostname==='polskieradio.cc'))
        return new RuntimeResponse('synthetic-private-provider-detail',{status:403});
      if(failStage==='authentication' && url.hostname==='identitytoolkit.googleapis.com')
        return new RuntimeResponse('synthetic-private-auth-detail',{status:200});
      if(url.hostname==='oauth2.googleapis.com') {
        const assertion=new URLSearchParams(await request.text()).get('assertion');
        const scope=JSON.parse(Buffer.from(assertion.split('.')[1],'base64url').toString()).scope;
        assert.ok(scope.includes('auth/datastore'));return response({access_token:'synthetic'});
      }
      if(url.hostname==='identitytoolkit.googleapis.com') {
        if(url.pathname.includes('/projects/')) {
          assert.deepEqual(await request.json(),{localId:['student']});
          if(account==='error')return new RuntimeResponse('',{status:403});
          return response({users:account==='deleted'?[]:[{localId:'student',email:'student@example.invalid'}]});
        }
        return response({users:[{localId:'student',email:'student@example.invalid'}]});
      }
      if(url.hostname==='polskieradio.cc' && url.pathname==='/data/daily-course-push.json')return response({version:1,lessons:[8,9].filter(n=>n<=latest).map(number=>({number,title:'Synthetic lesson',availableAt:'2026-10-01T00:00:00Z',url:`https://polskieradio.cc/akademia/kurscodzienny/dzien-${String(number).padStart(2,'0')}`}))});
      if(url.hostname==='fcm.googleapis.com') {
        const payload=await request.json();assert.equal(payload.message.token,'synthetic-device');
        assert.equal(payload.message.webpush.fcm_options.link,'https://polskieradio.cc/akademia/kurscodzienny/dzien-09');
        sends++;return response({name:'synthetic-message'});
      }
      if(url.hostname==='firestore.googleapis.com') {
        if(url.pathname.endsWith(':runQuery')) {
          const q=(await request.json()).structuredQuery;const collection=q.from[0].collectionId;
          if(collection==='LuminaDeviceTokens')return response([{document:{fields:fields({token:'synthetic-device'})}}]);
          if(collection==='lumina_profiles')return response([]);
          assert.equal(collection,'cc_daily_course_subscriptions');assert.equal(q.limit,2);
          const after=q.startAt?.values[0].referenceValue.split('/').pop() || '';
          return response([...documents].filter(([id])=>id.startsWith(collection+'/') && id.split('/').pop()>after).sort(([a],[b])=>a.localeCompare(b)).slice(0,2).map(([id,d])=>({document:{name:project+id,...d}})));
        }
        const id=decodeURIComponent(url.pathname.split('/documents/')[1]);const existing=documents.get(id);
        const precondition=url.searchParams.get('currentDocument.updateTime');
        if(precondition && existing?.updateTime!==precondition)return new RuntimeResponse('',{status:412});
        if(request.method==='DELETE'){documents.delete(id);return new RuntimeResponse(null,{status:204});}
        if(request.method==='PATCH') {
          if(url.searchParams.get('currentDocument.exists')==='false' && existing)return new RuntimeResponse('',{status:409});
          const body=await request.json();const d={fields:{...existing?.fields,...body.fields},updateTime:'r'+(++revision)};documents.set(id,d);return response(d);
        }
        return existing?response(existing):new RuntimeResponse('',{status:404});
      }
      throw Error('Unexpected outbound request blocked: '+url.hostname);
    }};
  const mf=new Miniflare(convertV4MiniflareOptions?convertV4MiniflareOptions(options):options);
  const command=action=>mf.dispatchFetch('https://runtime.invalid/v1/course/subscription',{method:'POST',headers:{origin:'https://polskieradio.cc',authorization:'Bearer synthetic'},body:JSON.stringify({action,...(action==='subscribe'?{consent:true}:{})})});
  const tick=()=>mf.dispatchFetch('https://runtime.invalid/test-tick');
  try {
    const preflight=await mf.dispatchFetch('https://runtime.invalid/v1/course/preflight',{method:'POST',headers:{origin:'https://polskieradio.cc',authorization:'Bearer synthetic'}});
    assert.equal(preflight.status,200);
    assert.deepEqual(await preflight.json(),{accountRead:true,registeredDeviceCount:1,lessonNumber:8,automaticDispatchEnabled:true});
    assert.equal(sends,0);assert.equal(documents.size,0,'Preflight must not write');
    for(const stage of ['authentication','service_account_authorization','account_lookup','device_registry','lesson_manifest']) {
      failStage=stage;
      const failed=await mf.dispatchFetch('https://runtime.invalid/v1/course/preflight',{method:'POST',headers:{origin:'https://polskieradio.cc',authorization:'Bearer synthetic'}});
      assert.equal(failed.status,502);assert.equal(failed.headers.get('cache-control'),'no-store');
      const diagnostic=await failed.json();
      assert.deepEqual(Object.keys(diagnostic).sort(),stage==='authentication'?['error']:['error','stage']);
      assert.equal(diagnostic.stage,stage==='authentication'?undefined:stage);
      assert.equal(JSON.stringify(diagnostic).includes('synthetic'),false,'No provider details, identifiers or token values');
      assert.equal(sends,0);assert.equal(documents.size,0,'Failure diagnostics must not write or send');
    }
    failStage='';
    assert.equal((await command('subscribe')).status,200);
    assert.equal(documents.get('cc_daily_course_subscriptions/student').fields.lastLessonNumber.integerValue,'8');
    latest=9;const before=outbound;assert.equal((await tick()).status,200);
    assert.ok(outbound-before<=35,'Bounded subrequests');assert.equal(sends,1);
    await tick();await tick();assert.equal(sends,1);
    assert.equal((await command('unsubscribe')).status,200);assert.equal(documents.has('cc_daily_course_subscriptions/student'),false);
    await command('subscribe');account='error';await tick();await tick();assert.equal(documents.has('cc_daily_course_subscriptions/student'),true);
    account='deleted';await tick();await tick();assert.equal(documents.has('cc_daily_course_subscriptions/student'),false);
    assert.equal(sends,1);
  } finally {await mf.dispose();}
});
