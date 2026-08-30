/**
 * ══════════════════════════════════════════════════════════════════════════
 * LUMINA NOTIFICATION ENGINE (lumina-notifications.js)
 * Zaawansowany, Dwupoziomowy System Powiadomień (In-App Dzwonek 🔔 + Web Push)
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
            this.listenToEvents();
            this.initFirestoreRealtimeListener();
            this.initSoftPrompt();
        }

        // 0. Dźwięk powiadomienia (Harmoniczne Chime CC z Debounce & Quiet Hours)
        initAudio() {
            try {
                const AudioContextClass = window.AudioContext || window.webkitAudioContext;
                if (AudioContextClass) {
                    this.audioCtx = new AudioContextClass();
                }
            } catch(e) {}
        }

        isQuietHours() {
            try {
                const prefs = JSON.parse(localStorage.getItem('lumina_notif_prefs') || '{}');
                if (prefs.quietHoursEnabled === false) return false;
                const h = new Date().getHours();
                const start = prefs.quietHoursStart ? parseInt(prefs.quietHoursStart.split(':')[0], 10) : 22;
                const end = prefs.quietHoursEnd ? parseInt(prefs.quietHoursEnd.split(':')[0], 10) : 8;
                return (start > end) ? (h >= start || h < end) : (h >= start && h < end);
            } catch(e) {
                return false;
            }
        }

        playChime() {
            try {
                if (this.isQuietHours()) return; // Tryb nocny / Quiet Hours

                const now = Date.now();
                if (window._lastLuminaChimeTime && (now - window._lastLuminaChimeTime < 1800)) {
                    return; // Zabezpieczenie przed nałożeniem dźwięków (Debounce)
                }
                window._lastLuminaChimeTime = now;

                if (!this.audioCtx) this.initAudio();
                if (!this.audioCtx) return;
                const ctx = this.audioCtx;
                if (ctx.state === 'suspended') {
                    ctx.resume().catch(() => {});
                }

                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
                osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

                gain.gain.setValueAtTime(0.14, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.38);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start();
                osc.stop(ctx.currentTime + 0.38);
            } catch(e) {}
        }

        // 1. Inicjalizacja Dzwonka i Dropdownu
        initUI() {
            const existing = document.getElementById('lumina-notification-center');
            if (existing) existing.remove();

            const html = `
            <div id="lumina-notification-center" class="notif-wrapper">
                <button type="button" id="lumina-notif-btn" class="notif-bell-btn" title="Centrum powiadomień LUMINA" onclick="window.LuminaNotifications.toggleDropdown(event)">
                    <i class="fa-solid fa-bell"></i>
                    <span id="notif-badge" class="notif-badge" style="display:none;"></span>
                </button>
                
                <div id="notif-dropdown" class="notif-dropdown" onclick="event.stopPropagation()">
                    <div class="notif-header">
                        <div style="display:flex; align-items:center; gap:8px;">
                            <i class="fa-solid fa-bell" style="color:#f59e0b; font-size:0.95rem;"></i>
                            <h4 style="margin:0; font-size:14px; font-weight:800; color:#fff; font-family:'Outfit',sans-serif;">Powiadomienia</h4>
                        </div>
                        <div id="notif-header-actions" style="display:none; align-items:center; gap:10px;">
                            <button type="button" onclick="window.LuminaNotifications.markAllAsRead()" class="notif-action-btn" title="Oznacz wszystko jako przeczytane">Odczytaj</button>
                            <button type="button" onclick="window.LuminaNotifications.clearAll()" class="notif-action-btn notif-clear-btn" title="Wyczyść listę powiadomień">Wyczyść</button>
                        </div>
                    </div>
                    <div id="notif-push-bar" class="notif-push-bar"></div>
                    <div id="notif-list" class="notif-list"></div>
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
                    margin: 0 4px;
                }
                .notif-bell-btn {
                    background: rgba(11, 24, 56, 0.90) !important;
                    border: 1.5px solid rgba(250, 204, 21, 0.8) !important;
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
                    outline: none !important;
                }
                .notif-bell-btn i {
                    font-size: 1.05rem !important;
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
                    display: none;
                    align-items: center !important;
                    justify-content: center !important;
                    border: 2px solid #0b1838 !important;
                    animation: notifPulseBadge 2s infinite !important;
                    box-shadow: 0 0 10px rgba(239,68,68,0.8) !important;
                }
                .notif-badge:empty,
                .notif-badge[data-count="0"] {
                    display: none !important;
                }
                .notif-dropdown {
                    position: absolute !important;
                    top: calc(100% + 10px) !important;
                    right: 0 !important;
                    width: 350px !important;
                    max-width: calc(100vw - 24px) !important;
                    background: rgba(11, 24, 56, 0.98) !important;
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
                
                @media (max-width: 500px) {
                    .notif-dropdown {
                        position: fixed !important;
                        top: 70px !important;
                        left: 10px !important;
                        right: 10px !important;
                        width: auto !important;
                        transform: none !important;
                    }
                }

                .notif-dropdown.active { 
                    display: flex !important; 
                    animation: notifSlideDown 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) !important; 
                }
                .notif-header {
                    padding: 12px 16px !important;
                    display: flex !important;
                    justify-content: space-between !important;
                    align-items: center !important;
                    border-bottom: 1px solid rgba(255,255,255,0.08) !important;
                    background: rgba(255,255,255,0.03) !important;
                }
                .notif-action-btn { 
                    background: none !important; 
                    border: none !important; 
                    color: #f59e0b !important; 
                    font-size: 11.5px !important; 
                    font-weight: 700 !important; 
                    cursor: pointer !important; 
                    transition: opacity 0.2s !important; 
                    padding: 2px 4px !important;
                }
                .notif-action-btn:hover { 
                    opacity: 0.8 !important; 
                    text-decoration: underline !important; 
                }
                .notif-clear-btn {
                    color: #94a3b8 !important;
                }
                .notif-clear-btn:hover {
                    color: #f87171 !important;
                }
                .notif-push-bar {
                    display: none;
                    padding: 9px 14px;
                    background: rgba(245, 158, 11, 0.12);
                    border-bottom: 1px solid rgba(245, 158, 11, 0.25);
                    font-size: 11.5px;
                    color: #fef08a;
                    align-items: center;
                    justify-content: space-between;
                    gap: 8px;
                }
                .notif-push-bar.show {
                    display: flex !important;
                }
                .notif-push-enable-btn {
                    background: #f59e0b;
                    color: #0b1838;
                    border: none;
                    border-radius: 12px;
                    padding: 4px 10px;
                    font-size: 11px;
                    font-weight: 800;
                    cursor: pointer;
                    white-space: nowrap;
                    transition: all 0.2s;
                }
                .notif-push-enable-btn:hover {
                    background: #fde047;
                    transform: scale(1.04);
                }
                .notif-list { 
                    max-height: 380px !important; 
                    overflow-y: auto !important; 
                }
                .notif-item {
                    display: flex !important;
                    gap: 12px !important;
                    padding: 12px 16px !important;
                    border-bottom: 1px solid rgba(255,255,255,0.05) !important;
                    cursor: pointer !important;
                    transition: background 0.2s !important;
                    align-items: center !important;
                    text-decoration: none !important;
                }
                .notif-item:hover { 
                    background: rgba(255,255,255,0.06) !important; 
                }
                .notif-item.unread { 
                    background: rgba(245,158,11,0.10) !important; 
                    border-left: 3px solid #f59e0b !important; 
                }
                .notif-avatar { 
                    width: 38px !important; 
                    height: 38px !important; 
                    border-radius: 50% !important; 
                    object-fit: cover !important; 
                    border: 1.5px solid rgba(250,204,21,0.4) !important; 
                    flex-shrink: 0 !important; 
                }
                .notif-content { 
                    flex: 1 !important; 
                    font-size: 12.5px !important; 
                    color: #cbd5e1 !important; 
                    line-height: 1.4 !important; 
                    min-width: 0;
                }
                .notif-content strong { 
                    color: #fff !important; 
                    font-size: 13px !important; 
                }
                .notif-time { 
                    font-size: 10.5px !important; 
                    color: #94a3b8 !important; 
                    margin-top: 4px !important; 
                }
                .notif-empty { 
                    display: none !important;
                }
                @keyframes notifSlideDown { 
                    from { opacity:0; transform: translateY(-8px) scale(0.96); } 
                    to { opacity:1; transform: translateY(0) scale(1); } 
                }
                @keyframes notifPulseBadge { 
                    0%, 100% { opacity: 1; transform: scale(1); } 
                    50% { opacity: 0.7; transform: scale(1.1); } 
                }
            
                /* ═════════ SMART SWAP (MOBILE) ═════════ */
                @media (max-width: 640px) {
                    /* If there are NO unread notifications */
                    body[data-unread-count="0"] #lumina-notification-center {
                        display: none !important;
                    }
                    body[data-unread-count="0"] #radioWidget,
                    body[data-unread-count="0"] .nav-radio-btn {
                        display: inline-flex !important;
                    }

                    /* If there ARE unread notifications */
                    body:not([data-unread-count="0"]):not([data-unread-count=""]) #lumina-notification-center {
                        display: inline-flex !important;
                    }
                    body:not([data-unread-count="0"]):not([data-unread-count=""]) #radioWidget,
                    body:not([data-unread-count="0"]):not([data-unread-count=""]) .nav-radio-btn {
                        display: none !important;
                    }
                }

                #luminaPushSoftPrompt {
                    position: fixed;
                    bottom: calc(84px + env(safe-area-inset-bottom, 16px));
                    left: 50%;
                    transform: translateX(-50%);
                    z-index: 999998;
                    width: calc(100% - 32px);
                    max-width: 440px;
                    animation: slideUpPrompt 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                    transition: opacity 0.3s ease, transform 0.3s ease;
                }
                #luminaPushSoftPrompt.fade-out {
                    opacity: 0;
                    transform: translateX(-50%) translateY(20px);
                }
                .lumina-push-soft-card {
                    background: rgba(11, 18, 38, 0.96);
                    backdrop-filter: blur(18px);
                    -webkit-backdrop-filter: blur(18px);
                    border: 1.5px solid rgba(250, 204, 21, 0.6);
                    border-radius: 20px;
                    padding: 12px 14px;
                    box-shadow: 0 16px 45px rgba(0,0,0,0.8), 0 0 25px rgba(250, 204, 21, 0.25);
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    color: #fff;
                    font-family: 'Plus Jakarta Sans', sans-serif;
                }
                .push-soft-icon {
                    width: 38px;
                    height: 38px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, rgba(236,72,153,0.3), rgba(139,92,246,0.3));
                    border: 1px solid rgba(250, 204, 21, 0.7);
                    color: #facc15;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.1rem;
                    flex-shrink: 0;
                    animation: pulseBell 2s infinite;
                }
                @keyframes pulseBell {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.1); filter: drop-shadow(0 0 8px #facc15); }
                }
                .push-soft-content {
                    flex: 1;
                    min-width: 0;
                }
                .push-soft-title {
                    font-size: 0.86rem;
                    font-weight: 800;
                    color: #facc15;
                    font-family: 'Outfit', sans-serif;
                    margin-bottom: 2px;
                }
                .push-soft-desc {
                    font-size: 0.74rem;
                    color: #cbd5e1;
                    line-height: 1.35;
                }
                .push-soft-actions {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    flex-shrink: 0;
                }
                .push-soft-btn-enable {
                    background: linear-gradient(135deg, #ec4899, #8b5cf6);
                    border: 1px solid rgba(250, 204, 21, 0.6);
                    color: #fff;
                    font-weight: 800;
                    font-size: 0.8rem;
                    padding: 8px 14px;
                    border-radius: 20px;
                    cursor: pointer;
                    white-space: nowrap;
                    box-shadow: 0 4px 14px rgba(236,72,153,0.4);
                    transition: transform 0.2s;
                }
                .push-soft-btn-enable:active {
                    transform: scale(0.94);
                }
                .push-soft-btn-close {
                    background: rgba(255,255,255,0.08);
                    border: none;
                    color: #94a3b8;
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.8rem;
                    transition: all 0.2s;
                }
                .push-soft-btn-close:hover {
                    color: #fff;
                    background: rgba(255,255,255,0.18);
                }
                @keyframes slideUpPrompt {
                    from { opacity: 0; transform: translateX(-50%) translateY(30px); }
                    to { opacity: 1; transform: translateX(-50%) translateY(0); }
                }

            </style>`;

            // Wstrzyknięcie dzwonka wyłącznie w navbarze obok Radia CC lub w akcjach nagłówka
            const radioWidget = document.getElementById('radioWidget') || 
                                document.querySelector('.nav-radio-btn') || 
                                document.querySelector('.nav-radio-pill') || 
                                document.querySelector('.radio-widget');
            
            if (radioWidget && radioWidget.parentElement) {
                radioWidget.insertAdjacentHTML('afterend', html);
            } else {
                const rightContainer = document.querySelector('.header-right') || 
                                       document.querySelector('.nav-actions') ||
                                       document.querySelector('.header-actions');
                if (rightContainer) {
                    rightContainer.insertAdjacentHTML('afterbegin', html);
                } else {
                    // Na stronach profili bez dedykowanego slotu w navbarze NIE wstrzykujemy dzwonka do body!
                    return;
                }
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

        // 2. Obsługa Paska Push Notification
        updatePushBar() {
            const bar = document.getElementById('notif-push-bar');
            if (!bar) return;

            if ("Notification" in window && Notification.permission === "default") {
                bar.classList.add('show');
                bar.innerHTML = `
                    <span>🔔 Włącz powiadomienia na żywo</span>
                    <button type="button" class="notif-push-enable-btn" onclick="window.requestLuminaPushPermission()">Włącz</button>
                `;
            } else {
                bar.classList.remove('show');
                bar.innerHTML = '';
            }
        }

        // 3a. Soft-Prompt Banner (Eleganckie zaproszenie do powiadomień)
        initSoftPrompt() {
            if (!("Notification" in window) || Notification.permission !== "default") return;

            try {
                const dismissed = localStorage.getItem('lumina_push_prompt_dismissed');
                if (dismissed && (Date.now() - parseInt(dismissed, 10) < 3 * 24 * 3600 * 1000)) {
                    return; // Odroczone na 3 dni
                }
            } catch(e) {}

            setTimeout(() => {
                if (document.getElementById('luminaPushSoftPrompt') || Notification.permission !== "default") return;

                const promptEl = document.createElement('div');
                promptEl.id = 'luminaPushSoftPrompt';
                promptEl.innerHTML = `
                    <div class="lumina-push-soft-card">
                        <div class="push-soft-icon">
                            <i class="fa-solid fa-bell"></i>
                        </div>
                        <div class="push-soft-content">
                            <div class="push-soft-title">✨ Bądź na bieżąco z Misją</div>
                            <div class="push-soft-desc">Otrzymuj poranne rozważania, transmisje CCTV24 i wiadomości w społeczności LUMINA.</div>
                        </div>
                        <div class="push-soft-actions">
                            <button type="button" class="push-soft-btn-enable" onclick="window.requestLuminaPushPermission()">Włącz 🔔</button>
                            <button type="button" class="push-soft-btn-close" onclick="window.LuminaNotifications.dismissSoftPrompt()" title="Później">✕</button>
                        </div>
                    </div>
                `;
                document.body.appendChild(promptEl);
            }, 3500);
        }

        dismissSoftPrompt() {
            try {
                localStorage.setItem('lumina_push_prompt_dismissed', Date.now().toString());
            } catch(e) {}
            const el = document.getElementById('luminaPushSoftPrompt');
            if (el) {
                el.classList.add('fade-out');
                setTimeout(() => el.remove(), 300);
            }
        }

        // 3b. Uprawnienia Przeglądarki
        async requestBrowserPermission() {
            if (typeof window.requestLuminaPushPermission === 'function') {
                return await window.requestLuminaPushPermission();
            }
            if ("Notification" in window && Notification.permission === "default") {
                try {
                    const perm = await Notification.requestPermission();
                    if (perm === 'granted') {
                        this.push('🔔 Powiadomienia Włączone', 'Będziesz otrzymywać powiadomienia z portalu LUMINA na żywo!', 'lumina_icon.jpg', 'lumina-tablica.html');
                    }
                    this.updatePushBar();
                } catch(e) {}
            }
        }

        // 4. Ładowanie i Zapis Powiadomień
        loadStoredNotifications() {
            try {
                const saved = localStorage.getItem('lumina_inapp_notifications');
                if (saved) {
                    this.notifications = JSON.parse(saved);
                    this.unreadCount = this.notifications.filter(n => n.unread).length;
                } else {
                    this.notifications = [];
                    this.unreadCount = 0;
                }
                this.updateBadge();
                this.renderList();
            } catch(e) {
                this.notifications = [];
                this.unreadCount = 0;
                this.updateBadge();
                this.renderList();
            }
        }

        saveToStorage() {
            try {
                localStorage.setItem('lumina_inapp_notifications', JSON.stringify(this.notifications.slice(0, 50)));
            } catch(e) {}
        }

        // 5. Dodanie Nowego Powiadomienia (z inteligentnym grupowaniem i Rich Cards)
        push(title, body, icon = 'lumina_icon.jpg', actionUrl = 'lumina-tablica.html', playSound = true, groupKey = null) {
            if (groupKey) {
                const existingIndex = this.notifications.findIndex(n => n.groupKey === groupKey);
                if (existingIndex !== -1) {
                    const existing = this.notifications[existingIndex];
                    existing.groupCount = (existing.groupCount || 1) + 1;
                    existing.unread = true;
                    existing.time = 'Przed chwilą';
                    existing.body = `${body} (${existing.groupCount} reakcji)`;
                    this.notifications.splice(existingIndex, 1);
                    this.notifications.unshift(existing);
                    this.updateBadge();
                    this.renderList();
                    this.saveToStorage();
                    if (playSound) this.playChime();
                    return;
                }
            }

            const notif = {
                id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
                title,
                body,
                icon: icon || 'lumina_icon.jpg',
                actionUrl: actionUrl || 'lumina-tablica.html',
                time: 'Przed chwilą',
                unread: true,
                groupKey: groupKey || null,
                groupCount: 1
            };

            this.notifications.unshift(notif);
            this.unreadCount++;
            this.updateBadge();
            this.renderList();
            this.saveToStorage();

            if (playSound) this.playChime();

            // Push do przeglądarki jeśli w tle
            if ("Notification" in window && Notification.permission === "granted" && document.hidden) {
                try {
                    const sysNotif = new Notification(title, {
                        body: body,
                        icon: icon || 'lumina_icon.jpg',
                        badge: 'lumina_icon.jpg',
                        tag: groupKey || notif.id
                    });
                    sysNotif.onclick = () => {
                        window.focus();
                        window.location.href = actionUrl;
                    };
                } catch(e) {}
            }
        }

        updateBadge() {
            const count = this.unreadCount || 0;
            document.body.setAttribute('data-unread-count', String(count));
            const badge = document.getElementById('notif-badge');
            if (badge) {
                badge.setAttribute('data-count', String(count));
                if (count > 0) {
                    badge.style.setProperty('display', 'flex', 'important');
                    badge.textContent = count > 9 ? '9+' : String(count);
                } else {
                    badge.style.setProperty('display', 'none', 'important');
                    badge.textContent = '';
                }
            }

            // Sync with mobile badge if present
            const mBadge = document.querySelector('.m-nav-notif-badge');
            if (mBadge) {
                mBadge.setAttribute('data-count', String(count));
                if (count > 0) {
                    mBadge.style.setProperty('display', 'flex', 'important');
                    mBadge.textContent = count > 9 ? '9+' : String(count);
                } else {
                    mBadge.style.setProperty('display', 'none', 'important');
                    mBadge.textContent = '';
                }
            }

            // Sync with profile message action buttons (Wiadomosc)
            const profileBadges = document.querySelectorAll('.profile-msg-badge, #btnProfileMessageBadge, .btn-msg-badge');
            profileBadges.forEach(b => {
                b.setAttribute('data-count', String(count));
                if (count > 0) {
                    b.style.setProperty('display', 'inline-flex', 'important');
                    b.textContent = count > 9 ? '9+' : String(count);
                } else {
                    b.style.setProperty('display', 'none', 'important');
                    b.textContent = '';
                }
            });

            // Sync with floating chat button badge & bottom navigation badge
            const floatingBadge = document.getElementById('floatingChatBadge');
            const bottomBadge = document.getElementById('bottomNavMsgBadge');
            [floatingBadge, bottomBadge].forEach(b => {
                if (!b) return;
                if (count > 0) {
                    b.style.setProperty('display', 'flex', 'important');
                    b.textContent = count > 9 ? '9+' : String(count);
                } else {
                    b.style.setProperty('display', 'none', 'important');
                    b.textContent = '';
                }
            });
        }

        renderList() {
            const list = document.getElementById('notif-list');
            const headerActions = document.getElementById('notif-header-actions');
            if (headerActions) {
                headerActions.style.display = this.notifications.length > 0 ? 'flex' : 'none';
            }
            if (!list) return;
            if (this.notifications.length === 0) {
                list.innerHTML = '';
                return;
            }

            const escapeHtml = (str) => {
                if (!str) return '';
                return String(str)
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#039;');
            };

            list.innerHTML = this.notifications.map(n => `
                <div class="notif-item ${n.unread ? 'unread' : ''}" onclick="window.LuminaNotifications.handleItemClick('${n.id}', '${n.actionUrl}')">
                    <img src="${n.icon}" class="notif-avatar" alt="Avatar" onerror="this.src='lumina_icon.jpg'">
                    <div class="notif-content">
                        <div><strong>${escapeHtml(n.title)}</strong></div>
                        <div style="margin-top:2px; font-size:12px; color:#cbd5e1;">${escapeHtml(n.body)}</div>
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
                if (this.unreadCount === 0 && typeof window.updateLuminaMessagesBadge === 'function') {
                    window.updateLuminaMessagesBadge(0);
                }
            }
            if (url && url !== '#') {
                try {
                    const parsedUrl = new URL(url, window.location.href);
                    const openChatUser = parsedUrl.searchParams.get('openChat') || parsedUrl.searchParams.get('chatWith');
                    const openPublic = parsedUrl.searchParams.get('openPublicChat');
                    const msgId = parsedUrl.searchParams.get('messageId') || parsedUrl.searchParams.get('msgId');

                    if (openChatUser && typeof window.openChatWith === 'function') {
                        const dd = document.getElementById('notif-dropdown');
                        if (dd) dd.classList.remove('active');
                        window.openChatWith(item?.senderName || openChatUser, item?.icon || 'lumina_icon.jpg', openChatUser, msgId);
                        return;
                    } else if (openPublic) {
                        const dd = document.getElementById('notif-dropdown');
                        if (dd) dd.classList.remove('active');
                        if (typeof window.openDirectMessagesModal === 'function') window.openDirectMessagesModal();
                        if (typeof window.switchMessengerMainTab === 'function') window.switchMessengerMainTab('public');
                        return;
                    }
                } catch(e) {}
                window.location.href = url;
            }
        }

        toggleDropdown(e) {
            if (e) e.stopPropagation();
            const dd = document.getElementById('notif-dropdown');
            if (dd) {
                dd.classList.toggle('active');
                this.updatePushBar();
            }
        }

        markAllAsRead() {
            this.unreadCount = 0;
            this.notifications.forEach(n => n.unread = false);
            this.updateBadge();
            this.renderList();
            this.saveToStorage();
            if (typeof window.updateLuminaMessagesBadge === 'function') {
                window.updateLuminaMessagesBadge(0);
            }
            if (typeof window.showToast === 'function') {
                window.showToast('Wszystkie powiadomienia oznaczone jako przeczytane! ✨');
            }
        }

        clearAll() {
            this.unreadCount = 0;
            this.notifications = [];
            this.updateBadge();
            this.renderList();
            this.saveToStorage();
            if (typeof window.updateLuminaMessagesBadge === 'function') {
                window.updateLuminaMessagesBadge(0);
            }
            if (typeof window.showToast === 'function') {
                window.showToast('Wyczyszczono listę powiadomień 🗑️');
            }
        }

        // 6. Podpięcie pod zdarzenia systemowe LUMINA
        
        initFirestoreRealtimeListener() {
            if (!window.LuminaDB) {
                setTimeout(() => this.initFirestoreRealtimeListener(), 500);
                return;
            }

            const curUser = (typeof window.LuminaDB.getCurrentUser === 'function') ? window.LuminaDB.getCurrentUser() : null;
            const curProfile = (typeof window.LuminaDB.getCurrentProfile === 'function') ? window.LuminaDB.getCurrentProfile() : null;
            const rawMyId = curProfile?.slug || curProfile?.uid || curUser?.slug || curUser?.uid || localStorage.getItem('lumina_current_user_slug') || (window.location.href.includes('wioletta') ? 'wiolettarogowska' : (window.location.href.includes('cezary') ? 'cezaryrgowski' : ''));
            if (!rawMyId) {
                setTimeout(() => this.initFirestoreRealtimeListener(), 1200);
                return;
            }

            const myId = window.LuminaDB.normalizeChatUserId(rawMyId);
            const myUid = curUser?.uid || curProfile?.uid || null;
            console.log('[LUMINA Notifications] Initialized Realtime Cloud Listener for user:', myId, myUid ? `(uid: ${myUid})` : '');

            // 1. Nasłuchuj pokoi czatu użytkownika (nowe wiadomości 1:1)
            if (typeof window.LuminaDB.subscribeToUserChats === 'function') {
                const sessionStartTime = Date.now() - 30000;
                const handleChats = (chats) => {
                    if (!chats || !chats.length) return;
                    chats.forEach(chat => {
                        const lastSender = window.LuminaDB.normalizeChatUserId(chat.lastSenderId);
                        // Jeśli ostatnia wiadomość jest od kogoś innego
                        if (lastSender && lastSender !== myId && (!myUid || lastSender !== myUid)) {
                            let msgTime = Date.now();
                            if (typeof chat.lastMessageTimestamp === 'number') {
                                msgTime = chat.lastMessageTimestamp;
                            } else if (chat.lastMessageTimestamp?.seconds) {
                                msgTime = chat.lastMessageTimestamp.seconds * 1000;
                            } else if (typeof chat.lastMessageTimestamp?.toDate === 'function') {
                                msgTime = chat.lastMessageTimestamp.toDate().getTime();
                            }

                            const notifKey = `lumina_notified_msg_${chat.id || chat.chatId}_${msgTime}`;
                            if (!localStorage.getItem(notifKey) && (msgTime > sessionStartTime)) {
                                localStorage.setItem(notifKey, '1');
                                const senderName = chat.lastSenderName || (lastSender.includes('cezary') ? 'Cezary Rogowski (Mąż 💖)' : (lastSender.includes('wioletta') ? 'Wioletta Rogowska' : 'Użytkownik LUMINA'));
                                const senderAvatar = (typeof window.resolveChatAvatar === 'function') ? window.resolveChatAvatar(chat.lastSenderId, senderName, chat.lastSenderAvatar) : (chat.lastSenderAvatar || 'avatar_cezary_official.jpg');
                                const text = chat.lastMessageText || 'Wysłał(a) Ci nową wiadomość 💬';
                                const targetUrl = `lumina.html?openChat=${encodeURIComponent(lastSender)}&chatWith=${encodeURIComponent(lastSender)}&msgId=${encodeURIComponent(chat.id || '')}`;

                                this.push(
                                    `💬 Nowa wiadomość od: ${senderName}`,
                                    text,
                                    senderAvatar,
                                    targetUrl,
                                    true,
                                    `chat_${lastSender}`
                                );
                            }
                        }
                    });
                };

                window.LuminaDB.subscribeToUserChats(myId, handleChats);
                if (myUid && myUid !== myId) {
                    window.LuminaDB.subscribeToUserChats(myUid, handleChats);
                }
            }
        }

        listenToEvents() {
            window.addEventListener('lumina:coffee_invite', (e) => {
                const det = e.detail || {};
                const sId = det.senderId || det.senderSlug || 'uzytkownik';
                const targetUrl = `lumina.html?openChat=${encodeURIComponent(sId)}&chatWith=${encodeURIComponent(sId)}`;
                this.push(
                    '☕ Zaproszenie na Chrześcijańską Kawę!',
                    `${det.senderName || 'Użytkownik'} zaprasza Cię na Kawę 🕊️`,
                    det.senderAvatar || 'avatar_new1.jpg',
                    targetUrl,
                    true,
                    `coffee_${sId}`
                );
            });

            window.addEventListener('lumina:amen_reaction', (e) => {
                const det = e.detail || {};
                this.push(
                    '🕊️ Nowe Amen pod Twoim wpisem!',
                    `${det.userName || 'Ktoś'} powiedział Amen pod Twoim świadectwem ✨`,
                    'lumina_icon.jpg',
                    'lumina-tablica.html',
                    true,
                    'amen_reaction'
                );
            });

            window.addEventListener('lumina:new_message', (e) => {
                const det = e.detail || {};
                const sId = det.senderId || det.senderSlug || 'uzytkownik';
                const targetUrl = `lumina.html?openChat=${encodeURIComponent(sId)}&chatWith=${encodeURIComponent(sId)}`;
                this.push(
                    `💬 Nowa wiadomość od: ${det.senderName || 'Użytkownik'}`,
                    `${det.text || 'Wysłał nową wiadomość'}`,
                    det.senderAvatar || 'avatar_new1.jpg',
                    targetUrl,
                    true,
                    `chat_${sId}`
                );
            });

            window.addEventListener('lumina:profile_like', (e) => {
                const det = e.detail || {};
                const sId = det.senderId || det.senderSlug || 'uzytkownik';
                const targetUrl = `lumina.html?openChat=${encodeURIComponent(sId)}&chatWith=${encodeURIComponent(sId)}`;
                this.push(
                    '💖 Polubienie profilu!',
                    `${det.senderName || 'Ktoś'} polubił Twój profil w społeczności LUMINA.`,
                    det.senderAvatar || 'lumina_icon.jpg',
                    targetUrl,
                    true,
                    `like_${sId}`
                );
            });

            window.addEventListener('lumina:profile_follow', (e) => {
                const det = e.detail || {};
                const sId = det.senderId || det.senderSlug || 'uzytkownik';
                const targetUrl = `lumina.html?openChat=${encodeURIComponent(sId)}&chatWith=${encodeURIComponent(sId)}`;
                this.push(
                    '🔔 Nowy obserwujący!',
                    `${det.senderName || 'Użytkownik'} zaczął obserwować Twoje wpisy i profil.`,
                    det.senderAvatar || 'lumina_icon.jpg',
                    targetUrl,
                    true,
                    `follow_${sId}`
                );
            });

            window.addEventListener('lumina:notification', (e) => {
                const det = e.detail || {};
                if (det.title) {
                    this.push(det.title, det.body || '', det.icon || 'lumina_icon.jpg', det.actionUrl || 'lumina-tablica.html');
                }
            });
        }
    }

    function escapeHtml(text) {
        if (!text) return '';
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // Global helper for firing notifications from anywhere
    window.luminaNotify = function(title, body, icon, actionUrl) {
        if (window.LuminaNotifications && typeof window.LuminaNotifications.push === 'function') {
            window.LuminaNotifications.push(title, body, icon, actionUrl);
        }
    };

    // ── HARMONOGRAM POWIADOMIEŃ PUSH RAMÓWKI CC TV24 ──
    const CC_TV24_NOTIF_SCHEDULE = [
        {
            startHour: 6,
            title: "🌅 Zjednoczeni za Polskę — Na Żywo w CC TV24!",
            body: "Rozpoczynamy pasmo poranne: Modlitwa za Polskę, inspiracje i Słowo Boże na dobry dzień.",
            icon: "tv24_cc.png",
            url: "/master"
        },
        {
            startHour: 10,
            title: "🎵 Biblia Śpiewana & Worship — Na Żywo!",
            body: "Włącz telewizję CC TV24: Śpiewane Przypowieści Salomona i utwory uwielbienia.",
            icon: "Logo_Biblia_Spiewana.jpg",
            url: "/biblia-spiewana"
        },
        {
            startHour: 12,
            title: "📖 Studium Telewizyjne Pisma Świętego",
            body: "Teraz w CC TV24: Głębokie rozważanie Słowa Bożego, wersety i nauczanie biblijne.",
            icon: "studium_logo.png",
            url: "/studium"
        },
        {
            startHour: 14,
            title: "📜 Apokalipsa: Dzień po Dniu — CC TV24",
            body: "Odkrywaj proroctwa i Księgę Nadziei. Transmisja telewizyjna na żywo.",
            icon: "tv24_cc.png",
            url: "/apokalipsa"
        },
        {
            startHour: 16,
            title: "🎶 Śpiewajmy Panu — Pasmo Uwielbienia",
            body: "Codzienne 60 minut najpiękniejszych pieśni chwały i nowości muzycznych w CC TV24.",
            icon: "tv24_cc.png",
            url: "/spiewajmy-panu"
        },
        {
            startHour: 18,
            title: "⚡ Prof. Walter Veith | Totalny Atak — CC TV24",
            body: "Premiera wykładu prof. Waltera Veitha na czas końca. Odkryj prawdę Pisma Świętego!",
            icon: "walter_veith.png",
            url: "/totalny-atak"
        },
        {
            startHour: 20,
            title: "🎬 Kino Chrześcijańskie & Świadectwa Wiary",
            body: "Wieczorny seans filmowy oraz poruszające historie nawróceń i uzdrowień w CC TV24.",
            icon: "tv24_cc.png",
            url: "/kino"
        },
        {
            startHour: 22,
            title: "🕊️ Nocne Czuwanie & Modlitwa 24/7",
            body: "Spokojna noc, relaksacyjna muzyka chwały i wyciszenie przed snem w CC TV24.",
            icon: "tv24_cc.png",
            url: "/czuwanie"
        }
    ];

    function checkAndScheduleTVScheduleNotifications() {
        try {
            const now = new Date();
            const currentHour = now.getHours();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const todayStr = `${year}-${month}-${day}`;

            // Znajdź pozycję z ramówki odpowiadającą bieżącej godzinie
            const slot = CC_TV24_NOTIF_SCHEDULE.find(item => item.startHour === currentHour);
            if (!slot) return;

            const notifKey = `lumina_tv_notif_${slot.startHour}_${todayStr}`;
            const lastSent = localStorage.getItem(notifKey);

            if (!lastSent) {
                localStorage.setItem(notifKey, todayStr);
                if (typeof window.luminaNotify === 'function') {
                    window.luminaNotify(
                        slot.title,
                        slot.body,
                        slot.icon,
                        slot.url
                    );
                }
            }
        } catch (e) {
            console.error('Błąd harmonogramu powiadomień TV24:', e);
        }
    }

    function checkAndScheduleDailyBlessing() {
        try {
            const now = new Date();
            const currentHour = now.getHours();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const todayStr = `${year}-${month}-${day}`;

            // Wysyłaj codziennie od godziny 22:00 wzwyż (jeśli nie wysłano dzisiaj)
            if (currentHour >= 22) {
                const lastSentDate = localStorage.getItem('lumina_last_daily_blessing_date');
                if (lastSentDate !== todayStr) {
                    localStorage.setItem('lumina_last_daily_blessing_date', todayStr);
                    if (typeof window.luminaNotify === 'function') {
                        window.luminaNotify(
                            'Błogosławieństwo na Dobranoc 🌙🙏',
                            '„Niech Pan cię błogosławi i strzeże. Niech Pan rozpromieni oblicze swe nad tobą, niech cię obdarzy swą łaską i pokojem.” Spokojnej nocy! ✨🕊️',
                            'lumina_icon.jpg',
                            '#'
                        );
                    }
                }
            }
        } catch (e) {
            console.error('Błąd harmonogramu błogosławieństwa:', e);
        }
    }

    function runAllLuminaSchedulers() {
        checkAndScheduleDailyBlessing();
        checkAndScheduleTVScheduleNotifications();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => { 
            window.LuminaNotifications = new LuminaNotificationEngine();

        // Auto-synchronizacja FCM Push Token przy starcie, jeśli uprawnienie jest nadane
        setTimeout(() => {
            if ("Notification" in window && Notification.permission === "granted") {
                if (window.LuminaDB && typeof window.LuminaDB.requestNotificationPermission === 'function') {
                    const curUser = (typeof window.LuminaDB.getCurrentUser === 'function') ? window.LuminaDB.getCurrentUser() : null;
                    const uid = curUser ? (curUser.uid || curUser.slug || curUser.id) : localStorage.getItem('lumina_current_user_slug');
                    window.LuminaDB.requestNotificationPermission(uid).catch(() => {});
                }
            }
        }, 1500);
 
            // Sprawdź przy załadowaniu i powtarzaj co 30 sekund
            setTimeout(runAllLuminaSchedulers, 2500);
            setInterval(runAllLuminaSchedulers, 30000);
        });
    } else {
        window.LuminaNotifications = new LuminaNotificationEngine();
        setTimeout(runAllLuminaSchedulers, 2500);
        setInterval(runAllLuminaSchedulers, 30000);
    }
})();


// ── Globalna funkcja włączenia powiadomień PUSH w telefonie ──
window.requestLuminaPushPermission = async function() {
    try {
        if (!('Notification' in window)) {
            alert('Twoja przeglądarka nie obsługuje powiadomień Push.');
            return false;
        }
        const perm = await Notification.requestPermission();
        if (perm === 'granted') {
            const promptEl = document.getElementById('luminaPushSoftPrompt');
            if (promptEl) promptEl.remove();

            if (window.LuminaDB && typeof window.LuminaDB.requestNotificationPermission === 'function') {
                const userSlug = localStorage.getItem('lumina_current_user_slug') || 'anonymous';
                await window.LuminaDB.requestNotificationPermission(userSlug);
            }
            if (window.LuminaNotifications) {
                window.LuminaNotifications.updatePushBar();
                window.LuminaNotifications.push('🔔 Powiadomienia Aktywne', 'Dziękujemy! Będziesz otrzymywać powiadomienia o rozważaniach, transmisjach CCTV24 i wiadomościach.', 'lumina_icon.jpg', 'lumina-tablica.html');
            }
            if (typeof window.showLuminaToast === 'function') {
                window.showLuminaToast('🔔 Powiadomienia PUSH zostały pomyślnie aktywowane!');
            } else if (typeof window.showToast === 'function') {
                window.showToast('🔔 Powiadomienia PUSH zostały pomyślnie aktywowane!');
            }
            return true;
        } else {
            const promptEl = document.getElementById('luminaPushSoftPrompt');
            if (promptEl) promptEl.remove();
            return false;
        }
    } catch(e) {
        console.error('Error requesting push permission:', e);
        return false;
    }
};

// ── Cicha synchronizacja tokena FCM w tle przy starcie ──
window.syncLuminaPushTokenSilently = async function() {
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    try {
        if (window.LuminaDB && typeof window.LuminaDB.requestNotificationPermission === 'function') {
            const userSlug = localStorage.getItem('lumina_current_user_slug') || 'anonymous';
            await window.LuminaDB.requestNotificationPermission(userSlug);
        }
    } catch(e) {}
};

// Uruchomienie cichej synchronizacji przy załadowaniu strony
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(window.syncLuminaPushTokenSilently, 2000));
} else {
    setTimeout(window.syncLuminaPushTokenSilently, 2000);
}

