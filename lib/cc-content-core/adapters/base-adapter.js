/**
 * ══════════════════════════════════════════════════════════════════════════
 * CC GLOBAL DISTRIBUTION ENGINE — BASE ADAPTER CONTRACT (FAZA 3)
 * Standard Architektury: MASTER PLAN CC GLOBAL 2030 (FAZA 3)
 * ══════════════════════════════════════════════════════════════════════════
 */

/**
 * Bazowy interfejs adaptera dystrybucji (Wspólny kontrakt Pkt 4)
 * Żadna logika specyficzna dla danej platformy nie może wyciekać do Core.
 */
export class DistributionAdapter {
    /**
     * @param {import('../types.js').PlatformType} platform
     * @param {string} version
     */
    constructor(platform, version) {
        if (this.constructor === DistributionAdapter) {
            throw new Error('DistributionAdapter jest klasą abstrakcyjną');
        }
        this.platform = platform;
        this.version = version;
    }

    /**
     * Walidacja wymagań technicznych przed próbą publikacji
     * @param {import('../types.js').DistributionJob} job
     * @param {import('../types.js').PublicationManifest} manifest
     * @returns {Promise<{ valid: boolean, errors?: string[] }>}
     */
    async validate(job, manifest) {
        throw new Error(`Adapter ${this.platform} nie zaimplementował metody validate()`);
    }

    /**
     * Przygotowanie paczki danych / payloadu dla platformy docelowej
     * @param {import('../types.js').DistributionJob} job
     * @param {import('../types.js').PublicationManifest} manifest
     * @returns {Promise<{ preparedPayload: any, ready: boolean }>}
     */
    async prepare(job, manifest) {
        throw new Error(`Adapter ${this.platform} nie zaimplementował metody prepare()`);
    }

    /**
     * Wykonanie publikacji na platformie
     * Zgodnie z Pkt 11: publish() != VERIFIED. Zwraca wstępny stan (np. UPLOADED lub PUBLISHED).
     * @param {import('../types.js').DistributionJob} job
     * @param {any} preparedPayload
     * @returns {Promise<{ success: boolean, remoteId?: string, publicUrl?: string, state: import('../types.js').DistributionJobState, error?: string, rawResponse?: any }>}
     */
    async publish(job, preparedPayload) {
        throw new Error(`Adapter ${this.platform} nie zaimplementował metody publish()`);
    }

    /**
     * Niezależna zdalna weryfikacja istnienia i stanu publikacji (Pkt 11)
     * Dopiero niezależny dowód platformy pozwala przejść do stanu VERIFIED.
     * @param {string} remoteId
     * @param {string} [publicUrl]
     * @returns {Promise<{ verified: boolean, status: string, remoteMetadata?: any, error?: string }>}
     */
    async verify(remoteId, publicUrl) {
        throw new Error(`Adapter ${this.platform} nie zaimplementował metody verify()`);
    }

    /**
     * Pobranie bieżącego stanu przetwarzania po stronie platformy (np. YouTube processing)
     * @param {string} remoteId
     * @returns {Promise<{ processingStatus: 'processing' | 'succeeded' | 'failed' | 'ready', details?: any }>}
     */
    async getStatus(remoteId) {
        throw new Error(`Adapter ${this.platform} nie zaimplementował metody getStatus()`);
    }

    /**
     * Ponowienie próby z zachowaniem idempotencji
     * @param {import('../types.js').DistributionJob} job
     * @param {import('../types.js').PublicationManifest} manifest
     * @returns {Promise<{ success: boolean, state: import('../types.js').DistributionJobState, remoteId?: string }>}
     */
    async retry(job, manifest) {
        throw new Error(`Adapter ${this.platform} nie zaimplementował metody retry()`);
    }

    /**
     * Anulowanie zadania w toku lub wycofanie ze zdalnej platformy
     * @param {string} jobId
     * @param {string} [remoteId]
     * @returns {Promise<{ cancelled: boolean, reason?: string }>}
     */
    async cancel(jobId, remoteId) {
        throw new Error(`Adapter ${this.platform} nie zaimplementował metody cancel()`);
    }
}
