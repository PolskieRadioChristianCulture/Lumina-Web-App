/**
 * ══════════════════════════════════════════════════════════════════════════
 * AUTOMATED E2E PUBLICATION RECOVERY SUITE — TESTS/P0-E2E-STAGE-PUBLICATION.TEST.MJS
 * Standard: ZERO-QA JOMA-D005 / CC Publication Recovery P0 (Etap 2)
 *
 * Sprawdza:
 * 1. Rzeczywisty pipeline publikacyjny WWW (WwwDistributionAdapter w live mode)
 * 2. Automatyczny test E2E na środowisku testowym z nowym, unikatowym materiałem
 * 3. Weryfikację HTTP 200 z unikatowym znacznikiem treści (scripts/verify_publication.mjs)
 * 4. Harmonogram zadań (scheduledAt) i brak przedwczesnego wykonania
 * 5. Trwałość kolejki po restarcie procesu (Crash Recovery)
 * 6. Pancerne zapobieganie duplikacji (Idempotency Key)
 * 7. Poprawną obsługę błędów i przekazanie do Dead Letter Queue
 * ══════════════════════════════════════════════════════════════════════════
 */

import assert from 'node:assert';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

import {
    DistributionQueue,
    DistributionOrchestrator,
    WwwDistributionAdapter,
    createPublicationManifest
} from '../lib/cc-content-core/index.js';

import { fetchUrlNoCrossRedirect } from '../scripts/verify_publication.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

let passed = 0;
let failed = 0;

async function test(name, fn) {
    process.stdout.write(`⏳ TEST: ${name}... `);
    try {
        await fn();
        console.log('✅ PASS');
        passed++;
    } catch (err) {
        console.log('❌ FAIL');
        console.error('   Szczegóły błędu:', err.message);
        failed++;
    }
}

// Serwer testowy serwujący pliki repozytorium na dedykowanym porcie
function startTestStagingServer(port) {
    return new Promise((resolve) => {
        const server = http.createServer((req, res) => {
            const rawUrl = new URL(req.url, `http://localhost:${port}`);
            let filePath = path.join(ROOT, rawUrl.pathname);

            if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
                filePath = path.join(filePath, 'index.html');
            } else if (!fs.existsSync(filePath) && fs.existsSync(`${filePath}.html`)) {
                filePath = `${filePath}.html`;
            }

            if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
                const content = fs.readFileSync(filePath);
                res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(content);
            } else {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('404 Not Found');
            }
        });

        server.listen(port, '127.0.0.1', () => {
            resolve(server);
        });
    });
}

async function runSuite() {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('   🚀 AUTOMATED E2E STAGING & RECOVERY VERIFICATION SUITE');
    console.log('   Master Plan CC Global 2030 — Autonomous Publication Recovery');
    console.log('═══════════════════════════════════════════════════════════════\n');

    const TEST_PORT = 3456;
    const testServer = await startTestStagingServer(TEST_PORT);
    const persistenceFile = path.join(ROOT, 'data/test-distribution-queue-stage.json');

    if (fs.existsSync(persistenceFile)) {
        fs.unlinkSync(persistenceFile);
    }

    const uniqueTimestamp = Date.now();
    const testSlug = `test-cc-p0-stage-${uniqueTimestamp}`;
    const testMarker = `CC-P0-E2E-STAGE-${uniqueTimestamp}-PASS`;

    try {
        // ─────────────────────────────────────────────────────────────
        // 1. RZECZYWISTY ADAPTER WWW I FIZYCZNY ZAPIS
        // ─────────────────────────────────────────────────────────────
        await test('WwwDistributionAdapter (Live): Zapis fizyczny HTML z unikatowym markerem', async () => {
            const adapter = new WwwDistributionAdapter({
                isLiveMode: true,
                rootDir: ROOT,
                newsDir: path.join(ROOT, 'news'),
                publicBaseUrl: `http://localhost:${TEST_PORT}`,
                strictLiveVerification: true
            });

            const job = { contentId: 'CC-STAGE-01', variantId: 'v_stage', testMarker };
            const manifest = {
                slug: testSlug,
                contentId: 'CC-STAGE-01',
                variantId: 'v_stage',
                title: 'Automatyczny Test E2E Publikacji Staging',
                description: 'Artykuł weryfikacyjny z unikatowym znacznikiem treści wygenerowany przez adapter WWW.',
                testMarker
            };

            const prep = await adapter.prepare(job, manifest);
            const pub = await adapter.publish(job, prep.preparedPayload);

            assert.strictEqual(pub.success, true);
            assert.strictEqual(pub.state, 'PUBLISHED');
            assert.strictEqual(pub.source, 'FILESYSTEM_LIVE');

            // Sprawdzenie na dysku
            const singleFile = path.join(ROOT, 'news', `${testSlug}.html`);
            const cleanFile = path.join(ROOT, 'news', testSlug, 'index.html');

            assert.ok(fs.existsSync(singleFile), 'Plik .html musi istnieć!');
            assert.ok(fs.existsSync(cleanFile), 'Plik clean URL index.html musi istnieć!');

            const content = fs.readFileSync(singleFile, 'utf8');
            assert.ok(content.includes(testMarker), 'HTML musi zawierać unikatowy znacznik treści!');
        });

        // ─────────────────────────────────────────────────────────────
        // 2. NIEZALEŻNA WERYFIKACJA HTTP 200 NA ŚRODOWISKU TESTOWYM
        // ─────────────────────────────────────────────────────────────
        await test('Weryfikacja HTTP 200: Odpowiedź serwera testowego ze znacznikiem treści', async () => {
            const targetUrl = `http://localhost:${TEST_PORT}/news/${testSlug}`;
            const res = await fetchUrlNoCrossRedirect(targetUrl, 'localhost');

            assert.strictEqual(res.status, 200, 'Serwer testowy musi zwrócić kod HTTP 200');
            assert.ok(res.body.includes(testMarker), `Odpowiedź musi zawierać znacznik ${testMarker}`);
        });

        // ─────────────────────────────────────────────────────────────
        // 3. PANCERNA IDEMPOTENCJA I BRAK DUPLIKACJI
        // ─────────────────────────────────────────────────────────────
        await test('Idempotencja: Ponowne zlecenie zwraca istniejący jobId bez dublowania', async () => {
            const queue = new DistributionQueue({ persistencePath: persistenceFile });

            const job1 = queue.enqueueJob({
                contentId: 'CC-2026-STAGE',
                variantId: 'v1',
                platform: 'WWW',
                channelId: 'news-portal',
                manifestId: 'man_001'
            });

            const job2 = queue.enqueueJob({
                contentId: 'CC-2026-STAGE',
                variantId: 'v1',
                platform: 'WWW',
                channelId: 'news-portal',
                manifestId: 'man_001'
            });

            assert.strictEqual(job1.jobId, job2.jobId, 'Job ID musi być identyczny!');
            assert.strictEqual(queue.getAllJobs().length, 1, 'W kolejce może istnieć dokładnie 1 zadanie!');
        });

        // ─────────────────────────────────────────────────────────────
        // 4. HARMONOGRAM (SCHEDULING)
        // ─────────────────────────────────────────────────────────────
        await test('Harmonogram: Zadanie z przyszłą datą nie jest uruchamiane przedwcześnie', async () => {
            const queue = new DistributionQueue({ persistencePath: persistenceFile });
            const futureTime = new Date(Date.now() + 600000).toISOString(); // +10 minut

            const scheduledJob = queue.enqueueJob({
                contentId: 'CC-FUTURE-01',
                variantId: 'v1',
                platform: 'WWW',
                channelId: 'default',
                manifestId: 'man_future',
                scheduledAt: futureTime
            });

            const eligible = queue.getEligibleJobs();
            const isEligible = eligible.some(j => j.jobId === scheduledJob.jobId);
            assert.strictEqual(isEligible, false, 'Przyszłe zadanie nie może być w liście zadań do wykonania!');

            // Próba przetworzenia bez wymuszenia
            const processed = await queue.processJob(scheduledJob.jobId);
            assert.strictEqual(processed.status, 'QUEUED');
            assert.ok(processed.stateHistory.some(h => h.note.includes('oczekuje na nadejście zaplanowanego czasu')));
        });

        // ─────────────────────────────────────────────────────────────
        // 5. TRWAŁOŚĆ I CRASH RECOVERY PO RESTARTCIE PROCESU
        // ─────────────────────────────────────────────────────────────
        await test('Crash Recovery: Odzyskanie stanu kolejki i zadań PROCESSING po restarcie', async () => {
            // 1. Zapis stanu z zadaniem przerwanym w stanie PROCESSING (symulacja awarii serwera)
            const rawQueue = JSON.parse(fs.readFileSync(persistenceFile, 'utf8'));
            const crashedJobId = `dist_crashed_${Date.now()}`;
            rawQueue.jobs.push({
                jobId: crashedJobId,
                planId: 'plan_crash',
                contentId: 'CC-CRASH-01',
                variantId: 'v_crash',
                platform: 'WWW',
                channelId: 'default',
                status: 'PROCESSING',
                attempt: 1,
                maxAttempts: 3,
                idempotencyKey: 'crash_key_001',
                manifestId: 'man_crash',
                scheduledAt: new Date().toISOString(),
                stateHistory: [{ timestamp: new Date().toISOString(), state: 'PROCESSING', note: 'Przerwana próba' }]
            });
            fs.writeFileSync(persistenceFile, JSON.stringify(rawQueue, null, 2), 'utf8');

            // 2. Restart procesu — nowa instancja kolejki z tego samego pliku
            const restartedQueue = new DistributionQueue({ persistencePath: persistenceFile });
            const recoveredJob = restartedQueue.getJob(crashedJobId);

            assert.ok(recoveredJob, 'Zadanie musi zostać odczytane z pliku!');
            assert.strictEqual(recoveredJob.status, 'QUEUED', 'Stan zadania musi zostać przywrócony do QUEUED!');
            assert.ok(recoveredJob.stateHistory.some(h => h.note.includes('Crash Recovery')), 'Historia musi odnotować odzyskanie po restarcie');
        });

        // ─────────────────────────────────────────────────────────────
        // 6. POPRAWNA OBSŁUGA BŁĘDÓW I DEAD LETTER QUEUE
        // ─────────────────────────────────────────────────────────────
        await test('Obsługa Błędów: Błąd krytyczny trafia do Dead Letter Queue po wyczerpaniu prób', async () => {
            const queue = new DistributionQueue({ persistencePath: persistenceFile });
            
            // Rejestracja adaptera symulującego awarię nieponawialną
            queue.registerAdapter('WWW_FAULTY', {
                platform: 'WWW_FAULTY',
                version: '1.0',
                validate: async () => ({ valid: false, errors: ['BŁĄD_KRYTYCZNY_AUTORYZACJI'] }),
                prepare: async () => ({ ready: false }),
                publish: async () => ({ success: false }),
                verify: async () => ({ verified: false })
            });

            // Tworzymy rzeczywisty manifest
            const testContent = {
                contentId: 'CC-2026-FAIL01',
                type: 'ARTICLE',
                rights: { ownership: 'CC_OWNED', redistributionAllowed: true }
            };
            const testVariant = {
                variantId: 'v_fail_1',
                title: 'Błędny materiał testowy',
                description: 'Opis',
                status: 'APPROVED',
                variantHash: 'hash_fail_123'
            };
            const manifest = createPublicationManifest(
                testContent,
                testVariant,
                'WWW',
                'default',
                '1.0',
                'dowodca'
            );

            const failJob = queue.enqueueJob({
                contentId: 'CC-2026-FAIL01',
                variantId: 'v_fail_1',
                platform: 'WWW_FAULTY',
                channelId: 'default',
                manifestId: manifest.manifestId,
                maxAttempts: 1
            });

            const processed = await queue.processJob(failJob.jobId, { isAutomation: false });
            assert.strictEqual(processed.status, 'FAILED');
            assert.strictEqual(processed.errorCode, 'ADAPTER_VALIDATION_FAILED');
            assert.ok(processed.stateHistory.some(h => h.note.includes('Dead Letter Queue')));
            assert.ok(queue.getDeadLetterJobs().some(d => d.jobId === failJob.jobId));
        });

    } finally {
        testServer.close();
        if (fs.existsSync(persistenceFile)) {
            fs.unlinkSync(persistenceFile);
        }
        const singleFile = path.join(ROOT, 'news', `${testSlug}.html`);
        const cleanFile = path.join(ROOT, 'news', testSlug, 'index.html');
        const cleanDir = path.join(ROOT, 'news', testSlug);
        if (fs.existsSync(singleFile)) fs.unlinkSync(singleFile);
        if (fs.existsSync(cleanFile)) fs.unlinkSync(cleanFile);
        if (fs.existsSync(cleanDir)) fs.rmdirSync(cleanDir);
    }

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log(`📊 WYNIK SUITE P0 E2E STAGE: ${passed} PASS / ${failed} FAIL`);
    console.log('═══════════════════════════════════════════════════════════════\n');

    if (failed > 0) process.exit(1);
}

runSuite().catch(err => {
    console.error('BŁĄD KRYTYCZNY SUITE:', err);
    process.exit(1);
});
