import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  const fileUrl = 'file:///C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/kursy/pokonac-goliata.html';
  await page.goto(fileUrl, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Capture hero viewport
  await page.screenshot({
    path: 'C:/Users/czark/.gemini/antigravity/brain/db144fde-c11f-407d-ac06-6b4bec418097/goliat_hero_verified.png'
  });

  // Mobile viewport
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(500);
  await page.screenshot({
    path: 'C:/Users/czark/.gemini/antigravity/brain/db144fde-c11f-407d-ac06-6b4bec418097/goliat_mobile_verified.png'
  });

  await browser.close();
  console.log('Screenshots captured successfully!');
})();
