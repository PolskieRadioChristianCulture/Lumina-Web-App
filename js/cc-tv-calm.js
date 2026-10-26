/*
 * Spokojna transmisja — @007, polecenie L0 26.10.2026 (para z /css/cc-tv-calm.css).
 * 1. Skala sceny 1920×1080 nie zmienia się, gdy telefon chowa/pokazuje pasek adresu (to dawało „skakanie”).
 * 2. Panel rozważania mieści się nad paskiem wiadomości (wcześniej wychodził poza scenę, pod pasek).
 */
(function () {
  'use strict';
  if (window.CCTvCalm) return;
  const state = { accepted: null };
  window.CCTvCalm = state;

  const container = document.getElementById('app-container');
  if (!container) return;

  // 1. Stabilna skala: skrypt strony przelicza scenę przy każdym „resize”; ten nasłuch działa po nim
  //    i przywraca poprzednie ustawienie, jeśli zmieniła się tylko wysokość o pasek przeglądarki.
  const URL_BAR_PX = 160;
  const snapshot = () => ({
    w: window.innerWidth,
    h: window.innerHeight,
    transform: container.style.transform,
    left: container.style.left,
    top: container.style.top
  });
  window.addEventListener('resize', () => {
    const now = snapshot();
    const a = state.accepted;
    if (a && a.transform && Math.abs(now.w - a.w) < 2 && Math.abs(now.h - a.h) < URL_BAR_PX) {
      // Skrypt strony przelicza skalę w swoim nasłuchu, który może działać po tym — przywracamy w następnej klatce,
      // przed narysowaniem, więc skok nie jest widoczny.
      requestAnimationFrame(() => {
        container.style.transform = a.transform;
        container.style.left = a.left;
        container.style.top = a.top;
      });
      return;
    }
    state.accepted = now;
  });
  window.addEventListener('orientationchange', () => { state.accepted = null; });
  // Punkt odniesienia od razu (skala jest już ustawiona skryptem na początku sceny) i ponownie po przeliczeniach strony
  state.accepted = snapshot();
  window.addEventListener('load', () => setTimeout(() => {
    if (!state.accepted || state.accepted.w !== window.innerWidth) state.accepted = snapshot();
    else Object.assign(state.accepted, { transform: container.style.transform, left: container.style.left, top: container.style.top });
  }, 1600));

  // 2. Panel rozważania nad paskiem wiadomości (pasek zaczyna się ok. 998 px sceny): najpierw przesunięcie w górę,
  //    nie wyżej niż pod zegar; dopiero gdy to nie wystarcza — niższa wysokość.
  const STAGE_BOTTOM = 985;
  function stageBox(el) {
    const ct = container.getBoundingClientRect();
    const scale = ct.width / 1920 || 1;
    const r = el.getBoundingClientRect();
    return { top: (r.top - ct.top) / scale, bottom: (r.bottom - ct.top) / scale };
  }
  function fitReflectionCard() {
    const card = document.querySelector('.reflection-canvas-card');
    if (!card || getComputedStyle(card).display === 'none') return;
    const box = stageBox(card);
    const overflow = box.bottom - STAGE_BOTTOM;
    if (overflow <= 1) return;
    const clock = document.getElementById('cardClockWidget');
    const minTop = clock ? stageBox(clock).bottom + 16 : 120;
    const shift = Math.min(overflow, Math.max(0, box.top - minTop));
    if (shift > 0) {
      const curTop = parseFloat(getComputedStyle(card).top) || 0;
      card.style.setProperty('top', Math.round(curTop - shift) + 'px', 'important');
    }
    const rest = overflow - shift;
    if (rest > 1) {
      const h = card.getBoundingClientRect().height / (container.getBoundingClientRect().width / 1920 || 1);
      card.style.setProperty('height', Math.max(200, Math.floor(h - rest)) + 'px', 'important');
    }
  }
  state.fit = fitReflectionCard;
  window.addEventListener('load', () => { fitReflectionCard(); setTimeout(fitReflectionCard, 1800); });
  // Układ dnia/wieczoru przełącza się w trakcie emisji — sprawdzamy co pół minuty
  setInterval(fitReflectionCard, 30000);
})();
