/**
 * ══════════════════════════════════════════════════════════════════════════
 * CC BIBLICAL QUOTE GUARD & BIBLE SOURCE REGISTRY
 * Master Plan CC Global 2030 (Faza 2: CC Language & AI Content Factory)
 * ══════════════════════════════════════════════════════════════════════════
 * Żelazna ochrona Pisma Świętego w całym ekosystemie:
 * 1. AI NIE JEST tłumaczem Biblii — nie wolno mu udawać oficjalnego przekładu.
 * 2. Detekcja segmentów: DIRECT_BIBLE_QUOTE, BIBLE_REFERENCE, PRAYER, CTA itp.
 * 3. Bible Source Registry: Rejestr autoryzowanych przekładów z prawami autorskimi.
 * 4. Niezmiennik referencji: Księga, rozdział i werset nie mogą ulec zmianie!
 * ══════════════════════════════════════════════════════════════════════════
 */

import {
    CC_BIBLE_SOURCES_COLLECTION
} from './types.js';

/**
 * Kanoniczny Rejestr Źródeł Biblijnych i Praw Autorskich CC (Bible Rights & Source Registry)
 * @type {Record<string, import('./types.js').BibleSourceEntry[]>}
 */
export const CANONICAL_BIBLE_SOURCES = {
    pl: [
        {
            language: 'pl',
            locale: 'pl-PL',
            translationCode: 'UBG',
            translationName: 'Uwspółcześniona Biblia Gdańska',
            copyrightHolder: 'Fundacja Wrota Nadziei',
            copyrightStatus: 'RESTRICTED',
            publicDomain: false,
            quotationAllowed: true,
            redistributionAllowed: false,
            digitalUseAllowed: true,
            commercialUseAllowed: false,
            audioUseAllowed: true,
            textDisplayAllowed: true,
            ttsAllowed: true,
            audioDistributionAllowed: true,
            maxVersesAllowed: 500,
            attributionRequired: true,
            requiredAttribution: 'Pismo Święte: Uwspółcześniona Biblia Gdańska (UBG) © Fundacja Wrota Nadziei',
            licenseName: 'UBG Quotation License',
            licenseUrl: 'https://wrotanadziei.org',
            officialSourceUrl: 'https://wrotanadziei.org',
            verifiedAt: '2026-09-26T13:00:00Z',
            verifiedBy: 'Legal & Theology Architecture Team',
            rightsConfidence: 'HIGH',
            status: 'RESTRICTED',
            approved: true
        },
        {
            language: 'pl',
            locale: 'pl-PL',
            translationCode: 'BG',
            translationName: 'Biblia Gdańska (1632)',
            copyrightHolder: 'Public Domain',
            copyrightStatus: 'PUBLIC_DOMAIN',
            publicDomain: true,
            quotationAllowed: true,
            redistributionAllowed: true,
            digitalUseAllowed: true,
            commercialUseAllowed: true,
            audioUseAllowed: true,
            textDisplayAllowed: true,
            ttsAllowed: true,
            audioDistributionAllowed: true,
            maxVersesAllowed: null,
            attributionRequired: false,
            requiredAttribution: 'Biblia Gdańska (1632) — Domena Publiczna',
            licenseName: 'Public Domain',
            licenseUrl: null,
            officialSourceUrl: null,
            verifiedAt: '2026-09-26T13:00:00Z',
            verifiedBy: 'Legal & Theology Architecture Team',
            rightsConfidence: 'HIGH',
            status: 'PUBLIC_DOMAIN',
            approved: true
        },
        {
            language: 'pl',
            locale: 'pl-PL',
            translationCode: 'BW',
            translationName: 'Biblia Warszawska',
            copyrightHolder: 'Towarzystwo Biblijne w Polsce',
            copyrightStatus: 'PERMISSION_REQUIRED',
            publicDomain: false,
            quotationAllowed: true,
            redistributionAllowed: false,
            digitalUseAllowed: true,
            commercialUseAllowed: false,
            audioUseAllowed: false,
            textDisplayAllowed: true,
            ttsAllowed: false,
            audioDistributionAllowed: false,
            maxVersesAllowed: 50,
            attributionRequired: true,
            requiredAttribution: 'Biblia Warszawska © Towarzystwo Biblijne w Polsce',
            licenseName: 'Permission Required for Mass Audio / Full Reproduction',
            licenseUrl: 'https://tb.org.pl',
            officialSourceUrl: 'https://tb.org.pl',
            verifiedAt: '2026-09-26T13:00:00Z',
            verifiedBy: 'Legal & Theology Architecture Team',
            rightsConfidence: 'HIGH',
            status: 'PERMISSION_REQUIRED',
            approved: true
        }
    ],
    en: [
        {
            language: 'en',
            locale: 'en-US',
            translationCode: 'BSB',
            translationName: 'Berean Standard Bible',
            copyrightHolder: 'Bible Hub / Berean.Bible',
            copyrightStatus: 'PUBLIC_DOMAIN',
            publicDomain: true,
            quotationAllowed: true,
            redistributionAllowed: true,
            digitalUseAllowed: true,
            commercialUseAllowed: true,
            audioUseAllowed: true,
            textDisplayAllowed: true,
            ttsAllowed: true,
            audioDistributionAllowed: true,
            maxVersesAllowed: null,
            attributionRequired: true,
            requiredAttribution: 'The Holy Bible, Berean Standard Bible, BSB is produced in cooperation with Bible Hub, Discovery Bible, OpenBible.com, and the Berean Bible Translation Committee. Dedicated to the Public Domain (CC0).',
            licenseName: 'CC0 / Public Domain Dedication',
            licenseUrl: 'https://berean.bible/terms.htm',
            officialSourceUrl: 'https://berean.bible',
            verifiedAt: '2026-09-26T13:00:00Z',
            verifiedBy: 'Legal & Theology Architecture Team',
            rightsConfidence: 'HIGH',
            status: 'PUBLIC_DOMAIN',
            approved: true
        },
        {
            language: 'en',
            locale: 'en-US',
            translationCode: 'KJV',
            translationName: 'King James Version',
            copyrightHolder: 'Public Domain (Global) / Crown Copyright (UK)',
            copyrightStatus: 'PUBLIC_DOMAIN',
            publicDomain: true,
            quotationAllowed: true,
            redistributionAllowed: true,
            digitalUseAllowed: true,
            commercialUseAllowed: true,
            audioUseAllowed: true,
            textDisplayAllowed: true,
            ttsAllowed: true,
            audioDistributionAllowed: true,
            maxVersesAllowed: null,
            attributionRequired: false,
            requiredAttribution: 'King James Version (KJV) — Public Domain',
            licenseName: 'Public Domain (ex-UK)',
            licenseUrl: null,
            officialSourceUrl: null,
            verifiedAt: '2026-09-26T13:00:00Z',
            verifiedBy: 'Legal & Theology Architecture Team',
            rightsConfidence: 'HIGH',
            status: 'PUBLIC_DOMAIN',
            approved: true
        }
    ],
    es: [
        {
            language: 'es',
            locale: 'es-ES',
            translationCode: 'RVA2015',
            translationName: 'Reina Valera Actualizada',
            copyrightHolder: 'Editorial Mundo Hispano',
            copyrightStatus: 'RESTRICTED',
            publicDomain: false,
            quotationAllowed: true,
            redistributionAllowed: false,
            digitalUseAllowed: true,
            commercialUseAllowed: false,
            audioUseAllowed: true,
            textDisplayAllowed: true,
            ttsAllowed: true,
            audioDistributionAllowed: true,
            maxVersesAllowed: 500,
            attributionRequired: true,
            requiredAttribution: 'Reina Valera Actualizada (RVA-2015) © 2015 Editorial Mundo Hispano',
            licenseName: 'Editorial Mundo Hispano Quotation Policy',
            licenseUrl: 'https://editorialmundohispano.org',
            officialSourceUrl: 'https://editorialmundohispano.org',
            verifiedAt: '2026-09-26T13:00:00Z',
            verifiedBy: 'Legal & Theology Architecture Team',
            rightsConfidence: 'HIGH',
            status: 'RESTRICTED',
            approved: true
        },
        {
            language: 'es',
            locale: 'es-ES',
            translationCode: 'RVR1960',
            translationName: 'Reina-Valera 1960',
            copyrightHolder: 'Sociedades Bíblicas Unidas (SBU)',
            copyrightStatus: 'PERMISSION_REQUIRED',
            publicDomain: false,
            quotationAllowed: true,
            redistributionAllowed: false,
            digitalUseAllowed: true,
            commercialUseAllowed: false,
            audioUseAllowed: false,
            textDisplayAllowed: true,
            ttsAllowed: false,
            audioDistributionAllowed: false,
            maxVersesAllowed: 500,
            attributionRequired: true,
            requiredAttribution: 'Reina-Valera 1960 ® © Sociedades Bíblicas Unidas, 1960. Renovado © Sociedades Bíblicas Unidas, 1988.',
            licenseName: 'SBU Restricted Quotation License',
            licenseUrl: 'https://unitedbiblesocieties.org',
            officialSourceUrl: 'https://unitedbiblesocieties.org',
            verifiedAt: '2026-09-26T13:00:00Z',
            verifiedBy: 'Legal & Theology Architecture Team',
            rightsConfidence: 'HIGH',
            status: 'PERMISSION_REQUIRED',
            approved: true
        }
    ],
    'pt-BR': [
        {
            language: 'pt-BR',
            locale: 'pt-BR',
            translationCode: 'ARC',
            translationName: 'Almeida Revista e Corrigida',
            copyrightHolder: 'Sociedade Bíblica do Brasil (SBB)',
            copyrightStatus: 'RESTRICTED',
            publicDomain: false,
            quotationAllowed: true,
            redistributionAllowed: false,
            digitalUseAllowed: true,
            commercialUseAllowed: false,
            audioUseAllowed: false,
            textDisplayAllowed: true,
            ttsAllowed: false,
            audioDistributionAllowed: false,
            maxVersesAllowed: 500,
            attributionRequired: true,
            requiredAttribution: 'Texto bíblico: Almeida Revista e Corrigida (ARC) © Sociedade Bíblica do Brasil (SBB)',
            licenseName: 'SBB Quotation Policy',
            licenseUrl: 'https://sbb.org.br',
            officialSourceUrl: 'https://sbb.org.br',
            verifiedAt: '2026-09-26T13:00:00Z',
            verifiedBy: 'Legal & Theology Architecture Team',
            rightsConfidence: 'HIGH',
            status: 'RESTRICTED',
            approved: true
        },
        {
            language: 'pt-BR',
            locale: 'pt-BR',
            translationCode: 'ARA',
            translationName: 'Almeida Revista e Atualizada',
            copyrightHolder: 'Sociedade Bíblica do Brasil (SBB)',
            copyrightStatus: 'RESTRICTED',
            publicDomain: false,
            quotationAllowed: true,
            redistributionAllowed: false,
            digitalUseAllowed: true,
            commercialUseAllowed: false,
            audioUseAllowed: false,
            textDisplayAllowed: true,
            ttsAllowed: false,
            audioDistributionAllowed: false,
            maxVersesAllowed: 500,
            attributionRequired: true,
            requiredAttribution: 'Texto bíblico: Almeida Revista e Atualizada (ARA) © Sociedade Bíblica do Brasil (SBB)',
            licenseName: 'SBB Quotation Policy',
            licenseUrl: 'https://sbb.org.br',
            officialSourceUrl: 'https://sbb.org.br',
            verifiedAt: '2026-09-26T13:00:00Z',
            verifiedBy: 'Legal & Theology Architecture Team',
            rightsConfidence: 'HIGH',
            status: 'RESTRICTED',
            approved: true
        }
    ]
};

/**
 * Tabela mapowania nazw ksiąg biblijnych między językami
 */
export const BIBLE_BOOK_MAP = {
    // Księgi Starego Testamentu
    'Iz': { pl: 'Księga Izajasza', en: 'Isaiah', es: 'Isaías', 'pt-BR': 'Isaías' },
    'Izajasz': { pl: 'Księga Izajasza', en: 'Isaiah', es: 'Isaías', 'pt-BR': 'Isaías' },
    'Wj': { pl: 'Księga Wyjścia', en: 'Exodus', es: 'Éxodo', 'pt-BR': 'Êxodo' },
    'Rdz': { pl: 'Księga Rodzaju', en: 'Genesis', es: 'Génesis', 'pt-BR': 'Gênesis' },
    'Prz': { pl: 'Księga Przysłów', en: 'Proverbs', es: 'Proverbios', 'pt-BR': 'Provérbios' },
    'Ps': { pl: 'Księga Psalmów', en: 'Psalms', es: 'Salmos', 'pt-BR': 'Salmos' },
    // Księgi Nowego Testamentu
    'Mt': { pl: 'Ewangelia Mateusza', en: 'Matthew', es: 'Mateo', 'pt-BR': 'Mateus' },
    'Mateusza': { pl: 'Ewangelia Mateusza', en: 'Matthew', es: 'Mateo', 'pt-BR': 'Mateus' },
    'Mk': { pl: 'Ewangelia Marka', en: 'Mark', es: 'Marcos', 'pt-BR': 'Marcos' },
    'Łk': { pl: 'Ewangelia Łukasza', en: 'Luke', es: 'Lucas', 'pt-BR': 'Lucas' },
    'J': { pl: 'Ewangelia Jana', en: 'John', es: 'Juan', 'pt-BR': 'João' },
    'Rz': { pl: 'List do Rzymian', en: 'Romans', es: 'Romanos', 'pt-BR': 'Romanos' },
    'Ef': { pl: 'List do Efezjan', en: 'Ephesians', es: 'Efesios', 'pt-BR': 'Efésios' },
    'Obj': { pl: 'Objawienie Jana', en: 'Revelation', es: 'Apocalipsis', 'pt-BR': 'Apocalipse' }
};

/**
 * Wykrywa segmenty treści w tekście Master
 * @param {string} text
 * @returns {Array<{ type: import('./types.js').ContentSegmentType, text: string, startIndex: number, endIndex: number, meta?: any }>}
 */
export function detectContentSegments(text) {
    if (!text) return [];
    const segments = [];
    const lines = text.split('\n');
    let currentIndex = 0;

    // Wzorce regex dla referencji biblijnych (np. "Iz 30:15", "Łukasza 9,62", "Mt 8,1-3", "Izajasza 30:15")
    const refRegex = /\b(Iz(?:ajasza)?|Wj|Rdz|Prz|Ps|Mt|Mateusza|Mk|Łk|Łukasza|J|Jana|Rz|Ef|Obj|1Tes)\s+(\d+)[\:,](\d+)(?:-(\d+))?/gi;

    for (const line of lines) {
        const trimmed = line.trim();
        const start = currentIndex;
        const end = currentIndex + line.length;

        if (trimmed.startsWith('#')) {
            segments.push({ type: 'TITLE', text: trimmed, startIndex: start, endIndex: end });
        } else if (trimmed.toLowerCase().includes('modlitwa bojowa:') || trimmed.toLowerCase().includes('prayer:')) {
            segments.push({ type: 'PRAYER', text: trimmed, startIndex: start, endIndex: end });
        } else if (trimmed.toLowerCase().includes('baza i wzrost:') || trimmed.toLowerCase().includes('podaj dalej') || trimmed.includes('http')) {
            segments.push({ type: 'CTA', text: trimmed, startIndex: start, endIndex: end });
        } else if (trimmed.startsWith('>') || trimmed.startsWith('„') || trimmed.startsWith('"')) {
            // Bezpośredni cytat (często biblijny)
            segments.push({ type: 'DIRECT_BIBLE_QUOTE', text: trimmed, startIndex: start, endIndex: end });
        } else {
            // Sprawdź czy linia zawiera referencję biblijną
            const match = refRegex.exec(trimmed);
            if (match) {
                segments.push({
                    type: 'BIBLE_REFERENCE',
                    text: trimmed,
                    startIndex: start,
                    endIndex: end,
                    meta: {
                        book: match[1],
                        chapter: parseInt(match[2], 10),
                        verseStart: parseInt(match[3], 10),
                        verseEnd: match[4] ? parseInt(match[4], 10) : null
                    }
                });
            } else {
                segments.push({ type: 'NORMAL_TEXT', text: trimmed, startIndex: start, endIndex: end });
            }
        }

        currentIndex = end + 1; // +1 dla \n
    }

    return segments;
}

/**
 * Wyciąga wszystkie numeryczne referencje biblijne z tekstu (księga, rozdział, werset)
 * @param {string} text
 * @returns {Array<{ raw: string, book: string, chapter: number, verseStart: number, verseEnd: number|null }>}
 */
export function extractBibleReferences(text) {
    if (!text) return [];
    const references = [];
    const refRegex = /\b(Iz(?:ajasza)?|Wj|Rdz|Prz|Ps|Mt|Mateusza|Mk|Łk|Łukasza|J|Jana|Rz|Ef|Obj|1Tes|Isaiah|Exodus|Genesis|Proverbs|Matthew|Mark|Luke|John|Romans|Ephesians|Revelation|Isaías|Éxodo|Mateo|Lucas|Juan|Apocalipsis)\s+(\d+)[\:,](\d+)(?:-(\d+))?/gi;

    let match;
    while ((match = refRegex.exec(text)) !== null) {
        references.push({
            raw: match[0],
            book: match[1],
            chapter: parseInt(match[2], 10),
            verseStart: parseInt(match[3], 10),
            verseEnd: match[4] ? parseInt(match[4], 10) : null
        });
    }
    return references;
}

/**
 * Tłumaczy/rozwiązuje nazwę referencji biblijnej na język docelowy
 * np. "Iz 30:15" (pl) -> "Isaiah 30:15" (en), "Isaías 30:15" (es)
 * @param {string} sourceRef
 * @param {string} targetLanguage
 * @returns {string}
 */
export function resolveTargetBibleReference(sourceRef, targetLanguage) {
    const refs = extractBibleReferences(sourceRef);
    if (refs.length === 0) return sourceRef;

    const r = refs[0];
    let normalizedBook = r.book;
    for (const [key, mapping] of Object.entries(BIBLE_BOOK_MAP)) {
        if (key.toLowerCase() === r.book.toLowerCase() || mapping.pl.toLowerCase().includes(r.book.toLowerCase())) {
            normalizedBook = mapping[targetLanguage] || mapping.en || key;
            break;
        }
    }

    const verseStr = r.verseEnd ? `${r.verseStart}-${r.verseEnd}` : `${r.verseStart}`;
    return `${normalizedBook} ${r.chapter}:${verseStr}`;
}

/**
 * Pobiera zarejestrowane źródła biblijne dla języka
 * @param {string} language
 * @returns {import('./types.js').BibleSourceEntry[]}
 */
export function getBibleSourcesForLanguage(language) {
    return CANONICAL_BIBLE_SOURCES[language] || [];
}

/**
 * Wyszukuje profil praw autorskich dla wskazanego przekładu i języka
 * @param {string} translationCode
 * @param {string} [language]
 * @returns {import('./types.js').BibleSourceEntry|null}
 */
export function findBibleSource(translationCode, language = null) {
    const code = translationCode.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const langs = language ? [language] : Object.keys(CANONICAL_BIBLE_SOURCES);

    for (const l of langs) {
        const sources = CANONICAL_BIBLE_SOURCES[l] || [];
        const match = sources.find(s => s.translationCode.toUpperCase().replace(/[^A-Z0-9]/g, '') === code);
        if (match) return match;
    }
    return null;
}

/**
 * Weryfikuje prawa do użycia przekładu (BIBLE RIGHTS GUARD)
 * Zasada UNKNOWN = BLOCK: Brak zweryfikowanego statusu lub status UNKNOWN bezwzględnie blokuje użycie tekstu!
 * @param {string} translationCode
 * @param {string} language
 * @param {'QUOTE' | 'TTS' | 'AUDIO' | 'REDISTRIBUTION'} [purpose]
 * @returns {{ allowed: boolean, flag?: import('./types.js').ValidationFlag, reason?: string, entry?: import('./types.js').BibleSourceEntry }}
 */
export function verifyTranslationRights(translationCode, language, purpose = 'QUOTE') {
    const entry = findBibleSource(translationCode, language);

    if (!entry || entry.status === 'UNKNOWN') {
        return {
            allowed: false,
            flag: 'RIGHTS_UNKNOWN',
            reason: `Przekład ${translationCode} (${language}) nie posiada zweryfikowanego profilu praw (status UNKNOWN). Automatyczne cytowanie zablokowane.`
        };
    }

    if (purpose === 'QUOTE' && !entry.quotationAllowed) {
        return {
            allowed: false,
            flag: 'BIBLE_RIGHTS_REVIEW_REQUIRED',
            reason: `Przekład ${entry.translationCode} nie zezwala na automatyczne cytowanie bez osobnej zgody właściciela praw (${entry.copyrightHolder}).`,
            entry
        };
    }

    if (purpose === 'TTS' && !entry.ttsAllowed) {
        return {
            allowed: false,
            flag: 'BIBLE_RIGHTS_REVIEW_REQUIRED',
            reason: `Przekład ${entry.translationCode} nie zezwala na syntezę lektorską TTS bez dedykowanej licencji (${entry.copyrightHolder}).`,
            entry
        };
    }

    if (purpose === 'AUDIO' && !entry.audioDistributionAllowed) {
        return {
            allowed: false,
            flag: 'BIBLE_RIGHTS_REVIEW_REQUIRED',
            reason: `Przekład ${entry.translationCode} zabrania masowej redystrybucji audio/radiowej (${entry.copyrightHolder}).`,
            entry
        };
    }

    return {
        allowed: true,
        entry
    };
}

/**
 * Kanoniczne teksty wersetów źródłowych (zweryfikowane)
 */
export const CANONICAL_VERSE_REPOSITORY = {
    'Iz_30_15': {
        UBG: 'Gdyż tak mówi Pan BÓG, Święty Izraela: W nawróceniu i spokoju będzie wasze zbawienie; w ciszy i zaufaniu będzie wasza siła; lecz wy nie chcieliście.',
        BG: 'Albowiem tak mówi panujący Pan, Święty Izraelski: Nawrócicież się, a usokoicie, zbawieni będziecie; w cichości a w nadziei będzie moc wasza; aleście nie chcieli.',
        BSB: 'For thus said the Lord GOD, the Holy One of Israel: "In repentance and rest is your salvation; in quietness and trust is your strength." But you were unwilling.',
        KJV: 'For thus saith the Lord GOD, the Holy One of Israel; In returning and rest shall ye be saved; in quietness and in confidence shall be your strength: and ye would not.',
        RVA2015: 'Porque así ha dicho el Señor DIOS, el Santo de Israel: «En arrepentimiento y en reposo serán salvos; en la quietud y en la confianza estará su fortaleza». Pero ustedes no quisieron.',
        ARC: 'Porque assim diz o Senhor JEOVÁ, o Santo de Israel: Voltando e descansando, sereis salvos; no sossego e na confiança, estaria a vossa força, mas não quisestes.'
    }
};

/**
 * Bezpieczne pobranie kanonicznego wersetu z gwarancją praw i provenance
 * Rygor: Jeśli wersetu brak w repozytorium — NIE POZWALAJ AI GENEROWAĆ Z PAMIĘCI (BIBLE_SOURCE_MISSING)!
 * Rygor: Jeśli prawa UNKNOWN lub brak zgody — ZACHOWAJ TYLKO REFERENCJĘ (BIBLE_RIGHTS_REVIEW_REQUIRED)!
 * @param {Object} params
 * @param {string} params.book - Nazwa księgi (np. "Iz", "Isaiah")
 * @param {number} params.chapter - Rozdział
 * @param {number} params.verseStart - Werset
 * @param {number|null} [params.verseEnd]
 * @param {string} params.translationCode - Kod przekładu (np. "BSB", "RVA2015", "ARC")
 * @param {string} params.language - Język docelowy
 * @param {'QUOTE' | 'TTS' | 'AUDIO'} [params.purpose]
 * @returns {{ success: boolean, text: string|null, referenceOnly?: string, provenance?: import('./types.js').BibleQuoteProvenance, flag?: import('./types.js').ValidationFlag, error?: string, attribution?: string }}
 */
export function getCanonicalVerse(params) {
    const {
        book,
        chapter,
        verseStart,
        verseEnd = null,
        translationCode,
        language,
        purpose = 'QUOTE'
    } = params;

    const normCode = translationCode.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const rights = verifyTranslationRights(normCode, language, purpose);

    // 1. ZASADA UNKNOWN = BLOCK
    if (!rights.allowed) {
        const targetRef = resolveTargetBibleReference(`${book} ${chapter}:${verseStart}${verseEnd ? '-' + verseEnd : ''}`, language);
        return {
            success: false,
            text: null,
            referenceOnly: targetRef,
            flag: rights.flag || 'BIBLE_RIGHTS_REVIEW_REQUIRED',
            error: rights.reason
        };
    }

    // 2. KANONICZNE ŹRÓDŁO — NORMALIZACJA KLUCZA
    let bookKey = book.substring(0, 2);
    if (book.toLowerCase().startsWith('iz') || book.toLowerCase().startsWith('isa')) bookKey = 'Iz';
    const repoKey = `${bookKey}_${chapter}_${verseStart}`;

    const verseCollection = CANONICAL_VERSE_REPOSITORY[repoKey];
    if (!verseCollection || !verseCollection[normCode]) {
        // Rygor: Zakaz halucynacji brakującego wersetu!
        return {
            success: false,
            text: null,
            flag: 'BIBLE_SOURCE_MISSING',
            error: `Brak tekstu wersetu ${book} ${chapter}:${verseStart} w zweryfikowanym repozytorium ${normCode}. AI nie może uzupełniać Pisma Świętego z pamięci!`
        };
    }

    const verseText = verseCollection[normCode];
    const provenance = {
        translation: normCode,
        book,
        chapter,
        verseStart,
        verseEnd,
        sourceProvider: 'CANONICAL_LOCAL_DB',
        sourceRecord: `${normCode}_${repoKey}`,
        rightsStatus: rights.entry.status,
        retrievedAt: new Date().toISOString()
    };

    return {
        success: true,
        text: verseText,
        provenance,
        attribution: rights.entry.requiredAttribution
    };
}
