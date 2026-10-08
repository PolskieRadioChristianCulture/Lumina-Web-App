import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const source=await readFile('lumina-db.js','utf8');
const start=source.indexOf('export async function sendDirectMessageToCloud(');
const end=source.indexOf('// ── Oznaczanie wiadomości prywatnych',start);
assert.ok(start>=0 && end>start);
const fn=source.slice(start,end).replace('export async function','async function');
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
    collection:(_db,path)=>({path}),query:(ref,...filters)=>{queries.push({ref,filters});return {ref,filters};},where:(...args)=>args,limit:n=>n,
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
    collection:(_db,path)=>({path}),query:(ref,...filters)=>({ref,filters}),where:(...args)=>args,limit:n=>n,
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
    collection:(_db,path)=>({path}),query:(ref,...filters)=>({ref,filters}),where:(...args)=>args,limit:n=>n,
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
    collection:(_db,path)=>({path}),query:(ref,...filters)=>({ref,filters}),where:(...args)=>args,limit:n=>n,
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
