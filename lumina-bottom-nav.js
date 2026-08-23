/**
 * ══════════════════════════════════════════════════════════════════════════
 * LUMINA BOTTOM NAV PWA MODULE (lumina-bottom-nav.js)
 * Pływający Dolny Pasek Nawigacyjny UX (Mobile-First) dla Ekosystemu LUMINA
 * 1. Odkrywaj | 2. Tablica | 3. Wiadomości (Koperta z Live Badge) | 4. Kanały CC | 5. Sklep CC | 6. Mój Profil
 * ══════════════════════════════════════════════════════════════════════════
 */
(() => {
    if (document.getElementById('luminaBottomNav')) {
        document.getElementById('luminaBottomNav').remove();
    }

    // 1. Wstrzyknięcie Stylów CSS
    const styles = `
        
    /* ── LUMINA MOBILE TOP AUTH BAR (ZAŁÓŻ KONTO | LOGOWANIE) ── */
    .lumina-mobile-auth-bar {
        display: none;
    }

    @media (max-width: 900px) {
        .lumina-mobile-auth-bar {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 42px;
            background: linear-gradient(90deg, #131032 0%, #35084a 50%, #131032 100%);
            border-bottom: 1.5px solid rgba(236, 72, 153, 0.4);
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.45);
            position: sticky;
            top: 60px;
            left: 0;
            right: 0;
            z-index: 999;
            padding: 0 10px;
            box-sizing: border-box;
            user-select: none;
        }

        body.user-is-authenticated .lumina-mobile-auth-bar {
            display: none !important;
        }

        .mobile-auth-btn {
            background: transparent !important;
            border: none !important;
            color: #ffffff !important;
            font-family: 'Outfit', sans-serif !important;
            font-size: 0.82rem !important;
            font-weight: 800 !important;
            letter-spacing: 0.8px !important;
            text-transform: uppercase !important;
            display: inline-flex !important;
            align-items: center !important;
            gap: 6px !important;
            cursor: pointer !important;
            padding: 6px 10px !important;
            border-radius: 8px !important;
            text-decoration: none !important;
            transition: all 0.2s ease !important;
            -webkit-tap-highlight-color: transparent !important;
        }

        .mobile-auth-btn:active {
            transform: scale(0.96) !important;
            background: rgba(255, 255, 255, 0.12) !important;
        }

        .mobile-auth-btn.btn-reg {
            color: #fbcfe8 !important;
        }

        .mobile-auth-btn.btn-reg i {
            color: #f472b6 !important;
        }

        .mobile-auth-btn.btn-login {
            color: #fef08a !important;
        }

        .mobile-auth-btn.btn-login i {
            color: #facc15 !important;
        }

        .mobile-auth-sep {
            color: rgba(255, 255, 255, 0.25) !important;
            font-weight: 300 !important;
            font-size: 0.95rem !important;
            margin: 0 4px !important;
            user-select: none !important;
        }
    }

        /* ── LUMINA BOTTOM NAVIGATION BAR (Desktop Floating Dock & Mobile Bar) ── */
        .lumina-bottom-nav {
            position: fixed !important;
            bottom: 20px !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
            width: auto !important;
            min-width: 290px !important;
            max-width: 390px !important;
            height: 62px !important;
            background: rgba(9, 14, 30, 0.92) !important;
            backdrop-filter: blur(24px) saturate(180%) !important;
            -webkit-backdrop-filter: blur(24px) saturate(180%) !important;
            border: 1.5px solid rgba(250, 204, 21, 0.35) !important;
            border-radius: 36px !important;
            box-shadow: 0 12px 35px rgba(0, 0, 0, 0.8), 0 0 22px rgba(250, 204, 21, 0.18) !important;
            display: flex !important;
            align-items: center !important;
            justify-content: space-around !important;
            padding: 0 16px !important;
            z-index: 10000 !important;
            transition: transform 0.3s ease, opacity 0.3s ease !important;
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
            position: relative !important;
            font-size: 0.72rem !important;
            font-weight: 600 !important;
            gap: 4px !important;
            background: none !important;
            border: none !important;
            height: 100% !important;
            padding: 6px 14px !important;
            border-radius: 20px !important;
            cursor: pointer !important;
            transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        .lumina-nav-tab:hover {
            color: #facc15 !important;
            transform: translateY(-2px) !important;
            background: rgba(255, 255, 255, 0.06) !important;
        }
        .lumina-nav-tab:hover i {
            color: #facc15 !important;
            transform: scale(1.15) !important;
        }
        .lumina-nav-tab i {
            font-size: 1.25rem !important;
            transition: transform 0.2s ease, color 0.2s ease !important;
        }
        .lumina-nav-tab.active {
            color: #facc15 !important;
        }
        .lumina-nav-tab.active i {
            color: #facc15 !important;
            transform: scale(1.12) !important;
            text-shadow: 0 0 12px rgba(250, 204, 21, 0.6) !important;
        }

        body {
            padding-bottom: 85px !important;
        }

        @media (max-width: 900px) {
            .lumina-bottom-nav {
                bottom: 0 !important;
                left: 0 !important;
                right: 0 !important;
                transform: none !important;
                width: 100% !important;
                min-width: unset !important;
                max-width: unset !important;
                height: 68px !important;
                border-radius: 0 !important;
                border-left: none !important;
                border-right: none !important;
                border-bottom: none !important;
                padding: 0 4px !important;
                padding-bottom: env(safe-area-inset-bottom, 6px) !important;
            }
            .lumina-nav-tab {
                font-size: 0.65rem !important;
                padding: 4px 6px !important;
            }
            body {
                padding-bottom: 78px !important;
            }
        }

        /* ── POPUP MENU III TRZECH LINII (Centrum Mediów, TV & Profilu) ── */
        .lumina-bottom-menu-popup {
            position: fixed !important;
            bottom: 94px !important;
            left: 50% !important;
            transform: translateX(-50%) translateY(12px) scale(0.95) !important;
            width: 360px !important;
            max-width: 94vw !important;
            z-index: 10001 !important;
            opacity: 0 !important;
            pointer-events: none !important;
            transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
            display: none;
            flex-direction: column !important;
        }

        .lumina-bottom-menu-popup.open {
            display: flex !important;
            opacity: 1 !important;
            pointer-events: auto !important;
            transform: translateX(-50%) translateY(0) scale(1) !important;
        }

        .lumina-bottom-menu-card {
            background: rgba(11, 19, 41, 0.96) !important;
            backdrop-filter: blur(28px) saturate(190%) !important;
            -webkit-backdrop-filter: blur(28px) saturate(190%) !important;
            border: 1.5px solid rgba(250, 204, 21, 0.45) !important;
            border-radius: 26px !important;
            padding: 16px 14px !important;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.9), 0 0 25px rgba(250, 204, 21, 0.25) !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 8px !important;
        }

        .lumina-bottom-menu-header {
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            padding: 2px 8px 8px 8px !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
            font-size: 0.82rem !important;
            font-weight: 800 !important;
            color: #facc15 !important;
            font-family: 'Outfit', sans-serif !important;
            text-transform: uppercase !important;
            letter-spacing: 0.5px !important;
        }

        .lumina-bottom-menu-close {
            background: rgba(255, 255, 255, 0.08) !important;
            border: none !important;
            color: #cbd5e1 !important;
            width: 26px !important;
            height: 26px !important;
            border-radius: 50% !important;
            cursor: pointer !important;
            font-size: 1.1rem !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            transition: all 0.2s ease !important;
        }
        .lumina-bottom-menu-close:hover {
            background: rgba(239, 68, 68, 0.2) !important;
            color: #f87171 !important;
        }

        .lumina-bottom-menu-grid {
            display: flex !important;
            flex-direction: column !important;
            gap: 7px !important;
            margin-top: 4px !important;
        }

        .lumina-menu-btn {
            display: flex !important;
            align-items: center !important;
            gap: 12px !important;
            padding: 10px 12px !important;
            background: rgba(255, 255, 255, 0.04) !important;
            border: 1px solid rgba(255, 255, 255, 0.08) !important;
            border-radius: 16px !important;
            color: #ffffff !important;
            text-align: left !important;
            cursor: pointer !important;
            width: 100% !important;
            font-family: 'Plus Jakarta Sans', sans-serif !important;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
            text-decoration: none !important;
            box-sizing: border-box !important;
        }

        .lumina-menu-btn:hover {
            background: rgba(250, 204, 21, 0.12) !important;
            border-color: rgba(250, 204, 21, 0.4) !important;
            transform: translateX(3px) !important;
        }

        .lumina-menu-btn-icon {
            width: 40px !important;
            height: 40px !important;
            border-radius: 12px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            font-size: 1.15rem !important;
            flex-shrink: 0 !important;
        }

        .radio-icon-bg {
            background: linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(236, 72, 153, 0.25)) !important;
            border: 1px solid rgba(245, 158, 11, 0.5) !important;
            color: #facc15 !important;
        }

        .tv-icon-bg {
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.25), rgba(245, 158, 11, 0.25)) !important;
            border: 1px solid rgba(239, 68, 68, 0.5) !important;
            color: #f87171 !important;
        }

        .profile-icon-bg {
            background: linear-gradient(135deg, rgba(168, 85, 247, 0.25), rgba(56, 189, 248, 0.25)) !important;
            border: 1px solid rgba(168, 85, 247, 0.5) !important;
            color: #c084fc !important;
        }

        .admin-icon-bg {
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(250, 204, 21, 0.25)) !important;
            border: 1px solid rgba(16, 185, 129, 0.5) !important;
            color: #34d399 !important;
        }

        .lumina-menu-btn-content {
            flex: 1 !important;
            min-width: 0 !important;
        }

        .lumina-menu-btn-title {
            font-size: 0.88rem !important;
            font-weight: 800 !important;
            color: #ffffff !important;
            margin-bottom: 2px !important;
        }

        .lumina-menu-btn-sub {
            font-size: 0.72rem !important;
            color: #94a3b8 !important;
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
        }

        @media (max-width: 900px) {
            .lumina-bottom-menu-popup {
                bottom: 80px !important;
                width: 94vw !important;
            }
        }

        /* ── FLOATING CHAT BUBBLE BUTTON (DYMEK CZATU NAD SCROLL-TOP) ── */
        .lumina-floating-chat-btn {
            position: fixed !important;
            bottom: 88px !important;
            right: 24px !important;
            width: 50px !important;
            height: 50px !important;
            border-radius: 50% !important;
            background: linear-gradient(135deg, #ec4899, #8b5cf6) !important;
            border: 2px solid rgba(250, 204, 21, 0.75) !important;
            color: #ffffff !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            box-shadow: 0 8px 25px rgba(236, 72, 153, 0.5), 0 0 16px rgba(250, 204, 21, 0.35) !important;
            cursor: pointer !important;
            z-index: 99998 !important;
            transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease, background 0.25s ease !important;
            -webkit-tap-highlight-color: transparent !important;
            outline: none !important;
            text-decoration: none !important;
        }
        .lumina-floating-chat-btn:hover {
            transform: translateY(-4px) scale(1.08) !important;
            box-shadow: 0 12px 32px rgba(236, 72, 153, 0.7), 0 0 24px rgba(250, 204, 21, 0.55) !important;
            background: linear-gradient(135deg, #f43f5e, #a855f7) !important;
        }
        .lumina-floating-chat-btn:active {
            transform: translateY(1px) scale(0.95) !important;
        }
        .lumina-floating-chat-btn i {
            font-size: 1.35rem !important;
            color: #ffffff !important;
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3)) !important;
        }
        .lumina-floating-chat-badge {
            position: absolute !important;
            top: -3px !important;
            right: -3px !important;
            background: #ef4444 !important;
            color: #ffffff !important;
            font-size: 0.68rem !important;
            font-weight: 800 !important;
            font-family: 'Plus Jakarta Sans', sans-serif !important;
            width: 20px !important;
            height: 20px !important;
            border-radius: 50% !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            border: 2px solid #090d1a !important;
            box-shadow: 0 2px 8px rgba(0,0,0,0.5) !important;
        }

        @media (max-width: 768px) {
            .lumina-floating-chat-btn {
                bottom: 144px !important; /* Positioned directly above scroll-top (bottom: 88px) */
                right: 18px !important;
                width: 48px !important;
                height: 48px !important;
            }
            .lumina-floating-chat-btn i {
                font-size: 1.25rem !important;
            }
        }

        /* Modale CC Network, Wiadomości & Sklep */
        .cc-nav-modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(7, 14, 36, 0.88);
            backdrop-filter: blur(14px);
            -webkit-backdrop-filter: blur(14px);
            z-index: 100001;
            align-items: center;
            justify-content: center;
            padding: 16px;
        }
        .cc-nav-modal.open {
            display: flex !important;
            animation: fadeInModal 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes fadeInModal {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
        }
    `;

    const styleEl = document.createElement('style');
    styleEl.id = 'lumina-bottom-nav-styles';
    styleEl.textContent = styles;
    document.head.appendChild(styleEl);

    // 2. Określenie Aktywnej Karty
    const pathname = window.location.pathname.toLowerCase();
    const isDiscover = pathname.includes('lumina.html') || (pathname.endsWith('/lumina') && !pathname.includes('tablica') && !pathname.includes('women') && !pathname.includes('osobowosc') && !pathname.includes('radiocc') && !pathname.includes('cctv') && !pathname.includes('ccmen'));
    const isTablica = pathname.includes('lumina-tablica');
    const isProfile = pathname.includes('lumina-profile') || pathname.includes('cezaryrgowski') || pathname.includes('wiolettarogowska');

    // Dynamiczny link do Mojego Profilu (inteligentne rozpoznawanie zalogowanego użytkownika)
    let myProfileHref = 'lumina.cezaryrgowski.html';
    try {
        const isAdmin = localStorage.getItem('lumina_auth_master_admin') === 'true' || sessionStorage.getItem('lumina_auth_master_admin') === 'true';
        const curProf = JSON.parse(localStorage.getItem('lumina_current_user_profile') || localStorage.getItem('lumina_my_profile') || 'null');
        
        if (curProf && (curProf.slug || curProf.uid)) {
            const s = (curProf.slug || curProf.uid).toLowerCase();
            if (s === 'wiolettarogowska' || s.includes('wioletta')) {
                myProfileHref = 'lumina.wiolettarogowska.html';
            } else if (s === 'cezaryrgowski' || s.includes('cezary') || isAdmin) {
                myProfileHref = 'lumina.cezaryrgowski.html';
            } else {
                myProfileHref = `lumina-profile.html?u=${s}`;
            }
        } else if (!isAdmin) {
            // Domyślny profil dla niezalogowanego gościa / nowy profil
            myProfileHref = 'lumina-profile.html?u=moj_profil';
        }
    } catch(e) {}

    // Stan nieprzeczytanych wiadomości
    const initialUnread = parseInt(localStorage.getItem('lumina_messages_unread_count') || '1', 10);

    // 3. Wstrzyknięcie Struktury HTML
    const navHtml = `
        <!-- ══════════ PŁYWAJĄCY DYMEK CZATU (NAD PRZYCISKIEM SCROLL-TOP) ══════════ -->
        <button type="button" 
                id="luminaFloatingChatBtn" 
                class="lumina-floating-chat-btn" 
                onclick="window.openLuminaChatModal()" 
                title="Otwórz Czat & Wiadomości LUMINA" 
                aria-label="Czat i Wiadomości LUMINA">
            <i class="fa-solid fa-comment-dots"></i>
            <span id="floatingChatBadge" class="lumina-floating-chat-badge" style="${initialUnread > 0 ? 'display:flex;' : 'display:none;'}">${initialUnread > 9 ? '9+' : initialUnread}</span>
        </button>

        <!-- ══════════ POPUP ROZWIJANY Z IKONY III TRZECH LINII (Menu Mediów, TV & Profilu) ══════════ -->
        <div id="luminaBottomMenuPopup" class="lumina-bottom-menu-popup">
            <div class="lumina-bottom-menu-card">
                <div class="lumina-bottom-menu-header">
                    <span>Centrum Mediów & Opcji</span>
                    <button type="button" onclick="window.toggleCcBottomNavMenu(event)" class="lumina-bottom-menu-close" title="Zamknij">&times;</button>
                </div>
                <div class="lumina-bottom-menu-grid">
                    <!-- 1. Radio CC 24/7 -->
                    <button type="button" class="lumina-menu-btn" onclick="window.toggleRadio(); window.toggleCcBottomNavMenu(event);" title="Włącz / Wyłącz Radio Christian Culture 24/7">
                        <div class="lumina-menu-btn-icon radio-icon-bg">
                            <i class="fa-solid fa-radio" id="menuRadioNavIcon"></i>
                        </div>
                        <div class="lumina-menu-btn-content">
                            <div class="lumina-menu-btn-title">Radio CC 24/7</div>
                            <div class="lumina-menu-btn-sub" id="menuRadioStatusText">Muzyka Uwielbienia & Słowo</div>
                        </div>
                    </button>

                    <!-- 2. TV & Kanały CC -->
                    <button type="button" class="lumina-menu-btn" onclick="window.openCcNetworkModal(); window.toggleCcBottomNavMenu(event);" title="Kanały Nadawcze & YouTube Christian Culture NETWORK">
                        <div class="lumina-menu-btn-icon tv-icon-bg">
                            <i class="fa-solid fa-tv"></i>
                        </div>
                        <div class="lumina-menu-btn-content">
                            <div class="lumina-menu-btn-title">Telewizja & Sieć TV</div>
                            <div class="lumina-menu-btn-sub">CCTV24, Pasma & YouTube</div>
                        </div>
                    </button>

                    <!-- 3. Mój Profil / Ustawienia -->
                    <button type="button" class="lumina-menu-btn" onclick="window.handleBottomNavProfileClick(event); window.toggleCcBottomNavMenu(event);" title="Mój Profil / Panel Właściciela">
                        <div class="lumina-menu-btn-icon profile-icon-bg">
                            <i class="fa-solid fa-user-gear"></i>
                        </div>
                        <div class="lumina-menu-btn-content">
                            <div class="lumina-menu-btn-title">Mój Profil & Ustawienia</div>
                            <div class="lumina-menu-btn-sub">Edycja, Wiara & Konto</div>
                        </div>
                    </button>

                    <!-- 4. Master Admin (dla Dowódcy / Master Admin) -->
                    <button type="button" class="lumina-menu-btn admin-menu-btn" onclick="window.triggerSecretAdminPrompt(event); window.toggleCcBottomNavMenu(event);" title="Panel Master Admin">
                        <div class="lumina-menu-btn-icon admin-icon-bg">
                            <i class="fa-solid fa-shield-halved"></i>
                        </div>
                        <div class="lumina-menu-btn-content">
                            <div class="lumina-menu-btn-title">Master Admin 👑</div>
                            <div class="lumina-menu-btn-sub">Narzędzia & Telemetria</div>
                        </div>
                    </button>
                </div>
            </div>
        </div>

        <nav class="lumina-bottom-nav" id="luminaBottomNav" role="navigation" aria-label="Nawigacja dolna LUMINA">
            <!-- 1. Odkrywaj -->
            <a href="lumina.html" class="lumina-nav-tab ${isDiscover ? 'active' : ''}" id="navTabDiscover" title="Odkrywaj Chrześcijańskie Profile">
                <i class="fa-solid fa-heart-circle-bolt"></i>
            </a>

            <!-- 2. Tablica Społeczności -->
            <a href="lumina-tablica.html" class="lumina-nav-tab ${isTablica ? 'active' : ''}" id="navTabFeed" title="Główna Tablica Społeczności">
                <i class="fa-solid fa-users-viewfinder"></i>
            </a>

            <!-- 3. Menu Więcej (Trzy linie w pozycji poziomej: Radio, TV, Profil/Ustawienia, Master Admin) -->
            <button type="button" class="lumina-nav-tab" id="navTabMoreMenu" onclick="window.toggleCcBottomNavMenu(event)" title="Więcej opcji (Radio, TV, Profil, Master Admin)">
                <i class="fa-solid fa-bars" id="bottomNavBarsIcon"></i>
            </button>
        </nav>

        <!-- ══════════ MODAL DLA NIEZALOGOWANEGO GOŚCIA ══════════ -->
        <div class="cc-nav-modal" id="guestProfilePromptModal" onclick="if(event.target===this) this.classList.remove('open')">
            <div style="background:#0b1838; border:1.5px solid rgba(245,158,11,0.5); border-radius:24px; padding:28px 22px; max-width:440px; width:92%; text-align:center; box-shadow:0 24px 60px rgba(0,0,0,0.85); color:#fff; position:relative;">
                <button type="button" onclick="document.getElementById('guestProfilePromptModal').classList.remove('open')" style="position:absolute; top:16px; right:16px; background:rgba(255,255,255,0.08); border:none; color:#cbd5e1; width:32px; height:32px; border-radius:50%; cursor:pointer; font-size:1.1rem; display:flex; align-items:center; justify-content:center;">&times;</button>
                <div style="width:58px; height:58px; border-radius:50%; background:linear-gradient(135deg,#f59e0b,#ec4899); margin:0 auto 14px; display:flex; align-items:center; justify-content:center; font-size:1.5rem; color:#fff; box-shadow:0 0 20px rgba(245,158,11,0.4);">
                    <i class="fa-solid fa-user-lock"></i>
                </div>
                <h3 style="font-family:'Outfit',sans-serif; font-size:1.35rem; font-weight:800; margin-bottom:8px; color:#fff;">Twój Profil w LUMINA</h3>
                <p style="font-size:0.86rem; color:#cbd5e1; line-height:1.55; margin-bottom:20px;">
                    Aby zobaczyć swój profil, edytować dane lub publikować świadectwa, zaloguj się lub załóż bezpłatne konto chrześcijańskie w portalu.
                </p>
                <div style="display:flex; flex-direction:column; gap:10px;">
                    <a href="lumina.html#login" onclick="document.getElementById('guestProfilePromptModal').classList.remove('open'); if(window.openAuthModal) { window.openAuthModal(); return false; }" style="padding:12px; border-radius:20px; background:linear-gradient(135deg,#10b981,#059669); color:#fff; font-weight:800; text-decoration:none; display:flex; align-items:center; justify-content:center; gap:8px; box-shadow:0 4px 14px rgba(16,185,129,0.35);">
                        <i class="fa-solid fa-right-to-bracket"></i> Zaloguj się do Portalu
                    </a>
                    <a href="lumina.html#register" onclick="document.getElementById('guestProfilePromptModal').classList.remove('open'); if(window.openQuickRegisterModal) { window.openQuickRegisterModal(); return false; }" style="padding:12px; border-radius:20px; background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.2); color:#fff; font-weight:700; text-decoration:none; display:flex; align-items:center; justify-content:center; gap:8px;">
                        <i class="fa-solid fa-user-plus"></i> Załóż Bezpłatne Konto
                    </a>
                </div>
            </div>
        </div>

        <!-- ══════════ MODAL WIADOMOŚCI & CZATÓW ══════════ -->
        <div class="cc-nav-modal" id="modalCcMessages" onclick="if(event.target===this) this.classList.remove('open')">
            <div style="background:#0b1838; border:1.5px solid rgba(236,72,153,0.4); border-radius:24px; padding:24px 20px; max-width:480px; width:94%; max-height:85vh; overflow-y:auto; box-shadow:0 24px 60px rgba(0,0,0,0.85); color:#fff; position:relative;">
                <button type="button" onclick="document.getElementById('modalCcMessages').classList.remove('open')" style="position:absolute; top:16px; right:16px; background:rgba(255,255,255,0.08); border:none; color:#cbd5e1; width:32px; height:32px; border-radius:50%; cursor:pointer; font-size:1.1rem; display:flex; align-items:center; justify-content:center; -webkit-tap-highlight-color:transparent; z-index:10;">&times;</button>
                <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px; padding-right:32px;">
                    <div style="width:44px; height:44px; border-radius:14px; background:linear-gradient(135deg, #ec4899, #f59e0b); display:flex; align-items:center; justify-content:center; font-size:1.3rem; color:#fff; box-shadow:0 0 16px rgba(236,72,153,0.4);">
                        <i class="fa-solid fa-envelope-open-text"></i>
                    </div>
                    <div>
                        <h3 style="font-family:'Outfit',sans-serif; font-size:1.25rem; font-weight:800; color:#fff; margin:0;">Wiadomości & Czat</h3>
                        <p style="font-size:0.78rem; color:#ec4899; margin:0; font-weight:700;">☕ Zaproszenia na Kawę i Bezpośrednie Rozmowy</p>
                    </div>
                </div>
                
                <div style="display:flex; flex-direction:column; gap:10px;" id="ccMessagesModalList">
                    <div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:16px; padding:14px; display:flex; align-items:center; gap:12px; cursor:pointer;" onclick="window.location.href='lumina.html'">
                        <img src="avatar_cezary_official.jpg" alt="Cezary" style="width:46px; height:46px; border-radius:50%; object-fit:cover; border:1.5px solid #facc15;">
                        <div style="flex:1;">
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <span style="font-weight:800; font-size:0.92rem; color:#fff;">Cezary Rogowski</span>
                                <span style="font-size:0.72rem; color:#facc15; font-weight:700;">Kawa</span>
                            </div>
                            <div style="font-size:0.78rem; color:#cbd5e1; margin-top:2px;">Witaj w portalu LUMINA! Szczęść Boże 🕊️</div>
                        </div>
                    </div>

                    <div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:16px; padding:14px; display:flex; align-items:center; gap:12px; cursor:pointer;" onclick="window.location.href='lumina.ccwomen.html'">
                        <img src="logo_cc_women.jpg?v=20260820" alt="CC Women" style="width:46px; height:46px; border-radius:50%; object-fit:cover; border:1.5px solid #ec4899;">
                        <div style="flex:1;">
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <span style="font-weight:800; font-size:0.92rem; color:#fff;">Wspólnota CC Women</span>
                                <span style="font-size:0.72rem; color:#94a3b8;">Grupa</span>
                            </div>
                            <div style="font-size:0.78rem; color:#cbd5e1; margin-top:2px;">Codzienna modlitwa wstawiennicza kobiet ✨</div>
                        </div>
                    </div>
                </div>

                <div style="margin-top:16px; text-align:center;">
                    <a href="lumina.html" style="display:inline-block; font-size:0.82rem; color:#facc15; text-decoration:none; font-weight:700;">
                        Odkryj nowe profile i zaproś kogoś na Kawę
                    </a>
                </div>
            </div>
        </div>

        <!-- ══════════ MODAL CHRISTIAN CULTURE NETWORK ══════════ -->
        <div class="cc-nav-modal" id="modalCcNetwork" onclick="if(event.target===this) this.classList.remove('open')">
            <div style="background:#0b1838; border:1.5px solid rgba(250,204,21,0.4); border-radius:24px; padding:24px 20px; max-width:540px; width:94%; max-height:85vh; overflow-y:auto; box-shadow:0 24px 60px rgba(0,0,0,0.85); color:#fff; position:relative;">
                <button type="button" onclick="document.getElementById('modalCcNetwork').classList.remove('open')" style="position:absolute; top:16px; right:16px; background:rgba(255,255,255,0.08); border:none; color:#cbd5e1; width:32px; height:32px; border-radius:50%; cursor:pointer; font-size:1.1rem; display:flex; align-items:center; justify-content:center;">&times;</button>
                <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
                    <div style="width:44px; height:44px; border-radius:14px; background:linear-gradient(135deg, #f59e0b, #ef4444); display:flex; align-items:center; justify-content:center; font-size:1.3rem; color:#fff; box-shadow:0 0 16px rgba(245,158,11,0.4);">
                        <i class="fa-solid fa-tv"></i>
                    </div>
                    <div>
                        <h3 style="font-family:'Outfit',sans-serif; font-size:1.25rem; font-weight:800; color:#fff; margin:0;">Christian Culture NETWORK</h3>
                        <p style="font-size:0.78rem; color:#facc15; margin:0; font-weight:700;">Ponad 40 kanałów YouTube i stacji nadawczych</p>
                    </div>
                </div>
                
                <div style="display:flex; flex-direction:column; gap:10px;">
                    <a href="https://www.youtube.com/@RadioChristianCulture" target="_blank" rel="noopener noreferrer" class="network-item-link" style="display:flex; align-items:center; gap:14px; padding:12px 14px; border-radius:16px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); text-decoration:none; color:#fff; transition:background 0.2s;">
                        <i class="fa-solid fa-radio" style="font-size:1.3rem; color:#f59e0b; width:28px; text-align:center;"></i>
                        <div style="flex:1;">
                            <div style="font-weight:800; font-size:0.92rem;">Polskie Radio Christian Culture</div>
                            <div style="font-size:0.75rem; color:#94a3b8;">Główna stacja radiowa 24/7 z muzyką uwielbienia i słowem</div>
                        </div>
                        <i class="fa-solid fa-chevron-right" style="color:#64748b; font-size:0.85rem;"></i>
                    </a>

                    <a href="https://www.youtube.com/@ChristianCultureTV" target="_blank" rel="noopener noreferrer" class="network-item-link" style="display:flex; align-items:center; gap:14px; padding:12px 14px; border-radius:16px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); text-decoration:none; color:#fff; transition:background 0.2s;">
                        <i class="fa-solid fa-tv" style="font-size:1.3rem; color:#ef4444; width:28px; text-align:center;"></i>
                        <div style="flex:1;">
                            <div style="font-weight:800; font-size:0.92rem;">Christian Culture TV (CCTV24)</div>
                            <div style="font-size:0.75rem; color:#94a3b8;">Telewizja internetowa z pasmami wideo i transmisjami</div>
                        </div>
                        <i class="fa-solid fa-chevron-right" style="color:#64748b; font-size:0.85rem;"></i>
                    </a>

                    <a href="https://www.youtube.com/@CCWomen-w7h" target="_blank" rel="noopener noreferrer" class="network-item-link" style="display:flex; align-items:center; gap:14px; padding:12px 14px; border-radius:16px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); text-decoration:none; color:#fff; transition:background 0.2s;">
                        <i class="fa-solid fa-person-dress" style="font-size:1.3rem; color:#ec4899; width:28px; text-align:center;"></i>
                        <div style="flex:1;">
                            <div style="font-weight:800; font-size:0.92rem;">CC Women • Misja Kobiet</div>
                            <div style="font-size:0.75rem; color:#94a3b8;">Kobiety Wiary, świadectwa i modlitwa</div>
                        </div>
                        <i class="fa-solid fa-chevron-right" style="color:#64748b; font-size:0.85rem;"></i>
                    </a>

                    <a href="https://www.youtube.com/@CCMen7" target="_blank" rel="noopener noreferrer" class="network-item-link" style="display:flex; align-items:center; gap:14px; padding:12px 14px; border-radius:16px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); text-decoration:none; color:#fff; transition:background 0.2s;">
                        <i class="fa-solid fa-shield-halved" style="font-size:1.3rem; color:#0ea5e9; width:28px; text-align:center;"></i>
                        <div style="flex:1;">
                            <div style="font-weight:800; font-size:0.92rem;">CC MEN • Męska Wspólnota</div>
                            <div style="font-size:0.75rem; color:#94a3b8;">Mężczyźni w Chrystusie, odpowiedzialność i braterstwo</div>
                        </div>
                        <i class="fa-solid fa-chevron-right" style="color:#64748b; font-size:0.85rem;"></i>
                    </a>

                    <a href="https://www.youtube.com/@osobowo%C5%9B%C4%87PLUS" target="_blank" rel="noopener noreferrer" class="network-item-link" style="display:flex; align-items:center; gap:14px; padding:12px 14px; border-radius:16px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); text-decoration:none; color:#fff; transition:background 0.2s;">
                        <i class="fa-solid fa-brain" style="font-size:1.3rem; color:#8b5cf6; width:28px; text-align:center;"></i>
                        <div style="flex:1;">
                            <div style="font-weight:800; font-size:0.92rem;">OSOBOWOŚĆ +</div>
                            <div style="font-size:0.75rem; color:#94a3b8;">Formacja tożsamości, psychologia i dojrzałość chrześcijańska</div>
                        </div>
                        <i class="fa-solid fa-chevron-right" style="color:#64748b; font-size:0.85rem;"></i>
                    </a>

                    <a href="modlitwa.html" class="network-item-link" style="display:flex; align-items:center; gap:14px; padding:12px 14px; border-radius:16px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); text-decoration:none; color:#fff; transition:background 0.2s;">
                        <i class="fa-solid fa-hands-praying" style="font-size:1.3rem; color:#38bdf8; width:28px; text-align:center;"></i>
                        <div style="flex:1;">
                            <div style="font-weight:800; font-size:0.92rem;">Zjednoczeni za Polskę • Modlitwa 21:00</div>
                            <div style="font-size:0.75rem; color:#94a3b8;">Codzienna modlitwa wstawiennicza o Ojczyznę</div>
                        </div>
                        <i class="fa-solid fa-chevron-right" style="color:#64748b; font-size:0.85rem;"></i>
                    </a>
                </div>
            </div>
        </div>

        <!-- ══════════ MODAL SKLEPU CHRISTIAN CULTURE ══════════ -->
        <div class="cc-nav-modal" id="modalCcStore" onclick="if(event.target===this) this.classList.remove('open')">
            <div style="background:#0b1838; border:1.5px solid rgba(56,189,248,0.4); border-radius:24px; padding:24px 20px; max-width:480px; width:94%; max-height:85vh; overflow-y:auto; box-shadow:0 24px 60px rgba(0,0,0,0.85); color:#fff; position:relative; text-align:center;">
                <button type="button" onclick="document.getElementById('modalCcStore').classList.remove('open')" style="position:absolute; top:16px; right:16px; background:rgba(255,255,255,0.08); border:none; color:#cbd5e1; width:32px; height:32px; border-radius:50%; cursor:pointer; font-size:1.1rem; display:flex; align-items:center; justify-content:center;">&times;</button>
                <div style="width:54px; height:54px; border-radius:50%; background:linear-gradient(135deg, rgba(56,189,248,0.2), rgba(168,85,247,0.2)); border:2px solid #38bdf8; display:flex; align-items:center; justify-content:center; margin:0 auto 12px; font-size:1.6rem; color:#38bdf8; box-shadow:0 0 20px rgba(56,189,248,0.35);">
                    <i class="fa-solid fa-bag-shopping"></i>
                </div>
                <h3 style="font-family:'Outfit',sans-serif; font-size:1.35rem; font-weight:800; color:#fff; margin-bottom:6px;">Sklep Christian Culture</h3>
                <p style="font-size:0.85rem; color:#cbd5e1; margin-bottom:18px; line-height:1.5;">Kupując publikacje, muzykę i odzież z symbolami wiary, wspierasz rozwój ewangelizacji i darmowych mediów CC.</p>
                
                <a href="https://my-store-1009741.creator-spring.com/" target="_blank" rel="noopener noreferrer" style="display:block; width:100%; padding:12px 18px; border-radius:14px; background:linear-gradient(135deg, #38bdf8, #2563eb); color:#fff; text-decoration:none; font-weight:800; font-size:0.92rem; box-shadow:0 6px 20px rgba(56,189,248,0.35);">
                    Otwórz Sklep Creator Spring (Market CC) ➔
                </a>
            </div>
        </div>
    `;

    // 4. Globalne funkcje i Real-Time Live Badge dla Wiadomości i Pływającego Dymka
    window.updateLuminaMessagesBadge = function(count) {
        const badge = document.getElementById('floatingChatBadge');
        const bottomBadge = document.getElementById('bottomNavMsgBadge');
        const profileBadges = Array.from(document.querySelectorAll('.profile-msg-badge, #btnProfileMessageBadge, .btn-msg-badge, .nav-msg-badge'));
        const num = typeof count === 'number' ? count : parseInt(localStorage.getItem('lumina_messages_unread_count') || '0', 10);
        
        [badge, bottomBadge, ...profileBadges].forEach(b => {
            if (!b) return;
            if (num > 0) {
                b.style.display = 'flex';
                b.textContent = num > 9 ? '9+' : num;
            } else {
                b.style.display = 'none';
            }
        });
        localStorage.setItem('lumina_messages_unread_count', String(num));
    };

    window.openLuminaChatModal = function() {
        if (typeof window.openDirectMessagesModal === 'function') {
            window.openDirectMessagesModal();
        } else if (document.getElementById('directMessagesModal')) {
            const m = document.getElementById('directMessagesModal');
            m.classList.add('open');
            if (typeof window.switchMessengerMainTab === 'function') {
                window.switchMessengerMainTab('public');
            }
        } else {
            window.openCcMessagesModal();
        }
        window.updateLuminaMessagesBadge(0);
    };

    window.openCcMessagesModal = function() {
        if (typeof window.openDirectMessagesModal === 'function' || document.getElementById('directMessagesModal')) {
            window.openLuminaChatModal();
            return;
        }
        const m = document.getElementById('modalCcMessages');
        if (m) m.classList.add('open');
        window.updateLuminaMessagesBadge(0);
    };

    window.openCcNetworkModal = function() {
        const m = document.getElementById('modalCcNetwork');
        if (m) m.classList.add('open');
    };

    window.openCcStoreModal = function() {
        const m = document.getElementById('modalCcStore');
        if (m) m.classList.add('open');
    };

    window.toggleCcBottomNavMenu = function(e) {
        if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
        const popup = document.getElementById('luminaBottomMenuPopup');
        const menuBtn = document.getElementById('navTabMoreMenu');
        if (!popup) return;

        const isCurrentlyOpen = popup.classList.contains('open');
        if (isCurrentlyOpen) {
            popup.classList.remove('open');
            if (menuBtn) menuBtn.classList.remove('active');
        } else {
            popup.classList.add('open');
            if (menuBtn) menuBtn.classList.add('active');
        }
    };

    document.addEventListener('click', (e) => {
        const popup = document.getElementById('luminaBottomMenuPopup');
        const menuBtn = document.getElementById('navTabMoreMenu');
        if (popup && popup.classList.contains('open')) {
            if (!popup.contains(e.target) && (!menuBtn || !menuBtn.contains(e.target))) {
                popup.classList.remove('open');
                if (menuBtn) menuBtn.classList.remove('active');
            }
        }
    });

    window.handleBottomNavProfileClick = function(event) {
        if (event) event.preventDefault();
        const isAdmin = localStorage.getItem('lumina_auth_master_admin') === 'true' || sessionStorage.getItem('lumina_auth_master_admin') === 'true';
        let curProf = null;
        try {
            curProf = JSON.parse(localStorage.getItem('lumina_current_user_profile') || localStorage.getItem('lumina_my_profile') || 'null');
        } catch(e) {}
        
        const hasSession = (localStorage.getItem('lumina_user_session') === 'active') || (curProf && (curProf.slug || curProf.uid));

        if (isAdmin) {
            window.location.href = 'lumina.cezaryrgowski.html';
            return;
        }

        if (hasSession && curProf && (curProf.slug || curProf.uid)) {
            const s = (curProf.slug || curProf.uid).toLowerCase();
            if (s === 'wiolettarogowska' || s.includes('wioletta')) {
                window.location.href = 'lumina.wiolettarogowska.html';
            } else if (s === 'cezaryrgowski' || s.includes('cezary')) {
                window.location.href = 'lumina.cezaryrgowski.html';
            } else {
                window.location.href = `lumina-profile.html?u=${s}`;
            }
            return;
        }

        // Niezalogowany gość -> Pokaż dedykowany modal z zaproszeniem do logowania/rejestracji!
        const modal = document.getElementById('guestProfilePromptModal');
        if (modal) {
            modal.classList.add('open');
        } else if (typeof window.openAuthModal === 'function') {
            window.openAuthModal();
        } else if (typeof window.openQuickRegisterModal === 'function') {
            window.openQuickRegisterModal();
        } else {
            window.location.href = 'lumina.html#login';
        }
    };

    // 5. Nasłuch zdarzeń w czasie rzeczywistym
    window.addEventListener('lumina:new_message', (e) => {
        const cur = parseInt(localStorage.getItem('lumina_messages_unread_count') || '0', 10);
        window.updateLuminaMessagesBadge(cur + 1);
    });

    window.addEventListener('lumina:coffee_invite', (e) => {
        const cur = parseInt(localStorage.getItem('lumina_messages_unread_count') || '0', 10);
        window.updateLuminaMessagesBadge(cur + 1);
    });

    window.addEventListener('lumina-push-message', (e) => {
        const cur = parseInt(localStorage.getItem('lumina_messages_unread_count') || '0', 10);
        window.updateLuminaMessagesBadge(cur + 1);
    });

    // Usuń ewentualne stare wersje paska nawigacji
    document.querySelectorAll('.lumina-mobile-nav, #mobileNav').forEach(el => el.remove());

    
    // ══════════════════════════════════════════════════════════════════════════
    // TAJNY SUBTELNY PRZYCISK & DOWIĄZANIA ADMINISTRATORA PORTALU LUMINA
    // ══════════════════════════════════════════════════════════════════════════
    const ADMIN_HASH = 'eec0ae2663b74fdb9fb9981e92f1b2cc2a8b42444d358776d872580c79454c91';

    window.triggerSecretAdminPrompt = async function(e) {
        if (e && typeof e.stopPropagation === 'function') e.stopPropagation();

        // ══ PRIORYTET 1: Deleguj do LuminaAdminSuite gdy panel jest gotowy ══
        if (window.LuminaAdminSuite && typeof window.LuminaAdminSuite.openPinPrompt === 'function') {
            const isCurrentlyAdmin = (
                sessionStorage.getItem('lumina_auth_master_admin') === 'true' ||
                localStorage.getItem('lumina_auth_master_admin') === 'true'
            );
            if (isCurrentlyAdmin) {
                // Już zalogowany — otwieramy panel quickModal z Tarczą
                if (typeof window.LuminaAdminSuite.openAllProfilesManager === 'function') {
                    window.LuminaAdminSuite.openAllProfilesManager();
                } else {
                    window.LuminaAdminSuite.openPinPrompt();
                }
            } else {
                // Niezalogowany — uruchamiamy uwierzytelnienie via LuminaAdminSuite
                window.LuminaAdminSuite.openPinPrompt();
            }
            return;
        }

        // ══ FALLBACK: LuminaAdminSuite jeszcze niedostępne — własna weryfikacja PIN ══
        const isCurrentlyAdmin = (sessionStorage.getItem('lumina_auth_master_admin') === 'true' || localStorage.getItem('lumina_auth_master_admin') === 'true');
        if (isCurrentlyAdmin) {
            const confirmLock = confirm('👑 Jesteś obecnie zalogowany jako Główny Administrator Portalu LUMINA.\n\nCzy chcesz ZABLOKOWAĆ tryb Administratora i przejść do widoku zwykłego gościa?');
            if (confirmLock) {
                sessionStorage.removeItem('lumina_auth_master_admin');
                localStorage.removeItem('lumina_auth_master_admin');
                document.body.classList.remove('owner-mode-active');
                if (typeof window.checkOwnerAuthSession === 'function') window.checkOwnerAuthSession();
                const toastFn = window.showToast || window.luminaToast || alert;
                toastFn('🔒 Zablokowano tryb Administratora (Tryb Gościa)');
                setTimeout(() => window.location.reload(), 400);
            }
            return;
        }

        const inputPin = prompt('🔐 Autoryzacja Administratora Portalu LUMINA:');
        if (!inputPin) return;

        try {
            const msgBuffer = new TextEncoder().encode(inputPin.trim());
            const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

            if (hash === ADMIN_HASH) {
                sessionStorage.setItem('lumina_auth_master_admin', 'true');
                localStorage.setItem('lumina_auth_master_admin', 'true');
                document.body.classList.add('owner-mode-active');
                if (typeof window.checkOwnerAuthSession === 'function') window.checkOwnerAuthSession();
                // Spróbuj otworzyć panel bezpośrednio jeśli suite załadowało się w tym czasie
                if (window.LuminaAdminSuite && typeof window.LuminaAdminSuite.checkAndApplyAdminState === 'function') {
                    window.LuminaAdminSuite.checkAndApplyAdminState();
                    if (typeof window.LuminaAdminSuite.openAllProfilesManager === 'function') {
                        window.LuminaAdminSuite.openAllProfilesManager();
                    }
                    const toastFn = window.showToast || window.luminaToast || alert;
                    toastFn('👑 Witaj Dowódco! Panel Master Admin aktywowany.');
                } else {
                    const toastFn = window.showToast || window.luminaToast || alert;
                    toastFn('👑 Witaj Dowódco! Panel Administratora Portalu Aktywowany.');
                    setTimeout(() => window.location.reload(), 500);
                }
            } else {
                const toastFn = window.showToast || window.luminaToast || alert;
                toastFn('❌ Błędny kod autoryzacji! Odmowa dostępu.');
            }
        } catch(err) {
            console.error('Błąd weryfikacji:', err);
        }
    };

    // Skrót klawiszowy: Ctrl + Shift + A lub Ctrl + Shift + E
    window.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a' || e.key === 'E' || e.key === 'e')) {
            e.preventDefault();
            window.triggerSecretAdminPrompt();
        }
    });

    // Tajne podpięcie pod logo LUMINA w nagłówku
    setTimeout(() => {
        const brands = document.querySelectorAll('.nav-brand, .lumina-brand, #navBrandLogo, .nav-logo-wrap');
        brands.forEach(el => {
            el.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                window.triggerSecretAdminPrompt();
            });
        });
    }, 1000);

    document.body.insertAdjacentHTML('beforeend', navHtml);
    // ══════════════════════════════════════════════════════════════════════════
    // GLOBALNY MOBILNY PASEK LOGOWANIA / REJESTRACJI (ZAŁÓŻ KONTO | LOGOWANIE)
    // ══════════════════════════════════════════════════════════════════════════
    window.triggerLuminaRegister = function(e) {
        if (e && typeof e.preventDefault === 'function') e.preventDefault();
        const authModal = document.getElementById('authModal');
        if (typeof window.switchAuthTab === 'function' && authModal) {
            window.switchAuthTab('register');
            authModal.classList.add('open');
            authModal.style.display = 'flex';
        } else {
            window.location.href = 'lumina.html?auth=register';
        }
    };

    window.triggerLuminaLogin = function(e) {
        if (e && typeof e.preventDefault === 'function') e.preventDefault();
        const authModal = document.getElementById('authModal');
        if (typeof window.switchAuthTab === 'function' && authModal) {
            window.switchAuthTab('login');
            authModal.classList.add('open');
            authModal.style.display = 'flex';
        } else {
            window.location.href = 'lumina.html?auth=login';
        }
    };

    window.checkLuminaAuthState = function() {
        let isAuthenticated = false;

        // 1. Sprawdź tryb Administratora
        if (sessionStorage.getItem('lumina_auth_master_admin') === 'true' || 
            localStorage.getItem('lumina_auth_master_admin') === 'true') {
            isAuthenticated = true;
        }

        // 2. Sprawdź zalogowanego użytkownika LuminaDB / Firebase
        if (!isAuthenticated && window.LuminaDB && typeof window.LuminaDB.getCurrentUser === 'function') {
            const u = window.LuminaDB.getCurrentUser();
            if (u && (u.uid || u.email)) isAuthenticated = true;
        }

        if (!isAuthenticated && window.firebaseAuth && window.firebaseAuth.currentUser) {
            isAuthenticated = true;
        }

        // 3. Sprawdź klucze pamięci podręcznej sesji użytkownika
        if (!isAuthenticated) {
            for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i);
                if (k && (k.startsWith('firebase:authUser:') || k === 'lumina_user_profile' || k === 'lumina_current_user_data')) {
                    const val = localStorage.getItem(k);
                    if (val && val !== 'null' && val !== '{}') {
                        isAuthenticated = true;
                        break;
                    }
                }
            }
        }

        const bar = document.getElementById('luminaMobileAuthBar');
        if (isAuthenticated) {
            document.body.classList.add('user-is-authenticated');
            if (bar) bar.style.setProperty('display', 'none', 'important');
        } else {
            document.body.classList.remove('user-is-authenticated');
            if (bar && window.innerWidth <= 900) {
                bar.style.display = 'flex';
            }
        }
    };

    // Wstrzyknięcie Paska do DOM (pod nagłówek)
    function injectMobileAuthBar() {
        if (document.getElementById('luminaMobileAuthBar')) return;

        const barHtml = `
            <div id="luminaMobileAuthBar" class="lumina-mobile-auth-bar">
                <button type="button" class="mobile-auth-btn btn-reg" onclick="window.triggerLuminaRegister(event)">
                    <i class="fa-solid fa-sparkles"></i> ZAŁÓŻ KONTO
                </button>
                <span class="mobile-auth-sep">|</span>
                <button type="button" class="mobile-auth-btn btn-login" onclick="window.triggerLuminaLogin(event)">
                    <i class="fa-solid fa-arrow-right-to-bracket"></i> LOGOWANIE
                </button>
            </div>
        `;

        // Znajdź górny navbar (.portal-nav lub .profile-navbar lub nav)
        const topNav = document.querySelector('.portal-nav, .profile-navbar, nav');
        if (topNav && topNav.parentNode) {
            topNav.insertAdjacentHTML('afterend', barHtml);
        } else {
            document.body.insertAdjacentHTML('afterbegin', barHtml);
        }

        window.checkLuminaAuthState();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            injectMobileAuthBar();
            window.checkLuminaAuthState();
        });
    } else {
        injectMobileAuthBar();
        window.checkLuminaAuthState();
    }

    // Nasłuchiwanie zmian sesji
    window.addEventListener('lumina_auth_changed', window.checkLuminaAuthState);
    window.addEventListener('storage', window.checkLuminaAuthState);
    window.addEventListener('resize', window.checkLuminaAuthState);
    setInterval(window.checkLuminaAuthState, 1200);

    // ══════════════════════════════════════════════════════════════════════════
    // GOOGLE CONSENT MODE V2 & RODO BANNER PORTALU LUMINA
    // ══════════════════════════════════════════════════════════════════════════
    window.acceptLuminaCookies = function() {
        try { localStorage.setItem('lumina_cookie_consent', 'granted'); } catch(e) {}
        if (typeof window.gtag === 'function') {
            try {
                window.gtag('consent', 'update', {
                    'ad_storage': 'granted',
                    'ad_user_data': 'granted',
                    'ad_personalization': 'granted',
                    'analytics_storage': 'granted'
                });
            } catch(e) {}
        }
        const b1 = document.getElementById('luminaCookieConsentBanner');
        if (b1) { b1.style.opacity = '0'; setTimeout(() => b1.remove(), 200); }
        const b2 = document.getElementById('lumina-cookie-banner');
        if (b2) { b2.style.opacity = '0'; setTimeout(() => b2.remove(), 200); }
    };

    function injectCookieConsentBanner() {
        if (localStorage.getItem('lumina_cookie_consent') === 'granted') {
            if (typeof window.gtag === 'function') {
                try {
                    window.gtag('consent', 'update', {
                        'ad_storage': 'granted',
                        'ad_user_data': 'granted',
                        'ad_personalization': 'granted',
                        'analytics_storage': 'granted'
                    });
                } catch(e) {}
            }
            return;
        }

        if (document.getElementById('luminaCookieConsentBanner')) return;

        // Positioned directly ABOVE the detailed cookie banner (jedno pod drugim)
        const bannerHtml = `
            <div id="luminaCookieConsentBanner" style="position:fixed; bottom:145px; right:20px; max-width:460px; background:rgba(9,14,30,0.96); backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px); border:1px solid rgba(250,204,21,0.45); border-radius:16px; padding:12px 16px; box-shadow:0 12px 35px rgba(0,0,0,0.8); z-index:9999999; display:flex; align-items:center; justify-content:space-between; gap:12px; font-family:'Plus Jakarta Sans',sans-serif; color:#e2e8f0; transition:all 0.3s ease;">
                <div style="font-size:0.8rem; line-height:1.4; flex:1;">
                    <i class="fa-solid fa-shield-halved" style="color:#facc15; margin-right:4px;"></i>
                    Portal <b>LUMINA</b> szanuje Twoją prywatność. Używamy plików cookies i analityki do prawidłowego działania serwisu.
                </div>
                <div style="display:flex; align-items:center; gap:8px;">
                    <button type="button" onclick="window.acceptLuminaCookies()" style="background:linear-gradient(135deg, #f59e0b, #d97706); border:none; color:#fff; font-weight:800; font-size:0.78rem; padding:8px 14px; border-radius:10px; cursor:pointer; font-family:inherit; box-shadow:0 4px 12px rgba(245,158,11,0.35); white-space:nowrap;">
                        Zgadzam się ➔
                    </button>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', bannerHtml);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => {
            injectCookieConsentBanner();
            loadLuminaRadioScript();
        });
    } else {
        injectCookieConsentBanner();
        loadLuminaRadioScript();
    }

    function loadLuminaRadioScript() {
        if (window.LuminaRadioEngineInitialized) return;
        if (!document.querySelector('script[src*="lumina-radio.js"]')) {
            const radioScript = document.createElement('script');
            radioScript.src = 'lumina-radio.js?v=' + Date.now();
            radioScript.defer = true;
            document.body.appendChild(radioScript);
        }
    }

})();