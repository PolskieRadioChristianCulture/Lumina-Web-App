import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

// Mapowanie starych kategorii z szukaj/catalog.json na nową taksonomię 10 kategorii
const CATEGORY_MAP = {
  'Biblia i formacja': 'biblia-wiara',
  'Radio & Live': 'radio-transmisje',
  'Media i treści': 'filmy-multimedia',
  'Wiedza i publicystyka': 'nauka-historia-wiedza',
  'Artykuły & Wiedza CCN': 'nauka-historia-wiedza',
  'Portale': 'spolecznosc-cc',
  'Społeczność & Relacje': 'rodzina-relacje',
  'Narzędzia i misja': 'narzedzia-technologia'
};

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[łŁ]/g, 'l')
    .replace(/[ąĄ]/g, 'a')
    .replace(/[ćĆ]/g, 'c')
    .replace(/[ęĘ]/g, 'e')
    .replace(/[ńŃ]/g, 'n')
    .replace(/[óÓ]/g, 'o')
    .replace(/[śŚ]/g, 's')
    .replace(/[źŹżŻ]/g, 'z')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50);
}

export function normalizeCatalogItems() {
  const catalogPath = path.join(rootDir, 'szukaj/catalog.json');
  if (!fs.existsSync(catalogPath)) {
    throw new Error(`Brak pliku katalogu: ${catalogPath}`);
  }

  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
  const rawItems = catalog.items || [];

  const normalized = [];
  const seenUrls = new Set();
  const seenDedupKeys = new Set();
  const idCounts = {};

  for (const item of rawItems) {
    if (!item.title) continue;

    const trimmedTitle = item.title.trim();
    const lowerTitle = trimmedTitle.toLowerCase();
    const lowerDesc = (item.description || '').toLowerCase();

    // 1. Zabezpieczenie przed duplikatami (Zero-Duplicates Policy)
    const dedupKey = `${lowerTitle}|${(item.description || '').slice(0, 60).toLowerCase()}`;
    if (seenDedupKeys.has(dedupKey)) {
      continue;
    }
    seenDedupKeys.add(dedupKey);

    // 2. Normalizacja URL i kotwic
    let cleanUrl = (item.url || '').trim();
    if (!cleanUrl) cleanUrl = 'https://polskieradio.cc/';
    if (!cleanUrl.startsWith('http')) {
      cleanUrl = `https://polskieradio.cc${cleanUrl.startsWith('/') ? '' : '/'}${cleanUrl}`;
    }

    if (seenUrls.has(cleanUrl)) {
      const anchor = slugify(trimmedTitle);
      const urlWithAnchor = `${cleanUrl.split('#')[0]}#${anchor}`;
      if (!seenUrls.has(urlWithAnchor)) {
        cleanUrl = urlWithAnchor;
      } else {
        cleanUrl = `${cleanUrl.split('#')[0]}#${anchor}-${normalized.length}`;
      }
    }
    seenUrls.add(cleanUrl);

    // 3. Wykrywanie ortogonalnego TYPU publikacji (Wymiar 1)
    let type = 'resource';
    let schemaType = 'WebPage';

    if (lowerTitle.startsWith('rozważanie:')) {
      type = 'devotional';
      schemaType = 'Article';
    } else if (lowerTitle.startsWith('leksykon:')) {
      type = 'bible-entry';
      schemaType = 'DefinedTerm';
    } else if (lowerTitle.includes('książk') || lowerTitle.includes('pokonać goliata') || lowerTitle.includes('e-booki i audiobooki')) {
      type = 'book';
      schemaType = 'Book';
    } else if (lowerTitle.includes('lekcja ') || (cleanUrl.includes('/kursy/') && lowerTitle.includes('dzień '))) {
      type = 'lesson';
      schemaType = 'Course';
    } else if (lowerTitle.includes('kurs ') || lowerTitle.includes('akademia biblijna')) {
      type = 'course';
      schemaType = 'Course';
    } else if (lowerTitle.includes('polityka redakcyjna')) {
      type = 'portal';
      schemaType = 'WebPage';
    } else if (lowerTitle.includes('portal') || (lowerTitle.startsWith('ccn ') && !cleanUrl.includes('/news?art='))) {
      type = 'portal';
      schemaType = 'WebSite';
    } else if (cleanUrl.includes('/news?art=') || item.category === 'Artykuły & Wiedza CCN') {
      type = 'article';
      schemaType = 'Article';
    } else if (lowerTitle.includes('radio') || lowerTitle.includes('podcast') || lowerTitle.includes('audio') || lowerTitle.includes('ambient') || cleanUrl.includes('/skins')) {
      type = 'audio';
      schemaType = 'AudioObject';
    } else if (lowerTitle.includes('film') || lowerTitle.includes('vod') || lowerTitle.includes('transmisja') || lowerTitle.includes('live') || lowerTitle.includes('studio dobrego słowa') || lowerTitle.includes('cctv24') || lowerTitle.includes(' tv')) {
      type = 'video';
      schemaType = 'VideoObject';
    } else if (lowerTitle.includes('lumina') || lowerTitle.includes('profil:') || lowerTitle.includes('lumi messenger')) {
      type = 'community';
      schemaType = 'SocialMediaPosting';
    } else if (lowerTitle.includes('aplikacja') || lowerTitle.includes('narzędzie') || lowerTitle.includes('pwa') || lowerTitle.includes('search') || lowerTitle.includes('wyszukiwarka') || lowerTitle.includes('holos') || lowerTitle.includes('studio daw') || lowerTitle.includes('licznik')) {
      type = 'tool';
      schemaType = 'SoftwareApplication';
    } else if (lowerTitle.includes('o nas')) {
      type = 'project';
      schemaType = 'AboutPage';
    } else if (item.featured) {
      type = 'project';
      schemaType = 'WebPage';
    }

    // 4. Precyzyjne przypisanie KATEGORII TEMATYCZNEJ (Wymiar 2 - 10 Kategorii)
    let catId = CATEGORY_MAP[item.category] || 'biblia-wiara';

    if (lowerTitle.includes('polityka redakcyjna') || lowerTitle.includes('o nas') || lowerTitle.includes('licznik')) {
      catId = 'misja-wsparcie';
    } else if (type === 'book') {
      catId = 'edukacja-rozwoj';
    } else if (lowerTitle.includes('lumina') && !lowerTitle.includes('profil: wioletta')) {
      catId = 'spolecznosc-cc';
    } else if (
      lowerTitle.includes('psychologia') ||
      lowerTitle.includes('zdrowie') ||
      lowerDesc.includes('zdrowy styl życia') ||
      lowerDesc.includes('dieta') ||
      lowerTitle.includes('samotny') ||
      lowerTitle.includes('układ nerwowy') ||
      lowerTitle.includes('atlas ziół') ||
      lowerTitle.includes('ziu')
    ) {
      catId = 'zdrowie-styl-zycia';
    } else if (
      lowerTitle.includes('jak rozmawiać z dziećmi o halloween') ||
      lowerTitle.includes('dom jako twierdza') ||
      lowerTitle.includes('wychowanie') ||
      lowerTitle.includes('małżeństw') ||
      lowerTitle.includes('rodzin') ||
      lowerTitle.includes('relacji') ||
      lowerTitle.includes('seks')
    ) {
      catId = 'rodzina-relacje';
    } else if (
      lowerTitle.includes('misja') ||
      lowerTitle.includes('zjednoczeni za polskę') ||
      lowerTitle.includes('wsparcie') ||
      lowerTitle.includes('wolontariat') ||
      lowerTitle.includes('organizacji charytatywnych') ||
      lowerTitle.includes('prześladowań')
    ) {
      catId = 'misja-wsparcie';
    } else if (
      type === 'lesson' ||
      type === 'course' ||
      lowerTitle.includes('akademia') ||
      lowerTitle.includes('kurs')
    ) {
      catId = 'edukacja-rozwoj';
    } else if (
      type === 'devotional' ||
      type === 'bible-entry' ||
      lowerTitle.includes('werset dnia') ||
      lowerTitle.includes('mojabiblia') ||
      lowerTitle.includes('pismo święte') ||
      lowerTitle.includes('przymierze') ||
      lowerTitle.includes('zbawienie') ||
      lowerTitle.includes('dekalog')
    ) {
      catId = 'biblia-wiara';
    } else if (
      type === 'audio' ||
      lowerTitle.includes('radio') ||
      lowerTitle.includes('muzyka') ||
      lowerTitle.includes('live') ||
      lowerTitle.includes('sleep') ||
      lowerTitle.includes('player')
    ) {
      catId = 'radio-transmisje';
    } else if (
      type === 'video' ||
      lowerTitle.includes('film') ||
      lowerTitle.includes('vod') ||
      lowerTitle.includes('wideo')
    ) {
      catId = 'filmy-multimedia';
    } else if (
      lowerTitle.includes('profil:') ||
      lowerTitle.includes('społeczność')
    ) {
      catId = 'spolecznosc-cc';
    } else if (
      type === 'tool' ||
      lowerTitle.includes('narzędzie') ||
      lowerTitle.includes('pwa') ||
      lowerTitle.includes('search') ||
      lowerTitle.includes('holos') ||
      lowerTitle.includes('kalkulator')
    ) {
      catId = 'narzedzia-technologia';
    }

    // Wygeneruj trwały unikalny identyfikator
    let baseId = 'cc-' + slugify(trimmedTitle);
    if (!baseId || baseId === 'cc-') baseId = 'cc-item';
    idCounts[baseId] = (idCounts[baseId] || 0) + 1;
    const finalId = idCounts[baseId] > 1 ? `${baseId}-${idCounts[baseId]}` : baseId;

    // Słowa kluczowe i tagi
    const tags = Array.isArray(item.tags) ? item.tags : [];
    const topics = Array.from(new Set(tags.map(t => slugify(t)).filter(Boolean))).slice(0, 10);

    normalized.push({
      id: finalId,
      type,
      title: trimmedTitle,
      url: cleanUrl,
      description: (item.description || trimmedTitle).trim(),
      language: 'pl',
      primaryCategory: catId,
      topics: topics.length > 0 ? topics : [slugify(catId)],
      keywords: tags,
      aliases: [],
      relatedIds: [],
      visibility: 'public',
      status: 'active',
      source: 'cc-approved-registry',
      verifiedAt: '2026-10-15T12:00:00Z',
      publishedAt: '2026-10-15',
      updatedAt: '2026-10-15',
      author: item.author || 'Christian Culture',
      publisher: 'Christian Culture Media',
      thumbnail: null,
      schemaType,
      featured: Boolean(item.featured)
    });
  }

  // Budowanie powiązań (relatedIds) po tej samej kategorii i słowach kluczowych
  for (let i = 0; i < normalized.length; i++) {
    const cur = normalized[i];
    const related = [];
    for (let j = 0; j < normalized.length; j++) {
      if (i === j) continue;
      const other = normalized[j];
      if (other.primaryCategory === cur.primaryCategory && other.featured) {
        related.push(other.id);
        if (related.length >= 3) break;
      }
    }
    cur.relatedIds = related;
  }

  return normalized;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const items = normalizeCatalogItems();
  console.log(`Znormalizowano ${items.length} unikalnych rekordów.`);
}
