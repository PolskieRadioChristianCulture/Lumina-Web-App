import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();

  for (const vp of [
    { name: 'mobile_390', width: 390, height: 844 },
    { name: 'tablet_768', width: 768, height: 1024 },
    { name: 'desktop_1440', width: 1440, height: 900 }
  ]) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    await page.goto('https://polskieradio.cc/Global/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    // Apply aspect-ratio: 16 / 9 to JJ Beauvais artist-img-col
    await page.evaluate(() => {
      const style = document.createElement('style');
      style.textContent = `
        #artist-jj-beauvais .artist-img-col {
          aspect-ratio: 16 / 9 !important;
          align-self: center;
        }
      `;
      document.head.appendChild(style);
    });
    await page.waitForTimeout(500);

    const jj = await page.$('#artist-jj-beauvais');
    if (jj) {
      await jj.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      await page.screenshot({ path: `C:/Users/czark/.gemini/antigravity/brain/d6fb6723-88d9-47dd-951a-c934e6675ed7/jj_beauvais_16_9_${vp.name}.png` });
      console.log(`Saved jj_beauvais_16_9_${vp.name}.png`);
    }
    await page.close();
  }

  await browser.close();
})();
