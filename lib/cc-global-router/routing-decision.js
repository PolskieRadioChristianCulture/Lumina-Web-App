/**
 * ══════════════════════════════════════════════════════════════════════════
 * CC GLOBAL ROUTER — ROUTING DECISION & EXPLAINABILITY (FAZA 5)
 * Standard Architektury: MASTER PLAN CC GLOBAL 2030 (FAZA 5)
 * Dyrektywy 26, 27, 55, 56, 85:
 * - Kanoniczny obiekt decyzji routingu
 * - 100% wyjaśnialność (Explainability): dlaczego wybrano dany język
 * - Shadow Mode Decision: porównanie stanu rzeczywistego z cieniem
 * ══════════════════════════════════════════════════════════════════════════
 */

export const CC_ROUTING_DECISION_VERSION = 'v1';

/**
 * @typedef {Object} RoutingDecision
 * @property {string} requestedLocale - Pierwotnie postulowane locale (wg sygnałów wejściowych)
 * @property {string} resolvedLocale - Ostatecznie dobrane locale po walidacji i fallbacku
 * @property {string} signalSource - Źródło dominującego sygnału (np. "EXPLICIT_USER_CHOICE")
 * @property {number} signalPriority - Priorytet dominującego sygnału (1..8)
 * @property {boolean} geoHintUsed - Czy wykorzystano podpowiedź z geolokalizacji
 * @property {boolean} geoOverridden - Czy sygnał wyższego rzędu zignorował podpowiedź GEO
 * @property {string|null} geoCountry - Kraj coarse geo (jeśli dostępny)
 * @property {boolean} fallbackUsed - Czy zastosowano fallback treści/języka
 * @property {string|null} fallbackReason - Powód zastosowania fallbacku
 * @property {string|null} contentVariantId - ID zatwierdzonego wariantu (jeśli w kontekście treści)
 * @property {string} decisionTimestamp - Znacznik czasu decyzji (ISO 8601 UTC)
 * @property {string} routerVersion - Wersja silnika routingu
 * @property {string} explainability - Przejrzyste wyjaśnienie tekstowe dla Mission Control
 */

/**
 * @typedef {Object} ShadowRoutingDecision
 * @property {string} actualLocale - Język rzeczywiście zaserwowany użytkownikowi w obecnym systemie
 * @property {string} shadowResolvedLocale - Język, który zostałby zaserwowany przez Router v1
 * @property {string} signalSource - Źródło decyzji routera
 * @property {boolean} wouldChange - Czy Router dokonałby zmiany doświadczenia użytkownika
 * @property {string} decisionReason - Uzasadnienie decyzji
 * @property {string} timestamp - Czas analizy cienia
 */

/**
 * Generuje czytelne wyjaśnienie decyzji routingu (Explainability)
 * @param {Object} params
 * @returns {string}
 */
export function generateExplainabilityString(params) {
    const parts = [
        `Resolved: [${params.resolvedLocale.toUpperCase()}]`,
        `Source: ${params.signalSource} (Priorytet ${params.signalPriority})`
    ];

    if (params.geoCountry) {
        parts.push(`Geo: ${params.geoCountry}`);
        if (params.geoOverridden) {
            parts.push('Geo Overridden: YES');
        } else if (params.geoHintUsed) {
            parts.push('Geo Hint Used: YES');
        }
    }

    if (params.fallbackUsed) {
        parts.push(`Fallback: YES (${params.fallbackReason || 'UNAVAILABLE'})`);
    } else {
        parts.push('Fallback: NO');
    }

    if (params.contentVariantId) {
        parts.push(`Variant: ${params.contentVariantId}`);
    }

    return parts.join(' | ');
}

/**
 * Tworzy kanoniczny obiekt decyzji routingu
 * @param {Object} params
 * @returns {RoutingDecision}
 */
export function createRoutingDecision(params) {
    const timestamp = params.decisionTimestamp || new Date().toISOString();
    const routerVersion = params.routerVersion || '2026.5-cc-router-v1';

    const explainability = params.explainability || generateExplainabilityString({
        resolvedLocale: params.resolvedLocale,
        signalSource: params.signalSource,
        signalPriority: params.signalPriority,
        geoCountry: params.geoCountry,
        geoOverridden: params.geoOverridden,
        geoHintUsed: params.geoHintUsed,
        fallbackUsed: params.fallbackUsed,
        fallbackReason: params.fallbackReason,
        contentVariantId: params.contentVariantId
    });

    return {
        requestedLocale: params.requestedLocale,
        resolvedLocale: params.resolvedLocale,
        interfaceLocale: params.interfaceLocale || params.resolvedLocale,
        contentLocale: params.contentLocale || params.resolvedLocale,
        activationLevel: params.activationLevel ?? null,
        suggestion: params.suggestion || null,
        signalSource: params.signalSource,
        signalPriority: params.signalPriority,
        geoHintUsed: !!params.geoHintUsed,
        geoOverridden: !!params.geoOverridden,
        geoCountry: params.geoCountry || null,
        fallbackUsed: !!params.fallbackUsed,
        fallbackReason: params.fallbackReason || null,
        contentVariantId: params.contentVariantId || null,
        decisionTimestamp: timestamp,
        routerVersion,
        explainability
    };
}

/**
 * Tworzy obiekt analizy trybu cienia (Shadow Mode Decision)
 * @param {string} actualLocale
 * @param {RoutingDecision} routingDecision
 * @returns {ShadowRoutingDecision}
 */
export function createShadowRoutingDecision(actualLocale, routingDecision) {
    const wouldChange = (actualLocale.toLowerCase() !== routingDecision.resolvedLocale.toLowerCase());
    
    return {
        actualLocale,
        shadowResolvedLocale: routingDecision.resolvedLocale,
        signalSource: routingDecision.signalSource,
        wouldChange,
        decisionReason: routingDecision.explainability,
        timestamp: new Date().toISOString()
    };
}
