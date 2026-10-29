/**
 * Gerald Welch Showcase Application Script
 * Christian Culture Network (CCN)
 */

(() => {
  'use strict';

  // 1. Odliczanie do oficjalnej premiery radiowej WORLD WAR YOU: 20 listopada 2026
  const PREMIERE_DATE = new Date('2026-11-20T00:00:00Z').getTime();

  function updateCountdown() {
    const now = Date.now();
    const diff = PREMIERE_DATE - now;

    const daysEl = document.getElementById('gwDays');
    const hoursEl = document.getElementById('gwHours');
    const minsEl = document.getElementById('gwMins');
    const secsEl = document.getElementById('gwSecs');

    if (!daysEl || !hoursEl || !minsEl || !secsEl) return;

    if (diff <= 0) {
      daysEl.textContent = '00';
      hoursEl.textContent = '00';
      minsEl.textContent = '00';
      secsEl.textContent = '00';
      const statusTitle = document.getElementById('gwPremiereStatus');
      if (statusTitle) {
        const lang = document.documentElement.lang || 'pl';
        statusTitle.textContent = lang === 'en' ? 'Radio Broadcast Premiere Available' : 'Premiera na antenie radiowej';
      }
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    const secs = Math.floor((diff / 1000) % 60);

    daysEl.textContent = String(days).padStart(2, '0');
    hoursEl.textContent = String(hours).padStart(2, '0');
    minsEl.textContent = String(mins).padStart(2, '0');
    secsEl.textContent = String(secs).padStart(2, '0');
  }

  // 2. Inicjalizacja odliczania
  updateCountdown();
  const timer = setInterval(updateCountdown, 1000);
  window.addEventListener('unload', () => clearInterval(timer));

  // 3. Obsługa płynnego przewijania
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId && targetId !== '#') {
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          targetEl.scrollIntoView({ behavior: 'smooth' });
          targetEl.focus({ preventScroll: true });
        }
      }
    });
  });

  // 4. Panel krawędziowy EkoCC fallback trigger bridge
  const edgeBtn = document.getElementById('gwEdgeTriggerBtn');
  if (edgeBtn) {
    edgeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const existingTrigger = document.querySelector('.cc-mobile-edge-trigger:not(#gwEdgeTriggerBtn)');
      if (existingTrigger) {
        existingTrigger.click();
      } else if (window.CCMobileEdge && typeof window.CCMobileEdge.mount === 'function') {
        const dialog = document.getElementById('cc-mobile-edge-dialog');
        if (dialog && typeof dialog.showModal === 'function') {
          dialog.showModal();
        }
      }
    });
  }

  // 5. Radio CC Global — Oficjalny strumień na żywo (https://stream.zeno.fm/umej2cuqncluv)
  const CC_GLOBAL_STREAM_URL = 'https://stream.zeno.fm/umej2cuqncluv';
  const audioEl = document.getElementById('gwGlobalAudio');
  const playBtn = document.getElementById('gwRadioPlayBtn');
  const tuneBtn = document.getElementById('gwTuneInBtn');
  const radioBar = document.getElementById('gwRadioBar');
  const statusEl = document.getElementById('gwRadioStatus');
  const btnTextEl = playBtn ? playBtn.querySelector('.gw-radio-btn-text') : null;

  const isEn = (document.documentElement.lang || 'pl').toLowerCase().startsWith('en');
  const labels = {
    play: isEn ? 'Listen Live' : 'Słuchaj na żywo',
    pause: isEn ? 'Pause Stream' : 'Zatrzymaj',
    connecting: isEn ? 'Connecting...' : 'Łączenie...',
    live: isEn ? 'Live Broadcast' : 'Emisja na żywo',
    paused: isEn ? 'Paused' : 'Zatrzymano',
    error: isEn ? 'Stream unavailable' : 'Strumień chwilowo niedostępny'
  };

  function setPlayingState(isPlaying) {
    if (playBtn) {
      playBtn.classList.toggle('is-playing', isPlaying);
      playBtn.setAttribute('aria-pressed', isPlaying ? 'true' : 'false');
      if (btnTextEl) {
        btnTextEl.textContent = isPlaying ? labels.pause : labels.play;
      }
    }
    if (radioBar) {
      radioBar.classList.toggle('is-playing', isPlaying);
    }
    if (statusEl) {
      statusEl.textContent = isPlaying ? labels.live : labels.paused;
    }
  }

  function toggleRadio() {
    if (!audioEl) return;

    if (!audioEl.src || audioEl.src === '' || audioEl.src === window.location.href) {
      audioEl.src = CC_GLOBAL_STREAM_URL;
    }

    if (audioEl.paused) {
      // Shared anti-double-audio: notify ecosystem and pause any other radio elements
      window.dispatchEvent(new CustomEvent('cc:radio-start', { detail: { source: 'welch-radio' } }));
      document.querySelectorAll('audio').forEach(a => {
        if (a !== audioEl && !a.paused) a.pause();
      });

      if (statusEl) statusEl.textContent = labels.connecting;
      const playPromise = audioEl.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setPlayingState(true);
          })
          .catch((err) => {
            console.warn('[Radio CC Global] Play interrupted or blocked:', err);
            setPlayingState(false);
            if (statusEl) statusEl.textContent = labels.error;
          });
      }
    } else {
      audioEl.pause();
      setPlayingState(false);
    }
  }

  if (playBtn) {
    playBtn.addEventListener('click', toggleRadio);
  }

  if (tuneBtn) {
    tuneBtn.addEventListener('click', () => {
      if (audioEl && audioEl.paused) {
        toggleRadio();
      }
      if (radioBar) {
        radioBar.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }

  if (audioEl) {
    audioEl.addEventListener('playing', () => setPlayingState(true));
    audioEl.addEventListener('pause', () => setPlayingState(false));
    audioEl.addEventListener('waiting', () => {
      if (statusEl) statusEl.textContent = labels.connecting;
    });
    audioEl.addEventListener('error', () => {
      setPlayingState(false);
      if (statusEl) statusEl.textContent = labels.error;
    });

    // Listen for other audio activations across Christian Culture Network
    window.addEventListener('cc:radio-start', (e) => {
      if (e.detail?.source !== 'welch-radio' && !audioEl.paused) {
        audioEl.pause();
        setPlayingState(false);
      }
    });
  }
})();
