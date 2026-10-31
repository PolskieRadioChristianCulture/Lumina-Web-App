@echo off
chcp 65001 >nul
echo ========================================================
echo 🐦 JEDNORAZOWE LOGOWANIE DO PLATFORMY X (PLAYWRIGHT)
echo    Standard: ZERO COST (0 PLN / Bez oplat API)
echo ========================================================
echo.
echo Za chwile otworzy sie okno przegladarki z formularzem logowania X.
echo Zaloguj sie na swoje oficjalne konto @CezaryRogowski.
echo.
echo Po zalogowaniu sesja zostanie trwale zapisana w bezpiecznym profilu.
echo Kolejne publikacje z portalu CCN beda publikowac sie same w tle!
echo.
cd /d "C:\Users\czark\Christian_Culture_Projekty\polskieradio.cc"
node scripts/publish_to_x_playwright.mjs --login
echo.
echo ========================================================
echo Gotowe! Mozesz zamknac to okno.
echo ========================================================
pause
