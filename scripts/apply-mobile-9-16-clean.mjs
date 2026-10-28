import fs from 'fs';

const files = ['Wioletta.html', 'Wioletta/index.html'];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  const hasCrlf = content.includes('\r\n');
  if (hasCrlf) content = content.replace(/\r\n/g, '\n');

  // 1. Ensure picture tag has mobile 9:16 srcset
  const oldPictureRegex = /<picture>[\s\S]*?<\/picture>/m;
  const newPicture = `<picture>
          <source media="(max-width: 860px)" srcset="/images/wioletta/wioletta-hero-mobile-9-16.webp" type="image/webp">
          <source media="(max-width: 860px)" srcset="/images/wioletta/wioletta-hero-mobile-9-16.jpg" type="image/jpeg">
          <source srcset="/images/wioletta/wioletta-hero-stage.webp" type="image/webp">
          <img
            src="/images/wioletta/wioletta-hero-stage.jpg"
            alt="Wioletta Rogowska — Autorka powieści Pardon, Czy To Miłość?"
            width="1024"
            height="576"
            loading="eager"
            fetchpriority="high"
          >
        </picture>`;
  content = content.replace(oldPictureRegex, newPicture);

  // 2. Replace old mobile panel with 9:16 dedicated panel
  const oldPanelRegex = /<!-- MOBILE PANEL[\s\S]*?<!-- BOTTOM BAR/m;
  const newPanel = `<!-- MOBILE PANEL (9:16 DEDICATED LAYOUT) -->
      <div class="mobile-hero-panel">
        <div class="mobile-kicker">
          MIŁOŚĆ · WYBACZENIE · WYBÓR
        </div>

        <!-- Semantic Accessible Heading matching background artwork -->
        <div class="mobile-title-stage">
          <h1 class="sr-only">Pardon, Czy To Miłość?</h1>
          <p class="sr-only">Paryż. Deszcz. List, który zmienia wszystko. Czy miłość wystarczy, by wybaczono?</p>
        </div>

        <div class="mobile-actions-row">
          <button class="mobile-btn-czytaj" type="button" data-modal="modalCzytaj" aria-label="Czytaj powieść online">
            <span class="btn-icon" aria-hidden="true">📖</span>
            <span>CZYTAJ →</span>
          </button>
          <button class="mobile-btn-wspieram" type="button" data-modal="modalWspieramTo" aria-label="Wspieram to przez Revolut">
            <span class="btn-icon" aria-hidden="true">🩷</span>
            <span>WSPIERAM TO ></span>
          </button>
        </div>

        <div class="mobile-sublinks-grid">
          <button type="button" class="mobile-sublink-col" data-modal="modalKsiazki">
            <span class="sublink-icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"></path>
                <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4H20"></path>
              </svg>
            </span>
            <span class="sublink-label">KSIĄŻKI</span>
          </button>
          <div class="sublink-divider" aria-hidden="true"></div>
          <button type="button" class="mobile-sublink-col" data-modal="modalOAutorce">
            <span class="sublink-icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </span>
            <span class="sublink-label">O AUTORCE</span>
          </button>
          <div class="sublink-divider" aria-hidden="true"></div>
          <button type="button" class="mobile-sublink-col" data-modal="modalKontakt">
            <span class="sublink-icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
              </svg>
            </span>
            <span class="sublink-label">KONTAKT</span>
          </button>
        </div>

        <button class="mobile-scroll-indicator" type="button" id="btnDiscoverMore" aria-label="Odkryj więcej — przewiń do stopki">
          <span class="scroll-chevrons" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="7 9 12 14 17 9"></polyline>
              <polyline points="7 13 12 18 17 13"></polyline>
            </svg>
          </span>
          <span class="scroll-text">ODKRYJ WIĘCEJ</span>
        </button>
      </div>

      <!-- BOTTOM BAR`;
  content = content.replace(oldPanelRegex, newPanel);

  // 3. Ensure hero-screen-9-16 wrapper exists around hero children
  if (!content.includes('hero-screen-9-16')) {
    content = content.replace(
      '<div class="hero-canvas">',
      '<div class="hero-canvas">\n      <div class="hero-screen-9-16">'
    );
    content = content.replace(
      '<!-- BOTTOM BAR: LEGAL & ENVELOPE CONTACT -->',
      '</div>\n\n      <!-- BOTTOM BAR: LEGAL & ENVELOPE CONTACT -->'
    );
  }

  // 4. Ensure btn-star is present in nav-right
  if (!content.includes('btn-star')) {
    content = content.replace(
      /<button class="btn-burger"[\s\S]*?<\/button>/m,
      (match) => `${match}\n          <button class="btn-star" type="button" data-modal="modalKsiazki" aria-label="Kolekcja książek" title="Kolekcja">⭐</button>`
    );
  }

  // 5. Desktop CSS for hero-screen-9-16 and btn-star
  if (!content.includes('.hero-screen-9-16 {')) {
    content = content.replace(
      '.hero-canvas {',
      `.hero-screen-9-16 {
      display: contents;
    }
    .btn-star {
      display: none;
    }
    .hero-canvas {`
    );
  }

  // 6. Mobile CSS for @media (max-width: 860px)
  const oldMediaRegex = /@media \(max-width: 860px\) \{[\s\S]*?\}\s*\}\s*@media \(max-width: 350px\)/m;
  const newMediaCss = `@media (max-width: 860px) {
      html, body {
        height: auto !important;
        min-height: 100% !important;
        overflow-x: hidden !important;
        overflow-y: auto !important;
        -webkit-overflow-scrolling: touch;
      }
      .viewport-stage {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        height: auto !important;
        min-height: 100vh;
        min-height: 100dvh;
        overflow-x: hidden;
        overflow-y: visible !important;
        background: #05070a;
        padding: 0;
      }
      .hero-canvas {
        width: 100%;
        max-width: min(100vw, calc(100dvh * 9 / 16));
        height: auto !important;
        min-height: 100dvh;
        aspect-ratio: auto !important;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        position: relative;
        overflow: visible !important;
        background: #05070a;
        flex-shrink: 0;
      }
      /* 9:16 FULL VIEWPORT HERO SCREEN */
      .hero-screen-9-16 {
        position: relative;
        width: 100%;
        height: 100vh;
        height: 100dvh;
        aspect-ratio: 9 / 16;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        overflow: hidden;
        flex-shrink: 0;
        background: #05070a;
      }
      .hero-canvas-art {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100% !important;
        z-index: 1;
        pointer-events: none;
        overflow: hidden;
      }
      .hero-canvas-art picture,
      .hero-canvas-art img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center top;
        display: block;
      }
      .hero-canvas-art::after {
        display: none;
      }
      .navbar {
        position: relative;
        z-index: 10;
        padding: 14px clamp(10px, 3vw, 16px) 6px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        width: 100%;
        background: transparent;
      }
      .brand {
        flex: 1 1 auto;
        min-width: 0;
      }
      .brand-first,
      .brand-last {
        display: block;
      }
      .brand-name {
        font-size: clamp(0.76rem, 3.4vw, 0.90rem);
        letter-spacing: 0.16em;
        white-space: nowrap;
        line-height: 1.15;
      }
      .brand-last {
        margin-top: 1px;
      }
      .brand-sub {
        font-size: clamp(0.48rem, 2vw, 0.58rem);
        letter-spacing: 0.2em;
        white-space: nowrap;
        margin-top: 3px;
      }
      .nav-center {
        display: none;
      }
      .nav-right {
        flex: 0 0 auto;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .btn-news {
        padding: 6px 12px;
        font-size: 0.68rem;
        letter-spacing: 0.1em;
        gap: 6px;
        min-height: 44px;
        white-space: nowrap;
        background: rgba(10, 12, 18, 0.6);
        border: 1px solid rgba(229, 184, 194, 0.4);
      }
      .btn-burger {
        width: 44px;
        height: 44px;
        min-width: 44px;
        min-height: 44px;
        font-size: 1.25rem;
        background: rgba(10, 12, 18, 0.6);
        border: 1px solid rgba(196, 163, 90, 0.4);
      }
      .btn-star {
        width: 44px;
        height: 44px;
        min-width: 44px;
        min-height: 44px;
        background: rgba(10, 12, 18, 0.6);
        border: 1px solid rgba(196, 163, 90, 0.4);
        border-radius: 8px;
        color: var(--gold-light);
        font-size: 1.15rem;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: background 0.2s, box-shadow 0.2s;
        box-shadow: 0 0 10px rgba(196, 163, 90, 0.2);
      }
      .btn-star:hover {
        background: rgba(196, 163, 90, 0.2);
      }
      .cta-hotspot {
        display: none;
      }
      /* MOBILE 9:16 HERO PANEL OVERLAY */
      .mobile-hero-panel {
        position: relative;
        z-index: 10;
        margin-top: auto;
        padding: 0 16px 16px;
        text-align: center;
        display: flex !important;
        flex-direction: column;
        align-items: center;
        width: 100%;
      }
      .mobile-kicker {
        font-family: var(--font-sans);
        font-size: clamp(0.68rem, 2.6vw, 0.76rem);
        font-weight: 700;
        letter-spacing: 0.26em;
        color: var(--rose);
        text-transform: uppercase;
        margin-bottom: 2px;
        text-shadow: 0 2px 8px rgba(0,0,0,0.8);
      }
      /* Spacer reserved for title & subtitle baked in background */
      .mobile-title-stage {
        height: clamp(140px, 20.5vh, 185px);
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .mobile-actions-row {
        display: flex;
        gap: 12px;
        justify-content: center;
        align-items: center;
        width: 100%;
        max-width: 380px;
        margin-bottom: 16px;
      }
      .mobile-btn-czytaj {
        flex: 1;
        min-height: 48px;
        padding: 10px 14px;
        border: 1.5px solid #d4af37;
        border-radius: 8px;
        background: rgba(8, 10, 16, 0.72);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        color: #f7f1e5;
        font-family: var(--font-cinzel);
        font-size: clamp(0.78rem, 3.2vw, 0.88rem);
        font-weight: 700;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        box-shadow: 0 0 16px rgba(212, 175, 55, 0.42), inset 0 0 10px rgba(212, 175, 55, 0.12);
        transition: all 0.2s ease;
      }
      .mobile-btn-czytaj:active {
        background: #d4af37;
        color: #05070a;
      }
      .mobile-btn-wspieram {
        flex: 1;
        min-height: 48px;
        padding: 10px 14px;
        border: 1.5px solid #e5b8c2;
        border-radius: 8px;
        background: rgba(8, 10, 16, 0.72);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        color: #f7f1e5;
        font-family: var(--font-cinzel);
        font-size: clamp(0.75rem, 3.1vw, 0.84rem);
        font-weight: 700;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        box-shadow: 0 0 16px rgba(229, 184, 194, 0.42), inset 0 0 10px rgba(229, 184, 194, 0.12);
        transition: all 0.2s ease;
      }
      .mobile-btn-wspieram:active {
        background: #e5b8c2;
        color: #05070a;
      }
      /* 3 SUBLINKS WITH VERTICAL DIVIDERS */
      .mobile-sublinks-grid {
        display: flex;
        align-items: center;
        justify-content: space-around;
        width: 100%;
        max-width: 360px;
        margin-bottom: 14px;
      }
      .mobile-sublink-col {
        background: none;
        border: none;
        color: var(--cream);
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 4px;
        padding: 6px 10px;
        min-height: 44px;
        min-width: 72px;
        transition: color 0.2s, transform 0.2s;
      }
      .mobile-sublink-col:active {
        color: var(--gold-light);
        transform: scale(0.96);
      }
      .sublink-icon {
        color: var(--rose);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .sublink-label {
        font-family: var(--font-cinzel);
        font-size: 0.74rem;
        font-weight: 600;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        white-space: nowrap;
      }
      .sublink-divider {
        width: 1px;
        height: 28px;
        background: rgba(196, 163, 90, 0.3);
      }
      /* SCROLL DOWN INDICATOR */
      .mobile-scroll-indicator {
        background: none;
        border: none;
        color: var(--gold-light);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
        cursor: pointer;
        padding: 4px 12px;
        min-height: 44px;
        transition: opacity 0.2s;
      }
      .mobile-scroll-indicator:hover {
        opacity: 0.85;
      }
      .scroll-chevrons {
        color: var(--gold-light);
        display: flex;
        animation: chevronBounce 1.8s infinite ease-in-out;
      }
      .scroll-text {
        font-family: var(--font-cinzel);
        font-size: 0.65rem;
        font-weight: 700;
        letter-spacing: 0.24em;
        color: var(--gold-light);
        text-transform: uppercase;
      }
      @keyframes chevronBounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(4px); }
      }
      /* FOOTER PLACED BELOW THE 100DVH FOLD */
      .canvas-footer {
        position: relative;
        z-index: 10;
        width: 100%;
        max-width: 500px;
        padding: 24px 20px 48px;
        margin: 0 auto;
        background: #05070a;
        border-top: 1px solid rgba(196, 163, 90, 0.18);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        gap: 14px;
        flex-shrink: 0;
      }
      .footer-legal-text {
        font-size: 0.74rem;
        color: rgba(245, 242, 235, 0.55);
        line-height: 1.5;
        max-width: 320px;
        margin: 0 auto;
      }
      .footer-legal-text span {
        display: block;
      }
      .envelope-btn {
        width: 48px;
        height: 48px;
        min-width: 48px;
        min-height: 48px;
        border-radius: 50%;
        border: 1px solid rgba(196, 163, 90, 0.35);
        background: rgba(255, 255, 255, 0.03);
        color: var(--cream);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
      }
      .envelope-btn:active {
        background: var(--gold);
        color: #05070a;
      }
    }
    @media (max-width: 350px)`;
  content = content.replace(oldMediaRegex, newMediaCss);

  // 7. Add smooth scroll logic
  if (!content.includes('btnDiscover.addEventListener')) {
    content = content.replace(
      /window\.addEventListener\('hashchange', checkHash\);/m,
      `var btnDiscover = document.getElementById('btnDiscoverMore');
      if (btnDiscover) {
        btnDiscover.addEventListener('click', function(e) {
          e.preventDefault();
          var footer = document.querySelector('.canvas-footer');
          if (footer) footer.scrollIntoView({ behavior: 'smooth' });
        });
      }
      window.addEventListener('hashchange', checkHash);`
    );
  }

  if (hasCrlf) content = content.replace(/\n/g, '\r\n');
  fs.writeFileSync(file, content, 'utf8');
  console.log(`Successfully updated ${file}`);
}
