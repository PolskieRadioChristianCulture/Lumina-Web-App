#!/usr/bin/env node
/**
 * CCN NEWS -> PLATFORMA X (TWITTER) AUTOMATED PUBLISHING ENGINE
 *
 * Oficjalna integracja z X API v2 (Free Tier: 1500 postów/miesiąc = 0 zł).
 * Autoryzacja: OAuth 1.0a User Context (HMAC-SHA1, czysty Node.js bez zewnętrznych bibliotek).
 * Bezpieczeństwo: Klucze w .env.local (w 100% zignorowane przez git).
 * Idempotentność: Historia publikacji w data/x_published_history.json (brak duplikatów).
 *
 * Standard: ZERO COST / JOMA-D005 / @SMCC
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

// Ścieżki danych
const ENV_LOCAL_PATH = path.join(ROOT, '.env.local');
const ENV_PATH = path.join(ROOT, '.env');
const HISTORY_PATH = path.join(ROOT, 'data', 'x_published_history.json');
const ARTICLES_TS_PATH = path.join(ROOT, 'portals', 'ccn-news', 'src', 'data', 'articles.ts');

// Załaduj zmienne środowiskowe z .env.local lub .env jeśli nie są w process.env
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

// Pobierz poświadczenia X API
function getCredentials() {
  return {
    apiKey: process.env.X_API_KEY || process.env.TWITTER_API_KEY || '',
    apiSecret: process.env.X_API_SECRET || process.env.TWITTER_API_SECRET || '',
    accessToken: process.env.X_ACCESS_TOKEN || process.env.TWITTER_ACCESS_TOKEN || '',
    accessSecret: process.env.X_ACCESS_SECRET || process.env.TWITTER_ACCESS_TOKEN_SECRET || ''
  };
}

// Sprawdź czy poświadczenia są skonfigurowane
function hasCredentials(creds) {
  return Boolean(creds.apiKey && creds.apiSecret && creds.accessToken && creds.accessSecret);
}

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

// Odczyt artykułów z catalog.json oraz articles.ts
const CATALOG_PATH = path.join(ROOT, 'szukaj', 'catalog.json');

function extractCatalogItems() {
  const items = [];

  // 1. Z catalog.json (zawiera wszystkie artykuły CCN, historię, naukę, bibliotekę, itp.)
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

  // 2. Jeśli catalog.json jest pusty, wczytaj z articles.ts
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

// Obliczanie długości tweeta wg reguł platformy X:
// Każdy link URL (t.co) = dokładnie 23 znaki.
function calculateTwitterLength(text) {
  const urlRegex = /https?:\/\/[^\s]+/g;
  let remainingText = text.replace(urlRegex, '');
  const urlMatches = text.match(urlRegex) || [];
  const urlCount = urlMatches.length;

  let length = urlCount * 23;
  for (const char of remainingText) {
    const codePoint = char.codePointAt(0);
    // Emojis i znaki wielobajtowe = 2 punkty w systemie wagowym X
    if (codePoint > 0x07ff) {
      length += 2;
    } else {
      length += 1;
    }
  }
  return length;
}

// Formatowanie wiadomości na platformę X (gwarancja <= 280 wagowych znaków)
function formatTweetText(article) {
  const url = article.url || `https://polskieradio.cc/news/${article.slug}`;
  const hashtags = '#CCNNews #ChristianCulture #Prawda';
  const prefix = '📰 ';
  const middle = '\n\nCzytaj całość na CCN:\n';
  const suffix = `\n\n${hashtags}`;

  let title = article.title.trim();

  // Zbuduj roboczy tweet
  let fullTweet = `${prefix}${title}${middle}${url}${suffix}`;

  // Jeśli przekracza limit 280, skracaj tytuł z wielokropkiem
  if (calculateTwitterLength(fullTweet) > 280) {
    while (calculateTwitterLength(fullTweet) > 280 && title.length > 20) {
      title = title.slice(0, -1).trim();
      fullTweet = `${prefix}${title}…${middle}${url}${suffix}`;
    }
  }

  return {
    tweetText: fullTweet,
    xLength: calculateTwitterLength(fullTweet)
  };
}

// OAuth 1.0a HMAC-SHA1 Authorization Header
function percentEncode(str) {
  return encodeURIComponent(str)
    .replace(/!/g, '%21')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/\*/g, '%2A');
}

function generateOAuthHeader(method, url, creds) {
  const oauthParams = {
    oauth_consumer_key: creds.apiKey,
    oauth_nonce: crypto.randomBytes(16).toString('hex'),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: creds.accessToken,
    oauth_version: '1.0'
  };

  // Posortowane parametry do podpisu
  const sortedKeys = Object.keys(oauthParams).sort();
  const paramString = sortedKeys
    .map(key => `${percentEncode(key)}=${percentEncode(oauthParams[key])}`)
    .join('&');

  const baseString = [
    method.toUpperCase(),
    percentEncode(url),
    percentEncode(paramString)
  ].join('&');

  const signingKey = `${percentEncode(creds.apiSecret)}&${percentEncode(creds.accessSecret)}`;
  const signature = crypto.createHmac('sha1', signingKey).update(baseString).digest('base64');

  oauthParams.oauth_signature = signature;

  const headerParts = Object.keys(oauthParams)
    .sort()
    .map(key => `${percentEncode(key)}="${percentEncode(oauthParams[key])}"`);

  return `OAuth ${headerParts.join(', ')}`;
}

// Wysłanie posta na X API v2
async function postTweet(text, creds, dryRun = false) {
  const url = 'https://api.twitter.com/2/tweets';
  const payload = { text };

  if (dryRun) {
    console.log('\n[DRY RUN] Treść posta, który zostałby opublikowany na X:');
    console.log('───────────────────────────────────────────────────────');
    console.log(text);
    console.log('───────────────────────────────────────────────────────');
    console.log(`Długość znaków: ${text.length} (limit X: 280)`);
    return { id: 'dry-run-sample-id', text };
  }

  const authHeader = generateOAuthHeader('POST', url, creds);

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const bodyText = await res.text();
  let json;
  try {
    json = JSON.parse(bodyText);
  } catch (e) {
    throw new Error(`X API HTTP ${res.status}: ${bodyText}`);
  }

  if (!res.ok) {
    throw new Error(`X API Błąd (${res.status}): ${JSON.stringify(json)}`);
  }

  return json.data;
}

// Główna funkcja wykonawcza
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const autoMode = args.includes('--auto');
  const force = args.includes('--force');
  
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
  console.log('🐦 CCN NEWS ➔ X (TWITTER) AUTOMATED PUBLISHER');
  console.log(`⏰ Czas operacji: ${new Date().toISOString()}`);
  console.log('═══════════════════════════════════════════════════════════════');

  const creds = getCredentials();
  const configured = hasCredentials(creds);

  if (!configured && !dryRun) {
    if (autoMode) {
      console.log('ℹ️  Automatyzacja X w trybie cichym: brak skonfigurowanych kluczy w .env.local.');
      console.log('   Aby aktywować natychmiastowe publikacje na X, uzupełnij klucze w .env.local:');
      console.log('   X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_SECRET.');
      process.exit(0);
    } else {
      console.error('\n❌ BŁĄD: Brak poświadczeń X API.');
      console.log('\nAby publikować na platformie X, utwórz plik .env.local w głównym katalogu projektu i dodaj:');
      console.log(`
# Oficjalne klucze X API v2 (Free Tier - 0 zł)
X_API_KEY=twoj_api_key
X_API_SECRET=twoj_api_secret
X_ACCESS_TOKEN=twoj_access_token
X_ACCESS_SECRET=twoj_access_token_secret
`);
      console.log('Możesz też przetestować formatowanie wpisu uruchamiając komendę z flagą --dry-run:');
      console.log('node scripts/publish_to_x.mjs --dry-run\n');
      process.exit(1);
    }
  }

  const articles = extractCatalogItems();
  if (articles.length === 0) {
    console.error('❌ Nie znaleziono artykułów w bazie.');
    process.exit(1);
  }

  // Wybierz artykuł do publikacji
  let articleToPublish;
  if (customUrl) {
    let derivedTitle = customTitle;
    if (!derivedTitle) {
      // Spróbuj odczytać plik lokalny jeśli istnieje
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
    // Domyślnie najnowszy artykuł
    articleToPublish = articles[0];
  }

  console.log(`\n📌 Wybrany artykuł: "${articleToPublish.title}"`);
  console.log(`🔗 Slug: ${articleToPublish.slug}`);
  console.log(`📅 Data: ${articleToPublish.publishedAt}`);

  // Sprawdź czy już opublikowany
  const history = loadHistory();
  const alreadyPublished = history.some(item => item.slug === articleToPublish.slug);

  if (alreadyPublished && !force && !dryRun) {
    console.log(`\n✅ Ten artykuł został już wcześniej opublikowany na X (${articleToPublish.slug}).`);
    console.log('   Pominięto, aby zapobiec duplikacji. Użyj flagi --force, jeśli chcesz opublikować ponownie.');
    process.exit(0);
  }

  const { tweetText, xLength } = formatTweetText(articleToPublish);

  try {
    const result = await postTweet(tweetText, creds, dryRun);
    console.log(`\n🎉 SUKCES! Wpis został opublikowany na X!`);
    console.log(`🆔 ID posta: ${result.id}`);
    console.log(`📊 Wagowa długość X: ${xLength}/280 znaków`);

    if (!dryRun) {
      history.unshift({
        id: result.id,
        slug: articleToPublish.slug,
        title: articleToPublish.title,
        url: `https://polskieradio.cc/news/${articleToPublish.slug}`,
        publishedAt: new Date().toISOString()
      });
      saveHistory(history);
      console.log(`💾 Zapisano w rejestrze data/x_published_history.json`);
    }
  } catch (err) {
    console.error('\n❌ BŁĄD PODCZAS PUBLIKACJI NA X:', err.message);
    process.exit(1);
  }
}

main();
