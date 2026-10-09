const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const rootDir = path.resolve(__dirname, '..');
const PORT = 3899;

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
  let reqPath = decodeURIComponent(req.url.split('?')[0]);
  if (reqPath === '/') reqPath = '/index.html';
  
  let filePath = path.join(rootDir, reqPath);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  } else if (!fs.existsSync(filePath) && fs.existsSync(filePath + '.html')) {
    filePath = filePath + '.html';
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(fs.readFileSync(filePath));
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(PORT, async () => {
  console.log(`Local static server running on http://127.0.0.1:${PORT}`);
  try {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

    console.log('Navigating to lesson 09...');
    await page.goto(`http://127.0.0.1:${PORT}/akademia/kurscodzienny/dzien-09`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    const sharePanel = await page.$('#ccDailyShare');
    if (!sharePanel) throw new Error('#ccDailyShare not found!');
    
    const h2Text = await page.textContent('#ccDailyShare h2');
    console.log('Lesson 09 Heading:', h2Text.trim());

    const financePanel = await page.$('#ccDailyPatronFinance');
    if (!financePanel) throw new Error('#ccDailyPatronFinance not found!');
    
    const patroniteLink = await page.$('#ccDailyPatronFinance a[href*="patronite.pl/osobowoscplus"]');
    console.log('Patronite link present:', !!patroniteLink);

    const bankAcc = await page.textContent('#ccBankAccNum');
    console.log('Bank account text:', bankAcc.trim());

    // Take screenshot of lesson 09 CTA
    await sharePanel.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    const lessonScreenshotPath = 'C:/Users/czark/.gemini/antigravity/brain/9d6089de-a3bf-4346-9ac0-52d22ecf6cf0/proof_lesson_09_patron_cta.png';
    await sharePanel.screenshot({ path: lessonScreenshotPath });
    console.log('Saved lesson screenshot to:', lessonScreenshotPath);

    // Finance screenshot desktop
    const financeScreenshotPath = 'C:/Users/czark/.gemini/antigravity/brain/9d6089de-a3bf-4346-9ac0-52d22ecf6cf0/proof_lesson_09_patron_finance_desktop.png';
    await financePanel.screenshot({ path: financeScreenshotPath });
    console.log('Saved finance screenshot to:', financeScreenshotPath);

    // Mobile viewport
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(400);
    const mobileScreenshotPath = 'C:/Users/czark/.gemini/antigravity/brain/9d6089de-a3bf-4346-9ac0-52d22ecf6cf0/proof_lesson_09_patron_cta_mobile.png';
    await sharePanel.screenshot({ path: mobileScreenshotPath });
    console.log('Saved mobile screenshot to:', mobileScreenshotPath);

    const mobileFinancePath = 'C:/Users/czark/.gemini/antigravity/brain/9d6089de-a3bf-4346-9ac0-52d22ecf6cf0/proof_lesson_09_patron_finance_mobile.png';
    await financePanel.screenshot({ path: mobileFinancePath });
    console.log('Saved mobile finance screenshot to:', mobileFinancePath);

    // Catalog test
    await page.setViewportSize({ width: 1280, height: 900 });
    console.log('Navigating to course catalog...');
    await page.goto(`http://127.0.0.1:${PORT}/akademia#kurscodzienny`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    const catH2 = await page.textContent('#ccDailyShare h2');
    console.log('Catalog Heading:', catH2.trim());

    const catPanel = await page.$('#ccDailyShare');
    const catalogScreenshotPath = 'C:/Users/czark/.gemini/antigravity/brain/9d6089de-a3bf-4346-9ac0-52d22ecf6cf0/proof_catalog_patron_cta.png';
    await catPanel.screenshot({ path: catalogScreenshotPath });
    console.log('Saved catalog screenshot to:', catalogScreenshotPath);

    await browser.close();
    console.log('ALL PLAYWRIGHT TESTS PASSED 100%!');
  } catch (err) {
    console.error('Playwright Error:', err);
    process.exitCode = 1;
  } finally {
    server.close(() => process.exit(process.exitCode || 0));
  }
});
