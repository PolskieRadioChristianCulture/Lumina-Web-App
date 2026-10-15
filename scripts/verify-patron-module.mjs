import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';
import http from 'node:http';

const ROOT = process.cwd();
const diagDir = path.join(ROOT, 'images', 'biblijne-uwielbienie', 'diagnostics-patron');
fs.mkdirSync(diagDir, { recursive: true });

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
  console.log('--- WERYFIKACJA PLAYWRIGHT MODUŁU PATRON ROZDZIAŁU ---');
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

  for (const vp of viewports) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.goto(baseUrl, { waitUntil: 'networkidle' });

    // Expand player patron module
    await page.click('#player-patron-toggle');
    await page.waitForTimeout(400);

    // Verify horizontal overflow
    const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);

    // Check QR Modal
    await page.click('#player-patron-body button:has-text("Kod QR")');
    await page.waitForTimeout(300);
    const qrActive = await page.evaluate(() => document.getElementById('qr-modal-overlay').classList.contains('is-active'));
    const qrCanvasExists = await page.evaluate(() => document.querySelector('#qr-code-canvas-target canvas, #qr-code-canvas-target svg, #qr-code-canvas-target table') !== null);

    // Close QR Modal
    await page.click('.qr-modal-box .modal-close-btn');
    await page.waitForTimeout(200);

    // Capture screenshot
    const shotPath = path.join(diagDir, `patron-${vp.name}.png`);
    await page.screenshot({ path: shotPath, fullPage: false });

    console.log(`Viewport ${vp.name}: overflow=${hasOverflow}, qrActive=${qrActive}, qrCanvas=${qrCanvasExists}, errors=${errors.length}`);
    if (errors.length > 0) console.error(errors);

    await page.close();
  }

  // Test deeplink ?chapter=GEN-001 (unpublished)
  const deeplinkPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await deeplinkPage.goto(`${baseUrl}?chapter=GEN-001`, { waitUntil: 'networkidle' });
  await deeplinkPage.waitForTimeout(600);

  const drilldownOpen = await deeplinkPage.evaluate(() => document.getElementById('chapter-drilldown-panel').classList.contains('is-open'));
  const targetedExists = await deeplinkPage.evaluate(() => document.getElementById('chapter-card-GEN-001').classList.contains('is-targeted'));
  const drilldownPatronOpen = await deeplinkPage.evaluate(() => document.getElementById('drilldown-patron-module').classList.contains('is-open'));

  console.log(`Deeplink GEN-001: drilldownOpen=${drilldownOpen}, targetedCard=${targetedExists}, patronOpen=${drilldownPatronOpen}`);

  const deeplinkShot = path.join(diagDir, 'patron-deeplink-gen001.png');
  await deeplinkPage.screenshot({ path: deeplinkShot });
  await deeplinkPage.close();

  await browser.close();
  server.close();
  console.log('--- WERYFIKACJA ZAKOŃCZONA POMYŚLNIE ---');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
