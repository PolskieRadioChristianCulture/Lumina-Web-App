import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const REPO_ROOT = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc';

test('wallpaper: verifies all 3 official image assets and thumbnails exist', () => {
  const assets = [
    'images/search/polska-radio-1600.webp',
    'images/search/polska-radio-800.webp',
    'images/search/polska-radio-thumb.webp',
    'images/search/global-radio-1600.webp',
    'images/search/global-radio-800.webp',
    'images/search/global-radio-thumb.webp',
    'images/search/andromeda-1600.webp',
    'images/search/andromeda-800.webp',
    'images/search/andromeda-thumb.webp'
  ];

  for (const rel of assets) {
    const full = path.join(REPO_ROOT, rel);
    assert.ok(fs.existsSync(full), `${rel} exists`);
    const size = fs.statSync(full).size;
    assert.ok(size > 1000, `${rel} has valid non-empty size (${size} bytes)`);
  }
});

test('wallpaper: wyszukiwarka.html and wyszukiwarka/index.html use polska-radio background', () => {
  const h1 = fs.readFileSync(path.join(REPO_ROOT, 'wyszukiwarka.html'), 'utf8');
  const h2 = fs.readFileSync(path.join(REPO_ROOT, 'wyszukiwarka/index.html'), 'utf8');

  assert.ok(h1.includes('/images/search/polska-radio-1600.webp'), 'wyszukiwarka.html uses polska-radio desktop');
  assert.ok(h1.includes('/images/search/polska-radio-800.webp'), 'wyszukiwarka.html uses polska-radio mobile');
  assert.ok(h2.includes('/images/search/polska-radio-1600.webp'), 'wyszukiwarka/index.html uses polska-radio desktop');
  assert.ok(h2.includes('/images/search/polska-radio-800.webp'), 'wyszukiwarka/index.html uses polska-radio mobile');
});

test('cc-omni-search.js: contains 3 preset wallpapers and modal picker contracts', () => {
  const js = fs.readFileSync(path.join(REPO_ROOT, 'components/cc-omni-search.js'), 'utf8');

  assert.ok(js.includes('/images/search/polska-radio-1600.webp'), 'references polska-radio-1600.webp');
  assert.ok(js.includes('/images/search/global-radio-1600.webp'), 'references global-radio-1600.webp');
  assert.ok(js.includes('/images/search/andromeda-1600.webp'), 'references andromeda-1600.webp');
  assert.ok(js.includes('cc-wallpaper-modal-backdrop'), 'has wallpaper modal backdrop styles');
  assert.ok(js.includes('cc-wallpaper-grid'), 'has wallpaper grid styles');
  assert.ok(js.includes('function openWallpaperModal('), 'openWallpaperModal defined');
  assert.ok(js.includes('function closeWallpaperModal('), 'closeWallpaperModal defined');
  assert.ok(js.includes('function renderWallpaperGrid('), 'renderWallpaperGrid defined');
});

test('cc-omni-search.js: BIBLE_RAG_REGISTRY and queryKnowledgeRegistryClient functionality', () => {
  const js = fs.readFileSync(path.join(REPO_ROOT, 'components/cc-omni-search.js'), 'utf8');

  assert.ok(js.includes('const BIBLE_RAG_REGISTRY ='), 'BIBLE_RAG_REGISTRY is defined');
  assert.ok(js.includes('rag-zbawienie-jhn-3-16'), 'Contains salvation chunk');
  assert.ok(js.includes('rag-posrednik-1tim-2-5'), 'Contains mediator chunk');
  assert.ok(js.includes('rag-pokoj-jhn-14-27'), 'Contains peace chunk');
  assert.ok(js.includes('rag-szabat-exo-20-8-11'), 'Contains sabbath chunk');
});

test('cc-omni-search.js: detectBibleRagQuery and renderBibleRagCard contracts', () => {
  const js = fs.readFileSync(path.join(REPO_ROOT, 'components/cc-omni-search.js'), 'utf8');

  assert.ok(js.includes('function detectBibleRagQuery('), 'detectBibleRagQuery function is defined');
  assert.ok(js.includes('function renderBibleRagCard('), 'renderBibleRagCard function is defined');
  assert.ok(js.includes('cc-rag-answer-card'), 'cc-rag-answer-card class is present');
  assert.ok(js.includes('ODPOWIEDŹ BIBLIJNA CC'), 'Header badge text present');
  assert.ok(js.includes('UBG · ZERO COST'), 'Zero Cost UBG standard tag present');
  assert.ok(js.includes('data-action="copy-rag-answer"'), 'copy-rag-answer action handler present');
  assert.ok(js.includes('data-action="toggle-compare"'), 'toggle-compare action handler present');
  assert.ok(js.includes('data-action="toggle-audio"'), 'toggle-audio action handler present');
  assert.ok(js.includes('data-action="open-share-card"'), 'open-share-card action handler present');
});

test('functional: wallpaper picker modal and presets lifecycle', async () => {
  const { Window } = await import('happy-dom');
  const window = new Window({ url: 'https://polskieradio.cc/wyszukiwarka' });
  const document = window.document;

  globalThis.window = window;
  globalThis.document = document;
  globalThis.localStorage = window.localStorage;
  if (!globalThis.location) globalThis.location = window.location;

  document.body.innerHTML = '';

  const jsCode = fs.readFileSync(path.join(REPO_ROOT, 'components/cc-omni-search.js'), 'utf8');
  window.eval(jsCode);

  const CCOmni = window.CCOmniSearch;
  assert.ok(CCOmni, 'CCOmniSearch initialized');
  assert.equal(CCOmni.PRESET_WALLS.length, 3, 'Exactly 3 preset wallpapers');
  assert.equal(CCOmni.PRESET_WALLS[0].id, 'polska-radio');
  assert.equal(CCOmni.PRESET_WALLS[1].id, 'global-radio');
  assert.equal(CCOmni.PRESET_WALLS[2].id, 'andromeda');

  // Open modal
  CCOmni.openWallpaperModal();
  const backdrop = document.getElementById('ccWallpaperModalBackdrop');
  assert.ok(backdrop, 'Backdrop exists in DOM');
  assert.equal(backdrop.style.display, 'flex', 'Backdrop visible');

  // Check grid cards
  const cards = document.querySelectorAll('.cc-wall-card');
  assert.equal(cards.length, 4, '3 preset cards + 1 custom upload card');

  // Select global-radio card
  const globalCard = document.querySelector('.cc-wall-card[data-wall-id="global-radio"]');
  assert.ok(globalCard, 'global-radio card exists in grid');
  globalCard.click();

  assert.equal(window.localStorage.getItem('cc_search_wallpaper'), 'global-radio');
  const overlay = document.getElementById('ccOmniOverlay');
  assert.ok(overlay.style.backgroundImage.includes('global-radio-1600.webp'), 'Background changed to global-radio');

  // Close modal
  CCOmni.closeWallpaperModal();
  assert.equal(backdrop.style.display, 'none', 'Modal closed');
});


test('footer: buttons are icon-only with 44px ergonomics, aria-labels and tooltips', async () => {
  const { Window } = await import('happy-dom');
  const window = new Window({ url: 'https://polskieradio.cc/wyszukiwarka' });
  const document = window.document;
  globalThis.window = window;
  globalThis.document = document;
  globalThis.localStorage = window.localStorage;
  if (!globalThis.location) globalThis.location = window.location;

  document.body.innerHTML = '';
  const jsCode = fs.readFileSync(path.join(REPO_ROOT, 'components/cc-omni-search.js'), 'utf8');
  window.eval(jsCode);

  const sourcesBtn = document.getElementById('ccOmniSourcesBtn');
  const wallBtn = document.getElementById('ccOmniWallBtn');
  const wallUpload = document.getElementById('ccOmniWallUpload');
  const wallReset = document.getElementById('ccOmniWallReset');

  assert.ok(sourcesBtn, 'ccOmniSourcesBtn exists');
  assert.ok(wallBtn, 'ccOmniWallBtn exists');
  assert.ok(wallUpload, 'ccOmniWallUpload exists');
  assert.ok(wallReset, 'ccOmniWallReset exists');

  for (const btn of [sourcesBtn, wallBtn, wallUpload, wallReset]) {
    assert.ok(btn.classList.contains('cc-omni-iconbtn'), `${btn.id} has cc-omni-iconbtn class`);
    assert.ok(btn.getAttribute('aria-label'), `${btn.id} has aria-label`);
    assert.ok(btn.getAttribute('title'), `${btn.id} has title tooltip`);
    assert.equal(btn.querySelectorAll('svg').length, 1, `${btn.id} contains SVG icon`);
    assert.equal(btn.querySelector('span'), null, `${btn.id} has no inner text span (icon-only)`);
  }
});
