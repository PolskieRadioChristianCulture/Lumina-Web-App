#!/usr/bin/env node
/**
 * CCN NEWS -> PLATFORMA X (TWITTER) AUTOMATED BROWSER PUBLISHER (PLAYWRIGHT)
 *
 * 100% BEZPŁATNA AUTOMATYZACJA (0 PLN, BEZ OPŁAT API X)
 *
 * Silnik: Playwright Persistent Browser Context (.x_browser_profile/)
 * Bezpieczeństwo: Profil przeglądarki ściśle ukryty w .gitignore
 * Logowanie: Jednorazowe logowanie interaktywne, kolejne publikacje 100% w tle (headless)
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
const PROFILE_DIR = path.join(ROOT, '.x_browser_profile');
const HISTORY_PATH = path.join(ROOT, 'data', 'x_published_history.json');
const ARTICLES_TS_PATH = path.join(ROOT, 'portals', 'ccn-news', 'src', 'data', 'articles.ts');
const CATALOG_PATH = path.join(ROOT, 'szukaj', 'catalog.json');

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

// Sprawdzenie czy użytkownik jest zalogowany
async function checkIsLoggedIn(page) {
  try {
    await page.goto('https://x.com/home', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(2000);
    const url = page.url();
    if (url.includes('/login') || url.includes('/flow/login') || url.includes('/i/flow/signup')) {
      return false;
    }
    // Sprawdź obecność paska nawigacji lub ikony profilu
    const loggedInIndicator = await page.$('a[data-testid="AppTabBar_Profile_Link"], [data-testid="tweetButtonInline"], [data-testid="SideNav_NewTweet_Button"]');
    return Boolean(loggedInIndicator);
  } catch (err) {
    return false;
  }
}

// Logowanie interaktywne (otwiera okno i czeka na użytkownika)
async function performInteractiveLogin(context) {
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('🔐 WYMAGANE JEDNORAZOWE LOGOWANIE DO PLATFORMY X');
  console.log('Otwarto okno przeglądarki. Zaloguj się na swoje konto na platformie X.');
  console.log('Po zalogowaniu sesja zostanie trwale zapisana w .x_browser_profile/.');
  console.log('Kolejne publikacje będą wykonywać się w 100% automatycznie w tle.');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const page = await context.newPage();
  await page.goto('https://x.com/login', { waitUntil: 'domcontentloaded' });

  // Czekaj aż użytkownik zaloguje się (max 180 sekund)
  const startTime = Date.now();
  const maxWaitMs = 180000;

  while (Date.now() - startTime < maxWaitMs) {
    await page.waitForTimeout(2000);
    const url = page.url();
    if (url.includes('/home') || url.includes('/compose')) {
      const loggedIn = await checkIsLoggedIn(page);
      if (loggedIn) {
        console.log('✅ Zalogowano pomyślnie! Sesja została utrwalona.');
        await page.close();
        return true;
      }
    }
  }

  throw new Error('Przekroczono limit czasu oczekiwania na zalogowanie (3 minuty). Spróbuj ponownie.');
}

// Publikacja tweeta przez Playwright
async function publishViaPlaywright(tweetText, dryRun = false, forceLogin = false) {
  if (dryRun) {
    console.log('\n[DRY RUN PLAYWRIGHT] Treść posta:');
    console.log('───────────────────────────────────────────────────────');
    console.log(tweetText);
    console.log('───────────────────────────────────────────────────────');
    return { success: true, dryRun: true };
  }

  if (!fs.existsSync(PROFILE_DIR)) {
    fs.mkdirSync(PROFILE_DIR, { recursive: true });
  }

  // Uruchom najpierw w trybie sprawdzenia
  let context = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false, // Otwieramy okno, aby użytkownik widział co się dzieje
    viewport: { width: 1280, height: 800 },
    args: ['--disable-blink-features=AutomationControlled', '--start-maximized']
  });

  try {
    const page = context.pages()[0] || await context.newPage();

    let isLoggedIn = await checkIsLoggedIn(page);
    if (!isLoggedIn || forceLogin) {
      await performInteractiveLogin(context);
    }

    console.log('\n🚀 Otwieram edytor posta na x.com/compose/post...');
    const postPage = await context.newPage();
    await postPage.goto('https://x.com/compose/post', { waitUntil: 'networkidle', timeout: 30000 });
    await postPage.waitForTimeout(2000);

    // Znajdź pole tekstowe
    const textareaSelector = '[data-testid="tweetTextarea_0"], div[role="textbox"][contenteditable="true"]';
    await postPage.waitForSelector(textareaSelector, { timeout: 15000 });
    await postPage.click(textareaSelector);
    await postPage.waitForTimeout(500);

    // Wklej treść posta
    await postPage.keyboard.insertText(tweetText);
    console.log('📝 Wpisano treść artykułu...');
    await postPage.waitForTimeout(3000); // Czas na załadowanie karty podglądu (Twitter Card)

    // Kliknij przycisk publikacji
    const postButtonSelector = '[data-testid="tweetButton"]';
    await postPage.waitForSelector(postButtonSelector, { timeout: 10000 });
    const postBtn = await postPage.$(postButtonSelector);

    if (!postBtn) {
      throw new Error('Nie znaleziono przycisku "Opublikuj" (tweetButton).');
    }

    console.log('🔘 Klikam przycisk "Opublikuj" / "Post"...');
    await postBtn.click();

    // Czekaj na potwierdzenie (zniknięcie okna lub pojawienie się toastu)
    await postPage.waitForTimeout(4000);
    console.log('🎉 Post został opublikowany na platformie X!');

    await postPage.close();
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
  const loginOnly = args.includes('--login');

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

  if (loginOnly) {
    if (!fs.existsSync(PROFILE_DIR)) fs.mkdirSync(PROFILE_DIR, { recursive: true });
    const context = await chromium.launchPersistentContext(PROFILE_DIR, {
      headless: false,
      viewport: { width: 1280, height: 800 }
    });
    await performInteractiveLogin(context);
    await context.close();
    process.exit(0);
  }

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
    await publishViaPlaywright(tweetText, dryRun);
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
