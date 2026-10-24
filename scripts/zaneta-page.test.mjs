import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Window} from 'happy-dom';
const html=fs.readFileSync('Zaneta/index.html','utf8'),script=fs.readFileSync('Zaneta/app.js','utf8');
function mount(setup=()=>{}) {
  const w=new Window({url:'https://polskieradio.cc/%C5%BBaneta',settings:{enableJavaScriptEvaluation:true,disableJavaScriptFileLoading:true,disableCSSFileLoading:true,disableIframePageLoading:true}});
  w.document.write(html);setup(w);w.eval(script);return w;
}
test('contact and shipping preserve the approved offer without collecting addresses or sending SMS',()=>{
  const w=mount(),d=w.document;
  assert.equal(d.querySelectorAll('h1').length,1);
  assert.equal(d.querySelectorAll('form').length,0);
  assert.equal(d.querySelectorAll('a[href="sms:+48799082024?body=Biblia"]').length,2);
  assert.equal(d.querySelectorAll('a[href="tel:+48799082024"]').length,2);
  assert.ok(d.querySelector('a[href="https://www.facebook.com/share/1F7382kD6P/"]'));
  assert.match(d.querySelector('.shipping-box').textContent,/koszt przesyłki/);
  assert.match(d.querySelector('.mission small').textContent,/nie jest warunkiem/);
  assert.equal(d.querySelector('link[rel=canonical]').href,'https://polskieradio.cc/%C5%BBaneta');
  assert.doesNotMatch(html,/wymaga zgody|należy zweryfikować|robocz|Mission Control|makieta-/i);
  for(const el of d.querySelectorAll('img,script[src],link[rel=stylesheet]')) assert.ok((el.getAttribute('src')||el.getAttribute('href')).startsWith('/'));
  w.close();
});
test('testimony is preloaded once without autoplay; hero preserves the supplied full composition',()=>{
  const w=mount(),d=w.document;
  assert.equal(d.querySelectorAll('iframe').length,1);
  assert.equal(d.querySelector('iframe').src,'https://www.youtube-nocookie.com/embed/XuMzhfeYNWU');
  assert.equal(d.querySelector('iframe').getAttribute('loading'),'eager');
  assert.doesNotMatch(d.querySelector('iframe').src,/autoplay/);
  assert.equal(d.querySelectorAll('.video-load').length,0);
  const hero=d.querySelector('.hero-art img');
  assert.equal(hero.getAttribute('src'),'/Zaneta/assets/zaneta-hero-20261024.png');
  assert.equal(hero.getAttribute('width'),'1672');assert.equal(hero.getAttribute('height'),'941');
  assert.match(html,/Odtwarzacz YouTube jest wczytywany wraz ze stroną/);
  w.close();
});
test('radio actual playing, Stop, failed start and late promise remain truthful',async()=>{
  let resolvePlay,calls=0,paused=true;
  const w=mount(win=>{
    win.HTMLMediaElement.prototype.play=function(){paused=false;return ++calls===1?new Promise(r=>resolvePlay=r):Promise.reject(Error('offline'));};
    win.HTMLMediaElement.prototype.pause=function(){paused=true;};
    win.HTMLMediaElement.prototype.load=function(){};
  });
  const d=w.document,a=d.getElementById('zaneta-radio-audio'),b=d.getElementById('radio-toggle');
  assert.equal(a.getAttribute('src'),null);
  b.click();assert.match(d.getElementById('radio-status').textContent,/Łączenie/);
  a.dispatchEvent(new w.Event('playing'));assert.match(d.getElementById('radio-status').textContent,/Słuchasz/);
  b.click();resolvePlay();await new Promise(r=>setTimeout(r,0));
  assert.equal(b.getAttribute('aria-pressed'),'false');assert.equal(a.getAttribute('src'),null);assert.equal(paused,true);
  b.click();await new Promise(r=>setTimeout(r,0));assert.match(d.getElementById('radio-status').textContent,/Nie udało/);assert.equal(b.getAttribute('aria-pressed'),'false');w.close();
});
test('canonical milion uses only the fake transport and reports once',async()=>{
  const sent=[];
  const w=mount(win=>{
    win.HTMLMediaElement.prototype.play=()=>Promise.resolve();win.HTMLMediaElement.prototype.pause=()=>{};win.HTMLMediaElement.prototype.load=()=>{};
    Object.defineProperty(win.navigator,'sendBeacon',{value:(url,body)=>{sent.push({url,body});return true;}});
  });
  w.eval(fs.readFileSync('js/cc-radio-milion.js','utf8'));
  w.document.getElementById('radio-toggle').click();await new Promise(r=>setTimeout(r,0));
  w.document.getElementById('zaneta-radio-audio').dispatchEvent(new w.Event('play'));
  assert.equal(sent.length,1);assert.equal(sent[0].url,'/api/milion/count');
  assert.deepEqual(JSON.parse(await sent[0].body.text()),{type:'radio'});w.close();
});
test('support and favorites use distinct icons; canonical UTF-8 section links stay same origin',()=>{
  const w=mount(win=>{win.matchMedia=()=>({matches:true,addEventListener(){}});win.HTMLDialogElement.prototype.showModal=function(){this.open=true;};win.eval(fs.readFileSync('js/cc-mobile-edge.js','utf8'));});
  const d=w.document,dialog=d.getElementById('cc-mobile-edge-dialog'),star=dialog.querySelector('[data-cc-favorite-toggle] path').getAttribute('d');
  assert.notEqual(star,dialog.querySelector('a[href="/wspieraj"] path').getAttribute('d'));
  assert.equal([...dialog.querySelectorAll('path')].filter(p=>p.getAttribute('d')===star).length,1);
  assert.ok(dialog.querySelector('a[href="/%C5%BBaneta#biblia"]'));w.close();
});
test('share cancellation stays quiet and clipboard fallback copies the canonical address',async()=>{
  for(const cancel of [true,false]) {
    let copied='';
    const w=mount(win=>{if(cancel)Object.defineProperty(win.navigator,'share',{value:async()=>{const e=new Error();e.name='AbortError';throw e;}});else Object.defineProperty(win.navigator,'clipboard',{value:{writeText:async s=>{copied=s;}}});});
    w.document.getElementById('share-page').click();await new Promise(r=>setTimeout(r,0));
    if(cancel) assert.equal(w.document.getElementById('share-status').textContent,'');else assert.equal(copied,'https://polskieradio.cc/%C5%BBaneta');w.close();
  }
});
test('map and search retain Ewa and include exactly one Zaneta record',()=>{
  for(const f of ['data/cc-search-index.json','szukaj/catalog.json']) {
    const data=JSON.parse(fs.readFileSync(f,'utf8'));assert.equal(data.items.filter(i=>i.url==='https://polskieradio.cc/%C5%BBaneta').length,1);assert.ok(data.items.some(i=>i.url==='https://polskieradio.cc/Ewa'));assert.equal(data.totalItems,data.items.length);
  }
  assert.ok(JSON.parse(fs.readFileSync('data/ecosystem-map.json','utf8')).nodes.some(n=>n.id==='zaneta-cc-women'));
});
