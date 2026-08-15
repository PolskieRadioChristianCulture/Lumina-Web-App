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
        /* ── LUMINA BOTTOM NAVIGATION BAR (PWA / Mobile) ── */
        .lumina-bottom-nav {
            position: fixed !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            width: 100% !important;
            height: 68px !important;
            background: rgba(9, 14, 30, 0.94) !important;
            backdrop-filter: blur(24px) saturate(180%) !important;
            -webkit-backdrop-filter: blur(24px) saturate(180%) !important;
            border-top: 1px solid rgba(255, 255, 255, 0.08) !important;
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
            top: -4px !important;
            right: -8px !important;
            min-width: 17px !important;
            height: 17px !important;
            border-radius: 9px !important;
            background: #ef4444 !important;
            color: #ffffff !important;
            font-size: 9.5px !important;
            font-weight: 800 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            padding: 0 4px !important;
            border: 2px solid #0b1838 !important;
            box-shadow: 0 0 10px rgba(239, 68, 68, 0.85) !important;
            animation: pulseNavBadge 2s infinite !important;
            transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s !important;
        }

        @keyframes pulseNavBadge {
            0%, 100% { transform: scale(1); box-shadow: 0 0 10px rgba(239, 68, 68, 0.85); }
            50% { transform: scale(1.18); box-shadow: 0 0 16px rgba(239, 68, 68, 1); }
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
    const isDiscover = pathname.includes('lumina.html') || (pathname.endsWith('/lumina') && !pathname.includes('tablica') && !pathname.includes('women') && !pathname.includes('osobowosc') && !pathname.includes('radiocc') && !pathname.includes('cctv') && !pathname.includes('ccmen'));
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

    // Stan nieprzeczytanych wiadomości
    const initialUnread = parseInt(localStorage.getItem('lumina_messages_unread_count') || '1', 10);

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

            <!-- 3. Wiadomości (Koperta z Live Badge) -->
            <button type="button" class="lumina-nav-tab" id="navTabMessages" onclick="window.openCcMessagesModal()" title="Wiadomości, Czaty & Kawa ☕">
                <div style="position:relative; display:inline-flex; align-items:center; justify-content:center;">
                    <i class="fa-solid fa-envelope" style="color: #ec4899;"></i>
                    <span id="bottomNavMsgBadge" class="lumina-nav-badge" style="${initialUnread > 0 ? 'display:flex;' : 'display:none;'}">${initialUnread > 9 ? '9+' : initialUnread}</span>
                </div>
                <span>Wiadomości</span>
            </button>

            <!-- 4. Kanały CC (Christian Culture NETWORK) -->
            <button type="button" class="lumina-nav-tab" id="navTabNetwork" onclick="window.openCcNetworkModal()" title="Kanały Nadawcze & YouTube Christian Culture NETWORK">
                <i class="fa-solid fa-tv" style="color: #facc15;"></i>
                <span>Kanały CC</span>
            </button>

            <!-- 5. Market CC (Sklep Christian Culture) -->
            <a href="https://my-store-1009741.creator-spring.com/" target="_blank" rel="noopener noreferrer" class="lumina-nav-tab" id="navTabStore" title="Oficjalny Sklep Christian Culture (Market Creator Spring)">
                <i class="fa-solid fa-bag-shopping" style="color: #38bdf8;"></i>
                <span>Market CC</span>
            </a>

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

    // 4. Globalne funkcje i Real-Time Live Badge dla Wiadomości
    window.updateLuminaMessagesBadge = function(count) {
        const badge = document.getElementById('bottomNavMsgBadge');
        if (!badge) return;
        const num = typeof count === 'number' ? count : parseInt(localStorage.getItem('lumina_messages_unread_count') || '0', 10);
        if (num > 0) {
            badge.style.display = 'flex';
            badge.textContent = num > 9 ? '9+' : num;
            localStorage.setItem('lumina_messages_unread_count', String(num));
        } else {
            badge.style.display = 'none';
            localStorage.setItem('lumina_messages_unread_count', '0');
        }
    };

    window.openCcMessagesModal = function() {
        const m = document.getElementById('modalCcMessages');
        if (m) m.classList.add('open');
        // Natychmiastowe oznaczenie wiadomości jako przeczytane w czasie rzeczywistym
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

        const isCurrentlyAdmin = (sessionStorage.getItem('lumina_auth_master_admin') === 'true');
        if (isCurrentlyAdmin) {
            const confirmLock = confirm('👑 Jesteś obecnie zalogowany jako Główny Administrator Portalu LUMINA.\n\nCzy chcesz ZABLOKOWAĆ tryb Administratora i przejść do widoku zwykłego gościa?');
            if (confirmLock) {
                sessionStorage.removeItem('lumina_auth_master_admin');
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
                document.body.classList.add('owner-mode-active');
                if (typeof window.checkOwnerAuthSession === 'function') window.checkOwnerAuthSession();
                const toastFn = window.showToast || window.luminaToast || alert;
                toastFn('👑 Witaj Dowódco! Panel Administratora Portalu Aktywowany.');
                setTimeout(() => window.location.reload(), 500);
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

    document.body.insertAdjacentHTML('beforeend', navHtml + `

    <!-- ══════════ TAJNY SUBTELNY PRZYCISK ADMINISTRATORA ══════════ -->
    <div id="luminaSecretAdminBtn" onclick="window.triggerSecretAdminPrompt(event)" title="LUMINA Security" style="position:fixed; bottom:10px; right:8px; width:22px; height:22px; border-radius:50%; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05); color:rgba(255,255,255,0.18); font-size:10px; display:flex; align-items:center; justify-content:center; cursor:pointer; z-index:999999; transition:all 0.25s ease;" onmouseenter="this.style.color='#facc15'; this.style.borderColor='rgba(250,204,21,0.4)'; this.style.background='rgba(250,204,21,0.12)'; this.style.transform='scale(1.15)';" onmouseleave="this.style.color='rgba(255,255,255,0.18)'; this.style.borderColor='rgba(255,255,255,0.05)'; this.style.background='rgba(255,255,255,0.02)'; this.style.transform='scale(1)';">
        <i class="fa-solid fa-crown"></i>
    </div>
`);
})();
