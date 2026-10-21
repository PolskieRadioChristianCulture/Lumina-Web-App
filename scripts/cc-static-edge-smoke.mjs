import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const base=process.env.CC_EDGE_BASE||'https://edge-local.invalid';
const routePath=process.env.CC_EDGE_PAGE||'/';
const file=routePath==='/lumina'?'lumina.html':'index.html';
const browser=await chromium.launch({headless:true,channel:'chrome'});
try {
  const page=await browser.newPage();
  await page.route('**/*',async route=>{
    const url=new URL(route.request().url());
    if(url.origin!==base) return route.abort();
    if(process.env.CC_EDGE_BASE) return route.continue();
    const target=path.resolve(url.pathname===routePath?file:decodeURIComponent(url.pathname.slice(1)));
    if(!target.startsWith(process.cwd()+path.sep)||!fs.existsSync(target)||!fs.statSync(target).isFile()) return route.fulfill({status:404,body:''});
    const mime={'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.html':'text/html','.json':'application/json','.svg':'image/svg+xml','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp'};
    return route.fulfill({body:fs.readFileSync(target),contentType:mime[path.extname(target)]||'application/octet-stream'});
  });
  for(const width of [320,390,430]) {
    await page.setViewportSize({width,height:740});
    const response=await page.goto(base+routePath,{waitUntil:'domcontentloaded'});
    assert.equal(response.status(),200);
    const trigger=page.locator('.cc-mobile-edge-trigger');
    await trigger.waitFor({state:'visible'});
    assert.equal(await trigger.count(),1);
    await trigger.click();
    const panel=page.locator('#cc-mobile-edge-dialog');
    assert.equal(await panel.isVisible(),true);
    assert.ok(await panel.evaluate(el=>el.matches(':modal')));
    const sizes=await panel.locator('a,button').evaluateAll(els=>els.map(el=>({w:el.getBoundingClientRect().width,h:el.getBoundingClientRect().height})));
    assert.ok(sizes.every(s=>s.w>=44&&s.h>=44));
    assert.equal(await panel.locator('[aria-current="page"]').getAttribute('href'),routePath);
    if(width===390&&process.env.CC_EDGE_SCREENSHOT) await page.screenshot({path:process.env.CC_EDGE_SCREENSHOT});
    await page.keyboard.press('Escape');
    assert.equal(await panel.isVisible(),false);
    assert.equal(await page.evaluate(()=>document.body.style.overflow),'');
    await trigger.click();
    await panel.getByRole('button',{name:'Pełne menu — wszystkie funkcje',exact:true}).click();
    if(routePath==='/') {
      await page.locator('#actionsList.open').waitFor({state:'visible'});
      await page.locator('#actionsCloseBtn').click();
    } else {
      assert.equal(await page.locator('#topNavDrawer').isVisible(),true);
      await page.locator('#topNavMenuBtn').evaluate(el=>el.click());
    }
    console.log(`PASS ${base}${routePath} ${width}px: modal, touch, route, Escape, full menu`);
  }
  await page.setViewportSize({width:1280,height:900});
  await page.waitForTimeout(40);
  assert.equal(await page.locator('.cc-mobile-edge-trigger').isVisible(),false);
  assert.equal(await page.locator(routePath==='/'?'#actionsToggleBtn':'#topNavMenuBtn').isVisible(),true);
  console.log('PASS desktop: original navigation preserved');
} finally {await browser.close();}
