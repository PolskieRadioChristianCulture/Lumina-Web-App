import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('weakest link 404 profile routes (/wiolettarogowska, /andrzejthiel, /magdalena) and /pobierz are mapped in _redirects', () => {
  const redirects = fs.readFileSync('_redirects', 'utf8');
  assert.match(redirects, /^\/wiolettarogowska\s+\/lumina\.wiolettarogowska\s+200$/m);
  assert.match(redirects, /^\/andrzejthiel\s+\/lumina\.andrzejthiel\s+200$/m);
  assert.match(redirects, /^\/magdalena\s+\/lumina\.magdalena\s+200$/m);
  assert.match(redirects, /^\/pobierz\s+\/pobierz\/index\.html\s+200$/m);
  assert.match(redirects, /^\/Pobierz\s+\/pobierz\s+301$/m);
  assert.match(redirects, /^\/pliki\s+\/pobierz\s+301$/m);
});

test('/pobierz library has valid approved catalog, root-relative paths, license guards and search indexing', () => {
  const html = fs.readFileSync('pobierz/index.html', 'utf8');
  const catalog = JSON.parse(fs.readFileSync('pobierz/catalog.json', 'utf8'));
  const searchCatalog = JSON.parse(fs.readFileSync('szukaj/catalog.json', 'utf8'));

  assert.match(html, /<link rel="canonical" href="https:\/\/polskieradio\.cc\/pobierz">/);
  assert.doesNotMatch(html, /START_ANTIGRAVITY|Mission Control|To prototyp/i);
  assert.ok(catalog.length >= 13);
  assert.ok(catalog.every((item) => item.status === 'approved' && item.visibility === 'public'));

  const bible = catalog.find((i) => i.id === 'bible');
  const audio = catalog.find((i) => i.id === 'audio-dobra');
  const yt = catalog.filter((i) => i.type === 'wideo');
  assert.equal(bible.canDownload, false);
  assert.equal(audio.canDownload, false);
  assert.ok(yt.every((i) => i.canDownload === false && i.external.startsWith('https://www.youtube.com/')));

  for (const item of catalog) {
    if (item.preview) {
      assert.ok(item.preview.startsWith('/'), item.preview);
      assert.ok(fs.existsSync('.' + item.preview), item.preview);
    }
    if (item.download) {
      assert.ok(item.download.startsWith('/'), item.download);
      assert.ok(fs.existsSync('.' + item.download), item.download);
    }
  }

  assert.ok(searchCatalog.items.some((i) => i.url === 'https://polskieradio.cc/pobierz'));
});
