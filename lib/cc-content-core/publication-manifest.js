/**
 * ══════════════════════════════════════════════════════════════════════════
 * CC GLOBAL DISTRIBUTION ENGINE — PUBLICATION MANIFEST (FAZA 3)
 * Standard Architektury: MASTER PLAN CC GLOBAL 2030 (FAZA 3)
 * ══════════════════════════════════════════════════════════════════════════
 */

import crypto from 'crypto';
import { calculateVariantHash } from './rights-gate.js';

/**
 * Pamięć podręczna manifestów (w środowisku runtime / fallback)
 * @type {Map<string, import('./types.js').PublicationManifest>}
 */
const IN_MEMORY_MANIFESTS = new Map();

function deepFreeze(value) {
    if (value && typeof value === 'object' && !Object.isFrozen(value)) {
        Object.freeze(value);
        for (const nested of Object.values(value)) deepFreeze(nested);
    }
    return value;
}

function getManifestId(manifest) {
    const seed = `${manifest.contentId}:${manifest.variantId}:${manifest.platform}:${manifest.channelId}:${manifest.variantHash}`;
    return `pubm_${crypto.createHash('sha256').update(seed).digest('hex').substring(0, 16)}`;
}

function canonicalize(value) {
    if (Array.isArray(value)) return value.map(canonicalize);
    if (value && typeof value === 'object') {
        return Object.fromEntries(Object.keys(value).sort().map(key => [key, canonicalize(value[key])]));
    }
    return value;
}

function getSnapshotDigest(snapshot) {
    const { snapshotDigest, ...manifest } = snapshot;
    return crypto.createHash('sha256')
        .update(JSON.stringify(canonicalize(manifest)))
        .digest('hex');
}

function validatePublicationManifest(manifest) {
    const requiredStrings = [
        'manifestId', 'contentId', 'variantId', 'variantHash', 'title', 'description',
        'platform', 'channelId', 'adapterVersion', 'createdAt', 'createdBy'
    ];
    if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest) ||
        requiredStrings.some(key => typeof manifest[key] !== 'string' || manifest[key].length === 0) ||
        typeof manifest.snapshotDigest !== 'string' || !/^[a-f0-9]{64}$/.test(manifest.snapshotDigest) ||
        !/^[a-f0-9]{64}$/.test(manifest.variantHash) ||
        !Array.isArray(manifest.assetIds) ||
        manifest.assetIds.some(assetId => typeof assetId !== 'string') ||
        !manifest.assetHashes || typeof manifest.assetHashes !== 'object' || Array.isArray(manifest.assetHashes) ||
        !manifest.rightsSnapshot || typeof manifest.rightsSnapshot !== 'object' || Array.isArray(manifest.rightsSnapshot)) {
        throw new Error('PUBLICATION_MANIFEST_INVALID: Nieprawidłowy snapshot manifestu');
    }
    if (manifest.manifestId !== getManifestId(manifest)) {
        throw new Error('PUBLICATION_MANIFEST_ID_MISMATCH: Identyfikator nie pasuje do snapshotu');
    }
    if (manifest.snapshotDigest !== getSnapshotDigest(manifest)) {
        throw new Error('PUBLICATION_MANIFEST_DIGEST_MISMATCH: Snapshot manifestu został zmieniony');
    }
    return manifest;
}

export function serializePublicationManifest(manifest) {
    validatePublicationManifest(manifest);
    return JSON.parse(JSON.stringify(manifest));
}

export function restorePublicationManifest(snapshot) {
    const serialized = serializePublicationManifest(snapshot);
    const existing = IN_MEMORY_MANIFESTS.get(serialized.manifestId);
    if (existing && existing.snapshotDigest !== serialized.snapshotDigest) {
        throw new Error('PUBLICATION_MANIFEST_IMMUTABILITY_VIOLATION: Snapshot różni się od zarejestrowanego manifestu');
    }
    if (existing) return existing;
    const manifest = deepFreeze(serialized);
    IN_MEMORY_MANIFESTS.set(manifest.manifestId, manifest);
    return manifest;
}

/**
 * Tworzy niezmienny manifest publikacji (Immutable Publication Manifest)
 * Zgodnie z Pkt 37 i 38:
 * Stanowi wieczysty, zamrożony snapshot tego, co dokładnie zostało skierowane do emisji.
 * Nawet jeśli Content Master ulegnie późniejszej edycji, manifest zachowuje stan oryginalny.
 * 
 * @param {import('./types.js').ContentMasterRecord} content - Master Content
 * @param {import('./types.js').ContentVariant} variant - Zatwierdzony wariant językowy
 * @param {import('./types.js').PlatformType} platform - Platforma docelowa
 * @param {string} channelId - Identyfikator kanału
 * @param {string} adapterVersion - Wersja użytego adaptera
 * @param {string} operator - Operator autoryzujący publikację
 * @returns {import('./types.js').PublicationManifest}
 */
export function createPublicationManifest(content, variant, platform, channelId, adapterVersion, operator) {
    if (!content || !variant) {
        throw new Error('Nie można utworzyć manifestu bez obiektów content i variant');
    }

    const variantHash = calculateVariantHash(variant.fullText);
    
    // Hashowanie zasobów dołączonych do treści
    const assetIds = [];
    const assetHashes = {};
    if (Array.isArray(content.assets)) {
        for (const asset of content.assets) {
            assetIds.push(asset.assetId);
            assetHashes[asset.assetId] = asset.checksum || crypto.createHash('sha256').update(asset.url || asset.assetId).digest('hex');
        }
    }

    // Unikalny identyfikator manifestu oparty o jego zawartość
    const normalizedChannelId = channelId || 'default';
    const manifestId = getManifestId({
        contentId: content.contentId,
        variantId: variant.variantId,
        platform,
        channelId: normalizedChannelId,
        variantHash
    });
    const existingManifest = IN_MEMORY_MANIFESTS.get(manifestId);

    /** @type {import('./types.js').PublicationManifest} */
    const manifest = {
        manifestId,
        contentId: content.contentId,
        variantId: variant.variantId,
        variantHash,
        assetIds: Object.freeze([...assetIds]),
        assetHashes: Object.freeze({ ...assetHashes }),
        title: variant.title || content.title || 'Untitled Publication',
        description: variant.teaser || content.teaser || '',
        rightsSnapshot: Object.freeze({ ...(content.rights || {}) }),
        platform,
        channelId: normalizedChannelId,
        adapterVersion: adapterVersion || '1.0.0',
        createdAt: existingManifest?.createdAt || new Date().toISOString(),
        createdBy: operator || 'operator_dowodca'
    };
    if (existingManifest) {
        manifest.createdAt = existingManifest.createdAt;
        manifest.createdBy = existingManifest.createdBy;
        manifest.snapshotDigest = getSnapshotDigest(manifest);
        if (manifest.snapshotDigest === existingManifest.snapshotDigest) return existingManifest;
    }
    manifest.snapshotDigest = getSnapshotDigest(manifest);

    return restorePublicationManifest(manifest);
}

/**
 * Pobiera manifest publikacji po identyfikatorze
 * @param {string} manifestId
 * @returns {import('./types.js').PublicationManifest|null}
 */
export function getPublicationManifest(manifestId) {
    return IN_MEMORY_MANIFESTS.get(manifestId) || null;
}
