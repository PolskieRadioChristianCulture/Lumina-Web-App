// ============================================================================
// EkoCC / CC NEWSLETTER — Centralny Serwis Backendowy i Adapter D1
// Identyfikatory: CCNL-003, CCNL-005, CCNL-006, CCNL-008
// Standard: ZERO COST, Privacy-by-Design, RODO / PKE Art. 398, RFC 8058
// ============================================================================

import {
  NEWSLETTER_TOPICS_V1,
  getConsentTextSnapshot,
  renderDoiConfirmationEmail,
  renderWelcomeEmail,
  renderManageLinkEmail,
  renderCampaignEmail,
} from './templates.js';

export const DEFAULT_CONSENT_VERSION = '2026-10-30-v1';
export const DEFAULT_PRIVACY_VERSION = '2026-10-30';

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

/**
 * Normalizacja i walidacja adresu e-mail (zachowuje aliasy +tag, np. jan+ekocc@domena.pl)
 */
export function normalizeEmail(rawEmail) {
  if (typeof rawEmail !== 'string') return null;
  const trimmed = rawEmail.trim();
  if (!trimmed || trimmed.length > 254) return null;
  const atIndex = trimmed.lastIndexOf('@');
  if (atIndex <= 0 || atIndex === trimmed.length - 1) return null;
  const localPart = trimmed.slice(0, atIndex);
  const domainPart = trimmed.slice(atIndex + 1).toLowerCase();
  if (localPart.length > 64 || domainPart.length > 253) return null;
  if (localPart.startsWith('.') || localPart.endsWith('.') || localPart.includes('..')) return null;
  const normalized = `${localPart.toLowerCase()}@${domainPart}`;
  if (!EMAIL_REGEX.test(normalized)) return null;
  return {
    normalized,
    display: `${localPart}@${domainPart}`,
  };
}

export function maskEmail(email) {
  const norm = normalizeEmail(email);
  if (!norm) return '***@***';
  const [local, domain] = norm.display.split('@');
  if (local.length <= 2) return `${local[0] || '*'}***@${domain}`;
  return `${local[0]}***${local[local.length - 1]}@${domain}`;
}

export async function sha256Hex(input) {
  const bytes = new TextEncoder().encode(String(input ?? ''));
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function hmacSha256Hex(secret, payload) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(String(secret || 'default-webhook-secret')),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(String(payload ?? '')));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function generateSecureToken(byteLength = 32) {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function generateId(prefix = 'nl') {
  return `${prefix}_${Date.now().toString(36)}_${generateSecureToken(9)}`;
}

/**
 * Walidacja zgodności kampanii przed zatwierdzeniem i wysyłką (Compliance Gate - T18)
 */
export function validateCampaignCompliance(campaign) {
  const errors = [];
  if (!campaign) {
    return { valid: false, errors: ['Brak obiektu kampanii.'] };
  }
  const subjectPl = String(campaign.subject_pl || campaign.subjectPl || '').trim();
  const htmlBody = String(campaign.html_body || campaign.htmlBody || '').trim();
  const textBody = String(campaign.text_body || campaign.textBody || '').trim();

  if (!subjectPl || subjectPl.length < 3) {
    errors.push('MISSING_SUBJECT: Temat wiadomości (PL) jest wymagany (min. 3 znaki).');
  }
  if (!htmlBody || htmlBody.length < 20) {
    errors.push('MISSING_HTML_BODY: Treść HTML kampanii jest wymagana.');
  }
  if (!textBody || textBody.length < 10) {
    errors.push('MISSING_TEXT_BODY: Wersja tekstowa (text/plain) kampanii jest wymagana.');
  }

  // Wymagany link wypisu i zarządzania (w treści szablonu lub przez automatyczną stopkę z tokenem)
  const ExplicitlyForbidsUnsubscribe = campaign.disableFooter === true || htmlBody.includes('<!-- NO_UNSUBSCRIBE -->');
  if (ExplicitlyForbidsUnsubscribe) {
    errors.push('MISSING_UNSUBSCRIBE_LINK: Kampania nie zawiera obowiązkowego linku wypisu (unsubscribe).');
  }
  if (campaign.requireExplicitPlaceholders) {
    if (!htmlBody.includes('{{unsubscribe_url}}') && !htmlBody.includes('/newsletter/unsubscribe')) {
      errors.push('MISSING_UNSUBSCRIBE_LINK: Brak linku {{unsubscribe_url}} lub /newsletter/unsubscribe.');
    }
    if (!htmlBody.includes('{{manage_url}}') && !htmlBody.includes('/newsletter/manage')) {
      errors.push('MISSING_MANAGE_LINK: Brak linku {{manage_url}} lub /newsletter/manage.');
    }
  }

  // Walidacja wszystkich linków href="..." w htmlBody (zakaz javascript:, data:, nieszyfrowanego http://)
  const hrefMatches = [...htmlBody.matchAll(/href\s*=\s*["']([^"']+)["']/gi)];
  for (const match of hrefMatches) {
    const href = match[1].trim();
    if (/^(javascript|vbscript|data):/i.test(href)) {
      errors.push(`UNSAFE_LINK_PROTOCOL: Niedozwolony protokół w linku: ${href}`);
    } else if (/^http:\/\//i.test(href) && !/^http:\/\/(localhost|127\.0\.0\.1)/i.test(href)) {
      errors.push(`INSECURE_HTTP_LINK: Wszystkie linki produkcyjne muszą używać HTTPS: ${href}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Wewnętrzny magazyn relacyjny (obsługuje Cloudflare D1 oraz deterministyczną pamięć dla testów/lokalnego uruchomienia)
 */
export class NewsletterRepository {
  constructor(d1Database = null) {
    this.d1 = d1Database;
    this.initialized = false;
    this.mem = {
      subscribers: new Map(), // id -> row
      topics: new Map(), // id -> row
      preferences: new Map(), // `${subscriber_id}:${topic_id}` -> row
      consentEvents: [], // array of rows
      tokens: new Map(), // token_hash -> row
      campaigns: new Map(), // id -> row
      deliveries: new Map(), // `${campaign_id}:${subscriber_id}` -> row
      suppressions: new Map(), // email_hash -> row
      rateLimits: new Map(), // key -> Array<timestampMs>
      outbox: [], // inspectable queue of generated emails in dry-run / test mode
    };
    this._seedMemoryTopics();
  }

  _seedMemoryTopics() {
    for (const t of NEWSLETTER_TOPICS_V1) {
      this.mem.topics.set(t.id, {
        id: t.id,
        slug: t.slug,
        name_pl: t.namePl,
        name_en: t.nameEn,
        name_de: t.nameDe,
        description_pl: t.descriptionPl,
        description_en: t.descriptionEn,
        description_de: t.descriptionDe,
        is_active: t.isActive ? 1 : 0,
        sort_order: t.sortOrder,
      });
    }
  }

  async ensureInitialized() {
    if (this.initialized) return;
    this.initialized = true;
    if (!this.d1) return;
    try {
      const statements = [
        `CREATE TABLE IF NOT EXISTS newsletter_subscribers (
          id TEXT PRIMARY KEY,
          email_normalized TEXT NOT NULL UNIQUE,
          email_display TEXT NOT NULL,
          first_name TEXT,
          locale TEXT NOT NULL DEFAULT 'pl',
          status TEXT NOT NULL DEFAULT 'pending_confirmation',
          source_portal TEXT NOT NULL DEFAULT 'polskieradio-home',
          source_path TEXT NOT NULL DEFAULT '/',
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          confirmed_at TEXT,
          unsubscribed_at TEXT,
          last_sent_at TEXT
        )`,
        `CREATE TABLE IF NOT EXISTS newsletter_topics (
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
        )`,
        `CREATE TABLE IF NOT EXISTS newsletter_preferences (
          subscriber_id TEXT NOT NULL,
          topic_id TEXT NOT NULL,
          enabled INTEGER NOT NULL DEFAULT 1,
          updated_at TEXT NOT NULL,
          PRIMARY KEY (subscriber_id, topic_id)
        )`,
        `CREATE TABLE IF NOT EXISTS newsletter_consent_events (
          id TEXT PRIMARY KEY,
          subscriber_id TEXT NOT NULL,
          event_type TEXT NOT NULL,
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
        )`,
        `CREATE TABLE IF NOT EXISTS newsletter_tokens (
          id TEXT PRIMARY KEY,
          subscriber_id TEXT NOT NULL,
          purpose TEXT NOT NULL,
          token_hash TEXT NOT NULL UNIQUE,
          expires_at TEXT NOT NULL,
          used_at TEXT,
          created_at TEXT NOT NULL
        )`,
        `CREATE TABLE IF NOT EXISTS newsletter_campaigns (
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
          status TEXT NOT NULL DEFAULT 'draft',
          scheduled_at TEXT,
          sent_at TEXT,
          created_by TEXT NOT NULL DEFAULT 'admin',
          approved_by TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        )`,
        `CREATE TABLE IF NOT EXISTS newsletter_deliveries (
          id TEXT PRIMARY KEY,
          campaign_id TEXT NOT NULL,
          subscriber_id TEXT NOT NULL,
          delivery_type TEXT NOT NULL DEFAULT 'campaign',
          provider_name TEXT NOT NULL DEFAULT 'dry_run',
          provider_message_id TEXT,
          status TEXT NOT NULL DEFAULT 'queued',
          error_code TEXT,
          sent_at TEXT,
          updated_at TEXT NOT NULL,
          UNIQUE(campaign_id, subscriber_id)
        )`,
        `CREATE TABLE IF NOT EXISTS newsletter_suppressions (
          email_hash TEXT PRIMARY KEY,
          reason TEXT NOT NULL,
          created_at TEXT NOT NULL,
          expires_at TEXT NOT NULL
        )`,
      ];
      for (const sql of statements) {
        await this.d1.prepare(sql).run();
      }
      for (const t of NEWSLETTER_TOPICS_V1) {
        await this.d1
          .prepare(
            `INSERT OR IGNORE INTO newsletter_topics (id, slug, name_pl, name_en, name_de, description_pl, description_en, description_de, is_active, sort_order)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`
          )
          .bind(t.id, t.slug, t.namePl, t.nameEn, t.nameDe, t.descriptionPl, t.descriptionEn, t.descriptionDe, t.sortOrder)
          .run();
      }
    } catch (err) {
      console.error('[CC-Newsletter] D1 init fallback to memory:', err);
      this.d1 = null;
    }
  }

  checkRateLimit(key, maxHits, windowMs, nowMs = Date.now()) {
    const timestamps = (this.mem.rateLimits.get(key) || []).filter((ts) => nowMs - ts < windowMs);
    if (timestamps.length >= maxHits) {
      this.mem.rateLimits.set(key, timestamps);
      return false;
    }
    timestamps.push(nowMs);
    this.mem.rateLimits.set(key, timestamps);
    return true;
  }

  async getTopics() {
    await this.ensureInitialized();
    if (this.d1) {
      const { results } = await this.d1
        .prepare('SELECT * FROM newsletter_topics WHERE is_active = 1 ORDER BY sort_order ASC')
        .all();
      if (results && results.length > 0) return results;
    }
    return [...this.mem.topics.values()].filter((t) => t.is_active === 1).sort((a, b) => a.sort_order - b.sort_order);
  }

  async findSubscriberByEmail(emailNormalized) {
    await this.ensureInitialized();
    if (this.d1) {
      return await this.d1
        .prepare('SELECT * FROM newsletter_subscribers WHERE email_normalized = ?')
        .bind(emailNormalized)
        .first();
    }
    for (const sub of this.mem.subscribers.values()) {
      if (sub.email_normalized === emailNormalized) return { ...sub };
    }
    return null;
  }

  async findSubscriberById(id) {
    await this.ensureInitialized();
    if (this.d1) {
      return await this.d1.prepare('SELECT * FROM newsletter_subscribers WHERE id = ?').bind(id).first();
    }
    const sub = this.mem.subscribers.get(id);
    return sub ? { ...sub } : null;
  }

  async upsertSubscriber(record) {
    await this.ensureInitialized();
    if (this.d1) {
      await this.d1
        .prepare(
          `INSERT INTO newsletter_subscribers (
            id, email_normalized, email_display, first_name, locale, status, source_portal, source_path,
            created_at, updated_at, confirmed_at, unsubscribed_at, last_sent_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(email_normalized) DO UPDATE SET
            email_display = excluded.email_display,
            first_name = COALESCE(excluded.first_name, newsletter_subscribers.first_name),
            locale = excluded.locale,
            status = excluded.status,
            source_portal = excluded.source_portal,
            source_path = excluded.source_path,
            updated_at = excluded.updated_at,
            confirmed_at = excluded.confirmed_at,
            unsubscribed_at = excluded.unsubscribed_at,
            last_sent_at = excluded.last_sent_at`
        )
        .bind(
          record.id,
          record.email_normalized,
          record.email_display,
          record.first_name ?? null,
          record.locale,
          record.status,
          record.source_portal,
          record.source_path,
          record.created_at,
          record.updated_at,
          record.confirmed_at ?? null,
          record.unsubscribed_at ?? null,
          record.last_sent_at ?? null
        )
        .run();
      return await this.findSubscriberByEmail(record.email_normalized);
    }
    const existing = await this.findSubscriberByEmail(record.email_normalized);
    const id = existing ? existing.id : record.id;
    const merged = {
      ...(existing || {}),
      ...record,
      id,
    };
    this.mem.subscribers.set(id, merged);
    return { ...merged };
  }

  async updateSubscriberStatus(subscriberId, fields) {
    await this.ensureInitialized();
    const existing = await this.findSubscriberById(subscriberId);
    if (!existing) return null;
    const updated = {
      ...existing,
      ...fields,
      updated_at: fields.updated_at || new Date().toISOString(),
    };
    if (this.d1) {
      await this.d1
        .prepare(
          `UPDATE newsletter_subscribers
           SET status = ?, updated_at = ?, confirmed_at = ?, unsubscribed_at = ?, last_sent_at = ?, locale = ?, first_name = ?
           WHERE id = ?`
        )
        .bind(
          updated.status,
          updated.updated_at,
          updated.confirmed_at ?? null,
          updated.unsubscribed_at ?? null,
          updated.last_sent_at ?? null,
          updated.locale,
          updated.first_name ?? null,
          subscriberId
        )
        .run();
    } else {
      this.mem.subscribers.set(subscriberId, updated);
    }
    return updated;
  }

  async setSubscriberTopics(subscriberId, topicSlugsOrIds = [], nowIso = new Date().toISOString()) {
    await this.ensureInitialized();
    const allTopics = await this.getTopics();
    const selectedIds = new Set();
    for (const raw of topicSlugsOrIds) {
      const match = allTopics.find((t) => t.slug === raw || t.id === raw);
      if (match) selectedIds.add(match.id);
    }
    if (selectedIds.size === 0 && allTopics.length > 0) {
      selectedIds.add(allTopics[0].id);
    }

    for (const topic of allTopics) {
      const enabled = selectedIds.has(topic.id) ? 1 : 0;
      if (this.d1) {
        await this.d1
          .prepare(
            `INSERT INTO newsletter_preferences (subscriber_id, topic_id, enabled, updated_at)
             VALUES (?, ?, ?, ?)
             ON CONFLICT(subscriber_id, topic_id) DO UPDATE SET enabled = excluded.enabled, updated_at = excluded.updated_at`
          )
          .bind(subscriberId, topic.id, enabled, nowIso)
          .run();
      } else {
        this.mem.preferences.set(`${subscriberId}:${topic.id}`, {
          subscriber_id: subscriberId,
          topic_id: topic.id,
          enabled,
          updated_at: nowIso,
        });
      }
    }
  }

  async getSubscriberTopics(subscriberId) {
    await this.ensureInitialized();
    const allTopics = await this.getTopics();
    if (this.d1) {
      const { results } = await this.d1
        .prepare('SELECT topic_id, enabled FROM newsletter_preferences WHERE subscriber_id = ?')
        .bind(subscriberId)
        .all();
      const enabledIds = new Set((results || []).filter((r) => Number(r.enabled) === 1).map((r) => r.topic_id));
      return allTopics.filter((t) => enabledIds.has(t.id)).map((t) => t.slug);
    }
    const slugs = [];
    for (const topic of allTopics) {
      const pref = this.mem.preferences.get(`${subscriberId}:${topic.id}`);
      if (pref && pref.enabled === 1) slugs.push(topic.slug);
    }
    return slugs;
  }

  async addConsentEvent(event) {
    await this.ensureInitialized();
    const row = {
      id: event.id || generateId('ce'),
      subscriber_id: event.subscriber_id,
      event_type: event.event_type,
      consent_version: event.consent_version || DEFAULT_CONSENT_VERSION,
      consent_text_snapshot: event.consent_text_snapshot || '',
      privacy_policy_version: event.privacy_policy_version || DEFAULT_PRIVACY_VERSION,
      source_portal: event.source_portal || 'polskieradio-home',
      source_path: event.source_path || '/',
      locale: event.locale || 'pl',
      ip_hash: event.ip_hash || '',
      user_agent_hash: event.user_agent_hash || '',
      metadata_json: typeof event.metadata === 'string' ? event.metadata : JSON.stringify(event.metadata || {}),
      created_at: event.created_at || new Date().toISOString(),
    };
    if (this.d1) {
      await this.d1
        .prepare(
          `INSERT INTO newsletter_consent_events (
            id, subscriber_id, event_type, consent_version, consent_text_snapshot, privacy_policy_version,
            source_portal, source_path, locale, ip_hash, user_agent_hash, metadata_json, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(
          row.id,
          row.subscriber_id,
          row.event_type,
          row.consent_version,
          row.consent_text_snapshot,
          row.privacy_policy_version,
          row.source_portal,
          row.source_path,
          row.locale,
          row.ip_hash,
          row.user_agent_hash,
          row.metadata_json,
          row.created_at
        )
        .run();
    } else {
      this.mem.consentEvents.push(row);
    }
    return row;
  }

  async getConsentEvents(subscriberId) {
    await this.ensureInitialized();
    if (this.d1) {
      const { results } = await this.d1
        .prepare('SELECT * FROM newsletter_consent_events WHERE subscriber_id = ? ORDER BY created_at ASC')
        .bind(subscriberId)
        .all();
      return results || [];
    }
    return this.mem.consentEvents.filter((e) => e.subscriber_id === subscriberId);
  }

  async createToken({ subscriberId, purpose, tokenHash, expiresAt, createdAt = new Date().toISOString() }) {
    await this.ensureInitialized();
    const row = {
      id: generateId('tok'),
      subscriber_id: subscriberId,
      purpose,
      token_hash: tokenHash,
      expires_at: expiresAt,
      used_at: null,
      created_at: createdAt,
    };
    if (this.d1) {
      await this.d1
        .prepare(
          `INSERT INTO newsletter_tokens (id, subscriber_id, purpose, token_hash, expires_at, used_at, created_at)
           VALUES (?, ?, ?, ?, ?, NULL, ?)`
        )
        .bind(row.id, row.subscriber_id, row.purpose, row.token_hash, row.expires_at, row.created_at)
        .run();
    } else {
      this.mem.tokens.set(tokenHash, row);
    }
    return row;
  }

  async findTokenByHash(tokenHash, purpose = null) {
    await this.ensureInitialized();
    if (this.d1) {
      if (purpose) {
        return await this.d1
          .prepare('SELECT * FROM newsletter_tokens WHERE token_hash = ? AND purpose = ?')
          .bind(tokenHash, purpose)
          .first();
      }
      return await this.d1.prepare('SELECT * FROM newsletter_tokens WHERE token_hash = ?').bind(tokenHash).first();
    }
    const row = this.mem.tokens.get(tokenHash);
    if (!row) return null;
    if (purpose && row.purpose !== purpose) return null;
    return { ...row };
  }

  async markTokenUsed(tokenHash, usedAt = new Date().toISOString()) {
    await this.ensureInitialized();
    if (this.d1) {
      const res = await this.d1
        .prepare('UPDATE newsletter_tokens SET used_at = ? WHERE token_hash = ? AND used_at IS NULL')
        .bind(usedAt, tokenHash)
        .run();
      return !!(res && res.meta && res.meta.changes > 0);
    }
    const row = this.mem.tokens.get(tokenHash);
    if (!row || row.used_at) return false;
    row.used_at = usedAt;
    this.mem.tokens.set(tokenHash, row);
    return true;
  }

  async addSuppression(emailHash, reason, createdAt = new Date().toISOString()) {
    await this.ensureInitialized();
    const expiresDate = new Date(new Date(createdAt).getTime() + 3 * 365 * 86400000).toISOString();
    const row = {
      email_hash: emailHash,
      reason,
      created_at: createdAt,
      expires_at: expiresDate,
    };
    if (this.d1) {
      await this.d1
        .prepare(
          `INSERT INTO newsletter_suppressions (email_hash, reason, created_at, expires_at)
           VALUES (?, ?, ?, ?)
           ON CONFLICT(email_hash) DO UPDATE SET reason = excluded.reason, created_at = excluded.created_at, expires_at = excluded.expires_at`
        )
        .bind(row.email_hash, row.reason, row.created_at, row.expires_at)
        .run();
    } else {
      this.mem.suppressions.set(emailHash, row);
    }
    return row;
  }

  async removeSuppression(emailHash) {
    await this.ensureInitialized();
    if (this.d1) {
      await this.d1.prepare('DELETE FROM newsletter_suppressions WHERE email_hash = ?').bind(emailHash).run();
    } else {
      this.mem.suppressions.delete(emailHash);
    }
  }

  async getSuppression(emailHash) {
    await this.ensureInitialized();
    if (this.d1) {
      return await this.d1
        .prepare('SELECT * FROM newsletter_suppressions WHERE email_hash = ?')
        .bind(emailHash)
        .first();
    }
    return this.mem.suppressions.get(emailHash) || null;
  }

  async cancelPendingDeliveriesForSubscriber(subscriberId, nowIso = new Date().toISOString()) {
    await this.ensureInitialized();
    if (this.d1) {
      await this.d1
        .prepare(
          `UPDATE newsletter_deliveries
           SET status = 'skipped_unsubscribed', updated_at = ?
           WHERE subscriber_id = ? AND status IN ('queued', 'dry_run_queued')`
        )
        .bind(nowIso, subscriberId)
        .run();
    } else {
      for (const [key, del] of this.mem.deliveries.entries()) {
        if (del.subscriber_id === subscriberId && ['queued', 'dry_run_queued'].includes(del.status)) {
          del.status = 'skipped_unsubscribed';
          del.updated_at = nowIso;
          this.mem.deliveries.set(key, del);
        }
      }
    }
  }

  async saveCampaign(campaign) {
    await this.ensureInitialized();
    const nowIso = new Date().toISOString();
    const row = {
      id: campaign.id || generateId('camp'),
      slug: campaign.slug || `kampania-${Date.now().toString(36)}`,
      subject_pl: campaign.subject_pl || campaign.subjectPl || '',
      subject_en: campaign.subject_en || campaign.subjectEn || '',
      preheader_pl: campaign.preheader_pl || campaign.preheaderPl || '',
      preheader_en: campaign.preheader_en || campaign.preheaderEn || '',
      topic_filter_json:
        typeof campaign.topic_filter_json === 'string'
          ? campaign.topic_filter_json
          : JSON.stringify(campaign.topics || campaign.topicFilter || ['nowosci-ekocc']),
      locale_filter: campaign.locale_filter || campaign.localeFilter || 'all',
      html_body: campaign.html_body || campaign.htmlBody || '',
      text_body: campaign.text_body || campaign.textBody || '',
      status: campaign.status || 'draft',
      scheduled_at: campaign.scheduled_at || null,
      sent_at: campaign.sent_at || null,
      created_by: campaign.created_by || 'admin',
      approved_by: campaign.approved_by || null,
      created_at: campaign.created_at || nowIso,
      updated_at: nowIso,
    };

    if (this.d1) {
      await this.d1
        .prepare(
          `INSERT INTO newsletter_campaigns (
            id, slug, subject_pl, subject_en, preheader_pl, preheader_en, topic_filter_json, locale_filter,
            html_body, text_body, status, scheduled_at, sent_at, created_by, approved_by, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            subject_pl = excluded.subject_pl,
            subject_en = excluded.subject_en,
            preheader_pl = excluded.preheader_pl,
            preheader_en = excluded.preheader_en,
            topic_filter_json = excluded.topic_filter_json,
            locale_filter = excluded.locale_filter,
            html_body = excluded.html_body,
            text_body = excluded.text_body,
            status = excluded.status,
            approved_by = excluded.approved_by,
            sent_at = excluded.sent_at,
            updated_at = excluded.updated_at`
        )
        .bind(
          row.id,
          row.slug,
          row.subject_pl,
          row.subject_en,
          row.preheader_pl,
          row.preheader_en,
          row.topic_filter_json,
          row.locale_filter,
          row.html_body,
          row.text_body,
          row.status,
          row.scheduled_at,
          row.sent_at,
          row.created_by,
          row.approved_by,
          row.created_at,
          row.updated_at
        )
        .run();
    } else {
      this.mem.campaigns.set(row.id, row);
    }
    return row;
  }

  async getCampaignById(id) {
    await this.ensureInitialized();
    if (this.d1) {
      return await this.d1.prepare('SELECT * FROM newsletter_campaigns WHERE id = ?').bind(id).first();
    }
    const c = this.mem.campaigns.get(id);
    return c ? { ...c } : null;
  }

  async listCampaigns() {
    await this.ensureInitialized();
    if (this.d1) {
      const { results } = await this.d1
        .prepare('SELECT * FROM newsletter_campaigns ORDER BY created_at DESC LIMIT 50')
        .all();
      return results || [];
    }
    return [...this.mem.campaigns.values()].sort((a, b) => b.created_at.localeCompare(a.created_at));
  }

  async recordDelivery(delivery) {
    await this.ensureInitialized();
    const key = `${delivery.campaign_id}:${delivery.subscriber_id}`;
    const nowIso = delivery.updated_at || new Date().toISOString();
    const row = {
      id: delivery.id || generateId('dlv'),
      campaign_id: delivery.campaign_id,
      subscriber_id: delivery.subscriber_id,
      delivery_type: delivery.delivery_type || 'campaign',
      provider_name: delivery.provider_name || 'dry_run',
      provider_message_id: delivery.provider_message_id || null,
      status: delivery.status || 'dry_run_queued',
      error_code: delivery.error_code || null,
      sent_at: delivery.sent_at || nowIso,
      updated_at: nowIso,
    };
    if (this.d1) {
      const res = await this.d1
        .prepare(
          `INSERT OR IGNORE INTO newsletter_deliveries (
            id, campaign_id, subscriber_id, delivery_type, provider_name, provider_message_id, status, error_code, sent_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(
          row.id,
          row.campaign_id,
          row.subscriber_id,
          row.delivery_type,
          row.provider_name,
          row.provider_message_id,
          row.status,
          row.error_code,
          row.sent_at,
          row.updated_at
        )
        .run();
      const inserted = !!(res && res.meta && res.meta.changes > 0);
      return { inserted, row };
    }
    if (this.mem.deliveries.has(key)) {
      return { inserted: false, row: this.mem.deliveries.get(key) };
    }
    this.mem.deliveries.set(key, row);
    return { inserted: true, row };
  }

  async getDeliveriesForCampaign(campaignId) {
    await this.ensureInitialized();
    if (this.d1) {
      const { results } = await this.d1
        .prepare('SELECT * FROM newsletter_deliveries WHERE campaign_id = ?')
        .bind(campaignId)
        .all();
      return results || [];
    }
    return [...this.mem.deliveries.values()].filter((d) => d.campaign_id === campaignId);
  }

  async listActiveSubscribersForCampaign({ topicSlugs = [], localeFilter = 'all' }) {
    await this.ensureInitialized();
    let activeSubs = [];
    if (this.d1) {
      const { results } = await this.d1
        .prepare("SELECT * FROM newsletter_subscribers WHERE status = 'active'")
        .all();
      activeSubs = results || [];
    } else {
      activeSubs = [...this.mem.subscribers.values()].filter((s) => s.status === 'active');
    }

    const eligible = [];
    for (const sub of activeSubs) {
      if (localeFilter && localeFilter !== 'all' && sub.locale !== localeFilter) continue;
      const emailHash = await sha256Hex(sub.email_normalized);
      const suppressed = await this.getSuppression(emailHash);
      if (suppressed) continue;
      if (topicSlugs && topicSlugs.length > 0) {
        const subTopics = await this.getSubscriberTopics(sub.id);
        const hasMatch = topicSlugs.some((slug) => subTopics.includes(slug));
        if (!hasMatch) continue;
      }
      eligible.push(sub);
    }
    return eligible;
  }

  async eraseSubscriberPersonalData(subscriberId, emailHash, nowIso = new Date().toISOString()) {
    await this.ensureInitialized();
    const anonymizedEmail = `erased_${subscriberId}@erased.invalid`;
    if (this.d1) {
      await this.d1
        .prepare(
          `UPDATE newsletter_subscribers
           SET email_normalized = ?, email_display = '[USUNIĘTO RODO]', first_name = NULL, status = 'suppressed', unsubscribed_at = ?, updated_at = ?
           WHERE id = ?`
        )
        .bind(anonymizedEmail, nowIso, nowIso, subscriberId)
        .run();
      await this.d1.prepare('DELETE FROM newsletter_tokens WHERE subscriber_id = ?').bind(subscriberId).run();
      await this.d1.prepare('DELETE FROM newsletter_preferences WHERE subscriber_id = ?').bind(subscriberId).run();
    } else {
      const sub = this.mem.subscribers.get(subscriberId);
      if (sub) {
        sub.email_normalized = anonymizedEmail;
        sub.email_display = '[USUNIĘTO RODO]';
        sub.first_name = null;
        sub.status = 'suppressed';
        sub.unsubscribed_at = nowIso;
        sub.updated_at = nowIso;
        this.mem.subscribers.set(subscriberId, sub);
      }
      for (const [hash, tok] of this.mem.tokens.entries()) {
        if (tok.subscriber_id === subscriberId) this.mem.tokens.delete(hash);
      }
      for (const key of this.mem.preferences.keys()) {
        if (key.startsWith(`${subscriberId}:`)) this.mem.preferences.delete(key);
      }
    }
    await this.addSuppression(emailHash, 'gdpr_erasure', nowIso);
  }

  async getPublicStats() {
    // A public count must come from persistent storage, never a process-local demo.
    // This read path does not create tables or mutate consent/subscription state.
    if (!this.d1) throw new Error('PublicStatsUnavailable');
    const row = await this.d1.prepare("SELECT COUNT(DISTINCT email_normalized) AS active_count FROM newsletter_subscribers WHERE status = 'active' AND confirmed_at IS NOT NULL AND confirmed_at <> '' AND unsubscribed_at IS NULL").first();
    const count = row?.active_count;
    if (!Number.isSafeInteger(count) || count < 0) throw new Error('PublicStatsUnavailable');
    return {
      confirmed_active_subscribers: count >= 10 ? count : null,
      display: count >= 10 ? 'count' : 'community',
      updated_at: new Date().toISOString(),
    };
  }

  async getStatsSummary() {
    await this.ensureInitialized();
    let subscribers = [];
    if (this.d1) {
      const { results } = await this.d1.prepare('SELECT status, locale, source_portal FROM newsletter_subscribers').all();
      subscribers = results || [];
    } else {
      subscribers = [...this.mem.subscribers.values()];
    }
    const counts = {
      total: subscribers.length,
      active: subscribers.filter((s) => s.status === 'active').length,
      pending_confirmation: subscribers.filter((s) => s.status === 'pending_confirmation').length,
      unsubscribed: subscribers.filter((s) => s.status === 'unsubscribed').length,
      bounced: subscribers.filter((s) => s.status === 'bounced').length,
      complained: subscribers.filter((s) => s.status === 'complained').length,
      suppressed: subscribers.filter((s) => s.status === 'suppressed').length,
    };
    const campaigns = await this.listCampaigns();
    return { counts, campaigns };
  }
}

/**
 * Główny serwis aplikacyjny Newslettera EkoCC
 */
export class NewsletterService {
  constructor({ repo = new NewsletterRepository(), env = {}, nowFn = () => new Date() } = {}) {
    this.repo = repo;
    this.env = env;
    this.nowFn = nowFn;
  }

  isDeliveryEnabled() {
    return String(this.env.NEWSLETTER_DELIVERY_ENABLED || 'false').toLowerCase() === 'true';
  }

  getBaseUrl(requestUrl) {
    if (this.env.NEWSLETTER_PUBLIC_BASE_URL) {
      return String(this.env.NEWSLETTER_PUBLIC_BASE_URL).replace(/\/$/, '');
    }
    if (requestUrl) {
      try {
        const u = new URL(requestUrl);
        return u.origin;
      } catch {
        // fallback
      }
    }
    return 'https://polskieradio.cc';
  }

  getConsentVersion() {
    return this.env.NEWSLETTER_CONSENT_VERSION || DEFAULT_CONSENT_VERSION;
  }

  getNeutralSubscribeMessage(locale = 'pl') {
    if (locale === 'en') {
      return 'Your request has been received. Check your inbox for a confirmation link. A subscription becomes active only after confirmation.';
    }
    if (locale === 'de') {
      return 'Ihre Anfrage wurde angenommen. Prüfen Sie Ihr Postfach auf einen Bestätigungslink. Das Abonnement wird erst nach der Bestätigung aktiv.';
    }
    return 'Przyjęliśmy prośbę. Sprawdź skrzynkę w poszukiwaniu linku. Zapis staje się aktywny dopiero po potwierdzeniu.';
  }

  async hashClientContext(ip = '', userAgent = '') {
    const salt = this.env.NEWSLETTER_HASH_SALT || 'ekocc-newsletter-privacy-salt-2026';
    const ipHash = await sha256Hex(`${salt}|ip|${ip || 'unknown'}`);
    const uaHash = await sha256Hex(`${salt}|ua|${userAgent || 'unknown'}`);
    return { ipHash, uaHash };
  }

  async _dispatchEmail({ to, subject, html, text, headers = {}, campaignId, subscriberId, deliveryType }) {
    const nowIso = this.nowFn().toISOString();
    const deliveryEnabled = this.isDeliveryEnabled();
    const providerName = deliveryEnabled ? (this.env.NEWSLETTER_PROVIDER || 'gmail_smtp') : 'dry_run';
    let status = deliveryEnabled ? 'sent' : 'dry_run_queued';
    let providerMessageId = `msg_${generateSecureToken(8)}`;

    if (deliveryEnabled && (providerName === 'gmail_smtp' || !this.env.NEWSLETTER_PROVIDER)) {
      try {
        const { dispatchGmailEmail } = await import('./gmail-smtp-client.js');
        const sendRes = await dispatchGmailEmail({
          toEmail: to,
          subject,
          text,
          html,
          headers,
          deliveryType,
        }, this.env);
        if (sendRes?.messageId) {
          providerMessageId = sendRes.messageId;
        }
        status = 'delivered';
      } catch (sendErr) {
        console.error('[CC Newsletter] Gmail SMTP dispatch error:', sendErr.message);
        status = 'failed';
      }
    }

    const recorded = await this.repo.recordDelivery({
      campaign_id: campaignId || `${deliveryType}_${Date.now()}`,
      subscriber_id: subscriberId,
      delivery_type: deliveryType,
      provider_name: providerName,
      provider_message_id: providerMessageId,
      status,
      sent_at: nowIso,
      updated_at: nowIso,
    });

    if (recorded.inserted) {
      this.repo.mem.outbox.push({
        to,
        subject,
        html,
        text,
        headers,
        deliveryType,
        campaignId,
        subscriberId,
        status,
        createdAt: nowIso,
      });
    }

    return recorded;
  }

  /**
   * Zapis na newsletter (Double Opt-In) - POST /api/newsletter/subscribe
   */
  async subscribe(payload = {}, clientMeta = {}) {
    const locale = ['pl', 'en', 'de'].includes(payload.locale) ? payload.locale : 'pl';
    const consentVersion = payload.consentVersion || this.getConsentVersion();

    // 1. Pułapka antybotowa (honeypot): cicha neutralna odpowiedź bez zapisu w bazie
    if (payload.websiteUrl || payload.hp) {
      return {
        status: 200,
        body: {
          ok: true,
          neutral: true,
          message: this.getNeutralSubscribeMessage(locale),
          consentVersion,
        },
      };
    }

    // 2. Walidacja adresu e-mail
    const emailObj = normalizeEmail(payload.email);
    if (!emailObj) {
      return {
        status: 400,
        body: {
          ok: false,
          error: 'INVALID_EMAIL',
          message:
            locale === 'en'
              ? 'Please enter a valid email address.'
              : 'Podaj poprawny adres e-mail (np. imie@domena.pl).',
        },
      };
    }

    // 3. Obowiązkowy, domyślnie odznaczony checkbox zgody (T01, T02)
    if (payload.consentAccepted !== true) {
      return {
        status: 400,
        body: {
          ok: false,
          error: 'CONSENT_REQUIRED',
          message:
            locale === 'en'
              ? 'Please accept the newsletter consent checkbox before subscribing.'
              : 'Zaznacz zgodę na otrzymywanie newslettera, aby kontynuować zapis.',
        },
      };
    }

    // 4. Walidacja kategorii tematycznych v1
    const rawTopics = Array.isArray(payload.topics) && payload.topics.length > 0 ? payload.topics : ['nowosci-ekocc'];
    const validSlugs = new Set(NEWSLETTER_TOPICS_V1.map((t) => t.slug));
    const selectedTopics = rawTopics.filter((slug) => validSlugs.has(slug));
    if (selectedTopics.length === 0) {
      return {
        status: 400,
        body: {
          ok: false,
          error: 'INVALID_TOPICS',
          message:
            locale === 'en'
              ? 'Select at least one valid newsletter topic.'
              : 'Wybierz przynajmniej jedną kategorię tematyczną newslettera.',
        },
      };
    }

    // 5. Rate limiting per IP oraz per e-mail (T15)
    const nowMs = this.nowFn().getTime();
    const nowIso = new Date(nowMs).toISOString();
    const { ipHash, uaHash } = await this.hashClientContext(clientMeta.ip, clientMeta.userAgent);
    const emailHash = await sha256Hex(emailObj.normalized);

    const ipAllowed = this.repo.checkRateLimit(`ip:${ipHash}`, 8, 10 * 60 * 1000, nowMs);
    const emailAllowed = this.repo.checkRateLimit(`email:${emailHash}`, 3, 15 * 60 * 1000, nowMs);
    if (!ipAllowed || !emailAllowed) {
      return {
        status: 429,
        body: {
          ok: false,
          error: 'RATE_LIMITED',
          message:
            locale === 'en'
              ? 'Too many requests. Please wait a few minutes and try again.'
              : 'Zbyt wiele prób zapisu w krótkim czasie. Odczekaj kilka minut i spróbuj ponownie.',
        },
      };
    }

    const sourcePortal = String(payload.sourcePortal || 'polskieradio-home')
      .replace(/[^a-zA-Z0-9._-]/g, '')
      .slice(0, 64) || 'polskieradio-home';
    const sourcePath = String(payload.sourcePath || '/').slice(0, 180) || '/';
    const firstName = payload.firstName ? String(payload.firstName).trim().slice(0, 80) : null;

    // 6. Sprawdź czy adres jest na twardej liście supresji (hard_bounce / spam_complaint / manual_block)
    const suppression = await this.repo.getSuppression(emailHash);
    if (suppression && ['hard_bounce', 'spam_complaint', 'manual_block'].includes(suppression.reason)) {
      return {
        status: 200,
        body: {
          ok: true,
          neutral: true,
          message: this.getNeutralSubscribeMessage(locale),
          consentVersion,
        },
      };
    }

    const existing = await this.repo.findSubscriberByEmail(emailObj.normalized);
    const baseUrl = this.getBaseUrl(clientMeta.requestUrl);

    // 7. Jeśli subskrybent jest już AKTYWNY (T04) -> zaktualizuj preferencje lub wyślij link zarządzania, bez duplikacji!
    if (existing && existing.status === 'active') {
      await this.repo.setSubscriberTopics(existing.id, selectedTopics, nowIso);
      await this.repo.addConsentEvent({
        subscriber_id: existing.id,
        event_type: 'preferences_updated',
        consent_version: consentVersion,
        consent_text_snapshot: getConsentTextSnapshot(locale, consentVersion),
        privacy_policy_version: DEFAULT_PRIVACY_VERSION,
        source_portal: sourcePortal,
        source_path: sourcePath,
        locale,
        ip_hash: ipHash,
        user_agent_hash: uaHash,
        metadata: { topics: selectedTopics, via: 'subscribe_existing_active' },
        created_at: nowIso,
      });

      const rawManageToken = generateSecureToken(32);
      const manageTokenHash = await sha256Hex(rawManageToken);
      const manageExpires = new Date(nowMs + 30 * 60 * 1000).toISOString();
      await this.repo.createToken({
        subscriberId: existing.id,
        purpose: 'manage',
        tokenHash: manageTokenHash,
        expiresAt: manageExpires,
        createdAt: nowIso,
      });

      const rawUnsubToken = generateSecureToken(32);
      const unsubTokenHash = await sha256Hex(rawUnsubToken);
      const unsubExpires = new Date(nowMs + 90 * 86400 * 1000).toISOString();
      await this.repo.createToken({
        subscriberId: existing.id,
        purpose: 'unsubscribe',
        tokenHash: unsubTokenHash,
        expiresAt: unsubExpires,
        createdAt: nowIso,
      });

      const manageMail = renderManageLinkEmail({
        manageUrl: `${baseUrl}/newsletter/manage?token=${encodeURIComponent(rawManageToken)}`,
        unsubscribeUrl: `${baseUrl}/newsletter/unsubscribe?token=${encodeURIComponent(rawUnsubToken)}`,
        locale,
      });
      await this._dispatchEmail({
        to: existing.email_display,
        subject: manageMail.subject,
        html: manageMail.html,
        text: manageMail.text,
        campaignId: `manage_${nowMs}`,
        subscriberId: existing.id,
        deliveryType: 'manage_link',
      });

      return {
        status: 200,
        body: {
          ok: true,
          neutral: true,
          message: this.getNeutralSubscribeMessage(locale),
          consentVersion,
        },
      };
    }

    // 8. Nowy subskrybent, pending_confirmation lub ponowny zapis po unsubscribed (T03, T12)
    // Zawsze ustawia status = 'pending_confirmation' i wymaga potwierdzenia DOI!
    const isResubscribe = existing && existing.status === 'unsubscribed';
    const subscriber = await this.repo.upsertSubscriber({
      id: existing ? existing.id : generateId('sub'),
      email_normalized: emailObj.normalized,
      email_display: emailObj.display,
      first_name: firstName ?? existing?.first_name ?? null,
      locale,
      status: 'pending_confirmation',
      source_portal: sourcePortal,
      source_path: sourcePath,
      created_at: existing ? existing.created_at : nowIso,
      updated_at: nowIso,
      confirmed_at: null,
      unsubscribed_at: existing?.unsubscribed_at ?? null,
      last_sent_at: existing?.last_sent_at ?? null,
    });

    await this.repo.setSubscriberTopics(subscriber.id, selectedTopics, nowIso);

    await this.repo.addConsentEvent({
      subscriber_id: subscriber.id,
      event_type: isResubscribe ? 're_subscribe_requested' : 'subscribe_requested',
      consent_version: consentVersion,
      consent_text_snapshot: getConsentTextSnapshot(locale, consentVersion),
      privacy_policy_version: DEFAULT_PRIVACY_VERSION,
      source_portal: sourcePortal,
      source_path: sourcePath,
      locale,
      ip_hash: ipHash,
      user_agent_hash: uaHash,
      metadata: { topics: selectedTopics },
      created_at: nowIso,
    });

    // Wygeneruj jednorazowy token DOI (ważny 48h), zapisz wyłącznie skrót SHA-256 w bazie (T16)
    const rawConfirmToken = generateSecureToken(32);
    const confirmTokenHash = await sha256Hex(rawConfirmToken);
    const confirmExpires = new Date(nowMs + 48 * 3600 * 1000).toISOString();
    await this.repo.createToken({
      subscriberId: subscriber.id,
      purpose: 'confirm',
      tokenHash: confirmTokenHash,
      expiresAt: confirmExpires,
      createdAt: nowIso,
    });

    const confirmUrl = `${baseUrl}/newsletter/confirm?token=${encodeURIComponent(rawConfirmToken)}`;
    const doiEmail = renderDoiConfirmationEmail({
      firstName: subscriber.first_name,
      confirmUrl,
      sourcePortal,
      topicSlugs: selectedTopics,
      locale,
      expiresHours: 48,
    });

    await this._dispatchEmail({
      to: subscriber.email_display,
      subject: doiEmail.subject,
      html: doiEmail.html,
      text: doiEmail.text,
      campaignId: `doi_${rawConfirmToken.slice(0, 12)}`,
      subscriberId: subscriber.id,
      deliveryType: 'doi_confirm',
    });

    return {
      status: 200,
      body: {
        ok: true,
        neutral: true,
        message: this.getNeutralSubscribeMessage(locale),
        consentVersion,
      },
    };
  }

  /**
   * Bezpieczna weryfikacja tokenu na żądaniu GET (Read-Only - ochrona przed skanerami poczty T06)
   */
  async inspectToken(rawToken, purpose = 'confirm') {
    if (!rawToken || typeof rawToken !== 'string' || rawToken.length < 16) {
      return { status: 400, body: { ok: false, error: 'INVALID_TOKEN', valid: false } };
    }
    const tokenHash = await sha256Hex(rawToken.trim());
    const tokenRow = await this.repo.findTokenByHash(tokenHash, purpose);
    if (!tokenRow) {
      return { status: 400, body: { ok: false, error: 'TOKEN_NOT_FOUND', valid: false } };
    }
    if (tokenRow.used_at && purpose !== 'unsubscribe') {
      return { status: 400, body: { ok: false, error: 'TOKEN_ALREADY_USED', valid: false } };
    }
    const nowIso = this.nowFn().toISOString();
    if (tokenRow.expires_at <= nowIso) {
      return { status: 400, body: { ok: false, error: 'TOKEN_EXPIRED', valid: false } };
    }
    const subscriber = await this.repo.findSubscriberById(tokenRow.subscriber_id);
    if (!subscriber) {
      return { status: 400, body: { ok: false, error: 'SUBSCRIBER_NOT_FOUND', valid: false } };
    }
    const topics = await this.repo.getSubscriberTopics(subscriber.id);
    return {
      status: 200,
      body: {
        ok: true,
        valid: true,
        purpose,
        maskedEmail: maskEmail(subscriber.email_display),
        locale: subscriber.locale,
        subscriberStatus: subscriber.status,
        topics,
      },
    };
  }

  /**
   * Finalizacja Double Opt-In przez POST /api/newsletter/confirm (T07, T08)
   */
  async confirmSubscription(rawToken, clientMeta = {}) {
    const check = await this.inspectToken(rawToken, 'confirm');
    if (check.status !== 200) {
      return check;
    }
    const tokenHash = await sha256Hex(rawToken.trim());
    const tokenRow = await this.repo.findTokenByHash(tokenHash, 'confirm');
    const nowMs = this.nowFn().getTime();
    const nowIso = new Date(nowMs).toISOString();

    const marked = await this.repo.markTokenUsed(tokenHash, nowIso);
    if (!marked) {
      return { status: 400, body: { ok: false, error: 'TOKEN_ALREADY_USED', valid: false } };
    }

    const subscriber = await this.repo.findSubscriberById(tokenRow.subscriber_id);
    const emailHash = await sha256Hex(subscriber.email_normalized);
    // Jeśli wcześniej był wypisany i teraz świadomie potwierdził DOI, zdejmij blokadę 'unsubscribed'
    const sup = await this.repo.getSuppression(emailHash);
    if (sup && sup.reason === 'unsubscribed') {
      await this.repo.removeSuppression(emailHash);
    }

    const updated = await this.repo.updateSubscriberStatus(subscriber.id, {
      status: 'active',
      confirmed_at: nowIso,
      unsubscribed_at: null,
      updated_at: nowIso,
    });

    const { ipHash, uaHash } = await this.hashClientContext(clientMeta.ip, clientMeta.userAgent);
    const topics = await this.repo.getSubscriberTopics(subscriber.id);

    await this.repo.addConsentEvent({
      subscriber_id: subscriber.id,
      event_type: 'confirmed',
      consent_version: this.getConsentVersion(),
      consent_text_snapshot: getConsentTextSnapshot(subscriber.locale, this.getConsentVersion()),
      privacy_policy_version: DEFAULT_PRIVACY_VERSION,
      source_portal: subscriber.source_portal,
      source_path: '/newsletter/confirm',
      locale: subscriber.locale,
      ip_hash: ipHash,
      user_agent_hash: uaHash,
      metadata: { topics },
      created_at: nowIso,
    });

    // Wygeneruj tokeny manage + unsubscribe dla wiadomości powitalnej
    const rawManageToken = generateSecureToken(32);
    await this.repo.createToken({
      subscriberId: subscriber.id,
      purpose: 'manage',
      tokenHash: await sha256Hex(rawManageToken),
      expiresAt: new Date(nowMs + 30 * 86400 * 1000).toISOString(),
      createdAt: nowIso,
    });

    const rawUnsubToken = generateSecureToken(32);
    await this.repo.createToken({
      subscriberId: subscriber.id,
      purpose: 'unsubscribe',
      tokenHash: await sha256Hex(rawUnsubToken),
      expiresAt: new Date(nowMs + 90 * 86400 * 1000).toISOString(),
      createdAt: nowIso,
    });

    const baseUrl = this.getBaseUrl(clientMeta.requestUrl);
    const manageUrl = `${baseUrl}/newsletter/manage?token=${encodeURIComponent(rawManageToken)}`;
    const unsubscribeUrl = `${baseUrl}/newsletter/unsubscribe?token=${encodeURIComponent(rawUnsubToken)}`;
    const unsubscribeApiUrl = `${baseUrl}/api/newsletter/unsubscribe?token=${encodeURIComponent(rawUnsubToken)}`;

    const welcome = renderWelcomeEmail({
      firstName: updated.first_name,
      topicSlugs: topics,
      manageUrl,
      unsubscribeUrl,
      unsubscribeApiUrl,
      sourcePortal: updated.source_portal,
      locale: updated.locale,
    });

    await this._dispatchEmail({
      to: updated.email_display,
      subject: welcome.subject,
      html: welcome.html,
      text: welcome.text,
      headers: welcome.headers,
      campaignId: `welcome_${subscriber.id}_${nowMs}`,
      subscriberId: subscriber.id,
      deliveryType: 'welcome',
    });

    return {
      status: 200,
      body: {
        ok: true,
        status: 'active',
        maskedEmail: maskEmail(updated.email_display),
        topics,
        manageToken: rawManageToken,
      },
    };
  }

  /**
   * Żądanie linku do zarządzania subskrypcją - POST /api/newsletter/manage/request-link
   */
  async requestManageLink(payload = {}, clientMeta = {}) {
    const locale = ['pl', 'en', 'de'].includes(payload.locale) ? payload.locale : 'pl';
    const emailObj = normalizeEmail(payload.email);
    if (!emailObj) {
      return {
        status: 400,
        body: { ok: false, error: 'INVALID_EMAIL' },
      };
    }

    const nowMs = this.nowFn().getTime();
    const nowIso = new Date(nowMs).toISOString();
    const { ipHash } = await this.hashClientContext(clientMeta.ip, clientMeta.userAgent);
    if (!this.repo.checkRateLimit(`manage_ip:${ipHash}`, 6, 10 * 60 * 1000, nowMs)) {
      return { status: 429, body: { ok: false, error: 'RATE_LIMITED' } };
    }

    const sub = await this.repo.findSubscriberByEmail(emailObj.normalized);
    if (sub && sub.status === 'active') {
      const rawManageToken = generateSecureToken(32);
      await this.repo.createToken({
        subscriberId: sub.id,
        purpose: 'manage',
        tokenHash: await sha256Hex(rawManageToken),
        expiresAt: new Date(nowMs + 30 * 60 * 1000).toISOString(),
        createdAt: nowIso,
      });
      const rawUnsubToken = generateSecureToken(32);
      await this.repo.createToken({
        subscriberId: sub.id,
        purpose: 'unsubscribe',
        tokenHash: await sha256Hex(rawUnsubToken),
        expiresAt: new Date(nowMs + 90 * 86400 * 1000).toISOString(),
        createdAt: nowIso,
      });
      const baseUrl = this.getBaseUrl(clientMeta.requestUrl);
      const mail = renderManageLinkEmail({
        manageUrl: `${baseUrl}/newsletter/manage?token=${encodeURIComponent(rawManageToken)}`,
        unsubscribeUrl: `${baseUrl}/newsletter/unsubscribe?token=${encodeURIComponent(rawUnsubToken)}`,
        locale: sub.locale || locale,
      });
      await this._dispatchEmail({
        to: sub.email_display,
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
        campaignId: `manage_req_${nowMs}`,
        subscriberId: sub.id,
        deliveryType: 'manage_link',
      });
    }

    return {
      status: 200,
      body: {
        ok: true,
        neutral: true,
        message: this.getNeutralSubscribeMessage(locale),
      },
    };
  }

  /**
   * Aktualizacja kategorii tematycznych - POST /api/newsletter/preferences (T09)
   */
  async updatePreferences(payload = {}, clientMeta = {}) {
    const check = await this.inspectToken(payload.token, 'manage');
    if (check.status !== 200) return check;

    const validSlugs = new Set(NEWSLETTER_TOPICS_V1.map((t) => t.slug));
    const selectedTopics = (Array.isArray(payload.topics) ? payload.topics : []).filter((s) => validSlugs.has(s));
    if (selectedTopics.length === 0) {
      return {
        status: 400,
        body: { ok: false, error: 'INVALID_TOPICS', message: 'Wybierz przynajmniej jedną kategorię lub wypisz się.' },
      };
    }

    const tokenHash = await sha256Hex(payload.token.trim());
    const tokenRow = await this.repo.findTokenByHash(tokenHash, 'manage');
    const subscriber = await this.repo.findSubscriberById(tokenRow.subscriber_id);
    const nowIso = this.nowFn().toISOString();

    const locale = ['pl', 'en', 'de'].includes(payload.locale) ? payload.locale : subscriber.locale;
    const firstName = payload.firstName !== undefined ? String(payload.firstName || '').trim().slice(0, 80) : subscriber.first_name;

    await this.repo.updateSubscriberStatus(subscriber.id, {
      locale,
      first_name: firstName,
      updated_at: nowIso,
    });
    await this.repo.setSubscriberTopics(subscriber.id, selectedTopics, nowIso);

    const { ipHash, uaHash } = await this.hashClientContext(clientMeta.ip, clientMeta.userAgent);
    await this.repo.addConsentEvent({
      subscriber_id: subscriber.id,
      event_type: 'preferences_updated',
      consent_version: this.getConsentVersion(),
      consent_text_snapshot: getConsentTextSnapshot(locale, this.getConsentVersion()),
      privacy_policy_version: DEFAULT_PRIVACY_VERSION,
      source_portal: subscriber.source_portal,
      source_path: '/newsletter/manage',
      locale,
      ip_hash: ipHash,
      user_agent_hash: uaHash,
      metadata: { topics: selectedTopics },
      created_at: nowIso,
    });

    return {
      status: 200,
      body: {
        ok: true,
        status: subscriber.status,
        locale,
        topics: selectedTopics,
      },
    };
  }

  /**
   * Natychmiastowy, idempotentny wypis z newslettera - POST /api/newsletter/unsubscribe (T10, T11)
   */
  async unsubscribe(rawToken, clientMeta = {}) {
    if (!rawToken || typeof rawToken !== 'string' || rawToken.length < 16) {
      return { status: 400, body: { ok: false, error: 'INVALID_TOKEN' } };
    }
    const tokenHash = await sha256Hex(rawToken.trim());
    let tokenRow = await this.repo.findTokenByHash(tokenHash, 'unsubscribe');
    if (!tokenRow) {
      // Pozwól również na wypis za pomocą ważnego tokenu manage
      tokenRow = await this.repo.findTokenByHash(tokenHash, 'manage');
    }
    if (!tokenRow) {
      return { status: 400, body: { ok: false, error: 'TOKEN_NOT_FOUND' } };
    }

    const subscriber = await this.repo.findSubscriberById(tokenRow.subscriber_id);
    if (!subscriber) {
      return { status: 400, body: { ok: false, error: 'SUBSCRIBER_NOT_FOUND' } };
    }

    const nowIso = this.nowFn().toISOString();
    await this.repo.markTokenUsed(tokenHash, nowIso);

    // Idempotentność (T11): jeśli już wypisany, zwróć 200 OK bez błędu
    if (subscriber.status !== 'unsubscribed') {
      await this.repo.updateSubscriberStatus(subscriber.id, {
        status: 'unsubscribed',
        unsubscribed_at: nowIso,
        updated_at: nowIso,
      });

      const emailHash = await sha256Hex(subscriber.email_normalized);
      await this.repo.addSuppression(emailHash, 'unsubscribed', nowIso);
      await this.repo.cancelPendingDeliveriesForSubscriber(subscriber.id, nowIso);

      const { ipHash, uaHash } = await this.hashClientContext(clientMeta.ip, clientMeta.userAgent);
      await this.repo.addConsentEvent({
        subscriber_id: subscriber.id,
        event_type: 'unsubscribed',
        consent_version: this.getConsentVersion(),
        consent_text_snapshot: 'One-Click Unsubscribe / Wycofanie zgody',
        privacy_policy_version: DEFAULT_PRIVACY_VERSION,
        source_portal: subscriber.source_portal,
        source_path: '/newsletter/unsubscribe',
        locale: subscriber.locale,
        ip_hash: ipHash,
        user_agent_hash: uaHash,
        metadata: { method: clientMeta.oneClick ? 'rfc8058_one_click' : 'web_post' },
        created_at: nowIso,
      });
    }

    return {
      status: 200,
      body: {
        ok: true,
        status: 'unsubscribed',
        maskedEmail: maskEmail(subscriber.email_display),
      },
    };
  }

  /**
   * Webhook odbić i skarg spamowych - POST /api/newsletter/webhooks/delivery (T13, T14)
   */
  async handleDeliveryWebhook(rawBody, signatureHeader = '') {
    const secret = this.env.NEWSLETTER_WEBHOOK_SECRET || 'ekocc-webhook-secret-2026';
    const expectedSig = await hmacSha256Hex(secret, rawBody);
    if (!signatureHeader || signatureHeader.trim() !== expectedSig) {
      return { status: 401, body: { ok: false, error: 'INVALID_WEBHOOK_SIGNATURE' } };
    }

    let payload;
    try {
      payload = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody;
    } catch {
      return { status: 400, body: { ok: false, error: 'INVALID_JSON' } };
    }

    const emailObj = normalizeEmail(payload.email);
    if (!emailObj) {
      return { status: 400, body: { ok: false, error: 'INVALID_EMAIL' } };
    }

    const nowIso = this.nowFn().toISOString();
    const emailHash = await sha256Hex(emailObj.normalized);
    const sub = await this.repo.findSubscriberByEmail(emailObj.normalized);

    if (payload.event === 'hard_bounce') {
      await this.repo.addSuppression(emailHash, 'hard_bounce', nowIso);
      if (sub) {
        await this.repo.updateSubscriberStatus(sub.id, { status: 'bounced', updated_at: nowIso });
        await this.repo.cancelPendingDeliveriesForSubscriber(sub.id, nowIso);
        await this.repo.addConsentEvent({
          subscriber_id: sub.id,
          event_type: 'bounced',
          consent_version: this.getConsentVersion(),
          consent_text_snapshot: 'Provider webhook: hard_bounce',
          privacy_policy_version: DEFAULT_PRIVACY_VERSION,
          source_portal: sub.source_portal,
          source_path: '/api/newsletter/webhooks/delivery',
          locale: sub.locale,
          ip_hash: 'webhook',
          user_agent_hash: 'webhook',
          metadata: { reason: payload.reason || 'hard_bounce' },
          created_at: nowIso,
        });
      }
      return { status: 200, body: { ok: true, suppressed: true, status: 'bounced' } };
    }

    if (payload.event === 'spam_complaint') {
      await this.repo.addSuppression(emailHash, 'spam_complaint', nowIso);
      if (sub) {
        await this.repo.updateSubscriberStatus(sub.id, { status: 'complained', updated_at: nowIso });
        await this.repo.cancelPendingDeliveriesForSubscriber(sub.id, nowIso);
        await this.repo.addConsentEvent({
          subscriber_id: sub.id,
          event_type: 'complained',
          consent_version: this.getConsentVersion(),
          consent_text_snapshot: 'Provider webhook: spam_complaint',
          privacy_policy_version: DEFAULT_PRIVACY_VERSION,
          source_portal: sub.source_portal,
          source_path: '/api/newsletter/webhooks/delivery',
          locale: sub.locale,
          ip_hash: 'webhook',
          user_agent_hash: 'webhook',
          metadata: { reason: payload.reason || 'spam_complaint' },
          created_at: nowIso,
        });
      }
      return { status: 200, body: { ok: true, suppressed: true, status: 'complained' } };
    }

    return { status: 200, body: { ok: true, suppressed: false, event: payload.event } };
  }

  /**
   * Zatwierdzenie kampanii przez administratora (Compliance Gate - T18)
   */
  async approveCampaign(campaignId, approvedBy = 'admin') {
    const campaign = await this.repo.getCampaignById(campaignId);
    if (!campaign) {
      return { status: 404, body: { ok: false, error: 'CAMPAIGN_NOT_FOUND' } };
    }
    const compliance = validateCampaignCompliance(campaign);
    if (!compliance.valid) {
      return {
        status: 400,
        body: {
          ok: false,
          error: 'COMPLIANCE_FAILED',
          details: compliance.errors,
        },
      };
    }
    const updated = await this.repo.saveCampaign({
      ...campaign,
      status: 'approved',
      approved_by: approvedBy,
    });
    return { status: 200, body: { ok: true, campaign: updated, compliance } };
  }

  /**
   * Wysyłka zatwierdzonej kampanii z blokadą idempotentności i filtrem wyłącznie active (T19, T20, T24)
   */
  async sendCampaign(campaignId, { requestUrl } = {}) {
    const campaign = await this.repo.getCampaignById(campaignId);
    if (!campaign) {
      return { status: 404, body: { ok: false, error: 'CAMPAIGN_NOT_FOUND' } };
    }

    // Jeśli kampania została już wysłana lub jest w trakcie wysyłki -> idempotentna odpowiedź bez duplikatów (T19)
    if (campaign.status === 'sent' || campaign.status === 'sending') {
      const deliveries = await this.repo.getDeliveriesForCampaign(campaignId);
      return {
        status: 200,
        body: {
          ok: true,
          idempotent: true,
          status: campaign.status,
          sentCount: deliveries.length,
        },
      };
    }

    const compliance = validateCampaignCompliance(campaign);
    if (!compliance.valid) {
      return {
        status: 400,
        body: {
          ok: false,
          error: 'COMPLIANCE_FAILED',
          details: compliance.errors,
        },
      };
    }

    if (campaign.status !== 'approved') {
      return {
        status: 400,
        body: {
          ok: false,
          error: 'CAMPAIGN_NOT_APPROVED',
          message: 'Kampania musi mieć status "approved" przed uruchomieniem wysyłki.',
        },
      };
    }

    // Zablokuj kampanię na czas wysyłki
    await this.repo.saveCampaign({ ...campaign, status: 'sending' });

    let topicSlugs = [];
    try {
      topicSlugs = JSON.parse(campaign.topic_filter_json || '[]');
    } catch {
      topicSlugs = [];
    }

    const recipients = await this.repo.listActiveSubscribersForCampaign({
      topicSlugs,
      localeFilter: campaign.locale_filter || 'all',
    });

    const dailyLimit = Number(this.env.NEWSLETTER_DAILY_QUOTA_LIMIT || 100);
    const safetyRatio = Number(this.env.NEWSLETTER_QUOTA_SAFETY_RATIO || 0.8);
    const maxSafeBatch = Math.max(1, Math.floor(dailyLimit * safetyRatio));

    const nowMs = this.nowFn().getTime();
    const nowIso = new Date(nowMs).toISOString();
    const baseUrl = this.getBaseUrl(requestUrl);
    let dispatchedCount = 0;

    for (const sub of recipients) {
      if (this.isDeliveryEnabled() && dispatchedCount >= maxSafeBatch) {
        break; // Bezpiecznik 80% darmowego limitu ZERO COST
      }

      const rawManageToken = generateSecureToken(32);
      await this.repo.createToken({
        subscriberId: sub.id,
        purpose: 'manage',
        tokenHash: await sha256Hex(rawManageToken),
        expiresAt: new Date(nowMs + 30 * 86400 * 1000).toISOString(),
        createdAt: nowIso,
      });

      const rawUnsubToken = generateSecureToken(32);
      await this.repo.createToken({
        subscriberId: sub.id,
        purpose: 'unsubscribe',
        tokenHash: await sha256Hex(rawUnsubToken),
        expiresAt: new Date(nowMs + 90 * 86400 * 1000).toISOString(),
        createdAt: nowIso,
      });

      const manageUrl = `${baseUrl}/newsletter/manage?token=${encodeURIComponent(rawManageToken)}`;
      const unsubscribeUrl = `${baseUrl}/newsletter/unsubscribe?token=${encodeURIComponent(rawUnsubToken)}`;
      const unsubscribeApiUrl = `${baseUrl}/api/newsletter/unsubscribe?token=${encodeURIComponent(rawUnsubToken)}`;

      const isEn = sub.locale === 'en' && campaign.subject_en;
      const rendered = renderCampaignEmail({
        subject: isEn ? campaign.subject_en : campaign.subject_pl,
        preheader: isEn ? campaign.preheader_en : campaign.preheader_pl,
        htmlContent: campaign.html_body,
        textContent: campaign.text_body,
        manageUrl,
        unsubscribeUrl,
        unsubscribeApiUrl,
        sourcePortal: sub.source_portal,
        locale: sub.locale,
      });

      const result = await this._dispatchEmail({
        to: sub.email_display,
        subject: rendered.subject,
        html: rendered.html,
        text: rendered.text,
        headers: rendered.headers,
        campaignId: campaign.id,
        subscriberId: sub.id,
        deliveryType: 'campaign',
      });

      if (result.inserted) {
        dispatchedCount++;
        await this.repo.updateSubscriberStatus(sub.id, { last_sent_at: nowIso, updated_at: nowIso });
      }
    }

    const finalized = await this.repo.saveCampaign({
      ...campaign,
      status: 'sent',
      sent_at: nowIso,
    });

    return {
      status: 200,
      body: {
        ok: true,
        idempotent: false,
        status: finalized.status,
        deliveryMode: this.isDeliveryEnabled() ? 'live' : 'dry_run',
        sentCount: dispatchedCount,
      },
    };
  }

  /**
   * Obsługa praw RODO (eksport lub usunięcie danych z zachowaniem skrótu supresji)
   */
  async handleGdprRequest({ action, email }) {
    const emailObj = normalizeEmail(email);
    if (!emailObj) {
      return { status: 400, body: { ok: false, error: 'INVALID_EMAIL' } };
    }
    const sub = await this.repo.findSubscriberByEmail(emailObj.normalized);
    if (!sub) {
      return { status: 404, body: { ok: false, error: 'SUBSCRIBER_NOT_FOUND' } };
    }
    const nowIso = this.nowFn().toISOString();
    const emailHash = await sha256Hex(emailObj.normalized);

    if (action === 'export') {
      const topics = await this.repo.getSubscriberTopics(sub.id);
      const events = await this.repo.getConsentEvents(sub.id);
      return {
        status: 200,
        body: {
          ok: true,
          action: 'export',
          subscriber: sub,
          topics,
          consentEvents: events,
        },
      };
    }

    if (action === 'erase') {
      await this.repo.eraseSubscriberPersonalData(sub.id, emailHash, nowIso);
      await this.repo.addConsentEvent({
        subscriber_id: sub.id,
        event_type: 'gdpr_erased',
        consent_version: this.getConsentVersion(),
        consent_text_snapshot: 'GDPR Art. 17 erasure executed; SHA-256 suppression hash retained.',
        privacy_policy_version: DEFAULT_PRIVACY_VERSION,
        source_portal: sub.source_portal,
        source_path: '/api/newsletter/admin/gdpr',
        locale: sub.locale,
        ip_hash: 'admin',
        user_agent_hash: 'admin',
        metadata: { emailHash },
        created_at: nowIso,
      });
      return {
        status: 200,
        body: {
          ok: true,
          action: 'erase',
          erasedSubscriberId: sub.id,
          suppressionRetainedHash: emailHash,
        },
      };
    }

    return { status: 400, body: { ok: false, error: 'INVALID_ACTION' } };
  }
}

// Singleton instancji per Worker isolate
let _defaultService = null;
export function getNewsletterService(env = {}) {
  const d1 = env?.newsletter_db || env?.mission_control_db || env?.milion_db || null;
  if (!_defaultService) {
    _defaultService = new NewsletterService({
      repo: new NewsletterRepository(d1),
      env,
    });
  } else {
    _defaultService.env = env;
    if (d1 && !_defaultService.repo.d1) {
      _defaultService.repo.d1 = d1;
      _defaultService.repo.initialized = false;
    }
  }
  return _defaultService;
}

/**
 * Router HTTP dla ścieżek /api/newsletter/* wywoływany z _worker.js
 */
export async function handleNewsletterApiRequest(request, env = {}, verifyAdminTokenFn = null) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/$/, '');
  const method = request.method.toUpperCase();
  const service = getNewsletterService(env);

  const jsonHeaders = {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store, no-cache, must-revalidate',
    'X-Content-Type-Options': 'nosniff',
  };

  if (method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        ...jsonHeaders,
        'Access-Control-Allow-Origin': url.origin,
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Newsletter-Admin-Secret, X-Newsletter-Signature',
      },
    });
  }

  const clientMeta = {
    ip: request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || '127.0.0.1',
    userAgent: request.headers.get('User-Agent') || 'unknown',
    requestUrl: request.url,
  };

  // Aggregate-only public statistics; no subscriber metadata or arbitrary filters.
  if (path === '/api/newsletter/public-stats') {
    if (method !== 'GET') return new Response(JSON.stringify({ok:false}),{status:405,headers:{...jsonHeaders,Allow:'GET'}});
    if (url.search) return new Response(JSON.stringify({ok:false}),{status:400,headers:jsonHeaders});
    try {
      const stats = await service.repo.getPublicStats();
      return new Response(JSON.stringify(stats),{status:200,headers:{...jsonHeaders,'Cache-Control':'public, max-age=300, s-maxage=600'}});
    } catch {
      return new Response(JSON.stringify({ok:false,message:'Statystyki chwilowo niedostępne.'}),{status:503,headers:jsonHeaders});
    }
  }

  // 1. GET /api/newsletter/topics
  if (path === '/api/newsletter/topics' && method === 'GET') {
    const topics = await service.repo.getTopics();
    return new Response(
      JSON.stringify({
        ok: true,
        consentVersion: service.getConsentVersion(),
        deliveryEnabled: service.isDeliveryEnabled(),
        topics: topics.map((t) => ({
          id: t.id,
          slug: t.slug,
          namePl: t.name_pl,
          nameEn: t.name_en,
          nameDe: t.name_de,
          descriptionPl: t.description_pl,
          descriptionEn: t.description_en,
          descriptionDe: t.description_de,
          isActive: Boolean(t.is_active),
          sortOrder: t.sort_order,
        })),
      }),
      { status: 200, headers: jsonHeaders }
    );
  }

  // 2. POST /api/newsletter/subscribe
  if (path === '/api/newsletter/subscribe' && method === 'POST') {
    const body = await request.json().catch(() => ({}));
    const result = await service.subscribe(body, clientMeta);
    return new Response(JSON.stringify(result.body), { status: result.status, headers: jsonHeaders });
  }

  // 3. GET / POST /api/newsletter/confirm
  if (path === '/api/newsletter/confirm') {
    if (method === 'GET') {
      const token = url.searchParams.get('token') || '';
      const result = await service.inspectToken(token, 'confirm');
      return new Response(JSON.stringify(result.body), { status: result.status, headers: jsonHeaders });
    }
    if (method === 'POST') {
      const body = await request.json().catch(() => ({}));
      const token = body.token || url.searchParams.get('token') || '';
      const result = await service.confirmSubscription(token, clientMeta);
      return new Response(JSON.stringify(result.body), { status: result.status, headers: jsonHeaders });
    }
  }

  // 4. POST /api/newsletter/manage/request-link
  if (path === '/api/newsletter/manage/request-link' && method === 'POST') {
    const body = await request.json().catch(() => ({}));
    const result = await service.requestManageLink(body, clientMeta);
    return new Response(JSON.stringify(result.body), { status: result.status, headers: jsonHeaders });
  }

  // 5. GET /api/newsletter/manage
  if (path === '/api/newsletter/manage' && method === 'GET') {
    const token = url.searchParams.get('token') || '';
    const result = await service.inspectToken(token, 'manage');
    return new Response(JSON.stringify(result.body), { status: result.status, headers: jsonHeaders });
  }

  // 6. POST /api/newsletter/preferences
  if (path === '/api/newsletter/preferences' && method === 'POST') {
    const body = await request.json().catch(() => ({}));
    const result = await service.updatePreferences(body, clientMeta);
    return new Response(JSON.stringify(result.body), { status: result.status, headers: jsonHeaders });
  }

  // 7. GET / POST /api/newsletter/unsubscribe (wspiera również RFC 8058 List-Unsubscribe=One-Click)
  if (path === '/api/newsletter/unsubscribe') {
    if (method === 'GET') {
      const token = url.searchParams.get('token') || '';
      const result = await service.inspectToken(token, 'unsubscribe');
      return new Response(JSON.stringify(result.body), { status: result.status, headers: jsonHeaders });
    }
    if (method === 'POST') {
      let token = url.searchParams.get('token') || '';
      let oneClick = false;
      const contentType = (request.headers.get('Content-Type') || '').toLowerCase();
      if (contentType.includes('application/json')) {
        const body = await request.json().catch(() => ({}));
        token = body.token || token;
      } else {
        const rawText = await request.text().catch(() => '');
        const params = new URLSearchParams(rawText);
        if (params.get('List-Unsubscribe') === 'One-Click') oneClick = true;
        if (params.get('token')) token = params.get('token');
      }
      const result = await service.unsubscribe(token, { ...clientMeta, oneClick });
      return new Response(JSON.stringify(result.body), { status: result.status, headers: jsonHeaders });
    }
  }

  // 8. POST /api/newsletter/webhooks/delivery
  if (path === '/api/newsletter/webhooks/delivery' && method === 'POST') {
    const rawBody = await request.text().catch(() => '');
    const sig = request.headers.get('X-Newsletter-Signature') || '';
    const result = await service.handleDeliveryWebhook(rawBody, sig);
    return new Response(JSON.stringify(result.body), { status: result.status, headers: jsonHeaders });
  }

  // 9. Endpointy administracyjne RBAC: /api/newsletter/admin/* (T17)
  if (path.startsWith('/api/newsletter/admin')) {
    const adminSecretHeader = (request.headers.get('x-newsletter-admin-secret') || '').trim();
    const expectedSecret = env.NEWSLETTER_ADMIN_SECRET || env.MC_SECRET || '';
    let isAuthorized = Boolean(expectedSecret && adminSecretHeader && adminSecretHeader === expectedSecret);
    let adminIdentity = 'admin-secret';

    if (!isAuthorized && typeof verifyAdminTokenFn === 'function') {
      const authHeader = request.headers.get('Authorization') || '';
      const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
      if (bearer) {
        const verified = await verifyAdminTokenFn(bearer).catch(() => null);
        if (verified && verified.email === 'nazirczarkes@gmail.com') {
          isAuthorized = true;
          adminIdentity = verified.email;
        }
      }
    }

    if (!isAuthorized) {
      return new Response(JSON.stringify({ ok: false, error: 'UNAUTHORIZED' }), {
        status: 401,
        headers: jsonHeaders,
      });
    }

    if (path === '/api/newsletter/admin/overview' && method === 'GET') {
      const summary = await service.repo.getStatsSummary();
      return new Response(
        JSON.stringify({
          ok: true,
          deliveryEnabled: service.isDeliveryEnabled(),
          ...summary,
        }),
        { status: 200, headers: jsonHeaders }
      );
    }

    if (path === '/api/newsletter/admin/campaigns' && method === 'POST') {
      const body = await request.json().catch(() => ({}));
      const saved = await service.repo.saveCampaign({
        ...body,
        created_by: adminIdentity,
      });
      return new Response(JSON.stringify({ ok: true, campaign: saved }), { status: 200, headers: jsonHeaders });
    }

    const previewMatch = path.match(/^\/api\/newsletter\/admin\/campaigns\/([^/]+)\/preview$/);
    if (previewMatch && method === 'POST') {
      const camp = await service.repo.getCampaignById(previewMatch[1]);
      if (!camp) return new Response(JSON.stringify({ ok: false, error: 'CAMPAIGN_NOT_FOUND' }), { status: 404, headers: jsonHeaders });
      const compliance = validateCampaignCompliance(camp);
      const baseUrl = service.getBaseUrl(request.url);
      const preview = renderCampaignEmail({
        subject: camp.subject_pl,
        preheader: camp.preheader_pl,
        htmlContent: camp.html_body,
        textContent: camp.text_body,
        manageUrl: `${baseUrl}/newsletter/manage?token=PREVIEW_TOKEN`,
        unsubscribeUrl: `${baseUrl}/newsletter/unsubscribe?token=PREVIEW_TOKEN`,
        unsubscribeApiUrl: `${baseUrl}/api/newsletter/unsubscribe?token=PREVIEW_TOKEN`,
        sourcePortal: 'polskieradio.cc',
        locale: 'pl',
      });
      return new Response(JSON.stringify({ ok: true, compliance, preview }), { status: 200, headers: jsonHeaders });
    }

    const testSendMatch = path.match(/^\/api\/newsletter\/admin\/campaigns\/([^/]+)\/send-test$/);
    if (testSendMatch && method === 'POST') {
      const camp = await service.repo.getCampaignById(testSendMatch[1]);
      if (!camp) return new Response(JSON.stringify({ ok: false, error: 'CAMPAIGN_NOT_FOUND' }), { status: 404, headers: jsonHeaders });
      const body = await request.json().catch(() => ({}));
      const testEmail = normalizeEmail(body.testEmail || 'nazirczarkes@gmail.com');
      if (!testEmail) return new Response(JSON.stringify({ ok: false, error: 'INVALID_TEST_EMAIL' }), { status: 400, headers: jsonHeaders });
      const baseUrl = service.getBaseUrl(request.url);
      const rendered = renderCampaignEmail({
        subject: `[TEST] ${camp.subject_pl}`,
        preheader: camp.preheader_pl,
        htmlContent: camp.html_body,
        textContent: camp.text_body,
        manageUrl: `${baseUrl}/newsletter/manage?token=TEST_TOKEN`,
        unsubscribeUrl: `${baseUrl}/newsletter/unsubscribe?token=TEST_TOKEN`,
        unsubscribeApiUrl: `${baseUrl}/api/newsletter/unsubscribe?token=TEST_TOKEN`,
        sourcePortal: 'polskieradio.cc',
        locale: 'pl',
      });
      await service._dispatchEmail({
        to: testEmail.display,
        subject: rendered.subject,
        html: rendered.html,
        text: rendered.text,
        headers: rendered.headers,
        campaignId: `test_${camp.id}_${Date.now()}`,
        subscriberId: 'admin_test',
        deliveryType: 'test_send',
      });
      return new Response(JSON.stringify({ ok: true, testSentTo: testEmail.display, deliveryMode: service.isDeliveryEnabled() ? 'live' : 'dry_run' }), { status: 200, headers: jsonHeaders });
    }

    const approveMatch = path.match(/^\/api\/newsletter\/admin\/campaigns\/([^/]+)\/approve$/);
    if (approveMatch && method === 'POST') {
      const result = await service.approveCampaign(approveMatch[1], adminIdentity);
      return new Response(JSON.stringify(result.body), { status: result.status, headers: jsonHeaders });
    }

    const sendMatch = path.match(/^\/api\/newsletter\/admin\/campaigns\/([^/]+)\/send$/);
    if (sendMatch && method === 'POST') {
      const result = await service.sendCampaign(sendMatch[1], { requestUrl: request.url });
      return new Response(JSON.stringify(result.body), { status: result.status, headers: jsonHeaders });
    }

    if (path === '/api/newsletter/admin/gdpr' && method === 'POST') {
      const body = await request.json().catch(() => ({}));
      const result = await service.handleGdprRequest(body);
      return new Response(JSON.stringify(result.body), { status: result.status, headers: jsonHeaders });
    }
  }

  return new Response(JSON.stringify({ ok: false, error: 'NOT_FOUND' }), {
    status: 404,
    headers: jsonHeaders,
  });
}
