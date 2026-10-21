import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';
import http from 'node:http';

const artifactDir = 'C:/Users/czark/.gemini/antigravity/brain/db144fde-c11f-407d-ac06-6b4bec418097';
const distDir = 'C:/Users/czark/.gemini/antigravity/brain/db144fde-c11f-407d-ac06-6b4bec418097/unpacked_zip/POKONAC_GOLIATA_PREMIUM_2026/dist';

// Start mini HTTP server to serve static files cleanly
function startServer(port = 4173) {
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
          '.png': 'image/png',
          '.json': 'application/json'
        };
        res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
        fs.createReadStream(filePath).pipe(res);
      } else {
        res.writeHead(404);
        res.end('Not Found');
      }
    });

    server.listen(port, '127.0.0.1', () => {
      console.log(`Server listening on http://127.0.0.1:${port}`);
      resolve(server);
    });
  });
}

async function run() {
  const server = await startServer(4173);
  const targetUrl = 'http://127.0.0.1:4173/';

  console.log('Launching browser with chromium...');
  const browser = await chromium.launch({ headless: true });

  try {
    // 1. Desktop 1672x940 (reference composition viewport)
    const contextDesktop = await browser.newContext({
      viewport: { width: 1672, height: 940 },
      deviceScaleFactor: 1
    });
    const page = await contextDesktop.newPage();
    await page.goto(targetUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    const desktopShot = path.join(artifactDir, 'goliat_desktop_1672.png');
    await page.screenshot({ path: desktopShot, fullPage: false });
    console.log('Saved 1672x940:', desktopShot);

    // 2. Full Page Desktop
    const fullDesktopShot = path.join(artifactDir, 'goliat_desktop_fullpage.png');
    await page.screenshot({ path: fullDesktopShot, fullPage: true });
    console.log('Saved Full Page:', fullDesktopShot);

    // 3. Open Module Modal (e.g. first module "Twoja Dolina Terebintu")
    const firstCard = page.locator('.module-card').first();
    await firstCard.waitFor({ state: 'visible', timeout: 5000 });
    await firstCard.click();
    await page.waitForTimeout(800);

    const modalShot = path.join(artifactDir, 'goliat_modal_lesson.png');
    await page.screenshot({ path: modalShot, fullPage: false });
    console.log('Saved Lesson Modal:', modalShot);

    // Close modal via Escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);

    // 4. Mobile 390x844 (iPhone 14)
    const contextMobile = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      isMobile: true
    });
    const pageMobile = await contextMobile.newPage();
    await pageMobile.goto(targetUrl, { waitUntil: 'networkidle' });
    await pageMobile.waitForTimeout(1500);

    const mobileHeroShot = path.join(artifactDir, 'goliat_mobile_hero.png');
    await pageMobile.screenshot({ path: mobileHeroShot, fullPage: false });
    console.log('Saved Mobile Hero:', mobileHeroShot);

    // Scroll to modules on mobile
    await pageMobile.locator('#modules').scrollIntoViewIfNeeded();
    await pageMobile.waitForTimeout(600);

    const mobileModulesShot = path.join(artifactDir, 'goliat_mobile_modules.png');
    await pageMobile.screenshot({ path: mobileModulesShot, fullPage: false });
    console.log('Saved Mobile Modules:', mobileModulesShot);

    // Open first lesson on mobile
    await pageMobile.locator('.module-card').first().click();
    await pageMobile.waitForTimeout(800);

    const mobileLessonShot = path.join(artifactDir, 'goliat_mobile_lesson.png');
    await pageMobile.screenshot({ path: mobileLessonShot, fullPage: false });
    console.log('Saved Mobile Lesson Modal:', mobileLessonShot);

  } finally {
    await browser.close();
    server.close();
    console.log('Browser and server closed successfully.');
  }
}

run().catch((err) => {
  console.error('Screenshot run error:', err);
  process.exit(1);
});
