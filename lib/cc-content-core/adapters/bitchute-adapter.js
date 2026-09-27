/**
 * ══════════════════════════════════════════════════════════════════════════
 * CC GLOBAL DISTRIBUTION ENGINE — BITCHUTE MANUAL-ASSISTED ADAPTER (FAZA 3A)
 * Standard Architektury: MASTER PLAN CC GLOBAL 2030 (FAZA 3)
 * Dyrektywy 30-32: Tryb MANUAL_ASSISTED. Przygotowanie paczki publikacyjnej
 * dla operatora i bezpieczna weryfikacja wprowadzonego URL / remoteId.
 * ══════════════════════════════════════════════════════════════════════════
 */

import { DistributionAdapter } from './base-adapter.js';

export class BitChuteDistributionAdapter extends DistributionAdapter {
    constructor(options = {}) {
        super('BITCHUTE', '2026.3-bitchute-manual');
        this.packageRegistry = options.packageRegistry || new Map();
        this.confirmedPublications = options.confirmedPublications || new Map();
    }

    async validate(job, manifest) {
        const errors = [];
        if (!manifest.title) errors.push('BITCHUTE_TITLE_REQUIRED: Tytuł wideo jest wymagany');
        if (!manifest.description) errors.push('BITCHUTE_DESC_REQUIRED: Opis jest wymagany');
        return { valid: errors.length === 0, errors };
    }

    /**
     * Pkt 31: Generowanie kompletnej paczki publikacyjnej (Ready to Publish Package)
     */
    async prepare(job, manifest) {
        const publicationPackage = {
            contentId: manifest.contentId,
            variantId: manifest.variantId,
            title: manifest.title,
            description: `${manifest.description}\n\nOficjalny portal misyjny: https://polskieradio.cc\nSubskrybuj kanał Christian Culture.`,
            tags: ['ChristianCulture', 'PolskieRadioCC', 'BibliaAudio', 'Worship', 'KulturaChrzescijanska'],
            language: manifest.variantId?.includes('en') ? 'English' : 'Polish',
            sourceAttribution: 'Christian Culture — Autonomous Mission Distribution Network',
            rightsInformation: manifest.rightsSnapshot?.licenseName || 'Christian Culture Standard',
            suggestedCategory: 'Education / Faith & Religion',
            thumbnailUrl: 'https://polskieradio.cc/cuda_kazgo_dnia_current.webp',
            videoAssetId: manifest.assetIds?.find(id => id.includes('video')) || 'default_render_mp4',
            generatedAt: new Date().toISOString()
        };

        return {
            ready: true,
            preparedPayload: publicationPackage
        };
    }

    /**
     * W trybie MANUAL_ASSISTED publish() rejestruje paczkę i przełącza zadanie w stan MANUAL_ACTION_REQUIRED
     */
    async publish(job, preparedPayload) {
        const packageId = `bitchute_pkg_${job.contentId}_${job.variantId}`;
        this.packageRegistry.set(packageId, preparedPayload);

        return {
            success: true,
            remoteId: packageId,
            state: 'MANUAL_ACTION_REQUIRED',
            note: 'Pkt 31: Przygotowano paczkę do ręcznej publikacji na BitChute. Oczekiwanie na operatora.'
        };
    }

    /**
     * Pkt 32: Potwierdzenie ręcznej publikacji przez operatora
     * @param {string} packageId
     * @param {string} remoteIdOrUrl - Wprowadzony przez operatora identyfikator lub pełny adres URL
     */
    confirmManualPublication(packageId, remoteIdOrUrl) {
        let remoteId = remoteIdOrUrl;
        let publicUrl = remoteIdOrUrl;

        if (remoteIdOrUrl.includes('bitchute.com/video/')) {
            const parts = remoteIdOrUrl.split('/video/')[1].replace('/', '');
            remoteId = parts;
            publicUrl = `https://www.bitchute.com/video/${remoteId}/`;
        } else if (!remoteIdOrUrl.startsWith('http')) {
            publicUrl = `https://www.bitchute.com/video/${remoteId}/`;
        }

        const confirmedRecord = {
            packageId,
            remoteId,
            publicUrl,
            confirmedAt: new Date().toISOString(),
            status: 'PUBLISHED'
        };

        this.confirmedPublications.set(remoteId, confirmedRecord);
        return confirmedRecord;
    }

    /**
     * Pkt 32: Weryfikacja URL / RemoteId
     */
    async verify(remoteId, publicUrl) {
        const record = this.confirmedPublications.get(remoteId);
        if (!record) {
            return {
                verified: false,
                status: 'UNVERIFIED',
                error: `Brak zarejestrowanego potwierdzenia operatora dla ${remoteId}`
            };
        }

        const validFormat = remoteId.length >= 6 && !remoteId.includes(' ');
        if (!validFormat) {
            return {
                verified: false,
                status: 'INVALID_FORMAT',
                error: 'Identyfikator wideo BitChute ma niepoprawny format'
            };
        }

        return {
            verified: true,
            status: 'CONFIRMED_BY_OPERATOR',
            remoteMetadata: {
                remoteId: record.remoteId,
                publicUrl: record.publicUrl,
                confirmedAt: record.confirmedAt
            }
        };
    }

    async getStatus(remoteId) {
        const record = this.confirmedPublications.get(remoteId);
        return {
            processingStatus: record ? 'succeeded' : 'ready',
            details: record || null
        };
    }

    async retry(job, manifest) {
        const { preparedPayload } = await this.prepare(job, manifest);
        return this.publish(job, preparedPayload);
    }

    async cancel(jobId, remoteId) {
        if (remoteId && this.packageRegistry.has(remoteId)) {
            this.packageRegistry.delete(remoteId);
        }
        return { cancelled: true, reason: 'Paczka BitChute wycofana' };
    }
}
