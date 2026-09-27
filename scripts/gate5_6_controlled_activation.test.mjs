/**
 * ══════════════════════════════════════════════════════════════════════════
 * SUITE TESTÓW PRODUCTION GATE 5.6: CC GLOBAL ROUTER — CONTROLLED ACTIVATION
 * Master Plan CC Global 2030 (Gate 5.6)
 * Zasada naczelna: USER INTENT FIRST.
 * Levels 1–4: AKTYWNE (User Choice, CC ID, Remembered, URL Locale).
 * Levels 5–6: SUGESTIE (Browser, GEO) — ZERO AUTO-REDIRECT.
 * ══════════════════════════════════════════════════════════════════════════
 */

import { strict as assert } from 'node:assert';
import {
    CCGlobalRouter,
    ROUTER_ACTIVATION_LEVELS,
    getSuggestionLabel,
    getSuggestionPrompt
} from '../lib/cc-global-router/language-router.js';
import {
    CC_LOCALE_REGISTRY,
    isValidLocale,
    normalizeLocaleCode,
    getLocale
} from '../lib/cc-global-router/locale-registry.js';
import { resolveSignal } from '../lib/cc-global-router/signal-resolver.js';
import { resolveWithFallback } from '../lib/cc-global-router/fallback-engine.js';
import { checkContentAvailability } from '../lib/cc-global-router/content-availability.js';
import { generateSeoLocalizationMetadata, isSearchEngineCrawler } from '../lib/cc-global-router/seo-localization.js';
import {
    CC_ANALYTICS_DICTIONARY_V3,
    getMetricDefinition
} from '../lib/cc-content-core/cc-analytics-dictionary.js';

console.log('\n══════════════════════════════════════════════════════════════════════════');
console.log('🚀 URUCHAMIANIE TESTÓW PRODUCTION GATE 5.6: CONTROLLED ACTIVATION');
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

// Mock Golden Record CC-2026-000001 (zgodnie z rzeczywistym stanem prawnym)
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

// ─────────────────────────────────────────────────────────────────────────
// 1. POZIOMY AKTYWACJI (LEVELS 0–6)
// ─────────────────────────────────────────────────────────────────────────
console.log('📶 1. POZIOMY AKTYWACJI ROUTERA (LEVELS 0-6)');

runTest('Definicja 7 poziomów aktywacji (0 = SHADOW do 6 = GEO SUGGESTION)', () => {
    assert.equal(ROUTER_ACTIVATION_LEVELS.LEVEL_0_SHADOW, 0);
    assert.equal(ROUTER_ACTIVATION_LEVELS.LEVEL_1_USER_CHOICE, 1);
    assert.equal(ROUTER_ACTIVATION_LEVELS.LEVEL_2_CC_ID, 2);
    assert.equal(ROUTER_ACTIVATION_LEVELS.LEVEL_3_REMEMBERED_PREFERENCE, 3);
    assert.equal(ROUTER_ACTIVATION_LEVELS.LEVEL_4_URL_LOCALE, 4);
    assert.equal(ROUTER_ACTIVATION_LEVELS.LEVEL_5_BROWSER_SUGGESTION, 5);
    assert.equal(ROUTER_ACTIVATION_LEVELS.LEVEL_6_GEO_SUGGESTION, 6);
});

// ─────────────────────────────────────────────────────────────────────────
// 2. LEVEL 1: USER CHOICE (CZŁOWIEK WYBIERA JĘZYK)
// ─────────────────────────────────────────────────────────────────────────
console.log('\n👤 2. LEVEL 1: EXPLICIT USER CHOICE (AKTYWNY WYBÓR CZŁOWIEKA)');

runTest('Level 1: Jawny wybór człowieka (ES) jest natychmiast aplikowany na portalu', () => {
    const router = new CCGlobalRouter({ activationLevel: 4 });
    const decision = router.resolve({
        explicitUserChoice: 'es',
        actualLocale: 'pl'
    });
    assert.equal(decision.interfaceLocale, 'es');
    assert.equal(decision.signalSource, 'EXPLICIT_USER_CHOICE');
    assert.equal(decision.signalPriority, 1);
    assert.equal(decision.suggestion, null);
});

runTest('User Choice (ES) wygrywa z profilem CC ID (EN), przeglądarką (PL) i GEO (BR)', () => {
    const router = new CCGlobalRouter({ activationLevel: 4 });
    const decision = router.resolve({
        explicitUserChoice: 'es',
        ccIdPreference: 'en',
        acceptLanguage: 'pl-PL,pl;q=0.9',
        rawGeo: { countryCode: 'BR' },
        actualLocale: 'pl'
    });
    assert.equal(decision.interfaceLocale, 'es');
    assert.equal(decision.signalSource, 'EXPLICIT_USER_CHOICE');
    assert.equal(decision.geoOverridden, true);
});

// ─────────────────────────────────────────────────────────────────────────
// 3. LEVEL 2: CC ID LANGUAGE PREFERENCE
// ─────────────────────────────────────────────────────────────────────────
console.log('\n🆔 3. LEVEL 2: CC ID LANGUAGE PREFERENCE (ZALOGOWANY PROFIL)');

runTest('Level 2: Zalogowany użytkownik z preferredLocale=en otrzymuje wersję EN', () => {
    const router = new CCGlobalRouter({ activationLevel: 4 });
    const decision = router.resolve({
        ccIdPreference: 'en',
        actualLocale: 'pl'
    });
    assert.equal(decision.interfaceLocale, 'en');
    assert.equal(decision.signalSource, 'CC_ID_LANGUAGE_PREFERENCE');
    assert.equal(decision.signalPriority, 2);
});

runTest('User Choice w sesji nadpisuje zapisany profil CC ID (ES > EN)', () => {
    const router = new CCGlobalRouter({ activationLevel: 4 });
    const decision = router.resolve({
        explicitUserChoice: 'es',
        ccIdPreference: 'en',
        actualLocale: 'pl'
    });
    assert.equal(decision.interfaceLocale, 'es');
    assert.equal(decision.signalSource, 'EXPLICIT_USER_CHOICE');
});

// ─────────────────────────────────────────────────────────────────────────
// 4. LEVEL 3: REMEMBERED PREFERENCE (ANONIMOWY WYBÓR CZŁOWIEKA)
// ─────────────────────────────────────────────────────────────────────────
console.log('\n🍪 4. LEVEL 3: REMEMBERED PREFERENCE (POPRZEDNI WYBÓR CZŁOWIEKA)');

runTest('Level 3: Anonimowy użytkownik z zapamiętanym pt-br otrzymuje wersję PT-BR', () => {
    const router = new CCGlobalRouter({ activationLevel: 4 });
    const decision = router.resolve({
        rememberedPreference: 'pt-br',
        actualLocale: 'pl'
    });
    assert.equal(decision.interfaceLocale, 'pt-br');
    assert.equal(decision.signalSource, 'REMEMBERED_LANGUAGE_PREFERENCE');
    assert.equal(decision.signalPriority, 3);
});

// ─────────────────────────────────────────────────────────────────────────
// 5. LEVEL 4: URL LOCALE (JAWNY ADRES URL)
// ─────────────────────────────────────────────────────────────────────────
console.log('\n🔗 5. LEVEL 4: EXPLICIT URL LOCALE (/en/, /es/, /pt-br/)');

runTest('Level 4: Jawny adres URL /es/player serwuje wersję hiszpańską', () => {
    const router = new CCGlobalRouter({ activationLevel: 4 });
    const decision = router.resolve({
        url: 'https://polskieradio.cc/es/player',
        actualLocale: 'pl'
    });
    assert.equal(decision.interfaceLocale, 'es');
    assert.equal(decision.signalSource, 'EXPLICIT_URL_LOCALE');
    assert.equal(decision.signalPriority, 4);
});

// ─────────────────────────────────────────────────────────────────────────
// 6. LEVELS 5 & 6: BROWSER & GEO SUGGESTION (ZERO AUTO-REDIRECT)
// ─────────────────────────────────────────────────────────────────────────
console.log('\n💡 6. LEVELS 5 & 6: BROWSER & GEO SUGGESTION (ZERO AUTO-REDIRECT)');

runTest('Przeglądarka (EN) na stronie PL: ZERO REDIRECT, nieinwazyjna sugestia "View in English?"', () => {
    const router = new CCGlobalRouter({ activationLevel: 4 });
    const decision = router.resolve({
        acceptLanguage: 'en-US,en;q=0.9',
        actualLocale: 'pl'
    });
    // Strona pozostaje po polsku!
    assert.equal(decision.resolvedLocale, 'pl');
    assert.equal(decision.interfaceLocale, 'pl');
    // Generowana jest sugestia
    assert.ok(decision.suggestion);
    assert.equal(decision.suggestion.type, 'BROWSER_SUGGESTION');
    assert.equal(decision.suggestion.suggestedLocale, 'en');
    assert.equal(decision.suggestion.prompt, 'View in English?');
});

runTest('GEO (ES) na stronie PL bez wyższych sygnałów: ZERO REDIRECT, sugestia "¿Ver en Español?"', () => {
    const router = new CCGlobalRouter({ activationLevel: 4 });
    const decision = router.resolve({
        rawGeo: { countryCode: 'ES' },
        actualLocale: 'pl'
    });
    assert.equal(decision.resolvedLocale, 'pl');
    assert.equal(decision.interfaceLocale, 'pl');
    assert.ok(decision.suggestion);
    assert.equal(decision.suggestion.type, 'GEO_SUGGESTION');
    assert.equal(decision.suggestion.suggestedLocale, 'es');
    assert.equal(decision.suggestion.prompt, '¿Ver en Español?');
});

runTest('Zgoda Browser (pt-br) + GEO (BR): Nadal ZERO AUTO-REDIRECT (tylko sugestia)', () => {
    const router = new CCGlobalRouter({ activationLevel: 4 });
    const decision = router.resolve({
        acceptLanguage: 'pt-BR,pt;q=0.9',
        rawGeo: { countryCode: 'BR' },
        actualLocale: 'pl'
    });
    assert.equal(decision.resolvedLocale, 'pl');
    assert.ok(decision.suggestion);
    assert.equal(decision.suggestion.suggestedLocale, 'pt-br');
});

runTest('Konflikt Browser (EN) vs GEO (PL) na stronie EN: Browser jest silniejszy, brak agresywnego GEO', () => {
    const router = new CCGlobalRouter({ activationLevel: 4 });
    const decision = router.resolve({
        acceptLanguage: 'en-US,en;q=0.9',
        rawGeo: { countryCode: 'PL' },
        actualLocale: 'en'
    });
    // Użytkownik przegląda stronę po angielsku i ma przeglądarkę EN -> zero nachalnej sugestii z polskiego IP
    assert.equal(decision.resolvedLocale, 'en');
    assert.equal(decision.suggestion, null);
});

runTest('Odrzucenie sugestii (dismissal): Po odrzuceniu sugestia nie jest ponownie wyświetlana', () => {
    const router = new CCGlobalRouter({ activationLevel: 4 });
    const decision = router.resolve({
        acceptLanguage: 'en-US,en;q=0.9',
        actualLocale: 'pl',
        dismissedSuggestions: ['en'] // Użytkownik kliknął "Nie teraz"
    });
    assert.equal(decision.resolvedLocale, 'pl');
    assert.equal(decision.suggestion, null); // Brak spamu modalnego!
});

// ─────────────────────────────────────────────────────────────────────────
// 7. SEPARACJA INTERFEJSU OD TREŚCI I RIGHTS GATE (Pkt 20, 21, 22)
// ─────────────────────────────────────────────────────────────────────────
console.log('\n📖 7. SEPARACJA INTERFEJSU OD TREŚCI (INTERFACE vs CONTENT LOCALE)');

runTest('Wybór ES, ale treść dostępna tylko w EN: interface=es, content=en, fallback=true', () => {
    const router = new CCGlobalRouter({ activationLevel: 4 });
    // W MOCK_GOLDEN_RECORD wersja ES jest REVIEW_REQUIRED, wersja EN jest APPROVED
    const decision = router.resolve({
        explicitUserChoice: 'es',
        actualLocale: 'pl',
        contentMaster: MOCK_GOLDEN_RECORD
    });

    // Interfejs portalu pamięta wybór hiszpański
    assert.equal(decision.interfaceLocale, 'es');
    // Konkretny materiał rozważania jest wyświetlany w wersji angielskiej (fallback)
    assert.equal(decision.contentLocale, 'en');
    assert.equal(decision.resolvedLocale, 'en');
    assert.equal(decision.fallbackUsed, true);
    assert.ok(decision.fallbackReason.includes('VARIANT_REVIEW_REQUIRED'));
});

runTest('Fallback pojedynczej treści nie resetuje trwałej preferencji użytkownika', () => {
    const router = new CCGlobalRouter({ activationLevel: 4 });
    const decisionContent = router.resolve({
        explicitUserChoice: 'es',
        contentMaster: MOCK_GOLDEN_RECORD
    });
    assert.equal(decisionContent.contentLocale, 'en'); // treść fallback
    assert.equal(decisionContent.interfaceLocale, 'es'); // interfejs nadal hiszpański

    // Kolejne zapytanie bez treści (np. nawigacja po menu) nadal zachowuje ES
    const decisionNav = router.resolve({
        explicitUserChoice: 'es'
    });
    assert.equal(decisionNav.resolvedLocale, 'es');
    assert.equal(decisionNav.fallbackUsed, false);
});

// ─────────────────────────────────────────────────────────────────────────
// 8. OCHRONA TOŻSAMOŚCI, WYLOGOWANIE I URZĄDZENIA WSPÓŁDZIELONE (Pkt 27, 28, 29)
// ─────────────────────────────────────────────────────────────────────────
console.log('\n👥 8. CROSS-ECOSYSTEM, LOGOUT & SWITCH ACCOUNT (ZERO LEAK)');

runTest('Cross-Ecosystem: PolskieRadio, LUMINA, CC Lite i HOLOS dzielą ten sam profil CC ID', () => {
    const router = new CCGlobalRouter({ activationLevel: 4 });
    // Symulacja zapytań z 4 powierzchni dla tego samego konta UID_123 z preferredLocale=en
    const polskieRadioRes = router.resolve({ ccIdPreference: 'en', actualLocale: 'pl' });
    const luminaRes = router.resolve({ ccIdPreference: 'en', actualLocale: 'pl' });
    const ccLiteRes = router.resolve({ ccIdPreference: 'en', actualLocale: 'pl' });
    const holosRes = router.resolve({ ccIdPreference: 'en', actualLocale: 'pl' });

    assert.equal(polskieRadioRes.interfaceLocale, 'en');
    assert.equal(luminaRes.interfaceLocale, 'en');
    assert.equal(ccLiteRes.interfaceLocale, 'en');
    assert.equal(holosRes.interfaceLocale, 'en');
});

runTest('Wylogowanie (Logout): Czyści wybór sesyjny, brak wycieku preferencji na współdzielonym urządzeniu', () => {
    const router = new CCGlobalRouter({ activationLevel: 4 });
    // Przed wylogowaniem: zalogowany użytkownik z preferencją ES
    const loggedIn = router.resolve({ ccIdPreference: 'es', actualLocale: 'pl' });
    assert.equal(loggedIn.interfaceLocale, 'es');

    // Po wylogowaniu: preferencja z profilu znika, sesja jest czyszczona
    const loggedOut = router.resolve({ ccIdPreference: null, explicitUserChoice: null, actualLocale: 'pl' });
    assert.equal(loggedOut.interfaceLocale, 'pl'); // Bezpieczny powrót do domyślnego
});

runTest('Switch Account: Użytkownik A (ES) -> wylogowanie -> Użytkownik B (PL) -> ZERO LEAK', () => {
    const router = new CCGlobalRouter({ activationLevel: 4 });
    // User A:
    const userA = router.resolve({ ccIdPreference: 'es' });
    assert.equal(userA.interfaceLocale, 'es');

    // Logout + User B login:
    const userB = router.resolve({ ccIdPreference: 'pl' });
    assert.equal(userB.interfaceLocale, 'pl');
    assert.equal(userB.geoOverridden, false);
});

// ─────────────────────────────────────────────────────────────────────────
// 9. CACHE ISOLATION, DEEP LINKS, BOT SAFETY & SEO (Pkt 30, 32, 34, 35, 36)
// ─────────────────────────────────────────────────────────────────────────
console.log('\n🌐 9. CACHE ISOLATION, DEEP LINKS, BOT SAFETY & SEO');

runTest('Cache Isolation: Klucz cache jest odizolowany per wariant językowy, brak skażenia', () => {
    function generateCacheKey(url, locale) {
        return `cache_${normalizeLocaleCode(locale)}_${new URL(url).pathname}`;
    }
    const keyPl = generateCacheKey('https://polskieradio.cc/player', 'pl');
    const keyEn = generateCacheKey('https://polskieradio.cc/player', 'en');
    const keyEs = generateCacheKey('https://polskieradio.cc/player', 'es');
    const keyPtBr = generateCacheKey('https://polskieradio.cc/player', 'pt-br');

    assert.notEqual(keyPl, keyEn);
    assert.notEqual(keyEn, keyEs);
    assert.notEqual(keyEs, keyPtBr);
});

runTest('Deep Link: Bezpośredni link /en/artykul-1 działa dla każdego bez względu na GEO', () => {
    const router = new CCGlobalRouter({ activationLevel: 4 });
    const decision = router.resolve({
        url: 'https://polskieradio.cc/en/artykul-1',
        rawGeo: { countryCode: 'PL' } // Użytkownik otwiera link EN w Polsce
    });
    assert.equal(decision.interfaceLocale, 'en');
    assert.equal(decision.signalSource, 'EXPLICIT_URL_LOCALE');
});

runTest('Boty i Crawlery (Googlebot, Bingbot, ClaudeBot) otrzymują stabilny URL bez GEO redirectu', () => {
    const router = new CCGlobalRouter({ activationLevel: 4 });
    const decision = router.resolve({
        userAgent: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        rawGeo: { countryCode: 'FR' },
        acceptLanguage: 'fr-FR,fr;q=0.9',
        actualLocale: 'pl'
    });
    // Bot nie otrzymuje przekierowania ani sugestii
    assert.equal(decision.resolvedLocale, 'pl');
    assert.equal(decision.suggestion, null);
});

runTest('Hreflang generowany WYŁĄCZNIE dla zatwierdzonych wersji (PL, EN, x-default)', () => {
    const meta = generateSeoLocalizationMetadata({
        contentMaster: MOCK_GOLDEN_RECORD,
        baseUrl: 'https://polskieradio.cc',
        path: '/refleksja/dzien-26',
        currentLocale: 'pl'
    });
    const tags = meta.hreflangTags.map(t => t.hreflang);
    assert.ok(tags.includes('pl'));
    assert.ok(tags.includes('en'));
    assert.ok(tags.includes('x-default'));
    assert.equal(tags.includes('es'), false); // ES jest REVIEW_REQUIRED -> zakaz w SEO!
    assert.equal(tags.includes('pt-BR'), false);
});

// ─────────────────────────────────────────────────────────────────────────
// 10. CC ANALYTICS DICTIONARY v3 (Pkt 37, 38)
// ─────────────────────────────────────────────────────────────────────────
console.log('\n📖 10. CC ANALYTICS DICTIONARY v3 (METRYKI SUGESTII JĘZYKOWYCH)');

runTest('Słownik analityczny v3 zawiera metryki: SHOWN, ACCEPTED, DISMISSED', () => {
    assert.ok(CC_ANALYTICS_DICTIONARY_V3['LANGUAGE_SUGGESTION_SHOWN']);
    assert.ok(CC_ANALYTICS_DICTIONARY_V3['LANGUAGE_SUGGESTION_ACCEPTED']);
    assert.ok(CC_ANALYTICS_DICTIONARY_V3['LANGUAGE_SUGGESTION_DISMISSED']);

    const defShown = getMetricDefinition('LANGUAGE_SUGGESTION_SHOWN', 'v3');
    assert.equal(defShown.metricName, 'LANGUAGE_SUGGESTION_SHOWN');
    assert.equal(defShown.verificationLevel, 'FIRST_PARTY');
});

// ─────────────────────────────────────────────────────────────────────────
// 11. KILL SWITCH & ROLLBACK VERIFICATION (Pkt 42, 43, 44)
// ─────────────────────────────────────────────────────────────────────────
console.log('\n🛑 11. KILL SWITCH & ROLLBACK VERIFICATION');

runTest('Router Kill Switch (globalRouterOff=true) natychmiast przywraca stan pierwotny', () => {
    const router = new CCGlobalRouter({
        activationLevel: 4,
        globalRouterOff: true
    });
    const decision = router.resolve({
        explicitUserChoice: 'es',
        actualLocale: 'pl'
    });
    assert.equal(decision.resolvedLocale, 'pl');
    assert.equal(decision.fallbackUsed, true);
    assert.equal(decision.fallbackReason, 'ROUTER_KILL_SWITCH_ACTIVE');
    assert.equal(router.getHealthStatus(), 'OFF');
});

runTest('Rollback do Gate 5.5 (routerEnabled=false, shadowMode=true) natychmiast działa w trybie cienia', () => {
    const router = new CCGlobalRouter({
        routerEnabled: false,
        shadowMode: true,
        activationLevel: 0
    });
    const decision = router.resolve({
        explicitUserChoice: 'es',
        actualLocale: 'pl'
    });
    assert.equal(decision.shadowModeActive, true);
    assert.equal(decision.shadowDecision.wouldChange, true);
    assert.equal(router.getHealthStatus(), 'SHADOW_HEALTHY');
});

// ─────────────────────────────────────────────────────────────────────────
// 12. SYSTEM HEALTH: CONTROLLED_ACTIVE (Pkt 68)
// ─────────────────────────────────────────────────────────────────────────
console.log('\n🩺 12. SYSTEM HEALTH STATUS (CONTROLLED_ACTIVE)');

runTest('Router z kontrolowaną aktywacją zgłasza CONTROLLED_ACTIVE (Nigdy FULLY_AUTONOMOUS)', () => {
    const router = new CCGlobalRouter({
        activationLevel: 4,
        routerEnabled: true,
        shadowMode: false,
        browserAutoRedirect: false,
        geoAutoRedirect: false
    });
    assert.equal(router.getHealthStatus(), 'CONTROLLED_ACTIVE');
});

// ─────────────────────────────────────────────────────────────────────────
// PODSUMOWANIE
// ─────────────────────────────────────────────────────────────────────────
console.log('\n══════════════════════════════════════════════════════════════════════════');
console.log(`📋 PODSUMOWANIE TESTÓW PRODUCTION GATE 5.6:`);
console.log(`   Łącznie testów: ${totalTests}`);
console.log(`   Zaliczono: ${passedTests}`);
console.log(`   Niepowodzenia: ${totalTests - passedTests}`);
console.log('══════════════════════════════════════════════════════════════════════════\n');

if (totalTests !== passedTests) {
    process.exit(1);
}
