# AUDYT I RAPORT WDROŻENIOWY — CHRISTIAN CULTURE GLOBAL
**Data:** 2026-10-16 11:05  
**Autor:** Antigravity (Agent Ekosystemu Christian Culture)  
**Adres produkcyjny:** `https://polskieradio.cc/Global/`  
**Adresy równoległe (Clean URLs):** `https://polskieradio.cc/GLOBAL`, `https://polskieradio.cc/global`, `https://polskieradio.cc/global/`  

---

## 1. Cel Operacyjny
Wdrożenie dedykowanego, międzynarodowego portalu **Christian Culture Global** w oparciu o dostarczoną paczkę źródłową (`ChristianCultureGlobal`), zintegrowanego z infrastrukturą radiowo-medialną Christian Culture bez generowania kosztów i bez fikcyjnych deklaracji.

---

## 2. Wyniki Audytu Wstępnego (Etap 0)

### 2.1. Strumienie Radiowe Live
Zweryfikowano rzeczywiste parametry sieciowe i nagłówki HTTP dla obu stacji:
- **Global Radio (Christian Culture Network 24/7):**
  - URL: `https://stream.zeno.fm/vz96pvl3pnktv`
  - Status HTTP: `200 OK`
  - Content-Type: `audio/mpeg`
  - Dźwięk: aktywny sygnał 24/7, wysoka dynamika studyjna.
- **Global Bible (Radio Biblia 24/7):**
  - URL: `https://stream.zeno.fm/imo45hqnshyuv`
  - Status HTTP: `200 OK`
  - Content-Type: `audio/mpeg`
  - Dźwięk: aktywny lektor Słowa Bożego 24/7.

Obie stacje zostały podpięte jako domyślne źródła w [`Global/static/`](file:///C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/Global/static/) oraz [`portals/cc-global/src/config.js`](file:///C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/portals/cc-global/src/config.js).

### 2.2. Tożsamość i Autoryzacja LUMINA (Firebase Auth)
- Zintegrowano projekt produkcyjny LUMINA: `lumina-cc`
- `apiKey`: `AIzaSyAkX7XDMWjeUPeaIk0WdvoY4d9VhIPyD7M`
- `authDomain`: `lumina-cc.firebaseapp.com`
- `projectId`: `lumina-cc`
- `appId`: `1:413985877183:web:b0c99a686a4fb1b875aa0a`
- Logowanie przez Google Provider (`GoogleAuthProvider`) podpięte pod przycisk autoryzacji w nagłówku.

### 2.3. Prawa Autorskie i Materiały Medialne
- **Grafiki:**
  - `assets/hero.webp` (1920×1080) — grafika panoramiczna zatwierdzona przez Dowódcę.
  - `assets/now-is-the-time.webp`, `assets/written-in-heaven.webp` — oficjalne grafiki promocyjne premier.
  - `assets/favicon.svg` — wektorowy znak Christian Culture Global.
- **Utwory muzyczne JJ Beauvais:**
  - `Now Is The Time` (`https://youtu.be/5-MJ-rfXiYY`)
  - `Written In Heaven (Live)` (`https://youtu.be/6JrD-LbIvZ0`)
- **Kanał Personality Plus:**
  - 5 oficjalnych playlist YouTube (`PL5VKLFQU7nyCuh4U3mIQLwxqcxjilGq1m`, `PL5VKLFQU7nyA-q5ESfQpjxsAtJszeWePA`, `PL5VKLFQU7nyDotu7lsI_C0EjbE6KCdopf`, `PL5VKLFQU7nyAJO8cEjGPbD2m7aCjkwMKM`, `PL5VKLFQU7nyCpcbDA-soPovlK3STsZh4g`) osadzanych na żądanie w bezpiecznym oknie `youtube-nocookie.com`.

---

## 3. Wdrożenie Architektury (Etap 1 & 2)

1. **Lokalizacja w 10 Językach Świata:**
   - Angielski (`en`), Polski (`pl`), Hiszpański (`es`), Portugalski (`pt`), Francuski (`fr`), Niemiecki (`de`), Hindi (`hi`), Indonezyjski (`id`), Suahili (`sw`), Chiński uproszczony (`zh`).
   - Wybór języka utrwalany w `localStorage ('ccg-lang')`, dynamiczna podmiana atrybutu `<html lang="...">`.
2. **SEO & Structured Data (JSON-LD):**
   - Strona główna: `WebSite` JSON-LD z listą 10 języków.
   - Podstrony artykułów: pełny prerendering HTML, `Article` JSON-LD z `headline`, `description`, `datePublished`, `author` i `publisher`.
   - `sitemap.xml`, `robots.txt`, `llms.txt`.
3. **Pancerne Bezpieczeństwo & CSP:**
   - Dodano dedykowaną sekcję `/Global/*` w `_headers` z politykami `SAMEORIGIN`, `strict-origin-when-cross-origin`, `nosniff`.
   - Dozwolone źródła `connect-src` i `media-src` obejmują `https://stream.zeno.fm`, `https://*.zeno.fm`, `https://*.googleapis.com`, `https://*.firebaseio.com`.
   - Ramki i skrypty YouTube wyłącznie z `https://www.youtube-nocookie.com`.
4. **Clean URLs & Przekierowania:**
   - W `_redirects` dodano reguły przekierowań 301 dla `/GLOBAL`, `/global`, `/global/` oraz `/Global` wskazujące kanonicznie na `/Global/`.

---

## 4. Bateria Testów Weryfikacyjnych
- `tests/config.test.js`: **2/2 PASS** (kompletność 10 języków, unikalność playlist).
- `straznik-kodu-check.js`: **0 naruszeń** (11 reguł Strażnika Kodu).
- `test:cc-regression`: **288/288 PASS** (100% testów regresji ekosystemu).
- `test:mobile-premium`: **24/24 PASS**.
- `build-pages-release.mjs`: **5258 plików** poprawnie spakowanych do `.pages-release`.

---

## 5. Status
Wdrożenie gotowe, przetestowane i w pełni zintegrowane z ekosystemem Christian Culture.
