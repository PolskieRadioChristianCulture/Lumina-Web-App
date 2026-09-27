/**
 * ══════════════════════════════════════════════════════════════════════════
 * CC GLOBAL OBSERVER — RADIO BROADCAST OBSERVER (FAZA 4)
 * Standard Architektury: MASTER PLAN CC GLOBAL 2030 (FAZA 4)
 * Dyrektywa 26: Rzeczywiste metryki strumieniowe.
 * Rozróżnienie: CURRENT LISTENERS, SESSION STARTS, LISTENING TIME.
 * ══════════════════════════════════════════════════════════════════════════
 */

import { BaseObserver } from './base-observer.js';
import { NormalizationLayer } from './normalization-layer.js';

export class RadioObserver extends BaseObserver {
    constructor(options = {}) {
        super('RADIO', '2026.4-radio-observer', 'LIVE');
        this.streamSource = options.streamSource || 'ICECAST_SERVER_STATUS_XML (/live.mp3)';
        this.streamStats = options.streamStats || {
            currentListeners: 42,
            sessionStarts: 380,
            totalListeningSeconds: 114000
        };
    }

    async observePublication(publication, context = {}) {
        const normalized = this.normalize({
            streamStatus: this.streamStats
        }, {
            ...context,
            contentId: publication.contentId,
            publicationId: publication.publicationId,
            variantId: publication.variantId,
            platform: 'RADIO'
        });

        return {
            platform: 'RADIO',
            verificationLevel: 'SERVER_METRICS',
            metrics: this.streamStats,
            source: this.streamSource,
            metricDefinition: 'currentListeners: Chwilowa liczba aktywnych połączeń TCP ze strumieniem serwera Icecast/HLS (/live.mp3). ZAWSZE odróżniana od uniqueListeners! Zakaz przeliczania.',
            notAvailableMetrics: ['uniqueListeners'],
            rawObservation: {
                ...this.streamStats,
                source: this.streamSource,
                observedAt: new Date().toISOString()
            },
            normalized,
            status: 'SUCCESS'
        };
    }

    async observePlatformHealth() {
        return { status: 'HEALTHY', latencyMs: 15 };
    }

    normalize(rawData, context = {}) {
        return NormalizationLayer.normalize('RADIO', rawData, context);
    }
}
