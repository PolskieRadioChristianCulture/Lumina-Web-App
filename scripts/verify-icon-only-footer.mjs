import { chromium } from 'playwright';
import http from 'http';
import fs from 'fs';
import path from 'path';

const REPO_ROOT = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc';
const ARTIFACTS_DIR = 'C:/Users/czark/.gemini/antigravity/brain/d6fb6723-88d9-47dd-951a-c934e6675ed7';
const PORT = 3499;

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

    let filePath = path.join(REPO_ROOT, reqPath.replace(/^\//, ''));
    if (!fs.existsSync(filePath)) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': mimeTypes[ext] || 'application/octet-stream',
      'Access-Control-Allow-Origin': '*'
    });
    fs.createReadStream(filePath).pipe(res);
  });

  return new Promise((resolve) => {
    server.listen(PORT, () => resolve(server));
  });
}

async function run() {
  const server = await startStaticServer();
  console.log(`Server started on http://localhost:${PORT}`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

  try {
    await page.goto(`http://localhost:${PORT}/wyszukiwarka`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);

    // 1. Full view with icon-only footer
    const fullPath = path.join(ARTIFACTS_DIR, 'footer_icon_only_01_full.png');
    await page.screenshot({ path: fullPath });
    console.log(`Saved: ${fullPath}`);

    // 2. Crop of the footer bar
    const footerSub = page.locator('.cc-omni-footer-sub');
    if (await footerSub.count() > 0) {
      const footerCropPath = path.join(ARTIFACTS_DIR, 'footer_icon_only_02_crop.png');
      await footerSub.screenshot({ path: footerCropPath });
      console.log(`Saved: ${footerCropPath}`);
    }

    // 3. Click wallpaper button to open modal
    const wallBtn = page.locator('#ccOmniWallBtn');
    await wallBtn.click();
    await page.waitForTimeout(300);

    const modalPath = path.join(ARTIFACTS_DIR, 'footer_icon_only_03_modal.png');
    await page.screenshot({ path: modalPath });
    console.log(`Saved: ${modalPath}`);

    console.log('Visual verification complete!');
  } finally {
    await browser.close();
    server.close();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
