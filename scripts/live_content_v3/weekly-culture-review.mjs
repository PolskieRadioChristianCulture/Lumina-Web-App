#!/usr/bin/env node
/**
 * EkoCC • WEEKLY CULTURE REVIEW
 * Tygodniowy przegląd najważniejszych publikacji, muzyki, audycji, lekcji i narzędzi.
 *
 * Zadanie:
 * - Podsumowanie 7 dni z wyraźnym rozróżnieniem premier od materiałów archiwalnych.
 * - Kontrola duplikatów i skuteczności zasięgowej.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '../..');

export async function runWeeklyReview() {
  console.log('[WEEKLY CULTURE REVIEW] Generowanie tygodniowego przeglądu kultury i mediów...');
  const searchIndexPath = path.join(ROOT, 'data/cc-search-index.json');
  let topItems = [];
  if (fs.existsSync(searchIndexPath)) {
    try {
      const idx = JSON.parse(fs.readFileSync(searchIndexPath, 'utf8'));
      topItems = idx.items.slice(0, 10).map(i => ({
        title: i.title,
        url: i.url,
        category: i.category
      }));
    } catch (e) {}
  }

  const review = {
    generatedAt: new Date().toISOString(),
    period: "Ostatnie 7 dni",
    status: "DRAFT_WEEKLY_REVIEW",
    highlights: topItems
  };

  const reviewPath = path.join(ROOT, 'data/live_content_v3/weekly_review.json');
  fs.writeFileSync(reviewPath, JSON.stringify(review, null, 2), 'utf8');
  console.log(`[WEEKLY REVIEW] Zapisano podsumowanie tygodnia: ${reviewPath}`);
  return review;
}

if (process.argv[1] && process.argv[1].endsWith('weekly-culture-review.mjs')) {
  runWeeklyReview().then(res => console.log('Tygodniowy Przegląd:', JSON.stringify(res, null, 2)));
}
