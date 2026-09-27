/**
 * ══════════════════════════════════════════════════════════════════════════
 * CC GLOBAL DISTRIBUTION ENGINE — FACEBOOK ADAPTER INTERFACE (FAZA 3A)
 * Standard Architektury: MASTER PLAN CC GLOBAL 2030 (FAZA 3)
 * Dyrektywy 33 i 78: Status DISABLED. Brak stabilnego oficjalnego API.
 * Zakaz opierania nowego silnika dystrybucji o podatne sesje Puppeteer/cookies.
 * ══════════════════════════════════════════════════════════════════════════
 */

import { DistributionAdapter } from './base-adapter.js';

export class FacebookDistributionAdapter extends DistributionAdapter {
    constructor() {
        super('FACEBOOK', '2026.3-facebook-stub');
    }

    async validate(job, manifest) {
        return {
            valid: false,
            errors: ['FACEBOOK_ADAPTER_DISABLED: Automatyczna publikacja Facebook jest wyłączona (brak autoryzowanego oficjalnego Graph API).']
        };
    }

    async prepare(job, manifest) {
        return { ready: false, preparedPayload: null };
    }

    async publish(job, preparedPayload) {
        return {
            success: false,
            state: 'FAILED',
            error: 'FACEBOOK_DISABLED: Adapter wyłączony ze względów bezpieczeństwa (Pkt 33/78)'
        };
    }

    async verify(remoteId, publicUrl) {
        return { verified: false, status: 'DISABLED' };
    }

    async getStatus(remoteId) {
        return { processingStatus: 'failed' };
    }

    async retry(job, manifest) {
        return { success: false, state: 'FAILED' };
    }

    async cancel(jobId, remoteId) {
        return { cancelled: true };
    }
}
