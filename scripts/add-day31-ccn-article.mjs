#!/usr/bin/env node
// Dzień 31 (31.10.2026): artykuł CCN „Z Biblią za Pan Brat” z wersji 5 pakietu L0.
import fs from 'node:fs';

const md = fs.readFileSync('scripts/content/pakiet-day31-5wersji.md', 'utf8').split('\r\n').join('\n');
const start = md.indexOf('WERSJA 5: PORTAL INFORMACYJNY');
if (start < 0) throw new Error('Brak wersji 5');
const lines = md.slice(start).split('\n').slice(1).map((l) => l.trim()).filter((l) => l && !/^=+$/.test(l));
if (!lines[0].includes('CCN') || !lines[1].startsWith('## @CCN:')) throw new Error('Nieoczekiwany nagłówek wersji 5: ' + lines[0]);
const end = lines.findIndex((l) => l.startsWith('Wszystkie materiały formacyjne') || l.startsWith('*Wszystkie materiały formacyjne') || l.startsWith('🌐 **Źródła'));
const content = lines.slice(3, end < 0 ? undefined : end).map((l) => {
  if (/^\d+\.\s/.test(l)) return l.toUpperCase();
  if (l.startsWith('📌 ')) return l.slice(3);
  return l.replace(/^>\s*/, '').replace(/^\*\s+/, '');
});

const slug = 'z-biblia-za-pan-brat-dzien-31-bog-obrocil-to-w-dobro';
const article = {
  id: 'art-z-biblia-za-pan-brat-dzien-31',
  title: 'Z Biblią za Pan Brat: Dzień 31 — Bóg obrócił to w dobro: pochówek Jakuba, wiara Józefa i Ewangelia Opatrzności w Rdz 50',
  slug,
  excerpt: 'Księga Rodzaju 50: Finał Księgi Rodzaju — pochówek Jakuba w Kanaanie, lęk braci przed zemstą, wyznanie Bożej Opatrzności i kości Józefa w świetle Chrystusa.',
  content,
  category: 'wiara',
  categoryLabel: 'Wiara & Rozwój',
  author: '__AUTHOR__',
  publishedAt: '2026-10-31T06:00:00.000Z',
  dateFormatted: '31 października 2026',
  imageUrl: `/images/news/art-${slug}.jpg`,
  imageCaption: 'Bóg obrócił to w dobro — pojednanie Józefa z braćmi (Rdz 50:1–26). Z Biblią za Pan Brat Dzień 31',
  readTimeMinutes: 7,
  isHero: false,
  isPopular: true,
  popularRank: 1,
  tags: ['Z Biblią za Pan Brat', 'Księga Rodzaju', 'Józef', 'Jakub', 'przebaczenie', 'Opatrzność', 'kości Józefa', 'Machpela', 'Rdz 50', 'Rz 8:28'],
  scriptureReference: { verse: 'Rdz 50:1–26; Rz 8:28; Dz 2:23–24; Hbr 11:22 (UBG)', text: '' },
  sourceCitation: { sourceName: 'Z Biblią za Pan Brat', sourceUrl: 'https://polskieradio.cc/akademia#kurscodzienny' },
  relatedCourse: { title: 'Kurs Codzienny Pisma Świętego — Dzień 31', lesson: 'Dzień 31', url: '/akademia/kurscodzienny/dzien-31' },
  resourceLinks: [
    { label: 'Otwórz Lekcję Dnia 31 w Akademii Biblijnej', url: '/akademia/kurscodzienny/dzien-31' },
    { label: 'Interlinearna MojaBiblia CC (Rdz 50)', url: '/mojabiblia' },
    { label: 'Akademia Biblijna LUMINA', url: '/akademia' },
  ],
};

const f = 'portals/ccn-news/src/data/articles.ts';
const raw = fs.readFileSync(f, 'utf8');
const eol = raw.includes('\r\n') ? '\r\n' : '\n';
let ts = raw.split('\r\n').join('\n');
if (ts.includes(`"id": "${article.id}"`) || ts.includes(`id: '${article.id}'`)) {
  console.log('Artykuł Dnia 31 już jest — bez zmian');
  process.exit(0);
}
const marker = 'export const INITIAL_ARTICLES: Article[] = [\n';
const at = ts.indexOf(marker);
if (at < 0) throw new Error('Brak INITIAL_ARTICLES');
const json = JSON.stringify(article, null, 2).replace('"__AUTHOR__"', 'AUTHORS.cezary').split('\n').map((l) => '  ' + l).join('\n');
ts = ts.slice(0, at + marker.length) + json + ',\n' + ts.slice(at + marker.length);
fs.writeFileSync(f, ts.split('\n').join(eol));
console.log('Dodano artykuł CCN Dnia 31:', content.length, 'akapitów');
