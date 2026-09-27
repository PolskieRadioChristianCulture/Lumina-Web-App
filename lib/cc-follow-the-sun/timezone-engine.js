/**
 * ══════════════════════════════════════════════════════════════════════════
 * CC GLOBAL FOLLOW THE SUN 24/7 — TIMEZONE ENGINE (FAZA 6A)
 * Standard Architektury: MASTER PLAN CC GLOBAL 2030 (FAZA 6A)
 * Dyrektywy 3-6, 66, 69, 71-75, 86:
 * Czas lokalny odbiorcy, standard IANA, odporność na DST,
 * przejścia przez północ, granice roku, lata przestępne.
 * ZERO płatnego zewnętrznego API — konwersja w runtime Node.js/Intl.
 * ══════════════════════════════════════════════════════════════════════════
 */

/**
 * Sprawdza, czy identyfikator strefy czasowej jest prawidłowym identyfikatorem IANA.
 * Odrzuca sztywne offsety (UTC+1, UTC-5), skróty (EST, Poland), próby injection (<script>, ../../)
 * @param {string} tz - Identyfikator strefy czasowej
 * @returns {boolean}
 */
export function isValidIanaTimezone(tz) {
    if (!tz || typeof tz !== 'string') return false;
    const trimmed = tz.trim();

    // Odrzuć niebezpieczne znaki, ścieżki i skrypty
    if (trimmed.includes('/') && (trimmed.includes('..') || trimmed.includes('\\') || trimmed.includes('<') || trimmed.includes('>'))) {
        return false;
    }

    // Odrzuć sztywne pseudo-strefy typu UTC+1, GMT-5, EST, PST, Poland
    if (/^(UTC|GMT)[+-]\d+/i.test(trimmed)) return false;
    const forbiddenAliases = new Set(['EST', 'PST', 'CST', 'MST', 'EDT', 'PDT', 'CDT', 'MDT', 'POLAND']);
    if (forbiddenAliases.has(trimmed.toUpperCase())) return false;

    // Musi zawierać co najmniej jeden slash (np. 'Europe/Warsaw', 'America/New_York') lub być canonical 'UTC'
    if (trimmed.toUpperCase() !== 'UTC' && !trimmed.includes('/')) {
        return false;
    }

    try {
        Intl.DateTimeFormat(undefined, { timeZone: trimmed });
        return true;
    } catch {
        return false;
    }
}

/**
 * Waliduje format daty YYYY-MM-DD
 * @param {string} dateStr
 * @returns {boolean}
 */
export function validateDateString(dateStr) {
    if (!dateStr || typeof dateStr !== 'string') return false;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;

    const [yearStr, monthStr, dayStr] = dateStr.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const day = parseInt(dayStr, 10);

    if (isNaN(year) || isNaN(month) || isNaN(day)) return false;
    if (year < 2000 || year > 2100) return false;
    if (month < 1 || month > 12) return false;

    const daysInMonth = [31, (isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    return day >= 1 && day <= daysInMonth[month - 1];
}

/**
 * Sprawdza, czy rok jest przestępny (Dyrektywa 75)
 * @param {number} year
 * @returns {boolean}
 */
export function isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

/**
 * Waliduje format czasu HH:mm lub HH:mm:ss
 * @param {string} timeStr
 * @returns {boolean}
 */
export function validateTimeString(timeStr) {
    if (!timeStr || typeof timeStr !== 'string') return false;
    if (!/^\d{2}:\d{2}(:\d{2})?$/.test(timeStr)) return false;

    const parts = timeStr.split(':');
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    const seconds = parts.length > 2 ? parseInt(parts[2], 10) : 0;

    if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) return false;
    return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59 && seconds >= 0 && seconds <= 59;
}

/**
 * Pobiera zaufany czas systemowy backendu (Dyrektywa 71)
 * @returns {Date}
 */
export function getTrustedSystemTime() {
    return new Date();
}

/**
 * Pomocnicza funkcja formatująca Date do części składowych w zadanej strefie IANA
 * @param {Date} date
 * @param {string} ianaTimezone
 * @returns {{ year: number, month: number, day: number, hour: number, minute: number, second: number }}
 */
function getDatePartsInTz(date, ianaTimezone) {
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: ianaTimezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });

    const parts = formatter.formatToParts(date);
    const map = {};
    for (const p of parts) {
        if (p.type !== 'literal') {
            map[p.type] = parseInt(p.value, 10);
        }
    }
    // W Intl dla hour12: false godzina 24 może czasami wystąpić jako 24; znormalizuj do 0 jeśli dotyczy
    if (map.hour === 24) map.hour = 0;

    return {
        year: map.year,
        month: map.month,
        day: map.day,
        hour: map.hour,
        minute: map.minute,
        second: map.second
    };
}

/**
 * Konwertuje lokalną datę i czas w strefie IANA do formatu ISO 8601 UTC.
 * Obsługuje DST, w tym:
 * - Nonexistent local time (Spring forward gap): przesuwa deterministycznie do najbliższego ważnego czasu (jump time).
 * - Repeated local time (Fall back overlap): wybiera wcześniejsze (deterministyczne) wystąpienie, zapobiegając duplikatom.
 * 
 * @param {string} localDateStr - Format YYYY-MM-DD
 * @param {string} localTimeStr - Format HH:mm lub HH:mm:ss
 * @param {string} ianaTimezone - Prawidłowy identyfikator IANA
 * @returns {{ utcIso: string, adjustedLocalTime?: string, wasNonexistentGap?: boolean, wasRepeatedOverlap?: boolean }}
 */
export function localToUtc(localDateStr, localTimeStr, ianaTimezone) {
    if (!validateDateString(localDateStr)) {
        throw new Error(`INVALID_DATE_FORMAT: Nieprawidłowa data '${localDateStr}' (oczekiwano YYYY-MM-DD)`);
    }
    if (!validateTimeString(localTimeStr)) {
        throw new Error(`INVALID_TIME_FORMAT: Nieprawidłowy czas '${localTimeStr}' (oczekiwano HH:mm)`);
    }
    if (!isValidIanaTimezone(ianaTimezone)) {
        throw new Error(`INVALID_IANA_TIMEZONE: Nieprawidłowa strefa IANA '${ianaTimezone}'`);
    }

    const [year, month, day] = localDateStr.split('-').map(Number);
    const timeParts = localTimeStr.split(':').map(Number);
    const hour = timeParts[0];
    const minute = timeParts[1];
    const second = timeParts.length > 2 ? timeParts[2] : 0;

    // Docelowy punkt odniesienia (wirtualny timestamp UTC reprezentujący pożądany czas lokalny)
    const originalTargetMs = Date.UTC(year, month - 1, day, hour, minute, second);
    let guessUtcMs = originalTargetMs;

    let converged = false;
    for (let i = 0; i < 4; i++) {
        const p = getDatePartsInTz(new Date(guessUtcMs), ianaTimezone);
        const localMs = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
        const diffMs = originalTargetMs - localMs;
        if (diffMs === 0) {
            converged = true;
            break;
        }
        guessUtcMs += diffMs;
    }

    let wasNonexistentGap = false;
    let wasRepeatedOverlap = false;
    let adjustedLocalTime;

    if (!converged) {
        // Godzina nie istnieje lokalnie (Spring Forward gap, np. 02:30 w Europie/Warszawie pod koniec marca)
        wasNonexistentGap = true;
        // Wyrównaj do czasu po przeskoku (pierwszy poprawny czas lokalny)
        const p = getDatePartsInTz(new Date(guessUtcMs), ianaTimezone);
        const adjHour = String(p.hour).padStart(2, '0');
        const adjMin = String(p.minute).padStart(2, '0');
        adjustedLocalTime = `${adjHour}:${adjMin}`;
    } else {
        // Sprawdź, czy to godzina powtórzona (Fall Back overlap, np. 02:30 pod koniec października)
        // Jeśli 1h wcześniej w UTC czas lokalny był identyczny, oznacza to nakładanie strefy
        const oneHourEarlierMs = guessUtcMs - 3600000;
        const pEarlier = getDatePartsInTz(new Date(oneHourEarlierMs), ianaTimezone);
        if (pEarlier.year === year && pEarlier.month === month && pEarlier.day === day &&
            pEarlier.hour === hour && pEarlier.minute === minute) {
            wasRepeatedOverlap = true;
            // Deterministycznie wybieramy wcześniejsze wystąpienie
            guessUtcMs = oneHourEarlierMs;
        }
    }

    return {
        utcIso: new Date(guessUtcMs).toISOString(),
        ...(wasNonexistentGap ? { wasNonexistentGap: true, adjustedLocalTime } : {}),
        ...(wasRepeatedOverlap ? { wasRepeatedOverlap: true } : {})
    };
}

/**
 * Konwertuje timestamp UTC na czas lokalny w strefie IANA
 * @param {string|Date} utcDateOrIso
 * @param {string} ianaTimezone
 * @returns {{ localDate: string, localTime: string, localTimeFull: string, timezone: string, offsetMinutes: number }}
 */
export function utcToLocal(utcDateOrIso, ianaTimezone) {
    if (!isValidIanaTimezone(ianaTimezone)) {
        throw new Error(`INVALID_IANA_TIMEZONE: '${ianaTimezone}'`);
    }

    const date = typeof utcDateOrIso === 'string' ? new Date(utcDateOrIso) : utcDateOrIso;
    if (isNaN(date.getTime())) {
        throw new Error('INVALID_UTC_DATE: Nieprawidłowa data UTC');
    }

    const parts = getDatePartsInTz(date, ianaTimezone);
    const localDate = `${String(parts.year).padStart(4, '0')}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`;
    const localTime = `${String(parts.hour).padStart(2, '0')}:${String(parts.minute).padStart(2, '0')}`;
    const localTimeFull = `${localTime}:${String(parts.second).padStart(2, '0')}`;

    // Oblicz offset w minutach względem UTC
    const localAsUtcMs = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
    const offsetMinutes = Math.round((localAsUtcMs - date.getTime()) / 60000);

    return {
        localDate,
        localTime,
        localTimeFull,
        timezone: ianaTimezone,
        offsetMinutes
    };
}

/**
 * Wylicza okno emisyjne w UTC uwzględniając strefę IANA, czas preferowany oraz przejście przez północ.
 * 
 * @param {string} targetDateStr - Data lokalna bazowa (YYYY-MM-DD)
 * @param {string} windowStartLocal - Czas rozpoczęcia lokalny (HH:mm) np. "22:00"
 * @param {string} windowEndLocal - Czas zakończenia lokalny (HH:mm) np. "01:00"
 * @param {string} preferredTimeLocal - Czas preferowany lokalny (HH:mm) np. "23:00"
 * @param {string} ianaTimezone - Strefa czasowa IANA
 * @returns {{
 *   suggestedLocalDate: string,
 *   suggestedLocalTime: string,
 *   suggestedAtUtc: string,
 *   windowStartUtc: string,
 *   windowEndUtc: string,
 *   isMidnightCrossing: boolean
 * }}
 */
export function calculateWindowUtc(targetDateStr, windowStartLocal, windowEndLocal, preferredTimeLocal, ianaTimezone) {
    if (!validateDateString(targetDateStr)) {
        throw new Error(`INVALID_DATE_FORMAT: '${targetDateStr}'`);
    }
    if (!validateTimeString(windowStartLocal) || !validateTimeString(windowEndLocal) || !validateTimeString(preferredTimeLocal)) {
        throw new Error('INVALID_TIME_FORMAT: Godziny okna muszą mieć format HH:mm');
    }
    if (!isValidIanaTimezone(ianaTimezone)) {
        throw new Error(`INVALID_IANA_TIMEZONE: '${ianaTimezone}'`);
    }

    const startMinutes = timeToMinutes(windowStartLocal);
    const endMinutes = timeToMinutes(windowEndLocal);
    const prefMinutes = timeToMinutes(preferredTimeLocal);

    const isMidnightCrossing = endMinutes < startMinutes;

    // Oblicz datę rozpoczęcia i zakończenia lokalną
    const startDateStr = targetDateStr;
    let endDateStr = targetDateStr;
    let prefDateStr = targetDateStr;

    if (isMidnightCrossing) {
        endDateStr = addDaysToDateString(targetDateStr, 1);
        // Jeśli czas preferowany przypada po północy (mniejszy niż startMinutes)
        if (prefMinutes < startMinutes) {
            prefDateStr = endDateStr;
        }
    }

    const windowStartRes = localToUtc(startDateStr, windowStartLocal, ianaTimezone);
    const windowEndRes = localToUtc(endDateStr, windowEndLocal, ianaTimezone);
    const prefRes = localToUtc(prefDateStr, preferredTimeLocal, ianaTimezone);

    return {
        suggestedLocalDate: prefDateStr,
        suggestedLocalTime: prefRes.adjustedLocalTime || preferredTimeLocal,
        suggestedAtUtc: prefRes.utcIso,
        windowStartUtc: windowStartRes.utcIso,
        windowEndUtc: windowEndRes.utcIso,
        isMidnightCrossing
    };
}

/**
 * Pomocnicza funkcja zamieniająca czas HH:mm na minuty od północy
 * @param {string} timeStr
 * @returns {number}
 */
function timeToMinutes(timeStr) {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
}

/**
 * Dodaje określoną liczbę dni do daty YYYY-MM-DD z poszanowaniem granic miesięcy i lat (w tym lat przestępnych)
 * @param {string} dateStr
 * @param {number} daysToAdd
 * @returns {string}
 */
export function addDaysToDateString(dateStr, daysToAdd) {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(Date.UTC(y, m - 1, d));
    date.setUTCDate(date.getUTCDate() + daysToAdd);
    const resY = String(date.getUTCFullYear()).padStart(4, '0');
    const resM = String(date.getUTCMonth() + 1).padStart(2, '0');
    const resD = String(date.getUTCDate()).padStart(2, '0');
    return `${resY}-${resM}-${resD}`;
}
