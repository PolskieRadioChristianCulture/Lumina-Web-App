import fs from 'node:fs';
import path from 'node:path';
import { ARTICLES } from '../src/articles.js';

const d = 'dist';
fs.mkdirSync(path.join(d, 'assets'), { recursive: true });

// Copy all assets
if (fs.existsSync('assets')) {
  for (const f of fs.readdirSync('assets')) {
    const srcPath = path.join('assets', f);
    if (fs.statSync(srcPath).isFile()) {
      fs.copyFileSync(srcPath, path.join(d, 'assets', f));
    }
  }
}

const root = 'https://polskieradio.cc/Global/';

// Generate static prerendered HTML for all articles
for (const a of ARTICLES) {
  const folder = path.join(d, 'articles', a.slug);
  fs.mkdirSync(folder, { recursive: true });
  let html = fs.readFileSync(path.join(d, 'index.html'), 'utf8');
  
  html = html
    .replace(/<title>[^<]*<\/title>/, `<title>${a.title} | Christian Culture Global</title>`)
    .replace(/<meta name="description" content="[^"]*"\/>/, `<meta name="description" content="${a.excerpt}"/>`)
    .replace(/<link rel="canonical" href="[^"]*"\/>/, `<link rel="canonical" href="${root}articles/${a.slug}/"/>`)
    .replace('</head>', `<script type="application/ld+json">${JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: a.title,
      description: a.excerpt,
      datePublished: a.published || '2026-10-16',
      author: { '@type': 'Organization', name: 'Christian Culture' },
      publisher: { '@type': 'Organization', name: 'Christian Culture', url: 'https://polskieradio.cc' },
      mainEntityOfPage: `${root}articles/${a.slug}/`
    })}</script></head>`);

  const esc = s => String(s ?? '').replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  const prerender = `
    <main class="wrap article-detail">
      <div class="article-breadcrumb"><a class="link-back" href="/Global/#articles">← Christian Music &amp; Faith Magazine</a></div>
      <header class="article-header">
        <span class="pill-category">${esc(a.category)} · ${esc(a.published)}</span>
        <h1 class="article-h1">${esc(a.title)}</h1>
        <p class="article-lead">${esc(a.excerpt)}</p>
      </header>
      ${a.image ? `<div class="article-hero-wrap"><img class="article-hero-img" src="/Global/assets/${esc(a.image)}" alt="${esc(a.title)}"/></div>` : ''}
      <div class="article-body">
        ${a.body.map(p => `<p>${esc(p)}</p>`).join('')}
      </div>
      <footer class="article-footer">
        <a class="btn-outline" target="_blank" rel="noopener noreferrer" href="${esc(a.source)}">Explore on Website ↗</a>
        <a class="btn-gold" href="/Global/">← Back to Global</a>
      </footer>
    </main>
  `;

  html = html.replace('<div id="app"></div>', `<div id="app">${prerender}</div>`);
  fs.writeFileSync(path.join(folder, 'index.html'), html);
}

// Generate sitemap.xml
const urls = [root, ...ARTICLES.map(a => `${root}articles/${a.slug}/`)];
fs.writeFileSync(
  path.join(d, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `  <url><loc>${u}</loc></url>`).join('\n')}\n</urlset>\n`
);

// Copy root deployment meta files
for (const f of ['robots.txt', 'llms.txt', '_headers', '_redirects']) {
  if (fs.existsSync(path.join('assets', f))) {
    fs.copyFileSync(path.join('assets', f), path.join(d, f));
  }
}

console.log(`Postbuild: ${ARTICLES.length} SEO article pages, sitemap and static assets generated.`);
