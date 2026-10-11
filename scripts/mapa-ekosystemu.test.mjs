import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

test('mapa data registry exists, is valid JSON and contains all required branches', () => {
  const filePath = path.join(ROOT, 'data', 'ecosystem-map.json');
  assert.ok(fs.existsSync(filePath), 'data/ecosystem-map.json must exist');
  
  const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  assert.equal(content.root.id, 'cc-root');
  assert.equal(content.root.domain, 'polskieradio.cc');
  
  const requiredBranches = [
    'radio-tv',
    'biblia-edukacja',
    'spolecznosc',
    'media-wiedza',
    'muzyka-produkcja',
    'aplikacje-technologia',
    'cc-network',
    'misja-wspolpraca'
  ];
  
  const branchIds = content.branches.map(b => b.id);
  for (const rb of requiredBranches) {
    assert.ok(branchIds.includes(rb), `Branch ${rb} must be present`);
  }
  
  assert.ok(content.nodes.length >= 40, `Expected at least 40 nodes, got ${content.nodes.length}`);
  
  // Confidentiality check: Mission Control MUST NEVER be exposed in public ecosystem map
  const rawText = JSON.stringify(content).toLowerCase();
  assert.ok(!rawText.includes('mission control'), 'Mission Control must NOT be present in ecosystem map');
  assert.ok(!rawText.includes('mission-control'), 'Mission Control must NOT be present in ecosystem map');
});

test('mapa.html is well-formed, contains required controls and loads dedicated assets', () => {
  const htmlPath = path.join(ROOT, 'mapa.html');
  assert.ok(fs.existsSync(htmlPath), 'mapa.html must exist');
  
  const html = fs.readFileSync(htmlPath, 'utf8');
  assert.match(html, /<title>.*Mapa Ekosystemu Christian Culture.*<\/title>/);
  assert.match(html, /id="mapaSearchInput"/);
  assert.match(html, /id="viewGalaxyBtn"/);
  assert.match(html, /id="viewTreeBtn"/);
  assert.match(html, /id="mapaViewport"/);
  assert.match(html, /id="mapaTreeView"/);
  assert.match(html, /id="mapaDrawer"/);
  assert.match(html, /<cc-support-footer><\/cc-support-footer>/);
  assert.match(html, /href="\/css\/mapa-ekosystemu\.css/);
  assert.match(html, /src="\/js\/mapa-ekosystemu\.js/);
  
  assert.match(html, /class="cc-background"/);
  assert.match(html, /id="cc-planet"/);
  assert.match(html, /planeta-poster\.jpg/);
  assert.match(html, /planeta\.webm/);
  assert.match(html, /planeta\.mp4/);

  // Verification of background assets existence and size
  const posterPath = path.join(ROOT, 'assets', 'mapa', 'planeta-poster.jpg');
  const webmPath = path.join(ROOT, 'assets', 'mapa', 'planeta.webm');
  const mp4Path = path.join(ROOT, 'assets', 'mapa', 'planeta.mp4');
  assert.ok(fs.existsSync(posterPath) && fs.statSync(posterPath).size > 10000, 'planeta-poster.jpg must exist');
  assert.ok(fs.existsSync(webmPath) && fs.statSync(webmPath).size > 100000, 'planeta.webm must exist');
  assert.ok(fs.existsSync(mp4Path) && fs.statSync(mp4Path).size > 100000, 'planeta.mp4 must exist');

  // Zero QA: no broken placeholder links
  assert.ok(!html.includes('href="javascript:void(0)"'));
});

test('_redirects contains clean routing for /mapa and /mapa/', () => {
  const redirectsPath = path.join(ROOT, '_redirects');
  const redirects = fs.readFileSync(redirectsPath, 'utf8');
  assert.match(redirects, /^\/mapa\s+\/mapa\.html\s+200/m);
  assert.match(redirects, /^\/mapa\/\s+\/mapa\.html\s+200/m);
});

test('index.html contains entries for Mapa Ekosystemu without regression', () => {
  const indexPath = path.join(ROOT, 'index.html');
  const indexHtml = fs.readFileSync(indexPath, 'utf8');
  assert.match(indexHtml, /href="\/mapa"[^>]*class="strip-pill-card/);
  assert.match(indexHtml, /href="\/mapa"[^>]*class="cc-card/);
  assert.match(indexHtml, /href="\/mapa"[^>]*class="drawer-link/);
});
