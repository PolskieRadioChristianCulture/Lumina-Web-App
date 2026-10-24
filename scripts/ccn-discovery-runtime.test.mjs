import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const catalog = JSON.parse(fs.readFileSync('szukaj/catalog.json', 'utf8'));
const engine = fs.readFileSync('components/cc-omni-search.js', 'utf8');
function load(items = catalog.items) {
  const context = { window: { __ccSearchCatalog: { ...catalog, items }, location: { pathname: '/szukaj' } },
    document: { readyState: 'loading', addEventListener() {} }, URL };
  vm.runInNewContext(engine, context);
  return context.window.CCOmniSearch;
}

test('CBDC PL and EN equivalent queries lead to the real CBDC article', () => {
  const search = load().performSearch;
  for (const q of ['CBDC', 'cyfrowy pieniądz', 'waluta banku centralnego', 'central bank digital currency']) {
    assert.ok(search(q).items[0].url.includes('/cbdc-prawo-niedzielne-apokalipsa-13'), q);
  }
});

test('current public article registry is searchable with valid dates and unique URLs', () => {
  const articles = catalog.items.filter(i => i.type === 'article');
  assert.equal(articles.length, 84);
  assert.equal(new Set(articles.map(i => i.url)).size, articles.length);
  assert.ok(articles.every(i => i.access === 'public' && Number.isFinite(Date.parse(i.publishedAt))));
  assert.deepEqual(catalog, JSON.parse(fs.readFileSync('data/cc-search-index.json', 'utf8')));
  for (const i of articles) {
    assert.ok(fs.existsSync('.' + decodeURI(new URL(i.url).pathname) + '/index.html'), i.url);
  }
});

test('latest PL/EN requests and Polish date sorting use actual chronological order', () => {
  const { performSearch, publicationTime } = load();
  assert.ok(publicationTime({ date: '2 października 2026' }) < publicationTime({ date: '17 października 2026' }));
  for (const q of ['Najnowsze artykuły CC', 'latest articles']) {
    const items = performSearch(q).items;
    assert.ok(items.length > 1);
    assert.ok(items.every(i => i.type === 'article'));
    for (let i = 1; i < items.length; i++) assert.ok(publicationTime(items[i - 1]) >= publicationTime(items[i]));
  }
});

test('semantic suggestions are distinct from direct matches, and results are deduplicated', () => {
  const direct = { title: 'Prawo niedzielne', category: 'Portale', url: 'https://polskieradio.cc/prawo', tags: [] };
  const related = { title: 'Wolność religijna', category: 'Portale', url: 'https://polskieradio.cc/news', tags: [] };
  const results = load([direct, { ...direct }, related]).performSearch('prawo niedzielne').items;
  assert.equal(results.filter(i => i.url === direct.url).length, 1);
  assert.equal(results.find(i => i.url === direct.url).isNearMatch, false);
  assert.equal(results.find(i => i.url === related.url).isNearMatch, true);
});

test('private and withdrawn records are excluded from exact, latest and fallback searches', () => {
  const publicItem = { title: 'CBDC', type: 'article', access: 'public', featured: true, url: '/news/public', publishedAt: '2026-10-17' };
  const fixtures = [publicItem, ...[
    { access: 'private' }, { visibility: 'private' }, { status: 'draft' }, { status: 'unpublished' }
  ].map((flags, i) => ({ ...publicItem, ...flags, url: '/private/' + i }))];
  for (const q of ['CBDC', 'latest articles', 'nonexistentqzx', '']) {
    assert.ok(load(fixtures).performSearch(q).items.every(i => i.url === '/news/public'), q);
  }
});
