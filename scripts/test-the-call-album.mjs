import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const artifactDir = 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\d6fb6723-88d9-47dd-951a-c934e6675ed7';

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
  let reqPath = decodeURIComponent(req.url.split('?')[0]);
  if (reqPath.endsWith('/')) reqPath += 'index.html';
  const filePath = path.join(projectRoot, reqPath);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

const EXPECTED_TRACKS = [
  'ACTS 29',
  'NO IDEA',
  'THE STANDARDS OF MAN',
  'WORSHIP',
  'RAISE THE DEAD',
  'WITNESS',
  'KINGDOM COME',
  'VAMPIRE',
  'ASHES ON ALTARS'
];

async function runTests() {
  await new Promise(resolve => server.listen(8091, '127.0.0.1', resolve));
  console.log('🚀 Test server running on http://127.0.0.1:8091');
  console.log('🚀 Starting THE CALL Album Experience verification...');
  const browser = await chromium.launch({ headless: true });
  
  const viewports = [
    { name: 'mobile_360', width: 360, height: 740 },
    { name: 'mobile_390', width: 390, height: 844 },
    { name: 'mobile_430', width: 430, height: 932 },
    { name: 'tablet_768', width: 768, height: 1024 },
    { name: 'desktop_1440', width: 1440, height: 900 }
  ];

  for (const lang of ['en', 'pl']) {
    console.log(`\n--- Testing ${lang.toUpperCase()} version ---`);
    const pageUrl = `http://127.0.0.1:8091/Welch/${lang}/`;

    for (const vp of viewports) {
      const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
      await page.goto(pageUrl, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(300);

      // Verify #the-call section exists
      const section = page.locator('#the-call');
      if (await section.count() === 0) {
        throw new Error(`[${lang}] #the-call section missing!`);
      }

      // Check tracklist length & names
      const trackBtns = page.locator('#cc-tracklist .cc-track-btn');
      const count = await trackBtns.count();
      if (count !== 9) {
        throw new Error(`[${lang}] Expected 9 tracks, found ${count}`);
      }

      for (let i = 0; i < 9; i++) {
        const text = await trackBtns.nth(i).textContent();
        if (!text.includes(EXPECTED_TRACKS[i])) {
          throw new Error(`[${lang}] Track ${i+1} mismatch. Expected ${EXPECTED_TRACKS[i]}, got ${text}`);
        }
      }

      // Verify RDS display starts with ACTS 29
      const rdsText = await page.locator('#cc-rds-display').textContent();
      if (!rdsText.includes('ACTS 29')) {
        throw new Error(`[${lang}] Initial RDS does not contain ACTS 29: ${rdsText}`);
      }

      // Check Next button updates RDS to NO IDEA
      await page.locator('#cc-next').click();
      const rdsNext = await page.locator('#cc-rds-display').textContent();
      if (!rdsNext.includes('NO IDEA')) {
        throw new Error(`[${lang}] Next button failed to update RDS: ${rdsNext}`);
      }

      // Check selecting track 8 (VAMPIRE)
      await trackBtns.nth(7).click();
      const rdsVampire = await page.locator('#cc-rds-display').textContent();
      if (!rdsVampire.includes('VAMPIRE')) {
        throw new Error(`[${lang}] Selecting VAMPIRE failed: ${rdsVampire}`);
      }
      const descText = await page.locator('#cc-selected-desc').textContent();
      if (lang === 'en' && !descText.includes('metaphorical critique')) {
        throw new Error(`[${lang}] VAMPIRE commentary missing explanation: ${descText}`);
      }
      if (lang === 'pl' && !descText.includes('Metaforyczna krytyka')) {
        throw new Error(`[${lang}] VAMPIRE PL commentary missing explanation: ${descText}`);
      }

      // Check Prev button from VAMPIRE -> KINGDOM COME
      await page.locator('#cc-prev').click();
      const rdsKingdom = await page.locator('#cc-rds-display').textContent();
      if (!rdsKingdom.includes('KINGDOM COME')) {
        throw new Error(`[${lang}] Prev button failed to update RDS: ${rdsKingdom}`);
      }

      // Verify Phase A: #cc-preview is hidden and empty
      const isHidden = await page.locator('#cc-preview').getAttribute('hidden');
      if (isHidden === null) {
        throw new Error(`[${lang}] #cc-preview must be hidden in Phase A`);
      }

      // Check horizontal overflow
      const overflowDetails = await page.evaluate(() => {
        const docW = window.innerWidth;
        const bad = [];
        document.querySelectorAll('*').forEach(el => {
          const rect = el.getBoundingClientRect();
          if (rect.right > docW + 1) {
            bad.push({
              tag: el.tagName,
              id: el.id,
              className: el.className,
              right: rect.right,
              width: rect.width
            });
          }
        });
        return {
          scrollWidth: document.documentElement.scrollWidth,
          innerWidth: docW,
          bad: bad.slice(0, 10)
        };
      });

      if (overflowDetails.scrollWidth > overflowDetails.innerWidth + 1) {
        console.error('Overflow elements:', overflowDetails.bad);
        throw new Error(`[${lang}] Horizontal overflow on ${vp.name}: scrollWidth=${overflowDetails.scrollWidth}, innerWidth=${overflowDetails.innerWidth}`);
      }

      // Capture screenshots for mobile_390 and desktop_1440
      if (vp.name === 'mobile_390' || vp.name === 'desktop_1440') {
        const shotPath = path.join(artifactDir, `the_call_album_${lang}_${vp.name}.png`);
        const albumElem = page.locator('#the-call');
        await albumElem.scrollIntoViewIfNeeded();
        await page.waitForTimeout(300);
        await albumElem.screenshot({ path: shotPath });
        console.log(`📸 Saved screenshot: ${shotPath}`);
      }

      await page.close();
      console.log(`✅ ${lang.toUpperCase()} on ${vp.name} (${vp.width}x${vp.height}) PASS`);
    }
  }

  await browser.close();
  server.close();
  console.log('\n🎉 ALL THE CALL ALBUM EXPERIENCE TESTS PASSED 100%!');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  if (server) server.close();
  process.exit(1);
});
