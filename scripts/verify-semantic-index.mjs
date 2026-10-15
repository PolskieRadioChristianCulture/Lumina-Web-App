import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

async function verifySemanticIndex() {
  const mimeMap = {
    '.html': 'text/html',
    '.json': 'application/json',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.jpg': 'image/jpeg',
    '.png': 'image/png'
  };

  const server = http.createServer((req, res) => {
    let reqPath = req.url.split('?')[0];
    if (reqPath === '/' || reqPath === '/index' || reqPath === '/index.html') {
      reqPath = '/semantic-index.html';
    }
    const absPath = path.join(rootDir, reqPath);
    if (fs.existsSync(absPath) && fs.statSync(absPath).isFile()) {
      const ext = path.extname(absPath);
      res.writeHead(200, { 'Content-Type': mimeMap[ext] || 'text/plain' });
      res.end(fs.readFileSync(absPath));
    } else {
      res.writeHead(404);
      res.end('Not found');
    }
  });

  await new Promise(resolve => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/index`;

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log(`Testowanie pod adresem: ${baseUrl}`);

  // 1. Desktop Test (1440x900)
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(baseUrl);
  await page.waitForSelector('.resource-card');

  const desktopMetrics = await page.evaluate(() => {
    return {
      title: document.title,
      cardsCount: document.querySelectorAll('.resource-card').length,
      categoriesCount: document.querySelectorAll('.cat-card').length,
      scrollW: document.documentElement.scrollWidth,
      winW: window.innerWidth,
      theme: document.documentElement.getAttribute('data-theme')
    };
  });
  console.log('Desktop Metrics:', desktopMetrics);

  const artDir = 'C:/Users/czark/.gemini/antigravity/brain/a82c1ac6-2f50-492b-851a-8346553bffa1';
  await page.screenshot({ path: path.join(artDir, 'semantic-index-desktop-dark.png'), fullPage: false });

  // 2. Przełączenie na jasny motyw
  await page.click('#themeToggleBtn');
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(artDir, 'semantic-index-desktop-light.png'), fullPage: false });

  // 3. Test filtrowania
  await page.fill('#filterInput', 'biblia');
  await page.waitForTimeout(200);
  const filterMetrics = await page.evaluate(() => {
    const visibleCards = Array.from(document.querySelectorAll('.resource-card')).filter(c => c.style.display !== 'none');
    return { visibleCount: visibleCards.length };
  });
  console.log('Filter "biblia" visible cards:', filterMetrics.visibleCount);
  await page.screenshot({ path: path.join(artDir, 'semantic-index-filtered-biblia.png'), fullPage: false });

  // Wyczyść filtr
  await page.fill('#filterInput', '');
  await page.waitForTimeout(200);

  // 4. Testy responsywności mobilnej (390px, 360px, 320px)
  const mobileViewports = [
    { name: 'iphone-390', width: 390, height: 844 },
    { name: 'galaxy-360', width: 360, height: 800 },
    { name: 'small-320', width: 320, height: 650 }
  ];

  for (const vp of mobileViewports) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.waitForTimeout(200);
    const mMetrics = await page.evaluate(() => {
      const winW = window.innerWidth;
      const scrollW = document.documentElement.scrollWidth;
      return {
        winW,
        scrollW,
        hasHorizontalScroll: scrollW > winW
      };
    });
    console.log(`Mobile ${vp.name} (${vp.width}px):`, mMetrics);
    if (mMetrics.hasHorizontalScroll) {
      throw new Error(`Błąd poziomego overflow na ${vp.name}!`);
    }
    if (vp.name === 'iphone-390') {
      await page.screenshot({ path: path.join(artDir, 'semantic-index-mobile-390.png'), fullPage: false });
    }
  }

  await browser.close();
  server.close();
  console.log('WSZYSTKIE TESTY PLAYWRIGHT ZALICZONE SUKCESEM (0 błędów, 0 overflow)!');
}

verifySemanticIndex().catch(err => {
  console.error(err);
  process.exit(1);
});
