/**
 * ══════════════════════════════════════════════════════════════════════════
 * LUMINA BOTTOM NAV PWA MODULE (lumina-bottom-nav.js)
 * Pływający Dolny Pasek Nawigacyjny UX (Mobile-First) dla Ekosystemu LUMINA
 * ══════════════════════════════════════════════════════════════════════════
 */
(() => {
    if (document.getElementById('luminaBottomNav')) return;

    // 1. Wstrzyknięcie Stylów CSS
    const styles = `
        /* ── LUMINA BOTTOM NAVIGATION BAR (PWA / Mobile) ── */
        .lumina-bottom-nav {
            position: fixed !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            width: 100% !important;
            height: 68px !important;
            background: rgba(11, 24, 56, 0.94) !important;
            backdrop-filter: blur(18px) !important;
            -webkit-backdrop-filter: blur(18px) !important;
            border-top: 1.5px solid rgba(250, 204, 21, 0.25) !important;
            box-shadow: 0 -8px 26px rgba(0, 0, 0, 0.65), 0 0 15px rgba(250, 204, 21, 0.1) !important;
            display: flex !important;
            align-items: center !important;
            justify-content: space-around !important;
            padding: 0 10px !important;
            padding-bottom: env(safe-area-inset-bottom, 6px) !important;
            z-index: 10000 !important;
            transition: transform 0.3s ease !important;
        }

        .lumina-nav-tab {
            flex: 1 !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
            text-decoration: none !important;
            color: #94a3b8 !important;
            font-family: 'Plus Jakarta Sans', sans-serif !important;
            font-size: 0.72rem !important;
            font-weight: 700 !important;
            gap: 4px !important;
            padding: 6px 2px !important;
            position: relative !important;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
            -webkit-tap-highlight-color: transparent !important;
        }

        .lumina-nav-tab i {
            font-size: 1.25rem !important;
            transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.2s ease !important;
        }

        .lumina-nav-tab.active {
            color: #facc15 !important;
        }

        .lumina-nav-tab.active i {
            color: #facc15 !important;
            transform: translateY(-2px) scale(1.15) !important;
            filter: drop-shadow(0 0 8px rgba(250, 204, 21, 0.5)) !important;
        }

        .lumina-nav-tab:hover {
            color: #f8fafc !important;
        }

        .lumina-nav-tab:active {
            transform: scale(0.92) !important;
        }

        .lumina-nav-badge {
            position: absolute !important;
            top: 2px !important;
            right: calc(50% - 16px) !important;
            width: 8px !important;
            height: 8px !important;
            border-radius: 50% !important;
            background: #ec4899 !important;
            box-shadow: 0 0 8px #ec4899 !important;
        }

        /* Dedykowany podgląd centralnego przycisku Radia CC */
        .lumina-nav-tab.tab-radio {
            position: relative !important;
        }
        .lumina-nav-tab.tab-radio .radio-glow {
            position: absolute !important;
            width: 38px !important;
            height: 38px !important;
            border-radius: 50% !important;
            background: rgba(234, 179, 8, 0.12) !important;
            border: 1px dashed rgba(234, 179, 8, 0.4) !important;
            animation: radioPulse 2.5s infinite linear !important;
            top: 4px !important;
            pointer-events: none !important;
        }

        @keyframes radioPulse {
            0% { transform: scale(0.9); opacity: 0.7; }
            50% { transform: scale(1.15); opacity: 0.3; }
            100% { transform: scale(0.9); opacity: 0.7; }
        }

        /* Dodanie bezpiecznego odstępu u dołu strony, aby treść nie była zasłonięta */
        body {
            padding-bottom: 78px !important;
        }

        /* Ukrycie na dużych monitorach jeśli nie jest w trybie responsive/mobile */
        @media (min-width: 1024px) {
            .lumina-bottom-nav {
                max-width: 540px !important;
                left: 50% !important;
                right: auto !important;
                transform: translateX(-50%) !important;
                border-radius: 24px 24px 0 0 !important;
                border: 1.5px solid rgba(250, 204, 21, 0.3) !important;
                border-bottom: none !important;
            }
        }
    `;

    const styleEl = document.createElement('style');
    styleEl.id = 'lumina-bottom-nav-styles';
    styleEl.textContent = styles;
    document.head.appendChild(styleEl);

    // 2. Określenie Aktywnej Karty
    const pathname = window.location.pathname.toLowerCase();
    const isDiscover = pathname.includes('lumina.html') || (pathname.endsWith('/lumina') && !pathname.includes('tablica') && !pathname.includes('women'));
    const isTablica = pathname.includes('lumina-tablica');
    const isWomen = pathname.includes('ccwomen') || pathname.includes('women');
    const isProfile = pathname.includes('lumina-profile') || pathname.includes('cezaryrgowski') || pathname.includes('wiolettarogowska');

    // Dynamiczny link do Mojego Profilu
    let myProfileHref = 'lumina-profile.html?u=cezaryrgowski';
    try {
        const curProf = JSON.parse(localStorage.getItem('lumina_current_user_profile') || 'null');
        if (curProf && (curProf.slug || curProf.uid)) {
            myProfileHref = `lumina-profile.html?u=${curProf.slug || curProf.uid}`;
        }
    } catch(e) {}

    // 3. Wstrzyknięcie Struktury HTML
    const navHtml = `
        <nav class="lumina-bottom-nav" id="luminaBottomNav" role="navigation" aria-label="Nawigacja mobilna LUMINA">
            <!-- 1. Odkrywaj -->
            <a href="lumina.html" class="lumina-nav-tab ${isDiscover ? 'active' : ''}" id="navTabDiscover">
                <i class="fa-solid fa-heart-circle-bolt"></i>
                <span>Odkrywaj</span>
            </a>

            <!-- 2. Tablica Społeczności -->
            <a href="lumina-tablica.html" class="lumina-nav-tab ${isTablica ? 'active' : ''}" id="navTabFeed">
                <i class="fa-solid fa-users-viewfinder"></i>
                <span>Tablica</span>
            </a>

            <!-- 3. Radio CC -->
            <a href="snadaniowa-live.html" class="lumina-nav-tab tab-radio" id="navTabRadio" title="Radio CC • Muzyka Uwielbienia">
                <div class="radio-glow"></div>
                <i class="fa-solid fa-radio" style="color: #facc15;"></i>
                <span>Radio CC</span>
            </a>

            <!-- 4. Czat Women -->
            <a href="lumina.ccwomen.html" class="lumina-nav-tab ${isWomen ? 'active' : ''}" id="navTabWomen">
                <i class="fa-solid fa-comments"></i>
                <div class="lumina-nav-badge"></div>
                <span>CC Women</span>
            </a>

            <!-- 5. Mój Profil -->
            <a href="${myProfileHref}" class="lumina-nav-tab ${isProfile ? 'active' : ''}" id="navTabProfile">
                <i class="fa-solid fa-user-gear"></i>
                <span>Mój Profil</span>
            </a>
        </nav>
    `;

    // Usuń ewentualne stare wersje paska nawigacji
    document.querySelectorAll('.lumina-mobile-nav, #mobileNav').forEach(el => el.remove());

    document.body.insertAdjacentHTML('beforeend', navHtml);
})();
