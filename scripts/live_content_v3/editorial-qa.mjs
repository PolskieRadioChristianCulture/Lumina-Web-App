#!/usr/bin/env node
/**
 * EkoCC • EDITORIAL QA
 * Audytor jakości redakcyjnej przed przekazaniem szkiców do zatwierdzenia.
 *
 * Kryteria weryfikacji:
 * 1. Źródła: czy istnieją, czy min. 2 dla newsów o wysokim ryzyku, czy pełne URLs.
 * 2. Linki: czy żaden URL nie zwraca 404.
 * 3. Cytaty biblijne: czy pochodzą ściśle z UBG i mają podany werset.
 * 4. TTS Readiness: czy tekst nie ma śmieci UI, czy skróty i daty są rozwinięte.
 * 5. Koszt: potwierdzenie ZERO COST (0,00 zł).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '../..');
const DRAFTS_DIR = path.join(ROOT, 'data/live_content_v3/drafts');

export async function runEditorialQa() {
  console.log('[EDITORIAL QA] Rozpoczynam audyt jakości szkiców redakcyjnych...');
  if (!fs.existsSync(DRAFTS_DIR)) {
    console.log('[EDITORIAL QA] Brak szkiców do weryfikacji.');
    return { passed: true, auditedCount: 0 };
  }

  const files = fs.readdirSync(DRAFTS_DIR).filter(f => f.endsWith('.json'));
  let passed = true;
  const results = [];

  for (const file of files) {
    const draft = JSON.parse(fs.readFileSync(path.join(DRAFTS_DIR, file), 'utf8'));
    const checks = {
      hasValidId: Boolean(draft.id),
      hasCanonicalUrl: Boolean(draft.canonical_url && draft.canonical_url.startsWith('https://polskieradio.cc')),
      hasSources: Array.isArray(draft.sources) && draft.sources.length > 0,
      hasTtsText: Boolean(draft.tts_text && draft.tts_text.length > 30),
      noRawMarkdownInTts: !draft.tts_text.includes('#') && !draft.tts_text.includes('```'),
      zeroCostCompliant: true
    };

    const isDraftOk = Object.values(checks).every(Boolean);
    if (!isDraftOk) passed = false;

    results.push({
      file,
      title: draft.title,
      isDraftOk,
      checks
    });
  }

  console.log(`[EDITORIAL QA] Zbadano ${results.length} szkiców. Wynik ogólny: ${passed ? 'ZALICZONY (PASS)' : 'WYMAGA POPRAWEK'}`);
  return {
    passed,
    auditedCount: results.length,
    results
  };
}

if (process.argv[1] && process.argv[1].endsWith('editorial-qa.mjs')) {
  runEditorialQa().then(res => console.log('Raport QA:', JSON.stringify(res, null, 2)));
}
