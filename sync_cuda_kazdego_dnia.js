/**
 * ══════════════════════════════════════════════════════════════════════════
 * LUMINA - AUTOMATYCZNA SYNCHRONIZACJA "CUDA KAŻDEGO DNIA"
 * ══════════════════════════════════════════════════════════════════════════
 * Skrypt pobiera najnowsze rozważanie i grafikę ze strony:
 * https://szukajacboga.pl/channel/cuda-kazdego-dnia
 * i publikuje je automatycznie w bazie Firestore oraz lokalnych zasobach portalu.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Wczytanie konfiguracji Firebase
let firebaseConfig = {};
try {
  const cfgRaw = fs.readFileSync(path.join(__dirname, 'firebase-applet-config.json'), 'utf8');
  firebaseConfig = JSON.parse(cfgRaw);
} catch (e) {
  console.warn('[Sync Cuda] Brak pliku firebase-applet-config.json, używam domyślnych.');
}

const PROJECT_ID = firebaseConfig.projectId || 'lumina-cc';
const DATABASE_ID = firebaseConfig.firestoreDatabaseId || 'ai-studio-luminacc-03566da3-121f-4803-84e4-c84a072169a2';
const API_KEY = firebaseConfig.apiKey || '';

const MONTH_NAMES_PL = [
  'STYCZNIA', 'LUTEGO', 'MARCA', 'KWIETNIA', 'MAJA', 'CZERWCA',
  'LIPCA', 'SIERPNIA', 'WRZEŚNIA', 'PAŹDZIERNIKA', 'LISTOPADA', 'GRUDNIA'
];

/**
 * Pobiera stronę HTML z odpowiednim nagłówkiem User-Agent
 */
async function fetchHtml(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'pl-PL,pl;q=0.9,en-US;q=0.8,en;q=0.7'
    }
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} pobierając ${url}`);
  }
  return await res.text();
}

/**
 * Ekstrahuje link do najnowszego artykułu z kanału "Cuda Każdego Dnia"
 */
function extractLatestArticleUrl(channelHtml) {
  const matches = [...channelHtml.matchAll(/href=["'](\/artykul\/[^"']+)["']/gi)];
  if (!matches || matches.length === 0) {
    throw new Error('Nie znaleziono żadnych artykułów na stronie kanału!');
  }
  const firstSlug = matches[0][1];
  return firstSlug.startsWith('http') ? firstSlug : `https://szukajacboga.pl${firstSlug}`;
}

/**
 * Parsuje treść artykułu
 */
function parseArticle(html, articleUrl) {
  const ogTitle = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i)?.[1]
    || html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]?.replace(/<[^>]+>/g, '').trim()
    || 'Cuda Każdego Dnia';

  let ogImage = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i)?.[1] || '';
  if (!ogImage) {
    const imgMatch = html.match(/<img[^>]+src=["'](https:\/\/szukajacboga\.pl\/media\/cache\/[^"']+)["']/i);
    if (imgMatch) ogImage = imgMatch[1];
  }

  let dateText = '';
  const dateMatch = html.match(/<span>(\d{1,2}\/\d{1,2}\/\d{4})<\/span>/i);
  if (dateMatch) {
    const parts = dateMatch[1].split('/');
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parts[2];
    dateText = `${day} ${MONTH_NAMES_PL[month]} ${year}`;
  } else {
    const now = new Date();
    dateText = `${now.getDate()} ${MONTH_NAMES_PL[now.getMonth()]} ${now.getFullYear()}`;
  }

  const articleTagMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
  const contentScope = articleTagMatch ? articleTagMatch[1] : html;

  const pMatches = [...contentScope.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)];
  const paragraphs = pMatches.map(m => {
    return m[1]
      .replace(/<br\s*[\/]?>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&bdquo;|&rdquo;|&quot;/g, '„')
      .replace(/&#039;|&apos;/g, '\'')
      .replace(/&amp;/g, '&')
      .trim();
  }).filter(p => p.length > 0 && !p.startsWith('Zapraszam cię na kurs') && !p.startsWith('Posłuchaj:'));

  let prayer = '';
  const prayerP = paragraphs.find(p => p.includes('Panie,') && (p.includes('amen') || p.includes('Amen')));
  if (prayerP) {
    prayer = prayerP;
  }

  const cleanTitle = ogTitle.replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').trim();
  const slug = articleUrl.split('/').pop().replace(/[^a-zA-Z0-9_-]/g, '');

  return {
    id: `cuda_${slug}`,
    slug,
    title: cleanTitle.toUpperCase(),
    rawTitle: cleanTitle,
    dateText,
    imageUrl: ogImage,
    sourceUrl: articleUrl,
    paragraphs,
    prayer,
    fullTextFormatted: `Przeczytaj i zobacz jak Bóg przemienia twoje życie.\n\n${cleanTitle.toUpperCase()}\n\n` +
      paragraphs.join('\n\n') +
      `\n\n/opr. na podst. wiad. B.K./.\n\nDziękuję, że jesteś!\n❤️`
  };
}

/**
 * Pobiera i zapisuje grafikę rozważania w formatach JPG/WebP
 */
async function downloadAndSaveImages(imageUrl, devotion) {
  if (!imageUrl) return;

  try {
    console.log(`[Sync Cuda] Pobieranie grafiki z: ${imageUrl}`);
    const res = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!res.ok) return;

    const imgBuffer = Buffer.from(await res.arrayBuffer());
    const jpgBuffer = await sharp(imgBuffer).jpeg({ quality: 92 }).toBuffer();
    const webpBuffer = await sharp(imgBuffer).webp({ quality: 88 }).toBuffer();

    fs.writeFileSync(path.join(__dirname, 'cuda_kazdego_dnia_current.jpg'), jpgBuffer);
    fs.writeFileSync(path.join(__dirname, 'cuda_kazdego_dnia_current.webp'), webpBuffer);

    const dateSlug = devotion.dateText.toLowerCase().replace(/\s+/g, '_');
    fs.writeFileSync(path.join(__dirname, `cuda_kazdego_dnia_${dateSlug}.jpg`), jpgBuffer);
    fs.writeFileSync(path.join(__dirname, `cuda_kazdego_dnia_${dateSlug}.webp`), webpBuffer);

    console.log(`[Sync Cuda] Zapisano grafiki lokalnie.`);
  } catch (err) {
    console.error('[Sync Cuda] Błąd przetwarzania grafiki:', err.message);
  }
}

/**
 * Zapisuje rozważanie do bazy Firestore przez REST API
 */
async function saveToFirestore(devotion) {
  const docPath = `projects/${PROJECT_ID}/databases/${DATABASE_ID}/documents/lumina_cuda_kazdego_dnia/current`;
  const url = `https://firestore.googleapis.com/v1/${docPath}?key=${API_KEY}`;

  const firestoreBody = {
    fields: {
      id: { stringValue: devotion.id },
      title: { stringValue: devotion.title },
      rawTitle: { stringValue: devotion.rawTitle },
      dateText: { stringValue: devotion.dateText },
      text: { stringValue: devotion.fullTextFormatted },
      prayer: { stringValue: devotion.prayer },
      imageUrl: { stringValue: devotion.imageUrl },
      sourceUrl: { stringValue: devotion.sourceUrl },
      author: { stringValue: 'Andrzej Thiel' },
      authorRole: { stringValue: 'Cuda Każdego Dnia 📖✨ • Sieradz' },
      publishedAt: { stringValue: new Date().toISOString() },
      updatedAt: { stringValue: new Date().toISOString() }
    }
  };

  try {
    const res = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(firestoreBody)
    });

    if (res.ok) {
      console.log('[Sync Cuda] Pomyślnie zaktualizowano rozważanie w bazie Firestore!');
    }
  } catch (err) {
    console.error('[Sync Cuda] Błąd zapisu do Firestore:', err.message);
  }
}

/**
 * Główna funkcja wykonująca całą synchronizację
 */
export async function syncCudaDaily() {
  try {
    const channelUrl = 'https://szukajacboga.pl/channel/cuda-kazdego-dnia';
    const channelHtml = await fetchHtml(channelUrl);
    const latestArticleUrl = extractLatestArticleUrl(channelHtml);
    const articleHtml = await fetchHtml(latestArticleUrl);
    const devotion = parseArticle(articleHtml, latestArticleUrl);

    await downloadAndSaveImages(devotion.imageUrl, devotion);
    await saveToFirestore(devotion);

    try {
      const cudaDbPath = path.join(__dirname, 'rozwazania_cuda_baza.json');
      let base = { current: devotion, history: [] };
      if (fs.existsSync(cudaDbPath)) {
        try {
          base = JSON.parse(fs.readFileSync(cudaDbPath, 'utf8'));
        } catch (e) {}
      }
      if (!Array.isArray(base.history)) base.history = [];
      base.current = devotion;
      const existingIdx = base.history.findIndex(r => r.id === devotion.id || r.title === devotion.title);
      if (existingIdx >= 0) {
        base.history[existingIdx] = devotion;
      } else {
        base.history.unshift(devotion);
      }
      fs.writeFileSync(cudaDbPath, JSON.stringify(base, null, 2), 'utf8');
    } catch (e) {}

    return { success: true, devotion };
  } catch (err) {
    console.error(`[Sync Cuda] Błąd synchronizacji:`, err);
    return { success: false, error: err.message };
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  syncCudaDaily().then((res) => {
    if (res.success) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  });
}