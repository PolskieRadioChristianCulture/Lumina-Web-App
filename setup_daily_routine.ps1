$action = New-ScheduledTaskAction -Execute "node" -Argument "C:\Users\czark\Christian_Culture_Projekty\polskieradio.cc\update_live_info.js" -WorkingDirectory "C:\Users\czark\Christian_Culture_Projekty\polskieradio.cc"
$trigger = New-ScheduledTaskTrigger -Daily -At 00:00
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
Register-ScheduledTask -TaskName "ChristianCulture_DailyUpdate" -Action $action -Trigger $trigger -Settings $settings -Description "Aktualizuje news.json i inne dynamiczne dane dla OBS kazdego dnia o polnocy" -Force

Write-Host "Rutyna pomyslnie zapisana! Zadanie uruchomi sie w tle kazdej nocy o 00:00."
