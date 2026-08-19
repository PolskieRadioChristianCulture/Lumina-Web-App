/**
 * ══════════════════════════════════════════════════════════════════════════
 * LUMINA CENTRAL RADIO ENGINE (js/lumina-radio.js)
 * Oficjalny, zunifikowany odtwarzacz Radia Christian Culture w portalu LUMINA
 * Cechy:
 * 1. Globalna instancja Audio (niezależna od struktury DOM).
 * 2. Czyste strumienie Zeno.fm bez query params (zapobiega 404/400 mountpoint).
 * 3. Błyskawiczny failover do strumieni rezerwowych w razie problemu z łączem.
 * 4. Pełna synchronizacja stanu przycisku Play / Pause we wszystkich widokach.
 * ══════════════════════════════════════════════════════════════════════════
 */

(function(global) {
    'use strict';

    const RADIO_STREAMS = [
        { name: 'Radio PL', url: 'https://stream.zeno.fm/vz96pvl3pnktv' },
        { name: 'Radio Global', url: 'https://stream.zeno.fm/umej2cuqncluv' },
        { name: 'Radio Biblia Audio', url: 'https://stream.zeno.fm/imo45hqnshyuv' },
        { name: 'Instrumental Worship', url: 'https://christian-culture-global.web.app/deep_forest_1.mp3' }
    ];

    let currentStreamIdx = 0;
    let isPlaying = false;
    let audioInstance = null;

    function getAudio() {
        if (!global._luminaRadioAudio) {
            global._luminaRadioAudio = new Audio();
            global._luminaRadioAudio.volume = 0.85;
            global._luminaRadioAudio.preload = 'auto';

            global._luminaRadioAudio.addEventListener('ended', () => {
                if (isPlaying) {
                    tryPlay(currentStreamIdx);
                }
            });

            global._luminaRadioAudio.addEventListener('error', (e) => {
                console.warn('LuminaRadio: Strumień zgłosił błąd, przełączanie na rezerwowy...', e);
                if (isPlaying) {
                    tryPlay(currentStreamIdx + 1);
                }
            });
        }
        return global._luminaRadioAudio;
    }

    function syncUI(playing) {
        isPlaying = playing;
        
        // Wszystkie ikonki play/pause
        const icons = document.querySelectorAll('#radioPlayIcon, .radio-play-icon, .nav-radio-play i');
        icons.forEach(ic => {
            if (playing) {
                ic.className = 'fa-solid fa-pause';
            } else {
                ic.className = 'fa-solid fa-play';
            }
        });

        // Wszystkie przyciski widgetu radia
        const btns = document.querySelectorAll('#radioWidget, .nav-radio-btn, .nav-radio-pill');
        btns.forEach(btn => {
            if (playing) {
                btn.classList.add('playing', 'radio-playing', 'active');
            } else {
                btn.classList.remove('playing', 'radio-playing', 'active');
            }
        });
    }

    function tryPlay(idx) {
        if (idx >= RADIO_STREAMS.length) {
            syncUI(false);
            if (typeof global.showToast === 'function') {
                global.showToast('Chwilowy brak połączenia z serwerami radia. Spróbuj ponownie za moment.');
            }
            return;
        }

        currentStreamIdx = idx;
        const target = RADIO_STREAMS[idx];
        const audio = getAudio();

        audio.src = target.url;
        audio.load();

        const p = audio.play();
        if (p !== undefined) {
            p.then(() => {
                syncUI(true);
                if (typeof global.showToast === 'function') {
                    global.showToast('Radio Christian Culture Gra na Żywo! 📻✨');
                }
            }).catch(err => {
                console.warn(`LuminaRadio: Błąd odtwarzania ${target.name}, przejście do fallbacku...`, err);
                tryPlay(idx + 1);
            });
        }
    }

    function toggleRadio() {
        const audio = getAudio();
        if (!isPlaying) {
            if (typeof global.showToast === 'function') {
                global.showToast('Łączenie z Radiem Christian Culture... 📻');
            }
            tryPlay(0);
        } else {
            audio.pause();
            audio.src = '';
            syncUI(false);
            if (typeof global.showToast === 'function') {
                global.showToast('Radio wstrzymane');
            }
        }
    }

    function playRadio() {
        if (!isPlaying) tryPlay(0);
    }

    function pauseRadio() {
        if (isPlaying) {
            const audio = getAudio();
            audio.pause();
            audio.src = '';
            syncUI(false);
        }
    }

    // Eksporty globalne
    global.LuminaRadio = {
        toggle: toggleRadio,
        play: playRadio,
        pause: pauseRadio,
        isPlaying: () => isPlaying,
        getStreams: () => RADIO_STREAMS
    };

    global.toggleRadio = toggleRadio;
    global.playRadio = playRadio;
    global.pauseRadio = pauseRadio;

    // Automatyczne podpięcie listenerów kliknięcia do przycisków w DOM
    function attachListeners() {
        const btns = document.querySelectorAll('#radioWidget, .nav-radio-btn');
        btns.forEach(b => {
            b.onclick = (e) => {
                e.preventDefault();
                toggleRadio();
            };
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', attachListeners);
    } else {
        attachListeners();
    }

})(typeof window !== 'undefined' ? window : globalThis);
