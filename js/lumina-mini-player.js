/**
 * ══════════════════════════════════════════════════════════════════════════
 * LUMINA PERSISTENT MINI-PLAYER (js/lumina-mini-player.js)
 * Standard Dynamic Island / Spotify-grade Audio Experience dla Portalu LUMINA
 * ══════════════════════════════════════════════════════════════════════════
 */

(function () {
    'use strict';

    if (window.LuminaMiniPlayer) {
        return; // Już zainicjalizowany
    }

    const STATIONS = [
        {
            id: 'radiocc',
            name: 'Polskie Radio CC',
            sub: 'Muzyka Uwielbienia & Słowo 24/7',
            streamUrl: 'https://stream.zeno.fm/vz96pvl3pnktv',
            logo: 'logo_radio_cc.jpg'
        },
        {
            id: 'radiobiblia',
            name: 'Radio Biblia Audio',
            sub: 'Pismo Święte Dzień i Noc',
            streamUrl: 'https://stream.zeno.fm/imo45hqnshyuv',
            logo: 'logo-biblia-audio.jpg'
        },
        {
            id: 'radioglobal',
            name: 'Radio Global Praise',
            sub: 'Worship Without Ceasing 24/7',
            streamUrl: 'https://stream.zeno.fm/umej2cuqncluv',
            logo: 'worship_logo_thumb.jpg'
        }
    ];

    const STORAGE_KEY = 'lumina_mini_player_state_v1';

    let audioEl = null;
    let containerEl = null;
    let stationsPopupEl = null;
    let isPlaying = false;
    let isMinimized = false;
    let currentStationIndex = 0;

    // Odczyt zapisanego stanu
    function loadSavedState() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const data = JSON.parse(raw);
                if (data.stationId) {
                    const idx = STATIONS.findIndex(s => s.id === data.stationId);
                    if (idx !== -1) currentStationIndex = idx;
                }
                if (typeof data.isMinimized === 'boolean') {
                    isMinimized = data.isMinimized;
                }
            }
        } catch (e) {
            console.warn('[LuminaMiniPlayer] Błąd odczytu stanu:', e);
        }
    }

    function saveState() {
        try {
            const data = {
                stationId: STATIONS[currentStationIndex].id,
                isMinimized: isMinimized
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            // ignore
        }
    }

    // Inicjalizacja elementu Audio
    function initAudio() {
        audioEl = document.getElementById('luminaGlobalAudio');
        if (!audioEl) {
            audioEl = document.createElement('audio');
            audioEl.id = 'luminaGlobalAudio';
            audioEl.preload = 'none';
            audioEl.setAttribute('playsinline', 'true');
            audioEl.setAttribute('webkit-playsinline', 'true');
            document.body.appendChild(audioEl);
        }

        audioEl.addEventListener('playing', () => {
            isPlaying = true;
            updateUI();
            setupMediaSession();
        });

        audioEl.addEventListener('pause', () => {
            isPlaying = false;
            updateUI();
            setupMediaSession();
        });

        audioEl.addEventListener('error', (err) => {
            console.warn('[LuminaMiniPlayer] Błąd strumienia audio:', err);
            isPlaying = false;
            updateUI();
        });
    }

    // MediaSession API (ekran blokady i powiadomienia smartfona)
    function setupMediaSession() {
        if (!('mediaSession' in navigator)) return;

        const station = STATIONS[currentStationIndex];
        try {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: station.name,
                artist: 'Christian Culture • Na Żywo 24/7',
                album: 'LUMINA Radio & Słowo',
                artwork: [
                    { src: station.logo, sizes: '96x96', type: 'image/jpeg' },
                    { src: station.logo, sizes: '192x192', type: 'image/jpeg' },
                    { src: station.logo, sizes: '512x512', type: 'image/jpeg' }
                ]
            });

            navigator.mediaSession.setActionHandler('play', () => LuminaMiniPlayer.play());
            navigator.mediaSession.setActionHandler('pause', () => LuminaMiniPlayer.pause());
            navigator.mediaSession.setActionHandler('stop', () => LuminaMiniPlayer.pause());
            navigator.mediaSession.setActionHandler('nexttrack', () => LuminaMiniPlayer.nextStation());
            navigator.mediaSession.setActionHandler('previoustrack', () => LuminaMiniPlayer.prevStation());
        } catch (e) {
            // ignore
        }
    }

    // Budowa DOM Playera
    function renderPlayerDOM() {
        if (document.getElementById('luminaMiniPlayerContainer')) {
            containerEl = document.getElementById('luminaMiniPlayerContainer');
            return;
        }

        const station = STATIONS[currentStationIndex];

        containerEl = document.createElement('div');
        containerEl.id = 'luminaMiniPlayerContainer';
        if (isMinimized) containerEl.classList.add('minimized');

        containerEl.innerHTML = `
            <div class="lmp-left" onclick="window.LuminaMiniPlayer.onLeftClick(event)" title="${station.name}">
                <div class="lmp-cover-wrap">
                    <img src="${station.logo}" alt="${station.name}" class="lmp-cover-img" id="lmpCoverImg" onerror="this.src='logo_radio_cc.jpg'">
                    <div class="lmp-mini-play-indicator" id="lmpMiniPlayIndicator">
                        <i class="fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'}"></i>
                    </div>
                </div>
                <div class="lmp-info">
                    <div class="lmp-title-row">
                        <span class="lmp-title" id="lmpTitle">${station.name}</span>
                        <span class="lmp-live-badge"><span class="lmp-live-dot"></span> LIVE</span>
                        <span class="lmp-equalizer" aria-hidden="true">
                            <span class="lmp-eq-bar"></span>
                            <span class="lmp-eq-bar"></span>
                            <span class="lmp-eq-bar"></span>
                        </span>
                    </div>
                    <span class="lmp-subtitle" id="lmpSubtitle">${station.sub}</span>
                </div>
            </div>

            <div class="lmp-controls">
                <button type="button" class="lmp-btn-stations" onclick="window.LuminaMiniPlayer.toggleStationsPopup(event)" title="Wybierz stację radiową" aria-label="Wybierz stację radiową">
                    <i class="fa-solid fa-tower-broadcast"></i>
                </button>
                <button type="button" class="lmp-btn-play" id="lmpBtnPlay" onclick="window.LuminaMiniPlayer.toggle(event)" title="Odtwórz / Zatrzymaj" aria-label="Odtwórz lub zatrzymaj radio">
                    <i class="fa-solid fa-play" id="lmpPlayIcon"></i>
                </button>
                <button type="button" class="lmp-btn-minimize" onclick="window.LuminaMiniPlayer.minimize(event)" title="Zwiń do małej ikony" aria-label="Zwiń odtwarzacz">
                    <i class="fa-solid fa-chevron-down"></i>
                </button>
            </div>

            <!-- Rozwijany wybór stacji -->
            <div class="lmp-stations-popup" id="lmpStationsPopup" onclick="event.stopPropagation()">
                <div style="font-size:0.75rem;font-weight:800;color:#facc15;padding:4px 8px 6px;text-transform:uppercase;letter-spacing:0.5px;font-family:'Outfit',sans-serif;display:flex;align-items:center;justify-content:space-between;">
                    <span>Wybierz Stację Radia CC</span>
                    <button type="button" onclick="window.LuminaMiniPlayer.closeStationsPopup()" style="background:none;border:none;color:#94a3b8;cursor:pointer;font-size:0.8rem;"><i class="fa-solid fa-xmark"></i></button>
                </div>
                ${STATIONS.map((s, idx) => `
                    <button type="button" class="lmp-station-option ${idx === currentStationIndex ? 'active' : ''}" onclick="window.LuminaMiniPlayer.selectStation(${idx}, event)">
                        <img src="${s.logo}" alt="${s.name}" class="lmp-station-option-img" onerror="this.src='logo_radio_cc.jpg'">
                        <div class="lmp-station-option-info">
                            <div class="lmp-station-option-title">${s.name}</div>
                            <div class="lmp-station-option-sub">${s.sub}</div>
                        </div>
                        <i class="fa-solid fa-check lmp-station-option-badge"></i>
                    </button>
                `).join('')}
            </div>
        `;

        document.body.appendChild(containerEl);
        stationsPopupEl = document.getElementById('lmpStationsPopup');

        // Zamknięcie popupu przy kliknięciu poza nim
        document.addEventListener('click', (e) => {
            if (stationsPopupEl && stationsPopupEl.classList.contains('active')) {
                if (!stationsPopupEl.contains(e.target) && !e.target.closest('.lmp-btn-stations')) {
                    stationsPopupEl.classList.remove('active');
                }
            }
        });
    }

    // Aktualizacja wizualna
    function updateUI() {
        if (!containerEl) return;

        const station = STATIONS[currentStationIndex];

        const titleEl = document.getElementById('lmpTitle');
        const subEl = document.getElementById('lmpSubtitle');
        const coverEl = document.getElementById('lmpCoverImg');
        const playIcon = document.getElementById('lmpPlayIcon');
        const miniPlayIndicator = document.getElementById('lmpMiniPlayIndicator');

        if (titleEl) titleEl.textContent = station.name;
        if (subEl) subEl.textContent = station.sub;
        if (coverEl && coverEl.getAttribute('src') !== station.logo) {
            coverEl.src = station.logo;
        }

        if (isPlaying) {
            containerEl.classList.add('playing');
            if (playIcon) {
                playIcon.className = 'fa-solid fa-pause';
            }
            if (miniPlayIndicator) {
                miniPlayIndicator.innerHTML = '<i class="fa-solid fa-pause"></i>';
            }
        } else {
            containerEl.classList.remove('playing');
            if (playIcon) {
                playIcon.className = 'fa-solid fa-play';
            }
            if (miniPlayIndicator) {
                miniPlayIndicator.innerHTML = '<i class="fa-solid fa-play"></i>';
            }
        }

        // Aktualizacja listy wyboru stacji
        if (stationsPopupEl) {
            const options = stationsPopupEl.querySelectorAll('.lmp-station-option');
            options.forEach((opt, idx) => {
                if (idx === currentStationIndex) {
                    opt.classList.add('active');
                } else {
                    opt.classList.remove('active');
                }
            });
        }

        saveState();
    }

    // Publiczne API Playera
    const LuminaMiniPlayer = {
        play: function (stationId) {
            if (stationId) {
                const idx = STATIONS.findIndex(s => s.id === stationId);
                if (idx !== -1) currentStationIndex = idx;
            }

            const station = STATIONS[currentStationIndex];
            if (!audioEl) initAudio();

            // Ustaw źródło jeśli inne
            if (audioEl.src !== station.streamUrl) {
                audioEl.src = station.streamUrl;
                audioEl.load();
            }

            const playPromise = audioEl.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    isPlaying = true;
                    updateUI();
                }).catch(err => {
                    console.warn('[LuminaMiniPlayer] Autoplay zablokowany przez przeglądarkę:', err);
                    isPlaying = false;
                    updateUI();
                });
            }
        },

        pause: function () {
            if (!audioEl) return;
            audioEl.pause();
            isPlaying = false;
            updateUI();
        },

        toggle: function (e) {
            if (e && e.stopPropagation) e.stopPropagation();
            if (isPlaying) {
                this.pause();
            } else {
                this.play();
            }
        },

        selectStation: function (index, e) {
            if (e && e.stopPropagation) e.stopPropagation();
            if (index >= 0 && index < STATIONS.length) {
                currentStationIndex = index;
                this.closeStationsPopup();
                this.play();
            }
        },

        nextStation: function () {
            currentStationIndex = (currentStationIndex + 1) % STATIONS.length;
            this.play();
        },

        prevStation: function () {
            currentStationIndex = (currentStationIndex - 1 + STATIONS.length) % STATIONS.length;
            this.play();
        },

        minimize: function (e) {
            if (e && e.stopPropagation) e.stopPropagation();
            isMinimized = true;
            if (containerEl) containerEl.classList.add('minimized');
            this.closeStationsPopup();
            saveState();
        },

        expand: function () {
            isMinimized = false;
            if (containerEl) containerEl.classList.remove('minimized');
            saveState();
        },

        onLeftClick: function (e) {
            if (isMinimized) {
                this.expand();
            } else {
                this.toggle(e);
            }
        },

        toggleStationsPopup: function (e) {
            if (e && e.stopPropagation) e.stopPropagation();
            if (!stationsPopupEl) return;
            stationsPopupEl.classList.toggle('active');
        },

        closeStationsPopup: function () {
            if (stationsPopupEl) stationsPopupEl.classList.remove('active');
        },

        getCurrentStation: function () {
            return STATIONS[currentStationIndex];
        },

        isPlaying: function () {
            return isPlaying;
        }
    };

    window.LuminaMiniPlayer = LuminaMiniPlayer;

    // Start po załadowaniu DOM
    function bootstrap() {
        loadSavedState();
        initAudio();
        renderPlayerDOM();
        updateUI();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bootstrap);
    } else {
        bootstrap();
    }
})();
