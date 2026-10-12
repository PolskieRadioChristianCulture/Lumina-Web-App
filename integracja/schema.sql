CREATE TABLE IF NOT EXISTS cc_support_preferences (
  uid TEXT PRIMARY KEY,
  public_name TEXT NOT NULL DEFAULT '',
  consent INTEGER NOT NULL DEFAULT 0 CHECK (consent IN (0,1)),
  anonymous_consent INTEGER NOT NULL DEFAULT 0 CHECK (anonymous_consent IN (0,1)),
  consent_updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS cc_verified_support (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source TEXT NOT NULL CHECK (source IN ('patronite','youtube','bank','blik','revolut','zrzutka')),
  source_event_id TEXT NOT NULL,
  supporter_uid TEXT NOT NULL,
  evidence_ref TEXT NOT NULL,
  confirmed_by TEXT NOT NULL,
  confirmed_at TEXT NOT NULL,
  revoked INTEGER NOT NULL DEFAULT 0 CHECK (revoked IN (0,1)),
  UNIQUE (source, source_event_id)
);
CREATE INDEX IF NOT EXISTS cc_support_uid ON cc_verified_support(supporter_uid, revoked);
