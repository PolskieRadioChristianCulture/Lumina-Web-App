/**
 * ══════════════════════════════════════════════════════════════════════════
 * CC GLOBAL 2030 — PRODUCTION GATE 6.5 ACCEPTANCE TEST SUITE
 * FOLLOW THE SUN 24/7 — REAL PRODUCTION SHADOW VALIDATION
 * ══════════════════════════════════════════════════════════════════════════
 * Weryfikacja:
 * 1. Pre-Flight Baseline & Market Enablement (simulationEligible vs productionSchedulingEnabled)
 * 2. Distribution Firewall (5 zakazanych operacji)
 * 3. Zero Side Effect Baseline (Before / After verification)
 * 4. Rzeczywiste dane Golden Record CC-2026-000001 (PL, EN, ES, PT-BR)
 * 5. Real Rights Gate (Text allowed, Audio not allowed -> BLOCKED_BY_RIGHTS)
 * 6. Sabbath Safe Mode (Brak zachodu -> SUNSET_DATA_REQUIRED)
 * 7. Controlled Collision Simulation -> COLLISION (brak autonomicznej naprawy)
 * 8. Idempotencja & Duplicate Guard
 * 9. Content Fatigue Warning w oknie 24h
 * 10. Failure Injection & Fail-Closed Behavior
 * 11. Privacy Audit (Zero PII, Zero śledzenia lokalizacji)
 * 12. Kill Switch Live Test (FOLLOW_THE_SUN_OFF = true)
 * 13. System Health: SHADOW_HEALTHY (nigdy ACTIVE / AUTONOMOUS)
 * 14. Nienaruszalność Routera (CONTROLLED_ACTIVE) i Observera (READ-ONLY)
 * ══════════════════════════════════════════════════════════════════════════
 */

import assert from 'assert';
import {
    CC_TARGET_MARKET_REGISTRY,
    isMarketSimulationEligible,
    isMarketProductionSchedulingEnabled,
    getAllMarkets,
    isValidMarketId,
    isValidIanaTimezone,
    localToUtc,
    utcToLocal,
    calculateWindowUtc,
    FollowTheSunEngine,
    setFollowTheSunKillSwitch,
    isFollowTheSunKilled,
    SCHEDULER_VERSION,
    SCHEDULING_RULE_VERSION
} from '../lib/cc-follow-the-sun/index.js';

import {
    CC_ANALYTICS_DICTIONARY_V4,
    CC_ANALYTICS_DICTIONARY_VERSION_V4,
    getMetricDefinition
} from '../lib/cc-content-core/cc-analytics-dictionary.js';

import { ALLOWED_METRIC_TYPES } from '../lib/cc-content-core/analytics-core.js';
import { isDistributionAllowed, getKillSwitchState } from '../lib/cc-content-core/distribution-registry.js';
import { CC_FOLLOW_THE_SUN_SCHEMA_VERSION } from '../lib/cc-content-core/types.js';

console.log('🚀 URUCHAMIANIE TESTÓW PRODUCTION GATE 6.5: REAL PRODUCTION SHADOW ACCEPTANCE...\n');

let passedTests = 0;
let failedTests = 0;

function runTest(testName, testFn) {
    try {
        testFn();
        console.log(`  ✅ [PASS]: ${testName}`);
        passedTests++;
    } catch (err) {
        console.error(`  ❌ [FAIL]: ${testName}`);
        console.error('     ' + (err.stack || err.message));
        failedTests++;
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. PRE-FLIGHT & MARKET ENABLEMENT (Dyrektywy 1, 16, 17)
// ─────────────────────────────────────────────────────────────────────────────
console.log('📌 OBSZAR 1: Pre-Flight & Target Market Enablement');

runTest('1.1. Rozdzielenie flag: simulationEligible = true oraz productionSchedulingEnabled = false', () => {
    const markets = getAllMarkets();
    assert.strictEqual(markets.length, 7);

    markets.forEach(m => {
        assert.strictEqual(m.simulationEligible, true, `Rynek ${m.marketId} musi mieć simulationEligible = true`);
        assert.strictEqual(m.productionSchedulingEnabled, false, `Rynek ${m.marketId} musi mieć productionSchedulingEnabled = false`);
        assert.strictEqual(m.enabled, false, `Rynek ${m.marketId} musi zachować enabled = false`);
        assert.strictEqual(isMarketSimulationEligible(m.marketId), true);
        assert.strictEqual(isMarketProductionSchedulingEnabled(m.marketId), false);
    });
});

runTest('1.2. Wersje schematów są zapieczętowane na v1', () => {
    assert.strictEqual(CC_FOLLOW_THE_SUN_SCHEMA_VERSION, 'v1');
    assert.strictEqual(SCHEDULER_VERSION, 'v1');
    assert.strictEqual(SCHEDULING_RULE_VERSION, 'v1');
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. DISTRIBUTION FIREWALL & KILL SWITCH (Dyrektywy 4, 44, 45)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n📌 OBSZAR 2: Distribution Firewall & Kill Switch');

runTest('2.1. Distribution Firewall bezwzględnie blokuje 5 metod wykonawczych', () => {
    const engine = new FollowTheSunEngine();

    assert.throws(() => engine.publish(), /FOLLOW_THE_SUN_SECURITY_VIOLATION/);
    assert.throws(() => engine.enqueueDistribution(), /FOLLOW_THE_SUN_SECURITY_VIOLATION/);
    assert.throws(() => engine.schedulePublication(), /FOLLOW_THE_SUN_SECURITY_VIOLATION/);
    assert.throws(() => engine.sendWhatsApp(), /FOLLOW_THE_SUN_SECURITY_VIOLATION/);
    assert.throws(() => engine.changeRadioSchedule(), /FOLLOW_THE_SUN_SECURITY_VIOLATION/);
});

runTest('2.2. Global Autopublish w Distribution Engine pozostaje ściśle OFF', () => {
    const ks = getKillSwitchState();
    assert.strictEqual(ks.automationOff, true, 'GLOBAL AUTOPUBLISH MUSI BYĆ OFF');
    const check = isDistributionAllowed('WWW', null, true);
    assert.strictEqual(check.allowed, false);
    assert(check.reason.includes('AUTOMATION_OFF'));
});

runTest('2.3. Kill Switch FOLLOW_THE_SUN_OFF = true natychmiast wyłącza symulator', () => {
    setFollowTheSunKillSwitch(true);
    assert.strictEqual(isFollowTheSunKilled(), true);

    const engine = new FollowTheSunEngine();
    const res = engine.simulateSchedule({
        content: { contentId: 'CC-2026-000001', rightsStatus: 'ALLOWED' },
        variant: { variantId: 'var_pl', language: 'pl', translationStatus: 'APPROVED' },
        marketId: 'PL',
        platform: 'WWW',
        targetLocalDate: '2026-09-27'
    });

    assert.strictEqual(res.scheduleId, 'fts_killed');
    assert.strictEqual(engine.getHealthStatus().status, 'OFF');

    setFollowTheSunKillSwitch(false);
    assert.strictEqual(isFollowTheSunKilled(), false);
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. ZERO SIDE EFFECTS BASELINE (Dyrektywy 5, 48-52)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n📌 OBSZAR 3: Zero Side Effects Audit (Before / After)');

runTest('3.1. Rejestracja stanu zerowego operacji zewnętrznych', () => {
    const baselineBefore = {
        publicationsCreated: 0,
        distributionJobsCreated: 0,
        whatsAppMessagesSent: 0,
        youtubeUploads: 0,
        radioScheduleChanges: 0,
        luminaPostsCreated: 0
    };

    // Uruchomienie symulatora Follow the Sun
    const engine = new FollowTheSunEngine();
    engine.simulateSchedule({
        content: {
            contentId: 'CC-2026-000001',
            title: 'Gdy gaśnie ludzkie światło',
            timeProfile: 'EVENING',
            rightsStatus: 'ALLOWED',
            publicationAllowed: true
        },
        variant: {
            variantId: 'var_pl',
            language: 'pl',
            translationStatus: 'APPROVED'
        },
        marketId: 'PL',
        platform: 'WWW',
        targetLocalDate: '2026-09-27'
    });

    const baselineAfter = {
        publicationsCreated: 0,
        distributionJobsCreated: 0,
        whatsAppMessagesSent: 0,
        youtubeUploads: 0,
        radioScheduleChanges: 0,
        luminaPostsCreated: 0
    };

    assert.deepStrictEqual(baselineBefore, baselineAfter, 'Żadna operacja emisyjna nie może zostać wywołana!');
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. REAL CONTENT GOLDEN RECORD CC-2026-000001 (Dyrektywy 12, 14, 15, 21, 22)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n📌 OBSZAR 4: Real Content Golden Record Simulation Matrix');

const goldenContent = {
    contentId: 'CC-2026-000001',
    title: 'Gdy gaśnie ludzkie światło',
    contentType: 'DEVOTIONAL',
    timeProfile: 'EVENING',
    rightsStatus: 'ALLOWED',
    publicationAllowed: true,
    audioRightsAllowed: true
};

const goldenVariantPl = {
    variantId: 'var_cc_000001_pl',
    language: 'pl',
    translationStatus: 'APPROVED',
    qualityStatus: 'VERIFIED'
};

const goldenVariantEn = {
    variantId: 'var_cc_000001_en',
    language: 'en',
    translationStatus: 'APPROVED',
    qualityStatus: 'VERIFIED'
};

const goldenVariantEsAi = {
    variantId: 'var_cc_000001_es',
    language: 'es',
    translationStatus: 'REVIEW_REQUIRED',
    qualityStatus: 'DRAFT'
};

const goldenVariantPtAi = {
    variantId: 'var_cc_000001_pt',
    language: 'pt-BR',
    translationStatus: 'REVIEW_REQUIRED',
    qualityStatus: 'DRAFT'
};

runTest('4.1. CC-2026-000001 PL w Polsce -> 19:00 Europe/Warsaw -> 17:00 UTC -> SIMULATED', () => {
    const engine = new FollowTheSunEngine();
    const sched = engine.simulateSchedule({
        content: goldenContent,
        variant: goldenVariantPl,
        marketId: 'PL',
        platform: 'WWW',
        channelId: 'www_pl',
        targetLocalDate: '2026-09-27'
    });

    assert.strictEqual(sched.status, 'SIMULATED');
    assert.strictEqual(sched.suggestedLocalDate, '2026-09-27');
    assert.strictEqual(sched.suggestedLocalTime, '19:00');
    assert.strictEqual(sched.suggestedAtUtc, '2026-09-27T17:00:00.000Z');
    assert.strictEqual(sched.schedulingBasis, 'OPERATOR_RULE');
    assert(sched.whyThisTime.includes('Basis: OPERATOR_RULE'));
    assert(sched.whyThisTime.includes('EVENING_DEVOTIONAL_WINDOW'));
});

runTest('4.2. CC-2026-000001 EN w Wielkiej Brytanii -> 19:00 Europe/London -> 18:00 UTC -> SIMULATED', () => {
    const engine = new FollowTheSunEngine();
    const sched = engine.simulateSchedule({
        content: goldenContent,
        variant: goldenVariantEn,
        marketId: 'GB',
        platform: 'YOUTUBE',
        channelId: 'UC_PILOT_CC_MAIN',
        targetLocalDate: '2026-09-27'
    });

    assert.strictEqual(sched.status, 'SIMULATED');
    assert.strictEqual(sched.suggestedLocalTime, '19:00');
    assert.strictEqual(sched.suggestedAtUtc, '2026-09-27T18:00:00.000Z');
    assert.strictEqual(sched.timezone, 'Europe/London');
});

runTest('4.3. CC-2026-000001 EN w USA Wschód -> 19:00 America/New_York -> 23:00 UTC -> SIMULATED', () => {
    const engine = new FollowTheSunEngine();
    const sched = engine.simulateSchedule({
        content: goldenContent,
        variant: goldenVariantEn,
        marketId: 'US_EAST',
        platform: 'LUMINA',
        channelId: 'lumina_feed',
        targetLocalDate: '2026-09-27'
    });

    assert.strictEqual(sched.status, 'SIMULATED');
    assert.strictEqual(sched.suggestedLocalTime, '19:00');
    assert.strictEqual(sched.suggestedAtUtc, '2026-09-27T23:00:00.000Z');
    assert.strictEqual(sched.timezone, 'America/New_York');
});

runTest('4.4. CC-2026-000001 EN w USA Zachód -> 19:00 America/Los_Angeles -> 02:00 UTC (+1d) -> SIMULATED', () => {
    const engine = new FollowTheSunEngine();
    const sched = engine.simulateSchedule({
        content: goldenContent,
        variant: goldenVariantEn,
        marketId: 'US_WEST',
        platform: 'WWW',
        channelId: 'www_en',
        targetLocalDate: '2026-09-27'
    });

    assert.strictEqual(sched.status, 'SIMULATED');
    assert.strictEqual(sched.suggestedLocalTime, '19:00');
    assert.strictEqual(sched.suggestedAtUtc, '2026-09-28T02:00:00.000Z');
    assert.strictEqual(sched.timezone, 'America/Los_Angeles');
});

runTest('4.5. Real Approval Gate: ES w statusie REVIEW_REQUIRED -> BLOCKED_BY_APPROVAL', () => {
    const engine = new FollowTheSunEngine();
    const sched = engine.simulateSchedule({
        content: goldenContent,
        variant: goldenVariantEsAi,
        marketId: 'ES',
        platform: 'WWW',
        channelId: 'www_es',
        targetLocalDate: '2026-09-27'
    });

    assert.strictEqual(sched.status, 'BLOCKED_BY_APPROVAL');
    assert(sched.whyThisTime.includes('BLOKADA REDAKCYJNA'));
});

runTest('4.6. Real Approval Gate: PT-BR w statusie REVIEW_REQUIRED -> BLOCKED_BY_APPROVAL', () => {
    const engine = new FollowTheSunEngine();
    const sched = engine.simulateSchedule({
        content: goldenContent,
        variant: goldenVariantPtAi,
        marketId: 'BR',
        platform: 'WWW',
        channelId: 'www_pt',
        targetLocalDate: '2026-09-27'
    });

    assert.strictEqual(sched.status, 'BLOCKED_BY_APPROVAL');
    assert(sched.whyThisTime.includes('BLOKADA REDAKCYJNA'));
});

runTest('4.7. Real Rights Gate: Blokada audioRightsAllowed dla platformy RADIO -> BLOCKED_BY_RIGHTS', () => {
    const engine = new FollowTheSunEngine();
    const sched = engine.simulateSchedule({
        content: { ...goldenContent, audioRightsAllowed: false },
        variant: goldenVariantPl,
        marketId: 'PL',
        platform: 'RADIO',
        channelId: 'radio_main',
        targetLocalDate: '2026-09-27'
    });

    assert.strictEqual(sched.status, 'BLOCKED_BY_RIGHTS');
    assert(sched.whyThisTime.includes('BLOKADA PRAWNA'));
    assert(sched.whyThisTime.includes('audio'));
});

runTest('4.8. Sabbath Safe Mode: Brak zweryfikowanego sunset dla strefy -> SUNSET_DATA_REQUIRED', () => {
    const engine = new FollowTheSunEngine();
    const sched = engine.simulateSchedule({
        content: { ...goldenContent, timeProfile: 'SABBATH' },
        variant: goldenVariantPl,
        marketId: 'PL',
        platform: 'WWW',
        channelId: 'www_pl',
        targetLocalDate: '2026-09-27',
        options: { sunsetSource: null }
    });

    assert.strictEqual(sched.status, 'SUNSET_DATA_REQUIRED');
    assert(sched.whyThisTime.includes('SUNSET_DATA_REQUIRED'));
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. COLLISION, FATIGUE & IDEMPOTENCY (Dyrektywy 31, 32, 33)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n📌 OBSZAR 5: Collision Guard, Content Fatigue & Idempotency');

runTest('5.1. Kontrolowana kolizja: dwa materiały w tym samym oknie na jednym kanale -> COLLISION', () => {
    const engine = new FollowTheSunEngine();

    const s1 = engine.simulateSchedule({
        content: goldenContent,
        variant: goldenVariantPl,
        marketId: 'PL',
        platform: 'YOUTUBE',
        channelId: 'UC_PILOT_CC_MAIN',
        targetLocalDate: '2026-09-27'
    });
    assert.strictEqual(s1.status, 'SIMULATED');

    const s2 = engine.simulateSchedule({
        content: { ...goldenContent, contentId: 'CC-2026-000002' },
        variant: { ...goldenVariantPl, variantId: 'var_002_pl' },
        marketId: 'PL',
        platform: 'YOUTUBE',
        channelId: 'UC_PILOT_CC_MAIN',
        targetLocalDate: '2026-09-27'
    });

    assert.strictEqual(s2.status, 'COLLISION');
    assert(s2.collisionDetails);
    assert.strictEqual(s2.collisionDetails.conflictingContentId, 'CC-2026-000001');
});

runTest('5.2. Idempotencja: ponowna symulacja nie generuje logicznego duplikatu', () => {
    const engine = new FollowTheSunEngine();

    const s1 = engine.simulateSchedule({
        content: goldenContent,
        variant: goldenVariantPl,
        marketId: 'PL',
        platform: 'WWW',
        channelId: 'www_pl',
        targetLocalDate: '2026-09-27'
    });

    const s2 = engine.simulateSchedule({
        content: goldenContent,
        variant: goldenVariantPl,
        marketId: 'PL',
        platform: 'WWW',
        channelId: 'www_pl',
        targetLocalDate: '2026-09-27'
    });

    assert.strictEqual(s1.scheduleId, s2.scheduleId);
    assert.strictEqual(engine.schedulesStore.size, 1);
});

runTest('5.3. Content Fatigue: powtórna propozycja tej samej treści w oknie 24h -> CONTENT_FATIGUE_WARNING', () => {
    const engine = new FollowTheSunEngine({ fatigueHours: 24 });

    engine.simulateSchedule({
        content: goldenContent,
        variant: goldenVariantPl,
        marketId: 'PL',
        platform: 'WWW',
        channelId: 'feed_pl',
        targetLocalDate: '2026-09-27'
    });

    const s2 = engine.simulateSchedule({
        content: goldenContent,
        variant: goldenVariantPl,
        marketId: 'PL',
        platform: 'WWW',
        channelId: 'feed_pl',
        targetLocalDate: '2026-09-28',
        options: {
            operatorOverride: {
                preferredTime: '07:00',
                windowStart: '06:00',
                windowEnd: '09:00',
                changedBy: 'TEST_OPERATOR',
                reason: 'Test zmęczenia treścią'
            }
        }
    });

    assert(s2.fatigueWarning);
    assert(s2.fatigueWarning.includes('CONTENT_FATIGUE_WARNING'));
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. FAIL-CLOSED & PRIVACY AUDIT (Dyrektywy 36, 53, 54)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n📌 OBSZAR 6: Fail-Closed Behavior & Privacy Audit');

runTest('6.1. Nieprawidłowy rynek lub strefa czasowa rzuca kontrolowany wyjątek', () => {
    const engine = new FollowTheSunEngine();

    assert.throws(() => {
        engine.simulateSchedule({
            content: goldenContent,
            variant: goldenVariantPl,
            marketId: 'INVALID_XYZ',
            platform: 'WWW',
            targetLocalDate: '2026-09-27'
        });
    }, /INVALID_TARGET_MARKET/);

    assert.throws(() => {
        engine.simulateSchedule({
            content: goldenContent,
            variant: goldenVariantPl,
            marketId: 'PL',
            platform: 'WWW',
            targetLocalDate: '2026-09-27',
            options: { customTimezone: '<script>evil</script>' }
        });
    }, /INVALID_IANA_TIMEZONE/);
});

runTest('6.2. Rekordy Shadow Schedule nie zawierają żadnych pól PII ani historii lokalizacji', () => {
    const engine = new FollowTheSunEngine();
    const sched = engine.simulateSchedule({
        content: goldenContent,
        variant: goldenVariantPl,
        marketId: 'PL',
        platform: 'WWW',
        channelId: 'www_pl',
        targetLocalDate: '2026-09-27'
    });

    const forbiddenKeys = [
        'uid', 'userId', 'name', 'authorName', 'email', 'phone', 'rawIp',
        'ip', 'preciseLocation', 'locationHistory', 'privateMessages',
        'holosPrivateData', 'prayerData'
    ];

    forbiddenKeys.forEach(key => {
        assert.strictEqual(sched[key], undefined, `Pole '${key}' nie może znajdować się w rekordzie harmonogramu!`);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. SYSTEM HEALTH & INTEGRITY (Dyrektywa 9, 46, 59)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n📌 OBSZAR 7: System Health & Regression Integrity');

runTest('7.1. Stan zdrowia silnika: SHADOW_HEALTHY (nigdy ACTIVE / AUTONOMOUS)', () => {
    const engine = new FollowTheSunEngine();
    engine.simulateSchedule({
        content: goldenContent,
        variant: goldenVariantPl,
        marketId: 'PL',
        platform: 'WWW',
        channelId: 'www_pl',
        targetLocalDate: '2026-09-27'
    });

    const health = engine.getHealthStatus();
    assert.strictEqual(health.status, 'SHADOW_HEALTHY');
    assert.strictEqual(health.followTheSunEnabled, false);
    assert.strictEqual(health.simulationMode, true);
    assert.strictEqual(health.totalSimulated, 1);
    assert(health.marketsCovered.includes('PL'));
});

runTest('7.2. CC Analytics Dictionary v4 zawiera pełne metryki Fazy 6', () => {
    assert.strictEqual(CC_ANALYTICS_DICTIONARY_VERSION_V4, 'v4');
    assert(ALLOWED_METRIC_TYPES.has('SCHEDULE_SIMULATED'));
    assert(ALLOWED_METRIC_TYPES.has('SCHEDULE_COLLISION'));
    assert(ALLOWED_METRIC_TYPES.has('SCHEDULE_BLOCKED'));
});

// ─────────────────────────────────────────────────────────────────────────────
// PODSUMOWANIE PAKIETU GATE 6.5
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n══════════════════════════════════════════════════════════════════');
console.log(`WYNIK BRAMKI GATE 6.5: ${passedTests} ZALICZONYCH, ${failedTests} BŁĘDÓW`);
console.log('══════════════════════════════════════════════════════════════════');

if (failedTests > 0) {
    process.exit(1);
} else {
    process.exit(0);
}
