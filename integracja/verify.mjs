import assert from 'node:assert/strict';
import {handleSupportApi,recordVerifiedSupport} from './support-api.js';
import {handleSupportRoute} from './worker-routes.js';
const event={source:'bank',sourceEventId:'confirmed-event',supporterUid:'private-user',evidenceRef:'private-ref'};
let writes=0;
const env={CC_SUPPORT_DB:{prepare(){return {bind(){return this},run(){writes++;return {}},all(){return {results:[{public_name:'Secret Name',anonymous_consent:1,consent:0,source:'bank'},{public_name:'Other Secret',anonymous_consent:1,consent:0,source:'blik'}]}},first(){return null}}}}};
await assert.rejects(recordVerifiedSupport(env,event,{}));
await assert.rejects(recordVerifiedSupport(env,event,{verifySupportEvidence:async()=>({verified:false})}));
await assert.rejects(recordVerifiedSupport(env,event,{verifySupportEvidence:async()=>({verified:true,...event,supporterUid:'different-user',verifiedBy:'importer'})}));
assert.equal(writes,0);
await recordVerifiedSupport(env,event,{verifySupportEvidence:async()=>({verified:true,...event,verifiedBy:'confirmed importer'})});
assert.equal(writes,1);
const thanks=await handleSupportApi(new Request('https://polskieradio.cc/api/cc-support/thanks'),env,{});
const body=await thanks.json();
assert.deepEqual(body.items,[{text:'Dziękujemy anonimowym darczyńcom misji.'}]);
assert.ok(!JSON.stringify(body).includes('Secret'));
assert.ok(!JSON.stringify(body).includes('private-user'));
const session=await handleSupportApi(new Request('https://polskieradio.cc/api/cc-support/session'),env,{});
assert.equal(session.status,503);
const forbidden=await handleSupportApi(new Request('https://polskieradio.cc/api/cc-support/consent',{method:'PUT',headers:{Origin:'https://evil.example','Content-Type':'application/json'},body:'{}'}),env,{verifySession:async()=>({uid:'user'})});
assert.equal(forbidden.status,403);
const missingCsrf=await handleSupportApi(new Request('https://polskieradio.cc/api/cc-support/consent',{method:'PUT',headers:{Origin:'https://polskieradio.cc','Content-Type':'application/json'},body:'{}'}),env,{verifySession:async()=>({uid:'user'})});
assert.equal(missingCsrf.status,403);
for(const alias of ['wsparcie','misja','pomoc','darowizna','partnerzy','donate']) {
  const redirect=await handleSupportRoute(new Request('https://polskieradio.cc/'+alias+'?utm_source=test'),{});
  assert.equal(redirect.status,301);
  assert.equal(redirect.headers.get('Location'),'https://polskieradio.cc/wspieraj?utm_source=test');
}
console.log('PASS: evidence validation, anonymous privacy, deduplication, missing auth rejection, Origin/CSRF protection, redirects');
