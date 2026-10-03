import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const code=await readFile(new URL('../js/lumina-theme-manager.js',import.meta.url),'utf8');

function harness(existing=false) {
  const nodes=new Map(), state=new Map(), saved=new Map(), listeners=new Map();
  const classes=new Set();
  const button=()=>({classList:{add(){},remove(){}},attrs:new Map(),events:[],setAttribute(k,v){this.attrs.set(k,v)},addEventListener(k,fn){this.events.push(fn)},querySelector(){return null}});
  if(existing) nodes.set('luminaThemeSwitchBtn',button());
  const document={readyState:'complete',documentElement:{setAttribute:(k,v)=>state.set(k,v),getAttribute:k=>state.get(k)},body:{classList:{add:k=>classes.add(k),remove:k=>classes.delete(k),contains:k=>classes.has(k)},appendChild:b=>nodes.set(b.id,b)},getElementById:id=>nodes.get(id),createElement:button};
  const window={location:{search:''},dispatchEvent(){},addEventListener:(k,fn)=>listeners.set(k,fn)};
  vm.runInNewContext(code,{document,window,URLSearchParams,CustomEvent:class{},localStorage:{getItem:k=>saved.get(k),setItem:(k,v)=>saved.set(k,v)}});
  return {nodes,state,saved,listeners,classes,window};
}
test('a generated theme switcher changes theme exactly once per click',()=>{
  const h=harness(), b=h.nodes.get('luminaThemeSwitchBtn');
  assert.equal(b.attrs.has('onclick'),false);
  assert.equal(b.events.length,1);
  b.events[0]({preventDefault(){}});
  assert.equal(h.state.get('data-lumina-theme'),'dark');
  assert.equal(h.saved.get('lumina_theme'),'dark');
  b.events[0]({preventDefault(){}});
  assert.equal(h.state.get('data-lumina-theme'),'light');
});
test('an existing inline switcher is not registered a second time',()=>{
  const h=harness(true);
  assert.equal(h.nodes.get('luminaThemeSwitchBtn').events.length,0);
});
test('theme preference synchronizes both html and body across tabs',()=>{
  const h=harness();
  h.listeners.get('storage')({key:'lumina_theme',newValue:'light'});
  assert.equal(h.state.get('data-lumina-theme'),'light');
  assert.ok(h.classes.has('theme-lumina-light'));
  h.listeners.get('storage')({key:'lumina_theme',newValue:'dark'});
  assert.equal(h.classes.has('theme-lumina-light'),false);
});

const html=await readFile(new URL('../lumina.html',import.meta.url),'utf8');
const heroCode=html.slice(html.indexOf('let heroRevealTimer'),html.indexOf('window.toggleMobileNavbarSearch'));
test('hero reveals faces after 3500ms and restores controls on interaction',()=>{
  let pending, delay, focused=false;
  const classes=new Set();
  const hero={classList:{add:k=>classes.add(k),remove:k=>classes.delete(k)},matches:()=>focused};
  const context={document:{getElementById:()=>hero},setTimeout:(fn,ms)=>{pending=fn;delay=ms;return 1},clearTimeout(){}};
  vm.runInNewContext(heroCode,context);
  context.restoreHeroIntro();
  assert.equal(delay,3500);
  pending();
  assert.ok(classes.has('faces-revealed'));
  context.restoreHeroIntro();
  assert.equal(classes.has('faces-revealed'),false);
  focused=true;pending();
  assert.equal(classes.has('faces-revealed'),false);
});
