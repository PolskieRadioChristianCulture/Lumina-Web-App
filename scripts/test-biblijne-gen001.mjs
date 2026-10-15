import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

// Prosty serwer statyczny do testów Playwright
function startServer() {
  const server = http.createServer((req, res) => {
    let reqPath = req.url.split('?')[0];
    if (reqPath === '/' || reqPath === '/BiblijneUwielbienie' || reqPath === '/biblijne-uwielbienie') {
      reqPath = '/biblijne-uwielbienie.html';
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
    // 1. Desktop test (1440x900)
    console.log('\n--- 1. DESKTOP TEST (1440x900) ---');
    const desktopPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await desktopPage.goto(`${baseUrl}/BiblijneUwielbienie?chapter=GEN-001`, { waitUntil: 'domcontentloaded' });
    await desktopPage.waitForTimeout(1000);

    // Verify track title and chapter
    const currentTitle = await desktopPage.textContent('#player-track-title');
    console.log(`Current track title: "${currentTitle?.trim()}"`);
    if (!currentTitle?.includes('Na początku Bóg stworzył niebo i ziemię')) {
      throw new Error(`Oczekiwano tytułu 'Na początku Bóg stworzył niebo i ziemię', otrzymano: ${currentTitle}`);
    }

    const currentSub = await desktopPage.textContent('#player-track-subtitle');
    console.log(`Current track subtitle: "${currentSub?.trim()}"`);
    if (!currentSub?.includes('GEN-001')) {
      throw new Error(`Oczekiwano chapterId 'GEN-001', otrzymano: ${currentSub}`);
    }

    // Verify status badge
    const statusBadge = await desktopPage.textContent('#player-status-tag');
    console.log(`Status badge: "${statusBadge?.trim()}"`);
    if (!statusBadge?.includes('DO WERYFIKACJI')) {
      throw new Error(`Oczekiwano statusu 'DO WERYFIKACJI', otrzymano: ${statusBadge}`);
    }

    // Verify patron module binding
    const patronHeader = await desktopPage.textContent('#player-patron-module');
    if (!patronHeader?.includes('Zostań patronem tego rozdziału')) {
      throw new Error('Moduł patrona nie został odnaleziony w odtwarzaczu');
    }

    // Toggle patron module and check reference code
    await desktopPage.click('#player-patron-toggle');
    await desktopPage.waitForTimeout(300);
    const refText = await desktopPage.textContent('#player-patron-chapter-id');
    console.log(`Patron module expanded. Transfer reference: "${refText?.trim()}"`);
    if (!refText?.includes('Biblia Śpiewana / GEN-001')) {
      throw new Error(`Oczekiwano tytułu przelewu 'Biblia Śpiewana / GEN-001', otrzymano: ${refText}`);
    }
    console.log('✅ Desktop test PASSED.');

    // 2. Mobile test (390x844 - iPhone 14)
    console.log('\n--- 2. MOBILE TEST (390x844) ---');
    const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await mobilePage.goto(`${baseUrl}/BiblijneUwielbienie?chapter=GEN-001`, { waitUntil: 'domcontentloaded' });
    await mobilePage.waitForTimeout(1000);

    const mobileTitle = await mobilePage.textContent('#player-track-title');
    console.log(`Mobile track title: "${mobileTitle?.trim()}"`);
    if (!mobileTitle?.includes('Na początku Bóg stworzył niebo i ziemię')) {
      throw new Error(`Mobile: Oczekiwano tytułu 'Na początku Bóg stworzył niebo i ziemię', otrzymano: ${mobileTitle}`);
    }

    // Test favorite button toggle
    const favBtn = await mobilePage.$('#btn-favorite');
    if (favBtn) {
      await favBtn.click();
      await mobilePage.waitForTimeout(200);
      const isFav = await mobilePage.evaluate(() => {
        const btn = document.getElementById('btn-favorite');
        return btn?.classList.contains('text-amber-400') || btn?.getAttribute('aria-pressed') === 'true';
      });
      console.log(`Favorite toggled: ${isFav ? 'ACTIVE (amber/pressed)' : 'inactive'}`);
    }

    // Test library book drilldown for Genesis
    console.log('\n--- 3. LIBRARY DRILLDOWN TEST ---');
    await desktopPage.evaluate(() => openBookDrillDown('GEN'));
    await desktopPage.waitForTimeout(500);

    const drilldownTitle = await desktopPage.textContent('#drilldown-book-title');
    console.log(`Drilldown modal opened for: "${drilldownTitle?.trim()}"`);
    if (!drilldownTitle?.includes('Księga Rodzaju')) {
      throw new Error(`Oczekiwano drilldown dla Księgi Rodzaju, otrzymano: ${drilldownTitle}`);
    }

    const chap1Card = await desktopPage.textContent('#chapter-card-GEN-001');
    console.log(`Chapter 1 card content: "${chap1Card?.trim()}"`);
    if (!chap1Card?.includes('Rozdział 1') || !chap1Card?.includes('Do weryfikacji')) {
      throw new Error('Rozdział 1 nie zawiera oznaczenia "Do weryfikacji" w widoku Księgi');
    }
    console.log('✅ Library drilldown PASSED (Rozdział 1 widoczny jako dostępny z oznaczeniem "Do weryfikacji").');

    console.log('\n🎯 WSZYSTKIE TESTY PLAYWRIGHT ZAKOŃCZONE SUKCESEM (100% PASS)');
  } finally {
    await browser.close();
    server.close();
  }
}

run().catch((err) => {
  console.error('BŁĄD TESTU:', err);
  process.exit(1);
});
