const { chromium } = require('C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/node_modules/playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8140;
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

  console.log('Navigating to /news...');
  await page.goto(`http://localhost:${PORT}/news`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  // Check ticker item
  const tickerText = await page.$eval('.ccn-ticker-track', el => el.textContent).catch(() => '');
  console.log('Ticker includes Pennsylvania:', tickerText.includes('Pensylwanii') || tickerText.includes('300'));

  // Click on Świat category or find article card
  const pennArticle = await page.$('text=Raport Wielkiej Ławy Przysięgłych');
  console.log('Pennsylvania article found on page:', !!pennArticle);

  if (pennArticle) {
    await pennArticle.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await page.screenshot({
      path: 'C:/Users/czark/.gemini/antigravity/brain/6171dbb4-faed-472d-ab3b-0ab4afdc2e53/verified_news_pennsylvania_card.png',
      clip: { x: 0, y: 350, width: 1440, height: 550 }
    });

    // Click to open modal
    await pennArticle.click();
    await page.waitForTimeout(1000);

    const iframeVideo = await page.$('iframe[src*="T0NjiajqqRY"]');
    console.log('YouTube iframe video embedded:', !!iframeVideo);

    await page.screenshot({
      path: 'C:/Users/czark/.gemini/antigravity/brain/6171dbb4-faed-472d-ab3b-0ab4afdc2e53/verified_news_pennsylvania_modal.png',
      clip: { x: 0, y: 0, width: 1440, height: 900 }
    });
  }

  await browser.close();
  server.close();
  console.log('✓ Verification completed!');
  process.exit(0);
});
