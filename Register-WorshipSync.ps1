# Register-WorshipSync.ps1 - Run as Administrator
$REPO_DIR  = "C:\Users\czark\Christian_Culture_Projekty\polskieradio.cc"
$SCRIPT    = "$REPO_DIR\sync_worship_playlist.ps1"
$TASK_NAME = "WorshipPlaylistSync"

$existing = Get-ScheduledTask -TaskName $TASK_NAME -ErrorAction SilentlyContinue
if ($existing) {
    Unregister-ScheduledTask -TaskName $TASK_NAME -Confirm:$false
    Write-Host "Stare zadanie usuniete."
}

$action = New-ScheduledTaskAction `
    -Execute "powershell.exe" `
    -Argument "-NonInteractive -ExecutionPolicy Bypass -File `"$SCRIPT`"" `
    -WorkingDirectory $REPO_DIR

$trigger = New-ScheduledTaskTrigger `
    -Once -At (Get-Date) `
    -RepetitionInterval (New-TimeSpan -Minutes 5) `
    -RepetitionDuration (New-TimeSpan -Days 3650)

$settings = New-ScheduledTaskSettingsSet `
    -ExecutionTimeLimit (New-TimeSpan -Minutes 3) `
    -RestartCount 3 `
    -RestartInterval (New-TimeSpan -Minutes 1) `
    -StartWhenAvailable `
    -RunOnlyIfNetworkAvailable `
    -MultipleInstances IgnoreNew

Register-ScheduledTask `
    -TaskName $TASK_NAME `
    -Action $action `
    -Trigger $trigger `
    -Settings $settings `
    -Description "Auto-sync muzyki Instrumental Worship - polskieradio.cc (co 5 min)" `
    -RunLevel Highest

Write-Host "Zadanie WorshipPlaylistSync zarejestrowane - co 5 minut."
Get-ScheduledTask -TaskName $TASK_NAME | Select-Object TaskName, State
