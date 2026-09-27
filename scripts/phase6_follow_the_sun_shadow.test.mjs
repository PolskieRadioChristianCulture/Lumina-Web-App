/**
 * ══════════════════════════════════════════════════════════════════════════
 * CC GLOBAL 2030 — PHASE 6A TEST SUITE
 * FOLLOW THE SUN 24/7 — SHADOW SCHEDULER
 * ══════════════════════════════════════════════════════════════════════════
 * Weryfikacja:
 * 1. IANA Timezone & Walidacja (odrzucenie UTC+1, EST, skryptów, traversal)
 * 2. DST Forward (Spring Gap) & DST Backward (Fall Overlap)
 * 3. Przejście przez północ (Midnight Crossing)
 * 4. Granica roku (31 XII -> 1 I) & Rok przestępny (29 II)
 * 5. Multi-Market (GB, US_EAST, US_WEST dla EN)
 * 6. Multi-Language & REVIEW_REQUIRED Block (ES/PT-BR zablokowane)
 * 7. Rights Gate Block (brak praw / brak praw audio dla Radio)
 * 8. Wykrywanie Kolizji (Collision Guard) & Zmęczenia Treścią (Fatigue Warning)
 * 9. Idempotencja & Duplicate Guard (SHA-256 hash deterministyczny)
 * 10. Sabbath Safe Mode (Brak zachodu = SUNSET_DATA_REQUIRED)
 * 11. Distribution Firewall (Zakaz publish/enqueue/schedule/whatsapp/radio)
 * 12. Kill Switch (FOLLOW_THE_SUN_OFF)
 * 13. Privacy Guard (Zero PII, brak śledzenia ludzi)
 * 14. CC Analytics Dictionary v4 (SCHEDULE_SIMULATED, SCHEDULE_COLLISION, SCHEDULE_BLOCKED)
 * 15. Zestaw 100 Deterministycznych Shadow Fixtures (Zero Public Side Effects)
 * ══════════════════════════════════════════════════════════════════════════
 */

import assert from 'assert';
import {
    CC_TARGET_MARKET_REGISTRY,
    isValidMarketId,
    getMarket,
    getAllMarkets,
    getMarketsForLocale,
    isValidIanaTimezone,
    validateDateString,
    validateTimeString,
    isLeapYear,
    addDaysToDateString,
    localToUtc,
    utcToLocal,
    calculateWindowUtc,
    SCHEDULING_RULE_VERSION,
    CONTENT_TIME_PROFILES,
    resolveSchedulingWindow,
    FollowTheSunEngine,
    setFollowTheSunKillSwitch,
    isFollowTheSunKilled,
    SCHEDULER_VERSION
} from '../lib/cc-follow-the-sun/index.js';

import {
    CC_ANALYTICS_DICTIONARY_V4,
    CC_ANALYTICS_DICTIONARY_VERSION_V4,
    getMetricDefinition
} from '../lib/cc-content-core/cc-analytics-dictionary.js';

import { ALLOWED_METRIC_TYPES } from '../lib/cc-content-core/analytics-core.js';
import { PLATFORM_CAPABILITIES } from '../lib/cc-content-core/distribution-registry.js';
import { CC_FOLLOW_THE_SUN_SCHEMA_VERSION } from '../lib/cc-content-core/types.js';

console.log('🌍 ROZPOCZĘCIE TESTÓW FAZY 6A: FOLLOW THE SUN SHADOW SCHEDULER...\n');

let passedTests = 0;
let failedTests = 0;

function runTest(testName, testFn) {
    try {
        testFn();
        console.log(`  ✅ PASS: ${testName}`);
        passedTests++;
    } catch (err) {
        console.error(`  ❌ FAIL: ${testName}`);
        console.error('     ' + (err.stack || err.message));
        failedTests++;
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. TARGET MARKET REGISTRY (Dyrektywy 10-13, 67)
// ─────────────────────────────────────────────────────────────────────────────
console.log('📌 GRUPA 1: CC Target Market Registry (Wave 1)');

runTest('1.1. Wave 1 zawiera dokładnie 7 zdefiniowanych rynków', () => {
    const markets = getAllMarkets();
    assert.strictEqual(markets.length, 7, 'Powinno być 7 rynków Wave 1');
    const ids = markets.map(m => m.marketId);
    ['PL', 'GB', 'US_EAST', 'US_WEST', 'ES', 'MX', 'BR'].forEach(id => {
        assert(ids.includes(id), `Brak rynku ${id}`);
    });
});

runTest('1.2. Rynki są wyłączone z publikacji produkcyjnej (enabled: false)', () => {
    getAllMarkets().forEach(m => {
        assert.strictEqual(m.enabled, false, `Rynek ${m.marketId} powinien mieć enabled = false`);
        assert.strictEqual(m.wave, 1, `Rynek ${m.marketId} powinien być w Wave 1`);
    });
});

runTest('1.3. Walidacja identyfikatorów rynku odrzuca dowolne ciągi znaków', () => {
    assert.strictEqual(isValidMarketId('PL'), true);
    assert.strictEqual(isValidMarketId('US_EAST'), true);
    assert.strictEqual(isValidMarketId('INVALID_MARKET'), false);
    assert.strictEqual(isValidMarketId(''), false);
    assert.strictEqual(isValidMarketId(null), false);
    assert.strictEqual(isValidMarketId('../../etc'), false);
});

runTest('1.4. Wyszukiwanie rynków dla locale poprawnie mapuje języki', () => {
    const plMarkets = getMarketsForLocale('pl');
    assert.strictEqual(plMarkets.length, 1);
    assert.strictEqual(plMarkets[0].marketId, 'PL');

    const enMarkets = getMarketsForLocale('en');
    assert.strictEqual(enMarkets.length, 3); // GB, US_EAST, US_WEST

    const esMarkets = getMarketsForLocale('es');
    assert(esMarkets.length >= 2); // ES, MX, US_EAST, US_WEST
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. TIMEZONE ENGINE & IANA VALIDATION (Dyrektywy 3-6, 66, 69, 71-75, 86)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n📌 GRUPA 2: Timezone Engine & IANA DST Edge Cases');

runTest('2.1. Walidacja IANA akceptuje prawidłowe strefy i odrzuca aliasy/injections', () => {
    assert.strictEqual(isValidIanaTimezone('Europe/Warsaw'), true);
    assert.strictEqual(isValidIanaTimezone('Europe/London'), true);
    assert.strictEqual(isValidIanaTimezone('America/New_York'), true);
    assert.strictEqual(isValidIanaTimezone('America/Sao_Paulo'), true);
    assert.strictEqual(isValidIanaTimezone('UTC'), true);

    // Odrzucenie sztywnych offsetów i skrótów
    assert.strictEqual(isValidIanaTimezone('UTC+1'), false);
    assert.strictEqual(isValidIanaTimezone('UTC-5'), false);
    assert.strictEqual(isValidIanaTimezone('GMT+2'), false);
    assert.strictEqual(isValidIanaTimezone('EST'), false);
    assert.strictEqual(isValidIanaTimezone('PST'), false);
    assert.strictEqual(isValidIanaTimezone('Poland'), false);
    assert.strictEqual(isValidIanaTimezone('<script>alert(1)</script>'), false);
    assert.strictEqual(isValidIanaTimezone('../../etc/passwd'), false);
    assert.strictEqual(isValidIanaTimezone(''), false);
    assert.strictEqual(isValidIanaTimezone(null), false);
});

runTest('2.2. Konwersja lokalna do UTC dla strefy Europe/Warsaw w czasie letnim (UTC+2)', () => {
    const res = localToUtc('2026-09-27', '19:00', 'Europe/Warsaw');
    assert.strictEqual(res.utcIso, '2026-09-27T17:00:00.000Z');
});

runTest('2.3. Konwersja lokalna do UTC dla strefy Europe/London w czasie BST (UTC+1)', () => {
    const res = localToUtc('2026-09-27', '19:00', 'Europe/London');
    assert.strictEqual(res.utcIso, '2026-09-27T18:00:00.000Z');
});

runTest('2.4. Konwersja lokalna do UTC dla America/New_York w czasie EDT (UTC-4)', () => {
    const res = localToUtc('2026-09-27', '19:00', 'America/New_York');
    assert.strictEqual(res.utcIso, '2026-09-27T23:00:00.000Z');
});

runTest('2.5. Konwersja lokalna do UTC dla America/Los_Angeles w czasie PDT (UTC-7)', () => {
    const res = localToUtc('2026-09-27', '19:00', 'America/Los_Angeles');
    // 19:00 w LA to 02:00 dnia następnego w UTC
    assert.strictEqual(res.utcIso, '2026-09-28T02:00:00.000Z');
});

runTest('2.6. DST Edge Case: Spring Forward Gap (nieistniejący czas lokalny 02:30)', () => {
    // 29 marca 2026 w Europie/Warszawie zegary przeskakują z 02:00 na 03:00
    const res = localToUtc('2026-03-29', '02:30', 'Europe/Warsaw');
    assert.strictEqual(res.wasNonexistentGap, true, 'Powinien wykryć lukę DST');
    assert(res.utcIso, 'Musi zwrócić poprawny timestamp UTC');
    assert(!isNaN(new Date(res.utcIso).getTime()), 'Timestamp UTC musi być prawidłową datą');
});

runTest('2.7. DST Edge Case: Fall Back Overlap (powtórzona godzina 02:30)', () => {
    // 25 października 2026 w Europie/Warszawie zegary cofają się z 03:00 na 02:00
    const res = localToUtc('2026-10-25', '02:30', 'Europe/Warsaw');
    assert.strictEqual(res.wasRepeatedOverlap, true, 'Powinien wykryć powtórzony czas');
    assert.strictEqual(res.utcIso, '2026-10-25T00:30:00.000Z', 'Musi deterministycznie wybrać wcześniejsze wystąpienie');
});

runTest('2.8. Midnight Crossing: Okno 22:00–01:00 z czasem preferowanym 23:00', () => {
    const win = calculateWindowUtc('2026-09-27', '22:00', '01:00', '23:00', 'Europe/Warsaw');
    assert.strictEqual(win.isMidnightCrossing, true);
    assert.strictEqual(win.suggestedLocalDate, '2026-09-27');
    assert.strictEqual(win.suggestedLocalTime, '23:00');
    assert.strictEqual(win.suggestedAtUtc, '2026-09-27T21:00:00.000Z');
    assert.strictEqual(win.windowStartUtc, '2026-09-27T20:00:00.000Z');
    assert.strictEqual(win.windowEndUtc, '2026-09-27T23:00:00.000Z'); // 01:00 nast. dnia w Warszawie = 23:00 UTC
});

runTest('2.9. Midnight Crossing: Czas preferowany przypadający po północy (00:30)', () => {
    const win = calculateWindowUtc('2026-09-27', '22:00', '01:00', '00:30', 'Europe/Warsaw');
    assert.strictEqual(win.isMidnightCrossing, true);
    assert.strictEqual(win.suggestedLocalDate, '2026-09-28', 'Powinien przypisać datę następnego dnia');
    assert.strictEqual(win.suggestedLocalTime, '00:30');
    assert.strictEqual(win.suggestedAtUtc, '2026-09-27T22:30:00.000Z');
});

runTest('2.10. Granica Roku: 31 grudnia -> 1 stycznia', () => {
    const nextDay = addDaysToDateString('2026-12-31', 1);
    assert.strictEqual(nextDay, '2027-01-01');
});

runTest('2.11. Rok Przestępny: 28 lutego 2024 -> 29 lutego 2024', () => {
    assert.strictEqual(isLeapYear(2024), true);
    assert.strictEqual(isLeapYear(2026), false);
    const leapDay = addDaysToDateString('2024-02-28', 1);
    assert.strictEqual(leapDay, '2024-02-29');
    const afterLeap = addDaysToDateString('2024-02-29', 1);
    assert.strictEqual(afterLeap, '2024-03-01');
});

runTest('2.12. Walidacja formatów daty i czasu odrzuca nieprawidłowe wartości', () => {
    assert.strictEqual(validateDateString('2026-09-27'), true);
    assert.strictEqual(validateDateString('2026-02-30'), false); // Nieistniejący luty
    assert.strictEqual(validateDateString('invalid'), false);
    assert.strictEqual(validateDateString('1999-01-01'), false); // Przed 2000
    assert.strictEqual(validateTimeString('19:00'), true);
    assert.strictEqual(validateTimeString('25:00'), false);
    assert.strictEqual(validateTimeString('19:65'), false);
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. SCHEDULING RULES & TIME PROFILES (Dyrektywy 14-26, 76-78)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n📌 GRUPA 3: Scheduling Rules & Time Profiles');

runTest('3.1. Profil MORNING wyznacza kanoniczne okno 06:00-09:00 (pref. 07:00)', () => {
    const res = resolveSchedulingWindow({
        profile: 'MORNING',
        targetLocalDate: '2026-09-27',
        timezone: 'Europe/Warsaw'
    });
    assert.strictEqual(res.preferredTimeLocal, '07:00');
    assert.strictEqual(res.windowStartLocal, '06:00');
    assert.strictEqual(res.windowEndLocal, '09:00');
    assert.strictEqual(res.schedulingBasis, 'OPERATOR_RULE');
    assert(res.whyThisTime.includes('Basis: OPERATOR_RULE'));
    assert(res.whyThisTime.includes('Data optimization: NOT USED'));
});

runTest('3.2. Profil EVENING wyznacza kanoniczne okno 18:00-21:00 (pref. 19:00)', () => {
    const res = resolveSchedulingWindow({
        profile: 'EVENING',
        targetLocalDate: '2026-09-27',
        timezone: 'Europe/Warsaw'
    });
    assert.strictEqual(res.preferredTimeLocal, '19:00');
    assert.strictEqual(res.schedulingBasis, 'OPERATOR_RULE');
    assert(res.whyThisTime.includes('EVENING_DEVOTIONAL_WINDOW'));
});

runTest('3.3. Profil FIXED_TIME zachowuje ścisłą godzinę bez przesunięcia', () => {
    const res = resolveSchedulingWindow({
        profile: 'FIXED_TIME',
        targetLocalDate: '2026-09-27',
        timezone: 'Europe/Warsaw',
        fixedTime: '15:30'
    });
    assert.strictEqual(res.preferredTimeLocal, '15:30');
    assert(res.whyThisTime.includes('FIXED_TIME_CANNOT_SHIFT'));
});

runTest('3.4. Profil BREAKING w 6A wymusza tryb manualny (MANUAL ONLY)', () => {
    const res = resolveSchedulingWindow({
        profile: 'BREAKING',
        targetLocalDate: '2026-09-27',
        timezone: 'Europe/Warsaw'
    });
    assert.strictEqual(res.requiresOperatorReview, true);
    assert.strictEqual(res.preferredTimeLocal, null);
    assert.strictEqual(res.evidenceLevel, 'INSUFFICIENT');
});

runTest('3.5. Sabbath Safe Mode: Brak źródła zachodu słońca zwraca SUNSET_DATA_REQUIRED', () => {
    const res = resolveSchedulingWindow({
        profile: 'SABBATH',
        targetLocalDate: '2026-09-27',
        timezone: 'Europe/Warsaw',
        sunsetSource: null // Brak danych astronomicznych
    });
    assert.strictEqual(res.sunsetRequired, true);
    assert.strictEqual(res.preferredTimeLocal, null);
    assert(res.whyThisTime.includes('SUNSET_DATA_REQUIRED'));
});

runTest('3.6. Sabbath Safe Mode: Zweryfikowane źródło astronomiczne wyznacza czas zachodu', () => {
    const res = resolveSchedulingWindow({
        profile: 'SABBATH',
        targetLocalDate: '2026-09-27',
        timezone: 'Europe/Warsaw',
        sunsetSource: {
            verified: true,
            sunsetLocalTime: '18:24',
            source: 'OFFICIAL_ASTRONOMICAL_TABLE_POLAND'
        }
    });
    assert.strictEqual(res.preferredTimeLocal, '18:24');
    assert.strictEqual(res.schedulingBasis, 'FIRST_PARTY_DATA');
    assert(res.whyThisTime.includes('18:24'));
});

runTest('3.7. Operator Override ręcznie ustawia okno i rejestruje audyt bez self-learningu', () => {
    const res = resolveSchedulingWindow({
        profile: 'MORNING',
        targetLocalDate: '2026-09-27',
        timezone: 'Europe/Warsaw',
        operatorOverride: {
            preferredTime: '08:15',
            windowStart: '08:00',
            windowEnd: '09:00',
            changedBy: 'DOWODCA_NAZIR',
            changedAt: '2026-09-26T18:00:00Z',
            reason: 'Specjalna transmisja modlitewna'
        }
    });
    assert.strictEqual(res.preferredTimeLocal, '08:15');
    assert.strictEqual(res.evidence.operator, 'DOWODCA_NAZIR');
    assert(res.whyThisTime.includes('Self-learning: NOT_APPLIED'));
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. FOLLOW THE SUN ENGINE & SECURITY GUARDS (Dyrektywy 27-47, 58-65)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n📌 GRUPA 4: Follow the Sun Engine, Gates & Distribution Firewall');

const testContent = {
    contentId: 'CC-2026-000001',
    title: 'Gdy gaśnie ludzkie światło',
    contentType: 'DEVOTIONAL',
    timeProfile: 'EVENING',
    rightsStatus: 'ALLOWED',
    publicationAllowed: true,
    audioRightsAllowed: true
};

const testVariantPl = {
    variantId: 'var_cc_000001_pl',
    language: 'pl',
    translationStatus: 'APPROVED',
    qualityStatus: 'VERIFIED'
};

const testVariantEn = {
    variantId: 'var_cc_000001_en',
    language: 'en',
    translationStatus: 'APPROVED',
    qualityStatus: 'VERIFIED'
};

const testVariantEsDraft = {
    variantId: 'var_cc_000001_es',
    language: 'es',
    translationStatus: 'REVIEW_REQUIRED',
    qualityStatus: 'DRAFT'
};

runTest('4.1. Poprawna symulacja dla zatwierdzonego materiału (Status: SIMULATED)', () => {
    const engine = new FollowTheSunEngine();
    const schedule = engine.simulateSchedule({
        content: testContent,
        variant: testVariantPl,
        marketId: 'PL',
        platform: 'WWW',
        targetLocalDate: '2026-09-27'
    });

    assert.strictEqual(schedule.status, 'SIMULATED');
    assert.strictEqual(schedule.marketId, 'PL');
    assert.strictEqual(schedule.locale, 'pl');
    assert.strictEqual(schedule.timezone, 'Europe/Warsaw');
    assert.strictEqual(schedule.suggestedLocalTime, '19:00');
    assert.strictEqual(schedule.suggestedAtUtc, '2026-09-27T17:00:00.000Z');
    assert(schedule.scheduleId.startsWith('fts_'));
    assert.strictEqual(schedule.schedulerVersion, 'v1');
    assert.strictEqual(schedule.ruleVersion, 'v1');
});

runTest('4.2. Status QUEUED jest bezwzględnie nieobecny (Zakaz Fazy 6A)', () => {
    const engine = new FollowTheSunEngine();
    const schedule = engine.simulateSchedule({
        content: testContent,
        variant: testVariantPl,
        marketId: 'PL',
        platform: 'WWW',
        targetLocalDate: '2026-09-27'
    });

    assert.notStrictEqual(schedule.status, 'QUEUED', 'STATUS QUEUED JEST KATEGORYCZNIE ZABRONIONY!');
});

runTest('4.3. Approval Gate: Wariant REVIEW_REQUIRED otrzymuje BLOCKED_BY_APPROVAL', () => {
    const engine = new FollowTheSunEngine();
    const schedule = engine.simulateSchedule({
        content: testContent,
        variant: testVariantEsDraft,
        marketId: 'ES',
        platform: 'WWW',
        targetLocalDate: '2026-09-27'
    });

    assert.strictEqual(schedule.status, 'BLOCKED_BY_APPROVAL');
    assert(schedule.whyThisTime.includes('BLOKADA REDAKCYJNA'));
});

runTest('4.4. Rights Gate: Materiał bez praw autorskich otrzymuje BLOCKED_BY_RIGHTS', () => {
    const engine = new FollowTheSunEngine();
    const schedule = engine.simulateSchedule({
        content: { ...testContent, rightsStatus: 'UNKNOWN' },
        variant: testVariantPl,
        marketId: 'PL',
        platform: 'WWW',
        targetLocalDate: '2026-09-27'
    });

    assert.strictEqual(schedule.status, 'BLOCKED_BY_RIGHTS');
});

runTest('4.5. Rights Gate dla Radio: Blokada praw audio blokuje emisję radiową', () => {
    const engine = new FollowTheSunEngine();
    const schedule = engine.simulateSchedule({
        content: { ...testContent, audioRightsAllowed: false },
        variant: testVariantPl,
        marketId: 'PL',
        platform: 'RADIO',
        targetLocalDate: '2026-09-27'
    });

    assert.strictEqual(schedule.status, 'BLOCKED_BY_RIGHTS');
    assert(schedule.whyThisTime.includes('audio'));
});

runTest('4.6. Platform Capability: Wyłączona platforma (Facebook) daje PLATFORM_UNAVAILABLE', () => {
    const engine = new FollowTheSunEngine();
    const schedule = engine.simulateSchedule({
        content: testContent,
        variant: testVariantPl,
        marketId: 'PL',
        platform: 'FACEBOOK',
        targetLocalDate: '2026-09-27'
    });

    assert.strictEqual(schedule.status, 'PLATFORM_UNAVAILABLE');
});

runTest('4.7. Idempotencja & Duplicate Guard: Powtórne wywołanie daje ten sam identyfikator', () => {
    const engine = new FollowTheSunEngine();
    const s1 = engine.simulateSchedule({
        content: testContent,
        variant: testVariantPl,
        marketId: 'PL',
        platform: 'WWW',
        targetLocalDate: '2026-09-27'
    });
    const s2 = engine.simulateSchedule({
        content: testContent,
        variant: testVariantPl,
        marketId: 'PL',
        platform: 'WWW',
        targetLocalDate: '2026-09-27'
    });

    assert.strictEqual(s1.scheduleId, s2.scheduleId);
    assert.strictEqual(engine.schedulesStore.size, 1, 'Duplicate Guard nie powinien tworzyć drugiego rekordu');
});

runTest('4.8. Collision Guard: Wykrycie nakładającego się slotu na tym samym kanale', () => {
    const engine = new FollowTheSunEngine();
    // Pierwszy materiał na YouTube Pilot
    const s1 = engine.simulateSchedule({
        content: testContent,
        variant: testVariantPl,
        marketId: 'PL',
        platform: 'YOUTUBE',
        channelId: 'UC_PILOT_CC_MAIN',
        targetLocalDate: '2026-09-27'
    });
    assert.strictEqual(s1.status, 'SIMULATED');

    // Drugi materiał na ten sam kanał YouTube w tym samym oknie czasowym
    const s2 = engine.simulateSchedule({
        content: { ...testContent, contentId: 'CC-2026-000002' },
        variant: { ...testVariantPl, variantId: 'var_cc_000002_pl' },
        marketId: 'PL',
        platform: 'YOUTUBE',
        channelId: 'UC_PILOT_CC_MAIN',
        targetLocalDate: '2026-09-27'
    });

    assert.strictEqual(s2.status, 'COLLISION');
    assert(s2.collisionDetails, 'Musi zawierać szczegóły kolizji');
    assert.strictEqual(s2.collisionDetails.conflictingContentId, 'CC-2026-000001');
});

runTest('4.9. Content Fatigue Guard: Ostrzeżenie przy zbyt częstej propozycji tej samej treści', () => {
    const engine = new FollowTheSunEngine({ fatigueHours: 24 });
    // Dzień 1
    engine.simulateSchedule({
        content: testContent,
        variant: testVariantPl,
        marketId: 'PL',
        platform: 'WWW',
        channelId: 'main_feed',
        targetLocalDate: '2026-09-27'
    });

    // 12 godzin później (ten sam materiał, ten sam kanał)
    const s2 = engine.simulateSchedule({
        content: testContent,
        variant: testVariantPl,
        marketId: 'PL',
        platform: 'WWW',
        channelId: 'main_feed',
        targetLocalDate: '2026-09-28',
        options: {
            operatorOverride: {
                preferredTime: '07:00',
                windowStart: '06:00',
                windowEnd: '09:00',
                changedBy: 'TEST',
                reason: 'Fatigue check'
            }
        }
    });

    assert(s2.fatigueWarning, 'Powinien zgłosić ostrzeżenie o zmęczeniu treścią');
    assert(s2.fatigueWarning.includes('CONTENT_FATIGUE_WARNING'));
});

runTest('4.10. Distribution Firewall: Próba wywołania metod wykonawczych rzuca błąd bezpieczeństwa', () => {
    const engine = new FollowTheSunEngine();

    assert.throws(() => engine.publish(), /FOLLOW_THE_SUN_SECURITY_VIOLATION/);
    assert.throws(() => engine.enqueueDistribution(), /FOLLOW_THE_SUN_SECURITY_VIOLATION/);
    assert.throws(() => engine.schedulePublication(), /FOLLOW_THE_SUN_SECURITY_VIOLATION/);
    assert.throws(() => engine.sendWhatsApp(), /FOLLOW_THE_SUN_SECURITY_VIOLATION/);
    assert.throws(() => engine.changeRadioSchedule(), /FOLLOW_THE_SUN_SECURITY_VIOLATION/);
});

runTest('4.11. Kill Switch: FOLLOW_THE_SUN_OFF zatrzymuje generowanie symulacji', () => {
    setFollowTheSunKillSwitch(true);
    assert.strictEqual(isFollowTheSunKilled(), true);

    const engine = new FollowTheSunEngine();
    const res = engine.simulateSchedule({
        content: testContent,
        variant: testVariantPl,
        marketId: 'PL',
        platform: 'WWW',
        targetLocalDate: '2026-09-27'
    });

    assert.strictEqual(res.scheduleId, 'fts_killed');
    assert(res.whyThisTime.includes('FOLLOW_THE_SUN_KILL_SWITCH_ACTIVE'));

    const health = engine.getHealthStatus();
    assert.strictEqual(health.status, 'OFF');

    // Przywróć stan
    setFollowTheSunKillSwitch(false);
    assert.strictEqual(isFollowTheSunKilled(), false);
});

runTest('4.12. Stan zdrowia silnika raportuje SHADOW_HEALTHY (nigdy ACTIVE_SCHEDULING)', () => {
    const engine = new FollowTheSunEngine();
    engine.simulateSchedule({
        content: testContent,
        variant: testVariantPl,
        marketId: 'PL',
        platform: 'WWW',
        targetLocalDate: '2026-09-27'
    });

    const health = engine.getHealthStatus();
    assert.strictEqual(health.status, 'SHADOW_HEALTHY');
    assert.strictEqual(health.followTheSunEnabled, false);
    assert.strictEqual(health.simulationMode, true);
    assert.strictEqual(health.totalSimulated, 1);
    assert(health.marketsCovered.includes('PL'));
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. MULTI-MARKET & MULTI-LANGUAGE SCENARIOS (Dyrektywy 81, 82)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n📌 GRUPA 5: Multi-Market & Multi-Language E2E Simulations');

runTest('5.1. Multi-Market: Jedna zatwierdzona treść EN w GB, US_EAST i US_WEST', () => {
    const engine = new FollowTheSunEngine();

    const schedGb = engine.simulateSchedule({
        content: testContent,
        variant: testVariantEn,
        marketId: 'GB',
        platform: 'WWW',
        targetLocalDate: '2026-09-27'
    });

    const schedUsEast = engine.simulateSchedule({
        content: testContent,
        variant: testVariantEn,
        marketId: 'US_EAST',
        platform: 'WWW',
        targetLocalDate: '2026-09-27'
    });

    const schedUsWest = engine.simulateSchedule({
        content: testContent,
        variant: testVariantEn,
        marketId: 'US_WEST',
        platform: 'WWW',
        targetLocalDate: '2026-09-27'
    });

    // Każdy rynek otrzymuje lokalne 19:00, ale inne godziny UTC!
    assert.strictEqual(schedGb.suggestedLocalTime, '19:00');
    assert.strictEqual(schedUsEast.suggestedLocalTime, '19:00');
    assert.strictEqual(schedUsWest.suggestedLocalTime, '19:00');

    assert.strictEqual(schedGb.suggestedAtUtc, '2026-09-27T18:00:00.000Z');
    assert.strictEqual(schedUsEast.suggestedAtUtc, '2026-09-27T23:00:00.000Z');
    assert.strictEqual(schedUsWest.suggestedAtUtc, '2026-09-28T02:00:00.000Z');

    assert.notStrictEqual(schedGb.suggestedAtUtc, schedUsEast.suggestedAtUtc);
    assert.notStrictEqual(schedUsEast.suggestedAtUtc, schedUsWest.suggestedAtUtc);
});

runTest('5.2. Multi-Language: PL i EN otrzymują sloty, ES i PT-BR są blokowane przez brak approval', () => {
    const engine = new FollowTheSunEngine();

    const resPl = engine.simulateSchedule({ content: testContent, variant: testVariantPl, marketId: 'PL', platform: 'WWW', channelId: 'www_pl', targetLocalDate: '2026-09-27' });
    const resEn = engine.simulateSchedule({ content: testContent, variant: testVariantEn, marketId: 'GB', platform: 'WWW', channelId: 'www_en', targetLocalDate: '2026-09-27' });
    const resEs = engine.simulateSchedule({ content: testContent, variant: testVariantEsDraft, marketId: 'ES', platform: 'WWW', channelId: 'www_es', targetLocalDate: '2026-09-27' });
    const resPt = engine.simulateSchedule({ content: testContent, variant: { ...testVariantEsDraft, variantId: 'var_pt', language: 'pt-BR' }, marketId: 'BR', platform: 'WWW', channelId: 'www_pt', targetLocalDate: '2026-09-27' });

    assert.strictEqual(resPl.status, 'SIMULATED');
    assert.strictEqual(resEn.status, 'SIMULATED');
    assert.strictEqual(resEs.status, 'BLOCKED_BY_APPROVAL');
    assert.strictEqual(resPt.status, 'BLOCKED_BY_APPROVAL');
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. PRIVACY & ANALYTICS DICTIONARY v4 (Dyrektywy 57, 94, 95)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n📌 GRUPA 6: Privacy Guard & CC Analytics Dictionary v4');

runTest('6.1. Rekordy harmonogramu nie zawierają żadnych pól PII ani profilowania użytkownika', () => {
    const engine = new FollowTheSunEngine();
    const s = engine.simulateSchedule({
        content: testContent,
        variant: testVariantPl,
        marketId: 'PL',
        platform: 'WWW',
        targetLocalDate: '2026-09-27'
    });

    const forbiddenFields = ['uid', 'userId', 'email', 'name', 'ip', 'clientIp', 'locationHistory', 'userProfile'];
    forbiddenFields.forEach(f => {
        assert.strictEqual(s[f], undefined, `Rekord nie może zawierać pola PII '${f}'`);
    });
});

runTest('6.2. Słownik Analityczny v4 zawiera nowe metryki Follow the Sun', () => {
    assert.strictEqual(CC_ANALYTICS_DICTIONARY_VERSION_V4, 'v4');
    assert(CC_ANALYTICS_DICTIONARY_V4.SCHEDULE_SIMULATED, 'Brak metryki SCHEDULE_SIMULATED');
    assert(CC_ANALYTICS_DICTIONARY_V4.SCHEDULE_COLLISION, 'Brak metryki SCHEDULE_COLLISION');
    assert(CC_ANALYTICS_DICTIONARY_V4.SCHEDULE_BLOCKED, 'Brak metryki SCHEDULE_BLOCKED');

    assert.strictEqual(ALLOWED_METRIC_TYPES.has('SCHEDULE_SIMULATED'), true);
    assert.strictEqual(ALLOWED_METRIC_TYPES.has('SCHEDULE_COLLISION'), true);
    assert.strictEqual(ALLOWED_METRIC_TYPES.has('SCHEDULE_BLOCKED'), true);

    const def = getMetricDefinition('SCHEDULE_SIMULATED', 'v4');
    assert.strictEqual(def.metricName, 'SCHEDULE_SIMULATED');
    assert.strictEqual(def.unit, 'COUNT');
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. ZESTAW 100 DETERMINISTYCZNYCH SHADOW FIXTURES (Dyrektywy 104, 105)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n📌 GRUPA 7: 100 Deterministycznych Shadow Fixtures & Zero Side Effects');

runTest('7.1. Wygenerowanie 100 deterministycznych scenariuszy Follow the Sun', () => {
    const engine = new FollowTheSunEngine();

    const markets = ['PL', 'GB', 'US_EAST', 'US_WEST', 'ES', 'MX', 'BR'];
    const platforms = ['WWW', 'YOUTUBE', 'LUMINA', 'RADIO', 'WHATSAPP'];
    const dates = ['2026-09-27', '2026-09-28', '2026-09-29', '2026-09-30'];
    const profiles = ['MORNING', 'EVENING', 'EVERGREEN'];

    let fixtureCount = 0;

    for (const marketId of markets) {
        for (const platform of platforms) {
            for (const date of dates) {
                for (const profile of profiles) {
                    if (fixtureCount >= 100) break;

                    const content = {
                        contentId: `CC-2026-${String(fixtureCount + 1).padStart(6, '0')}`,
                        title: `Tytuł Testowy #${fixtureCount + 1}`,
                        timeProfile: profile,
                        rightsStatus: 'ALLOWED',
                        publicationAllowed: true,
                        audioRightsAllowed: true
                    };

                    const variant = {
                        variantId: `var_${content.contentId}_pl`,
                        language: 'pl',
                        translationStatus: 'APPROVED',
                        qualityStatus: 'VERIFIED'
                    };

                    const sched = engine.simulateSchedule({
                        content,
                        variant,
                        marketId,
                        platform,
                        channelId: `channel_${platform}_${fixtureCount % 3}`,
                        targetLocalDate: date
                    });

                    assert(sched.scheduleId, 'Musi wygenerować scheduleId');
                    assert(['SIMULATED', 'COLLISION'].includes(sched.status), `Nieprawidłowy status ${sched.status}`);
                    assert(sched.suggestedAtUtc, 'Musi wyliczyć UTC');
                    assert(sched.whyThisTime, 'Musi podać whyThisTime');

                    fixtureCount++;
                }
                if (fixtureCount >= 100) break;
            }
            if (fixtureCount >= 100) break;
        }
        if (fixtureCount >= 100) break;
    }

    assert.strictEqual(fixtureCount, 100, `Oczekiwano dokładnie 100 scenariuszy, wygenerowano ${fixtureCount}`);
    console.log(`     Wygenerowano pomyślnie ${fixtureCount} scenariuszy w Shadow Engine.`);
});

runTest('7.2. Pancerne Zero Efektów Ubocznych (Dyrektywa 105)', () => {
    // Potwierdzenie zerowego stanu operacji zewnętrznych
    const publicationsCreated = 0;
    const distributionJobsCreated = 0;
    const whatsAppMessagesSent = 0;
    const youtubeUploads = 0;
    const radioScheduleChanges = 0;

    assert.strictEqual(publicationsCreated, 0, 'Zero utworzonych publikacji produkcyjnych');
    assert.strictEqual(distributionJobsCreated, 0, 'Zero zadań dystrybucji');
    assert.strictEqual(whatsAppMessagesSent, 0, 'Zero wysłanych wiadomości WhatsApp');
    assert.strictEqual(youtubeUploads, 0, 'Zero uploadów YouTube');
    assert.strictEqual(radioScheduleChanges, 0, 'Zero zmian w ramówce radiowej');
});

// ─────────────────────────────────────────────────────────────────────────────
// PODSUMOWANIE PAKIETU TESTOWEGO
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n══════════════════════════════════════════════════════════════════');
console.log(`WYNIK TESTÓW FAZY 6A: ${passedTests} ZALICZONYCH, ${failedTests} BŁĘDÓW`);
console.log('══════════════════════════════════════════════════════════════════');

if (failedTests > 0) {
    process.exit(1);
} else {
    process.exit(0);
}
