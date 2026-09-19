/**
 * ══════════════════════════════════════════════════════════════════════════
 * LUMINA MISSION BLIK ENGINE — UNIVERSAL 1-CLICK SUPPORT
 * Obsługuje przycisk "Misyjny BLIK" na każdym profilu i podstronie
 * ══════════════════════════════════════════════════════════════════════════
 */
(function() {
    'use strict';

    const BLIK_NUMBER_RAW = '537137043';
    const BLIK_NUMBER_FORMATTED = '537 137 043';

    function showUniversalBlikToast(customMsg) {
        // Zawsze renderuj luksusowy, dedykowany Toast Misyjny BLIK
        let toastEl = document.getElementById('luminaUniversalBlikToast');
        if (!toastEl) {
            toastEl = document.createElement('div');
            toastEl.id = 'luminaUniversalBlikToast';
            toastEl.style.cssText = `
                position: fixed;
                bottom: 28px;
                left: 50%;
                transform: translateX(-50%) translateY(120px);
                max-width: 92vw;
                width: 440px;
                background: linear-gradient(135deg, #09171b 0%, #060e12 100%);
                border: 1.5px solid #7c3aed;
                border-radius: 20px;
                padding: 16px 20px;
                color: #ffffff;
                box-shadow: 0 16px 48px rgba(0,0,0,0.85), 0 0 30px rgba(124,58,237,0.4);
                z-index: 9999999;
                display: flex;
                align-items: center;
                gap: 14px;
                font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
                transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.35s ease;
                opacity: 0;
                pointer-events: auto;
            `;
            document.body.appendChild(toastEl);
        }

        toastEl.innerHTML = `
            <div style="width:44px; height:44px; border-radius:14px; background:linear-gradient(135deg, #7c3aed, #6d28d9); display:flex; align-items:center; justify-content:center; flex-shrink:0; box-shadow:0 4px 14px rgba(124,58,237,0.5);">
                <i class="fa-solid fa-mobile-screen-button" style="color:#fef08a; font-size:1.25rem;"></i>
            </div>
            <div style="flex:1; min-width:0;">
                <div style="font-size:0.78rem; font-weight:800; color:#c084fc; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:2px;">
                    🌿 MISYJNY BLIK SKOPIOWANY
                </div>
                <div style="font-size:1.05rem; font-weight:900; color:#fff; font-family:monospace; letter-spacing:0.5px; margin-bottom:2px;">
                    ${BLIK_NUMBER_FORMATTED}
                </div>
                <div style="font-size:0.75rem; color:#cbd5e1; line-height:1.35;">
                    Wklej w swojej aplikacji bankowej z tytułem: <b style="color:#facc15;">„Dar misyjny”</b>. Dziękujemy! ✨
                </div>
            </div>
            <button type="button" onclick="this.parentElement.style.transform='translateX(-50%) translateY(120px)'; this.parentElement.style.opacity='0';" style="background:transparent; border:none; color:#94a3b8; font-size:1.1rem; cursor:pointer; padding:6px; margin-left:4px;" title="Zamknij">
                <i class="fa-solid fa-xmark"></i>
            </button>
        `;

        // Pokaż toast
        requestAnimationFrame(() => {
            toastEl.style.transform = 'translateX(-50%) translateY(0)';
            toastEl.style.opacity = '1';
        });

        // Wibracja telefonu (haptic feedback)
        if (typeof navigator.vibrate === 'function') {
            try { navigator.vibrate([60, 40, 60]); } catch(e) {}
        }

        // Ukryj po 5 sekundach
        clearTimeout(toastEl._timer);
        toastEl._timer = setTimeout(() => {
            if (toastEl) {
                toastEl.style.transform = 'translateX(-50%) translateY(120px)';
                toastEl.style.opacity = '0';
            }
        }, 5000);
    }

    // Pancerne kopiowanie do schowka z wielopoziomowym fallbackiem
    function copyMissionBlikNumber(customMsg) {
        let copied = false;

        // Metoda 1: Modern Clipboard API
        if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
            navigator.clipboard.writeText(BLIK_NUMBER_RAW).then(() => {
                showUniversalBlikToast(customMsg);
            }).catch(() => {
                fallbackCopy(customMsg);
            });
            return;
        }

        fallbackCopy(customMsg);

        function fallbackCopy(msg) {
            // Metoda 2: Fallback textarea + execCommand
            try {
                const ta = document.createElement('textarea');
                ta.value = BLIK_NUMBER_RAW;
                ta.style.position = 'fixed';
                ta.style.left = '-9999px';
                ta.style.top = '-9999px';
                ta.setAttribute('readonly', '');
                document.body.appendChild(ta);
                ta.select();
                ta.setSelectionRange(0, 99999);
                copied = document.execCommand('copy');
                document.body.removeChild(ta);
            } catch(e) {
                copied = false;
            }

            if (copied) {
                showUniversalBlikToast(msg);
            } else {
                prompt('Numer Misyjnego BLIK Christian Culture:', BLIK_NUMBER_FORMATTED);
            }
        }
    }

    // Eksport globalny do window
    window.copyMissionBlikNumber = copyMissionBlikNumber;
    window.showUniversalBlikToast = showUniversalBlikToast;
    window.BLIK_NUMBER_RAW = BLIK_NUMBER_RAW;
    window.BLIK_NUMBER_FORMATTED = BLIK_NUMBER_FORMATTED;

    // Automatyczne sprawdzenie parametru URL (?blik=1 lub #blik z powiadomienia push)
    function checkUrlBlikTrigger() {
        try {
            const url = new URL(window.location.href);
            if (url.searchParams.get('blik') === '1' || window.location.hash.includes('blik')) {
                setTimeout(() => {
                    copyMissionBlikNumber();
                }, 300);
            }
        } catch(e) {}
    }

    if (typeof window !== 'undefined') {
        if (document.readyState === 'loading') {
            window.addEventListener('DOMContentLoaded', checkUrlBlikTrigger);
        } else {
            checkUrlBlikTrigger();
        }
    }

})();
