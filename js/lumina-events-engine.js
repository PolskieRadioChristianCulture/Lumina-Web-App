/**
 * ══════════════════════════════════════════════════════════════════════════
 * LUMINA MISSION EVENTS & LIVE CALENDAR ENGINE (js/lumina-events-engine.js)
 * Kalendarz Wydarzeń Misyjnych, Zapisy i Przypomnienia Push (PWA)
 * 1. 🇵🇱 Ogólnopolski Wieczór Modlitwy „Zjednoczeni za Polskę” (CCTV24 Live)
 * 2. 🕊️ Całodobowe Czuwanie Uwielbienia CCTV24 Instrumental Worship (24/7)
 * 3. 📖 Apokalipsa: Księga Nadziei – Telewizyjny Kurs Biblijny
 * 4. 🌸 Ogólnopolskie Spotkanie Kobiet Wiary CC Women
 * 5. 🛡️ Męski Krąg Modlitwy & Liderów CC Men
 * 6. ☕ Wirtualna Chrześcijańska Kawa Singli LUMINA
 * ══════════════════════════════════════════════════════════════════════════
 */

(function initLuminaEventsEngine() {
    'use strict';

    const LUMINA_EVENTS = [
        {
            id: 'event_zjednoczeni_za_polske',
            title: 'Ogólnopolski Wieczór Modlitwy „Zjednoczeni za Polskę”',
            category: 'modlitwa',
            type: 'live',
            badge: '🔴 Transmisja LIVE & Cała Polska',
            badgeColor: '#ef4444',
            dateStr: 'Każdy Pierwszy Czwartek Miesiąca • 20:00',
            nextDateIso: '2026-09-03T20:00:00',
            durationHours: 2,
            host: 'Cezary Rogowski & Goście',
            hostRole: 'Założyciel Christian Culture',
            image: 'zjednoczeni_za_polske_banner.jpg',
            liveUrl: 'zapolske-live.html',
            desc: 'Stanięcie w wyłomie modlitewnym za Ojczyznę, rodziny, pokój, nawrócenie i duchowe przebudzenie w narodzie. Wspólna modlitwa tysięcy Polaków na żywo.',
            attendeesBase: 840,
            icsDescription: 'Ogólnopolska modlitwa Zjednoczeni za Polskę na żywo w CCTV24. Dołącz: https://polskieradio.cc/zapolske-live.html'
        },
        {
            id: 'event_cctv24_worship',
            title: 'Całodobowe Czuwanie Uwielbienia CCTV24 Instrumental Worship',
            category: 'tv',
            type: 'ongoing',
            badge: '✨ Transmisja 24/7 Na Żywo',
            badgeColor: '#facc15',
            dateStr: 'Codziennie • 24 Godziny na Dobę',
            nextDateIso: '2026-08-31T00:00:00',
            durationHours: 24,
            host: 'Redakcja Muzyczna CCTV24',
            hostRole: 'Kanał Telewizyjny CC',
            image: 'INSTRUMENTAL WORSHIP MUSIC - CHRISTIAN CULTURE.jpg',
            liveUrl: 'cctv24-worship.html',
            desc: 'Filmowe krajobrazy, kojące instrumenty uwielbienia i wersety biblijne napełniające dom Bożym pokojem, odpocznieniem i obecnością Ducha Świętego.',
            attendeesBase: 1250,
            icsDescription: 'Transmisja CCTV24 Instrumental Worship 24/7: https://polskieradio.cc/cctv24-worship.html'
        },
        {
            id: 'event_apokalipsa_kurs',
            title: 'Apokalipsa: Księga Nadziei – Telewizyjny Kurs Biblijny',
            category: 'tv',
            type: 'kurs',
            badge: '📖 Premierowe Pasmo TV',
            badgeColor: '#38bdf8',
            dateStr: 'Każda Środa i Niedziela • 19:00',
            nextDateIso: '2026-09-02T19:00:00',
            durationHours: 1.5,
            host: 'Redakcja Biblijna Christian Culture',
            hostRole: 'Studium Pisma Świętego',
            image: 'tlo_ksiega_nadziei.png',
            liveUrl: 'apokalipsa-ksiega-nadziei-live.html',
            desc: 'Odkrywaj proroctwa i Boże obietnice w budujący, pełen nadziei sposób. Poznaj plan zbawienia i triumf Baranka w przejrzystych wykładach telewizyjnych.',
            attendeesBase: 420,
            icsDescription: 'Kurs Biblijny Apokalipsa: Księga Nadziei. Oglądaj: https://polskieradio.cc/apokalipsa-ksiega-nadziei-live.html'
        },
        {
            id: 'event_cc_women_gathering',
            title: 'Ogólnopolskie Spotkanie Kobiet Wiary CC Women',
            category: 'women',
            type: 'online',
            badge: '🌸 Społeczność CC Women',
            badgeColor: '#f472b6',
            dateStr: 'Druga Sobota Miesiąca • 18:00',
            nextDateIso: '2026-09-12T18:00:00',
            durationHours: 2,
            host: 'Wioletta Rogowska & Liderki',
            hostRole: 'Liderka Społeczności CC',
            image: 'logo_cc_women.jpg',
            liveUrl: 'https://www.youtube.com/@CCWomen7',
            desc: 'Budowanie, wspólna modlitwa i warsztat o Bożej tożsamości kobiety, macierzyństwie, relacjach małżeńskich i prowadzeniu przez Ducha Świętego.',
            attendeesBase: 315,
            icsDescription: 'Spotkanie Kobiet Wiary CC Women. Szczegóły: https://polskieradio.cc/lumina.html'
        },
        {
            id: 'event_cc_men_circle',
            title: 'Męski Krąg Modlitwy & Liderów CC Men',
            category: 'men',
            type: 'online',
            badge: '🛡️ Męska Odpowiedzialność',
            badgeColor: '#0284c7',
            dateStr: 'Trzeci Wtorek Miesiąca • 20:30',
            nextDateIso: '2026-09-15T20:30:00',
            durationHours: 1.5,
            host: 'Cezary Rogowski & Mężczyźni CC',
            hostRole: 'Męska Społeczność Wiary',
            image: 'logo_cc_men.jpg',
            liveUrl: 'lumina.html',
            desc: 'Braterskie spotkanie liderów, mężów i ojców. Rozmowy o odwadze, prawości w biznesie, ochronie rodziny i pokonywaniu duchowych wyzwań.',
            attendeesBase: 260,
            icsDescription: 'Męski Krąg Modlitwy CC Men. Dołącz: https://polskieradio.cc/lumina.html'
        },
        {
            id: 'event_singles_coffee',
            title: 'Wirtualna Chrześcijańska Kawa Singli LUMINA',
            category: 'singles',
            type: 'online',
            badge: '💍 Single z Wartościami',
            badgeColor: '#c084fc',
            dateStr: 'Każda Niedziela • 16:00',
            nextDateIso: '2026-09-06T16:00:00',
            durationHours: 1.5,
            host: 'Zespół Moderatorów LUMINA',
            hostRole: 'Relacje z Szacunkiem',
            image: 'promo_dzj.jpg',
            liveUrl: 'lumina.html',
            desc: 'Swobodna, bezpieczna przestrzeń do poznawania wierzących singli z całej Polski. Budujące rozmowy, wspólne wartości i modlitwa o Boże prowadzenie.',
            attendeesBase: 195,
            icsDescription: 'Chrześcijańska Kawa Singli LUMINA. Dołącz: https://polskieradio.cc/lumina.html'
        }
    ];

    let currentEventFilter = 'all';

    // ── STYLES ──
    function injectEventsStyles() {
        if (document.getElementById('luminaEventsEngineStyles')) return;
        const style = document.createElement('style');
        style.id = 'luminaEventsEngineStyles';
        style.textContent = `
            .event-card-luxury {
                background: linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(11, 19, 43, 0.95));
                border: 1.5px solid rgba(250, 204, 21, 0.25);
                border-radius: 20px;
                padding: 16px;
                display: flex;
                flex-direction: column;
                gap: 12px;
                position: relative;
                overflow: hidden;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
                transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
            }
            .event-card-luxury:hover {
                border-color: rgba(250, 204, 21, 0.55);
                transform: translateY(-2px);
                box-shadow: 0 14px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(250, 204, 21, 0.15);
            }
            .event-btn-action {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
                padding: 8px 14px;
                border-radius: 12px;
                font-size: 0.78rem;
                font-weight: 800;
                font-family: 'Outfit', sans-serif;
                cursor: pointer;
                transition: all 0.2s;
                text-decoration: none;
                white-space: nowrap;
                touch-action: manipulation;
            }
            .event-btn-join {
                background: linear-gradient(135deg, #ec4899, #8b5cf6);
                border: none;
                color: #fff;
                box-shadow: 0 4px 14px rgba(236, 72, 153, 0.35);
            }
            .event-btn-join.joined {
                background: linear-gradient(135deg, #10b981, #059669);
                box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);
            }
            .event-btn-join:hover {
                transform: scale(1.02);
            }
            .event-btn-secondary {
                background: rgba(255, 255, 255, 0.06);
                border: 1px solid rgba(255, 255, 255, 0.15);
                color: #cbd5e1;
            }
            .event-btn-secondary:hover {
                background: rgba(250, 204, 21, 0.12);
                border-color: #facc15;
                color: #fef08a;
            }
            .event-filter-pill {
                padding: 6px 14px;
                border-radius: 20px;
                border: 1px solid rgba(255, 255, 255, 0.12);
                background: rgba(255, 255, 255, 0.04);
                color: #94a3b8;
                font-size: 0.76rem;
                font-weight: 700;
                font-family: 'Outfit', sans-serif;
                cursor: pointer;
                white-space: nowrap;
                transition: all 0.2s;
            }
            .event-filter-pill.active {
                background: linear-gradient(135deg, #ec4899, #8b5cf6);
                border-color: transparent;
                color: #fff;
                box-shadow: 0 2px 10px rgba(236, 72, 153, 0.4);
            }
        `;
        document.head.appendChild(style);
    }

    // ── ATTENDEES STATE STORAGE ──
    function getJoinedEvents() {
        try {
            const raw = localStorage.getItem('lumina_joined_events');
            return raw ? JSON.parse(raw) : [];
        } catch(e) {
            return [];
        }
    }

    function toggleJoinEvent(eventId) {
        let list = getJoinedEvents();
        const isJoined = list.includes(eventId);
        if (isJoined) {
            list = list.filter(id => id !== eventId);
        } else {
            list.push(eventId);
        }
        try {
            localStorage.setItem('lumina_joined_events', JSON.stringify(list));
        } catch(e) {}

        // Opcjonalny zapis w Firestore
        if (window.LuminaDB?.getCurrentUser() && window.LuminaDB?.db) {
            try {
                const user = window.LuminaDB.getCurrentUser();
                const ref = window.LuminaDB.doc(window.LuminaDB.db, 'lumina_event_attendees', `${eventId}_${user.uid}`);
                if (!isJoined) {
                    window.LuminaDB.setDoc(ref, {
                        eventId: eventId,
                        userId: user.uid,
                        userName: user.displayName || 'Użytkownik LUMINA',
                        joinedAt: window.LuminaDB.serverTimestamp()
                    }, { merge: true });
                } else {
                    window.LuminaDB.deleteDoc(ref);
                }
            } catch(e) {}
        }

        renderEventsModalBody();
        if (typeof window.showToast === 'function') {
            window.showToast(isJoined ? 'Zrezygnowano z udziału w wydarzeniu' : '✨ Zapisano na wydarzenie! Pamiętamy o Tobie');
        }
    }
    window.toggleJoinEvent = toggleJoinEvent;

    // ── ICS CALENDAR DOWNLOAD GENERATOR ──
    function downloadIcsCalendar(eventId) {
        const ev = LUMINA_EVENTS.find(e => e.id === eventId);
        if (!ev) return;

        const startDate = new Date(ev.nextDateIso);
        const endDate = new Date(startDate.getTime() + (ev.durationHours || 2) * 3600000);

        const formatIcsDate = (d) => {
            return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        };

        const icsContent = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//Christian Culture//LUMINA Events//PL',
            'CALSCALE:GREGORIAN',
            'METHOD:PUBLISH',
            'BEGIN:VEVENT',
            `UID:${ev.id}_${Date.now()}@polskieradio.cc`,
            `DTSTAMP:${formatIcsDate(new Date())}`,
            `DTSTART:${formatIcsDate(startDate)}`,
            `DTEND:${formatIcsDate(endDate)}`,
            `SUMMARY:${ev.title}`,
            `DESCRIPTION:${ev.icsDescription || ev.desc}`,
            `LOCATION:${ev.liveUrl || 'Polskie Radio Christian Culture & CCTV24'}`,
            'STATUS:CONFIRMED',
            'BEGIN:VALARM',
            'TRIGGER:-PT1H',
            'DESCRIPTION:Przypomnienie o wydarzeniu Christian Culture',
            'ACTION:DISPLAY',
            'END:VALARM',
            'END:VEVENT',
            'END:VCALENDAR'
        ].join('\r\n');

        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.setAttribute('download', `${ev.id}.ics`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        if (typeof window.showToast === 'function') {
            window.showToast('📅 Pobrano wpis kalendarza z przypomnieniem 1h przed startem!');
        }
    }
    window.downloadIcsCalendar = downloadIcsCalendar;

    // ── PUSH REMINDER REQUEST ──
    window.requestEventPushReminder = async function(eventId) {
        const ev = LUMINA_EVENTS.find(e => e.id === eventId);
        if (!ev) return;

        if (typeof window.requestPushPermission === 'function') {
            await window.requestPushPermission();
        } else if ('Notification' in window && Notification.permission !== 'granted') {
            await Notification.requestPermission();
        }

        downloadIcsCalendar(eventId);
        if (typeof window.showToast === 'function') {
            window.showToast(`🔔 Ustawiono powiadomienie Push dla: ${ev.title.slice(0, 30)}...`);
        }
    };

    // ── RENDER EVENTS MODAL BODY ──
    function renderEventsModalBody() {
        const bodyEl = document.getElementById('luminaEventsModalBody');
        if (!bodyEl) return;

        const joinedList = getJoinedEvents();

        let filtered = LUMINA_EVENTS;
        if (currentEventFilter === 'live') {
            filtered = LUMINA_EVENTS.filter(e => e.type === 'live' || e.type === 'ongoing');
        } else if (currentEventFilter === 'tv') {
            filtered = LUMINA_EVENTS.filter(e => e.category === 'tv' || e.category === 'modlitwa');
        } else if (currentEventFilter === 'community') {
            filtered = LUMINA_EVENTS.filter(e => e.category === 'women' || e.category === 'men' || e.category === 'singles');
        }

        bodyEl.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 14px;">
                ${filtered.map(ev => {
                    const isJoined = joinedList.includes(ev.id);
                    const attendeesCount = ev.attendeesBase + (isJoined ? 1 : 0);
                    return `
                        <div class="event-card-luxury">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px;">
                                <div style="display: flex; align-items: center; gap: 10px; min-width: 0;">
                                    <img src="${ev.image}" alt="${ev.title}" style="width: 50px; height: 50px; border-radius: 14px; object-fit: cover; border: 1.5px solid rgba(250,204,21,0.4); flex-shrink: 0;" onerror="this.src='lumina_icon.jpg'">
                                    <div style="min-width: 0;">
                                        <div style="font-size: 0.68rem; font-weight: 800; color: ${ev.badgeColor}; letter-spacing: 0.4px; text-transform: uppercase;">
                                            ${ev.badge}
                                        </div>
                                        <h4 style="font-size: 1rem; font-weight: 800; color: #fff; font-family: 'Outfit', sans-serif; margin: 2px 0 3px; line-height: 1.3;">
                                            ${ev.title}
                                        </h4>
                                        <div style="font-size: 0.74rem; color: #facc15; font-weight: 700;">
                                            <i class="fa-regular fa-clock"></i> ${ev.dateStr}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <p style="font-size: 0.80rem; color: #cbd5e1; line-height: 1.45; margin: 0;">
                                ${ev.desc}
                            </p>

                            <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap; padding-top: 4px; border-top: 1px solid rgba(255,255,255,0.06);">
                                <div style="font-size: 0.72rem; color: #94a3b8; font-weight: 600;">
                                    <i class="fa-solid fa-users" style="color: #38bdf8;"></i> <b style="color: #fff;">${attendeesCount}</b> osób bierze udział
                                </div>
                                <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                                    <button type="button" class="event-btn-action event-btn-join ${isJoined ? 'joined' : ''}" onclick="window.toggleJoinEvent('${ev.id}')">
                                        ${isJoined ? '<i class="fa-solid fa-check"></i> Biorę udział' : '<i class="fa-solid fa-plus"></i> Dołączam'}
                                    </button>
                                    <button type="button" class="event-btn-action event-btn-secondary" onclick="window.requestEventPushReminder('${ev.id}')" title="Ustaw przypomnienie Push & Kalendarz">
                                        <i class="fa-regular fa-bell"></i> Przypomnij
                                    </button>
                                    ${ev.liveUrl ? `
                                        <a href="${ev.liveUrl}" class="event-btn-action event-btn-secondary" style="background: rgba(239,68,68,0.18); border-color: rgba(239,68,68,0.4); color: #fca5a5;">
                                            <i class="fa-solid fa-play"></i> Transmisja
                                        </a>
                                    ` : ''}
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    // ── OPEN EVENTS MODAL ──
    window.openLuminaEventsModal = function() {
        injectEventsStyles();
        let modal = document.getElementById('luminaEventsModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'luminaEventsModal';
            modal.className = 'modal-overlay';
            modal.style.cssText = 'display: flex; align-items: center; justify-content: center; position: fixed; inset: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(12px); z-index: 999999; padding: 16px; opacity: 0; pointer-events: none; transition: opacity 0.25s ease;';
            
            modal.innerHTML = `
                <div class="modal-card" style="max-width: 680px; width: 100%; max-height: 90vh; background: #070e24; border: 1.5px solid rgba(250,204,21,0.4); border-radius: 24px; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 24px 60px rgba(0,0,0,0.85);">
                    <!-- Header -->
                    <div style="display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.02);">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <span style="width: 40px; height: 40px; border-radius: 12px; background: linear-gradient(135deg, #facc15, #f59e0b); display: flex; align-items: center; justify-content: center; color: #000; font-size: 1.2rem;">
                                <i class="fa-regular fa-calendar-check"></i>
                            </span>
                            <div>
                                <h3 style="font-size: 1.1rem; font-weight: 800; color: #fff; font-family: 'Outfit', sans-serif; margin: 0;">
                                    Wydarzenia Misyjne & Transmisje Live ✨
                                </h3>
                                <div style="font-size: 0.72rem; color: #94a3b8;">
                                    Bądź na bieżąco ze wspólnymi modlitwami, czuwaniami i spotkaniami
                                </div>
                            </div>
                        </div>
                        <button onclick="window.closeLuminaEventsModal()" style="background: rgba(255,255,255,0.08); border: none; color: #fff; width: 44px; height: 44px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; touch-action: manipulation;"><i class="fa-solid fa-xmark"></i></button>
                    </div>

                    <!-- Filter Bar -->
                    <div style="display: flex; gap: 8px; padding: 10px 20px; background: rgba(255,255,255,0.02); border-bottom: 1px solid rgba(255,255,255,0.05); overflow-x: auto; scrollbar-width: none;">
                        <button type="button" class="event-filter-pill active" onclick="window.setEventFilter('all', this)">Wszystkie (6)</button>
                        <button type="button" class="event-filter-pill" onclick="window.setEventFilter('live', this)">🔴 Na Żywo & Najbliższe</button>
                        <button type="button" class="event-filter-pill" onclick="window.setEventFilter('tv', this)">📺 Pasma CCTV24</button>
                        <button type="button" class="event-filter-pill" onclick="window.setEventFilter('community', this)">👥 Społeczność CC</button>
                    </div>

                    <!-- Body -->
                    <div id="luminaEventsModalBody" style="padding: 16px 20px; overflow-y: auto; flex: 1;"></div>
                </div>
            `;
            document.body.appendChild(modal);
        }

        renderEventsModalBody();
        modal.style.opacity = '1';
        modal.style.pointerEvents = 'auto';
    };

    window.closeLuminaEventsModal = function() {
        const modal = document.getElementById('luminaEventsModal');
        if (modal) {
            modal.style.opacity = '0';
            modal.style.pointerEvents = 'none';
        }
    };

    window.setEventFilter = function(filter, btnEl) {
        currentEventFilter = filter;
        document.querySelectorAll('.event-filter-pill').forEach(b => b.classList.remove('active'));
        if (btnEl) btnEl.classList.add('active');
        renderEventsModalBody();
    };

    // ── INJECT BUTTON INTO BOTTOM NAV POPUP MENU ──
    function injectEventsButtonIntoNavMenu() {
        const popupGrid = document.querySelector('.lumina-bottom-menu-grid');
        if (popupGrid && !document.getElementById('menuBtnEventsNav')) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.id = 'menuBtnEventsNav';
            btn.className = 'lumina-menu-btn';
            btn.onclick = (e) => {
                if (typeof window.toggleCcBottomNavMenu === 'function') window.toggleCcBottomNavMenu(e);
                window.openLuminaEventsModal();
            };
            btn.title = 'Kalendarz Wydarzeń Misyjnych & Zapisy';
            btn.innerHTML = `
                <div class="lumina-menu-btn-icon" style="background: linear-gradient(135deg, rgba(250,204,21,0.25), rgba(234,179,8,0.25)); border: 1px solid rgba(250,204,21,0.5); color: #facc15;">
                    <i class="fa-regular fa-calendar-check"></i>
                </div>
                <div class="lumina-menu-btn-content">
                    <div class="lumina-menu-btn-title">Wydarzenia & Zapisy ✨</div>
                    <div class="lumina-menu-btn-sub">Modlitwy Live, Czuwania & Zjazdy</div>
                </div>
            `;
            
            const profileBtn = popupGrid.querySelector('.profile-icon-bg')?.closest('.lumina-menu-btn');
            if (profileBtn) {
                popupGrid.insertBefore(btn, profileBtn);
            } else {
                popupGrid.appendChild(btn);
            }
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(injectEventsButtonIntoNavMenu, 600);
        });
    } else {
        setTimeout(injectEventsButtonIntoNavMenu, 600);
    }
})();
