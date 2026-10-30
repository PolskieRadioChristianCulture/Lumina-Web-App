#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { dailyCourseManifest } from './daily-course-manifest.mjs';
import { applyPageStandard } from './cc-page-standard.mjs';
import { renderLumiPage } from './lumi-page.mjs';

const ROOT = process.cwd();
const OUTPUT = path.join(ROOT, '.pages-release');
const BLOCKED_DIRECTORIES = new Set([
  '.agents', '.firebase', '.gemini', '.github', '.vscode', '.wrangler', '_wydanie',
  'cloudflare', 'cloudflare-worker', 'docs', 'firebase_functions', 'functions', 'migrations', 'node_modules',
  'lib', 'scratch', 'scripts', 'src', 'test', 'tests', 'windows_tools',
]);
const BLOCKED_FILES = new Set([
  '.env', '.env.example', '.firebaserc', '.gitignore', '.cc-frozen-approvals.json', 'wydanie-kanaly.log', 'agents.md', 'claude.md',
  'codex.md', 'database.rules.json', 'firebase.json', 'firebase.lumi-agent-test.json', 'firestore.indexes.json',
  'firestore.rules', 'gemini.md', 'package-lock.json', 'package.json',
  'playwright.config.ts', 'server.js', 'storage.rules', 'straznik-kodu-check.js',
  'tsconfig.json', 'validate_lumina.js', 'vite.config.ts', 'vitest.config.ts',
]);
const BLOCKED_EXTENSIONS = new Set([
  '.bak', '.bat', '.cjs', '.map', '.md', '.mjs', '.ps1', '.py', '.ts', '.vue',
  '.xlsx', '.yaml', '.yml',
]);
const REQUIRED_FILES = [
  'data/ccn-article-routes.js', '_headers', '_redirects', '_worker.js', 'lib/bu-voting-worker.js', 'firebase-messaging-sw.js', 'index.html',
  'semantic-index.html', 'lumina.html', 'lumina-tablica.html', 'manifest-lumina.json', 'robots.txt',
  'js/cc-back-to-top.js', 'components/cc-omni-search.js', 'js/cc-favorites.js',
];
const SECRET_PATTERNS = [
  /-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/,
  /["']refresh_token["']\s*:/i,
  /["']client_secret["']\s*:/i,
  /CLOUDFLARE_API_TOKEN\s*[:=]\s*["'][^"']+/i,
];

function normalized(relativePath) {
  return relativePath.replace(/\\/g, '/');
}

function isPublicFile(relativePath) {
  const file = normalized(relativePath);
  if (file === 'lib/bu-voting-worker.js') return true;
  const lower = file.toLowerCase();
  const segments = lower.split('/');
  if (segments.some((segment) => BLOCKED_DIRECTORIES.has(segment))) return false;
  if (BLOCKED_FILES.has(lower) || BLOCKED_FILES.has(path.posix.basename(lower))) return false;
  if (lower.includes('backup') || lower.includes('.matrix_sessions')) return false;
  if (BLOCKED_EXTENSIONS.has(path.posix.extname(lower))) return false;
  return true;
}

const trackedChanges = execFileSync('git', ['status', '--porcelain', '--untracked-files=no'], {
  cwd: ROOT,
  encoding: 'utf8',
  windowsHide: true,
}).trim();
if (trackedChanges) {
  throw new Error('Wydanie przerwane: pliki kontrolowane przez Git nie są czyste. Najpierw zatwierdź albo wycofaj zmiany.');
}

const resolvedOutput = path.resolve(OUTPUT);
if (path.dirname(resolvedOutput) !== path.resolve(ROOT) || path.basename(resolvedOutput) !== '.pages-release') {
  throw new Error('Nieprawidłowy katalog wydania.');
}
fs.rmSync(resolvedOutput, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });
fs.mkdirSync(resolvedOutput, { recursive: true });

const tracked = execFileSync('git', ['ls-files', '-z'], {
  cwd: ROOT,
  encoding: 'utf8',
  windowsHide: true,
  maxBuffer: 32 * 1024 * 1024,
}).split('\0').filter(Boolean);

let copied = 0;
for (const relativePath of tracked) {
  if (!isPublicFile(relativePath)) continue;
  const source = path.resolve(ROOT, relativePath);
  const destination = path.resolve(resolvedOutput, relativePath);
  if (!destination.startsWith(`${resolvedOutput}${path.sep}`)) {
    throw new Error(`Próba wyjścia poza katalog wydania: ${relativePath}`);
  }
  const sourceStat = fs.lstatSync(source);
  if (sourceStat.isSymbolicLink() || !sourceStat.isFile()) {
    throw new Error(`Niedozwolony typ pliku: ${relativePath}`);
  }
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  if (relativePath.toLowerCase().endsWith('.html')) {
    const original = fs.readFileSync(source, 'utf8');
    const standardized = applyPageStandard(relativePath, original);
    if (standardized === original) fs.copyFileSync(source, destination);
    else fs.writeFileSync(destination, standardized);
  } else {
    fs.copyFileSync(source, destination);
  }
  copied++;
}

// One chat implementation, two entry experiences. Never copy/maintain a fork.
fs.writeFileSync(path.join(resolvedOutput, 'mess.html'), renderLumiPage(fs.readFileSync(path.join(resolvedOutput, 'lumina.html'), 'utf8')));

for (const required of REQUIRED_FILES) {
  if (!fs.existsSync(path.join(resolvedOutput, required))) {
    throw new Error(`Wydanie przerwane: brakuje ${required}.`);
  }
}

const textExtensions = new Set(['.css', '.html', '.js', '.json', '.txt', '.webmanifest', '.xml']);
function scan(directory) {
  if (!fs.existsSync(directory)) return;
  let entries;
  for (let r = 0; r < 5; r++) {
    try {
      entries = fs.readdirSync(directory, { withFileTypes: true });
      break;
    } catch (err) {
      if (r === 4) return;
      const wait = Date.now() + 50;
      while (Date.now() < wait) {}
    }
  }
  if (!entries) return;
  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      scan(absolute);
      continue;
    }
    if (!textExtensions.has(path.extname(entry.name).toLowerCase())) continue;
    let stat;
    for (let r = 0; r < 5; r++) {
      try {
        stat = fs.statSync(absolute);
        break;
      } catch (err) {
        if (r === 4) break;
        const wait = Date.now() + 50;
        while (Date.now() < wait) {}
      }
    }
    if (!stat || stat.size > 5 * 1024 * 1024) continue;
    let content;
    for (let r = 0; r < 5; r++) {
      try {
        content = fs.readFileSync(absolute, 'utf8');
        break;
      } catch (err) {
        if (r === 4) break;
        const wait = Date.now() + 50;
        while (Date.now() < wait) {}
      }
    }
    if (!content) continue;
    const matched = SECRET_PATTERNS.find((pattern) => pattern.test(content));
    if (matched) throw new Error(`Wydanie przerwane: wykryto sekret w ${path.relative(resolvedOutput, absolute)}.`);
  }
}
const courseManifest = dailyCourseManifest(tracked,file=>fs.readFileSync(path.join(ROOT,file),'utf8'));
fs.mkdirSync(path.join(resolvedOutput,'data'),{recursive:true});
fs.writeFileSync(path.join(resolvedOutput,'data','daily-course-push.json'),JSON.stringify(courseManifest));
scan(resolvedOutput);

console.log(JSON.stringify({ output: resolvedOutput, copied, source: 'tracked-clean-worktree' }, null, 2));
