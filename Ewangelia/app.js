"use strict";

document.addEventListener('DOMContentLoaded', () => {
  const $ = (id) => document.getElementById(id);

  // ── 1. ELEMENTY DOM DLA DOBREJ NOWINY (MP3) ──
  const audio = $('audio');
  const seek = $('seek');
  const wave = $('wave');
  const player = $('audio-player');
  const buttons = [...document.querySelectorAll('[data-toggle]')];
  const status = $('feedback');
  const base = 'https://polskieradio.cc/Ewangelia';

  function time(n) {
    if (!Number.isFinite(n)) return '--:--';
    return Math.floor(n / 60) + ':' + String(Math.floor(n % 60)).padStart(2, '0');
  }

  function notice(t) {
    if (!status) return;
    status.textContent = t;
    clearTimeout(notice.timer);
    notice.timer = setTimeout(() => {
      status.textContent = '';
    }, 6000);
  }

  function uiPlay(on) {
    if (player) player.classList.toggle('is-playing', on);
    buttons.forEach((b) => {
      b.textContent = on ? 'Ⅱ' : '▶';
      b.setAttribute('aria-label', on ? 'Pauza' : 'Odtwórz');
    });
  }

  // ── 2. LIVE RADIO STREAM & LICZNIK /milion INTEGRACJA ──
  const radioCtaBtn = $('radioCtaBtn');
  const ccRadioAudio = $('ccRadioAudio');
  const radioCtaLabel = radioCtaBtn ? radioCtaBtn.querySelector('.radio-cta-label') : null;
  const STREAM_URL = 'https://stream.zeno.fm/vz96pvl3pnktv';
  let isRadioPlaying = false;

  const setRadioPlayingState = (playing) => {
    isRadioPlaying = playing;
    if (radioCtaBtn) {
      radioCtaBtn.setAttribute('aria-pressed', String(playing));
      radioCtaBtn.setAttribute(
        'aria-label',
        playing ? 'Zatrzymaj Radio Christian Culture' : 'Włącz Radio Christian Culture na żywo'
      );
    }
    if (radioCtaLabel) {
      radioCtaLabel.textContent = playing ? 'Stop Radia CC' : 'Słuchaj Radia CC';
    }
  };

  if (radioCtaBtn && ccRadioAudio) {
    radioCtaBtn.addEventListener('click', () => {
      if (isRadioPlaying) {
        ccRadioAudio.pause();
        ccRadioAudio.src = ''; // Zwolnienie połączenia strumieniowego
        setRadioPlayingState(false);
      } else {
        // Wzajemne wykluczenie: zatrzymaj odtwarzanie pliku MP3, jeśli gra
        if (audio && !audio.paused) {
          audio.pause();
        }
        ccRadioAudio.src = STREAM_URL;
        ccRadioAudio.play().catch(() => {
          setRadioPlayingState(false);
          notice('Nie udało się uruchomić strumienia radia. Spróbuj ponownie za chwilę.');
        });
        setRadioPlayingState(true);
      }
    });

    ccRadioAudio.addEventListener('ended', () => setRadioPlayingState(false));
    ccRadioAudio.addEventListener('error', () => setRadioPlayingState(false));
    ccRadioAudio.addEventListener('pause', () => {
      if (isRadioPlaying) setRadioPlayingState(false);
    });
  }

  // ── 3. ZARZĄDZANIE ODTWARZANIEM MP3 ──
  if (audio) {
    buttons.forEach((b) =>
      b.addEventListener('click', async () => {
        if (audio.paused) {
          // Wzajemne wykluczenie: zatrzymaj strumień radia na żywo, jeśli gra
          if (isRadioPlaying && ccRadioAudio) {
            ccRadioAudio.pause();
            ccRadioAudio.src = '';
            setRadioPlayingState(false);
          }
          try {
            await audio.play();
          } catch (e) {
            notice('Nie udało się rozpocząć odtwarzania. Sprawdź ustawienia przeglądarki.');
          }
        } else {
          audio.pause();
        }
      })
    );

    audio.addEventListener('play', () => {
      uiPlay(true);
      if (isRadioPlaying && ccRadioAudio) {
        ccRadioAudio.pause();
        ccRadioAudio.src = '';
        setRadioPlayingState(false);
      }
    });

    audio.addEventListener('pause', () => uiPlay(false));
    audio.addEventListener('ended', () => uiPlay(false));

    audio.addEventListener('loadedmetadata', () => {
      const end = $('endTime');
      if (end) end.textContent = time(audio.duration);
    });

    audio.addEventListener('timeupdate', () => {
      if (!seek) return;
      const v = audio.duration ? Math.floor((audio.currentTime / audio.duration) * 1000) : 0;
      seek.value = String(v);
      seek.style.setProperty('--prog', v / 10 + '%');
      const cur = $('curTime');
      if (cur) cur.textContent = time(audio.currentTime);
    });

    audio.addEventListener('error', () => {
      notice('Brak dostępu do pliku nagrania MP3. Sprawdź połączenie.');
    });

    if (seek) {
      seek.addEventListener('input', () => {
        if (audio.duration) {
          audio.currentTime = (audio.duration * Number(seek.value)) / 1000;
        }
      });
    }

    const rewindBtn = $('rewind');
    if (rewindBtn) rewindBtn.onclick = () => { audio.currentTime = Math.max(0, audio.currentTime - 15); };

    const prevBtn = $('prev');
    if (prevBtn) prevBtn.onclick = () => { audio.currentTime = 0; };

    const nextBtn = $('next');
    if (nextBtn) nextBtn.onclick = () => { audio.currentTime = Math.min(audio.duration || 1e20, audio.currentTime + 15); };

    const repeatBtn = $('repeat');
    if (repeatBtn) {
      repeatBtn.onclick = () => {
        audio.loop = !audio.loop;
        repeatBtn.setAttribute('aria-pressed', String(audio.loop));
        repeatBtn.style.color = audio.loop ? '#ffdfaa' : 'white';
      };
    }

    const rateBtn = $('rate');
    if (rateBtn) {
      rateBtn.onclick = () => {
        const r = [1, 1.25, 1.5, 1.75, 2, 0.75];
        audio.playbackRate = r[(r.indexOf(audio.playbackRate) + 1) % r.length];
        rateBtn.textContent = audio.playbackRate + '×';
      };
    }

    const muteBtn = $('mute');
    if (muteBtn) {
      muteBtn.onclick = () => {
        audio.muted = !audio.muted;
        muteBtn.textContent = audio.muted ? '×' : '♬';
      };
    }

    const vol = $('vol');
    if (vol) {
      vol.oninput = (e) => {
        audio.volume = Number(e.target.value);
        audio.muted = false;
      };
    }
  }

  // ── 4. ULUBIONE ──
  function favorite() {
    const b = $('fav');
    const s = $('save');
    if (!b) return;
    const newValue = b.getAttribute('aria-pressed') !== 'true';
    b.setAttribute('aria-pressed', String(newValue));
    b.textContent = newValue ? '♥' : '♡';
    if (s) {
      s.textContent = newValue ? '♥  Dodano do ulubionych' : '♡  Dodaj do ulubionych';
    }
    notice(
      newValue
        ? 'Zaznaczono jako ulubione w bieżącej sesji. Zapis w chmurze po zalogowaniu do LUMINA.'
        : 'Usunięto z ulubionych.'
    );
  }

  const favBtn = $('fav');
  if (favBtn) favBtn.onclick = favorite;
  const saveBtn = $('save');
  if (saveBtn) saveBtn.onclick = favorite;

  // ── 5. UDOSTĘPNIANIE & MEDIA SPOŁECZNOŚCIOWE ──
  async function share(url) {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Dobra Nowina — Radio CC', url });
        return;
      } catch (e) {
        if (e.name === 'AbortError') return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      notice('Link do nagrania został skopiowany do schowka.');
    } catch (e) {
      notice('Adres do udostępnienia: ' + url);
    }
  }

  const shareBtn = $('share');
  if (shareBtn) shareBtn.onclick = () => share(base);
  const copyBtn = $('copy');
  if (copyBtn) copyBtn.onclick = () => share(base);

  const fb = $('fb');
  if (fb) fb.href = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(base);
  const x = $('x');
  if (x) x.href = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent('Dobra Nowina — Radio CC') + '&url=' + encodeURIComponent(base);
  const wa = $('wa');
  if (wa) wa.href = 'https://api.whatsapp.com/send?text=' + encodeURIComponent('Posłuchaj Dobrej Nowiny: ' + base);
  const ms = $('ms');
  if (ms) {
    ms.href = 'https://www.facebook.com/dialog/send?link=' + encodeURIComponent(base) + '&app_id=0&redirect_uri=' + encodeURIComponent(base);
    ms.addEventListener('click', (e) => {
      e.preventDefault();
      share(base);
    });
  }

  // ── 6. CC OMNI-SEARCH @w ──
  const searchBtn = $('searchBtn');
  if (searchBtn) {
    searchBtn.onclick = () => {
      if (typeof window.ccOmniSearchOpen === 'function') {
        window.ccOmniSearchOpen();
      } else {
        location.href = 'https://polskieradio.cc/szukaj';
      }
    };
  }

  // ── 7. ROK W STOPCE ──
  const yearEl = $('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // ── 8. WIZUALNA FALA DEKORACYJNA ──
  if (wave) {
    for (let i = 0; i < 92; i++) {
      const el = document.createElement('i');
      el.style.setProperty('--h', 3 + 25 * Math.abs(Math.sin(i * 0.57) * Math.cos(i * 0.16)) + 'px');
      el.style.setProperty('--delay', (i % 14) * 0.085 + 's');
      wave.append(el);
    }
  }
});
