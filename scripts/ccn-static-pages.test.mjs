import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import esbuild from 'esbuild';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const ARTICLES_TS_PATH = path.join(ROOT, 'portals/ccn-news/src/data/articles.ts');
const SITEMAP_PATH = path.join(ROOT, 'sitemap.xml');

// Load articles
function loadArticles() {
  const result = esbuild.buildSync({
    entryPoints: [ARTICLES_TS_PATH],
    bundle: true,
    format: 'cjs',
    write: false,
    platform: 'node',
    target: 'node18'
  });
  const mod = { exports: {} };
  const fn = new Function('module', 'exports', 'require', result.outputFiles[0].text);
  fn(mod, mod.exports, (id) => require(id));
  return mod.exports.INITIAL_ARTICLES || [];
}

test('CCN SSG: every article has generated static HTML and clean URL index.html', () => {
  const articles = loadArticles();
  assert.ok(articles.length >= 10, 'Articles list has at least 10 entries');

  for (const article of articles) {
    const slugFile = path.join(ROOT, 'news', `${article.slug}.html`);
    const cleanIndex = path.join(ROOT, 'news', article.slug, 'index.html');

    assert.ok(fs.existsSync(slugFile), `Missing static file: news/${article.slug}.html`);
    assert.ok(fs.existsSync(cleanIndex), `Missing clean URL file: news/${article.slug}/index.html`);

    const html = fs.readFileSync(slugFile, 'utf8');

    // Semantic checks
    assert.ok(html.includes('<article class="ccn-article-card">'), `Missing <article> tag in ${article.slug}`);
    assert.ok(html.includes(`<h1 id="article-headline">${article.title}</h1>`) || html.includes('id="article-headline"'), `Missing <h1> headline in ${article.slug}`);
    assert.ok(html.includes('id="article-lead"'), `Missing article lead in ${article.slug}`);
    assert.ok(html.includes(article.author.name), `Missing author name in ${article.slug}`);

    // Touch ergonomics check (min 44px)
    assert.ok(html.includes('min-height: 44px') || html.includes('min-height:44px'), `Missing 44px touch target in ${article.slug}`);

    // Social share links check
    assert.ok(html.includes('https://x.com/intent/tweet'), `Missing X share link in ${article.slug}`);
    assert.ok(html.includes('https://polskieradio.cc/tablica?share_url='), `Missing Lumina share link in ${article.slug}`);
    assert.ok(html.includes('https://api.whatsapp.com/send?text='), `Missing WhatsApp share link in ${article.slug}`);

    // Schema.org JSON-LD validity
    const jsonLdMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    assert.ok(jsonLdMatch, `Missing JSON-LD in ${article.slug}`);
    const parsed = JSON.parse(jsonLdMatch[1]);
    assert.ok(parsed['@graph'], `Invalid JSON-LD graph in ${article.slug}`);
    const newsArticle = parsed['@graph'].find(item => item['@type'] === 'NewsArticle');
    assert.ok(newsArticle, `Missing NewsArticle Schema in ${article.slug}`);
    assert.equal(newsArticle.headline, article.title);

    // Canonical link check
    assert.ok(html.includes(`<link rel="canonical" href="${article.primaryPortalUrl || `https://polskieradio.cc/news/${article.slug}`}" />`), `Missing canonical in ${article.slug}`);
  }
});

test('CCN SSG: sitemap.xml contains entries for all article slugs', () => {
  const articles = loadArticles();
  const sitemap = fs.readFileSync(SITEMAP_PATH, 'utf8');

  for (const article of articles) {
    const loc = article.primaryPortalUrl || `https://polskieradio.cc/news/${article.slug}`;
    assert.ok(sitemap.includes(`<loc>${loc}</loc>`), `Sitemap missing article: ${loc}`);
  }
});
