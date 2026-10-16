import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

function startServer() {
  const server = http.createServer((req, res) => {
    let reqPath = req.url.split('?')[0];
    if (reqPath === '/' || reqPath === '/BiblijneUwielbienie' || reqPath === '/biblijne-uwielbienie') {
      reqPath = '/biblijne-uwielbienie.html';
    }

    if (reqPath === '/api/bu/v1/ranking') {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ items: [{ chapterId: 'GEN-001', votes: 7 }, { chapterId: 'PRO-001', votes: 5 }] }));
      return;
    }
    if (reqPath === '/api/bu/v1/my-votes') {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ chapterIds: ['GEN-001'] }));
      return;
    }

    const filePath = path.join(ROOT, reqPath.replace(/^\//, ''));
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      const mimeTypes = {
        '.html': 'text/html; charset=utf-8',
        '.js': 'application/javascript; charset=utf-8',
        '.mjs': 'application/javascript; charset=utf-8',
        '.json': 'application/json; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.webp': 'image/webp',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.svg': 'image/svg+xml'
      };
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
      fs.createReadStream(filePath).pipe(res);
    } else {
      res.writeHead(404);
      res.end('Not found: ' + reqPath);
    }
  });

  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      resolve({ server, port });
    });
  });
}

async function verify() {
  const { server, port } = await startServer();
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`Verification server running on ${baseUrl}`);

  const browser = await chromium.launch({ headless: true });

  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(`${baseUrl}/BiblijneUwielbienie?chapter=GEN-001`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(600);

    console.log('Clicking #btn-player-karaoke directly on player bar...');
    await page.click('#btn-player-karaoke');

    await page.waitForSelector('#hero-karaoke-stage', { state: 'visible', timeout: 5000 });
    console.log('#hero-karaoke-stage is visible!');

    // Wait for lines to render
    await page.waitForSelector('#hero-karaoke-lines .bu-line', { timeout: 5000 });
    const lineCount = await page.locator('#hero-karaoke-lines .bu-line').count();
    console.log(`Rendered synchronized lines for GEN-001: ${lineCount}`);

    const bookOptions = await page.locator('#hero-book-select option').count();
    console.log(`Book selector option count: ${bookOptions}`);

    const chapterOptions = await page.locator('#hero-chapter-select option').count();
    console.log(`Chapter selector option count: ${chapterOptions}`);

    const firstLineText = await page.locator('#hero-karaoke-lines .bu-line').first().textContent();
    console.log(`First karaoke line: "${firstLineText?.trim()}"`);

    // Ensure scratch directory exists
    const scratchDir = path.join(ROOT, 'scratch');
    if (!fs.existsSync(scratchDir)) fs.mkdirSync(scratchDir, { recursive: true });

    // Capture screenshot of the hero karaoke stage
    await page.screenshot({ path: path.join(scratchDir, 'hero_karaoke_desktop_render.png') });
    console.log('Saved screenshot to scratch/hero_karaoke_desktop_render.png');

    // Test switching to reading mode (Tryb A)
    console.log('Switching to reading mode (Tryb A)...');
    await page.evaluate(() => window.CC_BU_FEATURES.setMode('reading'));
    await page.waitForSelector('#hero-karaoke-lines .hero-karaoke-verse', { timeout: 3000 });
    const verseCount = await page.locator('#hero-karaoke-lines .hero-karaoke-verse').count();
    console.log(`Verse count in reading mode: ${verseCount}`);

    // Switch back to sync mode (Tryb B)
    console.log('Switching back to sync mode (Tryb B)...');
    await page.evaluate(() => window.CC_BU_FEATURES.setMode('sync'));
    await page.waitForSelector('#hero-karaoke-lines .bu-line', { timeout: 3000 });
    const reSyncCount = await page.locator('#hero-karaoke-lines .bu-line').count();
    console.log(`Restored sync lines: ${reSyncCount}`);

    // Assertions
    if (lineCount < 100) throw new Error(`Expected at least 100 sync lines, got ${lineCount}`);
    if (bookOptions !== 66) throw new Error(`Expected 66 books in selector, got ${bookOptions}`);
    if (chapterOptions !== 50) throw new Error(`Expected 50 chapters for Genesis, got ${chapterOptions}`);
    if (verseCount !== 31) throw new Error(`Expected 31 verses in Genesis 1, got ${verseCount}`);

    console.log('✅ VERIFICATION SUCCEEDED 100%!');
    await browser.close();
    server.close();
    process.exit(0);
  } finally {
    try { await browser.close(); } catch(e) {}
    try { server.close(); } catch(e) {}
  }
}

verify().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
