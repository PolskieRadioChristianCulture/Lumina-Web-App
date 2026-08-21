/**
 * ══════════════════════════════════════════════════════════════════════════
 * LUMINA GLOBAL RADIO ENGINE (lumina-radio.js)
 * Oficjalny Strumień Radiowy Christian Culture: https://stream.zeno.fm/umej2cuqncluv
 * Ciągłe odtwarzanie (Persistent Audio) w całym portalu LUMINA
 * ══════════════════════════════════════════════════════════════════════════
 */
(function() {
    if (window.LuminaRadioEngineInitialized) return;
    window.LuminaRadioEngineInitialized = true;

    const RADIO_STREAMS = [
        "https://stream.zeno.fm/umej2cuqncluv",
        "https://stream.zeno.fm/umej2cuqncluv.aac",
        "https://stream-178.zeno.fm/umej2cuqncluv"
    ];
    let currentStreamIndex = 0;
    let isPlaying = false;
    let audioElement = null;
    let resumeListenerAttached = false;

    // ── 1. Audio Element Accessor & Fallback Auto-Heal ──
    function getAudioElement() {
        if (!audioElement) {
            audioElement = document.getElementById('ccRadioAudio');
            if (!audioElement) {
                audioElement = document.createElement('audio');
                audioElement.id = 'ccRadioAudio';
                audioElement.preload = 'none';
                document.body.appendChild(audioElement);
            }
            audioElement.addEventListener('error', handleAudioError);
            audioElement.addEventListener('play', () => onStateChange(true));
            audioElement.addEventListener('pause', () => onStateChange(false));
            audioElement.addEventListener('ended', () => {
                if (localStorage.getItem('lumina_radio_playing') === 'true') {
                    setTimeout(() => LuminaRadio.play(false), 1200);
                }
            });
        }
        return audioElement;
    }

    function handleAudioError(e) {
        const audio = getAudioElement();
        const currentSrc = audio.getAttribute('src') || audio.src || '';
        if (!currentSrc || currentSrc === window.location.href || audio.paused) {
            return;
        }
        console.warn('LuminaRadio stream fallback attempt...', e);
        if (localStorage.getItem('lumina_radio_playing') === 'true') {
            currentStreamIndex = (currentStreamIndex + 1) % RADIO_STREAMS.length;
            audio.src = RADIO_STREAMS[currentStreamIndex] + '?t=' + Date.now();
            audio.load();
            audio.play().catch(err => {
                console.warn('Fallback play delay:', err);
                attachResumeOnInteraction();
            });
        }
    }

    // ── 2. Synchronizacja Stanu Wizualnego UI na Wszystkich Podstronach ──
    function updateAllRadioUI(playing) {
        isPlaying = playing;
        
        // Klasy CSS dla przycisków i pigułek radia
        document.querySelectorAll('#radioWidget, .nav-radio-pill, .nav-radio-btn, .radio-widget-toggle, .btn-radio-toggle').forEach(el => {
            if (playing) {
                el.classList.add('radio-playing');
                el.classList.add('active');
            } else {
                el.classList.remove('radio-playing');
                el.classList.remove('active');
            }
        });

        // Ikony Play / Pause
        document.querySelectorAll('#radioPlayIcon, .radio-play-icon, .radio-icon').forEach(icon => {
            if (playing) {
                icon.className = 'fa-solid fa-pause';
            } else {
                icon.className = 'fa-solid fa-play';
            }
        });

        const mobileNavIcon = document.getElementById('mobileRadioNavIcon');
        if (mobileNavIcon) {
            if (playing) {
                mobileNavIcon.className = 'fa-solid fa-volume-high';
                mobileNavIcon.style.animation = 'pulse 1.2s infinite';
            } else {
                mobileNavIcon.className = 'fa-solid fa-radio';
                mobileNavIcon.style.animation = 'none';
            }
        }

        // Pływający Miniodtwarzacz (Persistent Floating Player)
        const mini = document.getElementById('luminaFloatingRadioBar');
        if (mini) {
            if (playing) {
                // Pokazuj tylko jeśli użytkownik wcześniej go celowo nie zminimalizował
                if (!mini.classList.contains('minimized-by-user')) {
                    mini.classList.add('visible');
                }
                const miniIcon = mini.querySelector('.mini-radio-play-btn i');
                if (miniIcon) miniIcon.className = 'fa-solid fa-pause';
            } else {
                mini.classList.remove('visible');
                // Kasujemy znacznik, gdy radio zostaje wstrzymane (kolejne odtworzenie znów wywoła pasek)
                mini.classList.remove('minimized-by-user');
                const miniIcon = mini.querySelector('.mini-radio-play-btn i');
                if (miniIcon) miniIcon.className = 'fa-solid fa-play';
            }
        }
    }

    function onStateChange(playing) {
        updateAllRadioUI(playing);
    }

    // ── 3. Wznawianie Odtwarzania przy Pierwszej Interakcji (Przejścia między stronami) ──
    function attachResumeOnInteraction() {
        if (resumeListenerAttached) return;
        resumeListenerAttached = true;

        const resumeEvents = ['click', 'touchstart', 'pointerdown', 'keydown', 'scroll'];
        const onInteraction = function() {
            if (localStorage.getItem('lumina_radio_playing') === 'true') {
                const audio = getAudioElement();
                if (audio.paused) {
                    audio.play().then(() => {
                        updateAllRadioUI(true);
                    }).catch(() => {});
                }
            }
            resumeEvents.forEach(evt => window.removeEventListener(evt, onInteraction));
            resumeListenerAttached = false;
        };

        resumeEvents.forEach(evt => window.addEventListener(evt, onInteraction, { passive: true, once: true }));
    }

    // ── 4. Główny Obiekt Zarządzający Radiem ──
    const LuminaRadio = {
        play: function(isUserClick = false) {
            const audio = getAudioElement();
            const currentSrc = audio.getAttribute('src') || audio.src || '';
            if (!currentSrc || currentSrc === window.location.href) {
                currentStreamIndex = 0;
                audio.src = RADIO_STREAMS[0] + '?t=' + Date.now();
                audio.load();
            }
            
            return audio.play().then(() => {
                localStorage.setItem('lumina_radio_playing', 'true');
                localStorage.setItem('lumina_radio_last_active', Date.now());
                updateAllRadioUI(true);
            }).catch(err => {
                console.warn('Autoplay blocked or delayed:', err);
                if (!isUserClick) {
                    attachResumeOnInteraction();
                }
            });
        },

        pause: function(isUserClick = false) {
            const audio = getAudioElement();
            audio.pause();
            audio.removeAttribute('src');
            localStorage.setItem('lumina_radio_playing', 'false');
            updateAllRadioUI(false);
        },

        toggle: function(isUserClick = true) {
            const audio = getAudioElement();
            if (audio.paused || !isPlaying) {
                this.play(isUserClick);
            } else {
                this.pause(isUserClick);
            }
        },

        isPlaying: function() {
            return isPlaying;
        },

        init: function() {
            getAudioElement();
            injectFloatingMiniPlayer();
            const shouldPlay = (localStorage.getItem('lumina_radio_playing') === 'true');
            if (shouldPlay) {
                this.play(false);
            } else {
                updateAllRadioUI(false);
            }
        }
    };

    window.LuminaRadio = LuminaRadio;
    window.toggleRadio = function() {
        LuminaRadio.toggle(true);
    };

    // ── 5. Wstrzyknięcie Pływającego Miniodtwarzacza Radia (Sticky Mini Player) ──
    function injectFloatingMiniPlayer() {
        if (document.getElementById('luminaFloatingRadioBar')) return;

        const style = document.createElement('style');
        style.id = 'lumina-floating-radio-styles';
        style.textContent = `
            #luminaFloatingRadioBar {
                position: fixed;
                bottom: 84px;
                left: 50%;
                transform: translateX(-50%) translateY(120px);
                z-index: 999990;
                background: linear-gradient(135deg, rgba(15, 23, 42, 0.96), rgba(30, 27, 75, 0.96));
                border: 1.5px solid rgba(245, 158, 11, 0.6);
                border-radius: 40px;
                padding: 8px 24px 8px 10px;
                display: flex;
                align-items: center;
                gap: 12px;
                box-shadow: 0 12px 36px rgba(0, 0, 0, 0.7), 0 0 24px rgba(245, 158, 11, 0.3);
                backdrop-filter: blur(16px);
                -webkit-backdrop-filter: blur(16px);
                opacity: 0;
                pointer-events: none;
                transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
                font-family: 'Plus Jakarta Sans', sans-serif;
                color: #ffffff;
                width: auto;
                max-width: 92vw;
            }
            #luminaFloatingRadioBar.visible {
                transform: translateX(-50%) translateY(0);
                opacity: 1;
                pointer-events: auto;
            }
            @media (max-width: 768px) {
                #luminaFloatingRadioBar {
                    bottom: 76px;
                    left: 50%;
                    width: 92%;
                    max-width: 380px;
                    transform: translateX(-50%) translateY(120px);
                    justify-content: space-between;
                    border-radius: 20px;
                    padding: 8px 20px 8px 16px;
                }
                #luminaFloatingRadioBar.visible {
                    transform: translateX(-50%) translateY(0);
                }
            }
            .mini-radio-play-btn {
                width: 34px;
                height: 34px;
                border-radius: 50%;
                background: linear-gradient(135deg, #f59e0b, #d97706);
                border: none;
                color: #fff;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 0.88rem;
                cursor: pointer;
                box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
                transition: transform 0.2s;
                flex-shrink: 0;
            }
            .mini-radio-play-btn:hover {
                transform: scale(1.08);
            }
            .mini-radio-waves {
                display: flex;
                align-items: flex-end;
                gap: 2.5px;
                height: 16px;
                padding-bottom: 2px;
            }
            .mini-radio-waves span {
                display: inline-block;
                width: 3px;
                background: #facc15;
                border-radius: 2px;
                animation: miniWaveAnim 0.8s ease-in-out infinite alternate;
            }
            .mini-radio-waves span:nth-child(1) { height: 6px; animation-delay: 0.1s; }
            .mini-radio-waves span:nth-child(2) { height: 14px; animation-delay: 0.3s; }
            .mini-radio-waves span:nth-child(3) { height: 9px; animation-delay: 0.2s; }
            .mini-radio-waves span:nth-child(4) { height: 16px; animation-delay: 0.4s; }
            @keyframes miniWaveAnim {
                0% { height: 4px; }
                100% { height: 16px; }
            }
            .mini-radio-info {
                display: flex;
                flex-direction: column;
                line-height: 1.2;
            }
            .mini-radio-title {
                font-size: 0.8rem;
                font-weight: 800;
                color: #facc15;
                white-space: nowrap;
            }
            .mini-radio-sub {
                font-size: 0.68rem;
                color: #94a3b8;
                white-space: nowrap;
            }
            .mini-radio-popup, .mini-radio-close {
                background: transparent;
                border: none;
                color: #64748b;
                font-size: 0.82rem;
                cursor: pointer;
                padding: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: color 0.2s;
            }
            .mini-radio-close {
                margin-right: 6px;
            }
            .mini-radio-popup:hover, .mini-radio-close:hover {
                color: #cbd5e1;
            }
        `;
        document.head.appendChild(style);

        const barHtml = `
            <div id="luminaFloatingRadioBar" role="region" aria-label="Miniodtwarzacz Radia LUMINA">
                <button type="button" class="mini-radio-play-btn" onclick="window.toggleRadio()" title="Wstrzymaj / Odtwórz Radio CC">
                    <i class="fa-solid fa-pause"></i>
                </button>
                <div class="mini-radio-waves">
                    <span></span><span></span><span></span><span></span>
                </div>
                <div class="mini-radio-info" style="cursor: pointer;" onclick="document.getElementById('luminaFloatingRadioBar').classList.add('minimized-by-user'); document.getElementById('luminaFloatingRadioBar').classList.remove('visible');">
                    <span class="mini-radio-title">Radio Christian Culture 🎵</span>
                    <span class="mini-radio-sub">24/7 Na Żywo • Uwielbienie & Słowo</span>
                </div>
                <div style="display:flex; gap: 4px;"><button type="button" class="mini-radio-popup" onclick="window.LuminaRadio.pause(); window.open('radio-popup.html', 'LuminaRadioPopup', 'width=350,height=450,resizable=no');" title="Odtwarzaj w osobnym oknie (Popup)"><i class="fa-solid fa-arrow-up-right-from-square"></i></button><button type="button" class="mini-radio-close" onclick="document.getElementById('luminaFloatingRadioBar').classList.add('minimized-by-user'); document.getElementById('luminaFloatingRadioBar').classList.remove('visible');" title="Zminimalizuj odtwarzacz">
                    <i class="fa-solid fa-chevron-down"></i>
                </button>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', barHtml);
    }

    // ── 6. Synchronizacja Międzykartowa (Storage Event) ──
    window.addEventListener('storage', (e) => {
        if (e.key === 'lumina_radio_playing') {
            if (e.newValue === 'true' && (!audioElement || audioElement.paused)) {
                LuminaRadio.play(false);
            } else if (e.newValue === 'false' && audioElement && !audioElement.paused) {
                LuminaRadio.pause(false);
            }
        }
    });

    // ── 7. Automatyczna Inicjalizacja przy Załadowaniu Strony ──
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => LuminaRadio.init());
    } else {
        LuminaRadio.init();
    }
})();
