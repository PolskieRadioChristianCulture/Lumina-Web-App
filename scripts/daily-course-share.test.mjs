import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { Window } from 'happy-dom';

const script = readFileSync('js/cc-daily-course-share.js', 'utf8');
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
  for (const path of ['akademia.html','akademia/index.html','akademia/kurscodzienny.html','kursy/kurscodzienny.html']) {
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
  const b = [...w.document.querySelectorAll('button')].find(b => b.textContent === 'Więcej aplikacji…');
  assert.ok(b);
  b.click(); await new Promise(resolve => setTimeout(resolve, 0));
  assert.equal(w.document.querySelector('[role="status"]').textContent, '');
  w.close();
});
