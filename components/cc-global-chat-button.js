/**
 * ══════════════════════════════════════════════════════════════════════════
 * CHRISTIAN CULTURE & LUMINA — CCGlobalChatButton
 * Plik: /components/cc-global-chat-button.js
 * 
 * Standard wdrożenia CC CHAT:
 * - Wygląd: Neonowy przycisk czatu w szkle (fioletowo-różowy gradient, złota
 *   obwódka, biały symbol rozmowy, delikatna poświata i szkło).
 * - Rozmiar: 60 × 60 px na komputerze, 56 × 56 px na telefonie.
 * - Położenie: prawy dolny róg (right: max(18px, env(safe-area-inset-right)),
 *   bottom: max(18px, env(safe-area-inset-bottom))), dynamicznie współgra
 *   z paskami odtwarzaczy i przyciskiem cc-back-to-top.
 * - Architektura zintegrowana: Kliknięcie od razu otwiera okno rozmowy live
 *   ze zintegrowanym wyborem wszystkich kanałów komunikacji (Czat na żywo +
 *   pełne 4 karty wyboru: Czat LUMINA, Duchowny Mariusz, WhatsApp, Sztab CC).
 * - Integracja: jedno logowanie LUMINA / CC ID.
 * - Wymogi: ergonomia dotyku min. 44px, brak zależności od zewnętrznych fontów
 *   (100% inline SVG), Zero-QA.
 * ══════════════════════════════════════════════════════════════════════════
 */

(function () {
  'use strict';

  // 1. Zabezpieczenie przed wielokrotną inicjalizacją
  if (window.CCGlobalChatButton) return;
  window.CCGlobalChatButton = true;

  // 2. Wstrzyknięcie uniwersalnych stylów CSS (niezależnych od motywu podstrony)
  function injectStyles() {
    if (document.getElementById('ccGlobalChatStyles')) return;
    const style = document.createElement('style');
    style.id = 'ccGlobalChatStyles';
    style.textContent = `
      /* ── PRZYCISK CZATU CC GLOBAL (NEON W SZKLE) ── */
      .cc-chat-fab-wrap {
        position: fixed !important;
        right: max(18px, env(safe-area-inset-right)) !important;
        bottom: max(18px, env(safe-area-inset-bottom)) !important;
        z-index: 10000 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        pointer-events: auto !important;
        font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        -webkit-tap-highlight-color: transparent !important;
        transition: bottom 0.25s cubic-bezier(0.16, 1, 0.3, 1), transform 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
      }

      .cc-chat-fab-btn {
        width: 60px !important;
        height: 60px !important;
        min-width: 60px !important;
        min-height: 60px !important;
        max-width: 60px !important;
        max-height: 60px !important;
        border-radius: 50% !important;
        border: none !important;
        padding: 0 !important;
        margin: 0 !important;
        background: transparent !important;
        cursor: pointer !important;
        outline: none !important;
        position: relative !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        touch-action: manipulation !important;
        transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.25s ease !important;
        filter: drop-shadow(0 8px 22px rgba(168, 85, 247, 0.45)) drop-shadow(0 3px 10px rgba(0, 0, 0, 0.6)) !important;
      }

      .cc-chat-fab-btn:hover {
        transform: scale(1.08) translateY(-2px) !important;
        filter: drop-shadow(0 12px 28px rgba(217, 70, 239, 0.65)) drop-shadow(0 4px 14px rgba(234, 179, 8, 0.5)) !important;
      }

      .cc-chat-fab-btn:active {
        transform: scale(0.96) translateY(0) !important;
      }

      .cc-chat-fab-btn:focus-visible {
        outline: 3px solid #EAB308 !important;
        outline-offset: 4px !important;
      }

      .cc-chat-fab-img {
        width: 100% !important;
        height: 100% !important;
        border-radius: 50% !important;
        object-fit: contain !important;
        display: block !important;
        pointer-events: none !important;
        user-select: none !important;
      }

      /* Wskaźnik nowej wiadomości / aktywności */
      .cc-chat-fab-badge {
        position: absolute !important;
        top: 2px !important;
        right: 2px !important;
        width: 14px !important;
        height: 14px !important;
        border-radius: 50% !important;
        background: #22C55E !important;
        border: 2px solid #0B0F19 !important;
        box-shadow: 0 0 10px #22C55E !important;
        pointer-events: none !important;
        animation: ccChatPulse 2s infinite ease-in-out !important;
      }

      @keyframes ccChatPulse {
        0% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.22); opacity: 0.85; }
        100% { transform: scale(1); opacity: 1; }
      }

      /* Etykieta tooltipowa dla desktopu */
      .cc-chat-fab-tooltip {
        position: absolute !important;
        right: calc(100% + 12px) !important;
        top: 50% !important;
        transform: translateY(-50%) translateX(6px) !important;
        background: linear-gradient(135deg, rgba(17, 24, 39, 0.96) 0%, rgba(30, 27, 75, 0.96) 100%) !important;
        border: 1px solid rgba(212, 175, 55, 0.4) !important;
        color: #F8FAFC !important;
        padding: 6px 12px !important;
        border-radius: 20px !important;
        font-size: 0.78rem !important;
        font-weight: 700 !important;
        white-space: nowrap !important;
        pointer-events: none !important;
        opacity: 0 !important;
        visibility: hidden !important;
        transition: opacity 0.2s ease, transform 0.2s ease, visibility 0.2s !important;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6), 0 0 12px rgba(168, 85, 247, 0.25) !important;
      }

      .cc-chat-fab-wrap:hover .cc-chat-fab-tooltip {
        opacity: 1 !important;
        visibility: visible !important;
        transform: translateY(-50%) translateX(0) !important;
      }

      /* ── OKNO CZATU CC GLOBAL (ZINTEGROWANE: LIVE + KANAŁY) ── */
      .cc-chat-drawer-overlay {
        position: fixed !important;
        inset: 0 !important;
        background: rgba(4, 6, 12, 0.68) !important;
        backdrop-filter: blur(10px) !important;
        -webkit-backdrop-filter: blur(10px) !important;
        z-index: 10001 !important;
        opacity: 0 !important;
        visibility: hidden !important;
        transition: opacity 0.25s ease, visibility 0.25s !important;
        display: flex !important;
        align-items: flex-end !important;
        justify-content: flex-end !important;
      }

      .cc-chat-drawer-overlay.is-open {
        opacity: 1 !important;
        visibility: visible !important;
      }

      .cc-chat-drawer {
        position: fixed !important;
        right: max(18px, env(safe-area-inset-right)) !important;
        bottom: max(18px, env(safe-area-inset-bottom)) !important;
        width: 410px !important;
        max-width: calc(100vw - 36px) !important;
        height: 630px !important;
        max-height: calc(100vh - 36px) !important;
        background: linear-gradient(165deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 27, 75, 0.98) 55%, rgba(10, 15, 30, 0.99) 100%) !important;
        border: 1.5px solid rgba(212, 175, 55, 0.45) !important;
        border-radius: 24px !important;
        box-shadow: 0 24px 70px rgba(0, 0, 0, 0.85), 0 0 35px rgba(168, 85, 247, 0.35), inset 0 1px 1px rgba(255, 235, 170, 0.25) !important;
        display: flex !important;
        flex-direction: column !important;
        overflow: hidden !important;
        transform: translateY(20px) scale(0.96) !important;
        opacity: 0 !important;
        transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease !important;
        font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        color: #F8FAFC !important;
      }

      .cc-chat-drawer-overlay.is-open .cc-chat-drawer {
        transform: translateY(0) scale(1) !important;
        opacity: 1 !important;
      }

      /* Nagłówek okna czatu */
      .cc-chat-header {
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        padding: 12px 16px !important;
        background: linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%) !important;
        border-bottom: 1px solid rgba(212, 175, 55, 0.22) !important;
        gap: 8px !important;
      }

      .cc-chat-header-brand {
        display: flex !important;
        align-items: center !important;
        gap: 10px !important;
        min-width: 0 !important;
      }

      .cc-chat-header-icon {
        width: 36px !important;
        height: 36px !important;
        min-width: 36px !important;
        border-radius: 50% !important;
        object-fit: cover !important;
        filter: drop-shadow(0 2px 8px rgba(168, 85, 247, 0.45)) !important;
      }

      .cc-chat-header-titles {
        display: flex !important;
        flex-direction: column !important;
        min-width: 0 !important;
      }

      .cc-chat-header-title {
        font-size: 0.95rem !important;
        font-weight: 800 !important;
        letter-spacing: 0.02em !important;
        color: #FFFFFF !important;
        display: flex !important;
        align-items: center !important;
        gap: 6px !important;
      }

      .cc-chat-header-sub {
        font-size: 0.72rem !important;
        font-weight: 600 !important;
        color: #C4A35A !important;
        letter-spacing: 0.04em !important;
        display: flex !important;
        align-items: center !important;
        gap: 5px !important;
        white-space: nowrap !important;
      }

      .cc-chat-live-dot {
        width: 7px !important;
        height: 7px !important;
        border-radius: 50% !important;
        background: #22C55E !important;
        box-shadow: 0 0 6px #22C55E !important;
        display: inline-block !important;
      }

      .cc-chat-header-actions {
        display: flex !important;
        align-items: center !important;
        gap: 6px !important;
      }

      .cc-chat-icon-btn {
        width: 36px !important;
        height: 36px !important;
        min-width: 36px !important;
        min-height: 36px !important;
        border-radius: 50% !important;
        border: 1px solid rgba(255, 255, 255, 0.15) !important;
        background: rgba(255, 255, 255, 0.06) !important;
        color: #E2E8F0 !important;
        cursor: pointer !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        text-decoration: none !important;
        transition: background 0.2s ease, transform 0.2s ease, color 0.2s !important;
      }

      .cc-chat-icon-btn:hover {
        background: rgba(168, 85, 247, 0.3) !important;
        border-color: rgba(212, 175, 55, 0.5) !important;
        color: #FFFFFF !important;
        transform: scale(1.05) !important;
      }

      .cc-chat-close-btn:hover {
        background: rgba(239, 68, 68, 0.25) !important;
        border-color: rgba(239, 68, 68, 0.5) !important;
        color: #EF4444 !important;
      }

      .cc-chat-icon-btn svg {
        width: 16px !important;
        height: 16px !important;
        display: block !important;
        stroke: currentColor !important;
        fill: none !important;
      }

      /* ── ZAKŁADKI WYBORU (CZAT NA ŻYWO / KANAŁY KOMUNIKACJI) ── */
      .cc-chat-tabs-bar {
        display: flex !important;
        padding: 6px 12px 6px 12px !important;
        gap: 6px !important;
        background: rgba(0, 0, 0, 0.42) !important;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
      }

      .cc-chat-tab-btn {
        flex: 1 1 50% !important;
        min-height: 38px !important;
        height: 38px !important;
        padding: 6px 10px !important;
        border-radius: 12px !important;
        font-size: 0.78rem !important;
        font-weight: 700 !important;
        cursor: pointer !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 6px !important;
        border: 1px solid transparent !important;
        background: transparent !important;
        color: #94A3B8 !important;
        transition: all 0.2s ease !important;
        font-family: inherit !important;
      }

      .cc-chat-tab-btn:hover:not(.is-active) {
        background: rgba(255, 255, 255, 0.06) !important;
        color: #F8FAFC !important;
      }

      .cc-chat-tab-btn.is-active {
        background: linear-gradient(135deg, rgba(168, 85, 247, 0.35) 0%, rgba(217, 70, 239, 0.22) 100%) !important;
        border: 1px solid rgba(212, 175, 55, 0.5) !important;
        color: #FFFFFF !important;
        box-shadow: 0 2px 10px rgba(168, 85, 247, 0.3) !important;
      }

      .cc-chat-tab-btn svg {
        width: 14px !important;
        height: 14px !important;
        display: block !important;
      }

      /* ── WIDOK 1: CZAT NA ŻYWO ── */
      .cc-chat-view-live {
        display: flex !important;
        flex-direction: column !important;
        flex: 1 1 auto !important;
        min-height: 0 !important;
        overflow: hidden !important;
      }

      /* Pasek szybkich kontaktów (Duszpasterz & WhatsApp) */
      .cc-chat-quick-contacts {
        padding: 6px 14px !important;
        background: rgba(0, 0, 0, 0.28) !important;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        gap: 8px !important;
      }

      .cc-chat-quick-pill {
        display: inline-flex !important;
        align-items: center !important;
        gap: 6px !important;
        padding: 4px 10px !important;
        border-radius: 12px !important;
        font-size: 0.72rem !important;
        font-weight: 700 !important;
        color: #E2E8F0 !important;
        text-decoration: none !important;
        background: rgba(255, 255, 255, 0.05) !important;
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
        white-space: nowrap !important;
        transition: all 0.2s ease !important;
      }

      .cc-chat-quick-pill:hover {
        background: rgba(196, 163, 90, 0.2) !important;
        border-color: #C4A35A !important;
        color: #FACC15 !important;
      }

      .cc-chat-quick-pill svg {
        width: 12px !important;
        height: 12px !important;
        fill: currentColor !important;
      }

      .cc-chat-channels-switch-link {
        font-size: 0.70rem !important;
        font-weight: 700 !important;
        color: #C4A35A !important;
        cursor: pointer !important;
        background: transparent !important;
        border: none !important;
        padding: 4px 6px !important;
        text-decoration: none !important;
        display: flex !important;
        align-items: center !important;
        gap: 4px !important;
        transition: color 0.2s ease !important;
      }

      .cc-chat-channels-switch-link:hover {
        color: #FDE047 !important;
        text-decoration: underline !important;
      }

      /* Pasek tożsamości użytkownika LUMINA / CC ID */
      .cc-chat-auth-bar {
        padding: 8px 16px !important;
        background: rgba(0, 0, 0, 0.42) !important;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        gap: 10px !important;
      }

      .cc-chat-user-info {
        display: flex !important;
        align-items: center !important;
        gap: 8px !important;
        min-width: 0 !important;
      }

      .cc-chat-user-avatar {
        width: 26px !important;
        height: 26px !important;
        min-width: 26px !important;
        border-radius: 50% !important;
        object-fit: cover !important;
        border: 1.5px solid #C4A35A !important;
      }

      .cc-chat-user-text {
        font-size: 0.75rem !important;
        font-weight: 700 !important;
        color: #F8FAFC !important;
        white-space: nowrap !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
      }

      .cc-chat-auth-action {
        background: linear-gradient(135deg, rgba(196, 163, 90, 0.25) 0%, rgba(196, 163, 90, 0.1) 100%) !important;
        border: 1px solid #C4A35A !important;
        color: #F8FAFC !important;
        padding: 4px 10px !important;
        border-radius: 12px !important;
        font-size: 0.70rem !important;
        font-weight: 700 !important;
        cursor: pointer !important;
        text-decoration: none !important;
        white-space: nowrap !important;
        transition: background 0.2s ease, transform 0.2s ease !important;
      }

      .cc-chat-auth-action:hover {
        background: #C4A35A !important;
        color: #0A0F1E !important;
      }

      /* Strumień wiadomości czatu */
      .cc-chat-feed {
        flex: 1 1 auto !important;
        overflow-y: auto !important;
        padding: 12px 16px !important;
        display: flex !important;
        flex-direction: column !important;
        gap: 12px !important;
        scrollbar-width: thin !important;
        scrollbar-color: rgba(196, 163, 90, 0.3) transparent !important;
      }

      .cc-chat-feed::-webkit-scrollbar {
        width: 5px !important;
      }
      .cc-chat-feed::-webkit-scrollbar-thumb {
        background: rgba(196, 163, 90, 0.35) !important;
        border-radius: 4px !important;
      }

      /* Wiadomość powitalna systemu */
      .cc-chat-system-bubble {
        background: linear-gradient(135deg, rgba(88, 28, 135, 0.35) 0%, rgba(30, 27, 75, 0.45) 100%) !important;
        border: 1px solid rgba(168, 85, 247, 0.3) !important;
        border-radius: 16px !important;
        padding: 10px 12px !important;
        font-size: 0.78rem !important;
        line-height: 1.45 !important;
        color: #E2E8F0 !important;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3) !important;
      }

      .cc-chat-system-bubble strong {
        color: #FACC15 !important;
      }

      /* Pojedyncza wiadomość czatu */
      .cc-chat-msg-row {
        display: flex !important;
        align-items: flex-start !important;
        gap: 8px !important;
        max-width: 90% !important;
      }

      .cc-chat-msg-row.is-me {
        align-self: flex-end !important;
        flex-direction: row-reverse !important;
      }

      .cc-chat-msg-avatar {
        width: 30px !important;
        height: 30px !important;
        min-width: 30px !important;
        border-radius: 50% !important;
        object-fit: cover !important;
        border: 1.5px solid rgba(212, 175, 55, 0.4) !important;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4) !important;
      }

      .cc-chat-msg-content {
        display: flex !important;
        flex-direction: column !important;
        gap: 2px !important;
        min-width: 0 !important;
      }

      .cc-chat-msg-meta {
        display: flex !important;
        align-items: center !important;
        gap: 6px !important;
        font-size: 0.68rem !important;
        color: #94A3B8 !important;
        padding: 0 2px !important;
      }

      .cc-chat-msg-row.is-me .cc-chat-msg-meta {
        justify-content: flex-end !important;
      }

      .cc-chat-msg-sender {
        font-weight: 700 !important;
        color: #F8FAFC !important;
      }

      .cc-chat-msg-badge {
        font-size: 0.62rem !important;
        padding: 1px 5px !important;
        border-radius: 6px !important;
        background: rgba(168, 85, 247, 0.25) !important;
        color: #D8B4FE !important;
        border: 1px solid rgba(168, 85, 247, 0.3) !important;
      }

      .cc-chat-msg-bubble {
        padding: 8px 12px !important;
        border-radius: 14px !important;
        font-size: 0.82rem !important;
        line-height: 1.4 !important;
        word-break: break-word !important;
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.35) !important;
      }

      .cc-chat-msg-row:not(.is-me) .cc-chat-msg-bubble {
        background: rgba(30, 41, 59, 0.85) !important;
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
        color: #F8FAFC !important;
        border-top-left-radius: 4px !important;
      }

      .cc-chat-msg-row.is-me .cc-chat-msg-bubble {
        background: linear-gradient(135deg, #7E22CE 0%, #9333EA 100%) !important;
        border: 1px solid rgba(212, 175, 55, 0.5) !important;
        color: #FFFFFF !important;
        border-top-right-radius: 4px !important;
      }

      /* Dolny pasek wprowadzania wiadomości */
      .cc-chat-composer {
        padding: 10px 14px !important;
        background: rgba(0, 0, 0, 0.5) !important;
        border-top: 1px solid rgba(255, 255, 255, 0.08) !important;
        display: flex !important;
        flex-direction: column !important;
        gap: 6px !important;
      }

      .cc-chat-form {
        display: flex !important;
        align-items: center !important;
        gap: 8px !important;
        width: 100% !important;
      }

      .cc-chat-input {
        flex: 1 1 auto !important;
        height: 44px !important;
        min-height: 44px !important;
        background: rgba(15, 23, 42, 0.8) !important;
        border: 1px solid rgba(212, 175, 55, 0.35) !important;
        border-radius: 22px !important;
        padding: 0 16px !important;
        font-size: 0.86rem !important;
        color: #FFFFFF !important;
        outline: none !important;
        font-family: inherit !important;
        transition: border-color 0.2s ease, box-shadow 0.2s ease !important;
      }

      .cc-chat-input::placeholder {
        color: #94A3B8 !important;
      }

      .cc-chat-input:focus {
        border-color: #C4A35A !important;
        box-shadow: 0 0 14px rgba(196, 163, 90, 0.3) !important;
      }

      .cc-chat-send-btn {
        width: 44px !important;
        height: 44px !important;
        min-width: 44px !important;
        min-height: 44px !important;
        border-radius: 50% !important;
        border: 1px solid #C4A35A !important;
        background: linear-gradient(135deg, #A855F7 0%, #EC4899 100%) !important;
        color: #FFFFFF !important;
        cursor: pointer !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        outline: none !important;
        transition: transform 0.2s ease, filter 0.2s ease !important;
        box-shadow: 0 4px 12px rgba(168, 85, 247, 0.4) !important;
      }

      .cc-chat-send-btn:hover {
        transform: scale(1.06) !important;
        filter: brightness(1.15) !important;
      }

      .cc-chat-send-btn:active {
        transform: scale(0.96) !important;
      }

      .cc-chat-send-btn svg {
        width: 18px !important;
        height: 18px !important;
        fill: #FFFFFF !important;
        display: block !important;
        transform: translateX(1px) !important;
      }

      .cc-chat-hint {
        font-size: 0.65rem !important;
        color: #94A3B8 !important;
        text-align: center !important;
        letter-spacing: 0.02em !important;
      }

      /* ── WIDOK 2: KANAŁY KOMUNIKACJI (WCZEŚNIEJSZY UKŁAD 4 KART) ── */
      .cc-chat-view-channels {
        display: none !important;
        flex-direction: column !important;
        flex: 1 1 auto !important;
        min-height: 0 !important;
        overflow-y: auto !important;
        padding: 14px 16px !important;
        gap: 10px !important;
        scrollbar-width: thin !important;
        scrollbar-color: rgba(196, 163, 90, 0.3) transparent !important;
      }

      .cc-chat-view-channels::-webkit-scrollbar {
        width: 5px !important;
      }
      .cc-chat-view-channels::-webkit-scrollbar-thumb {
        background: rgba(196, 163, 90, 0.35) !important;
        border-radius: 4px !important;
      }

      .cc-chat-action-card {
        background: rgba(255, 255, 255, 0.04) !important;
        border: 1px solid rgba(255, 255, 255, 0.08) !important;
        border-radius: 14px !important;
        padding: 12px 14px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        gap: 10px !important;
        cursor: pointer !important;
        transition: all 0.2s ease !important;
        text-decoration: none !important;
        color: #F8FAFC !important;
        min-height: 44px !important;
      }

      .cc-chat-action-card:hover {
        background: rgba(168, 85, 247, 0.15) !important;
        border-color: rgba(212, 175, 55, 0.5) !important;
        transform: translateY(-1px) !important;
      }

      .cc-chat-action-card-left {
        display: flex !important;
        align-items: center !important;
        gap: 12px !important;
      }

      .cc-chat-action-icon {
        width: 38px !important;
        height: 38px !important;
        min-width: 38px !important;
        border-radius: 10px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
      }

      .cc-chat-action-icon svg {
        width: 18px !important;
        height: 18px !important;
        display: block !important;
        fill: currentColor !important;
      }

      .cc-chat-action-info {
        display: flex !important;
        flex-direction: column !important;
      }

      .cc-chat-action-title {
        font-size: 0.86rem !important;
        font-weight: 700 !important;
        color: #FFFFFF !important;
      }

      .cc-chat-action-desc {
        font-size: 0.72rem !important;
        color: #94A3B8 !important;
      }

      .cc-chat-action-arrow {
        color: #C4A35A !important;
        display: flex !important;
        align-items: center !important;
      }

      .cc-chat-action-arrow svg {
        width: 14px !important;
        height: 14px !important;
        display: block !important;
        stroke: currentColor !important;
        fill: none !important;
      }

      /* Stopka w widoku kanałów */
      .cc-chat-channels-footer {
        margin-top: auto !important;
        padding-top: 10px !important;
        border-top: 1px solid rgba(255, 255, 255, 0.08) !important;
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        font-size: 0.72rem !important;
        color: #94A3B8 !important;
      }

      .cc-chat-channels-footer a {
        color: #C4A35A !important;
        text-decoration: none !important;
        font-weight: 700 !important;
      }

      .cc-chat-channels-footer a:hover {
        text-decoration: underline !important;
      }

      /* ── RESPONSIVE DLA TELEFONÓW (<= 768px) ── */
      @media (max-width: 768px) {
        .cc-chat-fab-wrap {
          right: max(14px, env(safe-area-inset-right)) !important;
          bottom: max(14px, env(safe-area-inset-bottom)) !important;
        }

        .cc-chat-fab-btn {
          width: 56px !important;
          height: 56px !important;
          min-width: 56px !important;
          min-height: 56px !important;
          max-width: 56px !important;
          max-height: 56px !important;
        }

        .cc-chat-fab-tooltip {
          display: none !important;
        }

        .cc-chat-drawer {
          right: 0 !important;
          left: 0 !important;
          bottom: 0 !important;
          width: 100vw !important;
          max-width: 100vw !important;
          height: min(580px, 86vh) !important;
          max-height: 86vh !important;
          border-radius: 24px 24px 0 0 !important;
          border-left: none !important;
          border-right: none !important;
          border-bottom: none !important;
          transform: translateY(100%) !important;
        }

        .cc-chat-drawer-overlay.is-open .cc-chat-drawer {
          transform: translateY(0) !important;
        }

        .cc-chat-input {
          font-size: 16px !important; /* zapobiega auto-zoomowi na iOS */
        }
      }
    `;
    document.head.appendChild(style);
  }

  // 3. Sprawdzenie aktywnej sesji użytkownika LUMINA / CC ID
  function getUserState() {
    try {
      if (window.LuminaDB && typeof window.LuminaDB.getCurrentUser === 'function') {
        const u = window.LuminaDB.getCurrentUser();
        if (u && !u.isAnonymous) {
          const prof = (typeof window.LuminaDB.getCurrentProfile === 'function' && window.LuminaDB.getCurrentProfile()) || {};
          return {
            isLoggedIn: true,
            name: prof.name || u.displayName || 'Członek LUMINA',
            avatar: prof.avatar || u.photoURL || '/images/team/cezary-rogowski.webp',
            uid: u.uid,
            slug: prof.slug || u.uid,
            badge: prof.badge || '🕊️ Członek CC'
          };
        }
      }

      if (localStorage.getItem('lumina_user_session') === 'active') {
        const uStr = localStorage.getItem('lumina_current_user');
        if (uStr) {
          const u = JSON.parse(uStr);
          let prof = null;
          try {
            prof = JSON.parse(localStorage.getItem('lumina_current_user_profile') || localStorage.getItem('lumina_my_profile') || 'null');
          } catch (e) {}
          return {
            isLoggedIn: true,
            name: prof?.name || u?.displayName || 'Członek LUMINA',
            avatar: prof?.avatar || u?.photoURL || '/images/team/cezary-rogowski.webp',
            uid: u?.uid,
            slug: prof?.slug || u?.uid,
            badge: prof?.badge || '🕊️ Członek CC'
          };
        }
      }
    } catch (e) {}

    return {
      isLoggedIn: false,
      name: 'Gość Christian Culture',
      avatar: '/images/chat/cc-chat-button-120.webp',
      uid: null,
      slug: null,
      badge: 'Gość'
    };
  }

  // Bezpieczne czyszczenie tekstu przed renderowaniem
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // 4. Montowanie struktury HTML przycisku i okna czatu
  function mountComponent() {
    if (document.getElementById('ccGlobalChatFab')) return;

    // Przycisk FAB (Neonowy w szkle)
    const fabWrap = document.createElement('div');
    fabWrap.id = 'ccGlobalChatFab';
    fabWrap.className = 'cc-chat-fab-wrap';
    fabWrap.setAttribute('role', 'region');
    fabWrap.setAttribute('aria-label', 'Czat Christian Culture');

    fabWrap.innerHTML = `
      <div class="cc-chat-fab-tooltip" id="ccChatFabTooltip">Czat Społeczności LUMINA</div>
      <button type="button" class="cc-chat-fab-btn" id="ccChatFabBtn" aria-label="Otwórz czat Christian Culture i LUMINA" title="Czat Christian Culture & LUMINA">
        <picture>
          <source srcset="/images/chat/cc-chat-button.webp" type="image/webp">
          <img src="/images/chat/cc-chat-button.png" alt="Czat Christian Culture" class="cc-chat-fab-img" width="60" height="60" loading="lazy" decoding="async">
        </picture>
        <span class="cc-chat-fab-badge" aria-hidden="true"></span>
      </button>
    `;
    document.body.appendChild(fabWrap);

    // Okno czatu (Zintegrowane: Czat na żywo + Wybór kanałów)
    const overlay = document.createElement('div');
    overlay.id = 'ccGlobalChatOverlay';
    overlay.className = 'cc-chat-drawer-overlay';
    overlay.setAttribute('aria-hidden', 'true');

    overlay.innerHTML = `
      <div class="cc-chat-drawer" role="dialog" aria-modal="true" aria-labelledby="ccChatHeaderTitle">
        <!-- Nagłówek okna -->
        <div class="cc-chat-header">
          <div class="cc-chat-header-brand">
            <img src="/images/chat/cc-chat-button-120.webp" alt="CC Chat" class="cc-chat-header-icon" width="36" height="36">
            <div class="cc-chat-header-titles">
              <div class="cc-chat-header-title" id="ccChatHeaderTitle">
                <span>CC CHAT</span>
                <span style="font-size: 0.68rem; padding: 2px 6px; border-radius: 8px; background: rgba(168, 85, 247, 0.25); color: #D8B4FE; border: 1px solid rgba(168, 85, 247, 0.4);">LUMINA</span>
              </div>
              <div class="cc-chat-header-sub">
                <span class="cc-chat-live-dot"></span>
                <span id="ccChatHeaderSubText">Społeczność na żywo</span>
              </div>
            </div>
          </div>
          <div class="cc-chat-header-actions">
            <a href="/lumina.html?openPublicChat=1" target="_blank" rel="noopener noreferrer" class="cc-chat-icon-btn" title="Otwórz pełny portal LUMINA" aria-label="Otwórz pełny portal LUMINA">
              <svg viewBox="0 0 24 24" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
            </a>
            <button type="button" class="cc-chat-icon-btn cc-chat-close-btn" id="ccChatCloseBtn" aria-label="Zamknij czat" title="Zamknij">
              <svg viewBox="0 0 24 24" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        </div>

        <!-- Zakładki wyboru: Czat na żywo vs Kanały komunikacji -->
        <div class="cc-chat-tabs-bar" role="tablist" aria-label="Wybór widoku">
          <button type="button" class="cc-chat-tab-btn is-active" id="ccChatTabLiveBtn" role="tab" aria-selected="true" aria-controls="ccChatViewLive">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/></svg>
            <span>Czat na żywo</span>
          </button>
          <button type="button" class="cc-chat-tab-btn" id="ccChatTabChannelsBtn" role="tab" aria-selected="false" aria-controls="ccChatViewChannels">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>
            <span>Wybór komunikacji (4)</span>
          </button>
        </div>

        <!-- ════ WIDOK 1: CZAT NA ŻYWO ════ -->
        <div class="cc-chat-view-live" id="ccChatViewLive" role="tabpanel" aria-labelledby="ccChatTabLiveBtn">
          <!-- Szybkie kontakty pomocnicze -->
          <div class="cc-chat-quick-contacts">
            <div style="display: flex; gap: 8px; align-items: center;">
              <a href="tel:+48608337477" class="cc-chat-quick-pill" title="Rozmowa duszpasterska: Duchowny Mariusz">
                <svg viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
                <span>Duszpasterz: 608 337 477</span>
              </a>
              <a href="https://chat.whatsapp.com/DBTRDxQWamZDWaOkjupSt0" target="_blank" rel="noopener noreferrer" class="cc-chat-quick-pill" title="Grupa WhatsApp CC">
                <svg viewBox="0 0 24 24"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm5.79 14.07c-.24.68-1.2 1.25-1.74 1.32-.49.07-1.12.1-3.26-.79-2.73-1.14-4.49-3.92-4.63-4.1-.14-.19-1.1-1.46-1.1-2.79 0-1.32.69-1.97.94-2.24.25-.26.54-.33.72-.33.18 0 .36 0 .52.01.17.01.4.07.61.57.24.58.82 2 .89 2.15.07.15.12.33.02.53-.1.19-.15.31-.3.48-.15.17-.31.38-.45.51-.15.15-.3.31-.13.61.17.3 1.07 1.77 2.3 2.87 1.58 1.41 2.91 1.85 3.32 2.05.41.2.65.17.89-.1.24-.28 1.03-1.2 1.31-1.61.27-.41.55-.35.92-.21.38.14 2.38 1.12 2.79 1.32.41.2.68.31.78.48.1.18.1 1.02-.14 1.7z"/></svg>
                <span>WhatsApp</span>
              </a>
            </div>
            <button type="button" class="cc-chat-channels-switch-link" id="ccChatQuickSwitchToChannels" title="Przejdź do pełnego wyboru kanałów">
              <span>Wszystkie kanały →</span>
            </button>
          </div>

          <!-- Pasek tożsamości -->
          <div class="cc-chat-auth-bar" id="ccChatAuthBar"></div>

          <!-- Strumień wiadomości na żywo -->
          <div class="cc-chat-feed" id="ccChatFeed">
            <div class="cc-chat-system-bubble">
              ✨ <strong>Pokój Wam!</strong> Witaj na ogólnym czacie społeczności Christian Culture i LUMINA. Rozmawiajmy, wspierajmy się w wierze i budujmy chrześcijańską wspólnotę.
            </div>
            <div id="ccChatMessagesList" style="display: flex; flex-direction: column; gap: 10px;"></div>
          </div>

          <!-- Formularz wysyłania wiadomości -->
          <div class="cc-chat-composer">
            <form class="cc-chat-form" id="ccChatForm">
              <input type="text" id="ccChatInput" class="cc-chat-input" placeholder="Napisz wiadomość na czacie..." maxlength="500" autocomplete="off" aria-label="Treść wiadomości">
              <button type="submit" id="ccChatSendBtn" class="cc-chat-send-btn" title="Wyślij wiadomość" aria-label="Wyślij wiadomość">
                <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
              </button>
            </form>
            <div class="cc-chat-hint">Jedna tożsamość LUMINA • Prawda, miłość i wzajemny szacunek 🕊️</div>
          </div>
        </div>

        <!-- ════ WIDOK 2: WYBÓR KANAŁÓW KOMUNIKACJI (4 KARTY) ════ -->
        <div class="cc-chat-view-channels" id="ccChatViewChannels" role="tabpanel" aria-labelledby="ccChatTabChannelsBtn">
          <div class="cc-chat-system-bubble">
            ✨ <strong>Pokój Wam!</strong> Witaj w centralnym węźle komunikacji ekosystemu Christian Culture.
            Wybierz dogodną formę kontaktu: rozmowę na czacie, wsparcie duszpasterskie, grupę WhatsApp lub kontakt ze sztabem misji.
          </div>

          <!-- Opcja 1: Czat Społeczności LUMINA -->
          <div class="cc-chat-action-card" id="ccChatActionLumina" role="button" tabindex="0">
            <div class="cc-chat-action-card-left">
              <div class="cc-chat-action-icon" style="background: rgba(168, 85, 247, 0.2); color: #C084FC;">
                <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/></svg>
              </div>
              <div class="cc-chat-action-info">
                <span class="cc-chat-action-title">Czat Społeczności LUMINA</span>
                <span class="cc-chat-action-desc">Rozmowa na żywo i wiadomości (przełącz tutaj)</span>
              </div>
            </div>
            <span class="cc-chat-action-arrow"><svg viewBox="0 0 24 24" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg></span>
          </div>

          <!-- Opcja 2: Rozmowa Duszpasterska / Duchowny Mariusz -->
          <a href="tel:+48608337477" class="cc-chat-action-card">
            <div class="cc-chat-action-card-left">
              <div class="cc-chat-action-icon" style="background: rgba(234, 179, 8, 0.2); color: #FACC15;">
                <svg viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
              </div>
              <div class="cc-chat-action-info">
                <span class="cc-chat-action-title">Duchowny Mariusz</span>
                <span class="cc-chat-action-desc">Wsparcie duszpasterskie i modlitwa (+48 608 337 477)</span>
              </div>
            </div>
            <span class="cc-chat-action-arrow"><svg viewBox="0 0 24 24" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg></span>
          </a>

          <!-- Opcja 3: WhatsApp Społeczności Christian Culture -->
          <a href="https://chat.whatsapp.com/DBTRDxQWamZDWaOkjupSt0" target="_blank" rel="noopener noreferrer" class="cc-chat-action-card">
            <div class="cc-chat-action-card-left">
              <div class="cc-chat-action-icon" style="background: rgba(34, 197, 94, 0.2); color: #4ADE80;">
                <svg viewBox="0 0 24 24"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm5.79 14.07c-.24.68-1.2 1.25-1.74 1.32-.49.07-1.12.1-3.26-.79-2.73-1.14-4.49-3.92-4.63-4.1-.14-.19-1.1-1.46-1.1-2.79 0-1.32.69-1.97.94-2.24.25-.26.54-.33.72-.33.18 0 .36 0 .52.01.17.01.4.07.61.57.24.58.82 2 .89 2.15.07.15.12.33.02.53-.1.19-.15.31-.3.48-.15.17-.31.38-.45.51-.15.15-.3.31-.13.61.17.3 1.07 1.77 2.3 2.87 1.58 1.41 2.91 1.85 3.32 2.05.41.2.65.17.89-.1.24-.28 1.03-1.2 1.31-1.61.27-.41.55-.35.92-.21.38.14 2.38 1.12 2.79 1.32.41.2.68.31.78.48.1.18.1 1.02-.14 1.7z"/></svg>
              </div>
              <div class="cc-chat-action-info">
                <span class="cc-chat-action-title">Grupa WhatsApp CC</span>
                <span class="cc-chat-action-desc">Codzienne rozważania i braterstwo</span>
              </div>
            </div>
            <span class="cc-chat-action-arrow"><svg viewBox="0 0 24 24" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg></span>
          </a>

          <!-- Opcja 4: Skontaktuj się ze Sztabem CC (Email / Infolinia) -->
          <a href="/o-nas.html" class="cc-chat-action-card">
            <div class="cc-chat-action-card-left">
              <div class="cc-chat-action-icon" style="background: rgba(56, 189, 248, 0.2); color: #38BDF8;">
                <svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
              </div>
              <div class="cc-chat-action-info">
                <span class="cc-chat-action-title">O Inicjatywie i Kontakt</span>
                <span class="cc-chat-action-desc">Cezary i Wioletta Rogowscy • Redakcja</span>
              </div>
            </div>
            <span class="cc-chat-action-arrow"><svg viewBox="0 0 24 24" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg></span>
          </a>

          <!-- Stopka w widoku kanałów -->
          <div class="cc-chat-channels-footer">
            <span>Jeden czat • Jedna tożsamość LUMINA</span>
            <a href="/lumina-tablica.html">Tablica 🕊️</a>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    // Podpięcie elementów i zdarzeń
    const btn = document.getElementById('ccChatFabBtn');
    const closeBtn = document.getElementById('ccChatCloseBtn');
    const chatForm = document.getElementById('ccChatForm');
    const chatInput = document.getElementById('ccChatInput');
    const tabLiveBtn = document.getElementById('ccChatTabLiveBtn');
    const tabChannelsBtn = document.getElementById('ccChatTabChannelsBtn');
    const viewLive = document.getElementById('ccChatViewLive');
    const viewChannels = document.getElementById('ccChatViewChannels');
    const quickSwitchLink = document.getElementById('ccChatQuickSwitchToChannels');
    const actionLuminaCard = document.getElementById('ccChatActionLumina');
    const headerSub = document.getElementById('ccChatHeaderSubText');

    function scrollToBottom() {
      const feed = document.getElementById('ccChatFeed');
      if (feed) {
        feed.scrollTop = feed.scrollHeight;
      }
    }

    function switchTab(target) {
      if (target === 'channels') {
        tabLiveBtn.classList.remove('is-active');
        tabChannelsBtn.classList.add('is-active');
        tabLiveBtn.setAttribute('aria-selected', 'false');
        tabChannelsBtn.setAttribute('aria-selected', 'true');
        viewLive.style.setProperty('display', 'none', 'important');
        viewChannels.style.setProperty('display', 'flex', 'important');
        if (headerSub) headerSub.textContent = 'Wybór formy kontaktu';
      } else {
        tabChannelsBtn.classList.remove('is-active');
        tabLiveBtn.classList.add('is-active');
        tabChannelsBtn.setAttribute('aria-selected', 'false');
        tabLiveBtn.setAttribute('aria-selected', 'true');
        viewChannels.style.setProperty('display', 'none', 'important');
        viewLive.style.setProperty('display', 'flex', 'important');
        if (headerSub) headerSub.textContent = 'Społeczność na żywo';
        scrollToBottom();
        if (chatInput && window.innerWidth > 768) {
          chatInput.focus();
        }
      }
    }

    tabLiveBtn.addEventListener('click', function () {
      switchTab('live');
    });

    tabChannelsBtn.addEventListener('click', function () {
      switchTab('channels');
    });

    if (quickSwitchLink) {
      quickSwitchLink.addEventListener('click', function (e) {
        e.preventDefault();
        switchTab('channels');
      });
    }

    if (actionLuminaCard) {
      actionLuminaCard.addEventListener('click', function (e) {
        e.preventDefault();
        switchTab('live');
      });
      actionLuminaCard.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          switchTab('live');
        }
      });
    }

    function openChat() {
      // 1. Jeśli jesteśmy na podstronie posiadającej natywny modal czatu LUMINA (lumina.html, lumina-tablica.html, profile itp.)
      // i użytkownik nie jest w trybie czystego gościa ukrywającego ten modal przez CSS:
      const nativeModal = document.getElementById('directMessagesModal');
      const isGuestBlocked = document.body && document.body.classList.contains('user-is-guest');

      if (nativeModal && !isGuestBlocked) {
        if (typeof window.openDirectMessagesModal === 'function') {
          window.openDirectMessagesModal('public');
          return;
        }
        if (typeof window.openLuminaChatModal === 'function') {
          window.openLuminaChatModal();
          return;
        }
        nativeModal.style.display = 'flex';
        nativeModal.classList.add('open');
        if (typeof window.switchMessengerMainTab === 'function') {
          window.switchMessengerMainTab('public');
        }
        return;
      }

      // 2. Na wszystkich pozostałych podstronach ekosystemu CC (oraz dla gości na lumina.html):
      // natychmiastowe otwarcie zintegrowanego okna rozmowy live (z zakładką czatu i kanałów)
      renderAuthBar();
      renderChatMessages();
      switchTab('live');
      overlay.classList.add('is-open');
      overlay.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';

      setTimeout(() => {
        scrollToBottom();
        if (chatInput && window.innerWidth > 768) {
          chatInput.focus();
        }
      }, 120);
    }

    function closeChat() {
      overlay.classList.remove('is-open');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      openChat();
    });

    closeBtn.addEventListener('click', function (e) {
      e.preventDefault();
      closeChat();
    });

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) {
        closeChat();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.classList.contains('is-open')) {
        closeChat();
      }
    });

    // Obsługa wysyłania wiadomości
    chatForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const text = (chatInput.value || '').trim();
      if (!text) return;

      const user = getUserState();

      // Utworzenie obiektu wiadomości
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const newMsg = {
        id: 'msg_' + Date.now(),
        senderName: user.name,
        senderAvatar: user.avatar,
        senderBadge: user.badge || (user.isLoggedIn ? '🕊️ LUMINA' : 'Gość'),
        senderId: user.slug || user.uid || 'guest_' + Date.now(),
        text: text,
        dateStr: timeStr,
        timestamp: { seconds: Math.floor(Date.now() / 1000) },
        isMe: true
      };

      // Zapis lokalny w pamięci podręcznej czatu LUMINA
      try {
        const cached = JSON.parse(localStorage.getItem('lumina_public_chat_cache') || '[]');
        cached.push(newMsg);
        localStorage.setItem('lumina_public_chat_cache', JSON.stringify(cached));
      } catch (err) {}

      // Jeśli dostępna jest baza LuminaDB z zalogowanym użytkownikiem — wysyłka do Firestore
      if (user.isLoggedIn && window.LuminaDB && typeof window.LuminaDB.sendPublicChatMessage === 'function') {
        window.LuminaDB.sendPublicChatMessage({
          text: text,
          senderName: user.name,
          senderAvatar: user.avatar,
          senderBadge: user.badge
        }).catch(function (err) {
          console.warn('Błąd wysyłki wiadomości do Firestore:', err);
        });
      }

      // Wyczyść pole i odśwież widok
      chatInput.value = '';
      renderChatMessages();
      scrollToBottom();
    });

    // Uruchom synchronizację pozycji w pionie (unikanie kolizji z playerem)
    setupPositionSync(fabWrap);
  }

  // 5. Renderowanie paska tożsamości
  function renderAuthBar() {
    const authBar = document.getElementById('ccChatAuthBar');
    if (!authBar) return;
    const user = getUserState();

    if (user.isLoggedIn) {
      authBar.innerHTML = `
        <div class="cc-chat-user-info">
          <img src="${escapeHtml(user.avatar)}" alt="${escapeHtml(user.name)}" class="cc-chat-user-avatar" onerror="this.src='/images/chat/cc-chat-button-120.webp'">
          <span class="cc-chat-user-text">${escapeHtml(user.name)}</span>
        </div>
        <a href="/lumina-profile.html" class="cc-chat-auth-action">Mój profil</a>
      `;
    } else {
      authBar.innerHTML = `
        <div class="cc-chat-user-info">
          <img src="/images/chat/cc-chat-button-120.webp" alt="Gość" class="cc-chat-user-avatar">
          <span class="cc-chat-user-text">Piszesz jako: Gość CC</span>
        </div>
        <button type="button" class="cc-chat-auth-action" onclick="if(window.ccLoginWithGoogle){window.ccLoginWithGoogle();}else{window.location.href='/lumina-login';}">Logowanie Google</button>
      `;
    }
  }

  // 6. Pobieranie i renderowanie strumienia wiadomości
  function getChatMessages() {
    let msgs = [];
    try {
      const cached = localStorage.getItem('lumina_public_chat_cache');
      if (cached) {
        msgs = JSON.parse(cached);
      }
    } catch (e) {}

    // Domyślne wiadomości powitalne, jeśli pamięć jest pusta
    if (!msgs || msgs.length === 0) {
      msgs = [
        {
          id: 'init_1',
          senderName: 'Cezary Rogowski',
          senderAvatar: '/images/team/cezary-rogowski.webp',
          senderBadge: '👑 Założyciel',
          senderId: 'cezaryrgowski',
          text: 'Pokój Wam! 🕊️ Witaj na ogólnym czacie społeczności Christian Culture i portalu LUMINA. Bądźmy dla siebie wsparciem i dzielmy się Słowem Bożym!',
          dateStr: '10:00'
        },
        {
          id: 'init_2',
          senderName: 'Wioletta Rogowska',
          senderAvatar: '/images/team/wioletta-rogowska.webp',
          senderBadge: '🌸 Liderka CC',
          senderId: 'wiolettarogowska',
          text: 'Błogosławionego dnia dla całej naszej rodziny misyjnej! Modlimy się dziś o pokój, miłość i umocnienie w wierze. ✨',
          dateStr: '10:15'
        },
        {
          id: 'init_3',
          senderName: 'Christian Culture',
          senderAvatar: '/images/chat/cc-chat-button-120.webp',
          senderBadge: '🕊️ Redakcja',
          senderId: 'radiocc',
          text: 'Audycje radiowe, Biblia audio i muzyka uwielbienia grają bez przerwy na polskieradio.cc 📻 Możesz tutaj pisać w każdej chwili!',
          dateStr: '10:30'
        }
      ];
    }

    return msgs;
  }

  function renderChatMessages() {
    const list = document.getElementById('ccChatMessagesList');
    if (!list) return;

    const msgs = getChatMessages();
    const user = getUserState();

    let html = '';
    msgs.forEach(m => {
      const isMe = m.isMe || (user.uid && m.senderAuthUid === user.uid) || (user.slug && m.senderId === user.slug);
      const name = escapeHtml(m.senderName || 'Użytkownik LUMINA');
      const avatar = escapeHtml(m.senderAvatar || '/images/chat/cc-chat-button-120.webp');
      const badge = escapeHtml(m.senderBadge || '🕊️ CC');
      const time = escapeHtml(m.dateStr || '');
      const text = escapeHtml(m.text || '');

      html += `
        <div class="cc-chat-msg-row ${isMe ? 'is-me' : ''}">
          <img src="${avatar}" alt="${name}" class="cc-chat-msg-avatar" onerror="this.src='/images/chat/cc-chat-button-120.webp'">
          <div class="cc-chat-msg-content">
            <div class="cc-chat-msg-meta">
              <span class="cc-chat-msg-sender">${name}</span>
              <span class="cc-chat-msg-badge">${badge}</span>
              ${time ? `<span style="opacity: 0.7;">${time}</span>` : ''}
            </div>
            <div class="cc-chat-msg-bubble">${text}</div>
          </div>
        </div>
      `;
    });

    list.innerHTML = html;
  }

  // 7. Dynamiczne pozycjonowanie FAB (ochrona przed nakładaniem na pasek audio / dolne menu)
  function setupPositionSync(fabWrap) {
    function adjust() {
      const isMobile = window.innerWidth <= 768;
      let bottomOffset = isMobile ? 14 : 18;

      // Sprawdź czy na stronie jest widoczny dolny pasek odtwarzacza audio lub nawigacji
      const candidates = [
        '#globalAudioBar',
        '.radio-bar',
        '.player-bottom-bar',
        '.lumina-mobile-nav',
        '.bottom-nav-container',
        '#mapaBottomVerseBar',
        '.player-sticky-controls'
      ];

      for (const sel of candidates) {
        const el = document.querySelector(sel);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.height > 0 && rect.top < window.innerHeight && rect.bottom >= window.innerHeight - 10) {
            bottomOffset = Math.max(bottomOffset, Math.round(window.innerHeight - rect.top + (isMobile ? 10 : 14)));
          }
        }
      }

      fabWrap.style.bottom = `${bottomOffset}px`;

      // Synchronizacja z przyciskiem powrotu na górę (#backToTopBtn)
      const btt = document.getElementById('backToTopBtn');
      if (btt) {
        // Umieść przycisk do góry powyżej przycisku czatu
        const bttBottom = bottomOffset + (isMobile ? 64 : 70);
        btt.style.setProperty('bottom', `${bttBottom}px`, 'important');
      }
    }

    window.addEventListener('resize', adjust, { passive: true });
    window.addEventListener('scroll', adjust, { passive: true });
    setTimeout(adjust, 300);
    setTimeout(adjust, 1000);
  }

  // 8. Automatyczna inicjalizacja po załadowaniu DOM
  function init() {
    injectStyles();
    mountComponent();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Eksport globalnego API
  window.CCGlobalChat = {
    open: function (targetTab) {
      const btn = document.getElementById('ccChatFabBtn');
      if (btn) btn.click();
      if (targetTab) {
        const tabBtn = targetTab === 'channels' ? document.getElementById('ccChatTabChannelsBtn') : document.getElementById('ccChatTabLiveBtn');
        if (tabBtn) tabBtn.click();
      }
    },
    close: function () {
      const closeBtn = document.getElementById('ccChatCloseBtn');
      if (closeBtn) closeBtn.click();
    }
  };

})();
