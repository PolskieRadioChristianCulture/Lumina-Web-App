/**
 * ══════════════════════════════════════════════════════════════════════════
 * CC GLOBAL OBSERVER — FACEBOOK DISABLED OBSERVER (FAZA 4)
 * Standard Architektury: MASTER PLAN CC GLOBAL 2030 (FAZA 4)
 * Dyrektywa 29: Stan DISABLED -> NOT_CONNECTED. Zero wywołań Puppeteera.
 * ══════════════════════════════════════════════════════════════════════════
 */

import { BaseObserver } from './base-observer.js';

export class FacebookObserver extends BaseObserver {
    constructor() {
        super('FACEBOOK', '2026.4-facebook-disabled');
    }

    async observePublication() {
        return {
            platform: 'FACEBOOK',
            status: 'NOT_CONNECTED',
            verificationLevel: 'UNKNOWN',
            rawObservation: null,
            metrics: {},
            notAvailableMetrics: ['all', 'ALL_METRICS'],
            error: 'NOT_CONNECTED: Adapter Facebook został trwale wyłączony (bezpieczeństwo ekosystemu)'
        };
    }

    async observePlatformHealth() {
        return { status: 'PAUSED', latencyMs: 0, error: 'NOT_CONNECTED' };
    }

    normalize() {
        return { events: [], snapshots: [], notAvailableMetrics: ['ALL_METRICS'] };
    }
}
