import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
import { Window } from 'happy-dom';

const html = await readFile('wizytowka/index.html', 'utf8');
const catalog = JSON.parse(await readFile('pobierz/catalog.json', 'utf8'));

test('both wizytowka routes keep the same repertoire and approved CC playlist sources', async () => {
  assert.equal(await readFile('wizytowka.html', 'utf8'), html);
  const stations = vm.runInNewContext(html.match(/var STATIONS = (\[[\s\S]*?\]);/)[1]);
  assert.equal(stations.length, 11);
  assert.equal(stations.filter(s => s.live).length, 3);
  for (const [index, id] of [[6, 'bcm-playlist'], [2, 'apokalipsa-playlist']]) {
    const source = catalog.find(item => item.id === id);
    assert.equal(source.status, 'approved');
    assert.equal(source.visibility, 'public');
    assert.equal(new URL(source.external).searchParams.get('list'), stations[index].yt);
  }
});

test('requested native channels resolve through the canonical catalogue and real audio queues', async () => {
  const scope = {window:{}};
  vm.runInNewContext(await readFile('js/cc-radio-catalog.js','utf8'),scope);
  const stations = vm.runInNewContext(html.match(/var STATIONS = (\[[\s\S]*?\]);/)[1]);
  const native = stations.filter(s=>s.nativeId);
  assert.equal(native.length,6);
  assert.deepEqual(Array.from(native,s=>s.nativeId),['poland','biblia_audio','global','instrumental_worship','biblia_spiewana','global_biblia']);
  for(const choice of native){
    const source=scope.window.CCRadioStations.find(s=>s.id===choice.nativeId);
    assert.ok(source?.streamUrl);
    if(!choice.live){
      const queue=JSON.parse(await readFile(source.playlistUrl.slice(1),'utf8'));
      assert.ok(queue.length>1);
      for(const track of queue){
        const url=new URL(track.url,'https://polskieradio.cc/');
        assert.ok(url.protocol==='https:');
        if(url.hostname==='polskieradio.cc') assert.ok((await readFile(decodeURIComponent(url.pathname.slice(1)))).length>0);
      }
    }
  }
  assert.match(html,/cc-radio-catalog\.js/);
  assert.match(html,/cc-chat-radio\.js/);
  assert.doesNotMatch(html,/var audio = new Audio/);
});

test('new recordings are selectable without autoplay, load the real playlist, and never claim LIVE', async () => {
  const win = new Window({url:'http://127.0.0.1:8853/wizytowka/index.html',settings:{disableJavaScriptEvaluation:true,disableJavaScriptFileLoading:true,disableCSSFileLoading:true,disableIframePageLoading:true}});
  const calls = [];
  let options;
  try {
    win.document.write(html);
    const append = win.document.head.appendChild.bind(win.document.head);
    win.document.head.appendChild = node => node.tagName === 'SCRIPT' ? node : append(node);
    const player = { pauseVideo(){}, loadPlaylist(value){ calls.push(value); } };
    const context = vm.createContext({
      window: win, document: win.document, Audio: class { pause(){} },
      YT: {PlayerState:{PLAYING:1,PAUSED:2},Player:function(_id,opts){options=opts;return player;}},
      track(){}, refreshCount(){}, setTimeout(){}, clearTimeout(){},
      navigator:{sendBeacon(){return true;}}, Blob,
    });
    const start = html.indexOf('  // Odsłuchy:');
    const end = html.indexOf('  // Licznik misji z serwera', start);
    assert.ok(start > 0 && end > start);
    vm.runInContext(html.slice(start, end), context);
    for (const [iteration,index] of [6,2].entries()) {
      win.document.querySelector(`.station[data-index="${index}"]`).click();
      assert.equal(win.document.querySelector('[data-mini-num]').textContent, `${index+1}/11`);
      assert.equal(win.document.querySelector(`.station[data-index="${index}"]`).getAttribute('aria-pressed'),'true');
      assert.equal(calls.length,iteration);
      win.document.querySelector('[data-play]').click();
      if (index === 6) { win.onYouTubeIframeAPIReady(); options.events.onReady(); }
      await new Promise(resolve => setImmediate(resolve));
      assert.equal(calls.at(-1).list, new URL(catalog.find(s=>s.id===(index===6?'bcm-playlist':'apokalipsa-playlist')).external).searchParams.get('list'));
      assert.equal(calls.at(-1).listType,'playlist');
      options.events.onStateChange({data:1});
      assert.match(win.document.querySelector('[data-status]').textContent,/Nagrania YouTube:/);
      assert.doesNotMatch(win.document.querySelector('[data-mini-pos]').textContent,/na żywo/);
      win.document.querySelector('[data-play]').click();
    }
  } finally { await win.happyDOM.close(); }
});
