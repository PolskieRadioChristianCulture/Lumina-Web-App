/**
 * ══════════════════════════════════════════════════════════════════════════
 * LUMINA SMART CHAT BLESSINGS & SCRIPTURE ENGINE (lumina-smart-blessings.js)
 * Inteligentne Podpowiedzi, Błogosławieństwa i Wersety Biblijne Czasu Rzeczywistego
 * Dopasowane automatycznie do pory dnia i nocy (Poranek / Dzień / Wieczór / Noc)
 * ══════════════════════════════════════════════════════════════════════════
 */
(function initLuminaSmartBlessings() {
    'use strict';

    const TIME_DATA = {
        morning: {
            id: 'morning',
            label: '🌅 Poranek',
            timeRange: '06:00 – 11:59',
            badgeBg: 'rgba(251, 191, 36, 0.18)',
            badgeBorder: 'rgba(251, 191, 36, 0.55)',
            badgeColor: '#fbbf24',
            items: [
                {
                    chip: '☀️ Dzień dobry!',
                    text: 'Dzień dobry! Życzę pięknego, błogosławionego dnia w Bożej obecności! ☀️✨',
                    type: 'greeting'
                },
                {
                    chip: '✨ Błogosławionego poranka!',
                    text: 'Błogosławionego, pełnego pokoju i Bożej radości poranka w Panu! ✨🕊️',
                    type: 'blessing'
                },
                {
                    chip: '📖 Lm 3, 22-23 (Werset)',
                    text: '„Dzięki łasce Pana nie zginęliśmy, albowiem nie wyczerpała się Jego litość. Odnawia się każdego poranka; wielka jest wierność Twoja!” (Lm 3, 22-23) 🕊️✨',
                    type: 'scripture'
                },
                {
                    chip: '📖 Ps 143, 8 (Werset)',
                    text: '„Spraw, bym o świcie usłyszał o Twej łasce, bo w Tobie pokładam nadzieję.” (Ps 143, 8) ☀️🙏',
                    type: 'scripture'
                },
                {
                    chip: '☕ Poranna kawa?',
                    text: 'Masz ochotę na poranną chrześcijańską kawę i chwilę budującej rozmowy? ☕',
                    type: 'invite'
                },
                {
                    chip: '🙏 Modlitwa na dziś',
                    text: 'Chętnie pomodlę się dziś w Twojej intencji! O co mogę prosić dla Ciebie Pana? 🙏',
                    type: 'prayer'
                },
                {
                    chip: '🕊️ Prowadzenie Ducha',
                    text: 'Niech Duch Święty prowadzi Cię, chroni i napełnia pokojem przez cały ten dzień! 🕊️',
                    type: 'blessing'
                }
            ]
        },
        afternoon: {
            id: 'afternoon',
            label: '☀️ Dzień & Popołudnie',
            timeRange: '12:00 – 17:59',
            badgeBg: 'rgba(56, 189, 248, 0.18)',
            badgeBorder: 'rgba(56, 189, 248, 0.55)',
            badgeColor: '#38bdf8',
            items: [
                {
                    chip: '🌿 Dobrego popołudnia!',
                    text: 'Dobrego, spokojnego i owocnego popołudnia w Bożej łasce! 🌿✨',
                    type: 'greeting'
                },
                {
                    chip: '📖 Flp 4, 13 (Werset)',
                    text: '„Wszystko mogę w Tym, który mnie umacnia.” (Flp 4, 13) ✝️💪',
                    type: 'scripture'
                },
                {
                    chip: '📖 Ps 37, 5 (Werset)',
                    text: '„Powierz Panu swoją drogę i zaufaj Mu, a On sam będzie działał.” (Ps 37, 5) 🌿✨',
                    type: 'scripture'
                },
                {
                    chip: '✨ Błogosławieństwa w pracy!',
                    text: 'Niech Pan błogosławi Twojej pracy, spotkaniom i wszystkim Twoim działaniom! ✨',
                    type: 'blessing'
                },
                {
                    chip: '☕ Chrześcijańska kawa?',
                    text: 'Masz ochotę na popołudniową kawę i dobrą, wartościową rozmowę? ☕',
                    type: 'invite'
                },
                {
                    chip: '🙏 Pamiętam w modlitwie',
                    text: 'Pamiętam o Tobie w modlitwie w ciągu dnia! Niech Pan Cię umacnia i daje siły 🙏',
                    type: 'prayer'
                },
                {
                    chip: '🕊️ Pokój Chrystusa',
                    text: 'Pokój Chrystusa niech zawsze panuje w Twoim sercu i Twoim domu! 🕊️',
                    type: 'blessing'
                }
            ]
        },
        evening: {
            id: 'evening',
            label: '🌆 Wieczór',
            timeRange: '18:00 – 21:59',
            badgeBg: 'rgba(236, 72, 153, 0.18)',
            badgeBorder: 'rgba(236, 72, 153, 0.55)',
            badgeColor: '#f472b6',
            items: [
                {
                    chip: '🕯️ Błogosławionego wieczoru!',
                    text: 'Błogosławionego i pełnego ciepła wieczoru w Bożej miłości! 🕯️🕊️',
                    type: 'greeting'
                },
                {
                    chip: '📖 J 14, 27 (Werset)',
                    text: '„Pokój zostawiam wam, pokój mój daję wam. Nie tak jak daje świat, Ja wam daję. Niech się nie trwoży serce wasze.” (J 14, 27) 🕊️✨',
                    type: 'scripture'
                },
                {
                    chip: '📖 Mt 11, 28 (Werset)',
                    text: '„Przyjdźcie do Mnie wszyscy, którzy utrudzeni i obciążeni jesteście, a Ja wam dam ukojenie.” (Mt 11, 28) 🕯️🙏',
                    type: 'scripture'
                },
                {
                    chip: '✨ Spokojnego odpoczynku',
                    text: 'Życzę Ci spokojnego i głębokiego odpoczynku po całym dniu pod Bożą opieką ✨',
                    type: 'blessing'
                },
                {
                    chip: '🙏 Wieczorna modlitwa',
                    text: 'Łączę się w wieczornej modlitwie i dziękczynieniu Bogu za ten dzień! 🙏',
                    type: 'prayer'
                },
                {
                    chip: '☕ Ciepła herbata & rozmowa?',
                    text: 'Masz ochotę na wieczorną herbatę i chwilę głębszej, serdecznej rozmowy? ☕📖',
                    type: 'invite'
                },
                {
                    chip: '🕊️ Dziękuję za dziś',
                    text: 'Dziękuję Bogu za ten dzień i naszą budującą relację w społeczności LUMINA ✨',
                    type: 'greeting'
                }
            ]
        },
        night: {
            id: 'night',
            label: '🌙 Noc & Czuwanie',
            timeRange: '22:00 – 05:59',
            badgeBg: 'rgba(168, 85, 247, 0.22)',
            badgeBorder: 'rgba(168, 85, 247, 0.65)',
            badgeColor: '#c084fc',
            items: [
                {
                    chip: '🌙 Spokojnej nocy!',
                    text: 'Spokojnej, anielskiej nocy i głębokiego odpoczynku pod Bożą opieką! 🌙✨',
                    type: 'greeting'
                },
                {
                    chip: '📖 Ps 91, 1-2 (Werset)',
                    text: '„Kto przebywa w pieczy Najwyższego, w cieniu Wszechmocnego spoczywa. Mówię do Pana: Ucieczko moja i twierdzo, Boże mój, któremu ufam!” (Ps 91, 1-2) 🕊️✝️',
                    type: 'scripture'
                },
                {
                    chip: '📖 Ps 4, 9 (Werset)',
                    text: '„Spokojnie się kładę i zasypiam, bo tylko Ty, Panie, dajesz mi bezpieczne mieszkanie.” (Ps 4, 9) 🌙🙏',
                    type: 'scripture'
                },
                {
                    chip: '📖 Ps 121, 3-4 (Werset)',
                    text: '„Nie zdrzemnie się ani nie zaśnie Ten, który czuwa nad Tobą.” (Ps 121, 3-4) 🕊️✨',
                    type: 'scripture'
                },
                {
                    chip: '✨ Niech Bóg strzeże snu',
                    text: 'Niech Pan strzeże Twojego spoczynku i odnawia Twoje siły na nowy dzień! 🕊️',
                    type: 'blessing'
                },
                {
                    chip: '🙏 Nocne czuwanie',
                    text: 'Łączę się w cichej modlitwie i nocnym czuwaniu. Pokój Boży niech będzie z Tobą! 🙏',
                    type: 'prayer'
                },
                {
                    chip: '🕊️ Do jutra w Panu',
                    text: 'Dobrej nocy z Bożym błogosławieństwem! Do usłyszenia rano ✨',
                    type: 'greeting'
                }
            ]
        }
    };

    function getCurrentTimeCategory() {
        const hour = new Date().getHours();
        if (hour >= 6 && hour < 12) return TIME_DATA.morning;
        if (hour >= 12 && hour < 18) return TIME_DATA.afternoon;
        if (hour >= 18 && hour < 22) return TIME_DATA.evening;
        return TIME_DATA.night;
    }

    // Wstrzyknięcie Luksusowych Stylów Paska Podpowiedzi
    function injectStyles() {
        if (document.getElementById('luminaSmartBlessingsStyles')) return;
        const styleEl = document.createElement('style');
        styleEl.id = 'luminaSmartBlessingsStyles';
        styleEl.textContent = `
            .lumina-smart-bar-container {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 6px 12px;
                background: rgba(11, 18, 38, 0.65);
                backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8px);
                border-top: 1px solid rgba(255, 255, 255, 0.06);
                border-bottom: 1px solid rgba(255, 255, 255, 0.04);
                overflow-x: auto;
                -webkit-overflow-scrolling: touch;
                scrollbar-width: none;
            }
            .lumina-smart-bar-container::-webkit-scrollbar {
                display: none;
            }
            .smart-time-badge {
                display: inline-flex;
                align-items: center;
                gap: 4px;
                padding: 3px 8px;
                border-radius: 12px;
                font-size: 0.68rem;
                font-weight: 800;
                font-family: 'Outfit', sans-serif;
                white-space: nowrap;
                flex-shrink: 0;
                letter-spacing: 0.3px;
            }
            .smart-chip-btn {
                display: inline-flex;
                align-items: center;
                gap: 5px;
                padding: 4px 10px;
                border-radius: 14px;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.12);
                color: #cbd5e1;
                font-size: 0.72rem;
                font-weight: 600;
                font-family: 'Plus Jakarta Sans', sans-serif;
                cursor: pointer;
                white-space: nowrap;
                flex-shrink: 0;
                transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
                -webkit-tap-highlight-color: transparent;
            }
            .smart-chip-btn:hover {
                background: rgba(255, 255, 255, 0.12);
                border-color: #facc15;
                color: #fff;
                transform: translateY(-1px);
            }
            .smart-chip-btn:active {
                transform: scale(0.93);
            }
            .smart-chip-btn.scripture-chip {
                background: linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(139, 92, 246, 0.15));
                border-color: rgba(250, 204, 21, 0.45);
                color: #fef08a;
                font-weight: 700;
            }
            .smart-chip-btn.scripture-chip:hover {
                background: linear-gradient(135deg, rgba(236, 72, 153, 0.28), rgba(139, 92, 246, 0.28));
                border-color: #facc15;
                box-shadow: 0 0 10px rgba(250, 204, 21, 0.3);
            }
            .smart-cycle-btn {
                background: transparent;
                border: 1px dashed rgba(255, 255, 255, 0.2);
                color: #94a3b8;
                border-radius: 12px;
                padding: 4px 8px;
                font-size: 0.68rem;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                gap: 4px;
                flex-shrink: 0;
                transition: all 0.2s;
            }
            .smart-cycle-btn:hover {
                color: #facc15;
                border-color: #facc15;
            }
            .smart-action-btn {
                display: inline-flex;
                align-items: center;
                gap: 5px;
                padding: 4px 10px;
                border-radius: 14px;
                font-size: 0.72rem;
                font-weight: 800;
                font-family: 'Outfit', sans-serif;
                cursor: pointer;
                white-space: nowrap;
                flex-shrink: 0;
                transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                -webkit-tap-highlight-color: transparent;
            }
            .smart-action-btn.scripture-vault-btn {
                background: linear-gradient(135deg, rgba(234, 179, 8, 0.25), rgba(245, 158, 11, 0.25));
                border: 1px solid rgba(250, 204, 21, 0.6);
                color: #fef08a;
            }
            .smart-action-btn.scripture-vault-btn:hover {
                background: linear-gradient(135deg, rgba(234, 179, 8, 0.4), rgba(245, 158, 11, 0.4));
                border-color: #facc15;
                box-shadow: 0 0 12px rgba(250, 204, 21, 0.4);
                transform: translateY(-1px);
            }
            .smart-action-btn.icebreakers-btn {
                background: linear-gradient(135deg, rgba(168, 85, 247, 0.25), rgba(236, 72, 153, 0.25));
                border: 1px solid rgba(216, 180, 254, 0.6);
                color: #f5d0fe;
            }
            .smart-action-btn.icebreakers-btn:hover {
                background: linear-gradient(135deg, rgba(168, 85, 247, 0.4), rgba(236, 72, 153, 0.4));
                border-color: #f472b6;
                box-shadow: 0 0 12px rgba(236, 72, 153, 0.4);
                transform: translateY(-1px);
            }
            @keyframes pulseUnreadRoom {
                0%, 100% {
                    border-color: #ef4444;
                    box-shadow: 0 0 14px rgba(239, 68, 68, 0.45);
                }
                50% {
                    border-color: #facc15;
                    box-shadow: 0 0 22px rgba(250, 204, 21, 0.7);
                }
            }
            @keyframes pulseBadge {
                0%, 100% {
                    transform: scale(1);
                }
                50% {
                    transform: scale(1.1);
                    filter: drop-shadow(0 0 6px #ef4444);
                }
            }
        `;
        document.head.appendChild(styleEl);
    }

    // ── BAZA WERSETÓW TEMATYCZNYCH DLA CZATU ──
    const SCRIPTURE_VAULT = [
        {
            category: '🌟 Błogosławieństwo & Pokój',
            items: [
                { ref: 'Lb 6, 24-26', text: '„Niech cię Pan błogosławi i strzeże. Niech Pan rozjaśni oblicze swoje nad tobą i niech ci będzie miłościwy. Niech Pan zwróci ku tobie swoje oblicze i obdarzy cię pokojem.” (Lb 6, 24-26) 🕊️✨' },
                { ref: 'J 14, 27', text: '„Pokój zostawiam wam, pokój mój daję wam. Nie tak jak daje świat, Ja wam daję. Niech się nie trwoży serce wasze ani się nie lęka.” (J 14, 27) 🕊️' },
                { ref: 'Ps 121, 1-2', text: '„Wznoszę swe oczy ku górom: Skądże nadejdzie mi pomoc? Pomoc moja jest od Pana, który stworzył niebo i ziemię.” (Ps 121, 1-2) ⛰️✨' },
                { ref: 'Ps 29, 11', text: '„Pan da siłę swojemu ludowi, Pan pobłogosławi swój lud pokojem.” (Ps 29, 11) 🙏' }
            ]
        },
        {
            category: '🛡️ Odwaga & Zwycięstwo',
            items: [
                { ref: 'Joz 1, 9', text: '„Czyż ci nie rozkazałem: Bądź mężny i mocny? Nie bój się i nie lękaj, bo z tobą jest Pan, Bóg twój, wszędzie, gdziekolwiek pójdziesz.” (Joz 1, 9) 🛡️⚔️' },
                { ref: 'Iz 41, 10', text: '„Nie bój się, bo Ja jestem z tobą; nie lękaj się, bo Ja jestem twoim Bogiem. Umocnię cię, a także wspomogę, podtrzymam cię prawicą swej sprawiedliwości.” (Iz 41, 10) ✝️' },
                { ref: 'Flp 4, 13', text: '„Wszystko mogę w Tym, który mnie umacnia — w Chrystusie.” (Flp 4, 13) 💪✨' },
                { ref: '2 Tm 1, 7', text: '„Albowiem nie dał nam Bóg ducha bojaźni, ale mocy, miłości i trzeźwego myślenia.” (2 Tm 1, 7) 🔥' }
            ]
        },
        {
            category: '❤️ Miłość & Relacje',
            items: [
                { ref: '1 Kor 13, 4.7', text: '„Miłość cierpliwa jest, łaskawa jest. Wszystko znosi, wszystkiemu wierzy, we wszystkim pokłada nadzieję, wszystko przetrzyma.” (1 Kor 13, 4.7) ❤️🕊️' },
                { ref: 'Kol 3, 14', text: '„Na to zaś wszystko przyobleczcie miłość, która jest spoiwem doskonałości.” (Kol 3, 14) 💍✨' },
                { ref: '1 J 4, 19', text: '„My miłujemy, ponieważ On pierwszy nas umiłował.” (1 J 4, 19) ❤️' },
                { ref: 'Prz 17, 17', text: '„Przyjaciel kocha w każdym czasie, a bratem staje się w nieszczęściu.” (Prz 17, 17) 🤝' }
            ]
        },
        {
            category: '🕊️ Pocieszenie & Nadzieja',
            items: [
                { ref: 'Rz 8, 28', text: '„Wiemy też, że Bóg z tymi, którzy Go miłują, współdziała we wszystkim dla ich dobra.” (Rz 8, 28) ✨' },
                { ref: 'Jr 29, 11', text: '„Jestem bowiem świadomy zamiarów, jakie mam wobec was — wyrocznia Pana — zamiarów pokoju, a nie nieszczęścia, aby zapewnić wam przyszłość i nadzieję.” (Jr 29, 11) 🕊️' },
                { ref: 'Ps 23, 1-3', text: '„Pan jest moim pasterzem, nie brak mi niczego. Pozwala mi leżeć na zielonych pastwiskach. Prowadzi mnie nad wody, gdzie mogę odpocząć: orzeźwia moją duszę.” (Ps 23, 1-3) 🌿' },
                { ref: 'Mt 11, 28', text: '„Przyjdźcie do Mnie wszyscy, którzy utrudzeni i obciążeni jesteście, a Ja wam dam ukojenie.” (Mt 11, 28) 🕯️' }
            ]
        },
        {
            category: '🧭 Mądrość & Kierunek',
            items: [
                { ref: 'Prz 3, 5-6', text: '„Zaufaj Panu z całego swojego serca, a nie polegaj na własnym rozumie. Pamiętaj o Nim na wszystkich swoich drogach, a On prostować będzie twoje ścieżki.” (Prz 3, 5-6) 🧭✨' },
                { ref: 'Ps 119, 105', text: '„Twoje Słowo jest lampą dla moich stóp i światłem na mojej ścieżce.” (Ps 119, 105) 💡📖' },
                { ref: 'Jk 1, 5', text: '„Jeśli zaś komuś z was brakuje mądrości, niech prosi o nią Boga, który daje wszystkim chętnie i bez wypominania, a będzie mu dana.” (Jk 1, 5) 🙏' }
            ]
        }
    ];

    // ── BAZA PYTAŃ PRZEŁAMUJĄCYCH LODY (ICEBREAKERS) ──
    const ICEBREAKERS = [
        {
            category: '📖 Słowo Boże & Wiara',
            questions: [
                'Jaki fragment Pisma Świętego jest Twoim ulubionym wersetem życia i dlaczego? 📖✨',
                'Co w ostatnim czasie najbardziej poruszyło Twoje serce podczas osobistej modlitwy lub czytania Słowa? 🕊️',
                'Jaka pieśń lub utwór uwielbienia towarzyszy Ci najczęściej w tym tygodniu? 🎵🙏'
            ]
        },
        {
            category: '✨ Doświadczenie Bożej Łaski',
            questions: [
                'W jakich codziennych momentach najmocniej odczuwasz Bożą obecność i pokój serca? 🌿',
                'Jakie Boże dzieło lub świadectwo w Twoim życiu dało Ci największą siłę i nadzieję? ✨',
                'O co dobrego mogę się dziś w wolnej chwili pomodlić w Twojej intencji? 🙏'
            ]
        },
        {
            category: '🌸 Społeczność, Pasje & Wartości',
            questions: [
                'W jaki sposób najchętniej spędzasz wolny czas — spacery na łonie natury, dobra książka czy muzyka? ☀️',
                'Do jakiej wspólnoty lub kościoła należysz i czym się w nim zajmujesz? ⛪',
                'Co najbardziej cenisz w relacjach z ludźmi, którzy dzielą te same chrześcijańskie wartości? 🤝❤️'
            ]
        }
    ];

    // Wstawienie tekstu do wskazanego pola input
    window.insertChatSmartBlessing = function(targetInputId, text) {
        let input = document.getElementById(targetInputId);
        if (!input) {
            input = document.getElementById('activeChatInput') || 
                    document.getElementById('publicChatInput') ||
                    document.querySelector('.lumina-chat-input-premium') ||
                    document.querySelector('.chat-input-bar input');
        }
        if (!input) return;

        input.value = text;
        input.focus();

        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));

        // Zamknij modale jeśli były otwarte
        window.closeLuminaScripturePicker();
        window.closeLuminaIcebreakersPicker();

        if (typeof window.showToast === 'function') {
            window.showToast('✨ Wstawiono treść do wiadomości');
        }
    };

    // ── MODAL BIBLIOTEKI WERSETÓW ──
    window.openLuminaScripturePicker = function(targetInputId) {
        let modal = document.getElementById('luminaScriptureVaultModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'luminaScriptureVaultModal';
            modal.style.cssText = 'position:fixed; inset:0; background:rgba(0,0,0,0.85); backdrop-filter:blur(10px); z-index:999999; display:flex; align-items:center; justify-content:center; padding:16px; opacity:0; pointer-events:none; transition:opacity 0.25s ease;';
            document.body.appendChild(modal);
        }

        let bodyHtml = SCRIPTURE_VAULT.map(cat => `
            <div style="margin-bottom:18px;">
                <div style="font-size:0.85rem; font-weight:800; color:#facc15; font-family:'Outfit',sans-serif; margin-bottom:8px; display:flex; align-items:center; gap:6px;">
                    ${cat.category}
                </div>
                <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(280px, 1fr)); gap:8px;">
                    ${cat.items.map(it => {
                        const escaped = it.text.replace(/'/g, "\\'").replace(/"/g, '&quot;');
                        return `
                            <div onclick="window.insertChatSmartBlessing('${targetInputId}', '${escaped}')" 
                                 style="background:rgba(255,255,255,0.04); border:1px solid rgba(250,204,21,0.25); border-radius:12px; padding:10px 12px; cursor:pointer; transition:all 0.2s;"
                                 onmouseover="this.style.background='rgba(250,204,21,0.12)'; this.style.borderColor='#facc15'; this.style.transform='translateY(-1px)';"
                                 onmouseout="this.style.background='rgba(255,255,255,0.04)'; this.style.borderColor='rgba(250,204,21,0.25)'; this.style.transform='none';">
                                <div style="font-size:0.75rem; font-weight:800; color:#fef08a; margin-bottom:3px;"><i class="fa-solid fa-book-bible"></i> ${it.ref}</div>
                                <div style="font-size:0.78rem; color:#cbd5e1; line-height:1.4;">${it.text}</div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `).join('');

        modal.innerHTML = `
            <div style="background:#0b1329; border:1.5px solid rgba(250,204,21,0.4); border-radius:20px; max-width:640px; width:100%; max-height:85vh; display:flex; flex-direction:column; box-shadow:0 20px 50px rgba(0,0,0,0.8); overflow:hidden;">
                <div style="display:flex; align-items:center; justify-content:space-between; padding:16px 20px; border-bottom:1px solid rgba(255,255,255,0.08); background:rgba(255,255,255,0.02);">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <span style="width:36px; height:36px; border-radius:10px; background:linear-gradient(135deg, #eab308, #ca8a04); display:flex; align-items:center; justify-content:center; color:#000; font-size:1.1rem;"><i class="fa-solid fa-book-bible"></i></span>
                        <div>
                            <div style="font-weight:800; font-size:1rem; color:#fff; font-family:'Outfit',sans-serif;">Biblioteka Słowa Bożego ✨</div>
                            <div style="font-size:0.72rem; color:#94a3b8;">Kliknij werset, aby wstawić go bezpośrednio do rozmowy</div>
                        </div>
                    </div>
                    <button onclick="window.closeLuminaScripturePicker()" style="background:rgba(255,255,255,0.08); border:none; color:#fff; width:44px; height:44px; border-radius:50%; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:1.1rem; touch-action:manipulation;"><i class="fa-solid fa-xmark"></i></button>
                </div>
                <div style="padding:16px 20px; overflow-y:auto; flex:1;">
                    ${bodyHtml}
                </div>
            </div>
        `;

        modal.style.opacity = '1';
        modal.style.pointerEvents = 'auto';
    };

    window.closeLuminaScripturePicker = function() {
        const modal = document.getElementById('luminaScriptureVaultModal');
        if (modal) {
            modal.style.opacity = '0';
            modal.style.pointerEvents = 'none';
        }
    };

    // ── MODAL PYTAŃ NA START (ICEBREAKERS) ──
    window.openLuminaIcebreakersPicker = function(targetInputId) {
        let modal = document.getElementById('luminaIcebreakersModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'luminaIcebreakersModal';
            modal.style.cssText = 'position:fixed; inset:0; background:rgba(0,0,0,0.85); backdrop-filter:blur(10px); z-index:999999; display:flex; align-items:center; justify-content:center; padding:16px; opacity:0; pointer-events:none; transition:opacity 0.25s ease;';
            document.body.appendChild(modal);
        }

        let bodyHtml = ICEBREAKERS.map(cat => `
            <div style="margin-bottom:18px;">
                <div style="font-size:0.85rem; font-weight:800; color:#f472b6; font-family:'Outfit',sans-serif; margin-bottom:8px; display:flex; align-items:center; gap:6px;">
                    ${cat.category}
                </div>
                <div style="display:flex; flex-direction:column; gap:8px;">
                    ${cat.questions.map(q => {
                        const escaped = q.replace(/'/g, "\\'").replace(/"/g, '&quot;');
                        return `
                            <div onclick="window.insertChatSmartBlessing('${targetInputId}', '${escaped}')" 
                                 style="background:rgba(255,255,255,0.04); border:1px solid rgba(236,72,153,0.25); border-radius:12px; padding:12px 14px; cursor:pointer; transition:all 0.2s; display:flex; align-items:center; justify-content:space-between; gap:10px;"
                                 onmouseover="this.style.background='rgba(236,72,153,0.12)'; this.style.borderColor='#ec4899'; this.style.transform='translateX(3px)';"
                                 onmouseout="this.style.background='rgba(255,255,255,0.04)'; this.style.borderColor='rgba(236,72,153,0.25)'; this.style.transform='none';">
                                <div style="font-size:0.82rem; color:#f1f5f9; line-height:1.45; font-weight:600;">${q}</div>
                                <span style="font-size:0.75rem; color:#f472b6; font-weight:800; flex-shrink:0; background:rgba(236,72,153,0.15); padding:4px 8px; border-radius:8px;">Wstaw 💬</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `).join('');

        modal.innerHTML = `
            <div style="background:#0b1329; border:1.5px solid rgba(236,72,153,0.4); border-radius:20px; max-width:600px; width:100%; max-height:85vh; display:flex; flex-direction:column; box-shadow:0 20px 50px rgba(0,0,0,0.8); overflow:hidden;">
                <div style="display:flex; align-items:center; justify-content:space-between; padding:16px 20px; border-bottom:1px solid rgba(255,255,255,0.08); background:rgba(255,255,255,0.02);">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <span style="width:36px; height:36px; border-radius:10px; background:linear-gradient(135deg, #ec4899, #a855f7); display:flex; align-items:center; justify-content:center; color:#fff; font-size:1.1rem;"><i class="fa-solid fa-comments"></i></span>
                        <div>
                            <div style="font-weight:800; font-size:1rem; color:#fff; font-family:'Outfit',sans-serif;">Pytania Przełamujące Lody 💬</div>
                            <div style="font-size:0.72rem; color:#94a3b8;">Wartościowe tematy do rozpoczęcia budującej rozmowy</div>
                        </div>
                    </div>
                    <button onclick="window.closeLuminaIcebreakersPicker()" style="background:rgba(255,255,255,0.08); border:none; color:#fff; width:44px; height:44px; border-radius:50%; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:1.1rem; touch-action:manipulation;"><i class="fa-solid fa-xmark"></i></button>
                </div>
                <div style="padding:16px 20px; overflow-y:auto; flex:1;">
                    ${bodyHtml}
                </div>
            </div>
        `;

        modal.style.opacity = '1';
        modal.style.pointerEvents = 'auto';
    };

    window.closeLuminaIcebreakersPicker = function() {
        const modal = document.getElementById('luminaIcebreakersModal');
        if (modal) {
            modal.style.opacity = '0';
            modal.style.pointerEvents = 'none';
        }
    };

    // Renderowanie Paska Podpowiedzi dla danego kontenera
    function renderSmartBarForContainer(containerEl, targetInputId) {
        if (!containerEl) return;
        injectStyles();

        const cat = getCurrentTimeCategory();
        containerEl.className = 'lumina-smart-bar-container';

        const chipsHtml = cat.items.map(item => {
            const isScripture = item.type === 'scripture';
            const escapedText = item.text.replace(/'/g, "\\'").replace(/"/g, '&quot;');
            return `
                <button type="button" 
                        class="smart-chip-btn ${isScripture ? 'scripture-chip' : ''}" 
                        onclick="window.insertChatSmartBlessing('${targetInputId}', '${escapedText}')" 
                        title="${item.text}">
                    ${item.chip}
                </button>
            `;
        }).join('');

        containerEl.innerHTML = `
            <div class="smart-time-badge" style="background:${cat.badgeBg}; border:1px solid ${cat.badgeBorder}; color:${cat.badgeColor};">
                ${cat.label}
            </div>
            <button type="button" class="smart-action-btn scripture-vault-btn" onclick="window.openLuminaScripturePicker('${targetInputId}')">
                <i class="fa-solid fa-book-bible"></i> Wersety
            </button>
            <button type="button" class="smart-action-btn icebreakers-btn" onclick="window.openLuminaIcebreakersPicker('${targetInputId}')">
                <i class="fa-solid fa-comments"></i> Pytania na start
            </button>
            ${chipsHtml}
            <button type="button" class="smart-cycle-btn" onclick="window._cycleSmartBlessings('${targetInputId}', this)" title="Zmień zestaw błogosławieństw">
                <i class="fa-solid fa-arrows-rotate"></i> Losuj
            </button>
        `;
    }

    let cycleIndex = 0;
    window._cycleSmartBlessings = function(targetInputId, btnEl) {
        const catKeys = ['morning', 'afternoon', 'evening', 'night'];
        cycleIndex = (cycleIndex + 1) % catKeys.length;
        const cat = TIME_DATA[catKeys[cycleIndex]];

        const container = btnEl.closest('.lumina-smart-bar-container');
        if (!container) return;

        const chipsHtml = cat.items.map(item => {
            const isScripture = item.type === 'scripture';
            const escapedText = item.text.replace(/'/g, "\\'").replace(/"/g, '&quot;');
            return `
                <button type="button" 
                        class="smart-chip-btn ${isScripture ? 'scripture-chip' : ''}" 
                        onclick="window.insertChatSmartBlessing('${targetInputId}', '${escapedText}')" 
                        title="${item.text}">
                    ${item.chip}
                </button>
            `;
        }).join('');

        container.innerHTML = `
            <div class="smart-time-badge" style="background:${cat.badgeBg}; border:1px solid ${cat.badgeBorder}; color:${cat.badgeColor};">
                ${cat.label}
            </div>
            <button type="button" class="smart-action-btn scripture-vault-btn" onclick="window.openLuminaScripturePicker('${targetInputId}')">
                <i class="fa-solid fa-book-bible"></i> Wersety
            </button>
            <button type="button" class="smart-action-btn icebreakers-btn" onclick="window.openLuminaIcebreakersPicker('${targetInputId}')">
                <i class="fa-solid fa-comments"></i> Pytania na start
            </button>
            ${chipsHtml}
            <button type="button" class="smart-cycle-btn" onclick="window._cycleSmartBlessings('${targetInputId}', this)" title="Zmień zestaw błogosławieństw">
                <i class="fa-solid fa-arrows-rotate"></i> Losuj
            </button>
        `;
    };

    // Auto-inicjalizacja dla wszystkich czatów na stronie
    function initAllChatSmartBars() {
        injectStyles();

        // 1. Direct Messages Modal Chat
        const dmBar = document.getElementById('activeChatSmartBar') || 
                      document.querySelector('#activeChatForm')?.previousElementSibling;
        if (dmBar && (dmBar.id === 'activeChatSmartBar' || dmBar.classList.contains('lumina-smart-bar-container') || dmBar.style.display !== 'none')) {
            renderSmartBarForContainer(dmBar, 'activeChatInput');
        }

        // 2. Public Community Messenger Chat
        const publicBar = document.getElementById('publicChatSmartBar') ||
                          document.querySelector('#publicChatForm')?.previousElementSibling?.previousElementSibling;
        if (publicBar && (publicBar.id === 'publicChatSmartBar' || publicBar.classList.contains('lumina-smart-bar-container'))) {
            renderSmartBarForContainer(publicBar, 'publicChatInput');
        }

        // 3. Fallback dla wszelkich pasków Quick Emoji
        document.querySelectorAll('.chat-quick-bar, [data-smart-blessings]').forEach(el => {
            const inputId = el.getAttribute('data-target-input') || 'activeChatInput';
            renderSmartBarForContainer(el, inputId);
        });
    }

    window.initLuminaSmartBlessings = initAllChatSmartBars;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setTimeout(initAllChatSmartBars, 600));
    } else {
        setTimeout(initAllChatSmartBars, 600);
    }

    // Odświeżaj co 15 minut, aby płynnie przełączać porę dnia
    setInterval(initAllChatSmartBars, 15 * 60 * 1000);
})();
