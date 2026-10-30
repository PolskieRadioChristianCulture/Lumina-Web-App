import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  for (const vp of [
    { name: 'live_latest_articles_mobile_390', width: 390, height: 844 },
    { name: 'live_latest_articles_desktop_1440', width: 1440, height: 900 }
  ]) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    await page.goto('https://polskieradio.cc/Global/#articles', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);
    const listEl = await page.$('.latest-articles-block');
    if (listEl) {
      await listEl.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      const info = await page.evaluate(() => {
        const thumb = document.querySelector('.latest-item img[src*="now-is-the-time"]');
        return {
          width: thumb ? thumb.clientWidth : null,
          height: thumb ? thumb.clientHeight : null,
          aspectRatio: thumb ? window.getComputedStyle(thumb).aspectRatio : null
        };
      });
      console.log(vp.name, info);
      await listEl.screenshot({ path: `C:/Users/czark/.gemini/antigravity/brain/d6fb6723-88d9-47dd-951a-c934e6675ed7/${vp.name}.png` });
    }
    await page.close();
  }
  await browser.close();
})();
