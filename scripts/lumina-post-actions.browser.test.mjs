import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium} from 'playwright';

const fixture=id=>`<article data-post-id="${id}" style="max-width:680px;margin:16px auto;background:var(--card);border:1px solid #a0804055;border-radius:18px;overflow:hidden"><p style="padding:16px">WERSJA TESTOWA — pasek działań, bez danych użytkowników</p>
 <div class="post-actions-bar"><div><button class="post-action-btn action-like" onclick="window.calls.push('like')" title="Polubienie">♥ <span class="count">0</span></button><button class="post-action-btn action-amen" onclick="window.calls.push('amen')" title="Amen!">Amen</button><button class="post-action-btn action-pray-now" onclick="window.calls.push('prayer')" title="Modlitwa SOS">♧ <span class="pray-sos-badge">SOS</span></button><button class="post-action-btn action-comments action-icon-only" onclick="window.calls.push('comments')" title="Komentarze"><i>☏</i><span class="btn-text">Komentarze (0)</span></button><button class="post-action-btn action-story action-icon-only" onclick="window.calls.push('story')" title="Stwórz Kartę Story 9:16"><i>✦</i><span class="btn-text"> Story</span></button></div><div><button class="post-action-btn action-report action-icon-only" onclick="window.calls.push('report')" title="Zgłoś naruszenie"><i>⚑</i></button><button class="post-action-btn action-share action-icon-only" onclick="window.calls.push('generic')" title="Udostępnij"><i>↗</i></button></div><div hidden><button class="post-action-btn action-pin" onclick="window.calls.push('admin')">Admin</button></div></div>
 <div class="post-share-dock" data-share-post-id="${id}"><div class="post-share-dock-actions">${[['lumina','LUMINA','L'],['wa','WhatsApp','WA'],['fb','Facebook','f'],['tg','Telegram','TG'],['x','X','X'],['mail','E-mail','@'],['copy','Kopiuj link','🔗'],['more','Więcej aplikacji','↗']].map(([cls,label,glyph])=>`<button class="post-share-btn share-${cls}" aria-label="${label}" title="${label}" onclick="window.calls.push('${cls}')">${glyph}</button>`).join('')}</div></div></article>`;

test('post actions: only heart/comments/Facebook, disclosure preserves functions, re-render, safe sharing and themes',async()=>{
  const browser=await chromium.launch({headless:true,channel:'chrome'});
  try {
    const page=await browser.newPage();
    const css=process.env.CC_POST_ACTIONS_BASE?await(await fetch(process.env.CC_POST_ACTIONS_BASE+'/css/lumina-post-actions.css?v=20261021_1')).text():fs.readFileSync('css/lumina-post-actions.css','utf8');
    const code=process.env.CC_POST_ACTIONS_BASE?await(await fetch(process.env.CC_POST_ACTIONS_BASE+'/js/lumina-post-actions.js?v=20261021_1')).text():fs.readFileSync('js/lumina-post-actions.js','utf8');
    await page.route('https://post-actions.invalid/**',route=>route.fulfill({contentType:'text/html; charset=utf-8',body:`<meta charset="utf-8"><div id="feedStream1x1">${fixture('test-post')}</div><button id="outside">Poza wpisem</button>`}));
    await page.goto('https://post-actions.invalid/tablica');
    await page.addStyleTag({content:fs.readFileSync('css/lumina-mobile-premium.css','utf8')+`body{margin:0;background:#0b1120;color:#eee;--card:#172438;font:16px system-ui}button{background:#16243a;border:1px solid #c4a35a55;color:inherit;cursor:pointer}.post-actions-bar{padding:12px}.post-share-btn{border-radius:50%}html[data-lumina-theme=light] body{background:#faf8f2;color:#765414;--card:#fff}html[data-lumina-theme=light] button{background:#f5f1e8;color:#765414}`+css});
    await page.evaluate(()=>{window.calls=[];window.open=(...args)=>{window.calls.push(args);return null;};});
    await page.addScriptTag({content:code});await page.addScriptTag({content:code});
    await page.locator('.cc-post-more').waitFor();
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    for(const theme of ['dark','light'])for(const width of [320,390,430,1280]) {
      await page.setViewportSize({width,height:820});await page.evaluate(value=>document.documentElement.dataset.luminaTheme=value,theme);
      const bar=page.locator('.cc-post-compact').first(),primary=bar.locator('.cc-post-primary');
      assert.equal(await primary.locator('button:visible').count(),3);
      assert.deepEqual(await primary.locator('button').evaluateAll(els=>els.map(el=>el.getAttribute('aria-label'))),['Polub wpis','Komentarze','Udostępnij na Facebooku']);
      assert.equal(await page.locator('.post-share-dock').isVisible(),false);
      assert.equal(await bar.locator('.action-pin').isVisible(),false);
      const sizes=await primary.locator('button').evaluateAll(els=>els.map(el=>({w:el.getBoundingClientRect().width,h:el.getBoundingClientRect().height})));
      assert.ok(sizes.every(s=>s.w>=44&&s.h>=44));
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
      await primary.locator('.action-like').click();await primary.locator('.action-comments').click();
      assert.deepEqual(await page.evaluate(()=>window.calls.slice(-2)),['like','comments']);
      await bar.locator('.cc-post-more').click();assert.equal(await bar.locator('.cc-post-overflow').isVisible(),true);
      assert.equal(await bar.locator('.cc-post-more').getAttribute('aria-expanded'),'true');
      assert.equal(await bar.locator('.cc-post-overflow .action-share').count(),0,'duplicate generic share hidden, canonical more retained');
      assert.equal(await bar.locator('.cc-post-overflow button:visible').count(),11);
      const textColor=await bar.locator('.cc-post-more').evaluate(el=>getComputedStyle(el).color);
      assert.equal(textColor,theme==='light'?'rgb(118, 84, 20)':'rgb(226, 204, 154)');
      const labelSizes=await bar.locator('.cc-post-overflow .cc-post-action-label').evaluateAll(els=>els.map(el=>({w:el.getBoundingClientRect().width,h:el.getBoundingClientRect().height})));
      assert.ok(labelSizes.every(size=>size.w>0&&size.h>0),'overflow action labels must remain visible despite legacy icon-only CSS');
      for(const action of ['amen','pray-now','story','report'])assert.equal(await bar.locator('.cc-post-overflow .action-'+action).isVisible(),true);
      const storyHeight=await bar.locator('.cc-post-overflow .action-story').evaluate(el=>el.getBoundingClientRect().height);
      const reportHeight=await bar.locator('.cc-post-overflow .action-report').evaluate(el=>el.getBoundingClientRect().height);
      assert.ok(storyHeight<=54&&storyHeight>=40,`action-story height must be ~44px, got ${storyHeight}`);
      assert.ok(reportHeight<=54&&reportHeight>=40,`action-report height must be ~44px, got ${reportHeight}`);
      if(width===390&&process.env.CC_POST_ACTIONS_SCREENSHOT) await page.screenshot({path:process.env.CC_POST_ACTIONS_SCREENSHOT.replace('.png',`-${theme}.png`)});
      await page.keyboard.press('Escape');assert.equal(await bar.locator('.cc-post-overflow').isVisible(),false);
      assert.equal(await bar.locator('.cc-post-more').evaluate(el=>el===document.activeElement),true);
    }
    const bar=page.locator('.cc-post-compact').first();
    await bar.locator('.share-fb').click();const facebook=await page.evaluate(()=>window.calls.at(-1));
    const target=new URL(facebook[0]);assert.equal(target.origin,'https://www.facebook.com');
    assert.equal(new URL(target.searchParams.get('u')).searchParams.get('post'),'test-post');assert.equal(facebook[2],'noopener,noreferrer');
    await page.evaluate(()=>window.sharePostDirect=(id,channel)=>window.calls.push({id,channel}));
    await bar.locator('.share-fb').click();assert.deepEqual(await page.evaluate(()=>window.calls.at(-1)),{id:'test-post',channel:'facebook'});
    await bar.locator('.cc-post-more').click();await bar.locator('.share-wa').click();assert.equal(await page.evaluate(()=>window.calls.at(-1)),'wa');assert.equal(await bar.locator('.cc-post-overflow').isVisible(),false);
    await bar.locator('.cc-post-more').click();await bar.locator('.share-lumina').evaluate(el=>el.hidden=true);assert.equal(await bar.locator('.share-lumina').isVisible(),false);await bar.locator('.share-lumina').evaluate(el=>el.hidden=false);await page.keyboard.press('Escape');
    await bar.locator('.cc-post-more').click();await page.locator('#outside').click();assert.equal(await bar.locator('.cc-post-overflow').isVisible(),false);
    await page.evaluate(html=>document.getElementById('feedStream1x1').insertAdjacentHTML('beforeend',html),fixture('second-post'));
    await page.waitForFunction(()=>document.querySelectorAll('.cc-post-compact').length===2);
    await page.locator('.cc-post-more').first().click();await page.locator('.cc-post-more').last().click();
    assert.equal(await page.locator('.cc-post-overflow:not([hidden])').count(),1);
    await page.evaluate(html=>document.getElementById('feedStream1x1').innerHTML=html,fixture('rerender-post'));
    await page.waitForFunction(()=>document.querySelectorAll('.cc-post-compact').length===1);
    assert.equal(await page.locator('.cc-post-primary').count(),1);assert.deepEqual(errors,[]);
  }finally{await browser.close();}
});

test('both board themes load exactly one matching enhancement pair, without changing auth or renderer',()=>{
  for(const file of ['lumina-tablica.html','lumina-tablica-light.html']){
    const html=fs.readFileSync(file,'utf8');
    assert.equal((html.match(/src="\/js\/lumina-post-actions\.js\?v=20261021_1"/g)||[]).length,1);
    assert.equal((html.match(/href="\/css\/lumina-post-actions\.css\?v=20261021_1"/g)||[]).length,1);
    assert.ok(html.includes('window.buildPostShareDockHtml = function(item)'));
  }
});
