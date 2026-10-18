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

    const name = chat.otherName || 
                 chat[`name_${otherId}`] || 
                 (otherId === chat.lastSenderId ? chat.lastSenderName : null) || 
                 (otherId === 'radiocc' ? 'Christian Culture' : (otherId === 'cezaryrgowski' ? 'Cezary Rogowski' : (otherId === 'wiolettarogowska' ? 'Wioletta Rogowska' : otherId)));

    const avatarUrl = chat.otherAvatar || 
                      chat[`avatar_${otherId}`] || 
                      (otherId === chat.lastSenderId ? chat.lastSenderAvatar : null) || 
                      (otherId === 'radiocc' ? '/logo_radio_cc.jpg' : (otherId === 'cezaryrgowski' ? '/avatar_cezary_official.jpg' : (otherId === 'wiolettarogowska' ? '/avatar_wioletta_official.jpg' : '/lumina_icon.jpg')));

    return {
      id: otherId,
      name: name || 'Rozmówca LUMINA',
      avatarUrl: avatarUrl || 'lumina_icon.jpg',
      isOnline: Boolean(chat.isOnline || chat[`isOnline_${otherId}`])
    };
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

              const unread = (c.unreadCount && typeof c.unreadCount[myId] === 'number')
                ? c.unreadCount[myId]
                : (c.lastSenderId && c.lastSenderId !== myId && !c.isRead ? 1 : 0);

              return {
                id: c.chatId || c.id,
                type: 'direct',
                participant,
                unreadCount: Math.max(0, unread),
                lastMessageAt: toIsoDate(c.lastMessageTimestamp)
              };
            }).filter(Boolean);

            resolve(dockConversations);
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
        return new Promise((resolve) => {
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
            unsub = db.subscribeToDirectMessages(conversationId, (messages) => {
              finish(messages);
            });
            if (settled && typeof unsub === 'function') unsub();
            setTimeout(() => {
              finish([]);
            }, 3000);
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
              unreadCount: Math.max(0, typeof c.unreadCount?.[myId] === 'number'
                ? c.unreadCount[myId] : (c.lastSenderId && c.lastSenderId !== myId && !c.isRead ? 1 : 0)),
              lastMessageAt: toIsoDate(c.lastMessageTimestamp)
            };
          }).filter(Boolean);
          onMessage({ conversations });
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
          if (!res) throw new Error('Nie udało się zapisać wiadomości na serwerze.');
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

        let lastSeenId = null;

        if (typeof db.subscribeToDirectMessages === 'function') {
          return db.subscribeToDirectMessages(conversationId, (messages) => {
            if (!Array.isArray(messages) || !messages.length) return;
            const lastMsg = messages[messages.length - 1];
            const revision = lastMsg && JSON.stringify([lastMsg.id, lastMsg.isRead, lastMsg.status, lastMsg.delivered]);
            if (lastMsg && revision !== lastSeenId) {
              lastSeenId = revision;
              onMessage({
                id: String(lastMsg.id || Date.now()),
                conversationId: lastMsg.chatId || conversationId,
                senderId: lastMsg.senderId || lastMsg.senderAuthUid || 'unknown',
                text: String(lastMsg.text || ''),
                createdAt: toIsoDate(lastMsg.createdAt || lastMsg.timestamp),
                deliveryStatus: (lastMsg.isRead || lastMsg.status === 'read') ? 'read' : ((lastMsg.delivered || lastMsg.status === 'delivered') ? 'delivered' : 'sent')
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
