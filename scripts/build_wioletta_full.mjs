/**
 * build_wioletta_full.mjs
 * Parsuje WSZYSTKIE 25 rozdziałów autorki Wioletty Rogowskiej
 * i generuje data/ksiazki/pardon-czy-to-milosc/tom-1-rozdzialy.json
 * oraz js/wioletta-reader-data.js
 * 
 * Użycie: node scripts/build_wioletta_full.mjs
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, '..');
const BRAIN = 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\d6fb6723-88d9-47dd-951a-c934e6675ed7';

// ──────────────────────────────────────────────────────────────────────────────
// 1. Wczytaj wszystkie pliki źródłowe
// ──────────────────────────────────────────────────────────────────────────────
const FILES = [
  { path: join(BRAIN, 'CH01_04_extracted.txt'), chapters: [1,2,3,4] },
  { path: join(BRAIN, 'CH05_08_extracted.txt'), chapters: [5,6,7,8] },
  { path: join(BRAIN, 'CH09_12_extracted.txt'), chapters: [9,10,11,12] },
  { path: join(BRAIN, 'CH13_16_extracted.txt'), chapters: [13,14,15,16] },
  { path: join(BRAIN, 'FILE_1_extracted.txt'),  chapters: [17,18,19,20] },
  { path: join(BRAIN, 'FILE_2_extracted.txt'),  chapters: [21,22,23,24,25] },
];

// Tytuły rozdziałów wyciągnięte z nagłówków DOCX
const CHAPTER_TITLES = {
  1:  'Pardon!',
  2:  'Złota Róża',
  3:  'Dom z przeszłością',
  4:  'Słowa, których się nie cofa',
  5:  'Zdecydowanie nie mój typ',
  6:  'Herbata o siódmej',
  7:  'Granice',
  8:  'Jeden krok dalej',
  9:  'Pięć minut za długo',
  10: 'Co zostaje po milczeniu',
  11: 'Listy bez adresata',
  12: 'Próg',
  13: 'Cienie na fotografii',
  14: 'Co wiedzą sąsiedzi',
  15: 'Zapis',
  16: 'Przed decyzją',
  17: 'List, którego nie wysłano',
  18: 'Wyznanie',
  19: 'Psalm trzynasty',
  20: 'Publiczne zobowiązanie',
  21: 'Imię mojego ojca',
  22: 'List do Zofii',
  23: 'Dom pod Złotą Różą',
  24: 'Przebaczenie',
  25: 'Pardon, Czy To Miłość?',
};

// ──────────────────────────────────────────────────────────────────────────────
// 2. Parser — obsługuje różne formaty nagłówków rozdziałów:
//    Format A: "N. Tytuł"  (ch 1-8, 17-25)
//    Format B: "Rozdział N — Tytuł"  (ch 9-12)
//    Format C: "Rozdział N\n\nTytuł"  (ch 13-16, tytuł na oddzielnej linii)
// ──────────────────────────────────────────────────────────────────────────────
function parseChapters(text, expectedNums) {
  const results = {};
  
  for (const num of expectedNums) {
    // Spróbuj każdy format nagłówka
    const patterns = [
      // Format A: "5. Tytuł\n"
      new RegExp(`^${num}\\. .+\\n`, 'm'),
      // Format B: "Rozdział 9 — Tytuł\n"  lub "Rozdział 9: Tytuł"
      new RegExp(`^Rozdział\\s+${num}\\s*[—:\\-]\\s*.+\\n`, 'm'),
      // Format C: "Rozdział 9\n" (tytuł na następnej linii)
      new RegExp(`^Rozdział\\s+${num}\\s*\\n`, 'm'),
    ];
    
    let startIdx = -1;
    let headerLen = 0;
    
    for (const pat of patterns) {
      const m = text.match(pat);
      if (m) {
        startIdx = m.index;
        headerLen = m[0].length;
        // Format C: pomiń też ewentualny tytuł na następnej linii
        if (pat.source.includes('\\s*\\n$') || pat.source.endsWith('\\s*\\\\n')) {
          // nothing extra needed — handled below
        }
        break;
      }
    }
    
    if (startIdx < 0) {
      console.warn(`  ⚠️  Nie znaleziono nagłówka dla rozdziału ${num}`);
      results[num] = '';
      continue;
    }
    
    // Znajdź koniec tego rozdziału = początek następnego
    const nextNum = expectedNums[expectedNums.indexOf(num) + 1];
    let endIdx = text.length;
    if (nextNum !== undefined) {
      const nextPatterns = [
        new RegExp(`^${nextNum}\\. `, 'm'),
        new RegExp(`^Rozdział\\s+${nextNum}[\\s—:\\-]`, 'm'),
      ];
      for (const p of nextPatterns) {
        const nm = text.match(p);
        if (nm && nm.index > startIdx) { endIdx = nm.index; break; }
      }
    }
    
    // Wyciągnij body (pomiń nagłówek)
    let body = text.slice(startIdx + headerLen, endIdx).trim();
    
    // Format C (Rozdział N\n\nTytuł\n): pomiń pierwszą linię (to tytuł)
    // Jeśli body zaczyna się od niezbyt długiej linii (max 80 znaków) bez dialogu — to tytuł
    const firstLine = body.split('\n')[0].trim();
    if (firstLine.length > 0 && firstLine.length < 80 && !firstLine.startsWith('—') && !firstLine.startsWith('Aleksandra') && !firstLine.match(/^\w{1,3}\s/)) {
      // To prawdopodobnie tytuł rozdziału — pomijamy go
      body = body.slice(body.indexOf('\n') + 1).trim();
    }
    
    results[num] = body;
  }
  
  return results;
}

// ──────────────────────────────────────────────────────────────────────────────
// 3. Wyciągnij tytuły z nagłówków w tekście
// ──────────────────────────────────────────────────────────────────────────────
function extractTitleFromText(text, num) {
  // Format A: "5. Zdecydowanie nie mój typ"
  let re = new RegExp(`^${num}\\. (.+)$`, 'm');
  let m = text.match(re);
  if (m) return m[1].trim();
  
  // Format B: "Rozdział 9 — Pięć minut za długo"
  re = new RegExp(`^Rozdział\\s+${num}\\s*[—:\\-]\\s*(.+)$`, 'm');
  m = text.match(re);
  if (m) return m[1].trim();
  
  // Format C: "Rozdział 13\n\nCienie na fotografii"
  re = new RegExp(`^Rozdział\\s+${num}\\s*\\n+([^\\n]+)`, 'm');
  m = text.match(re);
  if (m) return m[1].trim();
  
  return CHAPTER_TITLES[num] || `Rozdział ${num}`;
}

// ──────────────────────────────────────────────────────────────────────────────
// 4. Statystyki tekstu
// ──────────────────────────────────────────────────────────────────────────────
function countWords(text) {
  return text.split(/\s+/).filter(w => w.length > 0).length;
}

function readingTime(wordCount) {
  return Math.ceil(wordCount / 250); // 250 słów/minutę
}

function excerpt(text, maxLen = 220) {
  const plain = text.replace(/\n+/g, ' ').trim();
  if (plain.length <= maxLen) return plain;
  return plain.slice(0, maxLen).replace(/\s+\S*$/, '') + '…';
}

// ──────────────────────────────────────────────────────────────────────────────
// 5. Główna logika
// ──────────────────────────────────────────────────────────────────────────────
const allChapters = {};

for (const fileInfo of FILES) {
  const raw = readFileSync(fileInfo.path, 'utf8');
  const parsed = parseChapters(raw, fileInfo.chapters);
  
  for (const num of fileInfo.chapters) {
    const body = parsed[num] || '';
    const title = extractTitleFromText(raw, num);
    const wc = countWords(body);
    
    allChapters[num] = {
      nr: num,
      tytul: title,
      tekst: body,
      wordCount: wc,
      readingTimeMin: readingTime(wc),
      excerpt: excerpt(body),
    };
    
    console.log(`  Ch ${String(num).padStart(2,' ')}: "${title}" — ${wc} słów, ${readingTime(wc)} min czytania`);
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// 6. Walidacja — czy mamy wszystkie 25?
// ──────────────────────────────────────────────────────────────────────────────
const missing = [];
for (let i = 1; i <= 25; i++) {
  if (!allChapters[i] || allChapters[i].tekst.length < 50) {
    missing.push(i);
  }
}
if (missing.length > 0) {
  console.error('BRAKUJĄCE ROZDZIAŁY:', missing);
  process.exit(1);
}

console.log(`\n✅ Wszystkie 25 rozdziałów sparsowane pomyślnie.`);
const totalWords = Object.values(allChapters).reduce((s, c) => s + c.wordCount, 0);
console.log(`   Łącznie: ${totalWords.toLocaleString('pl')} słów, ~${Math.ceil(totalWords/250)} min czytania\n`);

// ──────────────────────────────────────────────────────────────────────────────
// 7. Zapisz JSON
// ──────────────────────────────────────────────────────────────────────────────
const jsonOut = {
  meta: {
    tytul: 'Pardon, Czy To Miłość?',
    autor: 'Wioletta Rogowska',
    tom: 1,
    rozdzialy: 25,
    totalWords,
    totalReadingTimeMin: Math.ceil(totalWords / 250),
    wersja: '1.0.0',
    dataBudowy: new Date().toISOString().slice(0,10),
    status: 'Tom I — kompletny',
  },
  rozdzialy: Object.values(allChapters).map(c => ({
    nr: c.nr,
    tytul: c.tytul,
    excerpt: c.excerpt,
    wordCount: c.wordCount,
    readingTimeMin: c.readingTimeMin,
    tekst: c.tekst,
  })),
};

const dataDir = join(ROOT, 'data', 'ksiazki', 'pardon-czy-to-milosc');
mkdirSync(dataDir, { recursive: true });
const jsonPath = join(dataDir, 'tom-1-rozdzialy.json');
writeFileSync(jsonPath, JSON.stringify(jsonOut, null, 2), 'utf8');
console.log('📄 Zapisano:', jsonPath);

// ──────────────────────────────────────────────────────────────────────────────
// 8. Generuj js/wioletta-reader-data.js
// ──────────────────────────────────────────────────────────────────────────────
// Minimalna wersja do przeglądarki — tekst w pełni zawarty
const jsBundle = `/* wioletta-reader-data.js — generowany automatycznie — NIE EDYTUJ RĘCZNIE */
/* Autor: Wioletta Rogowska | © 2026 Wszelkie prawa zastrzeżone */
window.WIOLETTA_BOOK_DATA = ${JSON.stringify(jsonOut, null, 0)};
`;

const jsPath = join(ROOT, 'js', 'wioletta-reader-data.js');
writeFileSync(jsPath, jsBundle, 'utf8');
console.log('📦 Zapisano:', jsPath, `(${(jsBundle.length/1024).toFixed(1)} KB)`);

// ──────────────────────────────────────────────────────────────────────────────
// 9. Generuj Markdown maszynopisu
// ──────────────────────────────────────────────────────────────────────────────
let md = `# Pardon, Czy To Miłość? — Tom I\n`;
md += `**Autor:** Wioletta Rogowska  \n`;
md += `**Wygenerowano:** ${new Date().toLocaleDateString('pl')}  \n`;
md += `**Łącznie:** ${totalWords.toLocaleString('pl')} słów, 25 rozdziałów\n\n---\n\n`;

for (const c of jsonOut.rozdzialy) {
  md += `## Rozdział ${c.nr}: ${c.tytul}\n\n`;
  md += c.tekst + '\n\n---\n\n';
}

const mdPath = join(dataDir, 'tom-1-maszynopis.md');
writeFileSync(mdPath, md, 'utf8');
console.log('📝 Zapisano:', mdPath);
console.log('\n✅ GOTOWE — skrypt zakończył pracę.\n');
