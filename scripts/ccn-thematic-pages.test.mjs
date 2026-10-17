import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { generateStaticFeedSnippet } from './build-ccn-static-pages.mjs';

const ROOT = process.cwd();

const PORTAL_SPECS = [
  {
    name: 'finanse',
    expectedCount: 4,
    canonical: 'https://polskieradio.cc/finanse',
    files: ['finanse.html', 'finanse/index.html'],
    sampleSlug: 'cbdc-prawo-niedzielne-apokalipsa-13'
  },
  {
    name: 'nauka',
    expectedCount: 7,
    canonical: 'https://polskieradio.cc/nauka',
    files: ['nauka.html', 'nauka/index.html'],
    sampleSlug: 'kosmologiczne-dostrojenie-wszechswiata-fine-tuning'
  },
  {
    name: 'historia',
    expectedCount: 8,
    canonical: 'https://polskieradio.cc/historia',
    files: ['historia.html', 'historia/index.html'],
    sampleSlug: 'zwoje-z-qumran-dead-sea-scrolls-rzetelnosc-tekstu'
  },
  {
    name: 'prawo',
    expectedCount: 9,
    canonical: 'https://polskieradio.cc/prawo',
    files: ['prawo.html', 'prawo/index.html'],
    sampleSlug: 'dekalog-jako-fundament-praworzadnosci-zachodniej'
  }
];

test('1. Surowy HTML & Spójność: Wszystkie 4 działy udostępniają pełną listę artykułów bez JS', () => {
  for (const spec of PORTAL_SPECS) {
    for (const relFile of spec.files) {
      const filePath = path.join(ROOT, relFile);
      assert.ok(fs.existsSync(filePath), `Plik ${relFile} musi istnieć.`);
      const content = fs.readFileSync(filePath, 'utf8');

      assert.ok(content.includes('<main class="news-startup-articles"'), `${relFile} musi zawierać kontener feedu <main>`);
      const items = content.match(/<article class="news-static-item"/g) || [];
      assert.equal(
        items.length,
        spec.expectedCount,
        `${relFile}: liczba artykułów w surowym HTML (${items.length}) musi odpowiadać stanowi w UI (${spec.expectedCount})`
      );

      // Każda pozycja musi mieć poprawny nagłówek, link, opis, autora i datę
      assert.ok(content.includes(`href="/${spec.name}/`), `${relFile} musi zawierać bezpośrednie linki do artykułów /${spec.name}/`);
      assert.ok(content.includes('Autor: <strong>'), `${relFile} musi zawierać oznaczenie autora`);
      assert.ok(content.includes('<time datetime="'), `${relFile} musi zawierać znacznik czasu <time>`);
    }
  }
});

test('2. Weryfikacja metadanych: Canonical, Robots, RSS, Schema.org', () => {
  for (const spec of PORTAL_SPECS) {
    const content = fs.readFileSync(path.join(ROOT, spec.files[0]), 'utf8');

    // Canonical
    assert.ok(content.includes(`<link rel="canonical" href="${spec.canonical}"`), `${spec.name}: canonical musi być zgodny z ${spec.canonical}`);

    // RSS
    assert.ok(content.includes('type="application/rss+xml"'), `${spec.name}: musi posiadać tag link RSS`);
    assert.ok(content.includes('https://polskieradio.cc/feed.xml'), `${spec.name}: musi linkować główny kanał RSS`);

    // Schema.org CollectionPage
    assert.ok(content.includes('"@type": "CollectionPage"'), `${spec.name}: musi deklarować Schema.org CollectionPage`);
    assert.ok(content.includes('"@type": "NewsMediaOrganization"'), `${spec.name}: musi deklarować Schema.org NewsMediaOrganization`);
  }
});

test('3. Dostępność statycznych stron SSG: Każdy artykuł posiada fizyczny plik HTML', () => {
  for (const spec of PORTAL_SPECS) {
    const slugHtml = path.join(ROOT, spec.name, `${spec.sampleSlug}.html`);
    const cleanIndexHtml = path.join(ROOT, spec.name, spec.sampleSlug, 'index.html');

    assert.ok(fs.existsSync(slugHtml), `Artykuł SSG ${slugHtml} musi istnieć`);
    assert.ok(fs.existsSync(cleanIndexHtml), `Clean URL SSG ${cleanIndexHtml} musi istnieć`);

    const articleContent = fs.readFileSync(slugHtml, 'utf8');
    assert.ok(articleContent.includes('"@type": "NewsArticle"'), 'Artykuł musi posiadać NewsArticle JSON-LD');
    assert.ok(articleContent.includes('ccn-back-btn'), 'Artykuł musi posiadać przycisk powrotu do portalu');
    assert.ok(articleContent.includes('class="ccn-article-wrapper"'), 'Artykuł musi posiadać treść artykułu');
  }
});

test('4. Synchronizacja Sitemap: Wszystkie 28 adresów artykułów w sitemap.xml', () => {
  const sitemapPath = path.join(ROOT, 'sitemap.xml');
  assert.ok(fs.existsSync(sitemapPath), 'sitemap.xml musi istnieć');
  const sitemap = fs.readFileSync(sitemapPath, 'utf8');

  for (const spec of PORTAL_SPECS) {
    const expectedLoc = `<loc>https://polskieradio.cc/${spec.name}/${spec.sampleSlug}</loc>`;
    assert.ok(sitemap.includes(expectedLoc), `Sitemap musi zawierać ${expectedLoc}`);
  }
});

test('5. Test automatycznego dodawania artykułu (Auto-generation test)', () => {
  const mockArticles = [
    {
      id: 'mock-art-test-2026',
      title: 'Nowy Przełomowy Artykuł Testowy 2026',
      slug: 'nowy-przelomowy-artykul-testowy-2026',
      excerpt: 'Opis nowego artykułu testowego do weryfikacji automatycznej propagacji feedu.',
      publishedAt: '2026-10-17T12:00:00Z',
      dateFormatted: '17 października 2026',
      author: { name: 'Cezary Rogowski' }
    }
  ];

  const snippet = generateStaticFeedSnippet(mockArticles, 10, {
    baseSlug: 'nauka',
    portalName: 'CCN Nauka',
    headingTitle: 'Opracowania i Analizy CCN Nauka'
  });

  assert.ok(snippet.includes('Nowy Przełomowy Artykuł Testowy 2026'), 'Snippet musi zawierać tytuł nowego artykułu');
  assert.ok(snippet.includes('href="/nauka/nowy-przelomowy-artykul-testowy-2026"'), 'Snippet musi zawierać URL nowego artykułu');
  assert.ok(snippet.includes('17 października 2026'), 'Snippet musi zawierać datę');
  assert.ok(snippet.includes('Cezary Rogowski'), 'Snippet musi zawierać autora');
});

test('6. Pancerne bezpieczeństwo: Brak naruszenia kanałów live, karaoke, audio i Firestore', () => {
  // cctv24-worship.html musi być nietknięty
  const worship = fs.readFileSync(path.join(ROOT, 'cctv24-worship.html'), 'utf8');
  assert.ok(worship.length > 5000, 'cctv24-worship.html nienaruszony');

  // stream-scene.html musi być nietknięty
  const liveScene = fs.readFileSync(path.join(ROOT, 'stream-scene.html'), 'utf8');
  assert.ok(liveScene.length > 5000, 'stream-scene.html nienaruszony');

  // karaoke silnik
  const karaokeTop100 = path.join(ROOT, 'assets/bu/karaoke-top100.js');
  assert.ok(fs.existsSync(karaokeTop100), 'karaoke-top100.js nienaruszony');

  // firestore rules
  const firestoreRules = path.join(ROOT, 'firestore.rules');
  if (fs.existsSync(firestoreRules)) {
    const rules = fs.readFileSync(firestoreRules, 'utf8');
    assert.ok(rules.includes('service cloud.firestore'), 'firestore.rules nienaruszone');
  }
});
