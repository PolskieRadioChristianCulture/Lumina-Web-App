#!/usr/bin/env node
// Dzień 28 (28.10.2026): artykuł CCN „Z Biblią za Pan Brat” z wersji 5 pakietu L0 (tekst dosłownie).
// Użycie: node scripts/add-day28-ccn-article.mjs <ścieżka do pakietu .md>
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

const slug = 'z-biblia-za-pan-brat-dzien-28-ja-jestem-jozef-przebaczenie-zamiast-zemsty';
const article = {
  id: 'art-z-biblia-za-pan-brat-dzien-28',
  title: 'Z Biblią za Pan Brat: Dzień 28 — „Ja jestem Józef”: Ofiarne poręczenie Judy, teologia opatrzności i pojednanie w Księdze Rodzaju 44–45',
  slug,
  excerpt: 'Księga Rodzaju 44–45: Próba srebrnego kielicha w worku Beniamina, przełomowa mowa obrończa i dobrowolne zastępstwo Judy, odkrycie tożsamości Józefa oraz chrystocentryczna perspektywa zastępczego okupu i służby pojednania.',
  content,
  category: 'wiara',
  categoryLabel: 'Wiara & Rozwój',
  author: '__AUTHOR__',
  publishedAt: '2026-10-28T06:00:00.000Z',
  dateFormatted: '28 października 2026',
  imageUrl: `/images/news/art-${slug}.jpg`,
  imageCaption: 'Józef ujawniający tożsamość braciom i obejmujący Beniamina — ilustracja redakcyjna @A520 (Rdz 44:1–45:28). Z Biblią za Pan Brat Dzień 28',
  readTimeMinutes: 7,
  isHero: false,
  isPopular: true,
  popularRank: 2,
  tags: ['Z Biblią za Pan Brat', 'Księga Rodzaju', 'Józef', 'Juda', 'Beniamin', 'przebaczenie', 'pojednanie', 'opatrzność', 'Rdz 44', 'Rdz 45', 'Mk 10:45'],
  scriptureReference: { verse: 'Rdz 44:1–45:28; Mk 10:45; Dz 2:23–24; 2 Kor 5:18–20 (UBG)', text: '' },
  sourceCitation: { sourceName: 'Z Biblią za Pan Brat', sourceUrl: 'https://polskieradio.cc/akademia#kurscodzienny' },
  relatedCourse: { title: 'Kurs Codzienny Pisma Świętego — Dzień 28', lesson: 'Dzień 28', url: '/akademia/kurscodzienny/dzien-28' },
  resourceLinks: [
    { label: 'Otwórz Lekcję Dnia 28 w Akademii Biblijnej', url: '/akademia/kurscodzienny/dzien-28' },
    { label: 'Interlinearna MojaBiblia CC (Rdz 44–45)', url: '/mojabiblia' },
    { label: 'Akademia Biblijna LUMINA', url: '/akademia' },
  ],
};

const f = 'portals/ccn-news/src/data/articles.ts';
const raw = fs.readFileSync(f, 'utf8');
const eol = raw.includes('\r\n') ? '\r\n' : '\n';
let ts = raw.split('\r\n').join('\n');
if (ts.includes(`"id": "${article.id}"`) || ts.includes(`id: '${article.id}'`)) { console.log('Artykuł Dnia 28 już jest — bez zmian'); process.exit(0); }
const marker = 'export const INITIAL_ARTICLES: Article[] = [\n';
const at = ts.indexOf(marker);
if (at < 0) throw new Error('Brak INITIAL_ARTICLES');
const json = JSON.stringify(article, null, 2).replace('"__AUTHOR__"', 'AUTHORS.cezary').split('\n').map((l) => '  ' + l).join('\n');
ts = ts.slice(0, at + marker.length) + json + ',\n' + ts.slice(at + marker.length);
fs.writeFileSync(f, ts.split('\n').join(eol));
console.log('Dodano artykuł CCN Dnia 28:', content.length, 'akapitów');
