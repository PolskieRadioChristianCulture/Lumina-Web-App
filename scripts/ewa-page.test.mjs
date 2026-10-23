import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Window } from 'happy-dom';
const html = readFileSync('Ewa/index.html','utf8');
const script = readFileSync('Ewa/app.js','utf8');
const ids = ['5Qb-6dR3Y1U','TiDU417xvmk','YK_7IXZyM1w','P76aoV15rtM','GRgKy0cms_I','PCX6x8w2LBw','Bu6G2ihCumk'];
function mount(setup = () => {}) {
  const w = new Window({url:'https://polskieradio.cc/Ewa', settings:{enableJavaScriptEvaluation:true,disableJavaScriptFileLoading:true,disableCSSFileLoading:true,disableIframePageLoading:true}});
  w.document.write(html);
  setup(w); w.eval(script); return w;
}
test('Ewa preserves all supplied videos, canonical assets and voluntary support', () => {
  const w=mount(), d=w.document;
  assert.equal(d.querySelectorAll('h1').length,1);
  assert.deepEqual([...d.querySelectorAll('[data-video]')].map(b=>b.dataset.video),ids);
  assert.equal(d.querySelectorAll('iframe, object').length,0);
  assert.equal(d.querySelectorAll('a[href="/wspieraj"]').length,4);
  assert.match(html,/https:\/\/www.youtube.com\/@CCWomen7/);
  assert.equal(d.querySelector('link[rel=canonical]').href,'https://polskieradio.cc/Ewa');
  for(const e of d.querySelectorAll('img, script[src], link[rel=stylesheet]')) assert.ok((e.getAttribute('src')||e.getAttribute('href')).startsWith('/'));
  assert.doesNotMatch(html,/robocze|do weryfikacji|START_ANTIGRAVITY|Mission Control/i);
  w.close();
});
test('each video loads once, only on demand, and untrusted IDs never reach iframe URL', () => {
  const w=mount(), d=w.document, buttons=[...d.querySelectorAll('.video-load')];
  for(const [i,b] of buttons.entries()) {
    b.click(); b.click();
    const frames=[...d.querySelectorAll('iframe')];
    assert.equal(frames.length,i+1);
    assert.equal(frames[i].src,'https://www.youtube-nocookie.com/embed/'+ids[i]);
    assert.equal(frames[i].hasAttribute('autoplay'),false);
  }
  w.close();
  const bad=mount(win=>{win.document.querySelector('.video-load').dataset.video='https://evil.invalid';});
  bad.document.querySelector('.video-load').click();
  assert.equal(bad.document.querySelectorAll('iframe').length,0);bad.close();
});
test('PDF reader stays unloaded until explicitly expanded, then mounts once', () => {
  const w=mount(), d=w.document, reader=d.querySelector('.reader');
  reader.dispatchEvent(new w.Event('toggle')); assert.equal(d.querySelectorAll('object').length,0);
  reader.open=true; reader.dispatchEvent(new w.Event('toggle'));reader.dispatchEvent(new w.Event('toggle'));
  assert.equal(d.querySelectorAll('object').length,1);
  assert.match(d.querySelector('object').data,/swiadectwo-ewy-jak-poznalam-prawde\.pdf#view=FitH$/);
  assert.equal(d.querySelectorAll('a[href$=".pdf"]').length,3);w.close();
});
test('sharing never claims success on cancellation or failure; clipboard has actual URL', async () => {
  for(const result of ['cancel','failure','clipboard']) {
    let copied='';
    const w=mount(win=>{
      if(result==='clipboard') Object.defineProperty(win.navigator,'clipboard',{value:{writeText:async value=>{copied=value;}}});
      else Object.defineProperty(win.navigator,'share',{value:async()=>{const e=new Error();e.name=result==='cancel'?'AbortError':'NotAllowedError';throw e;}});
    });
    w.document.getElementById('share-page').click();await new Promise(resolve=>setTimeout(resolve,0));
    const status=w.document.getElementById('share-status').textContent;
    if(result==='cancel') assert.equal(status,'');
    if(result==='failure') assert.match(status,/Skopiuj adres/);
    if(result==='clipboard') {assert.equal(copied,'https://polskieradio.cc/Ewa');assert.match(status,/Link skopiowany/);}
    w.close();
  }
});
test('Ewa is discoverable without removing existing catalog entries', () => {
  for(const name of ['data/cc-search-index.json','szukaj/catalog.json']) {
    const doc=JSON.parse(readFileSync(name,'utf8'));
    assert.equal(doc.items.filter(i=>i.url==='https://polskieradio.cc/Ewa').length,1);
    assert.equal(doc.totalItems,doc.items.length);
  }
  const map=JSON.parse(readFileSync('data/ecosystem-map.json','utf8'));
  assert.ok(map.nodes.some(n=>n.id==='ewa-cc-women'&&n.connections.includes('yt-cc-women')));
  assert.match(readFileSync('_redirects','utf8'),/^\/Ewa \/Ewa\/index.html 200$/m);
});
test('radio stays unloaded until click, reflects actual playback and stops the connection', async () => {
  let playCalls=0, pauses=0, loads=0;
  const w=mount(win=>{
    win.HTMLMediaElement.prototype.play=function(){playCalls++;return Promise.resolve();};
    win.HTMLMediaElement.prototype.pause=function(){pauses++;};
    win.HTMLMediaElement.prototype.load=function(){loads++;};
  });
  const d=w.document, audio=d.getElementById('ewa-radio-audio'), button=d.getElementById('radio-toggle');
  assert.equal(audio.getAttribute('src'),null);assert.equal(playCalls,0);
  button.click();await Promise.resolve();
  assert.equal(audio.src,'https://stream.zeno.fm/vz96pvl3pnktv');
  assert.match(d.getElementById('radio-status').textContent,/Łączenie/);
  audio.dispatchEvent(new w.Event('playing'));
  assert.match(d.getElementById('radio-status').textContent,/Słuchasz/);
  button.click();assert.equal(button.getAttribute('aria-pressed'),'false');
  assert.equal(audio.getAttribute('src'),null);assert.ok(pauses>0&&loads>0);
  w.close();
});
test('late play promise after Stop cannot restore playback; failed play permits retry', async () => {
  let resolvePlay, calls=0;
  const w=mount(win=>{
    win.HTMLMediaElement.prototype.play=function(){calls++;return calls===1?new Promise(r=>{resolvePlay=r;}):Promise.reject(Error('offline'));};
    win.HTMLMediaElement.prototype.pause=function(){};
    win.HTMLMediaElement.prototype.load=function(){};
  });
  const d=w.document, b=d.getElementById('radio-toggle');
  b.click();b.click();resolvePlay();await new Promise(resolve=>setTimeout(resolve,0));
  assert.equal(b.getAttribute('aria-pressed'),'false');assert.match(d.getElementById('radio-status').textContent,/zatrzymane/);
  b.click();await new Promise(resolve=>setTimeout(resolve,0));
  assert.equal(b.getAttribute('aria-pressed'),'false');assert.match(d.getElementById('radio-status').textContent,/Nie udało/);
  w.close();
});
test('canonical milion integration reports one radio start per page, using only fake transport', async () => {
  const sent=[];
  const w=mount(win=>{
    win.HTMLMediaElement.prototype.play=function(){return Promise.resolve();};
    win.HTMLMediaElement.prototype.pause=function(){};
    win.HTMLMediaElement.prototype.load=function(){};
    Object.defineProperty(win.navigator,'sendBeacon',{value:(url,body)=>{sent.push({url,body});return true;}});
  });
  w.eval(readFileSync('js/cc-radio-milion.js','utf8'));
  w.document.getElementById('radio-toggle').click();await Promise.resolve();await Promise.resolve();
  const audio=w.document.getElementById('ewa-radio-audio');
  audio.dispatchEvent(new w.Event('play'));audio.dispatchEvent(new w.Event('play'));
  assert.equal(sent.length,1);assert.equal(sent[0].url,'/api/milion/count');
  assert.deepEqual(JSON.parse(await sent[0].body.text()),{type:'radio'});
  assert.equal(w.document.querySelectorAll('script[src*="cc-radio-milion"]').length,1);
  assert.equal(w.document.querySelector('.radio-milion').getAttribute('href'),'/milion');
  w.close();
});
test('an old queued pause event cannot stop a newly playing stream', async () => {
  let paused=true;
  const w=mount(win=>{
    win.HTMLMediaElement.prototype.play=function(){paused=false;return Promise.resolve();};
    win.HTMLMediaElement.prototype.pause=function(){paused=true;};
    win.HTMLMediaElement.prototype.load=function(){};
  });
  const d=w.document, audio=d.getElementById('ewa-radio-audio'), button=d.getElementById('radio-toggle');
  Object.defineProperty(audio,'paused',{get:()=>paused});
  button.click();button.click();button.click();
  audio.dispatchEvent(new w.Event('pause'));
  assert.equal(button.getAttribute('aria-pressed'),'true');
  paused=true;audio.dispatchEvent(new w.Event('pause'));
  assert.equal(button.getAttribute('aria-pressed'),'false');w.close();
});
