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
            this.audioCtx = null;
            this.initAudio();
            this.initUI();
            this.loadStoredNotifications();
            this.requestBrowserPermission();
            this.listenToEvents();
        }

        // 0. Dźwięk powiadomienia
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
            if (document.getElementById('lumina-notification-center')) {
                document.getElementById('lumina-notification-center').remove();
            }

            const html = `
            <div id="lumina-notification-center" class="notif-wrapper">
                <button id="lumina-notif-btn" class="notif-bell-btn" title="Powiadomienia LUMINA" onclick="window.LuminaNotifications.toggleDropdown(event)">
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
                .notif-wrapper {
                    position: relative;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    vertical-align: middle;
                    z-index: 10001;
                    margin-right: 6px;
                }
                .notif-bell-btn {
                    background: rgba(11, 24, 56, 0.90) !important;
                    border: 1.5px solid #facc15 !important;
                    color: #facc15 !important;
                    width: 38px !important;
                    height: 38px !important;
                    border-radius: 50% !important;
                    cursor: pointer !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    position: relative !important;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
                    box-shadow: 0 4px 14px rgba(0,0,0,0.4), 0 0 10px rgba(250, 204, 21, 0.25) !important;
                    -webkit-tap-highlight-color: transparent !important;
                }
                .notif-bell-btn i {
                    font-size: 1.12rem !important;
                    color: #facc15 !important;
                    filter: drop-shadow(0 0 4px rgba(250, 204, 21, 0.5)) !important;
                    transition: color 0.2s, transform 0.2s !important;
                }
                .notif-bell-btn:hover {
                    background: #facc15 !important;
                    color: #070e24 !important;
                    transform: scale(1.08) !important;
                    box-shadow: 0 0 16px rgba(250, 204, 21, 0.6) !important;
                }
                .notif-bell-btn:hover i {
                    color: #070e24 !important;
                    filter: none !important;
                }
                .notif-badge {
                    position: absolute !important;
                    top: -4px !important;
                    right: -4px !important;
                    background: #ef4444 !important;
                    color: #fff !important;
                    font-size: 10px !important;
                    font-weight: 800 !important;
                    min-width: 18px !important;
                    height: 18px !important;
                    border-radius: 9px !important;
                    padding: 0 4px !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    border: 2px solid #0b1838 !important;
                    animation: pulseBadge 2s infinite !important;
                    box-shadow: 0 0 10px rgba(239,68,68,0.8) !important;
                }
                .notif-dropdown {
                    position: absolute !important;
                    top: 48px !important;
                    right: 0 !important;
                    width: 340px !important;
                    max-width: 90vw !important;
                    background: rgba(11, 24, 56, 0.97) !important;
                    border: 1.5px solid rgba(250,204,21,0.4) !important;
                    border-radius: 20px !important;
                    box-shadow: 0 20px 50px rgba(0,0,0,0.85), 0 0 20px rgba(250,204,21,0.15) !important;
                    display: none;
                    flex-direction: column !important;
                    z-index: 100000 !important;
                    backdrop-filter: blur(20px) !important;
                    -webkit-backdrop-filter: blur(20px) !important;
                    overflow: hidden !important;
                }
                .notif-dropdown.active { display: flex !important; animation: slideDown 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) !important; }
                .notif-header {
                    padding: 14px 16px !important;
                    display: flex !important;
                    justify-content: space-between !important;
                    align-items: center !important;
                    border-bottom: 1px solid rgba(255,255,255,0.08) !important;
                    background: rgba(255,255,255,0.02) !important;
                }
                .notif-header h4 { margin: 0 !important; font-size: 14px !important; color: #fff !important; font-weight: 800 !important; font-family:'Outfit',sans-serif !important; }
                .notif-mark-read { background: none !important; border: none !important; color: #f59e0b !important; font-size: 12px !important; font-weight: 700 !important; cursor: pointer !important; transition: opacity 0.2s !important; }
                .notif-mark-read:hover { opacity: 0.8 !important; text-decoration: underline !important; }
                .notif-list { max-height: 380px !important; overflow-y: auto !important; }
                .notif-item {
                    display: flex !important;
                    gap: 12px !important;
                    padding: 12px 16px !important;
                    border-bottom: 1px solid rgba(255,255,255,0.04) !important;
                    cursor: pointer !important;
                    transition: background 0.2s !important;
                    align-items: center !important;
                    text-decoration: none !important;
                }
                .notif-item:hover { background: rgba(255,255,255,0.06) !important; }
                .notif-item.unread { background: rgba(245,158,11,0.08) !important; border-left: 3px solid #f59e0b !important; }
                .notif-avatar { width: 40px !important; height: 40px !important; border-radius: 50% !important; object-fit: cover !important; border: 1.5px solid rgba(250,204,21,0.4) !important; flex-shrink: 0 !important; }
                .notif-content { flex: 1 !important; font-size: 12.5px !important; color: #cbd5e1 !important; line-height: 1.4 !important; }
                .notif-content strong { color: #fff !important; font-size: 13px !important; }
                .notif-time { font-size: 10.5px !important; color: #94a3b8 !important; margin-top: 4px !important; }
                .notif-empty { padding: 36px 16px !important; text-align: center !important; color: #94a3b8 !important; font-size: 13px !important; }
                @keyframes slideDown { from { opacity:0; transform: translateY(-8px) scale(0.96); } to { opacity:1; transform: translateY(0) scale(1); } }
                @keyframes pulseBadge { 0%, 100% { opacity: 1; } 50% { opacity: 0.55; } }
            </style>`;

            // Wstrzyknięcie dzwonka po PRAWEJ STRONIE, tuż obok widżetu Radia CC
            const radioWidget = document.getElementById('radioWidget') || document.querySelector('.nav-radio-pill') || document.querySelector('.radio-widget');
            
            if (radioWidget && radioWidget.parentElement) {
                radioWidget.insertAdjacentHTML('beforebegin', html);
            } else {
                const rightContainer = document.querySelector('.header-right') || 
                                       document.querySelector('.nav-actions') || 
                                       document.querySelector('.profile-navbar > div:last-child') ||
                                       document.querySelector('.lumina-nav > div:last-child') ||
                                       document.body;
                rightContainer.insertAdjacentHTML('afterbegin', html);
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

        // 4. Dodanie Nowego Powiadomienia
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

        // 5. Podpięcie pod zdarzenia LUMINA
        listenToEvents() {
            window.addEventListener('lumina:coffee_invite', (e) => {
                const det = e.detail || {};
                this.push(
                    '☕ Zaproszenie na Chrześcijańską Kawę!',
                    `${det.senderName || 'Użytkownik'} zaprasza Cię na Kawę 🕊️`,
                    det.senderAvatar || 'avatar_new1.jpg',
                    'lumina.html'
                );
            });

            window.addEventListener('lumina:amen_reaction', (e) => {
                const det = e.detail || {};
                this.push(
                    '🕊️ Nowe Amen pod Twoim wpisem!',
                    `${det.userName || 'Ktoś'} powiedział Amen pod Twoim świadectwem ✨`,
                    'lumina-icon-192.png',
                    'lumina-tablica.html'
                );
            });

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

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => { window.LuminaNotifications = new LuminaNotificationEngine(); });
    } else {
        window.LuminaNotifications = new LuminaNotificationEngine();
    }
})();
