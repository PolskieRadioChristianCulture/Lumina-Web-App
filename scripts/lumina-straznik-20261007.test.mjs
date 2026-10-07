// Regresje naprawione 2026-10-07 (Strażnik Standardów): miganie tablicy, podmiana tożsamości,
// zmyślone dane, fałszywe reakcje, kod „7777”, kreator profilu. Każdy test = realny błąd z produkcji.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';

const read = (f) => readFile(f, 'utf8');
const htmlFiles = async () => (await readdir('.')).filter((f) => /^lumina.*\.html$/.test(f) && !f.includes('backup'));

test('nagłówek gościa ma niezależne od JS wejście do tablicy i logowania', async () => {
  const html = await read('lumina.html');
  const start = html.indexOf('id="luminaGuestNav"');
  assert.ok(start > 0, 'Brak publicznej nawigacji w nagłówku');
  const guestNav = html.slice(start, html.indexOf('</div>', start));
  assert.match(guestNav, /href="\/tablica"/);
  assert.match(guestNav, /id="authCtaBtn" href="\/lumina-login"/);
  assert.match(guestNav, /aria-label="Zaloguj się do LUMINA"/);
  assert.equal((guestNav.match(/min-height:44px/g) || []).length, 2);
  assert.equal((html.match(/id="authCtaBtn"/g) || []).length, 1);
});

test('jedna instancja modułów lumina-db/lumina-core (różne ?v= = kilka kopii w przeglądarce)', async () => {
  const files = [...await htmlFiles(), 'lumina-core.js', 'lumina-tablica.js', 'lumina-security.js', 'js/cc-global-auth.js'];
  const versions = new Set();
  for (const f of files) {
    const src = await read(f);
    for (const m of src.matchAll(/['"](?:\.{0,2}\/)?lumina-(?:db|core)\.js(\?v=[^'"]*)?['"]/g)) versions.add(m[1] || '(bez wersji)');
  }
  assert.equal(versions.size, 1, `Znaleziono różne wersje: ${[...versions].join(', ')}`);
});

test('tablica nie tasuje się i nie przerysowuje przy każdej zmianie danych', async () => {
  const t = await read('lumina-tablica.html');
  assert.match(t, /window\.luminaApplyStableHtml\(container, __luminaFeedHtml\)/);
  assert.doesNotMatch(t, /const uid = 'fc' \+ Date\.now\(\)/);
  assert.match(t, /window\.__luminaFeedVisitSeed/);
  assert.match(t, /<script src="js\/lumina-stable-render\.js\?v=/);
});

test('karuzela „Poznajmy się bliżej” bez logotypów marek', async () => {
  const t = await read('lumina-tablica.html');
  const start = t.indexOf('(function initStaticProfilesCarousel()');
  const block = t.slice(start, t.indexOf('function run()', start));
  assert.doesNotMatch(block, /logo_(radio_cc|cctv|cc_women|cc_men|osobowosc_plus)/);
  assert.match(t, /window\.getLuminaCarouselPeople/);
});

test('polubienia i Amen zapisywane w bazie, bez fałszywego komunikatu', async () => {
  const t = await read('lumina-tablica.html');
  assert.match(t, /function toggleFeedLike\(btn\) \{ luminaReactOnPost\(btn, 'likes'/);
  assert.doesNotMatch(t, /Twoje AMEN zostało dodane/);
  const db = await read('lumina-db.js');
  assert.match(db, /export async function toggleLuminaPostReaction/);
  const rules = await read('firestore.rules');
  assert.match(rules, /match \/lumina_post_reactions\/\{reactionId\}/);
});

test('brak uniwersalnego kodu 7777 otwierającego panel właściciela', async () => {
  for (const f of ['lumina-profile.html', 'lumina.cezaryrgowski.html', 'lumina.wiolettarogowska.html']) {
    const src = await read(f);
    assert.doesNotMatch(src, /entered === '7777'/, f);
    assert.doesNotMatch(src, /params\.get\('access'\) === 'granted'/, f);
  }
});

test('nowy profil bez zmyślonych danych (miasto, liczniki, 100% dopasowania)', async () => {
  const db = await read('lumina-db.js');
  assert.doesNotMatch(db, /'Warszawa, Polska'/);
  assert.doesNotMatch(db, /matchScore: '100%'/);
  assert.match(db, /export function detectLuminaOfficialIdentity/);
  assert.doesNotMatch(db, /user\.email\.includes\('czarkes'\)/);
});

test('kreator profilu wymaga prawdziwego zdjęcia i jest podpięty', async () => {
  const w = await read('js/lumina-onboarding.js');
  assert.match(w, /completeOwnLuminaProfile/);
  assert.match(w, /capture="user"/);
  for (const f of ['lumina-tablica.html', 'lumina.html', 'lumina-profile.html']) {
    assert.match(await read(f), /js\/lumina-onboarding\.js\?v=/, f);
  }
});
