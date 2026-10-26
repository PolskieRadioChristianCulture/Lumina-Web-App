import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

test('wizytowki/index.html and wizytowki.html exist, match, and follow EkoCC v2 standard', () => {
  const indexHtmlPath = path.join(ROOT, 'wizytowki', 'index.html');
  const rootHtmlPath = path.join(ROOT, 'wizytowki.html');
  assert.ok(fs.existsSync(indexHtmlPath), 'wizytowki/index.html must exist');
  assert.ok(fs.existsSync(rootHtmlPath), 'wizytowki.html must exist');

  const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
  const rootHtml = fs.readFileSync(rootHtmlPath, 'utf8');
  assert.equal(indexHtml, rootHtml, 'wizytowki/index.html and wizytowki.html must stay synchronized');

  assert.match(indexHtml, /<title>Wizytówki EkoCC — Katalog Wszystkich Wizytówek Christian Culture<\/title>/);
  assert.match(indexHtml, /id="ekocc-menu"/, 'Must include shared EkoCC left-edge menu');
  assert.match(indexHtml, /id="wizytowkiSearch"/, 'Must include instant search input');
  assert.ok(!/Mission Control/i.test(indexHtml), 'Must never mention Mission Control');
  assert.ok(!/zbyszekgieron/i.test(indexHtml), 'Must never include withdrawn profile zbyszekgieron');
});

test('wizytowki/index.html renders all 23 verified calling cards and existing local image assets', () => {
  const html = fs.readFileSync(path.join(ROOT, 'wizytowki', 'index.html'), 'utf8');
  const cardMatches = [...html.matchAll(/<a class="kacik-card[^"]*"\s+href="([^"]+)"\s+data-card\s+data-cat="([^"]+)"[\s\S]*?<img src="([^"]+)"/g)];
  assert.equal(cardMatches.length, 23, 'Must render 23 calling cards');

  const counts = { kacik: 0, sluzby: 0, lumina: 0 };
  for (const [, href, cat, imgSrc] of cardMatches) {
    assert.ok(href.startsWith('/'), `Card href must start with /: ${href}`);
    assert.ok(counts[cat] !== undefined, `Unexpected card category: ${cat}`);
    counts[cat]++;

    const diskPath = path.join(ROOT, imgSrc.replace(/^\//, ''));
    assert.ok(fs.existsSync(diskPath), `Card image must exist on disk: ${imgSrc}`);
  }

  assert.deepEqual(counts, { kacik: 6, sluzby: 6, lumina: 11 });
});

test('_worker.js and _redirects route /wizytówki and /wizytowki cleanly', () => {
  const worker = fs.readFileSync(path.join(ROOT, '_worker.js'), 'utf8');
  assert.match(worker, /wizytówki\|wizytowki/, '_worker.js must handle /wizytówki and /wizytowki');
  assert.match(worker, /targetUrl\.pathname = '\/wizytowki\/'/, '_worker.js must rewrite to /wizytowki/');

  const redirects = fs.readFileSync(path.join(ROOT, '_redirects'), 'utf8');
  assert.match(redirects, /^\/wizytowki \/wizytowki\/index\.html 200$/m);
  assert.match(redirects, /^\/wizytówki \/wizytowki\/index\.html 200$/m);
  assert.match(redirects, /^\/wizyt%C3%B3wki \/wizytowki\/index\.html 200$/m);
});

test('wizytowka/index.html links to /wizytówki and search index includes /wizytowki', () => {
  const wizytowkaHtml = fs.readFileSync(path.join(ROOT, 'wizytowka', 'index.html'), 'utf8');
  assert.match(wizytowkaHtml, /href="\/wizytówki"/, 'Main calling card must link to /wizytówki');

  const searchIndex = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'cc-search-index.json'), 'utf8'));
  const catalogIndex = JSON.parse(fs.readFileSync(path.join(ROOT, 'szukaj', 'catalog.json'), 'utf8'));
  assert.deepEqual(searchIndex, catalogIndex, 'data/cc-search-index.json and szukaj/catalog.json must match');
  assert.ok(
    searchIndex.items.some((item) => item.url === 'https://polskieradio.cc/wizytowki'),
    'Search index must include https://polskieradio.cc/wizytowki'
  );
});
