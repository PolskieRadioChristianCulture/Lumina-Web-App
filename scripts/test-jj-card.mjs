import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto('https://polskieradio.cc/Global/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  const el = await page.$('#artist-jj-beauvais');
  if (el) {
    await el.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'C:/Users/czark/.gemini/antigravity/brain/d6fb6723-88d9-47dd-951a-c934e6675ed7/jj_beauvais_mobile_card.png' });
    console.log('Saved jj_beauvais_mobile_card.png');
  } else {
    console.log('Element not found');
  }
  await browser.close();
})();
