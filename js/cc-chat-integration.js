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
    #ccUnifiedChatHost header{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:6px 12px;border-bottom:1px solid #334155}
    #ccUnifiedChatHost button,#ccUnifiedChatHost a{min-height:44px;min-width:44px;color:inherit;background:transparent;border:0;font:inherit;cursor:pointer}
    #ccUnifiedChatFrame{width:100%;flex:1;min-height:0;border:0;background:#090e1a}
    .cc-chat-radio{padding:6px 12px;border-bottom:1px solid #334155;background:#111827;color:#f8fafc;font:13px system-ui;flex-shrink:0}
    .cc-chat-radio summary{min-height:44px;display:flex;align-items:center;cursor:pointer;gap:8px}
    .cc-chat-radio summary::after{content:'▾';margin-left:auto;font-size:16px}
    .cc-chat-radio[open] summary::after{content:'▴'}
    .cc-chat-radio-controls{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding-bottom:6px}
    .cc-chat-radio select{flex:1;min-width:150px;max-width:100%;background:#111827;color:#f8fafc;border:1px solid #64748b;border-radius:8px;min-height:44px;font:inherit}
    .cc-chat-radio button{background:#facc15;color:#111827;border:0;border-radius:8px;min-height:44px;padding:0 12px;font:inherit;font-weight:700;cursor:pointer}
    .cc-chat-radio button:disabled{opacity:.5;cursor:wait}
    .cc-chat-radio output{flex-basis:100%;color:#cbd5e1;min-height:18px}
    body.cc-mess-embedded #lumiLanding,body.cc-mess-embedded #lumiIntroOverlay{display:none!important}
    body.cc-mess-embedded .modal-overlay.open{inset:0!important;height:100dvh!important;max-height:100dvh!important}
  `;
  document.head.appendChild(style);
  let host, frame, previousOverflow, opener, request = { tab: 'public' };
  function openCurrent(next = request) {
    request = next;
    const user = window.LuminaDB?.getCurrentUser?.();
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
      host.innerHTML = '<header><strong>LUMI Messenger</strong><div><a href="/mess" target="_blank" rel="noopener">Otwórz osobno</a><button type="button" aria-label="Zamknij komunikator">✕</button></div></header>';
      frame = document.createElement('iframe');
      frame.id = 'ccUnifiedChatFrame';
      frame.title = 'Rozmowy LUMINA — LUMI Messenger';
      frame.src = '/mess?embed=1';
      // Same-origin Firebase session; no mic, camera or other permission grant.
      frame.addEventListener('load', deliver);
      host.querySelector('button').addEventListener('click', close);
      host.appendChild(frame);
      document.body.appendChild(host);
    }
    if (host.hidden) {
      previousOverflow = document.body.style.overflow;
      opener = document.activeElement;
    }
    host.hidden = false;
    document.body.style.overflow = 'hidden';
    host.querySelector('button').focus();
    deliver();
  }
  function close() {
    if (!host || host.hidden) return;
    host.hidden = true;
    document.body.style.overflow = previousOverflow || '';
    opener?.focus?.();
  }
  window.CCUnifiedChat = {
    open, close, openCurrent, canonical,
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
    if (!target || target.querySelector(':scope > .cc-chat-radio')) return;
    const details = document.createElement('details');
    details.className = 'cc-chat-radio';
    details.innerHTML = '<summary>Radio Christian Culture · 6 stacji</summary><div class="cc-chat-radio-controls"><select aria-label="Stacja radiowa"></select><button type="button" disabled>Słuchaj</button><output role="status" aria-live="polite">Ładowanie radia…</output></div>';
    const header = target.querySelector(':scope > .cc-chat-header, :scope > .chat-header-bar');
    target.insertBefore(details, header ? header.nextSibling : target.firstChild);
    radioReady.then(() => {
      const radio = window.CCChatRadio;
      const select = details.querySelector('select');
      const button = details.querySelector('button');
      const output = details.querySelector('output');
      for (const station of radio.stations) {
        const option = document.createElement('option');
        option.value = station.id; option.textContent = station.name; select.appendChild(option);
      }
      let preparing = 0;
      async function prepare() {
        const ticket = ++preparing;
        button.disabled = true;
        try {
          await radio.prepare(select.value);
          if (ticket !== preparing) return;
          button.disabled = false;
          output.textContent = 'Naciśnij Słuchaj, aby włączyć wybraną stację';
        } catch (_) { if (ticket === preparing) output.textContent = 'Nie udało się wczytać playlisty. Wybierz stację ponownie.'; }
      }
      const unsubscribe = radio.subscribe(state => {
        if (select.value !== state.stationId) select.value = state.stationId;
        button.textContent = state.playing ? 'Wstrzymaj' : 'Słuchaj';
        details.querySelector('summary').textContent = `Radio · 6 stacji · ${radio.stations.find(s => s.id === state.stationId)?.name || ''}${state.playing ? ' · Odtwarza' : ''}`;
        output.textContent = state.status;
      });
      window.addEventListener('pagehide', unsubscribe, { once: true });
      select.addEventListener('change', () => {
        const stationId = select.value;
        radio.pause(); radio.select(stationId); prepare();
      });
      button.addEventListener('click', () => {
        if (radio.state().playing) radio.pause();
        else { radio.select(select.value); radio.play(true); }
      });
      prepare();
    }).catch(() => { details.querySelector('output').textContent = 'Radio niedostępne. Odśwież stronę.'; });
  }
  function setup() {
    mountRadio(document.querySelector('#ccGlobalChatOverlay .cc-chat-drawer'));
    mountRadio(document.querySelector('#directMessagesModal .lumina-messenger-modal-card, #directMessagesModal .modal-card'));
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
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup, { once: true });
  else setup();
})();
