import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

test('Biblijne Uwielbienie: 1. Główny plik HTML i routing w _worker.js', () => {
  const mainFile = path.join(ROOT, 'biblijne-uwielbienie.html');
  const workerFile = path.join(ROOT, '_worker.js');

  assert.ok(fs.existsSync(mainFile), 'biblijne-uwielbienie.html musi istnieć');
  assert.ok(fs.existsSync(workerFile), '_worker.js musi istnieć');

  const content = fs.readFileSync(mainFile, 'utf8');
  assert.ok(content.length > 5000, 'biblijne-uwielbienie.html musi zawierać pełną treść portalu');

  const workerContent = fs.readFileSync(workerFile, 'utf8');
  assert.ok(workerContent.includes('handleBiblijneUwielbienieRoute'), '_worker.js musi obsługiwać routing handleBiblijneUwielbienieRoute');
});

test('Biblijne Uwielbienie: 2. Metadane SEO, Canonical i Schema.org', () => {
  const content = fs.readFileSync(path.join(ROOT, 'biblijne-uwielbienie.html'), 'utf8');
  assert.ok(content.includes('rel="canonical" href="https://polskieradio.cc/BiblijneUwielbienie"'), 'Musi mieć kanoniczny URL');
  assert.ok(content.includes('"@type": "MusicPlaylist"'), 'Musi mieć Schema.org MusicPlaylist');
  assert.ok(content.includes('"numTracks": 38'), 'Musi deklarować 38 opublikowanych utworów');
  assert.ok(content.includes('og:title'), 'Musi zawierać OpenGraph title');
  assert.ok(content.includes('twitter:card'), 'Musi zawierać Twitter Card');
});

test('Biblijne Uwielbienie: 3. Zoptymalizowane grafiki portretowe i sceniczne', () => {
  const imgDir = path.join(ROOT, 'images', 'biblijne-uwielbienie');
  assert.ok(fs.existsSync(path.join(imgDir, 'host.webp')), 'host.webp musi istnieć');
  assert.ok(fs.existsSync(path.join(imgDir, 'artist-one.webp')), 'artist-one.webp musi istnieć');
  assert.ok(fs.existsSync(path.join(imgDir, 'artist-two.webp')), 'artist-two.webp musi istnieć');
  assert.ok(fs.existsSync(path.join(imgDir, 'player-thumb-cross.webp')), 'player-thumb-cross.webp musi istnieć');
  assert.ok(fs.existsSync(path.join(imgDir, 'player-mountain-bg.webp')), 'player-mountain-bg.webp musi istnieć');

  // Wymóg optymalizacji (rozmiar każdego portretu poniżej 200 KB)
  const hostSize = fs.statSync(path.join(imgDir, 'host.webp')).size;
  const a1Size = fs.statSync(path.join(imgDir, 'artist-one.webp')).size;
  const a2Size = fs.statSync(path.join(imgDir, 'artist-two.webp')).size;
  assert.ok(hostSize < 200 * 1024, `host.webp jest zbyt duży: ${hostSize} B`);
  assert.ok(a1Size < 200 * 1024, `artist-one.webp jest zbyt duży: ${a1Size} B`);
  assert.ok(a2Size < 200 * 1024, `artist-two.webp jest zbyt duży: ${a2Size} B`);
});

test('Biblijne Uwielbienie: 4. Oficjalna playlista YouTube i fallback', () => {
  const content = fs.readFileSync(path.join(ROOT, 'biblijne-uwielbienie.html'), 'utf8');
  assert.ok(content.includes('PLGBAOJCGyM6g'), 'Musi zawierać identyfikator oficjalnej playlisty YouTube PLGBAOJCGyM6g');
  assert.ok(content.includes('youtube-nocookie.com'), 'Musi używać bezpiecznej domeny youtube-nocookie.com');
  assert.ok(content.includes('https://www.youtube.com/playlist?list=PLGBAOJCGyM6g'), 'Musi zawierać widoczny fallback link do playlisty YouTube');
});

test('Biblijne Uwielbienie: 5. Integralność bazy danych playlisty', () => {
  const jsonPath = path.join(ROOT, 'data', 'biblijne-uwielbienie-playlist.json');
  assert.ok(fs.existsSync(jsonPath), 'data/biblijne-uwielbienie-playlist.json musi istnieć');
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  assert.equal(data.playlistId, 'PLGBAOJCGyM6g');
  assert.equal(data.items.length, 38);
  assert.equal(data.verifiedChaptersCount, 36);
  assert.equal(data.adaptationCount, 1);
  assert.equal(data.unverifiedChaptersCount, 1);

  // Weryfikacja obecności i metadanych GEN-001
  const gen001 = data.items.find(it => it.chapterId === 'GEN-001');
  assert.ok(gen001, 'GEN-001 musi istnieć w playliście');
  assert.equal(gen001.videoId, 'WN_y21vHW6g');
  assert.equal(gen001.completenessStatus, 'Do weryfikacji');
  assert.equal(gen001.bookName, 'Księga Rodzaju');
  assert.equal(gen001.bookCode, 'GEN');
  assert.equal(gen001.chapterNumber, 1);
  assert.equal(gen001.verseRange, 'Rodzaju 1:1–31');
  assert.equal(gen001.production, 'Christian Culture');

  // Weryfikacja formatu videoId (dokładnie 11 znaków)
  for (const item of data.items) {
    assert.match(item.videoId, /^[\w-]{11}$/, `Nieprawidłowy videoId: ${item.videoId}`);
    assert.ok(item.chapterId, `Brak chapterId dla ${item.title}`);
  }
});

test('Biblijne Uwielbienie: 6. Ochrona istniejących kanałów nadawczych', () => {
  const redirects = fs.readFileSync(path.join(ROOT, '_redirects'), 'utf8');
  assert.ok(redirects.includes('/biblia-spiewana /biblia-spiewana-live.html 200'), 'Trasa /biblia-spiewana nie może zostać zmieniona');
  assert.ok(redirects.includes('/BiblijneUwielbienie /biblijne-uwielbienie 200') || redirects.includes('/BiblijneUwielbienie /biblijne-uwielbienie.html 200'), 'Trasa /BiblijneUwielbienie musi być zarejestrowana');
});

test('Biblijne Uwielbienie: 7. Brak fikcyjnych statystyk i obietnic (Zero-QA)', () => {
  const content = fs.readFileSync(path.join(ROOT, 'biblijne-uwielbienie.html'), 'utf8');
  assert.ok(!content.includes('12 548 słuchaczy'), 'ZAKAZ fikcyjnych liczb odtworzeń');
  assert.ok(!content.includes('100% ukończone'), 'ZAKAZ fałszywych deklaracji ukończenia');
  assert.ok(content.includes('1 151') || content.includes('1151'), 'Musi rzetelnie wskazywać 1151 rozdziałów w przygotowaniu');
});

test('Biblijne Uwielbienie: 8. Moduł Patron Rozdziału (P1) w odtwarzaczu i bibliotece', () => {
  const content = fs.readFileSync(path.join(ROOT, 'biblijne-uwielbienie.html'), 'utf8');

  // Obecność modułu w obu kluczowych miejscach
  assert.ok(content.includes('id="player-patron-module"'), 'Musi zawierać moduł Patrona w odtwarzaczu');
  assert.ok(content.includes('id="drilldown-patron-module"'), 'Musi zawierać moduł Patrona w panelu rozdziałów biblioteki');

  // Obowiązkowe komunikaty
  assert.ok(content.includes('Zostań patronem tego rozdziału'), 'Musi zawierać nagłówek Patrona');
  assert.ok(content.includes('Udostępnij i wspieraj produkcję kolejnych rozdziałów Biblii Śpiewanej.'), 'Musi zawierać podtytuł Patrona');
  assert.ok(content.includes('Pomóż nam przemienić wszystkie 1189 rozdziałów Biblii w muzyczne świadectwo wiary'), 'Musi zawierać treść wstępu');

  // 5 kanałów udostępniania
  assert.ok(content.includes('shareChapterNativeCurrent'), 'Musi obsługiwać Web Share API');
  assert.ok(content.includes('shareChapterWhatsAppCurrent'), 'Musi obsługiwać WhatsApp');
  assert.ok(content.includes('shareChapterFacebookCurrent'), 'Musi obsługiwać Facebook');
  assert.ok(content.includes('copyChapterLinkCurrent'), 'Musi obsługiwać kopiowanie linku');
  assert.ok(content.includes('openQrModalCurrent'), 'Musi obsługiwać lokalny kod QR');

  // Metody wsparcia finansowego
  assert.ok(content.includes('https://zrzutka.pl/rs4g4v'), 'Musi zawierać zweryfikowany link Zrzutka.pl');
  assert.ok(content.includes('https://revolut.me/christianculture'), 'Musi zawierać zweryfikowany link Revolut.me');
  assert.ok(content.includes('https://polskieradio.cc/wspieraj'), 'Musi zawierać link do rejestru wszystkich metod CC');

  // Identyfikator tytułu wpłaty
  assert.ok(content.includes('Biblia Śpiewana / '), 'Musi formatować tytuł przelewu jako Biblia Śpiewana / [ID]');

  // Inwariant bezpieczeństwa i etyki: brak fałszywych deklaracji i weryfikacja
  assert.ok(content.includes('przyznawany jest wyłącznie po rzeczywistym zaksięgowaniu wpłaty i weryfikacji przez administratora'), 'Musi informować o weryfikacji');
  assert.ok(content.includes('całkowicie darmowy dla każdego człowieka') || content.includes('100% bezpłatny'), 'Musi gwarantować darmowy dostęp do Słowa Bożego');

  // Lokalny generator QR bez zewnętrznych płatnych usług
  assert.ok(content.includes('/js/vendor-qrcode.min.js'), 'Musi ładować lokalną bibliotekę QRCode.js');
  assert.ok(content.includes('id="qr-modal-overlay"'), 'Musi posiadać modal kodu QR');
});

test('Biblijne Uwielbienie: 9. API Patrona Rozdziału w _worker.js', () => {
  const workerContent = fs.readFileSync(path.join(ROOT, '_worker.js'), 'utf8');

  assert.ok(workerContent.includes('/api/biblijne-uwielbienie/patron/config'), 'Musi obsługiwać endpoint config');
  assert.ok(workerContent.includes('/api/biblijne-uwielbienie/patron/acknowledgments'), 'Musi obsługiwać endpoint acknowledgments');
  assert.ok(workerContent.includes('/api/biblijne-uwielbienie/patron/declare'), 'Musi obsługiwać endpoint declare (POST)');
});

