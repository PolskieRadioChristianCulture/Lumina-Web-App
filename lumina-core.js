/**
 * ══════════════════════════════════════════════════════════════════════════
 * LUMINA CORE ENGINE (lumina-core.js)
 * Architektura Danych Firebase Firestore + Czat Real-Time + System Zaproszeń na Kawę ☕
 * ══════════════════════════════════════════════════════════════════════════
 */

import * as LuminaDB from './lumina-db.js';

class LuminaCoreEngine {
    constructor() {
        this.db = LuminaDB;
        this.currentUser = null;
        this.currentProfile = null;
        this.activeListeners = [];
        this.init();
    }

    init() {
        // Inicjalizacja stanu użytkownika
        this.currentUser = this.db.getCurrentUser();
        this.currentProfile = this.db.getCurrentProfile();

        this.db.onAuthChange((user, profile) => {
            this.currentUser = user;
            this.currentProfile = profile;
            if (user) {
                this.listenForCoffeeInvitations();
            }
        });

        // Wstrzyknięcie modala zaproszeń na kawę do DOM
        this.injectCoffeeModal();
    }

    // ── 1. ARCHITEKTURA BAZY DANYCH: Profile Użytkowników ──
    async saveUserProfile(userData) {
        const uid = userData.uid || userData.slug || (this.currentUser ? this.currentUser.uid : 'user_' + Date.now());
        const userSchema = {
            id: uid,
            uid: uid,
            slug: userData.slug || uid,
            name: userData.name || 'Użytkownik LUMINA',
            age: parseInt(userData.age, 10) || 25,
            city: userData.city || 'Polska',
            denom: userData.denom || 'Rzymskokatolickie',
            church: userData.church || '',
            job: userData.job || 'Społeczność LUMINA ✨',
            bio: userData.bio || '',
            verse: userData.verse || '„Wszystko mogę w Tym, który mnie umacnia”',
            verseRef: userData.verseRef || 'Flp 4, 13',
            values: userData.values || userData.tags || ['Modlitwa', 'Wierność', 'Wartości', 'Chrześcijaństwo'],
            tags: userData.values || userData.tags || ['Modlitwa', 'Wierność', 'Wartości', 'Chrześcijaństwo'],
            isPrivate: userData.isPrivate === true || userData.visibility === 'private',
            visibility: userData.isPrivate === true || userData.visibility === 'private' ? 'private' : 'public',
            pinHash: userData.pin || '7777',
            photos: Array.isArray(userData.photos) && userData.photos.length ? userData.photos : [userData.avatar || 'avatar_new1.jpg'],
            avatar: userData.avatar || 'avatar_new1.jpg',
            cover: userData.cover || 'lumina_hero_clean.jpg',
            status: userData.status || 'Panna/Kawaler',
            updatedAt: new Date()
        };

        return await this.db.saveProfileToCloud(uid, userSchema);
    }

    // ── 2. SYSTEM ZAPROSZEŃ: „Chrześcijańska Kawa ☕” ──
    async sendCoffeeInvite(receiverIdOrSlug, customNote = '') {
        const sender = this.currentProfile || this.currentUser || {
            uid: localStorage.getItem('lumina_guest_id') || 'guest_' + Math.floor(Math.random() * 8999 + 1000),
            name: 'Gość LUMINA',
            avatar: 'avatar_new1.jpg'
        };

        const invitePayload = {
            id: 'coffee_' + Date.now(),
            senderId: sender.uid || sender.slug,
            senderName: sender.name || 'Użytkownik LUMINA',
            senderAvatar: sender.avatar || 'avatar_new1.jpg',
            senderRole: sender.job || sender.role || 'Społeczność LUMINA ✨',
            receiverId: receiverIdOrSlug,
            status: 'pending_invitation', // 'pending_invitation' | 'accepted' | 'declined_with_prayer'
            note: customNote || 'Szczęść Boże! Z radością zapraszam Cię na chrześcijańską kawę i serdeczną rozmowę o wartościach w Chrystusie ☕🕊️',
            timestamp: new Date().toISOString()
        };

        // Zapis w pamięci lokalnej
        try {
            const localInvites = JSON.parse(localStorage.getItem('lumina_coffee_invites') || '[]');
            localInvites.push(invitePayload);
            localStorage.setItem('lumina_coffee_invites', JSON.stringify(localInvites));
        } catch(e) {}

        // Zapis w Firebase Firestore
        if (window.LuminaDB?.addPostToCloud) {
            try {
                // Wyślij także automatyczną wiadomość powitalną do czatu
                const chatId = this.db.getChatId(invitePayload.senderId, receiverIdOrSlug);
                await this.db.sendDirectMessageToCloud(chatId, {
                    senderId: invitePayload.senderId,
                    senderName: invitePayload.senderName,
                    senderAvatar: invitePayload.senderAvatar,
                    receiverId: receiverIdOrSlug,
                    text: `☕ ${invitePayload.note}`,
                    type: 'coffee_invite'
                });
            } catch(e) {}
        }

        if (typeof window.showToast === 'function') {
            window.showToast('Zaproszenie na Chrześcijańską Kawę ☕ zostało pomyślnie wysłane!');
        }

        return invitePayload;
    }

    listenForCoffeeInvitations() {
        const myUid = this.currentUser?.uid || this.currentProfile?.slug;
        if (!myUid) return;

        // Listener czatów / zaproszeń
        this.db.subscribeToUserChats(myUid, (chats) => {
            if (!chats || !chats.length) return;
            const lastChat = chats[0];
            if (lastChat.lastMessageText && lastChat.lastMessageText.includes('☕') && lastChat.lastSenderId !== myUid) {
                this.showCoffeeNotificationModal({
                    id: lastChat.id,
                    senderId: lastChat.lastSenderId,
                    senderName: lastChat.lastSenderName,
                    senderAvatar: lastChat.lastSenderAvatar || 'avatar_new1.jpg',
                    note: lastChat.lastMessageText
                });
            }
        });
    }

    async respondCoffeeInvite(invite, responseType) {
        // responseType: 'accepted' | 'declined_with_prayer'
        const myUid = this.currentUser?.uid || this.currentProfile?.slug || 'me';
        const chatId = this.db.getChatId(myUid, invite.senderId);

        if (responseType === 'accepted') {
            await this.db.sendDirectMessageToCloud(chatId, {
                senderId: myUid,
                senderName: this.currentProfile?.name || 'Ja',
                receiverId: invite.senderId,
                text: '☕ Z radością przyjmuję zaproszenie na kawę! Miło mi Cię poznać. Niech Bóg błogosławi naszą rozmowę ✨',
                type: 'coffee_accepted'
            });
            if (typeof window.showToast === 'function') {
                window.showToast(`Przyjąłeś zaproszenie od ${invite.senderName}! Otwieram czat... 💬✨`);
            }
            if (typeof window.openMessageModal === 'function') {
                window.openMessageModal(invite.senderName, invite.senderAvatar, invite.senderId);
            }
        } else {
            await this.db.sendDirectMessageToCloud(chatId, {
                senderId: myUid,
                senderName: this.currentProfile?.name || 'Ja',
                receiverId: invite.senderId,
                text: '🙏 Dziękuję serdecznie za zaproszenie. Z modlitwą i życzeniami Bożego pokoju w sercu.',
                type: 'coffee_declined'
            });
            if (typeof window.showToast === 'function') {
                window.showToast(`Wysłano odpowiedź: Z modlitwą dziękuję 🙏`);
            }
        }

        this.closeCoffeeNotificationModal();
    }

    // ── 3. SYNCHRONIZACJA Z TABLICĄ LIVE ──
    listenToLiveFeed(onUpdate) {
        return this.db.subscribeToFeedPosts((posts) => {
            if (typeof onUpdate === 'function') {
                onUpdate(posts);
            }
        });
    }

    // ── 4. CZAT W CZASIE RZECZYWISTYM (Matches & Messages) ──
    listenToChatMessages(chatPartnerId, onMessagesReceived) {
        const myId = this.currentUser?.uid || this.currentProfile?.slug || 'guest';
        const chatId = this.db.getChatId(myId, chatPartnerId);
        return this.db.subscribeToDirectMessages(chatId, onMessagesReceived);
    }

    async sendMessage(chatPartnerId, text) {
        const myId = this.currentUser?.uid || this.currentProfile?.slug || 'guest';
        const chatId = this.db.getChatId(myId, chatPartnerId);
        return await this.db.sendDirectMessageToCloud(chatId, {
            senderId: myId,
            senderName: this.currentProfile?.name || this.currentUser?.displayName || 'Użytkownik LUMINA',
            senderAvatar: this.currentProfile?.avatar || this.currentUser?.photoURL || 'avatar_new1.jpg',
            receiverId: chatPartnerId,
            text: text
        });
    }

    // ── 5. WSTRZYKIWANIE MODALA ZAPROSZENIA NA KAWĘ ──
    injectCoffeeModal() {
        if (document.getElementById('coffeeInviteNotificationModal')) return;

        const modalHtml = `
        <div class="modal-overlay" id="coffeeInviteNotificationModal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(7,14,36,0.85); backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px); z-index:100000; align-items:center; justify-content:center;">
            <div class="modal-card" style="background:#0b1838; border:1.5px solid rgba(250,204,21,0.4); border-radius:24px; padding:28px 24px; max-width:440px; width:92%; box-shadow:0 20px 50px rgba(0,0,0,0.8), 0 0 30px rgba(250,204,21,0.2); text-align:center; animation:modalPopIn 0.3s cubic-bezier(0.34,1.56,0.64,1);">
                <div style="width:72px; height:72px; margin:0 auto 16px; border-radius:50%; background:linear-gradient(135deg, rgba(234,179,8,0.2), rgba(168,85,247,0.2)); display:flex; align-items:center; justify-content:center; border:2px solid #facc15; box-shadow:0 0 20px rgba(250,204,21,0.35);">
                    <i class="fa-solid fa-mug-hot" style="font-size:2rem; color:#facc15;"></i>
                </div>
                <h3 id="coffeeInviteTitle" style="font-family:'Outfit',sans-serif; font-size:1.35rem; font-weight:800; color:#fff; margin-bottom:8px;">Zaproszenie na Chrześcijańską Kawę! ☕</h3>
                <div id="coffeeInviteSenderInfo" style="display:flex; align-items:center; justify-content:center; gap:10px; margin-bottom:14px;">
                    <img id="coffeeInviteSenderAvatar" src="avatar_new1.jpg" style="width:36px; height:36px; border-radius:50%; object-fit:cover; border:1px solid #facc15;">
                    <span id="coffeeInviteSenderName" style="font-weight:700; color:#f8fafc; font-size:0.95rem;">Użytkownik LUMINA</span>
                </div>
                <div id="coffeeInviteNoteText" style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:14px; padding:14px; font-size:0.88rem; color:#cbd5e1; font-style:italic; margin-bottom:22px; line-height:1.5;">
                    „Szczęść Boże! Z radością zapraszam Cię na chrześcijańską kawę...”
                </div>
                <div style="display:flex; flex-direction:column; gap:10px;">
                    <button type="button" id="btnAcceptCoffeeInvite" style="width:100%; padding:12px 18px; border-radius:14px; border:none; background:linear-gradient(135deg, #22c55e, #16a34a); color:#fff; font-weight:800; font-size:0.92rem; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; box-shadow:0 6px 20px rgba(34,197,94,0.35); transition:transform 0.2s;">
                        <i class="fa-solid fa-check"></i> Przyjmij zaproszenie ☕
                    </button>
                    <button type="button" id="btnDeclineCoffeeInvite" style="width:100%; padding:12px 18px; border-radius:14px; border:1px solid rgba(255,255,255,0.2); background:rgba(255,255,255,0.06); color:#cbd5e1; font-weight:700; font-size:0.88rem; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; transition:background 0.2s;">
                        <i class="fa-solid fa-hands-praying"></i> Z modlitwą dziękuję 🙏
                    </button>
                </div>
            </div>
        </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    showCoffeeNotificationModal(invite) {
        const modal = document.getElementById('coffeeInviteNotificationModal');
        if (!modal) return;

        const titleEl = document.getElementById('coffeeInviteTitle');
        const nameEl = document.getElementById('coffeeInviteSenderName');
        const avatarEl = document.getElementById('coffeeInviteSenderAvatar');
        const noteEl = document.getElementById('coffeeInviteNoteText');
        const btnAccept = document.getElementById('btnAcceptCoffeeInvite');
        const btnDecline = document.getElementById('btnDeclineCoffeeInvite');

        if (titleEl) titleEl.textContent = `${invite.senderName} zaprasza Cię na Kawę! ☕`;
        if (nameEl) nameEl.textContent = invite.senderName;
        if (avatarEl) avatarEl.src = invite.senderAvatar || 'avatar_new1.jpg';
        if (noteEl) noteEl.textContent = `„${invite.note}”`;

        btnAccept.onclick = () => this.respondCoffeeInvite(invite, 'accepted');
        btnDecline.onclick = () => this.respondCoffeeInvite(invite, 'declined_with_prayer');

        modal.style.display = 'flex';
    }

    closeCoffeeNotificationModal() {
        const modal = document.getElementById('coffeeInviteNotificationModal');
        if (modal) modal.style.display = 'none';
    }
}

// Global Singleton Instance
window.LuminaCore = new LuminaCoreEngine();
export default window.LuminaCore;
