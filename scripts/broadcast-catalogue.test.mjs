import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import vm from 'node:vm';
import {Window} from 'happy-dom';

const html = readFileSync('nadawaj.html', 'utf8');
const start = html.indexOf('            const embedModal =');
const end = html.indexOf('\n        });', start);
assert.ok(start > 0 && end > start);
const runtime = html.slice(start, end);
function fixture(clipboard) {
  const win = new Window({url: 'https://polskieradio.cc/nadawaj'});
  win.document.write(html);
  const api = {location: {origin: 'https://polskieradio.cc', protocol: 'https:'}};
  const opened = [];
  api.open = (...args) => opened.push(args);
  vm.runInNewContext(runtime, {
    window: api, document: win.document, navigator: {clipboard}, URL,
    setTimeout: () => 0,
  });
  return {win, api, opened, modal: win.document.getElementById('embedModal'),
    area: win.document.getElementById('embedCodeArea'),
    toast: win.document.getElementById('toastNotification')};
}

test('all 19 scenes use the same existing destination for preview, OBS, embed and share', () => {
  const {win} = fixture();
  const cards = [...win.document.querySelectorAll('.broadcast-card')];
  assert.equal(cards.length, 19);
  const seen = new Set();
  for (const card of cards) {
    const url = card.querySelector('.card-title a').getAttribute('href');
    assert.ok(existsSync(url), url);
    assert.equal(seen.has(url), false, url);
    seen.add(url);
    assert.equal(card.querySelector('.card-img-wrapper').getAttribute('href'), url);
    for (const button of card.querySelectorAll('[onclick]')) {
      const action = button.getAttribute('onclick');
      if (/^(copyAndOpenOBS|openEmbedModal|shareOnFacebook|shareOnWhatsApp)\(/.test(action)) {
        assert.equal(action.match(/\('([^']+)'\)/)[1], url, action);
      }
    }
  }
  assert.equal(win.document.querySelectorAll('.broadcast-card iframe').length, 0);
});

test('OBS copies the exact scene URL without opening extra players', async () => {
  const copied = [];
  const {api, opened, toast, modal} = fixture({writeText: async text => copied.push(text)});
  await api.copyAndOpenOBS('kino-live.html');
  assert.deepEqual(copied, ['https://polskieradio.cc/kino-live.html']);
  assert.equal(opened.length, 0);
  assert.equal(modal.classList.contains('show'), false);
  assert.match(toast.textContent, /Adres skopiowany/);
});

for (const [name, clipboard] of [
  ['missing', undefined],
  ['denied', {writeText: async () => {throw new Error('denied');}}],
]) {
  test(`clipboard ${name}: manual selection, no false success, Escape restores focus`, async () => {
    const {api, win, modal, area, toast} = fixture(clipboard);
    const trigger = win.document.querySelector('.btn-obs');
    trigger.focus();
    await api.copyAndOpenOBS('master-live.html');
    assert.equal(modal.classList.contains('show'), true);
    assert.equal(area.value, 'https://polskieradio.cc/master-live.html');
    assert.equal(win.document.activeElement, area);
    assert.equal(toast.textContent, '');
    await api.copyEmbedCode();
    assert.equal(modal.classList.contains('show'), true);
    assert.match(win.document.getElementById('embedModalHelp').textContent, /Nie udało się/);
    area.dispatchEvent(new win.KeyboardEvent('keydown', {key: 'Escape', bubbles: true, cancelable: true}));
    assert.equal(modal.classList.contains('show'), false);
    assert.equal(win.document.activeElement, trigger);
  });
}

test('embed code is copied only after confirmation by the clipboard', async () => {
  const copied = [];
  const {api, modal, area} = fixture({writeText: async text => copied.push(text)});
  api.openEmbedModal('stream-scene-vertical.html');
  assert.match(area.value, /src="https:\/\/polskieradio.cc\/stream-scene-vertical.html"/);
  assert.equal(modal.classList.contains('show'), true);
  await api.copyEmbedCode();
  assert.equal(copied[0], area.value);
  assert.equal(modal.classList.contains('show'), false);
});

test('only known catalogue entries can be embedded or copied', async () => {
  const {api} = fixture();
  for (const url of ['https://example.com', 'javascript:alert(1)', '../private', 'master']) {
    assert.throws(() => api.openEmbedModal(url), /Unknown catalogue scene/);
    await assert.rejects(api.copyAndOpenOBS(url), /Unknown catalogue scene/);
  }
});

test('copy dialog is named and traps keyboard focus in both directions', () => {
  const {api, win, modal} = fixture();
  api.openEmbedModal('master-live.html');
  assert.equal(modal.getAttribute('role'), 'dialog');
  assert.equal(modal.getAttribute('aria-modal'), 'true');
  assert.ok(win.document.getElementById(modal.getAttribute('aria-labelledby')));
  assert.ok(win.document.getElementById(modal.getAttribute('aria-describedby')));
  const first = modal.querySelector('.modal-close');
  const last = modal.querySelector('.copy-btn');
  last.focus();
  last.dispatchEvent(new win.KeyboardEvent('keydown', {key:'Tab', bubbles:true, cancelable:true}));
  assert.equal(win.document.activeElement, first);
  first.dispatchEvent(new win.KeyboardEvent('keydown', {key:'Tab', shiftKey:true, bubbles:true, cancelable:true}));
  assert.equal(win.document.activeElement, last);
});

test('catalogue has no unverified live-preview claim and grid adapts to narrow screens', () => {
  assert.doesNotMatch(html, /OGLĄDAJ NA ŻYWO|WATCH LIVE|Uruchom w OBS/);
  assert.match(html, /Katalog nie jest wskaźnikiem trwającej transmisji/);
  assert.match(html, /minmax\(min\(100%, 340px\), 1fr\)/);
  assert.match(html, /@media \(max-width: 768px\)\s*{\s*\.cards-grid/);
  assert.match(html, /\.copy-btn\s*{\s*min-height: 44px/);
});

test('Apocalypse lesson count matches the actual registry and runtime uses its length', () => {
  const scene = readFileSync('apokalipsa-ksiega-nadziei-live.html', 'utf8');
  const registry = scene.match(/const LESSONS_25\s*=\s*(\[[\s\S]*?\n        \]);/);
  assert.ok(registry);
  const lessons = vm.runInNewContext(registry[1]);
  assert.equal(lessons.length, 28);
  assert.equal(new Set(lessons.map(l => l.id)).size, 28);
  assert.equal(lessons[27].id, '2JjWOb3bWiA');
  const canonical = JSON.parse(readFileSync('data/kurs-apokalipsa-odcinki.json', 'utf8')).episodesChronological;
  assert.deepEqual(Array.from(lessons.slice(0,25), l => l.id), canonical.map(l => l.videoId));
  // Total series count confirmed directly by owner on 2026-10-17;
  // selectable player count must still come from actually registered recordings.
  assert.match(html, /28 lekcji cyklu/);
  assert.match(scene, /lesson.ep \+ ' \/ ' \+ LESSONS_25.length/);
  assert.doesNotMatch(scene, /% 25\b|z 25'|LEKCJA 1 \/ 25/);
});

test('player loads all registered videos, starts at lesson 28 and wraps to lesson 1', () => {
  const scene = readFileSync('apokalipsa-ksiega-nadziei-live.html', 'utf8');
  const registry = scene.match(/const LESSONS_25\s*=\s*(\[[\s\S]*?\n        \]);/)[1];
  const init = scene.slice(scene.indexOf('        function onYouTubeIframeAPIReady()'), scene.indexOf("        window.addEventListener('message'"));
  const state = scene.slice(scene.indexOf('        function onPlayerStateChange(event)'), scene.indexOf('        function enableAudio()'));
  let config, loaded, playedIndex;
  const player = {loadPlaylist: options => {loaded = options;}, playVideo(){}, mute(){}, getPlaylistIndex:()=>27, playVideoAt: index=>{playedIndex=index;}};
  const win = {location:{origin:'https://polskieradio.cc',search:'?muted=1'}};
  win.self=win; win.top=win;
  const ctx = vm.createContext({window:win, document:{}, console, URLSearchParams, getDayOfYear:()=>28,
    updateEpisodeUI(){}, disableCaptions(){}, resetAutoFadeTimer(){}, setTimeout(){},
    YT:{Player:function(id, options){config=options;return player;},PlayerState:{ENDED:0,PLAYING:1,BUFFERING:3}},
    player, initialJumpDone:false});
  vm.runInContext('const LESSONS_25 = '+registry+';\n'+init+'\n'+state, ctx);
  ctx.onYouTubeIframeAPIReady();
  assert.equal(config.videoId, '2JjWOb3bWiA');
  ctx.onPlayerReady({target:player});
  assert.equal(loaded.playlist.length,28);
  assert.equal(loaded.playlist[27],'2JjWOb3bWiA');
  assert.equal(loaded.index,27);
  ctx.onPlayerStateChange({data:0});
  assert.equal(playedIndex,0);
});

test('initial dates never flash an obsolete July date; global Bible title is accurate', () => {
  for (const file of ['cctv24-worship.html', 'bibleaudio-global.html']) {
    assert.match(readFileSync(file, 'utf8'), /id="clockDateLabel">—<\/div>/);
    assert.match(readFileSync(file, 'utf8'), /id="timeHour">--<\/span>/);
  }
  assert.match(readFileSync('bibleaudio-global.html', 'utf8'), /<title>Bible Audio Global \| Christian Culture<\/title>/);
});
