import express from 'express';
import path from 'path';
import { chromium } from 'playwright';

const PORT = 8093;
const app = express();
const rootDir = process.cwd();

app.use('/Global', express.static(path.join(rootDir, 'Global')));
app.use(express.static(rootDir));
app.get('/Global/*', (req, res) => {
  res.sendFile(path.join(rootDir, 'Global', 'index.html'));
});

const server = app.listen(PORT, async () => {
  console.log(`Server started on http://localhost:${PORT}/Global/`);
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const consoleLogs = [];
  page.on('console', msg => consoleLogs.push({ type: msg.type(), text: msg.text() }));

  await page.goto(`http://localhost:${PORT}/Global/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  // 1. Verify Top Bar Header Logo
  const headerLogoSrc = await page.locator('.site-header .brand img.logo').getAttribute('src');
  console.log('Header logo src:', headerLogoSrc);

  // 2. Verify Footer Logo
  const footerLogoSrc = await page.locator('.site-footer .footer-logo-row img.logo').getAttribute('src');
  console.log('Footer logo src:', footerLogoSrc);

  // 3. Verify Magazine Image
  const leadImageSrc = await page.locator('.featured-lead-article .lead-thumb-wrap img').getAttribute('src');
  console.log('Magazine lead image src:', leadImageSrc);

  // 4. Verify Stations Cards Art
  const radioGlobalArt = await page.locator('.radio-card img.radio-art').nth(0).getAttribute('src');
  const radioBibleArt = await page.locator('.radio-card img.radio-art').nth(1).getAttribute('src');
  console.log('Radio Global Art:', radioGlobalArt);
  console.log('Radio Bible Art:', radioBibleArt);

  // 5. Test Audio Player for Global Radio
  console.log('Testing Play Global Radio...');
  await page.click('.circle-play-btn[data-station="global"]');
  await page.waitForTimeout(1000);
  const playerVisible = await page.locator('.sticky-player').isVisible();
  console.log('Sticky player visible after global play:', playerVisible);

  // 6. Test Audio Player for Bible Radio
  console.log('Testing Play Bible Radio...');
  await page.click('.circle-play-btn[data-station="bible"]');
  await page.waitForTimeout(1000);
  const biblePlaying = await page.locator('.circle-play-btn[data-station="bible"]').textContent();
  console.log('Bible button state:', biblePlaying.trim());

  // 7. Verify LUMINA Auth Button
  const authBtnText = await page.locator('#auth-btn').textContent();
  console.log('Auth button text:', authBtnText.trim());

  // 8. Screenshot verification
  const artifactDir = 'C:/Users/czark/.gemini/antigravity/brain/6171dbb4-faed-472d-ab3b-0ab4afdc2e53';
  await page.screenshot({ path: path.join(artifactDir, 'verification_desktop.png') });

  // Mobile viewport
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(artifactDir, 'verification_mobile.png') });

  console.log('Verification completed successfully.');
  await browser.close();
  server.close(() => process.exit(0));
});
