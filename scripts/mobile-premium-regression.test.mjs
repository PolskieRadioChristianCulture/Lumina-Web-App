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
    const links = html.match(/css\/lumina-mobile-premium\.css(?:\?[^"'>\s]+)?/g) || [];
    assert.equal(links.length, 1, `${file} must load the mobile layer exactly once`);
  }
});

test('mobile layer provides Android-safe layout and interaction safeguards', async () => {
  const css = await readFile('css/lumina-mobile-premium.css', 'utf8');
  assert.match(css, /--lumina-mobile-target:\s*44px/);
  assert.match(css, /env\(safe-area-inset-bottom\)/);
  assert.doesNotMatch(css, /content-visibility:\s*auto/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /\.shorts-scroll-container \.slide-info-box[\s\S]*bottom:\s*calc\(64px \+ env\(safe-area-inset-bottom\)\)/);
  assert.match(css, /#profilesCarousel[\s\S]*overflow-y:\s*hidden/);
  assert.match(css, /touch-action:\s*pan-y pinch-zoom/);
  assert.match(css, /#profilesCarousel \.profile-card\.active-center-card[\s\S]*transform:\s*none/);
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

test('homepage carousel distinguishes vertical scrolling from a profile tap', async () => {
  const html = await readFile('lumina.html', 'utf8');
  assert.match(html, /const deltaY = Math\.abs\(touch\.clientY - _carouselPointerStartY\)/);
  assert.match(html, /const isGesture = _carouselGestureMoved \|\| deltaX > 8 \|\| deltaY > 8 \|\| scrollDelta > 8/);
  assert.match(html, /const isHorizontalSwipe = deltaX > 40 && deltaX > deltaY \* 1\.2/);
  assert.match(html, /carousel\.addEventListener\('wheel',[\s\S]*window\.scrollBy\(0, e\.deltaY\)[\s\S]*passive: false/);
  assert.match(html, /_suppressCarouselClickUntil = Date\.now\(\) \+ 500/);
  assert.match(html, /carousel\.addEventListener\('touchcancel'/);
  assert.match(html, /carousel\.addEventListener\('click',[\s\S]*\{ capture: true \}\)/);
});

test('Hamera profile uses the kitchen-furniture identity and excludes Thiel posts', async () => {
  const profile = await readFile('lumina-profile.html', 'utf8');
  const profilesDb = await readFile('js/lumina-db-profiles.js', 'utf8');
  const db = await readFile('lumina-db.js', 'utf8');
  assert.match(profile, /Studio Mebli Kuchennych na Wymiar/);
  assert.match(profilesDb, /Studio Mebli Kuchennych na Wymiar/);
  assert.match(db, /isHameraProfile[\s\S]*isThielPost[\s\S]*if \(isHameraProfile && isThielPost\) return/);
  assert.match(db, /searchablePostText[\s\S]*p\.title[\s\S]*p\.text/);
  assert.match(db, /post_ah_film_hf3h8guGxkc[\s\S]*Hf3h8guGxkc/);
  assert.match(db, /s\.includes\('hamera'\)[\s\S]*return null/);
  assert.match(profile, /post_ah_film_hf3h8guGxkc[\s\S]*Hf3h8guGxkc/);
  assert.match(profilesDb, /post_ah_film_hf3h8guGxkc[\s\S]*Hf3h8guGxkc/);
  assert.doesNotMatch(profile.slice(profile.indexOf("'andrzejhamera':"), profile.indexOf("'u_andrzejhamera':")), /Studio Reklamy|Poligraf/i);
});
