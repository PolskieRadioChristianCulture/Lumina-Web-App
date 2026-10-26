/**
 * ══════════════════════════════════════════════════════════════════════════
 * CHRISTIAN CULTURE & LUMINA — CCOmniSearch (@w = wyszukiwarka)
 * Plik: /components/cc-omni-search.js
 * 
 * Centralny silnik inteligentnego wyszukiwania dla całego ekosystemu CC:
 * - Podpina wszystkie lupy, pola wyszukiwania i skrót Ctrl+K / '/' w ekosystemie.
 * - Błyskawiczne sugerowanie (<2ms) już od pierwszej wpisanej litery.
 * - Inteligentne rozpoznawanie kontekstu (Przewodnik Tematyczny Ekosystemu dla
 *   haseł takich jak: nadzieja, werset dnia, modlitwa, lęk, apokalipsa, dekalog itp.).
 * - Posegregowane wyniki w 6 kategoriach zgodnych z architekturą CC:
 *   1. 🌐 Moduły & Platformy
 *   2. 📖 Słowo Boże & Rozważania
 *   3. 📻 Audycje & Muzyka
 *   4. 🎬 Kino VOD & Kanały
 *   5. 📰 Wiedza & Publicystyka
 *   6. 👤 Profile & Społeczność
 * - Ergonomia dotyku min. 44px, wysoki kontrast, zero zewnętrznych zależności,
 *   wsparcie motywu ciemnego i jasnego, 100% Zero-QA.
 * ══════════════════════════════════════════════════════════════════════════
 */

(function () {
  'use strict';

  if (window.CCOmniSearchInitialized) return;
  window.CCOmniSearchInitialized = true;

  // 1. Sprawdzenie czy jesteśmy na dedykowanej stronie /szukaj
  const isSearchPage = /^\/szukaj(?:\/|\.html)?$/i.test(window.location.pathname);

  // 2. Globalny stan wyszukiwarki
  let catalogData = window.__ccSearchCatalog || null;
  let isCatalogLoading = false;
  let activeIndex = -1;
  let currentResults = [];
  let currentQuery = '';
  let activeFilter = 'all';

  // 3. Normalizacja polskich znaków i tekstu
  function normalizeStr(str) {
    if (!str) return '';
    return str
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ł/g, 'l')
      .trim();
  }

  function containsTerm(text, term) {
    return term.length <= 3 ? text.split(/[^a-z0-9]+/).includes(term) : text.includes(term);
  }

  function breadcrumbOf(rawUrl) {
    try {
      const u = new URL(rawUrl, 'https://polskieradio.cc');
      const parts = u.pathname.split('/').filter(Boolean).map(p => { try { return decodeURIComponent(p); } catch (_) { return p; } }).map(p => p.replace(/\.html$/, ''));
      return [u.hostname.replace(/^www\./, '')].concat(parts.slice(0, 3)).join(' › ');
    } catch (_) {
      return '';
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function highlightMatches(text, query) {
    if (!text || !query) return escapeHtml(text);
    const escapedText = escapeHtml(text);
    const words = query
      .split(/\s+/)
      .map(w => w.trim())
      .filter(w => w.length > 0);
    if (!words.length) return escapedText;

    try {
      const pattern = words
        .map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        .join('|');
      const regex = new RegExp(`(${pattern})`, 'gi');
      return escapedText.replace(regex, '<mark class="cc-omni-hl">$1</mark>');
    } catch {
      return escapedText;
    }
  }

  // 4. Pobieranie katalogu (z cache)
  async function loadCatalog() {
    if (catalogData && catalogData.items) return catalogData;
    if (isCatalogLoading) {
      return new Promise(resolve => {
        const interval = setInterval(() => {
          if (catalogData && catalogData.items) {
            clearInterval(interval);
            resolve(catalogData);
          }
        }, 50);
      });
    }

    isCatalogLoading = true;
    const paths = ['/szukaj/catalog.json', '/data/cc-search-index.json'];
    for (const p of paths) {
      try {
        const resp = await fetch(p, { cache: 'default' });
        if (resp.ok) {
          const json = await resp.json();
          catalogData = json.items ? json : { items: Array.isArray(json) ? json : [], contextGuides: {} };
          window.__ccSearchCatalog = catalogData;
          isCatalogLoading = false;
          return catalogData;
        }
      } catch {
        // Spróbuj kolejnej ścieżki
      }
    }
    isCatalogLoading = false;
    catalogData = { items: [], contextGuides: {} };
    return catalogData;
  }

  // 5. Dopasowanie kategorii do 6 filarów ekosystemu CC
  function categorizeItem(item) {
    const cat = item.category || '';
    const url = item.url || '';
    const title = item.title || '';

    if (item.type === 'profile' || cat.includes('Społeczność') || url.includes('/lumina.') || title.startsWith('Profil:')) {
      return { group: 'community', name: 'Profile & Społeczność', icon: '👤' };
    }
    if (item.type === 'reflection' || cat.includes('Biblia') || url.includes('/werset-dnia') || url.includes('/mojabiblia') || title.includes('Rozważanie') || title.includes('Werset')) {
      return { group: 'bible', name: 'Słowo Boże & Rozważania', icon: '📖' };
    }
    if (cat.includes('Radio') || url.includes('radio') || url.includes('cctv24') || url.includes('player') || title.includes('Muzyka') || title.includes('Audycja') || title.includes('Śniadaniowa')) {
      return { group: 'radio', name: 'Audycje & Muzyka', icon: '📻' };
    }
    if (cat.includes('Media') || url.includes('/vod') || url.includes('/kino') || title.includes('Film') || title.includes('VOD')) {
      return { group: 'vod', name: 'Kino VOD & Kanały', icon: '🎬' };
    }
    if (cat.includes('Portale') || cat.includes('Artykuły') || cat.includes('Wiedza') || url.includes('/news') || url.includes('/nauka') || url.includes('/historia') || url.includes('/biologia') || url.includes('/prawo') || url.includes('/seks')) {
      return { group: 'news', name: 'Wiedza & Publicystyka', icon: '📰' };
    }
    return { group: 'modules', name: 'Moduły & Platformy', icon: '🌐' };
  }

  // 6. Słownik synonimów i powiązań semantycznych ekosystemu Christian Culture
  const SYNONYM_MAP = {
    // Lekcje, rozważania i studia
    'lekcja': ['lekcje', 'lekcji', 'rozważanie', 'rozwazanie', 'inspiracja', 'kurs', 'studium', 'dzień', 'dzien', 'nauka'],
    'lekcje': ['lekcja', 'rozważania', 'kursy', 'studia'],
    'lekcji': ['lekcja', 'rozważania', 'kursy'],
    'rozwazanie': ['rozważanie', 'rozwazania', 'lekcja', 'inspiracja', 'słowo na dziś', 'werset dnia', 'dobrze że jesteś', 'dzień', 'dzien'],
    'rozważanie': ['rozwazanie', 'lekcja', 'inspiracja', 'słowo na dziś', 'werset dnia', 'dobrze że jesteś', 'dzień', 'dzien'],
    'rozwazania': ['rozważania', 'rozważanie', 'lekcje', 'inspiracje'],
    'rozważania': ['rozwazania', 'rozważanie', 'lekcje', 'inspiracje'],
    'rozwzanie': ['rozważanie', 'rozwazanie', 'lekcja', 'inspiracja'], // tolerancja częstej literówki
    'inspiracja': ['rozważanie', 'lekcja', 'słowo na dziś', 'poranna', 'cytat'],
    'kurs': ['akademia', 'lekcja', '28 kroków', 'kurs codzienny', 'studium', 'formacja'],
    'kursy': ['akademia', 'lekcje', '28 kroków', 'kurs codzienny'],
    'akademia': ['kurs', 'lekcja', 'biblijna', '28 kroków', 'z biblią za pan brat', 'studium'],
    'dzien': ['dzień', 'lekcja', 'rozważanie', 'dziś', 'dzisiaj', 'werset'],
    'dzień': ['dzien', 'lekcja', 'rozważanie', 'dziś', 'dzisiaj', 'werset'],

    // Dynamiczny kontekst daty i dnia bieżącego
    'dzis': ['dziś', 'dzisiaj', 'na dziś', 'dzisiejsza', 'aktualna', 'bieżąca'],
    'dziś': ['dzis', 'dzisiaj', 'na dziś', 'dzisiejsza', 'aktualna', 'bieżąca'],
    'dzisiaj': ['dziś', 'dzis', 'na dziś', 'dzisiejsza'],

    // Pismo Święte
    'biblia': ['pismo święte', 'słowo boże', 'ewangelia', 'mojabiblia', 'interlinearna', 'werset'],
    'pismo': ['biblia', 'słowo boże', 'pismo święte'],
    'werset': ['słowo', 'cytat', 'mojabiblia', 'werset dnia', 'pismo'],

    // Muzyka, Radio & Transmisje
    'muzyka': ['worship', 'pieśni', 'uwielbienie', 'radio', 'ambient', 'sleep', 'hymny', 'karaoke'],
    'worship': ['uwielbienie', 'pieśni', 'muzyka', 'cctv24 worship', 'live', 'karaoke', 'worship mode'],
    'spiewana': ['śpiewana', 'biblia śpiewana', 'muzyka', 'pieśni', 'karaoke', 'śpiewnik'],
    'śpiewana': ['spiewana', 'biblia śpiewana', 'muzyka', 'pieśni', 'karaoke', 'śpiewnik'],
    'karaoke': ['śpiewnik', 'spiewnik', 'biblijne uwielbienie', 'biblia śpiewana', 'uwielbienie', 'worship mode', 'tekst pieśni', 'śpiewaj'],
    'spiewnik': ['śpiewnik', 'karaoke', 'biblijne uwielbienie', 'pieśni', 'tekst pieśni', 'uwielbienie', 'worship', 'śpiewaj'],
    'śpiewnik': ['spiewnik', 'karaoke', 'biblijne uwielbienie', 'pieśni', 'tekst pieśni', 'uwielbienie', 'worship', 'śpiewaj'],
    'uwielbienie': ['karaoke', 'śpiewnik', 'spiewnik', 'worship', 'pieśni', 'muzyka', 'cctv24 worship', 'live', 'biblijne uwielbienie'],
    'radio': ['stacja', 'audycja', 'transmisja', 'live', 'cctv24', 'śniadaniowa', 'zapolske'],
    'audycja': ['radio', 'podcast', 'śniadaniowa', 'nagrania'],

    // Filmy i VOD
    'film': ['kino', 'vod', 'wideo', 'filmy', 'seans'],
    'kino': ['vod', 'film', 'filmy', 'kino chrześcijańskie'],
    'vod': ['kino', 'film', 'filmy', 'wideo'],
    'apokalipsa': ['objawienie', 'proroctwo', 'palla', 'czasy ostateczne', 'alfred palla'],

    // Społeczność LUMINA
    'spolecznosc': ['społeczność', 'lumina', 'profil', 'tablica', 'czat', 'posty'],
    'społeczność': ['spolecznosc', 'lumina', 'profil', 'tablica', 'czat', 'posty'],
    'lumina': ['społeczność', 'profil', 'tablica', 'portal', 'posty', 'czat'],

    // Modlitwa & Wstawiennictwo
    'modlitwa': ['wstawiennictwo', 'za polskę', 'intencje', 'modlitwy', 'zjednoczeni'],
    'intencja': ['modlitwa', 'wstawiennictwo'],

    // Aplikacje & Narzędzia
    'aplikacja': ['cclite', 'cclite.pl', 'apka', 'pwa', 'mobile', 'dobrze że jesteś'],
    'apka': ['aplikacja', 'cclite', 'cclite.pl', 'mobile'],

    // Sklep & Zasoby
    'sklep': ['koszyk', 'zamówienie', 'współpraca', 'książki', 'literatura'],
    'ksiazki': ['książki', 'sklep', 'biblioteka', 'literatura'],
    'książki': ['ksiazki', 'sklep', 'biblioteka', 'literatura'],

    // Finanse, Gospodarka & Wolność (CCN Finanse / Specyfikacja § 6)
    'cbdc': ['cyfrowy pieniądz', 'cyfrowy pieniadz', 'waluta banku centralnego', 'pieniądz programowalny', 'nadzór finansowy', 'gotówka', 'prawo niedzielne', 'apokalipsa 13'],
    'pieniadz': ['pieniądz', 'cbdc', 'waluta', 'finanse', 'gotówka', 'płatności', 'budżet', 'szafarz'],
    'pieniądz': ['pieniadz', 'cbdc', 'waluta', 'finanse', 'gotówka', 'płatności', 'budżet', 'szafarz'],
    'gotowka': ['gotówka', 'cbdc', 'cyfrowy pieniądz', 'płatności', 'wolność finansowa'],
    'gotówka': ['gotowka', 'cbdc', 'cyfrowy pieniądz', 'płatności', 'wolność finansowa'],
    'niedzielne': ['prawo niedzielne', 'sabat', 'szabat', 'wolność religijna', 'apokalipsa 13', 'dzień święty'],
    'wolnosc': ['wolność', 'wolność religijna', 'wolność sumienia', 'prawa obywatelskie'],
    'wolność': ['wolnosc', 'wolność religijna', 'wolność sumienia', 'prawa obywatelskie'],

    // Etyka publiczna, Polityka & Państwo (Specyfikacja § 6)
    'polityka': ['państwo i kościół', 'wolność sumienia', 'etyka publiczna', 'prawo religijne', 'rząd', 'władza'],
    'panstwo': ['państwo', 'polityka', 'władza', 'prawo', 'obywatel'],
    'państwo': ['panstwo', 'polityka', 'władza', 'prawo', 'obywatel'],

    // Nowe technologie, Sztuczna Inteligencja & Praca (Specyfikacja § 6)
    'ai': ['sztuczna inteligencja', 'si', 'automatyzacja', 'technologia', 'etyka technologii', 'praca', 'algorytmy'],
    'praca': ['automatyzacja', 'zawód', 'etyka pracy', 'bezrobocie', 'ai', 'zarządzanie'],
    'automatyzacja': ['ai', 'technologia', 'praca', 'robotyzacja']
  };

  // Damerau-Levenshtein distance (tolerancja literówek i przestawień liter)
  function levenshteinDist(a, b) {
    if (a === b) return 0;
    const la = a.length;
    const lb = b.length;
    if (!la) return lb;
    if (!lb) return la;
    if (Math.abs(la - lb) > 2) return 99;

    const d = [];
    for (let i = 0; i <= la; i++) d[i] = [i];
    for (let j = 1; j <= lb; j++) d[0][j] = j;

    for (let i = 1; i <= la; i++) {
      for (let j = 1; j <= lb; j++) {
        const cost = a.charAt(i - 1) === b.charAt(j - 1) ? 0 : 1;
        d[i][j] = Math.min(
          d[i - 1][j] + 1,       // deletion
          d[i][j - 1] + 1,       // insertion
          d[i - 1][j - 1] + cost // substitution
        );
        if (i > 1 && j > 1 && a.charAt(i - 1) === b.charAt(j - 2) && a.charAt(i - 2) === b.charAt(j - 1)) {
          d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1); // transposition (np. bilbia -> biblia)
        }
      }
    }
    return d[la][lb];
  }

  function isFuzzyWordMatch(word, targetWord) {
    if (!word || !targetWord) return false;
    if (word === targetWord) return true;
    const maxDist = word.length <= 4 ? 1 : 2;
    return levenshteinDist(word, targetWord) <= maxDist;
  }

  // Rozszerzanie zapytania o synonimy i rozpoznawanie zapytań "na dziś"
  function expandQueryTerms(normQuery, queryWords) {
    const synonymsList = [];
    for (const w of queryWords) {
      if (SYNONYM_MAP[w]) {
        for (const syn of SYNONYM_MAP[w]) {
          synonymsList.push(normalizeStr(syn));
        }
      }
    }

    const isTodayQuery = /\b(dzis|dzisiaj|na dzis|dzisiejsz\w*)\b/.test(normQuery);
    const now = new Date();
    const todayDayNum = now.getDate(); // np. 15

    return {
      synonyms: Array.from(new Set(synonymsList)),
      isTodayQuery,
      todayDayNum
    };
  }

  // Inteligentne propozycje bliskoznaczne gdy brak bezpośredniego wyniku
  function findNearSuggestions(normQuery, queryWords, filter) {
    if (!catalogData || !catalogData.items || !catalogData.items.length) return [];

    const isLessonRelated = queryWords.some(w => ['lekcja', 'lekcje', 'lekcji', 'dzien', 'dzień', 'rozwazanie', 'rozważanie', 'kurs', 'studium', 'akademia'].includes(w));
    const now = new Date();
    const todayDay = now.getDate(); // np. 15
    const suggestions = [];
    const seenUrls = new Set();

    function addSuggestion(item) {
      if (!item || seenUrls.has(item.url)) return;
      seenUrls.add(item.url);
      const meta = categorizeItem(item);
      if (filter !== 'all' && meta.group !== filter) return;
      suggestions.push(Object.assign({}, item, { _meta: meta, isNearMatch: true }));
    }

    // 1. Jeśli zapytanie dotyczyło lekcji/rozważań/kursu — zaproponuj dzisiejszą lekcję (Dzień 15), Kurs 28 Kroków i Werset Dnia
    if (isLessonRelated) {
      // Dzień bieżący w kursie codziennym (np. Dzień 15 / Lekcja 15 na dziś)
      const todayLesson = publicSearchItems().find(i => {
        const t = normalizeStr(i.title);
        return t.includes(`dzien ${todayDay}`) || t.includes(`lekcja ${todayDay}`);
      });
      if (todayLesson) addSuggestion(todayLesson);

      // Lekcja fundamentalna 28 Kroków
      const fundLesson = publicSearchItems().find(i => normalizeStr(i.title).includes(`lekcja ${todayDay}:`)) ||
                         publicSearchItems().find(i => normalizeStr(i.title).includes('lekcja 01:') || normalizeStr(i.title).includes('lekcja 1:'));
      if (fundLesson) addSuggestion(fundLesson);

      // Mój Werset Dnia
      const werset = publicSearchItems().find(i => normalizeStr(i.title).includes('werset dnia'));
      if (werset) addSuggestion(werset);

      // Kurs Codzienny / Akademia
      const akademia = publicSearchItems().find(i => (i.url || '').includes('/akademia'));
      if (akademia) addSuggestion(akademia);
    }

    // 2. Przeszukanie katalogu pod kątem częściowych słów lub tolerancji literówek
    for (const item of publicSearchItems()) {
      if (suggestions.length >= 6) break;
      const normTitle = normalizeStr(item.title);
      const normTags = normalizeStr(Array.isArray(item.tags) ? item.tags.join(' ') : (item.tags || ''));
      const text = `${normTitle} ${normTags}`;
      const words = text.split(/\s+/);

      const hasPartialOrFuzzy = queryWords.some(qw => {
        if (qw.length >= 3 && text.includes(qw)) return true;
        return qw.length >= 4 && words.some(w => isFuzzyWordMatch(qw, w));
      });

      if (hasPartialOrFuzzy) {
        addSuggestion(item);
      }
    }

    // 3. Fallback do głównych filarów ekosystemu
    if (suggestions.length < 4) {
      for (const item of publicSearchItems()) {
        if (suggestions.length >= 6) break;
        if (item.featured) addSuggestion(item);
      }
    }

    return suggestions.slice(0, 8);
  }

  function publicSearchItems() {
    return (catalogData?.items || []).filter(item =>
      (!item.access || item.access === 'public') &&
      (!item.visibility || item.visibility === 'public') &&
      !['draft', 'unpublished', 'private', 'removed'].includes(item.status));
  }

  // 7. Inteligentne wyszukiwanie w pamięci (<2ms)
  function publicationTime(item) {
    const iso = item.publishedAt || item.updatedAt;
    if (iso && Number.isFinite(Date.parse(iso))) return Date.parse(iso);
    const months = ['stycznia','lutego','marca','kwietnia','maja','czerwca','lipca','sierpnia','wrzesnia','pazdziernika','listopada','grudnia'];
    const match = normalizeStr(item.date || '').match(/^(\d{1,2}) (\S+) (\d{4})$/);
    if (match && months.includes(match[2])) return Date.UTC(+match[3], months.indexOf(match[2]), +match[1]);
    return 0;
  }

  function performSearch(query, filter = 'all', limit = 16) {
    if (!catalogData || !catalogData.items) return { items: [], guide: null, isSuggestion: false, suggestionNote: null };

    let normQuery = normalizeStr(query).replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
    const cbdcAliases = ['cyfrowy pieniadz', 'waluta banku centralnego', 'central bank digital currency'];
    if (cbdcAliases.includes(normQuery)) normQuery = 'cbdc';
    if (!normQuery) {
      return {
        items: publicSearchItems().filter(i => i.featured).slice(0, 8).map(i => Object.assign({}, i, { _meta: categorizeItem(i) })),
        guide: null,
        isSuggestion: false,
        suggestionNote: null
      };
    }

    if (/^(najnowsze (artykuly|publikacje)( cc)?|latest (articles|publications)( cc)?)$/.test(normQuery)) {
      const seen = new Set();
      const items = publicSearchItems().filter(i => i.type === 'article' && publicationTime(i) > 0)
        .filter(i => filter === 'all' || categorizeItem(i).group === filter)
        .sort((a, b) => publicationTime(b) - publicationTime(a))
        .filter(i => { const key = new URL(i.url, 'https://polskieradio.cc').href; if (seen.has(key)) return false; seen.add(key); return true; })
        .slice(0, limit).map(i => Object.assign({}, i, { _meta: categorizeItem(i) }));
      return { items, guide: null, isSuggestion: false, suggestionNote: null };
    }
    const ignoredWords = new Set(['w','z','na','o','do','i','a','oraz','czyli','dla','ze','za','po','od','czy','the','and','of','is']);
    const queryWords = normQuery.split(/\s+/).filter(w => w && !ignoredWords.has(w));
    if (!queryWords.length) return { items: [], guide: null, isSuggestion: false, suggestionNote: null };
    const { synonyms, isTodayQuery, todayDayNum } = expandQueryTerms(normQuery, queryWords);
    const numberTokens = queryWords.filter(w => /^\d+$/.test(w));

    // Sprawdzenie przewodnika tematycznego
    let matchedGuide = null;
    if (catalogData.contextGuides) {
      for (const [key, g] of Object.entries(catalogData.contextGuides)) {
        const keyNorm = normalizeStr(key);
        const match = queryWords.some(w => keyNorm.includes(w) || (g.keywords && g.keywords.some(k => normalizeStr(k).includes(w))));
        if (match) {
          matchedGuide = g;
          break;
        }
      }
    }

    const scored = [];
    for (const item of publicSearchItems()) {
      const meta = categorizeItem(item);
      if (filter !== 'all' && meta.group !== filter) continue;

      const normTitle = normalizeStr(item.title);
      const normDesc = normalizeStr(item.description);
      const normTags = normalizeStr(Array.isArray(item.tags) ? item.tags.join(' ') : (item.tags || ''));
      const normContent = normalizeStr(item.contentSnippet || item.fullText || '');
      const itemUrl = normalizeStr(item.url || '');
      const allItemText = `${normTitle} ${normTags} ${normDesc} ${normContent}`;
      const itemWords = allItemText.split(/\s+/).filter(Boolean);

      let score = 0;

      // Dokładne dopasowanie frazy w tytule
      if (normTitle === normQuery) score += 140;
      else if (normTitle.startsWith(normQuery)) score += 90;
      else if (containsTerm(normTitle, normQuery)) score += 60;
      else if (containsTerm(normTags, normQuery)) score += 40;

      // Słowa zapytania z tolerancją literówek
      let primaryWordsMatched = 0;
      for (const w of queryWords) {
        if (containsTerm(normTitle, w)) {
          score += 35;
          primaryWordsMatched++;
        } else if (containsTerm(normTags, w)) {
          score += 25;
          primaryWordsMatched++;
        } else if (containsTerm(normDesc, w)) {
          score += 15;
          primaryWordsMatched++;
        } else if (containsTerm(normContent, w)) {
          score += 8;
          primaryWordsMatched++;
        } else if (w.length >= 4 && itemWords.some(iw => isFuzzyWordMatch(w, iw))) {
          // Dopasowanie literówki (np. "rozwżanie" -> "rozważanie")
          score += 28;
          primaryWordsMatched++;
        }
      }

      // Bonus za synonimy
      for (const syn of synonyms) {
        if (containsTerm(normTitle, syn)) score += 20;
        else if (containsTerm(normTags, syn)) score += 12;
      }

      // Specjalne dopasowanie dla zapytań o materiał "na dziś" (np. Lekcja 15 na dziś)
      if (isTodayQuery && todayDayNum) {
        const dayStr = String(todayDayNum);
        const dayPadded = todayDayNum < 10 ? '0' + todayDayNum : String(todayDayNum);
        if (normTitle.includes(dayStr) || normTags.includes(dayStr) || itemUrl.includes(`dzien-${dayPadded}`)) {
          score += 55;
        }
      }

      // Jeśli użytkownik podał konkretną liczbę (np. "15"), dopasowanie tej dokładnej liczby w tytule ma priorytet
      for (const num of numberTokens) {
        if (normTitle.includes(`lekcja ${num}`) || normTitle.includes(`dzien ${num}`) || normTitle.includes(` ${num}:`) || normTitle.includes(` ${num} `) || normTitle.endsWith(` ${num}`)) {
          score += 90;
        } else if (normTitle.includes(num)) {
          score += 45;
        }
      }

      if (primaryWordsMatched === queryWords.length && queryWords.length > 1) {
        score += 25;
      }
      if (score > 0) {
        if (item.featured) score += 10;
        scored.push({ item, score, meta, primaryWordsMatched });
      }
    }

    // Analiza czy w zapytaniu występuje konkretny numer (np. 15, 99)
    const stopWords = new Set(['w', 'z', 'na', 'o', 'do', 'i', 'a', 'oraz', 'czyli', 'dla', 'ze', 'za', 'po', 'od']);
    const significantWords = queryWords.filter(w => !stopWords.has(w));

    let missingNumberToken = null;

    if (scored.length > 0) {
      scored.sort((a, b) => b.score - a.score);
      const seen = new Set();
      for (let i = 0; i < scored.length;) {
        const key = new URL(scored[i].item.url, 'https://polskieradio.cc').href;
        if (seen.has(key)) scored.splice(i, 1);
        else { seen.add(key); i++; }
      }

      // Sprawdzenie czy numer z zapytania rzeczywiście istnieje w wynikach
      if (numberTokens.length > 0) {
        for (const num of numberTokens) {
          const numFound = scored.some(s => {
            const t = normalizeStr(s.item.title);
            const tags = normalizeStr(Array.isArray(s.item.tags) ? s.item.tags.join(' ') : (s.item.tags || ''));
            const u = normalizeStr(s.item.url || '');
            return t.includes(num) || tags.includes(num) || u.includes(num);
          });
          if (!numFound) {
            missingNumberToken = num;
            break;
          }
        }
      }

      // Jeśli w zapytaniu był konkretny numer (np. Lekcja 99), którego nie ma w ekosystemie:
      if (missingNumberToken) {
        const todayDay = new Date().getDate();
        const todayItem = publicSearchItems().find(i => normalizeStr(i.title).includes(`dzien ${todayDay}`) || normalizeStr(i.title).includes(`lekcja ${todayDay}`));
        const otherScored = scored.filter(s => !todayItem || s.item.url !== todayItem.url).map(s => Object.assign({}, s.item, { _meta: s.meta, isNearMatch: true }));
        const suggestionList = todayItem
          ? [Object.assign({}, todayItem, { _meta: categorizeItem(todayItem), isNearMatch: true }), ...otherScored.slice(0, 15)]
          : scored.slice(0, 16).map(s => Object.assign({}, s.item, { _meta: s.meta, isNearMatch: true }));

        return {
          items: suggestionList,
          guide: matchedGuide,
          isSuggestion: true,
          suggestionNote: `Nie znaleziono w ekosystemie materiału z numerem ${missingNumberToken}. Proponujemy aktualną Lekcję ${todayDay} na dziś oraz dostępne lekcje biblijne:`
        };
      }

      // Sprawdzenie czy przynajmniej jeden wynik pokrywa wszystkie istotne słowa lub ma wysoki score
      const hasExactOrAllWordsMatch = scored.some(s => {
        if (s.score >= 90) return true;
        if (significantWords.length <= 1) return s.primaryWordsMatched >= 1;
        return s.primaryWordsMatched >= significantWords.length;
      });

      // Jeśli zapytanie wielowyrazowe nie znalazło pełnego pokrycia
      if (!hasExactOrAllWordsMatch && significantWords.length >= 2) {
        return {
          items: scored.slice(0, limit).map(s => Object.assign({}, s.item, { _meta: s.meta, isNearMatch: true })),
          guide: matchedGuide,
          isSuggestion: true,
          suggestionNote: `Brak pełnego dopasowania dla wszystkich słów. Proponujemy najbardziej zbliżone materiały z ekosystemu:`
        };
      }

      return {
        items: scored.slice(0, limit).map(s => Object.assign({}, s.item, { _meta: s.meta, isNearMatch: s.primaryWordsMatched < queryWords.length })),
        guide: matchedGuide,
        isSuggestion: false,
        suggestionNote: null
      };
    }

    // Gdy brak bezpośrednich wyników — sugeruj bliskoznaczną propozycję
    const nearSuggestions = findNearSuggestions(normQuery, queryWords, filter);
    const isLessonQuery = queryWords.some(w => ['lekcja', 'lekcje', 'lekcji', 'dzien', 'dzień', 'rozwazanie', 'rozważanie', 'kurs'].includes(w));
    
    let note = `Nie znaleźliśmy bezpośredniego dopasowania dla «${query}». Proponujemy bliskoznaczne materiały z ekosystemu Christian Culture:`;
    if (isLessonQuery) {
      const todayDay = new Date().getDate();
      note = `Nie znaleziono dokładnie tego numeru lekcji. Proponujemy aktualną Lekcję ${todayDay} na dziś oraz powiązane studia biblijne:`;
    }

    return {
      items: nearSuggestions,
      guide: matchedGuide,
      isSuggestion: true,
      suggestionNote: note
    };
  }

  // 7. Tworzenie elementów interfejsu (CSS + Modal)
  function ensureStyles() {
    if (document.getElementById('cc-omni-search-styles')) return;
    const style = document.createElement('style');
    style.id = 'cc-omni-search-styles';
    style.textContent = `
      /* Wyszukiwarka ekosystemu — ekran startowy jak Google, kolory EkoCC (@007, wzór L0 26.10.2026). */
      #ccOmniOverlay {
        --omni-gold: #FF7A00; /* kolor akcji CC (standard L0 26.10.2026) */
        --omni-gold-hover: #FF8C33;
        --omni-gold-deep: #E66A00;
        --omni-ink: #F3E5C8;
        --omni-muted: #b9b0a0;
        --omni-title: #E2CC9A;
        --omni-line: rgba(196, 163, 90, 0.32);
        --omni-paper: #ffffff;
        --omni-paper-ink: #1f1a12;
        --omni-paper-muted: #6b6457;
        position: fixed;
        inset: 0;
        z-index: 999999;
        background: #05070c url('/images/search/andromeda-1600.webp') center / cover no-repeat fixed;
        overflow-y: auto;
        overscroll-behavior: contain;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.2s ease-out, visibility 0.2s;
        box-sizing: border-box;
        font-family: "Outfit", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      }
      #ccOmniOverlay::before {
        content: "";
        position: fixed;
        inset: 0;
        background: radial-gradient(circle at 50% 38%, rgba(5, 7, 12, 0.25) 0%, rgba(3, 4, 8, 0.88) 100%);
        pointer-events: none;
      }
      @media (max-width: 640px) {
        #ccOmniOverlay { background-image: url('/images/search/andromeda-800.webp'); }
      }
      #ccOmniOverlay.cc-open {
        opacity: 1;
        visibility: visible;
      }
      #ccOmniModal {
        position: relative;
        width: 100%;
        max-width: 760px;
        min-height: 100%;
        margin: 0 auto;
        padding: 0 16px;
        color: var(--omni-ink);
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
      }
      .cc-omni-top {
        display: flex;
        justify-content: flex-end;
        padding: max(env(safe-area-inset-top), 12px) 0 0;
      }
      .cc-omni-btn {
        background: transparent;
        border: 0;
        border-radius: 50%;
        color: var(--omni-ink);
        cursor: pointer;
        min-width: 44px;
        min-height: 44px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: color 0.15s, background-color 0.15s;
        touch-action: manipulation;
        padding: 0;
        flex-shrink: 0;
      }
      .cc-omni-btn:hover, .cc-omni-btn:focus-visible {
        color: var(--omni-gold);
        background: rgba(255, 255, 255, 0.1);
        outline: none;
      }
      .cc-omni-hero {
        text-align: center;
        padding: 9vh 0 28px;
      }
      .cc-omni-brand {
        margin: 0;
        font-size: clamp(2.3rem, 9vw, 4rem);
        font-weight: 800;
        letter-spacing: -0.02em;
        line-height: 1.05;
        color: transparent;
        background: linear-gradient(90deg, #ffffff 0%, #f3e5c8 55%, #c4a35a 100%);
        -webkit-background-clip: text;
        background-clip: text;
        filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.8));
      }
      .cc-omni-header {
        padding: 0;
      }
      .cc-omni-field {
        display: flex;
        align-items: center;
        gap: 8px;
        min-height: 56px;
        padding: 0 8px 0 20px;
        background: var(--omni-paper);
        color: var(--omni-paper-ink);
        border: 2px solid var(--omni-gold);
        border-radius: 30px;
        box-shadow: 0 8px 30px rgba(255, 122, 0, 0.3);
        transition: box-shadow 0.15s;
        box-sizing: border-box;
      }
      .cc-omni-field:focus-within, .cc-omni-field:hover {
        box-shadow: 0 12px 40px rgba(255, 140, 51, 0.5);
      }
      .cc-omni-search-icon {
        color: var(--omni-gold-deep);
        display: flex;
        flex-shrink: 0;
      }
      #ccOmniInput {
        flex: 1;
        min-width: 0;
        background: transparent;
        border: none;
        outline: none;
        font: 500 1.05rem/1.3 inherit;
        color: var(--omni-paper-ink);
        padding: 0;
        min-height: 44px;
      }
      #ccOmniInput::placeholder {
        color: #8d877c;
        font-weight: 400;
      }
      .cc-omni-field .cc-omni-btn {
        color: var(--omni-paper-muted);
      }
      .cc-omni-field .cc-omni-btn:hover, .cc-omni-field .cc-omni-btn:focus-visible {
        color: var(--omni-gold-deep);
        background: rgba(255, 122, 0, 0.12);
      }
      #ccOmniMic.cc-listening {
        color: #b3261e;
      }
      /* Strona startowa: karty, skróty, kontynuacja */
      .cc-omni-home {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 28px;
        padding: 24px 0 8px;
      }
      .cc-omni-cards {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 12px;
      }
      .cc-omni-card {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 16px;
        min-height: 56px;
        background: var(--omni-paper);
        color: var(--omni-paper-ink);
        border: 1px solid rgba(255, 122, 0, 0.4);
        border-radius: 16px;
        text-decoration: none;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35);
        transition: border-color 0.15s, box-shadow 0.15s;
        box-sizing: border-box;
      }
      .cc-omni-card:hover, .cc-omni-card:focus-visible {
        border-color: var(--omni-gold);
        box-shadow: 0 6px 20px rgba(255, 122, 0, 0.35);
        outline: none;
      }
      .cc-omni-card-icon {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: #fff1e5;
        color: var(--omni-gold-deep);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .cc-omni-card b {
        display: block;
        font-size: 0.92rem;
        font-weight: 600;
        line-height: 1.25;
      }
      .cc-omni-card small {
        display: block;
        font-size: 0.78rem;
        color: var(--omni-paper-muted);
      }
      .cc-omni-shortcuts {
        display: grid;
        grid-template-columns: repeat(4, 76px);
        gap: 18px 10px;
        justify-content: center;
      }
      @media (min-width: 641px) {
        .cc-omni-shortcuts { grid-template-columns: repeat(7, 84px); }
      }
      .cc-omni-shortcut {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        text-decoration: none;
        color: var(--omni-ink);
        font-size: 0.78rem;
        font-weight: 500;
        text-align: center;
        line-height: 1.2;
      }
      .cc-omni-shortcut span:first-child {
        width: 54px;
        height: 54px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.92);
        color: var(--omni-gold-deep);
        border: 1px solid rgba(255, 122, 0, 0.55);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.45);
        transition: background-color 0.15s, color 0.15s, transform 0.15s;
      }
      .cc-omni-shortcut:hover span:first-child, .cc-omni-shortcut:focus-visible span:first-child {
        background: var(--omni-gold-hover);
        color: #fff;
        transform: scale(1.05);
      }
      .cc-omni-shortcut:focus-visible { outline: none; }
      .cc-omni-continue {
        width: 100%;
        background: var(--omni-paper);
        color: var(--omni-paper-ink);
        border-radius: 18px;
        border-top: 4px solid var(--omni-gold);
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        overflow: hidden;
      }
      .cc-omni-continue-head {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 18px;
        background: linear-gradient(90deg, #fbf5e8, #fffdf8);
        border-bottom: 1px solid #efe3c8;
        color: var(--omni-gold-deep);
        font-size: 0.86rem;
        font-weight: 600;
      }
      .cc-omni-continue-list {
        display: grid;
        grid-template-columns: minmax(0, 1fr);
        gap: 10px;
        padding: 14px;
      }
      @media (min-width: 641px) {
        .cc-omni-continue-list { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
      }
      .cc-omni-continue-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 12px;
        min-height: 56px;
        border-radius: 12px;
        background: #fcf8ef;
        border: 1px solid #efe3c8;
        text-decoration: none;
        color: inherit;
        min-width: 0;
        box-sizing: border-box;
      }
      .cc-omni-continue-item:hover, .cc-omni-continue-item:focus-visible {
        border-color: var(--omni-gold);
        outline: none;
      }
      .cc-omni-continue-item > span:first-child {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        background: #1a1712;
        color: var(--omni-gold);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        flex-shrink: 0;
      }
      .cc-omni-continue-item b {
        display: block;
        font-size: 0.88rem;
        font-weight: 600;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .cc-omni-continue-item small {
        display: block;
        font-size: 0.74rem;
        color: var(--omni-gold-deep);
      }
      .cc-omni-continue-item > span:last-child { min-width: 0; }
      /* Stan wyników: pole u góry, wyniki na ciemnym tle */
      #ccOmniModal.cc-has-query .cc-omni-hero { padding: 6px 0 14px; }
      #ccOmniModal.cc-has-query .cc-omni-brand { font-size: 1.5rem; }
      .cc-omni-filters {
        display: none;
        gap: 4px;
        margin-top: 10px;
        overflow-x: auto;
        white-space: nowrap;
        scrollbar-width: none;
        border-bottom: 1px solid var(--omni-line);
      }
      #ccOmniModal.cc-has-query .cc-omni-filters { display: flex; }
      .cc-omni-filters::-webkit-scrollbar { display: none; }
      .cc-omni-filter-chip {
        position: relative;
        padding: 0 12px;
        border: 0;
        background: transparent;
        color: var(--omni-muted);
        font: 500 0.88rem/1 inherit;
        cursor: pointer;
        min-height: 44px;
        display: inline-flex;
        align-items: center;
        touch-action: manipulation;
        flex-shrink: 0;
      }
      .cc-omni-filter-chip:hover { color: var(--omni-ink); }
      .cc-omni-filter-chip.active { color: var(--omni-gold); }
      .cc-omni-filter-chip.active::after {
        content: "";
        position: absolute;
        left: 8px;
        right: 8px;
        bottom: 0;
        height: 3px;
        border-radius: 3px 3px 0 0;
        background: var(--omni-gold);
      }
      .cc-omni-body {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 14px;
        padding: 14px 0 18px;
      }
      #ccOmniModal.cc-has-query .cc-omni-body {
        margin-top: 12px;
        padding: 16px 20px 18px;
        background: rgba(5, 6, 10, 0.86);
        border: 1px solid var(--omni-line);
        border-radius: 18px;
        backdrop-filter: blur(6px);
        -webkit-backdrop-filter: blur(6px);
      }
      .cc-omni-guide {
        border: 1px solid var(--omni-line);
        border-radius: 14px;
        padding: 14px 16px;
      }
      .cc-omni-guide-badge {
        font-size: 0.75rem;
        font-weight: 600;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: var(--omni-gold);
        margin-bottom: 6px;
      }
      .cc-omni-guide-topic {
        font-size: 1.1rem;
        font-weight: 600;
        margin: 0 0 6px;
        color: var(--omni-ink);
      }
      .cc-omni-guide-summary {
        font-size: 0.9rem;
        line-height: 1.5;
        color: var(--omni-muted);
        margin: 0 0 10px;
      }
      .cc-omni-guide-pills {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      .cc-omni-guide-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 0 14px;
        border-radius: 22px;
        border: 1px solid var(--omni-line);
        color: var(--omni-ink);
        text-decoration: none;
        font-size: 0.84rem;
        font-weight: 500;
        min-height: 44px;
        box-sizing: border-box;
      }
      .cc-omni-guide-pill:hover, .cc-omni-guide-pill:focus-visible {
        border-color: var(--omni-gold);
        color: var(--omni-gold);
      }
      .cc-omni-results-list {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .cc-omni-item {
        display: block;
        padding: 10px 12px;
        margin: 0 -12px;
        border-radius: 12px;
        text-decoration: none;
        color: inherit;
        min-height: 44px;
        box-sizing: border-box;
        transition: background-color 0.12s;
      }
      .cc-omni-item:hover, .cc-omni-item.cc-active {
        background: rgba(196, 163, 90, 0.1);
      }
      .cc-omni-item-source {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 4px;
        min-width: 0;
      }
      .cc-omni-item-icon {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.92);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        flex-shrink: 0;
      }
      .cc-omni-item-site {
        display: flex;
        flex-direction: column;
        min-width: 0;
        line-height: 1.25;
      }
      .cc-omni-item-sitename {
        font-size: 0.86rem;
        color: var(--omni-ink);
      }
      .cc-omni-item-crumb {
        font-size: 0.76rem;
        color: var(--omni-muted);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .cc-omni-item-title-row {
        display: flex;
        flex-wrap: wrap;
        align-items: baseline;
        gap: 4px 8px;
      }
      .cc-omni-item-title {
        font-size: 1.12rem;
        font-weight: 400;
        line-height: 1.3;
        color: var(--omni-title);
        margin: 0;
      }
      .cc-omni-item:hover .cc-omni-item-title,
      .cc-omni-item.cc-active .cc-omni-item-title {
        text-decoration: underline;
        text-underline-offset: 3px;
      }
      .cc-omni-item-badge {
        font-size: 0.72rem;
        font-weight: 500;
        color: var(--omni-gold);
        white-space: nowrap;
      }
      .cc-omni-item-desc {
        font-size: 0.88rem;
        color: var(--omni-muted);
        line-height: 1.5;
        margin: 4px 0 0;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .cc-omni-hl {
        background: transparent;
        color: var(--omni-ink);
        font-weight: 700;
      }
      .cc-omni-suggestion-header {
        display: flex;
        align-items: flex-start;
        gap: 12px;
      }
      .cc-omni-suggestion-icon { font-size: 1.1rem; line-height: 1.3; flex-shrink: 0; }
      .cc-omni-suggestion-title { font-size: 0.92rem; font-weight: 600; color: var(--omni-ink); margin-bottom: 2px; }
      .cc-omni-suggestion-desc { font-size: 0.84rem; color: var(--omni-muted); line-height: 1.4; }
      .cc-omni-empty {
        text-align: center;
        padding: 30px 12px;
        color: var(--omni-muted);
      }
      .cc-omni-empty p { margin: 8px 0 16px; font-size: 0.92rem; }
      .cc-omni-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 4px 12px;
        padding: 10px 0 max(env(safe-area-inset-bottom), 14px);
        font-size: 0.74rem;
        color: rgba(243, 229, 200, 0.65);
      }
      .cc-omni-footer-hints { display: none; }
      .cc-omni-kbd {
        border: 1px solid var(--omni-line);
        border-radius: 5px;
        padding: 2px 6px;
        font: inherit;
      }
      .cc-omni-view-all {
        color: var(--omni-gold);
        text-decoration: none;
        font-weight: 600;
        font-size: 0.84rem;
        display: inline-flex;
        align-items: center;
        min-height: 44px;
        padding: 0 4px;
      }
      .cc-omni-view-all:hover { text-decoration: underline; }
      @media (prefers-reduced-motion: reduce) {
        #ccOmniOverlay, .cc-omni-shortcut span:first-child { transition: none; }
      }
`;
    document.head.appendChild(style);
  }

  function mountModal() {
    if (document.getElementById('ccOmniOverlay')) return;
    ensureStyles();

    const overlay = document.createElement('div');
    overlay.id = 'ccOmniOverlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Uniwersalna wyszukiwarka ekosystemu Christian Culture');

    overlay.innerHTML = `
      <div id="ccOmniModal">
        <div class="cc-omni-top">
          <button type="button" id="ccOmniClose" class="cc-omni-btn" aria-label="Zamknij wyszukiwarkę">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="cc-omni-hero"><p class="cc-omni-brand">Christian Culture</p></div>
        <div class="cc-omni-header">
          <div class="cc-omni-field">
          <span class="cc-omni-search-icon" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </span>
          <input type="text" id="ccOmniInput" placeholder="Zapytaj Christian Culture…" autocomplete="off" spellcheck="false" aria-label="Wpisz szukane słowo">
          <button type="button" id="ccOmniClear" class="cc-omni-btn" aria-label="Wyczyść zapytanie" style="display:none;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <button type="button" id="ccOmniMic" class="cc-omni-btn" aria-label="Szukaj głosem" hidden>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="9" y="3" width="6" height="11" rx="3"></rect>
              <path d="M5 11a7 7 0 0 0 14 0M12 18v3"></path>
            </svg>
          </button>
          </div>
        </div>

        <div class="cc-omni-filters">
          <button type="button" class="cc-omni-filter-chip active" data-filter="all">Wszystko</button>
          <button type="button" class="cc-omni-filter-chip" data-filter="modules">Moduły</button>
          <button type="button" class="cc-omni-filter-chip" data-filter="bible">Słowo i rozważania</button>
          <button type="button" class="cc-omni-filter-chip" data-filter="radio">Radio</button>
          <button type="button" class="cc-omni-filter-chip" data-filter="vod">Wideo</button>
          <button type="button" class="cc-omni-filter-chip" data-filter="news">CCN</button>
          <button type="button" class="cc-omni-filter-chip" data-filter="community">Społeczność</button>
        </div>

        <div class="cc-omni-body" id="ccOmniBody">
          <!-- Renderowane dynamicznie -->
        </div>

        <div class="cc-omni-footer">
          <span>Tło: Galaktyka Andromedy · fot. Unsplash</span>
          <div class="cc-omni-footer-hints">
            <span><kbd class="cc-omni-kbd">↑</kbd> <kbd class="cc-omni-kbd">↓</kbd> nawigacja</span>
            <span><kbd class="cc-omni-kbd">Enter</kbd> otwórz</span>
            <span><kbd class="cc-omni-kbd">Esc</kbd> zamknij</span>
          </div>
          <a href="/szukaj" id="ccOmniViewAllLink" class="cc-omni-view-all">
            Zobacz w pełnej wyszukiwarce /szukaj &rarr;
          </a>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Zdarzenia wewnątrz modala
    const input = document.getElementById('ccOmniInput');
    const clearBtn = document.getElementById('ccOmniClear');
    const closeBtn = document.getElementById('ccOmniClose');
    const filterChips = overlay.querySelectorAll('.cc-omni-filter-chip');

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeSearch();
    });

    closeBtn.addEventListener('click', closeSearch);

    clearBtn.addEventListener('click', () => {
      input.value = '';
      clearBtn.style.display = 'none';
      renderResults('', activeFilter);
      input.focus();
    });

    input.addEventListener('input', (e) => {
      const val = e.target.value;
      clearBtn.style.display = val ? 'inline-flex' : 'none';
      renderResults(val, activeFilter);
    });

    input.addEventListener('keydown', handleKeyNavigation);

    // Wyszukiwanie głosem (Web Speech API) — przycisk pojawia się tylko, gdy przeglądarka je obsługuje
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const micBtn = document.getElementById('ccOmniMic');
    if (Recognition && micBtn) {
      micBtn.hidden = false;
      let recognizer = null;
      micBtn.addEventListener('click', () => {
        if (recognizer) { recognizer.stop(); return; }
        recognizer = new Recognition();
        recognizer.lang = 'pl-PL';
        recognizer.interimResults = false;
        micBtn.classList.add('cc-listening');
        micBtn.setAttribute('aria-label', 'Słucham… naciśnij, aby przerwać');
        recognizer.onresult = (ev) => {
          const text = ev.results[0] && ev.results[0][0] ? ev.results[0][0].transcript : '';
          if (!text) return;
          input.value = text;
          clearBtn.style.display = 'inline-flex';
          renderResults(text, activeFilter);
        };
        recognizer.onend = () => {
          recognizer = null;
          micBtn.classList.remove('cc-listening');
          micBtn.setAttribute('aria-label', 'Szukaj głosem');
        };
        try { recognizer.start(); } catch (_) { recognizer.onend(); }
      });
    }

    filterChips.forEach(chip => {
      chip.addEventListener('click', () => {
        filterChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        activeFilter = chip.getAttribute('data-filter') || 'all';
        renderResults(input.value, activeFilter);
      });
    });
  }

  function handleKeyNavigation(e) {
    const items = document.querySelectorAll('.cc-omni-item');
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!items.length) return;
      activeIndex = (activeIndex + 1) % items.length;
      updateActiveItem(items);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!items.length) return;
      activeIndex = (activeIndex - 1 + items.length) % items.length;
      updateActiveItem(items);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && items[activeIndex]) {
        items[activeIndex].click();
      } else {
        const val = document.getElementById('ccOmniInput').value.trim();
        window.location.href = `/szukaj?q=${encodeURIComponent(val)}`;
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closeSearch();
    }
  }

  function updateActiveItem(items) {
    items.forEach((it, idx) => {
      if (idx === activeIndex) {
        it.classList.add('cc-active');
        it.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      } else {
        it.classList.remove('cc-active');
      }
    });
  }

  function renderResults(query, filter) {
    const body = document.getElementById('ccOmniBody');
    if (!body) return;

    currentQuery = query;
    const modal = document.getElementById('ccOmniModal');
    const hasQuery = !!String(query || '').trim();
    if (modal) modal.classList.toggle('cc-has-query', hasQuery);
    if (!hasQuery) {
      currentResults = [];
      activeIndex = -1;
      body.innerHTML = renderHome();
      return;
    }
    const { items, guide, isSuggestion, suggestionNote } = performSearch(query, filter);
    currentResults = items;
    activeIndex = -1;

    // Aktualizacja linku "Zobacz w pełnej wyszukiwarce"
    const viewAllLink = document.getElementById('ccOmniViewAllLink');
    if (viewAllLink) {
      viewAllLink.href = query ? `/szukaj?q=${encodeURIComponent(query)}` : '/szukaj';
    }

    let html = '';

    // 1. Jeśli jest dopasowany przewodnik tematyczny
    if (guide) {
      const topic = escapeHtml(guide.topic || '');
      const summary = escapeHtml(guide.summary || '');
      let pillsHtml = '';
      if (guide.shortcuts && Array.isArray(guide.shortcuts)) {
        pillsHtml = guide.shortcuts.map(s => {
          const sTitle = escapeHtml(s.title || '');
          const sUrl = escapeHtml(s.url || '#');
          const sIcon = escapeHtml(s.icon || '🔗');
          return `<a href="${sUrl}" class="cc-omni-guide-pill"><span>${sIcon}</span><span>${sTitle}</span></a>`;
        }).join('');
      }

      html += `
        <div class="cc-omni-guide">
          <div class="cc-omni-guide-badge">Przewodnik po ekosystemie</div>
          <h4 class="cc-omni-guide-topic">${topic}</h4>
          <p class="cc-omni-guide-summary">${summary}</p>
          <div class="cc-omni-guide-pills">
            ${pillsHtml}
          </div>
        </div>
      `;
    }

    // 2. Nagłówek propozycji bliskoznacznych gdy brak bezpośrednich wyników
    if (isSuggestion && items && items.length) {
      html += `
        <div class="cc-omni-suggestion-header">
          <div class="cc-omni-suggestion-icon">💡</div>
          <div class="cc-omni-suggestion-text">
            <div class="cc-omni-suggestion-title">Brak bezpośredniego dopasowania dla „${escapeHtml(query)}”</div>
            <div class="cc-omni-suggestion-desc">${escapeHtml(suggestionNote || 'Oto bliskoznaczne propozycje i powiązane materiały z ekosystemu Christian Culture:')}</div>
          </div>
        </div>
      `;
    }

    // 3. Lista wyników
    if (!items.length) {
      html += `
        <div class="cc-omni-empty">
          <div style="font-size:2rem;margin-bottom:8px;">🔍</div>
          <div style="font-weight:700;font-size:1.05rem;color:inherit;">Nie znaleziono bezpośrednich wyników dla "${escapeHtml(query)}"</div>
          <p>Spróbuj wpisać inne słowo, np. <i>nadzieja</i>, <i>werset dnia</i>, <i>modlitwa</i>, <i>apokalipsa</i> lub przejdź do pełnego indeksu.</p>
          <a href="/szukaj?q=${encodeURIComponent(query)}" class="cc-omni-guide-pill" style="display:inline-flex;">Przeszukaj pełne archiwum /szukaj &rarr;</a>
        </div>
      `;
    } else {
      html += '<div class="cc-omni-results-list">';
      for (const item of items) {
        const titleHl = highlightMatches(item.title, query);
        const descHl = highlightMatches(item.description, query);
        const meta = item._meta || categorizeItem(item);
        const url = escapeHtml(item.url || '#');
        const icon = meta.icon || '✨';
        const groupName = escapeHtml(meta.name || '');
        const suggestionBadge = (item.isNearMatch || isSuggestion) ? '<span class="cc-omni-item-badge cc-badge-suggestion">Temat pokrewny</span>' : '';
        const crumb = escapeHtml(breadcrumbOf(item.url || ''));

        html += `
          <a href="${url}" class="cc-omni-item" data-url="${url}">
            <div class="cc-omni-item-source">
              <span class="cc-omni-item-icon" aria-hidden="true">${icon}</span>
              <span class="cc-omni-item-site"><span class="cc-omni-item-sitename">${groupName}</span><span class="cc-omni-item-crumb">${crumb}</span></span>
            </div>
            <div class="cc-omni-item-title-row">
              <span class="cc-omni-item-title">${titleHl}</span>
              ${suggestionBadge}
            </div>
            <p class="cc-omni-item-desc">${descHl}</p>
          </a>
        `;
      }
      html += '</div>';
    }

    body.innerHTML = html;
  }

  // Strona startowa: prawdziwe skróty ekosystemu i historia odwiedzin z tej przeglądarki (cc-favorites.js)
  const HOME_ICONS = {
    play: '<path d="M8 5v14l11-7Z"/>',
    tv: '<rect x="3" y="5" width="18" height="12" rx="2"/><path d="M8 21h8M12 17v4"/>',
    book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2Z"/><path d="M4 19V5"/>',
    mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
    news: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h10M7 12h10M7 16h6"/>',
    people: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M21.5 20a6.5 6.5 0 0 0-4-6"/>',
    home: '<path d="m3 10 9-7 9 7v11h-6v-7H9v7H3Z"/>',
    radio: '<rect x="3" y="8" width="18" height="12" rx="2"/><circle cx="15.5" cy="14" r="2.5"/><path d="M7 12h4M7 16h4M7 8l9-5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'
  };
  const svgIcon = (name, size = 22) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${HOME_ICONS[name] || ''}</svg>`;
  const HOME_SHORTCUTS = [
    { label: 'YouTube', url: 'https://www.youtube.com/@ChristianCultureTV', icon: 'play', external: true },
    { label: 'Kanały', url: '/kanaly', icon: 'tv' },
    { label: 'Akademia', url: '/akademia', icon: 'book' },
    { label: 'Podcasty', url: '/podcasty', icon: 'mic' },
    { label: 'Portal CCN', url: '/news', icon: 'news' },
    { label: 'LUMINA', url: '/lumina', icon: 'people' },
    { label: 'Strona główna', url: '/', icon: 'home' }
  ];
  function visitedLabel(iso) {
    const d = new Date(iso);
    if (isNaN(d)) return '';
    const now = new Date();
    const time = d.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
    if (d.toDateString() === now.toDateString()) return 'Odwiedzono dziś, ' + time;
    const y = new Date(now);
    y.setDate(now.getDate() - 1);
    if (d.toDateString() === y.toDateString()) return 'Odwiedzono wczoraj, ' + time;
    return 'Odwiedzono ' + d.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long' });
  }
  function renderHome() {
    const cards = `
      <div class="cc-omni-cards">
        <a class="cc-omni-card" href="/akademia#kurscodzienny"><span class="cc-omni-card-icon">${svgIcon('book', 16)}</span><span><b>Dzisiejsza lekcja</b><small>Kurs Codzienny · Z Biblią za Pan Brat</small></span></a>
        <a class="cc-omni-card" href="/player"><span class="cc-omni-card-icon">${svgIcon('radio', 16)}</span><span><b>Radio i nagrania CC</b><small>Muzyka, Słowo Boże i audio</small></span></a>
      </div>`;
    const shortcuts = '<nav class="cc-omni-shortcuts" aria-label="Skróty ekosystemu">' + HOME_SHORTCUTS.map(sc =>
      `<a class="cc-omni-shortcut" href="${sc.url}"${sc.external ? ' target="_blank" rel="noopener"' : ''}><span>${svgIcon(sc.icon)}</span><span>${escapeHtml(sc.label)}</span></a>`).join('') + '</nav>';
    let history = [];
    try { history = JSON.parse(localStorage.getItem('cc_user_visit_history') || '[]'); } catch (_) {}
    history = (Array.isArray(history) ? history : []).filter(h => h && h.url && h.title && h.url !== location.pathname).slice(0, 4);
    const cont = history.length ? `
      <section class="cc-omni-continue" aria-label="Kontynuuj">
        <div class="cc-omni-continue-head">${svgIcon('clock', 16)}<span>Ostatnio odwiedzane</span></div>
        <div class="cc-omni-continue-list">${history.map(h => `<a class="cc-omni-continue-item" href="${escapeHtml(h.url)}"><span>${escapeHtml(h.icon || '✨')}</span><span><b>${escapeHtml(h.title)}</b><small>${escapeHtml(visitedLabel(h.visitedAt))}</small></span></a>`).join('')}</div>
      </section>` : '';
    return '<div class="cc-omni-home">' + cards + shortcuts + cont + '</div>';
  }

  // 8. Otwieranie i zamykanie wyszukiwarki
  function openSearch(initialQuery = '') {
    if (isSearchPage) {
      // Jeśli jesteśmy na stronie /szukaj, skupiamy dedykowane pole
      const searchPageInput = document.getElementById('q') || document.querySelector('input[name="q"]');
      if (searchPageInput) {
        searchPageInput.focus();
        if (initialQuery) {
          searchPageInput.value = initialQuery;
          searchPageInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }
      return;
    }

    mountModal();
    const overlay = document.getElementById('ccOmniOverlay');
    const input = document.getElementById('ccOmniInput');

    loadCatalog().then(() => {
      renderResults(initialQuery || (input ? input.value : ''), activeFilter);
    });

    overlay.classList.add('cc-open');
    document.body.style.overflow = 'hidden';

    if (input) {
      if (initialQuery) input.value = initialQuery;
      setTimeout(() => {
        input.focus();
        input.select();
      }, 50);
    }
  }

  function closeSearch() {
    const overlay = document.getElementById('ccOmniOverlay');
    if (!overlay) return;
    overlay.classList.remove('cc-open');
    document.body.style.overflow = '';
  }

  function toggleSearch() {
    const overlay = document.getElementById('ccOmniOverlay');
    if (overlay && overlay.classList.contains('cc-open')) {
      closeSearch();
    } else {
      openSearch();
    }
  }

  // 9. Automatyczne podpinanie wszystkich lup i pól wyszukiwania w DOM
  function wireDomSearchElements() {
    // A. Skróty klawiszowe Ctrl+K oraz /
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openSearch();
      } else if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName) && !document.activeElement?.isContentEditable) {
        e.preventDefault();
        openSearch();
      }
    });

    // B. Przechwytywanie kliknięć we wszystkie elementy wyszukiwania
    document.addEventListener('click', (e) => {
      // Sprawdź czy kliknięto w ikonę lupy, przycisk lub pole z atrybutem
      const searchTarget = e.target.closest([
        '[data-cc-search]',
        '[data-action="search"]',
        '.fa-magnifying-glass',
        '.fa-search',
        '.search-icon',
        '.nav-search-icon',
        '.mapa-search-icon',
        '.mobile-nav-search-btn',
        '#mobileNavSearchBtn',
        '.btn-omni-action',
        'a[href*="/szukaj"]'
      ].join(', '));

      if (searchTarget) {
        // Jeśli kliknięto bezpośredni link do /szukaj z prawego przycisku lub ctrl, nie blokujemy
        if (searchTarget.tagName === 'A' && (e.ctrlKey || e.metaKey || e.shiftKey)) return;

        // Jeśli kliknięto wewnątrz formularza MojaBiblia na mojabiblia.html do lokalnego szukania
        if (searchTarget.closest('#mbSearchForm') || searchTarget.classList.contains('mb-search-btn')) {
          // Pozwalamy lokalnemu skryptowi MojaBiblia obsłużyć jeśli pole nie jest puste
          const mbInput = document.getElementById('mbSearchInput');
          if (mbInput && mbInput.value.trim().length > 0) return;
        }

        e.preventDefault();
        openSearch();
      }
    }, true);

    // C. Jeśli na stronie jest element #menuCcSearchInput (np. w index.html), podepnij go
    const menuInput = document.getElementById('menuCcSearchInput');
    if (menuInput) {
      menuInput.addEventListener('focus', () => {
        // Wstępne załadowanie katalogu w tle dla natychmiastowej responsywności
        loadCatalog();
      });
      menuInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          openSearch(menuInput.value);
        }
      });
    }

    // D. Podpięcie paska odtwarzacza (player.html)
    const playerInput = document.getElementById('searchInput');
    if (playerInput) {
      playerInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const val = playerInput.value.trim();
          if (val) {
            e.preventDefault();
            openSearch(val);
          }
        }
      });
    }

    // E. Podpięcie paska LUMINA (lumina.html)
    const luminaInput = document.getElementById('omniSearchInput');
    if (luminaInput) {
      luminaInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const val = luminaInput.value.trim();
          if (val && !val.startsWith('@') && !val.startsWith('#')) {
            e.preventDefault();
            openSearch(val);
          }
        }
      });
    }

    // F. Podpięcie paska VOD (vod.html)
    const vodInput = document.getElementById('netflixSearchInput');
    if (vodInput) {
      vodInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const val = vodInput.value.trim();
          if (val) {
            e.preventDefault();
            openSearch(val);
          }
        }
      });
    }

    // G. Wstępne załadowanie katalogu przy bezczynności przeglądarki
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => loadCatalog(), { timeout: 3000 });
    } else {
      setTimeout(() => loadCatalog(), 1500);
    }
  }

  // 10. Eksport do przestrzeni globalnej
  window.CCOmniSearch = {
    open: openSearch,
    close: closeSearch,
    toggle: toggleSearch,
    loadCatalog: loadCatalog,
    publicationTime: publicationTime,
    performSearch: performSearch
  };

  // Uruchomienie po załadowaniu DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wireDomSearchElements);
  } else {
    wireDomSearchElements();
  }

})();
