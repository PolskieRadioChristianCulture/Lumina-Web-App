/**
 * ══════════════════════════════════════════════════════════════════════════
 * CC GLOBAL OBSERVER — ORCHESTRATOR & AGGREGATOR (FAZA 4)
 * Standard Architektury: MASTER PLAN CC GLOBAL 2030 (FAZA 4)
 * Dyrektywy 59-74, 87: Zadania Obserwatora, Cache, Deduplikacja, Izolacja Błędów,
 * Częściowa Obserwowalność (Partial Observability), Eksport Zagregowany
 * ══════════════════════════════════════════════════════════════════════════
 */

import crypto from 'crypto';
import { getObserverForPlatform } from './observers/index.js';
import { calculateSnapshotDelta, generateRollup, calculateGlobalReach, buildMissionFunnel, compareLanguages } from './analytics-core.js';
import { reportIncident, getAllComponentsHealth, calculateFreshness } from './incident-registry.js';

export class ObserverOrchestrator {
    /**
     * @param {Object} [options]
     * @param {any} [options.db] - Instancja Firestore
     * @param {Map<string, any>} [options.eventsStore]
     * @param {Map<string, any>} [options.snapshotsStore]
     */
    constructor(options = {}) {
        this.db = options.db || null;
        this.eventsStore = options.eventsStore || new Map(); // deduplicationKey -> CCAnalyticsEvent
        this.snapshotsStore = options.snapshotsStore || new Map(); // deduplicationKey -> CCAnalyticsSnapshot
        this.rollupsStore = new Map(); // rollupId -> CCAnalyticsRollup
        this.jobs = new Map(); // observerJobId -> ObserverJobRecord
        this.customObservers = new Map(); // platform -> Observer
        this.lastObservedAt = null;
    }

    registerObserver(platform, observer) {
        this.customObservers.set(platform, observer);
    }

    getObserver(platform) {
        return this.customObservers.get(platform) || getObserverForPlatform(platform);
    }

    /**
     * Rejestruje zdarzenie analityczne z deduplikacją (Dyrektywa 10)
     * @param {import('./types.js').CCAnalyticsEvent} evt
     * @returns {{ status: 'INGESTED' | 'DUPLICATE_IGNORED', deduplicationKey: string, eventId?: string }}
     */
    ingestEvent(evt) {
        if (!evt || !evt.deduplicationKey) {
            throw new Error('INGEST_ERROR: Zdarzenie musi posiadać deduplicationKey');
        }
        if (this.eventsStore.has(evt.deduplicationKey)) {
            return { status: 'DUPLICATE_IGNORED', deduplicationKey: evt.deduplicationKey };
        }
        this.eventsStore.set(evt.deduplicationKey, evt);
        return { status: 'INGESTED', deduplicationKey: evt.deduplicationKey, eventId: evt.eventId };
    }

    /**
     * Uruchamia cykl obserwacji dla listy publikacji (Dyrektywa 59)
     * Dyrektywa 71: Awaria jednego źródła nie zatrzymuje pozostałych.
     * Dyrektywa 72: Raportuje stan częściowej obserwowalności (np. "3/5 sources current").
     * @param {Array<Object>} publications
     * @param {Object} [options]
     */
    async runObservationJob(arg1 = [], arg2 = {}) {
        let publications = [];
        let options = {};
        if (Array.isArray(arg1)) {
            publications = arg1;
            options = arg2 || {};
        } else if (arg1 && typeof arg1 === 'object') {
            publications = arg1.publications || [];
            options = arg1;
        }

        const jobId = `obs_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
        const startedAt = new Date().toISOString();

        /** @type {import('./types.js').ObserverJobRecord} */
        const job = {
            observerJobId: jobId,
            source: 'CC_GLOBAL_OBSERVER',
            scope: options.scope || 'ALL_PUBLICATIONS',
            startedAt,
            completedAt: null,
            status: 'RUNNING',
            recordsRead: 0,
            recordsWritten: 0,
            error: null
        };
        this.jobs.set(jobId, job);

        let successfulSources = 0;
        let failedSources = 0;
        const sourceStatus = {};
        const failures = [];

        for (const pub of publications) {
            job.recordsRead++;
            const platform = pub.platform;
            const observer = this.getObserver(platform);

            try {
                if (!observer) {
                    throw new Error(`Brak obserwatora dla platformy ${platform}`);
                }
                const obsResult = await observer.observePublication(pub, options);
                
                if (obsResult.status === 'SUCCESS' && obsResult.normalized) {
                    successfulSources++;
                    sourceStatus[platform] = 'HEALTHY';

                    // 1. Zapis zdarzeń atomowych z deduplikacją (Dyrektywa 14, 70, 82)
                    for (const evt of obsResult.normalized.events || []) {
                        if (!this.eventsStore.has(evt.deduplicationKey)) {
                            this.eventsStore.set(evt.deduplicationKey, evt);
                            job.recordsWritten++;
                        }
                    }

                    // 2. Zapis migawek z obliczeniem delty przez Delta Engine (Dyrektywa 12, 13, 83)
                    for (const snap of obsResult.normalized.snapshots || []) {
                        const prevSnapshot = this.findPreviousSnapshot(snap.publicationId, snap.metricType);
                        const deltaInfo = calculateSnapshotDelta(snap, prevSnapshot);

                        snap.deltaFromPrevious = deltaInfo.delta;
                        snap.deltaClassification = deltaInfo.classification;

                        if (!this.snapshotsStore.has(snap.deduplicationKey)) {
                            this.snapshotsStore.set(snap.deduplicationKey, snap);
                            job.recordsWritten++;
                        }
                    }
                } else if (obsResult.status === 'NOT_AVAILABLE' || obsResult.status === 'NOT_CONNECTED') {
                    successfulSources++;
                    sourceStatus[platform] = obsResult.status;
                } else {
                    failedSources++;
                    sourceStatus[platform] = 'DEGRADED';
                    failures.push({ platform, error: obsResult.error || 'DEGRADED' });
                }
            } catch (err) {
                // Dyrektywa 71: Izolacja błędów
                failedSources++;
                sourceStatus[platform] = 'ERROR';
                failures.push({ platform, error: err.message });
                reportIncident({
                    component: `${platform} Adapter`,
                    severity: 'WARNING',
                    errorCode: 'OBSERVER_FETCH_FAILED',
                    summary: `Błąd obserwatora dla platformy ${platform}: ${err.message}`,
                    relatedJobIds: [jobId]
                });
            }
        }

        this.lastObservedAt = new Date().toISOString();
        job.completedAt = this.lastObservedAt;
        
        let overallStatus = 'SUCCESS';
        if (failedSources === 0 && successfulSources > 0) {
            overallStatus = 'SUCCESS';
            job.status = 'COMPLETED';
        } else if (successfulSources > 0 && failedSources > 0) {
            overallStatus = 'PARTIAL_SUCCESS';
            job.status = 'PARTIAL';
        } else if (successfulSources === 0 && failedSources > 0) {
            overallStatus = 'FAILED';
            job.status = 'FAILED';
        } else {
            overallStatus = 'EMPTY';
            job.status = 'COMPLETED';
        }

        const totalSources = successfulSources + failedSources;
        const observabilityRatio = `${successfulSources}/${totalSources} sources current`;

        return {
            status: overallStatus,
            job,
            sourceStatus,
            successfulCount: successfulSources,
            failedCount: failedSources,
            observabilityRatio,
            failures,
            summary: `${successfulSources}/${totalSources} źródeł zaktualizowanych poprawnie`,
            freshness: calculateFreshness(this.lastObservedAt)
        };
    }

    /**
     * Wyszukuje poprzednią migawkę dla danej publikacji i typu metryki
     * @param {string} publicationId
     * @param {string} metricType
     */
    findPreviousSnapshot(publicationId, metricType) {
        if (!publicationId) return null;
        const matching = Array.from(this.snapshotsStore.values())
            .filter(s => s.publicationId === publicationId && s.metricType === metricType)
            .sort((a, b) => new Date(b.observedAt).getTime() - new Date(a.observedAt).getTime());

        return matching[0] || null;
    }

    /**
     * Buduje i zwraca zagregowane Rollupy
     * @param {'CONTENT' | 'LANGUAGE' | 'PLATFORM'} dimensionType
     * @param {string} dimensionValue
     * @param {'DAILY' | 'HOURLY'} period
     */
    getRollup(dimensionType, dimensionValue, period = 'DAILY') {
        const events = Array.from(this.eventsStore.values()).filter(e => {
            if (dimensionType === 'CONTENT') return e.contentId === dimensionValue;
            if (dimensionType === 'LANGUAGE') return e.language === dimensionValue;
            if (dimensionType === 'PLATFORM') return e.platform === dimensionValue;
            return false;
        });

        const snapshots = Array.from(this.snapshotsStore.values()).filter(s => {
            if (dimensionType === 'CONTENT') return s.contentId === dimensionValue;
            if (dimensionType === 'LANGUAGE') return s.language === dimensionValue;
            if (dimensionType === 'PLATFORM') return s.platform === dimensionValue;
            return false;
        });

        const now = new Date();
        const start = new Date(now.getTime() - 24 * 3600 * 1000).toISOString();
        const end = now.toISOString();

        return generateRollup(events, snapshots, dimensionType, dimensionValue, period, start, end);
    }

    /**
     * Zwraca całościowy stan ekosystemu dla Mission Control (Dyrektywa 40)
     */
    getGlobalOverview() {
        const allEvents = Array.from(this.eventsStore.values());
        const allSnapshots = Array.from(this.snapshotsStore.values());
        const reach = calculateGlobalReach(allEvents);
        const funnel = buildMissionFunnel(allEvents);
        const health = getAllComponentsHealth();

        // Grupowanie zdarzeń według języka dla inteligencji językowej
        const byLang = { pl: [], en: [], es: [], 'pt-BR': [] };
        for (const e of allEvents) {
            if (byLang[e.language]) byLang[e.language].push(e);
        }
        const languageIntelligence = compareLanguages(byLang, 3);

        return {
            systemHealth: health,
            reach,
            funnel,
            languageIntelligence,
            lastObservedAt: this.lastObservedAt,
            freshness: calculateFreshness(this.lastObservedAt),
            activeEventsCount: allEvents.length,
            activeSnapshotsCount: allSnapshots.length,
            jobsCount: this.jobs.size
        };
    }

    /**
     * Eksport danych bez PII (Dyrektywa 66)
     * @param {'JSON' | 'CSV'} [format='JSON']
     */
    exportAggregatedData(format = 'JSON') {
        const allEvents = Array.from(this.eventsStore.values()).map(e => ({
            contentId: e.contentId,
            variantId: e.variantId || '',
            platform: e.platform,
            metricType: e.metricType,
            metricValue: e.metricValue,
            language: e.language || 'pl',
            verificationLevel: e.verificationLevel || 'FIRST_PARTY',
            observedAt: e.observedAt
        }));

        if (format === 'JSON') {
            return JSON.stringify(allEvents, null, 2);
        }

        // CSV export
        const headers = ['contentId', 'variantId', 'platform', 'metricType', 'metricValue', 'language', 'verificationLevel', 'observedAt'];
        const rows = allEvents.map(e => headers.map(h => e[h]).join(','));
        return [headers.join(','), ...rows].join('\n');
    }
}
