import test from 'node:test';
import assert from 'node:assert/strict';
import {Window} from 'happy-dom';
import {readWithDeadline,chatReadError} from '../components/lumi-chat-readiness.js';
import {mountFamilyView} from '../components/lumi-family-view.js';
test('bounded read fails honestly and does not retry or invent an empty result',async()=>{
 let reads=0;
 await assert.rejects(readWithDeadline(()=>{reads++;return new Promise(()=>{});},5),e=>e.code==='chat/read-timeout');
 assert.equal(reads,1);assert.match(chatReadError({code:'firestore/resource-exhausted'}),/nie oznacza pustej historii/);
 assert.match(chatReadError({code:'chat/read-timeout'}),/Historia nie została wczytana/);
});
test('failed family membership lookup shows the quota problem, not no invitations',async()=>{
 const w=new Window(),root=w.document.createElement('div');w.document.body.append(root);
 const view=mountFamilyView({element:root,userUid:'fixture',client:{listMemberships:async()=>{throw {code:'resource-exhausted'};}}});
 try{await new Promise(r=>setTimeout(r,0));assert.match(root.textContent,/Limit bazy jest wyczerpany/);
 assert.doesNotMatch(root.textContent,/Nie masz jeszcze zaproszenia/);assert.equal([...root.querySelectorAll('button')].some(b=>b.textContent==='Odśwież'),true);
 }finally{view.dispose();await w.happyDOM.close();}
});
test('optional failed member names do not prevent the family composer opening',async()=>{
 const w=new Window(),root=w.document.createElement('div');w.document.body.append(root);
 const view=mountFamilyView({element:root,userUid:'fixture',nameForUid:async()=>{throw Error('offline');},client:{
 listMemberships:async()=>[],getRoom:async()=>({name:'TEST',isGuardian:false}),listMembers:async()=>[{uid:'fixture'}],watchMessages:()=>()=>{}}});
 try{await new Promise(r=>setTimeout(r,0));await view.room('fixture-room');assert.ok(root.querySelector('textarea'));
 assert.match(root.textContent,/Członek rodziny/);
 }finally{view.dispose();await w.happyDOM.close();}
});
