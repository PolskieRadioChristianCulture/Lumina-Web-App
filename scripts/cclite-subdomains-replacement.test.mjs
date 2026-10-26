import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

test('uslugi/index.html and uslugi.html exist, match, and follow EkoCC standard', () => {
  const indexHtmlPath = path.join(ROOT, 'uslugi', 'index.html');
  const rootHtmlPath = path.join(ROOT, 'uslugi.html');
  assert.ok(fs.existsSync(indexHtmlPath), 'uslugi/index.html must exist');
  assert.ok(fs.existsSync(rootHtmlPath), 'uslugi.html must exist');

  const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
  const rootHtml = fs.readFileSync(rootHtmlPath, 'utf8');
  assert.equal(indexHtml, rootHtml, 'uslugi/index.html and uslugi.html must stay in sync');

  assert.match(indexHtml, /<title>Usługi EkoCC — Chrześcijańskie Usługi, Pomoc i Specjaliści z Wartościami \| Christian Culture<\/title>/);
  assert.match(indexHtml, /id="ekocc-menu"/, 'Must include shared left-edge menu');
  assert.match(indexHtml, /id="pomoc-duchowa"/, 'Must include spiritual helpline section');
  assert.match(indexHtml, /id="specjalisci"/, 'Must include specialists and trusted businesses section');
  assert.match(indexHtml, /--cc-btn-orange:\s*#FF7A00/, 'Must use JOMA-D052 classic orange button standard');
  assert.ok(!/Mission Control/i.test(indexHtml), 'Must never leak Mission Control');
});

test('_worker.js routes cclite subdomain replacements cleanly', () => {
  const worker = fs.readFileSync(path.join(ROOT, '_worker.js'), 'utf8');

  // /randka & /randki -> 301 to /lumina
  assert.match(worker, /\/\^\\\/\(randka\|randki\)\\\/\?\$\/i\.test\(decodedP\)/, 'Worker must match /randka and /randki');
  assert.match(worker, /redirectUrl\.pathname = '\/lumina'/, 'Worker must redirect /randka to /lumina');

  // /usługi & /uslugi -> rewrite to /uslugi/
  assert.match(worker, /\/\^\\\/\(usługi\|uslugi\|katalog-uslug\|katalog-usług\)\\\/\?\$\/i\.test\(decodedP\)/, 'Worker must match /usługi and /uslugi');

  // /centrum -> serves moje-centrum.html 200
  assert.match(worker, /lowerPath === '\/moje-centrum' \|\| lowerPath === '\/centrum'/, 'Worker must serve moje-centrum for /centrum');
});

test('_redirects defines clean rules for /uslugi, /randka, /centrum', () => {
  const redirects = fs.readFileSync(path.join(ROOT, '_redirects'), 'utf8');

  assert.match(redirects, /^\/uslugi \/uslugi\/index\.html 200$/m, '_redirects must route /uslugi with 200');
  assert.match(redirects, /^\/usługi \/uslugi\/index\.html 200$/m, '_redirects must route /usługi with 200');
  assert.match(redirects, /^\/randka \/lumina 301$/m, '_redirects must redirect /randka to /lumina');
  assert.match(redirects, /^\/randki \/lumina 301$/m, '_redirects must redirect /randki to /lumina');
  assert.match(redirects, /^\/centrum \/moje-centrum\.html 200$/m, '_redirects must serve moje-centrum for /centrum');

  // No stale conflicting rules
  assert.ok(!/^\/uslugi \/biznes 301$/m.test(redirects), 'Old /uslugi -> /biznes must be removed');
  assert.ok(!/^\/centrum \/kultura 301$/m.test(redirects), 'Old /centrum -> /kultura must be removed');
});

test('cclite.pl types.ts points to polskieradio.cc replacements', () => {
  const ccliteTypesPath = path.join(ROOT, '..', 'cclite.pl', 'types.ts');
  if (fs.existsSync(ccliteTypesPath)) {
    const typesContent = fs.readFileSync(ccliteTypesPath, 'utf8');
    assert.match(typesContent, /export const CENTRUM_CC_URL = "https:\/\/polskieradio\.cc\/centrum";/);
    assert.match(typesContent, /export const CHRISTIAN_DATING_APP_URL = "https:\/\/polskieradio\.cc\/randka";/);
  }
});

test('search index includes /uslugi', () => {
  const searchIndex = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'cc-search-index.json'), 'utf8'));
  const catalogIndex = JSON.parse(fs.readFileSync(path.join(ROOT, 'szukaj', 'catalog.json'), 'utf8'));
  assert.deepEqual(searchIndex, catalogIndex, 'Search index files must match byte-for-byte');
  assert.ok(
    searchIndex.items.some(item => item.url === 'https://polskieradio.cc/uslugi'),
    'Search index must contain https://polskieradio.cc/uslugi'
  );
});
