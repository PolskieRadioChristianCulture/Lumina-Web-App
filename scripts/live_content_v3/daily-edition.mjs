#!/usr/bin/env node
/**
 * EkoCC • DAILY EDITION
 * Codzienne zestawienie najważniejszych materiałów w kategoriach.
 *
 * Zadanie:
 * - Zbierz zweryfikowane źródła i odkryte premiery.
 * - Przygotuj dzienny zestaw (1–3 evergreeny + autopromocja CC INSIDE).
 * - Weryfikacja TTS readiness, leadów i linków przed przedłożeniem do zatwierdzenia.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '../..');
const DRAFTS_DIR = path.join(ROOT, 'data/live_content_v3/drafts');

export async function runDailyEdition() {
  console.log('[DAILY EDITION] Kompilacja dziennego zestawu materiałów EkoCC...');
  const files = fs.readdirSync(DRAFTS_DIR).filter(f => f.endsWith('.json'));
  const drafts = files.map(f => JSON.parse(fs.readFileSync(path.join(DRAFTS_DIR, f), 'utf8')));

  console.log(`[DAILY EDITION] Odnaleziono ${drafts.length} szkiców w kolejce redakcyjnej.`);
  const summary = {
    date: new Date().toISOString().slice(0, 10),
    draftsCount: drafts.length,
    items: drafts.map(d => ({
      id: d.id,
      title: d.title,
      category: d.category,
      author: d.author,
      status: d.status,
      ttsReady: Boolean(d.tts_text && d.tts_text.length > 50)
    }))
  };

  const editionPath = path.join(ROOT, 'data/live_content_v3/daily_edition_summary.json');
  fs.writeFileSync(editionPath, JSON.stringify(summary, null, 2), 'utf8');
  console.log(`[DAILY EDITION] Zapisano podsumowanie wydania: ${editionPath}`);

  return summary;
}

if (process.argv[1] && process.argv[1].endsWith('daily-edition.mjs')) {
  runDailyEdition().then(res => console.log('Zestaw Dzienny:', JSON.stringify(res, null, 2)));
}
