/**
 * ══════════════════════════════════════════════════════════════════════════
 * CC GLOBAL DISTRIBUTION ENGINE — RIGHTS GATE (FAZA 3)
 * Standard Architektury: MASTER PLAN CC GLOBAL 2030 (FAZA 3)
 * ══════════════════════════════════════════════════════════════════════════
 */

import crypto from 'crypto';
import { getBibleSourcesForLanguage } from './bible-guard.js';

/**
 * Wylicza deterministyczny skrót SHA-256 tekstu wariantu
 * @param {string} text
 * @returns {string}
 */
export function calculateVariantHash(text) {
    return crypto.createHash('sha256').update(String(text || '').trim()).digest('hex');
}

/**
 * Bramka Praw Autorskich przed Utworzeniem Zadania Dystrybucji (Rights Gate)
 * Zgodnie z Pkt 2, 3 i 39:
 * 1. Przyjmuje WYŁĄCZNIE warianty o statusie APPROVED.
 * 2. Weryfikuje nienaruszalność wariantu po zatwierdzeniu (brak mutacji).
 * 3. Sprawdza prawa do redystrybucji, formatu audio/wideo oraz prawa cytatów biblijnych.
 * 
 * @param {import('./types.js').ContentMasterRecord} content - Rekord Master
 * @param {import('./types.js').ContentVariant} variant - Wariant językowy
 * @param {import('./types.js').PlatformType} platform - Platforma docelowa
 * @param {Object} [options]
 * @param {boolean} [options.requireAudio=false] - Czy dystrybucja wymaga formy audio
 * @param {boolean} [options.requireVideo=false] - Czy dystrybucja wymaga formy wideo
 * @returns {{ allowed: boolean, code?: string, reason?: string, violations: string[] }}
 */
export function validateDistributionRights(content, variant, platform, options = {}) {
    const violations = [];

    // ─────────────────────────────────────────────────────────────
    // 1. KRYTERIUM STATUSU: WYŁĄCZNIE APPROVED (Pkt 2)
    // ─────────────────────────────────────────────────────────────
    if (!variant || variant.status !== 'APPROVED') {
        const currentStatus = variant ? variant.status : 'MISSING';
        return {
            allowed: false,
            code: 'VARIANT_NOT_APPROVED',
            reason: `Dystrybucja dopuszcza WYŁĄCZNIE warianty w stanie APPROVED. Bieżący status wariantu ${variant?.variantId || 'unknown'}: ${currentStatus}`,
            violations: [`VARIANT_STATUS_${currentStatus}`]
        };
    }

    // ─────────────────────────────────────────────────────────────
    // 2. KRYTERIUM INTEGRALNOŚCI: MUTATION AFTER APPROVAL (Pkt 39)
    // ─────────────────────────────────────────────────────────────
    if (variant.approvedContentHash) {
        const currentHash = calculateVariantHash(variant.fullText);
        if (currentHash !== variant.approvedContentHash) {
            return {
                allowed: false,
                code: 'VARIANT_MUTATED_AFTER_APPROVAL',
                reason: 'Wariant uległ modyfikacji po uzyskaniu akceptacji (hash mismatch). Wymagana ponowna walidacja i approval!',
                violations: ['CONTENT_HASH_MISMATCH']
            };
        }
    }

    // ─────────────────────────────────────────────────────────────
    // 3. KRYTERIUM WŁASNOŚCI I REDYSTRYBUCJI (Pkt 3)
    // ─────────────────────────────────────────────────────────────
    const rights = content?.rights;
    if (!rights || rights.ownership === 'UNKNOWN') {
        violations.push('OWNERSHIP_UNKNOWN: Prawa własności materiału źródłowego są nieustalone');
    }

    // Platformy zewnętrzne (np. YouTube, BitChute, Facebook) wymagają redistributionAllowed === true
    const isExternalPlatform = ['YOUTUBE', 'BITCHUTE', 'FACEBOOK', 'INSTAGRAM', 'PODCAST'].includes(platform);
    if (isExternalPlatform && rights && rights.redistributionAllowed === false) {
        violations.push(`REDISTRIBUTION_DISALLOWED: Materiał posiada blokadę redystrybucji na platformach zewnętrznych (${platform})`);
    }

    // ─────────────────────────────────────────────────────────────
    // 4. KRYTERIUM FORM EKSPLOATACJI: AUDIO & WIDEO (Pkt 3)
    // ─────────────────────────────────────────────────────────────
    if (options.requireVideo || platform === 'YOUTUBE' || platform === 'BITCHUTE') {
        // Sprawdź czy materiał dopuszcza formę wideo
        if (rights && rights.editingAllowed === false && !content.assets?.some(a => a.type === 'VIDEO')) {
            violations.push('VIDEO_RIGHTS_MISSING: Brak praw do montażu wideo dla tej platformy');
        }
    }

    if (options.requireAudio || platform === 'RADIO') {
        // Sprawdź czy materiał dopuszcza audio
        if (rights && rights.audioAllowed === false) {
            violations.push('AUDIO_RIGHTS_MISSING: Materiał posiada zakaz emisji audio');
        }
    }

    // ─────────────────────────────────────────────────────────────
    // 5. KRYTERIUM PRAW BIBLIJNYCH DLA FORMATÓW MASOWYCH (Pkt 3, 22 pola)
    // ─────────────────────────────────────────────────────────────
    if (options.requireAudio || platform === 'RADIO') {
        // Przekłady o ograniczeniach audio (np. BW, RVR1960, ARC, ARA) nie mogą być emitowane w masowym audio bez zgody
        const langSources = getBibleSourcesForLanguage(variant.language || 'pl');
        for (const source of langSources) {
            if (source.audioDistributionAllowed === false) {
                // Sprawdź czy w tekście pojawia się ten przekład
                if (variant.fullText && variant.fullText.includes(source.translationCode)) {
                    violations.push(`BIBLE_AUDIO_RIGHTS_RESTRICTED: Przekład ${source.translationCode} wymaga osobnej licencji na masową dystrybucję audio`);
                }
            }
        }
    }

    if (violations.length > 0) {
        return {
            allowed: false,
            code: 'RIGHTS_GATE_BLOCKED',
            reason: `Rights Gate zablokował dystrybucję do platformy ${platform}: ${violations.join('; ')}`,
            violations
        };
    }

    return {
        allowed: true,
        violations: []
    };
}
