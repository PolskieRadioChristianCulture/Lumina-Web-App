/* Książki Cezarego Rogowskiego — zapowiedzi: fragment, udostępnianie */
(function () {
  const toast = document.getElementById('toast');
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(showToast.t);
    showToast.t = setTimeout(() => toast.classList.remove('show'), 2600);
  }
  const fade = document.querySelector('.excerpt-fade');
  const more = document.getElementById('excerptMore');
  if (fade && more) {
    more.addEventListener('click', () => {
      const open = fade.classList.toggle('open');
      more.textContent = open ? 'Zwiń fragment' : 'Czytaj cały fragment';
      more.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }
  const url = document.querySelector('link[rel="canonical"]')?.href || location.href;
  const title = document.title;
  const enc = encodeURIComponent;
  document.querySelectorAll('[data-share]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const kind = btn.dataset.share;
      if (kind === 'native' && navigator.share) {
        try { await navigator.share({ title, url }); } catch (e) { /* anulowano */ }
        return;
      }
      if (kind === 'copy' || kind === 'native') {
        try { await navigator.clipboard.writeText(url); showToast('Link skopiowany do schowka.'); }
        catch (e) { showToast(url); }
        return;
      }
      const targets = {
        fb: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`,
        x: `https://twitter.com/intent/tweet?url=${enc(url)}&text=${enc(title)}`,
        wa: `https://wa.me/?text=${enc(title + ' ' + url)}`
      };
      if (targets[kind]) window.open(targets[kind], '_blank', 'noopener');
    });
  });
})();

/* Bramka 18+: treść wydaje serwer dopiero po weryfikacji logowania (token Firebase) i oświadczeniu */
(function () {
  const gate = document.getElementById('adultGate');
  if (!gate) return;
  const status = document.getElementById('gateStatus');
  const stepLogin = gate.querySelector('[data-step="login"]');
  const stepAge = gate.querySelector('[data-step="age"]');
  const age = document.getElementById('gateAge');
  const openBtn = document.getElementById('gateOpen');
  const contentId = gate.dataset.content;
  let auth = null;
  const setStatus = (t) => { status.textContent = t || ''; };
  const ageKey = (uid) => 'cc_18plus_confirmed_' + uid;

  async function getAuth() {
    if (auth) return auth;
    const mod = await import('/lumina-db.js?v=cc_auth_v12');
    const ready = await mod.ensureDbReady();
    auth = ready && ready.auth;
    if (auth && typeof auth.authStateReady === 'function') { try { await auth.authStateReady(); } catch (e) {} }
    return auth;
  }

  async function refresh() {
    try {
      const a = await getAuth();
      const user = a && a.currentUser;
      if (!user) {
        stepLogin.hidden = false; stepAge.hidden = true; setStatus('');
        return;
      }
      stepLogin.hidden = true; stepAge.hidden = false;
      let remembered = false;
      try { remembered = localStorage.getItem(ageKey(user.uid)) === '1'; } catch (e) {}
      age.checked = remembered; openBtn.disabled = !remembered;
      setStatus('Zalogowano jako ' + (user.displayName || user.email || 'czytelnik') + '.');
    } catch (e) {
      stepLogin.hidden = false; setStatus('Nie udało się sprawdzić logowania. Odśwież stronę i spróbuj ponownie.');
    }
  }

  document.getElementById('gateLogin').addEventListener('click', () => {
    if (typeof window.ccLoginWithGoogle === 'function') window.ccLoginWithGoogle(gate.dataset.return || location.pathname);
    else setStatus('Logowanie jest jeszcze wczytywane. Spróbuj za chwilę.');
  });
  age.addEventListener('change', () => { openBtn.disabled = !age.checked; });

  openBtn.addEventListener('click', async () => {
    if (!age.checked) return;
    openBtn.disabled = true; setStatus('Wczytuję fragment…');
    try {
      const a = await getAuth();
      const user = a && a.currentUser;
      if (!user) { await refresh(); return; }
      const token = await user.getIdToken();
      const resp = await fetch('/api/tresci-18/' + encodeURIComponent(contentId), {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token, 'X-Age-Confirmed': '18+' },
        cache: 'no-store'
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok || !data.ok) {
        setStatus(resp.status === 401 ? 'Sesja wygasła. Zaloguj się ponownie.' : 'Nie udało się wczytać fragmentu. Spróbuj ponownie później.');
        openBtn.disabled = false;
        if (resp.status === 401) { stepLogin.hidden = false; stepAge.hidden = true; }
        return;
      }
      try { localStorage.setItem(ageKey(user.uid), '1'); } catch (e) {}
      document.getElementById('adultTitle').textContent = data.title || '';
      document.getElementById('adultNote').textContent = data.note || '';
      const box = document.getElementById('adultText');
      box.textContent = '';
      (data.paragraphs || []).forEach((t) => { const p = document.createElement('p'); p.textContent = t; box.appendChild(p); });
      const end = document.createElement('p'); end.textContent = '[…]'; box.appendChild(end);
      document.getElementById('adultContent').hidden = false;
      gate.hidden = true;
    } catch (e) {
      setStatus('Nie udało się wczytać fragmentu. Sprawdź połączenie i spróbuj ponownie.');
      openBtn.disabled = false;
    }
  });

  window.addEventListener('lumina-auth-state', refresh);
  refresh();
})();
