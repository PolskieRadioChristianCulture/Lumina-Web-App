import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { Window } from 'happy-dom';

const adapterSource = fs.readFileSync('components/lumi-direct-dock-adapter.js', 'utf8');
const controllerSource = fs.readFileSync('components/lumi-direct-dock.js', 'utf8');
const backendSource = fs.readFileSync('lumina-db.js', 'utf8');
test('release replaces combined weekly JS cache with one authoritative messaging policy', async () => {
  const source = fs.readFileSync('_worker.js', 'utf8');
  const start = source.indexOf('// Pages combines matching _headers rules');
  const end = source.indexOf("if (url.pathname === '/api/admin/agents-map')", start);
  const handler = vm.runInNewContext('(async (request,env)=>{const url=new URL(request.url);' + source.slice(start,end) + ';return null;})', { URL, Response });
  for (const path of ['/lumina-db.js?v=old','/components/lumi-direct-dock.js?v=old','/components/lumi-direct-dock-adapter.js?v=old','/components/cc-support-footer.js','/firebase-messaging-sw.js','/css/lumina-chat-premium.css?v=old','/css/lumi-direct-dock.css?v=old']) {
    const result = await handler({url:'https://polskieradio.cc'+path,method:'GET'}, {ASSETS:{fetch:async()=>new Response('script',{headers:{'Cache-Control':'public, max-age=604800, no-cache'}})}});
    assert.equal(result.headers.get('Cache-Control'),'no-cache, no-store, must-revalidate');
    assert.equal(await result.text(),'script');
  }
  assert.match(fs.readFileSync('components/cc-support-footer.js','utf8'),/lumi-direct-dock\.js\?v=20261018_directfix4/);
});
function adapter(db) {
  const scope = { LuminaDB: db, setTimeout: () => 0, clearTimeout() {} };
  scope.window = scope;
  vm.runInNewContext(adapterSource, scope);
  return scope.createDirectMessagingAdapter();
}
const identity = () => ({
  getCurrentUser: () => ({ uid: 'UID_A', isAnonymous: false }),
  getCurrentProfile: () => ({ uid: 'UID_A', slug: 'alice', name: 'Alice' }),
  normalizeChatUserId: id => id,
  isUserBlocked: () => false
});

test('production adapter passes the actual two-argument backend contract, text and recipient', async () => {
  assert.match(backendSource, /export async function sendDirectMessageToCloud\(chatId, messageObj\)/);
  const calls = [];
  const a = adapter({ ...identity(), sendDirectMessageToCloud: async (...args) => {
    calls.push(args); return 'saved-message';
  }});
  await a.sendText('alice_bob', ' hello ', 'dedupe-key');
  assert.equal(calls[0].length, 2);
  assert.equal(calls[0][0], 'alice_bob');
  assert.equal(calls[0][1].text, 'hello');
  assert.equal(calls[0][1].senderId, 'alice');
  assert.equal(calls[0][1].receiverId, 'bob');
  assert.equal(calls[0][1].clientRequestId, 'dedupe-key');
});

test('production room subscription supplies new conversations and stops old account callbacks', () => {
  let callback, stopped = false, uid = 'UID_A';
  const db = { ...identity(), getCurrentUser: () => ({ uid }), subscribeToUserChats: (id, cb) => {
    assert.equal(id, 'alice'); callback = cb; return () => { stopped = true; };
  }};
  const events = [];
  const stop = adapter(db).subscribeIncomingDM(e => events.push(e));
  callback([]);
  callback([{ id: 'alice_bob', users: ['alice', 'bob'], lastSenderId: 'bob', lastMessageTimestamp: 123 }]);
  assert.equal(events[1].conversations[0].id, 'alice_bob');
  assert.equal(events[1].conversations[0].unreadCount, 1);
  uid = 'UID_B'; callback([]);
  assert.equal(events.length, 2);
  stop(); assert.equal(stopped, true);
  callback([]); assert.equal(events.length, 2);
});

test('adapter propagates read errors and explicit non-confirmation', async () => {
  const db = { ...identity(), markDirectMessagesAsRead: async () => { throw Error('permission-denied'); } };
  const a = adapter(db);
  await assert.rejects(a.markRead('alice_bob', 'm1'), /permission-denied/);
  db.markDirectMessagesAsRead = async () => false;
  assert.equal(await a.markRead('alice_bob', 'm1'), false);
  db.markDirectMessagesAsRead = async (...args) => {
    assert.equal(args[3].surface, 'direct-dock');
    assert.deepEqual(Array.from(args[3].visibleMessageIds), ['m1']);
    return true;
  };
  assert.equal(await a.markRead('alice_bob', 'm1'), true);
});

function controller(read) {
  const window = new Window();
  window.document.addEventListener = () => {};
  window.eval(controllerSource);
  const c = new window.LumiDirectDockController({ adapter: { markRead: read } });
  c.userId = 'alice'; c.activeId = 'alice_bob';
  c.conversations = [{ id: 'alice_bob', unreadCount: 2 }];
  c.messages.alice_bob = [{ id: 'm1', senderId: 'bob' }];
  c.render = () => {};
  return c;
}
test('controller never clears unread on false or rejected writes, and permits retry', async () => {
  for (const read of [async () => false, async () => { throw Error('offline'); }]) {
    const c = controller(read); c.checkMarkRead();
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(c.conversations[0].unreadCount, 2);
    assert.equal(c.readAttemptSet.size, 0);
  }
  const c = controller(async () => true); c.checkMarkRead();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(c.conversations[0].unreadCount, 0);
});

test('production read backend accepts only rendered incoming dock messages after server commit', async () => {
  const start = backendSource.indexOf('export async function markDirectMessagesAsRead(');
  const end = backendSource.indexOf('// ── Public Community Live Chatroom', start);
  const incoming = { id: 'm1', receiverAuthUid: 'UID_A', senderAuthUid: 'UID_B' };
  for (const mode of ['visible', 'hidden', 'wrong-room', 'unrendered', 'offline']) {
    let writes = 0, committed = false;
    const line = { getAttribute: () => 'm1', getClientRects: () => mode === 'unrendered' ? [] : [{}] };
    const panel = { getAttribute: () => mode === 'wrong-room' ? 'other-room' : 'alice_bob',
      getClientRects: () => [{}], querySelectorAll: () => [line] };
    const ctx = { db: {}, currentUserState: { uid: 'UID_A' }, activeDirectReadReceipts: new Set(),
      normalizeChatUserId: id => id, getChatId: (a,b) => [a,b].sort().join('_'),
      document: { visibilityState: mode === 'hidden' ? 'hidden' : 'visible', querySelectorAll: () => [panel] },
      localStorage: { getItem: () => null, setItem() {} }, activeDirectChatListeners: new Map(),
      collection: () => ({}), query: (...args) => args, where: (...args) => args, limit: n => n,
      getDocs: async () => ({ forEach: cb => { cb({ id: 'm1', data: () => incoming });
        cb({ id: 'unseen', data: () => ({...incoming, id: 'unseen'}) });
        cb({ id: 'outgoing', data: () => ({senderAuthUid:'UID_A',receiverAuthUid:'UID_B'}) }); } }),
      doc: (...args) => args, console: { warn() {} }, writeBatch: () => ({update: () => writes++,
        commit: async () => { if (mode === 'offline') throw Error('offline'); committed = true; }}) };
    const mark = vm.runInNewContext('(' + backendSource.slice(start,end).replace('export async function','async function').trim() + ')',ctx);
    const result = await mark('alice_bob', 'alice', 'Alice', {surface:'direct-dock',visibleMessageIds:['m1','unseen','outgoing']});
    assert.equal(result, mode === 'visible', mode);
    assert.equal(committed, mode === 'visible', mode);
    if (mode === 'visible') assert.equal(writes, 1, 'unseen and outgoing messages remain unread');
  }
});

function dockFixture({autoOpen, withAdapter = true} = {}) {
  const w = new Window();
  w.document.addEventListener = () => {};
  Object.defineProperty(w.document, 'visibilityState', {value:'visible', configurable:true});
  if (autoOpen !== undefined) w.localStorage.setItem('lumi-direct-dock-prefs-v1', JSON.stringify({autoOpen}));
  let incoming;
  const a = {getCurrentUserId:()=> 'alice', listDirectConversations:async()=>[],
    subscribeIncomingDM:cb=>{incoming=cb;return ()=>{};},
    subscribeConversation:()=>()=>{}, listMessages:async()=>[], markRead:async()=>false};
  w.eval(controllerSource);
  const c = new w.LumiDirectDockController({adapter:a});
  c.init();
  const room = {id:'alice_radiocc',type:'direct',participant:{id:'radiocc',name:'Christian Culture',avatarUrl:'/logo_radio_cc.jpg'},unreadCount:1,lastMessageAt:'2026-10-18T08:00:00Z',lastMessageSenderId:'radiocc'};
  return {w,c,emit:rooms=>incoming({conversations:rooms}),room};
}

test('dock renders avatar shortcut, opens on click and recovers a broken image', async()=>{
  const {w,c,emit,room}=dockFixture({autoOpen:false});
  emit([]); emit([room]);
  assert.equal(c.activeId,null,'explicit opt-out shows only the incoming avatar');
  const head=w.document.querySelector('.ldd-head');
  assert.ok(head);
  assert.equal(head.querySelector('img').getAttribute('src'),'/logo_radio_cc.jpg');
  head.querySelector('img').dispatchEvent(new w.Event('error'));
  assert.equal(head.querySelector('.ldd-initial').textContent,'C');
  head.click();
  assert.equal(c.activeId,room.id);
  assert.equal(w.document.querySelector('.ldd-window').getAttribute('data-chat-id'),room.id);
  assert.equal(w.document.querySelector('.ldd-name strong').textContent,'Christian Culture');
  w.document.querySelector('.ldd-btn-min').click();
  assert.equal(w.document.querySelector('.ldd-window'),null);
  assert.ok(w.document.querySelector('.ldd-head'));
  c.destroy();
});

test('notification banner is disabled in favor of avatar bubble; legacy banner is suppressed', async()=>{
  const css = fs.readFileSync('css/lumi-direct-dock.css', 'utf8');
  assert.match(css, /#lumina-chat-notification-banner\{display:none!important/);

  const dbCode = fs.readFileSync('lumina-db.js', 'utf8');
  assert.match(dbCode, /Baner powiadomień wyłączony na polecenie Dowódcy/);

  const w = new Window();
  w.document.body.innerHTML = '<div id="lumina-chat-notification-banner">Old banner</div>';
  w.eval(controllerSource);
  const c = new w.LumiDirectDockController({adapter:{getCurrentUserId:()=>'u1',listDirectConversations:async()=>[],subscribeIncomingDM:()=>()=>null,subscribeConversation:()=>()=>null,listMessages:async()=>[],markRead:async()=>false}});
  c.init();
  c.render();
  assert.equal(w.document.getElementById('lumina-chat-notification-banner'), null, 'Lingering banner removed from DOM');
  c.destroy();
});

test('new incoming room shows avatar bubble by default without opening, opt-in opens, head click toggles',async()=>{
  for(const pref of [undefined,true]) {
    const {w,c,emit,room}=dockFixture({autoOpen:pref});
    emit([]); emit([room]);
    assert.equal(c.activeId,pref===true?room.id:null);
    const head = w.document.querySelector('.ldd-head');
    assert.ok(head, 'Avatar bubble appears in dock');
    if(pref===true){
      w.document.querySelector('.ldd-btn-close').click();
      assert.equal(w.document.querySelector('.ldd-head'),null);
      emit([{...room,lastMessageAt:'2026-10-18T08:01:00Z'}]);
      assert.equal(c.activeId,room.id);
      assert.ok(w.document.querySelector('.ldd-head'));
    } else {
      // Kliknięcie w bąbelek otwiera okno
      head.click();
      assert.equal(c.activeId,room.id);
      assert.ok(w.document.querySelector('.ldd-window'));
      // Ponowne kliknięcie w bąbelek zamyka okno
      w.document.querySelector('.ldd-head').click();
      assert.equal(c.activeId,null);
      assert.equal(w.document.querySelector('.ldd-window'),null);
      assert.ok(w.document.querySelector('.ldd-head'));
    }
    c.destroy();
  }
});

test('late adapter does not poison singleton; loader waits for adapter load before inserting controller',()=>{
  const w=new Window(); w.document.addEventListener=()=>{};
  w.eval(controllerSource);
  assert.equal(w._lumiDirectDockInstance,undefined);
  const loaderWindow = new Window();
  const src=fs.readFileSync('components/cc-support-footer.js','utf8');
  const start=src.indexOf('  // 10b.'); const end=src.indexOf('  // 11.',start);
  loaderWindow.eval(src.slice(start,end));
  assert.ok(loaderWindow.document.getElementById('lumiDirectDockAdapterScript'));
  assert.equal(loaderWindow.document.getElementById('lumiDirectDockScript'),null);
  loaderWindow.document.getElementById('lumiDirectDockAdapterScript').dispatchEvent(new loaderWindow.Event('load'));
  assert.ok(loaderWindow.document.getElementById('lumiDirectDockScript'));
  w.createDirectMessagingAdapter=()=>({getCurrentUserId:()=>null});
  assert.ok(w.mountLumiDirectDock());
  assert.ok(w._lumiDirectDockInstance.adapter);
});

test('dock stays above existing full screen messenger and mobile navigation',()=>{
  const css=fs.readFileSync('css/lumi-direct-dock.css','utf8');
  assert.match(css,/z-index:2147483646/);
  assert.match(css,/bottom:max\(88px,calc\(env\(safe-area-inset-bottom\) \+ 76px\)\)/);
});

test('default dock hides all history and settings; only a new incoming sender is revealed',async()=>{
  const {w,c,emit,room}=dockFixture({autoOpen:false});
  const other={...room,id:'alice_other',participant:{id:'other',name:'Other',avatarUrl:'/lumina_icon.jpg'},lastMessageSenderId:'other'};
  emit([room,other]);
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(w.document.querySelector('.ldd-head'),null);
  assert.equal(w.document.querySelector('.ldd-prefs'),null);
  assert.equal(w.document.querySelector('.ldd-more'),null);
  assert.equal(w.document.querySelector('.ldd-root').style.display,'none');
  emit([{...room,lastMessageAt:'2026-10-18T08:01:00Z',lastMessageSenderId:'alice'},other]);
  assert.equal(w.document.querySelector('.ldd-head'),null,'outgoing message does not reveal a shortcut');
  emit([{...room,lastMessageAt:'2026-10-18T08:02:00Z'},other]);
  assert.equal(w.document.querySelectorAll('.ldd-head').length,1);
  assert.equal(w.document.querySelector('.ldd-head').getAttribute('data-chat-id'),room.id);
  assert.equal(w.document.querySelector('.ldd-prefs'),null,'no floating settings wheel');
  w.document.querySelector('.ldd-head').click();
  w.document.querySelector('.ldd-btn-close').click();
  assert.equal(w.document.querySelector('.ldd-root').style.display,'none');
  emit([{...room,lastMessageAt:'2026-10-18T08:02:00Z'},other]);
  assert.equal(w.document.querySelector('.ldd-head'),null,'same snapshot does not restore a dismissed avatar');
  c.destroy();
});

test('composer has a plain placeholder without resize artifacts; mess shares the canonical loader',async()=>{
  const {w,c,emit,room}=dockFixture({autoOpen:false});
  emit([]);emit([room]);w.document.querySelector('.ldd-head').click();
  assert.equal(w.document.querySelector('#ldd-compose-field').getAttribute('placeholder'),'Wiadomość…');
  assert.match(fs.readFileSync('css/lumi-direct-dock.css','utf8'),/resize:none;/);
  const {renderLumiPage}=await import('./lumi-page.mjs');
  const html=renderLumiPage(fs.readFileSync('lumina.html','utf8'));
  assert.doesNotMatch(html,/<script[^>]+src="[^\"]*lumi-direct-dock/);
  assert.match(html,/cc-support-footer\.js/);
  for(const path of ['lumina.html','lumina-profile.html','lumina-tablica.html','lumina-tablica-light.html','lumina.cezaryrgowski.html','lumina.wiolettarogowska.html']) {
    assert.match(fs.readFileSync(path,'utf8'),/lumina-chat-premium\.css\?v=20261018_headerfix2/);
  }
  c.destroy();
});
