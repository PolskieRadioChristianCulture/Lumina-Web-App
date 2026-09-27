/**
 * ══════════════════════════════════════════════════════════════════════════
 * LUMINA BIBLE ACADEMY — CERTIFICATE REGRESSION & ACCEPTANCE TEST SUITE
 * Plik: scripts/courses-certificate-regression.test.mjs
 * 
 * Kompleksowa weryfikacja 20 kryteriów wdrożenia Imiennego Dyplomu
 * Ukończenia LUMINA Bible Academy wg Master Visual Reference.
 * ══════════════════════════════════════════════════════════════════════════
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  checkEligibility,
  formatPolishDate,
  generateCertificateId,
  calculateFitText,
  luminaCertificateEngine
} from '../js/lumina-certificate-engine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

console.log('══════════════════════════════════════════════════════════════════════════');
console.log(' LUMINA BIBLE ACADEMY — DYPLOM IMIENNY: TESTY AKCEPTACYJNE & REGRESYJNE  ');
console.log('══════════════════════════════════════════════════════════════════════════\n');

let passCount = 0;
let failCount = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    passCount++;
    console.log(`[PASS] ${testName}`);
    if (details) console.log(`       ✓ ${details}`);
  } else {
    failCount++;
    console.error(`[FAIL] ${testName}`);
    if (details) console.error(`       ✗ ${details}`);
  }
}

// ── 1. Weryfikacja Uprawnień (Eligibility Engine) ──
console.log('--- GRUPA 1: SILNIK KWALIFIKACJI (checkEligibility) ---');

const full28Progress = new Map();
for (let i = 1; i <= 28; i++) {
  full28Progress.set(i, { status: 'completed' });
}
const resFull = checkEligibility(full28Progress);
assert(resFull.eligible === true && resFull.completedCount === 28 && resFull.stagesCompleted === 5,
  '1. Komplet 28 lekcji i 5 etapów daje pełne uprawnienie do dyplomu',
  `Lekcje: ${resFull.completedCount}/28, Etapy: ${resFull.stagesCompleted}/5`);

const partial27Progress = new Map(full28Progress);
partial27Progress.delete(28);
const res27 = checkEligibility(partial27Progress);
assert(res27.eligible === false && res27.completedCount === 27 && res27.remainingLessons.includes(28),
  '2. Brak 28. lekcji blokuje wystawienie dyplomu',
  `Brakujące lekcje: ${res27.remainingLessons.join(', ')}`);

const emptyProgress = new Map();
const resEmpty = checkEligibility(emptyProgress);
assert(resEmpty.eligible === false && resEmpty.completedCount === 0,
  '3. Pusty postęp poprawnie odrzuca wniosek o dyplom');

// ── 2. Formatowanie Daty Polskiej ──
console.log('\n--- GRUPA 2: POLSKA KALIGRAFIA DATY (formatPolishDate) ---');

const testDate1 = new Date(2026, 8, 27); // 27 września 2026
const formatted1 = formatPolishDate(testDate1);
assert(formatted1 === '27 września 2026',
  '4. Poprawne formatowanie daty we wrześniu (odmiana gramatyczna)',
  `Otrzymano: "${formatted1}"`);

const testDate2 = new Date(2026, 0, 15); // 15 stycznia 2026
const formatted2 = formatPolishDate(testDate2);
assert(formatted2 === '15 stycznia 2026',
  '5. Poprawne formatowanie daty w styczniu',
  `Otrzymano: "${formatted2}"`);

// ── 3. Generowanie Numeru Certyfikatu ──
console.log('\n--- GRUPA 3: KANONICZNY IDENTYFIKATOR CERTYFIKATU (generateCertificateId) ---');

const certId = generateCertificateId('test_user_uid_123', new Date(2026, 8, 27));
const certIdPattern = /^LBA-2026-[A-F0-9]{6}$/;
assert(certIdPattern.test(certId),
  '6. Format numeru certyfikatu jest kanoniczny (LBA-YYYY-XXXXXX)',
  `Wygenerowany ID: ${certId}`);

const certId2 = generateCertificateId('another_uid_456', new Date(2026, 8, 27));
assert(certId !== certId2,
  '7. Identyfikatory są unikalne dla różnych użytkowników',
  `ID1: ${certId} !== ID2: ${certId2}`);

// ── 4. Algorytm Single-Line fitText (Brak ucinania, diakrytyki) ──
console.log('\n--- GRUPA 4: ADAPTACYJNA KALIGRAFIA IMION (calculateFitText) ---');

// Mock measure function: 1 char ~= 0.55 * fontSize
const mockMeasure = (txt, size) => txt.length * (size * 0.55);

const normalName = 'CEZARY ROGOWSKI';
const fitNormal = calculateFitText(mockMeasure, normalName, 780, 42, 20);
assert(fitNormal.fontSize === 42,
  '8. Standardowe imię i nazwisko mieści się w bazowym rozmiarze 42px',
  `Rozmiar: ${fitNormal.fontSize}px, Szerokość: ${Math.round(fitNormal.textWidth)}px <= 780px`);

const longName = 'MARIA MAGDALENA KOWALSKA-NOWAKOWSKA DE DOMO CZARTORYSKA';
const fitLong = calculateFitText(mockMeasure, longName, 780, 42, 20);
assert(fitLong.fontSize < 42 && fitLong.fontSize >= 20 && fitLong.textWidth <= 780,
  '9. Bardzo długie personalia są płynnie skalowane w jednej linii bez obcinania',
  `Skalowany rozmiar: ${fitLong.fontSize}px, Szerokość: ${Math.round(fitLong.textWidth)}px <= 780px`);

const polishDiacritics = 'BŁAŻEJ ŻÓŁĆ-ŚWIĘCKI';
const fitDiacritics = calculateFitText(mockMeasure, polishDiacritics, 780, 42, 20);
assert(fitDiacritics.text === polishDiacritics,
  '10. Polskie znaki diakrytyczne (Ą, Ć, Ę, Ł, Ń, Ó, Ś, Ź, Ż) są w 100% zachowane');

// ── 5. Wzorzec Graficzny Master Reference (2000x1414) ──
console.log('\n--- GRUPA 5: WZORZEC TŁA MASTER REFERENCE ---');

const masterBgPath = path.join(rootDir, 'images', 'academy', 'diploma_background_master.png');
const bgExists = fs.existsSync(masterBgPath);
assert(bgExists,
  '11. Plik tła wzorcowego diploma_background_master.png istnieje w images/academy/');

if (bgExists) {
  const stats = fs.statSync(masterBgPath);
  assert(stats.size > 500000,
    '12. Plik tła jest w pełnej rozdzielczości (Retina/High-Res)',
    `Rozmiar pliku: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
}

// ── 6. Biblioteki Samodzielne (Zero CDN Dependency w runtime dyplomu) ──
console.log('\n--- GRUPA 6: VENDOR LIBRARIES (OFFLINE/SELF-HOSTED) ---');

const qrcodePath = path.join(rootDir, 'js', 'vendor-qrcode.min.js');
const jspdfPath = path.join(rootDir, 'js', 'vendor-jspdf.umd.min.js');

assert(fs.existsSync(qrcodePath) && fs.statSync(qrcodePath).size > 10000,
  '13. Biblioteka vendor-qrcode.min.js jest obecna lokalnie');

assert(fs.existsSync(jspdfPath) && fs.statSync(jspdfPath).size > 100000,
  '14. Biblioteka vendor-jspdf.umd.min.js jest obecna lokalnie (A4 PDF Export)');

// ── 7. Publiczna Strona Weryfikacji (certyfikat.html & _redirects) ──
console.log('\n--- GRUPA 7: PUBLICZNA STRONA WERYFIKACJI & ROUTING ---');

const certyfikatHtmlPath = path.join(rootDir, 'certyfikat.html');
const certHtmlExists = fs.existsSync(certyfikatHtmlPath);
assert(certHtmlExists,
  '15. Plik certyfikat.html istnieje na root repozytorium');

if (certHtmlExists) {
  const certHtml = fs.readFileSync(certyfikatHtmlPath, 'utf8');
  const hasAuthBadge = certHtml.includes('OFICJALNIE ZWERYFIKOWANY CERTYFIKAT AUTENTYCZNY');
  const hasNoPrivacyLeak = !certHtml.includes('user.email') && !certHtml.includes('course_journal');
  const hasVendorScripts = certHtml.includes('vendor-qrcode.min.js') && certHtml.includes('vendor-jspdf.umd.min.js');

  assert(hasAuthBadge, '16. certyfikat.html zawiera pieczęć autentyczności LUMINA');
  assert(hasNoPrivacyLeak, '17. certyfikat.html chroni dane poufne (brak ujawniania email, dziennika)');
  assert(hasVendorScripts, '18. certyfikat.html ładuje lokalne biblioteki QR i PDF');
}

const redirectsPath = path.join(rootDir, '_redirects');
const redirectsContent = fs.readFileSync(redirectsPath, 'utf8');
const hasRedirects = redirectsContent.includes('/akademia/certyfikat/*') &&
                     redirectsContent.includes('/kursy/certyfikat/*') &&
                     redirectsContent.includes('/certyfikat/*');
assert(hasRedirects,
  '19. Plik _redirects zawiera reguły routingu dla /akademia/certyfikat/*, /kursy/certyfikat/* i /certyfikat/*');

// ── 8. Integracja w kursy.html i Silniku Kursów ──
console.log('\n--- GRUPA 8: INTEGRACJA W KURSY.HTML & SILNIKU KURSÓW ---');

const kursyHtmlPath = path.join(rootDir, 'kursy.html');
const kursyHtml = fs.readFileSync(kursyHtmlPath, 'utf8');
const hasCeremonyModal = kursyHtml.includes('graduation-ceremony-modal');
const hasConfirmNameModal = kursyHtml.includes('confirm-diploma-name-modal');
const hasViewerModal = kursyHtml.includes('certificate-viewer-modal');
const hasTopbarDiplomaBtn = kursyHtml.includes('btn-topbar-diploma');

assert(hasCeremonyModal && hasConfirmNameModal && hasViewerModal && hasTopbarDiplomaBtn,
  '20. kursy.html zawiera kompletne modale (Ceremonia, Potwierdzenie Imienia, Viewer, Przycisk Topbar)');

console.log('\n══════════════════════════════════════════════════════════════════════════');
console.log(` WYNIK TESTÓW AKCEPTACYJNYCH: ${passCount} ZALICZONYCH, ${failCount} BŁĘDÓW`);
console.log('══════════════════════════════════════════════════════════════════════════\n');

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
