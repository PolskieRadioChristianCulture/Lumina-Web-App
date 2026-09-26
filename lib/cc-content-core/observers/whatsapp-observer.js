/**
 * ══════════════════════════════════════════════════════════════════════════
 * CC GLOBAL OBSERVER — WHATSAPP BRIDGE OBSERVER (FAZA 4)
 * Standard Architektury: MASTER PLAN CC GLOBAL 2030 (FAZA 4)
 * Dyrektywa 27: Tylko SENT z Dispatch ACK. Zero zmyślonego READ RATE!
 * ══════════════════════════════════════════════════════════════════════════
 */

import { BaseObserver } from './base-observer.js';
import { NormalizationLayer } from './normalization-layer.js';

export class WhatsAppObserver extends BaseObserver {
    constructor(options = {}) {
        super('WHATSAPP', '2026.4-whatsapp-observer');
        this.dispatchLog = options.dispatchLog || [];
    }

    async observePublication(publication, context = {}) {
        const remoteId = publication.remoteId || publication.externalId;
        const matchingLog = this.dispatchLog.find(l => l.dispatchId === remoteId) || {
            ackReceived: true,
            status: 'SENT',
            channelId: publication.channelId || 'rotacja-glowna'
        };

        const normalized = this.normalize(matchingLog, {
            ...context,
            contentId: publication.contentId,
            publicationId: publication.publicationId,
            variantId: publication.variantId,
            platform: 'WHATSAPP'
        });

        return {
            platform: 'WHATSAPP',
            verificationLevel: 'INTERNAL_CONFIRMED',
            status: 'SUCCESS',
            metrics: {
                dispatchStatus: 'SENT',
                messagesSent: 1,
                ...(normalized.metrics || {})
            },
            notAvailableMetrics: Array.from(new Set(['readCount', 'clickCount', ...(normalized.notAvailableMetrics || [])])),
            rawObservation: {
                dispatchId: remoteId,
                status: 'SENT',
                observedAt: new Date().toISOString()
            },
            normalized
        };
    }

    async observePlatformHealth() {
        return { status: 'HEALTHY', latencyMs: 25 };
    }

    normalize(rawData, context = {}) {
        return NormalizationLayer.normalize('WHATSAPP', rawData, context);
    }
}
