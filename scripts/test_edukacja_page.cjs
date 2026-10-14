const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve('.');

(async () => {
  const server = http.createServer((req, res) => {
    let p = decodeURI(req.url.split('?')[0]);
    if (p === '/' || p === '/edukacja') p = '/edukacja.html';
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

  await new Promise(r => server.listen(8998, r));
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto('http://localhost:8998/edukacja', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  const html = await page.content();
  const hasDzieci = html.includes('JAK ROZMAWIAĆ Z DZIEĆMI O HALLOWEEN');
  const hasRodzina = html.includes('CHRZEŚCIJAŃSKI DOM JAKO TWIERDZA POKOJU');
  const hasWychowanie = html.includes('WYCHOWANIE W ERZE POPKULTUROWEJ PRESI') || html.includes('WYCHOWANIE W ERZE POPKULTUROWEJ PRESJI');

  console.log('✓ Edukacja page contains Dzieci Halloween article:', hasDzieci);
  console.log('✓ Edukacja page contains Rodzina Twierdza Pokoju article:', hasRodzina);
  console.log('✓ Edukacja page contains Wychowanie Nastolatki article:', hasWychowanie);

  const heroHeading = await page.$eval('h1', el => el.textContent.trim()).catch(() => null);
  console.log('✓ Edukacja page Hero heading:', heroHeading);

  await browser.close();
  server.close();
  if (!hasDzieci) throw new Error('Dzieci article not rendered on /edukacja');
  console.log('✓ EDUKACJA PAGE TEST PASS!');
})();
