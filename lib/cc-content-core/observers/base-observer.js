/**
 * ══════════════════════════════════════════════════════════════════════════
 * CC GLOBAL OBSERVER — BASE OBSERVER CONTRACT (FAZA 4)
 * Standard Architektury: MASTER PLAN CC GLOBAL 2030 (FAZA 4)
 * Dyrektywa 4, 68: Kontrakt Obserwatora. Ściśle READ-ONLY.
 * ══════════════════════════════════════════════════════════════════════════
 */

export class BaseObserver {
    /**
     * @param {import('../types.js').PlatformType} platform
     * @param {string} version
     * @param {'LIVE' | 'NEAR_REALTIME' | 'PERIODIC' | 'STALE' | 'UNKNOWN'} [observationMode='PERIODIC']
     */
    constructor(platform, version, observationMode = 'PERIODIC') {
        if (!platform) throw new Error('BaseObserver wymaga podania platformy');
        this.platform = platform;
        this.version = version;
        this.observationMode = observationMode;
    }

    /**
     * Pobiera stan i metryki dla pojedynczej publikacji
     * @param {Object} publication - Obiekt publikacji z cc_content/{id}/publications
     * @param {Object} [context]
     * @returns {Promise<{
     *   rawObservation: any,
     *   status: 'SUCCESS' | 'PARTIAL' | 'NOT_AVAILABLE' | 'ERROR',
     *   error?: string
     * }>}
     */
    async observePublication(publication, context = {}) {
        throw new Error(`observePublication nie zostało zaimplementowane dla ${this.platform}`);
    }

    /**
     * Pobiera stan ogólny kanału platformy
     * @param {string} channelId
     * @param {Object} [context]
     */
    async observeChannel(channelId, context = {}) {
        throw new Error(`observeChannel nie zostało zaimplementowane dla ${this.platform}`);
    }

    /**
     * Pobiera stan zdrowia platformy (Dyrektywa 48)
     * @returns {Promise<{ status: import('../types.js').HealthStatus, latencyMs: number, error?: string }>}
     */
    async observePlatformHealth() {
        return { status: 'HEALTHY', latencyMs: 10 };
    }

    /**
     * Normalizacja danych surowych do kanonicznego modelu analitycznego (Dyrektywa 69)
     * @param {any} rawData
     * @param {Object} context
     * @returns {{ events: Array<import('../types.js').CCAnalyticsEvent>, snapshots: Array<import('../types.js').CCAnalyticsSnapshot> }}
     */
    normalize(rawData, context = {}) {
        throw new Error(`normalize nie zostało zaimplementowane dla ${this.platform}`);
    }

    // ─────────────────────────────────────────────────────────────
    // PANCERNA ZASADA DYREKTYWY 4 I BRAMKI 4.5 (Pkt 12): OBSERVATION ≠ DISTRIBUTION
    // Obserwator posiada bezwzględny zakaz publikowania i sterowania!
    // ─────────────────────────────────────────────────────────────
    publish() {
        throw new Error(`OBSERVER_SECURITY_VIOLATION: Observer dla ${this.platform} jest wyłącznie READ-ONLY. Wywołanie publish() jest zakazane!`);
    }

    deletePublication() {
        throw new Error(`OBSERVER_SECURITY_VIOLATION: Observer dla ${this.platform} jest wyłącznie READ-ONLY. Wywołanie deletePublication() jest zakazane!`);
    }

    cancelDistribution() {
        throw new Error(`OBSERVER_SECURITY_VIOLATION: Observer dla ${this.platform} nie może usuwać ani anulować zadań dystrybucji.`);
    }

    cancel() {
        throw new Error(`OBSERVER_SECURITY_VIOLATION: Observer dla ${this.platform} nie może usuwać ani anulować zadań.`);
    }

    reschedule() {
        throw new Error(`OBSERVER_SECURITY_VIOLATION: Observer dla ${this.platform} nie może zmieniać harmonogramu emisji.`);
    }

    changeVisibility() {
        throw new Error(`OBSERVER_SECURITY_VIOLATION: Observer dla ${this.platform} nie może zmieniać widoczności publikacji.`);
    }
}
