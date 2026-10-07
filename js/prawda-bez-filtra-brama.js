/**
 * Prawda Bez Filtra — bramka 18+.
 * Treść książki i pliki do pobrania wydaje serwer (/api/tresci-18/…) dopiero po
 * weryfikacji tokenu logowania (Firebase, projekt lumina-cc) i oświadczeniu o pełnoletności.
 */
const SLUG = 'prawda-bez-filtra';
const gate = document.getElementById('adultGate');
const statusEl = document.getElementById('gateStatus');
const stepLogin = gate.querySelector('[data-step="login"]');
const stepAge = gate.querySelector('[data-step="age"]');
const ageBox = document.getElementById('gateAge');
const openBtn = document.getElementById('gateOpen');
const FILES = {
  pdf: { id: SLUG + '-pdf', name: 'Prawda_Bez_Filtra.pdf' },
  epub: { id: SLUG + '-epub', name: 'Prawda_Bez_Filtra.epub' },
  bundle: { id: SLUG + '-pakiet', name: 'Prawda_Bez_Filtra_pakiet.zip' }
};
let auth = null;
let unlocked = false;
const setStatus = (t) => { statusEl.textContent = t || ''; };
const ageKey = (uid) => 'cc_18plus_confirmed_' + uid;

async function getAuth() {
  if (auth) return auth;
  const mod = await import('/lumina-db.js?v=cc_auth_v12');
  const ready = await mod.ensureDbReady();
  auth = ready && ready.auth;
  if (auth && typeof auth.authStateReady === 'function') { try { await auth.authStateReady(); } catch (e) { /* brak */ } }
  return auth;
}

async function apiPost(id) {
  const a = await getAuth();
  const user = a && a.currentUser;
  if (!user) return { status: 401 };
  const token = await user.getIdToken();
  const resp = await fetch('/api/tresci-18/' + encodeURIComponent(id), {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + token, 'X-Age-Confirmed': '18+' },
    cache: 'no-store'
  });
  return { status: resp.status, resp, user };
}

function showLogin(msg) {
  stepLogin.hidden = false; stepAge.hidden = true; setStatus(msg || '');
}

async function unlock(auto) {
  if (unlocked) return;
  openBtn.disabled = true;
  setStatus('Wczytuję książkę…');
  try {
    const r = await apiPost(SLUG + '-ksiazka');
    if (r.status === 401) { showLogin(auto ? '' : 'Sesja wygasła. Zaloguj się ponownie.'); return; }
    const data = r.resp ? await r.resp.json().catch(() => ({})) : {};
    if (!r.resp || !r.resp.ok || !data.ok || !Array.isArray(data.chapters)) {
      setStatus('Nie udało się wczytać książki. Spróbuj ponownie za chwilę.');
      openBtn.disabled = false; return;
    }
    try { localStorage.setItem(ageKey(r.user.uid), '1'); } catch (e) { /* tryb prywatny */ }
    const start = () => {
      window.__unlockBook(data.chapters);
      unlocked = true;
      document.querySelectorAll('.gated-card').forEach((el) => { el.hidden = false; });
      gate.closest('section').hidden = true;
      if (!auto) document.getElementById('czytaj').scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    if (typeof window.__unlockBook === 'function') start();
    else window.addEventListener('load', start, { once: true });
  } catch (e) {
    setStatus('Nie udało się wczytać książki. Sprawdź połączenie i spróbuj ponownie.');
    openBtn.disabled = false;
  }
}

async function refresh(autoOpen) {
  try {
    const a = await getAuth();
    const user = a && a.currentUser;
    if (!user) { showLogin(''); return; }
    stepLogin.hidden = true; stepAge.hidden = false;
    let remembered = false;
    try { remembered = localStorage.getItem(ageKey(user.uid)) === '1'; } catch (e) { /* brak */ }
    ageBox.checked = remembered; openBtn.disabled = !remembered;
    setStatus('Zalogowano jako ' + (user.displayName || user.email || 'czytelnik') + '.');
    if (remembered && autoOpen) unlock(true);
  } catch (e) {
    showLogin('Nie udało się sprawdzić logowania. Odśwież stronę i spróbuj ponownie.');
  }
}

document.getElementById('gateLogin').addEventListener('click', () => {
  if (typeof window.ccLoginWithGoogle === 'function') window.ccLoginWithGoogle('/' + SLUG);
  else setStatus('Logowanie jest jeszcze wczytywane. Spróbuj za chwilę.');
});
ageBox.addEventListener('change', () => { openBtn.disabled = !ageBox.checked; });
openBtn.addEventListener('click', () => { if (ageBox.checked) unlock(false); });

// Przed odblokowaniem przyciski czytania / słuchania / pobierania prowadzą do bramki.
document.addEventListener('click', (ev) => {
  if (unlocked) return;
  const t = ev.target.closest('[data-open-reader],[data-action="search"],[data-scroll="#sluchaj"],[data-scroll="#pobierz"],[data-scroll="#czytaj"],a[href="#czytaj"],a[href="#sluchaj"],a[href="#pobierz"]');
  if (!t) return;
  ev.preventDefault(); ev.stopImmediatePropagation();
  gate.scrollIntoView({ behavior: 'smooth', block: 'center' });
}, true);

// Pobieranie plików 18+ (PDF / EPUB / ZIP) — tylko z ważnym logowaniem.
window.__gatedDownload = async (type) => {
  const f = FILES[type];
  if (!f) return;
  try {
    const r = await apiPost(f.id);
    if (!r.resp || !r.resp.ok) {
      if (r.status === 401) { unlocked = false; gate.closest('section').hidden = false; showLogin('Zaloguj się ponownie, aby pobrać plik.'); }
      else if (typeof showToast === 'function') showToast('Plik jest chwilowo niedostępny. Spróbuj ponownie później.');
      return;
    }
    const blob = await r.resp.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = f.name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  } catch (e) {
    if (typeof showToast === 'function') showToast('Nie udało się pobrać pliku. Sprawdź połączenie.');
  }
};

window.addEventListener('lumina-auth-state', () => refresh(true));
refresh(true);
