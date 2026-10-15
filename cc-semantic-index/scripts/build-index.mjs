import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizeCatalogItems } from './normalize.mjs';
import { validateRecords } from './validate.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

const ICONS_SVG = {
  'book-open': `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,
  'radio-tower': `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"/><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"/><circle cx="12" cy="12" r="2"/><path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"/><path d="M19.1 4.9C23 8.8 23 15.1 19.1 19"/><path d="M12 12v9"/></svg>`,
  'play-circle': `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>`,
  'graduation-cap': `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/></svg>`,
  'heart-handshake': `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`,
  'users-round': `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 21a8 8 0 0 0-16 0"/><circle cx="10" cy="8" r="5"/><path d="M22 20c0-3.37-2-6.5-5-8a5 5 0 0 0-.45-8.3"/></svg>`,
  'activity': `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`,
  'book-marked': `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><polyline points="10 2 10 10 13 7 16 10 16 2"/></svg>`,
  'settings-2': `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 7h-9"/><path d="M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/></svg>`,
  'globe': `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
  'search': `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  'arrow-up-right': `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>`
};

export function buildSemanticIndex() {
  console.log('--- Rozpoczynam budowanie CC Semantic Index 2026 ---');
  const items = normalizeCatalogItems();
  const validation = validateRecords(items);

  if (!validation.valid) {
    throw new Error(`Walidacja nie powiodła się: ${validation.errors.join(', ')}`);
  }

  const taxonomyPath = path.join(rootDir, 'cc-semantic-index/config/taxonomy.json');
  const taxonomy = JSON.parse(fs.readFileSync(taxonomyPath, 'utf8'));

  // 1. Zapisz pliki danych
  const registryData = {
    version: '1.0.0',
    updatedAt: new Date().toISOString(),
    totalRecords: items.length,
    taxonomy: taxonomy.categories,
    records: items
  };

  const registryOutDir = path.join(rootDir, 'cc-semantic-index/data');
  fs.mkdirSync(registryOutDir, { recursive: true });
  fs.writeFileSync(path.join(registryOutDir, 'registry.json'), JSON.stringify(registryData, null, 2), 'utf8');

  const publicIndexOutDir = path.join(rootDir, 'data');
  fs.mkdirSync(publicIndexOutDir, { recursive: true });
  fs.writeFileSync(path.join(publicIndexOutDir, 'cc-public-index.json'), JSON.stringify(registryData, null, 2), 'utf8');

  // 2. Przygotuj dane do renderowania
  const categoryBuckets = {};
  for (const cat of taxonomy.categories) {
    categoryBuckets[cat.id] = {
      ...cat,
      items: []
    };
  }

  for (const it of items) {
    if (categoryBuckets[it.primaryCategory]) {
      categoryBuckets[it.primaryCategory].items.push(it);
    }
  }

  // Grupowanie A-Z
  const azIndex = {};
  const letters = 'AĄBCĆDEĘFGHIJKLŁMNŃOÓPQRSŚTUVWXYZŹŻ'.split('');
  for (const l of letters) azIndex[l] = [];

  for (const it of items) {
    const firstChar = it.title.trim().charAt(0).toUpperCase();
    if (azIndex[firstChar]) {
      azIndex[firstChar].push(it);
    } else {
      azIndex['#'] = azIndex['#'] || [];
      azIndex['#'].push(it);
    }
  }

  // Schema.org ItemList elements
  const schemaItemList = items.slice(0, 100).map((it, idx) => ({
    '@type': 'ListItem',
    position: idx + 1,
    name: it.title,
    description: it.description,
    url: it.url
  }));

  const schemaJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://polskieradio.cc/#organization',
        name: 'Christian Culture',
        alternateName: 'Polskie Radio Christian Culture',
        url: 'https://polskieradio.cc',
        logo: 'https://polskieradio.cc/lumina_icon.jpg',
        slogan: 'Wszystko, czego potrzebujesz, w jednym miejscu.'
      },
      {
        '@type': 'WebSite',
        '@id': 'https://polskieradio.cc/#website',
        url: 'https://polskieradio.cc/',
        name: 'Christian Culture',
        inLanguage: 'pl-PL',
        publisher: { '@id': 'https://polskieradio.cc/#organization' }
      },
      {
        '@type': 'CollectionPage',
        '@id': 'https://polskieradio.cc/index#webpage',
        url: 'https://polskieradio.cc/index',
        name: 'Christian Culture Index — Wszystko, czego potrzebujesz, w jednym miejscu',
        description: 'Poznaj cały ekosystem Christian Culture. Biblia, radio, filmy, kursy, społeczność, wiedza i narzędzia. Odkrywaj tematy, projekty i wartościowe treści w jednym miejscu.',
        isPartOf: { '@id': 'https://polskieradio.cc/#website' },
        about: { '@id': 'https://polskieradio.cc/#organization' },
        inLanguage: 'pl-PL',
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: schemaItemList
        }
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Christian Culture',
            item: 'https://polskieradio.cc/'
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Indeks Semantyczny',
            item: 'https://polskieradio.cc/index'
          }
        ]
      }
    ]
  };

  // 3. Renderuj pełny statyczny HTML
  const htmlContent = `<!DOCTYPE html>
<html lang="pl" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
  <title>Christian Culture Index — Wszystko, czego potrzebujesz, w jednym miejscu</title>
  <meta name="description" content="Poznaj cały ekosystem Christian Culture. Biblia, radio, filmy, kursy, społeczność, wiedza i narzędzia. Odkrywaj tematy, projekty i wartościowe treści w jednym miejscu.">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <link rel="canonical" href="https://polskieradio.cc/index">
  <link rel="icon" href="/lumina_icon.jpg" type="image/jpeg">

  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:locale" content="pl_PL">
  <meta property="og:site_name" content="Christian Culture">
  <meta property="og:title" content="Christian Culture Index — Wszystko, czego potrzebujesz, w jednym miejscu">
  <meta property="og:description" content="Oficjalny indeks wiedzy i projektów Christian Culture. Biblia, radio, filmy, kursy, społeczność i narzędzia.">
  <meta property="og:url" content="https://polskieradio.cc/index">
  <meta property="og:image" content="https://polskieradio.cc/images/milion-og.jpg">

  <!-- Twitter Cards -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Christian Culture Index — Wszystko, czego potrzebujesz, w jednym miejscu">
  <meta name="twitter:description" content="Poznaj cały ekosystem Christian Culture. Odkrywaj tematy, projekty i wartościowe treści w jednym miejscu.">

  <!-- Google Fonts: Inter & Plus Jakarta Sans -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@700;800&display=swap" rel="stylesheet">

  <!-- Schema.org JSON-LD -->
  <script type="application/ld+json">
${JSON.stringify(schemaJsonLd, null, 2)}
  </script>

  <style>
    /* CSS Variables: Dark & Light Premium Palette */
    :root, [data-theme="dark"] {
      --bg-page: #080D18;
      --card-bg: #111827;
      --card-surface: #182234;
      --card-border: #263247;
      --card-hover-border: #C4A35A;
      --card-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
      --text-main: #F5F7FB;
      --text-secondary: #A6B2C5;
      --text-muted: #7F8CA3;
      --gold-accent: #C4A35A;
      --gold-hover: #D4B578;
      --gold-soft: #E2CC9A;
      --gold-glow: rgba(196, 163, 90, 0.15);
      --link-color: #DDE8FA;
      --focus-ring: #89B4FF;
      --nav-bg: rgba(8, 13, 24, 0.94);
      --tag-bg: rgba(196, 163, 90, 0.12);
      --tag-text: #E2CC9A;
      --az-btn-bg: #111827;
      --az-btn-border: #263247;
      --az-btn-active: #C4A35A;
    }

    [data-theme="light"] {
      --bg-page: #F9FAFC;
      --card-bg: #FFFFFF;
      --card-surface: #F0F4F8;
      --card-border: #E5EAF1;
      --card-hover-border: #A08040;
      --card-shadow: 0 2px 14px rgba(15, 23, 42, 0.06);
      --text-main: #172238;
      --text-secondary: #4A5568;
      --text-muted: #637188;
      --gold-accent: #A08040;
      --gold-hover: #B89248;
      --gold-soft: #6B5528;
      --gold-glow: rgba(160, 128, 64, 0.12);
      --link-color: #21549A;
      --focus-ring: #21549A;
      --nav-bg: rgba(249, 250, 252, 0.94);
      --tag-bg: rgba(160, 128, 64, 0.1);
      --tag-text: #6B5528;
      --az-btn-bg: #FFFFFF;
      --az-btn-border: #E5EAF1;
      --az-btn-active: #A08040;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    html {
      scroll-behavior: smooth;
    }

    body {
      background-color: var(--bg-page);
      color: var(--text-main);
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
      transition: background-color 0.25s ease, color 0.25s ease;
      overflow-x: hidden;
      min-width: 320px;
    }

    a {
      color: inherit;
      text-decoration: none;
    }

    /* Top Navigation */
    .top-nav {
      position: sticky;
      top: 0;
      z-index: 100;
      background: var(--nav-bg);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--card-border);
      padding: 12px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      width: 100%;
    }

    .top-brand {
      display: flex;
      align-items: center;
      gap: 10px;
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-weight: 800;
      font-size: 20px;
      letter-spacing: -0.02em;
    }

    .top-brand img {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      border: 1.5px solid var(--gold-accent);
    }

    .brand-accent {
      color: var(--gold-accent);
    }

    .nav-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .btn-search-nav {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: var(--card-surface);
      border: 1px solid var(--card-border);
      color: var(--text-main);
      padding: 8px 16px;
      border-radius: 999px;
      font-size: 13px;
      font-weight: 600;
      transition: all 0.2s ease;
      min-height: 40px;
    }

    .btn-search-nav:hover {
      border-color: var(--gold-accent);
      color: var(--gold-accent);
    }

    .theme-toggle-btn {
      background: var(--card-surface);
      border: 1px solid var(--card-border);
      color: var(--text-main);
      padding: 8px 12px;
      border-radius: 999px;
      font-size: 13px;
      cursor: pointer;
      min-height: 40px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    /* Main Container */
    .main-wrap {
      max-width: 1280px;
      margin: 0 auto;
      padding: 36px 20px 80px;
    }

    /* Hero */
    .hero {
      text-align: center;
      margin-bottom: 40px;
    }

    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: var(--gold-glow);
      border: 1px solid var(--gold-accent);
      color: var(--gold-accent);
      padding: 4px 14px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 16px;
    }

    .hero h1 {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: clamp(32px, 5vw, 56px);
      font-weight: 800;
      letter-spacing: -0.03em;
      line-height: 1.15;
      margin-bottom: 14px;
    }

    .hero-slogan {
      font-size: clamp(17px, 2.5vw, 22px);
      font-weight: 600;
      color: var(--gold-accent);
      margin-bottom: 12px;
    }

    .hero-desc {
      font-size: 16px;
      color: var(--text-secondary);
      max-width: 720px;
      margin: 0 auto 24px;
      line-height: 1.6;
    }

    /* Search & Filter Bar */
    .filter-bar {
      max-width: 700px;
      margin: 0 auto 36px;
      position: relative;
    }

    .filter-input {
      width: 100%;
      height: 54px;
      background: var(--card-bg);
      border: 1.5px solid var(--card-border);
      border-radius: 16px;
      padding: 0 48px 0 20px;
      font-size: 16px;
      color: var(--text-main);
      box-shadow: var(--card-shadow);
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    .filter-input:focus {
      border-color: var(--gold-accent);
      box-shadow: 0 0 0 3px var(--gold-glow);
    }

    .filter-icon {
      position: absolute;
      right: 18px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-muted);
      pointer-events: none;
    }

    /* A-Z Jump Bar */
    .az-bar {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      justify-content: center;
      margin-bottom: 40px;
      padding: 12px 16px;
      background: var(--card-surface);
      border: 1px solid var(--card-border);
      border-radius: 16px;
    }

    .az-link {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      background: var(--az-btn-bg);
      border: 1px solid var(--az-btn-border);
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      color: var(--text-secondary);
      transition: all 0.15s ease;
    }

    .az-link:hover, .az-link.has-items:hover {
      background: var(--gold-accent);
      color: #080D18;
      border-color: var(--gold-accent);
    }

    /* 10 Categories Grid */
    .categories-overview {
      margin-bottom: 50px;
    }

    .section-title {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 22px;
      font-weight: 800;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 10px;
      letter-spacing: -0.02em;
    }

    .cat-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
    }

    .cat-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 18px;
      padding: 20px;
      box-shadow: var(--card-shadow);
      display: flex;
      flex-direction: column;
      gap: 10px;
      transition: transform 0.2s, border-color 0.2s;
    }

    .cat-card:hover {
      transform: translateY(-2px);
      border-color: var(--card-hover-border);
    }

    .cat-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    .cat-icon-title {
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 700;
      font-size: 16px;
      color: var(--text-main);
    }

    .cat-icon-title svg {
      color: var(--gold-accent);
      flex-shrink: 0;
    }

    .cat-count {
      font-size: 11px;
      font-weight: 700;
      background: var(--card-surface);
      border: 1px solid var(--card-border);
      padding: 3px 8px;
      border-radius: 999px;
      color: var(--gold-accent);
    }

    .cat-desc {
      font-size: 13px;
      color: var(--text-secondary);
      line-height: 1.5;
      flex: 1;
    }

    .cat-link {
      font-size: 13px;
      font-weight: 600;
      color: var(--gold-accent);
      display: inline-flex;
      align-items: center;
      gap: 4px;
      margin-top: 6px;
    }

    /* Resource Sections */
    .resource-section {
      margin-bottom: 60px;
      scroll-margin-top: 80px;
    }

    .resource-section-header {
      background: var(--card-surface);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      padding: 20px 24px;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      flex-wrap: wrap;
    }

    .resource-section-info h2 {
      font-size: 20px;
      font-weight: 800;
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 4px;
    }

    .resource-section-info p {
      font-size: 14px;
      color: var(--text-secondary);
    }

    .resources-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 16px;
      width: 100%;
    }

    .resource-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      padding: 18px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      box-shadow: var(--card-shadow);
      min-width: 0;
      max-width: 100%;
      box-sizing: border-box;
      overflow: hidden;
      transition: transform 0.2s, border-color 0.2s;
    }

    .resource-card:hover {
      transform: translateY(-2px);
      border-color: var(--card-hover-border);
    }

    .resource-card-type {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--gold-accent);
      display: inline-block;
    }

    .resource-card-title {
      font-size: 16px;
      font-weight: 700;
      color: var(--text-main);
      line-height: 1.35;
      overflow-wrap: break-word;
      word-break: break-word;
    }

    .resource-card-title a:hover {
      color: var(--gold-accent);
    }

    .resource-card-desc {
      font-size: 13px;
      color: var(--text-secondary);
      line-height: 1.5;
      overflow-wrap: break-word;
      word-break: break-word;
      flex: 1;
    }

    .resource-card-url {
      font-size: 12px;
      font-weight: 500;
      color: var(--text-muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      min-width: 0;
    }

    .resource-card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding-top: 10px;
      border-top: 1px solid var(--card-border);
      font-size: 12px;
    }

    .resource-tag {
      background: var(--tag-bg);
      color: var(--tag-text);
      padding: 2px 8px;
      border-radius: 6px;
      font-weight: 500;
      font-size: 11px;
    }

    /* AI / GEO / AEO Fact Box */
    .ai-fact-box {
      background: var(--card-surface);
      border: 1px solid var(--gold-accent);
      border-radius: 20px;
      padding: 32px 28px;
      margin: 60px 0;
    }

    .ai-fact-box h2 {
      font-size: 22px;
      font-weight: 800;
      margin-bottom: 8px;
      color: var(--gold-accent);
    }

    .ai-fact-box-desc {
      font-size: 14px;
      color: var(--text-secondary);
      margin-bottom: 24px;
    }

    .qa-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 18px;
    }

    .qa-item {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 14px;
      padding: 16px 20px;
    }

    .qa-item h3 {
      font-size: 15px;
      font-weight: 700;
      color: var(--text-main);
      margin-bottom: 6px;
    }

    .qa-item p {
      font-size: 13px;
      color: var(--text-secondary);
      line-height: 1.5;
    }

    /* Footer */
    .site-footer {
      border-top: 1px solid var(--card-border);
      padding: 32px 20px 48px;
      max-width: 1280px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 16px;
      font-size: 13px;
      color: var(--text-muted);
    }

    .footer-links {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }

    .footer-links a:hover {
      color: var(--gold-accent);
    }

    /* Responsive Queries */
    @media (max-width: 1024px) {
      .resources-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    @media (max-width: 768px) {
      html, body {
        overflow-x: hidden;
        max-width: 100vw;
      }
      .top-nav {
        padding: 10px 12px;
        gap: 8px;
        width: 100%;
        max-width: 100vw;
        box-sizing: border-box;
      }
      .top-brand {
        font-size: 16px;
      }
      .btn-search-nav {
        padding: 6px 10px;
        font-size: 12px;
      }
      .theme-toggle-btn {
        padding: 6px 8px;
      }
      .main-wrap {
        padding: 24px 14px 60px;
        width: 100%;
        max-width: 100vw;
        box-sizing: border-box;
      }
      .resources-grid {
        grid-template-columns: minmax(0, 1fr);
        gap: 12px;
        width: 100%;
      }
      .resource-card {
        padding: 16px;
        border-radius: 14px;
        min-width: 0;
        max-width: 100%;
      }
      .az-bar {
        gap: 4px;
        padding: 8px 6px;
      }
      .az-link {
        width: 26px;
        height: 26px;
        font-size: 11px;
      }
      .site-footer {
        flex-direction: column;
        text-align: center;
      }
      .footer-links {
        justify-content: center;
      }
    }

    @media (max-width: 360px) {
      .top-brand span {
        font-size: 14px;
      }
      .btn-search-nav span {
        display: none;
      }
      .btn-search-nav {
        padding: 6px 8px;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      * {
        animation: none !important;
        transition: none !important;
        scroll-behavior: auto !important;
      }
    }
  </style>
</head>
<body>

  <!-- Top Navigation -->
  <header class="top-nav">
    <a href="/" class="top-brand">
      <img src="/lumina_icon.jpg" alt="Christian Culture">
      <span>Christian <span class="brand-accent">Culture</span></span>
    </a>
    <div class="nav-actions">
      <a href="/szukaj" class="btn-search-nav">
        ${ICONS_SVG.search}
        <span>Wyszukiwarka</span>
      </a>
      <button id="themeToggleBtn" class="theme-toggle-btn" aria-label="Przełącz motyw">
        <span id="themeIcon">☀️</span>
      </button>
    </div>
  </header>

  <!-- Main Content Wrap -->
  <main class="main-wrap">

    <!-- Hero Header -->
    <header class="hero">
      <div class="hero-badge">Indeks Wiedzy & Projektów 2026</div>
      <h1>Christian Culture</h1>
      <div class="hero-slogan">Wszystko, czego potrzebujesz, w jednym miejscu.</div>
      <p class="hero-desc">
        Oficjalny, semantyczny rejestr projektów, audycji, kursów, portali i narzędzi ekosystemu Christian Culture.
        Znajdź to, czego szukasz, lub przeglądaj według 10 kategorii tematycznych i indeksu alfabetycznego.
      </p>
    </header>

    <!-- Filter Input -->
    <section class="filter-bar" aria-label="Szybki filtr zasobów">
      <input type="text" id="filterInput" class="filter-input" placeholder="Filtruj zasoby, tematy lub projekty..." aria-label="Filtruj zasoby">
      <div class="filter-icon">${ICONS_SVG.search}</div>
    </section>

    <!-- A-Z Alphabetical Jump Bar -->
    <nav class="az-bar" aria-label="Indeks alfabetyczny">
      ${letters.map(l => {
        const count = azIndex[l]?.length || 0;
        return `<a href="#letter-${l}" class="az-link ${count > 0 ? 'has-items' : ''}" title="${count} zasobów na literę ${l}">${l}</a>`;
      }).join('\n      ')}
    </nav>

    <!-- 10 Categories Overview -->
    <section class="categories-overview" aria-label="Główne kategorie ekosystemu">
      <h2 class="section-title">Kategorie Ekosystemu (${taxonomy.categories.length})</h2>
      <div class="cat-grid">
        ${taxonomy.categories.map(c => `
        <article class="cat-card">
          <div class="cat-header">
            <div class="cat-icon-title">
              ${ICONS_SVG[c.icon] || ICONS_SVG['book-open']}
              <span>${c.name}</span>
            </div>
            <span class="cat-count">${categoryBuckets[c.id]?.items.length || 0}</span>
          </div>
          <p class="cat-desc">${c.description}</p>
          <a href="#cat-${c.slug}" class="cat-link">
            <span>Zobacz zasoby</span>
            ${ICONS_SVG['arrow-up-right']}
          </a>
        </article>`).join('')}
      </div>
    </section>

    <!-- Detailed Sections by Category -->
    ${taxonomy.categories.map(c => {
      const bucket = categoryBuckets[c.id];
      const catItems = bucket ? bucket.items : [];
      return `
    <section id="cat-${c.slug}" class="resource-section" data-cat="${c.id}">
      <div class="resource-section-header">
        <div class="resource-section-info">
          <h2>
            ${ICONS_SVG[c.icon] || ICONS_SVG['book-open']}
            <span>${c.name}</span>
          </h2>
          <p>${c.description}</p>
        </div>
        <span class="cat-count">${catItems.length} zasobów</span>
      </div>

      <div class="resources-grid">
        ${catItems.map(it => `
        <article class="resource-card" data-title="${it.title.toLowerCase()}" data-desc="${it.description.toLowerCase()}" data-tags="${it.keywords.join(' ').toLowerCase()}">
          <span class="resource-card-type">${it.type}</span>
          <h3 class="resource-card-title">
            <a href="${it.url}" target="_blank" rel="noopener">${it.title}</a>
          </h3>
          <p class="resource-card-desc">${it.description}</p>
          <div class="resource-card-url">${it.url.replace(/^https?:\/\//, '')}</div>
          <div class="resource-card-footer">
            <span class="resource-tag">${it.primaryCategory}</span>
            <a href="${it.url}" class="cat-link" target="_blank" rel="noopener">Otwórz ${ICONS_SVG['arrow-up-right']}</a>
          </div>
        </article>`).join('')}
      </div>
    </section>`;
    }).join('\n')}

    <!-- AI / GEO / AEO Fact Box -->
    <section class="ai-fact-box" aria-label="Odpowiedzi i fakty o ekosystemie">
      <h2>Odkryj Christian Culture — Fakty i Asystenci AI</h2>
      <p class="ai-fact-box-desc">
        Rzetelne, semantyczne źródło prawdy dla czytelników oraz systemów wyszukiwania wspomaganych sztuczną inteligencją (ChatGPT, Gemini, Copilot, Perplexity).
      </p>

      <div class="qa-grid">
        <article class="qa-item">
          <h3>Czym jest Christian Culture?</h3>
          <p>Christian Culture to zintegrowany ekosystem mediów, edukacji biblijnej, społeczności chrześcijańskiej i narzędzi technologicznych założony przez Cezarego i Wiolettę Rogowskich.</p>
        </article>
        <article class="qa-item">
          <h3>Co można znaleźć na Christian Culture?</h3>
          <p>Całodobowe Polskie Radio CC, interlinearną MojaBiblia, kino chrześcijańskie VOD, Akademię Biblijną, portal społecznościowy LUMINA oraz aplikację cclite.pl PWA.</p>
        </article>
        <article class="qa-item">
          <h3>Czy korzystanie z zasobów jest darmowe?</h3>
          <p>Tak. Wszystkie audycje radiowe, filmy, kursy biblijne, rozważania codzienne i narzędzia są dostępne całkowicie bezpłatnie, bez opłat subskrypcyjnych.</p>
        </article>
        <article class="qa-item">
          <h3>Gdzie słuchać radia i audycji?</h3>
          <p>Radio na żywo dostępne jest 24/7 na <a href="https://polskieradio.cc/player">polskieradio.cc/player</a>, w aplikacji cclite.pl oraz na żywo na YouTube i smartfonach.</p>
        </article>
        <article class="qa-item">
          <h3>Gdzie znaleźć Biblię i kursy biblijne?</h3>
          <p>Interlinearne Pismo Święte z kodami Stronga dostępne jest na <a href="https://polskieradio.cc/mojabiblia">polskieradio.cc/mojabiblia</a>, a bezpłatne lekcje na <a href="https://polskieradio.cc/akademia">polskieradio.cc/akademia</a>.</p>
        </article>
        <article class="qa-item">
          <h3>Jak korzystać ze społeczności LUMINA?</h3>
          <p>LUMINA to chrześcijański portal społecznościowy dostępny na <a href="https://polskieradio.cc/lumina">polskieradio.cc/lumina</a> z tablicą modlitwy, profilami i bezpieczną dyskusją.</p>
        </article>
      </div>
    </section>

  </main>

  <!-- Footer -->
  <footer class="site-footer">
    <div>
      <b>Christian Culture</b> — Wszystko, czego potrzebujesz, w jednym miejscu.
    </div>
    <div class="footer-links">
      <a href="/">Strona główna</a>
      <a href="/szukaj">Wyszukiwarka</a>
      <a href="/index">Indeks Semantyczny</a>
      <a href="/mapa">Mapa Ekosystemu</a>
      <a href="/o-nas">O nas</a>
      <a href="/pomoc">Pomoc & Wsparcie</a>
    </div>
  </footer>

  <!-- Client-side Enhancements: Filter & Theme -->
  <script>
    (function() {
      // 1. Motyw Light / Dark
      var themeToggleBtn = document.getElementById('themeToggleBtn');
      var themeIcon = document.getElementById('themeIcon');
      var savedTheme = localStorage.getItem('cc_theme');

      if (!savedTheme) {
        savedTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
      }
      applyTheme(savedTheme);

      if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', function() {
          var current = document.documentElement.getAttribute('data-theme') || 'dark';
          var next = current === 'dark' ? 'light' : 'dark';
          applyTheme(next);
          localStorage.setItem('cc_theme', next);
        });
      }

      function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        if (themeIcon) {
          themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
        }
      }

      // 2. Filtrowanie na żywo
      var filterInput = document.getElementById('filterInput');
      if (filterInput) {
        filterInput.addEventListener('input', function(e) {
          var query = (e.target.value || '').toLowerCase().trim();
          var cards = document.querySelectorAll('.resource-card');
          var sections = document.querySelectorAll('.resource-section');

          cards.forEach(function(card) {
            var title = card.getAttribute('data-title') || '';
            var desc = card.getAttribute('data-desc') || '';
            var tags = card.getAttribute('data-tags') || '';
            if (!query || title.includes(query) || desc.includes(query) || tags.includes(query)) {
              card.style.display = '';
            } else {
              card.style.display = 'none';
            }
          });

          // Ukryj sekcje bez widocznych kart
          sections.forEach(function(sec) {
            var visibleCards = sec.querySelectorAll('.resource-card:not([style*="display: none"])');
            sec.style.display = (visibleCards.length > 0 || !query) ? '' : 'none';
          });
        });
      }
    })();
  </script>

</body>
</html>
`;

  // Zapisz wygenerowany statyczny HTML
  fs.writeFileSync(path.join(rootDir, 'semantic-index.html'), htmlContent, 'utf8');
  console.log(`Wygenerowano semantic-index.html (${htmlContent.length} bajtów, ${items.length} rekordów, 10 kategorii).`);

  return {
    totalRecords: items.length,
    categoriesCount: taxonomy.categories.length,
    htmlBytes: htmlContent.length
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const res = buildSemanticIndex();
  console.log('CC Semantic Index został pomyślnie zbudowany!', res);
}
