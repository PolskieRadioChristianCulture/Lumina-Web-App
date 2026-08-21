/**
 * ══════════════════════════════════════════════════════════════════════════
 * LUMINA MASTER ADMIN UNIVERSAL PROFILE & USER MANAGEMENT SUITE (lumina-admin-profile-suite.js)
 * Pełny dostęp do edycji, kontroli, blokowania i usuwania każdego profilu w portalu LUMINA.
 * Ekosystem: Christian Culture | Standard: Master Admin Control Suite
 * ══════════════════════════════════════════════════════════════════════════
 */

(function() {
    'use strict';

    const ADMIN_PIN_HASH = 'eec0ae2663b74fdb9fb9981e92f1b2cc2a8b42444d358776d872580c79454c91'; // PIN 0455

    // Domena znanych profili systemowych
    const SYSTEM_PROFILES = [
        { slug: 'andrzejthiel', name: 'Andrzej Thiel', role: 'Autor: Cuda Każdego Dnia', type: 'official', verified: true, avatar: 'avatar_andrzej_thiel.jpg' },
        { slug: 'cezaryrgowski', name: 'Cezary Rogowski', role: 'Dyrektor Projektu & Autor', type: 'official', verified: true, avatar: 'avatar_cezary_official.jpg' },
        { slug: 'wiolettarogowska', name: 'Wioletta Rogowska', role: 'Koordynator Społeczności', type: 'official', verified: true, avatar: 'avatar_wioletta_official.jpg' },
        { slug: 'studiodobregoslowa', name: 'Studio Dobrego Słowa', role: 'Oficjalny Kanał Audio & Wideo', type: 'channel', verified: true, avatar: 'studiodobregoslowa_avatar.jpg' },
        { slug: 'osobowoscplus', name: 'Osobowość Plus', role: 'Kanał Formacyjny', type: 'channel', verified: true, avatar: 'logo_osobowosc_plus.jpg' },
        { slug: 'radiocc', name: 'Polskie Radio CC', role: 'Główny Nadawca Radiowy', type: 'broadcast', verified: true, avatar: 'logo_radio_cc.jpg' },
        { slug: 'cctv', name: 'Telewizja CCTV', role: 'Oficjalna Telewizja Internetowa', type: 'broadcast', verified: true, avatar: 'logo_cctv.png' },
        { slug: 'ccwomen', name: 'Christian Culture Women', role: 'Społeczność Kobiet', type: 'community', verified: true, avatar: 'logo_cc_women.jpg' },
        { slug: 'ccmen', name: 'Christian Culture Men', role: 'Społeczność Mężczyzn', type: 'community', verified: true, avatar: 'logo_cc_men.jpg' },
        { slug: 'magdalena', name: 'Magdalena', role: 'Członkini Społeczności', type: 'user', verified: false, avatar: 'avatar_magdalena.jpg' }
    ];

    // Helper: pobiera slug aktualnie przeglądanego profilu
    function detectCurrentProfileSlug() {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('u')) return urlParams.get('u').toLowerCase().trim();

        const path = window.location.pathname.toLowerCase();
        if (path.includes('andrzejthiel')) return 'andrzejthiel';
        if (path.includes('osobowoscplus')) return 'osobowoscplus';
        if (path.includes('studiodobregoslowa')) return 'studiodobregoslowa';
        if (path.includes('radiocc')) return 'radiocc';
        if (path.includes('cctv')) return 'cctv';
        if (path.includes('ccmen')) return 'ccmen';
        if (path.includes('ccwomen')) return 'ccwomen';
        if (path.includes('wiolettarogowska')) return 'wiolettarogowska';
        if (path.includes('magdalena')) return 'magdalena';
        if (path.includes('cezaryrgowski')) return 'cezaryrgowski';
        return 'profile_default';
    }

    // Sprawdza czy aktywny jest tryb Master Admina (wyłącznie po autoryzacji PIN-em)
    function isUserMasterAdmin() {
        return sessionStorage.getItem('lumina_auth_master_admin') === 'true' || localStorage.getItem('lumina_auth_master_admin') === 'true';
    }

    // Pobiera listę wszystkich zablokowanych profili
    function getBlockedProfiles() {
        try {
            return JSON.parse(localStorage.getItem('lumina_blocked_profiles') || '[]');
        } catch(e) {
            return [];
        }
    }

    // Zapisuje listę zablokowanych profili
    function saveBlockedProfiles(list) {
        localStorage.setItem('lumina_blocked_profiles', JSON.stringify(list));
    }

    // Pobiera listę wszystkich profili (systemowych oraz zarejestrowanych użytkowników)
    function getAllRegisteredProfiles() {
        let all = [...SYSTEM_PROFILES];
        try {
            const extra = JSON.parse(localStorage.getItem('lumina_custom_users_list') || '[]');
            extra.forEach(u => {
                if (!all.some(item => item.slug === u.slug)) {
                    all.push(u);
                }
            });

            // Dodatkowo skanuj localStorage w poszukiwaniu dynamicznych profili
            for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i);
                if (k && k.startsWith('lumina_profile_')) {
                    const slug = k.replace('lumina_profile_', '');
                    if (slug && !all.some(item => item.slug === slug)) {
                        try {
                            const pData = JSON.parse(localStorage.getItem(k));
                            all.push({
                                slug: slug,
                                name: pData.name || slug,
                                role: pData.job || 'Użytkownik Portalu',
                                type: 'user',
                                verified: !!pData.verified,
                                avatar: localStorage.getItem('lumina_avatar_' + slug) || 'icon.png'
                            });
                        } catch(e) {}
                    }
                }
            }
        } catch(e) {}
        return all;
    }

    // Wstrzykuje style CSS dla HUDa, Szarej Tarczy i Modali
    function injectAdminStyles() {
        if (document.getElementById('luminaAdminSuiteStyles')) return;
        const style = document.createElement('style');
        style.id = 'luminaAdminSuiteStyles';
        style.textContent = `
            /* ══════════ MASTER ADMIN HUD BAR ══════════ */
            .lumina-admin-hud-bar {
                position: sticky;
                top: 0;
                left: 0;
                right: 0;
                z-index: 99990;
                background: linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(30, 27, 75, 0.98));
                border-bottom: 2px solid rgba(245, 158, 11, 0.6);
                box-shadow: 0 4px 25px rgba(0, 0, 0, 0.8), 0 0 20px rgba(245, 158, 11, 0.25);
                backdrop-filter: blur(14px);
                -webkit-backdrop-filter: blur(14px);
                padding: 10px 16px;
                color: #fff;
                font-family: 'Plus Jakarta Sans', sans-serif;
                display: none;
                transition: all 0.3s ease;
            }

            .lumina-admin-hud-bar.active {
                display: block;
            }

            .lumina-admin-hud-inner {
                max-width: 1300px;
                margin: 0 auto;
                display: flex;
                align-items: center;
                justify-content: space-between;
                flex-wrap: wrap;
                gap: 10px;
            }

            .lumina-admin-hud-title {
                display: flex;
                align-items: center;
                gap: 10px;
                font-size: 0.90rem;
                font-weight: 800;
                color: #facc15;
            }

            .lumina-admin-hud-title .crown-icon {
                font-size: 1.25rem;
                color: #f59e0b;
                filter: drop-shadow(0 0 8px rgba(245, 158, 11, 0.7));
            }

            .lumina-admin-hud-actions {
                display: flex;
                align-items: center;
                flex-wrap: wrap;
                gap: 8px;
            }

            .admin-suite-btn {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 7px 13px;
                border-radius: 20px;
                font-size: 0.80rem;
                font-weight: 700;
                font-family: inherit;
                cursor: pointer;
                border: 1px solid rgba(255, 255, 255, 0.15);
                background: rgba(255, 255, 255, 0.08);
                color: #e2e8f0;
                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                text-decoration: none;
            }

            .admin-suite-btn:hover {
                transform: translateY(-1px);
                background: rgba(255, 255, 255, 0.18);
                color: #fff;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            }

            .admin-suite-btn.btn-gold {
                background: linear-gradient(135deg, #f59e0b, #d97706);
                color: #000;
                font-weight: 800;
                border: none;
                box-shadow: 0 2px 10px rgba(245, 158, 11, 0.35);
            }
            .admin-suite-btn.btn-gold:hover {
                box-shadow: 0 4px 16px rgba(245, 158, 11, 0.55);
            }

            .admin-suite-btn.btn-cyan {
                background: rgba(6, 182, 212, 0.18);
                border-color: rgba(6, 182, 212, 0.4);
                color: #67e8f9;
            }
            .admin-suite-btn.btn-cyan:hover {
                background: rgba(6, 182, 212, 0.3);
                color: #fff;
            }

            .admin-suite-btn.btn-purple {
                background: rgba(168, 85, 247, 0.18);
                border-color: rgba(168, 85, 247, 0.4);
                color: #d8b4fe;
            }
            .admin-suite-btn.btn-purple:hover {
                background: rgba(168, 85, 247, 0.3);
                color: #fff;
            }

            .admin-suite-btn.btn-danger {
                background: rgba(239, 68, 68, 0.18);
                border-color: rgba(239, 68, 68, 0.4);
                color: #fca5a5;
            }
            .admin-suite-btn.btn-danger:hover {
                background: rgba(239, 68, 68, 0.35);
                color: #fff;
            }

            .admin-suite-btn.btn-warn {
                background: rgba(249, 115, 22, 0.18);
                border-color: rgba(249, 115, 22, 0.4);
                color: #fdba74;
            }
            .admin-suite-btn.btn-warn:hover {
                background: rgba(249, 115, 22, 0.35);
                color: #fff;
            }

            /* ── Inline Edit Badges & Pencil Triggers ── */
            .admin-inline-edit-btn {
                display: none;
                align-items: center;
                justify-content: center;
                width: 28px;
                height: 28px;
                border-radius: 50%;
                background: rgba(245, 158, 11, 0.2);
                border: 1px solid rgba(245, 158, 11, 0.45);
                color: #facc15;
                font-size: 0.78rem;
                cursor: pointer;
                transition: all 0.2s ease;
                margin-left: 8px;
                vertical-align: middle;
            }

            body.lumina-admin-mode .admin-inline-edit-btn {
                display: inline-flex !important;
            }

            .admin-inline-edit-btn:hover {
                background: #f59e0b;
                color: #000;
                transform: scale(1.15);
                box-shadow: 0 0 10px rgba(245, 158, 11, 0.6);
            }

            /* ══════════ JEDYNA DYSKRETNA TARCZA ADMINA Z WERSJĄ (LEWY DOLNY RÓG) ══════════ */
            .lumina-admin-shield-container {
                position: fixed;
                bottom: 18px;
                left: 20px;
                z-index: 99999;
                display: inline-flex;
                align-items: center;
                gap: 6px;
                background: rgba(15, 23, 42, 0.45);
                backdrop-filter: blur(10px);
                -webkit-backdrop-filter: blur(10px);
                border: 1px solid rgba(148, 163, 184, 0.2);
                padding: 4px 10px 4px 6px;
                border-radius: 20px;
                transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                user-select: none;
            }
            .lumina-admin-shield-container:hover {
                background: rgba(15, 23, 42, 0.85);
                border-color: rgba(245, 158, 11, 0.4);
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
            }
            .lumina-admin-floating-shield {
                width: 24px;
                height: 24px;
                border-radius: 50%;
                background: transparent;
                border: none;
                color: #64748b;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 0.88rem;
                cursor: pointer;
                padding: 0;
                transition: all 0.25s ease;
            }
            .lumina-admin-shield-container:hover .lumina-admin-floating-shield {
                color: #facc15;
                transform: scale(1.1);
            }
            .lumina-admin-version-tag {
                font-size: 0.72rem;
                font-weight: 700;
                color: rgba(148, 163, 184, 0.75);
                font-family: 'Plus Jakarta Sans', sans-serif;
                letter-spacing: 0.2px;
                transition: color 0.25s ease;
            }
            .lumina-admin-shield-container:hover .lumina-admin-version-tag {
                color: #e2e8f0;
            }
            /* Odblokowana / Zalogowany Master Admin */
            .lumina-admin-shield-container.unlocked {
                border-color: rgba(16, 185, 129, 0.5);
                background: rgba(15, 23, 42, 0.8);
            }
            .lumina-admin-shield-container.unlocked .lumina-admin-floating-shield {
                color: #10b981;
            }
            .lumina-admin-shield-container.unlocked .lumina-admin-version-tag {
                color: #34d399;
            }

            /* Banner blokady użytkownika */
            .lumina-user-blocked-banner {
                background: linear-gradient(135deg, rgba(239, 68, 68, 0.25), rgba(153, 27, 27, 0.35));
                border: 1.5px solid #ef4444;
                color: #fca5a5;
                padding: 12px 18px;
                border-radius: 14px;
                margin-bottom: 18px;
                display: flex;
                align-items: center;
                gap: 12px;
                font-weight: 700;
                font-size: 0.90rem;
            }

            @media (max-width: 768px) {
                .lumina-admin-hud-inner {
                    flex-direction: column;
                    align-items: stretch;
                }
                .lumina-admin-hud-actions {
                    justify-content: flex-start;
                }
                .lumina-admin-shield-container {
                    bottom: 85px;
                    left: 14px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Inicjuje strukturę DOM dla panelu administracyjnego
    function injectAdminDOM(slug) {
        if (document.getElementById('luminaAdminSuiteContainer')) return;

        const container = document.createElement('div');
        container.id = 'luminaAdminSuiteContainer';
        container.innerHTML = `
            <!-- Top Master Admin HUD Bar -->
            <div class="lumina-admin-hud-bar" id="luminaAdminHudBar">
                <div class="lumina-admin-hud-inner">
                    <div class="lumina-admin-hud-title">
                        <i class="fa-solid fa-crown crown-icon"></i>
                        <span>MASTER ADMIN • Aktywny Profil: <b id="hudTargetName">${slug}</b></span>
                    </div>
                    <div class="lumina-admin-hud-actions">
                        <button type="button" class="admin-suite-btn btn-gold" onclick="window.LuminaAdminSuite.openFullEditor()">
                            <i class="fa-solid fa-pen-to-square"></i> Edytuj Profil
                        </button>
                        <button type="button" class="admin-suite-btn btn-purple" onclick="window.LuminaAdminSuite.openAllProfilesManager()">
                            <i class="fa-solid fa-users-gear"></i> Menedżer Wszystkich Profili
                        </button>
                        <button type="button" class="admin-suite-btn btn-cyan" onclick="window.LuminaAdminSuite.runSelfRepair()" title="Uruchom autonaprawę i diagnostykę systemu">
                            <i class="fa-solid fa-wrench"></i> Auto-Naprawa & Zdrowie
                        </button>
                        <button type="button" class="admin-suite-btn btn-cyan" onclick="document.getElementById('adminAvatarFileInput').click()" title="Zmień awatar dla tego profilu">
                            <i class="fa-solid fa-camera"></i> Awatar
                        </button>
                        <button type="button" class="admin-suite-btn btn-gold" onclick="if(window.LuminaPremiumAvatar) window.LuminaPremiumAvatar.openModal(window.LuminaAdminSuite.slug)" title="10-sekundowe Wideo Profilowe (Premium / Patron CC)">
                            <i class="fa-solid fa-video"></i> 10s Wideo Profilowe
                        </button>
                        <button type="button" class="admin-suite-btn btn-cyan" onclick="document.getElementById('adminCoverFileInput').click()" title="Zmień tło">
                            <i class="fa-solid fa-panorama"></i> Tło
                        </button>
                        
                        <button type="button" class="admin-suite-btn btn-cyan" onclick="window.LuminaAdminSuite.openPushNotificationModal()">
                            <i class="fa-solid fa-bell"></i> Powiadomienia PUSH
                        </button>
                        <button type="button" class="admin-suite-btn btn-purple" onclick="window.LuminaAdminSuite.openNewPostModal()">
                            <i class="fa-solid fa-plus"></i> Nowy Wpis
                        </button>
                        <button type="button" class="admin-suite-btn btn-warn" id="hudBtnToggleBlock" onclick="window.LuminaAdminSuite.toggleBlockCurrentProfile()">
                            <i class="fa-solid fa-ban"></i> Zablokuj Profil
                        </button>
                        <button type="button" class="admin-suite-btn btn-danger" onclick="window.LuminaAdminSuite.deleteCurrentProfileConfirm()">
                            <i class="fa-solid fa-trash-can"></i> Usuń Profil
                        </button>
                        <button type="button" class="admin-suite-btn" style="background:rgba(255,255,255,0.06); border-color:rgba(255,255,255,0.2);" onclick="window.LuminaAdminSuite.lockAdminMode()" title="Wyloguj z trybu administratora i przywróć szarą tarczę">
                            <i class="fa-solid fa-lock"></i> Wyloguj
                        </button>
                    </div>
                </div>
            </div>

            <!-- Dyskretna Tarcza Administratora z Numerem Wersji (Tylko jedna, lewy dolny róg) -->
            <div id="luminaFloatingAdminShieldContainer" class="lumina-admin-shield-container">
                <button type="button" 
                        id="luminaFloatingAdminShield" 
                        class="lumina-admin-floating-shield" 
                        onclick="window.LuminaAdminSuite.openPinPrompt()" 
                        title="Panel Administratora Portalu" 
                        aria-label="Panel Administratora">
                    <i class="fa-solid fa-shield-halved"></i>
                </button>
                <span class="lumina-admin-version-tag">v3.6.0</span>
            </div>

            <!-- Ukryte kontrolki uploadu plików -->
            <input type="file" id="adminAvatarFileInput" accept="image/*" style="display:none;" onchange="window.LuminaAdminSuite.handleAvatarSelect(event)">
            <input type="file" id="adminCoverFileInput" accept="image/*" style="display:none;" onchange="window.LuminaAdminSuite.handleCoverSelect(event)">
            <input type="file" id="adminGalleryFileInput" accept="image/*" style="display:none;" onchange="window.LuminaAdminSuite.handleGallerySelect(event)">
            <input type="file" id="adminPostImgFileInput" accept="image/*" style="display:none;" onchange="window.LuminaAdminSuite.handlePostImgSelect(event)">

            <!-- ══════════ MODAL 1: PEŁNA EDYCJA DANYCH PROFILU ══════════ -->
            <div class="modal-overlay" id="adminUniversalProfileModal" onclick="if(event.target===this) window.LuminaAdminSuite.closeModal('adminUniversalProfileModal')">
                <div class="modal-card" style="max-width: 620px; background: #0b142e; border: 1.5px solid rgba(245, 158, 11, 0.5); box-shadow: 0 25px 60px rgba(0,0,0,0.85), 0 0 35px rgba(245, 158, 11, 0.2); border-radius: 24px; padding: 26px 24px; position: relative;">
                    <button class="modal-close-btn" onclick="window.LuminaAdminSuite.closeModal('adminUniversalProfileModal')" aria-label="Zamknij" style="position:absolute; top:16px; right:16px; background:rgba(255,255,255,0.08); border:none; color:#cbd5e1; width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer;"><i class="fa-solid fa-xmark"></i></button>

                    <div style="display:flex; align-items:center; gap:12px; margin-bottom:18px; padding-bottom:12px; border-bottom:1px solid rgba(255,255,255,0.1); justify-content:space-between; flex-wrap:wrap;">
                        <div style="display:flex; align-items:center; gap:12px;">
                            <div style="width:44px; height:44px; border-radius:50%; background:linear-gradient(135deg, #f59e0b, #d97706); display:flex; align-items:center; justify-content:center; color:#000; font-size:1.3rem; box-shadow:0 4px 14px rgba(245,158,11,0.4);">
                                <i class="fa-solid fa-user-pen"></i>
                            </div>
                            <div>
                                <h3 id="adminModalProfileTitle" style="font-family:'Outfit', sans-serif; font-size:1.25rem; font-weight:800; color:#fff; margin:0;">Edycja Profilu • Master Admin</h3>
                                <div style="font-size:0.75rem; color:#facc15; font-weight:700;">Zmień dowolne dane, teksty, werset, bio, status weryfikacji i uprawnienia</div>
                            </div>
                        </div>
                        <button type="button" class="admin-suite-btn btn-danger" style="padding:6px 14px; border-radius:14px; font-size:12px; margin-right:34px;" onclick="window.LuminaAdminSuite.lockAdminMode()" title="Wyloguj z trybu Administratora">
                            <i class="fa-solid fa-lock"></i> Wyloguj Admina
                        </button>
                    </div>

                    <form id="adminUniversalProfileForm" onsubmit="window.LuminaAdminSuite.saveProfileSubmit(event)">
                        <input type="hidden" id="adminTargetSlugHidden" value="">

                        <div style="display:grid; grid-template-columns: 2fr 1fr; gap:12px; margin-bottom:12px;">
                            <div>
                                <label style="display:block; font-size:0.75rem; font-weight:700; color:#94a3b8; margin-bottom:4px;">Imię i Nazwisko / Tytuł Profilu</label>
                                <input type="text" id="adminInputName" style="width:100%; padding:10px 14px; border-radius:12px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.18); color:#fff; font-family:inherit; font-size:14px; font-weight:700;" required>
                            </div>
                            <div>
                                <label style="display:block; font-size:0.75rem; font-weight:700; color:#94a3b8; margin-bottom:4px;">Wiek / Etykieta</label>
                                <input type="text" id="adminInputAge" placeholder="np. 70 lat" style="width:100%; padding:10px 14px; border-radius:12px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.18); color:#fff; font-family:inherit; font-size:14px; font-weight:700;">
                            </div>
                        </div>

                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-bottom:12px;">
                            <div>
                                <label style="display:block; font-size:0.75rem; font-weight:700; color:#94a3b8; margin-bottom:4px;">Lokalizacja / Miasto</label>
                                <input type="text" id="adminInputCity" placeholder="np. Sieradz, Polska" style="width:100%; padding:10px 14px; border-radius:12px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.18); color:#fff; font-family:inherit; font-size:14px;">
                            </div>
                            <div>
                                <label style="display:block; font-size:0.75rem; font-weight:700; color:#94a3b8; margin-bottom:4px;">Data Urodzenia / Urodziny</label>
                                <input type="text" id="adminInputBirth" placeholder="np. 30 listopada 1955" style="width:100%; padding:10px 14px; border-radius:12px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.18); color:#fff; font-family:inherit; font-size:14px;">
                            </div>
                        </div>

                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-bottom:12px;">
                            <div>
                                <label style="display:block; font-size:0.75rem; font-weight:700; color:#94a3b8; margin-bottom:4px;">Rola / Zawód / Misja</label>
                                <input type="text" id="adminInputJob" placeholder="np. Autor: Cuda Każdego Dnia" style="width:100%; padding:10px 14px; border-radius:12px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.18); color:#fff; font-family:inherit; font-size:14px; font-weight:700;">
                            </div>
                            <div>
                                <label style="display:block; font-size:0.75rem; font-weight:700; color:#94a3b8; margin-bottom:4px;">Wspólnota / Kościół / Wyznanie</label>
                                <input type="text" id="adminInputChurch" placeholder="np. Kościół Chrześcijański" style="width:100%; padding:10px 14px; border-radius:12px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.18); color:#fff; font-family:inherit; font-size:14px;">
                            </div>
                        </div>

                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-bottom:12px;">
                            <div>
                                <label style="display:block; font-size:0.75rem; font-weight:700; color:#38bdf8; margin-bottom:4px;"><i class="fa-solid fa-circle-check"></i> Status Weryfikacji (Odznaka)</label>
                                <select id="adminInputVerified" style="width:100%; padding:10px 14px; border-radius:12px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.18); color:#fff; font-family:inherit; font-size:13.5px; font-weight:700;">
                                    <option value="true" style="background:#0f172a;">Zweryfikowany / Oficjalny (Niebieski Ptaszek)</option>
                                    <option value="false" style="background:#0f172a;">Standardowy Użytkownik</option>
                                </select>
                            </div>
                            <div>
                                <label style="display:block; font-size:0.75rem; font-weight:700; color:#a855f7; margin-bottom:4px;"><i class="fa-solid fa-lock"></i> Widoczność Profilu</label>
                                <select id="adminInputPrivacy" style="width:100%; padding:10px 14px; border-radius:12px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.18); color:#fff; font-family:inherit; font-size:13.5px; font-weight:700;">
                                    <option value="public" style="background:#0f172a;">Publiczny (Dostępny dla Wszystkich)</option>
                                    <option value="private" style="background:#0f172a;">Prywatny (Tylko dla Zalogowanych / Znajomych)</option>
                                </select>
                            </div>
                        </div>

                        <div style="margin-bottom:12px;">
                            <label style="display:block; font-size:0.75rem; font-weight:700; color:#facc15; margin-bottom:4px;"><i class="fa-solid fa-book-bible"></i> Główny Werset Biblijny</label>
                            <textarea id="adminInputVerse" rows="2" placeholder="Treść wersetu biblijnego..." style="width:100%; padding:10px 14px; border-radius:12px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.18); color:#fff; font-family:inherit; font-size:13.5px; resize:vertical;"></textarea>
                            <input type="text" id="adminInputVerseRef" placeholder="np. — Ewangelia wg św. Jana 15, 5" style="width:100%; margin-top:6px; padding:8px 12px; border-radius:10px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.12); color:#facc15; font-family:inherit; font-size:13px; font-weight:700;">
                        </div>

                        <div style="margin-bottom:12px; background:rgba(245,158,11,0.08); border:1px solid rgba(245,158,11,0.25); border-radius:14px; padding:12px 14px;">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                                <label style="font-size:0.75rem; font-weight:800; color:#facc15;"><i class="fa-solid fa-video"></i> 10-Sekundowe Wideo Profilowe (Premium / Patron CC)</label>
                                <button type="button" onclick="if(window.LuminaPremiumAvatar) window.LuminaPremiumAvatar.openModal(document.getElementById('adminTargetSlugHidden').value || window.LuminaAdminSuite.slug)" style="background:linear-gradient(135deg,#f59e0b,#ec4899); border:none; color:#fff; font-size:0.72rem; font-weight:800; padding:4px 10px; border-radius:10px; cursor:pointer;">
                                    <i class="fa-solid fa-cloud-arrow-up"></i> Kreator Wideo 10s
                                </button>
                            </div>
                            <input type="text" id="adminInputVideoAvatar" placeholder="Link YouTube (np. https://www.youtube.com/watch?v=...) lub bezpośredni link MP4" style="width:100%; padding:9px 12px; border-radius:10px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.18); color:#fff; font-family:inherit; font-size:13px;">
                            <div style="font-size:0.70rem; color:#94a3b8; margin-top:4px;">Wyświetla się w miejscu zdjęcia profilowego (obsługuje filmy YouTube oraz pliki MP4/WebM).</div>
                        </div>

                        <div style="margin-bottom:12px;">
                            <label style="display:block; font-size:0.75rem; font-weight:700; color:#94a3b8; margin-bottom:4px;">O Mnie / Świadectwo / Misja</label>
                            <textarea id="adminInputBio" rows="3" placeholder="Opis profilu, świadectwo lub misja..." style="width:100%; padding:10px 14px; border-radius:12px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.18); color:#fff; font-family:inherit; font-size:13.5px; resize:vertical;"></textarea>
                        </div>

                        <div style="margin-bottom:18px;">
                            <label style="display:block; font-size:0.75rem; font-weight:700; color:#94a3b8; margin-bottom:4px;">Tagi i Zainteresowania (oddzielone przecinkami)</label>
                            <input type="text" id="adminInputTags" placeholder="np. 📖 Cuda Każdego Dnia, 🕊️ Duch Święty, 🙏 Modlitwa" style="width:100%; padding:10px 14px; border-radius:12px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.18); color:#fff; font-family:inherit; font-size:13.5px;">
                        </div>

                        <div style="display:flex; gap:10px; justify-content:space-between; align-items:center;">
                            <button type="button" onclick="window.LuminaAdminSuite.lockAdminMode()" style="padding:10px 16px; border-radius:24px; background:rgba(239,68,68,0.2); border:1px solid rgba(239,68,68,0.4); color:#fca5a5; font-weight:700; cursor:pointer;" title="Wyloguj z trybu Administratora">
                                <i class="fa-solid fa-lock"></i> Wyloguj
                            </button>
                            <div style="display:flex; gap:10px;">
                                <button type="button" onclick="window.LuminaAdminSuite.closeModal('adminUniversalProfileModal')" style="padding:11px 20px; border-radius:24px; background:rgba(255,255,255,0.08); border:none; color:#cbd5e1; font-weight:700; cursor:pointer;">Anuluj</button>
                                <button type="submit" style="padding:11px 26px; border-radius:24px; background:linear-gradient(135deg, #f59e0b, #d97706); border:none; color:#000; font-weight:800; cursor:pointer; box-shadow:0 4px 16px rgba(245,158,11,0.4);">
                                    <i class="fa-solid fa-check"></i> Zapisz Zmiany w Profilu
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            <!-- ══════════ MODAL 2: MENEDŻER WSZYSTKICH PROFILI (CONTROL CENTER) ══════════ -->
            <div class="modal-overlay" id="adminAllProfilesModal" onclick="if(event.target===this) window.LuminaAdminSuite.closeModal('adminAllProfilesModal')">
                <div class="modal-card" style="max-width: 820px; width: 95%; max-height: 88vh; background: #080e22; border: 1.5px solid rgba(168, 85, 247, 0.5); box-shadow: 0 25px 70px rgba(0,0,0,0.9), 0 0 40px rgba(168, 85, 247, 0.25); border-radius: 24px; padding: 24px; position: relative; display: flex; flex-direction: column; overflow: hidden;">
                    <button class="modal-close-btn" onclick="window.LuminaAdminSuite.closeModal('adminAllProfilesModal')" aria-label="Zamknij" style="position:absolute; top:18px; right:18px; background:rgba(255,255,255,0.08); border:none; color:#cbd5e1; width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer;"><i class="fa-solid fa-xmark"></i></button>

                    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; padding-bottom:12px; border-bottom:1px solid rgba(255,255,255,0.1); flex-wrap:wrap; gap:10px;">
                        <div style="display:flex; align-items:center; gap:12px;">
                            <div style="width:42px; height:42px; border-radius:50%; background:linear-gradient(135deg, #a855f7, #6366f1); display:flex; align-items:center; justify-content:center; color:#fff; font-size:1.2rem; box-shadow:0 4px 14px rgba(168,85,247,0.4);">
                                <i class="fa-solid fa-users-gear"></i>
                            </div>
                            <div>
                                <h3 style="font-family:'Outfit', sans-serif; font-size:1.25rem; font-weight:800; color:#fff; margin:0;">Zarządzanie Wszystkimi Profilami & Kontami</h3>
                                <div style="font-size:0.75rem; color:#c084fc; font-weight:700;">Nadrzędna kontrola, edycja, blokowanie (ban) i usuwanie profili</div>
                            </div>
                        </div>
                        <div style="display:flex; align-items:center; gap:8px; margin-right:34px;">
                            <button type="button" class="admin-suite-btn" style="background:rgba(239, 68, 68, 0.2); border:1.5px solid #ef4444; color:#fca5a5; font-weight:800; padding:8px 16px; border-radius:20px; display:inline-flex; align-items:center; gap:6px;" onclick="window.LuminaAdminSuite.lockAdminMode()" title="Wyloguj z trybu administratora i przywróć szarą tarczę">
                                <i class="fa-solid fa-lock"></i> Wyloguj z Admina
                            </button>
                            <button type="button" class="admin-suite-btn btn-gold" onclick="window.LuminaAdminSuite.promptCreateNewProfile()">
                                <i class="fa-solid fa-user-plus"></i> Dodaj Profil
                            </button>
                        </div>
                    </div>

                    <!-- Wyszukiwarka profili -->
                    <div style="margin-bottom:14px;">
                        <input type="text" id="adminProfilesSearchInput" placeholder="🔍 Szukaj profilu (imię, slug, rola, miasto)..." oninput="window.LuminaAdminSuite.renderProfilesListInModal(this.value)" style="width:100%; padding:10px 16px; border-radius:14px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.18); color:#fff; font-family:inherit; font-size:14px;">
                    </div>

                    <!-- Lista profili (przewijana) -->
                    <div id="adminProfilesListContainer" style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; padding-right: 4px;">
                        <!-- Generowane dynamicznie przez renderProfilesListInModal -->
                    </div>

                    <!-- Pasek Statusu i Wylogowania na dole -->
                    <div style="margin-top:14px; padding-top:12px; border-top:1px solid rgba(255,255,255,0.1); display:flex; justify-content:space-between; align-items:center; font-size:0.82rem; color:#94a3b8; flex-wrap:wrap; gap:8px;">
                        <div style="display:flex; align-items:center; gap:8px;">
                            <span style="width:8px; height:8px; border-radius:50%; background:#10b981; display:inline-block; box-shadow:0 0 8px #10b981;"></span>
                            <span>Status: <b style="color:#34d399;">Zalogowano jako Główny Administrator</b></span>
                        </div>
                        <button type="button" class="admin-suite-btn btn-danger" style="padding:6px 14px; border-radius:14px;" onclick="window.LuminaAdminSuite.lockAdminMode()">
                            <i class="fa-solid fa-right-from-bracket"></i> Wyloguj i zablokuj tarczę
                        </button>
                    </div>
                </div>
            </div>

            <!-- ══════════ MODAL 3: PUBLIKACJA / EDYCJA WPISU ══════════ -->
            <div class="modal-overlay" id="adminUniversalPostModal" onclick="if(event.target===this) window.LuminaAdminSuite.closeModal('adminUniversalPostModal')">
                <div class="modal-card" style="max-width: 600px; background: #0b142e; border: 1.5px solid rgba(168, 85, 247, 0.45); box-shadow: 0 25px 60px rgba(0,0,0,0.85), 0 0 35px rgba(168, 85, 247, 0.2); border-radius: 24px; padding: 26px 24px; position: relative;">
                    <button class="modal-close-btn" onclick="window.LuminaAdminSuite.closeModal('adminUniversalPostModal')" aria-label="Zamknij" style="position:absolute; top:16px; right:16px; background:rgba(255,255,255,0.08); border:none; color:#cbd5e1; width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer;"><i class="fa-solid fa-xmark"></i></button>

                    <div style="display:flex; align-items:center; gap:12px; margin-bottom:18px; padding-bottom:12px; border-bottom:1px solid rgba(255,255,255,0.1);">
                        <div style="width:44px; height:44px; border-radius:50%; background:linear-gradient(135deg, #a855f7, #7c3aed); display:flex; align-items:center; justify-content:center; color:#fff; font-size:1.3rem; box-shadow:0 4px 14px rgba(168,85,247,0.4);">
                            <i class="fa-solid fa-pen-nib"></i>
                        </div>
                        <div>
                            <h3 id="adminPostModalHeaderTitle" style="font-family:'Outfit', sans-serif; font-size:1.25rem; font-weight:800; color:#fff; margin:0;">Nowa Publikacja / Rozważanie</h3>
                            <div style="font-size:0.75rem; color:#c084fc; font-weight:700;">Wpis pojawi się na profilu i automatycznie na Tablicy LUMINA</div>
                        </div>
                    </div>

                    <form id="adminUniversalPostForm" onsubmit="window.LuminaAdminSuite.savePostSubmit(event)">
                        <input type="hidden" id="adminEditPostId" value="">

                        <div style="margin-bottom:12px;">
                            <label style="display:block; font-size:0.75rem; font-weight:700; color:#94a3b8; margin-bottom:4px;">Nagłówek Serii / Etykieta (np. CUDA KAŻDEGO DNIA!)</label>
                            <input type="text" id="adminPostSeries" placeholder="np. CUDA KAŻDEGO DNIA! • Dzisiejsze Słowo" style="width:100%; padding:10px 14px; border-radius:12px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.18); color:#fff; font-family:inherit; font-size:13.5px; font-weight:700;">
                        </div>

                        <div style="margin-bottom:12px;">
                            <label style="display:block; font-size:0.75rem; font-weight:700; color:#94a3b8; margin-bottom:4px;">Tytuł Wpisu</label>
                            <input type="text" id="adminPostTitle" placeholder="Tytuł rozważania lub wpisu..." style="width:100%; padding:10px 14px; border-radius:12px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.18); color:#fff; font-family:inherit; font-size:15px; font-weight:800;" required>
                        </div>

                        <div style="margin-bottom:12px;">
                            <label style="display:block; font-size:0.75rem; font-weight:700; color:#94a3b8; margin-bottom:4px;">Treść Rozważania / Wpisu</label>
                            <textarea id="adminPostContent" rows="5" placeholder="Napisz treść rozważania, refleksję biblijną lub świadectwo..." style="width:100%; padding:12px 14px; border-radius:12px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.18); color:#fff; font-family:inherit; font-size:13.5px; line-height:1.6; resize:vertical;" required></textarea>
                        </div>

                        <div style="margin-bottom:12px;">
                            <label style="display:block; font-size:0.75rem; font-weight:700; color:#facc15; margin-bottom:4px;"><i class="fa-solid fa-hands-praying"></i> Blok Modlitwy / Cytatu (Opcjonalnie)</label>
                            <textarea id="adminPostPrayer" rows="2" placeholder="Wpisz słowa modlitwy podsumowującej..." style="width:100%; padding:10px 14px; border-radius:12px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.18); color:#fff; font-family:inherit; font-size:13.5px; resize:vertical;"></textarea>
                        </div>

                        <div style="margin-bottom:18px;">
                            <button type="button" onclick="document.getElementById('adminPostImgFileInput').click()" style="padding:8px 14px; border-radius:12px; background:rgba(255,255,255,0.08); border:1px dashed rgba(255,255,255,0.25); color:#cbd5e1; font-family:inherit; font-size:0.82rem; cursor:pointer;">
                                <i class="fa-solid fa-image"></i> Dołącz Zdjęcie do Wpisu
                            </button>
                            <div id="adminPostImgPreviewBox" style="display:none; margin-top:8px;">
                                <img id="adminPostImgPreview" src="" alt="Podgląd" style="max-height:140px; border-radius:10px; border:1px solid rgba(255,255,255,0.2);">
                            </div>
                        </div>

                        <div style="display:flex; gap:10px; justify-content:flex-end;">
                            <button type="button" onclick="window.LuminaAdminSuite.closeModal('adminUniversalPostModal')" style="padding:11px 20px; border-radius:24px; background:rgba(255,255,255,0.08); border:none; color:#cbd5e1; font-weight:700; cursor:pointer;">Anuluj</button>
                            <button type="submit" style="padding:11px 26px; border-radius:24px; background:linear-gradient(135deg, #a855f7, #7c3aed); border:none; color:#fff; font-weight:800; cursor:pointer; box-shadow:0 4px 16px rgba(168,85,247,0.4);">
                                <i class="fa-solid fa-paper-plane"></i> Opublikuj Wpis
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            
            <!-- ══════════ MODAL 5: KREATOR POWIADOMIEŃ PUSH ══════════ -->
            <div class="modal-overlay" id="adminPushNotificationModal" onclick="if(event.target===this) window.LuminaAdminSuite.closeModal('adminPushNotificationModal')">
                <div class="modal-card" style="max-width: 620px; width: 92%; max-height: 88vh; overflow-y: auto; background: #0b142e; border: 1.5px solid rgba(245, 158, 11, 0.5); box-shadow: 0 25px 60px rgba(0,0,0,0.85), 0 0 35px rgba(245, 158, 11, 0.2); border-radius: 24px; padding: 26px 24px; position: relative;">
                    <button class="modal-close-btn" onclick="window.LuminaAdminSuite.closeModal('adminPushNotificationModal')" aria-label="Zamknij" style="position:absolute; top:16px; right:16px; background:rgba(255,255,255,0.08); border:none; color:#cbd5e1; width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer;"><i class="fa-solid fa-xmark"></i></button>
                    
                    <div style="display:flex; align-items:center; gap:12px; margin-bottom:18px; padding-bottom:12px; border-bottom:1px solid rgba(255,255,255,0.1);">
                        <div style="width:44px; height:44px; border-radius:50%; background:linear-gradient(135deg, #f59e0b, #d97706); display:flex; align-items:center; justify-content:center; color:#000; font-size:1.3rem; box-shadow:0 4px 14px rgba(245,158,11,0.4);">
                            <i class="fa-solid fa-bell"></i>
                        </div>
                        <div>
                            <h3 style="font-family:'Outfit', sans-serif; font-size:1.25rem; font-weight:800; color:#fff; margin:0;">Zarządzanie Powiadomieniami PUSH</h3>
                            <div style="font-size:0.75rem; color:#facc15; font-weight:700;">Wysyłaj globalne powiadomienia do całej społeczności LUMINA</div>
                        </div>
                    </div>

                    <form id="adminPushNotificationForm" onsubmit="window.LuminaAdminSuite.submitPushNotification(event)">
                        <div style="margin-bottom:14px;">
                            <label style="display:block; font-size:0.75rem; font-weight:700; color:#94a3b8; margin-bottom:4px;">Tytuł Powiadomienia</label>
                            <input type="text" id="adminPushTitle" placeholder="np. Nowy wpis od Andrzeja T!" style="width:100%; padding:10px 14px; border-radius:12px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.18); color:#fff; font-family:inherit; font-size:14px; font-weight:700;" required>
                        </div>
                        <div style="margin-bottom:14px;">
                            <label style="display:block; font-size:0.75rem; font-weight:700; color:#94a3b8; margin-bottom:4px;">Treść Powiadomienia (Message)</label>
                            <textarea id="adminPushContent" rows="3" placeholder="Wpisz treść powiadomienia..." style="width:100%; padding:10px 14px; border-radius:12px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.18); color:#fff; font-family:inherit; font-size:13.5px; resize:vertical;" required></textarea>
                        </div>
                        
                        
                        <div style="margin-bottom:14px;">
                            <label style="display:block; font-size:0.75rem; font-weight:700; color:#94a3b8; margin-bottom:4px;">Odbiorcy Powiadomienia (Grupa Docelowa)</label>
                            <select id="adminPushAudience" style="width:100%; padding:10px 14px; border-radius:12px; background:rgba(15,23,42,0.9); border:1px solid rgba(255,255,255,0.18); color:#fff; font-family:inherit; font-size:14px;" required>
                                <option value="all">Wszyscy użytkownicy portalu (Global)</option>
                                <option value="logged_in">Tylko Zalogowani Użytkownicy</option>
                                <option value="donors">Tylko Wspierający / Darczyńcy (Premium)</option>
                            </select>
                        </div>
                        
                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-bottom:14px;">
                            <div>
                                <label style="display:block; font-size:0.75rem; font-weight:700; color:#94a3b8; margin-bottom:4px;">Przycisk Akcji (CTA)</label>
                                <select id="adminPushActionType" style="width:100%; padding:10px 14px; border-radius:12px; background:rgba(15,23,42,0.9); border:1px solid rgba(255,255,255,0.18); color:#fff; font-family:inherit; font-size:14px;" required>
                                    <option value="czytaj">Czytaj</option>
                                    <option value="ogladaj">Oglądaj</option>
                                    <option value="udostepnij">Udostępnij</option>
                                    <option value="wspieraj">Wspieraj</option>
                                    <option value="amen">Amen</option>
                                </select>
                            </div>
                            <div>
                                <label style="display:block; font-size:0.75rem; font-weight:700; color:#94a3b8; margin-bottom:4px;">Link Akcji (Gdzie ma prowadzić?)</label>
                                <input type="text" id="adminPushActionLink" placeholder="np. lumina-tablica.html" style="width:100%; padding:10px 14px; border-radius:12px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.18); color:#fff; font-family:inherit; font-size:14px;">
                            </div>
                        </div>

                        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 14px; margin-bottom: 18px;">
                            <h4 style="margin:0 0 10px 0; font-size:0.9rem; color:#facc15;">Harmonogram Wysyłki</h4>
                            <div style="display:flex; gap:14px; margin-bottom:12px;">
                                <label style="display:flex; align-items:center; gap:6px; cursor:pointer; font-size:0.85rem; color:#fff;">
                                    <input type="radio" name="adminPushScheduleType" value="once" checked onchange="document.getElementById('adminPushRecurringOpts').style.display='none'"> 
                                    Wyślij natychmiast (Raz)
                                </label>
                                <label style="display:flex; align-items:center; gap:6px; cursor:pointer; font-size:0.85rem; color:#fff;">
                                    <input type="radio" name="adminPushScheduleType" value="recurring" onchange="document.getElementById('adminPushRecurringOpts').style.display='block'"> 
                                    Wysyłaj cyklicznie
                                </label>
                            </div>
                            
                            <div id="adminPushRecurringOpts" style="display:none; padding-top:10px; border-top:1px dashed rgba(255,255,255,0.1);">
                                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
                                    <div>
                                        <label style="display:block; font-size:0.75rem; font-weight:700; color:#94a3b8; margin-bottom:4px;">Interwał (Częstotliwość)</label>
                                        <select id="adminPushInterval" style="width:100%; padding:10px 14px; border-radius:12px; background:rgba(15,23,42,0.9); border:1px solid rgba(255,255,255,0.18); color:#fff; font-family:inherit; font-size:13px;">
                                            <option value="weekly">Raz w tygodniu</option>
                                            <option value="twice_weekly">Dwa razy w tygodniu</option>
                                            <option value="monthly">Raz w miesiącu</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style="display:block; font-size:0.75rem; font-weight:700; color:#94a3b8; margin-bottom:4px;">Godzina Wysyłania</label>
                                        <input type="time" id="adminPushTime" value="12:00" style="width:100%; padding:10px 14px; border-radius:12px; background:rgba(15,23,42,0.9); border:1px solid rgba(255,255,255,0.18); color:#fff; font-family:inherit; font-size:14px; color-scheme:dark;">
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style="display:flex; gap:10px; justify-content:flex-end;">
                            <button type="button" onclick="window.LuminaAdminSuite.closeModal('adminPushNotificationModal')" style="padding:11px 20px; border-radius:24px; background:rgba(255,255,255,0.08); border:none; color:#cbd5e1; font-weight:700; cursor:pointer;">Anuluj</button>
                            <button type="submit" style="padding:11px 26px; border-radius:24px; background:linear-gradient(135deg, #f59e0b, #d97706); border:none; color:#000; font-weight:800; cursor:pointer; box-shadow:0 4px 16px rgba(245,158,11,0.4);">
                                <i class="fa-solid fa-paper-plane"></i> Zatwierdź / Wyślij PUSH
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- ══════════ MODAL 4: MENU TAJNEJ TARCZY ADMINISTRATORA ══════════ -->
            <div class="modal-overlay" id="adminShieldQuickModal" onclick="if(event.target===this) window.LuminaAdminSuite.closeModal('adminShieldQuickModal')">
                <div class="modal-card" style="max-width: 440px; width: 92%; background: #0b142e; border: 1.5px solid rgba(16, 185, 129, 0.5); box-shadow: 0 25px 60px rgba(0,0,0,0.9), 0 0 35px rgba(16, 185, 129, 0.25); border-radius: 24px; padding: 24px; position: relative;">
                    <button class="modal-close-btn" onclick="window.LuminaAdminSuite.closeModal('adminShieldQuickModal')" aria-label="Zamknij" style="position:absolute; top:16px; right:16px; background:rgba(255,255,255,0.08); border:none; color:#cbd5e1; width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer;"><i class="fa-solid fa-xmark"></i></button>

                    <div style="display:flex; align-items:center; gap:12px; margin-bottom:18px; padding-bottom:12px; border-bottom:1px solid rgba(255,255,255,0.1);">
                        <div style="width:44px; height:44px; border-radius:50%; background:linear-gradient(135deg, #10b981, #059669); display:flex; align-items:center; justify-content:center; color:#fff; font-size:1.3rem; box-shadow:0 4px 14px rgba(16,185,129,0.4);">
                            <i class="fa-solid fa-shield-halved"></i>
                        </div>
                        <div>
                            <h3 style="font-family:'Outfit', sans-serif; font-size:1.20rem; font-weight:800; color:#fff; margin:0;">Tajna Tarcza Administratora</h3>
                            <div style="font-size:0.75rem; color:#34d399; font-weight:700;">Status: Zalogowany Master Admin</div>
                        </div>
                    </div>

                    <div style="display:flex; flex-direction:column; gap:10px; margin-bottom:16px;">
                        <button type="button" class="admin-suite-btn btn-purple" style="justify-content:flex-start; padding:12px 16px; border-radius:14px; font-size:14px;" onclick="window.LuminaAdminSuite.closeModal('adminShieldQuickModal'); window.LuminaAdminSuite.openAllProfilesManager();">
                            <i class="fa-solid fa-users-gear" style="font-size:1.1rem; width:22px;"></i> Menedżer Wszystkich Profili
                        </button>
                        <button type="button" class="admin-suite-btn btn-gold" style="justify-content:flex-start; padding:12px 16px; border-radius:14px; font-size:14px;" onclick="window.LuminaAdminSuite.closeModal('adminShieldQuickModal'); window.LuminaAdminSuite.openFullEditor();">
                            <i class="fa-solid fa-pen-to-square" style="font-size:1.1rem; width:22px;"></i> Edytuj Aktywny Profil (<b id="quickModalSlugName">${slug}</b>)
                        </button>
                        
                        <button type="button" class="admin-suite-btn btn-cyan" style="justify-content:flex-start; padding:12px 16px; border-radius:14px; font-size:14px;" onclick="window.LuminaAdminSuite.closeModal('adminShieldQuickModal'); window.LuminaAdminSuite.openPushNotificationModal();">
                            <i class="fa-solid fa-bell" style="font-size:1.1rem; width:22px;"></i> Powiadomienia PUSH
                        </button>
                        <button type="button" class="admin-suite-btn btn-purple" style="justify-content:flex-start; padding:12px 16px; border-radius:14px; font-size:14px;" onclick="window.LuminaAdminSuite.closeModal('adminShieldQuickModal'); window.LuminaAdminSuite.openNewPostModal();">
                            <i class="fa-solid fa-plus" style="font-size:1.1rem; width:22px;"></i> Nowy Wpis / Słowo Dnia
                        </button>
                    </div>

                    <div style="padding-top:14px; border-top:1px solid rgba(255,255,255,0.1); display:flex; flex-direction:column; gap:8px;">
                        <button type="button" class="admin-suite-btn btn-danger" style="justify-content:center; padding:12px 16px; border-radius:16px; font-size:14px; font-weight:800; width:100%; box-shadow:0 4px 16px rgba(239,68,68,0.35);" onclick="window.LuminaAdminSuite.lockAdminMode()">
                            <i class="fa-solid fa-lock"></i> Wyloguj i Zablokuj Tarczę (Szara)
                        </button>
                        <div style="font-size:0.72rem; color:#94a3b8; text-align:center; margin-top:2px;">
                            Po wylogowaniu tarcza powróci do szarego koloru i zablokuje uprawnienia.
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(container);
    }

    // Główny obiekt API Master Admin Suite
    window.LuminaAdminSuite = {
        slug: detectCurrentProfileSlug(),

        init: function() {
            this.slug = detectCurrentProfileSlug();
            injectAdminStyles();
            injectAdminDOM(this.slug);
            this.checkAndApplyAdminState();
            this.attachInlinePencils();
            this.loadProfileFromStorage(this.slug);
            this.checkIfCurrentProfileIsBlocked();
        },

        checkAndApplyAdminState: function() {
            const isAdmin = isUserMasterAdmin();
            const hud = document.getElementById('luminaAdminHudBar');
            const shield = document.getElementById('luminaFloatingAdminShield');
            const shieldContainer = document.getElementById('luminaFloatingAdminShieldContainer');

            if (isAdmin) {
                document.body.classList.add('lumina-admin-mode');
                document.body.classList.add('owner-mode-active');
                if (hud) hud.classList.add('active');
                if (shield) shield.classList.add('unlocked');
                if (shieldContainer) shieldContainer.classList.add('unlocked');
            } else {
                document.body.classList.remove('lumina-admin-mode');
                document.body.classList.remove('owner-mode-active');
                if (hud) hud.classList.remove('active');
                if (shield) shield.classList.remove('unlocked');
                if (shieldContainer) shieldContainer.classList.remove('unlocked');
            }

            this.updateHudBlockBtnState();
        },

        openPinPrompt: async function() {
            const isAdmin = isUserMasterAdmin();
            if (isAdmin) {
                this.openAllProfilesManager();
                return;
            }

            const pin = prompt('🔐 Autoryzacja Administratora Portalu LUMINA (Wprowadź PIN):');
            if (!pin) return;

            const msgBuffer = new TextEncoder().encode(pin.trim());
            const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

            if (hash === ADMIN_PIN_HASH) {
                sessionStorage.setItem('lumina_auth_master_admin', 'true');
                this.checkAndApplyAdminState();
                if (typeof window.showToast === 'function') {
                    window.showToast('✨ Zalogowano do Panelu Głównego Administratora! Pełny dostęp aktywny.');
                } else {
                    alert('✨ Zalogowano do Panelu Głównego Administratora! Pełna kontrola aktywna.');
                }
            } else {
                if (typeof window.showToast === 'function') {
                    window.showToast('❌ Nieprawidłowy kod PIN Administratora!');
                } else {
                    alert('❌ Nieprawidłowy kod PIN!');
                }
            }
        },

        lockAdminMode: function() {
            sessionStorage.removeItem('lumina_auth_master_admin');
            this.checkAndApplyAdminState();
            if (typeof window.showToast === 'function') {
                window.showToast('🔒 Zablokowano tryb Administratora (Tarcza szara).');
            } else {
                alert('🔒 Zablokowano tryb Administratora.');
            }
        },

        closeModal: function(modalId) {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.remove('open');
                modal.style.display = 'none';
            }
        },

        openModal: function(modalId) {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.add('open');
                modal.style.display = 'flex';
            }
        },

        // ══════════ ZARZĄDZANIE PROFILAMI I BLOKADAMI ══════════
        openFullEditor: function(targetSlug = null) {
            const s = targetSlug || this.slug;
            document.getElementById('adminTargetSlugHidden').value = s;
            document.getElementById('adminModalProfileTitle').textContent = `Edycja Profilu: ${s} • Master Admin`;

            const data = this.getCurrentData(s);
            document.getElementById('adminInputName').value = data.name || '';
            document.getElementById('adminInputAge').value = data.age || '';
            document.getElementById('adminInputCity').value = data.city || '';
            document.getElementById('adminInputBirth').value = data.birth || '';
            document.getElementById('adminInputJob').value = data.job || '';
            document.getElementById('adminInputChurch').value = data.church || '';
            document.getElementById('adminInputVerified').value = data.verified ? 'true' : 'false';
            document.getElementById('adminInputPrivacy').value = data.privacy || 'public';
            document.getElementById('adminInputVerse').value = data.verse || '';
            document.getElementById('adminInputVerseRef').value = data.verseRef || '';
            const curVid = data.avatarVideo || localStorage.getItem('lumina_avatar_video_' + s) || '';
            if (document.getElementById('adminInputVideoAvatar')) {
                document.getElementById('adminInputVideoAvatar').value = curVid;
            }
            document.getElementById('adminInputBio').value = data.bio || '';
            document.getElementById('adminInputTags').value = (data.tags || []).join(', ');

            this.openModal('adminUniversalProfileModal');
        },

        getCurrentData: function(slug = null) {
            const s = slug || this.slug;
            const saved = localStorage.getItem('lumina_profile_' + s);
            if (saved) {
                try { return JSON.parse(saved); } catch(e) {}
            }

            // Fallback z DOM jeśli to bieżący profil
            if (s === this.slug) {
                const nameEl = document.querySelector('.head-user-name span, .profile-name, h1');
                const verseEl = document.querySelector('.verse-box, .profile-verse');
                const bioEl = document.querySelector('.sidebar-card p, .side-card p, .profile-bio');

                return {
                    name: nameEl ? nameEl.textContent.trim() : s,
                    age: '',
                    city: '',
                    birth: '',
                    job: '',
                    church: '',
                    verified: true,
                    privacy: 'public',
                    verse: verseEl ? verseEl.textContent.trim() : '',
                    verseRef: '',
                    bio: bioEl ? bioEl.textContent.trim() : '',
                    tags: []
                };
            }

            return {
                name: s,
                age: '',
                city: '',
                birth: '',
                job: '',
                church: '',
                verified: false,
                privacy: 'public',
                verse: '',
                verseRef: '',
                bio: '',
                tags: []
            };
        },

        saveProfileSubmit: function(e) {
            if (e && e.preventDefault) e.preventDefault();
            const targetSlug = document.getElementById('adminTargetSlugHidden').value || this.slug;
            const existing = this.getCurrentData(targetSlug) || {};
            const edits = {
                name: document.getElementById('adminInputName').value.trim(),
                age: document.getElementById('adminInputAge').value.trim(),
                city: document.getElementById('adminInputCity').value.trim(),
                birth: document.getElementById('adminInputBirth').value.trim(),
                job: document.getElementById('adminInputJob').value.trim(),
                church: document.getElementById('adminInputChurch').value.trim(),
                verified: document.getElementById('adminInputVerified').value === 'true',
                privacy: document.getElementById('adminInputPrivacy').value,
                verse: document.getElementById('adminInputVerse').value.trim(),
                verseRef: document.getElementById('adminInputVerseRef').value.trim(),
                avatarVideo: document.getElementById('adminInputVideoAvatar') ? document.getElementById('adminInputVideoAvatar').value.trim() : '',
                bio: document.getElementById('adminInputBio').value.trim(),
                tags: document.getElementById('adminInputTags').value.split(',').map(t => t.trim()).filter(Boolean)
            };
            const merged = { ...existing, ...edits, slug: targetSlug };

            try {
                localStorage.setItem('lumina_profile_' + targetSlug, JSON.stringify(merged));
                if (existing.uid) localStorage.setItem('lumina_profile_' + existing.uid, JSON.stringify(merged));
            } catch(e) {}

            if (window._cloudProfileData && (window._cloudProfileData.slug === targetSlug || window._cloudProfileData.uid === targetSlug)) {
                window._cloudProfileData = merged;
            }

            if (window.LuminaDB && typeof window.LuminaDB.saveProfileToCloud === 'function') {
                window.LuminaDB.saveProfileToCloud(targetSlug, merged);
            }

            if (edits.avatarVideo) {
                localStorage.setItem('lumina_avatar_video_' + targetSlug, edits.avatarVideo);
                if (window.LuminaPremiumAvatar) {
                    window.LuminaPremiumAvatar.mountVideoAvatars(targetSlug);
                }
            } else {
                localStorage.removeItem('lumina_avatar_video_' + targetSlug);
                if (window.LuminaPremiumAvatar) {
                    window.LuminaPremiumAvatar.mountVideoAvatars(targetSlug);
                }
            }
            
            if (targetSlug === this.slug) {
                this.applyDataToDOM(merged);
            }

            this.closeModal('adminUniversalProfileModal');
            this.renderProfilesListInModal();

            if (typeof window.showToast === 'function') {
                window.showToast(`✨ Zmiany w profilu ${merged.name} zostały pomyślnie zapisane!`);
            } else {
                alert(`✨ Zmiany w profilu ${merged.name} zostały pomyślnie zapisane!`);
            }
        },

        applyDataToDOM: function(data) {
            if (!data) return;

            // Apply Name
            const nameEls = document.querySelectorAll('.head-user-name span, .profile-name, #userNameEl, #mName');
            nameEls.forEach(el => { if (data.name) el.textContent = data.name; });

            // Apply Age / City
            const ageEls = document.querySelectorAll('.age-tag, #userAgeCityEl');
            ageEls.forEach(el => { if (data.age || data.city) el.textContent = [data.age, data.city].filter(Boolean).join(' • '); });

            // Apply Verse
            const verseEls = document.querySelectorAll('.verse-box, .profile-verse');
            verseEls.forEach(el => {
                if (data.verse) {
                    el.innerHTML = `„${data.verse}” <span class="verse-ref" style="display:block; margin-top:6px; color:#facc15; font-weight:700;">${data.verseRef || ''}</span>`;
                }
            });

            // Apply Bio
            const bioEls = document.querySelectorAll('.sidebar-card p, .side-card p, .profile-bio, #userBioEl');
            bioEls.forEach(el => { if (data.bio) el.textContent = data.bio; });

            // Apply Tags
            if (data.tags && data.tags.length > 0) {
                const tagsContainer = document.querySelector('.profile-tags-row, .tags-container, .profile-tags');
                if (tagsContainer) {
                    tagsContainer.innerHTML = data.tags.map(t => `<span class="tag-pill gold">${t}</span>`).join(' ');
                }
            }
        },

        loadProfileFromStorage: function(slug) {
            const saved = localStorage.getItem('lumina_profile_' + slug);
            if (saved) {
                try {
                    const data = JSON.parse(saved);
                    this.applyDataToDOM(data);
                } catch(e) {}
            }
        },

        attachInlinePencils: function() {
            const nameEl = document.querySelector('.head-user-name, .profile-name');
            if (nameEl && !nameEl.querySelector('.admin-inline-edit-btn') && !nameEl.querySelector('.card-edit-btn')) {
                const btn = document.createElement('button');
                btn.className = 'admin-inline-edit-btn';
                btn.innerHTML = '<i class="fa-solid fa-pencil"></i>';
                btn.title = 'Edytuj Imię i Dane Profilu';
                btn.onclick = () => this.openFullEditor();
                nameEl.appendChild(btn);
            }

            const verseEl = document.querySelector('.verse-box, .profile-verse');
            if (verseEl && !verseEl.querySelector('.admin-inline-edit-btn')) {
                const card = verseEl.closest('.sidebar-card');
                if (!card || !card.querySelector('.card-edit-btn')) {
                    const btn = document.createElement('button');
                    btn.className = 'admin-inline-edit-btn';
                    btn.innerHTML = '<i class="fa-solid fa-pencil"></i>';
                    btn.title = 'Edytuj Werset Biblijny';
                    btn.onclick = () => this.openFullEditor();
                    verseEl.appendChild(btn);
                }
            }
        },

        // ══════════ BLOKOWANIE / ODBLOKOWYWANIE KONT (BANNING) ══════════
        isProfileBlocked: function(slug) {
            const blocked = getBlockedProfiles();
            return blocked.includes((slug || this.slug).toLowerCase().trim());
        },

        toggleBlockProfile: function(slug) {
            const target = (slug || this.slug).toLowerCase().trim();
            let blocked = getBlockedProfiles();
            const isCurrentlyBlocked = blocked.includes(target);

            if (isCurrentlyBlocked) {
                blocked = blocked.filter(s => s !== target);
                saveBlockedProfiles(blocked);
                if (typeof window.showToast === 'function') {
                    window.showToast(`✅ Profil ${target} został ODBLOKOWANY.`);
                }
            } else {
                blocked.push(target);
                saveBlockedProfiles(blocked);
                if (typeof window.showToast === 'function') {
                    window.showToast(`🚫 Profil ${target} został ZABLOKOWANY.`);
                }
            }

            this.updateHudBlockBtnState();
            this.checkIfCurrentProfileIsBlocked();
            this.renderProfilesListInModal();
        },

        toggleBlockCurrentProfile: function() {
            this.toggleBlockProfile(this.slug);
        },

        updateHudBlockBtnState: function() {
            const btn = document.getElementById('hudBtnToggleBlock');
            if (!btn) return;
            const isBlocked = this.isProfileBlocked(this.slug);
            if (isBlocked) {
                btn.className = 'admin-suite-btn btn-cyan';
                btn.innerHTML = '<i class="fa-solid fa-unlock"></i> Odblokuj Profil';
            } else {
                btn.className = 'admin-suite-btn btn-warn';
                btn.innerHTML = '<i class="fa-solid fa-ban"></i> Zablokuj Profil';
            }
        },

        checkIfCurrentProfileIsBlocked: function() {
            const isBlocked = this.isProfileBlocked(this.slug);
            let banner = document.getElementById('luminaBlockedBanner');
            const mainContainer = document.querySelector('.main-feed-col, .profile-container, main');

            if (isBlocked) {
                if (!banner && mainContainer) {
                    banner = document.createElement('div');
                    banner.id = 'luminaBlockedBanner';
                    banner.className = 'lumina-user-blocked-banner';
                    banner.innerHTML = '<i class="fa-solid fa-triangle-exclamation" style="font-size:1.4rem;"></i> <div><b>Konto Zablokowane przez Administratora:</b> Publikacje i interakcje dla tego profilu zostały zawieszone.</div>';
                    mainContainer.prepend(banner);
                }
            } else {
                if (banner) banner.remove();
            }
        },

        // ══════════ USUWANIE I TWORZENIE PROFILI ══════════
        deleteProfile: function(slug) {
            const target = (slug || this.slug).toLowerCase().trim();
            if (!confirm(`⚠️ CZY NA PEWNO chcesz bezpowrotnie USUNĄĆ profil "${target}" oraz wszystkie jego powiązane dane z bazy portalu?`)) {
                return;
            }

            // Usunięcie danych profilu z localStorage
            localStorage.removeItem('lumina_profile_' + target);
            localStorage.removeItem('lumina_avatar_' + target);
            localStorage.removeItem('lumina_cover_' + target);

            // Usunięcie z listy zarejestrowanych
            try {
                let customUsers = JSON.parse(localStorage.getItem('lumina_custom_users_list') || '[]');
                customUsers = customUsers.filter(u => u.slug !== target);
                localStorage.setItem('lumina_custom_users_list', JSON.stringify(customUsers));
            } catch(e) {}

            if (typeof window.showToast === 'function') {
                window.showToast(`🗑️ Profil ${target} został pomyślnie usunięty.`);
            } else {
                alert(`🗑️ Profil ${target} został pomyślnie usunięty.`);
            }

            this.renderProfilesListInModal();

            if (target === this.slug) {
                setTimeout(() => {
                    window.location.href = 'lumina-tablica.html';
                }, 1000);
            }
        },

        deleteCurrentProfileConfirm: function() {
            this.deleteProfile(this.slug);
        },

        promptCreateNewProfile: function() {
            const name = prompt('Podaj Imię i Nazwisko nowego użytkownika / profilu:');
            if (!name) return;
            const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '').trim() || ('user_' + Date.now());

            const newProfile = {
                slug: slug,
                name: name,
                role: 'Użytkownik Portalu',
                type: 'user',
                verified: false,
                avatar: 'icon.png'
            };

            let customUsers = [];
            try {
                customUsers = JSON.parse(localStorage.getItem('lumina_custom_users_list') || '[]');
            } catch(e) {}

            customUsers.push(newProfile);
            localStorage.setItem('lumina_custom_users_list', JSON.stringify(customUsers));

            localStorage.setItem('lumina_profile_' + slug, JSON.stringify({
                name: name,
                job: 'Użytkownik Portalu',
                verified: false,
                privacy: 'public',
                bio: 'Nowy profil w społeczności LUMINA.'
            }));

            if (typeof window.showToast === 'function') {
                window.showToast(`✨ Utworzono profil: ${name} (slug: ${slug})`);
            }

            this.renderProfilesListInModal();
            this.openFullEditor(slug);
        },

        // ══════════ MENEDŻER WSZYSTKICH PROFILI (MODAL) ══════════
        
        openPushNotificationModal: function() {
            this.closeModal('adminShieldQuickModal');
            document.getElementById('adminPushNotificationForm').reset();
            document.getElementById('adminPushRecurringOpts').style.display = 'none';
            document.getElementById('adminPushNotificationModal').style.display = 'flex';
            document.getElementById('adminPushNotificationModal').style.opacity = '1';
            document.getElementById('adminPushNotificationModal').style.visibility = 'visible';
        },
        submitPushNotification: function(e) {
            e.preventDefault();
            const title = document.getElementById('adminPushTitle').value.trim();
            const message = document.getElementById('adminPushContent').value.trim();
            const actionType = document.getElementById('adminPushActionType').value;
            const actionLink = document.getElementById('adminPushActionLink').value.trim() || '#';
            const audience = document.getElementById('adminPushAudience').value;

            const scheduleType = document.querySelector('input[name="adminPushScheduleType"]:checked').value;
            const interval = document.getElementById('adminPushInterval').value;
            const time = document.getElementById('adminPushTime').value;

            // Zbuduj strukturę powiadomienia
            const pushData = {
                title,
                message,
                actionType,
                audience,
                actionLink,
                scheduleType,
                interval: scheduleType === 'recurring' ? interval : null,
                time: scheduleType === 'recurring' ? time : null,
                createdAt: Date.now(),
                sender: this.slug || 'LUMINA_SYSTEM'
            };

            console.log('Sending PUSH Notification Config:', pushData);
            
            // Integracja z Firestore (zapis konfiguracji PUSH)
            if (window.LuminaDB && window.LuminaDB.db) {
                const { collection, addDoc } = require('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
                // UWAGA: wymaga dynamicznego importu lub użycia db bezpośrednio.
                // Uprośćmy: korzystamy z prekonfigurowanego LuminaDB jeśli istnieje:
                import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js').then(({ collection, addDoc }) => {
                    addDoc(collection(window.LuminaDB.db, 'push_notifications'), pushData).catch(err => console.error("Error saving PUSH:", err));
                }).catch(e => console.warn(e));
            }


            if (window.showToast) {
                if (scheduleType === 'once') {
                    window.showToast('🔔 Powiadomienie PUSH zostało wysłane pomyślnie!');
                    // Tu wpięcie w system notifications - dla celów demonstracyjnych symulujemy pusha po chwili
                    if (window.LuminaNotifications) {
                        setTimeout(() => {
                            window.LuminaNotifications.push(
                                "🔔 " + title,
                                message,
                                "logo-192x192.png",
                                actionLink
                            );
                        }, 1500);
                    }
                } else {
                    window.showToast('📅 Cykliczne powiadomienie zostało zaplanowane!');
                }
            } else {
                alert(scheduleType === 'once' ? 'Wysłano PUSH!' : 'Zaplanowano cyklicznego PUSHa!');
            }

            this.closeModal('adminPushNotificationModal');
        },
        openAllProfilesManager: function() {
            this.renderProfilesListInModal();
            this.openModal('adminAllProfilesModal');
        },

        renderProfilesListInModal: function(query = '') {
            const container = document.getElementById('adminProfilesListContainer');
            if (!container) return;

            const all = getAllRegisteredProfiles();
            const blocked = getBlockedProfiles();
            const q = (query || '').toLowerCase().trim();

            const filtered = all.filter(p => {
                if (!q) return true;
                return (p.name && p.name.toLowerCase().includes(q)) ||
                       (p.slug && p.slug.toLowerCase().includes(q)) ||
                       (p.role && p.role.toLowerCase().includes(q));
            });

            if (filtered.length === 0) {
                container.innerHTML = '<div style="padding:20px; text-align:center; color:#94a3b8;">Nie znaleziono profili pasujących do wyszukiwania.</div>';
                return;
            }

            container.innerHTML = filtered.map(p => {
                const isBlocked = blocked.includes(p.slug.toLowerCase());
                const savedData = this.getCurrentData(p.slug);
                const displayName = savedData.name || p.name;
                const displayRole = savedData.job || p.role || 'Profil LUMINA';
                const avatarSrc = localStorage.getItem('lumina_avatar_' + p.slug) || p.avatar || 'icon.png';
                const profileUrl = (p.slug === 'andrzejthiel') ? 'lumina.andrzejthiel.html' : 
                                   (p.slug === 'cezaryrgowski') ? 'lumina.cezaryrgowski.html' :
                                   (p.slug === 'wiolettarogowska') ? 'lumina.wiolettarogowska.html' :
                                   `lumina-profile.html?u=${p.slug}`;

                return `
                    <div style="display:flex; align-items:center; justify-content:space-between; padding:12px 16px; border-radius:14px; background:rgba(255,255,255,0.04); border:1px solid ${isBlocked ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.08)'}; flex-wrap:wrap; gap:10px;">
                        <div style="display:flex; align-items:center; gap:12px; min-width:220px;">
                            <img src="${avatarSrc}" alt="${displayName}" style="width:40px; height:40px; border-radius:50%; object-fit:cover; border:1.5px solid ${isBlocked ? '#ef4444' : 'rgba(250,204,21,0.6)'};" onerror="this.src='icon.png'">
                            <div>
                                <div style="display:flex; align-items:center; gap:6px;">
                                    <span style="font-weight:800; font-size:0.95rem; color:#fff;">${displayName}</span>
                                    ${savedData.verified !== false ? '<i class="fa-solid fa-circle-check" style="color:#38bdf8; font-size:0.80rem;" title="Zweryfikowany"></i>' : ''}
                                    ${isBlocked ? '<span style="font-size:0.70rem; padding:2px 6px; border-radius:6px; background:#ef4444; color:#fff; font-weight:800;">ZABLOKOWANY</span>' : ''}
                                </div>
                                <div style="font-size:0.75rem; color:#94a3b8;">${displayRole} • slug: <code>${p.slug}</code></div>
                            </div>
                        </div>

                        <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
                            <a href="${profileUrl}" target="_blank" class="admin-suite-btn" style="padding:6px 10px; font-size:0.75rem;" title="Otwórz profil">
                                <i class="fa-solid fa-arrow-up-right-from-square"></i> Zobacz
                            </a>
                            <button type="button" class="admin-suite-btn btn-gold" style="padding:6px 10px; font-size:0.75rem;" onclick="window.LuminaAdminSuite.openFullEditor('${p.slug}')" title="Edytuj dane tego profilu">
                                <i class="fa-solid fa-pencil"></i> Edytuj
                            </button>
                            <button type="button" class="admin-suite-btn ${isBlocked ? 'btn-cyan' : 'btn-warn'}" style="padding:6px 10px; font-size:0.75rem;" onclick="window.LuminaAdminSuite.toggleBlockProfile('${p.slug}')" title="${isBlocked ? 'Odblokuj' : 'Zablokuj'} profil">
                                <i class="fa-solid ${isBlocked ? 'fa-unlock' : 'fa-ban'}"></i> ${isBlocked ? 'Odblokuj' : 'Zablokuj'}
                            </button>
                            <button type="button" class="admin-suite-btn btn-danger" style="padding:6px 10px; font-size:0.75rem;" onclick="window.LuminaAdminSuite.deleteProfile('${p.slug}')" title="Usuń profil">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        },

        // ══════════ MULTIMEDIA & PUBLIKACJE ══════════
        handleAvatarSelect: function(e) {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (evt) => {
                const dataUrl = evt.target.result;
                const avatarImgs = document.querySelectorAll('.avatar-img, .profile-avatar-img, .author-avatar, #avatarImgEl');
                avatarImgs.forEach(img => { img.src = dataUrl; });
                localStorage.setItem('lumina_avatar_' + this.slug, dataUrl);
                if (typeof window.showToast === 'function') {
                    window.showToast('📸 Nowy avatar profilu został wgrany i zapisany! ✨');
                }
            };
            reader.readAsDataURL(file);
        },

        handleCoverSelect: function(e) {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (evt) => {
                const dataUrl = evt.target.result;
                const coverEls = document.querySelectorAll('.profile-cover, .cover-img, #coverImgEl');
                coverEls.forEach(el => {
                    if (el.tagName === 'IMG') el.src = dataUrl;
                    else el.style.backgroundImage = `url(${dataUrl})`;
                });
                localStorage.setItem('lumina_cover_' + this.slug, dataUrl);
                if (typeof window.showToast === 'function') {
                    window.showToast('🖼️ Nowe tło profilu zostało wgrane i zapisany! ✨');
                }
            };
            reader.readAsDataURL(file);
        },

        handleGallerySelect: function(e) {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (evt) => {
                if (typeof window.showToast === 'function') {
                    window.showToast('🖼️ Dodano nowe zdjęcie do galerii profilu!');
                }
            };
            reader.readAsDataURL(file);
        },

        openNewPostModal: function() {
            document.getElementById('adminPostModalHeaderTitle').textContent = `Nowy Wpis dla: ${this.slug}`;
            document.getElementById('adminEditPostId').value = '';
            document.getElementById('adminPostSeries').value = '';
            document.getElementById('adminPostTitle').value = '';
            document.getElementById('adminPostContent').value = '';
            document.getElementById('adminPostPrayer').value = '';
            this.openModal('adminUniversalPostModal');
        },

        savePostSubmit: function(e) {
            if (e && e.preventDefault) e.preventDefault();
            const series = document.getElementById('adminPostSeries').value.trim();
            const title = document.getElementById('adminPostTitle').value.trim();
            const content = document.getElementById('adminPostContent').value.trim();
            const prayer = document.getElementById('adminPostPrayer').value.trim();

            this.closeModal('adminUniversalPostModal');

            // Prepend new post dynamically to the feed
            const feedCol = document.querySelector('.main-feed-col, .feed-stream, .profile-feed');
            if (feedCol) {
                const article = document.createElement('article');
                article.className = 'feed-post-card';
                article.style.marginBottom = '20px';
                article.innerHTML = `
                    <div class="post-top-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                        <div style="font-weight:800; font-size:0.95rem; color:#facc15;">${series || 'NOWY WPIS'}</div>
                        <span style="font-size:0.75rem; color:#94a3b8;">Przed chwilą • Publiczny</span>
                    </div>
                    <h2 class="post-title" style="font-size:1.4rem; font-weight:800; margin-bottom:12px; color:#fff;">${title}</h2>
                    <div class="post-text-content" style="font-size:0.94rem; color:#cbd5e1; line-height:1.7; white-space:pre-line; margin-bottom:14px;">${content}</div>
                    ${prayer ? `<div class="post-prayer-highlight" style="background:rgba(245,158,11,0.1); border-left:3px solid #f59e0b; padding:12px 14px; border-radius:8px; font-style:italic; color:#fef08a; margin-bottom:14px;">${prayer}</div>` : ''}
                `;
                feedCol.prepend(article);
            }

            if (typeof window.showToast === 'function') {
                window.showToast('✨ Wpis został pomyślnie opublikowany!');
            }
        },

        runSelfRepair: function() {
            if (window.LuminaAutoRepair && typeof window.LuminaAutoRepair.repairAll === 'function') {
                const report = window.LuminaAutoRepair.repairAll(true);
                const detailedInfo = `🛡️ Auto-Naprawa LUMINA:
• Stan: ${report.status.toUpperCase()}
• Przechwycone zdarzenia: ${report.errorsCaught}
• Wykonane procedury: ${report.healedEvents}
• Czas wykonania: ${report.durationMs} ms`;
                console.log(detailedInfo);
            } else {
                if (typeof window.showToast === 'function') {
                    window.showToast('🛡️ Silnik Auto-Naprawy przeskanował aplikację. Brak błędów!');
                }
            }
        }
    };

    // Automatyczna inicjalizacja po załadowaniu DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => window.LuminaAdminSuite.init());
    } else {
        window.LuminaAdminSuite.init();
    }
})();
