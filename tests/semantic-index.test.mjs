import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

test('CC Semantic Index: 1. semantic-index.html exists and is non-empty', () => {
  const filePath = path.join(rootDir, 'semantic-index.html');
  assert.ok(fs.existsSync(filePath), 'semantic-index.html musi istnieć w głównym katalogu');
  const content = fs.readFileSync(filePath, 'utf8');
  assert.ok(content.length > 50000, `Plik ma co najmniej 50KB (aktualnie ${content.length} bajtów)`);
  assert.ok(content.includes('<!DOCTYPE html>'), 'Musi być poprawnym dokumentem HTML5');
});

test('CC Semantic Index: 2. Public resources are pre-rendered in static HTML (No-JS fallback)', () => {
  const filePath = path.join(rootDir, 'semantic-index.html');
  const content = fs.readFileSync(filePath, 'utf8');
  assert.ok(content.includes('resource-card'), 'Zawiera semantyczne karty zasobów');
  const count = (content.match(/class="resource-card"/g) || []).length;
  assert.ok(count >= 200, `Oczekiwano co najmniej 200 kart w HTML, znaleziono ${count}`);
});

test('CC Semantic Index: 3. All URLs start with http:// or https:// and are valid', () => {
  const registryPath = path.join(rootDir, 'data/cc-public-index.json');
  assert.ok(fs.existsSync(registryPath), 'cc-public-index.json musi istnieć');
  const data = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
  for (const r of data.records) {
    assert.ok(r.url.startsWith('http://') || r.url.startsWith('https://'), `Niepoprawny URL: ${r.url}`);
  }
});

test('CC Semantic Index: 4. Zero private/admin/script resources (Privacy & Security)', () => {
  const registryPath = path.join(rootDir, 'data/cc-public-index.json');
  const data = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
  const blocked = ['/admin', '/config', '/scripts', '/windows_tools', '/tresci-18plus', 'localhost', '127.0.0.1'];
  for (const r of data.records) {
    for (const b of blocked) {
      assert.ok(!r.url.toLowerCase().includes(b), `Wykryto zablokowany zasób: ${r.url}`);
    }
  }
});

test('CC Semantic Index: 5. Zero duplicate URLs in public registry', () => {
  const registryPath = path.join(rootDir, 'data/cc-public-index.json');
  const data = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
  const seen = new Set();
  for (const r of data.records) {
    assert.ok(!seen.has(r.url), `Zduplikowany URL w rejestrze: ${r.url}`);
    seen.add(r.url);
  }
});

test('CC Semantic Index: 6. UTF-8 integrity and Polish diacritics', () => {
  const filePath = path.join(rootDir, 'semantic-index.html');
  const content = fs.readFileSync(filePath, 'utf8');
  assert.ok(!content.includes('\uFFFD'), 'Zakaz uszkodzonych znaków UTF-8 (replacement char)');
  assert.ok(content.includes('Wszystko, czego potrzebujesz, w jednym miejscu.'), 'Hasło główne obecne');
  assert.ok(content.includes('Biblia i wiara'), 'Polskie znaki w kategoriach obecne');
  assert.ok(content.includes('Społeczność'), 'Polskie znaki diakrytyczne obecne');
});

test('CC Semantic Index: 7. Taxonomy defines all 10 approved categories', () => {
  const taxonomyPath = path.join(rootDir, 'cc-semantic-index/config/taxonomy.json');
  assert.ok(fs.existsSync(taxonomyPath), 'taxonomy.json musi istnieć');
  const data = JSON.parse(fs.readFileSync(taxonomyPath, 'utf8'));
  assert.equal(data.categories.length, 10, 'Wymagane dokładnie 10 kategorii nadrzędnych');
  const expectedCats = [
    'biblia-wiara', 'radio-transmisje', 'filmy-multimedia', 'edukacja-rozwoj',
    'rodzina-relacje', 'spolecznosc-cc', 'zdrowie-styl-zycia', 'nauka-historia-wiedza',
    'narzedzia-technologia', 'misja-wsparcie'
  ];
  for (const id of expectedCats) {
    assert.ok(data.categories.some(c => c.id === id), `Brak kategorii: ${id}`);
  }
});

test('CC Semantic Index: 8. Schema.org JSON-LD structured data', () => {
  const filePath = path.join(rootDir, 'semantic-index.html');
  const content = fs.readFileSync(filePath, 'utf8');
  assert.ok(content.includes('"@type": "CollectionPage"'), 'Musi zawierać CollectionPage');
  assert.ok(content.includes('"@type": "ItemList"'), 'Musi zawierać ItemList');
  assert.ok(content.includes('"@type": "Organization"'), 'Musi zawierać Organization');
  assert.ok(content.includes('"@type": "WebSite"'), 'Musi zawierać WebSite');
  assert.ok(content.includes('"https://polskieradio.cc/index"'), 'Musi zawierać kanoniczny URL');
});

test('CC Semantic Index: 9. _worker.js routes /index and /index/* without 308 redirect', () => {
  const workerPath = path.join(rootDir, '_worker.js');
  const content = fs.readFileSync(workerPath, 'utf8');
  assert.ok(content.includes("url.pathname === '/index'"), '_worker.js musi obsługiwać /index');
  assert.ok(content.includes("semantic-index.html"), '_worker.js musi serwować semantic-index.html');
});

test('CC Semantic Index: 10. sitemap.xml and robots.txt include /index', () => {
  const sitemapPath = path.join(rootDir, 'sitemap.xml');
  const sitemap = fs.readFileSync(sitemapPath, 'utf8');
  assert.ok(sitemap.includes('https://polskieradio.cc/index'), 'sitemap.xml musi zawierać /index');

  const headersPath = path.join(rootDir, '_headers');
  const headers = fs.readFileSync(headersPath, 'utf8');
  assert.ok(headers.includes('/index'), '_headers musi zawierać regułę dla /index');
});

test('CC Semantic Index 2.0: 11. Zero duplicate reflections by title', () => {
  const registryPath = path.join(rootDir, 'data/cc-public-index.json');
  const data = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
  const titles = data.records.map(r => r.title.trim().toLowerCase());
  const duplicates = titles.filter((t, i) => titles.indexOf(t) !== i);
  assert.equal(duplicates.length, 0, `Znaleziono zduplikowane tytuły: ${duplicates.join(', ')}`);
});

test('CC Semantic Index 2.0: 12. Orthogonal content types present in registry', () => {
  const registryPath = path.join(rootDir, 'data/cc-public-index.json');
  const data = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
  const types = new Set(data.records.map(r => r.type));
  assert.ok(types.has('devotional'), 'Musi zawierać typ devotional');
  assert.ok(types.has('article'), 'Musi zawierać typ article');
  assert.ok(types.has('lesson'), 'Musi zawierać typ lesson');
  assert.ok(types.has('portal'), 'Musi zawierać typ portal');
  assert.ok(types.has('book'), 'Musi zawierać typ book');
  assert.ok(types.has('project'), 'Musi zawierać typ project');
  assert.ok(types.has('bible-entry'), 'Musi zawierać typ bible-entry');
});

test('CC Semantic Index 2.0: 13. Zero raw technical badges in visible HTML', () => {
  const filePath = path.join(rootDir, 'semantic-index.html');
  const html = fs.readFileSync(filePath, 'utf8');
  const rawTypes = ['project', 'portal', 'resource', 'course', 'devotional', 'lesson', 'bible-entry', 'book'];
  const rawCats = ['biblia-wiara', 'radio-transmisje', 'filmy-multimedia', 'edukacja-rozwoj', 'rodzina-relacje', 'spolecznosc-cc', 'zdrowie-styl-zycia', 'nauka-historia-wiedza', 'narzedzia-technologia', 'misja-wsparcie'];

  for (const t of rawTypes) {
    const matches = html.match(new RegExp('>\\s*' + t + '\\s*<', 'g')) || [];
    assert.equal(matches.length, 0, `Wykryto surowy badge typu w HTML: >${t}<`);
  }

  for (const c of rawCats) {
    const matches = html.match(new RegExp('>\\s*' + c + '\\s*<', 'g')) || [];
    assert.equal(matches.length, 0, `Wykryto surowy tag kategorii w HTML: >${c}<`);
  }
});

test('CC Semantic Index 2.0: 14. Polish grammatical declension (no "1 zasobów")', () => {
  const filePath = path.join(rootDir, 'semantic-index.html');
  const html = fs.readFileSync(filePath, 'utf8');
  const badMatches = html.match(/(^|[^\d])1\s+zasobów/g) || [];
  assert.equal(badMatches.length, 0, 'Wykryto błędną formę "1 zasobów" w HTML');
});

test('CC Semantic Index 2.0: 15. Orthogonal type filter bar present in HTML', () => {
  const filePath = path.join(rootDir, 'semantic-index.html');
  const html = fs.readFileSync(filePath, 'utf8');
  assert.ok(html.includes('class="type-filter-bar"'), 'HTML musi zawierać pasek filtrów typów');
  assert.ok(html.includes('data-type="devotional"'), 'Musi zawierać filtr dla rozważań');
  assert.ok(html.includes('data-type="article"'), 'Musi zawierać filtr dla artykułów');
  assert.ok(html.includes('data-type="book"'), 'Musi zawierać filtr dla książek');
});

