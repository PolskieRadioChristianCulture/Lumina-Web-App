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
import { isDistributionAllowed } from './distribution-registry.js';
import { getAdapterForPlatform } from './adapters/index.js';
import {
    getPublicationManifest,
    restorePublicationManifest
} from './publication-manifest.js';

const PERSISTENCE_VERSION = 2;
const LEGACY_PERSISTENCE_VERSIONS = new Set([undefined, 1, '1', '2026.3']);
const ACTIVE_JOB_STATUSES = new Set(['QUEUED', 'PROCESSING']);
const ACTIVE_QUEUE_LOCK_RELEASES = new Set();
let exitHandlerRegistered = false;

export class DistributionPersistenceError extends Error {
    constructor(code, operation, options = {}) {
        super(`DISTRIBUTION_PERSISTENCE_FAILURE: ${code}`);
        this.name = 'DistributionPersistenceError';
        this.code = code;
        this.operation = operation;
        this.jobId = options.jobId || null;
        this.indeterminate = options.indeterminate === true;
        if (options.cause) this.cause = options.cause;
    }
}

function emitPersistenceAlarm(code, operation, jobId = null) {
    console.error(JSON.stringify({
        event: 'DISTRIBUTION_PERSISTENCE_FAILURE',
        code,
        operation,
        jobId
    }));
}

function copyJob(job) {
    return structuredClone(job);
}

function copyCircuitBreakers(circuitBreakers) {
    return new Map(Array.from(circuitBreakers, ([platform, state]) => [platform, { ...state }]));
}

function releaseQueueLocksAtExit() {
    for (const releaseLock of ACTIVE_QUEUE_LOCK_RELEASES) {
        try {
            releaseLock();
        } catch (err) {
            emitPersistenceAlarm('QUEUE_LOCK_RELEASE_FAILED', 'process-exit', null);
        }
    }
}

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
    #exitLockRelease = null;

    /**
     * @param {Object} [options]
     * @param {string} [options.persistencePath] - Ścieżka do trwałego pliku JSON z kolejką zadań
     * @param {number} [options.consecutiveFailureThreshold=3] - Próg otwarcia Circuit Breaker
     * A persistence path is single-owner on the same filesystem; this is not a cross-host
     * runner lock. A stale `.lock` after an unclean exit requires operator verification/removal.
     */
    constructor(options = {}) {
        this.jobs = new Map(); // jobId -> Job
        this.idempotencyIndex = new Map(); // idempotencyKey -> jobId
        this.circuitBreakers = new Map(); // platform -> { failureCount: number, state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' }
        this.deadLetterQueue = [];
        this.consecutiveFailureThreshold = options.consecutiveFailureThreshold || 3;
        this.customAdapters = new Map();
        // This claim protects concurrent calls on this instance; JSON does not lock across runners.
        this.processingJobIds = new Set();
        this.inFlightProcesses = new Map();
        this.closing = false;
        this.closed = false;
        this.closePromise = null;
        this.persistencePath = options.persistencePath || null;
        this.persistenceLockPath = null;
        this.persistenceLockToken = null;
        this.persistenceLockFd = null;

        if (this.persistencePath) {
            this.#acquirePersistenceLock();
            try {
                this.loadState();
                this.recoverCrashedJobs();
            } catch (err) {
                try {
                    this.#releasePersistenceLock();
                } catch (releaseError) {
                    emitPersistenceAlarm('QUEUE_LOCK_RELEASE_FAILED', 'constructor', null);
                }
                throw err;
            }
        }
    }

    #acquirePersistenceLock() {
        const directory = path.dirname(this.persistencePath);
        fs.mkdirSync(directory, { recursive: true });
        this.persistenceLockPath = `${this.persistencePath}.lock`;
        this.persistenceLockToken = crypto.randomBytes(16).toString('hex');
        try {
            this.persistenceLockFd = fs.openSync(this.persistenceLockPath, 'wx');
            fs.writeFileSync(this.persistenceLockFd, JSON.stringify({
                pid: process.pid,
                token: this.persistenceLockToken,
                createdAt: new Date().toISOString()
            }), 'utf8');
            fs.fsyncSync(this.persistenceLockFd);
        } catch (err) {
            if (this.persistenceLockFd !== null) {
                fs.closeSync(this.persistenceLockFd);
                this.persistenceLockFd = null;
                try {
                    fs.unlinkSync(this.persistenceLockPath);
                } catch {
                    // Preserve the original lock acquisition error.
                }
            }
            if (err.code === 'EEXIST') {
                this.failPersistence('QUEUE_PATH_IN_USE', 'lock', err);
            }
            this.failPersistence('QUEUE_LOCK_ACQUIRE_FAILED', 'lock', err);
        }

        this.#exitLockRelease = () => this.#releasePersistenceLock();
        ACTIVE_QUEUE_LOCK_RELEASES.add(this.#exitLockRelease);
        if (!exitHandlerRegistered) {
            process.once('exit', releaseQueueLocksAtExit);
            exitHandlerRegistered = true;
        }
    }

    #releasePersistenceLock() {
        if (this.persistenceLockFd === null) return;
        let lockData;
        try {
            lockData = JSON.parse(fs.readFileSync(this.persistenceLockPath, 'utf8'));
        } catch (err) {
            this.failPersistence('QUEUE_LOCK_STATE_INVALID', 'unlock', err);
        }
        fs.closeSync(this.persistenceLockFd);
        this.persistenceLockFd = null;
        if (lockData.token !== this.persistenceLockToken) {
            this.failPersistence('QUEUE_LOCK_OWNERSHIP_LOST', 'unlock');
        }
        try {
            fs.unlinkSync(this.persistenceLockPath);
        } catch (err) {
            this.failPersistence('QUEUE_LOCK_RELEASE_FAILED', 'unlock', err);
        }
        ACTIVE_QUEUE_LOCK_RELEASES.delete(this.#exitLockRelease);
        this.#exitLockRelease = null;
        this.persistenceLockToken = null;
    }

    assertOpen(operation) {
        if (this.closing || this.closed) {
            throw new Error(`QUEUE_CLOSED: Nie można wykonać ${operation} na zamkniętej kolejce`);
        }
    }

    async close() {
        if (this.closePromise) return this.closePromise;
        if (this.closed) return;
        this.closing = true;
        this.closePromise = (async () => {
            await Promise.allSettled(this.inFlightProcesses.values());
            this.closed = true;
            this.#releasePersistenceLock();
        })();
        return this.closePromise;
    }

    /**
     * Loads only validated state. Legacy active jobs without a manifest stop startup.
     */
    loadState() {
        this.assertOpen('loadState');
        if (!this.persistencePath) return;
        let raw;
        try {
            raw = fs.readFileSync(this.persistencePath, 'utf8');
        } catch (err) {
            if (err.code === 'ENOENT') return;
            this.failPersistence('STATE_READ_FAILED', 'load', err);
        }

        let data;
        try {
            data = JSON.parse(raw);
        } catch (err) {
            this.failPersistence('STATE_JSON_INVALID', 'load', err);
        }

        const legacy = LEGACY_PERSISTENCE_VERSIONS.has(data?.version);
        if (!data || typeof data !== 'object' || Array.isArray(data) ||
            (!legacy && data.version !== PERSISTENCE_VERSION) ||
            !Array.isArray(data.jobs) ||
            (data.deadLetterQueue !== undefined && !Array.isArray(data.deadLetterQueue)) ||
            (data.circuitBreakers !== undefined &&
                (!data.circuitBreakers || typeof data.circuitBreakers !== 'object' || Array.isArray(data.circuitBreakers)))) {
            this.failPersistence('STATE_SCHEMA_INVALID', 'load');
        }

        const jobs = new Map();
        const idempotencyIndex = new Map();
        for (const job of data.jobs) {
            if (!job || typeof job !== 'object' || Array.isArray(job) ||
                typeof job.jobId !== 'string' || !job.jobId ||
                typeof job.idempotencyKey !== 'string' || !job.idempotencyKey ||
                typeof job.manifestId !== 'string' || !job.manifestId ||
                !Array.isArray(job.stateHistory)) {
                this.failPersistence('JOB_SCHEMA_INVALID', 'load', null, job?.jobId);
            }
            if (jobs.has(job.jobId) || idempotencyIndex.has(job.idempotencyKey)) {
                this.failPersistence('JOB_IDEMPOTENCY_COLLISION', 'load', null, job.jobId);
            }
            if (legacy && ACTIVE_JOB_STATUSES.has(job.status) && !job.manifestSnapshot) {
                this.failPersistence('LEGACY_ACTIVE_JOB_WITHOUT_MANIFEST', 'load', null, job.jobId);
            }
            if (!legacy && ACTIVE_JOB_STATUSES.has(job.status) && !job.manifestSnapshot) {
                this.failPersistence('ACTIVE_JOB_MANIFEST_MISSING', 'load', null, job.jobId);
            }
            if (job.manifestSnapshot) {
                try {
                    const manifest = restorePublicationManifest(job.manifestSnapshot);
                    if (manifest.manifestId !== job.manifestId ||
                        manifest.contentId !== job.contentId ||
                        manifest.variantId !== job.variantId ||
                        manifest.platform !== job.platform ||
                        manifest.channelId !== job.channelId) {
                        this.failPersistence('JOB_MANIFEST_MISMATCH', 'load', null, job.jobId);
                    }
                    job.manifestSnapshot = manifest;
                } catch (err) {
                    if (err instanceof DistributionPersistenceError) throw err;
                    this.failPersistence('JOB_MANIFEST_INVALID', 'load', err, job.jobId);
                }
            }
            if (job.nextAttemptAt !== undefined && job.nextAttemptAt !== null &&
                (typeof job.nextAttemptAt !== 'string' || Number.isNaN(Date.parse(job.nextAttemptAt)))) {
                this.failPersistence('JOB_RETRY_TIME_INVALID', 'load', null, job.jobId);
            }
            jobs.set(job.jobId, job);
            idempotencyIndex.set(job.idempotencyKey, job.jobId);
        }

        this.jobs = jobs;
        this.idempotencyIndex = idempotencyIndex;
        this.deadLetterQueue = data.deadLetterQueue || [];
        this.circuitBreakers = new Map(Object.entries(data.circuitBreakers || {}));
        if (legacy) this.#saveState();
    }

    /**
     * Atomically saves the complete state. Persistence failures are never swallowed.
     */
    saveState() {
        this.assertOpen('saveState');
        this.#saveState();
    }

    #saveState() {
        if (!this.persistencePath) return;
        let tempPath;
        try {
            const dir = path.dirname(this.persistencePath);
            const cbObj = {};
            for (const [k, v] of this.circuitBreakers.entries()) {
                cbObj[k] = v;
            }
            const data = {
                version: PERSISTENCE_VERSION,
                updatedAt: new Date().toISOString(),
                jobs: Array.from(this.jobs.values()),
                deadLetterQueue: this.deadLetterQueue,
                circuitBreakers: cbObj
            };
            fs.mkdirSync(dir, { recursive: true });
            tempPath = `${this.persistencePath}.${process.pid}.${crypto.randomBytes(8).toString('hex')}.tmp`;
            fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), { encoding: 'utf8', flag: 'wx' });
            fs.renameSync(tempPath, this.persistencePath);
        } catch (err) {
            if (tempPath) {
                try {
                    fs.rmSync(tempPath, { force: true });
                } catch {
                    // Preserve the original persistence error.
                }
            }
            this.failPersistence('STATE_WRITE_FAILED', 'save', err);
        }
    }

    failPersistence(code, operation, cause = null, jobId = null, options = {}) {
        emitPersistenceAlarm(code, operation, jobId);
        throw new DistributionPersistenceError(code, operation, { cause, jobId, ...options });
    }

    persistMutation(job, previousJob, previousCircuitBreakers = null, previousDeadLetterQueue = null, options = {}) {
        this.assertOpen('persistMutation');
        this.#persistMutation(job, previousJob, previousCircuitBreakers, previousDeadLetterQueue, options);
    }

    #persistMutation(job, previousJob, previousCircuitBreakers = null, previousDeadLetterQueue = null, options = {}) {
        try {
            this.#saveState();
        } catch (err) {
            if (previousJob) Object.assign(job, previousJob);
            if (previousCircuitBreakers) this.circuitBreakers = previousCircuitBreakers;
            if (previousDeadLetterQueue) this.deadLetterQueue = previousDeadLetterQueue;
            if (err instanceof DistributionPersistenceError && options.indeterminate) {
                err.indeterminate = true;
                err.code = 'PUBLISHED_STATE_NOT_DURABLE';
            }
            throw err;
        }
    }

    /**
     * Procedura Crash Recovery: wykrywa zadania przerwane w stanie PROCESSING podczas restartu
     */
    recoverCrashedJobs() {
        this.assertOpen('recoverCrashedJobs');
        const previousJobs = new Map(Array.from(this.jobs, ([jobId, job]) => [jobId, copyJob(job)]));
        let changed = false;
        for (const job of this.jobs.values()) {
            if (job.status === 'PROCESSING') {
                if (job.publishStartedAt) {
                    job.status = 'INDETERMINATE';
                    job.errorCode = 'PUBLICATION_OUTCOME_UNKNOWN';
                    job.errorMessage = 'Proces przerwał się po rozpoczęciu publikacji; wymagana ręczna weryfikacja przed ponowieniem';
                    emitPersistenceAlarm('PUBLICATION_OUTCOME_UNKNOWN', 'recover', job.jobId);
                } else {
                    job.status = 'QUEUED';
                    job.nextAttemptAt = null;
                }
                job.stateHistory.push({
                    timestamp: new Date().toISOString(),
                    state: job.status,
                    note: job.status === 'INDETERMINATE'
                        ? 'Wstrzymano odzyskiwanie po awarii na granicy zewnętrznej publikacji'
                        : 'Odzyskano po nieoczekiwanym restarcie procesu (Crash Recovery)'
                });
                changed = true;
            }
        }
        if (changed) {
            try {
                this.#saveState();
            } catch (err) {
                this.jobs = previousJobs;
                throw err;
            }
        }
    }

    /**
     * Rejestruje niestandardowy adapter dla danej platformy
     * @param {string} platform
     * @param {any} adapter
     */
    registerAdapter(platform, adapter) {
        this.assertOpen('registerAdapter');
        this.customAdapters.set(platform, adapter);
    }

    /**
     * Rejestruje nowe zadanie dystrybucji z pancerną idempotencją (Pkt 9, 71)
     * @param {Object} params
     * @returns {import('./types.js').DistributionJob}
     */
    enqueueJob(params) {
        this.assertOpen('enqueueJob');
        const {
            planId, contentId, variantId, platform, channelId, manifestId,
            manifestSnapshot: providedManifest, scheduledAt, maxAttempts = 3, publicationIntent
        } = params;
        
        const idempotencyKey = generateIdempotencyKey(contentId, variantId, platform, channelId, publicationIntent);

        // Pkt 71: Test duplikatu — ponowne uruchomienie zwraca istniejący rekord bez duplikowania operacji
        if (this.idempotencyIndex.has(idempotencyKey)) {
            const existingJobId = this.idempotencyIndex.get(idempotencyKey);
            const existingJob = this.jobs.get(existingJobId);
            if (manifestId && existingJob.manifestId !== manifestId) {
                throw new Error('JOB_IDEMPOTENCY_MANIFEST_CONFLICT: Istniejące zadanie ma inny manifest');
            }
            if (providedManifest) {
                const requestedManifest = restorePublicationManifest(providedManifest);
                if (existingJob.manifestSnapshot?.snapshotDigest !== requestedManifest.snapshotDigest) {
                    throw new Error('JOB_IDEMPOTENCY_MANIFEST_CONFLICT: Nie można podmienić snapshotu istniejącego zadania');
                }
            }
            return existingJob;
        }

        const manifest = providedManifest || getPublicationManifest(manifestId);
        let manifestSnapshot = null;
        if (manifest) {
            manifestSnapshot = restorePublicationManifest(manifest);
            if (manifestSnapshot.manifestId !== manifestId ||
                manifestSnapshot.contentId !== contentId ||
                manifestSnapshot.variantId !== variantId ||
                manifestSnapshot.platform !== platform ||
                manifestSnapshot.channelId !== (channelId || 'default')) {
                throw new Error('JOB_MANIFEST_MISMATCH: Manifest nie pasuje do zadania');
            }
        } else if (this.persistencePath) {
            throw new Error('JOB_MANIFEST_REQUIRED: Trwała kolejka wymaga snapshotu manifestu');
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
            manifestSnapshot,
            scheduledAt: scheduledAt || new Date().toISOString(),
            nextAttemptAt: null,
            publishStartedAt: null,
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
        try {
            this.#saveState();
        } catch (err) {
            this.jobs.delete(jobId);
            this.idempotencyIndex.delete(idempotencyKey);
            throw err;
        }
        return job;
    }

    /**
     * Zwraca zadania gotowe do wykonania zgodnie z harmonogramem
     * @param {string|Date} [nowTime]
     * @returns {import('./types.js').DistributionJob[]}
     */
    getEligibleJobs(nowTime = new Date()) {
        this.assertOpen('getEligibleJobs');
        const nowIso = new Date(nowTime).toISOString();
        return Array.from(this.jobs.values()).filter(job =>
            job.status === 'QUEUED' &&
            job.scheduledAt <= nowIso &&
            (!job.nextAttemptAt || job.nextAttemptAt <= nowIso)
        );
    }

    /**
     * Wykonuje zadanie dystrybucji za pośrednictwem dedykowanego adaptera
     * @param {string} jobId
     * @param {Object} [options]
     * @returns {Promise<import('./types.js').DistributionJob>}
     */
    async processJob(jobId, options = {}) {
        this.assertOpen('processJob');
        const job = this.jobs.get(jobId);
        if (!job) throw new Error(`Nie odnaleziono zadania ${jobId}`);
        if (this.processingJobIds.has(jobId)) {
            throw new Error(`JOB_ALREADY_CLAIMED: Zadanie ${jobId} jest już przetwarzane w tym procesie`);
        }
        if (job.publishStartedAt) {
            throw new Error(`PUBLICATION_OUTCOME_UNKNOWN: Zadanie ${jobId} wymaga ręcznego rozstrzygnięcia`);
        }
        if (job.status !== 'QUEUED') {
            throw new Error(`JOB_STATE_NOT_PROCESSABLE: Stan ${job.status} nie pozwala na ponowne przetwarzanie ${jobId}`);
        }

        this.processingJobIds.add(jobId);
        const processing = this.#processJobWithPersistence(job, options);
        this.inFlightProcesses.set(jobId, processing);
        try {
            return await processing;
        } finally {
            this.processingJobIds.delete(jobId);
            this.inFlightProcesses.delete(jobId);
        }
    }

    #resolveJobManifest(job) {
        try {
            if (job.manifestSnapshot) return restorePublicationManifest(job.manifestSnapshot);
            return this.persistencePath ? null : getPublicationManifest(job.manifestId);
        } catch (err) {
            this.failPersistence('JOB_MANIFEST_INVALID', 'process', err, job.jobId);
        }
    }

    async #processJobWithPersistence(job, options) {
        if (job.publishStartedAt) {
            throw new Error(`PUBLICATION_OUTCOME_UNKNOWN: Zadanie ${job.jobId} wymaga ręcznego rozstrzygnięcia`);
        }
        if (job.status !== 'QUEUED') {
            throw new Error(`JOB_STATE_NOT_PROCESSABLE: Stan ${job.status} nie pozwala na przetwarzanie ${job.jobId}`);
        }
        const nowIso = new Date().toISOString();
        if (!options.ignoreSchedule &&
            (job.scheduledAt > nowIso || (job.nextAttemptAt && job.nextAttemptAt > nowIso))) {
            return job;
        }

        const killCheck = isDistributionAllowed(job.platform, job.channelId, options.isAutomation ?? true);
        if (!killCheck.allowed) {
            const previousJob = copyJob(job);
            const circuitBreakersBeforeCheck = copyCircuitBreakers(this.circuitBreakers);
            job.status = 'CANCELLED';
            job.errorCode = 'KILL_SWITCH_ACTIVE';
            job.errorMessage = killCheck.reason;
            job.stateHistory.push({ timestamp: new Date().toISOString(), state: 'CANCELLED', note: killCheck.reason });
            this.#persistMutation(job, previousJob, circuitBreakersBeforeCheck);
            return job;
        }

        const circuitBreakersBeforeCircuitCheck = copyCircuitBreakers(this.circuitBreakers);
        const cb = this.#getCircuitBreaker(job.platform);
        if (cb.state === 'OPEN') {
            const previousJob = copyJob(job);
            job.status = 'CANCELLED';
            job.errorCode = 'CIRCUIT_BREAKER_OPEN';
            job.errorMessage = `Circuit Breaker otwarty dla platformy ${job.platform} (seryjne błędy)`;
            job.stateHistory.push({ timestamp: new Date().toISOString(), state: 'CANCELLED', note: job.errorMessage });
            this.#persistMutation(job, previousJob, circuitBreakersBeforeCircuitCheck);
            return job;
        }

        const manifest = this.#resolveJobManifest(job);
        if (!manifest) {
            const previousJob = copyJob(job);
            job.status = 'FAILED';
            job.errorCode = 'MANIFEST_NOT_FOUND';
            job.errorMessage = `Brak snapshotu manifestu ${job.manifestId}`;
            job.completedAt = new Date().toISOString();
            job.stateHistory.push({ timestamp: job.completedAt, state: 'FAILED', note: job.errorMessage });
            this.#persistMutation(job, previousJob);
            return job;
        }

        const previousJob = copyJob(job);
        const previousCircuitBreakers = copyCircuitBreakers(this.circuitBreakers);
        job.status = 'PROCESSING';
        job.startedAt = new Date().toISOString();
        job.attempt += 1;
        job.nextAttemptAt = null;
        job.publishStartedAt = null;
        job.stateHistory.push({ timestamp: job.startedAt, state: 'PROCESSING', note: `Próba ${job.attempt}/${job.maxAttempts}` });
        this.#persistMutation(job, previousJob, previousCircuitBreakers);

        const adapter = options.adapter || this.customAdapters.get(job.platform) || getAdapterForPlatform(job.platform, options);
        let preparedPayload;
        try {
            const validation = await adapter.validate(job, manifest);
            if (!validation.valid) {
                return this.#handleJobFailure(job, (validation.errors || []).join('; '), 'ADAPTER_VALIDATION_FAILED');
            }
            const prepared = await adapter.prepare(job, manifest);
            if (!prepared.ready) {
                return this.#handleJobFailure(job, 'Błąd przygotowania danych adaptera', 'PREPARATION_FAILED');
            }
            preparedPayload = prepared.preparedPayload;
        } catch (err) {
            if (err instanceof DistributionPersistenceError) throw err;
            return this.#handleJobFailure(job, err.message || String(err));
        }

        const beforePublish = copyJob(job);
        job.publishStartedAt = new Date().toISOString();
        job.stateHistory.push({
            timestamp: job.publishStartedAt,
            state: 'PROCESSING',
            note: 'Zapisano granicę przed zewnętrznym efektem publikacji'
        });
        this.#persistMutation(job, beforePublish);

        let publishResult;
        try {
            publishResult = await adapter.publish(job, preparedPayload);
        } catch (err) {
            return this.#markPublicationIndeterminate(job, err.message || String(err));
        }
        if (!publishResult?.success) {
            return this.#markPublicationIndeterminate(job, publishResult?.error || 'Adapter nie potwierdził wyniku publikacji');
        }

        const beforePersistedPublication = copyJob(job);
        const previousBreakers = copyCircuitBreakers(this.circuitBreakers);
        job.remoteId = publishResult.remoteId || null;
        job.publicUrl = publishResult.publicUrl || null;
        job.status = publishResult.state;
        job.publishStartedAt = null;
        job.stateHistory.push({
            timestamp: new Date().toISOString(),
            state: job.status,
            note: publishResult.note || `Wykonano publish() z remoteId: ${job.remoteId}`
        });
        const successBreaker = this.#getCircuitBreaker(job.platform);
        successBreaker.failureCount = 0;
        successBreaker.state = 'CLOSED';
        this.#persistMutation(job, beforePersistedPublication, previousBreakers, null, { indeterminate: true });

        if (job.status === 'PUBLISHED' && job.remoteId) {
            try {
                const expectedMarker = manifest.testMarker || job.testMarker || null;
                const verification = await adapter.verify(job.remoteId, job.publicUrl, expectedMarker);
                if (verification.verified) {
                    const beforeVerification = copyJob(job);
                    job.status = 'VERIFIED';
                    job.completedAt = new Date().toISOString();
                    job.stateHistory.push({
                        timestamp: job.completedAt,
                        state: 'VERIFIED',
                        note: `Zdalne potwierdzenie zweryfikowane pomyślnie (${verification.status})`
                    });
                    this.#persistMutation(job, beforeVerification);
                } else {
                    const beforeVerification = copyJob(job);
                    job.errorCode = 'REMOTE_VERIFICATION_FAILED';
                    job.errorMessage = verification.error || 'Publikacja istnieje, ale nie została zdalnie zweryfikowana';
                    this.#persistMutation(job, beforeVerification);
                }
            } catch (err) {
                if (err instanceof DistributionPersistenceError) throw err;
                const beforeVerification = copyJob(job);
                job.errorCode = 'REMOTE_VERIFICATION_FAILED';
                job.errorMessage = err.message || String(err);
                this.#persistMutation(job, beforeVerification);
            }
        }
        return job;
    }

    markPublicationIndeterminate(job, reason) {
        this.assertOpen('markPublicationIndeterminate');
        return this.#markPublicationIndeterminate(job, reason);
    }

    #markPublicationIndeterminate(job, reason) {
        const previousJob = copyJob(job);
        job.status = 'INDETERMINATE';
        job.errorCode = 'PUBLICATION_OUTCOME_UNKNOWN';
        job.errorMessage = reason;
        job.stateHistory.push({
            timestamp: new Date().toISOString(),
            state: 'INDETERMINATE',
            note: 'Wynik publikacji niejednoznaczny; wymagane ręczne sprawdzenie przed retry'
        });
        emitPersistenceAlarm('PUBLICATION_OUTCOME_UNKNOWN', 'publish', job.jobId);
        this.#persistMutation(job, previousJob, null, null, { indeterminate: true });
        return job;
    }

    /**
     * Obsługa niepowodzenia zadania z logiką Retry & Dead Letter (Pkt 41, 42)
     */
    handleJobFailure(job, errorMessage, errorCode = 'PUBLICATION_FAILED') {
        this.assertOpen('handleJobFailure');
        return this.#handleJobFailure(job, errorMessage, errorCode);
    }

    #handleJobFailure(job, errorMessage, errorCode = 'PUBLICATION_FAILED') {
        const previousJob = copyJob(job);
        const previousCircuitBreakers = copyCircuitBreakers(this.circuitBreakers);
        const previousDeadLetterQueue = [...this.deadLetterQueue];
        job.errorMessage = errorMessage;
        job.errorCode = errorCode;
        job.retryable = isRetryableError(errorMessage);

        const breaker = this.#getCircuitBreaker(job.platform);
        breaker.failureCount += 1;
        if (breaker.failureCount >= this.consecutiveFailureThreshold) breaker.state = 'OPEN';

        if (job.retryable && job.attempt < job.maxAttempts) {
            const backoffSeconds = Math.pow(2, job.attempt);
            const retryAt = new Date(Date.now() + backoffSeconds * 1000).toISOString();
            job.status = 'QUEUED';
            job.nextAttemptAt = retryAt;
            job.publishStartedAt = null;
            job.stateHistory.push({
                timestamp: new Date().toISOString(),
                state: 'QUEUED',
                note: `Błąd ponawialny. Kolejna próba po ${retryAt}: ${errorMessage}`
            });
        } else {
            job.status = 'FAILED';
            job.nextAttemptAt = null;
            job.completedAt = new Date().toISOString();
            job.stateHistory.push({
                timestamp: job.completedAt,
                state: 'FAILED',
                note: `Zadanie przekazane do Dead Letter Queue: ${errorMessage}`
            });
            this.deadLetterQueue.push({
                jobId: job.jobId,
                failedAt: job.completedAt,
                reason: errorMessage,
                attempts: job.attempt
            });
        }
        this.#persistMutation(job, previousJob, previousCircuitBreakers, previousDeadLetterQueue);
        return job;
    }

    getCircuitBreaker(platform) {
        this.assertOpen('getCircuitBreaker');
        return this.#getCircuitBreaker(platform);
    }

    #getCircuitBreaker(platform) {
        if (!this.circuitBreakers.has(platform)) {
            this.circuitBreakers.set(platform, { failureCount: 0, state: 'CLOSED' });
        }
        return this.circuitBreakers.get(platform);
    }

    recordFailure(platform) {
        this.assertOpen('recordFailure');
        const cb = this.#getCircuitBreaker(platform);
        cb.failureCount += 1;
        if (cb.failureCount >= this.consecutiveFailureThreshold) {
            cb.state = 'OPEN';
        }
        this.#saveState();
    }

    recordSuccess(platform) {
        this.assertOpen('recordSuccess');
        const cb = this.#getCircuitBreaker(platform);
        cb.failureCount = 0;
        cb.state = 'CLOSED';
        this.#saveState();
    }

    getJob(jobId) {
        this.assertOpen('getJob');
        return this.jobs.get(jobId) || null;
    }

    getAllJobs() {
        this.assertOpen('getAllJobs');
        return Array.from(this.jobs.values());
    }

    getDeadLetterJobs() {
        this.assertOpen('getDeadLetterJobs');
        return [...this.deadLetterQueue];
    }
}
