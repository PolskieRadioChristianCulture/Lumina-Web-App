import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { Window } from 'happy-dom';

const script = readFileSync('js/cc-daily-course-share.js', 'utf8');
test('subscription enrollment fails closed before backend acceptance',()=>{
  const w=mount();
  assert.equal(w.document.querySelector('script[src*="cc-daily-course-subscription"]'),null);
  w.close();
});
test('guest invitation is free, nonblocking, and follows actual auth rather than event identity',()=>{
  const w=mount();const invitation=w.document.getElementById('ccDailyAccountInvitation');
  assert.equal(invitation.hidden,false);
  assert.match(invitation.textContent,/bezpłatnie/);
  assert.match(invitation.textContent,/pozostaje dostępne bez konta/);
  assert.equal(invitation.querySelector('a').getAttribute('href'),'/lumina-login');
  w.dispatchEvent(new w.CustomEvent('lumina-auth-state',{detail:{user:{uid:'fake'}}}));
  assert.equal(invitation.hidden,false);
  w.firebaseAuth={currentUser:{uid:'synthetic',isAnonymous:false}};
  w.dispatchEvent(new w.Event('lumina-auth-state'));assert.equal(invitation.hidden,true);
  w.firebaseAuth.currentUser={isAnonymous:true};
  w.dispatchEvent(new w.Event('lumina-auth-state'));assert.equal(invitation.hidden,false);
  w.eval(script);assert.equal(w.document.querySelectorAll('#ccDailyAccountInvitation').length,1);
  w.close();
});
function mount(path = '/akademia/kurscodzienny/dzien-08', navigatorSetup = () => {}) {
  const window = new Window({url: 'https://polskieradio.cc' + path});
  window.document.write('<title>Dzień 8 — Wieża Babel</title><main><section><a href="/tablica?share=dzien-07">Stary link</a></section></main>');
  navigatorSetup(window.navigator);
  window.eval(script);
  return window;
}
test('każda istniejąca lekcja, alias i katalog ładuje jeden wspólny panel', () => {
  let count = 0;
  function scan(dir) {
    for (const entry of readdirSync(dir, {withFileTypes: true})) {
      const path = dir + '/' + entry.name;
      if (entry.isDirectory()) scan(path);
      else if (path.endsWith('.html')) {
        assert.equal((readFileSync(path, 'utf8').match(/cc-daily-course-share\.js/g) || []).length, 1, path);
        count++;
      }
    }
  }
  scan('akademia/kurscodzienny'); scan('kursy/kurscodzienny');
  for (const path of ['akademia.html','akademia/index.html','kursy.html','kursy/index.html','akademia/kurscodzienny.html','kursy/kurscodzienny.html']) {
    assert.equal((readFileSync(path, 'utf8').match(/cc-daily-course-share\.js/g) || []).length, 1);
  }
  assert.ok(count >= 24);
});
test('Dzień 8 i alias udostępniają Dzień 8, nie 7; siedem kanałów', () => {
  for (const path of ['/akademia/kurscodzienny/dzien-08','/kursy/kurscodzienny/dzien-08/index.html']) {
    const w = mount(path);
    const links = [...w.document.querySelectorAll('#ccDailyShare a')];
    assert.equal(links.length, 6);
    const lumina = new URL(links[0].href);
    assert.equal(lumina.searchParams.get('share_url'), 'https://polskieradio.cc/akademia/kurscodzienny/dzien-08');
    assert.ok(lumina.searchParams.get('share_text').includes('/dzien-08'));
    assert.equal(w.document.querySelector('a[href*="share=dzien-07"]'), null);
    for (const a of links.filter(a => a.target === '_blank')) assert.equal(a.rel, 'noopener noreferrer');
    w.eval(script);
    assert.equal(w.document.querySelectorAll('#ccDailyShare').length, 1);
    w.close();
  }
});
test('kurs w akademii nie udostępnia losowego dnia', () => {
  const w = mount('/akademia#kurscodzienny');
  const link = new URL(w.document.querySelector('#ccDailyShare a').href);
  assert.equal(link.searchParams.get('share_url'), 'https://polskieradio.cc/akademia#kurscodzienny');
  w.close();
});
test('same ikony zachowują nazwy dostępności, tooltip i cele 44x44', () => {
  const w = mount();
  for (const control of w.document.querySelectorAll('#ccDailyShare a, #ccDailyShare button')) {
    assert.ok(control.getAttribute('aria-label'));
    assert.equal(control.title, control.getAttribute('aria-label'));
    assert.equal(control.firstElementChild.getAttribute('aria-hidden'), 'true');
    assert.equal(control.style.width, '44px');
    assert.equal(control.style.height, '44px');
    assert.notEqual(control.textContent, control.getAttribute('aria-label'));
  }
  w.close();
});
test('schowek: sukces dopiero po zapisie, odmowa daje ręczną kopię', async () => {
  let value;
  const w = mount(undefined, nav => Object.defineProperty(nav, 'clipboard', {value: {writeText: async text => {value = text;}}, configurable:true}));
  w.document.querySelector('button').click(); await new Promise(resolve => setTimeout(resolve, 0));
  assert.ok(value.endsWith('/dzien-08'));
  assert.equal(w.document.querySelector('[role="status"]').textContent, 'Link skopiowany.');
  Object.defineProperty(w.navigator, 'clipboard', {value: {writeText: async () => {throw Error('denied');}}});
  w.document.querySelector('button').click(); await new Promise(resolve => setTimeout(resolve, 0));
  assert.equal(w.document.querySelector('label').hidden, false);
  assert.ok(w.document.querySelector('input').value.endsWith('/dzien-08'));
  w.close();
});
test('natywne udostępnianie opcjonalne; anulowanie nie zgłasza sukcesu', async () => {
  const w = mount(undefined, nav => Object.defineProperty(nav, 'share', {value: async () => {throw Object.assign(Error('cancel'), {name:'AbortError'});}}));
  const b = w.document.querySelector('button[aria-label="Więcej aplikacji…"]');
  assert.ok(b);
  b.click(); await new Promise(resolve => setTimeout(resolve, 0));
  assert.equal(w.document.querySelector('[role="status"]').textContent, '');
  w.close();
});
