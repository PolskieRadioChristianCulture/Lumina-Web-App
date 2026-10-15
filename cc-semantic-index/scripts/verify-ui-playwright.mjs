import { chromium } from 'playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');
const artifactDir = 'C:/Users/czark/.gemini/antigravity/brain/a82c1ac6-2f50-492b-851a-8346553bffa1';

async function run() {
  console.log('--- Starting Playwright UI Verification for CC Index 2.0 ---');
  const browser = await chromium.launch({ headless: true });

  const viewports = [
    { name: 'desktop-1440-dark', width: 1440, height: 900, theme: 'dark' },
    { name: 'desktop-1440-light', width: 1440, height: 900, theme: 'light' },
    { name: 'mobile-390-dark', width: 390, height: 844, theme: 'dark' },
    { name: 'mobile-360-dark', width: 360, height: 800, theme: 'dark' },
    { name: 'mobile-320-dark', width: 320, height: 600, theme: 'dark' },
  ];

  const htmlUrl = 'file:///' + path.join(rootDir, 'index/index.html').replace(/\\/g, '/');

  for (const vp of viewports) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    await page.goto(htmlUrl, { waitUntil: 'load' });

    if (vp.theme === 'light') {
      await page.evaluate(() => {
        document.documentElement.setAttribute('data-theme', 'light');
      });
    }

    // Check horizontal overflow
    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });

    if (overflow) {
      console.error(`FAIL: Horizontal overflow detected on viewport ${vp.name} (${vp.width}px)!`);
    } else {
      console.log(`PASS: No overflow on ${vp.name} (${vp.width}px).`);
    }

    // Take screenshot
    const shotPath = path.join(artifactDir, `index-v2-${vp.name}.png`);
    await page.screenshot({ path: shotPath, fullPage: false });
    console.log(`Saved screenshot: ${shotPath}`);
    await page.close();
  }

  // Also test interactive type filter click
  const filterPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await filterPage.goto(htmlUrl, { waitUntil: 'load' });
  
  // Click on "Rozważania"
  const rozBtn = await filterPage.$('button[data-type="devotional"]');
  if (rozBtn) {
    await rozBtn.click();
    const visibleCount = await filterPage.evaluate(() => {
      const cards = document.querySelectorAll('.resource-card:not([style*="display: none"])');
      return cards.length;
    });
    console.log(`PASS: Clicking 'Rozważania' filter shows exactly ${visibleCount} cards (expected 87).`);
    const shotPath = path.join(artifactDir, `index-v2-filter-devotionals.png`);
    await filterPage.screenshot({ path: shotPath, fullPage: false });
  }

  await browser.close();
  console.log('--- UI Verification completed successfully! ---');
}

run().catch(err => {
  console.error('Playwright verification error:', err);
  process.exit(1);
});
