/**
 * ══════════════════════════════════════════════════════════════════════════
 * CC GLOBAL OBSERVER & MISSION INTELLIGENCE — COMPREHENSIVE TEST SUITE (FAZA 4)
 * Standard Architektury: MASTER PLAN CC GLOBAL 2030 (FAZA 4)
 * ══════════════════════════════════════════════════════════════════════════
 * Dyrektywa 88 — Kompletny zestaw testów jakościowych i bezpieczeństwa:
 * 1. Model Zdarzeń i Migawki (Privacy Guard & No PII)
 * 2. Kontrakt Obserwatora (Security Guard — Read-Only, Zero Publish/Cancel)
 * 3. Warstwa Normalizacji i Zero Fake Metrics (NOT_AVAILABLE vs 0)
 * 4. Deduplikacja i Ochrona Przed Podwójnym Liczeniem (Idempotency)
 * 5. Delta Engine i Korekty Platform (SOURCE_CORRECTION dla spadków)
 * 6. Wyliczanie Świeżości Danych (LIVE, <15 MIN, <1 H, STALE)
 * 7. Rejestr Zdrowia Systemu i Incydentów (10 Komponentów, Izolacja)
 * 8. Lejek Misyjny (7 Faz Produktowych, Zero Fałszywych Deklaracji)
 * 9. Analiza Językowa i Próg INSUFFICIENT DATA (min. 100 zdarzeń)
 * 10. Obserwatory Platformowe (YouTube, LUMINA, WWW, Radio, WhatsApp, BitChute, FB)
 * 11. Częściowa Obserwowalność i Izolacja Awarii (Failure Isolation)
 * 12. Generowanie Rollupów i Eksport Danych Bez PII (JSON i CSV)
 * ══════════════════════════════════════════════════════════════════════════
 */

import assert from 'assert';
import crypto from 'crypto';

import {
    ALLOWED_METRIC_TYPES,
    ALLOWED_VERIFICATION_LEVELS,
    createAnalyticsEvent,
    createAnalyticsSnapshot,
    calculateSnapshotDelta,
    generateRollup,
    calculateGlobalReach,
    buildMissionFunnel,
    compareLanguages,
    IncidentRegistry,
    BaseObserver,
    NormalizationLayer,
    YouTubeObserver,
    LuminaObserver,
    WwwObserver,
    RadioObserver,
    WhatsAppObserver,
    BitChuteObserver,
    FacebookObserver,
    ObserverOrchestrator
} from '../lib/cc-content-core/index.js';

let passedTests = 0;
let failedTests = 0;

function test(name, fn) {
    try {
        fn();
        console.log(`  ✅ [PASS] ${name}`);
        passedTests++;
    } catch (err) {
        console.error(`  ❌ [FAIL] ${name}`);
        console.error(`     Błąd: ${err.message}`);
        failedTests++;
    }
}

async function testAsync(name, fn) {
    try {
        await fn();
        console.log(`  ✅ [PASS] ${name}`);
        passedTests++;
    } catch (err) {
        console.error(`  ❌ [FAIL] ${name}`);
        console.error(`     Błąd: ${err.message}`);
        failedTests++;
    }
}

console.log('\n══════════════════════════════════════════════════════════════════════════');
console.log('🧪 URUCHAMIANIE TESTÓW FAZY 4: CC GLOBAL OBSERVER & MISSION INTELLIGENCE');
console.log('══════════════════════════════════════════════════════════════════════════\n');

// ──────────────────────────────────────────────────────────────────────────
// TEST 1: Model Zdarzeń, Migawki i Privacy Guard (Dyrektywy 6, 18, 20)
// ──────────────────────────────────────────────────────────────────────────
console.log('📦 1. ANALYTICS MODEL & PRIVACY GUARD');

test('Poprawne tworzenie zdarzenia analitycznego z walidacją', () => {
    const event = createAnalyticsEvent({
        contentId: 'CC-2026-000001',
        variantId: 'var_pl_web',
        platform: 'LUMINA',
        metricType: 'VIEW',
        metricValue: 1,
        language: 'pl',
        verificationLevel: 'PLATFORM_API'
    });

    assert.ok(event.eventId.startsWith('evt_'));
    assert.strictEqual(event.contentId, 'CC-2026-000001');
    assert.strictEqual(event.metricType, 'VIEW');
    assert.strictEqual(event.metricValue, 1);
    assert.strictEqual(event.verificationLevel, 'PLATFORM_API');
    assert.ok(event.deduplicationKey);
});

test('Odrzucenie zdarzenia z nieprawidłowym lub brakującym metricType', () => {
    assert.throws(() => {
        createAnalyticsEvent({
            contentId: 'CC-2026-000001',
            metricType: 'INVALID_METRIC_XYZ',
            metricValue: 10
        });
    }, /Nieobsługiwany lub brakujący metricType/);
});

test('Privacy Guard: Automatyczne usuwanie PII ze zdarzenia analitycznego', () => {
    const event = createAnalyticsEvent({
        contentId: 'CC-2026-000001',
        metricType: 'COMMENT',
        metricValue: 1,
        metadata: {
            userEmail: 'user@example.com',
            userName: 'Jan Kowalski',
            userPhone: '+48123456789',
            ipAddress: '192.168.1.1',
            safeTopic: 'Faith'
        }
    });

    // PII powinno zostać usunięte
    assert.strictEqual(event.metadata.userEmail, undefined);
    assert.strictEqual(event.metadata.userName, undefined);
    assert.strictEqual(event.metadata.userPhone, undefined);
    assert.strictEqual(event.metadata.ipAddress, undefined);
    // Bezpieczne metadane powinny pozostać
    assert.strictEqual(event.metadata.safeTopic, 'Faith');
});

test('Poprawne tworzenie migawki (Snapshot) z oknem deduplikacji', () => {
    const snapshot = createAnalyticsSnapshot({
        contentId: 'CC-2026-000001',
        platform: 'YOUTUBE',
        channelId: 'UC_PILOT_CC_MAIN',
        cumulativeMetrics: {
            views: 450,
            likes: 32,
            comments: 8
        },
        windowStart: '2026-09-26T00:00:00.000Z',
        windowEnd: '2026-09-26T12:00:00.000Z'
    });

    assert.ok(snapshot.snapshotId.startsWith('snp_'));
    assert.strictEqual(snapshot.cumulativeMetrics.views, 450);
    assert.ok(snapshot.deduplicationKey);
});

// ──────────────────────────────────────────────────────────────────────────
// TEST 2: Kontrakt Obserwatora i Security Guard (Dyrektywa 4)
// ──────────────────────────────────────────────────────────────────────────
console.log('\n🛡️ 2. OBSERVER CONTRACT & SECURITY GUARD (READ-ONLY)');

test('BaseObserver blokuje wszelkie próby publikacji, anulowania i harmonogramowania', () => {
    const observer = new BaseObserver('TEST_PLATFORM');

    assert.throws(() => {
        observer.publish();
    }, /OBSERVER_SECURITY_VIOLATION/);

    assert.throws(() => {
        observer.cancel();
    }, /OBSERVER_SECURITY_VIOLATION/);

    assert.throws(() => {
        observer.reschedule();
    }, /OBSERVER_SECURITY_VIOLATION/);
});

// ──────────────────────────────────────────────────────────────────────────
// TEST 3: Warstwa Normalizacji i Zero Fake Metrics (Dyrektywa 8, 23)
// ──────────────────────────────────────────────────────────────────────────
console.log('\n⚖️ 3. NORMALIZATION LAYER & ZERO FAKE METRICS');

test('NormalizationLayer oznacza brakujące metryki jako NOT_AVAILABLE, nie fejkowe 0', () => {
    const rawData = {
        views: 120,
        // brak watchTime, brak shares
        likes: null
    };

    const normalized = NormalizationLayer.normalizePlatformMetrics('SAMPLE_PLATFORM', rawData, {
        contentId: 'CC-2026-000001'
    });

    assert.strictEqual(normalized.metrics.views, 120);
    assert.ok(normalized.notAvailableMetrics.includes('watchTimeSeconds'));
    assert.ok(normalized.notAvailableMetrics.includes('shares'));
    assert.ok(normalized.notAvailableMetrics.includes('likes'));
});

test('NormalizationLayer poprawnie zachowuje autentyczne 0 bez flagowania jako brak danych', () => {
    const rawData = {
        views: 0, // autentyczne zero odsłon
        comments: 0
    };

    const normalized = NormalizationLayer.normalizePlatformMetrics('SAMPLE_PLATFORM', rawData, {
        contentId: 'CC-2026-000001'
    });

    assert.strictEqual(normalized.metrics.views, 0);
    assert.strictEqual(normalized.metrics.comments, 0);
    assert.ok(!normalized.notAvailableMetrics.includes('views'));
    assert.ok(!normalized.notAvailableMetrics.includes('comments'));
});

// ──────────────────────────────────────────────────────────────────────────
// TEST 4: Deduplikacja i Ochrona Przed Podwójnym Liczeniem (Dyrektywa 10)
// ──────────────────────────────────────────────────────────────────────────
console.log('\n🔁 4. DEDUPLICATION & IDEMPOTENCY ENGINE');

test('Identyczne zdarzenia generują ten sam deduplicationKey i są odrzucane przez Orchestrator', async () => {
    const orchestrator = new ObserverOrchestrator();

    const event1 = createAnalyticsEvent({
        contentId: 'CC-2026-000001',
        variantId: 'var_pl_web',
        platform: 'LUMINA',
        metricType: 'VIEW',
        metricValue: 1,
        occurredAt: '2026-09-26T12:00:00.000Z'
    });

    const event2 = createAnalyticsEvent({
        contentId: 'CC-2026-000001',
        variantId: 'var_pl_web',
        platform: 'LUMINA',
        metricType: 'VIEW',
        metricValue: 1,
        occurredAt: '2026-09-26T12:00:00.000Z'
    });

    assert.strictEqual(event1.deduplicationKey, event2.deduplicationKey);

    const res1 = orchestrator.ingestEvent(event1);
    const res2 = orchestrator.ingestEvent(event2);

    assert.strictEqual(res1.status, 'INGESTED');
    assert.strictEqual(res2.status, 'DUPLICATE_IGNORED');
    assert.strictEqual(orchestrator.eventsStore.size, 1);
});

// ──────────────────────────────────────────────────────────────────────────
// TEST 5: Delta Engine i Korekty Platform (Dyrektywy 13, 83)
// ──────────────────────────────────────────────────────────────────────────
console.log('\n📈 5. DELTA ENGINE & SOURCE CORRECTION (NEGATIVE DELTAS)');

test('Standardowy przyrost liczników platformy (Standard Delta)', () => {
    const prev = createAnalyticsSnapshot({
        contentId: 'CC-2026-000001',
        platform: 'YOUTUBE',
        cumulativeMetrics: { views: 1000 }
    });

    const curr = createAnalyticsSnapshot({
        contentId: 'CC-2026-000001',
        platform: 'YOUTUBE',
        cumulativeMetrics: { views: 1150 }
    });

    const deltas = calculateSnapshotDelta(prev, curr);
    assert.strictEqual(deltas.views.delta, 150);
    assert.strictEqual(deltas.views.type, 'STANDARD');
});

test('Korekta platformy w dół (np. YouTube usunął fałszywe wyświetlenia: 1000 -> 995) oznaczana jako SOURCE_CORRECTION', () => {
    const prev = createAnalyticsSnapshot({
        contentId: 'CC-2026-000001',
        platform: 'YOUTUBE',
        cumulativeMetrics: { views: 1000 }
    });

    const curr = createAnalyticsSnapshot({
        contentId: 'CC-2026-000001',
        platform: 'YOUTUBE',
        cumulativeMetrics: { views: 995 }
    });

    const deltas = calculateSnapshotDelta(prev, curr);
    assert.strictEqual(deltas.views.delta, -5);
    assert.strictEqual(deltas.views.type, 'SOURCE_CORRECTION');
    assert.ok(deltas.views.isNegativeCorrection);
});

test('Wykrycie zresetowania licznika (Counter Reset: 1000 -> 2)', () => {
    const prev = createAnalyticsSnapshot({
        contentId: 'CC-2026-000001',
        platform: 'TEST_STREAM',
        cumulativeMetrics: { views: 1000 }
    });

    const curr = createAnalyticsSnapshot({
        contentId: 'CC-2026-000001',
        platform: 'TEST_STREAM',
        cumulativeMetrics: { views: 2 }
    });

    const deltas = calculateSnapshotDelta(prev, curr);
    assert.strictEqual(deltas.views.type, 'COUNTER_RESET');
});

// ──────────────────────────────────────────────────────────────────────────
// TEST 6: Wyliczanie Świeżości Danych (Dyrektywy 57, 58)
// ──────────────────────────────────────────────────────────────────────────
console.log('\n⏱️ 6. DATA FRESHNESS CALCULATION');

test('Prawidłowa klasyfikacja świeżości danych od LIVE do STALE', () => {
    const registry = new IncidentRegistry();

    const now = new Date();
    const tenMinAgo = new Date(now.getTime() - 10 * 60 * 1000).toISOString();
    const fortyMinAgo = new Date(now.getTime() - 40 * 60 * 1000).toISOString();
    const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString();

    assert.strictEqual(registry.calculateFreshness(now.toISOString()), 'LIVE');
    assert.strictEqual(registry.calculateFreshness(tenMinAgo), '<15 MIN');
    assert.strictEqual(registry.calculateFreshness(fortyMinAgo), '<1 H');
    assert.strictEqual(registry.calculateFreshness(twoDaysAgo), 'STALE');
    assert.strictEqual(registry.calculateFreshness(null), 'UNKNOWN');
});

// ──────────────────────────────────────────────────────────────────────────
// TEST 7: Rejestr Zdrowia Systemu i Incydentów (Dyrektywy 49-56, 82)
// ──────────────────────────────────────────────────────────────────────────
console.log('\n🏥 7. SYSTEM HEALTH & INCIDENT REGISTRY (10 SUBSYSTEMS)');

test('Rejestracja 10 kluczowych komponentów i raportowanie incydentów', () => {
    const registry = new IncidentRegistry();
    const all = registry.getAllComponentsHealth();
    assert.strictEqual(Object.keys(all).length, 10);

    // Wstępny stan
    const initHealth = registry.getComponentHealth('youtube_adapter');
    assert.strictEqual(initHealth.status, 'HEALTHY');

    // Zgłoszenie incydentu na YouTube Adapter (np. zbliżenie do limitu Quota)
    const incident = registry.reportIncident({
        component: 'youtube_adapter',
        severity: 'DEGRADED',
        title: 'Zbliżenie do dziennego limitu Quota YouTube',
        description: 'Wykorzystano 85% dziennej puli granularnej.'
    });

    assert.ok(incident.incidentId.startsWith('inc_'));
    const updated = registry.getComponentHealth('youtube_adapter');
    assert.strictEqual(updated.status, 'DEGRADED');

    // Rozwiązanie incydentu
    registry.resolveIncident(incident.incidentId, 'Quota zresetowana po północy UTC.');
    const resolvedHealth = registry.getComponentHealth('youtube_adapter');
    assert.strictEqual(resolvedHealth.status, 'HEALTHY');
});

// ──────────────────────────────────────────────────────────────────────────
// TEST 8: Lejek Misyjny (Mission Funnel - Dyrektywy 33-35)
// ──────────────────────────────────────────────────────────────────────────
console.log('\n🎯 8. MISSION FUNNEL ENGINE (7 OBSERVABLE STAGES)');

test('Budowa 7-etapowego lejka misyjnego opartego wyłącznie na faktach', () => {
    const events = [
        createAnalyticsEvent({ contentId: 'CC-2026-000001', metricType: 'VIEW', metricValue: 500 }),
        createAnalyticsEvent({ contentId: 'CC-2026-000001', metricType: 'REACTION', metricValue: 50 }),
        createAnalyticsEvent({ contentId: 'CC-2026-000001', metricType: 'RETURN', metricValue: 20 }),
        createAnalyticsEvent({ contentId: 'CC-2026-000001', metricType: 'CC_ID_REGISTRATION', metricValue: 10 }),
        createAnalyticsEvent({ contentId: 'CC-2026-000001', metricType: 'LUMINA_JOIN', metricValue: 5 }),
        createAnalyticsEvent({ contentId: 'CC-2026-000001', metricType: 'BIBLE_OPEN', metricValue: 3 })
    ];

    const funnel = buildMissionFunnel(events);
    assert.strictEqual(funnel.stages.CONTENT_REACHED.value, 500);
    assert.strictEqual(funnel.stages.CONTENT_ENGAGED.value, 50);
    assert.strictEqual(funnel.stages.RETURNED.value, 20);
    assert.strictEqual(funnel.stages.CC_ID_CREATED.value, 10);
    assert.strictEqual(funnel.stages.JOINED_LUMINA.value, 5);
    assert.strictEqual(funnel.stages.OPENED_BIBLE_DEVOTIONAL.value, 3);
    assert.ok(funnel.doctrineNote.includes('Zero subiektywnych deklaracji teologicznych'));
});

// ──────────────────────────────────────────────────────────────────────────
// TEST 9: Analiza Językowa i Próg INSUFFICIENT DATA (Dyrektywy 36, 37)
// ──────────────────────────────────────────────────────────────────────────
console.log('\n🌐 9. LANGUAGE INTELLIGENCE & INSUFFICIENT DATA THRESHOLD');

test('Oznaczenie próbki poniżej 100 zdarzeń jako INSUFFICIENT_DATA', () => {
    const events = [];

    // PL: 250 zdarzeń (powyżej progu 100)
    for (let i = 0; i < 250; i++) {
        events.push(createAnalyticsEvent({
            contentId: 'CC-2026-000001',
            language: 'pl',
            metricType: 'VIEW',
            metricValue: 1
        }));
    }

    // EN: 12 zdarzeń (poniżej progu 100)
    for (let i = 0; i < 12; i++) {
        events.push(createAnalyticsEvent({
            contentId: 'CC-2026-000001',
            language: 'en',
            metricType: 'VIEW',
            metricValue: 1
        }));
    }

    const comparison = compareLanguages(events);

    assert.strictEqual(comparison.languages.pl.isStatisticallySufficient, true);
    assert.strictEqual(comparison.languages.pl.sampleStatus, 'SUFFICIENT');

    assert.strictEqual(comparison.languages.en.isStatisticallySufficient, false);
    assert.strictEqual(comparison.languages.en.sampleStatus, 'INSUFFICIENT_DATA');
});

// ──────────────────────────────────────────────────────────────────────────
// TEST 10: Obserwatory Platformowe (Dyrektywy 59-70)
// ──────────────────────────────────────────────────────────────────────────
console.log('\n📡 10. PLATFORM OBSERVERS');

await testAsync('YouTubeObserver: Obserwacja kanału pilotażowego z budżetem Quota i zasobem technicznym', async () => {
    const ytObserver = new YouTubeObserver({
        pilotChannelId: 'UC_PILOT_CC_MAIN'
    });

    const res = await ytObserver.observePublication({
        publicationId: 'pub_yt_pilot',
        contentId: 'CC-2026-TEST01',
        externalId: 'test_video_yt_01'
    });

    assert.strictEqual(res.platform, 'YOUTUBE');
    assert.strictEqual(res.verificationLevel, 'PLATFORM_API');
    assert.ok(res.quotaUnitsReserved >= 1);
});

await testAsync('LuminaObserver: Obserwacja realnych reakcji i komentarzy', async () => {
    const luminaObserver = new LuminaObserver();
    const res = await luminaObserver.observePublication({
        publicationId: 'pub_lumina_01',
        contentId: 'CC-2026-000001',
        externalId: 'post_lumina_001'
    });

    assert.strictEqual(res.platform, 'LUMINA');
    assert.strictEqual(res.verificationLevel, 'PLATFORM_API');
    assert.strictEqual(typeof res.metrics.comments, 'number');
});

await testAsync('WwwObserver: Obserwacja odsłon portalu i scroll depth', async () => {
    const wwwObserver = new WwwObserver();
    const res = await wwwObserver.observePublication({
        publicationId: 'pub_www_01',
        contentId: 'CC-2026-000001',
        externalId: 'route_player'
    });

    assert.strictEqual(res.platform, 'WWW');
    assert.strictEqual(res.verificationLevel, 'EDGE_TELEMETRY');
    assert.strictEqual(typeof res.metrics.pageViews, 'number');
});

await testAsync('RadioObserver: Obserwacja słuchaczy Icecast i sesji live', async () => {
    const radioObserver = new RadioObserver();
    const res = await radioObserver.observePublication({
        publicationId: 'pub_radio_01',
        contentId: 'CC-2026-000001',
        mount: '/live.mp3'
    });

    assert.strictEqual(res.platform, 'RADIO');
    assert.strictEqual(res.verificationLevel, 'SERVER_METRICS');
    assert.strictEqual(typeof res.metrics.currentListeners, 'number');
});

await testAsync('WhatsAppObserver: Raportowanie wyłącznie statusu SENT (brak fałszywych odczytów)', async () => {
    const waObserver = new WhatsAppObserver();
    const res = await waObserver.observePublication({
        publicationId: 'pub_wa_01',
        contentId: 'CC-2026-000001',
        externalId: 'ack_wa_msg_1234'
    });

    assert.strictEqual(res.platform, 'WHATSAPP');
    assert.strictEqual(res.verificationLevel, 'INTERNAL_CONFIRMED');
    assert.strictEqual(res.metrics.dispatchStatus, 'SENT');
    assert.ok(res.notAvailableMetrics.includes('readCount'));
});

await testAsync('BitChuteObserver: Zwraca status CONFIRMED_BY_OPERATOR (zgodnie z uwagą z backlogu)', async () => {
    const bcObserver = new BitChuteObserver();
    const res = await bcObserver.observePublication({
        publicationId: 'pub_bc_01',
        contentId: 'CC-2026-000001',
        publicUrl: 'https://bitchute.com/video/abc123xyz/'
    });

    assert.strictEqual(res.platform, 'BITCHUTE');
    assert.strictEqual(res.verificationLevel, 'OPERATOR_CONFIRMED');
    assert.strictEqual(res.metrics.operatorConfirmationLevel, 'CONFIRMED_BY_OPERATOR');
});

await testAsync('FacebookObserver: Raportuje NOT_CONNECTED bez generowania fikcyjnych danych', async () => {
    const fbObserver = new FacebookObserver();
    const res = await fbObserver.observePublication({
        publicationId: 'pub_fb_01',
        contentId: 'CC-2026-000001'
    });

    assert.strictEqual(res.platform, 'FACEBOOK');
    assert.strictEqual(res.status, 'NOT_CONNECTED');
    assert.ok(res.notAvailableMetrics.includes('all'));
});

// ──────────────────────────────────────────────────────────────────────────
// TEST 11: Częściowa Obserwowalność i Izolacja Awarii (Dyrektywy 71, 72)
// ──────────────────────────────────────────────────────────────────────────
console.log('\n⚡ 11. PARTIAL OBSERVABILITY & FAILURE ISOLATION');

await testAsync('Awaria jednego obserwatora nie zatrzymuje pozostałych', async () => {
    const orchestrator = new ObserverOrchestrator();

    // Rejestrujemy poprawny obserwator LUMINA
    orchestrator.registerObserver('LUMINA', new LuminaObserver());

    // Rejestrujemy psujący się obserwator (np. błąd sieciowy zewnętrznego API)
    const failingObserver = new BaseObserver('FAILING_API');
    failingObserver.observePublication = async () => {
        throw new Error('NETWORK_TIMEOUT_CONNECTION_REFUSED');
    };
    orchestrator.registerObserver('FAILING_API', failingObserver);

    const jobResult = await orchestrator.runObservationJob({
        publications: [
            { platform: 'LUMINA', publicationId: 'p_lumina', contentId: 'CC-2026-000001', externalId: 'post_1' },
            { platform: 'FAILING_API', publicationId: 'p_fail', contentId: 'CC-2026-000001', externalId: 'fail_1' }
        ]
    });

    assert.strictEqual(jobResult.status, 'PARTIAL_SUCCESS');
    assert.strictEqual(jobResult.successfulCount, 1);
    assert.strictEqual(jobResult.failedCount, 1);
    assert.strictEqual(jobResult.observabilityRatio, '1/2 sources current');
    assert.ok(jobResult.failures.some(f => f.platform === 'FAILING_API'));
});

// ──────────────────────────────────────────────────────────────────────────
// TEST 12: Generowanie Rollupów i Eksport Danych Bez PII (Dyrektywy 17, 18)
// ──────────────────────────────────────────────────────────────────────────
console.log('\n📊 12. ROLLUPS GENERATION & PII-FREE EXPORT');

test('Generowanie rollupów z agregacją wielowymiarową', () => {
    const events = [
        createAnalyticsEvent({ contentId: 'CC-2026-000001', language: 'pl', platform: 'LUMINA', metricType: 'VIEW', metricValue: 100, region: 'PL' }),
        createAnalyticsEvent({ contentId: 'CC-2026-000001', language: 'pl', platform: 'LUMINA', metricType: 'COMMENT', metricValue: 10, region: 'PL' }),
        createAnalyticsEvent({ contentId: 'CC-2026-000001', language: 'en', platform: 'WWW', metricType: 'VIEW', metricValue: 25, region: 'US' })
    ];

    const rollup = generateRollup('CC-2026-000001', events, []);
    assert.strictEqual(rollup.byPlatform.LUMINA.VIEW, 100);
    assert.strictEqual(rollup.byPlatform.LUMINA.COMMENT, 10);
    assert.strictEqual(rollup.byLanguage.pl.VIEW, 100);
    assert.strictEqual(rollup.byLanguage.en.VIEW, 25);
    assert.strictEqual(rollup.byRegion.PL.VIEW, 100);
    assert.strictEqual(rollup.byRegion.US.VIEW, 25);
});

test('Eksport JSON i CSV w pełni pozbawiony danych osobowych (Zero PII)', () => {
    const orchestrator = new ObserverOrchestrator();

    orchestrator.ingestEvent(createAnalyticsEvent({
        contentId: 'CC-2026-000001',
        variantId: 'var_pl_web',
        platform: 'LUMINA',
        metricType: 'VIEW',
        metricValue: 42,
        language: 'pl',
        region: 'PL'
    }));

    const jsonExport = orchestrator.exportAggregatedData('JSON');
    const parsed = JSON.parse(jsonExport);
    assert.strictEqual(parsed.length, 1);
    assert.strictEqual(parsed[0].contentId, 'CC-2026-000001');
    assert.strictEqual(parsed[0].metricValue, 42);

    const csvExport = orchestrator.exportAggregatedData('CSV');
    assert.ok(csvExport.includes('contentId,variantId,platform,metricType,metricValue'));
    assert.ok(csvExport.includes('CC-2026-000001,var_pl_web,LUMINA,VIEW,42'));

    // Weryfikacja braku jakichkolwiek pól PII
    assert.ok(!jsonExport.includes('email'));
    assert.ok(!jsonExport.includes('ipAddress'));
    assert.ok(!csvExport.includes('email'));
    assert.ok(!csvExport.includes('ipAddress'));
});

// ──────────────────────────────────────────────────────────────────────────
// PODSUMOWANIE WYNIKÓW
// ──────────────────────────────────────────────────────────────────────────
console.log('\n══════════════════════════════════════════════════════════════════════════');
console.log(`📋 PODSUMOWANIE TESTÓW FAZY 4:`);
console.log(`   Łącznie: ${passedTests + failedTests}`);
console.log(`   Zaliczono: ${passedTests}`);
console.log(`   Niepowodzenia: ${failedTests}`);
console.log('══════════════════════════════════════════════════════════════════════════\n');

if (failedTests > 0) {
    process.exit(1);
} else {
    process.exit(0);
}
