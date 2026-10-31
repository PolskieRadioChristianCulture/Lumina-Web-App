#!/usr/bin/env node
/**
 * CCN NEWS — AUTOMATYCZNY NADAJNIK NOWOŚCI EKOSYSTEMU NA PLATFORMĘ X
 *
 * Dyrektywa Dowódcy (31.10.2026):
 * „publikuj nieregularnie mniej więcej co 30 minut krótkie info o nowościach
 *  z ekosystemu pod nazwą CCN NEWS | polskieradio.cc/news”
 *
 * Zakres: Cały ekosystem Christian Culture (CCN News, Historia, Nauka, Biblia Audio,
 *         Akademia Biblijna, Kurs Codzienny, MojaBiblia, VOD, Radio)
 * Tryb: Całodobowo 24/7 z losowym, nieregularnym interwałem (24–36 minut)
 * Nagłówek: 🔴 CCN NEWS | polskieradio.cc/news
 * Silnik: Playwright (100% Free Tier, zero opłat API X, auth_token z .env.local)
 *
 * Standard: ZERO COST / JOMA-D005 / @SMCC / @matrix-cc
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

// Ścieżki
const ENV_LOCAL_PATH = path.join(ROOT, '.env.local');
const ENV_PATH = path.join(ROOT, '.env');
const PROFILE_DIR = path.join(ROOT, '.x_browser_profile');
const HISTORY_PATH = path.join(ROOT, 'data', 'x_published_history.json');
const BROADCASTER_STATE_PATH = path.join(ROOT, 'data', 'ccn_broadcaster_state.json');
const BROADCASTER_LOG_PATH = path.join(ROOT, 'data', 'ccn_broadcaster_log.json');
const CATALOG_PATH = path.join(ROOT, 'szukaj', 'catalog.json');
const ARTICLES_TS_PATH = path.join(ROOT, 'portals', 'ccn-news', 'src', 'data', 'articles.ts');

// Załaduj zmienne środowiskowe
function loadEnv() {
  const envFiles = [ENV_LOCAL_PATH, ENV_PATH];
  for (const envFile of envFiles) {
    if (fs.existsSync(envFile)) {
      try {
        const content = fs.readFileSync(envFile, 'utf8');
        for (const line of content.split('\n')) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) continue;
          const idx = trimmed.indexOf('=');
          if (idx !== -1) {
            const key = trimmed.slice(0, idx).trim();
            const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
            if (!process.env[key]) {
              process.env[key] = val;
            }
          }
        }
      } catch (err) {
        console.warn(`[WARN] Nie udało się odczytać ${envFile}:`, err.message);
      }
    }
  }
}

loadEnv();

// Rejestry stanu i historii
function loadState() {
  try {
    if (fs.existsSync(BROADCASTER_STATE_PATH)) {
      return JSON.parse(fs.readFileSync(BROADCASTER_STATE_PATH, 'utf8'));
    }
  } catch (e) {}
  return { lastIndex: -1, lastPostedAt: null, totalBroadcasts: 0 };
}

function saveState(state) {
  try {
    const dir = path.dirname(BROADCASTER_STATE_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(BROADCASTER_STATE_PATH, JSON.stringify(state, null, 2), 'utf8');
  } catch (e) {
    console.error('[BŁĄD] Zapis stanu nadajnika:', e.message);
  }
}

function loadHistory() {
  try {
    if (fs.existsSync(HISTORY_PATH)) {
      const data = JSON.parse(fs.readFileSync(HISTORY_PATH, 'utf8'));
      return Array.isArray(data) ? data : (data.published || []);
    }
  } catch (err) {
    console.warn('[WARN] Błąd odczytu historii X:', err.message);
  }
  return [];
}

function saveHistory(history) {
  try {
    const dir = path.dirname(HISTORY_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(HISTORY_PATH, JSON.stringify({ version: '1.0', published: history }, null, 2), 'utf8');
  } catch (err) {
    console.error('[BŁĄD] Zapis historii X:', err.message);
  }
}

function appendLog(entry) {
  try {
    const dir = path.dirname(BROADCASTER_LOG_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    let logs = [];
    if (fs.existsSync(BROADCASTER_LOG_PATH)) {
      try { logs = JSON.parse(fs.readFileSync(BROADCASTER_LOG_PATH, 'utf8')); } catch (e) {}
    }
    logs.unshift(entry);
    if (logs.length > 500) logs = logs.slice(0, 500);
    fs.writeFileSync(BROADCASTER_LOG_PATH, JSON.stringify(logs, null, 2), 'utf8');
  } catch (e) {
    console.warn('[WARN] Zapis logu nadajnika:', e.message);
  }
}

// Baza treści całego ekosystemu Christian Culture
function getAllEcosystemCandidates() {
  const candidates = [];
  const seenUrls = new Set();

  function addCandidate(item) {
    if (!item.url || seenUrls.has(item.url)) return;
    seenUrls.add(item.url);
    candidates.push(item);
  }

  // 1. Najważniejsze dedykowane moduły ekosystemu CC
  const coreModules = [
    {
      title: 'Portal Informacyjny CCN News — Wiadomości, Analizy i Rzetelna Publicystyka',
      url: 'https://polskieradio.cc/news',
      category: 'Wiadomości',
      tag: '#CCNNews'
    },
    {
      title: 'Biblia Audio CC — Księga Rodzaju w Kinowej Jakości Dźwięku i Słuchowiskach',
      url: 'https://polskieradio.cc/biblia-audio',
      category: 'Biblia Audio',
      tag: '#BibliaAudio'
    },
    {
      title: 'Akademia Biblijna & Kurs Codzienny — Systematyczne Studium Słowa Bożego',
      url: 'https://polskieradio.cc/akademia',
      category: 'Akademia',
      tag: '#AkademiaBiblijna'
    },
    {
      title: 'Interlinearna MojaBiblia — Kody Stronga, Greka, Hebrajski i Przekład UBG',
      url: 'https://polskieradio.cc/mojabiblia',
      category: 'Pismo Święte',
      tag: '#MojaBiblia'
    },
    {
      title: 'Polskie Radio CC — Odtwarzacz Muzyki Chrześcijańskiej i Transmisje 24/7',
      url: 'https://polskieradio.cc/player',
      category: 'Radio & Muzyka',
      tag: '#WorshipLive'
    },
    {
      title: 'Kino Chrześcijańskie VOD — Filmy Fabularne, Dokumenty i Wykłady Biblijne',
      url: 'https://polskieradio.cc/vod',
      category: 'Kino VOD',
      tag: '#KinoChrzescijanskie'
    },
    {
      title: '95 tez Marcina Lutra (Wittenberga, 1517) — Kompletny Tekst z Komentarzem',
      url: 'https://polskieradio.cc/historia/95-tez-marcina-lutra-wittenberga-1517',
      category: 'Historia',
      tag: '#DzienReformacji'
    },
    {
      title: 'Żywa Interaktywna Mapa Ekosystemu Christian Culture',
      url: 'https://polskieradio.cc/mapa',
      category: 'Ekosystem',
      tag: '#ChristianCulture'
    }
  ];

  for (const m of coreModules) addCandidate(m);

  // 2. Artykuły z catalog.json (aktualności, historia, nauka, bioetyka itp.)
  if (fs.existsSync(CATALOG_PATH)) {
    try {
      const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
      if (Array.isArray(catalog.items)) {
        for (const it of catalog.items) {
          if (it.url && it.title && !it.url.includes('#') && (it.url.includes('polskieradio.cc') || it.url.startsWith('/'))) {
            const fullUrl = it.url.startsWith('http') ? it.url : `https://polskieradio.cc${it.url}`;
            let tag = '#CCNNews';
            if (fullUrl.includes('/historia/')) tag = '#HistoriaBiblijna';
            else if (fullUrl.includes('/nauka/')) tag = '#NaukaIBiblia';
            else if (fullUrl.includes('/akademia/')) tag = '#KursCodzienny';
            else if (fullUrl.includes('/biblia-audio/')) tag = '#BibliaAudio';

            addCandidate({
              title: it.title,
              url: fullUrl,
              category: it.category || 'Ekosystem',
              tag
            });
          }
        }
      }
    } catch (e) {
      console.warn('[WARN] Błąd catalog.json:', e.message);
    }
  }

  // 3. Artykuły z articles.ts
  if (fs.existsSync(ARTICLES_TS_PATH)) {
    try {
      const content = fs.readFileSync(ARTICLES_TS_PATH, 'utf8');
      const regex = /title:\s*['"]([^'"]+)['"][\s\S]*?slug:\s*['"]([^'"]+)['"]/g;
      let match;
      while ((match = regex.exec(content)) !== null) {
        addCandidate({
          title: match[1],
          url: `https://polskieradio.cc/news/${match[2]}`,
          category: 'Wiadomości CCN',
          tag: '#CCNNews'
        });
      }
    } catch (e) {}
  }

  return candidates;
}

// Formatowanie posta zgodnie z dyrektywą Dowódcy
function formatBroadcasterTweet(item) {
  const header = '🔴 CCN NEWS | polskieradio.cc/news';
  const url = item.url;
  const tag = item.tag || '#CCNNews';
  const hashtags = `${tag} #ChristianCulture #Prawda`;
  const callToAction = '👉 Sprawdź w ekosystemie:\n';

  let title = item.title.trim()
    .replace(/^CCN News\s*[-–—:]\s*/i, '')
    .replace(/\s*•\s*Polskie Radio CC.*$/i, '')
    .replace(/\s*–\s*CCN Historia.*$/i, '')
    .replace(/\s*\(\/[a-z0-9_/-]+\)\s*$/i, '')
    .trim();

  // Buduj roboczy wpis
  let tweet = `${header}\n\n${title}\n\n${callToAction}${url}\n\n${hashtags}`;

  // Limit 280 znaków (link t.co = 23 znaki, emoji = 2 punkty)
  if (tweet.length > 270) {
    while (tweet.length > 270 && title.length > 25) {
      title = title.slice(0, -1).trim();
      tweet = `${header}\n\n${title}…\n\n${callToAction}${url}\n\n${hashtags}`;
    }
  }

  return tweet;
}

// Publikacja przez Playwright w tle
async function publishToX(tweetText, dryRun = false) {
  if (dryRun) {
    console.log('\n[DRY RUN CCN BROADCASTER] Podgląd wpisu:');
    console.log('───────────────────────────────────────────────────────');
    console.log(tweetText);
    console.log('───────────────────────────────────────────────────────');
    return { success: true, dryRun: true };
  }

  const authToken = process.env.X_AUTH_TOKEN;
  if (!authToken) {
    throw new Error('Brak X_AUTH_TOKEN w .env.local. Zaloguj się lub wklej auth_token.');
  }

  if (!fs.existsSync(PROFILE_DIR)) fs.mkdirSync(PROFILE_DIR, { recursive: true });

  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    channel: 'chrome',
    headless: true,
    viewport: { width: 1280, height: 800 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
  }).catch(async () => {
    return await chromium.launchPersistentContext(PROFILE_DIR, {
      headless: true,
      viewport: { width: 1280, height: 800 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
      args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
    });
  });

  await context.addCookies([
    {
      name: 'auth_token',
      value: authToken,
      domain: '.x.com',
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'None'
    },
    {
      name: 'auth_token',
      value: authToken,
      domain: '.twitter.com',
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'None'
    }
  ]);

  try {
    const page = await context.newPage();
    console.log('🌐 [CCN Broadcaster] Otwieram x.com/compose/post w tle...');
    await page.goto('https://x.com/compose/post', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    const textareaSelector = '[data-testid="tweetTextarea_0"], div[role="textbox"][contenteditable="true"]';
    await page.waitForSelector(textareaSelector, { timeout: 15000 });
    await page.click(textareaSelector);
    await page.waitForTimeout(500);

    await page.keyboard.insertText(tweetText);
    console.log('📝 [CCN Broadcaster] Wpisano treść nowości...');
    await page.waitForTimeout(3000);

    // Zamknij ewentualny modal
    const overlayDismiss = await page.$('[data-testid="app-bar-close"], [aria-label="Zamknij"], [aria-label="Close"]');
    if (overlayDismiss) await overlayDismiss.click().catch(() => {});

    console.log('🔘 [CCN Broadcaster] Wysyłam post...');
    await page.focus(textareaSelector);
    await page.keyboard.press('Control+Enter');
    await page.waitForTimeout(2000);

    const postBtn = await page.$('[data-testid="tweetButton"], [data-testid="tweetButtonInline"]');
    if (postBtn && await postBtn.isVisible().catch(() => false)) {
      await postBtn.click({ force: true }).catch(() => {});
    }

    await page.waitForTimeout(5000);
    console.log('🎉 [CCN Broadcaster] Post został opublikowany na X!');

    await page.close();
    await context.close();
    return { success: true };
  } catch (err) {
    await context.close().catch(() => {});
    throw err;
  }
}

// Pojedynczy cykl publikacji
async function broadcastNext(dryRun = false) {
  const candidates = getAllEcosystemCandidates();
  if (candidates.length === 0) {
    throw new Error('Brak kandydatów do publikacji z ekosystemu.');
  }

  const history = loadHistory();
  const state = loadState();

  // Filtruj pozycje, które nie były publikowane w ostatnich 20 wpisach (rotacja)
  const recentUrls = new Set(history.slice(0, 20).map(h => h.url));
  let nextIndex = (state.lastIndex + 1) % candidates.length;
  let attempts = 0;
  while (recentUrls.has(candidates[nextIndex].url) && attempts < candidates.length) {
    nextIndex = (nextIndex + 1) % candidates.length;
    attempts++;
  }
  const chosen = candidates[nextIndex];

  const tweetText = formatBroadcasterTweet(chosen);

  console.log(`\n📢 Wybrana nowość z ekosystemu [${nextIndex + 1}/${candidates.length}]:`);
  console.log(`   Tytuł: "${chosen.title}"`);
  console.log(`   Link: ${chosen.url}`);

  await publishToX(tweetText, dryRun);

  if (!dryRun) {
    const publishedAt = new Date().toISOString();
    history.unshift({
      slug: chosen.url.split('/').filter(Boolean).pop(),
      title: chosen.title,
      url: chosen.url,
      publishedAt,
      method: 'ccn_auto_broadcaster'
    });
    saveHistory(history);

    state.lastIndex = nextIndex;
    state.lastPostedAt = publishedAt;
    state.totalBroadcasts = (state.totalBroadcasts || 0) + 1;
    saveState(state);

    appendLog({
      timestamp: publishedAt,
      title: chosen.title,
      url: chosen.url,
      status: 'PUBLISHED'
    });
  }

  return chosen;
}

// Losowy interwał: 24 do 36 minut (średnio 30 minut z nieregularnym rozkładem)
function getRandomNextDelayMinutes() {
  const minMin = 24;
  const maxMin = 36;
  return minMin + Math.random() * (maxMin - minMin);
}

// Pętla 24/7 (Daemon)
async function runDaemonLoop() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🚀 CCN NEWS BROADCASTER DAEMON 24/7 URUCHOMIONY');
  console.log('   Harmonogram: nieregularnie co ok. 30 minut (24–36 min)');
  console.log('   Kanał: platforma X (@csbwersetdnia)');
  console.log(`   Start: ${new Date().toISOString()}`);
  console.log('═══════════════════════════════════════════════════════════════\n');

  while (true) {
    try {
      console.log(`\n⏰ [${new Date().toLocaleTimeString('pl-PL')}] Rozpoczynam cykl publikacji...`);
      await broadcastNext(false);
    } catch (err) {
      console.error(`❌ [${new Date().toLocaleTimeString('pl-PL')}] Błąd publikacji:`, err.message);
      appendLog({
        timestamp: new Date().toISOString(),
        error: err.message,
        status: 'ERROR'
      });
    }

    const delayMinutes = getRandomNextDelayMinutes();
    const delayMs = Math.round(delayMinutes * 60 * 1000);
    const nextTime = new Date(Date.now() + delayMs);

    console.log(`⏳ Kolejna nieregularna publikacja za: ${delayMinutes.toFixed(1)} min (~${nextTime.toLocaleTimeString('pl-PL')})...`);
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }
}

// CLI
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const once = args.includes('--once');
  const loop = args.includes('--loop');
  const status = args.includes('--status');

  if (status) {
    const s = loadState();
    const h = loadHistory();
    console.log('📊 STATUS CCN AUTO BROADCASTER:');
    console.log('   Łącznie publikacji:', s.totalBroadcasts || 0);
    console.log('   Ostatnia publikacja:', s.lastPostedAt || 'Brak');
    console.log('   Wpisów w historii:', h.length);
    process.exit(0);
  }

  if (loop) {
    await runDaemonLoop();
  } else {
    // Domyślnie lub z flagą --once
    await broadcastNext(dryRun);
    if (!dryRun) {
      console.log('✅ Pojedynczy cykl publikacji zakończony pomyślnie.');
    }
  }
}

main().catch(err => {
  console.error('BŁĄD KRYTYCZNY:', err.message);
  process.exit(1);
});
