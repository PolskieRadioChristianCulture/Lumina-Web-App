#!/usr/bin/env node
/**
 * EkoCC LIVE CONTENT V3 — MASTER CYCLE ORCHESTRATOR
 * Główny dyspozytor i orkiestrator automatyzacji redakcyjnych według cyklów:
 * - 15M: Trend Radar (breaking news, deduplikacja, weryfikacja)
 * - 60M: Topics Desk & CC Inside (analiza trendów i autoryzowane nowości)
 * - Daily: Daily Edition (kompilacja wydania dziennego)
 * - Weekly: Weekly Culture Review (przegląd tygodnia mediów i kultury)
 * - QA: Editorial QA (audyt jakości, źródeł, UBG i TTS)
 *
 * Zgodność: Standard JOMA-D005 / Zero-QA Dowódcy / ZERO COST
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { runTrendRadar } from './trend-radar-15m.mjs';
import { runTopicsDesk } from './topics-desk-hourly.mjs';
import { runCcInside } from './cc-inside-hourly.mjs';
import { runDailyEdition } from './daily-edition.mjs';
import { runWeeklyReview } from './weekly-culture-review.mjs';
import { runEditorialQa } from './editorial-qa.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '../..');
const STATE_DIR = path.join(ROOT, 'data/live_content_v3');
const STATE_FILE = path.join(STATE_DIR, 'cycles_state.json');

fs.mkdirSync(STATE_DIR, { recursive: true });

function loadState() {
  if (fs.existsSync(STATE_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    } catch (e) {}
  }
  return {
    lastRadarRun: null,
    lastHourlyRun: null,
    lastDailyRun: null,
    lastWeeklyRun: null,
    lastQaRun: null,
    lastPublishRun: null,
    history: []
  };
}

function saveState(state) {
  if (state.history.length > 50) {
    state.history = state.history.slice(state.history.length - 50);
  }
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf8');
}

export async function orchestrate({ mode = 'auto', force = false } = {}) {
  const state = loadState();
  const now = new Date();
  const nowMs = now.getTime();
  const timestamp = now.toISOString();

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('📡 EkoCC LIVE CONTENT V3 — MASTER CYCLE ORCHESTRATOR START');
  console.log(`⏰ Czas operacji: ${timestamp} | Tryb: ${mode}`);
  console.log('═══════════════════════════════════════════════════════════════');

  const report = {
    executedAt: timestamp,
    mode,
    cyclesExecuted: []
  };

  // 1. CYKL 15M (TREND RADAR)
  const radarDue = force || mode === 'all' || mode === 'radar' ||
    !state.lastRadarRun || (nowMs - new Date(state.lastRadarRun).getTime() >= 15 * 60 * 1000);

  if (radarDue) {
    console.log('\n[CYKL 1/5] Uruchamiam TREND RADAR (15M)...');
    try {
      const res = await runTrendRadar();
      state.lastRadarRun = timestamp;
      report.cyclesExecuted.push({ cycle: 'trend_radar_15m', status: 'OK', result: res });
    } catch (err) {
      console.error('❌ Błąd Trend Radar:', err.message);
      report.cyclesExecuted.push({ cycle: 'trend_radar_15m', status: 'ERROR', error: err.message });
    }
  }

  // 2. CYKL 60M (TOPICS DESK & CC INSIDE)
  const hourlyDue = force || mode === 'all' || mode === 'hourly' ||
    !state.lastHourlyRun || (nowMs - new Date(state.lastHourlyRun).getTime() >= 60 * 60 * 1000);

  if (hourlyDue) {
    console.log('\n[CYKL 2/5] Uruchamiam TOPICS DESK & CC INSIDE (HOURLY)...');
    try {
      const resTopics = await runTopicsDesk();
      const resInside = await runCcInside();
      state.lastHourlyRun = timestamp;
      report.cyclesExecuted.push({ cycle: 'topics_desk_hourly', status: 'OK', result: resTopics });
      report.cyclesExecuted.push({ cycle: 'cc_inside_hourly', status: 'OK', result: resInside });
    } catch (err) {
      console.error('❌ Błąd cyklu godzinowego:', err.message);
      report.cyclesExecuted.push({ cycle: 'hourly_cycle', status: 'ERROR', error: err.message });
    }
  }

  // 3. CYKL DAILY (DAILY EDITION)
  const todayStr = timestamp.slice(0, 10);
  const dailyDue = force || mode === 'all' || mode === 'daily' ||
    !state.lastDailyRun || !state.lastDailyRun.startsWith(todayStr);

  if (dailyDue) {
    console.log('\n[CYKL 3/5] Uruchamiam DAILY EDITION (CODZIENNY)...');
    try {
      const resDaily = await runDailyEdition();
      state.lastDailyRun = timestamp;
      report.cyclesExecuted.push({ cycle: 'daily_edition', status: 'OK', result: resDaily });
    } catch (err) {
      console.error('❌ Błąd Daily Edition:', err.message);
      report.cyclesExecuted.push({ cycle: 'daily_edition', status: 'ERROR', error: err.message });
    }
  }

  // 4. CYKL WEEKLY (WEEKLY CULTURE REVIEW)
  const weeklyDue = force || mode === 'all' || mode === 'weekly' ||
    !state.lastWeeklyRun || (nowMs - new Date(state.lastWeeklyRun).getTime() >= 7 * 24 * 60 * 60 * 1000);

  if (weeklyDue) {
    console.log('\n[CYKL 4/5] Uruchamiam WEEKLY CULTURE REVIEW (TYGODNIOWY)...');
    try {
      const resWeekly = await runWeeklyReview();
      state.lastWeeklyRun = timestamp;
      report.cyclesExecuted.push({ cycle: 'weekly_review', status: 'OK', result: resWeekly });
    } catch (err) {
      console.error('❌ Błąd Weekly Review:', err.message);
      report.cyclesExecuted.push({ cycle: 'weekly_review', status: 'ERROR', error: err.message });
    }
  }

  // 5. EDITORIAL QA AUDIT
  console.log('\n[CYKL 5/5] Uruchamiam EDITORIAL QA AUDIT...');
  try {
    const resQa = await runEditorialQa();
    state.lastQaRun = timestamp;
    report.cyclesExecuted.push({ cycle: 'editorial_qa', status: resQa.passed ? 'PASS' : 'WARN', result: resQa });
  } catch (err) {
    console.error('❌ Błąd Editorial QA:', err.message);
    report.cyclesExecuted.push({ cycle: 'editorial_qa', status: 'ERROR', error: err.message });
  }

  state.history.push({
    timestamp,
    cyclesCount: report.cyclesExecuted.length,
    cycles: report.cyclesExecuted.map(c => `${c.cycle}:${c.status}`)
  });

  saveState(state);

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(`🏁 ZAKOŃCZONO ORKIESTRACJĘ CYKLI. Wykonano modułów: ${report.cyclesExecuted.length}`);
  console.log('═══════════════════════════════════════════════════════════════\n');

  return report;
}

if (process.argv[1] && process.argv[1].endsWith('orchestrate-cycles.mjs')) {
  const arg = process.argv[2] || '--auto';
  const mode = arg.replace(/^--/, '');
  orchestrate({ mode }).then(res => {
    console.log('Podsumowanie wykonania cykli:', JSON.stringify(res.cyclesExecuted.map(c => ({ cycle: c.cycle, status: c.status })), null, 2));
  });
}
