import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto('https://polskieradio.cc/Global/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // Test 1: Let's see what happens if #artist-jj-beauvais .artist-img-col has aspect-ratio: 16 / 9
  await page.evaluate(() => {
    const jjCol = document.querySelector('#artist-jj-beauvais .artist-img-col');
    if (jjCol) jjCol.style.aspectRatio = '16 / 9';
  });
  await page.waitForTimeout(500);

  const jj = await page.$('#artist-jj-beauvais');
  if (jj) {
    await jj.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'C:/Users/czark/.gemini/antigravity/brain/d6fb6723-88d9-47dd-951a-c934e6675ed7/jj_beauvais_16_9_test.png' });
    console.log('Saved jj_beauvais_16_9_test.png');
  }

  // Also check Gerald Welch with 16:9 vs 1:1
  const gw = await page.$('#artist-gerald-welch');
  if (gw) {
    await gw.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'C:/Users/czark/.gemini/antigravity/brain/d6fb6723-88d9-47dd-951a-c934e6675ed7/gerald_welch_col_test.png' });
    console.log('Saved gerald_welch_col_test.png');
  }

  await browser.close();
})();
