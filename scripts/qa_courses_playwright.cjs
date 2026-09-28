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
      
      let filePath = path.join(rootDir, pathname.replace(/^\//, ''));
      if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, 'index.html');
      } else if (!fs.existsSync(filePath) && fs.existsSync(filePath + '.html')) {
        filePath = filePath + '.html';
      }

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
  console.log('=== LUMINA BIBLE ACADEMY — PLAYWRIGHT E2E QA (DEDICATED SUBPAGES) ===\n');
  const { server, port, baseUrl } = await createStaticServer();
  console.log(`Serwer testowy aktywny: ${baseUrl}`);

  const browser = await chromium.launch({ headless: true });
  const results = [];

  try {
    // ── 1. DESKTOP TEST: KATALOG KURSU (/kursy.html) ──
    const desktopContext = await browser.newContext({
      viewport: { width: 1280, height: 800 }
    });
    const desktopPage = await desktopContext.newPage();

    console.log('[QA] 1. Nawigacja do /kursy na Desktop...');
    await desktopPage.goto(`${baseUrl}/kursy.html`, { waitUntil: 'domcontentloaded' });
    await desktopPage.waitForTimeout(600);

    const heroTitle = await desktopPage.$eval('h1', el => el.textContent.trim());
    const cardsCount = await desktopPage.$$eval('.lesson-card', els => els.length);
    const stageFiltersCount = await desktopPage.$$eval('[data-stage-filter]', els => els.length);

    console.log(`     H1: "${heroTitle}"`);
    console.log(`     Liczba odkrytych lekcji: ${cardsCount} (oczekiwano: 1)`);
    console.log(`     Liczba filtrów etapów: ${stageFiltersCount} (oczekiwano: 6)`);

    results.push({
      test: 'Desktop Hero & pierwsza odkryta lekcja na /kursy',
      pass: heroTitle.includes('LUMINA BIBLE ACADEMY') && cardsCount === 1 && stageFiltersCount === 6
    });

    const desktopShotPath = path.join(artifactsDir, 'lumina_kursy_catalog_desktop.png');
    await desktopPage.screenshot({ path: desktopShotPath, fullPage: false });

    // ── 2. MOBILE TEST (390x844 — iPhone 12/13/14) ──
    console.log('\n[QA] 2. Test Mobile Viewport na /kursy...');
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true
    });
    const mobilePage = await mobileContext.newPage();

    await mobilePage.goto(`${baseUrl}/kursy.html`, { waitUntil: 'domcontentloaded' });
    await mobilePage.waitForTimeout(500);

    const hasHorizontalScroll = await mobilePage.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    console.log(`     Brak poziomego scrolla na mobile: ${!hasHorizontalScroll}`);
    results.push({ test: 'Brak poziomego scrolla na mobile 390px', pass: !hasHorizontalScroll });

    await mobilePage.goto(`${baseUrl}/kursy/01-pismo-swiete`, { waitUntil: 'domcontentloaded' });
    await mobilePage.waitForTimeout(500);
    const mobileLessonHeader = await mobilePage.evaluate(() => {
      const header = document.querySelector('.cin-topbar');
      const auth = document.querySelector('#cc-auth-nav-container');
      const main = document.querySelector('.cin-topbar-main');
      const mainBox = main.getBoundingClientRect();
      const authBox = auth.getBoundingClientRect();
      return getComputedStyle(header).display === 'grid'
        && auth?.parentElement === header
        && mainBox.right <= authBox.left + 1
        && authBox.right <= window.innerWidth
        && document.documentElement.scrollWidth <= document.documentElement.clientWidth;
    });
    results.push({ test: 'Nagłówek lekcji układa przyciski bez poziomego przewijania na mobile', pass: mobileLessonHeader });

    // ── 3. TEST DEDYKOWANEJ PODSTRONY LEKCJI 1 (/kursy/01-pismo-swiete) ──
    console.log('\n[QA] 3. Otwarcie dedykowanej podstrony Lekcji 1 (/kursy/01-pismo-swiete)...');
    const lessonPage = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    
    // Mock Web Speech API
    await lessonPage.addInitScript(() => {
      window.speechSynthesis = {
        speak: (u) => { setTimeout(() => u.onstart && u.onstart(), 10); },
        pause: () => {},
        resume: () => {},
        cancel: () => {},
        getVoices: () => [{ lang: 'pl-PL', name: 'Zofia' }]
      };
      window.SpeechSynthesisUtterance = function(text) {
        this.text = text;
      };
    });

    await lessonPage.goto(`${baseUrl}/kursy/01-pismo-swiete`, { waitUntil: 'domcontentloaded' });
    await lessonPage.waitForTimeout(500);

    const subpageTitle = await lessonPage.$eval('h1', el => el.textContent.trim());
    const hasBackLink = await lessonPage.$eval('.cin-back-link', el => el.getAttribute('href') !== null);
    const hasReadingProgressBar = await lessonPage.$eval('#lesson-reading-progress', el => el !== null);
    const hasTTS = await lessonPage.$eval('#tts-btn-play', el => el !== null);
    const hasScripture = await lessonPage.$$eval('.reader-scripture-quote', els => els.length > 0);
    const hasQuiz = await lessonPage.$$eval('.quiz-card', els => els.length > 0);
    const hasJournal = await lessonPage.$eval('#journal-discovery', el => el !== null);
    const hasCompleteBtn = await lessonPage.$eval('#btn-complete-lesson', el => el !== null);
    const nextHiddenBeforeCompletion = await lessonPage.$eval('.cin-nav-next', el => getComputedStyle(el).display === 'none');
    const academyLogoLoaded = await lessonPage.$eval('.cin-logo-mark img', el =>
      el.complete && el.naturalWidth > 0 && el.currentSrc.includes('lumina_star_dark_header_20260928.png'));
    const desktopLessonHeader = await lessonPage.evaluate(() => {
      const header = document.querySelector('.cin-topbar');
      const auth = document.querySelector('#cc-auth-nav-container');
      return getComputedStyle(header).display === 'grid' && auth?.parentElement === header;
    });

    console.log(`     Tytuł podstrony: "${subpageTitle}"`);
    console.log(`     Link powrotny do Mojej drogi: ${hasBackLink}`);
    console.log(`     Pasek postępu czytania: ${hasReadingProgressBar}`);
    console.log(`     Kontroler lektora TTS: ${hasTTS}`);
    console.log(`     Cytaty Pisma Świętego: ${hasScripture}`);
    console.log(`     Interaktywny Quiz Utwierdzający: ${hasQuiz}`);
    console.log(`     Mój Dziennik Drogi (Autosave): ${hasJournal}`);
    console.log(`     Przycisk ukończenia lekcji: ${hasCompleteBtn}`);
    console.log(`     Następna lekcja ukryta przed ukończeniem: ${nextHiddenBeforeCompletion}`);

    results.push({
      test: 'Dedykowana podstrona Lekcji 1 (14 sekcji formacyjnych)',
      pass: subpageTitle === 'Pismo Święte' && hasBackLink && hasReadingProgressBar && hasTTS && hasScripture && hasQuiz && hasJournal && hasCompleteBtn && nextHiddenBeforeCompletion && desktopLessonHeader && academyLogoLoaded
    });

    await lessonPage.screenshot({ path: path.join(artifactsDir, 'lumina_lesson_01_header_preview.png'), fullPage: false });

    // Test interakcji: kliknięcie Ukończ Tę Lekcję
    await lessonPage.click('#btn-complete-lesson');
    await lessonPage.waitForTimeout(200);
    const completedBtnText = await lessonPage.$eval('#btn-complete-lesson', el => el.textContent.trim());
    const nextVisibleAfterCompletion = await lessonPage.$eval('.cin-nav-next', el => getComputedStyle(el).display !== 'none');
    console.log(`     Stan przycisku po ukończeniu: "${completedBtnText}"`);
    results.push({
      test: 'Interakcja ukończenia lekcji (Zapis stanu)',
      pass: completedBtnText.includes('Lekcja Ukończona') && nextVisibleAfterCompletion
    });

    // Zrzut ekranu dedykowanej podstrony
    const subpageShotPath = path.join(artifactsDir, 'lumina_lesson_01_subpage.png');
    await lessonPage.screenshot({ path: subpageShotPath, fullPage: false });
    console.log(`     Zapisano zrzut ekranu dedykowanej podstrony: ${subpageShotPath}`);

    // ── 4. AUDYT WSZYSTKICH 28 DEDYKOWANYCH PODSTRON (HTTP 200 + BRAK "EKUMENICZNY") ──
    console.log('\n[QA] 4. Audyt integralności wszystkich 28 dedykowanych podstron...');
    const { LUMINA_COURSES_CORE_28 } = await import('../data/lumina-courses-data.js');

    let all28Pass = true;
    let ekumenicznyCount = 0;

    for (const l of LUMINA_COURSES_CORE_28) {
      const resp = await lessonPage.goto(`${baseUrl}/kursy/${l.slug}`, { waitUntil: 'domcontentloaded' });
      if (resp.status() !== 200) {
        console.error(`     [FAIL] Lekcja ${l.id} (${l.slug}) zwróciła HTTP ${resp.status()}`);
        all28Pass = false;
      }
      const pageText = await lessonPage.content();
      if (/ekumeniczn/i.test(pageText)) {
        console.error(`     [FAIL] Lekcja ${l.id} zawiera słowo "ekumeniczny"!`);
        ekumenicznyCount++;
      }
    }

    console.log(`     Wszystkie 28 podstron zwraca HTTP 200: ${all28Pass}`);
    console.log(`     Liczba wystąpień słowa "ekumeniczny" na wszystkich 28 stronach: ${ekumenicznyCount} (oczekiwano: 0)`);

    results.push({
      test: 'Komplet 28 dedykowanych podstron lekcji HTTP 200',
      pass: all28Pass
    });

    results.push({
      test: 'Zero wystąpień słowa "ekumeniczny" na podstronach',
      pass: ekumenicznyCount === 0
    });

    // ── 5. SPRAWDZENIE STRONY CERTYFIKATU I KATALOGU NA SŁOWO "EKUMENICZNY" ──
    console.log('\n[QA] 5. Weryfikacja katalogu i certyfikatu na brak słowa "ekumeniczny"...');
    await desktopPage.goto(`${baseUrl}/kursy.html`, { waitUntil: 'domcontentloaded' });
    const catalogHtml = await desktopPage.content();
    const catalogHasEkumeniczny = /ekumeniczn/i.test(catalogHtml);

    await desktopPage.goto(`${baseUrl}/certyfikat.html`, { waitUntil: 'domcontentloaded' });
    const certHtml = await desktopPage.content();
    const certHasEkumeniczny = /ekumeniczn/i.test(certHtml);

    console.log(`     Katalog kursów wolny od "ekumeniczny": ${!catalogHasEkumeniczny}`);
    console.log(`     Certyfikat ukończenia wolny od "ekumeniczny": ${!certHasEkumeniczny}`);

    results.push({
      test: 'Całkowite usunięcie słowa "ekumeniczny" z kursy.html i certyfikat.html',
      pass: !catalogHasEkumeniczny && !certHasEkumeniczny
    });

  } catch (err) {
    console.error('Błąd podczas wykonywania testów QA:', err);
    results.push({ test: 'Brak nieoczekiwanych wyjątków', pass: false });
  } finally {
    await browser.close();
    server.close();
  }

  console.log('\n=== PODSUMOWANIE QA LUMINA BIBLE ACADEMY ===');
  let allPass = true;
  results.forEach(r => {
    console.log(`[${r.pass ? 'PASS' : 'FAIL'}] ${r.test}`);
    if (!r.pass) allPass = false;
  });

  if (allPass) {
    console.log('\n✨ WSZYSTKIE TESTY ZAKOŃCZONE PEŁNYM SUKCESEM (100% PASS)!');
    process.exit(0);
  } else {
    console.error('\n❌ QA ZAKOŃCZONE BŁĘDEM!');
    process.exit(1);
  }
}

runQA();
