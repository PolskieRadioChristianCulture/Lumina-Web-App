import test from 'node:test';
import assert from 'node:assert/strict';
import {ownerPushTest, ownerTestWindow} from './owner-push-test.js';

function fixture() {
  let consumed=false, sends=0, privileged=0;
  const env={OWNER_PUSH_TEST_ENABLED:'true',COURSE_PUSH_PILOT_UID:'synthetic-owner',
    OWNER_PUSH_TEST_START_AT:String(Date.now()-1000),OWNER_PUSH_TEST_EXPIRES_AT:String(Date.now()+60_000),
    OWNER_PUSH_TEST_RUN_ID:'11111111-1111-4111-8111-111111111111',
    OWNER_PUSH_TEST_GUARD:{getByName:()=>({claim:async()=>{if(consumed)return false;consumed=true;return true;}})}};
  const service={accountState:async()=> 'active',tokens:async()=>['synthetic-device'],latest:async()=>({number:8,url:'https://polskieradio.cc/akademia/kurscodzienny/dzien-08'}),sendTest:async()=>{sends++;return true;}};
  const deps={verify:async()=> 'synthetic-owner',service:async()=>{privileged++;return service;}};
  const request=body=>new Request('https://synthetic.invalid/test',{method:'POST',...(body?{body}: {})});
  return {env,deps,service,request,sends:()=>sends,privileged:()=>privileged};
}
test('defaults disabled; no authentication or privileged access',async()=>{
  const f=fixture();delete f.env.OWNER_PUSH_TEST_ENABLED;
  assert.equal((await ownerPushTest(f.request(),f.env,f.deps)).status,503);assert.equal(f.privileged(),0);
});
test('window requires valid bounded dates, UUID, UID and durable binding',()=>{
  const f=fixture();assert.equal(ownerTestWindow(f.env),true);
  for(const [key,value] of [['OWNER_PUSH_TEST_EXPIRES_AT','NaN'],['OWNER_PUSH_TEST_START_AT',String(Date.now()+3000)],['OWNER_PUSH_TEST_EXPIRES_AT',String(Date.now()+900_001)],['OWNER_PUSH_TEST_RUN_ID','client-id'],['COURSE_PUSH_PILOT_UID',''],['OWNER_PUSH_TEST_GUARD',null]])
    assert.equal(ownerTestWindow({...f.env,[key]:value}),false,key);
});
test('body cannot choose recipient, token or content',async()=>{
  const f=fixture();assert.equal((await ownerPushTest(f.request('{"uid":"other"}'),f.env,f.deps)).status,400);assert.equal(f.privileged(),0);
});
test('unauthenticated and other accounts rejected before service access',async()=>{
  for(const uid of [null,'other']) {const f=fixture();f.deps.verify=async()=>uid;assert.equal((await ownerPushTest(f.request(),f.env,f.deps)).status,uid?403:401);assert.equal(f.privileged(),0);}
});
test('disabled account, no devices and unpublished lesson never send',async()=>{
  for(const [key,value] of [['accountState','disabled'],['tokens',[]],['latest',null]]) {const f=fixture();f.service[key]=async()=>value;assert.equal((await ownerPushTest(f.request(),f.env,f.deps)).status,409);assert.equal(f.sends(),0);}
});
test('deduplicates devices; repeat and concurrent requests cannot repeat sends',async()=>{
  const f=fixture();f.service.tokens=async()=>['synthetic-device','synthetic-device'];
  const results=await Promise.all(Array.from({length:12},()=>ownerPushTest(f.request(),f.env,f.deps)));
  assert.equal(results.filter(r=>r.status===200).length,1);assert.equal(f.sends(),1);
  assert.equal(results.find(r=>r.status===200).body.physicalDeliveryConfirmed,false);
});
test('ambiguous delivery failure consumes attempt; no automatic retry',async()=>{
  const f=fixture();f.service.sendTest=async()=>{throw Error('private-provider-detail');};
  const result=await ownerPushTest(f.request(),f.env,f.deps);assert.equal(result.body.acceptedByFcm,0);assert.equal(result.body.testConsumed,true);
  assert.equal((await ownerPushTest(f.request(),f.env,f.deps)).status,409);assert.equal(JSON.stringify(result).includes('private-provider-detail'),false);
});
test('durable guard failure cannot fall back to in-memory sending',async()=>{
  const f=fixture();f.env.OWNER_PUSH_TEST_GUARD.getByName=()=>({claim:async()=>{throw Error('storage unavailable');}});
  await assert.rejects(ownerPushTest(f.request(),f.env,f.deps));assert.equal(f.sends(),0);
});
test('expiration during checks prevents sends',async()=>{
  const f=fixture();f.service.latest=async()=>{f.env.OWNER_PUSH_TEST_EXPIRES_AT=String(Date.now()-1);return {number:8};};
  assert.equal((await ownerPushTest(f.request(),f.env,f.deps)).status,503);assert.equal(f.sends(),0);
});
