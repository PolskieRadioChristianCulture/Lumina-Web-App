/**
 * ══════════════════════════════════════════════════════════════════════════
 * CC GLOBAL ROUTER — GEO HINTS MAP (FAZA 5)
 * Standard Architektury: MASTER PLAN CC GLOBAL 2030 (FAZA 5)
 * Dyrektywy 3, 10, 11, 12, 33: GEO to sygnał pomocniczy (HINT), nie tożsamość.
 * Nigdy nie nakazuje języka.
 * ══════════════════════════════════════════════════════════════════════════
 */

export const CC_GEO_HINTS_VERSION = 'v1';

/**
 * Mapa podpowiedzi geograficznych (GEO HINT MAP)
 * Kraj (ISO 3166-1 alpha-2) -> Preferowana lista podpowiedzi językowych
 * @type {Record<string, string[]>}
 */
export const GEO_HINT_MAP = Object.freeze({
    // Polska
    'PL': ['pl', 'en'],

    // Kraje portugalskojęzyczne
    'BR': ['pt-br', 'en'],
    'PT': ['pt-br', 'en'],
    'AO': ['pt-br', 'en'],
    'MZ': ['pt-br', 'en'],

    // Kraje hiszpańskojęzyczne
    'ES': ['es', 'en'],
    'MX': ['es', 'en'],
    'AR': ['es', 'en'],
    'CO': ['es', 'en'],
    'CL': ['es', 'en'],
    'PE': ['es', 'en'],
    'VE': ['es', 'en'],

    // Kraje anglojęzyczne i wielojęzyczne
    'US': ['en', 'es'],
    'GB': ['en'],
    'CA': ['en', 'fr'],
    'AU': ['en'],
    'NZ': ['en'],
    'IE': ['en'],

    // Kraje europejskie (Wave 2 readiness hints)
    'DE': ['de', 'en'],
    'AT': ['de', 'en'],
    'CH': ['de', 'fr', 'it', 'en'],
    'FR': ['fr', 'en'],
    'IT': ['it', 'en'],
    'UA': ['uk', 'pl', 'en']
});

/**
 * Pobiera listę podpowiedzi językowych dla danego kodu kraju
 * @param {string|null|undefined} countryCode
 * @returns {string[]}
 */
export function getGeoHints(countryCode) {
    if (!countryCode || typeof countryCode !== 'string') return [];
    const norm = countryCode.trim().toUpperCase();
    return GEO_HINT_MAP[norm] || [];
}

/**
 * Sprawdza czy kraj znajduje się w mapie podpowiedzi
 * @param {string} countryCode
 * @returns {boolean}
 */
export function isCountrySupported(countryCode) {
    if (!countryCode || typeof countryCode !== 'string') return false;
    return !!GEO_HINT_MAP[countryCode.trim().toUpperCase()];
}
