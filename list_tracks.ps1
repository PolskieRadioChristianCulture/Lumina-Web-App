$json = Get-Content worship_playlist.json -Raw | ConvertFrom-Json; $n=1; $json | ForEach-Object { Write-Host "$n. $($_.title)"; $n++ }
