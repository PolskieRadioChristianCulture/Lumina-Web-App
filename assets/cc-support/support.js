import { support } from './config.js';

const status = document.querySelector('#status');
let timer;
function announce(message) {
  status.textContent = message;
  status.classList.add('visible');
  clearTimeout(timer);
  timer = setTimeout(() => status.classList.remove('visible'), 5000);
}

async function copy(value) {
  if (navigator.clipboard && window.isSecureContext) {
    try { await navigator.clipboard.writeText(value); return true; } catch { /* fallback */ }
  }
  const field = document.createElement('textarea');
  field.value = value;
  field.setAttribute('readonly', '');
  field.style.cssText = 'position:fixed;top:0;left:-9999px';
  const previous = document.activeElement;
  document.body.append(field);
  field.select();
  let copied = false;
  try { copied = document.execCommand('copy'); } catch { /* manual copy remains available */ }
  field.remove();
  previous?.focus();
  return copied;
}

document.querySelectorAll('[data-copy]').forEach(button => {
  button.addEventListener('click', async () => {
    const key = button.dataset.copy;
    const value = key === 'blik' ? support.blik : key === 'url' ? support.canonical : support.accounts[Number(key)].number;
    announce(await copy(value) ? 'Skopiowano do schowka.' : 'Nie udało się skopiować. Zaznacz widoczny numer i skopiuj go ręcznie.');
  });
});

document.querySelector('[data-share]').addEventListener('click', async () => {
  const data = { title: 'Razem niesiemy nadzieję dalej — Christian Culture', text: 'Pomóż nieść Ewangelię dalej. Wybierz swoją formę wsparcia Christian Culture.', url: support.canonical };
  if (navigator.share) {
    try { await navigator.share(data); return; }
    catch (error) { if (error.name === 'AbortError') return; }
  }
  announce(await copy(support.canonical) ? 'Link skopiowany. Możesz wkleić go w wiadomości.' : 'Udostępnij adres: ' + support.canonical);
});

const menuButton = document.querySelector('#menu-toggle');
const nav = document.querySelector('#navigation');
function closeMenu() { menuButton.setAttribute('aria-expanded', 'false'); nav.classList.remove('open'); }
menuButton.addEventListener('click', () => {
  const expanded = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(expanded));
  nav.classList.toggle('open', expanded);
});
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
document.addEventListener('click', event => { if (!event.target.closest('header')) closeMenu(); });

if (support.shop) {
  const link = document.querySelector('#shop-link');
  link.href = support.shop;
  link.textContent = 'Odwiedź sklep CC →';
}
document.querySelector('#year').textContent = new Date().getFullYear();

// No names, payments or counts are fabricated. Public API returns confirmed,
// consented acknowledgments only. Generic collective thanks remain available.
const thanksList = document.querySelector('#thanks-list');
const viewport = document.querySelector('#thanks-viewport');
const pauseButton = document.querySelector('#thanks-pause');
let playing = false;
let pauseUntil = 0;
let previousTime = 0;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
function setPlaying(value) {
  playing = value;
  pauseButton.setAttribute('aria-pressed', String(value));
  pauseButton.setAttribute('aria-label', value ? 'Zatrzymaj przewijanie' : 'Włącz automatyczne przewijanie');
  pauseButton.textContent = value ? 'Ⅱ' : '▶';
}
pauseButton.addEventListener('click', () => setPlaying(!playing));
document.querySelector('#thanks-prev').addEventListener('click', () => { setPlaying(false); viewport.scrollBy({ left: -300, behavior: reducedMotion.matches ? 'instant' : 'smooth' }); });
document.querySelector('#thanks-next').addEventListener('click', () => { setPlaying(false); viewport.scrollBy({ left: 300, behavior: reducedMotion.matches ? 'instant' : 'smooth' }); });
['pointerdown', 'wheel', 'keydown'].forEach(type => viewport.addEventListener(type, () => setPlaying(false), { passive: true }));
let hovering = false;
viewport.addEventListener('mouseenter', () => { hovering = true; });
viewport.addEventListener('mouseleave', () => { hovering = false; });
viewport.addEventListener('focus', () => { setPlaying(false); });
function animateThanks(time) {
  const delta = Math.min(time - previousTime, 50);
  previousTime = time;
  if (playing && !hovering && !document.hidden && time > pauseUntil) {
    const maximum = viewport.scrollWidth - viewport.clientWidth;
    if (maximum > 0) {
      if (viewport.scrollLeft >= maximum - 1) { viewport.scrollLeft = 0; pauseUntil = time + 3500; }
      else viewport.scrollLeft += delta * 0.026;
    }
  }
  requestAnimationFrame(animateThanks);
}
setPlaying(!reducedMotion.matches);
reducedMotion.addEventListener('change', event => { if (event.matches) setPlaying(false); });
requestAnimationFrame(animateThanks);

async function readJson(url, options = {}) {
  const headers = { ...options.headers };
  if (options.method && options.method !== 'GET' && session?.csrfToken) headers['X-CC-CSRF'] = session.csrfToken;
  const response = await fetch(url, { credentials: 'same-origin', ...options, headers });
  if (!response.ok) throw new Error('Service unavailable');
  return response.json();
}
const authStatus = document.querySelector('#auth-status');
const consentForm = document.querySelector('#consent-form');
const api = '/api/cc-support';
let session = null;
async function refreshThanks() {
  try {
    const data = await readJson(api + '/thanks');
    if (!Array.isArray(data.items)) return;
    thanksList.querySelectorAll('[data-confirmed]').forEach(item => item.remove());
    for (const item of data.items.slice(0, 50)) {
      if (typeof item.text !== 'string' || !item.text.trim()) continue;
      const li = document.createElement('li');
      li.dataset.confirmed = 'true';
      li.textContent = item.text.slice(0, 220);
      thanksList.append(li);
    }
  } catch { /* No placeholder supporters, no fake recent payments. */ }
}
async function loadSession() {
  try {
    session = await readJson(api + '/session');
    if (!session.authenticated) { authStatus.textContent = 'Zaloguj się w LUMINA, aby zarządzać zgodą na podziękowania.'; return; }
    authStatus.textContent = 'Jesteś zalogowany. Możesz wybrać publiczną nazwę i zarządzać zgodą.';
    document.querySelector('#login-link').textContent = 'Moje podziękowania';
    document.querySelector('#login-link').href = '#moje-podziekowania';
    consentForm.hidden = false;
    document.querySelector('#public-name').value = session.publicName || '';
    document.querySelector('#public-consent').checked = session.consent === true;
    document.querySelector('#anonymous-consent').checked = session.anonymousConsent === true;
  } catch { authStatus.textContent = 'Ustawienia podziękowań będą dostępne po połączeniu tej strony z kontem LUMINA.'; }
}
consentForm.addEventListener('submit', async event => {
  event.preventDefault();
  const button = consentForm.querySelector('button');
  button.disabled = true;
  try {
    await readJson(api + '/consent', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ consent: document.querySelector('#public-consent').checked, anonymousConsent: document.querySelector('#anonymous-consent').checked, publicName: document.querySelector('#public-name').value.trim() }) });
    announce('Zapisano ustawienia podziękowań.');
    await refreshThanks();
  } catch { announce('Nie zapisano ustawień. Spróbuj ponownie po zalogowaniu.'); }
  finally { button.disabled = false; }
});
loadSession();
refreshThanks();
setInterval(() => { if (!document.hidden) refreshThanks(); }, 60000);

for (const [own, other] of [['public-consent','anonymous-consent'],['anonymous-consent','public-consent']]) {
  document.querySelector('#' + own).addEventListener('change', event => { if (event.target.checked) document.querySelector('#' + other).checked = false; });
}
