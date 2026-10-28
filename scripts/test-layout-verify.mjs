import { chromium } from 'playwright';
import http from 'http';
import fs from 'fs';
import path from 'path';

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
  let reqPath = decodeURIComponent(req.url.split('?')[0]);
  if (reqPath === '/' || reqPath === '/Wioletta') reqPath = '/Wioletta.html';
  if (reqPath.endsWith('/')) reqPath += 'index.html';

  const fullPath = path.join('C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc', reqPath);
  if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
    const ext = path.extname(fullPath).toLowerCase();
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    fs.createReadStream(fullPath).pipe(res);
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

const PORT = 8094;
server.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  const browser = await chromium.launch({ headless: true });

  try {
    // 1. Mobile test
    const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
    await mobilePage.goto(`http://localhost:${PORT}/Wioletta`, { waitUntil: 'networkidle' });

    const heroScreen = await mobilePage.locator('.hero-screen-9-16').boundingBox();
    const discoverBtn = await mobilePage.locator('#btnDiscoverMore').boundingBox();
    const footer = await mobilePage.locator('.canvas-footer').boundingBox();

    console.log('Mobile - Hero screen boundingBox:', heroScreen);
    console.log('Mobile - Discover btn boundingBox:', discoverBtn);
    console.log('Mobile - Footer boundingBox:', footer);
    console.log('Mobile - Is footer below fold on first glance (y >= 844)?', footer.y >= 844);

    // Save initial screenshot
    await mobilePage.screenshot({
      path: 'C:/Users/czark/.gemini/antigravity/brain/d6fb6723-88d9-47dd-951a-c934e6675ed7/mobile_initial_view.png',
      fullPage: false
    });
    console.log('Saved mobile_initial_view.png');

    // Click discover more
    await mobilePage.locator('#btnDiscoverMore').click();
    await mobilePage.waitForTimeout(1000);
    const scrollYAfter = await mobilePage.evaluate(() => window.scrollY || document.documentElement.scrollTop);
    console.log('Mobile - ScrollY after clicking discover more:', scrollYAfter);

    await mobilePage.screenshot({
      path: 'C:/Users/czark/.gemini/antigravity/brain/d6fb6723-88d9-47dd-951a-c934e6675ed7/mobile_after_scroll.png',
      fullPage: false
    });
    console.log('Saved mobile_after_scroll.png');

    await mobilePage.close();

    // 2. Desktop test
    const desktopPage = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
    await desktopPage.goto(`http://localhost:${PORT}/Wioletta`, { waitUntil: 'networkidle' });

    const heroDesktop = await desktopPage.locator('.hero-canvas').boundingBox();
    const footerDesktop = await desktopPage.locator('.canvas-footer').boundingBox();

    console.log('Desktop - Hero canvas boundingBox:', heroDesktop);
    console.log('Desktop - Footer boundingBox:', footerDesktop);
    const isFooterInsideHero = (footerDesktop.y + footerDesktop.height) <= (heroDesktop.y + heroDesktop.height + 5);
    console.log('Desktop - Is footer inside hero canvas?', isFooterInsideHero);

    await desktopPage.screenshot({
      path: 'C:/Users/czark/.gemini/antigravity/brain/d6fb6723-88d9-47dd-951a-c934e6675ed7/desktop_view_final.png',
      fullPage: false
    });
    console.log('Saved desktop_view_final.png');

    await desktopPage.close();
  } catch (err) {
    console.error('Error during test:', err);
  } finally {
    await browser.close();
    server.close();
  }
});
