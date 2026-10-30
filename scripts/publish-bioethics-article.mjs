#!/usr/bin/env node
/**
 * PUBLIKACJA ARTYKUŁU BIOETYCZNEGO EkoCC
 * Autor: Cezary Rogowski
 * Tytuł: Bioetyka i granice ingerencji w ludzki genom. CRISPR, syntetyczne embriony a biblijna prawda o początku życia
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const articleData = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'scripts/current-article-data.json'), 'utf8')
);

console.log('🚀 Rozpoczynam rejestrację i publikację artykułu bioetycznego...');

const articlesTsPath = path.join(ROOT, 'portals/ccn-news/src/data/articles.ts');
let tsCode = fs.readFileSync(articlesTsPath, 'utf8');

if (!tsCode.includes(articleData.id)) {
  const contentItems = [];
  for (const s of articleData.sections) {
    contentItems.push(`      '${s.heading.replace(/'/g, "\\'")}',`);
    for (const p of s.paragraphs) {
      contentItems.push(`      '${p.replace(/'/g, "\\'")}',`);
    }
  }
  contentItems.push(`      'PODSUMOWANIE REDAKCYJNE CCN',`);
  contentItems.push(`      '${articleData.conclusion.replace(/'/g, "\\'")}',`);
  contentItems.push(`      'WEZWANIE DO DZIAŁANIA I MODLITWA',`);
  contentItems.push(`      '${articleData.cta.replace(/'/g, "\\'").replace(/\n/g, ' ')}'`);

  const newArticleTsEntry = `  {
    id: '${articleData.id}',
    title: '${articleData.title.replace(/'/g, "\\'")}',
    slug: '${articleData.slug}',
    excerpt: '${articleData.lead.replace(/'/g, "\\'")}',
    content: [
${contentItems.join('\n')}
    ],
    category: 'Wiadomości i Społeczeństwo',
    categoryLabel: 'Nauka & Bioetyka',
    publishedAt: '${articleData.date}T14:00:00+01:00',
    dateFormatted: '30 października 2026',
    author: AUTHORS.cezary,
    imageUrl: '/images/news/art-${articleData.slug}.jpg',
    imageCaption: '${articleData.imageCaption.replace(/'/g, "\\'")}',
    readTimeMinutes: 8,
    isHero: true,
    isPopular: true,
    popularRank: 1,
    tags: ${JSON.stringify(articleData.tags)},
    scriptureReference: {
      verse: 'Psalm 139:13–16',
      text: 'Bo ty stworzyłeś moje nerki, utkałeś mnie w łonie mojej matki. Będę ci dziękował, że w cudowny sposób zostałem stworzony; cudowne są twoje dzieła, a moja dusza wie o tym bardzo dobrze. Żadna moja kość nie była ukryta przed tobą, gdy zostałem ukształtowany w skrytości i misternie utkany w głębiach ziemi. Twoje oczy widziały mój zalążek; a w twojej księdze zostały spisane wszystkie moje członki, które były kształtowane, gdy jeszcze żadnego z nich nie było.',
      strongCode: 'H1564'
    },
    sourceCitation: {
      sourceName: 'Nature Biotechnology & WHO Global Genome Editing Framework',
      sourceUrl: 'https://www.who.int/publications/i/item/9789240030060'
    }
  },
`;

  // 1. Dodaj do BREAKING_NEWS
  const breakingMarker = 'export const BREAKING_NEWS: string[] = [\n';
  const bIdx = tsCode.indexOf(breakingMarker);
  if (bIdx !== -1) {
    const bPos = bIdx + breakingMarker.length;
    const breakingLine = `  "CCN NAUKA & BIOETYKA: Granice ingerencji w ludzki genom. CRISPR, syntetyczne embriony a biblijna prawda o początku życia — analiza Cezarego Rogowskiego (Ps 139:13–16; Rdz 1:26–27)",\n`;
    tsCode = tsCode.slice(0, bPos) + breakingLine + tsCode.slice(bPos);
  }

  // 2. Dodaj do INITIAL_ARTICLES
  const targetIdx = tsCode.indexOf('export const INITIAL_ARTICLES: Article[] = [\n');
  if (targetIdx !== -1) {
    const insertPos = targetIdx + 'export const INITIAL_ARTICLES: Article[] = [\n'.length;
    tsCode = tsCode.slice(0, insertPos) + newArticleTsEntry + tsCode.slice(insertPos);
    fs.writeFileSync(articlesTsPath, tsCode, 'utf8');
    console.log(`✅ Artykuł dodany do bazy portals/ccn-news/src/data/articles.ts`);
  }
} else {
  console.log(`ℹ️ Artykuł ${articleData.id} już istnieje w articles.ts.`);
}

// 3. Uruchom centralny pipeline discovery EkoCC
console.log('\n🔄 Uruchamiam centralny pipeline discovery (node scripts/cc-universal-publish-discovery.mjs)...');
execSync('node scripts/cc-universal-publish-discovery.mjs', { cwd: ROOT, stdio: 'inherit' });

console.log('\n🎉 Centralny pipeline discovery i publikacja zakończone sukcesem!');
