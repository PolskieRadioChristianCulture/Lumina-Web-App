/**
 * ══════════════════════════════════════════════════════════════════════════
 * LUMINA Christian Culture — Cloud Function: Cuda Każdego Dnia Auto-Sync
 * ══════════════════════════════════════════════════════════════════════════
 * Harmonogram: codziennie o 06:05 (Europe/Warsaw)
 * Wykonuje synchronizację w chmurze Google niezależnie od komputera lokalnego.
 */

const { initializeApp, getApps, getApp } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const logger = require('firebase-functions/logger');

// Inicjalizacja Firebase Admin — bezpieczna (nie duplikuje, jeśli już załadowany)
const app = getApps().length === 0 ? initializeApp() : getApp();

const REGION = 'europe-west1';
const ARCHIVE_URL = 'https://szukajacboga.pl/strona/cuda-kazdego-dnia-wszystkie-rozwazania';
const MAX_BACKFILL_PER_RUN = 5;

const MONTH_NAMES_PL = [
    'STYCZNIA', 'LUTEGO', 'MARCA', 'KWIETNIA', 'MAJA', 'CZERWCA',
    'LIPCA', 'SIERPNIA', 'WRZESNIA', 'PAZDZIERNIKA', 'LISTOPADA', 'GRUDNIA'
];

function formatDatePl(dd, mm, yyyy) {
    return `${parseInt(dd, 10)} ${MONTH_NAMES_PL[parseInt(mm, 10) - 1]} ${yyyy}`;
}

async function fetchHtml(url) {
    const res = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,*/*;q=0.8',
            'Accept-Language': 'pl-PL,pl;q=0.9,en-US;q=0.8'
        }
    });
    if (!res.ok) {
        throw new Error(`HTTP ${res.status} pobierajac ${url}`);
    }
    return await res.text();
}

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
            title = rawTitle.split(/Cuda kazdego dnia/i)[0].trim();
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

function parseArticle(html, articleUrl) {
    const ogTitle = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i)?.[1]
        || html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]?.replace(/<[^>]+>/g, '').trim()
        || 'Cuda Kazdego Dnia';

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
    const paragraphs = pMatches.map(p => {
        return p[1]
            .replace(/<br\s*[\/]?>/gi, '\n')
            .replace(/<[^>]+>/g, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/&bdquo;|&rdquo;|&quot;/g, '"')
            .replace(/&#039;|&apos;/g, "'")
            .replace(/&amp;/g, '&')
            .trim();
    }).filter(p => p.length > 0 && !p.startsWith('Zapraszam cie na kurs') && !p.startsWith('Posluchaj:'));

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
        fullTextFormatted: `Przeczytaj i zobacz jak Bog przemienia twoje zycie.\n\n${cleanTitle.toUpperCase()}\n\n` +
            paragraphs.join('\n\n') +
            `\n\n/opr. na podst. wiad. B.K./.\n\nDziekuje, ze jestes!\n`
    };
}

/**
 * scheduledCudaKazdegoDniaSync
 * Codziennie o 06:05 (Europe/Warsaw) — sprawdza nowe rozważania na szukajacboga.pl
 * i publikuje je do lumina_posts oraz lumina_cuda_kazdego_dnia/current
 */
exports.scheduledCudaKazdegoDniaSync = onSchedule(
    { schedule: '5 6 * * *', timeZone: 'Europe/Warsaw', region: REGION },
    async (event) => {
        logger.info('[Sync CKD] Rozpoczecie automatycznej synchronizacji Cuda Kazdego Dnia...');
        const db = getFirestore(app);

        try {
            const archiveHtml = await fetchHtml(ARCHIVE_URL);
            const indexEntries = parseArchiveIndex(archiveHtml);

            if (!indexEntries.length) {
                logger.warn('[Sync CKD] Nie znaleziono zadnych wpisow na stronie archiwum!');
                return;
            }

            // Sprawdz opublikowane posty
            const existingSnap = await db.collection('lumina_posts')
                .where('authorSlug', '==', 'andrzejthiel')
                .limit(200)
                .get();

            const publishedSlugs = new Set();
            existingSnap.forEach(d => {
                const data = d.data();
                if (data.sourceSlug) publishedSlugs.add(data.sourceSlug);
            });

            // Sprawdz dokument current
            const currentDoc = await db.doc('lumina_cuda_kazdego_dnia/current').get();
            if (currentDoc.exists) {
                const cData = currentDoc.data();
                if (cData && cData.slug) publishedSlugs.add(cData.slug);
            }

            const missing = indexEntries.filter(e => !publishedSlugs.has(e.slug));
            if (!missing.length) {
                logger.info('[Sync CKD] Brak nowych rozwazania. Baza jest aktualna.');
                return;
            }

            // Publikuj najnowsze brakujace (do MAX_BACKFILL_PER_RUN na raz)
            const toPublish = missing.slice(0, MAX_BACKFILL_PER_RUN).reverse();
            logger.info(`[Sync CKD] Znaleziono ${missing.length} brakujacych, publikuje ${toPublish.length}...`);

            for (const entry of toPublish) {
                logger.info(`[Sync CKD] Przetwarzam: ${entry.dateDMY} -- ${entry.title || entry.slug}`);
                try {
                    const articleHtml = await fetchHtml(entry.url);
                    const devotion = parseArticle(articleHtml, entry.url);
                    devotion.slug = entry.slug;
                    const [dd, mm, yyyy] = entry.dateDMY.split('/');
                    devotion.dateText = formatDatePl(dd, mm, yyyy);
                    const dateLabel = devotion.dateText.toUpperCase();

                    // 1. Publikuj do lumina_posts (wyzwoli push przez onCudaTablicaPostPublished!)
                    const postRef = await db.collection('lumina_posts').add({
                        author: 'Andrzej Thiel',
                        authorSlug: 'andrzejthiel',
                        authorRole: 'Cuda Kazdego Dnia',
                        authorAvatar: 'avatar_andrzej_thiel.jpg',
                        time: `${dateLabel} • Cuda Kazdego Dnia`,
                        title: `CUDA KAZDEGO DNIA! ${dateLabel}. ${devotion.rawTitle.toUpperCase()}`,
                        text: devotion.fullTextFormatted,
                        image: devotion.imageUrl || '',
                        imageUrl: devotion.imageUrl || '',
                        sourceUrl: devotion.sourceUrl,
                        sourceSlug: devotion.slug,
                        category: 'ckd',
                        isDevotion: true,
                        likes: 0,
                        amen: 0,
                        createdAt: FieldValue.serverTimestamp()
                    });

                    // 2. Aktualizuj current
                    await db.doc('lumina_cuda_kazdego_dnia/current').set({
                        id: devotion.id,
                        slug: devotion.slug,
                        title: devotion.title,
                        rawTitle: devotion.rawTitle,
                        dateText: devotion.dateText,
                        text: devotion.fullTextFormatted,
                        prayer: devotion.prayer,
                        imageUrl: devotion.imageUrl,
                        sourceUrl: devotion.sourceUrl,
                        author: 'Andrzej Thiel',
                        authorRole: 'Cuda Kazdego Dnia',
                        publishedAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    }, { merge: true });

                    logger.info(`[Sync CKD] Opublikowano: ${postRef.id} (${devotion.slug})`);
                } catch (entryErr) {
                    logger.error(`[Sync CKD] Blad dla ${entry.slug}:`, entryErr.message);
                }
            }
        } catch (err) {
            logger.error('[Sync CKD] Blad synchronizacji:', err);
        }
    }
);