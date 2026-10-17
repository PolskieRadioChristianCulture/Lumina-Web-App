import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

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

test('CCN Evaluation Baseline: 30 zapytań kontrolnych ze specyfikacji v1.0', () => {
  let passedQueries = 0;
  const metrics = [];

  for (const { q, expectedMatches, minTop5Relevance } of EVALUATION_QUERIES) {
    const nq = normalize(q);
    const words = nq.split(/\s+/).filter(Boolean);

    // Scoring items from catalogData
    const scored = [];
    for (const item of catalogData.items) {
      const title = normalize(item.title);
      const desc = normalize(item.description);
      const tags = normalize(Array.isArray(item.tags) ? item.tags.join(' ') : (item.tags || ''));
      const text = `${title} ${desc} ${tags}`;
      
      let score = 0;
      if (text.includes(nq)) score += 50;
      for (const w of words) {
        if (title.includes(w)) score += 30;
        else if (tags.includes(w)) score += 20;
        else if (desc.includes(w)) score += 10;
      }
      if (score > 0) scored.push({ item, score });
    }

    scored.sort((a, b) => b.score - a.score);
    const top5 = scored.slice(0, 5);

    // Calculate precision@5: count how many in top 5 match expectedMatches
    let relevantCount = 0;
    for (const r of top5) {
      const rText = `${normalize(r.item.title)} ${normalize(r.item.url)} ${normalize(r.item.description)}`;
      const matchesAny = expectedMatches.some(m => rText.includes(normalize(m)));
      if (matchesAny) relevantCount++;
    }

    const precisionAt5 = top5.length ? (relevantCount / top5.length) : 0;
    metrics.push({ q, top5Count: top5.length, relevantCount, precisionAt5 });

    assert.ok(relevantCount >= minTop5Relevance, `Query "${q}" should return at least ${minTop5Relevance} relevant item in top 5 (got ${relevantCount})`);
    passedQueries++;
  }

  assert.equal(passedQueries, 30, 'All 30 queries must pass precision benchmark');
  console.log(`Evaluated ${passedQueries}/30 queries. Average Precision@5: ${(metrics.reduce((acc, m) => acc + m.precisionAt5, 0) / 30).toFixed(2)}`);
});
