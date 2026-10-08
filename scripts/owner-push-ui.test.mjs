import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Window} from 'happy-dom';
const source = readFileSync('js/cc-owner-push-test.js','utf8');
const isolated = source.replace("import('/lumina-db.js?v=20261008_chatcounter1')", 'Promise.resolve(window.testSdk)');
const pause = () => new Promise(resolve => setTimeout(resolve, 10));
function mount({url='https://polskieradio.cc/tablica?ownerPushTest=1',guest=false,anonymous=false,preflight={},failSend=false,statusCode=200}={}) {
  const w = new Window({url});
  const user = {uid:'synthetic-owner',isAnonymous:anonymous,getIdToken:async()=>'synthetic-token'};
  const auth = {currentUser:guest?null:user,authStateReady:async()=>{}};
  let imports=0;
  const calls=[];
  w.testSdk = {ensureDbReady:async()=>{imports++;return {auth};}};
  w.fetch=async(url,options)=>{
    calls.push({url,options});
    if (url.endsWith('/owner-test') && failSend) throw Error('synthetic failure');
    return {ok:statusCode===200,status:statusCode,json:async()=>url.endsWith('/preflight')
      ? {accountRead:true,registeredDeviceCount:2,automaticDispatchEnabled:false,...preflight}
      : {testConsumed:true,acceptedByFcm:2,registeredDeviceCount:2}};
  };
  w.document.write('<main>Existing LUMINA content</main>');
  w.eval(isolated);
  const panel=()=>w.document.getElementById('ccOwnerPushTest');
  return {w,auth,user,calls,panel,get imports(){return imports;},status:()=>panel().querySelector('[role="status"]').textContent};
}
async function click(f,action){f.panel().querySelector(`[data-action="${action}"]`).click();await pause();}
function consent(f){const input=f.panel().querySelector('input');input.checked=true;input.dispatchEvent(new f.w.Event('change'));}
test('normal visits and non-production origin have no panel, SDK import or request',()=>{
  for(const url of ['https://polskieradio.cc/lumina','https://polskieradio.cc/tablica?ownerPushTest=0','https://example.org/lumina?ownerPushTest=1']){
    const f=mount({url});assert.equal(f.panel(),null);assert.equal(f.imports,0);assert.equal(f.calls.length,0);f.w.close();
  }
});
test('diagnostic mount is unique, inert and unchecked',()=>{
  const f=mount();f.w.eval(isolated);assert.equal(f.w.document.querySelectorAll('#ccOwnerPushTest').length,1);
  assert.equal(f.panel().querySelector('input').checked,false);assert.equal(f.calls.length+f.imports,0);
  assert.equal(f.w.document.querySelector('main').textContent,'Existing LUMINA content');f.w.close();
});
test('consent alone cannot send before explicit preflight',async()=>{
  const f=mount();consent(f);await click(f,'send');assert.equal(f.calls.length+f.imports,0);f.w.close();
});
test('guests and anonymous sessions cannot preflight or send',async()=>{
  for(const options of [{guest:true},{anonymous:true}]){const f=mount(options);await click(f,'check');
    assert.equal(f.calls.length,0);assert.match(f.status(),/Zaloguj/);f.w.close();}
});
test('preflight sends empty authenticated body, no permission or subscription request',async()=>{
  const f=mount();await click(f,'check');assert.equal(f.calls.length,1);
  const {url,options}=f.calls[0];assert.match(url,/\/preflight$/);assert.equal(options.body,undefined);
  assert.equal(options.headers.authorization,'Bearer synthetic-token');assert.equal(options.credentials,'omit');
  assert.equal(options.redirect,'error');assert.equal(options.referrerPolicy,'no-referrer');
  assert.equal(f.panel().querySelector('[data-action="send"]').disabled,true);assert.match(f.status(),/Nie wysłano/);f.w.close();
});
test('unconfirmed account, zero devices or active student dispatch block test',async()=>{
  for(const preflight of [{accountRead:false},{registeredDeviceCount:0},{registeredDeviceCount:11},{automaticDispatchEnabled:true}]){
    const f=mount({preflight});await click(f,'check');consent(f);await click(f,'send');
    assert.equal(f.calls.length,1);assert.match(f.status(),/Nie potwierdzono gotowości/);f.w.close();
  }
});
test('disabled server reports fixed message without leaking response',async()=>{
  const f=mount({statusCode:503});await click(f,'check');assert.match(f.status(),/wyłączone/);assert.equal(f.calls.length,1);f.w.close();
});
test('fixed diagnostic distinguishes denied account, server failure and invalid response',async()=>{
  for(const [statusCode,expected] of [[401,/logowania \(401\)/],[403,/konta lub źródła.*403/],[502,/danych testu \(502\)/]]){
    const f=mount({statusCode});await click(f,'check');assert.match(f.status(),expected);
    assert.equal(f.calls.length,1);assert.doesNotMatch(f.status(),/synthetic-token|synthetic-owner/);f.w.close();
  }
});
test('account change after readiness blocks send before backend',async()=>{
  const f=mount();await click(f,'check');consent(f);f.auth.currentUser={...f.user,uid:'synthetic-other'};
  await click(f,'send');assert.equal(f.calls.length,1);assert.match(f.status(),/Nie ponawiaj/);f.w.close();
});
test('one successful send distinguishes FCM acceptance from physical delivery',async()=>{
  const f=mount();await click(f,'check');consent(f);await click(f,'send');await click(f,'send');await click(f,'check');
  assert.equal(f.calls.length,2);assert.match(f.calls[1].url,/\/owner-test$/);assert.equal(f.calls[1].options.body,undefined);
  assert.match(f.status(),/FCM przyjął 2 z 2/);assert.match(f.status(),/nie potwierdza odbioru/);f.w.close();
});
test('network failure locks further requests; never auto retries',async()=>{
  const f=mount({failSend:true});await click(f,'check');consent(f);await click(f,'send');await click(f,'send');await click(f,'check');
  assert.equal(f.calls.length,2);assert.match(f.status(),/Mogła już zostać wykonana/);assert.doesNotMatch(f.status(),/synthetic/);f.w.close();
});
test('both canonical desktop surfaces include the same versioned sender; SDK version is current',()=>{
  for(const file of ['lumina.html','lumina-tablica.html'])
    assert.equal(readFileSync(file,'utf8').split('/js/cc-owner-push-test.js?v=20261008_sender2').length-1,1);
  assert.match(source,/import\('\/lumina-db.js\?v=20261008_chatcounter1'\)/);
  assert.doesNotMatch(source,/requestPermission|localStorage|sessionStorage|console\.|setInterval/);
});
