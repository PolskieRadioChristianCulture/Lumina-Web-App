import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc';
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
};

const server = http.createServer((req, res) => {
  let reqPath = decodeURIComponent(req.url.split('?')[0]);
  if (reqPath.endsWith('/')) reqPath += 'index.html';
  const filePath = path.join(ROOT, reqPath.replace(/^\//, ''));
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(fs.readFileSync(filePath));
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

await new Promise(resolve => server.listen(8089, '127.0.0.1', resolve));
console.log('Test server listening on http://127.0.0.1:8089');

const browser = await chromium.launch({ headless: true });

const viewports = [
  { name: 'mobile_360', width: 360, height: 800 },
  { name: 'mobile_390', width: 390, height: 844 },
  { name: 'tablet_768', width: 768, height: 1024 },
  { name: 'desktop_1440', width: 1440, height: 900 },
];

for (const vp of viewports) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
  
  // Test Polish page
  await page.goto('http://127.0.0.1:8089/Welch/pl/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);
  await page.screenshot({ path: `C:/Users/czark/.gemini/antigravity/brain/d6fb6723-88d9-47dd-951a-c934e6675ed7/welch_pl_${vp.name}.png` });

  // Test English page
  await page.goto('http://127.0.0.1:8089/Welch/en/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);
  await page.screenshot({ path: `C:/Users/czark/.gemini/antigravity/brain/d6fb6723-88d9-47dd-951a-c934e6675ed7/welch_en_${vp.name}.png` });

  await page.close();
  console.log(`Verified viewport ${vp.name}`);
}

// Verification of Support links & Radio CC Global stream
const testPage = await browser.newPage();
await testPage.goto('http://127.0.0.1:8089/Welch/pl/');
const plSupportHref = await testPage.$eval('.gw-support-card a', el => el.href);
const plAudioSrc = await testPage.$eval('#gwGlobalAudio source', el => el.src);
const plRadioBtnText = await testPage.$eval('#gwRadioPlayBtn', el => el.textContent.trim());
console.log('PL Support Href:', plSupportHref);
console.log('PL Audio Src:', plAudioSrc);
console.log('PL Radio Btn:', plRadioBtnText);
if (plSupportHref !== 'https://zrzutka.pl/rs4g4v') throw new Error('PL Support link mismatch');
if (plAudioSrc !== 'https://stream.zeno.fm/umej2cuqncluv') throw new Error('PL Audio stream mismatch');

await testPage.goto('http://127.0.0.1:8089/Welch/en/');
const enSupportHref = await testPage.$eval('.gw-support-card a', el => el.href);
const enAudioSrc = await testPage.$eval('#gwGlobalAudio source', el => el.src);
const enRadioBtnText = await testPage.$eval('#gwRadioPlayBtn', el => el.textContent.trim());
console.log('EN Support Href:', enSupportHref);
console.log('EN Audio Src:', enAudioSrc);
console.log('EN Radio Btn:', enRadioBtnText);
if (enSupportHref !== 'https://revolut.me/christianculture') throw new Error('EN Support link mismatch: expected https://revolut.me/christianculture');
if (enAudioSrc !== 'https://stream.zeno.fm/umej2cuqncluv') throw new Error('EN Audio stream mismatch: expected https://stream.zeno.fm/umej2cuqncluv');

// Capture screenshot scrolled to radio player & section
await testPage.evaluate(() => document.getElementById('gwRadioBar').scrollIntoView());
await testPage.waitForTimeout(300);
await testPage.screenshot({ path: `C:/Users/czark/.gemini/antigravity/brain/d6fb6723-88d9-47dd-951a-c934e6675ed7/welch_radio_component.png` });

await browser.close();
server.close();
console.log('ALL WELCH QA TESTS PASSED!');
