import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto('https://polskieradio.cc/Global/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  
  const gw = await page.$('#artist-gerald-welch');
  if (gw) {
    await gw.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'C:/Users/czark/.gemini/antigravity/brain/d6fb6723-88d9-47dd-951a-c934e6675ed7/gerald_welch_global_card.png' });
    console.log('Saved gerald_welch_global_card.png');
  }

  const jj = await page.$('#artist-jj-beauvais');
  if (jj) {
    await jj.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'C:/Users/czark/.gemini/antigravity/brain/d6fb6723-88d9-47dd-951a-c934e6675ed7/jj_beauvais_global_card.png' });
    console.log('Saved jj_beauvais_global_card.png');
  }

  await browser.close();
})();
