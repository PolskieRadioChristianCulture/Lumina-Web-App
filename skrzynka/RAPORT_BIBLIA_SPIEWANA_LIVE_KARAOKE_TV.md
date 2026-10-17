# RAPORT WDROŻENIOWY: BIBLIA ŚPIEWANA LIVE 24/7 • KARAOKE TV (`@ICC`)

- **Data raportu:** 2026-10-17
- **Kanał docelowy:** `https://polskieradio.cc/biblia-spiewana-live` (`/biblia-spiewana`)
- **Plik kanału:** `biblia-spiewana-live.html`
- **Moduł silnika Karaoke TV:** `assets/bu/biblia-spiewana-live-karaoke.js`
- **Playlista i metadane czasowe:** `biblia_spiewana_playlist.json`
- **Status publikacji:** **GOTOWE DO PUBLIKACJI (WSTRZYMANO DO POTWIERDZENIA WYNIKÓW TESTÓW)**

---

## 1. Wyniki badania architektury strumienia LIVE (Priorytet 1)

1. **Rzeczywiste źródło dźwięku:**
   - Kanał `biblia-spiewana-live.html` korzysta z pojedynczego natywnego elementu HTML5 `<audio id="stream-audio" autoplay playsinline preload="auto"></audio>`.
   - Odtwarza w pętli 31 utworów MP3 z katalogu `/audio/biblia_spiewana/Śpiewane Przypowieści Salomona 1..31.mp3` (zdefiniowanych w `biblia_spiewana_playlist.json`).
2. **Dostępność precyzyjnej pozycji utworu i zgodność z bazą LRC/VTT/JSON:**
   - Przeprowadzono analizę `ffprobe` wszystkich 31 plików MP3 w `/audio/biblia_spiewana/` oraz porównano je z bazą `/data/bu-karaoke/PRO-001.json` .. `PRO-031.json` (oraz `.lrc` i `.vtt`).
   - Pliki MP3 na kanale LIVE to **dokładnie te same nagrania**, dla których wygenerowano znaczniki czasowe w `/data/bu-karaoke/`.
   - **24 z 31 rozdziałów** (`PRO-001`..`PRO-017` oraz `PRO-019`..`PRO-025`) posiadają zweryfikowane pliki synchronizacji (`status: "SYNC_READY"`) z czasem rozpoczęcia i zakończenia każdego wersu oraz pojedynczych słów (`words[]`).
   - **7 rozdziałów** (`PRO-018`, `PRO-026`..`PRO-031`) nie posiada jeszcze plików synchronizacji (`NO_SYNC`).
3. **Korekta zegara emisji 24/7 (`epochSeconds`):**
   - W pliku `biblia_spiewana_playlist.json` oraz `DEFAULT_PLAYLIST` zastąpiono sztywne placeholdery `duration: 240` rzeczywistymi czasami trwania MP3 z `ffprobe` (od `172s` do `414s`, łączny czas pętli: `9294s`) oraz dodano jawne identyfikatory `chapterId: "PRO-001"` .. `"PRO-031"`.
   - W funkcji `syncAndPlay()` dodano bezpieczne ustawianie pozycji `audio.currentTime = remaining` przy dołączaniu widza w trakcie trwania utworu, a sam silnik karaoke odczytuje bezpośrednio `audio.currentTime` z częstotliwością `25 fps` (`40 ms`). Dzięki temu:
     - **Nie uruchamiamy drugiego odtwarzacza audio** (zero ryzyka podwójnego dźwięku).
     - Po buforowaniu (`waiting` -> `playing`), przewinięciu (`seeked`) lub powrocie karty z tła (`visibilitychange`), napisy są w 100% zsynchronizowane z faktycznie słyszanym przez widza dźwiękiem.

---

## 2. Zrealizowane wymagania funkcjonalne i wizualne

1. **Pełnoekranowa tapeta 16:9 bez kadrowania sylwetek:**
   - Jako tło kanału (`#bg-img-active`, `#bg-img-swap`, `getActiveBackground()`, `getDynamicBackground()`) ustawiono nową dedykowaną tapetę PNG: `/images/biblijne-uwielbienie/uwielbienie-w-blasku-krzyza-live.png` (skopiowaną z `C:\Users\czark\Downloads\Uwielbienie w blasku krzyża (1).png`, wraz z aktualizacją `/images/biblijne-uwielbienie/worship-cross-fullscreen.webp`).
2. **Niezależna warstwa karaoke nad grafiką (`#bs-karaoke-stage`):**
   - Umieszczona w **środkowo-dolnej części ekranu** (`bottom: 64px`, `height: 410px`, `topRatio >= 0.52`), na miękkim granatowym gradiencie (`rgba(7, 11, 22, ...)`).
   - **Nie zasłania twarzy trzech postaci ani krzyża** (znajdujących się w górnej i środkowej części kadru).
   - Wykorzystuje oryginalny algorytm synchronizacji z `assets/bu/karaoke-top100.js`:
     - bezpośrednie trafienie w segment (`now >= seg.start && now < seg.end`),
     - `550 ms` lookahead priming przed rozpoczęciem wersu,
     - podtrzymanie ciągłości między wersami (`gap < 3.2 || now < prevEnd + 1.8`),
     - podświetlanie słowo po słowie ciepłym złotem champagne `#C4A35A` / `#FFE2A5` lub całych linijek (`[Słowa]` / `[Linijki]`),
     - obsługa plików `.json` z fallbackiem do `.vtt` i `.lrc`.
3. **Automatyczna minimalizacja elementów informacyjnych podczas śpiewania:**
   - Gdy utwór jest aktywnie śpiewany (`body.karaoke-singing-active`), automatycznie wygaszane są widżety QR (`.biblia-qr-widget`), wyciszany jest wizualizer (`#cinematicSpectrumContainer`), a dolny pasek informacyjny (`footer`) ulega delikatnemu pomniejszeniu (`58px`), aby nie konkurować ze Słowem Bożym.
4. **Automatyczne ukrywanie przy braku synchronizacji (`NO_SYNC`):**
   - Brak pozornej synchronizacji: gdy odtwarzany jest utwór bez danych synchronizacji (np. `PRO-018`, `PRO-026`..`PRO-031`), warstwa `#bs-karaoke-stage` automatycznie się ukrywa, przywracając normalną oprawę telewizyjną i pełną widoczność tapety bez przerywania emisji audio.
5. **Opcjonalny tryb pełnoekranowy karaoke:**
   - Przycisk `Pełny ekran` (`#bs-btn-fullscreen-karaoke`, min. `44×44 px`) przełącza kanał w czysty tryb pełnoekranowego uwielbienia (`body.bs-karaoke-fullscreen` + Fullscreen API).
6. **Panel administracyjny / reżyserski (`#bs-karaoke-admin-panel`):**
   - Przełącznik trybu: **`AUTO` / `ON` / `OFF`** oraz czerwony przycisk **`WYŁĄCZ NATYCHMIAST (OFF)`** (`#bs-emergency-off-btn`).
   - **Podgląd emisji na żywo:** aktualny rozdział (`PRO-XXX`), status synchronizacji (`SYNC_READY` / `NO_SYNC`), zegar utworu (`currentTime / duration`) oraz podgląd aktualnie śpiewanego wersetu.
   - **Ustawienia tekstu:** przełącznik `Słowa (Złoto)` / `Całe linijki`, rozmiar czcionki `A−` / `A+`, przyciemnienie gradientu `60% / 75% / 90%`, ręczna korekta offsetu `-100 ms / 0 ms / +100 ms` (zapisywana w `localStorage` dla każdego rozdziału).

---

## 3. Wyniki testów automatycznych i regresyjnych

Wszystkie testy zakończyły się wynikiem **100% PASS (0 błędów)**:

| Zestaw testowy | Komenda | Wynik | Szczegóły |
|---|---|---|---|
| **Testy E2E Playwright (Desktop, Mobile, Fullscreen, Sync, NO_SYNC, Admin OFF)** | `node --test tests/biblia-spiewana-live-karaoke.test.mjs` | **PASS (1/1)** | Zweryfikowano rozdzielczości `1920x1080`, `1440x900`, `390x844`, `360x800`, pojedyncze `<audio>`, brak zasłaniania twarzy (`topRatio >= 0.52`), podświetlanie słów w `PRO-001`, auto-ukrywanie na `PRO-018` (`NO_SYNC`), natychmiastowy wyłącznik `OFF` oraz dotyk `≥ 44×44 px`. |
| **Regresja istniejącego Karaoke (`CC Karaoke Sync 2.0` & `TOP 100`)** | `node --test tests/bu-karaoke-sync2.test.mjs tests/bu-karaoke-top100.test.mjs` | **PASS (15/15)** | 0 regresji w module `/karaoke` (`biblijne-uwielbienie.html`) oraz bazie 38 zsynchronizowanych rozdziałów i 1189 rozdziałów UBG 2025. |
| **Strażnik Kodu (`@SMCC`)** | `npm.cmd run test:guardian` | **PASS (0 naruszeń)** | Poprawne atrybuty `defer`, cele dotykowe `≥ 44×44 px`, brak wycieku nazw prywatnych. |
| **Regresja Ekosystemu CC** | `npm.cmd run test:cc-regression` | **PASS (289/289)** | Pełna spójność routingu, nagłówków i komponentów. |
| **Standard Mobile Premium** | `npm.cmd run test:mobile-premium` | **PASS (24/24)** | Brak poziomego przepełnienia (`horizontalOverflow: false`) i pełna ergonomia mobilna. |
| **JOMA Guard Sentinel** | `node scripts/joma_guard_sentinel.cjs` | **PASS (0 błędów)** | Standard Zero-QA dla Dowódcy potwierdzony. |

---

## 4. Zrzuty ekranu z weryfikacji (Artifacts)

- Desktop `1920×1080` (aktywne karaoke na tapecie z krzyżem): `biblia_spiewana_live_karaoke_1920x1080.png`
- Panel Administracyjny Reżyserki `AUTO / ON / OFF` (`1920×1080`): `biblia_spiewana_live_admin_panel_1920x1080.png`
- Tryb pełnoekranowy Karaoke (`1920×1080`): `biblia_spiewana_live_fullscreen_1920x1080.png`
- Desktop `1440×900`: `biblia_spiewana_live_karaoke_1440x900.png`
- Mobile `390×844` i `360×800`: `biblia_spiewana_live_karaoke_390x844.png`, `biblia_spiewana_live_karaoke_360x800.png`

---

## 5. Decyzja o publikacji

Zgodnie z instrukcją:
> *„Przygotuj raport do Repozytoria-CC/skrzynka/. Nie publikuj zmian przed potwierdzeniem pozytywnych wyników testów.”*

Zmiany zostały przygotowane, przetestowane lokalnie w 100% i **nie zostały jeszcze opublikowane na produkcję (`polskieradio.cc`)**. Po potwierdzeniu raportu wykonam natychmiastowy `git commit`, podwójny `git push` oraz wdrożenie Cloudflare Pages.
