import {test,after} from 'node:test';
import assert from 'node:assert/strict';
import {initializeApp,deleteApp} from 'firebase/app';
import * as sdk from 'firebase/firestore';
assert.equal(process.env.FIRESTORE_EMULATOR_HOST,'127.0.0.1:8331');
const apps=[],dbs=[],ID='12345678-1234-4234-9234-123456789abc';
function ctx(uid,extra={}) {
  const app=initializeApp({projectId:'demo-lumi-agent',apiKey:'demo-only'},'agent'+apps.length);
  const db=sdk.getFirestore(app);sdk.connectFirestoreEmulator(db,'127.0.0.1',8331,{mockUserToken:{sub:uid,user_id:uid,
    email:'nazirczarkes@gmail.com',email_verified:true,ccMissionControl:true,firebase:{sign_in_provider:'google.com'},...extra}});
  apps.push(app);dbs.push(db);return db;
}
const ref=(db,uid='owner',id=ID)=>sdk.doc(db,'lumi_agent_commands',uid,'items',id);
const body=()=>({ownerUid:'owner',command:'TEST dyspozycji',createdAt:sdk.serverTimestamp(),checkAt:sdk.serverTimestamp(),status:'queued',needsSync:true});
const denied=p=>assert.rejects(p,e=>e.code==='permission-denied');
test('unauthenticated direct request cannot retrieve the private queue',async()=>{
  const r=await fetch(`http://127.0.0.1:8331/v1/projects/demo-lumi-agent/databases/(default)/documents/lumi_agent_commands/owner/items/${ID}`);
  assert.equal(r.status,403);
});
after(async()=>{await Promise.all(dbs.map(d=>sdk.terminate(d)));await Promise.all(apps.map(a=>deleteApp(a)));});
test('owner creates immutable queue; cannot forge receipt, rewrite text, delete or query without limit',async()=>{
  const db=ctx('owner');await sdk.setDoc(ref(db),body());assert.equal((await sdk.getDocFromServer(ref(db))).data().status,'queued');
  for(const change of [{status:'accepted'},{requestId:'MSG-fake'},{reply:{text:'fake'}},{command:'Changed'},{ownerUid:'other'},{createdAt:sdk.serverTimestamp()}]) await denied(sdk.updateDoc(ref(db),change));
  await denied(sdk.deleteDoc(ref(db)));
  await sdk.updateDoc(ref(db),{needsSync:true,checkAt:sdk.serverTimestamp()});
  const col=sdk.collection(db,'lumi_agent_commands','owner','items');
  assert.equal((await sdk.getDocsFromServer(sdk.query(col,sdk.orderBy('createdAt','desc'),sdk.limit(20)))).size,1);
  await denied(sdk.getDocsFromServer(col));
  await denied(sdk.getDocsFromServer(sdk.query(col,sdk.limit(21))));
});
test('other accounts, other admins, missing claim, unverified and anonymous cannot read or write',async()=>{
  for(const extra of [{email:'other@example.test'},{email:'other@example.test',admin:true},{ccMissionControl:false},{email_verified:false},{firebase:{sign_in_provider:'anonymous'}}]){
    const db=ctx('other',extra);await denied(sdk.getDocFromServer(ref(db)));await denied(sdk.setDoc(ref(db,'other'),{...body(),ownerUid:'other'}));
  }
  const owner=ctx('owner');await denied(sdk.setDoc(ref(owner,'other'),{...body(),ownerUid:'other'}));
});
test('strict create schema rejects forged ACK, invalid ids, missing fields, wrong types, timestamps and oversized text',async()=>{
  const db=ctx('owner');let i=0;
  for(const change of [{status:'accepted'},{requestId:'fake'},{reply:{text:'fake'}},{command:''},{command:2},{command:'x'.repeat(4001)},{ownerUid:'other'},{createdAt:new Date(0)},{needsSync:false}]){
    const id=`12345678-1234-4234-9234-${String(++i).padStart(12,'0')}`;await denied(sdk.setDoc(ref(db,'owner',id),{...body(),...change}));
  }
  const d=body();delete d.command;await denied(sdk.setDoc(ref(db,'owner','12345678-1234-4234-9234-000000000099'),d));
  await denied(sdk.setDoc(ref(db,'owner','invalid-id'),body()));
});
