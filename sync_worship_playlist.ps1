# Worship Playlist Auto-Sync
# Skanuje lokalny folder MP3 -> Firebase deploy -> JSON update -> GitHub push
# Uruchamiany co 5 minut przez Windows Task Scheduler

$AUDIO_DIR     = "C:\Users\czark\Christian_Culture_Projekty\worship-audio-cdn\worship_audio"
$CDN_DIR       = "C:\Users\czark\Christian_Culture_Projekty\worship-audio-cdn"
$REPO_DIR      = "C:\Users\czark\Christian_Culture_Projekty\polskieradio.cc"
$PLAYLIST_FILE = "$REPO_DIR\worship_playlist.json"
$LOG_FILE      = "$CDN_DIR\worship_sync.log"
$CDN_BASE_URL  = "https://christian-culture-global.web.app"

function Write-Log {
    param([string]$Msg, [string]$Level = "INFO")
    $ts   = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $line = "[$ts] [$Level] $Msg"
    Write-Host $line
    Add-Content -Path $LOG_FILE -Value $line -Encoding UTF8
}

Write-Log "=== Worship Playlist Sync START ==="

if (-not (Test-Path $AUDIO_DIR)) {
    Write-Log "Folder audio nie istnieje: $AUDIO_DIR" "ERROR"
    exit 1
}

$mp3Files = Get-ChildItem -Path $AUDIO_DIR -Filter "*.mp3" | Sort-Object Name
$mp3Count = $mp3Files.Count
Write-Log "Znaleziono $mp3Count plikow MP3."

if ($mp3Count -eq 0) {
    Write-Log "Brak plikow MP3. Koniec." "WARN"
    exit 0
}

# Buduj nowa playliste
$newPlaylist = @()
foreach ($f in $mp3Files) {
    $raw   = [System.IO.Path]::GetFileNameWithoutExtension($f.Name)
    $parts = $raw -split " - ", 2
    if ($parts.Count -eq 2) {
        $artist = $parts[0].Trim()
        $title  = $parts[1].Trim()
    } else {
        $artist = "Christian Culture Instrumental"
        $title  = $raw.Trim() -replace "_", " "
    }
    $safeId = $raw -replace "[^a-zA-Z0-9]", "_"
    $newPlaylist += [ordered]@{
        id       = "worship_$safeId"
        title    = $title
        artist   = $artist
        album    = "Instrumental Worship - Christian Culture"
        duration = 240
        url      = "$CDN_BASE_URL/$($f.Name)"
        file     = $f.Name
    }
}

$newJson = $newPlaylist | ConvertTo-Json -Depth 5

# Sprawdz czy cos sie zmienilo
$changed = $true
if (Test-Path $PLAYLIST_FILE) {
    try {
        $existing    = Get-Content $PLAYLIST_FILE -Raw -Encoding UTF8 | ConvertFrom-Json
        $existingSet = ($existing | ForEach-Object { $_.file }) -join ","
        $newSet      = ($newPlaylist | ForEach-Object { $_.file }) -join ","
        if ($existingSet -eq $newSet) {
            $changed = $false
            Write-Log "Playlista bez zmian ($mp3Count utworow). Pomijam deploy."
        } else {
            $added   = ($newPlaylist | ForEach-Object { $_.file }) | Where-Object { $existing.file -notcontains $_ }
            $removed = ($existing    | ForEach-Object { $_.file }) | Where-Object { ($newPlaylist | ForEach-Object { $_.file }) -notcontains $_ }
            if ($added)   { Write-Log "Nowe pliki: $($added -join ', ')" }
            if ($removed) { Write-Log "Usuniete: $($removed -join ', ')" "WARN" }
        }
    } catch {
        Write-Log "Blad odczytu playlisty - wymuszam aktualizacje." "WARN"
    }
}

if (-not $changed) {
    Write-Log "=== Sync END (brak zmian) ==="
    exit 0
}

# KROK 1: Firebase deploy
Write-Log "Deploying na Firebase Hosting..."
Set-Location $CDN_DIR
$deployOut = cmd /c "firebase deploy --only hosting 2>&1"
Write-Log "Firebase: $($deployOut -join ' | ')"

if ($LASTEXITCODE -ne 0) {
    Write-Log "Firebase deploy nie powiodl sie! Przerywam." "ERROR"
    exit 1
}
Write-Log "Firebase deploy OK."

# KROK 2: Aktualizuj JSON
$newJson | Set-Content -Path $PLAYLIST_FILE -Encoding UTF8
Write-Log "worship_playlist.json zapisany ($mp3Count utworow)."

# KROK 3: Git push
Set-Location $REPO_DIR
$dateStr = Get-Date -Format "yyyy-MM-dd HH:mm"
cmd /c "git add worship_playlist.json"
cmd /c "git commit -m `"Auto-sync worship [$dateStr] - $mp3Count tracks`""
cmd /c "git push origin main"

if ($LASTEXITCODE -eq 0) {
    Write-Log "Git push OK. Nowe utwory live na polskieradio.cc!"
} else {
    Write-Log "Git push nie powiodl sie." "ERROR"
}

Write-Log "=== Sync END ==="
