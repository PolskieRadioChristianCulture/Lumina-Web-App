import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { spawn, spawnSync } from 'node:child_process';
import { once } from 'node:events';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import test from 'node:test';

import {
    createPublicationManifest,
    DistributionPersistenceError,
    DistributionQueue
} from '../lib/cc-content-core/index.js';

const queueModuleUrl = pathToFileURL(fileURLToPath(new URL('../lib/cc-content-core/distribution-queue.js', import.meta.url))).href;

function makeManifest({ contentId = `CC-P0-OFFLINE-${crypto.randomUUID()}`, operator = 'offline-test', title = 'Offline test' } = {}) {
    return createPublicationManifest(
        {
            contentId,
            title,
            rights: { ownership: 'CC_OWNED', redistributionAllowed: true },
            assets: [{ assetId: 'offline-image', checksum: 'a'.repeat(64) }]
        },
        { variantId: 'pl', fullText: 'Testowy tekst zatwierdzonej publikacji', title, teaser: 'Test', status: 'APPROVED' },
        'WWW',
        'default',
        '1.0.0',
        operator
    );
}

function enqueue(queue, manifest, extra = {}) {
    return queue.enqueueJob({
        contentId: manifest.contentId,
        variantId: manifest.variantId,
        platform: manifest.platform,
        channelId: manifest.channelId,
        manifestId: manifest.manifestId,
        manifestSnapshot: manifest,
        scheduledAt: new Date(Date.now() - 1000).toISOString(),
        ...extra
    });
}

function createAdapter(overrides = {}) {
    return {
        validate: async () => ({ valid: true, errors: [] }),
        prepare: async () => ({ ready: true, preparedPayload: { marker: 'offline-only' } }),
        publish: async () => ({ success: true, state: 'PUBLISHED', remoteId: 'offline-remote-id', publicUrl: null }),
        verify: async () => ({ verified: false }),
        ...overrides
    };
}

async function withTempDir(fn) {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cc-p0-queue-'));
    try {
        await fn(tempDir);
    } finally {
        fs.rmSync(tempDir, { recursive: true, force: true });
    }
}

test('retry deadline is enforced by a restarted Node process before and after it is due', async () => {
    await withTempDir(async tempDir => {
        const persistencePath = path.join(tempDir, 'queue.json');
        const manifest = makeManifest();
        const queue = new DistributionQueue({ persistencePath });
        const job = enqueue(queue, manifest);

        const result = await queue.processJob(job.jobId, {
            isAutomation: false,
            adapter: createAdapter({
                validate: async () => ({ valid: false, errors: ['request timeout'] })
            })
        });
        assert.equal(result.status, 'QUEUED');
        assert.ok(result.nextAttemptAt);
        assert.ok(Date.parse(result.nextAttemptAt) > Date.now());
        assert.equal(queue.getEligibleJobs().some(candidate => candidate.jobId === job.jobId), false);
        await queue.close();

        const childScript = `
            import { DistributionQueue } from ${JSON.stringify(queueModuleUrl)};
            const queue = new DistributionQueue({ persistencePath: process.argv[1] });
            const job = queue.getJob(process.argv[2]);
            const eligibleBeforeDeadline = queue.getEligibleJobs().some(candidate => candidate.jobId === job.jobId);
            const waitMs = Math.max(0, Date.parse(job.nextAttemptAt) - Date.now() + 30);
            await new Promise(resolve => setTimeout(resolve, waitMs));
            const eligibleAfterDeadline = queue.getEligibleJobs().some(candidate => candidate.jobId === job.jobId);
            let publishCalls = 0;
            const processed = await queue.processJob(job.jobId, {
                isAutomation: false,
                adapter: {
                    validate: async () => ({ valid: true, errors: [] }),
                    prepare: async () => ({ ready: true, preparedPayload: {} }),
                    publish: async () => {
                        publishCalls += 1;
                        return { success: true, state: 'PUBLISHED', remoteId: 'retry-child-id' };
                    },
                    verify: async () => ({ verified: false })
                }
            });
            console.log(JSON.stringify({ eligibleBeforeDeadline, eligibleAfterDeadline, processedState: processed.status, publishCalls }));
        `;
        const child = spawnSync(process.execPath, ['--input-type=module', '-e', childScript, persistencePath, job.jobId], {
            encoding: 'utf8',
            timeout: 10000
        });

        assert.equal(child.status, 0, child.stderr);
        assert.deepEqual(JSON.parse(child.stdout.trim()), {
            eligibleBeforeDeadline: false,
            eligibleAfterDeadline: true,
            processedState: 'PUBLISHED',
            publishCalls: 1
        });
    });
});

test('storage failure is fail-closed and emits an explicit alarm before adapter effects', async () => {
    await withTempDir(async tempDir => {
        const manifest = makeManifest();
        const queue = new DistributionQueue({ persistencePath: path.join(tempDir, 'queue.json') });
        const failedEnqueuePath = path.join(tempDir, 'failed-enqueue.json');
        const enqueueFailureQueue = new DistributionQueue({ persistencePath: failedEnqueuePath });
        const enqueueAlarms = [];
        const originalConsoleError = console.error;
        const originalRenameSync = fs.renameSync;
        console.error = line => enqueueAlarms.push(String(line));
        fs.renameSync = (source, destination) => {
            if (destination === failedEnqueuePath) throw new Error('offline enqueue storage failure');
            return originalRenameSync(source, destination);
        };
        try {
            assert.throws(
                () => enqueue(enqueueFailureQueue, manifest),
                err => err instanceof DistributionPersistenceError && err.code === 'STATE_WRITE_FAILED'
            );
        } finally {
            console.error = originalConsoleError;
            fs.renameSync = originalRenameSync;
        }
        assert.equal(enqueueFailureQueue.getAllJobs().length, 0);
        assert.ok(enqueueAlarms.some(line => line.includes('DISTRIBUTION_PERSISTENCE_FAILURE')));

        const job = enqueue(queue, manifest);
        let saveCalls = 0;
        let publishCalls = 0;
        fs.renameSync = (source, destination) => {
            if (destination === queue.persistencePath) {
                saveCalls += 1;
                if (saveCalls === 2) throw new Error('offline storage failure');
            }
            return originalRenameSync(source, destination);
        };
        const alarmLines = [];
        console.error = line => alarmLines.push(String(line));
        try {
            await assert.rejects(
                queue.processJob(job.jobId, {
                    isAutomation: false,
                    adapter: createAdapter({
                        publish: async () => {
                            publishCalls += 1;
                            return { success: true, state: 'PUBLISHED' };
                        }
                    })
                }),
                err => err instanceof DistributionPersistenceError && err.code === 'STATE_WRITE_FAILED'
            );
        } finally {
            console.error = originalConsoleError;
            fs.renameSync = originalRenameSync;
        }

        assert.equal(publishCalls, 0);
        assert.equal(queue.getJob(job.jobId).status, 'PROCESSING');
        assert.ok(alarmLines.some(line => line.includes('DISTRIBUTION_PERSISTENCE_FAILURE')));
        await queue.close();
        await enqueueFailureQueue.close();
    });
});

test('manifest snapshot restores in a separate Node process and is used by the adapter', async () => {
    await withTempDir(async tempDir => {
        const persistencePath = path.join(tempDir, 'queue.json');
        const manifest = makeManifest();
        const queue = new DistributionQueue({ persistencePath });
        const job = enqueue(queue, manifest);
        assert.equal(Object.isFrozen(job.manifestSnapshot), true);
        assert.equal(Object.isFrozen(job.manifestSnapshot.rightsSnapshot), true);
        assert.throws(() => { job.manifestSnapshot.title = 'Tampered'; }, TypeError);
        await queue.close();

        const childScript = `
            import { DistributionQueue } from ${JSON.stringify(queueModuleUrl)};
            const queue = new DistributionQueue({ persistencePath: process.argv[1] });
            const job = queue.getJob(process.argv[2]);
            let receivedTitle = null;
            const result = await queue.processJob(job.jobId, {
                isAutomation: false,
                adapter: {
                    validate: async (_job, manifest) => {
                        receivedTitle = manifest.title;
                        return { valid: true, errors: [] };
                    },
                    prepare: async (_job, manifest) => {
                        if (manifest.title !== ${JSON.stringify(manifest.title)}) throw new Error('manifest snapshot mismatch');
                        return { ready: true, preparedPayload: {} };
                    },
                    publish: async () => ({ success: true, state: 'PUBLISHED', remoteId: 'child-process-id' }),
                    verify: async () => ({ verified: false })
                }
            });
            console.log(JSON.stringify({ status: result.status, manifestId: job.manifestSnapshot.manifestId, receivedTitle }));
        `;
        const child = spawnSync(process.execPath, ['--input-type=module', '-e', childScript, persistencePath, job.jobId], {
            encoding: 'utf8',
            timeout: 10000
        });

        assert.equal(child.status, 0, child.stderr);
        assert.deepEqual(JSON.parse(child.stdout.trim()), {
            status: 'PUBLISHED',
            manifestId: manifest.manifestId,
            receivedTitle: manifest.title
        });
    });
});

test('manifest digest rejects persisted changes to all snapshot fields after restart', async () => {
    await withTempDir(async tempDir => {
        const manifest = makeManifest();
        const sourcePath = path.join(tempDir, 'source.json');
        const queue = new DistributionQueue({ persistencePath: sourcePath });
        enqueue(queue, manifest);
        const originalState = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
        await queue.close();
        const tamperCases = [
            snapshot => { snapshot.title = 'Tampered title'; },
            snapshot => { snapshot.rightsSnapshot.ownership = 'EXTERNAL'; },
            snapshot => { snapshot.assetIds.push('injected-asset'); },
            snapshot => { snapshot.assetHashes['offline-image'] = 'b'.repeat(64); },
            snapshot => { snapshot.adapterVersion = 'tampered-adapter'; }
        ];

        for (let index = 0; index < tamperCases.length; index += 1) {
            const persistencePath = path.join(tempDir, `tampered-${index}.json`);
            const state = structuredClone(originalState);
            tamperCases[index](state.jobs[0].manifestSnapshot);
            fs.writeFileSync(persistencePath, JSON.stringify(state), 'utf8');
            const childScript = `
                import { DistributionQueue } from ${JSON.stringify(queueModuleUrl)};
                try {
                    new DistributionQueue({ persistencePath: process.argv[1] });
                    console.log(JSON.stringify({ accepted: true }));
                } catch (error) {
                    console.log(JSON.stringify({ accepted: false, code: error.code }));
                }
            `;
            const child = spawnSync(process.execPath, ['--input-type=module', '-e', childScript, persistencePath], {
                encoding: 'utf8',
                timeout: 10000
            });

            assert.equal(child.status, 0, child.stderr);
            assert.deepEqual(JSON.parse(child.stdout.trim()), {
                accepted: false,
                code: 'JOB_MANIFEST_INVALID'
            });
        }
    });
});

test('concurrent processing claims one job once within the same process', async () => {
    await withTempDir(async tempDir => {
        const queue = new DistributionQueue({ persistencePath: path.join(tempDir, 'queue.json') });
        const job = enqueue(queue, makeManifest());
        let signalValidationStarted;
        const validationStarted = new Promise(resolve => { signalValidationStarted = resolve; });
        let releaseValidation;
        const validationGate = new Promise(resolve => { releaseValidation = resolve; });
        let publishCalls = 0;
        const adapter = createAdapter({
            validate: async () => {
                signalValidationStarted();
                await validationGate;
                return { valid: true, errors: [] };
            },
            publish: async () => {
                publishCalls += 1;
                return { success: true, state: 'PUBLISHED', remoteId: 'concurrent-id' };
            }
        });

        const firstProcess = queue.processJob(job.jobId, { isAutomation: false, adapter });
        await validationStarted;
        await assert.rejects(
            queue.processJob(job.jobId, { isAutomation: false, adapter }),
            /JOB_ALREADY_CLAIMED|JOB_STATE_NOT_PROCESSABLE/
        );
        releaseValidation();
        const processed = await firstProcess;

        assert.equal(processed.status, 'PUBLISHED');
        assert.equal(publishCalls, 1);
        await queue.close();
    });
});

test('close waits for an in-flight job, blocks new work, and releases lock only afterwards', async () => {
    await withTempDir(async tempDir => {
        const persistencePath = path.join(tempDir, 'queue.json');
        const queue = new DistributionQueue({ persistencePath });
        const job = enqueue(queue, makeManifest());
        let signalValidationStarted;
        const validationStarted = new Promise(resolve => { signalValidationStarted = resolve; });
        let releaseValidation;
        const validationGate = new Promise(resolve => { releaseValidation = resolve; });
        let publishCalls = 0;
        const adapter = createAdapter({
            validate: async () => {
                signalValidationStarted();
                await validationGate;
                return { valid: true, errors: [] };
            },
            publish: async () => {
                publishCalls += 1;
                return { success: true, state: 'PUBLISHED', remoteId: 'close-lifecycle-id' };
            }
        });
        const processing = queue.processJob(job.jobId, { isAutomation: false, adapter });
        await validationStarted;
        const closing = queue.close();

        await assert.rejects(
            queue.processJob(job.jobId, { isAutomation: false, adapter }),
            /QUEUE_CLOSED/
        );
        const contenderScript = `
            import { DistributionQueue } from ${JSON.stringify(queueModuleUrl)};
            try {
                const contender = new DistributionQueue({ persistencePath: process.argv[1] });
                await contender.close();
                console.log(JSON.stringify({ acquired: true }));
            } catch (error) {
                console.log(JSON.stringify({ acquired: false, code: error.code }));
            }
        `;
        const whileClosing = spawnSync(process.execPath, ['--input-type=module', '-e', contenderScript, persistencePath], {
            encoding: 'utf8',
            timeout: 10000
        });
        assert.equal(whileClosing.status, 0, whileClosing.stderr);
        assert.deepEqual(JSON.parse(whileClosing.stdout.trim()), {
            acquired: false,
            code: 'QUEUE_PATH_IN_USE'
        });

        releaseValidation();
        const processed = await processing;
        await closing;
        assert.equal(processed.status, 'PUBLISHED');
        assert.equal(publishCalls, 1);

        const afterClose = spawnSync(process.execPath, ['--input-type=module', '-e', contenderScript, persistencePath], {
            encoding: 'utf8',
            timeout: 10000
        });
        assert.equal(afterClose.status, 0, afterClose.stderr);
        assert.deepEqual(JSON.parse(afterClose.stdout.trim()), { acquired: true });
    });
});

test('circuit breaker mutators reject during closing and after close without changing persisted state', async () => {
    await withTempDir(async tempDir => {
        const persistencePath = path.join(tempDir, 'queue.json');
        const queue = new DistributionQueue({ persistencePath });
        const job = enqueue(queue, makeManifest());
        let signalValidationStarted;
        const validationStarted = new Promise(resolve => { signalValidationStarted = resolve; });
        let releaseValidation;
        const validationGate = new Promise(resolve => { releaseValidation = resolve; });
        const adapter = createAdapter({
            validate: async () => {
                signalValidationStarted();
                await validationGate;
                return { valid: true, errors: [] };
            }
        });

        const processing = queue.processJob(job.jobId, { isAutomation: false, adapter });
        await validationStarted;
        const closing = queue.close();
        const closingState = fs.readFileSync(persistencePath, 'utf8');
        const closingBreakers = structuredClone(Array.from(queue.circuitBreakers.entries()));
        assert.throws(() => queue.recordFailure('WWW'), /QUEUE_CLOSED/);
        assert.throws(() => queue.recordSuccess('WWW'), /QUEUE_CLOSED/);
        assert.deepEqual(Array.from(queue.circuitBreakers.entries()), closingBreakers);
        assert.equal(fs.readFileSync(persistencePath, 'utf8'), closingState);

        releaseValidation();
        await processing;
        await closing;
        const closedState = fs.readFileSync(persistencePath, 'utf8');
        const closedBreakers = structuredClone(Array.from(queue.circuitBreakers.entries()));
        assert.throws(() => queue.recordFailure('WWW'), /QUEUE_CLOSED/);
        assert.throws(() => queue.recordSuccess('WWW'), /QUEUE_CLOSED/);
        assert.deepEqual(Array.from(queue.circuitBreakers.entries()), closedBreakers);
        assert.equal(fs.readFileSync(persistencePath, 'utf8'), closedState);
    });
});

test('private processing and persistence paths are inaccessible after close', async () => {
    await withTempDir(async tempDir => {
        const persistencePath = path.join(tempDir, 'queue.json');
        const lockPath = `${persistencePath}.lock`;
        const queue = new DistributionQueue({ persistencePath });
        const job = enqueue(queue, makeManifest());
        await queue.close();

        const stateAfterClose = fs.readFileSync(persistencePath, 'utf8');
        assert.equal(fs.existsSync(lockPath), false);
        for (const methodName of [
            '_processJobWithPersistence',
            '_saveState',
            '_persistMutation',
            '_acquirePersistenceLock',
            '_releasePersistenceLock'
        ]) {
            assert.equal(queue[methodName], undefined, `${methodName} must not be externally accessible`);
        }
        assert.throws(() => queue._processJobWithPersistence(job, {}), TypeError);
        assert.throws(() => queue._saveState(), TypeError);

        assert.equal(fs.readFileSync(persistencePath, 'utf8'), stateAfterClose);
        assert.equal(fs.existsSync(lockPath), false);
        assert.equal(job.status, 'QUEUED');
    });
});

test('only QUEUED jobs can be processed and an in-flight publish boundary is blocked', async () => {
    await withTempDir(async tempDir => {
        const queue = new DistributionQueue({ persistencePath: path.join(tempDir, 'queue.json') });
        const completedJob = enqueue(queue, makeManifest());
        completedJob.status = 'VERIFIED';
        await assert.rejects(queue.processJob(completedJob.jobId, { isAutomation: false }), /JOB_STATE_NOT_PROCESSABLE/);

        const publishingJob = enqueue(queue, makeManifest());
        publishingJob.status = 'PROCESSING';
        publishingJob.publishStartedAt = new Date().toISOString();
        await assert.rejects(queue.processJob(publishingJob.jobId, { isAutomation: false }), /PUBLICATION_OUTCOME_UNKNOWN/);
        await queue.close();
    });
});

test('legacy active jobs without a durable manifest fail closed during restart', async () => {
    await withTempDir(async tempDir => {
        const persistencePath = path.join(tempDir, 'queue.json');
        fs.writeFileSync(persistencePath, JSON.stringify({
            version: '2026.3',
            jobs: [{
                jobId: 'legacy-active-job',
                idempotencyKey: 'legacy-idempotency-key',
                manifestId: 'legacy-manifest',
                status: 'QUEUED',
                stateHistory: []
            }]
        }));

        assert.throws(
            () => new DistributionQueue({ persistencePath }),
            err => err instanceof DistributionPersistenceError && err.code === 'LEGACY_ACTIVE_JOB_WITHOUT_MANIFEST'
        );
    });
});

test('same publication identity from another operator reuses the original immutable snapshot', async () => {
        await withTempDir(async tempDir => {
            const firstManifest = makeManifest({ contentId: 'CC-P0-IDEMPOTENT-MANIFEST', operator: 'operator-one' });
            const secondManifest = makeManifest({ contentId: 'CC-P0-IDEMPOTENT-MANIFEST', operator: 'operator-two' });
            assert.equal(secondManifest, firstManifest);
            assert.equal(secondManifest.createdBy, 'operator-one');
            assert.equal(secondManifest.snapshotDigest, firstManifest.snapshotDigest);

            const queue = new DistributionQueue({ persistencePath: path.join(tempDir, 'queue.json') });
            const firstJob = enqueue(queue, firstManifest);
            const secondJob = enqueue(queue, secondManifest);
            assert.equal(secondJob, firstJob);
            assert.equal(queue.getAllJobs().length, 1);
            assert.equal(queue.getJob(firstJob.jobId).manifestSnapshot.snapshotDigest, firstManifest.snapshotDigest);
            assert.throws(
                () => enqueue(queue, makeManifest({
                    contentId: 'CC-P0-IDEMPOTENT-MANIFEST',
                    operator: 'operator-three',
                    title: 'Changed approved title'
                })),
                /PUBLICATION_MANIFEST_IMMUTABILITY_VIOLATION/
            );
            await queue.close();
        });
    });

test('persistent queue path is exclusively owned across Node processes', async () => {
        await withTempDir(async tempDir => {
            const persistencePath = path.join(tempDir, 'shared-queue.json');
            const initialQueue = new DistributionQueue({ persistencePath });
            await initialQueue.close();

            const holderScript = `
                import { DistributionQueue } from ${JSON.stringify(queueModuleUrl)};
                const queue = new DistributionQueue({ persistencePath: process.argv[1] });
                console.log('LOCKED');
                process.stdin.once('data', async () => {
                    await queue.close();
                    console.log('RELEASED');
                });
            `;
            const holder = spawn(process.execPath, ['--input-type=module', '-e', holderScript, persistencePath], {
                stdio: ['pipe', 'pipe', 'pipe']
            });
            let output = '';
            await new Promise((resolve, reject) => {
                holder.stdout.setEncoding('utf8');
                holder.stderr.setEncoding('utf8');
                holder.stdout.on('data', chunk => {
                    output += chunk;
                    if (output.includes('LOCKED')) resolve();
                });
                holder.once('error', reject);
                holder.once('exit', code => {
                    if (!output.includes('LOCKED')) reject(new Error(`Lock holder exited early (${code}): ${output}`));
                });
            });

            const contenderScript = `
                import { DistributionQueue } from ${JSON.stringify(queueModuleUrl)};
                try {
                    const queue = new DistributionQueue({ persistencePath: process.argv[1] });
                    await queue.close();
                    console.log(JSON.stringify({ acquired: true }));
                } catch (error) {
                    console.log(JSON.stringify({ acquired: false, code: error.code }));
                }
            `;
            const contender = spawnSync(process.execPath, ['--input-type=module', '-e', contenderScript, persistencePath], {
                encoding: 'utf8',
                timeout: 10000
            });
            assert.equal(contender.status, 0, contender.stderr);
            assert.deepEqual(JSON.parse(contender.stdout.trim()), {
                acquired: false,
                code: 'QUEUE_PATH_IN_USE'
            });

            holder.stdin.end('release');
            const [exitCode] = await once(holder, 'exit');
            assert.equal(exitCode, 0);

            const afterRelease = spawnSync(process.execPath, ['--input-type=module', '-e', contenderScript, persistencePath], {
                encoding: 'utf8',
                timeout: 10000
            });
            assert.equal(afterRelease.status, 0, afterRelease.stderr);
            assert.deepEqual(JSON.parse(afterRelease.stdout.trim()), { acquired: true });
        });
});

test('ambiguous publish result is persisted as INDETERMINATE and cannot be rerun', async () => {
    await withTempDir(async tempDir => {
        const persistencePath = path.join(tempDir, 'queue.json');
        const queue = new DistributionQueue({ persistencePath });
        const job = enqueue(queue, makeManifest());
        let publishCalls = 0;

        const result = await queue.processJob(job.jobId, {
            isAutomation: false,
            adapter: createAdapter({
                publish: async () => {
                    publishCalls += 1;
                    throw new Error('connection lost after request');
                }
            })
        });
        assert.equal(result.status, 'INDETERMINATE');
        await assert.rejects(queue.processJob(job.jobId, { isAutomation: false }), /PUBLICATION_OUTCOME_UNKNOWN/);
        await queue.close();

        const restartedQueue = new DistributionQueue({ persistencePath });
        assert.equal(restartedQueue.getJob(job.jobId).status, 'INDETERMINATE');
        assert.equal(restartedQueue.getEligibleJobs().some(candidate => candidate.jobId === job.jobId), false);
        await assert.rejects(restartedQueue.processJob(job.jobId, { isAutomation: false }), /PUBLICATION_OUTCOME_UNKNOWN/);
        assert.equal(publishCalls, 1);
        await restartedQueue.close();
    });
});

test('post-publish persistence failure blocks rerun and is indeterminate after restart', async () => {
    await withTempDir(async tempDir => {
        const persistencePath = path.join(tempDir, 'queue.json');
        const queue = new DistributionQueue({ persistencePath });
        const job = enqueue(queue, makeManifest());
        let publishCalls = 0;
        const originalRenameSync = fs.renameSync;
        fs.renameSync = (source, destination) => {
            if (destination === persistencePath) {
                const savedState = JSON.parse(fs.readFileSync(source, 'utf8'));
                const savedJob = savedState.jobs.find(candidate => candidate.jobId === job.jobId);
                if (savedJob?.status === 'PUBLISHED' &&
                    savedJob.remoteId === 'published-before-storage-failure') {
                    throw new Error('offline post-publish write failure');
                }
            }
            return originalRenameSync(source, destination);
        };

        try {
            await assert.rejects(
                queue.processJob(job.jobId, {
                    isAutomation: false,
                    adapter: createAdapter({
                        publish: async () => {
                            publishCalls += 1;
                            return { success: true, state: 'PUBLISHED', remoteId: 'published-before-storage-failure' };
                        }
                    })
                }),
                err => err instanceof DistributionPersistenceError && err.code === 'PUBLISHED_STATE_NOT_DURABLE'
            );
        } finally {
            fs.renameSync = originalRenameSync;
        }
        await assert.rejects(queue.processJob(job.jobId, { isAutomation: false }), /PUBLICATION_OUTCOME_UNKNOWN/);
        assert.equal(publishCalls, 1);

        await queue.close();
        const restartedQueue = new DistributionQueue({ persistencePath });
        assert.equal(restartedQueue.getJob(job.jobId).status, 'INDETERMINATE');
        await assert.rejects(restartedQueue.processJob(job.jobId, { isAutomation: false }), /PUBLICATION_OUTCOME_UNKNOWN/);
        assert.equal(publishCalls, 1);
        await restartedQueue.close();
    });
});
