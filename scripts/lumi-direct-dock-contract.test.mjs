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
  for (const path of ['/lumina-db.js?v=old','/components/lumi-direct-dock.js?v=old','/components/lumi-direct-dock-adapter.js?v=old','/components/cc-support-footer.js','/firebase-messaging-sw.js']) {
    const result = await handler({url:'https://polskieradio.cc'+path,method:'GET'}, {ASSETS:{fetch:async()=>new Response('script',{headers:{'Cache-Control':'public, max-age=604800, no-cache'}})}});
    assert.equal(result.headers.get('Cache-Control'),'no-cache, no-store, must-revalidate');
    assert.equal(await result.text(),'script');
  }
  assert.match(fs.readFileSync('components/cc-support-footer.js','utf8'),/lumi-direct-dock\.js\?v=20261018_directfix1/);
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
