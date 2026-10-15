import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';
import http from 'node:http';

const ROOT = process.cwd();
const afterDir = path.join(ROOT, 'images', 'biblijne-uwielbienie', 'diagnostics-after');
fs.mkdirSync(afterDir, { recursive: true });

function createServer() {
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.webp': 'image/webp',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.svg': 'image/svg+xml'
  };

  return http.createServer((req, res) => {
    let reqPath = decodeURIComponent(req.url.split('?')[0]);
    if (reqPath === '/' || reqPath === '/BiblijneUwielbienie') {
      reqPath = '/biblijne-uwielbienie.html';
    }
    const filePath = path.join(ROOT, reqPath);
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
}

async function run() {
  console.log('--- DIAGNOSTYKA PO REDESIGNIE PREMIUM BIBLIJNE UWIELBIENIE ---');
  const server = createServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}/biblijne-uwielbienie.html`;

  const browser = await chromium.launch({ headless: true });
  const viewports = [
    { name: 'desktop-1920x1080', width: 1920, height: 1080 },
    { name: 'desktop-1440x900', width: 1440, height: 900 },
    { name: 'mobile-390x844', width: 390, height: 844 },
    { name: 'mobile-360x800', width: 360, height: 800 }
  ];

  const results = [];

  for (const vp of viewports) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    const consoleErrors = [];
    const pageErrors = [];

    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', err => pageErrors.push(err.message));

    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);

    // Verify UI Metrics
    const metrics = await page.evaluate(() => {
      const scrollWidth = document.documentElement.scrollWidth;
      const innerWidth = window.innerWidth;
      const nav = document.querySelector('.site-header');
      const navHeight = nav ? nav.offsetHeight : 0;
      const hero = document.querySelector('.hero-section');
      const heroHeight = hero ? hero.offsetHeight : 0;
      const h1 = document.querySelector('.hero-h1');
      const h1Style = h1 ? window.getComputedStyle(h1) : null;
      const h1FontSize = h1Style ? h1Style.fontSize : '0';
      const h1LineHeight = h1Style ? h1Style.lineHeight : '0';
      const playerCard = document.querySelector('.master-player-card');
      const playerCardHeight = playerCard ? playerCard.offsetHeight : 0;
      const booksCount = document.querySelectorAll('.book-card').length;
      const miniPlayer = document.querySelector('.mobile-sticky-mini-player');
      const miniPlayerVisible = miniPlayer ? window.getComputedStyle(miniPlayer).display !== 'none' : false;
      const bottomNav = document.querySelector('.mobile-bottom-nav');
      const bottomNavVisible = bottomNav ? window.getComputedStyle(bottomNav).display !== 'none' : false;

      // Touch target size check for interactive buttons
      const buttons = Array.from(document.querySelectorAll('button, a.btn-cta-primary, a.btn-cta-secondary, .mobile-nav-item'));
      const smallTargets = buttons.filter(b => {
        const rect = b.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && (rect.width < 40 || rect.height < 40);
      }).length;

      return {
        scrollWidth,
        innerWidth,
        hasOverflow: scrollWidth > innerWidth,
        navHeight,
        heroHeight,
        h1FontSize,
        h1LineHeight,
        playerCardHeight,
        booksCount,
        miniPlayerVisible,
        bottomNavVisible,
        smallTargetsCount: smallTargets
      };
    });

    console.log(`Viewport ${vp.name} (${vp.width}x${vp.height}):`);
    console.log(`  - hasOverflow: ${metrics.hasOverflow} (scrollWidth: ${metrics.scrollWidth}, innerWidth: ${metrics.innerWidth})`);
    console.log(`  - navHeight: ${metrics.navHeight}px, heroHeight: ${metrics.heroHeight}px`);
    console.log(`  - h1FontSize: ${metrics.h1FontSize}, h1LineHeight: ${metrics.h1LineHeight}`);
    console.log(`  - booksCount: ${metrics.booksCount}, miniPlayer: ${metrics.miniPlayerVisible}, bottomNav: ${metrics.bottomNavVisible}`);

    if (metrics.hasOverflow) {
      console.error(`ERROR: Horizontal overflow on ${vp.name}!`);
      process.exitCode = 1;
    }

    const shotPath = path.join(afterDir, `after-${vp.name}.jpg`);
    await page.screenshot({ path: shotPath, quality: 90, type: 'jpeg' });
    console.log(`  - Screenshot saved: ${shotPath}`);

    // Test clicking a book to test drilldown
    if (vp.name === 'desktop-1920x1080') {
      const firstBook = await page.$('.book-card');
      if (firstBook) {
        await firstBook.click();
        await page.waitForTimeout(300);
        const drilldownOpen = await page.evaluate(() => {
          const panel = document.getElementById('chapter-drilldown-panel');
          return panel ? panel.classList.contains('is-open') : false;
        });
        console.log(`  - Drilldown panel test: is-open = ${drilldownOpen}`);
        const drillShot = path.join(afterDir, `after-${vp.name}-drilldown.jpg`);
        await page.screenshot({ path: drillShot, quality: 90, type: 'jpeg' });
      }
    }

    results.push({
      viewport: vp.name,
      dimensions: `${vp.width}x${vp.height}`,
      metrics,
      consoleErrors,
      pageErrors,
      screenshot: shotPath
    });

    await page.close();
  }

  await browser.close();
  await new Promise(resolve => server.close(resolve));

  const jsonReportPath = path.join(afterDir, 'diagnostics-after-report.json');
  fs.writeFileSync(jsonReportPath, JSON.stringify(results, null, 2), 'utf8');
  console.log(`Raport JSON zapisany: ${jsonReportPath}`);
  console.log('✅ Diagnostyka po redesignie zakończona pomyślnie.');
}

run().catch(err => {
  console.error('Błąd diagnostyki po redesignie:', err);
  process.exit(1);
});
