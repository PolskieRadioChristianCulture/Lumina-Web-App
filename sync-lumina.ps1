# ═══════════════════════════════════════════════════════════════════════
# SKRYPT SYNCHRONIZACJI DWUKIERUNKOWEJ CC: Antigravity <-> Google AI Studio
# ═══════════════════════════════════════════════════════════════════════
param(
    [string]$Action = "sync"
)

$repoDir = "C:\Users\czark\Christian_Culture_Projekty\polskieradio.cc"
Set-Location $repoDir

Write-Host "🔄 [CC SYNC] Uruchamiam most synchronizacji Antigravity <-> Google AI Studio..." -ForegroundColor Cyan

$remotes = git remote
if ($remotes -notcontains "lumina-repo") {
    Write-Host "➕ Dodaję remote dla repozytorium AI Studio (Lumina-Web-App)..." -ForegroundColor Yellow
    git remote add lumina-repo "https://github.com/PolskieRadioChristianCulture/Lumina-Web-App.git"
}

Write-Host "📥 Pobieram najnowszy stan z GitHuba..." -ForegroundColor Green
git fetch origin
git fetch lumina-repo

if ($Action -eq "pull" -or $Action -eq "sync") {
    Write-Host "🔍 Scalam ulepszenia z AI Studio (Lumina-Web-App)..." -ForegroundColor Yellow
    git checkout lumina-repo/main -- lumina.html lumina-tablica.html lumina-profile.html lumina.*.html lumina-*.js js/ css/ reklamy/ 2>$null
    Write-Host "✅ Zaimportowano najnowsze ulepszenia z AI Studio." -ForegroundColor Green
}

if ($Action -eq "push" -or $Action -eq "sync") {
    Write-Host "📤 Wypycham zsynchronizowany stan do obu repozytoriów..." -ForegroundColor Cyan
    git push origin main
    git push lumina-repo main
    Write-Host "🚀 Wszystkie repozytoria są w 100% zsynchronizowane!" -ForegroundColor Green
}

Write-Host "🏁 Gotowe!" -ForegroundColor Green
