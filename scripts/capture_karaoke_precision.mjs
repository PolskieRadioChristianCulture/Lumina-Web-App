import http from 'http';
import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';

const ROOT = process.cwd();
const artifactsDir = 'C:/Users/czark/.gemini/antigravity/brain/36f7b59d-1af3-45fb-be88-c886d847d219';

function createServer() {
  return http.createServer((req, res) => {
    let reqPath = req.url.split('?')[0];
    if (reqPath === '/' || reqPath === '/BiblijneUwielbienie') {
      reqPath = '/biblijne-uwielbienie.html';
    }
    const filePath = path.join(ROOT, reqPath.replace(/^\//, ''));
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath);
      const mime = {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.mjs': 'application/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.svg': 'image/svg+xml'
      }[ext] || 'text/plain';
      res.writeHead(200, { 'Content-Type': mime });
      fs.createReadStream(filePath).pipe(res);
    } else {
      res.writeHead(404);
      res.end('Not found');
    }
  });
}

async function run() {
  const server = createServer();
  await new Promise(resolve => server.listen(4893, resolve));
  console.log('Test server listening on port 4893');

  const browser = await chromium.launch({ headless: true });

  try {
    // 1. Desktop
    const deskContext = await browser.newContext({
      viewport: { width: 1440, height: 900 }
    });
    const deskPage = await deskContext.newPage();
    await deskPage.goto('http://localhost:4893/BiblijneUwielbienie', { waitUntil: 'domcontentloaded' });
    await deskPage.waitForTimeout(2000);

    await deskPage.evaluate(() => {
      const stage = document.getElementById('hero-karaoke-stage');
      if (stage) stage.scrollIntoView({ behavior: 'instant', block: 'center' });
      // Simulate line 2 active in DOM and state
      const lines = document.querySelectorAll('.bu-line');
      if (lines.length > 1) {
        lines.forEach((l, i) => {
          l.classList.toggle('active', i === 1);
          l.classList.toggle('prev', i === 0);
          l.classList.toggle('next', i === 2);
        });
        const words = lines[1].querySelectorAll('.bu-word');
        if (words.length > 2) {
          words[0].classList.add('is-sung');
          words[1].classList.add('is-singing');
        }
        // Center line 1 using the new focal anchor
        const vp = document.getElementById('hero-karaoke-viewport');
        if (vp && window.CC_BU_FEATURES) {
          const lineTop = lines[1].offsetTop;
          const focalAnchor = Math.round(vp.clientHeight * 0.40);
          vp.scrollTop = Math.max(0, lineTop - focalAnchor);
        }
      }
    });
    await deskPage.waitForTimeout(400);

    await deskPage.screenshot({
      path: path.join(artifactsDir, 'karaoke_precision_desktop.png'),
      fullPage: false
    });
    console.log('Saved karaoke_precision_desktop.png');

    // 2. Mobile
    const mobContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15'
    });
    const mobPage = await mobContext.newPage();
    await mobPage.goto('http://localhost:4893/BiblijneUwielbienie', { waitUntil: 'domcontentloaded' });
    await mobPage.waitForTimeout(2000);

    await mobPage.evaluate(() => {
      const stage = document.getElementById('hero-karaoke-stage');
      if (stage) stage.scrollIntoView({ behavior: 'instant', block: 'center' });
      const lines = document.querySelectorAll('.bu-line');
      if (lines.length > 1) {
        lines.forEach((l, i) => {
          l.classList.toggle('active', i === 1);
          l.classList.toggle('prev', i === 0);
          l.classList.toggle('next', i === 2);
        });
        const words = lines[1].querySelectorAll('.bu-word');
        if (words.length > 2) {
          words[0].classList.add('is-sung');
          words[1].classList.add('is-singing');
        }
        const vp = document.getElementById('hero-karaoke-viewport');
        if (vp) {
          const lineTop = lines[1].offsetTop;
          const focalAnchor = Math.round(vp.clientHeight * 0.38);
          vp.scrollTop = Math.max(0, lineTop - focalAnchor);
        }
      }
    });
    await mobPage.waitForTimeout(400);

    await mobPage.screenshot({
      path: path.join(artifactsDir, 'karaoke_precision_mobile.png'),
      fullPage: false
    });
    console.log('Saved karaoke_precision_mobile.png');

  } finally {
    await browser.close();
    server.close();
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
