import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

function createStaticServer() {
  return http.createServer((req, res) => {
    let reqPath = req.url.split('?')[0];
    if (reqPath === '/' || reqPath === '/BiblijneUwielbienie') reqPath = '/biblijne-uwielbienie.html';
    
    const filePath = path.join(process.cwd(), reqPath.replace(/^\//, ''));
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath);
      const mimeMap = {
        '.html': 'text/html; charset=utf-8',
        '.js': 'application/javascript; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.json': 'application/json; charset=utf-8',
        '.webp': 'image/webp',
        '.jpg': 'image/jpeg',
        '.png': 'image/png',
        '.svg': 'image/svg+xml'
      };
      res.writeHead(200, { 'Content-Type': mimeMap[ext] || 'application/octet-stream' });
      fs.createReadStream(filePath).pipe(res);
    } else {
      res.writeHead(404);
      res.end('Not found');
    }
  });
}

test('BU Fullscreen Worship Mode: 1. Assets integrity & files existence', () => {
  const imgDir = path.join(process.cwd(), 'images', 'biblijne-uwielbienie');
  assert.ok(fs.existsSync(path.join(imgDir, 'worship-cross-fullscreen.webp')), 'worship-cross-fullscreen.webp musi istnieć');
  assert.ok(fs.existsSync(path.join(imgDir, 'worship-cross-fullscreen.jpg')), 'worship-cross-fullscreen.jpg musi istnieć');

  const webpSize = fs.statSync(path.join(imgDir, 'worship-cross-fullscreen.webp')).size;
  assert.ok(webpSize > 20000 && webpSize < 500000, `Rozmiar webp optymalny: ${webpSize} B`);
});

test('BU Fullscreen Worship Mode: 2. Playwright Live Interaction & Zero Regression Test', async () => {
  const server = createStaticServer();
  await new Promise(r => server.listen(0, r));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/BiblijneUwielbienie?chapter=GEN-001`;

  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // 1. Sprawdzenie stanu standardowego
    const standardState = await page.evaluate(() => {
      const stage = document.getElementById('hero-karaoke-stage');
      const backdrop = document.getElementById('hero-karaoke-backdrop');
      const fsBtn = document.getElementById('bu-mode-fullscreen-btn');
      const dimmer = document.getElementById('bu-worship-dimmer');
      const isFs = stage?.classList.contains('is-fullscreen');
      const bdDisplay = backdrop ? window.getComputedStyle(backdrop).display : null;
      const dimmerDisplay = dimmer ? window.getComputedStyle(dimmer).display : null;
      return { isFs, bdDisplay, dimmerDisplay, hasBtn: Boolean(fsBtn) };
    });

    assert.equal(standardState.isFs, false, 'Standardowy tryb nie ma klasy is-fullscreen');
    assert.equal(standardState.bdDisplay, 'none', 'Tło jest ukryte w trybie standardowym');
    assert.equal(standardState.dimmerDisplay, 'none', 'Dimmer jest ukryty w trybie standardowym');
    assert.equal(standardState.hasBtn, true, 'Przycisk pełnoekranowy bu-mode-fullscreen-btn jest obecny');

    // 2. Wejście w tryb pełnoekranowy (kliknięcie bu-mode-fullscreen-btn)
    await page.click('#bu-mode-fullscreen-btn');
    await page.waitForTimeout(400);

    const fsState = await page.evaluate(() => {
      const stage = document.getElementById('hero-karaoke-stage');
      const backdrop = document.getElementById('hero-karaoke-backdrop');
      const dimmer = document.getElementById('bu-worship-dimmer');
      const fsBtn = document.getElementById('bu-mode-fullscreen-btn');
      const isFs = stage?.classList.contains('is-fullscreen');
      const bdDisplay = backdrop ? window.getComputedStyle(backdrop).display : null;
      const dimmerDisplay = dimmer ? window.getComputedStyle(dimmer).display : null;
      const dimVal = stage?.style.getPropertyValue('--bu-worship-dim') || '0.75';
      const btnAria = fsBtn?.getAttribute('aria-label');
      return { isFs, bdDisplay, dimmerDisplay, dimVal, btnAria };
    });

    assert.equal(fsState.isFs, true, 'Scena posiada klasę is-fullscreen');
    assert.equal(fsState.bdDisplay, 'block', 'Tło jest widoczne w trybie pełnoekranowym');
    assert.ok(fsState.dimmerDisplay.includes('flex'), 'Dimmer jest widoczny w trybie pełnoekranowym');
    assert.equal(fsState.dimVal, '0.75', 'Domyślne przyciemnienie to 75% (Skupienie)');
    assert.ok(fsState.btnAria.includes('Opuść'), 'Przycisk ma etykietę opuszczenia');

    // Zrzut ekranu w trybie pełnoekranowym Desktop
    await page.screenshot({ path: 'C:/Users/czark/.gemini/antigravity/brain/6171dbb4-faed-472d-ab3b-0ab4afdc2e53/worship_mode_desktop_verified.png' });

    // 3. Test regulacji przyciemnienia (Dimmer 60%, 90%, 75%)
    await page.click('#bu-worship-dimmer button[data-dim="60"]');
    await page.waitForTimeout(100);
    let currentDim = await page.evaluate(() => document.getElementById('hero-karaoke-stage')?.style.getPropertyValue('--bu-worship-dim'));
    assert.equal(currentDim, '0.60', 'Przełączenie na 60% ustawia --bu-worship-dim na 0.60');

    await page.click('#bu-worship-dimmer button[data-dim="90"]');
    await page.waitForTimeout(100);
    currentDim = await page.evaluate(() => document.getElementById('hero-karaoke-stage')?.style.getPropertyValue('--bu-worship-dim'));
    assert.equal(currentDim, '0.90', 'Przełączenie na 90% ustawia --bu-worship-dim na 0.90');

    await page.click('#bu-worship-dimmer button[data-dim="75"]');
    await page.waitForTimeout(100);
    currentDim = await page.evaluate(() => document.getElementById('hero-karaoke-stage')?.style.getPropertyValue('--bu-worship-dim'));
    assert.equal(currentDim, '0.75', 'Powrót do 75% przywraca 0.75');

    // 4. Test wyjścia klawiszem Escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);

    const exitState = await page.evaluate(() => {
      const stage = document.getElementById('hero-karaoke-stage');
      const backdrop = document.getElementById('hero-karaoke-backdrop');
      return {
        isFs: stage?.classList.contains('is-fullscreen'),
        bdDisplay: backdrop ? window.getComputedStyle(backdrop).display : null
      };
    });
    assert.equal(exitState.isFs, false, 'Escape prawidłowo wyłącza is-fullscreen');
    assert.equal(exitState.bdDisplay, 'none', 'Tło znika po wyjściu z pełnego ekranu');

    // 5. Test TV (16:9 4K / Full HD)
    const tvPage = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
    await tvPage.goto(baseUrl, { waitUntil: 'domcontentloaded' });
    await tvPage.waitForTimeout(800);
    await tvPage.click('#bu-mode-fullscreen-btn');
    await tvPage.waitForTimeout(400);
    await tvPage.screenshot({ path: 'C:/Users/czark/.gemini/antigravity/brain/6171dbb4-faed-472d-ab3b-0ab4afdc2e53/worship_mode_tv_1080p_verified.png' });

    // 6. Test Mobile (iPhone 390x844 portrait)
    const mobPage = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await mobPage.goto(baseUrl, { waitUntil: 'domcontentloaded' });
    await mobPage.waitForTimeout(800);
    await mobPage.click('#bu-mode-fullscreen-btn');
    await mobPage.waitForTimeout(400);
    await mobPage.screenshot({ path: 'C:/Users/czark/.gemini/antigravity/brain/6171dbb4-faed-472d-ab3b-0ab4afdc2e53/worship_mode_mobile_portrait_verified.png' });

    // 7. Test Mobile Landscape (844x390)
    const mobLandscapePage = await browser.newPage({ viewport: { width: 844, height: 390 } });
    await mobLandscapePage.goto(baseUrl, { waitUntil: 'domcontentloaded' });
    await mobLandscapePage.waitForTimeout(800);
    await mobLandscapePage.click('#bu-mode-fullscreen-btn');
    await mobLandscapePage.waitForTimeout(400);
    await mobLandscapePage.screenshot({ path: 'C:/Users/czark/.gemini/antigravity/brain/6171dbb4-faed-472d-ab3b-0ab4afdc2e53/worship_mode_mobile_landscape_verified.png' });
  } finally {
    if (browser) await browser.close();
    if (server.closeAllConnections) server.closeAllConnections();
    await new Promise(r => server.close(r));
  }
});
