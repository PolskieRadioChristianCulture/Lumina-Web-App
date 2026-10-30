#!/usr/bin/env node
// Dzień 30 (30.10.2026): artykuł CCN „Z Biblią za Pan Brat” z wersji 5 pakietu L0.
import fs from 'node:fs';

const md = fs.readFileSync(process.argv[2], 'utf8').split('\r\n').join('\n');
const start = md.indexOf('WERSJA 5: PORTAL INFORMACYJNY');
if (start < 0) throw new Error('Brak wersji 5');
const lines = md.slice(start).split('\n').slice(1).map((l) => l.trim()).filter((l) => l && !/^=+$/.test(l));
if (!lines[0].includes('CCN') || !lines[1].startsWith('@CCN:')) throw new Error('Nieoczekiwany nagłówek wersji 5: ' + lines[0]);
const end = lines.findIndex((l) => l.startsWith('Wszystkie materiały formacyjne') || l.startsWith('Źródła i powiązane serwisy'));
const content = lines.slice(3, end < 0 ? undefined : end).map((l) => {
  if (/^\d+\.\s/.test(l)) return l.toUpperCase();
  if (l.startsWith('📌 ')) return l.slice(3);
  return l.replace(/^>\s*/, '').replace(/^\*\s+/, '');
});
if (content.at(-2) !== 'PODSUMOWANIE REDAKCYJNE CCN') throw new Error('Brak podsumowania redakcyjnego: ' + content.at(-2));

const slug = 'z-biblia-za-pan-brat-dzien-30-blogoslawienstwo-obietnica-i-lew-z-judy';
const article = {
  id: 'art-z-biblia-za-pan-brat-dzien-30',
  title: 'Z Biblią za Pan Brat: Dzień 30 — Błogosławieństwo Jakuba, proroctwo o berle Judy i Chrystus jako Lew i Baranek w Rdz 48–49',
  slug,
  excerpt: 'Księga Rodzaju 48–49: Ostatnie dni Jakuba, skrzyżowanie rąk nad Efraimem i Manassesem, wyrocznie nad dwunastoma synami oraz mesjańska obietnica berła Judy wypełniona w Chrystusie.',
  content,
  category: 'wiara',
  categoryLabel: 'Wiara & Rozwój',
  author: '__AUTHOR__',
  publishedAt: '2026-10-30T06:00:00.000Z',
  dateFormatted: '30 października 2026',
  imageUrl: `/images/news/art-${slug}.jpg`,
  imageCaption: 'Błogosławieństwo Jakuba i proroctwo o berle Judy — ilustracja redakcyjna @A520 (Rdz 48:1–49:33). Z Biblią za Pan Brat Dzień 30',
  readTimeMinutes: 7,
  isHero: false,
  isPopular: true,
  popularRank: 1,
  tags: ['Z Biblią za Pan Brat', 'Księga Rodzaju', 'Jakub', 'Józef', 'Juda', 'Efraim', 'Manasses', 'Lew z Judy', 'Szilo', 'berło', 'błogosławieństwo', 'Rdz 48', 'Rdz 49', 'Ap 5:5'],
  scriptureReference: { verse: 'Rdz 48:1–49:33; Ap 5:5–6; 2 Sm 7:12–16; J 10:11 (UBG)', text: '' },
  sourceCitation: { sourceName: 'Z Biblią za Pan Brat', sourceUrl: 'https://polskieradio.cc/akademia#kurscodzienny' },
  relatedCourse: { title: 'Kurs Codzienny Pisma Świętego — Dzień 30', lesson: 'Dzień 30', url: '/akademia/kurscodzienny/dzien-30' },
  resourceLinks: [
    { label: 'Otwórz Lekcję Dnia 30 w Akademii Biblijnej', url: '/akademia/kurscodzienny/dzien-30' },
    { label: 'Interlinearna MojaBiblia CC (Rdz 48–49)', url: '/mojabiblia' },
    { label: 'Akademia Biblijna LUMINA', url: '/akademia' },
  ],
};

const f = 'portals/ccn-news/src/data/articles.ts';
const raw = fs.readFileSync(f, 'utf8');
const eol = raw.includes('\r\n') ? '\r\n' : '\n';
let ts = raw.split('\r\n').join('\n');
if (ts.includes(`"id": "${article.id}"`) || ts.includes(`id: '${article.id}'`)) { console.log('Artykuł Dnia 30 już jest — bez zmian'); process.exit(0); }
const marker = 'export const INITIAL_ARTICLES: Article[] = [\n';
const at = ts.indexOf(marker);
if (at < 0) throw new Error('Brak INITIAL_ARTICLES');
const json = JSON.stringify(article, null, 2).replace('"__AUTHOR__"', 'AUTHORS.cezary').split('\n').map((l) => '  ' + l).join('\n');
ts = ts.slice(0, at + marker.length) + json + ',\n' + ts.slice(at + marker.length);
fs.writeFileSync(f, ts.split('\n').join(eol));
console.log('Dodano artykuł CCN Dnia 30:', content.length, 'akapitów');
