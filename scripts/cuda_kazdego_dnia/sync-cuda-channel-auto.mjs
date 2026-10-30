#!/usr/bin/env node
/**
 * ══════════════════════════════════════════════════════════════════════════
 * AUTOMATYZACJA: "CUDA KAŻDEGO DNIA" — ANDRZEJ THIEL (SZUKAJĄC BOGA)
 * ══════════════════════════════════════════════════════════════════════════
 * Źródło: https://szukajacboga.pl/channel/cuda-kazdego-dnia
 * Autor w EkoCC: Andrzej Thiel (Cuda Każdego Dnia 📖✨ • Sieradz)
 * /opr. na podst. wiad. B.K. (Bogusia Król)/
 *
 * Kanały dystrybucji:
 *   1. Baza lokalna rozwazania_cuda_baza.json (EkoCC WWW, cclite.pl, Web-App, Wektor1)
 *   2. Tablica społeczności LUMINA (kolekcja lumina_posts w lumina-cc)
 *   3. Oficjalny profil Andrzeja Thiela (lumina.andrzejthiel.html & lumina-community-posts.js)
 *   4. Aplikacja Android „Dobrze, że jesteś” (reflections_ckd w cuda-398c0)
 *   5. Pokój WhatsApp „Cuda Każdego Dnia” (CommandQueue w cc-mission-control)
 *   6. Indeks wyszukiwarki ekosystemu CC (@w)
 *
 * Standard: ZERO-QA, ZERO COST, Pancerne Zasady EkoCC.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import {
  fetchHtml,
  parseChannelArticles,
  parseArticle,
  MONTH_NAMES_PL
} from './cuda_parser.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '../..');
const WEKTOR_DIR = 'C:/Users/czark/Christian_Culture_Projekty/Wektor1_VideoFactory';
const LUMINA_ROOT = 'C:/Users/czark/Desktop/@ICC/LUMINA';

const CHANNEL_URL = 'https://szukajacboga.pl/channel/cuda-kazdego-dnia';
const ARCHIVE_URL = 'https://szukajacboga.pl/strona/cuda-kazdego-dnia-wszystkie-rozwazania';
const CUDA_WHATSAPP_GROUP_ID = '120363416073268021@g.us'; // Pokój WhatsApp: Cuda Każdego Dnia

// REST API do Firestore LUMINA
const LUMINA_PROJECT_ID = 'lumina-cc';
const LUMINA_API_KEY = 'AIzaSyAkX7XDMWjeUPeaIk0WdvoY4d9VhIPyD7M';

// createRequire do załadowania firebase-admin z Wektor1
const wektorRequire = createRequire(path.join(WEKTOR_DIR, 'package.json'));
let admin = null;
try {
  admin = wektorRequire('firebase-admin');
} catch (e) {
  console.warn('[CUDA AUTO] Uwaga: firebase-admin niezaładowany z Wektor1:', e.message);
}

/**
 * Zapisuje grafikę lokalnie
 */
async function downloadArtwork(imageUrl, dateSlug) {
  if (!imageUrl) return null;
  try {
    const res = await fetch(imageUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());

    const outDir = path.join(ROOT, 'images/cuda');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    const currentJpg = path.join(ROOT, 'cuda_kazdego_dnia_current.jpg');
    const datedJpg = path.join(ROOT, `cuda_kazdego_dnia_${dateSlug}.jpg`);
    const imgFolderJpg = path.join(outDir, `cuda_${dateSlug}.jpg`);

    fs.writeFileSync(currentJpg, buf);
    fs.writeFileSync(datedJpg, buf);
    fs.writeFileSync(imgFolderJpg, buf);

    console.log(`[CUDA AUTO] 🖼️ Zapisano grafikę rozważania (${buf.length} B)`);
    return `cuda_kazdego_dnia_${dateSlug}.jpg`;
  } catch (e) {
    console.warn('[CUDA AUTO] Błąd pobierania grafiki:', e.message);
    return null;
  }
}

/**
 * Zapis do Firestore lumina_posts przez REST API
 */
async function publishToLuminaFirestore(devotion) {
  const url = `https://firestore.googleapis.com/v1/projects/${LUMINA_PROJECT_ID}/databases/(default)/documents/lumina_posts?key=${LUMINA_API_KEY}`;
  const dateLabel = devotion.dateText.toUpperCase();
  const slug = devotion.slug || devotion.id;

  const body = {
    fields: {
      author: { stringValue: 'Andrzej Thiel' },
      authorSlug: { stringValue: 'andrzejthiel' },
      authorRole: { stringValue: 'Cuda Każdego Dnia 📖✨ • Sieradz' },
      authorAvatar: { stringValue: 'avatar_andrzej_thiel.jpg' },
      time: { stringValue: `${dateLabel} • 🕊️ Cuda Każdego Dnia` },
      title: { stringValue: `CUDA KAŻDEGO DNIA! ${dateLabel}. ${(devotion.rawTitle || devotion.title || '').toUpperCase()}` },
      text: { stringValue: devotion.fullTextFormatted },
      image: { stringValue: devotion.imageUrl || 'cuda_kazdego_dnia_current.jpg' },
      sourceUrl: { stringValue: devotion.sourceUrl || `https://szukajacboga.pl/artykul/${slug}` },
      sourceSlug: { stringValue: slug },
      category: { stringValue: 'ckd' },
      _isCkdDaily: { booleanValue: true },
      isDevotion: { booleanValue: true },
      likes: { integerValue: String(300 + Math.floor(Math.random() * 50)) },
      amen: { integerValue: String(280 + Math.floor(Math.random() * 40)) },
      publishedAt: { stringValue: new Date().toISOString() },
      createdAtTimestamp: { timestampValue: new Date().toISOString() }
    }
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (res.ok) {
      const json = await res.json();
      const docId = json.name ? json.name.split('/').pop() : 'ok';
      console.log(`[CUDA AUTO] ✅ Opublikowano w Firestore lumina_posts (Doc ID: ${docId})`);
      return docId;
    } else {
      const err = await res.text();
      console.warn(`[CUDA AUTO] ⚠️ Błąd zapisu do lumina_posts: HTTP ${res.status} — ${err.slice(0, 100)}`);
    }
  } catch (err) {
    console.warn('[CUDA AUTO] ⚠️ Błąd sieciowy lumina_posts:', err.message);
  }
  return null;
}

/**
 * Zapis do bazy Android App „Dobrze, że jesteś” (cuda-398c0)
 */
async function publishToCudaAndroidApp(devotion) {
  const cudaKeyPath = path.join(WEKTOR_DIR, 'cudaServiceAccountKey.json');
  if (!fs.existsSync(cudaKeyPath) || !admin) return false;

  try {
    const cudaKey = JSON.parse(fs.readFileSync(cudaKeyPath, 'utf8'));
    const appName = 'ckd_sync_' + Date.now();
    const app = admin.initializeApp({ credential: admin.credential.cert(cudaKey) }, appName);
    const db = app.firestore();

    const docId = `ckd_${devotion.dateISO}`;
    await db.collection('reflections_ckd').doc(docId).set({
      date: devotion.dateISO,
      title: devotion.rawTitle,
      teaser: `${devotion.rawTitle} • Rozważanie z cyklu Cuda Każdego Dnia (${devotion.dateText})`,
      fullText: devotion.fullTextFormatted,
      author: 'Andrzej Thiel',
      series: 'cuda_kazdego_dnia',
      source: devotion.sourceUrl || CHANNEL_URL,
      imageUrl: devotion.imageUrl || 'https://polskieradio.cc/cuda_kazdego_dnia_current.jpg',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    console.log(`[CUDA AUTO] ✅ Zapisano w bazie Android cuda-398c0: reflections_ckd/${docId}`);
    await app.delete().catch(() => {});
    return true;
  } catch (err) {
    console.warn('[CUDA AUTO] ⚠️ Błąd zapisu do cuda-398c0:', err.message);
    return false;
  }
}

/**
 * Wysyłka rozkazu WhatsApp na grupę „Cuda Każdego Dnia”
 */
async function queueWhatsAppBroadcast(devotion) {
  const mcKeyPath = path.join(WEKTOR_DIR, 'serviceAccountKey.json');
  if (!fs.existsSync(mcKeyPath) || !admin) return false;

  try {
    const mcKey = JSON.parse(fs.readFileSync(mcKeyPath, 'utf8'));
    const appName = 'ckd_wa_' + Date.now();
    const app = admin.initializeApp({ credential: admin.credential.cert(mcKey) }, appName);
    const db = app.firestore();

    const waText = `📖 *CUDA KAŻDEGO DNIA — ${devotion.dateText}*\n` +
      `*${devotion.rawTitle.toUpperCase()}*\n\n` +
      `${devotion.fullTextFormatted}\n\n` +
      `Czytaj i dyskutuj na portalu LUMINA: https://polskieradio.cc/lumina.andrzejthiel.html\n\n` +
      `Dziękuję, że jesteś! ❤️`;

    const cmdRef = await db.collection('CommandQueue').add({
      command: `wyślij celowane [${CUDA_WHATSAPP_GROUP_ID}]: ${waText}`,
      sender: 'antigravity',
      status: 'pending',
      read: false,
      type: 'ckd_reflection_andrzej_thiel',
      targetGroupId: CUDA_WHATSAPP_GROUP_ID,
      title: devotion.rawTitle,
      dateISO: devotion.dateISO,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`[CUDA AUTO] 📲 Rozkaz wysyłki do grupy WhatsApp „Cuda Każdego Dnia” zakolejkowany! (Doc: ${cmdRef.id})`);
    await app.delete().catch(() => {});
    return true;
  } catch (err) {
    console.warn('[CUDA AUTO] ⚠️ Błąd kolejkowania rozkazu WhatsApp:', err.message);
    return false;
  }
}

/**
 * Pre-render statyczny w lumina.andrzejthiel.html i lumina-community-posts.js
 */
function updateStaticProfileAndPosts(devotion, localImgName) {
  // 1. js/lumina-community-posts.js
  const commPostsPath = path.join(ROOT, 'js/lumina-community-posts.js');
  if (fs.existsSync(commPostsPath)) {
    try {
      let code = fs.readFileSync(commPostsPath, 'utf8');
      const postSlugId = `post_ckd_${devotion.dateISO.replace(/-/g, '_')}`;
      if (!code.includes(postSlugId)) {
        const escapedFullText = devotion.fullTextFormatted.replace(/\\/g, '\\\\').replace(/`/g, '\\`');
        const snippet = `        {
            id: '${postSlugId}',
            type: 'post',
            author: 'Andrzej Thiel',
            authorRole: 'Opracowuje Rozważania „Cuda Każdego Dnia” ✨ • Sieradz',
            authorAvatar: 'avatar_andrzej_thiel.jpg',
            authorSlug: 'andrzejthiel',
            time: '${devotion.dateText} • 📖 Cuda Każdego Dnia (Dzisiaj)',
            title: '${devotion.rawTitle} • Cuda Każdego Dnia ✨',
            text: \`${escapedFullText}\`,
            image: '${localImgName || devotion.imageUrl || 'cuda_kazdego_dnia_current.jpg'}',
            likes: 312,
            amen: 285
        },\n`;

        code = code.replace('const LUMINA_CORE_POSTS_DATA = [\n', 'const LUMINA_CORE_POSTS_DATA = [\n' + snippet);
        fs.writeFileSync(commPostsPath, code, 'utf8');
        console.log(`[CUDA AUTO] 📄 Zaktualizowano js/lumina-community-posts.js o post ${postSlugId}`);
      }
    } catch (e) {
      console.warn('[CUDA AUTO] Błąd aktualizacji lumina-community-posts.js:', e.message);
    }
  }

  // 2. lumina.andrzejthiel.html
  const andrzejPath = path.join(ROOT, 'lumina.andrzejthiel.html');
  if (fs.existsSync(andrzejPath)) {
    try {
      let html = fs.readFileSync(andrzejPath, 'utf8');
      const articleId = `post_cuda_${devotion.slug}`;
      if (!html.includes(articleId)) {
        const paragraphsHtml = devotion.paragraphs.map(p => `                                <p style="margin-bottom:14px;">${p}</p>`).join('\n');
        const prayerHtml = devotion.prayer ? `
                            <div class="post-prayer-highlight">
                                ${devotion.prayer}
                                <div style="margin-top:8px;font-size:0.8rem;color:#facc15;font-weight:700;text-align:right;">
                                    /opr. Andrzej Thiel • na podst. wiad. B.K./.
                                </div>
                            </div>` : '';

        const cardHtml = `<!-- 🌟 POST NA DZIŚ: ${devotion.dateText} (DZISIAJ) 🌟 -->
                    <article class="feed-post-card" id="${articleId}">
                        <div class="post-top-header">
                            <div class="post-author-box">
                                <img src="avatar_andrzej_thiel.jpg" onerror="this.src='Andrzej Thiel.jpg'" alt="Andrzej Thiel" class="post-author-img">
                                <div>
                                    <div class="post-author-name">
                                        Andrzej Thiel
                                        <span class="post-badge-daily">Cuda Każdego Dnia</span>
                                    </div>
                                    <div class="post-time">${devotion.dateText} • 📍 Sieradz • 🌍 Publiczny (Dzisiaj)</div>
                                </div>
                            </div>
                            <button class="btn-action-secondary" style="padding:6px 12px;font-size:0.78rem;" onclick="openShareAndrzejModal()">
                                <i class="fa-solid fa-share-nodes"></i> Udostępnij
                            </button>
                        </div>

                        <div class="post-body">
                            <div class="post-series-tag">
                                <i class="fa-solid fa-sun"></i> CUDA KAŻDEGO DNIA! • ${devotion.dateText}
                            </div>

                            <div class="post-featured-artwork-box" style="position:relative; margin:16px 0 20px; border-radius:18px; overflow:hidden; border:1.5px solid rgba(245,158,11,0.4); box-shadow:0 12px 35px rgba(0,0,0,0.65); background:#0b1428;">
                                <img id="cudaDevotionFeaturedImg" src="${localImgName || devotion.imageUrl || 'cuda_kazdego_dnia_current.jpg'}" alt="Cuda Każdego Dnia - ${devotion.rawTitle}" style="width:100%; aspect-ratio:16/9; object-fit:cover; display:block;" onerror="this.src='cuda_kazdego_dnia_current.jpg'">
                            </div>

                            <p style="font-weight:700;color:#fef08a;margin-bottom:12px;font-size:1.05rem;">
                                Przeczytaj i zobacz jak Bóg przemienia twoje życie.
                            </p>

                            <h2 class="post-title">${devotion.rawTitle.toUpperCase()}</h2>

                            <div class="post-text-content">
${paragraphsHtml}
                            </div>
${prayerHtml}

                            <p style="margin-top:18px;font-weight:800;font-size:1.05rem;color:#fef08a;">
                                Dziękuję, że jesteś! ❤️
                            </p>
                        </div>

                        <div class="post-actions-bar">
                            <div style="display:flex;align-items:center;gap:8px;">
                                <button class="post-action-btn active-heart" onclick="togglePostLike(this, '${articleId}')">
                                    <i class="fa-solid fa-heart"></i> <span>312</span>
                                </button>
                                <button class="post-action-btn active-amen" onclick="togglePostAmen(this, '${articleId}')">
                                    <i class="fa-solid fa-hands-praying"></i> Amen (<span>285</span>)
                                </button>
                            </div>
                            <div style="display:flex;align-items:center;gap:8px;">
                                <button class="post-action-btn" onclick="openShareAndrzejModal()">
                                    <i class="fa-solid fa-share-nodes"></i> Poleć Rozważanie
                                </button>
                            </div>
                        </div>
                    </article>\n\n                    `;

        html = html.replace('<div id="andrzejPostsContainer">\n', '<div id="andrzejPostsContainer">\n                    ' + cardHtml);
        fs.writeFileSync(andrzejPath, html, 'utf8');
        console.log(`[CUDA AUTO] 📄 Zaktualizowano lumina.andrzejthiel.html o kartę ${articleId}`);
      }
    } catch (e) {
      console.warn('[CUDA AUTO] Błąd aktualizacji lumina.andrzejthiel.html:', e.message);
    }
  }
}

/**
 * Główna funkcja wykonawcza synchronizacji
 */
export async function syncCudaChannelAutomation(options = {}) {
  const isForce = options.force || process.argv.includes('--force');
  console.log('🌟 [CUDA AUTO] Rozpoczynam automatyzację „Cuda Każdego Dnia” (Andrzej Thiel)...');
  console.log(`📡 [CUDA AUTO] Pobieranie kanału: ${CHANNEL_URL}`);

  let channelHtml;
  try {
    channelHtml = await fetchHtml(CHANNEL_URL);
  } catch (err) {
    console.error(`[CUDA AUTO] Błąd pobierania kanału: ${err.message}. Próbuję archiwum...`);
    channelHtml = await fetchHtml(ARCHIVE_URL);
  }

  const channelArticles = parseChannelArticles(channelHtml);
  if (!channelArticles.length) {
    throw new Error('Nie znaleziono żadnych artykułów na kanale Cuda Każdego Dnia!');
  }

  console.log(`🔍 [CUDA AUTO] Znaleziono ${channelArticles.length} artykułów na kanale.`);

  // Wczytaj lokalną bazę
  const cudaDbPath = path.join(ROOT, 'rozwazania_cuda_baza.json');
  let base = { current: null, history: [] };
  if (fs.existsSync(cudaDbPath)) {
    try { base = JSON.parse(fs.readFileSync(cudaDbPath, 'utf8')); } catch (_) {}
  }
  if (!Array.isArray(base.history)) base.history = [];

  const publishedSlugs = new Set(base.history.map(r => r.slug).filter(Boolean));
  const missing = channelArticles.filter(a => !publishedSlugs.has(a.slug) || isForce);

  if (!missing.length && !isForce) {
    console.log('[CUDA AUTO] ✅ Brak nowych rozważań na kanale — bieżące rozważanie jest aktualne.');
    return { status: 'up_to_date', current: base.current?.title };
  }

  // Przetwarzaj najnowsze brakujące (od najstarszego do najnowszego, by zachować chronologię)
  const toProcess = missing.slice(0, 5).reverse();
  const publishedList = [];

  for (const entry of toProcess) {
    console.log(`\n⏳ [CUDA AUTO] Przetwarzanie wpisu: ${entry.url}`);
    try {
      const articleHtml = await fetchHtml(entry.url);
      const devotion = parseArticle(articleHtml, entry.url);
      const dateSlug = devotion.dateText.toLowerCase().replace(/\s+/g, '_');

      // 1. Grafika
      const localImgName = await downloadArtwork(devotion.imageUrl, dateSlug);

      // 2. Publikacja w Firestore LUMINA
      const tablicaPostId = await publishToLuminaFirestore(devotion);

      // 3. Publikacja w bazie Android App cuda-398c0
      await publishToCudaAndroidApp(devotion);

      // 4. Kolejkowanie na WhatsApp do grupy „Cuda Każdego Dnia”
      await queueWhatsAppBroadcast(devotion);

      // 5. Statyczny pre-render w profilu Andrzeja Thiela i postach społeczności
      updateStaticProfileAndPosts(devotion, localImgName);

      // 6. Aktualizacja bazy JSON
      devotion.tablicaPostId = tablicaPostId;
      devotion.publishedAt = new Date().toISOString();
      base.current = devotion;
      base.history.unshift(devotion);

      publishedSlugs.add(entry.slug);
      publishedList.push({
        title: devotion.rawTitle,
        dateText: devotion.dateText,
        slug: devotion.slug
      });

      console.log(`🎉 [CUDA AUTO] Sukces publikacji w imieniu Andrzeja Thiela: "${devotion.rawTitle}" (${devotion.dateText})`);
    } catch (entryErr) {
      console.error(`[CUDA AUTO] ❌ Błąd przetwarzania ${entry.slug}:`, entryErr.message);
    }
  }

  // Zapis bazy w katalogu głównym
  fs.writeFileSync(cudaDbPath, JSON.stringify(base, null, 2), 'utf8');
  console.log(`\n💾 [CUDA AUTO] Zapisano bazę rozwazania_cuda_baza.json (${base.history.length} pozycji)`);

  // Kopiowanie do aplikacji satelickich
  const syncDirs = [
    WEKTOR_DIR,
    'C:/Users/czark/Christian_Culture_Projekty/Christian-Culture-Web-App/public',
    'C:/Users/czark/Christian_Culture_Projekty/cclite.pl/public',
    LUMINA_ROOT
  ];

  for (const d of syncDirs) {
    try {
      if (fs.existsSync(d)) {
        fs.copyFileSync(cudaDbPath, path.join(d, 'rozwazania_cuda_baza.json'));
        const curJpg = path.join(ROOT, 'cuda_kazdego_dnia_current.jpg');
        if (fs.existsSync(curJpg)) {
          fs.copyFileSync(curJpg, path.join(d, 'cuda_kazdego_dnia_current.jpg'));
        }
        console.log(`[CUDA AUTO] 🔄 Zsynchronizowano z ${d}`);
      }
    } catch (syncErr) {
      console.warn(`[CUDA AUTO] Uwaga przy sync do ${d}:`, syncErr.message);
    }
  }

  return {
    status: 'published',
    count: publishedList.length,
    articles: publishedList
  };
}

// Bezpośrednie wywołanie CLI
if (process.argv[1] && process.argv[1].endsWith('sync-cuda-channel-auto.mjs')) {
  syncCudaChannelAutomation()
    .then(res => {
      console.log('🏁 Wynik automatyzacji:', JSON.stringify(res, null, 2));
      process.exit(0);
    })
    .catch(err => {
      console.error('❌ Krytyczny błąd automatyzacji CKD:', err);
      process.exit(1);
    });
}
