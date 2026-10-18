/**
 * CC MEDIA MUTEX & SMART TV CONTROLLER
 * Globalny zarządca wyłączności dźwięku (Zero Audio Overlap) oraz
 * kontroler nawigacji kierunkowej D-Pad dla Smart TV.
 *
 * Standard: JOMA-D005 / @CC-CODE-ARCHITECT / Zero-QA Dowódcy
 */
(function (root) {
  'use strict';

  const CHANNEL_NAME = 'cc_media_mutex_bus';
  const STORAGE_KEY = 'cc_active_media_session';

  let broadcast = null;
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      broadcast = new BroadcastChannel(CHANNEL_NAME);
    }
  } catch (e) {
    broadcast = null;
  }

  function pauseLocalMedia(exceptSenderId) {
    // 1. Wycisz i zatrzymaj wszystkie lokalne tagi <audio>
    document.querySelectorAll('audio').forEach((audio) => {
      if (audio.dataset.mediaSenderId === exceptSenderId) return;
      if (!audio.paused) {
        audio.__wasPausedByMutex = true;
        try {
          // Płynne wyciszenie (fade-out 150ms) przed pauzą
          const initialVol = audio.volume;
          audio.volume = Math.max(0, initialVol * 0.2);
          setTimeout(() => {
            audio.pause();
            audio.volume = initialVol;
          }, 150);
        } catch {
          audio.pause();
        }
      }
    });

    // 2. Zatrzymaj lokalne tagi <video> (poza nadawcą)
    document.querySelectorAll('video').forEach((video) => {
      if (video.dataset.mediaSenderId === exceptSenderId) return;
      if (!video.paused) {
        video.__wasPausedByMutex = true;
        video.pause();
      }
    });

    // 3. Rozgłoś zdarzenie wewnętrzne dla odtwarzaczy JS (np. Zeno iframe / WebAudio)
    window.dispatchEvent(
      new CustomEvent('cc-media-mutex-pause', {
        detail: { exceptSenderId },
      })
    );
  }

  // Nasłuch na komunikaty międzykartowe
  if (broadcast) {
    broadcast.onmessage = (event) => {
      const data = event.data;
      if (data && data.action === 'play') {
        pauseLocalMedia(data.senderId);
      }
    };
  }

  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY && event.newValue) {
      try {
        const data = JSON.parse(event.newValue);
        if (data && data.action === 'play') {
          pauseLocalMedia(data.senderId);
        }
      } catch {}
    }
  });

  // Globalne API
  const ccMediaMutex = {
    requestPlay(senderId, metadata = {}) {
      pauseLocalMedia(senderId);

      const payload = {
        action: 'play',
        senderId,
        metadata,
        timestamp: Date.now(),
      };

      if (broadcast) {
        try {
          broadcast.postMessage(payload);
        } catch {}
      }

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      } catch {}

      // Integracja z MediaSession API
      if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
        if (metadata.title) {
          navigator.mediaSession.metadata = new MediaMetadata({
            title: metadata.title,
            artist: metadata.artist || 'Christian Culture',
            album: metadata.album || 'polskieradio.cc',
            artwork: metadata.artwork || [
              { src: 'https://polskieradio.cc/logo_vod_cc.jpg', sizes: '512x512', type: 'image/jpeg' },
            ],
          });
        }
        navigator.mediaSession.playbackState = 'playing';
      }
    },

    release(senderId) {
      const payload = {
        action: 'release',
        senderId,
        timestamp: Date.now(),
      };

      if (broadcast) {
        try {
          broadcast.postMessage(payload);
        } catch {}
      }

      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {}

      window.dispatchEvent(
        new CustomEvent('cc-media-mutex-release', {
          detail: { senderId },
        })
      );
    },

    /**
     * D-Pad / Smart TV Spatial Navigation
     * Automatyczna obsługa pilotów TV dla elementów z klasą lub selektorem
     */
    initSmartTVNavigation(options = {}) {
      const focusSelector =
        options.focusSelector ||
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"]), .movie-card';

      // Dodanie złotego stylu :focus-visible dla Smart TV
      if (!document.getElementById('cc-smart-tv-styles')) {
        const style = document.createElement('style');
        style.id = 'cc-smart-tv-styles';
        style.textContent = `
          :focus-visible, .tv-focused {
            outline: 3px solid #D4AF37 !important;
            outline-offset: 4px !important;
            box-shadow: 0 0 25px rgba(212, 175, 55, 0.75) !important;
            border-radius: 8px;
            transition: transform 0.15s ease, box-shadow 0.15s ease !important;
          }
          .movie-card:focus-visible, .movie-card.tv-focused {
            transform: scale(1.05) !important;
            z-index: 50 !important;
          }
        `;
        document.head.appendChild(style);
      }

      window.addEventListener('keydown', (e) => {
        const key = e.key;
        // Klawisze Smart TV: strzałki, OK/Enter, Back/Escape
        const isArrow = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key);
        const isEnter = key === 'Enter' || e.keyCode === 13;
        const isBack = key === 'Escape' || e.keyCode === 27 || e.keyCode === 10009 || key === 'GoBack';

        if (isBack) {
          // Zamknij ewentualny modal
          const openModal = document.querySelector('.modal.open, #cinemaModal.open, #detailModal.open');
          if (openModal) {
            e.preventDefault();
            if (typeof window.closeCinemaModal === 'function') window.closeCinemaModal();
            if (typeof window.closeDetailModal === 'function') window.closeDetailModal();
            return;
          }
        }

        if (!isArrow && !isEnter) return;

        const focusables = Array.from(document.querySelectorAll(focusSelector)).filter((el) => {
          return (
            el.offsetParent !== null &&
            !el.disabled &&
            getComputedStyle(el).visibility !== 'hidden' &&
            getComputedStyle(el).display !== 'none'
          );
        });

        if (focusables.length === 0) return;

        let current = document.activeElement;
        let currentIndex = focusables.indexOf(current);

        if (currentIndex === -1) {
          // Jeśli nic nie jest zaznaczone, zaznacz pierwszy widoczny element
          focusables[0].focus();
          e.preventDefault();
          return;
        }

        if (isEnter) {
          // Aktywuj zaznaczony element
          current.click();
          return;
        }

        let nextIndex = currentIndex;
        if (key === 'ArrowRight') {
          nextIndex = (currentIndex + 1) % focusables.length;
        } else if (key === 'ArrowLeft') {
          nextIndex = (currentIndex - 1 + focusables.length) % focusables.length;
        } else if (key === 'ArrowDown') {
          // Szukaj elementu znajdującego się fizycznie poniżej
          const currentRect = current.getBoundingClientRect();
          let bestEl = null;
          let bestDist = Infinity;
          focusables.forEach((el) => {
            const r = el.getBoundingClientRect();
            if (r.top > currentRect.bottom - 10) {
              const dist = Math.hypot(r.left - currentRect.left, r.top - currentRect.top);
              if (dist < bestDist) {
                bestDist = dist;
                bestEl = el;
              }
            }
          });
          if (bestEl) nextIndex = focusables.indexOf(bestEl);
          else nextIndex = Math.min(currentIndex + 4, focusables.length - 1);
        } else if (key === 'ArrowUp') {
          // Szukaj elementu znajdującego się fizycznie powyżej
          const currentRect = current.getBoundingClientRect();
          let bestEl = null;
          let bestDist = Infinity;
          focusables.forEach((el) => {
            const r = el.getBoundingClientRect();
            if (r.bottom < currentRect.top + 10) {
              const dist = Math.hypot(r.left - currentRect.left, r.top - currentRect.top);
              if (dist < bestDist) {
                bestDist = dist;
                bestEl = el;
              }
            }
          });
          if (bestEl) nextIndex = focusables.indexOf(bestEl);
          else nextIndex = Math.max(currentIndex - 4, 0);
        }

        if (nextIndex !== currentIndex && focusables[nextIndex]) {
          e.preventDefault();
          focusables[nextIndex].focus();
          focusables[nextIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
        }
      });
    },
  };

  root.ccMediaMutex = ccMediaMutex;

  // Auto-init Smart TV jeśli jesteśmy w środowisku o dużej rozdzielczości lub zdefiniowano smart-tv
  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
      // Inicjalizuj Smart TV navigation jeśli URL to /vod lub /smart-tv
      if (
        window.location.pathname.includes('/vod') ||
        window.location.pathname.includes('/smart-tv') ||
        document.body.classList.contains('smart-tv-view')
      ) {
        ccMediaMutex.initSmartTVNavigation();
      }
    });
  }
})(typeof window !== 'undefined' ? window : globalThis);
