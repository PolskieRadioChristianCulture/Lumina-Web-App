/**
 * ══════════════════════════════════════════════════════════════════════════
 * CC GLOBAL DISTRIBUTION ENGINE — QUEUE, RETRY & PERSISTENCE ENGINE (FAZA 3A/P0)
 * Standard Architektury: MASTER PLAN CC GLOBAL 2030 (FAZA 3) / ZERO-QA JOMA-D005
 * Dyrektywy: Idempotencja, Trwała Kolejka, Crash Recovery, Retry z Backoff,
 * Dead Letter Queue, Circuit Breaker, Harmonogram (Scheduling)
 * ══════════════════════════════════════════════════════════════════════════
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { isDistributionAllowed, setKillSwitchState } from './distribution-registry.js';
import { getAdapterForPlatform } from './adapters/index.js';
import { getPublicationManifest } from './publication-manifest.js';

/**
 * Generuje deterministyczny klucz idempotencji (Pkt 9, 71)
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
    // Błędy praw autorskich, uprawnień, formatu czy zablokowanego adaptera nie są ponawialne
    return false;
}

export class DistributionQueue {
    /**
     * @param {Object} [options]
     * @param {string} [options.persistencePath] - Ścieżka do trwałego pliku JSON z kolejką zadań
     * @param {number} [options.consecutiveFailureThreshold=3] - Próg otwarcia Circuit Breaker
     */
    constructor(options = {}) {
        this.jobs = new Map(); // jobId -> Job
        this.idempotencyIndex = new Map(); // idempotencyKey -> jobId
        this.circuitBreakers = new Map(); // platform -> { failureCount: number, state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' }
        this.deadLetterQueue = [];
        this.consecutiveFailureThreshold = options.consecutiveFailureThreshold || 3;
        this.customAdapters = new Map();
        this.persistencePath = options.persistencePath || null;
        this.schedulerInterval = null;

        // Inicjalizacja trwałego magazynu (jeśli podano ścieżkę)
        if (this.persistencePath) {
            this.loadState();
            this.recoverCrashedJobs();
        }
    }

    /**
     * Ładuje stan kolejki z trwałego pliku JSON (odporność na restart procesu)
     */
    loadState() {
        if (!this.persistencePath || !fs.existsSync(this.persistencePath)) return;
        try {
            const raw = fs.readFileSync(this.persistencePath, 'utf8');
            const data = JSON.parse(raw);
            if (Array.isArray(data.jobs)) {
                for (const job of data.jobs) {
                    this.jobs.set(job.jobId, job);
                    if (job.idempotencyKey) {
                        this.idempotencyIndex.set(job.idempotencyKey, job.jobId);
                    }
                }
            }
            if (Array.isArray(data.deadLetterQueue)) {
                this.deadLetterQueue = data.deadLetterQueue;
            }
            if (data.circuitBreakers && typeof data.circuitBreakers === 'object') {
                for (const [platform, cb] of Object.entries(data.circuitBreakers)) {
                    this.circuitBreakers.set(platform, cb);
                }
            }
        } catch (err) {
            console.error(`[DistributionQueue] Błąd ładowania stanu z ${this.persistencePath}:`, err.message);
        }
    }

    /**
     * Zapisuje stan kolejki do trwałego pliku JSON z operacją atomową
     */
    saveState() {
        if (!this.persistencePath) return;
        try {
            const dir = path.dirname(this.persistencePath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            const cbObj = {};
            for (const [k, v] of this.circuitBreakers.entries()) {
                cbObj[k] = v;
            }
            const data = {
                version: '2026.3',
                updatedAt: new Date().toISOString(),
                jobs: Array.from(this.jobs.values()),
                deadLetterQueue: this.deadLetterQueue,
                circuitBreakers: cbObj
            };
            const tempPath = `${this.persistencePath}.${Date.now()}.${Math.random().toString(36).slice(2, 7)}.tmp`;
            fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf8');
            fs.renameSync(tempPath, this.persistencePath);
        } catch (err) {
            console.error(`[DistributionQueue] Błąd zapisu stanu do ${this.persistencePath}:`, err.message);
        }
    }

    /**
     * Procedura Crash Recovery: wykrywa zadania przerwane w stanie PROCESSING podczas restartu
     */
    recoverCrashedJobs() {
        let recoveredCount = 0;
        for (const job of this.jobs.values()) {
            if (job.status === 'PROCESSING') {
                job.status = 'QUEUED';
                job.lockedBy = null;
                job.lockExpiresAt = null;
                job.stateHistory.push({
                    timestamp: new Date().toISOString(),
                    state: 'QUEUED',
                    note: 'Odzyskano po nieoczekiwanym restarcie procesu (Crash Recovery)'
                });
                recoveredCount++;
            }
        }
        if (recoveredCount > 0) {
            this.saveState();
        }
    }

    /**
     * Rejestruje niestandardowy adapter dla danej platformy
     * @param {string} platform
     * @param {any} adapter
     */
    registerAdapter(platform, adapter) {
        this.customAdapters.set(platform, adapter);
    }

    /**
     * Rejestruje nowe zadanie dystrybucji z pancerną idempotencją (Pkt 9, 71)
     * @param {Object} params
     * @returns {import('./types.js').DistributionJob}
     */
    enqueueJob(params) {
        const { planId, contentId, variantId, platform, channelId, manifestId, scheduledAt, maxAttempts = 3, publicationIntent } = params;
        
        const idempotencyKey = generateIdempotencyKey(contentId, variantId, platform, channelId, publicationIntent);

        // Pkt 71: Test duplikatu — ponowne uruchomienie zwraca istniejący rekord bez duplikowania operacji
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
            lockedBy: null,
            lockExpiresAt: null,
            processingStatus: null,
            errorCode: null,
            errorMessage: null,
            retryable: false,
            stateHistory: [{ timestamp: new Date().toISOString(), state: 'QUEUED', note: 'Zadanie utworzone w kolejce' }]
        };

        this.jobs.set(jobId, job);
        this.idempotencyIndex.set(idempotencyKey, jobId);
        this.saveState();
        return job;
    }

    /**
     * Zwraca zadania gotowe do wykonania zgodnie z harmonogramem
     * @param {string|Date} [nowTime]
     * @returns {import('./types.js').DistributionJob[]}
     */
    getEligibleJobs(nowTime = new Date()) {
        const nowIso = new Date(nowTime).toISOString();
        return Array.from(this.jobs.values()).filter(j => {
            const isDue = !j.scheduledAt || j.scheduledAt <= nowIso;
            const isQueued = j.status === 'QUEUED';
            const isStaleProcessing = j.status === 'PROCESSING' && j.lockExpiresAt && new Date(j.lockExpiresAt) <= new Date(nowTime);
            return isDue && (isQueued || isStaleProcessing);
        });
    }

    /**
     * Blokuje zadanie dla konkretnego wykonawcy (Concurrency Lease Lock)
     * Chroni przed wielokrotnym / równoległym wykonaniem tego samego zadania.
     * @param {string} jobId
     * @param {string} [workerId='worker_default']
     * @param {number} [leaseDurationMs=30000]
     * @returns {import('./types.js').DistributionJob}
     */
    claimJob(jobId, workerId = 'worker_default', leaseDurationMs = 30000) {
        const job = this.jobs.get(jobId);
        if (!job) throw new Error(`Nie odnaleziono zadania ${jobId}`);

        const now = Date.now();
        const hasActiveLock = job.status === 'PROCESSING' && job.lockedBy && job.lockedBy !== workerId && job.lockExpiresAt && new Date(job.lockExpiresAt).getTime() > now;

        if (hasActiveLock) {
            throw new Error(`CONCURRENCY_LOCK_ACTIVE: Zadanie ${jobId} jest aktualnie przetwarzane przez wykonawcę ${job.lockedBy} (blokada ważna do ${job.lockExpiresAt})`);
        }

        job.status = 'PROCESSING';
        job.lockedBy = workerId;
        job.lockExpiresAt = new Date(now + leaseDurationMs).toISOString();
        job.stateHistory.push({
            timestamp: new Date().toISOString(),
            state: 'PROCESSING',
            note: `Zadanie zablokowane na wyłączność przez wykonawcę ${workerId} na ${leaseDurationMs}ms`
        });
        this.saveState();
        return job;
    }

    /**
     * Zwalnia blokadę wykonawcy na zadaniu
     * @param {string} jobId
     * @param {string} workerId
     */
    releaseJob(jobId, workerId) {
        const job = this.jobs.get(jobId);
        if (job && (!workerId || job.lockedBy === workerId)) {
            job.lockedBy = null;
            job.lockExpiresAt = null;
            this.saveState();
        }
    }

    /**
     * Atomowo pobiera i blokuje pierwsze dostępne zadanie gotowe do wykonania
     * @param {string} [workerId='worker_default']
     * @param {number} [leaseDurationMs=30000]
     * @param {string|Date} [nowTime=new Date()]
     * @returns {import('./types.js').DistributionJob|null}
     */
    claimNextEligibleJob(workerId = 'worker_default', leaseDurationMs = 30000, nowTime = new Date()) {
        const eligible = this.getEligibleJobs(nowTime);
        for (const candidate of eligible) {
            try {
                return this.claimJob(candidate.jobId, workerId, leaseDurationMs);
            } catch (err) {
                // Inny wykonawca mógł zablokować w ułamku sekundy — szukaj kolejnego
                continue;
            }
        }
        return null;
    }

    /**
     * Uruchamia samoczynną pętlę planisty (Scheduler Loop)
     * Samodzielnie podejmuje i wykonuje zaplanowane zadania bez konieczności ręcznego wywołania.
     * @param {Object} [config]
     * @param {number} [config.intervalMs=1000]
     * @param {string} [config.workerId='auto_scheduler_worker']
     * @param {Function} [config.onJobProcessed]
     * @param {Function} [config.onError]
     */
    startScheduler(config = {}) {
        if (this.schedulerInterval) {
            clearInterval(this.schedulerInterval);
        }
        const intervalMs = config.intervalMs || 1000;
        const workerId = config.workerId || 'auto_scheduler_worker';

        this.schedulerInterval = setInterval(async () => {
            try {
                const results = await this.runSchedulerTick(new Date(), workerId, config);
                if (results.length > 0 && typeof config.onJobProcessed === 'function') {
                    for (const res of results) {
                        config.onJobProcessed(res);
                    }
                }
            } catch (err) {
                if (typeof config.onError === 'function') {
                    config.onError(err);
                } else {
                    console.error('[DistributionQueue Scheduler] Błąd cyklu:', err.message);
                }
            }
        }, intervalMs);

        // Zapobiegaj blokowaniu zamykania procesu Node.js jeśli scheduler działa w tle
        if (this.schedulerInterval.unref) {
            this.schedulerInterval.unref();
        }
    }

    /**
     * Zatrzymuje samoczynną pętlę planisty
     */
    stopScheduler() {
        if (this.schedulerInterval) {
            clearInterval(this.schedulerInterval);
            this.schedulerInterval = null;
        }
    }

    /**
     * Pojedynczy cykl samoczynnego planisty (wykonuje wszystkie zadania, których czas nadszedł)
     * @param {string|Date} [nowTime=new Date()]
     * @param {string} [workerId='auto_scheduler_worker']
     * @param {Object} [options={}]
     * @returns {Promise<import('./types.js').DistributionJob[]>}
     */
    async runSchedulerTick(nowTime = new Date(), workerId = 'auto_scheduler_worker', options = {}) {
        const processed = [];
        let job = this.claimNextEligibleJob(workerId, 30000, nowTime);
        while (job) {
            try {
                const finished = await this.processJob(job.jobId, {
                    workerId,
                    ignoreSchedule: true,
                    isAutomation: options.isAutomation ?? false,
                    ...options
                });
                processed.push(finished);
            } catch (err) {
                job.errorMessage = err.message;
                processed.push(job);
            }
            job = this.claimNextEligibleJob(workerId, 30000, nowTime);
        }
        return processed;
    }

    /**
     * Wykonuje zadanie dystrybucji za pośrednictwem dedykowanego adaptera
     * @param {string} jobId
     * @param {Object} [options]
     * @returns {Promise<import('./types.js').DistributionJob>}
     */
    async processJob(jobId, options = {}) {
        const job = this.jobs.get(jobId);
        if (!job) throw new Error(`Nie odnaleziono zadania ${jobId}`);

        // Concurrency Check: ochrona przed równoległym wykonaniem przez obcego wykonawcę (Pkt 6)
        const now = Date.now();
        if (job.status === 'PROCESSING' && job.lockedBy && options.workerId && job.lockedBy !== options.workerId && job.lockExpiresAt && new Date(job.lockExpiresAt).getTime() > now) {
            throw new Error(`CONCURRENCY_LOCK_ACTIVE: Zadanie ${jobId} jest aktualnie przetwarzane przez wykonawcę ${job.lockedBy} (blokada do ${job.lockExpiresAt})`);
        }

        // Weryfikacja harmonogramu (nie uruchamiaj przed zaplanowanym czasem, chyba że wymuszono)
        const nowIso = new Date().toISOString();
        if (job.scheduledAt && job.scheduledAt > nowIso && !options.ignoreSchedule) {
            job.stateHistory.push({
                timestamp: nowIso,
                state: 'QUEUED',
                note: `Zadanie oczekuje na nadejście zaplanowanego czasu (${job.scheduledAt})`
            });
            this.saveState();
            return job;
        }

        // 1. Sprawdzenie Kill Switch (Pkt 45)
        const killCheck = isDistributionAllowed(job.platform, job.channelId, options.isAutomation ?? false);
        if (!killCheck.allowed) {
            job.status = 'CANCELLED';
            job.errorCode = 'KILL_SWITCH_ACTIVE';
            job.errorMessage = killCheck.reason;
            job.stateHistory.push({ timestamp: new Date().toISOString(), state: 'CANCELLED', note: killCheck.reason });
            this.saveState();
            return job;
        }

        // 2. Sprawdzenie Circuit Breaker (Pkt 44)
        const cb = this.getCircuitBreaker(job.platform);
        if (cb.state === 'OPEN') {
            job.status = 'CANCELLED';
            job.errorCode = 'CIRCUIT_BREAKER_OPEN';
            job.errorMessage = `Circuit Breaker otwarty dla platformy ${job.platform} (seryjne błędy)`;
            job.stateHistory.push({ timestamp: new Date().toISOString(), state: 'CANCELLED', note: job.errorMessage });
            this.saveState();
            return job;
        }

        job.status = 'PROCESSING';
        job.lockedBy = options.workerId || job.lockedBy || 'default_worker';
        job.lockExpiresAt = new Date(now + 30000).toISOString();
        job.startedAt = new Date().toISOString();
        job.attempt += 1;
        job.stateHistory.push({ timestamp: new Date().toISOString(), state: 'PROCESSING', note: `Próba ${job.attempt}/${job.maxAttempts}` });
        this.saveState();

        const manifest = getPublicationManifest(job.manifestId);
        if (!manifest) {
            job.status = 'FAILED';
            job.errorCode = 'MANIFEST_NOT_FOUND';
            job.errorMessage = `Brak manifestu ${job.manifestId}`;
            this.saveState();
            return job;
        }

        const adapter = options.adapter || this.customAdapters.get(job.platform) || getAdapterForPlatform(job.platform, options);

        try {
            // A. Walidacja techniczna adaptera
            const val = await adapter.validate(job, manifest);
            if (!val.valid) {
                job.errorCode = 'ADAPTER_VALIDATION_FAILED';
                return this.handleJobFailure(job, (val.errors || []).join('; '));
            }

            // B. Przygotowanie payloadu
            const prep = await adapter.prepare(job, manifest);
            if (!prep.ready) {
                job.errorCode = 'PREPARATION_FAILED';
                return this.handleJobFailure(job, 'Błąd przygotowania danych adaptera');
            }

            // C. Publikacja
            const pubResult = await adapter.publish(job, prep.preparedPayload);
            if (!pubResult.success) {
                return this.handleJobFailure(job, pubResult.error || 'Błąd publikacji');
            }

            // Sukces wstępny (np. PUBLISHED, READY)
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

            // D. Zdalna weryfikacja
            if (job.status === 'PUBLISHED' && job.remoteId) {
                const expectedMarker = manifest.testMarker || job.testMarker || null;
                const verResult = await adapter.verify(job.remoteId, job.publicUrl, expectedMarker);
                if (verResult.verified) {
                    job.status = 'VERIFIED';
                    job.completedAt = new Date().toISOString();
                    job.stateHistory.push({
                        timestamp: new Date().toISOString(),
                        state: 'VERIFIED',
                        note: `Zdalne potwierdzenie zweryfikowane pomyślnie (${verResult.status})`
                    });
                }
            }

            // Zwolnienie blokady po zakończeniu przetwarzania
            job.lockedBy = null;
            job.lockExpiresAt = null;

            this.saveState();
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
        job.lockedBy = null;
        job.lockExpiresAt = null;
        this.recordFailure(job.platform);

        if (job.retryable && job.attempt < job.maxAttempts) {
            const backoffSeconds = Math.pow(2, job.attempt);
            job.status = 'QUEUED';
            job.stateHistory.push({
                timestamp: new Date().toISOString(),
                state: 'QUEUED',
                note: `Błąd ponawialny. Kolejna próba za ${backoffSeconds}s: ${errorMessage}`
            });
        } else {
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
        this.saveState();
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
        this.saveState();
    }

    recordSuccess(platform) {
        const cb = this.getCircuitBreaker(platform);
        cb.failureCount = 0;
        cb.state = 'CLOSED';
        this.saveState();
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
