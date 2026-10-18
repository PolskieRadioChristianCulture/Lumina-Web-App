# ═══════════════════════════════════════════════════════════════════════
# WYDANIE STRAŻNIKA — KANAŁY NADAWCZE 2026-10-08 (Claude, Cowork)
# Prawdziwe dane na antenie: pogoda, Mission Control, wiadomości, intencje
# • standard ciągłości emisji • kanał główny OBS • cctv24-worship.
# Uruchom: dwuklik WYDANIE-KANALY.bat (w folderze polskieradio.cc).
# Przy błędzie skrypt zatrzymuje się i NIC dalej nie publikuje.
# ═══════════════════════════════════════════════════════════════════════
$ErrorActionPreference = 'Continue'
$Repo = 'C:\Users\czark\Christian_Culture_Projekty\polskieradio.cc'
$Joma = 'C:\Users\czark\Desktop\Misja CC\JOMA_SHARED_MEMORY\JOMA_HANDOFFS.md'
Set-Location $Repo
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$Log = Join-Path $Repo 'WYDANIE-KANALY.log'
Start-Transcript -Path $Log -Force | Out-Null

function G { $o = (& git @args 2>&1 | Out-String); Write-Host $o; return $LASTEXITCODE }
function Krok($t) { Write-Host "`n▶ $t" -ForegroundColor Cyan }
function Ok($t)   { Write-Host "  ✔ $t" -ForegroundColor Green }
function Stop($t) { Write-Host "`n✖ $t" -ForegroundColor Red; Write-Host "  Nic dalej nie zostało opublikowane. Claude odczyta WYDANIE-KANALY.log." -ForegroundColor Yellow; Stop-Transcript | Out-Null; Read-Host "Naciśnij Enter, aby zamknąć"; exit 1 }

node scripts/build-bible-search.mjs; if ($LASTEXITCODE -ne 0) { Stop "indeks wyszukiwarki Biblii nie powstał" }
node scripts/build-tablica-light.mjs; if ($LASTEXITCODE -ne 0) { Stop "jasna tablica nie została wygenerowana" }

$Files = @(
    'apokalipsa-ksiega-nadziei-live-YT.html',
    'apokalipsa-live.html', 'kino-live.html', 'nocne-czuwanie-live.html', 'spiewajmy-panu-live.html',
    'studium-live.html', 'swiadectwa-live.html', 'totalny-atak-live.html', 'tv-epafraz-live.html',
    'randki-malzenstwo-live.html', 'codzienne-uwielbienie-live.html', 'apokalipsa-ksiega-nadziei-live.html',
    'js\cc-broadcast-guard.js',
    'js\cc-live-mission-feed.js',
    'zapolske-live.html', 'cctv24.html', 'cctv24-pl.html', 'cctv24-global.html',
    'cctv24-worship-live.html', 'biblia-spiewana-live.html',
    'cctv24-worship.html', 'cctv24-worship.backup-20261008.html',
    'ambient-sleep-live.html', 'dzj-vertical-live.html', 'master-live.html',
    'lumina.html', 'scripts\mobile-premium-regression.test.mjs',
    'lumina-tablica.html', 'lumina-tablica-light.html', 'lumina-db.js', 'rolki.html', 'js\lumina-comments-engine.js', 'data\shorts\shorts_feed.json',
    'milion.html', 'milion\index.html', 'widget.html', 'widget\index.html', 'stream-scene-vertical.html', 'stream-scene.html', 'scripts\build-pages-release.mjs',
    'news.json', '_worker.js', '.cc-frozen-approvals.json', 'scripts\joma_guard_sentinel.cjs',
    'scripts\lumina-straznik-20261007.test.mjs',
    'js\lumina-photo-nudge.js', 'js\cc-radio-milion.js', 'embed\bar.html', 'embed\player.html', 'radio_christian_culture_widget.html',
    'js\lumina-community-people.js', 'js\cc-back-to-top.js', 'scripts\cc-page-standard.mjs', 'holos.html',
    'images\lumina-avatar-zastepczy.jpg', 'css\lumina-profile-standard.css', 'lumina-profile.html',
    'lumina.andrzejthiel.html', 'lumina.ccmen.html', 'lumina.cctv.html', 'lumina.ccwomen.html', 'lumina.cezaryrgowski.html',
    'lumina.jolawojcik.html', 'lumina.magdalena.html', 'lumina.mariusz.html', 'lumina.osobowoscplus.html', 'lumina.pawelmurawski.html',
    'lumina.radiocc.html', 'lumina.studiodobregoslowa.html', 'lumina.wiolettarogowska.html', 'lumina.zbyszekgieron.html', 'lumina.zofiadudek.html',
    'js\lumina-db-profiles.js', 'lumina-admin-profile-suite.js',
    'lumina-app.html', 'lumina-login.html', 'lumina-safety.html', 'lumina-shorts.html', 'lumina.cezaryrogowski.html', 'lumina-core.js', 'lumina-tablica.js', 'lumina-security.js', 'js\cc-global-auth.js',
    'scripts\lumina-profile-standard-regression.test.mjs', 'scripts\profile-actions-regression.test.mjs',
    'js\lumina-member-home.js', 'lumina-bottom-nav.js',
    'ogloszenia\index.html', 'ogloszenia.html', 'assets\ogloszenia-index-cc20261013.js', 'assets\ogloszenia-index-cc20261013b.js', 'js\cc-ogloszenia-data.js', 'js\cc-ogloszenia-store.js',
    'mojabiblia.html', 'mojabiblia-engine.js', 'data\bible\glosy-pl.json', 'data\bible\szukaj-ubg.json', 'scripts\build-bible-search.mjs', 'tests\mojabiblia-regression.test.mjs',
    'components\lumi-direct-dock-adapter.js',
    'lumi-kids\index.html',
    'lumi-kids\styles.css',
    'lumi-kids\script.js',
    'lumi-kids\zgloszenie.js',
    'components\lumi-direct-dock.js',
    'lumi-kids\app\manifest.webmanifest',
    'lumi-kids\app\icons\lumi-kids-192.png',
    'lumi-kids\app\icons\lumi-kids-512.png',
    'lumi-kids\app\icons\lumi-kids-180.png',
    'lumi-kids\assets\dawidek-avatar.webp',
    'lumi-kids\assets\dawidek-avatar.png',
    'firebase-messaging-sw.js',
    'lumi-kids\assets\lumi-kids-hero-1672.webp',
    'lumi-kids\assets\lumi-kids-hero-1672.jpg',
    'lumi-kids\assets\lumi-kids-hero-1200.webp',
    'lumi-kids\assets\lumi-kids-hero-800.webp',
    'lumi-kids\assets\lumi-kids-hero-mobile.webp',
    'lumi-kids\assets\lumi-kids-hero-mobile.jpg',
    'scripts\cc-page-standard.mjs',
    'lumi-kids\assets\lumi-kids-logo.svg',
    'lumi-kids\assets\lumi-kids-koncepcja.jpg',
    'lumi-kids\app\index.html',
    'lumi-kids\app\app.css',
    'lumi-kids\app\app.js',
    'firestore.rules',
    'tests\lumi-kids-rules.test.mjs',
    'docs\lumi-kids\LUMI_KIDS_PILOT_ARCHITECTURE.md',
    'docs\lumi-kids\LUMI_KIDS_PILOT_SECURITY.md',
    'docs\lumi-kids\LUMI_KIDS_PILOT_TEST_REPORT.md',
    'docs\lumi-kids\LUMI_KIDS_PILOT_RELEASE_CHECKLIST.md',
    'CLAUDE.md',
    'scripts\straznik-wydanie-kanaly-20261008.ps1',
    'WYDANIE-KANALY.bat',
    'scripts\build-tablica-light.mjs', 'lumina-tablica-light.html', 'lumina-tablica.html', 'lumina-profile.html',
    'js\lumina-theme-manager.js', 'js\cc-chat-integration.js', 'components\cc-global-chat-button.js',
    'lumina-db.js', 'components\lumi-direct-dock-adapter.js', 'scripts\push-regression.test.cjs'
) | Where-Object { Test-Path (Join-Path $Repo $_) }

Krok "1/5 Synchronizacja z GitHubem (origin/main)"
git fetch origin
$behind = (git rev-list --count HEAD..origin/main).Trim()
if ($behind -ne '0') {
    $rc = G pull --rebase --autostash origin main
    if ($rc -ne 0) { git rebase --abort 2>$null; Stop "Nie udało się pobrać $behind nowszych commitów (konflikt)." }
}
Ok "lokalne repozytorium jest aktualne"

Krok "2/5 Testy regresji i Strażnik Kodu"
npm.cmd run test:cc-regression;   if ($LASTEXITCODE -ne 0) { Stop "test:cc-regression NIE przeszedł" }
npm.cmd run test:guardian;        if ($LASTEXITCODE -ne 0) { Stop "Strażnik Kodu zgłosił naruszenia" }
npm.cmd run test:mobile-premium;  if ($LASTEXITCODE -ne 0) { Stop "test:mobile-premium NIE przeszedł" }
Ok "wszystkie testy PASS"

Krok "3/5 Zapisuję zmiany w Git i wypycham do obu repozytoriów"
$rc = G add -- $Files
if ($rc -ne 0) { Stop "git add nie powiódł się" }
# Zoptymalizowane obrazy i wideo (te same nazwy plików, mniejsze rozmiary)
$rc = G add -u -- '*.jpg' '*.jpeg' '*.png' '*.mp4'
if ($rc -ne 0) { Stop "git add (obrazy) nie powiódł się" }
$null = G status --short -- $Files
git diff --cached --quiet
if ($LASTEXITCODE -ne 0) {
    $rc = G commit -m "Strażnik (Claude): Mama bez roli Master Admin — zostaje kontaktem rodzinnym LUMI KIDS (rozmowa z dzieckiem uzupełniana automatycznie)" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" -m "Claude-Session: https://claude.ai/code/session_01Ajo7kf41XL22xXQg9iJW9o"
    if ($rc -ne 0) { Stop "git commit nie powiódł się" }
} else { Write-Host "  (brak nowych zmian do zapisania — publikuję stan bieżący)" -ForegroundColor Yellow }
$sha = (git rev-parse --short HEAD).Trim()
$rc = G push origin main;      if ($rc -ne 0) { Stop "git push origin nie powiódł się" }
$rc = G push lumina-repo main; if ($rc -ne 0) { Stop "git push lumina-repo nie powiódł się" }
Ok "commit $sha w origin i lumina-repo"

Krok "4/5 Publikacja na Cloudflare Pages (polskieradio.cc) — dokładnie z zatwierdzonego commita $sha"
# Budowa w osobnej, czystej kopii roboczej: niedokończone zmiany innych agentów nie trafiają na antenę.
$Tmp = Join-Path $env:TEMP 'cc-release-kanaly'
git worktree remove --force $Tmp 2>$null | Out-Null
if (Test-Path $Tmp) { Remove-Item -Recurse -Force $Tmp }
git worktree prune 2>$null | Out-Null
$rc = G worktree add --detach $Tmp HEAD
if ($rc -ne 0) { Stop "nie udało się przygotować czystej kopii do wydania" }
Push-Location $Tmp
$o = (node scripts/build-pages-release.mjs 2>&1 | Out-String); $rcb = $LASTEXITCODE; Write-Host $o
Pop-Location
if ($rcb -ne 0) { Stop "budowa paczki .pages-release nie powiodła się" }
$o = (npx.cmd wrangler pages deploy (Join-Path $Tmp '.pages-release') --project-name polskieradio --branch main --commit-hash $sha --commit-message "Straznik 2026-10-18 Mama kontakt rodzinny bez admina" 2>&1 | Out-String); $rcd = $LASTEXITCODE; Write-Host $o
git worktree remove --force $Tmp 2>$null | Out-Null
if ($rcd -ne 0) { Stop "wrangler pages deploy nie powiódł się" }
Ok "opublikowane"

Krok "4b Reguły Firestore LUMI KIDS — test w emulatorze, potem wdrożenie (lumina-cc)"
# Bezpieczeństwo: reguły wdrażamy WYŁĄCZNIE gdy oba zestawy testów przejdą w emulatorze.
# Bez wdrożonych reguł aplikacja LUMI KIDS jest zamknięta (zasada fail-closed) — portal działa normalnie.
if (-not (Get-Command java -ErrorAction SilentlyContinue)) {
    foreach ($jbr in @('C:\Program Files\Android\Android Studio\jbr', 'C:\Program Files\Android\Android Studio\jre')) {
        if (Test-Path (Join-Path $jbr 'bin\java.exe')) { $env:JAVA_HOME = $jbr; $env:Path = (Join-Path $jbr 'bin') + ';' + $env:Path; break }
    }
}
$RulesOk = $false
if (Get-Command java -ErrorAction SilentlyContinue) {
    # Biblioteki testowe w osobnym katalogu tymczasowym — bez zmian w node_modules projektu.
    $RT = Join-Path $env:TEMP 'cc-rules-test'
    New-Item -ItemType Directory -Force -Path $RT | Out-Null
    $o = (npm.cmd i --prefix $RT --no-audit --no-fund @firebase/rules-unit-testing@5.0.2 firebase@12.19.0 2>&1 | Out-String); Write-Host $o
    Copy-Item -Force (Join-Path $Repo 'tests\lumi-kids-rules.test.mjs') (Join-Path $RT 'lumi-kids-rules.test.mjs')
    Copy-Item -Force (Join-Path $Repo 'scripts\p0-rules-test.mjs') (Join-Path $RT 'p0-rules-test.mjs')
    $env:RULES_FILE = (Join-Path $Repo 'firestore.rules')
    $kt = (Join-Path $RT 'lumi-kids-rules.test.mjs'); $pt = (Join-Path $RT 'p0-rules-test.mjs')
    $o = (npx.cmd --yes firebase-tools@15.32.1 emulators:exec --only firestore --project demo-lumi-kids "node --test `"$kt`"" 2>&1 | Out-String); $rk = $LASTEXITCODE; Write-Host $o
    $o = (npx.cmd --yes firebase-tools@15.32.1 emulators:exec --only firestore --project demo-p0 "node `"$pt`" `"$env:RULES_FILE`"" 2>&1 | Out-String); $rp = $LASTEXITCODE; Write-Host $o
    if ($rk -eq 0 -and $rp -eq 0) {
        Ok "reguły: testy LUMI KIDS i P0 przeszły w emulatorze"
        $o = (npx.cmd --yes firebase-tools@15.32.1 deploy --only firestore:rules --project lumina-cc 2>&1 | Out-String); $rr = $LASTEXITCODE; Write-Host $o
        if ($rr -eq 0) { $RulesOk = $true; Ok "reguły LUMI KIDS wdrożone (lumina-cc)" }
        else { Write-Host "  ! Wdrożenie reguł nie powiodło się (np. brak logowania Firebase). Strona działa, LUMI KIDS pozostaje zamknięte." -ForegroundColor Yellow }
    } else { Write-Host "  ! Testy reguł NIE przeszły — reguły NIE zostały wdrożone. LUMI KIDS pozostaje zamknięte." -ForegroundColor Yellow }
} else { Write-Host "  ! Brak Javy — test emulatora niemożliwy, reguły NIE zostały wdrożone. LUMI KIDS pozostaje zamknięte." -ForegroundColor Yellow }
Write-Host "  REGULY_LUMI_KIDS_WDROZONE=$RulesOk"

Krok "5/5 Wpis w JOMA_HANDOFFS.md"
if (Test-Path $Joma) {
    $stamp = Get-Date -Format 'yyyy-MM-dd HH:mm'
    $entry = @"
## $stamp | Claude (Cowork, Strażnik Standardów) | Kanały nadawcze: prawdziwe dane + ciągłość emisji | $sha | DONE ✅
- Pogoda wyłącznie z Open-Meteo (brak danych = okienko ukryte), Mission Control z projektu cc-mission-control (js/cc-live-mission-feed.js), wiadomości z /news.json (worker, RSS), tylko zatwierdzone intencje.
- js/cc-broadcast-guard.js w 11 kanałach YT (błąd/stop = następny film, plansza zastępcza). Kanał główny OBS: autostart, wznowienie, watchdog.
- cctv24-worship.html odmrożony za zgodą Dowódcy (kopia: cctv24-worship.backup-20261008.html). NIE COFAĆ poprawek Strażnika.

"@
    $old = Get-Content -Raw -Encoding UTF8 $Joma
    Set-Content -Encoding UTF8 -Path $Joma -Value ($entry + $old)
    Ok "wpis dodany"
} else { Write-Host "  ! Nie znaleziono $Joma — pominięto" -ForegroundColor Yellow }

Write-Host "`n✅ GOTOWE — WYDANIE ZAKOŃCZONE" -ForegroundColor Green
Stop-Transcript | Out-Null
Start-Sleep -Seconds 20
