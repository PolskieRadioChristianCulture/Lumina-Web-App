/**
 * LUMI Direct Dock — Component (MVP 1.0)
 * Globalny dok czatów prywatnych 1:1 dla autoryzowanych członków LUMINA.
 * Zgodny w 100% z LumiDirectDock.tsx i lumi-direct-dock.css.
 * Christian Culture • Standard Zero-QA • 2026-10-18
 */
(function (global) {
  'use strict';

  const MAX_TEXT_LENGTH = 4000;
  const DEFAULT_PREFS = { autoOpen: false };

  function safePrefs() {
    try {
      return Object.assign({}, DEFAULT_PREFS, JSON.parse(localStorage.getItem('lumi-direct-dock-prefs-v1') || '{}'));
    } catch (_) {
      return DEFAULT_PREFS;
    }
  }

  function savePrefs(prefs) {
    try {
      localStorage.setItem('lumi-direct-dock-prefs-v1', JSON.stringify(prefs));
    } catch (_) {}
  }

  function dateLabel(isoString) {
    if (!isoString) return '';
    const d = new Date(isoString);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  let dockAudioCtx = null;
  function playDockChime() {
    try {
      // Jeden dźwięk na wiadomość: jeśli portal LUMINA zagrał przed chwilą, okienka LUMI milczą (i odwrotnie).
      const nowMs = Date.now();
      if (typeof window !== 'undefined') {
        if (window._lastLuminaChimeTime && nowMs - window._lastLuminaChimeTime < 4000) return;
        window._lastLuminaChimeTime = nowMs;
      }
      const AudioCtx = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
      if (!AudioCtx) return;
      if (!dockAudioCtx) dockAudioCtx = new AudioCtx();
      if (dockAudioCtx.state === 'suspended') {
        dockAudioCtx.resume().catch(() => {});
      }
      const now = dockAudioCtx.currentTime;
      const osc1 = dockAudioCtx.createOscillator();
      const gain1 = dockAudioCtx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(698.46, now);
      gain1.gain.setValueAtTime(0.001, now);
      gain1.gain.exponentialRampToValueAtTime(0.18, now + 0.04);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc1.connect(gain1);
      gain1.connect(dockAudioCtx.destination);
      osc1.start(now);
      osc1.stop(now + 0.36);

      const osc2 = dockAudioCtx.createOscillator();
      const gain2 = dockAudioCtx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880.00, now + 0.12);
      gain2.gain.setValueAtTime(0.001, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.22, now + 0.16);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
      osc2.connect(gain2);
      gain2.connect(dockAudioCtx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.72);
    } catch (_) {}
  }

  if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
    window.addEventListener('click', () => {
      try {
        if (dockAudioCtx && dockAudioCtx.state === 'suspended') dockAudioCtx.resume().catch(() => {});
      } catch (_) {}
    }, { passive: true });
  }

  class LumiDirectDockController {
    constructor(options = {}) {
      this.adapter = options.adapter || (typeof global.createDirectMessagingAdapter === 'function' ? global.createDirectMessagingAdapter() : null);
      this.rightOffsetPx = options.rightOffsetPx || 88;
      this.bottomOffsetPx = options.bottomOffsetPx || 16;

      this.userId = null;
      this.conversations = [];
      this.activeId = null;
      this.messages = {};
      this.drafts = {};
      this.busy = false;
      this.error = '';
      this.prefs = safePrefs();
      this.settingsOpen = false;
      this.hidden = [];
      this.revealed = new Set();

      this.readAttemptSet = new Set();
      this.unsubIncoming = null;
      this.unsubConversation = null;
      this.containerEl = null;

      this._boundRender = this.render.bind(this);
      this._boundVisibilityChange = this._onVisibilityChange.bind(this);
    }

    init() {
      if (!this.adapter) return;
      document.addEventListener('visibilitychange', this._boundVisibilityChange);

      // Obserwator zmian stanu logowania
      this._boundAuthChange = () => this.syncUser();
      global.addEventListener('lumina-auth-state', this._boundAuthChange);
      global.addEventListener('lumina-user-changed', this._boundAuthChange);

      this.syncUser();
    }

    destroy() {
      if (this._disposeDrag) this._disposeDrag();
      if (typeof this.unsubIncoming === 'function') {
        try { this.unsubIncoming(); } catch (_) {}
      }
      if (typeof this.unsubConversation === 'function') {
        try { this.unsubConversation(); } catch (_) {}
      }
      document.removeEventListener('visibilitychange', this._boundVisibilityChange);
      global.removeEventListener('lumina-auth-state', this._boundAuthChange);
      global.removeEventListener('lumina-user-changed', this._boundAuthChange);
      if (this.containerEl && this.containerEl.parentNode) {
        this.containerEl.parentNode.removeChild(this.containerEl);
      }
      this.containerEl = null;
    }

    syncUser() {
      const currentId = this.adapter ? this.adapter.getCurrentUserId() : null;
      if (currentId === this.userId) return;

      this.userId = currentId;
      this.conversations = [];
      this.activeId = null;
      this.messages = {};
      this.drafts = {};
      this.hidden = [];
      this.revealed.clear();
      this.error = '';
      this.readAttemptSet.clear();

      if (typeof this.unsubIncoming === 'function') {
        try { this.unsubIncoming(); } catch (_) {}
        this.unsubIncoming = null;
      }
      if (typeof this.unsubConversation === 'function') {
        try { this.unsubConversation(); } catch (_) {}
        this.unsubConversation = null;
      }

      if (!this.userId) {
        if (this.containerEl) {
          this.containerEl.style.display = 'none';
        }
        return;
      }

      // Załaduj rozmowy
      const sessionId = this.userId;
      let receivedRooms = false;
      this.adapter.listDirectConversations().then((items) => {
        if (this.userId !== sessionId || receivedRooms) return;
        this.conversations = (items || []).filter(c => c.type === 'direct' && c.participant && c.participant.id !== this.userId);
        this.render();
      }).catch(() => {
        this.error = 'Nie udało się pobrać rozmów prywatnych.';
        this.render();
      });

      // Subskrybuj przychodzące wiadomości prywatne
      this.unsubIncoming = this.adapter.subscribeIncomingDM((event) => {
        if (this.userId !== sessionId) return;
        if (Array.isArray(event?.conversations)) {
          const previous = new Map(this.conversations.map(c => [c.id, c]));
          const wasInitialized = receivedRooms;
          receivedRooms = true;
          this.conversations = event.conversations.filter(c => c.type === 'direct' && c.participant && c.participant.id !== this.userId);
          // The initial snapshot is history, never a new private notification.
          const changed = this.conversations.filter(c => wasInitialized && c.lastMessageAt
            && c.lastMessageSenderId && c.lastMessageSenderId !== this.userId
            && (!previous.has(c.id) || previous.get(c.id).lastMessageAt !== c.lastMessageAt));
          changed.forEach(c => this.revealed.add(c.id));
          this.hidden = this.hidden.filter(id => !changed.some(c => c.id === id));
          if (changed.length > 0) {
            playDockChime();
          }
          if (this.prefs.autoOpen && document.visibilityState !== 'hidden') {
            const incoming = changed[0];
            if (incoming) this.openConversation(incoming.id);
          }
          this.render();
          return;
        }
        if (!event || !event.message || event.message.senderId === this.userId) return;
        this.revealed.add(event.conversationId);
        playDockChime();

        // Nowa wiadomość przywraca ukryty chat head
        this.hidden = this.hidden.filter(v => v !== event.conversationId);

        // Zaktualizuj licznik i czas
        this.conversations = this.conversations.map(c => {
          if (c.id === event.conversationId) {
            const isCurrentActive = this.activeId === c.id;
            return Object.assign({}, c, {
              unreadCount: c.unreadCount + (isCurrentActive ? 0 : 1),
              lastMessageAt: event.message.createdAt
            });
          }
          return c;
        });

        // Dodaj wiadomość do pamięci
        const currentList = this.messages[event.conversationId] || [];
        if (!currentList.some(m => m.id === event.message.id)) {
          this.messages[event.conversationId] = currentList.concat([event.message]).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
        }

        // Respect the saved automatic-opening preference.
        if (this.prefs.autoOpen) {
          this.adapter.listDirectConversations().then((items) => {
            this.conversations = (items || []).filter(c => c.type === 'direct' && c.participant && c.participant.id !== this.userId);
            if (this.conversations.some(c => c.id === event.conversationId)) {
              this.activeId = event.conversationId;
              this.loadActiveConversation(event.conversationId);
            }
            this.render();
          }).catch(() => {});
        } else {
          this.render();
        }
      });

      this.render();
    }

    openConversation(id) {
      this.hidden = this.hidden.filter(v => v !== id);
      this.activeId = id;
      this.error = '';
      this.loadActiveConversation(id);
      this.render();
    }

    loadActiveConversation(id) {
      if (!id || !this.adapter) return;

      if (typeof this.unsubConversation === 'function') {
        try { this.unsubConversation(); } catch (_) {}
        this.unsubConversation = null;
      }

      if (typeof this.adapter.subscribeConversation === 'function') {
        this.unsubConversation = this.adapter.subscribeConversation(id, (msg) => {
          if (msg.conversationId !== id) return;
          const currentList = this.messages[id] || [];
          if (this.activeId === id) {
            this.messages[id] = currentList.filter(m => m.id !== msg.id).concat([msg]).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
            this.render();
            this.checkMarkRead();
          }
        });
      }

      this.adapter.listMessages(id, 50).then((result) => {
        if (this.activeId !== id) return;
        this.messages[id] = result || [];
        this.render();
        this.checkMarkRead();
      }).catch(() => {
        this.error = 'Nie udało się pobrać wiadomości.';
        this.render();
      });
    }

    _onVisibilityChange() {
      if (document.visibilityState === 'visible' && this.activeId) {
        this.checkMarkRead();
      }
    }

    checkMarkRead() {
      if (!this.activeId || !this.userId || document.visibilityState !== 'visible') return;
      const convo = this.conversations.find(c => c.id === this.activeId);
      const msgList = this.messages[this.activeId] || [];
      const lastMsg = msgList.length ? msgList[msgList.length - 1] : null;

      if (!convo || !lastMsg || lastMsg.senderId === this.userId) return;

      const readKey = `${this.activeId}:${lastMsg.id}`;
      if (this.readAttemptSet.has(readKey)) return;
      this.readAttemptSet.add(readKey);

      const conversationId = this.activeId;
      const sessionId = this.userId;
      const visibleMessageIds = msgList.filter(m => m.senderId !== sessionId).map(m => m.id);
      this.adapter.markRead(conversationId, lastMsg.id, visibleMessageIds).then((confirmed) => {
        if (confirmed !== true) { this.readAttemptSet.delete(readKey); return; }
        if (this.userId !== sessionId) return;
        this.conversations = this.conversations.map(c => c.id === conversationId ? Object.assign({}, c, { unreadCount: 0 }) : c);
        this.render();
      }).catch(() => {
        this.readAttemptSet.delete(readKey);
      });
    }

    async sendMessage() {
      if (!this.activeId || this.busy) return;
      const id = this.activeId;
      const text = (this.drafts[id] || '').trim();
      if (!text || text.length > MAX_TEXT_LENGTH) return;

      this.busy = true;
      this.error = '';
      this.render();

      try {
        const requestId = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
        await this.adapter.sendText(id, text, requestId);
        this.drafts[id] = '';
        await this.loadActiveConversation(id);
      } catch (err) {
        this.error = err.message || 'Wysyłanie nie powiodło się. Wiadomość pozostała w polu wpisywania.';
      } finally {
        this.busy = false;
        this.render();
      }
    }

    render() {
      if (this._dragging) { this._renderAfterDrag = true; return; }
      try {
        const lingeringBanner = document.getElementById('lumina-chat-notification-banner');
        if (lingeringBanner) lingeringBanner.remove();
      } catch (_) {}

      if (!this.userId) {
        if (this.containerEl) this.containerEl.style.display = 'none';
        return;
      }

      if (!this.containerEl) {
        this.containerEl = document.createElement('section');
        this.containerEl.className = 'ldd-root';
        this.containerEl.setAttribute('aria-label', 'LUMI prywatne wiadomości');
        this.containerEl.style.setProperty('--ldd-right', `${this.rightOffsetPx}px`);
        this.containerEl.style.setProperty('--ldd-bottom', `${this.bottomOffsetPx}px`);
        document.body.appendChild(this.containerEl);
        this.enableDrag();
      }

      this.containerEl.style.display = '';

      const activeConvo = this.conversations.find(c => c.id === this.activeId);
      const orderedConvos = this.conversations.slice().sort((a, b) => (b.lastMessageAt || '').localeCompare(a.lastMessageAt || ''));
      const eligibleHeads = orderedConvos.filter(c => this.revealed.has(c.id) && !this.hidden.includes(c.id));
      const visibleHeads = eligibleHeads.slice(0, 6);
      const extraCount = Math.max(0, eligibleHeads.length - 6);
      if (!visibleHeads.length && !activeConvo) {
        this.settingsOpen = false;
        this.containerEl.innerHTML = '';
        this.containerEl.style.display = 'none';
        return;
      }
      const currentDraft = this.activeId ? (this.drafts[this.activeId] || '') : '';
      const currentMessages = this.activeId ? (this.messages[this.activeId] || []) : [];

      let html = '';

      // Okno aktywnej rozmowy
      if (activeConvo) {
        const p = activeConvo.participant;
        html += `
          <div class="ldd-window" data-chat-id="${escapeHtml(activeConvo.id)}" role="dialog" aria-label="Prywatna rozmowa z ${escapeHtml(p.name)}">
            <header class="ldd-header">
              ${p.avatarUrl ? `<img class="ldd-avatar" src="${escapeHtml(p.avatarUrl)}" alt="" />` : `<span class="ldd-avatar ldd-initial">${escapeHtml(p.name.charAt(0))}</span>`}
              <div class="ldd-name">
                <strong>${escapeHtml(p.name)}</strong>
                <small>${p.isOnline ? '● Aktywny teraz' : 'Wiadomość prywatna'}</small>
              </div>
              <button type="button" class="ldd-btn-min" aria-label="Minimalizuj rozmowę">−</button>
              <button type="button" class="ldd-prefs" aria-label="Ustawienia prywatnych powiadomień" title="Ustawienia">⚙</button>
              <button type="button" class="ldd-btn-close" aria-label="Zamknij rozmowę">×</button>
            </header>
            <div class="ldd-history" aria-label="Historia rozmowy" role="log" aria-live="polite">
              ${currentMessages.map(m => {
                const isMine = m.senderId === this.userId;
                const deliveryStr = isMine && m.deliveryStatus
                  ? ` · ${m.deliveryStatus === 'read' ? 'Wyświetlono' : (m.deliveryStatus === 'delivered' ? 'Dostarczono' : 'Wysłano')}`
                  : '';
                return `
                  <div class="ldd-line ${isMine ? 'ldd-mine' : 'ldd-theirs'}" data-message-id="${escapeHtml(m.id)}">
                    <div class="ldd-bubble">${escapeHtml(m.text)}</div>
                    <span class="ldd-time">${dateLabel(m.createdAt)}${deliveryStr}</span>
                  </div>
                `;
              }).join('')}
              <div class="ldd-bottom-anchor"></div>
            </div>
            ${this.error ? `<p class="ldd-error" role="alert">${escapeHtml(this.error)}</p>` : ''}
            <form class="ldd-compose">
              <label class="ldd-sr" for="ldd-compose-field">Napisz prywatną wiadomość</label>
              <textarea id="ldd-compose-field" rows="1" maxlength="${MAX_TEXT_LENGTH}" placeholder="Wiadomość…">${escapeHtml(currentDraft)}</textarea>
              <button type="submit" ${this.busy || !currentDraft.trim() ? 'disabled' : ''} aria-label="Wyślij wiadomość">➤</button>
            </form>
          </div>
        `;
      }

      // Pasek doku (chat heads)
      html += `
        <div class="ldd-dock" aria-label="Skróty rozmów prywatnych">
          ${visibleHeads.map(c => {
            const isSelected = this.activeId === c.id;
            const p = c.participant;
            const countBadge = c.unreadCount > 0 ? `<b class="ldd-count">${c.unreadCount > 99 ? '99+' : c.unreadCount}</b>` : '';
            return `
              <button type="button" class="ldd-head ${isSelected ? 'ldd-selected' : ''}" data-chat-id="${escapeHtml(c.id)}" title="Rozmowa z ${escapeHtml(p.name)}" aria-label="Otwórz rozmowę z ${escapeHtml(p.name)}, nieprzeczytane: ${c.unreadCount}">
                ${p.avatarUrl ? `<img src="${escapeHtml(p.avatarUrl)}" alt="" />` : `<span>${escapeHtml(p.name.charAt(0))}</span>`}
                ${countBadge}
              </button>
            `;
          }).join('')}
          ${extraCount > 0 ? `<span class="ldd-more" title="Pozostałe rozmowy dostępne w LUMI Messenger">+${extraCount}</span>` : ''}
        </div>
      `;

      // Panel ustawień
      if (this.settingsOpen) {
        html += `
          <div class="ldd-settings">
            <label>
              <input type="checkbox" id="lddPrefAutoOpen" ${this.prefs.autoOpen ? 'checked' : ''} />
              Automatycznie otwieraj nowe wiadomości prywatne
            </label>
            <p>Możesz wyłączyć automatyczne otwieranie. Skrót z awatarem pozostanie dostępny.</p>
            <button type="button" id="lddBtnRestoreHidden">Przywróć zamknięte skróty</button>
            <p>Bąbelki z awatarami możesz przeciągnąć palcem lub myszą w dowolne miejsce ekranu.</p>
            <button type="button" id="lddBtnResetPosition">Przywróć bąbelki na domyślne miejsce</button>
          </div>
        `;
      }

      this.containerEl.innerHTML = html;
      // A missing image must never leave an invisible conversation shortcut.
      this.containerEl.querySelectorAll('.ldd-head img, .ldd-avatar').forEach(img => {
        if (img.tagName !== 'IMG') return;
        img.onerror = () => {
          const initial = document.createElement('span');
          initial.className = img.classList.contains('ldd-avatar') ? 'ldd-avatar ldd-initial' : 'ldd-initial';
          initial.textContent = (img.closest('.ldd-head')?.title?.replace('Rozmowa z ', '')
            || activeConvo?.participant.name || '?').charAt(0);
          img.replaceWith(initial);
        };
      });
      this.attachEvents();
      this.applyPosition();

      // Automatyczne przewinięcie do dołu w oknie rozmowy
      if (activeConvo) {
        const anchor = this.containerEl.querySelector('.ldd-bottom-anchor');
        if (anchor && typeof anchor.scrollIntoView === 'function') {
          anchor.scrollIntoView({ block: 'end' });
        }
      }
    }

    // ── Przesuwanie bąbelków (Strażnik 2026-10-18) ─────────────────────────────
    // Bąbelki z awatarami można przeciągnąć palcem lub myszą w dowolne miejsce ekranu.
    // Położenie zapamiętuje ta przeglądarka; okno rozmowy otwiera się w stronę środka ekranu.
    loadPosition() {
      try {
        const p = JSON.parse(localStorage.getItem('lumi_dock_position_v1') || 'null');
        if (p && (p.side === 'l' || p.side === 'r') && (p.vside === 't' || p.vside === 'b') && Number.isFinite(p.h) && Number.isFinite(p.v)) return p;
      } catch (_) {}
      return null;
    }

    savePosition(p) {
      try {
        if (p) localStorage.setItem('lumi_dock_position_v1', JSON.stringify(p));
        else localStorage.removeItem('lumi_dock_position_v1');
      } catch (_) {}
    }

    applyPosition() {
      const el = this.containerEl;
      if (!el || this._dragging || !el.style || !el.classList || typeof el.classList.toggle !== 'function') return;
      const p = this.loadPosition();
      el.style.transform = '';
      el.classList.toggle('ldd-left', !!p && p.side === 'l');
      el.classList.toggle('ldd-top', !!p && p.vside === 't');
      el.classList.toggle('ldd-moved', !!p);
      if (!p) {
        el.style.left = el.style.top = el.style.right = el.style.bottom = '';
        return;
      }
      el.style.left = p.side === 'l' ? `${Math.max(0, p.h)}px` : 'auto';
      el.style.right = p.side === 'r' ? `${Math.max(0, p.h)}px` : 'auto';
      el.style.top = p.vside === 't' ? `${Math.max(0, p.v)}px` : 'auto';
      el.style.bottom = p.vside === 'b' ? `${Math.max(0, p.v)}px` : 'auto';
      // Zawsze w całości na ekranie (obrót telefonu, zmiana rozmiaru okna, otwarte okno rozmowy).
      try {
        const r = el.getBoundingClientRect();
        const vw = window.innerWidth || document.documentElement.clientWidth;
        const vh = window.innerHeight || document.documentElement.clientHeight;
        const m = 8;
        let dx = 0, dy = 0;
        if (r.width && r.right > vw - m) dx = (vw - m) - r.right;
        if (r.width && r.left + dx < m) dx = m - r.left;
        if (r.height && r.bottom > vh - m) dy = (vh - m) - r.bottom;
        if (r.height && r.top + dy < m) dy = m - r.top;
        if (dx || dy) el.style.transform = `translate(${Math.round(dx)}px, ${Math.round(dy)}px)`;
      } catch (_) {}
    }

    enableDrag() {
      const el = this.containerEl;
      if (!el || el._lddDrag || typeof el.addEventListener !== 'function') return;
      el._lddDrag = true;
      let start = null;
      const release = (gesture) => {
        try { gesture.target.releasePointerCapture(gesture.id); } catch (_) {}
      };
      const down = (e) => {
        if (start || e.isPrimary === false || (e.button !== undefined && e.button !== 0)) return;
        const head = e.target?.closest?.('.ldd-head');
        if (!head) return;
        const r = el.getBoundingClientRect();
        start = { x:e.clientX, y:e.clientY, left:r.left, top:r.top,
          id:e.pointerId, target:head, moved:false };
        // Capture before the first move, so a fast gesture cannot lose the bubble.
        try { head.setPointerCapture(e.pointerId); } catch (_) {}
      };
      const move = (e) => {
        if (!start || e.pointerId !== start.id) return;
        const dx=e.clientX-start.x, dy=e.clientY-start.y;
        if (!start.moved) {
          if (Math.hypot(dx,dy) < 8) return;
          start.moved=true;
          this._dragging=true;
          el.classList.add('ldd-dragging');
          el.style.transform='';
          el.style.right=el.style.bottom='auto';
        }
        e.preventDefault();
        const r=el.getBoundingClientRect();
        const maxX=Math.max(8,global.innerWidth-r.width-8);
        const maxY=Math.max(8,global.innerHeight-r.height-8);
        el.style.left=Math.round(Math.min(maxX,Math.max(8,start.left+dx)))+'px';
        el.style.top=Math.round(Math.min(maxY,Math.max(8,start.top+dy)))+'px';
      };
      const finish = (e) => {
        if (!start || (e && e.pointerId !== start.id)) return;
        const gesture=start; start=null;
        release(gesture);
        if (!gesture.moved) return;
        this._dragging=false;
        el.classList.remove('ldd-dragging');
        this._suppressClickUntil=Date.now()+400;
        if (e?.type !== 'pointercancel') {
          const r=el.getBoundingClientRect();
          const d=el.querySelector('.ldd-dock')?.getBoundingClientRect() || r;
          const vw=global.innerWidth, vh=global.innerHeight;
          const side=d.left+d.width/2 < vw/2 ? 'l' : 'r';
          const vside=d.top+d.height/2 < vh/2 ? 't' : 'b';
          this.savePosition({side,vside,h:Math.max(8,Math.round(side==='l'?r.left:vw-r.right)),
            v:Math.max(8,Math.round(vside==='t'?d.top:vh-d.bottom))});
        }
        this.applyPosition();
        if (this._renderAfterDrag) { this._renderAfterDrag=false; this.render(); }
      };
      const click = (e) => {
        if (this._suppressClickUntil && Date.now()<this._suppressClickUntil) {
          e.preventDefault(); e.stopPropagation(); this._suppressClickUntil=0;
        }
      };
      const imageDrag = (e) => { if (e.target?.closest?.('.ldd-head')) e.preventDefault(); };
      const resize = () => { if (start) finish({pointerId:start.id,type:'pointercancel'}); this.applyPosition(); };
      el.addEventListener('pointerdown',down);
      el.addEventListener('click',click,true);
      el.addEventListener('dragstart',imageDrag);
      global.addEventListener('pointermove',move,{passive:false});
      global.addEventListener('pointerup',finish);
      global.addEventListener('pointercancel',finish);
      global.addEventListener('resize',resize,{passive:true});
      this._disposeDrag = () => {
        if (start) release(start);
        start=null; this._dragging=false;
        el.removeEventListener('pointerdown',down);
        el.removeEventListener('click',click,true);
        el.removeEventListener('dragstart',imageDrag);
        global.removeEventListener('pointermove',move);
        global.removeEventListener('pointerup',finish);
        global.removeEventListener('pointercancel',finish);
        global.removeEventListener('resize',resize);
        el._lddDrag=false;
      };
    }

    attachEvents() {
      if (!this.containerEl) return;

      const resetPosBtn = this.containerEl.querySelector('#lddBtnResetPosition');
      if (resetPosBtn) {
        resetPosBtn.onclick = () => {
          this.savePosition(null);
          this.render();
        };
      }

      // Obsługa przycisków nagłówka
      const minBtn = this.containerEl.querySelector('.ldd-btn-min');
      if (minBtn) {
        minBtn.onclick = () => {
          this.activeId = null;
          this.render();
        };
      }

      const closeBtn = this.containerEl.querySelector('.ldd-btn-close');
      if (closeBtn) {
        closeBtn.onclick = () => {
          if (this.activeId) {
            this.hidden = Array.from(new Set(this.hidden.concat([this.activeId])));
            this.activeId = null;
            this.render();
          }
        };
      }

      // Obsługa formularza wysyłania
      const composeForm = this.containerEl.querySelector('.ldd-compose');
      const textarea = this.containerEl.querySelector('#ldd-compose-field');

      if (textarea) {
        textarea.oninput = (e) => {
          if (this.activeId) {
            this.drafts[this.activeId] = e.target.value;
            const submitBtn = composeForm?.querySelector('button[type="submit"]');
            if (submitBtn) {
              submitBtn.disabled = this.busy || !e.target.value.trim();
            }
          }
        };

        textarea.onkeydown = (e) => {
          if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
            e.preventDefault();
            this.sendMessage();
          }
        };
      }

      if (composeForm) {
        composeForm.onsubmit = (e) => {
          e.preventDefault();
          this.sendMessage();
        };
      }

      // Obsługa kliknięć w chat heads (kliknięcie otwiera lub zamyka okno)
      this.containerEl.querySelectorAll('.ldd-head').forEach(btn => {
        btn.onclick = () => {
          const chatId = btn.getAttribute('data-chat-id');
          if (!chatId) return;
          if (this.activeId === chatId) {
            // Kliknięcie w aktywny awatar minimalizuje/zamyka okno czatu
            this.activeId = null;
            this.render();
          } else {
            this.openConversation(chatId);
          }
        };
      });

      // Przycisk ustawień
      const prefsBtn = this.containerEl.querySelector('.ldd-prefs');
      if (prefsBtn) {
        prefsBtn.onclick = () => {
          this.settingsOpen = !this.settingsOpen;
          this.render();
        };
      }

      // Checkbox autoOpen
      const autoOpenCheck = this.containerEl.querySelector('#lddPrefAutoOpen');
      if (autoOpenCheck) {
        autoOpenCheck.onchange = (e) => {
          this.prefs.autoOpen = e.target.checked;
          savePrefs(this.prefs);
        };
      }

      // Przywróć ukryte
      const restoreBtn = this.containerEl.querySelector('#lddBtnRestoreHidden');
      if (restoreBtn) {
        restoreBtn.onclick = () => {
          this.hidden = [];
          this.render();
        };
      }
    }
  }

  // Funkcja fabryczna montująca dock w powłoce aplikacji
  function mountLumiDirectDock(options = {}) {
    try {
      const lingeringBanner = document.getElementById('lumina-chat-notification-banner');
      if (lingeringBanner) lingeringBanner.remove();
    } catch (_) {}
    if (global._lumiDirectDockInstance) return global._lumiDirectDockInstance;
    // Do not cache an inert instance when an external loader runs out of order.
    if (!options.adapter && typeof global.createDirectMessagingAdapter !== 'function') return null;
    const instance = new LumiDirectDockController(options);
    global._lumiDirectDockInstance = instance;
    instance.init();
    return instance;
  }

  // Automontaż po załadowaniu DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => mountLumiDirectDock());
  } else {
    mountLumiDirectDock();
  }

  global.mountLumiDirectDock = mountLumiDirectDock;
  global.LumiDirectDockController = LumiDirectDockController;
})(typeof window !== 'undefined' ? window : this);
