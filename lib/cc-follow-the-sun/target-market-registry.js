/**
 * ══════════════════════════════════════════════════════════════════════════
 * CC GLOBAL FOLLOW THE SUN 24/7 — TARGET MARKET REGISTRY (FAZA 6A)
 * Standard Architektury: MASTER PLAN CC GLOBAL 2030 (FAZA 6A)
 * Dyrektywy 10-13, 67: Rejestr Rynków i Obszarów Emisyjnych (Zero Profilowania Ludzi)
 * ══════════════════════════════════════════════════════════════════════════
 */

/**
 * Kanoniczny Rejestr Rynków Docelowych Christian Culture (Wave 1)
 * Opisuje obszary nadawcze i strefy czasowe odbiorców.
 * NIE służy do śledzenia historii lokalizacji konkretnych użytkowników.
 * 
 * @type {Record<string, import('../cc-content-core/types.js').TargetMarket>}
 */
export const CC_TARGET_MARKET_REGISTRY = Object.freeze({
    PL: {
        marketId: 'PL',
        countryCode: 'PL',
        regionCode: 'PL',
        timezone: 'Europe/Warsaw',
        preferredLocales: ['pl-PL', 'pl'],
        enabled: false, // Dyrektywa 12: Nie aktywuj produkcyjnie w 6A
        wave: 1
    },
    GB: {
        marketId: 'GB',
        countryCode: 'GB',
        regionCode: 'GB',
        timezone: 'Europe/London',
        preferredLocales: ['en-GB', 'en'],
        enabled: false,
        wave: 1
    },
    US_EAST: {
        marketId: 'US_EAST',
        countryCode: 'US',
        regionCode: 'US-NY',
        timezone: 'America/New_York',
        preferredLocales: ['en-US', 'en', 'es'],
        enabled: false,
        wave: 1
    },
    US_WEST: {
        marketId: 'US_WEST',
        countryCode: 'US',
        regionCode: 'US-CA',
        timezone: 'America/Los_Angeles',
        preferredLocales: ['en-US', 'en', 'es'],
        enabled: false,
        wave: 1
    },
    ES: {
        marketId: 'ES',
        countryCode: 'ES',
        regionCode: 'ES',
        timezone: 'Europe/Madrid',
        preferredLocales: ['es-ES', 'es'],
        enabled: false,
        wave: 1
    },
    MX: {
        marketId: 'MX',
        countryCode: 'MX',
        regionCode: 'MX',
        timezone: 'America/Mexico_City',
        preferredLocales: ['es-MX', 'es'],
        enabled: false,
        wave: 1
    },
    BR: {
        marketId: 'BR',
        countryCode: 'BR',
        regionCode: 'BR-SP',
        timezone: 'America/Sao_Paulo',
        preferredLocales: ['pt-BR', 'pt'],
        enabled: false,
        wave: 1
    }
});

/**
 * Sprawdza, czy identyfikator rynku jest poprawny
 * @param {string} marketId
 * @returns {boolean}
 */
export function isValidMarketId(marketId) {
    if (!marketId || typeof marketId !== 'string') return false;
    return Object.prototype.hasOwnProperty.call(CC_TARGET_MARKET_REGISTRY, marketId.toUpperCase().trim());
}

/**
 * Pobiera definicję rynku
 * @param {string} marketId
 * @returns {import('../cc-content-core/types.js').TargetMarket|null}
 */
export function getMarket(marketId) {
    if (!isValidMarketId(marketId)) return null;
    return { ...CC_TARGET_MARKET_REGISTRY[marketId.toUpperCase().trim()] };
}

/**
 * Zwraca listę wszystkich rynków docelowych
 * @returns {import('../cc-content-core/types.js').TargetMarket[]}
 */
export function getAllMarkets() {
    return Object.values(CC_TARGET_MARKET_REGISTRY).map(m => ({ ...m }));
}

/**
 * Wyszukuje rynki pasujące do danego języka/locale
 * @param {string} locale
 * @returns {import('../cc-content-core/types.js').TargetMarket[]}
 */
export function getMarketsForLocale(locale) {
    if (!locale || typeof locale !== 'string') return [];
    const norm = locale.toLowerCase().trim();
    const baseLang = norm.split('-')[0];

    return getAllMarkets().filter(m => {
        return m.preferredLocales.some(loc => {
            const locNorm = loc.toLowerCase();
            return locNorm === norm || locNorm === baseLang || locNorm.split('-')[0] === baseLang;
        });
    });
}
