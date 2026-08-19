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
        console.warn('LuminaRadio stream fallback attempt...', e);
        if (localStorage.getItem('lumina_radio_playing') === 'true') {
            currentStreamIndex = (currentStreamIndex + 1) % RADIO_STREAMS.length;
            const audio = getAudioElement();
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

        // Pływający Miniodtwarzacz (Persistent Floating Player)
        const mini = document.getElementById('luminaFloatingRadioBar');
        if (mini) {
            if (playing) {
                mini.classList.add('visible');
                const miniIcon = mini.querySelector('.mini-radio-play-btn i');
                if (miniIcon) miniIcon.className = 'fa-solid fa-pause';
            } else {
                mini.classList.remove('visible');
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
            currentStreamIndex = 0;
            audio.src = RADIO_STREAMS[0] + '?t=' + Date.now();
            audio.load();
            
            return audio.play().then(() => {
                localStorage.setItem('lumina_radio_playing', 'true');
                localStorage.setItem('lumina_radio_last_active', Date.now());
                updateAllRadioUI(true);
                if (isUserClick) {
                    const toast = window.showToast || window.luminaToast;
                    if (typeof toast === 'function') toast('Radio Christian Culture gra na żywo! 📻🎵');
                }
            }).catch(err => {
                console.warn('Autoplay blocked or delayed:', err);
                if (isUserClick) {
                    const toast = window.showToast || window.luminaToast;
                    if (typeof toast === 'function') toast('Kliknij ponownie, aby odtworzyć Radio CC');
                } else {
                    attachResumeOnInteraction();
                }
            });
        },

        pause: function(isUserClick = false) {
            const audio = getAudioElement();
            audio.pause();
            audio.src = '';
            localStorage.setItem('lumina_radio_playing', 'false');
            updateAllRadioUI(false);
            if (isUserClick) {
                const toast = window.showToast || window.luminaToast;
                if (typeof toast === 'function') toast('Radio Christian Culture wstrzymane ⏸️');
            }
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
                bottom: 80px;
                left: 20px;
                z-index: 999990;
                background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 27, 75, 0.95));
                border: 1.5px solid rgba(245, 158, 11, 0.55);
                border-radius: 40px;
                padding: 6px 14px 6px 8px;
                display: flex;
                align-items: center;
                gap: 10px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6), 0 0 20px rgba(245, 158, 11, 0.25);
                backdrop-filter: blur(14px);
                -webkit-backdrop-filter: blur(14px);
                transform: translateY(120px);
                opacity: 0;
                pointer-events: none;
                transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
                font-family: 'Plus Jakarta Sans', sans-serif;
                color: #ffffff;
                max-width: 90vw;
            }
            #luminaFloatingRadioBar.visible {
                transform: translateY(0);
                opacity: 1;
                pointer-events: auto;
            }
            @media (max-width: 768px) {
                #luminaFloatingRadioBar {
                    bottom: 74px;
                    left: 12px;
                    right: 12px;
                    justify-content: space-between;
                    border-radius: 18px;
                    padding: 8px 14px;
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
            .mini-radio-close {
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
            .mini-radio-close:hover {
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
                <div class="mini-radio-info">
                    <span class="mini-radio-title">Radio Christian Culture 🎵</span>
                    <span class="mini-radio-sub">24/7 Na Żywo • Uwielbienie & Słowo</span>
                </div>
                <button type="button" class="mini-radio-close" onclick="window.LuminaRadio.pause(true)" title="Wyłącz radio">
                    <i class="fa-solid fa-xmark"></i>
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
