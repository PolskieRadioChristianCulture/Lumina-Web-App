import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const ROOT = process.cwd();
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.mp4': 'video/mp4',
  '.svg': 'image/svg+xml'
};

function serve() {
  return http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split('?')[0]);
    if (p === '/Wioletta' || p === '/Wioletta/') p = '/Wioletta/index.html';
    const f = path.join(ROOT, p);
    if (fs.existsSync(f) && fs.statSync(f).isFile()) {
      res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' });
      fs.createReadStream(f).pipe(res);
    } else {
      res.writeHead(404);
      res.end();
    }
  });
}

test('Wioletta Intro: asset integrity and static wiring', () => {
  const videoPath = path.join(ROOT, 'images', 'wioletta', 'wioletta-intro.mp4');
  const posterPath = path.join(ROOT, 'images', 'wioletta', 'wioletta-intro-poster.jpg');
  assert.ok(fs.existsSync(videoPath), 'Video file must exist');
  assert.ok(fs.existsSync(posterPath), 'Poster file must exist');
  assert.ok(fs.statSync(videoPath).size > 1000000, 'Video file must be non-empty (> 1MB)');
  assert.ok(fs.statSync(posterPath).size > 10000, 'Poster file must be non-empty (> 10KB)');

  const html = fs.readFileSync(path.join(ROOT, 'Wioletta.html'), 'utf8');
  assert.equal(html, fs.readFileSync(path.join(ROOT, 'Wioletta', 'index.html'), 'utf8'), 'Wioletta mirrors must match');
  assert.match(html, /<script[^>]+wioletta-intro\.js/, 'Must include wioletta-intro.js');
});

test('Wioletta Intro: once-per-session playback and controls', async () => {
  const server = serve();
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}/Wioletta`;

  const browser = await chromium.launch({ headless: true });
  try {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'pl-PL' });
    const page = await ctx.newPage();

    // 1. First visit in session: intro appears
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
    const intro = page.locator('#wiolettaIntro');
    await intro.waitFor({ state: 'visible', timeout: 5000 });
    assert.equal(await intro.getAttribute('role'), 'dialog');

    // Controls must have touch targets >= 44x44
    const skip = page.locator('.wi-intro-skip');
    assert.ok(await skip.isVisible());
    const skipBox = await skip.boundingBox();
    assert.ok(skipBox && skipBox.width >= 44 && skipBox.height >= 44, 'Skip button >= 44x44');

    const sound = page.locator('.wi-intro-sound');
    assert.ok(await sound.isVisible());
    const soundBox = await sound.boundingBox();
    assert.ok(soundBox && soundBox.width >= 44 && soundBox.height >= 44, 'Sound button >= 44x44');

    // Skip closes the intro
    await skip.click();
    await intro.waitFor({ state: 'detached', timeout: 3000 });

    // SessionStorage is marked as seen
    const seen = await page.evaluate(() => sessionStorage.getItem('cc_wioletta_intro_seen'));
    assert.equal(seen, '1', 'Session flag must be set to 1');

    // 2. Second visit in same session: intro does NOT appear
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(600);
    const count = await page.locator('#wiolettaIntro').count();
    assert.equal(count, 0, 'Intro must not play again in same session');

    // 3. Replay API can force replay
    await page.evaluate(() => window.CCWiolettaIntro.replay());
    await page.locator('#wiolettaIntro').waitFor({ state: 'visible', timeout: 3000 });
    // Escape key closes it
    await page.keyboard.press('Escape');
    await page.locator('#wiolettaIntro').waitFor({ state: 'detached', timeout: 3000 });

    // 4. URL query ?intro=1 bypasses sessionStorage
    await page.goto(baseUrl + '?intro=1', { waitUntil: 'domcontentloaded' });
    await page.locator('#wiolettaIntro').waitFor({ state: 'visible', timeout: 3000 });
    await page.keyboard.press('Escape');
    await page.locator('#wiolettaIntro').waitFor({ state: 'detached', timeout: 3000 });

    // 5. Menu replay button opens intro (via mobile edge panel -> Pełne menu)
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
    assert.equal(await page.locator('#wiolettaIntro').count(), 0);
    await page.locator('.cc-mobile-edge-trigger').click();
    await page.locator('dialog.cc-mobile-edge button[data-edge-key="menu"]').click();
    await page.locator('#modalMenu.open').waitFor({ state: 'visible', timeout: 3000 });
    const replayBtn = page.locator('#menuIntroReplayBtn');
    assert.ok(await replayBtn.isVisible());
    await replayBtn.click();
    await page.locator('#wiolettaIntro').waitFor({ state: 'visible', timeout: 3000 });
    await page.keyboard.press('Escape');

    await ctx.close();
  } finally {
    await browser.close();
    server.close();
  }
});

test('Wioletta Intro: multilingual labels based on device locale', async () => {
  const server = serve();
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}/Wioletta`;

  const browser = await chromium.launch({ headless: true });
  try {
    for (const [locale, expectedText] of [
      ['en-US', 'Skip intro'],
      ['de-DE', 'Intro überspringen'],
      ['pl-PL', 'Pomiń intro']
    ]) {
      const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, locale });
      const page = await ctx.newPage();
      await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
      const skip = page.locator('.wi-intro-skip');
      await skip.waitFor({ state: 'visible', timeout: 5000 });
      const txt = await skip.innerText();
      assert.ok(txt.toLowerCase().includes(expectedText.toLowerCase()), `Locale ${locale} must include "${expectedText}", got "${txt}"`);
      await page.keyboard.press('Escape');
      await ctx.close();
    }
  } finally {
    await browser.close();
    server.close();
  }
});
