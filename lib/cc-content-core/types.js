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
