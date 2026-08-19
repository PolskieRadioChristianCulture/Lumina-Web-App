// ══════════════════════════════════════════════════════════════════════════
// LUMINA UNIVERSAL MOBILE PWA INSTALLER & DEVICE OPTIMIZER
// ══════════════════════════════════════════════════════════════════════════

(function() {
    'use strict';

    let deferredInstallPrompt = null;
    const DISMISS_STORAGE_KEY = 'lumina_pwa_install_dismissed';

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

    // 3. Register Service Worker
    function registerLuminaServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('sw-lumina.js', { scope: './' })
                    .then((reg) => {
                        console.log('[LUMINA PWA] Service Worker zarejestrowany pomyślnie. Scope:', reg.scope);
                        
                        // Check for SW updates
                        reg.addEventListener('updatefound', () => {
                            const newWorker = reg.installing;
                            if (newWorker) {
                                newWorker.addEventListener('statechange', () => {
                                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                        console.log('[LUMINA PWA] Dostępna nowa wersja aplikacji.');
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

    // 4. Inject PWA UI Styles
    function injectPWAStyles() {
        if (document.getElementById('lumina-pwa-styles')) return;
        const style = document.createElement('style');
        style.id = 'lumina-pwa-styles';
        style.textContent = `
            /* ── Safe Area Inset Optimization for Notch & Dynamic Island ── */
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

            /* ── Floating Mobile Install Banner ── */
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
            .lumina-pwa-btn-install:active {
                transform: scale(0.96);
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
            .lumina-pwa-btn-close:hover {
                color: #fff;
                background: rgba(255,255,255,0.2);
            }

            /* ── iOS Installation Guide Modal ── */
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

    // 5. Create Install Banner in DOM
    function createInstallBanner() {
        if (document.getElementById('luminaPwaBanner')) return;

        const banner = document.createElement('div');
        banner.id = 'luminaPwaBanner';
        banner.className = 'lumina-pwa-banner';
        banner.innerHTML = `
            <img src="lumina-icon-192.png" alt="LUMINA" class="lumina-pwa-icon" onerror="this.src='icon.png'">
            <div class="lumina-pwa-content">
                <div class="lumina-pwa-title">
                    <span>LUMINA App</span>
                    <span style="font-size:0.68rem; background:rgba(168,85,247,0.25); color:#d8b4fe; padding:2px 6px; border-radius:6px; font-weight:700;">PRO</span>
                </div>
                <div class="lumina-pwa-desc">Zainstaluj na ekranie głównym telefonu dla błyskawicznego dostępu!</div>
            </div>
            <div class="lumina-pwa-actions">
                <button type="button" class="lumina-pwa-btn-install" id="btnPwaInstallAction">
                    <i class="fa-solid fa-download"></i> Instaluj
                </button>
                <button type="button" class="lumina-pwa-btn-close" id="btnPwaInstallClose" title="Zamknij">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
        `;
        document.body.appendChild(banner);

        document.getElementById('btnPwaInstallAction').addEventListener('click', triggerInstallFlow);
        document.getElementById('btnPwaInstallClose').addEventListener('click', dismissInstallBanner);
    }

    // 6. Create iOS Install Modal
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
                    Rozumiem, dziękuję! ✨
                </button>
            </div>
        `;
        document.body.appendChild(modal);

        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('open');
        });
    }

    // 7. Trigger Install Flow
    function triggerInstallFlow() {
        if (deferredInstallPrompt) {
            deferredInstallPrompt.prompt();
            deferredInstallPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('[LUMINA PWA] Użytkownik zaakceptował instalację aplikacji.');
                }
                deferredInstallPrompt = null;
                dismissInstallBanner();
            });
        } else if (isIOSDevice()) {
            createIOSModal();
            const modal = document.getElementById('luminaIosModal');
            if (modal) modal.classList.add('open');
            dismissInstallBanner();
        } else {
            // Fallback instruction for desktop/other
            if (typeof window.showToast === 'function') {
                window.showToast('Aby zainstalować aplikację, wybierz ikonę instalacji na pasku adresu przeglądarki 📲');
            }
        }
    }

    function showInstallBanner() {
        if (isRunningStandalone()) return;
        if (sessionStorage.getItem(DISMISS_STORAGE_KEY) === 'true') return;

        createInstallBanner();
        setTimeout(() => {
            const banner = document.getElementById('luminaPwaBanner');
            if (banner) banner.classList.add('visible');
        }, 1500);
    }

    function dismissInstallBanner() {
        const banner = document.getElementById('luminaPwaBanner');
        if (banner) {
            banner.classList.remove('visible');
            sessionStorage.setItem(DISMISS_STORAGE_KEY, 'true');
        }
    }

    // 8. Event Listeners Initialization
    function init() {
        registerLuminaServiceWorker();
        injectPWAStyles();

        // Android / Chromium Install Event
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredInstallPrompt = e;
            showInstallBanner();
        });

        // App Installed Event
        window.addEventListener('appinstalled', () => {
            console.log('[LUMINA PWA] Aplikacja zainstalowana pomyślnie!');
            dismissInstallBanner();
            if (typeof window.showToast === 'function') {
                window.showToast('Aplikacja LUMINA została zainstalowana na Twoim urządzeniu! 📱✨');
            }
        });

        // iOS initial trigger check
        if (isIOSDevice() && !isRunningStandalone()) {
            setTimeout(showInstallBanner, 2500);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Export Global API
    window.LuminaPWA = {
        promptInstall: triggerInstallFlow,
        showIOSGuide: () => {
            createIOSModal();
            const modal = document.getElementById('luminaIosModal');
            if (modal) modal.classList.add('open');
        },
        isStandalone: isRunningStandalone,
        isIOS: isIOSDevice
    };

})();
