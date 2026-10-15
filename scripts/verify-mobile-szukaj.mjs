import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

import http from 'http';
import fs from 'fs';

async function testMobileLayout() {
  const mimeMap = {
    '.html': 'text/html',
    '.json': 'application/json',
    '.js': 'application/javascript',
    '.mjs': 'application/javascript',
    '.css': 'text/css',
    '.png': 'image/png'
  };

  const server = http.createServer((req, res) => {
    let reqPath = req.url.split('?')[0];
    if (reqPath === '/' || reqPath === '') reqPath = '/szukaj.html';
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
  const baseUrl = `http://localhost:${port}/szukaj.html`;

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const viewports = [
    { name: 'iphone-390', width: 390, height: 844 },
    { name: 'galaxy-360', width: 360, height: 800 },
    { name: 'small-320', width: 320, height: 650 },
    { name: 'pixel-412', width: 412, height: 915 }
  ];

  let allPassed = true;

  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto(baseUrl + '?q=biblia');
    await page.waitForSelector('.result-card', { timeout: 5000 });

    const metrics = await page.evaluate(() => {
      const winW = window.innerWidth;
      const scrollW = document.documentElement.scrollWidth;
      const bodyScrollW = document.body.scrollWidth;
      const cards = Array.from(document.querySelectorAll('.result-card'));
      const cardMetrics = cards.slice(0, 10).map((c, i) => {
        const r = c.getBoundingClientRect();
        return {
          index: i,
          left: Math.round(r.left),
          right: Math.round(r.right),
          width: Math.round(r.width),
          overflowRight: r.right > winW
        };
      });
      return {
        winW,
        scrollW,
        bodyScrollW,
        hasHorizontalScroll: scrollW > winW || bodyScrollW > winW,
        cardCount: cards.length,
        cards: cardMetrics,
        allCardsFit: cardMetrics.every(c => !c.overflowRight)
      };
    });

    console.log(`[Viewport ${vp.name} (${vp.width}px)] winW=${metrics.winW}, scrollW=${metrics.scrollW}, cards=${metrics.cardCount}, card0 width=${metrics.cards[0]?.width}, card0 right=${metrics.cards[0]?.right}, allCardsFit=${metrics.allCardsFit}`);

    if (metrics.hasHorizontalScroll || !metrics.allCardsFit) {
      console.error(`FAILED: horizontal overflow in ${vp.name}`);
      allPassed = false;
    }

    const artifactPath = path.resolve('C:/Users/czark/.gemini/antigravity/brain/a82c1ac6-2f50-492b-851a-8346553bffa1', `mobile-verified-${vp.name}.png`);
    await page.screenshot({ path: artifactPath, fullPage: false });

    if (vp.name === 'iphone-390') {
      await page.evaluate(() => {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('cc_theme', 'dark');
      });
      await page.waitForTimeout(100);
      const darkArtifact = path.resolve('C:/Users/czark/.gemini/antigravity/brain/a82c1ac6-2f50-492b-851a-8346553bffa1', 'mobile-verified-iphone-390-dark.png');
      await page.screenshot({ path: darkArtifact, fullPage: false });
    }
  }

  await browser.close();
  server.close();

  if (!allPassed) {
    process.exit(1);
  }
  console.log('SUCCESS: All mobile viewports passed perfectly with 0 overflow!');
}

testMobileLayout().catch(err => {
  console.error(err);
  process.exit(1);
});
