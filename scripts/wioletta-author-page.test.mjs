import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

test('Wioletta.html and Wioletta/index.html exist, match, and include all 5 image assets', () => {
  const rootHtmlPath = path.join(ROOT, 'Wioletta.html');
  const dirHtmlPath = path.join(ROOT, 'Wioletta', 'index.html');
  assert.ok(fs.existsSync(rootHtmlPath), 'Wioletta.html must exist');
  assert.ok(fs.existsSync(dirHtmlPath), 'Wioletta/index.html must exist');

  const rootHtml = fs.readFileSync(rootHtmlPath, 'utf8');
  const dirHtml = fs.readFileSync(dirHtmlPath, 'utf8');
  assert.equal(rootHtml, dirHtml, 'Wioletta.html and Wioletta/index.html must stay identical');

  const requiredAssets = [
    'images/wioletta/wioletta-portrait.jpg',
    'images/wioletta/wioletta-portrait.webp',
    'images/wioletta/pardon-czy-to-milosc-3d.jpg',
    'images/wioletta/pardon-czy-to-milosc-3d.webp',
    'images/wioletta/wioletta-og.jpg'
  ];
  for (const rel of requiredAssets) {
    const p = path.join(ROOT, rel);
    assert.ok(fs.existsSync(p), `Asset must exist: ${rel}`);
    assert.ok(fs.statSync(p).size > 10000, `Asset must be non-empty: ${rel}`);
  }
});

test('Wioletta author showcase has exact SEO metadata, motto, and 3 required sections', () => {
  const html = fs.readFileSync(path.join(ROOT, 'Wioletta.html'), 'utf8');

  assert.match(html, /<title>Wioletta Rogowska — Pardon, Czy To Miłość\?<\/title>/);
  assert.ok(
    html.includes('content="Poznaj Wiolettę Rogowską i jej cykl siedmiu powieści romantycznych „Pardon, Czy To Miłość?”. Historie o miłości, wierze i nadziei."'),
    'Must include exact SEO description'
  );
  assert.ok(
    html.includes('<link rel="canonical" href="https://polskieradio.cc/Wioletta"'),
    'Must declare canonical URL https://polskieradio.cc/Wioletta'
  );
  assert.ok(
    html.includes('Miłość. Wiara. Nadzieja. Historie, które zostają w sercu.'),
    'Must include official motto'
  );

  // Required sections
  assert.match(html, /id="o-autorce"/, 'Must have section #o-autorce');
  assert.match(html, /id="pardon-czy-to-milosc"/, 'Must have section #pardon-czy-to-milosc');
  assert.match(html, /id="ksiazki-i-aktualnosci"/, 'Must have section #ksiazki-i-aktualnosci');

  // Key literary elements
  assert.ok(html.includes('Aleksandra Wysocka'), 'Must mention protagonist Aleksandra Wysocka');
  assert.ok(html.includes('Adam Laurent'), 'Must mention protagonist Adam Laurent');
  assert.ok(html.includes('Siedmiotomowy cykl'), 'Must describe 7-volume cycle');
  assert.match(html, /href="mailto:wiolettapardon@gmail\.com"/, 'Footer must include envelope contact link to wiolettapardon@gmail.com');
  assert.match(html, /id="footerContactEnvelope"/, 'Footer must include #footerContactEnvelope icon button');
});

test('Wioletta showcase strictly follows editorial integrity rules (in preparation, no fake ISBN, no PR S.A. claim)', () => {
  const html = fs.readFileSync(path.join(ROOT, 'Wioletta.html'), 'utf8');

  // 1. Must clearly state novel is in preparation
  assert.match(html, /Powieść w przygotowaniu/i, 'Must state Powieść w przygotowaniu');

  // 2. Must NOT contain any fake ISBN in visible text or JSON-LD
  assert.ok(!/978-[0-9-]+/.test(html), 'Must never include a fake ISBN number');
  assert.ok(!/"isbn"\s*:/i.test(html), 'JSON-LD Book must not declare a fake isbn property');

  // 3. Must never claim partnership with Polskie Radio S.A.
  assert.ok(
    !/Polskie(?:m|go)? Radi(?:o|em|a) S\.A\./i.test(html),
    'Must not suggest affiliation or partnership with Polskie Radio S.A.'
  );
  assert.ok(!/Mission Control/i.test(html), 'Must never mention Mission Control');
});

test('Wioletta showcase integrates with _redirects, _worker.js, wizytowki catalog, and @w search index', () => {
  const redirects = fs.readFileSync(path.join(ROOT, '_redirects'), 'utf8');
  assert.match(redirects, /^\/Wioletta \/Wioletta\/index\.html 200$/m);
  assert.match(redirects, /^\/wioletta \/Wioletta 301$/m);
  assert.match(redirects, /^\/Violetta \/Wioletta 301$/m);

  const worker = fs.readFileSync(path.join(ROOT, '_worker.js'), 'utf8');
  assert.ok(worker.includes("lowerPath === '/wioletta'"), '_worker.js handles /wioletta');
  assert.ok(worker.includes("targetUrl.pathname = '/Wioletta/'"), '_worker.js rewrites to /Wioletta/');

  const searchIndex = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'cc-search-index.json'), 'utf8'));
  const catalogIndex = JSON.parse(fs.readFileSync(path.join(ROOT, 'szukaj', 'catalog.json'), 'utf8'));
  assert.ok(
    searchIndex.items.some((item) => item.url === 'https://polskieradio.cc/Wioletta'),
    'data/cc-search-index.json includes https://polskieradio.cc/Wioletta'
  );
  assert.ok(
    catalogIndex.items.some((item) => item.url === 'https://polskieradio.cc/Wioletta'),
    'szukaj/catalog.json includes https://polskieradio.cc/Wioletta'
  );
});
