import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { Window } from 'happy-dom';
import { createPresenceChannel } from '../js/lumina-presence-channel.js';

test('three consumers share one presence read; cache is unknown, time expires locally and last cleanup stops', () => {
 const doc = new EventTarget(); doc.visibilityState = 'visible';
 let reads=0, stops=0, receive, fail, tick, time=200000;
 const values=[];
 const subscribe=createPresenceChannel({document:doc,now:()=>time,listen:(cb,err)=>{reads++;receive=cb;fail=err;return()=>stops++;},setInterval:cb=>{tick=cb;return 1;},clearInterval:()=>{}});
 const a=subscribe((list,meta)=>values.push({list,meta})),b=subscribe(()=>{}),c=subscribe(()=>{});
 assert.equal(reads,1);
 const snapshot=fromCache=>({metadata:{fromCache},forEach:cb=>cb({id:'A',metadata:{hasPendingWrites:false},data:()=>({uid:'A',isLoggedIn:true,lastActiveMillis:199000})})});
 receive(snapshot(true));assert.equal(values.at(-1).list.length,0);
 receive(snapshot(false));assert.equal(values.at(-1).list.length,1);
 time+=91000;tick();assert.equal(values.at(-1).list.length,0);assert.equal(reads,1);
 fail({code:'resource-exhausted'});assert.equal(values.at(-1).meta.available,false);
 a();b();assert.equal(stops,0);c();c();assert.equal(stops,1);
});

test('hidden page detaches presence; late callbacks cannot mark online; resuming creates only one read',()=>{
 const doc=new EventTarget();doc.visibilityState='visible';let receive,reads=0,stops=0;const values=[];
 const sub=createPresenceChannel({document:doc,now:()=>200000,listen:cb=>{reads++;receive=cb;return()=>stops++;},setInterval:()=>1,clearInterval:()=>{}});
 const stop=sub((_list,meta)=>values.push(meta.available));const old=receive;
 doc.visibilityState='hidden';doc.dispatchEvent(new Event('visibilitychange'));assert.equal(stops,1);
 old({metadata:{fromCache:false},forEach:()=>{}});assert.equal(values.at(-1),false);
 doc.visibilityState='visible';doc.dispatchEvent(new Event('visibilitychange'));assert.equal(reads,2);
 stop();
});

test('heartbeat writes at most once per minute, pauses hidden/anonymous and backs off on quota',async()=>{
 const source=fs.readFileSync('lumina-db.js','utf8');let ping,timer,writes=0,time=1000;
 const doc=new EventTarget();doc.visibilityState='visible';
 const context={db:{},currentUserState:{uid:'MomExactCase',isAnonymous:false},currentProfileState:{},document:doc,
   window:{LuminaDB:{},location:{pathname:'/mess'}},sessionStorage:{getItem:()=> 'session'},Math,
   Date:{now:()=>time},doc:()=>({}),serverTimestamp:()=> 'server',setDoc:async()=>{writes++;},setInterval:cb=>{timer=cb;return 1;},onAuthChange:cb=>{ping=cb;}};
 const code=source.slice(source.indexOf('let presenceHeartbeatTimer'),source.indexOf('let sharedPresenceChannel')).replace('export function','function');
 vm.runInNewContext(code+';startPresenceHeartbeat();',context);await Promise.resolve();assert.equal(writes,1);
 await ping();await timer();assert.equal(writes,1);
 time+=60000;doc.visibilityState='hidden';await timer();assert.equal(writes,1);
 doc.visibilityState='visible';context.setDoc=async()=>{writes++;throw {code:'resource-exhausted'};};await timer();assert.equal(writes,2);
 time+=60000;await timer();assert.equal(writes,2);
 time+=300000;context.currentUserState.isAnonymous=true;await timer();assert.equal(writes,2);
});

test('repeated directory renders share the public fallback, skip it with SDK data; failure also backs off',async()=>{
 const source=fs.readFileSync('lumina.html','utf8');const a=source.indexOf('async function fetchCommunityUsersDirectory()');const b=source.indexOf('// Live Realtime sync',a);
 const w=new Window();let reads=0;
 w.fetch=async()=>{reads++;return {ok:true,json:async()=>({documents:[]})};};
 w.DEFAULT_COMMUNITY_PROFILES=[];w.eval(source.slice(a,b)+';window.readDirectory=fetchCommunityUsersDirectory;');
 await Promise.all([w.readDirectory(),w.readDirectory(),w.readDirectory()]);assert.equal(reads,1);
 w.cloudProfilesCache=[];await w.readDirectory();assert.equal(reads,1);
 w.eval("window.cloudProfilesCache=undefined;window._luminaPublicDirectoryRest=undefined;");w.fetch=async()=>{reads++;throw Error('quota');};
 await w.readDirectory();await w.readDirectory();assert.equal(reads,2);w.close();
});

test('mother receives the child body in canonical history; empty legacy sources cannot erase it; quota does not emit empty',()=>{
 const source=fs.readFileSync('lumina-db.js','utf8');const a=source.indexOf('export function subscribeToDirectMessages('),b=source.indexOf('\nexport ',a+8);
 const callbacks=[],output=[],errors=[];const user={uid:'MotherExactCase',isAnonymous:false};
 const context={db:{},currentUserState:user,auth:{currentUser:user},getChatId:(a,b)=>[a,b].sort().join('_'),
  localStorage:{removeItem:()=>{}},activeDirectChatListeners:new Map(),activeDirectChatMessages:new Map(),
  collection:(_db,path)=>path,where:(...x)=>x,orderBy:(...x)=>x,limit:x=>x,query:(...x)=>x,
  onSnapshot:(q,options,cb,err)=>{callbacks.push({q,cb,err});return()=>{};},onAuthChange:()=>()=>{},
  document:{addEventListener:()=>{},removeEventListener:()=>{}},window:{dispatchEvent:()=>{}},CustomEvent:function(){},console,
  getDirectMessageKey:m=>m.id,getDirectMessageTime:m=>m.createdAt};
 const fn=vm.runInNewContext('('+source.slice(a,b).replace('export function','function')+')',context);
 fn('saved-family-room',m=>output.push(m),e=>errors.push(e));
 assert.equal(callbacks[0].q[1][2],'MotherExactCase');assert.equal(callbacks[0].q[2][2],'saved-family-room');
 callbacks[0].cb({forEach:cb=>cb({id:'child-message',metadata:{},data:()=>({chatId:'saved-family-room',senderAuthUid:'ChildExactCase',text:'Syn do mamy',createdAt:1})})});
 callbacks[1].cb({forEach:()=>{}});callbacks[2].cb({forEach:()=>{}});
 assert.equal(output.at(-1)[0].text,'Syn do mamy');callbacks[0].err({code:'resource-exhausted'});
 assert.equal(errors.length,1);assert.equal(output.at(-1)[0].text,'Syn do mamy');
});
