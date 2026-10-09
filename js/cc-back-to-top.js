/* CC public-page standard. No account, storage, network or analytics access. */
(function () {
  'use strict';
  if (window.CCBackToTop) return;
  window.CCBackToTop = true;
  function mount() {
    if (!document.body) return;
    var button = document.getElementById('backToTopBtn');
    if (!button) {
      button = document.createElement('button');
      button.id = 'backToTopBtn';
      document.body.appendChild(button);
    }
    button.type = 'button';
    button.setAttribute('aria-label', 'Przewiń na górę');
    button.title = 'Przewiń na górę';
    button.setAttribute('data-cc-back-to-top', '');
    button.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" focusable="false"><path d="m6 12 6-6 6 6M12 6v14"/></svg>';
    var style = document.createElement('style');
    style.textContent = '#backToTopBtn[data-cc-back-to-top]{position:fixed!important;right:max(16px,env(safe-area-inset-right))!important;left:auto!important;top:auto!important;width:48px!important;height:48px!important;min-width:48px!important;min-height:48px!important;margin:0!important;padding:0!important;border:1px solid #b08a3c!important;border-radius:50%!important;background:#fff!important;color:#63470e!important;box-shadow:0 3px 14px #0003!important;z-index:900!important;align-items:center!important;justify-content:center!important;opacity:1!important;visibility:visible!important;transform:none!important;cursor:pointer;touch-action:manipulation}#backToTopBtn[data-cc-back-to-top]:focus-visible{outline:3px solid #2563eb!important;outline-offset:3px}[data-lumina-theme="dark"] #backToTopBtn[data-cc-back-to-top],html.dark #backToTopBtn[data-cc-back-to-top]{background:#171923!important;color:#ffe2a1!important}';
    document.head.appendChild(style);
    // Capture prevents old book/course handlers from issuing a second scroll.
    button.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopImmediatePropagation();
      window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    }, true);
    var pending = false;
    function update() {
      pending = false;
      var height = window.innerHeight;
      var right = window.innerWidth - 16;
      var bottom = 16;
      var visible = (window.scrollY || document.documentElement.scrollTop || 0) > 300;
      var modalOpen = Array.from(document.querySelectorAll('dialog[open], [aria-modal="true"]:not([hidden])')).some(function (modal) {
        var rect = modal.getBoundingClientRect();
        var css = window.getComputedStyle(modal);
        return rect.width > 0 && rect.height > 0 && css.visibility !== 'hidden' && css.display !== 'none';
      });
      if (document.fullscreenElement || modalOpen) visible = false;
      // Sample only the right-hand action lane, avoiding expensive whole-DOM scans.
      // Fixed players, navigation and floating controls reserve space above them.
      if (visible && document.elementsFromPoint) {
        for (var pass = 0; pass < 12; pass++) {
          var previous = bottom;
          [right - 24, right - 2].forEach(function (x) {
            [height - bottom - 2, height - bottom - 24, height - bottom - 46].forEach(function (y) {
              document.elementsFromPoint(x, y).forEach(function (element) {
                if (element === button || button.contains(element)) return;
                var position = window.getComputedStyle(element).position;
                if (position !== 'fixed' && position !== 'sticky') return;
                var rect = element.getBoundingClientRect();
                if (rect.width && rect.height && rect.top > height * 0.35 && rect.bottom > height - bottom - 48) {
                  bottom = Math.max(bottom, height - rect.top + 12);
                }
              });
            });
          });
          if (bottom === previous) break;
        }
      }
      if (bottom + 48 > height * 0.65) visible = false;
      button.style.setProperty('bottom', 'max(' + bottom + 'px, env(safe-area-inset-bottom))', 'important');
      button.style.setProperty('display', visible ? 'flex' : 'none', 'important');
    }
    function schedule() {
      if (!pending) { pending = true; window.requestAnimationFrame(update); }
    }
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    document.addEventListener('click', schedule, { passive: true });
    document.addEventListener('fullscreenchange', schedule);
    document.addEventListener('transitionend', schedule, { passive: true });
    if (window.visualViewport) window.visualViewport.addEventListener('resize', schedule, { passive: true });
    update();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true });
  else mount();
})();
