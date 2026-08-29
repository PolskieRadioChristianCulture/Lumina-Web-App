#!/usr/bin/env node
/**
 * LUMINA smoke test: szybka kontrola plików wymaganych do uruchomienia
 * kluczowych widoków portalu. Nie wymaga sieci ani danych produkcyjnych.
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, '..');
const failures = [];
const checkedScripts = new Set();

const pages = {
  'lumina.html': [
    'lumina-db.js',
    'lumina-core.js',
    'lumina-security.js',
    'lumina-i18n.js',
    'lumina-pwa-installer.js',
  ],
  'lumina-profile.html': [
    'lumina-db.js',
    'lumina-core.js',
    'lumina-security.js',
    'lumina-premium-video-avatar.js',
  ],
  'lumina-tablica.html': [
    'lumina-db.js',
    'lumina-core.js',
    'lumina-security.js',
    'lumina-tablica.js',
  ],
};

function fail(message) {
  failures.push(message);
}

function readProjectFile(relativePath) {
  const absolutePath = path.resolve(root, relativePath);
  const relativeToRoot = path.relative(root, absolutePath);
  if (relativeToRoot.startsWith('..') || path.isAbsolute(relativeToRoot)) {
    fail(`Niedozwolone odwołanie poza repozytorium: ${relativePath}`);
    return null;
  }
  if (!fs.existsSync(absolutePath)) {
    fail(`Brak wymaganego pliku: ${relativePath}`);
    return null;
  }
  return fs.readFileSync(absolutePath, 'utf8');
}

function localScriptSources(html) {
  const sources = [];
  const sourcePattern = /<script\b[^>]*\bsrc\s*=\s*["']([^"']+)["'][^>]*>/gi;
  let match;
  while ((match = sourcePattern.exec(html)) !== null) {
    const source = match[1].trim();
    if (/^(?:https?:)?\/\//i.test(source) || /^(?:data|blob):/i.test(source)) continue;
    const normalized = source.split(/[?#]/, 1)[0].replace(/^\.\//, '');
    if (normalized) sources.push(normalized);
  }
  return sources;
}

function checkJavaScript(relativePath) {
  if (checkedScripts.has(relativePath)) return;
  checkedScripts.add(relativePath);

  const absolutePath = path.resolve(root, relativePath);
  const result = spawnSync(process.execPath, ['--check', absolutePath], {
    cwd: root,
    encoding: 'utf8',
  });
  if (result.status !== 0) {
    fail(`Błąd składni JavaScript: ${relativePath}\n${(result.stderr || result.stdout).trim()}`);
  }
}

for (const [page, requiredScripts] of Object.entries(pages)) {
  const html = readProjectFile(page);
  if (!html) continue;

  const sources = localScriptSources(html);
  const duplicates = sources.filter((source, index) => sources.indexOf(source) !== index);
  if (duplicates.length > 0) {
    fail(`${page}: powielone lokalne importy skryptów: ${[...new Set(duplicates)].join(', ')}`);
  }

  for (const requiredScript of requiredScripts) {
    if (!sources.includes(requiredScript)) {
      fail(`${page}: brak wymaganego skryptu ${requiredScript}`);
    }
  }

  for (const source of sources) {
    const content = readProjectFile(source);
    if (content !== null && source.endsWith('.js')) checkJavaScript(source);
  }

  if (!/rel\s*=\s*["']manifest["']/i.test(html)) {
    fail(`${page}: brak odwołania do manifestu PWA`);
  }
}

const manifestText = readProjectFile('manifest-lumina.json');
if (manifestText) {
  try {
    const manifest = JSON.parse(manifestText);
    for (const field of ['name', 'short_name', 'start_url']) {
      if (!manifest[field]) fail(`manifest-lumina.json: brak pola ${field}`);
    }
    if (!Array.isArray(manifest.icons) || manifest.icons.length === 0) {
      fail('manifest-lumina.json: brak ikon PWA');
    }
  } catch (error) {
    fail(`manifest-lumina.json: niepoprawny JSON (${error.message})`);
  }
}

readProjectFile('firebase-messaging-sw.js');

const functionsDirectory = path.join(root, 'functions');
if (fs.existsSync(functionsDirectory)) {
  for (const file of fs.readdirSync(functionsDirectory).filter(file => file.endsWith('.js'))) {
    checkJavaScript(path.join('functions', file));
  }
}

if (failures.length > 0) {
  console.error('\nLUMINA smoke test: NIEPOWODZENIE\n');
  for (const message of failures) console.error(`- ${message}`);
  process.exit(1);
}

console.log(`LUMINA smoke test: OK (${Object.keys(pages).length} kluczowe widoki, ${checkedScripts.size} plików JavaScript).`);
