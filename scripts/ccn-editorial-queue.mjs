import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildPublishingProjection, recordEditorialAction } from './ccn-ecosystem-import.mjs';

const REPOSITORY_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ACTIONS = new Set(['approve', 'correct', 'schedule', 'withdraw', 'preview']);

function usage() {
  return [
    'Usage: node scripts/ccn-editorial-queue.mjs <existing-private-directory> <action> [item-id] [options]',
    'Actions: approve <id> --editor LABEL --reason TEXT --confirm-rights --confirm-author --confirm-date',
    '         correct <id> --editor LABEL --reason TEXT [--title TEXT] [--summary TEXT] [--canonical-url HTTPS_URL]',
    '         schedule <id> --editor LABEL --reason TEXT --publish-at ISO_8601',
    '         preview',
    'Operator labels are self-attested, not authentication. No command publishes or exposes a public feed.',
  ].join('\n');
}

function parseArguments(args) {
  const [directory, action, ...rest] = args;
  if (!directory || !ACTIONS.has(action)) throw new Error(usage());
  const itemId = action === 'preview' ? null : rest.shift();
  if (action !== 'preview' && (!itemId || itemId.startsWith('--'))) throw new Error(usage());

  const options = {};
  for (let index = 0; index < rest.length; index += 1) {
    const token = rest[index];
    if (!token.startsWith('--')) throw new Error(`Nieznana pozycja: ${token}\n${usage()}`);
    const key = token.slice(2);
    if (Object.hasOwn(options, key)) throw new Error(`Powtórzona opcja: --${key}`);
    if (['confirm-rights', 'confirm-author', 'confirm-date'].includes(key)) {
      options[key] = true;
    } else {
      const value = rest[index + 1];
      if (!value || value.startsWith('--')) throw new Error(`Brak wartości dla --${key}`);
      options[key] = value;
      index += 1;
    }
  }
  return { directory: path.resolve(directory), action, itemId, options };
}

function validateOptions(action, options) {
  const allowed = {
    approve: new Set(['editor', 'reason', 'confirm-rights', 'confirm-author', 'confirm-date']),
    correct: new Set(['editor', 'reason', 'title', 'summary', 'canonical-url', 'author']),
    schedule: new Set(['editor', 'reason', 'publish-at']),
    withdraw: new Set(['editor', 'reason']),
    preview: new Set(),
  }[action];
  for (const key of Object.keys(options)) {
    if (!allowed.has(key)) throw new Error(`Nieznana opcja dla ${action}: --${key}`);
  }
  if (action !== 'preview' && (!options.editor || !options.reason)) {
    throw new Error('Operacja redakcyjna wymaga --editor i --reason');
  }
  if (action === 'approve' &&
      (!options['confirm-rights'] || !options['confirm-author'] || !options['confirm-date'])) {
    throw new Error('Akceptacja wymaga --confirm-rights --confirm-author --confirm-date');
  }
  if (action === 'correct' &&
      !['title', 'summary', 'canonical-url', 'author'].some(key => options[key] !== undefined)) {
    throw new Error('Korekta wymaga --title, --summary lub --canonical-url');
  }
  if (action === 'schedule' && !options['publish-at']) {
    throw new Error('Planowanie wymaga --publish-at');
  }
}

function toEditorialInput(options) {
  return {
    editor: options.editor,
    reason: options.reason,
    confirmRights: options['confirm-rights'] === true,
    confirmAuthor: options['confirm-author'] === true,
    confirmDate: options['confirm-date'] === true,
    publishAt: options['publish-at'],
    title: options.title,
    summary: options.summary,
    canonicalUrl: options['canonical-url'],
    author: options.author,
  };
}

function isInside(parent, child) {
  const relative = path.relative(parent, child);
  return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
}

async function resolvePrivateQueue(directory) {
  const repository = await fs.realpath(REPOSITORY_ROOT);
  const target = await fs.realpath(directory);
  const stat = await fs.stat(target);
  if (!stat.isDirectory()) throw new Error('Katalog kolejki musi być istniejący i prywatny');
  if (isInside(repository, target)) throw new Error('Kolejka redakcyjna nie może znajdować się w repozytorium');

  const queuePath = path.join(target, 'queue.json');
  const queueStat = await fs.lstat(queuePath);
  if (queueStat.isSymbolicLink() || !queueStat.isFile()) {
    throw new Error('queue.json musi być zwykłym plikiem w katalogu kolejki');
  }
  const realQueue = await fs.realpath(queuePath);
  if (!isInside(target, realQueue)) throw new Error('queue.json wskazuje poza katalog kolejki');
  return { target, queuePath };
}

async function withQueueLock(target, callback) {
  const lockPath = path.join(target, 'queue.lock');
  const lock = await fs.open(lockPath, 'wx');
  try {
    return await callback();
  } finally {
    await lock.close();
    await fs.unlink(lockPath);
  }
}

export async function runEditorialCommand(argv, {
  now = new Date().toISOString(),
  stdout = process.stdout,
  expectedFingerprint,
  expectedUpdatedAt,
} = {}) {
  const { directory, action, itemId, options } = parseArguments(argv);
  validateOptions(action, options);
  const { target, queuePath } = await resolvePrivateQueue(directory);

  await withQueueLock(target, async () => {
    const queue = JSON.parse(await fs.readFile(queuePath, 'utf8'));
    if (expectedFingerprint !== undefined && queue.items.find(item => item.id === itemId)?.fingerprint !== expectedFingerprint) {
      throw new Error('Materiał zmienił się od otwarcia panelu; odśwież i sprawdź ponownie');
    }
    if (expectedUpdatedAt !== undefined && queue.items.find(item => item.id === itemId)?.updatedAt !== expectedUpdatedAt) {
      throw new Error('Decyzja redakcyjna zmieniła się; odśwież panel');
    }
    if (action === 'preview') {
      stdout.write(`${JSON.stringify(buildPublishingProjection(queue, now), null, 2)}\n`);
      return;
    }

    recordEditorialAction(queue, itemId, action, toEditorialInput(options), now);
    const temporaryPath = path.join(target, `queue.${process.pid}.${Date.now()}.tmp`);
    try {
      await fs.writeFile(temporaryPath, `${JSON.stringify(queue, null, 2)}\n`, { flag: 'wx' });
      await fs.rename(temporaryPath, queuePath);
    } finally {
      await fs.rm(temporaryPath, { force: true });
    }
    stdout.write(JSON.stringify({
      ok: true,
      action,
      itemId,
      note: 'Zapisano lokalną decyzję redakcyjną; etykieta operatora nie jest uwierzytelnieniem i niczego nie opublikowano.',
    }) + '\n');
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    await runEditorialCommand(process.argv.slice(2));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
