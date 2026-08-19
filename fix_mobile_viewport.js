/**
 * fix_mobile_viewport.js
 * Bezpiecznie wstrzykuje CSS override do kanałów nadawczych:
 *  - body/html position:fixed + 100dvh — zapobiega "spadaniu poza ekran" na mobile
 *  - #app-container position:fixed   — zapobiega scroll/overflow w iframe/WebView
 *  - visualViewport resizeViewport   — poprawia skalę po chowaniu paska Chrome
 * TYLKO dla plików z #app-container (kanały nadawcze z auto-scalingiem).
 * NIE dotyka: cctv24-worship.html (zamrożony produkcyjny).
 */
const fs = require('fs');
const path = require('path');

const DIR = __dirname;

// Lista plików do naprawienia (cctv24-worship.html ZAMROŻONY - pomijamy)
const TARGETS = [
  'cctv24-pl.html',
  'cctv24-global.html',
  'cctv24.html',
  'cctv24-worship-live.html',
  'zapolske-live.html',
  'biblia-spiewana-live.html',
  'biblia-spiewana-vertical.html',
  'stream-scene.html',
  'stream-scene-vertical.html',
  'kino-live.html',
  'spiewajmy-panu-live.html',
  'studium-live.html',
  'swiadectwa-live.html',
  'nocne-czuwanie-live.html',
  'apokalipsa-live.html',
  'apokalipsa-ksiega-nadziei-live.html',
  'bibleaudio-global.html',
];

const CSS_OVERRIDE = `
        /* ===== MOBILE VIEWPORT FIX (auto-injected) ===== */
        body, html {
            position: fixed !important;
            inset: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            touch-action: none !important;
            overflow: hidden !important;
        }
        #app-container {
            position: fixed !important;
        }
        /* =============================================== */`;

const VVP_PATCH = `
            // === MOBILE VIEWPORT FIX: visualViewport + orientationchange ===
            (function() {
                function _rvp() {
                    const c = document.getElementById('app-container');
                    if (!c) return;
                    const vvp = window.visualViewport;
                    const w = vvp ? vvp.width  : window.innerWidth;
                    const h = vvp ? vvp.height : window.innerHeight;
                    if (!w || !h) return;
                    const scale = Math.min(w / 1920, h / 1080);
                    c.style.transformOrigin = 'top left';
                    c.style.transform = 'scale(' + scale + ')';
                    c.style.left = Math.max(0, (w - 1920 * scale) / 2) + 'px';
                    c.style.top  = Math.max(0, (h - 1080 * scale) / 2) + 'px';
                }
                if (window.visualViewport) {
                    window.visualViewport.addEventListener('resize', _rvp);
                    window.visualViewport.addEventListener('scroll', _rvp);
                }
                window.addEventListener('orientationchange', function() {
                    setTimeout(_rvp, 200);
                    setTimeout(_rvp, 600);
                });
                window.addEventListener('resize', _rvp);
                // Initial call after DOM ready
                if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', _rvp);
                } else {
                    _rvp();
                }
                setTimeout(_rvp, 100);
                setTimeout(_rvp, 500);
                setTimeout(_rvp, 1500);
            })();
            // === END MOBILE VIEWPORT FIX ===`;

let totalFixed = 0;
let totalSkipped = 0;

for (const filename of TARGETS) {
  const filepath = path.join(DIR, filename);
  if (!fs.existsSync(filepath)) {
    console.log(`[SKIP] ${filename} — plik nie istnieje`);
    totalSkipped++;
    continue;
  }

  let html = fs.readFileSync(filepath, 'utf8');

  // Sprawdź czy plik ma #app-container (ma auto-scaling)
  if (!html.includes('app-container')) {
    console.log(`[SKIP] ${filename} — brak #app-container`);
    totalSkipped++;
    continue;
  }

  // Sprawdź czy CSS override już jest wstrzyknięty
  if (html.includes('MOBILE VIEWPORT FIX (auto-injected)')) {
    console.log(`[SKIP] ${filename} — już naprawiony`);
    totalSkipped++;
    continue;
  }

  // === 1. Wstrzyknij CSS override przed </style> (pierwszym) ===
  const styleCloseIdx = html.indexOf('</style>');
  if (styleCloseIdx === -1) {
    console.log(`[WARN] ${filename} — brak </style>`);
    totalSkipped++;
    continue;
  }
  html = html.slice(0, styleCloseIdx) + CSS_OVERRIDE + '\n    ' + html.slice(styleCloseIdx);

  // === 2. Zastąp resizeViewport lub wstrzyknij VVP patch ===
  // Szukamy istniejącej funkcji resizeViewport i zastępujemy ją lepszą wersją
  const rvpStart = html.indexOf('function resizeViewport()');
  const rvpEnd   = html.indexOf('\n            window.addEventListener("resize", resizeViewport)');
  
  if (rvpStart !== -1 && rvpEnd !== -1) {
    // Zastąp całą funkcję resizeViewport + nasłuchiwacz resize
    const beforeRvp = html.slice(0, rvpStart);
    const afterRvp  = html.slice(rvpEnd);
    const newRvp = `function resizeViewport() {
                const container = document.getElementById("app-container");
                if (!container) return;
                const vvp = window.visualViewport;
                const w = vvp ? vvp.width  : (window.innerWidth  || document.documentElement.clientWidth  || 0);
                const h = vvp ? vvp.height : (window.innerHeight || document.documentElement.clientHeight || 0);
                if (w <= 0 || h <= 0) return;
                const scale = Math.min(w / 1920, h / 1080);
                container.style.transformOrigin = "top left";
                container.style.transform = "scale(" + scale + ")";
                container.style.left = Math.max(0, (w - 1920 * scale) / 2) + "px";
                container.style.top  = Math.max(0, (h - 1080 * scale) / 2) + "px";
            }`;
    html = beforeRvp + newRvp + afterRvp;
    
    // Dodaj visualViewport + orientationchange przed resizeViewport(); (pierwsze wywołanie)
    const firstCallIdx = html.indexOf('resizeViewport();\n            window.addEventListener("resize", resizeViewport)');
    if (firstCallIdx !== -1) {
      html = html.slice(0, firstCallIdx) + html.slice(firstCallIdx)
        .replace(
          'window.addEventListener("resize", resizeViewport);',
          `window.addEventListener("resize", resizeViewport);
            window.addEventListener("orientationchange", function() { setTimeout(resizeViewport,200); setTimeout(resizeViewport,600); });
            if (window.visualViewport) {
                window.visualViewport.addEventListener("resize", resizeViewport);
                window.visualViewport.addEventListener("scroll", resizeViewport);
            }`
        );
    }
  } else {
    // Jeśli nie ma resizeViewport — dorzuć skrypt przed </body>
    html = html.replace('</body>', VVP_PATCH + '\n</body>');
  }

  fs.writeFileSync(filepath, html, 'utf8');
  console.log(`[OK] ${filename}`);
  totalFixed++;
}

console.log(`\nGotowe: ${totalFixed} naprawiono, ${totalSkipped} pominiętych.`);
