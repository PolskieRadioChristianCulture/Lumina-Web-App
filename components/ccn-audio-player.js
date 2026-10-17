/**
 * CCN AUDIO PLAYER PREMIUM 2026 — REUSABLE ENGINE
 * Obsługuje natywny strumień HTML5 (M4A/AAC/MP3 HTTP 200/206 Range),
 * rzeczywiste szczyty fali dźwiękowej (64-bar PCM peaks), pełną dostępność
 * klawiaturową WCAG (slider), prędkości 0.75x–2x, wyciszenie, głośność,
 * wyłączność jednego grającego odtwarzacza na stronie oraz fallback Google Drive.
 *
 * Standard: CCN Global SEO & AI Search 2026 / ZERO COST / Zero atrap
 */
(function () {
  'use strict';

  const DEFAULT_PEAKS = [
    54, 38, 39, 45, 65, 25, 38, 41, 53, 54, 56, 38, 56, 62, 59, 60,
    63, 44, 47, 49, 64, 60, 59, 67, 49, 65, 56, 80, 71, 56, 53, 53,
    49, 49, 56, 64, 52, 51, 72, 73, 84, 51, 66, 66, 68, 56, 51, 60,
    64, 61, 67, 44, 45, 48, 51, 48, 45, 44, 39, 57, 45, 38, 40, 48
  ];
  const SPEEDS = [0.75, 1, 1.25, 1.5, 1.75, 2];

  function formatTime(sec) {
    if (!Number.isFinite(sec) || sec < 0) return '--:--';
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const secs = Math.floor(sec % 60);
    return (hrs > 0 ? hrs + ':' : '') + String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
  }

  function initPlayerCard(card) {
    if (!card || card.dataset.ccnPlayerInitialized === 'true') return;
    card.dataset.ccnPlayerInitialized = 'true';

    const audio = card.querySelector('.ccn-audio-el');
    const playBtn = card.querySelector('.ccn-play');
    const wave = card.querySelector('.ccn-wave');
    const head = card.querySelector('.ccn-playhead');
    const nowEl = card.querySelector('.ccn-now');
    const clockEl = card.querySelector('.ccn-clock');
    const durEl = card.querySelector('.ccn-duration');
    const speedBtn = card.querySelector('.ccn-speed');
    const muteBtn = card.querySelector('.ccn-mute');
    const volumeInput = card.querySelector('.ccn-volume-input');
    const moreBtn = card.querySelector('.ccn-more');
    const fallBox = card.querySelector('.ccn-fallback');
    const driveFrame = card.querySelector('.ccn-drive-frame');
    const statusEl = card.querySelector('.ccn-status');

    if (!audio || !playBtn || !wave || !head) return;

    const src = (card.dataset.audioUrl || '').trim();
    const driveId = (card.dataset.driveId || '').trim();
    const metaDuration = parseFloat(card.dataset.durationSeconds || '0');
    let speedIndex = 1;

    let peaks = DEFAULT_PEAKS;
    if (card.dataset.peaks) {
      try {
        const parsed = JSON.parse(card.dataset.peaks);
        if (Array.isArray(parsed) && parsed.length > 8) peaks = parsed;
      } catch (_) {}
    }

    // Wyczyść ewentualne stare słupki i wygeneruj słupki z prawdziwych szczytów PCM
    wave.querySelectorAll('.ccn-bar').forEach(b => b.remove());
    const bars = peaks.map(h => {
      const b = document.createElement('span');
      b.className = 'ccn-bar';
      b.style.height = Math.max(12, Math.min(92, Number(h) || 25)) + '%';
      b.setAttribute('aria-hidden', 'true');
      wave.appendChild(b);
      return b;
    });

    function setStatus(msg) {
      if (statusEl) statusEl.textContent = msg;
    }

    function getEffectiveDuration() {
      if (Number.isFinite(audio.duration) && audio.duration > 0) return audio.duration;
      if (Number.isFinite(metaDuration) && metaDuration > 0) return metaDuration;
      return NaN;
    }

    function setFallbackOpen(open) {
      if (!fallBox) return;
      fallBox.classList.toggle('show', open);
      if (moreBtn) moreBtn.setAttribute('aria-expanded', String(open));
      if (open && driveFrame && !driveFrame.src && driveId) {
        driveFrame.src = 'https://drive.google.com/file/d/' + encodeURIComponent(driveId) + '/preview';
      }
    }

    function updateUi() {
      const t = audio.currentTime || 0;
      const d = getEffectiveDuration();
      const ratio = Number.isFinite(d) && d > 0 ? Math.max(0, Math.min(1, t / d)) : 0;
      head.style.left = (ratio * 100) + '%';
      bars.forEach((b, idx) => {
        b.classList.toggle('past', idx / bars.length < ratio);
      });
      if (nowEl) nowEl.textContent = formatTime(t);
      if (clockEl) clockEl.textContent = formatTime(t) + ' / ' + (Number.isFinite(d) ? formatTime(d) : '--:--');
      if (durEl && Number.isFinite(d)) durEl.textContent = formatTime(d);
      wave.setAttribute('aria-valuenow', String(Math.round(ratio * 100)));
      wave.setAttribute('aria-valuetext', formatTime(t));
    }

    if (src) {
      audio.src = src;
      audio.volume = 0.85;
      setStatus('Nagranie gotowe do odtworzenia (' + (Number.isFinite(metaDuration) && metaDuration > 0 ? formatTime(metaDuration) : 'strumień HTTPS') + ').');
    } else {
      playBtn.disabled = true;
      wave.classList.add('is-disabled');
      wave.setAttribute('aria-disabled', 'true');
      if (speedBtn) speedBtn.disabled = true;
      if (muteBtn) muteBtn.disabled = true;
      if (volumeInput) volumeInput.disabled = true;
      setStatus('Źródło Google Drive — odtwórz w podglądzie poniżej.');
      setFallbackOpen(true);
    }

    playBtn.addEventListener('click', async function () {
      if (!src) return;
      if (audio.paused) {
        try {
          // Zatrzymaj inne elementy <audio> na stronie (zasada jednego grającego strumienia)
          document.querySelectorAll('audio').forEach(other => {
            if (other !== audio && !other.paused) other.pause();
          });
          await audio.play();
        } catch (err) {
          setStatus('Nie można uruchomić bezpośredniego strumienia. Otwieram podgląd zapasowy Google Drive.');
          setFallbackOpen(true);
        }
      } else {
        audio.pause();
      }
    });

    audio.addEventListener('play', function () {
      playBtn.innerHTML = '❚❚';
      playBtn.setAttribute('aria-label', 'Wstrzymaj nagranie');
      setStatus('Odtwarzanie artykułu audio…');
      window.dispatchEvent(new CustomEvent('ccn-audio-play', { detail: { id: card.id || src } }));
    });

    audio.addEventListener('pause', function () {
      playBtn.innerHTML = '▶';
      playBtn.setAttribute('aria-label', 'Odtwórz nagranie');
      if (audio.currentTime > 0 && audio.currentTime < (getEffectiveDuration() || Infinity)) {
        setStatus('Wstrzymano (' + formatTime(audio.currentTime) + ')');
      }
    });

    audio.addEventListener('waiting', function () {
      setStatus('Buforowanie nagrania…');
    });

    audio.addEventListener('error', function () {
      setStatus('Strumień główny niedostępny — skorzystaj z odtwarzacza źródłowego Google Drive poniżej.');
      setFallbackOpen(true);
    });

    audio.addEventListener('loadedmetadata', function () {
      updateUi();
    });

    audio.addEventListener('timeupdate', updateUi);

    audio.addEventListener('ended', function () {
      playBtn.innerHTML = '▶';
      playBtn.setAttribute('aria-label', 'Odtwórz nagranie');
      setStatus('Nagranie zakończone.');
    });

    function seekToRatio(r) {
      const d = getEffectiveDuration();
      if (Number.isFinite(d) && d > 0) {
        audio.currentTime = Math.max(0, Math.min(d, r * d));
        updateUi();
      }
    }

    wave.addEventListener('click', function (e) {
      if (!src) return;
      const rect = wave.getBoundingClientRect();
      if (rect.width > 0) {
        seekToRatio((e.clientX - rect.left) / rect.width);
      }
    });

    wave.addEventListener('keydown', function (e) {
      if (!src) return;
      const d = getEffectiveDuration();
      if (!Number.isFinite(d) || d <= 0) return;
      if (['ArrowLeft', 'ArrowDown', 'ArrowRight', 'ArrowUp', 'Home', 'End'].includes(e.key)) {
        e.preventDefault();
        if (e.key === 'Home') audio.currentTime = 0;
        else if (e.key === 'End') audio.currentTime = d;
        else {
          const delta = (e.key === 'ArrowLeft' || e.key === 'ArrowDown') ? -5 : 5;
          audio.currentTime = Math.min(d, Math.max(0, (audio.currentTime || 0) + delta));
        }
        updateUi();
      }
    });

    if (speedBtn) {
      speedBtn.addEventListener('click', function () {
        speedIndex = (speedIndex + 1) % SPEEDS.length;
        audio.playbackRate = SPEEDS[speedIndex];
        speedBtn.textContent = SPEEDS[speedIndex] + '× ▾';
      });
    }

    if (muteBtn) {
      muteBtn.addEventListener('click', function () {
        audio.muted = !audio.muted;
        muteBtn.textContent = audio.muted ? '🔇' : '◖))';
        muteBtn.setAttribute('aria-label', audio.muted ? 'Włącz dźwięk' : 'Wycisz');
      });
    }

    if (volumeInput) {
      volumeInput.addEventListener('input', function () {
        audio.volume = Number(volumeInput.value);
        audio.muted = false;
        if (muteBtn) {
          muteBtn.textContent = '◖))';
          muteBtn.setAttribute('aria-label', 'Wycisz');
        }
      });
    }

    if (moreBtn) {
      moreBtn.addEventListener('click', function () {
        setFallbackOpen(!fallBox || !fallBox.classList.contains('show'));
      });
    }

    window.addEventListener('ccn-audio-play', function (e) {
      const activeId = e.detail && e.detail.id;
      if (activeId && activeId !== (card.id || src) && !audio.paused) {
        audio.pause();
      }
    });

    updateUi();
  }

  function initAllCcnPlayers() {
    document.querySelectorAll('.ccn-player').forEach(initPlayerCard);
  }

  window.initAllCcnPlayers = initAllCcnPlayers;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllCcnPlayers);
  } else {
    initAllCcnPlayers();
  }
})();
