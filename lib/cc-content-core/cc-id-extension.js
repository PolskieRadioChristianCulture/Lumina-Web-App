/**
 * ══════════════════════════════════════════════════════════════════════════
 * CC ID EXTENSION — GLOBAL PROFILE SCHEMA & PREFERENCE RESOLVER
 * Master Plan CC Global 2030 (FAZA 1 — Specyfikacja & Backward Compatibility)
 * ══════════════════════════════════════════════════════════════════════════
 */

/**
 * @typedef {Object} CCIdExtensionFields
 * @property {'pl' | 'en' | 'es' | 'pt' | 'de' | 'fr'} [language] - Preferowany język interfejsu i treści
 * @property {string} [timezone] - Strefa czasowa IANA (np. "Europe/Warsaw", "America/New_York")
 * @property {string} [country] - Kod kraju ISO 3166-1 alpha-2 (np. "PL", "US", "BR")
 * @property {Object} [notificationPreferences]
 * @property {string} [notificationPreferences.quietHoursStart] - Początek ciszy nocnej (np. "22:00")
 * @property {string} [notificationPreferences.quietHoursEnd] - Koniec ciszy nocnej (np. "06:00")
 * @property {boolean} [notificationPreferences.dailyDevotion] - Zgoda na codzienne rozważania
 * @property {boolean} [notificationPreferences.prayer] - Zgoda na powiadomienia modlitewne
 * @property {boolean} [notificationPreferences.news] - Zgoda na wiadomości CC News
 */

export const SUPPORTED_LANGUAGES = ['pl', 'en', 'es', 'pt', 'de', 'fr'];
export const DEFAULT_LANGUAGE = 'pl';
export const DEFAULT_TIMEZONE = 'Europe/Warsaw';

/**
 * Rozwiązuje efektywny język i strefę czasową dla użytkownika
 * według ściśle ustalonej hierarchii priorytetów:
 * 1. MANUAL USER CHOICE (np. selektor języka w sesji)
 * 2. CC ID PREFERENCE (zapisany w profilu użytkownika)
 * 3. PREVIOUS CHOICE (localStorage)
 * 4. BROWSER LANGUAGE (navigator.language / Accept-Language)
 * 5. COUNTRY (Cloudflare CF-IPCountry)
 * 6. DEFAULT ('pl')
 * 
 * @param {Object} params
 * @param {string|null} [params.manualLanguage]
 * @param {Object|null} [params.profile]
 * @param {string|null} [params.previousChoice]
 * @param {string|null} [params.browserLanguage]
 * @param {string|null} [params.countryCode]
 * @returns {{ language: string, timezone: string, source: string }}
 */
export function resolveEffectivePreferences(params = {}) {
    const {
        manualLanguage,
        profile,
        previousChoice,
        browserLanguage,
        countryCode
    } = params;

    let selectedLang = null;
    let resolutionSource = 'DEFAULT';

    // 1. Wybór ręczny w UI
    if (manualLanguage && SUPPORTED_LANGUAGES.includes(manualLanguage.toLowerCase())) {
        selectedLang = manualLanguage.toLowerCase();
        resolutionSource = 'MANUAL_USER_CHOICE';
    }
    // 2. Preferencja zapisana w CC ID
    else if (profile?.language && SUPPORTED_LANGUAGES.includes(profile.language.toLowerCase())) {
        selectedLang = profile.language.toLowerCase();
        resolutionSource = 'CC_ID_PREFERENCE';
    }
    // 3. Poprzedni wybór w przeglądarce
    else if (previousChoice && SUPPORTED_LANGUAGES.includes(previousChoice.toLowerCase())) {
        selectedLang = previousChoice.toLowerCase();
        resolutionSource = 'PREVIOUS_CHOICE';
    }
    // 4. Język przeglądarki
    else if (browserLanguage) {
        const primary = browserLanguage.split('-')[0].toLowerCase();
        if (SUPPORTED_LANGUAGES.includes(primary)) {
            selectedLang = primary;
            resolutionSource = 'BROWSER_LANGUAGE';
        }
    }
    // 5. Geolokalizacja kraju
    else if (countryCode) {
        const c = countryCode.toUpperCase();
        if (c === 'PL') selectedLang = 'pl';
        else if (c === 'US' || c === 'GB' || c === 'CA' || c === 'AU') selectedLang = 'en';
        else if (c === 'BR' || c === 'PT') selectedLang = 'pt';
        else if (c === 'ES' || c === 'MX' || c === 'AR' || c === 'CO') selectedLang = 'es';
        else if (c === 'DE' || c === 'AT' || c === 'CH') selectedLang = 'de';
        else if (c === 'FR') selectedLang = 'fr';
        
        if (selectedLang) {
            resolutionSource = 'COUNTRY_GEO';
        }
    }

    if (!selectedLang) {
        selectedLang = DEFAULT_LANGUAGE;
        resolutionSource = 'DEFAULT_FALLBACK';
    }

    // Wyznaczenie strefy czasowej
    let resolvedTimezone = profile?.timezone || null;
    if (!resolvedTimezone) {
        try {
            resolvedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || DEFAULT_TIMEZONE;
        } catch {
            resolvedTimezone = DEFAULT_TIMEZONE;
        }
    }

    return {
        language: selectedLang,
        timezone: resolvedTimezone,
        source: resolutionSource
    };
}
