/**
 * ══════════════════════════════════════════════════════════════════════════
 * CC GLOBAL ROUTER — LOCALE REGISTRY (FAZA 5)
 * Standard Architektury: MASTER PLAN CC GLOBAL 2030 (FAZA 5)
 * Dyrektywy 13-16, 48, 49: Rejestr Locale, Wave 1, Wave 2 (Standby), RTL Ready, Stacje Radiowe
 * ══════════════════════════════════════════════════════════════════════════
 */

export const CC_LOCALE_REGISTRY_VERSION = 'v1';

/**
 * @typedef {'ltr' | 'rtl'} TextDirection
 * @typedef {'WAVE_1' | 'WAVE_2' | 'FUTURE'} DeploymentWave
 * 
 * @typedef {Object} RadioStationMapping
 * @property {string} stationId - Identyfikator stacji radiowej
 * @property {string} streamUrl - Adres URL strumienia audio
 * @property {string} name - Nazwa stacji
 * @property {'LIVE_RADIO' | 'DEVOTIONAL_STREAM' | 'AMBIENT'} contentType - Typ strumienia
 * @property {number} priority - Priorytet rekomendacji
 * 
 * @typedef {Object} CCLocaleDefinition
 * @property {string} locale - Kanoniczny kod locale (np. "pl", "en", "es", "pt-br")
 * @property {string} language - Kod języka ISO 639-1 (np. "pl", "en", "es", "pt")
 * @property {string} displayName - Nazwa wyświetlana po polsku
 * @property {string} nativeName - Nazwa natywna (używana w switcherze)
 * @property {TextDirection} direction - Kierunek tekstu (ltr / rtl)
 * @property {boolean} enabled - Czy locale jest aktywne w routingu produkcyjnym
 * @property {string} fallbackLocale - Domyślne locale zastępcze
 * @property {DeploymentWave} wave - Fala wdrożeniowa
 * @property {RadioStationMapping[]} radioStations - Powiązane stacje radiowe
 */

/**
 * Kanoniczny Rejestr Locale Christian Culture
 * @type {Record<string, CCLocaleDefinition>}
 */
export const CC_LOCALE_REGISTRY = Object.freeze({
    // ═══════════════════════════════════════════════════════════════════════
    // FALA 1: AKTYWNE W FAZIE 5 (WAVE 1)
    // ═══════════════════════════════════════════════════════════════════════
    'pl': {
        locale: 'pl',
        language: 'pl',
        displayName: 'Polski',
        nativeName: 'Polski',
        direction: 'ltr',
        enabled: true,
        fallbackLocale: 'en',
        wave: 'WAVE_1',
        radioStations: [
            {
                stationId: 'cc_radio_main_pl',
                streamUrl: 'https://stream.polskieradio.cc/live.mp3',
                name: 'Polskie Radio Christian Culture',
                contentType: 'LIVE_RADIO',
                priority: 1
            }
        ]
    },
    'en': {
        locale: 'en',
        language: 'en',
        displayName: 'Angielski',
        nativeName: 'English',
        direction: 'ltr',
        enabled: true,
        fallbackLocale: 'pl',
        wave: 'WAVE_1',
        radioStations: [
            {
                stationId: 'cc_radio_global_en',
                streamUrl: 'https://stream.polskieradio.cc/global-en.mp3',
                name: 'Christian Culture Global (English)',
                contentType: 'LIVE_RADIO',
                priority: 1
            }
        ]
    },
    'es': {
        locale: 'es',
        language: 'es',
        displayName: 'Hiszpański',
        nativeName: 'Español',
        direction: 'ltr',
        enabled: true,
        fallbackLocale: 'en',
        wave: 'WAVE_1',
        radioStations: [
            {
                stationId: 'cc_radio_es',
                streamUrl: 'https://stream.polskieradio.cc/radio-es.mp3',
                name: 'Cultura Cristiana Radio (Español)',
                contentType: 'LIVE_RADIO',
                priority: 1
            }
        ]
    },
    'pt-br': {
        locale: 'pt-br',
        language: 'pt',
        displayName: 'Portugalski (Brazylia)',
        nativeName: 'Português (Brasil)',
        direction: 'ltr',
        enabled: true,
        fallbackLocale: 'en',
        wave: 'WAVE_1',
        radioStations: [
            {
                stationId: 'cc_radio_pt_br',
                streamUrl: 'https://stream.polskieradio.cc/radio-pt-br.mp3',
                name: 'Cultura Cristã Brasil',
                contentType: 'LIVE_RADIO',
                priority: 1
            }
        ]
    },

    // ═══════════════════════════════════════════════════════════════════════
    // FALA 2: PRZYGOTOWANIE ARCHITEKTONICZNE (STANDBY / DISABLED)
    // ═══════════════════════════════════════════════════════════════════════
    'de': {
        locale: 'de',
        language: 'de',
        displayName: 'Niemiecki',
        nativeName: 'Deutsch',
        direction: 'ltr',
        enabled: false, // Faza 5: STANDBY
        fallbackLocale: 'en',
        wave: 'WAVE_2',
        radioStations: []
    },
    'fr': {
        locale: 'fr',
        language: 'fr',
        displayName: 'Francuski',
        nativeName: 'Français',
        direction: 'ltr',
        enabled: false, // Faza 5: STANDBY
        fallbackLocale: 'en',
        wave: 'WAVE_2',
        radioStations: []
    },
    'it': {
        locale: 'it',
        language: 'it',
        displayName: 'Włoski',
        nativeName: 'Italiano',
        direction: 'ltr',
        enabled: false, // Faza 5: STANDBY
        fallbackLocale: 'en',
        wave: 'WAVE_2',
        radioStations: []
    },
    'uk': {
        locale: 'uk',
        language: 'uk',
        displayName: 'Ukraiński',
        nativeName: 'Українська',
        direction: 'ltr',
        enabled: false, // Faza 5: STANDBY
        fallbackLocale: 'pl',
        wave: 'WAVE_2',
        radioStations: []
    }
});

/**
 * Normalizuje ciąg locale do kanonicznego formatu CC (małe litery, myślnik)
 * @param {string} raw
 * @returns {string}
 */
export function normalizeLocaleCode(raw) {
    if (!raw || typeof raw !== 'string') return '';
    const clean = raw.trim().toLowerCase().replace(/_/g, '-');
    
    // Specjalne mapowania aliasów i wariantów regionalnych
    if (clean === 'pl-pl' || clean === 'pol' || clean === 'plk') return 'pl';
    if (clean === 'en-us' || clean === 'en-gb' || clean === 'en-ca' || clean === 'en-au' || clean === 'eng') return 'en';
    if (clean === 'es-es' || clean === 'es-mx' || clean === 'es-ar' || clean === 'es-co' || clean === 'spa') return 'es';
    if (clean === 'pt-br' || clean === 'pt' || clean === 'pt-pt' || clean === 'por') return 'pt-br';
    if (clean === 'de-de' || clean === 'de-at' || clean === 'de-ch' || clean === 'deu' || clean === 'ger') return 'de';
    if (clean === 'fr-fr' || clean === 'fr-ca' || clean === 'fr-be' || clean === 'fra' || clean === 'fre') return 'fr';
    if (clean === 'it-it' || clean === 'ita') return 'it';
    if (clean === 'uk-ua' || clean === 'ukr') return 'uk';

    // Jeśli podano kod 2-literowy lub z myślnikiem
    return clean;
}

/**
 * Sprawdza czy locale jest zarejestrowane w rejestrze
 * @param {string} code
 * @param {boolean} [onlyEnabled=true]
 * @returns {boolean}
 */
export function isValidLocale(code, onlyEnabled = true) {
    const norm = normalizeLocaleCode(code);
    const loc = CC_LOCALE_REGISTRY[norm];
    if (!loc) return false;
    if (onlyEnabled && !loc.enabled) return false;
    return true;
}

/**
 * Pobiera definicję locale
 * @param {string} code
 * @returns {CCLocaleDefinition|null}
 */
export function getLocale(code) {
    const norm = normalizeLocaleCode(code);
    return CC_LOCALE_REGISTRY[norm] || null;
}

/**
 * Zwraca listę wszystkich aktywnych locale (Wave 1)
 * @returns {CCLocaleDefinition[]}
 */
export function getEnabledLocales() {
    return Object.values(CC_LOCALE_REGISTRY).filter(l => l.enabled);
}

/**
 * Zwraca listę locale Wave 1
 * @returns {CCLocaleDefinition[]}
 */
export function getWave1Locales() {
    return Object.values(CC_LOCALE_REGISTRY).filter(l => l.wave === 'WAVE_1');
}

/**
 * Zwraca listę locale Wave 2
 * @returns {CCLocaleDefinition[]}
 */
export function getWave2Locales() {
    return Object.values(CC_LOCALE_REGISTRY).filter(l => l.wave === 'WAVE_2');
}
