import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';
import {Window} from 'happy-dom';

const html = await readFile(new URL('../lumina.html', import.meta.url), 'utf8');
function harness() {
  const window = new Window({settings:{disableJavaScriptEvaluation:true,disableCSSFileLoading:true,disableComputedStyleRendering:true}});
  window.document.write(html);
  return {window, document:window.document};
}

test('mission media are inert on first entry, while the profile carousel remains present', () => {
  const {document} = harness();
  assert.ok(document.getElementById('profilesCarousel'));
  assert.equal(document.querySelectorAll('#strefaMisyjna video, #strefaMisyjna img').length,0);
  assert.equal(document.getElementById('missionCarousel'),null);
  assert.equal(document.getElementById('missionShowcasePanel')?.hidden,true);
  const template=document.getElementById('missionShowcaseTemplate');
  assert.equal(template?.content.querySelectorAll('video').length,3);
  assert.equal(template.content.querySelectorAll('video[autoplay]').length,0);
});

test('explicit expansion mounts once; collapse pauses videos and stops timers; reopening preserves cards', () => {
  const {window,document}=harness();
  const start=html.indexOf('window.toggleMissionShowcase = function()');
  assert.notEqual(start,-1);
  const end=html.indexOf('window.scheduleNextMissionCarouselAdvance',start);
  let init=0, resume=0, stop=0, cleared=0, paused=0;
  window.initMissionCarousel=()=>{init++;};
  window.updateMissionCenterActiveCard=()=>{};
  window.startMissionCarouselAutoplay=()=>{resume++;};
  window.stopMissionCarouselAutoplay=()=>{stop++;};
  vm.runInNewContext(html.slice(start,end),{window,document,requestAnimationFrame:fn=>fn(),clearTimeout:()=>{cleared++;},resumeMissionAutoplayTimeout:123});
  const panel=document.getElementById('missionShowcasePanel');
  const button=document.getElementById('missionShowcaseToggle');
  assert.equal(button.getAttribute('aria-controls'),panel.id);
  assert.equal(button.getAttribute('aria-expanded'),'false');
  window.toggleMissionShowcase();
  assert.equal(panel.hidden,false);
  assert.equal(button.getAttribute('aria-expanded'),'true');
  assert.equal(init,1);
  const carousel=document.getElementById('missionCarousel');
  panel.querySelectorAll('video').forEach(v=>{v.pause=()=>{paused++;};});
  window.toggleMissionShowcase();
  assert.equal(panel.hidden,true);
  assert.equal(button.getAttribute('aria-expanded'),'false');
  assert.equal(paused,3);
  assert.equal(stop,1);
  assert.equal(cleared,1);
  window.toggleMissionShowcase();
  assert.equal(panel.hidden,false);
  assert.equal(document.getElementById('missionCarousel'),carousel);
  assert.equal(init,1);
  assert.equal(resume,1);
});

test('mission timers and initialization cannot run while collapsed or duplicate initialization',()=>{
  assert.match(html,/window\.scheduleNextMissionCarouselAdvance = function[\s\S]*?missionShowcasePanel[\s\S]*?panel\.hidden[\s\S]*?return;/);
  assert.match(html,/window\.initMissionCarousel = function[\s\S]*?carousel\.dataset\.missionInitialized/);
  assert.match(html,/id="missionShowcaseToggle"[^>]*type="button"/);
  assert.match(html,/\.mission-disclosure-toggle[\s\S]*?min-height:\s*48px/);
});
