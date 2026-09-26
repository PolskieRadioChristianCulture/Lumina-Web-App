/**
 * ══════════════════════════════════════════════════════════════════════════
 * CC GLOBAL ROUTER — CONTENT AVAILABILITY & RIGHTS CHECK (FAZA 5)
 * Standard Architektury: MASTER PLAN CC GLOBAL 2030 (FAZA 5)
 * Dyrektywy 17, 18, 19, 81, 82, 83:
 * - Router serwuje WYŁĄCZNIE warianty ze statusem APPROVED
 * - Zakaz serwowania DRAFT, REVIEW_REQUIRED, AI_GENERATED, REJECTED
 * - Integracja z Rights Gate: weryfikacja praw do formatu
 * ══════════════════════════════════════════════════════════════════════════
 */

import { normalizeLocaleCode } from './locale-registry.js';

export const CC_CONTENT_AVAILABILITY_VERSION = 'v1';

/**
 * @typedef {Object} AvailabilityResult
 * @property {boolean} available - Czy wariant jest w pełni dostępny do serwowania
 * @property {string|null} variantId - ID zatwierdzonego wariantu
 * @property {string|null} status - Status wariantu
 * @property {string|null} reason - Powód braku dostępności jeśli false
 * @property {Object|null} variantData - Dane wariantu
 */

/**
 * Sprawdza dostępność wariantu treści dla danego locale
 * @param {Object} contentMaster - Rekord główny materiału (Content Master)
 * @param {string} targetLocale - Żądany kod locale (np. "pl", "en", "es", "pt-br")
 * @param {Object} [options]
 * @param {string} [options.requestedFormat='TEXT'] - Żądany format (TEXT, AUDIO, VIDEO)
 * @param {Map<string, any>} [options.variantsMap] - Opcjonalna mapa wariantów jeśli nie są osadzone w masterze
 * @returns {AvailabilityResult}
 */
export function checkContentAvailability(contentMaster, targetLocale, options = {}) {
    if (!contentMaster || typeof contentMaster !== 'object') {
        return {
            available: false,
            variantId: null,
            status: null,
            reason: 'BRAK_REKORDU_TRESCI',
            variantData: null
        };
    }

    const normLocale = normalizeLocaleCode(targetLocale);
    const requestedFormat = (options.requestedFormat || 'TEXT').toUpperCase();

    // 1. Wyszukanie wariantów w rekordzie mastera lub w przekazanej mapie
    let variants = [];
    if (Array.isArray(contentMaster.variants)) {
        variants = contentMaster.variants;
    } else if (contentMaster.variants && typeof contentMaster.variants === 'object') {
        variants = Object.values(contentMaster.variants);
    } else if (options.variantsMap instanceof Map) {
        variants = Array.from(options.variantsMap.values());
    }

    // Dopasowanie wariantów dla żądanego języka
    const matchingVariants = variants.filter(v => {
        const vLang = normalizeLocaleCode(v.language || v.locale);
        return vLang === normLocale;
    });

    if (matchingVariants.length === 0) {
        return {
            available: false,
            variantId: null,
            status: null,
            reason: 'VARIANT_NOT_FOUND',
            variantData: null
        };
    }

    // 2. Dyrektywa 18: Router może użyć TYLKO wariantu ze statusem APPROVED
    const approvedVariant = matchingVariants.find(v => v.status === 'APPROVED');
    if (!approvedVariant) {
        // Sprawdź czy jest w trakcie recenzji dla dokładniejszej diagnostyki
        const unapproved = matchingVariants[0];
        const unapprovedStatus = unapproved.status || 'UNKNOWN';
        return {
            available: false,
            variantId: unapproved.variantId || null,
            status: unapprovedStatus,
            reason: unapprovedStatus === 'REVIEW_REQUIRED' 
                ? 'VARIANT_REVIEW_REQUIRED' 
                : `VARIANT_NOT_APPROVED (${unapprovedStatus})`,
            variantData: null
        };
    }

    // 3. Dyrektywa 19: Rights Gate Integration (Weryfikacja praw)
    const rights = approvedVariant.rights || contentMaster.rights;
    if (rights) {
        // Sprawdzenie typu własności
        if (rights.ownership === 'UNKNOWN') {
            return {
                available: false,
                variantId: approvedVariant.variantId,
                status: 'BLOCKED_BY_RIGHTS',
                reason: 'RIGHTS_OWNERSHIP_UNKNOWN',
                variantData: null
            };
        }

        // Sprawdzenie praw do tłumaczenia jeśli to wariant obcojęzyczny
        if (normLocale !== normalizeLocaleCode(contentMaster.originalLanguage)) {
            if (rights.translationAllowed === false) {
                return {
                    available: false,
                    variantId: approvedVariant.variantId,
                    status: 'BLOCKED_BY_RIGHTS',
                    reason: 'RIGHTS_TRANSLATION_NOT_ALLOWED',
                    variantData: null
                };
            }
        }

        // Sprawdzenie praw do dystrybucji audio/TTS
        if (requestedFormat === 'AUDIO' && rights.audioDistributionAllowed === false) {
            return {
                available: false,
                variantId: approvedVariant.variantId,
                status: 'BLOCKED_BY_RIGHTS',
                reason: 'RIGHTS_AUDIO_DISTRIBUTION_NOT_ALLOWED',
                variantData: null
            };
        }
    }

    return {
        available: true,
        variantId: approvedVariant.variantId,
        status: 'APPROVED',
        reason: null,
        variantData: approvedVariant
    };
}
