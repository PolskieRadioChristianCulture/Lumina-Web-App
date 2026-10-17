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
    'książki': ['ksiazki', 'sklep', 'biblioteka', 'literatura']
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
      const todayLesson = catalogData.items.find(i => {
        const t = normalizeStr(i.title);
        return t.includes(`dzien ${todayDay}`) || t.includes(`lekcja ${todayDay}`);
      });
      if (todayLesson) addSuggestion(todayLesson);

      // Lekcja fundamentalna 28 Kroków
      const fundLesson = catalogData.items.find(i => normalizeStr(i.title).includes(`lekcja ${todayDay}:`)) ||
                         catalogData.items.find(i => normalizeStr(i.title).includes('lekcja 01:') || normalizeStr(i.title).includes('lekcja 1:'));
      if (fundLesson) addSuggestion(fundLesson);

      // Mój Werset Dnia
      const werset = catalogData.items.find(i => normalizeStr(i.title).includes('werset dnia'));
      if (werset) addSuggestion(werset);

      // Kurs Codzienny / Akademia
      const akademia = catalogData.items.find(i => (i.url || '').includes('/akademia'));
      if (akademia) addSuggestion(akademia);
    }

    // 2. Przeszukanie katalogu pod kątem częściowych słów lub tolerancji literówek
    for (const item of catalogData.items) {
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
      for (const item of catalogData.items) {
        if (suggestions.length >= 6) break;
        if (item.featured) addSuggestion(item);
      }
    }

    return suggestions.slice(0, 8);
  }

  // 7. Inteligentne wyszukiwanie w pamięci (<2ms)
  function performSearch(query, filter = 'all') {
    if (!catalogData || !catalogData.items) return { items: [], guide: null, isSuggestion: false, suggestionNote: null };

    const normQuery = normalizeStr(query);
    if (!normQuery) {
      return {
        items: catalogData.items.filter(i => i.featured).slice(0, 8).map(i => Object.assign({}, i, { _meta: categorizeItem(i) })),
        guide: null,
        isSuggestion: false,
        suggestionNote: null
      };
    }

    const queryWords = normQuery.split(/\s+/).filter(Boolean);
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
    for (const item of catalogData.items) {
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
      else if (normTitle.includes(normQuery)) score += 60;
      else if (normTags.includes(normQuery)) score += 40;

      // Słowa zapytania z tolerancją literówek
      let primaryWordsMatched = 0;
      for (const w of queryWords) {
        if (normTitle.includes(w)) {
          score += 35;
          primaryWordsMatched++;
        } else if (normTags.includes(w)) {
          score += 25;
          primaryWordsMatched++;
        } else if (normDesc.includes(w)) {
          score += 15;
          primaryWordsMatched++;
        } else if (normContent.includes(w)) {
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
        if (normTitle.includes(syn)) score += 20;
        else if (normTags.includes(syn)) score += 12;
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
        const todayItem = catalogData.items.find(i => normalizeStr(i.title).includes(`dzien ${todayDay}`) || normalizeStr(i.title).includes(`lekcja ${todayDay}`));
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
          items: scored.slice(0, 16).map(s => Object.assign({}, s.item, { _meta: s.meta, isNearMatch: true })),
          guide: matchedGuide,
          isSuggestion: true,
          suggestionNote: `Brak pełnego dopasowania dla wszystkich słów. Proponujemy najbardziej zbliżone materiały z ekosystemu:`
        };
      }

      return {
        items: scored.slice(0, 16).map(s => Object.assign({}, s.item, { _meta: s.meta })),
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
      #ccOmniOverlay {
        position: fixed;
        inset: 0;
        z-index: 999999;
        background: rgba(8, 10, 15, 0.78);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        display: flex;
        align-items: flex-start;
        justify-content: center;
        padding: 4vh 16px 24px;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.22s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.22s;
        box-sizing: border-box;
      }
      #ccOmniOverlay.cc-open {
        opacity: 1;
        visibility: visible;
      }
      #ccOmniModal {
        width: 100%;
        max-width: 720px;
        max-height: 88vh;
        background: #11141c;
        border: 1px solid rgba(196, 163, 90, 0.4);
        border-radius: 20px;
        box-shadow: 0 25px 65px -10px rgba(0, 0, 0, 0.8), 0 0 30px rgba(196, 163, 90, 0.15);
        color: #f1f5f9;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        transform: translateY(-16px) scale(0.98);
        transition: transform 0.24s cubic-bezier(0.16, 1, 0.3, 1);
        box-sizing: border-box;
      }
      #ccOmniOverlay.cc-open #ccOmniModal {
        transform: translateY(0) scale(1);
      }
      /* Motyw Jasny */
      [data-theme="light"] #ccOmniModal,
      [data-lumina-theme="light"] #ccOmniModal,
      html.light #ccOmniModal,
      body.light #ccOmniModal {
        background: #ffffff;
        color: #0f172a;
        border-color: rgba(180, 140, 50, 0.35);
        box-shadow: 0 25px 65px -10px rgba(15, 23, 42, 0.25), 0 0 30px rgba(196, 163, 90, 0.12);
      }
      .cc-omni-header {
        display: flex;
        align-items: center;
        padding: 14px 18px;
        border-bottom: 1px solid rgba(196, 163, 90, 0.22);
        background: rgba(255, 255, 255, 0.02);
        gap: 12px;
        flex-shrink: 0;
      }
      .cc-omni-search-icon {
        color: #c4a35a;
        font-size: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      #ccOmniInput {
        flex: 1;
        background: transparent;
        border: none;
        outline: none;
        font-size: 1.12rem;
        font-weight: 500;
        color: inherit;
        padding: 8px 0;
        min-height: 44px;
        box-sizing: border-box;
      }
      #ccOmniInput::placeholder {
        color: #94a3b8;
        font-weight: 400;
      }
      .cc-omni-btn {
        background: transparent;
        border: 1px solid transparent;
        border-radius: 10px;
        color: #94a3b8;
        cursor: pointer;
        min-width: 44px;
        min-height: 44px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 15px;
        transition: all 0.15s;
        touch-action: manipulation;
        padding: 0;
        flex-shrink: 0;
      }
      .cc-omni-btn:hover, .cc-omni-btn:focus-visible {
        color: #c4a35a;
        background: rgba(196, 163, 90, 0.1);
        border-color: rgba(196, 163, 90, 0.3);
        outline: none;
      }
      .cc-omni-filters {
        display: flex;
        gap: 6px;
        padding: 10px 16px;
        border-bottom: 1px solid rgba(196, 163, 90, 0.15);
        overflow-x: auto;
        white-space: nowrap;
        background: rgba(0, 0, 0, 0.1);
        scrollbar-width: none;
        flex-shrink: 0;
      }
      .cc-omni-filters::-webkit-scrollbar { display: none; }
      .cc-omni-filter-chip {
        padding: 8px 14px;
        border-radius: 9999px;
        border: 1px solid rgba(196, 163, 90, 0.25);
        background: rgba(255, 255, 255, 0.04);
        color: #cbd5e1;
        font-size: 0.82rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.15s;
        min-height: 44px;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        touch-action: manipulation;
        flex-shrink: 0;
      }
      [data-theme="light"] .cc-omni-filter-chip,
      [data-lumina-theme="light"] .cc-omni-filter-chip {
        color: #475569;
        background: #f1f5f9;
        border-color: #cbd5e1;
      }
      .cc-omni-filter-chip:hover {
        background: rgba(196, 163, 90, 0.15);
        color: #c4a35a;
      }
      .cc-omni-filter-chip.active {
        background: #c4a35a;
        color: #0b0e14;
        border-color: #c4a35a;
      }
      .cc-omni-body {
        flex: 1;
        overflow-y: auto;
        padding: 14px 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      /* Przewodnik Tematyczny Ekosystemu */
      .cc-omni-guide {
        background: linear-gradient(135deg, rgba(196, 163, 90, 0.18) 0%, rgba(20, 24, 33, 0.7) 100%);
        border: 1px solid rgba(196, 163, 90, 0.45);
        border-radius: 14px;
        padding: 14px 16px;
        margin-bottom: 8px;
        box-shadow: 0 4px 18px rgba(0, 0, 0, 0.2);
      }
      [data-theme="light"] .cc-omni-guide,
      [data-lumina-theme="light"] .cc-omni-guide {
        background: linear-gradient(135deg, rgba(254, 243, 199, 0.9) 0%, rgba(255, 255, 255, 0.9) 100%);
        border-color: rgba(217, 119, 6, 0.4);
      }
      .cc-omni-guide-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: #c4a35a;
        margin-bottom: 6px;
      }
      [data-theme="light"] .cc-omni-guide-badge,
      [data-lumina-theme="light"] .cc-omni-guide-badge {
        color: #b45309;
      }
      .cc-omni-guide-topic {
        font-size: 1.02rem;
        font-weight: 700;
        margin: 0 0 6px;
        color: #f8fafc;
      }
      [data-theme="light"] .cc-omni-guide-topic,
      [data-lumina-theme="light"] .cc-omni-guide-topic {
        color: #0f172a;
      }
      .cc-omni-guide-summary {
        font-size: 0.88rem;
        line-height: 1.45;
        color: #cbd5e1;
        margin: 0 0 10px;
      }
      [data-theme="light"] .cc-omni-guide-summary,
      [data-lumina-theme="light"] .cc-omni-guide-summary {
        color: #334155;
      }
      .cc-omni-guide-pills {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      .cc-omni-guide-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(196, 163, 90, 0.3);
        color: #f1f5f9;
        text-decoration: none;
        font-size: 0.8rem;
        font-weight: 600;
        min-height: 44px;
        box-sizing: border-box;
        transition: all 0.15s;
      }
      [data-theme="light"] .cc-omni-guide-pill,
      [data-lumina-theme="light"] .cc-omni-guide-pill {
        background: #ffffff;
        color: #0f172a;
        border-color: rgba(180, 140, 50, 0.4);
      }
      .cc-omni-guide-pill:hover {
        background: #c4a35a;
        color: #0b0e14;
        border-color: #c4a35a;
      }
      /* Wyniki */
      .cc-omni-results-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .cc-omni-item {
        display: flex;
        align-items: flex-start;
        gap: 14px;
        padding: 12px 14px;
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.06);
        text-decoration: none;
        color: inherit;
        transition: all 0.14s;
        min-height: 44px;
        box-sizing: border-box;
      }
      [data-theme="light"] .cc-omni-item,
      [data-lumina-theme="light"] .cc-omni-item {
        background: #f8fafc;
        border-color: #e2e8f0;
      }
      .cc-omni-item:hover, .cc-omni-item.cc-active {
        background: rgba(196, 163, 90, 0.12);
        border-color: rgba(196, 163, 90, 0.45);
        transform: translateX(4px);
      }
      [data-theme="light"] .cc-omni-item:hover,
      [data-theme="light"] .cc-omni-item.cc-active {
        background: #fef3c7;
        border-color: #d97706;
      }
      .cc-omni-item-icon {
        font-size: 20px;
        padding-top: 2px;
        flex-shrink: 0;
      }
      .cc-omni-item-content {
        flex: 1;
        min-width: 0;
      }
      .cc-omni-item-title-row {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 4px;
      }
      .cc-omni-item-title {
        font-size: 0.96rem;
        font-weight: 700;
        color: #f8fafc;
        margin: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      [data-theme="light"] .cc-omni-item-title,
      [data-lumina-theme="light"] .cc-omni-item-title {
        color: #0f172a;
      }
      .cc-omni-item-badge {
        font-size: 0.72rem;
        font-weight: 600;
        padding: 2px 8px;
        border-radius: 9999px;
        background: rgba(196, 163, 90, 0.2);
        color: #c4a35a;
        white-space: nowrap;
      }
      [data-theme="light"] .cc-omni-item-badge {
        background: #e2e8f0;
        color: #475569;
      }
      .cc-omni-item-desc {
        font-size: 0.83rem;
        color: #94a3b8;
        line-height: 1.4;
        margin: 0;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      [data-theme="light"] .cc-omni-item-desc {
        color: #64748b;
      }
      .cc-omni-hl {
        background: rgba(196, 163, 90, 0.35);
        color: #ffe69c;
        border-radius: 3px;
        padding: 1px 3px;
        font-weight: 700;
      }
      [data-theme="light"] .cc-omni-hl {
        background: rgba(245, 158, 11, 0.3);
        color: #78350f;
      }
      .cc-omni-item-badge.cc-badge-suggestion {
        background: rgba(196, 163, 90, 0.3);
        color: #ffe69c;
        border: 1px solid rgba(196, 163, 90, 0.5);
      }
      [data-theme="light"] .cc-omni-item-badge.cc-badge-suggestion {
        background: rgba(245, 158, 11, 0.2);
        color: #92400e;
        border-color: rgba(217, 119, 6, 0.4);
      }
      .cc-omni-suggestion-header {
        margin: 12px 16px 8px;
        padding: 12px 14px;
        background: rgba(196, 163, 90, 0.12);
        border: 1px solid rgba(196, 163, 90, 0.35);
        border-radius: 12px;
        display: flex;
        align-items: flex-start;
        gap: 12px;
      }
      [data-theme="light"] .cc-omni-suggestion-header,
      [data-lumina-theme="light"] .cc-omni-suggestion-header {
        background: rgba(245, 158, 11, 0.08);
        border-color: rgba(217, 119, 6, 0.3);
      }
      .cc-omni-suggestion-icon {
        font-size: 1.3rem;
        line-height: 1;
        flex-shrink: 0;
        margin-top: 2px;
      }
      .cc-omni-suggestion-title {
        font-size: 0.92rem;
        font-weight: 700;
        color: #f8fafc;
        margin-bottom: 2px;
      }
      [data-theme="light"] .cc-omni-suggestion-title,
      [data-lumina-theme="light"] .cc-omni-suggestion-title {
        color: #0f172a;
      }
      .cc-omni-suggestion-desc {
        font-size: 0.82rem;
        color: #cbd5e1;
        line-height: 1.35;
      }
      [data-theme="light"] .cc-omni-suggestion-desc,
      [data-lumina-theme="light"] .cc-omni-suggestion-desc {
        color: #475569;
      }
      .cc-omni-empty {
        text-align: center;
        padding: 36px 16px;
        color: #94a3b8;
      }
      .cc-omni-empty p {
        margin: 8px 0 16px;
        font-size: 0.92rem;
      }
      /* Footer */
      .cc-omni-footer {
        padding: 10px 18px;
        border-top: 1px solid rgba(196, 163, 90, 0.2);
        background: rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 0.8rem;
        color: #94a3b8;
        flex-shrink: 0;
        gap: 12px;
      }
      .cc-omni-footer-hints {
        display: flex;
        gap: 12px;
        align-items: center;
      }
      .cc-omni-kbd {
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 5px;
        padding: 2px 6px;
        font-family: inherit;
        font-size: 0.74rem;
        color: #cbd5e1;
      }
      [data-theme="light"] .cc-omni-kbd {
        background: #f1f5f9;
        border-color: #cbd5e1;
        color: #475569;
      }
      .cc-omni-view-all {
        color: #c4a35a;
        text-decoration: none;
        font-weight: 700;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        min-height: 44px;
        padding: 0 8px;
        touch-action: manipulation;
      }
      .cc-omni-view-all:hover {
        text-decoration: underline;
      }
      @media (max-width: 640px) {
        #ccOmniOverlay {
          padding: 0;
        }
        #ccOmniModal {
          max-height: 100vh;
          height: 100vh;
          border-radius: 0;
          border: none;
        }
        .cc-omni-footer-hints {
          display: none;
        }
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
        <div class="cc-omni-header">
          <span class="cc-omni-search-icon" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </span>
          <input type="text" id="ccOmniInput" placeholder="Szukaj w ekosystemie: werset, nadzieja, radio, kursy..." autocomplete="off" spellcheck="false" aria-label="Wpisz szukane słowo">
          <button type="button" id="ccOmniClear" class="cc-omni-btn" aria-label="Wyczyść zapytanie" style="display:none;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <button type="button" id="ccOmniClose" class="cc-omni-btn" aria-label="Zamknij wyszukiwarkę">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="cc-omni-filters">
          <button type="button" class="cc-omni-filter-chip active" data-filter="all">✨ Wszystko</button>
          <button type="button" class="cc-omni-filter-chip" data-filter="modules">🌐 Moduły & Platformy</button>
          <button type="button" class="cc-omni-filter-chip" data-filter="bible">📖 Słowo & Rozważania</button>
          <button type="button" class="cc-omni-filter-chip" data-filter="radio">📻 Audycje & Radio</button>
          <button type="button" class="cc-omni-filter-chip" data-filter="vod">🎬 Kino VOD & Wideo</button>
          <button type="button" class="cc-omni-filter-chip" data-filter="news">📰 Wiedza CCN</button>
          <button type="button" class="cc-omni-filter-chip" data-filter="community">👤 Społeczność</button>
        </div>

        <div class="cc-omni-body" id="ccOmniBody">
          <!-- Renderowane dynamicznie -->
        </div>

        <div class="cc-omni-footer">
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
          <div class="cc-omni-guide-badge">🧭 Przewodnik Tematyczny Ekosystemu</div>
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
        const suggestionBadge = (item.isNearMatch || isSuggestion) ? '<span class="cc-omni-item-badge cc-badge-suggestion">💡 Propozycja</span>' : '';

        html += `
          <a href="${url}" class="cc-omni-item" data-url="${url}">
            <div class="cc-omni-item-icon">${icon}</div>
            <div class="cc-omni-item-content">
              <div class="cc-omni-item-title-row">
                <span class="cc-omni-item-title">${titleHl}</span>
                <span class="cc-omni-item-badge">${groupName}</span>
                ${suggestionBadge}
              </div>
              <p class="cc-omni-item-desc">${descHl}</p>
            </div>
          </a>
        `;
      }
      html += '</div>';
    }

    body.innerHTML = html;
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
    performSearch: performSearch
  };

  // Uruchomienie po załadowaniu DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wireDomSearchElements);
  } else {
    wireDomSearchElements();
  }

})();
