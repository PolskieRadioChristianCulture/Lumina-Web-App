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

test('LUMINA edge: guest visibility, canonical light theme, member UI handoff and no /mess injection', async () => {
  const browser=await chromium.launch({headless:true,channel:'chrome'});
  try {
    const page=await browser.newPage({viewport:{width:390,height:640}});
    await page.route('https://edge.invalid/**',route=>route.fulfill({contentType:'text/html',body:'<body class="user-is-guest"><script data-cc-edge-profile="lumina"></script><div class="nav-menu-wrapper"><button id="topNavMenuBtn">Menu</button></div></body>'}));
    const code=fs.readFileSync('js/cc-mobile-edge.js','utf8');
    await page.goto('https://edge.invalid/lumina');
    await page.addStyleTag({content:fs.readFileSync('css/cc-mobile-edge.css','utf8')+' .user-is-guest .nav-menu-wrapper{display:none}'});
    await page.addScriptTag({content:code});
    const trigger=page.locator('.cc-mobile-edge-trigger'),panel=page.locator('.cc-mobile-edge');
    await trigger.click();
    assert.equal(await panel.getByRole('button',{name:'Pełne menu — wszystkie funkcje',exact:true}).isVisible(),false);
    assert.equal(await panel.getByRole('link',{name:'Konto i logowanie LUMINA',exact:true}).getAttribute('href'),'/lumina-login');
    await page.evaluate(()=>document.documentElement.dataset.luminaTheme='light');
    assert.equal(await panel.evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(255, 250, 255)');
    await page.keyboard.press('Escape');
    // Synthetic UI state only: no authentication, account lookup or private messages.
    await page.evaluate(()=>{
      document.body.classList.remove('user-is-guest');
      document.querySelector('#topNavMenuBtn').onclick=e=>{e.stopPropagation();document.body.dataset.originalMenu='open';};
      document.addEventListener('click',e=>{if(!e.target.closest('.nav-menu-wrapper'))delete document.body.dataset.originalMenu;});
    });
    await trigger.click();
    await panel.getByRole('button',{name:'Pełne menu — wszystkie funkcje',exact:true}).click();
    assert.equal(await page.evaluate(()=>document.body.dataset.originalMenu),'open');
    await page.goto('https://edge.invalid/mess');
    await page.addScriptTag({content:code});
    assert.equal(await page.locator('.cc-mobile-edge-trigger').count(),0);
    assert.equal(await page.locator('dialog').count(),0);
    assert.equal(await page.locator('#topNavMenuBtn').getAttribute('data-cc-edge-mounted'),null);
  } finally {await browser.close();}
});

test('edge actions: favorite and info buttons present, 44px touch targets, mobile suppression of topbar star and floating info trigger', async () => {
  const browser = await chromium.launch({headless:true,channel:'chrome'});
  try {
    const page = await browser.newPage({viewport:{width:390,height:640}});
    await page.route('https://edge.invalid/**', route => route.fulfill({
      contentType: 'text/html',
      body: '<script data-cc-edge-profile="home"></script><header><button id="hamburgerBtn">Menu</button><div id="quickActionsMenu"><button id="ccTopBarFavBtn" class="cc-topbar-fav-btn" data-cc-favorite-toggle="true">Fav</button><button id="actionsToggleBtn">All</button></div></header><button id="ekoccInfoTriggerBtn" class="ekocc-info-trigger" data-ekocc-info-trigger="true">Info</button>'
    }));
    await page.goto('https://edge.invalid/');
    await page.addStyleTag({content: fs.readFileSync('css/cc-mobile-edge.css','utf8')});
    await page.addScriptTag({content: fs.readFileSync('js/cc-mobile-edge.js','utf8')});

    // Mobile: #ccTopBarFavBtn and #ekoccInfoTriggerBtn are suppressed via CSS
    assert.equal(await page.locator('#ccTopBarFavBtn').isVisible(), false, 'Top bar favorite button must be hidden on mobile');
    assert.equal(await page.locator('#ekoccInfoTriggerBtn').isVisible(), false, 'Floating info trigger must be hidden on mobile');

    const trigger = page.locator('.cc-mobile-edge-trigger'), panel = page.locator('.cc-mobile-edge');
    await trigger.click();

    // In panel: favorite toggle button exists, >= 44x44
    const favBtn = panel.locator('[data-cc-favorite-toggle]');
    assert.equal(await favBtn.count(), 1);
    const favBox = await favBtn.boundingBox();
    assert.ok(favBox.width >= 44 && favBox.height >= 44, 'Favorite button must satisfy >= 44x44px touch target');

    // In panel: info button exists, >= 44x44
    const infoBtn = panel.locator('[data-ekocc-info-trigger]');
    assert.equal(await infoBtn.count(), 1);
    const infoBox = await infoBtn.boundingBox();
    assert.ok(infoBox.width >= 44 && infoBox.height >= 44, 'Info button must satisfy >= 44x44px touch target');

    // Interactive handoff: click info button closes panel
    await page.evaluate(() => {
      window.ekoccInfo = { open: () => { document.body.dataset.infoOpened = 'true'; } };
    });
    await infoBtn.click();
    assert.equal(await panel.isVisible(), false, 'Clicking info button must close edge panel');
    assert.equal(await page.evaluate(() => document.body.dataset.infoOpened), 'true', 'Clicking info button must trigger ekoccInfo.open()');

    // Desktop: recovery of top bar favorite button and floating info trigger
    await page.setViewportSize({width: 1280, height: 900});
    await page.waitForTimeout(40);
    assert.equal(await page.locator('#ccTopBarFavBtn').isVisible(), true, 'Top bar favorite button must be visible on desktop');
    assert.equal(await page.locator('#ekoccInfoTriggerBtn').isVisible(), true, 'Floating info trigger must be visible on desktop');
    assert.equal(await trigger.isVisible(), false, 'Mobile edge trigger must be hidden on desktop');
  } finally { await browser.close(); }
});
