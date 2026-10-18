/**
 * LUMI Direct Dock — Direct Messaging Adapter
 * Wrapper integrujący LumiDirectDock z produkcyjną bazą Firestore i window.LuminaDB.
 * Christian Culture • Standard Zero-QA • 2026-10-18
 */
(function (global) {
  'use strict';

  const MAX_TEXT_LENGTH = 4000;

  function toIsoDate(val) {
    if (!val) return new Date().toISOString();
    if (typeof val === 'string') return val;
    if (typeof val === 'number') return new Date(val).toISOString();
    if (val.seconds) return new Date(val.seconds * 1000).toISOString();
    if (typeof val.toDate === 'function') return val.toDate().toISOString();
    return new Date().toISOString();
  }

  function resolveParticipant(chat, myId, myUid) {
    const users = Array.isArray(chat.users) ? chat.users : [];
    const participants = Array.isArray(chat.participants) ? chat.participants : [];
    
    // Znajdź identyfikator drugiego rozmówcy (inny niż myId i myUid)
    const otherId = users.find(u => u && u !== myId && u !== myUid) ||
                    participants.find(p => p && p !== myUid && p !== myId) ||
                    chat.otherSlug || chat.otherId || 'uzytkownik';

    // Rodzinna rozmowa LUMI KIDS: nazwa i miniatura tylko z prywatnego dokumentu rozmowy (bez publicznych plików z wizerunkiem dziecka).
    const isDawid = chat.kidsFamily === true;

    const name = (isDawid ? (chat[`name_${otherId}`] || chat.otherName || 'Rozmowa rodzinna · LUMI KIDS') : null) ||
                 chat.otherName || 
                 chat[`name_${otherId}`] || 
                 (otherId === chat.lastSenderId ? chat.lastSenderName : null) || 
                 (otherId === 'radiocc' ? 'Christian Culture' : (otherId === 'cezaryrgowski' ? 'Cezary Rogowski' : (otherId === 'wiolettarogowska' ? 'Wioletta Rogowska' : otherId)));

    const avatarUrl = (isDawid ? (chat[`avatar_${otherId}`] || chat.otherAvatar || '/lumi-kids/assets/lumi-kids-logo.svg') : null) ||
                      chat.otherAvatar || 
                      chat[`avatar_${otherId}`] || 
                      (otherId === chat.lastSenderId ? chat.lastSenderAvatar : null) || 
                      (otherId === 'radiocc' ? '/logo_radio_cc.jpg' : (otherId === 'cezaryrgowski' ? '/avatar_cezary_official.jpg' : (otherId === 'wiolettarogowska' ? '/avatar_wioletta_official.jpg' : '/lumina_icon.jpg')));

    return {
      id: otherId,
      name: name || 'Rozmówca LUMINA',
      avatarUrl: avatarUrl || 'lumina_icon.jpg',
      isOnline: Boolean(chat.isOnline || chat[`isOnline_${otherId}`]),
      // Strażnik 2026-10-18: brak imienia/zdjęcia w danych rozmowy → uzupełniamy z profilu rozmówcy.
      _needsProfile: !isDawid && (!name || name === otherId || /lumina_icon\.jpg$/.test(avatarUrl || ''))
    };
  }

  // ── Imię i zdjęcie rozmówcy z jego profilu LUMINA (Strażnik, 2026-10-18) ──
  // Wcześniej tylko 3 konta miały wpisane na stałe zdjęcie; pozostali widzieli logo LUMINA,
  // a gdy w rozmowie brakowało imienia — techniczny identyfikator (np. u_jan_1234).
  const PROFILE_CACHE = new Map();
  async function lookupProfile(id) {
    if (!id) return null;
    if (PROFILE_CACHE.has(id)) return PROFILE_CACHE.get(id);
    const db = global.LuminaDB;
    const task = (async () => {
      try {
        if (!db || typeof db.getProfileFromCloud !== 'function') return null;
        const pr = await Promise.race([db.getProfileFromCloud(id), new Promise(r => setTimeout(() => r(null), 2500))]);
        if (!pr) return null;
        const name = String(pr.name || pr.displayName || '').trim();
        const avatar = String(pr.avatar || pr.photoURL || '').trim();
        return { name: name || null, avatarUrl: /^(https:\/\/|\/|[\w.-]+\.(jpe?g|png|webp|gif)$)/i.test(avatar) ? avatar : null };
      } catch (_) { return null; }
    })();
    PROFILE_CACHE.set(id, task);
    return task;
  }
  function displaySafe(list) {
    (list || []).forEach(c => {
      const p = c && c.participant;
      if (p && p._needsProfile && p.name === p.id) p.name = 'Rozmówca LUMINA';
    });
    return list;
  }
  async function enrichConversations(list) {
    await Promise.all((list || []).map(async c => {
      const p = c && c.participant;
      if (!p || !p._needsProfile) return;
      const pr = await lookupProfile(p.id);
      if (pr && pr.name) p.name = pr.name;
      if (pr && pr.avatarUrl) p.avatarUrl = pr.avatarUrl;
      p._needsProfile = false;
    }));
    return displaySafe(list);
  }

  // Jedna definicja nieprzeczytanej rozmowy dla całego ekosystemu (lumina-db: isChatRoomUnread,
  // stan „przeczytane” zapisany na serwerze — zgadza się między telefonem a komputerem).
  function unreadFor(c, myId) {
    const db = global.LuminaDB;
    if (db && typeof db.isChatRoomUnread === 'function') return db.isChatRoomUnread(c.chatId || c.id, c, myId) ? 1 : 0;
    return (c.unreadCount && typeof c.unreadCount[myId] === 'number')
      ? c.unreadCount[myId]
      : (c.lastSenderId && c.lastSenderId !== myId && !c.isRead ? 1 : 0);
  }

  function createDirectMessagingAdapter() {
    return {
      getCurrentUserId() {
        const db = global.LuminaDB;
        if (!db) return null;
        const user = typeof db.getCurrentUser === 'function' ? db.getCurrentUser() : null;
        if (!user || user.isAnonymous) return null;
        const profile = typeof db.getCurrentProfile === 'function' ? db.getCurrentProfile() : null;
        const rawId = profile?.slug || profile?.uid || user.slug || user.uid || null;
        if (!rawId || rawId === 'guest') return null;
        return typeof db.normalizeChatUserId === 'function' ? db.normalizeChatUserId(rawId) : rawId;
      },

      async listDirectConversations() {
        const myId = this.getCurrentUserId();
        const db = global.LuminaDB;
        if (!myId || !db) return [];

        const user = db.getCurrentUser ? db.getCurrentUser() : null;
        const myUid = user?.uid || null;

        // Sprawdź zablokowanych użytkowników
        let blockedUsers = [];
        try {
          if (typeof db.getBlockedUsers === 'function') {
            blockedUsers = await db.getBlockedUsers();
          }
        } catch (_) {}

        return new Promise((resolve) => {
          let unsub = null;
          let settled = false;

          const finish = (chats) => {
            if (settled) return;
            settled = true;
            if (typeof unsub === 'function') {
              try { unsub(); } catch (_) {}
            }
            const dockConversations = (chats || []).map(c => {
              const participant = resolveParticipant(c, myId, myUid);
              
              // Sprawdź czy partner nie jest zablokowany
              if (blockedUsers.includes(participant.id)) return null;

              const unread = unreadFor(c, myId);

              return {
                id: c.chatId || c.id,
                type: 'direct',
                participant,
                unreadCount: Math.max(0, unread),
                lastMessageAt: c.lastMessageTimestamp ? toIsoDate(c.lastMessageTimestamp) : '',
                lastMessageSenderId: c.lastSenderId || null
              };
            }).filter(Boolean);

            enrichConversations(dockConversations).then(resolve, () => resolve(displaySafe(dockConversations)));
          };

          if (typeof db.subscribeToUserChats === 'function') {
            unsub = db.subscribeToUserChats(myId, (chats) => {
              finish(chats);
            });
            if (settled && typeof unsub === 'function') unsub();
            // Timeout bezpieczeństwa na wypadek braku natychmiastowego snapshotu
            setTimeout(() => {
              finish([]);
            }, 3500);
          } else {
            finish([]);
          }
        });
      },

      async listMessages(conversationId, limit = 50) {
        const myId = this.getCurrentUserId();
        const db = global.LuminaDB;
        if (!myId || !db || !conversationId) return [];

        // Bezpieczne pobranie z Firestore lub pamięci sesji LuminaDB
        return new Promise((resolve, reject) => {
          let unsub = null;
          let settled = false;

          const finish = (messages) => {
            if (settled) return;
            settled = true;
            if (typeof unsub === 'function') {
              try { unsub(); } catch (_) {}
            }

            const dockMessages = (messages || []).slice(-limit).map(m => ({
              id: String(m.id || m.clientMessageId || m.createdAt || Math.random()),
              conversationId: m.chatId || conversationId,
              senderId: m.senderId || m.senderAuthUid || 'unknown',
              text: String(m.text || ''),
              createdAt: toIsoDate(m.createdAt || m.timestamp),
              deliveryStatus: (m.isRead || m.status === 'read') ? 'read' : ((m.delivered || m.status === 'delivered') ? 'delivered' : 'sent')
            }));

            resolve(dockMessages);
          };

          if (typeof db.subscribeToDirectMessages === 'function') {
            // Strażnik 2026-10-18: historia składa się z kilku nasłuchów (główny, kopia, starszy format).
            // Pierwsza paczka bywa niepełna — czekamy, aż napływ się uspokoi, zamiast brać pierwszą.
            let latest = [];
            let quiet = null;
            unsub = db.subscribeToDirectMessages(conversationId, (messages) => {
              latest = Array.isArray(messages) ? messages : [];
              if (quiet) clearTimeout(quiet);
              quiet = setTimeout(() => finish(latest), 700);
            }, error => {
              if (settled) return;
              settled = true;
              if (quiet) clearTimeout(quiet);
              if (typeof unsub === 'function') unsub();
              reject(new Error(error?.code === 'resource-exhausted'
                ? 'Historia jest chwilowo niedostępna: baza osiągnęła limit. To nie oznacza usunięcia rozmowy.'
                : 'Nie udało się wczytać historii. Spróbuj ponownie po odzyskaniu połączenia.'));
            });
            if (settled && typeof unsub === 'function') unsub();
            setTimeout(() => {
              finish(latest);
            }, 4000);
          } else {
            finish([]);
          }
        });
      },

      subscribeIncomingDM(onMessage) {
        const myId = this.getCurrentUserId();
        const db = global.LuminaDB;
        if (!myId || !db) return () => {};

        // The canonical room subscription already authenticates and scopes Firestore.
        // Room previews invalidate the list; they are not delivered message receipts.
        if (typeof db.subscribeToUserChats !== 'function') return () => {};
        const uid = db.getCurrentUser()?.uid;
        let stopped = false;
        const stop = db.subscribeToUserChats(myId, (chats) => {
          if (stopped || this.getCurrentUserId() !== myId || db.getCurrentUser()?.uid !== uid) return;
          const conversations = (chats || []).map(c => {
            const participant = resolveParticipant(c, myId, uid);
            if (typeof db.isUserBlocked === 'function' && db.isUserBlocked(participant.id)) return null;
            return {
              id: c.chatId || c.id,
              type: 'direct', participant,
              unreadCount: Math.max(0, unreadFor(c, myId)),
              lastMessageAt: c.lastMessageTimestamp ? toIsoDate(c.lastMessageTimestamp) : '',
              lastMessageSenderId: c.lastSenderId || null
            };
          }).filter(Boolean);
          onMessage({ conversations: displaySafe(conversations.map(c => Object.assign({}, c, { participant: Object.assign({}, c.participant) }))) });
          if (conversations.some(c => c.participant && c.participant._needsProfile)) {
            enrichConversations(conversations).then(list => {
              if (!stopped && this.getCurrentUserId() === myId) onMessage({ conversations: list });
            }).catch(() => {});
          }
        });
        return () => { stopped = true; if (typeof stop === 'function') stop(); };
      },

      async sendText(conversationId, text, clientRequestId) {
        const myId = this.getCurrentUserId();
        const db = global.LuminaDB;
        if (!myId || !db) throw new Error('Brak autoryzacji do wysyłania wiadomości prywatnych.');
        
        const trimmed = String(text || '').trim();
        if (!trimmed) throw new Error('Wiadomość nie może być pusta.');
        if (trimmed.length > MAX_TEXT_LENGTH) throw new Error(`Maksymalna długość wiadomości to ${MAX_TEXT_LENGTH} znaków.`);

        // Wyznacz odbiorcę na podstawie conversationId i myId
        let receiverId = null;
        if (conversationId.startsWith(myId + '_')) {
          receiverId = conversationId.slice(myId.length + 1);
        } else if (conversationId.endsWith('_' + myId)) {
          receiverId = conversationId.slice(0, -(myId.length + 1));
        } else {
          const parts = conversationId.split('_');
          if (parts.length === 2) {
            receiverId = parts[0] === myId ? parts[1] : parts[0];
          }
        }

        if (!receiverId) {
          // Pobierz z aktywnej rozmowy lub globalnego kontekstu
          receiverId = global.luminaCurrentChatPartnerSlug || global.activeChatSession?.partnerSlug || null;
        }
        if (!receiverId) throw new Error('Nie udało się ustalić odbiorcy wiadomości.');

        // Sprawdź czy odbiorca nie jest zablokowany
        if (typeof db.isUserBlocked === 'function' && db.isUserBlocked(receiverId)) {
          throw new Error('Rozmówca jest zablokowany. Wiadomość nie została wysłana.');
        }

        const myProfile = typeof db.getCurrentProfile === 'function' ? db.getCurrentProfile() : null;
        const myUser = typeof db.getCurrentUser === 'function' ? db.getCurrentUser() : null;
        const myName = myProfile?.name || myUser?.displayName || 'Użytkownik LUMINA';
        const myAvatar = myProfile?.avatar || myUser?.photoURL || 'lumina_icon.jpg';

        const messageObj = {
          text: trimmed,
          type: 'text',
          clientRequestId: clientRequestId || String(Date.now())
        };

        if (typeof db.sendDirectMessageToCloud === 'function') {
          const res = await db.sendDirectMessageToCloud(conversationId, {
            ...messageObj, senderId: myId, receiverId, senderName: myName, senderAvatar: myAvatar
          });
          if (typeof res === 'string' && res.trim()) return res;
          const notices = {
            request_sent: 'Prośba o rozmowę została wysłana. Tekst pozostaje tutaj do wysłania po akceptacji.',
            request_pending: 'Czekamy na akceptację rozmówcy. Wiadomość nie została wysłana.',
            request_closed: 'Rozmowa nie została zaakceptowana. Wiadomość nie została wysłana.'
          };
          throw new Error(notices[res?.status] || 'Nie udało się zapisać wiadomości na serwerze.');
        } else {
          throw new Error('Endpoint wysyłania wiadomości prywatnych jest niedostępny.');
        }
      },

      async markRead(conversationId, messageId, visibleMessageIds = [messageId]) {
        const myId = this.getCurrentUserId();
        const db = global.LuminaDB;
        if (!myId || !db || !conversationId || !messageId) return false;

        const myProfile = typeof db.getCurrentProfile === 'function' ? db.getCurrentProfile() : null;
        const myUser = typeof db.getCurrentUser === 'function' ? db.getCurrentUser() : null;
        const myName = myProfile?.name || myUser?.displayName || 'Użytkownik LUMINA';

        if (typeof db.markDirectMessagesAsRead === 'function') {
          return await db.markDirectMessagesAsRead(conversationId, myId, myName, {
            surface: 'direct-dock', visibleMessageIds
          }) === true;
        }
        return false;
      },

      subscribeConversation(conversationId, onMessage) {
        const myId = this.getCurrentUserId();
        const db = global.LuminaDB;
        if (!myId || !db || !conversationId) return () => {};

        // Strażnik 2026-10-18: przekazujemy KAŻDĄ nową lub zmienioną wiadomość (nie tylko ostatnią),
        // więc okienko ma pełną historię także wtedy, gdy wiadomości napływają z kilku źródeł naraz.
        const seen = new Map();

        if (typeof db.subscribeToDirectMessages === 'function') {
          return db.subscribeToDirectMessages(conversationId, (messages) => {
            if (!Array.isArray(messages) || !messages.length) return;
            for (const m of messages) {
              const id = String(m.id || m.clientMessageId || '');
              if (!id) continue;
              const revision = JSON.stringify([m.isRead, m.status, m.delivered, m.text]);
              if (seen.get(id) === revision) continue;
              seen.set(id, revision);
              onMessage({
                id,
                conversationId: m.chatId || conversationId,
                senderId: m.senderId || m.senderAuthUid || 'unknown',
                text: String(m.text || ''),
                createdAt: toIsoDate(m.createdAt || m.timestamp),
                deliveryStatus: (m.isRead || m.status === 'read') ? 'read' : ((m.delivered || m.status === 'delivered') ? 'delivered' : 'sent')
              });
            }
          });
        }
        return () => {};
      }
    };
  }

  global.createDirectMessagingAdapter = createDirectMessagingAdapter;
})(typeof window !== 'undefined' ? window : this);
