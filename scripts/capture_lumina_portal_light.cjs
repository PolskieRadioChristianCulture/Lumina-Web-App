const fs = require('fs');
const http = require('http');
const path = require('path');
const { chromium } = require('C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/node_modules/playwright');

const root = 'C:/Users/czark/Desktop/@ICC/LUMINA';
const artifactDir = 'C:/Users/czark/.gemini/antigravity/brain/16cbcd2a-11aa-4876-9bfa-0cd391b5ec41';

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/' || reqPath === '') reqPath = '/lumina.html';
  if (reqPath === '/lumina') reqPath = '/lumina.html';
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

server.listen(4320, async () => {
  console.log('Server started on port 4320');
  const browser = await chromium.launch({ headless: true });
  
  async function capturePage(url, viewport, isMobile, saveName) {
    const context = await browser.newContext({
      viewport,
      deviceScaleFactor: 2,
      isMobile,
      hasTouch: isMobile
    });
    const page = await context.newPage();
    
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.evaluate(() => {
        try {
          localStorage.setItem('cc_app_start_choice', 'true');
          localStorage.setItem('lumina_welcome_screen_hidden', 'true');
          localStorage.setItem('lumina_theme', 'light');
          if (window.speechSynthesis) window.speechSynthesis.cancel();
        } catch(e) {}
        
        // Remove popups and banners that obstruct view
        const cb = document.getElementById('lumina-cookie-banner') || document.getElementById('cookieBanner') || document.querySelector('.cookie-banner');
        if (cb) cb.remove();

        // Pause/remove background media & iframes to prevent hanging
        document.querySelectorAll('audio, video, iframe').forEach(el => {
          try { el.remove(); } catch(e){}
        });
      });
      await page.waitForTimeout(1500);

      const targetPath = path.join(artifactDir, saveName);
      await page.screenshot({ path: targetPath, animations: 'disabled', timeout: 8000 });
      console.log(`[CAPTURED] ${saveName}`);
    } catch(err) {
      console.error(`[ERROR] capturing ${saveName}:`, err.message);
    } finally {
      await context.close();
    }
  }

  try {
    // 1. Portal Home Desktop
    await capturePage('http://localhost:4320/lumina.html?theme=light', { width: 1440, height: 1100 }, false, 'lumina_portal_home_light_desktop.png');

    // 2. Profil Założyciela Cezarego Desktop
    await capturePage('http://localhost:4320/lumina.cezaryrgowski.html?theme=light', { width: 1440, height: 1100 }, false, 'lumina_profile_cezary_light_desktop.png');

    // 3. Portal Home Mobile
    await capturePage('http://localhost:4320/lumina.html?theme=light', { width: 412, height: 915 }, true, 'lumina_portal_home_light_mobile.png');

    // 4. Profil Cezarego Mobile
    await capturePage('http://localhost:4320/lumina.cezaryrgowski.html?theme=light', { width: 412, height: 915 }, true, 'lumina_profile_cezary_light_mobile.png');

    console.log('ALL CAPTURES COMPLETED.');
  } finally {
    await browser.close();
    server.close();
  }
});
