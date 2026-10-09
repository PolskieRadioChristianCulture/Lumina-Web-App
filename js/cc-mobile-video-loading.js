/* Load decorative videos on demand; do not profile users or touch messaging. */
(function () {
  'use strict';
  if (window.CCMobileVideoLoading || !window.IntersectionObserver) return;
  window.CCMobileVideoLoading = true;
  var entries = new Map();
  var observed = new WeakSet();
  var automatic = new Set();
  var connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  var motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  function allowed() {
    return !document.hidden && navigator.onLine !== false && !motion.matches &&
      !(connection && (connection.saveData || /^(slow-2g|2g|3g)$/.test(connection.effectiveType)));
  }
  function decorative(video) {
    return !video.controls && (video.muted || video.hasAttribute('muted'));
  }
  function update(entry) {
    var video = entry.target;
    var mission = video.closest('#missionCarousel .profile-card, #profilesCarousel .profile-card');
    var visible = entry.isIntersecting && entry.intersectionRatio >= 0.45 &&
      (!mission || mission.classList.contains('active-center-card'));
    if (!video.isConnected) { entries.delete(video); automatic.delete(video); observer.unobserve(video); return; }
    // Never take over user-operated players, sound, or communication attachments.
    if (!decorative(video)) { automatic.delete(video); return; }
    if (visible && allowed()) {
      if (video.paused) {
        video.playsInline = true;
        automatic.add(video);
        var result = video.play();
        if (result && result.catch) result.catch(function () { automatic.delete(video); });
      }
    } else if (automatic.has(video)) {
      video.pause();
      automatic.delete(video);
    }
  }
  var observer = new window.IntersectionObserver(function (changes) {
    changes.forEach(function (entry) { entries.set(entry.target, entry); update(entry); });
  }, { threshold: [0.1, 0.45, 0.8] });
  function register() {
    document.querySelectorAll('video').forEach(function (video) {
      if (observed.has(video) || !decorative(video)) return;
      // Keep an explicit page contract; never promote preload=none to metadata.
      if (!video.hasAttribute('preload')) video.preload = 'none';
      observed.add(video);
      observer.observe(video);
    });
  }
  function refresh() { entries.forEach(update); }
  document.addEventListener('visibilitychange', refresh);
  window.addEventListener('offline', refresh);
  window.addEventListener('online', refresh);
  window.addEventListener('pagehide', function () {
    automatic.forEach(function (video) { video.pause(); });
    automatic.clear();
  });
  window.addEventListener('pageshow', function () { register(); refresh(); });
  if (connection && connection.addEventListener) connection.addEventListener('change', refresh);
  if (motion.addEventListener) motion.addEventListener('change', refresh);
  else if (motion.addListener) motion.addListener(refresh);
  // Existing carousel code calls this when a center card or its videos change.
  window._registerVisibleVideos = function () { register(); refresh(); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', register, { once: true });
  else register();
})();
