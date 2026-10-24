import test, {after} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {Window} from 'happy-dom';
import worker from '../_worker.js';

const windows = [];
after(async () => { for (const win of windows) await win.happyDOM.close(); });
const quiet = {log(){}, warn(){}, error(){}};
async function fixture(file, marker) {
  const html = await readFile(file, 'utf8');
  const win = new Window({url:'https://polskieradio.cc/' + file, settings:{disableJavaScriptEvaluation:true,disableJavaScriptFileLoading:true,disableCSSFileLoading:true,disableIframePageLoading:true}});
  windows.push(win);
  win.document.write(html);
  const source = Array.from(win.document.scripts).map(s => s.textContent).find(s => s.includes(marker));
  assert.ok(source);
  const timers = new Map(); let nextTimer = 0;
  const context = vm.createContext({window:win,document:win.document,localStorage:win.localStorage,navigator:win.navigator,matchMedia:win.matchMedia.bind(win),console:quiet,URLSearchParams,CustomEvent:win.CustomEvent,
    setTimeout(fn){timers.set(++nextTimer,fn);return nextTimer;},clearTimeout(id){timers.delete(id);},setInterval(){return 1;},clearInterval(){},fetch:async()=>{throw new Error('network disabled');}});
  vm.runInContext(source, context);
  return {win,context,html,run:code=>vm.runInContext(code,context),flush(){const pending=[...timers.values()];timers.clear();pending.forEach(fn=>fn());}};
}

test('radio UI follows actual media events and ignores late YouTube events',async()=>{
  const {win,run}=await fixture('player.html','const LIVE_STATIONS');
  const audio=win.document.getElementById('native-audio');
  run('setPlaybackState(false)');
  audio.dispatchEvent(new win.Event('playing'));
  assert.equal(win.document.getElementById('player-main-play-btn').getAttribute('aria-pressed'),'true');
  run('onPlayerStateChange({data: 1})'); // no YouTube SDK required for a native stream
  audio.dispatchEvent(new win.Event('pause'));
  assert.equal(win.document.getElementById('player-main-play-btn').getAttribute('aria-pressed'),'false');
  audio.dispatchEvent(new win.Event('error'));
  assert.match(win.document.getElementById('playback-status').textContent,/Nie można/);
});

test('native live stream has no fabricated queue or seek',async()=>{
  const {win,run}=await fixture('player.html','const LIVE_STATIONS');
  run('renderQueue();setPlaybackState(false);skipSeconds(15)');
  assert.equal(win.document.getElementById('seek-bar').disabled,true);
  assert.match(win.document.getElementById('queue-container').textContent,/nie udostępnia kolejki/);
  assert.equal(win.document.querySelectorAll('#queue-container button').length,0);
  assert.equal(win.document.getElementById('queue-shuffle').disabled,true);
});

test('YouTube readiness and playback are confirmed by callbacks, queue uses real playlist indexes',async()=>{
  const {win,run,context}=await fixture('player.html','const LIVE_STATIONS');
  const calls=[];
  context.fakeYT={loadPlaylist:x=>calls.push(x),getPlaylist:()=>['actual-video-a','actual-video-b'],getVideoData:()=>({}),playVideoAt:index=>calls.push(index)};
  context.YT={PlayerState:{PLAYING:1,PAUSED:2,ENDED:0,BUFFERING:3}};
  run("activeEngine='youtube';ytPlayer=fakeYT;ytReady=false;currentItem={id:'actual-playlist'};loadSelectedYouTube()");
  assert.equal(calls.length,0);
  run('ytReady=true;loadSelectedYouTube();renderQueue()');
  assert.equal(calls[0].list,'actual-playlist');
  assert.equal(win.document.getElementById('player-main-play-btn').getAttribute('aria-pressed'),'false');
  assert.equal(win.document.querySelectorAll('#queue-container button').length,0);
  run('onPlayerStateChange({data:1});playQueueTrack(1)');
  assert.equal(calls.at(-1),1);
  assert.equal(win.document.querySelectorAll('#queue-container button').length,2);
});

test('local library really persists, and storage failure never announces success',async()=>{
  const {win,run,context}=await fixture('player.html','const LIVE_STATIONS');
  run('addToPlaylist()');
  assert.equal(JSON.parse(win.localStorage.getItem('cc-player-library-v1'))[0].id,'biblia');
  context.localStorage={getItem(){return '[]';},setItem(){throw new Error('quota');}};
  run('addToPlaylist()');
  assert.match(win.document.getElementById('playback-status').textContent,/Nie udało się zapisać/);
});

test('counter database outage cannot return a fabricated successful count',async()=>{
  for(const method of ['GET','POST']) {
    for(const env of [{},{milion_db:{prepare(){throw new Error('offline');}}}]) {
      const response=await worker.fetch(new Request('https://polskieradio.cc/api/milion/count',{method}),env,{});
      assert.equal(response.status,503);
      const data=await response.json();
      assert.equal(data.success,false);
      assert.equal('count' in data,false);
    }
  }
});

test('counter accepts only authoritative data and explains duplicate or failed writes',async()=>{
  const {win,run,context}=await fixture('milion.html','function setCount');
  context.fetch=async()=>({ok:true,json:async()=>({success:true,source:'fallback',count:1})});
  await run('fetchCountFromServer()');
  assert.match(win.document.getElementById('counter-sync').textContent,/Brak połączenia/);
  context.fetch=async()=>({ok:true,json:async()=>({success:true,source:'d1',count:179,counted:false})});
  await run("recordRealActivity('radio')");
  assert.match(win.document.getElementById('message-banner').textContent,/już dziś/);
  context.fetch=async()=>({ok:false,json:async()=>({success:false})});
  await run("recordRealActivity('radio')");
  assert.match(win.document.getElementById('message-banner').textContent,/nie udało się potwierdzić/);
});

test('counter flip cannot end on an obsolete response',async()=>{
  const {win,run,flush}=await fixture('milion.html','function setCount');
  run('setCount(1);setCount(0)');flush();
  assert.equal(win.document.getElementById('d0').textContent,'0');
  assert.equal(win.document.getElementById('d0').classList.contains('flipping'),false);
  run('setCount(123);setCount(142)');flush();
  assert.equal(['d2','d1','d0'].map(id=>win.document.getElementById(id).textContent).join(''),'142');
});

test('counter radio deduplicates pending clicks and reports only a successful start',async()=>{
  const {win,run,context}=await fixture('milion.html','function setCount');
  const audio=win.document.getElementById('cc-audio');let paused=true, resolvePlay, rejectPlay;
  Object.defineProperty(audio,'paused',{get:()=>paused});
  audio.play=()=>{paused=false;return new Promise((resolve,reject)=>{resolvePlay=resolve;rejectPlay=reject;});};
  audio.pause=()=>{paused=true;rejectPlay?.(Object.assign(new Error('aborted'),{name:'AbortError'}));};
  let writes=0;context.fetch=async()=>{writes++;return {ok:true,json:async()=>({success:true,source:'d1',count:180,counted:true})};};
  const pending=run('handleRadioClick()');
  await run('handleRadioClick()');await pending;
  assert.equal(writes,0);
  const next=run('handleRadioClick()');resolvePlay();await next;
  assert.equal(writes,1);
  assert.equal(win.document.getElementById('btn-radio').getAttribute('aria-pressed'),'true');
  await run('handleRadioClick()');
  assert.equal(writes,1);
});

test('both counter routes ship the same implementation',async()=>{
  assert.equal(await readFile('milion.html','utf8'),await readFile('milion/index.html','utf8'));
});

test('radio spectrum follows measured samples, silence, mute, pause and reduced motion',async()=>{
  const source=await readFile('js/cc-player-spectrum.js','utf8');
  const callbacks=new Map();let next=0,peak=0,contexts=0;const connections=[];
  const doc=new EventTarget();doc.hidden=false;
  const audio=new EventTarget();Object.assign(audio,{ownerDocument:doc,paused:false,ended:false,muted:false,volume:1});
  const motion=new EventTarget();motion.matches=false;
  const bars=Array.from({length:12},()=>({style:{}}));
  const env={matchMedia:()=>motion,requestAnimationFrame:fn=>{callbacks.set(++next,fn);return next;},cancelAnimationFrame:id=>callbacks.delete(id),
    AudioContext:class{constructor(){contexts++;this.state='running';this.destination={};}createMediaElementSource(received){assert.equal(received,audio);return {connect:node=>connections.push(node)};}createAnalyser(){return {frequencyBinCount:128,getByteFrequencyData:bins=>bins.fill(peak)};}}};
  vm.runInNewContext(source,{window:env});
  const spectrum=env.createCCPlayerSpectrum(audio,[{querySelectorAll:()=>bars}],env);
  await spectrum.prepare();await spectrum.prepare();
  assert.equal(contexts,1);assert.equal(connections.length,2,'one destination and one analyser, no duplicate sound path');
  function tick(time){const pending=[...callbacks.values()];callbacks.clear();pending.forEach(fn=>fn(time));}
  peak=255;tick(40);assert.equal(bars[0].style.transform,'scaleY(1)');
  peak=0;tick(80);assert.equal(bars[0].style.transform,'scaleY(0.12)');
  peak=255;audio.muted=true;tick(120);assert.equal(bars[0].style.transform,'scaleY(0.12)');
  audio.muted=false;audio.paused=true;audio.dispatchEvent(new Event('pause'));assert.equal(callbacks.size,0);
  audio.paused=false;audio.dispatchEvent(new Event('playing'));assert.equal(callbacks.size,1);
  motion.matches=true;motion.dispatchEvent(new Event('change'));assert.equal(callbacks.size,0);
  assert.equal(bars[0].style.transform,'scaleY(0.12)');
  spectrum.setEnabled(true);assert.equal(callbacks.size,1,'explicit user choice may enable the spectrum');
  spectrum.setEnabled(false);assert.equal(callbacks.size,0);
  motion.matches=false;doc.hidden=true;doc.dispatchEvent(new Event('visibilitychange'));assert.equal(callbacks.size,0);
});
