const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const LUMINA_ROOT = path.resolve('C:/Users/czark/Desktop/@ICC/LUMINA');

const PORTALS = [
  'news',
  'nauka',
  'historia',
  'biologia',
  'prawo',
  'seks',
  'kultura',
  'biznes',
  'kuchnia',
  'ziu',
  'ogloszenia',
  'wspolpraca',
  'network',
  'biblioteka',
  'edukacja',
  'psychologia',
  'finanse',
  'technologie',
  'misje',
  'apologetyka'
];

(async () => {
  console.log('=== VERIFYING ALL 20 PORTALS: LUMINA SHARE (L) & X SHARING ===\n');

  // 1. Static bundle check
  console.log('--- 1. BUNDLE ASSET AUDIT (20/20) ---');
  let bundleFails = 0;
  for (const portal of PORTALS) {
    const htmlPath = path.join(LUMINA_ROOT, `${portal}.html`);
    if (!fs.existsSync(htmlPath)) {
      console.error(`✗ Missing HTML for ${portal}`);
      bundleFails++;
      continue;
    }
    const html = fs.readFileSync(htmlPath, 'utf8');
    const assetMatch = html.match(/src="(\/assets\/[^"]+\.js)"/);
    const assetPath = assetMatch ? path.join(LUMINA_ROOT, assetMatch[1].replace(/^\//, '')) : '';
    
    let hasL = false;
    let hasX = false;

    if (portal === 'network') {
      // Vanilla HTML
      hasL = html.includes('data-lumina-share') && html.includes('lumina-share.js');
      hasX = html.includes('x.com/intent/tweet');
    } else if (assetPath && fs.existsSync(assetPath)) {
      const code = fs.readFileSync(assetPath, 'utf8');
      hasL = code.includes('tablica?share_url=') || code.includes('shareToLumina') || code.includes('lumina-share-btn-l');
      hasX = code.includes('x.com/intent/tweet');
    }

    if (hasL && hasX) {
      console.log(`✓ [${portal}] Bundle/HTML: L=OK, X=OK (${assetMatch ? path.basename(assetMatch[1]) : 'inline HTML'})`);
    } else {
      console.error(`✗ [${portal}] FAIL: L=${hasL}, X=${hasX}`);
      bundleFails++;
    }
  }

  if (bundleFails > 0) {
    console.error(`\nBUNDLE AUDIT FAILED: ${bundleFails} portals missing sharing logic.`);
    process.exit(1);
  }
  console.log('\n✓ ALL 20 PORTALS PASSED BUNDLE/ASSET SHARING AUDIT (20/20)!\n');

  // 2. DOM Rendering Check in Playwright
  console.log('--- 2. PLAYWRIGHT DOM RENDERING AUDIT (20/20) ---');
  const server = http.createServer((req, res) => {
    let p = decodeURI(req.url.split('?')[0]);
    if (p === '/') p = '/news.html';
    const f = path.join(LUMINA_ROOT, p);
    if (fs.existsSync(f) && fs.statSync(f).isFile()) {
      const ext = path.extname(f);
      const m = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg' };
      res.writeHead(200, { 'Content-Type': m[ext] || 'application/octet-stream' });
      fs.createReadStream(f).pipe(res);
    } else {
      res.writeHead(404);
      res.end();
    }
  });

  await new Promise(r => server.listen(8994, r));
  const browser = await chromium.launch({ headless: true });

  let domFails = 0;
  for (const portal of PORTALS) {
    const page = await browser.newPage();
    const url = `http://localhost:8994/${portal}.html`;
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
      await page.waitForTimeout(1200);

      // Check L button in DOM
      const lBtn = await page.$('.lumina-share-btn-l, [data-lumina-share="true"], button[aria-label*="LUMINA"], button[title*="LUMINA"]');
      // Check X button in DOM
      const xBtn = await page.$('a[href*="x.com/intent/tweet"], button[aria-label*="X"], button[title*="X"], [aria-label="Udostępnij na platformie X"]');

      const hasL = lBtn !== null;
      const hasX = xBtn !== null;

      let boxL = null;
      if (lBtn) {
        boxL = await lBtn.boundingBox();
      }

      if (hasL && hasX) {
        const sizeInfo = boxL ? `(L size: ${Math.round(boxL.width)}x${Math.round(boxL.height)}px)` : '';
        console.log(`✓ [${portal}] DOM Verified: L=Found, X=Found ${sizeInfo}`);
      } else {
        console.error(`✗ [${portal}] DOM FAIL: L=${hasL}, X=${hasX}`);
        domFails++;
      }
    } catch (err) {
      console.error(`✗ [${portal}] Navigation error:`, err.message);
      domFails++;
    } finally {
      await page.close();
    }
  }

  await browser.close();
  server.close();

  if (domFails > 0) {
    console.error(`\nDOM AUDIT FAILED: ${domFails} portals missing rendered buttons.`);
    process.exit(1);
  }

  console.log('\n======================================================');
  console.log('✓ ALL 20 PORTALS 100% PASS: BUNDLE + DOM FOR L & X SHARING!');
  console.log('======================================================');
})().catch(err => {
  console.error(err);
  process.exit(1);
});
