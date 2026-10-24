import { chromium } from 'playwright';
import http from 'http';
import fs from 'fs';
import path from 'path';

const root = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc';

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/' || reqPath === '/kursy/pokonac-goliata') {
    reqPath = '/kursy/pokonac-goliata.html';
  }
  const filePath = path.join(root, reqPath);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath);
    const contentTypes = {
      '.html': 'text/html; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.js': 'application/javascript; charset=utf-8',
      '.jpg': 'image/jpeg',
      '.webp': 'image/webp',
      '.png': 'image/png'
    };
    res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(3457, async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
  
  await page.goto('http://localhost:3457/kursy/pokonac-goliata', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Scroll to modules grid and take element screenshot
  const grid = await page.$('.module-grid');
  if (grid) {
    await grid.screenshot({
      path: 'C:/Users/czark/.gemini/antigravity/brain/db144fde-c11f-407d-ac06-6b4bec418097/goliat_modules_lifted.png'
    });
  }

  await browser.close();
  server.close();
  console.log('Cards screenshot captured!');
});
