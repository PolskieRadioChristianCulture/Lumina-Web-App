/**
 * ══════════════════════════════════════════════════════════════════════════
 * CC CONTENT ID GENERATOR — CONCURRENCY-SAFE TRANSACTIONAL COUNTER
 * Standard: CC-YYYY-NNNNNN (np. CC-2026-000001)
 * Zabezpieczenie przed race condition przez transakcje Firestore.
 * ══════════════════════════════════════════════════════════════════════════
 */

import { CC_COUNTERS_COLLECTION, CC_COUNTERS_DOC } from './types.js';

const CONTENT_ID_REGEX = /^CC-(\d{4})-(\d{6})$/;

/**
 * Sprawdza czy dany ciąg znaków jest poprawnym identyfikatorem CC CONTENT ID
 * @param {string} id
 * @returns {boolean}
 */
export function isValidContentId(id) {
    if (typeof id !== 'string') return false;
    return CONTENT_ID_REGEX.test(id.trim());
}

/**
 * Formatuje rok i numer sekwencyjny do formatu kanonicznego CC-YYYY-NNNNNN
 * @param {number|string} year
 * @param {number} seqNumber
 * @returns {string}
 */
export function formatContentId(year, seqNumber) {
    const yStr = String(year).trim();
    const nStr = String(seqNumber).padStart(6, '0');
    return `CC-${yStr}-${nStr}`;
}

/**
 * Wyciąga rok i numer sekwencyjny z CC CONTENT ID
 * @param {string} id
 * @returns {{year: number, seq: number}|null}
 */
export function parseContentId(id) {
    const match = String(id).trim().match(CONTENT_ID_REGEX);
    if (!match) return null;
    return {
        year: parseInt(match[1], 10),
        seq: parseInt(match[2], 10)
    };
}

/**
 * Generuje kolejny unikalny CC CONTENT ID w sposób w 100% transakcyjny i odporny na wyścigi.
 * Transakcja Firestore blokuje optymistycznie dokument licznika dla danego roku.
 * 
 * @param {import('firebase-admin/firestore').Firestore} db
 * @param {number} [targetYear]
 * @returns {Promise<string>} Nowy unikalny Content ID
 */
export async function generateNextContentId(db, targetYear = null) {
    if (!db || typeof db.runTransaction !== 'function') {
        throw new Error('[ID_GENERATOR] Wymagana jest poprawna instancja Firestore z obsługą runTransaction.');
    }

    const year = targetYear || new Date().getFullYear();
    const yearKey = `year_${year}`;
    const counterRef = db.collection(CC_COUNTERS_COLLECTION).doc(CC_COUNTERS_DOC);

    const generatedId = await db.runTransaction(async (transaction) => {
        const counterDoc = await transaction.get(counterRef);
        let nextNumber = 1;

        if (counterDoc.exists) {
            const data = counterDoc.data() || {};
            const currentYearSeq = data[yearKey] || 0;
            nextNumber = currentYearSeq + 1;
            transaction.update(counterRef, {
                [yearKey]: nextNumber,
                lastUpdatedAt: new Date().toISOString()
            });
        } else {
            transaction.set(counterRef, {
                [yearKey]: nextNumber,
                createdAt: new Date().toISOString(),
                lastUpdatedAt: new Date().toISOString()
            });
        }

        return formatContentId(year, nextNumber);
    });

    return generatedId;
}
