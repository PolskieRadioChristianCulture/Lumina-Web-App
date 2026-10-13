// Buduje indeks wyszukiwarki pełnotekstowej MojaBiblia (Strażnik, 2026-10-13).
// Źródło: data/bible/<KSIĘGA>_<NR>.json (tekst UBG). Wynik: data/bible/szukaj-ubg.json
// Format: {"v":1,"b":["GEN",...],"r":[[indeksKsięgi, rozdział, werset, "tekst"], ...]}
import {readFileSync, readdirSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
const dir = join(process.cwd(), 'data', 'bible');
const meta = JSON.parse(readFileSync(join(dir, 'bible_books_metadata.json'), 'utf8'));
const order = meta.map(b => b.id);
const files = readdirSync(dir).filter(f => /^[0-9A-Z]{3}_\d+\.json$/.test(f));
const rows = [];
for (const f of files) {
  const d = JSON.parse(readFileSync(join(dir, f), 'utf8'));
  const bi = order.indexOf(d.bookId);
  if (bi < 0 || !Array.isArray(d.verses)) continue;
  for (const v of d.verses) {
    const t = v && v.text && typeof v.text.UBG === 'string' ? v.text.UBG.replace(/\s+/g, ' ').trim() : '';
    if (t) rows.push([bi, Number(d.chapter), Number(v.verse), t]);
  }
}
rows.sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]);
if (rows.length < 1000) { console.error('BIBLE_SEARCH_INDEX_TOO_SMALL ' + rows.length); process.exit(1); }
writeFileSync(join(dir, 'szukaj-ubg.json'), JSON.stringify({v: 1, b: order, r: rows}));
console.log('BIBLE_SEARCH_INDEX_OK verses=' + rows.length);
