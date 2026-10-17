#!/usr/bin/env node
/**
 * CC SEO ENGINE — CHRISTIAN CULTURE NETWORK GLOBAL SEO & AI SEARCH 2026
 * Wspólny moduł metadanych, Karty Publikacji, Schema.org JSON-LD,
 * języków (lang / dwustronny hreflang), kanonicznych adresów,
 * rejestru treści oraz walidacji dla wszystkich publicznych portali.
 *
 * Standard: CCN Global SEO & AI Search 2026 v1.0 (ZERO COST / ZERO FAKE DATA)
 */

export const PRIMARY_ORIGIN = 'https://polskieradio.cc';

export const ALLOWED_SCHEMA_TYPES = new Set([
  'NewsArticle',
  'Article',
  'BlogPosting',
  'LearningResource',
  'PodcastEpisode',
  'AudioObject',
  'VideoObject',
  'MusicRecording',
  'ProfilePage',
  'Organization',
  'BreadcrumbList',
  'WebSite',
  'WebPage',
  'NewsMediaOrganization',
]);

export const VERIFIED_AUTHORS = {
  'Cezary Rogowski': {
    name: 'Cezary Rogowski',
    role: 'Założyciel Christian Culture & Redaktor Naczelny CCN',
    avatarUrl: 'https://polskieradio.cc/avatar_cezary_official.jpg',
    profileUrl: 'https://polskieradio.cc/lumina.cezaryrgowski.html',
  },
  'Wioletta Rogowska': {
    name: 'Wioletta Rogowska',
    role: 'Współzałożycielka Christian Culture',
    avatarUrl: 'https://polskieradio.cc/avatar_wioletta_official.jpg',
    profileUrl: 'https://polskieradio.cc/lumina.wiolettarogowska.html',
  },
  'Redakcja Christian Culture': {
    name: 'Redakcja Christian Culture',
    role: 'Zespół Redakcyjny Christian Culture Network',
    avatarUrl: 'https://polskieradio.cc/ccn-logo-square.png',
    profileUrl: 'https://polskieradio.cc/o-nas',
  },
};

export const PRIVATE_OR_NON_INDEXABLE_PATTERNS = [
  /^\/?admin(\/|$)/i,
  /^\/?mission-control(\/|$)/i,
  /^\/?config(\/|$)/i,
  /^\/?scripts(\/|$)/i,
  /^\/?windows_tools(\/|$)/i,
  /^\/?mockups(\/|$)/i,
  /^\/?lumina-login(\.html|\/|$)/i,
  /^\/?lumina-profile(\.html|\/|$)/i,
  /^\/?lumina-app(\.html|\/|$)/i,
  /^\/?lumina\.zbyszekgieron(\.html|\/|$)/i,
  /^\/?mess(\.html|\/|$)/i,
  /^\/?bank-tresci(\.html|\/|$)/i,
  /^\/?content-registry(\.html|\/|$)/i,
  /^\/?karaoke-studio(\.html|\/|$)/i,
  /^\/?koncept-studio(\.html|\/|$)/i,
  /^\/?404(\.html|\/|$)/i,
  /^\/?old_zapolske(\.html|\/|$)/i,
  /^\/?test(\.html|\/|$)/i,
  /(?:live|stream|obs|embed|pilot|cctv24|vertical|widget)/i,
];

/**
 * Sprawdza, czy podana ścieżka lub URL jest publiczna i przeznaczona do indeksacji.
 */
export function isIndexablePublicPath(rawPath, options = {}) {
  if (!rawPath || typeof rawPath !== 'string') return false;
  if (options.isDraft || options.noindex) return false;

  let pathname = rawPath.trim();
  if (pathname.startsWith('http://') || pathname.startsWith('https://')) {
    try {
      const u = new URL(pathname);
      if (u.origin !== PRIMARY_ORIGIN) return false;
      pathname = u.pathname + u.search;
    } catch {
      return false;
    }
  }
  if (pathname.includes('?')) return false; // Parametry zapytań (np. /szukaj?q=...) nie trafiają do indeksów

  const clean = pathname.startsWith('/') ? pathname : `/${pathname}`;
  for (const pattern of PRIVATE_OR_NON_INDEXABLE_PATTERNS) {
    if (pattern.test(clean)) return false;
  }
  // Aliasy artykułów /news/art-* nie są kanonicznymi adresami docelowymi
  if (/^\/news\/art-/i.test(clean)) return false;

  return true;
}

/**
 * Normalizuje adres do postaci kanonicznej https://polskieradio.cc/...
 */
export function toCanonicalUrl(rawPath) {
  if (!rawPath) return `${PRIMARY_ORIGIN}/`;
  let pathname = String(rawPath).trim();
  if (pathname.startsWith(PRIMARY_ORIGIN)) {
    pathname = pathname.slice(PRIMARY_ORIGIN.length);
  }
  pathname = pathname.replace(/\\/g, '/');
  if (!pathname.startsWith('/')) pathname = `/${pathname}`;

  // Usuń końcówki /index.html oraz .html dla Clean URLs (z zachowaniem wyjątków profilowych lumina.*.html)
  if (pathname === '/index.html' || pathname === '/index') {
    return `${PRIMARY_ORIGIN}/`;
  }
  if (/^\/Global\/index\.html$/i.test(pathname) || /^\/Global\/?$/i.test(pathname)) {
    return `${PRIMARY_ORIGIN}/Global/`;
  }
  if (pathname.endsWith('/index.html')) {
    pathname = pathname.slice(0, -'/index.html'.length) || '/';
  } else if (pathname.endsWith('.html') && !/^\/lumina\.[a-z0-9_-]+\.html$/i.test(pathname)) {
    pathname = pathname.slice(0, -'.html'.length) || '/';
  }
  if (pathname.length > 1 && pathname.endsWith('/') && pathname !== '/Global/') {
    pathname = pathname.replace(/\/+$/, '');
  }
  return `${PRIMARY_ORIGIN}${pathname}`;
}

/**
 * Rozwiązuje zweryfikowane dane autora (zakaz fikcyjnych autorów).
 */
export function resolveVerifiedAuthor(authorInput) {
  const name = typeof authorInput === 'string'
    ? authorInput.trim()
    : (authorInput?.name || '').trim();

  if (name.includes('Wioletta Rogowska')) {
    return {
      ...VERIFIED_AUTHORS['Wioletta Rogowska'],
      role: (typeof authorInput === 'object' && authorInput?.role) || VERIFIED_AUTHORS['Wioletta Rogowska'].role,
    };
  }
  if (name.includes('Cezary Rogowski')) {
    return {
      ...VERIFIED_AUTHORS['Cezary Rogowski'],
      role: (typeof authorInput === 'object' && authorInput?.role) || VERIFIED_AUTHORS['Cezary Rogowski'].role,
    };
  }
  if (name === 'Redakcja Christian Culture' || name === 'Christian Culture') {
    return VERIFIED_AUTHORS['Redakcja Christian Culture'];
  }
  throw new Error(`Niedozwolony lub niezweryfikowany autor: "${name}". Dozwoleni wyłącznie prawdziwi autorzy CC.`);
}

/**
 * Buduje dwustronne linki hreflang (pl, en, x-default) wyłącznie wtedy, gdy istnieją realne odpowiedniki.
 */
export function buildHreflangLinks(alternates = {}) {
  const entries = Object.entries(alternates).filter(([, url]) => Boolean(url));
  if (entries.length < 2) return [];

  const links = [];
  for (const [lang, url] of entries) {
    links.push({
      rel: 'alternate',
      hreflang: lang,
      href: toCanonicalUrl(url),
    });
  }
  const defaultUrl = alternates.pl || alternates.en || entries[0][1];
  if (!alternates['x-default'] && defaultUrl) {
    links.push({
      rel: 'alternate',
      hreflang: 'x-default',
      href: toCanonicalUrl(defaultUrl),
    });
  }
  return links;
}

/**
 * Buduje zgodny ze standardem CCN Global SEO & AI Search 2026 obiekt JSON-LD.
 * Blokuje fałszywe oceny, recenzje i niezweryfikowanych autorów.
 */
export function buildStructuredData(spec) {
  const type = spec.type || 'NewsArticle';
  if (!ALLOWED_SCHEMA_TYPES.has(type)) {
    throw new Error(`Nieobsługiwany typ Schema.org: ${type}`);
  }
  if (spec.aggregateRating || spec.review || spec.reviews) {
    throw new Error('ZAKAZ FIKCYJNYCH DANYCH: Nie wolno dodawać nieistniejących ocen ani recenzji do JSON-LD.');
  }

  const canonicalUrl = toCanonicalUrl(spec.canonicalUrl || spec.url);
  const datePublished = spec.datePublished || new Date().toISOString();
  const dateModified = spec.dateModified || datePublished;
  const inLanguage = spec.inLanguage || 'pl-PL';
  const imageUrl = spec.imageUrl
    ? (spec.imageUrl.startsWith('http') ? spec.imageUrl : `${PRIMARY_ORIGIN}${spec.imageUrl.startsWith('/') ? '' : '/'}${spec.imageUrl}`)
    : `${PRIMARY_ORIGIN}/images/milion-og.jpg`;

  if (type === 'NewsArticle' || type === 'Article' || type === 'BlogPosting') {
    const author = resolveVerifiedAuthor(spec.author || 'Cezary Rogowski');
    const articleNode = {
      '@context': 'https://schema.org',
      '@type': type,
      '@id': `${canonicalUrl}#article`,
      headline: spec.headline || spec.title,
      description: spec.description || spec.excerpt,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': canonicalUrl,
      },
      datePublished,
      dateModified,
      inLanguage,
      author: {
        '@type': author.name === 'Redakcja Christian Culture' ? 'Organization' : 'Person',
        name: author.name,
        jobTitle: author.role,
        image: author.avatarUrl,
        url: author.profileUrl,
      },
      publisher: {
        '@type': 'Organization',
        '@id': `${PRIMARY_ORIGIN}/#organization`,
        name: 'Christian Culture',
        url: PRIMARY_ORIGIN,
        logo: {
          '@type': 'ImageObject',
          url: `${PRIMARY_ORIGIN}/ccn-logo-square.png`,
        },
        publishingPrinciples: `${PRIMARY_ORIGIN}/polityka-redakcyjna`,
        correctionsPolicy: `${PRIMARY_ORIGIN}/polityka-redakcyjna#korekty`,
      },
      image: [imageUrl],
      isAccessibleForFree: true,
    };

    if (spec.CategoryLabel || spec.articleSection) {
      articleNode.articleSection = spec.CategoryLabel || spec.articleSection;
    }
    if (spec.speakableSelectors && Array.isArray(spec.speakableSelectors)) {
      articleNode.speakable = {
        '@type': 'SpeakableSpecification',
        cssSelector: spec.speakableSelectors,
      };
    }

    if (spec.breadcrumbs && Array.isArray(spec.breadcrumbs) && spec.breadcrumbs.length > 0) {
      return {
        '@context': 'https://schema.org',
        '@graph': [
          articleNode,
          {
            '@type': 'BreadcrumbList',
            '@id': `${canonicalUrl}#breadcrumb`,
            itemListElement: spec.breadcrumbs.map((b, idx) => ({
              '@type': 'ListItem',
              position: idx + 1,
              name: b.name,
              item: b.item.startsWith('http') ? b.item : toCanonicalUrl(b.item),
            })),
          },
        ],
      };
    }

    return articleNode;
  }

  if (type === 'LearningResource') {
    const author = resolveVerifiedAuthor(spec.author || 'Cezary Rogowski');
    return {
      '@context': 'https://schema.org',
      '@type': 'LearningResource',
      '@id': `${canonicalUrl}#learning-resource`,
      name: spec.headline || spec.title,
      description: spec.description,
      url: canonicalUrl,
      inLanguage,
      learningResourceType: spec.learningResourceType || 'Bible Study Lesson',
      educationalLevel: spec.educationalLevel || 'Beginner to Advanced',
      datePublished,
      dateModified,
      author: {
        '@type': 'Person',
        name: author.name,
        url: author.profileUrl,
      },
      provider: {
        '@type': 'Organization',
        name: 'Akademia Biblijna Christian Culture',
        url: `${PRIMARY_ORIGIN}/akademia`,
      },
      isAccessibleForFree: true,
      ...(spec.bibleReferences ? { about: spec.bibleReferences.map(ref => ({ '@type': 'Thing', name: ref })) } : {}),
    };
  }

  if (type === 'VideoObject') {
    return {
      '@context': 'https://schema.org',
      '@type': 'VideoObject',
      '@id': `${canonicalUrl}#video`,
      name: spec.headline || spec.title,
      description: spec.description,
      thumbnailUrl: [imageUrl],
      uploadDate: datePublished,
      contentUrl: spec.contentUrl || canonicalUrl,
      embedUrl: spec.embedUrl || canonicalUrl,
      inLanguage,
      isAccessibleForFree: true,
      publisher: {
        '@type': 'Organization',
        name: 'Christian Culture',
        url: PRIMARY_ORIGIN,
      },
    };
  }

  if (type === 'AudioObject' || type === 'PodcastEpisode' || type === 'MusicRecording') {
    return {
      '@context': 'https://schema.org',
      '@type': type,
      '@id': `${canonicalUrl}#audio`,
      name: spec.headline || spec.title,
      description: spec.description,
      url: canonicalUrl,
      datePublished,
      inLanguage,
      isAccessibleForFree: true,
      ...(spec.duration ? { duration: spec.duration } : {}),
      ...(spec.contentUrl ? { contentUrl: spec.contentUrl } : {}),
      publisher: {
        '@type': 'Organization',
        name: 'Christian Culture',
        url: PRIMARY_ORIGIN,
      },
    };
  }

  throw new Error(`Brak konstruktora dla typu: ${type}`);
}

/**
 * Waliduje Obowiązkową Kartę Publikacji (Sekcja 3 Standardu).
 */
export function validatePublicationCard(card) {
  const errors = [];
  const warnings = [];

  if (!card || typeof card !== 'object') {
    return { valid: false, errors: ['Brak obiektu Karty Publikacji'], warnings };
  }

  // 1. H1
  if (!card.h1 || typeof card.h1 !== 'string' || card.h1.trim().length < 5) {
    errors.push('Brak rzeczowego i niepowtarzalnego tytułu H1.');
  }

  // 2. SEO title
  const seoTitle = (card.seoTitle || card.title || '').trim();
  if (!seoTitle) {
    errors.push('Brak tytułu SEO (title).');
  } else if (seoTitle.length < 25 || seoTitle.length > 95) {
    warnings.push(`SEO title ma ${seoTitle.length} znaków (zalecane orientacyjnie 50–60 znaków).`);
  }

  // 3. Meta description
  const desc = (card.metaDescription || card.description || '').trim();
  if (!desc || desc.length < 50) {
    errors.push('Brak poprawnego meta description (min. 50 znaków).');
  } else if (desc.length < 110 || desc.length > 220) {
    warnings.push(`Meta description ma ${desc.length} znaków (zalecane orientacyjnie 140–160 znaków).`);
  }

  // 4. URL i canonical
  const canonical = card.canonicalUrl ? toCanonicalUrl(card.canonicalUrl) : '';
  if (!canonical || !canonical.startsWith(`${PRIMARY_ORIGIN}/`)) {
    errors.push('Brak prawidłowego kanonicznego adresu URL (https://polskieradio.cc/...).');
  }

  // 5. Autor i daty
  try {
    resolveVerifiedAuthor(card.author);
  } catch (err) {
    errors.push(err.message);
  }
  if (!card.datePublished || Number.isNaN(Date.parse(card.datePublished))) {
    errors.push('Brak prawidłowej daty publikacji ISO 8601 (datePublished).');
  }

  // 6. Obraz / media
  if (!card.imageUrl || !card.imageAlt || card.imageAlt.trim().length < 5) {
    errors.push('Brak grafiki reprezentującej treść lub brak opisu alternatywnego ALT.');
  }

  // 7. Język
  if (!card.lang || !/^(pl|en)(-|$)/i.test(card.lang)) {
    errors.push('Brak poprawnego oznaczenia języka (lang).');
  }

  // 8. Rozróżnienie: FAKTY / ANALIZA / REFLEKSJA BIBLIJNA (dla artykułów dziennikarskich)
  if (card.requireEditorialSections) {
    if (!card.hasFactsSection) errors.push('Artykuł musi zawierać sekcję faktów ze źródłami.');
    if (!card.hasBiblicalReflection) warnings.push('Zalecane wyraźne wydzielenie refleksji biblijnej od ustaleń dziennikarskich.');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    canonicalUrl: canonical,
  };
}

/**
 * Waliduje wyrenderowany dokument HTML pod kątem krytycznych pól SEO (Sekcja 4 & 12).
 */
export function validateRenderedHtmlSeo(html, expectedCanonicalUrl = null) {
  const errors = [];
  const warnings = [];

  if (!html || typeof html !== 'string') {
    return { valid: false, errors: ['Pusty dokument HTML'], warnings };
  }

  const langMatch = html.match(/<html\s+[^>]*lang=["']([^"']+)["']/i);
  if (!langMatch) errors.push('Brak atrybutu lang w znaczniku <html>.');

  const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
  if (!titleMatch || !titleMatch[1].trim()) errors.push('Brak znacznika <title>.');

  const descMatch = html.match(/<meta\s+[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)
    || html.match(/<meta\s+[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i);
  if (!descMatch || !descMatch[1].trim()) errors.push('Brak meta description.');

  const canonMatch = html.match(/<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)
    || html.match(/<link\s+[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["']/i);
  if (!canonMatch || !canonMatch[1].trim()) {
    errors.push('Brak linku rel="canonical".');
  } else if (expectedCanonicalUrl && canonMatch[1].trim() !== expectedCanonicalUrl) {
    errors.push(`Niezgodny canonical: oczekiwano "${expectedCanonicalUrl}", otrzymano "${canonMatch[1].trim()}".`);
  }

  const robotsMatch = html.match(/<meta\s+[^>]*name=["']robots["'][^>]*content=["']([^"']+)["']/i);
  if (robotsMatch && /noindex/i.test(robotsMatch[1])) {
    errors.push('Wykryto niezamierzony tag noindex na stronie publicznej.');
  }

  const h1Matches = html.match(/<h1[\s>]/gi) || [];
  if (h1Matches.length === 0) {
    errors.push('Brak nagłówka <h1>.');
  } else if (h1Matches.length > 1) {
    warnings.push(`Wykryto ${h1Matches.length} nagłówków <h1> (standard zaleca jeden główny H1).`);
  }

  if (!/<meta\s+[^>]*property=["']og:title["']/i.test(html)) {
    errors.push('Brak tagu Open Graph og:title.');
  }
  if (!/<meta\s+[^>]*name=["']twitter:card["']/i.test(html)) {
    errors.push('Brak tagu Twitter/X Card twitter:card.');
  }

  const ldMatches = [...html.matchAll(/<script\s+[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  if (ldMatches.length === 0) {
    errors.push('Brak danych strukturalnych JSON-LD.');
  } else {
    for (const m of ldMatches) {
      try {
        const parsed = JSON.parse(m[1]);
        const nodes = parsed['@graph'] ? parsed['@graph'] : [parsed];
        for (const n of nodes) {
          if (n.aggregateRating || n.review) {
            errors.push('Wykryto niedozwolone pole aggregateRating/review w JSON-LD.');
          }
          if ((n['@type'] === 'NewsArticle' || n['@type'] === 'Article') && typeof n.mainEntityOfPage === 'string') {
            errors.push('Pole mainEntityOfPage w NewsArticle musi być obiektem {"@type":"WebPage","@id":"..."}.');
          }
          if (n.author && n.author.name === 'Wioletta Rogowska' && n.author.url && n.author.url.includes('cezaryrgowski')) {
            errors.push('Błędny URL profilu autora dla Wioletty Rogowskiej w JSON-LD.');
          }
        }
      } catch (e) {
        errors.push(`Niepoprawny składniowo JSON-LD: ${e.message}`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    extracted: {
      lang: langMatch ? langMatch[1] : null,
      title: titleMatch ? titleMatch[1].trim() : null,
      description: descMatch ? descMatch[1].trim() : null,
      canonical: canonMatch ? canonMatch[1].trim() : null,
    },
  };
}

/**
 * Zarządzanie cyklem życia publikacji w rejestrze pamięciowym/plikowym
 * (tworzenie, aktualizacja z kontrolą lastmod, usuwanie z przekierowaniem 301 lub 410).
 */
export function createPublicationRegistry(initialItems = []) {
  const items = new Map();
  const redirects = new Map();
  const tombstones = new Set();

  for (const item of initialItems) {
    const canon = toCanonicalUrl(item.canonicalUrl || item.url);
    items.set(canon, { ...item, canonicalUrl: canon });
  }

  return {
    create(card) {
      const check = validatePublicationCard(card);
      if (!check.valid) {
        throw new Error(`Walidacja Karty Publikacji nieudana: ${check.errors.join(' ')}`);
      }
      const now = card.datePublished || new Date().toISOString();
      const record = {
        ...card,
        canonicalUrl: check.canonicalUrl,
        datePublished: now,
        dateModified: card.dateModified || now,
        lastmod: (card.dateModified || now).slice(0, 10),
        status: 'PUBLISHED',
        discoveryState: {
          published: true,
          submittedIndexNow: false,
          discovered: false,
          indexed: false,
        },
      };
      items.set(check.canonicalUrl, record);
      tombstones.delete(check.canonicalUrl);
      return record;
    },

    update(canonicalInput, patch, options = { significantChange: true }) {
      const canon = toCanonicalUrl(canonicalInput);
      const existing = items.get(canon);
      if (!existing) {
        throw new Error(`Publikacja nie istnieje w rejestrze: ${canon}`);
      }
      const merged = { ...existing, ...patch, canonicalUrl: canon };
      const check = validatePublicationCard(merged);
      if (!check.valid) {
        throw new Error(`Walidacja aktualizacji nieudana: ${check.errors.join(' ')}`);
      }
      if (options.significantChange) {
        const modIso = patch.dateModified || new Date().toISOString();
        merged.dateModified = modIso;
        merged.lastmod = modIso.slice(0, 10);
      } else {
        merged.dateModified = existing.dateModified;
        merged.lastmod = existing.lastmod;
      }
      items.set(canon, merged);
      return merged;
    },

    remove(canonicalInput, options = { redirectTo: null }) {
      const canon = toCanonicalUrl(canonicalInput);
      if (!items.has(canon)) {
        throw new Error(`Publikacja nie istnieje w rejestrze: ${canon}`);
      }
      if (options.redirectTo) {
        const target = toCanonicalUrl(options.redirectTo);
        if (target === `${PRIMARY_ORIGIN}/`) {
          throw new Error('ZAKAZ SEO: Nie wolno przekierowywać usuniętych artykułów ani błędów na stronę główną.');
        }
        items.delete(canon);
        redirects.set(canon, { status: 301, target });
        return { action: 'REDIRECT_301', from: canon, to: target };
      }
      items.delete(canon);
      tombstones.add(canon);
      return { action: 'GONE_410', url: canon };
    },

    resolveStatus(urlInput) {
      const canon = toCanonicalUrl(urlInput);
      if (items.has(canon)) return { httpStatus: 200, record: items.get(canon) };
      if (redirects.has(canon)) return { httpStatus: 301, redirectTo: redirects.get(canon).target };
      if (tombstones.has(canon)) return { httpStatus: 410 };
      return { httpStatus: 404 };
    },

    listPublic() {
      return [...items.values()].filter(it => isIndexablePublicPath(it.canonicalUrl, it));
    },
  };
}
