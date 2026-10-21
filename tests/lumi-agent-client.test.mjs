import test from 'node:test';
import assert from 'node:assert/strict';
import {createAgentClient} from '../components/lumi-agent-client.js';
const ID='12345678-1234-4234-9234-123456789abc';
function fixture() {
  const auth={currentUser:{uid:'owner',email:'nazirczarkes@gmail.com',emailVerified:true,isAnonymous:false}};
  let stored=null,fail=false,change,stops=0,reads=0,refreshes=0;const writes=[];
  const sdk={onAuthStateChanged:(_,fn)=>{change=fn;return()=>{stops++;};},doc:(_, ...p)=>p.join('/'),serverTimestamp:()=> 'server-time',
    runTransaction:async(_,fn)=>{if(fail)throw Error('offline');return fn({get:async()=>({exists:()=>!!stored,data:()=>stored}),set:(r,d)=>{stored=d;writes.push({r,d});}});},
    collection:(_, ...p)=>p.join('/'),orderBy:(...x)=>x,limit:x=>x,query:(...x)=>x,getDocsFromServer:async()=>{reads++;return {docs:[]};},updateDoc:async()=>{refreshes++;}};
  return {auth,sdk,writes,client:createAgentClient({auth,db:{},sdk}),offline:()=>{fail=true;},change:()=>change(),counts:()=>({stops,reads,refreshes})};
}
test('owner-only client uses same UUID exactly once and never reports mailbox acceptance from queue write',async()=>{
  const f=fixture();assert.deepEqual(await f.client.send(ID,'TEST'),{status:'queued',id:ID});await f.client.send(ID,'TEST');
  assert.equal(f.writes.length,1);assert.equal(f.writes[0].r,`lumi_agent_commands/owner/items/${ID}`);
  await assert.rejects(f.client.send(ID,'Changed'),/id-conflict/);f.client.dispose();
});
test('anonymous, other identity, byte limit, bad id and failed database do not fabricate success',async()=>{
  for(const change of [{isAnonymous:true},{emailVerified:false},{email:'other@example.test'}]){const f=fixture();Object.assign(f.auth.currentUser,change);await assert.rejects(f.client.send(ID,'TEST'),/owner-required/);assert.equal(f.writes.length,0);}
  const f=fixture();await assert.rejects(f.client.send(ID,'ą'.repeat(2001)),/invalid-command/);await assert.rejects(f.client.send('bad','TEST'),/invalid-id/);f.offline();await assert.rejects(f.client.send(ID,'TEST'),/offline/);
});

test('disposed client cannot issue another send, read or refresh while the account is still signed in',async()=>{
  const f=fixture();f.client.dispose();
  await assert.rejects(f.client.send(ID,'TEST'),/disposed|session-changed/);
  await assert.rejects(f.client.list(),/disposed|session-changed/);
  await assert.rejects(f.client.refresh(ID),/disposed|session-changed/);
  assert.equal(f.writes.length,0);
  assert.deepEqual(f.counts(),{stops:1,reads:0,refreshes:0});
});

test('dispose is idempotent and a separate new client remains usable',async()=>{
  const f=fixture();f.client.dispose();f.client.dispose();
  assert.equal(f.counts().stops,1);
  const next=createAgentClient({auth:f.auth,db:{},sdk:f.sdk});
  assert.deepEqual(await next.send(ID,'NEW SESSION'),{status:'queued',id:ID});
  next.dispose();
});

test('dispose during transaction read blocks the later write and success report',async()=>{
  const f=fixture();let release;const gate=new Promise(resolve=>{release=resolve;});
  f.sdk.runTransaction=async(_,callback)=>callback({get:async()=>{await gate;return {exists:()=>false};},set:()=>{f.writes.push('unexpected');}});
  const sent=f.client.send(ID,'TEST');
  f.client.dispose();release();
  await assert.rejects(sent,/disposed|session-changed/);
  assert.equal(f.writes.length,0);
});
