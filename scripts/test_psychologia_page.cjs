const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve('.');

(async () => {
  const server = http.createServer((req, res) => {
    let p = decodeURI(req.url.split('?')[0]);
    if (p === '/' || p === '/psychologia') p = '/psychologia.html';
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

  await new Promise(r => server.listen(8997, r));
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto('http://localhost:8997/psychologia', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  const html = await page.content();
  const hasArticle = html.includes('PSYCHOLOGIA STRACHU') || html.includes('makabrą');
  console.log('✓ Psychologia page contains Halloween / Neurobiologia strachu article:', hasArticle);

  const heroHeading = await page.$eval('h1', el => el.textContent.trim()).catch(() => null);
  console.log('✓ Psychologia page Hero heading:', heroHeading);

  await browser.close();
  server.close();
  if (!hasArticle) throw new Error('Psychologia article not rendered on /psychologia');
  console.log('✓ PSYCHOLOGIA PAGE TEST PASS!');
})();
