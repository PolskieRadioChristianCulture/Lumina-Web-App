/**
 * ══════════════════════════════════════════════════════════════════════════
 * CC GLOBAL DISTRIBUTION ENGINE — RADIO BROADCAST ADAPTER (FAZA 3A)
 * Standard Architektury: MASTER PLAN CC GLOBAL 2030 (FAZA 3)
 * Dyrektywa 34: Tryb PREPARE ONLY. Nie zmienia aktywnej ramówki.
 * Przygotowuje audioAsset, title, language, duration, category, priority, rights.
 * ══════════════════════════════════════════════════════════════════════════
 */

import { DistributionAdapter } from './base-adapter.js';

export class RadioDistributionAdapter extends DistributionAdapter {
    constructor(options = {}) {
        super('RADIO', '2026.3-radio-prepare');
        this.preparedBroadcasts = options.preparedBroadcasts || new Map();
    }

    async validate(job, manifest) {
        const errors = [];
        if (!manifest.title) errors.push('RADIO_TITLE_REQUIRED: Tytuł audycji jest wymagany');
        
        // Pkt 3: Weryfikacja praw do emisji radiowej
        if (manifest.rightsSnapshot && manifest.rightsSnapshot.audioAllowed === false) {
            errors.push('RADIO_AUDIO_RIGHTS_DENIED: Brak praw do publicznej emisji radiowej');
        }

        return { valid: errors.length === 0, errors };
    }

    /**
     * Pkt 34: Przygotowanie pakietu emisyjnego do ramówki
     */
    async prepare(job, manifest) {
        const audioAssetId = manifest.assetIds?.find(id => id.includes('audio')) || 'pilot_tts_audio_pl';
        
        const broadcastPackage = {
            audioAsset: audioAssetId,
            title: manifest.title,
            language: manifest.variantId?.includes('en') ? 'en' : 'pl',
            duration: 180, // Estymowany czas w sekundach (~3 minuty)
            radioCategory: 'SLOWO_BOZE_ROZWAZANIE',
            priority: 1, // Wysoki priorytet
            rights: manifest.rightsSnapshot?.licenseName || 'Christian Culture Broadcast Standard',
            rdsText: `${manifest.title.substring(0, 60)} | PolskieRadio.cc`,
            scheduledSlot: job.scheduledAt || null,
            preparedAt: new Date().toISOString()
        };

        return { ready: true, preparedPayload: broadcastPackage };
    }

    /**
     * W fazie 3A: PREPARE ONLY. Zapisuje pakiet w buforze ramówki bez aktywacji nadajnika.
     */
    async publish(job, preparedPayload) {
        const broadcastId = `radio_slot_${job.contentId}_${job.variantId}`;
        this.preparedBroadcasts.set(broadcastId, preparedPayload);

        return {
            success: true,
            remoteId: broadcastId,
            state: 'READY', // Pkt 34: PREPARE ONLY = stan READY w buforze ramówki
            note: 'Pkt 34: Przygotowano pakiet radiowy w buforze ramówki (PREPARE ONLY, aktywna ramówka nienaruszona).'
        };
    }

    async verify(remoteId, publicUrl) {
        const item = this.preparedBroadcasts.get(remoteId);
        if (!item) {
            return { verified: false, status: 'NOT_FOUND', error: `Pakiet radiowy ${remoteId} nie istnieje` };
        }
        return {
            verified: true,
            status: 'PREPARED_IN_BUFFER',
            remoteMetadata: { broadcastId: remoteId, title: item.title, duration: item.duration }
        };
    }

    async getStatus(remoteId) {
        const item = this.preparedBroadcasts.get(remoteId);
        return { processingStatus: item ? 'succeeded' : 'failed' };
    }

    async retry(job, manifest) {
        const { preparedPayload } = await this.prepare(job, manifest);
        return this.publish(job, preparedPayload);
    }

    async cancel(jobId, remoteId) {
        if (remoteId && this.preparedBroadcasts.has(remoteId)) {
            this.preparedBroadcasts.delete(remoteId);
        }
        return { cancelled: true, reason: 'Wycofano z bufora radiowego' };
    }
}
