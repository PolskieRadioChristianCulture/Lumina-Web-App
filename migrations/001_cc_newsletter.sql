-- ============================================================================
-- EkoCC / CC NEWSLETTER — Schemat Bazy Danych Cloudflare D1 (SQLite)
-- Identyfikator: CCNL-003 | Wersja: 1.0.0 | Data: 2026-10-30
-- ============================================================================

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id TEXT PRIMARY KEY,
  email_normalized TEXT NOT NULL UNIQUE,
  email_display TEXT NOT NULL,
  first_name TEXT,
  locale TEXT NOT NULL DEFAULT 'pl' CHECK (locale IN ('pl', 'en', 'de')),
  status TEXT NOT NULL DEFAULT 'pending_confirmation' CHECK (
    status IN ('pending_confirmation', 'active', 'unsubscribed', 'bounced', 'complained', 'suppressed')
  ),
  source_portal TEXT NOT NULL DEFAULT 'polskieradio-home',
  source_path TEXT NOT NULL DEFAULT '/',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  confirmed_at TEXT,
  unsubscribed_at TEXT,
  last_sent_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_status ON newsletter_subscribers(status);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_locale ON newsletter_subscribers(locale);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_source ON newsletter_subscribers(source_portal);

CREATE TABLE IF NOT EXISTS newsletter_topics (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name_pl TEXT NOT NULL,
  name_en TEXT NOT NULL,
  name_de TEXT NOT NULL DEFAULT '',
  description_pl TEXT NOT NULL,
  description_en TEXT NOT NULL,
  description_de TEXT NOT NULL DEFAULT '',
  is_active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 100
);

CREATE TABLE IF NOT EXISTS newsletter_preferences (
  subscriber_id TEXT NOT NULL,
  topic_id TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (subscriber_id, topic_id),
  FOREIGN KEY (subscriber_id) REFERENCES newsletter_subscribers(id) ON DELETE CASCADE,
  FOREIGN KEY (topic_id) REFERENCES newsletter_topics(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_newsletter_preferences_topic ON newsletter_preferences(topic_id, enabled);

CREATE TABLE IF NOT EXISTS newsletter_consent_events (
  id TEXT PRIMARY KEY,
  subscriber_id TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (
    event_type IN (
      'subscribe_requested',
      'confirmed',
      'preferences_updated',
      'unsubscribed',
      'bounced',
      'complained',
      'gdpr_erased',
      'gdpr_exported',
      're_subscribe_requested'
    )
  ),
  consent_version TEXT NOT NULL,
  consent_text_snapshot TEXT NOT NULL,
  privacy_policy_version TEXT NOT NULL,
  source_portal TEXT NOT NULL,
  source_path TEXT NOT NULL,
  locale TEXT NOT NULL DEFAULT 'pl',
  ip_hash TEXT NOT NULL,
  user_agent_hash TEXT NOT NULL,
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_newsletter_consent_subscriber ON newsletter_consent_events(subscriber_id, created_at);
CREATE INDEX IF NOT EXISTS idx_newsletter_consent_type ON newsletter_consent_events(event_type, created_at);

CREATE TABLE IF NOT EXISTS newsletter_tokens (
  id TEXT PRIMARY KEY,
  subscriber_id TEXT NOT NULL,
  purpose TEXT NOT NULL CHECK (purpose IN ('confirm', 'manage', 'unsubscribe')),
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  used_at TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (subscriber_id) REFERENCES newsletter_subscribers(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_newsletter_tokens_hash ON newsletter_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_newsletter_tokens_subscriber ON newsletter_tokens(subscriber_id, purpose);

CREATE TABLE IF NOT EXISTS newsletter_campaigns (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  subject_pl TEXT NOT NULL,
  subject_en TEXT NOT NULL DEFAULT '',
  preheader_pl TEXT NOT NULL DEFAULT '',
  preheader_en TEXT NOT NULL DEFAULT '',
  topic_filter_json TEXT NOT NULL DEFAULT '[]',
  locale_filter TEXT NOT NULL DEFAULT 'all',
  html_body TEXT NOT NULL,
  text_body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (
    status IN ('draft', 'ready_for_review', 'approved', 'sending', 'sent', 'cancelled', 'failed')
  ),
  scheduled_at TEXT,
  sent_at TEXT,
  created_by TEXT NOT NULL DEFAULT 'admin',
  approved_by TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_status ON newsletter_campaigns(status);

CREATE TABLE IF NOT EXISTS newsletter_deliveries (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL,
  subscriber_id TEXT NOT NULL,
  delivery_type TEXT NOT NULL DEFAULT 'campaign' CHECK (
    delivery_type IN ('doi_confirm', 'welcome', 'manage_link', 'campaign', 'test_send')
  ),
  provider_name TEXT NOT NULL DEFAULT 'dry_run',
  provider_message_id TEXT,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (
    status IN ('queued', 'dry_run_queued', 'sent', 'delivered', 'bounced', 'complained', 'failed', 'skipped_unsubscribed')
  ),
  error_code TEXT,
  sent_at TEXT,
  updated_at TEXT NOT NULL,
  UNIQUE(campaign_id, subscriber_id)
);

CREATE INDEX IF NOT EXISTS idx_newsletter_deliveries_campaign ON newsletter_deliveries(campaign_id, status);
CREATE INDEX IF NOT EXISTS idx_newsletter_deliveries_subscriber ON newsletter_deliveries(subscriber_id);

CREATE TABLE IF NOT EXISTS newsletter_suppressions (
  email_hash TEXT PRIMARY KEY,
  reason TEXT NOT NULL CHECK (
    reason IN ('unsubscribed', 'hard_bounce', 'spam_complaint', 'manual_block', 'gdpr_erasure')
  ),
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
);

-- ============================================================================
-- Seed 5 Kategorii Tematycznych v1 (Section 7 Specyfikacji)
-- ============================================================================
INSERT OR IGNORE INTO newsletter_topics (
  id, slug, name_pl, name_en, name_de, description_pl, description_en, description_de, is_active, sort_order
) VALUES
(
  'topic_nowosci_ekocc',
  'nowosci-ekocc',
  'Nowości EkoCC',
  'EkoCC Highlights & News',
  'EkoCC Neuigkeiten',
  'Najważniejsze publikacje, wydarzenia, premiery i komunikaty z całego ekosystemu Christian Culture.',
  'Top publications, events, premieres, and announcements from across the Christian Culture ecosystem.',
  'Wichtigste Veröffentlichungen, Veranstaltungen, Premieren und Mitteilungen aus dem gesamten Christian Culture Ökosystem.',
  1,
  10
),
(
  'topic_muzyka_radio_tv',
  'muzyka-radio-tv',
  'Muzyka, Radio i TV',
  'Music, Radio & TV',
  'Musik, Radio & TV',
  'PolskieRadio.cc, premiery muzyczne, Biblijne Uwielbienie, Gerald Welch, JJ Beauvais, audycje i Kino VOD.',
  'PolskieRadio.cc, music premieres, Biblical Worship, Gerald Welch, JJ Beauvais, broadcasts, and Cinema VOD.',
  'PolskieRadio.cc, Musikpremieren, Biblijne Uwielbienie, Gerald Welch, JJ Beauvais, Sendungen und Kino VOD.',
  1,
  20
),
(
  'topic_biblia_akademia',
  'biblia-akademia',
  'Biblia, Rozważania i Akademia',
  'Bible, Reflections & Academy',
  'Bibel, Andachten & Akademie',
  'MojaBiblia, Kurs Codzienny „Z Biblią za Pan Brat”, rozważania „Dobrze, że jesteś” oraz wykłady Akademii Biblijnej.',
  'MojaBiblia, Daily Bible Course, daily reflections, and Bible Academy lectures.',
  'MojaBiblia, Täglicher Bibelkurs, tägliche Andachten und Vorlesungen der Bibel-Akademie.',
  1,
  30
),
(
  'topic_ksiazki_literatura',
  'ksiazki-literatura',
  'Książki, Literatura i Kultura',
  'Books, Literature & Culture',
  'Bücher, Literatur & Kultur',
  'Powieść „Pardon, Czy To Miłość?”, Biblioteka CC, Your Imagination Studio (YIS), sztuka i publicystyka kulturalna.',
  'Novel "Pardon, Is This Love?", CC Library, Your Imagination Studio (YIS), art, and cultural essays.',
  'Roman „Pardon, Ist Das Liebe?“, CC-Bibliothek, Your Imagination Studio (YIS), Kunst und Kulturpublizistik.',
  1,
  40
),
(
  'topic_rodzina_zdrowie_rozwoj',
  'rodzina-zdrowie-rozwoj',
  'Rodzina, Zdrowie, Kuchnia i Rozwój',
  'Family, Health, Kitchen & Growth',
  'Familie, Gesundheit, Küche & Entwicklung',
  'Praktyczne artykuły o relacjach, wychowaniu, zdrowiu (ZiU), kuchni, finansach domowych i planerze HOLOS.',
  'Practical articles on relationships, parenting, health, kitchen, family finances, and HOLOS planner.',
  'Praktische Artikel über Beziehungen, Familie, Gesundheit, Küche, Finanzen und den HOLOS-Planer.',
  1,
  50
);
