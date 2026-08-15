/**
 * ══════════════════════════════════════════════════════════════════════════
 * LUMINA NOTIFICATION ENGINE (lumina-notifications.js)
 * Dwupoziomowy System Powiadomień (In-App Dzwonek 🔔 + Web Push Notifications)
 * Standard: Facebook-Style Notification Center | Ekosystem: Christian Culture
 * ══════════════════════════════════════════════════════════════════════════
 */
(function initLuminaNotificationSystem() {
    if (window.LuminaNotifications) return;

    class LuminaNotificationEngine {
        constructor() {
            this.unreadCount = 0;
            this.notifications = [];
            this.audioChime = null;
            this.initAudio();
            this.initUI();
            this.loadStoredNotifications();
            this.requestBrowserPermission();
            this.listenToEvents();
        }

        // 0. Dźwięk powiadomienia (Syntetyczny lub Audio)
        initAudio() {
            try {
                this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            } catch(e) {}
        }

        playChime() {
            try {
                if (!this.audioCtx) return;
                const ctx = this.audioCtx;
                if (ctx.state === 'suspended') ctx.resume();

                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
                osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

                gain.gain.setValueAtTime(0.12, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start();
                osc.stop(ctx.currentTime + 0.4);
            } catch(e) {}
        }

        // 1. Inicjalizacja Dzwonka i Dropdownu
        initUI() {
            if (document.getElementById('lumina-notification-center')) return;

            const html = `
            <div id="lumina-notification-center" class="notif-wrapper">
                <button id="lumina-notif-btn" class="notif-bell-btn" title="Powiadomienia" onclick="window.LuminaNotifications.toggleDropdown(event)">
                    <i class="fa-solid fa-bell"></i>
                    <span id="notif-badge" class="notif-badge" style="display:none;">0</span>
                </button>
                
                <div id="notif-dropdown" class="notif-dropdown" onclick="event.stopPropagation()">
                    <div class="notif-header">
                        <div style="display:flex; align-items:center; gap:8px;">
                            <i class="fa-solid fa-bell" style="color:#f59e0b;"></i>
                            <h4>Powiadomienia</h4>
                        </div>
                        <button onclick="window.LuminaNotifications.markAllAsRead()" class="notif-mark-read">Oznacz jako przeczytane</button>
                    </div>
                    <div id="notif-list" class="notif-list">
                        <div class="notif-empty">Brak nowych powiadomień ✨</div>
                    </div>
                </div>
            </div>

            <style>
                .notif-wrapper { position: relative; display: inline-block; vertical-align: middle; z-index: 10001; }
                .notif-bell-btn {
                    background: rgba(255,255,255,0.08);
                    border: 1px solid rgba(245,158,11,0.35);
                    color: #fff;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    transition: background 0.2s, transform 0.15s, border-color 0.2s;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                }
                .notif-bell-btn:hover { background: rgba(245,158,11,0.22); color: #f59e0b; border-color: #f59e0b; transform: scale(1.05); }
                .notif-bell-btn i { font-size: 1.15rem; }
                .notif-badge {
                    position: absolute;
                    top: -4px;
                    right: -4px;
                    background: #ef4444;
                    color: #fff;
                    font-size: 10px;
                    font-weight: 800;
                    min-width: 18px;
                    height: 18px;
                    border-radius: 9px;
                    padding: 0 4px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 2px solid #0b1838;
                    animation: pulseBadge 2s infinite;
                    box-shadow: 0 0 10px rgba(239,68,68,0.8);
                }
                .notif-dropdown {
                    position: absolute;
                    top: 50px;
                    right: 0;
                    width: 340px;
                    max-width: 90vw;
                    background: rgba(11, 24, 56, 0.96);
                    border: 1.5px solid rgba(245,158,11,0.35);
                    border-radius: 20px;
                    box-shadow: 0 20px 50px rgba(0,0,0,0.85), 0 0 20px rgba(245,158,11,0.15);
                    display: none;
                    flex-direction: column;
                    z-index: 100000;
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    overflow: hidden;
                }
                .notif-dropdown.active { display: flex !important; animation: slideDown 0.25s cubic-bezier(0.34, 1.56, 0.64, 1); }
                .notif-header {
                    padding: 14px 16px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid rgba(255,255,255,0.08);
                    background: rgba(255,255,255,0.02);
                }
                .notif-header h4 { margin: 0; font-size: 14px; color: #fff; font-weight: 800; font-family:'Outfit',sans-serif; }
                .notif-mark-read { background: none; border: none; color: #f59e0b; font-size: 12px; font-weight: 700; cursor: pointer; transition: opacity 0.2s; }
                .notif-mark-read:hover { opacity: 0.8; text-decoration: underline; }
                .notif-list { max-height: 380px; overflow-y: auto; }
                .notif-item {
                    display: flex;
                    gap: 12px;
                    padding: 12px 16px;
                    border-bottom: 1px solid rgba(255,255,255,0.04);
                    cursor: pointer;
                    transition: background 0.2s;
                    align-items: center;
                    text-decoration: none;
                }
                .notif-item:hover { background: rgba(255,255,255,0.06); }
                .notif-item.unread { background: rgba(245,158,11,0.08); border-left: 3px solid #f59e0b; }
                .notif-avatar { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 1.5px solid rgba(250,204,21,0.4); flex-shrink: 0; }
                .notif-content { flex: 1; font-size: 12.5px; color: #cbd5e1; line-height: 1.4; }
                .notif-content strong { color: #fff; font-size: 13px; }
                .notif-time { font-size: 10.5px; color: #94a3b8; margin-top: 4px; }
                .notif-empty { padding: 36px 16px; text-align: center; color: #94a3b8; font-size: 13px; }
                @keyframes slideDown { from { opacity:0; transform: translateY(-8px) scale(0.96); } to { opacity:1; transform: translateY(0) scale(1); } }
                @keyframes pulseBadge { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.15); } }
            </style>`;

            // Wstrzyknięcie dzwonka w pasku akcji nawigacji
            const target = document.querySelector('.nav-actions') || 
                           document.querySelector('.header-right') || 
                           document.querySelector('.nav-links') || 
                           document.querySelector('header') || 
                           document.body;

            if (target) {
                target.insertAdjacentHTML('afterbegin', html);
            }

            // Zamknięcie dropdownu po kliknięciu poza niego
            document.addEventListener('click', (e) => {
                const wrapper = document.getElementById('lumina-notification-center');
                if (wrapper && !wrapper.contains(e.target)) {
                    const dd = document.getElementById('notif-dropdown');
                    if (dd) dd.classList.remove('active');
                }
            });
        }

        // 2. Ładowanie i Zapis Powiadomień
        loadStoredNotifications() {
            try {
                const saved = localStorage.getItem('lumina_inapp_notifications');
                if (saved) {
                    this.notifications = JSON.parse(saved);
                    this.unreadCount = this.notifications.filter(n => n.unread).length;
                    this.updateBadge();
                    this.renderList();
                } else {
                    // Domyślne powiadomienie powitalne
                    this.push(
                        '✨ Witaj w portalu LUMINA!',
                        'Dołącz do społeczności, dziel się świadectwami i zaproś kogoś na Kawę ☕',
                        'avatar_cezary_official.jpg',
                        'lumina-tablica.html',
                        false
                    );
                }
            } catch(e) {}
        }

        saveToStorage() {
            try {
                localStorage.setItem('lumina_inapp_notifications', JSON.stringify(this.notifications.slice(0, 30)));
            } catch(e) {}
        }

        // 3. Uprawnienia Przeglądarki
        async requestBrowserPermission() {
            if ("Notification" in window && Notification.permission === "default") {
                try {
                    await Notification.requestPermission();
                } catch(e) {}
            }
        }

        // 4. Dodanie Nowego Powiadomienia (In-App + Systemowe)
        push(title, body, icon = 'lumina-icon-192.png', actionUrl = 'lumina-tablica.html', playSound = true) {
            const notif = {
                id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
                title,
                body,
                icon: icon || 'avatar_new1.jpg',
                actionUrl: actionUrl || 'lumina-tablica.html',
                time: 'Przed chwilą',
                unread: true
            };

            this.notifications.unshift(notif);
            this.unreadCount++;
            this.updateBadge();
            this.renderList();
            this.saveToStorage();

            if (playSound) this.playChime();

            // Powiadomienie systemowe w przeglądarce (jeśli okno nie jest aktywne)
            if ("Notification" in window && Notification.permission === "granted" && document.hidden) {
                try {
                    const sysNotif = new Notification(title, {
                        body: body,
                        icon: icon,
                        badge: 'lumina-icon-192.png'
                    });
                    sysNotif.onclick = () => {
                        window.focus();
                        window.location.href = actionUrl;
                    };
                } catch(e) {}
            }
        }

        updateBadge() {
            const badge = document.getElementById('notif-badge');
            if (!badge) return;
            if (this.unreadCount > 0) {
                badge.style.display = 'flex';
                badge.textContent = this.unreadCount > 9 ? '9+' : this.unreadCount;
            } else {
                badge.style.display = 'none';
            }
        }

        renderList() {
            const list = document.getElementById('notif-list');
            if (!list) return;
            if (this.notifications.length === 0) {
                list.innerHTML = '<div class="notif-empty">Brak nowych powiadomień ✨</div>';
                return;
            }

            list.innerHTML = this.notifications.map(n => `
                <div class="notif-item ${n.unread ? 'unread' : ''}" onclick="window.LuminaNotifications.handleItemClick('${n.id}', '${n.actionUrl}')">
                    <img src="${n.icon}" class="notif-avatar" alt="Avatar" onerror="this.src='avatar_new1.jpg'">
                    <div class="notif-content">
                        <div><strong>${n.title}</strong></div>
                        <div style="margin-top:2px;">${n.body}</div>
                        <div class="notif-time">${n.time}</div>
                    </div>
                </div>
            `).join('');
        }

        handleItemClick(notifId, url) {
            const item = this.notifications.find(n => n.id === notifId);
            if (item && item.unread) {
                item.unread = false;
                this.unreadCount = Math.max(0, this.unreadCount - 1);
                this.updateBadge();
                this.renderList();
                this.saveToStorage();
            }
            if (url) window.location.href = url;
        }

        toggleDropdown(e) {
            if (e) e.stopPropagation();
            const dd = document.getElementById('notif-dropdown');
            if (dd) dd.classList.toggle('active');
        }

        markAllAsRead() {
            this.unreadCount = 0;
            this.notifications.forEach(n => n.unread = false);
            this.updateBadge();
            this.renderList();
            this.saveToStorage();
        }

        // 5. Podpięcie pod zdarzenia LUMINA (Kawa, Czat, Amen)
        listenToEvents() {
            // Nasłuch zaproszeń na kawę
            window.addEventListener('lumina:coffee_invite', (e) => {
                const det = e.detail || {};
                this.push(
                    '☕ Zaproszenie na Chrześcijańską Kawę!',
                    `${det.senderName || 'Użytkownik'} zaprasza Cię na Kawę 🕊️`,
                    det.senderAvatar || 'avatar_new1.jpg',
                    'lumina.html'
                );
            });

            // Nasłuch reakcji Amen
            window.addEventListener('lumina:amen_reaction', (e) => {
                const det = e.detail || {};
                this.push(
                    '🕊️ Nowe Amen pod Twoim wpisem!',
                    `${det.userName || 'Ktoś'} powiedział Amen pod Twoim świadectwem ✨`,
                    'lumina-icon-192.png',
                    'lumina-tablica.html'
                );
            });

            // Nasłuch wiadomości na czacie
            window.addEventListener('lumina:new_message', (e) => {
                const det = e.detail || {};
                this.push(
                    '💬 Nowa wiadomość',
                    `${det.senderName || 'Użytkownik'}: ${det.text || 'Wysłał nową wiadomość'}`,
                    det.senderAvatar || 'avatar_new1.jpg',
                    'lumina.html'
                );
            });
        }
    }

    window.LuminaNotifications = new LuminaNotificationEngine();
})();
