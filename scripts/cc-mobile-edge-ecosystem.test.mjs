import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const ROOT = process.cwd();

function createStaticServer() {
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.mjs': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
  };

  return http.createServer((req, res) => {
    try {
      const url = new URL(req.url, 'http://127.0.0.1');
      let pathname = decodeURIComponent(url.pathname);
      if (pathname === '/') pathname = '/index.html';
      else if (pathname === '/wyszukiwarka' || pathname === '/wyszukiwarka/') pathname = '/wyszukiwarka.html';
      else if (pathname === '/akademia' || pathname === '/akademia/') pathname = '/akademia.html';
      else if (pathname === '/mojabiblia' || pathname === '/mojabiblia/') pathname = '/mojabiblia.html';
      else if (pathname === '/vod' || pathname === '/vod/') pathname = '/vod.html';

      let filePath = path.join(ROOT, pathname);
      if (!fs.existsSync(filePath) && fs.existsSync(filePath + '.html')) {
        filePath += '.html';
      }

      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Not Found');
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = mimeTypes[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(fs.readFileSync(filePath));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(String(err));
    }
  });
}

test('Ecosystem Mobile Edge Panel — integration & i18n smoke test', async () => {
  const server = createStaticServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  const browser = await chromium.launch({ headless: true });

  try {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      locale: 'pl-PL'
    });
    const page = await context.newPage();

    // 1. Wyszukiwarka
    await page.goto(`${baseUrl}/wyszukiwarka`, { waitUntil: 'domcontentloaded' });
    const trigger = page.locator('.cc-mobile-edge-trigger');
    await trigger.waitFor({ state: 'visible', timeout: 5000 });
    const box = await trigger.boundingBox();
    assert.ok(box && box.width >= 44 && box.height >= 44, `Trigger touch target >= 44px (got ${box?.width}x${box?.height})`);

    // Click trigger to open edge panel dialog
    await trigger.click();
    const dialog = page.locator('dialog.cc-mobile-edge');
    await dialog.waitFor({ state: 'visible', timeout: 5000 });

    // Check active icon for wyszukiwarka
    const activeItem = dialog.locator('nav a[aria-current="page"]');
    assert.ok((await activeItem.count()) >= 1, 'Edge panel must have an active page indicator');
    assert.equal(await activeItem.getAttribute('data-edge-key'), 'search', 'Search item must be active on /wyszukiwarka');

    // 2. Multilingual translation reactivity
    await page.evaluate(() => {
      if (window.EkoCCI18n) window.EkoCCI18n.setLocale('en');
    });

    const closeBtn = dialog.locator('button[data-edge-key="close"]');
    const closeLabelEn = await closeBtn.getAttribute('aria-label');
    assert.equal(closeLabelEn, 'Close navigation panel', 'Close button must update aria-label to English');

    const searchItem = dialog.locator('a[data-edge-key="search"]');
    const searchLabelEn = await searchItem.getAttribute('aria-label');
    assert.equal(searchLabelEn, 'Search Ecosystem', 'Search link must update aria-label to English');

    // Close dialog
    await closeBtn.click();
    assert.equal(await dialog.isVisible(), false, 'Dialog must close on close button click');

    // Test German language reactivity
    await page.evaluate(() => {
      if (window.EkoCCI18n) window.EkoCCI18n.setLocale('de');
    });
    await trigger.click();
    await dialog.waitFor({ state: 'visible', timeout: 5000 });
    const closeLabelDe = await closeBtn.getAttribute('aria-label');
    assert.equal(closeLabelDe, 'Navigationspanel schließen', 'Close button must update aria-label to German');
    const searchLabelDe = await searchItem.getAttribute('aria-label');
    assert.equal(searchLabelDe, 'Im Ökosystem suchen', 'Search link must update aria-label to German');
    await closeBtn.click();

    // 3. Akademia
    await page.goto(`${baseUrl}/akademia`, { waitUntil: 'domcontentloaded' });
    const akademiaTrigger = page.locator('.cc-mobile-edge-trigger');
    await akademiaTrigger.waitFor({ state: 'visible', timeout: 5000 });
    await akademiaTrigger.click();
    const akademiaDialog = page.locator('dialog.cc-mobile-edge');
    await akademiaDialog.waitFor({ state: 'visible', timeout: 5000 });
    const akademiaActive = akademiaDialog.locator('nav a[aria-current="page"]');
    assert.equal(await akademiaActive.getAttribute('data-edge-key'), 'study', 'Akademia (study) item must be active on /akademia');

    // 4. MojaBiblia
    await page.goto(`${baseUrl}/mojabiblia`, { waitUntil: 'domcontentloaded' });
    const mbTrigger = page.locator('.cc-mobile-edge-trigger');
    await mbTrigger.waitFor({ state: 'visible', timeout: 5000 });
    await mbTrigger.click();
    const mbDialog = page.locator('dialog.cc-mobile-edge');
    await mbDialog.waitFor({ state: 'visible', timeout: 5000 });
    const mbActive = mbDialog.locator('nav a[aria-current="page"]');
    assert.equal(await mbActive.getAttribute('data-edge-key'), 'book', 'MojaBiblia (book) item must be active on /mojabiblia');

    // 5. Kino VOD
    await page.goto(`${baseUrl}/vod`, { waitUntil: 'domcontentloaded' });
    const vodTrigger = page.locator('.cc-mobile-edge-trigger');
    await vodTrigger.waitFor({ state: 'visible', timeout: 5000 });
    await vodTrigger.click();
    const vodDialog = page.locator('dialog.cc-mobile-edge');
    await vodDialog.waitFor({ state: 'visible', timeout: 5000 });
    const vodActive = vodDialog.locator('nav a[aria-current="page"]');
    assert.equal(await vodActive.getAttribute('data-edge-key'), 'play', 'VOD (play) item must be active on /vod');

    await context.close();
  } finally {
    await browser.close();
    server.close();
  }
});
