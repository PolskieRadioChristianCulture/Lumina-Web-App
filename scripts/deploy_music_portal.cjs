const fs = require('fs');
const path = require('path');

const LUMINA_ROOT = path.resolve('C:/Users/czark/Desktop/@ICC/LUMINA');
const MUSIC_SRC = path.resolve('C:/Users/czark/.gemini/antigravity/brain/6171dbb4-faed-472d-ab3b-0ab4afdc2e53/scratch/music_src');
const DIST_ASSETS = path.join(MUSIC_SRC, 'dist/assets');
const LUMINA_ASSETS = path.join(LUMINA_ROOT, 'assets');

console.log('=== DEPLOYING CHRISTIAN CULTURE MUSIC PORTAL (SEO AI OPTIMIZED) ===');

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

const JSON_LD_SCHEMA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://polskieradio.cc/#website",
      "url": "https://polskieradio.cc/",
      "name": "Christian Culture",
      "description": "Chrześcijański ekosystem medialny: radio 24/7, telewizja, muzyka uwielbienia, akademia biblijna i kino VOD.",
      "publisher": {
        "@type": "Organization",
        "@id": "https://polskieradio.cc/#organization",
        "name": "Christian Culture",
        "url": "https://polskieradio.cc/",
        "logo": {
          "@type": "ImageObject",
          "url": "https://polskieradio.cc/ccn-logo-square.png",
          "width": 512,
          "height": 512
        },
        "founder": [
          {
            "@type": "Person",
            "name": "Cezary Rogowski",
            "jobTitle": "Założyciel Christian Culture",
            "image": "https://polskieradio.cc/avatar_cezary_official.jpg"
          },
          {
            "@type": "Person",
            "name": "Wioletta Rogowska",
            "jobTitle": "Współzałożycielka Christian Culture",
            "image": "https://polskieradio.cc/avatar_wioletta_official.jpg"
          }
        ]
      }
    },
    {
      "@type": "RadioStation",
      "@id": "https://polskieradio.cc/music#radio",
      "name": "Polskie Radio Christian Culture",
      "alternateName": ["Radio CC", "Polskie Radio CC", "Christian Culture Radio"],
      "url": "https://polskieradio.cc/music/radio",
      "broadcastDisplayName": "Polskie Radio CC - Pasmo Uwielbienia & Prawdy",
      "genre": [
        "Christian",
        "Worship",
        "Gospel",
        "Contemporary Christian Music",
        "Biblia Śpiewana"
      ],
      "bitrate": "320 kbps",
      "inLanguage": "pl-PL",
      "potentialAction": {
        "@type": "ListenAction",
        "target": [
          {
            "@type": "EntryPoint",
            "urlTemplate": "https://stream.zeno.fm/imo45hqnshyuv",
            "actionPlatform": [
              "http://schema.org/DesktopWebPlatform",
              "http://schema.org/MobileWebPlatform"
            ]
          }
        ],
        "expectsAcceptanceOf": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "PLN"
        }
      }
    },
    {
      "@type": "ItemList",
      "@id": "https://polskieradio.cc/music#top7",
      "name": "Top Seven – Oficjalna Lista Przebojów Christian Culture",
      "description": "Najpopularniejsze światowe chrześcijańskie hity uwielbienia i premiery muzyczne notowane na kanale @topseven_cc.",
      "itemListOrder": "https://schema.org/ItemListOrderAscending",
      "numberOfItems": 7,
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "item": {
            "@type": "MusicRecording",
            "name": "What A Beautiful Name",
            "byArtist": {
              "@type": "MusicGroup",
              "name": "Hillsong Worship"
            },
            "duration": "PT5M42S",
            "genre": "Christian Worship",
            "url": "https://www.youtube.com/watch?v=nQWFzMvCfLE"
          }
        },
        {
          "@type": "ListItem",
          "position": 2,
          "item": {
            "@type": "MusicRecording",
            "name": "Goodness of God",
            "byArtist": {
              "@type": "Person",
              "name": "CeCe Winans"
            },
            "duration": "PT4M58S",
            "genre": "Gospel / Worship",
            "url": "https://www.youtube.com/watch?v=9sE5kEnitqE"
          }
        },
        {
          "@type": "ListItem",
          "position": 3,
          "item": {
            "@type": "MusicRecording",
            "name": "You Say",
            "byArtist": {
              "@type": "Person",
              "name": "Lauren Daigle"
            },
            "duration": "PT4M35S",
            "genre": "Contemporary Christian",
            "url": "https://www.youtube.com/watch?v=sIaT8Jl2zpI"
          }
        },
        {
          "@type": "ListItem",
          "position": 4,
          "item": {
            "@type": "MusicRecording",
            "name": "Oceans (Where Feet May Fail)",
            "byArtist": {
              "@type": "MusicGroup",
              "name": "Hillsong UNITED"
            },
            "duration": "PT8M56S",
            "genre": "Christian Worship",
            "url": "https://www.youtube.com/watch?v=dy9nwe9_xzw"
          }
        },
        {
          "@type": "ListItem",
          "position": 5,
          "item": {
            "@type": "MusicRecording",
            "name": "Battle Belongs",
            "byArtist": {
              "@type": "Person",
              "name": "Phil Wickham"
            },
            "duration": "PT4M47S",
            "genre": "Christian Worship",
            "url": "https://www.youtube.com/watch?v=qtvQNzPHn-w"
          }
        },
        {
          "@type": "ListItem",
          "position": 6,
          "item": {
            "@type": "MusicRecording",
            "name": "O Come to the Altar",
            "byArtist": {
              "@type": "MusicGroup",
              "name": "Elevation Worship"
            },
            "duration": "PT5M54S",
            "genre": "Christian Worship",
            "url": "https://www.youtube.com/watch?v=rYQ5yXCc_CA"
          }
        },
        {
          "@type": "ListItem",
          "position": 7,
          "item": {
            "@type": "MusicRecording",
            "name": "Gratitude",
            "byArtist": {
              "@type": "Person",
              "name": "Brandon Lake"
            },
            "duration": "PT5M37S",
            "genre": "Christian Worship",
            "url": "https://www.youtube.com/watch?v=dQdfs5S6jyA"
          }
        }
      ]
    },
    {
      "@type": "FAQPage",
      "@id": "https://polskieradio.cc/music#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Czym jest Christian Culture Music?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Christian Culture Music to oficjalne centrum muzyki chrześcijańskiej, hymnów uwielbienia (Worship), muzyki Gospel oraz autorskiej fonografii biblijnej ekosystemu Christian Culture. Portal łączy całodobowe Polskie Radio CC (-16 LUFS HQ Master), telewizyjne pasma muzyczne RCC TV 24 i Worship LIVE CC, notowania listy przebojów Top Seven oraz katalog 41 oficjalnych kanałów na YouTube."
          }
        },
        {
          "@type": "Question",
          "name": "Jak słuchać Polskiego Radia Christian Culture na żywo?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Strumień radiowy Polskiego Radia CC jest dostępny bezpłatnie i bez reklam 24 godziny na dobę pod adresem polskieradio.cc/music/radio oraz polskieradio.cc/player w jakości stereofonicznej HQ 320 kbps."
          }
        },
        {
          "@type": "Question",
          "name": "Jakie chrześcijańskie hity uwielbienia znajdują się na liście Top Seven?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "W zestawieniu Top Seven znajdują się wyłącznie największe światowe hity chrześcijańskiego uwielbienia, zdobywcy nagród Grammy i rekordziści Billboard: What A Beautiful Name (Hillsong Worship), Goodness of God (CeCe Winans), You Say (Lauren Daigle), Oceans (Hillsong UNITED), Battle Belongs (Phil Wickham), O Come to the Altar (Elevation Worship) oraz Gratitude (Brandon Lake)."
          }
        },
        {
          "@type": "Question",
          "name": "Ile kanałów YouTube tworzy ekosystem Christian Culture?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Ekosystem tworzy 41 oficjalnych kanałów YouTube, w tym Polskie Radio CC, CC TV, Personality Plus, RCC TV 24, Worship LIVE CC, Ubierz Słowa i Christian Culture POP."
          }
        },
        {
          "@type": "Question",
          "name": "Kto jest twórcą portalu Christian Culture Music?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Założycielami ekosystemu Christian Culture i portalu muzycznego są Cezary Rogowski i Wioletta Rogowska."
          }
        }
      ]
    }
  ]
};

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
    
    <!-- SEO AI, GEO (Generative Engine Optimization) & Bot Directives -->
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
    <meta name="keywords" content="Christian Culture Music, Polskie Radio CC, muzyka chrześcijańska, chrześcijańskie hity, worship, uwielbienie, gospel, Hillsong, CeCe Winans, Lauren Daigle, Chris Tomlin, Phil Wickham, Elevation Worship, Top Seven, radio chrześcijańskie online, Biblia Śpiewana, radio na żywo, pieśni chwały, Cezary Rogowski, Wioletta Rogowska" />
    <meta name="author" content="Cezary Rogowski, Wioletta Rogowska, Christian Culture" />

    <!-- Open Graph (Facebook / AI Previews) -->
    <meta property="og:site_name" content="Christian Culture Music" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${desc}" />
    <meta property="og:type" content="music.radio_station" />
    <meta property="og:url" content="https://polskieradio.cc${canonicalPath}" />
    <meta property="og:image" content="https://polskieradio.cc/ccn-logo-square.png" />
    <meta property="og:locale" content="pl_PL" />

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${desc}" />
    <meta name="twitter:image" content="https://polskieradio.cc/ccn-logo-square.png" />

    <!-- Preconnect & Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="preconnect" href="https://stream.zeno.fm" crossorigin>
    <link rel="preconnect" href="https://www.youtube-nocookie.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <!-- JSON-LD Structured Data (Knowledge Graph & AI Overviews) -->
    <script type="application/ld+json">
      ${JSON.stringify(JSON_LD_SCHEMA, null, 2)}
    </script>

    <!-- CSS & JS Bundle -->
    <script type="module" crossorigin src="${jsAsset}"></script>
    <link rel="stylesheet" crossorigin href="${cssAsset}">
  </head>
  <body class="bg-[#f8f9fa] text-gray-900">
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
  { sub: '', path: '/music', title: 'CHRISTIAN CULTURE MUSIC – Muzyka • Przeboje TOP 100 • Premiery • Artyści • Playlisty • Radio • Video', desc: 'Oficjalne centrum muzyczne Christian Culture: całodobowe Polskie Radio CC, oficjalna Lista Przebojów TOP 100, światowe hity uwielbienia i 41 kanałów YouTube.' },
  { sub: 'przeboje', path: '/music/przeboje', title: 'Lista Przebojów TOP 100 Christian Culture | Polskie Radio CC', desc: 'Oficjalna Lista Przebojów TOP 100 Christian Culture: 100 największych utworów i filmów z kanałów Osobowość +, CC TV, Polskie Radio CC i CC Women. Głosuj sercem, słuchaj i polecaj!' },
  { sub: 'premiery', path: '/music/premiery', title: 'Muzyczne Premiery & Światowe Hity Chrześcijańskie | Christian Culture Music', desc: 'Najnowsze single, nagrania uwielbienia i produkcje fonograficzne w jakości studyjnej 4K.' },
  { sub: 'artysci', path: '/music/artysci', title: 'Artyści & 41 Oficjalnych Kanałów YouTube | Christian Culture Music', desc: 'Kompletny katalog 41 oficjalnych stacji, pasm i kanałów autorskich Christian Culture na YouTube.' },
  { sub: 'playlisty', path: '/music/playlisty', title: 'Kolekcje & Playlisty Muzyczne | Christian Culture Music', desc: 'Oficjalne playlisty uwielbienia: 538 utworów CCTV24, 58 autorskich pieśni Osobowość PLUS oraz światowe hity.' },
  { sub: 'radio', path: '/music/radio', title: 'Polskie Radio CC & Transmisje Live 24/7 | Christian Culture Music', desc: 'Całodobowy strumień dźwiękowy Polskiego Radia CC (-16 LUFS HQ Master) oraz telewizyjne pasma RCC TV 24 i Worship LIVE CC.' },
  { sub: 'video', path: '/music/video', title: 'Video & Teledyski Studyjne 4K | Christian Culture Music', desc: 'Oficjalne wideoklipy, koncerty uwielbienia i sesje akustyczne Christian Culture w 4K.' },
  { sub: 'top', path: '/music/top', title: 'Top Seven – Oficjalna Lista Przebojów CC | Christian Culture Music', desc: 'Cotygodniowa lista 7 najlepszych światowych hymnów chrześcijańskich (Hillsong, CeCe Winans, Lauren Daigle, Phil Wickham).' },
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

console.log('Christian Culture Music HTML files (SEO AI Optimized) generated successfully!');
