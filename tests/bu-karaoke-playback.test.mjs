import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';

const root = process.env.KARAOKE_ROOT || process.cwd();
const require = createRequire(path.join(process.env.KARAOKE_DEPS || root, 'package.json'));
const { Window } = require('happy-dom');
const source = fs.readFileSync(path.join(root, 'assets/bu/karaoke-top100.js'), 'utf8');

function fixture(options = {}) {
  const window = new Window({ url: 'http://localhost/' });
  const document = window.document;
  document.body.innerHTML = `<div id="hero-karaoke-stage"><div>
    <h2 id="hero-karaoke-title"></h2><span id="hero-karaoke-badge"></span>
    <button id="tab-mode-reading"></button><button id="tab-mode-sync"></button>
    <span id="hero-sync-status-indicator"></span>
    <div id="hero-karaoke-viewport"><div id="hero-karaoke-lines"></div></div>
  </div></div><div id="player-section"><div class="master-player-card"><div class="player-deck"></div></div></div>`;
  let seconds = 0;
  let duration = 100;
  let tick;
  let videoId = 'video-A';
  const seeks = [];
  const pending = new Map();
  window.PLAYLIST_DATA = [{ chapterId: 'GEN-001', videoId: 'video-A' }];
  window.CURRENT_TRACK_INDEX = 0;
  window.ytPlayer = {
    getCurrentTime: () => seconds, getDuration: () => duration,
    getVideoData: () => ({ video_id: videoId }), seekTo: value => seeks.push(value)
  };
  const sync = (id) => ({ chapterId: id, videoId: 'video-A', status: 'SYNC_READY', duration: 100,
    lines: Array.from({ length: 8 }, (_, i) => ({ start: i * 10, end: i * 10 + 8,
      text: `Linia ${i}`, words: options.noWordBoundaries ? undefined : [{ text: 'Linia', start: i * 10, end: i * 10 + 2 },
        { text: String(i), start: i * 10 + 5, end: i * 10 + 8 }] })) });
  const lyrics = id => ({ book: id, chapter: 1, verses: [{ verse: 1, text: 'Tekst' }] });
  const fetch = async (url) => {
    const id = /\/([^/]+)\.json/.exec(url)?.[1];
    if (pending.has(id)) await pending.get(id).promise;
    return { ok: true, json: async () => url.includes('/bible/') ? lyrics(id) : url.includes('/bu-karaoke/') ? sync(id) : { items: [] } };
  };
  const context = vm.createContext({ window, document, localStorage: window.localStorage,
    fetch, console, URL, setInterval: callback => { tick = callback; return 1; }, clearInterval: () => { tick = null; },
    alert: () => {}, setTimeout, clearTimeout });
  vm.runInContext(source, context);
  return { window, document, seeks, pending, api: window.CC_BU_FEATURES,
    setTime: value => { seconds = value; tick?.(); }, setDuration: value => { duration = value; },
    setVideo: value => { videoId = value; }, tick: () => tick?.(), sync,
    active: () => document.querySelector('.bu-line.active')?.dataset.index,
    load: id => window.startChapterKaraoke(id, 'sync') };
}

test('karaoke follows only the selected chapter and loaded video', async () => {
  const f = fixture();
  await f.load('GEN-001');
  f.setTime(12);
  assert.equal(f.active(), '1');
  f.setVideo('previous-video'); f.tick();
  assert.equal(f.active(), undefined);
  f.document.querySelectorAll('.bu-line')[2].click();
  assert.equal(f.seeks.length, 0);
  f.setVideo('video-A');
  await f.load('EXO-001');
  f.setTime(12);
  assert.equal(f.active(), undefined);
  f.document.querySelector('.bu-line').click();
  assert.equal(f.seeks.length, 0);
});

test('video duration differences never stretch cues; line seeking respects saved offset', async () => {
  const f = fixture();
  await f.load('GEN-001');
  f.setDuration(200);
  f.api.adjustOffset(500);
  f.document.querySelectorAll('.bu-line')[2].click();
  assert.equal(f.seeks.at(-1), 19.5);
  f.setTime(f.seeks.at(-1));
  assert.equal(f.active(), '2');
});

test('seeking backwards and instrumental gaps remove stale word highlighting', async () => {
  const f = fixture();
  await f.load('GEN-001');
  f.setTime(12); f.setTime(2);
  const future = f.document.querySelectorAll('.bu-line')[1];
  assert.equal(future.querySelectorAll('.is-singing, .is-sung').length, 0);
  f.setTime(9);
  assert.equal(f.document.querySelectorAll('.is-singing').length, 0);
  assert.equal(f.document.querySelector('.bu-line.active').classList.contains('is-holding'), true);
  f.setTime(100);
  assert.equal(f.document.querySelectorAll('.is-singing').length, 0);
});

test('a pause between words is never painted as a sung word', async () => {
  const f = fixture();
  await f.load('GEN-001');
  f.setTime(1);
  assert.equal(f.document.querySelectorAll('.is-singing').length, 1);
  f.setTime(3);
  assert.equal(f.document.querySelectorAll('.is-singing').length, 0);
  assert.equal(f.document.querySelectorAll('.is-sung').length, 1);
  f.setTime(6);
  assert.equal(f.document.querySelectorAll('.is-singing').length, 1);
  f.setTime(9);
  assert.equal(f.document.querySelector('.bu-line.active').classList.contains('is-holding'), true);
});

test('a line timestamp cannot fabricate word timestamps', async () => {
  const f = fixture({ noWordBoundaries: true });
  await f.load('GEN-001');
  f.setTime(1);
  assert.equal(f.active(), '0');
  assert.equal(f.document.querySelectorAll('.is-singing').length, 0);
  assert.match(f.document.querySelector('.bu-line').textContent, /Linia/);
});

test('manual scrolling suspends following and the button restores it', async () => {
  const f = fixture();
  await f.load('GEN-001');
  const viewport = f.document.getElementById('hero-karaoke-viewport');
  const follow = f.document.getElementById('bu-follow-btn');
  viewport.dispatchEvent(new f.window.Event('wheel'));
  assert.equal(follow.getAttribute('aria-pressed'), 'false');
  f.api.setAutoScroll(true);
  assert.equal(follow.getAttribute('aria-pressed'), 'true');
  f.api.setDisplayMode('lines');
  assert.equal(f.document.getElementById('bu-display-lines-btn').getAttribute('aria-pressed'), 'true');
  assert.equal(f.document.getElementById('bu-display-words-btn').getAttribute('aria-pressed'), 'false');
});

test('a delayed chapter response cannot replace the most recent selection', async () => {
  const f = fixture();
  await f.load('GEN-001');
  let resolve;
  f.pending.set('EXO-001', { promise: new Promise(r => { resolve = r; }) });
  const oldRequest = f.load('EXO-001');
  await f.load('LEV-001');
  resolve(); await oldRequest;
  assert.match(f.document.getElementById('hero-karaoke-title').textContent, /LEV-001/);
});

test('closing the panel cancels rendering from pending requests', async () => {
  const f = fixture();
  await f.load('GEN-001');
  let resolve;
  f.pending.set('NUM-001', { promise: new Promise(r => { resolve = r; }) });
  const request = f.load('NUM-001');
  f.api.closeHeroKaraoke();
  resolve(); await request;
  assert.equal(f.document.getElementById('hero-karaoke-stage').style.display, 'none');
  assert.equal(f.document.querySelectorAll('.bu-line').length, 0);
});
