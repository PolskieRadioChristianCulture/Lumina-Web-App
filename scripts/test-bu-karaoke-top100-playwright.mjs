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

    // Mock API for local playwright runner
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

async function run() {
  const { server, port } = await startServer();
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`Test server running at ${baseUrl}`);

  const browser = await chromium.launch({ headless: true });

  try {
    // 1. DESKTOP TEST (1440x900)
    console.log('\n--- 1. DESKTOP PLAYWRIGHT TEST (1440x900) ---');
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(`${baseUrl}/BiblijneUwielbienie?chapter=GEN-001`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // Check Karaoke Modal
    console.log('Testing Karaoke Modal...');
    await page.evaluate(() => window.openZeroAtrapModal('karaoke'));
    await page.waitForSelector('#bu-dialog-backdrop.open');
    const karaokeTitle = await page.textContent('#bu-dialog-title');
    console.log(`Karaoke Title: "${karaokeTitle}"`);
    if (!karaokeTitle?.includes('Karaoke')) {
      throw new Error(`Oczekiwano tytułu Karaoke, otrzymano: ${karaokeTitle}`);
    }

    // Wait for lines to render
    await page.waitForSelector('.bu-line');
    const lineCount = await page.locator('.bu-line').count();
    console.log(`Rendered karaoke lines: ${lineCount}`);
    if (lineCount < 20) {
      throw new Error(`Zbyt mało wersów karaoke: ${lineCount}`);
    }

    const firstLineText = await page.locator('.bu-line').first().textContent();
    console.log(`First line: "${firstLineText?.trim()}"`);
    if (!firstLineText?.includes('Na początku')) {
      throw new Error(`Pierwszy wers nie zawiera 'Na początku': ${firstLineText}`);
    }

    // Test clicking a line
    await page.locator('.bu-line').nth(2).click();
    console.log('Clicked 3rd karaoke line.');

    // Close Karaoke Modal
    await page.click('#bu-dialog-close');
    await page.waitForTimeout(300);
    const isOpenAfterClose = await page.evaluate(() => document.getElementById('bu-dialog-backdrop').classList.contains('open'));
    if (isOpenAfterClose) throw new Error('Modal karaoke nie zamknął się.');
    console.log('✅ Karaoke modal Desktop PASSED.');

    // Check TOP 100 Modal
    console.log('\nTesting TOP 100 Modal...');
    await page.evaluate(() => window.openZeroAtrapModal('top100'));
    await page.waitForSelector('#bu-dialog-backdrop.open');
    const top100Title = await page.textContent('#bu-dialog-title');
    console.log(`TOP 100 Title: "${top100Title}"`);
    if (!top100Title?.includes('TOP 100')) {
      throw new Error(`Oczekiwano tytułu TOP 100, otrzymano: ${top100Title}`);
    }

    await page.waitForSelector('.bu-rank');
    const rankCount = await page.locator('.bu-rank').count();
    console.log(`Rendered ranking rows: ${rankCount}`);
    if (rankCount < 1) throw new Error('Brak wierszy w rankingu TOP 100.');

    // Verify non-logged in notice
    const contentText = await page.textContent('#bu-dialog-content');
    if (!contentText?.includes('Zaloguj się przez LUMINA')) {
      throw new Error('Brak komunikatu o wymogu logowania przez LUMINA.');
    }
    console.log('Non-logged in notice displayed properly.');

    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    const isOpenAfterEsc = await page.evaluate(() => document.getElementById('bu-dialog-backdrop').classList.contains('open'));
    if (isOpenAfterEsc) throw new Error('Modal TOP 100 nie zamknął się po Escape.');
    console.log('✅ TOP 100 modal Desktop PASSED.');

    // 2. MOBILE TEST (390x844 - iPhone)
    console.log('\n--- 2. MOBILE PLAYWRIGHT TEST (390x844) ---');
    const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await mobilePage.goto(`${baseUrl}/BiblijneUwielbienie?chapter=GEN-001`, { waitUntil: 'domcontentloaded' });
    await mobilePage.waitForTimeout(1000);

    // Open Karaoke on mobile
    await mobilePage.evaluate(() => window.openZeroAtrapModal('karaoke'));
    await mobilePage.waitForSelector('#bu-dialog-backdrop.open');
    const mLineCount = await mobilePage.locator('.bu-line').count();
    console.log(`Mobile karaoke lines: ${mLineCount}`);
    if (mLineCount < 20) throw new Error('Mobile: brak wersów karaoke.');

    await mobilePage.click('#bu-dialog-close');
    await mobilePage.waitForTimeout(300);

    // Open TOP 100 on mobile
    await mobilePage.evaluate(() => window.openZeroAtrapModal('top100'));
    await mobilePage.waitForSelector('#bu-dialog-backdrop.open');
    const mRankCount = await mobilePage.locator('.bu-rank').count();
    console.log(`Mobile TOP 100 ranks: ${mRankCount}`);
    if (mRankCount < 1) throw new Error('Mobile: brak wierszy rankingu.');

    await mobilePage.click('#bu-dialog-close');
    console.log('✅ Mobile tests PASSED.');

    console.log('\n🎯 WSZYSTKIE TESTY PLAYWRIGHT KARAOKE I TOP 100 ZAKOŃCZONE SUKCESEM (100% PASS)');
  } finally {
    await browser.close();
    server.close();
  }
}

run().catch((err) => {
  console.error('BŁĄD TESTU:', err);
  process.exit(1);
});
