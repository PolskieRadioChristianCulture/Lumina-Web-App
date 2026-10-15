import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

test('1. index.html - Global SEO Metatags & Identity', () => {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

  // Title
  assert.ok(html.includes('<title>Christian Culture — Radio, Biblia, filmy, społeczność i kursy</title>'), 'Homepage title matches spec');

  // Meta Description
  assert.ok(html.includes('content="Christian Culture — wszystko, czego potrzebujesz, w jednym miejscu. Radio na żywo, Biblia, filmy, kursy, społeczność i wartościowe treści. Odkrywaj za darmo!"'), 'Meta description matches spec');

  // Robots & Canonical
  assert.ok(html.includes('<meta name="robots" content="index, follow, max-image-preview:large">'), 'Robots tag matches spec');
  assert.ok(html.includes('<link rel="canonical" href="https://polskieradio.cc/">'), 'Canonical matches spec');
  assert.ok(html.includes('<meta name="author" content="Christian Culture">'), 'Author matches spec');
  assert.ok(html.includes('<meta name="theme-color" content="#F9FAFC">'), 'Theme color matches spec');

  // Open Graph
  assert.ok(html.includes('<meta property="og:site_name" content="Christian Culture">'), 'OG site_name matches');
  assert.ok(html.includes('<meta property="og:title" content="Christian Culture — Wszystko, czego potrzebujesz, w jednym miejscu">'), 'OG title matches');
  assert.ok(html.includes('<meta property="og:description" content="Radio, Biblia, filmy, kursy, społeczność i wartościowe treści chrześcijańskie. Poznaj Christian Culture.">'), 'OG description matches');
  assert.ok(html.includes('<meta property="og:url" content="https://polskieradio.cc/">'), 'OG url matches');

  // Twitter Cards
  assert.ok(html.includes('<meta name="twitter:card" content="summary_large_image">'), 'Twitter card matches');
  assert.ok(html.includes('<meta name="twitter:title" content="Christian Culture — Wszystko w jednym miejscu">'), 'Twitter title matches');
  assert.ok(html.includes('<meta name="twitter:description" content="Radio, Biblia, filmy, kursy, społeczność i inspiracje. Odkryj Christian Culture.">'), 'Twitter description matches');

  // No obsolete meta keywords
  assert.ok(!html.includes('<meta name="keywords"'), 'Obsolete meta keywords removed');

  // Hero H1, Subtitle, and Intro
  assert.ok(html.includes('<h1 class="hero-title">Christian Culture</h1>'), 'H1 matches spec');
  assert.ok(html.includes('<p class="hero-subtitle">Wszystko, czego potrzebujesz, w jednym miejscu.</p>'), 'Subtitle matches spec');
  assert.ok(html.includes('Christian Culture to chrześcijański ekosystem mediów, edukacji, społeczności i nowoczesnych narzędzi.'), 'Intro text matches spec');
});

test('2. index.html - Schema.org Organization & WebSite', () => {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

  // Schema.org script
  assert.ok(html.includes('"@id": "https://polskieradio.cc/#organization"'), 'Organization ID present');
  assert.ok(html.includes('"name": "Christian Culture"'), 'Organization name present');
  assert.ok(html.includes('"slogan": "Wszystko, czego potrzebujesz, w jednym miejscu."'), 'Organization slogan present');
  assert.ok(html.includes('"https://youtube.com/@ChristianCultureTV"'), 'sameAs YouTube CC TV present');
  assert.ok(html.includes('"https://linktr.ee/christianculture"'), 'sameAs Linktree present');
  assert.ok(html.includes('"@id": "https://polskieradio.cc/#website"'), 'WebSite ID present');
  assert.ok(html.includes('"inLanguage": "pl-PL"'), 'inLanguage pl-PL present');
});

test('3. szukaj.html & szukaj/index.html - SEO & Schema.org', () => {
  for (const rel of ['szukaj.html', 'szukaj/index.html']) {
    const html = fs.readFileSync(path.join(ROOT, rel), 'utf8');

    // Title & Description
    assert.ok(html.includes('<title>Christian Culture Search — Znajdź radio, Biblię, filmy i więcej</title>'), `${rel} title matches`);
    assert.ok(html.includes('Szukasz radia chrześcijańskiego, Biblii, kursów lub wartościowych filmów? Christian Culture Search pomaga odkrywać projekty i treści ekosystemu polskieradio.cc.'), `${rel} description matches`);

    // Canonical & Robots
    assert.ok(html.includes('<link rel="canonical" href="https://polskieradio.cc/szukaj">'), `${rel} canonical matches`);
    assert.ok(html.includes('<meta name="robots" id="metaRobots" content="index, follow, max-image-preview:large">'), `${rel} robots matches`);

    // Schema.org WebPage
    assert.ok(html.includes('"@id": "https://polskieradio.cc/szukaj#webpage"'), `${rel} WebPage schema ID matches`);
    assert.ok(html.includes('"name": "Christian Culture Search"'), `${rel} WebPage name matches`);
    assert.ok(html.includes('"isPartOf": {\n      "@id": "https://polskieradio.cc/#website"\n    }'), `${rel} isPartOf WebSite matches`);

    // Dynamic robots logic
    assert.ok(html.includes("robotsEl.setAttribute('content', 'noindex, follow')"), `${rel} has dynamic noindex for search queries`);
  }
});

test('4. o-nas.html - GEO & AEO Fact Answers for AI Assistants', () => {
  const html = fs.readFileSync(path.join(ROOT, 'o-nas.html'), 'utf8');

  assert.ok(html.includes('Czym jest Christian Culture?'), 'Q1 present');
  assert.ok(html.includes('Christian Culture jest chrześcijańskim ekosystemem medialnym i edukacyjnym łączącym radio internetowe'), 'A1 present');

  assert.ok(html.includes('Co można znaleźć na Christian Culture?'), 'Q2 present');
  assert.ok(html.includes('Audycje radiowe, muzykę, filmy, materiały biblijne, kursy, projekty społecznościowe oraz narzędzia wspierające rozwój i współpracę.'), 'A2 present');

  assert.ok(html.includes('Czy korzystanie z Christian Culture jest darmowe?'), 'Q3 present');
  assert.ok(html.includes('Podstawowe zasoby i narzędzia misji Christian Culture są udostępniane bezpłatnie.'), 'A3 present');

  assert.ok(html.includes('Gdzie znaleźć wszystkie projekty?'), 'Q4 present');
  assert.ok(html.includes('https://polskieradio.cc/szukaj'), 'A4 link to szukaj present');
});

test('5. sitemap.xml & llms.txt Technical Discovery', () => {
  const sitemap = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
  assert.ok(sitemap.includes('<loc>https://polskieradio.cc/szukaj</loc>'), 'sitemap has /szukaj');
  assert.ok(sitemap.includes('<loc>https://polskieradio.cc/o-nas</loc>'), 'sitemap has /o-nas');
  assert.ok(sitemap.includes('<lastmod>2026-10-15</lastmod>'), 'sitemap has 2026-10-15');

  const llms = fs.readFileSync(path.join(ROOT, 'llms.txt'), 'utf8');
  assert.ok(llms.includes('# Christian Culture — Wszystko, czego potrzebujesz, w jednym miejscu'), 'llms.txt has new slogan header');
  assert.ok(llms.includes('https://polskieradio.cc/szukaj'), 'llms.txt has /szukaj');
  assert.ok(llms.includes('https://polskieradio.cc/o-nas'), 'llms.txt has /o-nas');
});
