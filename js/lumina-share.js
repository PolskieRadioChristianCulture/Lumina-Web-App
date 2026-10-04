/**
 * ══════════════════════════════════════════════════════════════════════════
 * LUMINA ECOSYSTEM SHARE PROTOCOL & "L" ICON BUTTON (js/lumina-share.js)
 * Umożliwia publikację dowolnej treści z ekosystemu Christian Culture
 * bezpośrednio na Tablicy Społeczności LUMINA (lumina-tablica.html).
 * ══════════════════════════════════════════════════════════════════════════
 */

(function() {
  'use strict';

  // 1. STYLE DLA PRZYCISKU / IKONKI "L" LUMINA
  function injectLuminaShareStyles() {
    if (document.getElementById('luminaShareBtnGlobalStyles')) return;
    const style = document.createElement('style');
    style.id = 'luminaShareBtnGlobalStyles';
    style.textContent = `
      /* ── PRZYCISK LUMINA "L" SHARE ── */
      .lumina-share-btn-l {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        min-height: 44px;
        min-width: 44px;
        padding: 8px 16px;
        border-radius: 999px;
        background: linear-gradient(135deg, rgba(212, 175, 55, 0.22), rgba(15, 23, 42, 0.90));
        border: 1.5px solid rgba(250, 204, 21, 0.65);
        color: #ffffff;
        font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-weight: 700;
        font-size: 0.84rem;
        cursor: pointer;
        transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4), 0 0 12px rgba(234, 179, 8, 0.25);
        text-decoration: none;
        user-select: none;
        -webkit-user-select: none;
        vertical-align: middle;
        box-sizing: border-box;
      }

      .lumina-share-btn-l:hover {
        background: linear-gradient(135deg, rgba(250, 204, 21, 0.40), rgba(20, 30, 60, 0.95));
        border-color: #facc15;
        color: #ffffff;
        transform: translateY(-2px);
        box-shadow: 0 6px 22px rgba(234, 179, 8, 0.45), 0 0 18px rgba(250, 204, 21, 0.4);
      }

      .lumina-share-btn-l:active {
        transform: translateY(0);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
      }

      /* Ikona badge "L" z aureolą */
      .lumina-badge-l-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 26px;
        height: 26px;
        min-width: 26px;
        min-height: 26px;
        border-radius: 50%;
        background: linear-gradient(135deg, #facc15, #d97706);
        color: #07090e;
        font-family: 'Cinzel', Georgia, serif;
        font-weight: 900;
        font-size: 0.95rem;
        line-height: 1;
        box-shadow: 0 0 10px rgba(250, 204, 21, 0.6);
        text-shadow: 0 1px 1px rgba(255, 255, 255, 0.4);
      }

      .lumina-share-btn-l.icon-only {
        padding: 8px;
        width: 44px;
        height: 44px;
        border-radius: 50%;
      }

      .lumina-share-btn-l.icon-only .lumina-share-label {
        display: none;
      }

      /* Wariant kompaktowy */
      .lumina-share-btn-l.compact {
        padding: 6px 12px;
        font-size: 0.78rem;
      }
      .lumina-share-btn-l.compact .lumina-badge-l-icon {
        width: 22px;
        height: 22px;
        font-size: 0.82rem;
      }
    `;
    document.head.appendChild(style);
  }

  // 2. GŁÓWNA METODA PUBLIKACJI / UDOSTĘPNIENIA NA TABLICĘ LUMINA
  window.shareToLumina = function(options) {
    const opts = options || {};
    const title = opts.title || document.title || 'Christian Culture';
    const text = opts.text || '';
    const url = opts.url || window.location.href;
    const imageUrl = opts.imageUrl || opts.image || '';
    const videoUrl = opts.videoUrl || opts.video || '';

    // A. Jeśli jesteśmy już na lumina-tablica.html
    if (window.location.pathname.includes('lumina-tablica')) {
      if (typeof window.openQuickPostComposer === 'function') {
        window.openQuickPostComposer();
        setTimeout(function() {
          const tInput = document.getElementById('qpTitleInput');
          const descInput = document.getElementById('qpTextInput');
          const imgInput = document.getElementById('qpImageUrlInput');
          const vInput = document.getElementById('qpVideoUrlInput');

          if (tInput && title) tInput.value = title;
          if (descInput) {
            let fullText = text ? text + '\n\n' : '';
            if (url) fullText += '🔗 ' + url;
            descInput.value = fullText.trim();
          }
          if (imageUrl && typeof window.handleQpImageUrl === 'function') {
            window.handleQpImageUrl(imageUrl);
          }
          if (videoUrl && vInput) {
            vInput.value = videoUrl;
            if (typeof window.detectQp916Video === 'function') window.detectQp916Video(videoUrl);
          }
          if (typeof window.showToast === 'function') {
            window.showToast('Treść załadowana do wpisu! Kliknij Opublikuj ✨');
          }
        }, 150);
        return;
      }
    }

    // B. Jeśli jesteśmy na innej podstronie ekosystemu CC
    const params = new URLSearchParams();
    if (title) params.set('share_title', title);
    if (text) params.set('share_text', text);
    if (imageUrl) {
      params.set('share_image', imageUrl);
      params.set('share_img', imageUrl);
    }
    if (videoUrl) params.set('share_video', videoUrl);

    let query = params.toString();
    // Pełne treści (rozważania, artykuły) mogą przekroczyć limit długości adresu URL.
    // Wtedy przekazujemy je przez localStorage tej samej domeny, a w adresie tylko klucz.
    if (query.length > 6000) {
      try {
        const key = 'ls_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
        localStorage.setItem('lumina_share_payload_' + key, JSON.stringify({
          title: title, text: text, url: url, imageUrl: imageUrl, videoUrl: videoUrl, ts: Date.now()
        }));
        query = 'share_key=' + encodeURIComponent(key);
      } catch (e) { /* brak localStorage — zostaje pełny adres */ }
    }

    window.open('/lumina-tablica.html?' + query, '_blank');
  };

  // 3. GENERATOR KODU HTML PRZYCISKU "L"
  window.createLuminaShareButtonHTML = function(opts) {
    const options = opts || {};
    const title = (options.title || '').replace(/"/g, '&quot;');
    const text = (options.text || '').replace(/"/g, '&quot;');
    const url = (options.url || '').replace(/"/g, '&quot;');
    const image = (options.image || options.imageUrl || '').replace(/"/g, '&quot;');
    const video = (options.video || options.videoUrl || '').replace(/"/g, '&quot;');
    const iconOnly = Boolean(options.iconOnly);
    const compact = Boolean(options.compact);
    const customClass = options.className || '';
    const label = options.label || 'Opublikuj na LUMINA';

    const classes = [
      'lumina-share-btn-l',
      iconOnly ? 'icon-only' : '',
      compact ? 'compact' : '',
      customClass
    ].filter(Boolean).join(' ');

    return `
      <button type="button" class="${classes}"
        data-lumina-share="true"
        data-share-title="${title}"
        data-share-text="${text}"
        data-share-url="${url}"
        data-share-img="${image}"
        data-share-video="${video}"
        title="Opublikuj na Tablicy Społeczności LUMINA"
        aria-label="Opublikuj na Tablicy Społeczności LUMINA">
        <span class="lumina-badge-l-icon">L</span>
        <span class="lumina-share-label">${label}</span>
      </button>
    `.trim();
  };

  // 4. GLOBALNY NASŁUCH ZDARZEŃ KLIKNIĘCIA DLA ELEMENTÓW Z DANYMI
  document.addEventListener('click', function(e) {
    const btn = e.target.closest('[data-lumina-share="true"], .btn-share-lumina, .lumina-share-trigger');
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();

    const title = btn.getAttribute('data-share-title') || btn.getAttribute('data-title') || document.title;
    const text = btn.getAttribute('data-share-text') || btn.getAttribute('data-text') || '';
    const url = btn.getAttribute('data-share-url') || btn.getAttribute('data-url') || window.location.href;
    const imageUrl = btn.getAttribute('data-share-img') || btn.getAttribute('data-image') || '';
    const videoUrl = btn.getAttribute('data-share-video') || btn.getAttribute('data-video') || '';

    window.shareToLumina({
      title: title,
      text: text,
      url: url,
      imageUrl: imageUrl,
      videoUrl: videoUrl
    });
  });

  // 5. AUTOMATYCZNE DOŁĄCZANIE "L" OBOK ISTNIEJĄCYCH PRZYCISKÓW UDOSTĘPNIANIA
  //    Działa na każdej podstronie, która ładuje ten skrypt. Pomija strony LUMINA
  //    (tam działa przycisk „Tablica” w oknie udostępniania) oraz miejsca,
  //    gdzie „L” już jest. Wyłączenie: <body data-lumina-auto="off"> lub data-no-lumina na elemencie.
  function pageMeta(name) {
    const el = document.querySelector('meta[property="' + name + '"], meta[name="' + name + '"]');
    return el ? (el.getAttribute('content') || '').trim() : '';
  }

  function autoEnhanceShareButtons() {
    if (document.body && document.body.getAttribute('data-lumina-auto') === 'off') return;
    const path = window.location.pathname.toLowerCase();
    if (/\/lumina|tablica/.test(path)) return;

    const triggers = document.querySelectorAll(
      'button .fa-share-nodes, a .fa-share-nodes, button .fa-share-alt, a .fa-share-alt, ' +
      'button[onclick*="navigator.share"], button[onclick*="share" i][title*="Udostępnij"], button[title="Udostępnij"]'
    );
    triggers.forEach(function (node) {
      const trigger = node.closest('button, a');
      if (!trigger || trigger.dataset.luminaEnhanced) return;
      if (trigger.offsetParent === null && getComputedStyle(trigger).position !== 'fixed') return;
      trigger.dataset.luminaEnhanced = '1';
      if (trigger.closest('[data-no-lumina], #luminaShareModalOverlay, .lumina-share-grid')) return;
      if (trigger.matches('.lumina-share-btn-l, [data-lumina-share]')) return;
      const parent = trigger.parentElement;
      if (!parent) return;
      if (parent.querySelector('.lumina-share-btn-l, [data-lumina-share], .mb-action-lumina, [onclick*="ToLumina"]')) return;

      const wrap = document.createElement('div');
      wrap.innerHTML = window.createLuminaShareButtonHTML({
        title: pageMeta('og:title') || document.title,
        text: pageMeta('og:description') || pageMeta('description'),
        url: (document.querySelector('link[rel="canonical"]') || {}).href || window.location.href,
        image: pageMeta('og:image'),
        iconOnly: true,
        className: 'lumina-auto-l'
      });
      const btn = wrap.firstElementChild;
      if (btn) trigger.insertAdjacentElement('afterend', btn);
    });
  }

  let enhanceTimer = null;
  function scheduleEnhance() {
    clearTimeout(enhanceTimer);
    enhanceTimer = setTimeout(autoEnhanceShareButtons, 300);
  }

  function initAll() {
    injectLuminaShareStyles();
    autoEnhanceShareButtons();
    if ('MutationObserver' in window && document.body) {
      new MutationObserver(scheduleEnhance).observe(document.body, { childList: true, subtree: true });
    }
  }

  // Inicjalizacja przy starcie
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();
