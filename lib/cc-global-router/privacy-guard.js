/**
 * ══════════════════════════════════════════════════════════════════════════
 * CC GLOBAL ROUTER — PRIVACY & SECURITY GUARD (FAZA 5)
 * Standard Architektury: MASTER PLAN CC GLOBAL 2030 (FAZA 5)
 * Dyrektywy 10, 30, 31, 32, 65, 66, 67, 68:
 * - Ochrona przed Path Traversal, Open Redirect, XSS, Header Spoofing
 * - Bezwzględna eliminacja surowych IP (DROP IP) i danych PII
 * - Zgrubna telemetria coarse geo (countryCode, regionCode, provider)
 * ══════════════════════════════════════════════════════════════════════════
 */

export const CC_ROUTER_PRIVACY_GUARD_VERSION = 'v1';

/**
 * Ścisła allowlista dokładnych hostów Christian Culture (Exact Host Allowlist)
 * Dyrektywa 1, 2, 3: Bezwzględny zakaz szerokich masek typu *.pages.dev czy *.web.app
 */
export const EXACT_ALLOWED_HOSTS = Object.freeze(new Set([
    'polskieradio.cc',
    'www.polskieradio.cc',
    'cclite.pl',
    'www.cclite.pl',
    'christian-culture.web.app',
    'lumina-cc.web.app',
    'polskieradio.pages.dev'
]));

/**
 * Klucze PII bezwzględnie usuwane z jakiegokolwiek kontekstu routingu
 */
const PII_KEYS = new Set([
    'ip',
    'ipAddress',
    'clientIp',
    'email',
    'phone',
    'telephone',
    'password',
    'token',
    'accessToken',
    'refreshToken',
    'secret',
    'apiKey',
    'privateMessage',
    'holosNote',
    'prayerPrivateText'
]);

/**
 * Bezpiecznie przetwarza dane geolokalizacyjne na brzegu sieci (Edge Coarse Geo)
 * Wyciąga wyłącznie countryCode, regionCode i provider, niszcząc surowe IP.
 * @param {Object} rawGeo
 * @returns {{ countryCode: string|null, regionCode: string|null, provider: string }}
 */
export function extractCoarseGeo(rawGeo = {}) {
    if (!rawGeo || typeof rawGeo !== 'object') {
        return { countryCode: null, regionCode: null, provider: 'NONE' };
    }

    // Bezpieczne pobranie kodu kraju (ISO 3166-1 alpha-2)
    let country = rawGeo.country || rawGeo.countryCode || rawGeo.cfCountry || null;
    if (typeof country === 'string') {
        country = country.trim().toUpperCase();
        // Walidacja formatu ISO 2 znaki
        if (!/^[A-Z]{2}$/.test(country)) {
            country = null;
        }
    } else {
        country = null;
    }

    // Zgrubny kod regionu (np. "Mazowieckie", "SP", "CA")
    let region = rawGeo.region || rawGeo.regionCode || null;
    if (typeof region === 'string') {
        region = region.trim().replace(/[^a-zA-Z0-9_\-\s]/g, '').slice(0, 30);
    } else {
        region = null;
    }

    const provider = rawGeo.provider || (rawGeo.cfCountry ? 'CLOUDFLARE_EDGE' : 'EDGE_HEADER');

    return {
        countryCode: country,
        regionCode: region,
        provider: typeof provider === 'string' ? provider.slice(0, 30) : 'EDGE'
    };
}

/**
 * Sanityzuje kontekst zapytania routingu, usuwając PII i surowe IP
 * @param {Object} context
 * @returns {Object}
 */
export function sanitizeRoutingContext(context = {}) {
    if (!context || typeof context !== 'object') return {};

    const clean = {};
    for (const [key, value] of Object.entries(context)) {
        if (PII_KEYS.has(key)) {
            continue; // Pomijamy PII
        }
        if (typeof value === 'string') {
            // Zabezpieczenie przed XSS i kontrolnymi znakami
            clean[key] = value.replace(/[<>'"\x00-\x1F\x7F]/g, '').trim();
        } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            clean[key] = sanitizeRoutingContext(value);
        } else {
            clean[key] = value;
        }
    }

    return clean;
}

/**
 * Sprawdza czy dany ciąg locale jest bezpieczny (brak Path Traversal / XSS)
 * @param {string} rawLocale
 * @returns {boolean}
 */
export function isSafeLocaleString(rawLocale) {
    if (!rawLocale || typeof rawLocale !== 'string') return false;

    // Wykrywanie prób Path Traversal
    if (rawLocale.includes('..') || rawLocale.includes('/') || rawLocale.includes('\\')) {
        return false;
    }

    // Wykrywanie prób URL / XSS
    if (/%[0-9a-fA-F]{2}/.test(rawLocale)) return false; // URL encoded
    if (/[<>'"`;()&$]/.test(rawLocale)) return false;
    if (rawLocale.toLowerCase().startsWith('javascript:')) return false;
    if (rawLocale.toLowerCase().startsWith('data:')) return false;

    // Dozwolone wyłącznie małe/duże litery i myślnik (np. "pt-br", "en", "pl")
    return /^[a-zA-Z]{2,3}(-[a-zA-Z0-9]{2,4})?$/.test(rawLocale.trim());
}

/**
 * Sprawdza czy URL docelowy jest bezpieczny (Open Redirect Guard)
 * Dyrektywy 1, 2, 3, 4: Exact Host Allowlist, Malicious URL Suite
 * @param {string} targetUrl
 * @returns {boolean}
 */
export function isSafeRedirectUrl(targetUrl) {
    if (!targetUrl || typeof targetUrl !== 'string') return false;
    const trimmed = targetUrl.trim();

    // 1. Odrzucenie schematów niebezpiecznych
    if (/^(javascript|data|file|blob|vbscript):/i.test(trimmed)) {
        return false;
    }

    // 2. Odrzucenie prób Path Traversal (zarówno czystych jak i pojedynczo lub wielokrotnie kodowanych)
    let decoded = trimmed;
    for (let i = 0; i < 3; i++) {
        try {
            const next = decodeURIComponent(decoded);
            if (next === decoded) break;
            decoded = next;
        } catch {
            return false; // Podejrzane/nieprawidłowe kodowanie URL
        }
    }
    if (decoded.includes('..') || trimmed.includes('..') || /(%2e|%252e)/i.test(trimmed)) {
        return false;
    }

    // 3. Odrzucenie znaków kontrolnych i backslash
    if (/[\0\r\n\t\\]/.test(trimmed)) {
        return false;
    }

    // 4. Odrzucenie adresów zaczynających się od // (protocol-relative do obcej domeny)
    if (trimmed.startsWith('//')) {
        return false;
    }

    // 5. Ścieżki relatywne zaczynające się od pojedynczego ukośnika /
    if (trimmed.startsWith('/')) {
        return true;
    }

    // 6. Pełny adres URL - sprawdzamy dokładnie protokół i hostname
    try {
        const parsed = new URL(trimmed);
        if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
            return false;
        }

        // Odrzucenie adresów z autoryzacją użytkownika (np. user@evil.com)
        if (parsed.username || parsed.password) {
            return false;
        }

        const host = parsed.hostname.toLowerCase();

        // Dokładne dopasowanie z allowlisty CC
        if (EXACT_ALLOWED_HOSTS.has(host)) {
            return true;
        }

        // Wyłącznie kontrolowane subdomeny Cloudflare Pages projektu Christian Culture
        // np. 6ff6c553.polskieradio.pages.dev lub staging.polskieradio.pages.dev
        if (/^[a-z0-9-]+\.polskieradio\.pages\.dev$/.test(host)) {
            return true;
        }

        // Wszystkie inne domeny (w tym attacker.pages.dev, evil.web.app) są bezwzględnie blokowane
        return false;
    } catch {
        return false;
    }
}

