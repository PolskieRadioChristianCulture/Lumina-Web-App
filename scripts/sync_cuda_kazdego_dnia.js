/**
 * ══════════════════════════════════════════════════════════════════════════
 * LUMINA - AUTOMATYCZNA SYNCHRONIZACJA "CUDA KAŻDEGO DNIA"
 * ══════════════════════════════════════════════════════════════════════════
 * Skrypt pobiera WSZYSTKIE dostępne rozważania (z możliwością nadrobienia
 * zaległości) i grafiki ze strony:
 * https://szukajacboga.pl/strona/cuda-kazdego-dnia-wszystkie-rozwazania
 * i publikuje je automatycznie:
 *   1. w Firestore (dokument "current" — zachowane dla wstecznej zgodności),
 *   2. na tablicy społeczności LUMINA (kolekcja lumina_posts),
 *   3. na profilu Andrzeja Thiela (ta sama kolekcja, filtrowana po authorSlug —
 *      patrz dynamiczny silnik w lumina.andrzejthiel.html).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

let sharp = null;
try {
  const sharpModule = await import('sharp');
  sharp = sharpModule.default || sharpModule;
} catch (e) {
  // sharp is optional; direct image buffer write will be used as fallback
}

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

// Strona z pełnym archiwum — pozwala nadrobić zaległości, nie tylko pobrać "najnowsze".
const ARCHIVE_URL = 'https://szukajacboga.pl/strona/cuda-kazdego-dnia-wszystkie-rozwazania';
// Ile brakujących rozważań publikować maksymalnie w jednym uruchomieniu skryptu
// (zabezpieczenie przed zalaniem tablicy setkami postów przy pierwszym uruchomieniu).
const MAX_BACKFILL_PER_RUN = 10;

function formatDatePl(dd, mm, yyyy) {
  return `${parseInt(dd, 10)} ${MONTH_NAMES_PL[parseInt(mm, 10) - 1]} ${yyyy}`;
}

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
 * (ZACHOWANE dla wstecznej zgodności — nowy proces korzysta z parseArchiveIndex)
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
 * Parsuje stronę archiwum "Wszystkie rozważania" na listę wpisów
 * {slug, url, title, dateDMY, dateISO}, od najnowszego do najstarszego —
 * dokładnie w takiej kolejności, w jakiej są wyświetlone na stronie źródłowej.
 * Każdy artykuł na stronie źródłowej pojawia się jako DWA linki (miniatura +
 * tytuł) do tego samego adresu — funkcja deduplikuje po slug.
 */
function parseArchiveIndex(html) {
  const seen = new Set();
  const entries = [];
  const linkRe = /<a[^>]+href=["'](\/artykul\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = linkRe.exec(html)) !== null) {
    const slug = m[1].replace(/^\/artykul\//, '').replace(/[^a-zA-Z0-9_-]/g, '');
    if (!slug || seen.has(slug)) continue;

    const inner = m[2];
    const dateMatch = inner.match(/(\d{2})\/(\d{2})\/(\d{4})/);
    if (!dateMatch) continue;

    const [, dd, mm, yyyy] = dateMatch;
    
    // Wyciągnij tytuł z h4 lub atrybutu alt lub zawartości
    const titleMatch = inner.match(/<h4[^>]*>([\s\S]*?)<\/h4>/i);
    let title = '';
    if (titleMatch) {
      title = titleMatch[1].replace(/<svg[\s\S]*?<\/svg>/gi, '').replace(/<[^>]+>/g, '').trim();
    }
    if (!title) {
      const altMatch = inner.match(/alt=["']([^"']+)["']/i);
      if (altMatch) title = altMatch[1].trim();
    }
    if (!title) {
      const rawTitle = inner.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      title = rawTitle.split(/Cuda każdego dnia/i)[0].trim();
    }

    seen.add(slug);
    entries.push({
      slug,
      url: `https://szukajacboga.pl/artykul/${slug}`,
      title: title || null,
      dateDMY: `${dd}/${mm}/${yyyy}`,
      dateISO: `${yyyy}-${mm}-${dd}`,
    });
  }
  return entries;
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
    let jpgBuffer = imgBuffer;
    let webpBuffer = null;

    if (sharp) {
      jpgBuffer = await sharp(imgBuffer).jpeg({ quality: 92 }).toBuffer();
      webpBuffer = await sharp(imgBuffer).webp({ quality: 88 }).toBuffer();
    }

    fs.writeFileSync(path.join(__dirname, 'cuda_kazdego_dnia_current.jpg'), jpgBuffer);
    if (webpBuffer) {
      fs.writeFileSync(path.join(__dirname, 'cuda_kazgo_dnia_current.webp'), webpBuffer);
    }

    const dateSlug = devotion.dateText.toLowerCase().replace(/\s+/g, '_');
    fs.writeFileSync(path.join(__dirname, `cuda_kazdego_dnia_${dateSlug}.jpg`), jpgBuffer);
    if (webpBuffer) {
      fs.writeFileSync(path.join(__dirname, `cuda_kazdego_dnia_${dateSlug}.webp`), webpBuffer);
    }

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
 * Publikuje rozważanie jako prawdziwy post na tablicy społeczności LUMINA.
 * Ten sam dokument (dzięki authorSlug: 'andrzejthiel') jest odczytywany przez
 * dynamiczny silnik na profilu Andrzeja Thiela — jedna publikacja, dwa miejsca.
 */
async function createFirestorePost(devotion) {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${DATABASE_ID}/documents/lumina_posts?key=${API_KEY}`;
  const dateLabel = devotion.dateText.toUpperCase();

  const body = {
    fields: {
      author: { stringValue: 'Andrzej Thiel' },
      authorSlug: { stringValue: 'andrzejthiel' },
      authorRole: { stringValue: 'Cuda Każdego Dnia 📖✨ • Sieradz' },
      authorAvatar: { stringValue: 'avatar_andrzej_thiel.jpg' },
      // NAPRAWA: bez tego pola funkcja push onCudaTablicaPostPublished (która
      // sprawdza post.category/type/isDevotion) nigdy nie rozpoznawała tego
      // posta jako "Cuda Każdego Dnia" — powiadomienie nigdy się nie wysyłało.
      category: { stringValue: 'ckd' },
      isDevotion: { booleanValue: true },
      time: { stringValue: `${dateLabel} • 🕊️ Cuda Każdego Dnia` },
      title: { stringValue: `CUDA KAŻDEGO DNIA! ${dateLabel}. ${devotion.rawTitle.toUpperCase()}` },
      text: { stringValue: devotion.fullTextFormatted },
      image: { stringValue: devotion.imageUrl || '' },
      sourceUrl: { stringValue: devotion.sourceUrl },
      sourceSlug: { stringValue: devotion.slug || '' },
      likes: { integerValue: '0' },
      amen: { integerValue: '0' },
    }
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Firestore create post HTTP ${res.status}: ${errText}`);
  }
  const json = await res.json();
  return json.name ? json.name.split('/').pop() : null;
}


function triggerCudaPushNotification(postId, title) {
  try {
    const { exec } = require('child_process');
    const cmd = `node C:/Users/czark/Christian_Culture_Projekty/FCM_Notifier/send_notification.js --type cuda --postId "${postId}" --title "${title || ''}"`;
    exec(cmd, { env: { ...process.env, NODE_PATH: 'C:/Users/czark/Christian_Culture_Projekty/FCM_Notifier/node_modules' } }, (err, stdout, stderr) => {
      if (err) console.error('[Sync Cuda PUSH] Błąd wyzwalania PUSH:', err.message);
      else console.log('[Sync Cuda PUSH] Wynik wyzwolenia PUSH:\n', stdout);
    });
  } catch (e) {
    console.warn('[Sync Cuda PUSH] Notice:', e.message);
  }
}

export async function syncCudaDaily() {
  try {
    const archiveHtml = await fetchHtml(ARCHIVE_URL);
    const indexEntries = parseArchiveIndex(archiveHtml); // najnowsze pierwsze

    if (!indexEntries.length) {
      throw new Error('Nie znaleziono żadnych rozważań na stronie archiwum!');
    }

    const cudaDbPath = path.join(__dirname, 'rozwazania_cuda_baza.json');
    let base = { current: null, history: [] };
    if (fs.existsSync(cudaDbPath)) {
      try { base = JSON.parse(fs.readFileSync(cudaDbPath, 'utf8')); } catch (e) {}
    }
    if (!Array.isArray(base.history)) base.history = [];
    const publishedSlugs = new Set(base.history.map(r => r.slug).filter(Boolean));

    const missing = indexEntries.filter(e => !publishedSlugs.has(e.slug));
    if (!missing.length) {
      console.log('[Sync Cuda] Brak nowych rozważań — wszystko już opublikowane.');
      return { success: true, published: 0 };
    }

    // Publikuj od najstarszego do najnowszego wśród brakujących (chronologicznie
    // na tablicy), ograniczając liczbę na jedno uruchomienie skryptu.
    const toPublish = missing.slice(0, MAX_BACKFILL_PER_RUN).reverse();
    const results = [];

    for (const entry of toPublish) {
      console.log(`[Sync Cuda] Przetwarzam: ${entry.dateDMY} — ${entry.title || entry.slug}`);
      try {
        const articleHtml = await fetchHtml(entry.url);
        const devotion = parseArticle(articleHtml, entry.url);
        devotion.slug = entry.slug;
        const [dd, mm, yyyy] = entry.dateDMY.split('/');
        devotion.dateText = formatDatePl(dd, mm, yyyy);

        await downloadAndSaveImages(devotion.imageUrl, devotion);

        let tablicaPostId = null;
        try {
          tablicaPostId = await createFirestorePost(devotion);
          console.log(`[Sync Cuda] ✅ Opublikowano na tablicy i profilu Andrzeja: ${tablicaPostId}`);
        } catch (e) {
          console.error('[Sync Cuda] ❌ Błąd publikacji na tablicy:', e.message);
        }

        await saveToFirestore(devotion);

        base.current = devotion;
        base.history.unshift({ ...devotion, tablicaPostId, publishedAt: new Date().toISOString() });
        fs.writeFileSync(cudaDbPath, JSON.stringify(base, null, 2), 'utf8');
        publishedSlugs.add(entry.slug);

        results.push({ slug: entry.slug, dateDMY: entry.dateDMY, tablicaPostId });
        triggerCudaPushNotification(tablicaPostId, devotion.rawTitle);
      } catch (entryErr) {
        console.error(`[Sync Cuda] Błąd przetwarzania wpisu ${entry.slug}:`, entryErr.message);
      }
    }

    const remaining = missing.length - toPublish.length;
    if (remaining > 0) {
      console.log(`[Sync Cuda] Pozostało jeszcze ${remaining} starszych wpisów do nadrobienia w kolejnym uruchomieniu.`);
    }

    return { success: true, published: results.length, remaining, results };
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