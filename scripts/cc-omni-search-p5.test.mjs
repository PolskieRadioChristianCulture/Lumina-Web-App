import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const REPO_ROOT = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc';

test('wallpaper: verifies image assets exist and are optimized', () => {
  const desktop = path.join(REPO_ROOT, 'images/search/polska-radio-1600.webp');
  const mobile = path.join(REPO_ROOT, 'images/search/polska-radio-800.webp');
  const png = path.join(REPO_ROOT, 'images/search/polska-radio.png');

  assert.ok(fs.existsSync(desktop), 'polska-radio-1600.webp exists');
  assert.ok(fs.existsSync(mobile), 'polska-radio-800.webp exists');
  assert.ok(fs.existsSync(png), 'polska-radio.png exists');

  const sDesktop = fs.statSync(desktop).size;
  const sMobile = fs.statSync(mobile).size;
  assert.ok(sDesktop > 10000 && sDesktop < 300000, `Desktop size within reasonable bounds (${sDesktop} bytes)`);
  assert.ok(sMobile > 5000 && sMobile < 150000, `Mobile size within reasonable bounds (${sMobile} bytes)`);
});

test('wallpaper: wyszukiwarka.html and wyszukiwarka/index.html use polska-radio background', () => {
  const h1 = fs.readFileSync(path.join(REPO_ROOT, 'wyszukiwarka.html'), 'utf8');
  const h2 = fs.readFileSync(path.join(REPO_ROOT, 'wyszukiwarka/index.html'), 'utf8');

  assert.ok(h1.includes('/images/search/polska-radio-1600.webp'), 'wyszukiwarka.html uses polska-radio desktop');
  assert.ok(h1.includes('/images/search/polska-radio-800.webp'), 'wyszukiwarka.html uses polska-radio mobile');
  assert.ok(h2.includes('/images/search/polska-radio-1600.webp'), 'wyszukiwarka/index.html uses polska-radio desktop');
  assert.ok(h2.includes('/images/search/polska-radio-800.webp'), 'wyszukiwarka/index.html uses polska-radio mobile');
});

test('cc-omni-search.js: contains preset wallpapers and wallpaper switcher buttons', () => {
  const js = fs.readFileSync(path.join(REPO_ROOT, 'components/cc-omni-search.js'), 'utf8');

  assert.ok(js.includes('/images/search/polska-radio-1600.webp'), 'cc-omni-search.js references polska-radio-1600.webp');
  assert.ok(js.includes('/images/search/polska-radio-800.webp'), 'cc-omni-search.js references polska-radio-800.webp');
  assert.ok(js.includes('ccOmniWallLabel'), 'cc-omni-search.js has ccOmniWallLabel');
  assert.ok(js.includes('ccOmniWallUpload'), 'cc-omni-search.js has ccOmniWallUpload');
  assert.ok(js.includes('PRESET_WALLS'), 'cc-omni-search.js defines PRESET_WALLS');
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

test('functional: evaluates search logic in simulated browser environment', async () => {
  const { Window } = await import('happy-dom');
  const window = new Window({ url: 'https://polskieradio.cc/wyszukiwarka' });
  const document = window.document;

  globalThis.window = window;
  globalThis.document = document;
  globalThis.localStorage = window.localStorage;
  if (!globalThis.location) {
    globalThis.location = window.location;
  }

  document.body.innerHTML = `
    <div id="ccOmniOverlay">
      <div id="ccOmniModal"></div>
      <div id="ccOmniBody"></div>
      <button id="ccOmniWallBtn"></button>
      <span id="ccOmniWallLabel"></span>
      <button id="ccOmniWallUpload"></button>
      <button id="ccOmniWallReset"></button>
      <input type="file" id="ccOmniWallFile" />
      <span id="ccOmniCredit"></span>
    </div>
  `;

  // Import cc-omni-search.js
  const jsCode = fs.readFileSync(path.join(REPO_ROOT, 'components/cc-omni-search.js'), 'utf8');
  window.eval(jsCode);

  const CCOmni = window.CCOmniSearch;
  assert.ok(CCOmni, 'window.CCOmniSearch is initialized');
  assert.equal(typeof CCOmni.detectBibleRagQuery, 'function');
  assert.equal(typeof CCOmni.queryKnowledgeRegistryClient, 'function');
  assert.equal(typeof CCOmni.renderBibleRagCard, 'function');

  // Test 1: Query for salvation
  const qSalvation = CCOmni.detectBibleRagQuery('Jak otrzymać zbawienie?');
  assert.ok(qSalvation, 'Salvation query detected');
  assert.ok(qSalvation.isQuestion, 'Identified as question');
  assert.ok(qSalvation.sources.length >= 1, 'Found at least 1 source');
  assert.ok(qSalvation.primary.text.includes('Bóg umiłował świat') || qSalvation.primary.text.includes('Łaską'), 'Contains scripture text');

  // Test 2: Query for mediator
  const qMediator = CCOmni.detectBibleRagQuery('Kto jest pośrednikiem między Bogiem a ludźmi?');
  assert.ok(qMediator, 'Mediator query detected');
  assert.ok(qMediator.primary.title.includes('Pośrednik') || qMediator.primary.text.includes('pośrednik'));

  // Test 3: Query for sabbath
  const qSabbath = CCOmni.detectBibleRagQuery('Co mówi Biblia o Szabacie?');
  assert.ok(qSabbath, 'Sabbath query detected');
  assert.ok(qSabbath.primary.text.includes('szabatu') || qSabbath.primary.topic === 'szabat');

  // Test 4: Render card HTML
  const cardHtml = CCOmni.renderBibleRagCard(qSalvation);
  assert.ok(cardHtml.includes('cc-rag-answer-card'), 'Rendered card container');
  assert.ok(cardHtml.includes('ODPOWIEDŹ BIBLIJNA CC'), 'Rendered header badge');
  assert.ok(cardHtml.includes('[1]'), 'Rendered citation tag');
  assert.ok(cardHtml.includes('data-action="copy-rag-answer"'), 'Rendered copy button');
  assert.ok(cardHtml.includes('data-action="open-share-card"'), 'Rendered share card button');

  // Test 5: Presets
  assert.equal(CCOmni.PRESET_WALLS.length, 2, 'Has 2 preset wallpapers');
  assert.equal(CCOmni.PRESET_WALLS[0].id, 'polska-radio');
  assert.equal(CCOmni.PRESET_WALLS[1].id, 'andromeda');
});
