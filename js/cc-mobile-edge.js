/* Shared mobile navigation. No account reads, storage, SDKs or network requests. */
(() => {
  'use strict';
  if (window.CCMobileEdge) return;
  const paths = {
    plus: 'M12 5v14M5 12h14', close: 'm6 6 12 12M6 18 18 6',
    home: 'm3 10 9-7 9 7v11h-6v-7H9v7H3Z',
    users: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M16 3a4 4 0 0 1 0 8M22 21v-2a4 4 0 0 0-3-3.87M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
    chat: 'M21 11.5a8.5 8.5 0 0 1-8.5 8.5H3l2-5a8.5 8.5 0 1 1 16-3.5Z',
    news: 'M4 3h16v18H4ZM8 7h8M8 11h8M8 15h3M8 18h8',
    book: 'M12 5C8 2 3 3 2 4v16c4-2 7-1 10 1 3-2 6-3 10-1V4c-4-2-7-1-10 1Zm0 0v16',
    study: 'm2 8 10-5 10 5-10 5Zm4 3v6c4 3 8 3 12 0v-6M22 8v8',
    calendar: 'M4 5h16v16H4ZM8 2v6M16 2v6M4 11h16M8 15h2M14 15h2',
    play: 'm8 5 11 7-11 7Z', search: 'M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
    menu: 'M4 6h16M4 12h16M4 18h16', board: 'M3 3h7v7H3ZM14 3h7v7h-7ZM3 14h7v7H3ZM14 14h7v7h-7Z',
    user: 'M20 21v-2a6 6 0 0 0-6-6h-4a6 6 0 0 0-6 6v2M16 6a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
    star: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z',
    info: 'M12 16v-4M12 8h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
    theme: 'M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z',
  };
  const icon = name => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    for (const [key,value] of Object.entries({viewBox:'0 0 24 24',fill:'none',stroke:'currentColor','stroke-width':'1.8','stroke-linecap':'round','stroke-linejoin':'round','aria-hidden':'true'})) svg.setAttribute(key,value);
    const p = document.createElementNS(svg.namespaceURI,'path');
    p.setAttribute('d', paths[name] || paths.menu);
    svg.append(p);
    return svg;
  };
  const commonItems = [
    ['home','Strona główna','/'], ['users','LUMINA — społeczność','/lumina'],
    ['chat','LUMI Messenger','/mess'], ['news','CCN News','/news'],
    ['book','Moja Biblia','/mojabiblia'], ['study','Akademia Biblijna','/akademia'],
    ['calendar','HOLOS — planer','/holos'], ['play','Kino VOD','/vod'],
    ['search','Szukaj w ekosystemie','/szukaj'],
  ];

  function mount({legacy, placement = legacy, secondary = [], profile = 'home', items = commonItems, canUseFullMenu = () => true}) {
    if (!(legacy instanceof HTMLElement) || !(placement instanceof HTMLElement) || legacy.dataset.ccEdgeMounted || document.getElementById('cc-mobile-edge-dialog') || typeof HTMLDialogElement === 'undefined' || !HTMLDialogElement.prototype.showModal) return null;
    const mobile = matchMedia('(max-width: 767px)');
    const dialog = document.createElement('dialog');
    dialog.id = 'cc-mobile-edge-dialog';
    dialog.className = 'cc-mobile-edge';
    dialog.dataset.profile = profile;
    dialog.setAttribute('aria-label', profile === 'lumina' ? 'Nawigacja LUMINA i Christian Culture' : 'Nawigacja Christian Culture');
    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'cc-mobile-edge-trigger';
    trigger.dataset.profile = profile;
    trigger.setAttribute('aria-label','Otwórz panel nawigacji');
    trigger.setAttribute('aria-haspopup','dialog');
    trigger.setAttribute('aria-controls',dialog.id);
    trigger.setAttribute('aria-expanded','false');
    trigger.append(icon('plus'));
    const nav = document.createElement('nav');
    nav.setAttribute('aria-label','Skróty ekosystemu');
    dialog.append(nav);
    let restoreOverflow = '', previousFocus = null, active = false, touch = null;
    function cleanup() {
      if (!active) return;
      active = false;
      document.body.style.overflow = restoreOverflow;
      trigger.setAttribute('aria-expanded','false');
      if (previousFocus?.isConnected && previousFocus.getClientRects().length) previousFocus.focus({preventScroll:true});
    }
    function close() { if (dialog.open) dialog.close(); cleanup(); }
    function button(name, label, onClick) {
      const b = document.createElement('button');
      b.type = 'button'; b.setAttribute('aria-label',label); b.title = label;
      b.append(icon(name)); b.addEventListener('click',onClick); nav.append(b);
      return b;
    }
    button('close','Zamknij panel nawigacji',close).autofocus = true;
    // Reuse the canonical LUMINA controllers, never a second search/theme engine.
    let searchAction, themeAction;
    function syncLuminaControls() {
      if (profile !== 'lumina') return;
      const searchReady = !!document.getElementById('mobileNavSearchBtn') && typeof window.toggleMobileNavbarSearch === 'function';
      const themeReady = !!document.getElementById('luminaThemeSwitchBtn') && typeof window.toggleLuminaTheme === 'function';
      document.documentElement.classList.toggle('cc-edge-search-ready', searchReady);
      document.documentElement.classList.toggle('cc-edge-theme-ready', themeReady);
      const localSearch = searchReady && !document.body.classList.contains('user-is-guest');
      searchAction.hidden = !localSearch;
      const globalSearch = nav.querySelector('a[href="/szukaj"]');
      if (globalSearch) globalSearch.hidden = localSearch;
      themeAction.hidden = !themeReady;
      const light = document.documentElement.getAttribute('data-lumina-theme') === 'light';
      themeAction.title = light ? 'Przełącz na motyw ciemny' : 'Przełącz na motyw jasny';
      themeAction.setAttribute('aria-label', themeAction.title);
      themeAction.setAttribute('aria-pressed', String(!light));
    }
    if (profile === 'lumina') {
      searchAction = button('search','Szukaj na portalu LUMINA',event => {
        event.stopPropagation(); close();
        document.getElementById('mobileNavSearchBtn')?.click();
      });
      searchAction.dataset.ccEdgeAction = 'search';
      themeAction = button('theme','Przełącz motyw',event => {
        event.stopPropagation();
        document.getElementById('luminaThemeSwitchBtn')?.click();
        syncLuminaControls();
      });
      themeAction.dataset.ccEdgeAction = 'theme';
      window.addEventListener('luminathemechange',syncLuminaControls);
      window.addEventListener('load',syncLuminaControls,{once:true});
    }
    const current = location.pathname.replace(/\.html$/, '').replace(/\/$/,'') || '/';
    for (const [name,label,href] of items) {
      // Only trusted same-origin routes/fragments; never executable URLs.
      const url = new URL(href, location.origin);
      if (url.origin !== location.origin || !['https:','http:'].includes(url.protocol)) continue;
      const a = document.createElement('a');
      a.href = url.pathname + url.search + url.hash;
      a.setAttribute('aria-label',label); a.title = label; a.append(icon(name));
      if (current === url.pathname && !url.hash) a.setAttribute('aria-current','page');
      a.addEventListener('click',close); nav.append(a);
    }
    let favoriteRevision = 0;
    async function syncFavorite() {
      const revision = ++favoriteRevision;
      const api = window.CCFavorites;
      if (!api?.getPageMeta || !api?.isFavorite) return;
      try {
        const isFav = await api.isFavorite(api.getPageMeta().url);
        if (revision !== favoriteRevision) return;
        favBtn.classList.toggle('is-active', !!isFav);
        favBtn.setAttribute('aria-pressed', String(!!isFav));
        favBtn.title = isFav ? 'Usuń tę stronę z Ulubionych' : 'Dodaj tę stronę do Ulubionych';
        favBtn.setAttribute('aria-label',favBtn.title);
      } catch { /* The canonical favorite controller retains its own error UI. */ }
    }
    const favBtn = button('star','Dodaj tę stronę do Ulubionych',async event => {
      event.stopPropagation();
      if (window.CCFavorites && typeof window.CCFavorites.toggleFavorite === 'function') {
        favBtn.disabled = true;
        try { await window.CCFavorites.toggleFavorite(); await syncFavorite(); }
        catch { /* Do not display a false success. */ }
        finally { favBtn.disabled = false; }
      }
    });
    favBtn.setAttribute('data-cc-favorite-toggle','true');
    const infoBtn = button('info','Informacje o projekcie',event => {
      event.stopPropagation(); close();
      if (window.ekoccInfo && typeof window.ekoccInfo.open === 'function') {
        window.ekoccInfo.open();
      } else {
        const trigger = document.getElementById('ekoccInfoTriggerBtn') || document.querySelector('.ekocc-info-trigger');
        if (trigger) trigger.click();
      }
    });
    infoBtn.setAttribute('data-ekocc-info-trigger','true');
    const fullMenu = button('menu','Pełne menu — wszystkie funkcje',event => {
      event.stopPropagation(); close(); if (canUseFullMenu()) legacy.click();
    });
    trigger.addEventListener('click',() => {
      if (!mobile.matches || dialog.open || document.querySelector('dialog[open]')) return;
      previousFocus = document.activeElement;
      fullMenu.hidden = !canUseFullMenu();
      syncLuminaControls();
      void syncFavorite();
      restoreOverflow = document.body.style.overflow;
      dialog.showModal();
      active = true;
      document.body.style.overflow = 'hidden';
      trigger.setAttribute('aria-expanded','true');
    });
    dialog.addEventListener('cancel',e => { e.preventDefault(); close(); });
    dialog.addEventListener('close',() => { if (!dialog.open) cleanup(); });
    dialog.addEventListener('click',e => {
      const r = dialog.getBoundingClientRect();
      if (e.target === dialog && (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom)) close();
    });
    dialog.addEventListener('touchstart',e => { touch = e.touches.length === 1 ? {x:e.touches[0].clientX,y:e.touches[0].clientY} : null; },{passive:true});
    dialog.addEventListener('touchcancel',() => { touch = null; });
    dialog.addEventListener('touchend',e => {
      const start = touch; touch = null;
      if (!start || !e.changedTouches.length) return;
      const dx = e.changedTouches[0].clientX-start.x, dy = e.changedTouches[0].clientY-start.y;
      if (dx < -50 && Math.abs(dx) > Math.abs(dy)*1.5) close();
    },{passive:true});
    mobile.addEventListener('change',() => { if (!mobile.matches) close(); });
    document.body.append(dialog);
    placement.before(trigger);
    legacy.dataset.ccEdgeMounted = 'true';
    legacy.classList.add('cc-edge-legacy');
    for (const element of secondary) element?.classList.add('cc-edge-legacy');
    syncLuminaControls();
    return {close, dialog, trigger};
  }
  window.CCMobileEdge = Object.freeze({mount});
  const script = document.querySelector('script[data-cc-edge-profile]');
  if (script?.dataset.ccEdgeProfile === 'home') mount({legacy:document.getElementById('actionsToggleBtn'),placement:document.getElementById('hamburgerBtn'),secondary:[document.getElementById('hamburgerBtn')]});
  // /mess is generated from lumina.html but retains its dedicated app navigation.
  if (script?.dataset.ccEdgeProfile === 'lumina' && /^\/lumina(?:\.html)?\/?$/i.test(location.pathname)) {
    const legacy = document.getElementById('topNavMenuBtn');
    mount({legacy,placement:legacy?.closest('.nav-menu-wrapper'),profile:'lumina',canUseFullMenu:()=>!document.body.classList.contains('user-is-guest'),items:[
      ['users','LUMINA — społeczność','/lumina'], ['board','Tablica LUMINA','/tablica'],
      ['chat','LUMI Messenger','/mess'], ['user','Konto i logowanie LUMINA','/lumina-login'], ...commonItems.filter(item=>!['users','chat'].includes(item[0])),
    ]});
  }
})();
