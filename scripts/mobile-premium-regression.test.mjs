import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const mobilePages = [
  'lumina.html',
  'lumina-tablica.html',
  'lumina-profile.html',
  'lumina.cezaryrgowski.html',
  'lumina.wiolettarogowska.html',
  'lumina.ccwomen.html',
  'lumina-shorts.html',
  'rolki.html',
];

test('every primary Lumina surface loads the shared mobile layer once', async () => {
  for (const file of mobilePages) {
    const html = await readFile(file, 'utf8');
    const links = html.match(/css\/lumina-mobile-premium\.css/g) || [];
    assert.equal(links.length, 1, `${file} must load the mobile layer exactly once`);
  }
});

test('mobile layer provides Android-safe layout and interaction safeguards', async () => {
  const css = await readFile('css/lumina-mobile-premium.css', 'utf8');
  assert.match(css, /--lumina-mobile-target:\s*44px/);
  assert.match(css, /env\(safe-area-inset-bottom\)/);
  assert.match(css, /content-visibility:\s*auto/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /max-width:\s*380px[\s\S]*\.btn-nav-more[\s\S]*display:\s*none/);
  assert.match(css, /\.shorts-header \.header-title-box[\s\S]*display:\s*none/);
});

test('feed progressively renders posts and preserves notification deep links', async () => {
  const html = await readFile('lumina-tablica.html', 'utf8');
  assert.match(html, /const FEED_PAGE_SIZE = 8/);
  assert.match(html, /window\.loadMoreFeedItems = function/);
  assert.match(html, /combined\.slice\(0, renderLimit\)/);
  assert.match(html, /urlParams\.get\('postId'\)/);
  assert.match(html, /renderLimit = Math\.max\(renderLimit, deepLinkIndex \+ 1\)/);
  assert.match(html, /class="feed-load-more-btn"/);
  assert.match(html, /aria-live="polite"/);
});

test('narrow-phone settings stay available when the compact action is hidden', async () => {
  for (const file of mobilePages.slice(0, 5)) {
    const html = await readFile(file, 'utf8');
    assert.match(html, /Ustawienia aplikacji/,
      `${file} must expose settings in the navigation drawer`);
  }
});
