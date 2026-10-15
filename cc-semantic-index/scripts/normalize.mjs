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
  const idCounts = {};

  for (const item of rawItems) {
    if (!item.title) continue;

    // Normalizacja URL
    let cleanUrl = (item.url || '').trim();
    if (!cleanUrl) cleanUrl = 'https://polskieradio.cc/';
    if (!cleanUrl.startsWith('http')) {
      cleanUrl = `https://polskieradio.cc${cleanUrl.startsWith('/') ? '' : '/'}${cleanUrl}`;
    }

    // Jeśli ten sam URL już wystąpił (np. 12 modułów cclite.pl lub codzienne rozważania /dzj),
    // dodaj precyzyjną kotwicę semantyczną #modul / #dzien
    if (seenUrls.has(cleanUrl)) {
      const anchor = slugify(item.title);
      const urlWithAnchor = `${cleanUrl.split('#')[0]}#${anchor}`;
      if (!seenUrls.has(urlWithAnchor)) {
        cleanUrl = urlWithAnchor;
      } else {
        cleanUrl = `${cleanUrl.split('#')[0]}#${anchor}-${normalized.length}`;
      }
    }
    seenUrls.add(cleanUrl);

    // Kategoria docelowa
    let catId = CATEGORY_MAP[item.category] || 'biblia-wiara';
    const lowerTitle = item.title.toLowerCase();
    const lowerDesc = (item.description || '').toLowerCase();

    // Inteligentne domapowanie do 10 kategorii
    if (lowerTitle.includes('zdrowie') || lowerDesc.includes('zdrowy styl życia') || lowerDesc.includes('dieta')) {
      catId = 'zdrowie-styl-zycia';
    } else if (lowerTitle.includes('misja') || lowerTitle.includes('zjednoczeni za polskę') || lowerTitle.includes('wsparcie') || lowerTitle.includes('wolontariat')) {
      catId = 'misja-wsparcie';
    } else if (lowerTitle.includes('akademia') || lowerTitle.includes('kurs') || lowerTitle.includes('lekcja')) {
      catId = 'edukacja-rozwoj';
    } else if (lowerTitle.includes('małżeństw') || lowerTitle.includes('rodzin') || lowerTitle.includes('seks')) {
      catId = 'rodzina-relacje';
    } else if (lowerTitle.includes('film') || lowerTitle.includes('vod') || lowerTitle.includes('studio daw') || lowerTitle.includes('wideo')) {
      catId = 'filmy-multimedia';
    } else if (lowerTitle.includes('radio') || lowerTitle.includes('muzyka') || lowerTitle.includes('live') || lowerTitle.includes('sleep') || lowerTitle.includes('player')) {
      catId = 'radio-transmisje';
    }

    // Wygeneruj trwały unikalny identyfikator
    let baseId = 'cc-' + slugify(item.title);
    if (!baseId || baseId === 'cc-') baseId = 'cc-item';
    idCounts[baseId] = (idCounts[baseId] || 0) + 1;
    const finalId = idCounts[baseId] > 1 ? `${baseId}-${idCounts[baseId]}` : baseId;

    // Słowa kluczowe i tagi
    const tags = Array.isArray(item.tags) ? item.tags : [];
    const topics = Array.from(new Set(tags.map(t => slugify(t)).filter(Boolean))).slice(0, 10);

    // Typ zasobu
    let type = 'resource';
    if (lowerTitle.includes('portal') || lowerTitle.includes('ccn')) type = 'portal';
    else if (lowerTitle.includes('kurs') || lowerTitle.includes('akademia')) type = 'course';
    else if (lowerTitle.includes('artykuł') || lowerTitle.includes('studium')) type = 'article';
    else if (lowerTitle.includes('radio') || lowerTitle.includes('podcast') || lowerTitle.includes('audio')) type = 'audio';
    else if (lowerTitle.includes('film') || lowerTitle.includes('vod') || lowerTitle.includes('transmisja') || lowerTitle.includes('live')) type = 'video';
    else if (lowerTitle.includes('aplikacja') || lowerTitle.includes('narzędzie') || lowerTitle.includes('pwa') || lowerTitle.includes('search')) type = 'tool';
    else if (lowerTitle.includes('lumina') || lowerTitle.includes('społeczność') || lowerTitle.includes('profil')) type = 'community';
    else if (item.featured) type = 'project';

    normalized.push({
      id: finalId,
      type,
      title: item.title.trim(),
      url: cleanUrl,
      description: (item.description || item.title).trim(),
      language: 'pl',
      primaryCategory: catId,
      topics: topics.length > 0 ? topics : [slugify(catId)],
      keywords: tags,
      aliases: [],
      relatedIds: [],
      visibility: 'public',
      status: 'active',
      source: 'cc-approved-registry',
      verifiedAt: '2026-10-15T09:00:00Z',
      publishedAt: '2026-10-15',
      updatedAt: '2026-10-15',
      author: 'Christian Culture',
      publisher: 'Christian Culture Media',
      thumbnail: null,
      schemaType: type === 'course' ? 'Course' : (type === 'video' ? 'VideoObject' : (type === 'audio' ? 'AudioObject' : 'WebPage')),
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
