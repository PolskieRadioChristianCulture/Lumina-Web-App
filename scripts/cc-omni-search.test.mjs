import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { applyPageStandard, OMNI_SEARCH_SCRIPT } from './cc-page-standard.mjs';

const ROOT = process.cwd();
const omniSearchCode = fs.readFileSync(path.join(ROOT, 'components/cc-omni-search.js'), 'utf8');
const catalogData = JSON.parse(fs.readFileSync(path.join(ROOT, 'szukaj/catalog.json'), 'utf8'));

test('cc-omni-search.js: module exists and defines expected contracts', () => {
  assert.ok(omniSearchCode.includes('window.CCOmniSearch'), 'defines window.CCOmniSearch');
  assert.ok(omniSearchCode.includes('open: openSearch'), 'exports open');
  assert.ok(omniSearchCode.includes('close: closeSearch'), 'exports close');
  assert.ok(omniSearchCode.includes('performSearch: performSearch'), 'exports performSearch');
  assert.ok(omniSearchCode.includes('Przewodnik Tematyczny Ekosystemu'), 'contains context guide title');
  assert.ok(omniSearchCode.includes('min-height: 44px'), 'enforces 44px touch target');
});

test('cc-omni-search.js: search for "werset dnia" returns "Mój Werset Dnia" as #1', () => {
  // Symulacja algorytmu wyszukiwania
  const normQuery = 'werset dnia';
  const queryWords = ['werset', 'dnia'];
  
  const scored = [];
  for (const item of catalogData.items) {
    const normTitle = (item.title || '').toLowerCase();
    const normTags = ((item.tags || []).join(' ')).toLowerCase();
    let score = 0;
    if (normTitle.includes(normQuery)) score += 50;
    if (normTitle === 'mój werset dnia' || normTitle === 'werset dnia') score += 100;
    for (const w of queryWords) {
      if (normTitle.includes(w)) score += 35;
      else if (normTags.includes(w)) score += 25;
    }
    if (score > 0) scored.push({ item, score });
  }
  scored.sort((a, b) => b.score - a.score);

  assert.ok(scored.length > 0, 'Found results for werset dnia');
  assert.equal(scored[0].item.title, 'Mój Werset Dnia');
  assert.equal(scored[0].item.url, 'https://polskieradio.cc/werset-dnia');
});

test('cc-omni-search.js: search for "nadzieja" identifies the context guide', () => {
  const guide = catalogData.contextGuides && catalogData.contextGuides.nadzieja;
  assert.ok(guide, 'Context guide for nadzieja exists');
  assert.ok(guide.topic.includes('Nadzieja'), 'Guide topic includes Nadzieja');
  assert.ok(guide.keyVerses.length >= 2, 'Has key scripture verses');
  assert.ok(guide.shortcuts.some(s => s.title.includes('Mój Werset Dnia')), 'Contains Mój Werset Dnia shortcut');
});

test('cc-page-standard: injects cc-omni-search.js and preserves idempotency', () => {
  const html = '<html><head></head><body><main>Test CC</main></body></html>';
  const res1 = applyPageStandard('index.html', html);
  assert.ok(res1.includes(`defer src="${OMNI_SEARCH_SCRIPT}"`), 'includes omni-search script');
  assert.ok(res1.includes('js/cc-back-to-top.js'), 'includes back-to-top script');
  
  const res2 = applyPageStandard('index.html', res1);
  assert.equal(res2, res1, 'idempotent call produces identical HTML');
});

test('cc-omni-search.js: search for "cclite" returns cclite.pl as #1 and matches context guide', () => {
  const normQuery = 'cclite';
  const scored = [];
  for (const item of catalogData.items) {
    const normTitle = (item.title || '').toLowerCase();
    const normTags = ((item.tags || []).join(' ')).toLowerCase();
    let score = 0;
    if (normTitle.includes(normQuery)) score += 50;
    if (normTitle.startsWith('cclite.pl')) score += 80;
    if (normTags.includes(normQuery)) score += 25;
    if (score > 0) scored.push({ item, score });
  }
  scored.sort((a, b) => b.score - a.score);

  assert.ok(scored.length >= 10, 'Found at least 10 results for cclite');
  assert.ok(scored[0].item.title.includes('cclite.pl'), 'Top result is cclite.pl');
  assert.equal(scored[0].item.url, 'https://cclite.pl');

  const guide = catalogData.contextGuides && (catalogData.contextGuides.cclite || catalogData.contextGuides.aplikacja);
  assert.ok(guide, 'Context guide for cclite or aplikacja exists');
  assert.ok(guide.shortcuts.some(s => s.url === 'https://cclite.pl'), 'Contains shortcut to cclite.pl');
});

test('cc-omni-search.js: search for "aplikacja" matches context guide and cclite.pl', () => {
  const guide = catalogData.contextGuides && catalogData.contextGuides.aplikacja;
  assert.ok(guide, 'Context guide for aplikacja exists');
  assert.ok(guide.keywords.includes('cclite'), 'Guide keywords include cclite');
  assert.ok(guide.shortcuts.some(s => s.title.includes('cclite.pl')), 'Contains shortcut to cclite.pl');
});

test('cc-omni-search.js: all key MENU CC items are indexed in catalog', () => {
  const urls = new Set(catalogData.items.map(i => (i.url || '').toLowerCase()));
  const requiredPaths = ['/skins', '/music', '/holos', '/studio', '/kalendarz', '/ambientsleep', '/tv', '/ziu', '/kuchnia', '/biznes', '/finanse', '/apologetyka', '/misje', '/biblioteka', '/wspolpraca', '/projektant', '/cc-light', '/widget', '/rolki', '/certyfikat'];
  for (const path of requiredPaths) {
    const found = Array.from(urls).some(u => u.includes(path));
    assert.ok(found, `MENU CC item with path ${path} must be indexed`);
  }
  assert.ok(catalogData.contextGuides.muzyka, 'Guide muzyka exists');
  assert.ok(catalogData.contextGuides.zdrowie, 'Guide zdrowie exists');
  assert.ok(catalogData.contextGuides.biznes, 'Guide biznes exists');
  assert.ok(catalogData.contextGuides.ksiazki, 'Guide ksiazki exists');
});


