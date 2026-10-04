const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const LUMINA_ROOT = path.resolve('C:/Users/czark/Desktop/@ICC/LUMINA');

(async () => {
  const server = http.createServer((req, res) => {
    let p = decodeURI(req.url.split('?')[0]);
    if (p === '/') p = '/news.html';
    const f = path.join(LUMINA_ROOT, p);
    if (fs.existsSync(f) && fs.statSync(f).isFile()) {
      const ext = path.extname(f);
      const m = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css' };
      res.writeHead(200, { 'Content-Type': m[ext] || 'application/octet-stream' });
      fs.createReadStream(f).pipe(res);
    } else {
      res.writeHead(404);
      res.end();
    }
  });

  await new Promise(r => server.listen(8991, r));
  console.log('Server running on 8991');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  for (const slug of ['art-z-biblia-za-pan-brat-dzien-03', 'news-sds-odc-26-sad-dobra-nowina-20261002']) {
    const testUrl = `http://localhost:8991/news.html?art=${slug}`;
    console.log('Navigating to:', testUrl);
    await page.goto(testUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const closeBtn = await page.$('button[aria-label="Zamknij artykuł"]');
    console.log(`✓ Article modal opened via ?art=${slug}:`, closeBtn !== null);

    const title = await page.$eval('h1', el => el.textContent).catch(() => '');
    console.log(`✓ Modal Article Title for ${slug}:`, title);
    if (!closeBtn) throw new Error(`Modal failed to open for ${slug}`);
  }

  await browser.close();
  server.close();
  console.log('✓ TEST PASS');
})().catch(err => {
  console.error(err);
  process.exit(1);
});
