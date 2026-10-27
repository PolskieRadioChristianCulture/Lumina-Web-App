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
  // Własny adres wyszukiwarki: polskieradio.cc/wyszukiwarka (decyzja L0 26.10.2026) — otwarta na pełnym ekranie
  const isStandalonePage = /^\/wyszukiwarka(?:\/|\.html)?$/i.test(window.location.pathname);

  // 2. Globalny stan wyszukiwarki
  let catalogData = window.__ccSearchCatalog || null;
  let isCatalogLoading = false;
  let activeIndex = -1;
  let currentResults = [];
  let currentQuery = '';
  let activeFilter = 'all';
  // Tryb wyszukiwania: 'cc' (ekosystem Christian Culture) lub 'google' (cały internet) — zapamiętany na urządzeniu (L0 26.10.2026)
  const ENGINE_KEY = 'cc_search_engine';
  let searchEngine = 'cc';
  try { if (localStorage.getItem(ENGINE_KEY) === 'google') searchEngine = 'google'; } catch (_) {}
  const googleUrl = (q) => 'https://www.google.com/search?q=' + encodeURIComponent(q);

  const RECENTS_KEY = 'cc_recent_searches';
  function getRecentSearches() {
    try {
      const list = JSON.parse(localStorage.getItem(RECENTS_KEY) || '[]');
      return (Array.isArray(list) ? list : []).filter(item => typeof item === 'string' && item.trim().length > 0).slice(0, 8);
    } catch (_) {
      return [];
    }
  }
  function saveRecentSearch(query) {
    const q = String(query || '').trim();
    if (!q || q.length < 2) return;
    try {
      const current = getRecentSearches().filter(item => item.toLowerCase() !== q.toLowerCase());
      current.unshift(q);
      localStorage.setItem(RECENTS_KEY, JSON.stringify(current.slice(0, 10)));
    } catch (_) {}
  }
  function removeRecentSearch(query) {
    const q = String(query || '').trim().toLowerCase();
    try {
      const current = getRecentSearches().filter(item => item.toLowerCase() !== q);
      localStorage.setItem(RECENTS_KEY, JSON.stringify(current));
    } catch (_) {}
  }
  function clearRecentSearches() {
    try {
      localStorage.removeItem(RECENTS_KEY);
    } catch (_) {}
  }

  const PLACEHOLDERS = [
    'Zapytaj Christian Culture…',
    'Szukaj: np. Apokalipsa - Księga Nadziei',
    'Szukaj: np. Rozważanie Dobrze że jesteś',
    'Szukaj: np. Lekcja Kursu Codziennego',
    'Szukaj: np. MojaBiblia Jan 3:16',
    'Szukaj: np. Muzyka uwielbienia i radio',
    'Szukaj: np. LUMINA społeczność',
    'Szukaj: np. Modlitwa za Polskę',
    'Szukaj: np. Wizytówki ekosystemu'
  ];
  let placeholderInterval = null;
  function startPlaceholderRotation(input) {
    if (!input || placeholderInterval) return;
    let idx = 0;
    placeholderInterval = setInterval(() => {
      if (searchEngine === 'google') return;
      if (document.activeElement === input || (input.value && input.value.trim())) return;
      idx = (idx + 1) % PLACEHOLDERS.length;
      input.placeholder = PLACEHOLDERS[idx];
    }, 3500);
  }


  // Wyszukiwarka do ustawienia jako domyślna w przeglądarce (OpenSearch)
  if (typeof document !== 'undefined' && document.head && typeof document.querySelector === 'function'
    && !document.querySelector('link[rel="search"][type="application/opensearchdescription+xml"]')) {
    const os = document.createElement('link');
    os.rel = 'search';
    os.type = 'application/opensearchdescription+xml';
    os.title = 'Christian Culture';
    os.href = '/opensearch.xml';
    document.head.appendChild(os);
  }

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
        /* Przypięty do prawej krawędzi ekranu, nie do kolumny treści (L0 26.10.2026) */
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 3;
        display: flex;
        justify-content: flex-end;
        align-items: center;
        gap: 4px;
        padding: max(env(safe-area-inset-top), 12px) max(env(safe-area-inset-right), 20px) 8px 16px;
        background: linear-gradient(180deg, rgba(3, 4, 8, 0.85) 0%, rgba(3, 4, 8, 0) 100%);
        box-sizing: border-box;
      }
      /* Pasek w prawym górnym rogu: Czat | Nowości | Wszystko | Logowanie LUMINA (wzór L0 26.10.2026) */
      .cc-omni-topnav {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .cc-omni-toplink,
      .cc-omni-apps-btn,
      .cc-omni-radio,
      #ccOmniOverlay #ccTopBarFavBtn,
      #ccOmniOverlay .cc-topbar-fav-btn {
        width: 44px;
        height: 44px;
        min-width: 44px;
        min-height: 44px;
        padding: 0;
        margin: 0;
        border: 0;
        border-radius: 50%;
        background: transparent;
        color: #FF7A00;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        text-decoration: none;
        flex-shrink: 0;
        box-shadow: none;
        transition: background-color 0.15s, transform 0.15s, color 0.15s;
      }
      .cc-omni-toplink:hover, .cc-omni-toplink:focus-visible,
      .cc-omni-apps-btn:hover, .cc-omni-apps-btn:focus-visible,
      .cc-omni-radio:hover, .cc-omni-radio:focus-visible,
      #ccOmniOverlay #ccTopBarFavBtn:hover, #ccOmniOverlay #ccTopBarFavBtn:focus-visible {
        background: rgba(255, 255, 255, 0.12);
        color: #FF8C33;
        transform: scale(1.08);
        outline: none;
      }
      .cc-omni-toplink:active,
      .cc-omni-apps-btn:active,
      .cc-omni-radio:active {
        transform: scale(0.95);
      }
      .cc-omni-toplink svg,
      .cc-omni-apps-btn svg,
      .cc-omni-radio svg,
      #ccOmniOverlay #ccTopBarFavBtn svg {
        width: 22px;
        height: 22px;
        color: #FF7A00;
        flex-shrink: 0;
      }
      .cc-omni-radio .cc-i-stop,
      .cc-omni-radio[aria-pressed="true"] .cc-i-play {
        display: none;
      }
      .cc-omni-radio[aria-pressed="true"] .cc-i-stop {
        display: block;
        color: #FF7A00;
      }
      .cc-omni-radio.cc-loading {
        opacity: 0.6;
      }
      .cc-omni-apps-wrap {
        position: relative;
        display: flex;
        align-items: center;
        height: 44px;
        margin: 0;
      }
      #ccOmniOverlay.cc-standalone #ccOmniClose,
      .ccw-fallback ~ #ccOmniOverlay #ccOmniClose {
        display: none !important;
      }
      /* Menu „Wszystko”: ciemne szkło jak cała wyszukiwarka, ikony w kolorze akcji #FF7A00 (L0 26.10.2026) */
      .cc-omni-apps {
        position: absolute;
        right: 0;
        top: calc(100% + 10px);
        z-index: 2;
        width: 320px;
        max-height: calc(100vh - 160px); /* kończy się nad dolną belką */
        overflow-y: auto;
        overscroll-behavior: contain;
        padding: 16px 14px 14px;
        background: rgba(8, 9, 14, 0.94);
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        color: var(--omni-ink);
        border: 1px solid var(--omni-line);
        border-top: 3px solid var(--omni-gold);
        border-radius: 18px;
        box-shadow: 0 18px 48px rgba(0, 0, 0, 0.7), 0 0 24px rgba(255, 122, 0, 0.12);
        box-sizing: border-box;
        scrollbar-width: thin;
        scrollbar-color: var(--omni-gold) transparent;
      }
      .cc-omni-apps[hidden] { display: none; }
      .cc-omni-apps-title {
        margin: 0 0 12px;
        padding: 0 4px 10px;
        border-bottom: 1px solid var(--omni-line);
        color: var(--omni-gold);
        font-size: 0.74rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }
      .cc-omni-apps-sec {
        margin: 14px 4px 6px;
        color: var(--omni-muted);
        font-size: 0.7rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }
      .cc-omni-apps-title + .cc-omni-apps-sec { margin-top: 2px; }
      .cc-omni-apps-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 4px;
      }
      .cc-omni-apps-grid a {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        min-height: 78px;
        padding: 10px 4px 8px;
        border-radius: 14px;
        color: var(--omni-ink);
        text-decoration: none;
        font-size: 0.76rem;
        font-weight: 500;
        line-height: 1.2;
        text-align: center;
        transition: background-color 0.15s;
      }
      .cc-omni-app-ico {
        width: 42px;
        height: 42px;
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: var(--omni-gold);
        background: rgba(255, 122, 0, 0.1);
        border: 1px solid rgba(255, 122, 0, 0.35);
        box-sizing: border-box;
        transition: background-color 0.15s, color 0.15s, box-shadow 0.15s;
      }
      .cc-omni-apps-grid a:hover, .cc-omni-apps-grid a:focus-visible { background: rgba(255, 255, 255, 0.06); outline: none; }
      .cc-omni-apps-grid a:hover .cc-omni-app-ico, .cc-omni-apps-grid a:focus-visible .cc-omni-app-ico {
        background: var(--omni-gold);
        color: #fff;
        box-shadow: 0 0 14px rgba(255, 122, 0, 0.55);
      }
      #ccOmniOverlay #ccTopBarFavBtn {
        border: 0;
        background: transparent;
        box-shadow: none;
        min-width: 44px;
        min-height: 44px;
      }
      #ccOmniOverlay #ccTopBarFavBtn:focus-visible {
        outline: 2px solid var(--omni-gold-hover);
        outline-offset: 2px;
      }
      .cc-omni-account {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background: radial-gradient(circle at 35% 30%, var(--omni-gold-hover), var(--omni-gold) 55%, var(--omni-gold-deep));
        box-shadow: 0 0 18px rgba(255, 122, 0, 0.55);
        color: #fff;
        text-decoration: none;
        overflow: hidden;
        flex-shrink: 0;
      }
      .cc-omni-account:hover, .cc-omni-account:focus-visible { box-shadow: 0 0 22px rgba(255, 175, 50, 0.85); transform: scale(1.08); outline: none; }
      .cc-omni-account { transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease; }
      .cc-omni-account-face { font-size: 1.2rem; font-weight: 800; line-height: 1; }
      .cc-omni-account img { width: 100%; height: 100%; object-fit: cover; }
      @media (max-width: 640px) {
        .cc-omni-apps { position: fixed; left: 16px; right: 16px; top: calc(max(env(safe-area-inset-top), 12px) + 56px); bottom: calc(max(env(safe-area-inset-bottom), 8px) + 64px); max-height: none; width: auto; }
      }
      @media (max-width: 420px) {
        .cc-omni-toplink { padding: 0 6px; gap: 6px; font-size: 0.86rem; }
        .cc-omni-topnav { gap: 0; }
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
        padding: calc(8vh + 54px) 0 16px;
      }
      .cc-omni-brand {
        position: relative;
        width: min(580px, 100%);
        aspect-ratio: 1774 / 400;
        margin: 0 auto;
        overflow: hidden;
      }
      .cc-omni-brand img {
        position: absolute;
        top: -60%;
        left: 0;
        display: block;
        width: 100%;
        height: auto;
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
        background: rgba(255, 255, 255, 0.15);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        color: #ffffff;
        border: 2px solid #FF7A00;
        border-radius: 30px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 20px rgba(255, 122, 0, 0.3);
        transition: box-shadow 0.18s, border-color 0.18s, background-color 0.18s;
        box-sizing: border-box;
      }
      .cc-omni-field:focus-within, .cc-omni-field:hover {
        border-color: #FF8C33;
        background: rgba(255, 255, 255, 0.22);
        box-shadow: 0 12px 42px rgba(0, 0, 0, 0.5), 0 0 28px rgba(255, 140, 51, 0.45);
      }
      .cc-omni-search-icon {
        color: #FF7A00;
        display: flex;
        flex-shrink: 0;
      }
      .cc-omni-search-icon svg {
        color: #FF7A00;
        stroke: #FF7A00;
      }
      #ccOmniInput {
        flex: 1;
        min-width: 0;
        background: transparent;
        border: none;
        outline: none;
        font: 500 1.05rem/1.3 inherit;
        color: #ffffff;
        padding: 0;
        min-height: 44px;
      }
      #ccOmniInput::placeholder {
        color: rgba(255, 255, 255, 0.7);
        font-weight: 400;
      }
      .cc-omni-field .cc-omni-btn {
        color: rgba(255, 255, 255, 0.8);
      }
      .cc-omni-field .cc-omni-btn:hover, .cc-omni-field .cc-omni-btn:focus-visible {
        color: #FF7A00;
        background: rgba(255, 255, 255, 0.12);
      }
      #ccOmniMic.cc-listening {
        color: #b3261e;
      }
      /* Przełącznik G (Google) — aktywny ma podświetlenie, pole ma niebiesko-pomarańczową ramkę */
      .cc-omni-engine { opacity: 0.55; transition: opacity 0.15s, background-color 0.15s; }
      .cc-omni-engine:hover, .cc-omni-engine:focus-visible { opacity: 1; }
      .cc-omni-engine[aria-pressed="true"] { opacity: 1; background: #e8f0fe; box-shadow: inset 0 0 0 1px #4285F4; }
      .cc-omni-field.cc-engine-google { border-color: #4285F4; box-shadow: 0 8px 30px rgba(66, 133, 244, 0.35); }
      .cc-omni-google-go {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 12px 14px;
        margin: 0 -12px;
        border-radius: 12px;
        background: rgba(66, 133, 244, 0.14);
        color: var(--omni-ink);
        text-decoration: none;
        min-height: 56px;
      }
      .cc-omni-google-go:hover, .cc-omni-google-go:focus-visible { background: rgba(66, 133, 244, 0.24); outline: none; }
      .cc-omni-google-go b { display: block; font-size: 1.05rem; font-weight: 600; color: #fff; }
      .cc-omni-google-go small { display: block; font-size: 0.8rem; color: var(--omni-muted); }
      .cc-omni-google-g {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: #fff;
        color: #4285F4;
        font: 800 1.2rem/36px Arial, sans-serif;
        text-align: center;
        flex-shrink: 0;
      }
      .cc-omni-google-sub { margin: 6px 0 0; font-size: 0.78rem; color: var(--omni-muted); text-transform: uppercase; letter-spacing: 0.05em; }
      /* ── Nowe style: Historia, Tagi, Filary i Skróty (Spotlight / Raycast Standard) ── */
      .cc-omni-recents-bar {
        width: 100%;
        max-width: 820px;
        background: rgba(18, 22, 36, 0.75);
        border: 1px solid rgba(196, 163, 90, 0.25);
        border-radius: 14px;
        padding: 10px 14px;
        box-sizing: border-box;
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
      }
      .cc-omni-recents-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
        font-size: 0.78rem;
        color: var(--omni-gold);
        font-weight: 600;
        letter-spacing: 0.02em;
      }
      .cc-omni-recents-title {
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
      .cc-omni-recents-clear {
        background: transparent;
        border: 0;
        color: var(--omni-muted);
        font: 500 0.74rem inherit;
        cursor: pointer;
        padding: 4px 8px;
        border-radius: 6px;
        transition: color 0.15s, background 0.15s;
        min-height: 32px;
        display: inline-flex;
        align-items: center;
      }
      .cc-omni-recents-clear:hover {
        color: #ff6b6b;
        background: rgba(255, 107, 107, 0.12);
      }
      .cc-omni-recents-pills {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      .cc-omni-recent-pill {
        display: inline-flex;
        align-items: center;
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 20px;
        padding: 0 4px 0 12px;
        min-height: 36px;
        transition: all 0.15s ease;
      }
      .cc-omni-recent-pill:hover {
        background: rgba(196, 163, 90, 0.15);
        border-color: rgba(196, 163, 90, 0.45);
      }
      .cc-omni-recent-query {
        background: transparent;
        border: 0;
        color: var(--omni-ink);
        font: 500 0.82rem inherit;
        cursor: pointer;
        padding: 6px 4px 6px 0;
        min-height: 36px;
        display: inline-flex;
        align-items: center;
      }
      .cc-omni-recent-query:hover {
        color: var(--omni-gold);
      }
      .cc-omni-recent-del {
        background: transparent;
        border: 0;
        color: var(--omni-muted);
        font-size: 1rem;
        cursor: pointer;
        padding: 4px 6px;
        border-radius: 50%;
        line-height: 1;
        min-height: 28px;
        min-width: 28px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: color 0.15s, background 0.15s;
      }
      .cc-omni-recent-del:hover {
        color: #ff6b6b;
        background: rgba(255, 107, 107, 0.18);
      }
      .cc-omni-tags-bar {
        width: 100%;
        max-width: 820px;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px 10px;
        justify-content: center;
      }
      .cc-omni-tags-label {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        font-size: 0.78rem;
        font-weight: 600;
        color: var(--omni-gold);
        letter-spacing: 0.02em;
        text-transform: uppercase;
      }
      .cc-omni-tags-list {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        justify-content: center;
      }
      .cc-omni-tag-chip {
        display: inline-flex;
        align-items: center;
        min-height: 44px;
        padding: 0 14px;
        border-radius: 22px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.14);
        color: var(--omni-ink);
        font: 600 0.82rem inherit;
        cursor: pointer;
        transition: all 0.18s cubic-bezier(0.2, 0.8, 0.2, 1);
        text-decoration: none;
        touch-action: manipulation;
      }
      .cc-omni-tag-chip:hover, .cc-omni-tag-chip:focus-visible {
        background: rgba(196, 163, 90, 0.18);
        border-color: var(--omni-gold);
        color: var(--omni-gold);
        transform: translateY(-1px);
        outline: none;
      }
      .cc-omni-featured-section {
        width: 100%;
        max-width: 820px;
      }
      .cc-omni-featured-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
        padding: 0 4px;
      }
      .cc-omni-featured-label {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 0.82rem;
        font-weight: 700;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: var(--omni-gold);
      }
      .cc-omni-featured-grid {
        display: grid;
        grid-template-columns: minmax(0, 1fr);
        gap: 12px;
      }
      @media (min-width: 641px) {
        .cc-omni-featured-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }
      .cc-omni-feat-card {
        display: flex;
        align-items: flex-start;
        gap: 14px;
        padding: 14px 16px;
        min-height: 84px;
        background: rgba(14, 18, 30, 0.82);
        border: 1px solid rgba(196, 163, 90, 0.25);
        border-radius: 16px;
        text-decoration: none;
        color: var(--omni-ink);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
        transition: transform 0.18s cubic-bezier(0.2, 0.8, 0.2, 1), border-color 0.18s, box-shadow 0.18s, background-color 0.18s;
        box-sizing: border-box;
        position: relative;
        overflow: hidden;
      }
      .cc-omni-feat-card::before {
        content: "";
        position: absolute;
        inset: 0;
        background: linear-gradient(135deg, rgba(196, 163, 90, 0.08) 0%, transparent 60%);
        pointer-events: none;
      }
      .cc-omni-feat-card:hover, .cc-omni-feat-card:focus-visible {
        transform: translateY(-2px);
        border-color: var(--omni-gold);
        background: rgba(22, 28, 46, 0.92);
        box-shadow: 0 10px 28px rgba(0, 0, 0, 0.5), 0 0 16px rgba(196, 163, 90, 0.25);
        outline: none;
      }
      .cc-omni-feat-icon {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        background: linear-gradient(135deg, rgba(255, 122, 0, 0.2), rgba(196, 163, 90, 0.3));
        border: 1px solid rgba(255, 122, 0, 0.4);
        color: #FF7A00;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      }
      .cc-omni-feat-card:hover .cc-omni-feat-icon {
        border-color: var(--omni-gold);
        color: var(--omni-gold);
        transform: scale(1.05);
      }
      .cc-omni-feat-info {
        flex: 1;
        min-width: 0;
      }
      .cc-omni-feat-tag {
        display: inline-block;
        font-size: 0.68rem;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: #FF7A00;
        margin-bottom: 3px;
      }
      .cc-omni-feat-title {
        display: block;
        font-size: 0.98rem;
        font-weight: 600;
        line-height: 1.3;
        color: #fff;
        margin-bottom: 4px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .cc-omni-feat-card:hover .cc-omni-feat-title {
        color: var(--omni-gold-light);
      }
      .cc-omni-feat-desc {
        display: block;
        font-size: 0.78rem;
        color: var(--omni-muted);
        line-height: 1.4;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .cc-omni-feat-arrow {
        color: var(--omni-muted);
        font-size: 1rem;
        align-self: center;
        transition: transform 0.15s, color 0.15s;
        flex-shrink: 0;
      }
      .cc-omni-feat-card:hover .cc-omni-feat-arrow {
        transform: translateX(3px);
        color: var(--omni-gold);
      }
      .cc-omni-pro-shortcuts {
        display: flex;
        flex-wrap: wrap;
        gap: 12px 18px;
        justify-content: center;
        align-items: center;
        font-size: 0.76rem;
        color: rgba(243, 229, 200, 0.55);
        margin-top: 6px;
      }
      .cc-omni-pro-shortcuts kbd {
        display: inline-block;
        padding: 2px 6px;
        font-family: inherit;
        font-size: 0.72rem;
        font-weight: 600;
        line-height: 1.2;
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.18);
        border-radius: 4px;
        color: var(--omni-gold);
        margin-right: 4px;
        box-shadow: 0 1px 2px rgba(0,0,0,0.3);
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
        .cc-omni-shortcuts { grid-template-columns: repeat(8, 84px); }
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
      button.cc-omni-shortcut { background: none; border: 0; padding: 0; cursor: pointer; font: inherit; font-size: 0.78rem; font-weight: 500; }
      button.cc-omni-shortcut[aria-expanded="true"] span:first-child { background: var(--omni-gold); color: #fff; }
      .cc-omni-continue[hidden] { display: none; }
      .cc-omni-favs-empty { margin: 0; padding: 16px 18px; font-size: 0.88rem; line-height: 1.5; color: var(--omni-paper-muted); }
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
      #ccOmniModal.cc-has-query .cc-omni-hero { padding: 70px 0 14px; }
      #ccOmniModal.cc-has-query .cc-omni-brand { width: min(260px, 100%); }
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
        /* Dolna belka przypięta do krawędzi ekranu: lewa — tapeta, prawa — kontakt (L0 26.10.2026) */
        position: fixed;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 3;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px 12px;
        padding: 18px max(env(safe-area-inset-right), 20px) max(env(safe-area-inset-bottom), 8px) max(env(safe-area-inset-left), 16px);
        background: linear-gradient(0deg, rgba(3, 4, 8, 0.9) 0%, rgba(3, 4, 8, 0) 100%);
        font-size: 0.74rem;
        color: rgba(243, 229, 200, 0.65);
        box-sizing: border-box;
      }
      #ccOmniModal { padding-bottom: 76px; }
      .cc-omni-footer-left {
        display: flex;
        align-items: center;
        gap: 4px 10px;
        flex-wrap: wrap;
        min-width: 0;
      }
      .cc-omni-footlink {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        min-height: 44px;
        padding: 0 10px;
        border: 0;
        border-radius: 22px;
        background: transparent;
        color: #fff;
        font: 600 0.84rem/1 inherit;
        cursor: pointer;
      }
      .cc-omni-footlink svg { color: var(--omni-gold); }
      .cc-omni-footlink:hover, .cc-omni-footlink:focus-visible { background: rgba(255, 255, 255, 0.1); outline: none; }
      .cc-omni-footlink[hidden] { display: none; }
      .cc-omni-credit { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      @media (max-width: 480px) {
        .cc-omni-credit { display: none; }
      }
      .cc-omni-footer-hints { display: none; }
      .cc-omni-kbd {
        border: 1px solid var(--omni-line);
        border-radius: 5px;
        padding: 2px 6px;
        font: inherit;
      }
      .cc-omni-footer-right {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-shrink: 0;
      }
      .cc-omni-iconbtn {
        width: 44px;
        height: 44px;
        border: 0;
        border-radius: 50%;
        background: transparent;
        color: var(--omni-gold);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        text-decoration: none;
      }
      .cc-omni-iconbtn:hover, .cc-omni-iconbtn:focus-visible { background: rgba(255, 255, 255, 0.12); color: var(--omni-gold-hover); outline: none; }
      .cc-omni-share-msg { font-size: 0.8rem; color: #fff; white-space: nowrap; }
      .cc-omni-share-msg:empty { display: none; }
      .cc-omni-view-all {
        color: #fff;
        text-decoration: none;
        font-weight: 600;
        font-size: 0.84rem;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        min-height: 44px;
        padding: 0 10px;
        border-radius: 22px;
        flex-shrink: 0;
      }
      .cc-omni-view-all svg { color: var(--omni-gold); }
      .cc-omni-view-all:hover, .cc-omni-view-all:focus-visible { background: rgba(255, 255, 255, 0.1); outline: none; }
      /* PLAY/STOP Radia CC w górnej belce (liczy się do /milion przez cc-radio-milion.js) */
      .cc-omni-radio {
        width: 44px;
        height: 44px;
        min-width: 44px;
        min-height: 44px;
        border: 0;
        border-radius: 50%;
        padding: 0;
        background: transparent;
        color: var(--omni-gold);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        flex-shrink: 0;
        transition: background-color 0.15s, transform 0.15s, color 0.15s;
      }
      .cc-omni-radio:hover, .cc-omni-radio:focus-visible {
        background: rgba(255, 255, 255, 0.12);
        color: var(--omni-gold-hover);
        transform: scale(1.08);
        outline: none;
      }
      .cc-omni-radio:active { transform: scale(0.95); }
      .cc-omni-radio svg {
        width: 22px;
        height: 22px;
        color: inherit;
        flex-shrink: 0;
      }
      .cc-omni-radio .cc-i-stop, .cc-omni-radio[aria-pressed="true"] .cc-i-play { display: none; }
      .cc-omni-radio[aria-pressed="true"] .cc-i-stop { display: block; color: var(--omni-gold-hover); }
      .cc-omni-radio.cc-loading { opacity: 0.6; }
      /* Gwiazdka ulubionych w belce wyszukiwarki: sama ikona, bez kwadratowej ramki (L0 26.10.2026) */
      #ccOmniOverlay .cc-topbar-fav-btn {
        border: 0;
        border-radius: 50%;
        background: transparent;
        backdrop-filter: none;
        -webkit-backdrop-filter: none;
        box-shadow: none;
        color: var(--omni-gold);
        margin: 0;
      }
      #ccOmniOverlay .cc-topbar-fav-btn:hover, #ccOmniOverlay .cc-topbar-fav-btn:focus-visible {
        background: rgba(255, 255, 255, 0.12);
        transform: none;
        outline: none;
      }
      #ccOmniOverlay .cc-topbar-fav-btn:hover svg { stroke: var(--omni-gold-hover); }
      #ccOmniOverlay .cc-topbar-fav-btn.is-active { background: transparent; box-shadow: none; }
      #ccOmniOverlay .cc-topbar-fav-btn.is-active svg { fill: var(--omni-gold); stroke: var(--omni-gold); }
      @media (max-width: 440px) {
        .cc-omni-toplink span { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
        .cc-omni-toplink { padding: 0; width: 44px; justify-content: center; }
      }
      /* Trzy koła (Wszystko, PLAY, konto) z odstępem, żeby ich poświaty się nie stykały (L0 26.10.2026) */
      .cc-omni-topnav .cc-omni-apps-wrap { margin-left: 10px; }
      .cc-omni-topnav .cc-omni-radio,
      .cc-omni-topnav .cc-omni-account { margin-left: 16px; }
      @media (max-width: 440px) {
        .cc-omni-topnav .cc-omni-apps-wrap { margin-left: 6px; }
        .cc-omni-topnav .cc-omni-radio,
        .cc-omni-topnav .cc-omni-account { margin-left: 12px; }
      }
      /* /wyszukiwarka — pełna gotowość do natychmiastowego wyszukiwania (Spotlight/Raycast) */
`;
    document.head.appendChild(style);
  }

  function mountModal() {
    if (document.getElementById('ccOmniOverlay')) return;
    ensureStyles();

    const overlay = document.createElement('div');
    overlay.id = 'ccOmniOverlay';
    if (isStandalonePage) {
      overlay.classList.add('cc-standalone');
    }
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Uniwersalna wyszukiwarka ekosystemu Christian Culture');

    overlay.innerHTML = `
      <div id="ccOmniModal">
        <div class="cc-omni-top">
          <nav class="cc-omni-topnav" aria-label="Szybki dostęp">
            <a class="cc-omni-toplink" href="/mess" aria-label="Czat" title="Czat">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 5.5A3.5 3.5 0 0 1 6.5 2h6A3.5 3.5 0 0 1 16 5.5v3A3.5 3.5 0 0 1 12.5 12H8l-3.5 3v-3.2A3.5 3.5 0 0 1 3 8.5Z"/><path d="M18 8.2a3.5 3.5 0 0 1 3 3.5v2.8a3.5 3.5 0 0 1-2 3.2V21l-3.4-2.8H12a3.5 3.5 0 0 1-3.2-2h3.7A5.5 5.5 0 0 0 18 10.7Z"/></svg>
            </a>
            <a class="cc-omni-toplink" href="/news" aria-label="Nowości CCN" title="Nowości CCN">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" aria-hidden="true"><path d="M7 4h13v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8h3"/><path d="M7 4v14M11 8h5M11 12h5M11 16h5"/></svg>
            </a>
            <div class="cc-omni-apps-wrap">
              <button type="button" id="ccOmniApps" class="cc-omni-toplink cc-omni-apps-btn" aria-label="Wszystko: aplikacje Christian Culture" title="Wszystko — aplikacje Christian Culture" aria-expanded="false" aria-controls="ccOmniAppsMenu">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <rect x="3" y="3" width="4.5" height="4.5" rx="1"/>
                  <rect x="9.75" y="3" width="4.5" height="4.5" rx="1"/>
                  <rect x="16.5" y="3" width="4.5" height="4.5" rx="1"/>
                  <rect x="3" y="9.75" width="4.5" height="4.5" rx="1"/>
                  <rect x="9.75" y="9.75" width="4.5" height="4.5" rx="1"/>
                  <rect x="16.5" y="9.75" width="4.5" height="4.5" rx="1"/>
                  <rect x="3" y="16.5" width="4.5" height="4.5" rx="1"/>
                  <rect x="9.75" y="16.5" width="4.5" height="4.5" rx="1"/>
                  <rect x="16.5" y="16.5" width="4.5" height="4.5" rx="1"/>
                </svg>
              </button>
              <div id="ccOmniAppsMenu" class="cc-omni-apps" hidden>
                <p class="cc-omni-apps-title">Cały ekosystem Christian Culture</p>
                ${renderAppsGrid()}
              </div>
            </div>
            <button type="button" id="ccOmniRadio" class="cc-omni-toplink cc-omni-radio" aria-pressed="false" aria-label="Słuchaj Radia Christian Culture" title="Radio Christian Culture">
              <svg class="cc-i-play" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M7 4.5v15a1 1 0 0 0 1.5.86l12-7.5a1 1 0 0 0 0-1.72l-12-7.5A1 1 0 0 0 7 4.5Z"/>
              </svg>
              <svg class="cc-i-stop" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <rect x="5.5" y="5.5" width="13" height="13" rx="2.5"/>
              </svg>
            </button>
            <a class="cc-omni-account" id="ccOmniAccount" href="/lumina-login" aria-label="Zaloguj przez Google do LUMINA" title="Twoje konto LUMINA">
              <span class="cc-omni-account-face" aria-hidden="true"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg></span>
            </a>
          </nav>
${isStandalonePage ? '' : `
          <button type="button" id="ccOmniClose" class="cc-omni-btn" aria-label="Zamknij wyszukiwarkę" title="Zamknij (Esc)">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
`}
        </div>
        <div class="cc-omni-hero"><p class="cc-omni-brand"><img src="/images/search/christian-culture-gold.png" width="1774" height="887" alt="Christian Culture" decoding="async" fetchpriority="high"></p></div>
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
          <button type="button" id="ccOmniEngine" class="cc-omni-btn cc-omni-engine" aria-pressed="false" aria-label="Szukaj w całym internecie przez Google" title="Przełącz: Christian Culture / Google">
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22.6 12.3c0-.8-.1-1.5-.2-2.2H12v4.3h6a5.1 5.1 0 0 1-2.2 3.3v2.8h3.6c2-1.9 3.2-4.7 3.2-8.2Z"/><path fill="#34A853" d="M12 23c3 0 5.5-1 7.4-2.7l-3.6-2.8c-1 .7-2.3 1.1-3.8 1.1-2.9 0-5.4-2-6.3-4.6H2v2.9A11 11 0 0 0 12 23Z"/><path fill="#FBBC05" d="M5.7 14a6.6 6.6 0 0 1 0-4.2V7H2a11 11 0 0 0 0 10l3.7-3Z"/><path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.3 1.7l3.2-3.2A11 11 0 0 0 2 7l3.7 2.9C6.6 7.3 9.1 5.4 12 5.4Z"/></svg>
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
          <div class="cc-omni-footer-left">
            <button type="button" id="ccOmniWallBtn" class="cc-omni-footlink">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/></svg>
              <span>Zmień tapetę</span>
            </button>
            <button type="button" id="ccOmniWallReset" class="cc-omni-footlink" hidden>Przywróć tło</button>
            <input type="file" id="ccOmniWallFile" accept="image/*" hidden>
            <span id="ccOmniCredit" class="cc-omni-credit">Tło: Galaktyka Andromedy · fot. Unsplash</span>
          </div>
          <div class="cc-omni-footer-right">
            <span id="ccOmniShareMsg" class="cc-omni-share-msg" role="status" aria-live="polite"></span>
            <button type="button" id="ccOmniShare" class="cc-omni-iconbtn" aria-label="Udostępnij wyszukiwarkę Christian Culture" title="Udostępnij">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/></svg>
            </button>
            <a href="/#contact-section" id="ccOmniContact" class="cc-omni-iconbtn" aria-label="Kontakt" title="Kontakt">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>
            </a>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    // The shared favorites script mounts asynchronously; keep the requested order.
    const topnav = overlay.querySelector('.cc-omni-topnav');
    const placeFavorite = () => {
      const favorite = topnav.querySelector('#ccTopBarFavBtn');
      const apps = topnav.querySelector('.cc-omni-apps-wrap');
      if (favorite && apps) {
        favoriteObserver.disconnect();
        topnav.insertBefore(favorite, apps);
      }
    };
    const favoriteObserver = new MutationObserver(placeFavorite);
    favoriteObserver.observe(topnav, { childList: true });
    placeFavorite();

    // Zdarzenia wewnątrz modala
    const input = document.getElementById('ccOmniInput');
    const clearBtn = document.getElementById('ccOmniClear');
    const closeBtn = document.getElementById('ccOmniClose');
    const filterChips = overlay.querySelectorAll('.cc-omni-filter-chip');

    overlay.addEventListener('click', (e) => {
      // Na /wyszukiwarka kliknięcie w tapetę odsłania panele, nie zamyka strony
      if (e.target === overlay && !isStandalonePage) closeSearch();
    });

    if (closeBtn) closeBtn.addEventListener('click', closeSearch);

    // Udostępnij wyszukiwarkę: systemowe okno udostępniania (telefon) albo skopiowanie linku (komputer)
    const shareBtn = document.getElementById('ccOmniShare');
    const shareMsg = document.getElementById('ccOmniShareMsg');
    const SHARE_URL = 'https://polskieradio.cc/wyszukiwarka';
    let shareTimer = 0;
    const flashShare = (text) => {
      shareMsg.textContent = text;
      clearTimeout(shareTimer);
      shareTimer = setTimeout(() => { shareMsg.textContent = ''; }, 2600);
    };
    shareBtn.addEventListener('click', async () => {
      const data = { title: 'Wyszukiwarka Christian Culture', text: 'Szukaj w całym ekosystemie Christian Culture — Słowo Boże, rozważania, radio, kanały i LUMINA:', url: SHARE_URL };
      if (navigator.share) {
        try { await navigator.share(data); return; } catch (e) { if (e && e.name === 'AbortError') return; }
      }
      try {
        await navigator.clipboard.writeText(SHARE_URL);
        flashShare('Skopiowano link');
      } catch (_) {
        window.prompt('Skopiuj link do wyszukiwarki:', SHARE_URL);
      }
    });

    // Własna tapeta: obraz zmniejszany w przeglądarce i zapamiętywany tylko na tym urządzeniu (bez wysyłania na serwer)
    const WALL_KEY = 'cc_search_wallpaper';
    const wallBtn = document.getElementById('ccOmniWallBtn');
    const wallReset = document.getElementById('ccOmniWallReset');
    const wallFile = document.getElementById('ccOmniWallFile');
    const credit = document.getElementById('ccOmniCredit');
    const DEFAULT_CREDIT = credit.textContent;
    const applyWall = (dataUrl) => {
      overlay.style.backgroundImage = dataUrl ? `url("${dataUrl}")` : '';
      wallReset.hidden = !dataUrl;
      credit.textContent = dataUrl ? 'Tło: Twoja tapeta' : DEFAULT_CREDIT;
    };
    try { applyWall(localStorage.getItem(WALL_KEY)); } catch (_) {}
    wallBtn.addEventListener('click', () => wallFile.click());
    wallReset.addEventListener('click', () => {
      try { localStorage.removeItem(WALL_KEY); } catch (_) {}
      applyWall(null);
    });
    wallFile.addEventListener('change', () => {
      const file = wallFile.files && wallFile.files[0];
      wallFile.value = '';
      if (!file || !/^image\//.test(file.type)) return;
      const img = new Image();
      const src = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(src);
        // Kilka prób: coraz mniejszy obraz, aż zmieści się w pamięci przeglądarki
        for (const [side, quality] of [[1920, 0.82], [1440, 0.75], [1024, 0.7]]) {
          const scale = Math.min(1, side / Math.max(img.naturalWidth, img.naturalHeight));
          const canvas = document.createElement('canvas');
          canvas.width = Math.round(img.naturalWidth * scale);
          canvas.height = Math.round(img.naturalHeight * scale);
          canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          try {
            localStorage.setItem(WALL_KEY, dataUrl);
            applyWall(dataUrl);
            return;
          } catch (_) {}
        }
        applyWall(canvas2Url(img)); // pamięć pełna: tapeta tylko do zamknięcia strony
      };
      img.onerror = () => URL.revokeObjectURL(src);
      img.src = src;
    });
    function canvas2Url(img) {
      const canvas = document.createElement('canvas');
      const scale = Math.min(1, 1024 / Math.max(img.naturalWidth, img.naturalHeight));
      canvas.width = Math.round(img.naturalWidth * scale);
      canvas.height = Math.round(img.naturalHeight * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL('image/jpeg', 0.7);
    }

    // PLAY/STOP Radia CC: wspólny odtwarzacz ekosystemu (cc-chat-radio.js); start liczy się do /milion (cc-radio-milion.js)
    const radioBtn = document.getElementById('ccOmniRadio');
    const loadScript = (src) => new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
    let radioReady = null;
    const ensureRadio = () => radioReady || (radioReady = (async () => {
      if (!window.CCRadioStations) await loadScript('/js/cc-radio-catalog.js?v=20261025_repertoire');
      if (!window.CCChatRadio) await loadScript('/js/cc-chat-radio.js?v=20261026_spectrum1');
      if (!window.CCRadioMilion) await loadScript('/js/cc-radio-milion.js?v=20261011_2');
      window.CCChatRadio.subscribe((st) => {
        radioBtn.setAttribute('aria-pressed', String(!!st.playing));
        radioBtn.setAttribute('aria-label', st.playing ? 'Zatrzymaj Radio Christian Culture' : 'Słuchaj Radia Christian Culture');
      });
      return window.CCChatRadio;
    })());
    radioBtn.addEventListener('click', async () => {
      radioBtn.classList.add('cc-loading');
      try {
        const radio = await ensureRadio();
        if (radio.state().playing) {
          radio.pause();
        } else {
          const id = radio.state().stationId || 'poland';
          await radio.prepare(id);
          radio.select(id);
          await radio.play();
        }
      } catch (_) {
        radioBtn.setAttribute('aria-label', 'Radio chwilowo niedostępne — spróbuj ponownie');
        radioReady = null;
      } finally {
        radioBtn.classList.remove('cc-loading');
      }
    });
    // Jeśli radio już gra na tej stronie, przycisk od razu pokazuje STOP
    if (window.CCChatRadio) ensureRadio();

    // Przełącznik G: Christian Culture ↔ Google (cały internet)
    const engineBtn = document.getElementById('ccOmniEngine');
    const field = overlay.querySelector('.cc-omni-field');
    const applyEngine = () => {
      const g = searchEngine === 'google';
      engineBtn.setAttribute('aria-pressed', String(g));
      engineBtn.setAttribute('aria-label', g ? 'Wróć do wyszukiwania w Christian Culture' : 'Szukaj w całym internecie przez Google');
      field.classList.toggle('cc-engine-google', g);
      input.placeholder = g ? 'Szukaj w Google…' : 'Zapytaj Christian Culture…';
    };
    applyEngine();
    engineBtn.addEventListener('click', () => {
      searchEngine = searchEngine === 'google' ? 'cc' : 'google';
      try { localStorage.setItem(ENGINE_KEY, searchEngine); } catch (_) {}
      applyEngine();
      renderResults(input.value, activeFilter);
      input.focus();
    });

    // Skrót „Ulubione” rozwija listę ulubionych pod skrótami
    overlay.addEventListener('click', (e) => {
      const favBtn = e.target.closest('[data-omni-action="favorites"]');
      if (!favBtn) return;
      const section = document.getElementById('ccOmniFavs');
      if (!section) return;
      section.hidden = !section.hidden;
      favBtn.setAttribute('aria-expanded', String(!section.hidden));
      if (!section.hidden) section.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });

    // „Wszystko”: menu aplikacji ekosystemu
    const appsBtn = document.getElementById('ccOmniApps');
    const appsMenu = document.getElementById('ccOmniAppsMenu');
    const setApps = (open) => { appsMenu.hidden = !open; appsBtn.setAttribute('aria-expanded', String(open)); };
    appsBtn.addEventListener('click', (e) => { e.stopPropagation(); setApps(appsMenu.hidden); });
    overlay.addEventListener('click', (e) => { if (!appsMenu.hidden && !e.target.closest('.cc-omni-apps-wrap')) setApps(false); });
    overlay.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !appsMenu.hidden) { e.stopPropagation(); setApps(false); appsBtn.focus(); } }, true);

    // Logowanie Google — LUMINA: zalogowany widzi swój inicjał/zdjęcie, niezalogowany loguje się przez Google
    const account = document.getElementById('ccOmniAccount');
    let session = null;
    try {
      if (localStorage.getItem('lumina_user_session') === 'active') {
        const user = JSON.parse(localStorage.getItem('lumina_current_user') || 'null');
        if (user && (user.uid || user.email)) session = user;
      }
    } catch (_) {}
    if (session) {
      const name = session.displayName || (session.email ? session.email.split('@')[0] : 'LUMINA');
      account.href = '/lumina';
      account.setAttribute('aria-label', 'Twoje konto LUMINA: ' + name);
      if (session.photoURL && /^https:\/\//.test(session.photoURL)) {
        const img = document.createElement('img');
        img.src = session.photoURL;
        img.alt = '';
        img.referrerPolicy = 'no-referrer';
        account.replaceChildren(img);
      } else {
        account.querySelector('.cc-omni-account-face').textContent = name.trim().charAt(0).toUpperCase() || 'C';
      }
    } else {
      account.addEventListener('click', (e) => {
        if (typeof window.ccLoginWithGoogle === 'function') {
          e.preventDefault();
          window.ccLoginWithGoogle(location.pathname + location.search);
        }
      });
    }

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
      if (isStandalonePage) {
        const q = val.trim();
        history.replaceState(null, '', q ? '/wyszukiwarka?q=' + encodeURIComponent(q) : '/wyszukiwarka');
      }
    });

    input.addEventListener('keydown', handleKeyNavigation);

    // Wyszukiwanie głosem (Web Speech API) — przycisk pojawia się tylko, gdy przeglądarka je obsługuje
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const micBtn = document.getElementById('ccOmniMic');
    // Nagłówek Permissions-Policy może zablokować mikrofon — wtedy nie pokazujemy martwego przycisku
    const policy = document.permissionsPolicy || document.featurePolicy;
    const micAllowed = !policy || typeof policy.allowsFeature !== 'function' || policy.allowsFeature('microphone');
    if (Recognition && micBtn && micAllowed) {
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
        recognizer.onerror = (ev) => {
          const messages = {
            'not-allowed': 'Zezwól na mikrofon w ustawieniach przeglądarki',
            'service-not-allowed': 'Zezwól na mikrofon w ustawieniach przeglądarki',
            'no-speech': 'Nie usłyszałem — spróbuj jeszcze raz',
            'audio-capture': 'Nie znaleziono mikrofonu',
            'network': 'Brak połączenia z usługą rozpoznawania mowy'
          };
          input.value = '';
          input.placeholder = messages[ev.error] || 'Wyszukiwanie głosowe niedostępne';
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
        if (searchEngine === 'google' && val) window.location.href = googleUrl(val);
        else window.location.href = `/szukaj?q=${encodeURIComponent(val)}`;
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

    let html = '';

    // Tryb Google: pierwszy wynik prowadzi do wyszukiwania w całym internecie, poniżej materiały CC
    if (searchEngine === 'google') {
      html += `
        <a class="cc-omni-google-go" href="${escapeHtml(googleUrl(query))}">
          <span class="cc-omni-google-g" aria-hidden="true">G</span>
          <span><b>Szukaj „${escapeHtml(query)}” w Google</b><small>Naciśnij Enter, aby otworzyć wyniki z całego internetu</small></span>
        </a>
        <p class="cc-omni-google-sub">Z ekosystemu Christian Culture:</p>`;
    }

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
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2l1.1-6.2L3 9.6l6.2-.9Z"/>',
    channels: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    film: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4"/>',
    music: '<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18M12 14v4M10 16h4"/>',
    bible: '<path d="M5 4a2 2 0 0 1 2-2h12v18H7a2 2 0 0 0-2 2Z"/><path d="M5 20V4M12 6v8M9 9h6"/>',
    quote: '<path d="M7 7h4v4c0 3-1.5 5-4 6M15 7h4v4c0 3-1.5 5-4 6"/>',
    cross: '<path d="M12 2v20M7 7h10"/>',
    pray: '<path d="M12 3v7l-3 4v7M12 10l3 4v7M9 14l-4 2M15 14l4 2"/>',
    chat: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    map: '<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3Z"/><path d="M9 3v15M15 6v15"/>',
    heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>'
  };
  const svgIcon = (name, size = 22) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${HOME_ICONS[name] || ''}</svg>`;
  // Menu „Wszystko”: cały ekosystem w sekcjach z rejestru linków (L0 24.10.2026); każdy adres sprawdzony 26.10.2026 (200).
  // Pominięte: uslugi/centrum/randka.cclite.pl (brak DNS) — do decyzji L0.
  const APP_ICONS = {
    worship: '<path d="M12 21s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.6-7 10-7 10Z"/><path d="M12 9v6M9.5 11.5h5"/>',
    karaoke: '<circle cx="15" cy="8" r="4"/><path d="m12.2 10.8-8.5 8.5 1 1 8.5-8.5"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
    scroll: '<path d="M7 4h11a2 2 0 0 1 0 4h-1v10a2 2 0 0 1-2 2H6a2 2 0 0 1 0-4h1Z"/><path d="M10 9h4M10 13h4"/>',
    download: '<path d="M12 3v12M7 10l5 5 5-5M4 19h16"/>',
    flask: '<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3"/><path d="M7.5 15h9"/>',
    columns: '<path d="M3 21h18M4 9h16M12 3 3 8h18ZM6 9v9M10 9v9M14 9v9M18 9v9"/>',
    shield: '<path d="M12 3 4 6v6c0 4.5 3.4 8.3 8 9 4.6-.7 8-4.5 8-9V6Z"/><path d="m9 12 2 2 4-4"/>',
    brain: '<path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 6 1V5a2 2 0 0 0-3-1ZM15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-6 1"/>',
    family: '<circle cx="8" cy="7" r="3"/><circle cx="16" cy="7" r="3"/><path d="M2 20a6 6 0 0 1 12 0M10 20a6 6 0 0 1 12 0"/>',
    school: '<path d="m2 9 10-5 10 5-10 5Z"/><path d="M6 11v5c3 2 9 2 12 0v-5"/>',
    coins: '<ellipse cx="9" cy="7" rx="6" ry="3"/><path d="M3 7v5c0 1.7 2.7 3 6 3s6-1.3 6-3V7M9 15v3c0 1.7 2.7 3 6 3s6-1.3 6-3v-5c0-1.7-2.7-3-6-3"/>',
    cpu: '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>',
    plane: '<path d="M10.5 13.5 3 11l1.5-1.5 8 1L17 6a2 2 0 0 1 3 3l-4.5 4.5 1 8L15 23l-2.5-7.5L8 19v3l-1.5 1-1-4-4-1L3 16.5h3Z"/>',
    library: '<path d="M4 4h4v16H4ZM10 4h4v16h-4ZM16 5l3.5-1 3 15.5-3.5 1Z"/>',
    pen: '<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
    bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7Z"/>',
    tent: '<path d="M12 3 2 21h20ZM12 3v18M8 21l4-7 4 7"/>',
    ban: '<circle cx="12" cy="12" r="9"/><path d="m5.6 5.6 12.8 12.8"/>',
    board: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>',
    video: '<rect x="6" y="2" width="12" height="20" rx="3"/><path d="m11 9 4 3-4 3Z"/>',
    phone: '<rect x="6" y="2" width="12" height="20" rx="3"/><path d="M11 18h2"/>',
    hands: '<path d="m11 17 2 2a1 1 0 1 0 3-3"/><path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.9-3.9a3 3 0 0 0-4.2 0l-.9.9a1 1 0 1 1-3-3l2.8-2.8a5.8 5.8 0 0 1 7.1-.9l.5.3a2 2 0 0 0 1.4.3L21 4M3 3l.5.5L9 9"/>',
    broadcast: '<circle cx="12" cy="12" r="2"/><path d="M16.2 7.8a6 6 0 0 1 0 8.4M7.8 16.2a6 6 0 0 1 0-8.4M19.1 4.9a10 10 0 0 1 0 14.2M4.9 19.1a10 10 0 0 1 0-14.2"/>',
    idcard: '<rect x="2" y="5" width="20" height="14" rx="2"/><circle cx="8" cy="12" r="2.5"/><path d="M13 10h5M13 14h3"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    palette: '<path d="M12 3a9 9 0 0 0 0 18c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.3-.3-.4-.5-.8-.5-1.3 0-1.1.9-2 2-2h2.4A4.6 4.6 0 0 0 21 9.8C21 6 17 3 12 3Z"/><circle cx="7.5" cy="11.5" r="1"/><circle cx="10.5" cy="7.5" r="1"/><circle cx="15.5" cy="7.5" r="1"/>',
    counter: '<path d="M3 12h4l3-8 4 16 3-8h4"/>',
    sparkle: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>'
  };
  Object.assign(HOME_ICONS, APP_ICONS);
  const APPS_MENU = [
    { title: 'Słuchaj i oglądaj', items: [
      ['Radio', '/player', 'radio'], ['TV 24', '/cctv24', 'tv'], ['Kanały', '/kanaly', 'channels'],
      ['Podcasty', '/podcasty', 'mic'], ['Kino VOD', '/vod', 'film'], ['Muzyka', '/music', 'music'],
      ['Uwielbienie', '/BiblijneUwielbienie', 'worship'], ['Karaoke', '/karaoke-studio', 'karaoke'], ['CC Network', '/network', 'globe']
    ] },
    { title: 'Słowo i modlitwa', items: [
      ['Akademia', '/akademia', 'book'], ['Lekcja dnia', '/akademia/kurscodzienny', 'calendar'], ['MojaBiblia', '/mojabiblia', 'bible'],
      ['Werset dnia', '/werset-dnia', 'quote'], ['Ewangelia', '/Ewangelia', 'cross'], ['Modlitwa 24/7', '/BCM24', 'pray'],
      ['Za Polskę', '/zapolske-live', 'flag'], ['Apokalipsa', '/apokalipsa-live', 'scroll'], ['Kalendarz', '/kalendarz', 'calendar'],
      ['Biblia PDF', '/biblia-do-pobrania', 'download']
    ] },
    { title: 'Wiedza CCN', items: [
      ['Portal CCN', '/news', 'news'], ['Nauka', '/nauka', 'flask'], ['Historia', '/historia', 'columns'],
      ['Apologetyka', '/apologetyka', 'shield'], ['Psychologia', '/psychologia', 'brain'], ['Małżeństwo', '/seks', 'family'],
      ['Edukacja', '/edukacja', 'school'], ['Finanse', '/finanse', 'coins'], ['Technologie', '/technologie', 'cpu'],
      ['Misje', '/misje', 'plane'], ['Biblioteka', '/biblioteka', 'library'], ['Książki autora', '/ksiazki-autora', 'pen'],
      ['eM Motywacja', '/em', 'bolt'], ['Survival', '/survival', 'tent'], ['#antyHALLOWEEN', '/Halloween', 'ban']
    ] },
    { title: 'Społeczność', items: [
      ['LUMINA', '/lumina', 'people'], ['Tablica', '/tablica', 'board'], ['LUMI Mess', '/mess', 'chat'],
      ['Shorts', '/shorts', 'video'], ['Moje Centrum', '/moje-centrum', 'user'], ['CC Lite', 'https://cclite.pl', 'phone']
    ] },
    { title: 'Współpraca, usługi i wsparcie', items: [
      ['Wspieraj', '/wspieraj', 'heart'], ['Współpraca', '/wspolpraca', 'hands'], ['Nadawaj z nami', '/nadawaj', 'broadcast'],
      ['Wizytówki', '/wizytowki', 'idcard'], ['Coaching', '/holistyczny-coaching', 'target'], ['Kreator YIS', '/YIS', 'palette'],
      ['Milion', '/milion', 'counter'], ['HOLOS', '/holos', 'sparkle'], ['Mapa', '/mapa', 'map'],
      ['O nas', '/o-nas', 'info'], ['Kontakt', '/#contact-section', 'mail'], ['Prywatność', '/privacy', 'lock']
    ] }
  ];
  function renderAppsGrid() {
    return APPS_MENU.map(sec => `<p class="cc-omni-apps-sec">${escapeHtml(sec.title)}</p><div class="cc-omni-apps-grid">` +
      sec.items.map(([label, url, icon]) => `<a href="${url}"${/^https?:/.test(url) ? ' target="_blank" rel="noopener"' : ''}><span class="cc-omni-app-ico">${svgIcon(icon, 20)}</span>${escapeHtml(label)}</a>`).join('') +
      '</div>').join('');
  }

  const HOME_SHORTCUTS = [
    { label: 'YouTube', url: 'https://www.youtube.com/@ChristianCultureTV', icon: 'play', external: true },
    { label: 'Kanały', url: '/kanaly', icon: 'tv' },
    { label: 'Akademia', url: '/akademia', icon: 'book' },
    { label: 'Podcasty', url: '/podcasty', icon: 'mic' },
    { label: 'Portal CCN', url: '/news', icon: 'news' },
    { label: 'LUMINA', url: '/lumina', icon: 'people' },
    { label: 'Ulubione', action: 'favorites', icon: 'star' },
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
    // 1. Ostatnie wyszukiwania użytkownika
    const recents = getRecentSearches();
    const recentsHtml = recents.length ? `
      <div class="cc-omni-recents-bar" role="region" aria-label="Ostatnie wyszukiwania">
        <div class="cc-omni-recents-header">
          <span class="cc-omni-recents-title">${svgIcon('clock', 14)} Ostatnie wyszukiwania</span>
          <button type="button" class="cc-omni-recents-clear" data-omni-action="clear-recents" title="Wyczyść historię wyszukiwania">Wyczyść historię</button>
        </div>
        <div class="cc-omni-recents-pills">
          ${recents.map(r => `
            <span class="cc-omni-recent-pill">
              <button type="button" class="cc-omni-recent-query" data-search-query="${escapeHtml(r)}">${escapeHtml(r)}</button>
              <button type="button" class="cc-omni-recent-del" data-remove-query="${escapeHtml(r)}" aria-label="Usuń ${escapeHtml(r)} z historii">×</button>
            </span>
          `).join('')}
        </div>
      </div>` : '';

    // 2. Popularne tematy / szybkie tagi
    const tags = [
      { label: '#Apokalipsa', query: 'Apokalipsa' },
      { label: '#KursCodzienny', query: 'Kurs Codzienny' },
      { label: '#WersetDnia', query: 'Werset Dnia' },
      { label: '#DobrzeŻeJesteś', query: 'Dobrze, że jesteś' },
      { label: '#Radio24/7', query: 'Radio CC' },
      { label: '#Lumina', query: 'LUMINA' },
      { label: '#Wizytówki', query: 'Wizytówki' },
      { label: '#Modlitwa', query: 'Modlitwa' },
      { label: '#Pomoc', query: 'Pomoc' }
    ];
    const tagsHtml = `
      <div class="cc-omni-tags-bar" role="navigation" aria-label="Popularne tematy">
        <span class="cc-omni-tags-label">${svgIcon('sparkle', 14)} Popularne tematy:</span>
        <div class="cc-omni-tags-list">
          ${tags.map(t => `<button type="button" class="cc-omni-tag-chip" data-search-query="${escapeHtml(t.query)}">${escapeHtml(t.label)}</button>`).join('')}
        </div>
      </div>`;

    // 3. 4 Kluczowe Filary Ekosystemu („Polecane Dziś”)
    const featuredCards = `
      <section class="cc-omni-featured-section" aria-label="Polecane dziś w Christian Culture">
        <div class="cc-omni-featured-head">
          <span class="cc-omni-featured-label">${svgIcon('star', 15)} Polecane Dziś w EkoCC</span>
        </div>
        <div class="cc-omni-featured-grid">
          <a class="cc-omni-feat-card" href="/player">
            <span class="cc-omni-feat-icon">${svgIcon('heart', 20)}</span>
            <span class="cc-omni-feat-info">
              <span class="cc-omni-feat-tag">Inspiracja na Dziś</span>
              <strong class="cc-omni-feat-title">Rozważanie „Dobrze, że jesteś”</strong>
              <span class="cc-omni-feat-desc">Codzienne słowo umocnienia, modlitwa i Boży pokój na każdy dzień.</span>
            </span>
            <span class="cc-omni-feat-arrow" aria-hidden="true">→</span>
          </a>
          <a class="cc-omni-feat-card" href="/akademia#kurscodzienny">
            <span class="cc-omni-feat-icon">${svgIcon('book', 20)}</span>
            <span class="cc-omni-feat-info">
              <span class="cc-omni-feat-tag">Akademia Biblijna</span>
              <strong class="cc-omni-feat-title">Lekcja Dnia: Z Biblią za Pan Brat</strong>
              <span class="cc-omni-feat-desc">Codzienne studium Pisma Świętego werset po wersecie z komentarzem.</span>
            </span>
            <span class="cc-omni-feat-arrow" aria-hidden="true">→</span>
          </a>
          <a class="cc-omni-feat-card" href="/podcasty">
            <span class="cc-omni-feat-icon">${svgIcon('mic', 20)}</span>
            <span class="cc-omni-feat-info">
              <span class="cc-omni-feat-tag">Podcast Spotify SDS</span>
              <strong class="cc-omni-feat-title">APOKALIPSA — Księga Nadziei</strong>
              <span class="cc-omni-feat-desc">Profetyczny cykl wykładów biblijnych Studia Dobrego Słowa.</span>
            </span>
            <span class="cc-omni-feat-arrow" aria-hidden="true">→</span>
          </a>
          <a class="cc-omni-feat-card" href="/player">
            <span class="cc-omni-feat-icon">${svgIcon('radio', 20)}</span>
            <span class="cc-omni-feat-info">
              <span class="cc-omni-feat-tag">Nadajemy 24/7</span>
              <strong class="cc-omni-feat-title">Radio Christian Culture & Player</strong>
              <span class="cc-omni-feat-desc">Muzyka uwielbienia, słuchowiska Biblia Audio i stacje tematyczne.</span>
            </span>
            <span class="cc-omni-feat-arrow" aria-hidden="true">→</span>
          </a>
        </div>
      </section>`;

    // 4. Skróty do aplikacji
    const shortcuts = '<nav class="cc-omni-shortcuts" aria-label="Skróty ekosystemu">' + HOME_SHORTCUTS.map(sc => sc.action
      ? `<button type="button" class="cc-omni-shortcut" data-omni-action="${sc.action}" aria-expanded="false" aria-controls="ccOmniFavs"><span>${svgIcon(sc.icon)}</span><span>${escapeHtml(sc.label)}</span></button>`
      : `<a class="cc-omni-shortcut" href="${sc.url}"${sc.external ? ' target="_blank" rel="noopener"' : ''}><span>${svgIcon(sc.icon)}</span><span>${escapeHtml(sc.label)}</span></a>`).join('') + '</nav>';

    // 5. Ulubione
    let favs = [];
    try { favs = JSON.parse(localStorage.getItem('cc_user_favorites') || '[]'); } catch (_) {}
    favs = (Array.isArray(favs) ? favs : []).filter(f => f && f.url && f.title).slice(0, 8);
    const favList = favs.length
      ? `<div class="cc-omni-continue-list">${favs.map(f => `<a class="cc-omni-continue-item" href="${escapeHtml(f.url)}"><span>${escapeHtml(f.icon || '★')}</span><span><b>${escapeHtml(f.title)}</b><small>${escapeHtml(f.category || 'Ulubione')}</small></span></a>`).join('')}</div>`
      : '<p class="cc-omni-favs-empty">Nie masz jeszcze ulubionych. Na dowolnej stronie Christian Culture kliknij gwiazdkę ☆, a strona pojawi się tutaj.</p>';
    const favSection = `
      <section class="cc-omni-continue" id="ccOmniFavs" aria-label="Ulubione" hidden>
        <div class="cc-omni-continue-head">${svgIcon('star', 16)}<span>Twoje ulubione</span></div>
        ${favList}
      </section>`;

    // 6. Ostatnio odwiedzane
    let history = [];
    try { history = JSON.parse(localStorage.getItem('cc_user_visit_history') || '[]'); } catch (_) {}
    history = (Array.isArray(history) ? history : []).filter(h => h && h.url && h.title && h.url !== location.pathname).slice(0, 4);
    const cont = history.length ? `
      <section class="cc-omni-continue" aria-label="Kontynuuj">
        <div class="cc-omni-continue-head">${svgIcon('clock', 16)}<span>Ostatnio odwiedzane</span></div>
        <div class="cc-omni-continue-list">${history.map(h => `<a class="cc-omni-continue-item" href="${escapeHtml(h.url)}"><span>${escapeHtml(h.icon || '✨')}</span><span><b>${escapeHtml(h.title)}</b><small>${escapeHtml(visitedLabel(h.visitedAt))}</small></span></a>`).join('')}</div>
      </section>` : '';

    // 7. Podpowiedzi klawiszowe (Raycast / Spotlight style)
    const proHelper = `
      <div class="cc-omni-pro-shortcuts" aria-hidden="true">
        <span><kbd>↑</kbd><kbd>↓</kbd> Nawiguj</span>
        <span><kbd>↵ Enter</kbd> Wybierz</span>
        <span><kbd>Esc</kbd> Zamknij</span>
        <span><kbd>Ctrl+K</kbd> / <kbd>/</kbd> Szukaj</span>
      </div>`;

    return '<div class="cc-omni-home">' + recentsHtml + tagsHtml + featuredCards + shortcuts + favSection + cont + proHelper + '</div>';
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
      if (initialQuery) {
        input.value = initialQuery;
        const clearBtn = document.getElementById('ccOmniClear');
        if (clearBtn) clearBtn.style.display = 'inline-flex';
      }
      setTimeout(() => {
        input.focus();
        input.select();
      }, 50);
    }
  }

  function closeSearch() {
    const overlay = document.getElementById('ccOmniOverlay');
    if (!overlay) return;
    if (isStandalonePage) {
      // Na własnym adresie zamknięcie wraca do poprzedniej strony CC albo na stronę główną
      const fromCC = !!document.referrer && new URL(document.referrer).origin === location.origin;
      if (fromCC && history.length > 1) history.back(); else location.href = '/';
      return;
    }
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
    performSearch: performSearch,
    getRecentSearches: getRecentSearches,
    saveRecentSearch: saveRecentSearch,
    removeRecentSearch: removeRecentSearch,
    clearRecentSearches: clearRecentSearches
  };

  // Uruchomienie po załadowaniu DOM
  const startPage = () => {
    wireDomSearchElements();
    if (isStandalonePage) {
      const q = new URLSearchParams(location.search).get('q') || '';
      // Wyszukiwarka domyślna przeglądarki w trybie Google: od razu wyniki z całego internetu
      if (q && searchEngine === 'google') { location.replace(googleUrl(q)); return; }
      openSearch(q);
    }
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startPage);
  } else {
    startPage();
  }

})();
