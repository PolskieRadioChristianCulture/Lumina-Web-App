import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';
import http from 'node:http';

const ROOT = process.cwd();
const screenDir = path.join(ROOT, 'images', 'biblijne-uwielbienie', 'screenshots');
fs.mkdirSync(screenDir, { recursive: true });

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
  console.log('Testing Biblijne Uwielbienie UI across devices via Playwright (HTTP static server)...');
  const server = createServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}/biblijne-uwielbienie.html`;

  const browser = await chromium.launch({ headless: true });
  const viewports = [
    { name: 'desktop-1440', width: 1440, height: 900 },
    { name: 'tablet-768', width: 768, height: 1024 },
    { name: 'mobile-iphone-390', width: 390, height: 844 },
    { name: 'mobile-android-360', width: 360, height: 800 },
    { name: 'mobile-narrow-320', width: 320, height: 568 }
  ];

  for (const vp of viewports) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(300);

    // Check horizontal overflow
    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });

    console.log(`Viewport ${vp.name} (${vp.width}x${vp.height}): overflow = ${overflow}`);
    if (overflow) {
      console.error(`ERROR: Horizontal overflow detected on ${vp.name}!`);
      process.exitCode = 1;
    }

    const shotPath = path.join(screenDir, `preview-${vp.name}.jpg`);
    await page.screenshot({ path: shotPath, quality: 85, type: 'jpeg' });
    console.log(`Saved screenshot: ${shotPath}`);

    await page.close();
  }

  await browser.close();
  await new Promise(resolve => server.close(resolve));
  console.log('✅ Wszystkie testy Playwright zakończone pomyślnie! Brak overflow poziomego.');
}

run().catch(err => {
  console.error('Błąd Playwright:', err);
  process.exit(1);
});
