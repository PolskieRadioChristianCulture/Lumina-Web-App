import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

test('EkoCC i18n Core — unit contracts & cascade logic', async (t) => {
  const i18nPath = path.join(ROOT_DIR, 'js', 'ekocc-i18n-core.js');
  assert.ok(fs.existsSync(i18nPath), 'js/ekocc-i18n-core.js must exist');

  await import(`file://${i18nPath.replace(/\\/g, '/')}`);
  const EkoCCI18n = globalThis.EkoCCI18n;
  assert.ok(EkoCCI18n, 'EkoCCI18n must be defined on globalThis');

  await t.test('Contract: supportedLocales, defaultLocale, and dictionaries', () => {
    assert.deepEqual(EkoCCI18n.supportedLocales, ['pl', 'en', 'de']);
    assert.equal(EkoCCI18n.defaultLocale, 'pl');
    assert.ok(EkoCCI18n.dictionaries.pl, 'PL dictionary must exist');
    assert.ok(EkoCCI18n.dictionaries.en, 'EN dictionary must exist');
    assert.ok(EkoCCI18n.dictionaries.de, 'DE dictionary must exist');
  });

  await t.test('Translation: exact translation, fallback, and parameter interpolation', () => {
    EkoCCI18n.setLocale('pl');
    assert.equal(EkoCCI18n.t('search_btn'), 'Szukaj');

    EkoCCI18n.setLocale('en');
    assert.equal(EkoCCI18n.t('search_btn'), 'Search');
    const powEn = EkoCCI18n.t('powered_by', { studio: 'YIS' });
    assert.equal(powEn, 'Powered by YIS for Christian Culture');

    EkoCCI18n.setLocale('de');
    assert.equal(EkoCCI18n.t('search_btn'), 'Suchen');
    const powDe = EkoCCI18n.t('powered_by', { studio: 'YIS' });
    assert.equal(powDe, 'Bereitgestellt von YIS für Christian Culture');

    // Missing key in DE falls back to PL
    EkoCCI18n.dictionaries.pl['pilot_only_key'] = 'Tylko po polsku';
    delete EkoCCI18n.dictionaries.de['pilot_only_key'];
    assert.equal(EkoCCI18n.t('pilot_only_key'), 'Tylko po polsku');

    // Non-existent key falls back to fallback parameter or key without crashing
    assert.equal(EkoCCI18n.t('non_existent_key_xyz', {}, 'Domyslny Fallback'), 'Domyslny Fallback');
    assert.equal(EkoCCI18n.t('non_existent_key_xyz'), 'non_existent_key_xyz');
  });

  await t.test('Content language independence: UI locale does not alter contentLanguage', () => {
    EkoCCI18n.setContentLanguage('pl');
    EkoCCI18n.setLocale('de');
    assert.equal(EkoCCI18n.getLocale(), 'de');
    assert.equal(EkoCCI18n.getContentLanguage(), 'pl', 'Original content language must remain independent of UI locale');
  });
});

test('EkoCC i18n Core — Browser smoke test in /wyszukiwarka', async () => {
  const browser = await chromium.launch({ headless: true });
  const base = 'https://wyszukiwarka.invalid';

  try {
    // Test 1: First visit with German browser locale (de-DE) -> auto-detects German UI
    const contextDe = await browser.newContext({
      locale: 'de-DE',
      viewport: { width: 390, height: 844 }
    });

    const setupRoute = async (page) => {
      await page.route('**/*', async (route) => {
        const url = new URL(route.request().url());
        if (url.origin !== base) return route.abort();

        let reqPath = decodeURIComponent(url.pathname.replace(/^\//, ''));
        if (!reqPath || reqPath === 'wyszukiwarka' || reqPath === 'wyszukiwarka/') {
          reqPath = 'wyszukiwarka/index.html';
        }

        const target = path.join(ROOT_DIR, reqPath);
        if (!fs.existsSync(target) || !fs.statSync(target).isFile()) {
          return route.fulfill({ status: 404, body: 'Not found' });
        }

        const ext = path.extname(target).toLowerCase();
        const mime = {
          '.js': 'text/javascript',
          '.css': 'text/css',
          '.html': 'text/html',
          '.json': 'application/json',
          '.webp': 'image/webp',
          '.png': 'image/png'
        };

        return route.fulfill({
          body: fs.readFileSync(target),
          contentType: mime[ext] || 'application/octet-stream'
        });
      });
    };

    const pageDe = await contextDe.newPage();
    await setupRoute(pageDe);

    await pageDe.goto(`${base}/wyszukiwarka`);
    await pageDe.waitForLoadState('networkidle');

    // Verify German detected
    const htmlLangDe = await pageDe.getAttribute('html', 'lang');
    assert.equal(htmlLangDe, 'de', 'Initial visit with de-DE must automatically select German UI');

    // Check placeholder on omni-input
    const omniInput = pageDe.locator('#ccOmniInput');
    await omniInput.waitFor({ state: 'visible' });
    const placeholderDe = await omniInput.getAttribute('placeholder');
    assert.equal(placeholderDe, 'Christian Culture fragen…');

    // Check active button in omni overlay
    const activeBtnDe = pageDe.locator('#ccOmniOverlay button[data-ekocc-lang-choice="de"]');
    assert.equal(await activeBtnDe.getAttribute('aria-pressed'), 'true');

    // Test 2: Touch targets: All language switcher buttons must be at least 44x44px
    const buttons = await pageDe.$$('#ccOmniOverlay .ekocc-lang-btn');
    assert.equal(buttons.length, 3, 'Must render PL, EN, DE buttons');
    for (const btn of buttons) {
      const box = await btn.boundingBox();
      assert.ok(box && box.width >= 44 && box.height >= 44, `Button touch target ${box?.width}x${box?.height} must be >= 44x44px`);
    }

    // Test 3: Manual selection of Polish (PL) persists across reloads
    const plBtn = pageDe.locator('#ccOmniOverlay button[data-ekocc-lang-choice="pl"]');
    await plBtn.click();
    await pageDe.waitForTimeout(100);

    const htmlLangPl = await pageDe.getAttribute('html', 'lang');
    assert.equal(htmlLangPl, 'pl', 'Clicking PL must change HTML lang to pl');

    const placeholderPl = await omniInput.getAttribute('placeholder');
    assert.equal(placeholderPl, 'Zapytaj Christian Culture…');

    // Reload page — should remain Polish because guest choice was stored in localStorage!
    await pageDe.reload();
    await pageDe.waitForLoadState('networkidle');

    const htmlLangReload = await pageDe.getAttribute('html', 'lang');
    assert.equal(htmlLangReload, 'pl', 'Reloading page must retain manual Polish choice');

    const placeholderReload = await pageDe.getAttribute('#ccOmniInput', 'placeholder');
    assert.equal(placeholderReload, 'Zapytaj Christian Culture…');

    // Test 4: Switching to English (EN) works instantly
    const enBtn = pageDe.locator('#ccOmniOverlay button[data-ekocc-lang-choice="en"]');
    await enBtn.click();
    await pageDe.waitForTimeout(100);

    const htmlLangEn = await pageDe.getAttribute('html', 'lang');
    assert.equal(htmlLangEn, 'en');

    const placeholderEn = await pageDe.getAttribute('#ccOmniInput', 'placeholder');
    assert.equal(placeholderEn, 'Ask Christian Culture…');

    // Save mobile screenshot for proof
    const screenshotPath = 'C:/Users/czark/.gemini/antigravity/brain/d6fb6723-88d9-47dd-951a-c934e6675ed7/wyszukiwarka_i18n_de_en.png';
    await pageDe.screenshot({ path: screenshotPath });
    console.log('Saved screenshot to:', screenshotPath);

    await contextDe.close();
  } finally {
    await browser.close();
  }
});
