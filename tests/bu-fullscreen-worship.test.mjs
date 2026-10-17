import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

function createStaticServer() {
  return http.createServer((req, res) => {
    let reqPath = req.url.split('?')[0];
    if (reqPath === '/' || reqPath === '/BiblijneUwielbienie') reqPath = '/biblijne-uwielbienie.html';
    
    const filePath = path.join(process.cwd(), reqPath.replace(/^\//, ''));
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath);
      const mimeMap = {
        '.html': 'text/html; charset=utf-8',
        '.js': 'application/javascript; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.json': 'application/json; charset=utf-8',
        '.webp': 'image/webp',
        '.jpg': 'image/jpeg',
        '.png': 'image/png',
        '.svg': 'image/svg+xml'
      };
      res.writeHead(200, { 'Content-Type': mimeMap[ext] || 'application/octet-stream' });
      fs.createReadStream(filePath).pipe(res);
    } else {
      res.writeHead(404);
      res.end('Not found');
    }
  });
}

test('BU Fullscreen Worship Mode: 1. Assets integrity & files existence', () => {
  const imgDir = path.join(process.cwd(), 'images', 'biblijne-uwielbienie');
  assert.ok(fs.existsSync(path.join(imgDir, 'worship-cross-fullscreen.webp')), 'worship-cross-fullscreen.webp musi istnieć');
  assert.ok(fs.existsSync(path.join(imgDir, 'worship-cross-fullscreen.jpg')), 'worship-cross-fullscreen.jpg musi istnieć');

  const webpSize = fs.statSync(path.join(imgDir, 'worship-cross-fullscreen.webp')).size;
  assert.ok(webpSize > 20000 && webpSize < 500000, `Rozmiar webp optymalny: ${webpSize} B`);
});

test('BU Fullscreen Worship Mode: 2. Playwright Live Interaction & Zero Regression Test', async () => {
  const server = createStaticServer();
  await new Promise(r => server.listen(0, r));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/BiblijneUwielbienie?chapter=GEN-001`;

  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // 1. Sprawdzenie domyślnie zamkniętego panelu i przycisku ptaszek (Accordion)
    const initialAccordionState = await page.evaluate(() => {
      const stage = document.getElementById('hero-karaoke-stage');
      const accordionBtn = document.getElementById('btn-hero-accordion-toggle');
      const stageDisplay = stage ? window.getComputedStyle(stage).display : null;
      const isExpanded = accordionBtn?.getAttribute('aria-expanded') === 'true';
      const chevron = document.getElementById('accordion-chevron-icon');
      return {
        hasAccordionBtn: Boolean(accordionBtn),
        stageDisplay,
        isExpanded,
        hasChevron: Boolean(chevron)
      };
    });

    assert.equal(initialAccordionState.hasAccordionBtn, true, 'Przycisk rozsuwający (ptaszek) btn-hero-accordion-toggle istnieje');
    assert.equal(initialAccordionState.stageDisplay, 'none', 'Domyślnie schowany panel tekstu i karaoke (display: none)');
    assert.equal(initialAccordionState.isExpanded, false, 'Domyślnie aria-expanded jest false');

    // Test rozsuwania i zamykania panelu ptaszkiem
    await page.click('#btn-hero-accordion-toggle');
    await page.waitForTimeout(300);

    const expandedState = await page.evaluate(() => {
      const stage = document.getElementById('hero-karaoke-stage');
      const accordionBtn = document.getElementById('btn-hero-accordion-toggle');
      return {
        stageDisplay: stage ? window.getComputedStyle(stage).display : null,
        isExpanded: accordionBtn?.getAttribute('aria-expanded') === 'true'
      };
    });
    assert.equal(expandedState.stageDisplay, 'block', 'Kliknięcie ptaszka rozsuwa panel (display: block)');
    assert.equal(expandedState.isExpanded, true, 'aria-expanded staje się true');

    // Test zwijania przyciskiem w topbarze
    await page.click('#btn-hero-topbar-collapse');
    await page.waitForTimeout(300);

    const collapsedState = await page.evaluate(() => {
      const stage = document.getElementById('hero-karaoke-stage');
      return stage ? window.getComputedStyle(stage).display : null;
    });
    assert.equal(collapsedState, 'none', 'Kliknięcie ptaszka w topbarze zamyka panel (display: none)');

    // 1b. Test natychmiastowej zmiany stanu przycisku Play / Stop
    const playBtnStateBefore = await page.evaluate(() => {
      const btn = document.getElementById('master-play-btn');
      return btn?.classList.contains('is-playing');
    });
    assert.equal(playBtnStateBefore, false, 'Początkowo przycisk play nie ma klasy is-playing');

    await page.click('#master-play-btn');
    await page.waitForTimeout(100);

    const playBtnStateAfter = await page.evaluate(() => {
      const btn = document.getElementById('master-play-btn');
      return btn?.classList.contains('is-playing');
    });
    assert.equal(playBtnStateAfter, true, 'Wciśnięcie Play natychmiast zmienia przycisk na is-playing (Pauza/Stop)');

    await page.click('#master-play-btn');
    await page.waitForTimeout(100);

    const playBtnStatePaused = await page.evaluate(() => {
      const btn = document.getElementById('master-play-btn');
      return btn?.classList.contains('is-playing');
    });
    assert.equal(playBtnStatePaused, false, 'Ponowne wciśnięcie przywraca ikonę Odtwórz');

    // 1c. Sprawdzenie stanu standardowego i przycisku w prawym górnym rogu (po rozwinięciu panelu)
    await page.click('#btn-hero-accordion-toggle');
    await page.waitForTimeout(200);

    const standardState = await page.evaluate(() => {
      const stage = document.getElementById('hero-karaoke-stage');
      const backdrop = document.getElementById('hero-karaoke-backdrop');
      const toggleBtn = document.getElementById('btn-hero-panel-toggle');
      const dropdown = document.getElementById('hero-karaoke-panel-dropdown');
      const fsBtn = document.getElementById('bu-mode-fullscreen-btn');
      const dimmer = document.getElementById('bu-worship-dimmer');
      const textBar = document.getElementById('bu-text-mode-bar');
      const playerKaraokeBtn = document.getElementById('btn-player-karaoke');
      const isFs = stage?.classList.contains('is-fullscreen');
      const bdDisplay = backdrop ? window.getComputedStyle(backdrop).display : null;
      const isDropdownOpen = dropdown?.classList.contains('is-open');
      const textBarBtnCount = textBar ? textBar.querySelectorAll('button').length : 0;
      
      const rect = toggleBtn?.getBoundingClientRect();
      const toggleSizeOk = rect ? (rect.width >= 40 && rect.height >= 40) : false;

      return {
        isFs,
        bdDisplay,
        hasToggleBtn: Boolean(toggleBtn),
        toggleSizeOk,
        hasFsBtn: Boolean(fsBtn),
        hasDimmer: Boolean(dimmer),
        hasPlayerKaraokeBtn: Boolean(playerKaraokeBtn),
        isDropdownOpen,
        textBarBtnCount
      };
    });

    assert.equal(standardState.isFs, false, 'Standardowy tryb nie ma klasy is-fullscreen');
    assert.equal(standardState.bdDisplay, 'none', 'Tło jest ukryte w trybie standardowym');
    assert.equal(standardState.hasToggleBtn, true, 'Przycisk opcji w prawym górnym rogu btn-hero-panel-toggle istnieje');
    assert.equal(standardState.toggleSizeOk, true, 'Przycisk opcji ma ergonomiczny rozmiar dotykowy >= 40x40px');
    assert.equal(standardState.hasFsBtn, true, 'Przycisk bu-mode-fullscreen-btn jest obecny w panelu');
    assert.equal(standardState.hasDimmer, true, 'Dimmer bu-worship-dimmer jest obecny w panelu');
    assert.equal(standardState.hasPlayerKaraokeBtn, true, 'Przycisk btn-player-karaoke w odtwarzaczu istnieje');
    assert.equal(standardState.isDropdownOpen, false, 'Panel opcji jest domyślnie zamknięty');
    assert.equal(standardState.textBarBtnCount, 0, 'ZERO DUBLOWANIA: bu-text-mode-bar nie zawiera żadnych przycisków');

    // 2. Dyrektywa: Przycisk karaoke w odtwarzaczu od razu otwiera tryb pełnoekranowy!
    await page.click('#btn-player-karaoke');
    await page.waitForTimeout(400);

    const directFsState = await page.evaluate(() => {
      const stage = document.getElementById('hero-karaoke-stage');
      const backdrop = document.getElementById('hero-karaoke-backdrop');
      const playerSection = document.getElementById('player-section');
      const isFs = stage?.classList.contains('is-fullscreen');
      const bdDisplay = backdrop ? window.getComputedStyle(backdrop).display : null;
      const isPlayerDocked = stage ? stage.contains(playerSection) : false;
      return { isFs, bdDisplay, isPlayerDocked };
    });

    assert.equal(directFsState.isFs, true, 'Przycisk karaoke w odtwarzaczu bezpośrednio włącza is-fullscreen');
    assert.equal(directFsState.bdDisplay, 'block', 'Tło jest widoczne w trybie pełnoekranowym');
    const bdSharpness = await page.evaluate(() => {
      const img = document.querySelector('.hero-karaoke-backdrop-img');
      const filter = img ? window.getComputedStyle(img).filter : '';
      return filter;
    });
    assert.ok(!bdSharpness || bdSharpness === 'none', 'Tło jest w 100% ostre (brak filter: blur na całym obrazie)');
    assert.equal(directFsState.isPlayerDocked, true, 'Cały odtwarzacz player-section jest dostępny w fullscreen wewnątrz stage');

    // 3. Sprawdzenie skalowania czcionki w trybie pełnoekranowym
    const fontScaling = await page.evaluate(() => {
      const line = document.querySelector('#hero-karaoke-lines .bu-line');
      if (!line) return 0;
      return parseFloat(window.getComputedStyle(line).fontSize) || 0;
    });
    assert.ok(fontScaling >= 20, `Czcionka w fullscreen jest powiększona optymalnie: ${fontScaling}px`);

    // 4. Dyrektywa: Po wciśnięciu play / podczas odtwarzania UI znika, a ruch kursorem przywraca nawigację
    await page.evaluate(() => {
      // Symulacja stanu odtwarzania
      document.getElementById('master-play-btn')?.classList.add('is-playing');
      window.CC_BU_FEATURES?.onPlaybackStateChange?.(true);
    });
    // Czekamy na idle timer (2.2s)
    await page.waitForTimeout(2500);

    const idleHiddenState = await page.evaluate(() => {
      const stage = document.getElementById('hero-karaoke-stage');
      const isIdleHidden = stage?.classList.contains('bu-idle-hidden');
      const cursorStyle = stage ? window.getComputedStyle(stage).cursor : '';
      return { isIdleHidden, cursorStyle };
    });
    assert.equal(idleHiddenState.isIdleHidden, true, 'Podczas odtwarzania po bezczynności UI automatycznie znika (bu-idle-hidden)');
    assert.equal(idleHiddenState.cursorStyle, 'none', 'Kursor myszy jest ukryty (cursor: none)');

    // Zrzut ekranu czystego trybu uwielbienia (tylko tekst karaoke na tle)
    await page.screenshot({ path: 'C:/Users/czark/.gemini/antigravity/brain/6171dbb4-faed-472d-ab3b-0ab4afdc2e53/worship_mode_desktop_verified.png' });

    // Poruszenie kursorem myszy / dotyk przywraca nawigację
    await page.mouse.move(200, 200);
    await page.waitForTimeout(100);

    const restoredState = await page.evaluate(() => {
      const stage = document.getElementById('hero-karaoke-stage');
      return {
        isIdleHidden: stage?.classList.contains('bu-idle-hidden')
      };
    });
    assert.equal(restoredState.isIdleHidden, false, 'Poruszenie kursorem natychmiast przywraca pełny dostęp do nawigacji');

    // 5. Test regulacji przyciemnienia przez panel opcji (Dimmer 60%, 90%, 75%)
    await page.click('#btn-hero-panel-toggle');
    await page.waitForTimeout(200);

    await page.click('#bu-worship-dimmer button[data-dim="60"]');
    await page.waitForTimeout(100);
    let currentDim = await page.evaluate(() => document.getElementById('hero-karaoke-stage')?.style.getPropertyValue('--bu-worship-dim'));
    assert.equal(currentDim, '0.60', 'Przełączenie na 60% ustawia --bu-worship-dim na 0.60');

    await page.click('#bu-worship-dimmer button[data-dim="90"]');
    await page.waitForTimeout(100);
    currentDim = await page.evaluate(() => document.getElementById('hero-karaoke-stage')?.style.getPropertyValue('--bu-worship-dim'));
    assert.equal(currentDim, '0.90', 'Przełączenie na 90% ustawia --bu-worship-dim na 0.90');

    await page.click('#bu-worship-dimmer button[data-dim="75"]');
    await page.waitForTimeout(100);
    currentDim = await page.evaluate(() => document.getElementById('hero-karaoke-stage')?.style.getPropertyValue('--bu-worship-dim'));
    assert.equal(currentDim, '0.75', 'Powrót do 75% przywraca 0.75');

    // 6. Test wyjścia klawiszem Escape (Escape najpierw zamyka panel, kolejny wychodzi z fullscreen)
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
    const panelClosedByEsc = await page.evaluate(() => !document.getElementById('hero-karaoke-panel-dropdown')?.classList.contains('is-open'));
    assert.equal(panelClosedByEsc, true, 'Escape zamyka otwarty panel opcji');

    // Drugi Escape wychodzi z pełnego ekranu
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);

    const exitState = await page.evaluate(() => {
      const stage = document.getElementById('hero-karaoke-stage');
      const backdrop = document.getElementById('hero-karaoke-backdrop');
      const playerSection = document.getElementById('player-section');
      const isPlayerReturned = stage ? !stage.contains(playerSection) : false;
      return {
        isFs: stage?.classList.contains('is-fullscreen'),
        bdDisplay: backdrop ? window.getComputedStyle(backdrop).display : null,
        isPlayerReturned
      };
    });
    assert.equal(exitState.isFs, false, 'Escape prawidłowo wyłącza is-fullscreen');
    assert.equal(exitState.bdDisplay, 'none', 'Tło znika po wyjściu z pełnego ekranu');
    assert.equal(exitState.isPlayerReturned, true, 'Po wyjściu z fullscreen odtwarzacz wraca na pierwotne miejsce');

    // 7. Test TV (16:9 4K / Full HD)
    const tvPage = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
    await tvPage.goto(baseUrl, { waitUntil: 'domcontentloaded' });
    await tvPage.waitForTimeout(800);
    await tvPage.click('#btn-player-karaoke');
    await tvPage.waitForTimeout(400);
    await tvPage.screenshot({ path: 'C:/Users/czark/.gemini/antigravity/brain/6171dbb4-faed-472d-ab3b-0ab4afdc2e53/worship_mode_tv_1080p_verified.png' });

    // 8. Test Mobile (iPhone 390x844 portrait)
    const mobPage = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await mobPage.goto(baseUrl, { waitUntil: 'domcontentloaded' });
    await mobPage.waitForTimeout(800);
    await mobPage.click('#btn-player-karaoke');
    await mobPage.waitForTimeout(400);
    await mobPage.screenshot({ path: 'C:/Users/czark/.gemini/antigravity/brain/6171dbb4-faed-472d-ab3b-0ab4afdc2e53/worship_mode_mobile_portrait_verified.png' });

    // 9. Test Mobile Landscape (844x390)
    const mobLandscapePage = await browser.newPage({ viewport: { width: 844, height: 390 } });
    await mobLandscapePage.goto(baseUrl, { waitUntil: 'domcontentloaded' });
    await mobLandscapePage.waitForTimeout(800);
    await mobLandscapePage.click('#btn-player-karaoke');
    await mobLandscapePage.waitForTimeout(400);
    await mobLandscapePage.screenshot({ path: 'C:/Users/czark/.gemini/antigravity/brain/6171dbb4-faed-472d-ab3b-0ab4afdc2e53/worship_mode_mobile_landscape_verified.png' });
  } finally {
    if (browser) await browser.close();
    if (server.closeAllConnections) server.closeAllConnections();
    await new Promise(r => server.close(r));
  }
});
