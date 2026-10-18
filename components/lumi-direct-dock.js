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
      global.addEventListener('lumina-auth-state', () => this.syncUser());
      global.addEventListener('lumina-user-changed', () => this.syncUser());

      this.syncUser();
    }

    destroy() {
      if (typeof this.unsubIncoming === 'function') {
        try { this.unsubIncoming(); } catch (_) {}
      }
      if (typeof this.unsubConversation === 'function') {
        try { this.unsubConversation(); } catch (_) {}
      }
      document.removeEventListener('visibilitychange', this._boundVisibilityChange);
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
      this.error = '';

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
      this.adapter.listDirectConversations().then((items) => {
        this.conversations = (items || []).filter(c => c.type === 'direct' && c.participant && c.participant.id !== this.userId);
        this.render();
      }).catch(() => {
        this.error = 'Nie udało się pobrać rozmów prywatnych.';
        this.render();
      });

      // Subskrybuj przychodzące wiadomości prywatne
      this.unsubIncoming = this.adapter.subscribeIncomingDM((event) => {
        if (!event || !event.message || event.message.senderId === this.userId) return;

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

        // Polityka Auto-open: domyślnie wyłączona
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
          if (!currentList.some(m => m.id === msg.id)) {
            this.messages[id] = currentList.concat([msg]).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
            this.render();
          }
        });
      }

      this.adapter.listMessages(id, 50).then((result) => {
        this.messages[id] = result || [];
        this.checkMarkRead();
        this.render();
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

      this.adapter.markRead(this.activeId, lastMsg.id).then(() => {
        this.conversations = this.conversations.map(c => c.id === this.activeId ? Object.assign({}, c, { unreadCount: 0 }) : c);
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
      }

      this.containerEl.style.display = '';

      const activeConvo = this.conversations.find(c => c.id === this.activeId);
      const orderedConvos = this.conversations.slice().sort((a, b) => (b.lastMessageAt || '').localeCompare(a.lastMessageAt || ''));
      const visibleHeads = orderedConvos.filter(c => !this.hidden.includes(c.id)).slice(0, 6);
      const extraCount = orderedConvos.length > 6 ? (orderedConvos.length - 6) : 0;
      const currentDraft = this.activeId ? (this.drafts[this.activeId] || '') : '';
      const currentMessages = this.activeId ? (this.messages[this.activeId] || []) : [];

      let html = '';

      // Okno aktywnej rozmowy
      if (activeConvo) {
        const p = activeConvo.participant;
        html += `
          <div class="ldd-window" role="dialog" aria-label="Prywatna rozmowa z ${escapeHtml(p.name)}">
            <header class="ldd-header">
              ${p.avatarUrl ? `<img class="ldd-avatar" src="${escapeHtml(p.avatarUrl)}" alt="" />` : `<span class="ldd-avatar ldd-initial">${escapeHtml(p.name.charAt(0))}</span>`}
              <div class="ldd-name">
                <strong>${escapeHtml(p.name)}</strong>
                <small>${p.isOnline ? '● Aktywny teraz' : 'Wiadomość prywatna'}</small>
              </div>
              <button type="button" class="ldd-btn-min" aria-label="Minimalizuj rozmowę">−</button>
              <button type="button" class="ldd-btn-close" aria-label="Zamknij rozmowę">×</button>
            </header>
            <div class="ldd-history" aria-label="Historia rozmowy" role="log" aria-live="polite">
              ${currentMessages.map(m => {
                const isMine = m.senderId === this.userId;
                const deliveryStr = isMine && m.deliveryStatus
                  ? ` · ${m.deliveryStatus === 'read' ? 'Wyświetlono' : (m.deliveryStatus === 'delivered' ? 'Dostarczono' : 'Wysłano')}`
                  : '';
                return `
                  <div class="ldd-line ${isMine ? 'ldd-mine' : 'ldd-theirs'}">
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
              <textarea id="ldd-compose-field" rows="1" maxlength="${MAX_TEXT_LENGTH}" placeholder="Aa · Wiadomość…">${escapeHtml(currentDraft)}</textarea>
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
          <button type="button" class="ldd-prefs" aria-label="Ustawienia prywatnych powiadomień" title="Ustawienia">⚙</button>
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
            <p>Domyślnie wyłączone, aby nie przerywać pracy.</p>
            <button type="button" id="lddBtnRestoreHidden">Przywróć zamknięte skróty</button>
          </div>
        `;
      }

      this.containerEl.innerHTML = html;
      this.attachEvents();

      // Automatyczne przewinięcie do dołu w oknie rozmowy
      if (activeConvo) {
        const anchor = this.containerEl.querySelector('.ldd-bottom-anchor');
        if (anchor && typeof anchor.scrollIntoView === 'function') {
          anchor.scrollIntoView({ block: 'end' });
        }
      }
    }

    attachEvents() {
      if (!this.containerEl) return;

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

      // Obsługa kliknięć w chat heads
      this.containerEl.querySelectorAll('.ldd-head').forEach(btn => {
        btn.onclick = () => {
          const chatId = btn.getAttribute('data-chat-id');
          if (chatId) this.openConversation(chatId);
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
    if (global._lumiDirectDockInstance) return global._lumiDirectDockInstance;
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
