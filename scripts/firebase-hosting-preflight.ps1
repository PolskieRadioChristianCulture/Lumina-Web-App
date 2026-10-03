# Firebase Hosting Pre-Flight Check & Remediation Script (Christian Culture)
param(
    [string]$ProjectId = "",
    [string]$SiteId = "",
    [switch]$DryRun = $true,
    [switch]$Apply = $false
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Christian Culture - Firebase Hosting Pre-Flight Guard    " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$CurrentDir = Get-Location
$FirebaseJsonPath = Join-Path $CurrentDir "firebase.json"
$FirebasercPath = Join-Path $CurrentDir ".firebaserc"

if (-not (Test-Path $FirebaseJsonPath)) {
    Write-Warning "Brak pliku firebase.json w $CurrentDir. Pomijam audyt Hosting."
    exit 0
}

$FirebaseJson = Get-Content $FirebaseJsonPath -Raw | ConvertFrom-Json
$DefaultProject = ""

if (Test-Path $FirebasercPath) {
    $Firebaserc = Get-Content $FirebasercPath -Raw | ConvertFrom-Json
    if ($Firebaserc.projects -and $Firebaserc.projects.default) {
        $DefaultProject = $Firebaserc.projects.default
    }
}

if ([string]::IsNullOrWhiteSpace($ProjectId)) {
    $ProjectId = $DefaultProject
}

Write-Host "Katalog roboczy: $CurrentDir" -ForegroundColor Gray
Write-Host "Wykryty projekt Firebase: $(if ($ProjectId) { $ProjectId } else { '[Brak domyslnego]' })" -ForegroundColor Gray

$HostingConfigs = @()
if ($FirebaseJson.hosting -is [System.Array]) {
    $HostingConfigs = $FirebaseJson.hosting
} elseif ($FirebaseJson.hosting) {
    $HostingConfigs = @($FirebaseJson.hosting)
}

Write-Host "Liczba sekcji hostingowych: $($HostingConfigs.Count)" -ForegroundColor Gray

foreach ($h in $HostingConfigs) {
    if (-not $h.target -and -not $h.site) {
        Write-Host ""
        Write-Host "[UWAGA] Ryzyko od 15.10.2026:" -ForegroundColor Yellow
        Write-Host "Sekcja hosting nie posiada jawnego pola site ani target." -ForegroundColor Yellow
        Write-Host "Przy wdrozeniu do NOWEGO projektu Firebase spowoduje to blad: 404 Site Not Found." -ForegroundColor Yellow
        
        $RemediationSite = if ($SiteId) { $SiteId } elseif ($ProjectId) { $ProjectId } else { "<site-id>" }
        $RemediationProj = if ($ProjectId) { $ProjectId } else { "<project-id>" }
        
        Write-Host "Zalecane polecenie przed pierwszym deployem:" -ForegroundColor Green
        Write-Host "  firebase hosting:sites:create $RemediationSite --project=$RemediationProj" -ForegroundColor Green
    } else {
        Write-Host "OK: Konfiguracja zawiera jawny identyfikator (target: $($h.target), site: $($h.site))." -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Pre-flight check zakonczony pomyslnie (Tryb bezpieczny, brak zmian zewnetrznych)." -ForegroundColor Cyan
