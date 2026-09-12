/**
 * ══════════════════════════════════════════════════════════════════════════
 * LUMINA FOLLOWED FRIENDS WIDGET (js/lumina-followed-friends.js)
 * Wyświetla awatary obserwowanych znajomych pod wizytówką na profilach LUMINA
 * Standard: Obsidian & Gold, @ProgresMCC, @SMCC Touch Ergonomics (44px+)
 * ══════════════════════════════════════════════════════════════════════════
 */

(function () {
    'use strict';

    // Baza kluczowych profili społeczności LUMINA
    const COMMUNITY_FRIENDS = [
        {
            slug: 'cezaryrgowski',
            name: 'Cezary Rogowski',
            shortName: 'Cezary',
            avatar: 'avatar_cezary_official.jpg',
            role: 'Założyciel 👑',
            url: 'lumina.cezaryrgowski.html',
            city: 'Ostrowiec Św.'
        },
        {
            slug: 'wiolettarogowska',
            name: 'Wioletta Rogowska',
            shortName: 'Wioletta',
            avatar: 'avatar_wioletta_official.jpg',
            role: 'Współzałożycielka 🌸',
            url: 'lumina.wiolettarogowska.html',
            city: 'Ostrowiec Św.'
        },
        {
            slug: 'zbyszekgieron',
            name: 'Zbyszek Gieroń',
            shortName: 'Zbyszek',
            avatar: 'avatar_zbyszek_gieron.jpg',
            role: 'Profil Misyjny 🕊️',
            url: 'lumina.zbyszekgieron.html',
            city: 'Polska'
        },
        {
            slug: 'andrzejthiel',
            name: 'Andrzej Thiel',
            shortName: 'Andrzej',
            avatar: 'avatar_andrzej_thiel.jpg',
            role: 'Lider CC 🛡️',
            url: 'lumina.andrzejthiel.html',
            city: 'Gdańsk'
        },
        {
            slug: 'jolawojcik',
            name: 'Jola Wójcik',
            shortName: 'Jola',
            avatar: 'avatar_jolawojcik.jpg',
            role: 'Czas Modlitwy 🙏',
            url: 'lumina.jolawojcik.html',
            city: 'Lublin'
        },
        {
            slug: 'magdalena',
            name: 'Magdalena',
            shortName: 'Magda',
            avatar: 'avatar_magdalena.jpg',
            role: 'Świadectwo 🕊️',
            url: 'lumina.magdalena.html',
            city: 'Poznań'
        },
        {
            slug: 'pawelmurawski',
            name: 'Paweł Murawski',
            shortName: 'Paweł',
            avatar: 'avatar_pawel_murawski.jpg',
            role: 'Życie z Bogiem ✝️',
            url: 'lumina.pawelmurawski.html',
            city: 'Kraków'
        },
        {
            slug: 'tomek',
            name: 'Tomasz',
            shortName: 'Tomek',
            avatar: 'avatar_tomek.jpg',
            role: 'Młodzież 🎸',
            url: 'lumina.html?user=tomek',
            city: 'Warszawa'
        },
        {
            slug: 'noemi',
            name: 'Noemi',
            shortName: 'Noemi',
            avatar: 'avatar_noemi.jpg',
            role: 'Uwielbienie 🎶',
            url: 'lumina.html?user=noemi',
            city: 'Kraków'
        },
        {
            slug: 'dawid',
            name: 'Dawid',
            shortName: 'Dawid',
            avatar: 'avatar_dawid.jpg',
            role: 'Ewangelizacja 📖',
            url: 'lumina.html?user=dawid',
            city: 'Wrocław'
        },
        {
            slug: 'weronika',
            name: 'Weronika',
            shortName: 'Weronika',
            avatar: 'avatar_weronika.jpg',
            role: 'Diakonia 🌸',
            url: 'lumina.html?user=weronika',
            city: 'Łódź'
        },
        {
            slug: 'ania',
            name: 'Ania',
            shortName: 'Ania',
            avatar: 'avatar_ania.jpg',
            role: 'Modlitwa 🕊️',
            url: 'lumina.html?user=anna',
            city: 'Gdańsk'
        },
        {
            slug: 'zofiadudek',
            name: 'Zofia Dudek',
            shortName: 'Zofia',
            avatar: 'avatar_zofia_dudek.jpg',
            role: 'Rodzina 🌿',
            url: 'lumina.zofiadudek.html',
            city: 'Wrocław'
        },
        {
            slug: 'robert',
            name: 'Robert',
            shortName: 'Robert',
            avatar: 'avatar_robert.jpg',
            role: 'Świadectwo ✝️',
            url: 'lumina.html?user=robert',
            city: 'Katowice'
        }
    ];

    // Wstrzyknięcie uniwersalnych stylów CSS widżetu
    function injectStyles() {
        if (document.getElementById('lumina-followed-friends-styles')) return;

        const styleEl = document.createElement('style');
        styleEl.id = 'lumina-followed-friends-styles';
        styleEl.textContent = `
            .followed-friends-card {
                background: var(--navy-surface, #0b1838) !important;
                border: 1px solid rgba(245, 158, 11, 0.28) !important;
                border-radius: var(--radius-lg, 20px) !important;
                padding: 20px !important;
                margin-bottom: 22px !important;
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3) !important;
                position: relative;
                overflow: hidden;
            }

            .followed-friends-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 2px;
                background: linear-gradient(90deg, transparent, #facc15, #f59e0b, transparent);
            }

            .followed-friends-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 12px;
            }

            .followed-friends-title {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 1rem;
                font-weight: 800;
                color: #fff;
            }

            .followed-friends-badge {
                background: rgba(245, 158, 11, 0.16);
                border: 1px solid rgba(245, 158, 11, 0.4);
                color: #fef08a;
                font-size: 0.75rem;
                font-weight: 800;
                padding: 3px 10px;
                border-radius: 14px;
            }

            .followed-friends-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 14px 6px;
                margin-bottom: 16px;
                width: 100%;
                box-sizing: border-box;
            }

            @media (max-width: 480px) {
                .followed-friends-grid {
                    grid-template-columns: repeat(3, 1fr);
                    gap: 12px 4px;
                }
            }

            .followed-friend-item {
                text-decoration: none;
                display: flex;
                flex-direction: column;
                align-items: center;
                cursor: pointer;
                transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                -webkit-tap-highlight-color: transparent;
                width: 100%;
                min-width: 0;
                box-sizing: border-box;
            }

            .followed-friend-item:hover {
                transform: translateY(-3px) scale(1.05);
            }

            .followed-avatar-wrapper {
                position: relative;
                width: 52px;
                height: 52px;
                margin-bottom: 5px;
                flex-shrink: 0;
            }

            .followed-avatar-img {
                width: 100%;
                height: 100%;
                border-radius: 50%;
                object-fit: cover;
                border: 2px solid rgba(255, 255, 255, 0.2);
                box-shadow: 0 4px 10px rgba(0,0,0,0.3);
                transition: all 0.2s;
            }

            .followed-friend-item:hover .followed-avatar-img {
                border-color: #facc15;
                box-shadow: 0 0 16px rgba(250, 204, 21, 0.6);
            }

            .followed-friend-item.is-active-follow .followed-avatar-img {
                border-color: #facc15;
                box-shadow: 0 0 14px rgba(250, 204, 21, 0.45);
            }

            .followed-online-dot {
                position: absolute;
                bottom: 1px;
                right: 1px;
                width: 11px;
                height: 11px;
                border-radius: 50%;
                background: #10b981;
                border: 2px solid #070b16;
                box-shadow: 0 0 6px #10b981;
            }

            .followed-check-badge {
                position: absolute;
                top: -2px;
                right: -2px;
                background: linear-gradient(135deg, #f59e0b, #ec4899);
                color: #fff;
                width: 16px;
                height: 16px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 0.55rem;
                font-weight: 800;
                border: 1.5px solid #070b16;
            }

            .followed-friend-name {
                font-size: 0.76rem;
                font-weight: 700;
                color: #fff;
                text-align: center;
                width: 100%;
                max-width: 84px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                line-height: 1.25;
            }

            .followed-friend-item.is-active-follow .followed-friend-name {
                color: #fef08a;
            }

            .followed-friend-role {
                font-size: 0.64rem;
                color: #94a3b8;
                text-align: center;
                width: 100%;
                max-width: 84px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                line-height: 1.2;
                margin-top: 2px;
            }

            .followed-discover-btn {
                position: relative;
                width: 52px;
                height: 52px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.05);
                border: 2px dashed rgba(245, 158, 11, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                color: #facc15;
                font-size: 1.1rem;
                margin-bottom: 5px;
                transition: all 0.2s;
                flex-shrink: 0;
            }

            .followed-friend-item:hover .followed-discover-btn {
                background: rgba(245, 158, 11, 0.15);
                border-color: #facc15;
                transform: rotate(90deg);
            }

            .btn-discover-all-friends {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                width: 100%;
                padding: 10px 14px;
                border-radius: 14px;
                background: rgba(245, 158, 11, 0.1);
                border: 1px solid rgba(245, 158, 11, 0.3);
                color: #fef08a;
                text-decoration: none;
                font-size: 0.80rem;
                font-weight: 800;
                transition: all 0.2s;
                min-height: 44px;
                box-sizing: border-box;
            }

            .btn-discover-all-friends:hover {
                background: rgba(245, 158, 11, 0.2);
                border-color: #facc15;
                color: #fff;
            }
        `;
        document.head.appendChild(styleEl);
    }

    // Sprawdza czy użytkownik obserwuje dany profil
    function isFollowing(slug) {
        if (!slug) return false;
        try {
            const val = localStorage.getItem('lumina_following_' + slug);
            if (val === '1' || val === 'true') return true;
        } catch (e) {}

        if (typeof window.isFollowingLocally === 'function') {
            return window.isFollowingLocally(slug);
        }
        return false;
    }

    // Pobiera listę obserwowanych znajomych z priorytetem
    function getFollowedFriendsList(currentProfileSlug) {
        const friends = COMMUNITY_FRIENDS.filter(f => f.slug !== currentProfileSlug);

        const mapped = friends.map(f => {
            const followed = isFollowing(f.slug);
            return {
                ...f,
                isFollowed: followed
            };
        });

        // Posortuj: najpierw aktywnie obserwowani, potem kluczowi ambasadorzy wspólnoty
        mapped.sort((a, b) => {
            if (a.isFollowed && !b.isFollowed) return -1;
            if (!a.isFollowed && b.isFollowed) return 1;
            return 0;
        });

        return mapped;
    }

    // Renderuje zawartość widżetu do wskazanego kontenera
    function renderFollowedFriends(container, currentProfileSlug) {
        if (!container) return;

        injectStyles();

        const friends = getFollowedFriendsList(currentProfileSlug);
        const followedCount = friends.filter(f => f.isFollowed).length;

        const profileBioMap = {
            'cezaryrgowski': 'Założyciel Christian Culture. Razem z żoną Wiolettą służymy Panu.',
            'wiolettarogowska': 'Współzałożycielka Christian Culture. Razem z mężem Cezarym służymy Panu.',
            'zbyszekgieron': 'Głoszenie Ewangelii, misja i świadectwo żywej wiary w Chrystusie.',
            'andrzejthiel': 'Lider męskich grup, formacja i wzrost duchowy w Bożej prawdzie.',
            'jolawojcik': 'Wstawiennictwo, modlitwa i wsparcie dla potrzebujących serc.'
        };
        const subtext = profileBioMap[currentProfileSlug] || 'Osoby ze społeczności LUMINA, których publikacje i świadectwa wiary obserwujesz:';

        // 3 osoby na linię: 8 znajomych + 1 kafelek "Więcej" = 9 elementów (3 równe rzędy po 3, bez ucinania)
        const displayFriends = friends.slice(0, 8);

        const html = `
            <div class="followed-friends-header">
                <div class="followed-friends-title">
                    <i class="fa-solid fa-user-group" style="color:#facc15;"></i>
                    <span>Obserwowani Znajomi</span>
                </div>
                <span class="followed-friends-badge">
                    ${followedCount > 0 ? `${followedCount} aktywnych` : `${friends.length} w sieci`}
                </span>
            </div>
            
            <p style="font-size:0.80rem; color:#94a3b8; line-height:1.45; margin:0 0 14px 0;">
                ${subtext}
            </p>

            <div class="followed-friends-grid">
                ${displayFriends.map(f => `
                    <a href="${f.url}" class="followed-friend-item ${f.isFollowed ? 'is-active-follow' : ''}" title="${f.name} • ${f.role} (${f.city}) ${f.isFollowed ? '• Obserwujesz ✓' : '• Społeczność LUMINA'}">
                        <div class="followed-avatar-wrapper">
                            <img loading="lazy" decoding="async" src="${f.avatar}" alt="${f.name}" onerror="this.src='lumina_icon.jpg'" class="followed-avatar-img">
                            
                            <!-- Wskaźnik online -->
                            <span class="followed-online-dot"></span>
                            
                            <!-- Odznaka Obserwowany -->
                            ${f.isFollowed ? `
                                <span class="followed-check-badge">
                                    <i class="fa-solid fa-check"></i>
                                </span>
                            ` : ''}
                        </div>
                        <div class="followed-friend-name">
                            ${f.shortName}
                        </div>
                        <div class="followed-friend-role">
                            ${f.role}
                        </div>
                    </a>
                `).join('')}

                <!-- Dodatkowy kafelek Odkryj więcej -->
                <a href="lumina.html" class="followed-friend-item" title="Odkryj więcej profili w katalogu LUMINA">
                    <div class="followed-discover-btn">
                        <i class="fa-solid fa-plus"></i>
                    </div>
                    <div class="followed-friend-name" style="color:#facc15;">Więcej</div>
                    <div class="followed-friend-role">Odkrywaj</div>
                </a>
            </div>

            <div style="padding-top:10px; border-top:1px solid rgba(255,255,255,0.08); text-align:center;">
                <a href="lumina.html" class="btn-discover-all-friends">
                    <i class="fa-solid fa-compass"></i> Odkrywaj społeczność LUMINA
                </a>
            </div>
        `;

        container.innerHTML = html;
    }

    // Wykrywa slug bieżącego profilu z URL lub DOM
    function detectCurrentProfileSlug() {
        const path = window.location.pathname.toLowerCase();
        if (path.includes('cezaryrgowski') || path.includes('cezaryrogowski') || path.includes('rogowski')) return 'cezaryrgowski';
        if (path.includes('wiolettarogowska') || path.includes('rogowska')) return 'wiolettarogowska';
        if (path.includes('zbyszekgieron') || path.includes('gieron')) return 'zbyszekgieron';
        if (path.includes('andrzejthiel') || path.includes('thiel')) return 'andrzejthiel';
        if (path.includes('jolawojcik') || path.includes('wojcik')) return 'jolawojcik';
        if (path.includes('magdalena')) return 'magdalena';
        if (path.includes('pawelmurawski') || path.includes('murawski')) return 'pawelmurawski';
        if (path.includes('zofiadudek') || path.includes('dudek')) return 'zofiadudek';
        if (path.includes('ccmen')) return 'ccmen';
        if (path.includes('ccwomen')) return 'ccwomen';
        if (path.includes('cctv')) return 'cctv';
        if (path.includes('radiocc')) return 'radiocc';
        if (path.includes('studiodobregoslowa')) return 'studiodobregoslowa';
        if (path.includes('osobowoscplus')) return 'osobowoscplus';

        const params = new URLSearchParams(window.location.search);
        const user = params.get('user') || params.get('slug') || params.get('profile');
        if (user) return user.toLowerCase();

        return '';
    }

    // Automatyczny montaż widżetu na stronie
    function autoMountFollowedFriends() {
        const currentSlug = detectCurrentProfileSlug();

        // 1. Sprawdź czy istnieje dedykowany slot w HTML
        let slot = document.getElementById('luminaFollowedFriendsSlot') || document.getElementById('followedFriendsCard');

        // 2. Jeśli nie ma dedykowanego slotu, znajdź kartę "Wizytówka" i zamontuj tuż pod nią
        if (!slot) {
            const aside = document.querySelector('aside, .profile-body-grid aside, .sidebar-column-area, .sidebar-col, .left-founder-wing');
            if (!aside) return;

            // Szukaj karty zawierającej "Wizytówka"
            const cards = Array.from(aside.querySelectorAll('.sidebar-card, .side-card, aside > div'));
            const wizytowkaCard = cards.find(card => {
                const txt = card.textContent.toLowerCase();
                return txt.includes('wizytówka') || txt.includes('o mnie') || txt.includes('informacje');
            }) || cards[0];

            if (wizytowkaCard) {
                slot = document.createElement('div');
                slot.id = 'luminaFollowedFriendsSlot';
                slot.className = 'sidebar-card followed-friends-card';
                wizytowkaCard.insertAdjacentElement('afterend', slot);
            } else {
                slot = document.createElement('div');
                slot.id = 'luminaFollowedFriendsSlot';
                slot.className = 'sidebar-card followed-friends-card';
                aside.prepend(slot);
            }
        }

        renderFollowedFriends(slot, currentSlug);
    }

    // Reaktywna aktualizacja przy polubieniu / zaobserwowaniu
    window.addEventListener('storage', function(e) {
        if (e.key && e.key.startsWith('lumina_following_')) {
            autoMountFollowedFriends();
        }
    });

    window.addEventListener('lumina:followChange', function() {
        autoMountFollowedFriends();
    });

    // Inicjalizacja po załadowaniu drzewa DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', autoMountFollowedFriends);
    } else {
        autoMountFollowedFriends();
    }

    // Eksport globalny do natychmiastowego wywołania
    window.mountFollowedFriendsWidget = autoMountFollowedFriends;
    window.refreshFollowedFriendsWidget = autoMountFollowedFriends;

})();
