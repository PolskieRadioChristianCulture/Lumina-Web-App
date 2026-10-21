import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const base = process.env.CC_EDGE_BASE || 'https://cc-local.invalid';
const local = !process.env.CC_EDGE_BASE;
const browser = await chromium.launch({channel: 'chrome', headless: true});
try {
  const page = await browser.newPage();
  await page.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.origin !== base) return route.abort();
    if (!local) return route.continue();
    const relative = url.pathname === '/news' ? 'news.html' : decodeURIComponent(url.pathname.slice(1));
    const target = path.resolve(relative);
    if (!target.startsWith(process.cwd() + path.sep) || !fs.existsSync(target) || !fs.statSync(target).isFile()) return route.fulfill({status:404,body:''});
    const mime = {'.js':'text/javascript','.css':'text/css','.html':'text/html','.json':'application/json','.jpg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml','.webp':'image/webp'};
    return route.fulfill({body:fs.readFileSync(target),contentType:mime[path.extname(target)] || 'application/octet-stream'});
  });
  for (const width of [320,390,430]) {
    await page.setViewportSize({width,height:740});
    const response = await page.goto(`${base}/news`,{waitUntil:'domcontentloaded'});
    assert.equal(response.status(),200);
    const trigger = page.locator('[aria-controls="cc-mobile-edge-panel"]');
    await trigger.waitFor({state:'visible'});
    assert.equal(await page.locator('#cc-mobile-edge-panel').count(),0);
    await trigger.click();
    const panel = page.locator('#cc-mobile-edge-panel');
    await panel.waitFor({state:'visible'});
    const dimensions = await panel.locator('a,button').evaluateAll(elements=>elements.map(el=>({w:el.getBoundingClientRect().width,h:el.getBoundingClientRect().height})));
    assert.ok(dimensions.every(d=>d.w>=44 && d.h>=44));
    assert.equal(await panel.locator('[aria-current="page"]').getAttribute('href'),'/news');
    assert.ok(await page.evaluate(()=>document.body.scrollWidth<=innerWidth),'no horizontal overflow');
    if(width===390 && process.env.CC_EDGE_SCREENSHOT) await page.screenshot({path:process.env.CC_EDGE_SCREENSHOT});
    await panel.getByRole('button',{name:'Zamknij panel nawigacji',exact:true}).click();
    await panel.waitFor({state:'detached'});
    assert.notEqual(await page.evaluate(()=>document.body.style.overflow),'hidden');
    console.log(`PASS ${base}/news mobile ${width}: open/close, touch targets, route, overflow`);
  }
  await page.setViewportSize({width:1280,height:900});
  assert.equal(await page.locator('[aria-controls="cc-mobile-edge-panel"]').isVisible(),false);
  console.log('PASS desktop: mobile trigger hidden');
} finally { await browser.close(); }
