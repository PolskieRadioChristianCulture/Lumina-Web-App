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

test('gość nie jest pokazywany jako zalogowany Założyciel (nagłówek z kopii profilu w pamięci)', async () => {
  const a = await read('js/cc-global-auth.js');
  const fn = a.slice(a.indexOf('function getStoredUserData()'), a.indexOf('// 4. Uniwersalne Logowanie Google'));
  assert.doesNotMatch(fn, /lumina_profile_cezaryrgowski/);
  assert.doesNotMatch(fn, /nazirczarkes@gmail\.com/);
  assert.match(fn, /lumina_user_session'\) !== 'active'/);
});

const CHANNELS = ['zapolske-live.html', 'cctv24.html', 'cctv24-pl.html', 'cctv24-global.html', 'cctv24-worship-live.html', 'cctv24-worship.html', 'biblia-spiewana-live.html'];

test('kanały: bez zmyślonej pogody, dane z jednego zapytania Open-Meteo', async () => {
  for (const f of CHANNELS) {
    const src = await read(f);
    assert.doesNotMatch(src, /\d+°C \/ [A-ZŁ]/, f);
    assert.match(src, /latitude=\$\{lat\}&longitude=\$\{lon\}/, f);
  }
});

test('kanały: Mission Control czytany z projektu cc-mission-control', async () => {
  for (const f of CHANNELS) {
    const src = await read(f);
    assert.doesNotMatch(src, /doc\(db, "mission_control_live"/, f);
    assert.match(src, /cc-live-mission-feed\.js/, f);
  }
  assert.match(await read('js/cc-live-mission-feed.js'), /projectId: 'cc-mission-control'/);
});

test('kanały: intencje modlitwy tylko zatwierdzone (zgodne z regułami bazy)', async () => {
  for (const f of CHANNELS) {
    const src = await read(f);
    for (const m of src.matchAll(/collection\(db, "prayer_intentions"\)[^;]*/g)) assert.match(m[0], /where\("approved", "==", true\)/, f);
  }
});

test('pasek wiadomości: świeże nagłówki z serwera, nie plik sprzed tygodni', async () => {
  assert.match(await read('_worker.js'), /url\.pathname === '\/news\.json'/);
  assert.equal((await read('news.json')).trim(), '[]');
});

test('Za Polską: inicjalizacja kanału nie przerywa się na brakującej liście dni, RDS nie jest nadpisywany', async () => {
  const z = await read('zapolske-live.html');
  assert.match(z, /if \(daySelect\) daySelect\.innerHTML = "";/);
  assert.match(z, /if \(daySelect\) daySelect\.value = currentDayIndex;/);
  const i = z.indexOf('fetch("rozwazania_baza.json');
  assert.doesNotMatch(z.slice(i, i + 6000), /data\.tickerMessage/);
});

test('kanały: komunikat Mission Control trafia na pasek od razu (loadNewsMarquee dostępne globalnie)', async () => {
  for (const f of ['zapolske-live.html', 'cctv24.html', 'cctv24-pl.html', 'cctv24-global.html', 'cctv24-worship-live.html', 'cctv24-worship.html', 'biblia-spiewana-live.html']) {
    assert.match(await read(f), /window\.loadNewsMarquee = loadNewsMarquee/, f);
  }
});
