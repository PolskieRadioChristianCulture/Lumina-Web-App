/**
 * Wioletta Rogowska — powitalne intro wideo (raz na sesję przeglądarki).
 * Standard EkoCC v2 / @777 / Zero-QA.
 * - sessionStorage: po pierwszym wyświetleniu intro nie wraca do zamknięcia karty.
 * - Wideo własne: zero reklam, zero ciasteczek podmiotów trzecich, ZERO COST.
 * - Autoodtwarzanie wyciszone (wymóg przeglądarek), przyciski dźwięku i „Pomiń” min. 44×44 px.
 * - Szanuje prefers-reduced-motion oraz navigator.connection.saveData.
 */
(() => {
  'use strict';
  const KEY = 'cc_wioletta_intro_seen';

  const L = {
    pl: { dialog: 'Powitalne intro wideo', skip: 'Pomiń intro', soundOn: 'Włącz dźwięk', soundOff: 'Wycisz', play: 'Odtwórz intro' },
    en: { dialog: 'Welcome intro video', skip: 'Skip intro', soundOn: 'Sound on', soundOff: 'Mute', play: 'Play intro' },
    de: { dialog: 'Begrüßungsvideo', skip: 'Intro überspringen', soundOn: 'Ton an', soundOff: 'Stumm', play: 'Intro abspielen' }
  };

  function getLang() {
    const loc = (window.EkoCCI18n && typeof window.EkoCCI18n.getLocale === 'function')
      ? window.EkoCCI18n.getLocale()
      : ((document.documentElement && document.documentElement.lang) || 'pl').slice(0, 2).toLowerCase();
    return L[loc] || L.pl;
  }

  let activeBox = null;

  function showIntro({ force = false } = {}) {
    if (activeBox) return;

    if (!force) {
      let seen = false;
      try { seen = sessionStorage.getItem(KEY) === '1'; } catch (e) { seen = true; }
      const saveData = !!(navigator.connection && navigator.connection.saveData);
      const params = new URLSearchParams(location.search);
      if (seen || saveData || params.get('intro') === '0') return;
      try { sessionStorage.setItem(KEY, '1'); } catch (e) {}
    }

    const t = getLang();
    const reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

    const cssId = 'wioletta-intro-style';
    if (!document.getElementById(cssId)) {
      const css = document.createElement('style');
      css.id = cssId;
      css.textContent = `
.wi-intro{position:fixed;inset:0;z-index:2147483000;background:#000;display:flex;align-items:center;justify-content:center;opacity:1;transition:opacity .6s ease}
.wi-intro.is-out{opacity:0;pointer-events:none}
.wi-intro video{width:100%;height:100%;object-fit:contain;background:#000}
.wi-intro-btn{position:absolute;min-width:44px;min-height:44px;display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:0 18px;border-radius:22px;border:1px solid rgba(196,163,90,.6);background:rgba(5,7,10,.62);color:#f5eedf;font:600 13px/1 'Plus Jakarta Sans',system-ui,sans-serif;letter-spacing:.06em;text-transform:uppercase;cursor:pointer;-webkit-tap-highlight-color:transparent;backdrop-filter:blur(6px);touch-action:manipulation}
.wi-intro-btn:hover{border-color:#D4B578;color:#fff}
.wi-intro-btn:focus-visible{outline:2px solid #E2CC9A;outline-offset:2px}
.wi-intro-skip{top:max(16px,env(safe-area-inset-top));right:max(16px,env(safe-area-inset-right))}
.wi-intro-sound{bottom:max(18px,env(safe-area-inset-bottom));left:max(16px,env(safe-area-inset-left))}
.wi-intro-play{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:76px;height:76px;border-radius:50%;border:0;background:#FF7A00;color:#fff;font-size:28px;cursor:pointer;display:none;align-items:center;justify-content:center;touch-action:manipulation}
.wi-intro-play:hover{background:#FF8C33}.wi-intro-play:active{background:#E66A00}
.wi-intro-play:focus-visible{outline:3px solid #fff;outline-offset:3px}
.wi-intro.needs-tap .wi-intro-play{display:inline-flex}
.wi-intro-bar{position:absolute;left:0;bottom:0;height:3px;width:0;background:#C4A35A}
@media (prefers-reduced-motion:reduce){.wi-intro{transition:none}}`;
      document.head.appendChild(css);
    }

    const box = document.createElement('div');
    box.className = 'wi-intro';
    box.id = 'wiolettaIntro';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', t.dialog);
    activeBox = box;

    const video = document.createElement('video');
    video.src = '/images/wioletta/wioletta-intro.mp4';
    video.poster = '/images/wioletta/wioletta-intro-poster.jpg';
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    video.setAttribute('muted', '');
    video.preload = 'auto';
    video.setAttribute('aria-label', t.dialog);

    const skip = document.createElement('button');
    skip.type = 'button';
    skip.className = 'wi-intro-btn wi-intro-skip';
    skip.innerHTML = `${t.skip} <span aria-hidden="true" style="font-size:16px;line-height:1;margin-left:4px;">✕</span>`;
    skip.setAttribute('aria-label', t.skip);

    const sound = document.createElement('button');
    sound.type = 'button';
    sound.className = 'wi-intro-btn wi-intro-sound';
    sound.setAttribute('aria-pressed', 'false');

    const syncSound = () => {
      const isMuted = video.muted;
      const icon = isMuted ? '🔇' : '🔊';
      const label = isMuted ? t.soundOn : t.soundOff;
      sound.innerHTML = `<span aria-hidden="true">${icon}</span> <span>${label}</span>`;
      sound.setAttribute('aria-label', label);
      sound.setAttribute('aria-pressed', isMuted ? 'false' : 'true');
    };
    syncSound();

    const play = document.createElement('button');
    play.type = 'button';
    play.className = 'wi-intro-play';
    play.textContent = '▶';
    play.setAttribute('aria-label', t.play);

    const bar = document.createElement('div');
    bar.className = 'wi-intro-bar';
    bar.setAttribute('aria-hidden', 'true');

    box.append(video, play, sound, skip, bar);

    let closed = false;
    const prevOverflow = document.body ? document.body.style.overflow : '';

    function close() {
      if (closed) return;
      closed = true;
      try { video.pause(); } catch (e) {}
      box.classList.add('is-out');
      if (document.body) document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKey, true);
      setTimeout(() => {
        box.remove();
        if (activeBox === box) activeBox = null;
        video.removeAttribute('src');
        try { video.load(); } catch (e) {}
      }, reduced ? 0 : 650);
      document.dispatchEvent(new CustomEvent('cc:wioletta-intro-closed'));
    }

    function onKey(e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        close();
      }
    }

    function start() {
      box.classList.remove('needs-tap');
      const p = video.play();
      if (p && typeof p.catch === 'function') {
        p.catch(() => box.classList.add('needs-tap'));
      }
    }

    skip.addEventListener('click', close);
    play.addEventListener('click', start);
    sound.addEventListener('click', () => {
      video.muted = !video.muted;
      syncSound();
      if (video.paused) start();
    });
    video.addEventListener('ended', close);
    video.addEventListener('error', close);
    video.addEventListener('timeupdate', () => {
      if (video.duration) {
        bar.style.width = (100 * video.currentTime / video.duration).toFixed(2) + '%';
      }
    });
    document.addEventListener('keydown', onKey, true);

    document.body.appendChild(box);
    document.body.style.overflow = 'hidden';
    skip.focus({ preventScroll: true });

    if (reduced) {
      box.classList.add('needs-tap');
    } else {
      start();
    }

    // Bezpiecznik: intro nigdy nie blokuje strony dłużej niż 25 s.
    setTimeout(close, 25000);
  }

  // API publiczne
  window.CCWiolettaIntro = Object.freeze({
    show: showIntro,
    replay: () => showIntro({ force: true }),
    getSeen: () => {
      try { return sessionStorage.getItem(KEY) === '1'; } catch (e) { return false; }
    },
    reset: () => {
      try { sessionStorage.removeItem(KEY); } catch (e) {}
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => showIntro(), { once: true });
  } else {
    showIntro();
  }
})();
