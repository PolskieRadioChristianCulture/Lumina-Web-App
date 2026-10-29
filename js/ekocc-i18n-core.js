/**
 * EkoCC i18n Core — Centralny Moduł Lokalizacji Językowej Ekosystemu Christian Culture
 * Standard: Dyrektywa techniczna EkoCC / @777 / @ICC / @JOMA / @A077 (29.10.2026)
 * Zasada: Jedna misja. Wiele języków. Jedno spójne doświadczenie użytkownika.
 * Architektura: ZERO COST (statyczne słowniki, natywne Intl API, zero płatnych translatorów w UI)
 */

(function (global) {
  'use strict';

  // ── Słownik bazowy pilotażu (Etap 1: Wyszukiwarka Ekosystemu) ──
  const CORE_TRANSLATIONS = {
    pl: {
      search_meta_title: "Wyszukiwarka Christian Culture — Globalna Wyszukiwarka Chrześcijańska",
      search_meta_desc: "Globalna Wyszukiwarka Chrześcijańska Christian Culture: Słowo Boże, Kurs Codzienny, rozważania Dobrze że jesteś, podcast Apokalipsa, Radio CC 24/7 i społeczność LUMINA w jednym miejscu.",
      search_title: "Christian Culture",
      search_subtitle: "Globalna Wyszukiwarka Chrześcijańska — Słowo Boże, wiedza, radio i społeczność.",
      search_placeholder: "Zapytaj Christian Culture…",
      search_btn: "Szukaj",
      search_label: "Szukaj w ekosystemie Christian Culture",
      search_popular_label: "Popularne tematy",
      topic_apocalypse: "#Apokalipsa",
      topic_course: "#KursCodzienny",
      topic_verse: "#WersetDnia",
      topic_dzj: "#DobrzeŻeJesteś",
      topic_radio: "#Radio24/7",
      topic_lumina: "#Lumina",
      topic_cards: "#Wizytówki",
      nav_start: "Start",
      nav_search: "Wyszukiwarka",
      lang_selector_label: "Wybierz język interfejsu",
      lang_pl: "Polski",
      lang_en: "English",
      lang_de: "Deutsch",
      powered_by: "Dostarczane przez {studio} dla Christian Culture",
      source_register: "📜 Rejestr Źródeł i Licencji (R01–R40) — Biblia Intelligence CC",
      mcp_btn: "Połącz z AI (MCP)",
      mcp_title: "Połącz ze swoim asystentem AI",
      mcp_desc: "Christian Culture udostępnia otwarty serwer wiedzy Remote MCP (Model Context Protocol). Możesz zadawać pytania o Pismo Święte (UBG), audycje i artykuły bezpośrednio w programach Claude Desktop, Cursor i ChatGPT — 100% bezpłatnie i bez śledzenia.",
      mcp_url_label: "Adres Remote MCP (SSE):",
      mcp_copy_config: "Kopiuj konfigurację JSON",
      mcp_copied: "Skopiowano do schowka!",
      mcp_tools_label: "Dostępne narzędzia (Read-Only):",
      mcp_close: "Zamknij",
      tts_listen: "Słuchaj",
      tts_stop: "Zatrzymaj"
    },
    en: {
      search_meta_title: "Christian Culture Search — Global Christian Search Engine",
      search_meta_desc: "Christian Culture Global Christian Search Engine: God's Word, Daily Course, Dobrze że jesteś reflections, Apocalypse podcast, CC Radio 24/7 and LUMINA community all in one place.",
      search_title: "Christian Culture",
      search_subtitle: "Global Christian Search Engine — God's Word, knowledge, radio and community.",
      search_placeholder: "Ask Christian Culture…",
      search_btn: "Search",
      search_label: "Search the Christian Culture ecosystem",
      search_popular_label: "Trending topics",
      topic_apocalypse: "#Apocalypse",
      topic_course: "#DailyCourse",
      topic_verse: "#VerseOfTheDay",
      topic_dzj: "#GladYouAreHere",
      topic_radio: "#Radio24/7",
      topic_lumina: "#Lumina",
      topic_cards: "#Profiles",
      nav_start: "Home",
      nav_search: "Search",
      lang_selector_label: "Select interface language",
      lang_pl: "Polski",
      lang_en: "English",
      lang_de: "Deutsch",
      powered_by: "Powered by {studio} for Christian Culture",
      source_register: "📜 Sources & Licenses Register (R01–R40) — Bible Intelligence CC",
      mcp_btn: "Connect with AI (MCP)",
      mcp_title: "Connect with your AI Assistant",
      mcp_desc: "Christian Culture provides an open Remote MCP knowledge server. Query the Holy Scriptures (UBG), broadcasts, and articles directly inside Claude Desktop, Cursor, and ChatGPT — 100% free with zero tracking.",
      mcp_url_label: "Remote MCP URL (SSE):",
      mcp_copy_config: "Copy JSON Config",
      mcp_copied: "Copied to clipboard!",
      mcp_tools_label: "Available tools (Read-Only):",
      mcp_close: "Close",
      tts_listen: "Listen",
      tts_stop: "Stop"
    },
    de: {
      search_meta_title: "Christian Culture Suchmaschine — Globale christliche Suchmaschine",
      search_meta_desc: "Globale christliche Suchmaschine Christian Culture: Gottes Wort, Täglicher Kurs, Andachten, Apokalypse-Podcast, CC Radio 24/7 und LUMINA-Gemeinschaft an einem Ort.",
      search_title: "Christian Culture",
      search_subtitle: "Globale christliche Suchmaschine — Gottes Wort, Wissen, Radio und Gemeinschaft.",
      search_placeholder: "Christian Culture fragen…",
      search_btn: "Suchen",
      search_label: "Im Christian Culture Ökosystem suchen",
      search_popular_label: "Beliebte Themen",
      topic_apocalypse: "#Apokalypse",
      topic_course: "#Tageskurs",
      topic_verse: "#VersDesTages",
      topic_dzj: "#SchoenDassDuDaBist",
      topic_radio: "#Radio24/7",
      topic_lumina: "#Lumina",
      topic_cards: "#Profile",
      nav_start: "Startseite",
      nav_search: "Suche",
      lang_selector_label: "Oberflächensprache wählen",
      lang_pl: "Polski",
      lang_en: "English",
      lang_de: "Deutsch",
      powered_by: "Bereitgestellt von {studio} für Christian Culture",
      source_register: "📜 Quellen- und Lizenzregister (R01–R40) — Bibel-Intelligence CC",
      mcp_btn: "Mit KI verbinden (MCP)",
      mcp_title: "Mit deinem KI-Assistenten verbinden",
      mcp_desc: "Christian Culture bietet einen offenen Remote MCP Wissensserver. Befrage die Heilige Schrift, Sendungen und Artikel direkt in Claude Desktop, Cursor und ChatGPT — kostenlos und ohne Tracking.",
      mcp_url_label: "Remote MCP Adresse (SSE):",
      mcp_copy_config: "JSON-Konfiguration kopieren",
      mcp_copied: "In Zwischenablage kopiert!",
      mcp_tools_label: "Verfügbare Werkzeuge (Read-Only):",
      mcp_close: "Schließen",
      tts_listen: "Anhören",
      tts_stop: "Stopp"
    }
  };

  const SUPPORTED_LOCALES = ['pl', 'en', 'de'];
  const DEFAULT_LOCALE = 'pl';
  const STORAGE_KEY = 'ekocc_ui_lang';
  const SESSION_KEY = 'ekocc_ui_lang';
  const COOKIE_KEY = 'ekocc_lang';

  // Stan silnika
  let currentLocale = DEFAULT_LOCALE;
  let contentLanguage = 'pl';
  const dictionaries = { ...CORE_TRANSLATIONS };

  // ── Pomocnicze: Odczyt ciasteczka ──
  function getCookie(name) {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift() || null;
    return null;
  }

  // ── Pomocnicze: Zapis ciasteczka ──
  function setCookie(name, val, days = 365) {
    if (typeof document === 'undefined') return;
    const d = new Date();
    d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${val};expires=${d.toUTCString()};path=/;SameSite=Lax`;
  }

  // ── Normalizacja i mapowanie kodów języków (np. de-AT -> de, en-US -> en) ──
  function normalizeLocale(raw) {
    if (!raw || typeof raw !== 'string') return null;
    const clean = raw.trim().toLowerCase().replace('_', '-');
    if (SUPPORTED_LOCALES.includes(clean)) return clean;
    const prefix = clean.split('-')[0];
    if (SUPPORTED_LOCALES.includes(prefix)) return prefix;
    return null;
  }

  // ── 5-Stopniowa Kaskada Negocjacji Języka (Zgodna z Dyrektywą) ──
  function detectLocale() {
    // 1. Ręczny wyjątek dla danej aplikacji / sesji (URL query ?lang=xx lub sessionStorage)
    if (typeof window !== 'undefined') {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const queryLang = normalizeLocale(urlParams.get('lang'));
        if (queryLang) {
          sessionStorage.setItem(SESSION_KEY, queryLang);
          return queryLang;
        }
        const sessionLang = normalizeLocale(sessionStorage.getItem(SESSION_KEY));
        if (sessionLang) return sessionLang;
      } catch (e) {}
    }

    // 2. Preferencja konta Christian Culture (dla zalogowanego użytkownika)
    if (typeof window !== 'undefined') {
      const accountLang = normalizeLocale(
        window.EkoCCAccount?.language ||
        window.EkoCCUser?.preferredLanguage ||
        window.currentUser?.preferredLanguage
      );
      if (accountLang) return accountLang;
    }

    // 3. Zapamiętany wybór gościa (localStorage / cookie)
    if (typeof window !== 'undefined') {
      try {
        const stored = normalizeLocale(localStorage.getItem(STORAGE_KEY));
        if (stored) return stored;
      } catch (e) {}
      const cookieLang = normalizeLocale(getCookie(COOKIE_KEY));
      if (cookieLang) return cookieLang;
    }

    // 4. Preferencje przeglądarki lub systemu (navigator.languages / navigator.language)
    if (typeof navigator !== 'undefined') {
      const navLangs = Array.isArray(navigator.languages) && navigator.languages.length
        ? navigator.languages
        : [navigator.language || navigator.userLanguage];

      for (const raw of navLangs) {
        const matched = normalizeLocale(raw);
        if (matched) return matched;
      }
    }

    // 5. Język zastępczy (domyślny polski)
    return DEFAULT_LOCALE;
  }

  // ── Tłumaczenie klucza z fallbackiem i interpolacją ──
  function translate(key, params = {}, fallback = null) {
    if (!key) return '';
    const locDict = dictionaries[currentLocale] || {};
    const defDict = dictionaries[DEFAULT_LOCALE] || {};
    let text = locDict[key] !== undefined ? locDict[key] : (defDict[key] !== undefined ? defDict[key] : (fallback !== null ? fallback : key));

    if (typeof text === 'string' && params && typeof params === 'object') {
      for (const [k, v] of Object.entries(params)) {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      }
    }
    return text;
  }

  // ── Zastosowanie tłumaczeń w drzewie DOM ──
  function applyToDOM(root) {
    if (typeof document === 'undefined') return;
    const container = root || document;

    // Tłumaczenie zawartości tekstowej: data-i18n="klucz"
    const textNodes = container.querySelectorAll('[data-i18n]');
    textNodes.forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (key) {
        el.textContent = translate(key);
      }
    });

    // Tłumaczenie atrybutu placeholder: data-i18n-placeholder="klucz"
    const placeholderNodes = container.querySelectorAll('[data-i18n-placeholder]');
    placeholderNodes.forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (key) {
        el.placeholder = translate(key);
      }
    });

    // Tłumaczenie atrybutu aria-label: data-i18n-aria-label="klucz"
    const ariaNodes = container.querySelectorAll('[data-i18n-aria-label]');
    ariaNodes.forEach(el => {
      const key = el.getAttribute('data-i18n-aria-label');
      if (key) {
        el.setAttribute('aria-label', translate(key));
      }
    });

    // Tłumaczenie atrybutu title: data-i18n-title="klucz"
    const titleNodes = container.querySelectorAll('[data-i18n-title]');
    titleNodes.forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      if (key) {
        el.setAttribute('title', translate(key));
      }
    });

    // Aktualizacja atrybutu <html lang="...">
    if (document.documentElement) {
      document.documentElement.setAttribute('lang', currentLocale);
    }

    // Aktualizacja stanu wizualnego przełączników językowych
    const switcherBtns = container.querySelectorAll('[data-ekocc-lang-choice]');
    switcherBtns.forEach(btn => {
      const btnLang = btn.getAttribute('data-ekocc-lang-choice');
      const isActive = btnLang === currentLocale;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  }

  // ── Zmiana języka (globalna lub per sesja/aplikacja) ──
  function setLocale(locale, scope = 'global') {
    const target = normalizeLocale(locale) || DEFAULT_LOCALE;
    const prevLocale = currentLocale;
    currentLocale = target;

    if (typeof window !== 'undefined') {
      try {
        if (scope === 'app') {
          sessionStorage.setItem(SESSION_KEY, target);
        } else {
          localStorage.setItem(STORAGE_KEY, target);
          setCookie(COOKIE_KEY, target, 365);
          // Usunięcie ewentualnego wyjątku sesyjnego
          sessionStorage.removeItem(SESSION_KEY);
        }
      } catch (e) {}

      // Zaktualizuj DOM
      applyToDOM(document);

      // Emisja zdarzenia systemowego
      document.dispatchEvent(new CustomEvent('ekocc:locale-changed', {
        detail: { locale: target, prevLocale: prevLocale, scope: scope }
      }));
    }

    return target;
  }

  // ── Renderowanie uniwersalnego selektora języka (44x44px touch target) ──
  function renderSwitcher(containerOrSelector) {
    if (typeof document === 'undefined') return null;
    const targetEl = typeof containerOrSelector === 'string'
      ? document.querySelector(containerOrSelector)
      : containerOrSelector;
    if (!targetEl) return null;

    targetEl.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'ekocc-lang-switcher';
    wrapper.setAttribute('role', 'group');
    wrapper.setAttribute('aria-label', translate('lang_selector_label'));

    SUPPORTED_LOCALES.forEach(loc => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `ekocc-lang-btn ${loc === currentLocale ? 'is-active' : ''}`;
      btn.setAttribute('data-ekocc-lang-choice', loc);
      btn.setAttribute('aria-pressed', loc === currentLocale ? 'true' : 'false');
      btn.setAttribute('aria-label', translate(`lang_${loc}`));
      btn.textContent = loc.toUpperCase();

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        setLocale(loc, 'global');
      });

      wrapper.appendChild(btn);
    });

    targetEl.appendChild(wrapper);
    return wrapper;
  }

  // ── Formatowanie zlokalizowane Intl (ZERO COST) ──
  function formatDate(date, options = {}) {
    const d = date instanceof Date ? date : new Date(date);
    return new Intl.DateTimeFormat(currentLocale, options).format(d);
  }

  function formatNumber(number, options = {}) {
    return new Intl.NumberFormat(currentLocale, options).format(number);
  }

  function formatRelativeTime(value, unit = 'day') {
    return new Intl.RelativeTimeFormat(currentLocale, { numeric: 'auto' }).format(value, unit);
  }

  // ── Rozszerzanie słowników w locie (Namespaces) ──
  function addTranslations(locale, translations) {
    const loc = normalizeLocale(locale);
    if (!loc || !translations) return;
    if (!dictionaries[loc]) dictionaries[loc] = {};
    Object.assign(dictionaries[loc], translations);
  }

  // ── Inicjalizacja rdzenia ──
  function init() {
    currentLocale = detectLocale();
    if (typeof document !== 'undefined') {
      applyToDOM(document);

      // Auto-binding do istniejących elementów z data-ekocc-lang-mount
      const mounts = document.querySelectorAll('[data-ekocc-lang-mount]');
      mounts.forEach(mount => renderSwitcher(mount));

      // Emisja zdarzenia gotowości i początkowego języka
      document.dispatchEvent(new CustomEvent('ekocc:locale-changed', {
        detail: { locale: currentLocale, initial: true }
      }));

      // Delegacja zdarzeń dla ręcznych przycisków
      document.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-ekocc-lang-choice]');
        if (btn) {
          const chosenLang = btn.getAttribute('data-ekocc-lang-choice');
          if (chosenLang) {
            e.preventDefault();
            setLocale(chosenLang, 'global');
          }
        }
      });
    }
  }

  // ── Obiekt API ──
  const EkoCCI18n = {
    supportedLocales: SUPPORTED_LOCALES,
    defaultLocale: DEFAULT_LOCALE,
    detectLocale: detectLocale,
    getLocale: () => currentLocale,
    setLocale: setLocale,
    getContentLanguage: () => contentLanguage,
    setContentLanguage: (lang) => { contentLanguage = lang; },
    t: translate,
    translate: translate,
    applyToDOM: applyToDOM,
    renderSwitcher: renderSwitcher,
    formatDate: formatDate,
    formatNumber: formatNumber,
    formatRelativeTime: formatRelativeTime,
    addTranslations: addTranslations,
    dictionaries: dictionaries,
    init: init
  };

  // Eksport globalny i modułowy
  if (typeof globalThis !== 'undefined') {
    globalThis.EkoCCI18n = EkoCCI18n;
  }
  if (typeof window !== 'undefined') {
    window.EkoCCI18n = EkoCCI18n;
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
      init();
    }
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = EkoCCI18n;
  }

})(typeof window !== 'undefined' ? window : globalThis);
