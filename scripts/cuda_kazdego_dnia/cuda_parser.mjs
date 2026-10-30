/**
 * CUDA KAŻDEGO DNIA — PARSER KANAŁU SZUKAJĄC BOGA
 * Źródło: https://szukajacboga.pl/channel/cuda-kazdego-dnia
 * Autor publikacji w EkoCC: Andrzej Thiel (Sieradz)
 * /opr. na podst. wiad. B.K. (Bogusia Król)/
 */

export const MONTH_NAMES_PL = [
  'STYCZNIA', 'LUTEGO', 'MARCA', 'KWIETNIA', 'MAJA', 'CZERWCA',
  'LIPCA', 'SIERPNIA', 'WRZEŚNIA', 'PAŹDZIERNIKA', 'LISTOPADA', 'GRUDNIA'
];

export function formatDatePl(dd, mm, yyyy) {
  const d = parseInt(dd, 10);
  const m = parseInt(mm, 10);
  const monthName = MONTH_NAMES_PL[m - 1] || '';
  return `${d} ${monthName} ${yyyy}`;
}

export async function fetchHtml(url) {
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
 * Parsuje stronę kanału https://szukajacboga.pl/channel/cuda-kazdego-dnia
 * Zwraca listę unikalnych artykułów: { slug, url, snippet }
 */
export function parseChannelArticles(channelHtml) {
  const linkMatches = [...channelHtml.matchAll(/<a[^>]+href=["'](\/artykul\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)];
  const seen = new Set();
  const articles = [];

  for (const m of linkMatches) {
    const rawSlug = m[1].replace('/artykul/', '').split('?')[0].replace(/[^a-zA-Z0-9_-]/g, '');
    if (!rawSlug || seen.has(rawSlug)) continue;
    seen.add(rawSlug);

    const inner = m[2];
    const dateMatch = inner.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    const text = inner.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

    articles.push({
      slug: rawSlug,
      url: `https://szukajacboga.pl/artykul/${rawSlug}`,
      dateDMY: dateMatch ? dateMatch[0] : null,
      rawSnippet: text
    });
  }

  return articles;
}

/**
 * Parsuje treść pojedynczego artykułu rozważania
 */
export function parseArticle(html, articleUrl) {
  const ogTitle = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i)?.[1]
    || html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]?.replace(/<[^>]+>/g, '').trim()
    || 'Cuda Każdego Dnia';

  let ogImage = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i)?.[1] || '';
  if (!ogImage) {
    const imgMatch = html.match(/<img[^>]+src=["'](https:\/\/szukajacboga\.pl\/media\/cache\/[^"']+)["']/i);
    if (imgMatch) ogImage = imgMatch[1];
  }

  let dateText = '';
  let dateDMY = '';
  let dateISO = '';
  const dateMatch = html.match(/<span>(\d{1,2}\/\d{1,2}\/\d{4})<\/span>/i)
    || html.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);

  if (dateMatch) {
    const parts = (dateMatch[1] || dateMatch[0]).split('/');
    const dd = parts[0];
    const mm = parts[1];
    const yyyy = parts[2];
    dateDMY = `${String(dd).padStart(2, '0')}/${String(mm).padStart(2, '0')}/${yyyy}`;
    dateISO = `${yyyy}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`;
    dateText = formatDatePl(dd, mm, yyyy);
  } else {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = String(now.getFullYear());
    dateDMY = `${dd}/${mm}/${yyyy}`;
    dateISO = `${yyyy}-${mm}-${dd}`;
    dateText = formatDatePl(dd, mm, yyyy);
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
  const prayerP = paragraphs.find(p => p.includes('Panie') && (p.includes('amen') || p.includes('Amen')));
  if (prayerP) {
    prayer = prayerP;
  }

  const cleanTitle = ogTitle.replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').trim();
  const slug = articleUrl.split('/').pop().split('?')[0].replace(/[^a-zA-Z0-9_-]/g, '');

  const fullTextFormatted = `CUDA KAŻDEGO DNIA!\n${dateText}.\nPrzeczytaj i zobacz jak Bóg przemienia twoje życie.\n\n${cleanTitle.toUpperCase()}\n\n` +
    paragraphs.join('\n\n') +
    `\n\n/opr. Andrzej Thiel • na podst. wiad. B.K./.\n\nDziękuję, że jesteś! ❤️`;

  return {
    id: `cuda_${slug}`,
    slug,
    title: cleanTitle.toUpperCase(),
    rawTitle: cleanTitle,
    dateText,
    dateDMY,
    dateISO,
    imageUrl: ogImage,
    sourceUrl: articleUrl,
    paragraphs,
    prayer,
    fullTextFormatted
  };
}
