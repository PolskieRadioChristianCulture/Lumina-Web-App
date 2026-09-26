/**
 * ══════════════════════════════════════════════════════════════════════════
 * CC CONTENT SERVICE — CORE BUSINESS LOGIC & TRANSACTIONAL WORKFLOWS
 * Standard Architektury: MASTER PLAN CC GLOBAL 2030 (FAZA 1)
 * ══════════════════════════════════════════════════════════════════════════
 */

import {
    CC_SCHEMA_VERSION,
    CC_COLLECTION_NAME
} from './types.js';
import { generateNextContentId, isValidContentId } from './id-generator.js';

/**
 * Waliduje prawa autorskie (Rights Guard)
 * @param {import('./types.js').RightsModel} rights
 * @param {string} targetStatus
 */
export function validateRights(rights, targetStatus = 'DRAFT') {
    if (!rights || typeof rights !== 'object') {
        throw new Error('[RIGHTS_GUARD] Rekord praw autorskich (rights) jest wymagany.');
    }
    if (!['CC_OWNED', 'LICENSED', 'EXTERNAL', 'UNKNOWN'].includes(rights.ownership)) {
        throw new Error(`[RIGHTS_GUARD] Nieprawidłowy typ własności praw: ${rights.ownership}`);
    }
    if (rights.ownership === 'UNKNOWN' && ['PUBLISHED', 'VERIFIED'].includes(targetStatus)) {
        throw new Error('[RIGHTS_GUARD] KRYTYCZNA BLOKADA: Prawa autorskie UNKNOWN uniemożliwiają publikację treści!');
    }
}

/**
 * Waliduje dowód weryfikacji publikacji (Verified Verification Evidence Guard)
 * @param {import('./types.js').ContentPublicationRecord} pubData
 */
export function validatePublication(pubData) {
    if (!pubData.platform) {
        throw new Error('[PUB_GUARD] Pole platform jest wymagane dla rekordu publikacji.');
    }
    if (pubData.status === 'VERIFIED') {
        if (!pubData.publicUrl && !pubData.remoteId) {
            throw new Error('[PUB_GUARD] Status VERIFIED wymaga podania co najmniej publicUrl lub remoteId.');
        }
        if (!pubData.lastVerifiedAt) {
            pubData.lastVerifiedAt = new Date().toISOString();
        }
    }
}

/**
 * Tworzy wpis śladu rewizyjnego w podkolekcji audit
 * @param {import('firebase-admin/firestore').Firestore} db
 * @param {string} contentId
 * @param {string} actor
 * @param {string} action
 * @param {any} before
 * @param {any} after
 * @param {string} source
 */
export async function appendAuditLog(db, contentId, actor, action, before, after, source = 'SYSTEM') {
    const auditRef = db.collection(CC_COLLECTION_NAME).doc(contentId).collection('audit').doc();
    const auditRecord = {
        auditId: auditRef.id,
        contentId,
        actor: actor || 'system',
        action,
        timestamp: new Date().toISOString(),
        before: before ? JSON.parse(JSON.stringify(before)) : null,
        after: after ? JSON.parse(JSON.stringify(after)) : null,
        source
    };
    await auditRef.set(auditRecord);
    return auditRecord;
}

/**
 * Formatuje spłaszczony klucz źródła legacy (system:collection:docId)
 * @param {string} system
 * @param {string} collection
 * @param {string} documentId
 * @returns {string}
 */
export function formatLegacyKey(system, collection, documentId) {
    return `${(system || '').trim()}:${(collection || '').trim()}:${(documentId || '').trim()}`.toLowerCase();
}

/**
 * Sprawdza czy materiał o podanych legacySources już istnieje w bazie (Deduplication)
 * @param {import('firebase-admin/firestore').Firestore} db
 * @param {import('./types.js').LegacySource[]} legacySources
 * @returns {Promise<string|null>} Istniejący contentId lub null
 */
export async function findExistingByLegacySource(db, legacySources) {
    if (!Array.isArray(legacySources) || legacySources.length === 0) return null;

    for (const source of legacySources) {
        if (!source.system || !source.documentId) continue;
        const key = formatLegacyKey(source.system, source.collection, source.documentId);
        const snapshot = await db.collection(CC_COLLECTION_NAME)
            .where('legacySourceKeys', 'array-contains', key)
            .limit(1)
            .get();

        if (!snapshot.empty) {
            return snapshot.docs[0].id;
        }
    }
    return null;
}


/**
 * Tworzy kanoniczny rekord Master Content
 * @param {import('firebase-admin/firestore').Firestore} db
 * @param {Partial<import('./types.js').ContentMasterRecord>} inputData
 * @param {Object} options
 * @param {string} [options.actor]
 * @param {string} [options.source]
 * @returns {Promise<{ contentId: string, record: import('./types.js').ContentMasterRecord, isExisting: boolean }>}
 */
export async function createMasterContent(db, inputData, options = {}) {
    const actor = options.actor || 'system';
    const sourceSystem = options.source || 'Mission Control Core';

    // 1. Sprawdzenie deduplikacji po legacySources jeśli podano
    if (inputData.legacySources && inputData.legacySources.length > 0) {
        const existingId = await findExistingByLegacySource(db, inputData.legacySources);
        if (existingId) {
            const existingDoc = await db.collection(CC_COLLECTION_NAME).doc(existingId).get();
            return {
                contentId: existingId,
                record: existingDoc.data(),
                isExisting: true
            };
        }
    }

    // 2. Walidacja praw autorskich
    validateRights(inputData.rights, inputData.status || 'DRAFT');

    // 3. Generowanie lub walidacja CC CONTENT ID
    let contentId = inputData.contentId;
    if (contentId) {
        if (!isValidContentId(contentId)) {
            throw new Error(`[CONTENT_CORE] Niepoprawny format pre-assigned contentId: "${contentId}"`);
        }
        const existingDoc = await db.collection(CC_COLLECTION_NAME).doc(contentId).get();
        if (existingDoc.exists) {
            return {
                contentId,
                record: existingDoc.data(),
                isExisting: true
            };
        }
    } else {
        contentId = await generateNextContentId(db);
    }

    const now = new Date().toISOString();
    const masterRecord = {
        contentId,
        schemaVersion: CC_SCHEMA_VERSION,
        type: inputData.type || 'DEVOTIONAL',
        status: inputData.status || 'DRAFT',
        originalLanguage: inputData.originalLanguage || 'pl',
        title: (inputData.title || '').trim(),
        description: (inputData.description || '').trim(),
        summary: (inputData.summary || '').trim(),
        author: (inputData.author || 'Christian Culture').trim(),
        publisher: (inputData.publisher || 'Christian Culture').trim(),
        series: (inputData.series || '').trim(),
        category: (inputData.category || 'Ogólne').trim(),
        tags: Array.isArray(inputData.tags) ? inputData.tags : [],
        biblicalReferences: Array.isArray(inputData.biblicalReferences) ? inputData.biblicalReferences : [],
        source: inputData.source || 'CC Studio / Mission Control',
        sourceType: inputData.sourceType || 'ORIGINAL_PRODUCTION',
        sourceUrl: inputData.sourceUrl || null,
        rights: inputData.rights,
        legacySources: Array.isArray(inputData.legacySources) ? inputData.legacySources : [],
        legacySourceKeys: Array.isArray(inputData.legacySources)
            ? inputData.legacySources.map(s => formatLegacyKey(s.system, s.collection, s.documentId)).filter(Boolean)
            : (Array.isArray(inputData.legacySourceKeys) ? inputData.legacySourceKeys : []),
        parentContentId: inputData.parentContentId || null,
        relationshipType: inputData.relationshipType || null,
        media: {
            thumbnailAssetId: inputData.media?.thumbnailAssetId || null,
            masterAudioAssetId: inputData.media?.masterAudioAssetId || null,
            masterVideoAssetId: inputData.media?.masterVideoAssetId || null
        },
        createdAt: inputData.createdAt || now,
        updatedAt: now,
        publishedAt: inputData.publishedAt || (inputData.status === 'PUBLISHED' || inputData.status === 'VERIFIED' ? now : null),
        createdBy: actor,
        updatedBy: actor
    };

    if (!masterRecord.title) {
        throw new Error('[CONTENT_CORE] Pole title jest wymagane.');
    }

    const docRef = db.collection(CC_COLLECTION_NAME).doc(contentId);
    await docRef.set(masterRecord);

    await appendAuditLog(db, contentId, actor, 'CREATE_MASTER', null, masterRecord, sourceSystem);

    return {
        contentId,
        record: masterRecord,
        isExisting: false
    };
}

/**
 * Dodaje wariant językowy lub formalny do treści
 * @param {import('firebase-admin/firestore').Firestore} db
 * @param {string} contentId
 * @param {Partial<import('./types.js').ContentVariantRecord>} variantData
 * @param {string} [actor]
 */
export async function addVariant(db, contentId, variantData, actor = 'system') {
    if (!contentId) throw new Error('[VARIANT] Brak contentId');
    const masterRef = db.collection(CC_COLLECTION_NAME).doc(contentId);
    const masterDoc = await masterRef.get();
    if (!masterDoc.exists) {
        throw new Error(`[VARIANT] Master content o ID ${contentId} nie istnieje.`);
    }

    const variantId = variantData.variantId || `var_${variantData.language || 'pl'}_${(variantData.format || 'web').toLowerCase()}`;
    const varRef = masterRef.collection('variants').doc(variantId);
    const now = new Date().toISOString();

    const fullRecord = {
        variantId,
        contentId,
        language: variantData.language || 'pl',
        locale: variantData.locale || `${variantData.language || 'pl'}-PL`,
        format: variantData.format || 'TEXT_WEB',
        title: variantData.title || masterDoc.data().title,
        description: variantData.description || '',
        body: variantData.body || '',
        transcript: variantData.transcript || null,
        subtitleAssetId: variantData.subtitleAssetId || null,
        voiceAssetId: variantData.voiceAssetId || null,
        videoAssetId: variantData.videoAssetId || null,
        imageAssetId: variantData.imageAssetId || null,
        radioEligible: Boolean(variantData.radioEligible),
        radioPriority: variantData.radioPriority || null,
        radioCategory: variantData.radioCategory || null,
        translationStatus: variantData.translationStatus || 'ORIGINAL',
        qualityStatus: variantData.qualityStatus || 'VERIFIED',
        createdAt: variantData.createdAt || now,
        updatedAt: now
    };

    await varRef.set(fullRecord, { merge: true });
    await appendAuditLog(db, contentId, actor, 'ADD_VARIANT', null, fullRecord, 'Content Core');
    return fullRecord;
}

/**
 * Rejestruje fizyczny zasób (Asset) powiązany z treścią
 * @param {import('firebase-admin/firestore').Firestore} db
 * @param {string} contentId
 * @param {Partial<import('./types.js').ContentAssetRecord>} assetData
 * @param {string} [actor]
 */
export async function addAsset(db, contentId, assetData, actor = 'system') {
    if (!contentId) throw new Error('[ASSET] Brak contentId');
    const masterRef = db.collection(CC_COLLECTION_NAME).doc(contentId);
    const assetId = assetData.assetId || `ast_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const assetRef = masterRef.collection('assets').doc(assetId);

    const fullRecord = {
        assetId,
        contentId,
        type: assetData.type || 'DOCUMENT',
        mimeType: assetData.mimeType || 'application/octet-stream',
        storageProvider: assetData.storageProvider || 'LOCAL',
        storagePath: assetData.storagePath || '',
        url: assetData.url || '',
        checksum: assetData.checksum || 'NOT_COMPUTED',
        size: Number(assetData.size || 0),
        createdAt: assetData.createdAt || new Date().toISOString()
    };

    await assetRef.set(fullRecord);
    await appendAuditLog(db, contentId, actor, 'ADD_ASSET', null, fullRecord, 'Content Core');
    return fullRecord;
}

/**
 * Rejestruje lub aktualizuje publikację platformową
 * @param {import('firebase-admin/firestore').Firestore} db
 * @param {string} contentId
 * @param {Partial<import('./types.js').ContentPublicationRecord>} pubData
 * @param {string} [actor]
 */
export async function registerPublication(db, contentId, pubData, actor = 'system') {
    if (!contentId) throw new Error('[PUBLICATION] Brak contentId');
    validatePublication(pubData);

    const masterRef = db.collection(CC_COLLECTION_NAME).doc(contentId);
    const publicationId = pubData.publicationId || `pub_${(pubData.platform || 'unknown').toLowerCase()}_${Date.now()}`;
    const pubRef = masterRef.collection('publications').doc(publicationId);
    const now = new Date().toISOString();

    const fullRecord = {
        publicationId,
        contentId,
        variantId: pubData.variantId || 'master',
        platform: pubData.platform,
        channelId: pubData.channelId || null,
        accountId: pubData.accountId || null,
        remoteId: pubData.remoteId || null,
        publicUrl: pubData.publicUrl || null,
        status: pubData.status || 'DRAFT',
        scheduledAt: pubData.scheduledAt || null,
        publishedAt: pubData.publishedAt || (pubData.status === 'PUBLISHED' || pubData.status === 'VERIFIED' ? now : null),
        lastVerifiedAt: pubData.lastVerifiedAt || null,
        verificationEvidence: pubData.verificationEvidence || null,
        error: pubData.error || null,
        createdAt: pubData.createdAt || now,
        updatedAt: now
    };

    await pubRef.set(fullRecord, { merge: true });
    await appendAuditLog(db, contentId, actor, 'REGISTER_PUBLICATION', null, fullRecord, 'Content Core');
    return fullRecord;
}

/**
 * Pobiera kompletny rekord Master wraz z podkolekcjami
 * @param {import('firebase-admin/firestore').Firestore} db
 * @param {string} contentId
 * @param {Object} [options]
 * @param {boolean} [options.includeSubcollections=true]
 */
export async function getContentById(db, contentId, options = { includeSubcollections: true }) {
    if (!isValidContentId(contentId)) {
        throw new Error(`[CONTENT_CORE] Nieprawidłowy format Content ID: "${contentId}"`);
    }

    const docRef = db.collection(CC_COLLECTION_NAME).doc(contentId);
    const snapshot = await docRef.get();
    if (!snapshot.exists) return null;

    const master = snapshot.data();

    if (!options.includeSubcollections) {
        return master;
    }

    const [variantsSnap, assetsSnap, pubsSnap, auditSnap] = await Promise.all([
        docRef.collection('variants').get(),
        docRef.collection('assets').get(),
        docRef.collection('publications').get(),
        docRef.collection('audit').orderBy('timestamp', 'desc').limit(50).get()
    ]);

    return {
        ...master,
        variants: variantsSnap.docs.map(d => d.data()),
        assets: assetsSnap.docs.map(d => d.data()),
        publications: pubsSnap.docs.map(d => d.data()),
        audit: auditSnap.docs.map(d => d.data())
    };
}

/**
 * Pobiera listę treści z bezpieczną paginacją (Cost Guard & Pagination)
 * @param {import('firebase-admin/firestore').Firestore} db
 * @param {Object} queryOptions
 * @param {number} [queryOptions.pageSize=20]
 * @param {any} [queryOptions.lastDoc=null]
 * @param {string} [queryOptions.type]
 * @param {string} [queryOptions.status]
 * @param {string} [queryOptions.language]
 */
export async function listContent(db, queryOptions = {}) {
    const pageSize = Math.min(queryOptions.pageSize || 20, 100);
    let q = db.collection(CC_COLLECTION_NAME).orderBy('createdAt', 'desc');

    if (queryOptions.type) {
        q = q.where('type', '==', queryOptions.type);
    }
    if (queryOptions.status) {
        q = q.where('status', '==', queryOptions.status);
    }
    if (queryOptions.language) {
        q = q.where('originalLanguage', '==', queryOptions.language);
    }

    if (queryOptions.lastDoc) {
        q = q.startAfter(queryOptions.lastDoc);
    }

    q = q.limit(pageSize);
    const snapshot = await q.get();

    return {
        items: snapshot.docs.map(d => d.data()),
        lastDoc: snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null,
        count: snapshot.docs.length
    };
}

/**
 * Bezpieczne archiwizowanie treści (Soft Delete Guard)
 * @param {import('firebase-admin/firestore').Firestore} db
 * @param {string} contentId
 * @param {string} actor
 */
export async function archiveContent(db, contentId, actor = 'system') {
    const docRef = db.collection(CC_COLLECTION_NAME).doc(contentId);
    const snapshot = await docRef.get();
    if (!snapshot.exists) throw new Error(`[ARCHIVE] Treść o ID ${contentId} nie istnieje.`);

    const before = snapshot.data();
    const updateData = {
        status: 'ARCHIVED',
        updatedAt: new Date().toISOString(),
        updatedBy: actor
    };

    await docRef.update(updateData);
    await appendAuditLog(db, contentId, actor, 'ARCHIVE_CONTENT', before, { ...before, ...updateData }, 'Mission Control UI');
    return { success: true, contentId, status: 'ARCHIVED' };
}

/**
 * Aktualizuje status treści z egzekwowaniem Rights Guard
 * @param {import('firebase-admin/firestore').Firestore} db
 * @param {string} contentId
 * @param {import('./types.js').ContentStatus} newStatus
 * @param {string} actor
 */
export async function updateContentStatus(db, contentId, newStatus, actor = 'system') {
    const docRef = db.collection(CC_COLLECTION_NAME).doc(contentId);
    const snapshot = await docRef.get();
    if (!snapshot.exists) throw new Error(`[STATUS] Treść o ID ${contentId} nie istnieje.`);

    const before = snapshot.data();

    // Egzekwowanie Rights Guard przy przejściu na status publikacyjny
    validateRights(before.rights, newStatus);

    const updateData = {
        status: newStatus,
        updatedAt: new Date().toISOString(),
        updatedBy: actor
    };

    await docRef.update(updateData);
    await appendAuditLog(db, contentId, actor, 'UPDATE_STATUS', before, { ...before, ...updateData }, 'Mission Control Service');
    return { success: true, contentId, status: newStatus };
}

