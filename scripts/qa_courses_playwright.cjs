const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/node_modules/playwright');

const rootDir = path.resolve(__dirname, '..');
const artifactsDir = 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\6171dbb4-faed-472d-ab3b-0ab4afdc2e53';

function createStaticServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const parsedUrl = new URL(req.url, 'http://127.0.0.1');
      let pathname = decodeURIComponent(parsedUrl.pathname);
      if (pathname === '/' || pathname === '' || pathname === '/kursy') pathname = '/kursy.html';
      const filePath = path.join(rootDir, pathname.replace(/^\//, ''));
      fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          return res.end('Not found: ' + pathname);
        }
        const ext = path.extname(filePath).toLowerCase();
        const mimeTypes = {
          '.html': 'text/html; charset=utf-8',
          '.js': 'application/javascript; charset=utf-8',
          '.mjs': 'application/javascript; charset=utf-8',
          '.css': 'text/css; charset=utf-8',
          '.json': 'application/json; charset=utf-8',
          '.png': 'image/png',
          '.jpg': 'image/jpeg',
          '.svg': 'image/svg+xml'
        };
        res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
        fs.createReadStream(filePath).pipe(res);
      });
    });
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      resolve({ server, port, baseUrl: `http://127.0.0.1:${port}` });
    });
  });
}

async function runQA() {
  console.log('=== LUMINA BIBLE ACADEMY — PLAYWRIGHT E2E QA (Phase 2) ===\n');
  const { server, port, baseUrl } = await createStaticServer();
  console.log(`Serwer testowy aktywny: ${baseUrl}`);

  const browser = await chromium.launch({ headless: true });
  const results = [];

  try {
    // ── 1. DESKTOP TEST (1280x800) ──
    const desktopContext = await browser.newContext({
      viewport: { width: 1280, height: 800 }
    });
    const desktopPage = await desktopContext.newPage();

    // Mock Web Speech API so it functions headlessly
    await desktopPage.addInitScript(() => {
      window.speechSynthesis = {
        speak: (u) => { setTimeout(() => u.onstart && u.onstart(), 10); },
        pause: () => {},
        resume: () => {},
        cancel: () => {}
      };
      window.SpeechSynthesisUtterance = function(text) {
        this.text = text;
        this.onstart = null;
        this.onpause = null;
        this.onresume = null;
        this.onend = null;
        this.onerror = null;
      };
    });

    console.log('[QA] 1. Nawigacja do /kursy.html na Desktop...');
    await desktopPage.goto(`${baseUrl}/kursy.html`, { waitUntil: 'domcontentloaded' });
    await desktopPage.waitForTimeout(600);

    const heroTitle = await desktopPage.$eval('h1', el => el.textContent.trim());
    const heroSubtitle = await desktopPage.$eval('h1 + p', el => el.textContent.trim());
    const cardsCount = await desktopPage.$$eval('.lesson-card', els => els.length);
    const stageTabsCount = await desktopPage.$$eval('.stage-tab-btn', els => els.length);

    console.log(`     H1: "${heroTitle}"`);
    console.log(`     Liczba kart lekcji w siatce: ${cardsCount} (oczekiwano: 28)`);
    console.log(`     Liczba zakładek etapów: ${stageTabsCount} (oczekiwano: 6: Wszystkie + 5 etapów)`);

    results.push({
      test: 'Desktop Hero & 28 Cards Grid',
      pass: heroTitle.includes('LUMINA BIBLE ACADEMY') && cardsCount === 28 && stageTabsCount === 6
    });

    // Zapisz screenshot desktop
    const desktopShotPath = path.join(artifactsDir, 'lumina_kursy_desktop.png');
    await desktopPage.screenshot({ path: desktopShotPath, fullPage: false });
    console.log(`     Zapisano zrzut ekranu Desktop: ${desktopShotPath}`);

    // ── 2. MOBILE TEST (390x844 — iPhone 12/13/14) ──
    console.log('\n[QA] 2. Test Mobile Viewport (390x844)...');
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true
    });
    const mobilePage = await mobileContext.newPage();

    await mobilePage.addInitScript(() => {
      window.speechSynthesis = {
        speak: (u) => { setTimeout(() => u.onstart && u.onstart(), 10); },
        pause: () => {},
        resume: () => {},
        cancel: () => {}
      };
      window.SpeechSynthesisUtterance = function(text) {
        this.text = text;
      };
    });

    await mobilePage.goto(`${baseUrl}/kursy.html`, { waitUntil: 'domcontentloaded' });
    await mobilePage.waitForTimeout(500);

    // Sprawdź brak horizontal overflow
    const hasHorizontalScroll = await mobilePage.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    console.log(`     Horizontal scroll obecny na 390px: ${hasHorizontalScroll} (oczekiwano: false)`);
    results.push({ test: 'Brak poziomego scrolla na mobile 390px', pass: !hasHorizontalScroll });

    // ── 3. TEST COURSE ENGINE: OTWARCIE LEKCJI 1 ──
    console.log('\n[QA] 3. Otwarcie Lekcji 1 (Pismo Święte) w Course Engine...');
    await mobilePage.click('.lesson-card[data-lesson-id="1"]');
    await mobilePage.waitForTimeout(400);

    const readerVisible = await mobilePage.$eval('#lesson-reader-modal', el => !el.classList.contains('hidden'));
    const readerTitle = await mobilePage.$eval('#reader-title', el => el.textContent.trim());
    const readerStage = await mobilePage.$eval('#reader-subtitle', el => el.textContent.trim());
    const hasBibleQuote = await mobilePage.$$eval('.reader-bible-quote', els => els.length > 0);
    const hasTTS = await mobilePage.$eval('#tts-btn-play', el => el !== null);

    console.log(`     Czytnik widoczny: ${readerVisible}`);
    console.log(`     Tytuł w czytniku: "${readerTitle}"`);
    console.log(`     Podtytuł etapu: "${readerStage}"`);
    console.log(`     Sekcja Biblijna zawiera cytaty: ${hasBibleQuote}`);
    console.log(`     Kontroler TTS obecny: ${hasTTS}`);

    results.push({
      test: 'Course Engine Reader (Lekcja 1)',
      pass: readerVisible && readerTitle === 'Pismo Święte' && hasBibleQuote && hasTTS
    });

    // Test interakcji: Oznaczenie jako ukończona
    await mobilePage.click('#btn-complete-lesson');
    await mobilePage.waitForTimeout(200);
    const completeBtnText = await mobilePage.$eval('#btn-complete-lesson', el => el.textContent.trim());
    console.log(`     Przycisk ukończenia po kliknięciu: "${completeBtnText}"`);

    // Zapisz screenshot mobile z otwartym czytnikiem lekcji
    const mobileShotPath = path.join(artifactsDir, 'lumina_kursy_mobile_390px.png');
    await mobilePage.screenshot({ path: mobileShotPath, fullPage: false });
    console.log(`     Zapisano zrzut ekranu Mobile 390px: ${mobileShotPath}`);

    // Zamknięcie czytnika
    await mobilePage.click('#reader-close-btn');
    await mobilePage.waitForTimeout(300);
    const isClosed = await mobilePage.$eval('#lesson-reader-modal', el => el.classList.contains('hidden'));
    console.log(`     Czytnik zamknięty poprawnie: ${isClosed}`);
    results.push({ test: 'Zamykanie czytnika lekcji', pass: isClosed });

    // ── 4. TEST LEKCJI KONTROLNYCH: 12 (Kościół Boży), 20 (Szabat), 28 (Nowa Ziemia) ──
    console.log('\n[QA] 4. Testy lekcji kontrolnych (12, 20, 28)...');
    
    // Lekcja 12: Kościół Boży
    await mobilePage.click('.lesson-card[data-lesson-id="12"]');
    await mobilePage.waitForTimeout(300);
    const l12Title = await mobilePage.$eval('#reader-title', el => el.textContent.trim());
    const l12Stage = await mobilePage.$eval('.reader-badge-gold', el => el.textContent.trim());
    console.log(`     Lekcja 12: "${l12Title}" (Etap: ${l12Stage})`);
    results.push({ test: 'Lekcja 12 (Kościół Boży - Etap III)', pass: l12Title === 'Kościół Boży' && l12Stage.includes('KOŚCIÓŁ BOŻY') });
    await mobilePage.click('#reader-close-btn');
    await mobilePage.waitForTimeout(200);

    // Lekcja 20: Szabat
    await mobilePage.click('.lesson-card[data-lesson-id="20"]');
    await mobilePage.waitForTimeout(300);
    const l20Title = await mobilePage.$eval('#reader-title', el => el.textContent.trim());
    const l20Stage = await mobilePage.$eval('.reader-badge-gold', el => el.textContent.trim());
    console.log(`     Lekcja 20: "${l20Title}" (Etap: ${l20Stage})`);
    results.push({ test: 'Lekcja 20 (Szabat - Etap IV)', pass: l20Title === 'Szabat' && l20Stage.includes('ŻYJ SŁOWEM') });
    await mobilePage.click('#reader-close-btn');
    await mobilePage.waitForTimeout(200);

    // Lekcja 28: Nowa Ziemia
    await mobilePage.click('.lesson-card[data-lesson-id="28"]');
    await mobilePage.waitForTimeout(300);
    const l28Title = await mobilePage.$eval('#reader-title', el => el.textContent.trim());
    const l28Stage = await mobilePage.$eval('.reader-badge-gold', el => el.textContent.trim());
    console.log(`     Lekcja 28: "${l28Title}" (Etap: ${l28Stage})`);
    results.push({ test: 'Lekcja 28 (Nowa Ziemia - Etap V)', pass: l28Title === 'Nowa Ziemia' && l28Stage.includes('NADZIEJA') });
    await mobilePage.click('#reader-close-btn');
    await mobilePage.waitForTimeout(200);

    // ── 5. TEST DEEP LINK (?lekcja=20-szabat) NA ŚWIEŻEJ SESJI ──
    console.log('\n[QA] 5. Test Deep Link na świeżej stronie (?lekcja=20-szabat)...');
    const deepLinkPage = await desktopContext.newPage();
    await deepLinkPage.goto(`${baseUrl}/kursy.html?lekcja=20-szabat`, { waitUntil: 'domcontentloaded' });
    await deepLinkPage.waitForTimeout(500);

    const deepReaderOpen = await deepLinkPage.$eval('#lesson-reader-modal', el => !el.classList.contains('hidden'));
    const deepReaderTitle = await deepLinkPage.$eval('#reader-title', el => el.textContent.trim());
    console.log(`     Czytnik otwarty z Deep Link: ${deepReaderOpen}`);
    console.log(`     Tytuł lekcji z Deep Link: "${deepReaderTitle}"`);
    results.push({
      test: 'Deep Link (?lekcja=20-szabat) auto-open',
      pass: deepReaderOpen && deepReaderTitle === 'Szabat'
    });

  } finally {
    await browser.close();
    server.close();
  }

  console.log('\n=== PODSUMOWANIE MANUALNEGO / AUTOMATYCZNEGO QA PHASE 2 ===');
  let allPass = true;
  results.forEach(r => {
    console.log(`[${r.pass ? 'PASS' : 'FAIL'}] ${r.test}`);
    if (!r.pass) allPass = false;
  });

  if (allPass) {
    console.log('\n✅ WSZYSTKIE SCENARIUSZE QA PHASE 2 ZALICZONE W 100%!');
    process.exit(0);
  } else {
    console.error('\n❌ QA ZAKOŃCZONE BŁĘDEM!');
    process.exit(1);
  }
}

runQA();
