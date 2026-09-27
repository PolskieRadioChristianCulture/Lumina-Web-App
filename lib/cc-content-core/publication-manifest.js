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
    const manifestSeed = `${content.contentId}:${variant.variantId}:${platform}:${channelId}:${variantHash}`;
    const manifestId = `pubm_${crypto.createHash('sha256').update(manifestSeed).digest('hex').substring(0, 16)}`;

    /** @type {import('./types.js').PublicationManifest} */
    const manifest = Object.freeze({
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
        channelId: channelId || 'default',
        adapterVersion: adapterVersion || '1.0.0',
        createdAt: new Date().toISOString(),
        createdBy: operator || 'operator_dowodca'
    });

    IN_MEMORY_MANIFESTS.set(manifestId, manifest);
    return manifest;
}

/**
 * Pobiera manifest publikacji po identyfikatorze
 * @param {string} manifestId
 * @returns {import('./types.js').PublicationManifest|null}
 */
export function getPublicationManifest(manifestId) {
    return IN_MEMORY_MANIFESTS.get(manifestId) || null;
}
