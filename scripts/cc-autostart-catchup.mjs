#!/usr/bin/env node
/**
 * CC AUTOSTART & CATCH-UP SENTINEL
 * Strażnik Nadrabiania Zaległości po Włączeniu Komputera
 *
 * Uruchamia się automatycznie przy starcie systemu Windows.
 * Jeśli o wyznaczonej godzinie (00:00, 06:00, 14:00, 22:00) komputer był wyłączony,
 * ten proces natychmiast wykrywa zaległość, publikuje materiały i wdraża na żywo (200 OK)!
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const logsDir = path.join(ROOT, 'logs');
fs.mkdirSync(logsDir, { recursive: true });
const logFile = path.join(logsDir, 'autostart-catchup.log');

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  fs.appendFileSync(logFile, line + '\n', 'utf8');
}

log('═══════════════════════════════════════════════════════════════');
log('🖥️ CC AUTOSTART & CATCH-UP SENTINEL WYSTARTOWAŁ');

async function checkLiveUrl(url) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'CC-Autostart-Sentinel/1.0' } });
    return res.status === 200;
  } catch (e) {
    return false;
  }
}

async function runCatchUp() {
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const dayOfMonth = now.getDate(); // np. 30
  log(`Data systemowa: ${todayStr}, dzień miesiąca: ${dayOfMonth}`);

  let actionsTaken = 0;

  // ── 1. KONTROLA NOCNEJ LEKCJI AKADEMII BIBLIJNEJ (00:00) ──
  const todayLessonUrl = `https://polskieradio.cc/akademia/kurscodzienny/dzien-${dayOfMonth}`;
  log(`Sprawdzanie dostępności lekcji Dnia ${dayOfMonth}: ${todayLessonUrl}...`);
  const isLessonLive = await checkLiveUrl(todayLessonUrl);

  if (!isLessonLive) {
    log(`⚠️ ZALEGŁOŚĆ WYKRYTA: Lekcja Dnia ${dayOfMonth} nie odpowiada z kodem 200 OK! Komputer był prawdopodobnie wyłączony o północy.`);
    log(`🚀 Rozpoczynam awaryjną publikację lekcji Akademii...`);
    try {
      execSync('node scripts/sync-akademia-kurscodzienny.mjs', { cwd: ROOT, stdio: 'inherit' });
      execSync('node scripts/cc-universal-publish-discovery.mjs', { cwd: ROOT, stdio: 'inherit' });
      log(`✅ SUKCES: Lekcja Dnia ${dayOfMonth} została opublikowana i wdrożona na serwer!`);
      actionsTaken++;
    } catch (err) {
      log(`❌ Błąd podczas nadrabiania lekcji: ${err.message}`);
    }
  } else {
    log(`✅ Lekcja Dnia ${dayOfMonth} jest już aktywna na żywo (200 OK).`);
  }

  // ── 2. KONTROLA PORANNYCH ROZWAŻAŃ BAZY (06:00) ──
  try {
    const bazaPath = path.join(ROOT, 'rozwazania_baza.json');
    if (fs.existsSync(bazaPath)) {
      const baza = JSON.parse(fs.readFileSync(bazaPath, 'utf8'));
      const hasTodayReflection = Array.isArray(baza) && baza.some(r => r.date === todayStr || r.dayNumber === dayOfMonth);
      if (!hasTodayReflection) {
        log(`⚠️ ZALEGŁOŚĆ WYKRYTA: Brak wpisu rozważania na ${todayStr} w bazie.`);
        execSync('node scripts/prepare-day30-reflection.mjs', { cwd: ROOT, stdio: 'inherit' });
        actionsTaken++;
      } else {
        log(`✅ Baza rozważań na dzień ${todayStr} jest aktualna.`);
      }
    }
  } catch (err) {
    log(`ℹ️ Sprawdzanie bazy rozważań: ${err.message}`);
  }

  // ── 3. KONTROLA ARTYKUŁU TRENDOWEGO (14:00) ──
  const hour = now.getHours();
  if (hour >= 14) {
    log(`Godzina ${hour}:00 >= 14:00 — weryfikacja czy dzisiejszy artykuł trendowy został opublikowany...`);
    const articlesTsPath = path.join(ROOT, 'portals/ccn-news/src/data/articles.ts');
    if (fs.existsSync(articlesTsPath)) {
      const tsCode = fs.readFileSync(articlesTsPath, 'utf8');
      if (!tsCode.includes(todayStr)) {
        log(`⚠️ ZALEGŁOŚĆ WYKRYTA: Brak artykułu trendowego z datą ${todayStr}. Uruchamiam generator...`);
        try {
          execSync('node scripts/publish-today-trend-article.mjs', { cwd: ROOT, stdio: 'inherit' });
          actionsTaken++;
          log(`✅ Artykuł trendowy na dziś opublikowany pomyślnie.`);
        } catch (err) {
          log(`❌ Błąd generowania artykułu: ${err.message}`);
        }
      } else {
        log(`✅ Dzisiejszy artykuł trendowy jest już w bazie.`);
      }
    }
  }

  // ─── 4. KONTROLA I ODŚWIEŻENIE PASKÓW NADAWCZYCH TV ───
  try {
    log('📺 Odświeżanie pasków informacyjnych kanałów TV...');
    execSync('node scripts/update-broadcast-tickers.mjs', { cwd: ROOT, stdio: 'inherit' });
    log('✅ Paski informacyjne kanałów nadawczych zsynchronizowane.');
  } catch (err) {
    log(`⚠️ Błąd odświeżania pasków TV: ${err.message}`);
  }

  // ─── 5. KONTROLA I ODŚWIEŻENIE OKNA I PROPOZYCJI /WYSZUKIWARKA ───
  try {
    log('🔍 Odświeżanie tętniącego życiem okna wyszukiwarki (Polecane na dziś)...');
    execSync('node scripts/update-search-recommendations.mjs', { cwd: ROOT, stdio: 'inherit' });
    log('✅ Dynamiczne propozycje /wyszukiwarka zsynchronizowane.');
  } catch (err) {
    log(`⚠️ Błąd odświeżania propozycji wyszukiwarki: ${err.message}`);
  }
  // ─── 6. KONTROLA I WYKONANIE CYKLI LIVE CONTENT V3 (Trend Radar & CC Inside) ───
  try {
    log('📡 Sprawdzanie i nadrabianie cykli redakcyjnych LIVE CONTENT V3...');
    execSync('node scripts/live_content_v3/orchestrate-cycles.mjs --auto', { cwd: ROOT, stdio: 'inherit' });
    log('✅ Cykle redakcyjne LIVE CONTENT V3 zsynchronizowane.');
  } catch (err) {
    log('⚠️ Błąd orkiestracji cykli LIVE CONTENT V3: ' + err.message);
  }



  log(`🏁 Zakończono skanowanie autostartu. Wykonano nadrzędnych akcji: ${actionsTaken}.`);
  log('═══════════════════════════════════════════════════════════════\n');
}

runCatchUp().catch(err => {
  log(`❌ KRYTYCZNY BŁĄD AUTOSTARTU: ${err.message}`);
});
