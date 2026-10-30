import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const ROOT = process.cwd();
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'application/javascript', '.json': 'application/json', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml' };

function serve() {
  return http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split('?')[0]);
    if (p === '/Wioletta' || p === '/Wioletta/') p = '/Wioletta/index.html';
    const f = path.join(ROOT, p);
    if (fs.existsSync(f) && fs.statSync(f).isFile()) {
      res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' });
      fs.createReadStream(f).pipe(res);
    } else { res.writeHead(404); res.end(); }
  });
}

test('Wioletta: static wiring of edge panel and i18n', () => {
  const html = fs.readFileSync(path.join(ROOT, 'Wioletta.html'), 'utf8');
  assert.equal(html, fs.readFileSync(path.join(ROOT, 'Wioletta', 'index.html'), 'utf8'));
  const iCore = html.indexOf('/js/ekocc-i18n-core.js');
  const iEdge = html.indexOf('/js/cc-mobile-edge.js');
  const iPage = html.indexOf('/js/wioletta-i18n-edge.js');
  assert.ok(iCore > 0 && iEdge > iCore && iPage > iEdge, 'Order: i18n core -> edge -> page script');
  assert.match(html, /cc-mobile-edge\.js[^"]*" data-cc-edge-profile="wioletta-manual"/);
  const js = fs.readFileSync(path.join(ROOT, 'js', 'wioletta-i18n-edge.js'), 'utf8');
  assert.ok(!/Mission Control/i.test(js), 'No Mission Control mention');
  assert.ok(!/fetch\(|XMLHttpRequest|translate\.google/i.test(js), 'ZERO COST: no network translators');
});

for (const [locale, expect] of [
  ['en-US', { lang: 'en', read: 'READ', about: 'About the author', close: 'CLOSE' }],
  ['de-DE', { lang: 'de', read: 'LESEN', about: 'Über die Autorin', close: 'SCHLIESSEN' }],
  ['pl-PL', { lang: 'pl', read: 'CZYTAJ', about: 'O autorce', close: 'ZAMKNIJ' }],
]) {
  test(`Wioletta mobile ${locale}: "+" edge panel and automatic translation`, async () => {
    const server = serve();
    await new Promise(r => server.listen(0, '127.0.0.1', r));
    const browser = await chromium.launch();
    try {
      const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, locale });
      const page = await ctx.newPage();
      const errors = [];
      page.on('pageerror', e => errors.push(String(e)));
      await page.goto(`http://127.0.0.1:${server.address().port}/Wioletta`, { waitUntil: 'networkidle' });

      assert.equal(await page.evaluate(() => document.documentElement.lang), expect.lang);
      // Every translation selector must still match the page (guards against silent drift).
      const missing = await page.evaluate(() => window.CCWiolettaI18n.selectors.filter(s => !document.querySelector(s)));
      assert.deepEqual(missing, [], 'All i18n selectors resolve');

      // Only the "+" trigger on the mobile top bar; burger hidden.
      const trigger = page.locator('.cc-mobile-edge-trigger');
      assert.equal(await trigger.count(), 1);
      assert.ok(await trigger.isVisible());
      assert.equal(await page.locator('.btn-burger').isVisible(), false, 'Burger hidden on mobile');
      const box = await trigger.boundingBox();
      assert.ok(box.width >= 44 && box.height >= 44, 'Touch target >= 44px');

      assert.equal((await page.locator('.mobile-btn-czytaj').innerText()).trim(), expect.read);

      // Panel opens and has translated, unique labels.
      await trigger.click();
      const dialog = page.locator('dialog#cc-mobile-edge-dialog[open]');
      await dialog.waitFor({ state: 'visible' });
      const labels = await dialog.locator('nav [aria-label]').evaluateAll(els => els.map(e => e.getAttribute('aria-label')));
      assert.equal(new Set(labels).size, labels.length, 'No duplicated labels in panel');
      const about = dialog.locator(`nav a[aria-label="${expect.about}"]`);
      assert.equal(await about.count(), 1);

      // "About the author" opens author modal and closes the panel.
      await about.click();
      await page.locator('#modalOAutorce.open').waitFor({ state: 'visible' });
      assert.equal(await page.locator('dialog#cc-mobile-edge-dialog[open]').count(), 0);
      assert.equal((await page.locator('#modalOAutorce .modal-close-fs > span:last-child').innerText()).trim(), expect.close);
      await page.keyboard.press('Escape');

      // Full menu opens the author menu (not the panel again), with language switch.
      await trigger.click();
      await dialog.waitFor({ state: 'visible' });
      await dialog.locator('nav button[data-edge-key="menu"]').click();
      await page.locator('#modalMenu.open').waitFor({ state: 'visible' });
      assert.equal(await page.locator('dialog#cc-mobile-edge-dialog[open]').count(), 0);
      const sw = page.locator('#modalMenu .wioletta-lang-switch button');
      assert.equal(await sw.count(), 3);
      assert.equal(await page.locator(`#modalMenu .wioletta-lang-switch button[data-wl="${expect.lang}"]`).getAttribute('aria-pressed'), 'true');

      // Manual override round-trip: switch to PL restores originals.
      await page.locator('#modalMenu .wioletta-lang-switch button[data-wl="pl"]').click();
      assert.equal(await page.evaluate(() => document.documentElement.lang), 'pl');
      assert.equal((await page.locator('.mobile-btn-czytaj').innerText()).trim(), 'CZYTAJ');

      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth), false, 'No horizontal overflow');
      assert.deepEqual(errors, []);
      await ctx.close();
    } finally {
      await browser.close();
      server.close();
    }
  });
}
