const fs = require('fs');
const path = require('path');

const LUMINA_ROOT = path.resolve('C:/Users/czark/Desktop/@ICC/LUMINA');
const MUSIC_SRC = path.resolve('C:/Users/czark/.gemini/antigravity/brain/6171dbb4-faed-472d-ab3b-0ab4afdc2e53/scratch/music_src');
const DIST_ASSETS = path.join(MUSIC_SRC, 'dist/assets');
const LUMINA_ASSETS = path.join(LUMINA_ROOT, 'assets');

console.log('=== DEPLOYING CHRISTIAN CULTURE MUSIC PORTAL ===');

// 1. Copy assets
let jsAsset = '';
let cssAsset = '';

for (const file of fs.readdirSync(DIST_ASSETS)) {
  if (file.startsWith('music-index-') && file.endsWith('.js')) {
    jsAsset = `/assets/${file}`;
    fs.copyFileSync(path.join(DIST_ASSETS, file), path.join(LUMINA_ASSETS, file));
    console.log(`Copied JS asset: ${file}`);
  }
  if (file.startsWith('music-index-') && file.endsWith('.css')) {
    cssAsset = `/assets/${file}`;
    fs.copyFileSync(path.join(DIST_ASSETS, file), path.join(LUMINA_ASSETS, file));
    console.log(`Copied CSS asset: ${file}`);
  }
}

if (!jsAsset || !cssAsset) {
  throw new Error('Assets not found in dist/assets!');
}

function generateProductionHtml(title, desc, canonicalPath) {
  return `<!doctype html>
<html lang="pl">
  <head>
    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-Y4EFTVBPE3"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-Y4EFTVBPE3');
    </script>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <meta name="description" content="${desc}" />
    <link rel="canonical" href="https://polskieradio.cc${canonicalPath}" />
    <link rel="icon" type="image/png" href="/ccn-logo-square.png" />
    
    <!-- Open Graph -->
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${desc}" />
    <meta property="og:type" content="music.song" />
    <meta property="og:url" content="https://polskieradio.cc${canonicalPath}" />
    <meta property="og:image" content="https://polskieradio.cc/ccn-logo-square.png" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${desc}" />
    <meta name="twitter:image" content="https://polskieradio.cc/ccn-logo-square.png" />

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <script type="module" crossorigin src="${jsAsset}"></script>
    <link rel="stylesheet" crossorigin href="${cssAsset}">
  </head>
  <body class="bg-[#07090d] text-white">
    <div id="root"></div>
    <script>
      (function() {
        var btn = document.getElementById('backToTopBtn');
        if (!btn) return;
        window.addEventListener('scroll', function() {
          if (window.scrollY > 300) {
            btn.classList.add('visible');
          } else {
            btn.classList.remove('visible');
          }
        }, { passive: true });
      })();
    </script>
    <script src="/components/cc-support-footer.js" defer></script>
  </body>
</html>
`;
}

// 2. Generate HTML files for all paths
const SUBPATHS = [
  { sub: '', path: '/music', title: 'CHRISTIAN CULTURE MUSIC – Muzyka • Premiery • Artyści • Playlisty • Radio • Video', desc: 'Oficjalne centrum muzyczne Christian Culture: całodobowe Polskie Radio CC, premiery singli, 41 oficjalnych kanałów YouTube, playlisty uwielbienia i lista Top Seven.' },
  { sub: 'premiery', path: '/music/premiery', title: 'Muzyczne Premiery & Nowości Fonograficzne | Christian Culture Music', desc: 'Najnowsze single, nagrania uwielbienia i produkcje fonograficzne w jakości studyjnej.' },
  { sub: 'artysci', path: '/music/artysci', title: 'Artyści & 41 Oficjalnych Kanałów YouTube | Christian Culture Music', desc: 'Kompletny katalog 41 oficjalnych stacji, pasm i kanałów autorskich Christian Culture na YouTube.' },
  { sub: 'playlisty', path: '/music/playlisty', title: 'Kolekcje & Playlisty Muzyczne | Christian Culture Music', desc: 'Oficjalne playlisty uwielbienia, akustycznych psalmów i wyciszenia do snu Christian Culture.' },
  { sub: 'radio', path: '/music/radio', title: 'Polskie Radio CC & Transmisje Live 24/7 | Christian Culture Music', desc: 'Całodobowy strumień dźwiękowy Polskiego Radia CC oraz telewizyjne pasma RCC TV 24 i Worship LIVE CC.' },
  { sub: 'video', path: '/music/video', title: 'Video & Teledyski Studyjne 4K | Christian Culture Music', desc: 'Oficjalne wideoklipy, sesje akustyczne i koncerty uwielbienia Christian Culture w 4K.' },
  { sub: 'top', path: '/music/top', title: 'Top Seven – Oficjalna Lista Przebojów CC | Christian Culture Music', desc: 'Cotygodniowa lista 7 najlepszych hymnów i utworów uwielbienia na kanale @topseven_cc.' },
];

// Write music.html at root
const rootHtmlContent = generateProductionHtml(SUBPATHS[0].title, SUBPATHS[0].desc, SUBPATHS[0].path);
fs.writeFileSync(path.join(LUMINA_ROOT, 'music.html'), rootHtmlContent, 'utf8');
console.log('✓ Wrote music.html');

// Write music/index.html
const musicDir = path.join(LUMINA_ROOT, 'music');
if (!fs.existsSync(musicDir)) fs.mkdirSync(musicDir, { recursive: true });
fs.writeFileSync(path.join(musicDir, 'index.html'), rootHtmlContent, 'utf8');
console.log('✓ Wrote music/index.html');

// Write sub-paths
for (const item of SUBPATHS) {
  if (!item.sub) continue;
  const subDir = path.join(musicDir, item.sub);
  if (!fs.existsSync(subDir)) fs.mkdirSync(subDir, { recursive: true });
  const html = generateProductionHtml(item.title, item.desc, item.path);
  fs.writeFileSync(path.join(subDir, 'index.html'), html, 'utf8');
  console.log(`✓ Wrote music/${item.sub}/index.html`);
}

console.log('Christian Culture Music HTML files generated successfully!');
