import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {Window} from 'happy-dom';
test('notification bubble routes to the exact conversation, including fallback and keyboard',async()=>{
 const source=await readFile('lumina-db.js','utf8');
 const start=source.indexOf('export function openNotificationChat(');
 const end=source.indexOf('export async function showSystemDrawerNotification(',start);
 assert.ok(start>0&&end>start);
 const escapeStart=source.indexOf('export function escapeHtml(');
 const escapeEnd=source.indexOf('\n}',escapeStart)+2;
 const code=source.slice(start,end).replaceAll('export function ','function ')+source.slice(escapeStart,escapeEnd).replace('export ','');
 function fixture({guest=false,native=true,fail=false}={}){
  const dom=new Window(),calls=[];
  if(native)dom.document.body.innerHTML='<div id="directMessagesModal"></div>';
  if(guest)dom.document.body.classList.add('user-is-guest');
  const win={location:{origin:'https://polskieradio.cc',assign:url=>calls.push(['navigate',url])},
   CCGlobalChat:{close:()=>calls.push(['close']),open:(...args)=>calls.push(['global',...args])},
   _luminaBannerTimeout:null};
  if(native){win.openChatWith=(...args)=>{if(fail)throw Error('UI unavailable');calls.push(['private',...args]);};
   win.openDirectMessagesModal=(tab)=>{if(fail)throw Error('UI unavailable');calls.push(['public',tab]);};
   win.switchMessengerMainTab=tab=>calls.push(['tab',tab]);}
  const ctx=vm.createContext({window:win,document:dom.document,URL,
   requestAnimationFrame:fn=>fn(),setTimeout:()=>1,clearTimeout:()=>{}});
  vm.runInContext(code+';window.openNotificationChat=openNotificationChat;window.showInAppChatBanner=showInAppChatBanner;',ctx);
  return{win,dom,calls,banner:data=>win.showInAppChatBanner(data)};
 }
 const f=fixture();
 f.banner({type:'private',senderId:'MemberUID_A',senderName:'Synthetic member',messageId:'msg-A'});
 let bubble=f.dom.document.getElementById('lumina-chat-notification-banner');bubble.click();
 assert.deepEqual(f.calls,[['close'],['private','Synthetic member','/lumina_icon.jpg','MemberUID_A','msg-A']]);
 // Reused bubble must route to the NEW notification, not the previous recipient.
 f.banner({type:'private',senderId:'MemberUID_B',senderName:'Second fixture'});bubble.click();
 assert.equal(f.calls.at(-1)[3],'MemberUID_B');
 const keyboard=new f.dom.KeyboardEvent('keydown',{key:'Enter',bubbles:true});
 bubble.dispatchEvent(keyboard);assert.equal(f.calls.at(-1)[3],'MemberUID_B');
 assert.equal(bubble.getAttribute('role'),'button');assert.equal(bubble.tabIndex,0);
 for(const type of ['public','public_chat','chat_public']){
  const p=fixture();p.banner({type,senderId:'do-not-open-private'});p.dom.document.getElementById('lumina-chat-notification-banner').click();
  assert.deepEqual(p.calls,[['close'],['public','public'],['tab','public']]);
 }
 const guest=fixture({guest:true});guest.win.openNotificationChat({type:'public'});
 assert.deepEqual(guest.calls,[['global','live','public']]);
 for(const options of [{native:false},{fail:true},{guest:true}]){
  const p=fixture(options);p.win.openNotificationChat({type:'private',senderId:'MemberUID_A',messageId:'msg-B'});
  const dest=new URL(p.calls.at(-1)[1]);assert.equal(dest.origin,'https://polskieradio.cc');
  assert.equal(dest.pathname,'/lumina');assert.equal(dest.searchParams.get('openChat'),'MemberUID_A');
  assert.equal(dest.searchParams.get('messageId'),'msg-B');
 }
 const pub=fixture({native:false});pub.win.openNotificationChat({type:'public'});
 assert.equal(new URL(pub.calls.at(-1)[1]).searchParams.get('openPublicChat'),'1');
 const invalid=fixture();assert.equal(invalid.win.openNotificationChat({type:'private'}),false);
 assert.deepEqual(invalid.calls,[]);
 const attack=fixture();
 const unsafe='<img src=x onerror="window.attacked=true"><script>window.attacked=true</script>';
 attack.banner({type:'private',senderId:'FixtureUID',senderName:unsafe,body:unsafe,avatar:'javascript:alert(1)'});
 const safeBubble=attack.dom.document.getElementById('lumina-chat-notification-banner');
 assert.equal(safeBubble.querySelectorAll('img').length,1);
 assert.equal(safeBubble.querySelectorAll('script,[onerror],[onload]').length,0);
 assert.ok(safeBubble.textContent.includes(unsafe));
 assert.equal(safeBubble.querySelector('img').getAttribute('src'),'/lumina_icon.jpg');
 attack.banner({type:'private',senderId:'FixtureUID',avatar:'" onerror="alert(1)'});
 assert.equal(safeBubble.querySelectorAll('[onerror]').length,0);
});

test('notification list treats cached and received fields as text and restricts navigation',async()=>{
 const source=await readFile('lumina-notifications.js','utf8');
 const classStart=source.indexOf('    class LuminaNotificationEngine');
 const helperStart=source.indexOf('    function safeNotificationUrl');
 const helperEnd=source.indexOf('    function escapeHtml',helperStart);
 const dom=new Window();dom.document.body.innerHTML='<div id="notif-list"></div>';
 const calls=[];const win={location:{origin:'https://polskieradio.cc',href:'https://polskieradio.cc/akademia/example'},openChatWith:(...args)=>calls.push(['private',...args])};
 const ctx=vm.createContext({window:win,document:dom.document,URL});
 const proto=vm.runInContext(source.slice(classStart,helperStart)+source.slice(helperStart,helperEnd)+';LuminaNotificationEngine.prototype',ctx);
 const engine=Object.create(proto);engine.updateBadge=()=>{};engine.saveToStorage=()=>{};
 const attack='<svg onload="window.attacked=true"></svg>';
 engine.notifications=[{id:"bad');alert(1);//",title:attack,body:attack,time:attack,icon:'javascript:alert(1)',actionUrl:'javascript:alert(1)'},
  {id:'safe-fixture',title:'Zażółć gęślą jaźń',body:'Test',icon:'/avatar_fixture.png',actionUrl:'/lumina?openChat=FixtureUID'}];
 engine.renderList();
 const list=dom.document.getElementById('notif-list');
 assert.equal(list.querySelectorAll('.notif-item').length,2);
 assert.equal(list.querySelectorAll('script,svg,[onclick],[onerror],[onload]').length,0);
 assert.ok(list.textContent.includes(attack));assert.ok(list.textContent.includes('Zażółć gęślą jaźń'));
 assert.equal(list.querySelector('img').getAttribute('src'),'/lumina_icon.jpg');
 list.querySelector('.notif-item').click();assert.equal(win.location.href,'https://polskieradio.cc/akademia/example');
 list.querySelectorAll('.notif-item')[1].dispatchEvent(new dom.KeyboardEvent('keydown',{key:' ',bubbles:true}));
 assert.equal(calls.at(-1)[3],'FixtureUID');
 for(const url of ['javascript:alert(1)','data:text/html,test','https://example.invalid/', '//example.invalid/', 'https://user:pass@polskieradio.cc/','http://[']){
  const count=calls.length;engine.handleItemClick('unknown',url);assert.equal(calls.length,count);assert.equal(win.location.href,'https://polskieradio.cc/akademia/example');
 }
 engine.handleItemClick('safe','/akademia/kurscodzienny/dzien-08');
 assert.equal(win.location.href,'https://polskieradio.cc/akademia/kurscodzienny/dzien-08');
});

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
test('LUMINA shared chat remains visible for signed-in members in both themes',()=>{
 for(const theme of ['dark','light']){
  const {win}=globalChatFixture(true);
  win.document.documentElement.setAttribute('data-lumina-theme',theme);
  assert.equal(win.getComputedStyle(win.document.getElementById('ccGlobalChatFab')).display,'flex');
 }
});
test('LUMINA controls use one compact lane with chat immediately above scroll-to-top',async()=>{
 const source=await readFile('js/cc-back-to-top.js','utf8');
 assert.match(source,/#backToTopBtn\[data-cc-back-to-top\]\{bottom:var\(--cc-lumina-action-base\)/);
 assert.match(source,/#ccGlobalChatFab\{display:flex!important;bottom:calc\(var\(--cc-lumina-action-base\) \+ 60px\)/);
 assert.match(source,/#luminaThemeSwitchBtn\{display:flex!important;bottom:calc\(var\(--cc-lumina-action-base\) \+ 120px\)/);
 assert.match(source,/#luminaMiniPlayerContainer\.minimized\{display:flex!important;bottom:calc\(var\(--cc-lumina-action-base\) \+ 180px\)/);
 assert.match(source,/if \(visible && !luminaActions && document\.elementsFromPoint\)/);
 assert.match(source,/function start\(\) \{ mount\(\); mountLuminaActions\(\);/);
});
