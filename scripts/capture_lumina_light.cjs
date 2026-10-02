const fs = require('fs');
const http = require('http');
const path = require('path');
const { chromium } = require('C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/node_modules/playwright');

const root = 'C:/Users/czark/Desktop/@ICC/LUMINA';
const artifactDir = 'C:/Users/czark/.gemini/antigravity/brain/16cbcd2a-11aa-4876-9bfa-0cd391b5ec41';

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/' || reqPath === '') reqPath = '/lumina-tablica-light.html';
  if (reqPath === '/tablica') reqPath = '/lumina-tablica.html';
  
  let filePath = path.join(root, reqPath);
  if (!fs.existsSync(filePath) && fs.existsSync(filePath + '.html')) {
    filePath += '.html';
  }
  
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    let mime = 'text/plain';
    if (ext === '.html') mime = 'text/html; charset=utf-8';
    else if (ext === '.js' || ext === '.mjs') mime = 'application/javascript; charset=utf-8';
    else if (ext === '.css') mime = 'text/css; charset=utf-8';
    else if (ext === '.json') mime = 'application/json; charset=utf-8';
    else if (ext === '.png') mime = 'image/png';
    else if (ext === '.jpg' || ext === '.jpeg') mime = 'image/jpeg';
    else if (ext === '.svg') mime = 'image/svg+xml';
    else if (ext === '.woff2') mime = 'font/woff2';
    
    res.writeHead(200, { 'Content-Type': mime });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404);
    res.end('Not found: ' + reqPath);
  }
});

server.listen(4299, async () => {
  console.log('Server started on port 4299');
  const browser = await chromium.launch({ headless: true });
  
  try {
    // 1. Desktop Capture
    const deskContext = await browser.newContext({
      viewport: { width: 1440, height: 1100 },
      deviceScaleFactor: 2
    });
    const deskPage = await deskContext.newPage();
    
    await deskPage.goto('http://localhost:4299/lumina-tablica-light.html', { waitUntil: 'domcontentloaded' });
    await deskPage.evaluate(() => {
      localStorage.setItem('cc_app_start_choice', 'true');
      localStorage.setItem('lumina_welcome_screen_hidden', 'true');
      const cb = document.getElementById('lumina-cookie-banner') || document.getElementById('cookieBanner') || document.querySelector('.cookie-banner');
      if (cb) cb.remove();
    });
    await deskPage.waitForTimeout(3000);

    const deskPath = path.join(artifactDir, 'lumina_tablica_light_desktop.png');
    await deskPage.screenshot({ path: deskPath, fullPage: false });
    console.log('Saved Desktop screenshot to:', deskPath);

    // Desktop Scroll (Feed & Posty)
    await deskPage.evaluate(() => window.scrollBy(0, 580));
    await deskPage.waitForTimeout(1000);
    const deskFeedPath = path.join(artifactDir, 'lumina_tablica_light_feed_desktop.png');
    await deskPage.screenshot({ path: deskFeedPath, fullPage: false });
    console.log('Saved Desktop Feed screenshot to:', deskFeedPath);

    // 2. Mobile Capture
    const mobileContext = await browser.newContext({
      viewport: { width: 430, height: 932 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true
    });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto('http://localhost:4299/lumina-tablica-light.html', { waitUntil: 'domcontentloaded' });
    await mobilePage.evaluate(() => {
      localStorage.setItem('cc_app_start_choice', 'true');
      localStorage.setItem('lumina_welcome_screen_hidden', 'true');
      const cb = document.getElementById('lumina-cookie-banner') || document.getElementById('cookieBanner') || document.querySelector('.cookie-banner');
      if (cb) cb.remove();
    });
    await mobilePage.waitForTimeout(3000);

    const mobilePath = path.join(artifactDir, 'lumina_tablica_light_mobile.png');
    await mobilePage.screenshot({ path: mobilePath, fullPage: false });
    console.log('Saved Mobile screenshot to:', mobilePath);

    // Mobile Scroll (Feed & Posty)
    await mobilePage.evaluate(() => window.scrollBy(0, 520));
    await mobilePage.waitForTimeout(1000);
    const mobileFeedPath = path.join(artifactDir, 'lumina_tablica_light_feed_mobile.png');
    await mobilePage.screenshot({ path: mobileFeedPath, fullPage: false });
    console.log('Saved Mobile Feed screenshot to:', mobileFeedPath);

  } catch (err) {
    console.error('Error taking screenshots:', err);
  } finally {
    await browser.close();
    server.close();
    console.log('Done.');
  }
});
