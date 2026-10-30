import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto('https://polskieradio.cc/Global/#articles', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // Variant A: aspect-ratio: 16/9, width: 68px, height: 38px (or width: 64px, height: 36px)
  await page.evaluate(() => {
    const list = document.querySelector('.latest-list');
    if (list) list.scrollIntoView();
  });
  await page.waitForTimeout(500);

  // Take screenshot before
  const listEl = await page.$('.latest-articles-block');
  if (listEl) {
    await listEl.screenshot({ path: 'C:/Users/czark/.gemini/antigravity/brain/d6fb6723-88d9-47dd-951a-c934e6675ed7/latest_articles_before.png' });
    console.log('Saved latest_articles_before.png');
  }

  // Variant 1: .latest-thumb with aspect-ratio: 16/9; width: 64px; height: 36px;
  await page.evaluate(() => {
    const style = document.createElement('style');
    style.id = 'test-style-1';
    style.textContent = `
      .latest-thumb {
        width: 64px !important;
        height: 40px !important;
        aspect-ratio: 16 / 10 !important;
        object-fit: cover !important;
      }
    `;
    document.head.appendChild(style);
  });
  await page.waitForTimeout(500);
  if (listEl) {
    await listEl.screenshot({ path: 'C:/Users/czark/.gemini/antigravity/brain/d6fb6723-88d9-47dd-951a-c934e6675ed7/latest_articles_variant_16_10.png' });
    console.log('Saved latest_articles_variant_16_10.png');
  }

  // Variant 2: .latest-thumb with width: 68px, height: 38px (16:9)
  await page.evaluate(() => {
    document.getElementById('test-style-1').textContent = `
      .latest-thumb {
        width: 68px !important;
        height: 38px !important;
        aspect-ratio: 16 / 9 !important;
        object-fit: cover !important;
      }
    `;
  });
  await page.waitForTimeout(500);
  if (listEl) {
    await listEl.screenshot({ path: 'C:/Users/czark/.gemini/antigravity/brain/d6fb6723-88d9-47dd-951a-c934e6675ed7/latest_articles_variant_16_9.png' });
    console.log('Saved latest_articles_variant_16_9.png');
  }

  // Variant 3: 52px square with contain + dark background (#061225)
  await page.evaluate(() => {
    document.getElementById('test-style-1').textContent = `
      .latest-thumb {
        width: 52px !important;
        height: 52px !important;
        object-fit: contain !important;
        background: #020813 !important;
      }
    `;
  });
  await page.waitForTimeout(500);
  if (listEl) {
    await listEl.screenshot({ path: 'C:/Users/czark/.gemini/antigravity/brain/d6fb6723-88d9-47dd-951a-c934e6675ed7/latest_articles_variant_contain.png' });
    console.log('Saved latest_articles_variant_contain.png');
  }

  await browser.close();
})();
