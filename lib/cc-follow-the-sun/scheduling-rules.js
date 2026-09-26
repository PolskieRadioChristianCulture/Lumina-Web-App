/**
 * ══════════════════════════════════════════════════════════════════════════
 * CC GLOBAL FOLLOW THE SUN 24/7 — SCHEDULING RULES & PROFILES (FAZA 6A)
 * Standard Architektury: MASTER PLAN CC GLOBAL 2030 (FAZA 6A)
 * Dyrektywy 14-26, 48-50, 55, 56, 76-78, 91, 92:
 * Profile czasowe treści, jawne reguły operatora, tryb Sabbath Safe,
 * deterministyczne "WHY THIS TIME?", wersjonowanie reguł.
 * ZERO AI BLACK BOX — ZERO ZMYŚLANIA GODZIN SZCZYTU.
 * ══════════════════════════════════════════════════════════════════════════
 */

export const SCHEDULING_RULE_VERSION = 'v1';

/**
 * Standardowe profile czasowe treści w Christian Culture
 * @type {Record<import('../cc-content-core/types.js').ContentTimeProfile, Object>}
 */
export const CONTENT_TIME_PROFILES = Object.freeze({
    MORNING: {
        profile: 'MORNING',
        description: 'Poranne rozważanie / inspiracja na początek dnia',
        defaultWindowStart: '06:00',
        defaultWindowEnd: '09:00',
        defaultPreferredTime: '07:00',
        defaultBasis: 'OPERATOR_RULE',
        ruleName: 'MORNING_DEVOTIONAL_WINDOW'
    },
    EVENING: {
        profile: 'EVENING',
        description: 'Wieczorny psalm, modlitwa lub podsumowanie dnia',
        defaultWindowStart: '18:00',
        defaultWindowEnd: '21:00',
        defaultPreferredTime: '19:00',
        defaultBasis: 'OPERATOR_RULE',
        ruleName: 'EVENING_DEVOTIONAL_WINDOW'
    },
    EVERGREEN: {
        profile: 'EVERGREEN',
        description: 'Treść ponadczasowa, elastyczne okno popołudniowe',
        defaultWindowStart: '14:00',
        defaultWindowEnd: '18:00',
        defaultPreferredTime: '16:00',
        defaultBasis: 'OPERATOR_RULE',
        ruleName: 'EVERGREEN_AFTERNOON_WINDOW'
    },
    FIXED_TIME: {
        profile: 'FIXED_TIME',
        description: 'Treść powiązana ze ścisłą godziną (np. stała audycja radiowa)',
        defaultWindowStart: null,
        defaultWindowEnd: null,
        defaultPreferredTime: null,
        defaultBasis: 'OPERATOR_RULE',
        ruleName: 'FIXED_TIME_CANNOT_SHIFT'
    },
    SABBATH: {
        profile: 'SABBATH',
        description: 'Treść szabatowa — granice wyznacza zachód słońca',
        defaultWindowStart: null,
        defaultWindowEnd: null,
        defaultPreferredTime: null,
        defaultBasis: 'OPERATOR_RULE',
        ruleName: 'SABBATH_SUNSET_WINDOW'
    },
    EVENT: {
        profile: 'EVENT',
        description: 'Wydarzenie o określonym czasie trwania',
        defaultWindowStart: null,
        defaultWindowEnd: null,
        defaultPreferredTime: null,
        defaultBasis: 'OPERATOR_RULE',
        ruleName: 'EVENT_SPECIFIC_WINDOW'
    },
    BREAKING: {
        profile: 'BREAKING',
        description: 'Wiadomość pilna — w 6A wyłącznie tryb manualny',
        defaultWindowStart: null,
        defaultWindowEnd: null,
        defaultPreferredTime: null,
        defaultBasis: 'OPERATOR_RULE',
        ruleName: 'BREAKING_MANUAL_ONLY'
    }
});

/**
 * Rozwiązuje okno czasowe dla treści na podstawie profilu, reguł operatora i zagregowanych danych.
 * 
 * @param {Object} params
 * @param {import('../cc-content-core/types.js').ContentTimeProfile} params.profile - Profil czasowy treści
 * @param {string} params.targetLocalDate - Data lokalna (YYYY-MM-DD)
 * @param {string} params.timezone - Strefa czasowa IANA
 * @param {Object} [params.operatorOverride] - Ręczne nadpisanie przez operatora
 * @param {string} [params.fixedTime] - Ścisła godzina dla FIXED_TIME
 * @param {Object} [params.sunsetSource] - Wiarygodne źródło zachodu słońca dla SABBATH
 * @param {Object} [params.aggregatedData] - Dane z Global Observer
 * @returns {{
 *   windowStartLocal: string|null,
 *   windowEndLocal: string|null,
 *   preferredTimeLocal: string|null,
 *   schedulingBasis: import('../cc-content-core/types.js').SchedulingBasis,
 *   evidenceLevel: import('../cc-content-core/types.js').EvidenceLevel,
 *   evidence: Object,
 *   whyThisTime: string,
 *   requiresOperatorReview?: boolean,
 *   sunsetRequired?: boolean
 * }}
 */
export function resolveSchedulingWindow({
    profile = 'EVERGREEN',
    targetLocalDate,
    timezone,
    operatorOverride = null,
    fixedTime = null,
    sunsetSource = null,
    aggregatedData = null
}) {
    const profileDef = CONTENT_TIME_PROFILES[profile] || CONTENT_TIME_PROFILES.EVERGREEN;

    // 1. Sprawdź ręczny Operator Override (Dyrektywy 77, 78)
    if (operatorOverride && operatorOverride.preferredTime) {
        if (!operatorOverride.changedBy || !operatorOverride.reason) {
            throw new Error('OPERATOR_OVERRIDE_ERROR: Wymagane pola changedBy i reason');
        }

        const whyThisTime = [
            `${operatorOverride.preferredTime} ${timezone}`,
            `Basis: OPERATOR_OVERRIDE`,
            `Changed by: ${operatorOverride.changedBy}`,
            `Reason: ${operatorOverride.reason}`,
            `Self-learning: NOT_APPLIED`
        ].join('\n');

        return {
            windowStartLocal: operatorOverride.windowStart || operatorOverride.preferredTime,
            windowEndLocal: operatorOverride.windowEnd || operatorOverride.preferredTime,
            preferredTimeLocal: operatorOverride.preferredTime,
            schedulingBasis: 'OPERATOR_RULE',
            evidenceLevel: 'STRONG',
            evidence: {
                basis: 'OPERATOR_OVERRIDE',
                operator: operatorOverride.changedBy,
                timestamp: operatorOverride.changedAt || new Date().toISOString(),
                reason: operatorOverride.reason
            },
            whyThisTime
        };
    }

    // 2. Obsługa profili specjalnych
    if (profile === 'BREAKING') {
        // Dyrektywa 22: FAZA 6A nie uruchamia autonomicznego trybu breaking news. Zostaw MANUAL.
        return {
            windowStartLocal: null,
            windowEndLocal: null,
            preferredTimeLocal: null,
            schedulingBasis: 'INSUFFICIENT_DATA',
            evidenceLevel: 'INSUFFICIENT',
            evidence: {
                basis: 'MANUAL_REQUIRED',
                limitation: 'Tryb BREAKING w Fazie 6A wymaga wyłącznej dyspozycji manualnej operatora'
            },
            whyThisTime: `Brak automatycznego slotu dla treści BREAKING. Wymagana manualna decyzja operatora.`,
            requiresOperatorReview: true
        };
    }

    if (profile === 'FIXED_TIME') {
        // Dyrektywa 21: Wydarzenie o określonej godzinie nie może zostać przesunięte przez algorytm.
        if (!fixedTime) {
            throw new Error('FIXED_TIME_ERROR: Treść o profilu FIXED_TIME musi posiadać parametr fixedTime');
        }
        return {
            windowStartLocal: fixedTime,
            windowEndLocal: fixedTime,
            preferredTimeLocal: fixedTime,
            schedulingBasis: 'OPERATOR_RULE',
            evidenceLevel: 'STRONG',
            evidence: {
                basis: 'FIXED_TIME_RULE',
                fixedTime,
                immutability: 'Ścisła godzina zablokowana przed modyfikacją algorytmiczną'
            },
            whyThisTime: `${fixedTime} ${timezone}\nBasis: OPERATOR_RULE\nRule: FIXED_TIME_CANNOT_SHIFT\nData optimization: NOT USED`
        };
    }

    if (profile === 'SABBATH') {
        // Dyrektywy 23-26, 76: Sabbath Safe Mode
        // Szabat zależy od zachodu słońca. Brak zweryfikowanego źródła astronomicznego = SUNSET_DATA_REQUIRED.
        if (!sunsetSource || !sunsetSource.sunsetLocalTime || !sunsetSource.verified) {
            return {
                windowStartLocal: null,
                windowEndLocal: null,
                preferredTimeLocal: null,
                schedulingBasis: 'INSUFFICIENT_DATA',
                evidenceLevel: 'INSUFFICIENT',
                evidence: {
                    basis: 'ASTRONOMICAL_SUNSET_REQUIRED',
                    limitation: 'Faza 6A zabrania zgadywania zachodu słońca. Brak zweryfikowanego źródła astronomicznego.'
                },
                whyThisTime: `BLOKADA: Wymagane autoryzowane dane zachodu słońca (SUNSET_DATA_REQUIRED) dla strefy ${timezone}. Szabat nie jest liczony ze stałej godziny zegarowej.`,
                sunsetRequired: true
            };
        }

        // Jeśli posiadamy wiarygodne źródło zachodu słońca (np. operator podał zweryfikowany zachód):
        const sunsetTime = sunsetSource.sunsetLocalTime;
        return {
            windowStartLocal: sunsetTime,
            windowEndLocal: sunsetSource.windowEndLocal || sunsetTime,
            preferredTimeLocal: sunsetTime,
            schedulingBasis: 'FIRST_PARTY_DATA',
            evidenceLevel: 'STRONG',
            evidence: {
                basis: 'VERIFIED_ASTRONOMICAL_SUNSET',
                sunsetTime,
                source: sunsetSource.source || 'OPERATOR_VERIFIED_SUNSET'
            },
            whyThisTime: `${sunsetTime} ${timezone}\nBasis: FIRST_PARTY_DATA\nRule: SABBATH_SUNSET_WINDOW\nSource: ${sunsetSource.source || 'VERIFIED_ASTRONOMICAL'}`
        };
    }

    // 3. Sprawdź, czy istnieją rzeczywiste zagregowane dane Global Observer (Dyrektywy 14-16)
    if (aggregatedData && aggregatedData.sampleSize && aggregatedData.sampleSize >= 100 && aggregatedData.optimalHour) {
        const optH = String(aggregatedData.optimalHour).padStart(2, '0');
        const optTime = `${optH}:00`;
        const startH = String(Math.max(0, aggregatedData.optimalHour - 1)).padStart(2, '0');
        const endH = String(Math.min(23, aggregatedData.optimalHour + 2)).padStart(2, '0');

        return {
            windowStartLocal: `${startH}:00`,
            windowEndLocal: `${endH}:00`,
            preferredTimeLocal: optTime,
            schedulingBasis: aggregatedData.sourceType || 'PLATFORM_DATA',
            evidenceLevel: aggregatedData.sampleSize >= 1000 ? 'STRONG' : 'MODERATE',
            evidence: {
                basis: aggregatedData.sourceType || 'PLATFORM_DATA',
                sampleSize: aggregatedData.sampleSize,
                dataWindow: aggregatedData.dataWindow || '30D',
                sources: aggregatedData.sources || ['GLOBAL_OBSERVER_ROLLUP'],
                limitations: 'Metryka aktywności zagregowanej odbiorców w danej strefie'
            },
            whyThisTime: `${optTime} ${timezone}\nBasis: ${aggregatedData.sourceType || 'PLATFORM_DATA'}\nSample Size: ${aggregatedData.sampleSize}\nData Window: ${aggregatedData.dataWindow || '30D'}\nData optimization: OBSERVER_ROLLUP_APPLIED`
        };
    }

    // 4. Domyślna reguła operatora (Dyrektywy 16, 17: OPERATOR_RULE, ZERO FAKE OPTIMAL TIME)
    const prefTime = profileDef.defaultPreferredTime;
    const startW = profileDef.defaultWindowStart;
    const endW = profileDef.defaultWindowEnd;

    const whyThisTime = [
        `${prefTime} ${timezone}`,
        `Basis: OPERATOR_RULE`,
        `Rule: ${profileDef.ruleName}`,
        `Data optimization: NOT USED (Zero fake AI optimal time)`
    ].join('\n');

    return {
        windowStartLocal: startW,
        windowEndLocal: endW,
        preferredTimeLocal: prefTime,
        schedulingBasis: 'OPERATOR_RULE',
        evidenceLevel: 'MODERATE',
        evidence: {
            basis: 'OPERATOR_RULE',
            ruleName: profileDef.ruleName,
            dataWindow: 'NONE',
            sampleSize: 0,
            sources: ['CC_CANONICAL_OPERATOR_RULES'],
            limitations: 'Wyznaczono na podstawie kanonicznej reguły operatora dla profilu ' + profile
        },
        whyThisTime
    };
}
