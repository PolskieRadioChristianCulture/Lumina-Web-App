const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve('.');

(async () => {
  console.log('=== VERIFYING DEKALOG ARTICLES ON DEDICATED PORTALS (VIA HTTP SERVER) ===');

  const server = http.createServer((req, res) => {
    let p = decodeURI(req.url.split('?')[0]);
    if (p === '/prawo') p = '/prawo.html';
    if (p === '/apologetyka') p = '/apologetyka.html';
    if (p === '/biblioteka') p = '/biblioteka.html';
    if (p === '/news') p = '/news.html';
    const f = path.join(ROOT, p);
    if (fs.existsSync(f) && fs.statSync(f).isFile()) {
      const ext = path.extname(f);
      const m = {
        '.html': 'text/html; charset=utf-8',
        '.js': 'application/javascript; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.jpg': 'image/jpeg',
        '.png': 'image/png'
      };
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

  // 1. PRAWO
  console.log('1. Checking http://localhost:8996/prawo ...');
  await page.goto('http://localhost:8996/prawo', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  const pravoContent = await page.content();
  const hasPrawoDekalog = pravoContent.includes('Dziesięć przykazań') || pravoContent.includes('Jakuba Wujka');
  console.log('   ✓ /prawo has Dekalog BJW:', hasPrawoDekalog);

  // 2. APOLOGETYKA
  console.log('2. Checking http://localhost:8996/apologetyka ...');
  await page.goto('http://localhost:8996/apologetyka', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  const apoContent = await page.content();
  const hasApoDekalog = apoContent.includes('Dziesięć przykazań') || apoContent.includes('Jakuba Wujka');
  console.log('   ✓ /apologetyka has Dekalog BJW:', hasApoDekalog);

  // 3. BIBLIOTEKA
  console.log('3. Checking http://localhost:8996/biblioteka ...');
  await page.goto('http://localhost:8996/biblioteka', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  const bibContent = await page.content();
  const hasBibDekalog = bibContent.includes('Dziesięć przykazań') || bibContent.includes('Jakuba Wujka');
  console.log('   ✓ /biblioteka has Dekalog BJW:', hasBibDekalog);

  // 4. NEWS
  console.log('4. Checking http://localhost:8996/news ...');
  await page.goto('http://localhost:8996/news', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  const newsContent = await page.content();
  const hasNewsDekalog = newsContent.includes('Dziesięć przykazań') || newsContent.includes('Jakuba Wujka');
  console.log('   ✓ /news has Dekalog BJW:', hasNewsDekalog);

  await browser.close();
  server.close();

  if (!hasPrawoDekalog || !hasApoDekalog || !hasBibDekalog || !hasNewsDekalog) {
    console.error('ERROR: Some portals failed verification!');
    process.exit(1);
  }

  console.log('=== ALL 4 DEDICATED PORTALS VERIFIED 100% OK! ===');
})();
