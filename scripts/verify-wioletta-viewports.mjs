import { chromium } from 'playwright';
import http from 'http';
import fs from 'fs';
import path from 'path';

// Simple static HTTP server for polskieradio.cc root
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
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
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

const PORT = 8089;
server.listen(PORT, async () => {
  console.log(`Server listening on port ${PORT}`);
  const browser = await chromium.launch({ headless: true });

  const viewports = [
    { name: 'mobile_320', width: 320, height: 640 },
    { name: 'mobile_360', width: 360, height: 740 },
    { name: 'mobile_390', width: 390, height: 844 },
    { name: 'mobile_430', width: 430, height: 932 },
    { name: 'tablet_768', width: 768, height: 1024 },
    { name: 'desktop_1024', width: 1024, height: 768 },
    { name: 'desktop_1440', width: 1440, height: 900 }
  ];

  const brainDir = 'C:/Users/czark/.gemini/antigravity/brain/d6fb6723-88d9-47dd-951a-c934e6675ed7';

  for (const vp of viewports) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 2
    });
    const page = await context.newPage();
    await page.goto(`http://localhost:${PORT}/Wioletta`, { waitUntil: 'networkidle' });

    // Check for horizontal scroll
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    const hasHorizontalOverflow = scrollWidth > clientWidth;

    console.log(`[Viewport ${vp.name}] width: ${vp.width}, scrollWidth: ${scrollWidth}, clientWidth: ${clientWidth}, overflow: ${hasHorizontalOverflow}`);

    const shotPath = path.join(brainDir, `wioletta_${vp.name}.png`);
    await page.screenshot({ path: shotPath, fullPage: false });
    console.log(`Saved screenshot: ${shotPath}`);

    await context.close();
  }

  await browser.close();
  server.close();
  console.log('All viewport checks finished!');
});
