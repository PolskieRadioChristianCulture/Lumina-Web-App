/* Public lesson links. No SDK loading, tracking or automatic sends. */
(function () {
  'use strict';
  if (document.getElementById('ccDailyShare')) return;
  const day = location.pathname.match(/\/dzien-(\d+)/);
  const url = day ? 'https://polskieradio.cc/akademia/kurscodzienny/dzien-' + day[1]
    : 'https://polskieradio.cc/akademia#kurscodzienny';
  const title = day ? document.title : 'Z Biblią za Pan Brat — Kurs Codzienny';
  const message = title + '\n' + url;
  const style = document.createElement('style');
  style.textContent = '.cc-daily-share{margin:24px 0;padding:20px;border:1px solid #806120;border-radius:20px;background:#0e121a;color:#f4f4f5;font:14px/1.5 Inter,system-ui,sans-serif}.cc-daily-share h2{font-size:20px;margin:0 0 8px;color:#e2cc9a}.cc-daily-share p{margin:8px 0}.cc-daily-share-actions{display:flex;flex-wrap:wrap;gap:8px}.cc-daily-share-actions a,.cc-daily-share-actions button{display:inline-flex;align-items:center;justify-content:center;min-height:44px;min-width:44px;padding:10px 14px;box-sizing:border-box;border:1px solid #806120;border-radius:12px;background:#161b26;color:#f4f4f5;font:inherit;text-decoration:none;cursor:pointer;max-width:100%;overflow-wrap:anywhere}.cc-daily-share-actions :focus-visible{outline:3px solid #e2cc9a;outline-offset:3px}.cc-daily-share-actions :hover{background:#29231c}.cc-daily-share input{box-sizing:border-box;width:100%;min-height:44px;background:#161b26;color:#fff;border:1px solid #806120;border-radius:8px;padding:8px}.cc-daily-share [hidden]{display:none!important}';
  document.head.appendChild(style);
  const panel = document.createElement('section');
  panel.id = 'ccDailyShare';
  panel.className = 'cc-daily-share';
  panel.setAttribute('aria-label', day ? 'Udostępnij lekcję' : 'Udostępnij kurs');
  panel.innerHTML = '<h2></h2><p>Wybierz, komu i gdzie chcesz przekazać link. Udostępnianie nie wymaga konta LUMINA.</p><div class="cc-daily-share-actions"></div><p role="status" aria-live="polite"></p><label hidden>Link do ręcznego skopiowania<input readonly aria-label="Link do skopiowania"></label>';
  panel.querySelector('h2').textContent = day ? 'Podziel się tą lekcją' : 'Zaproś do codziennego kursu';
  const actions = panel.querySelector('.cc-daily-share-actions');
  const status = panel.querySelector('[role="status"]');
  const icons = {'Tablica LUMINA':'L','WhatsApp':'fa-brands fa-whatsapp','Facebook':'fa-brands fa-facebook-f','Telegram':'fa-brands fa-telegram','X':'fa-brands fa-x-twitter','E-mail':'fa-regular fa-envelope','Kopiuj link':'fa-solid fa-link','Więcej aplikacji…':'fa-solid fa-share-nodes'};
  function icon(control, label) {
    control.setAttribute('aria-label', label);
    control.title = label;
    control.style.cssText = 'width:44px;height:44px;padding:0;font-size:20px';
    const glyph = document.createElement(icons[label] === 'L' ? 'span' : 'i');
    glyph.setAttribute('aria-hidden', 'true');
    if (icons[label] === 'L') { glyph.textContent = 'L'; glyph.style.fontWeight = '900'; }
    else glyph.className = icons[label];
    control.appendChild(glyph);
  }
  function link(label, href, external) {
    const a = document.createElement('a');
    icon(a, label);
    a.href = href;
    if (external) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
    actions.appendChild(a);
  }
  const enc = encodeURIComponent;
  link('Tablica LUMINA', '/tablica?' + new URLSearchParams({share_title: title, share_text: message, share_url: url}), false);
  link('WhatsApp', 'https://wa.me/?text=' + enc(message), true);
  link('Facebook', 'https://www.facebook.com/sharer/sharer.php?u=' + enc(url), true);
  link('Telegram', 'https://t.me/share/url?url=' + enc(url) + '&text=' + enc(title), true);
  link('X', 'https://x.com/intent/tweet?url=' + enc(url) + '&text=' + enc(title), true);
  link('E-mail', 'mailto:?subject=' + enc(title) + '&body=' + enc(message), false);
  function button(label, action) {
    const b = document.createElement('button'); b.type = 'button'; icon(b, label);
    b.addEventListener('click', action); actions.appendChild(b);
  }
  function manualCopy() {
    const field = panel.querySelector('input'); field.value = url;
    field.parentElement.hidden = false; field.focus(); field.select();
    status.textContent = 'Nie można skopiować automatycznie. Skopiuj zaznaczony link.';
  }
  button('Kopiuj link', async function () {
    try {
      if (!navigator.clipboard) { manualCopy(); return; }
      await navigator.clipboard.writeText(url);
      status.textContent = 'Link skopiowany.';
    } catch (_) { manualCopy(); }
  });
  if (typeof navigator.share === 'function') button('Więcej aplikacji…', async function () {
    try { await navigator.share({title: title, url: url}); status.textContent = 'Zakończono udostępnianie systemowe.'; }
    catch (error) { if (error.name !== 'AbortError') status.textContent = 'Udostępnianie systemowe jest niedostępne. Wybierz inną opcję lub skopiuj link.'; }
  });
  const old = day && document.querySelector('a[href*="tablica?share="]');
  if (old && old.closest('section')) old.closest('section').replaceWith(panel);
  else {
    const host = document.getElementById('course-view-kurscodzienny') || document.querySelector('main');
    if (host) host.appendChild(panel);
  }
  const invitation = document.createElement('section');
  invitation.id = 'ccDailyAccountInvitation';
  invitation.className = 'cc-daily-share';
  invitation.setAttribute('aria-label','Bezpłatne konto Christian Culture');
  invitation.innerHTML = '<h2>Więcej możliwości — bezpłatnie</h2><p>Zaloguj się, by bezpłatnie korzystać z większej liczby możliwości i dołączyć do społeczności LUMINA.</p><div class="cc-daily-share-actions"><a href="/lumina-login">Zaloguj się — korzystaj bezpłatnie</a></div><p>Czytanie i udostępnianie lekcji pozostaje dostępne bez konta.</p>';
  panel.insertAdjacentElement('afterend',invitation);
  function updateInvitation() {
    // UI events are only a refresh signal, never proof of authentication.
    const user = window.firebaseAuth?.currentUser;
    invitation.hidden = !!user && user.isAnonymous === false;
  }
  updateInvitation();
  window.addEventListener('lumina-auth-state',updateInvitation);
  // Backend release approved: expose enrollment on all lessons (can be suppressed with false).
  if (window.CC_DAILY_COURSE_SUBSCRIPTIONS_ENABLED !== false) {
    const subscription = document.createElement('script');
    subscription.src='/js/cc-daily-course-subscription.js?v=20261008_subscription2';
    document.head.appendChild(subscription);
  }
})();
