/**
 * ══════════════════════════════════════════════════════════════════════════
 * CC GLOBAL FOLLOW THE SUN 24/7 — SHADOW SCHEDULER ENGINE (FAZA 6A)
 * Standard Architektury: MASTER PLAN CC GLOBAL 2030 (FAZA 6A)
 * Dyrektywy 1-2, 27-47, 58-65, 85, 91-95:
 * Tryb SIMULATION ONLY (SHADOW). Czas lokalny odbiorcy, Rights Gate,
 * Approval Gate, Platform Capability, Idempotencja, Collision Guard,
 * Duplicate Guard, Content Fatigue, Distribution Firewall & Kill Switch.
 * 
 * ZASADA ŻELAZNA: Żaden Shadow Schedule nie uruchamia Distribution Engine!
 * STATUS 'QUEUED' JEST KATEGORYCZNIE ZABRONIONY.
 * ══════════════════════════════════════════════════════════════════════════
 */

import crypto from 'crypto';
import { getMarket, isValidMarketId } from './target-market-registry.js';
import { isValidIanaTimezone, calculateWindowUtc, localToUtc } from './timezone-engine.js';
import { resolveSchedulingWindow, SCHEDULING_RULE_VERSION } from './scheduling-rules.js';
import { getPlatformCapability } from '../cc-content-core/distribution-registry.js';

export const SCHEDULER_VERSION = 'v1';

/**
 * Globalny stan Kill Switch dla Follow the Sun
 */
let followTheSunKilled = false;

/**
 * Ustawia stan Kill Switch dla Follow the Sun (Dyrektywa 60)
 * @param {boolean} killed
 */
export function setFollowTheSunKillSwitch(killed) {
    followTheSunKilled = Boolean(killed);
}

/**
 * Pobiera stan Kill Switch
 * @returns {boolean}
 */
export function isFollowTheSunKilled() {
    return followTheSunKilled;
}

export class FollowTheSunEngine {
    constructor(options = {}) {
        this.schedulesStore = new Map(); // scheduleId -> ShadowScheduleRecord
        this.ruleVersion = SCHEDULING_RULE_VERSION;
        this.schedulerVersion = SCHEDULER_VERSION;
        this.simulationMode = true; // Dyrektywa 61: Zawsze true w 6A
        this.enabled = false; // Dyrektywa 61: followTheSunEnabled = false
        this.fatigueWindowMs = (options.fatigueHours || 24) * 3600 * 1000;
    }

    /**
     * ══════════════════════════════════════════════════════════════════════════
     * DISTRIBUTION FIREWALL (Dyrektywy 63, 64)
     * Pancerne zabezpieczenie: silnik Follow the Sun nie posiada uprawnień
     * do wywołania dystrybucji, publikacji, wysyłki ani edycji ramówki.
     * ══════════════════════════════════════════════════════════════════════════
     */
    publish() {
        throw new Error('FOLLOW_THE_SUN_SECURITY_VIOLATION: Silnik Follow the Sun (Faza 6A) ma bezwzględny zakaz publikacji');
    }

    enqueueDistribution() {
        throw new Error('FOLLOW_THE_SUN_SECURITY_VIOLATION: Silnik Follow the Sun (Faza 6A) ma bezwzględny zakaz kolejkowania dystrybucji');
    }

    schedulePublication() {
        throw new Error('FOLLOW_THE_SUN_SECURITY_VIOLATION: Silnik Follow the Sun (Faza 6A) ma bezwzględny zakaz planowania publikacji platformowych');
    }

    sendWhatsApp() {
        throw new Error('FOLLOW_THE_SUN_SECURITY_VIOLATION: Silnik Follow the Sun (Faza 6A) ma bezwzględny zakaz wysyłania wiadomości WhatsApp');
    }

    changeRadioSchedule() {
        throw new Error('FOLLOW_THE_SUN_SECURITY_VIOLATION: Silnik Follow the Sun (Faza 6A) ma bezwzględny zakaz modyfikacji ramówki radiowej');
    }

    /**
     * Generuje deterministyczny identyfikator propozycji harmonogramu (Dyrektywy 43, 44)
     * @param {Object} params
     * @returns {string}
     */
    generateScheduleId({ contentId, variantId, platform, channelId, marketId, targetLocalDate, preferredTime }) {
        const payload = [
            contentId,
            variantId,
            platform,
            channelId || 'default',
            marketId,
            targetLocalDate,
            preferredTime || 'none',
            this.ruleVersion,
            this.schedulerVersion
        ].join(':');

        const hash = crypto.createHash('sha256').update(payload).digest('hex').substring(0, 16);
        return `fts_${hash}`;
    }

    /**
     * Główna metoda generująca symulację harmonogramu (Shadow Schedule)
     * 
     * @param {Object} params
     * @param {Object} params.content - Rekord treści CC (Content Core)
     * @param {Object} params.variant - Wariant językowy treści
     * @param {string} params.marketId - Identyfikator rynku (np. 'PL', 'GB', 'US_EAST', 'US_WEST', 'ES', 'MX', 'BR')
     * @param {string} params.platform - Platforma docelowa (np. 'WWW', 'YOUTUBE', 'LUMINA', 'RADIO', 'WHATSAPP')
     * @param {string} [params.channelId] - Kanał emisyjny
     * @param {string} params.targetLocalDate - Docelowa data lokalna (YYYY-MM-DD)
     * @param {Object} [params.options] - Dodatkowe opcje (override, sunset, data)
     * @returns {import('../cc-content-core/types.js').ShadowScheduleRecord}
     */
    simulateSchedule({
        content,
        variant,
        marketId,
        platform,
        channelId = 'default',
        targetLocalDate,
        options = {}
    }) {
        // 1. Sprawdź Kill Switch (Dyrektywy 60, 62)
        if (isFollowTheSunKilled()) {
            return {
                scheduleId: 'fts_killed',
                contentId: content?.contentId || 'unknown',
                variantId: variant?.variantId || 'unknown',
                platform,
                channelId,
                marketId,
                locale: variant?.language || 'unknown',
                timezone: 'UTC',
                suggestedLocalDate: targetLocalDate,
                suggestedLocalTime: '00:00',
                suggestedAtUtc: new Date().toISOString(),
                windowStartUtc: new Date().toISOString(),
                windowEndUtc: new Date().toISOString(),
                schedulingBasis: 'INSUFFICIENT_DATA',
                evidenceLevel: 'INSUFFICIENT',
                evidence: { killSwitch: true },
                whyThisTime: 'FOLLOW_THE_SUN_KILL_SWITCH_ACTIVE: Wszystkie symulacje są zablokowane',
                rightsStatus: 'UNKNOWN',
                approvalStatus: 'UNKNOWN',
                platformCapability: 'DISABLED',
                status: 'INSUFFICIENT_DATA',
                createdAt: new Date().toISOString(),
                schedulerVersion: this.schedulerVersion,
                ruleVersion: this.ruleVersion
            };
        }

        // 2. Walidacja Rynku (Target Market) i Strefy Czasowej (Dyrektywy 10, 66, 67)
        if (!isValidMarketId(marketId)) {
            throw new Error(`INVALID_TARGET_MARKET: Nieznany rynek docelowy '${marketId}'`);
        }
        const market = getMarket(marketId);
        const timezone = options.customTimezone || market.timezone;

        if (!isValidIanaTimezone(timezone)) {
            throw new Error(`INVALID_IANA_TIMEZONE: '${timezone}'`);
        }

        // 3. Walidacja Platformy (Platform Capability Registry - Dyrektywy 30, 31, 37)
        const cap = getPlatformCapability(platform);
        if (!cap || cap.publicationMode === 'DISABLED') {
            return this._createRecord({
                content,
                variant,
                market,
                platform,
                channelId,
                targetLocalDate,
                timezone,
                localTime: '00:00',
                utcIso: localToUtc(targetLocalDate, '00:00', timezone).utcIso,
                windowStartUtc: localToUtc(targetLocalDate, '00:00', timezone).utcIso,
                windowEndUtc: localToUtc(targetLocalDate, '00:00', timezone).utcIso,
                basis: 'INSUFFICIENT_DATA',
                evidenceLevel: 'INSUFFICIENT',
                evidence: { platformDisabled: true },
                whyThisTime: `Platforma ${platform} jest wyłączona lub nieobsługiwana (PLATFORM_UNAVAILABLE).`,
                status: 'PLATFORM_UNAVAILABLE',
                platformCapability: cap ? cap.schedulingCapability || 'noScheduling' : 'noScheduling'
            });
        }

        // 4. Content Policy: Rights Gate (Dyrektywy 27, 29)
        const isRightsAllowed = content && content.rightsStatus === 'ALLOWED' && content.publicationAllowed !== false;
        // Weryfikacja specyficznych praw dla audio (np. Radio wymaga praw do audio)
        const isAudioPlatform = platform === 'RADIO';
        const isAudioRightsBlocked = isAudioPlatform && content.audioRightsAllowed === false;

        if (!isRightsAllowed || isAudioRightsBlocked) {
            const reason = isAudioRightsBlocked
                ? 'Prawa autorskie do ścieżki audio są zablokowane dla Radio'
                : 'Brak praw autorskich do publikacji (RIGHTS_NOT_ALLOWED)';

            return this._createRecord({
                content,
                variant,
                market,
                platform,
                channelId,
                targetLocalDate,
                timezone,
                localTime: '00:00',
                utcIso: localToUtc(targetLocalDate, '00:00', timezone).utcIso,
                windowStartUtc: localToUtc(targetLocalDate, '00:00', timezone).utcIso,
                windowEndUtc: localToUtc(targetLocalDate, '00:00', timezone).utcIso,
                basis: 'OPERATOR_RULE',
                evidenceLevel: 'STRONG',
                evidence: { rightsBlocked: true, reason },
                whyThisTime: `BLOKADA PRAWNA: ${reason}`,
                status: 'BLOCKED_BY_RIGHTS',
                platformCapability: cap.schedulingCapability
            });
        }

        // 5. Content Policy: Approval Gate (Dyrektywa 28)
        // Treść i wariant MUSZĄ posiadać status APPROVED. Status REVIEW_REQUIRED = BLOCKED_BY_APPROVAL.
        const isVariantApproved = variant && (variant.translationStatus === 'APPROVED' || variant.translationStatus === 'ORIGINAL') && variant.qualityStatus !== 'REJECTED';
        if (!isVariantApproved) {
            return this._createRecord({
                content,
                variant,
                market,
                platform,
                channelId,
                targetLocalDate,
                timezone,
                localTime: '00:00',
                utcIso: localToUtc(targetLocalDate, '00:00', timezone).utcIso,
                windowStartUtc: localToUtc(targetLocalDate, '00:00', timezone).utcIso,
                windowEndUtc: localToUtc(targetLocalDate, '00:00', timezone).utcIso,
                basis: 'OPERATOR_RULE',
                evidenceLevel: 'STRONG',
                evidence: {
                    approvalBlocked: true,
                    currentTranslationStatus: variant?.translationStatus || 'MISSING',
                    currentQualityStatus: variant?.qualityStatus || 'MISSING'
                },
                whyThisTime: `BLOKADA REDAKCYJNA: Wariant językowy ${variant?.language || 'nieznany'} wymaga autoryzacji człowieka (status: ${variant?.translationStatus || 'MISSING'}). Brak aktywnego slotu emisyjnego.`,
                status: 'BLOCKED_BY_APPROVAL',
                platformCapability: cap.schedulingCapability
            });
        }

        // 6. Rozwiązanie okna czasowego (Scheduling Rules & Time Profiles - Dyrektywy 14-26)
        const profile = content.timeProfile || 'EVERGREEN';
        const windowRes = resolveSchedulingWindow({
            profile,
            targetLocalDate,
            timezone,
            operatorOverride: options.operatorOverride,
            fixedTime: options.fixedTime,
            sunsetSource: options.sunsetSource,
            aggregatedData: options.aggregatedData
        });

        // Obsługa braku danych astronomicznych dla Szabatu (Dyrektywy 25, 26, 76)
        if (windowRes.sunsetRequired) {
            return this._createRecord({
                content,
                variant,
                market,
                platform,
                channelId,
                targetLocalDate,
                timezone,
                localTime: '00:00',
                utcIso: localToUtc(targetLocalDate, '00:00', timezone).utcIso,
                windowStartUtc: localToUtc(targetLocalDate, '00:00', timezone).utcIso,
                windowEndUtc: localToUtc(targetLocalDate, '00:00', timezone).utcIso,
                basis: 'INSUFFICIENT_DATA',
                evidenceLevel: 'INSUFFICIENT',
                evidence: windowRes.evidence,
                whyThisTime: windowRes.whyThisTime,
                status: 'SUNSET_DATA_REQUIRED',
                platformCapability: cap.schedulingCapability
            });
        }

        // Obsługa wymaganej recenzji manualnej (np. BREAKING)
        if (windowRes.requiresOperatorReview) {
            return this._createRecord({
                content,
                variant,
                market,
                platform,
                channelId,
                targetLocalDate,
                timezone,
                localTime: '00:00',
                utcIso: localToUtc(targetLocalDate, '00:00', timezone).utcIso,
                windowStartUtc: localToUtc(targetLocalDate, '00:00', timezone).utcIso,
                windowEndUtc: localToUtc(targetLocalDate, '00:00', timezone).utcIso,
                basis: windowRes.schedulingBasis,
                evidenceLevel: windowRes.evidenceLevel,
                evidence: windowRes.evidence,
                whyThisTime: windowRes.whyThisTime,
                status: 'OPERATOR_REVIEW_REQUIRED',
                platformCapability: cap.schedulingCapability
            });
        }

        // 7. Obliczenie współrzędnych czasowych UTC (Timezone Engine - Dyrektywy 3, 5, 73)
        const windowUtc = calculateWindowUtc(
            targetLocalDate,
            windowRes.windowStartLocal,
            windowRes.windowEndLocal,
            windowRes.preferredTimeLocal,
            timezone
        );

        // 8. Idempotencja & Duplicate Guard (Dyrektywy 43, 44)
        const scheduleId = this.generateScheduleId({
            contentId: content.contentId,
            variantId: variant.variantId,
            platform,
            channelId,
            marketId,
            targetLocalDate,
            preferredTime: windowRes.preferredTimeLocal
        });

        if (this.schedulesStore.has(scheduleId)) {
            // Zwracamy istniejący rekord bez tworzenia duplikatów
            return this.schedulesStore.get(scheduleId);
        }

        // 9. Wykrywanie Kolizji (Collision Guard - Dyrektywa 45)
        const collision = this._detectCollision({
            platform,
            channelId,
            windowStartUtc: windowUtc.windowStartUtc,
            windowEndUtc: windowUtc.windowEndUtc
        });

        let status = collision ? 'COLLISION' : 'SIMULATED';

        // 10. Wykrywanie Zmęczenia Treścią (Content Fatigue Warning - Dyrektywy 46, 47)
        const fatigueWarning = this._detectContentFatigue({
            contentId: content.contentId,
            platform,
            channelId,
            suggestedAtUtc: windowUtc.suggestedAtUtc
        });

        const record = {
            scheduleId,
            contentId: content.contentId,
            variantId: variant.variantId,
            platform,
            channelId,
            marketId,
            locale: variant.language,
            timezone,
            suggestedLocalDate: windowUtc.suggestedLocalDate,
            suggestedLocalTime: windowUtc.suggestedLocalTime,
            suggestedAtUtc: windowUtc.suggestedAtUtc,
            windowStartUtc: windowUtc.windowStartUtc,
            windowEndUtc: windowUtc.windowEndUtc,
            schedulingBasis: windowRes.schedulingBasis,
            evidenceLevel: windowRes.evidenceLevel,
            evidence: windowRes.evidence,
            whyThisTime: windowRes.whyThisTime,
            rightsStatus: content.rightsStatus || 'ALLOWED',
            approvalStatus: variant.translationStatus || 'APPROVED',
            platformCapability: cap.schedulingCapability || 'noScheduling',
            status,
            ...(collision ? { collisionDetails: collision } : {}),
            ...(fatigueWarning ? { fatigueWarning } : {}),
            createdAt: new Date().toISOString(),
            schedulerVersion: this.schedulerVersion,
            ruleVersion: this.ruleVersion
        };

        this.schedulesStore.set(scheduleId, record);
        return record;
    }

    /**
     * Sprawdza kolizję slotu dla tej samej platformy i kanału (Dyrektywa 45)
     * @private
     */
    _detectCollision({ platform, channelId, windowStartUtc, windowEndUtc }) {
        const startMs = new Date(windowStartUtc).getTime();
        const endMs = new Date(windowEndUtc).getTime();

        for (const existing of this.schedulesStore.values()) {
            if (existing.platform === platform && existing.channelId === channelId && existing.status === 'SIMULATED') {
                const exStartMs = new Date(existing.windowStartUtc).getTime();
                const exEndMs = new Date(existing.windowEndUtc).getTime();

                // Sprawdź nachodzenie przedziałów
                if (startMs < exEndMs && endMs > exStartMs) {
                    return {
                        conflictingScheduleId: existing.scheduleId,
                        conflictingContentId: existing.contentId,
                        conflictingWindowStartUtc: existing.windowStartUtc,
                        conflictingWindowEndUtc: existing.windowEndUtc,
                        reason: `Nakładający się slot czasowy na platformie ${platform} (kanał ${channelId})`
                    };
                }
            }
        }
        return null;
    }

    /**
     * Wykrywa nadmierną częstotliwość propozycji tej samej treści (Dyrektywa 46)
     * @private
     */
    _detectContentFatigue({ contentId, platform, channelId, suggestedAtUtc }) {
        const targetMs = new Date(suggestedAtUtc).getTime();

        for (const existing of this.schedulesStore.values()) {
            if (existing.contentId === contentId && existing.platform === platform && existing.channelId === channelId) {
                const exMs = new Date(existing.suggestedAtUtc).getTime();
                const diffMs = Math.abs(targetMs - exMs);
                if (diffMs < this.fatigueWindowMs) {
                    return `CONTENT_FATIGUE_WARNING: Ta sama treść została już zaproponowana w oknie ${Math.round(this.fatigueWindowMs / 3600000)}h (odstęp: ${Math.round(diffMs / 3600000)}h)`;
                }
            }
        }
        return null;
    }

    /**
     * Pomocnicza metoda tworząca znormalizowany rekord symulacji
     * @private
     */
    _createRecord({
        content,
        variant,
        market,
        platform,
        channelId,
        targetLocalDate,
        timezone,
        localTime,
        utcIso,
        windowStartUtc,
        windowEndUtc,
        basis,
        evidenceLevel,
        evidence,
        whyThisTime,
        status,
        platformCapability
    }) {
        const scheduleId = this.generateScheduleId({
            contentId: content?.contentId || 'unknown',
            variantId: variant?.variantId || 'unknown',
            platform,
            channelId,
            marketId: market.marketId,
            targetLocalDate,
            preferredTime: localTime
        });

        const record = {
            scheduleId,
            contentId: content?.contentId || 'unknown',
            variantId: variant?.variantId || 'unknown',
            platform,
            channelId,
            marketId: market.marketId,
            locale: variant?.language || 'unknown',
            timezone,
            suggestedLocalDate: targetLocalDate,
            suggestedLocalTime: localTime,
            suggestedAtUtc: utcIso,
            windowStartUtc,
            windowEndUtc,
            schedulingBasis: basis,
            evidenceLevel,
            evidence,
            whyThisTime,
            rightsStatus: content?.rightsStatus || 'UNKNOWN',
            approvalStatus: variant?.translationStatus || 'UNKNOWN',
            platformCapability,
            status,
            createdAt: new Date().toISOString(),
            schedulerVersion: this.schedulerVersion,
            ruleVersion: this.ruleVersion
        };

        this.schedulesStore.set(scheduleId, record);
        return record;
    }

    /**
     * Zwraca bieżący stan zdrowia silnika Follow the Sun (Dyrektywa 59)
     * @returns {Object}
     */
    getHealthStatus() {
        if (isFollowTheSunKilled()) {
            return {
                status: 'OFF',
                followTheSunEnabled: false,
                simulationMode: true,
                message: 'Silnik wyłączony przez Kill Switch (FOLLOW_THE_SUN_OFF)'
            };
        }

        let totalSimulated = 0;
        let totalCollisions = 0;
        let totalBlocked = 0;
        const marketsCovered = new Set();

        for (const s of this.schedulesStore.values()) {
            if (s.status === 'SIMULATED') totalSimulated++;
            else if (s.status === 'COLLISION') totalCollisions++;
            else totalBlocked++;

            if (s.marketId) marketsCovered.add(s.marketId);
        }

        return {
            status: 'SHADOW_HEALTHY', // Nigdy nie ACTIVE_SCHEDULING (Dyrektywa 59)
            followTheSunEnabled: false, // Zawsze false w 6A
            simulationMode: true, // Zawsze true w 6A
            schedulerVersion: this.schedulerVersion,
            ruleVersion: this.ruleVersion,
            totalSimulated,
            totalCollisions,
            totalBlocked,
            marketsCovered: Array.from(marketsCovered),
            storeSize: this.schedulesStore.size
        };
    }

    /**
     * Pobiera wszystkie zarejestrowane symulacje
     * @returns {import('../cc-content-core/types.js').ShadowScheduleRecord[]}
     */
    getAllSchedules() {
        return Array.from(this.schedulesStore.values());
    }

    /**
     * Czyści magazyn symulacji (wyłącznie do celów testowych)
     */
    clearStore() {
        this.schedulesStore.clear();
    }
}
