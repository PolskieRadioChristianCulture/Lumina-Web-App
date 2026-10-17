/**
 * CCN AUDIO PLAYER PREMIUM 2026 — ROBUST PRODUCTION ENGINE
 * Obsługuje natywny strumień HTML5 (M4A/AAC/MP3 HTTP 200/206 Range),
 * 64-słupkowy interaktywny waveform PCM, slider pozycji, prędkości 0.75×–2×,
 * regulację głośności, wyciszenie, skróty klawiszowe (Space, Arrow keys),
 * wyłączność jednego grającego strumienia oraz szufladę awaryjną Google Drive.
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

    let audio = card.querySelector('audio');
    if (!audio) {
      audio = document.createElement('audio');
      audio.className = 'ccn-audio-el';
      audio.preload = 'metadata';
      audio.crossOrigin = 'anonymous';
      card.prepend(audio);
    }

    const src = (card.dataset.audioSrc || card.dataset.audioUrl || audio.getAttribute('src') || '').trim();
    const driveId = (card.dataset.driveId || '').trim();
    const metaDuration = parseFloat(card.dataset.durationSeconds || '0') || 1071.368;

    const playBtn = card.querySelector('[data-action="toggle"], .ccn-play-btn, .ccn-play');
    const playIconSpan = playBtn ? playBtn.querySelector('.ccn-play-icon, [data-icon="state"]') : null;
    const playIcon = playBtn ? playBtn.querySelector('[data-icon="play"]') : null;
    const pauseIcon = playBtn ? playBtn.querySelector('[data-icon="pause"]') : null;

    const wave = card.querySelector('[data-role="waveform"], .ccn-wave');
    const seekRange = card.querySelector('[data-role="seek"], .ccn-range');

    const nowEl = card.querySelector('[data-role="current-time"], .ccn-now, .elapsed');
    const nowAltEl = card.querySelector('[data-role="current-time-alt"]');
    const durEl = card.querySelector('[data-role="total-time"], .ccn-duration, [data-role="duration-label"]');
    const clockEl = card.querySelector('.ccn-clock');
    const statusEl = card.querySelector('[data-role="status"], .ccn-status');

    const speedBtn = card.querySelector('[data-action="speed"], .ccn-speed, .ccn-speed-btn');
    const speedLabel = card.querySelector('[data-role="speed"]');

    const muteBtn = card.querySelector('[data-action="mute"], .ccn-mute, .ccn-mute-btn');
    const muteIconSpan = muteBtn ? muteBtn.querySelector('.ccn-mute-icon') : null;
    const volumeRange = card.querySelector('[data-role="volume"], .ccn-vol-input, .ccn-volume-input, input[type="range"]');

    const backBtn = card.querySelector('[data-action="back15"], [data-action="back10"]');
    const forwardBtn = card.querySelector('[data-action="forward15"], [data-action="forward10"]');

    const fallbackBtn = card.querySelector('[data-action="toggle-fallback"], .ccn-fallback-toggle-btn, .ccn-more');
    const fallbackDrawer = card.querySelector('[data-role="fallback"], .ccn-drive-fallback, .ccn-fallback');
    const driveFrame = card.querySelector('[data-role="drive-iframe"], .ccn-drive-frame, iframe');

    let speedIndex = 1;
    let isSeeking = false;

    // Pobierz lub sparsuj szczyty fali
    let peaks = DEFAULT_PEAKS;
    if (card.dataset.peaks) {
      try {
        const parsed = JSON.parse(card.dataset.peaks);
        if (Array.isArray(parsed) && parsed.length > 8) peaks = parsed;
      } catch (_) {}
    }

    // Wygeneruj słupki fali dźwiękowej oraz playhead
    let playhead = null;
    let bars = [];
    if (wave) {
      wave.innerHTML = '';
      playhead = document.createElement('div');
      playhead.className = 'ccn-playhead';
      wave.appendChild(playhead);

      bars = peaks.map((h, idx) => {
        const b = document.createElement('span');
        b.className = 'ccn-wave__bar ccn-bar';
        b.style.height = Math.max(12, Math.min(92, Number(h) || 25)) + '%';
        b.setAttribute('aria-hidden', 'true');
        b.dataset.idx = String(idx);
        wave.appendChild(b);
        return b;
      });
    }

    function setStatus(msg) {
      if (statusEl) {
        const target = statusEl.querySelector('[data-role="status"]') || statusEl;
        target.textContent = msg;
      }
    }

    function getEffectiveDuration() {
      if (Number.isFinite(audio.duration) && audio.duration > 0) return audio.duration;
      if (Number.isFinite(metaDuration) && metaDuration > 0) return metaDuration;
      return 1071.368;
    }

    function setFallbackOpen(open) {
      if (!fallbackDrawer) return;
      fallbackDrawer.classList.toggle('show', open);
      if (fallbackBtn) fallbackBtn.setAttribute('aria-expanded', String(open));
      if (open && driveFrame && !driveFrame.src && driveId) {
        driveFrame.src = 'https://drive.google.com/file/d/' + encodeURIComponent(driveId) + '/preview';
      }
    }

    function updatePlayButtonState(isPlaying) {
      if (!playBtn) return;
      playBtn.classList.toggle('is-playing', isPlaying);
      if (playIconSpan) {
        playIconSpan.textContent = isPlaying ? '❚❚' : '▶';
      } else if (playIcon && pauseIcon) {
        if (isPlaying) {
          playIcon.setAttribute('hidden', '');
          pauseIcon.removeAttribute('hidden');
        } else {
          pauseIcon.setAttribute('hidden', '');
          playIcon.removeAttribute('hidden');
        }
      } else {
        playBtn.textContent = isPlaying ? '❚❚' : '▶';
      }
      playBtn.setAttribute('aria-label', isPlaying ? 'Wstrzymaj nagranie' : 'Odtwórz nagranie');
    }

    function updateMuteButtonState(isMuted) {
      if (!muteBtn) return;
      if (muteIconSpan) {
        muteIconSpan.textContent = isMuted ? '×' : '◖))';
      }
      muteBtn.setAttribute('aria-label', isMuted ? 'Włącz dźwięk' : 'Wycisz');
    }

    function updateUi() {
      if (isSeeking) return;
      const t = audio.currentTime || 0;
      const d = getEffectiveDuration();
      const ratio = Number.isFinite(d) && d > 0 ? Math.max(0, Math.min(1, t / d)) : 0;

      if (seekRange) {
        seekRange.value = String(Math.round(ratio * 1000));
        seekRange.setAttribute('aria-valuenow', String(Math.round(ratio * 100)));
        seekRange.setAttribute('aria-valuetext', formatTime(t));
      }
      if (playhead) {
        playhead.style.left = (ratio * 100) + '%';
      }
      if (wave) {
        wave.setAttribute('aria-valuenow', String(Math.round(ratio * 100)));
        wave.setAttribute('aria-valuetext', formatTime(t));
      }
      bars.forEach((b, idx) => {
        const isPast = idx / bars.length <= ratio;
        b.classList.toggle('is-played', isPast);
        b.classList.toggle('past', isPast);
      });

      const formattedNow = formatTime(t);
      const formattedDur = formatTime(d);

      if (nowEl) nowEl.textContent = formattedNow;
      if (nowAltEl) nowAltEl.textContent = formattedNow;
      if (clockEl) clockEl.textContent = formattedNow + ' / ' + formattedDur;
      if (durEl) {
        if (durEl.dataset.role === 'duration-label') {
          durEl.textContent = 'Czas: ' + formattedDur;
        } else {
          durEl.textContent = formattedDur;
        }
      }
    }

    // Konfiguracja źródła
    if (src) {
      if (!audio.getAttribute('src') || audio.src !== src) {
        audio.src = src;
      }
      audio.volume = 0.85;
      setStatus('Źródło audio skonfigurowane. Naciśnij Odtwórz.');
    } else if (driveId) {
      if (playBtn) playBtn.disabled = false;
      setStatus('Źródło Google Drive — odtwórz w podglądzie poniżej.');
    } else {
      if (playBtn) playBtn.disabled = true;
      setStatus('Brak źródła nagrania.');
    }

    // Obsługa Play / Pause
    if (playBtn) {
      playBtn.addEventListener('click', async function (e) {
        e.preventDefault();
        if (!src && driveId) {
          setFallbackOpen(true);
          return;
        }
        if (audio.paused) {
          try {
            document.querySelectorAll('audio').forEach(other => {
              if (other !== audio && !other.paused) other.pause();
            });
            await audio.play();
          } catch (err) {
            console.warn('[CCN Player] Native play error, opening Google Drive fallback:', err);
            setStatus('Nie można uruchomić nagrania. Użyj podglądu źródłowego Google Drive.');
            setFallbackOpen(true);
          }
        } else {
          audio.pause();
        }
      });
    }

    audio.addEventListener('play', function () {
      updatePlayButtonState(true);
      setStatus('Odtwarzanie');
      window.dispatchEvent(new CustomEvent('ccn-audio-play', { detail: { id: card.id || src } }));
    });

    audio.addEventListener('pause', function () {
      updatePlayButtonState(false);
      setStatus('Pauza');
    });

    audio.addEventListener('waiting', function () {
      setStatus('Buforowanie nagrania…');
    });

    audio.addEventListener('loadedmetadata', function () {
      updateUi();
      if (durEl) {
        const d = getEffectiveDuration();
        if (durEl.dataset.role === 'duration-label') {
          durEl.textContent = 'Czas: ' + formatTime(d);
        } else {
          durEl.textContent = formatTime(d);
        }
      }
    });

    audio.addEventListener('timeupdate', updateUi);

    audio.addEventListener('ended', function () {
      updatePlayButtonState(false);
      audio.currentTime = 0;
      updateUi();
      setStatus('Nagranie zakończone');
    });

    audio.addEventListener('error', function (e) {
      console.warn('[CCN Player] Audio element error:', e);
      updatePlayButtonState(false);
      setStatus('Błąd pobierania strumienia. Otwórz źródłowe nagranie w Google Drive.');
      setFallbackOpen(true);
    });

    // Przewijanie przez kliknięcie w falę
    if (wave) {
      wave.addEventListener('click', function (e) {
        const rect = wave.getBoundingClientRect();
        if (rect.width > 0) {
          const r = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
          const d = getEffectiveDuration();
          audio.currentTime = r * d;
          updateUi();
        }
      });

      wave.addEventListener('keydown', function (e) {
        const d = getEffectiveDuration();
        if (!src || !Number.isFinite(d)) return;
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
    }

    // Przewijanie przez suwak
    if (seekRange) {
      seekRange.addEventListener('input', function () {
        isSeeking = true;
        const r = Number(seekRange.value) / 1000;
        const d = getEffectiveDuration();
        const t = r * d;
        if (nowEl) nowEl.textContent = formatTime(t);
        bars.forEach((b, idx) => {
          const isPast = idx / bars.length <= r;
          b.classList.toggle('is-played', isPast);
          b.classList.toggle('past', isPast);
        });
      });
      seekRange.addEventListener('change', function () {
        const r = Number(seekRange.value) / 1000;
        const d = getEffectiveDuration();
        audio.currentTime = r * d;
        isSeeking = false;
        updateUi();
      });
    }

    // Skok -15s / +15s
    if (backBtn) {
      backBtn.addEventListener('click', function (e) {
        e.preventDefault();
        audio.currentTime = Math.max(0, (audio.currentTime || 0) - 15);
        updateUi();
      });
    }
    if (forwardBtn) {
      forwardBtn.addEventListener('click', function (e) {
        e.preventDefault();
        const d = getEffectiveDuration();
        audio.currentTime = Math.min(d, (audio.currentTime || 0) + 15);
        updateUi();
      });
    }

    // Prędkość
    if (speedBtn) {
      speedBtn.addEventListener('click', function (e) {
        e.preventDefault();
        speedIndex = (speedIndex + 1) % SPEEDS.length;
        const spd = SPEEDS[speedIndex];
        audio.playbackRate = spd;
        if (speedLabel) speedLabel.textContent = spd + '× ▾';
        else speedBtn.textContent = spd + '× ▾';
      });
    }

    // Głośność i wyciszenie
    if (volumeRange) {
      volumeRange.addEventListener('input', function () {
        const val = Number(volumeRange.value);
        audio.volume = val;
        audio.muted = (val === 0);
        updateMuteButtonState(audio.muted);
      });
    }
    if (muteBtn) {
      muteBtn.addEventListener('click', function (e) {
        e.preventDefault();
        audio.muted = !audio.muted;
        if (volumeRange) {
          volumeRange.value = audio.muted ? '0' : String(audio.volume || 0.85);
        }
        updateMuteButtonState(audio.muted);
      });
    }

    // Szuflada zapasowa
    if (fallbackBtn) {
      fallbackBtn.addEventListener('click', function (e) {
        e.preventDefault();
        const isCurrentlyOpen = fallbackDrawer && fallbackDrawer.classList.contains('show');
        setFallbackOpen(!isCurrentlyOpen);
      });
    }

    // Globalne zatrzymanie innych odtwarzaczy
    window.addEventListener('ccn-audio-play', function (e) {
      const activeId = e.detail && e.detail.id;
      if (activeId && activeId !== (card.id || src) && !audio.paused) {
        audio.pause();
      }
    });

    updatePlayButtonState(false);
    updateMuteButtonState(false);
    updateUi();
  }

  function initAllCcnPlayers() {
    document.querySelectorAll('.ccn-player, [data-ccn-audio-player="true"]').forEach(initPlayerCard);
  }

  // Globalne skróty klawiszowe (Space / Strzałki)
  document.addEventListener('keydown', function (e) {
    const activeEl = document.activeElement;
    if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable)) {
      return;
    }
    const player = document.querySelector('.ccn-player, [data-ccn-audio-player="true"]');
    if (!player) return;
    const audio = player.querySelector('audio');
    if (!audio) return;

    if (e.code === 'Space') {
      e.preventDefault();
      const playBtn = player.querySelector('[data-action="toggle"], .ccn-play-btn, .ccn-play');
      if (playBtn) playBtn.click();
    } else if (e.code === 'ArrowLeft') {
      e.preventDefault();
      audio.currentTime = Math.max(0, (audio.currentTime || 0) - 15);
    } else if (e.code === 'ArrowRight') {
      e.preventDefault();
      const d = audio.duration || 1071.368;
      audio.currentTime = Math.min(d, (audio.currentTime || 0) + 15);
    }
  });

  window.initAllCcnPlayers = initAllCcnPlayers;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllCcnPlayers);
  } else {
    initAllCcnPlayers();
  }
})();
