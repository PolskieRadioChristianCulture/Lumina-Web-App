import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

test('CC Karaoke Ultra-Precision: 1. Stały poziom linii wokalnej (Fixed Focal Horizon & Stage Padding)', () => {
  const js = fs.readFileSync(path.join(ROOT, 'assets', 'bu', 'karaoke-top100.js'), 'utf8');
  const html = fs.readFileSync(path.join(ROOT, 'biblijne-uwielbienie.html'), 'utf8');

  // Funkcja getLineScrollTop i stały focalAnchor (40% wysokości viewportu)
  assert.ok(js.includes('getLineScrollTop'), 'Musi zawierać getLineScrollTop do stabilnego wyliczania offsetTop');
  assert.ok(js.includes('focalAnchor = Math.round(vp.clientHeight * 0.40)'), 'Musi kotwiczyć linię dokładnie na poziomie 40% viewportu');

  // Płynna interpolacja scrollToSmoothly
  assert.ok(js.includes('scrollToSmoothly'), 'Musi zawierać scrollToSmoothly z dedykowaną krzywą easeOutCubic');

  // Stage Padding w CSS
  assert.ok(html.includes('padding: clamp(80px, 11vh, 120px) 14px !important'), 'CSS musi zawierać symmetric stage padding dla linii 0 i N');
  assert.ok(js.includes('padding: clamp(80px, 11vh, 120px) 14px !important'), 'JS musi zawierać symmetric stage padding');
});

test('CC Karaoke Ultra-Precision: 2. Zero Layout Shift (brak skakania czcionki i wysokości)', () => {
  const js = fs.readFileSync(path.join(ROOT, 'assets', 'bu', 'karaoke-top100.js'), 'utf8');

  // .bu-line.active nie powiększa font-size, tylko używa transform: scale(1.04)
  assert.ok(js.includes('transform: scale(1.04)'), 'Musi stosować GPU transform scale(1.04) zamiast zmiany font-size');
  assert.ok(!js.includes('.bu-line.active {\n      color: #ffe2a5 !important;\n      background: transparent !important;\n      box-shadow: none !important;\n      font-weight: 700 !important;\n      font-size: clamp(19px'), 'Nie może skakać font-size na .active');
});

test('CC Karaoke Ultra-Precision: 3. Ciągłość wokalu i wyprzedzenie (Lookahead Priming & Vocal Continuity)', () => {
  const js = fs.readFileSync(path.join(ROOT, 'assets', 'bu', 'karaoke-top100.js'), 'utf8');

  // isHolding oraz isPrimed
  assert.ok(js.includes('isHolding = true'), 'Musi obsługiwać stan podtrzymania (holding) w pauzach');
  assert.ok(js.includes('isPrimed = true'), 'Musi obsługiwać lookahead priming 550ms przed rozpoczęciem nowej linii');
  assert.ok(js.includes('now >= nextStart - 0.55'), 'Musi wyprzedzać przewijanie o 550ms');
  assert.ok(js.includes('♫ Przerwa muzyczna ···'), 'Musi wskazywać przerwę muzyczną przy dłuższych pauzach');
});

test('CC Karaoke Ultra-Precision: 4. Auto-wznowienie śledzenia tekstu i pływający przycisk powrotu', () => {
  const js = fs.readFileSync(path.join(ROOT, 'assets', 'bu', 'karaoke-top100.js'), 'utf8');

  assert.ok(js.includes('bu-floating-follow-btn'), 'Musi zawierać pływający przycisk powrotu');
  assert.ok(js.includes('resumeAutoScroll'), 'Musi implementować resumeAutoScroll');
  assert.ok(js.includes('userScrollTimeout'), 'Musi posiadać timer auto-wznowienia po przewinięciu manualnym');
});

test('CC Karaoke Ultra-Precision: 5. Komfortowy Viewport i subtelny wskaźnik horyzontu (Focal Horizon Stage)', () => {
  const html = fs.readFileSync(path.join(ROOT, 'biblijne-uwielbienie.html'), 'utf8');

  assert.ok(html.includes('max-height: clamp(210px, 28vh, 280px) !important'), 'Viewport musi być powiększony do 210-280px');
  assert.ok(html.includes('.hero-karaoke-viewport::before'), 'Musi posiadać visual guide horizon');
});
