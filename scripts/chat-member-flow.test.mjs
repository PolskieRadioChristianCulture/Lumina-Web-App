import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {spawn} from 'node:child_process';
import {resolve} from 'node:path';
import {createConnection} from 'node:net';
import {Window} from 'happy-dom';

const source=fs.readFileSync('lumina-db.js','utf8');
const helper=source.slice(source.indexOf('async function getMemberConversationSnapshot('),source.indexOf('export async function acceptMessageRequest('));
const slice=(a,b)=>source.slice(source.indexOf(a),source.indexOf(b,source.indexOf(a))).replace('export async function','async function');
const send=slice('export async function sendDirectMessageToCloud(','// ── Oznaczanie wiadomości prywatnych');
const accept=slice('export async function acceptMessageRequest(','export async function declineMessageRequest(');
const unblock=slice('export async function unblockUser(','// ═');
const adapterSource=fs.readFileSync('components/lumi-direct-dock-adapter.js','utf8');
const controllerSource=fs.readFileSync('components/lumi-direct-dock.js','utf8');

test('dock preserves the draft for every unconfirmed request outcome and clears only a saved message',async()=>{
 for(const result of [null,undefined,{status:'request_sent'},{status:'request_pending'},{status:'request_closed'},{status:'unknown'},'saved-id']) {
  const w=new Window();w.LuminaDB={getCurrentUser:()=>({uid:'A'}),getCurrentProfile:()=>({slug:'alice'}),sendDirectMessageToCloud:async()=>result};
  w.eval(adapterSource);w.eval(controllerSource);
  const c=new w.LumiDirectDockController({adapter:w.createDirectMessagingAdapter()});
  c.userId='alice';c.activeId='alice_bob';c.drafts[c.activeId]='Draft';c.render=()=>{};c.loadActiveConversation=async()=>{};
  await c.sendMessage();assert.equal(c.drafts.alice_bob,result==='saved-id'?'':'Draft');assert.equal(!!c.error,result!=='saved-id');assert.equal(c.busy,false);w.close();
 }
});

test('late send completion cannot erase a newer draft or the next account draft',async()=>{
 for(const switchAccount of [false,true]){
  const w=new Window();w.eval(controllerSource);let complete;
  const c=new w.LumiDirectDockController({adapter:{sendText:()=>new Promise(r=>complete=r)}});
  c.userId='alice';c.activeId='alice_bob';c.drafts.alice_bob='old';c.render=()=>{};c.loadActiveConversation=async()=>{};
  const pending=c.sendMessage();if(switchAccount)c.userId='bob';c.drafts.alice_bob='new';complete('saved');await pending;assert.equal(c.drafts.alice_bob,'new');w.close();
 }
});

test('private lookup falls back only for permission denial and always scopes the exact document to the member',async()=>{
 const queries=[];const ctx={db:{},currentUserState:{uid:'UID_A'},doc:(_d,c,id)=>({c,id}),getDoc:async()=>{throw Object.assign(Error('denied'),{code:'permission-denied'});},
  collection:(_d,c)=>c,where:(...a)=>a,or:(...a)=>({or:a}),documentId:()=> '__name__',limit:n=>n,query:(...a)=>a,getDocs:async q=>{queries.push(q);return {docs:[]};}};
 const read=vm.runInNewContext('(()=>{'+helper+' return getMemberConversationSnapshot;})()',ctx);
 for(const c of ['lumina_chats','lumina_message_requests'])assert.equal((await read(c,'new-room',{uid:'UID_A'})).exists(),false);
 assert.deepEqual(JSON.parse(JSON.stringify(queries[0])),['lumina_chats',['chatId','==','new-room'],{or:[['participants','array-contains','UID_A'],['users','array-contains','UID_A']]}]);
 assert.deepEqual(JSON.parse(JSON.stringify(queries[1][2])),{or:[['senderAuthUid','==','UID_A'],['receiverAuthUid','==','UID_A']]});
 ctx.getDoc=async()=>{throw Object.assign(Error('offline'),{code:'unavailable'});};await assert.rejects(read('lumina_chats','room',{uid:'UID_A'}),/offline/);assert.equal(queries.length,2);
});

test('unblock keeps the local block when persistence fails, account changes or no signed-in session exists',async()=>{
 for(const mode of ['denied','switch','anonymous','offline']){
  let cacheWrites=0;const ctx={db:mode==='offline'?null:{},currentUserState:{uid:'A',isAnonymous:mode==='anonymous'},getProfileFromCloud:async()=>({uid:'B'}),
   collection:()=>({}),query:()=>({}),where:()=>({}),or:()=>({}),getDocs:async()=>({empty:false,forEach:cb=>cb({ref:{}})}),
   writeBatch:()=>({delete:()=>{},commit:async()=>{if(mode==='denied')throw Error('denied');ctx.currentUserState={uid:'C'};}}),
   getBlockedUsers:()=>['bob'],localStorage:{setItem:()=>cacheWrites++},console:{warn:()=>{}}};
  const fn=vm.runInNewContext('('+unblock+')',ctx);assert.equal(await fn('bob'),false);assert.equal(cacheWrites,0);
 }
});

test('ordinary members complete first-contact, consent, two-way chat and persistent unblock under actual Firestore rules',{
 skip:!process.env.CC_FIRESTORE_EMULATOR_JAR,timeout:60000
},async()=>{
 const project='demo-cc-member-flow',base='http://127.0.0.1:18989',root=base+'/v1/projects/'+project+'/databases/(default)/documents';
 const occupied=await new Promise(r=>{const s=createConnection({host:'127.0.0.1',port:18989});s.once('connect',()=>{s.destroy();r(true);});s.once('error',()=>{s.destroy();r(false);});});assert.equal(occupied,false);
 const processJava=spawn('java',['-Duser.language=en','-Duser.country=US','-jar',process.env.CC_FIRESTORE_EMULATOR_JAR,'--host','127.0.0.1','--port','18989','--project_id',project,'--single_project_mode','--single_project_mode_error','--rules',resolve('firestore.rules')],{windowsHide:true,stdio:['ignore','pipe','pipe']});
 let log='';for(const s of [processJava.stdout,processJava.stderr])s.on('data',x=>log=(log+x).slice(-5000));
 const b64=x=>Buffer.from(JSON.stringify(x)).toString('base64url');
 const bearer=uid=>b64({alg:'none',typ:'JWT'})+'.'+b64({aud:project,iss:'https://securetoken.google.com/'+project,sub:uid,user_id:uid,iat:Math.floor(Date.now()/1000),exp:Math.floor(Date.now()/1000)+3600,email_verified:false,firebase:{sign_in_provider:'password',identities:{}}})+'.';
 const value=x=>x===null?{nullValue:null}:Array.isArray(x)?{arrayValue:{values:x.map(value)}}:typeof x==='boolean'?{booleanValue:x}:typeof x==='number'?{doubleValue:x}:typeof x==='object'?{mapValue:{fields:fields(x)}}:{stringValue:x};
 const fields=x=>Object.fromEntries(Object.entries(x).map(([k,v])=>[k,value(v)]));
 const decode=x=>'arrayValue'in x?(x.arrayValue.values||[]).map(decode):'mapValue'in x?Object.fromEntries(Object.entries(x.mapValue.fields||{}).map(([k,v])=>[k,decode(v)])):Object.values(x)[0];
 const data=d=>Object.fromEntries(Object.entries(d.fields||{}).map(([k,v])=>[k,decode(v)]));
 const ref=(c,id)=>({c,id,name:`projects/${project}/databases/(default)/documents/${c}/${id}`});
 const snapshot=d=>({id:d.name.split('/').at(-1),ref:ref(d.name.split('/').at(-2),d.name.split('/').at(-1)),exists:()=>true,data:()=>data(d)});
 async function request(url,uid,body,method='POST'){
  assert.ok(url.startsWith(base+'/'),'test credentials may only reach loopback');
  const r=await fetch(url,{method,headers:{'Content-Type':'application/json',Authorization:'Bearer '+(uid==='owner'?'owner':bearer(uid))},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(6000)});const result=await r.json();
  if(r.status>=400)throw Object.assign(Error(result.error?.message||'request failed'),{code:r.status===403?'permission-denied':r.status===404?'not-found':'unknown'});return result;
 }
 const stores=new Map(),pushes=[];let sequence=0;const stamp={_serverTimestamp:true};
 const ctx={db:{},currentUserState:{uid:'UID_A'},currentProfileState:{slug:'alice',name:'Synthetic A'},
  normalizeChatUserId:x=>x,getChatId:(a,b)=>[a,b].sort().join('_'),getProfileFromCloud:async id=>({uid:id==='bob'?'UID_B':'UID_A'}),
  isCommunityAdmin:()=>false,window:{},console:{warn:(...args)=>{if(process.env.CC_CHAT_TEST_DEBUG)console.warn(...args);}},crypto:{randomUUID:()=> 'synthetic-'+(++sequence)},setTimeout:()=>{},serverTimestamp:()=>stamp,
  collection:(_db,c)=>({c}),doc:(db,c,id)=>db.c?ref(db.c,'message-'+(++sequence)):ref(c,id),
  getDoc:async r=>{try{return snapshot(await request(root+'/'+r.c+'/'+r.id,ctx.currentUserState.uid,null,'GET'));}catch(e){if(e.code==='not-found')return {exists:()=>false,data:()=>undefined};throw e;}},
  documentId:()=> '__name__',where:(key,op,value)=>({key,op,value}),or:(...filters)=>({filters}),limit:n=>({limit:n}),query:(collection,...filters)=>({collection,filters}),
  triggerLuminaPush:async(...a)=>pushes.push(a),
  localStorage:{getItem:k=>stores.get(ctx.currentUserState.uid+':'+k)||null,setItem:(k,v)=>stores.set(ctx.currentUserState.uid+':'+k,v)},
  getBlockedUsers:()=>JSON.parse(ctx.localStorage.getItem('lumina_blocked_users')||'[]')};
 function filter(f){if(f.filters)return {compositeFilter:{op:'OR',filters:f.filters.map(filter)}};return {fieldFilter:{field:{fieldPath:f.key},op:f.op==='array-contains'?'ARRAY_CONTAINS':'EQUAL',value:f.key==='__name__'?{referenceValue:ref('ignored','ignored').name.replace('ignored/ignored',ctx.queryCollection+'/'+f.value)}:value(f.value)}};}
 ctx.getDocs=async q=>{ctx.queryCollection=q.collection.c;const rows=await request(root+':runQuery',ctx.currentUserState.uid,{structuredQuery:{from:[{collectionId:q.collection.c}],where:{compositeFilter:{op:'AND',filters:q.filters.filter(f=>!f.limit).map(filter)}},...(q.filters.find(f=>f.limit)||{})}});const docs=rows.filter(x=>x.document).map(x=>snapshot(x.document));return {docs,empty:!docs.length,forEach:cb=>docs.forEach(cb)};};
 ctx.writeBatch=()=>{const writes=[];return {set:(r,d,opts)=>{const plain={},transforms=[];for(const [k,v]of Object.entries(d)){if(v===stamp)transforms.push({fieldPath:k,setToServerValue:'REQUEST_TIME'});else plain[k]=v;}writes.push({update:{name:r.name,fields:fields(plain)},...(opts?.merge?{updateMask:{fieldPaths:Object.keys(d)}}:{}),...(transforms.length?{updateTransforms:transforms}:{})});},update:(r,d)=>{const plain={},transforms=[];for(const [k,v]of Object.entries(d)){if(v===stamp)transforms.push({fieldPath:k,setToServerValue:'REQUEST_TIME'});else plain[k]=v;}writes.push({update:{name:r.name,fields:fields(plain)},updateMask:{fieldPaths:Object.keys(d)},currentDocument:{exists:true},...(transforms.length?{updateTransforms:transforms}:{})});},delete:r=>writes.push({delete:r.name}),commit:()=>request(root+':commit',ctx.currentUserState.uid,{writes})};};
 ctx.setDoc=async(r,d,opts)=>{const b=ctx.writeBatch();b.set(r,d,opts);await b.commit();};
 const funcs=vm.runInNewContext('(()=>{'+helper+send+accept+unblock+';return {sendDirectMessageToCloud,acceptMessageRequest,unblockUser};})()',ctx);
 const login=uid=>{ctx.currentUserState={uid};ctx.currentProfileState={slug:uid==='UID_A'?'alice':'bob',name:'Synthetic'};};
 try{
  for(let i=0;i<120;i++){try{await fetch(base,{signal:AbortSignal.timeout(250)});break;}catch{}if(processJava.exitCode!==null)throw Error(log);if(i===119)throw Error('Emulator timeout '+log);await new Promise(r=>setTimeout(r,200));}
  const payload={receiverId:'bob',receiverUid:'UID_B',text:'Synthetic first message'};
  assert.equal((await funcs.sendDirectMessageToCloud('alice_bob',payload)).status,'request_sent');
  assert.equal((await funcs.sendDirectMessageToCloud('alice_bob',payload)).status,'request_pending');
  login('UID_B');assert.ok(await funcs.acceptMessageRequest('alice_bob'));
  login('UID_A');const first=await funcs.sendDirectMessageToCloud('alice_bob',payload);assert.equal(typeof first,'string');
  assert.equal((await ctx.getDoc(ref('lumina_direct_messages',first))).data().text,payload.text);
  login('UID_B');assert.equal((await ctx.getDoc(ref('lumina_direct_messages',first))).data().text,payload.text);
  assert.equal(typeof await funcs.sendDirectMessageToCloud('alice_bob',{receiverId:'alice',receiverUid:'UID_A',text:'Synthetic reply'}),'string');
  login('UID_C');await assert.rejects(ctx.getDoc(ref('lumina_direct_messages',first)),e=>e.code==='permission-denied');
  login('UID_A');await ctx.setDoc(ref('lumina_user_blocks','UID_A_UID_B'),{ownerUid:'UID_A',blockerUid:'UID_A',blockedTargetId:'bob',blockedTargetUid:'UID_B'});ctx.localStorage.setItem('lumina_blocked_users','["bob"]');
  const before=pushes.length;assert.equal(await funcs.sendDirectMessageToCloud('alice_bob',payload),null);assert.equal(pushes.length,before);
  assert.equal(await funcs.unblockUser('bob'),true);assert.deepEqual(ctx.getBlockedUsers(),[]);
  assert.equal(typeof await funcs.sendDirectMessageToCloud('alice_bob',payload),'string');
  login('UID_B');await ctx.setDoc(ref('lumina_user_blocks','UID_B_UID_A'),{ownerUid:'UID_B',blockedTargetId:'alice',blockedTargetUid:'UID_A'});
  login('UID_A');assert.equal(await funcs.unblockUser('bob'),true);assert.equal(await funcs.sendDirectMessageToCloud('alice_bob',payload),null,'cannot undo the other member block');
 }finally{processJava.kill();}
});
