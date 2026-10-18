import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';import {Window} from 'happy-dom';
const source=fs.readFileSync('lumina-db.js','utf8');
const presenceSource=fs.readFileSync('js/lumina-member-presence.js','utf8');
test('community dots use celadon, red and unknown; strips contain only real online members and survive list rerender',async()=>{
 const w=new Window();let receive;w.LuminaDB={subscribeToOnlinePresence:cb=>{receive=cb;return()=>{};},getCurrentUser:()=>({uid:'ME'}),normalizeChatUserId:x=>String(x).toLowerCase()};
 w.document.write('<div id="tablicaOnlineAvatarsContainer"></div><div id="dmConversationsList"><span data-lumina-presence-id="A" data-lumina-presence-slug="alice"></span><span data-lumina-presence-id="B" data-lumina-presence-slug="bob"></span><span data-lumina-presence-id="C" data-lumina-presence-slug="unknown"></span></div>');
 w.eval(presenceSource);const settle=()=>new Promise(r=>setTimeout(r,0));await settle();
 const members=[{uid:'A',slug:'alice',displayName:'<b>Alice</b>',avatar:'javascript:alert(1)',online:true},{uid:'B',slug:'bob',online:false},{uid:'ME',slug:'me',online:true}];
 receive([], {available:true,members});await settle();
 assert.deepEqual([...w.document.querySelectorAll('[data-lumina-presence-id]')].map(e=>e.dataset.presenceState),['online','offline','unknown']);
 const strip=w.document.getElementById('luminaMemberPresenceStrip');assert.equal(strip.querySelectorAll('button').length,1);assert.equal(strip.querySelectorAll('b').length,0);assert.ok(strip.querySelector('img').src.endsWith('/lumina_icon.jpg'));
 receive([], {available:false,members});await settle();assert.equal(strip.hidden,true);assert.ok([...w.document.querySelectorAll('[data-lumina-presence-id]')].every(e=>e.dataset.presenceState==='unknown'));w.close();
});
test('history quota failures reject the dock load rather than resolving an empty conversation',async()=>{
 const w=new Window();w.setTimeout=()=>0;w.clearTimeout=()=>{};w.LuminaDB={getCurrentUser:()=>({uid:'A'}),getCurrentProfile:()=>({slug:'alice'}),subscribeToDirectMessages:(_id,_cb,err)=>{err({code:'resource-exhausted'});return()=>{};}};
 w.eval(fs.readFileSync('components/lumi-direct-dock-adapter.js','utf8'));await assert.rejects(w.createDirectMessagingAdapter().listMessages('alice_bob',600),/limit/);w.close();
});
test('loading older history preserves realtime updates and reports a quota error without clearing messages',async()=>{
 const w=new Window();w.eval(fs.readFileSync('components/lumi-direct-dock.js','utf8'));let fail=false;
 const c=new w.LumiDirectDockController({adapter:{listMessages:async(_id,n)=>{assert.equal(n,600);if(fail)throw Error('Baza osiągnęła limit');return [{id:'old',createdAt:'1',text:'Synthetic'}];}}});
 c.activeId='room';c.userId='alice';c.messages.room=[{id:'live',createdAt:'2',text:'Synthetic'}];c.render=()=>{};c.checkMarkRead=()=>{};c.loadActiveConversation('room');await new Promise(r=>setTimeout(r,0));assert.deepEqual(Array.from(c.messages.room,m=>m.id),['old','live']);
 fail=true;c.loadActiveConversation('room');await new Promise(r=>setTimeout(r,0));assert.equal(c.messages.room.length,2);assert.match(c.error,/limit/);w.close();
});
test('all active messenger surfaces preserve the canonical family room and exact recipient UID; no static green member dot',()=>{
 for(const f of ['lumina.html','lumina-tablica.html','lumina-tablica-light.html','lumina-profile.html','lumina.cezaryrgowski.html','lumina.wiolettarogowska.html']){
  const page=fs.readFileSync(f,'utf8');assert.match(page,/const chatId = familyRoom\?\.chatId/);assert.match(page,/const familyIds = new Set/);assert.match(page,/data-lumina-presence-id/);assert.doesNotMatch(page,/width:10px; height:10px; background:#10b981; border-radius:50%; border:2px solid #090d1a/);
 }
 assert.match(source,/const normalizedChatId = String\(chatId\)/);
});
