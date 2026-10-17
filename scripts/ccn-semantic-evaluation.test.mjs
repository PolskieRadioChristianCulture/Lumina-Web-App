import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const ROOT = process.cwd();
const catalogData = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/cc-search-index.json'), 'utf8'));

// Test cases according to Spec v1.0 § 6 and § 11 (30 test queries PL/EN)
const EVALUATION_QUERIES = [
  // 1. Grupa Waluty cyfrowe i wolność gospodarcza (Spec § 6)
  { q: 'CBDC', expectedMatches: ['cbdc', 'finanse'], minTop5Relevance: 1 },
  { q: 'cyfrowy pieniądz', expectedMatches: ['cbdc', 'finanse'], minTop5Relevance: 1 },
  { q: 'waluta banku centralnego', expectedMatches: ['cbdc', 'finanse'], minTop5Relevance: 1 },
  { q: 'gotówka', expectedMatches: ['finanse', 'cbdc'], minTop5Relevance: 1 },
  { q: 'pieniądz programowalny', expectedMatches: ['cbdc', 'finanse'], minTop5Relevance: 1 },

  // 2. Grupa Prawo niedzielne & Wolność sumienia (Spec § 6)
  { q: 'prawo niedzielne', expectedMatches: ['prawo niedzielne', 'cbdc', 'wolnosc'], minTop5Relevance: 1 },
  { q: 'wolność religijna', expectedMatches: ['wolnosc', 'przesladowan', 'cbdc'], minTop5Relevance: 1 },
  { q: 'sabat i niedziela', expectedMatches: ['szabat', 'sabat', 'apokalipsa'], minTop5Relevance: 1 },
  { q: 'prześladowania chrześcijan', expectedMatches: ['przesladowan', 'open doors'], minTop5Relevance: 1 },
  { q: 'wolność sumienia', expectedMatches: ['wolnosc', 'sumienia', 'godnosc'], minTop5Relevance: 1 },

  // 3. Grupa Biblia, Proroctwa & Apokalipsa (Spec § 6)
  { q: 'Apokalipsa 13', expectedMatches: ['apokalipsa', 'cbdc', 'proroctwo'], minTop5Relevance: 1 },
  { q: 'znamię bestii', expectedMatches: ['apokalipsa', 'cbdc'], minTop5Relevance: 1 },
  { q: 'Księga Objawienia', expectedMatches: ['objawienia', 'apokalipsy', 'kurs'], minTop5Relevance: 1 },
  { q: 'werset dnia', expectedMatches: ['werset', 'werset-dnia'], minTop5Relevance: 1 },
  { q: 'przebudzenie duchowe', expectedMatches: ['przebudzenia', 'duchowego'], minTop5Relevance: 1 },

  // 4. Grupa Pismo Święte & Studia Postaci (Spec § 6)
  { q: 'Abraham i Izaak', expectedMatches: ['abraham', 'moria', 'izaak'], minTop5Relevance: 1 },
  { q: 'wieża Babel', expectedMatches: ['babel', 'wieza'], minTop5Relevance: 1 },
  { q: 'Sodoma i Gomora', expectedMatches: ['sodoma', 'lot'], minTop5Relevance: 1 },
  { q: 'Kain i Abel', expectedMatches: ['kain', 'abel'], minTop5Relevance: 1 },
  { q: 'potop i arka', expectedMatches: ['potop', 'arka', 'noe'], minTop5Relevance: 1 },

  // 5. Grupa Technologia, AI & Praca (Spec § 6)
  { q: 'Czy AI zabierze pracę?', expectedMatches: ['ai', 'madrosc', 'u-boku-diabla'], minTop5Relevance: 1 },
  { q: 'sztuczna inteligencja mądrość', expectedMatches: ['ai', 'madrosc'], minTop5Relevance: 1 },
  { q: 'cyfrowe korporacje', expectedMatches: ['u-boku-diabla', 'korporacje'], minTop5Relevance: 1 },
  { q: '0,7 sekundy uwagi', expectedMatches: ['u-boku-diabla', '07-sekundy'], minTop5Relevance: 1 },
  { q: 'automatyzacja a człowiek', expectedMatches: ['ai', 'technologia'], minTop5Relevance: 1 },

  // 6. Grupa Publikacje Autorskie, Modlitwa & Pomoc (Spec § 6)
  { q: 'Pokonać Goliata', expectedMatches: ['pokonac-goliata', 'goliata'], minTop5Relevance: 1 },
  { q: 'Kod Źródłowy Duszy', expectedMatches: ['kod-zrodlowy', 'duszy'], minTop5Relevance: 1 },
  { q: 'Prawda Bez Filtra', expectedMatches: ['prawda-bez-filtra', 'kobiety'], minTop5Relevance: 1 },
  { q: 'modlitwa o pokój', expectedMatches: ['modlitwa', 'pokoj', 'ukraina'], minTop5Relevance: 1 },
  { q: 'współpraca misyjna', expectedMatches: ['wspolpraca', 'partnerstwo'], minTop5Relevance: 1 },
];

function normalize(s) {
  return String(s || '').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/ł/g, 'l').trim();
}

test('CCN search: actual shared engine returns a relevant result for the 30 legacy queries', () => {
  const context = { window: { __ccSearchCatalog: catalogData, location: { pathname: '/szukaj' } },
    document: { readyState: 'loading', addEventListener() {} }, URL };
  vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'components/cc-omni-search.js'), 'utf8'), context);
  const search = context.window.CCOmniSearch.performSearch;
  const failures = [];
  for (const { q, expectedMatches } of EVALUATION_QUERIES) {
    const top5 = search(q).items.slice(0, 5);
    const relevant = top5.some(item => expectedMatches.some(term =>
      normalize(item.title + ' ' + item.url + ' ' + item.description).includes(normalize(term))));
    if (!relevant) failures.push(q + ': ' + top5.map(i => i.title).join(' | '));
  }
  assert.deepEqual(failures, []);
  // These keyword checks are smoke tests; they do not measure judged Precision@5 or nDCG.
});
