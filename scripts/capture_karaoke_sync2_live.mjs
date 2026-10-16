import { chromium } from 'playwright';
import path from 'path';

const artifactsDir = 'C:/Users/czark/.gemini/antigravity/brain/36f7b59d-1af3-45fb-be88-c886d847d219';

async function capture() {
  const browser = await chromium.launch({ headless: true });

  // 1. Desktop 1440x900
  const contextDesk = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  });
  const pageDesk = await contextDesk.newPage();
  await pageDesk.goto('https://2efd4037.polskieradio.pages.dev/BiblijneUwielbienie', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await pageDesk.waitForTimeout(3000);

  // Check if toolbar is mounted
  const hasToolbar = await pageDesk.$eval('#hero-karaoke-sync-toolbar', el => !!el).catch(() => false);
  console.log('Desktop toolbar present:', hasToolbar);

  await pageDesk.screenshot({
    path: path.join(artifactsDir, 'karaoke_sync2_live_desktop.png'),
    fullPage: false
  });
  console.log('Saved karaoke_sync2_live_desktop.png');

  // 2. Mobile 390x844
  const contextMob = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15'
  });
  const pageMob = await contextMob.newPage();
  await pageMob.goto('https://2efd4037.polskieradio.pages.dev/BiblijneUwielbienie', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await pageMob.waitForTimeout(3000);

  await pageMob.screenshot({
    path: path.join(artifactsDir, 'karaoke_sync2_live_mobile.png'),
    fullPage: false
  });
  console.log('Saved karaoke_sync2_live_mobile.png');

  await browser.close();
}

capture().catch(err => {
  console.error('Playwright error:', err);
  process.exit(1);
});
