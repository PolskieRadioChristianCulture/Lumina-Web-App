import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

const kursyHtmlPath = path.join(rootDir, 'kursy.html');
const engineJsPath = path.join(rootDir, 'js', 'lumina-courses-engine.js');
const redirectsPath = path.join(rootDir, '_redirects');
const coursesCssPath = path.join(rootDir, 'css', 'lumina-courses.css');
const lessonGeneratorPath = path.join(rootDir, 'scripts', 'generate_lesson_subpages.mjs');
const certificatePath = path.join(rootDir, 'certyfikat.html');

const kursyHtml = fs.readFileSync(kursyHtmlPath, 'utf8');
const engineJs = fs.readFileSync(engineJsPath, 'utf8');
const redirects = fs.readFileSync(redirectsPath, 'utf8');
const coursesCss = fs.readFileSync(coursesCssPath, 'utf8');
const lessonGenerator = fs.readFileSync(lessonGeneratorPath, 'utf8');
const certificateHtml = fs.readFileSync(certificatePath, 'utf8');

test('Paleta całej Akademii używa szampańskiego złota Christian Culture', () => {
  for (const [name, source] of [
    ['katalog', kursyHtml],
    ['lekcje', lessonGenerator],
    ['dyplom', certificateHtml],
    ['style', coursesCss]
  ]) {
    assert.match(source, /#c4a35a/i, `${name}: brak szampańskiego złota`);
    assert.doesNotMatch(source, /#(?:d4af37|f3e5ab|f6e09e|fcd34d|fbbf24|fce09b)\b/i,
      `${name}: zachowano jaskrawy odcień żółci`);
  }
  for (const source of [kursyHtml, lessonGenerator, certificateHtml]) {
    assert.match(source, /amber:\s*\{[\s\S]*?400:\s*'#C4A35A'/,
      'Klasy amber muszą używać zatwierdzonej palety');
    assert.match(source, /lumina_star_champagne_20260928\.png/,
      'Wszystkie powierzchnie mają używać przygaszonego logo');
  }
});

test('1. Routing /kursy oraz /akademia w Cloudflare Pages Clean URLs i _redirects', () => {
  assert.strictEqual(fs.existsSync(kursyHtmlPath), true, 'Plik kursy.html musi istnieć na dysku');
  assert.match(redirects, /\/akademia\s+\/kursy\s+200/, 'Alias /akademia /kursy 200 musi być obecny');
  assert.doesNotMatch(redirects, /\/kursy\s+\/kursy\.html\s+200/, 'Zakaz szkodliwej reguły zapętlającej 308 (/kursy -> /kursy.html)');
});

test('2. Nagłówek i SEO: poprawny title, description, canonical, h1', () => {
  assert.match(kursyHtml, /<title>LUMINA Bible Academy/i, 'Title musi zawierać LUMINA Bible Academy');
  assert.match(kursyHtml, /<link rel="canonical" href="https:\/\/polskieradio\.cc\/kursy" \/>/);
  assert.match(kursyHtml, /<meta name="description"/);
  assert.match(kursyHtml, /<h1[^>]*>[\s\S]*?LUMINA BIBLE ACADEMY[\s\S]*?<\/h1>/i, 'H1 musi zawierać nazwę Akademii');
  assert.match(kursyHtml, /28 kroków\. Jedna Biblia\. Droga z Jezusem\./, 'Główne hasło musi być obecne');
});

test('3. Struktura 5 Etapów i kontener siatki 28 kart', () => {
  assert.match(kursyHtml, /id="stages-nav"/, 'Kontener nawigacji etapów musi istnieć');
  assert.match(kursyHtml, /id="lessons-grid"/, 'Kontener siatki lekcji musi istnieć');
  assert.match(engineJs, /LUMINA_STAGES/, 'Silnik musi importować etapy ze wspólnego źródła');
  assert.match(engineJs, /LUMINA_COURSES_CORE_28/, 'Silnik musi importować 28 lekcji ze wspólnego źródła');
});

test('4. Course Engine pobiera dane ze wspólnego datasetu (brak duplikacji w HTML)', () => {
  // Sprawdź czy HTML nie zawiera na twardo wklejonych 28 lekcji
  const hardcodedCount = (kursyHtml.match(/Lekcja:\s*Pismo Święte/g) || []).length;
  assert.strictEqual(hardcodedCount, 0, 'HTML nie może duplikować treści lekcji na twardo — treść musi pochodzić z data/lumina-courses-data.js');
  assert.match(engineJs, /from '\.\.\/data\/lumina-courses-data\.js(?:\?[^']+)?'/, 'Silnik musi importować dane z data/lumina-courses-data.js');
});

test('5. Deep-link lekcji: obsługa query params (?lekcja=) oraz hash (#)', () => {
  assert.match(engineJs, /URLSearchParams/, 'Silnik musi obsługiwać parametry adresu URL');
  assert.match(engineJs, /urlParams\.get\('lekcja'\)/, 'Silnik musi czytać parametr lekcja');
  assert.match(engineJs, /window\.location\.hash/, 'Silnik musi obsługiwać hash routing');
  assert.match(engineJs, /window\.history\.pushState/, 'Silnik musi aktualizować adres URL przy otwarciu lekcji');
});

test('6. Działający TTS Integration Hook z kontrolkami i ochroną przed nakładaniem', () => {
  assert.match(engineJs, /speechSynthesis/, 'Silnik musi korzystać z Web Speech API');
  assert.match(engineJs, /SpeechSynthesisUtterance/, 'Silnik musi tworzyć instancję Utterance');
  assert.match(engineJs, /speakLesson/, 'Silnik musi implementować funkcję speakLesson');
  assert.match(engineJs, /pauseTTS/, 'Silnik musi implementować pauzę TTS');
  assert.match(engineJs, /stopTTS/, 'Silnik musi implementować zatrzymanie TTS');
  assert.match(engineJs, /this\.stopTTS\(\)/, 'Otwarcie lekcji lub start nowej mowy musi anulować poprzednią syntezę');
});

test('7. Integracja Share Engine i fallback do schowka', () => {
  assert.match(engineJs, /navigator\.share/, 'Silnik musi wspierać natywne Web Share API');
  assert.match(engineJs, /copyToClipboard/, 'Silnik musi posiadać fallback kopiowania do schowka');
  assert.match(engineJs, /\/kursy\?lekcja=/, 'Format udostępnianego linku musi być kanoniczny');
});

test('8. Reużycie globalnego Auth (brak drugiego niezależnego Google Sign-In)', () => {
  assert.match(kursyHtml, /src="\/js\/cc-global-auth\.js"/, 'kursy.html musi korzystać z uniwersalnego konektora cc-global-auth.js');
  assert.match(kursyHtml, /id="cc-auth-nav-container"/, 'TopBar musi posiadać kontener cc-auth-nav-container');
  // Brak własnej implementacji GoogleAuthProvider lub Firebase Auth w kursy.html
  assert.doesNotMatch(kursyHtml, /signInWithPopup/, 'kursy.html nie może dublować implementacji logowania');
});

test('9. Zasada Zero Atrap: jawne oznaczenia weryfikacji redakcyjnej i autentyczny Dziennik Drogi (Phase 4)', () => {
  assert.match(engineJs, /reader-discover-container/, 'Sekcja Odkryj musi posiadać interaktywny kontener');
  assert.match(engineJs, /editorial-badge/, 'Lekcje podlegające weryfikacji redakcyjnej muszą posiadać widoczną odznakę informacyjną');
  assert.match(engineJs, /reader-quiz-container/, 'Sekcja Quiz musi posiadać interaktywny kontener');
  assert.match(engineJs, /Mój Dziennik Drogi/, 'Dziennik Drogi musi być obecny');
  assert.match(engineJs, /journal-status-indicator/, 'Dziennik musi posiadać wskaźnik statusu zapisu chmurowego');
});

test('10. Dostępność i struktura responsywna (Accessibility & Mobile First)', () => {
  assert.match(kursyHtml, /role="dialog"/, 'Czytnik lekcji musi posiadać semantyczny atrybut role="dialog"');
  assert.match(kursyHtml, /aria-modal="true"/, 'Czytnik lekcji musi deklarować aria-modal="true"');
  assert.match(kursyHtml, /aria-labelledby="reader-title"/, 'Czytnik lekcji musi posiadać powiązanie aria-labelledby');
  assert.match(kursyHtml, /aria-label="Zamknij lekcję"/, 'Przycisk zamknięcia musi posiadać dostępną etykietę');
  assert.match(kursyHtml, /min-h-\[48px\]|min-h-\[44px\]|min-height:\s*44px/i, 'Główne cele dotykowe muszą mieć min 44px');
});
