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
  assert.match(html, /class="profile-card video-card featured original-promo-card" id="promoAdCard3"/);
  assert.doesNotMatch(html, /\nid="promoAdCard3"/);
  assert.match(html, /const deltaY = Math\.abs\(touch\.clientY - _carouselPointerStartY\)/);
  assert.match(html, /const isGesture = _carouselGestureMoved \|\| deltaX > 8 \|\| deltaY > 8 \|\| scrollDelta > 8/);
  assert.match(html, /const isHorizontalSwipe = deltaX > 40 && deltaX > deltaY \* 1\.2/);
  assert.match(html, /carousel\.addEventListener\('wheel',[\s\S]*window\.scrollBy\(0, e\.deltaY\)[\s\S]*passive: false/);
  assert.match(html, /_suppressCarouselClickUntil = Date\.now\(\) \+ 500/);
  assert.match(html, /carousel\.addEventListener\('touchcancel'/);
  assert.match(html, /carousel\.addEventListener\('click',[\s\S]*\{ capture: true \}\)/);
});

test('registration starts cleanly and guest-only services stay quiet', async () => {
  const html = await readFile('lumina.html', 'utf8');
  const badges = await readFile('lumina-badges-engine.js', 'utf8');
  const typing = await readFile('lumina-chat-typing.js', 'utf8');

  assert.match(html, /Dołącz bezpłatnie – zacznij w minutę/);
  assert.match(html, /id="btnGoogleRegister"[\s\S]*Zacznij przez Google/);

  const stepTwoGuard = html.slice(
    html.indexOf('window.goToWizardStep = function(step)'),
    html.indexOf('window.handleObAvatarChange')
  );
  assert.doesNotMatch(stepTwoGuard, /obTermsAccepted/);
  assert.match(badges, /if \(hasAuthenticatedUser\(\)\)[\s\S]*checkInDailyActivity\(\)/);
  assert.match(typing, /!hasAuthenticatedUser\(\)/);
});

test('homepage keeps product features behind account creation', async () => {
  const html = await readFile('lumina.html', 'utf8');

  assert.match(html, /<body class="user-is-guest">/);
  assert.match(html, /id="luminaGuestConversionMode"/);
  assert.match(html, /body\.user-is-guest \.discovery-filters-wrap/);
  assert.match(html, /body\.user-is-guest #strefaMisyjna/);
  assert.match(html, /body\.user-is-guest #luminaBottomNav/);
  assert.match(html, /body\.user-is-guest #lumina-notification-center/);
  assert.match(html, /body\.user-is-guest \.card-heart/);
  assert.match(html, /id="guestCarouselCta"[\s\S]*Załóż profil/);
  assert.match(html, /window\.setLuminaAuthView = function\(isAuthenticated\)/);
  assert.match(html, /classList\.toggle\('user-is-authenticated', Boolean\(isAuthenticated\)\)/);
  assert.match(html, /classList\.toggle\('user-is-guest', !isAuthenticated\)/);
  assert.match(html, /window\.setLuminaAuthView\(Boolean\(user\)\)/);
});

test('carousel activity controls stay separated and post counts use published profile data', async () => {
  const html = await readFile('lumina.html', 'utf8');

  assert.match(html, /\.card-activity-badges\s*\{[\s\S]*?top:\s*60px;[\s\S]*?gap:\s*10px;/);
  assert.match(html, /@media \(max-width: 900px\)[\s\S]*?\.card-activity-badges\s*\{[\s\S]*?top:\s*68px;[\s\S]*?gap:\s*12px;/);
  assert.match(html, /window\.LuminaDB\.getAuthorPosts\(slug, name\)/);
  assert.match(html, /post\.published !== false/);
  assert.match(html, /window\.addEventListener\('lumina_post_published'/);
  assert.doesNotMatch(html, /cleanSlug\.includes\('pawel'\)[\s\S]*?count = 2/);
  assert.doesNotMatch(html, /Andrzej Hamera – 2 wpisy/);
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
  assert.match(profile, /lumina-db\.js\?v=20260915_hamera_steel_v420/);
  assert.match(profile, /avatar_andrzej_hamera\.jpg/);
  assert.match(db, /avatar_andrzej_hamera\.jpg/);
  assert.doesNotMatch(profile.slice(profile.indexOf("'andrzejhamera':"), profile.indexOf("'u_andrzejhamera':")), /Studio Reklamy|Poligraf/i);

  const luminaHtml = await readFile('lumina.html', 'utf8');
  assert.match(luminaHtml, /exactSystemSlugs[\s\S]*'andrzejhamera'/);
  assert.match(luminaHtml, /renderedNames[\s\S]*'andrzej hamera'/);
});

test('master admin HUD requires explicit PIN session and prevents duplicate bars', async () => {
  const profile = await readFile('lumina-profile.html', 'utf8');
  const adminSuite = await readFile('lumina-admin-profile-suite.js', 'utf8');
  assert.doesNotMatch(profile, /<div class="admin-master-hud" id="adminMasterHud">/);
  assert.doesNotMatch(profile, /if \(uSlug === 'cezaryrgowski'\) isMaster = true/);
  assert.match(adminSuite, /sessionStorage\.getItem\('lumina_auth_master_admin'\) === 'true'/);
});

test('registration requires explicit privacy consent and avoids fake verification', async () => {
  const html = await readFile('lumina.html', 'utf8');
  assert.match(html, /id="obTermsAccepted" required(?![^>]*checked)/);
  assert.match(html, /id="obSensitiveDataConsent" required(?![^>]*checked)/);
  assert.match(html, /if \(!document\.getElementById\('obSensitiveDataConsent'\)\?\.checked\)/);
  assert.match(html, /sensitiveDataConsent: true/);
  assert.match(html, /isVerified: false/);
  assert.doesNotMatch(html, /eec0ae2663b74fdb9fb9981e92f1b2cc/);
});

test('privacy policy reflects Lumina data processing and user rights', async () => {
  const policy = await readFile('privacy.html', 'utf8');
  assert.match(policy, /szczególne kategorie danych/);
  assert.match(policy, /art\. 9 ust\. 2 lit\. a RODO/);
  assert.match(policy, /Google\/Firebase/);
  assert.match(policy, /Prawo żądać dostępu|prawo żądać dostępu/i);
  assert.doesNotMatch(policy, /nie gromadzą ani nie przechowują żadnych danych osobowych/i);
  assert.doesNotMatch(policy, /googletagmanager/);
});

test('public copy avoids absolute safety claims and stale invite links', async () => {
  const home = await readFile('lumina.html', 'utf8');
  const feed = await readFile('lumina-tablica.html', 'utf8');
  assert.doesNotMatch(home, /Zero Fake \/ Zero Botów|Vision AI|lumina\.christianculture\.pl/);
  assert.doesNotMatch(feed, /100% bezpieczeństwa|Infolinia \+48 730/);
  assert.match(home, /https:\/\/polskieradio\.cc\/lumina/);
});
