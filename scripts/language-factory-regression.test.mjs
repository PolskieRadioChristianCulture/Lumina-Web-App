// ══════════════════════════════════════════════════════════════════════════
// CC LANGUAGE & AI CONTENT FACTORY REGRESSION TEST SUITE (FAZA 2)
// Master Plan CC Global 2030
// ══════════════════════════════════════════════════════════════════════════

import path from 'path';
import fs from 'fs';
import assert from 'assert';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const admin = require('C:/Users/czark/Christian_Culture_Projekty/Wektor1_VideoFactory/node_modules/firebase-admin');

import {
    getTheologyGlossary,
    verifyGlossaryCompliance,
    findExactMatch,
    recordApprovedTranslation,
    computeSourceHash,
    extractBibleReferences,
    detectContentSegments,
    resolveTargetBibleReference,
    getBibleSourcesForLanguage,
    AiProviderAdapter,
    validateTheologyAndFidelity,
    deriveTtsText,
    extractQuotes,
    deriveSocialPost,
    deriveSeoMetadata,
    processLanguagePipeline,
    approveCandidateVariant,
    rejectCandidateVariant,
    editAndRevalidateVariant,
    getContentById
} from '../lib/cc-content-core/index.js';

const LUMINA_KEY_PATH = 'C:/Users/czark/Christian_Culture_Projekty/Wektor1_VideoFactory/luminaServiceAccountKey.json';

async function main() {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('   🧪 SUITE TESTÓW REGRESYJNYCH FAZY 2: AI CONTENT FACTORY');
    console.log('═══════════════════════════════════════════════════════════════\n');

    const luminaKey = JSON.parse(fs.readFileSync(LUMINA_KEY_PATH, 'utf8'));
    const app = admin.initializeApp({ credential: admin.credential.cert(luminaKey) }, 'faza2-test-' + Date.now());
    const db = app.firestore();

    let passed = 0;
    let failed = 0;

    async function test(name, fn) {
        process.stdout.write(`⏳ TEST: ${name}... `);
        try {
            await fn();
            console.log('✅ PASS');
            passed++;
        } catch (err) {
            console.log(`❌ FAIL\n   Błąd: ${err.message}`);
            failed++;
        }
    }

    // ─────────────────────────────────────────────────────────────
    // TEST 1: TEST CELOWO BŁĘDNEGO TŁUMACZENIA — BIBLE REFERENCE (Pkt 51)
    // ─────────────────────────────────────────────────────────────
    await test('Validator: Wykrycie zmiany numeru wersetu (Iz 30:15 -> Isaiah 30:16)', async () => {
        const source = 'Gdyż tak mówi Pan: W ciszy i zaufaniu będzie wasza siła (Iz 30:15).';
        const corrupted = 'For thus saith the Lord: In quietness and confidence shall be your strength (Isaiah 30:16).';

        const res = validateTheologyAndFidelity({
            sourceText: source,
            targetText: corrupted,
            targetLanguage: 'en',
            glossary: []
        });

        assert.strictEqual(res.valid, false, 'Raport musi być invalid');
        assert.ok(res.flags.includes('BIBLE_REFERENCE_CHANGED'), 'Oczekiwano flagi BIBLE_REFERENCE_CHANGED');
        assert.strictEqual(res.blocking, true, 'Błąd referencji biblijnej musi blokować zatwierdzenie');
    });

    // ─────────────────────────────────────────────────────────────
    // TEST 2: TEST GLOSSARY — TERM MISMATCH (Pkt 52)
    // ─────────────────────────────────────────────────────────────
    await test('Validator: Wykrycie zakazanego terminu z Glosariusza (TERM_MISMATCH)', async () => {
        const glossary = await getTheologyGlossary();
        const source = 'W ten dzień świętego Szabatu odpocznij w Bogu.';
        // Celowo używamy zakazanego w glosariuszu terminu "Sunday rest"
        const corrupted = 'On this holy Sunday rest day, find peace in God.';

        const res = validateTheologyAndFidelity({
            sourceText: source,
            targetText: corrupted,
            targetLanguage: 'en',
            glossary
        });

        assert.strictEqual(res.valid, false, 'Użycie zakazanego terminu musi unieważnić wariant');
        assert.ok(res.flags.includes('TERM_MISMATCH'), 'Oczekiwano flagi TERM_MISMATCH');
        assert.ok(res.terminologyCompliance < 100, 'Ocena terminologii musi zostać obniżona');
    });

    // ─────────────────────────────────────────────────────────────
    // TEST 3: TEST URL CHANGED (Pkt 54)
    // ─────────────────────────────────────────────────────────────
    await test('Validator: Wykrycie uszkodzenia lub zmiany adresu URL (URL_CHANGED)', async () => {
        const source = 'Odwiedź nasz portal https://polskieradio.cc i dołącz do nas.';
        const corrupted = 'Visit our portal https://other-malicious-site.com and join us.';

        const res = validateTheologyAndFidelity({
            sourceText: source,
            targetText: corrupted,
            targetLanguage: 'en',
            glossary: []
        });

        assert.strictEqual(res.valid, false);
        assert.ok(res.flags.includes('URL_CHANGED'), 'Oczekiwano flagi URL_CHANGED');
    });

    // ─────────────────────────────────────────────────────────────
    // TEST 4: TEST LICZB (Pkt 55)
    // ─────────────────────────────────────────────────────────────
    await test('Validator: Wykrycie zmiany kluczowej liczby w tekście (NUMBER_CHANGED)', async () => {
        const source = 'Proroctwo o 1260 dniach ma fundamentalne znaczenie.';
        const corrupted = 'The prophecy of 1200 days is of fundamental importance.';

        const res = validateTheologyAndFidelity({
            sourceText: source,
            targetText: corrupted,
            targetLanguage: 'en',
            glossary: []
        });

        assert.strictEqual(res.valid, false);
        assert.ok(res.flags.includes('NUMBER_CHANGED'), 'Oczekiwano flagi NUMBER_CHANGED');
    });

    // ─────────────────────────────────────────────────────────────
    // TEST 5: TEST POMINIĘCIA AKAPITU (Pkt 56)
    // ─────────────────────────────────────────────────────────────
    await test('Validator: Wykrycie pominięcia fragmentu treści (MISSING_SEGMENT)', async () => {
        const source = `Akapit pierwszy o zaufaniu Bogu i ciszy.\n\nAkapit drugi o modlitwie porannej i walce duchowej.\n\nAkapit trzeci z wersetem i podsumowaniem dnia dzisiejszego.\n\nAkapit czwarty z wezwaniem do wzrostu w zespole ludzi z pasją.`;
        // Tłumaczenie ma tylko 1 akapit zamiast 4
        const corrupted = `Only the first paragraph translated into English about quietness and trust.`;

        const res = validateTheologyAndFidelity({
            sourceText: source,
            targetText: corrupted,
            targetLanguage: 'en',
            glossary: []
        });

        assert.strictEqual(res.valid, false);
        assert.ok(res.flags.includes('MISSING_SEGMENT'), 'Oczekiwano flagi MISSING_SEGMENT');
    });

    // ─────────────────────────────────────────────────────────────
    // TEST 6: TEST TRANSLATION MEMORY EXACT MATCH (Pkt 58)
    // ─────────────────────────────────────────────────────────────
    await test('Translation Memory: Exact Match O(1) zapobiega niepotrzebnemu wywołaniu AI', async () => {
        const sourceText = 'W ciszy i zaufaniu będzie wasza siła.';
        const targetText = 'In quietness and in confidence shall be your strength.';
        const targetLang = 'en';

        // Zapisz zatwierdzony rekord do TM
        await recordApprovedTranslation(db, {
            sourceLanguage: 'pl',
            targetLanguage: targetLang,
            sourceText,
            targetText,
            contentType: 'DEVOTIONAL'
        }, 'test-operator-dowodca');

        // Sprawdź czy exact match go odnajduje
        const match = await findExactMatch(db, sourceText, targetLang);
        assert.ok(match, 'Powinien odnaleźć wpis w TM');
        assert.strictEqual(match.targetText, targetText);
        assert.ok(match.status === 'ACTIVE' || match.status === 'APPROVED', 'Status powinien być ACTIVE lub APPROVED');
    });

    // ─────────────────────────────────────────────────────────────
    // TEST 7: TEST ODPORNOŚCI NA BŁĘDY DOSTAWCY AI (Pkt 59)
    // ─────────────────────────────────────────────────────────────
    await test('AI Provider Failure: 429 i Timeout zwracają kontrolowany błąd FAILED bez fałszywego APPROVED', async () => {
        const provider = new AiProviderAdapter();

        // 1. Symulacja 429 Rate Limit
        provider.setMockFailureMode('429');
        const res429 = await provider.translate({
            sourceText: 'Tekst testowy',
            targetLanguage: 'en',
            glossary: []
        });
        assert.strictEqual(res429.success, false);
        assert.ok(res429.error.includes('429'), 'Powinien zgłosić błąd 429');

        // 2. Symulacja Timeout
        provider.setMockFailureMode('TIMEOUT');
        const resTimeout = await provider.translate({
            sourceText: 'Tekst testowy',
            targetLanguage: 'en',
            glossary: []
        });
        assert.strictEqual(resTimeout.success, false);
        assert.ok(resTimeout.error.includes('timed out'), 'Powinien zgłosić timeout');
    });

    // ─────────────────────────────────────────────────────────────
    // TEST 8: FORMAT FACTORY DERIVATION (Pkt 34-39)
    // ─────────────────────────────────────────────────────────────
    await test('Format Factory: Generowanie czystego TTS, cytatów z pozycją, social i SEO', async () => {
        const sampleText = `## Words Have Power: Strength in Quietness and Trust\n\n> „For thus saith the Lord GOD; In returning and rest shall ye be saved.” (Isaiah 30:15, KJV)\n\nVisit https://polskieradio.cc for more details.`;

        // TTS nie może zawierać linków ani ##
        const rawTts = deriveTtsText(sampleText);
        const tts = typeof rawTts === 'object' ? rawTts.text : rawTts;
        assert.ok(!tts.includes('https://'), 'TTS nie może zawierać https://');
        assert.ok(!tts.includes('##'), 'TTS nie może zawierać nagłówków ##');

        // Quotes muszą mieć sourceStart
        const quotes = extractQuotes(sampleText);
        assert.ok(quotes.length > 0, 'Powinien wyekstrahować cytat');
        assert.ok(quotes[0].sourceStart >= 0, 'sourceStart musi być liczbą nieujemną');

        // Social Post
        const social = deriveSocialPost(sampleText, 'en');
        assert.ok(social.headline.length > 0);
        assert.ok(social.hashtags.includes('#ChristianCulture'));

        // SEO
        const seo = deriveSeoMetadata(sampleText, 'en');
        assert.ok(seo.title.length <= 60);
        assert.ok(seo.description.length <= 160);
    });

    // ─────────────────────────────────────────────────────────────
    // TEST 9: BIBLE SOURCE REGISTRY (Pkt 15-18)
    // ─────────────────────────────────────────────────────────────
    await test('Bible Source Registry: Sprawdzenie autoryzowanych przekładów dla PL, EN, ES, PT-BR', async () => {
        const plSources = getBibleSourcesForLanguage('pl');
        const enSources = getBibleSourcesForLanguage('en');
        const esSources = getBibleSourcesForLanguage('es');
        const ptSources = getBibleSourcesForLanguage('pt-BR');

        assert.ok(plSources.some(s => s.translationCode === 'UBG' && s.approved), 'UBG musi być zatwierdzona w PL');
        assert.ok(enSources.some(s => s.translationCode === 'BSB' && s.approved), 'BSB musi być zatwierdzona w EN');
        assert.ok(esSources.some(s => s.translationCode === 'RVA2015' && s.approved), 'RVA2015 musi być zatwierdzona w ES');
        assert.ok(ptSources.some(s => s.translationCode === 'ARC' && s.approved), 'ARC musi być zatwierdzona w PT-BR');

        const resolvedEn = resolveTargetBibleReference('Iz 30:15', 'en');
        assert.strictEqual(resolvedEn, 'Isaiah 30:15', 'Rozwiązanie Iz 30:15 na EN musi dać Isaiah 30:15');
    });

    // ─────────────────────────────────────────────────────────────
    // TEST 10: PILOT PIPELINE DLA CC-2026-000001 (Pkt 46-50)
    // Generuje kandydatów EN, ES, PT-BR i weryfikuje status REVIEW_REQUIRED
    // ─────────────────────────────────────────────────────────────
    await test('Pipeline Pilot: Generowanie kandydatów ES i PT-BR dla Golden Record CC-2026-000001', async () => {
        // 1. Uruchomienie dla hiszpańskiego (ES)
        const resEs = await processLanguagePipeline(db, 'CC-2026-000001', 'es', {
            actor: 'pilot-test-runner'
        });
        assert.strictEqual(resEs.success, true);
        assert.strictEqual(resEs.variantId, 'var_es_candidate');
        assert.strictEqual(resEs.validation.valid, true, 'Kandydat ES powinien przejść walidację');

        // 2. Uruchomienie dla portugalskiego (PT-BR)
        const resPt = await processLanguagePipeline(db, 'CC-2026-000001', 'pt-BR', {
            actor: 'pilot-test-runner'
        });
        assert.strictEqual(resPt.success, true);
        assert.strictEqual(resPt.variantId, 'var_pt_br_candidate');
        assert.strictEqual(resPt.validation.valid, true, 'Kandydat PT-BR powinien przejść walidację');

        // 3. Weryfikacja że kandydaci mają status REVIEW_REQUIRED (ZERO AUTOPUBLISH!)
        const fullDoc = await getContentById(db, 'CC-2026-000001', { includeSubcollections: true });
        const varEs = fullDoc.variants.find(v => v.variantId === 'var_es_candidate');
        const varPt = fullDoc.variants.find(v => v.variantId === 'var_pt_br_candidate');

        assert.ok(varEs, 'Wariant var_es_candidate musi istnieć');
        assert.ok(varPt, 'Wariant var_pt_br_candidate musi istnieć');
        assert.strictEqual(varEs.status, 'REVIEW_REQUIRED', 'Status musi być REVIEW_REQUIRED');
        assert.strictEqual(varPt.status, 'REVIEW_REQUIRED', 'Status musi być REVIEW_REQUIRED');

        // Istniejący wariant var_en_web nie został nadpisany (Human Reference zachowany!)
        const varEnRef = fullDoc.variants.find(v => v.variantId === 'var_en_web');
        assert.ok(varEnRef, 'var_en_web musi pozostać nienaruszony jako Human Reference');
    });

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log(`📊 WYNIK TESTÓW FAZY 2: ${passed} PASS / ${failed} FAIL`);
    console.log('═══════════════════════════════════════════════════════════════\n');

    if (failed > 0) process.exit(1);
    process.exit(0);
}

main().catch(err => {
    console.error('Krytyczny błąd testów Fazy 2:', err);
    process.exit(1);
});
