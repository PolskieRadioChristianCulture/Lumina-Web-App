import http from 'http';
import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';

const PORT = 8097;
const ROOT = path.resolve('C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc');

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/Global' || reqPath === '/Global/') {
    reqPath = '/Global/index.html';
  }
  const filePath = path.join(ROOT, reqPath.replace(/^\//, ''));
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath);
    const mimeMap = {
      '.html': 'text/html; charset=utf-8',
      '.js': 'application/javascript; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.webp': 'image/webp',
      '.jpg': 'image/jpeg',
      '.png': 'image/png'
    };
    res.writeHead(200, { 'Content-Type': mimeMap[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404);
    res.end('Not found: ' + reqPath);
  }
});

server.listen(PORT, async () => {
  console.log(`Server listening on ${PORT}`);
  const browser = await chromium.launch();

  for (const vp of [
    { name: 'mobile_390', width: 390, height: 844 },
    { name: 'desktop_1440', width: 1440, height: 900 }
  ]) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    await page.goto(`http://localhost:${PORT}/Global/`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);

    const jj = await page.$('#artist-jj-beauvais');
    if (jj) {
      await jj.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      const imgInfo = await page.evaluate(() => {
        const imgCol = document.querySelector('#artist-jj-beauvais .artist-img-col');
        const img = document.querySelector('#artist-jj-beauvais .artist-avatar');
        return {
          colWidth: imgCol ? imgCol.clientWidth : null,
          colHeight: imgCol ? imgCol.clientHeight : null,
          aspectRatio: imgCol ? window.getComputedStyle(imgCol).aspectRatio : null,
          imgNaturalWidth: img ? img.naturalWidth : null,
          imgNaturalHeight: img ? img.naturalHeight : null
        };
      });
      console.log(`[${vp.name}] JJ Card Info:`, imgInfo);
      await page.screenshot({ path: `C:/Users/czark/.gemini/antigravity/brain/d6fb6723-88d9-47dd-951a-c934e6675ed7/jj_beauvais_fixed_${vp.name}.png` });
      console.log(`Saved jj_beauvais_fixed_${vp.name}.png`);
    }
    await page.close();
  }

  await browser.close();
  server.close();
  process.exit(0);
});
