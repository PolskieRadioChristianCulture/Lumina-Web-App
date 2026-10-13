// Regresje naprawione 2026-10-07 (Strażnik Standardów): miganie tablicy, podmiana tożsamości,
// zmyślone dane, fałszywe reakcje, kod „7777”, kreator profilu. Każdy test = realny błąd z produkcji.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';

test('karty odkrywania nie pokazują sztywnych procentów bez obliczenia', async () => {
  const html = await readFile('lumina.html', 'utf8');
  assert.doesNotMatch(html, /<div class="card-match"[^>]*>\d+%(?: MATCH)?<\/div>/);
  assert.doesNotMatch(html, /f\.matchScore\?\.stringValue \|\| '\d+%'/);
  assert.match(html, /window\.calculateProfileMatchScore\(p\)/);
  assert.match(html, /\$\{liveScore\}<\/div>/);
});

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

test('Ambient Sleep: start bez klikania w OBS i strażnik dźwięku', async () => {
  const a = await read('ambient-sleep-live.html');
  assert.match(a, /window\.obsstudio/);
  assert.match(a, /audioCtx\.resume\(\)\.catch/);
  assert.match(a, /ponawiam pobranie/);
});

test('DZJ pionowy: ponowne łączenie strumienia, aktualna ramówka, bez letnich haseł', async () => {
  const d = await read('dzj-vertical-live.html');
  assert.match(d, /brak danych > 20 s/);
  assert.doesNotMatch(d, /Boże Wakacje/);
  assert.doesNotMatch(d, /SMS dla Subskrybentów/);
  assert.doesNotMatch(d, /toISOString\(\)\.split\("T"\)/);
  assert.match(d, /cc-live-mission-feed\.js/);
});

test('Master: ramówka odświeża się co dzień, zawieszone przejście i pusty kanał są naprawiane', async () => {
  const m = await read('master-live.html');
  assert.match(m, /earlyFinishedSlots = \{\}; \}/);
  assert.match(m, /przejście zawisło/);
  assert.match(m, /kanał nie odpowiada/);
});

test('Shorts Live: bez symulowanego licznika słuchaczy', async () => {
  for (const f of ['stream-scene-vertical.html', 'stream-scene.html']) {
  const v = await read(f);
  assert.doesNotMatch(v, /let audience = \d+/);
  assert.doesNotMatch(v, /osób słuchających teraz/);
  }
});

test('licznik /milion: jedna akcja danego rodzaju na osobę dziennie', async () => {
  const w = await read('_worker.js');
  assert.match(w, /INSERT OR IGNORE INTO milion_seen/);
  assert.match(await read('milion.html'), /body: JSON\.stringify\(\{ type:/);
});

test('brak odwołań do nieistniejących grafik na tablicy i w Rolkach', async () => {
  for (const f of ['lumina-tablica.html', 'rolki.html', 'data/shorts/shorts_feed.json', 'lumina-db.js']) {
    const s = await read(f);
    assert.doesNotMatch(s, /randki_malzenstwo_plakat_hq|tlo_cctv\.jpg|logo_christian_culture_small|[^_\w]avatar_wioletta\.jpg/, f);
  }
});

test('tablica: miejsce na mobilny pasek logowania rezerwowane od początku (bez skoku układu)', async () => {
  assert.match(await read('lumina-tablica.html'), /html:not\(\.cc-authed\) nav\.lumina-nav\{margin-bottom:42px\}/);
});

test('widget: nagłówek mieści się na telefonie', async () => {
  assert.match(await read('widget.html'), /header a\[download\] span \{ display: none; \}/);
});

test('karuzela „Poznajmy się bliżej”: wszyscy członkowie, zdjęcie użytkownika, logo LUMINA w ostateczności', async () => {
  const db = await readFile('lumina-db.js', 'utf8');
  const fn = db.slice(db.indexOf('export function getCommunityCarouselProfiles'), db.indexOf('export async function completeOwnLuminaProfile'));
  assert.doesNotMatch(fn, /hasRealPhoto/);
  assert.match(fn, /LUMINA_CAROUSEL_FALLBACK_AVATAR/);
  assert.match(fn, /isLuminaRealPersonPhoto\(p\.avatar, slug\)/);
  const people = await readFile('js/lumina-community-people.js', 'utf8');
  assert.match(people, /window\.luminaCarouselAvatarFallback/);
  assert.doesNotMatch(people, /MIN_CARDS/);
  for (const f of ['lumina-tablica.html', 'lumina-tablica-light.html']) {
    const t = await readFile(f, 'utf8');
    assert.doesNotMatch(t, /profile-carousel-card'\)\.style\.display='none'/, `${f}: karta znika zamiast pokazać logo`);
    assert.match(t, /luminaCarouselAvatarFallback/);
    assert.match(t, /js\/lumina-community-people\.js\?v=20261011_all_members1/);
  }
  const img = await readFile('images/lumina-avatar-zastepczy.jpg');
  assert.ok(img.length > 1000 && img.length < 60000);
});

test('jeden przycisk „do góry” i karta transmisji bez powtórzeń', async () => {
  const top = await readFile('js/cc-back-to-top.js', 'utf8');
  assert.match(top, /#luminaScrollTop\{display:none!important\}/);
  const css = await readFile('css/lumina-profile-standard.css', 'utf8');
  for (const t of [css, await readFile('lumina-tablica.html', 'utf8')]) {
    assert.match(t, /\.mission-live-broadcast-card \.post-header \.post-time \{ display: none !important; \}/);
    assert.match(t, /\.btn-expand-live\) > span \{ display: none !important; \}/);
  }
});

test('odznaki się zdobywa: brak kompletu na start, bez dopisku „3D”', async () => {
  const db = await readFile('lumina-db.js', 'utf8');
  const fn = db.slice(db.indexOf('export function getUserBadges'), db.indexOf('export function render3DBadgesGridHtml'));
  assert.doesNotMatch(fn, /Standardowe odznaki dla aktywnych członków/);
  assert.doesNotMatch(fn, /LUMINA_BADGES_CATALOG\['prayer_flame'\]/);
  assert.match(fn, /prof\.badges/);
  const render = db.slice(db.indexOf('export function render3DBadgesGridHtml'), db.indexOf('export function ensure3DBadgeModalInDom'));
  assert.match(render, /is-locked/);
  assert.match(render, /Do zdobycia/);
  assert.doesNotMatch(render, /Odznaki 3D/);
  for (const f of ['lumina.cezaryrgowski.html', 'lumina.wiolettarogowska.html', 'lumina-profile.html']) {
    assert.doesNotMatch(await readFile(f, 'utf8'), /<span class="tab-text">Odznaki 3D<\/span>/, f);
  }
});

test('profile bez „????” w miejscu emoji i polskich liter; jeden dok skrótów zamiast trzech pływających przycisków', async () => {
  for (const f of ['lumina.mariusz.html', 'lumina.magdalena.html']) {
    const t = await readFile(f, 'utf8');
    assert.doesNotMatch(t, /[A-Za-z!.] \?{2,}/, `${f}: zostały znaki „??”`);
  }
  const mag = await readFile('lumina.magdalena.html', 'utf8');
  assert.match(mag, /Szczęść Boże wszystkim!/);
  assert.doesNotMatch(mag, /spo\?eczno/);
  const top = await readFile('js/cc-back-to-top.js', 'utf8');
  assert.match(top, /function mountFabDock\(\)/);
  assert.match(top, /cc-fab-dock-on:not\(\.cc-fab-dock-open\)/);
  const css = await readFile('css/lumina-profile-standard.css', 'utf8');
  assert.match(css, /\.hero-bio-quote \{ color: #44403c !important; \}/);
});

test('bez paska „Status Ochrony” i bez kodów PIN; zachęta do zdjęcia profilowego', async () => {
  for (const f of ['lumina-profile.html', 'lumina.wiolettarogowska.html', 'lumina.magdalena.html', 'lumina.cezaryrgowski.html']) {
    const t = await readFile(f, 'utf8');
    assert.doesNotMatch(t, /id="profileSecurityBar"/, f);
    assert.doesNotMatch(t, /[Dd]omyślny:? 7777/, f);
  }
  assert.doesNotMatch(await readFile('lumina.magdalena.html', 'utf8'), /pin === '0455'/);
  const nudge = await readFile('js/lumina-photo-nudge.js', 'utf8');
  assert.match(nudge, /getLuminaProfileCompletion\(profile\)\.missing\.indexOf\('photo'\)/);
  assert.match(nudge, /openLuminaProfileWizard/);
  for (const f of ['lumina.html', 'lumina-tablica.html', 'lumina-profile.html']) {
    assert.match(await readFile(f, 'utf8'), /\/js\/lumina-photo-nudge\.js\?v=/, f);
  }
});

test('każde włączenie Radia CC w ekosystemie zasila licznik /milion', async () => {
  const top = await readFile('js/cc-back-to-top.js', 'utf8');
  assert.match(top, /\/js\/cc-radio-milion\.js\?v=/);
  const radio = await readFile('js/cc-radio-milion.js', 'utf8');
  assert.match(radio, /zeno\\\.fm/);
  assert.match(radio, /addEventListener\('play'[^]*?, true\)/);
  assert.match(radio, /type: 'radio'/);
  assert.match(radio, /\/api\/milion\/count/);
});

test('widgety i odtwarzacze osadzone także zasilają licznik /milion', async () => {
  for (const f of ['embed/bar.html', 'embed/player.html', 'radio_christian_culture_widget.html']) {
    assert.match(await readFile(f, 'utf8'), /https:\/\/polskieradio\.cc\/js\/cc-radio-milion\.js\?v=/, f);
  }
  for (const f of ['widget.html', 'widget/index.html']) {
    assert.match(await readFile(f, 'utf8'), /cc-radio-milion\.js\?v=[^"]*" defer><\\\/script>`;/, f);
  }
  const radio = await readFile('js/cc-radio-milion.js', 'utf8');
  assert.match(radio, /https:\/\/polskieradio\.cc\/api\/milion\/count/);
  assert.match(radio, /type: 'text\/plain'/);
});

test('powitanie członka na /lumina nie chowa się pod tłem nagłówka (brak pustej przestrzeni)', async () => {
  const t = await readFile('lumina.html', 'utf8');
  assert.match(t, /#luminaMemberWelcome\.lumina-member-welcome \{ position: relative; z-index: 6;/);
});

test('profil nie zawiesza się po kliknięciu, wsparcie na górnej belce, czytelny jasny motyw tablicy', async () => {
  for (const f of ['lumina.cezaryrgowski.html', 'lumina.wiolettarogowska.html', 'lumina-profile.html']) {
    const t = await readFile(f, 'utf8');
    assert.match(t, /if \(stream\.__ccFeedHtml === __ccFeedHtml\) return;/, f);
    assert.doesNotMatch(t, /stream\.innerHTML = posts\.map\(/, f);
  }
  const css = await readFile('css/lumina-profile-standard.css', 'utf8');
  assert.doesNotMatch(css, /data-lumina-theme="light"\][^\n]*\[style\*=/);
  for (const f of ['lumina.html', 'lumina-tablica.html', 'lumina-tablica-light.html']) {
    const t = await readFile(f, 'utf8');
    assert.match(t, /id="lumina-light-fixes-20261011"/, f);
    assert.match(t, /S\.openModal\(\)/, f);
  }
  const top = await readFile('js/cc-back-to-top.js', 'utf8');
  assert.match(top, /--cc-dock-r', 'max\(16px, env\(safe-area-inset-right\)\)'/);
});

test('strona główna członka według makiety: skróty, Polecane, Ostatnie posty; goście bez zmian', async () => {
  const t = await readFile('lumina.html', 'utf8');
  assert.match(t, /\/js\/lumina-member-home\.js\?v=/);
  assert.match(t, /js\/lumina-community-people\.js\?v=/);
  const home = await readFile('js/lumina-member-home.js', 'utf8');
  for (const s of ['Społeczność', 'Modlitwa', 'Małżeństwo', 'Świadectwa', 'Polecane', 'Ostatnie posty']) assert.ok(home.includes(s), s);
  assert.match(home, /if \(!member\(\)\)/);
  assert.match(home, /lumina-avatar-zastepczy/);
  // callback z pamięci podręcznej jest synchroniczny — znacznik musi być ustawiony przed subskrypcją (inaczej pętla)
  assert.match(home, /feedUnsub = function \(\) \{\};\s*var unsub = window\.LuminaDB\.subscribeToFeedPosts/);
  assert.doesNotMatch(home, /subscribeToFeedPosts\(function \(posts\) \{\s*lastPosts = posts;\s*render\(\);/);
  assert.match(t, /id="heroGuestCta"/);
});

test('dolny pasek: podpisy pod ikonami i środkowy „+” do napisania posta; dok pływający bez drugiego „+”', async () => {
  const nav = await readFile('lumina-bottom-nav.js', 'utf8');
  assert.match(nav, /id="navTabCompose" aria-label="Napisz post"/);
  for (const l of ['Start', 'Tablica', 'Rolki', 'Menu']) assert.match(nav, new RegExp(`<span class="lumina-nav-label">${l}</span>`));
  for (const f of await htmlFiles()) {
    const t = await readFile(f, 'utf8');
    if (t.includes('lumina-bottom-nav.js?v=')) assert.match(t, /lumina-bottom-nav\.js\?v=20261011_nav_mockup1/, f);
  }
  for (const f of ['lumina-tablica.html', 'lumina-tablica-light.html']) assert.match(await readFile(f, 'utf8'), /id="lumina-compose-param"/, f);
  const top = await readFile('js/cc-back-to-top.js', 'utf8');
  assert.doesNotMatch(top, /M12 5v14M5 12h14/);
});

test('CCN Ogłoszenia: tylko prawdziwe ogłoszenia Christian Culture, bez fikcyjnych osób i telefonów', async () => {
  for (const f of ['ogloszenia/index.html', 'ogloszenia.html']) {
    const t = await readFile(f, 'utf8');
    assert.match(t, /<script src="\/js\/cc-ogloszenia-data\.js\?v=[^"]+"><\/script>\s*<script type="module" src="\/js\/cc-ogloszenia-store\.js\?v=[^"]+"><\/script>\s*<script type="module" crossorigin src="\/assets\/ogloszenia-index-cc20261013[b-e]\.js">/, f);
  }
  const bundle = await readFile('assets/ogloszenia-index-cc20261013e.js', 'utf8');
  // Formularz publikuje do wspólnej bazy (widzą wszyscy), nie tylko do localStorage autora.
  assert.match(bundle, /window\.CCOgloszeniaStore;if\(!S\|\|typeof S\.publish!==`function`\)/);
  assert.doesNotMatch(bundle, /w=e=>\{t\(t=>\{let n=\[e,\.\.\.t\];try\{localStorage\.setItem/);
  const store = await readFile('js/cc-ogloszenia-store.js', 'utf8');
  assert.match(store, /const COLLECTION = 'user_posts';/);
  assert.match(store, /authorUid: user\.uid/);
  assert.match(store, /u\.protocol === 'https:'/);
  assert.match(bundle, /Ke=\(Array\.isArray\(window\.CC_OGLOSZENIA\)\?window\.CC_OGLOSZENIA:\[\]\)/);
  for (const fake of ['Wiśniewscy', 'Złota Rączka CC', 'Skoda Octavia', 'images.unsplash.com', 'Setki braci']) assert.ok(!bundle.includes(fake), fake);
  const data = await readFile('js/cc-ogloszenia-data.js', 'utf8');
  assert.match(data, /Infolinia Nadzieja/);
  assert.match(data, /\/ksiazki-autora|\/pokonac-goliata/);
  const w = await readFile('_worker.js', 'utf8');
  assert.match(w, /kalendarz-\?20\(26\|27\|28\|29\|30\)/);
});
