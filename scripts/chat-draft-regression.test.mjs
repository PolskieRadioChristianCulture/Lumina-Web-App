import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {Window} from 'happy-dom';

const surfaces=['lumina.html','lumina-tablica.html','lumina-tablica-light.html','lumina-profile.html','lumina.cezaryrgowski.html','lumina.wiolettarogowska.html'];
for (const file of surfaces) {
  const source=await readFile(file,'utf8');
  const start=source.indexOf('        async function handleSendActiveChatMessage(e) {');
  const end=source.indexOf('\n        //',start);
  assert.ok(start>=0 && end>start);
  const handler=source.slice(start,end).trim();
  function fixture(send=async()=>null) {
    const win=new Window();
    win.document.body.innerHTML='<input id="activeChatInput"><button id="btnActiveChatSubmit"></button>';
    const input=win.document.querySelector('input'),button=win.document.querySelector('button');
    input.value='  Testowy szkic  ';
    const calls=[],notices=[];
    win.LuminaDB={sendDirectMessageToCloud:async(...args)=>{calls.push(args);return send(...args);}};
    const context=vm.createContext({window:win,document:win.document,activeChatSession:{chatId:'synthetic-room',targetId:'synthetic-recipient'},showToast:(...args)=>notices.push(args),scrollChatToBottom:()=>{},handleActiveChatInputChange:text=>{button.disabled=!text.trim();}});
    const run=vm.runInContext('('+handler+')',context);
    return {win,input,button,calls,notices,context,run};
  }
  test(file+': failed, unavailable and unaccepted sends preserve draft and unlock retry',async()=>{
    for(const result of [null,'local_123',{status:'request_pending'},{status:'request_closed'},{}]) {
      const f=fixture(async()=>result); await f.run();
      assert.equal(f.input.value,'  Testowy szkic  ');
      assert.equal(f.input.disabled,false); assert.equal(f.button.disabled,false);
      assert.equal(f.input.hasAttribute('aria-busy'),false); assert.equal(f.notices.length,1);
    }
    for(const unavailable of [false,true]) {
      const f=fixture(async()=>{throw Error('synthetic network failure');});
      if(unavailable) f.win.LuminaDB=undefined;
      await f.run(); assert.equal(f.input.value,'  Testowy szkic  ');
      assert.equal(f.input.disabled,false); assert.equal(f.button.disabled,false);
      assert.match(f.notices[0][0],/Tekst zachowano/);
    }
  });
  test(file+': only confirmed save or new request clears draft',async()=>{
    for(const result of ['synthetic-message-id',{status:'request_sent'}]) {
      const f=fixture(async()=>result); await f.run();
      assert.equal(f.input.value,''); assert.equal(f.input.disabled,false); assert.equal(f.button.disabled,true);
      assert.equal(f.calls[0][0],'synthetic-room'); assert.equal(f.calls[0][1].text,'Testowy szkic');
    }
  });
  test(file+': pending send cannot duplicate or erase another conversation draft',async()=>{
    let resolve;
    const f=fixture(()=>new Promise(done=>{resolve=done;}));
    const sending=f.run();
    assert.equal(f.input.value,'  Testowy szkic  '); assert.equal(f.input.disabled,true);
    await f.run(); assert.equal(f.calls.length,1);
    f.context.activeChatSession={chatId:'other-synthetic-room',targetId:'other-recipient'};
    f.input.value='Nowa rozmowa';
    resolve('synthetic-message-id'); await sending;
    assert.equal(f.input.value,'Nowa rozmowa'); assert.equal(f.input.disabled,false);
  });
}

// Execute the complete shared chat component against an isolated DOM (no network).
const globalChatSource=await readFile('components/cc-global-chat-button.js','utf8');
function globalChatFixture(loggedIn=false){
 const win=new Window({url:'https://example.invalid/lumina',settings:{disableCSSFileLoading:true,disableJavaScriptFileLoading:true}});
 const errors=[];win.addEventListener('error',e=>{errors.push(e.error);e.preventDefault();});
 win.LuminaDB={getCurrentUser:()=>loggedIn?{uid:'fixture-user'}:null,getCurrentProfile:()=>({slug:'fixture-user',name:'Fixture'}),
  getChatId:(a,b)=>[a,b].sort().join('_'),
  subscribeToDirectMessages:(_id,cb)=>{cb([{text:'Fixture cloud message',senderName:'Fixture peer'}]);return ()=>{};}};
 const ctx=vm.createContext({window:win,document:win.document,localStorage:win.localStorage,console,setTimeout:()=>0,clearTimeout:()=>{}});
 vm.runInContext(globalChatSource,ctx);
 win.document.dispatchEvent(new win.Event('DOMContentLoaded'));
 return {win,errors};
}
test('global chat actually opens and closes for a guest without runtime errors',()=>{
 const {win,errors}=globalChatFixture();
 win.document.getElementById('ccChatFabBtn').click();
 const overlay=win.document.getElementById('ccGlobalChatOverlay');
 assert.equal(overlay.getAttribute('aria-hidden'),'false');
 assert.ok(overlay.classList.contains('is-open'));
 assert.match(win.document.getElementById('ccChatMessagesList').textContent,/Czat Ogólny/);
 win.document.getElementById('ccChatCloseBtn').click();
 assert.equal(overlay.getAttribute('aria-hidden'),'true');assert.deepEqual(errors,[]);
});
test('global chat can select a private recipient as a guest without fabricated replies',()=>{
 const {win,errors}=globalChatFixture();win.document.getElementById('ccChatFabBtn').click();
 win.document.querySelector('[data-partner-id="wiolettarogowska"]').click();
 assert.match(win.document.getElementById('ccChatMessagesList').textContent,/wymagają zalogowanego/);
 assert.equal(win.document.querySelectorAll('.cc-chat-msg-row').length,0);assert.deepEqual(errors,[]);
});
test('global chat renders a confirmed private snapshot for a synthetic signed-in session',()=>{
 const {win,errors}=globalChatFixture(true);win.document.getElementById('ccChatFabBtn').click();
 win.document.querySelector('[data-partner-id="wiolettarogowska"]').click();
 assert.match(win.document.getElementById('ccChatMessagesList').textContent,/Fixture cloud message/);
 assert.deepEqual(errors,[]);
});

test('guest chat entry stays visible in both LUMINA themes',()=>{
 for(const theme of ['dark','light']){
  const {win}=globalChatFixture();win.document.documentElement.setAttribute('data-lumina-theme',theme);
  win.document.body.classList.add('user-is-guest');
  assert.equal(win.getComputedStyle(win.document.getElementById('ccGlobalChatFab')).display,'flex');
 }
});
test('mobile phone moves the same link to the header and restores its desktop position',async()=>{
 const source=await readFile('js/cc-mobile-helpline.js','utf8');
 const win=new Window();win.document.body.innerHTML='<header><div id="quickActionsMenu"></div></header><div id="player"><a id="helplineFloat" href="tel:+48730958583">Call</a></div>';
 let changed;const media={matches:true,addEventListener:(_name,fn)=>{changed=fn;}};win.matchMedia=()=>media;
 vm.runInNewContext(source,{window:win,document:win.document});
 const link=win.document.getElementById('helplineFloat');
 assert.equal(link.parentElement.id,'quickActionsMenu');
 assert.equal(link.getAttribute('href'),'tel:+48730958583');
 media.matches=false;changed();assert.equal(link.parentElement.id,'player');
 media.matches=true;changed();assert.equal(link.parentElement.id,'quickActionsMenu');
 assert.equal(win.document.querySelectorAll('#helplineFloat').length,1);
 const index=await readFile('index.html','utf8');assert.match(index,/cc-mobile-helpline\.js\?v=20261013_mobile1/);
 assert.match(index,/#mainHeader #helplineFloat \{ min-width: 44px; min-height: 44px;/);
});

test('mobile home hides its brand and reserves clear space for chat beside audio controls',async()=>{
 const html=await readFile('index.html','utf8');
 assert.match(html,/#mainHeader \.brand-logo \{ display: none !important; \}/);
 assert.match(html,/#radioPlayerBar \.player-right \{[^}]*padding-right: 88px !important/);
 assert.match(html,/#radioPlayerBar \.volume-slider \{[^}]*min-width: 0;[^}]*width: auto !important;[^}]*flex: 1 1 auto;/);
});
