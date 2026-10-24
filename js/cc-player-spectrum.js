/* One audible media path; sample the existing radio element, never a second player. */
(function () {
  'use strict';
  window.createCCPlayerSpectrum = function (audio, containers, env = window) {
    const groups = containers.filter(Boolean).map(el => Array.from(el.querySelectorAll('.eq-bar')));
    const reduced = env.matchMedia('(prefers-reduced-motion: reduce)');
    let enabled = !reduced.matches;
    const mark = state => containers.filter(Boolean).forEach(el => { if (el.dataset) el.dataset.spectrum = state; });
    let context, analyser, source, bins, frame = 0, last = 0;
    function stop() {
      env.cancelAnimationFrame(frame);
      frame = 0;
      groups.flat().forEach(bar => { bar.style.transform = 'scaleY(0.12)'; });
    }
    function draw(time) {
      if (audio.paused || audio.ended || audio.ownerDocument.hidden || !enabled || !analyser) return stop();
      if (time - last >= 33) {
        last = time;
        analyser.getByteFrequencyData(bins);
        groups.forEach(bars => bars.forEach((bar, i) => {
          const from = Math.floor((i / bars.length) ** 2 * bins.length);
          const to = Math.max(from + 1, Math.floor(((i + 1) / bars.length) ** 2 * bins.length));
          let peak = 0;
          for (let j = from; j < to; j++) peak = Math.max(peak, bins[j]);
          const value = audio.muted || audio.volume === 0 ? 0 : peak / 255;
          bar.style.transform = `scaleY(${Math.max(0.12, value)})`;
        }));
      }
      frame = env.requestAnimationFrame(draw);
    }
    function start() {
      stop();
      mark(!enabled ? 'disabled' : !analyser ? 'unavailable' : audio.paused ? 'paused' : audio.ownerDocument.hidden ? 'hidden' : 'measuring');
      if (analyser && !audio.paused && !audio.ownerDocument.hidden && enabled) frame = env.requestAnimationFrame(draw);
    }
    async function prepare() {
      const AudioContext = env.AudioContext || env.webkitAudioContext;
      if (!AudioContext) { mark('unavailable'); return false; }
      try {
        if (!context) {
          context = new AudioContext();
          source = context.createMediaElementSource(audio);
          source.connect(context.destination);
          analyser = context.createAnalyser();
          analyser.fftSize = 256;
          analyser.smoothingTimeConstant = 0.65;
          source.connect(analyser);
          bins = new Uint8Array(analyser.frequencyBinCount);
        }
        if (context.state !== 'running') await context.resume();
        start();
        return true;
      } catch { stop(); mark('unavailable'); return false; }
    }
    audio.addEventListener('playing', start);
    for (const event of ['pause', 'ended', 'error', 'waiting', 'emptied']) audio.addEventListener(event, stop);
    audio.ownerDocument.addEventListener('visibilitychange', start);
    reduced.addEventListener('change', () => { enabled = !reduced.matches; start(); });
    stop();
    return {prepare, stop, getEnabled: () => enabled, setEnabled(value) { enabled = Boolean(value); start(); }};
  };
})();
