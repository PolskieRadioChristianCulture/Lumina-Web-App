// Local-source browser QA; external sharing destinations are never submitted.
import { chromium } from 'playwright';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const root = process.cwd();
const output = process.argv[2];
const browser = await chromium.launch({headless:true});
try {
  const context = await browser.newContext();
  await context.route('https://polskieradio.cc/**', async route => {
    const u = new URL(route.request().url());
    if (u.pathname.includes('auth') || u.pathname.includes('firebase')) return route.abort();
    // Pages _redirects rewrites public /akademia to /kursy.
    const pathname = u.pathname === '/akademia' ? '/kursy' : u.pathname;
    const base = path.resolve(root, '.' + decodeURIComponent(pathname));
    if (!base.startsWith(root + path.sep)) return route.abort();
    let file = base;
    try { if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html'); }
    catch { file += '.html'; }
    try {
      const ext = path.extname(file);
      const contentType = {'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'}[ext] || 'application/octet-stream';
      await route.fulfill({body:await readFile(file),contentType});
    } catch { await route.fulfill({status:404,body:'Local QA: not found'}); }
  });
  const page = await context.newPage();
  for (const width of [320,390,1280]) {
    await page.setViewportSize({width,height:900});
    await page.goto('https://polskieradio.cc/akademia/kurscodzienny/dzien-08', {waitUntil:'domcontentloaded'});
    const panel = page.locator('#ccDailyShare');
    await panel.waitFor();
    await panel.scrollIntoViewIfNeeded();
    const sizes = await panel.locator('a,button').evaluateAll(nodes => nodes.map(n => ({width:n.getBoundingClientRect().width,height:n.getBoundingClientRect().height})));
    assert.ok(sizes.every(s => s.height >= 44 && s.width >= 44), JSON.stringify(sizes));
    assert.ok(await panel.evaluate(n => n.getBoundingClientRect().right <= innerWidth));
    const popup = await panel.locator('a').first().getAttribute('href');
    assert.ok(popup.includes('dzien-08'));
    await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', {configurable:true,value:undefined}));
    await panel.getByRole('button',{name:'Kopiuj link',exact:true}).click();
    await panel.locator('input').waitFor({state:'visible'});
    assert.ok((await panel.locator('input').inputValue()).endsWith('/dzien-08'));
    for (const theme of ['dark','light']) {
      await page.evaluate(theme => { document.documentElement.classList.toggle('dark',theme==='dark'); document.documentElement.dataset.theme=theme; }, theme);
      if (output) await panel.screenshot({path:path.join(output,`CC_DAILY_SHARE_${width}_${theme}_2026-10-08.png`)});
    }
    console.log(`Local rendered lesson ${width}px: controls, link, clipboard fallback PASS`);
  }
  await page.goto('https://polskieradio.cc/akademia#kurscodzienny',{waitUntil:'domcontentloaded'});
  await page.locator('#course-view-kurscodzienny #ccDailyShare').waitFor({state:'attached'});
  assert.equal(await page.locator('#course-view-kurscodzienny #ccDailyShare').count(), 1);
  console.log('Academy course panel mounted in course tab PASS (not an auth/device E2E)');
} finally { await browser.close(); }
