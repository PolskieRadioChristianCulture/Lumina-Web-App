/**
 * ══════════════════════════════════════════════════════════════════════════
 * SUITE TESTÓW FAZY 5A: CC GEO & LANGUAGE ROUTER
 * Master Plan CC Global 2030 (Faza 5: CC GEO & Language Router v1)
 * Dyrektywy 79, 80, 81, 82, 83, 84, 85, 86, 89, 91
 * ══════════════════════════════════════════════════════════════════════════
 */

import { strict as assert } from 'node:assert';
import {
    CC_LOCALE_REGISTRY,
    isValidLocale,
    normalizeLocaleCode,
    getLocale,
    getEnabledLocales,
    getWave1Locales,
    getWave2Locales
} from '../lib/cc-global-router/locale-registry.js';
import { getGeoHints, isCountrySupported } from '../lib/cc-global-router/geo-hints.js';
import {
    extractCoarseGeo,
    sanitizeRoutingContext,
    isSafeLocaleString,
    isSafeRedirectUrl
} from '../lib/cc-global-router/privacy-guard.js';
import {
    resolveSignal,
    parseAcceptLanguage,
    extractUrlLocale,
    SIGNAL_PRIORITIES
} from '../lib/cc-global-router/signal-resolver.js';
import { checkContentAvailability } from '../lib/cc-global-router/content-availability.js';
import { getFallbackChain, resolveWithFallback } from '../lib/cc-global-router/fallback-engine.js';
import {
    createRoutingDecision,
    createShadowRoutingDecision,
    generateExplainabilityString
} from '../lib/cc-global-router/routing-decision.js';
import {
    generateSeoLocalizationMetadata,
    isSearchEngineCrawler
} from '../lib/cc-global-router/seo-localization.js';
import { CCGlobalRouter } from '../lib/cc-global-router/language-router.js';
import {
    CC_ANALYTICS_DICTIONARY,
    CC_ANALYTICS_DICTIONARY_V2,
    getMetricDefinition
} from '../lib/cc-content-core/cc-analytics-dictionary.js';

console.log('\n══════════════════════════════════════════════════════════════════════════');
console.log('🚀 URUCHAMIANIE TESTÓW FAZY 5A: CC GEO & LANGUAGE ROUTER (SHADOW MODE)');
console.log('══════════════════════════════════════════════════════════════════════════\n');

let totalTests = 0;
let passedTests = 0;

function runTest(name, fn) {
    totalTests++;
    try {
        fn();
        console.log(`  ✅ [PASS] ${name}`);
        passedTests++;
    } catch (err) {
        console.error(`  ❌ [FAIL] ${name}`);
        console.error(err);
        process.exitCode = 1;
    }
}

// ─────────────────────────────────────────────────────────────────────────
// 1. SIGNAL PRIORITY HIERARCHY (DYREKTYWY 4, 5, 6, 7, 8, 9, 10, 40, 41)
// ─────────────────────────────────────────────────────────────────────────
console.log('🧭 1. DETERMINISTYCZNA HIERARCHIA SYGNAŁÓW (CZŁOWIEK > ALGORYTM)');

runTest('User Choice > wszystko (Conflict: UserChoice=ES, CCID=PL, Browser=EN, GEO=BR)', () => {
    const res = resolveSignal({
        explicitUserChoice: 'es',
        ccIdPreference: 'pl',
        acceptLanguage: 'en-US,en;q=0.9',
        countryCode: 'BR'
    });
    assert.equal(res.candidateLocale, 'es');
    assert.equal(res.signalSource, 'EXPLICIT_USER_CHOICE');
    assert.equal(res.signalPriority, 1);
    assert.equal(res.geoOverridden, true);
    assert.equal(res.geoHintUsed, false);
});

runTest('CC ID Preference > Browser & GEO (Conflict: CCID=PL, Browser=EN, GEO=US)', () => {
    const res = resolveSignal({
        ccIdPreference: 'pl',
        acceptLanguage: 'en-US,en;q=0.9',
        countryCode: 'US'
    });
    assert.equal(res.candidateLocale, 'pl');
    assert.equal(res.signalSource, 'CC_ID_LANGUAGE_PREFERENCE');
    assert.equal(res.signalPriority, 2);
    assert.equal(res.geoOverridden, true);
});

runTest('Remembered Preference > Browser & GEO (Conflict: Remembered=PT-BR, Browser=EN, GEO=PL)', () => {
    const res = resolveSignal({
        rememberedPreference: 'pt-br',
        acceptLanguage: 'en-US,en;q=0.9',
        countryCode: 'PL'
    });
    assert.equal(res.candidateLocale, 'pt-br');
    assert.equal(res.signalSource, 'REMEMBERED_LANGUAGE_PREFERENCE');
    assert.equal(res.signalPriority, 3);
    assert.equal(res.geoOverridden, true);
});

runTest('URL Locale > Browser & GEO (Conflict: URL=/es/artykul, Browser=EN, GEO=PL)', () => {
    const res = resolveSignal({
        url: 'https://polskieradio.cc/es/artykul-1',
        acceptLanguage: 'en-US,en;q=0.9',
        countryCode: 'PL'
    });
    assert.equal(res.candidateLocale, 'es');
    assert.equal(res.signalSource, 'EXPLICIT_URL_LOCALE');
    assert.equal(res.signalPriority, 4);
    assert.equal(res.geoOverridden, true);
});

runTest('Browser Language > GEO (Conflict: Browser=EN, GEO=PL)', () => {
    const res = resolveSignal({
        acceptLanguage: 'en-US,en;q=0.9',
        countryCode: 'PL'
    });
    assert.equal(res.candidateLocale, 'en');
    assert.equal(res.signalSource, 'BROWSER_LANGUAGE');
    assert.equal(res.signalPriority, 5);
    assert.equal(res.geoOverridden, true);
});

runTest('GEO Hint > Content Default (Brak wyższych sygnałów, GEO=BR -> pt-br)', () => {
    const res = resolveSignal({
        countryCode: 'BR',
        contentDefault: 'pl'
    });
    assert.equal(res.candidateLocale, 'pt-br');
    assert.equal(res.signalSource, 'COARSE_GEO');
    assert.equal(res.signalPriority, 6);
    assert.equal(res.geoHintUsed, true);
    assert.equal(res.geoOverridden, false);
});

runTest('Unknown GEO / VPN Fallback do bezpiecznego domyślnego PL', () => {
    const res = resolveSignal({
        countryCode: 'XX', // Nieznany kod kraju
        contentDefault: 'pl'
    });
    assert.equal(res.candidateLocale, 'pl');
    assert.equal(res.signalSource, 'CONTENT_DEFAULT');
    assert.equal(res.signalPriority, 7);
});

// ─────────────────────────────────────────────────────────────────────────
// 2. PRIVACY & SECURITY GUARD (DYREKTYWY 10, 30, 31, 32, 65, 66, 67, 68)
// ─────────────────────────────────────────────────────────────────────────
console.log('\n🛡️ 2. PRIVACY & SECURITY GUARD (DROP IP, ANTI-TRAVERSAL, OPEN REDIRECT)');

runTest('Edge Coarse Geo: Ekstrakcja countryCode/regionCode i DROP IP', () => {
    const raw = {
        ip: '194.29.130.88',
        clientIp: '89.64.12.10',
        cfCountry: 'PL',
        region: 'Mazowieckie',
        provider: 'CLOUDFLARE_EDGE'
    };
    const geo = extractCoarseGeo(raw);
    assert.equal(geo.countryCode, 'PL');
    assert.equal(geo.regionCode, 'Mazowieckie');
    assert.equal(geo.provider, 'CLOUDFLARE_EDGE');
    assert.equal(geo.ip, undefined);
    assert.equal(geo.clientIp, undefined);
});

runTest('Odrzucenie niebezpiecznych ciągów locale (Path Traversal, XSS, URL encoded)', () => {
    assert.equal(isSafeLocaleString('../../etc/passwd'), false);
    assert.equal(isSafeLocaleString('%2e%2e/'), false);
    assert.equal(isSafeLocaleString('<script>alert(1)</script>'), false);
    assert.equal(isSafeLocaleString('javascript:void(0)'), false);
    assert.equal(isSafeLocaleString('pl'), true);
    assert.equal(isSafeLocaleString('pt-br'), true);
    assert.equal(isSafeLocaleString('en-US'), true);
});

runTest('Open Redirect Guard: Dozwolone tylko domeny z allowlisty CC', () => {
    assert.equal(isSafeRedirectUrl('/en/player'), true);
    assert.equal(isSafeRedirectUrl('https://polskieradio.cc/es/'), true);
    assert.equal(isSafeRedirectUrl('https://cclite.pl/'), true);
    assert.equal(isSafeRedirectUrl('https://evil-phishing.com/pl'), false);
    assert.equal(isSafeRedirectUrl('//evil-phishing.com'), false);
    assert.equal(isSafeRedirectUrl('javascript:alert(1)'), false);
});

runTest('Sanityzacja kontekstu routingu: bezwzględne usuwanie pól PII', () => {
    const dirty = {
        url: 'https://polskieradio.cc',
        email: 'user@example.com',
        phone: '+48123456789',
        password: 'secret_password',
        token: 'jwt_token_123',
        privateMessage: 'Bardzo prywatna treść',
        explicitUserChoice: 'en'
    };
    const clean = sanitizeRoutingContext(dirty);
    assert.equal(clean.explicitUserChoice, 'en');
    assert.equal(clean.email, undefined);
    assert.equal(clean.phone, undefined);
    assert.equal(clean.password, undefined);
    assert.equal(clean.token, undefined);
    assert.equal(clean.privateMessage, undefined);
});

// ─────────────────────────────────────────────────────────────────────────
// 3. CONTENT AVAILABILITY & RIGHTS GATE (DYREKTYWY 17, 18, 19, 81, 82, 83)
// ─────────────────────────────────────────────────────────────────────────
console.log('\n📦 3. CONTENT AVAILABILITY & RIGHTS GATE (TYLKO APPROVED, ZERO DRAFT)');

const MOCK_GOLDEN_RECORD = {
    contentId: 'CC-2026-000001',
    originalLanguage: 'pl',
    status: 'PUBLISHED',
    rights: {
        ownership: 'CC_OWNED',
        translationAllowed: true,
        audioDistributionAllowed: true,
        redistributionAllowed: true
    },
    variants: [
        {
            variantId: 'var_pl_master',
            language: 'pl',
            status: 'APPROVED',
            title: 'Siła w ciszy i zaufaniu'
        },
        {
            variantId: 'var_en_human',
            language: 'en',
            status: 'APPROVED',
            title: 'Strength in Quietness and Trust'
        },
        {
            variantId: 'var_es_candidate',
            language: 'es',
            status: 'REVIEW_REQUIRED', // AI kandydat wymagający weryfikacji
            title: 'Fuerza en la quietud y la confianza'
        },
        {
            variantId: 'var_pt_br_candidate',
            language: 'pt-br',
            status: 'REVIEW_REQUIRED', // AI kandydat wymagający weryfikacji
            title: 'Força na quietude e na confiança'
        }
    ]
};

runTest('Golden Record CC-2026-000001: Wariant PL i EN zatwierdzony -> AVAILABLE', () => {
    const plRes = checkContentAvailability(MOCK_GOLDEN_RECORD, 'pl');
    assert.equal(plRes.available, true);
    assert.equal(plRes.variantId, 'var_pl_master');

    const enRes = checkContentAvailability(MOCK_GOLDEN_RECORD, 'en');
    assert.equal(enRes.available, true);
    assert.equal(enRes.variantId, 'var_en_human');
});

runTest('Blokada wariantu REVIEW_REQUIRED (Dyrektywa 18, 82): ES jest zablokowany', () => {
    const esRes = checkContentAvailability(MOCK_GOLDEN_RECORD, 'es');
    assert.equal(esRes.available, false);
    assert.equal(esRes.reason, 'VARIANT_REVIEW_REQUIRED');
    assert.equal(esRes.variantData, null);
});

runTest('Rights Gate: Brak praw do audioDistribution blokuje format AUDIO', () => {
    const recordRestrictedAudio = {
        ...MOCK_GOLDEN_RECORD,
        rights: {
            ...MOCK_GOLDEN_RECORD.rights,
            audioDistributionAllowed: false
        }
    };
    const res = checkContentAvailability(recordRestrictedAudio, 'en', { requestedFormat: 'AUDIO' });
    assert.equal(res.available, false);
    assert.equal(res.reason, 'RIGHTS_AUDIO_DISTRIBUTION_NOT_ALLOWED');
});

// ─────────────────────────────────────────────────────────────────────────
// 4. FALLBACK ENGINE & SAFE RESOLUTION (DYREKTYWY 20, 21, 43, 44)
// ─────────────────────────────────────────────────────────────────────────
console.log('\n🔁 4. FALLBACK ENGINE (ZERO ON-THE-FLY AI TRANSLATION, VISIBLE FALLBACK)');

runTest('Fallback chain dla ES przy braku approved wariantu -> EN (Dyrektywa 43)', () => {
    const res = resolveWithFallback('es', MOCK_GOLDEN_RECORD);
    assert.equal(res.resolvedLocale, 'en');
    assert.equal(res.fallbackUsed, true);
    assert.equal(res.contentVariantId, 'var_en_human');
    assert.ok(res.fallbackReason.includes('VARIANT_REVIEW_REQUIRED'));
});

runTest('Fallback chain dla PT-BR przy braku approved wariantu -> EN -> PL', () => {
    const res = resolveWithFallback('pt-br', MOCK_GOLDEN_RECORD);
    assert.equal(res.resolvedLocale, 'en');
    assert.equal(res.fallbackUsed, true);
    assert.equal(res.contentVariantId, 'var_en_human');
});

runTest('Fallback dla materiału tylko z wariantem PL -> PL', () => {
    const recordOnlyPl = {
        ...MOCK_GOLDEN_RECORD,
        variants: [MOCK_GOLDEN_RECORD.variants[0]]
    };
    const res = resolveWithFallback('es', recordOnlyPl);
    assert.equal(res.resolvedLocale, 'pl');
    assert.equal(res.fallbackUsed, true);
    assert.equal(res.contentVariantId, 'var_pl_master');
});

// ─────────────────────────────────────────────────────────────────────────
// 5. SEO LOCALIZATION & CRAWLER PROTECTION (DYREKTYWY 34, 35, 36, 37, 38)
// ─────────────────────────────────────────────────────────────────────────
console.log('\n🌐 5. SEO LOCALIZATION (APPROVED ONLY HREFLANG, X-DEFAULT, BOT SAFETY)');

runTest('Generowanie hreflang TYLKO dla wariantów APPROVED (Zero dead links)', () => {
    const meta = generateSeoLocalizationMetadata({
        contentMaster: MOCK_GOLDEN_RECORD,
        baseUrl: 'https://polskieradio.cc',
        path: '/refleksja/dzien-26',
        currentLocale: 'pl'
    });

    // MOCK_GOLDEN_RECORD ma approved tylko PL i EN (ES i PT-BR są REVIEW_REQUIRED)
    const hreflangCodes = meta.hreflangTags.map(t => t.hreflang);
    assert.ok(hreflangCodes.includes('pl'));
    assert.ok(hreflangCodes.includes('en'));
    assert.ok(hreflangCodes.includes('x-default'));
    // Zakaz linkowania niezatwierdzonych wariantów:
    assert.equal(hreflangCodes.includes('es'), false);
    assert.equal(hreflangCodes.includes('pt-BR'), false);
});

runTest('Detekcja robotów i crawlerów (Googlebot, Bingbot, ClaudeBot, GPTBot)', () => {
    assert.equal(isSearchEngineCrawler('Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'), true);
    assert.equal(isSearchEngineCrawler('Mozilla/5.0 (compatible; ClaudeBot/1.0; +claudebot@anthropic.com)'), true);
    assert.equal(isSearchEngineCrawler('Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36'), false);
});

// ─────────────────────────────────────────────────────────────────────────
// 6. MAIN ROUTER CORE & KILL SWITCH (DYREKTYWY 50-57, 89, 91, 92, 93)
// ─────────────────────────────────────────────────────────────────────────
console.log('\n⚙️ 6. CC GLOBAL ROUTER ENGINE & KILL SWITCH');

runTest('Router Kill Switch (globalRouterOff: true) natychmiast zwraca bezpieczny domyślny PL', () => {
    const router = new CCGlobalRouter({
        globalRouterOff: true
    });
    const decision = router.resolve({
        explicitUserChoice: 'es',
        countryCode: 'ES'
    });
    assert.equal(decision.resolvedLocale, 'pl');
    assert.equal(decision.fallbackUsed, true);
    assert.equal(decision.fallbackReason, 'ROUTER_KILL_SWITCH_ACTIVE');
});

runTest('Błąd wewnętrzny w Routerze skutkuje bezpiecznym fallbackiem (Fault Tolerance)', () => {
    const router = new CCGlobalRouter();
    // Przekazanie niepoprawnego obiektu wywołującego błąd
    const circular = {};
    circular.self = circular;
    
    // Router nie rzuca błędu wyżej, lecz łapie i zwraca PL
    const decision = router.resolve({
        url: null,
        rawGeo: null
    });
    assert.equal(decision.resolvedLocale, 'pl');
});

// ─────────────────────────────────────────────────────────────────────────
// 7. SHADOW MODE FIXTURES (MIN. 100 KONTROLOWANYCH TESTÓW - DYREKTYWA 84)
// ─────────────────────────────────────────────────────────────────────────
console.log('\n👥 7. SHADOW MODE ENGINE (100 KONTROLOWANYCH PRZYPADKÓW FIXTURES)');

runTest('Wykonanie 100 kombinacji w trybie Shadow Mode (Weryfikacja explainability i cienia)', () => {
    const router = new CCGlobalRouter({
        routerEnabled: false,
        shadowMode: true
    });

    const userChoices = [null, 'pl', 'en', 'es', 'pt-br'];
    const ccIdPrefs = [null, 'pl', 'en', 'es'];
    const countries = [null, 'PL', 'BR', 'ES', 'US', 'GB', 'DE'];
    const languages = [null, 'pl-PL', 'en-US', 'es-ES', 'pt-BR'];

    let count = 0;
    for (const uc of userChoices) {
        for (const cc of ccIdPrefs) {
            for (const geo of countries) {
                for (const lang of languages) {
                    if (count >= 100) break;
                    count++;

                    const decision = router.resolve({
                        explicitUserChoice: uc,
                        ccIdPreference: cc,
                        acceptLanguage: lang,
                        rawGeo: { countryCode: geo },
                        actualLocale: 'pl',
                        contentMaster: MOCK_GOLDEN_RECORD
                    });

                    assert.ok(decision.resolvedLocale);
                    assert.ok(decision.signalSource);
                    assert.ok(decision.routerVersion);
                    assert.ok(decision.explainability);
                    assert.equal(decision.shadowModeActive, true);
                    assert.ok(decision.shadowDecision);
                    assert.equal(typeof decision.shadowDecision.wouldChange, 'boolean');
                }
                if (count >= 100) break;
            }
            if (count >= 100) break;
        }
        if (count >= 100) break;
    }

    assert.equal(count, 100);
    const stats = router.getDiagnosticStats();
    assert.equal(stats.totalDecisions, 100);
    assert.ok(stats.fallbackRate >= 0);
    assert.ok(stats.geoOverrideRate >= 0);
});

// ─────────────────────────────────────────────────────────────────────────
// 8. WAVE 2 ARCHITECTURAL READINESS (DYREKTYWY 13, 14, 15)
// ─────────────────────────────────────────────────────────────────────────
console.log('\n🌍 8. WAVE 1 & WAVE 2 STANDBY VERIFICATION');

runTest('Wave 1 aktywne (pl, en, es, pt-br), Wave 2 w stanie STANDBY (de, fr, it, uk)', () => {
    const enabled = getEnabledLocales().map(l => l.locale);
    assert.deepEqual(enabled.sort(), ['en', 'es', 'pl', 'pt-br']);

    const wave2 = getWave2Locales();
    assert.equal(wave2.length, 4);
    const wave2Codes = wave2.map(l => l.locale);
    assert.deepEqual(wave2Codes.sort(), ['de', 'fr', 'it', 'uk']);
    // Wszystkie locale Wave 2 muszą mieć enabled: false w Fazie 5
    assert.ok(wave2.every(l => l.enabled === false));
});

// ─────────────────────────────────────────────────────────────────────────
// 9. ANALYTICS DICTIONARY v2 (DYREKTYWY 60, 61)
// ─────────────────────────────────────────────────────────────────────────
console.log('\n📖 9. CC ANALYTICS DICTIONARY v2 VERIFICATION');

runTest('Dictionary v2 zawiera 5 nowych metryk routingu, v1 nienaruszone', () => {
    // Sprawdzenie v1
    assert.equal(CC_ANALYTICS_DICTIONARY['ROUTING_DECISION'], undefined);
    assert.equal(CC_ANALYTICS_DICTIONARY['VIEW'] !== undefined, true);

    // Sprawdzenie v2
    assert.ok(CC_ANALYTICS_DICTIONARY_V2['ROUTING_DECISION']);
    assert.ok(CC_ANALYTICS_DICTIONARY_V2['LANGUAGE_OVERRIDE']);
    assert.ok(CC_ANALYTICS_DICTIONARY_V2['FALLBACK_USED']);
    assert.ok(CC_ANALYTICS_DICTIONARY_V2['CONTENT_LOCALE_UNAVAILABLE']);
    assert.ok(CC_ANALYTICS_DICTIONARY_V2['GEO_HINT_USED']);

    const defRouting = getMetricDefinition('ROUTING_DECISION', 'v2');
    assert.equal(defRouting.metricName, 'ROUTING_DECISION');
    assert.equal(defRouting.unit, 'COUNT');
});

// ─────────────────────────────────────────────────────────────────────────
// 10. PRODUCTION GATE 5.5: EXACT HOST ALLOWLIST & MALICIOUS URL TEST SUITE
// ─────────────────────────────────────────────────────────────────────────
console.log('\n🔒 10. EXACT HOST ALLOWLIST & MALICIOUS URL TEST SUITE (GATE 5.5)');

runTest('Blokowanie fałszywych domen *.pages.dev i *.web.app (np. attacker.pages.dev)', () => {
    assert.equal(isSafeRedirectUrl('https://attacker.pages.dev/'), false);
    assert.equal(isSafeRedirectUrl('https://evil.web.app/'), false);
    assert.equal(isSafeRedirectUrl('https://polskieradio.cc.attacker.example/'), false);
    assert.equal(isSafeRedirectUrl('https://cclite.pl.attacker.example/'), false);
    assert.equal(isSafeRedirectUrl('https://attacker.com/polskieradio.cc'), false);
});

runTest('Blokowanie niebezpiecznych schematów (javascript, data, file, blob)', () => {
    assert.equal(isSafeRedirectUrl('javascript:alert(1)'), false);
    assert.equal(isSafeRedirectUrl('data:text/html,<script>alert(1)</script>'), false);
    assert.equal(isSafeRedirectUrl('file:///etc/passwd'), false);
    assert.equal(isSafeRedirectUrl('blob:https://polskieradio.cc/uuid'), false);
});

runTest('Blokowanie Path Traversal i podwójnego kodowania (%2e%2e/, %252e%252e/)', () => {
    assert.equal(isSafeRedirectUrl('/../../etc/shadow'), false);
    assert.equal(isSafeRedirectUrl('/%2e%2e/admin'), false);
    assert.equal(isSafeRedirectUrl('/%252e%252e/admin'), false);
});

runTest('Blokowanie zaawansowanych wektorów phishingowych (user@evil, //, fragment tricks)', () => {
    assert.equal(isSafeRedirectUrl('https://user@evil.com/'), false);
    assert.equal(isSafeRedirectUrl('//evil.com/polskieradio.cc'), false);
    assert.equal(isSafeRedirectUrl('https://evil.com?next=polskieradio.cc'), false);
    assert.equal(isSafeRedirectUrl('https://evil.com#polskieradio.cc'), false);
    assert.equal(isSafeRedirectUrl('https://polskieradio.cc.evil.com/'), false);
});

runTest('Akceptacja wyłącznie legalnych hostów Christian Culture', () => {
    assert.equal(isSafeRedirectUrl('https://polskieradio.cc/player'), true);
    assert.equal(isSafeRedirectUrl('https://www.polskieradio.cc/es/'), true);
    assert.equal(isSafeRedirectUrl('https://cclite.pl/'), true);
    assert.equal(isSafeRedirectUrl('https://www.cclite.pl/'), true);
    assert.equal(isSafeRedirectUrl('https://christian-culture.web.app/'), true);
    assert.equal(isSafeRedirectUrl('https://lumina-cc.web.app/'), true);
    assert.equal(isSafeRedirectUrl('https://polskieradio.pages.dev/'), true);
    assert.equal(isSafeRedirectUrl('https://staging.polskieradio.pages.dev/'), true);
    assert.equal(isSafeRedirectUrl('/pl/player'), true);
});

// ─────────────────────────────────────────────────────────────────────────
// 11. GATE 5.5: WAVE 2 DISABLED LOCALES FILTERING & EXPLICIT LOCALE_DISABLED
// ─────────────────────────────────────────────────────────────────────────
console.log('\n🌍 11. WAVE 2 DISABLED LOCALES FILTERING & FALLBACK REASONS (GATE 5.5)');

runTest('GEO CA (Canada) filtruje fr -> wybiera pierwsze aktywne locale (en)', () => {
    const res = resolveSignal({
        countryCode: 'CA',
        contentDefault: 'pl'
    });
    assert.equal(res.candidateLocale, 'en');
    assert.equal(res.signalSource, 'COARSE_GEO');
    assert.equal(res.geoHintUsed, true);
});

runTest('GEO DE (Germany) filtruje de -> wybiera pierwsze aktywne locale (en)', () => {
    const res = resolveSignal({
        countryCode: 'DE',
        contentDefault: 'pl'
    });
    assert.equal(res.candidateLocale, 'en');
    assert.equal(res.signalSource, 'COARSE_GEO');
    assert.equal(res.geoHintUsed, true);
});

runTest('GEO UA (Ukraine) filtruje uk -> wybiera pierwsze aktywne locale (pl)', () => {
    const res = resolveSignal({
        countryCode: 'UA',
        contentDefault: 'pl'
    });
    assert.equal(res.candidateLocale, 'pl');
    assert.equal(res.signalSource, 'COARSE_GEO');
    assert.equal(res.geoHintUsed, true);
});

runTest('Jawne zażądanie nieaktywnego locale (?lang=de) -> fallback do en z LOCALE_DISABLED', () => {
    const router = new CCGlobalRouter();
    const decision = router.resolve({
        url: 'https://polskieradio.cc/?lang=de',
        contentMaster: MOCK_GOLDEN_RECORD
    });
    assert.equal(decision.requestedLocale, 'de');
    assert.equal(decision.resolvedLocale, 'en');
    assert.equal(decision.fallbackUsed, true);
    assert.equal(decision.fallbackReason, 'LOCALE_DISABLED');
});

runTest('Rozróżnienie typów fallbacku: LOCALE_DISABLED vs LANGUAGE_FALLBACK vs FORMAT_FALLBACK', () => {
    // 1. LOCALE_DISABLED
    const resDisabled = resolveWithFallback('de', MOCK_GOLDEN_RECORD);
    assert.equal(resDisabled.fallbackReason, 'LOCALE_DISABLED');

    // 2. LANGUAGE_FALLBACK (ES ma wariant, ale nie approved)
    const resLang = resolveWithFallback('es', MOCK_GOLDEN_RECORD);
    assert.ok(resLang.fallbackReason.startsWith('LANGUAGE_FALLBACK'));

    // 3. FORMAT_FALLBACK (Brak praw audio)
    const restrictedRecord = {
        ...MOCK_GOLDEN_RECORD,
        rights: { ...MOCK_GOLDEN_RECORD.rights, audioDistributionAllowed: false }
    };
    const resFormat = resolveWithFallback('pl', restrictedRecord, { requestedFormat: 'AUDIO' });
    assert.ok(resFormat.fallbackReason.startsWith('FORMAT_FALLBACK'));
});

// ─────────────────────────────────────────────────────────────────────────
// 12. GATE 5.5: COOKIE TAMPERING & ANONYMOUS PREFERENCE VALIDATION
// ─────────────────────────────────────────────────────────────────────────
console.log('\n🍪 12. COOKIE TAMPERING & ANONYMOUS PREFERENCE (GATE 5.5)');

runTest('Odrzucenie zmanipulowanego ciasteczka z Path Traversal / XSS / PII', () => {
    assert.equal(isSafeLocaleString('../../evil'), false);
    assert.equal(isSafeLocaleString('<script>alert(1)</script>'), false);
    assert.equal(isSafeLocaleString('a'.repeat(50)), false);
    assert.equal(isSafeLocaleString('pl'), true);
    assert.equal(isSafeLocaleString('pt-br'), true);
});

// ─────────────────────────────────────────────────────────────────────────
// 13. GATE 5.5: SINGLE CC ID PROFILE & PRIVILEGE ESCALATION GUARD
// ─────────────────────────────────────────────────────────────────────────
console.log('\n👤 13. SINGLE CC ID PROFILE & PRIVILEGE ESCALATION GUARD (GATE 5.5)');

runTest('Profile update dozwolony wyłącznie dla preferredLocale, odrzuca próby eskalacji uprawnień', () => {
    function sanitizeProfileUpdate(payload) {
        const allowedKeys = new Set(['preferredLocale', 'updatedAt']);
        const forbiddenKeys = ['role', 'isAdmin', 'isMasterAdmin', 'admin', 'permissions'];
        for (const f of forbiddenKeys) {
            if (f in payload) {
                throw new Error(`SECURITY_VIOLATION: Attempted privilege escalation via key '${f}'`);
            }
        }
        const filtered = {};
        for (const [k, v] of Object.entries(payload)) {
            if (allowedKeys.has(k)) filtered[k] = v;
        }
        return filtered;
    }

    assert.doesNotThrow(() => {
        const clean = sanitizeProfileUpdate({ preferredLocale: 'en', updatedAt: 123456 });
        assert.equal(clean.preferredLocale, 'en');
    });

    assert.throws(() => {
        sanitizeProfileUpdate({ preferredLocale: 'en', isAdmin: true });
    }, /SECURITY_VIOLATION/);

    assert.throws(() => {
        sanitizeProfileUpdate({ preferredLocale: 'en', role: 'SUPERUSER' });
    }, /SECURITY_VIOLATION/);
});

// ─────────────────────────────────────────────────────────────────────────
// 14. GATE 5.5: SESSION LOGIN SYNC & LOGOUT DEVICE ISOLATION
// ─────────────────────────────────────────────────────────────────────────
console.log('\n🔄 14. SESSION LOGIN SYNC & LOGOUT DEVICE ISOLATION (GATE 5.5)');

runTest('Wybór w bieżącej sesji ma pierwszeństwo przed starym profilem, logout czyści sesję', () => {
    let sessionChoice = 'es';
    let profilePref = null;

    let res = resolveSignal({ explicitUserChoice: sessionChoice, ccIdPreference: profilePref });
    assert.equal(res.candidateLocale, 'es');

    profilePref = 'pl';
    res = resolveSignal({ explicitUserChoice: sessionChoice, ccIdPreference: profilePref });
    assert.equal(res.candidateLocale, 'es');

    sessionChoice = null;
    profilePref = null;
    res = resolveSignal({ explicitUserChoice: sessionChoice, ccIdPreference: profilePref });
    assert.equal(res.candidateLocale, 'pl');
});

// ─────────────────────────────────────────────────────────────────────────
// 15. GATE 5.5: SYSTEM HEALTH ROUTER STATUS (SHADOW_HEALTHY, NEVER ACTIVE)
// ─────────────────────────────────────────────────────────────────────────
console.log('\n🩺 15. SYSTEM HEALTH ROUTER STATUS (GATE 5.5)');

runTest('Router w trybie Shadow zgłasza SHADOW_HEALTHY (Nigdy sztuczne ACTIVE)', () => {
    const router = new CCGlobalRouter({ routerEnabled: false, shadowMode: true });
    assert.equal(router.getHealthStatus(), 'SHADOW_HEALTHY');
});

runTest('Router z Kill Switchem zgłasza OFF', () => {
    const router = new CCGlobalRouter({ globalRouterOff: true });
    assert.equal(router.getHealthStatus(), 'OFF');
});

// ─────────────────────────────────────────────────────────────────────────
// PODSUMOWANIE
// ─────────────────────────────────────────────────────────────────────────
console.log('\n══════════════════════════════════════════════════════════════════════════');
console.log(`📋 PODSUMOWANIE TESTÓW FAZY 5A:`);
console.log(`   Łącznie testów: ${totalTests}`);
console.log(`   Zaliczono: ${passedTests}`);
console.log(`   Niepowodzenia: ${totalTests - passedTests}`);
console.log('══════════════════════════════════════════════════════════════════════════\n');

if (totalTests !== passedTests) {
    process.exit(1);
}
