import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const out = process.env.CCN_VERIFY_OUTPUT;
if (!out) throw new Error('CCN_VERIFY_OUTPUT must point to a private evidence folder');
fs.mkdirSync(out, { recursive: true });
const remote = process.argv.includes('--production');
const root = process.cwd();
const server = remote ? null : http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const name = url.pathname === '/szukaj' ? '/szukaj.html' : decodeURIComponent(url.pathname);
  const file = path.resolve(root, '.' + name);
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404).end(); return; }
  res.setHeader('Content-Type', ({ '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css' })[path.extname(file)] || 'application/octet-stream');
  fs.createReadStream(file).pipe(res);
});
if (server) await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = remote ? 'https://polskieradio.cc' : `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ headless: true });
const report = { observedAt: new Date().toISOString(), base, checks: [] };
try {
  const page = await browser.newPage();
  await page.route('**/*', route => new URL(route.request().url()).origin === base ? route.continue() : route.abort());
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(base + '/szukaj?q=CBDC', { waitUntil: 'networkidle' });
  await page.locator('.result-card').first().waitFor();
  assert.match(await page.locator('.result-card').first().getAttribute('href'), /cbdc-prawo-niedzielne/);
  for (const q of ['waluta banku centralnego', 'central bank digital currency', 'prawo niedzielne', 'Najnowsze artykuły CC', 'Lekcja 15 na dziś']) {
    await page.locator('#q').fill(q);
    await page.waitForFunction(q => new URL(location.href).searchParams.get('q') === q, q);
    assert.ok(await page.locator('.result-card').count() > 0, q);
    const urls = await page.locator('.result-card').evaluateAll(nodes => nodes.map(n => n.href));
    assert.equal(urls.length, new Set(urls).size, q + ' duplicates');
    if (q.includes('bank')) assert.match(urls[0], /cbdc-prawo-niedzielne/);
    report.checks.push({ q, count: urls.length, top: urls[0] });
  }
  await page.locator('#q').fill('prawo niedzielne');
  await page.waitForFunction(() => new URL(location.href).searchParams.get('q') === 'prawo niedzielne');
  assert.ok(await page.getByRole('heading', { name: 'Dokładne wyniki', exact: true }).count());
  assert.ok(await page.getByRole('heading', { name: 'Tematy pokrewne', exact: true }).count());
  for (const width of [320, 390, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    for (const theme of ['dark', 'light']) {
      if (await page.evaluate(() => document.documentElement.getAttribute('data-theme')) !== theme) await page.locator('#themeToggleBtn').click();
      await page.waitForFunction(theme => getComputedStyle(document.body).backgroundColor === (theme === 'dark' ? 'rgb(8, 13, 24)' : 'rgb(249, 250, 252)'), theme);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${width}/${theme} overflow`);
      await page.screenshot({ path: path.join(out, `${remote ? 'production' : 'local'}-${width}-${theme}.png`) });
      report.checks.push({ width, theme, overflow: false });
    }
  }
  await page.locator('#q').focus();
  await page.keyboard.press('Tab');
  assert.ok(await page.evaluate(() => document.activeElement !== document.body));
  assert.deepEqual(errors, []);
  report.result = 'PASS';
} finally {
  fs.writeFileSync(path.join(out, remote ? 'browser-production.json' : 'browser-local.json'), JSON.stringify(report, null, 2));
  await browser.close();
  if (server) await new Promise(resolve => server.close(resolve));
}
console.log(JSON.stringify(report));
