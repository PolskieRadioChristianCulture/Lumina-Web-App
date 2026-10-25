#!/usr/bin/env node
// Dzień 26 (26.10.2026): artykuł CCN „Z Biblią za Pan Brat” z wersji 5 pakietu L0 (tekst dosłownie), wzorzec Dnia 22.
// Użycie: node scripts/add-day26-ccn-article.mjs <ścieżka do pakietu .md>
import fs from 'node:fs';

const md = fs.readFileSync(process.argv[2], 'utf8').split('\r\n').join('\n');
const start = md.indexOf('WERSJA 5: PORTAL INFORMACYJNY');
if (start < 0) throw new Error('Brak wersji 5');
const lines = md.slice(start).split('\n').slice(2).map((l) => l.trim()).filter(Boolean);
// Nagłówek: „🌐 CCN | …”, „@CCN: TYTUŁ”, „Księga Rodzaju — Miesiąc 1 | Dzień 26 (…)”
if (!lines[0].startsWith('🌐 CCN') || !lines[1].startsWith('@CCN:')) throw new Error('Nieoczekiwany nagłówek wersji 5');
const end = lines.findIndex((l) => l.startsWith('Wszystkie materiały formacyjne'));
const content = lines.slice(3, end < 0 ? undefined : end).map((l) => {
  if (/^\d+\.\s/.test(l)) return l.toUpperCase();
  if (l.startsWith('📌 ')) return l.slice(3);
  return l.replace(/^>\s*/, '').replace(/^\*\s+/, '');
});
if (content.at(-2) !== 'PODSUMOWANIE REDAKCYJNE CCN') throw new Error('Brak podsumowania redakcyjnego');

const slug = 'z-biblia-za-pan-brat-dzien-26-od-wiezienia-do-palacu';
const article = {
  id: 'art-z-biblia-za-pan-brat-dzien-26',
  title: 'Z Biblią za Pan Brat: Dzień 26 — Od więzienia do pałacu: Teologia oczekiwania, roztropności gospodarczej i opatrzności (Rdz 40–41)',
  slug,
  excerpt: 'Księga Rodzaju 40–41: Józef zapomniany w więzieniu, sny podczaszego, piekarza i faraona, plan na siedem lat obfitości i głodu oraz wywyższenie Józefa jako sługi ocalenia wielu.',
  content,
  category: 'wiara',
  categoryLabel: 'Wiara & Rozwój',
  author: '__AUTHOR__',
  publishedAt: '2026-10-26T06:00:00.000Z',
  dateFormatted: '26 października 2026',
  imageUrl: `/images/news/art-${slug}.jpg`,
  imageCaption: 'Józef przed faraonem — Adrien Guignet, „Józef i faraon” (1845), domena publiczna, Wikimedia Commons. Z Biblią za Pan Brat Dzień 26',
  readTimeMinutes: 7,
  isHero: false,
  isPopular: true,
  popularRank: 2,
  tags: ['Z Biblią za Pan Brat', 'Księga Rodzaju', 'Józef', 'faraon', 'sny', 'opatrzność', 'roztropność', 'Chleb Życia', 'Rdz 40', 'Rdz 41', 'J 6:35'],
  scriptureReference: { verse: 'Rdz 40:1–41:57; Dn 2:27–28; J 6:35; J 16:33 (UBG)', text: '' },
  sourceCitation: { sourceName: 'Z Biblią za Pan Brat', sourceUrl: 'https://polskieradio.cc/akademia#kurscodzienny' },
  relatedCourse: { title: 'Kurs Codzienny Pisma Świętego — Dzień 26', lesson: 'Dzień 26', url: '/akademia/kurscodzienny/dzien-26' },
  resourceLinks: [
    { label: 'Otwórz Lekcję Dnia 26 w Akademii Biblijnej', url: '/akademia/kurscodzienny/dzien-26' },
    { label: 'Interlinearna MojaBiblia CC (Rdz 40–41)', url: '/mojabiblia' },
    { label: 'Akademia Biblijna LUMINA', url: '/akademia' },
  ],
};

const f = 'portals/ccn-news/src/data/articles.ts';
const raw = fs.readFileSync(f, 'utf8');
const eol = raw.includes('\r\n') ? '\r\n' : '\n';
let ts = raw.split('\r\n').join('\n');
if (ts.includes(`"id": "${article.id}"`)) { console.log('Artykuł Dnia 26 już jest — bez zmian'); process.exit(0); }
const marker = 'export const INITIAL_ARTICLES: Article[] = [\n';
const at = ts.indexOf(marker);
if (at < 0) throw new Error('Brak INITIAL_ARTICLES');
const json = JSON.stringify(article, null, 2).replace('"__AUTHOR__"', 'AUTHORS.cezary').split('\n').map((l) => '  ' + l).join('\n');
ts = ts.slice(0, at + marker.length) + json + ',\n' + ts.slice(at + marker.length);
fs.writeFileSync(f, ts.split('\n').join(eol));
console.log('Dodano artykuł CCN Dnia 26:', content.length, 'akapitów');
