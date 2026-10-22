/* BCM — Biblijny Czas Modlitwy | script.js v=20261022_v1 */
'use strict';

const PLAYLIST_ID = 'PLQBdxcl9HBc98HweGapf1brLPQBTf-6eN';
const PAGE_URL = 'https://polskieradio.cc/bcm';
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
