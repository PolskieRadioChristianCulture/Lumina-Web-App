import test from 'node:test';
import assert from 'node:assert/strict';
import {createAgentClient} from '../components/lumi-agent-client.js';
const ID='12345678-1234-4234-9234-123456789abc';
function fixture() {
  const auth={currentUser:{uid:'owner',email:'nazirczarkes@gmail.com',emailVerified:true,isAnonymous:false}};
  let stored=null,fail=false,change;const writes=[];
  const sdk={onAuthStateChanged:(_,fn)=>{change=fn;return()=>{};},doc:(_, ...p)=>p.join('/'),serverTimestamp:()=> 'server-time',
    runTransaction:async(_,fn)=>{if(fail)throw Error('offline');return fn({get:async()=>({exists:()=>!!stored,data:()=>stored}),set:(r,d)=>{stored=d;writes.push({r,d});}});},
    collection:(_, ...p)=>p.join('/'),orderBy:(...x)=>x,limit:x=>x,query:(...x)=>x,getDocsFromServer:async()=>({docs:[]}),updateDoc:async()=>{}};
  return {auth,sdk,writes,client:createAgentClient({auth,db:{},sdk}),offline:()=>{fail=true;},change:()=>change()};
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
