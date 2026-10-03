const { chromium } = require('C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/node_modules/playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8130;
const LUMINA_ROOT = 'C:/Users/czark/Desktop/@ICC/LUMINA';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
};

const server = http.createServer((req, res) => {
  let cleanUrl = req.url.split('?')[0];
  if (cleanUrl.startsWith('/')) cleanUrl = cleanUrl.substring(1);
  if (!cleanUrl) cleanUrl = 'index.html';
  let filePath = path.join(LUMINA_ROOT, cleanUrl);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  } else if (!fs.existsSync(filePath) && fs.existsSync(filePath + '.html')) {
    filePath = filePath + '.html';
  }
  if (!fs.existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found: ' + cleanUrl);
    return;
  }
  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, async () => {
  console.log(`Test server running at http://localhost:${PORT}`);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  
  const pages = [
    'news',
    'nauka',
    'seks',
    'historia',
    'biologia',
    'prawo',
    'biznes',
    'kultura',
    'kuchnia',
    'ogloszenia',
    'wspolpraca',
    'ziu'
  ];

  const results = [];

  for (const p of pages) {
    const page = await context.newPage();
    await page.goto(`http://localhost:${PORT}/${p}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);

    // Check ticker presence
    const track = await page.$('.ccn-ticker-track');
    let hasTrack = !!track;
    let itemsCount = 0;
    let badgeText = '';
    let isAnimated = false;

    if (track) {
      itemsCount = await page.$$eval('.ccn-ticker-track > span', els => els.length);
      badgeText = await page.$eval('div:has(> .ccn-ticker-track) span:first-child, [class*="tracking-widest"]', el => el ? el.textContent.trim() : '').catch(() => '');
      
      // Check computed animation
      const animName = await page.evaluate(el => window.getComputedStyle(el).animationName, track);
      const animDuration = await page.evaluate(el => window.getComputedStyle(el).animationDuration, track);
      isAnimated = animName.includes('ccnBroadcastTicker') || animName !== 'none';
      
      console.log(`Page /${p}: track=YES, items=${itemsCount}, animName="${animName}", animDuration="${animDuration}"`);
    } else {
      console.log(`Page /${p}: track=NO!`);
    }

    // Capture screenshot of top portion showing Header + Ticker
    await page.screenshot({
      path: `C:/Users/czark/.gemini/antigravity/brain/6171dbb4-faed-472d-ab3b-0ab4afdc2e53/verified_ticker_${p}.png`,
      clip: { x: 0, y: 0, width: 1440, height: 180 }
    });

    results.push({
      page: p,
      hasTrack,
      itemsCount,
      isAnimated
    });

    await page.close();
  }

  await browser.close();
  server.close();

  console.log('\n=== SUMMARY OF TICKER VERIFICATION ===');
  console.table(results);

  const allPassed = results.every(r => r.hasTrack && r.itemsCount > 0 && r.isAnimated);
  if (allPassed) {
    console.log('✓ ALL 12 PAGES HAVE SMOOTH RUNNING TICKERS!');
    process.exit(0);
  } else {
    console.error('✗ Some pages failed ticker verification!');
    process.exit(1);
  }
});
