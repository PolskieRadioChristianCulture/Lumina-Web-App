import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chromium } from 'playwright';

test('static edge: one instance, native modal focus, full menu handoff, theme and desktop recovery', async () => {
  const browser = await chromium.launch({headless:true,channel:'chrome'});
  try {
    const page = await browser.newPage({viewport:{width:390,height:640}});
    await page.route('https://edge.invalid/**',route=>route.fulfill({contentType:'text/html',body:'<script data-cc-edge-profile="home"></script><button id="hamburgerBtn">Old</button><button id="actionsToggleBtn">All</button><button id="outside">Outside</button>'}));
    await page.goto('https://edge.invalid/');
    await page.addStyleTag({content:fs.readFileSync('css/cc-mobile-edge.css','utf8')});
    const code=fs.readFileSync('js/cc-mobile-edge.js','utf8');
    await page.addScriptTag({content:code});
    await page.addScriptTag({content:code});
    await page.evaluate(()=>document.querySelector('#actionsToggleBtn').onclick=()=>{document.body.dataset.fullMenu='open';document.body.style.overflow='hidden';});
    const trigger=page.locator('.cc-mobile-edge-trigger'), panel=page.locator('.cc-mobile-edge');
    assert.equal(await trigger.count(),1);
    assert.equal(await page.locator('#hamburgerBtn').isVisible(),false);
    assert.equal(await panel.isVisible(),false);
    await trigger.click();
    assert.equal(await panel.isVisible(),true);
    assert.equal(await page.evaluate(()=>document.activeElement.getAttribute('aria-label')),'Zamknij panel nawigacji');
    const sizes=await panel.locator('a,button').evaluateAll(els=>els.map(el=>({w:el.getBoundingClientRect().width,h:el.getBoundingClientRect().height})));
    assert.ok(sizes.every(s=>s.w>=44&&s.h>=44));
    for(let i=0;i<20;i++) await page.keyboard.press('Tab');
    assert.equal(await panel.evaluate(el=>el.contains(document.activeElement)),true);
    await page.keyboard.press('Escape');
    assert.equal(await panel.isVisible(),false);
    assert.equal(await page.evaluate(()=>document.activeElement.className),'cc-mobile-edge-trigger');
    assert.equal(await page.evaluate(()=>document.body.style.overflow),'');
    await trigger.click();
    await panel.getByRole('button',{name:'Pełne menu — wszystkie funkcje',exact:true}).click();
    await page.waitForTimeout(30);
    assert.equal(await page.evaluate(()=>document.body.dataset.fullMenu),'open');
    assert.equal(await page.evaluate(()=>document.body.style.overflow),'hidden','native close event cannot unlock the existing full menu');
    await page.evaluate(()=>{document.body.style.overflow='';document.body.dataset.theme='light';});
    await trigger.click();
    assert.equal(await panel.evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(255, 253, 247)');
    await page.setViewportSize({width:1280,height:900});
    await page.waitForTimeout(30);
    assert.equal(await panel.isVisible(),false);
    assert.equal(await trigger.isVisible(),false);
    assert.equal(await page.locator('#hamburgerBtn').isVisible(),true);
    assert.equal(await page.evaluate(()=>document.body.style.overflow),'');
  } finally {await browser.close();}
});
