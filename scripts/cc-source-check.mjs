import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// Deliberately fixed scope: no secret files, recursive data scans or remote calls.
export const CORE_FILES = Object.freeze([
  'index.html', 'lumina.html', 'lumina-profile.html', 'lumina-tablica.html',
  'lumina-db.js', 'lumina-bottom-nav.js', 'holos.html', 'akademia.html',
  '_redirects', '_worker.js', 'package.json', 'js/cc-global-auth.js',
  'js/holos-calendar-sync.js', 'scripts/build-pages-release.mjs',
  'cloudflare-worker/lumina-push/src/index.js',
]);
const sha = value => createHash('sha256').update(value).digest('hex');
const normalize = value => value.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').trimEnd();

function fileEvidence(root, relative) {
  const resolvedRoot = fs.realpathSync(root);
  const candidate = path.resolve(resolvedRoot, relative);
  if (!candidate.startsWith(resolvedRoot + path.sep)) throw new Error('Out-of-scope path');
  if (!fs.existsSync(candidate)) return { state: 'missing' };
  const actual = fs.realpathSync(candidate);
  if (!actual.startsWith(resolvedRoot + path.sep)) return { state: 'unsafe-link' };
  const stat = fs.statSync(actual);
  if (!stat.isFile() || stat.size > 5 * 1024 * 1024) return { state: 'unsupported' };
  const bytes = fs.readFileSync(actual);
  return { state: 'present', bytes: bytes.length, sha256: sha(bytes), normalizedSha256: sha(normalize(bytes.toString('utf8'))) };
}

function gitEvidence(root) {
  const git = args => execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: 'pipe', windowsHide: true, timeout: 10000, maxBuffer: 8 * 1024 * 1024 });
  try {
    const before = git(['rev-parse', 'HEAD']).trim();
    const changes = git(['status', '--porcelain=v1', '-z']).split('\0').filter(Boolean);
    const after = git(['rev-parse', 'HEAD']).trim();
    return { state: 'available', commit: after, stableDuringRead: before === after,
      clean: changes.length === 0, statusRecordCount: changes.length };
  } catch { return { state: 'unavailable' }; }
}

export function inspectSources(source, mirror) {
  if (fs.realpathSync(source) === fs.realpathSync(mirror)) throw new Error('Source and mirror must be different directories');
  const before = gitEvidence(source);
  const files = CORE_FILES.map(file => {
    const a = fileEvidence(source, file), b = fileEvidence(mirror, file);
    const state = a.state !== 'present' || b.state !== 'present'
      ? 'uncomparable' : a.sha256 === b.sha256 ? 'equal' : a.normalizedSha256 === b.normalizedSha256 ? 'format-only' : 'different';
    return { file, state, source: a, mirror: b };
  });
  const after = gitEvidence(source);
  const mirrorGit = gitEvidence(mirror);
  const discrepancies = files.filter(item => !['equal', 'format-only'].includes(item.state)).length;
  return { schemaVersion: 1, generatedAt: new Date().toISOString(),
    scope: '15 fixed core files; filesystem evidence only',
    sourceRole: 'canonical-working-repository', mirrorRole: 'reference-copy-not-a-deployment-source',
    sourceGit: after, mirrorGit,
    sourceCommitStableDuringScan: before.state === 'available' && after.state === 'available' &&
      before.commit === after.commit && before.stableDuringRead && after.stableDuringRead,
    discrepancies, files,
    production: { state: 'not-checked' },
    releaseReady: false,
    limitation: 'Read-only snapshot, not an atomic snapshot or proof of deployment. Concurrent file edits may occur. No copying, deletion, commit, push or deploy.' };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    if (process.argv.length !== 4) throw new Error('Usage: node scripts/cc-source-check.mjs <source-directory> <mirror-directory>');
    const report = inspectSources(process.argv[2], process.argv[3]);
    process.stdout.write(JSON.stringify(report, null, 2) + '\n');
    process.exitCode = report.discrepancies || !report.sourceCommitStableDuringScan ? 2 : 0;
  } catch {
    process.stderr.write('Source check failed: provide two existing, distinct directories. No changes were made.\n');
    process.exitCode = 1;
  }
}
