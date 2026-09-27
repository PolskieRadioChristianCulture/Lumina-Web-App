/**
 * ══════════════════════════════════════════════════════════════════════════
 * CC GLOBAL ROUTER — MAIN ROUTER CORE (FAZA 5)
 * Standard Architektury: MASTER PLAN CC GLOBAL 2030 (FAZA 5)
 * Wersja Silnika: CC GLOBAL ROUTER v1 (2026.5-cc-router-v1)
 * Dyrektywy 1-2, 4-12, 17-22, 26-28, 50-57, 89-95
 * 
 * ZASADY NACZELNE:
 * 1. CZŁOWIEK MA PIERWSZEŃSTWO PRZED ALGORYTMEM (USER CHOICE > PROFILE > BROWSER > GEO).
 * 2. GEO SUGGESTS. GEO DOES NOT COMMAND.
 * 3. ROUTER RESOLVES. ROUTER DOES NOT TRANSLATE.
 * 4. ONLY APPROVED CONTENT MAY BE SERVED.
 * 5. NO RAW IP. ZERO PII.
 * 6. SHADOW MODE ONLY W FAZIE 5A (ZERO PUBLIC EXPERIENCE CHANGE).
 * 7. AWARIA ROUTERA NIGDY NIE PSUJE PORTALU CHRISTIAN CULTURE.
 * ══════════════════════════════════════════════════════════════════════════
 */

import { CC_LOCALE_REGISTRY, isValidLocale, normalizeLocaleCode, getLocale } from './locale-registry.js';
import { extractCoarseGeo, sanitizeRoutingContext } from './privacy-guard.js';
import { resolveSignal, parseAcceptLanguage } from './signal-resolver.js';
import { resolveWithFallback } from './fallback-engine.js';
import { createRoutingDecision, createShadowRoutingDecision } from './routing-decision.js';
import { isSearchEngineCrawler } from './seo-localization.js';
import { getGeoHints } from './geo-hints.js';

export const CC_GLOBAL_ROUTER_VERSION = '2026.5-cc-router-v2';

/**
 * Poziomy aktywacji routera (Gate 5.6 Controlled Activation)
 * Dyrektywa 2: USER INTENT FIRST — Aktywacja sterowana świadomą decyzją człowieka
 */
export const ROUTER_ACTIVATION_LEVELS = Object.freeze({
    LEVEL_0_SHADOW: 0,
    LEVEL_1_USER_CHOICE: 1,
    LEVEL_2_CC_ID: 2,
    LEVEL_3_REMEMBERED_PREFERENCE: 3,
    LEVEL_4_URL_LOCALE: 4,
    LEVEL_5_BROWSER_SUGGESTION: 5,
    LEVEL_6_GEO_SUGGESTION: 6
});

/**
 * Zwraca czytelną etykietę natywną dla sugestii językowej
 * @param {string} locale
 * @returns {string}
 */
export function getSuggestionLabel(locale) {
    const loc = getLocale(locale);
    if (loc && loc.nativeName) return loc.nativeName;
    const norm = normalizeLocaleCode(locale);
    switch (norm) {
        case 'pl': return 'Polski';
        case 'en': return 'English';
        case 'es': return 'Español';
        case 'pt-br': return 'Português (Brasil)';
        case 'de': return 'Deutsch';
        case 'fr': return 'Français';
        case 'it': return 'Italiano';
        case 'uk': return 'Українська';
        default: return norm.toUpperCase();
    }
}

/**
 * Zwraca przyjazny prompt dla użytkownika (np. "View in English?", "¿Ver en Español?")
 * @param {string} locale
 * @returns {string}
 */
export function getSuggestionPrompt(locale) {
    const norm = normalizeLocaleCode(locale);
    switch (norm) {
        case 'pl': return 'Czytać po polsku?';
        case 'en': return 'View in English?';
        case 'es': return '¿Ver en Español?';
        case 'pt-br': return 'Ver em Português?';
        default: return `View in ${getSuggestionLabel(norm)}?`;
    }
}

/**
 * @typedef {Object} RouterConfig
 * @property {boolean} [routerEnabled=true] - Czy router aktywnie zmienia doświadczenie użytkownika
 * @property {boolean} [shadowMode=false] - Czy router działa w trybie cienia
 * @property {number} [activationLevel=4] - Poziom aktywacji (0 = shadow, 1 = user, 2 = cc id, 3 = remembered, 4 = url, 5 = browser sug, 6 = geo sug)
 * @property {boolean} [explicitChoiceRouting=true] - Level 1: Aktywny routing po jawnym kliknięciu
 * @property {boolean} [ccIdRouting=true] - Level 2: Aktywny routing z profilu CC ID
 * @property {boolean} [rememberedPreferenceRouting=true] - Level 3: Aktywny routing z zapamiętanego wyboru
 * @property {boolean} [urlLocaleRouting=true] - Level 4: Aktywny routing z adresu URL
 * @property {boolean} [browserAutoRedirect=false] - Zero auto-redirect na podstawie przeglądarki (tylko sugestia)
 * @property {boolean} [geoAutoRedirect=false] - Zero auto-redirect na podstawie GEO (tylko sugestia)
 * @property {boolean} [geoHintsEnabled=true] - Czy uwzględniać podpowiedzi z coarse geo
 * @property {boolean} [browserLanguageEnabled=true] - Czy uwzględniać język przeglądarki
 * @property {boolean} [ccIdPreferenceEnabled=true] - Czy uwzględniać preferencję z profilu CC ID
 * @property {boolean} [anonymousPreferenceEnabled=true] - Czy uwzględniać zapamiętany wybór w cookie/storage
 * @property {boolean} [globalRouterOff=false] - Niezależny Router Kill Switch (natychmiastowy fallback)
 * @property {string} [defaultLocale='pl'] - Bezpieczne domyślne locale
 */

export class CCGlobalRouter {
    /**
     * @param {RouterConfig} [config]
     */
    constructor(config = {}) {
        this.version = '2026.5-cc-router-v2';
        
        // Gate 5.6: Poziomy aktywacji kontrolowanej
        this.activationLevel = config.activationLevel ?? ROUTER_ACTIVATION_LEVELS.LEVEL_4_URL_LOCALE;
        this.routerEnabled = config.routerEnabled ?? (this.activationLevel > 0);
        this.shadowMode = config.shadowMode ?? (this.activationLevel === 0);

        // Flagi aktywacji poszczególnych sygnałów (Levels 1-4 aktywne, 5-6 wyłącznie sugestia)
        this.explicitChoiceRouting = config.explicitChoiceRouting ?? (this.activationLevel >= 1);
        this.ccIdRouting = config.ccIdRouting ?? (this.activationLevel >= 2);
        this.rememberedPreferenceRouting = config.rememberedPreferenceRouting ?? (this.activationLevel >= 3);
        this.urlLocaleRouting = config.urlLocaleRouting ?? (this.activationLevel >= 4);

        // Pancerne reguły Gate 5.6: ZERO AUTO-REDIRECT dla Browser i GEO
        this.browserAutoRedirect = config.browserAutoRedirect ?? false;
        this.geoAutoRedirect = config.geoAutoRedirect ?? false;

        this.geoHintsEnabled = config.geoHintsEnabled ?? true;
        this.browserLanguageEnabled = config.browserLanguageEnabled ?? true;
        this.ccIdPreferenceEnabled = config.ccIdPreferenceEnabled ?? true;
        this.anonymousPreferenceEnabled = config.anonymousPreferenceEnabled ?? true;
        this.globalRouterOff = config.globalRouterOff ?? false;
        this.defaultLocale = normalizeLocaleCode(config.defaultLocale || 'pl');

        // Pamięć podręczna decyzji dla weryfikacji i telemetrii
        this.recentDecisions = [];
        this.maxDecisionHistory = 500;
    }

    /**
     * Główny punkt decyzyjny Routera CC
     * @param {Object} requestContext
     * @param {string} [requestContext.explicitUserChoice]
     * @param {string} [requestContext.ccIdPreference]
     * @param {string} [requestContext.rememberedPreference]
     * @param {string|URL} [requestContext.url]
     * @param {string} [requestContext.acceptLanguage]
     * @param {string[]} [requestContext.browserLanguages]
     * @param {Object} [requestContext.rawGeo]
     * @param {string} [requestContext.userAgent]
     * @param {Object} [requestContext.contentMaster]
     * @param {string} [requestContext.actualLocale]
     * @param {string} [requestContext.requestedFormat]
     * @param {string[]|Set<string>} [requestContext.dismissedSuggestions]
     * @returns {import('./routing-decision.js').RoutingDecision & { shadowDecision?: import('./routing-decision.js').ShadowRoutingDecision }}
     */
    resolve(requestContext = {}) {
        try {
            return this._executeResolve(requestContext);
        } catch (error) {
            // Awaria routera NIGDY nie psuje portalu — bezpieczny fallback do PL
            const fallbackDecision = createRoutingDecision({
                requestedLocale: this.defaultLocale,
                resolvedLocale: this.defaultLocale,
                interfaceLocale: this.defaultLocale,
                contentLocale: this.defaultLocale,
                activationLevel: this.activationLevel,
                suggestion: null,
                signalSource: 'GLOBAL_FALLBACK',
                signalPriority: 8,
                geoHintUsed: false,
                geoOverridden: false,
                geoCountry: null,
                fallbackUsed: true,
                fallbackReason: `ROUTER_EXCEPTION_SAFE_FALLBACK (${error.message})`,
                contentVariantId: null,
                routerVersion: this.version
            });

            return fallbackDecision;
        }
    }

    /**
     * Wewnętrzna implementacja logiki rozwiązywania routingu
     * @private
     */
    _executeResolve(requestContext) {
        const actualLocale = normalizeLocaleCode(requestContext.actualLocale || this.defaultLocale);

        // 1. Sprawdzenie Router Kill Switch (globalRouterOff: true -> natychmiastowe przywrócenie stanu pierwotnego)
        if (this.globalRouterOff) {
            return createRoutingDecision({
                requestedLocale: this.defaultLocale,
                resolvedLocale: actualLocale,
                interfaceLocale: actualLocale,
                contentLocale: actualLocale,
                activationLevel: 0,
                suggestion: null,
                signalSource: 'GLOBAL_FALLBACK',
                signalPriority: 8,
                geoHintUsed: false,
                geoOverridden: false,
                geoCountry: null,
                fallbackUsed: true,
                fallbackReason: 'ROUTER_KILL_SWITCH_ACTIVE',
                contentVariantId: null,
                routerVersion: this.version
            });
        }

        // 2. Ochrona prywatności i wydobycie Coarse Geo (DROP IP)
        const coarseGeo = extractCoarseGeo(requestContext.rawGeo);
        const countryCode = coarseGeo.countryCode;

        // 3. Sprawdzenie czy to crawler / bot wyszukiwarki (Botom nie narzucamy personalizacji)
        const isBot = isSearchEngineCrawler(requestContext.userAgent);

        // 4. Przygotowanie sygnałów wejściowych
        const signals = {
            explicitUserChoice: requestContext.explicitUserChoice,
            ccIdPreference: requestContext.ccIdPreference,
            rememberedPreference: requestContext.rememberedPreference,
            url: requestContext.url,
            acceptLanguage: isBot ? null : requestContext.acceptLanguage,
            browserLanguages: isBot ? null : requestContext.browserLanguages,
            countryCode: isBot ? null : countryCode,
            contentDefault: requestContext.contentMaster?.originalLanguage || this.defaultLocale
        };

        const signalOptions = {
            geoHintsEnabled: this.geoHintsEnabled,
            browserLanguageEnabled: this.browserLanguageEnabled,
            ccIdPreferenceEnabled: this.ccIdPreferenceEnabled,
            anonymousPreferenceEnabled: this.anonymousPreferenceEnabled
        };

        // 5. Rozwiązanie dominującego sygnału wg deterministycznej hierarchii
        const resolvedSignal = resolveSignal(signals, signalOptions);

        // 6. Gate 5.6 Controlled Activation: Sprawdzenie czy sygnał ma uprawnienie do aktywnego przełączenia
        let isActiveRoutingSignal = false;
        if (this.routerEnabled && !this.shadowMode) {
            if (resolvedSignal.signalSource === 'EXPLICIT_USER_CHOICE' && this.explicitChoiceRouting) {
                isActiveRoutingSignal = true; // Level 1
            } else if (resolvedSignal.signalSource === 'CC_ID_LANGUAGE_PREFERENCE' && this.ccIdRouting) {
                isActiveRoutingSignal = true; // Level 2
            } else if (resolvedSignal.signalSource === 'REMEMBERED_LANGUAGE_PREFERENCE' && this.rememberedPreferenceRouting) {
                isActiveRoutingSignal = true; // Level 3
            } else if (resolvedSignal.signalSource === 'EXPLICIT_URL_LOCALE' && this.urlLocaleRouting) {
                isActiveRoutingSignal = true; // Level 4
            } else if (resolvedSignal.signalSource === 'BROWSER_LANGUAGE' && this.browserAutoRedirect) {
                isActiveRoutingSignal = true; // W 5.6 ZABLOKOWANE
            } else if (resolvedSignal.signalSource === 'COARSE_GEO' && this.geoAutoRedirect) {
                isActiveRoutingSignal = true; // W 5.6 ZABLOKOWANE
            }
        }

        // Ustalenie żądanego języka interfejsu (interfaceLocale)
        // W trybie cienia (Shadow Mode) lub przy aktywnym sygnale (Levels 1-4) stosujemy kandydata silnika
        // W trybie kontrolowanym bez aktywnego sygnału człowieka (Levels 5-6) zachowujemy actualLocale
        const isShadow = this.shadowMode || !this.routerEnabled;
        const targetInterfaceLocale = (isActiveRoutingSignal || isShadow) ? resolvedSignal.candidateLocale : actualLocale;

        // 7. Generowanie nieinwazyjnej sugestii (Levels 5-6: Browser & GEO Suggestion)
        let suggestion = null;
        const dismissed = new Set(
            Array.isArray(requestContext.dismissedSuggestions)
                ? requestContext.dismissedSuggestions.map(normalizeLocaleCode)
                : []
        );

        if (!isActiveRoutingSignal && !isBot) {
            // Sprawdzenie języka przeglądarki
            let browserLocales = [];
            if (signals.acceptLanguage) {
                browserLocales = parseAcceptLanguage(signals.acceptLanguage);
            } else if (Array.isArray(signals.browserLanguages)) {
                browserLocales = signals.browserLanguages.map(normalizeLocaleCode).filter(l => isValidLocale(l, true));
            }

            const browserCandidate = browserLocales[0] || null;

            if (browserCandidate && browserCandidate !== actualLocale && !dismissed.has(browserCandidate)) {
                suggestion = {
                    type: 'BROWSER_SUGGESTION',
                    suggestedLocale: browserCandidate,
                    label: getSuggestionLabel(browserCandidate),
                    prompt: getSuggestionPrompt(browserCandidate),
                    source: 'BROWSER_LANGUAGE'
                };
            } else if (browserCandidate && browserCandidate === actualLocale) {
                // Browser i aktualna strona są w zgodzie — nie pokazujemy agresywnej sugestii GEO
                suggestion = null;
            } else if (countryCode && this.geoHintsEnabled) {
                // Sprawdzenie sugestii GEO (Level 6)
                const hints = getGeoHints(countryCode);
                const geoCandidate = hints.find(h => isValidLocale(h, true)) || null;

                if (geoCandidate && geoCandidate !== actualLocale && !dismissed.has(geoCandidate)) {
                    // Jeśli przeglądarka wskazuje inny język niż GEO, przeglądarka jest silniejsza (Pkt 13)
                    const browserConflict = browserCandidate && browserCandidate !== geoCandidate;
                    if (!browserConflict) {
                        suggestion = {
                            type: 'GEO_SUGGESTION',
                            suggestedLocale: geoCandidate,
                            label: getSuggestionLabel(geoCandidate),
                            prompt: getSuggestionPrompt(geoCandidate),
                            source: 'COARSE_GEO'
                        };
                    }
                }
            }
        }

        // 8. Rozwiązanie dostępności treści z łańcuchem fallback (contentLocale)
        const fallbackOptions = {
            contentDefault: signals.contentDefault,
            requestedFormat: requestContext.requestedFormat || 'TEXT'
        };

        const fallbackRes = resolveWithFallback(
            targetInterfaceLocale,
            requestContext.contentMaster,
            fallbackOptions
        );

        // 9. Konstrukcja kanonicznej decyzji routingu
        const decision = createRoutingDecision({
            requestedLocale: resolvedSignal.candidateLocale,
            resolvedLocale: fallbackRes.resolvedLocale,
            interfaceLocale: targetInterfaceLocale,
            contentLocale: fallbackRes.resolvedLocale,
            activationLevel: this.activationLevel,
            suggestion,
            signalSource: resolvedSignal.signalSource,
            signalPriority: resolvedSignal.signalPriority,
            geoHintUsed: resolvedSignal.geoHintUsed,
            geoOverridden: resolvedSignal.geoOverridden,
            geoCountry: resolvedSignal.geoCountry,
            fallbackUsed: fallbackRes.fallbackUsed,
            fallbackReason: fallbackRes.fallbackReason,
            contentVariantId: fallbackRes.contentVariantId,
            routerVersion: this.version
        });

        // 10. Shadow Mode & Shadow Evaluation (Dla analizy porównawczej i poziomów 5-6)
        if (isShadow || !isActiveRoutingSignal) {
            const shadowTarget = suggestion ? suggestion.suggestedLocale : decision.resolvedLocale;
            const shadowDecision = {
                actualLocale,
                shadowResolvedLocale: shadowTarget,
                signalSource: suggestion ? suggestion.source : decision.signalSource,
                wouldChange: (actualLocale.toLowerCase() !== shadowTarget.toLowerCase()),
                decisionReason: decision.explainability,
                timestamp: new Date().toISOString()
            };
            decision.shadowDecision = shadowDecision;
            decision.shadowModeActive = isShadow;
        } else {
            decision.shadowModeActive = false;
        }

        // Zapis w historii audytowej
        this._recordDecision(decision);

        return decision;
    }

    /**
     * Rejestruje decyzję w wewnętrznej pamięci diagnostycznej
     * @private
     */
    _recordDecision(decision) {
        if (this.recentDecisions.length >= this.maxDecisionHistory) {
            this.recentDecisions.shift();
        }
        this.recentDecisions.push({
            requestedLocale: decision.requestedLocale,
            resolvedLocale: decision.resolvedLocale,
            signalSource: decision.signalSource,
            geoCountry: decision.geoCountry,
            geoOverridden: decision.geoOverridden,
            fallbackUsed: decision.fallbackUsed,
            timestamp: decision.decisionTimestamp
        });
    }

    /**
     * Zwraca statystyki diagnostyczne dla Mission Control / Global Observer
     */
    getDiagnosticStats() {
        const total = this.recentDecisions.length;
        if (total === 0) {
            return {
                totalDecisions: 0,
                signalSources: {},
                fallbackCount: 0,
                fallbackRate: 0,
                geoOverridesCount: 0,
                geoOverrideRate: 0
            };
        }

        const signalSources = {};
        let fallbackCount = 0;
        let geoOverridesCount = 0;

        for (const d of this.recentDecisions) {
            signalSources[d.signalSource] = (signalSources[d.signalSource] || 0) + 1;
            if (d.fallbackUsed) fallbackCount++;
            if (d.geoOverridden) geoOverridesCount++;
        }

        return {
            totalDecisions: total,
            signalSources,
            fallbackCount,
            fallbackRate: parseFloat((fallbackCount / total).toFixed(4)),
            geoOverridesCount,
            geoOverrideRate: parseFloat((geoOverridesCount / total).toFixed(4))
        };
    }

    /**
     * Raportuje stan zdrowia komponentu dla System Health Dashboard / Global Observer
     * Dyrektywy Gate 5.5 i 5.6:
     * - OFF (gdy kill switch active)
     * - SHADOW_HEALTHY (gdy routerEnabled=false lub shadowMode=true)
     * - SHADOW_DEGRADED (gdy wysoki poziom błędów w shadow)
     * - CONTROLLED_ACTIVE (gdy aktywny w Gate 5.6 pod ścisłą kontrolą człowieka)
     * - DEGRADED (gdy wysoki poziom błędów w trybie aktywnym)
     * - ERROR / UNKNOWN
     * Kategoryczny zakaz raportowania FULLY_AUTONOMOUS ani niesprawdzonego ACTIVE.
     * @returns {'CONTROLLED_ACTIVE' | 'SHADOW_HEALTHY' | 'SHADOW_DEGRADED' | 'DEGRADED' | 'OFF' | 'ERROR' | 'UNKNOWN'}
     */
    getHealthStatus() {
        if (this.globalRouterOff) {
            return 'OFF';
        }
        
        try {
            const stats = this.getDiagnosticStats();
            const isDegraded = stats.totalDecisions > 0 && stats.fallbackRate > 0.8;

            if (this.shadowMode || !this.routerEnabled) {
                return isDegraded ? 'SHADOW_DEGRADED' : 'SHADOW_HEALTHY';
            }

            // Gate 5.6: Kontrolowana aktywacja
            if (this.routerEnabled && !this.shadowMode && !this.browserAutoRedirect && !this.geoAutoRedirect) {
                return isDegraded ? 'DEGRADED' : 'CONTROLLED_ACTIVE';
            }

            return 'UNKNOWN';
        } catch {
            return 'ERROR';
        }
    }
}
