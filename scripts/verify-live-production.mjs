import { chromium } from 'playwright';
import path from 'path';

async function verifyLive() {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const cspViolations = [];
  const pageErrors = [];
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('Content Security Policy') || text.includes('CSP')) {
      cspViolations.push(text);
    }
  });
  page.on('pageerror', err => pageErrors.push(err.message));

  console.log('Navigating to live production: https://polskieradio.cc/Global/ ...');
  await page.goto('https://polskieradio.cc/Global/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // 1. Verify Top Bar Logo
  const headerLogo = await page.locator('.site-header .brand img.logo').first();
  const headerLogoSrc = await headerLogo.getAttribute('src');
  const headerLogoNaturalWidth = await headerLogo.evaluate(img => img.naturalWidth);
  console.log('LIVE Header logo src:', headerLogoSrc, 'naturalWidth:', headerLogoNaturalWidth);

  // 2. Verify Footer Logo
  const footerLogo = await page.locator('.site-footer .footer-logo-row img.logo').first();
  const footerLogoSrc = await footerLogo.getAttribute('src');
  const footerLogoNaturalWidth = await footerLogo.evaluate(img => img.naturalWidth);
  console.log('LIVE Footer logo src:', footerLogoSrc, 'naturalWidth:', footerLogoNaturalWidth);

  // 3. Verify Magazine Image
  const magImg = await page.locator('.featured-lead-article .lead-thumb-wrap img').first();
  const magImgSrc = await magImg.getAttribute('src');
  const magImgNaturalWidth = await magImg.evaluate(img => img.naturalWidth);
  console.log('LIVE Magazine lead image src:', magImgSrc, 'naturalWidth:', magImgNaturalWidth);

  // 4. Test Global Radio audio stream playback
  console.log('Testing live Global Radio playback...');
  await page.click('.circle-play-btn[data-station="global"]');
  await page.waitForTimeout(3000);
  const playerVisible = await page.locator('.sticky-player').isVisible();
  const stickyTitle = await page.locator('.sticky-title').textContent().catch(() => '');
  console.log('Sticky player visible:', playerVisible, 'Title:', stickyTitle.trim());

  // 5. Test Global Bible Radio audio stream playback
  console.log('Testing live Global Bible Radio playback...');
  await page.click('.circle-play-btn[data-station="bible"]');
  await page.waitForTimeout(3000);
  const bibleTitle = await page.locator('.sticky-title').textContent().catch(() => '');
  console.log('Bible player Title:', bibleTitle.trim());

  // 6. Test Auth button
  console.log('Testing Sign In button action...');
  const [newPage] = await Promise.all([
    context.waitForEvent('page', { timeout: 3000 }).catch(() => null),
    page.click('#auth-btn')
  ]);
  if (newPage) {
    console.log('Auth opened popup URL:', newPage.url());
    await newPage.close();
  } else {
    console.log('Current page URL after auth click:', page.url());
  }

  // 7. Check for any CSP errors
  console.log('CSP violations encountered:', cspViolations);
  console.log('Page errors encountered:', pageErrors);

  // 8. Capture live screenshots
  const artifactDir = 'C:/Users/czark/.gemini/antigravity/brain/6171dbb4-faed-472d-ab3b-0ab4afdc2e53';
  await page.screenshot({ path: path.join(artifactDir, 'production_live_desktop.png') });
  
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(artifactDir, 'production_live_mobile.png') });

  console.log('Live production verification complete!');
  await browser.close();
}

verifyLive().catch(console.error);
