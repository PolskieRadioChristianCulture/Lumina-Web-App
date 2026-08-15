/**
 * ══════════════════════════════════════════════════════════════════════════
 * LUMINA BOTTOM NAV PWA MODULE (lumina-bottom-nav.js)
 * Pływający Dolny Pasek Nawigacyjny UX (Mobile-First) dla Ekosystemu LUMINA
 * 1. Odkrywaj | 2. Tablica | 3. Wiadomości (Koperta) | 4. Kanały CC | 5. Sklep CC | 6. Mój Profil
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
            background: rgba(11, 24, 56, 0.95) !important;
            backdrop-filter: blur(20px) !important;
            -webkit-backdrop-filter: blur(20px) !important;
            border-top: 1.5px solid rgba(250, 204, 21, 0.25) !important;
            box-shadow: 0 -8px 26px rgba(0, 0, 0, 0.7), 0 0 15px rgba(250, 204, 21, 0.1) !important;
            display: flex !important;
            align-items: center !important;
            justify-content: space-around !important;
            padding: 0 4px !important;
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
            font-size: 0.65rem !important;
            font-weight: 700 !important;
            gap: 3px !important;
            padding: 6px 1px !important;
            position: relative !important;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
            -webkit-tap-highlight-color: transparent !important;
            cursor: pointer !important;
            background: none !important;
            border: none !important;
        }

        .lumina-nav-tab i {
            font-size: 1.2rem !important;
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
            right: calc(50% - 12px) !important;
            width: 8px !important;
            height: 8px !important;
            border-radius: 50% !important;
            background: #ef4444 !important;
            box-shadow: 0 0 8px #ef4444 !important;
        }

        /* Odstęp u dołu strony */
        body {
            padding-bottom: 78px !important;
        }

        /* Responsywny Desktop */
        @media (min-width: 1024px) {
            .lumina-bottom-nav {
                max-width: 580px !important;
                left: 50% !important;
                right: auto !important;
                transform: translateX(-50%) !important;
                border-radius: 24px 24px 0 0 !important;
                border: 1.5px solid rgba(250, 204, 21, 0.3) !important;
                border-bottom: none !important;
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
    const isDiscover = pathname.includes('lumina.html') || (pathname.endsWith('/lumina') && !pathname.includes('tablica') && !pathname.includes('women'));
    const isTablica = pathname.includes('lumina-tablica');
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
        <nav class="lumina-bottom-nav" id="luminaBottomNav" role="navigation" aria-label="Nawigacja dolna LUMINA">
            <!-- 1. Odkrywaj -->
            <a href="lumina.html" class="lumina-nav-tab ${isDiscover ? 'active' : ''}" id="navTabDiscover" title="Odkrywaj Chrześcijańskie Profile">
                <i class="fa-solid fa-heart-circle-bolt"></i>
                <span>Odkrywaj</span>
            </a>

            <!-- 2. Tablica Społeczności -->
            <a href="lumina-tablica.html" class="lumina-nav-tab ${isTablica ? 'active' : ''}" id="navTabFeed" title="Główna Tablica Społeczności">
                <i class="fa-solid fa-users-viewfinder"></i>
                <span>Tablica</span>
            </a>

            <!-- 3. Wiadomości (Koperta) -->
            <button type="button" class="lumina-nav-tab" id="navTabMessages" onclick="window.openCcMessagesModal()" title="Wiadomości, Czaty & Kawa ☕">
                <i class="fa-solid fa-envelope" style="color: #ec4899;"></i>
                <div class="lumina-nav-badge"></div>
                <span>Wiadomości</span>
            </button>

            <!-- 4. Kanały CC (Christian Culture NETWORK) -->
            <button type="button" class="lumina-nav-tab" id="navTabNetwork" onclick="window.openCcNetworkModal()" title="Kanały Nadawcze & YouTube Christian Culture NETWORK">
                <i class="fa-solid fa-tv" style="color: #facc15;"></i>
                <span>Kanały CC</span>
            </button>

            <!-- 5. Sklep CC (Market) -->
            <button type="button" class="lumina-nav-tab" id="navTabStore" onclick="window.openCcStoreModal()" title="Sklep Christian Culture • Książki, Płyty, Bluzy i Dewocjonalia">
                <i class="fa-solid fa-bag-shopping" style="color: #38bdf8;"></i>
                <span>Sklep CC</span>
            </button>

            <!-- 6. Mój Profil -->
            <a href="${myProfileHref}" class="lumina-nav-tab ${isProfile ? 'active' : ''}" id="navTabProfile" title="Mój Profil / Panel Właściciela">
                <i class="fa-solid fa-user-gear"></i>
                <span>Mój Profil</span>
            </a>
        </nav>

        <!-- ══════════ MODAL WIADOMOŚCI & CZATÓW ══════════ -->
        <div class="cc-nav-modal" id="modalCcMessages" onclick="if(event.target===this) this.classList.remove('open')">
            <div style="background:#0b1838; border:1.5px solid rgba(236,72,153,0.4); border-radius:24px; padding:24px 20px; max-width:480px; width:94%; max-height:85vh; overflow-y:auto; box-shadow:0 24px 60px rgba(0,0,0,0.85); color:#fff; position:relative;">
                <button type="button" onclick="document.getElementById('modalCcMessages').classList.remove('open')" style="position:absolute; top:16px; right:16px; background:rgba(255,255,255,0.08); border:none; color:#cbd5e1; width:32px; height:32px; border-radius:50%; cursor:pointer; font-size:1.1rem; display:flex; align-items:center; justify-content:center;">&times;</button>
                <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
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
                                <span style="font-size:0.72rem; color:#facc15; font-weight:700;">☕ Kawa</span>
                            </div>
                            <div style="font-size:0.78rem; color:#cbd5e1; margin-top:2px;">Witaj w portalu LUMINA! Szczęść Boże 🕊️</div>
                        </div>
                    </div>

                    <div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:16px; padding:14px; display:flex; align-items:center; gap:12px; cursor:pointer;" onclick="window.location.href='lumina.ccwomen.html'">
                        <img src="logo_cc_women.jpg" alt="CC Women" style="width:46px; height:46px; border-radius:50%; object-fit:cover; border:1.5px solid #ec4899;">
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
                        Odkryj nowe profile i zaproś kogoś na Kawę ☕
                    </a>
                </div>
            </div>
        </div>

        <!-- ══════════ MODAL KANAŁÓW CC NETWORK (40+ KANAŁÓW YT & STREAMY LIVE) ══════════ -->
        <div class="cc-nav-modal" id="modalCcNetwork" onclick="if(event.target===this) this.classList.remove('open')">
            <div style="background:#0b1838; border:1.5px solid rgba(250,204,21,0.4); border-radius:24px; padding:24px 20px; max-width:480px; width:94%; max-height:85vh; overflow-y:auto; box-shadow:0 24px 60px rgba(0,0,0,0.85); color:#fff; position:relative;">
                <button type="button" onclick="document.getElementById('modalCcNetwork').classList.remove('open')" style="position:absolute; top:16px; right:16px; background:rgba(255,255,255,0.08); border:none; color:#cbd5e1; width:32px; height:32px; border-radius:50%; cursor:pointer; font-size:1.1rem; display:flex; align-items:center; justify-content:center;">&times;</button>
                <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
                    <div style="width:44px; height:44px; border-radius:14px; background:linear-gradient(135deg, #ef4444, #f59e0b); display:flex; align-items:center; justify-content:center; font-size:1.4rem; color:#fff; box-shadow:0 0 16px rgba(239,68,68,0.4);">
                        <i class="fa-brands fa-youtube"></i>
                    </div>
                    <div>
                        <h3 style="font-family:'Outfit',sans-serif; font-size:1.25rem; font-weight:800; color:#fff; margin:0;">Christian Culture NETWORK</h3>
                        <p style="font-size:0.78rem; color:#facc15; margin:0; font-weight:700;">📺 Kanały Nadawcze & 40+ Kanałów YouTube</p>
                    </div>
                </div>
                <p style="font-size:0.85rem; color:#cbd5e1; margin-bottom:16px; line-height:1.5;">Oglądaj, słuchaj i buduj swoją wiarę w oficjalnych kanałach ekosystemu Christian Culture:</p>
                
                <div style="display:flex; flex-direction:column; gap:10px;">
                    <a href="snadaniowa-live.html" class="network-item-link" style="display:flex; align-items:center; gap:14px; padding:12px 14px; border-radius:16px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); text-decoration:none; color:#fff; transition:background 0.2s;">
                        <i class="fa-solid fa-radio" style="font-size:1.3rem; color:#facc15; width:28px; text-align:center;"></i>
                        <div style="flex:1;">
                            <div style="font-weight:800; font-size:0.92rem;">Radio CC • Śniadaniowa & Live 24/7</div>
                            <div style="font-size:0.75rem; color:#94a3b8;">Muzyka uwielbienia, transmisje na żywo, RDS</div>
                        </div>
                        <i class="fa-solid fa-chevron-right" style="color:#64748b; font-size:0.85rem;"></i>
                    </a>

                    <a href="cctv24.html" class="network-item-link" style="display:flex; align-items:center; gap:14px; padding:12px 14px; border-radius:16px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); text-decoration:none; color:#fff; transition:background 0.2s;">
                        <i class="fa-solid fa-tv" style="font-size:1.3rem; color:#ef4444; width:28px; text-align:center;"></i>
                        <div style="flex:1;">
                            <div style="font-weight:800; font-size:0.92rem;">CCTV24 • Telewizja Chrześcijańska</div>
                            <div style="font-size:0.75rem; color:#94a3b8;">Pasma wideo, kazania, nauczania i świadectwa</div>
                        </div>
                        <i class="fa-solid fa-chevron-right" style="color:#64748b; font-size:0.85rem;"></i>
                    </a>

                    <a href="lumina.ccwomen.html" class="network-item-link" style="display:flex; align-items:center; gap:14px; padding:12px 14px; border-radius:16px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); text-decoration:none; color:#fff; transition:background 0.2s;">
                        <i class="fa-solid fa-venus" style="font-size:1.3rem; color:#ec4899; width:28px; text-align:center;"></i>
                        <div style="flex:1;">
                            <div style="font-weight:800; font-size:0.92rem;">CC Women Official • Kobiety Wiary</div>
                            <div style="font-size:0.75rem; color:#94a3b8;">Oficjalny kanał YT i wspólnota modlitewna kobiet</div>
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
                
                <div style="display:flex; flex-direction:column; gap:10px; text-align:left; margin-bottom:20px;">
                    <div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:14px; padding:12px 14px; display:flex; align-items:center; gap:12px;">
                        <i class="fa-solid fa-compact-disc" style="color:#facc15; font-size:1.4rem;"></i>
                        <div>
                            <div style="font-weight:700; font-size:0.9rem;">Albumy & Biblia Śpiewana Audio</div>
                            <div style="font-size:0.75rem; color:#94a3b8;">Kompletne wydania MP3 i płyty CD audio</div>
                        </div>
                    </div>
                    <div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:14px; padding:12px 14px; display:flex; align-items:center; gap:12px;">
                        <i class="fa-solid fa-shirt" style="color:#ec4899; font-size:1.4rem;"></i>
                        <div>
                            <div style="font-weight:700; font-size:0.9rem;">Bluzy & Odzież Christian Culture</div>
                            <div style="font-size:0.75rem; color:#94a3b8;">Wysokiej jakości odzież z biblijnym przesłaniem</div>
                        </div>
                    </div>
                    <div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:14px; padding:12px 14px; display:flex; align-items:center; gap:12px;">
                        <i class="fa-solid fa-book-bible" style="color:#38bdf8; font-size:1.4rem;"></i>
                        <div>
                            <div style="font-weight:700; font-size:0.9rem;">Książki, Rozważania i E-booki</div>
                            <div style="font-size:0.75rem; color:#94a3b8;">Duchowe wsparcie i literatura budująca wiarę</div>
                        </div>
                    </div>
                </div>

                <a href="https://polskieradio.cc/index.html#support" target="_blank" rel="noopener noreferrer" style="display:block; width:100%; padding:12px 18px; border-radius:14px; background:linear-gradient(135deg, #38bdf8, #2563eb); color:#fff; text-decoration:none; font-weight:800; font-size:0.92rem; box-shadow:0 6px 20px rgba(56,189,248,0.35);">
                    Przejdź do Sklepu & Wsparcia Misji ➔
                </a>
            </div>
        </div>
    `;

    // Globalne funkcje otwierania modali
    window.openCcMessagesModal = function() {
        const m = document.getElementById('modalCcMessages');
        if (m) m.classList.add('open');
    };
    window.openCcNetworkModal = function() {
        const m = document.getElementById('modalCcNetwork');
        if (m) m.classList.add('open');
    };
    window.openCcStoreModal = function() {
        const m = document.getElementById('modalCcStore');
        if (m) m.classList.add('open');
    };

    // Usuń ewentualne stare wersje paska nawigacji
    document.querySelectorAll('.lumina-mobile-nav, #mobileNav').forEach(el => el.remove());

    document.body.insertAdjacentHTML('beforeend', navHtml);
})();
