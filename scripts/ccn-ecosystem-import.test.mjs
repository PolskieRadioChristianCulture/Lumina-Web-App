import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  adapt,
  buildPublishingProjection,
  collect,
  eligibleForPublicFeed,
  mergeQueue,
  recordEditorialAction,
  SOURCE_REGISTRY,
  SOURCES,
} from './ccn-ecosystem-import.mjs';
import { runEditorialCommand } from './ccn-editorial-queue.mjs';

const REPOSITORY_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const emptyQueue = () => ({ schemaVersion: 1, items: [] });
const lesson = (publicationDate = '2026-10-02', title = 'Studium') => adapt(SOURCES[0], {
  lessons: [{
    title,
    calendarMonth: '2026-10',
    lessonMonthNumber: 2,
    publicationDate,
    mainIdea: 'Treść',
    author: 'TEST ONLY',
  }],
})[0];
const approved = (overrides = {}) => ({
  ...lesson(),
  state: 'approved',
  approvedBy: 'redakcja-test',
  approvedAt: '2026-10-02T08:00:00Z',
  rightsStatus: 'approved',
  authorStatus: 'editorially-verified',
  sourceDateVerified: true,
  publishAt: '2026-10-02T08:00:00Z',
  ...overrides,
});

test('reimport is idempotent and preserves an existing editorial decision', () => {
  const first = mergeQueue(emptyQueue(), [lesson()], '2026-10-02T06:00:00Z');
  first.items[0].state = 'approved';
  first.items[0].approvedBy = 'redakcja';
  first.items[0].approvedAt = '2026-10-02T07:00:00Z';
  assert.deepEqual(mergeQueue(first, [lesson()], '2026-10-02T08:00:00Z'), first);
  assert.equal(first.items.length, 1);
});

test('duplicate source identifiers produce one queue item', () => {
  const candidate = lesson();
  const queue = mergeQueue(emptyQueue(), [candidate, candidate], '2026-10-02T06:00:00Z');
  assert.equal(queue.items.length, 1);
});

test('only verified public pilot feeds are enabled as adapters', () => {
  assert.equal(SOURCE_REGISTRY.sources.length, 11);
  assert.deepEqual(SOURCES.map(source => source.id), ['academy-daily', 'cc-media']);
  const kitchen = SOURCE_REGISTRY.sources.find(source => source.id === 'kitchen');
  assert.equal(kitchen.status, 'proposed');
  assert.equal(kitchen.adapter, null);
});

test('a source correction invalidates approval and keeps prior content and decision history', () => {
  const first = mergeQueue(emptyQueue(), [lesson()], '2026-10-02T06:00:00Z');
  Object.assign(first.items[0], {
    state: 'approved',
    approvedBy: 'redakcja',
    approvedAt: '2026-10-02T07:00:00Z',
    plannedPublishAt: '2026-10-02T09:00:00Z',
    rightsStatus: 'approved',
    sourceDateVerified: true,
  });
  const corrected = mergeQueue(first, [lesson('2026-10-02', 'Korekta')], '2026-10-02T08:00:00Z');
  assert.equal(corrected.items.length, 1);
  assert.equal(corrected.items[0].state, 'needs-review');
  assert.equal(corrected.items[0].approvedBy, null);
  assert.equal(corrected.items[0].approvedAt, null);
  assert.equal(corrected.items[0].plannedPublishAt, null);
  assert.equal(corrected.items[0].history[0].content.title, 'Studium');
  assert.equal(corrected.items[0].history[0].decision.approvedBy, 'redakcja');
  assert.equal(corrected.items[0].history[0].decision.plannedPublishAt, '2026-10-02T09:00:00Z');
});

test('future source dates use the Europe/Warsaw calendar boundary', () => {
  assert.equal(lesson().publishedAt, '2026-10-02');
  assert.equal(lesson('2026-02-30T08:00:00Z').publicationDay, null);
  assert.equal(lesson('2026-10-02T25:00:00Z').publicationDay, null);
  assert.equal(mergeQueue(emptyQueue(), [lesson('2026-10-03')], '2026-10-02T21:59:59Z').items[0].state, 'future-review');
  assert.equal(mergeQueue(emptyQueue(), [lesson('2026-10-03')], '2026-10-02T22:00:00Z').items[0].state, 'needs-review');
  assert.equal(mergeQueue(emptyQueue(), [lesson('2026-02-30')], '2026-02-01T08:00:00Z').items[0].publicationDay, null);
});

test('only approved, rights-cleared, date-verified and due items are eligible for a feed', () => {
  assert.equal(eligibleForPublicFeed(approved(), '2026-10-02T08:00:00Z'), true);
  assert.equal(eligibleForPublicFeed(approved({ state: 'needs-review' }), '2026-10-02T08:00:00Z'), false);
  assert.equal(eligibleForPublicFeed(approved({ rightsStatus: 'requires-review' }), '2026-10-02T08:00:00Z'), false);
  assert.equal(eligibleForPublicFeed(approved({ sourceDateVerified: false }), '2026-10-02T08:00:00Z'), false);
  assert.equal(eligibleForPublicFeed(approved({ publicationDay: null }), '2026-10-02T08:00:00Z'), false);
  assert.equal(eligibleForPublicFeed(approved({ publishAt: null, plannedPublishAt: '2026-10-02T09:00:00Z' }), '2026-10-02T08:59:59Z'), false);
  assert.equal(eligibleForPublicFeed(approved({ publishAt: null, plannedPublishAt: '2026-10-02T09:00:00Z' }), '2026-10-02T09:00:00Z'), true);
  assert.equal(eligibleForPublicFeed(approved({ publicationDay: '2026-10-03' }), '2026-10-02T21:59:59Z'), false);
  assert.equal(eligibleForPublicFeed(approved({ publicationDay: '2026-10-03' }), '2026-10-02T22:00:00Z'), true);
});

test('approval, correction and scheduling append an honest local audit trail', () => {
  const queue = mergeQueue(emptyQueue(), [lesson()], '2026-10-02T06:00:00Z');
  const id = queue.items[0].id;
  const approvalTime = '2026-10-02T08:00:00Z';
  recordEditorialAction(queue, id, 'approve', {
    editor: 'Redakcja lokalna',
    reason: 'Sprawdzono prawa, autora i datę',
    confirmRights: true,
    confirmAuthor: true,
    confirmDate: true,
  }, approvalTime);
  assert.equal(queue.items[0].state, 'approved');
  assert.equal(queue.items[0].approvalAuthority, 'self-attested-local-not-authentication');
  assert.equal(queue.items[0].history.at(-1).before.state, 'needs-review');

  recordEditorialAction(queue, id, 'schedule', {
    editor: 'Redakcja lokalna',
    reason: 'Termin zaakceptowany',
    publishAt: '2026-10-03T04:00:00+02:00',
  }, approvalTime);
  assert.equal(queue.items[0].publishAt, '2026-10-03T02:00:00.000Z');

  recordEditorialAction(queue, id, 'correct', {
    editor: 'Redakcja lokalna',
    reason: 'Korekta redakcyjna wymaga ponownego odbioru',
    title: 'Tytuł po korekcie',
  }, '2026-10-02T09:00:00Z');
  assert.equal(queue.items[0].title, 'Tytuł po korekcie');
  assert.equal(queue.items[0].state, 'needs-review');
  assert.equal(queue.items[0].approvedAt, null);
  assert.equal(queue.items[0].publishAt, null);
  assert.equal(queue.items[0].rightsStatus, 'requires-review');
  assert.equal(queue.items[0].sourceDateVerified, false);
  assert.equal(queue.items[0].history.at(-1).before.state, 'approved');
  assert.equal(queue.audit.length, 3);
  assert.ok(queue.audit.every(event => event.editorAuthority === 'self-attested-local-not-authentication'));
});

test('approval and scheduling require explicit review checks and valid future timestamps', () => {
  const queue = mergeQueue(emptyQueue(), [lesson()], '2026-10-02T06:00:00Z');
  const id = queue.items[0].id;
  assert.throws(() => recordEditorialAction(queue, id, 'approve', {
    editor: 'Redakcja',
    reason: 'Bez potwierdzeń',
  }, '2026-10-02T08:00:00Z'), /jawnego potwierdzenia/);
  assert.throws(() => recordEditorialAction(queue, id, 'schedule', {
    editor: 'Redakcja',
    reason: 'Materiał niezatwierdzony',
    publishAt: '2026-10-02T09:00:00Z',
  }, '2026-10-02T08:00:00Z'), /tylko zatwierdzony materiał/);

  recordEditorialAction(queue, id, 'approve', {
    editor: 'Redakcja',
    reason: 'Prawa, autor i data potwierdzone',
    confirmRights: true,
    confirmAuthor: true,
    confirmDate: true,
  }, '2026-10-02T08:00:00Z');
  assert.throws(() => recordEditorialAction(queue, id, 'schedule', {
    editor: 'Redakcja',
    reason: 'Termin w przeszłości',
    publishAt: '2026-10-02T07:59:59Z',
  }, '2026-10-02T08:00:00Z'), /przeszłości/);
  assert.throws(() => recordEditorialAction(queue, id, 'correct', {
    editor: 'Redakcja',
    reason: 'Nieautoryzowany link',
    canonicalUrl: 'https://example.com/article',
  }, '2026-10-02T08:00:00Z'), /Nieautoryzowany adres/);

  const futureQueue = mergeQueue(emptyQueue(), [lesson('2026-10-03')], '2026-10-02T06:00:00Z');
  recordEditorialAction(futureQueue, futureQueue.items[0].id, 'approve', {
    editor: 'Redakcja',
    reason: 'Weryfikacja materiału przyszłego',
    confirmRights: true,
    confirmAuthor: true,
    confirmDate: true,
  }, '2026-10-02T08:00:00Z');
  assert.throws(() => recordEditorialAction(futureQueue, futureQueue.items[0].id, 'schedule', {
    editor: 'Redakcja',
    reason: 'Nie publikować przed datą źródła',
    publishAt: '2026-10-02T21:59:00Z',
  }, '2026-10-02T08:00:00Z'), /przed datą materiału/);
});

test('publishing projection contains only approved and due items and stays private', () => {
  const due = approved({ id: 'due', publishAt: '2026-10-02T08:00:00Z' });
  const future = approved({ id: 'future', publishAt: '2026-10-02T09:00:00Z' });
  const unreviewed = { ...approved({ id: 'unreviewed' }), state: 'needs-review' };
  const queue = { schemaVersion: 1, items: [due, future, unreviewed], audit: [{ reason: 'private' }] };
  const projection = buildPublishingProjection(queue, '2026-10-02T08:00:00Z');
  assert.equal(projection.visibility, 'private-local-review-only');
  assert.deepEqual(projection.items.map(item => item.id), ['due']);
  assert.equal('history' in projection.items[0], false);
  assert.equal('audit' in projection, false);
});

test('local editorial CLI records decisions and previews due items without publishing', async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'ccn-editorial-test-'));
  try {
    const queue = mergeQueue(emptyQueue(), [lesson()], '2026-10-02T06:00:00Z');
    await fs.writeFile(path.join(directory, 'queue.json'), JSON.stringify(queue));
    const itemId = queue.items[0].id;
    let output = '';
    const stdout = { write: value => { output += value; } };
    const common = ['--editor', 'Test redaktor', '--reason', 'Lokalny test'];
    await runEditorialCommand([
      directory, 'approve', itemId, ...common,
      '--confirm-rights', '--confirm-author', '--confirm-date',
    ], { now: '2026-10-02T08:00:00Z', stdout });
    await runEditorialCommand([
      directory, 'schedule', itemId, ...common, '--publish-at', '2026-10-02T09:00:00Z',
    ], { now: '2026-10-02T08:00:00Z', stdout });
    const beforeDue = { value: '' };
    await runEditorialCommand([directory, 'preview'], {
      now: '2026-10-02T08:59:59Z',
      stdout: { write: value => { beforeDue.value += value; } },
    });
    assert.deepEqual(JSON.parse(beforeDue.value).items, []);

    const preview = { value: '' };
    await runEditorialCommand([directory, 'preview'], {
      now: '2026-10-02T09:00:00Z',
      stdout: { write: value => { preview.value += value; } },
    });
    assert.deepEqual(JSON.parse(preview.value).items.map(item => item.id), [itemId]);
    await runEditorialCommand([
      directory, 'correct', itemId, ...common,
      '--title', 'Korekta przez CLI',
    ], { now: '2026-10-02T09:01:00Z', stdout });
    const afterCorrection = { value: '' };
    await runEditorialCommand([directory, 'preview'], {
      now: '2026-10-02T10:00:00Z',
      stdout: { write: value => { afterCorrection.value += value; } },
    });
    assert.deepEqual(JSON.parse(afterCorrection.value).items, []);
    const saved = JSON.parse(await fs.readFile(path.join(directory, 'queue.json'), 'utf8'));
    assert.equal(saved.audit.length, 3);
    assert.equal(saved.items[0].title, 'Korekta przez CLI');
    assert.equal(saved.items[0].state, 'needs-review');
    assert.equal(saved.items[0].approvedAt, null);
    assert.equal(saved.items[0].publishAt, null);
    assert.match(output, /niczego nie opublikowano/);
    assert.equal(await fs.stat(path.join(directory, 'queue.lock')).then(() => true, () => false), false);

    await fs.writeFile(path.join(directory, 'queue.lock'), 'held by another queue operation');
    await assert.rejects(
      runEditorialCommand([directory, 'preview'], { now: '2026-10-02T10:00:00Z', stdout }),
      error => error.code === 'EEXIST',
    );
  } finally {
    await fs.rm(directory, { recursive: true, force: true });
  }
});

test('damaged queues are rejected without resetting prior data', () => {
  assert.throws(() => mergeQueue({ schemaVersion: 1, items: null }, [lesson()]));
  assert.throws(() => mergeQueue({ schemaVersion: 1, items: [{ id: 'same' }, { id: 'same' }] }, [lesson()]));
});

test('adapter keeps rights and authorship unverified and excludes private source fields', () => {
  const row = adapt(SOURCES[1], {
    posts: [{
      id: 'media-1',
      title: '<b>Film</b>',
      youtubeUrl: 'https://www.youtube.com/watch?v=public',
      createdAtTimestamp: 1790928000000,
      author: 'Osoba',
      likes: 999,
      email: 'private@example.test',
    }],
  })[0];
  assert.equal(row.title, 'Film');
  assert.equal(row.rightsStatus, 'requires-review');
  assert.equal(row.authorStatus, 'requires-editorial-verification');
  assert.equal(row.plannedPublishAt, null);
  assert.equal('likes' in row, false);
  assert.equal('email' in row, false);
  assert.throws(() => adapt(SOURCES[1], {
    posts: [{ id: 'bad-url', title: 'Nieprawidłowy link', youtubeUrl: 'https://example.com' }],
  }));
});

test('a failed public source returns an error but leaves successful source candidates intact', async () => {
  const priorMedia = adapt(SOURCES[1], {
    posts: [{ id: 'prior', title: 'Poprzedni materiał', youtubeUrl: 'https://www.youtube.com/watch?v=prior' }],
  })[0];
  const previous = mergeQueue(emptyQueue(), [priorMedia], '2026-10-02T06:00:00Z');
  previous.items[0].state = 'approved';
  previous.items[0].approvedBy = 'redakcja';
  const result = await collect(async url => url === SOURCES[0].url
    ? {
        ok: true,
        text: async () => JSON.stringify({
          lessons: [{
            title: 'Studium',
            calendarMonth: '2026-10',
            lessonMonthNumber: 2,
            publicationDate: '2026-10-02',
          }],
        }),
      }
    : { ok: false, status: 503 });
  assert.equal(result.candidates.length, 1);
  assert.deepEqual(result.errors.map(error => error.source), ['cc-media']);
  const next = mergeQueue(previous, result.candidates, '2026-10-02T07:00:00Z');
  assert.equal(next.items.length, 2);
  assert.deepEqual(next.items.find(item => item.sourceId === 'prior'), previous.items[0]);
});

test('the importer rejects a queue directory inside the repository before any source fetch', () => {
  const script = path.join(REPOSITORY_ROOT, 'scripts', 'ccn-ecosystem-import.mjs');
  const result = spawnSync(process.execPath, [script, REPOSITORY_ROOT], { encoding: 'utf8' });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Kolejka redakcyjna nie może trafić do publicznego repo/);
});

test('the editorial CLI rejects repository paths instead of reading a public queue', () => {
  const script = path.join(REPOSITORY_ROOT, 'scripts', 'ccn-editorial-queue.mjs');
  const result = spawnSync(process.execPath, [script, REPOSITORY_ROOT, 'preview'], { encoding: 'utf8' });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Kolejka redakcyjna nie może znajdować się w repozytorium/);
});
