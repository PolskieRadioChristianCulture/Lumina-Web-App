/**
 * ══════════════════════════════════════════════════════════════════════════
 * CHRISTIAN CULTURE & LUMINA — CCGlobalChatButton
 * Plik: /components/cc-global-chat-button.js
 * 
 * Standard wdrożenia CC CHAT:
 * - Wygląd: Neonowy przycisk czatu w szkle (fioletowo-różowy gradient, złota
 *   obwódka, biały symbol rozmowy, delikatna poświata i szkło).
 * - Rozmiar: 60 × 60 px na komputerze, 56 × 56 px na telefonie.
 * - Położenie: prawy dolny róg (right: max(16px, env(safe-area-inset-right)),
 *   bottom: max(18px, env(safe-area-inset-bottom))), dynamicznie współgra
 *   z paskami odtwarzaczy i przyciskiem cc-back-to-top.
 * - Interakcja: delikatna animacja po najechaniu; kliknięcie otwiera panel czatu.
 * - Integracja: jedno logowanie LUMINA / CC ID.
 * - Funkcjonalność: wiadomości, kontakt ze społecznością, pomoc i powiadomienia
 *   — wyłącznie rzeczywiście zaimplementowane moduły ekosystemu.
 * - Architektura: jeden współdzielony komponent, aktualizowany centralnie dla
 *   całego ekosystemu.
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

      /* ── MODAL / PANEL CZATU CC GLOBAL ── */
      .cc-chat-drawer-overlay {
        position: fixed !important;
        inset: 0 !important;
        background: rgba(4, 6, 12, 0.72) !important;
        backdrop-filter: blur(12px) !important;
        -webkit-backdrop-filter: blur(12px) !important;
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
        width: 390px !important;
        max-width: calc(100vw - 36px) !important;
        height: 600px !important;
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

      /* Nagłówek czatu */
      .cc-chat-header {
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        padding: 14px 18px !important;
        background: linear-gradient(180deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%) !important;
        border-bottom: 1px solid rgba(212, 175, 55, 0.22) !important;
      }

      .cc-chat-header-brand {
        display: flex !important;
        align-items: center !important;
        gap: 10px !important;
      }

      .cc-chat-header-icon {
        width: 36px !important;
        height: 36px !important;
        border-radius: 50% !important;
        object-fit: cover !important;
        filter: drop-shadow(0 2px 8px rgba(168, 85, 247, 0.4)) !important;
      }

      .cc-chat-header-titles {
        display: flex !important;
        flex-direction: column !important;
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
        text-transform: uppercase !important;
      }

      .cc-chat-close-btn {
        width: 36px !important;
        height: 36px !important;
        min-width: 36px !important;
        min-height: 36px !important;
        border-radius: 50% !important;
        border: 1px solid rgba(255, 255, 255, 0.15) !important;
        background: rgba(255, 255, 255, 0.05) !important;
        color: #E2E8F0 !important;
        cursor: pointer !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        font-size: 1rem !important;
        transition: background 0.2s ease, transform 0.2s ease !important;
      }

      .cc-chat-close-btn:hover {
        background: rgba(239, 68, 68, 0.2) !important;
        color: #EF4444 !important;
        transform: scale(1.08) !important;
      }

      /* Pasek tożsamości użytkownika LUMINA / CC ID */
      .cc-chat-auth-bar {
        padding: 10px 18px !important;
        background: rgba(0, 0, 0, 0.35) !important;
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
        width: 28px !important;
        height: 28px !important;
        min-width: 28px !important;
        border-radius: 50% !important;
        object-fit: cover !important;
        border: 1.5px solid #C4A35A !important;
      }

      .cc-chat-user-text {
        font-size: 0.78rem !important;
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
        font-size: 0.72rem !important;
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

      /* Zawartość czatu */
      .cc-chat-body {
        flex: 1 1 auto !important;
        overflow-y: auto !important;
        padding: 16px 18px !important;
        display: flex !important;
        flex-direction: column !important;
        gap: 12px !important;
        scrollbar-width: thin !important;
        scrollbar-color: rgba(196, 163, 90, 0.3) transparent !important;
      }

      .cc-chat-body::-webkit-scrollbar {
        width: 5px !important;
      }
      .cc-chat-body::-webkit-scrollbar-thumb {
        background: rgba(196, 163, 90, 0.35) !important;
        border-radius: 4px !important;
      }

      /* Karty szybkich akcji czatu */
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
      }

      .cc-chat-action-card:hover {
        background: rgba(168, 85, 247, 0.12) !important;
        border-color: rgba(212, 175, 55, 0.45) !important;
        transform: translateY(-1px) !important;
      }

      .cc-chat-action-card-left {
        display: flex !important;
        align-items: center !important;
        gap: 12px !important;
      }

      .cc-chat-action-icon {
        width: 36px !important;
        height: 36px !important;
        min-width: 36px !important;
        border-radius: 10px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        font-size: 1rem !important;
      }

      .cc-chat-action-info {
        display: flex !important;
        flex-direction: column !important;
      }

      .cc-chat-action-title {
        font-size: 0.84rem !important;
        font-weight: 700 !important;
        color: #FFFFFF !important;
      }

      .cc-chat-action-desc {
        font-size: 0.72rem !important;
        color: #94A3B8 !important;
      }

      .cc-chat-action-arrow {
        color: #C4A35A !important;
        font-size: 0.8rem !important;
      }

      /* Dymek powitalny */
      .cc-chat-bubble-system {
        background: linear-gradient(135deg, rgba(88, 28, 135, 0.4) 0%, rgba(30, 27, 75, 0.5) 100%) !important;
        border: 1px solid rgba(168, 85, 247, 0.3) !important;
        border-radius: 16px !important;
        padding: 12px 14px !important;
        font-size: 0.82rem !important;
        line-height: 1.45 !important;
        color: #E2E8F0 !important;
      }

      .cc-chat-bubble-system strong {
        color: #FACC15 !important;
      }

      /* Dolna stopka panelu */
      .cc-chat-footer {
        padding: 12px 18px !important;
        background: rgba(0, 0, 0, 0.35) !important;
        border-top: 1px solid rgba(255, 255, 255, 0.08) !important;
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        font-size: 0.72rem !important;
        color: #94A3B8 !important;
      }

      .cc-chat-footer a {
        color: #C4A35A !important;
        text-decoration: none !important;
        font-weight: 700 !important;
      }
      .cc-chat-footer a:hover {
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
          height: min(540px, 86vh) !important;
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
            slug: prof.slug || u.uid
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
            slug: prof?.slug || u?.uid
          };
        }
      }
    } catch (e) {}

    return {
      isLoggedIn: false,
      name: 'Gość Christian Culture',
      avatar: '/images/chat/cc-chat-button-120.webp',
      uid: null,
      slug: null
    };
  }

  // 4. Montowanie struktury HTML przycisku i panelu
  function mountComponent() {
    if (document.getElementById('ccGlobalChatFab')) return;

    // Przycisk FAB
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

    // Modal / Drawer czatu
    const overlay = document.createElement('div');
    overlay.id = 'ccGlobalChatOverlay';
    overlay.className = 'cc-chat-drawer-overlay';
    overlay.setAttribute('aria-hidden', 'true');

    overlay.innerHTML = `
      <div class="cc-chat-drawer" role="dialog" aria-modal="true" aria-labelledby="ccChatHeaderTitle">
        <!-- Nagłówek -->
        <div class="cc-chat-header">
          <div class="cc-chat-header-brand">
            <img src="/images/chat/cc-chat-button-120.webp" alt="CC Chat" class="cc-chat-header-icon" width="36" height="36">
            <div class="cc-chat-header-titles">
              <div class="cc-chat-header-title" id="ccChatHeaderTitle">
                <span>CC CHAT</span>
                <span style="font-size: 0.68rem; padding: 2px 6px; border-radius: 8px; background: rgba(168, 85, 247, 0.25); color: #D8B4FE; border: 1px solid rgba(168, 85, 247, 0.4);">LUMINA</span>
              </div>
              <div class="cc-chat-header-sub">Wspólnota • Wiara • Pomoc</div>
            </div>
          </div>
          <button type="button" class="cc-chat-close-btn" id="ccChatCloseBtn" aria-label="Zamknij czat">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <!-- Pasek tożsamości -->
        <div class="cc-chat-auth-bar" id="ccChatAuthBar"></div>

        <!-- Zawartość główna -->
        <div class="cc-chat-body">
          <div class="cc-chat-bubble-system">
            ✨ <strong>Pokój Wam!</strong> Witaj w centralnym węźle komunikacji ekosystemu Christian Culture.
            Porozmawiaj ze społecznością portalu LUMINA, napisz do duszpasterza lub skontaktuj się ze sztabem misji.
          </div>

          <!-- Opcja 1: Czat Społeczności LUMINA -->
          <a href="/lumina.html#chat" class="cc-chat-action-card" id="ccChatActionLumina">
            <div class="cc-chat-action-card-left">
              <div class="cc-chat-action-icon" style="background: rgba(168, 85, 247, 0.2); color: #C084FC;">
                <i class="fa-solid fa-comments"></i>
              </div>
              <div class="cc-chat-action-info">
                <span class="cc-chat-action-title">Czat Społeczności LUMINA</span>
                <span class="cc-chat-action-desc">Wiadomości prywatne i pokoje rozmów</span>
              </div>
            </div>
            <i class="fa-solid fa-arrow-right cc-chat-action-arrow"></i>
          </a>

          <!-- Opcja 2: Rozmowa Duszpasterska / Duchowny Mariusz -->
          <a href="tel:+48608337477" class="cc-chat-action-card">
            <div class="cc-chat-action-card-left">
              <div class="cc-chat-action-icon" style="background: rgba(234, 179, 8, 0.2); color: #FACC15;">
                <i class="fa-solid fa-hands-praying"></i>
              </div>
              <div class="cc-chat-action-info">
                <span class="cc-chat-action-title">Duchowny Mariusz</span>
                <span class="cc-chat-action-desc">Wsparcie duszpasterskie i modlitwa (+48 608 337 477)</span>
              </div>
            </div>
            <i class="fa-solid fa-phone cc-chat-action-arrow"></i>
          </a>

          <!-- Opcja 3: WhatsApp Społeczności Christian Culture -->
          <a href="https://chat.whatsapp.com/DBTRDxQWamZDWaOkjupSt0" target="_blank" rel="noopener noreferrer" class="cc-chat-action-card">
            <div class="cc-chat-action-card-left">
              <div class="cc-chat-action-icon" style="background: rgba(34, 197, 94, 0.2); color: #4ADE80;">
                <i class="fa-brands fa-whatsapp"></i>
              </div>
              <div class="cc-chat-action-info">
                <span class="cc-chat-action-title">Grupa WhatsApp CC</span>
                <span class="cc-chat-action-desc">Codzienne rozważania i braterstwo</span>
              </div>
            </div>
            <i class="fa-solid fa-arrow-up-right-from-square cc-chat-action-arrow"></i>
          </a>

          <!-- Opcja 4: Skontaktuj się ze Sztabem CC (Email / Infolinia) -->
          <a href="/o-nas.html" class="cc-chat-action-card">
            <div class="cc-chat-action-card-left">
              <div class="cc-chat-action-icon" style="background: rgba(56, 189, 248, 0.2); color: #38BDF8;">
                <i class="fa-solid fa-envelope"></i>
              </div>
              <div class="cc-chat-action-info">
                <span class="cc-chat-action-title">O Inicjatywie i Kontakt</span>
                <span class="cc-chat-action-desc">Cezary i Wioletta Rogowscy • Redakcja</span>
              </div>
            </div>
            <i class="fa-solid fa-arrow-right cc-chat-action-arrow"></i>
          </a>
        </div>

        <!-- Stopka panelu -->
        <div class="cc-chat-footer">
          <span>Jeden czat • Jedna tożsamość LUMINA</span>
          <a href="/lumina-tablica.html">Tablica 🕊️</a>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    // Podpięcie zdarzeń
    const btn = document.getElementById('ccChatFabBtn');
    const closeBtn = document.getElementById('ccChatCloseBtn');

    function openChat() {
      // Jeśli jesteśmy na lumina.html lub lumina-tablica.html i istnieje natywny modal czatu:
      if (typeof window.openChatWith === 'function') {
        const myUser = getUserState();
        if (myUser.isLoggedIn) {
          // Otwórz bezpośrednio natywny czat LUMINA
          window.openChatWith('Społeczność LUMINA', '/images/chat/cc-chat-button-120.webp', 'lumina_community');
          return;
        }
      }

      renderAuthBar();
      overlay.classList.add('is-open');
      overlay.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
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
          <img src="${user.avatar}" alt="${user.name}" class="cc-chat-user-avatar" onerror="this.src='/images/chat/cc-chat-button-120.webp'">
          <span class="cc-chat-user-text">${user.name}</span>
        </div>
        <a href="/lumina-profile.html" class="cc-chat-auth-action">Mój profil</a>
      `;
    } else {
      authBar.innerHTML = `
        <div class="cc-chat-user-info">
          <img src="/images/chat/cc-chat-button-120.webp" alt="Gość" class="cc-chat-user-avatar">
          <span class="cc-chat-user-text">Zaloguj się, aby pisać na czacie</span>
        </div>
        <button type="button" class="cc-chat-auth-action" onclick="if(window.ccLoginWithGoogle){window.ccLoginWithGoogle();}else{window.location.href='/lumina-login';}">Logowanie Google</button>
      `;
    }
  }

  // 6. Dynamiczne pozycjonowanie FAB (ochrona przed nakładaniem na pasek audio / dolne menu)
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

  // 7. Automatyczna inicjalizacja po załadowaniu DOM
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
    open: function () {
      const btn = document.getElementById('ccChatFabBtn');
      if (btn) btn.click();
    },
    close: function () {
      const closeBtn = document.getElementById('ccChatCloseBtn');
      if (closeBtn) closeBtn.click();
    }
  };

})();
