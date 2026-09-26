/**
 * ══════════════════════════════════════════════════════════════════════════
 * CC CONTENT CORE — TYPE DEFINITIONS & SCHEMAS (SCHEMA VERSION 1)
 * Standard Architektury: MASTER PLAN CC GLOBAL 2030 (FAZA 1)
 * ══════════════════════════════════════════════════════════════════════════
 */

/**
 * @typedef {'DRAFT' | 'REVIEW_REQUIRED' | 'APPROVED' | 'SCHEDULED' | 'PUBLISHED' | 'VERIFIED' | 'ARCHIVED'} ContentStatus
 * @typedef {'VIDEO_LONG' | 'VIDEO_SHORT' | 'AUDIO' | 'RADIO' | 'PODCAST' | 'ARTICLE' | 'DEVOTIONAL' | 'BIBLE_STUDY' | 'VERSE' | 'PRAYER' | 'WORSHIP' | 'MUSIC' | 'NEWS' | 'TESTIMONY' | 'SOCIAL_POST' | 'IMAGE'} ContentType
 * @typedef {'CC_OWNED' | 'LICENSED' | 'EXTERNAL' | 'UNKNOWN'} OwnershipType
 * @typedef {'VIDEO' | 'AUDIO' | 'IMAGE' | 'TRANSCRIPT' | 'SUBTITLE' | 'DOCUMENT'} AssetType
 * @typedef {'DERIVED_FROM' | 'EXCERPT_OF' | 'TRANSLATION_OF' | 'AUDIO_OF' | 'SHORT_OF'} RelationshipType
 * @typedef {'DRAFT' | 'QUEUED' | 'PROCESSING' | 'PUBLISHED' | 'VERIFIED' | 'FAILED' | 'REMOVED'} PublicationStatus
 * @typedef {'WWW' | 'LUMINA' | 'YOUTUBE' | 'BITCHUTE' | 'RADIO' | 'WHATSAPP' | 'FACEBOOK' | 'INSTAGRAM' | 'PODCAST' | 'CC_LITE'} PlatformType
 */

/**
 * Kanoniczny model praw autorskich (Rights Guard)
 * @typedef {Object} RightsModel
 * @property {OwnershipType} ownership - Typ własności (UNKNOWN blokuje publikację!)
 * @property {boolean} translationAllowed - Czy dozwolone jest tłumaczenie
 * @property {boolean} editingAllowed - Czy dozwolony jest montaż / skróty
 * @property {boolean} redistributionAllowed - Czy dozwolona jest redystrybucja
 * @property {boolean} monetizationAllowed - Czy dozwolona jest monetyzacja
 * @property {string} licenseName - Nazwa licencji (np. "Christian Culture Standard CC-BY-NC-ND 4.0")
 * @property {string} [licenseNotes] - Dodatkowe uwagi prawne
 * @property {string} [rightsOwner] - Podmiot praw autorskich
 * @property {string} [expiration] - Data wygaśnięcia praw (ISO 8601 lub null)
 */

/**
 * Precyzyjny model referencji biblijnej (Biblical References Guard)
 * @typedef {Object} BiblicalReference
 * @property {string} book - Księga (np. "Izajasz", "Jan")
 * @property {number} chapter - Rozdział
 * @property {number} verseStart - Werset początkowy
 * @property {number} [verseEnd] - Werset końcowy
 * @property {string} translation - Przekład (np. "UBG", "BW", "BT")
 * @property {string} [quoteText] - Cytowany tekst
 * @property {boolean} isDirectQuote - true = DIRECT_BIBLE_QUOTE, false = PARAPHRASE
 */

/**
 * Źródło historyczne / legacy (Legacy Source Map)
 * @typedef {Object} LegacySource
 * @property {string} system - System źródłowy (np. "cc-mission-control", "cuda-398c0", "lumina-posts")
 * @property {string} collection - Nazwa kolekcji źródłowej
 * @property {string} documentId - ID dokumentu w starym systemie
 * @property {string} importedAt - Data zmapowania (ISO 8601)
 */

/**
 * Model Master Content (cc_content/{contentId})
 * @typedef {Object} ContentMasterRecord
 * @property {string} contentId - Unikalny identyfikator CC-YYYY-NNNNNN
 * @property {number} schemaVersion - Wersja schematu (obowiązkowo 1)
 * @property {ContentType} type - Typ treści
 * @property {ContentStatus} status - Status logiczny
 * @property {string} originalLanguage - Język źródłowy (kod ISO, np. "pl", "en")
 * @property {string} title - Tytuł kanoniczny
 * @property {string} description - Opis rozszerzony
 * @property {string} summary - Krótkie podsumowanie / teaser
 * @property {string} author - Autor / Lektor
 * @property {string} publisher - Wydawca (np. "Christian Culture")
 * @property {string} [series] - Seria (np. "Słowa Mają Moc", "Biblia Audio")
 * @property {string} category - Kategoria główna
 * @property {string[]} tags - Tagi i słowa kluczowe
 * @property {BiblicalReference[]} biblicalReferences - Strukturyzowane cytaty biblijne
 * @property {string} source - Nazwa źródła pierwotnego
 * @property {string} sourceType - Typ źródła (np. "ORIGINAL_STUDIO", "DEVOTIONAL_DAILY", "LIVE_TRANSMISSION")
 * @property {string|null} sourceUrl - URL źródłowy jeśli istnieje
 * @property {RightsModel} rights - Prawa autorskie
 * @property {LegacySource[]} legacySources - Mapowanie starych systemów
 * @property {string|null} parentContentId - Identyfikator rodzica w grafie (Content Lineage)
 * @property {RelationshipType|null} relationshipType - Typ powiązania z rodzicem
 * @property {Object} media - Wskaźniki do assetów głównych
 * @property {string|null} media.thumbnailAssetId
 * @property {string|null} media.masterAudioAssetId
 * @property {string|null} media.masterVideoAssetId
 * @property {string} createdAt - Data utworzenia (ISO 8601)
 * @property {string} updatedAt - Data aktualizacji (ISO 8601)
 * @property {string|null} publishedAt - Data pierwszej publikacji (ISO 8601)
 * @property {string} createdBy - UID twórcy lub "system"
 * @property {string} updatedBy - UID aktualizującego
 */

/**
 * Model Wariantu (cc_content/{contentId}/variants/{variantId})
 * @typedef {Object} ContentVariantRecord
 * @property {string} variantId - Identyfikator wariantu (np. "var_pl_tts", "var_en_web")
 * @property {string} contentId - CC CONTENT ID rodzica
 * @property {string} language - Język (np. "pl", "en", "es", "pt")
 * @property {string} locale - Pełna lokalizacja (np. "pl-PL", "en-US", "pt-BR")
 * @property {string} format - Format wariantu (np. "TEXT_TTS", "TEXT_WEB", "TEXT_SMS", "AUDIO_MASTER")
 * @property {string} title - Tytuł wariantu
 * @property {string} description - Opis wariantu
 * @property {string} body - Główna treść tekstowa
 * @property {string|null} [transcript] - Transkrypcja
 * @property {string|null} [subtitleAssetId] - ID powiązanego assetu napisów
 * @property {string|null} [voiceAssetId] - ID powiązanego assetu głosu/dub
 * @property {string|null} [videoAssetId] - ID powiązanego assetu wideo
 * @property {string|null} [imageAssetId] - ID powiązanego assetu grafiki
 * @property {boolean} radioEligible - Czy wariant nadaje się do ramówki Radia CC
 * @property {number|null} [radioPriority] - Priorytet emisyjny w radiu (1-10)
 * @property {string|null} [radioCategory] - Kategoria ramówkowa
 * @property {string} translationStatus - Status tłumaczenia ("ORIGINAL", "AI_DRAFT", "REVIEWED", "APPROVED")
 * @property {string} qualityStatus - Status jakości ("DRAFT", "VERIFIED", "REJECTED")
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * Model Fizycznego Zasobu (cc_content/{contentId}/assets/{assetId})
 * @typedef {Object} ContentAssetRecord
 * @property {string} assetId - Unikalny identyfikator assetu
 * @property {string} contentId - CC CONTENT ID
 * @property {AssetType} type - Typ pliku
 * @property {string} mimeType - Typ MIME
 * @property {string} storageProvider - Dostawca magazynu ("FIREBASE_STORAGE", "CLOUDFLARE_R2", "LOCAL", "EXTERNAL")
 * @property {string} storagePath - Ścieżka magazynowa
 * @property {string} url - Publiczny lub zabezpieczony URL
 * @property {string} checksum - Suma kontrolna SHA-256
 * @property {number} size - Rozmiar w bajtach
 * @property {string} createdAt
 */

/**
 * Model Publikacji Platformowej (cc_content/{contentId}/publications/{publicationId})
 * @typedef {Object} ContentPublicationRecord
 * @property {string} publicationId - Identyfikator publikacji
 * @property {string} contentId - CC CONTENT ID
 * @property {string} variantId - Wskazany wariant
 * @property {PlatformType} platform - Platforma docelowa
 * @property {string|null} channelId - ID kanału (np. handle YouTube, nazwa grupy WA)
 * @property {string|null} accountId - ID konta emisyjnego
 * @property {string|null} remoteId - Zewnętrzny ID platformy (np. YouTube Video ID, Firestore docId)
 * @property {string|null} publicUrl - Publiczny, zweryfikowany URL
 * @property {PublicationStatus} status - Status publikacji
 * @property {string|null} scheduledAt - Zaplanowany czas emisji (ISO 8601)
 * @property {string|null} publishedAt - Faktyczny czas publikacji (ISO 8601)
 * @property {string|null} lastVerifiedAt - Data ostatniej weryfikacji istnienia (ISO 8601)
 * @property {Object|null} verificationEvidence - Rzeczywisty dowód weryfikacji
 * @property {Object|null} error - Szczegóły ewentualnego błędu
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * Model Śladu Rewizyjnego (cc_content/{contentId}/audit/{auditId})
 * @typedef {Object} ContentAuditRecord
 * @property {string} auditId - ID wpisu audytu
 * @property {string} contentId - CC CONTENT ID
 * @property {string} actor - Osoba lub agent wykonujący akcję
 * @property {string} action - Nazwa akcji (np. "CREATE_MASTER", "ADD_VARIANT", "UPDATE_RIGHTS")
 * @property {string} timestamp - Czas zdarzenia (ISO 8601)
 * @property {Object|null} before - Stan przed zmianą
 * @property {Object|null} after - Stan po zmianie
 * @property {string} source - Źródło operacji (np. "Mission Control UI", "CLI", "Legacy Sync")
 */

export const CC_SCHEMA_VERSION = 1;
export const CC_COLLECTION_NAME = 'cc_content';
export const CC_COUNTERS_COLLECTION = 'cc_content_meta';
export const CC_COUNTERS_DOC = 'counters';

// FAZA 2: CC Language & AI Content Factory Kolekcje
export const CC_THEOLOGY_GLOSSARY_COLLECTION = 'cc_theology_glossary';
export const CC_TRANSLATION_MEMORY_COLLECTION = 'cc_translation_memory';
export const CC_BIBLE_SOURCES_COLLECTION = 'cc_bible_sources';
export const CC_AI_JOBS_COLLECTION = 'cc_ai_jobs';

// Obsługiwane języki Fali 1 (Language Wave 1)
export const SUPPORTED_LANGUAGES_WAVE1 = Object.freeze({
    PL: { code: 'pl', locale: 'pl-PL', name: 'Polski (Źródło)', isSource: true },
    EN: { code: 'en', locale: 'en-US', name: 'English', isSource: false },
    ES: { code: 'es', locale: 'es-ES', name: 'Español', isSource: false },
    PT_BR: { code: 'pt-BR', locale: 'pt-BR', name: 'Português (Brasil)', isSource: false }
});

/**
 * @typedef {'DRAFT' | 'REVIEW' | 'APPROVED' | 'DEPRECATED'} TheologyTermStatus
 * @typedef {'QUEUED' | 'PROCESSING' | 'VALIDATING' | 'REVIEW_REQUIRED' | 'COMPLETED' | 'FAILED'} AiJobStatus
 * @typedef {'TERM_MISMATCH' | 'BIBLE_REFERENCE_CHANGED' | 'BIBLE_QUOTE_UNVERIFIED' | 'NUMBER_CHANGED' | 'URL_CHANGED' | 'MEANING_RISK' | 'MISSING_SEGMENT' | 'EXTRA_CONTENT' | 'RIGHTS_UNKNOWN' | 'CRITICAL_TERM_MISMATCH' | 'BIBLE_SOURCE_MISSING' | 'BIBLE_RIGHTS_REVIEW_REQUIRED'} ValidationFlag
 * @typedef {'THEOLOGY' | 'LANGUAGE' | 'STYLE' | 'BIBLE' | 'INCOMPLETE' | 'OTHER'} RejectReason
 * @typedef {'NORMAL_TEXT' | 'DIRECT_BIBLE_QUOTE' | 'BIBLE_REFERENCE' | 'PRAYER' | 'TITLE' | 'CTA' | 'PROPER_NAME'} ContentSegmentType
 * @typedef {'VERIFIED' | 'RESTRICTED' | 'PERMISSION_REQUIRED' | 'PUBLIC_DOMAIN' | 'UNKNOWN'} BibleRightsStatus
 * @typedef {'HIGH' | 'MEDIUM' | 'LOW'} BibleRightsConfidence
 * @typedef {'ACTIVE' | 'SUPERSEDED' | 'REVOKED'} TmEntryStatus
 */

/**
 * Model Kanonicznego Terminu Teologicznego (CC Theology Glossary)
 * @typedef {Object} TheologyTerm
 * @property {string} termId - Unikalny ID terminu (np. "term_sabbath", "term_law_of_god")
 * @property {string} concept - Kanoniczny koncept (np. "Sabbath", "Salvation by Grace")
 * @property {string} sourceLanguage - Język źródłowy (zazwyczaj "pl")
 * @property {string} sourceTerm - Termin źródłowy w języku polskim
 * @property {Record<string, { preferred: string, forbidden: string[], alternatives: string[] }>} translations - Tłumaczenia per język (en, es, pt-BR)
 * @property {string} definition - Kanoniczna definicja teologiczna CC
 * @property {string} [context] - Kontekst teologiczny/doktrynalny
 * @property {string} [notes] - Uwagi tłumaczeniowe dla AI i weryfikatora
 * @property {string[]} biblicalReferences - Kluczowe wersety biblijne (np. ["Wj 20:8-11", "Iz 58:13"])
 * @property {TheologyTermStatus} status - Status terminu (wyłącznie APPROVED wiąże AI)
 * @property {number} version - Wersja terminu
 * @property {Array<{ version: number, preferredTranslations: Record<string, string>, updatedBy: string, updatedAt: string, reason: string }>} [history]
 * @property {string|null} [supersededBy] - ID nowszego terminu
 * @property {string} createdBy
 * @property {string|null} approvedBy
 * @property {string} [updatedBy]
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {number} schemaVersion
 */

/**
 * Model Pamięci Tłumaczeń (CC Translation Memory) z wersjonowaniem i cyklem życia
 * @typedef {Object} TranslationMemoryEntry
 * @property {string} entryId - Unikalny hash/ID segmentu
 * @property {string} sourceLanguage - Język źródłowy (np. "pl")
 * @property {string} targetLanguage - Język docelowy (np. "en", "es", "pt-BR")
 * @property {string} sourceText - Dokładny tekst źródłowy segmentu
 * @property {string} targetText - Zatwierdzone tłumaczenie
 * @property {ContentType} contentType - Typ treści
 * @property {string} [context] - Kontekst (np. "DEVOTIONAL_PRAYER", "BIBLE_TITLE")
 * @property {string} [contentId] - Identyfikator powiązanego Master Content
 * @property {string} [variantId] - Identyfikator wariantu
 * @property {number} quality - Ocena jakości (0-100)
 * @property {TmEntryStatus} status - Status cyklu życia (ACTIVE, SUPERSEDED, REVOKED)
 * @property {number} version - Numer wersji wpisu
 * @property {string|null} supersedes - ID zastąpionego wpisu (jeśli dotyczy)
 * @property {string} approvedBy - Identyfikator operatora zatwierdzającego
 * @property {string} approvedAt - Czas zatwierdzenia (ISO 8601)
 * @property {string|null} [revokedBy] - Identyfikator operatora cofającego zatwierdzenie
 * @property {string|null} [revokedAt] - Czas cofnięcia (ISO 8601)
 * @property {string|null} [reason] - Powód modyfikacji lub cofnięcia
 * @property {string} sourceHash - SHA-256 tekstu źródłowego (do O(1) exact match)
 * @property {number} schemaVersion
 */

/**
 * Rejestr Źródeł Biblijnych i Praw Autorskich (CC Bible Rights & Source Registry)
 * @typedef {Object} BibleSourceEntry
 * @property {string} translationCode - Kod przekładu (np. "UBG", "BSB", "KJV", "RVA2015", "ARC")
 * @property {string} translationName - Pełna nazwa przekładu
 * @property {string} language - Język (np. "pl", "en", "es", "pt-BR")
 * @property {string} locale - Locale (np. "pl-PL", "en-US", "es-ES", "pt-BR")
 * @property {string} copyrightHolder - Właściciel praw majątkowych / wydawca
 * @property {'COPYRIGHTED' | 'PUBLIC_DOMAIN' | 'RESTRICTED' | 'PERMISSION_REQUIRED'} copyrightStatus - Status prawny
 * @property {boolean} publicDomain - Czy przekład jest w domenie publicznej
 * @property {boolean} quotationAllowed - Czy dozwolone jest cytowanie fragmentów
 * @property {boolean} redistributionAllowed - Czy dozwolona jest pełna redystrybucja
 * @property {boolean} digitalUseAllowed - Czy dozwolony użytek cyfrowy
 * @property {boolean} commercialUseAllowed - Czy dozwolony użytek komercyjny
 * @property {boolean} audioUseAllowed - Czy dozwolony użytek audio
 * @property {boolean} textDisplayAllowed - Czy dozwolone wyświetlanie tekstu
 * @property {boolean} ttsAllowed - Czy dozwolona synteza mowy (TTS)
 * @property {boolean} audioDistributionAllowed - Czy dozwolona masowa dystrybucja audio/radiowa
 * @property {number|null} maxVersesAllowed - Maksymalna liczba wersetów bez licencji
 * @property {boolean} attributionRequired - Czy wymagana jest nota o prawach
 * @property {string} requiredAttribution - Treść obowiązkowej noty copyright
 * @property {string} licenseName - Nazwa licencji / polityki cytowania
 * @property {string|null} [licenseUrl] - Link do oficjalnej licencji
 * @property {string|null} [officialSourceUrl] - Link do oficjalnego wydawcy
 * @property {string} verifiedAt - Data weryfikacji praw (ISO 8601)
 * @property {string} verifiedBy - Podmiot weryfikujący prawa
 * @property {BibleRightsConfidence} rightsConfidence - Poziom pewności statusu
 * @property {BibleRightsStatus} status - Status rejestru praw (VERIFIED, RESTRICTED, PERMISSION_REQUIRED, PUBLIC_DOMAIN, UNKNOWN)
 */

/**
 * Pochodzenie Cytatu Biblijnego (Bible Source Provenance)
 * @typedef {Object} BibleQuoteProvenance
 * @property {string} translation - Kod przekładu (np. "UBG", "BSB")
 * @property {string} book - Nazwa księgi
 * @property {number} chapter - Rozdział
 * @property {number} verseStart - Werset początkowy
 * @property {number|null} verseEnd - Werset końcowy
 * @property {string} sourceProvider - Dostawca źródłowy ("CANONICAL_LOCAL_DB", "OFFICIAL_API", "MANUAL_VERIFIED")
 * @property {string} sourceRecord - ID lub ścieżka rekordu źródłowego
 * @property {BibleRightsStatus} rightsStatus - Status praw autorskich
 * @property {string} retrievedAt - Data pobrania tekstu (ISO 8601)
 */

/**
 * Raport Niezależnego Walidatora Teologicznego (Theology Validation Report)
 * @typedef {Object} TheologyValidationReport
 * @property {boolean} valid - Czy wariant przeszedł walidację (brak flag krytycznych i score >= 80)
 * @property {number} overallScore - Quality Check Score / Validation Score (0-100)
 * @property {number} languageQuality - Jakość językowa i gramatyczna (0-100)
 * @property {number} terminologyCompliance - Zgodność z CC Theology Glossary (0-100)
 * @property {number} biblicalIntegrity - Integralność wersetów i cytatów (0-100)
 * @property {number} sourceFidelity - Wierność wobec Master Record (0-100)
 * @property {number} formatIntegrity - Integralność struktury, liczb i linków (0-100)
 * @property {ValidationFlag[]} flags - Lista wykrytych flag
 * @property {Array<{ flag: ValidationFlag, message: string, severity: 'CRITICAL' | 'WARNING' | 'INFO', location?: string }>} flagDetails
 * @property {boolean} blocking - true jeśli jakakolwiek flaga krytyczna blokuje zatwierdzenie
 * @property {string} validatedAt - Czas walidacji (ISO 8601)
 * @property {string} validatorVersion - Wersja algorytmu walidatora
 */

/**
 * Zadanie Asynchroniczne Fabryki Treści (CC AI Job)
 * Bezpieczeństwo: Rekord NIE MOŻE zawierać kluczy API, tokenów ani prywatnego chain-of-thought!
 * @typedef {Object} AiJobRecord
 * @property {string} jobId - Unikalny identyfikator zadania
 * @property {string} contentId - CC CONTENT ID
 * @property {string} targetLanguage - Kod języka docelowego
 * @property {string} targetLocale - Locale docelowy
 * @property {'TRANSLATE' | 'DERIVE_FORMATS' | 'VALIDATE'} action - Typ zadania
 * @property {AiJobStatus} status - Status zadania
 * @property {string} promptVersion - Wersja szablonu promptu
 * @property {string} glossaryVersion - Wersja użytego glosariusza
 * @property {string} translationMemoryVersion - Wersja pamięci tłumaczeń
 * @property {string} provider - Dostawca modelu ("GEMINI", "BYOK_OPENAI", "LOCAL_MOCK")
 * @property {string} model - Nazwa modelu (np. "gemini-2.5-pro")
 * @property {{ inputTokens?: number, outputTokens?: number, characters?: number, durationMs?: number, estimatedCostUsd?: number }} [usage]
 * @property {string|null} error - Treść ewentualnego błędu
 * @property {any} [result] - Wynik operacji (np. candidate variant, derived formats)
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * ══════════════════════════════════════════════════════════════════════════
 * CC GLOBAL DISTRIBUTION ENGINE — TYPY & SCHEMATY (FAZA 3)
 * Standard Architektury: MASTER PLAN CC GLOBAL 2030 (FAZA 3)
 * ══════════════════════════════════════════════════════════════════════════
 */

/**
 * Stan zadania dystrybucji (Distribution Job State)
 * @typedef {'DRAFT' | 'READY' | 'QUEUED' | 'PROCESSING' | 'UPLOADED' | 'PLATFORM_PROCESSING' | 'PUBLISHED' | 'VERIFIED' | 'FAILED' | 'CANCELLED' | 'MANUAL_ACTION_REQUIRED'} DistributionJobState
 */

/**
 * Tryb publikacji platformy
 * @typedef {'API' | 'MANUAL_ASSISTED' | 'LEGACY' | 'DISABLED'} PlatformPublicationMode
 */

/**
 * Możliwości techniczne adaptera platformy (Platform Capability Registry)
 * @typedef {Object} PlatformCapability
 * @property {PlatformType} platform - Identyfikator platformy
 * @property {string} adapterVersion - Wersja adaptera (np. "2026.3-youtube-official")
 * @property {boolean} supportsText - Obsługa publikacji tekstowej
 * @property {boolean} supportsImage - Obsługa grafik i miniaturek
 * @property {boolean} supportsAudio - Obsługa plików i strumieni audio
 * @property {boolean} supportsVideo - Obsługa wideo
 * @property {boolean} supportsScheduling - Natywne harmonogramowanie platformy
 * @property {boolean} supportsLocalization - Zlokalizowane metadane / ścieżki językowe
 * @property {boolean} supportsRemoteVerification - Zdolność do zdalnego potwierdzenia istnienia publikacji
 * @property {boolean} supportsAnalytics - Zdalny odczyt statystyk (wyświetlenia, odsłuchy)
 * @property {PlatformPublicationMode} publicationMode - Tryb operacyjny adaptera
 */

/**
 * Niezmienny Manifest Publikacji (Immutable Publication Manifest)
 * Krytyczne: Stanowi snapshot historyczny wariantu, zasobów i praw w momencie publikacji!
 * @typedef {Object} PublicationManifest
 * @property {string} manifestId - Unikalny identyfikator manifestu (pubm_sha256...)
 * @property {string} contentId - Identyfikator Master Content (CC-YYYY-NNNNNN)
 * @property {string} variantId - Identyfikator wariantu językowego (np. var_pl_web)
 * @property {string} variantHash - SHA-256 zatwierdzonego tekstu wariantu
 * @property {string[]} assetIds - Lista identyfikatorów załączonych zasobów
 * @property {Object.<string, string>} assetHashes - Mapa assetId -> SHA-256
 * @property {string} title - Tytuł publikacji
 * @property {string} description - Opis publikacji
 * @property {RightsModel} rightsSnapshot - Kopia praw autorskich z momentu approval
 * @property {PlatformType} platform - Platforma docelowa
 * @property {string} channelId - Identyfikator kanału docelowego
 * @property {string} adapterVersion - Wersja adaptera realizującego publikację
 * @property {string} createdAt - Data utworzenia manifestu (ISO 8601 UTC)
 * @property {string} createdBy - Identyfikator operatora lub procesu
 */

/**
 * Plan Dystrybucji Treści (Distribution Plan)
 * Operator decyduje: co, gdzie, w jakim języku, kiedy i z jaką widocznością.
 * @typedef {Object} DistributionPlan
 * @property {string} planId - Unikalny identyfikator planu (plan_YYYYMMDD_...)
 * @property {string} contentId - CC CONTENT ID
 * @property {string} variantId - Wariant językowy (musi posiadać status APPROVED!)
 * @property {PlatformType[]} platforms - Wybrane platformy
 * @property {string[]} channels - Wybrane kanały (np. ["UC_PILOT_CC_MAIN", "lumina_general"])
 * @property {{ publishNow: boolean, scheduledAt?: string, timezone: string }} schedule - Harmonogram
 * @property {'PUBLIC' | 'UNLISTED' | 'PRIVATE'} visibility - Widoczność na platformach
 * @property {{ notifySubscribers: boolean, pushToLumina: boolean, whatsappDispatch: boolean }} notificationPolicy
 * @property {'DRAFT' | 'APPROVED_FOR_DISTRIBUTION' | 'EXECUTING' | 'COMPLETED' | 'PARTIAL_SUCCESS' | 'FAILED' | 'CANCELLED'} status
 * @property {string} createdAt
 * @property {string} createdBy
 * @property {string|null} approvedForDistributionBy - Dowódca / Operator zatwierdzający emisję
 * @property {string|null} approvedForDistributionAt - Czas autoryzacji dystrybucji (ISO 8601 UTC)
 * @property {string[]} jobIds - Lista wygenerowanych zadań wykonawczych
 */

/**
 * Pojedyncze Zadanie Dystrybucji (Distribution Job)
 * Każda kombinacja: CONTENT × VARIANT × PLATFORM × CHANNEL = OSOBNY JOB.
 * @typedef {Object} DistributionJob
 * @property {string} jobId - Unikalny identyfikator zadania (dist_YYYYMMDD_...)
 * @property {string} planId - Powiązany plan dystrybucji
 * @property {string} contentId - CC CONTENT ID
 * @property {string} variantId - Identyfikator wariantu
 * @property {PlatformType} platform - Platforma
 * @property {string} channelId - Kanał
 * @property {string} [accountId] - Konto OAuth / techniczne
 * @property {string} adapterVersion - Wersja adaptera
 * @property {DistributionJobState} status - Precyzyjny stan zadania
 * @property {number} attempt - Aktualna próba (1-indexed)
 * @property {number} maxAttempts - Maksymalna liczba prób (np. 3 lub 5)
 * @property {string} idempotencyKey - Klucz deterministyczny sha256(contentId:variantId:platform:channelId:publicationIntent)
 * @property {string} manifestId - Odwołanie do niezmiennego manifestu publikacji
 * @property {string} scheduledAt - Czas zaplanowanej emisji (ISO 8601 UTC)
 * @property {string|null} startedAt - Czas rozpoczęcia przetwarzania
 * @property {string|null} completedAt - Czas zakończenia
 * @property {string|null} remoteId - Zewnętrzny ID platformy (np. YouTube videoId)
 * @property {string|null} publicUrl - Zewnętrzny publiczny adres URL
 * @property {string|null} processingStatus - Stan przetwarzania platformy (np. "processing", "succeeded")
 * @property {string|null} errorCode - Kod błędu (np. "YOUTUBE_QUOTA_EXCEEDED", "BIBLE_RIGHTS_BLOCKED")
 * @property {string|null} errorMessage - Szczegóły błędu
 * @property {boolean} retryable - Czy błąd kwalifikuje się do automatycznego ponowienia
 * @property {Array<{ timestamp: string, state: DistributionJobState, note?: string }>} stateHistory
 */

/**
 * Globalny Wyłącznik Awaryjny Dystrybucji (Distribution Kill Switch)
 * @typedef {Object} DistributionKillSwitch
 * @property {boolean} globalOff - Zatrzymanie WSZYSTKICH nowych zadań dystrybucji w ekosystemie
 * @property {Object.<PlatformType, boolean>} platformOff - Wyłączenie poszczególnych platform (np. YOUTUBE: true)
 * @property {Object.<string, boolean>} channelOff - Wyłączenie poszczególnych kanałów (np. UC_PILOT: true)
 * @property {boolean} automationOff - Wyłączenie automatycznych workerów (dozwolony wyłącznie MANUAL_ASSISTED)
 * @property {string} updatedAt - Czas aktualizacji
 * @property {string} updatedBy - Operator aktualizujący
 * @property {string} reason - Przyczyna zmiany stanu wyłącznika
 */

