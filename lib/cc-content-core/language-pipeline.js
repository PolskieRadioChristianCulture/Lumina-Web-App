/**
 * ══════════════════════════════════════════════════════════════════════════
 * CC LANGUAGE PIPELINE — ORKIESTRATOR FABRYKI TREŚCI
 * Master Plan CC Global 2030 (Faza 2: CC Language & AI Content Factory)
 * ══════════════════════════════════════════════════════════════════════════
 * Łączy wszystkie 4 filary w jeden spójny, bezpieczny przepływ:
 * 
 * MASTER CONTENT -> ANALYSIS -> GLOSSARY & TM -> TRANSLATION ->
 * BIBLE GUARD -> THEOLOGY VALIDATOR -> QUALITY GATE -> HUMAN REVIEW
 * 
 * Zasada: ZERO AUTOMATYCZNEJ PUBLIKACJI (Autopublish Zabroniony)
 * Żaden wygenerowany wariant nie otrzymuje statusu APPROVED bez człowieka!
 * ══════════════════════════════════════════════════════════════════════════
 */

import {
    CC_COLLECTION_NAME,
    CC_AI_JOBS_COLLECTION,
    SUPPORTED_LANGUAGES_WAVE1,
    CC_SCHEMA_VERSION
} from './types.js';

import { getTheologyGlossary, GLOSSARY_VERSION } from './theology-glossary.js';
import { findExactMatch, recordApprovedTranslation, computeSourceHash } from './translation-memory.js';
import { detectContentSegments, extractBibleReferences, resolveTargetBibleReference } from './bible-guard.js';
import { AiProviderAdapter, PROMPT_VERSION } from './ai-provider.js';
import { validateTheologyAndFidelity, VALIDATOR_VERSION } from './theology-validator.js';
import { generateAllDerivedFormats } from './format-factory.js';
import { appendAuditLog } from './content-service.js';

/**
 * Uruchamia pełny pipeline tłumaczeniowo-walidacyjny dla danego języka
 * @param {import('firebase-admin/firestore').Firestore} db
 * @param {string} contentId
 * @param {string} targetLanguage ('en' | 'es' | 'pt-BR')
 * @param {Object} [options]
 * @param {string} [options.actor='system-ai-factory']
 * @param {AiProviderAdapter} [options.providerAdapter]
 * @returns {Promise<{
 *   success: boolean,
 *   jobId: string,
 *   variantId: string,
 *   fromMemory: boolean,
 *   candidateText: string,
 *   validation: import('./types.js').TheologyValidationReport,
 *   derivedFormats: any
 * }>}
 */
export async function processLanguagePipeline(db, contentId, targetLanguage, options = {}) {
    const actor = options.actor || 'system-ai-factory';
    const provider = options.providerAdapter || new AiProviderAdapter();
    const jobId = `job_${contentId}_${targetLanguage}_${Date.now()}`;

    // 1. Pobierz Master Record i podstawowy wariant źródłowy (PL)
    const masterDoc = await db.collection(CC_COLLECTION_NAME).doc(contentId).get();
    if (!masterDoc.exists) {
        throw new Error(`[PIPELINE] Master content ${contentId} nie istnieje!`);
    }
    const masterData = masterDoc.data();

    // Pobierz wariant źródłowy
    const varPlSnap = await db.collection(CC_COLLECTION_NAME).doc(contentId)
        .collection('variants').doc('var_pl_web').get();
    
    const sourceText = varPlSnap.exists && varPlSnap.data().body
        ? varPlSnap.data().body
        : (masterData.synopsis || masterData.title || '');

    const sourceHash = computeSourceHash(sourceText);

    // Rejestracja początkowa zadania w cc_ai_jobs
    const now = new Date().toISOString();
    const jobRecord = {
        jobId,
        contentId,
        targetLanguage,
        targetLocale: SUPPORTED_LANGUAGES_WAVE1[targetLanguage.toUpperCase().replace('-', '_')]?.locale || targetLanguage,
        action: 'TRANSLATE',
        status: 'PROCESSING',
        promptVersion: PROMPT_VERSION,
        glossaryVersion: GLOSSARY_VERSION,
        translationMemoryVersion: '1.0',
        provider: provider.provider,
        model: provider.model,
        createdAt: now,
        updatedAt: now
    };
    await db.collection(CC_AI_JOBS_COLLECTION).doc(jobId).set(jobRecord);

    // 2. Analiza segmentów i referencji biblijnych
    const segments = detectContentSegments(sourceText);
    const sourceBibleRefs = extractBibleReferences(sourceText);

    // 3. Sprawdzenie Theology Glossary
    const glossary = await getTheologyGlossary(db);

    // 4. Sprawdzenie Translation Memory (O(1) Exact Match)
    let candidateText = '';
    let fromMemory = false;
    const exactMatch = await findExactMatch(db, sourceText, targetLanguage);

    if (exactMatch && exactMatch.targetText) {
        console.log(`[PIPELINE] O(1) EXACT MATCH w Translation Memory dla ${targetLanguage}! Pomijam wywołanie AI.`);
        candidateText = exactMatch.targetText;
        fromMemory = true;
    } else {
        // 5. Wywołanie AI Provider Adapter z Cost Guard
        const aiResult = await provider.translate({
            sourceText,
            sourceLanguage: 'pl',
            targetLanguage,
            contentType: masterData.contentType || 'DEVOTIONAL',
            glossary,
            sourceHash,
            glossaryVersion: GLOSSARY_VERSION
        });

        if (!aiResult.success) {
            await db.collection(CC_AI_JOBS_COLLECTION).doc(jobId).update({
                status: 'FAILED',
                error: aiResult.error,
                updatedAt: new Date().toISOString()
            });
            throw new Error(`[PIPELINE_ERROR] Błąd dostawcy AI: ${aiResult.error}`);
        }

        candidateText = aiResult.translatedText;
    }

    // 6. Niezależna walidacja teologiczna (Theology Validator)
    const validation = validateTheologyAndFidelity({
        sourceText,
        targetText: candidateText,
        sourceLanguage: 'pl',
        targetLanguage,
        glossary
    });

    // 7. Generowanie formatów pochodnych (Format Factory) z pełnym Lineage
    const derivedFormats = generateAllDerivedFormats(candidateText, targetLanguage, {
        sourceContentId: contentId,
        sourceVariantId: 'var_pl_web',
        generatedFromHash: sourceHash
    });

    // 8. Zapisanie kandydata jako Variant (Status: REVIEW_REQUIRED — nigdy auto-approved!)
    const variantId = `var_${targetLanguage.toLowerCase().replace('-', '_')}_candidate`;
    const variantRef = db.collection(CC_COLLECTION_NAME).doc(contentId).collection('variants').doc(variantId);

    const variantRecord = {
        variantId,
        contentId,
        language: targetLanguage,
        locale: SUPPORTED_LANGUAGES_WAVE1[targetLanguage.toUpperCase().replace('-', '_')]?.locale || targetLanguage,
        format: 'TEXT_WEB',
        title: candidateText.split('\n')[0]?.replace(/^#+\s*/, '').trim() || masterData.title,
        body: candidateText,
        status: 'REVIEW_REQUIRED', // Rygor FAZY 2: Wymaga zatwierdzenia przez człowieka
        translationStatus: fromMemory ? 'TM_EXACT_MATCH' : 'AI_CANDIDATE',
        qualityStatus: validation.valid ? 'VALIDATED' : 'FLAGGED',
        validationReport: validation,
        derivedFormats,
        provenance: {
            sourceContentId: contentId,
            sourceVariantId: 'var_pl_web',
            generationType: fromMemory ? 'TRANSLATION_MEMORY' : 'AI_FACTORY',
            provider: provider.provider,
            model: provider.model,
            promptVersion: PROMPT_VERSION,
            glossaryVersion: GLOSSARY_VERSION,
            jobId,
            createdAt: now
        },
        createdAt: now,
        updatedAt: now
    };

    await variantRef.set(variantRecord, { merge: true });

    // 9. Aktualizacja zadania AI
    await db.collection(CC_AI_JOBS_COLLECTION).doc(jobId).update({
        status: 'REVIEW_REQUIRED',
        result: { variantId, validationScore: validation.overallScore, valid: validation.valid },
        updatedAt: new Date().toISOString()
    });

    // 10. Wpis w śladzie audytowym
    await appendAuditLog(db, contentId, actor, 'GENERATE_AI_CANDIDATE', null, {
        targetLanguage,
        variantId,
        fromMemory,
        valid: validation.valid,
        score: validation.overallScore,
        flags: validation.flags
    }, 'CC AI Content Factory');

    return {
        success: true,
        jobId,
        variantId,
        fromMemory,
        candidateText,
        validation,
        derivedFormats
    };
}

/**
 * Ręczne zatwierdzenie kandydata przez człowieka (Operator Human Approval)
 * Przenosi status do APPROVED i zapisuje wzorzec do Translation Memory!
 * @param {import('firebase-admin/firestore').Firestore} db
 * @param {string} contentId
 * @param {string} variantId
 * @param {string} operatorUid
 * @param {Object} [options]
 */
export async function approveCandidateVariant(db, contentId, variantId, operatorUid, options = {}) {
    if (!operatorUid) throw new Error('[APPROVAL] Zatwierdzenie wymaga identyfikatora operatora!');

    const varRef = db.collection(CC_COLLECTION_NAME).doc(contentId).collection('variants').doc(variantId);
    const varSnap = await varRef.get();
    if (!varSnap.exists) throw new Error(`Wariant ${variantId} nie istnieje.`);

    const variantData = varSnap.data();
    const now = new Date().toISOString();

    // 1. Zmiana statusu wariantu na APPROVED
    const updateData = {
        status: 'APPROVED',
        approvedBy: operatorUid,
        approvedAt: now,
        updatedAt: now
    };
    await varRef.update(updateData);

    // 2. Automatyczne zasilenie Translation Memory zatwierdzonym tekstem
    const masterDoc = await db.collection(CC_COLLECTION_NAME).doc(contentId).get();
    const varPl = await db.collection(CC_COLLECTION_NAME).doc(contentId).collection('variants').doc('var_pl_web').get();
    const sourceText = varPl.exists ? varPl.data().body : (masterDoc.data().synopsis || '');

    await recordApprovedTranslation(db, {
        sourceLanguage: 'pl',
        targetLanguage: variantData.language,
        sourceText,
        targetText: variantData.body,
        contentType: masterDoc.data().contentType || 'DEVOTIONAL',
        contentId,
        variantId,
        quality: variantData.validationReport?.overallScore || 100
    }, operatorUid);

    // 3. Wpis w audycie
    await appendAuditLog(db, contentId, operatorUid, 'APPROVE_VARIANT', { status: 'REVIEW_REQUIRED' }, { status: 'APPROVED' }, 'Mission Control Operator UI');

    return { success: true, contentId, variantId, status: 'APPROVED', approvedBy: operatorUid };
}

/**
 * Odrzucenie wariantu z podaniem powodu (Human Rejection)
 * @param {import('firebase-admin/firestore').Firestore} db
 * @param {string} contentId
 * @param {string} variantId
 * @param {string} operatorUid
 * @param {import('./types.js').RejectReason} reason
 * @param {string} [notes]
 */
export async function rejectCandidateVariant(db, contentId, variantId, operatorUid, reason = 'OTHER', notes = '') {
    if (!operatorUid) throw new Error('[REJECTION] Odrzucenie wymaga operatora!');

    const varRef = db.collection(CC_COLLECTION_NAME).doc(contentId).collection('variants').doc(variantId);
    const now = new Date().toISOString();

    const updateData = {
        status: 'REJECTED',
        rejectedBy: operatorUid,
        rejectedAt: now,
        rejectionReason: reason,
        rejectionNotes: notes,
        updatedAt: now
    };

    await varRef.update(updateData);
    await appendAuditLog(db, contentId, operatorUid, 'REJECT_VARIANT', null, updateData, 'Mission Control Operator UI');

    return { success: true, contentId, variantId, status: 'REJECTED', reason };
}

/**
 * Ręczna korekta tekstu przez operatora i ponowna walidacja (Edit + Revalidate)
 * @param {import('firebase-admin/firestore').Firestore} db
 * @param {string} contentId
 * @param {string} variantId
 * @param {string} updatedText
 * @param {string} operatorUid
 */
export async function editAndRevalidateVariant(db, contentId, variantId, updatedText, operatorUid) {
    const varRef = db.collection(CC_COLLECTION_NAME).doc(contentId).collection('variants').doc(variantId);
    const varSnap = await varRef.get();
    if (!varSnap.exists) throw new Error('Wariant nie istnieje');

    const vData = varSnap.data();
    const varPl = await db.collection(CC_COLLECTION_NAME).doc(contentId).collection('variants').doc('var_pl_web').get();
    const sourceText = varPl.exists ? varPl.data().body : '';

    const glossary = await getTheologyGlossary(db);

    // Ponowna niezależna walidacja po edycji
    const validation = validateTheologyAndFidelity({
        sourceText,
        targetText: updatedText,
        sourceLanguage: 'pl',
        targetLanguage: vData.language,
        glossary
    });

    const now = new Date().toISOString();
    const updateData = {
        body: updatedText,
        title: updatedText.split('\n')[0]?.replace(/^#+\s*/, '').trim() || vData.title,
        validationReport: validation,
        qualityStatus: validation.valid ? 'VALIDATED' : 'FLAGGED',
        status: 'REVIEW_REQUIRED', // Nadal wymaga formalnego kliknięcia Approve!
        updatedBy: operatorUid,
        updatedAt: now
    };

    await varRef.update(updateData);
    await appendAuditLog(db, contentId, operatorUid, 'EDIT_AND_REVALIDATE', null, { validationScore: validation.overallScore, valid: validation.valid }, 'Mission Control Operator UI');

    return { success: true, validation, variantData: { ...vData, ...updateData } };
}
