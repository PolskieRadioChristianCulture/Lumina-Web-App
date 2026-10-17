import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const ROOT = process.cwd();
const ARTIFACT_DIR = 'C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.vtt': 'text/vtt; charset=utf-8',
  '.lrc': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.mp3': 'audio/mpeg'
};

function startStaticServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      try {
        const u = new URL(req.url, 'http://127.0.0.1');
        let pathname = decodeURIComponent(u.pathname);
        if (pathname === '/' || pathname === '/biblia-spiewana' || pathname === '/biblia-spiewana-live') {
          pathname = '/biblia-spiewana-live.html';
        }
        const filePath = path.join(ROOT, pathname);
        if (!filePath.startsWith(ROOT) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
          res.writeHead(404);
          res.end('Not found');
          return;
        }
        const ext = path.extname(filePath).toLowerCase();
        res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
        fs.createReadStream(filePath).pipe(res);
      } catch (e) {
        res.writeHead(500);
        res.end(String(e));
      }
    });
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      resolve({ server, baseUrl: `http://127.0.0.1:${port}` });
    });
  });
}

test('Biblia Śpiewana LIVE 24/7 — Karaoke TV integration (Desktop, Mobile, Fullscreen, Sync & Fallback)', async () => {
  const { server, baseUrl } = await startStaticServer();
  const browser = await chromium.launch({ headless: true });

  try {
    // 1. DESKTOP 1920x1080 & 1440x900
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const page = await context.newPage();

    await page.goto(`${baseUrl}/biblia-spiewana-live?autoplay=1&muted=1`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#bs-karaoke-stage', { state: 'attached', timeout: 10000 });

    // Force load PRO-001 (which has verified SYNC_READY data) and set currentTime to 22.6s (Verse 2 singing)
    await page.evaluate(async () => {
      const overlay = document.getElementById('startOverlay');
      if (overlay) overlay.style.display = 'none';
      const banner = document.getElementById('masterUnmuteBanner');
      if (banner) banner.style.display = 'none';

      await window.CC_BS_LIVE_KARAOKE.loadChapterForBroadcast('PRO-001', 'Śpiewane Przypowieści Salomona - Rozdział 1', true);
      const audio = document.getElementById('stream-audio');
      if (audio) {
        audio.pause();
        Object.defineProperty(audio, 'currentTime', { value: 22.6, writable: true, configurable: true });
      }
      window.CC_BS_LIVE_KARAOKE.setPluginMode('AUTO');
      window.CC_BS_LIVE_KARAOKE.tickSync();
    });

    await page.waitForTimeout(350);

    // Check 1: Single audio source (zero second audio/video player)
    const audioCount = await page.locator('audio').count();
    assert.equal(audioCount, 1, 'Must have exactly 1 <audio> element (#stream-audio) to prevent double audio');

    // Check 2: Wallpaper graphic is uwielbienie-w-blasku-krzyza-live.png
    const bgSrc = await page.locator('#bg-img-active').getAttribute('src');
    assert.ok(bgSrc.includes('uwielbienie-w-blasku-krzyza-live.png'), `Expected uwielbienie-w-blasku-krzyza-live.png wallpaper, got ${bgSrc}`);

    // Check 3: Karaoke stage is visible for PRO-001 and located in lower-middle area (never covering upper/middle faces)
    const stageState = await page.evaluate(() => {
      const stage = document.getElementById('bs-karaoke-stage');
      const rect = stage.getBoundingClientRect();
      const activeLine = document.querySelector('#bs-karaoke-lines .bu-line.active');
      const activeWords = document.querySelectorAll('#bs-karaoke-lines .bu-line.active .bu-word.is-singing, #bs-karaoke-lines .bu-line.active .bu-word.is-sung');
      return {
        isVisible: stage.classList.contains('is-visible'),
        topRatio: rect.top / window.innerHeight,
        bottomRatio: rect.bottom / window.innerHeight,
        activeLineText: activeLine ? activeLine.textContent : '',
        activeWordsCount: activeWords.length,
        singingBodyClass: document.body.classList.contains('karaoke-singing-active'),
        state: window.CC_BS_LIVE_KARAOKE.getState()
      };
    });

    assert.equal(stageState.isVisible, true, 'Karaoke stage should be visible for SYNC_READY track PRO-001');
    assert.ok(stageState.topRatio >= 0.52, `Karaoke stage top (${stageState.topRatio.toFixed(2)}) must stay below 52% of screen height so faces and cross are never covered`);
    assert.ok(stageState.activeLineText.includes('Do poznania mądrości'), `Expected verse 2 active at 22.6s, got: ${stageState.activeLineText}`);
    assert.ok(stageState.activeWordsCount > 0, 'Expected word-level gold highlighting at 22.6s');
    assert.equal(stageState.singingBodyClass, true, 'Body should have karaoke-singing-active class to auto-minimize conflicting UI');

    // Save 1920x1080 desktop screenshot
    if (fs.existsSync(ARTIFACT_DIR)) {
      await page.screenshot({ path: path.join(ARTIFACT_DIR, 'biblia_spiewana_live_karaoke_1920x1080.png') });
    }

    // Check 4: Operator Panel (AUTO / ON / OFF + Telemetry + Settings)
    await page.click('#bs-btn-admin-toggle');
    await page.waitForTimeout(200);
    const panelOpen = await page.locator('#bs-karaoke-admin-panel').evaluate((el) => el.classList.contains('is-open'));
    assert.equal(panelOpen, true, 'Admin panel should open on toggle button click');

    if (fs.existsSync(ARTIFACT_DIR)) {
      await page.screenshot({ path: path.join(ARTIFACT_DIR, 'biblia_spiewana_live_admin_panel_1920x1080.png') });
    }

    // Test immediate OFF button
    await page.click('#bs-emergency-off-btn');
    await page.waitForTimeout(150);
    const afterOff = await page.evaluate(() => ({
      visible: document.getElementById('bs-karaoke-stage').classList.contains('is-visible'),
      mode: window.CC_BS_LIVE_KARAOKE.getState().pluginMode,
      singingClass: document.body.classList.contains('karaoke-singing-active')
    }));
    assert.equal(afterOff.mode, 'OFF');
    assert.equal(afterOff.visible, false, 'Karaoke stage must hide immediately when switched to OFF');
    assert.equal(afterOff.singingClass, false, 'Conflicting UI auto-minimize class must be removed when OFF');

    // Restore AUTO mode and close admin panel
    await page.click('#bs-mode-auto-btn');
    await page.click('#bs-admin-close-btn');
    await page.waitForTimeout(150);

    // Check 5: Track WITHOUT sync data (PRO-018) -> must automatically hide karaoke without interrupting broadcast
    await page.evaluate(async () => {
      await window.CC_BS_LIVE_KARAOKE.loadChapterForBroadcast('PRO-018', 'Śpiewane Przypowieści Salomona - Rozdział 18', true);
    });
    await page.waitForTimeout(200);
    const noSyncState = await page.evaluate(() => ({
      visible: document.getElementById('bs-karaoke-stage').classList.contains('is-visible'),
      syncStatus: window.CC_BS_LIVE_KARAOKE.getState().syncStatus,
      singingClass: document.body.classList.contains('karaoke-singing-active')
    }));
    assert.equal(noSyncState.syncStatus, 'NO_SYNC', 'PRO-018 should report NO_SYNC');
    assert.equal(noSyncState.visible, false, 'Karaoke stage must automatically hide when track has no sync data');
    assert.equal(noSyncState.singingClass, false, 'Normal TV broadcast UI must be restored when track has no sync data');

    // Switch back to PRO-001 and test Fullscreen Karaoke mode
    await page.evaluate(async () => {
      await window.CC_BS_LIVE_KARAOKE.loadChapterForBroadcast('PRO-001', 'Śpiewane Przypowieści Salomona - Rozdział 1', true);
      window.CC_BS_LIVE_KARAOKE.tickSync();
    });
    await page.waitForTimeout(200);
    await page.click('#bs-btn-fullscreen-karaoke');
    await page.waitForTimeout(200);
    const fsActive = await page.evaluate(() => document.body.classList.contains('bs-karaoke-fullscreen'));
    assert.equal(fsActive, true, 'Fullscreen karaoke mode should activate');
    if (fs.existsSync(ARTIFACT_DIR)) {
      await page.screenshot({ path: path.join(ARTIFACT_DIR, 'biblia_spiewana_live_fullscreen_1920x1080.png') });
    }
    await page.click('#bs-btn-fullscreen-karaoke');

    // 2. DESKTOP 1440x900
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForTimeout(250);
    if (fs.existsSync(ARTIFACT_DIR)) {
      await page.screenshot({ path: path.join(ARTIFACT_DIR, 'biblia_spiewana_live_karaoke_1440x900.png') });
    }

    // 3. MOBILE 390x844 & 360x800 (Touch target ≥44x44px verification)
    for (const vp of [{ width: 390, height: 844 }, { width: 360, height: 800 }]) {
      await page.setViewportSize(vp);
      await page.waitForTimeout(250);
      const touchMetrics = await page.evaluate(() => {
        const fsBtn = document.getElementById('bs-btn-fullscreen-karaoke').getBoundingClientRect();
        const adminBtn = document.getElementById('bs-btn-admin-toggle').getBoundingClientRect();
        return {
          fsW: Math.round(fsBtn.width),
          fsH: Math.round(fsBtn.height),
          adminW: Math.round(adminBtn.width),
          adminH: Math.round(adminBtn.height),
          horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth
        };
      });
      assert.ok(touchMetrics.fsW >= 44 && touchMetrics.fsH >= 44, `Fullscreen button touch target < 44px on ${vp.width}x${vp.height}`);
      assert.ok(touchMetrics.adminW >= 44 && touchMetrics.adminH >= 44, `Admin toggle button touch target < 44px on ${vp.width}x${vp.height}`);
      assert.equal(touchMetrics.horizontalOverflow, false, `No horizontal overflow allowed on ${vp.width}x${vp.height}`);

      if (fs.existsSync(ARTIFACT_DIR)) {
        await page.screenshot({ path: path.join(ARTIFACT_DIR, `biblia_spiewana_live_karaoke_${vp.width}x${vp.height}.png`) });
      }
    }

    await context.close();
  } finally {
    await browser.close();
    server.close();
  }
});
