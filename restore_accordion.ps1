# Skrypt przywracania poprzedniej wersji zakładek (accordion)
Write-Host "Rozpoczynam przywracanie poprzednich zakładek..." -ForegroundColor Yellow
$root = $PSScriptRoot
if (-not $root) { $root = Get-Location }
Copy-Item "$root\index.html.bak_accordion" "$root\index.html" -Force
Copy-Item "$root\prod_index.html.bak_accordion" "$root\prod_index.html" -Force
Copy-Item "$root\style.css.bak_accordion" "$root\style.css" -Force
Write-Host "SUKCES! Poprzednie wersje index.html, prod_index.html i style.css zostały w 100% przywrócone." -ForegroundColor Green
