// ══════════════════════════════════════════════════════════════════════════
// LUMINA UNIVERSAL MOBILE PWA INSTALLER & AUTO-UPDATE ENGINE (v4.1.0)
// High-reliability Service Worker manager, Version Monitor & Update Banner
// ══════════════════════════════════════════════════════════════════════════

(function() {
    'use strict';

    const CURRENT_CLIENT_VERSION = '4.1.0';
    const DISMISS_INSTALL_KEY = 'lumina_pwa_install_dismissed';
    const DISMISS_UPDATE_KEY = 'lumina_pwa_update_dismissed_version';
    const LAST_SEEN_VERSION_KEY = 'lumina_app_version_seen';

    let deferredInstallPrompt = null;
    let swRegistration = null;
    let updatePromptActive = false;

    // 1. Standalone / Installed Detection
    function isRunningStandalone() {
        return (
            window.matchMedia('(display-mode: standalone)').matches ||
            window.navigator.standalone === true ||
            document.referrer.includes('android-app://') ||
            window.location.search.includes('source=pwa')
        );
    }

    // 2. iOS Detection
    function isIOSDevice() {
        const ua = window.navigator.userAgent.toLowerCase();
        return /iphone|ipad|ipod/.test(ua) && !window.MSStream;
    }

    // 3. Register and Monitor Service Worker
    function registerLuminaServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', async () => {
                try {
                    const registrations = await navigator.serviceWorker.getRegistrations();
                    for (const reg of registrations) {
                        if (reg.active && !reg.active.scriptURL.includes('v=20260830_v410')) {
                            console.log('[LUMINA PWA] Wyrejestrowywanie starego Service Workera:', reg.active.scriptURL);
                            await reg.unregister();
                        }
                    }
                } catch (e) {}

                navigator.serviceWorker.register('firebase-messaging-sw.js?v=20260830_v410', { scope: './' })
                    .then((reg) => {
                        swRegistration = reg;
                        console.log('[LUMINA PWA] Service Worker zarejestrowany pomyślnie. Scope:', reg.scope);

                        reg.addEventListener('updatefound', () => {
                            const newWorker = reg.installing;
                            if (newWorker) {
                                newWorker.addEventListener('statechange', () => {
                                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                        console.log('[LUMINA PWA] Wykryto nową wersję w Service Worker.');
                                        checkForUpdatesFromServer(false, newWorker);
                                    }
                                });
                            }
                        });
                    })
                    .catch((err) => {
                        console.warn('[LUMINA PWA] Rejestracja Service Worker (informacja):', err);
                    });
            });
        }
    }

    // 4. Remote Version Checker (W 100% cicha aktualizacja w tle — ZERO wyskakujących okienek)
    async function checkForUpdatesFromServer(forcePrompt = false, waitingWorker = null) {
        try {
            const targetWorker = waitingWorker || (swRegistration && swRegistration.waiting);
            if (targetWorker) {
                targetWorker.postMessage({ type: 'SKIP_WAITING' });
            }
            if (swRegistration) {
                swRegistration.update().catch(() => {});
            }
            // Zabezpieczenie przed wiszącym banerem w DOM
            const banner = document.getElementById('luminaUpdateBanner');
            if (banner) banner.remove();
        } catch (e) {}
    }

    // 5. Inject Styles
    function injectPWAStyles() {
        if (document.getElementById('lumina-pwa-styles')) return;
        const style = document.createElement('style');
        style.id = 'lumina-pwa-styles';
        style.textContent = `
            :root {
                --sat: env(safe-area-inset-top, 0px);
                --sab: env(safe-area-inset-bottom, 0px);
                --sal: env(safe-area-inset-left, 0px);
                --sar: env(safe-area-inset-right, 0px);
            }
            body {
                padding-top: var(--sat);
                padding-bottom: var(--sab);
                padding-left: var(--sal);
                padding-right: var(--sar);
                -webkit-touch-callout: none;
                -webkit-tap-highlight-color: transparent;
            }

            .lumina-update-banner {
                position: fixed;
                top: calc(16px + var(--sat));
                left: 50%;
                transform: translateX(-50%) translateY(-150%);
                width: calc(100% - 28px);
                max-width: 520px;
                background: linear-gradient(135deg, rgba(15, 23, 42, 0.96), rgba(30, 27, 75, 0.98));
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                border: 1.5px solid rgba(245, 158, 11, 0.5);
                border-radius: 20px;
                padding: 16px 18px;
                display: flex;
                flex-direction: column;
                gap: 12px;
                box-shadow: 0 16px 40px rgba(0, 0, 0, 0.8), 0 0 25px rgba(245, 158, 11, 0.3);
                z-index: 1000000;
                transition: transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
                color: #fff;
                font-family: inherit;
            }
            .lumina-update-banner.visible {
                transform: translateX(-50%) translateY(0);
            }
            .lumina-update-header {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            .lumina-update-icon-wrap {
                width: 44px;
                height: 44px;
                border-radius: 12px;
                background: linear-gradient(135deg, #f59e0b, #d97706);
                display: flex;
                align-items: center;
                justify-content: center;
                color: #000;
                font-size: 1.25rem;
                flex-shrink: 0;
                box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);
            }
            .lumina-update-title-box {
                flex: 1;
                min-width: 0;
            }
            .lumina-update-title {
                font-size: 0.96rem;
                font-weight: 800;
                color: #fef08a;
                display: flex;
                align-items: center;
                gap: 6px;
                margin-bottom: 2px;
            }
            .lumina-update-version-tag {
                font-size: 0.7rem;
                background: rgba(245, 158, 11, 0.25);
                color: #facc15;
                padding: 2px 7px;
                border-radius: 6px;
                font-weight: 800;
                border: 1px solid rgba(245, 158, 11, 0.4);
            }
            .lumina-update-desc {
                font-size: 0.8rem;
                color: #cbd5e1;
                line-height: 1.35;
            }
            .lumina-update-changelog {
                background: rgba(0, 0, 0, 0.35);
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 12px;
                padding: 8px 12px;
                font-size: 0.76rem;
                color: #e2e8f0;
                max-height: 110px;
                overflow-y: auto;
                line-height: 1.4;
            }
            .lumina-update-changelog ul {
                margin: 0;
                padding-left: 16px;
            }
            .lumina-update-changelog li {
                margin-bottom: 4px;
            }
            .lumina-update-actions {
                display: flex;
                align-items: center;
                justify-content: flex-end;
                gap: 8px;
            }
            .lumina-update-btn-refresh {
                background: linear-gradient(135deg, #f59e0b, #d97706);
                color: #000;
                border: none;
                padding: 9px 18px;
                border-radius: 12px;
                font-size: 0.84rem;
                font-weight: 800;
                cursor: pointer;
                box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);
                transition: transform 0.2s, box-shadow 0.2s;
                white-space: nowrap;
                display: flex;
                align-items: center;
                gap: 6px;
            }
            .lumina-update-btn-refresh:active {
                transform: scale(0.96);
            }
            .lumina-update-btn-dismiss {
                background: rgba(255, 255, 255, 0.08);
                border: 1px solid rgba(255, 255, 255, 0.15);
                color: #94a3b8;
                padding: 9px 14px;
                border-radius: 12px;
                font-size: 0.8rem;
                font-weight: 700;
                cursor: pointer;
                transition: color 0.2s, background 0.2s;
            }

            .lumina-pwa-banner {
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%) translateY(120%);
                width: calc(100% - 32px);
                max-width: 480px;
                background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 27, 75, 0.98));
                backdrop-filter: blur(16px);
                -webkit-backdrop-filter: blur(16px);
                border: 1.5px solid rgba(168, 85, 247, 0.4);
                border-radius: 20px;
                padding: 14px 18px;
                display: flex;
                align-items: center;
                gap: 14px;
                box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6), 0 0 25px rgba(168, 85, 247, 0.25);
                z-index: 99999;
                transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                color: #fff;
                font-family: inherit;
            }
            .lumina-pwa-banner.visible {
                transform: translateX(-50%) translateY(0);
            }
            .lumina-pwa-icon {
                width: 48px;
                height: 48px;
                border-radius: 12px;
                object-fit: cover;
                box-shadow: 0 4px 12px rgba(0,0,0,0.4);
                border: 1px solid rgba(255,255,255,0.2);
                flex-shrink: 0;
            }
            .lumina-pwa-content {
                flex: 1;
                min-width: 0;
            }
            .lumina-pwa-title {
                font-size: 0.92rem;
                font-weight: 800;
                color: #ffffff;
                display: flex;
                align-items: center;
                gap: 6px;
                margin-bottom: 2px;
            }
            .lumina-pwa-desc {
                font-size: 0.76rem;
                color: #cbd5e1;
                line-height: 1.3;
            }
            .lumina-pwa-actions {
                display: flex;
                align-items: center;
                gap: 8px;
                flex-shrink: 0;
            }
            .lumina-pwa-btn-install {
                background: linear-gradient(135deg, #a855f7, #ec4899);
                color: #ffffff;
                border: none;
                padding: 9px 16px;
                border-radius: 12px;
                font-size: 0.82rem;
                font-weight: 800;
                cursor: pointer;
                box-shadow: 0 4px 15px rgba(168, 85, 247, 0.4);
                transition: transform 0.2s, box-shadow 0.2s;
                white-space: nowrap;
                display: flex;
                align-items: center;
                gap: 6px;
            }
            .lumina-pwa-btn-close {
                background: rgba(255,255,255,0.1);
                border: 1px solid rgba(255,255,255,0.15);
                color: #94a3b8;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                font-size: 0.85rem;
                transition: color 0.2s, background 0.2s;
            }

            .lumina-ios-modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: rgba(0, 0, 0, 0.75);
                backdrop-filter: blur(10px);
                -webkit-backdrop-filter: blur(10px);
                z-index: 100000;
                display: flex;
                align-items: flex-end;
                justify-content: center;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.3s ease;
            }
            .lumina-ios-modal-overlay.open {
                opacity: 1;
                pointer-events: auto;
            }
            .lumina-ios-card {
                background: #0f172a;
                border: 1.5px solid rgba(168, 85, 247, 0.35);
                border-radius: 28px 28px 0 0;
                width: 100%;
                max-width: 520px;
                padding: 24px 22px calc(24px + var(--sab)) 22px;
                color: #fff;
                box-shadow: 0 -10px 40px rgba(0,0,0,0.8);
                transform: translateY(100%);
                transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
            }
            .lumina-ios-modal-overlay.open .lumina-ios-card {
                transform: translateY(0);
            }
            .lumina-ios-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 18px;
            }
            .lumina-ios-step {
                display: flex;
                align-items: flex-start;
                gap: 14px;
                margin-bottom: 16px;
                background: rgba(255,255,255,0.04);
                padding: 12px 14px;
                border-radius: 16px;
                border: 1px solid rgba(255,255,255,0.08);
            }
            .lumina-ios-step-num {
                width: 30px;
                height: 30px;
                border-radius: 50%;
                background: linear-gradient(135deg, #a855f7, #ec4899);
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 800;
                font-size: 0.85rem;
                flex-shrink: 0;
            }
            .lumina-ios-step-text {
                font-size: 0.88rem;
                color: #e2e8f0;
                line-height: 1.4;
            }
        `;
        document.head.appendChild(style);
    }

    // 6. Show Update Notification (Wyciszona — brak nachalnych okien modalnych w przeglądarce)
    function showUpdateNotification(versionInfo, waitingWorker) {
        const banner = document.getElementById('luminaUpdateBanner');
        if (banner) banner.remove();
        if (waitingWorker) {
            try { waitingWorker.postMessage({ type: 'SKIP_WAITING' }); } catch(e) {}
        }
        if (swRegistration && swRegistration.waiting) {
            try { swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' }); } catch(e) {}
        }
    }

    // 7. Create Install Banner
    function createInstallBanner() {
        return;
    }

    // 8. Create iOS Install Modal
    function createIOSModal() {
        if (document.getElementById('luminaIosModal')) return;

        const modal = document.createElement('div');
        modal.id = 'luminaIosModal';
        modal.className = 'lumina-ios-modal-overlay';
        modal.innerHTML = `
            <div class="lumina-ios-card">
                <div class="lumina-ios-header">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <img src="lumina-apple-touch-icon.png" style="width:36px; height:36px; border-radius:10px;" alt="LUMINA">
                        <div>
                            <div style="font-weight:800; font-size:1rem; color:#fff;">Zainstaluj LUMINA na iOS</div>
                            <div style="font-size:0.75rem; color:#a855f7;">iPhone & iPad Safari</div>
                        </div>
                    </div>
                    <button type="button" class="lumina-pwa-btn-close" onclick="document.getElementById('luminaIosModal').classList.remove('open')">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <div class="lumina-ios-step">
                    <div class="lumina-ios-step-num">1</div>
                    <div class="lumina-ios-step-text">
                        Dotknij przycisku <strong>Udostępnij</strong> (<i class="fa-solid fa-arrow-up-from-bracket" style="color:#38bdf8;"></i> na dolnym pasku przeglądarki Safari).
                    </div>
                </div>

                <div class="lumina-ios-step">
                    <div class="lumina-ios-step-num">2</div>
                    <div class="lumina-ios-step-text">
                        Przewiń menu w dół i wybierz <strong>„Do ekranu początkowego”</strong> (<i class="fa-regular fa-square-plus" style="color:#facc15;"></i> Add to Home Screen).
                    </div>
                </div>

                <div class="lumina-ios-step">
                    <div class="lumina-ios-step-num">3</div>
                    <div class="lumina-ios-step-text">
                        Dotknij <strong>„Dodaj”</strong> w prawym górnym rogu. Gotowe! LUMINA uruchamia się jak natywna aplikacja bez pasków przeglądarki. 🕊️📱
                    </div>
                </div>

                <button type="button" class="lumina-pwa-btn-install" style="width:100%; justify-content:center; padding:12px; margin-top:8px;" onclick="document.getElementById('luminaIosModal').classList.remove('open')">
                    Rozumiem, dziękuję! ✨ </button>
            </div>
        `;
        document.body.appendChild(modal);

        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('open');
        });
    }

    // 9. Trigger Install Flow
    function triggerInstallFlow() {
        if (deferredInstallPrompt) {
            deferredInstallPrompt.prompt();
            deferredInstallPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('[LUMINA PWA] Użytkownik zaakceptował instalację aplikacji.');
                }
                deferredInstallPrompt = null;
            });
        } else if (isIOSDevice()) {
            createIOSModal();
            const modal = document.getElementById('luminaIosModal');
            if (modal) modal.classList.add('open');
        } else {
            if (typeof window.showToast === 'function') {
                window.showToast('Aby zainstalować aplikację, wybierz ikonę instalacji na pasku adresu przeglądarki 📲');
            }
        }
    }

    function showInstallBanner() {
        return;
    }

    function dismissInstallBanner() {
        const banner = document.getElementById('luminaPwaBanner');
        if (banner) banner.remove();
        sessionStorage.setItem(DISMISS_INSTALL_KEY, 'true');
    }

    // 10. Initialization
    function init() {
        registerLuminaServiceWorker();
        injectPWAStyles();

        // Natychmiastowe usunięcie ewentualnych starych banerów
        const oldBanner = document.getElementById('luminaUpdateBanner');
        if (oldBanner) oldBanner.remove();
        const oldPwaBanner = document.getElementById('luminaPwaBanner');
        if (oldPwaBanner) oldPwaBanner.remove();

        setTimeout(() => {
            checkForUpdatesFromServer();
        }, 2000);

        setInterval(() => {
            checkForUpdatesFromServer();
            if (swRegistration) {
                swRegistration.update().catch(() => {});
            }
        }, 15 * 60 * 1000);

        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                checkForUpdatesFromServer();
                if (swRegistration) {
                    swRegistration.update().catch(() => {});
                }
            }
        });

        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredInstallPrompt = e;
        });

        window.addEventListener('appinstalled', () => {
            console.log('[LUMINA PWA] Aplikacja zainstalowana pomyślnie!');
            dismissInstallBanner();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.LuminaPWA = {
        promptInstall: triggerInstallFlow,
        checkForUpdates: () => checkForUpdatesFromServer(true),
        showIOSGuide: () => {
            createIOSModal();
            const modal = document.getElementById('luminaIosModal');
            if (modal) modal.classList.add('open');
        },
        isStandalone: isRunningStandalone,
        isIOS: isIOSDevice,
        currentVersion: CURRENT_CLIENT_VERSION
    };

})();