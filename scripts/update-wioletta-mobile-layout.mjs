import fs from 'fs';
import path from 'path';

const filePath = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/Wioletta.html';
let html = fs.readFileSync(filePath, 'utf8');

// 1. Ensure .nav-center a, .nav-center button has white-space: nowrap
if (!html.includes('.nav-center button {\n      white-space: nowrap;')) {
  html = html.replace(
    /\.nav-center button\s*\{([\s\S]*?)min-height: 44px;/m,
    (match) => match.includes('white-space: nowrap;') ? match : match.replace('min-height: 44px;', 'min-height: 44px;\n      white-space: nowrap;')
  );
}

// 2. Replace the media query block @media (max-width: 860px) { ... }
const oldMediaRegex = /@media \(max-width: 860px\) \{[\s\S]*?\}\s*\}\s*\.mobile-hero-panel\s*\{/m;

const newMediaCss = `@media (max-width: 860px) {
      .viewport-stage {
        display: block;
        height: auto;
        min-height: 100vh;
        min-height: 100dvh;
        overflow-x: hidden;
        overflow-y: auto;
        background: #05070a;
        padding: 0;
      }
      .hero-canvas {
        width: 100%;
        max-width: 520px;
        margin: 0 auto;
        aspect-ratio: auto;
        min-height: 100vh;
        min-height: 100dvh;
        max-height: none;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        position: relative;
        background: #05070a;
      }
      .navbar {
        order: 1;
        position: relative;
        padding: 12px clamp(10px, 3vw, 16px) 6px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        width: 100%;
        z-index: 10;
        background: transparent;
      }
      .brand {
        flex: 1 1 auto;
        min-width: 0;
      }
      .brand-name {
        font-size: clamp(0.74rem, 3.2vw, 0.88rem);
        letter-spacing: 0.12em;
        white-space: nowrap;
        line-height: 1.2;
      }
      .brand-sub {
        font-size: clamp(0.48rem, 2vw, 0.58rem);
        letter-spacing: 0.18em;
        white-space: nowrap;
        margin-top: 2px;
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
        padding: 6px 10px;
        font-size: 0.66rem;
        letter-spacing: 0.1em;
        gap: 5px;
        min-height: 44px;
        white-space: nowrap;
      }
      .btn-burger {
        width: 44px;
        height: 44px;
        min-width: 44px;
        min-height: 44px;
        font-size: 1.25rem;
      }
      .hero-canvas-art {
        order: 2;
        position: relative;
        width: 100%;
        max-width: 440px;
        margin: 0 auto;
        height: auto !important;
        flex: 0 0 auto;
        aspect-ratio: 800 / 650;
        overflow: hidden;
      }
      .hero-canvas-art picture,
      .hero-canvas-art img {
        width: 100%;
        height: auto;
        aspect-ratio: 800 / 658;
        object-fit: cover;
        display: block;
      }
      .hero-canvas-art::after {
        content: "";
        position: absolute;
        inset: 0;
        background: linear-gradient(to bottom, rgba(5, 7, 10, 0) 65%, rgba(5, 7, 10, 0.75) 88%, #05070a 100%);
        pointer-events: none;
      }
      .cta-hotspot {
        display: none;
      }
      .mobile-hero-panel {
        order: 3;
        display: block !important;
        position: relative;
        z-index: 5;
        margin-top: -24px;
        padding: 0 clamp(16px, 4vw, 24px) 24px;
        text-align: center;
        flex: 1 0 auto;
      }
      .mobile-kicker {
        font-family: var(--font-sans);
        font-size: 0.72rem;
        font-weight: 700;
        letter-spacing: 0.26em;
        color: var(--rose-muted);
        text-transform: uppercase;
        margin-bottom: 8px;
      }
      .mobile-title {
        font-family: var(--font-serif);
        font-size: clamp(2.3rem, 7.8vw, 3rem);
        line-height: 1.06;
        margin: 0 0 10px;
        font-weight: 500;
        color: #ffffff;
      }
      .mobile-title span {
        color: var(--rose);
        font-style: italic;
      }
      .mobile-divider {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        max-width: 180px;
        margin: 0 auto 14px;
        opacity: 0.6;
      }
      .mobile-divider-line {
        flex: 1;
        height: 1px;
        background: linear-gradient(90deg, transparent, var(--rose-muted), transparent);
      }
      .mobile-divider-heart {
        color: var(--rose-muted);
        font-size: 0.8rem;
      }
      .mobile-subtitle {
        font-family: var(--font-serif);
        font-size: clamp(1.02rem, 3.4vw, 1.18rem);
        font-style: italic;
        color: var(--cream-muted);
        line-height: 1.5;
        margin: 0 auto 20px;
        max-width: 330px;
      }
      .mobile-actions-row {
        display: flex;
        gap: 12px;
        justify-content: center;
        align-items: center;
        margin-bottom: 20px;
      }
      .mobile-btn-czytaj {
        flex: 1;
        max-width: 155px;
        min-height: 48px;
        padding: 12px 20px;
        border: 1.5px solid var(--gold);
        border-radius: 6px;
        background: transparent;
        color: var(--cream);
        font-family: var(--font-cinzel);
        font-size: 0.92rem;
        font-weight: 700;
        letter-spacing: 0.22em;
        text-transform: uppercase;
        cursor: pointer;
        transition: all 0.2s;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .mobile-btn-czytaj:active {
        background: var(--gold);
        color: #05070a;
      }
      .mobile-btn-wspieram {
        flex: 1;
        max-width: 175px;
        min-height: 48px;
        padding: 12px 16px;
        border: 1.5px solid rgba(229, 184, 194, 0.7);
        border-radius: 6px;
        background: transparent;
        color: var(--cream);
        font-family: var(--font-cinzel);
        font-size: 0.88rem;
        font-weight: 700;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        cursor: pointer;
        transition: all 0.2s;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .mobile-btn-wspieram:active {
        background: rgba(229, 184, 194, 0.25);
        color: #ffffff;
      }
      .mobile-sublinks {
        display: flex;
        gap: clamp(12px, 3.5vw, 22px);
        justify-content: center;
        align-items: center;
        margin-bottom: 20px;
        flex-wrap: nowrap;
      }
      .mobile-sublink-btn {
        background: none;
        border: none;
        color: var(--cream);
        cursor: pointer;
        font-family: var(--font-cinzel);
        font-size: 0.82rem;
        font-weight: 600;
        letter-spacing: 0.2em;
        text-transform: uppercase;
        white-space: nowrap;
        min-height: 44px;
        display: inline-flex;
        align-items: center;
        padding: 6px;
        transition: color 0.2s;
      }
      .mobile-sublink-btn:active {
        color: var(--gold-light);
      }
      .canvas-footer {
        order: 4;
        position: relative;
        padding: 14px 20px 28px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        gap: 14px;
        width: 100%;
        background: transparent;
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
    @media (max-width: 350px) {
      .btn-news {
        padding: 0;
        width: 44px;
        height: 44px;
        min-width: 44px;
        min-height: 44px;
        justify-content: center;
        border-radius: 50%;
      }
      .btn-news-text {
        display: none;
      }
      .brand-name {
        font-size: 0.72rem;
        letter-spacing: 0.1em;
      }
    }
    .mobile-hero-panel {`;

html = html.replace(oldMediaRegex, newMediaCss);

// 3. Update the picture tag to include mobile sources
const oldArtRegex = /<div class="hero-canvas-art">[\s\S]*?<\/picture>\s*<\/div>/m;
const newArt = `<div class="hero-canvas-art">
        <picture>
          <source media="(max-width: 860px)" srcset="/images/wioletta/wioletta-hero-mobile.webp" type="image/webp">
          <source media="(max-width: 860px)" srcset="/images/wioletta/wioletta-hero-mobile.jpg" type="image/jpeg">
          <source srcset="/images/wioletta/wioletta-hero-stage.webp" type="image/webp">
          <img
            src="/images/wioletta/wioletta-hero-stage.jpg"
            alt="Wioletta Rogowska — Autorka powieści Pardon, Czy To Miłość?"
            width="1024"
            height="576"
            loading="eager"
            fetchpriority="high"
          >
        </picture>
      </div>`;

html = html.replace(oldArtRegex, newArt);

// 4. Update the mobile-hero-panel to include the decorative divider
const oldMobilePanelRegex = /<div class="mobile-hero-panel">[\s\S]*?<\/div>\s*<!-- BOTTOM BAR/m;
const newMobilePanel = `<div class="mobile-hero-panel">
        <div class="mobile-kicker">
          MIŁOŚĆ, WYBACZENIE, WYBÓR.
        </div>
        <h1 class="mobile-title">
          Pardon,<br><span>Czy To</span> Miłość?
        </h1>
        <div class="mobile-divider" aria-hidden="true">
          <span class="mobile-divider-line"></span>
          <span class="mobile-divider-heart">♥</span>
          <span class="mobile-divider-line"></span>
        </div>
        <p class="mobile-subtitle">
          Paryż. Deszcz. List, który zmienia wszystko.<br>Czy miłość wystarczy, by wybaczono?
        </p>
        <div class="mobile-actions-row">
          <button class="mobile-btn-czytaj" type="button" data-modal="modalCzytaj" aria-label="Czytaj powieść online">
            CZYTAJ
          </button>
          <button class="mobile-btn-wspieram" type="button" data-modal="modalWspieramTo" aria-label="Wspieram to przez Revolut">
            WSPIERAM TO
          </button>
        </div>
        <div class="mobile-sublinks">
          <button class="mobile-sublink-btn" type="button" data-modal="modalKsiazki">KSIĄŻKI</button>
          <button class="mobile-sublink-btn" type="button" data-modal="modalOAutorce">O AUTORCE</button>
          <button class="mobile-sublink-btn" type="button" data-modal="modalKontakt">KONTAKT</button>
        </div>
      </div>

      <!-- BOTTOM BAR`;

html = html.replace(oldMobilePanelRegex, newMobilePanel);

html = html.replace(
  /<span>NEWSLETTER<\/span>/g,
  '<span class="btn-news-text">NEWSLETTER</span>'
);

fs.writeFileSync(filePath, html, 'utf8');

// Also sync to Wioletta/index.html
const indexHtmlPath = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/Wioletta/index.html';
fs.writeFileSync(indexHtmlPath, html, 'utf8');

console.log('Successfully updated Wioletta.html and Wioletta/index.html!');
