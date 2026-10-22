// Page adapter for the existing LUMINA Google session. No separate auth client.
export function mountAccount(root = document, loadSession = () => import('/lumina-db.js?v=20261013_notifsafe1')) {
  const login = root.getElementById('accountLogin');
  const menu = root.getElementById('accountMenu');
  const avatar = root.getElementById('accountAvatar');
  const initial = root.getElementById('accountInitial');
  const name = root.getElementById('accountName');
  const profileLink = root.getElementById('accountProfile');
  const summary = root.getElementById('accountSummary');
  const feedback = root.getElementById('feedback');
  let session = null;
  function render(user, profile) {
    // Cached profiles and cross-tab events are not authentication evidence.
    const real = session?.getFirebaseAuthUser();
    const signedIn = Boolean(real?.uid && !real.isAnonymous && real.uid === user?.uid);
    login.hidden = signedIn;
    menu.hidden = !signedIn;
    menu.open = false;
    avatar.removeAttribute('src');
    avatar.hidden = true;
    name.textContent = '';
    if (!signedIn) return;
    const own = profile?.uid === real.uid ? profile : {};
    const displayName = own.name || real.displayName || 'Mój profil';
    name.textContent = displayName.split(' ')[0];
    initial.textContent = displayName.trim().charAt(0).toUpperCase() || 'L';
    initial.hidden = false;
    summary.setAttribute('aria-label', `Konto LUMINA: ${displayName}`);
    profileLink.href = '/lumina-profile.html?u=' + encodeURIComponent(own.slug || real.uid);
    const photo = own.avatar || real.photoURL;
    if (typeof photo === 'string') {
      try {
        const url = new URL(photo, root.location?.href || 'https://polskieradio.cc/');
        if (url.protocol === 'https:' || (url.origin === root.location?.origin && url.protocol === 'http:')) {
          avatar.src = url.href;
          avatar.hidden = false;
          initial.hidden = true;
        }
      } catch { /* A broken photo falls back to the account's initial. */ }
    }
  }
  avatar.addEventListener('error', () => { avatar.hidden = true; initial.hidden = false; });
  const ready = loadSession().then(async module => {
    session = module;
    await module.ensureDbReady();
    module.onAuthChange(render);
    render(module.getCurrentUser(), module.getCurrentProfile());
    return module;
  }).catch(() => {
    // The normal login page remains available if the session module fails.
    session = null;
    return null;
  });
  login.addEventListener('click', async event => {
    if (!session) return; // The anchor is a working fallback, including no-JS.
    event.preventDefault();
    if (login.getAttribute('aria-busy') === 'true') return;
    login.setAttribute('aria-busy', 'true');
    try {
      const result = await session.loginWithGoogle();
      if (result?.isRedirecting) return;
      render(session.getCurrentUser(), session.getCurrentProfile());
    } catch {
      feedback.textContent = 'Nie udało się zalogować przez Google. Spróbuj ponownie.';
    } finally {
      login.removeAttribute('aria-busy');
    }
  });
  root.getElementById('accountLogout').addEventListener('click', async () => {
    try { await session?.logoutUser(); render(null, null); }
    catch { feedback.textContent = 'Nie udało się wylogować. Spróbuj ponownie.'; }
  });
  root.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.open) { menu.open = false; summary.focus(); }
  });
  root.addEventListener('click', event => { if (!menu.contains(event.target)) menu.open = false; });
  return ready;
}

if (typeof document !== 'undefined') mountAccount();
