import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p.endsWith('/')) p += 'index.html';
  const f = path.join(process.cwd(), p.replace(/^\//, ''));
  if (fs.existsSync(f) && fs.statSync(f).isFile()) {
    res.writeHead(200); res.end(fs.readFileSync(f));
  } else { res.writeHead(404); res.end(); }
});
server.listen(8091);

const browser = await chromium.launch();

for (const lang of ['en', 'pl']) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(`http://127.0.0.1:8091/Welch/${lang}/`);
  await page.waitForTimeout(400);

  // Check plus button count
  const plusBtns = await page.$$eval('.gw-hero-topbar button:visible, .gw-hero-topbar .cc-mobile-edge-trigger:visible', btns => 
    btns.map(b => ({ className: b.className, text: b.textContent.trim() }))
  );
  console.log(`[${lang}] visible plus buttons:`, plusBtns);
  if (plusBtns.length !== 1) throw new Error(`[${lang}] Expected exactly 1 plus button, found ${plusBtns.length}`);

  // Test opening edge panel by clicking the golden button
  await page.click('.gw-hero-topbar .cc-mobile-edge-trigger:visible');
  await page.waitForTimeout(300);

  const isDialogOpen = await page.$eval('#cc-mobile-edge-dialog', d => d.open);
  console.log(`[${lang}] edge dialog open:`, isDialogOpen);
  if (!isDialogOpen) throw new Error(`[${lang}] Edge dialog did not open on plus button click`);

  // Close dialog
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);

  // Take screenshot of hero on mobile
  await page.screenshot({ path: `C:/Users/czark/.gemini/antigravity/brain/d6fb6723-88d9-47dd-951a-c934e6675ed7/welch_${lang}_hero_mobile_390.png` });
  await page.close();
}

// Also take desktop 1440 screenshot for verification
const dPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await dPage.goto('http://127.0.0.1:8091/Welch/en/');
await dPage.waitForTimeout(400);
await dPage.screenshot({ path: 'C:/Users/czark/.gemini/antigravity/brain/d6fb6723-88d9-47dd-951a-c934e6675ed7/welch_en_hero_desktop_1440.png' });
await dPage.close();

await browser.close();
server.close();
console.log('ALL EDGE BUTTON & HERO INTERACTION TESTS PASSED!');
