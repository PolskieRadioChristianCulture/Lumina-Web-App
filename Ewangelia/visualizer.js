// Analyse the same-origin recording only. A cross-origin radio stream must not
// be routed through Web Audio without a verified CORS contract.
export function createAudioVisualizer(audio, container, env = window) {
  const bars = Array.from({ length: 40 }, () => {
    const bar = container.ownerDocument.createElement('i');
    container.append(bar);
    return bar;
  });
  const reduced = env.matchMedia('(prefers-reduced-motion: reduce)');
  let enabled = !reduced.matches;
  let context, analyser, source, bins, frame = 0, last = 0;
  const flat = () => bars.forEach(bar => { bar.style.transform = 'scaleY(0.06)'; });
  function stop() {
    env.cancelAnimationFrame(frame);
    frame = 0;
    flat();
  }
  function draw(timestamp) {
    if (audio.paused || audio.ended || container.ownerDocument.hidden || !enabled) return stop();
    if (timestamp - last >= 33) {
      last = timestamp;
      analyser.getByteFrequencyData(bins);
      bars.forEach((bar, i) => {
        // Logarithmic bands favour speech frequencies; silence stays flat.
        const from = Math.floor(Math.pow(i / bars.length, 2) * bins.length);
        const to = Math.max(from + 1, Math.floor(Math.pow((i + 1) / bars.length, 2) * bins.length));
        let peak = 0;
        for (let j = from; j < to; j++) peak = Math.max(peak, bins[j]);
        const level = audio.muted || audio.volume === 0 ? 0 : peak / 255;
        bar.style.transform = `scaleY(${Math.max(0.06, level)})`;
      });
    }
    frame = env.requestAnimationFrame(draw);
  }
  function start() {
    stop();
    if (analyser && !audio.paused && enabled && !container.ownerDocument.hidden) {
      frame = env.requestAnimationFrame(draw);
    }
  }
  async function prepare() {
    const AudioContext = env.AudioContext || env.webkitAudioContext;
    if (!AudioContext) return false;
    try {
      if (!context) {
        context = new AudioContext();
        source = context.createMediaElementSource(audio);
        // Keep the audible path independent of analyser/rendering failures.
        source.connect(context.destination);
        analyser = context.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.65;
        source.connect(analyser);
        bins = new Uint8Array(analyser.frequencyBinCount);
      }
      if (context.state !== 'running') await context.resume();
      return true;
    } catch {
      container.dataset.unavailable = 'true';
      return false;
    }
  }
  audio.addEventListener('playing', start);
  ['pause', 'ended', 'waiting', 'error', 'emptied'].forEach(event => audio.addEventListener(event, stop));
  reduced.addEventListener('change', () => { enabled = !reduced.matches; start(); });
  container.ownerDocument.addEventListener('visibilitychange', start);
  flat();
  return { prepare, stop, getEnabled: () => enabled, setEnabled(value) { enabled = Boolean(value); start(); } };
}
