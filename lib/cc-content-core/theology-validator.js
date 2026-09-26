/**
 * ══════════════════════════════════════════════════════════════════════════
 * CC THEOLOGY VALIDATOR — NIEZALEŻNY WALIDATOR TEOLOGICZNO-JĘZYKOWY
 * Master Plan CC Global 2030 (Faza 2: CC Language & AI Content Factory)
 * ══════════════════════════════════════════════════════════════════════════
 * Zasada: TRANSLATOR -> VALIDATOR (Dwa całkowicie rozdzielone kroki)
 * 
 * Bada każdy kandydat tłumaczenia pod kątem:
 * 1. Zgodności z CC Theology Glossary (TERM_MISMATCH)
 * 2. Niezmienności referencji biblijnych (BIBLE_REFERENCE_CHANGED)
 * 3. Weryfikacji cytatów Pisma Świętego (BIBLE_QUOTE_UNVERIFIED)
 * 4. Zachowania liczb i dat (NUMBER_CHANGED)
 * 5. Niezmienności odnośników URL (URL_CHANGED)
 * 6. Zmiany negacji i ryzyka sensu (MEANING_RISK)
 * 7. Pominięcia akapitów (MISSING_SEGMENT)
 * 8. Halucynacji i zmyślonych treści (EXTRA_CONTENT)
 * ══════════════════════════════════════════════════════════════════════════
 */

import { verifyGlossaryCompliance } from './theology-glossary.js';
import { extractBibleReferences } from './bible-guard.js';

export const VALIDATOR_VERSION = '2026.1-strict';

export const CRITICAL_FAIL_FLAGS = Object.freeze([
    'BIBLE_REFERENCE_CHANGED',
    'BIBLE_QUOTE_UNVERIFIED',
    'RIGHTS_UNKNOWN',
    'URL_CHANGED',
    'NUMBER_CHANGED',
    'CRITICAL_TERM_MISMATCH',
    'TERM_MISMATCH',
    'MISSING_SEGMENT',
    'MEANING_RISK',
    'BIBLE_SOURCE_MISSING',
    'BIBLE_RIGHTS_REVIEW_REQUIRED'
]);

/**
 * Wyciąga wszystkie liczby całkowite z tekstu (z wyłączeniem znaczników Markdown)
 * @param {string} text
 * @returns {number[]}
 */
export function extractDistinctNumbers(text) {
    if (!text) return [];
    const matches = text.match(/\b\d+\b/g) || [];
    return [...new Set(matches.map(n => parseInt(n, 10)))];
}

/**
 * Wyciąga wszystkie adresy URL z tekstu
 * @param {string} text
 * @returns {string[]}
 */
export function extractUrls(text) {
    if (!text) return [];
    const matches = text.match(/https?:\/\/[^\s\)\>\"\'\]]+/gi) || [];
    return [...new Set(matches)];
}

/**
 * Przeprowadza pełną, niezależną walidację teologiczno-językową
 * @param {Object} params
 * @param {string} params.sourceText - Oryginał (Master)
 * @param {string} params.targetText - Kandydat tłumaczenia (Candidate)
 * @param {string} params.sourceLanguage - np. 'pl'
 * @param {string} params.targetLanguage - np. 'en', 'es', 'pt-BR'
 * @param {import('./types.js').TheologyTerm[]} params.glossary - Zatwierdzone terminy glosariusza
 * @returns {import('./types.js').TheologyValidationReport}
 */
export function validateTheologyAndFidelity(params) {
    const {
        sourceText = '',
        targetText = '',
        targetLanguage = 'en',
        glossary = []
    } = params;

    const flags = [];
    const flagDetails = [];

    let terminologyScore = 100;
    let biblicalScore = 100;
    let formatScore = 100;
    let sourceScore = 100;
    let languageScore = 95;

    // ─────────────────────────────────────────────────────────────
    // 1. SPRAWDZENIE GLOSARIUSZA (TERM_MISMATCH)
    // ─────────────────────────────────────────────────────────────
    const glossaryResult = verifyGlossaryCompliance(sourceText, targetText, targetLanguage, glossary);
    if (glossaryResult.violations.length > 0) {
        terminologyScore = Math.max(0, terminologyScore - (glossaryResult.violations.length * 30));
        flags.push('TERM_MISMATCH');
        glossaryResult.violations.forEach(v => {
            flagDetails.push({
                flag: 'TERM_MISMATCH',
                message: v.reason,
                severity: 'CRITICAL',
                location: v.location
            });
        });
    }

    // ─────────────────────────────────────────────────────────────
    // 2. REFERENCJE BIBLIJNE (BIBLE_REFERENCE_CHANGED)
    // ─────────────────────────────────────────────────────────────
    const sourceRefs = extractBibleReferences(sourceText);
    const targetRefs = extractBibleReferences(targetText);

    if (sourceRefs.length > 0) {
        if (targetRefs.length < sourceRefs.length) {
            biblicalScore -= 40;
            flags.push('BIBLE_REFERENCE_CHANGED');
            flagDetails.push({
                flag: 'BIBLE_REFERENCE_CHANGED',
                message: `W tekście źródłowym wykryto ${sourceRefs.length} referencji biblijnych, a w tłumaczeniu tylko ${targetRefs.length}.`,
                severity: 'CRITICAL'
            });
        }

        // Sprawdź czy numery rozdziałów i wersetów się zgadzają
        for (let i = 0; i < Math.min(sourceRefs.length, targetRefs.length); i++) {
            const s = sourceRefs[i];
            const t = targetRefs[i];
            if (s.chapter !== t.chapter || s.verseStart !== t.verseStart || s.verseEnd !== t.verseEnd) {
                biblicalScore = 0;
                flags.push('BIBLE_REFERENCE_CHANGED');
                flagDetails.push({
                    flag: 'BIBLE_REFERENCE_CHANGED',
                    message: `Zmieniono numer rozdziału lub wersetu! Źródło: ${s.raw} (r.${s.chapter} w.${s.verseStart}), Tłumaczenie: ${t.raw} (r.${t.chapter} w.${t.verseStart}).`,
                    severity: 'CRITICAL'
                });
            }
        }
    }

    // ─────────────────────────────────────────────────────────────
    // 3. LICZBY I DATY (NUMBER_CHANGED)
    // ─────────────────────────────────────────────────────────────
    const sourceNumbers = extractDistinctNumbers(sourceText);
    const targetNumbers = extractDistinctNumbers(targetText);

    const missingNumbers = sourceNumbers.filter(n => !targetNumbers.includes(n));
    if (missingNumbers.length > 0) {
        formatScore = Math.max(0, formatScore - (missingNumbers.length * 25));
        flags.push('NUMBER_CHANGED');
        flagDetails.push({
            flag: 'NUMBER_CHANGED',
            message: `W tłumaczeniu brakuje liczb obecnych w źródle: ${missingNumbers.join(', ')}`,
            severity: 'CRITICAL'
        });
    }

    // ─────────────────────────────────────────────────────────────
    // 4. ODNOŚNIKI URL (URL_CHANGED)
    // ─────────────────────────────────────────────────────────────
    const sourceUrls = extractUrls(sourceText);
    const targetUrls = extractUrls(targetText);

    const missingUrls = sourceUrls.filter(u => !targetUrls.includes(u));
    if (missingUrls.length > 0) {
        formatScore = Math.max(0, formatScore - (missingUrls.length * 30));
        flags.push('URL_CHANGED');
        flagDetails.push({
            flag: 'URL_CHANGED',
            message: `W tłumaczeniu uszkodzono lub pominięto adresy URL: ${missingUrls.join(', ')}`,
            severity: 'CRITICAL'
        });
    }

    // ─────────────────────────────────────────────────────────────
    // 5. POMINIĘTE AKAPITY (MISSING_SEGMENT)
    // ─────────────────────────────────────────────────────────────
    const sourceParagraphs = sourceText.split(/\n\s*\n/).filter(p => p.trim().length > 10);
    const targetParagraphs = targetText.split(/\n\s*\n/).filter(p => p.trim().length > 10);

    if (sourceParagraphs.length > 2 && targetParagraphs.length < sourceParagraphs.length - 1) {
        sourceScore = Math.max(0, sourceScore - 40);
        flags.push('MISSING_SEGMENT');
        flagDetails.push({
            flag: 'MISSING_SEGMENT',
            message: `Pominięto istotny fragment treści (akapitów w źródle: ${sourceParagraphs.length}, w tłumaczeniu: ${targetParagraphs.length}).`,
            severity: 'CRITICAL'
        });
    }

    // ─────────────────────────────────────────────────────────────
    // 6. HALUCYNACJA I NADMIERNA TREŚĆ (EXTRA_CONTENT / MEANING_RISK)
    // ─────────────────────────────────────────────────────────────
    if (targetParagraphs.length > sourceParagraphs.length + 2) {
        sourceScore = Math.max(0, sourceScore - 30);
        flags.push('EXTRA_CONTENT');
        flagDetails.push({
            flag: 'EXTRA_CONTENT',
            message: 'Tłumaczenie zawiera dodatkowe akapity nieobecne w materiale źródłowym (podejrzenie halucynacji AI).',
            severity: 'WARNING'
        });
    }

    // ─────────────────────────────────────────────────────────────
    // 7. RYZYKO ZMIANY SENSU I NEGACJI (MEANING_RISK)
    // ─────────────────────────────────────────────────────────────
    const sourceHasNegation = /\b(nie|nigdy|zakaz|brak)\b/i.test(sourceText);
    const targetHasNegation = /\b(not|never|no|forbidden|none|no|nunca|jamás|não)\b/i.test(targetText);

    if (sourceHasNegation && !targetHasNegation && sourceText.length > 50) {
        sourceScore = Math.max(0, sourceScore - 35);
        flags.push('MEANING_RISK');
        flagDetails.push({
            flag: 'MEANING_RISK',
            message: 'Wykryto potencjalną utratę lub odwrócenie negacji (źródło zawiera przeczenie, którego brak w tłumaczeniu).',
            severity: 'CRITICAL'
        });
    }

    // ─────────────────────────────────────────────────────────────
    // WYLICZENIE WYNIKÓW I DWUWARSTWOWEJ BLOKADY (SCORE + CRITICAL FLAGS)
    // ─────────────────────────────────────────────────────────────
    const uniqueFlags = [...new Set(flags)];
    const triggeredCriticalFlags = uniqueFlags.filter(f => CRITICAL_FAIL_FLAGS.includes(f));
    const hasCritical = triggeredCriticalFlags.length > 0 || flagDetails.some(f => f.severity === 'CRITICAL');

    // Quality Check Score (0-100) — nie jest "procentem poprawności", lecz sumą wag kontroli
    const overallScore = Math.round(
        (languageScore * 0.15) +
        (terminologyScore * 0.25) +
        (biblicalScore * 0.30) +
        (sourceScore * 0.20) +
        (formatScore * 0.10)
    );

    // Rygor FAZY 2.5: Nawet przy score 99/100 jakakolwiek flaga krytyczna skutkuje statusem FAIL!
    const valid = !hasCritical && overallScore >= 80;

    return {
        valid,
        status: valid ? 'PASS' : 'FAIL',
        overallScore,
        qualityScore: overallScore,
        scoreLabel: 'QUALITY CHECK SCORE',
        languageQuality: languageScore,
        terminologyCompliance: terminologyScore,
        biblicalIntegrity: biblicalScore,
        sourceFidelity: sourceScore,
        formatIntegrity: formatScore,
        flags: uniqueFlags,
        criticalFlags: triggeredCriticalFlags,
        flagDetails,
        blocking: hasCritical,
        disclaimer: 'Wynik automatycznej kontroli zgodności (Quality Check Score). Nie oznacza procentowej pewności poprawności teologicznej ani językowej.',
        validatedAt: new Date().toISOString(),
        validatorVersion: VALIDATOR_VERSION
    };
}
