/**
 * ══════════════════════════════════════════════════════════════════════════
 * LUMINA BACKGROUND MISSIONAL SERVICE (js/lumina-background-mission-service.js)
 * Służba Misyjna PWA w Tle Smartfona:
 * 1. 🔄 Periodic Background Sync (Automatyczne pobieranie rozważań o świcie)
 * 2. 🎵 MediaSession API (Granie Radia CC i Uwielbienia 24/7 na zablokowanym ekranie)
 * 3. 🔔 Web Push & Background Wakeup (Powiadomienia o 06:00 i transmisjach LIVE)
 * 4. 📱 PWA Standalone Engine (Instalacja na pulpicie telefonu)
 * ══════════════════════════════════════════════════════════════════════════
 */

(function initLuminaBackgroundMissionService() {
    'use strict';

    // ── 1. REGISTRATION OF SERVICE WORKER & PERIODIC SYNC ──
    async function registerBackgroundServiceWorker() {
        if (!('serviceWorker' in navigator)) return;

        try {
            const reg = await navigator.serviceWorker.register('/firebase-messaging-sw.js?v=4.1.6_20260914_fullsync', { scope: '/', updateViaCache: 'none' });
            console.log('[LUMINA Background Mission] Service Worker zarejestrowany:', reg.scope);

            // Rejestracja Periodic Background Sync (Android Chrome/Edge/Samsung Browser)
            if ('periodicSync' in reg) {
                try {
                    const status = await navigator.permissions.query({ name: 'periodic-background-sync' });
                    if (status.state === 'granted') {
                        await reg.periodicSync.register('lumina-daily-mission-sync', {
                            minInterval: 12 * 60 * 60 * 1000 // co 12h (rano i wieczorem)
                        });
                        console.log('[LUMINA Background Mission] Periodic Sync aktywny (Rozważania poranne w tle)');
                    }
                } catch(e) {
                    console.log('[LUMINA Background Mission] Periodic sync registration info:', e.message);
                }
            }
        } catch(err) {
            console.warn('[LUMINA Background Mission] Błąd rejestracji Service Workera:', err);
        }
    }

    // ── 2. SYSTEM MEDIA SESSION API (Lock Screen & Background Audio) ──
    function setupSystemMediaSession() {
        if (!('mediaSession' in navigator)) return;

        window.updateLuminaMediaSession = function(options = {}) {
            const title = options.title || 'Radio Christian Culture 24/7';
            const artist = options.artist || 'Polskie Radio CC • Słowo i Uwielbienie';
            const album = options.album || 'Cuda Każdego Dnia & Muzyka Chwały';
            const artworkSrc = options.artwork || 'icon.png';

            navigator.mediaSession.metadata = new MediaMetadata({
                title: title,
                artist: artist,
                album: album,
                artwork: [
                    { src: artworkSrc, sizes: '96x96', type: 'image/png' },
                    { src: artworkSrc, sizes: '192x192', type: 'image/png' },
                    { src: artworkSrc, sizes: '512x512', type: 'image/png' }
                ]
            });

            // Action Handlers
            navigator.mediaSession.setActionHandler('play', () => {
                if (typeof window.toggleRadio === 'function') window.toggleRadio();
            });
            navigator.mediaSession.setActionHandler('pause', () => {
                if (typeof window.toggleRadio === 'function') window.toggleRadio();
            });
            navigator.mediaSession.setActionHandler('stop', () => {
                if (typeof window.toggleRadio === 'function') window.toggleRadio();
            });
        };

        // Domyślna inicjalizacja
        window.updateLuminaMediaSession();
    }

    // ── 3. PWA ADD-TO-HOME-SCREEN PROMPT (Instalacja Aplikacji Misyjnej) ──
    let deferredInstallPrompt = null;

    function setupPwaInstallBanner() {
        // Sprawdź czy to urządzenie mobilne i czy aplikacja nie jest już standalone
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
        if (isStandalone) return; // Już zainstalowana jako natywna aplikacja

        const dismissed = localStorage.getItem('lumina_pwa_banner_dismissed');
        if (dismissed && Date.now() - parseInt(dismissed, 10) < 7 * 24 * 3600 * 1000) return;

        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredInstallPrompt = e;
            showPwaInstallBanner();
        });
    }

    function showPwaInstallBanner() {
        if (document.getElementById('luminaPwaInstallBanner')) return;

        const banner = document.createElement('aside');
        banner.id = 'luminaPwaInstallBanner';
        banner.style.cssText = `
            position: fixed;
            bottom: calc(76px + env(safe-area-inset-bottom, 12px));
            left: 12px;
            right: 12px;
            max-width: 500px;
            margin: 0 auto;
            background: linear-gradient(135deg, rgba(15,23,42,0.96), rgba(30,41,59,0.96));
            border: 1.5px solid rgba(250,204,21,0.5);
            border-radius: 20px;
            padding: 14px 16px;
            z-index: 99990;
            box-shadow: 0 16px 40px rgba(0,0,0,0.8), 0 0 20px rgba(250,204,21,0.2);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            animation: fadeInPwa 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            font-family: 'Outfit', sans-serif;
        `;

        banner.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px; min-width:0;">
                <img src="lumina_icon.jpg" alt="LUMINA PWA" style="width:42px; height:42px; border-radius:12px; object-fit:cover; border:1.5px solid #facc15; flex-shrink:0;">
                <div style="min-width:0;">
                    <div style="font-size:0.88rem; font-weight:800; color:#fff; line-height:1.2;">
                        Zainstaluj LUMINA na telefonie ✨
                    </div>
                    <div style="font-size:0.72rem; color:#facc15; font-weight:600; margin-top:2px;">
                        Codzienne rozważania o 06:00 & Radio w tle
                    </div>
                </div>
            </div>
            <div style="display:flex; align-items:center; gap:6px; flex-shrink:0;">
                <button type="button" onclick="window.triggerLuminaPwaInstall()" style="padding:8px 14px; border-radius:12px; background:linear-gradient(135deg, #facc15, #f59e0b); border:none; color:#000; font-weight:800; font-size:0.78rem; cursor:pointer; box-shadow:0 4px 12px rgba(250,204,21,0.35); font-family:inherit;">
                    Dodaj 📲
                </button>
                <button type="button" onclick="window.dismissLuminaPwaInstall()" style="background:transparent; border:none; color:#94a3b8; font-size:1.1rem; cursor:pointer; padding:4px 6px;">
                    ✕
                </button>
            </div>
        `;

        document.body.appendChild(banner);
    }

    window.triggerLuminaPwaInstall = async function() {
        if (deferredInstallPrompt) {
            deferredInstallPrompt.prompt();
            const choice = await deferredInstallPrompt.userChoice;
            if (choice.outcome === 'accepted') {
                console.log('[LUMINA PWA] Użytkownik zainstalował aplikację');
            }
            deferredInstallPrompt = null;
        } else {
            // Instrukcja dla iOS Safari / Android Chrome bez natywnego promptu
            if (typeof window.showToast === 'function') {
                window.showToast('📲 Kliknij ikonę Udostępnij (lub Menu 3 kropki) i wybierz "Dodaj do ekranu początkowego" ✨');
            }
        }
        window.dismissLuminaPwaInstall();
    };

    window.dismissLuminaPwaInstall = function() {
        const banner = document.getElementById('luminaPwaInstallBanner');
        if (banner) banner.remove();
        localStorage.setItem('lumina_pwa_banner_dismissed', Date.now().toString());
    };

    // ── 3B. SUNDAY MISSION APPEAL NOTIFICATION (W każdą niedzielę o 09:00) ──
    async function checkSundayMissionAppealNotification() {
        try {
            const now = new Date();
            const isSunday = (now.getDay() === 0 && now.getHours() >= 9);
            const urlParams = (typeof window !== 'undefined' && window.location) ? new URLSearchParams(window.location.search) : null;
            const force = urlParams && urlParams.get('testSundayPush') === '1';

            if (!isSunday && !force) return;

            const pad = (n) => n < 10 ? '0' + n : n;
            const sundayKey = `lumina_sunday_appeal_pushed_${now.getFullYear()}_${pad(now.getMonth() + 1)}_${pad(now.getDate())}`;

            if (localStorage.getItem(sundayKey) && !force) return;

            if ('Notification' in window && Notification.permission === 'granted') {
                const notifTitle = '🌿 APEL MISYJNY CHRISTIAN CULTURE • Niedziela';
                const notifOptions = {
                    body: 'Razem budujemy Christian Culture 🌿🤍 Dzisiejsza niedziela to czas wdzięczności za wspólnotę. Kliknij, aby wesprzeć Bożą misję!',
                    icon: 'lumina_icon.jpg',
                    badge: 'lumina_icon.jpg',
                    image: 'apel_misyjny_cc.webp',
                    tag: 'lumina_sunday_mission_appeal',
                    renotify: true,
                    requireInteraction: true,
                    vibrate: [300, 100, 300],
                    data: {
                        url: 'https://polskieradio.cc/lumina-tablica.html?post=post_sunday_mission_appeal#sundayAppeal',
                        type: 'sunday_appeal'
                    },
                    actions: [
                        { action: 'revolut', title: '🌍 Szybkie wsparcie' },
                        { action: 'open_appeal', title: '📖 Zobacz Apel na Tablicy' }
                    ]
                };

                if ('serviceWorker' in navigator) {
                    const reg = await navigator.serviceWorker.ready.catch(() => null);
                    if (reg && reg.showNotification) {
                        await reg.showNotification(notifTitle, notifOptions);
                    } else {
                        new Notification(notifTitle, notifOptions);
                    }
                } else {
                    new Notification(notifTitle, notifOptions);
                }
                localStorage.setItem(sundayKey, Date.now().toString());
                console.log('[LUMINA Background] Wyemitowano niedzielne powiadomienie apelu misyjnego.');
            }
        } catch(e) {
            console.warn('[LUMINA Background Sunday Check Error]:', e);
        }
    }

    // ── 3C. DAILY MISSION EVENING NOTIFICATION (Codziennie o 19:00 z przyciskiem modlitwy i BLIK) ──
    async function checkDailyMissionEveningNotification() {
        try {
            const now = new Date();
            const isEvening = (now.getHours() >= 19);
            const urlParams = (typeof window !== 'undefined' && window.location) ? new URLSearchParams(window.location.search) : null;
            const force = urlParams && (urlParams.get('testDailyPush') === '1' || urlParams.get('testMissionPush') === '1');

            if (!isEvening && !force) return;

            const pad = (n) => n < 10 ? '0' + n : n;
            const dailyKey = `lumina_daily_mission_pushed_${now.getFullYear()}_${pad(now.getMonth() + 1)}_${pad(now.getDate())}`;

            if (localStorage.getItem(dailyKey) && !force) return;

            if ('Notification' in window && Notification.permission === 'granted') {
                const notifTitle = '🕊️ Codzienna Misja • Christian Culture';
                const notifOptions = {
                    body: 'Wieczorny czas wdzięczności i wspólnej modlitwy. Poświęć chwilę na modlitwę za Polskę i wesprzyj dzieło Boże!',
                    icon: 'lumina_icon.jpg',
                    badge: 'lumina-push-badge-v4.1.5.svg',
                    image: 'apel_misyjny_cc.webp',
                    tag: 'lumina-daily-mission-evening',
                    renotify: true,
                    requireInteraction: true,
                    vibrate: [250, 100, 250],
                    data: {
                        url: 'https://polskieradio.cc/modlitwa',
                        type: 'daily_mission'
                    },
                    actions: [
                        { action: 'prayer', title: '🙏 Pomódl się' },
                        { action: 'blik', title: '📱 Misyjny BLIK' }
                    ]
                };

                if ('serviceWorker' in navigator) {
                    const reg = await navigator.serviceWorker.ready.catch(() => null);
                    if (reg && reg.showNotification) {
                        await reg.showNotification(notifTitle, notifOptions);
                    } else {
                        new Notification(notifTitle, notifOptions);
                    }
                } else {
                    new Notification(notifTitle, notifOptions);
                }
                localStorage.setItem(dailyKey, Date.now().toString());
                console.log('[LUMINA Background] Wyemitowano wieczorne powiadomienie Codziennej Misji o 19:00.');
            }
        } catch(e) {
            console.warn('[LUMINA Background Daily Mission Push Error]:', e);
        }
    }
    window.checkDailyMissionEveningNotification = checkDailyMissionEveningNotification;

    // ── 4. INITIALIZATION ──
    function initServices() {
        registerBackgroundServiceWorker();
        setupSystemMediaSession();
        setTimeout(setupPwaInstallBanner, 2000);
        setTimeout(checkSundayMissionAppealNotification, 3000);
        setTimeout(checkDailyMissionEveningNotification, 3500);
        // Cykliczne sprawdzanie w tle co 60 sekund (np. gdy użytkownik ma otwartą kartę o 18:59)
        setInterval(checkDailyMissionEveningNotification, 60000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initServices);
    } else {
        initServices();
    }
})();
