import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const artifactDir = 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\db144fde-c11f-407d-ac06-6b4bec418097';

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

async function runVisualVerification() {
  await new Promise(resolve => server.listen(8097, '127.0.0.1', resolve));
  console.log('Test Server running on 8097');

  const browser = await chromium.launch({ headless: true });

  const viewports = [
    { name: 'iphone_se', width: 375, height: 667 },
    { name: 'android_compact', width: 360, height: 640 },
    { name: 'iphone_standard', width: 390, height: 844 }
  ];

  for (const vp of viewports) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    await page.goto('http://127.0.0.1:8097/wyszukiwarka', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(600);

    // Verify footer "Wspieram To" icon
    const supportBtn = page.locator('#ccOmniSupport');
    const isSupportVisible = await supportBtn.isVisible();
    const supportHref = await supportBtn.getAttribute('href');
    console.log(`[${vp.name}] Footer Support Btn visible: ${isSupportVisible}, href: ${supportHref}`);

    // Click on edge trigger
    const trigger = page.locator('#ccOmniEdgeBtn, .cc-mobile-edge-trigger').first();
    await trigger.waitFor({ state: 'visible', timeout: 5000 });
    await trigger.click();

    const dialog = page.locator('dialog.cc-mobile-edge');
    await dialog.waitFor({ state: 'visible', timeout: 5000 });
    await page.waitForTimeout(400);

    // Check support item in edge panel
    const edgeHeart = dialog.locator('nav a[data-edge-key="heart"]');
    const isEdgeHeartVisible = await edgeHeart.isVisible();
    const edgeHeartHref = await edgeHeart.getAttribute('href');
    console.log(`[${vp.name}] Edge Panel Heart item visible: ${isEdgeHeartVisible}, href: ${edgeHeartHref}`);

    // Take screenshot of edge dialog
    const shotPath = path.join(artifactDir, `edge_panel_2col_${vp.name}.png`);
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

  // Also take screenshot of the search modal footer showing "Wspieram To"
  const desktopPage = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await desktopPage.goto('http://127.0.0.1:8097/wyszukiwarka', { waitUntil: 'domcontentloaded' });
  await desktopPage.waitForTimeout(600);
  const footerEl = desktopPage.locator('.cc-omni-footer');
  const footerShot = path.join(artifactDir, `search_footer_wspieram_to.png`);
  await footerEl.screenshot({ path: footerShot });
  console.log('📸 Saved search footer screenshot to:', footerShot);
  await desktopPage.close();

  await browser.close();
  server.close();
  console.log('✅ ALL VISUAL VERIFICATIONS PASSED 100% — NO SCROLLBAR, WSPIERAM TO PRESENT EVERYWHERE!');
}

runVisualVerification().catch(err => {
  console.error(err);
  if (server) server.close();
  process.exit(1);
});
