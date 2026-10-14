// /mess is the canonical chat surface; other pages host the same document.
// No alternate identity, database, permission or message transport is created.
(function () {
  'use strict';
  if (window.CCUnifiedChat) return;
  const canonical = /^\/mess(?:\/|\.html)?$/.test(location.pathname);
  const embedded = canonical && new URLSearchParams(location.search).get('embed') === '1';
  const scriptPromises = new Map();
  function load(src, globalName) {
    if (window[globalName]) return Promise.resolve();
    if (scriptPromises.has(src)) return scriptPromises.get(src);
    const promise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = () => reject(new Error('Nie udało się wczytać modułu'));
      document.head.appendChild(script);
    });
    scriptPromises.set(src, promise);
    return promise;
  }
  const radioReady = load('/js/cc-radio-catalog.js?v=20261014_shared1', 'CCRadioStations')
    .then(() => load('/js/cc-radio-milion.js?v=20261014_shared1', 'CCRadioMilion'))
    .then(async () => {
      try {
        if (window.parent !== window && window.parent.location.origin === location.origin && window.parent.CCChatRadioReady) {
          await window.parent.CCChatRadioReady;
          window.CCChatRadio = window.parent.CCChatRadio;
          return;
        }
      } catch (_) {}
      await load('/js/cc-chat-radio.js?v=20261014_shared1', 'CCChatRadio');
    });
  window.CCChatRadioReady = radioReady;
  radioReady.catch(() => {});
  const style = document.createElement('style');
  style.textContent = `
    #ccUnifiedChatHost{position:fixed;inset:0;z-index:2147483000;background:#090e1a;display:flex;flex-direction:column;color:#f8fafc;font:14px system-ui}
    #ccUnifiedChatHost[hidden]{display:none!important}
    #ccUnifiedChatFrame{width:100%!important;height:100%!important;flex:1;min-height:0;border:0;background:#090e1a}
    .cc-chat-radio{display:inline-flex;align-items:center;gap:6px;padding:3px 6px 3px 4px;background:rgba(15,23,42,0.85);border:1px solid rgba(196,163,90,0.4);border-radius:20px;color:#f8fafc;font:12px/1.2 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;box-shadow:0 2px 8px rgba(0,0,0,0.4),inset 0 1px 0 rgba(255,255,255,0.08);flex-shrink:1;max-width:100%;margin:0 6px 0 auto!important;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);transition:all .25s ease}
    .cc-chat-radio.is-playing{border-color:rgba(16,185,129,0.7);box-shadow:0 0 12px rgba(16,185,129,0.3),inset 0 1px 0 rgba(255,255,255,0.12)}
    .cc-chat-radio button{background:linear-gradient(135deg,#facc15 0%,#eab308 100%);color:#0f172a;border:0;border-radius:14px;min-height:36px;min-width:44px;padding:0 10px;font-size:11px;font-weight:700;letter-spacing:.02em;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:5px;box-shadow:0 2px 6px rgba(250,204,21,0.3);transition:all .2s ease;white-space:nowrap;font-family:inherit}
    .cc-chat-radio button::before{content:'▶';font-size:9px;line-height:1}
    .cc-chat-radio.is-playing button{background:linear-gradient(135deg,#10b981 0%,#059669 100%);color:#fff;box-shadow:0 2px 6px rgba(16,185,129,0.4)}
    .cc-chat-radio.is-playing button::before{content:'⏸'}
    .cc-chat-radio button:disabled{opacity:.55;cursor:wait}
    .cc-chat-radio select{background:rgba(2,6,23,0.75);color:#f8fafc;border:1px solid rgba(196,163,90,0.35);border-radius:14px;min-height:36px;padding:0 8px;font:inherit;font-size:11px;font-weight:600;cursor:pointer;outline:none;max-width:160px}
    .cc-chat-radio select:focus{border-color:#facc15;box-shadow:0 0 0 2px rgba(250,204,21,0.25)}
    .cc-chat-radio select option{background:#0f172a;color:#f8fafc}
    .cc-chat-radio-bars{display:inline-flex;align-items:flex-end;gap:2px;height:14px;padding:0 4px}
    .cc-chat-radio-bars span{width:2.5px;background:#94a3b8;border-radius:1px;height:4px;transition:height .2s ease}
    .cc-chat-radio.is-playing .cc-chat-radio-bars span{background:#10b981;animation:ccRadioBarBounce 1s ease-in-out infinite alternate}
    .cc-chat-radio.is-playing .cc-chat-radio-bars span:nth-child(1){animation-delay:0s;height:12px}
    .cc-chat-radio.is-playing .cc-chat-radio-bars span:nth-child(2){animation-delay:.2s;height:14px}
    .cc-chat-radio.is-playing .cc-chat-radio-bars span:nth-child(3){animation-delay:.4s;height:8px}
    @keyframes ccRadioBarBounce{0%{height:4px}100%{height:14px}}
    .cc-chat-radio output{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
    .cc-chat-header{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:8px!important}
    .cc-chat-header-brand{flex:0 1 auto!important;min-width:0!important}
    .cc-chat-header .cc-chat-radio, .chat-header-bar .cc-chat-radio{margin:0 6px 0 auto!important}
    @media (max-width: 480px) {
      .cc-chat-header{gap:4px!important;padding:10px 8px!important}
      .cc-chat-header-brand{min-width:0!important;flex:0 1 auto!important}
      .cc-chat-header-sub{display:none!important}
      .cc-chat-header-title{font-size:0.82rem!important}
      .cc-chat-header-icon{width:30px!important;height:30px!important;min-width:30px!important}
      .cc-chat-radio{margin:0 4px 0 auto!important;padding:2px 4px!important}
      .cc-chat-radio select{max-width:95px!important;font-size:10px!important;padding:0 4px!important}
      .cc-chat-radio button{padding:0 6px!important;font-size:10px!important;min-width:36px!important}
      .cc-chat-radio-bars{display:none!important}
    }
    body.cc-mess-embedded #lumiLanding,body.cc-mess-embedded #lumiIntroOverlay{display:none!important}
    body.cc-mess-embedded .modal-overlay.open{inset:0!important;height:100dvh!important;max-height:100dvh!important}
    body.cc-mess-embedded #ccGlobalChatOverlay,
    body.lumi-standalone #ccGlobalChatOverlay,
    body:has(#directMessagesModal.open) #ccGlobalChatOverlay,
    body:has(#chatSettingsModal.open) #ccGlobalChatOverlay{display:none!important;pointer-events:none!important;visibility:hidden!important}
    #chatSettingsModal.open{position:fixed!important;inset:0!important;width:100vw!important;height:100dvh!important;display:flex!important;align-items:center!important;justify-content:center!important;z-index:2147483647!important;opacity:1!important;visibility:visible!important;pointer-events:auto!important}
    #chatSettingsModal.open>.modal-card{position:relative!important;z-index:2147483647!important;display:block!important;opacity:1!important;visibility:visible!important;pointer-events:auto!important;max-width:460px!important;width:92%!important}
  `;
  document.head.appendChild(style);
  let host, frame, previousOverflow, opener, request = { tab: 'public' };
  function openCurrent(next = request) {
    request = next;
    const user = window.LuminaDB?.getCurrentUser?.();
    const drawer = document.getElementById('ccGlobalChatOverlay');
    if (drawer) {
      drawer.classList.remove('is-open');
      drawer.setAttribute('aria-hidden', 'true');
    }
    if (next.partner && user && !user.isAnonymous && typeof window.openChatWith === 'function') {
      window.openChatWith(next.name || next.partner, next.avatar || '/lumina_icon.jpg', next.partner, next.messageId);
    } else if (user && !user.isAnonymous && typeof window.openDirectMessagesModal === 'function') {
      window.openDirectMessagesModal(next.tab === 'members' ? 'private' : (next.tab || 'public'));
    } else if (window.CCGlobalChat) {
      window.CCGlobalChat.open(next.tab === 'members' ? 'members' : 'live', next.partner);
    }
  }
  function deliver() {
    try {
      if (frame?.contentWindow?.location.origin === location.origin && frame.contentWindow.CCUnifiedChat) frame.contentWindow.CCUnifiedChat.openCurrent(request);
    } catch (_) {}
  }
  function open(next = {}) {
    request = { tab: 'public', ...next };
    if (canonical) return openCurrent(request);
    if (!host) {
      host = document.createElement('section');
      host.id = 'ccUnifiedChatHost';
      host.hidden = true;
      host.setAttribute('role', 'dialog');
      host.setAttribute('aria-modal', 'true');
      host.setAttribute('aria-label', 'LUMI Messenger');
      frame = document.createElement('iframe');
      frame.id = 'ccUnifiedChatFrame';
      frame.title = 'Rozmowy LUMINA — LUMI Messenger';
      frame.src = '/mess?embed=1';
      // Same-origin Firebase session; no mic, camera or other permission grant.
      frame.addEventListener('load', deliver);
      host.appendChild(frame);
      document.body.appendChild(host);
    }
    if (host.hidden) {
      previousOverflow = document.body.style.overflow;
      opener = document.activeElement;
    }
    host.hidden = false;
    document.body.style.overflow = 'hidden';
    frame?.focus?.();
    deliver();
  }
  function close() {
    if (!host || host.hidden) return;
    host.hidden = true;
    document.body.style.overflow = previousOverflow || '';
    opener?.focus?.();
  }
  window.CCUnifiedChat = {
    open, close, openCurrent, canonical, mountRadio,
    connect(child) { if (frame?.contentWindow === child) deliver(); }
  };
  function bindEntries() {
    if (canonical) return;
    // Preserve all existing native features by routing to their canonical page.
    window.openDirectMessagesModal = tab => open({ tab: tab || 'public' });
    window.openLuminaChatModal = () => open();
    window.openChatWith = (name, avatar, partner, messageId) => open({ tab: 'private', name, avatar, partner, messageId });
  }
  bindEntries();
  window.addEventListener('load', bindEntries, { once: true });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    if (!canonical) close();
    else if (embedded) { try { window.parent.CCUnifiedChat?.close(); } catch (_) {} }
  });
  function mountRadio(target) {
    if (!target || target.querySelector('.cc-chat-radio')) return;
    const radio = document.createElement('div');
    radio.className = 'cc-chat-radio';
    radio.setAttribute('role', 'region');
    radio.setAttribute('aria-label', 'Mini odtwarzacz Radio CC');
    radio.innerHTML = '<button type="button" disabled aria-label="Włącz lub zatrzymaj radio" title="Włącz lub zatrzymaj radio">Słuchaj</button><select aria-label="Stacja radiowa" title="Wybierz stację radiową"></select><span class="cc-chat-radio-bars" aria-hidden="true"><span></span><span></span><span></span></span><output role="status" aria-live="polite">Ładowanie radia…</output>';
    const headerRow = target.querySelector(':scope > .cc-chat-header, .cc-chat-header, :scope > .chat-header-bar > div, .chat-header-bar > div, :scope > .chat-header-bar, .chat-header-bar, header');
    if (headerRow) {
      const actions = headerRow.querySelector('.cc-chat-header-actions, .chat-header-actions');
      if (actions && actions.parentNode) {
        actions.parentNode.insertBefore(radio, actions);
      } else {
        headerRow.appendChild(radio);
      }
    } else {
      target.insertBefore(radio, target.firstChild);
    }
    radioReady.then(() => {
      const chatRadio = window.CCChatRadio;
      const select = radio.querySelector('select');
      const button = radio.querySelector('button');
      const output = radio.querySelector('output');
      if (!chatRadio || !select || !button) return;
      for (const station of chatRadio.stations) {
        const option = document.createElement('option');
        option.value = station.id; option.textContent = station.name; select.appendChild(option);
      }
      let preparing = 0;
      async function prepare() {
        const ticket = ++preparing;
        button.disabled = true;
        try {
          await chatRadio.prepare(select.value);
          if (ticket !== preparing) return;
          button.disabled = false;
          if (output) output.textContent = 'Naciśnij Słuchaj, aby włączyć wybraną stację';
        } catch (_) { if (ticket === preparing && output) output.textContent = 'Nie udało się wczytać playlisty. Wybierz stację ponownie.'; }
      }
      const unsubscribe = chatRadio.subscribe(state => {
        if (select.value !== state.stationId) select.value = state.stationId;
        button.textContent = state.playing ? 'Wstrzymaj' : 'Słuchaj';
        radio.classList.toggle('is-playing', Boolean(state.playing));
        const stName = chatRadio.stations.find(s => s.id === state.stationId)?.name || '';
        radio.title = `Radio CC · 6 stacji: ${stName}${state.playing ? ' · Odtwarza' : ''}`;
        const summary = radio.querySelector('summary');
        if (summary) summary.textContent = `Radio · 6 stacji · ${stName}${state.playing ? ' · Odtwarza' : ''}`;
        if (output) output.textContent = state.status;
      });
      window.addEventListener('pagehide', unsubscribe, { once: true });
      select.addEventListener('change', () => {
        const wasPlaying = chatRadio.state().playing;
        const stationId = select.value;
        chatRadio.pause(); chatRadio.select(stationId);
        prepare().then(() => {
          if (wasPlaying) chatRadio.play(true);
        });
      });
      button.addEventListener('click', () => {
        if (chatRadio.state().playing) chatRadio.pause();
        else { chatRadio.select(select.value); chatRadio.play(true); }
      });
      prepare();
    }).catch(() => {
      const output = radio.querySelector('output');
      if (output) output.textContent = 'Radio niedostępne. Odśwież stronę.';
    });
  }
  function setup() {
    mountRadio(document.querySelector('#ccGlobalChatOverlay .cc-chat-drawer'));
    mountRadio(document.querySelector('#directMessagesModal .lumina-messenger-modal-card, #directMessagesModal .modal-card, #directMessagesModal'));
    if (host) mountRadio(host);
    if (embedded) {
      document.body.classList.add('cc-mess-embedded');
      document.getElementById('lumiIntroVideo')?.pause();
      openCurrent();
      window.addEventListener('lumina-auth-state', () => openCurrent(request));
      document.addEventListener('click', event => {
        if (event.target.closest?.('#ccChatCloseBtn, #directMessagesModal .modal-close-btn')) {
          try { window.parent.CCUnifiedChat?.close(); } catch (_) {}
        }
      });
      try { window.parent.CCUnifiedChat?.connect(window); } catch (_) {}
    }
  }
  document.addEventListener('click', event => {
    if (event.target.closest?.('#ccChatFabBtn, #luminaFloatingChatBtn, [data-start-chat], .cc-chat-member-card, .drawer-nav-item, #btnChatSettingsModal, .chat-settings-btn')) {
      setTimeout(setup, 30);
    }
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup, { once: true });
  else setup();
  window.dispatchEvent(new window.CustomEvent('cc-chat-integration-ready'));
})();
