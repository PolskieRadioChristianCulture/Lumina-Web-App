/**
 * ══════════════════════════════════════════════════════════════════════════
 * CC GLOBAL ROUTER — SEO & LOCALIZATION HEADERS (FAZA 5)
 * Standard Architektury: MASTER PLAN CC GLOBAL 2030 (FAZA 5)
 * Dyrektywy 34, 35, 36, 37, 38:
 * - Generowanie tagów hreflang, canonical, x-default WYŁĄCZNIE dla wariantów APPROVED
 * - Zakaz generowania linków hreflang do stron nieistniejących
 * - Ochrona botów i crawlerów przed chaotycznymi przekierowaniami GEO
 * ══════════════════════════════════════════════════════════════════════════
 */

import { getLocale, normalizeLocaleCode } from './locale-registry.js';
import { checkContentAvailability } from './content-availability.js';

export const CC_SEO_LOCALIZATION_VERSION = 'v1';

/**
 * Znane identyfikatory crawlerów indeksujących i botów AI
 */
const KNOWN_BOT_USER_AGENTS = [
    'googlebot',
    'bingbot',
    'yandexbot',
    'duckduckbot',
    'baiduspider',
    'slurp',
    'twitterbot',
    'facebookexternalhit',
    'linkedinbot',
    'embedly',
    'quora link preview',
    'showyoubot',
    'outbrain',
    'pinterest/0.',
    'developers.google.com/+/web/snippet',
    'slackbot',
    'vkshare',
    'w3c_validator',
    'redditbot',
    'applebot',
    'whatsapp',
    'flipboard',
    'tumblr',
    'bitlybot',
    'skypeuripreview',
    'nuzzel',
    'discordbot',
    'google page speed',
    'qwantify',
    'pinterestbot',
    'bitrix link preview',
    'xing-content',
    'telegrambot',
    'claudebot',
    'gptbot'
];

/**
 * Sprawdza czy żądanie pochodzi od bota lub wyszukiwarki internetowej
 * @param {string|null|undefined} userAgent
 * @returns {boolean}
 */
export function isSearchEngineCrawler(userAgent) {
    if (!userAgent || typeof userAgent !== 'string') return false;
    const ua = userAgent.toLowerCase();
    return KNOWN_BOT_USER_AGENTS.some(bot => ua.includes(bot));
}

/**
 * @typedef {Object} HreflangTag
 * @property {string} hreflang - Kod hreflang (np. "pl", "en", "es", "pt-BR", "x-default")
 * @property {string} href - Pełny adres URL
 */

/**
 * Generuje metadane SEO i tagi hreflang dla danego materiału i bazy URL
 * Dyrektywa 37: Generuje tagi TYLKO dla wariantów, które istnieją i są APPROVED!
 * @param {Object} params
 * @param {Object} [params.contentMaster] - Rekord materiału (opcjonalny dla stron statycznych)
 * @param {string} params.baseUrl - Bazowy URL serwisu (np. "https://polskieradio.cc")
 * @param {string} params.path - Ścieżka zasobu bez prefiksu językowego (np. "/artykul-1")
 * @param {string} params.currentLocale - Aktualnie serwowane locale
 * @param {string[]} [params.availableLocales] - Lista dostępnych locale jeśli brak contentMaster
 * @returns {{ htmlLang: string, canonicalUrl: string, hreflangTags: HreflangTag[] }}
 */
export function generateSeoLocalizationMetadata(params) {
    const baseUrl = (params.baseUrl || 'https://polskieradio.cc').replace(/\/$/, '');
    const cleanPath = (params.path || '/').replace(/^\/?/, '/');
    const currentNorm = normalizeLocaleCode(params.currentLocale || 'pl');

    // 1. Ustalenie listy rzeczywiście dostępnych wariantów APPROVED
    const validLocales = [];

    if (params.contentMaster) {
        const variants = params.contentMaster.variants || [];
        const variantList = Array.isArray(variants) ? variants : Object.values(variants);

        for (const v of variantList) {
            if (v.status === 'APPROVED') {
                const loc = normalizeLocaleCode(v.language || v.locale);
                if (loc && !validLocales.includes(loc)) {
                    validLocales.push(loc);
                }
            }
        }
    } else if (Array.isArray(params.availableLocales)) {
        for (const loc of params.availableLocales) {
            const norm = normalizeLocaleCode(loc);
            if (norm && !validLocales.includes(norm)) {
                validLocales.push(norm);
            }
        }
    } else {
        // Domyślnie Wave 1 jeśli nie podano restrykcji
        validLocales.push('pl', 'en', 'es', 'pt-br');
    }

    // 2. Budowa linków hreflang
    const hreflangTags = [];

    for (const loc of validLocales) {
        const locDef = getLocale(loc);
        if (!locDef || !locDef.enabled) continue;

        // Kod hreflang RFC 5646 (np. pt-BR zamiast pt-br dla standardu HTML)
        const tagLang = (loc === 'pt-br') ? 'pt-BR' : loc;
        const locPath = (loc === 'pl') ? cleanPath : `/${loc}${cleanPath === '/' ? '' : cleanPath}`;
        const href = `${baseUrl}${locPath}`;

        hreflangTags.push({
            hreflang: tagLang,
            href
        });
    }

    // 3. Dodanie neutralnego globalnego x-default (Dyrektywa 36)
    // x-default wskazuje na wersję neutralną (główny URL)
    hreflangTags.push({
        hreflang: 'x-default',
        href: `${baseUrl}${cleanPath}`
    });

    // 4. Wyznaczenie canonical URL dla bieżącego żądania
    const currentPath = (currentNorm === 'pl') ? cleanPath : `/${currentNorm}${cleanPath === '/' ? '' : cleanPath}`;
    const canonicalUrl = `${baseUrl}${currentPath}`;

    return {
        htmlLang: (currentNorm === 'pt-br') ? 'pt-BR' : currentNorm,
        canonicalUrl,
        hreflangTags
    };
}
