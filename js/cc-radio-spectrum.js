// Spectrum of the existing radio output; no microphone or simulated samples.
(function () {
  'use strict';
  const canvas = document.querySelector('[data-radio-spectrum]');
  const panel = document.getElementById('ekocc-menu');
  const radio = window.CCChatRadio;
  if (!canvas || !panel || !radio) return;
  const context = canvas.getContext('2d');
  const note = document.querySelector('[data-spectrum-note]');
  const supported = new Set(['poland', 'global', 'biblia_audio', 'instrumental_worship', 'biblia_spiewana']);
  const bytes = new Uint8Array(256);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let source = 'poland', playing = false, frame = 0, last = 0, available = !!(window.AudioContext || window.webkitAudioContext);
  function draw(live) {
    if (!context) return;
    const width = canvas.width, height = canvas.height;
    context.clearRect(0, 0, width, height);
    context.fillStyle = getComputedStyle(panel).color || '#F3E5C8'; // kolor przycisków panelu krawędziowego
    let peak = 0;
    for (let bar = 0; bar < 20; bar++) {
      const start = Math.floor(Math.pow(128, bar / 20));
      const end = Math.max(start + 1, Math.floor(Math.pow(128, (bar + 1) / 20)));
      let sum = 0;
      for (let bin = start; bin < end; bin++) sum += live ? bytes[bin] : 0;
      const level = sum / (end - start) / 255;
      peak = Math.max(peak, level);
      const size = Math.max(2, level * (height - 8));
      context.fillRect(bar * width / 20 + 2, height - size - 2, width / 20 - 3, size);
    }
    canvas.dataset.peak = String(Math.round(peak * 255));
  }
  function tick(time) {
    frame = 0;
    if (!playing || !available || !supported.has(source) || document.hidden || !panel.classList.contains('open')) { draw(false); return; }
    if (time - last >= (reduced.matches ? 125 : 33)) {
      last = time;
      draw(radio.readSpectrum?.(bytes) === true);
    }
    frame = requestAnimationFrame(tick);
  }
  function refresh() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    note.hidden = available && supported.has(source);
    draw(false);
    if (playing && note.hidden && !document.hidden && panel.classList.contains('open')) frame = requestAnimationFrame(tick);
  }
  window.CCRadioSpectrum = {
    prepare(id) { available = radio.enableSpectrum?.(id) === true; refresh(); },
    setSource(id) { if (source !== id) { source = id; available = supported.has(id) && !!(window.AudioContext || window.webkitAudioContext); refresh(); } }
  };
  radio.subscribe(state => { playing = state.playing; refresh(); });
  new MutationObserver(refresh).observe(panel, { attributes: true, attributeFilter: ['class'] });
  document.addEventListener('visibilitychange', refresh);
  window.addEventListener('pagehide', () => { if (frame) cancelAnimationFrame(frame); });
  refresh();
})();
