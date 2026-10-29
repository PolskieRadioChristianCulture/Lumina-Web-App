// =========================================================================
// AI DLA JEZUSA — CC KNOWLEDGE HUB (ETAP 1)
// Canonical Document Standard • Sola Scriptura • ZERO COST
// Specyfikacja: Misja CC / JOMA / strategia/AI_DLA_JEZUSA_SPECYFIKACJA_WDROZENIA_2026-10-29.md
// =========================================================================

import searchIndexData from '../../data/cc-search-index.json' with { type: 'json' };

/**
 * Normalizacja polskich znaków diakrytycznych i małych liter do porównań
 */
export function normalizeText(str = '') {
  return String(str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ł/g, 'l')
    .trim();
}

/**
 * Wykrywanie referencji biblijnych w tekście (np. J 3:16, Rz 8:28, Mt 5:1-12)
 */
export function extractScriptureRefs(text = '') {
  const pattern = /\b([1-3]?\s?[A-Za-zżźćńółęąśŻŹĆĄŚĘŁÓŃ]{1,8})\s+(\d{1,3}):(\d{1,3}(?:-\d{1,3})?)\b/gi;
  const matches = [];
  let m;
  while ((m = pattern.exec(text)) !== null) {
    matches.push(m[0].trim());
  }
  return [...new Set(matches)];
}

/**
 * Konwersja obiektu surowego z indeksu do kontraktu CanonicalDocument (Sekcja 5 specyfikacji)
 */
export function toCanonicalDocument(raw, index = 0) {
  const title = String(raw.title || raw.name || '').trim();
  const rawUrl = String(raw.url || raw.href || '').trim();
  const canonicalUrl = rawUrl.startsWith('http') ? rawUrl : `https://polskieradio.cc${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`;
  const description = String(raw.description || raw.desc || raw.snippet || '').trim();
  const category = String(raw.category || raw.section || 'ogólne').trim();
  const tags = Array.isArray(raw.tags) ? raw.tags.map(t => String(t).trim()) : [];
  
  // Identyfikator deterministyczny: cc:{typ}:{slug}
  const slug = canonicalUrl
    .replace(/^https?:\/\/[^/]+/i, '')
    .replace(/[^a-z0-9_-]+/gi, '-')
    .replace(/^-+|-+$/g, '') || `item-${index}`;
  const docType = determineDocType(canonicalUrl, category);

  const scriptureRefs = extractScriptureRefs(`${title} ${description}`);

  return {
    id: `cc:${docType}:${slug}`,
    version: 1,
    type: docType,
    title,
    language: 'pl',
    canonical_url: canonicalUrl,
    source_system: determineSourceSystem(canonicalUrl, category),
    published_at: raw.published_at || '2026-10-29T08:00:00+01:00',
    updated_at: raw.updated_at || '2026-10-29T08:00:00+01:00',
    indexed_at: '2026-10-29T08:00:00+01:00',
    status: raw.status || 'published',
    visibility: 'public',
    license: 'owned-or-authorized',
    attribution: 'Christian Culture',
    scripture_refs: scriptureRefs,
    tags,
    category,
    featured: !!raw.featured,
    checksum: `sha256:${simpleHash(`${title}|${canonicalUrl}|${description}`)}`,
    text: description
  };
}

function determineDocType(url, category) {
  const u = url.toLowerCase();
  const c = category.toLowerCase();
  if (u.includes('mojabiblia') || c.includes('biblia') || c.includes('pismo')) return 'scripture';
  if (u.includes('akademia') || u.includes('kurscodzienny') || c.includes('kurs') || c.includes('nauka')) return 'course';
  if (u.includes('news') || u.includes('/art') || c.includes('wiadomości') || c.includes('publicystyka')) return 'article';
  if (u.includes('player') || u.includes('audio') || u.includes('podcast') || c.includes('radio') || c.includes('muzyka')) return 'audio';
  if (u.includes('vod') || u.includes('wideo') || u.includes('film') || c.includes('film')) return 'video';
  if (u.includes('cclite') || u.includes('lumina') || c.includes('aplikacja') || c.includes('społeczność')) return 'app';
  return 'page';
}

function determineSourceSystem(url, category) {
  const u = url.toLowerCase();
  if (u.includes('/news') || u.includes('ccn')) return 'ccn';
  if (u.includes('akademia')) return 'akademia';
  if (u.includes('mojabiblia')) return 'mojabiblia';
  if (u.includes('player')) return 'player';
  if (u.includes('lumina')) return 'lumina';
  if (u.includes('vod')) return 'vod';
  if (u.includes('cclite.pl')) return 'cclite';
  return 'ekocc';
}

function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

/**
 * Pamięciowy rejestr kanoniczny (Lazy-initialized)
 */
let canonicalDocumentsCache = null;

export function getCanonicalDocuments() {
  if (canonicalDocumentsCache) return canonicalDocumentsCache;
  const items = Array.isArray(searchIndexData) ? searchIndexData : (searchIndexData.items || []);
  canonicalDocumentsCache = items
    .filter(item => item && (item.title || item.name))
    .map((item, idx) => toCanonicalDocument(item, idx));
  return canonicalDocumentsCache;
}

/**
 * Wyszukiwanie kanoniczne (BM25-like scoring + dopasowanie słów kluczowych)
 * BEZ WYWOŁYWANIA MODELI GENERATYWNYCH (ZERO COST)
 */
export function searchKnowledgeHub(query = '', options = {}) {
  const docs = getCanonicalDocuments();
  const qNorm = normalizeText(query);
  const lang = String(options.lang || 'pl').toLowerCase();
  const typeFilter = options.type ? String(options.type).toLowerCase() : null;
  const limit = Math.min(50, Math.max(1, parseInt(options.limit, 10) || 10));
  const offset = Math.max(0, parseInt(options.cursor, 10) || 0);

  if (!qNorm) {
    // Puste zapytanie: zwróć materiały wyróżnione (featured)
    const featuredDocs = docs
      .filter(d => d.status === 'published' && (!typeFilter || d.type === typeFilter))
      .filter(d => d.featured)
      .slice(offset, offset + limit);
    return {
      query: '',
      total: featuredDocs.length,
      results: featuredDocs.map(formatSearchResult),
      next_cursor: null,
      index_freshness: '2026-10-29T08:00:00+01:00'
    };
  }

  const queryTokens = qNorm.split(/\s+/).filter(Boolean);

  const scored = [];
  for (const doc of docs) {
    if (doc.status !== 'published') continue;
    if (typeFilter && doc.type !== typeFilter) continue;

    const titleNorm = normalizeText(doc.title);
    const descNorm = normalizeText(doc.text);
    const tagsNorm = doc.tags.map(t => normalizeText(t));
    const scriptureNorm = doc.scripture_refs.map(r => normalizeText(r));

    let score = 0;

    // 1. Dokładne dopasowanie frazy w tytule
    if (titleNorm.includes(qNorm)) score += 100;
    // 2. Dokładne dopasowanie frazy w opisie
    if (descNorm.includes(qNorm)) score += 40;

    // 3. Dopasowanie referencji biblijnej (np. J 3:16)
    for (const ref of scriptureNorm) {
      if (ref.includes(qNorm) || qNorm.includes(ref)) {
        score += 80;
      }
    }

    // 4. Dopasowanie tokenów
    let matchedTokens = 0;
    for (const tok of queryTokens) {
      let hit = false;
      if (titleNorm.includes(tok)) { score += 20; hit = true; }
      if (tagsNorm.some(t => t.includes(tok))) { score += 15; hit = true; }
      if (descNorm.includes(tok)) { score += 5; hit = true; }
      if (hit) matchedTokens++;
    }

    // Wymóg dopasowania przynajmniej połowy słów zapytania
    if (score > 0 && matchedTokens >= Math.ceil(queryTokens.length / 2)) {
      if (doc.featured) score += 10;
      scored.push({ doc, score });
    }
  }

  // Sortowanie: najwyższy wynik punktowy
  scored.sort((a, b) => b.score - a.score);

  const paginated = scored.slice(offset, offset + limit);
  const nextCursor = offset + limit < scored.length ? String(offset + limit) : null;

  return {
    query,
    total: scored.length,
    results: paginated.map(item => formatSearchResult(item.doc, item.score)),
    next_cursor: nextCursor,
    index_freshness: '2026-10-29T08:00:00+01:00'
  };
}

function formatSearchResult(doc, score = 0) {
  return {
    document_id: doc.id,
    type: doc.type,
    title: doc.title,
    url: doc.canonical_url,
    snippet: doc.text.length > 240 ? `${doc.text.slice(0, 237)}...` : doc.text,
    source_type: doc.source_system,
    language: doc.language,
    scripture_refs: doc.scripture_refs,
    license: doc.license,
    attribution: doc.attribution,
    published_at: doc.published_at,
    last_verified_at: doc.updated_at,
    relevance_score: score > 0 ? score : undefined
  };
}

/**
 * Pobranie pojedynczego dokumentu
 */
export function getDocumentById(id) {
  const docs = getCanonicalDocuments();
  return docs.find(d => d.id === id && d.status === 'published') || null;
}

/**
 * Pobranie katalogu tematów
 */
export function getTopicsCatalog(lang = 'pl') {
  const docs = getCanonicalDocuments();
  const categoryCounts = {};
  for (const doc of docs) {
    if (doc.status !== 'published') continue;
    const cat = doc.category || 'Ogólne';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  }
  return Object.entries(categoryCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}
