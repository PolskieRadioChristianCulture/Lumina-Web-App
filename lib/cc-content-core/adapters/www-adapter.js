/**
 * ══════════════════════════════════════════════════════════════════════════
 * CC GLOBAL DISTRIBUTION ENGINE — WWW ECOSYSTEM ADAPTER (FAZA 3A)
 * Standard Architektury: MASTER PLAN CC GLOBAL 2030 (FAZA 3)
 * Dyrektywy 25-26: Publikacja w ekosystemie polskieradio.cc (w 3A tryb PREVIEW)
 * ══════════════════════════════════════════════════════════════════════════
 */

import { DistributionAdapter } from './base-adapter.js';

export class WwwDistributionAdapter extends DistributionAdapter {
    constructor(options = {}) {
        super('WWW', '2026.3-web-preview');
        this.previewStore = options.previewStore || new Map();
        this.isLiveMode = options.isLiveMode || false; // W 3A domyślnie false (PREVIEW ONLY)
    }

    async validate(job, manifest) {
        const errors = [];
        if (!manifest.title) errors.push('WWW_TITLE_REQUIRED: Tytuł artykułu/rozważania jest wymagany');
        if (!manifest.description) errors.push('WWW_CONTENT_REQUIRED: Treść jest wymagana');
        return { valid: errors.length === 0, errors };
    }

    async prepare(job, manifest) {
        const slug = `${manifest.contentId.toLowerCase()}-${manifest.variantId}`;
        const payload = {
            slug,
            contentId: manifest.contentId,
            variantId: manifest.variantId,
            title: manifest.title,
            content: manifest.description,
            mode: this.isLiveMode ? 'LIVE' : 'PREVIEW',
            preparedAt: new Date().toISOString()
        };
        return { ready: true, preparedPayload: payload };
    }

    async publish(job, preparedPayload) {
        const slug = preparedPayload.slug;
        this.previewStore.set(slug, preparedPayload);

        const url = this.isLiveMode 
            ? `https://polskieradio.cc/artykuly/${slug}`
            : `https://polskieradio.cc/preview?contentId=${job.contentId}&variantId=${job.variantId}`;

        return {
            success: true,
            remoteId: slug,
            publicUrl: url,
            state: this.isLiveMode ? 'PUBLISHED' : 'READY',
            note: this.isLiveMode ? 'Opublikowano na polskieradio.cc' : 'Faza 3A: Przygotowano podgląd PREVIEW (brak publicznego nadpisu)'
        };
    }

    async verify(remoteId, publicUrl) {
        const item = this.previewStore.get(remoteId);
        if (!item) {
            return { verified: false, status: 'NOT_FOUND', error: `Wpis WWW ${remoteId} nie istnieje` };
        }
        return {
            verified: true,
            status: item.mode,
            remoteMetadata: { slug: item.slug, title: item.title, mode: item.mode }
        };
    }

    async getStatus(remoteId) {
        const item = this.previewStore.get(remoteId);
        return { processingStatus: item ? 'succeeded' : 'failed' };
    }

    async retry(job, manifest) {
        const { preparedPayload } = await this.prepare(job, manifest);
        return this.publish(job, preparedPayload);
    }

    async cancel(jobId, remoteId) {
        if (remoteId && this.previewStore.has(remoteId)) {
            this.previewStore.delete(remoteId);
            return { cancelled: true, reason: `Wpis ${remoteId} usunięty z WWW preview` };
        }
        return { cancelled: true };
    }
}
