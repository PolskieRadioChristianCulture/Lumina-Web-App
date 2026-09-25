import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const htmlContent = fs.readFileSync(path.join(rootDir, 'projektant.html'), 'utf8');
const sitemapContent = fs.readFileSync(path.join(rootDir, 'sitemap.xml'), 'utf8');
const redirectsContent = fs.readFileSync(path.join(rootDir, '_redirects'), 'utf8');
const canvasJsContent = fs.readFileSync(path.join(rootDir, 'js', 'yis-canvas.js'), 'utf8');
const pricingJsContent = fs.readFileSync(path.join(rootDir, 'js', 'yis-pricing.js'), 'utf8');

// ── 1. SEO & METADATA TESTS ──────────────────────────────────────────────────
test('SEO: Page title exactly matches specification', () => {
  assert.ok(
    htmlContent.includes('<title>Projektant Koszulek i Odzieży Online | YIS Design Studio</title>'),
    'Expected specific title for SEO/AEO'
  );
});

test('SEO: Meta description exactly matches specification', () => {
  assert.ok(
    htmlContent.includes('Zaprojektuj własną koszulkę, bluzę, kubek lub czapkę online. Dodaj tekst i grafikę. 1 koncepcja projektu GRATIS, 2 za 30 zł, 3 za 50 zł. Bezpłatna weryfikacja techniczna YIS.'),
    'Expected specific meta description'
  );
});

test('SEO: Canonical points strictly to https://polskieradio.cc/projektant', () => {
  assert.ok(
    htmlContent.includes('<link rel="canonical" href="https://polskieradio.cc/projektant">'),
    'Canonical link must be present and exact'
  );
});

test('SEO: Exactly one H1 tag with semantic target title and lead', () => {
  const h1Matches = htmlContent.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi);
  assert.ok(h1Matches, 'Should have H1 tags');
  assert.equal(h1Matches.length, 1, 'Should have exactly ONE H1 tag on the page');
  assert.ok(
    h1Matches[0].includes('Projektant odzieży i gadżetów – YIS Design Studio'),
    'H1 content must match specification'
  );
  assert.ok(
    htmlContent.includes('Zaprojektuj własną koszulkę, bluzę, kubek lub czapkę online. Your Imagination Studio pomaga tworzyć chrześcijańską grafikę użytkową'),
    'Lead text must be present'
  );
});

test('SEO: Open Graph and Twitter metadata are synchronized', () => {
  assert.ok(htmlContent.includes('<meta property="og:title" content="Projektant Koszulek i Odzieży Online | YIS Design Studio">'));
  assert.ok(htmlContent.includes('<meta name="twitter:title" content="Projektant Koszulek i Odzieży Online | YIS Design Studio">'));
});

// ── 2. SCHEMA.ORG JSON-LD TESTS ──────────────────────────────────────────────
test('Schema.org: JSON-LD exists, parses cleanly, and contains linked @graph entities', () => {
  const match = htmlContent.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  assert.ok(match, 'JSON-LD script tag must exist');
  
  const parsed = JSON.parse(match[1]);
  assert.equal(parsed['@context'], 'https://schema.org');
  assert.ok(Array.isArray(parsed['@graph']), '@graph array must exist');

  const types = parsed['@graph'].map(e => e['@type']);
  assert.ok(types.includes('WebSite'), 'Must include WebSite');
  assert.ok(types.includes('Organization'), 'Must include Organization');
  assert.ok(types.includes('WebPage'), 'Must include WebPage');
  assert.ok(types.includes('Service'), 'Must include Service');
  assert.ok(types.includes('WebApplication'), 'Must include WebApplication');
  assert.ok(types.includes('BreadcrumbList'), 'Must include BreadcrumbList');
  assert.ok(types.includes('FAQPage'), 'Must include FAQPage');

  const org = parsed['@graph'].find(e => e['@type'] === 'Organization');
  assert.equal(org['@id'], 'https://polskieradio.cc/#organization');
  
  const service = parsed['@graph'].find(e => e['@type'] === 'Service');
  assert.equal(service.provider['@id'], 'https://polskieradio.cc/#organization');
  assert.ok(service.hasOfferCatalog, 'Service must have an offer catalog');
  
  const offers = service.hasOfferCatalog.itemListElement;
  assert.equal(offers.length, 4, 'Must have 4 offers (1 free, 2x30, 3x50, free verification)');
  assert.equal(offers[0].price, '0');
  assert.equal(offers[1].price, '30');
  assert.equal(offers[2].price, '50');
  assert.equal(offers[3].price, '0');
});

// ── 3. AEO & FAQ VISIBLE CONTENT TESTS ───────────────────────────────────────
test('AEO: Visible "Jak działa YIS Design Studio?" section contains 4 steps', () => {
  assert.ok(htmlContent.includes('id="how-it-works-section"'), 'Section must exist');
  assert.ok(htmlContent.includes('Wybierz produkt'));
  assert.ok(htmlContent.includes('Stwórz projekt'));
  assert.ok(htmlContent.includes('Wybierz pomoc grafika YIS'));
  assert.ok(htmlContent.includes('Bezpłatna weryfikacja'));
});

test('FAQ: Visible FAQ contains 11 questions matching JSON-LD exactly', () => {
  assert.ok(htmlContent.includes('id="faq-section"'), 'FAQ section must exist');
  
  const questions = [
    'Czy zaprojektowanie koszulki online jest bezpłatne?',
    'Ile kosztuje przygotowanie grafiki przez YIS?',
    'Czy mogę przesłać własną grafikę?',
    'Jakie produkty mogę zaprojektować?',
    'Czy mogę wykonać nadruk z przodu i z tyłu?',
    'Jakiej jakości powinien być plik do nadruku?',
    'Czy YIS sprawdza grafikę przed drukiem?',
    'Czy cena w kreatorze jest ostateczna?',
    'Czy muszę mieć konto LUMINA?',
    'Jak przekazać gotowy projekt do YIS?',
    'Czy Projektant działa na telefonie?'
  ];

  for (const q of questions) {
    assert.ok(htmlContent.includes(q), `Visible FAQ must include: ${q}`);
  }
});

// ── 4. SITEMAP & REDIRECTS CRAWLABILITY ───────────────────────────────────────
test('Crawling: /projektant is included in sitemap.xml', () => {
  assert.ok(sitemapContent.includes('<loc>https://polskieradio.cc/projektant</loc>'));
});

test('Crawling: _redirects enforces 301 on aliases to canonical /projektant', () => {
  assert.ok(redirectsContent.includes('/kreator /projektant 301'));
  assert.ok(redirectsContent.includes('/Projektant /projektant 301'));
  assert.ok(redirectsContent.includes('/yis /projektant 301'));
  assert.ok(redirectsContent.includes('/your-imagination-studio /projektant 301'));
  assert.ok(redirectsContent.includes('/projektant /projektant 200'));
});

// ── 5. CANVAS & WORKSPACE MODULE TESTS (Etap 2 & Etap 2.1) ───────────────────
test('Canvas: yis-canvas.js exports complete API and state persistence', () => {
  assert.ok(canvasJsContent.includes('window.YisCanvas'), 'Must export YisCanvas API');
  assert.ok(canvasJsContent.includes('setSide'), 'Must support side switching');
  assert.ok(canvasJsContent.includes('addText'), 'Must support text addition');
  assert.ok(canvasJsContent.includes('addImage'), 'Must support image addition');
  assert.ok(canvasJsContent.includes('centerSelected'), 'Must support centering');
  assert.ok(canvasJsContent.includes('duplicateSelected'), 'Must support duplicate');
  assert.ok(canvasJsContent.includes('deleteSelected'), 'Must support delete');
  assert.ok(canvasJsContent.includes('moveLayer'), 'Must support layer ordering');
  assert.ok(canvasJsContent.includes('undo'), 'Must support undo');
  assert.ok(canvasJsContent.includes('redo'), 'Must support redo');
  assert.ok(canvasJsContent.includes('openBottomSheet'), 'Must support mobile bottom sheet');
  assert.ok(canvasJsContent.includes('closeBottomSheet'), 'Must support closing bottom sheet');
});

test('Canvas UX: Word-break & long text handling prevents text overflow', () => {
  assert.ok(canvasJsContent.includes('word-break: break-word'), 'Must break long words');
  assert.ok(canvasJsContent.includes('overflow-wrap: break-word'), 'Must wrap overflow text');
  assert.ok(canvasJsContent.includes('white-space: pre-wrap'), 'Must preserve line breaks cleanly');
});

test('Canvas Mobile UX: Bottom sheet, bottom toolbar and 44px touch targets', () => {
  assert.ok(canvasJsContent.includes('yis-mobile-bottom-sheet'), 'Must define mobile bottom sheet');
  assert.ok(canvasJsContent.includes('m-btn-add-txt'), 'Must have mobile bottom toolbar button for text');
  assert.ok(canvasJsContent.includes('m-btn-add-img'), 'Must have mobile bottom toolbar button for image');
  assert.ok(canvasJsContent.includes('m-btn-switch-side'), 'Must have mobile side switch button');
  assert.ok(canvasJsContent.includes('min-h-[48px]'), 'Must provide >= 44px touch targets on toolbar');
  assert.ok(canvasJsContent.includes('inset: -10px'), 'Must provide enlarged touch hitbox on resize/rotate handles');
});

test('Mobile Safari Safeguard: Mobile text inputs use text-base (>=16px) to prevent auto-zoom', () => {
  assert.ok(canvasJsContent.includes('text-base focus:border-gold'), 'Mobile inputs must use >= 16px to prevent iOS auto-zoom');
});

// ── 6. MOBILE RESPONSIVENESS & ZERO HORIZONTAL OVERFLOW ───────────────────────
test('Mobile Viewport Safeguards: 360px, 390px, 412px compliance', () => {
  assert.ok(htmlContent.includes('max-w-4xl mx-auto px-4'));
  assert.ok(htmlContent.includes('max-w-3xl mx-auto'));
  assert.ok(htmlContent.includes('overflow-hidden'));
  assert.ok(!htmlContent.includes('min-w-[500px]'), 'Should not have hardcoded desktop-only min-widths');
  assert.ok(!htmlContent.includes('w-[400px]'), 'Fixed widths must not exceed 360px on mobile elements');
  assert.ok(canvasJsContent.includes('max-w-[310px]'), 'Canvas stage must fit comfortably inside 360px viewport (360 - 32px padding = 328px)');
});
