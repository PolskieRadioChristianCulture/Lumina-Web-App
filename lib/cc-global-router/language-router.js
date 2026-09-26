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

import { CC_LOCALE_REGISTRY, isValidLocale, normalizeLocaleCode } from './locale-registry.js';
import { extractCoarseGeo, sanitizeRoutingContext } from './privacy-guard.js';
import { resolveSignal } from './signal-resolver.js';
import { resolveWithFallback } from './fallback-engine.js';
import { createRoutingDecision, createShadowRoutingDecision } from './routing-decision.js';
import { isSearchEngineCrawler } from './seo-localization.js';

export const CC_GLOBAL_ROUTER_VERSION = 'v1';

/**
 * @typedef {Object} RouterConfig
 * @property {boolean} [routerEnabled=false] - Czy router aktywnie zmienia doświadczenie użytkownika
 * @property {boolean} [shadowMode=true] - Tryb cienia: oblicza co zostałoby zaserwowane bez zmian na produkcji
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
        this.version = '2026.5-cc-router-v1';
        
        // Faza 5A: Domyślnie routerEnabled = false oraz shadowMode = true
        this.routerEnabled = config.routerEnabled ?? false;
        this.shadowMode = config.shadowMode ?? true;
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
     * @returns {import('./routing-decision.js').RoutingDecision & { shadowDecision?: import('./routing-decision.js').ShadowRoutingDecision }}
     */
    resolve(requestContext = {}) {
        try {
            return this._executeResolve(requestContext);
        } catch (error) {
            // Dyrektywa 89, 90: Awaria routera NIGDY nie psuje portalu — bezpieczny fallback do PL
            const fallbackDecision = createRoutingDecision({
                requestedLocale: this.defaultLocale,
                resolvedLocale: this.defaultLocale,
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
        // 1. Sprawdzenie Router Kill Switch (Dyrektywa 91, 92, 93)
        if (this.globalRouterOff) {
            return createRoutingDecision({
                requestedLocale: this.defaultLocale,
                resolvedLocale: this.defaultLocale,
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

        // 2. Ochrona prywatności i wydobycie Coarse Geo (Dyrektywa 10, 30)
        const coarseGeo = extractCoarseGeo(requestContext.rawGeo);
        const countryCode = coarseGeo.countryCode;

        // 3. Sprawdzenie czy to crawler / bot wyszukiwarki (Dyrektywa 34)
        const isBot = isSearchEngineCrawler(requestContext.userAgent);

        // 4. Przygotowanie sygnałów wejściowych
        const signals = {
            explicitUserChoice: requestContext.explicitUserChoice,
            ccIdPreference: requestContext.ccIdPreference,
            rememberedPreference: requestContext.rememberedPreference,
            url: requestContext.url,
            acceptLanguage: isBot ? null : requestContext.acceptLanguage, // Botom nie narzucamy Accept-Language
            browserLanguages: isBot ? null : requestContext.browserLanguages,
            countryCode: isBot ? null : countryCode, // Boty nie podlegają GEO redirectom
            contentDefault: requestContext.contentMaster?.originalLanguage || this.defaultLocale
        };

        const signalOptions = {
            geoHintsEnabled: this.geoHintsEnabled,
            browserLanguageEnabled: this.browserLanguageEnabled,
            ccIdPreferenceEnabled: this.ccIdPreferenceEnabled,
            anonymousPreferenceEnabled: this.anonymousPreferenceEnabled
        };

        // 5. Rozwiązanie dominującego sygnału wg hierarchii 8 priorytetów
        const resolvedSignal = resolveSignal(signals, signalOptions);

        // 6. Sprawdzenie dostępności treści i ewentualne użycie łańcucha fallback
        const fallbackOptions = {
            contentDefault: signals.contentDefault,
            requestedFormat: requestContext.requestedFormat || 'TEXT'
        };

        const fallbackRes = resolveWithFallback(
            resolvedSignal.candidateLocale,
            requestContext.contentMaster,
            fallbackOptions
        );

        // 7. Konstrukcja kanonicznej decyzji routingu
        const decision = createRoutingDecision({
            requestedLocale: resolvedSignal.candidateLocale,
            resolvedLocale: fallbackRes.resolvedLocale,
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

        // 8. Dyrektywy 54-57: Shadow Mode (Oblicza cień, zachowując obecne zachowanie)
        if (this.shadowMode || !this.routerEnabled) {
            const actualLocale = normalizeLocaleCode(requestContext.actualLocale || this.defaultLocale);
            const shadowDecision = createShadowRoutingDecision(actualLocale, decision);
            decision.shadowDecision = shadowDecision;
            decision.shadowModeActive = true;
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
     * Dyrektywa Gate 5.5: Dozwolone stany: SHADOW_HEALTHY, SHADOW_DEGRADED, OFF, ERROR, UNKNOWN.
     * Bezwzględny zakaz raportowania sztucznego ACTIVE.
     * @returns {'SHADOW_HEALTHY' | 'SHADOW_DEGRADED' | 'OFF' | 'ERROR' | 'UNKNOWN'}
     */
    getHealthStatus() {
        if (this.globalRouterOff) {
            return 'OFF';
        }
        
        try {
            const stats = this.getDiagnosticStats();
            if (stats.totalDecisions > 0 && stats.fallbackRate > 0.8) {
                return 'SHADOW_DEGRADED';
            }
            if (this.shadowMode || !this.routerEnabled) {
                return 'SHADOW_HEALTHY';
            }
            return 'UNKNOWN';
        } catch {
            return 'ERROR';
        }
    }
}
