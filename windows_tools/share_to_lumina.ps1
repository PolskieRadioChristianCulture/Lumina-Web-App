param(
    [string]$TargetFile = ""
)

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

function Show-LuminaNotification {
    param(
        [string]$Title,
        [string]$Message,
        [string]$IconPath
    )
    try {
        $notify = New-Object System.Windows.Forms.NotifyIcon
        if (Test-Path $IconPath) {
            $notify.Icon = New-Object System.Drawing.Icon($IconPath)
        } else {
            $notify.Icon = [System.Drawing.SystemIcons]::Information
        }
        $notify.BalloonTipTitle = $Title
        $notify.BalloonTipText = $Message
        $notify.BalloonTipIcon = [System.Windows.Forms.ToolTipIcon]::Info
        $notify.Visible = $true
        $notify.ShowBalloonTip(4000)
        Start-Sleep -Milliseconds 500
        $notify.Dispose()
    } catch {}
}

$icoPath = "C:\Users\czark\Christian_Culture_Projekty\polskieradio.cc\windows_tools\lumina.ico"
$url = "https://polskieradio.cc/lumina-tablica.html"

if ($TargetFile -and (Test-Path $TargetFile)) {
    $item = Get-Item $TargetFile
    $fileName = $item.Name
    $ext = $item.Extension.ToLower()

    # Kopiujemy plik do schowka Windows (umożliwia natychmiastowe wklejenie Ctrl+V na portalu lub czacie)
    try {
        if ($ext -match "^\.(jpg|jpeg|png|webp|gif|bmp)$") {
            # Kopiowanie jako obraz do schowka
            $img = [System.Drawing.Image]::FromFile($item.FullName)
            [System.Windows.Forms.Clipboard]::SetImage($img)
            $img.Dispose()
        } else {
            # Kopiowanie ścieżki / pliku
            $fileColl = New-Object System.Collections.Specialized.StringCollection
            $fileColl.Add($item.FullName) | Out-Null
            [System.Windows.Forms.Clipboard]::SetFileDropList($fileColl)
        }
    } catch {
        try { Set-Clipboard -Value $item.FullName } catch {}
    }

    # Otwieramy Tablicę Społeczności LUMINA
    Start-Process $url

    # Wyświetlamy powiadomienie
    Show-LuminaNotification -Title "✨ LUMINA — Gotowe do udostępnienia!" -Message "Plik: $fileName`nSkopiowano do schowka. Otwarto Tablicę Społeczności — możesz wkleić treść (Ctrl+V)!" -IconPath $icoPath
} else {
    # Brak określonego pliku - po prostu otwieramy Tablicę Społeczności
    Start-Process $url
    Show-LuminaNotification -Title "✨ Portal LUMINA" -Message "Otwarto Tablicę Społeczności Christian Culture." -IconPath $icoPath
}