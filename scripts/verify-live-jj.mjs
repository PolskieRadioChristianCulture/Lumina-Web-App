import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  for (const vp of [
    { name: 'live_mobile_390', width: 390, height: 844 },
    { name: 'live_desktop_1440', width: 1440, height: 900 }
  ]) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    await page.goto('https://polskieradio.cc/Global/#artists', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);
    const jj = await page.$('#artist-jj-beauvais');
    if (jj) {
      await jj.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      const info = await page.evaluate(() => {
        const col = document.querySelector('#artist-jj-beauvais .artist-img-col');
        return {
          colWidth: col ? col.clientWidth : null,
          colHeight: col ? col.clientHeight : null,
          aspectRatio: col ? window.getComputedStyle(col).aspectRatio : null
        };
      });
      console.log(vp.name, info);
      await page.screenshot({ path: `C:/Users/czark/.gemini/antigravity/brain/d6fb6723-88d9-47dd-951a-c934e6675ed7/${vp.name}.png` });
    }
    await page.close();
  }
  await browser.close();
})();
