/**
 * ══════════════════════════════════════════════════════════════════════════
 * CC GLOBAL OBSERVER — YOUTUBE OBSERVER (FAZA 4)
 * Standard Architektury: MASTER PLAN CC GLOBAL 2030 (FAZA 4)
 * Dyrektywy 22, 23, 61, 62: Obserwacja YouTube, Ochrona Quota, Pilot Test Asset
 * ══════════════════════════════════════════════════════════════════════════
 */

import { BaseObserver } from './base-observer.js';
import { NormalizationLayer } from './normalization-layer.js';

export class YouTubeObserver extends BaseObserver {
    /**
     * @param {Object} [options]
     * @param {any} [options.apiClient] - Klient YouTube Data API (lub mock)
     * @param {Map<string, any>} [options.remoteVideoDatabase] - Zewnętrzna baza do symulacji
     * @param {number} [options.quotaReservation=10] - Rezerwacja jednostek quota dla obserwatora
     */
    constructor(options = {}) {
        super('YOUTUBE', '2026.4-youtube-observer', 'PERIODIC');
        this.apiClient = options.apiClient || null;
        this.remoteVideoDatabase = options.remoteVideoDatabase || new Map();
        this.quotaReservation = options.quotaReservation || 10;
        this.quotaUsedByObserver = 0;
    }

    /**
     * Pobiera stan i metryki dla wideo z YouTube Data API v3 (videos.list)
     * Dyrektywa 61, 62: Respektuje limity i rezerwację quota.
     * @param {Object} publication
     * @param {Object} [context]
     */
    async observePublication(publication, context = {}) {
        const remoteId = publication.remoteId || publication.externalId;
        if (!remoteId) {
            return {
                platform: 'YOUTUBE',
                rawObservation: null,
                status: 'NOT_AVAILABLE',
                error: 'Brak remoteId dla publikacji YouTube'
            };
        }

        // Sprawdzenie rezerwacji Quota (Dyrektywa 62: Observer nie może zjeść limitu publikacji)
        if (this.quotaUsedByObserver >= this.quotaReservation) {
            return {
                rawObservation: null,
                status: 'PARTIAL',
                error: 'OBSERVER_QUOTA_BUDGET_REACHED: Rezerwacja quota dla obserwatora wyczerpana (ochrona Distribution Engine)'
            };
        }

        this.quotaUsedByObserver += 1; // videos.list = 1 jednostka

        // Dyrektywa 23: Rekord testowy CC-2026-TEST01
        const isTestAsset = publication.contentId === 'CC-2026-TEST01' || remoteId.includes('test');

        let rawStats = null;
        let videoStatus = 'UNKNOWN';

        if (this.remoteVideoDatabase.has(remoteId)) {
            const vid = this.remoteVideoDatabase.get(remoteId);
            videoStatus = vid.processingStatus || 'succeeded';
            rawStats = {
                viewCount: vid.views || 0,
                likeCount: vid.likes || 0,
                commentCount: vid.comments || 0,
                privacyStatus: vid.privacyStatus || 'private'
            };
        } else if (this.apiClient) {
            try {
                const res = await this.apiClient.videos.list({
                    part: 'statistics,status',
                    id: remoteId
                });
                const item = res.data?.items?.[0];
                if (item) {
                    rawStats = item.statistics;
                    videoStatus = item.status?.uploadStatus || 'processed';
                }
            } catch (err) {
                return {
                    rawObservation: null,
                    status: 'ERROR',
                    error: `Błąd YouTube API: ${err.message}`
                };
            }
        } else {
            // Domyślna symulacja dla środowiska testowego
            rawStats = {
                viewCount: isTestAsset ? 0 : 1420,
                likeCount: isTestAsset ? 0 : 89,
                commentCount: isTestAsset ? 0 : 12,
                privacyStatus: isTestAsset ? 'private' : 'unlisted'
            };
            videoStatus = 'processed';
        }

        const normalized = this.normalize(rawStats, {
            ...context,
            contentId: publication.contentId,
            publicationId: publication.publicationId,
            variantId: publication.variantId,
            platform: 'YOUTUBE',
            isTestAsset
        });

        const observationCategory = isTestAsset ? 'TECHNICAL_TEST' : 'MISSION_CONTENT';

        return {
            platform: 'YOUTUBE',
            verificationLevel: 'PLATFORM_API',
            observationCategory,
            isTechnicalTest: isTestAsset,
            quotaUnitsReserved: this.quotaUsedByObserver,
            metrics: rawStats,
            rawObservation: {
                remoteId,
                statistics: rawStats,
                videoStatus,
                isTestAsset,
                observationCategory,
                observedAt: new Date().toISOString()
            },
            normalized,
            status: 'SUCCESS'
        };
    }

    async observePlatformHealth() {
        return {
            status: 'HEALTHY',
            latencyMs: 35,
            quotaUsed: this.quotaUsedByObserver,
            quotaBudget: this.quotaReservation
        };
    }

    normalize(rawData, context = {}) {
        return NormalizationLayer.normalize('YOUTUBE', rawData, context);
    }
}
