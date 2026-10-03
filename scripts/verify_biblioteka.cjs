const { chromium } = require('C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/node_modules/playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8135;
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
  const page = await context.newPage();

  console.log('Navigating to /biblioteka...');
  await page.goto(`http://localhost:${PORT}/biblioteka`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // 1. Title verification
  const title = await page.title();
  console.log('Page Title:', title);

  // 2. Check Ticker
  const tickerTrack = await page.$('.ccn-ticker-track');
  const itemsCount = tickerTrack ? await page.$$eval('.ccn-ticker-track > span', els => els.length) : 0;
  console.log('Ticker Track present:', !!tickerTrack, 'Items count:', itemsCount);

  // 3. Check Hero and Articles
  const heroTitle = await page.$eval('h1, h2, [class*="font-serif-headline"]', el => el.textContent.trim()).catch(() => '');
  console.log('Hero / Main Title:', heroTitle);

  // 4. Check Navigation Tabs
  const navTabs = await page.$$eval('nav button, header button', els => els.map(e => e.textContent.trim()).filter(Boolean));
  console.log('Navigation Tabs:', navTabs);

  // 5. Screenshot Top & Scrolled
  await page.screenshot({
    path: 'C:/Users/czark/.gemini/antigravity/brain/6171dbb4-faed-472d-ab3b-0ab4afdc2e53/verified_biblioteka_top.png',
    clip: { x: 0, y: 0, width: 1440, height: 900 }
  });

  await page.evaluate(() => window.scrollBy(0, 800));
  await page.waitForTimeout(500);

  await page.screenshot({
    path: 'C:/Users/czark/.gemini/antigravity/brain/6171dbb4-faed-472d-ab3b-0ab4afdc2e53/verified_biblioteka_scrolled.png',
    clip: { x: 0, y: 0, width: 1440, height: 900 }
  });

  // 6. Test Filtering: click on Audiobooki tab
  console.log('Testing category filter: Audiobooki...');
  const audiobookBtn = await page.$('button:has-text("Audiobooki")');
  if (audiobookBtn) {
    await audiobookBtn.click();
    await page.waitForTimeout(1000);
    const filteredCount = await page.$$eval('article, [class*="rounded-2xl"]', els => els.length);
    console.log('Articles visible in Audiobooki tab:', filteredCount);
    
    await page.screenshot({
      path: 'C:/Users/czark/.gemini/antigravity/brain/6171dbb4-faed-472d-ab3b-0ab4afdc2e53/verified_biblioteka_audiobooki.png',
      clip: { x: 0, y: 0, width: 1440, height: 900 }
    });
  }

  // 7. Test Modal: click an article
  console.log('Testing article modal click...');
  const firstArticle = await page.$('h2, h3');
  if (firstArticle) {
    await firstArticle.click();
    await page.waitForTimeout(1000);
    const modalVisible = await page.$('[role="dialog"], [class*="fixed inset-0"]');
    console.log('Article Modal Visible:', !!modalVisible);
    
    if (modalVisible) {
      await page.screenshot({
        path: 'C:/Users/czark/.gemini/antigravity/brain/6171dbb4-faed-472d-ab3b-0ab4afdc2e53/verified_biblioteka_modal.png',
        clip: { x: 0, y: 0, width: 1440, height: 900 }
      });
    }
  }

  await browser.close();
  server.close();
  console.log('✓ Verification completed successfully!');
  process.exit(0);
});
