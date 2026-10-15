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

    // Test A: Hero Karaoke Stage & GEN-001 Sync Mode
    console.log('Testing Hero Karaoke Stage (GEN-001)...');
    await page.evaluate(() => window.CC_BU_FEATURES.openKaraoke('GEN-001'));
    await page.waitForSelector('#hero-karaoke-stage', { state: 'visible' });

    const stageTitle = await page.textContent('#hero-karaoke-title');
    console.log(`Hero Stage Title: "${stageTitle}"`);
    if (!stageTitle?.includes('Księga Rodzaju') || !stageTitle?.includes('1')) {
      throw new Error(`Niepoprawny tytuł rozdziału: ${stageTitle}`);
    }

    // Check Sync Mode lines
    await page.waitForSelector('#hero-karaoke-lines .bu-line');
    const syncLineCount = await page.locator('#hero-karaoke-lines .bu-line').count();
    console.log(`Rendered synchronized lines for GEN-001: ${syncLineCount}`);
    if (syncLineCount < 50) {
      throw new Error(`Zbyt mało wersów w trybie sync: ${syncLineCount}`);
    }

    // Test B: Switch to Tryb A (Reading Mode)
    console.log('Testing Switch to Tryb A (Reading Mode)...');
    await page.click('#tab-mode-reading');
    await page.waitForTimeout(400);

    const verseRows = await page.locator('#hero-karaoke-lines .hero-karaoke-verse').count();
    console.log(`Rendered Scripture verses for GEN-001 in Tryb A: ${verseRows}`);
    if (verseRows !== 31) {
      throw new Error(`Księga Rodzaju 1 powinna mieć dokładnie 31 wersetów, otrzymano: ${verseRows}`);
    }

    const v1Text = await page.locator('#hero-karaoke-lines .hero-karaoke-verse').first().textContent();
    console.log(`Verse 1: "${v1Text?.trim()}"`);
    if (!v1Text?.includes('Na początku Bóg stworzył niebo i ziemię')) {
      throw new Error(`Niepoprawny tekst wersetu 1: ${v1Text}`);
    }

    // Test C: Font size adjustment
    console.log('Testing Font Size Adjustment...');
    await page.click('#btn-font-larger');
    await page.click('#btn-font-larger');
    const fontSizeStyle = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--bu-font-size'));
    console.log(`Increased font size: ${fontSizeStyle}`);
    if (!fontSizeStyle.includes('24px')) {
      throw new Error(`Oczekiwano powiększenia czcionki do 24px, otrzymano: ${fontSizeStyle}`);
    }

    // Test D: Open Unrecorded Chapter (LEV-001 - Leviticus 1)
    console.log('\nTesting Unrecorded Chapter fallback (LEV-001)...');
    await page.evaluate(() => window.CC_BU_FEATURES.openKaraoke('LEV-001'));
    await page.waitForTimeout(500);

    const levTitle = await page.textContent('#hero-karaoke-title');
    console.log(`Leviticus Title: "${levTitle}"`);
    if (!levTitle?.includes('Księga Kapłańska')) {
      throw new Error(`Oczekiwano Księgi Kapłańskiej, otrzymano: ${levTitle}`);
    }

    const levVerses = await page.locator('#hero-karaoke-lines .hero-karaoke-verse').count();
    console.log(`Leviticus 1 verses in Tryb A: ${levVerses}`);
    if (levVerses !== 17) {
      throw new Error(`Księga Kapłańska 1 powinna mieć 17 wersetów, otrzymano: ${levVerses}`);
    }

    // Ensure Sync Tab is disabled with notice
    const isSyncTabDisabled = await page.evaluate(() => document.getElementById('tab-mode-sync').disabled);
    console.log(`Is Sync Tab disabled for unrecorded chapter? ${isSyncTabDisabled}`);
    if (!isSyncTabDisabled) {
      throw new Error('Przycisk trybu sync powinien być wyłączony dla nienagranego utworu');
    }

    // Test E: Test Proverbs 1 (PRO-001)
    console.log('\nTesting Proverbs 1 (PRO-001)...');
    await page.evaluate(() => window.CC_BU_FEATURES.openKaraoke('PRO-001'));
    await page.waitForTimeout(500);
    const proVerses = await page.locator('#hero-karaoke-lines .hero-karaoke-verse').count();
    console.log(`Proverbs 1 verses in Tryb A: ${proVerses}`);
    if (proVerses !== 33) {
      throw new Error(`Przypowieści 1 powinny mieć 33 wersety, otrzymano: ${proVerses}`);
    }

    // Test F: Close Hero stage via close button
    await page.click('#btn-hero-close');
    await page.waitForTimeout(300);
    const isStageHidden = await page.evaluate(() => document.getElementById('hero-karaoke-stage').style.display === 'none');
    if (!isStageHidden) throw new Error('Scena hero karaoke nie zamknęła się po kliknięciu ✕.');
    console.log('Hero stage closed cleanly.');

    // Test G: Player button btn-player-karaoke displays text directly on hero stage without opening modal window
    console.log('\nTesting btn-player-karaoke toggle (Zero Modal Window)...');
    await page.click('#btn-player-karaoke');
    await page.waitForTimeout(400);
    const isHeroOpenViaBtn = await page.evaluate(() => {
      const stage = document.getElementById('hero-karaoke-stage');
      const dialog = document.getElementById('bu-dialog-backdrop');
      return stage && stage.style.display !== 'none' && (!dialog || !dialog.classList.contains('open'));
    });
    if (!isHeroOpenViaBtn) throw new Error('btn-player-karaoke powinien otwierać scenę HERO bezpośrednio nad odtwarzaczem bez otwierania okna dialogowego.');
    console.log('btn-player-karaoke successfully opened hero stage without opening modal dialog.');

    // Test H: Player button btn-player-top100 triggers direct vote without opening window
    console.log('\nTesting btn-player-top100 direct vote (Zero Modal Window)...');
    await page.click('#btn-player-top100');
    await page.waitForTimeout(300);
    const isDialogStillClosed = await page.evaluate(() => {
      const dialog = document.getElementById('bu-dialog-backdrop');
      const toast = document.getElementById('toast-popup');
      return (!dialog || !dialog.classList.contains('open')) && toast && toast.classList.contains('is-visible');
    });
    if (!isDialogStillClosed) throw new Error('btn-player-top100 powinien oddawać głos / wyświetlać powiadomienie bez otwierania okna dialogowego.');
    console.log('btn-player-top100 successfully triggered vote action with toast without opening modal dialog.');

    // Test I: Check Full Ranking Dialog via window.CC_BU_FEATURES.openRanking()
    console.log('\nTesting Full Ranking Dialog via window.CC_BU_FEATURES.openRanking()...');
    await page.evaluate(() => window.CC_BU_FEATURES.openRanking());
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

    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    // 2. MOBILE TEST (390x844 - iPhone)
    console.log('\n--- 2. MOBILE PLAYWRIGHT TEST (390x844) ---');
    const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await mobilePage.goto(`${baseUrl}/BiblijneUwielbienie?chapter=GEN-001`, { waitUntil: 'domcontentloaded' });
    await mobilePage.waitForTimeout(1000);

    // Open Karaoke on mobile
    await mobilePage.evaluate(() => window.CC_BU_FEATURES.openKaraoke('GEN-001'));
    await mobilePage.waitForSelector('#hero-karaoke-stage', { state: 'visible' });

    // Check lines rendered
    const mLines = await mobilePage.locator('#hero-karaoke-lines .bu-line').count();
    console.log(`Mobile synchronized lines: ${mLines}`);
    if (mLines < 50) throw new Error('Mobile: brak linii karaoke.');

    // Switch to reading on mobile
    await mobilePage.click('#tab-mode-reading');
    await mobilePage.waitForTimeout(300);
    const mVerses = await mobilePage.locator('#hero-karaoke-lines .hero-karaoke-verse').count();
    console.log(`Mobile reading verses: ${mVerses}`);
    if (mVerses !== 31) throw new Error(`Mobile: oczekiwano 31 wersetów, otrzymano ${mVerses}`);

    await mobilePage.click('#btn-hero-close');
    console.log('✅ Mobile tests PASSED.');

    // 3. KARAOKE SYNC STUDIO TEST
    console.log('\n--- 3. KARAOKE SYNC STUDIO TEST (karaoke-studio.html) ---');
    const studioPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await studioPage.goto(`${baseUrl}/karaoke-studio.html`, { waitUntil: 'domcontentloaded' });
    await studioPage.waitForTimeout(1000);

    const kpiSongs = await studioPage.locator('#kpi-total-songs').textContent();
    console.log(`Studio KPI songs: ${kpiSongs}`);
    if (kpiSongs.trim() !== '38') throw new Error(`Oczekiwano 38 utworów, otrzymano ${kpiSongs}`);

    const tableRows = await studioPage.locator('#catalog-tbody tr').count();
    console.log(`Studio catalog rows: ${tableRows}`);
    if (tableRows !== 38) throw new Error(`Oczekiwano 38 wierszy tabeli, otrzymano ${tableRows}`);

    const inspectorTitle = await studioPage.locator('#inspector-title').textContent();
    console.log(`Inspector title: ${inspectorTitle}`);
    if (!inspectorTitle.includes('GEN-001')) throw new Error('Inspector nie załadował GEN-001 domyślnie');

    const timelineCount = await studioPage.locator('#inspector-view-timeline .timeline-item').count();
    console.log(`Inspector timeline items: ${timelineCount}`);
    if (timelineCount < 100) throw new Error(`Oczekiwano przynajmniej 100 linii na osi czasu, otrzymano ${timelineCount}`);

    console.log('✅ Karaoke Sync Studio tests PASSED.');

    console.log('\n🎯 WSZYSTKIE TESTY PLAYWRIGHT KARAOKE, TEKSTU UBG 2025, TOP 100 ORAZ KARAOKE SYNC STUDIO ZAKOŃCZONE SUKCESEM (100% PASS)');
  } finally {
    await browser.close();
    server.close();
  }
}

run().catch((err) => {
  console.error('BŁĄD TESTU:', err);
  process.exit(1);
});
