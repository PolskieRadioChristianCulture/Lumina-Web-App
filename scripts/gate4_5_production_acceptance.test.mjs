/**
 * ══════════════════════════════════════════════════════════════════════════
 * CC GLOBAL 2030 — PRODUCTION GATE 4.5 TEST SUITE
 * GLOBAL OBSERVER — PRODUCTION ACCEPTANCE
 * ══════════════════════════════════════════════════════════════════════════
 * Standard Architektury: MASTER PLAN CC GLOBAL 2030 (GATE 4.5)
 * Weryfikacja: Rzeczywiste dane produkcyjne, PII Denylist & Telemetry Allowlist,
 * Zero Fake Metrics, Observation Modes, Freshness, Delta Engine, Dictionary,
 * Read-Only Security Guard, Autopublish = OFF.
 * ══════════════════════════════════════════════════════════════════════════
 */

import assert from 'assert';
import fs from 'fs';
import path from 'path';

import {
    createAnalyticsEvent,
    createAnalyticsSnapshot,
    calculateSnapshotDelta,
    generateRollup,
    calculateGlobalReach,
    buildMissionFunnel,
    compareLanguages,
    TELEMETRY_FIELD_ALLOWLIST,
    PII_DENYLIST,
    RETENTION_POLICY,
    POLLING_PRIORITIES,
    getPollingPriority,
    CC_ANALYTICS_DICTIONARY,
    getMetricDefinition
} from '../lib/cc-content-core/analytics-core.js';

import {
    IncidentRegistry,
    calculateFreshness,
    formatRelativeFreshness
} from '../lib/cc-content-core/incident-registry.js';

import {
    BaseObserver,
    YouTubeObserver,
    LuminaObserver,
    WwwObserver,
    RadioObserver,
    WhatsAppObserver,
    BitChuteObserver,
    FacebookObserver,
    NormalizationLayer
} from '../lib/cc-content-core/observers/index.js';

import { ObserverOrchestrator } from '../lib/cc-content-core/observer-orchestrator.js';
import { getKillSwitchState } from '../lib/cc-content-core/distribution-registry.js';

let passedTests = 0;
let failedTests = 0;

function test(name, fn) {
    try {
        fn();
        console.log(`  ✅ [PASS] ${name}`);
        passedTests++;
    } catch (err) {
        console.error(`  ❌ [FAIL] ${name}: ${err.message}`);
        failedTests++;
    }
}

async function testAsync(name, fn) {
    try {
        await fn();
        console.log(`  ✅ [PASS] ${name}`);
        passedTests++;
    } catch (err) {
        console.error(`  ❌ [FAIL] ${name}: ${err.message}`);
        failedTests++;
    }
}

console.log('\n══════════════════════════════════════════════════════════════════════════');
console.log('🚀 URUCHAMIANIE TESTÓW PRODUCTION GATE 4.5: PRODUCTION ACCEPTANCE');
console.log('══════════════════════════════════════════════════════════════════════════\n');

// ──────────────────────────────────────────────────────────────────────────
// TEST 1: Autopublish Forensic Check (Bramka 4.5 Pkt 13)
// ──────────────────────────────────────────────────────────────────────────
console.log('🔒 1. AUTOPUBLISH FORENSIC CHECK & KILL SWITCH');

test('Domyślny stan po deployu to GLOBAL AUTOPUBLISH = OFF (automationOff = true)', () => {
    const status = getKillSwitchState();

    assert.strictEqual(status.automationOff, true, 'Autopublish musi być bezwzględnie domyślnie wyłączony!');
    assert.strictEqual(status.platformOff.FACEBOOK, true, 'Facebook adapter musi być domyślnie wyłączony');
});

// ──────────────────────────────────────────────────────────────────────────
// TEST 2: Observer Read-Only Security Guard (Bramka 4.5 Pkt 12)
// ──────────────────────────────────────────────────────────────────────────
console.log('\n🛡️ 2. OBSERVER READ-ONLY SECURITY GUARD (5 ZAKAZANYCH OPERACJI)');

test('Observer blokuje publish, deletePublication, cancelDistribution, reschedule, changeVisibility', () => {
    const observer = new BaseObserver('TEST_PLATFORM', '1.0');

    assert.throws(() => observer.publish(), /OBSERVER_SECURITY_VIOLATION/);
    assert.throws(() => observer.deletePublication(), /OBSERVER_SECURITY_VIOLATION/);
    assert.throws(() => observer.cancelDistribution(), /OBSERVER_SECURITY_VIOLATION/);
    assert.throws(() => observer.reschedule(), /OBSERVER_SECURITY_VIOLATION/);
    assert.throws(() => observer.changeVisibility(), /OBSERVER_SECURITY_VIOLATION/);
});

// ──────────────────────────────────────────────────────────────────────────
// TEST 3: Privacy Guard — Telemetry Allowlist & PII Denylist (Pkt 3, 4, 5, 6)
// ──────────────────────────────────────────────────────────────────────────
console.log('\n🔐 3. PRIVACY GUARD — TELEMETRY ALLOWLIST & PII DENYLIST');

test('PII Denylist bezwzględnie niszczy pola wrażliwe, a zachowuje autorów i nazwy biblijne', () => {
    const evt = createAnalyticsEvent({
        contentId: 'CC-2026-000001',
        variantId: 'var_pl_web',
        platform: 'LUMINA',
        metricType: 'VIEW',
        metricValue: 10,
        // Pola PII do usunięcia
        email: 'tajne@example.com',
        userEmail: 'tajne@example.com',
        phone: '+48123456789',
        fullName: 'Jan Kowalski',
        privateMessage: 'Poufna modlitwa',
        holosNote: 'Mój intymny wpis',
        // Bezpieczne metadane
        metadata: {
            authorName: 'Cezary Rogowski', // Autor musi pozostać! Zero heurystycznego cięcia imion
            biblicalFigure: 'Mojżesz',      // Postać biblijna musi pozostać!
            email: 'wyciek_w_metadata@cc.pl',
            userPhone: '123'
        }
    });

    // PII Denylist usunęło pola z roota
    assert.strictEqual(evt.email, undefined);
    assert.strictEqual(evt.userEmail, undefined);
    assert.strictEqual(evt.phone, undefined);
    assert.strictEqual(evt.fullName, undefined);
    assert.strictEqual(evt.privateMessage, undefined);
    assert.strictEqual(evt.holosNote, undefined);

    // PII Denylist usunęło pola z metadata
    assert.strictEqual(evt.metadata.email, undefined);
    assert.strictEqual(evt.metadata.userPhone, undefined);

    // Prawidłowe metadane i autorzy zachowani
    assert.strictEqual(evt.metadata.authorName, 'Cezary Rogowski');
    assert.strictEqual(evt.metadata.biblicalFigure, 'Mojżesz');
});

test('IP Address handling: Edge processing -> Coarse region -> DROP IP (Pkt 6)', () => {
    const evt = createAnalyticsEvent({
        contentId: 'CC-2026-000001',
        metricType: 'VIEW',
        metricValue: 1,
        ipAddress: '194.29.130.5',
        region: 'PL'
    });

    assert.strictEqual(evt.region, 'PL');
    assert.strictEqual(evt.ipAddress, undefined, 'Surowe IP nie może trafić do rekordu analitycznego');
    assert.strictEqual(evt.ip, undefined);
});

// ──────────────────────────────────────────────────────────────────────────
// TEST 4: Realtime Correction & Observation Modes (Pkt 7, 8)
// ──────────────────────────────────────────────────────────────────────────
console.log('\n⏱️ 4. REALTIME TERMINOLOGY CORRECTION & OBSERVATION MODES');

test('Każdy obserwator deklaruje prawidłowy observationMode', () => {
    const yt = new YouTubeObserver();
    const lum = new LuminaObserver();
    const www = new WwwObserver();
    const radio = new RadioObserver();
    const wa = new WhatsAppObserver();
    const bc = new BitChuteObserver();
    const fb = new FacebookObserver();

    assert.strictEqual(yt.observationMode, 'PERIODIC');
    assert.strictEqual(lum.observationMode, 'NEAR_REALTIME');
    assert.strictEqual(www.observationMode, 'PERIODIC');
    assert.strictEqual(radio.observationMode, 'LIVE');
    assert.strictEqual(wa.observationMode, 'PERIODIC');
    assert.strictEqual(bc.observationMode, 'PERIODIC');
    assert.strictEqual(fb.observationMode, 'UNKNOWN');
});

test('Formatowanie świeżości: formatRelativeFreshness (np. Updated 4 min ago)', () => {
    const now = new Date();
    const fourMinAgo = new Date(now.getTime() - 4 * 60 * 1000).toISOString();
    const twoHoursAgo = new Date(now.getTime() - 120 * 60 * 1000).toISOString();

    assert.strictEqual(formatRelativeFreshness(fourMinAgo), 'Zaktualizowano 4 min temu');
    assert.strictEqual(formatRelativeFreshness(twoHoursAgo), 'Zaktualizowano 2 godz. temu');
});

// ──────────────────────────────────────────────────────────────────────────
// TEST 5: Real YouTube Observation & Technical Test Marking (Pkt 14, 15)
// ──────────────────────────────────────────────────────────────────────────
console.log('\n📹 5. YOUTUBE OBSERVATION & TECHNICAL TEST ASSET');

await testAsync('YouTube: Obserwacja CC-2026-TEST01 z oznaczeniem TECHNICAL_TEST i Quota Guard', async () => {
    const yt = new YouTubeObserver({
        remoteVideoDatabase: new Map([
            ['test_yt_video_pilot', {
                processingStatus: 'succeeded',
                views: 15,
                likes: 3,
                comments: 1,
                privacyStatus: 'private'
            }]
        ])
    });

    const res = await yt.observePublication({
        publicationId: 'pub_yt_01',
        contentId: 'CC-2026-TEST01',
        remoteId: 'test_yt_video_pilot'
    });

    assert.strictEqual(res.platform, 'YOUTUBE');
    assert.strictEqual(res.verificationLevel, 'PLATFORM_API');
    assert.strictEqual(res.observationCategory, 'TECHNICAL_TEST', 'Asset testowy musi być jawnie oznaczony!');
    assert.strictEqual(res.isTechnicalTest, true);
    assert.strictEqual(res.metrics.viewCount, 15);
    assert.ok(res.quotaUnitsReserved >= 1);
});

// ──────────────────────────────────────────────────────────────────────────
// TEST 6: Real LUMINA Observation & Zero Fake Metrics (Pkt 16, 24, 25)
// ──────────────────────────────────────────────────────────────────────────
console.log('\n💬 6. LUMINA OBSERVATION & ZERO FAKE METRICS');

await testAsync('LUMINA: Rzeczywiste metryki z bazy i brakujące oznaczone jako NOT_AVAILABLE', async () => {
    const lum = new LuminaObserver({
        mockPosts: new Map([
            ['post_smm_day26_2026-09-26', {
                title: 'Rozważanie Dzień 26',
                likesCount: 54,
                commentsCount: 12
                // Brak viewsCount w Firestore
            }]
        ])
    });

    const res = await lum.observePublication({
        publicationId: 'pub_lum_01',
        contentId: 'CC-2026-000001',
        remoteId: 'post_smm_day26_2026-09-26'
    });

    assert.strictEqual(res.platform, 'LUMINA');
    assert.strictEqual(res.verificationLevel, 'PLATFORM_API');
    assert.strictEqual(res.metrics.likes, 54);
    assert.strictEqual(res.metrics.comments, 12);
    // Zero Fake Metrics: brakujące odsłony nie są zerem
    assert.ok(res.notAvailableMetrics.includes('views'));
    assert.ok(res.notAvailableMetrics.includes('impressions'));
});

test('Real Zero: Autentyczne zero reakcji jest zachowywane jako 0 (nie NOT_AVAILABLE)', () => {
    const normalized = NormalizationLayer.normalizePlatformMetrics('LUMINA', {
        likes: 0,
        comments: 0
    }, { contentId: 'CC-2026-000001' });

    assert.strictEqual(normalized.metrics.likes, 0);
    assert.strictEqual(normalized.metrics.comments, 0);
    assert.ok(!normalized.notAvailableMetrics.includes('likes'));
    assert.ok(!normalized.notAvailableMetrics.includes('comments'));
});

// ──────────────────────────────────────────────────────────────────────────
// TEST 7: WWW Observer Provenance (Pkt 17, 18)
// ──────────────────────────────────────────────────────────────────────────
console.log('\n🌐 7. WWW OBSERVER PROVENANCE (CLOUDFLARE vs FIRST-PARTY)');

await testAsync('WWW: Rozdzielenie pageViews (Cloudflare) od scrollDepthAvg (First-Party)', async () => {
    const www = new WwwObserver();
    const res = await www.observePublication({
        publicationId: 'pub_www_01',
        contentId: 'CC-2026-000001'
    });

    assert.strictEqual(res.platform, 'WWW');
    assert.strictEqual(res.metricProvenance.pageViews.source, 'CLOUDFLARE_EDGE_ANALYTICS');
    assert.strictEqual(res.metricProvenance.pageViews.verificationLevel, 'EDGE_TELEMETRY');

    assert.strictEqual(res.metricProvenance.scrollDepthAvg.source, 'FIRST_PARTY_FRONTEND_TELEMETRY');
    assert.strictEqual(res.metricProvenance.scrollDepthAvg.verificationLevel, 'FIRST_PARTY');
});

// ──────────────────────────────────────────────────────────────────────────
// TEST 8: Radio Observer: CURRENT LISTENERS ≠ UNIQUE LISTENERS (Pkt 19, 20)
// ──────────────────────────────────────────────────────────────────────────
console.log('\n📻 8. RADIO OBSERVER (CURRENT LISTENERS ≠ UNIQUE LISTENERS)');

await testAsync('Radio: Raportowanie połączeń TCP bez przeliczania na unikalnych słuchaczy', async () => {
    const radio = new RadioObserver({
        streamSource: 'ICECAST_SERVER_STATUS_XML (/live.mp3)',
        streamStats: { currentListeners: 65, sessionStarts: 410, totalListeningSeconds: 125000 }
    });

    const res = await radio.observePublication({
        publicationId: 'pub_rad_01',
        contentId: 'CC-2026-000001'
    });

    assert.strictEqual(res.platform, 'RADIO');
    assert.strictEqual(res.verificationLevel, 'SERVER_METRICS');
    assert.strictEqual(res.metrics.currentListeners, 65);
    assert.ok(res.metricDefinition.includes('ZAWSZE odróżniana od uniqueListeners'));
    assert.ok(res.notAvailableMetrics.includes('uniqueListeners'));
});

// ──────────────────────────────────────────────────────────────────────────
// TEST 9: WhatsApp & BitChute Verification Levels (Pkt 21, 22)
// ──────────────────────────────────────────────────────────────────────────
console.log('\n📱 9. WHATSAPP (SENT) & BITCHUTE (CONFIRMED_BY_OPERATOR)');

await testAsync('WhatsApp zwraca SENT z INTERNAL_CONFIRMED bez fałszywego read rate', async () => {
    const wa = new WhatsAppObserver();
    const res = await wa.observePublication({
        publicationId: 'pub_wa_01',
        contentId: 'CC-2026-000001',
        remoteId: 'wa_dispatch_123'
    });

    assert.strictEqual(res.verificationLevel, 'INTERNAL_CONFIRMED');
    assert.strictEqual(res.metrics.dispatchStatus, 'SENT');
    assert.ok(res.notAvailableMetrics.includes('readCount'));
});

await testAsync('BitChute: CONFIRMED_BY_OPERATOR ściśle odseparowane od PLATFORM_API', async () => {
    const bc = new BitChuteObserver();
    const res = await bc.observePublication({
        publicationId: 'pub_bc_01',
        contentId: 'CC-2026-000001'
    });

    assert.strictEqual(res.verificationLevel, 'OPERATOR_CONFIRMED');
    assert.strictEqual(res.metrics.operatorConfirmationLevel, 'CONFIRMED_BY_OPERATOR');
    assert.notStrictEqual(res.verificationLevel, 'PLATFORM_API');
});

// ──────────────────────────────────────────────────────────────────────────
// TEST 10: Deduplikacja i Source Correction (Pkt 26, 27)
// ──────────────────────────────────────────────────────────────────────────
console.log('\n🔁 10. DEDUPLICATION & SOURCE CORRECTION (NEGATIVE DELTAS)');

test('Deduplikacja: Pobranie tego samego zdarzenia dwukrotnie zwraca 1 logiczną obserwację', () => {
    const orchestrator = new ObserverOrchestrator();

    const evt = createAnalyticsEvent({
        contentId: 'CC-2026-000001',
        platform: 'LUMINA',
        metricType: 'COMMENT',
        metricValue: 1,
        occurredAt: '2026-09-26T14:00:00.000Z'
    });

    const res1 = orchestrator.ingestEvent(evt);
    const res2 = orchestrator.ingestEvent(evt);

    assert.strictEqual(res1.status, 'INGESTED');
    assert.strictEqual(res2.status, 'DUPLICATE_IGNORED');
    assert.strictEqual(orchestrator.eventsStore.size, 1);
});

test('Source Correction: YouTube cofnął wyświetlenia 1000 -> 995 (SOURCE_CORRECTION, nie -5 new views)', () => {
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

    const delta = calculateSnapshotDelta(prev, curr);
    assert.strictEqual(delta.views.type, 'SOURCE_CORRECTION');
    assert.strictEqual(delta.views.delta, -5);
    assert.strictEqual(delta.views.isNegativeCorrection, true);
});

// ──────────────────────────────────────────────────────────────────────────
// TEST 11: Real Health State & Freshness (Pkt 28, 30)
// ──────────────────────────────────────────────────────────────────────────
console.log('\n🏥 11. AUTHENTIC SYSTEM HEALTH (NIE UDAWAJ HEALTHY NA STALE)');

test('Komponent bez świeżej obserwacji powyżej 1h otrzymuje status STALE, nie HEALTHY', () => {
    const registry = new IncidentRegistry();
    const twoHoursAgo = new Date(Date.now() - 120 * 60 * 1000).toISOString();

    // Symulacja braku odświeżenia komponentu
    registry.setComponentLastCheckedAt('YouTube Adapter', twoHoursAgo);

    const compRecord = registry.getComponentHealth('YouTube Adapter');
    const freshness = registry.calculateFreshness(compRecord.lastCheckedAt);
    assert.strictEqual(freshness, 'STALE');

    const allHealth = registry.getAllComponentsHealth();
    assert.strictEqual(allHealth['YouTube Adapter'].status, 'STALE', 'Komponent nie może udawać HEALTHY przy STALE telemetrii');
});

// ──────────────────────────────────────────────────────────────────────────
// TEST 12: Incident Lifecycle E2E (Pkt 31)
// ──────────────────────────────────────────────────────────────────────────
console.log('\n🚨 12. INCIDENT LIFECYCLE E2E (OPEN -> RESOLVED)');

test('Incydent przechodzi cykl OPEN -> RESOLVED z pełnym śladem audytowym', () => {
    const registry = new IncidentRegistry();

    const inc = registry.reportIncident({
        component: 'LUMINA Adapter',
        severity: 'DEGRADED',
        errorCode: 'FIRESTORE_SLOW_QUERY',
        summary: 'Czas odpowiedzi Firestore > 1500ms'
    });

    assert.strictEqual(inc.status, 'OPEN');
    assert.ok(inc.startedAt);
    assert.strictEqual(inc.resolvedAt, null);

    registry.resolveIncident(inc.incidentId, 'Operator Nazir', 'Zoptymalizowano indeksy bazy');
    assert.strictEqual(inc.status, 'RESOLVED');
    assert.ok(inc.resolvedAt);
    assert.ok(inc.summary.includes('Rozwiązanie: Zoptymalizowano indeksy bazy (Operator Nazir)'));
});

// ──────────────────────────────────────────────────────────────────────────
// TEST 13: CC Analytics Dictionary & Operational Definitions (Pkt 39, 40)
// ──────────────────────────────────────────────────────────────────────────
console.log('\n📖 13. CC ANALYTICS DICTIONARY & OPERATIONAL DEFINITIONS');

test('Słownik metryk zawiera ścisłe definicje dla wszystkich kanonicznych wskaźników', () => {
    const curListeners = getMetricDefinition('CURRENT_LISTENERS');
    assert.ok(curListeners.definition.includes('połączeń TCP'));
    assert.ok(curListeners.limitations.includes('ZAWSZE odróżnia się od uniqueListeners'));

    const ongoing = getMetricDefinition('ONGOING_RELATIONSHIP');
    assert.ok(ongoing.definition.includes('oknie 30 dni'));
    assert.ok(ongoing.limitations.includes('Zero subiektywnych deklaracji teologicznych'));

    const pageViews = getMetricDefinition('PAGE_VIEWS');
    assert.strictEqual(pageViews.verificationLevel, 'EDGE_TELEMETRY');
});

// ──────────────────────────────────────────────────────────────────────────
// TEST 14: Retention Policy & Polling Priorities (Pkt 35, 36, 37)
// ──────────────────────────────────────────────────────────────────────────
console.log('\n📦 14. RETENTION POLICY & POLLING PRIORITIES');

test('Jawna definicja polityki retencji i priorytetów odpytywania (Cost Guard)', () => {
    assert.strictEqual(RETENTION_POLICY.rawEventsRetentionDays, 90);
    assert.strictEqual(RETENTION_POLICY.snapshotsRetentionDays, 365);
    assert.strictEqual(RETENTION_POLICY.rollupsRetentionDays, 1825);

    const freshContent = getPollingPriority(new Date(Date.now() - 2 * 3600 * 1000).toISOString());
    assert.strictEqual(freshContent.intervalMinutes, 30);

    const oldContent = getPollingPriority(new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString());
    assert.strictEqual(oldContent.intervalMinutes, 360);

    const archivedContent = getPollingPriority(new Date(Date.now() - 60 * 24 * 3600 * 1000).toISOString());
    assert.strictEqual(archivedContent.intervalMinutes, 1440);
});

// ──────────────────────────────────────────────────────────────────────────
// TEST 15: Configurable Language Threshold (Pkt 43)
// ──────────────────────────────────────────────────────────────────────────
console.log('\n🌐 15. CONFIGURABLE MIN_SAMPLE_SIZE FOR LANGUAGE INTELLIGENCE');

test('compareLanguages respektuje konfigurowalny minSampleSize', () => {
    const events = [];
    for (let i = 0; i < 35; i++) {
        events.push(createAnalyticsEvent({
            contentId: 'CC-2026-000001',
            language: 'es',
            metricType: 'VIEW',
            metricValue: 1
        }));
    }

    // Domyślny próg 100 -> INSUFFICIENT_DATA
    const resDefault = compareLanguages(events, 100);
    assert.strictEqual(resDefault.languages.es.sampleStatus, 'INSUFFICIENT_DATA');

    // Konfigurowalny próg 25 -> SUFFICIENT
    const resCustom = compareLanguages(events, 100, { minSampleSize: 25 });
    assert.strictEqual(resCustom.languages.es.sampleStatus, 'SUFFICIENT');
});

// ──────────────────────────────────────────────────────────────────────────
// TEST 16: Firestore Security Rules & Indexes Verification (Pkt 10, 11)
// ──────────────────────────────────────────────────────────────────────────
console.log('\n🛡️ 16. FIRESTORE SECURITY RULES & INDEXES AUDIT');

test('Weryfikacja reguł bezpieczeństwa dla 6 kolekcji analitycznych w firestore.rules', () => {
    const rulesPath = path.resolve('firestore.rules');
    const rulesContent = fs.readFileSync(rulesPath, 'utf-8');

    const expectedCollections = [
        'cc_analytics_events',
        'cc_analytics_snapshots',
        'cc_analytics_rollups',
        'cc_platform_health',
        'cc_incidents',
        'cc_observer_jobs'
    ];

    for (const col of expectedCollections) {
        assert.ok(rulesContent.includes(`match /${col}/`), `Kolekcja ${col} musi posiadać jawne reguły w firestore.rules`);
    }

    assert.ok(rulesContent.includes('allow read, write: if isMasterAdmin();'));
});

test('Weryfikacja indeksów złożonych dla kolekcji analitycznych w firestore.indexes.json', () => {
    const idxPath = path.resolve('firestore.indexes.json');
    const idxContent = fs.readFileSync(idxPath, 'utf-8');
    const parsed = JSON.parse(idxContent);

    const indexedCollections = parsed.indexes.map(i => i.collectionGroup);
    assert.ok(indexedCollections.includes('cc_analytics_events'));
    assert.ok(indexedCollections.includes('cc_analytics_snapshots'));
    assert.ok(indexedCollections.includes('cc_analytics_rollups'));
    assert.ok(indexedCollections.includes('cc_incidents'));
    assert.ok(indexedCollections.includes('cc_observer_jobs'));
});

// ──────────────────────────────────────────────────────────────────────────
// TEST 17: Real Analytics Golden Path E2E (Pkt 23)
// ──────────────────────────────────────────────────────────────────────────
console.log('\n🌟 17. REAL ANALYTICS GOLDEN PATH E2E');

test('Pełny łańcuch: Content -> Publication -> Observation -> Normalized -> Rollup -> Funnel', () => {
    const contentId = 'CC-2026-000001';
    const events = [
        createAnalyticsEvent({ contentId, language: 'pl', platform: 'LUMINA', metricType: 'VIEW', metricValue: 350 }),
        createAnalyticsEvent({ contentId, language: 'pl', platform: 'LUMINA', metricType: 'COMMENT', metricValue: 42 }),
        createAnalyticsEvent({ contentId, language: 'pl', platform: 'WWW', metricType: 'BIBLE_OPEN', metricValue: 18 }),
        createAnalyticsEvent({ contentId, language: 'pl', platform: 'WWW', metricType: 'RETURN', metricValue: 25 })
    ];

    const rollup = generateRollup(contentId, events, []);
    assert.strictEqual(rollup.byPlatform.LUMINA.VIEW, 350);
    assert.strictEqual(rollup.byPlatform.LUMINA.COMMENT, 42);

    const reach = calculateGlobalReach(events);
    assert.strictEqual(reach.videoViews, 350);
    assert.strictEqual(reach.articleOpens, 18);
    assert.strictEqual(reach.socialInteractions, 42);

    const funnel = buildMissionFunnel(events);
    assert.strictEqual(funnel.stages.CONTENT_REACHED.value, 350);
    assert.strictEqual(funnel.stages.CONTENT_ENGAGED.value, 42);
    assert.strictEqual(funnel.stages.OPENED_BIBLE_DEVOTIONAL.value, 18);
});

// ──────────────────────────────────────────────────────────────────────────
// PODSUMOWANIE WYNIKÓW
// ──────────────────────────────────────────────────────────────────────────
console.log('\n══════════════════════════════════════════════════════════════════════════');
console.log(`📋 PODSUMOWANIE TESTÓW PRODUCTION GATE 4.5:`);
console.log(`   Łącznie testów: ${passedTests + failedTests}`);
console.log(`   Zaliczono: ${passedTests}`);
console.log(`   Niepowodzenia: ${failedTests}`);
console.log('══════════════════════════════════════════════════════════════════════════\n');

if (failedTests > 0) {
    process.exit(1);
} else {
    process.exit(0);
}
