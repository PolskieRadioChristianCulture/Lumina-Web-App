#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const OUTPUT = path.join(ROOT, '.pages-release');
const BLOCKED_DIRECTORIES = new Set([
  '.agents', '.firebase', '.gemini', '.github', '.vscode', '.wrangler',
  'cloudflare', 'docs', 'firebase_functions', 'functions', 'node_modules',
  'scratch', 'scripts', 'src', 'test', 'tests', 'windows_tools',
]);
const BLOCKED_FILES = new Set([
  '.env', '.env.example', '.firebaserc', '.gitignore', 'agents.md', 'claude.md',
  'codex.md', 'database.rules.json', 'firebase.json', 'firestore.indexes.json',
  'firestore.rules', 'gemini.md', 'package-lock.json', 'package.json',
  'playwright.config.ts', 'server.js', 'storage.rules', 'straznik-kodu-check.js',
  'tsconfig.json', 'validate_lumina.js', 'vite.config.ts', 'vitest.config.ts',
]);
const BLOCKED_EXTENSIONS = new Set([
  '.bak', '.bat', '.cjs', '.map', '.md', '.mjs', '.ps1', '.py', '.ts', '.vue',
  '.xlsx', '.yaml', '.yml',
]);
const REQUIRED_FILES = [
  '_headers', '_redirects', '_worker.js', 'firebase-messaging-sw.js', 'index.html',
  'lumina.html', 'lumina-tablica.html', 'manifest-lumina.json', 'robots.txt',
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
fs.rmSync(resolvedOutput, { recursive: true, force: true });
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
  fs.copyFileSync(source, destination);
  copied++;
}

for (const required of REQUIRED_FILES) {
  if (!fs.existsSync(path.join(resolvedOutput, required))) {
    throw new Error(`Wydanie przerwane: brakuje ${required}.`);
  }
}

const textExtensions = new Set(['.css', '.html', '.js', '.json', '.txt', '.webmanifest', '.xml']);
function scan(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      scan(absolute);
      continue;
    }
    if (!textExtensions.has(path.extname(entry.name).toLowerCase())) continue;
    if (fs.statSync(absolute).size > 5 * 1024 * 1024) continue;
    const content = fs.readFileSync(absolute, 'utf8');
    const matched = SECRET_PATTERNS.find((pattern) => pattern.test(content));
    if (matched) throw new Error(`Wydanie przerwane: wykryto sekret w ${path.relative(resolvedOutput, absolute)}.`);
  }
}
scan(resolvedOutput);

console.log(JSON.stringify({ output: resolvedOutput, copied, source: 'tracked-clean-worktree' }, null, 2));
