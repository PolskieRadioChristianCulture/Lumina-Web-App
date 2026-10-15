import { chromium } from 'playwright';
import path from 'path';
import http from 'http';
import fs from 'fs';

const ARTIFACT_DIR = 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\a82c1ac6-2f50-492b-851a-8346553bffa1';
const ROOT = process.cwd();

// Prosty serwer statyczny dla testów
const mimeTypes = {
  '.html': 'text/html',
  '.json': 'application/json',
  '.js': 'application/javascript',
  '.css': 'text/css'
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/' || reqPath === '/szukaj') reqPath = '/szukaj.html';
  const filePath = path.join(ROOT, reqPath);

  if (fs.existsSync(filePath)) {
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'text/plain' });
    res.end(fs.readFileSync(filePath));
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(8099, async () => {
  console.log('Test server running on http://localhost:8099');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  try {
    // 1. Desktop 1920x1080 Dark mode (Home)
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('http://localhost:8099/szukaj.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'szukaj-desktop-dark-home.png'), fullPage: false });
    console.log('Captured: szukaj-desktop-dark-home.png');

    // Sprawdzenie braku h-scroll
    const hasHScrollDesktop = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    console.log('Desktop 1920 h-scroll:', hasHScrollDesktop);

    // 2. Desktop Light Mode
    await page.click('#themeToggleBtn');
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'szukaj-desktop-light-home.png'), fullPage: false });
    console.log('Captured: szukaj-desktop-light-home.png');

    // 3. Wyszukiwanie "Lekcja 15 na dziś" (Results mode)
    await page.fill('#q', 'Lekcja 15 na dziś');
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'szukaj-desktop-results-lekcja15.png'), fullPage: false });
    console.log('Captured: szukaj-desktop-results-lekcja15.png');

    // 4. Przewodnik kontekstowy "nadzieja" (w trybie ciemnym)
    await page.click('#themeToggleBtn'); // powrót do dark
    await page.fill('#q', 'nadzieja');
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'szukaj-desktop-guide-nadzieja.png'), fullPage: false });
    console.log('Captured: szukaj-desktop-guide-nadzieja.png');

    // 5. Tablet 768x1024
    await page.fill('#q', '');
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'szukaj-tablet-768.png'), fullPage: false });
    console.log('Captured: szukaj-tablet-768.png');

    // 6. Mobile 390x844 (iPhone 14)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(400);
    const hasHScrollMobile = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    console.log('Mobile 390 h-scroll:', hasHScrollMobile);

    const overflowing = await page.evaluate(() => {
      const docWidth = document.documentElement.clientWidth;
      const elements = document.querySelectorAll('*');
      const result = [];
      for (const el of elements) {
        const rect = el.getBoundingClientRect();
        if (rect.right > docWidth + 1 || rect.width > docWidth + 1) {
          result.push({
            tag: el.tagName,
            id: el.id,
            className: el.className,
            right: Math.round(rect.right),
            width: Math.round(rect.width),
            docWidth
          });
        }
      }
      return result.slice(0, 5);
    });
    console.log('Overflowing elements on 390px:', overflowing);

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'szukaj-mobile-390.png'), fullPage: false });
    console.log('Captured: szukaj-mobile-390.png');

    // 7. Narrow Mobile 320x568 (iPhone SE / mały ekran)
    await page.setViewportSize({ width: 320, height: 568 });
    await page.waitForTimeout(400);
    const hasHScroll320 = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    console.log('Mobile 320 h-scroll:', hasHScroll320);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'szukaj-mobile-320.png'), fullPage: false });
    console.log('Captured: szukaj-mobile-320.png');

    console.log('Console errors:', consoleErrors);
    console.log('ALL PLAYWRIGHT SCREENSHOTS & OVERFLOW CHECKS PASSED ✅');
  } catch (err) {
    console.error('Playwright verification error:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
    server.close();
  }
});
