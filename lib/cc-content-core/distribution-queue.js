/**
 * ══════════════════════════════════════════════════════════════════════════
 * CC GLOBAL DISTRIBUTION ENGINE — QUEUE & RETRY ENGINE (FAZA 3A)
 * Standard Architektury: MASTER PLAN CC GLOBAL 2030 (FAZA 3)
 * Dyrektywy 9, 40-45, 71-72: Idempotencja, Kolejka, Retry, Dead Letter, Circuit Breaker
 * ══════════════════════════════════════════════════════════════════════════
 */

import crypto from 'crypto';
import { isDistributionAllowed, setKillSwitchState } from './distribution-registry.js';
import { getAdapterForPlatform } from './adapters/index.js';
import { getPublicationManifest } from './publication-manifest.js';

/**
 * Generuje klucz idempotencji (Pkt 9)
 * @param {string} contentId
 * @param {string} variantId
 * @param {string} platform
 * @param {string} channelId
 * @param {string} [publicationIntent='standard']
 * @returns {string}
 */
export function generateIdempotencyKey(contentId, variantId, platform, channelId, publicationIntent = 'standard') {
    const raw = `${contentId}:${variantId}:${platform}:${channelId || 'default'}:${publicationIntent}`;
    return crypto.createHash('sha256').update(raw).digest('hex');
}

/**
 * Klasyfikacja błędów na ponawialne (retryable) i nieponawialne (non-retryable)
 * @param {string|Error} error
 * @returns {boolean}
 */
export function isRetryableError(error) {
    const msg = String(error?.message || error || '').toLowerCase();
    if (msg.includes('429') || msg.includes('rate limit') || msg.includes('quota') || 
        msg.includes('timeout') || msg.includes('timed out') || msg.includes('econnreset') ||
        msg.includes('500') || msg.includes('502') || msg.includes('503') || msg.includes('504')) {
        return true;
    }
    // Błędy praw, uprawnień, formatu, naruszenia reguł są NIEPRAWIDŁOWE do retry
    return false;
}

export class DistributionQueue {
    constructor(options = {}) {
        this.jobs = new Map(); // jobId -> Job
        this.idempotencyIndex = new Map(); // idempotencyKey -> jobId
        this.circuitBreakers = new Map(); // platform -> { failureCount: number, state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' }
        this.deadLetterQueue = [];
        this.consecutiveFailureThreshold = options.consecutiveFailureThreshold || 3;
    }

    /**
     * Rejestruje nowe zadanie dystrybucji z pancerną idempotencją (Pkt 9, 71)
     * @param {Object} params
     * @returns {import('./types.js').DistributionJob}
     */
    enqueueJob(params) {
        const { planId, contentId, variantId, platform, channelId, manifestId, scheduledAt, maxAttempts = 3, publicationIntent } = params;
        
        const idempotencyKey = generateIdempotencyKey(contentId, variantId, platform, channelId, publicationIntent);

        // Pkt 71: Test duplikatu — ponowne uruchomienie zwraca istniejący rekord
        if (this.idempotencyIndex.has(idempotencyKey)) {
            const existingJobId = this.idempotencyIndex.get(idempotencyKey);
            const existingJob = this.jobs.get(existingJobId);
            return existingJob;
        }

        const jobId = `dist_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
        
        /** @type {import('./types.js').DistributionJob} */
        const job = {
            jobId,
            planId: planId || 'direct_plan',
            contentId,
            variantId,
            platform,
            channelId: channelId || 'default',
            adapterVersion: '2026.3',
            status: 'QUEUED',
            attempt: 0,
            maxAttempts,
            idempotencyKey,
            manifestId,
            scheduledAt: scheduledAt || new Date().toISOString(),
            startedAt: null,
            completedAt: null,
            remoteId: null,
            publicUrl: null,
            processingStatus: null,
            errorCode: null,
            errorMessage: null,
            retryable: false,
            stateHistory: [{ timestamp: new Date().toISOString(), state: 'QUEUED', note: 'Zadanie utworzone w kolejce' }]
        };

        this.jobs.set(jobId, job);
        this.idempotencyIndex.set(idempotencyKey, jobId);
        return job;
    }

    /**
     * Wykonuje zadanie dystrybucji za pośrednictwem dedykowanego adaptera
     * Zgodnie z Pkt 44, 45: Sprawdza Kill Switch oraz Circuit Breaker przed wysłaniem requestu.
     * @param {string} jobId
     * @param {Object} [options]
     * @returns {Promise<import('./types.js').DistributionJob>}
     */
    async processJob(jobId, options = {}) {
        const job = this.jobs.get(jobId);
        if (!job) throw new Error(`Nie odnaleziono zadania ${jobId}`);

        // 1. Sprawdzenie Kill Switch (Pkt 45)
        const killCheck = isDistributionAllowed(job.platform, job.channelId, options.isAutomation ?? true);
        if (!killCheck.allowed) {
            job.status = 'CANCELLED';
            job.errorCode = 'KILL_SWITCH_ACTIVE';
            job.errorMessage = killCheck.reason;
            job.stateHistory.push({ timestamp: new Date().toISOString(), state: 'CANCELLED', note: killCheck.reason });
            return job;
        }

        // 2. Sprawdzenie Circuit Breaker (Pkt 44)
        const cb = this.getCircuitBreaker(job.platform);
        if (cb.state === 'OPEN') {
            job.status = 'CANCELLED';
            job.errorCode = 'CIRCUIT_BREAKER_OPEN';
            job.errorMessage = `Circuit Breaker otwarty dla platformy ${job.platform} (seryjne błędy)`;
            job.stateHistory.push({ timestamp: new Date().toISOString(), state: 'CANCELLED', note: job.errorMessage });
            return job;
        }

        job.status = 'PROCESSING';
        job.startedAt = new Date().toISOString();
        job.attempt += 1;
        job.stateHistory.push({ timestamp: new Date().toISOString(), state: 'PROCESSING', note: `Próba ${job.attempt}/${job.maxAttempts}` });

        const manifest = getPublicationManifest(job.manifestId);
        if (!manifest) {
            job.status = 'FAILED';
            job.errorCode = 'MANIFEST_NOT_FOUND';
            job.errorMessage = `Brak manifestu ${job.manifestId}`;
            return job;
        }

        const adapter = options.adapter || getAdapterForPlatform(job.platform, options);

        try {
            // A. Walidacja techniczna adaptera
            const val = await adapter.validate(job, manifest);
            if (!val.valid) {
                job.status = 'FAILED';
                job.errorCode = 'ADAPTER_VALIDATION_FAILED';
                job.errorMessage = (val.errors || []).join('; ');
                job.retryable = false;
                this.recordFailure(job.platform);
                return job;
            }

            // B. Przygotowanie payloadu
            const prep = await adapter.prepare(job, manifest);
            if (!prep.ready) {
                job.status = 'FAILED';
                job.errorCode = 'PREPARATION_FAILED';
                job.retryable = false;
                return job;
            }

            // C. Publikacja
            const pubResult = await adapter.publish(job, prep.preparedPayload);
            if (!pubResult.success) {
                return this.handleJobFailure(job, pubResult.error || 'Błąd publikacji');
            }

            // Sukces wstępny (np. UPLOADED, PUBLISHED, READY)
            job.remoteId = pubResult.remoteId || null;
            job.publicUrl = pubResult.publicUrl || null;
            job.status = pubResult.state;
            job.stateHistory.push({
                timestamp: new Date().toISOString(),
                state: job.status,
                note: pubResult.note || `Wykonano publish() z remoteId: ${job.remoteId}`
            });

            // Reset Circuit Breaker po sukcesie
            this.recordSuccess(job.platform);

            // D. Jeśli platforma obsługuje natychmiastową weryfikację zdalną, wykonaj verify() (Pkt 11)
            if (job.status === 'PUBLISHED' && job.remoteId) {
                const verResult = await adapter.verify(job.remoteId, job.publicUrl);
                if (verResult.verified) {
                    job.status = 'VERIFIED';
                    job.completedAt = new Date().toISOString();
                    job.stateHistory.push({ timestamp: new Date().toISOString(), state: 'VERIFIED', note: 'Zdalne potwierdzenie zweryfikowane pomyślnie' });
                }
            }

            return job;
        } catch (err) {
            return this.handleJobFailure(job, err.message || String(err));
        }
    }

    /**
     * Obsługa niepowodzenia zadania z logiką Retry & Dead Letter (Pkt 41, 42)
     */
    handleJobFailure(job, errorMessage) {
        job.errorMessage = errorMessage;
        job.retryable = isRetryableError(errorMessage);
        this.recordFailure(job.platform);

        if (job.retryable && job.attempt < job.maxAttempts) {
            // Ponowienie (Exponential backoff)
            const backoffSeconds = Math.pow(2, job.attempt);
            job.status = 'READY';
            job.stateHistory.push({
                timestamp: new Date().toISOString(),
                state: 'READY',
                note: `Błąd ponawialny. Kolejna próba za ${backoffSeconds}s: ${errorMessage}`
            });
        } else {
            // Wyczerpanie prób -> DEAD LETTER QUEUE (Pkt 42)
            job.status = 'FAILED';
            job.completedAt = new Date().toISOString();
            job.stateHistory.push({
                timestamp: new Date().toISOString(),
                state: 'FAILED',
                note: `Zadanie przekazane do Dead Letter Queue: ${errorMessage}`
            });
            this.deadLetterQueue.push({
                jobId: job.jobId,
                failedAt: new Date().toISOString(),
                reason: errorMessage,
                attempts: job.attempt
            });
        }
        return job;
    }

    getCircuitBreaker(platform) {
        if (!this.circuitBreakers.has(platform)) {
            this.circuitBreakers.set(platform, { failureCount: 0, state: 'CLOSED' });
        }
        return this.circuitBreakers.get(platform);
    }

    recordFailure(platform) {
        const cb = this.getCircuitBreaker(platform);
        cb.failureCount += 1;
        if (cb.failureCount >= this.consecutiveFailureThreshold) {
            cb.state = 'OPEN';
        }
    }

    recordSuccess(platform) {
        const cb = this.getCircuitBreaker(platform);
        cb.failureCount = 0;
        cb.state = 'CLOSED';
    }

    getJob(jobId) {
        return this.jobs.get(jobId) || null;
    }

    getAllJobs() {
        return Array.from(this.jobs.values());
    }

    getDeadLetterJobs() {
        return [...this.deadLetterQueue];
    }
}
