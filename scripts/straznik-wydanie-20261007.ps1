# ═══════════════════════════════════════════════════════════════════════
# WYDANIE STRAŻNIKA STANDARDÓW — LUMINA 2026-10-07 (Claude, Cowork)
# Tablica bez migania • prawdziwi ludzie na karuzeli • kreator profilu • prawdziwe reakcje
# • czat bez podmiany tożsamości • bezpieczne reguły Firestore.
# Uruchom: dwuklik WYDANIE-STRAZNIK.bat (w folderze polskieradio.cc).
# Każdy krok sprawdza wynik; przy błędzie skrypt zatrzymuje się, NIC nie publikując dalej.
# ═══════════════════════════════════════════════════════════════════════
$ErrorActionPreference = 'Continue'
$Repo   = 'C:\Users\czark\Christian_Culture_Projekty\polskieradio.cc'
$Mirror = 'C:\Users\czark\Desktop\@ICC\LUMINA'
$Joma   = 'C:\Users\czark\Desktop\Misja CC\JOMA_SHARED_MEMORY\JOMA_HANDOFFS.md'
Set-Location $Repo
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

function Krok($t) { Write-Host "`n▶ $t" -ForegroundColor Cyan }
function Ok($t)   { Write-Host "  ✔ $t" -ForegroundColor Green }
function Stop($t) { Write-Host "`n✖ $t" -ForegroundColor Red; Write-Host "  Nic dalej nie zostało opublikowane. Skopiuj ten ekran do Claude." -ForegroundColor Yellow; Read-Host "Naciśnij Enter, aby zamknąć"; exit 1 }

$Files = @(
    'firestore.indexes.json',
    'firestore.rules',
    'js\cc-global-auth.js',
    'js\lumina-comments-engine.js',
    'js\lumina-editor.js',
    'js\lumina-start-preferences.js',
    'js\lumina-community-people.js',
    'js\lumina-media-economy.js',
    'js\lumina-messenger-composer.js',
    'js\lumina-onboarding.js',
    'js\lumina-stable-render.js',
    'js\lumina-theme-manager.js',
    'lumina-app.html',
    'lumina-bottom-nav.js',
    'lumina-core.js',
    'lumina-db.js',
    'lumina-login.html',
    'lumina-profile.html',
    'lumina-security.js',
    'lumina-shorts.html',
    'lumina-tablica-light.html',
    'lumina-tablica.html',
    'lumina-tablica.js',
    'lumina.andrzejthiel.html',
    'lumina.ccmen.html',
    'lumina.cctv.html',
    'lumina.ccwomen.html',
    'lumina.cezaryrgowski.html',
    'lumina.cezaryrogowski.html',
    'lumina.html',
    'lumina.jolawojcik.html',
    'lumina.magdalena.html',
    'lumina.mariusz.html',
    'lumina.osobowoscplus.html',
    'lumina.pawelmurawski.html',
    'lumina.radiocc.html',
    'lumina.studiodobregoslowa.html',
    'lumina.wiolettarogowska.html',
    'lumina.zbyszekgieron.html',
    'lumina.zofiadudek.html',
    'package.json',
    'rolki.html',
    'scripts\lumina-straznik-20261007.test.mjs',
    'scripts\mobile-premium-regression.test.mjs',
    'scripts\p0-rules-test.mjs',
    'scripts\straznik-kodu-check.js',
    'straznik-kodu-check.js',
    'STRAZNIK_RAPORT_2026-10-07.md',
    'scripts\straznik-wydanie-20261007.ps1',
    'WYDANIE-STRAZNIK.bat'
)

Krok "0/8 Porządek: usuwam robocze kopie z korzenia repozytorium"
Remove-Item -ErrorAction SilentlyContinue -Force 'firestore.rules.P0-proposed', 'p0-rules-test.mjs'
Ok "gotowe"

Krok "1/8 Sprawdzam, czy nikt w międzyczasie nie wypchnął zmian (origin/main)"
git fetch origin
$behind = (git rev-list --count HEAD..origin/main).Trim()
if ($behind -ne '0') { Stop "Na GitHubie jest $behind nowszych commitów niż lokalnie. Najpierw 'git pull' (lub poproś Claude o scalenie)." }
Ok "lokalne repozytorium jest aktualne"

Krok "2/8 Testy regresji i Strażnik Kodu"
npm.cmd run test:cc-regression;   if ($LASTEXITCODE -ne 0) { Stop "test:cc-regression NIE przeszedł" }
npm.cmd run test:guardian;        if ($LASTEXITCODE -ne 0) { Stop "Strażnik Kodu zgłosił naruszenia" }
npm.cmd run test:mobile-premium;  if ($LASTEXITCODE -ne 0) { Stop "test:mobile-premium NIE przeszedł" }
Ok "wszystkie testy PASS"

Krok "3/8 Test reguł bezpieczeństwa Firestore w emulatorze (26 scenariuszy ataku i zwykłego użycia)"
if (Get-Command java -ErrorAction SilentlyContinue) {
    npm.cmd i --no-save --silent @firebase/rules-unit-testing firebase
    npx.cmd firebase emulators:exec --only firestore --project demo-p0 "node scripts/p0-rules-test.mjs firestore.rules"
    if ($LASTEXITCODE -ne 0) { Stop "Test reguł Firestore NIE przeszedł" }
    Ok "reguły: wszystkie scenariusze zgodne"
} else {
    Write-Host "  ! Brak Javy na tym komputerze — test emulatora pominięty; reguły sprawdzi kompilator Firebase w kroku 4." -ForegroundColor Yellow
}

Krok "4/8 Wdrażam reguły i indeksy Firestore (projekt lumina-cc)"
npx.cmd firebase deploy --only firestore:rules,firestore:indexes --project lumina-cc
if ($LASTEXITCODE -ne 0) { Stop "Wdrożenie reguł Firestore nie powiodło się (np. brak zalogowania: 'npx.cmd firebase login')" }
Ok "reguły i indeksy wdrożone"

Krok "5/8 Zapisuję zmiany w Git i wypycham do obu repozytoriów"
git add -- $Files
git commit -m "LUMINA: tablica bez migania, prawdziwe reakcje, kreator profilu, czat bez podmiany tożsamości, bezpieczne reguły (Strażnik 2026-10-07)" -m "Szczegóły: STRAZNIK_RAPORT_2026-10-07.md" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" -m "Claude-Session: https://claude.ai/code/session_01Ajo7kf41XL22xXQg9iJW9o"
if ($LASTEXITCODE -ne 0) { Stop "git commit nie powiódł się" }
$sha = (git rev-parse --short HEAD).Trim()
git push origin main;      if ($LASTEXITCODE -ne 0) { Stop "git push origin nie powiódł się" }
git push lumina-repo main; if ($LASTEXITCODE -ne 0) { Stop "git push lumina-repo nie powiódł się" }
Ok "commit $sha w origin i lumina-repo"

Krok "6/8 Publikacja na Cloudflare Pages (polskieradio.cc)"
node scripts/build-pages-release.mjs;  if ($LASTEXITCODE -ne 0) { Stop "budowa paczki .pages-release nie powiodła się" }
npx.cmd wrangler pages deploy .pages-release --project-name polskieradio --branch main --commit-dirty=true
if ($LASTEXITCODE -ne 0) { Stop "wrangler pages deploy nie powiódł się" }
Ok "opublikowane"

Krok "7/8 Synchronizacja lustra @ICC\LUMINA"
if (Test-Path $Mirror) {
    foreach ($f in $Files) {
        $dst = Join-Path $Mirror $f
        New-Item -ItemType Directory -Force -Path (Split-Path $dst) | Out-Null
        Copy-Item -Force -Path (Join-Path $Repo $f) -Destination $dst
    }
    Ok "skopiowano $($Files.Count) plików"
} else { Write-Host "  ! Nie znaleziono $Mirror — pominięto" -ForegroundColor Yellow }

Krok "8/8 Wpis w JOMA_HANDOFFS.md"
if (Test-Path $Joma) {
    $stamp = Get-Date -Format 'yyyy-MM-dd HH:mm'
    $entry = @"
## $stamp | Claude (Cowork, Strażnik Standardów) | LUMINA: tablica, czat, profile, reguły | $sha | DONE ✅
- Tablica bez migania (1 instancja lumina-db, stabilny render, stały seed, wideo tylko widoczne). Karuzela „Poznajmy się bliżej” = prawdziwi ludzie z prawdziwym zdjęciem.
- Kreator profilu po pierwszym logowaniu (imię i nazwisko, miejscowość, prawdziwe zdjęcie). Prawdziwe polubienia/Amen (lumina_post_reactions + reguły ±1).
- Tożsamość wyłącznie po zweryfikowanym e-mailu/slugu (czat, komentarze, profile, „mój profil”); koniec kodu 7777; e-mail/FCM poza publicznym profilem.
- Reguły Firestore P0 + indeksy wdrożone (lumina-cc). Strażnik Kodu: nowa reguła K-NAME-BASED-IDENTITY. Rolki bez przełącznika motywu.
- Testy: cc-regression, guardian, mobile-premium PASS; test reguł: scripts/p0-rules-test.mjs. Raport i otwarte punkty: STRAZNIK_RAPORT_2026-10-07.md.

"@
    $old = Get-Content -Raw -Encoding UTF8 $Joma
    Set-Content -Encoding UTF8 -Path $Joma -Value ($entry + $old)
    Ok "wpis dodany"
} else { Write-Host "  ! Nie znaleziono $Joma — pominięto" -ForegroundColor Yellow }

Write-Host "`n✅ GOTOWE. Napisz w Claude: „wydanie zakończone” — sprawdzę wszystko na żywej stronie." -ForegroundColor Green
Read-Host "Naciśnij Enter, aby zamknąć"
