import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const base=process.env.CC_EDGE_BASE || 'https://polskieradio.cc';
const browser=await chromium.launch({headless:true,channel:'chrome'});
try {
  const page=await browser.newPage({viewport:{width:390,height:740},reducedMotion:'no-preference'});
  await page.route('**/*',route=>new URL(route.request().url()).origin===base?route.continue():route.abort());
  for(const path of ['/','/lumina','/news']) {
    await page.setViewportSize({width:390,height:740});
    await page.emulateMedia({reducedMotion:'no-preference'});
    assert.equal((await page.goto(base+path,{waitUntil:'domcontentloaded'})).status(),200);
    const trigger=page.locator(path==='/news'?'[aria-controls="cc-mobile-edge-panel"]':'.cc-mobile-edge-trigger');
    await trigger.waitFor({state:'visible'});
    const state=await trigger.evaluate(el=>({name:getComputedStyle(el).animationName,count:getComputedStyle(el).animationIterationCount}));
    assert.deepEqual(state,{name:'cc-edge-invite',count:'2'},path);
    await page.emulateMedia({reducedMotion:'reduce'});
    assert.equal(await trigger.evaluate(el=>getComputedStyle(el).animationName),'none',path);
    await page.emulateMedia({reducedMotion:'no-preference'});
    await trigger.click();
    assert.equal(await trigger.getAttribute('aria-expanded'),'true',path);
    assert.equal(await trigger.evaluate(el=>getComputedStyle(el).animationName),'none',path);
    await page.keyboard.press('Escape');
    assert.equal(await trigger.getAttribute('aria-expanded'),'false',path);
    await page.setViewportSize({width:1280,height:900});
    assert.equal(await trigger.isVisible(),false,path);
    assert.equal(await trigger.evaluate(el=>getComputedStyle(el).animationName),'none',path);
    console.log(`PASS ${base}${path}: finite mobile cue, reduced-motion off, open stops cue, Escape, desktop quiet`);
  }
} finally {await browser.close();}
