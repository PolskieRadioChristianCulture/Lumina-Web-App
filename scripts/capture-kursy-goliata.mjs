import { chromium } from 'playwright';
import http from 'http';
import fs from 'fs';
import path from 'path';

const root = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc';

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/' || reqPath === '/kursy') {
    reqPath = '/kursy.html';
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

server.listen(3459, async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  await page.goto('http://localhost:3459/kursy#goliata', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // Take screenshot
  await page.screenshot({
    path: 'C:/Users/czark/.gemini/antigravity/brain/db144fde-c11f-407d-ac06-6b4bec418097/kursy_goliata_current.png'
  });

  await browser.close();
  server.close();
  console.log('Screenshot of kursy#goliata captured successfully!');
});
