/**
 * ══════════════════════════════════════════════════════════════════════════
 * CC GLOBAL ROUTER — SIGNAL RESOLVER (FAZA 5)
 * Standard Architektury: MASTER PLAN CC GLOBAL 2030 (FAZA 5)
 * Dyrektywy 4-10, 28, 39-42: Deterministyczna hierarchia 8 sygnałów wejściowych.
 * CZŁOWIEK MA ZAWSZE PIERWSZEŃSTWO PRZED ALGORYTMEM.
 * ══════════════════════════════════════════════════════════════════════════
 */

import { isValidLocale, normalizeLocaleCode, getLocale } from './locale-registry.js';
import { getGeoHints } from './geo-hints.js';
import { isSafeLocaleString } from './privacy-guard.js';

export const CC_SIGNAL_RESOLVER_VERSION = 'v1';

/**
 * Źródła sygnałów uszeregowane wg priorytetu (1 = najwyższy, 8 = najniższy)
 * @type {Record<string, number>}
 */
export const SIGNAL_PRIORITIES = Object.freeze({
    'EXPLICIT_USER_CHOICE': 1,
    'CC_ID_LANGUAGE_PREFERENCE': 2,
    'REMEMBERED_LANGUAGE_PREFERENCE': 3,
    'EXPLICIT_URL_LOCALE': 4,
    'BROWSER_LANGUAGE': 5,
    'COARSE_GEO': 6,
    'CONTENT_DEFAULT': 7,
    'GLOBAL_FALLBACK': 8
});

/**
 * @typedef {Object} ResolvedSignal
 * @property {string} candidateLocale - Proponowane locale
 * @property {keyof typeof SIGNAL_PRIORITIES} signalSource - Źródło sygnału
 * @property {number} signalPriority - Priorytet źródła (1..8)
 * @property {boolean} geoHintUsed - Czy użyto podpowiedzi geograficznej
 * @property {boolean} geoOverridden - Czy sygnał wyższego rzędu nadpisał podpowiedź GEO
 * @property {string|null} geoCountry - Kraj z którego przyszedł sygnał coarse geo (jeśli dostępny)
 */

/**
 * Parsuje nagłówek Accept-Language przeglądarki i zwraca listę znormalizowanych kodów
 * Przykład: "pl-PL,pl;q=0.9,en-US;q=0.8,en;q=0.7" -> ['pl', 'en']
 * @param {string|null|undefined} header
 * @returns {string[]}
 */
export function parseAcceptLanguage(header) {
    if (!header || typeof header !== 'string') return [];

    const items = header.split(',')
        .map(part => {
            const [lang, qPart] = part.trim().split(';');
            let q = 1.0;
            if (qPart && qPart.trim().startsWith('q=')) {
                const parsedQ = parseFloat(qPart.trim().slice(2));
                if (!isNaN(parsedQ)) q = parsedQ;
            }
            return { raw: lang.trim(), q };
        })
        .filter(item => item.raw.length > 0)
        .sort((a, b) => b.q - a.q);

    const candidates = [];
    for (const item of items) {
        const norm = normalizeLocaleCode(item.raw);
        if (norm && isValidLocale(norm, true) && !candidates.includes(norm)) {
            candidates.push(norm);
        }
    }

    return candidates;
}

/**
 * Ekstrahuje locale z adresu URL (ścieżki lub parametru zapytania)
 * @param {string|URL} urlOrPath
 * @returns {string|null}
 */
export function extractUrlLocale(urlOrPath) {
    if (!urlOrPath) return null;

    let path = '';
    let searchParams = null;

    if (typeof urlOrPath === 'string') {
        try {
            const parsed = new URL(urlOrPath, 'https://polskieradio.cc');
            path = parsed.pathname;
            searchParams = parsed.searchParams;
        } catch {
            path = urlOrPath.split('?')[0];
            const qIndex = urlOrPath.indexOf('?');
            if (qIndex !== -1) {
                searchParams = new URLSearchParams(urlOrPath.slice(qIndex));
            }
        }
    } else if (urlOrPath instanceof URL) {
        path = urlOrPath.pathname;
        searchParams = urlOrPath.searchParams;
    }

    // 1. Sprawdzenie parametru zapytania ?lang=xx lub ?locale=xx
    if (searchParams) {
        const param = searchParams.get('lang') || searchParams.get('locale');
        if (param && isSafeLocaleString(param)) {
            const norm = normalizeLocaleCode(param);
            if (isValidLocale(norm, false)) return norm;
        }
    }

    // 2. Sprawdzenie prefiksu w ścieżce: /en/..., /es/..., /pt-br/...
    const segments = path.split('/').filter(Boolean);
    if (segments.length > 0) {
        const first = segments[0].toLowerCase();
        if (isSafeLocaleString(first)) {
            const norm = normalizeLocaleCode(first);
            if (isValidLocale(norm, false)) return norm;
        }
    }

    return null;
}

/**
 * Główny Silnik Rozwiązywania Sygnałów (Deterministyczny Signal Resolver)
 * Sprawdza sygnały według ścisłej hierarchii od 1 do 8.
 * @param {Object} signals
 * @param {string} [signals.explicitUserChoice] - Jawny wybór z Language Switchera (Priorytet 1)
 * @param {string} [signals.ccIdPreference] - Preferencja w profilu CC ID (Priorytet 2)
 * @param {string} [signals.rememberedPreference] - Zapisana preferencja z cookie/storage (Priorytet 3)
 * @param {string|URL} [signals.url] - URL zapytania (Priorytet 4)
 * @param {string} [signals.acceptLanguage] - Nagłówek Accept-Language (Priorytet 5)
 * @param {string[]} [signals.browserLanguages] - Tablica navigator.languages (Priorytet 5 alt)
 * @param {string} [signals.countryCode] - Zgrubny kod kraju coarse geo (Priorytet 6)
 * @param {string} [signals.contentDefault='pl'] - Domyślne locale materiału (Priorytet 7)
 * @param {Object} [options]
 * @param {boolean} [options.geoHintsEnabled=true]
 * @param {boolean} [options.browserLanguageEnabled=true]
 * @param {boolean} [options.ccIdPreferenceEnabled=true]
 * @param {boolean} [options.anonymousPreferenceEnabled=true]
 * @returns {ResolvedSignal}
 */
export function resolveSignal(signals = {}, options = {}) {
    const geoHintsEnabled = options.geoHintsEnabled !== false;
    const browserLanguageEnabled = options.browserLanguageEnabled !== false;
    const ccIdPreferenceEnabled = options.ccIdPreferenceEnabled !== false;
    const anonymousPreferenceEnabled = options.anonymousPreferenceEnabled !== false;

    const geoCountry = signals.countryCode ? signals.countryCode.trim().toUpperCase() : null;
    let potentialGeoHint = null;
    if (geoCountry && geoHintsEnabled) {
        const hints = getGeoHints(geoCountry);
        potentialGeoHint = hints.find(h => isValidLocale(h, true)) || null;
    }

    // ─────────────────────────────────────────────────────────────────
    // PRIORYTET 1: EXPLICIT_USER_CHOICE
    // ─────────────────────────────────────────────────────────────────
    if (signals.explicitUserChoice && isSafeLocaleString(signals.explicitUserChoice)) {
        const norm = normalizeLocaleCode(signals.explicitUserChoice);
        if (isValidLocale(norm, false)) {
            return {
                candidateLocale: norm,
                signalSource: 'EXPLICIT_USER_CHOICE',
                signalPriority: 1,
                geoHintUsed: false,
                geoOverridden: !!potentialGeoHint && potentialGeoHint !== norm,
                geoCountry
            };
        }
    }

    // ─────────────────────────────────────────────────────────────────
    // PRIORYTET 2: CC_ID_LANGUAGE_PREFERENCE
    // ─────────────────────────────────────────────────────────────────
    if (ccIdPreferenceEnabled && signals.ccIdPreference && isSafeLocaleString(signals.ccIdPreference)) {
        const norm = normalizeLocaleCode(signals.ccIdPreference);
        if (isValidLocale(norm, false)) {
            return {
                candidateLocale: norm,
                signalSource: 'CC_ID_LANGUAGE_PREFERENCE',
                signalPriority: 2,
                geoHintUsed: false,
                geoOverridden: !!potentialGeoHint && potentialGeoHint !== norm,
                geoCountry
            };
        }
    }

    // ─────────────────────────────────────────────────────────────────
    // PRIORYTET 3: REMEMBERED_LANGUAGE_PREFERENCE
    // ─────────────────────────────────────────────────────────────────
    if (anonymousPreferenceEnabled && signals.rememberedPreference && isSafeLocaleString(signals.rememberedPreference)) {
        const norm = normalizeLocaleCode(signals.rememberedPreference);
        if (isValidLocale(norm, false)) {
            return {
                candidateLocale: norm,
                signalSource: 'REMEMBERED_LANGUAGE_PREFERENCE',
                signalPriority: 3,
                geoHintUsed: false,
                geoOverridden: !!potentialGeoHint && potentialGeoHint !== norm,
                geoCountry
            };
        }
    }

    // ─────────────────────────────────────────────────────────────────
    // PRIORYTET 4: EXPLICIT_URL_LOCALE
    // ─────────────────────────────────────────────────────────────────
    if (signals.url) {
        const urlLocale = extractUrlLocale(signals.url);
        if (urlLocale && isValidLocale(urlLocale, false)) {
            return {
                candidateLocale: urlLocale,
                signalSource: 'EXPLICIT_URL_LOCALE',
                signalPriority: 4,
                geoHintUsed: false,
                geoOverridden: !!potentialGeoHint && potentialGeoHint !== urlLocale,
                geoCountry
            };
        }
    }

    // ─────────────────────────────────────────────────────────────────
    // PRIORYTET 5: BROWSER_LANGUAGE
    // ─────────────────────────────────────────────────────────────────
    if (browserLanguageEnabled) {
        let browserLocales = [];
        if (signals.acceptLanguage) {
            browserLocales = parseAcceptLanguage(signals.acceptLanguage);
        } else if (Array.isArray(signals.browserLanguages)) {
            browserLocales = signals.browserLanguages
                .map(normalizeLocaleCode)
                .filter(l => isValidLocale(l, true));
        }

        if (browserLocales.length > 0) {
            const firstValid = browserLocales[0];
            return {
                candidateLocale: firstValid,
                signalSource: 'BROWSER_LANGUAGE',
                signalPriority: 5,
                geoHintUsed: false,
                geoOverridden: !!potentialGeoHint && potentialGeoHint !== firstValid,
                geoCountry
            };
        }
    }

    // ─────────────────────────────────────────────────────────────────
    // PRIORYTET 6: COARSE_GEO (HINT)
    // ─────────────────────────────────────────────────────────────────
    if (potentialGeoHint) {
        return {
            candidateLocale: potentialGeoHint,
            signalSource: 'COARSE_GEO',
            signalPriority: 6,
            geoHintUsed: true,
            geoOverridden: false,
            geoCountry
        };
    }

    // ─────────────────────────────────────────────────────────────────
    // PRIORYTET 7: CONTENT_DEFAULT
    // ─────────────────────────────────────────────────────────────────
    if (signals.contentDefault && isSafeLocaleString(signals.contentDefault)) {
        const norm = normalizeLocaleCode(signals.contentDefault);
        if (isValidLocale(norm, true)) {
            return {
                candidateLocale: norm,
                signalSource: 'CONTENT_DEFAULT',
                signalPriority: 7,
                geoHintUsed: false,
                geoOverridden: false,
                geoCountry
            };
        }
    }

    // ─────────────────────────────────────────────────────────────────
    // PRIORYTET 8: GLOBAL_FALLBACK
    // ─────────────────────────────────────────────────────────────────
    return {
        candidateLocale: 'pl',
        signalSource: 'GLOBAL_FALLBACK',
        signalPriority: 8,
        geoHintUsed: false,
        geoOverridden: false,
        geoCountry
    };
}
