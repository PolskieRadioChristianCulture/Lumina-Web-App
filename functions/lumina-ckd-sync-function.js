/**
 * ══════════════════════════════════════════════════════════════════════════
 * LUMINA — Zaplanowana synchronizacja "Cuda Każdego Dnia" (Cloud Function)
 * ══════════════════════════════════════════════════════════════════════════
 * PRZYCZYNA NAPRAWIANA TUTAJ: sync_cuda_kazdego_dnia.js w katalogu głównym
 * repozytorium to zwykły skrypt Node.js — działa TYLKO jeśli ktoś go ręcznie
 * uruchomi. Nigdzie w repozytorium nie było żadnego cron-a, GitHub Action ani
 * Cloud Schedulera, który by go wywoływał — dlatego "Cuda Każdego Dnia" nigdy
 * nie były realnie pobierane ani publikowane, mimo że kod był poprawny.
 *
 * Ten plik przenosi tę samą, już przetestowaną logikę parsowania do
 * PRAWDZIWEJ, zaplanowanej funkcji Firebase — działa na serwerach Google,
 * codziennie, niezależnie od tego, czy jakikolwiek komputer jest włączony.
 * Dokładnie ten sam wzorzec naprawy, co przy powiadomieniach push wcześniej.
 *
 * Publikacja do lumina_posts (authorSlug: 'andrzejthiel') automatycznie
 * wyzwala już istniejącą funkcję onCudaTablicaPostPublished — jedna
 * synchronizacja karmi tablicę, profil Andrzeja I powiadomienie push naraz.
 * ══════════════════════════════════════════════════════════════════════════
 */

const { initializeApp, getApps } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { onRequest } = require('firebase-functions/v2/https');
const { logger } = require('firebase-functions');

if (!getApps().length) initializeApp();
const db = getFirestore();
const REGION = 'europe-west1';

const ARCHIVE_URL = 'https://szukajacboga.pl/strona/cuda-kazdego-dnia-wszystkie-rozwazania';
const MAX_BACKFILL_PER_RUN = 10;
const MONTH_NAMES_PL = [
  'STYCZNIA', 'LUTEGO', 'MARCA', 'KWIETNIA', 'MAJA', 'CZERWCA',
  'LIPCA', 'SIERPNIA', 'WRZEŚNIA', 'PAŹDZIERNIKA', 'LISTOPADA', 'GRUDNIA'
];

function formatDatePl(dd, mm, yyyy) {
  return `${parseInt(dd, 10)} ${MONTH_NAMES_PL[parseInt(mm, 10) - 1]} ${yyyy}`;
}

async function fetchHtml(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} przy pobieraniu ${url}`);
  return res.text();
}

function parseArchiveIndex(html) {
  const seen = new Set();
  const entries = [];
  const linkRe = /<a[^>]+href=["'](\/artykul\/[^"']+)["'][^>]*>([\s\S]{0,400}?)<\/a>/gi;
  let m;
  while ((m = linkRe.exec(html)) !== null) {
    const slug = m[1].replace(/^\/artykul\//, '').replace(/[^a-zA-Z0-9_-]/g, '');
    if (!slug || seen.has(slug)) continue;
    const inner = m[2];
    const dateMatch = inner.match(/(\d{2})\/(\d{2})\/(\d{4})/);
    if (!dateMatch) continue;
    const [, dd, mm, yyyy] = dateMatch;
    const rawTitle = inner.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const title = rawTitle.split(/Cuda każdego dnia/i)[0].trim();
    seen.add(slug);
    entries.push({
      slug, url: `https://szukajacboga.pl/artykul/${slug}`,
      title: title || null, dateDMY: `${dd}/${mm}/${yyyy}`,
    });
  }
  return entries;
}

function parseArticle(html, articleUrl) {
  const ogTitle = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i)?.[1]
    || html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]?.replace(/<[^>]+>/g, '').trim()
    || 'Cuda Każdego Dnia';

  let ogImage = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i)?.[1] || '';
  if (!ogImage) {
    const imgMatch = html.match(/<img[^>]+src=["'](https:\/\/szukajacboga\.pl\/media\/cache\/[^"']+)["']/i);
    if (imgMatch) ogImage = imgMatch[1];
  }

  const articleTagMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
  const contentScope = articleTagMatch ? articleTagMatch[1] : html;
  const pMatches = [...contentScope.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)];
  const paragraphs = pMatches.map(m => m[1]
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&bdquo;|&rdquo;|&quot;/g, '„')
    .replace(/&#039;|&apos;/g, '\'')
    .replace(/&amp;/g, '&')
    .trim()
  ).filter(p => p.length > 0 && !p.startsWith('Zapraszam cię na kurs') && !p.startsWith('Posłuchaj:'));

  const cleanTitle = ogTitle.replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').trim();
  const slug = articleUrl.split('/').pop().replace(/[^a-zA-Z0-9_-]/g, '');

  return {
    slug,
    rawTitle: cleanTitle,
    imageUrl: ogImage,
    sourceUrl: articleUrl,
    fullTextFormatted: `Przeczytaj i zobacz jak Bóg przemienia twoje życie.\n\n${cleanTitle.toUpperCase()}\n\n` +
      paragraphs.join('\n\n') +
      `\n\n/opr. na podst. wiad. B.K./.\n\nDziękuję, że jesteś!\n❤️`
  };
}

async function publishDevotionPost(devotion, dateLabel) {
  await db.collection('lumina_posts').add({
    author: 'Andrzej Thiel',
    authorSlug: 'andrzejthiel',
    authorRole: 'Cuda Każdego Dnia 📖✨ • Sieradz',
    authorAvatar: 'avatar_andrzej_thiel.jpg',
    category: 'ckd',
    isDevotion: true,
    time: `${dateLabel} • 🕊️ Cuda Każdego Dnia`,
    title: `CUDA KAŻDEGO DNIA! ${dateLabel}. ${devotion.rawTitle.toUpperCase()}`,
    text: devotion.fullTextFormatted,
    image: devotion.imageUrl || '',
    sourceUrl: devotion.sourceUrl,
    sourceSlug: devotion.slug,
    likes: 0,
    amen: 0,
    createdAtTimestamp: FieldValue.serverTimestamp(),
  });
}

async function runSync() {
  const archiveHtml = await fetchHtml(ARCHIVE_URL);
  const indexEntries = parseArchiveIndex(archiveHtml); // najnowsze pierwsze
  if (!indexEntries.length) throw new Error('Nie znaleziono żadnych rozważań na stronie archiwum!');

  // Dedup przez Firestore (nie plik lokalny — Cloud Function nie ma trwałego dysku)
  const publishedSnap = await db.collection('lumina_posts')
    .where('authorSlug', '==', 'andrzejthiel')
    .where('category', '==', 'ckd')
    .get();
  const publishedSlugs = new Set(publishedSnap.docs.map(d => d.data().sourceSlug).filter(Boolean));

  const missing = indexEntries.filter(e => !publishedSlugs.has(e.slug));
  if (!missing.length) {
    logger.info('[CKD Sync] Brak nowych rozważań — wszystko już opublikowane.');
    return { published: 0 };
  }

  const toPublish = missing.slice(0, MAX_BACKFILL_PER_RUN).reverse(); // od najstarszego
  let published = 0;

  for (const entry of toPublish) {
    try {
      const articleHtml = await fetchHtml(entry.url);
      const devotion = parseArticle(articleHtml, entry.url);
      const [dd, mm, yyyy] = entry.dateDMY.split('/');
      const dateLabel = formatDatePl(dd, mm, yyyy);
      await publishDevotionPost(devotion, dateLabel);
      published++;
      logger.info(`[CKD Sync] ✅ Opublikowano: ${entry.dateDMY} — ${entry.title || entry.slug}`);
    } catch (entryErr) {
      logger.error(`[CKD Sync] Błąd przy ${entry.slug}:`, entryErr.message);
    }
  }

  const remaining = missing.length - toPublish.length;
  if (remaining > 0) logger.info(`[CKD Sync] Pozostało ${remaining} starszych wpisów na kolejne uruchomienie.`);

  return { published, remaining };
}

/**
 * Uruchamia się automatycznie codziennie o 06:00 (przed powiadomieniem
 * porannym o 06:15, i przed tym, jak ktokolwiek wejdzie na tablicę rano).
 */
exports.scheduledCudaKazdegoDniaSync = onSchedule(
  { schedule: '0 6 * * *', timeZone: 'Europe/Warsaw', region: REGION, timeoutSeconds: 300 },
  async () => {
    logger.info('[CKD Sync] Uruchomienie zaplanowanej synchronizacji 06:00...');
    try {
      const result = await runSync();
      logger.info('[CKD Sync] Zakończono:', result);
    } catch (err) {
      logger.error('[CKD Sync] Błąd synchronizacji:', err);
    }
  }
);

/**
 * Endpoint do ręcznego wywołania (test / nadrobienie zaległości od razu,
 * bez czekania do jutra 06:00). Wywołaj:
 *   curl https://europe-west1-lumina-cc.cloudfunctions.net/triggerCudaKazdegoDniaSyncNow
 */
exports.triggerCudaKazdegoDniaSyncNow = onRequest(
  { region: REGION, timeoutSeconds: 300 },
  async (req, res) => {
    try {
      const result = await runSync();
      res.status(200).json({ ok: true, ...result });
    } catch (err) {
      logger.error('[CKD Sync] Błąd (ręczne wywołanie):', err);
      res.status(500).json({ ok: false, error: err.message });
    }
  }
);
