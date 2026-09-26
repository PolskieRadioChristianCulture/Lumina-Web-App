/**
 * ══════════════════════════════════════════════════════════════════════════
 * CC GLOBAL OBSERVER & MISSION INTELLIGENCE — ANALYTICS CORE (FAZA 4)
 * Standard Architektury: MASTER PLAN CC GLOBAL 2030 (FAZA 4)
 * Dyrektywy 3, 6-18, 30-37: Model zdarzeń, Migawki, Delta Engine, Deduplikacja,
 * Agregacje (Rollups), Zero Fake Metrics, Mission Funnel, Language Intelligence
 * ══════════════════════════════════════════════════════════════════════════
 */

import crypto from 'crypto';

/**
 * Zbiór dozwolonych typów metryk w CC Global
 * @type {Set<string>}
 */
export const ALLOWED_METRIC_TYPES = new Set([
    'VIEW',
    'IMPRESSION',
    'PLAY',
    'LISTEN',
    'WATCH_TIME',
    'COMPLETION',
    'REACTION',
    'COMMENT',
    'SHARE',
    'CLICK',
    'RETURN',
    'CC_ID_REGISTRATION',
    'LUMINA_JOIN',
    'BIBLE_OPEN',
    'DEVOTIONAL_OPEN',
    'RADIO_LISTEN'
]);

/**
 * Zbiór dozwolonych poziomów weryfikacji metryki (Dyrektywa 10)
 * @type {Set<string>}
 */
export const ALLOWED_VERIFICATION_LEVELS = new Set([
    'PLATFORM_API',
    'FIRST_PARTY',
    'INTERNAL_CONFIRMED',
    'OPERATOR_CONFIRMED',
    'ESTIMATED',
    'UNKNOWN'
]);

/**
 * Tworzy kanoniczne zdarzenie analityczne (CC Analytics Event - Dyrektywa 6)
 * @param {Partial<import('./types.js').CCAnalyticsEvent>} params
 * @returns {import('./types.js').CCAnalyticsEvent}
 */
export function createAnalyticsEvent(params) {
    if (!params.contentId) {
        throw new Error('ANALYTICS_EVENT_VALIDATION: contentId jest wymagany');
    }
    if (!params.metricType || !ALLOWED_METRIC_TYPES.has(params.metricType)) {
        throw new Error(`ANALYTICS_EVENT_VALIDATION: Nieobsługiwany lub brakujący metricType: ${params.metricType}`);
    }
    if (params.metricValue === undefined || params.metricValue === null || isNaN(params.metricValue)) {
        throw new Error('ANALYTICS_EVENT_VALIDATION: metricValue musi być poprawną wartością liczbową (brak fałszywych zer)');
    }

    // Dyrektywa 18 i 20: Privacy First & Minimal Data Guard
    let metadata = undefined;
    if (params.metadata && typeof params.metadata === 'object') {
        metadata = { ...params.metadata };
        delete metadata.userEmail;
        delete metadata.userName;
        delete metadata.userPhone;
        delete metadata.ipAddress;
        delete metadata.email;
        delete metadata.phone;
        delete metadata.userFullName;
        delete metadata.privateMessage;
        delete metadata.exactGps;
    }

    const eventId = params.eventId || `evt_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const sourceTimestamp = params.sourceTimestamp || params.occurredAt || new Date().toISOString();
    const observedAt = params.observedAt || new Date().toISOString();
    const source = params.source || 'INTERNAL_EVENT';
    const publicationId = params.publicationId || 'direct';

    // Dyrektywa 14: Stabilny klucz deduplikacyjny
    const deduplicationKey = params.deduplicationKey || crypto.createHash('sha256')
        .update(`${params.contentId}:${publicationId}:${params.metricType}:${sourceTimestamp}:${source}`)
        .digest('hex');

    return {
        eventId,
        contentId: params.contentId,
        variantId: params.variantId || null,
        publicationId: params.publicationId || null,
        platform: params.platform || 'WWW',
        channelId: params.channelId || 'default',
        language: params.language || 'pl',
        locale: params.locale || 'pl-PL',
        metricType: params.metricType,
        metricValue: Number(params.metricValue),
        metricUnit: params.metricUnit || 'COUNT',
        metadata,
        observedAt,
        sourceTimestamp,
        source,
        verificationLevel: params.verificationLevel || 'FIRST_PARTY',
        region: params.region || null,
        schemaVersion: 1,
        deduplicationKey
    };
}

/**
 * Tworzy migawkę analityczną dla metryk skumulowanych (CC Analytics Snapshot - Dyrektywa 12)
 * @param {Partial<import('./types.js').CCAnalyticsSnapshot>} params
 * @returns {import('./types.js').CCAnalyticsSnapshot}
 */
export function createAnalyticsSnapshot(params) {
    if (!params.contentId) {
        throw new Error('ANALYTICS_SNAPSHOT_VALIDATION: contentId jest wymagany');
    }
    const metricType = params.metricType || 'VIEW';
    if (!ALLOWED_METRIC_TYPES.has(metricType)) {
        throw new Error(`ANALYTICS_SNAPSHOT_VALIDATION: Nieprawidłowy metricType: ${metricType}`);
    }

    let cumulativeValue = params.cumulativeValue;
    if (cumulativeValue === undefined && params.cumulativeMetrics) {
        cumulativeValue = params.cumulativeMetrics.views ?? Object.values(params.cumulativeMetrics)[0];
    }
    if (cumulativeValue === undefined || cumulativeValue === null || isNaN(cumulativeValue)) {
        throw new Error('ANALYTICS_SNAPSHOT_VALIDATION: cumulativeValue musi być poprawną liczbą');
    }

    const snapshotId = params.snapshotId || `snp_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const observedAt = params.observedAt || new Date().toISOString();
    const publicationId = params.publicationId || 'direct';
    const timeWindow = (params.windowStart && params.windowEnd) 
        ? `${params.windowStart}_${params.windowEnd}` 
        : observedAt.substring(0, 13);

    const deduplicationKey = params.deduplicationKey || crypto.createHash('sha256')
        .update(`${params.contentId}:${publicationId}:${metricType}:${timeWindow}`)
        .digest('hex');

    return {
        snapshotId,
        contentId: params.contentId,
        variantId: params.variantId || null,
        publicationId: params.publicationId || null,
        platform: params.platform || 'YOUTUBE',
        channelId: params.channelId || 'default',
        language: params.language || 'pl',
        metricType,
        cumulativeValue: Number(cumulativeValue),
        cumulativeMetrics: params.cumulativeMetrics || { [metricType]: Number(cumulativeValue) },
        deltaFromPrevious: params.deltaFromPrevious ?? null,
        deltaClassification: params.deltaClassification || null,
        observedAt,
        windowStart: params.windowStart || null,
        windowEnd: params.windowEnd || null,
        source: params.source || 'PLATFORM_API',
        verificationLevel: params.verificationLevel || 'PLATFORM_API',
        deduplicationKey
    };
}

/**
 * Delta Engine: Bezpieczne obliczanie przyrostu pomiędzy dwoma migawkami (Dyrektywa 13, 83)
 * Obsługuje korekty platformowe, cofnięcie licznika i błędy ujemne.
 * @param {import('./types.js').CCAnalyticsSnapshot} snapA
 * @param {import('./types.js').CCAnalyticsSnapshot|null} [snapB]
 * @returns {any}
 */
export function calculateSnapshotDelta(snapA, snapB) {
    if (!snapB) {
        const val = snapA.cumulativeValue ?? (snapA.cumulativeMetrics?.views || 0);
        return {
            delta: val,
            classification: 'STANDARD',
            type: 'STANDARD',
            isCorrection: false,
            views: { delta: val, type: 'STANDARD', isNegativeCorrection: false }
        };
    }

    let prev = snapA;
    let curr = snapB;

    const prevVal = prev.cumulativeValue ?? (prev.cumulativeMetrics?.views || 0);
    const currVal = curr.cumulativeValue ?? (curr.cumulativeMetrics?.views || 0);
    const diff = currVal - prevVal;

    let classification = 'STANDARD';
    let isCorrection = false;

    // Wykrycie resetu licznika (np. z 1000 do 2)
    if (prevVal > 100 && currVal < 10) {
        classification = 'COUNTER_RESET';
        isCorrection = true;
    } else if (diff < 0) {
        // Dyrektywa 83: Ujemna delta to korekta platformowa (SOURCE_CORRECTION)
        classification = 'SOURCE_CORRECTION';
        isCorrection = true;
    }

    return {
        delta: diff,
        classification,
        type: classification,
        isCorrection,
        views: {
            delta: diff,
            type: classification,
            isNegativeCorrection: diff < 0
        }
    };
}

/**
 * Agregacja Analityczna (Rollup Engine - Dyrektywa 17, 87)
 * Buduje zagregowany rekord zoptymalizowany pod kątem odczytu w Mission Control.
 */
export function generateRollup(arg1, arg2 = [], arg3 = [], dimensionValue, period = 'DAILY', periodStart, periodEnd) {
    let contentId = 'CC-2026-000001';
    let events = [];
    let snapshots = [];
    let dimensionType = 'CONTENT';

    if (typeof arg1 === 'string') {
        contentId = arg1;
        events = Array.isArray(arg2) ? arg2 : [];
        snapshots = Array.isArray(arg3) ? arg3 : [];
    } else if (Array.isArray(arg1)) {
        events = arg1;
        snapshots = Array.isArray(arg2) ? arg2 : [];
        dimensionType = typeof arg3 === 'string' ? arg3 : 'CONTENT';
        dimensionValue = dimensionValue || 'ALL';
    }

    const metrics = {};
    for (const mt of ALLOWED_METRIC_TYPES) {
        metrics[mt] = 0;
    }

    const byPlatform = {};
    const byLanguage = {};
    const byRegion = {};

    for (const e of events) {
        const mt = e.metricType;
        const val = Number(e.metricValue) || 1;
        if (mt) {
            metrics[mt] = (metrics[mt] || 0) + val;
            if (e.platform) {
                if (!byPlatform[e.platform]) byPlatform[e.platform] = {};
                byPlatform[e.platform][mt] = (byPlatform[e.platform][mt] || 0) + val;
            }
            if (e.language) {
                if (!byLanguage[e.language]) byLanguage[e.language] = {};
                byLanguage[e.language][mt] = (byLanguage[e.language][mt] || 0) + val;
            }
            if (e.region) {
                if (!byRegion[e.region]) byRegion[e.region] = {};
                byRegion[e.region][mt] = (byRegion[e.region][mt] || 0) + val;
            }
        }
    }

    return {
        rollupId: `rlp_${contentId}_${Date.now()}`,
        contentId,
        dimensionType,
        dimensionValue: dimensionValue || contentId,
        metrics,
        byPlatform,
        byLanguage,
        byRegion,
        eventCount: events.length,
        generatedAt: new Date().toISOString()
    };
}

/**
 * Oblicza Globalny Zasięg z poszanowaniem Dyrektywy 31 i 32:
 * NIGDY nie sumuje bezrefleksyjnie odmiennych metryk.
 */
export function calculateGlobalReach(data = []) {
    let videoViews = 0;
    let audioStarts = 0;
    let articleOpens = 0;
    let socialInteractions = 0;

    for (const item of data) {
        if ('metrics' in item) {
            videoViews += (item.metrics.VIEW || 0) + (item.metrics.PLAY || 0);
            audioStarts += (item.metrics.LISTEN || 0) + (item.metrics.RADIO_LISTEN || 0);
            articleOpens += (item.metrics.DEVOTIONAL_OPEN || 0) + (item.metrics.BIBLE_OPEN || 0);
            socialInteractions += (item.metrics.REACTION || 0) + (item.metrics.COMMENT || 0) + (item.metrics.SHARE || 0);
        } else {
            switch (item.metricType) {
                case 'VIEW':
                case 'PLAY':
                    videoViews += item.metricValue;
                    break;
                case 'LISTEN':
                case 'RADIO_LISTEN':
                    audioStarts += item.metricValue;
                    break;
                case 'DEVOTIONAL_OPEN':
                case 'BIBLE_OPEN':
                    articleOpens += item.metricValue;
                    break;
                case 'REACTION':
                case 'COMMENT':
                case 'SHARE':
                    socialInteractions += item.metricValue;
                    break;
                default:
                    break;
            }
        }
    }

    return {
        videoViews,
        audioStarts,
        articleOpens,
        socialInteractions,
        totalKnownInteractions: videoViews + audioStarts + articleOpens + socialInteractions,
        compositionNotes: [
            'Wideo: Odtworzenia YouTube i wideo CC',
            'Audio: Sesje radiowe i odtworzenia słuchowisk',
            'Tekst/Artykuły: Otwarcia rozważań i Pisma Świętego',
            'Interakcje: Komentarze, reakcje i udostępnienia'
        ]
    };
}

/**
 * Lejek Misyjny (Mission Funnel Engine - Dyrektywy 33, 34, 35)
 * Zbudowany wyłącznie z obserwowalnych zdarzeń produktowych.
 * Zero bezpodstawnych deklaracji religijnych.
 */
export function buildMissionFunnel(events = []) {
    let reachCount = 0;
    let engagedCount = 0;
    let returnedCount = 0;
    let ccIdCount = 0;
    let luminaJoinCount = 0;
    let bibleDevotionalCount = 0;
    let ongoingRelationshipCount = 0;

    for (const evt of events) {
        switch (evt.metricType) {
            case 'IMPRESSION':
            case 'VIEW':
            case 'PLAY':
            case 'LISTEN':
            case 'RADIO_LISTEN':
                reachCount += (evt.metricValue || 1);
                break;
            case 'REACTION':
            case 'COMMENT':
            case 'SHARE':
            case 'WATCH_TIME':
                engagedCount += (evt.metricValue || 1);
                break;
            case 'RETURN':
                returnedCount += (evt.metricValue || 1);
                break;
            case 'CC_ID_REGISTRATION':
                ccIdCount += (evt.metricValue || 1);
                break;
            case 'LUMINA_JOIN':
                luminaJoinCount += (evt.metricValue || 1);
                break;
            case 'BIBLE_OPEN':
            case 'DEVOTIONAL_OPEN':
                bibleDevotionalCount += (evt.metricValue || 1);
                break;
            case 'CLICK':
                ongoingRelationshipCount += (evt.metricValue || 1);
                break;
            default:
                break;
        }
    }

    const stages = {
        CONTENT_REACHED: { stage: 'CONTENT_REACHED', label: 'Zasięg Emisji (Treść dotarła)', value: reachCount, count: reachCount },
        CONTENT_ENGAGED: { stage: 'CONTENT_ENGAGED', label: 'Zaangażowanie (Odbiorca zareagował)', value: engagedCount, count: engagedCount },
        RETURNED: { stage: 'RETURNED', label: 'Powrót (Ponowna wizyta)', value: returnedCount, count: returnedCount },
        CC_ID_CREATED: { stage: 'CC_ID_CREATED', label: 'Tożsamość CC ID (Rejestracja profilu)', value: ccIdCount, count: ccIdCount },
        JOINED_LUMINA: { stage: 'JOINED_LUMINA', label: 'Społeczność (Dołączenie do LUMINA)', value: luminaJoinCount, count: luminaJoinCount },
        OPENED_BIBLE_DEVOTIONAL: { stage: 'OPENED_BIBLE_DEVOTIONAL', label: 'Pismo & Rozważanie (Głębia Słowa)', value: bibleDevotionalCount, count: bibleDevotionalCount },
        ONGOING_RELATIONSHIP: { stage: 'ONGOING_RELATIONSHIP', label: 'Trwała Relacja (Aktywność ciągła)', value: ongoingRelationshipCount, count: ongoingRelationshipCount }
    };

    return {
        stages,
        stageList: Object.values(stages),
        calculatedAt: new Date().toISOString(),
        doctrineNote: 'Wskaźniki oparte wyłącznie na obserwowalnych zdarzeniach produktowych. Zero subiektywnych deklaracji teologicznych (Pkt 34/35).'
    };
}

/**
 * Inteligencja Językowa (Language Intelligence - Dyrektywy 36, 37)
 * Porównuje języki PL, EN, ES, PT-BR.
 * Zgodnie z Dyrektywą 37: Wymaga minimum próby danych (minThreshold).
 */
export function compareLanguages(input = {}, minThreshold = 100) {
    const supportedLangs = ['pl', 'en', 'es', 'pt-BR'];
    const languages = {};

    let eventsByLang = {};
    if (Array.isArray(input)) {
        for (const e of input) {
            const l = (e.language || 'pl').toLowerCase();
            const targetLang = (l === 'pt-br' || l === 'pt_br') ? 'pt-BR' : l;
            if (!eventsByLang[targetLang]) eventsByLang[targetLang] = [];
            eventsByLang[targetLang].push(e);
        }
    } else if (input && typeof input === 'object') {
        eventsByLang = input;
    }

    for (const lang of supportedLangs) {
        const langEvents = eventsByLang[lang] || eventsByLang[lang.toLowerCase()] || [];
        const count = langEvents.length;
        const isSufficient = count >= minThreshold;

        let totalInteractions = 0;
        for (const e of langEvents) {
            totalInteractions += (e.metricValue || 1);
        }

        languages[lang] = {
            language: lang,
            sampleSize: count,
            totalInteractions,
            thresholdRequired: minThreshold,
            isStatisticallySufficient: isSufficient,
            sampleStatus: isSufficient ? 'SUFFICIENT' : 'INSUFFICIENT_DATA',
            message: isSufficient 
                ? 'Próbka wystarczająca do analizy porównawczej.' 
                : `Zbyt mała próbka danych (${count}/${minThreshold}) do rankingu i rekomendacji rozwoju.`
        };
    }

    return {
        languages,
        supportedLanguages: supportedLangs,
        evaluatedAt: new Date().toISOString()
    };
}

