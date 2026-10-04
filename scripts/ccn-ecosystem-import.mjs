import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPOSITORY_ROOT = path.resolve(SCRIPT_DIR, '..');
const REGISTRY_PATH = path.join(REPOSITORY_ROOT, 'data', 'ccn-source-registry.json');
const WARSAW_DAY_FORMATTER = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Warsaw',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export const SOURCE_REGISTRY = JSON.parse(await fs.readFile(REGISTRY_PATH, 'utf8'));
export const SOURCES = SOURCE_REGISTRY.sources
  .filter(source => source.status === 'pilot' && source.adapter)
  .map(({ id, channel, publicUrl, adapter }) => ({ id, channel, url: publicUrl, adapter }));

const safeText = value => typeof value === 'string' ? value.replace(/<[^>]*>/g, '').trim() : '';

export function validIsoDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function validDateTime(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(value)) return null;
  if (!validIsoDate(value.slice(0, 10))) return null;
  const zoneMatch = value.match(/(Z|[+-]\d{2}:\d{2})$/);
  const time = value.slice(11, zoneMatch.index).split('.')[0];
  const [hour, minute, second] = time.split(':').map(part => Number.parseInt(part, 10));
  if (!Number.isInteger(hour) || hour > 23 || minute > 59 || second > 59) return null;
  if (zoneMatch[0] !== 'Z') {
    const zone = zoneMatch[0];
    const [offsetHour, offsetMinute] = zone.slice(1).split(':').map(part => Number.parseInt(part, 10));
    if (offsetHour > 23 || offsetMinute > 59) return null;
  }
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : null;
}

export function warsawDay(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (!Number.isFinite(date.getTime())) throw new Error('Nieprawidłowa data odniesienia');
  return WARSAW_DAY_FORMATTER.format(date);
}

function safeUrl(value) {
  let url;
  try {
    url = new URL(value, 'https://polskieradio.cc');
  } catch {
    throw new Error('Nieprawidłowy adres materiału');
  }
  if (
    url.protocol !== 'https:' ||
    url.username ||
    url.password ||
    !['polskieradio.cc', 'www.youtube.com', 'youtube.com'].includes(url.hostname)
  ) {
    throw new Error('Nieautoryzowany adres materiału');
  }
  url.hash = '';
  return url.href;
}

export function adapt(source, payload) {
  const rows = source.adapter === 'lessons' ? payload?.lessons : payload?.posts;
  if (!Array.isArray(rows) || rows.length > 500) throw new Error('Nieprawidłowy schemat źródła');

  return rows.map(row => {
    const lesson = source.adapter === 'lessons';
    if (lesson && (!Number.isInteger(row.lessonMonthNumber) || row.lessonMonthNumber < 1 || row.lessonMonthNumber > 31)) {
      throw new Error('Nieprawidłowy dzień lekcji');
    }

    const canonicalUrl = safeUrl(
      lesson
        ? `/akademia/kurscodzienny/dzien-${String(row.lessonMonthNumber).padStart(2, '0')}`
        : row.youtubeUrl,
    );
    const title = safeText(row.title);
    if (!title || title.length > 500) throw new Error('Brak poprawnego tytułu');

    const sourceId = lesson
      ? `${row.calendarMonth}:${row.lessonMonthNumber}`
      : safeText(row.id);
    if (
      !sourceId ||
      sourceId.length > 200 ||
      (lesson && (!/^\d{4}-\d{2}$/.test(row.calendarMonth) || !validIsoDate(`${row.calendarMonth}-01`)))
    ) {
      throw new Error('Brak poprawnego identyfikatora źródłowego');
    }

    const publicationTimestamp = validDateTime(row.publicationDate);
    const publishedAt = lesson
      ? validIsoDate(row.publicationDate) ? row.publicationDate : publicationTimestamp
      : Number.isFinite(row.createdAtTimestamp)
        ? new Date(row.createdAtTimestamp).toISOString()
        : null;
    const publicationDay = lesson
      ? validIsoDate(row.publicationDate)
        ? row.publicationDate
        : publicationTimestamp ? warsawDay(publicationTimestamp) : null
      : publishedAt ? warsawDay(publishedAt) : null;

    return {
      source: source.id,
      sourceId,
      channel: source.channel,
      type: lesson ? 'studium-biblijne' : 'material-medialny',
      title,
      summary: safeText(lesson ? row.mainIdea : row.desc).slice(0, 360),
      canonicalUrl,
      publishedAt,
      publicationDay,
      plannedPublishAt: null,
      author: safeText(row.author),
      authorStatus: 'requires-editorial-verification',
      scripture: lesson ? safeText(row.scriptureRange) : null,
      sourceUrl: source.url,
      rightsStatus: 'requires-review',
      sourceDateVerified: false,
    };
  });
}

function contentFingerprint(candidate) {
  return createHash('sha256').update(JSON.stringify(candidate)).digest('hex');
}

function itemId(candidate) {
  return createHash('sha256')
    .update(`${candidate.source}:${candidate.sourceId}`)
    .digest('hex')
    .slice(0, 24);
}

function decisionSnapshot(item) {
  return {
    state: item.state,
    approvedBy: item.approvedBy ?? null,
    approvedAt: item.approvedAt ?? null,
    publishAt: item.publishAt ?? null,
    plannedPublishAt: item.plannedPublishAt ?? null,
    rightsStatus: item.rightsStatus,
    sourceDateVerified: item.sourceDateVerified,
  };
}

function validatedQueue(queue) {
  if (!queue || queue.schemaVersion !== 1 || !Array.isArray(queue.items)) {
    throw new Error('Nieprawidłowy zapis kolejki');
  }
  if (queue.audit !== undefined && !Array.isArray(queue.audit)) {
    throw new Error('Nieprawidłowy dziennik decyzji');
  }
  const ids = new Set();
  for (const item of queue.items) {
    if (!item || typeof item.id !== 'string' || ids.has(item.id) ||
        (item.history !== undefined && !Array.isArray(item.history))) {
      throw new Error('Nieprawidłowy lub zduplikowany rekord kolejki');
    }
    ids.add(item.id);
  }
  return queue;
}

function requireEditorialMetadata(editor, reason, now) {
  if (typeof editor !== 'string' || !editor.trim() || editor.trim().length > 120) {
    throw new Error('Wymagana jest etykieta redaktora (nie jest ona uwierzytelnieniem)');
  }
  if (typeof reason !== 'string' || !reason.trim() || reason.trim().length > 1000) {
    throw new Error('Wymagane jest uzasadnienie decyzji (1–1000 znaków)');
  }
  if (!validDateTime(now)) throw new Error('Nieprawidłowy czas decyzji');
}

function editorialStateSnapshot(item) {
  return {
    state: item.state,
    title: item.title,
    summary: item.summary,
    author: item.author,
    canonicalUrl: item.canonicalUrl,
    rightsStatus: item.rightsStatus,
    authorStatus: item.authorStatus,
    sourceDateVerified: item.sourceDateVerified,
    approvedBy: item.approvedBy ?? null,
    approvedAt: item.approvedAt ?? null,
    publishAt: item.publishAt ?? null,
    plannedPublishAt: item.plannedPublishAt ?? null,
  };
}

function appendEditorialHistory(item, action, editor, reason, now, before, details = {}) {
  const event = {
    action,
    editorLabel: editor.trim(),
    editorAuthority: 'self-attested-local-not-authentication',
    reason: reason.trim(),
    occurredAt: now,
    revision: item.revision,
    details,
  };
  item.history = [...(item.history || []), {
    type: 'editorial-action',
    ...event,
    before,
  }];
  item.updatedAt = now;
  return event;
}

export function recordEditorialAction(queue, itemId, action, input, now = new Date().toISOString()) {
  validatedQueue(queue);
  requireEditorialMetadata(input?.editor, input?.reason, now);
  const item = queue.items.find(candidate => candidate.id === itemId);
  if (!item) throw new Error('Nie znaleziono materiału w prywatnej kolejce');
  const before = editorialStateSnapshot(item);

  let details = {};
  if (action === 'approve') {
    if (item.medicalReviewRequired === true && !item.medicalReview?.verified) {
      throw new Error('Materiał zdrowotny wymaga udokumentowanej recenzji medycznej przed akceptacją');
    }
    if (input.confirmRights !== true || input.confirmAuthor !== true || input.confirmDate !== true) {
      throw new Error('Akceptacja wymaga jawnego potwierdzenia praw, autorstwa i daty źródłowej');
    }
    if (typeof item.author !== 'string' || !item.author.trim()) throw new Error('Uzupełnij potwierdzonego autora lub redakcję przez korektę');
    if (!validIsoDate(item.publicationDay)) throw new Error('Materiał nie ma prawidłowej daty źródłowej');
    item.state = 'approved';
    item.approvedBy = input.editor.trim();
    item.approvedAt = now;
    item.approvalAuthority = 'self-attested-local-not-authentication';
    item.rightsStatus = 'approved';
    item.authorStatus = 'editorially-verified';
    item.sourceDateVerified = true;
    details = { rightsConfirmed: true, authorConfirmed: true, dateConfirmed: true };
  } else if (action === 'withdraw') {
    Object.assign(item, { state: 'withdrawn', approvedBy: null, approvedAt: null, publishAt: null, plannedPublishAt: null });
  } else if (action === 'correct') {
    const changes = {};
    for (const field of ['title', 'summary', 'canonicalUrl', 'author']) {
      if (input[field] === undefined) continue;
      if (typeof input[field] !== 'string') throw new Error(`Nieprawidłowe pole korekty: ${field}`);
      const value = input[field].trim();
      if (field === 'title' && (!value || value.length > 500)) throw new Error('Tytuł musi mieć 1–500 znaków');
      if (field === 'summary' && value.length > 360) throw new Error('Opis może mieć najwyżej 360 znaków');
      if (field === 'author' && (!value || value.length > 120)) throw new Error('Autor musi mieć 1–120 znaków');
      if (field === 'canonicalUrl') {
        let url;
        try {
          url = new URL(value);
        } catch {
          throw new Error('Nieprawidłowy adres kanoniczny');
        }
        if (url.protocol !== 'https:' || url.username || url.password ||
            !['polskieradio.cc', 'www.youtube.com', 'youtube.com'].includes(url.hostname)) {
          throw new Error('Nieautoryzowany adres kanoniczny');
        }
        url.hash = '';
        changes[field] = url.href;
      } else {
        changes[field] = value;
      }
    }
    if (Object.keys(changes).length === 0) throw new Error('Podaj co najmniej jedno pole korekty');
    Object.assign(item, changes, {
      state: item.publicationDay && item.publicationDay > warsawDay(now) ? 'future-review' : 'needs-review',
      approvedBy: null,
      approvedAt: null,
      approvalAuthority: null,
      publishAt: null,
      plannedPublishAt: null,
      rightsStatus: 'requires-review',
      authorStatus: 'requires-editorial-verification',
      sourceDateVerified: false,
    });
    item.fingerprint = contentFingerprint({
      source: item.source,
      sourceId: item.sourceId,
      channel: item.channel,
      type: item.type,
      title: item.title,
      summary: item.summary,
      canonicalUrl: item.canonicalUrl,
      publishedAt: item.publishedAt,
      publicationDay: item.publicationDay,
      plannedPublishAt: null,
      author: item.author,
      authorStatus: 'requires-editorial-verification',
      scripture: item.scripture,
      sourceUrl: item.sourceUrl,
      rightsStatus: 'requires-review',
      sourceDateVerified: false,
    });
    details = { changes };
  } else if (action === 'schedule') {
    const publishAt = validDateTime(input.publishAt);
    if (!publishAt) throw new Error('publishAt musi być prawidłowym ISO 8601 z offsetem lub Z');
    if (item.state !== 'approved' || item.rightsStatus !== 'approved' ||
        item.authorStatus !== 'editorially-verified' || item.sourceDateVerified !== true) {
      throw new Error('Można planować tylko zatwierdzony materiał po weryfikacji praw, autora i daty');
    }
    if (Date.parse(publishAt) < Date.parse(now)) throw new Error('publishAt nie może być datą z przeszłości');
    if (!validIsoDate(item.publicationDay) || warsawDay(publishAt) < item.publicationDay) {
      throw new Error('publishAt nie może przypadać przed datą materiału w Europe/Warsaw');
    }
    item.publishAt = publishAt;
    item.plannedPublishAt = publishAt;
    details = { publishAt };
  } else {
    throw new Error('Dozwolone akcje: approve, correct, schedule, withdraw');
  }

  const auditEvent = appendEditorialHistory(item, action, input.editor, input.reason, now, before, details);
  queue.audit = [...(queue.audit || []), { itemId: item.id, ...auditEvent }];
  return queue;
}

export function mergeQueue(previous, candidates, now = new Date().toISOString()) {
  validatedQueue(previous);
  if (!Number.isFinite(Date.parse(now))) throw new Error('Nieprawidłowa data importu');

  const items = new Map();
  for (const item of previous.items) {
    if (!item || typeof item.id !== 'string' || items.has(item.id)) {
      throw new Error('Nieprawidłowy lub zduplikowany rekord kolejki — nie nadpisano');
    }
    items.set(item.id, item);
  }

  for (const candidate of candidates) {
    if (!candidate || typeof candidate.source !== 'string' || typeof candidate.sourceId !== 'string') {
      throw new Error('Nieprawidłowy materiał źródłowy — nie nadpisano');
    }
    const id = itemId(candidate);
    const fingerprint = contentFingerprint(candidate);
    const old = items.get(id);
    if (old?.fingerprint === fingerprint) continue;

    const future = candidate.publicationDay && candidate.publicationDay > warsawDay(now);
    const history = [...(old?.history || [])];
    if (old) {
      history.push({
        revision: old.revision,
        fingerprint: old.fingerprint,
        content: {
          title: old.title,
          summary: old.summary,
          canonicalUrl: old.canonicalUrl,
          publishedAt: old.publishedAt,
          publicationDay: old.publicationDay,
        },
        decision: decisionSnapshot(old),
        updatedAt: old.updatedAt,
      });
    }

    items.set(id, {
      ...candidate,
      id,
      fingerprint,
      state: future ? 'future-review' : 'needs-review',
      approvedBy: null,
      approvedAt: null,
      approvalAuthority: null,
      publishAt: null,
      plannedPublishAt: null,
      receivedAt: old?.receivedAt || now,
      updatedAt: now,
      revision: (old?.revision || 0) + 1,
      history,
    });
  }

  return { ...previous, schemaVersion: 1, items: [...items.values()] };
}

export function eligibleForPublicFeed(item, now = new Date().toISOString()) {
  if (
    item?.state !== 'approved' ||
    typeof item.approvedBy !== 'string' ||
    !item.approvedBy.trim() ||
    !validDateTime(item.approvedAt) ||
    item.rightsStatus !== 'approved' ||
    item.authorStatus !== 'editorially-verified' ||
    typeof item.author !== 'string' || !item.author.trim() ||
    (item.medicalReviewRequired === true && item.medicalReview?.verified !== true) ||
    item.sourceDateVerified !== true ||
    !validIsoDate(item.publicationDay)
  ) {
    return false;
  }

  const currentTime = Date.parse(now);
  if (!Number.isFinite(currentTime)) throw new Error('Nieprawidłowa data publikacji');
  if (item.publicationDay && (!validIsoDate(item.publicationDay) || item.publicationDay > warsawDay(currentTime))) {
    return false;
  }

  const publishAt = validDateTime(item.publishAt || item.plannedPublishAt);
  if (!publishAt || Date.parse(publishAt) > currentTime) return false;
  return true;
}

export function buildPublishingProjection(queue, now = new Date().toISOString()) {
  validatedQueue(queue);
  if (!validDateTime(now)) throw new Error('Nieprawidłowy czas projekcji');
  return {
    visibility: 'private-local-review-only',
    generatedAt: new Date(now).toISOString(),
    items: queue.items
      .filter(item => eligibleForPublicFeed(item, now))
      .map(item => ({
        id: item.id,
        source: item.source,
        sourceId: item.sourceId,
        channel: item.channel,
        type: item.type,
        title: item.title,
        summary: item.summary,
        canonicalUrl: item.canonicalUrl,
        publishedAt: item.publishedAt,
        publicationDay: item.publicationDay,
        publishAt: validDateTime(item.publishAt || item.plannedPublishAt),
        author: item.author,
        scripture: item.scripture,
      })),
  };
}

export async function collect(fetcher = fetch) {
  const candidates = [];
  const errors = [];
  for (const source of SOURCES) {
    try {
      const response = await fetcher(source.url, {
        signal: AbortSignal.timeout(20000),
        redirect: 'error',
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const text = await response.text();
      if (text.length > 5_000_000) throw new Error('Źródło przekracza limit');
      candidates.push(...adapt(source, JSON.parse(text)));
    } catch (error) {
      errors.push({
        source: source.id,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
  return { candidates, errors };
}

function isInside(parent, child) {
  const relative = path.relative(parent, child);
  return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
}

async function assertPrivateQueueDirectory(target) {
  const repository = await fs.realpath(REPOSITORY_ROOT);
  const realTarget = await fs.realpath(target);
  const stat = await fs.stat(realTarget);
  if (!stat.isDirectory()) throw new Error('Katalog kolejki musi już istnieć');
  if (isInside(repository, realTarget)) throw new Error('Kolejka redakcyjna nie może trafić do publicznego repo');
  return realTarget;
}

async function main() {
  const output = process.argv[2];
  if (!output) throw new Error('Podaj istniejący, prywatny katalog kolejki poza katalogiem repozytorium');

  const target = await assertPrivateQueueDirectory(path.resolve(output));
  const lockPath = path.join(target, 'queue.lock');
  const lock = await fs.open(lockPath, 'wx');
  try {
    const queuePath = path.join(target, 'queue.json');
    let previous;
    try {
      previous = JSON.parse(await fs.readFile(queuePath, 'utf8'));
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      previous = { schemaVersion: 1, items: [] };
    }

    const { candidates, errors } = await collect();
    const next = mergeQueue(previous, candidates);
    await fs.writeFile(
      path.join(target, 'report.json'),
      JSON.stringify({
        checkedAt: new Date().toISOString(),
        imported: candidates.length,
        queued: next.items.length,
        errors,
        published: 0,
      }, null, 2),
    );

    if (candidates.length) {
      const temporaryPath = `${queuePath}.tmp`;
      await fs.writeFile(temporaryPath, JSON.stringify(next, null, 2));
      await fs.rename(temporaryPath, queuePath);
    }

    console.log(JSON.stringify({
      queued: next.items.length,
      imported: candidates.length,
      errors,
      published: 0,
    }));
    if (errors.length) process.exitCode = 1;
  } finally {
    await lock.close();
    await fs.unlink(lockPath);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main();
}
