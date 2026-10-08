import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {Window} from 'happy-dom';

const source = await readFile('lumina-bottom-nav.js', 'utf8');
test('More menu has a named region, explicit close label and rooted Shorts link', () => {
  const win = new Window({url:'https://polskieradio.cc/lumina/wiolettarogowska'});
  const menuStart = source.indexOf('<div id="luminaBottomMenuPopup"');
  const menuEnd = source.indexOf('<!-- 5.', menuStart);
  assert.ok(menuStart >= 0 && menuEnd > menuStart);
  win.document.body.innerHTML = source.slice(menuStart, menuEnd);
  const popup = win.document.getElementById('luminaBottomMenuPopup');
  assert.equal(popup.getAttribute('role'), 'region');
  assert.equal(win.document.getElementById(popup.getAttribute('aria-labelledby')).textContent, 'Centrum Mediów & Opcji');
  assert.equal(popup.querySelector('.lumina-bottom-menu-close').getAttribute('aria-label'), 'Zamknij menu Więcej');
  assert.equal(popup.querySelector('a[title^="Rolki Wiary"]').href, 'https://polskieradio.cc/rolki');
  const closeStyle = source.match(/\.lumina-bottom-menu-close \{([^}]+)\}/)[1];
  assert.match(closeStyle, /width: 44px !important/);
  assert.match(closeStyle, /height: 44px !important/);
  assert.match(closeStyle, /flex-shrink: 0 !important/);
});
// Isolate the production helper; do not execute unrelated account/media initialization.
const start = source.indexOf('    function setupAccessibleNavigation(');
const end = source.indexOf("    if (document.getElementById('luminaBottomNav'))", start);
assert.ok(start >= 0 && end > start, 'navigation helper boundary exists');
function fixture() {
  const win = new Window();
  win.document.body.innerHTML = `<nav id="luminaBottomNav"><a id="navTabDiscover" href="/lumina" title="Odkrywaj"><i></i></a><a id="navTabFeed" href="/tablica" class="active" title="Tablica"><i></i></a><button id="navTabMoreMenu" title="Więcej"><i></i></button></nav><div id="luminaBottomMenuPopup"><a href="/radio">Radio</a></div>`;
  let sync;
  const enhance = vm.runInNewContext('(' + source.slice(start,end).trim() + ')', {
    MutationObserver: class {constructor(fn){sync=fn;} observe(){} }
  });
  const nav = win.document.getElementById('luminaBottomNav');
  const popup = win.document.getElementById('luminaBottomMenuPopup');
  enhance(nav,popup);
  return {win,nav,popup,more:nav.querySelector('button'),sync:()=>sync()};
}

test('navigation names icons, declares current page and controls without changing links', () => {
  const {nav,more} = fixture();
  assert.equal(nav.querySelector('#navTabFeed').getAttribute('aria-current'),'page');
  assert.equal(nav.querySelector('#navTabDiscover').hasAttribute('aria-current'),false);
  assert.equal(more.getAttribute('aria-label'),'Więcej opcji LUMINA');
  assert.equal(more.getAttribute('aria-controls'),'luminaBottomMenuPopup');
  assert.equal(more.getAttribute('aria-expanded'),'false');
  assert.equal(nav.querySelector('i').getAttribute('aria-hidden'),'true');
  assert.equal(nav.querySelector('a').getAttribute('href'),'/lumina');
});
test('expanded state follows opening and external closing', () => {
  const {popup,more,sync} = fixture();
  popup.classList.add('open'); sync();
  assert.equal(more.getAttribute('aria-expanded'),'true');
  popup.classList.remove('open'); sync();
  assert.equal(more.getAttribute('aria-expanded'),'false');
});
test('Escape closes only the open panel and restores keyboard focus', () => {
  const {win,popup,more,sync} = fixture();
  const link=popup.querySelector('a');
  link.focus();
  link.dispatchEvent(new win.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
  assert.equal(win.document.activeElement,link);
  popup.classList.add('open'); more.classList.add('active'); sync();
  link.dispatchEvent(new win.KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));
  assert.equal(popup.classList.contains('open'),false);
  assert.equal(more.getAttribute('aria-expanded'),'false');
  assert.equal(more.classList.contains('active'),false);
  assert.equal(win.document.activeElement,more);
});
test('Tablica alias is active and primary URLs remain rooted from nested profiles', () => {
  const expression=source.match(/const isTablica = ([^\r\n]+);/)[1];
  for(const pathname of ['/tablica','/tablica/','/lumina-tablica.html']) assert.equal(vm.runInNewContext(expression,{pathname}),true);
  assert.equal(vm.runInNewContext(expression,{pathname:'/lumina/osobowoscplus'}),false);
  for(const route of ['lumina','tablica','rolki']) {
    assert.match(source,new RegExp('href="/'+route+'" class="lumina-nav-tab'));
    assert.equal(new URL('/'+route,'https://polskieradio.cc/lumina/osobowoscplus').pathname,'/'+route);
  }
  assert.match(source,/\.lumina-nav-tab:focus-visible/);
});
