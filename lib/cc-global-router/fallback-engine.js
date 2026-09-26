/**
 * ══════════════════════════════════════════════════════════════════════════
 * CC GLOBAL ROUTER — FALLBACK ENGINE (FAZA 5)
 * Standard Architektury: MASTER PLAN CC GLOBAL 2030 (FAZA 5)
 * Dyrektywy 20, 21, 43, 44:
 * - Konfigurowalny łańcuch zastępczy (Fallback Chain)
 * - Jawny stan zastępczy (Fallback widoczny w UI i metrykach)
 * - ZERO tłumaczenia w locie (Router NIE tłumaczy, Router serwuje)
 * ══════════════════════════════════════════════════════════════════════════
 */

import { getLocale, normalizeLocaleCode } from './locale-registry.js';
import { checkContentAvailability } from './content-availability.js';

export const CC_FALLBACK_ENGINE_VERSION = 'v1';

/**
 * Domyślne łańcuchy fallback per locale
 * @type {Record<string, string[]>}
 */
export const DEFAULT_FALLBACK_CHAINS = Object.freeze({
    'pt-br': ['en', 'pl'],
    'es': ['en', 'pl'],
    'en': ['pl'],
    'pl': ['en'],
    // Fala 2 (przygotowanie)
    'de': ['en', 'pl'],
    'fr': ['en', 'pl'],
    'it': ['en', 'pl'],
    'uk': ['pl', 'en']
});

/**
 * @typedef {Object} FallbackResolution
 * @property {string} resolvedLocale - Ostatecznie dobrane locale
 * @property {boolean} fallbackUsed - Czy konieczne było użycie fallbacku
 * @property {string|null} fallbackReason - Przyczyna użycia fallbacku
 * @property {string|null} contentVariantId - ID dopasowanego wariantu
 * @property {string[]} attemptedLocales - Ścieżka sprawdzonych locale
 */

/**
 * Wyznacza łańcuch fallback dla danego locale
 * @param {string} locale
 * @param {string} [contentDefault='pl']
 * @returns {string[]}
 */
export function getFallbackChain(locale, contentDefault = 'pl') {
    const norm = normalizeLocaleCode(locale);
    const defChain = DEFAULT_FALLBACK_CHAINS[norm];
    const chain = [norm];

    if (Array.isArray(defChain)) {
        for (const fb of defChain) {
            if (!chain.includes(fb)) chain.push(fb);
        }
    } else {
        const locDef = getLocale(norm);
        if (locDef && locDef.fallbackLocale && !chain.includes(locDef.fallbackLocale)) {
            chain.push(locDef.fallbackLocale);
        }
    }

    const normDefault = normalizeLocaleCode(contentDefault);
    if (!chain.includes(normDefault)) {
        chain.push(normDefault);
    }

    return chain;
}

/**
 * Rozwiązuje wariant z użyciem łańcucha fallback w oparciu o dostępność treści
 * @param {string} requestedLocale - Żądane locale
 * @param {Object} contentMaster - Rekord główny materiału
 * @param {Object} [options]
 * @param {string} [options.contentDefault='pl'] - Domyślne locale materiału
 * @param {string} [options.requestedFormat='TEXT'] - Żądany format
 * @param {Map<string, any>} [options.variantsMap] - Mapa wariantów
 * @returns {FallbackResolution}
 */
export function resolveWithFallback(requestedLocale, contentMaster, options = {}) {
    const contentDefault = options.contentDefault || (contentMaster && contentMaster.originalLanguage) || 'pl';
    const chain = getFallbackChain(requestedLocale, contentDefault);
    const attemptedLocales = [];

    let firstFailureReason = null;

    for (let i = 0; i < chain.length; i++) {
        const candidate = chain[i];
        attemptedLocales.push(candidate);

        // Jeśli sprawdzamy samą obecność locale bez konkretnego rekordu treści (np. interfejs UI)
        if (!contentMaster) {
            return {
                resolvedLocale: candidate,
                fallbackUsed: i > 0,
                fallbackReason: i > 0 ? `LOCALE_NOT_ENABLED (${requestedLocale})` : null,
                contentVariantId: null,
                attemptedLocales
            };
        }

        const availability = checkContentAvailability(contentMaster, candidate, options);
        if (availability.available) {
            const isFallback = (i > 0);
            return {
                resolvedLocale: candidate,
                fallbackUsed: isFallback,
                fallbackReason: isFallback ? (firstFailureReason || `REQUESTED_LOCALE_UNAVAILABLE (${requestedLocale})`) : null,
                contentVariantId: availability.variantId,
                attemptedLocales
            };
        } else {
            if (i === 0) {
                firstFailureReason = availability.reason;
            }
        }
    }

    // Bezpieczny fallback ostateczny (Safe Default)
    return {
        resolvedLocale: normalizeLocaleCode(contentDefault),
        fallbackUsed: true,
        fallbackReason: firstFailureReason || 'ALL_FALLBACK_VARIANTS_UNAVAILABLE',
        contentVariantId: null,
        attemptedLocales
    };
}
