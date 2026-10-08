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
    'news.json', '_worker.js', '.cc-frozen-approvals.json', 'scripts\joma_guard_sentinel.cjs',
    'scripts\lumina-straznik-20261007.test.mjs',
    'CLAUDE.md',
    'scripts\straznik-wydanie-kanaly-20261008.ps1',
    'WYDANIE-KANALY.bat'
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
$null = G status --short -- $Files
git diff --cached --quiet
if ($LASTEXITCODE -ne 0) {
    $rc = G commit -m "Kanały nadawcze: prawdziwe dane (pogoda, Mission Control, wiadomości, intencje), ciągłość emisji, cctv24-worship (Strażnik 2026-10-08)" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" -m "Claude-Session: https://claude.ai/code/session_01Ajo7kf41XL22xXQg9iJW9o"
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
$o = (npx.cmd wrangler pages deploy (Join-Path $Tmp '.pages-release') --project-name polskieradio --branch main --commit-hash $sha --commit-message "Kanaly nadawcze Straznik 2026-10-08" 2>&1 | Out-String); $rcd = $LASTEXITCODE; Write-Host $o
git worktree remove --force $Tmp 2>$null | Out-Null
if ($rcd -ne 0) { Stop "wrangler pages deploy nie powiódł się" }
Ok "opublikowane"

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
