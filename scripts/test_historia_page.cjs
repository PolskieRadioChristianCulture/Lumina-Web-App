const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve('.');

(async () => {
  const server = http.createServer((req, res) => {
    let p = decodeURI(req.url.split('?')[0]);
    if (p === '/' || p === '/historia') p = '/historia.html';
    const f = path.join(ROOT, p);
    if (fs.existsSync(f) && fs.statSync(f).isFile()) {
      const ext = path.extname(f);
      const m = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.jpg': 'image/jpeg', '.png': 'image/png' };
      res.writeHead(200, { 'Content-Type': m[ext] || 'application/octet-stream' });
      fs.createReadStream(f).pipe(res);
    } else {
      res.writeHead(404);
      res.end();
    }
  });

  await new Promise(r => server.listen(8996, r));
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto('http://localhost:8996/historia', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  const html = await page.content();
  const hasSamhain = html.includes('Samhain');
  console.log('✓ Historia page contains Samhain / Halloween article:', hasSamhain);

  const heroHeading = await page.$eval('h1', el => el.textContent.trim()).catch(() => null);
  console.log('✓ Historia page Hero heading:', heroHeading);

  await browser.close();
  server.close();
  if (!hasSamhain) throw new Error('Samhain article not rendered on /historia');
  console.log('✓ HISTORIA PAGE TEST PASS!');
})();
