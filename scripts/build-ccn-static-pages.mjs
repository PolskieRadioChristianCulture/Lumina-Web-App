#!/usr/bin/env node
/**
 * CCN STATIC SITE GENERATOR (SSG) FOR ARTICLES
 * Generates standalone, semantic, ultra-fast, SEO/AEO-optimized HTML pages
 * for all CCN News articles with NewsArticle Schema.org, OpenGraph,
 * mobile 44px touch ergonomics and sitemap synchronization.
 *
 * Standard: JOMA-D005 / @SMCC / Zero-QA Dowódcy
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import esbuild from 'esbuild';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const ARTICLES_TS_PATH = path.join(ROOT, 'portals/ccn-news/src/data/articles.ts');
const FINANSE_ARTICLES_TS_PATH = path.join(ROOT, 'portals/ccn-finanse/src/data/articles.ts');
const SITEMAP_PATH = path.join(ROOT, 'sitemap.xml');

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttribute(str) {
  return escapeHtml(str);
}

function formatDurationClock(sec) {
  if (!Number.isFinite(sec) || sec <= 0) return '--:--';
  const total = Math.floor(sec);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function formatIsoDuration(sec) {
  if (!Number.isFinite(sec) || sec <= 0) return undefined;
  const total = Math.round(sec);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `PT${m}M${s}S`;
}

// 1. Load articles using esbuild in-memory bundle
export function loadArticles(entryPath = ARTICLES_TS_PATH) {
  const result = esbuild.buildSync({
    entryPoints: [entryPath],
    bundle: true,
    format: 'cjs',
    write: false,
    platform: 'node',
    target: 'node18'
  });

  const bundledCode = result.outputFiles[0].text;
  const mod = { exports: {} };
  const fn = new Function('module', 'exports', 'require', bundledCode);
  fn(mod, mod.exports, (id) => {
    // If any internal node module is required
    return require(id);
  });

  return {
    articles: mod.exports.INITIAL_ARTICLES || [],
    authors: mod.exports.AUTHORS || {}
  };
}

export function generateStaticFeedSnippet(articles, limit = 15, portalOpts = {}) {
  const baseSlug = portalOpts.baseSlug || 'news';
  const portalName = portalOpts.portalName || 'CCN News';
  const headingTitle = portalOpts.headingTitle || `Wydanie Bieżące ${portalName}`;
  const items = (articles || []).slice(0, limit);
  const articlesHtml = items.map(a => {
    const title = escapeHtml(a.title);
    const excerpt = escapeHtml(a.excerpt);
    const author = escapeHtml(a.author?.name || 'Redakcja Christian Culture');
    const date = a.dateFormatted || (a.publishedAt ? a.publishedAt.slice(0, 10) : '2026-10-15');
    const isoDate = a.publishedAt || '2026-10-15';
    const targetUrl = portalOpts.useDynamicSlug && a.slug ? `/${baseSlug}/${a.slug}` : (a.slug ? `/${baseSlug}/${a.slug}` : `/news/${a.id}`);
    return `        <article class="news-static-item" style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:20px;">
          <h2 style="font-size:1.15rem;line-height:1.4;margin:0 0 8px 0;"><a href="${targetUrl}" style="color:#0f172a;text-decoration:none;font-weight:700;">${title}</a></h2>
          <p style="font-size:0.92rem;color:#475569;line-height:1.55;margin:0 0 12px 0;">${excerpt}</p>
          <div style="font-size:0.8rem;color:#64748b;">
            <span>Autor: <strong>${author}</strong></span> &bull; 
            <time datetime="${isoDate}">${date}</time>
          </div>
        </article>`;
  }).join('\n');

  return `      <main class="news-startup-articles" aria-label="Najnowsze publikacje ${portalName}" style="max-width:1248px;margin:24px auto;padding:0 16px;">
        <h2 style="font-size:1.35rem;font-weight:800;margin-bottom:16px;color:#0f172a;border-bottom:2px solid #bb142e;padding-bottom:8px;">${headingTitle}</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:16px;">
${articlesHtml}
        </div>
      </main>`;
}

// 2. Generate Single Article HTML
function generateArticleHtml(article, allArticles, portalOpts = {}) {
  const baseSlug = portalOpts.baseSlug || 'news';
  const portalName = portalOpts.portalName || 'CCN News';
  const portalUrl = portalOpts.portalUrl || `https://polskieradio.cc/${baseSlug}`;
  const canonicalUrl = `https://polskieradio.cc/${baseSlug}/${article.slug}`;
  const shareText = encodeURIComponent(`${article.title} — ${portalName} | Christian Culture`);
  const shareUrl = encodeURIComponent(canonicalUrl);
  const cleanImageUrl = article.imageUrl.startsWith('http')
    ? article.imageUrl
    : `https://polskieradio.cc${article.imageUrl.startsWith('/') ? '' : '/'}${article.imageUrl}`;
  const shareImageUrl = encodeURIComponent(cleanImageUrl);

  const hasPublishedAudio = Boolean(
    article.audio &&
    article.audio.publicationStatus === 'published' &&
    typeof article.audio.src === 'string' &&
    article.audio.src.trim().length > 0
  );

  // Related articles (pick 3 other articles)
  const related = allArticles
    .filter(a => a.id !== article.id && a.slug !== article.slug)
    .slice(0, 3);

  const authorProfileUrl = (article.author && String(article.author.name).includes('Wioletta'))
    ? 'https://polskieradio.cc/lumina.wiolettarogowska.html'
    : 'https://polskieradio.cc/lumina.cezaryrgowski.html';

  const newsArticleNode = {
    "@type": "NewsArticle",
    "@id": `${canonicalUrl}#article`,
    "isPartOf": {
      "@type": "WebSite",
      "@id": "https://polskieradio.cc/#website",
      "name": "Christian Culture",
      "url": "https://polskieradio.cc/"
    },
    "headline": article.title,
    "description": article.excerpt,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": canonicalUrl
    },
    "datePublished": article.publishedAt,
    "dateModified": article.updatedAt || article.publishedAt,
    "inLanguage": "pl-PL",
    "isAccessibleForFree": true,
    "image": [
      cleanImageUrl
    ],
    "author": {
      "@type": "Person",
      "name": article.author.name,
      "jobTitle": article.author.role,
      "image": article.author.avatarUrl?.startsWith('http') ? article.author.avatarUrl : `https://polskieradio.cc${article.author.avatarUrl?.startsWith('/') ? '' : '/'}${article.author.avatarUrl || ''}`,
      "url": authorProfileUrl
    },
    "publisher": {
      "@type": "NewsMediaOrganization",
      "@id": "https://polskieradio.cc/#organization",
      "name": "CCN – Christian Culture News Network",
      "url": "https://polskieradio.cc/news",
      "publishingPrinciples": "https://polskieradio.cc/polityka-redakcyjna",
      "correctionsPolicy": "https://polskieradio.cc/polityka-redakcyjna#korekty",
      "logo": {
        "@type": "ImageObject",
        "url": "https://polskieradio.cc/ccn-logo-square.png"
      }
    },
    "speakable": {
      "@type": "SpeakableSpecification",
      "cssSelector": ["#article-headline", "#article-lead"]
    }
  };

  if (hasPublishedAudio) {
    newsArticleNode.audio = { "@id": `${canonicalUrl}#audio` };
  }

  const graphNodes = [
    newsArticleNode,
    {
      "@type": "BreadcrumbList",
      "@id": `${canonicalUrl}#breadcrumb`,
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Strona Główna",
          "item": "https://polskieradio.cc/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": portalName,
          "item": portalUrl
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": article.categoryLabel || "Wiadomości",
          "item": `${portalUrl}?cat=${encodeURIComponent(article.category || 'home')}`
        },
        {
          "@type": "ListItem",
          "position": 4,
          "name": article.title,
          "item": canonicalUrl
        }
      ]
    }
  ];

  if (hasPublishedAudio) {
    const audioContentUrl = article.audio.src.startsWith('http')
      ? article.audio.src
      : `https://polskieradio.cc${article.audio.src}`;
    graphNodes.push({
      "@type": "AudioObject",
      "@id": `${canonicalUrl}#audio`,
      "name": article.audio.title,
      "description": article.excerpt,
      "contentUrl": audioContentUrl,
      "encodingFormat": "audio/mp4",
      ...(formatIsoDuration(article.audio.durationSeconds)
        ? { "duration": formatIsoDuration(article.audio.durationSeconds) }
        : {}),
      "inLanguage": "pl-PL",
      "uploadDate": article.publishedAt
    });
  }

  // Schema.org JSON-LD (CCN Global SEO & AI Search 2026 v1.0)
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": graphNodes
  };

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
    
    <title>${escapeHtml(article.title)} – CCN News | Christian Culture</title>
    <meta name="description" content="${escapeAttribute(article.excerpt)}" />
    <meta name="author" content="${escapeAttribute(article.author.name)}" />
    <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
    <link rel="canonical" href="${canonicalUrl}" />
    <link rel="alternate" type="application/rss+xml" title="CCN News — Christian Culture RSS" href="https://polskieradio.cc/news/feed.xml" />
    <link rel="alternate" type="application/rss+xml" title="Christian Culture — Kanał Główny RSS" href="https://polskieradio.cc/feed.xml" />
    <link rel="icon" type="image/png" href="/ccn-logo-square.png" />

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="CCN News — Christian Culture" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:title" content="${escapeAttribute(article.title)} – CCN News" />
    <meta property="og:description" content="${escapeAttribute(article.excerpt)}" />
    <meta property="og:image" content="${cleanImageUrl}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="675" />
    <meta property="article:published_time" content="${article.publishedAt}" />
    <meta property="article:author" content="${escapeAttribute(article.author.name)}" />
    <meta property="og:locale" content="pl_PL" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${canonicalUrl}" />
    <meta name="twitter:title" content="${escapeAttribute(article.title)} – CCN News" />
    <meta name="twitter:description" content="${escapeAttribute(article.excerpt)}" />
    <meta name="twitter:image" content="${cleanImageUrl}" />

    <!-- Schema.org JSON-LD -->
    <script type="application/ld+json">
${JSON.stringify(jsonLd, null, 2)}
    </script>

    <!-- Google Fonts & Icons -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

    <style>
      :root {
        --ccn-primary: #bb142e;
        --ccn-primary-hover: #9a1024;
        --ccn-gold: #c4a35a;
        --ccn-gold-light: #e5cb87;
        --ccn-dark: #0a0e17;
        --ccn-card-bg: #ffffff;
        --ccn-text: #18181b;
        --ccn-text-muted: #71717a;
        --ccn-border: #e4e4e7;
      }
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        font-family: 'Inter', system-ui, -apple-system, sans-serif;
        background-color: #f9fafb;
        color: var(--ccn-text);
        line-height: 1.7;
        -webkit-font-smoothing: antialiased;
      }
      header.ccn-site-nav {
        background: #010101;
        padding: 0.6rem 1rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 2px solid var(--ccn-gold);
      }
      .ccn-nav-links {
        display: flex;
        gap: 1.25rem;
        overflow-x: auto;
        white-space: nowrap;
        padding: 0.25rem 0;
      }
      .ccn-nav-links a {
        color: #d4d4d8;
        text-decoration: none;
        font-size: 0.78rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        transition: color 0.2s ease;
      }
      .ccn-nav-links a:hover { color: var(--ccn-gold); }
      .ccn-brand-bar {
        background: #ffffff;
        padding: 0.75rem 1.5rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid var(--ccn-border);
      }
      .ccn-brand-logo {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        text-decoration: none;
      }
      .ccn-brand-logo img { height: 42px; width: auto; }
      .ccn-back-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        background: #f4f4f5;
        color: #27272a;
        border-radius: 8px;
        text-decoration: none;
        font-size: 0.85rem;
        font-weight: 700;
        min-height: 44px;
        border: 1px solid var(--ccn-border);
        transition: all 0.2s ease;
      }
      .ccn-back-btn:hover { background: #e4e4e7; color: var(--ccn-primary); }

      /* Main Article Layout */
      main.ccn-article-wrapper {
        max-width: 860px;
        margin: 2rem auto;
        padding: 0 1.25rem;
      }
      .ccn-breadcrumbs {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.78rem;
        color: var(--ccn-text-muted);
        margin-bottom: 1.25rem;
      }
      .ccn-breadcrumbs a {
        color: var(--ccn-text-muted);
        text-decoration: none;
      }
      .ccn-breadcrumbs a:hover { color: var(--ccn-primary); }
      .ccn-article-card {
        background: #ffffff;
        border-radius: 16px;
        border: 1px solid var(--ccn-border);
        box-shadow: 0 4px 25px rgba(0,0,0,0.04);
        padding: 2rem;
        overflow: hidden;
      }
      @media (max-width: 640px) {
        .ccn-article-card { padding: 1.25rem; }
      }
      .ccn-category-pill {
        display: inline-block;
        background: rgba(187, 20, 46, 0.08);
        color: var(--ccn-primary);
        font-size: 0.75rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        padding: 0.35rem 0.75rem;
        border-radius: 6px;
        margin-bottom: 1rem;
      }
      h1#article-headline {
        font-family: 'Cinzel', serif, system-ui;
        font-size: clamp(1.8rem, 4vw, 2.5rem);
        font-weight: 800;
        line-height: 1.25;
        color: #09090b;
        margin-bottom: 1rem;
        letter-spacing: -0.01em;
      }
      p#article-lead {
        font-size: 1.15rem;
        line-height: 1.6;
        color: #3f3f46;
        margin-bottom: 1.5rem;
        font-weight: 500;
      }
      .ccn-meta-bar {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        padding: 1rem 0;
        border-top: 1px solid var(--ccn-border);
        border-bottom: 1px solid var(--ccn-border);
        margin-bottom: 1.5rem;
      }
      .ccn-author-block {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }
      .ccn-author-avatar {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        object-fit: cover;
        border: 2px solid var(--ccn-gold);
      }
      .ccn-author-info {
        display: flex;
        flex-direction: column;
      }
      .ccn-author-name {
        font-weight: 700;
        font-size: 0.95rem;
        color: #18181b;
      }
      .ccn-author-role {
        font-size: 0.75rem;
        color: var(--ccn-text-muted);
      }
      .ccn-pub-date {
        font-size: 0.8rem;
        color: var(--ccn-text-muted);
        display: flex;
        align-items: center;
        gap: 0.4rem;
      }

      /* Hero Media */
      figure.ccn-media-box {
        margin: 1.5rem 0 2rem;
        border-radius: 12px;
        overflow: hidden;
        background: #000;
        border: 1px solid #18181b;
      }
      figure.ccn-media-box img {
        width: 100%;
        height: auto;
        max-height: 520px;
        object-fit: cover;
        display: block;
      }
      figcaption {
        background: #09090b;
        color: #a1a1aa;
        font-size: 0.78rem;
        padding: 0.6rem 1rem;
        text-align: center;
        border-top: 1px solid #27272a;
      }

      /* Social Sharing Bar (44px target) */
      .ccn-share-bar {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.6rem;
        margin-bottom: 2rem;
        padding: 0.75rem 1rem;
        background: #f4f4f5;
        border-radius: 10px;
      }
      .ccn-share-title {
        font-size: 0.8rem;
        font-weight: 700;
        color: #52525b;
        margin-right: 0.4rem;
      }
      .ccn-share-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        min-height: 44px;
        min-width: 44px;
        padding: 0 0.85rem;
        border-radius: 8px;
        font-size: 0.78rem;
        font-weight: 700;
        text-decoration: none;
        cursor: pointer;
        border: none;
        transition: all 0.2s ease;
      }
      .ccn-btn-lumina {
        background: linear-gradient(135deg, #bb142e 0%, #800d1e 100%);
        color: #ffffff;
        border: 1px solid rgba(196, 163, 90, 0.4);
      }
      .ccn-btn-x { background: #000000; color: #ffffff; }
      .ccn-btn-wa { background: #25D366; color: #ffffff; }
      .ccn-btn-copy { background: #ffffff; color: #18181b; border: 1px solid var(--ccn-border); }

      /* Article Content Typography */
      .ccn-content {
        font-size: 1.05rem;
        line-height: 1.85;
        color: #27272a;
      }
      .ccn-content p {
        margin-bottom: 1.4rem;
      }
      .ccn-content h2, .ccn-content h3 {
        font-family: 'Cinzel', serif, system-ui;
        font-size: 1.45rem;
        color: #09090b;
        margin: 2rem 0 1rem;
        font-weight: 700;
        border-left: 3px solid var(--ccn-gold);
        padding-left: 0.75rem;
      }

      /* Scripture Box */
      .ccn-scripture-card {
        margin: 2rem 0;
        padding: 1.5rem;
        background: #fdfbf7;
        border-left: 4px solid var(--ccn-gold);
        border-radius: 0 12px 12px 0;
        box-shadow: 0 2px 12px rgba(196, 163, 90, 0.08);
      }
      .ccn-scripture-ref {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-weight: 800;
        font-size: 0.85rem;
        color: #854d0e;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: 0.6rem;
      }
      .ccn-scripture-text {
        font-family: 'Playfair Display', serif;
        font-style: italic;
        font-size: 1.15rem;
        line-height: 1.6;
        color: #451a03;
        margin-bottom: 0.6rem;
      }
      .ccn-strong-tag {
        font-family: monospace;
        font-size: 0.75rem;
        background: rgba(196, 163, 90, 0.2);
        color: #713f12;
        padding: 2px 6px;
        border-radius: 4px;
        display: inline-block;
      }

      /* Source Box */
      .ccn-source-box {
        margin: 2rem 0;
        padding: 1.25rem;
        background: #f8fafc;
        border: 1px solid #cbd5e1;
        border-radius: 10px;
        font-size: 0.85rem;
        color: #334155;
      }
      .ccn-source-box strong { color: #0f172a; }
      .ccn-source-box a { color: var(--ccn-primary); text-decoration: underline; }

      /* Author Box */
      .ccn-author-full-card {
        margin-top: 3rem;
        padding: 1.75rem;
        background: #fafafa;
        border: 1px solid var(--ccn-border);
        border-radius: 14px;
        display: flex;
        gap: 1.25rem;
        align-items: center;
      }
      @media (max-width: 640px) {
        .ccn-author-full-card { flex-direction: column; text-align: center; }
      }
      .ccn-author-full-avatar {
        width: 72px;
        height: 72px;
        border-radius: 50%;
        object-fit: cover;
        border: 3px solid var(--ccn-gold);
        flex-shrink: 0;
      }

      /* Related Section */
      .ccn-related-section {
        margin-top: 3rem;
        padding-top: 2rem;
        border-top: 2px solid var(--ccn-border);
      }
      .ccn-related-title {
        font-family: 'Cinzel', serif;
        font-size: 1.3rem;
        font-weight: 700;
        margin-bottom: 1.5rem;
        color: #09090b;
      }
      .ccn-related-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 1.25rem;
      }
      .ccn-related-card {
        background: #ffffff;
        border: 1px solid var(--ccn-border);
        border-radius: 10px;
        overflow: hidden;
        text-decoration: none;
        color: inherit;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        display: flex;
        flex-direction: column;
      }
      .ccn-related-card:hover {
        transform: translateY(-3px);
        box-shadow: 0 6px 20px rgba(0,0,0,0.08);
      }
      .ccn-related-card img {
        width: 100%;
        height: 140px;
        object-fit: cover;
      }
      .ccn-related-card-content {
        padding: 1rem;
        flex: 1;
        display: flex;
        flex-direction: column;
      }
      .ccn-related-card-title {
        font-weight: 700;
        font-size: 0.92rem;
        line-height: 1.4;
        margin-bottom: 0.5rem;
        color: #18181b;
      }

      /* Back to top button */
      .back-to-top {
        position: fixed;
        right: 1.5rem;
        bottom: 2rem;
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background: rgba(15, 15, 15, 0.85);
        border: 1.5px solid #D4A94A;
        color: #D4A94A;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1rem;
        cursor: pointer;
        z-index: 998;
        opacity: 0;
        visibility: hidden;
        transform: translateY(15px);
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(0,0,0,0.5);
      }
      .back-to-top.visible { opacity: 1; visibility: visible; transform: translateY(0); }

      /* Primary Portal Cross-Link Banner */
      .ccn-primary-portal-banner {
        margin: 1.5rem 0 2rem;
        padding: 1.15rem 1.35rem;
        border-radius: 16px;
        background: linear-gradient(135deg, #0d111a 0%, #131926 100%);
        border: 1px solid rgba(215, 179, 106, 0.35);
        color: #f5f3ee;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.25);
      }
      .ccn-primary-portal-eyebrow {
        font-size: 0.72rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.14em;
        color: #ead39c;
        display: block;
        margin-bottom: 0.25rem;
      }
      .ccn-primary-portal-text {
        font-size: 0.9rem;
        color: #e4e4e7;
        margin: 0;
      }
      .ccn-primary-portal-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        min-height: 44px;
        padding: 0 1.1rem;
        border-radius: 12px;
        background: linear-gradient(180deg, #ead39c 0%, #c99d45 100%);
        color: #17120a;
        font-size: 0.82rem;
        font-weight: 800;
        text-decoration: none;
        white-space: nowrap;
      }

      /* CCN Audio Player Premium 2026 */
      .ccn-player[hidden] { display: none !important; }
      .ccn-player {
        position: relative;
        overflow: hidden;
        margin: 1.5rem 0 2rem;
        border-radius: 22px;
        border: 1px solid rgba(215, 179, 106, 0.22);
        background:
          radial-gradient(circle at 12% 0%, rgba(215, 179, 106, 0.16), transparent 36%),
          linear-gradient(180deg, rgba(19, 25, 38, 0.96), rgba(11, 15, 23, 0.98));
        box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
        padding: 20px;
        color: #f5f3ee;
      }
      .ccn-player::before {
        content: "";
        position: absolute;
        inset: 0 0 auto 0;
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(234, 211, 156, 0.68), transparent);
        pointer-events: none;
      }
      .ccn-player__top {
        display: grid;
        grid-template-columns: auto 1fr auto;
        gap: 16px;
        align-items: center;
      }
      .ccn-play-btn {
        width: 58px;
        height: 58px;
        min-width: 58px;
        min-height: 58px;
        border-radius: 999px;
        border: 1px solid rgba(234, 211, 156, 0.5);
        background:
          radial-gradient(circle at 30% 25%, #f4e4bc, #d7b36a 58%, #9f7932 100%);
        color: #17120a;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 12px 30px rgba(215, 179, 106, 0.28);
        transition: transform .16s ease, box-shadow .16s ease, filter .16s ease;
      }
      .ccn-play-btn:hover {
        transform: translateY(-1px);
        filter: brightness(1.04);
        box-shadow: 0 16px 34px rgba(215, 179, 106, 0.36);
      }
      .ccn-play-btn svg { width: 23px; height: 23px; fill: currentColor; }
      .ccn-play-btn svg[hidden],
      .ccn-player [hidden] { display: none !important; }
      .ccn-play-btn.is-playing svg[data-icon="play"] { display: none !important; }
      .ccn-play-btn.is-playing svg[data-icon="pause"] { display: block !important; }
      .ccn-play-btn:not(.is-playing) svg[data-icon="pause"] { display: none !important; }
      .ccn-play-btn:not(.is-playing) svg[data-icon="play"] { display: block !important; }
      .ccn-player__meta { min-width: 0; }
      .ccn-player__eyebrow {
        display: flex;
        flex-wrap: wrap;
        gap: 8px 12px;
        align-items: center;
        color: #ead39c;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: .16em;
        text-transform: uppercase;
        margin-bottom: 5px;
      }
      .ccn-dot {
        width: 7px;
        height: 7px;
        border-radius: 999px;
        background: #ead39c;
        box-shadow: 0 0 0 5px rgba(215, 179, 106, 0.14);
        display: inline-block;
      }
      .ccn-player__title {
        margin: 0;
        font-size: clamp(16px, 2vw, 19px);
        line-height: 1.3;
        font-weight: 760;
        color: #f5f3ee;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .ccn-player__sub {
        margin-top: 4px;
        color: #9ca6ba;
        font-size: 13px;
        display: flex;
        flex-wrap: wrap;
        gap: 8px 14px;
        align-items: center;
      }
      .ccn-badge {
        border: 1px solid rgba(255, 255, 255, 0.1);
        background: rgba(255, 255, 255, 0.04);
        color: #f5f3ee;
        padding: 7px 11px;
        border-radius: 999px;
        font-size: 12px;
        font-weight: 650;
        white-space: nowrap;
      }
      .ccn-wave-wrap {
        margin-top: 18px;
        padding: 14px 14px 10px;
        border-radius: 16px;
        background: rgba(6, 9, 15, 0.56);
        border: 1px solid rgba(255, 255, 255, 0.06);
        overflow: hidden;
      }
      .ccn-wave {
        position: relative;
        height: 54px;
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: clamp(1px, 0.4vw, 2.5px);
        cursor: pointer;
        user-select: none;
        touch-action: pan-y;
        overflow: hidden;
        padding: 4px 0;
      }
      .ccn-wave__bar, .ccn-bar {
        flex: 1 1 0;
        min-width: 0;
        max-width: 6px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.17);
        transition: background-color .12s ease, transform .16s ease, opacity .16s ease;
        min-height: 5px;
      }
      .ccn-wave__bar.is-played, .ccn-bar.is-played, .ccn-wave__bar.past, .ccn-bar.past {
        background: linear-gradient(180deg, #ead39c, #c99d45);
        box-shadow: 0 0 12px rgba(215, 179, 106, 0.25);
      }
      .ccn-wave__bar.is-active, .ccn-bar.is-active { transform: scaleY(1.06); }
      .ccn-playhead {
        position: absolute;
        top: 2px;
        bottom: 2px;
        width: 2px;
        left: 0%;
        background: #f8ce7f;
        border-radius: 999px;
        pointer-events: none;
        box-shadow: 0 0 10px #e0a74a, 0 0 20px rgba(224, 167, 74, 0.6);
        transition: left .08s linear;
        z-index: 2;
      }
      .ccn-range {
        -webkit-appearance: none;
        appearance: none;
        width: 100%;
        height: 4px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.14);
        outline: none;
        margin: 10px 0 4px;
        cursor: pointer;
      }
      .ccn-range::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: #f8ce7f;
        box-shadow: 0 0 8px #e0a74a;
        cursor: pointer;
        transition: transform .12s ease;
      }
      .ccn-range::-webkit-slider-thumb:hover {
        transform: scale(1.25);
      }
      .ccn-range::-moz-range-thumb {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: #f8ce7f;
        border: none;
        box-shadow: 0 0 8px #e0a74a;
        cursor: pointer;
      }
      .ccn-time-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: #9ca6ba;
        font-size: 12px;
        font-variant-numeric: tabular-nums;
        margin-top: 4px;
      }
      .ccn-controls {
        margin-top: 14px;
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        align-items: center;
        justify-content: space-between;
      }
      .ccn-controls__left,
      .ccn-controls__right {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        align-items: center;
      }
      .ccn-chip-btn {
        min-height: 44px;
        padding: 0 13px;
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.10);
        background: rgba(255, 255, 255, 0.04);
        color: #f5f3ee;
        font-size: 13px;
        font-weight: 650;
        display: inline-flex;
        align-items: center;
        gap: 7px;
        cursor: pointer;
        text-decoration: none;
        transition: background .15s ease, border-color .15s ease, transform .15s ease;
      }
      .ccn-chip-btn:hover {
        background: rgba(215, 179, 106, 0.12);
        border-color: rgba(215, 179, 106, 0.38);
        transform: translateY(-1px);
      }
      .ccn-chip-btn svg { width: 16px; height: 16px; fill: currentColor; }
      .ccn-volume {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 0 12px;
        min-height: 44px;
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.10);
        background: rgba(255, 255, 255, 0.04);
      }
      .ccn-volume input[type="range"] { width: 84px; accent-color: #d7b36a; cursor: pointer; }
      .ccn-status {
        margin-top: 12px;
        font-size: 12px;
        color: #9ca6ba;
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        gap: 8px;
        align-items: center;
      }
      .ccn-status strong { color: #ead39c; font-weight: 700; }
      .ccn-drive-fallback {
        margin-top: 14px;
        border-radius: 16px;
        overflow: hidden;
        border: 1px solid rgba(215, 179, 106, 0.24);
        background: #090d14;
        display: none;
      }
      .ccn-drive-fallback.is-visible,
      .ccn-drive-fallback.show { display: block; }
      .ccn-drive-fallback__head {
        padding: 10px 14px;
        font-size: 12px;
        color: #9ca6ba;
        border-bottom: 1px solid rgba(255, 255, 255, 0.07);
        display: flex;
        justify-content: space-between;
        gap: 10px;
        align-items: center;
      }
      .ccn-drive-fallback iframe {
        width: 100%;
        height: 88px;
        border: 0;
        display: block;
        background: #090d14;
      }
      @media (max-width: 640px) {
        .ccn-player {
          padding: 14px 12px 12px;
          border-radius: 16px;
          margin: 1.2rem 0 1.5rem;
        }
        .ccn-player__top {
          grid-template-columns: 48px 1fr;
          gap: 12px;
          align-items: center;
        }
        .ccn-play-btn {
          width: 48px;
          height: 48px;
          min-width: 48px;
          min-height: 48px;
        }
        .ccn-play-btn svg {
          width: 19px;
          height: 19px;
        }
        .ccn-badge {
          display: none !important;
        }
        .ccn-player__eyebrow {
          font-size: 10px;
          gap: 6px 8px;
          margin-bottom: 3px;
        }
        .ccn-player__title {
          font-size: 14px;
          line-height: 1.35;
          white-space: normal;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .ccn-player__sub {
          font-size: 11px;
          gap: 4px 8px;
          margin-top: 3px;
        }
        .ccn-wave-wrap {
          margin-top: 12px;
          padding: 10px 8px 6px;
          border-radius: 12px;
        }
        .ccn-wave {
          height: 44px;
        }
        .ccn-controls {
          flex-direction: column;
          align-items: stretch;
          gap: 8px;
          margin-top: 10px;
        }
        .ccn-controls__left {
          display: grid;
          grid-template-columns: 1fr 1fr 1.25fr;
          gap: 6px;
          width: 100%;
        }
        .ccn-controls__left .ccn-chip-btn {
          justify-content: center;
          min-height: 42px;
          font-size: 12px;
          padding: 0 4px;
        }
        .ccn-controls__right {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px;
          width: 100%;
        }
        .ccn-controls__right .ccn-chip-btn {
          justify-content: center;
          min-height: 42px;
          font-size: 11px;
          padding: 0 4px;
          text-align: center;
        }
        .ccn-volume {
          display: none !important;
        }
        .ccn-shortcuts-hint {
          display: none !important;
        }
        .ccn-status {
          justify-content: center;
          font-size: 11px;
          text-align: center;
          margin-top: 8px;
        }
      }
    </style>
  </head>
  <body>
    <!-- Top Ecosystem Navigation -->
    <header class="ccn-site-nav">
      <nav class="ccn-nav-links" aria-label="Nawigacja ekosystemu Christian Culture">
        <a href="/player">Radio CC</a>
        <a href="/lumina">LUMINA</a>
        <a href="/akademia">Akademia Biblijna</a>
        <a href="/vod">Kino VOD</a>
        <a href="/mojabiblia">MojaBiblia</a>
        <a href="/news" ${baseSlug === 'news' ? 'style="color:var(--ccn-gold);"' : ''}>CCN News</a>
        <a href="/finanse" ${baseSlug === 'finanse' ? 'style="color:var(--ccn-gold);"' : ''}>Finanse</a>
        <a href="/si">AI &amp; SI</a>
        <a href="/nauka">Nauka</a>
        <a href="/biznes">Biznes</a>
        <a href="/psychologia">Psychologia</a>
        <a href="/live">Live</a>
      </nav>
    </header>

    <!-- Brand Bar -->
    <div class="ccn-brand-bar">
      <a href="/${baseSlug}" class="ccn-brand-logo" title="${escapeAttribute(portalName)} – Strona Główna">
        <img src="/ccn-logo-horizontal.png" alt="${escapeAttribute(portalName)} Logo" width="160" height="42" onerror="this.src='/ccn-logo-square.png'">
      </a>
      <a href="/${baseSlug}" class="ccn-back-btn">
        <i class="fa-solid fa-arrow-left" aria-hidden="true"></i>
        <span>Wróć do ${escapeHtml(portalName)}</span>
      </a>
    </div>

    <!-- Main Content -->
    <main class="ccn-article-wrapper">
      <nav class="ccn-breadcrumbs" aria-label="Ścieżka powrotu">
        <a href="/">Start</a>
        <span>/</span>
        <a href="/${baseSlug}">${escapeHtml(portalName)}</a>
        <span>/</span>
        <span>${escapeHtml(article.categoryLabel || 'Wiadomości')}</span>
      </nav>

      <article class="ccn-article-card">
        <span class="ccn-category-pill">${escapeHtml(article.categoryLabel || 'Wiadomości')}</span>
        
        <h1 id="article-headline">${escapeHtml(article.title)}</h1>
        <p id="article-lead">${escapeHtml(article.excerpt)}</p>

        <!-- Meta Bar -->
        <div class="ccn-meta-bar">
          <div class="ccn-author-block">
            <img src="${escapeAttribute(article.author.avatarUrl)}" alt="${escapeAttribute(article.author.name)}" class="ccn-author-avatar" onerror="this.src='/avatar_cezary_official.jpg'">
            <div class="ccn-author-info">
              <span class="ccn-author-name">${escapeHtml(article.author.name)}</span>
              <span class="ccn-author-role">${escapeHtml(article.author.role)}</span>
            </div>
          </div>
          <div class="ccn-pub-date">
            <i class="fa-regular fa-calendar" aria-hidden="true"></i>
            <time datetime="${article.publishedAt}">${escapeHtml(article.dateFormatted)}</time>
            <span style="margin: 0 4px;">•</span>
            <i class="fa-regular fa-clock" aria-hidden="true"></i>
            <span>${article.readTimeMinutes} min czytania</span>
          </div>
        </div>

        <!-- Social Share Bar (44px target) -->
        <div class="ccn-share-bar">
          <span class="ccn-share-title"><i class="fa-solid fa-share-nodes"></i> Udostępnij:</span>
          <a href="https://x.com/intent/tweet?url=${shareUrl}&text=${shareText}" target="_blank" rel="noopener noreferrer" class="ccn-share-btn ccn-btn-x" title="Udostępnij na platformie X" aria-label="Udostępnij na X">
            <i class="fa-brands fa-x-twitter" aria-hidden="true"></i>
            <span>X (Twitter)</span>
          </a>
          <a href="https://polskieradio.cc/tablica?share_url=${shareUrl}&share_title=${shareText}&share_image=${shareImageUrl}" target="_blank" rel="noopener noreferrer" class="ccn-share-btn ccn-btn-lumina" title="Udostępnij na Tablicy Społeczności LUMINA" aria-label="Udostępnij na LUMINA">
            <i class="fa-solid fa-cross" aria-hidden="true"></i>
            <span>Tablica LUMINA</span>
          </a>
          <a href="https://api.whatsapp.com/send?text=${shareText}%20${shareUrl}" target="_blank" rel="noopener noreferrer" class="ccn-share-btn ccn-btn-wa" title="Udostępnij na WhatsApp" aria-label="Udostępnij na WhatsApp">
            <i class="fa-brands fa-whatsapp" aria-hidden="true"></i>
            <span>WhatsApp</span>
          </a>
          <button type="button" onclick="navigator.clipboard.writeText('${canonicalUrl}'); alert('Link do artykułu został skopiowany do schowka!');" class="ccn-share-btn ccn-btn-copy" title="Skopiuj link" aria-label="Kopiuj link">
            <i class="fa-regular fa-copy" aria-hidden="true"></i>
            <span>Kopiuj link</span>
          </button>
        </div>

        <!-- Hero Media -->
        <figure class="ccn-media-box">
          <img src="${escapeAttribute(article.imageUrl)}" alt="${escapeAttribute(article.title)}" loading="eager" onerror="this.src='/ccn-logo-square.png'">
          ${article.imageCaption ? `<figcaption>${escapeHtml(article.imageCaption)}</figcaption>` : ''}
        </figure>

        ${baseSlug === 'news' && article.primaryPortalUrl ? `
        <!-- Primary Portal Banner -->
        <div class="ccn-primary-portal-banner">
          <div>
            <span class="ccn-primary-portal-eyebrow">${escapeHtml(article.primaryPortalLabel || 'CCN Finanse — Główne wydanie pełne')}</span>
            <p class="ccn-primary-portal-text">Główne, pełne wydanie redakcyjne tej analizy zostało opublikowane w portalu tematycznym <strong>CCN Finanse</strong>.</p>
          </div>
          <a href="${escapeAttribute(article.primaryPortalUrl)}" class="ccn-primary-portal-btn">
            <span>Przejdź do CCN Finanse</span>
            <i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i>
          </a>
        </div>` : ''}

        ${hasPublishedAudio ? `
        <!-- CCN Audio Player Premium 2026 -->
        <section
          class="ccn-player"
          data-ccn-audio-player="true"
          data-audio-src="${escapeAttribute(article.audio.src || article.audio.audioUrl || '')}"
          data-audio-url="${escapeAttribute(article.audio.src || article.audio.audioUrl || '')}"
          data-audio-title="${escapeAttribute(article.audio.title)}"
          data-audio-reader="${escapeAttribute(article.audio.reader || 'AI Lektor')}"
          data-drive-id="${escapeAttribute(article.audio.driveId || '')}"
          data-duration-seconds="${escapeAttribute(String(article.audio.durationSeconds || 1071.368))}"
          data-publication-status="published"
          data-peaks="${escapeAttribute(JSON.stringify(article.audio.peaks || []))}"
          aria-label="Odtwarzacz nagrania artykułu"
        >
          <audio class="ccn-audio-el" preload="metadata" src="${escapeAttribute(article.audio.src || article.audio.audioUrl || '')}" crossorigin="anonymous"></audio>

          <div class="ccn-player__top">
            <button class="ccn-play-btn ccn-play" type="button" data-action="toggle" aria-label="Odtwórz nagranie">
              <svg viewBox="0 0 24 24" data-icon="play" aria-hidden="true">
                <path d="M8 5.5v13l10.5-6.5L8 5.5z"></path>
              </svg>
              <svg viewBox="0 0 24 24" data-icon="pause" aria-hidden="true" hidden>
                <path d="M6.5 5h4v14h-4V5zm7 0h4v14h-4V5z"></path>
              </svg>
            </button>

            <div class="ccn-player__meta">
              <div class="ccn-player__eyebrow">
                <span class="ccn-dot"></span>
                <span>CCN Audio Edition</span>
                <span>•</span>
                <span data-role="reader">${escapeHtml(article.audio.reader || 'AI Lektor')}</span>
              </div>
              <h2 class="ccn-player__title" data-role="title">${escapeHtml(article.audio.title)}</h2>
              <div class="ccn-player__sub">
                <span>Wersja do odsłuchu artykułu</span>
                <span>•</span>
                <span data-role="duration-label">Czas: ${formatDurationClock(article.audio.durationSeconds)}</span>
              </div>
            </div>

            <div class="ccn-badge">${escapeHtml(portalName)} • Audio</div>
          </div>

          <div class="ccn-wave-wrap">
            <div class="ccn-wave" data-role="waveform" aria-hidden="true"></div>
            <input
              class="ccn-range"
              type="range"
              min="0"
              max="1000"
              value="0"
              step="1"
              data-role="seek"
              aria-label="Przewijanie nagrania"
            />
            <div class="ccn-time-row">
              <span data-role="current-time">00:00</span>
              <span data-role="total-time">${formatDurationClock(article.audio.durationSeconds)}</span>
            </div>
          </div>

          <div class="ccn-controls">
            <div class="ccn-controls__left">
              <button class="ccn-chip-btn" type="button" data-action="back15" aria-label="Cofnij o 15 sekund">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6a6 6 0 0 1-6 6 6 6 0 0 1-5.65-4H4.26A8 8 0 0 0 12 21a8 8 0 0 0 0-16z"></path></svg>
                <span>-15s</span>
              </button>

              <button class="ccn-chip-btn" type="button" data-action="forward15" aria-label="Przewiń o 15 sekund">
                <span>+15s</span>
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6a6 6 0 0 0 6 6 6 6 0 0 0 5.65-4h2.09A8 8 0 0 1 12 21a8 8 0 0 1 0-16z"></path></svg>
              </button>

              <button class="ccn-chip-btn" type="button" data-action="speed" aria-label="Zmień prędkość odtwarzania">
                <span>Prędkość:</span>
                <strong data-role="speed">1×</strong>
              </button>
            </div>

            <div class="ccn-controls__right">
              <div class="ccn-volume">
                <button class="ccn-chip-btn" style="min-height:32px;padding:0 8px;border:0;background:transparent" type="button" data-action="mute" aria-label="Wycisz lub włącz dźwięk">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10v4h4l5 5V5L7 10H3zm13.5 2a4.5 4.5 0 0 0-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"></path></svg>
                </button>
                <input type="range" min="0" max="1" step="0.01" value="1" data-role="volume" aria-label="Głośność" />
              </div>

              ${article.audio.driveId ? `
              <button class="ccn-chip-btn" type="button" data-action="toggle-fallback">
                <span>Odtwarzacz zapasowy</span>
              </button>

              <a
                class="ccn-chip-btn"
                data-role="external-link"
                href="https://drive.google.com/file/d/${escapeAttribute(article.audio.driveId)}/view?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>Źródło nagrania</span>
              </a>` : ''}
            </div>
          </div>

          <div class="ccn-status">
            <span data-role="status">Gotowe do odtworzenia</span>
            <span class="ccn-shortcuts-hint">Skróty: <strong>Spacja</strong> odtwórz/pauza • <strong>←/→</strong> 15 s</span>
          </div>

          ${article.audio.driveId ? `
          <div class="ccn-drive-fallback" data-role="fallback">
            <div class="ccn-drive-fallback__head">
              <span>Zapasowy odtwarzacz Google Drive (gdy przeglądarka blokuje bezpośredni strumień audio)</span>
              <a href="https://drive.google.com/file/d/${escapeAttribute(article.audio.driveId)}/view?usp=sharing" target="_blank" rel="noopener noreferrer" style="color:#ead39c;text-decoration:none;font-weight:700;">Otwórz w nowej karcie</a>
            </div>
            <iframe
              title="Odtwarzacz zapasowy nagrania CCN"
              loading="lazy"
              allow="autoplay"
              data-role="drive-iframe"
            ></iframe>
          </div>` : ''}
        </section>` : ''}

        <!-- Article Content -->
        <div class="ccn-content">
          ${article.content.map(p => {
            const trimmed = String(p || '').trim();
            if (
              /^\d+\.\s+/.test(trimmed) ||
              trimmed === 'Podsumowanie' ||
              trimmed === 'Źródła i teksty biblijne' ||
              trimmed === 'Kluczowe informacje' ||
              trimmed === 'Kontekst i analiza' ||
              trimmed === 'Refleksja biblijna' ||
              trimmed === 'Źródła' ||
              trimmed.startsWith('KOMENTARZ REDAKCYJNY') ||
              trimmed.startsWith('PRZYSZŁOŚĆ WYMAGA') ||
              trimmed.startsWith('INTELIGENCJA A MĄDROŚĆ') ||
              trimmed.startsWith('SZTUCZNA INTELIGENCJA JAKO') ||
              trimmed.startsWith('KTO PONOSI') ||
              trimmed.startsWith('CZY MASZYNA MOŻE') ||
              trimmed.startsWith('PERSPEKTYWA BIBLIJNA') ||
              trimmed.startsWith('TECHNOLOGIA W SŁUŻBIE') ||
              trimmed.startsWith('PIĘĆ PYTAŃ')
            ) {
              return `<h2>${escapeHtml(trimmed)}</h2>`;
            }
            if (trimmed.includes('\n')) {
              return `<p style="white-space:pre-line;">${escapeHtml(trimmed)}</p>`;
            }
            return `<p>${escapeHtml(p)}</p>`;
          }).join('\n          ')}
        </div>

        <!-- Scripture Card -->
        ${article.scriptureReference ? `
        <div class="ccn-scripture-card">
          <div class="ccn-scripture-ref">
            <span><i class="fa-solid fa-book-bible"></i> ${escapeHtml(article.scriptureReference.verse)}</span>
            ${article.scriptureReference.strongCode ? `<span class="ccn-strong-tag">Strong: ${escapeHtml(article.scriptureReference.strongCode)}</span>` : ''}
          </div>
          <blockquote class="ccn-scripture-text">„${escapeHtml(article.scriptureReference.text)}”</blockquote>
          <p style="font-size:0.8rem; color:#78350f; margin-top:0.5rem;">
            Badaj to słowo w <a href="/mojabiblia" style="color:#b45309; font-weight:700; text-decoration:underline;">Interlinearnej MojejBiblii CC</a>
          </p>
        </div>` : ''}

        <!-- Source Citation -->
        ${article.sourceCitation ? `
        <div class="ccn-source-box">
          <p><strong>Źródło i weryfikacja faktograficzna:</strong> ${escapeHtml(article.sourceCitation.sourceName)}</p>
          ${article.sourceCitation.sourceUrl ? `<p style="margin-top:0.3rem;"><a href="${escapeAttribute(article.sourceCitation.sourceUrl)}" target="_blank" rel="noopener noreferrer"><i class="fa-solid fa-arrow-up-right-from-square"></i> Zobacz oficjalne źródło i dokumentację</a> (${escapeHtml(article.sourceCitation.quotationDate || '')})</p>` : ''}
        </div>` : ''}

        <!-- Full Author Card & Editorial Policy -->
        <div class="ccn-author-full-card">
          <img src="${escapeAttribute(article.author.avatarUrl)}" alt="${escapeAttribute(article.author.name)}" class="ccn-author-full-avatar" onerror="this.src='/avatar_cezary_official.jpg'">
          <div>
            <h3 style="font-size:1.1rem; font-weight:700; margin-bottom:0.25rem;"><a href="${authorProfileUrl}" style="color:inherit; text-decoration:none;">${escapeHtml(article.author.name)}</a></h3>
            <p style="font-size:0.8rem; color:var(--ccn-gold); font-weight:700; margin-bottom:0.5rem;">${escapeHtml(article.author.role)}</p>
            <p style="font-size:0.85rem; color:#52525b; line-height:1.5;">${escapeHtml(article.author.bio || 'Redakcja portalu CCN News i ekosystemu Christian Culture.')}</p>
            <p style="font-size:0.78rem; color:#71717a; margin-top:0.5rem;">
              <i class="fa-solid fa-shield-halved" aria-hidden="true"></i> Standard redakcyjny CCN: rozdział faktów, analizy i refleksji biblijnej • <a href="/polityka-redakcyjna" style="color:var(--ccn-primary); font-weight:600; text-decoration:underline;">Polityka redakcyjna i korekt</a>
            </p>
          </div>
        </div>

        <!-- Related Articles Grid -->
        ${related.length > 0 ? `
        <section class="ccn-related-section">
          <h2 class="ccn-related-title">Polecane Analizy i Artykuły</h2>
          <div class="ccn-related-grid">
            ${related.map(r => `
            <a href="/${baseSlug}/${escapeAttribute(r.slug)}" class="ccn-related-card">
              <img src="${escapeAttribute(r.imageUrl)}" alt="${escapeAttribute(r.title)}" loading="lazy" onerror="this.src='/ccn-logo-square.png'">
              <div class="ccn-related-card-content">
                <span style="font-size:0.7rem; color:var(--ccn-primary); font-weight:800; text-transform:uppercase; margin-bottom:0.3rem;">${escapeHtml(r.categoryLabel || 'News')}</span>
                <h4 class="ccn-related-card-title">${escapeHtml(r.title)}</h4>
                <span style="font-size:0.75rem; color:#a1a1aa; margin-top:auto;">${escapeHtml(r.dateFormatted)}</span>
              </div>
            </a>`).join('\n            ')}
          </div>
        </section>` : ''}

        <div style="margin-top: 2.5rem; text-align: center;">
          <a href="/${baseSlug}" class="ccn-back-btn" style="display:inline-flex;">
            <i class="fa-solid fa-arrow-left" aria-hidden="true"></i>
            <span>Wróć do wszystkich artykułów ${escapeHtml(portalName)}</span>
          </a>
        </div>
      </article>
    </main>

    ${hasPublishedAudio ? '<script src="/components/ccn-audio-player.js" defer></script>' : ''}
    <!-- Global Support Footer -->
    <script src="/components/cc-support-footer.js" defer></script>

    <!-- Floating Back to Top -->
    <button class="back-to-top" id="backToTopBtn" aria-label="Przewiń do góry" title="Przewiń do góry">
      <i class="fa-solid fa-arrow-up" aria-hidden="true"></i>
    </button>

    <script>
      (function() {
        var btn = document.getElementById('backToTopBtn');
        if (!btn) return;
        window.addEventListener('scroll', function() {
          if (window.scrollY > 300) btn.classList.add('visible');
          else btn.classList.remove('visible');
        }, { passive: true });
        btn.addEventListener('click', function(e) {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
      })();
    </script>
  </body>
</html>`;
}

// 3. Update Sitemap with All Article URLs
function updateSitemap(articles, portalSlug = 'news') {
  if (!fs.existsSync(SITEMAP_PATH)) return 0;
  let sitemapContent = fs.readFileSync(SITEMAP_PATH, 'utf8');

  let addedCount = 0;
  for (const a of articles) {
    const loc = `https://polskieradio.cc/${portalSlug}/${a.slug}`;
    if (!sitemapContent.includes(`<loc>${loc}</loc>`)) {
      const pubDate = a.publishedAt ? a.publishedAt.slice(0, 10) : '2026-10-15';
      const cleanImgUrl = a.imageUrl && a.imageUrl.startsWith('http') ? a.imageUrl : `https://polskieradio.cc${a.imageUrl && a.imageUrl.startsWith('/') ? '' : '/'}${a.imageUrl || ''}`;
      const entry = `  <url>
    <loc>${loc}</loc>
    <lastmod>${pubDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
    <image:image>
      <image:loc>${cleanImgUrl}</image:loc>
      <image:title>${escapeHtml(a.title)}</image:title>
    </image:image>
  </url>
`;
      sitemapContent = sitemapContent.replace('</urlset>', `${entry}</urlset>`);
      addedCount++;
    }
  }

  if (addedCount > 0) {
    fs.writeFileSync(SITEMAP_PATH, sitemapContent, 'utf8');
    console.log(`Sitemap (${portalSlug}): Added ${addedCount} new article URLs to sitemap.xml.`);
  } else {
    console.log(`Sitemap (${portalSlug}): All ${articles.length} article URLs already present in sitemap.xml.`);
  }
  return addedCount;
}

// 4. Main Build Execution
export async function buildCcnStaticPages() {
  console.log('--- START CCN STATIC PAGES (SSG) BUILD ---');
  const { articles } = loadArticles(ARTICLES_TS_PATH);
  console.log(`Loaded ${articles.length} articles from ccn-news/articles.ts`);

  let generatedPages = 0;
  for (const article of articles) {
    const html = generateArticleHtml(article, articles, {
      baseSlug: 'news',
      portalName: 'CCN News',
      portalUrl: 'https://polskieradio.cc/news'
    });

    // 1. Write news/${article.slug}.html
    const slugFile = path.join(ROOT, 'news', `${article.slug}.html`);
    fs.writeFileSync(slugFile, html, 'utf8');

    // 2. Write news/${article.slug}/index.html (Clean URL)
    const cleanDir = path.join(ROOT, 'news', article.slug);
    fs.mkdirSync(cleanDir, { recursive: true });
    fs.writeFileSync(path.join(cleanDir, 'index.html'), html, 'utf8');

    // 3. If ID differs from slug, alias news/${article.id}.html & news/${article.id}/index.html
    if (article.id && article.id !== article.slug) {
      const idFile = path.join(ROOT, 'news', `${article.id}.html`);
      fs.writeFileSync(idFile, html, 'utf8');
      const idDir = path.join(ROOT, 'news', article.id);
      fs.mkdirSync(idDir, { recursive: true });
      fs.writeFileSync(path.join(idDir, 'index.html'), html, 'utf8');
    }

    generatedPages++;
  }
  updateSitemap(articles, 'news');

  // Also generate static pages for CCN Finanse (/finanse/{slug})
  if (fs.existsSync(FINANSE_ARTICLES_TS_PATH)) {
    const { articles: finanseArticles } = loadArticles(FINANSE_ARTICLES_TS_PATH);
    console.log(`Loaded ${finanseArticles.length} articles from ccn-finanse/articles.ts`);
    fs.mkdirSync(path.join(ROOT, 'finanse'), { recursive: true });
    for (const article of finanseArticles) {
      const html = generateArticleHtml(article, finanseArticles, {
        baseSlug: 'finanse',
        portalName: 'CCN Finanse',
        portalUrl: 'https://polskieradio.cc/finanse'
      });

      const slugFile = path.join(ROOT, 'finanse', `${article.slug}.html`);
      fs.writeFileSync(slugFile, html, 'utf8');

      const cleanDir = path.join(ROOT, 'finanse', article.slug);
      fs.mkdirSync(cleanDir, { recursive: true });
      fs.writeFileSync(path.join(cleanDir, 'index.html'), html, 'utf8');

      if (article.id && article.id !== article.slug) {
        const idFile = path.join(ROOT, 'finanse', `${article.id}.html`);
        fs.writeFileSync(idFile, html, 'utf8');
        const idDir = path.join(ROOT, 'finanse', article.id);
        fs.mkdirSync(idDir, { recursive: true });
        fs.writeFileSync(path.join(idDir, 'index.html'), html, 'utf8');
      }
      generatedPages++;
    }
    updateSitemap(finanseArticles, 'finanse');
  }

  // Generate static pages for Thematic Portals (/nauka, /historia, /prawo)
  const portalsDataPath = path.join(ROOT, 'scripts/portals_data.cjs');
  if (fs.existsSync(portalsDataPath)) {
    const portalsModule = (await import('./portals_data.cjs')).default || (await import('./portals_data.cjs'));
    const { PORTALS } = portalsModule;
    const targetedThematics = ['nauka', 'historia', 'prawo'];
    for (const portalId of targetedThematics) {
      const portalConfig = PORTALS.find(p => p.id === portalId);
      if (!portalConfig || !portalConfig.articles) continue;
      const pArticles = portalConfig.articles;
      console.log(`Loaded ${pArticles.length} articles from portals_data.cjs for CCN ${portalConfig.title.split('–')[0].trim()}`);
      fs.mkdirSync(path.join(ROOT, portalId), { recursive: true });
      for (const article of pArticles) {
        const html = generateArticleHtml(article, pArticles, {
          baseSlug: portalId,
          portalName: portalConfig.shortTitle || portalConfig.title.split('–')[0].trim(),
          portalUrl: `https://polskieradio.cc/${portalId}`
        });

        const slugFile = path.join(ROOT, portalId, `${article.slug}.html`);
        fs.writeFileSync(slugFile, html, 'utf8');

        const cleanDir = path.join(ROOT, portalId, article.slug);
        fs.mkdirSync(cleanDir, { recursive: true });
        fs.writeFileSync(path.join(cleanDir, 'index.html'), html, 'utf8');

        if (article.id && article.id !== article.slug) {
          const idFile = path.join(ROOT, portalId, `${article.id}.html`);
          fs.writeFileSync(idFile, html, 'utf8');
          const idDir = path.join(ROOT, portalId, article.id);
          fs.mkdirSync(idDir, { recursive: true });
          fs.writeFileSync(path.join(idDir, 'index.html'), html, 'utf8');
        }

        // Also alias in news/ if not already present
        const newsSlugFile = path.join(ROOT, 'news', `${article.slug}.html`);
        if (!fs.existsSync(newsSlugFile)) {
          fs.writeFileSync(newsSlugFile, html, 'utf8');
          const newsCleanDir = path.join(ROOT, 'news', article.slug);
          fs.mkdirSync(newsCleanDir, { recursive: true });
          fs.writeFileSync(path.join(newsCleanDir, 'index.html'), html, 'utf8');
        }

        generatedPages++;
      }
      updateSitemap(pArticles, portalId);
    }
  }

  console.log(`Generated static pages for ${generatedPages} articles.`);
  console.log('--- CCN STATIC PAGES BUILD COMPLETE ---');
  return { generatedPages, totalArticles: articles.length };
}

// Allow CLI execution directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  buildCcnStaticPages().catch(err => {
    console.error('SSG build failed:', err);
    process.exit(1);
  });
}
