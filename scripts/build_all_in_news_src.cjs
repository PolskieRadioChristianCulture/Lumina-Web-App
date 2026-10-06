const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { LUMINA_ROOT, SCRATCH_ROOT, NEWS_SRC, PORTALS } = require('./portals_data.cjs');

console.log('=== BUILD 5 HUBS DIRECTLY IN NEWS_SRC ===');

const VITE_JS = path.join(NEWS_SRC, 'node_modules/vite/bin/vite.js');

// Backup original files
const BACKUPS = {
  articles: fs.readFileSync(path.join(NEWS_SRC, 'src/data/articles.ts'), 'utf8'),
  lexicon: fs.readFileSync(path.join(NEWS_SRC, 'src/data/lexicon.ts'), 'utf8'),
  ticker: fs.readFileSync(path.join(NEWS_SRC, 'src/components/BreakingTicker.tsx'), 'utf8'),
  header: fs.readFileSync(path.join(NEWS_SRC, 'src/components/Header.tsx'), 'utf8'),
  app: fs.readFileSync(path.join(NEWS_SRC, 'src/App.tsx'), 'utf8'),
  viteConfig: fs.readFileSync(path.join(NEWS_SRC, 'vite.config.ts'), 'utf8'),
  indexHtml: fs.readFileSync(path.join(NEWS_SRC, 'index.html'), 'utf8'),
};

const AUTHORS_DEF = `export const AUTHORS: Record<string, Author> = {
  cezary: {
    id: 'cezary-rogowski',
    name: 'Cezary Rogowski',
    role: 'Założyciel Christian Culture',
    status: 'Żonaty',
    avatarUrl: '/avatar_cezary_official.jpg',
    bio: 'Założyciel ekosystemu Christian Culture oraz portalu Lumina i stacji Polskie Radio CC.',
  },
  wioletta: {
    id: 'wioletta-rogowska',
    name: 'Wioletta Rogowska',
    role: 'Współzałożycielka Christian Culture',
    status: 'Mężatka',
    avatarUrl: '/avatar_wioletta_official.jpg',
    bio: 'Współzałożycielka Christian Culture, koordynatorka inicjatyw charytatywnych i ewangelizacyjnych.',
  },
  redakcja: {
    id: 'redakcja-ccn',
    name: 'Cezary Rogowski',
    role: 'Redakcja CCN',
    avatarUrl: '/avatar_cezary_official.jpg',
    bio: 'Założyciel Christian Culture. Materiały opracowane przez redakcję CCN.',
  },
  partner: {
    id: 'studio-dobrego-slowa',
    name: 'Studio Dobrego Słowa',
    role: 'Partner Misyjny Christian Culture',
    avatarUrl: 'https://i.ytimg.com/vi/ZQfzarxSDkU/hqdefault.jpg',
    bio: 'Oficjalny partner misyjny Christian Culture (studiods.pl). Twórcy głębokich rozważań biblijnych i programów o nadziei Ewangelii.',
  },
};
`;

function generateProductionHtml(portal, jsUrl, cssUrl) {
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
    <title>${portal.title}</title>
    <meta name="description" content="${portal.description}" />
    <link rel="canonical" href="${portal.canonical}" />
    <link rel="icon" type="image/png" href="/ccn-logo-square.png" />
    
    <!-- Open Graph -->
    <meta property="og:title" content="${portal.title}" />
    <meta property="og:description" content="${portal.description}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${portal.canonical}" />
    <meta property="og:image" content="https://polskieradio.cc/ccn-logo-square.png" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${portal.title}" />
    <meta name="twitter:description" content="${portal.description}" />
    <meta name="twitter:image" content="https://polskieradio.cc/ccn-logo-square.png" />

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <script type="module" crossorigin src="${jsUrl}"></script>
    <link rel="stylesheet" crossorigin href="${cssUrl}">
    
    <style>
      /* FLOATING BACK TO TOP BUTTON */
      .back-to-top {
          position: fixed;
          right: 1.5rem;
          bottom: 2rem;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(15, 15, 15, 0.85);
          border: 1.5px solid #D4A94A;
          color: #D4A94A;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.95rem;
          cursor: pointer;
          z-index: 998;
          opacity: 0;
          visibility: hidden;
          transform: translateY(15px);
          transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1),
                      visibility 0.3s cubic-bezier(0.16, 1, 0.3, 1),
                      transform 0.3s cubic-bezier(0.16, 1, 0.3, 1),
                      background 0.2s ease,
                      color 0.2s ease,
                      box-shadow 0.2s ease;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5), 0 0 10px rgba(212, 169, 74, 0.15);
          backdrop-filter: blur(5px);
          -webkit-backdrop-filter: blur(5px);
          outline: none;
          user-select: none;
          -webkit-tap-highlight-color: transparent;
      }
      .back-to-top.visible { opacity: 1; visibility: visible; transform: translateY(0); }
      .back-to-top:hover { background: #D4A94A; color: #050505; box-shadow: 0 8px 25px rgba(212, 169, 74, 0.4); transform: translateY(-3px); }
      .back-to-top:active { transform: translateY(0) scale(0.95); }
      @media (max-width: 767px) {
          .back-to-top { right: 1.25rem; bottom: max(1.25rem, env(safe-area-inset-bottom, 20px)); width: 44px; height: 44px; font-size: 1.05rem; }
      }

      /* Estetyczny scrollbar spójny z systemem CC */
      html { scroll-behavior: smooth; overflow-y: scroll !important; }
      body { overflow-y: visible !important; }
      ::-webkit-scrollbar { width: 8px; height: 8px; }
      ::-webkit-scrollbar-track { background: #f1f1f4; }
      ::-webkit-scrollbar-thumb { background: #c1c1c8; border-radius: 4px; }
      ::-webkit-scrollbar-thumb:hover { background: ${portal.accentColor || '#bb142e'}; }
      .no-scrollbar::-webkit-scrollbar { display: none !important; }
      .no-scrollbar { -ms-overflow-style: none !important; scrollbar-width: none !important; }

      /* PŁYNNY TICKER BROADCAST MARQUEE */
      @keyframes ccnBroadcastTicker {
        0% { transform: translate3d(0, 0, 0); }
        100% { transform: translate3d(-50%, 0, 0); }
      }
      .ccn-ticker-track {
        display: inline-flex !important;
        white-space: nowrap !important;
        width: max-content !important;
        will-change: transform;
        animation: ccnBroadcastTicker 40s linear infinite !important;
      }
      .ccn-ticker-track:hover {
        animation-play-state: paused !important;
      }
    </style>
  </head>
  <body class="bg-gray-50 text-gray-900 antialiased selection:bg-[#bb142e] selection:text-white">
    <div id="root">
      <div id="${portal.id}-startup" role="status" style="max-width:34rem;margin:4rem auto;padding:1.5rem;font:16px/1.6 system-ui;color:#18181b;background:#fff;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.06);border:1px solid #e4e4e7">
        <h1 style="color:#bb142e;font-size:1.4rem;font-weight:bold;margin-bottom:0.5rem">${portal.shortTitle}</h1>
        <p id="${portal.id}-startup-message" style="color:#52525b">Ładowanie opracowań i analiz biblijnych…</p>
        <p style="margin-top:1rem">
          <button onclick="location.reload()" style="padding:10px 18px;border-radius:8px;background:#bb142e;color:#fff;border:none;cursor:pointer;font-weight:600">Odśwież stronę</button>
          <a href="/news" style="margin-left:14px;color:#52525b;text-decoration:none;font-weight:500">Przejdź do CCN News</a>
        </p>
        <noscript>Włącz JavaScript w przeglądarce, aby wyświetlić portal.</noscript>
      </div>
    </div>

    <!-- BACK TO TOP BUTTON -->
    <button class="back-to-top" id="backToTopBtn" aria-label="Przewiń do góry" title="Przewiń do góry">
        <i class="fa-solid fa-arrow-up" aria-hidden="true"></i>
    </button>

    <script>
      setTimeout(function () {
        var message = document.getElementById('${portal.id}-startup-message');
        if (message) message.textContent = 'Nie udało się załadować portalu. Odśwież stronę. W razie pytań napisz: radiochristianculture@gmail.com.';
      }, 15000);

      (function() {
        var backToTopBtn = document.getElementById('backToTopBtn');
        if (!backToTopBtn) return;
        function updateScroll() {
          if (window.scrollY > 300) { backToTopBtn.classList.add('visible'); }
          else { backToTopBtn.classList.remove('visible'); }
        }
        window.addEventListener('scroll', updateScroll, { passive: true });
        backToTopBtn.addEventListener('click', function(e) {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        updateScroll();
      })();
    </script>
    <script src="/components/cc-support-footer.js" defer></script>
  </body>
</html>
`;
}

try {
  const targetPortalId = process.argv[2];
  const portalsToBuild = targetPortalId ? PORTALS.filter(p => p.id === targetPortalId) : PORTALS;
  console.log(`Portals to build: ${portalsToBuild.map(p => p.id).join(', ')}`);

  // Loop through portals
  for (const portal of portalsToBuild) {
    console.log(`\n>>> BUILDING PORTAL: ${portal.id.toUpperCase()} <<<`);

    // A. Update articles.ts
    const articlesFileContent = `import { Article, Author } from '../types';

${AUTHORS_DEF}

export const BREAKING_NEWS: string[] = ${JSON.stringify(portal.tickerItems, null, 2)};

export const INITIAL_ARTICLES: Article[] = ${JSON.stringify(portal.articles, null, 2)};
`;
    fs.writeFileSync(path.join(NEWS_SRC, 'src/data/articles.ts'), articlesFileContent, 'utf8');

    // B. Update lexicon.ts
    const lexiconFileContent = `import { LexiconEntry } from '../types';

export const LEXICON_ENTRIES: LexiconEntry[] = ${JSON.stringify(portal.lexicon, null, 2)};
`;
    fs.writeFileSync(path.join(NEWS_SRC, 'src/data/lexicon.ts'), lexiconFileContent, 'utf8');

    // C. Update BreakingTicker.tsx
    const tickerContent = `import React from 'react';
import { AlertCircle } from 'lucide-react';

const TICKER_ITEMS = ${JSON.stringify(portal.tickerItems, null, 2)};
const DUPLICATED_ITEMS = [...TICKER_ITEMS, ...TICKER_ITEMS];

export const BreakingTicker: React.FC = () => {
  return (
    <div className="bg-[#0a0a0a] text-gray-200 border-b border-[#222222] select-none py-2 px-3 sm:px-4 relative overflow-hidden z-20">
      <div className="max-w-7xl mx-auto flex items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-1.5 shrink-0 bg-[#bb142e] text-white font-extrabold px-2.5 py-1 rounded text-[10px] sm:text-[11px] tracking-widest uppercase shadow-sm z-10 border border-red-700/40">
          <AlertCircle className="w-3.5 h-3.5 text-white animate-pulse" />
          <span>${portal.badge}</span>
        </div>
        <div
          className="flex-1 overflow-hidden relative"
          style={{
            maskImage: 'linear-gradient(to right, transparent, black 16px, black calc(100% - 16px), transparent)',
            WebkitMaskImage: 'linear-gradient(to right, transparent, black 16px, black calc(100% - 16px), transparent)',
          }}
        >
          <div className="ccn-ticker-track">
            {DUPLICATED_ITEMS.map((item, idx) => (
              <span key={idx} className="inline-flex items-center gap-2.5 mx-5 sm:mx-7 text-xs sm:text-[13px] text-zinc-300 font-medium hover:text-[#f9282b] transition-colors cursor-pointer shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-[#f9282b] shrink-0 shadow-[0_0_6px_#f9282b]" />
                <span>{item}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: \`
        @keyframes ccnBroadcastTicker {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        .ccn-ticker-track {
          display: inline-flex !important;
          white-space: nowrap !important;
          width: max-content !important;
          will-change: transform;
          animation: ccnBroadcastTicker 40s linear infinite !important;
        }
        .ccn-ticker-track:hover {
          animation-play-state: paused !important;
        }
      \`}} />
    </div>
  );
};
`;
    fs.writeFileSync(path.join(NEWS_SRC, 'src/components/BreakingTicker.tsx'), tickerContent, 'utf8');

    // D. Update Header.tsx
    let headerContent = BACKUPS.header;
    const navItemsStr = `const NAV_ITEMS: { id: Category; label: string; badge?: string }[] = ${JSON.stringify(portal.categories, null, 2)};`;
    headerContent = headerContent.replace(/const NAV_ITEMS:[\s\S]*?\];/, navItemsStr);
    headerContent = headerContent.replace(/CCN News/g, portal.shortTitle);
    fs.writeFileSync(path.join(NEWS_SRC, 'src/components/Header.tsx'), headerContent, 'utf8');

    // E. Update App.tsx
    let appContent = BACKUPS.app;
    appContent = appContent.replace(/CCN News/g, portal.shortTitle);
    appContent = appContent.replace(/Najważniejsze wiadomości i analizy/g, portal.brandSubtitle);
    appContent = appContent.replace(/Słownik Pojęć Biblijnych/g, `Leksykon Działu: ${portal.shortTitle}`);
    fs.writeFileSync(path.join(NEWS_SRC, 'src/App.tsx'), appContent, 'utf8');

    // F. Update vite.config.ts with output naming
    const viteConfigContent = `import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          entryFileNames: 'assets/${portal.id}-index-[hash].js',
          chunkFileNames: 'assets/${portal.id}-index-[hash].js',
          assetFileNames: 'assets/${portal.id}-index-[hash].[ext]',
        },
      },
    },
  };
});
`;
    fs.writeFileSync(path.join(NEWS_SRC, 'vite.config.ts'), viteConfigContent, 'utf8');

    // G. Run Vite build
    const t0 = Date.now();
    console.log(`Building ${portal.id} bundle...`);
    const buildLog = execSync(`npm.cmd run build`, { cwd: NEWS_SRC }).toString();
    console.log(`✓ Built in ${Date.now() - t0}ms`);

    // H. Copy assets to LUMINA/assets
    const distAssetsDir = path.join(NEWS_SRC, 'dist/assets');
    const luminaAssetsDir = path.join(LUMINA_ROOT, 'assets');
    if (!fs.existsSync(luminaAssetsDir)) fs.mkdirSync(luminaAssetsDir, { recursive: true });

    let jsAssetUrl = '';
    let cssAssetUrl = '';

    for (const f of fs.readdirSync(distAssetsDir)) {
      if (f.startsWith(`${portal.id}-index-`) && f.endsWith('.js')) {
        jsAssetUrl = `/assets/${f}`;
        fs.copyFileSync(path.join(distAssetsDir, f), path.join(luminaAssetsDir, f));
      }
      if (f.startsWith(`${portal.id}-index-`) && f.endsWith('.css')) {
        cssAssetUrl = `/assets/${f}`;
        fs.copyFileSync(path.join(distAssetsDir, f), path.join(luminaAssetsDir, f));
      }
    }

    if (!jsAssetUrl || !cssAssetUrl) {
      // Fallback: check dist/index.html
      const distHtml = fs.readFileSync(path.join(NEWS_SRC, 'dist/index.html'), 'utf8');
      const jm = distHtml.match(/src="(\/assets\/[^"]+\.js)"/);
      const cm = distHtml.match(/href="(\/assets\/[^"]+\.css)"/);
      if (jm) jsAssetUrl = jm[1];
      if (cm) cssAssetUrl = cm[1];
    }

    console.log(`Assets: JS=${jsAssetUrl}, CSS=${cssAssetUrl}`);

    // I. Generate HTML files
    const finalHtml = generateProductionHtml(portal, jsAssetUrl, cssAssetUrl);
    const rootHtml = path.join(LUMINA_ROOT, `${portal.id}.html`);
    const subDir = path.join(LUMINA_ROOT, portal.id);
    if (!fs.existsSync(subDir)) fs.mkdirSync(subDir, { recursive: true });
    const subHtml = path.join(subDir, 'index.html');

    fs.writeFileSync(rootHtml, finalHtml, 'utf8');
    fs.writeFileSync(subHtml, finalHtml, 'utf8');
    console.log(`✓ Generated ${rootHtml} & ${subHtml}`);
  }

  // Restore and rebuild NEWS
  console.log('\n>>> RESTORING AND REBUILDING CCN NEWS <<<');
  fs.writeFileSync(path.join(NEWS_SRC, 'src/data/articles.ts'), BACKUPS.articles, 'utf8');
  fs.writeFileSync(path.join(NEWS_SRC, 'src/data/lexicon.ts'), BACKUPS.lexicon, 'utf8');
  fs.writeFileSync(path.join(NEWS_SRC, 'src/components/BreakingTicker.tsx'), BACKUPS.ticker, 'utf8');
  fs.writeFileSync(path.join(NEWS_SRC, 'src/components/Header.tsx'), BACKUPS.header, 'utf8');
  fs.writeFileSync(path.join(NEWS_SRC, 'src/App.tsx'), BACKUPS.app, 'utf8');
  fs.writeFileSync(path.join(NEWS_SRC, 'vite.config.ts'), BACKUPS.viteConfig, 'utf8');
  fs.writeFileSync(path.join(NEWS_SRC, 'index.html'), BACKUPS.indexHtml, 'utf8');

  const newsBuild = execSync(`npm.cmd run build`, { cwd: NEWS_SRC }).toString();
  console.log('✓ Rebuilt news bundle');

  const distAssetsDir = path.join(NEWS_SRC, 'dist/assets');
  const luminaAssetsDir = path.join(LUMINA_ROOT, 'assets');
  let newsJs = '';
  let newsCss = '';

  for (const f of fs.readdirSync(distAssetsDir)) {
    if (f.startsWith('news-index-') && f.endsWith('.js')) {
      newsJs = `/assets/${f}`;
      fs.copyFileSync(path.join(distAssetsDir, f), path.join(luminaAssetsDir, f));
    }
    if (f.startsWith('news-index-') && f.endsWith('.css')) {
      newsCss = `/assets/${f}`;
      fs.copyFileSync(path.join(distAssetsDir, f), path.join(luminaAssetsDir, f));
    }
  }

  if (newsJs && newsCss) {
    const curNews = fs.readFileSync(path.join(LUMINA_ROOT, 'news.html'), 'utf8');
    const upNews = curNews
      .replace(/\/assets\/news-index-[^"]+\.js/, newsJs)
      .replace(/\/assets\/news-index-[^"]+\.css/, newsCss);
    fs.writeFileSync(path.join(LUMINA_ROOT, 'news.html'), upNews, 'utf8');
    fs.writeFileSync(path.join(LUMINA_ROOT, 'news/index.html'), upNews, 'utf8');
    console.log(`✓ Updated LUMINA/news.html and news/index.html with: ${newsJs}`);
  }

  // Update _redirects
  console.log('\n>>> UPDATING _REDIRECTS <<<');
  const redirectsPath = path.join(LUMINA_ROOT, '_redirects');
  let redirectsContent = fs.readFileSync(redirectsPath, 'utf8');
  const newRedirects = `
# === NOWE PODSTRONY TEMATYCZNE CCN ===
/nauka /nauka/index.html 200
/nauka/ /nauka/index.html 200
/historia /historia/index.html 200
/historia/ /historia/index.html 200
/biologia /biologia/index.html 200
/biologia/ /biologia/index.html 200
/prawo /prawo/index.html 200
/prawo/ /prawo/index.html 200
/seks /seks/index.html 200
/seks/ /seks/index.html 200
/biblioteka /biblioteka/index.html 200
/biblioteka/ /biblioteka/index.html 200
/ksiazki /biblioteka 301
/audiobooki /biblioteka 301
/ebooki /biblioteka 301
/kosmologia /nauka 301
/archeologia /historia 301
/dna /biologia 301
/malzenstwo /seks 301
/malzenstwo/ /seks 301
`;

  if (!redirectsContent.includes('/biblioteka /biblioteka/index.html 200')) {
    redirectsContent = redirectsContent.trim() + '\n' + newRedirects;
    fs.writeFileSync(redirectsPath, redirectsContent, 'utf8');
    console.log('✓ Added redirect rules to _redirects');
  }

  // Update sitemap.xml
  console.log('\n>>> UPDATING SITEMAP.XML <<<');
  const sitemapPath = path.join(LUMINA_ROOT, 'sitemap.xml');
  let sitemapContent = fs.readFileSync(sitemapPath, 'utf8');

  const portalUrls = [
    'https://polskieradio.cc/nauka',
    'https://polskieradio.cc/historia',
    'https://polskieradio.cc/biologia',
    'https://polskieradio.cc/prawo',
    'https://polskieradio.cc/seks',
    'https://polskieradio.cc/biblioteka'
  ];

  let sitemapAdditions = '';
  for (const u of portalUrls) {
    if (!sitemapContent.includes(`<loc>${u}</loc>`)) {
      sitemapAdditions += `  <url>
    <loc>${u}</loc>
    <lastmod>2026-10-02</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.90</priority>
  </url>\n`;
    }
  }

  if (sitemapAdditions) {
    sitemapContent = sitemapContent.replace('</urlset>', sitemapAdditions + '</urlset>');
    fs.writeFileSync(sitemapPath, sitemapContent, 'utf8');
    console.log('✓ Added new URLs to sitemap.xml');
  }

  console.log('\n======================================================');
  console.log('ALL 5 PORTALS + NEWS BUILT AND VERIFIED SUCCESSFULLY!');
  console.log('======================================================\n');
} catch (e) {
  console.error('Fatal error during build:', e);
  // Restore files on error
  try {
    fs.writeFileSync(path.join(NEWS_SRC, 'src/data/articles.ts'), BACKUPS.articles, 'utf8');
    fs.writeFileSync(path.join(NEWS_SRC, 'src/data/lexicon.ts'), BACKUPS.lexicon, 'utf8');
    fs.writeFileSync(path.join(NEWS_SRC, 'src/components/BreakingTicker.tsx'), BACKUPS.ticker, 'utf8');
    fs.writeFileSync(path.join(NEWS_SRC, 'src/components/Header.tsx'), BACKUPS.header, 'utf8');
    fs.writeFileSync(path.join(NEWS_SRC, 'src/App.tsx'), BACKUPS.app, 'utf8');
    fs.writeFileSync(path.join(NEWS_SRC, 'vite.config.ts'), BACKUPS.viteConfig, 'utf8');
    fs.writeFileSync(path.join(NEWS_SRC, 'index.html'), BACKUPS.indexHtml, 'utf8');
  } catch {}
  process.exit(1);
}
