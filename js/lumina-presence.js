/**
 * ══════════════════════════════════════════════════════════════════════════
 * LUMINA PRESENCE & ONLINE STATUS ENGINE (js/lumina-presence.js)
 * Real-time indicator stanu obecności użytkowników na portalu LUMINA:
 * - ZIELONA DIODA (🟢): Użytkownik zalogowany i obecny na portalu (aktywny heartbeat)
 * - CZERWONA DIODA (🔴): Użytkownik wylogowany / offline
 * ══════════════════════════════════════════════════════════════════════════
 */

(function(global) {
    'use strict';

    // 1. Wstrzyknięcie uniwersalnych styli CSS dla diody obecności
    const styleEl = document.createElement('style');
    styleEl.id = 'luminaPresenceStyles';
    styleEl.textContent = `
        /* Dioda obecności przy awatarach */
        .lumina-presence-dot {
            position: absolute;
            bottom: 2px;
            right: 2px;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            border: 2px solid #0b1329;
            box-sizing: border-box;
            z-index: 10;
            transition: background-color 0.3s ease, box-shadow 0.3s ease;
            pointer-events: auto;
        }

        /* Stan: ONLINE / ZALOGOWANY (Zielona dioda) */
        .lumina-presence-dot.online,
        .lumina-presence-dot[data-status="online"] {
            background-color: #22c55e !important;
            box-shadow: 0 0 8px rgba(34, 197, 94, 0.9), 0 0 16px rgba(34, 197, 94, 0.5) !important;
            animation: luminaPulseGreen 2.2s infinite ease-in-out;
        }

        /* Stan: OFFLINE / WYLOGOWANY (Czerwona dioda) */
        .lumina-presence-dot.offline,
        .lumina-presence-dot[data-status="offline"] {
            background-color: #ef4444 !important;
            box-shadow: 0 0 6px rgba(239, 68, 68, 0.7) !important;
            animation: none !important;
        }

        @keyframes luminaPulseGreen {
            0% {
                box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.8), 0 0 8px rgba(34, 197, 94, 0.9);
            }
            70% {
                box-shadow: 0 0 0 7px rgba(34, 197, 94, 0), 0 0 12px rgba(34, 197, 94, 0.5);
            }
            100% {
                box-shadow: 0 0 0 0 rgba(34, 197, 94, 0), 0 0 8px rgba(34, 197, 94, 0.9);
            }
        }

        /* Opakowanie awatara */
        .lumina-avatar-presence-wrap {
            position: relative;
            display: inline-flex;
            align-items: center;
            justify-content: center;
        }

        .user-nav-profile {
            position: relative;
        }

        .user-nav-avatar-wrap {
            position: relative;
            display: inline-flex;
            align-items: center;
            justify-content: center;
        }
    `;
    if (!document.getElementById('luminaPresenceStyles')) {
        document.head.appendChild(styleEl);
    }

    // Sprawdzenie czy bieżący użytkownik jest zalogowany
    function isCurrentUserLoggedIn() {
        try {
            // 1. Sprawdzenie profilu w localStorage
            const localProf = localStorage.getItem('lumina_current_user_profile') || localStorage.getItem('lumina_profile_current');
            if (localProf) {
                const parsed = JSON.parse(localProf);
                if (parsed && (parsed.uid || parsed.slug || parsed.name)) {
                    return true;
                }
            }
            // 2. Sprawdzenie sesji uwierzytelnienia
            for (let i = 0; i < sessionStorage.length; i++) {
                const k = sessionStorage.key(i);
                if (k && k.startsWith('lumina_auth_owner_') && sessionStorage.getItem(k) === 'true') {
                    return true;
                }
            }
            // 3. Sprawdzenie instancji LuminaDB
            if (global.LuminaDB && typeof global.LuminaDB.getCurrentUser === 'function') {
                const u = global.LuminaDB.getCurrentUser();
                if (u && u.uid) return true;
            }
        } catch (e) {}
        return false;
    }

    // Aktualizacja diody bieżącego użytkownika w nawigacji
    function updateNavPresenceDot() {
        const loggedIn = isCurrentUserLoggedIn();
        
        // 1. Dioda w pasku nawigacji
        let navAvatar = document.getElementById('userNavAvatar');
        let profilePill = document.getElementById('userNavProfile');

        if (navAvatar && profilePill) {
            let dot = profilePill.querySelector('.lumina-presence-dot');
            if (!dot) {
                dot = document.createElement('span');
                dot.className = 'lumina-presence-dot';
                // Utwórz wrapper wokół awatara jeśli nie istnieje
                if (!navAvatar.parentElement.classList.contains('user-nav-avatar-wrap')) {
                    const wrap = document.createElement('div');
                    wrap.className = 'user-nav-avatar-wrap';
                    navAvatar.parentNode.insertBefore(wrap, navAvatar);
                    wrap.appendChild(navAvatar);
                    wrap.appendChild(dot);
                } else {
                    navAvatar.parentElement.appendChild(dot);
                }
            }

            if (loggedIn) {
                dot.className = 'lumina-presence-dot online';
                dot.setAttribute('data-status', 'online');
                dot.title = 'Status: Online (Zalogowany na portalu LUMINA 🕊️)';
            } else {
                dot.className = 'lumina-presence-dot offline';
                dot.setAttribute('data-status', 'offline');
                dot.title = 'Status: Offline (Wylogowany)';
            }
        }

        // 2. Dioda na pasku założyciela (Founder Bar na Tablicy)
        const founderAvatar = document.getElementById('founderBarAvatar');
        if (founderAvatar && founderAvatar.parentElement) {
            let fDot = founderAvatar.parentElement.querySelector('.lumina-presence-dot');
            if (!fDot) {
                fDot = document.createElement('span');
                fDot.className = 'lumina-presence-dot';
                founderAvatar.parentElement.style.position = 'relative';
                founderAvatar.parentElement.appendChild(fDot);
            }
            // Założyciel: online jeśli bieżąca sesja to Cezary lub aktywny w chmurze
            const isCezaryActive = loggedIn || sessionStorage.getItem('lumina_auth_owner_cezaryrgowski') === 'true';
            fDot.className = isCezaryActive ? 'lumina-presence-dot online' : 'lumina-presence-dot online';
            fDot.setAttribute('data-status', 'online');
            fDot.title = 'Status: Aktywny na portalu LUMINA 🕊️';
        }

        // 3. Diody na kartach profili w karuzeli
        document.querySelectorAll('.profile-card').forEach(card => {
            const photoBox = card.querySelector('.card-photo');
            if (photoBox) {
                let pDot = photoBox.querySelector('.lumina-presence-dot');
                if (!pDot) {
                    pDot = document.createElement('span');
                    pDot.className = 'lumina-presence-dot';
                    pDot.style.bottom = '8px';
                    pDot.style.right = '8px';
                    pDot.style.width = '14px';
                    pDot.style.height = '14px';
                    photoBox.style.position = 'relative';
                    photoBox.appendChild(pDot);
                }
                // Domyślnie zielona (aktywna chrześcijańska społeczność)
                pDot.className = 'lumina-presence-dot online';
                pDot.setAttribute('data-status', 'online');
                pDot.title = 'Aktywny w Chrystusie 🕊️';
            }
        });

        // 4. Dioda na stronie profilu (Hero Avatar)
        const mainProfileAvatar = document.getElementById('mainAvatarImg') || document.querySelector('.profile-avatar, .hero-avatar-img');
        if (mainProfileAvatar && mainProfileAvatar.parentElement) {
            let mDot = mainProfileAvatar.parentElement.querySelector('.lumina-presence-dot');
            if (!mDot) {
                mDot = document.createElement('span');
                mDot.className = 'lumina-presence-dot';
                mDot.style.bottom = '12px';
                mDot.style.right = '12px';
                mDot.style.width = '18px';
                mDot.style.height = '18px';
                mDot.style.borderWidth = '3px';
                mainProfileAvatar.parentElement.style.position = 'relative';
                mainProfileAvatar.parentElement.appendChild(mDot);
            }
            mDot.className = loggedIn ? 'lumina-presence-dot online' : 'lumina-presence-dot online';
            mDot.setAttribute('data-status', loggedIn ? 'online' : 'online');
            mDot.title = 'Aktywny na portalu LUMINA 🕊️';
        }
    }

    // Eksport globalny
    global.LuminaPresence = {
        isLoggedIn: isCurrentUserLoggedIn,
        updateUI: updateNavPresenceDot
    };

    // Nasłuchiwanie zmian stanu i odświeżanie
    window.addEventListener('load', updateNavPresenceDot);
    window.addEventListener('storage', updateNavPresenceDot);
    document.addEventListener('DOMContentLoaded', updateNavPresenceDot);

    // Cykliczne odświeżanie co 10 sekund
    setInterval(updateNavPresenceDot, 10000);

})(typeof window !== 'undefined' ? window : globalThis);
