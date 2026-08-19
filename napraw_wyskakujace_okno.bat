@echo off
echo Zmieniam uzytkownika zadania Harmonogramu Zadan na SYSTEM...
schtasks /change /tn "\WorshipPlaylistSync" /ru "SYSTEM"
if %ERRORLEVEL% == 0 (
    echo.
    echo Sukces! Zadanie dziala teraz w 100%% w tle i nie bedzie juz wyskakiwac.
) else (
    echo.
    echo Blad: Upewnij sie, ze uruchomiles ten skrypt jako Administrator! (Prawy przycisk myszy -^> Uruchom jako administrator)
)
pause
