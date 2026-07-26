<#
.SYNOPSIS
    Jednorazowy setup – rejestruje zadanie Task Scheduler (co 5 minut).
    Uruchom RAZ jako Administrator.

.NOTES
    Nie wymaga Google Cloud ani żadnych API Keys.
    Korzysta z Firebase CLI (już zainstalowane) i Git.
#>

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   WORSHIP PLAYLIST AUTO-SYNC – Setup                     ║" -ForegroundColor Cyan
Write-Host "║   Christian Culture / polskieradio.cc                    ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$REPO_DIR  = "C:\Users\czark\Christian_Culture_Projekty\polskieradio.cc"
$SCRIPT    = "$REPO_DIR\sync_worship_playlist.ps1"
$TASK_NAME = "WorshipPlaylistSync"
$CDN_DIR   = "C:\Users\czark\Christian_Culture_Projekty\worship-audio-cdn"
$AUDIO_DIR = "$CDN_DIR\worship_audio"

# ── Sprawdź wymagania ──────────────────────────────────────────────
Write-Host "KROK 1/3: Sprawdzanie wymagań..." -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────────"

# Firebase CLI
$fbVersion = cmd /c "firebase --version 2>&1"
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Firebase CLI: $fbVersion" -ForegroundColor Green
} else {
    Write-Host "  ❌ Firebase CLI niedostępne" -ForegroundColor Red
    exit 1
}

# Git
$gitVersion = cmd /c "git --version 2>&1"
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Git: $gitVersion" -ForegroundColor Green
} else {
    Write-Host "  ❌ Git niedostępne" -ForegroundColor Red
    exit 1
}

# Folder audio
if (Test-Path $AUDIO_DIR) {
    $mp3s = (Get-ChildItem "$AUDIO_DIR\*.mp3").Count
    Write-Host "  ✅ Folder audio: $AUDIO_DIR ($mp3s plików MP3)" -ForegroundColor Green
} else {
    Write-Host "  ❌ Brak folderu: $AUDIO_DIR" -ForegroundColor Red
    exit 1
}

# Skrypt sync
if (Test-Path $SCRIPT) {
    Write-Host "  ✅ Skrypt sync: $SCRIPT" -ForegroundColor Green
} else {
    Write-Host "  ❌ Brak skryptu: $SCRIPT" -ForegroundColor Red
    exit 1
}

Write-Host ""

# ── Test ręczny ────────────────────────────────────────────────────
Write-Host "KROK 2/3: Testowy uruchomienie syncu..." -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────────"
Write-Host "  Uruchamianie sync_worship_playlist.ps1..." -ForegroundColor Gray

$testOutput = powershell -ExecutionPolicy Bypass -File "$SCRIPT" 2>&1
$testOutput | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }

if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Test syncu zakończony pomyślnie!" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Test zakończony z kodem: $LASTEXITCODE" -ForegroundColor Yellow
    Write-Host "  Jeśli to błąd Firebase login, uruchom: cmd /c `"firebase login`"" -ForegroundColor Yellow
}
Write-Host ""

# ── Task Scheduler ─────────────────────────────────────────────────
Write-Host "KROK 3/3: Rejestracja Task Scheduler (co 5 minut)..." -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────────"

# Usuń stare zadanie
$existing = Get-ScheduledTask -TaskName $TASK_NAME -ErrorAction SilentlyContinue
if ($existing) {
    Unregister-ScheduledTask -TaskName $TASK_NAME -Confirm:$false
    Write-Host "  Usunięto poprzednią wersję zadania." -ForegroundColor Gray
}

$action = New-ScheduledTaskAction `
    -Execute "powershell.exe" `
    -Argument "-NonInteractive -ExecutionPolicy Bypass -File `"$SCRIPT`"" `
    -WorkingDirectory $REPO_DIR

# Trigger: co 5 minut, bez końca
$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) `
    -RepetitionInterval  (New-TimeSpan -Minutes 5) `
    -RepetitionDuration  ([TimeSpan]::MaxValue)

$settings = New-ScheduledTaskSettingsSet `
    -ExecutionTimeLimit      (New-TimeSpan -Minutes 3) `
    -RestartCount            3 `
    -RestartInterval         (New-TimeSpan -Minutes 1) `
    -StartWhenAvailable `
    -RunOnlyIfNetworkAvailable `
    -MultipleInstances       IgnoreNew

try {
    Register-ScheduledTask `
        -TaskName    $TASK_NAME `
        -Action      $action `
        -Trigger     $trigger `
        -Settings    $settings `
        -Description "Auto-sync muzyki Instrumental Worship – polskieradio.cc (co 5 min)" `
        -RunLevel    Highest | Out-Null

    Write-Host "  ✅ Zadanie '$TASK_NAME' zarejestrowane!" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Błąd rejestracji: $_" -ForegroundColor Red
    Write-Host "  Uruchom PowerShell jako Administrator i spróbuj ponownie." -ForegroundColor Yellow
    exit 1
}

# ── Podsumowanie ───────────────────────────────────────────────────
Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║   ✅  SETUP ZAKOŃCZONY!                                   ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "Jak to działa:" -ForegroundColor Cyan
Write-Host "  1. Wrzuć nowe MP3 do:  $AUDIO_DIR"
Write-Host "  2. Skrypt automatycznie (co 5 min) wykryje nowe pliki"
Write-Host "  3. Uploaduje na Firebase Hosting (christian-culture-global.web.app)"
Write-Host "  4. Aktualizuje worship_playlist.json i pushuje do GitHub"
Write-Host "  5. Odtwarzacz na polskieradio.cc widzi nowe utwory!"
Write-Host ""
Write-Host "Przydatne komendy:" -ForegroundColor Yellow
Write-Host "  • Logi:            Get-Content '$CDN_DIR\worship_sync.log' -Tail 30"
Write-Host "  • Ręczny sync:     powershell -ExecutionPolicy Bypass -File '$SCRIPT'"
Write-Host "  • Wyłącz auto:     Disable-ScheduledTask -TaskName '$TASK_NAME'"
Write-Host "  • Włącz auto:      Enable-ScheduledTask  -TaskName '$TASK_NAME'"
Write-Host "  • Status:          Get-ScheduledTaskInfo -TaskName '$TASK_NAME'"
Write-Host ""
