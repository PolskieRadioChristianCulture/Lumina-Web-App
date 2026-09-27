/**
 * ══════════════════════════════════════════════════════════════════════════
 * CC TRANSLATION MEMORY — STRATEGICZNA PAMIĘĆ ZATWIERDZONYCH TŁUMACZEŃ
 * Master Plan CC Global 2030 (Faza 2: CC Language & AI Content Factory)
 * ══════════════════════════════════════════════════════════════════════════
 * Przechowuje WYŁĄCZNIE zweryfikowane i zatwierdzone przez człowieka
 * segmenty tłumaczeń (APPROVED).
 * 
 * Zasada:
 * Przed wysłaniem do AI -> sprawdź Exact Match w TM.
 * Jeśli istnieje -> użyj zatwierdzonego tłumaczenia (Zero opłat za tokeny, 100% spójności).
 * ══════════════════════════════════════════════════════════════════════════
 */

import crypto from 'crypto';
import {
    CC_TRANSLATION_MEMORY_COLLECTION,
    CC_SCHEMA_VERSION
} from './types.js';

export const TM_SCHEMA_VERSION = 1;

/**
 * Normalizuje tekst źródłowy do celów haszowania (usuwa białe znaki ze skrajów, ujednolica spacje)
 * @param {string} text
 * @returns {string}
 */
export function normalizeTextForHashing(text) {
    if (!text) return '';
    return text.trim().replace(/\s+/g, ' ');
}

/**
 * Oblicza sumę kontrolną SHA-256 tekstu znormalizowanego
 * @param {string} text
 * @returns {string}
 */
export function computeSourceHash(text) {
    const norm = normalizeTextForHashing(text);
    return crypto.createHash('sha256').update(norm, 'utf8').digest('hex');
}

/**
 * Szuka dokładnego, zatwierdzonego dopasowania w Pamięci Tłumaczeń (O(1) Exact Match)
 * Rygor: Zwraca WYŁĄCZNIE wpisy o statusie ACTIVE (nigdy REVOKED ani SUPERSEDED).
 * @param {import('firebase-admin/firestore').Firestore} db
 * @param {string} sourceText
 * @param {string} targetLanguage
 * @param {Object} [options]
 * @param {string} [options.context]
 * @returns {Promise<import('./types.js').TranslationMemoryEntry|null>}
 */
export async function findExactMatch(db, sourceText, targetLanguage, options = {}) {
    if (!sourceText || !targetLanguage || !db) return null;

    const hash = computeSourceHash(sourceText);

    try {
        let q = db.collection(CC_TRANSLATION_MEMORY_COLLECTION)
            .where('sourceHash', '==', hash)
            .where('targetLanguage', '==', targetLanguage)
            .where('status', 'in', ['ACTIVE', 'APPROVED']);

        if (options.context) {
            q = q.where('context', '==', options.context);
        }

        const snapshot = await q.limit(1).get();
        if (!snapshot.empty) {
            const data = snapshot.docs[0].data();
            // Upewnij się, że nie został cofnięty (REVOKED)
            if (data.status === 'REVOKED' || data.status === 'SUPERSEDED') {
                return null;
            }
            return data;
        }
        return null;
    } catch (err) {
        console.warn('[TRANSLATION_MEMORY] Błąd zapytania Exact Match:', err.message);
        return null;
    }
}

/**
 * Proste dopasowanie przybliżone (Fuzzy Match) bazujące na współczynniku Dice / Jaccard
 * Zwracane WYŁĄCZNIE jako sugestia (SUGGESTION ONLY — nigdy automatycznie jako finalny tekst).
 * @param {string} text1
 * @param {string} text2
 * @returns {number} 0.0 - 1.0
 */
export function calculateTextSimilarity(text1, text2) {
    const s1 = normalizeTextForHashing(text1).toLowerCase();
    const s2 = normalizeTextForHashing(text2).toLowerCase();

    if (s1 === s2) return 1.0;
    if (!s1 || !s2) return 0.0;

    const words1 = new Set(s1.split(' '));
    const words2 = new Set(s2.split(' '));

    let intersection = 0;
    for (const w of words1) {
        if (words2.has(w)) intersection++;
    }

    const union = words1.size + words2.size - intersection;
    return union > 0 ? intersection / union : 0.0;
}

/**
 * Zapisuje zatwierdzone przez człowieka tłumaczenie do Pamięci Tłumaczeń z pełnym wersjonowaniem
 * @param {import('firebase-admin/firestore').Firestore} db
 * @param {Partial<import('./types.js').TranslationMemoryEntry>} entryData
 * @param {string} approvedBy
 * @returns {Promise<import('./types.js').TranslationMemoryEntry>}
 */
export async function recordApprovedTranslation(db, entryData, approvedBy) {
    if (!entryData.sourceText || !entryData.targetText || !entryData.targetLanguage) {
        throw new Error('[TRANSLATION_MEMORY] Wymagane pola: sourceText, targetText, targetLanguage');
    }
    if (!approvedBy) {
        throw new Error('[TRANSLATION_MEMORY] Wymagany identyfikator zatwierdzającego (approvedBy)');
    }

    const sourceHash = computeSourceHash(entryData.sourceText);
    const version = entryData.version || 1;
    const memoryId = `tm_${sourceHash.substring(0, 16)}_${entryData.targetLanguage}_v${version}`;
    const now = new Date().toISOString();

    const fullRecord = {
        entryId: memoryId,
        memoryId,
        sourceLanguage: entryData.sourceLanguage || 'pl',
        targetLanguage: entryData.targetLanguage,
        sourceText: entryData.sourceText,
        targetText: entryData.targetText,
        contentType: entryData.contentType || 'DEVOTIONAL',
        context: entryData.context || 'GENERAL',
        contentId: entryData.contentId || null,
        variantId: entryData.variantId || null,
        quality: entryData.quality !== undefined ? entryData.quality : 100,
        status: 'ACTIVE',
        version,
        supersedes: entryData.supersedes || null,
        approvedBy,
        approvedAt: now,
        revokedBy: null,
        revokedAt: null,
        reason: entryData.reason || 'Zatwierdzenie ludzkie (Human Approval)',
        sourceHash,
        schemaVersion: CC_SCHEMA_VERSION
    };

    if (db) {
        await db.collection(CC_TRANSLATION_MEMORY_COLLECTION).doc(memoryId).set(fullRecord, { merge: true });
        // Zapisz także pod canonical alias dla szybkiego dostępu O(1)
        const canonicalDocId = `tm_${sourceHash.substring(0, 16)}_${entryData.targetLanguage}`;
        await db.collection(CC_TRANSLATION_MEMORY_COLLECTION).doc(canonicalDocId).set(fullRecord, { merge: true });
    }

    return fullRecord;
}

/**
 * Cofa (unieważnia) zatwierdzone tłumaczenie w Pamięci Tłumaczeń (REVOKED)
 * Zabezpiecza przed sytuacją, gdy operator zatwierdził błędne tłumaczenie.
 * @param {import('firebase-admin/firestore').Firestore} db
 * @param {string} memoryId
 * @param {string} revokedBy
 * @param {string} reason
 * @returns {Promise<boolean>}
 */
export async function revokeTranslationMemoryEntry(db, memoryId, revokedBy, reason) {
    if (!db || !memoryId || !revokedBy || !reason) {
        throw new Error('[TRANSLATION_MEMORY] Wymagane parametry: db, memoryId, revokedBy, reason');
    }

    const now = new Date().toISOString();
    const docRef = db.collection(CC_TRANSLATION_MEMORY_COLLECTION).doc(memoryId);
    const snap = await docRef.get();

    if (!snap.exists) {
        throw new Error(`[TRANSLATION_MEMORY] Nie odnaleziono wpisu TM: ${memoryId}`);
    }

    const data = snap.data();
    await docRef.update({
        status: 'REVOKED',
        revokedBy,
        revokedAt: now,
        reason,
        updatedAt: now
    });

    // Jeśli istnieje canonical alias, go również unieważnij
    const canonicalDocId = `tm_${data.sourceHash.substring(0, 16)}_${data.targetLanguage}`;
    try {
        await db.collection(CC_TRANSLATION_MEMORY_COLLECTION).doc(canonicalDocId).update({
            status: 'REVOKED',
            revokedBy,
            revokedAt: now,
            reason,
            updatedAt: now
        });
    } catch (_) {}

    return true;
}

/**
 * Zastępuje istniejący wpis TM nową wersją (SUPERSEDED -> ACTIVE)
 * @param {import('firebase-admin/firestore').Firestore} db
 * @param {string} oldMemoryId
 * @param {Partial<import('./types.js').TranslationMemoryEntry>} newEntryData
 * @param {string} approvedBy
 * @param {string} reason
 * @returns {Promise<import('./types.js').TranslationMemoryEntry>}
 */
export async function supersedeTranslationMemoryEntry(db, oldMemoryId, newEntryData, approvedBy, reason) {
    if (!db || !oldMemoryId || !approvedBy) {
        throw new Error('[TRANSLATION_MEMORY] Wymagane parametry: db, oldMemoryId, approvedBy');
    }

    const docRef = db.collection(CC_TRANSLATION_MEMORY_COLLECTION).doc(oldMemoryId);
    const snap = await docRef.get();
    let oldVersion = 1;

    if (snap.exists) {
        const oldData = snap.data();
        oldVersion = oldData.version || 1;
        await docRef.update({
            status: 'SUPERSEDED',
            updatedAt: new Date().toISOString()
        });
    }

    const newRecord = await recordApprovedTranslation(db, {
        ...newEntryData,
        version: oldVersion + 1,
        supersedes: oldMemoryId,
        reason: reason || `Zastąpienie wersji v${oldVersion}`
    }, approvedBy);

    return newRecord;
}
