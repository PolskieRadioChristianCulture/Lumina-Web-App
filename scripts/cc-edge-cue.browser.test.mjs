import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium} from 'playwright';

test('edge invitation: two short pulses, no layout shift, open/focus/reduced-motion/desktop quiet',async()=>{
  const browser=await chromium.launch({headless:true,channel:'chrome'});
  try {
    const page=await browser.newPage({viewport:{width:390,height:740},reducedMotion:'no-preference'});
    await page.setContent('<button class="cc-mobile-edge-trigger" aria-expanded="false" style="width:44px;height:44px;color:gold"><svg></svg></button><button aria-controls="cc-mobile-edge-panel" aria-expanded="false" style="width:44px;height:44px;color:purple"><svg></svg></button>');
    await page.addStyleTag({content:fs.readFileSync('css/cc-edge-cue.css','utf8')});
    const buttons=page.locator('button');
    const before=await buttons.evaluateAll(els=>els.map(el=>({x:el.offsetLeft,y:el.offsetTop,w:el.offsetWidth,h:el.offsetHeight})));
    const states=await buttons.evaluateAll(els=>els.map(el=>({name:getComputedStyle(el).animationName,count:getComputedStyle(el).animationIterationCount,duration:getComputedStyle(el).animationDuration,delay:getComputedStyle(el).animationDelay})));
    assert.ok(states.every(s=>s.name==='cc-edge-invite'&&s.count==='2'&&s.duration==='1.8s'&&s.delay==='0.6s'));
    await page.waitForFunction(()=>document.querySelectorAll('button')[0].getAnimations().length===0,{},{timeout:7000});
    assert.deepEqual(await buttons.evaluateAll(els=>els.map(el=>({x:el.offsetLeft,y:el.offsetTop,w:el.offsetWidth,h:el.offsetHeight}))),before);
    await buttons.evaluateAll(els=>els.forEach(el=>el.setAttribute('aria-expanded','true')));
    assert.ok((await buttons.evaluateAll(els=>els.map(el=>getComputedStyle(el).animationName))).every(n=>n==='none'));
    await buttons.evaluateAll(els=>els.forEach(el=>el.setAttribute('aria-expanded','false')));
    await page.emulateMedia({reducedMotion:'reduce'});
    assert.ok((await buttons.evaluateAll(els=>els.map(el=>getComputedStyle(el).animationName))).every(n=>n==='none'));
    await page.emulateMedia({reducedMotion:'no-preference'});
    await buttons.first().focus();
    assert.equal(await buttons.first().evaluate(el=>getComputedStyle(el).animationName),'none');
    await page.setViewportSize({width:1280,height:900});
    assert.ok((await buttons.evaluateAll(els=>els.map(el=>getComputedStyle(el).animationName))).every(n=>n==='none'));
  } finally {await browser.close();}
});

test('canonical entrypoints retain shared invitation stylesheet',()=>{
  for(const file of ['index.html','lumina.html','portals/ccn-news/index.html','news.html','news/index.html']) {
    assert.equal((fs.readFileSync(file,'utf8').match(/href="\/css\/cc-edge-cue\.css\?v=20261021_1"/g)||[]).length,1,file);
  }
  for(const file of ['portals/ccn-news/index.html','news.html','news/index.html']) {
    assert.ok(fs.readFileSync(file,'utf8').includes('/components/ekocc-info.js?v=20261020_1'),`${file}: preserve existing project information integration`);
  }
});
