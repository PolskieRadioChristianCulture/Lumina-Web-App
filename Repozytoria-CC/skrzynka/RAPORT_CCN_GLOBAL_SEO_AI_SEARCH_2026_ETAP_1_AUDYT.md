# RAPORT ETAPU 1 — AUDYT BEZ ZMIAN PRODUKCYJNYCH
**Standard:** CHRISTIAN CULTURE NETWORK — GLOBAL SEO & AI SEARCH 2026 (Wersja 1.0 | 17 października 2026)
**Data audytu:** 2026-10-17T10:40:36+02:00
**Wykonał:** Antigravity (Tryb Read-Only przed wdrożeniem Etapów 2–6)
**Obszar:** `C:\Users\czark\Christian_Culture_Projekty\polskieradio.cc` (`https://polskieradio.cc`)

---

## 1. Inwentaryzacja Repozytorium, URL i Trybów Renderowania

| Kategoria zasobu | Liczba plików | Tryb renderowania | Status kanoniczności i indeksacji |
|---|---:|---|---|
| **Wszystkie śledzone pliki Git** | `6 067` | — | — |
| **Wszystkie dokumenty HTML** | `727` | — | — |
| **Artykuły CCN News (`news/*`)** | `184` | SSG (statyczny HTML + hydratacja SPA `/news`) | 48 unikalnych artykułów (po 4 warianty zapisu: `slug.html`, `slug/index.html`, `art-*.html`, `art-*/index.html`) |
| **Artykuły na portalach tematycznych** | `8` | SSG (statyczny HTML) | `/edukacja/*`, `/rodzina/*`, `/misje/*`, `/spoleczenstwo/*` (kanoniczny URL wskazuje na wersję główną artykułu) |
| **Lekcje Akademii i Kursu Codziennego** | `109` | SSG (statyczny HTML) | Dni 1–17 w 4 wariantach ścieżek + lekcje Apokalipsy (`lekcja-01..26`) |
| **Portale główne i strony publiczne** | `386` | Statyczny HTML / Hybrydowy | `index.html`, `/szukaj`, `/o-nas`, `/vod`, `/BiblijneUwielbienie`, `/mojabiblia`, `/lumina`, `/mapa`, `/Global/` (EN) |
| **Ekrany transmisyjne / OBS / Admin** | `37` | Klient / Operacyjny | Wyłączone z indeksacji (`cctv24*`, `*-live.html`, `stream-scene.html`, `karaoke-studio.html`) |
| **Przekierowania HTML (`meta refresh`)** | `3` | Stub przekierowujący | Zastępowane docelowo przez reguły `301` w `_redirects` |

---

## 2. Audyt Docelowych Ścieżek Odkrywania (Sekcja 5 Standardu)

| Docelowa ścieżka | Stan zastany (Etap 1) | Rozmiar | Diagnoza audytowa |
|---|---|---:|---|
| `/robots.txt` | ✅ ISTNIEJE | 1 185 B | Wymaga doprecyzowania ochrony prywatnych ścieżek LUMINA (`/lumina-login`, `/lumina-profile`, `/mess`, `/api/mc/`), rozdzielenia botów wyszukujących AI (`OAI-SearchBot`) od treningowych (`GPTBot`) oraz dodania nowych map `/sitemaps/*.xml`. |
| `/sitemap.xml` | ✅ ISTNIEJE | 44 762 B | Zawiera pojedynczą płaską listę URL; wymaga synchronizacji z mapami tematycznymi `/sitemaps/*.xml` i rygorystycznej kontroli `lastmod`. |
| `/feed.xml` | ❌ BRAK | 0 B | Brak głównego kanału RSS 2.0 / Atom ekosystemu Christian Culture. |
| `/news/feed.xml` | ❌ BRAK | 0 B | Brak dedykowanego kanału RSS 2.0 dla portalu CCN News. |
| `/sitemaps/news.xml` | ❌ BRAK | 0 B | Brak dedykowanej mapy artykułów CCN News. |
| `/sitemaps/news-google.xml` | ❌ BRAK | 0 B | Brak mapy Google News (`xmlns:news`) filtrowanej do publikacji z ostatnich 2 dni (48h). |
| `/sitemaps/akademia.xml` | ❌ BRAK | 0 B | Brak mapy lekcji Akademii Biblijnej i Kursu Codziennego. |
| `/sitemaps/biblia.xml` | ❌ BRAK | 0 B | Brak mapy zasobów biblijnych (`MojaBiblia`, przekłady, księgi). |
| `/sitemaps/muzyka.xml` | ❌ BRAK | 0 B | Brak mapy muzycznej (`BiblijneUwielbienie`, `Player`, `Music`). |
| `/sitemaps/video.xml` | ❌ BRAK | 0 B | Brak mapy wideo (`VOD`, wykłady wideo z rozszerzeniem `video:video`). |
| `/sitemaps/pages.xml` | ❌ BRAK | 0 B | Brak mapy głównych stron i portali tematycznych. |
| `/sitemaps/en.xml` | ❌ BRAK | 0 B | Brak mapy stron anglojęzycznych (`/Global/`) z dwustronnym `hreflang`. |

---

## 3. Wykryte Niezgodności w Metadanych, Canonical i Schema.org JSON-LD

1. **`mainEntityOfPage` w artykułach CCN (`98` plików kanonicznych w `news/`):**
   - Generator `scripts/build-ccn-static-pages.mjs` zapisywał `"mainEntityOfPage": "https://polskieradio.cc/news/..."` jako zwykły łańcuch znaków zamiast strukturalnego obiektu wymaganego w Sekcji 4 Standardu:
     `{"@type": "WebPage", "@id": "https://polskieradio.cc/news/..."}`.
2. **Błędny adres URL profilu autorskiego w JSON-LD dla artykułów Wioletty Rogowskiej (`18` plików w `news/`):**
   - W `scripts/build-ccn-static-pages.mjs` (linia 100) pole `author.url` było zahardkodowane jako `https://polskieradio.cc/lumina.cezaryrgowski.html` nawet wtedy, gdy autorem artykułu jest **Wioletta Rogowska** (powinno wskazywać na `https://polskieradio.cc/lumina.wiolettarogowska.html`).
3. **Brak odnośników do Polityki Redakcyjnej i Korekt w JSON-LD oraz `<head>` artykułów:**
   - Choć strona `/polityka-redakcyjna` (`polityka-redakcyjna.html`) istnieje, artykuły nie deklarują w JSON-LD `publishingPrinciples` ani `correctionsPolicy`, ani nie posiadają tagu `<link rel="alternate" type="application/rss+xml">` wskazującego na `/news/feed.xml`.
4. **Brak danych strukturalnych `LearningResource` na части lekcji Akademii (`akademia/apokalipsa/lekcja-*.html`):**
   - Strony lekcji Apokalipsy nie posiadały osadzonego bloku JSON-LD `LearningResource`.
5. **Pliki robocze / archiwalne śledzone w Git bez `noindex` lub wykluczenia z mapy:**
   - Pliki `old_zapolske.html`, `test.html`, `mockups/*`, `content-registry.html`, `bank-tresci.html` nie mogą nigdy trafiać do publicznych map witryn (`sitemaps/*.xml`) ani do kolejki `IndexNow`.
6. **Stan integracji zewnętrznych (Search Console / Bing Webmaster Tools / IndexNow):**
   - Brak skonfigurowanego modułu kolejki `IndexNow` z walidacją klucza, retry i logowaniem statusów (`opublikowane ≠ zgłoszone ≠ odkryte ≠ zaindeksowane`).
   - Brak prywatnego panelu monitoringu `CCN SEO CONTROL` (`admin/ccn-seo-control.html`).

---

## 4. Plan Wykonawczy Etapów 2–6 (Bez zmian na produkcji przed weryfikacją Claude i zgodą Dowódcy)

- **Etap 2 (`CC SEO ENGINE`):** Utworzenie `scripts/cc-seo-engine.mjs` (walidator Karty Publikacji, generator JSON-LD dla wszystkich 11 typów Schema.org, obsługa `lang`/`hreflang`, rejestr treści `data/cc-seo-registry.json`) oraz naprawa `scripts/build-ccn-static-pages.mjs`.
- **Etap 3 (`Sygnały odkrywania`):** Utworzenie `scripts/build-cc-discovery-signals.mjs` generującego wszystkie 10 map XML (`/sitemap.xml` + 9 plików w `/sitemaps/*.xml`, w tym 48-godzinny `/sitemaps/news-google.xml`) oraz 2 kanały RSS (`/feed.xml`, `/news/feed.xml`), a także modułu `scripts/cc-indexnow.mjs` z kolejką i logami.
- **Etap 4 (`Wyszukiwarki AI`):** Aktualizacja `/robots.txt` (rozróżnienie `OAI-SearchBot` / `PerplexityBot` od botów treningowych, ochrona prywatnych ścieżek LUMINA) oraz jawne linkowanie polityki redakcyjnej i korekt.
- **Etap 5 (`CCN SEO CONTROL`):** Utworzenie prywatnego panelu `admin/ccn-seo-control.html` (`noindex, nofollow`) opartego w 100% na rzeczywistych danych z `data/cc-seo-control-state.json`.
- **Etap 6 (`Testy i Kontrola Jakości`):** Utworzenie zestawu testów `scripts/ccn-global-seo-2026.test.mjs` oraz uruchomienie pełnej baterii regresyjnej.
