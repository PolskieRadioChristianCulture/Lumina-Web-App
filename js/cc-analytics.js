/*
 * Kluczowe zdarzenia GA4 ekosystemu Christian Culture — @007, plan zatwierdzony przez L0 26.10.2026
 * (JOMA: raporty/A007_GA4_PLAN_ZDARZEN_I_FILTRA_2026-10-26.md).
 * Ładowany zaraz po fragmencie GA; wszystko łapie sam (kliknięcia, odtwarzanie, udostępnianie),
 * więc odtwarzacze i strony nie muszą nic wołać. Inne skrypty mogą użyć window.ccTrack(nazwa, parametry).
 *
 *  radio_play     start radia na żywo (strumienie zeno.fm i podobne)       — kluczowe
 *  audio_play     start nagrania audio (Biblia, podcast)
 *  lesson_view    otwarcie lekcji Kursu Codziennego / Akademii              — kluczowe
 *  login          udane logowanie do LUMINA (woła lumina-db.js)             — kluczowe
 *  donate_click   klik w Wspieraj / Patronite / wpłatę                       — kluczowe
 *  contact_click  klik w telefon, e-mail, WhatsApp, Messenger                — kluczowe
 *  share          udostępnienie strony
 *  search         zapytanie w wyszukiwarce CC
 *
 * Ruch własny (traffic_type=internal) ustawia sam fragment GA — patrz scripts/apply-ga-internal-traffic.mjs.
 */
(function () {
  'use strict';
  if (window.ccTrack) return;

  function ccTrack(name, params) {
    try {
      if (typeof window.gtag !== 'function') return;
      window.gtag('event', name, Object.assign({ transport_type: 'beacon' }, params || {}));
    } catch (_) {}
  }
  window.ccTrack = ccTrack;

  const path = location.pathname;

  // Lekcja: /akademia/<kurs>/dzien-01, /kursy/<kurs>/lekcja-3 (z .html lub /index.html)
  const lesson = path.match(/^\/(?:akademia|kursy)\/([a-z0-9-]+)\/((?:dzien|lekcja)-\d+)/i);
  if (lesson) ccTrack('lesson_view', { course: lesson[1], lesson: lesson[2] });

  // Radio i nagrania: każde odtworzenie <audio> (także niewstawionych do strony), raz na źródło w ciągu 30 min
  const LIVE = /zeno\.fm|icecast|shoutcast|radio\.co|\/stream|\.m3u8/i;
  const seen = {};
  const nativePlay = window.HTMLMediaElement && HTMLMediaElement.prototype.play;
  if (nativePlay) {
    HTMLMediaElement.prototype.play = function () {
      try {
        if (this instanceof HTMLAudioElement && !this.muted) {
          const src = this.currentSrc || this.src || '';
          const now = Date.now();
          if (src && !(seen[src] > now - 30 * 60 * 1000)) {
            seen[src] = now;
            let host = '';
            try { host = new URL(src, location.href).hostname; } catch (_) {}
            const live = LIVE.test(src) || this.duration === Infinity;
            ccTrack(live ? 'radio_play' : 'audio_play', { stream_host: host, stream: src.split('?')[0].slice(-80) });
          }
        }
      } catch (_) {}
      return nativePlay.apply(this, arguments);
    };
  }

  // Udostępnianie przez systemowe okno
  if (navigator.share) {
    const nativeShare = navigator.share.bind(navigator);
    navigator.share = function (data) {
      return nativeShare(data).then((r) => {
        ccTrack('share', { method: 'system', content_url: (data && data.url) || location.href });
        return r;
      });
    };
  }

  const DONATE = /\/wspieraj\b|patronite\.pl|paypal\.(com|me)|zrzutka\.pl|buycoffee\.to|buymeacoffee\.com|tipply\.pl|suppi\.pl/i;
  const SHARE = /facebook\.com\/sharer|twitter\.com\/intent|x\.com\/intent|wa\.me\/\?text|api\.whatsapp\.com\/send\?text|linkedin\.com\/share|t\.me\/share/i;
  document.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    const href = a.getAttribute('href') || '';
    const place = a.closest('[id]') ? a.closest('[id]').id : '';
    if (SHARE.test(href)) {
      ccTrack('share', { method: (href.match(/facebook|twitter|x\.com|whatsapp|wa\.me|linkedin|t\.me/i) || ['link'])[0].toLowerCase() });
    } else if (DONATE.test(href)) {
      ccTrack('donate_click', { link_url: a.href, place });
    } else if (/^(tel:|mailto:)|wa\.me\/\d|api\.whatsapp\.com\/send\?phone|m\.me\/|messenger\.com\/t\//i.test(href)) {
      const method = /^tel:/i.test(href) ? 'phone' : /^mailto:/i.test(href) ? 'email' : /whatsapp|wa\.me/i.test(href) ? 'whatsapp' : 'messenger';
      ccTrack('contact_click', { method, place });
    }
  }, true);

  // Wyszukiwarka CC: Enter w polu albo wybór wyniku (raz na zapytanie)
  let lastQuery = '';
  function trackSearch() {
    const input = document.getElementById('ccOmniInput');
    const q = input ? input.value.trim() : '';
    if (q.length < 2 || q === lastQuery) return;
    lastQuery = q;
    ccTrack('search', { search_term: q.slice(0, 100) });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target && e.target.id === 'ccOmniInput') trackSearch();
  }, true);
  document.addEventListener('click', (e) => {
    if (e.target.closest && e.target.closest('#ccOmniBody a')) trackSearch();
  }, true);
})();
