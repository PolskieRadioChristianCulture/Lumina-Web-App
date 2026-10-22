// #antyHALLOWEEN — app.js v=20261022_v1
'use strict';

const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

const toast = document.getElementById('toast');
let toastTimer;
function notice(msg) {
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3500);
}

async function share(url, title) {
  if (navigator.share) {
    try {
      await navigator.share({ url, title });
      return;
    } catch (e) {
      if (e.name === 'AbortError') return;
    }
  }
  try {
    await navigator.clipboard.writeText(url);
    notice('Link skopiowany do schowka ✓');
  } catch {
    notice('Skopiuj adres: ' + url);
  }
}

const copyPostBtn = document.getElementById('copyPost');
if (copyPostBtn) {
  copyPostBtn.onclick = async () => {
    try {
      const text = document.getElementById('postcopy')?.innerText || '';
      await navigator.clipboard.writeText(text);
      notice('Tekst kampanii skopiowany ✓');
    } catch {
      notice('Zaznacz i skopiuj treść ręcznie');
    }
  };
}

const sharePageBtn = document.getElementById('sharePage');
if (sharePageBtn) {
  sharePageBtn.onclick = () => share('https://polskieradio.cc/Halloween', '#antyHALLOWEEN');
}

const shareArticleBtn = document.getElementById('shareArticle');
if (shareArticleBtn) {
  shareArticleBtn.onclick = () => share('https://polskieradio.cc/news?art=art-ccn-halloween-deklaracja-christian-culture', 'Deklaracja Christian Culture');
}
