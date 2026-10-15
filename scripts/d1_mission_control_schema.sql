-- Cloudflare D1 Schema dla Mission Control (Christian Culture)
-- Baza: mission-control-db (2696531d-d420-4a0c-a882-2ad11b5d9da7)

CREATE TABLE IF NOT EXISTS command_queue (
  id TEXT PRIMARY KEY,
  command TEXT NOT NULL,
  target_group TEXT,
  status TEXT DEFAULT 'pending', -- pending, processing, done, failed
  priority INTEGER DEFAULT 1,
  day_number INTEGER,
  created_at TEXT DEFAULT (datetime('now')),
  executed_at TEXT,
  error TEXT
);

CREATE INDEX IF NOT EXISTS idx_command_queue_status_created ON command_queue(status, created_at);

CREATE TABLE IF NOT EXISTS daily_inspirations (
  day_number INTEGER PRIMARY KEY,
  date TEXT NOT NULL,
  title TEXT NOT NULL,
  content_web TEXT NOT NULL,
  content_tts TEXT NOT NULL,
  content_sms TEXT NOT NULL,
  image_url TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS whatsapp_groups (
  jid TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  last_sent_at TEXT,
  active INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS system_status (
  service TEXT PRIMARY KEY,
  status TEXT NOT NULL,
  last_ping TEXT DEFAULT (datetime('now')),
  details TEXT
);
