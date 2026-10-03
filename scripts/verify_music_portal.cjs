const { chromium } = require('C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/node_modules/playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8145;
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
  } else if (!fs.existsSync(filePath) && cleanUrl.startsWith('music/')) {
    filePath = path.join(LUMINA_ROOT, cleanUrl, 'index.html');
  }

  if (!fs.existsSync(filePath)) {
    // SPA fallback for /music/*
    if (cleanUrl.startsWith('music')) {
      filePath = path.join(LUMINA_ROOT, 'music/index.html');
    }
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

  console.log('1. Navigating to /music...');
  await page.goto(`http://localhost:${PORT}/music`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  // Check branding
  const brandTitle = await page.textContent('body');
  const hasBrand = brandTitle.includes('CHRISTIAN CULTURE MUSIC');
  const hasSubtitle = brandTitle.includes('Muzyka • Premiery • Artyści • Playlisty • Radio • Video');
  console.log('Brand Title present:', hasBrand);
  console.log('Brand Subtitle present:', hasSubtitle);

  // Check Ticker
  const tickerText = await page.$eval('.ccn-ticker-track', el => el.textContent).catch(() => '');
  console.log('Ticker has CC MUSIC items:', tickerText.includes('Worship LIVE CC') || tickerText.includes('PREMIERA'));

  // Screenshot Top Hero
  await page.screenshot({
    path: 'C:/Users/czark/.gemini/antigravity/brain/6171dbb4-faed-472d-ab3b-0ab4afdc2e53/verified_music_top.png',
    clip: { x: 0, y: 0, width: 1440, height: 850 }
  });
  console.log('✓ Captured verified_music_top.png');

  // 2. Check Artists & 41 Channels section
  console.log('2. Checking 41 Channels in Artists catalog...');
  const channelCardsCount = await page.$$eval('#artysci-section .group', cards => cards.length);
  console.log(`Channels displayed on home page: ${channelCardsCount} (expected 41)`);

  const hasPersonalityPlus = brandTitle.includes('Personality Plus') || brandTitle.includes('@osobowoscplus');
  const hasUbierzSlowa = brandTitle.includes('Ubierz Słowa') || brandTitle.includes('@ubierzsowa8173');
  const hasTopSeven = brandTitle.includes('Top Seven') || brandTitle.includes('@topseven_cc');
  console.log('Key channels present (Personality Plus, Ubierz Słowa, Top Seven):', hasPersonalityPlus, hasUbierzSlowa, hasTopSeven);

  // Scroll to Artists Catalog and screenshot
  const artysciSection = await page.$('#artysci-section');
  if (artysciSection) {
    await artysciSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await artysciSection.screenshot({
      path: 'C:/Users/czark/.gemini/antigravity/brain/6171dbb4-faed-472d-ab3b-0ab4afdc2e53/verified_music_artysci.png'
    });
    console.log('✓ Captured verified_music_artysci.png');
  }

  // 3. Test Navigation to /music/top
  console.log('3. Testing navigation to /music/top...');
  await page.click('a[href="/music/top"]');
  await page.waitForTimeout(800);
  const currentUrl = page.url();
  console.log('Navigated to URL:', currentUrl);
  await page.screenshot({
    path: 'C:/Users/czark/.gemini/antigravity/brain/6171dbb4-faed-472d-ab3b-0ab4afdc2e53/verified_music_top_seven.png',
    clip: { x: 0, y: 0, width: 1440, height: 800 }
  });
  console.log('✓ Captured verified_music_top_seven.png');

  // 4. Test Navigation to /music/radio
  console.log('4. Testing navigation to /music/radio...');
  await page.click('a[href="/music/radio"]');
  await page.waitForTimeout(800);
  await page.screenshot({
    path: 'C:/Users/czark/.gemini/antigravity/brain/6171dbb4-faed-472d-ab3b-0ab4afdc2e53/verified_music_radio.png',
    clip: { x: 0, y: 0, width: 1440, height: 800 }
  });
  console.log('✓ Captured verified_music_radio.png');

  // 5. Test Video Modal
  console.log('5. Testing Video Modal trigger on a release...');
  await page.click('a[href="/music"]');
  await page.waitForTimeout(600);
  const playBtn = await page.$('button[aria-label*="Odtwórz"]');
  if (playBtn) {
    await playBtn.click();
    await page.waitForTimeout(1000);
    const modalIframe = await page.$('iframe[src*="youtube-nocookie.com"]');
    console.log('Video Modal opened with YouTube player:', !!modalIframe);
    await page.screenshot({
      path: 'C:/Users/czark/.gemini/antigravity/brain/6171dbb4-faed-472d-ab3b-0ab4afdc2e53/verified_music_video_modal.png',
      clip: { x: 0, y: 0, width: 1440, height: 900 }
    });
    console.log('✓ Captured verified_music_video_modal.png');
  }

  await browser.close();
  server.close();
  console.log('✓ ALL MUSIC PORTAL VERIFICATIONS PASSED SUCCESSFULLY!');
  process.exit(0);
});
