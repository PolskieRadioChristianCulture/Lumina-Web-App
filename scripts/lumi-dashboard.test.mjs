import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
import { Window } from 'happy-dom';
import { renderLumiDashboard } from './lumi-dashboard.mjs';
import { renderLumiPage } from './lumi-page.mjs';
const source = await readFile('js/lumi-dashboard.js', 'utf8');
const windows = [];
after(async () => { for (const win of windows) await win.happyDOM.close(); });
function fixture(loggedIn = false) {
  const win = new Window({ url: 'https://polskieradio.cc/mess', settings: { disableJavaScriptFileLoading: true, disableCSSFileLoading: true, disableIframePageLoading: true } });
  windows.push(win); win.document.body.innerHTML = renderLumiDashboard();
  let user = loggedIn ? { uid: 'fixture-owner' } : null;
  const snapshots = [], opens = [], radioStates = [], plays = [];
  const people = [
    { id: 'formation-peer', slug: 'formation-peer', name: 'Próba Formacja', desc: 'Studium biblijne', badge: 'Formacja' },
    { id: 'mission-peer', slug: 'mission-peer', name: 'Próba Misja', desc: 'Misja i służba', badge: 'Misja' },
    { id: 'community-peer', slug: 'community-peer', name: 'Próba Społeczność', desc: 'Wspólnota', badge: 'Społeczność' }
  ];
  win.CCGlobalChat = { getMembers: () => people };
  win.LuminaDB = {
    getCurrentUser: () => user,
    getCurrentProfile: () => user ? { uid: user.uid, slug: user.uid } : null,
    subscribeToUserChats: (uid, fn) => { const item = { uid, fn, stopped: false }; snapshots.push(item); return () => { item.stopped = true; }; }
  };
  win._luminaUnreadRoomsMap = new Map([['community-peer', 3]]);
  win.CCUnifiedChat = { openCurrent: request => opens.push(request) };
  const stations = ['poland', 'global', 'biblia_audio', 'global_biblia', 'instrumental_worship', 'biblia_spiewana'].map(id => ({ id, name: id }));
  let radio = { stationId: 'poland', playing: false, status: 'Wstrzymano' };
  win.CCChatRadio = {
    stations, prepare: async () => {}, state: () => radio,
    subscribe: fn => { radioStates.push(fn); fn(radio); return () => {}; },
    select: id => { radio = { ...radio, stationId: id }; radioStates.forEach(fn => fn(radio)); },
    pause: () => { radio = { ...radio, playing: false }; radioStates.forEach(fn => fn(radio)); },
    play: () => { plays.push(radio.stationId); radio = { ...radio, playing: true, status: 'Odtwarza' }; radioStates.forEach(fn => fn(radio)); }
  };
  win.CCChatRadioReady = Promise.resolve();
  vm.runInNewContext(source, { window: win, document: win.document, location: win.location, URL, console, setTimeout: () => 0 });
  win.document.dispatchEvent(new win.Event('DOMContentLoaded'));
  return { win, people, snapshots, opens, plays, setUser: next => { user = next; win.dispatchEvent(new win.CustomEvent('lumina-auth-state')); } };
}
const settle = async () => { for (let i = 0; i < 6; i++) await Promise.resolve(); };

test('reference dashboard is rendered by the canonical /mess generator, preserving native chat and installation', async () => {
  const output = renderLumiPage(await readFile('lumina.html', 'utf8'));
  assert.match(output, /lumi-messenger-design\.css\?v=/);
  assert.match(output, /lumi-dashboard\.js\?v=/);
  for (const id of ['directMessagesModal', 'activeChatInput', 'lumiLanding', 'lumiOpen', 'lumiInstallHelp', 'lumiRadioPlay', 'lumiConversationCards']) assert.ok(output.includes(`id="${id}"`), id);
  assert.doesNotMatch(output, /247 osób|12:18 · Dziękuję|data-status="online"/);
});

test('search and category filters operate on actual supplied records rather than reference screenshot text', () => {
  const { win } = fixture();
  assert.equal(win.document.querySelectorAll('.lumi-conversation-card').length, 3);
  win.document.querySelector('[data-lumi-category="formation"]').click();
  assert.equal(win.document.querySelectorAll('.lumi-conversation-card').length, 1);
  assert.match(win.document.getElementById('lumiConversationCards').textContent, /Próba Formacja/);
  win.document.querySelector('[data-lumi-category="all"]').click();
  const input = win.document.getElementById('lumiDirectorySearch'); input.value = 'Misja'; input.dispatchEvent(new win.Event('input'));
  assert.equal(win.document.querySelectorAll('.lumi-conversation-card').length, 1);
  assert.match(win.document.getElementById('lumiConversationCards').textContent, /Próba Misja/);
});

test('private preview and unread badge require an authenticated own-room snapshot; logout clears both', () => {
  const f = fixture(true);
  f.snapshots[0].fn([{ id: 'fixture-room', participants: ['fixture-owner', 'community-peer'], users: ['fixture-owner', 'community-peer'], lastSenderId: 'community-peer', lastMessageText: 'PRYWATNY TEKST TESTOWY', lastMessageTimestamp: 1234567890000 }]);
  assert.match(f.win.document.getElementById('lumiConversationCards').textContent, /PRYWATNY TEKST TESTOWY/);
  assert.equal(f.win.document.querySelector('.lumi-card-unread').textContent, '3');
  f.setUser(null);
  assert.ok(f.snapshots[0].stopped);
  assert.doesNotMatch(f.win.document.getElementById('lumiConversationCards').textContent, /PRYWATNY TEKST TESTOWY/);
  assert.equal(f.win.document.querySelector('.lumi-card-unread'), null);
  assert.ok(f.win.document.getElementById('lumiNotificationCount').hidden);
});

test('snapshot arriving after account switch cannot populate another account dashboard', () => {
  const f = fixture(true); const stale = f.snapshots[0].fn;
  f.setUser({ uid: 'fixture-second-owner' });
  stale([{ id: 'old-room', users: ['fixture-owner', 'community-peer'], lastSenderId: 'community-peer', lastMessageText: 'STARY PRYWATNY TEKST' }]);
  assert.doesNotMatch(f.win.document.getElementById('lumiConversationCards').textContent, /STARY PRYWATNY/);
  assert.equal(f.snapshots[1].uid, 'fixture-second-owner');
});

test('untrusted profile and message fields stay text; card opens the real selected peer in canonical chat', () => {
  const f = fixture(true);
  f.people[2].name = '<img src=x onerror=alert(1)>';
  f.win.LumiDashboard.render();
  assert.equal(f.win.document.querySelector('[onerror]'), null);
  const cards = f.win.document.querySelectorAll('.lumi-conversation-card'); cards[2].click();
  assert.equal(f.opens[0].partner, 'community-peer');
  assert.equal(f.opens[0].tab, 'private');
});

test('header exposes the six existing stations and controls the same player truthfully', async () => {
  const f = fixture(); await settle();
  const select = f.win.document.getElementById('lumiRadioSelect');
  assert.equal(select.options.length, 6);
  assert.equal(f.win.document.getElementById('lumiRadioPlay').disabled, false);
  select.value = 'biblia_spiewana'; select.dispatchEvent(new f.win.Event('change')); await settle();
  f.win.document.getElementById('lumiRadioPlay').click();
  assert.deepEqual(f.plays, ['biblia_spiewana']);
  assert.equal(f.win.document.getElementById('lumiRadioPlay').getAttribute('aria-label'), 'Wstrzymaj radio');
  f.win.document.getElementById('lumiRadioPlay').click();
  assert.equal(f.win.document.getElementById('lumiRadioPlay').getAttribute('aria-label'), 'Włącz radio');
});

test('canonical standalone guest chat is visibly open rather than hidden by the page shell', async () => {
  const win = new Window({ url: 'https://polskieradio.cc/mess', settings: { disableJavaScriptFileLoading: true, disableCSSFileLoading: true, disableIframePageLoading: true } });
  windows.push(win); win.document.body.className = 'lumi-standalone user-is-guest';
  win.document.body.innerHTML = '<div id="directMessagesModal"></div><div id="chatSettingsModal"></div>';
  const style = win.document.createElement('style'); style.textContent = await readFile('css/lumi-standalone.css', 'utf8'); win.document.head.appendChild(style);
  const context = { window: win, document: win.document, location: win.location, localStorage: win.localStorage, URLSearchParams, console, setTimeout: () => 0, clearTimeout: () => {} };
  win.CCRadioStations = []; win.CCRadioMilion = true; win.CCChatRadio = { stations: [], prepare: async () => {}, subscribe: () => () => {} };
  vm.runInNewContext(await readFile('components/cc-global-chat-button.js', 'utf8'), context);
  win.document.dispatchEvent(new win.Event('DOMContentLoaded'));
  vm.runInNewContext(await readFile('js/cc-chat-integration.js', 'utf8'), context);
  win.CCGlobalChat.open('live');
  const overlay = win.document.getElementById('ccGlobalChatOverlay');
  assert.equal(win.getComputedStyle(overlay).display, 'flex');
  assert.equal(win.getComputedStyle(overlay).visibility, 'visible');
});
