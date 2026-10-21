import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';
import http from 'node:http';

const artifactDir = 'C:/Users/czark/.gemini/antigravity/brain/db144fde-c11f-407d-ac06-6b4bec418097';
const distDir = 'C:/Users/czark/.gemini/antigravity/brain/db144fde-c11f-407d-ac06-6b4bec418097/unpacked_zip/POKONAC_GOLIATA_PREMIUM_2026/dist';

function startServer(port = 4174) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let reqPath = req.url.split('?')[0];
      if (reqPath === '/' || reqPath === '') reqPath = '/index.html';
      const filePath = path.join(distDir, reqPath);
      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath).toLowerCase();
        const mimeTypes = {
          '.html': 'text/html; charset=utf-8',
          '.js': 'application/javascript; charset=utf-8',
          '.css': 'text/css; charset=utf-8',
          '.webp': 'image/webp',
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.png': 'image/png'
        };
        res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
        fs.createReadStream(filePath).pipe(res);
      } else {
        res.writeHead(404);
        res.end('Not Found');
      }
    });
    server.listen(port, '127.0.0.1', () => resolve(server));
  });
}

async function run() {
  const server = await startServer(4174);
  const browser = await chromium.launch({ headless: true });

  try {
    const context = await browser.newContext({ viewport: { width: 1672, height: 940 } });
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:4174/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const modulesSection = page.locator('#modules');
    const modulesShot = path.join(artifactDir, 'goliat_modules_cards_clean.png');
    await modulesSection.screenshot({ path: modulesShot });
    console.log('Saved modules cards screenshot:', modulesShot);

    const heroSection = page.locator('.hero');
    const heroShot = path.join(artifactDir, 'goliat_hero_clean.png');
    await heroSection.screenshot({ path: heroShot });
    console.log('Saved hero screenshot:', heroShot);

  } finally {
    await browser.close();
    server.close();
  }
}

run();
