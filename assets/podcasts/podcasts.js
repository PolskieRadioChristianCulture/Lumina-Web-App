/**
 * ============================================================================
 * CHRISTIAN CULTURE NETWORK — PODCASTS CONTROLLER 2026
 * assets/podcasts/podcasts.js
 * 
 * Moduł aplikacji /podcasty (polskieradio.cc/podcasty)
 * Architektura: Zero Cost, Zero Regression, WCAG AA, Mobile Touch >= 44px
 * Styl: Dark Navy (#071321), Card (#0d2031), Champagne Gold (#c4a35a)
 * ============================================================================
 */

(function () {
  'use strict';

  const CATALOG_URL = '/data/podcasts/catalog.json';
  const WAVEFORM_SLICES_COUNT = 36;

  // App State
  const state = {
    catalog: null,
    activeCategory: 'all',
    searchQuery: '',
    currentTrack: null,
    isPlaying: false,
    playbackRate: 1.0,
    volume: 1.0,
    isMuted: false,
    favorites: new Set(),
    history: [],
    queue: [],
    queueIndex: 0
  };

  // Audio Engine
  const audio = new Audio();
  audio.preload = 'metadata';

  // DOM Elements cache
  const el = {};

  async function init() {
    cacheDom();
    loadPersistedState();
    createWaveformSlices();
    setupAudioListeners();
    setupEventListeners();
    await loadCatalog();
    renderAll();
    setupMediaSession();
  }

  function cacheDom() {
    el.app = document.getElementById('cc-podcast-app');
    el.searchInput = document.getElementById('podcast-search-input');
    el.searchClear = document.getElementById('podcast-search-clear');
    el.filterBar = document.getElementById('category-filter-bar');
    el.seriesGrid = document.getElementById('series-grid');
    el.episodesList = document.getElementById('episodes-list');
    el.spotifyGrid = document.getElementById('spotify-grid');
    el.continueList = document.getElementById('continue-list');
    el.topicsList = document.getElementById('topics-list');

    // Hero elements
    el.heroFeaturedCard = document.getElementById('hero-featured-card');
    el.heroFeaturedPlay = document.getElementById('hero-featured-play');
    el.heroFeaturedTitle = document.getElementById('hero-featured-title');
    el.heroFeaturedDesc = document.getElementById('hero-featured-desc');
    el.heroFeaturedTag = document.getElementById('hero-featured-tag');
    el.heroFeaturedTime = document.getElementById('hero-featured-time');
    el.heroFeaturedBg = document.getElementById('hero-featured-bg');

    // Master Player Bar
    el.playerBar = document.getElementById('master-player-bar');
    el.playerThumb = document.getElementById('player-thumb');
    el.playerTitle = document.getElementById('player-title');
    el.playerSeries = document.getElementById('player-series');
    el.playerFavBtn = document.getElementById('player-fav-btn');
    el.playerPlayBtn = document.getElementById('player-btn-play');
    el.playerPrevBtn = document.getElementById('player-btn-prev');
    el.playerNextBtn = document.getElementById('player-btn-next');
    el.playerSpeedBtn = document.getElementById('player-btn-speed');
    el.playerVolBtn = document.getElementById('player-btn-vol');
    el.playerVolSlider = document.getElementById('player-vol-slider');
    el.timeCurrent = document.getElementById('player-time-cur');
    el.timeDuration = document.getElementById('player-time-dur');
    el.waveformBar = document.getElementById('player-waveform-bar');

    // Embed Drawer / Modal
    el.embedModal = document.getElementById('embed-modal');
    el.embedTitle = document.getElementById('embed-modal-title');
    el.embedBadge = document.getElementById('embed-modal-badge');
    el.embedCloseBtn = document.getElementById('embed-modal-close');
    el.embedBody = document.getElementById('embed-modal-body');
    el.embedExtLink = document.getElementById('embed-modal-ext-link');
  }

  function loadPersistedState() {
    try {
      const savedFavs = localStorage.getItem('cc_podcasts_favorites');
      if (savedFavs) {
        state.favorites = new Set(JSON.parse(savedFavs));
      }
      const savedHist = localStorage.getItem('cc_podcasts_history');
      if (savedHist) {
        state.history = JSON.parse(savedHist);
      }
      const savedVol = localStorage.getItem('cc_podcasts_volume');
      if (savedVol !== null) {
        state.volume = parseFloat(savedVol);
        audio.volume = state.volume;
        if (el.playerVolSlider) el.playerVolSlider.value = state.volume;
      }
    } catch (e) {
      console.warn('Storage read failed:', e);
    }
  }

  function persistFavorites() {
    try {
      localStorage.setItem('cc_podcasts_favorites', JSON.stringify(Array.from(state.favorites)));
    } catch (e) {
      console.warn('Storage write failed:', e);
    }
  }

  function persistHistory() {
    try {
      localStorage.setItem('cc_podcasts_history', JSON.stringify(state.history.slice(0, 10)));
    } catch (e) {
      console.warn('Storage write failed:', e);
    }
  }

  function createWaveformSlices() {
    if (!el.waveformBar) return;
    el.waveformBar.innerHTML = '';
    const heights = [6, 10, 14, 8, 12, 16, 14, 18, 12, 16, 14, 10, 8, 14, 16, 18, 14, 12, 10, 14, 18, 16, 12, 8, 10, 14, 16, 12, 10, 8, 12, 14, 16, 12, 8, 6];
    
    for (let i = 0; i < WAVEFORM_SLICES_COUNT; i++) {
      const slice = document.createElement('div');
      slice.className = 'cc-waveform-slice';
      const h = heights[i % heights.length];
      slice.style.setProperty('--h', `${h}px`);
      slice.dataset.index = i;
      el.waveformBar.appendChild(slice);
    }
  }

  async function loadCatalog() {
    try {
      const res = await fetch(CATALOG_URL);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      state.catalog = await res.json();
    } catch (err) {
      console.error('Failed to load catalog.json:', err);
      state.catalog = {
        featured: null,
        recommendedSeries: [],
        episodes: [],
        googleDriveAudio: [],
        spotifyShow: [],
        spotifyArtist: [],
        spotifyAlbums: [],
        topics: [],
        continueListening: []
      };
    }

    if (state.catalog && state.catalog.featured) {
      state.currentTrack = state.catalog.featured;
      updatePlayerMeta(state.catalog.featured, false);
      buildQueue();
    }
  }

  function buildQueue() {
    if (!state.catalog) return;
    const list = [];
    if (state.catalog.featured) list.push(state.catalog.featured);
    if (Array.isArray(state.catalog.episodes)) {
      list.push(...state.catalog.episodes);
    }
    state.queue = list;
    if (state.currentTrack) {
      state.queueIndex = state.queue.findIndex(t => t.id === state.currentTrack.id);
      if (state.queueIndex === -1) state.queueIndex = 0;
    }
  }

  function setupAudioListeners() {
    audio.addEventListener('play', () => {
      state.isPlaying = true;
      updatePlayPauseIcons(true);
      if (state.currentTrack) recordHistory(state.currentTrack, audio.currentTime);
    });

    audio.addEventListener('pause', () => {
      state.isPlaying = false;
      updatePlayPauseIcons(false);
      if (state.currentTrack) recordHistory(state.currentTrack, audio.currentTime);
    });

    audio.addEventListener('ended', () => {
      playNext();
    });

    audio.addEventListener('timeupdate', () => {
      if (!audio.duration || isNaN(audio.duration)) return;
      const cur = audio.currentTime;
      const dur = audio.duration;
      const pct = cur / dur;

      if (el.timeCurrent) el.timeCurrent.textContent = formatTime(cur);
      if (el.timeDuration) el.timeDuration.textContent = formatTime(dur);

      // Update Waveform Slices
      if (el.waveformBar) {
        const slices = el.waveformBar.querySelectorAll('.cc-waveform-slice');
        const activeCount = Math.floor(pct * slices.length);
        slices.forEach((slice, idx) => {
          slice.classList.toggle('is-played', idx <= activeCount);
        });
      }

      // Record history intermittently
      if (Math.floor(cur) % 5 === 0 && state.currentTrack) {
        recordHistory(state.currentTrack, cur);
      }
    });

    audio.addEventListener('loadedmetadata', () => {
      if (el.timeDuration) el.timeDuration.textContent = formatTime(audio.duration);
    });

    audio.addEventListener('error', (e) => {
      console.warn('Audio playback error:', e);
      state.isPlaying = false;
      updatePlayPauseIcons(false);
    });
  }

  function setupEventListeners() {
    // Search
    if (el.searchInput) {
      el.searchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value.trim().toLowerCase();
        if (el.searchClear) {
          el.searchClear.style.display = state.searchQuery ? 'block' : 'none';
        }
        renderCatalog();
      });
    }

    if (el.searchClear) {
      el.searchClear.addEventListener('click', () => {
        if (el.searchInput) el.searchInput.value = '';
        state.searchQuery = '';
        el.searchClear.style.display = 'none';
        renderCatalog();
        if (el.searchInput) el.searchInput.focus();
      });
    }

    // Category chips
    if (el.filterBar) {
      el.filterBar.addEventListener('click', (e) => {
        const chip = e.target.closest('.cc-filter-chip');
        if (!chip) return;
        const cat = chip.dataset.category;
        if (!cat) return;

        el.filterBar.querySelectorAll('.cc-filter-chip').forEach(c => c.classList.remove('is-active'));
        chip.classList.add('is-active');

        state.activeCategory = cat;
        renderCatalog();
      });
    }

    // Featured hero play button
    if (el.heroFeaturedPlay) {
      el.heroFeaturedPlay.addEventListener('click', () => {
        if (state.catalog && state.catalog.featured) {
          playTrack(state.catalog.featured);
        }
      });
    }

    // Master Player buttons
    if (el.playerPlayBtn) {
      el.playerPlayBtn.addEventListener('click', () => togglePlayPause());
    }

    if (el.playerPrevBtn) {
      el.playerPrevBtn.addEventListener('click', () => playPrev());
    }

    if (el.playerNextBtn) {
      el.playerNextBtn.addEventListener('click', () => playNext());
    }

    if (el.playerSpeedBtn) {
      el.playerSpeedBtn.addEventListener('click', () => toggleSpeed());
    }

    if (el.playerFavBtn) {
      el.playerFavBtn.addEventListener('click', () => {
        if (state.currentTrack) {
          toggleFavorite(state.currentTrack.id);
          updatePlayerFavBtn();
        }
      });
    }

    // Waveform click to seek
    if (el.waveformBar) {
      el.waveformBar.addEventListener('click', (e) => {
        const rect = el.waveformBar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const pct = Math.max(0, Math.min(1, clickX / rect.width));
        if (audio.duration && !isNaN(audio.duration)) {
          audio.currentTime = pct * audio.duration;
        }
      });
    }

    // Volume Slider & Mute
    if (el.playerVolSlider) {
      el.playerVolSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        state.volume = val;
        audio.volume = val;
        state.isMuted = val === 0;
        updateVolumeIcon();
        try { localStorage.setItem('cc_podcasts_volume', val.toString()); } catch (_) {}
      });
    }

    if (el.playerVolBtn) {
      el.playerVolBtn.addEventListener('click', () => {
        if (audio.volume > 0) {
          state.isMuted = true;
          audio.volume = 0;
          if (el.playerVolSlider) el.playerVolSlider.value = 0;
        } else {
          state.isMuted = false;
          audio.volume = state.volume || 1;
          if (el.playerVolSlider) el.playerVolSlider.value = audio.volume;
        }
        updateVolumeIcon();
      });
    }

    // Embed Modal Close
    if (el.embedCloseBtn) {
      el.embedCloseBtn.addEventListener('click', () => closeEmbedModal());
    }
    if (el.embedModal) {
      el.embedModal.addEventListener('click', (e) => {
        if (e.target === el.embedModal) closeEmbedModal();
      });
    }

    // Keyboard Shortcuts (Space for play/pause, Esc to close modal)
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (el.embedModal && el.embedModal.classList.contains('is-open')) {
          closeEmbedModal();
        }
      } else if (e.key === ' ' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        e.preventDefault();
        togglePlayPause();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (el.searchInput) el.searchInput.focus();
      }
    });
  }

  // Audio Engine Actions
  function playTrack(track, seekTime = 0) {
    if (!track) return;

    if (el.embedModal && el.embedModal.classList.contains('is-open')) {
      closeEmbedModal();
    }

    state.currentTrack = track;
    updatePlayerMeta(track, true);
    buildQueue();

    if (track.audioUrl) {
      if (audio.src !== track.audioUrl) {
        audio.src = track.audioUrl;
        audio.playbackRate = state.playbackRate;
      }
      if (seekTime > 0) {
        audio.currentTime = seekTime;
      }
      audio.play().catch(err => {
        console.warn('Playback prevented:', err);
        state.isPlaying = false;
        updatePlayPauseIcons(false);
      });
    } else if (track.embedUrl) {
      openEmbedModal(track);
    }

    updateActiveRowHighlight();
    updateHeroFeaturedBtn();
    renderContinueListening();
  }

  function togglePlayPause() {
    if (!state.currentTrack) {
      if (state.catalog && state.catalog.featured) {
        playTrack(state.catalog.featured);
      }
      return;
    }

    if (audio.paused) {
      if (!audio.src && state.currentTrack.audioUrl) {
        audio.src = state.currentTrack.audioUrl;
      }
      audio.play().catch(e => console.warn(e));
    } else {
      audio.pause();
    }
  }

  function playPrev() {
    if (!state.queue.length) return;
    state.queueIndex = (state.queueIndex - 1 + state.queue.length) % state.queue.length;
    playTrack(state.queue[state.queueIndex]);
  }

  function playNext() {
    if (!state.queue.length) return;
    state.queueIndex = (state.queueIndex + 1) % state.queue.length;
    playTrack(state.queue[state.queueIndex]);
  }

  function toggleSpeed() {
    const speeds = [1.0, 1.25, 1.5, 2.0];
    const curIdx = speeds.indexOf(state.playbackRate);
    const nextIdx = (curIdx + 1) % speeds.length;
    state.playbackRate = speeds[nextIdx];
    audio.playbackRate = state.playbackRate;
    if (el.playerSpeedBtn) {
      el.playerSpeedBtn.textContent = state.playbackRate + 'x';
    }
  }

  function updateVolumeIcon() {
    if (!el.playerVolBtn) return;
    const isMute = state.isMuted || audio.volume === 0;
    const icon = isMute
      ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>`
      : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>`;
    el.playerVolBtn.innerHTML = icon;
    el.playerVolBtn.setAttribute('aria-label', isMute ? 'Włącz dźwięk' : 'Wycisz dźwięk');
  }

  function updatePlayPauseIcons(isPlaying) {
    const playIcon = `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;
    const pauseIcon = `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>`;

    if (el.playerPlayBtn) {
      el.playerPlayBtn.innerHTML = isPlaying ? pauseIcon : playIcon;
      el.playerPlayBtn.setAttribute('aria-label', isPlaying ? 'Wstrzymaj' : 'Odtwórz');
    }

    updateHeroFeaturedBtn();
    updateActiveRowHighlight();
  }

  function updateHeroFeaturedBtn() {
    if (!el.heroFeaturedPlay || !state.catalog || !state.catalog.featured) return;
    const isFeatActive = state.currentTrack && state.currentTrack.id === state.catalog.featured.id;
    const isPlaying = isFeatActive && state.isPlaying;
    el.heroFeaturedPlay.innerHTML = isPlaying
      ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg> Wstrzymaj`
      : `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg> Odtwórz teraz`;
  }

  function updatePlayerFavBtn() {
    if (!el.playerFavBtn || !state.currentTrack) return;
    const isFav = state.favorites.has(state.currentTrack.id);
    el.playerFavBtn.classList.toggle('is-active', isFav);
    el.playerFavBtn.setAttribute('aria-pressed', isFav.toString());
  }

  function updatePlayerMeta(track) {
    if (!track) return;
    if (el.playerTitle) el.playerTitle.textContent = track.title || 'Audycja Christian Culture';
    if (el.playerSeries) el.playerSeries.textContent = track.series || track.author || 'Christian Culture Network';
    if (el.playerThumb && track.coverUrl) {
      el.playerThumb.src = track.coverUrl;
      el.playerThumb.alt = track.title || 'Okładka audycji';
    }
    updatePlayerFavBtn();
  }

  function updateActiveRowHighlight() {
    const rows = document.querySelectorAll('.cc-episode-row');
    rows.forEach(row => {
      const trackId = row.dataset.trackId;
      const isCur = state.currentTrack && state.currentTrack.id === trackId;
      row.classList.toggle('is-active', isCur);
      const btn = row.querySelector('.cc-ep-play-btn');
      if (btn) {
        if (isCur && state.isPlaying) {
          btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>`;
        } else {
          btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;
        }
      }
    });
  }

  function toggleFavorite(id) {
    if (!id) return;
    if (state.favorites.has(id)) {
      state.favorites.delete(id);
    } else {
      state.favorites.add(id);
    }
    persistFavorites();
    updatePlayerFavBtn();

    if (state.activeCategory === 'favorites') {
      renderCatalog();
    } else {
      document.querySelectorAll(`[data-fav-id="${id}"]`).forEach(btn => {
        btn.classList.toggle('is-active', state.favorites.has(id));
      });
    }
  }

  function recordHistory(track, currentTime) {
    if (!track || !track.id) return;
    const dur = audio.duration || track.durationSec || 1800;
    const progressPct = dur > 0 ? Math.min(100, Math.round((currentTime / dur) * 100)) : 0;

    state.history = state.history.filter(h => h.id !== track.id);
    state.history.unshift({
      id: track.id,
      title: track.title,
      series: track.series || track.author || 'Podcast',
      coverUrl: track.coverUrl,
      currentTime: currentTime,
      duration: track.duration,
      progressPct: progressPct,
      lastPlayed: new Date().toISOString()
    });

    persistHistory();
  }

  function setupMediaSession() {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', () => togglePlayPause());
      navigator.mediaSession.setActionHandler('pause', () => togglePlayPause());
      navigator.mediaSession.setActionHandler('previoustrack', () => playPrev());
      navigator.mediaSession.setActionHandler('nexttrack', () => playNext());
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime && audio.duration) {
          audio.currentTime = details.seekTime;
        }
      });
    }
  }

  // Embed Modal Loader (Spotify & Google Drive)
  function openEmbedModal(item) {
    if (!el.embedModal || !el.embedBody) return;

    if (!audio.paused) {
      audio.pause();
    }

    const isDrive = item.source === 'gdrive';
    if (el.embedTitle) el.embedTitle.textContent = item.title || 'Odtwarzacz mediów';
    if (el.embedBadge) {
      el.embedBadge.textContent = isDrive ? 'Dysk Google Audio' : 'Spotify Platform';
    }

    if (el.embedExtLink) {
      el.embedExtLink.href = item.directUrl || item.externalUrl || '#';
      el.embedExtLink.textContent = isDrive ? 'Otwórz na Dysku Google ↗' : 'Otwórz w Spotify ↗';
    }

    // Build Sandboxed Iframe
    el.embedBody.innerHTML = '';
    const iframe = document.createElement('iframe');
    iframe.src = item.embedUrl;
    iframe.title = item.title || 'Odtwarzacz mediów';
    iframe.loading = 'lazy';

    if (isDrive) {
      iframe.style.height = '160px';
      iframe.allow = 'autoplay';
    } else {
      iframe.style.height = '380px';
      iframe.allow = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
    }

    el.embedBody.appendChild(iframe);
    el.embedModal.classList.add('is-open');
    document.body.style.overflow = 'hidden';

    if (el.embedCloseBtn) el.embedCloseBtn.focus();
  }

  function closeEmbedModal() {
    if (!el.embedModal) return;
    el.embedModal.classList.remove('is-open');
    document.body.style.overflow = '';
    if (el.embedBody) {
      el.embedBody.innerHTML = '';
    }
  }

  // Render Functions
  function renderAll() {
    renderHero();
    renderSeries();
    renderCatalog();
    renderContinueListening();
    renderTopics();
  }

  function renderHero() {
    if (!state.catalog || !state.catalog.featured) return;
    const feat = state.catalog.featured;

    if (el.heroFeaturedTitle) el.heroFeaturedTitle.textContent = feat.title;
    if (el.heroFeaturedDesc) el.heroFeaturedDesc.textContent = feat.subtitle;
    if (el.heroFeaturedTag) el.heroFeaturedTag.textContent = feat.tag;
    if (el.heroFeaturedTime) el.heroFeaturedTime.textContent = feat.duration + ' • ' + feat.author;
    if (el.heroFeaturedBg && feat.coverUrl) {
      el.heroFeaturedBg.src = feat.coverUrl;
    }

    updateHeroFeaturedBtn();
  }

  function renderSeries() {
    if (!el.seriesGrid || !state.catalog || !state.catalog.recommendedSeries) return;
    const series = state.catalog.recommendedSeries;

    el.seriesGrid.innerHTML = series.map(s => `
      <article class="cc-series-card" data-series-id="${escapeHtml(s.id)}" role="button" tabindex="0" aria-label="Wybierz serię ${escapeHtml(s.title)}">
        <div class="cc-series-bg" style="background-image: url('${escapeHtml(s.coverUrl)}');"></div>
        <div class="cc-series-overlay"></div>
        <div class="cc-series-content">
          <span class="cc-series-sub">${escapeHtml(s.subtitle || s.badge)}</span>
          <h3 class="cc-series-title">${escapeHtml(s.title)}</h3>
        </div>
        <div class="cc-series-headphones">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 18v-6a9 9 0 0 1 18 0v6"></path><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path></svg>
        </div>
      </article>
    `).join('');

    el.seriesGrid.querySelectorAll('.cc-series-card').forEach(card => {
      card.addEventListener('click', () => {
        const sid = card.dataset.seriesId;
        const matched = state.catalog.episodes.find(e => e.series && e.series.toLowerCase().includes(sid.replace('series-', '')));
        if (matched) {
          playTrack(matched);
        } else if (state.catalog.episodes && state.catalog.episodes.length) {
          playTrack(state.catalog.episodes[0]);
        }
      });
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') card.click();
      });
    });
  }

  function renderCatalog() {
    if (!state.catalog) return;

    const query = state.searchQuery;
    const cat = state.activeCategory;

    // Filter Episodes
    let filteredEpisodes = Array.isArray(state.catalog.episodes) ? [...state.catalog.episodes] : [];

    if (cat === 'podcast') {
      filteredEpisodes = filteredEpisodes.filter(e => e.category === 'podcast');
    } else if (cat === 'bible') {
      filteredEpisodes = filteredEpisodes.filter(e => e.category === 'bible');
    } else if (cat === 'reflections') {
      filteredEpisodes = filteredEpisodes.filter(e => e.category === 'reflections' || e.category === 'family');
    } else if (cat === 'favorites') {
      filteredEpisodes = filteredEpisodes.filter(e => state.favorites.has(e.id));
    } else if (cat === 'spotify' || cat === 'gdrive') {
      filteredEpisodes = [];
    }

    if (query) {
      filteredEpisodes = filteredEpisodes.filter(e =>
        (e.title && e.title.toLowerCase().includes(query)) ||
        (e.series && e.series.toLowerCase().includes(query)) ||
        (e.description && e.description.toLowerCase().includes(query))
      );
    }

    renderEpisodeRows(filteredEpisodes);

    // Filter External Registry Items (Spotify + Google Drive)
    let externalList = [];
    if (state.catalog.googleDriveAudio) externalList.push(...state.catalog.googleDriveAudio);
    if (state.catalog.spotifyShow) externalList.push(...state.catalog.spotifyShow);
    if (state.catalog.spotifyArtist) externalList.push(...state.catalog.spotifyArtist);
    if (state.catalog.spotifyAlbums) externalList.push(...state.catalog.spotifyAlbums);

    if (cat === 'gdrive') {
      externalList = externalList.filter(item => item.source === 'gdrive');
    } else if (cat === 'spotify') {
      externalList = externalList.filter(item => item.source === 'spotify');
    } else if (cat === 'favorites') {
      externalList = externalList.filter(item => state.favorites.has(item.id));
    } else if (cat === 'bible') {
      externalList = externalList.filter(item => item.category === 'bible' || (item.title && item.title.toLowerCase().includes('biblia')));
    } else if (cat === 'reflections') {
      externalList = externalList.filter(item => item.category === 'reflections' || item.category === 'family');
    }

    if (query) {
      externalList = externalList.filter(item =>
        (item.title && item.title.toLowerCase().includes(query)) ||
        (item.summary && item.summary.toLowerCase().includes(query)) ||
        (item.author && item.author.toLowerCase().includes(query))
      );
    }

    renderSpotifyGrid(externalList);
  }

  function renderEpisodeRows(episodes) {
    if (!el.episodesList) return;

    if (!episodes.length) {
      el.episodesList.innerHTML = `
        <div style="padding: 24px; text-align: center; color: #8da2b5; font-size: 14px;">
          Brak odcinków spełniających wybrane kryteria wyszukiwania.
        </div>
      `;
      return;
    }

    el.episodesList.innerHTML = episodes.map((ep) => {
      const isCur = state.currentTrack && state.currentTrack.id === ep.id;
      const isPlaying = isCur && state.isPlaying;
      const isFav = state.favorites.has(ep.id);

      return `
        <div class="cc-episode-row ${isCur ? 'is-active' : ''}" data-track-id="${escapeHtml(ep.id)}" role="button" tabindex="0">
          <div class="cc-ep-left">
            <button class="cc-ep-play-btn" aria-label="${isPlaying ? 'Wstrzymaj' : 'Odtwórz'} ${escapeHtml(ep.title)}">
              ${isPlaying
                ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>'
                : '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>'
              }
            </button>
            <img src="${escapeHtml(ep.coverUrl)}" alt="${escapeHtml(ep.title)}" class="cc-ep-thumb" loading="lazy" />
            <div class="cc-ep-info">
              <span class="cc-ep-series">${escapeHtml(ep.series || 'Christian Culture')}</span>
              <h4 class="cc-ep-title">${escapeHtml(ep.title)}</h4>
            </div>
          </div>
          <div class="cc-ep-right">
            <span class="cc-ep-duration">${escapeHtml(ep.duration || '30 min')}</span>
            <button class="cc-ep-action-btn ${isFav ? 'is-active' : ''}" data-fav-id="${escapeHtml(ep.id)}" aria-label="Dodaj do ulubionych" aria-pressed="${isFav}">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path></svg>
            </button>
          </div>
        </div>
      `;
    }).join('');

    el.episodesList.querySelectorAll('.cc-episode-row').forEach(row => {
      const tid = row.dataset.trackId;
      const track = episodes.find(e => e.id === tid);

      row.addEventListener('click', (e) => {
        if (e.target.closest('.cc-ep-action-btn')) {
          e.stopPropagation();
          toggleFavorite(tid);
          return;
        }
        if (track) playTrack(track);
      });

      row.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          if (track) playTrack(track);
        }
      });
    });
  }

  function renderSpotifyGrid(items) {
    if (!el.spotifyGrid) return;

    if (!items.length) {
      el.spotifyGrid.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 24px; text-align: center; color: #8da2b5; font-size: 14px;">
          Brak pozycji zewnętrznych spełniających wybrane kryteria.
        </div>
      `;
      return;
    }

    el.spotifyGrid.innerHTML = items.map(item => {
      const isDrive = item.source === 'gdrive';
      const isFav = state.favorites.has(item.id);
      const badgeText = isDrive
        ? 'Dysk Google Audio'
        : (item.sourceType === 'artist' ? 'Artysta Spotify' : (item.sourceType === 'show' ? 'Podcast Spotify' : 'Album Spotify'));

      return `
        <article class="cc-catalog-card" data-item-id="${escapeHtml(item.id)}" role="button" tabindex="0">
          <div class="cc-card-thumb-wrap">
            <img src="${escapeHtml(item.coverUrl)}" alt="${escapeHtml(item.title)}" class="cc-card-thumb" loading="lazy" />
            <span class="cc-card-badge">${escapeHtml(badgeText)}</span>
            <div class="cc-card-play-overlay">
              <div class="cc-card-floating-play">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              </div>
            </div>
          </div>
          <h4 class="cc-card-title">${escapeHtml(item.title)}</h4>
          <span class="cc-card-author">${escapeHtml(item.author || 'Christian Culture')}</span>
          <div class="cc-card-footer">
            <button class="cc-card-btn">${isDrive ? 'Odtwórz w oknie ↗' : 'Otwórz Spotify ↗'}</button>
            <button class="cc-ep-action-btn ${isFav ? 'is-active' : ''}" data-fav-id="${escapeHtml(item.id)}" aria-label="Dodaj do ulubionych" aria-pressed="${isFav}">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path></svg>
            </button>
          </div>
        </article>
      `;
    }).join('');

    el.spotifyGrid.querySelectorAll('.cc-catalog-card').forEach(card => {
      const iid = card.dataset.itemId;
      const item = items.find(i => i.id === iid);

      card.addEventListener('click', (e) => {
        if (e.target.closest('.cc-ep-action-btn')) {
          e.stopPropagation();
          toggleFavorite(iid);
          return;
        }
        if (item) openEmbedModal(item);
      });

      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          if (item) openEmbedModal(item);
        }
      });
    });
  }

  function renderContinueListening() {
    if (!el.continueList) return;

    let list = state.history;
    if (!list.length && state.catalog && state.catalog.continueListening) {
      list = state.catalog.continueListening;
    }

    if (!list.length) {
      el.continueList.innerHTML = `<p style="color: #8da2b5; font-size: 13px;">Brak historii odsłuchu.</p>`;
      return;
    }

    el.continueList.innerHTML = list.slice(0, 3).map(item => `
      <div class="cc-continue-item" data-continue-id="${escapeHtml(item.id)}" role="button" tabindex="0">
        <img src="${escapeHtml(item.coverUrl || '/images/biblijne-uwielbienie/player-thumb-cross.webp')}" alt="${escapeHtml(item.title)}" class="cc-cont-thumb" loading="lazy" />
        <div class="cc-cont-meta">
          <h5 class="cc-cont-title">${escapeHtml(item.title)}</h5>
          <span class="cc-cont-time">${escapeHtml(item.duration || '30 min')} • ${item.progressPct || 40}%</span>
          <div class="cc-cont-progress">
            <div class="cc-cont-progress-bar" style="width: ${item.progressPct || 40}%"></div>
          </div>
        </div>
        <button class="cc-cont-play" aria-label="Wznów słuchanie ${escapeHtml(item.title)}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
        </button>
      </div>
    `).join('');

    el.continueList.querySelectorAll('.cc-continue-item').forEach(card => {
      card.addEventListener('click', () => {
        const cid = card.dataset.continueId;
        const matched = (state.catalog && state.catalog.episodes ? state.catalog.episodes.find(e => e.id === cid) : null) || state.catalog.featured;
        if (matched) {
          const histItem = state.history.find(h => h.id === cid);
          playTrack(matched, histItem ? histItem.currentTime : 0);
        }
      });
    });
  }

  function renderTopics() {
    if (!el.topicsList || !state.catalog || !state.catalog.topics) return;
    const topics = state.catalog.topics;

    el.topicsList.innerHTML = topics.map(t => {
      const topicName = t.title || t.name || 'Temat';
      const topicSlug = t.slug || (t.id ? t.id.replace('topic-', '') : topicName);
      const countLabel = t.count ? t.count : '↗';

      return `
        <div class="cc-topic-pill" data-topic-slug="${escapeHtml(topicSlug)}" role="button" tabindex="0">
          <div class="cc-topic-bg" style="background-image: url('${escapeHtml(t.coverUrl)}');"></div>
          <div class="cc-topic-content">
            <span class="cc-topic-icon">${escapeHtml(t.icon || '🎙️')}</span>
            <span>#${escapeHtml(topicName)}</span>
          </div>
          <span style="font-size: 11px; color: var(--cc-gold); z-index: 2; font-weight: 600;">${countLabel}</span>
        </div>
      `;
    }).join('');

    el.topicsList.querySelectorAll('.cc-topic-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        const slug = pill.dataset.topicSlug;
        if (el.searchInput) {
          el.searchInput.value = slug;
          state.searchQuery = slug.toLowerCase();
          if (el.searchClear) el.searchClear.style.display = 'block';
          renderCatalog();
        }
      });
      pill.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') pill.click();
      });
    });
  }

  // Helpers
  function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.CCPodcastsApp = {
    state,
    playTrack,
    togglePlayPause,
    openEmbedModal,
    closeEmbedModal
  };
})();
