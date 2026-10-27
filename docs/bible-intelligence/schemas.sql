-- =====================================================================
-- CHRISTIAN CULTURE — BIBLIA INTELLIGENCE CC
-- Baza danych relacyjna (D1 / SQLite / PostgreSQL / Cloudflare D1)
-- Zero Cost First Architecture — Schemat Danych v1.0 (2026-10-27)
-- =====================================================================

-- 1. ŹRÓDŁA I LICENCJE
CREATE TABLE IF NOT EXISTS sources (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    origin TEXT,
    license_code TEXT NOT NULL,          -- np. 'CC-BY-4.0', 'CC-BY-SA-4.0', 'PUBLIC_DOMAIN', 'CC_PROPRIETARY'
    license_url TEXT,
    attribution TEXT NOT NULL,
    commercial_use INTEGER DEFAULT 1,    -- 0/1
    derivative_policy TEXT,
    ingestion_permission TEXT NOT NULL,  -- 'FULL', 'CONDITIONAL', 'LINK_ONLY', 'AUDIT'
    review_date TEXT NOT NULL,
    status TEXT NOT NULL                 -- 'ACTIVE', 'RESTRICTED', 'PENDING'
);

-- 2. WYDANIA I PRZEKŁADY (EDITIONS)
CREATE TABLE IF NOT EXISTS editions (
    id TEXT PRIMARY KEY,                 -- np. 'ubg', 'bg1632', 'sblgnt', 'wlc', 'polsz'
    language TEXT NOT NULL,              -- 'pl', 'grc', 'he', 'en'
    canon TEXT NOT NULL DEFAULT 'protestant', -- 'protestant', 'catholic', 'orthodox'
    title TEXT NOT NULL,
    publisher TEXT,
    release_year INTEGER,
    source_id TEXT REFERENCES sources(id),
    versification TEXT DEFAULT 'kjv',    -- system wersyfikacji: 'kjv', 'masoretic', 'lxx'
    rights_status TEXT NOT NULL
);

-- 3. KSIĘGI BIBLIJNE (BOOKS)
CREATE TABLE IF NOT EXISTS books (
    id TEXT PRIMARY KEY,                 -- np. 'GEN', 'EXO', 'JHN', 'REV'
    canonical_code TEXT NOT NULL UNIQUE,
    testament TEXT NOT NULL,             -- 'OT', 'NT', 'APOC'
    localized_title TEXT NOT NULL,       -- np. 'Ewangelia według św. Jana'
    short_name TEXT NOT NULL,            -- np. 'Jan'
    aliases_json TEXT NOT NULL,          -- np. '["J", "Jn", "Jan", "Jana", "Ew. Jana"]'
    sort_order INTEGER NOT NULL
);

-- 4. WERSETY (VERSES)
-- Kanoniczny identyfikator: bible:{canon}:{book}:{chapter}:{verse}:{segment}
CREATE TABLE IF NOT EXISTS verses (
    id TEXT PRIMARY KEY,                 -- np. 'bible:prot:JHN:3:16'
    edition_id TEXT NOT NULL REFERENCES editions(id),
    book_id TEXT NOT NULL REFERENCES books(id),
    chapter INTEGER NOT NULL,
    verse INTEGER NOT NULL,
    segment TEXT DEFAULT '',
    text TEXT NOT NULL,
    normalized_text TEXT NOT NULL,       -- małe litery, bez znaków specjalnych, do wyszukiwania
    checksum TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_verses_lookup ON verses(book_id, chapter, verse);
CREATE INDEX IF NOT EXISTS idx_verses_edition ON verses(edition_id);

-- 5. TOKENY I MORFOLOGIA (TOKENS)
CREATE TABLE IF NOT EXISTS tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    verse_id TEXT NOT NULL REFERENCES verses(id),
    position INTEGER NOT NULL,
    surface TEXT NOT NULL,               -- oryginalna forma słowa w tekście
    lemma_id TEXT,                       -- np. G0026
    morphology_code TEXT,                -- np. V-AAI-3S
    strong_key TEXT,                     -- np. 'G0026', 'H07225'
    text_alignment_confidence REAL DEFAULT 1.0
);

CREATE INDEX IF NOT EXISTS idx_tokens_strong ON tokens(strong_key);
CREATE INDEX IF NOT EXISTS idx_tokens_verse ON tokens(verse_id);

-- 6. LEMATY I LEKSYKONY (LEMMAS)
CREATE TABLE IF NOT EXISTS lemmas (
    id TEXT PRIMARY KEY,                 -- np. 'G0026', 'H07225'
    language TEXT NOT NULL,              -- 'he', 'grc', 'arc'
    script TEXT NOT NULL,                -- np. 'ἀγάπη', 'רֵאשִׁית'
    transliteration TEXT NOT NULL,       -- np. 'agapē', 'reshit'
    gloss TEXT NOT NULL,                 -- zwięzłe znaczenie słownikowe
    lexical_source TEXT NOT NULL,
    attribution TEXT NOT NULL
);

-- 7. ODSYŁACZE WZAJEMNE (CROSS REFERENCES)
CREATE TABLE IF NOT EXISTS cross_references (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_ref TEXT NOT NULL,            -- np. 'bible:prot:JHN:3:16'
    target_ref TEXT NOT NULL,            -- np. 'bible:prot:ROM:5:8'
    relation_type TEXT NOT NULL,         -- 'DIRECT_QUOTE', 'ALLUSION', 'PARALLEL', 'THEME', 'PROPHETIC_FULFILLMENT'
    source_id TEXT REFERENCES sources(id),
    confidence REAL DEFAULT 1.0,
    votes INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_crossrefs_source ON cross_references(source_ref);

-- 8. MIEJSCA GEOGRAFICZNE I ATLAS (PLACES)
CREATE TABLE IF NOT EXISTS places (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    aliases_json TEXT,
    latitude REAL,
    longitude REAL,
    certainty TEXT NOT NULL,             -- 'CONFIRMED', 'PROBABLE', 'DISPUTED', 'UNKNOWN'
    historical_period TEXT,
    wikidata_id TEXT,
    source_id TEXT REFERENCES sources(id)
);

-- 9. TEMATY TEOLOGICZNE I TAKSONOMIA (TOPICS)
CREATE TABLE IF NOT EXISTS topics (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    parent_id TEXT REFERENCES topics(id),
    description TEXT
);

CREATE TABLE IF NOT EXISTS topic_links (
    topic_id TEXT NOT NULL REFERENCES topics(id),
    verse_id TEXT NOT NULL REFERENCES verses(id),
    evidence_type TEXT NOT NULL,         -- 'PRIMARY_PROOF', 'CONTEXTUAL', 'ILLUSTRATION'
    reviewer TEXT,
    PRIMARY KEY (topic_id, verse_id)
);

-- 10. MULTIMEDIA I TRANSKRYPCJE CC (MEDIA & SEGMENTS)
CREATE TABLE IF NOT EXISTS media (
    id TEXT PRIMARY KEY,
    canonical_url TEXT NOT NULL,
    kind TEXT NOT NULL,                  -- 'AUDIO', 'VIDEO', 'LECTURE', 'HYMN', 'PRAYER'
    title TEXT NOT NULL,
    series TEXT,                         -- np. 'APOKALIPSA - Księga Nadziei', 'Akademia Biblijna'
    creator TEXT NOT NULL,
    published_at TEXT,
    rights_status TEXT NOT NULL DEFAULT 'CC_ORIGINAL'
);

CREATE TABLE IF NOT EXISTS media_segments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    media_id TEXT NOT NULL REFERENCES media(id),
    start_ms INTEGER NOT NULL,
    end_ms INTEGER NOT NULL,
    text TEXT NOT NULL,
    cited_verses_json TEXT,              -- lista powiązanych siglów w danej minucie
    transcript_source TEXT
);

CREATE INDEX IF NOT EXISTS idx_media_segments_time ON media_segments(media_id, start_ms);
