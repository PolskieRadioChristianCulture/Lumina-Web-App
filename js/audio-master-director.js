/**
 * ═════════════════════════════════════════════════════════════════════════════════
 *  CYFROWY WIRTUALNY REŻYSER DŹWIĘKU — CHRISTIAN CULTURE AUDIO MASTER DIRECTOR
 *  Klasa emisyjna: Web Audio API DSP, AGC, Normalizacja -14 LUFS, Strict Audio Focus
 * ═════════════════════════════════════════════════════════════════════════════════
 */

(function (window) {
    'use strict';

    class AudioMasterDirector {
        constructor() {
            this.audioCtx = null;
            this.masterGainNode = null;
            this.compressorNode = null;
            this.eqLowShelf = null;
            this.eqSpeechClarity = null;
            this.eqHighShelf = null;

            this.isUnlocked = false;
            this.isMasterMuted = false;
            this.masterVolume = 1.0;

            this.activeSource = null; // { id, type, element }
            this.registeredSources = new Map(); // id -> { id, type, element, originalSrc }
            this.connectedElements = new WeakSet(); // zapobiega wielokrotnemu podłączaniu createMediaElementSource

            this._initUserGestureUnlock();
        }

        /**
         * Inicjalizacja Web Audio API DSP (tor studyjny)
         */
        _ensureAudioContext() {
            if (this.audioCtx) {
                if (this.audioCtx.state === 'suspended') {
                    this.audioCtx.resume().catch(() => {});
                }
                return this.audioCtx;
            }

            try {
                const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
                if (!AudioCtxClass) return null;

                this.audioCtx = new AudioCtxClass();

                // 1. MASTER GAIN
                this.masterGainNode = this.audioCtx.createGain();
                this.masterGainNode.gain.setValueAtTime(this.masterVolume, this.audioCtx.currentTime);

                // 2. BROADCAST DYNAMICS COMPRESSOR (AGC & Peak Limiter)
                // Ustawienia emisyjne: zapobiegają przesterom, kompresują nadmierną dynamikę
                this.compressorNode = this.audioCtx.createDynamicsCompressor();
                this.compressorNode.threshold.setValueAtTime(-18, this.audioCtx.currentTime); // dB
                this.compressorNode.knee.setValueAtTime(12, this.audioCtx.currentTime);       // dB
                this.compressorNode.ratio.setValueAtTime(3.5, this.audioCtx.currentTime);     // 3.5:1
                this.compressorNode.attack.setValueAtTime(0.003, this.audioCtx.currentTime);  // 3ms
                this.compressorNode.release.setValueAtTime(0.25, this.audioCtx.currentTime);  // 250ms

                // 3. 3-BAND MASTER PARAMETRIC EQUALIZER (Korektor Pasma Mowy i Muzyki)
                // Pasmo 1: Low-Shelf (odcięcie sub-dudnienia poniżej 85Hz)
                this.eqLowShelf = this.audioCtx.createBiquadFilter();
                this.eqLowShelf.type = 'lowshelf';
                this.eqLowShelf.frequency.setValueAtTime(85, this.audioCtx.currentTime);
                this.eqLowShelf.gain.setValueAtTime(-2.5, this.audioCtx.currentTime); // -2.5dB

                // Pasmo 2: Speech Clarity Peaking (podbicie wyrazistości głosu 3.2 kHz)
                this.eqSpeechClarity = this.audioCtx.createBiquadFilter();
                this.eqSpeechClarity.type = 'peaking';
                this.eqSpeechClarity.frequency.setValueAtTime(3200, this.audioCtx.currentTime);
                this.eqSpeechClarity.Q.setValueAtTime(1.1, this.audioCtx.currentTime);
                this.eqSpeechClarity.gain.setValueAtTime(2.5, this.audioCtx.currentTime); // +2.5dB

                // Pasmo 3: High-Shelf (szlachetna góra pasma radiowego 10 kHz)
                this.eqHighShelf = this.audioCtx.createBiquadFilter();
                this.eqHighShelf.type = 'highshelf';
                this.eqHighShelf.frequency.setValueAtTime(10000, this.audioCtx.currentTime);
                this.eqHighShelf.gain.setValueAtTime(1.5, this.audioCtx.currentTime); // +1.5dB

                // Połączenie łańcucha DSP:
                // Input -> eqLowShelf -> eqSpeechClarity -> eqHighShelf -> compressorNode -> masterGainNode -> destination
                this.eqLowShelf.connect(this.eqSpeechClarity);
                this.eqSpeechClarity.connect(this.eqHighShelf);
                this.eqHighShelf.connect(this.compressorNode);
                this.compressorNode.connect(this.masterGainNode);
                this.masterGainNode.connect(this.audioCtx.destination);

                console.log('[AudioDirector] 🎙️ Wirtualny Procesor Emisyjny DSP zainicjalizowany.');
            } catch (err) {
                console.warn('[AudioDirector] Web Audio API init warning:', err);
            }

            return this.audioCtx;
        }

        /**
         * Rejestracja globalnego gestu odblokowującego audio
         */
        _initUserGestureUnlock() {
            const unlockHandler = () => {
                this.unlockAudio();
            };

            const opts = { once: true, passive: true };
            window.addEventListener('pointerdown', unlockHandler, opts);
            window.addEventListener('touchstart', unlockHandler, opts);
            window.addEventListener('click', unlockHandler, opts);
            window.addEventListener('keydown', unlockHandler, opts);
            window.addEventListener('wheel', unlockHandler, opts);
        }

        /**
         * Odblokowanie kontekstu audio po interakcji użytkownika
         */
        unlockAudio() {
            this.isUnlocked = true;
            this._ensureAudioContext();

            if (this.audioCtx && this.audioCtx.state === 'suspended') {
                this.audioCtx.resume().then(() => {
                    console.log('[AudioDirector] 🔊 AudioContext odblokowany gestem użytkownika.');
                }).catch(() => {});
            }

            // Jeśli jest aktywne wideo MP4 lub live, odśwież jego stan audio
            if (this.activeSource) {
                this._applyAudioToSource(this.activeSource, true);
            }
        }

        /**
         * Połączenie elementu HTMLMediaElement z procesorem DSP
         */
        _attachToDSP(mediaElement) {
            if (!this.audioCtx || !this.eqLowShelf || !mediaElement) return;
            if (this.connectedElements.has(mediaElement)) return;

            try {
                const source = this.audioCtx.createMediaElementSource(mediaElement);
                source.connect(this.eqLowShelf);
                this.connectedElements.add(mediaElement);
            } catch (e) {
                // W razie ograniczeń cross-origin lub ponownego przypięcia
            }
        }

        /**
         * Rejestracja źródła w Reżyserze Dźwięku
         */
        registerSource(id, type, element, originalSrc) {
            this.registeredSources.set(id, {
                id,
                type,
                element,
                originalSrc: originalSrc || (element ? element.getAttribute('src') : '')
            });
        }

        /**
         * EXCLUSIVE AUDIO FOCUS:
         * Tylko JEDNO źródło ma prawo wydawać dźwięk w danej chwili.
         * Wszystkie pozostałe źródła są natychmiast uciszane z wygaszeniem (cross-fade).
         */
        acquireFocus(sourceId, type, element, options = {}) {
            this._ensureAudioContext();

            // 1. Wygaszenie i uśpienie wszystkich pozostałych źródeł
            this.registeredSources.forEach((src, id) => {
                if (id !== sourceId) {
                    this._silenceSource(src, options);
                }
            });

            // 2. Aktywacja nowego źródła
            const targetSource = this.registeredSources.get(sourceId) || { id: sourceId, type, element };
            this.activeSource = targetSource;

            this._applyAudioToSource(targetSource, true, options);
        }

        /**
         * Wyciszenie i uśpienie źródła
         */
        _silenceSource(source, options = {}) {
            if (!source || !source.element) return;
            const el = source.element;

            if (source.type === 'video') {
                // HTML5 Video / MP4
                try {
                    if (el.volume > 0.05) {
                        el.volume = 0;
                    }
                    el.muted = true;
                    el.pause();
                } catch (e) {}
            } else if (source.type === 'live_iframe') {
                // Iframe kanału nadawczego
                try {
                    // a) Wysłanie rozkazu postMessage
                    if (el.contentWindow) {
                        el.contentWindow.postMessage({ type: 'MUTE_AUDIO', func: 'mute' }, '*');
                        el.contentWindow.postMessage('{"type":"MUTE_AUDIO","func":"mute"}', '*');
                    }

                    // b) Bezpośrednie odcięcie audio wewnątrz same-origin iframe
                    const idoc = el.contentDocument || (el.contentWindow && el.contentWindow.document);
                    if (idoc) {
                        try {
                            if (el.contentWindow) el.contentWindow._worshipUserInteracted = false;
                        } catch (e) {}
                        const audios = idoc.querySelectorAll('audio, video');
                        audios.forEach(a => {
                            a.muted = true;
                            a.volume = 0;
                            a.pause();
                        });
                    }

                    // c) Głęboki tryb uśpienia dla odległych slajdów (oszczędność CPU i pasma)
                    if (options.deepSleep && source.originalSrc && el.getAttribute('src') !== 'about:blank') {
                        el.setAttribute('data-standby-src', source.originalSrc);
                        el.setAttribute('src', 'about:blank');
                    }
                } catch (e) {}
            } else if (source.type === 'youtube') {
                // YouTube Shorts Iframe
                try {
                    if (el.contentWindow) {
                        el.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
                        el.contentWindow.postMessage('{"event":"command","func":"mute","args":""}', '*');
                    }
                } catch (e) {}
            }
        }

        /**
         * Aktywacja i rozjaśnienie (fade-in) dźwięku na wybranym źródle
         */
        _applyAudioToSource(source, shouldPlay = true, options = {}) {
            if (!source || !source.element) return;
            const el = source.element;
            const effectiveMuted = this.isMasterMuted;

            if (source.type === 'video') {
                // Wideo MP4 / Reklama
                this._attachToDSP(el);

                if (shouldPlay) {
                    el.muted = effectiveMuted;
                    el.volume = effectiveMuted ? 0 : this.masterVolume;

                    const playPromise = el.play();
                    if (playPromise !== undefined) {
                        playPromise.catch(() => {
                            el.muted = true;
                            el.play().catch(() => {});
                        });
                    }
                } else {
                    el.pause();
                }
            } else if (source.type === 'live_iframe') {
                // Kanał nadawczy LIVE (CCTV24, Śniadaniowa)
                // Przywrócenie ze standby jeśli był w deepSleep
                const standbySrc = el.getAttribute('data-standby-src');
                if (standbySrc && (el.getAttribute('src') === 'about:blank' || !el.getAttribute('src'))) {
                    el.setAttribute('src', standbySrc);
                    el.removeAttribute('data-standby-src');
                }

                const applyLiveSound = () => {
                    try {
                        const idoc = el.contentDocument || (el.contentWindow && el.contentWindow.document);
                        if (idoc) {
                            // Likwidacja nakładki
                            const overlay = idoc.getElementById('startOverlay');
                            if (overlay) {
                                overlay.classList.add('hidden');
                                overlay.style.setProperty('display', 'none', 'important');
                                overlay.style.setProperty('opacity', '0', 'important');
                            }

                            // Uruchomienie strumienia
                            if (shouldPlay) {
                                try {
                                    if (el.contentWindow) el.contentWindow._worshipUserInteracted = true;
                                } catch(e) {}
                                if (typeof el.contentWindow.initStream === 'function') {
                                    el.contentWindow.initStream();
                                }
                            }

                            // Konfiguracja audio w iframe
                            const audios = idoc.querySelectorAll('audio, video');
                            audios.forEach(audio => {
                                audio.muted = effectiveMuted;
                                audio.volume = effectiveMuted ? 0 : this.masterVolume;
                                if (shouldPlay && !effectiveMuted) {
                                    audio.play().catch(() => {
                                        audio.muted = true;
                                        audio.play().catch(() => {});
                                    });
                                }
                            });
                        }

                        // Komunikaty postMessage
                        if (el.contentWindow) {
                            if (shouldPlay && !effectiveMuted) {
                                el.contentWindow.postMessage({ type: 'UNMUTE_AUDIO', func: 'unMute' }, '*');
                                el.contentWindow.postMessage('{"type":"UNMUTE_AUDIO","func":"unMute"}', '*');
                                el.contentWindow.postMessage({ type: 'AUTOPLAY', func: 'play' }, '*');
                            } else {
                                el.contentWindow.postMessage({ type: 'MUTE_AUDIO', func: 'mute' }, '*');
                                el.contentWindow.postMessage('{"type":"MUTE_AUDIO","func":"mute"}', '*');
                            }
                        }
                    } catch (e) {}
                };

                applyLiveSound();
                setTimeout(applyLiveSound, 150);
                setTimeout(applyLiveSound, 400);
            } else if (source.type === 'youtube') {
                // YouTube Shorts
                try {
                    if (el.contentWindow) {
                        if (shouldPlay) {
                            el.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
                            if (!effectiveMuted && this.isUnlocked) {
                                el.contentWindow.postMessage('{"event":"command","func":"unMute","args":""}', '*');
                            }
                        } else {
                            el.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
                        }
                    }
                } catch (e) {}
            }
        }

        /**
         * Przełączenie globalnego wyciszenia (Mute / Unmute)
         */
        toggleMasterMute() {
            this.isMasterMuted = !this.isMasterMuted;

            if (this.masterGainNode && this.audioCtx) {
                const targetGain = this.isMasterMuted ? 0 : this.masterVolume;
                this.masterGainNode.gain.setValueAtTime(targetGain, this.audioCtx.currentTime);
            }

            if (!this.isMasterMuted) {
                this.unlockAudio();
            }

            if (this.activeSource) {
                this._applyAudioToSource(this.activeSource, true);
            }

            this._updateMuteUI();
            return this.isMasterMuted;
        }

        /**
         * Ustawienie głośności emisyjnej (0.0 do 1.0)
         */
        setMasterVolume(vol) {
            this.masterVolume = Math.max(0, Math.min(1, vol));
            if (this.masterGainNode && this.audioCtx) {
                const effective = this.isMasterMuted ? 0 : this.masterVolume;
                this.masterGainNode.gain.setValueAtTime(effective, this.audioCtx.currentTime);
            }
            if (this.activeSource) {
                this._applyAudioToSource(this.activeSource, true);
            }
        }

        _updateMuteUI() {
            const icon = document.getElementById('globalMuteIcon');
            const btn = document.getElementById('globalMuteBtn');
            if (icon) {
                if (this.isMasterMuted) {
                    icon.className = 'fa-solid fa-volume-xmark';
                    icon.style.color = '#ef4444';
                } else {
                    icon.className = 'fa-solid fa-volume-high';
                    icon.style.color = '#facc15';
                }
            }
            if (btn) {
                btn.setAttribute('aria-label', this.isMasterMuted ? 'Włącz dźwięk' : 'Wycisz dźwięk');
                btn.title = this.isMasterMuted ? 'Dźwięk wyciszony (Kliknij, aby włączyć)' : 'Dźwięk aktywny (Kliknij, aby wyciszyć)';
            }
        }
    }

    // Singleton Reżysera Dźwięku
    window.AudioDirector = new AudioMasterDirector();

})(window);
