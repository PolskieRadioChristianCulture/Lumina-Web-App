import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto('https://polskieradio.cc/Global/#articles', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // Apply 16:9 thumbnail format across all devices
  await page.evaluate(() => {
    const style = document.createElement('style');
    style.textContent = `
      .latest-thumb {
        width: 64px !important;
        height: 38px !important;
        aspect-ratio: 16 / 9.5 !important;
        object-fit: cover !important;
        border-radius: 6px !important;
      }
    `;
    document.head.appendChild(style);
  });
  await page.waitForTimeout(500);

  const listEl = await page.$('.latest-articles-block');
  if (listEl) {
    await listEl.screenshot({ path: 'C:/Users/czark/.gemini/antigravity/brain/d6fb6723-88d9-47dd-951a-c934e6675ed7/latest_articles_16_9_perfect.png' });
    console.log('Saved latest_articles_16_9_perfect.png');
  }

  // Also check desktop
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(500);
  if (listEl) {
    await listEl.screenshot({ path: 'C:/Users/czark/.gemini/antigravity/brain/d6fb6723-88d9-47dd-951a-c934e6675ed7/latest_articles_16_9_desktop.png' });
    console.log('Saved latest_articles_16_9_desktop.png');
  }

  await browser.close();
})();
