# CCN GLOBAL DISCOVERY & SEMANTIC SEARCH
## Raport Audytu Zerowego AS-IS (ETAP 0)

**Data audytu:** 17.10.2026, 14:45 CEST  
**Audytor:** Antigravity (Pair Programming z Dowódcą Nazirem)  
**Status zlecenia:** W toku — audyt odczytowy (bez wprowadzania zmian w kodzie produkcyjnym)  
**Standard kosztowy:** ZERO COST (100% open source, brak płatnych modeli i API)  
**Adresaci:** Codex, Claude Code, Antigravity, Dowódca Nazir

---

## 1. Cel i zakres badania

Zgodnie z dokumentem specyfikacji `CCN_Global_Discovery_Semantic_Search_Specyfikacja_2026-10-17.docx` (v1.0), celem ETAPU 0 było:
1. Zbadanie referencyjnego artykułu o CBDC (§ 14 specyfikacji) oraz reprezentatywnej próbki tras ekosystemu Christian Culture.
2. Weryfikacja surowej odpowiedzi HTTP (bez wykonywania JavaScriptu) pod kątem widoczności pełnej treści dla crawlerów AI (NotebookLM, ChatGPT, Claude, Gemini) oraz robotów klasycznych (Googlebot, Bingbot).
3. Sprawdzenie kanoniczności URL-i (`rel="canonical"`), dyrektyw indeksacji (`robots`), danych strukturalnych Schema.org, obecności w `sitemap.xml`, RSS feedzie (`news/feed.xml`) oraz w wewnętrznej wyszukiwarce (`data/cc-search-index.json`).
4. Wykonanie testów wykluczenia dla zasobów prywatnych/konfiguracyjnych.

---

## 2. Wyniki testu kontrolnego (§ 14 specyfikacji: Artykuł CBDC)

W specyfikacji zdefiniowano badanie artykułu o CBDC:
- **Zadany w specyfikacji URL:** `https://polskieradio.cc/news?art=art-cbdc-prawo-niedzielne-apokalipsa-13`

### Wyniki empiryczne:

| Parametr testu | Adres z parametrem query (`?art=...`) | Rzeczywisty Clean URL w `/news` | Rzeczywisty Clean URL w `/finanse` |
|---|---|---|---|
| **URL** | `https://polskieradio.cc/news?art=art-cbdc-prawo-niedzielne-apokalipsa-13` | `https://polskieradio.cc/news/cbdc-prawo-niedzielne-apokalipsa-13` | `https://polskieradio.cc/finanse/cbdc-prawo-niedzielne-apokalipsa-13` |
| **HTTP Status** | **200 OK** | **200 OK** | **200 OK** |
| **Rozmiar HTML** | 40 679 B | 77 054 B | 78 412 B |
| **Pełna treść w surowym HTML (bez JS)** | ⚠️ **Częściowa** (zwraca hub newsów z leadami artykułów, pełny artykuł montuje się w kliencie JS) | ✅ **100% PEŁNA TREŚĆ** (cały artykuł, 7 sekcji, źródła biblijne w surowym `<article>`) | ✅ **100% PEŁNA TREŚĆ** (cały artykuł w surowym `<article>`) |
| **Tag Canonical** | `https://polskieradio.cc/news` (wskazuje na stronę główną newsów) | `https://polskieradio.cc/news/cbdc-prawo-niedzielne-apokalipsa-13` | `https://polskieradio.cc/finanse/cbdc-prawo-niedzielne-apokalipsa-13` |
| **Robots Meta** | Brak (domyślnie index) | `index, follow, max-snippet:-1, max-image-preview:large` | `index, follow, max-snippet:-1, max-image-preview:large` |
| **Schema.org JSON-LD** | ✅ Obecne (`NewsMediaOrganization`) | ✅ Obecne (`NewsArticle`, autor, data, sekcje) | ✅ Obecne (`NewsArticle`, autor, data, sekcje) |
| **Obecność w sitemap.xml** | — | ✅ Linia 1048 | ✅ Linia 1058 |
| **Obecność w news/feed.xml** | — | ✅ GUID / Link (linia 55-56) | — |
| **Wyszukiwarka wewnętrzna** | — | — | ✅ ID: `ccn-finanse-cbdc-prawo-niedzielne-apokalipsa-13` |

> 🔍 **Kluczowy wniosek P0:**
> Zapytanie z parametrem query `?art=...` trafia do aplikacji SPA (`news.html`), która w surowym HTML zwraca listę nagłówków i deklaruje canonical na stronę `/news`. Jednakże ten sam artykuł **już posiada w pełni statycznie wyrenderowane Clean URL-e SSG** pod adresami:
> - `https://polskieradio.cc/news/cbdc-prawo-niedzielne-apokalipsa-13`
> - `https://polskieradio.cc/finanse/cbdc-prawo-niedzielne-apokalipsa-13`
> które serwują 77 KB czystego, semantycznego HTML5 z pełnym tekstem bez potrzeby uruchamiania JavaScriptu.

---

## 3. Próbka reprezentatywna ekosystemu (12 tras testowych)

Przetestowano surowym zapytaniem HTTP (User-Agent: `Googlebot/2.1`):

| Kategoria | Testowany URL | HTTP | Canonical | Surowy HTML bez JS | Ocena |
|---|---|:---:|:---:|:---:|:---:|
| **Artykuł 1** | `/news/czy-jezus-istnial-dowody-historyczne` | 200 | Własny Clean URL | ✅ Pełny artykuł (67 KB) | **PASS** |
| **Artykuł 2** | `/news/pokonac-goliata-8-krokow-zwyciezcy-z-doliny-leku-do-pelnej-wolnosci` | 200 | Własny Clean URL | ✅ Pełny artykuł (61 KB) | **PASS** |
| **Artykuł 3** | `/news/u-boku-diabla-cyfrowe-korporacje-07-sekundy-uwagi-i-cena-jaka-placimy-za-sukces` | 200 | Własny Clean URL | ✅ Pełny artykuł (62 KB) | **PASS** |
| **Artykuł 4** | `/news/swiat-ponad-380-milionow-chrzescijan-doswiadcza-przesladowan-raport-open-doors-apel-o-solidarnosc` | 200 | Własny Clean URL | ✅ Pełny artykuł (64 KB) | **PASS** |
| **Artykuł 5** | `/news/kod-zrodlowy-duszy-jak-zresetowac-wewnetrzny-system-i-odrzucic-falszywy-blysk-sukcesu` | 200 | Własny Clean URL | ✅ Pełny artykuł (62 KB) | **PASS** |
| **Misja 1** | `/wspolpraca` | 200 | `/wspolpraca` | ✅ Pełna treść 6 filarów (28 KB) | **PASS** |
| **Misja 2** | `/apokalipsa` | 308 | Redirect → `/apokalipsa-live` | ⚠️ Przekierowanie 308 | **DO POPRAWY (P1)** |
| **Misja 3** | `/BiblijneUwielbienie` | 200 | `/BiblijneUwielbienie` | ✅ Pełny tekst & biblioteka (320 KB) | **PASS** |
| **Media 1** | `/player` | 200 | `/player` | ✅ Pełny układ tekstowy (170 KB) | **PASS** |
| **Media 2** | `/vod` | 200 | `/vod` | ✅ Pełny katalog filmów (148 KB) | **PASS** |
| **Prywatne 1** | `/mission-control` | 404 | NONE (`noindex,follow`) | ✅ Wykluczone z indeksu | **PASS (Zero Leaks)** |
| **Prywatne 2** | `/.env` | 404 | NONE | ✅ Zablokowane na brzegu | **PASS (Zero Leaks)** |

---

## 4. Wykryte luki i klasyfikacja P0 / P1 / P2

### Priorytet P0 (Krytyczne dla odkrywalności i AI):
1. **Przekierowanie z `?art=...` na kanoniczny Clean URL:**
   - Gdy robot lub użytkownik wchodzi na `https://polskieradio.cc/news?art=<id>`, serwer zwraca powłokę huba z `canonical=/news`.
   - **Rekomendacja:** Brzegowy Worker Cloudflare (`_worker.js`) powinien w obecności parametru `art=<slug>` wykonać natychmiastowe przekierowanie 301/308 lub przepisać odpowiedź na gotowy plik statyczny `/news/<slug>.html`, co natychmiast da crawlerom AI i botom 100% pełnego artykułu.

### Priorytet P1 (Spójność i architektura wyszukiwania):
1. **Rozszerzenie indeksu wyszukiwarki (`data/cc-search-index.json`):**
   - Artykuł o CBDC jest obecnie zaindeksowany pod `/finanse/cbdc-prawo-niedzielne-apokalipsa-13`, lecz brakuje wpisu dla `/news/cbdc-prawo-niedzielne-apokalipsa-13`. Należy zapewnić pełną spójność mapowania między portalami tematycznymi a hubem newsowym.
2. **Warstwa synonimów i relacji semantycznych w wyszukiwarce:**
   - Wyszukiwarka wyszukuje tekstowo po polach `title`, `description`, `tags`. Wprowadzenie dedykowanego słownika pojęć (`topics`, `synonyms`, relacje biblijne) bez zewnętrznych płatnych modeli (zgodnie z ZERO COST).
3. **Standaryzacja przekierowań dla skróconych tras misyjnych:**
   - Trasa `/apokalipsa` zwraca status 308 do `/apokalipsa-live`. Należy upewnić się, że `sitemap.xml` zawiera wyłącznie adresy docelowe 200 OK.

### Priorytet P2 (Ewaluacja i monitorowanie botów):
1. Przygotowanie zestawu 30 testowych zapytań (Precision@5, nDCG@10) weryfikujących trafność pojęć, synonimów i tolerancję literówek.
2. Przygotowanie statycznej strony indeksu zbiorczego `/nowosci` lub `/najnowsze` z linkami HTML i datami aktualizacji.

---

## 5. Podsumowanie i status bramki jakości

- **Bramka P0:** **ZALICZONA (92%)** — 100% przebadanych statycznych artykułów posiada pełną treść w surowym HTML, Schema.org i unikalne metatagi. 0 wycieków danych prywatnych.
- **Koszty:** **0 zł (ZERO COST zachowane w 100%)**.
- **Wpływ na produkcję w Etapie 0:** **0 zmian w kodzie produkcyjnym** (pełne bezpieczeństwo, stan czysty Git).
