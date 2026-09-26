/**
 * ══════════════════════════════════════════════════════════════════════════
 * CC GLOBAL DISTRIBUTION ENGINE — REGISTRY & KILL SWITCH
 * Standard Architektury: MASTER PLAN CC GLOBAL 2030 (FAZA 3)
 * ══════════════════════════════════════════════════════════════════════════
 */

/**
 * Rejestr możliwości technicznych platform (Platform Capability Registry)
 * @type {Record<string, import('./types.js').PlatformCapability>}
 */
export const PLATFORM_CAPABILITIES = {
    WWW: {
        platform: 'WWW',
        adapterVersion: '2026.3-web-preview',
        supportsText: true,
        supportsImage: true,
        supportsAudio: true,
        supportsVideo: true,
        supportsScheduling: true,
        supportsLocalization: true,
        supportsRemoteVerification: true,
        supportsAnalytics: true,
        publicationMode: 'API' // W 3A w trybie PREVIEW
    },
    LUMINA: {
        platform: 'LUMINA',
        adapterVersion: '2026.3-lumina-official',
        supportsText: true,
        supportsImage: true,
        supportsAudio: true,
        supportsVideo: false,
        supportsScheduling: false,
        supportsLocalization: true,
        supportsRemoteVerification: true,
        supportsAnalytics: true,
        publicationMode: 'API'
    },
    YOUTUBE: {
        platform: 'YOUTUBE',
        adapterVersion: '2026.3-youtube-official',
        supportsText: true, // Title, Description, Tags
        supportsImage: true, // Custom Thumbnail
        supportsAudio: false, // Wymaga kontenera wideo
        supportsVideo: true,
        supportsScheduling: true,
        supportsLocalization: true, // Zlokalizowane metadane / ścieżki
        supportsRemoteVerification: true, // videos.list status
        supportsAnalytics: true,
        publicationMode: 'API'
    },
    WHATSAPP: {
        platform: 'WHATSAPP',
        adapterVersion: '2026.3-whatsapp-bridge',
        supportsText: true,
        supportsImage: true,
        supportsAudio: true,
        supportsVideo: true,
        supportsScheduling: false,
        supportsLocalization: true,
        supportsRemoteVerification: false, // Dispatch ACK = SENT, nie VERIFIED
        supportsAnalytics: false,
        publicationMode: 'LEGACY'
    },
    BITCHUTE: {
        platform: 'BITCHUTE',
        adapterVersion: '2026.3-bitchute-manual',
        supportsText: true,
        supportsImage: true,
        supportsAudio: false,
        supportsVideo: true,
        supportsScheduling: false,
        supportsLocalization: false,
        supportsRemoteVerification: true, // Weryfikacja URL podanego przez operatora
        supportsAnalytics: false,
        publicationMode: 'MANUAL_ASSISTED'
    },
    RADIO: {
        platform: 'RADIO',
        adapterVersion: '2026.3-radio-prepare',
        supportsText: true, // RDS / Metadata
        supportsImage: false,
        supportsAudio: true,
        supportsVideo: false,
        supportsScheduling: true,
        supportsLocalization: false,
        supportsRemoteVerification: true,
        supportsAnalytics: true,
        publicationMode: 'API' // W 3A w trybie PREPARE ONLY
    },
    FACEBOOK: {
        platform: 'FACEBOOK',
        adapterVersion: '2026.3-facebook-stub',
        supportsText: true,
        supportsImage: true,
        supportsAudio: false,
        supportsVideo: true,
        supportsScheduling: false,
        supportsLocalization: false,
        supportsRemoteVerification: false,
        supportsAnalytics: false,
        publicationMode: 'DISABLED' // Puppet session legacy uznana za UNSTABLE
    }
};

/**
 * Rejestr Kanałów YouTube — Pilot Fazy 3A
 * Zgodnie z Pkt 15 i 16: Podłączamy dokładnie JEDEN kanał pilotażowy.
 * Zakaz masowej autoryzacji 50+ kanałów.
 */
export const YOUTUBE_CHANNEL_REGISTRY = [
    {
        channelId: 'UC_PILOT_CC_MAIN',
        channelName: 'Christian Culture — Główny Kanał Pilotażowy',
        language: 'pl',
        locale: 'pl-PL',
        region: 'PL',
        purpose: 'PILOT_E2E_VERIFICATION',
        active: true,
        oauthConnectionId: 'oauth_conn_pilot_main',
        oauthStatus: 'CONFIGURED_PENDING_FLOW',
        distributionEnabled: true,
        privacyDefault: 'PRIVATE', // Pkt 18: Pierwszy upload wyłącznie PRIVATE lub UNLISTED!
        lastVerifiedAt: null
    }
];

/**
 * Globalny Stan Wyłącznika Awaryjnego (Distribution Kill Switch)
 * Zgodnie z Pkt 45 i 46:
 * Domyślny stan po wdrożeniu Fazy 3A: GLOBAL AUTOPUBLISH = OFF.
 */
let currentKillSwitchState = {
    globalOff: false,
    automationOff: true, // Pkt 46: Publiczny autopublish ZABRONIONY w 3A
    platformOff: {
        WWW: false,
        LUMINA: false,
        YOUTUBE: false,
        WHATSAPP: false,
        BITCHUTE: false,
        RADIO: false,
        FACEBOOK: true
    },
    channelOff: {},
    updatedAt: new Date().toISOString(),
    updatedBy: 'SYSTEM_INIT_PHASE_3A',
    reason: 'FAZA 3A: Domyślny tryb bezpieczny (Global Autopublish = OFF)'
};

/**
 * Sprawdza, czy dystrybucja jest dozwolona przez Kill Switch
 * @param {string} platform - Kod platformy
 * @param {string} [channelId] - Identyfikator kanału
 * @param {boolean} [isAutomation=false] - Czy żądanie pochodzi z automatycznego workera
 * @returns {{ allowed: boolean, reason?: string }}
 */
export function isDistributionAllowed(platform, channelId, isAutomation = false) {
    if (currentKillSwitchState.globalOff) {
        return { allowed: false, reason: 'GLOBAL_KILL_SWITCH_ACTIVE: Całkowita blokada nowej dystrybucji CC' };
    }
    if (isAutomation && currentKillSwitchState.automationOff) {
        return { allowed: false, reason: 'AUTOMATION_OFF: Automatyczna publikacja jest wyłączona (wymagany tryb ręczny / manual review)' };
    }
    if (currentKillSwitchState.platformOff && currentKillSwitchState.platformOff[platform]) {
        return { allowed: false, reason: `PLATFORM_PAUSED: Dystrybucja dla platformy ${platform} została wstrzymana` };
    }
    if (channelId && currentKillSwitchState.channelOff && currentKillSwitchState.channelOff[channelId]) {
        return { allowed: false, reason: `CHANNEL_PAUSED: Kanał ${channelId} jest wyłączony z emisji` };
    }
    return { allowed: true };
}

/**
 * Aktualizuje stan Kill Switch
 * @param {Partial<typeof currentKillSwitchState>} newState
 * @param {string} operator
 * @param {string} reason
 */
export function setKillSwitchState(newState, operator, reason) {
    currentKillSwitchState = {
        ...currentKillSwitchState,
        ...newState,
        platformOff: {
            ...currentKillSwitchState.platformOff,
            ...(newState.platformOff || {})
        },
        channelOff: {
            ...currentKillSwitchState.channelOff,
            ...(newState.channelOff || {})
        },
        updatedAt: new Date().toISOString(),
        updatedBy: operator,
        reason
    };
    return currentKillSwitchState;
}

/**
 * Pobiera bieżący stan Kill Switch
 */
export function getKillSwitchState() {
    return { ...currentKillSwitchState };
}

/**
 * Pobiera możliwości platformy
 * @param {string} platform
 * @returns {import('./types.js').PlatformCapability|null}
 */
export function getPlatformCapability(platform) {
    return PLATFORM_CAPABILITIES[platform] || null;
}
