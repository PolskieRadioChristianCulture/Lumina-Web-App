/**
 * LUMINA - Dynamic Scroll To Top Button Module
 * Ustępuje kanonicznemu standardowi CC (js/cc-back-to-top.js).
 * Zabezpiecza przed duplikacją i nakładaniem się przycisków przewijania.
 */
(() => {
  'use strict';
  const cleanup = () => {
    const btn = document.getElementById('luminaScrollTop');
    if (btn) btn.remove();
    const styles = document.getElementById('lumina-scroll-top-styles');
    if (styles) styles.remove();
    document.querySelectorAll('.lumina-scroll-top, .lumina-scroll-top-btn').forEach(el => el.remove());
  };

  cleanup();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', cleanup, { once: true });
  }
  window.addEventListener('load', cleanup, { once: true });
})();
