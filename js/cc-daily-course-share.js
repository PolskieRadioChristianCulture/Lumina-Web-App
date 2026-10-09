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
  style.textContent = '.cc-daily-share{margin:24px 0;padding:22px;border:1px solid #806120;border-radius:20px;background:#0e121a;color:#f4f4f5;font:14px/1.5 Inter,system-ui,sans-serif}.cc-daily-share h2{font-size:22px;margin:0 0 6px;color:#e2cc9a;font-weight:800}.cc-daily-share p{margin:8px 0}.cc-patron-badge{display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:#c4a35a;margin-bottom:8px}.cc-patron-lead{font-size:14px;line-height:1.6;color:#d4d4d8;margin:6px 0 16px}.cc-patron-pillars{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:14px;margin:16px 0 14px}.cc-patron-col{padding:16px;border:1px solid rgba(196,163,90,0.3);border-radius:16px;background:rgba(22,27,38,0.7);box-sizing:border-box}.cc-col-head{display:flex;align-items:flex-start;gap:12px;margin-bottom:12px}.cc-col-num{display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;min-width:24px;border-radius:50%;background:#c4a35a;color:#0b0d13;font-weight:800;font-size:12px;margin-top:2px}.cc-col-head h3{margin:0;font-size:15px;color:#f4f4f5;font-weight:700}.cc-col-head p{margin:3px 0 0;font-size:12px;color:#a1a1aa;line-height:1.4}.cc-daily-share-actions{display:flex;flex-wrap:wrap;gap:8px}.cc-daily-share-actions a,.cc-daily-share-actions button{display:inline-flex;align-items:center;justify-content:center;min-height:44px;min-width:44px;padding:10px 14px;box-sizing:border-box;border:1px solid #806120;border-radius:12px;background:#161b26;color:#f4f4f5;font:inherit;text-decoration:none;cursor:pointer;max-width:100%;overflow-wrap:anywhere}.cc-daily-share-actions :focus-visible{outline:3px solid #e2cc9a;outline-offset:3px}.cc-daily-share-actions :hover{background:#29231c}.cc-daily-share input{box-sizing:border-box;width:100%;min-height:44px;background:#161b26;color:#fff;border:1px solid #806120;border-radius:8px;padding:8px}.cc-daily-share [hidden]{display:none!important}.cc-daily-patron-finance{margin-top:14px!important;border-color:rgba(196,163,90,0.45)!important}.cc-finance-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:14px;margin-top:14px}.cc-finance-card{padding:16px;border-radius:14px;box-sizing:border-box}.cc-finance-patronite{display:flex;align-items:center;gap:14px;border:1.5px solid rgba(244,63,94,0.4);background:rgba(244,63,94,0.08);color:#f43f5e;text-decoration:none;min-height:44px;transition:all .2s ease}.cc-finance-patronite:hover{background:rgba(244,63,94,0.18);border-color:#f43f5e;transform:translateY(-1px)}.cc-finance-patronite-title{display:block;color:#fff;font-size:14px;font-weight:700}.cc-finance-patronite-sub{font-size:12px;color:#fda4af}.cc-finance-heart{font-size:26px;line-height:1}.cc-finance-bank{border:1px solid rgba(196,163,90,0.35);background:rgba(22,27,38,0.7);color:#f4f4f5}.cc-bank-head{font-size:13px;color:#e2cc9a;margin-bottom:6px}.cc-bank-account{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:14px;font-weight:700;color:#fff;letter-spacing:0.04em;margin-bottom:6px;word-break:break-all}.cc-bank-info{font-size:11px;color:#a1a1aa;margin-bottom:10px}.cc-bank-copy-btn{display:inline-flex;align-items:center;gap:8px;padding:8px 16px;border-radius:10px;background:#c4a35a;color:#0b0d13;border:none;font-weight:700;font-size:12px;cursor:pointer;min-height:38px;transition:all .2s ease}.cc-bank-copy-btn:hover{background:#d4b36a;transform:translateY(-1px)}.cc-bank-status{margin-left:10px;font-size:12px;color:#34d399;font-weight:600}html[data-lumina-theme="light"] .cc-daily-share{background:#fff!important;border-color:rgba(184,142,62,0.35)!important;color:#27221e!important;box-shadow:0 6px 24px rgba(28,25,23,0.04)!important}html[data-lumina-theme="light"] .cc-daily-share h2{color:#8c6d23!important}html[data-lumina-theme="light"] .cc-patron-lead{color:#44403c!important}html[data-lumina-theme="light"] .cc-patron-col{background:#faf8f5!important;border-color:rgba(184,142,62,0.3)!important}html[data-lumina-theme="light"] .cc-col-head h3{color:#1c1917!important}html[data-lumina-theme="light"] .cc-col-head p{color:#71717a!important}html[data-lumina-theme="light"] .cc-finance-bank{background:#faf8f5!important;border-color:rgba(184,142,62,0.35)!important;color:#1c1917!important}html[data-lumina-theme="light"] .cc-bank-account{color:#1c1917!important}html[data-lumina-theme="light"] .cc-finance-patronite-title{color:#1c1917!important}html[data-lumina-theme="light"] .cc-daily-share-actions a,html[data-lumina-theme="light"] .cc-daily-share-actions button{background:#faf8f5!important;border-color:rgba(184,142,62,0.4)!important;color:#27221e!important}html[data-lumina-theme="light"] .cc-daily-share-actions :hover{background:#f3ece0!important}html[data-lumina-theme="light"] .cc-daily-share input{background:#faf8f5!important;color:#1c1917!important;border-color:rgba(184,142,62,0.35)!important}.ak-header #reader-font-label,.ak-header #tts-btn-text,.ak-header .theme-toggle-label,.ak-header #ccTopSubLink span,.ak-header a[href*="patronite"] span:not(:first-child){display:none!important}.ak-header .kc-reader-pill,.ak-header #btn-audio-tts,.ak-header #btn-theme-toggle,.ak-header #ccTopSubLink,.ak-header a[href*="patronite"]{width:38px!important;height:38px!important;min-width:38px!important;min-height:38px!important;padding:0!important;justify-content:center!important;align-items:center!important;display:inline-flex!important;border-radius:9999px!important;box-sizing:border-box!important}@media(max-width:768px){.ak-header .ak-header-slash,.ak-header .ak-header-course-title,.ak-header .ak-header-brand-sub{display:none!important}.ak-header .max-w-6xl,.ak-header .max-w-7xl{padding-left:12px!important;padding-right:12px!important}}@media(min-width:769px){.ak-header .ak-header-course-title{max-width:none!important;text-overflow:clip!important;white-space:nowrap!important}}.back-to-top{position:fixed;bottom:2rem;right:1.5rem;width:44px;height:44px;min-width:44px;min-height:44px;border-radius:50%;background:rgba(17,16,14,0.92);border:1.5px solid #c4a35a;color:#c4a35a;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:1.1rem;z-index:998;box-shadow:0 4px 18px rgba(0,0,0,0.65),0 0 10px rgba(196,163,90,0.15);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);opacity:0;visibility:hidden;transform:translateY(14px);transition:opacity .3s cubic-bezier(.16,1,.3,1),visibility .3s cubic-bezier(.16,1,.3,1),transform .3s cubic-bezier(.16,1,.3,1),background .2s ease,color .2s ease,border-color .2s ease,box-shadow .2s ease;outline:none;-webkit-tap-highlight-color:transparent}.back-to-top.visible{opacity:1;visibility:visible;transform:translateY(0)}.back-to-top:hover{background:#c4a35a;color:#0b0d13;transform:translateY(-3px);box-shadow:0 8px 25px rgba(196,163,90,0.45)}.back-to-top:active{transform:translateY(0) scale(0.95)}.back-to-top:focus-visible{outline:3px solid #e2cc9a;outline-offset:3px}@media(max-width:768px){.back-to-top{right:1.25rem;bottom:max(1.25rem,env(safe-area-inset-bottom,20px));width:44px;height:44px;font-size:1.1rem}}html[data-lumina-theme="light"] .back-to-top{background:rgba(255,255,255,0.95)!important;border-color:rgba(184,142,62,0.65)!important;color:#8c6d23!important;box-shadow:0 4px 18px rgba(28,25,23,0.1),0 0 10px rgba(184,142,62,0.1)!important}html[data-lumina-theme="light"] .back-to-top:hover{background:#c4a35a!important;color:#ffffff!important;box-shadow:0 8px 25px rgba(184,142,62,0.4)!important}';
  document.head.appendChild(style);
  const panel = document.createElement('section');
  panel.id = 'ccDailyShare';
  panel.className = 'cc-daily-share';
  panel.setAttribute('aria-label', day ? 'Zostań patronem tej lekcji' : 'Zostań patronem Kursu Codziennego');
  panel.innerHTML = '<div class="cc-patron-badge"><i class="fa-solid fa-crown" aria-hidden="true"></i><span>PATRONAT NAD SŁOWEM · WEZWANIE DO DZIAŁANIA</span></div><h2></h2><p class="cc-patron-lead"></p><div class="cc-patron-pillars"><div class="cc-patron-col"><div class="cc-col-head"><span class="cc-col-num">1</span><div><h3>Udostępnij w mediach społecznościowych</h3><p>Dotrzyj do swoich znajomych i społeczności w sieci</p></div></div><div class="cc-daily-share-actions cc-actions-social"></div></div><div class="cc-patron-col"><div class="cc-col-head"><span class="cc-col-num">2</span><div><h3>Wyślij kilku znajomym</h3><p>Przekaż link bliskim, którzy potrzebują dziś zachęty</p></div></div><div class="cc-daily-share-actions cc-actions-direct"></div></div></div><p role="status" aria-live="polite"></p><label hidden>Link do ręcznego skopiowania<input readonly aria-label="Link do skopiowania"></label>';
  panel.querySelector('h2').textContent = day ? 'Zostań patronem tej lekcji' : 'Zostań patronem Kursu Codziennego';
  panel.querySelector('.cc-patron-lead').textContent = day
    ? 'Każda lekcja i całe Słowo Boże w Christian Culture są w 100% bezpłatne. Ty decydujesz, czy chcesz wesprzeć tę misję i ponieść ją dalej. Trzy proste filary działania:'
    : 'Cały Kurs Codzienny w Christian Culture jest w 100% bezpłatny. Ty decydujesz, czy chcesz pomóc nam rozwijać to dzieło i dotrzeć do kolejnych ludzi. Trzy proste filary działania:';
  const socialActions = panel.querySelector('.cc-actions-social');
  const directActions = panel.querySelector('.cc-actions-direct');
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
  function link(container, label, href, external) {
    const a = document.createElement('a');
    icon(a, label);
    a.href = href;
    if (external) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
    container.appendChild(a);
  }
  const enc = encodeURIComponent;
  link(socialActions, 'Tablica LUMINA', '/tablica?' + new URLSearchParams({share_title: title, share_text: message, share_url: url}), false);
  link(directActions, 'WhatsApp', 'https://wa.me/?text=' + enc(message), true);
  link(socialActions, 'Facebook', 'https://www.facebook.com/sharer/sharer.php?u=' + enc(url), true);
  link(socialActions, 'Telegram', 'https://t.me/share/url?url=' + enc(url) + '&text=' + enc(title), true);
  link(socialActions, 'X', 'https://x.com/intent/tweet?url=' + enc(url) + '&text=' + enc(title), true);
  link(directActions, 'E-mail', 'mailto:?subject=' + enc(title) + '&body=' + enc(message), false);
  function button(container, label, action) {
    const b = document.createElement('button'); b.type = 'button'; icon(b, label);
    b.addEventListener('click', action); container.appendChild(b);
  }
  function manualCopy() {
    const field = panel.querySelector('input'); field.value = url;
    field.parentElement.hidden = false; field.focus(); field.select();
    status.textContent = 'Nie można skopiować automatycznie. Skopiuj zaznaczony link.';
  }
  button(directActions, 'Kopiuj link', async function () {
    try {
      if (!navigator.clipboard) { manualCopy(); return; }
      await navigator.clipboard.writeText(url);
      status.textContent = 'Link skopiowany.';
    } catch (_) { manualCopy(); }
  });
  if (typeof navigator.share === 'function') button(directActions, 'Więcej aplikacji…', async function () {
    try { await navigator.share({title: title, url: url}); status.textContent = 'Zakończono udostępnianie systemowe.'; }
    catch (error) { if (error.name !== 'AbortError') status.textContent = 'Udostępnianie systemowe jest niedostępne. Wybierz inną opcję lub skopiuj link.'; }
  });
  const old = day && document.querySelector('a[href*="tablica?share="]');
  if (old && old.closest('section')) old.closest('section').replaceWith(panel);
  else {
    const host = document.getElementById('course-view-kurscodzienny') || document.querySelector('main');
    if (host) host.appendChild(panel);
  }

  // Filar 3: Przekaż uznanie (finansowe)
  const financePanel = document.createElement('section');
  financePanel.id = 'ccDailyPatronFinance';
  financePanel.className = 'cc-daily-share cc-daily-patron-finance';
  financePanel.setAttribute('aria-label', 'Przekaż uznanie finansowe');
  financePanel.innerHTML = '<div class="cc-col-head"><span class="cc-col-num">3</span><div><h3 style="margin:0;font-size:18px;color:#e2cc9a;font-weight:700">Przekaż uznanie (finansowe)</h3><p style="font-size:13px;color:#a1a1aa;margin:4px 0 0">Doceniasz tę lekcję? Twoje wsparcie pomaga rozwijać studio nagraniowe, lektorów TTS, produkcję i bezpłatne materiały.</p></div></div><div class="cc-finance-grid"><a href="https://patronite.pl/osobowoscplus" target="_blank" rel="noopener noreferrer" class="cc-finance-card cc-finance-patronite"><span class="cc-finance-heart">❤️</span><div><strong class="cc-finance-patronite-title">Zostań Patronem na Patronite</strong><span class="cc-finance-patronite-sub">patronite.pl/osobowoscplus</span></div></a><div class="cc-finance-card cc-finance-bank"><div class="cc-bank-head"><strong>Bezpośredni przelew bankowy (PLN)</strong></div><div class="cc-bank-account" id="ccBankAccNum">74 2910 0006 2469 8002 1062 8039</div><div class="cc-bank-info">Odbiorca: Cezary Rogowski • Tytuł: Patronat nad lekcją</div><div style="display:flex;align-items:center;flex-wrap:wrap;gap:8px"><button type="button" class="cc-bank-copy-btn"><i class="fa-regular fa-copy" aria-hidden="true"></i> <span>Kopiuj numer konta</span></button><span class="cc-bank-status" role="status" aria-live="polite"></span></div></div></div>';
  const copyAccBtn = financePanel.querySelector('.cc-bank-copy-btn');
  const copyAccStatus = financePanel.querySelector('.cc-bank-status');
  if (copyAccBtn) {
    copyAccBtn.addEventListener('click', async function () {
      try {
        if (navigator.clipboard) {
          await navigator.clipboard.writeText('74291000062469800210628039');
        }
        if (copyAccStatus) {
          copyAccStatus.textContent = 'Numer konta skopiowany!';
          setTimeout(function () { copyAccStatus.textContent = ''; }, 3000);
        }
      } catch (_) {
        if (copyAccStatus) copyAccStatus.textContent = '74 2910 0006 2469 8002 1062 8039';
      }
    });
  }
  panel.insertAdjacentElement('afterend', financePanel);

  const invitation = document.createElement('section');
  invitation.id = 'ccDailyAccountInvitation';
  invitation.className = 'cc-daily-share';
  invitation.setAttribute('aria-label','Bezpłatne konto Christian Culture');
  invitation.innerHTML = '<h2>Więcej możliwości — bezpłatnie</h2><p>Zaloguj się, by bezpłatnie korzystać z większej liczby możliwości i dołączyć do społeczności LUMINA.</p><div class="cc-daily-share-actions"><a href="/lumina-login">Zaloguj się — korzystaj bezpłatnie</a></div><p>Czytanie i udostępnianie lekcji pozostaje dostępne bez konta.</p>';
  financePanel.insertAdjacentElement('afterend',invitation);
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
    subscription.src='/js/cc-daily-course-subscription.js?v=20261008_desktop_icons_v2';
    document.head.appendChild(subscription);
  }

  // Floating Back to Top Button (Standard dla wszystkich lekcji i kursów)
  function initBackToTop() {
    function setup() {
      if (!document.body) return;
      var btn = document.getElementById('backToTopBtn');
      if (!btn) {
        btn = document.createElement('button');
        btn.id = 'backToTopBtn';
        btn.className = 'back-to-top';
        btn.type = 'button';
        btn.setAttribute('aria-label', 'Przewiń do góry');
        btn.title = 'Przewiń do góry';
        btn.innerHTML = '<i class="fa-solid fa-arrow-up" aria-hidden="true"></i>';
        document.body.appendChild(btn);
      } else {
        if (!btn.getAttribute('aria-label')) btn.setAttribute('aria-label', 'Przewiń do góry');
        if (!btn.title) btn.title = 'Przewiń do góry';
        if (!btn.firstElementChild) {
          btn.innerHTML = '<i class="fa-solid fa-arrow-up" aria-hidden="true"></i>';
        }
      }
      if (btn._scrollBound) return;
      btn._scrollBound = true;

      btn.addEventListener('click', function (e) {
        e.preventDefault();
        if (typeof window.scrollTo === 'function') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          document.documentElement.scrollTop = 0;
          if (document.body) document.body.scrollTop = 0;
        }
      });

      function onScroll() {
        var scrollY = window.pageYOffset || document.documentElement.scrollTop || window.scrollY || 0;
        if (scrollY > 300) {
          btn.classList.add('visible');
        } else {
          btn.classList.remove('visible');
        }
      }

      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', setup);
    } else {
      setup();
    }
  }
  initBackToTop();

  // Course theme controller (Light & Dark Mode)
  if (!document.getElementById('ccCourseThemeScript') && !window.CCCourseTheme) {
    const themeScript = document.createElement('script');
    themeScript.id = 'ccCourseThemeScript';
    themeScript.src = '/js/cc-course-theme.js?v=20261008_desktop_icons_v2';
    document.head.appendChild(themeScript);
  }
})();

