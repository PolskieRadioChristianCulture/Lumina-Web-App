import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {Window} from 'happy-dom';
const source=await readFile('lumina-db.js','utf8');

test('logout clears private history and read markers without deleting unrelated preferences',async()=>{
  const a=source.indexOf('export async function logoutUser('),b=source.indexOf('// Global window exposure',a);
  const storage=new Map([['lumina_chat_room','private'],['lumina_chat_read_room','123'],['theme','light']]);
  const ctx={auth:{},signOut:async()=>{},currentUserState:{uid:'UID_A'},currentProfileState:{uid:'UID_A'},
    localStorage:{get length(){return storage.size;},key:i=>[...storage.keys()][i],removeItem:k=>storage.delete(k)},
    sessionStorage:{length:0},document:{body:{classList:{remove:()=>{}}},getElementById:()=>null},console:{error:()=>{}}};
  const logout=vm.runInNewContext('('+source.slice(a,b).replace('export async function','async function').trim()+'\n)',ctx);
  await logout();assert.equal(storage.size,1);assert.equal(storage.get('theme'),'light');assert.equal(ctx.currentUserState,null);
});

test('private history cannot be restored before login or rendered after account switch',()=>{
  const a=source.indexOf('export function subscribeToDirectMessages('),b=source.indexOf('export function subscribeToIncomingMessageRequests(',a);
  const streams=[],updates=[];let reads=0,writes=0;
  const ctx={db:{},currentUserState:null,auth:{currentUser:null},onAuthChange:()=>()=>{},
    localStorage:{getItem:()=>{reads++;return '[{"text":"private cached text"}]';},setItem:()=>writes++,removeItem:()=>{}},
    activeDirectChatListeners:new Map(),collection:(_db,path)=>({path}),query:(ref,...filters)=>({ref,filters}),
    where:(...args)=>args,orderBy:(...args)=>args,limit:n=>n,getChatId:(a,b)=>[a,b].sort().join('_'),
    getDirectMessageKey:m=>m.id,getDirectMessageTime:()=>0,console:{warn:()=>{}},
    onSnapshot:(q,opts,cb)=>{streams.push({q,cb});return ()=>{};}};
  const subscribe=vm.runInNewContext('('+source.slice(a,b).replace('export function','function').trim()+'\n)',ctx);
  subscribe('private-room',m=>updates.push(m));assert.equal(reads,0);assert.equal(updates.length,0);
  ctx.currentUserState={uid:'UID_A'};ctx.auth.currentUser={uid:'UID_B'};
  subscribe('private-room',m=>updates.push(m));assert.equal(streams.length,0,'stale profile cannot open another session');
  ctx.auth.currentUser={uid:'UID_A'};const stop=subscribe('private-room',m=>updates.push(m));
  assert.deepEqual(Array.from(streams[0].q.filters[2]),['timestamp','desc']);
  streams[0].cb({forEach:cb=>cb({id:'one',data:()=>({text:'synthetic'}),metadata:{hasPendingWrites:false}})});
  assert.equal(updates.length,1);assert.equal(reads+writes,0,'private snapshots never persist plaintext');
  ctx.auth.currentUser={uid:'UID_B'};streams[0].cb({forEach:()=>{}});assert.equal(updates.length,1);stop();
});

test('receiver acceptance commits consent and conversation together, preserving existing identities',async()=>{
  const a=source.indexOf('export async function acceptMessageRequest('),b=source.indexOf('export async function declineMessageRequest(',a);
  for(const rejected of [false,true]) {
    const writes=[];let committed=false;
    const request={chatId:'room',senderAuthUid:'UID_A',receiverAuthUid:'UID_B',status:'pending'};
    const ctx={db:{},currentUserState:{uid:'UID_B'},doc:(_db,path,id)=>({path,id}),
      getDoc:async ref=>({exists:()=>true,data:()=>ref.path==='lumina_message_requests'?request:{participants:['UID_A','UID_B']}}),
      writeBatch:()=>({set:(...args)=>writes.push(['set',...args]),update:(...args)=>writes.push(['update',...args]),
        commit:async()=>{if(rejected)throw Error('synthetic rejection');committed=true;}}),serverTimestamp:()=>0,console:{warn:()=>{}}};
    const accept=vm.runInNewContext('('+source.slice(a,b).replace('export async function','async function').trim()+')',ctx);
    assert.equal(!!await accept('room'),!rejected);assert.equal(committed,!rejected);
    assert.equal(writes.length,2);assert.equal('participants' in writes[0][2],false);
  }
});

test('messenger keyboard cycles focus, closes on Escape and restores opener',async()=>{
  const w=new Window();w.document.write('<button id="opener">Rozmowy</button><div id="directMessagesModal"><button class="modal-close-btn">Zamknij</button><input></div>');
  const modal=w.document.getElementById('directMessagesModal'),opener=w.document.getElementById('opener');
  modal.querySelectorAll('button,input').forEach(el=>el.getClientRects=()=>[{}]);
  const code=await readFile('js/lumina-chat-accessibility.js','utf8');
  w.eval(code.replace('export function enhanceChatDialog','function enhanceChatDialog'));
  modal.querySelector('button').onclick=()=>modal.classList.remove('open');
  opener.focus();modal.classList.add('open');await new Promise(r=>setTimeout(r,0));
  assert.equal(modal.getAttribute('role'),'dialog');assert.equal(w.document.activeElement,modal.querySelector('button'));
  modal.querySelector('input').focus();w.document.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Tab',bubbles:true,cancelable:true}));
  assert.equal(w.document.activeElement,modal.querySelector('button'));
  w.document.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Tab',shiftKey:true,bubbles:true,cancelable:true}));
  assert.equal(w.document.activeElement,modal.querySelector('input'));
  w.document.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));await new Promise(r=>setTimeout(r,0));
  assert.equal(modal.classList.contains('open'),false);assert.equal(w.document.activeElement,opener);w.close();
});
const start=source.indexOf('export async function sendDirectMessageToCloud(');
const end=source.indexOf('// ── Oznaczanie wiadomości prywatnych',start);
assert.ok(start>=0 && end>start);
const fn=source.slice(start,end).replace('export async function','async function');
test('notification presentation never increments the authoritative unread-room counter',()=>{
  const a=source.indexOf('export function triggerLuminaPushNotification('),b=source.indexOf('let hasStartedRealtimeNotifs',a);
  const ctx={playNotificationChime:()=>{},navigator:{},window:{},document:{visibilityState:'visible'},
    showInAppChatBanner:()=>{},showSystemDrawerNotification:()=>{},localStorage:{getItem:()=>{throw Error('Notification must not count rooms');},setItem:()=>{throw Error('Notification must not count rooms');}}};
  const notify=vm.runInNewContext('('+source.slice(a,b).replace('export function','function').trim()+'\n)',ctx);
  notify({type:'private',senderId:'synthetic'});notify({type:'owner_push_test'});
});
test('public chat keeps its existing badge behavior outside the private-room counter',()=>{
  const a=source.indexOf('export function triggerLuminaPushNotification('),b=source.indexOf('let hasStartedRealtimeNotifs',a);
  const badges=[];
  const ctx={playNotificationChime:()=>{},navigator:{},window:{updateLuminaMessagesBadge:n=>badges.push(n)},
    document:{visibilityState:'visible',getElementById:()=>({classList:{contains:()=>false}})},
    showInAppChatBanner:()=>{},showSystemDrawerNotification:()=>{},localStorage:{getItem:()=> '2'}};
  const notify=vm.runInNewContext('('+source.slice(a,b).replace('export function','function').trim()+'\n)',ctx);
  notify({type:'public'});assert.deepEqual(badges,[3]);
});
test('room snapshot counts aliases once and refreshes other unread rooms while the modal is open',()=>{
  const a=source.indexOf('export function startRealtimeChatNotificationsListener('),b=source.indexOf('// Auto-start listener on load',a);
  const streams=[],storage=new Map(),badges=[];
  const ctx={db:{},auth:{currentUser:{uid:'me'}},onAuthChange:cb=>{cb();return ()=>{};},hasStartedRealtimeNotifs:false,currentUserState:{uid:'me'},currentProfileState:{uid:'me',slug:'me'},Date,
    normalizeChatUserId:id=>String(id||'').toLowerCase(),localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},
    collection:(_db,path)=>({path}),query:(ref,...filters)=>({ref,filters}),where:(...args)=>args,or:(...a)=>({or:a}),limit:n=>n,orderBy:(...a)=>a,
    onSnapshot:(q,cb)=>{streams.push({q,cb});return ()=>{};},console:{warn:()=>{}},
    document:{getElementById:()=>({classList:{contains:()=>true}})},window:{updateLuminaMessagesBadge:n=>badges.push(n)},triggerLuminaPushNotification:()=>{throw Error('No notification for old synthetic rooms');}};
  const start=vm.runInNewContext('('+source.slice(a,b).replace('export function','function').trim()+'\n)',ctx);start();
  const emit=rooms=>streams.find(s=>s.q.ref.path==='lumina_chats').cb({forEach:cb=>rooms.forEach(([id,sender])=>cb({id,data:()=>({users:['me',sender],lastSenderId:sender,lastMessageTimestamp:{seconds:1}})})),docChanges:()=>[]});
  emit([['room-a','Alice'],['room-b','bob']]);
  assert.equal(badges.at(-1),2);assert.deepEqual(JSON.parse(storage.get('lumina_unread_rooms_json')),{alice:1,bob:1});
  assert.equal(ctx.window._luminaUnreadRoomsMap.get('alice'),1);
  storage.set('lumina_chat_read_room-a','2000');emit([['room-a','Alice'],['room-b','bob']]);
  assert.equal(badges.at(-1),1);assert.deepEqual(JSON.parse(storage.get('lumina_unread_rooms_json')),{bob:1});
});
function sessionFixture() {
  const a=source.indexOf('export function startRealtimeChatNotificationsListener('),b=source.indexOf('// Auto-start listener on load',a);
  const streams=[],callbacks=[],storage=new Map(),badges=[],notifications=[];
  const ctx={db:{},auth:{currentUser:null},hasStartedRealtimeNotifs:false,currentUserState:null,currentProfileState:null,
    onAuthChange:cb=>{callbacks.push(cb);cb();return ()=>{};},Date,
    normalizeChatUserId:id=>String(id||'').toLowerCase(),
    localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},
    collection:(_db,path)=>({path}),query:(ref,...filters)=>({ref,filters}),where:(...a)=>a,or:(...a)=>({or:a}),limit:n=>n,orderBy:(...a)=>a,
    onSnapshot:(q,cb)=>{const stream={q,cb,stopped:false};streams.push(stream);return()=>{stream.stopped=true;};},
    window:{updateLuminaMessagesBadge:n=>badges.push(n)},document:{getElementById:()=>null},console:{warn:()=>{}},
    triggerLuminaPushNotification:n=>notifications.push(n)};
  const start=vm.runInNewContext('('+source.slice(a,b).replace('export function','function').trim()+'\n)',ctx);
  const login=(uid,slug,anonymous=false)=>{ctx.currentUserState={uid,isAnonymous:anonymous};ctx.auth.currentUser={uid,isAnonymous:anonymous};ctx.currentProfileState={uid,slug};callbacks.forEach(cb=>cb());};
  const empty={forEach:()=>{},docChanges:()=>[]};
  return {ctx,start,login,streams,callbacks,storage,badges,notifications,empty};
}
test('chat session starts private listeners after late login, without duplicating the public stream',()=>{
  const f=sessionFixture();f.start();assert.equal(f.streams.length,1);
  f.login('UID_A','alice');assert.equal(f.streams.length,3);
  f.start();f.login('UID_A','alice');assert.equal(f.streams.length,3);assert.equal(f.callbacks.length,1);
  assert.deepEqual(JSON.parse(JSON.stringify(f.streams[1].q.filters[0])),{or:[['participants','array-contains','UID_A'],['users','array-contains','UID_A']]});
});
test('cached or anonymous identity cannot start private listeners',()=>{
  const f=sessionFixture();f.ctx.currentUserState={uid:'cached'};f.ctx.currentProfileState={uid:'cached',slug:'old'};
  f.start();assert.equal(f.streams.length,1);f.login('ANON','guest-slug',true);assert.equal(f.streams.length,1);
});
test('account switch and logout unsubscribe old streams and discard queued snapshots',()=>{
  const f=sessionFixture();f.start();f.login('UID_A','alice');const old=f.streams.slice(1);
  f.storage.set('lumina_unread_rooms_json','{"other":2}');f.login('UID_B','bob');
  assert.ok(old.every(s=>s.stopped));assert.equal(f.storage.has('lumina_unread_rooms_json'),false);
  const count=f.badges.length;old[0].cb(f.empty);
  old[1].cb({docChanges:()=>[{type:'added',doc:{id:'old',data:()=>({createdAt:{seconds:Date.now()/1000},senderId:'other'})}}]});
  assert.equal(f.badges.length,count);assert.equal(f.notifications.length,0);
  const active=f.streams.slice(3);f.ctx.currentUserState=null;f.ctx.auth.currentUser=null;f.callbacks.forEach(cb=>cb());
  assert.ok(active.every(s=>s.stopped));assert.equal(f.badges.at(-1),0);
});
test('SDK account change suppresses an old callback before delayed profile observers finish',()=>{
  const f=sessionFixture();f.start();f.login('UID_A','alice');const old=f.streams[1];
  f.ctx.auth.currentUser={uid:'UID_B'};const before=f.badges.length;old.cb(f.empty);assert.equal(f.badges.length,before);
});
test('profile arrival restarts private queries and never reuses a different account profile',()=>{
  const f=sessionFixture();f.start();f.ctx.currentUserState={uid:'CaseSensitive_UID'};f.ctx.auth.currentUser={uid:'CaseSensitive_UID'};
  f.ctx.currentProfileState={uid:'OLD_UID',slug:'old-owner'};f.callbacks.forEach(cb=>cb());
  assert.equal(f.streams[1].q.filters[0].or[0][2],'CaseSensitive_UID');
  const prior=f.streams.slice(1);f.login('CaseSensitive_UID','new-owner');assert.ok(prior.every(s=>s.stopped));
  assert.equal(f.streams[3].q.filters[0].or[0][2],'CaseSensitive_UID');const before=f.badges.length;prior[0].cb(f.empty);assert.equal(f.badges.length,before);
});
test('session changes do not reset public notification deduplication',()=>{
  const f=sessionFixture();f.start();const snapshot={docChanges:()=>[{type:'added',doc:{id:'public-id',data:()=>({senderId:'other',timestamp:{seconds:Date.now()/1000},text:'synthetic'})}}]};
  f.streams[0].cb(snapshot);f.login('UID_A','alice');f.streams[0].cb(snapshot);assert.equal(f.notifications.length,1);
});
test('late login does not announce private notifications from before that session',()=>{
  const f=sessionFixture();let now=10000;f.ctx.Date={now:()=>now};f.start();now=100000;f.login('UID_A','alice');
  const stream=f.streams.find(s=>s.q.ref.path==='lumina_notifications');
  stream.cb({docChanges:()=>[{type:'added',doc:{id:'prior-session',data:()=>({senderId:'other',createdAt:{seconds:20}})}}]});
  assert.equal(f.notifications.length,0);
});
function userChatsFixture({anonymous=false,missingSdk=false}={}) {
  const a=source.indexOf('export function subscribeToUserChats('),b=source.indexOf('// ═',a),streams=[],updates=[];
  const ctx={db:{},currentUserState:{uid:'UID_Case',isAnonymous:anonymous},auth:{currentUser:missingSdk?null:{uid:'UID_Case',isAnonymous:anonymous}},
    collection:(_db,path)=>({path}),query:(ref,...filters)=>({ref,filters}),where:(...a)=>a,or:(...a)=>({or:a}),limit:n=>n,
    onSnapshot:(q,cb)=>{const s={q,cb,stopped:false};streams.push(s);return()=>{s.stopped=true;};},console:{warn:()=>{}}};
  const subscribe=vm.runInNewContext('('+source.slice(a,b).replace('export function','function').trim()+'\n)',ctx);
  return {ctx,streams,updates,stop:subscribe('display-slug',rows=>updates.push(rows))};
}
test('conversation list uses exact authenticated UID for modern and legacy rooms, never the caller slug',()=>{
  const f=userChatsFixture();assert.equal(f.streams.length,1);
  assert.deepEqual(JSON.parse(JSON.stringify(f.streams[0].q.filters)),[{or:[['participants','array-contains','UID_Case'],['users','array-contains','UID_Case']]},40]);
  f.stop();assert.equal(f.streams[0].stopped,true);
});
test('conversation list never queries for anonymous or merely cached identity',()=>{
  for(const options of [{anonymous:true},{missingSdk:true}]){const f=userChatsFixture(options);assert.equal(f.streams.length,0);f.stop();}
});
test('conversation list suppresses snapshots after unsubscribe or SDK account switch',()=>{
  for(const mode of ['stop','switch']){const f=userChatsFixture();const empty={forEach:()=>{}};f.streams[0].cb(empty);assert.equal(f.updates.length,1);
    if(mode==='stop')f.stop();else f.ctx.auth.currentUser={uid:'OTHER_UID'};
    f.streams[0].cb(empty);assert.equal(f.updates.length,1);}
});
test('all active chat headers use neutral labels rather than manufactured presence and safety',async()=>{
  for(const file of ['lumina.html','lumina-tablica.html','lumina-tablica-light.html','lumina-profile.html','lumina.cezaryrgowski.html','lumina.wiolettarogowska.html']){
    const html=await readFile(file,'utf8');assert.doesNotMatch(html,/Aktywny\(a\) teraz|Bezpieczna Rozmowa/);
    assert.match(html,/Rozmowa prywatna/);
  }
});
const readStart=source.indexOf('export async function markDirectMessagesAsRead(');
const readEnd=source.indexOf('// ── Public Community Live Chatroom',readStart);
const readFn=source.slice(readStart,readEnd).replace('export async function','async function');
function readFixture({offline=false,anonymous=false,failCommit=false,switchAccount=false,cacheFailure=false,hidden=false,closed=false,listOnly=false,hideDuringQuery=false}={}) {
  const room='u_synthetic_recipient_u_synthetic_sender';
  const messages=[
    {id:'incoming',receiverAuthUid:'recipient-uid',senderAuthUid:'sender-uid',isRead:false,status:'sent',readBy:['previous']},
    {id:'outgoing',receiverAuthUid:'sender-uid',senderAuthUid:'recipient-uid',isRead:false,status:'sent'},
    {id:'unseen',receiverAuthUid:'recipient-uid',senderAuthUid:'sender-uid',isRead:false,status:'sent'},
  ];
  const storage=new Map([['lumina_chat_'+room,JSON.stringify(messages.slice(0,2))],['lumina_messages_unread_count','7']]);
  const writes=[],events=[],queries=[];
  const ctx={db:offline?null:{},currentUserState:{uid:'recipient-uid',isAnonymous:anonymous},
    normalizeChatUserId:id=>id,getChatId:(a,b)=>[a,b].sort().join('_'),
    localStorage:{getItem:key=>storage.get(key)||null,setItem:(key,value)=>{events.push('cache');if(cacheFailure)throw Error('quota');storage.set(key,value);}},
    collection:(_db,path)=>({path}),query:(ref,...filters)=>{queries.push({ref,filters});return {ref,filters};},where:(...args)=>args,orderBy:(...args)=>args,limit:n=>n,
    getDocs:async()=>{if(hideDuringQuery)ctx.document.visibilityState='hidden';return {forEach:cb=>messages.forEach(m=>cb({id:m.id,data:()=>m}))};},doc:(_db,path,id)=>({path,id}),
    writeBatch:()=>({update:(...args)=>writes.push(args),commit:async()=>{events.push('commit');if(failCommit)throw Error('denied');if(switchAccount)ctx.currentUserState={uid:'other-uid'};}}),
    activeDirectChatListeners:new Map([[room,()=>events.push('render')]]),console:{warn:()=>{}},
    activeDirectReadReceipts:new Set(),
    document:{visibilityState:hidden?'hidden':'visible',getElementById:id=>id==='directMessagesModal'?{classList:{contains:()=>!closed}}:{getClientRects:()=>listOnly?[]:[{}]}},
  };
  return {mark:vm.runInNewContext('('+readFn.trim()+'\n)',ctx),room,storage,writes,events,queries};
}
test('read receipts: offline and anonymous accounts never mutate cache or query messages',async()=>{
  for(const opts of [{offline:true},{anonymous:true},{hidden:true},{closed:true},{listOnly:true}]) {
    const f=readFixture(opts);assert.equal(await f.mark(f.room,'recipient','Test'),false);
    assert.equal(f.events.length,0);assert.equal(f.queries.length,0);
  }
});
test('read receipts: participant scope preserves underscore room IDs and marks only visible incoming messages',async()=>{
  const f=readFixture();assert.equal(await f.mark(f.room,'recipient','Test'),true);
  assert.deepEqual(JSON.parse(JSON.stringify(f.queries[0].filters)),[['participants','array-contains','recipient-uid'],['chatId','==',f.room],400]);
  assert.equal(f.writes.length,1);assert.equal(f.writes[0][0].id,'incoming');
  assert.deepEqual(Array.from(f.writes[0][1].readBy),['previous','recipient']);
  assert.equal(f.events[0],'commit');assert.equal(f.storage.get('lumina_messages_unread_count'),'7');
  const cached=JSON.parse(f.storage.get('lumina_chat_'+f.room));
  assert.equal(cached[0].status,'read');assert.equal(cached[1].status,'sent');
});
test('read receipts: rejected server commit never manufactures a local read or read time',async()=>{
  const f=readFixture({failCommit:true}),before=f.storage.get('lumina_chat_'+f.room);
  assert.equal(await f.mark(f.room,'recipient','Test'),false);
  assert.equal(f.storage.get('lumina_chat_'+f.room),before);assert.equal(f.storage.has('lumina_chat_read_'+f.room),false);
  assert.deepEqual(f.events,['commit']);
});
test('read receipts: account switch and full local storage do not invalidate confirmed server writes',async()=>{
  for(const opts of [{switchAccount:true},{cacheFailure:true}]) {
    const f=readFixture(opts),before=f.storage.get('lumina_chat_'+f.room);
    assert.equal(await f.mark(f.room,'recipient','Test'),true);
    assert.equal(f.storage.get('lumina_chat_'+f.room),before);assert.equal(f.events.includes('render'),false);
  }
});
test('read receipts: repeated rendering of confirmed messages causes no write loop',async()=>{
  const f=readFixture();await f.mark(f.room,'recipient','Test');const writes=f.writes.length;
  await f.mark(f.room,'recipient','Test');assert.equal(f.writes.length,writes);
});
test('read receipts: concurrent renders do not duplicate the same room write',async()=>{
  const f=readFixture();const first=f.mark(f.room,'recipient','Test');
  assert.equal(await f.mark(f.room,'recipient','Test'),false);
  assert.equal(await first,true);assert.equal(f.writes.length,1);
});
test('read receipts: app hidden while query is pending cannot commit an automatic read',async()=>{
  const f=readFixture({hideDuringQuery:true});assert.equal(await f.mark(f.room,'recipient','Test'),false);
  assert.equal(f.writes.length,0);assert.equal(f.events.length,0);
});
test('conversation resumes only on visible open room and removes its event listener on cleanup',()=>{
  const a=source.indexOf('export function subscribeToDirectMessages('),b=source.indexOf('export function subscribeToIncomingMessageRequests(',a);
  const hooks=new Map(),updates=[];let open=true;
  const ctx={db:{},currentUserState:{uid:'synthetic-uid'},localStorage:{getItem:()=>null,setItem:()=>{}},activeDirectChatListeners:new Map(),
    collection:(_db,path)=>({path}),query:(ref,...filters)=>({ref,filters}),where:(...args)=>args,orderBy:(...args)=>args,limit:n=>n,
    onSnapshot:()=>()=>{},getDirectMessageKey:m=>m.id,getDirectMessageTime:()=>0,console:{warn:()=>{}},getChatId:(a,b)=>[a,b].sort().join('_'),
    document:{visibilityState:'hidden',getElementById:()=>({classList:{contains:()=>open}}),addEventListener:(event,fn)=>hooks.set(event,fn),removeEventListener:(event,fn)=>{assert.equal(hooks.get(event),fn);hooks.delete(event);}}};
  const subscribe=vm.runInNewContext('('+source.slice(a,b).replace('export function','function').trim()+'\n)',ctx);
  const stop=subscribe('synthetic-room',m=>updates.push(m));const resume=hooks.get('visibilitychange');
  resume();assert.equal(updates.length,0);ctx.document.visibilityState='visible';resume();assert.equal(updates.length,1);
  open=false;resume();assert.equal(updates.length,1);open=true;ctx.currentUserState={uid:'different-user'};resume();assert.equal(updates.length,1);
  stop();assert.equal(hooks.size,0);assert.equal(ctx.activeDirectChatListeners.size,0);
});
test('all active DM streams hide pending writes until metadata confirms them',()=>{
  const a=source.indexOf('export function subscribeToDirectMessages('),b=source.indexOf('export function subscribeToIncomingMessageRequests(',a);
  const streams=[],updates=[];
  const ctx={db:{},currentUserState:{uid:'synthetic-sender-uid'},localStorage:{getItem:()=>null,setItem:()=>{}},activeDirectChatListeners:new Map(),
    collection:(_db,path)=>({path}),query:(ref,...filters)=>({ref,filters}),where:(...args)=>args,orderBy:(...args)=>args,limit:n=>n,
    onSnapshot:(q,opts,cb)=>{assert.equal(opts.includeMetadataChanges,true);streams.push({q,cb});return ()=>{};},
    getDirectMessageKey:m=>m.id,getDirectMessageTime:()=>0,console:{warn:()=>{}},getChatId:(a,b)=>[a,b].sort().join('_'),
  };
  const subscribe=vm.runInNewContext('('+source.slice(a,b).replace('export function','function').trim()+'\n)',ctx);
  const cleanup=subscribe('synthetic-room',m=>updates.push(m));
  assert.equal(streams.length,3);
  for(const [index,stream] of streams.entries()) {
    const emit=pending=>stream.cb({forEach:cb=>cb({id:'synthetic-'+index,metadata:{hasPendingWrites:pending},data:()=>({chatId:'synthetic-room',text:'Syntetyczny tekst'})})});
    const before=updates.at(-1)?.length||0;
    emit(true);assert.equal(updates.at(-1).length,before);
    emit(false);assert.equal(updates.at(-1).length,before+1);
  }
  cleanup();assert.equal(ctx.activeDirectChatListeners.size,0);
});
function fixture({offline=false,anonymous=false,failCommit=false,chatExists=true,pushFail=false}={}) {
  const events=[],committed=[],writes=[],secondary=[];
  const ctx={
    db:offline?null:{},currentUserState:{uid:'synthetic-sender-uid',isAnonymous:anonymous},
    currentProfileState:{slug:'synthetic-sender',name:'Test nadawcy'},
    normalizeChatUserId:id=>id,getChatId:(a,b)=>[a,b].sort().join('_'),
    getProfileFromCloud:async()=>({uid:'synthetic-recipient-uid'}),
    getDoc:async ref=>({exists:()=>ref.path.includes('lumina_chats')?chatExists:false,data:()=>({conversationState:'accepted'})}),
    doc:(base,collection,id)=> typeof base.path==='string'?{path:base.path+'/synthetic-message-id',id:'synthetic-message-id'}:{path:collection+'/'+id,id},
    collection:(_db,path)=>({path}),
    writeBatch:()=>({set:(...args)=>writes.push(args),commit:async()=>{events.push('commit');if(failCommit)throw Error('synthetic rejection');committed.push(...writes);}}),
    serverTimestamp:()=>({syntheticServerTimestamp:true}),
    triggerLuminaPush:async()=>{events.push('push');return {delivered:!pushFail};},
    addDoc:async(ref,data)=>{secondary.push({path:ref.path,data});events.push('secondary');return {id:'synthetic-secondary-id'};},
    setDoc:async()=>{throw Error('Unexpected non-atomic write');},
    localStorage:{getItem:()=>{throw Error('Unexpected private cache read');},setItem:()=>{throw Error('Unexpected optimistic cache write');}},
    activeDirectChatListeners:new Map(),window:{},console:{warn:()=>{}},setTimeout:()=>{},
    crypto:{randomUUID:()=> 'synthetic-client-id'},
  };
  const send=vm.runInNewContext('('+fn.trim()+')',ctx);
  return {send,events,committed,writes,secondary,ctx};
}
test('confirmed primary message ID and read status cannot be overwritten by a stale backup',()=>{
  const a=source.indexOf('export function subscribeToDirectMessages('),b=source.indexOf('export function subscribeToIncomingMessageRequests(',a);
  const streams=[],updates=[];
  const ctx={db:{},currentUserState:{uid:'synthetic-uid'},localStorage:{getItem:()=>null,setItem:()=>{}},activeDirectChatListeners:new Map(),
    collection:(_db,path)=>({path}),query:(ref,...filters)=>({ref,filters}),where:(...args)=>args,orderBy:(...args)=>args,limit:n=>n,
    onSnapshot:(q,opts,cb)=>{streams.push({q,cb});return ()=>{};},getDirectMessageKey:m=>m.clientMessageId,getDirectMessageTime:()=>0,
    console:{warn:()=>{}},getChatId:(a,b)=>[a,b].sort().join('_')};
  const subscribe=vm.runInNewContext('('+source.slice(a,b).replace('export function','function').trim()+'\n)',ctx);
  const stop=subscribe('synthetic-room',m=>updates.push(m));
  const emit=(stream,id,isRead)=>stream.cb({forEach:cb=>cb({id,metadata:{hasPendingWrites:false},data:()=>({clientMessageId:'same-client',chatId:'synthetic-room',isRead,status:isRead?'read':'sent'})})});
  emit(streams[0],'primary',true);emit(streams[1],'legacy',false);emit(streams[2],'backup',false);
  assert.equal(updates.at(-1).length,1);assert.equal(updates.at(-1)[0].id,'primary');assert.equal(updates.at(-1)[0].status,'read');stop();
});
const payload={receiverId:'synthetic-recipient',receiverUid:'synthetic-recipient-uid',text:'Syntetyczna wiadomość testowa'};
test('missing database and anonymous account never report local success or trigger push',async()=>{
  for(const opts of [{offline:true},{anonymous:true}]) {
    const f=fixture(opts); assert.equal(await f.send('synthetic-room',payload),null);
    assert.equal(f.events.length,0);assert.equal(f.writes.length,0);
  }
});
test('message and conversation preview commit together before push; not delivered by assumption',async()=>{
  const f=fixture({pushFail:true});
  assert.equal(await f.send('synthetic-room',payload),'synthetic-message-id');
  assert.equal(f.committed.length,2); assert.deepEqual(f.events.slice(0,2),['commit','push']);
  const msg=f.committed[0][1],room=f.committed[1][1];
  assert.equal(msg.status,'sent'); assert.equal(msg.delivered,false); assert.equal(msg.deliveredAt,null);
  assert.equal(room.lastMessageText,msg.text);
  assert.equal(room.conversationState,'accepted');
  assert.equal('participants' in room,false); assert.equal('users' in room,false);
  assert.equal(f.committed[1][2].merge,true);
});
test('rejected atomic commit leaves no partial conversation or optimistic success',async()=>{
  const f=fixture({failCommit:true});
  assert.equal(await f.send('synthetic-room',payload),null);
  assert.equal(f.committed.length,0); assert.deepEqual(f.events,['commit']);
  assert.equal(f.secondary.length,0);
});
test('new conversation includes identities only after an accepted request',async()=>{
  const f=fixture({chatExists:false});
  f.ctx.getDoc=async ref=>({exists:()=>ref.path.includes('lumina_message_requests'),data:()=>({status:'accepted'})});
  assert.equal(await f.send('synthetic-room',payload),'synthetic-message-id');
  assert.deepEqual(Array.from(f.committed[1][1].participants),['synthetic-sender-uid','synthetic-recipient-uid']);
});
test('pending or closed request does not enter the atomic message write',async()=>{
  for(const status of ['pending','closed']) {
    const f=fixture({chatExists:false});
    f.ctx.getDoc=async ref=>({exists:()=>ref.path.includes('lumina_message_requests'),data:()=>({status})});
    const result=await f.send('synthetic-room',payload);
    assert.equal(result.status,status==='pending'?'request_pending':'request_closed');
    assert.equal(f.writes.length,0);
  }
});
