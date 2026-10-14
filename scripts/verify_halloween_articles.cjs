const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve('.');

const articles = [
  'art-ccn-halloween-deklaracja-christian-culture',
  'art-kultura-halloween-swiatlosc-vs-mrok',
  'art-historia-halloween-od-samhain-do-popkultury',
  'art-psychologia-halloween-neurobiologia-strachu',
  'art-dzieci-halloween-jak-rozmawiac-alternatywa',
  'art-rodzina-chrzescijanski-dom-twierdza-pokoju',
  'art-wychowanie-nastolatki-odwaga-wiary-presja'
];

(async () => {
  const server = http.createServer((req, res) => {
    let p = decodeURI(req.url.split('?')[0]);
    if (p === '/') p = '/news.html';
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

  await new Promise(r => server.listen(8994, r));
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  let allSuccess = true;
  for (const artId of articles) {
    await page.goto('http://localhost:8994/news.html?art=' + artId, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    const modalHeading = await page.$eval('.fixed.inset-0 h1', el => el.textContent.trim()).catch(() => null);
    if (modalHeading) {
      console.log(`[PASS] ${artId} -> "${modalHeading.substring(0, 45)}..."`);
    } else {
      console.log(`[FAIL] ${artId} did not open in modal!`);
      allSuccess = false;
    }
  }

  await browser.close();
  server.close();

  if (!allSuccess) {
    process.exit(1);
  }
})();
