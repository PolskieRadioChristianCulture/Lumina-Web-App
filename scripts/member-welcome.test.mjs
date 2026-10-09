import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source = fs.readFileSync(new URL('../js/lumina-member-welcome.js', import.meta.url), 'utf8');
function fixture(user = null, composer = false, href = 'https://polskieradio.cc/lumina') {
  const events = {}; let current = user; let opened = 0; const replaces = [];
  function element() { return { attrs: {}, handlers: {}, children: [], setAttribute(k,v) { this.attrs[k]=v; }, removeAttribute(k) { delete this.attrs[k]; }, getAttribute(k) { return this.attrs[k]; }, replaceChildren() { this.children=[]; this.firstElementChild=null; }, appendChild(child) { this.children.push(child); this.firstElementChild=child; }, addEventListener(k,fn) { this.handlers[k]=fn; }, querySelector(k) { return this.parts[k]; } }; }
  const mount=element(); const style=[];
  const doc={getElementById:()=>mount,head:{appendChild:s=>style.push(s)},createElement(type){const e=element();if(type==='section')e.parts={a:element(),button:element()};return e;}};
  const win={location:{href},history:{state:null,replaceState(a,b,url){replaces.push(url);win.location.href=new URL(url,href).href;}},LuminaDB:{getCurrentUser:()=>current},addEventListener(k,fn){events[k]=fn;}};
  if(composer)win.openQuickPostComposer=()=>opened++;
  vm.runInNewContext(source,{window:win,document:doc,URL});
  return {mount,events,style,replaces,get opened(){return opened;},login(user){current=user;events['lumina-auth-state']();}};
}
test('welcome is absent for guests/anonymous users and appears after real member event',()=>{
  const f=fixture();assert.equal(f.mount.children.length,0);
  f.login({uid:'ANONYMOUS_SYNTHETIC',isAnonymous:true});assert.equal(f.mount.children.length,0);
  f.login({uid:'MEMBER_SYNTHETIC',isAnonymous:false});assert.equal(f.mount.children.length,1);
  assert.match(f.mount.firstElementChild.innerHTML,/Napisz swój pierwszy post — daj się poznać społeczności/);
});
test('dismissal is voluntary, scoped to the current member and logout removes the card',()=>{
  const f=fixture({uid:'A'});f.mount.firstElementChild.parts.button.handlers.click();assert.equal(f.mount.children.length,0);
  f.events.pageshow();assert.equal(f.mount.children.length,0);
  f.login({uid:'B'});assert.equal(f.mount.children.length,1);
  f.login(null);assert.equal(f.mount.children.length,0);assert.equal(f.mount.attrs['data-member'],undefined);
});
test('CTA opens actual composer, never posts automatically, and home has a real navigation fallback',()=>{
  const f=fixture({uid:'A'},true);let prevented=false;
  f.mount.firstElementChild.parts.a.handlers.click({preventDefault(){prevented=true;}});
  assert.equal(f.opened,1);assert.equal(prevented,true);
  const home=fixture({uid:'A'});assert.match(home.mount.firstElementChild.innerHTML,/href="\/tablica\?compose=first-post"/);
});
test('compose deep link waits for login and opens once while preserving other URL state',()=>{
  const f=fixture(null,true,'https://polskieradio.cc/tablica?compose=first-post&theme=light#test');
  assert.equal(f.opened,0);f.login({uid:'A'});assert.equal(f.opened,1);
  assert.equal(f.replaces[0],'/tablica?theme=light#test');f.events.pageshow();assert.equal(f.opened,1);
});
test('both pages use one shared version, mobile hit targets and no account-history tracking',()=>{
  for(const page of ['lumina.html','lumina-tablica.html']){const html=fs.readFileSync(new URL('../'+page,import.meta.url),'utf8');assert.equal(html.split('/js/lumina-member-welcome.js?v=20261009_welcome1').length-1,1);assert.equal(html.split('id="luminaMemberWelcome"').length-1,1);}
  assert.match(source,/min-height:44px/);assert.match(source,/width:44px;height:44px/);assert.match(source,/focus-visible/);
  assert.doesNotMatch(source,/localStorage|fetch\(|publishUniversalPost|setInterval/);
});
function syncSource() {
  const html=fs.readFileSync(new URL('../lumina.html',import.meta.url),'utf8');
  const start=html.indexOf('        let communityProfilesSyncInFlight');
  const end=html.indexOf("        if (document.readyState === 'loading')",start);
  assert.ok(start>0&&end>start);
  return html.slice(start,end)+'\nglobalThis.sync=fetchAndSyncAllCommunityProfiles;';
}
test('community startup fetch is single-flight and does not repeat a successful request',async()=>{
  let calls=0;let release;const gate=new Promise(resolve=>release=resolve);
  const ctx={window:{_cloudProfilesMap:{}},console,fetch:async()=>{calls++;await gate;return {ok:true,json:async()=>({documents:[]})};}};
  vm.createContext(ctx);vm.runInContext(syncSource(),ctx);
  const first=ctx.sync();await ctx.sync();assert.equal(calls,1);release();await first;await ctx.sync();assert.equal(calls,1);
});
test('failed catalog fetch permits retry instead of marking a partial result complete',async()=>{
  let calls=0;const ctx={window:{_cloudProfilesMap:{}},console:{warn(){}},fetch:async()=>{calls++;return {ok:calls>1,status:503,json:async()=>({documents:[]})};}};
  vm.createContext(ctx);vm.runInContext(syncSource(),ctx);await ctx.sync();await ctx.sync();assert.equal(calls,2);
});
