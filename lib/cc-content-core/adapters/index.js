/**
 * ══════════════════════════════════════════════════════════════════════════
 * CC GLOBAL DISTRIBUTION ENGINE — ADAPTER REGISTRY & RESOLVER (FAZA 3A)
 * Standard Architektury: MASTER PLAN CC GLOBAL 2030 (FAZA 3)
 * ══════════════════════════════════════════════════════════════════════════
 */

import { DistributionAdapter } from './base-adapter.js';
import { YouTubeDistributionAdapter, YouTubeQuotaGuard } from './youtube-adapter.js';
import { LuminaDistributionAdapter } from './lumina-adapter.js';
import { WwwDistributionAdapter } from './www-adapter.js';
import { WhatsAppDistributionAdapter } from './whatsapp-adapter.js';
import { BitChuteDistributionAdapter } from './bitchute-adapter.js';
import { RadioDistributionAdapter } from './radio-adapter.js';
import { FacebookDistributionAdapter } from './facebook-adapter.js';

export {
    DistributionAdapter,
    YouTubeDistributionAdapter,
    YouTubeQuotaGuard,
    LuminaDistributionAdapter,
    WwwDistributionAdapter,
    WhatsAppDistributionAdapter,
    BitChuteDistributionAdapter,
    RadioDistributionAdapter,
    FacebookDistributionAdapter
};

const ADAPTER_INSTANCES = new Map();

/**
 * Zwraca instancję adaptera dla danej platformy
 * @param {import('../types.js').PlatformType} platform
 * @param {Object} [options]
 * @returns {DistributionAdapter}
 */
export function getAdapterForPlatform(platform, options = {}) {
    if (options.fresh || !ADAPTER_INSTANCES.has(platform)) {
        let adapter;
        switch (platform) {
            case 'YOUTUBE':
                adapter = new YouTubeDistributionAdapter(options);
                break;
            case 'LUMINA':
                adapter = new LuminaDistributionAdapter(options);
                break;
            case 'WWW':
                adapter = new WwwDistributionAdapter(options);
                break;
            case 'WHATSAPP':
                adapter = new WhatsAppDistributionAdapter(options);
                break;
            case 'BITCHUTE':
                adapter = new BitChuteDistributionAdapter(options);
                break;
            case 'RADIO':
                adapter = new RadioDistributionAdapter(options);
                break;
            case 'FACEBOOK':
                adapter = new FacebookDistributionAdapter();
                break;
            default:
                throw new Error(`Nieznana lub nieobsługiwana platforma dystrybucji: ${platform}`);
        }
        if (!options.fresh) {
            ADAPTER_INSTANCES.set(platform, adapter);
        }
        return adapter;
    }
    return ADAPTER_INSTANCES.get(platform);
}
