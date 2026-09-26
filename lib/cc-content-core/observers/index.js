/**
 * ══════════════════════════════════════════════════════════════════════════
 * CC GLOBAL OBSERVER — OBSERVERS REGISTRY & RESOLVER (FAZA 4)
 * Standard Architektury: MASTER PLAN CC GLOBAL 2030 (FAZA 4)
 * Dyrektywa 68: Rejestr obserwatorów platformowych.
 * ══════════════════════════════════════════════════════════════════════════
 */

import { BaseObserver } from './base-observer.js';
import { NormalizationLayer } from './normalization-layer.js';
import { YouTubeObserver } from './youtube-observer.js';
import { LuminaObserver } from './lumina-observer.js';
import { WwwObserver } from './www-observer.js';
import { RadioObserver } from './radio-observer.js';
import { WhatsAppObserver } from './whatsapp-observer.js';
import { BitChuteObserver } from './bitchute-observer.js';
import { FacebookObserver } from './facebook-observer.js';

export {
    BaseObserver,
    NormalizationLayer,
    YouTubeObserver,
    LuminaObserver,
    WwwObserver,
    RadioObserver,
    WhatsAppObserver,
    BitChuteObserver,
    FacebookObserver
};

const OBSERVER_INSTANCES = new Map();

/**
 * Zwraca instancję obserwatora dla danej platformy
 * @param {import('../types.js').PlatformType} platform
 * @param {Object} [options]
 * @returns {BaseObserver}
 */
export function getObserverForPlatform(platform, options = {}) {
    if (options.fresh || !OBSERVER_INSTANCES.has(platform)) {
        let observer;
        switch (platform) {
            case 'YOUTUBE':
                observer = new YouTubeObserver(options);
                break;
            case 'LUMINA':
                observer = new LuminaObserver(options);
                break;
            case 'WWW':
                observer = new WwwObserver(options);
                break;
            case 'RADIO':
                observer = new RadioObserver(options);
                break;
            case 'WHATSAPP':
                observer = new WhatsAppObserver(options);
                break;
            case 'BITCHUTE':
                observer = new BitChuteObserver(options);
                break;
            case 'FACEBOOK':
                observer = new FacebookObserver();
                break;
            default:
                throw new Error(`Nieznana platforma dla Global Observer: ${platform}`);
        }
        if (!options.fresh) {
            OBSERVER_INSTANCES.set(platform, observer);
        }
        return observer;
    }
    return OBSERVER_INSTANCES.get(platform);
}
