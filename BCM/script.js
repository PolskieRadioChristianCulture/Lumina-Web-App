/* BCM — Biblijny Czas Modlitwy | script.js v=20261022_v1 */
'use strict';

const PLAYLIST_ID = 'PLQBdxcl9HBc98HweGapf1brLPQBTf-6eN';
const PAGE_URL = 'https://polskieradio.cc/BCM';
const PAGE_TITLE = 'Biblijny Czas Modlitwy z Jolą Wójcik';
const PAGE_TEXT = 'Na Słowo. Na modlitwę. Na Ciebie. — CC Women';

const frame = document.getElementById('video-frame');
const loadBtn = document.getElementById('loadVideo');
const toastEl = document.getElementById('toast');

let toastTimer;
function toast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('on'), 3800);
}

/* Odtwarzacz YouTube — privacy-first (brak iframe przed kliknięciem) */
if (loadBtn) {
  loadBtn.addEventListener('click', () => {
    const iframe = document.createElement('iframe');
    iframe.title = 'Biblijny Czas Modlitwy — oficjalna playlista CC Women · Jola Wójcik';
    iframe.src = `https://www.youtube-nocookie.com/embed/videoseries?list=${encodeURIComponent(PLAYLIST_ID)}&autoplay=1&rel=0`;
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    iframe.allowFullscreen = true;
    frame.replaceChildren(iframe);
  });
}

/* Kopiowanie linku */
async function copyLink() {
  try {
    await navigator.clipboard.writeText(PAGE_URL);
    toast('Adres strony skopiowany. ✓');
  } catch {
    toast('Skopiuj adres z paska przeglądarki.');
  }
}

const copyBtn = document.getElementById('copy');
if (copyBtn) copyBtn.addEventListener('click', copyLink);

/* Udostępnianie (Web Share API z fallbackiem do schowka) */
const shareBtn = document.getElementById('share');
if (shareBtn) {
  shareBtn.addEventListener('click', async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: PAGE_TITLE, text: PAGE_TEXT, url: PAGE_URL });
        return;
      } catch (e) {
        if (e.name === 'AbortError') return;
      }
    }
    await copyLink();
  });
}

/* Rok w stopce */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* === LOGOWANIE GOOGLE LUMINA === */
window.handleLuminaGoogleLogin = async function(e) {
  if (e && typeof e.preventDefault === 'function') e.preventDefault();
  if (typeof window.ccLoginWithGoogle === 'function') {
    try {
      await window.ccLoginWithGoogle('/BCM');
      return;
    } catch (err) {
      console.warn('ccLoginWithGoogle error, fallback to redirect:', err);
    }
  }
  window.location.href = 'https://polskieradio.cc/login?redirect=/BCM';
};

/* === RADIO CC PLAYER === */
const STREAM_URL = 'https://stream.zeno.fm/vz96pvl3pnktv';
const radioBtn = document.getElementById('radioCtaBtn');
const radioAudio = document.getElementById('ccRadioAudio');

if (radioBtn && radioAudio) {
  const radioLabel = radioBtn.querySelector('.radio-cta-label');
  let isPlaying = false;

  const setPlaying = (play) => {
    isPlaying = play;
    radioBtn.setAttribute('aria-pressed', String(play));
    radioBtn.dataset.state = play ? 'playing' : 'idle';
    radioBtn.setAttribute('aria-label', play ? 'Zatrzymaj Radio Christian Culture' : 'Włącz Radio Christian Culture na żywo');
    if (radioLabel) radioLabel.textContent = play ? 'Stop Radia CC' : 'Słuchaj Radia CC';
  };

  radioBtn.addEventListener('click', () => {
    if (isPlaying) {
      radioAudio.pause();
      radioAudio.src = '';
      radioAudio.load();
      setPlaying(false);
    } else {
      radioBtn.dataset.state = 'loading';
      if (radioLabel) radioLabel.textContent = 'Łączenie…';
      radioAudio.src = STREAM_URL;
      radioAudio.load();
      const p = radioAudio.play();
      if (p && typeof p.then === 'function') {
        p.then(() => {
          setPlaying(true);
        }).catch((err) => {
          console.warn('Radio play promise error:', err);
          setPlaying(false);
          radioBtn.dataset.state = 'error';
        });
      } else {
        setPlaying(true);
      }
    }
  });

  radioAudio.addEventListener('playing', () => setPlaying(true));
  radioAudio.addEventListener('ended', () => setPlaying(false));
  radioAudio.addEventListener('error', (e) => {
    console.warn('Audio element error:', e);
    setPlaying(false);
    radioBtn.dataset.state = 'error';
  });
  radioAudio.addEventListener('pause', () => {
    if (isPlaying && radioAudio.src && !radioAudio.seeking) {
      setPlaying(false);
    }
  });
}
