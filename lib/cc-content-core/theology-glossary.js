/**
 * ══════════════════════════════════════════════════════════════════════════
 * CC THEOLOGY GLOSSARY — KANONICZNY SŁOWNIK POJĘĆ I TERMINOLOGII CC
 * Master Plan CC Global 2030 (Faza 2: CC Language & AI Content Factory)
 * ══════════════════════════════════════════════════════════════════════════
 * Gwarantuje jednolitość doktrynalną, teologiczną i frazeologiczną
 * we wszystkich językach emisji (PL -> EN, ES, PT-BR).
 * 
 * Zasada: APPROVED THEOLOGY GLOSSARY > TRANSLATION MEMORY > AI MODEL
 * ══════════════════════════════════════════════════════════════════════════
 */

import {
    CC_THEOLOGY_GLOSSARY_COLLECTION,
    CC_SCHEMA_VERSION
} from './types.js';

export const GLOSSARY_VERSION = '2026.1';

/**
 * Podstawowy zestaw kanonicznych pojęć teologicznych Christian Culture
 */
export const CANONICAL_SEED_TERMS = [
    {
        termId: 'term_sabbath',
        concept: 'Sabbath',
        sourceLanguage: 'pl',
        sourceTerm: 'Szabat',
        translations: {
            en: {
                preferred: 'Sabbath',
                forbidden: ['Sunday rest', 'Lord\'s day as Sunday', 'Jewish holiday only'],
                alternatives: ['Holy Sabbath', 'Sabbath day']
            },
            es: {
                preferred: 'Sábado bíblico',
                forbidden: ['Domingo de descanso'],
                alternatives: ['Santo Sábado', 'Día de reposo']
            },
            'pt-BR': {
                preferred: 'Sábado bíblico',
                forbidden: ['Domingo de descanso'],
                alternatives: ['Santo Sábado', 'Dia de descanso']
            }
        },
        definition: 'Siódmy dzień tygodnia, pamiątka stworzenia i odpocznienia w Bogu (Wj 20:8-11).',
        biblicalReferences: ['Wj 20:8-11', 'Iz 58:13-14', 'Mk 2:27-28'],
        status: 'APPROVED',
        createdBy: 'Dowództwo CC',
        approvedBy: 'Cezary Rogowski'
    },
    {
        termId: 'term_salvation_by_grace',
        concept: 'Salvation by Grace',
        sourceLanguage: 'pl',
        sourceTerm: 'Zbawienie z łaski',
        translations: {
            en: {
                preferred: 'Salvation by grace',
                forbidden: ['Salvation by works', 'Earned salvation'],
                alternatives: ['Salvation through grace alone', 'Grace of God']
            },
            es: {
                preferred: 'Salvación por gracia',
                forbidden: ['Salvación por obras'],
                alternatives: ['Salvación mediante la gracia']
            },
            'pt-BR': {
                preferred: 'Salvação pela graça',
                forbidden: ['Salvação por obras'],
                alternatives: ['Salvação mediante a graça']
            }
        },
        definition: 'Dar darmo dany przez wiarę w Jezusa Chrystusa, nie z uczynków (Ef 2:8-9).',
        biblicalReferences: ['Ef 2:8-9', 'Rz 3:24'],
        status: 'APPROVED',
        createdBy: 'Dowództwo CC',
        approvedBy: 'Cezary Rogowski'
    },
    {
        termId: 'term_second_coming',
        concept: 'Second Coming',
        sourceLanguage: 'pl',
        sourceTerm: 'Powtórne Przyjście',
        translations: {
            en: {
                preferred: 'Second Coming',
                forbidden: ['Secret rapture', 'Metaphorical arrival'],
                alternatives: ['Second Advent', 'Return of Christ']
            },
            es: {
                preferred: 'Segunda Venida',
                forbidden: ['Rapto secreto'],
                alternatives: ['Advenimiento de Cristo', 'Regreso de Jesús']
            },
            'pt-BR': {
                preferred: 'Segunda Vinda',
                forbidden: ['Arrebatamento secreto'],
                alternatives: ['Retorno de Cristo', 'Segundo Advento']
            }
        },
        definition: 'Widzialne, chwalebne i dosłowne przyjście Jezusa Chrystusa na obłokach nieba (Obj 1:7).',
        biblicalReferences: ['Obj 1:7', '1Tes 4:16-17', 'Mt 24:30'],
        status: 'APPROVED',
        createdBy: 'Dowództwo CC',
        approvedBy: 'Cezary Rogowski'
    },
    {
        termId: 'term_law_of_god',
        concept: 'Law of God',
        sourceLanguage: 'pl',
        sourceTerm: 'Prawo Boże',
        translations: {
            en: {
                preferred: 'Law of God',
                forbidden: ['Abolished moral law'],
                alternatives: ['God\'s commandments', 'Ten Commandments']
            },
            es: {
                preferred: 'Ley de Dios',
                forbidden: ['Ley abolida'],
                alternatives: ['Mandamientos de Dios', 'Decálogo']
            },
            'pt-BR': {
                preferred: 'Lei de Deus',
                forbidden: ['Lei abolida'],
                alternatives: ['Mandamentos de Deus', 'Dez Mandamentos']
            }
        },
        definition: 'Wieczny wyraz Bożego charakteru i miłości, ucieleśniony w Dekalogu (Wj 20:1-17, J 14:15).',
        biblicalReferences: ['Wj 20:1-17', 'J 14:15', 'Rz 7:12'],
        status: 'APPROVED',
        createdBy: 'Dowództwo CC',
        approvedBy: 'Cezary Rogowski'
    },
    {
        termId: 'term_series_words_have_power',
        concept: 'Words Have Power Series',
        sourceLanguage: 'pl',
        sourceTerm: 'Słowa Mają Moc',
        translations: {
            en: {
                preferred: 'Words Have Power',
                forbidden: ['Words are strong', 'Powerful words'],
                alternatives: ['Words Have Power Series']
            },
            es: {
                preferred: 'Las Palabras Tienen Poder',
                forbidden: ['Palabras poderosas'],
                alternatives: ['Serie Las Palabras Tienen Poder']
            },
            'pt-BR': {
                preferred: 'As Palavras Têm Poder',
                forbidden: ['Palavras poderosas'],
                alternatives: ['Série As Palavras Têm Poder']
            }
        },
        definition: 'Oficjalna nazwa wrzesniowego cyklu formacji duchowej Christian Culture 2026.',
        biblicalReferences: ['Prz 18:21', 'Iz 30:15'],
        status: 'APPROVED',
        createdBy: 'Dowództwo CC',
        approvedBy: 'Cezary Rogowski'
    },
    {
        termId: 'term_brand_christian_culture',
        concept: 'Christian Culture Brand',
        sourceLanguage: 'pl',
        sourceTerm: 'Christian Culture',
        translations: {
            en: {
                preferred: 'Christian Culture',
                forbidden: ['Christian Culture Movement', 'CC Church'],
                alternatives: ['Christian Culture Ecosystem']
            },
            es: {
                preferred: 'Christian Culture',
                forbidden: ['Cultura Cristiana Organización'],
                alternatives: ['Ecosistema Christian Culture']
            },
            'pt-BR': {
                preferred: 'Christian Culture',
                forbidden: ['Cultura Cristã Organização'],
                alternatives: ['Ecossistema Christian Culture']
            }
        },
        definition: 'Globalna nazwa ekosystemu misyjnego i radiowo-multimedialnego.',
        biblicalReferences: ['Mt 28:19-20'],
        status: 'APPROVED',
        createdBy: 'Dowództwo CC',
        approvedBy: 'Cezary Rogowski'
    }
];

// Pamięć podręczna w procesie dla minimalizacji odczytów Firestore
let cachedApprovedTerms = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 60000; // 60 sekund

/**
 * Pobiera zatwierdzone terminy glosariusza teologicznego
 * @param {import('firebase-admin/firestore').Firestore} [db]
 * @param {Object} [options]
 * @param {boolean} [options.bypassCache=false]
 * @returns {Promise<import('./types.js').TheologyTerm[]>}
 */
export async function getTheologyGlossary(db, options = {}) {
    const now = Date.now();
    if (!options.bypassCache && cachedApprovedTerms && (now - cacheTimestamp < CACHE_TTL_MS)) {
        return cachedApprovedTerms;
    }

    if (!db) {
        // Fallback do pamięci wbudowanej (standalone / offline)
        cachedApprovedTerms = CANONICAL_SEED_TERMS.filter(t => t.status === 'APPROVED');
        cacheTimestamp = now;
        return cachedApprovedTerms;
    }

    try {
        const snap = await db.collection(CC_THEOLOGY_GLOSSARY_COLLECTION)
            .where('status', '==', 'APPROVED')
            .get();

        if (snap.empty) {
            // Jeśli kolekcja jest pusta, automatycznie załaduj kanoniczny seed
            await seedCanonicalGlossary(db);
            cachedApprovedTerms = CANONICAL_SEED_TERMS.filter(t => t.status === 'APPROVED');
        } else {
            cachedApprovedTerms = snap.docs.map(d => d.data());
        }

        cacheTimestamp = now;
        return cachedApprovedTerms;
    } catch (err) {
        console.warn('[THEOLOGY_GLOSSARY] Błąd odczytu z Firestore, używam pamięci wbudowanej:', err.message);
        cachedApprovedTerms = CANONICAL_SEED_TERMS.filter(t => t.status === 'APPROVED');
        return cachedApprovedTerms;
    }
}

/**
 * Automatycznie zasiewa kanoniczne terminy w Firestore
 * @param {import('firebase-admin/firestore').Firestore} db
 */
export async function seedCanonicalGlossary(db) {
    const batch = db.batch();
    const now = new Date().toISOString();

    for (const term of CANONICAL_SEED_TERMS) {
        const ref = db.collection(CC_THEOLOGY_GLOSSARY_COLLECTION).doc(term.termId);
        batch.set(ref, {
            ...term,
            createdAt: now,
            updatedAt: now,
            schemaVersion: CC_SCHEMA_VERSION
        }, { merge: true });
    }

    await batch.commit();
    console.log(`[THEOLOGY_GLOSSARY] Zasiano ${CANONICAL_SEED_TERMS.length} kanonicznych terminów teologicznych.`);
}

/**
 * Aktualizuje termin teologiczny z zachowaniem pełnej historii audytowej (Glossary Versioning)
 * @param {import('firebase-admin/firestore').Firestore} db
 * @param {string} termId
 * @param {Partial<import('./types.js').TheologyTerm>} updates
 * @param {string} updatedBy
 * @param {string} reason
 * @returns {Promise<import('./types.js').TheologyTerm>}
 */
export async function updateTheologyTerm(db, termId, updates, updatedBy, reason) {
    if (!db || !termId || !updatedBy) {
        throw new Error('[THEOLOGY_GLOSSARY] Wymagane parametry: db, termId, updatedBy');
    }

    const docRef = db.collection(CC_THEOLOGY_GLOSSARY_COLLECTION).doc(termId);
    const snap = await docRef.get();

    if (!snap.exists) {
        throw new Error(`[THEOLOGY_GLOSSARY] Nie znaleziono terminu: ${termId}`);
    }

    const currentData = snap.data();
    const currentVersion = currentData.version || 1;
    const historyEntry = {
        version: currentVersion,
        translations: currentData.translations,
        definition: currentData.definition,
        status: currentData.status,
        updatedBy: currentData.updatedBy || currentData.createdBy,
        updatedAt: currentData.updatedAt || currentData.createdAt,
        reason: reason || 'Aktualizacja kanonicznego pojęcia'
    };

    const newHistory = [...(currentData.history || []), historyEntry];
    const now = new Date().toISOString();

    const updatedTerm = {
        ...currentData,
        ...updates,
        version: currentVersion + 1,
        history: newHistory,
        updatedBy,
        updatedAt: now
    };

    await docRef.set(updatedTerm, { merge: true });

    // Invaliduj cache w procesie
    cachedApprovedTerms = null;

    return updatedTerm;
}

/**
 * Skanuje tekst docelowy i weryfikuje zgodność z terminami Glosariusza
 * Wykrywa: użycie terminów zabronionych (forbidden) oraz brak preferowanych (preferred)
 * @param {string} sourceText
 * @param {string} targetText
 * @param {string} targetLanguage (en, es, pt-BR)
 * @param {import('./types.js').TheologyTerm[]} glossary
 * @returns {{
 *   matchedTerms: Array<{ termId: string, sourceTerm: string, preferred: string, detected: string }>,
 *   violations: Array<{ termId: string, forbiddenTerm: string, location: string, reason: string }>
 * }}
 */
export function verifyGlossaryCompliance(sourceText, targetText, targetLanguage, glossary) {
    const matchedTerms = [];
    const violations = [];

    const normTarget = targetText.toLowerCase();
    const normSource = sourceText.toLowerCase();

    for (const term of glossary) {
        if (term.status !== 'APPROVED') continue;

        // Sprawdź czy pojęcie występuje w tekście źródłowym
        const sourceMatches = normSource.includes(term.sourceTerm.toLowerCase());
        const langConfig = term.translations?.[targetLanguage];

        if (!langConfig) continue;

        if (sourceMatches) {
            // Sprawdź czy użyto preferowanego terminu lub alternatywy
            const hasPreferred = normTarget.includes(langConfig.preferred.toLowerCase());
            const hasAlternative = (langConfig.alternatives || []).some(alt => normTarget.includes(alt.toLowerCase()));

            if (hasPreferred || hasAlternative) {
                matchedTerms.push({
                    termId: term.termId,
                    sourceTerm: term.sourceTerm,
                    preferred: langConfig.preferred,
                    detected: hasPreferred ? langConfig.preferred : 'ALTERNATIVE'
                });
            }

            // Sprawdź czy użyto zakazanego terminu
            for (const forbidden of (langConfig.forbidden || [])) {
                if (normTarget.includes(forbidden.toLowerCase())) {
                    violations.push({
                        termId: term.termId,
                        forbiddenTerm: forbidden,
                        location: `Znaleziono zabroniony termin "${forbidden}" dla pojęcia "${term.concept}"`,
                        reason: `Zabroniony przez CC Theology Glossary. Wymagany: "${langConfig.preferred}"`
                    });
                }
            }
        }
    }

    return { matchedTerms, violations };
}
