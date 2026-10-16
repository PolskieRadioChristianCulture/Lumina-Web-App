/* Christian Culture — Biblijne Uwielbienie: Pełna Biblia UBG 2025, Karaoke & TOP 100.
   Obsługa 1189 rozdziałów: Tryb A (Czytaj i śpiewaj) oraz Tryb B (Karaoke zsynchronizowane).
   Głosowanie TOP 100 oparte o bazę Cloudflare D1 z autoryzacją LUMINA.
*/
(() => {
  'use strict';
  if (typeof window !== 'undefined' && window.__CC_BU_KARAOKE_V4_READY__) return;
  if (typeof window !== 'undefined') window.__CC_BU_KARAOKE_V4_READY__ = true;

  const API = '/api/bu/v1';
  const BIBLE_BASE = '/data/bible/ubg-2025/';
  const KARAOKE_BASE = '/data/bu-karaoke/';
  const UBG_LICENSE = 'Uwspółcześniona Biblia Gdańska (UBG) © Fundacja Wrota Nadziei / Logos Media. Wykorzystanie ewangelizacyjne na licencji CC BY-ND 4.0.';

  // 1. STYLE CSS
  const existingStyle = document.getElementById('bu-karaoke-top100-styles');
  const style = existingStyle || document.createElement('style');
  style.id = 'bu-karaoke-top100-styles';
  style.textContent = `
    :root {
      --bu-font-size: 20px;
    }

    /* Modal Backdrop (dla TOP 100 oraz Fullscreen Dialog) */
    #bu-dialog-backdrop {
      display: none;
      position: fixed;
      inset: 0;
      z-index: 99999;
      padding: 12px;
      background: rgba(3, 7, 18, 0.92);
      backdrop-filter: blur(8px);
      align-items: center;
      justify-content: center;
    }
    #bu-dialog-backdrop.open {
      display: flex;
    }
    .bu-dialog {
      background: #0f172a;
      color: #f7f4ef;
      border: 1px solid rgba(196, 163, 90, 0.45);
      border-radius: 20px;
      width: min(980px, 100%);
      max-height: 94dvh;
      overflow: auto;
      padding: clamp(16px, 3vw, 32px);
      font: 15px/1.55 Inter, system-ui, sans-serif;
      box-shadow: 0 20px 60px rgba(0,0,0,0.8), inset 0 1px 0 rgba(226, 204, 154, 0.2);
    }
    .bu-dialog h2 {
      font: 600 clamp(22px, 3.5vw, 32px) 'Cinzel', Georgia, serif;
      color: #e2cc9a;
      margin: 0;
    }
    .bu-dialog-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 12px;
    }
    .bu-action {
      background: #19263b;
      color: #f7f4ef;
      border: 1px solid rgba(196, 163, 90, 0.4);
      border-radius: 10px;
      padding: 10px 16px;
      min-height: 44px;
      min-width: 44px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.2s ease;
    }
    .bu-action:hover {
      background: #233552;
      border-color: #e2cc9a;
    }
    .bu-action:focus-visible {
      outline: 3px solid #e2cc9a;
      outline-offset: 2px;
    }
    .bu-action:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .bu-action.primary {
      background: #c4a35a;
      color: #060a12;
      font-weight: 700;
      border-color: #e2cc9a;
    }
    .bu-action.primary:hover {
      background: #d4b46c;
    }
    .bu-muted {
      color: #b8c1d0;
      font-size: 13px;
      line-height: 1.5;
    }

    /* TOP 100 RANKING */
    .bu-ranking {
      display: grid;
      gap: 10px;
      margin-top: 15px;
    }
    .bu-rank {
      display: grid;
      grid-template-columns: 1fr auto auto;
      gap: 12px;
      align-items: center;
      padding: 12px 14px;
      border: 1px solid rgba(55, 66, 88, 0.6);
      background: rgba(11, 18, 34, 0.6);
      border-radius: 12px;
    }
    .bu-rank strong {
      color: #e2cc9a;
      font-variant-numeric: tabular-nums;
      font-size: 14px;
    }
    @media (max-width: 560px) {
      .bu-rank {
        grid-template-columns: 1fr auto;
      }
      .bu-rank button {
        grid-column: 1 / -1;
      }
    }

    /* ========================================================================
       HERO KARAOKE & CZYTAJ I ŚPIEWAJ STAGE
       ======================================================================== */
    .hero-section { flex-direction: column; }
    .hero-karaoke-stage-wrapper {
      margin-top: 24px;
      margin-bottom: 24px;
      width: 100%;
      transition: all 0.3s ease;
    }
    .hero-karaoke-stage-wrapper.is-fullscreen {
      position: fixed;
      inset: 0;
      z-index: 100000;
      margin: 0;
      max-width: 100vw;
      max-height: 100vh;
      padding: clamp(12px, 3vw, 28px);
      background: #050811;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .hero-karaoke-inner {
      background: rgba(11, 18, 34, 0.95);
      border: 1px solid rgba(196, 163, 90, 0.4);
      border-radius: 20px;
      box-shadow: 0 16px 48px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(226, 204, 154, 0.2);
      backdrop-filter: blur(16px);
      padding: clamp(14px, 2.5vw, 24px);
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .hero-karaoke-stage-wrapper.is-fullscreen .hero-karaoke-inner {
      height: 100%;
      border-radius: 16px;
    }
    .hero-karaoke-topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
    }
    .hero-karaoke-heading {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }
    .hero-karaoke-badge {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      padding: 4px 8px;
      border-radius: 6px;
      background: rgba(196, 163, 90, 0.2);
      color: #e2cc9a;
      border: 1px solid rgba(196, 163, 90, 0.3);
    }
    .hero-karaoke-title {
      font-size: clamp(18px, 2.4vw, 26px);
      font-family: 'Cinzel', Georgia, serif;
      font-weight: 600;
      color: #f7f4ef;
      margin: 0;
    }
    .hero-karaoke-mode-tabs {
      display: flex;
      gap: 8px;
      background: rgba(7, 12, 24, 0.8);
      padding: 4px;
      border-radius: 12px;
      border: 1px solid rgba(55, 66, 88, 0.6);
    }
    .hero-mode-tab {
      min-height: 44px;
      padding: 8px 16px;
      border-radius: 8px;
      background: transparent;
      color: #cdd4e0;
      border: 0;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s ease;
    }
    .hero-mode-tab:hover:not(:disabled) {
      color: #ffe2a5;
    }
    .hero-mode-tab.is-active {
      background: #c4a35a;
      color: #060a12;
      font-weight: 700;
      box-shadow: 0 2px 8px rgba(0,0,0,0.4);
    }
    .hero-mode-tab:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
    .hero-karaoke-controls {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .hero-karaoke-ctrl-btn {
      min-width: 44px;
      min-height: 44px;
      border-radius: 10px;
      background: #19263b;
      color: #f7f4ef;
      border: 1px solid rgba(196, 163, 90, 0.3);
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }
    .hero-karaoke-ctrl-btn:hover {
      background: #233552;
      border-color: #e2cc9a;
    }
    .hero-karaoke-ctrl-btn.close {
      color: #ff9d9d;
    }
    .bu-verse-pill {
      display: inline-block;
      padding: 2px 7px;
      border-radius: 6px;
      background: rgba(196, 163, 90, 0.22);
      border: 1px solid rgba(196, 163, 90, 0.45);
      color: #e2cc9a;
      font-size: 11px;
      font-weight: 700;
      margin-right: 8px;
      vertical-align: middle;
      letter-spacing: 0.5px;
    }
    .bu-line.is-instrumental {
      font-style: italic;
      color: #94a3b8;
      border-left-color: #64748b;
      background: rgba(30, 41, 59, 0.35);
    }

    /* Pasek wyboru księgi i rozdziału */
    .hero-karaoke-selector-row {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
      padding: 8px 12px;
      background: rgba(7, 12, 24, 0.6);
      border-radius: 12px;
      border: 1px solid rgba(55, 66, 88, 0.5);
    }
    .hero-select-wrap {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .hero-select-label {
      font-size: 13px;
      color: #c4a35a;
      font-weight: 600;
    }
    .hero-select {
      min-height: 44px;
      background: #101827;
      color: #f7f4ef;
      border: 1px solid rgba(196, 163, 90, 0.35);
      border-radius: 8px;
      padding: 6px 14px;
      font-size: 14px;
      cursor: pointer;
    }
    .hero-select:focus-visible {
      outline: 2px solid #e2cc9a;
    }
    .hero-karaoke-sync-status {
      font-size: 13px;
      color: #e2cc9a;
      margin-left: auto;
      font-weight: 500;
    }

    /* Viewport tekstów */
    .hero-karaoke-viewport {
      max-height: clamp(340px, 50vh, 640px);
      overflow-y: auto;
      overflow-x: hidden;
      scroll-behavior: smooth;
      border-radius: 14px;
      background: rgba(5, 10, 20, 0.7);
      padding: clamp(14px, 2vw, 24px);
      border: 1px solid rgba(55, 66, 88, 0.4);
    }
    .hero-karaoke-stage-wrapper.is-fullscreen .hero-karaoke-viewport {
      max-height: none;
      flex: 1;
    }

    /* TRYB A: CZYTAJ I ŚPIEWAJ (Tekst Biblii) */
    .hero-karaoke-lines[data-mode="reading"] {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .hero-karaoke-intro {
      font-style: italic;
      color: #e2cc9a;
      margin-bottom: 16px;
      padding: 10px 14px;
      border-left: 3px solid #c4a35a;
      background: rgba(196, 163, 90, 0.1);
      border-radius: 0 8px 8px 0;
      font-size: calc(var(--bu-font-size) * 0.85);
      line-height: 1.5;
    }
    .hero-karaoke-verse {
      display: flex;
      gap: 12px;
      line-height: 1.65;
      color: #e0e6ed;
      font-size: var(--bu-font-size);
      text-align: left;
    }
    .hero-karaoke-verse .verse-num {
      color: #c4a35a;
      font-weight: 700;
      min-width: 38px;
      font-variant-numeric: tabular-nums;
      user-select: none;
      flex-shrink: 0;
    }
    .hero-karaoke-verse .verse-text {
      flex: 1;
    }

    /* TRYB B: KARAOKE ZSYNCHRONIZOWANE */
    .hero-karaoke-lines[data-mode="synchronized"] {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .bu-line {
      display: block;
      width: 100%;
      background: transparent;
      color: #8b99ad;
      text-align: center;
      border: 0;
      border-radius: 12px;
      font-size: var(--bu-font-size);
      line-height: 1.55;
      padding: 12px 16px;
      cursor: pointer;
      transition: all 0.25s ease;
      font-family: inherit;
    }
    .bu-line:hover {
      background: rgba(196, 163, 90, 0.1);
      color: #f7f4ef;
    }
    .bu-line.active {
      color: #ffe2a5;
      background: rgba(196, 163, 90, 0.24);
      font-weight: 700;
      transform: scale(1.02);
      text-shadow: 0 0 16px rgba(226, 204, 154, 0.6);
      box-shadow: inset 0 0 0 1px #c4a35a, 0 4px 16px rgba(0,0,0,0.4);
    }
    .bu-line-text {
      display: inline;
    }
    .bu-word {
      display: inline-block;
      padding: 2px 6px;
      margin: 0 1px;
      border-radius: 9999px;
      transition: background-color 0.12s cubic-bezier(0.2, 0.8, 0.2, 1),
                  color 0.12s cubic-bezier(0.2, 0.8, 0.2, 1),
                  transform 0.12s cubic-bezier(0.2, 0.8, 0.2, 1),
                  box-shadow 0.12s cubic-bezier(0.2, 0.8, 0.2, 1);
      vertical-align: baseline;
    }
    /* Słowo aktualnie śpiewane – precyzyjna fioletowa pigułka #5e17eb wg wzorca */
    .bu-line.active .bu-word.is-singing {
      background-color: #5e17eb !important;
      color: #ffffff !important;
      font-weight: 800 !important;
      padding: 3px 14px !important;
      margin: 0 4px !important;
      border-radius: 9999px !important;
      transform: scale(1.14) !important;
      outline: 1.5px solid rgba(255, 255, 255, 0.45) !important;
      outline-offset: -1px !important;
      box-shadow: 0 4px 22px rgba(94, 23, 235, 0.85), 0 0 32px rgba(168, 85, 247, 0.65), inset 0 1px 1px rgba(255, 255, 255, 0.45) !important;
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6) !important;
      letter-spacing: 0.015em !important;
      z-index: 2;
      position: relative;
    }
    /* Słowa już zaśpiewane w bieżącym wersie */
    .bu-line.active .bu-word.is-sung {
      color: #ffe2a5 !important;
      font-weight: 700 !important;
      opacity: 0.95 !important;
    }
    /* Słowa oczekujące w bieżącym wersie */
    .bu-line.active .bu-word:not(.is-singing):not(.is-sung) {
      color: rgba(247, 244, 239, 0.55) !important;
      opacity: 0.65 !important;
    }
    .bu-line.prev,
    .bu-line.next {
      color: #cdd4e0;
      font-weight: 500;
    }

    .hero-karaoke-license {
      font-size: 12px;
      color: #8c97a8;
      text-align: center;
      padding-top: 8px;
      border-top: 1px solid rgba(55, 66, 88, 0.4);
      line-height: 1.4;
    }

    /* Trigger Button w Drilldown & Player */
    .chapter-lyrics-trigger-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      min-height: 44px;
      background: rgba(25, 38, 59, 0.85);
      color: #e2cc9a;
      border: 1px solid rgba(196, 163, 90, 0.35);
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .chapter-lyrics-trigger-btn:hover {
      background: #233552;
      border-color: #e2cc9a;
      color: #fff;
    }

    @media (max-width: 680px) {
      .hero-karaoke-topbar {
        flex-direction: column;
        align-items: flex-start;
      }
      .hero-karaoke-mode-tabs {
        width: 100%;
      }
      .hero-mode-tab {
        flex: 1;
        justify-content: center;
      }
      .hero-karaoke-controls {
        width: 100%;
        justify-content: flex-end;
      }
      .hero-karaoke-selector-row {
        flex-direction: column;
        align-items: stretch;
      }
      .hero-select-wrap {
        width: 100%;
      }
      .hero-select {
        flex: 1;
      }
      .hero-karaoke-sync-status {
        margin-left: 0;
        text-align: center;
      }
    }
    
    /* BEZPO?REDNIO NA TAPECIE HERO NAD ODTWARZACZEM (BEZ DODATKOWEGO OKNA) */
    .hero-section { flex-direction: column; }
    .hero-karaoke-stage-wrapper {
      position: relative;
      z-index: 5;
      margin-top: -28px !important;
      margin-bottom: 6px !important;
      width: 100%;
      transition: opacity 0.3s ease;
    }
    .hero-karaoke-inner {
      background: transparent !important;
      border: 0 !important;
      border-radius: 0 !important;
      box-shadow: none !important;
      backdrop-filter: none !important;
      padding: 0 !important;
      gap: 0 !important;
    }
    .hero-karaoke-topbar,
    .hero-karaoke-selector-row,
    .hero-karaoke-license {
      display: none !important;
    }
    .hero-karaoke-viewport {
      position: relative !important;
      max-height: clamp(210px, 28vh, 280px) !important;
      overflow-y: auto;
      overflow-x: hidden;
      scroll-behavior: auto !important;
      border-radius: 14px !important;
      background: rgba(5, 10, 20, 0.45) !important;
      backdrop-filter: blur(8px) !important;
      padding: 4px 12px !important;
      border: 1px solid rgba(196, 163, 90, 0.22) !important;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5) !important;
      scrollbar-width: none;
      -ms-overflow-style: none;
      mask-image: linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%);
      -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%);
    }
    .hero-karaoke-viewport::-webkit-scrollbar {
      display: none;
    }
    .hero-karaoke-viewport::before {
      content: '';
      position: sticky;
      top: 40%;
      display: block;
      height: 52px;
      margin-top: -26px;
      margin-bottom: -26px;
      border-radius: 12px;
      background: linear-gradient(90deg, transparent 0%, rgba(196, 163, 90, 0.04) 15%, rgba(196, 163, 90, 0.08) 50%, rgba(196, 163, 90, 0.04) 85%, transparent 100%);
      border-top: 1px dashed rgba(196, 163, 90, 0.22);
      border-bottom: 1px dashed rgba(196, 163, 90, 0.22);
      pointer-events: none;
      z-index: 0;
    }
    .hero-karaoke-lines[data-mode="synchronized"] {
      position: relative !important;
      display: flex !important;
      flex-direction: column !important;
      gap: 6px !important;
      padding: clamp(80px, 11vh, 120px) 14px !important;
      z-index: 1;
    }
    .bu-line {
      display: block;
      width: 100%;
      background: transparent !important;
      border: 1px solid transparent !important;
      box-shadow: none !important;
      color: rgba(226, 232, 240, 0.45) !important;
      font-size: var(--bu-font-size, clamp(17px, 1.85vw, 22px)) !important;
      line-height: 1.5 !important;
      padding: 8px 16px !important;
      border-radius: 12px !important;
      text-align: center;
      cursor: pointer;
      font-family: inherit;
      transition: color 0.22s ease, transform 0.22s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.22s ease, background-color 0.22s ease, border-color 0.22s ease !important;
      transform-origin: center center;
      opacity: 0.24;
      text-shadow: 0 2px 10px rgba(0, 0, 0, 0.95) !important;
    }
    .bu-line:hover {
      opacity: 0.85;
      color: #f7f4ef !important;
      background: rgba(196, 163, 90, 0.06) !important;
    }
    .bu-line.prev {
      opacity: 0.44;
      color: rgba(226, 232, 240, 0.68) !important;
      transform: scale(0.97);
    }
    .bu-line.next {
      opacity: 0.72;
      color: rgba(247, 244, 239, 0.88) !important;
      transform: scale(0.99);
    }
    .bu-line.active {
      opacity: 1 !important;
      color: #ffe2a5 !important;
      background: rgba(196, 163, 90, 0.12) !important;
      border-color: rgba(196, 163, 90, 0.38) !important;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4), inset 0 0 12px rgba(196, 163, 90, 0.08) !important;
      font-weight: 600 !important;
      transform: scale(1.04) !important;
      text-shadow: 0 2px 14px rgba(0, 0, 0, 0.95), 0 0 24px rgba(226, 204, 154, 0.7) !important;
      z-index: 2;
    }
    .bu-line.active.is-holding {
      opacity: 0.92 !important;
      border-color: rgba(196, 163, 90, 0.25) !important;
    }
    .bu-line.active.is-primed {
      opacity: 0.95 !important;
      color: #f7f4ef !important;
      border-color: rgba(168, 85, 247, 0.4) !important;
      background: rgba(124, 58, 237, 0.08) !important;
    }
    .bu-floating-follow-btn {
      position: absolute;
      bottom: 14px;
      right: 18px;
      z-index: 10;
      min-height: 44px;
      padding: 8px 16px;
      border-radius: 9999px;
      background: rgba(10, 18, 32, 0.92);
      color: #ffe2a5;
      border: 1px solid rgba(196, 163, 90, 0.5);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.6);
      font: 600 13px/1.4 Inter, system-ui, sans-serif;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s ease;
      opacity: 0;
      pointer-events: none;
      transform: translateY(8px);
    }
    .bu-floating-follow-btn.is-visible {
      opacity: 1;
      pointer-events: auto;
      transform: translateY(0);
    }
    .bu-floating-follow-btn:hover {
      background: #c4a35a;
      color: #060a12;
      border-color: #ffe2a5;
    }
    .hero-karaoke-lines[data-mode="reading"] {
      gap: 8px !important;
      text-align: center;
    }
    /* Settings stay in the player flow; the disclosure sits on the right. */
    .bu-karaoke-settings { position: static; width: 100%; }
    .bu-karaoke-settings[hidden] { display: none !important; }
    .bu-karaoke-settings > summary {
      display: flex; align-items: center; justify-content: center; gap: 9px;
      width: fit-content; min-height: 44px; margin-left: auto; padding: 10px 14px;
      box-sizing: border-box; list-style: none;
      border: 1px solid rgba(196, 163, 90, 0.3); border-radius: 10px;
      background: rgba(10, 17, 30, 0.45); color: #e2cc9a; cursor: pointer;
      font: 600 13px/1.6 Inter, system-ui, sans-serif;
    }
    .bu-karaoke-settings > summary::-webkit-details-marker { display: none; }
    .bu-karaoke-settings > summary::after {
      content: ''; width: 6px; height: 6px; margin-left: 5px;
      border-right: 1.5px solid currentColor; border-bottom: 1.5px solid currentColor;
      transform: rotate(45deg); transition: transform 0.18s ease;
    }
    .bu-karaoke-settings[open] > summary::after { transform: rotate(225deg); }
    .bu-karaoke-settings > summary:hover { background: rgba(196, 163, 90, 0.1); border-color: #c4a35a; }
    .bu-karaoke-settings > summary:focus-visible { outline: 3px solid #ffe2a5; outline-offset: 3px; }
    .hero-karaoke-sync-toolbar {
      display: grid; grid-template-columns: minmax(170px, 0.85fr) minmax(220px, 1.1fr) minmax(370px, 1.8fr);
      align-items: stretch; gap: 12px; width: 100%; margin-top: 14px;
      box-sizing: border-box; font-family: Inter, system-ui, sans-serif;
    }
    .bu-setting-group {
      display: flex; flex-direction: column; justify-content: space-between; gap: 12px;
      min-width: 0; padding: 16px; border-radius: 12px;
      border: 1px solid rgba(196, 163, 90, 0.18); background: rgba(7, 13, 24, 0.46);
    }
    .bu-setting-label { color: #d7c493; font-size: 11px; line-height: 1.4; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
    .bu-mode-toggle-group {
      display: grid; grid-template-columns: 1fr 1fr; gap: 3px; padding: 3px;
      background: rgba(4, 8, 16, 0.7); border: 1px solid rgba(148, 163, 184, 0.16); border-radius: 10px;
    }
    .bu-tool-tab, .bu-tool-btn {
      display: inline-flex; align-items: center; justify-content: center;
      min-height: 44px; min-width: 44px; padding: 8px 10px; box-sizing: border-box;
      border-radius: 8px; font: 600 12px/1.35 Inter, system-ui, sans-serif;
      cursor: pointer; transition: background 0.18s ease, border-color 0.18s ease;
    }
    .bu-tool-tab { border: 0; background: transparent; color: #cdd4e0; }
    .bu-tool-tab:hover { color: #ffe2a5; background: rgba(196, 163, 90, 0.08); }
    .bu-tool-tab.is-active { background: #c4a35a; color: #060a12; }
    .bu-tool-btn { border: 1px solid rgba(148, 163, 184, 0.24); background: #19263b; color: #f7f4ef; }
    .bu-tool-btn:hover { background: #233552; border-color: #c4a35a; }
    #bu-follow-btn { width: 100%; min-height: 52px; }
    .bu-offset-controls { display: grid; grid-template-columns: 1fr 68px 1fr auto; gap: 6px; align-items: stretch; min-height: 52px; }
    .bu-offset-val {
      display: flex; align-items: center; justify-content: center; min-width: 0;
      border: 1px solid rgba(196, 163, 90, 0.3); border-radius: 8px;
      color: #ffe2a5; background: rgba(196, 163, 90, 0.1);
      font-size: 12px; font-weight: 700; font-variant-numeric: tabular-nums;
    }
    .bu-tool-btn.reset { background: transparent; color: #c5cedd; }
    .hero-karaoke-viewport[data-display-mode="lines"] .bu-line.active {
      background: rgba(196, 163, 90, 0.22) !important;
      color: #ffe2a5 !important;
      border-radius: 12px !important;
      padding: 8px 16px !important;
      text-shadow: 0 0 16px rgba(226, 204, 154, 0.7) !important;
    }
    .hero-karaoke-viewport[data-display-mode="lines"] .bu-line.active .bu-word {
      background-color: transparent !important;
      color: inherit !important;
      transform: none !important;
      box-shadow: none !important;
      outline: none !important;
      padding: 0 1px !important;
      margin: 0 !important;
    }
    .bu-word.is-uncertain {
      border-bottom: 1.5px dotted rgba(251, 191, 36, 0.6) !important;
    }
    @media (max-width: 1050px) {
      .hero-karaoke-sync-toolbar { grid-template-columns: 1fr 1fr; }
      .bu-offset-group { grid-column: 1 / -1; }
    }
    @media (max-width: 640px) {
      .hero-karaoke-viewport {
        max-height: clamp(190px, 32vh, 240px) !important;
        padding: 4px 6px !important;
      }
      .hero-karaoke-lines[data-mode="synchronized"] {
        padding: clamp(65px, 10vh, 95px) 6px !important;
        gap: 4px !important;
      }
      .bu-line {
        font-size: clamp(15px, 4.2vw, 17.5px) !important;
        padding: 6px 8px !important;
        line-height: 1.42 !important;
      }
      .hero-karaoke-viewport::before {
        height: 44px;
        margin-top: -22px;
        margin-bottom: -22px;
        top: 38%;
      }
    }
    @media (max-width: 580px) {
      .hero-karaoke-sync-toolbar { grid-template-columns: 1fr; gap: 10px; }
      .bu-setting-group { padding: 12px; gap: 10px; }
      .bu-offset-controls { grid-template-columns: 1fr 62px 1fr; }
      .bu-offset-controls .reset { grid-column: 1 / -1; }
    }

    .bu-tool-btn:focus-visible, .bu-tool-tab:focus-visible, .bu-line:focus-visible {
      outline: 3px solid #ffe2a5 !important;
      outline-offset: 3px;
    }
    .hero-karaoke-viewport { overscroll-behavior-y: contain; }

    @media (prefers-reduced-motion: reduce) {
      .hero-karaoke-viewport,
      .bu-lines * {
        scroll-behavior: auto !important;
      }
    }
  `;
  if (!document.getElementById('bu-karaoke-top100-styles')) {
    document.head.append(style);
  }

  // 2. MODAL BACKDROP (TOP 100)
  const backdrop = document.createElement('div');
  backdrop.id = 'bu-dialog-backdrop';
  backdrop.innerHTML = `
    <section class="bu-dialog" role="dialog" aria-modal="true" aria-labelledby="bu-dialog-title" tabindex="-1">
      <div class="bu-dialog-head">
        <h2 id="bu-dialog-title"></h2>
        <button id="bu-dialog-close" class="bu-action" type="button" aria-label="Zamknij okno">Zamknij ✕</button>
      </div>
      <div id="bu-dialog-content"></div>
    </section>
  `;

  function attachDialog() {
    if (!document.getElementById('bu-dialog-backdrop') && !backdrop.isConnected) {
      document.body.append(backdrop);
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachDialog, { once: true });
  } else {
    attachDialog();
  }

  // 3. POMOCNICZE
  const make = (name, value, cls) => {
    const e = document.createElement(name);
    if (value !== undefined && value !== null) e.textContent = value;
    if (cls) e.className = cls;
    return e;
  };
  const button = (value, handler, primary = false) => {
    const e = make('button', value, 'bu-action' + (primary ? ' primary' : ''));
    e.type = 'button';
    e.addEventListener('click', handler);
    return e;
  };

  let previousFocus = null;
  const content = () => document.getElementById('bu-dialog-content');

  function closeDialog() {
    backdrop.classList.remove('open');
    content().replaceChildren();
    previousFocus?.focus?.();
  }
  function openDialog(title) {
    attachDialog();
    previousFocus = document.activeElement;
    document.getElementById('bu-dialog-title').textContent = title;
    backdrop.classList.add('open');
    document.getElementById('bu-dialog-close').focus();
  }
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop || e.target?.id === 'bu-dialog-close') closeDialog();
  });
  document.addEventListener('keydown', (e) => {
    if (!backdrop.classList.contains('open')) return;
    if (e.key === 'Escape') closeDialog();
  });

  // 4. PLAYER INTEGRATION
  function getTracks() {
    try {
      if (typeof window !== 'undefined' && Array.isArray(window.PLAYLIST_DATA) && window.PLAYLIST_DATA.length) {
        return window.PLAYLIST_DATA;
      }
      return (typeof PLAYLIST_DATA !== 'undefined' && Array.isArray(PLAYLIST_DATA)) ? PLAYLIST_DATA : [];
    } catch {
      return [];
    }
  }
  function currentTrack() {
    try {
      const tracks = getTracks();
      let idx = 0;
      if (typeof window !== 'undefined' && typeof window.CURRENT_TRACK_INDEX === 'number') {
        idx = window.CURRENT_TRACK_INDEX;
      } else if (typeof CURRENT_TRACK_INDEX === 'number') {
        idx = CURRENT_TRACK_INDEX;
      }
      return tracks[idx] || null;
    } catch {
      return null;
    }
  }
  function player() {
    try {
      if (typeof window !== 'undefined' && window.ytPlayer) return window.ytPlayer;
      return (typeof ytPlayer !== 'undefined') ? ytPlayer : null;
    } catch {
      return null;
    }
  }
  function currentTime() {
    try {
      return Number(player()?.getCurrentTime?.() || 0);
    } catch {
      return 0;
    }
  }
  const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

  // 5. CACHE I POBIERANIE TEKSTÓW BIBLII (UBG-2025) ORAZ SYNCHRONIZACJI
  const lyricsCache = new Map();
  const syncCache = new Map();

  async function loadChapterLyrics(chapterId) {
    if (!chapterId) throw new Error('Nie określono identyfikatora rozdziału.');
    if (lyricsCache.has(chapterId)) return lyricsCache.get(chapterId);

    const response = await fetch(`${BIBLE_BASE}${encodeURIComponent(chapterId)}.json`, { cache: 'default' });
    if (!response.ok) {
      throw new Error(`Tekst rozdziału ${chapterId} jest niedostępny (${response.status}).`);
    }
    const chapter = await response.json();
    if (!Array.isArray(chapter.verses) || !chapter.verses.length) {
      throw new Error(`Brak wersetów dla rozdziału ${chapterId}.`);
    }
    lyricsCache.set(chapterId, chapter);
    return chapter;
  }

  async function loadChapterSync(chapterId) {
    if (!chapterId) return null;
    if (syncCache.has(chapterId)) return syncCache.get(chapterId);

    try {
      const response = await fetch(`${KARAOKE_BASE}${encodeURIComponent(chapterId)}.json`, { cache: 'no-store' });
      if (!response.ok) {
        syncCache.set(chapterId, null);
        return null;
      }
      const data = await response.json();
      const isValidStatus = data.status === 'SYNC_READY' || data.status === 'approved' || data.status === 'SYNC_REVIEW';
      if (isValidStatus && Array.isArray(data.lines) && data.lines.length > 0) {
        const sorted = data.lines
          .filter(s => Number.isFinite(s.start) && Number.isFinite(s.end) && s.end >= s.start && s.text?.trim())
          .sort((a, b) => a.start - b.start);
        const result = { ...data, lines: sorted };
        syncCache.set(chapterId, result);
        return result;
      }
    } catch {
      // Brak pliku synchronizacji lub błąd sieci
    }
    syncCache.set(chapterId, null);
    return null;
  }

  // 6. STAN HERO KARAOKE (CC KARAOKE SYNC 2.0)
  let state = {
    chapterId: 'GEN-001',
    mode: 'reading', // 'reading' (Tryb A) lub 'sync' (Tryb B)
    displayMode: 'words', // 'lines' lub 'words'
    offsetMs: 0,
    fontSize: 20,
    autoScroll: true,
    userScrollTimeout: null,
    lyrics: null,
    sync: null,
    syncNodes: [],
    lastActiveIdx: -1,
    tickInterval: null,
    loadVersion: 0,
    isFullscreen: false
  };

  function getSavedOffset(chapterId) {
    if (!chapterId) return 0;
    try {
      const val = localStorage.getItem(`cc_karaoke_offset_${chapterId}`);
      if (val !== null) return parseInt(val, 10) || 0;
    } catch {}
    return 0;
  }

  function saveOffset(chapterId, offsetMs) {
    if (!chapterId) return;
    try {
      if (offsetMs === 0) {
        localStorage.removeItem(`cc_karaoke_offset_${chapterId}`);
      } else {
        localStorage.setItem(`cc_karaoke_offset_${chapterId}`, String(offsetMs));
      }
    } catch {}
  }

  function updateOffsetDisplay() {
    const badge = document.getElementById('bu-offset-val-badge');
    if (!badge) return;
    const ms = state.offsetMs || 0;
    if (ms > 0) {
      badge.textContent = `+${ms} ms`;
      badge.style.color = '#4ade80';
    } else if (ms < 0) {
      badge.textContent = `${ms} ms`;
      badge.style.color = '#fbbf24';
    } else {
      badge.textContent = '0 ms';
      badge.style.color = '#ffe2a5';
    }
  }

  function adjustOffset(deltaMs) {
    state.offsetMs = Math.max(-2000, Math.min(2000, (state.offsetMs || 0) + deltaMs));
    saveOffset(state.chapterId, state.offsetMs);
    updateOffsetDisplay();
    tickSync();
  }

  function resetOffset() {
    state.offsetMs = 0;
    saveOffset(state.chapterId, 0);
    updateOffsetDisplay();
    tickSync();
  }

  function setDisplayMode(mode) {
    if (mode !== 'lines' && mode !== 'words') return;
    state.displayMode = mode;
    try {
      localStorage.setItem('cc_bu_display_mode', mode);
    } catch {}
    const vp = document.getElementById('hero-karaoke-viewport');
    if (vp) vp.dataset.displayMode = mode;

    const btnLines = document.getElementById('bu-display-lines-btn');
    const btnWords = document.getElementById('bu-display-words-btn');
    for (const [button, selected] of [[btnLines, mode === 'lines'], [btnWords, mode === 'words']]) {
      button?.classList.toggle('is-active', selected);
      button?.setAttribute('aria-pressed', String(selected));
    }
    tickSync();
  }

  function syncTimeScale() {
    const duration = Number(player()?.getDuration?.() || 0);
    const syncDuration = Number(state.sync?.duration || 0);
    return duration > 15 && syncDuration > 15 && Math.abs(duration - syncDuration) > 1.5
      ? syncDuration / duration : 1;
  }

  function isMatchingTrack() {
    const track = currentTrack();
    if (!track || track.chapterId !== state.chapterId) return false;
    if (state.sync?.videoId && track.videoId !== state.sync.videoId) return false;
    const loadedId = player()?.getVideoData?.()?.video_id;
    return !loadedId || !track.videoId || loadedId === track.videoId;
  }

  function getLineScrollTop(line, vp) {
    let top = 0;
    let curr = line;
    while (curr && curr !== vp) {
      top += curr.offsetTop;
      curr = curr.offsetParent;
    }
    return top;
  }

  let activeScrollAnimation = null;

  function scrollToSmoothly(vp, targetY, instant = false) {
    if (!vp) return;
    if (activeScrollAnimation) {
      cancelAnimationFrame(activeScrollAnimation);
      activeScrollAnimation = null;
    }
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (instant || reducedMotion) {
      vp.scrollTop = targetY;
      return;
    }

    const startY = vp.scrollTop;
    const diff = targetY - startY;
    if (Math.abs(diff) < 2) return;

    const duration = Math.min(260, Math.max(120, Math.abs(diff) * 0.9));
    const startTime = performance.now();

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // easeOutCubic curve
      const ease = 1 - Math.pow(1 - progress, 3);
      vp.scrollTop = Math.round(startY + diff * ease);
      if (progress < 1) {
        activeScrollAnimation = requestAnimationFrame(step);
      } else {
        activeScrollAnimation = null;
      }
    }
    activeScrollAnimation = requestAnimationFrame(step);
  }

  function centerActiveLine(instant = false) {
    const vp = document.getElementById('hero-karaoke-viewport');
    if (!vp || state.lastActiveIdx < 0 || !state.autoScroll) return;
    const line = state.syncNodes[state.lastActiveIdx];
    if (!line) return;

    // Fixed Vocal Horizon: exactly 40% from top of viewport
    const lineTop = getLineScrollTop(line, vp);
    const focalAnchor = Math.round(vp.clientHeight * 0.40);
    const targetScroll = Math.max(0, Math.round(lineTop - focalAnchor));

    scrollToSmoothly(vp, targetScroll, instant);
  }

  function setAutoScroll(enabled) {
    state.autoScroll = Boolean(enabled);
    const button = document.getElementById('bu-follow-btn');
    if (button) {
      button.textContent = enabled ? 'Śledzenie tekstu: włączone' : 'Wróć do śpiewanego tekstu';
      button.setAttribute('aria-pressed', String(state.autoScroll));
    }
    const floatingBtn = document.getElementById('bu-floating-follow-btn');
    if (floatingBtn) {
      floatingBtn.classList.toggle('is-visible', !enabled);
    }
    if (enabled) centerActiveLine();
  }

  function resumeAutoScroll() {
    if (state.userScrollTimeout) {
      clearTimeout(state.userScrollTimeout);
      state.userScrollTimeout = null;
    }
    setAutoScroll(true);
  }

  function setSettingsAvailable(available) {
    const settings = document.getElementById('bu-karaoke-settings');
    if (!settings) return;
    settings.hidden = !available;
    const toolbar = document.getElementById('hero-karaoke-sync-toolbar');
    if (toolbar) toolbar.style.display = available ? 'grid' : 'none';
    if (!available) settings.open = false;
  }

  function ensureSyncToolbar() {
    let toolbar = document.getElementById('hero-karaoke-sync-toolbar');
    const stage = document.getElementById('hero-karaoke-stage');
    const vp = document.getElementById('hero-karaoke-viewport');
    const deck = document.querySelector('#player-section .player-deck');
    if (!stage || !vp || !deck) return;

    if (!toolbar) {
      toolbar = document.createElement('div');
      toolbar.id = 'hero-karaoke-sync-toolbar';
      toolbar.className = 'hero-karaoke-sync-toolbar';
      toolbar.setAttribute('role', 'toolbar');
      toolbar.setAttribute('aria-label', 'Narzędzia synchronizacji karaoke');
      toolbar.innerHTML = `
        <div class="bu-setting-group" role="group" aria-labelledby="bu-display-label">
          <span class="bu-setting-label" id="bu-display-label">Wyświetlanie</span>
          <div class="bu-mode-toggle-group">
            <button type="button" class="bu-tool-tab" id="bu-display-lines-btn" onclick="window.CC_BU_FEATURES?.setDisplayMode('lines')" aria-label="Prezentacja: Linijki">Linijki</button>
            <button type="button" class="bu-tool-tab is-active" id="bu-display-words-btn" onclick="window.CC_BU_FEATURES?.setDisplayMode('words')" aria-label="Prezentacja: Słowa">Słowa</button>
          </div>
        </div>
        <div class="bu-setting-group" role="group" aria-labelledby="bu-follow-label">
          <span class="bu-setting-label" id="bu-follow-label">Przewijanie</span>
          <button type="button" class="bu-tool-btn" id="bu-follow-btn" aria-pressed="true" onclick="window.CC_BU_FEATURES?.setAutoScroll(this.getAttribute('aria-pressed') !== 'true')">Śledzenie tekstu: włączone</button>
        </div>
        <div class="bu-setting-group bu-offset-group" role="group" aria-labelledby="bu-offset-label">
          <span class="bu-setting-label" id="bu-offset-label">Synchronizacja · krok 100 ms</span>
          <div class="bu-offset-controls">
            <button type="button" class="bu-tool-btn" id="bu-offset-minus-btn" onclick="window.CC_BU_FEATURES?.adjustOffset(100)" title="Tekst wcześniej o 100 ms" aria-label="Tekst wcześniej o 100 ms">Wcześniej</button>
            <span class="bu-offset-val" id="bu-offset-val-badge" title="Przesunięcie czasu" role="status">0 ms</span>
            <button type="button" class="bu-tool-btn" id="bu-offset-plus-btn" onclick="window.CC_BU_FEATURES?.adjustOffset(-100)" title="Tekst później o 100 ms" aria-label="Tekst później o 100 ms">Później</button>
            <button type="button" class="bu-tool-btn reset" id="bu-offset-reset-btn" onclick="window.CC_BU_FEATURES?.resetOffset()" title="Wyzeruj korektę do 0 ms" aria-label="Wyzeruj przesunięcie">Wyzeruj</button>
          </div>
        </div>
      `;
      const settings = document.createElement('details');
      settings.id = 'bu-karaoke-settings';
      settings.className = 'bu-karaoke-settings';
      const summary = document.createElement('summary');
      summary.textContent = 'Ustawienia karaoke';
      summary.setAttribute('aria-controls', toolbar.id);
      settings.append(summary, toolbar);
      deck.after(settings);
      settings.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && settings.open) {
          event.preventDefault();
          settings.open = false;
          summary.focus();
        }
      });
      if (!document.getElementById('bu-floating-follow-btn')) {
        const floatBtn = document.createElement('button');
        floatBtn.type = 'button';
        floatBtn.id = 'bu-floating-follow-btn';
        floatBtn.className = 'bu-floating-follow-btn';
        floatBtn.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
          <span>Wróć do tekstu</span>
        `;
        floatBtn.setAttribute('aria-label', 'Wróć do śpiewanego tekstu');
        floatBtn.onclick = () => resumeAutoScroll();
        vp.appendChild(floatBtn);
      }

      const pauseFollowing = () => {
        if (!state.autoScroll) return;
        setAutoScroll(false);
        if (state.userScrollTimeout) clearTimeout(state.userScrollTimeout);
        state.userScrollTimeout = setTimeout(() => {
          resumeAutoScroll();
        }, 4500);
      };
      vp.addEventListener('wheel', pauseFollowing, { passive: true });
      vp.addEventListener('touchmove', pauseFollowing, { passive: true });
      vp.addEventListener('keydown', (event) => {
        if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) pauseFollowing();
      });
      vp.tabIndex = 0;
      vp.setAttribute('aria-label', 'Tekst karaoke. Przewijanie zatrzymuje śledzenie tekstu na kilka sekund.');
    }

    try {
      const savedMode = localStorage.getItem('cc_bu_display_mode');
      if (savedMode === 'lines' || savedMode === 'words') {
        state.displayMode = savedMode;
      }
    } catch {}

    vp.dataset.displayMode = state.displayMode;
    const btnLines = document.getElementById('bu-display-lines-btn');
    const btnWords = document.getElementById('bu-display-words-btn');
    if (btnLines) btnLines.classList.toggle('is-active', state.displayMode === 'lines');
    if (btnWords) btnWords.classList.toggle('is-active', state.displayMode === 'words');

    setDisplayMode(state.displayMode);
    setAutoScroll(state.autoScroll);
    state.offsetMs = getSavedOffset(state.chapterId);
    updateOffsetDisplay();
    toolbar.style.display = 'grid';
    setSettingsAvailable(state.mode === 'sync' && stage.style.display !== 'none');
  }

  const BIBLE_BOOKS_CANON = [
    { code: "GEN", name: "Księga Rodzaju", chapters: 50 },
    { code: "EXO", name: "Księga Wyjścia", chapters: 40 },
    { code: "LEV", name: "Księga Kapłańska", chapters: 27 },
    { code: "NUM", name: "Księga Liczb", chapters: 36 },
    { code: "DEU", name: "Księga Powtórzonego Prawa", chapters: 34 },
    { code: "JOS", name: "Księga Jozuego", chapters: 24 },
    { code: "JDG", name: "Księga Sędziów", chapters: 21 },
    { code: "RUT", name: "Księga Rut", chapters: 4 },
    { code: "1SA", name: "1 Księga Samuela", chapters: 31 },
    { code: "2SA", name: "2 Księga Samuela", chapters: 24 },
    { code: "1KI", name: "1 Księga Królewska", chapters: 22 },
    { code: "2KI", name: "2 Księga Królewska", chapters: 25 },
    { code: "1CH", name: "1 Księga Kronik", chapters: 29 },
    { code: "2CH", name: "2 Księga Kronik", chapters: 36 },
    { code: "EZR", name: "Księga Ezdrasza", chapters: 10 },
    { code: "NEH", name: "Księga Nehemiasza", chapters: 13 },
    { code: "EST", name: "Księga Estery", chapters: 10 },
    { code: "JOB", name: "Księga Hioba", chapters: 42 },
    { code: "PSA", name: "Księga Psalmów", chapters: 150 },
    { code: "PRO", name: "Przypowieści Salomona", chapters: 31 },
    { code: "ECC", name: "Księga Kaznodziei", chapters: 12 },
    { code: "SNG", name: "Pieśń nad Pieśniami", chapters: 8 },
    { code: "ISA", name: "Księga Izajasza", chapters: 66 },
    { code: "JER", name: "Księga Jeremiasza", chapters: 52 },
    { code: "LAM", name: "Lamentacje Jeremiasza", chapters: 5 },
    { code: "EZK", name: "Księga Ezechiela", chapters: 48 },
    { code: "DAN", name: "Księga Daniela", chapters: 12 },
    { code: "HOS", name: "Księga Ozeasza", chapters: 14 },
    { code: "JOL", name: "Księga Joela", chapters: 3 },
    { code: "AMO", name: "Księga Amosa", chapters: 9 },
    { code: "OBA", name: "Księga Abdiasza", chapters: 1 },
    { code: "JON", name: "Księga Jonasza", chapters: 4 },
    { code: "MIC", name: "Księga Micheasza", chapters: 7 },
    { code: "NAH", name: "Księga Nahuma", chapters: 3 },
    { code: "HAB", name: "Księga Habakuka", chapters: 3 },
    { code: "ZEP", name: "Księga Sofoniasza", chapters: 3 },
    { code: "HAG", name: "Księga Aggeusza", chapters: 2 },
    { code: "ZEC", name: "Księga Zachariasza", chapters: 14 },
    { code: "MAL", name: "Księga Malachiasza", chapters: 4 },
    { code: "MAT", name: "Ewangelia Mateusza", chapters: 28 },
    { code: "MRK", name: "Ewangelia Marka", chapters: 16 },
    { code: "LUK", name: "Ewangelia Łukasza", chapters: 24 },
    { code: "JHN", name: "Ewangelia Jana", chapters: 21 },
    { code: "ACT", name: "Dzieje Apostolskie", chapters: 28 },
    { code: "ROM", name: "List do Rzymian", chapters: 16 },
    { code: "1CO", name: "1 List do Koryntian", chapters: 16 },
    { code: "2CO", name: "2 List do Koryntian", chapters: 13 },
    { code: "GAL", name: "List do Galacjan", chapters: 6 },
    { code: "EPH", name: "List do Efezjan", chapters: 6 },
    { code: "PHP", name: "List do Filipian", chapters: 4 },
    { code: "COL", name: "List do Kolosan", chapters: 4 },
    { code: "1TH", name: "1 List do Tesaloniczan", chapters: 5 },
    { code: "2TH", name: "2 List do Tesaloniczan", chapters: 3 },
    { code: "1TI", name: "1 List do Tymoteusza", chapters: 6 },
    { code: "2TI", name: "2 List do Tymoteusza", chapters: 4 },
    { code: "TIT", name: "List do Tytusa", chapters: 3 },
    { code: "PHM", name: "List do Filemona", chapters: 1 },
    { code: "HEB", name: "List do Hebrajczyków", chapters: 13 },
    { code: "JAS", name: "List Jakuba", chapters: 5 },
    { code: "1PE", name: "1 List Piotra", chapters: 5 },
    { code: "2PE", name: "2 List Piotra", chapters: 3 },
    { code: "1JN", name: "1 List Jana", chapters: 5 },
    { code: "2JN", name: "2 List Jana", chapters: 1 },
    { code: "3JN", name: "3 List Jana", chapters: 1 },
    { code: "JUD", name: "List Judy", chapters: 1 },
    { code: "REV", name: "Apokalipsa św. Jana", chapters: 22 }
  ];

  function getBooksList() {
    if (typeof window !== 'undefined' && Array.isArray(window.BIBLE_BOOKS) && window.BIBLE_BOOKS.length) {
      return window.BIBLE_BOOKS;
    }
    if (typeof BIBLE_BOOKS !== 'undefined' && Array.isArray(BIBLE_BOOKS) && BIBLE_BOOKS.length) {
      return BIBLE_BOOKS;
    }
    return BIBLE_BOOKS_CANON;
  }

  function initChapterSelectors() {
    const bookSelect = document.getElementById('hero-book-select');
    const chSelect = document.getElementById('hero-chapter-select');
    if (!bookSelect || !chSelect) return;

    if (!bookSelect.options.length) {
      bookSelect.innerHTML = '';
      const books = getBooksList();
      books.forEach(b => {
        const opt = document.createElement('option');
        opt.value = b.code;
        opt.textContent = `${b.name} (${b.code})`;
        bookSelect.appendChild(opt);
      });
    }

    // Ustawienie księgi
    const [bCode, chStr] = state.chapterId.split('-');
    const chNum = parseInt(chStr, 10) || 1;
    bookSelect.value = bCode;

    // Aktualizacja rozdziałów dla danej księgi
    const curBook = getBooksList().find(b => b.code === bCode) || { chapters: 50 };
    chSelect.innerHTML = '';
    for (let c = 1; c <= curBook.chapters; c++) {
      const opt = document.createElement('option');
      opt.value = c;
      opt.textContent = `Rozdział ${c}`;
      if (c === chNum) opt.selected = true;
      chSelect.appendChild(opt);
    }
  }

  function renderReadingMode(container, lyrics) {
    container.dataset.mode = 'reading';
    container.replaceChildren();

    if (lyrics.intro) {
      const intro = document.createElement('div');
      intro.className = 'hero-karaoke-intro';
      intro.textContent = lyrics.intro;
      container.appendChild(intro);
    }

    for (const verse of lyrics.verses) {
      const row = document.createElement('div');
      row.className = 'hero-karaoke-verse';
      row.dataset.verse = verse.number;

      const num = document.createElement('span');
      num.className = 'verse-num';
      num.textContent = `${verse.number}.`;

      const txt = document.createElement('span');
      txt.className = 'verse-text';
      txt.textContent = verse.text;

      row.appendChild(num);
      row.appendChild(txt);
      container.appendChild(row);
    }
  }

  function prepareLineWords(segment) {
    const text = (segment.text || '').trim();
    if (!text) return [];

    if (Array.isArray(segment.words) && segment.words.length > 0) {
      return segment.words.map(w => ({
        text: w.text || w.word || '',
        start: Number(w.start),
        end: Number(w.end),
        confidence: w.confidence !== undefined ? Number(w.confidence) : (segment.confidence || 0.95)
      }));
    }

    const rawWords = text.split(/\s+/).filter(Boolean);
    if (!rawWords.length) return [];

    const start = Number(segment.start);
    const end = Number(segment.end);
    const duration = Math.max(0.4, end - start);

    const weights = rawWords.map(w => {
      const clean = w.replace(/[.,;:!?„"»«—–\-\(\)]/g, '');
      return Math.max(2, clean.length);
    });
    const totalWeight = weights.reduce((acc, v) => acc + v, 0);

    let currentStart = start;
    const result = [];
    for (let i = 0; i < rawWords.length; i++) {
      const frac = weights[i] / totalWeight;
      const wordDur = duration * frac;
      const wordEnd = (i === rawWords.length - 1) ? end : Math.round((currentStart + wordDur) * 100) / 100;
      result.push({
        text: rawWords[i],
        start: Math.round(currentStart * 100) / 100,
        end: wordEnd,
        confidence: segment.confidence || 0.95
      });
      currentStart = wordEnd;
    }
    return result;
  }

  function updateActiveLineWords(lineBtn, segment, now, isHolding = false, isPrimed = false) {
    if (!lineBtn || !segment) return;
    const wordNodes = lineBtn._wordNodes;
    const wordsTiming = lineBtn._wordsTiming;
    if (!wordNodes || !wordsTiming || !wordNodes.length) return;

    if (state.displayMode === 'lines') {
      for (let i = 0; i < wordNodes.length; i++) {
        wordNodes[i].classList.remove('is-singing', 'is-sung');
      }
      return;
    }

    if (isHolding) {
      for (let i = 0; i < wordNodes.length; i++) {
        wordNodes[i].classList.add('is-sung');
        wordNodes[i].classList.remove('is-singing');
      }
      return;
    }

    if (isPrimed) {
      for (let i = 0; i < wordNodes.length; i++) {
        wordNodes[i].classList.remove('is-singing', 'is-sung');
      }
      return;
    }

    let activeWordIdx = -1;
    for (let i = 0; i < wordsTiming.length; i++) {
      const w = wordsTiming[i];
      if (now >= w.start && now < w.end) {
        activeWordIdx = i;
        break;
      }
    }

    if (activeWordIdx === -1 && now >= segment.start) {
      if (now >= segment.end) {
        activeWordIdx = wordsTiming.length - 1;
      } else {
        for (let i = wordsTiming.length - 1; i >= 0; i--) {
          if (now >= wordsTiming[i].start) {
            activeWordIdx = i;
            break;
          }
        }
      }
    }

    for (let i = 0; i < wordNodes.length; i++) {
      const wNode = wordNodes[i];
      if (i === activeWordIdx) {
        if (!wNode.classList.contains('is-singing')) {
          wNode.classList.add('is-singing');
        }
        wNode.classList.remove('is-sung');
      } else if (activeWordIdx >= 0 && i < activeWordIdx) {
        if (!wNode.classList.contains('is-sung')) {
          wNode.classList.add('is-sung');
        }
        wNode.classList.remove('is-singing');
      } else {
        wNode.classList.remove('is-singing', 'is-sung');
      }
    }
  }

  function renderSyncMode(container, syncData) {
    container.dataset.mode = 'synchronized';
    container.replaceChildren();
    state.syncNodes = [];
    state.lastActiveIdx = -1;
    ensureSyncToolbar();

    for (const [idx, segment] of syncData.lines.entries()) {
      const lineBtn = document.createElement('button');
      lineBtn.type = 'button';
      lineBtn.className = 'bu-line' + (segment.isInstrumental ? ' is-instrumental' : '');
      lineBtn.dataset.index = idx;
      lineBtn.dataset.start = segment.start;
      lineBtn.dataset.end = segment.end;
      lineBtn.title = `Przejdź do ${fmt(segment.start)}`;

      if (segment.verse) {
        const pill = document.createElement('span');
        pill.className = 'bu-verse-pill';
        pill.textContent = `W.${segment.verse}`;
        lineBtn.appendChild(pill);
      }

      const textSpan = document.createElement('span');
      textSpan.className = 'bu-line-text';

      const wordsTiming = prepareLineWords(segment);
      lineBtn._wordsTiming = wordsTiming;
      lineBtn._wordNodes = [];

      wordsTiming.forEach((w, wIdx) => {
        const wSpan = document.createElement('span');
        wSpan.className = 'bu-word';
        if (w.confidence !== undefined && w.confidence < 0.70) {
          wSpan.classList.add('is-uncertain');
          wSpan.title = 'Wskaźnik pewności AI < 70%';
        }
        wSpan.dataset.wordIdx = wIdx;
        wSpan.textContent = w.text;
        textSpan.appendChild(wSpan);
        lineBtn._wordNodes.push(wSpan);
        if (wIdx < wordsTiming.length - 1) {
          textSpan.appendChild(document.createTextNode(' '));
        }
      });

      lineBtn.appendChild(textSpan);

      lineBtn.addEventListener('click', () => {
        if (!isMatchingTrack()) {
          window.showToast?.('Włącz ten sam rozdział w odtwarzaczu, aby przewinąć nagranie.');
          return;
        }
        const seekTime = segment.start / syncTimeScale() - state.offsetMs / 1000;
        player()?.seekTo?.(Math.max(0, seekTime), true);
        tickSync();
      });

      container.appendChild(lineBtn);
      state.syncNodes.push(lineBtn);
    }
    tickSync();
  }

  function tickSync() {
    if (state.mode !== 'sync' || !state.sync || !state.syncNodes.length) return;
    const matching = isMatchingTrack();
    const now = (currentTime() + state.offsetMs / 1000) * syncTimeScale();
    const segments = state.sync.lines;
    if (!matching || !segments.length) return;

    let active = -1;
    let isPrimed = false;
    let isHolding = false;

    // 1. Direct segment hit
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      if (now >= seg.start && now < seg.end) {
        active = i;
        break;
      }
    }

    // 2. Inter-segment continuity & lookahead priming
    if (active === -1) {
      if (now < segments[0].start) {
        // Pre-track intro: prime the first verse on the focal horizon!
        active = 0;
        isPrimed = true;
      } else {
        let prevIdx = -1;
        for (let i = segments.length - 1; i >= 0; i--) {
          if (now >= segments[i].end) {
            prevIdx = i;
            break;
          }
        }
        if (prevIdx >= 0) {
          const nextIdx = prevIdx + 1;
          if (nextIdx < segments.length) {
            const nextStart = segments[nextIdx].start;
            const gap = nextStart - segments[prevIdx].end;
            // 550ms lookahead pre-scroll: glide to next line before singing begins
            if (now >= nextStart - 0.55) {
              active = nextIdx;
              isPrimed = true;
            } else if (gap < 3.2 || now < segments[prevIdx].end + 1.8) {
              // Continuity: hold previous line in sung state
              active = prevIdx;
              isHolding = true;
            } else {
              // Musical interlude
              active = -1;
            }
          } else {
            // End of track: hold final line
            active = prevIdx;
            isHolding = true;
          }
        }
      }
    }

    const statusEl = document.getElementById('hero-sync-status-indicator');
    if (statusEl) {
      if (active === -1) {
        statusEl.textContent = '♫ Przerwa muzyczna ···';
        statusEl.style.color = '#ffe2a5';
      } else {
        statusEl.textContent = '● Synchronizacja aktywna';
        statusEl.style.color = '#4ade80';
      }
    }

    if (active !== state.lastActiveIdx) {
      // Rebuild neighboring states after any jump, including backwards and into a pause.
      state.syncNodes.forEach((node, index) => {
        const isActive = (index === active);
        node.classList.toggle('active', isActive);
        node.classList.toggle('is-holding', isActive && isHolding);
        node.classList.toggle('is-primed', isActive && isPrimed);
        node.classList.toggle('prev', active >= 0 && index === active - 1);
        node.classList.toggle('next', active >= 0 && index === active + 1);
        if (isActive) node.setAttribute('aria-current', 'true');
        else node.removeAttribute('aria-current');
        if (!isActive) node._wordNodes?.forEach(word => word.classList.remove('is-singing', 'is-sung'));
      });
      state.lastActiveIdx = active;
      centerActiveLine();
    }

    if (active >= 0) {
      updateActiveLineWords(state.syncNodes[active], segments[active], now, isHolding, isPrimed);
    }
  }

  async function startChapterKaraoke(chapterId, requestedMode = null, showStage = true) {
    const stage = document.getElementById('hero-karaoke-stage');
    const container = document.getElementById('hero-karaoke-lines');
    if (!stage || !container) return;

    const targetId = chapterId || state.chapterId || 'GEN-001';
    const alreadyRendered = (
      state.chapterId === targetId &&
      state.lyrics &&
      container.children.length > 5 &&
      (!requestedMode || requestedMode === state.mode)
    );

    const loadVersion = ++state.loadVersion;
    state.chapterId = targetId;
    if (showStage) {
      stage.style.display = 'block';
    }

    if (alreadyRendered) {
      setSettingsAvailable(state.mode === 'sync');
      if (state.mode === 'sync' && state.sync && !state.tickInterval) {
        state.tickInterval = setInterval(tickSync, 40);
      }
      if (showStage) {
        
      }
      return;
    }

    if (state.tickInterval) clearInterval(state.tickInterval);
    state.tickInterval = null;
    state.lyrics = null;
    state.sync = null;
    state.syncNodes = [];
    state.lastActiveIdx = -1;
    const oldToolbar = document.getElementById('hero-karaoke-sync-toolbar');
    if (oldToolbar) oldToolbar.style.display = 'none';
    setSettingsAvailable(false);
    const titleEl = document.getElementById('hero-karaoke-title');
    const badgeEl = document.getElementById('hero-karaoke-badge');
    const statusEl = document.getElementById('hero-sync-status-indicator');
    const tabReading = document.getElementById('tab-mode-reading');
    const tabSync = document.getElementById('tab-mode-sync');

    container.replaceChildren();
    const loadingMsg = make('div', 'Wczytywanie tekstu Pisma Świętego...', 'bu-muted');
    loadingMsg.style.padding = '24px';
    loadingMsg.style.textAlign = 'center';
    container.appendChild(loadingMsg);

    try {
      // 1. Zawsze ładujemy pełny tekst biblijny UBG 2025
      const [lyrics, syncData] = await Promise.all([
        loadChapterLyrics(targetId), loadChapterSync(targetId)
      ]);
      if (loadVersion !== state.loadVersion) return;
      state.lyrics = lyrics;

      if (titleEl) titleEl.textContent = `${lyrics.book} · Rozdział ${lyrics.chapter}`;
      if (badgeEl) badgeEl.textContent = lyrics.translation || 'UBG 2025';

      // 2. Sprawdzamy dostępność synchronizacji karaoke
      state.sync = syncData;

      initChapterSelectors();

      // Ustalenie trybu
      const hasSync = !!syncData;
      if (tabSync) {
        tabSync.disabled = !hasSync;
        tabSync.title = hasSync ? 'Włącz podświetlanie linijek utworu' : 'Synchronizacja dla tego rozdziału jest w trakcie tworzenia';
        tabSync.textContent = hasSync ? '🎤 Karaoke zsynchronizowane' : '🎤 Karaoke (w produkcji)';
      }

      let activeMode = 'reading';
      if (requestedMode === 'sync' && hasSync) {
        activeMode = 'sync';
      } else if (requestedMode === 'reading') {
        activeMode = 'reading';
      } else if (hasSync) {
        // Domyślnie włącz tryb synchronizacji, jeśli dostępny
        activeMode = 'sync';
      }

      state.mode = activeMode;

      if (tabReading) {
        tabReading.classList.toggle('is-active', activeMode === 'reading');
        tabReading.setAttribute('aria-selected', activeMode === 'reading' ? 'true' : 'false');
      }
      if (tabSync) {
        tabSync.classList.toggle('is-active', activeMode === 'sync');
        tabSync.setAttribute('aria-selected', activeMode === 'sync' ? 'true' : 'false');
      }

      if (statusEl) {
        if (hasSync) {
          const isReview = syncData.status === 'SYNC_REVIEW';
          const score = syncData.qualityScore ? ` (${Math.round(syncData.qualityScore * 100)}%)` : '';
          statusEl.textContent = isReview ? `● Do weryfikacji${score}` : `● Zsynchronizowane AI${score}`;
          statusEl.style.color = isReview ? '#fbbf24' : '#4ade80';
        } else {
          statusEl.textContent = '○ Pełny tekst UBG (bez znaczników czasu)';
          statusEl.style.color = '#e2cc9a';
        }
      }

      if (activeMode === 'sync' && syncData) {
        renderSyncMode(container, syncData);
        if (showStage && !state.tickInterval) {
          state.tickInterval = setInterval(tickSync, 40);
        }
      } else {
        renderReadingMode(container, lyrics);
        if (state.tickInterval) {
          clearInterval(state.tickInterval);
          state.tickInterval = null;
        }
      }

      if (showStage) {
        
      }

    } catch (err) {
      if (loadVersion !== state.loadVersion) return;
      container.textContent = err.message || 'Nie udało się wczytać tekstu rozdziału.';
      container.dataset.mode = 'unavailable';
      if (statusEl) statusEl.textContent = 'Błąd wczytywania tekstu';
    }
  }

  function setMode(mode) {
    if (mode !== 'sync' && mode !== 'reading') return;
    if (mode === 'sync' && !state.sync) {
      alert('Dla tego rozdziału nie ma jeszcze przygotowanej synchronizacji czasowej. Dostępny jest pełny tekst w trybie „Czytaj i śpiewaj”.');
      return;
    }
    const container = document.getElementById('hero-karaoke-lines');
    if (!container || !state.lyrics) return;

    state.mode = mode;
    const tabReading = document.getElementById('tab-mode-reading');
    const tabSync = document.getElementById('tab-mode-sync');
    const statusEl = document.getElementById('hero-sync-status-indicator');

    if (tabReading) {
      tabReading.classList.toggle('is-active', mode === 'reading');
      tabReading.setAttribute('aria-selected', mode === 'reading' ? 'true' : 'false');
    }
    if (tabSync) {
      tabSync.classList.toggle('is-active', mode === 'sync');
      tabSync.setAttribute('aria-selected', mode === 'sync' ? 'true' : 'false');
    }

    if (mode === 'sync' && state.sync) {
      renderSyncMode(container, state.sync);
      if (statusEl) statusEl.textContent = '● Synchronizacja aktywna';
      if (!state.tickInterval) state.tickInterval = setInterval(tickSync, 40);
      ensureSyncToolbar();
      const tb = document.getElementById('hero-karaoke-sync-toolbar');
      if (tb) tb.style.display = 'grid';
      setSettingsAvailable(true);
    } else {
      renderReadingMode(container, state.lyrics);
      if (statusEl) statusEl.textContent = state.sync ? '○ Pełny tekst UBG' : '○ Pełny tekst UBG (bez znaczników czasu)';
      if (state.tickInterval) {
        clearInterval(state.tickInterval);
        state.tickInterval = null;
      }
      const tb = document.getElementById('hero-karaoke-sync-toolbar');
      if (tb) tb.style.display = 'none';
      setSettingsAvailable(false);
    }
  }

  function adjustFontSize(delta) {
    state.fontSize = Math.min(36, Math.max(15, state.fontSize + delta * 2));
    document.documentElement.style.setProperty('--bu-font-size', `${state.fontSize}px`);
    setTimeout(() => centerActiveLine(true), 40);
  }

  function toggleFullscreen() {
    const stage = document.getElementById('hero-karaoke-stage');
    if (!stage) return;
    state.isFullscreen = !state.isFullscreen;
    stage.classList.toggle('is-fullscreen', state.isFullscreen);

    const btn = document.getElementById('btn-hero-fullscreen');
    if (btn) btn.textContent = state.isFullscreen ? '✕ Wyjdź' : '⛶';

    if (state.isFullscreen && stage.requestFullscreen) {
      stage.requestFullscreen().catch(() => {});
    } else if (!state.isFullscreen && document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    setTimeout(() => centerActiveLine(true), 60);
  }

  function closeHeroKaraoke() {
    ++state.loadVersion;
    const stage = document.getElementById('hero-karaoke-stage');
    if (stage) {
      stage.style.display = 'none';
      stage.classList.remove('is-fullscreen');
      state.isFullscreen = false;
    }
    const tb = document.getElementById('hero-karaoke-sync-toolbar');
    if (tb) tb.style.display = 'none';
    setSettingsAvailable(false);
    const btn = document.getElementById('btn-player-karaoke');
    if (btn) btn.classList.remove('is-karaoke-active');
    if (state.tickInterval) {
      clearInterval(state.tickInterval);
      state.tickInterval = null;
    }
  }

  function onBookSelect(bookCode) {
    const chSelect = document.getElementById('hero-chapter-select');
    const book = getBooksList().find(b => b.code === bookCode) || { chapters: 50 };
    if (chSelect) {
      chSelect.innerHTML = '';
      for (let c = 1; c <= book.chapters; c++) {
        const opt = document.createElement('option');
        opt.value = c;
        opt.textContent = `Rozdział ${c}`;
        chSelect.appendChild(opt);
      }
      chSelect.value = '1';
    }
    startChapterKaraoke(`${bookCode}-001`);
  }

  function onChapterSelect(chNum) {
    const bookSelect = document.getElementById('hero-book-select');
    const bCode = bookSelect?.value || state.chapterId.split('-')[0] || 'GEN';
    const padded = String(chNum).padStart(3, '0');
    startChapterKaraoke(`${bCode}-${padded}`);
  }

  function openKaraoke(chapterId, requestedMode = null) {
    let targetId = chapterId;
    if (!targetId) {
      const cur = currentTrack();
      targetId = cur?.chapterId || state.chapterId || 'GEN-001';
    }
    const btn = document.getElementById('btn-player-karaoke');
    if (btn) btn.classList.add('is-karaoke-active');
    startChapterKaraoke(targetId, requestedMode);
  }

  function togglePlayerKaraoke(chapterId = null) {
    const stage = document.getElementById('hero-karaoke-stage');
    const playerKaraokeBtn = document.getElementById('btn-player-karaoke');
    const cur = currentTrack();
    const targetId = chapterId || cur?.chapterId || state.chapterId || 'GEN-001';

    const isVisible = stage && stage.style.display !== 'none' && stage.offsetParent !== null;

    if (!state.userClickedToggleOnce && isVisible && state.chapterId === targetId) {
      state.userClickedToggleOnce = true;
      if (playerKaraokeBtn) playerKaraokeBtn.classList.add('is-karaoke-active');
      openKaraoke(targetId);
      return;
    }
    state.userClickedToggleOnce = true;

    if (isVisible && state.chapterId === targetId) {
      closeHeroKaraoke();
      if (typeof window.showToast === 'function') {
        window.showToast('Ukryto tekst Pisma Świętego');
      }
    } else {
      if (playerKaraokeBtn) playerKaraokeBtn.classList.add('is-karaoke-active');
      openKaraoke(targetId);
      const heroSection = stage || document.getElementById('hero');
      if (heroSection) {
        heroSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  function downloadFormat(ext) {
    if (!state.chapterId) return;
    const url = `${KARAOKE_BASE}${encodeURIComponent(state.chapterId)}.${ext}`;
    const a = document.createElement('a');
    a.href = url;
    a.download = `${state.chapterId}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  // 7. GŁOSOWANIE TOP 100 & AUTHENTICATION
  async function getToken() {
    if (typeof window.CC_BU_GET_ID_TOKEN === 'function') {
      try {
        const t = await window.CC_BU_GET_ID_TOKEN();
        if (t) return t;
      } catch (e) {}
    }
    if (window.LuminaDB?.auth?.currentUser) {
      try {
        return await window.LuminaDB.auth.currentUser.getIdToken();
      } catch (e) {}
    }
    if (window.firebase?.auth) {
      try {
        return await window.firebase.auth().currentUser?.getIdToken();
      } catch (e) {}
    }
    return null;
  }

  async function api(path, opts = {}) {
    const headers = { 'Accept': 'application/json' };
    if (opts.body) headers['Content-Type'] = 'application/json';
    if (opts.token) headers.Authorization = 'Bearer ' + opts.token;
    const response = await fetch(API + path, {
      method: opts.method || 'GET',
      headers,
      credentials: 'same-origin',
      body: opts.body
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'Błąd API');
    return data;
  }

  async function ranking() {
    openDialog('TOP 100 — oficjalne głosowanie');
    const area = content();
    area.replaceChildren();

    const lead = make('p', 'Głosowanie wymaga bezpłatnego konta LUMINA. Każdy zalogowany członek może oddać jeden głos na wybrany utwór z możliwością jego cofnięcia lub zmiany.', 'bu-muted');
    area.appendChild(lead);

    let data;
    try {
      data = await api('/ranking?limit=100');
    } catch (e) {
      area.appendChild(make('p', 'Nie można pobrać wyników rankingu: ' + e.message, 'bu-muted'));
      return;
    }

    const token = await getToken().catch(() => null);
    const mine = new Set();
    if (token) {
      try {
        const m = await api('/my-votes', { token });
        (m.chapterIds || []).forEach(x => mine.add(x));
      } catch (e) {
        area.appendChild(make('p', 'Nie udało się pobrać Twoich aktywnych głosów: ' + e.message, 'bu-muted'));
      }
    } else {
      const loginBox = make('div', '', 'bu-toolbar');
      const loginLink = document.createElement('a');
      loginLink.href = '/lumina';
      loginLink.textContent = 'Zaloguj się przez LUMINA, aby zagłosować na utwór →';
      loginLink.style.color = '#e2cc9a';
      loginLink.style.fontWeight = '700';
      loginBox.appendChild(loginLink);
      area.appendChild(loginBox);
    }

    const scores = new Map((data.items || []).map(x => [x.chapterId, Number(x.votes)]));
    const tracks = getTracks().filter(t => t.chapterId && t.videoId);
    const seen = new Set();
    const unique = tracks.filter(x => {
      if (seen.has(x.chapterId)) return false;
      seen.add(x.chapterId);
      return true;
    });

    unique.sort((a, b) => (scores.get(b.chapterId) || 0) - (scores.get(a.chapterId) || 0) || a.chapterId.localeCompare(b.chapterId));

    const rows = make('div', '', 'bu-ranking');
    area.appendChild(rows);

    for (const [index, t] of unique.slice(0, 100).entries()) {
      const row = make('div', '', 'bu-rank');
      row.appendChild(make('span', `${index + 1}. ${t.title}`));
      const votes = make('strong', `${scores.get(t.chapterId) || 0} głosów`);
      row.appendChild(votes);

      const vote = button(mine.has(t.chapterId) ? 'Cofnij głos' : 'Głosuj', async () => {
        vote.disabled = true;
        try {
          const remove = mine.has(t.chapterId);
          const result = await api('/votes/' + encodeURIComponent(t.chapterId), {
            method: remove ? 'DELETE' : 'PUT',
            token
          });
          if (result.voted) mine.add(t.chapterId);
          else mine.delete(t.chapterId);
          votes.textContent = `${result.votes} głosów`;
          vote.textContent = result.voted ? 'Cofnij głos' : 'Głosuj';
        } catch (e) {
          alert(e.message);
        } finally {
          vote.disabled = !token;
        }
      }, true);

      vote.disabled = !token;
      row.appendChild(vote);
      rows.appendChild(row);
    }

    if (!unique.length) {
      area.appendChild(make('p', 'Brak opublikowanych utworów do głosowania.', 'bu-muted'));
    }
  }

  // 7b. ZARZĄDZANIE BEZPOŚREDNIM GŁOSOWANIEM (BEZ OTWIERANIA OKNA)
  let myVotedChapters = new Set();
  try {
    const cached = localStorage.getItem('bu_voted_chapters');
    if (cached) myVotedChapters = new Set(JSON.parse(cached));
  } catch {}

  function saveVotedChapters() {
    try {
      localStorage.setItem('bu_voted_chapters', JSON.stringify([...myVotedChapters]));
    } catch {}
  }

  function updateVotingButtonState(chapterId) {
    const btn = document.getElementById('btn-player-top100');
    if (!btn) return;
    const curId = chapterId || currentTrack()?.chapterId || state.chapterId || 'GEN-001';
    const isVoted = myVotedChapters.has(curId);
    if (isVoted) {
      btn.classList.add('is-voted');
      btn.title = 'Głos oddany w TOP 100 (kliknij, aby cofnąć)';
      btn.setAttribute('aria-label', 'Głos oddany w TOP 100 — kliknij, aby cofnąć');
    } else {
      btn.classList.remove('is-voted');
      btn.title = 'Oddaj głos w TOP 100';
      btn.setAttribute('aria-label', 'Oddaj głos na utwór w TOP 100');
    }
  }

  async function syncMyVotes() {
    const token = await getToken().catch(() => null);
    if (!token) return;
    try {
      const res = await api('/my-votes', { token });
      if (Array.isArray(res.chapterIds)) {
        myVotedChapters = new Set(res.chapterIds);
        saveVotedChapters();
        updateVotingButtonState();
      }
    } catch {}
  }

  async function voteCurrentTrack() {
    const btn = document.getElementById('btn-player-top100');
    const track = currentTrack();
    const chapterId = track?.chapterId || state.chapterId || 'GEN-001';
    const title = track?.title || ('Rozdział ' + chapterId);

    const token = await getToken().catch(() => null);
    if (!token) {
      if (typeof window.showToast === 'function') {
        window.showToast('Zaloguj się w portalu LUMINA, aby oddać głos w TOP 100 🏆');
      } else {
        alert('Zaloguj się w portalu LUMINA, aby oddać głos w TOP 100 🏆');
      }
      return;
    }

    const isCurrentlyVoted = myVotedChapters.has(chapterId);
    const method = isCurrentlyVoted ? 'DELETE' : 'PUT';

    if (btn) btn.disabled = true;
    try {
      const result = await api('/votes/' + encodeURIComponent(chapterId), {
        method,
        token
      });

      if (result.voted) {
        myVotedChapters.add(chapterId);
        saveVotedChapters();
        updateVotingButtonState(chapterId);
        if (typeof window.showToast === 'function') {
          window.showToast(`🏆 Oddano głos na: ${title}! (Razem: ${result.votes})`);
        }
      } else {
        myVotedChapters.delete(chapterId);
        saveVotedChapters();
        updateVotingButtonState(chapterId);
        if (typeof window.showToast === 'function') {
          window.showToast(`Cofnięto głos na: ${title}.`);
        }
      }
    } catch (e) {
      if (typeof window.showToast === 'function') {
        window.showToast(e.message || 'Nie udało się zapisać głosu.');
      } else {
        alert(e.message || 'Nie udało się zapisać głosu.');
      }
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  // Obsługa powrotu na kartę przeglądarki
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && state.mode === 'sync') {
      tickSync();
    }
  });

  // 8. GLOBALNE INTERFEJSY I PODPIĘCIE
  const originalZeroAtrap = window.openZeroAtrapModal;
  window.openZeroAtrapModal = function (which) {
    if (which === 'karaoke') return togglePlayerKaraoke();
    if (which === 'top100') return voteCurrentTrack();
    if (typeof originalZeroAtrap === 'function') return originalZeroAtrap(which);
  };

  window.openChapterLyrics = function (chapterId, evt) {
    if (evt && typeof evt.stopPropagation === 'function') evt.stopPropagation();
    openKaraoke(chapterId, null);
    const heroSection = document.getElementById('hero') || document.getElementById('hero-karaoke-stage');
    if (heroSection) {
      heroSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  window.loadChapterLyrics = loadChapterLyrics;
  window.startChapterKaraoke = startChapterKaraoke;
  window.voteCurrentTrack = voteCurrentTrack;
  window.togglePlayerKaraoke = togglePlayerKaraoke;

  let _ccBuFeatures = {
    openKaraoke,
    togglePlayerKaraoke,
    voteCurrentTrack,
    updateVotingButtonState,
    openRanking: ranking,
    setMode,
    adjustFontSize,
    toggleFullscreen,
    closeHeroKaraoke,
    onBookSelect,
    onChapterSelect,
    setDisplayMode,
    setAutoScroll,
    resumeAutoScroll,
    centerActiveLine,
    adjustOffset,
    resetOffset,
    getSavedOffset,
    updateOffsetDisplay,
    loadChapterLyrics,
    startChapterKaraoke,
    downloadFormat
  };

  try {
    Object.defineProperty(window, 'CC_BU_FEATURES', {
      configurable: true,
      enumerable: true,
      get() { return _ccBuFeatures; },
      set(val) {
        if (val && typeof val.togglePlayerKaraoke === 'function' && typeof val.onBookSelect === 'function') {
          _ccBuFeatures = val;
        }
      }
    });
  } catch {
    window.CC_BU_FEATURES = _ccBuFeatures;
  }

  // Inicjalizacja stanu selektorów, przycisków i preloadu GEN-001
  function initOnReady() {
    initChapterSelectors();
    updateVotingButtonState();
    syncMyVotes();
    const cur = currentTrack();
    const initialId = cur?.chapterId || 'GEN-001';
    const btn = document.getElementById('btn-player-karaoke');
    if (btn) btn.classList.add('is-karaoke-active');
    startChapterKaraoke(initialId, null, true).catch(() => {});
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initOnReady);
  } else {
    initOnReady();
  }

})();
