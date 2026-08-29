/**
 * ══════════════════════════════════════════════════════════════════════════
 * LUMINA UNIVERSAL SOCIAL SHARING & WEB PUSH NOTIFICATIONS SUITE (lumina-sharing-suite.js)
 * Punkt 5: Rekomendacje, Dzielenie się Treściami (Social Sharing) & Powiadomienia Web Push (PWA)
 * Ekosystem: Christian Culture
 * ══════════════════════════════════════════════════════════════════════════
 */

(function() {
    'use strict';

    let currentSharePayload = {
        title: 'LUMINA • Chrześcijańska Społeczność',
        text: 'Odkryj chrześcijański portal społecznościowy LUMINA – przestrzeń wartościowych relacji, wiary i inspiracji. 🕊️✨',
        url: window.location.href.split('#')[0]
    };

    function injectSharingStyles() {
        if (document.getElementById('luminaSharingSuiteStyles')) return;
        const style = document.createElement('style');
        style.id = 'luminaSharingSuiteStyles';
        style.textContent = `
            /* ══════════ UNIVERSAL SHARE MODAL ══════════ */
            .lumina-share-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: rgba(4, 8, 20, 0.85);
                backdrop-filter: blur(16px);
                -webkit-backdrop-filter: blur(16px);
                z-index: 999999;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                padding: 16px;
                box-sizing: border-box;
            }

            .lumina-share-overlay.active {
                opacity: 1;
                pointer-events: auto;
            }

            .lumina-share-card {
                width: 100%;
                max-width: 520px;
                background: linear-gradient(145deg, #0d1738, #070d24);
                border: 1.5px solid rgba(250, 204, 21, 0.35);
                border-radius: 24px;
                box-shadow: 0 25px 60px rgba(0, 0, 0, 0.9), 0 0 35px rgba(234, 179, 8, 0.15);
                padding: 24px;
                color: #f8fafc;
                font-family: 'Plus Jakarta Sans', sans-serif;
                transform: scale(0.95) translateY(10px);
                transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                display: flex;
                flex-direction: column;
                gap: 18px;
            }

            .lumina-share-overlay.active .lumina-share-card {
                transform: scale(1) translateY(0);
            }

            .lumina-share-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                padding-bottom: 14px;
            }

            .lumina-share-title-wrap {
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .lumina-share-title-wrap i {
                font-size: 1.3rem;
                color: #facc15;
            }

            .lumina-share-title {
                font-size: 1.1rem;
                font-weight: 800;
                font-family: 'Outfit', sans-serif;
                color: #fff;
                margin: 0;
            }

            .lumina-share-preview-box {
                background: rgba(255, 255, 255, 0.04);
                border: 1px dashed rgba(255, 255, 255, 0.15);
                border-radius: 14px;
                padding: 12px 16px;
                font-size: 0.85rem;
                color: #94a3b8;
                line-height: 1.5;
            }

            .lumina-share-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 10px;
            }

            @media (max-width: 480px) {
                .lumina-share-grid {
                    grid-template-columns: repeat(2, 1fr);
                }
            }

            .lumina-share-btn {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 8px;
                padding: 14px 10px;
                border-radius: 14px;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.08);
                color: #fff;
                font-size: 0.78rem;
                font-weight: 700;
                cursor: pointer;
                text-decoration: none;
                transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                font-family: inherit;
            }

            .lumina-share-btn:hover {
                transform: translateY(-2px);
                background: rgba(255, 255, 255, 0.12);
                border-color: rgba(255, 255, 255, 0.2);
            }

            .lumina-share-btn.btn-whatsapp:hover { background: #25D366; color: #000; border-color: #25D366; }
            .lumina-share-btn.btn-facebook:hover { background: #1877F2; color: #fff; border-color: #1877F2; }
            .lumina-share-btn.btn-telegram:hover { background: #229ED9; color: #fff; border-color: #229ED9; }
            .lumina-share-btn.btn-twitter:hover { background: #000; color: #fff; border-color: rgba(255,255,255,0.4); }
            .lumina-share-btn.btn-sms:hover { background: #10b981; color: #000; border-color: #10b981; }
            .lumina-share-btn.btn-native:hover { background: linear-gradient(135deg, #f59e0b, #d97706); color: #000; border-color: #f59e0b; }

            .lumina-share-btn i {
                font-size: 1.35rem;
            }

            .lumina-share-link-row {
                display: flex;
                gap: 8px;
                background: rgba(0, 0, 0, 0.35);
                border: 1px solid rgba(255, 255, 255, 0.12);
                border-radius: 12px;
                padding: 6px 8px 6px 14px;
                align-items: center;
            }

            .lumina-share-link-input {
                background: none;
                border: none;
                color: #e2e8f0;
                font-size: 0.82rem;
                flex: 1;
                outline: none;
                font-family: monospace;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .lumina-share-copy-btn {
                background: linear-gradient(135deg, #f59e0b, #d97706);
                border: none;
                color: #000;
                font-weight: 800;
                padding: 8px 16px;
                border-radius: 8px;
                cursor: pointer;
                font-size: 0.78rem;
                font-family: inherit;
                display: flex;
                align-items: center;
                gap: 6px;
                transition: transform 0.2s;
                white-space: nowrap;
            }

            .lumina-share-copy-btn:hover {
                transform: scale(1.02);
            }

            /* ══════════ PUSH NOTIFICATIONS BANNER ══════════ */
            .lumina-push-toast {
                position: fixed;
                bottom: 24px;
                right: 24px;
                max-width: 380px;
                background: #0f1c44;
                border: 1.5px solid rgba(250, 204, 21, 0.5);
                border-radius: 18px;
                box-shadow: 0 15px 40px rgba(0,0,0,0.8), 0 0 25px rgba(250, 204, 21, 0.2);
                padding: 16px;
                z-index: 99998;
                color: #fff;
                font-family: 'Plus Jakarta Sans', sans-serif;
                display: flex;
                flex-direction: column;
                gap: 10px;
                transform: translateY(120px);
                opacity: 0;
                pointer-events: none;
                transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            }

            .lumina-push-toast.active {
                transform: translateY(0);
                opacity: 1;
                pointer-events: auto;
            }

            .lumina-push-top {
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .lumina-push-top i {
                color: #facc15;
                font-size: 1.2rem;
            }

            .lumina-push-title {
                font-size: 0.92rem;
                font-weight: 800;
                margin: 0;
                font-family: 'Outfit', sans-serif;
            }

            .lumina-push-desc {
                font-size: 0.80rem;
                color: #cbd5e1;
                line-height: 1.4;
                margin: 0;
            }

            .lumina-push-actions {
                display: flex;
                gap: 8px;
                margin-top: 4px;
            }

            .lumina-push-accept {
                flex: 1;
                background: linear-gradient(135deg, #f59e0b, #d97706);
                border: none;
                color: #000;
                font-weight: 800;
                padding: 8px 12px;
                border-radius: 8px;
                font-size: 0.78rem;
                cursor: pointer;
                font-family: inherit;
            }

            .lumina-push-dismiss {
                background: rgba(255, 255, 255, 0.08);
                border: 1px solid rgba(255, 255, 255, 0.15);
                color: #cbd5e1;
                padding: 8px 12px;
                border-radius: 8px;
                font-size: 0.78rem;
                cursor: pointer;
                font-family: inherit;
            }
        `;
        document.head.appendChild(style);
    }

    function createSharingModalDOM() {
        if (document.getElementById('luminaShareModalOverlay')) return;
        const div = document.createElement('div');
        div.id = 'luminaShareModalOverlay';
        div.className = 'lumina-share-overlay';
        div.onclick = function(e) {
            if (e.target === div) closeShareModal();
        };

        div.innerHTML = `
            <div class="lumina-share-card" onclick="event.stopPropagation()">
                <div class="lumina-share-header">
                    <div class="lumina-share-title-wrap">
                        <i class="fa-solid fa-share-nodes"></i>
                        <h3 class="lumina-share-title" id="luminaShareModalHeading">Poleć & Udostępnij</h3>
                    </div>
                    <button type="button" onclick="window.closeShareModal()" style="background:none; border:none; color:#94a3b8; font-size:1.2rem; cursor:pointer; padding:4px;" title="Zamknij"><i class="fa-solid fa-xmark"></i></button>
                </div>

                <div class="lumina-share-preview-box" id="luminaSharePreviewText">
                    Odkryj chrześcijański portal społecznościowy LUMINA...
                </div>

                <div class="lumina-share-grid">
                    <button type="button" class="lumina-share-btn btn-whatsapp" onclick="window.executeShareTo('whatsapp')">
                        <i class="fa-brands fa-whatsapp"></i>
                        <span>WhatsApp</span>
                    </button>
                    <button type="button" class="lumina-share-btn btn-facebook" onclick="window.executeShareTo('facebook')">
                        <i class="fa-brands fa-facebook-f"></i>
                        <span>Facebook</span>
                    </button>
                    <button type="button" class="lumina-share-btn btn-telegram" onclick="window.executeShareTo('telegram')">
                        <i class="fa-brands fa-telegram"></i>
                        <span>Telegram</span>
                    </button>
                    <button type="button" class="lumina-share-btn btn-twitter" onclick="window.executeShareTo('twitter')">
                        <i class="fa-brands fa-x-twitter"></i>
                        <span>X / Twitter</span>
                    </button>
                    <button type="button" class="lumina-share-btn btn-sms" onclick="window.executeShareTo('sms')">
                        <i class="fa-solid fa-comment-sms"></i>
                        <span>SMS</span>
                    </button>
                    <button type="button" class="lumina-share-btn btn-native" onclick="window.executeShareTo('native')">
                        <i class="fa-solid fa-arrow-up-from-bracket"></i>
                        <span>Więcej...</span>
                    </button>
                </div>

                <div class="lumina-share-link-row">
                    <input type="text" readonly class="lumina-share-link-input" id="luminaShareUrlInput" value="${window.location.href}">
                    <button type="button" class="lumina-share-copy-btn" onclick="window.copyShareModalUrl()">
                        <i class="fa-solid fa-copy"></i> Kopiuj Link
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(div);

        // Push toast DOM
        const pushDiv = document.createElement('div');
        pushDiv.id = 'luminaPushToastPrompt';
        pushDiv.className = 'lumina-push-toast';
        pushDiv.innerHTML = `
            <div class="lumina-push-top">
                <i class="fa-solid fa-bell"></i>
                <h4 class="lumina-push-title">Bądź na bieżąco z LUMINA</h4>
            </div>
            <p class="lumina-push-desc">Włącz powiadomienia, aby nie przegapić nowych wiadomości, modlitw i wpisów na Tablicy Społeczności.</p>
            <div class="lumina-push-actions">
                <button type="button" class="lumina-push-accept" onclick="window.requestLuminaPushNotifications()">Włącz powiadomienia 🔔</button>
                <button type="button" class="lumina-push-dismiss" onclick="window.dismissPushToast()">Później</button>
            </div>
        `;
        document.body.appendChild(pushDiv);
    }

    // ── Social Share Functions ──
    function openShareModal(options = {}) {
        injectSharingStyles();
        createSharingModalDOM();

        const title = options.title || 'LUMINA • Chrześcijańska Społeczność';
        const text = options.text || 'Odkryj chrześcijański portal społecznościowy LUMINA – przestrzeń wartościowych relacji, wiary i inspiracji. 🕊️✨';
        const url = options.url || window.location.href;

        currentSharePayload = { title, text, url };

        const headingEl = document.getElementById('luminaShareModalHeading');
        if (headingEl) headingEl.textContent = options.heading || 'Poleć & Udostępnij';

        const previewEl = document.getElementById('luminaSharePreviewText');
        if (previewEl) previewEl.textContent = text;

        const inputEl = document.getElementById('luminaShareUrlInput');
        if (inputEl) inputEl.value = url;

        const overlay = document.getElementById('luminaShareModalOverlay');
        if (overlay) overlay.classList.add('active');
    }

    function closeShareModal() {
        const overlay = document.getElementById('luminaShareModalOverlay');
        if (overlay) overlay.classList.remove('active');
    }

    function executeShareTo(platform) {
        const { title, text, url } = currentSharePayload;
        const encodedText = encodeURIComponent(`${text}\n\n${url}`);
        const encodedUrl = encodeURIComponent(url);

        // NAPRAWA: udostępnianie było w 100% bezstanowe — otwierało panel,
        // ale nigdzie nie zapisywało faktu, że do udostępnienia doszło.
        // To zapisuje realne zdarzenie, potrzebne m.in. pod odznakę "Ambasador".
        if (platform !== 'native' && typeof window.recordShareEvent === 'function') {
            window.recordShareEvent({ platform, url, title });
        }

        switch (platform) {
            case 'whatsapp':
                window.open(`https://api.whatsapp.com/send?text=${encodedText}`, '_blank');
                break;
            case 'facebook':
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank');
                break;
            case 'telegram':
                window.open(`https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent(text)}`, '_blank');
                break;
            case 'twitter':
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodedUrl}`, '_blank');
                break;
            case 'sms':
                window.location.href = `sms:?body=${encodedText}`;
                break;
            case 'native':
                if (navigator.share) {
                    navigator.share({ title, text, url }).then(() => {
                        if (typeof window.recordShareEvent === 'function') {
                            window.recordShareEvent({ platform: 'native', url, title });
                        }
                        if (typeof showToast === 'function') showToast('Dziękujemy za udostępnienie! ✨🕊️');
                    }).catch(() => {});
                } else {
                    copyShareModalUrl();
                }
                break;
        }
    }

    function copyShareModalUrl() {
        const url = currentSharePayload.url || window.location.href;
        navigator.clipboard.writeText(url).then(() => {
            if (typeof showToast === 'function') {
                showToast('Link skopiowany do schowka! 🔗✨');
            } else {
                alert('Link skopiowany do schowka!');
            }
        }).catch(() => {
            prompt('Skopiuj link:', url);
        });
    }

    // Helper wrappers
    function openShareLuminaModal() {
        openShareModal({
            heading: 'Poleć Portal LUMINA 🕊️✨',
            title: 'LUMINA • Chrześcijańska Społeczność',
            text: 'Cześć! Chcę polecić Ci chrześcijański portal społecznościowy LUMINA – piękną przestrzeń wartościowych relacji, wiary i inspiracji. 🕊️✨',
            url: window.location.origin + '/lumina.html'
        });
    }

    function sharePostLink(postId, postData = {}) {
        const url = window.location.origin + '/lumina-tablica.html#' + postId;
        const author = postData.author || 'Członek Społeczności';
        const title = postData.title || `Wpis autora ${author} w portalu LUMINA`;
        const snippet = postData.text ? (postData.text.length > 120 ? postData.text.substring(0, 120) + '...' : postData.text) : 'Przeczytaj ten budujący wpis na Tablicy Społeczności LUMINA.';

        openShareModal({
            heading: 'Udostępnij Wpis 💬✨',
            title: title,
            text: `„${snippet}” – ${author} w portalu LUMINA 🕊️`,
            url: url
        });
    }

    function openShareProfileModal(profile = {}) {
        const name = profile.name || 'Profil w portalu LUMINA';
        const url = profile.url || window.location.href;

        openShareModal({
            heading: `Poleć profil: ${name} ✨`,
            title: `Profil ${name} w portalu LUMINA`,
            text: `Zobacz profil ${name} w chrześcijańskiej społeczności LUMINA! 🕊️`,
            url: url
        });
    }

    // ── Web Push Notifications ──
    async function requestLuminaPushNotifications() {
        dismissPushToast();
        if (!('Notification' in window)) {
            if (typeof showToast === 'function') showToast('Powiadomienia nie są wspierane w tej przeglądarce.');
            return;
        }

        try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                localStorage.setItem('lumina_push_enabled', 'true');
                if (typeof showToast === 'function') {
                    showToast('🔔 Powiadomienia Web Push zostały pomyślnie włączone!');
                }
                
                // Show instant welcome notification if service worker is active
                if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                    navigator.serviceWorker.ready.then((registration) => {
                        registration.showNotification('Witaj w Społeczności LUMINA! 🕊️', {
                            body: 'Powiadomienia są aktywne. Będziesz na bieżąco z nowymi wiadomościami i modlitwami.',
                            icon: 'lumina-icon-192.png',
                            badge: 'lumina-icon-192.png'
                        });
                    });
                }
            } else {
                localStorage.setItem('lumina_push_enabled', 'false');
                if (typeof showToast === 'function') showToast('Powiadomienia zostały wyłączone.');
            }
        } catch (e) {
            console.warn('Error requesting push permission:', e);
        }
    }

    function dismissPushToast() {
        const toast = document.getElementById('luminaPushToastPrompt');
        if (toast) toast.classList.remove('active');
        sessionStorage.setItem('lumina_push_prompt_dismissed', 'true');
    }

    function checkPushPrompt() {
        if (!('Notification' in window)) return;
        if (Notification.permission === 'granted' || Notification.permission === 'denied') return;
        if (sessionStorage.getItem('lumina_push_prompt_dismissed') === 'true') return;

        setTimeout(() => {
            const toast = document.getElementById('luminaPushToastPrompt');
            if (toast) toast.classList.add('active');
        }, 5000); // show prompt gently after 5 seconds
    }

    // ── Global API Exposure ──
    window.openShareModal = openShareModal;
    window.closeShareModal = closeShareModal;
    window.executeShareTo = executeShareTo;
    window.copyShareModalUrl = copyShareModalUrl;
    window.openShareLuminaModal = openShareLuminaModal;
    window.sharePostLink = sharePostLink;
    window.openShareProfileModal = openShareProfileModal;
    window.requestLuminaPushNotifications = requestLuminaPushNotifications;
    window.dismissPushToast = dismissPushToast;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            injectSharingStyles();
            createSharingModalDOM();
            checkPushPrompt();
        });
    } else {
        injectSharingStyles();
        createSharingModalDOM();
        checkPushPrompt();
    }

})();
