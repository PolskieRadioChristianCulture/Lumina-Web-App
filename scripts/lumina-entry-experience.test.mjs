import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const html = await readFile(new URL('../lumina.html', import.meta.url), 'utf8');
const supportCode = html.slice(html.indexOf('window.openSupportModal = function()'), html.indexOf('    </script>', html.indexOf('window.openSupportModal = function()')));

function supportHarness() {
  const nodes = new Map();
  const activeClasses = new Set();
  const modal = {classList:{add:c=>activeClasses.add(c),remove:c=>activeClasses.delete(c)}};
  const status = {hidden:true,textContent:''};
  let widgets = 0;
  const container = {firstElementChild:null,appendChild:node=>{widgets++;container.firstElementChild=node;}};
  nodes.set('supportLuminaModal',modal);
  nodes.set('luminaSupportWidget',container);
  nodes.set('luminaSupportWidgetTemplate',{content:{cloneNode:()=>({widget:true})}});
  nodes.set('luminaSupportLoadStatus',status);
  const scripts=[];
  const document={getElementById:id=>nodes.get(id),createElement:()=>{
    const script={remove:()=>nodes.delete(script.id)};return script;
  },head:{appendChild:s=>{scripts.push(s);nodes.set(s.id,s);}}};
  const context={window:{},document};
  vm.runInNewContext(supportCode,context);
  return {window:context.window,status,scripts,activeClasses,widgets:()=>widgets};
}

test('support integration stays unloaded until explicitly opened and loads once across repeated opens',()=>{
  const h=supportHarness();
  assert.equal(h.scripts.length,0);
  assert.equal(h.widgets(),0);
  h.window.openSupportModal();
  h.window.openSupportModal();
  assert.equal(h.scripts.length,1);
  assert.equal(h.widgets(),1);
  assert.equal(h.scripts[0].src,'https://donorbox.org/widgets.js');
  assert.equal(h.status.hidden,false);
  assert.ok(h.activeClasses.has('open'));
  h.scripts[0].onload();
  assert.equal(h.status.hidden,true);
  h.window.closeSupportModal();
  assert.equal(h.activeClasses.has('open'),false);
});

test('failed support load explains the failure and reopening retries without duplicating the widget',()=>{
  const h=supportHarness();
  h.window.openSupportModal();
  h.scripts[0].onerror();
  assert.match(h.status.textContent,/Nie udało się/);
  assert.equal(h.status.hidden,false);
  h.window.closeSupportModal();
  h.window.openSupportModal();
  assert.equal(h.scripts.length,2);
  assert.equal(h.widgets(),1);
  h.scripts[1].onload();
  assert.equal(h.status.hidden,true);
});

const nav = await readFile(new URL('../lumina-bottom-nav.js',import.meta.url),'utf8');
const navCode=nav.slice(nav.indexOf('    try {',nav.indexOf('AUTO-INIEKCJA MINI-PLAYERA')),nav.indexOf('// GLOBALNY MOBILNY PASEK LOGOWANIA',nav.indexOf('AUTO-INIEKCJA MINI-PLAYERA')));

test('mini-player loader respects existing resources even without legacy element IDs',()=>{
  const appended=[];
  vm.runInNewContext(navCode,{window:{},console,document:{querySelector:()=>({existing:true}),createElement:()=>({}),head:{appendChild:x=>appended.push(x)},body:{appendChild:x=>appended.push(x)}}});
  assert.equal(appended.length,0);
});

test('mini-player loader still supplies resources on pages which do not include them',()=>{
  const appended=[];
  vm.runInNewContext(navCode,{window:{},console,document:{querySelector:()=>null,createElement:tag=>({tag}),head:{appendChild:x=>appended.push(x)},body:{appendChild:x=>appended.push(x)}}});
  assert.equal(appended.length,2);
  assert.equal(appended[0].tag,'link');
  assert.equal(appended[1].tag,'script');
});
