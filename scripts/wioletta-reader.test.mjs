import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

test('Wioletta reader data contains all 25 author chapters and valid metadata', () => {
  const jsonPath = path.join(ROOT, 'data', 'ksiazki', 'pardon-czy-to-milosc', 'tom-1-rozdzialy.json');
  assert.ok(fs.existsSync(jsonPath), 'JSON file with chapters must exist');
  
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  assert.equal(data.meta.autor, 'Wioletta Rogowska');
  assert.equal(data.meta.tytul, 'Pardon, Czy To Miłość?');
  assert.equal(data.meta.tom, 1);
  assert.equal(data.meta.rozdzialy, 25);
  assert.equal(data.rozdzialy.length, 25, 'Must have exactly 25 chapters');
  assert.ok(data.meta.totalWords > 18000, `Total words (${data.meta.totalWords}) must be > 18000`);

  // Verify each chapter has text, word count, excerpt
  data.rozdzialy.forEach((ch, idx) => {
    assert.equal(ch.nr, idx + 1);
    assert.ok(ch.tytul && ch.tytul.length > 2, `Chapter ${ch.nr} must have title`);
    assert.ok(ch.tekst && ch.tekst.length > 300, `Chapter ${ch.nr} must have text > 300 chars`);
    assert.ok(ch.wordCount > 100, `Chapter ${ch.nr} must have wordCount > 100`);
    assert.ok(ch.readingTimeMin >= 1, `Chapter ${ch.nr} must have valid reading time`);
    assert.ok(ch.excerpt && ch.excerpt.length > 20, `Chapter ${ch.nr} must have excerpt`);
  });

  // Verify js/wioletta-reader-data.js
  const jsPath = path.join(ROOT, 'js', 'wioletta-reader-data.js');
  assert.ok(fs.existsSync(jsPath), 'js/wioletta-reader-data.js must exist');
  const jsContent = fs.readFileSync(jsPath, 'utf8');
  assert.ok(jsContent.includes('window.WIOLETTA_BOOK_DATA'), 'Must define window.WIOLETTA_BOOK_DATA');
  assert.ok(jsContent.length > 100000, 'JS bundle must contain full chapter texts');
});

test('Reader landing page and all 25 chapter pages exist with correct structure', () => {
  const landingPath = path.join(ROOT, 'Wioletta', 'pardon-czy-to-milosc', 'index.html');
  assert.ok(fs.existsSync(landingPath), 'Landing page must exist');
  const landingHtml = fs.readFileSync(landingPath, 'utf8');
  assert.ok(landingHtml.includes('Wioletta Rogowska'));
  assert.ok(landingHtml.includes('Pardon,'));
  assert.ok(landingHtml.includes('wioletta-reader-data.js'));

  for (let i = 1; i <= 25; i++) {
    const chPath = path.join(ROOT, 'Wioletta', 'pardon-czy-to-milosc', `rozdzial-${i}`, 'index.html');
    assert.ok(fs.existsSync(chPath), `Chapter page ${i} must exist at ${chPath}`);
    const chHtml = fs.readFileSync(chPath, 'utf8');
    assert.ok(chHtml.includes('wioletta-reader-data.js'), `Chapter ${i} must include reader data bundle`);
    assert.ok(chHtml.includes('data-theme'), `Chapter ${i} must support themes`);
    assert.ok(chHtml.includes('wioletta_last_chapter'), `Chapter ${i} must save reading progress`);
  }
});

test('Reader routes exist in _redirects and _worker.js', () => {
  const redirects = fs.readFileSync(path.join(ROOT, '_redirects'), 'utf8');
  assert.ok(redirects.includes('/Wioletta/pardon-czy-to-milosc'), '_redirects must include /Wioletta/pardon-czy-to-milosc');
  assert.ok(redirects.includes('/pardon-czy-to-milosc /Wioletta/pardon-czy-to-milosc/ 301'), 'Old url redirects to book reader');

  const worker = fs.readFileSync(path.join(ROOT, '_worker.js'), 'utf8');
  assert.ok(worker.includes('/wioletta/pardon-czy-to-milosc'), '_worker.js must handle /wioletta/pardon-czy-to-milosc');
});
