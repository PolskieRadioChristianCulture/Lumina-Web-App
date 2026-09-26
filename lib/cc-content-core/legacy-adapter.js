/**
 * ══════════════════════════════════════════════════════════════════════════
 * CC LEGACY ADAPTER LAYER — READ-FIRST COMPATIBILITY & OBSERVABILITY
 * Standard Architektury: MASTER PLAN CC GLOBAL 2030 (FAZA 1)
 * Zasada: READ / REGISTER / OBSERVE (Bez modyfikowania i bez usuwania legacy)
 * ══════════════════════════════════════════════════════════════════════════
 */

import { createMasterContent, addVariant, registerPublication } from './content-service.js';

/**
 * Mapuje dokument ze starych kolekcji `morning_inspirations` / `web_inspirations` (Mission Control)
 * na strukturę kanoniczną CC Content Core
 * @param {any} data
 * @param {string} docId
 * @returns {import('./types.js').ContentMasterRecord}
 */
export function mapMorningInspirationToMaster(data, docId) {
    const rawTitle = data.title || `Rozważanie ${data.dayNumber ? 'Dzień ' + data.dayNumber : docId}`;
    const cleanTitle = rawTitle.replace(/^##\s*/, '').replace(/^[☀️🌿🕊️]\s*/, '').trim();

    return {
        type: 'DEVOTIONAL',
        status: data.published ? 'PUBLISHED' : 'DRAFT',
        originalLanguage: 'pl',
        title: cleanTitle,
        description: data.teaser || data.summary || cleanTitle,
        summary: data.teaser || (data.text ? data.text.substring(0, 160) + '...' : ''),
        author: data.author || 'Cezary Rogowski',
        publisher: 'Christian Culture',
        series: data.series || 'Lato ku Bożej chwale',
        category: 'Formacja Duchowa',
        tags: ['rozważanie', 'wiara', 'christian culture', 'dzień ' + (data.dayNumber || '')].filter(Boolean),
        biblicalReferences: parseSimpleScriptureReference(data.text || data.title || ''),
        source: 'Mission Control morning_inspirations',
        sourceType: 'DEVOTIONAL_DAILY',
        sourceUrl: null,
        rights: {
            ownership: 'CC_OWNED',
            translationAllowed: true,
            editingAllowed: true,
            redistributionAllowed: true,
            monetizationAllowed: false,
            licenseName: 'Christian Culture Open Mission License',
            rightsOwner: 'Christian Culture'
        },
        legacySources: [
            {
                system: 'cc-mission-control',
                collection: 'morning_inspirations',
                documentId: docId,
                importedAt: new Date().toISOString()
            }
        ],
        createdAt: data.createdAt || data.date || new Date().toISOString(),
        publishedAt: data.publishedAt || data.date || null
    };
}

/**
 * Mapuje dokument z kolekcji `reflections` (Aplikacja "Dobrze, że jesteś" / cuda-398c0)
 * @param {any} data
 * @param {string} docId
 */
export function mapReflectionToMaster(data, docId) {
    const title = data.title || `Rozważanie ${data.date || docId}`;

    return {
        type: 'DEVOTIONAL',
        status: 'PUBLISHED',
        originalLanguage: 'pl',
        title: title.trim(),
        description: data.teaser || title,
        summary: data.teaser || '',
        author: data.author || 'Cezary Rogowski',
        publisher: 'Christian Culture',
        series: 'Dobrze, że jesteś',
        category: 'Inspiracja Codzienna',
        tags: ['dobrze że jesteś', 'rozważanie', data.dayOfWeek || ''].filter(Boolean),
        biblicalReferences: parseSimpleScriptureReference(data.fullText || ''),
        source: 'Aplikacja Dobrze, że jesteś (cuda-398c0)',
        sourceType: 'DEVOTIONAL_DAILY',
        sourceUrl: null,
        rights: {
            ownership: 'CC_OWNED',
            translationAllowed: true,
            editingAllowed: true,
            redistributionAllowed: true,
            monetizationAllowed: false,
            licenseName: 'Christian Culture Open Mission License',
            rightsOwner: 'Christian Culture'
        },
        legacySources: [
            {
                system: 'cuda-398c0',
                collection: 'reflections',
                documentId: docId,
                importedAt: new Date().toISOString()
            }
        ],
        createdAt: data.date ? `${data.date}T06:00:00Z` : new Date().toISOString(),
        publishedAt: data.date ? `${data.date}T06:00:00Z` : new Date().toISOString()
    };
}

/**
 * Pomocniczy parser referencji biblijnych z tekstu
 * @param {string} text
 * @returns {import('./types.js').BiblicalReference[]}
 */
export function parseSimpleScriptureReference(text) {
    if (!text || typeof text !== 'string') return [];
    const references = [];

    // Dopasowanie schematu: [Księga] [Rozdział]:[Werset] np. "Iz 30:15", "Izajasza 30:15", "Jana 3:16"
    const regex = /\b([1-3]?\s?[A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż]+)\s+(\d+)[:,\.]\s*(\d+)(?:-(\d+))?\b/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
        references.push({
            book: match[1].trim(),
            chapter: parseInt(match[2], 10),
            verseStart: parseInt(match[3], 10),
            verseEnd: match[4] ? parseInt(match[4], 10) : undefined,
            translation: 'UBG',
            isDirectQuote: text.includes('„') || text.includes('"')
        });
        if (references.length >= 3) break; // Maksymalnie 3 główne referencje
    }

    return references;
}

/**
 * Idempotentny import pojedynczego materiału ze starego systemu
 * @param {import('firebase-admin/firestore').Firestore} targetDb
 * @param {Object} legacyPayload
 * @param {string} legacyPayload.system
 * @param {string} legacyPayload.collection
 * @param {string} legacyPayload.docId
 * @param {any} legacyPayload.data
 * @param {string} [legacyPayload.preAssignedContentId]
 * @returns {Promise<{ contentId: string, isExisting: boolean }>}
 */
export async function importLegacyRecord(targetDb, legacyPayload) {
    const { system, collection, docId, data, preAssignedContentId } = legacyPayload;

    let masterCandidate;
    if (system === 'cuda-398c0' || collection === 'reflections') {
        masterCandidate = mapReflectionToMaster(data, docId);
    } else {
        masterCandidate = mapMorningInspirationToMaster(data, docId);
    }

    if (preAssignedContentId) {
        masterCandidate.contentId = preAssignedContentId;
    }

    // Wywołanie createMasterContent z wbudowaną deduplikacją
    const res = await createMasterContent(targetDb, masterCandidate, {
        actor: 'Legacy Adapter / Import Engine',
        source: `${system}:${collection}/${docId}`
    });

    // Zarejestruj wariant polski WWW oraz TTS
    if (!res.isExisting) {
        if (data.fullText || data.text) {
            await addVariant(targetDb, res.contentId, {
                variantId: 'var_pl_web',
                language: 'pl',
                locale: 'pl-PL',
                format: 'TEXT_WEB',
                title: masterCandidate.title,
                body: data.fullText || data.text || '',
                radioEligible: true,
                translationStatus: 'ORIGINAL',
                qualityStatus: 'VERIFIED'
            }, 'Legacy Adapter');
        }

        // Zarejestruj informację o istniejącej publikacji w starym systemie
        await registerPublication(targetDb, res.contentId, {
            publicationId: `pub_${system.replace(/[^a-z0-9]/gi, '_')}_${docId.replace(/[^a-z0-9]/gi, '_')}`,
            platform: system.includes('cuda') ? 'CC_LITE' : 'WWW',
            remoteId: docId,
            publicUrl: `https://polskieradio.cc/tablica`,
            status: 'VERIFIED',
            publishedAt: masterCandidate.publishedAt || new Date().toISOString(),
            lastVerifiedAt: new Date().toISOString(),
            verificationEvidence: {
                method: 'MANUAL_INSPECTION',
                verifiedBy: 'Legacy Adapter Engine',
                timestamp: new Date().toISOString()
            }
        }, 'Legacy Adapter');
    }

    return {
        contentId: res.contentId,
        isExisting: res.isExisting
    };
}
