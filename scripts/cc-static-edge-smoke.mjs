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
    const triggerSize=await trigger.boundingBox();
    assert.ok(triggerSize.width>=44&&triggerSize.height>=44);
    if(process.env.CC_EDGE_THEME) await page.evaluate(theme=>{
      if(typeof window.applyLuminaTheme==='function') window.applyLuminaTheme(theme,false);
      else document.documentElement.dataset.theme=theme;
    },process.env.CC_EDGE_THEME);
    await trigger.click();
    const panel=page.locator('#cc-mobile-edge-dialog');
    assert.equal(await panel.isVisible(),true);
    assert.ok(await panel.evaluate(el=>el.matches(':modal')));
    if(routePath==='/lumina'&&process.env.CC_EDGE_THEME) assert.equal(await panel.evaluate(el=>getComputedStyle(el).backgroundColor),process.env.CC_EDGE_THEME==='dark'?'rgb(11, 17, 32)':'rgb(255, 250, 255)');
    const sizes=await panel.locator('a:visible,button:visible').evaluateAll(els=>els.map(el=>({w:el.getBoundingClientRect().width,h:el.getBoundingClientRect().height})));
    assert.ok(sizes.every(s=>s.w>=44&&s.h>=44));
    assert.equal(await panel.locator('[aria-current="page"]').getAttribute('href'),routePath);
    if(routePath==='/lumina') {
      assert.equal(await page.locator('#mobileNavSearchBtn').isVisible(),false);
      assert.equal(await page.locator('#luminaThemeSwitchBtn').isVisible(),false);
      const theme=panel.locator('[data-cc-edge-action="theme"]');
      const before=await page.locator('html').getAttribute('data-lumina-theme');
      await theme.click();
      assert.equal(await page.locator('html').getAttribute('data-lumina-theme'),before==='light'?'dark':'light');
      await theme.click();
      assert.equal(await page.locator('html').getAttribute('data-lumina-theme'),before);
      assert.equal(await panel.locator('a[href="/szukaj"]').isVisible(),true);
    }
    if(width===390&&process.env.CC_EDGE_SCREENSHOT) await page.screenshot({path:process.env.CC_EDGE_SCREENSHOT});
    await page.keyboard.press('Escape');
    assert.equal(await panel.isVisible(),false);
    assert.equal(await page.evaluate(()=>document.body.style.overflow),'');
    await trigger.click();
    if(routePath==='/') {
      await panel.getByRole('button',{name:'Pełne menu — wszystkie funkcje',exact:true}).click();
      await page.locator('#actionsList.open').waitFor({state:'visible'});
      await page.locator('#actionsCloseBtn').click();
    } else {
      assert.equal(await panel.getByRole('link',{name:'Konto i logowanie LUMINA',exact:true}).getAttribute('href'),'/lumina-login');
      assert.equal(await panel.getByRole('button',{name:'Pełne menu — wszystkie funkcje',exact:true}).isVisible(),false,'guest-only presentation must not reveal the hidden member menu');
      await page.keyboard.press('Escape');
    }
    console.log(`PASS ${base}${routePath} ${width}px: modal, touch, route, Escape, ${routePath==='/'?'full menu':'guest login entry'}`);
  }
  await page.setViewportSize({width:1280,height:900});
  await page.waitForTimeout(40);
  assert.equal(await page.locator('.cc-mobile-edge-trigger').isVisible(),false);
  if(routePath==='/') assert.equal(await page.locator('#actionsToggleBtn').isVisible(),true);
  console.log('PASS desktop: original navigation preserved');
} finally {await browser.close();}
