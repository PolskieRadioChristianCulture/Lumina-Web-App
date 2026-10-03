const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/node_modules/playwright');

const rootDir = path.resolve(__dirname, '..');

function createStaticServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const parsedUrl = new URL(req.url, 'http://127.0.0.1');
      let pathname = decodeURIComponent(parsedUrl.pathname);
      if (pathname === '/' || pathname === '') pathname = '/index.html';

      let filePath = path.join(rootDir, pathname.replace(/^\//, ''));
      if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, 'index.html');
      } else if (!fs.existsSync(filePath) && fs.existsSync(filePath + '.html')) {
        filePath = filePath + '.html';
      }

      fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('404 Not Found');
          return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentTypes = {
          '.html': 'text/html; charset=utf-8',
          '.js': 'application/javascript; charset=utf-8',
          '.mjs': 'application/javascript; charset=utf-8',
          '.css': 'text/css; charset=utf-8',
          '.json': 'application/json; charset=utf-8',
          '.png': 'image/png',
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.webp': 'image/webp',
          '.svg': 'image/svg+xml',
          '.ico': 'image/x-icon',
        };

        res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'application/octet-stream' });
        fs.createReadStream(filePath).pipe(res);
      });
    });

    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      console.log(`Serwer testowy HTTP uruchomiony na porcie ${port}`);
      resolve({ server, port });
    });
  });
}

async function runTests() {
  const { server, port } = await createStaticServer();
  const baseUrl = `http://127.0.0.1:${port}`;

  const pagesToTest = [
    { name: 'CCN News Home', path: '/news' },
    { name: 'CCN Nauka', path: '/nauka' },
    { name: 'CCN Biologia', path: '/biologia' },
    { name: 'CCN Historia', path: '/historia' },
    { name: 'CCN Prawo', path: '/prawo' },
    { name: 'CCN Seks', path: '/seks' },
    { name: 'CCN Biznes', path: '/biznes' },
    { name: 'CCN Kultura', path: '/kultura' },
    { name: 'CCN Kuchnia', path: '/kuchnia' },
    { name: 'CCN Ogłoszenia', path: '/ogloszenia' },
    { name: 'CCN Współpraca', path: '/wspolpraca' },
    { name: 'CCN ZIU', path: '/ziu' },
    { name: 'Master Live Ticker', path: '/master-live.html' }
  ];

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });

  console.log('\n=== ROZPOCZYNAM TESTY KLIKALNOŚCI LOGO CCN NEWS NA KAŻDEJ STRONIE ===\n');

  let passedCount = 0;

  for (const item of pagesToTest) {
    const page = await context.newPage();
    const url = `${baseUrl}${item.path}`;
    console.log(`[TEST] Testuję stronę: ${item.name} (${item.path}) ...`);

    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(1000);

      // Szukamy logo CCN
      const logoEl = page.locator('img[src*="ccn-logo"], img[src*="ccn_news"], .ccn-ticker-brand img').first();
      const count = await logoEl.count();

      if (count === 0) {
        throw new Error(`Nie znaleziono obrazka logo CCN na ${item.path}`);
      }

      const imgSrc = await logoEl.getAttribute('src');
      console.log(`   Znaleziono logo: ${imgSrc}`);

      // Sprawdzamy rodzica lub klikamy w logo
      const parentA = page.locator('a:has(img[src*="ccn-logo"]), a:has(img[src*="ccn_news"]), a.ccn-ticker-brand').first();
      const parentCount = await parentA.count();
      if (parentCount > 0) {
        const href = await parentA.getAttribute('href');
        console.log(`   Href linku logo: ${href}`);
      }

      // Klikamy bezpośrednio w logo
      if (item.path !== '/news') {
        await Promise.all([
          page.waitForURL((u) => u.pathname === '/news' || u.pathname.includes('/news'), { timeout: 10000 }),
          logoEl.click()
        ]);
        console.log(`   ✓ SUKCES! Kliknięcie w logo przekierowało na: ${page.url()}`);
      } else {
        // Na samej stronie /news sprawdzamy czy kliknięcie nie powoduje błędu i link jest poprawny
        await logoEl.click();
        await page.waitForTimeout(500);
        console.log(`   ✓ SUKCES! Logo na stronie /news jest w pełni klikalne i aktywne.`);
      }

      passedCount++;
    } catch (err) {
      console.error(`   ✗ BŁĄD na stronie ${item.name}: ${err.message}`);
    } finally {
      await page.close();
    }
  }

  await browser.close();
  server.close();

  console.log(`\n======================================================`);
  console.log(`WYNIK TESTÓW: ${passedCount} / ${pagesToTest.length} stron przeszło test pomyślnie!`);
  console.log(`======================================================\n`);

  if (passedCount !== pagesToTest.length) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Błąd krytyczny testu:', err);
  process.exit(1);
});
