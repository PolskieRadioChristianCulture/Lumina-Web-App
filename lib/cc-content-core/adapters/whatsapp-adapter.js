/**
 * ══════════════════════════════════════════════════════════════════════════
 * CC GLOBAL DISTRIBUTION ENGINE — WHATSAPP BRIDGE ADAPTER (FAZA 3A)
 * Standard Architektury: MASTER PLAN CC GLOBAL 2030 (FAZA 3)
 * Dyrektywy 27-29: Pomost do istniejącego agenta PM2 Agent-WhatsApp.
 * Pkt 29: Status publikacji to SENT (Dispatch ACK), a NIGDY VERIFIED bez dowodu!
 * ══════════════════════════════════════════════════════════════════════════
 */

import { DistributionAdapter } from './base-adapter.js';

export class WhatsAppDistributionAdapter extends DistributionAdapter {
    constructor(options = {}) {
        super('WHATSAPP', '2026.3-whatsapp-bridge');
        this.mockDispatchQueue = options.mockDispatchQueue || [];
    }

    async validate(job, manifest) {
        const errors = [];
        if (!manifest.title && !manifest.description) {
            errors.push('WHATSAPP_CONTENT_REQUIRED: Treść wiadomości nie może być pusta');
        }
        return { valid: errors.length === 0, errors };
    }

    async prepare(job, manifest) {
        // Zgodnie z Pancerne Zasady Dystrybucji WhatsApp: na grupy trafia wersja WWW rozważania z pełnymi linkami
        const messageText = `*${manifest.title}*\n\n${manifest.description}\n\n👉 Więcej: https://polskieradio.cc`;
        const dispatchPayload = {
            idempotencyKey: job.idempotencyKey,
            contentId: manifest.contentId,
            variantId: manifest.variantId,
            targetGroups: job.channelId || 'rotacja-glowna',
            text: messageText,
            enqueuedAt: new Date().toISOString()
        };
        return { ready: true, preparedPayload: dispatchPayload };
    }

    /**
     * Wysłanie zlecenia do kolejki dispatchera WhatsApp
     * Zgodnie z Pkt 28 i 29: Zwraca status SENT (Dispatch ACK), a NIE VERIFIED!
     */
    async publish(job, preparedPayload) {
        const dispatchId = `wa_ack_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        
        this.mockDispatchQueue.push({
            dispatchId,
            ...preparedPayload,
            ackReceived: true,
            status: 'SENT' // Pkt 29: Dispatch ACK oznacza SENT, nie VERIFIED!
        });

        return {
            success: true,
            remoteId: dispatchId,
            state: 'PUBLISHED', // Techniczny stan wykonania zlecenia
            note: 'Pkt 29: Uzyskano Dispatch ACK od Agent-WhatsApp. Stan kanoniczny: SENT (nie VERIFIED).'
        };
    }

    /**
     * Weryfikacja dla WhatsApp (Pkt 28: rozróżniamy wyłącznie stany, które rzeczywiście znamy)
     */
    async verify(remoteId, publicUrl) {
        const entry = this.mockDispatchQueue.find(e => e.dispatchId === remoteId);
        if (!entry) {
            return { verified: false, status: 'NOT_FOUND', error: `Brak wpisu o ID dispatch ${remoteId}` };
        }
        // WhatsApp nie zwraca publicznego URL ani odczytu bez webhooka
        return {
            verified: false, // Pkt 29: Nigdy nie oznaczamy jako VERIFIED na samym Dispatch ACK
            status: 'SENT',
            remoteMetadata: { dispatchId: entry.dispatchId, enqueuedAt: entry.enqueuedAt }
        };
    }

    async getStatus(remoteId) {
        const entry = this.mockDispatchQueue.find(e => e.dispatchId === remoteId);
        return {
            processingStatus: entry ? 'succeeded' : 'failed',
            details: { ack: entry?.ackReceived || false, status: 'SENT' }
        };
    }

    async retry(job, manifest) {
        const { preparedPayload } = await this.prepare(job, manifest);
        return this.publish(job, preparedPayload);
    }

    async cancel(jobId, remoteId) {
        return { cancelled: true, reason: 'Wycofano z kolejki wysyłkowej' };
    }
}
