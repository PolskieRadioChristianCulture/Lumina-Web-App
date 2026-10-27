#!/usr/bin/env node
// Dzień 27 (27.10.2026): artykuł CCN „Z Biblią za Pan Brat” z wersji 5 pakietu L0 (tekst dosłownie).
// Użycie: node scripts/add-day27-ccn-article.mjs <ścieżka do pakietu .md>
import fs from 'node:fs';

const md = fs.readFileSync(process.argv[2], 'utf8').split('\r\n').join('\n');
const start = md.indexOf('WERSJA 5: PORTAL INFORMACYJNY');
if (start < 0) throw new Error('Brak wersji 5');
const lines = md.slice(start).split('\n').slice(1).map((l) => l.trim()).filter(Boolean);
if (!lines[0].startsWith('🌐 CCN') || !lines[1].startsWith('@CCN:')) throw new Error('Nieoczekiwany nagłówek wersji 5: ' + lines[0]);
const end = lines.findIndex((l) => l.startsWith('Wszystkie materiały formacyjne'));
const content = lines.slice(3, end < 0 ? undefined : end).map((l) => {
  if (/^\d+\.\s/.test(l)) return l.toUpperCase();
  if (l.startsWith('📌 ')) return l.slice(3);
  return l.replace(/^>\s*/, '').replace(/^\*\s+/, '');
});
if (content.at(-2) !== 'PODSUMOWANIE REDAKCYJNE CCN') throw new Error('Brak podsumowania redakcyjnego: ' + content.at(-2));

const slug = 'z-biblia-za-pan-brat-dzien-27-gdy-przeszlosc-wraca-bracia-jozefa';
const article = {
  id: 'art-z-biblia-za-pan-brat-dzien-27',
  title: 'Z Biblią za Pan Brat: Dzień 27 — Gdy przeszłość wraca: Przebudzenie sumienia braci Józefa i odpowiedzialność Judy w Księdze Rodzaju 42–43',
  slug,
  excerpt: 'Księga Rodzaju 42–43: Dwie wyprawy synów Jakuba po zboże do Egiptu, budzące się po dwudziestu latach sumienie braci, osobiste poręczenie Judy za Beniamina oraz Chrystus jako doskonały Poręczyciel nowego przymierza.',
  content,
  category: 'wiara',
  categoryLabel: 'Wiara & Rozwój',
  author: '__AUTHOR__',
  publishedAt: '2026-10-27T06:00:00.000Z',
  dateFormatted: '27 października 2026',
  imageUrl: `/images/news/art-${slug}.jpg`,
  imageCaption: 'Bracia Józefa kłaniający się przed zarządcą Egiptu — ilustracja redakcyjna @A520 (Rdz 42:1–43:34). Z Biblią za Pan Brat Dzień 27',
  readTimeMinutes: 7,
  isHero: false,
  isPopular: true,
  popularRank: 2,
  tags: ['Z Biblią za Pan Brat', 'Księga Rodzaju', 'Józef', 'Bracia Józefa', 'Juda', 'Beniamin', 'sumienie', 'pojednanie', 'Rdz 42', 'Rdz 43', '1 J 1:9'],
  scriptureReference: { verse: 'Rdz 42:1–43:34; 1 J 1:9; Hbr 7:22; Hbr 9:15; 2 Kor 5:17 (UBG)', text: '' },
  sourceCitation: { sourceName: 'Z Biblią za Pan Brat', sourceUrl: 'https://polskieradio.cc/akademia#kurscodzienny' },
  relatedCourse: { title: 'Kurs Codzienny Pisma Świętego — Dzień 27', lesson: 'Dzień 27', url: '/akademia/kurscodzienny/dzien-27' },
  resourceLinks: [
    { label: 'Otwórz Lekcję Dnia 27 w Akademii Biblijnej', url: '/akademia/kurscodzienny/dzien-27' },
    { label: 'Interlinearna MojaBiblia CC (Rdz 42–43)', url: '/mojabiblia' },
    { label: 'Akademia Biblijna LUMINA', url: '/akademia' },
  ],
};

const f = 'portals/ccn-news/src/data/articles.ts';
const raw = fs.readFileSync(f, 'utf8');
const eol = raw.includes('\r\n') ? '\r\n' : '\n';
let ts = raw.split('\r\n').join('\n');
if (ts.includes(`"id": "${article.id}"`) || ts.includes(`id: '${article.id}'`)) { console.log('Artykuł Dnia 27 już jest — bez zmian'); process.exit(0); }
const marker = 'export const INITIAL_ARTICLES: Article[] = [\n';
const at = ts.indexOf(marker);
if (at < 0) throw new Error('Brak INITIAL_ARTICLES');
const json = JSON.stringify(article, null, 2).replace('"__AUTHOR__"', 'AUTHORS.cezary').split('\n').map((l) => '  ' + l).join('\n');
ts = ts.slice(0, at + marker.length) + json + ',\n' + ts.slice(at + marker.length);
fs.writeFileSync(f, ts.split('\n').join(eol));
console.log('Dodano artykuł CCN Dnia 27:', content.length, 'akapitów');
