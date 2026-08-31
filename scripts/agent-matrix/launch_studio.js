/**
 * ══════════════════════════════════════════════════════════════════════════
 * LUMINA MOBILE STUDIO — NATIVE DESKTOP LAUNCHER
 * ══════════════════════════════════════════════════════════════════════════
 * Uruchamia pełnoekranową aplikację symulacyjną na Pulpicie z realnymi
 * obudowami telefonów (iPhone Dynamic Island, Status Bar, 7-Grid).
 * ══════════════════════════════════════════════════════════════════════════
 */

import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const studioHtmlPath = path.join(__dirname, 'device_studio.html');
const studioUrl = `file:///${studioHtmlPath.replace(/\\/g, '/')}`;

async function launchStudio() {
  console.log(`
╔═════════════════════════════════════════════════════════════════════════════╗
║               📱 LUMINA MOBILE STUDIO (PHONE SUITE DESKTOP)                 ║
║       Wizualny Symulator Smartfonów w Realistycznych Obudowach Hardware     ║
╚═════════════════════════════════════════════════════════════════════════════╝
Ładowanie aplikacji studyjnej: ${studioUrl}
`);

  const browser = await chromium.launch({
    headless: false,
    args: [
      '--start-maximized',
      '--app=' + studioUrl,
      '--disable-blink-features=AutomationControlled',
      '--no-default-browser-check'
    ]
  });

  const context = await browser.newContext({ viewport: null });
  const page = await context.newPage();
  await page.goto(studioUrl);

  console.log('✅ Aplikacja LUMINA Mobile Studio została uruchomiona na Pulpicie!');
  console.log('Okno aplikacji pozostanie otwarte. Naciśnij Ctrl+C lub zamknij okno, aby zakończyć.\n');

  // Utrzymuj proces aktywny tak długo, jak otwarte jest okno aplikacji
  await new Promise((resolve) => {
    browser.on('disconnected', resolve);
    page.on('close', () => {
      browser.close().then(resolve).catch(resolve);
    });
  });
  console.log('[Studio] Okno zostało zamknięte. Zakończono sesję.');
}

launchStudio().catch(err => {
  console.error('[Studio:Error]', err);
  process.exit(1);
});
