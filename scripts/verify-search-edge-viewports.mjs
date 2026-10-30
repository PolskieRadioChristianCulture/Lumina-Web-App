import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const ROOT = process.cwd();
const ARTIFACT_DIR = 'C:/Users/czark/.gemini/antigravity/brain/d6fb6723-88d9-47dd-951a-c934e6675ed7';

function createStaticServer() {
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.mjs': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
  };

  return http.createServer((req, res) => {
    try {
      const url = new URL(req.url, 'http://127.0.0.1');
      let pathname = decodeURIComponent(url.pathname);
      if (pathname === '/') pathname = '/index.html';
      else if (pathname === '/wyszukiwarka' || pathname === '/wyszukiwarka/') pathname = '/wyszukiwarka.html';
      else if (pathname === '/akademia' || pathname === '/akademia/') pathname = '/akademia.html';
      else if (pathname === '/mojabiblia' || pathname === '/mojabiblia/') pathname = '/mojabiblia.html';
      else if (pathname === '/vod' || pathname === '/vod/') pathname = '/vod.html';

      let filePath = path.join(ROOT, pathname);
      if (!fs.existsSync(filePath) && fs.existsSync(filePath + '.html')) {
        filePath += '.html';
      }

      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Not Found');
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = mimeTypes[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(fs.readFileSync(filePath));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(String(err));
    }
  });
}

async function run() {
  const server = createStaticServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  const browser = await chromium.launch({ headless: true });
  const viewports = [
    { name: 'mobile_320', width: 320, height: 600 },
    { name: 'mobile_360', width: 360, height: 740 },
    { name: 'mobile_390', width: 390, height: 844 },
    { name: 'mobile_430', width: 430, height: 932 },
    { name: 'tablet_768', width: 768, height: 1024 },
    { name: 'desktop_1440', width: 1440, height: 900 },
  ];

  try {
    for (const vp of viewports) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        locale: 'pl-PL'
      });
      const page = await context.newPage();
      await page.goto(`${baseUrl}/wyszukiwarka`, { waitUntil: 'domcontentloaded' });

      // Check PLAY button (#ccOmniRadio) and + button (#ccOmniEdgeBtn)
      const radio = page.locator('#ccOmniRadio');
      const edgeBtn = page.locator('#ccOmniEdgeBtn');

      await radio.waitFor({ state: 'visible', timeout: 5000 });
      await edgeBtn.waitFor({ state: 'visible', timeout: 5000 });

      const radioBox = await radio.boundingBox();
      const edgeBox = await edgeBtn.boundingBox();

      console.log(`[${vp.name}] PLAY: ${radioBox.width}x${radioBox.height} at (${radioBox.x.toFixed(1)}, ${radioBox.y.toFixed(1)})`);
      console.log(`[${vp.name}] + BTN: ${edgeBox.width}x${edgeBox.height} at (${edgeBox.x.toFixed(1)}, ${edgeBox.y.toFixed(1)})`);

      // Verify touch targets >= 44x44
      assert.ok(radioBox.width >= 44 && radioBox.height >= 44, `PLAY button must be >= 44x44px in ${vp.name}`);
      assert.ok(edgeBox.width >= 44 && edgeBox.height >= 44, `+ button must be >= 44x44px in ${vp.name}`);

      // Verify adjacency: edgeBtn should be placed immediately next to radioBtn horizontally
      const diffX = edgeBox.x - (radioBox.x + radioBox.width);
      console.log(`[${vp.name}] Horizontal distance between PLAY and +: ${diffX.toFixed(1)}px`);
      assert.ok(diffX >= 0 && diffX <= 20, `+ button must be adjacent to PLAY button (diffX: ${diffX}px) in ${vp.name}`);

      // Verify no horizontal overflow of the window
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      assert.ok(scrollWidth <= vp.width, `No horizontal overflow in ${vp.name} (scrollWidth: ${scrollWidth}, viewport: ${vp.width})`);

      // Take closed topbar screenshot
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, `search_edge_${vp.name}_closed.png`),
        clip: { x: 0, y: 0, width: vp.width, height: Math.min(vp.height, 400) }
      });

      // Click + button to open edge panel
      await edgeBtn.click();
      const dialog = page.locator('dialog.cc-mobile-edge');
      await dialog.waitFor({ state: 'visible', timeout: 5000 });

      // Verify dialog profile and styling
      const profile = await dialog.getAttribute('data-profile');
      assert.equal(profile, 'search', `Dialog profile must be 'search' in ${vp.name}`);

      // Take open edge panel screenshot
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, `search_edge_${vp.name}_open.png`),
        fullPage: false
      });

      // Close dialog
      const closeBtn = dialog.locator('button[data-edge-key="close"]');
      await closeBtn.click();
      await dialog.waitFor({ state: 'hidden', timeout: 5000 });

      await context.close();
    }
    console.log('ALL VIEWPORT TESTS AND SCREENSHOTS COMPLETED SUCCESSFULLY!');
  } finally {
    await browser.close();
    server.close();
  }
}

run().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
