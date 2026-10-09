/* Voluntary invitation. No profiling, database writes or stored history. */
(function () {
  'use strict';
  if (window.LuminaMemberWelcome) return;
  window.LuminaMemberWelcome = true;
  var mount = document.getElementById('luminaMemberWelcome');
  if (!mount) return;
  var dismissed = new Set();
  var style = document.createElement('style');
  style.textContent = '.lumina-member-welcome:empty{display:none}.lumina-member-welcome{box-sizing:border-box;max-width:960px;margin:16px auto;padding:0 16px}.lumina-member-welcome-card{position:relative;display:flex;align-items:center;gap:16px;padding:18px 60px 18px 20px;border:1px solid #dbc9a6;border-radius:20px;background:#fffaf0;color:#342912;text-align:left}.lumina-member-welcome-copy{flex:1;min-width:0}.lumina-member-welcome-copy strong{display:block;font-size:1rem;line-height:1.4}.lumina-member-welcome-copy p{margin:4px 0 0;font-size:.9rem;line-height:1.5}.lumina-member-welcome-action{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:44px;padding:0 16px;border-radius:24px;background:#725015;color:#fff;text-decoration:none;font-weight:600;font-size:.9rem;white-space:nowrap}.lumina-member-welcome-close{position:absolute;right:8px;top:8px;width:44px;height:44px;border:0;border-radius:50%;background:transparent;color:inherit;font-size:24px;cursor:pointer}.lumina-member-welcome :is(a,button):focus-visible{outline:3px solid #2563eb;outline-offset:3px}[data-lumina-theme="dark"] .lumina-member-welcome-card,html.dark .lumina-member-welcome-card{background:#242031;color:#f8f2e5;border-color:#72603d}@media(max-width:600px){.lumina-member-welcome-card{align-items:flex-start;flex-direction:column;gap:12px;padding:16px 54px 16px 16px}.lumina-member-welcome-action{white-space:normal}}';
  document.head.appendChild(style);
  function member() {
    var user = window.LuminaDB && typeof window.LuminaDB.getCurrentUser === 'function' ? window.LuminaDB.getCurrentUser() : null;
    return user && user.uid && !user.isAnonymous ? user : null;
  }
  function openComposer() {
    if (!member() || typeof window.openQuickPostComposer !== 'function') return false;
    window.openQuickPostComposer('post');
    return true;
  }
  function render() {
    var user = member();
    if (!user || dismissed.has(user.uid)) { mount.replaceChildren(); mount.removeAttribute('data-member'); return; }
    if (mount.getAttribute('data-member') !== user.uid || !mount.firstElementChild) {
      mount.replaceChildren();
      mount.setAttribute('data-member', user.uid);
      var card = document.createElement('section');
      card.className = 'lumina-member-welcome-card';
      card.setAttribute('aria-label', 'Powitanie w społeczności LUMINA');
      card.innerHTML = '<div class="lumina-member-welcome-copy"><strong>Witaj w społeczności LUMINA!</strong><p>Napisz swój pierwszy post — daj się poznać społeczności.</p></div><a class="lumina-member-welcome-action" href="/tablica?compose=first-post">Napisz post</a><button type="button" class="lumina-member-welcome-close" aria-label="Zamknij powitanie" title="Zamknij powitanie">×</button>';
      card.querySelector('a').addEventListener('click', function (event) { if (openComposer()) event.preventDefault(); });
      card.querySelector('button').addEventListener('click', function () { dismissed.add(user.uid); mount.replaceChildren(); });
      mount.appendChild(card);
    }
    var url = new URL(window.location.href);
    if (url.searchParams.get('compose') === 'first-post' && openComposer()) {
      url.searchParams.delete('compose');
      window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash);
    }
  }
  window.addEventListener('lumina-auth-state', render);
  window.addEventListener('pageshow', render);
  render();
})();
