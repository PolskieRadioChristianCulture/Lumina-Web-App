const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/' || reqPath === '/biblioteka') reqPath = '/biblioteka.html';
  if (reqPath === '/news') reqPath = '/news.html';
  
  const relPath = reqPath.replace(/^\//, '');
  const filePath = path.join(rootDir, relPath);
  
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const contentTypes = {
      '.html': 'text/html; charset=utf-8',
      '.js': 'application/javascript; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.webp': 'image/webp',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.svg': 'image/svg+xml'
    };
    res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404);
    res.end('Not found: ' + reqPath);
  }
});

server.listen(0, async () => {
  const port = server.address().port;
  console.log('Test server running on port', port);
  const browser = await chromium.launch();

  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

    // Test 1: Load /biblioteka with clean localStorage
    await page.goto(`http://localhost:${port}/biblioteka`, { waitUntil: 'domcontentloaded' });

    // Scroll down to trigger lazy loading of below-the-fold images
    await page.evaluate(async () => {
      window.scrollTo(0, document.body.scrollHeight);
      await new Promise(r => setTimeout(r, 600));
      window.scrollTo(0, 0);
    });

    // Verify all img tags on /biblioteka
    const imagesInfo = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img'));
      return imgs.map(img => ({
        src: img.src,
        alt: img.alt,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        complete: img.complete
      }));
    });

    console.log(`[TEST 1] Total images on /biblioteka: ${imagesInfo.length}`);
    const brokenImages = imagesInfo.filter(img => img.naturalWidth === 0);
    console.log(`[TEST 1] Broken images on /biblioteka: ${brokenImages.length}`);
    if (brokenImages.length > 0) {
      console.error('Broken images:', brokenImages);
      process.exitCode = 1;
    } else {
      console.log('✅ ALL images on /biblioteka loaded successfully (0 broken)!');
    }

    // Verify bookmark badge when no bookmarks
    const badgeEmpty = await page.$('button[aria-label="Zapisane artykuły"] span');
    console.log(`[TEST 2] Bookmark badge when bookmarks empty: ${badgeEmpty ? 'VISIBLE (FAIL)' : 'HIDDEN (PASS)'}`);
    if (badgeEmpty) process.exitCode = 1;
    await page.screenshot({ path: 'C:/Users/czark/.gemini/antigravity/brain/16cbcd2a-11aa-4876-9bfa-0cd391b5ec41/proof_biblioteka_clean_header.png', fullPage: false });

    // Test 3: Set an orphaned / foreign bookmark in localStorage (e.g. from another portal)
    await page.evaluate(() => {
      localStorage.setItem('ccn_bookmarks', JSON.stringify(['art-orphan-from-another-portal-999']));
    });
    await page.reload({ waitUntil: 'networkidle' });

    const badgeWithOrphan = await page.$('button[aria-label="Zapisane artykuły"] span');
    console.log(`[TEST 3] Bookmark badge with orphaned bookmark: ${badgeWithOrphan ? 'VISIBLE (FAIL)' : 'HIDDEN (PASS)'}`);
    if (badgeWithOrphan) {
      const badgeText = await badgeWithOrphan.innerText();
      console.error(`Phantom badge text: "${badgeText}"`);
      process.exitCode = 1;
    } else {
      console.log('✅ Phantom badge is completely eliminated (count=0, badge hidden)!');
    }

    // Test 4: Save an actual article that exists on /biblioteka
    await page.evaluate(() => {
      localStorage.setItem('ccn_bookmarks', JSON.stringify(['art-pokonac-goliata-recenzja-2026']));
    });
    await page.reload({ waitUntil: 'networkidle' });

    const badgeWithValid = await page.$('button[aria-label="Zapisane artykuły"] span');
    if (badgeWithValid) {
      const validText = await badgeWithValid.innerText();
      console.log(`[TEST 4] Valid bookmark badge count: "${validText}" (Expected: "1")`);
      if (validText === '1') {
        console.log('✅ Valid bookmark correctly shows badge with count 1!');
      } else {
        console.error('Badge count mismatch:', validText);
        process.exitCode = 1;
      }
    } else {
      console.error('[TEST 4] Badge should be visible for valid bookmark!');
      process.exitCode = 1;
    }

    // Screenshot of fixed biblioteka
    const proofPath = 'C:/Users/czark/.gemini/antigravity/brain/16cbcd2a-11aa-4876-9bfa-0cd391b5ec41/proof_biblioteka_fixed.png';
    await page.screenshot({ path: proofPath, fullPage: false });
    console.log('Screenshot saved to:', proofPath);

    // Test 5: Verify /news as well
    const pageNews = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await pageNews.goto(`http://localhost:${port}/news`, { waitUntil: 'domcontentloaded' });

    // Clear bookmarks on news
    await pageNews.evaluate(() => {
      localStorage.setItem('ccn_bookmarks', JSON.stringify([]));
    });
    await pageNews.reload({ waitUntil: 'networkidle' });
    const newsBadgeEmpty = await pageNews.$('button[aria-label="Zapisane artykuły"] span');
    console.log(`[TEST 5] News badge when bookmarks empty: ${newsBadgeEmpty ? 'VISIBLE (FAIL)' : 'HIDDEN (PASS)'}`);

    // Set orphaned bookmark on news
    await pageNews.evaluate(() => {
      localStorage.setItem('ccn_bookmarks', JSON.stringify(['art-nonexistent-book']));
    });
    await pageNews.reload({ waitUntil: 'networkidle' });
    const newsBadgeOrphan = await pageNews.$('button[aria-label="Zapisane artykuły"] span');
    console.log(`[TEST 5] News badge with orphan bookmark: ${newsBadgeOrphan ? 'VISIBLE (FAIL)' : 'HIDDEN (PASS)'}`);
    if (newsBadgeOrphan) process.exitCode = 1;
    else console.log('✅ News phantom badge is completely eliminated!');

  } catch (err) {
    console.error('Test execution error:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
    server.close();
  }
});
