/**
 * ══════════════════════════════════════════════════════════════════════════
 *  SMART TV ENGINE & SPATIAL REMOTE CONTROL SYSTEM (Christian Culture)
 *  Obsługa telewizorów: Samsung Tizen, LG webOS, Android/Google TV, FireTV, Apple TV
 * ══════════════════════════════════════════════════════════════════════════
 */
(function (global) {
  'use strict';

  const SmartTV = {
    isTV: false,
    currentFocusIndex: 0,
    focusableElements: [],
    idleTimer: null,
    screensaverTimer: null,

    // 1. Detekcja platform telewizyjnych
    detect() {
      const ua = (navigator.userAgent || '').toLowerCase();
      const isTizen = ua.includes('tizen') || ua.includes('smart-tv') || ua.includes('samsung');
      const isWebOS = ua.includes('webos') || ua.includes('web0s') || ua.includes('netcast');
      const isAndroidTV = ua.includes('android tv') || ua.includes('googletv') || ua.includes('large screen') || ua.includes('aftb') || ua.includes('aftt');
      const isGenericTV = ua.includes('tv') || ua.includes('smarttv') || ua.includes('crkey') || ua.includes('hbbtv') || ua.includes('vidaa') || ua.includes('viera');

      this.isTV = isTizen || isWebOS || isAndroidTV || isGenericTV;

      if (this.isTV || window.location.search.includes('tv=1') || window.location.pathname.includes('tv')) {
        document.documentElement.classList.add('smart-tv-environment');
        document.body.classList.add('smart-tv-active');
        this.initTVMode();
      }

      return this.isTV;
    },

    // 2. Inicjalizacja trybu Smart TV
    initTVMode() {
      console.log('📺 [SmartTV Engine] Aktywowano tryb 10-Foot UI dla Smart TV.');
      this.bindRemoteKeys();
      this.refreshFocusables();
      this.setupIdleDetection();
    },

    // 3. Odświeżenie listy elementów dostępnych dla pilota
    refreshFocusables() {
      this.focusableElements = Array.from(
        document.querySelectorAll(
          '.focusable, button:not([disabled]), a:not([disabled]), input, [tabindex="0"]'
        )
      ).filter(el => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden' && el.offsetParent !== null;
      });

      if (this.focusableElements.length > 0 && !document.activeElement?.classList?.contains('focusable')) {
        this.setFocus(0);
      }
    },

    setFocus(index) {
      if (this.focusableElements.length === 0) return;
      if (index < 0) index = this.focusableElements.length - 1;
      if (index >= this.focusableElements.length) index = 0;

      this.currentFocusIndex = index;
      const target = this.focusableElements[this.currentFocusIndex];
      if (target) {
        target.focus();
        target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      }
    },

    // 4. Obsługa klawiszy pilota telewizora (D-Pad & Klawisze Numeryczne 1-6)
    bindRemoteKeys() {
      window.addEventListener('keydown', (e) => {
        this.resetIdleTimer();

        // Klawisze numeryczne 1-8 (Szybki wybór stacji 1-6, CCTV24 TV 7, VOD 8)
        if (e.key >= '1' && e.key <= '8') {
          const channelNum = parseInt(e.key, 10);
          if (typeof global.onTVQuickChannel === 'function') {
            global.onTVQuickChannel(channelNum);
            e.preventDefault();
            return;
          }
        }

        // Klawisze odtwarzacza (Play / Pause / Stop)
        if (e.key === 'MediaPlayPause' || e.keyCode === 179 || e.keyCode === 415 || e.keyCode === 19) {
          if (typeof global.onTVTogglePlay === 'function') {
            global.onTVTogglePlay();
            e.preventDefault();
            return;
          }
        }

        // D-Pad Nawigacja
        switch (e.key) {
          case 'ArrowRight':
            this.navigateSpatial('right');
            e.preventDefault();
            break;
          case 'ArrowLeft':
            this.navigateSpatial('left');
            e.preventDefault();
            break;
          case 'ArrowDown':
            this.navigateSpatial('down');
            e.preventDefault();
            break;
          case 'ArrowUp':
            this.navigateSpatial('up');
            e.preventDefault();
            break;
          case 'Enter':
          case 'Ok':
            if (document.activeElement) {
              document.activeElement.click();
            }
            break;
          case 'Escape':
          case 'Back':
          case 'BrowserBack':
          case 'XF86Back':
            if (typeof global.onTVBack === 'function') {
              global.onTVBack();
              e.preventDefault();
            }
            break;
        }
      });
    },

    // 5. Inteligentna nawigacja przestrzenna (Spatial Navigation)
    navigateSpatial(direction) {
      this.refreshFocusables();
      if (this.focusableElements.length === 0) return;

      const current = document.activeElement;
      if (!current || !this.focusableElements.includes(current)) {
        this.setFocus(0);
        return;
      }

      const currentRect = current.getBoundingClientRect();
      let bestCandidate = null;
      let minDistance = Infinity;

      this.focusableElements.forEach((el) => {
        if (el === current) return;
        const rect = el.getBoundingClientRect();

        let isCorrectDirection = false;
        if (direction === 'right') isCorrectDirection = rect.left >= currentRect.left + 5;
        if (direction === 'left') isCorrectDirection = rect.right <= currentRect.right - 5;
        if (direction === 'down') isCorrectDirection = rect.top >= currentRect.top + 5;
        if (direction === 'up') isCorrectDirection = rect.bottom <= currentRect.bottom - 5;

        if (isCorrectDirection) {
          const dx = (rect.left + rect.width / 2) - (currentRect.left + currentRect.width / 2);
          const dy = (rect.top + rect.height / 2) - (currentRect.top + currentRect.height / 2);
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < minDistance) {
            minDistance = dist;
            bestCandidate = el;
          }
        }
      });

      if (bestCandidate) {
        const nextIdx = this.focusableElements.indexOf(bestCandidate);
        this.setFocus(nextIdx);
      } else {
        // Fallback sekwencyjny
        if (direction === 'right' || direction === 'down') {
          this.setFocus(this.currentFocusIndex + 1);
        } else {
          this.setFocus(this.currentFocusIndex - 1);
        }
      }
    },

    // 6. Automatyczne ukrywanie kursora i ochrona ekranu OLED
    setupIdleDetection() {
      this.resetIdleTimer();
      ['mousemove', 'keydown', 'click'].forEach(evt => {
        window.addEventListener(evt, () => this.resetIdleTimer());
      });
    },

    resetIdleTimer() {
      document.body.classList.remove('tv-idle');
      clearTimeout(this.idleTimer);
      clearTimeout(this.screensaverTimer);

      this.idleTimer = setTimeout(() => {
        document.body.classList.add('tv-idle');
      }, 4000); // Ukryj interfejs i kursor po 4s
    }
  };

  // Auto-inicjalizacja przy starcie
  document.addEventListener('DOMContentLoaded', () => {
    SmartTV.detect();
  });

  global.SmartTV = SmartTV;
})(typeof window !== 'undefined' ? window : this);
