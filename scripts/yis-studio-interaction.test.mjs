import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { Window } from 'happy-dom';

const html = fs.readFileSync(new URL('../YIS/index.html', import.meta.url), 'utf8');
const script = fs.readFileSync(new URL('../YIS/script.js', import.meta.url), 'utf8');
function setup() {
  const dom = new Window({ settings: { disableJavaScriptEvaluation: true, disableCSSFileLoading: true, disableJavaScriptFileLoading: true } });
  dom.document.write(html);
  const location = { href: '' };
  let mount;
  new Function('document', 'window', 'navigator', 'FormData', script)(
    dom.document,
    { location, matchMedia: () => ({ addEventListener() {} }), CCMobileEdge: { mount: args => { mount = args; } } },
    { clipboard: { writeText: async () => {} } }, dom.FormData
  );
  return { dom, document: dom.document, location, mount };
}
test('menu resets its accessible label after a navigation link and Escape', () => {
  const { dom, document } = setup();
  const toggle = document.getElementById('menuToggle');
  const menu = document.getElementById('mobileMenu');
  toggle.click();
  assert.equal(menu.hidden, false);
  assert.equal(document.activeElement, menu.querySelector('a'));
  menu.querySelector('a').click();
  assert.equal(menu.hidden, true);
  assert.equal(toggle.getAttribute('aria-label'), 'Otwórz menu');
  toggle.click();
  document.dispatchEvent(new dom.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  assert.equal(menu.hidden, true);
  assert.equal(toggle.getAttribute('aria-expanded'), 'false');
});
test('clicking outside closes the menu and the canonical edge panel receives its existing controller', () => {
  const { document, mount } = setup();
  document.getElementById('menuToggle').click();
  document.querySelector('h1').click();
  assert.equal(document.getElementById('mobileMenu').hidden, true);
  assert.equal(mount.legacy, document.getElementById('menuToggle'));
});
test('portfolio filters still preserve and restore all original projects', () => {
  const { document } = setup();
  document.querySelector('[data-filter="creative"]').click();
  assert.equal(document.querySelectorAll('.project:not([hidden])').length, 2);
  document.querySelector('[data-filter="all"]').click();
  assert.equal(document.querySelectorAll('.project:not([hidden])').length, 5);
});
test('contact creates a draft with real newlines, preserves characters and never claims a send', () => {
  const { document, dom, location } = setup();
  document.getElementById('person').value = 'Test Żółć';
  document.getElementById('mail').value = 'test@example.com';
  document.getElementById('details').value = 'Grafika & strona\nDrugi akapit';
  document.getElementById('contactForm').dispatchEvent(new dom.Event('submit', { cancelable: true }));
  const url = new URL(location.href);
  assert.equal(url.protocol, 'mailto:');
  assert.equal(url.pathname, 'yourimaginationstudio@gmail.com');
  const body = url.searchParams.get('body');
  assert.match(body, /Test Żółć\nE-mail:/);
  assert.ok(body.includes('Grafika & strona\nDrugi akapit'));
  assert.equal(body.includes('\\n'), false);
  assert.match(document.getElementById('formStatus').textContent, /nie została jeszcze wysłana/);
});
test('an invalid contact address cannot open a mail draft', () => {
  const { document, dom, location } = setup();
  document.getElementById('person').value = 'Test';
  document.getElementById('mail').value = 'invalid';
  document.getElementById('details').value = 'Test';
  document.getElementById('contactForm').dispatchEvent(new dom.Event('submit', { cancelable: true }));
  assert.equal(location.href, '');
});
