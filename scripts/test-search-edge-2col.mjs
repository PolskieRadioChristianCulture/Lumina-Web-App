import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const artifactDir = 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\d6fb6723-88d9-47dd-951a-c934e6675ed7';

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
  let reqPath = decodeURIComponent(req.url.split('?')[0]);
  if (reqPath === '/wyszukiwarka' || reqPath === '/wyszukiwarka/') {
    reqPath = '/wyszukiwarka/index.html';
  } else if (reqPath.endsWith('/')) {
    reqPath += 'index.html';
  }
  const filePath = path.join(projectRoot, reqPath);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

async function runTest() {
  await new Promise(resolve => server.listen(8094, '127.0.0.1', resolve));
  console.log('Server running on 8094');

  const browser = await chromium.launch({ headless: true });
  const viewports = [
    { name: 'iphone_se', width: 375, height: 667 },
    { name: 'android_compact', width: 360, height: 640 },
    { name: 'iphone_standard', width: 390, height: 844 }
  ];

  for (const vp of viewports) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    await page.goto('http://127.0.0.1:8094/wyszukiwarka', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);

    // Click on edge trigger
    const trigger = page.locator('#ccOmniEdgeBtn, .cc-mobile-edge-trigger').first();
    await trigger.waitFor({ state: 'visible', timeout: 5000 });
    await trigger.click();

    const dialog = page.locator('dialog.cc-mobile-edge');
    await dialog.waitFor({ state: 'visible', timeout: 5000 });
    await page.waitForTimeout(400);

    // Take screenshot of edge dialog
    const shotPath = path.join(artifactDir, `wyszukiwarka_edge_panel_2col_${vp.name}.png`);
    await dialog.screenshot({ path: shotPath });
    console.log(`📸 Saved [${vp.name}] screenshot to:`, shotPath);

    // Check scrollbar presence and total height
    const scrollInfo = await dialog.evaluate(el => {
      const nav = el.querySelector('nav');
      return {
        dialogHeight: el.clientHeight,
        dialogScrollHeight: el.scrollHeight,
        navHeight: nav ? nav.getBoundingClientRect().height : 0,
        hasVerticalScroll: el.scrollHeight > el.clientHeight,
        dialogWidth: el.clientWidth
      };
    });
    console.log(`[${vp.name}] Info:`, scrollInfo);

    if (scrollInfo.hasVerticalScroll) {
      throw new Error(`[${vp.name}] Unexpected vertical scrollbar! scrollHeight=${scrollInfo.dialogScrollHeight}, clientHeight=${scrollInfo.dialogHeight}`);
    }

    await page.close();
  }
  server.close();
}

runTest().catch(err => {
  console.error(err);
  if (server) server.close();
  process.exit(1);
});
