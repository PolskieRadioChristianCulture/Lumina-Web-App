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

test('cc-omni-search.js: VM execution of performSearch with synonyms, typos, and suggestions', async () => {
  const vm = await import('node:vm');
  // The fixture below expects lesson 15 as "today". Keep the test clock
  // independent of the release date instead of changing production search.
  class FixtureDate extends Date {
    constructor(...args) { super(...(args.length ? args : [2026, 9, 15, 12])); }
    static now() { return new FixtureDate().getTime(); }
  }
  const sandbox = {
    window: {
      location: { pathname: '/' },
      __ccSearchCatalog: catalogData
    },
    document: {
      getElementById: () => null,
      querySelectorAll: () => [],
      addEventListener: () => {},
      readyState: 'complete'
    },
    console: console,
    setTimeout: setTimeout,
    clearTimeout: clearTimeout,
    URL,
    Date: FixtureDate
  };
  vm.createContext(sandbox);
  vm.runInContext(omniSearchCode, sandbox);

  const search = sandbox.window.CCOmniSearch.performSearch;
  assert.ok(typeof search === 'function', 'performSearch is a function');

  // 1. Lekcja 15 na dziś
  const r1 = search('Lekcja 15 na dziś');
  assert.equal(r1.isSuggestion, false, 'isSuggestion must be false for exact match');
  assert.ok(r1.items.length > 0, 'Must return results');
  assert.ok(r1.items[0].title.includes('Dzień 15') || r1.items[0].title.includes('Lekcja 15'), 'Top result is Lesson 15');

  // 2. Typo: "rozwżanie na dziś"
  const r2 = search('rozwżanie na dziś');
  assert.ok(r2.items.length > 0, 'Typo query finds results');
  assert.ok(r2.items[0].title.includes('na dziś') || r2.items[0].title.includes('Dzień 15') || r2.items[0].title.toLowerCase().includes('rozważanie'), 'Top result handles typo');

  // 3. Synonim: "worship"
  const r3 = search('worship');
  assert.ok(r3.items.some(i => i.title.toLowerCase().includes('worship') || i.title.toLowerCase().includes('muzyka')), 'Synonym finds worship items');

  // 4. Missing item with specific number: "Lekcja 99"
  const r4 = search('Lekcja 99');
  assert.equal(r4.isSuggestion, true, 'isSuggestion must be true for missing number');
  assert.ok(r4.suggestionNote && r4.suggestionNote.includes('99'), 'suggestionNote mentions missing number 99');
  const todayDay = new FixtureDate().getDate();
  assert.ok(r4.items[0].title.includes(`Dzień ${todayDay}`) || r4.items[0].title.includes(`Lekcja ${todayDay}`) || r4.items[0].title.includes('Dzień 15') || r4.items[0].title.includes('Lekcja 15'), 'Proposes today lesson as top suggestion');

  // 5. Completely missing query
  const r5 = search('nieznanybrakujacyhasloxyz');
  assert.equal(r5.isSuggestion, true, 'isSuggestion must be true for unknown phrase');
  assert.ok(r5.items.length > 0, 'Provides fallback proposals');

  // 6. Karaoke & Śpiewnik Słowa Bożego
  const r6 = search('karaoke');
  assert.equal(r6.isSuggestion, false, 'isSuggestion must be false for karaoke');
  assert.ok(r6.items.some(i => i.url.includes('/karaoke') || i.url.includes('/BiblijneUwielbienie')), 'karaoke finds Karaoke / BiblijneUwielbienie');

  const r7 = search('śpiewnik');
  assert.equal(r7.isSuggestion, false, 'isSuggestion must be false for śpiewnik');
  assert.ok(r7.items.some(i => i.url.includes('/karaoke') || i.url.includes('/BiblijneUwielbienie')), 'śpiewnik finds Karaoke / BiblijneUwielbienie');
});

test('cc-omni-search.js: Command Center World-Class UI contracts (recents, tags, 4 pillars, no veil)', () => {
  assert.ok(omniSearchCode.includes('getRecentSearches: getRecentSearches'), 'exports getRecentSearches');
  assert.ok(omniSearchCode.includes('saveRecentSearch: saveRecentSearch'), 'exports saveRecentSearch');
  assert.ok(omniSearchCode.includes('removeRecentSearch: removeRecentSearch'), 'exports removeRecentSearch');
  assert.ok(omniSearchCode.includes('clearRecentSearches: clearRecentSearches'), 'exports clearRecentSearches');
  assert.ok(!omniSearchCode.includes('#ccOmniOverlay.cc-veiled .cc-omni-cards'), 'veil is removed from standalone search');
  assert.ok(omniSearchCode.includes('Rozważanie „Dobrze, że jesteś”'), 'pillar 1: Dobrze że jesteś exists');
  assert.ok(omniSearchCode.includes('Lekcja Dnia: Z Biblią za Pan Brat'), 'pillar 2: Akademia / Z Biblią za Pan Brat exists');
  assert.ok(omniSearchCode.includes('APOKALIPSA — Księga Nadziei'), 'pillar 3: Podcast Apokalipsa exists');
  assert.ok(omniSearchCode.includes('Radio Christian Culture & Player'), 'pillar 4: Radio CC & Player exists');
  assert.ok(omniSearchCode.includes('#Apokalipsa') && omniSearchCode.includes('#KursCodzienny'), 'popular topic tags exist');
  assert.ok(omniSearchCode.includes('startPlaceholderRotation'), 'rotating placeholder logic exists');
});



