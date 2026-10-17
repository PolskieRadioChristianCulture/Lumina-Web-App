import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import routes from '../data/ccn-article-routes.js';

const out = process.env.CCN_VERIFY_OUTPUT;
if (!out) throw new Error('Private CCN_VERIFY_OUTPUT folder is required');
const origin = 'https://polskieradio.cc';
const report = { observedAt: new Date().toISOString(), articles: [], additional: [] };
const canonical = html => html.match(/<link\b[^>]*rel="canonical"[^>]*href="([^"]+)"/)?.[1];
const article = html => html.match(/<article\b[\s\S]*?<\/article>/)?.[0] || '';
const text = html => html.replace(/<script\b[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
async function fetchPage(url, headers = {}) {
  const response = await fetch(url, { headers, signal: AbortSignal.timeout(25000) });
  return { response, html: await response.text() };
}
const queue = [...new Set(Object.values(routes).flatMap(section => Object.values(section)))];
queue.push('/news/cbdc-prawo-niedzielne-apokalipsa-13');
async function checkArticles() {
  while (queue.length) {
    const pathname = queue.shift();
    const { response, html } = await fetchPage(origin + pathname);
    const source = fs.readFileSync(path.join(process.cwd(), pathname, 'index.html'), 'utf8');
    assert.equal(response.status, 200, pathname);
    assert.match(response.headers.get('content-type'), /text\/html/);
    assert.equal(canonical(html), canonical(source), pathname + ' canonical');
    assert.equal(text(article(html)), text(article(source)), pathname + ' full raw article');
    assert.ok(text(article(html)).length > 400, pathname + ' empty article');
    assert.ok(!/<meta[^>]*name="robots"[^>]*content="[^"]*noindex/i.test(html));
    assert.ok(!/noindex/i.test(response.headers.get('x-robots-tag') || ''));
    report.articles.push({ url: origin + pathname, status: response.status, canonical: canonical(html), articleTextLength: text(article(html)).length });
    if (pathname.startsWith('/finanse/cbdc')) fs.writeFileSync(path.join(out, 'cbdc-production.html'), html);
  }
}
try {
  await Promise.all([checkArticles(), checkArticles(), checkArticles()]);
  for (const pathname of ['/apokalipsa', '/studium', '/kursy', '/BiblijneUwielbienie', '/kino', '/robots.txt', '/sitemap.xml', '/news/feed.xml', '/sitemaps/news.xml']) {
    const { response, html } = await fetchPage(origin + pathname);
    assert.equal(response.status, 200, pathname);
    report.additional.push({ pathname, status: response.status, bytes: html.length });
  }
  for (const pathname of ['/firestore.rules', '/scripts/build-search-index.mjs']) {
    const { response } = await fetchPage(origin + pathname);
    assert.equal(response.status, 404, pathname + ' must remain nonpublic');
    report.additional.push({ pathname, status: response.status });
  }
  for (const userAgent of ['Mozilla/5.0', 'Googlebot', 'bingbot']) {
    const { response, html } = await fetchPage(origin + '/finanse/cbdc-prawo-niedzielne-apokalipsa-13', { 'User-Agent': userAgent });
    assert.equal(response.status, 200, userAgent);
    assert.ok(text(article(html)).length > 10000, userAgent + ' article');
    report.additional.push({ userAgent, status: response.status, articleTextLength: text(article(html)).length });
  }
  for (const section of ['news', 'finanse', 'nauka', 'historia', 'prawo']) {
    const [id, target] = Object.entries(routes[section])[0];
    const response = await fetch(origin + '/' + section + '?art=' + encodeURIComponent(id), { redirect: 'manual', signal: AbortSignal.timeout(25000) });
    assert.equal(response.status, 301, section);
    assert.equal(decodeURI(response.headers.get('location')), origin + target);
    report.additional.push({ section, id, status: response.status, location: response.headers.get('location') });
  }
  report.result = 'PASS';
} finally {
  fs.writeFileSync(path.join(out, 'http-production.json'), JSON.stringify(report, null, 2));
}
console.log(JSON.stringify({ result: report.result, articles: report.articles.length, additional: report.additional.length }));
