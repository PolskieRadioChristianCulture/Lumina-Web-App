/**
 * ══════════════════════════════════════════════════════════════════════════
 * CHRISTIAN CULTURE & LUMINA UNIVERSAL GOOGLE AUTH CONNECTOR
 * Plik: js/cc-global-auth.js
 * 
 * Umożliwia logowanie jednym kliknięciem przez Google na WSZYSTKICH
 * podstronach i usługach ekosystemu Christian Culture (Radio, VOD,
 * Modlitwa, Transmisje, Portal LUMINA), automatycznie powiększając
 * grono społeczności portalu LUMINA.
 * ══════════════════════════════════════════════════════════════════════════
 */

(function() {
    'use strict';

    if (window._ccGlobalAuthInitialized) return;
    window._ccGlobalAuthInitialized = true;

    // 1. Wstrzyknięcie Stylów CSS Glassmorphism
    const styleEl = document.createElement('style');
    styleEl.id = 'ccGlobalAuthStyles';
    styleEl.textContent = `
        /* ── CC & LUMINA UNIVERSAL AUTH WIDGET ── */
        .cc-auth-widget-container {
            display: inline-flex;
            align-items: center;
            position: relative;
            z-index: 1000;
            font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            -webkit-tap-highlight-color: transparent;
        }

        /* Przycisk Logowania przez Google - Standard @SE26/27 Obsidian & Imperial Gold */
        .cc-auth-google-btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: linear-gradient(165deg, rgba(18, 18, 20, 0.98) 0%, rgba(8, 8, 10, 0.99) 100%);
            border: 1.5px solid rgba(212, 175, 55, 0.35);
            color: #ffffff;
            padding: 6px 14px 6px 10px;
            border-radius: 24px;
            font-size: 0.82rem;
            font-weight: 700;
            cursor: pointer;
            text-decoration: none;
            box-shadow: 0 4px 18px rgba(0, 0, 0, 0.5), 0 0 14px rgba(212, 175, 55, 0.12);
            backdrop-filter: blur(28px);
            -webkit-backdrop-filter: blur(28px);
            transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
            user-select: none;
            white-space: nowrap;
            min-height: 38px;
        }

        .cc-auth-google-btn:hover {
            border-color: #d4af37;
            background: linear-gradient(165deg, rgba(28, 28, 32, 0.98) 0%, rgba(16, 16, 18, 0.98) 100%);
            box-shadow: 0 6px 24px rgba(0, 0, 0, 0.65), 0 0 20px rgba(212, 175, 55, 0.3);
            transform: translateY(-1.5px) scale(1.02);
            color: #ffffff;
        }

        .cc-auth-google-btn:active {
            transform: translateY(0) scale(0.98);
        }

        .cc-google-icon-svg {
            width: 18px;
            height: 18px;
            flex-shrink: 0;
            filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3));
        }

        .cc-auth-lumina-tag {
            background: linear-gradient(135deg, #d4af37, #f3e5ab);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            font-size: 0.68rem;
            font-weight: 900;
            letter-spacing: 0.8px;
            text-transform: uppercase;
            padding-left: 2px;
            border-left: 1px solid rgba(212, 175, 55, 0.25);
            margin-left: 2px;
        }

        /* Stan Zalogowany: Profil Pill - Standard @SE26/27 Obsidian & Imperial Gold */
        .cc-auth-user-pill {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: linear-gradient(165deg, rgba(16, 16, 18, 0.98) 0%, rgba(9, 9, 11, 0.99) 100%);
            border: 1px solid rgba(212, 175, 55, 0.15);
            border-radius: 24px;
            padding: 4px 12px 4px 5px;
            color: #ffffff;
            cursor: pointer;
            box-shadow: 0 4px 14px rgba(0, 0, 0, 0.5), 0 0 10px rgba(212, 175, 55, 0.10), inset 0 1px 1px rgba(255, 235, 170, 0.18);
            backdrop-filter: blur(28px);
            -webkit-backdrop-filter: blur(28px);
            transition: all 0.25s ease;
            user-select: none;
            min-height: 38px;
        }

        .cc-auth-user-pill:hover {
            border-color: rgba(212, 175, 55, 0.35);
            background: linear-gradient(165deg, rgba(24, 24, 28, 0.98) 0%, rgba(14, 14, 16, 0.99) 100%);
            box-shadow: 0 6px 18px rgba(0,0,0,0.65), 0 0 16px rgba(212, 175, 55, 0.18), inset 0 1px 1px rgba(255, 235, 170, 0.25);
        }

        .cc-auth-avatar-wrap {
            position: relative;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            flex-shrink: 0;
        }

        .cc-auth-avatar-img {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            object-fit: cover;
            border: 1.5px solid #d4af37;
            display: block;
        }

        .cc-auth-online-dot {
            position: absolute;
            bottom: -1px;
            right: -1px;
            width: 9px;
            height: 9px;
            background: #22c55e;
            border-radius: 50%;
            border: 1.5px solid #090d1a;
            box-shadow: 0 0 6px #22c55e;
            animation: ccPulseDot 2s infinite ease-in-out;
        }

        @keyframes ccPulseDot {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.2); opacity: 0.8; }
            100% { transform: scale(1); opacity: 1; }
        }

        .cc-auth-user-name {
            font-size: 0.8rem;
            font-weight: 700;
            color: #ffffff;
            max-width: 110px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .cc-auth-user-chevron {
            font-size: 0.65rem;
            color: rgba(212, 175, 55, 0.7);
            transition: transform 0.2s ease;
        }

        /* Dropdown Menu - Standard @SE26/27 Obsidian & Imperial Gold (Subtelna Poświata 3D & Klasa) */
        .cc-auth-dropdown {
            position: absolute;
            top: calc(100% + 10px);
            right: 0;
            width: 220px;
            background: linear-gradient(165deg, rgba(16, 16, 18, 0.98) 0%, rgba(8, 8, 10, 0.99) 100%);
            border: 1px solid rgba(212, 175, 55, 0.15);
            border-radius: 20px;
            padding: 8px;
            box-shadow: 0 25px 60px rgba(0, 0, 0, 0.95), 0 0 25px rgba(212, 175, 55, 0.08), inset 0 1px 1px rgba(255, 235, 170, 0.18);
            backdrop-filter: blur(28px);
            -webkit-backdrop-filter: blur(28px);
            display: none;
            flex-direction: column;
            gap: 4px;
            z-index: 10001;
            transform-origin: top right;
            animation: ccDropIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .cc-auth-dropdown.open {
            display: flex !important;
        }

        @keyframes ccDropIn {
            from { opacity: 0; transform: translateY(-8px) scale(0.96); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .cc-auth-dropdown-item {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 8px 12px;
            border-radius: 12px;
            color: #ffffff;
            text-decoration: none;
            font-size: 0.82rem;
            font-weight: 600;
            transition: all 0.18s ease;
            cursor: pointer;
            border: none;
            background: transparent;
            width: 100%;
            text-align: left;
            box-sizing: border-box;
            font-family: inherit;
        }

        .cc-auth-dropdown-item:hover {
            background: rgba(212, 175, 55, 0.12);
            color: #d4af37;
            transform: translateX(2px);
        }

        .cc-auth-dropdown-item i {
            width: 16px;
            font-size: 0.88rem;
            text-align: center;
            color: #d4af37;
        }

        .cc-auth-dropdown-sep {
            height: 1px;
            background: rgba(212, 175, 55, 0.15);
            margin: 4px 6px;
        }

        .cc-auth-dropdown-item.logout {
            color: #f87171;
        }
        .cc-auth-dropdown-item.logout i {
            color: #ef4444;
        }
        .cc-auth-dropdown-item.logout:hover {
            background: rgba(239, 68, 68, 0.15);
            color: #fca5a5;
        }

        /* Toast powitalny */
        .cc-auth-toast {
            position: fixed;
            bottom: 24px;
            right: 24px;
            background: linear-gradient(135deg, rgba(13, 22, 48, 0.97) 0%, rgba(38, 12, 54, 0.98) 100%);
            border: 1.5px solid rgba(250, 204, 21, 0.6);
            border-radius: 20px;
            padding: 14px 20px;
            color: #ffffff;
            box-shadow: 0 16px 45px rgba(0, 0, 0, 0.8), 0 0 25px rgba(250, 204, 21, 0.3);
            backdrop-filter: blur(20px);
            z-index: 99999;
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 0.88rem;
            font-weight: 600;
            max-width: 360px;
            transform: translateY(100px);
            opacity: 0;
            transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
            pointer-events: none;
        }

        .cc-auth-toast.show {
            transform: translateY(0);
            opacity: 1;
            pointer-events: auto;
        }

        @media (max-width: 768px) {
            .cc-auth-google-btn span.cc-auth-btn-text-full {
                display: none;
            }
            .cc-auth-google-btn span.cc-auth-btn-text-short {
                display: inline;
            }
            .cc-auth-toast {
                left: 16px;
                right: 16px;
                bottom: 80px;
                max-width: none;
            }
        }
        @media (min-width: 769px) {
            .cc-auth-google-btn span.cc-auth-btn-text-full {
                display: inline;
            }
            .cc-auth-google-btn span.cc-auth-btn-text-short {
                display: none;
            }
        }
    `;
    document.head.appendChild(styleEl);

    // 2. Pomocnicze ikony Google SVG
    const GOOGLE_ICON_SVG = `
        <svg class="cc-google-icon-svg" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
        </svg>
    `;

    // 3. Sprawdzenie bieżącej sesji użytkownika
    function getStoredUserData() {
        try {
            const userStr = localStorage.getItem('lumina_current_user');
            const profStr = localStorage.getItem('lumina_current_user_profile') || localStorage.getItem('lumina_my_profile');
            const user = userStr ? JSON.parse(userStr) : null;
            const profile = profStr ? JSON.parse(profStr) : null;
            if (user && user.uid) {
                return { user, profile };
            }
        } catch(e) {}
        return null;
    }

    // 4. Uniwersalne Logowanie Google
    window.ccLoginWithGoogle = async function(customRedirect = null) {
        const btns = document.querySelectorAll('.cc-auth-google-btn');
        btns.forEach(b => {
            b.style.opacity = '0.7';
            b.style.pointerEvents = 'none';
        });

        try {
            if (!window.loginWithGoogle && !window.LuminaDB?.loginWithGoogle) {
                try {
                    const luminaModule = await import('./lumina-db.js?v=' + Date.now());
                    if (luminaModule && luminaModule.loginWithGoogle) {
                        window.loginWithGoogle = luminaModule.loginWithGoogle;
                    }
                } catch(modErr) {
                    console.warn('LuminaDB dynamic import attempt:', modErr);
                }
            }

            const loginFn = window.loginWithGoogle || window.LuminaDB?.loginWithGoogle;
            if (typeof loginFn !== 'function') {
                const target = customRedirect ? `?redirect=${encodeURIComponent(customRedirect)}` : '';
                window.location.href = `lumina-login.html${target}`;
                return;
            }

            const res = await loginFn();
            if (!res) {
                btns.forEach(b => {
                    b.style.opacity = '1';
                    b.style.pointerEvents = 'auto';
                });
                return;
            }

            const user = res.user;
            const profile = res.profile;
            const userName = profile?.name || user?.displayName || 'Przyjacielu';

            showAuthToast(`✨ Szczęść Boże, ${userName}! Witamy w społeczności LUMINA 🕊️`);
            renderAuthWidgets();

            if (customRedirect) {
                setTimeout(() => {
                    window.location.href = customRedirect;
                }, 800);
            }

        } catch (err) {
            console.error('CC Global Google Auth Error:', err);
            btns.forEach(b => {
                b.style.opacity = '1';
                b.style.pointerEvents = 'auto';
            });
            if (err.code === 'auth/popup-blocked') {
                alert('Twoja przeglądarka zablokowała okienko logowania Google. Zezwól na wyskakujące okienka dla tej witryny.');
            } else if (err.code !== 'auth/popup-closed-by-user') {
                alert('Nie udało się zalogować przez Google: ' + (err.message || 'Spróbuj ponownie.'));
            }
        }
    };

    // 5. Wylogowanie
    window.ccLogout = async function() {
        const logoutFn = window.logoutUser || window.LuminaDB?.logoutUser;
        if (typeof logoutFn === 'function') {
            await logoutFn();
        } else {
            localStorage.removeItem('lumina_current_user');
            localStorage.removeItem('lumina_current_user_profile');
            localStorage.removeItem('lumina_my_profile');
            localStorage.removeItem('lumina_user_session');
        }
        showAuthToast('Wylogowano pomyślnie. Niech Pan Cię błogosławi! 🕊️');
        renderAuthWidgets();
    };

    // 6. Pokazywanie toasta
    function showAuthToast(msg) {
        let toast = document.getElementById('ccAuthToast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'ccAuthToast';
            toast.className = 'cc-auth-toast';
            document.body.appendChild(toast);
        }
        toast.innerHTML = `<span style="font-size:1.2rem;">✨</span><span>${msg}</span>`;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 4500);
    }

    // 7. Przełączanie dropdowna użytkownika (z auto-zamykaniem menu skrótów)
    window.toggleCcUserDropdown = function(event) {
        if (event) event.stopPropagation();
        const drop = document.getElementById('ccAuthDropdown');
        if (drop) {
            const willOpen = !drop.classList.contains('open');
            drop.classList.toggle('open');
            if (willOpen) {
                // Jeśli menu skrótów było otwarte, zamknij je dla czystości interfejsu
                const actionsList = document.getElementById('actionsList');
                const actionsToggleIcon = document.getElementById('actionsToggleIcon');
                if (actionsList && (actionsList.style.opacity === '1' || actionsList.classList.contains('open'))) {
                    actionsList.style.opacity = '0';
                    actionsList.style.transform = 'translateY(-10px)';
                    actionsList.style.pointerEvents = 'none';
                    actionsList.classList.remove('open');
                    if (actionsToggleIcon) {
                        actionsToggleIcon.classList.remove('fa-xmark');
                        actionsToggleIcon.classList.add('fa-plus');
                    }
                }
            }
        }
    };

    document.addEventListener('click', () => {
        const drop = document.getElementById('ccAuthDropdown');
        if (drop && drop.classList.contains('open')) {
            drop.classList.remove('open');
        }
    });

    // 8. Renderowanie widgetu w zależności od stanu sesji
    function renderAuthWidgets() {
        const data = getStoredUserData();
        const containers = document.querySelectorAll('.cc-auth-widget-container, [data-cc-auth-mount]');

        containers.forEach(container => {
            if (data && data.user) {
                // ZALOGOWANY
                const user = data.user;
                const profile = data.profile || {};
                const name = profile.name || user.displayName || 'Członek LUMINA';
                const isCezary = (user.email && user.email.toLowerCase().includes('czarkes')) || profile.slug === 'cezaryrgowski';
                const isWioletta = (user.email && user.email.includes('wioletta1240')) || profile.slug === 'wiolettarogowska';
                const isZbyszek = profile.slug === 'zbyszekgieron' || (name && (name.toLowerCase().includes('zbyszek') || name.toLowerCase().includes('zbigniew')) && name.toLowerCase().includes('giero')) || (user.email && (user.email.toLowerCase().includes('zbyszek') || user.email.toLowerCase().includes('gieron')));
                const isZofia = profile.slug === 'zofiadudek' || (name && name.toLowerCase().includes('zofia') && name.toLowerCase().includes('dudek')) || (user.email && (user.email.toLowerCase().includes('zofia') && user.email.toLowerCase().includes('dudek')));

                let avatar = profile.avatar || user.photoURL || 'lumina_icon.jpg';
                if (isCezary && (!profile.avatar || profile.avatar.includes('lumina_icon'))) avatar = 'avatar_cezary_official.jpg';
                else if (isWioletta && (!profile.avatar || profile.avatar.includes('lumina_icon'))) avatar = 'avatar_wioletta_official.jpg';
                else if (isZbyszek && (!profile.avatar || profile.avatar.includes('lumina_icon'))) avatar = 'avatar_zbyszek_gieron.jpg';
                else if (isZofia && (!profile.avatar || profile.avatar.includes('lumina_icon'))) avatar = 'avatar_zofia_dudek.jpg';

                let profileHref = 'lumina-profile.html';
                if (isCezary) profileHref = 'lumina.cezaryrgowski.html';
                else if (isWioletta) profileHref = 'lumina.wiolettarogowska.html';
                else if (isZbyszek) profileHref = 'lumina.zbyszekgieron.html';
                else if (isZofia) profileHref = 'lumina.zofiadudek.html';
                else if (profile.slug) profileHref = `lumina-profile.html?u=${profile.slug}`;

                container.innerHTML = `
                    <div class="cc-auth-user-pill" onclick="window.toggleCcUserDropdown(event)" title="Twoje Konto LUMINA">
                        <div class="cc-auth-avatar-wrap">
                            <img src="${avatar}" onerror="this.src='lumina_icon.jpg'" alt="${name}" class="cc-auth-avatar-img">
                            <span class="cc-auth-online-dot"></span>
                        </div>
                        <span class="cc-auth-user-name">${name.split(' ')[0]}</span>
                        <i class="fa-solid fa-chevron-down cc-auth-user-chevron"></i>
                    </div>

                    <div class="cc-auth-dropdown" id="ccAuthDropdown" onclick="event.stopPropagation()">
                        <a href="${profileHref}" class="cc-auth-dropdown-item">
                            <i class="fa-solid fa-id-card"></i>
                            <span>Mój Profil (LUMINA)</span>
                        </a>
                        <a href="tablica" class="cc-auth-dropdown-item">
                            <i class="fa-solid fa-users-viewfinder"></i>
                            <span>Tablica Społeczności</span>
                        </a>
                        <a href="tablica?chat=open" class="cc-auth-dropdown-item">
                            <i class="fa-solid fa-comments"></i>
                            <span>Wiadomości & Czat</span>
                        </a>
                        <a href="lumina" class="cc-auth-dropdown-item">
                            <i class="fa-solid fa-heart"></i>
                            <span>Odkrywaj Portal</span>
                        </a>
                        <div class="cc-auth-dropdown-sep"></div>
                        <button type="button" class="cc-auth-dropdown-item logout" onclick="window.ccLogout()">
                            <i class="fa-solid fa-arrow-right-from-bracket"></i>
                            <span>Wyloguj się</span>
                        </button>
                    </div>
                `;
            } else {
                // NIEZALOGOWANY
                container.innerHTML = `
                    <button type="button" class="cc-auth-google-btn" onclick="window.ccLoginWithGoogle()" title="Zaloguj się przez Google do społeczności LUMINA">
                        ${GOOGLE_ICON_SVG}
                        <span class="cc-auth-btn-text-full">Zaloguj z Google</span>
                        <span class="cc-auth-btn-text-short">Zaloguj</span>
                        <span class="cc-auth-lumina-tag">LUMINA</span>
                    </button>
                `;
            }
        });
    }

    // 9. Automatyczne podpięcie do nagłówków na znanych podstronach misji
    function autoMountAuthWidget() {
        if (document.querySelector('.cc-auth-widget-container')) {
            renderAuthWidgets();
            return;
        }

        const headerTargets = [
            '#quickActionsMenu',
            '.nav-right',
            '.header-right',
            '.main-nav',
            '#mainHeader .header-container',
            'header .header-container',
            'header'
        ];

        let mounted = false;
        for (const sel of headerTargets) {
            const targetEl = document.querySelector(sel);
            if (targetEl) {
                const widget = document.createElement('div');
                widget.className = 'cc-auth-widget-container';
                widget.setAttribute('data-cc-auto-mounted', 'true');
                
                if (sel === '#quickActionsMenu') {
                    targetEl.parentNode.insertBefore(widget, targetEl);
                } else {
                    targetEl.appendChild(widget);
                }
                mounted = true;
                break;
            }
        }

        renderAuthWidgets();
    }

    // 10. Reagowanie na zmiany stanu autoryzacji (LUMINA events & storage)
    window.addEventListener('lumina-auth-state', () => {
        renderAuthWidgets();
    });

    window.addEventListener('storage', (e) => {
        if (e.key === 'lumina_current_user' || e.key === 'lumina_current_user_profile' || e.key === 'lumina_user_session') {
            renderAuthWidgets();
        }
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', autoMountAuthWidget);
    } else {
        autoMountAuthWidget();
    }

})();
