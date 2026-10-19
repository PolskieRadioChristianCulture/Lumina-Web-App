import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { Window } from 'happy-dom';

test('CCTvDialogue.chatSessionStart ensures reflection persistence throughout the day', async () => {
  const src = await readFile('js/cc-tv-dialogue.js', 'utf8');
  const ctx = { window: {} }; ctx.globalThis = ctx.window; vm.runInNewContext(src, ctx);
  const D = ctx.window.CCTvDialogue;
  assert.ok(typeof D.chatSessionStart === 'function', 'chatSessionStart is exported');
  assert.ok(typeof D.todaySessionStarts === 'function', 'todaySessionStarts is exported');

  // Test scenarios on 2026-10-19 (Europe/Warsaw is UTC+2 CEST):
  // 09:00 Warsaw = 07:00 UTC
  // 10:00 Warsaw = 08:00 UTC
  // 11:00 Warsaw = 09:00 UTC
  // 18:00 Warsaw = 16:00 UTC

  // 1. Before 09:00 Warsaw (e.g. 06:30 UTC = 08:30 Warsaw) -> returns 07:00 UTC (09:00 Warsaw)
  const beforeFirst = Date.parse('2026-10-19T06:30:00Z');
  assert.equal(new Date(D.chatSessionStart(beforeFirst)).toISOString(), '2026-10-19T07:00:00.000Z');

  // 2. During 09:00 session (07:15 UTC = 09:15 Warsaw) -> returns 07:00 UTC (09:00 Warsaw, running)
  const duringFirst = Date.parse('2026-10-19T07:15:00Z');
  assert.equal(new Date(D.chatSessionStart(duringFirst)).toISOString(), '2026-10-19T07:00:00.000Z');

  // 3. Between 09:00 and 10:00 sessions (07:45 UTC = 09:45 Warsaw) -> returns 07:00 UTC (past session, NOT 10:00!)
  const between1and2 = Date.parse('2026-10-19T07:45:00Z');
  assert.equal(new Date(D.chatSessionStart(between1and2)).toISOString(), '2026-10-19T07:00:00.000Z');

  // 4. During 10:00 session (08:15 UTC = 10:15 Warsaw) -> returns 08:00 UTC (10:00 Warsaw, running)
  const duringSecond = Date.parse('2026-10-19T08:15:00Z');
  assert.equal(new Date(D.chatSessionStart(duringSecond)).toISOString(), '2026-10-19T08:00:00.000Z');

  // 5. Noon (10:00 UTC = 12:00 Warsaw, between 11:00 and 18:00 session) -> returns 09:00 UTC (11:00 Warsaw, past session!)
  const noon = Date.parse('2026-10-19T10:00:00Z');
  assert.equal(new Date(D.chatSessionStart(noon)).toISOString(), '2026-10-19T09:00:00.000Z');

  // 6. During 18:00 session (16:15 UTC = 18:15 Warsaw) -> returns 16:00 UTC (18:00 Warsaw, running)
  const duringEvening = Date.parse('2026-10-19T16:15:00Z');
  assert.equal(new Date(D.chatSessionStart(duringEvening)).toISOString(), '2026-10-19T16:00:00.000Z');

  // 7. Evening after 18:00 session (18:00 UTC = 20:00 Warsaw) -> returns 16:00 UTC (18:00 Warsaw, past session!)
  const lateEvening = Date.parse('2026-10-19T18:00:00Z');
  assert.equal(new Date(D.chatSessionStart(lateEvening)).toISOString(), '2026-10-19T16:00:00.000Z');
});

test('LUMI Messenger: Noemi and Sara reflection remains visible at noon in public chat and room tv_zapolske', async () => {
  const page = await readFile('lumina.html', 'utf8');
  const renderer = page.match(/function renderPublicChatMessages\(messages\) \{[\s\S]*?\n        \}/)?.[0];
  assert.ok(renderer);

  const tvSrc = await readFile('js/cc-tv-dialogue.js', 'utf8');
  const liveSrc = (await readFile('js/lumi-live-rooms.js', 'utf8'))
    .replace(/^import[\s\S]*?from '[^']+';\r?$/gm, '')
    .replace('export const LIVE_ROOMS', 'const LIVE_ROOMS');

  const w = new Window();
  w.document.body.innerHTML = `
    <div id="messengerPublicView">
      <div id="publicChatMessagesBox"></div>
    </div>
    <div id="tabBtnPrivateChat"></div>
  `;

  // Simulated noon time: 2026-10-19 12:00 Warsaw (10:00 UTC)
  const fakeNow = Date.parse('2026-10-19T10:00:00Z');

  const window = {
    Date: class extends globalThis.Date {
      constructor(...args) {
        if (args.length === 0) super(fakeNow);
        else super(...args);
      }
      static now() { return fakeNow; }
    },
    LuminaDB: { getCurrentUser: () => ({ uid: 'viewer' }), getCurrentProfile: () => null, normalizeChatUserId: id => id },
    renderPublicChatMessages: null,
    _cachedPublicChatMessages: [],
    switchMessengerMainTab: () => {}
  };

  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const context = vm.createContext({
    window,
    document: w.document,
    console,
    URLSearchParams,
    location: { search: '' },
    setInterval() {},
    setTimeout(fn) { if (typeof fn === 'function') fn(); },
    Date: window.Date,
    getApps: () => [],
    formatChatTime: () => '11:03',
    escapeHtml: escape,
    escapeForInlineJs: value => String(value ?? '').replace(/'/g, "\\'"),
    renderChatMedia: text => text,
    scrollChatToBottom() {},
    localStorage: { getItem: () => null }
  });

  // Run CCTvDialogue
  vm.runInContext(tvSrc, context);
  const D = context.window.CCTvDialogue;

  // Run lumi-live-rooms.js
  vm.runInContext(liveSrc, context);

  // Setup public chat renderer
  vm.runInContext(renderer, context);
  window.renderPublicChatMessages = context.renderPublicChatMessages;

  // Seed today's reflection session with dialogue
  const script = [
    '🔴 WERSJA CZWARTA: ROZWAŻANIE TELEWIZYJNE',
    '[INTRO]',
    'Noemi: Pokój Boży wszystkim obecnym!',
    'Sara: Witamy w dzisiejszym rozważaniu.',
    '[MANIFEST]',
    'Noemi i Sara: Amen!'
  ].join('\n');
  const parsed = D.parse(script);
  const tl = D.timeline(parsed.messages, false);
  const session = context.window.LumiLiveRooms.session();
  session.day = '2026-10-19';
  session.title = 'Boża Łaska';
  session.tl = tl;
  session.liveStart = D.chatSessionStart(fakeNow);
  session.items = tl.map((e, i) => ({
    i, kind: e.m.kind, text: e.m.text, section: e.m.section,
    typingAt: session.liveStart + e.typingAt, at: session.liveStart + e.showAt
  }));
  session.total = tl[tl.length - 1].endAt;
  session.ready = true;

  // Verify that at noon (fakeNow = 12:00 Warsaw), session.liveStart is 11:00 Warsaw (past session), so all messages have at <= fakeNow!
  assert.ok(session.items.length > 0);
  assert.ok(session.items.every(m => m.at <= fakeNow), 'All reflection messages are in the past and thus readable at noon');

  // 1. Verify Public Chat Integration:
  vm.runInContext('hookPublicChat();', context);
  window.renderPublicChatMessages([{ id: 'msg1', senderId: 'u1', senderName: 'Jan', text: 'Dzień dobry!', timestamp: { seconds: Math.floor(fakeNow / 1000) } }]);

  const publicBox = w.document.getElementById('publicChatMessagesBox');
  const rows = [...publicBox.querySelectorAll('.lumina-msg-row')];
  const hostRows = rows.filter(r => r.dataset.messageId && r.dataset.messageId.startsWith('cctv-2026-10-19-'));
  assert.equal(hostRows.length, 3, 'All 3 reflection messages are visible in public chat at noon');

  // Verify badge is 📺 Rozważanie · CCTV24 (not live, but present!)
  for (const hr of hostRows) {
    assert.match(hr.innerHTML, /Rozważanie · CCTV24/);
  }

  // 2. Verify Room tv_zapolske Integration:
  context.window.LumiLiveRooms.enterRoom('tv_zapolske');
  const roomBox = w.document.getElementById('llrBox');
  assert.ok(roomBox, 'llrBox rendered for tv_zapolske');

  const roomHosts = [...roomBox.querySelectorAll('.llr-msg.host')];
  assert.equal(roomHosts.length, 3, 'All 3 reflection messages are visible in room tv_zapolske at noon');

  // Verify room note announces upcoming broadcast or reflection, NOT a false countdown to morning
  const roomNotes = [...roomBox.querySelectorAll('.llr-note')];
  assert.ok(roomNotes.some(n => n.textContent.includes('Rozważanie Noemi i Sary')), 'Note displays reflection title and repeat info');
  assert.ok(roomNotes.some(n => n.textContent.includes('Kolejna transmisja na żywo o 18:00')), 'Note displays next session at 18:00');
});

test('LUMI Messenger: during live 09:15 session, messages stream and badge shows NA ŻYWO', async () => {
  const page = await readFile('lumina.html', 'utf8');
  const renderer = page.match(/function renderPublicChatMessages\(messages\) \{[\s\S]*?\n        \}/)?.[0];
  assert.ok(renderer);

  const tvSrc = await readFile('js/cc-tv-dialogue.js', 'utf8');
  const liveSrc = (await readFile('js/lumi-live-rooms.js', 'utf8'))
    .replace(/^import[\s\S]*?from '[^']+';\r?$/gm, '')
    .replace('export const LIVE_ROOMS', 'const LIVE_ROOMS');

  const w = new Window();
  w.document.body.innerHTML = `
    <div id="messengerPublicView">
      <div id="publicChatMessagesBox"></div>
    </div>
    <div id="tabBtnPrivateChat"></div>
  `;

  // Live session at 09:15 Warsaw (07:15 UTC)
  const liveNow = Date.parse('2026-10-19T07:15:00Z');

  const window = {
    Date: class extends globalThis.Date {
      constructor(...args) {
        if (args.length === 0) super(liveNow);
        else super(...args);
      }
      static now() { return liveNow; }
    },
    LuminaDB: { getCurrentUser: () => ({ uid: 'viewer' }), getCurrentProfile: () => null, normalizeChatUserId: id => id },
    renderPublicChatMessages: null,
    _cachedPublicChatMessages: [],
    switchMessengerMainTab: () => {}
  };

  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const context = vm.createContext({
    window,
    document: w.document,
    console,
    URLSearchParams,
    location: { search: '' },
    setInterval() {},
    setTimeout(fn) { if (typeof fn === 'function') fn(); },
    Date: window.Date,
    getApps: () => [],
    formatChatTime: () => '09:15',
    escapeHtml: escape,
    escapeForInlineJs: value => String(value ?? '').replace(/'/g, "\\'"),
    renderChatMedia: text => text,
    scrollChatToBottom() {},
    localStorage: { getItem: () => null }
  });

  vm.runInContext(tvSrc, context);
  const D = context.window.CCTvDialogue;
  vm.runInContext(liveSrc, context);
  vm.runInContext(renderer, context);
  window.renderPublicChatMessages = context.renderPublicChatMessages;

  const script = [
    '🔴 WERSJA CZWARTA: ROZWAŻANIE TELEWIZYJNE',
    '[INTRO]',
    'Noemi: Dzień dobry!',
    'Sara: Witamy w programie.'
  ].join('\n');
  const parsed = D.parse(script);
  const tl = D.timeline(parsed.messages, false);
  const session = context.window.LumiLiveRooms.session();
  session.day = '2026-10-19';
  session.title = 'Rozpoczęcie Dnia';
  session.tl = tl;
  session.liveStart = D.chatSessionStart(liveNow);
  session.items = tl.map((e, i) => ({
    i, kind: e.m.kind, text: e.m.text, section: e.m.section,
    typingAt: session.liveStart + e.typingAt, at: session.liveStart + e.showAt
  }));
  session.total = 35 * 60 * 1000;
  session.ready = true;

  vm.runInContext('hookPublicChat();', context);
  window.renderPublicChatMessages([]);

  const publicBox = w.document.getElementById('publicChatMessagesBox');
  const rows = [...publicBox.querySelectorAll('.lumina-msg-row')];
  const hostRows = rows.filter(r => r.dataset.messageId && r.dataset.messageId.startsWith('cctv-2026-10-19-'));
  assert.ok(hostRows.length > 0);
  assert.ok(hostRows.every(r => r.innerHTML.includes('NA ŻYWO · CCTV24')), 'Badge displays NA ŻYWO during broadcast');

  context.window.LumiLiveRooms.enterRoom('tv_zapolske');
  const roomBox = w.document.getElementById('llrBox');
  const roomNotes = [...roomBox.querySelectorAll('.llr-note')];
  assert.ok(roomNotes.some(n => n.textContent.includes('NA ŻYWO: rozważanie')), 'Room displays live status note');
});

