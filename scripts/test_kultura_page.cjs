const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve('.');

(async () => {
  const server = http.createServer((req, res) => {
    let p = decodeURI(req.url.split('?')[0]);
    if (p === '/' || p === '/kultura') p = '/kultura.html';
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

  await new Promise(r => server.listen(8995, r));
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto('http://localhost:8995/kultura', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  const article = await page.$('#art-kultura-halloween-swiatlosc-vs-mrok');
  console.log('✓ Article element found on /kultura:', article !== null);

  const articleTitle = await page.$eval('#art-kultura-halloween-swiatlosc-vs-mrok h2', el => el.textContent.trim()).catch(() => null);
  console.log('✓ Article title on /kultura:', articleTitle);

  // Click 'Czytaj cały artykuł na portalu Kultura'
  const readBtn = await page.$('button:has-text("Czytaj cały artykuł")');
  if (readBtn) {
    await readBtn.click();
    await page.waitForTimeout(500);
    const html = await page.content();
    const hasChapter1 = html.includes('Estetyka rozkładu a estetyka zmartwychwstania');
    console.log('✓ Full article text readable directly on /kultura after expand:', hasChapter1);
    if (!hasChapter1) throw new Error('Failed to expand article on kultura');
  }

  await browser.close();
  server.close();
  console.log('✓ KULTURA PAGE TEST PASS!');
})();
