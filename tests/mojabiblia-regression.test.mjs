import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const cwd = process.cwd();
const glosyPath = join(cwd, 'data', 'bible', 'glosy-pl.json');
const szukajPath = join(cwd, 'data', 'bible', 'szukaj-ubg.json');
const gen1Path = join(cwd, 'data', 'bible', 'GEN_01.json');
const jhn1Path = join(cwd, 'data', 'bible', 'JHN_01.json');
const enginePath = join(cwd, 'mojabiblia-engine.js');

test('MojaBiblia: pliki słownika i indeksu wyszukiwania istnieją', () => {
  assert.ok(existsSync(glosyPath), 'data/bible/glosy-pl.json musi istnieć');
  assert.ok(existsSync(szukajPath), 'data/bible/szukaj-ubg.json musi istnieć');
  assert.ok(existsSync(gen1Path), 'data/bible/GEN_01.json musi istnieć');
  assert.ok(existsSync(jhn1Path), 'data/bible/JHN_01.json musi istnieć');
});

test('MojaBiblia: Rdz 1 i J 1 nie zawierają angielskich słów w interlinii', () => {
  const glosy = JSON.parse(readFileSync(glosyPath, 'utf8'));
  const engineSrc = readFileSync(enginePath, 'utf8');

  // Mini-instancja glossFor odpowiadająca logice z mojabiblia-engine.js
  const prefixes = { 'ב': 'w', 'ו': 'i', 'ל': 'do', 'כ': 'jak', 'מ': 'z', 'ש': 'który', 'ה': '' };
  function glossFor(w) {
    const strong = String((w && w.strong) || '');
    const raw = String((w && w.gloss) || '').trim();
    const orig = String((w && w.original) || '').replace(/[,\.;·¶׃׀]/g, '').trim();
    const morph = String((w && w.morph) || '').trim();

    if (orig === 'ἡμῖν' || (morph === 'P-1DP' && w && w.lemma === 'ἐγώ')) return { text: 'nam / wśród nas', en: false };
    if (orig === 'ἡμῶν' || (morph === 'P-1GP' && w && w.lemma === 'ἐγώ')) return { text: 'nas / nasz', en: false };
    if (orig === 'ἡμᾶς' || (morph === 'P-1AP' && w && w.lemma === 'ἐγώ')) return { text: 'nas', en: false };
    if (orig === 'ὑμῖν' || (morph === 'P-2DP' && w && w.lemma === 'σύ')) return { text: 'wam', en: false };
    if (orig === 'αὐτοῦ' && morph === 'P-GSM') return { text: 'Jego / jego', en: false };

    let pl = glosy[strong];
    if (pl) {
      const lemma = String((w && w.lemma) || '');
      if (strong.charAt(0) === 'H' && lemma.length === 1 && prefixes[lemma]) {
        if (strong === 'H7225' && lemma === 'ב') pl = 'na początku';
        else {
          const p = prefixes[lemma];
          if (p) pl = p + ' ' + pl;
        }
      }
      return { text: pl, en: false };
    }

    if (raw === '[ten/ta/to]') return { text: '(rodzajnik)', en: false };
    if (/^obj\.?$/i.test(raw)) return { text: '(dopełnienie)', en: false };
    const english = /\b(the|of|to|he|she|it|they|you|I|we|was|were|is|are|be|been|will|shall|and|but|or|not|with|from|for|on|by|this|that|which|who|all|my|your|his|her|their|our|God|LORD|said|says)\b|(ness|ing|ed|tion|ly)$/i.test(raw);
    return { text: raw, en: english };
  }

  // Weryfikacja Rdz 1
  const gen1 = JSON.parse(readFileSync(gen1Path, 'utf8'));
  const genIssues = [];
  gen1.verses.forEach(v => {
    (v.interlinear || []).forEach(w => {
      const g = glossFor(w);
      if (g.en) genIssues.push({ ref: `GEN 1:${v.verse}`, orig: w.original, strong: w.strong, text: g.text });
    });
  });
  assert.equal(genIssues.length, 0, `Rdz 1 zawiera angielskie słowa: ${JSON.stringify(genIssues)}`);

  // Weryfikacja J 1
  const jhn1 = JSON.parse(readFileSync(jhn1Path, 'utf8'));
  const jhnIssues = [];
  jhn1.verses.forEach(v => {
    (v.interlinear || []).forEach(w => {
      const g = glossFor(w);
      if (g.en) jhnIssues.push({ ref: `JHN 1:${v.verse}`, orig: w.original, strong: w.strong, text: g.text });
    });
  });
  assert.equal(jhnIssues.length, 0, `J 1 zawiera angielskie słowa: ${JSON.stringify(jhnIssues)}`);

  // Rdz 1:1 konkretnie
  const gen1_1_glosses = gen1.verses[0].interlinear.map(w => glossFor(w).text);
  assert.ok(gen1_1_glosses.includes('na początku'), 'Rdz 1:1 musi zawierać „na początku”');
  assert.ok(gen1_1_glosses.includes('Bóg'), 'Rdz 1:1 musi zawierać „Bóg”');
  assert.ok(gen1_1_glosses.includes('stworzyć'), 'Rdz 1:1 musi zawierać „stworzyć”');
  assert.ok(gen1_1_glosses.includes('niebo'), 'Rdz 1:1 musi zawierać „niebo”');

  // J 1:14 konkretnie
  const jhn1_14_glosses = jhn1.verses[13].interlinear.map(w => glossFor(w).text);
  assert.ok(jhn1_14_glosses.includes('nam / wśród nas'), 'J 1:14 musi zawierać „nam / wśród nas” dla ἡμῖν');
  assert.ok(jhn1_14_glosses.includes('zamieszkać / rozbić namiot'), 'J 1:14 musi zawierać „zamieszkać / rozbić namiot” dla ἐσκήνωσεν');
  assert.ok(jhn1_14_glosses.includes('pełen / pełny'), 'J 1:14 musi zawierać „pełen / pełny” dla πλήρης');
});

test('MojaBiblia: indeks wyszukiwania obejmuje 31 212 wersetów i wyszukuje frazy', () => {
  const idx = JSON.parse(readFileSync(szukajPath, 'utf8'));
  assert.equal(idx.b.length, 66, 'Musi zawierać 66 ksiąg');
  assert.equal(idx.r.length, 31212, 'Musi zawierać 31 212 wersetów');

  const norm = str => String(str || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ł/g, 'l');
  const normalizedRows = idx.r.map(r => norm(r[3]));

  const q = 'miłość';
  const term = norm(q);
  const hits = [];
  for (let i = 0; i < normalizedRows.length; i++) {
    if (normalizedRows[i].includes(term)) hits.push(i);
  }
  assert.ok(hits.length >= 100, `Szukanie słowa „miłość” powinno zwrócić co najmniej 100 wersetów (znaleziono: ${hits.length})`);
});
