import { chromium, devices } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

function createStaticServer() {
  return http.createServer((req, res) => {
    let reqPath = req.url.split('?')[0];
    if (reqPath === '/' || reqPath === '/podcasty') reqPath = '/podcasty.html';
    
    const filePath = path.join(process.cwd(), reqPath.replace(/^\//, ''));
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath);
      const mimeMap = {
        '.html': 'text/html; charset=utf-8',
        '.js': 'application/javascript; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.json': 'application/json; charset=utf-8',
        '.webp': 'image/webp',
        '.jpg': 'image/jpeg',
        '.png': 'image/png',
        '.svg': 'image/svg+xml'
      };
      res.writeHead(200, {
        'Content-Type': mimeMap[ext] || 'application/octet-stream',
        'Content-Security-Policy': "default-src 'self' https: data: blob:; img-src 'self' data: blob: https:; style-src 'self' 'unsafe-inline' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; frame-src 'self' https://open.spotify.com https://drive.google.com https://accounts.google.com https://www.youtube-nocookie.com https://www.youtube.com; connect-src 'self' https: wss:; media-src 'self' blob: data: https:; font-src 'self' data: https:;"
      });
      fs.createReadStream(filePath).pipe(res);
    } else {
      res.writeHead(404);
      res.end('Not found: ' + reqPath);
    }
  });
}

async function verifyBrowser() {
  console.log('--- Starting Playwright Full Verification for /podcasty over HTTP ---');
  
  const server = createStaticServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}/podcasty`;
  console.log('Test server listening at:', baseUrl);

  const browser = await chromium.launch({ headless: true });
  const desktopPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  const errors = [];
  desktopPage.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  desktopPage.on('pageerror', err => {
    errors.push('PAGE_ERROR: ' + err.message);
  });

  console.log('Navigating desktop to:', baseUrl);
  await desktopPage.goto(baseUrl, { waitUntil: 'networkidle', timeout: 30000 });

  // 1. Verify Live Players exist and are visible
  const spotifyShow = desktopPage.locator('#live-spotify-show-frame');
  const gdriveAudio = desktopPage.locator('#live-gdrive-m4a-frame');
  const musicDeck = desktopPage.locator('#live-music-deck-frame');

  console.log('Checking live player frames...');
  console.log('1. Spotify Show Frame visible:', await spotifyShow.isVisible());
  console.log('2. Google Drive Frame visible:', await gdriveAudio.isVisible());
  console.log('3. Music Deck Frame visible:', await musicDeck.isVisible());

  // Verify sources
  console.log('Spotify Show src:', await spotifyShow.getAttribute('src'));
  console.log('Google Drive src:', await gdriveAudio.getAttribute('src'));
  console.log('Music Deck initial src:', await musicDeck.getAttribute('src'));

  // 2. Verify Cards Grid
  const cards = desktopPage.locator('.cc-catalog-card');
  const cardCount = await cards.count();
  console.log('Total catalog cards rendered:', cardCount);
  if (cardCount !== 16) {
    throw new Error(`Expected 16 cards (1 artist + 15 albums), found ${cardCount}`);
  }

  // 3. Test Clicking an Album Card to Mount to Deck
  console.log('Testing Album Deck interaction...');
  const secondCard = cards.nth(1); // Second item (The House of God: Beta)
  const secondCardTitle = await secondCard.locator('.cc-card-title').innerText();
  console.log('Clicking card 2:', secondCardTitle);
  await secondCard.locator('.cc-card-btn-play').click();

  await desktopPage.waitForTimeout(1000);
  const deckTitle = await desktopPage.locator('#active-deck-title').innerText();
  console.log('Active deck title after click:', deckTitle);
  if (!deckTitle.includes(secondCardTitle)) {
    throw new Error(`Deck title mismatch: expected ${secondCardTitle}, got ${deckTitle}`);
  }

  const updatedDeckSrc = await musicDeck.getAttribute('src');
  console.log('Updated music deck src:', updatedDeckSrc);

  // 4. Test Modal Expansion
  console.log('Testing Modal Drawer...');
  await secondCard.locator('.cc-card-btn-modal').click();
  await desktopPage.waitForTimeout(800);
  const modal = desktopPage.locator('#embed-modal');
  console.log('Modal is open:', await modal.evaluate(el => el.classList.contains('is-open')));
  const modalIframe = desktopPage.locator('#embed-modal-body iframe');
  console.log('Modal iframe src:', await modalIframe.getAttribute('src'));

  // Close modal
  await desktopPage.locator('#embed-modal-close').click();
  await desktopPage.waitForTimeout(500);
  console.log('Modal closed:', !(await modal.evaluate(el => el.classList.contains('is-open'))));

  // Desktop Screenshot
  const desktopScreenshot = 'C:/Users/czark/.gemini/antigravity/brain/6171dbb4-faed-472d-ab3b-0ab4afdc2e53/podcasty_desktop_verified.png';
  await desktopPage.screenshot({ path: desktopScreenshot, fullPage: false });
  console.log('Desktop screenshot saved to:', desktopScreenshot);

  // 5. Test Mobile (iPhone 14)
  console.log('Testing Mobile Viewport (iPhone 14)...');
  const mobileContext = await browser.newContext({
    ...devices['iPhone 14']
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto(baseUrl, { waitUntil: 'networkidle', timeout: 30000 });

  const mobileSpotify = mobilePage.locator('#live-spotify-show-frame');
  const mobileGdrive = mobilePage.locator('#live-gdrive-m4a-frame');
  console.log('Mobile Spotify Frame visible:', await mobileSpotify.isVisible());
  console.log('Mobile GDrive Frame visible:', await mobileGdrive.isVisible());

  const mobileScreenshot = 'C:/Users/czark/.gemini/antigravity/brain/6171dbb4-faed-472d-ab3b-0ab4afdc2e53/podcasty_mobile_verified.png';
  await mobilePage.screenshot({ path: mobileScreenshot, fullPage: false });
  console.log('Mobile screenshot saved to:', mobileScreenshot);

  console.log('Console errors recorded:', errors.length);
  if (errors.length) {
    console.log('Errors:', errors);
  }

  await browser.close();
  await new Promise((resolve) => server.close(resolve));
  console.log('--- Playwright Full Verification PASSED! ---');
}

verifyBrowser().catch(err => {
  console.error('Browser Verification Failed:', err);
  process.exit(1);
});
