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
        `;
        document.head.appendChild(styleEl);
    }

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

        // Wywołanie zdarzeń input & change, by podpięte silniki (np. wskaźnik pisania) zareagowały
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));

        if (typeof window.showToast === 'function') {
            window.showToast('✨ Wstawiono błogosławieństwo do wiadomości');
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
