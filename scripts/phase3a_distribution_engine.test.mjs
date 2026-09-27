/**
 * ══════════════════════════════════════════════════════════════════════════
 * SUITE TESTÓW REGRESYJNYCH FAZY 3A: CC GLOBAL DISTRIBUTION ENGINE
 * Standard Architektury: MASTER PLAN CC GLOBAL 2030 (FAZA 3A)
 * Dyrektywy 68-74, 80: Kontrakty adapterów, Idempotencja, Rights Gate,
 * Manifest, Kill Switch, Quota, Partial Failure, Dead Letter, Crash Recovery
 * ══════════════════════════════════════════════════════════════════════════
 */

import assert from 'assert';
import crypto from 'crypto';
import {
    PLATFORM_CAPABILITIES,
    isDistributionAllowed,
    setKillSwitchState,
    getKillSwitchState,
    validateDistributionRights,
    calculateVariantHash,
    createPublicationManifest,
    getPublicationManifest,
    DistributionQueue,
    DistributionOrchestrator,
    YouTubeDistributionAdapter,
    LuminaDistributionAdapter,
    WwwDistributionAdapter,
    WhatsAppDistributionAdapter,
    BitChuteDistributionAdapter,
    RadioDistributionAdapter,
    FacebookDistributionAdapter
} from '../lib/cc-content-core/index.js';

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

// Dane referencyjne do testów (Golden Record CC-2026-000001)
function getMockMasterContent(overrides = {}) {
    return {
        contentId: 'CC-2026-000001',
        title: 'Słowa Mają Moc: Siła w ciszy i zaufaniu',
        teaser: 'Prawdziwa siła nie krzyczy — rodzi się w ciszy i zaufaniu Bogu.',
        type: 'DEVOTIONAL',
        rights: {
            ownership: 'CC_OWNED',
            translationAllowed: true,
            editingAllowed: true,
            redistributionAllowed: true,
            monetizationAllowed: false,
            audioAllowed: true,
            licenseName: 'Christian Culture Standard CC-BY-NC-ND 4.0'
        },
        assets: [
            { assetId: 'video_render_1080p', type: 'VIDEO', checksum: 'hash_video_123' },
            { assetId: 'audio_tts_pl', type: 'AUDIO', checksum: 'hash_audio_456' }
        ],
        ...overrides
    };
}

function getMockApprovedVariant(overrides = {}) {
    const fullText = 'W ciszy i zaufaniu leży wasza siła. (Izajasz 30:15, UBG)\n\nOdwiedź https://polskieradio.cc';
    const approvedContentHash = calculateVariantHash(fullText);
    return {
        variantId: 'var_pl_web',
        language: 'pl',
        title: 'Słowa Mają Moc: Siła w ciszy i zaufaniu',
        teaser: 'Prawdziwa siła nie krzyczy.',
        fullText,
        approvedContentHash,
        status: 'APPROVED',
        ...overrides
    };
}

async function main() {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('   🚀 SUITE TESTÓW FAZY 3A: CC GLOBAL DISTRIBUTION ENGINE');
    console.log('═══════════════════════════════════════════════════════════════\n');

    // ─────────────────────────────────────────────────────────────
    // TEST 1: RIGHTS GATE — BLOKADA WARIANTÓW NIEZATWIERDZONYCH (Pkt 2)
    // ─────────────────────────────────────────────────────────────
    await test('Rights Gate: Wariant ze statusem REVIEW_REQUIRED lub DRAFT jest bezwzględnie blokowany', async () => {
        const content = getMockMasterContent();
        const unapprovedVariant = getMockApprovedVariant({ status: 'REVIEW_REQUIRED' });

        const result = validateDistributionRights(content, unapprovedVariant, 'LUMINA');
        assert.strictEqual(result.allowed, false);
        assert.strictEqual(result.code, 'VARIANT_NOT_APPROVED');
        assert.ok(result.reason.includes('APPROVED'));
    });

    // ─────────────────────────────────────────────────────────────
    // TEST 2: RIGHTS GATE — MUTATION AFTER APPROVAL GUARD (Pkt 39)
    // ─────────────────────────────────────────────────────────────
    await test('Rights Gate: Zmiana tekstu po zatwierdzeniu (hash mismatch) blokuje dystrybucję', async () => {
        const content = getMockMasterContent();
        // Wariant, którego treść została zmieniona po zatwierdzeniu bez ponownego wyliczenia hash
        const mutatedVariant = getMockApprovedVariant({
            fullText: 'Zmodyfikowany nieautoryzowany tekst po approval!'
        });

        const result = validateDistributionRights(content, mutatedVariant, 'LUMINA');
        assert.strictEqual(result.allowed, false);
        assert.strictEqual(result.code, 'VARIANT_MUTATED_AFTER_APPROVAL');
        assert.ok(result.violations.includes('CONTENT_HASH_MISMATCH'));
    });

    // ─────────────────────────────────────────────────────────────
    // TEST 3: RIGHTS GATE — BRAK PRAW DO REDYSTRYBUCJI / OWNERSHIP UNKNOWN (Pkt 3)
    // ─────────────────────────────────────────────────────────────
    await test('Rights Gate: ownership UNKNOWN lub brak redistributionAllowed blokuje platformy zewnętrzne', async () => {
        const contentUnknown = getMockMasterContent({
            rights: { ownership: 'UNKNOWN', redistributionAllowed: false }
        });
        const variant = getMockApprovedVariant();

        const resYoutube = validateDistributionRights(contentUnknown, variant, 'YOUTUBE');
        assert.strictEqual(resYoutube.allowed, false);
        assert.strictEqual(resYoutube.code, 'RIGHTS_GATE_BLOCKED');
        assert.ok(resYoutube.violations.some(v => v.includes('OWNERSHIP_UNKNOWN')));
        assert.ok(resYoutube.violations.some(v => v.includes('REDISTRIBUTION_DISALLOWED')));
    });

    // ─────────────────────────────────────────────────────────────
    // TEST 4: PUBLICATION MANIFEST IMMUTABILITY (Pkt 37, 38)
    // ─────────────────────────────────────────────────────────────
    await test('Publication Manifest: Niezmienny snapshot zamraża hash wariantu, zasoby i prawa', async () => {
        const content = getMockMasterContent();
        const variant = getMockApprovedVariant();

        const manifest = createPublicationManifest(content, variant, 'YOUTUBE', 'UC_PILOT_CC_MAIN', '2026.3-youtube-official', 'test_dowodca');
        
        assert.ok(manifest.manifestId.startsWith('pubm_'));
        assert.strictEqual(manifest.variantHash, variant.approvedContentHash);
        assert.ok(manifest.assetIds.includes('video_render_1080p'));
        assert.ok(Object.isFrozen(manifest), 'Manifest musi być zamrożonym obiektem (Object.isFrozen)');

        // Pobranie z rejestru
        const retrieved = getPublicationManifest(manifest.manifestId);
        assert.strictEqual(retrieved.manifestId, manifest.manifestId);
    });

    // ─────────────────────────────────────────────────────────────
    // TEST 5: KILL SWITCH & AUTOMATION OFF (Pkt 45, 46)
    // ─────────────────────────────────────────────────────────────
    await test('Kill Switch: Domyślny stan Fazy 3A (AUTOMATION_OFF) blokuje automatyczne wywołania', async () => {
        // Domyślny stan Fazy 3A ma automationOff: true
        setKillSwitchState({ automationOff: true, globalOff: false }, 'test', 'Test Kill Switch');
        
        const autoCheck = isDistributionAllowed('YOUTUBE', 'UC_PILOT_CC_MAIN', true);
        assert.strictEqual(autoCheck.allowed, false);
        assert.ok(autoCheck.reason.includes('AUTOMATION_OFF'));

        // Wywołanie manualne (operator) jest dopuszczone
        const manualCheck = isDistributionAllowed('YOUTUBE', 'UC_PILOT_CC_MAIN', false);
        assert.strictEqual(manualCheck.allowed, true);

        // Global Kill Switch wyłącza również operatora
        setKillSwitchState({ globalOff: true }, 'test', 'Emergency stop');
        const emergencyCheck = isDistributionAllowed('YOUTUBE', 'UC_PILOT_CC_MAIN', false);
        assert.strictEqual(emergencyCheck.allowed, false);
        assert.ok(emergencyCheck.reason.includes('GLOBAL_KILL_SWITCH_ACTIVE'));

        // Reset do stanu testowego
        setKillSwitchState({ globalOff: false, automationOff: false }, 'test', 'Test reset');
    });

    // ─────────────────────────────────────────────────────────────
    // TEST 6: YOUTUBE PRIORITY ADAPTER — RESUMABLE, PILOT SAFETY & PROCESSING (Pkt 12-22)
    // ─────────────────────────────────────────────────────────────
    await test('YouTube Adapter: Pilot Safety odrzuca PUBLIC, obsługuje PRIVATE i cykl UPLOADED -> PROCESSING -> VERIFIED', async () => {
        const adapter = new YouTubeDistributionAdapter();
        const content = getMockMasterContent();
        const variant = getMockApprovedVariant();
        const manifest = createPublicationManifest(content, variant, 'YOUTUBE', 'UC_PILOT_CC_MAIN', adapter.version, 'dowodca');

        // A. Pilot Safety: Próba uploadu w trybie PUBLIC jest zablokowana
        const unsafeJob = { visibility: 'PUBLIC', idempotencyKey: 'key_unsafe' };
        const valUnsafe = await adapter.validate(unsafeJob, manifest);
        assert.strictEqual(valUnsafe.valid, false);
        assert.ok(valUnsafe.errors.some(e => e.includes('YOUTUBE_PILOT_SAFETY_VIOLATION')));

        // B. Poprawny bezpieczny upload PRIVATE
        const safeJob = { visibility: 'PRIVATE', idempotencyKey: 'key_safe_123' };
        const valSafe = await adapter.validate(safeJob, manifest);
        assert.strictEqual(valSafe.valid, true);

        const prep = await adapter.prepare(safeJob, manifest);
        assert.strictEqual(prep.preparedPayload.status.privacyStatus, 'private');

        const pubResult = await adapter.publish(safeJob, prep.preparedPayload);
        assert.strictEqual(pubResult.success, true);
        assert.strictEqual(pubResult.state, 'UPLOADED');
        assert.ok(pubResult.remoteId.startsWith('yt_pilot_'));

        // C. verify() przed zakończeniem przetwarzania zwraca PROCESSING_PENDING (nie VERIFIED!)
        const verBefore = await adapter.verify(pubResult.remoteId);
        assert.strictEqual(verBefore.verified, false);
        assert.strictEqual(verBefore.status, 'PROCESSING_PENDING');

        // D. Symulacja zakończenia przetwarzania w YouTube API
        adapter.completePlatformProcessing(pubResult.remoteId);

        // E. verify() po zakończeniu kodowania zwraca VERIFIED
        const verAfter = await adapter.verify(pubResult.remoteId);
        assert.strictEqual(verAfter.verified, true);
        assert.strictEqual(verAfter.status, 'ACTIVE');
    });

    // ─────────────────────────────────────────────────────────────
    // TEST 7: LUMINA ADAPTER — POST PUBLISHING & IDEMPOTENCY (Pkt 23, 24)
    // ─────────────────────────────────────────────────────────────
    await test('Lumina Adapter: Publikacja posta z deterministycznym ID i weryfikacja istnienia', async () => {
        const adapter = new LuminaDistributionAdapter();
        const content = getMockMasterContent();
        const variant = getMockApprovedVariant();
        const manifest = createPublicationManifest(content, variant, 'LUMINA', 'tablica', adapter.version, 'dowodca');

        const job = { idempotencyKey: 'lumina_key_1', contentId: content.contentId, variantId: variant.variantId };
        const prep = await adapter.prepare(job, manifest);
        
        const pub = await adapter.publish(job, prep.preparedPayload);
        assert.strictEqual(pub.success, true);
        assert.strictEqual(pub.state, 'PUBLISHED');
        assert.ok(pub.publicUrl.includes('lumina-tablica.html'));

        // Weryfikacja DOCUMENT EXISTS CHECK
        const ver = await adapter.verify(pub.remoteId);
        assert.strictEqual(ver.verified, true);
        assert.strictEqual(ver.status, 'EXISTS');

        // Ponowna publikacja zwraca istniejący rekord bez duplikowania (Idempotency)
        const rePub = await adapter.publish(job, prep.preparedPayload);
        assert.strictEqual(rePub.remoteId, pub.remoteId);
        assert.ok(rePub.note.includes('Idempotency hit'));
    });

    // ─────────────────────────────────────────────────────────────
    // TEST 8: WHATSAPP BRIDGE — STATUS SENT (BRAK FAŁSZYWEGO VERIFIED) (Pkt 27-29)
    // ─────────────────────────────────────────────────────────────
    await test('WhatsApp Bridge: Dispatch ACK daje status SENT, a verify() nie zwraca fałszywego VERIFIED', async () => {
        const adapter = new WhatsAppDistributionAdapter();
        const content = getMockMasterContent();
        const variant = getMockApprovedVariant();
        const manifest = createPublicationManifest(content, variant, 'WHATSAPP', 'grupa_nazira', adapter.version, 'dowodca');

        const job = { idempotencyKey: 'wa_key_1', channelId: 'grupa_nazira' };
        const prep = await adapter.prepare(job, manifest);

        const pub = await adapter.publish(job, prep.preparedPayload);
        assert.strictEqual(pub.success, true);
        assert.ok(pub.remoteId.startsWith('wa_ack_'));

        // Pkt 29: Status publikacji to SENT (Dispatch ACK), a NIGDY VERIFIED!
        const ver = await adapter.verify(pub.remoteId);
        assert.strictEqual(ver.verified, false);
        assert.strictEqual(ver.status, 'SENT');
    });

    // ─────────────────────────────────────────────────────────────
    // TEST 9: BITCHUTE MANUAL-ASSISTED PACKAGE GENERATION (Pkt 30-32)
    // ─────────────────────────────────────────────────────────────
    await test('BitChute Adapter: Generowanie pełnej paczki dla operatora i potwierdzenie linku', async () => {
        const adapter = new BitChuteDistributionAdapter();
        const content = getMockMasterContent();
        const variant = getMockApprovedVariant();
        const manifest = createPublicationManifest(content, variant, 'BITCHUTE', 'default', adapter.version, 'dowodca');

        const job = { contentId: content.contentId, variantId: variant.variantId };
        const prep = await adapter.prepare(job, manifest);

        assert.ok(prep.preparedPayload.tags.includes('ChristianCulture'));
        assert.ok(prep.preparedPayload.sourceAttribution.length > 0);

        const pub = await adapter.publish(job, prep.preparedPayload);
        assert.strictEqual(pub.state, 'MANUAL_ACTION_REQUIRED');

        // Operator publikuje i wprowadza link
        adapter.confirmManualPublication(pub.remoteId, 'https://www.bitchute.com/video/abc123xyz/');
        
        const ver = await adapter.verify('abc123xyz');
        assert.strictEqual(ver.verified, true);
        assert.strictEqual(ver.status, 'CONFIRMED_BY_OPERATOR');
    });

    // ─────────────────────────────────────────────────────────────
    // TEST 10: RADIO PREPARE ONLY BUFFER (Pkt 34)
    // ─────────────────────────────────────────────────────────────
    await test('Radio Adapter: PREPARE ONLY generuje metadane audycji w buforze bez ruszania ramówki', async () => {
        const adapter = new RadioDistributionAdapter();
        const content = getMockMasterContent();
        const variant = getMockApprovedVariant();
        const manifest = createPublicationManifest(content, variant, 'RADIO', 'glowna', adapter.version, 'dowodca');

        const job = { contentId: content.contentId, variantId: variant.variantId };
        const prep = await adapter.prepare(job, manifest);
        assert.strictEqual(prep.preparedPayload.radioCategory, 'SLOWO_BOZE_ROZWAZANIE');
        assert.strictEqual(prep.preparedPayload.duration, 180);

        const pub = await adapter.publish(job, prep.preparedPayload);
        assert.strictEqual(pub.state, 'READY'); // W buforze
        
        const ver = await adapter.verify(pub.remoteId);
        assert.strictEqual(ver.status, 'PREPARED_IN_BUFFER');
    });

    // ─────────────────────────────────────────────────────────────
    // TEST 11: IDEMPOTENCY & DUPLICATE PREVENTION (Pkt 9, 71)
    // ─────────────────────────────────────────────────────────────
    await test('Queue Idempotency: Podwójne zlecenie tego samego joba zwraca identyczny jobId bez dublowania', async () => {
        const queue = new DistributionQueue();
        const content = getMockMasterContent();
        const variant = getMockApprovedVariant();
        const manifest = createPublicationManifest(content, variant, 'LUMINA', 'tablica', '2026.3', 'dowodca');

        const job1 = queue.enqueueJob({
            planId: 'plan_1',
            contentId: content.contentId,
            variantId: variant.variantId,
            platform: 'LUMINA',
            channelId: 'tablica',
            manifestId: manifest.manifestId,
            publicationIntent: 'test_idempotency'
        });

        const job2 = queue.enqueueJob({
            planId: 'plan_1',
            contentId: content.contentId,
            variantId: variant.variantId,
            platform: 'LUMINA',
            channelId: 'tablica',
            manifestId: manifest.manifestId,
            publicationIntent: 'test_idempotency'
        });

        assert.strictEqual(job1.jobId, job2.jobId, 'Job ID musi być identyczny');
        assert.strictEqual(job1.idempotencyKey, job2.idempotencyKey);
        assert.strictEqual(queue.getAllJobs().length, 1, 'Kolejka może posiadać dokładnie 1 zadanie');
    });

    // ─────────────────────────────────────────────────────────────
    // TEST 12: PARTIAL FAILURE & DISTRIBUTION ORCHESTRATOR (Pkt 73, 50-51)
    // ─────────────────────────────────────────────────────────────
    await test('Orchestrator: Błąd jednej platformy skutkuje statusem PARTIAL_SUCCESS i buduje macierz statusów', async () => {
        const orchestrator = new DistributionOrchestrator();
        const content = getMockMasterContent();
        const variant = getMockApprovedVariant();

        // Tworzymy plan z 3 platformami: LUMINA (sukces), WWW (sukces), FACEBOOK (disabled -> fail)
        const plan = orchestrator.createPlan(content, variant, {
            platforms: ['LUMINA', 'WWW', 'FACEBOOK'],
            approvedForDistribution: true,
            visibility: 'PRIVATE'
        }, 'dowodca');

        assert.strictEqual(plan.status, 'APPROVED_FOR_DISTRIBUTION');
        assert.strictEqual(plan.jobIds.length, 3);

        const execResult = await orchestrator.executePlan(plan.planId, { isAutomation: false });
        
        // Pkt 73: Plan nie może udawać SUCCESS, gdy Facebook zawiódł!
        assert.strictEqual(execResult.plan.status, 'PARTIAL_SUCCESS');
        assert.strictEqual(execResult.successes, 2);
        assert.strictEqual(execResult.failures, 1);

        // Pkt 50/51: Macierz statusów
        const matrix = orchestrator.getGlobalDistributionMatrix(content.contentId);
        assert.strictEqual(matrix['pl']['LUMINA'], 'VERIFIED');
        assert.strictEqual(matrix['pl']['WWW'], 'READY');
        assert.strictEqual(matrix['pl']['YOUTUBE'], 'NOT_CONFIGURED');
    });

    // ─────────────────────────────────────────────────────────────
    // TEST 13: CRASH RECOVERY TEST (Pkt 72)
    // ─────────────────────────────────────────────────────────────
    await test('Crash Recovery: Awaria przed zapisem lokalnym odzyskuje stan na podstawie klucza idempotencji', async () => {
        const queue = new DistributionQueue();
        const youtubeAdapter = new YouTubeDistributionAdapter();
        const content = getMockMasterContent();
        const variant = getMockApprovedVariant();
        const manifest = createPublicationManifest(content, variant, 'YOUTUBE', 'UC_PILOT_CC_MAIN', youtubeAdapter.version, 'dowodca');

        const job = queue.enqueueJob({
            planId: 'plan_crash',
            contentId: content.contentId,
            variantId: variant.variantId,
            platform: 'YOUTUBE',
            channelId: 'UC_PILOT_CC_MAIN',
            manifestId: manifest.manifestId,
            publicationIntent: 'crash_test'
        });

        // 1. Wykonanie uploadu w adapterze (wideo trafiło na YouTube)
        const prep = await youtubeAdapter.prepare(job, manifest);
        const pub1 = await youtubeAdapter.publish(job, prep.preparedPayload);
        const remoteVideoId = pub1.remoteId;

        // 2. Symulacja crasha: klient nie zdążył zaktualizować rekordu job
        // 3. Po restarcie/retry, adapter odnajduje istniejące wideo po idempotencyKey
        const pub2 = await youtubeAdapter.publish(job, prep.preparedPayload);
        assert.strictEqual(pub2.remoteId, remoteVideoId, 'Nie wolno utworzyć drugiego filmu');
        assert.ok(pub2.note.includes('Idempotency match'));
    });

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log(`📊 WYNIK SUITE FAZY 3A: ${passed} PASS / ${failed} FAIL`);
    console.log('═══════════════════════════════════════════════════════════════\n');

    if (failed > 0) process.exit(1);
    process.exit(0);
}

main().catch(err => {
    console.error('Krytyczny błąd testów Fazy 3A:', err);
    process.exit(1);
});
