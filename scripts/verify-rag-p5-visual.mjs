import { chromium } from 'playwright';
import http from 'http';
import fs from 'fs';
import path from 'path';

const REPO_ROOT = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc';
const ARTIFACTS_DIR = 'C:/Users/czark/.gemini/antigravity/brain/d6fb6723-88d9-47dd-951a-c934e6675ed7';
const PORT = 3399;

function startStaticServer() {
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.webp': 'image/webp',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml'
  };

  const server = http.createServer((req, res) => {
    let reqPath = req.url.split('?')[0];
    if (reqPath === '/' || reqPath === '/wyszukiwarka') reqPath = '/wyszukiwarka.html';
    const filePath = path.join(REPO_ROOT, reqPath);

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, {
        'Content-Type': mimeTypes[ext] || 'application/octet-stream',
        'Access-Control-Allow-Origin': '*'
      });
      fs.createReadStream(filePath).pipe(res);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
    }
  });

  return new Promise((resolve) => {
    server.listen(PORT, () => resolve(server));
  });
}

async function runVisualAudit() {
  const server = await startStaticServer();
  console.log(`Static server running on http://localhost:${PORT}`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:3399/wyszukiwarka...');
  await page.goto(`http://localhost:${PORT}/wyszukiwarka`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  // 1. Initial view with Polska & Radio wallpaper
  const p1 = path.join(ARTIFACTS_DIR, 'wallpaper_gallery_01_default.png');
  await page.screenshot({ path: p1, fullPage: false });
  console.log('Saved:', p1);

  // 2. Open Wallpaper Gallery Modal
  const wallBtn = page.locator('#ccOmniWallBtn');
  if (await wallBtn.isVisible()) {
    await wallBtn.click();
    await page.waitForTimeout(500);

    const p2 = path.join(ARTIFACTS_DIR, 'wallpaper_gallery_02_modal_open.png');
    await page.screenshot({ path: p2, fullPage: false });
    console.log('Saved:', p2);

    // 3. Select Global Christian Culture card
    const globalCard = page.locator('.cc-wall-card[data-wall-id="global-radio"]');
    if (await globalCard.isVisible()) {
      await globalCard.click();
      await page.waitForTimeout(500);

      // Close modal
      const closeBtn = page.locator('#ccBtnWallCloseModal');
      await closeBtn.click();
      await page.waitForTimeout(400);

      const p3 = path.join(ARTIFACTS_DIR, 'wallpaper_gallery_03_global_active.png');
      await page.screenshot({ path: p3, fullPage: false });
      console.log('Saved:', p3);
    }
  }

  await browser.close();
  server.close();
  console.log('Playwright wallpaper gallery audit finished successfully!');
}

runVisualAudit().catch(err => {
  console.error('Playwright error:', err);
  process.exit(1);
});
