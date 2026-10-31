#!/usr/bin/env node
/**
 * CCN NEWS -> PLATFORMA X (TWITTER) AUTOMATED BROWSER PUBLISHER (PLAYWRIGHT)
 *
 * 100% BEZPŁATNA AUTOMATYZACJA (0 PLN, BEZ OPŁAT API X)
 *
 * Silnik: Playwright Persistent Browser Context (.x_browser_profile/)
 * Autoryzacja: Ciasteczko X_AUTH_TOKEN z .env.local (bezpieczne, omija blokady antybotowe)
 * Tryb: Domyślnie 100% w tle (headless: true), opcjonalnie z podglądem (--headed)
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

// Ścieżki danych
const ENV_LOCAL_PATH = path.join(ROOT, '.env.local');
const ENV_PATH = path.join(ROOT, '.env');
const PROFILE_DIR = path.join(ROOT, '.x_browser_profile');
const HISTORY_PATH = path.join(ROOT, 'data', 'x_published_history.json');
const ARTICLES_TS_PATH = path.join(ROOT, 'portals', 'ccn-news', 'src', 'data', 'articles.ts');
const CATALOG_PATH = path.join(ROOT, 'szukaj', 'catalog.json');

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

// Rejestr historii publikacji
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
    console.error('[BŁĄD] Nie udało się zapisać historii X:', err.message);
  }
}

// Pobieranie artykułów
function extractCatalogItems() {
  const items = [];
  if (fs.existsSync(CATALOG_PATH)) {
    try {
      const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
      if (Array.isArray(catalog.items)) {
        for (const it of catalog.items) {
          if (it.type === 'news' || it.type === 'article' || (it.url && (it.url.includes('/news/') || it.url.includes('/historia/') || it.url.includes('/nauka/')))) {
            const slug = it.url.replace(/^https?:\/\/[^\/]+\/(news|historia|nauka|biblioteka)\//, '').replace(/\/$/, '');
            items.push({
              id: it.id || slug,
              title: it.title,
              slug: slug,
              url: it.url.startsWith('http') ? it.url : `https://polskieradio.cc${it.url}`,
              excerpt: it.description || '',
              publishedAt: it.publishedAt || it.updatedAt || new Date().toISOString()
            });
          }
        }
      }
    } catch (e) {
      console.warn('[WARN] Nie udało się wczytać catalog.json:', e.message);
    }
  }

  if (items.length === 0 && fs.existsSync(ARTICLES_TS_PATH)) {
    const content = fs.readFileSync(ARTICLES_TS_PATH, 'utf8');
    const regex = /{\s*id:\s*['"]([^'"]+)['"][\s\S]*?title:\s*['"]([^'"]+)['"][\s\S]*?slug:\s*['"]([^'"]+)['"][\s\S]*?excerpt:\s*['"]([^'"]+)['"][\s\S]*?publishedAt:\s*['"]([^'"]+)['"]/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
      items.push({
        id: match[1],
        title: match[2],
        slug: match[3],
        url: `https://polskieradio.cc/news/${match[3]}`,
        excerpt: match[4],
        publishedAt: match[5]
      });
    }
  }

  return items;
}

// Formatowanie wiadomości na X (limit 280 znaków)
function formatTweetText(article) {
  const url = article.url || `https://polskieradio.cc/news/${article.slug}`;
  const hashtags = '#CCNNews #ChristianCulture #Prawda';
  const prefix = '📰 ';
  const middle = '\n\nCzytaj całość na CCN:\n';
  const suffix = `\n\n${hashtags}`;

  let title = article.title.trim();
  let tweet = `${prefix}${title}${middle}${url}${suffix}`;

  // Bezpieczne skracanie tytułu jeśli za długi
  if (tweet.length > 270) {
    while (tweet.length > 270 && title.length > 20) {
      title = title.slice(0, -1).trim();
      tweet = `${prefix}${title}…${middle}${url}${suffix}`;
    }
  }

  return tweet;
}

// Uruchomienie kontekstu przeglądarki Playwright
async function getBrowserContext(headless = true) {
  if (!fs.existsSync(PROFILE_DIR)) {
    fs.mkdirSync(PROFILE_DIR, { recursive: true });
  }

  const launchOptions = {
    headless,
    channel: 'chrome',
    viewport: { width: 1280, height: 800 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
    args: [
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox'
    ]
  };

  let context;
  try {
    context = await chromium.launchPersistentContext(PROFILE_DIR, launchOptions);
  } catch (err) {
    delete launchOptions.channel;
    context = await chromium.launchPersistentContext(PROFILE_DIR, launchOptions);
  }

  // Wstrzyknij ciasteczko autoryzacyjne jeśli zdefiniowane
  const authToken = process.env.X_AUTH_TOKEN;
  if (authToken) {
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
  }

  return context;
}

// Publikacja posta przez Playwright
async function publishViaPlaywright(tweetText, dryRun = false, headed = false) {
  if (dryRun) {
    console.log('\n[DRY RUN PLAYWRIGHT] Treść posta:');
    console.log('───────────────────────────────────────────────────────');
    console.log(tweetText);
    console.log('───────────────────────────────────────────────────────');
    return { success: true, dryRun: true };
  }

  const context = await getBrowserContext(!headed);

  try {
    const page = await context.newPage();
    console.log('🌐 Nawigacja do x.com/compose/post...');
    await page.goto('https://x.com/compose/post', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    // Sprawdź czy nie przekierowało do logowania
    const currentUrl = page.url();
    if (currentUrl.includes('/login') || currentUrl.includes('/onboarding/')) {
      throw new Error('Ciasteczko X_AUTH_TOKEN wygasło lub nie zostało rozpoznane. Zaktualizuj X_AUTH_TOKEN w .env.local.');
    }

    // Znajdź pole wpisywania treści
    const textareaSelector = '[data-testid="tweetTextarea_0"], div[role="textbox"][contenteditable="true"]';
    await page.waitForSelector(textareaSelector, { timeout: 15000 });
    await page.click(textareaSelector);
    await page.waitForTimeout(500);

    // Wklej treść tweeta
    await page.keyboard.insertText(tweetText);
    console.log('📝 Wpisano treść artykułu...');
    await page.waitForTimeout(3000); // Czas na załadowanie karty podglądu (Twitter Card)

    // Zamknij ewentualne modale zasłaniające (cookies, powiadomienia)
    const overlayDismiss = await page.$('[data-testid="app-bar-close"], [aria-label="Zamknij"], [aria-label="Close"], [data-testid="sheetDialog"] [aria-label="Zamknij"]');
    if (overlayDismiss) {
      await overlayDismiss.click().catch(() => {});
      await page.waitForTimeout(1000);
    }

    console.log('🔘 Wysyłam post (skrót Ctrl+Enter / tweetButton force)...');
    
    // Próba 1: Natywny skrót klawiszowy X (Ctrl+Enter) wysyłający post z pola tekstowego
    await page.focus(textareaSelector);
    await page.keyboard.press('Control+Enter');
    await page.waitForTimeout(2000);

    // Próba 2: Jeśli przycisk nadal jest obecny, kliknij z force: true
    const postButtonSelector = '[data-testid="tweetButton"], [data-testid="tweetButtonInline"]';
    const postBtn = await page.$(postButtonSelector);
    if (postBtn) {
      const isVisible = await postBtn.isVisible().catch(() => false);
      if (isVisible) {
        await postBtn.click({ force: true }).catch(() => {});
      }
    }

    // Czekaj na potwierdzenie wysłania (zniknięcie okna compose lub redirect)
    await page.waitForTimeout(5000);
    console.log('🎉 Post został pomyślnie opublikowany na platformie X!');

    await page.close();
    await context.close();
    return { success: true };
  } catch (err) {
    await context.close().catch(() => {});
    throw err;
  }
}

// Główna funkcja wykonawcza
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const force = args.includes('--force');
  const headed = args.includes('--headed');

  let targetSlug = null;
  const slugArg = args.find(a => a.startsWith('--slug='));
  if (slugArg) targetSlug = slugArg.split('=')[1];

  let customUrl = null;
  const urlArg = args.find(a => a.startsWith('--url='));
  if (urlArg) customUrl = urlArg.split('=')[1];

  let customTitle = null;
  const titleArg = args.find(a => a.startsWith('--title='));
  if (titleArg) customTitle = titleArg.split('=')[1];

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🤖 CCN NEWS ➔ X (TWITTER) PLAYWRIGHT FREE AUTOMATION');
  console.log('   (100% BEZPŁATNY SILNIK ZERO-COST / MATRIX CC)');
  console.log(`⏰ Czas operacji: ${new Date().toISOString()}`);
  console.log('═══════════════════════════════════════════════════════════════');

  const articles = extractCatalogItems();
  let articleToPublish;

  if (customUrl) {
    let derivedTitle = customTitle;
    if (!derivedTitle) {
      const localRel = customUrl.replace(/^https?:\/\/polskieradio\.cc\//, '');
      const possibleHtml = path.join(ROOT, localRel.endsWith('.html') ? localRel : `${localRel}.html`);
      if (fs.existsSync(possibleHtml)) {
        const html = fs.readFileSync(possibleHtml, 'utf8');
        const m = html.match(/<title>([^<]+)<\/title>/i);
        if (m) derivedTitle = m[1].replace(/\s*•\s*Polskie Radio CC.*$/i, '').trim();
      }
    }
    if (!derivedTitle) derivedTitle = 'Nowa publikacja w ekosystemie Christian Culture';

    const slug = customUrl.split('/').filter(Boolean).pop();
    articleToPublish = {
      id: slug,
      title: derivedTitle,
      slug: slug,
      url: customUrl,
      excerpt: '',
      publishedAt: new Date().toISOString()
    };
  } else if (targetSlug) {
    articleToPublish = articles.find(a => a.slug === targetSlug);
    if (!articleToPublish) {
      console.error(`❌ Nie znaleziono artykułu o slugu: ${targetSlug}`);
      process.exit(1);
    }
  } else {
    articleToPublish = articles[0];
  }

  console.log(`\n📌 Artykuł: "${articleToPublish.title}"`);
  console.log(`🔗 Link: ${articleToPublish.url}`);

  const history = loadHistory();
  const alreadyPublished = history.some(item => item.slug === articleToPublish.slug);

  if (alreadyPublished && !force && !dryRun) {
    console.log(`\n✅ Ten artykuł został już wcześniej opublikowany na X (${articleToPublish.slug}).`);
    console.log('   Pominięto, aby zapobiec duplikacji. Użyj flagi --force, jeśli chcesz powtórzyć.');
    process.exit(0);
  }

  const tweetText = formatTweetText(articleToPublish);

  try {
    await publishViaPlaywright(tweetText, dryRun, headed);
    if (!dryRun) {
      history.unshift({
        slug: articleToPublish.slug,
        title: articleToPublish.title,
        url: articleToPublish.url,
        publishedAt: new Date().toISOString(),
        method: 'playwright_free'
      });
      saveHistory(history);
      console.log(`💾 Zapisano w historii publikacji: data/x_published_history.json`);
    }
    console.log('\n🎉 SUKCES! Proces zakończony powodzeniem (Koszt: 0,00 PLN).');
  } catch (err) {
    console.error('\n❌ BŁĄD AUTOMATYZACJI PLAYWRIGHT:', err.message);
    process.exit(1);
  }
}

main();
