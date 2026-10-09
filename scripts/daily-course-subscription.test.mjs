import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Window} from 'happy-dom';
const source = readFileSync('js/cc-daily-course-subscription.js','utf8');
// Replace only the SDK import in the test environment; no real users or tokens.
const isolated = source.replace("import('/lumina-db.js?v=20261009_chatsession1')",'Promise.resolve(window.testSdk)');
function mount({guest=false,registered=true,ok=true,subscribed=true}={}) {
  const w=new Window({url:'https://polskieradio.cc/akademia/kurscodzienny/dzien-08'});
  let calls=0, permissions=0, imports=0;
  const user={uid:'synthetic-student',isAnonymous:false,getIdToken:async()=>'synthetic'};
  w.testSdk={ensureDbReady:async()=>{imports++;return {auth:{currentUser:guest?null:user,authStateReady:async()=>{}}};},requestNotificationPermission:async()=>{permissions++;return registered?'synthetic-device':null;}};
  w.fetch=async(url,options)=>{calls++;assert.equal(JSON.parse(options.body).uid,undefined);return {ok,json:async()=>ok?{subscribed}:{error:'Zapis nie powiódł się.'}};};
  w.document.write('<section id="ccDailyShare"></section>');w.eval(isolated);
  return {w,get calls(){return calls;},get permissions(){return permissions;},get imports(){return imports;},status:()=>w.document.querySelector('[role="status"]').textContent};
}
async function click(f,action) {f.w.document.querySelector(`[data-action="${action}"]`).click();await new Promise(r=>setTimeout(r,5));}
test('mount does not enroll, load account or request permission; consent is unchecked',()=>{
  const f=mount();assert.equal(f.w.document.querySelector('input').checked,false);
  assert.equal(f.calls+f.permissions+f.imports,0);f.w.eval(isolated);
  assert.equal(f.w.document.querySelectorAll('#ccDailySubscription').length,1);f.w.close();
});
test('no consent means no auth, device registration or backend request',async()=>{
  const f=mount();await click(f,'subscribe');assert.equal(f.calls+f.permissions+f.imports,0);
  assert.match(f.status(),/zaznacz zgodę/);f.w.close();
});
test('guest cannot subscribe even after checking consent',async()=>{
  const f=mount({guest:true});f.w.document.querySelector('input').checked=true;
  await click(f,'subscribe');assert.equal(f.calls+f.permissions,0);assert.match(f.status(),/Zaloguj/);f.w.close();
});
test('device registration failure prevents subscription',async()=>{
  const f=mount({registered:false});f.w.document.querySelector('input').checked=true;
  await click(f,'subscribe');assert.equal(f.calls,0);assert.match(f.status(),/nie został włączony/);f.w.close();
});
test('backend failure does not claim active subscription',async()=>{
  const f=mount({ok:false});f.w.document.querySelector('input').checked=true;
  await click(f,'subscribe');assert.equal(f.calls,1);assert.doesNotMatch(f.status(),/Subskrypcja aktywna/);f.w.close();
});
test('unsubscribe requires no permission prompt and resets consent after confirmation',async()=>{
  const f=mount({subscribed:false});f.w.document.querySelector('input').checked=true;
  await click(f,'unsubscribe');assert.equal(f.permissions,0);assert.equal(f.calls,1);
  assert.equal(f.w.document.querySelector('input').checked,false);assert.match(f.status(),/czatu pozostają bez zmian/);f.w.close();
});
test('preferred hour selection is sent with subscription and updated on status',async()=>{
  let sentBody;
  const f=mount({subscribed:true});
  const origFetch=f.w.fetch;
  f.w.fetch=async(url,options)=>{sentBody=JSON.parse(options.body);return origFetch(url,options);};
  const hourSelect=f.w.document.querySelector('#ccCourseHourSelect');
  assert.equal(hourSelect.value,'7');
  hourSelect.value='20';
  f.w.document.querySelector('input').checked=true;
  await click(f,'subscribe');
  assert.equal(sentBody.preferredHour,20);
  assert.match(f.status(),/20:00/);
  f.w.close();
});
test('login link is hidden for authenticated users and visible for guests',async()=>{
  const fGuest=mount({guest:true});
  fGuest.w.document.querySelector('input').checked=true;
  await click(fGuest,'subscribe');
  const guestLink=fGuest.w.document.querySelector('#ccCourseLoginLink');
  assert.equal(guestLink.hidden,false);
  fGuest.w.close();

  const fUser=mount({ok:false}); // even on backend error
  fUser.w.document.querySelector('input').checked=true;
  await click(fUser,'subscribe');
  const userLink=fUser.w.document.querySelector('#ccCourseLoginLink');
  assert.equal(userLink.hidden,true);
  fUser.w.close();
});
