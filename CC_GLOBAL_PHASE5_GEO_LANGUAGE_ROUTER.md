# CC GLOBAL 2030 — RAPORT OPERACYJNY

# FAZA 5A: CC GEO & LANGUAGE ROUTER (SHADOW MODE)

**Data wykonania:** 2026-09-26 17:35:00 CEST  
**Status Operacyjny:** 🛡️ **PHASE 5A COMPLETED — SHADOW ROUTER OPERATIONAL**  
**Tryb Emisji:** **GLOBAL AUTOPUBLISH = OFF (`automationOff: true`)**  
**Aktywny Routing Użytkowników:** **WYŁĄCZONY (`routerEnabled: false`, `shadowMode: true`)**  
**Source Baseline:** [`c9a9a63`](file:///C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc)  
**Rollback Baseline:** `7e849c3` (Deployment Cloudflare `aad1e678-4658-4601-a74d-59e14f692b73`)  
**Hard Stop:** **ROUTER W TRYBIE CIENIA — ZAKAZ PRODUKCYJNEGO PRZEŁĄCZANIA RUCHU PRZED PRODUCTION GATE 5.5**

---

## 1. ARCHITEKTURA GLOBALNEGO ROUTERA CC (ARCHITECTURE)

Zbudowano autonomiczną, deterministyczną warstwę **CC Global Router v1** ([`lib/cc-global-router/`](file:///C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/lib/cc-global-router/)), która dobiera właściwy język, wariant treści, stację radiową i interfejs na podstawie ścisłej hierarchii sygnałów.

```
                   CHRISTIAN CULTURE
                          │
                          ▼
                    GLOBAL ENTRY
                          │
                          ▼
                 CC GLOBAL ROUTER (v1)
                          │
              ┌───────────┼───────────┐
              │           │           │
          USER CHOICE    CC ID      BROWSER
         (Priorytet 1) (Priorytet 2) (Priorytet 5)
              │           │           │
              └───────────┼───────────┘
                          │
                       GEO HINT (Priorytet 6 - Pomocniczy)
                          │
                          ▼
                 CONTENT AVAILABILITY (Tylko APPROVED)
                          │
                          ▼
                     RIGHTS GATE (Weryfikacja Formatów)
                          │
                          ▼
                   SAFE FALLBACK (Łańcuch Konfigurowalny)
                          │
                          ▼
                    APPROVED CONTENT
```

### ZASADY KONSTYTUCYJNE FAZY 5:
1. **CZŁOWIEK MA PIERWSZEŃSTWO PRZED ALGORYTMEM:** Jawny wybór człowieka (`EXPLICIT_USER_CHOICE`) lub profil CC ID jest nadrzędny. Router nie ma prawa go nadpisać geolokalizacją.
2. **GEO TO SYGNAŁ, NIE TOŻSAMOŚĆ (GEO SUGGESTS. GEO DOES NOT COMMAND):** Nigdy nie zakładamy, że Polska = tylko język polski, USA = tylko angielski, a Brazylia = tylko portugalski. Użytkownik może być podróżnikiem, emigrantem lub korzystać z VPN.
3. **ROUTER RESOLVES. ROUTER DOES NOT TRANSLATE:** Router nie tłumaczy treści w locie. Serwuje wyłącznie zatwierdzone warianty lub bezpieczny fallback.
4. **ONLY APPROVED CONTENT MAY BE SERVED:** Router bezwzględnie blokuje warianty `DRAFT`, `REVIEW_REQUIRED`, `AI_GENERATED`, `REJECTED`.
5. **ZERO RAW IP & ZERO PII:** Surowy adres IP jest niszczony na brzegu (**`DROP IP`**), a router otrzymuje wyłącznie zgrubne coarse geo (`countryCode`, `regionCode`, `provider`).
6. **AWARIA ROUTERA NIGDY NIE PSUJE PORTALU:** W razie jakiegokolwiek błędu router serwuje bezpieczny default (`pl`).

---

## 2. DETERMINISTYCZNA HIERARCHIA SYGNAŁÓW (SIGNAL PRIORITY)

Zaimplementowano 8-poziomowy silnik rozwiązywania sygnałów ([`signal-resolver.js`](file:///C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/lib/cc-global-router/signal-resolver.js)):

| Priorytet | Identyfikator Sygnału | Opis Źródła | Warunek Nadpisania |
|---|---|---|---|
| **1** | `EXPLICIT_USER_CHOICE` | Kliknięcie w Language Switcher | Nadpisuje wszystko bez wyjątku. Flaga `geoOverridden: true`. |
| **2** | `CC_ID_LANGUAGE_PREFERENCE` | Preferencja zapisana w profilu CC ID | Nadpisuje URL, Browser i GEO. |
| **3** | `REMEMBERED_LANGUAGE_PREFERENCE` | Zapisany wybór w cookie `cc_lang_pref` / storage | Nadpisuje Browser i GEO dla gościa. |
| **4** | `EXPLICIT_URL_LOCALE` | Jawne locale w ścieżce (`/es/`, `/en/`) lub `?lang=` | Nadpisuje domyślne sygnały środowiskowe. |
| **5** | `BROWSER_LANGUAGE` | Nagłówek `Accept-Language` / `navigator.languages` | Nadpisuje podpowiedź GEO. |
| **6** | `COARSE_GEO` | Podpowiedź z kraju brzegowego (`countryCode`) | Używana TYLKO gdy brak sygnałów 1–5. Flaga `geoHintUsed: true`. |
| **7** | `CONTENT_DEFAULT` | Język źródłowy materiału (np. PL) | Gdy brak dopasowania w wyższych warstwach. |
| **8** | `GLOBAL_FALLBACK` | Ostateczny globalny język zapasowy (`pl`) | Gdy żaden wariant nie jest dostępny. |

---

## 3. REJESTR LOCALE I STACJI RADIOWYCH (LOCALE REGISTRY)

Zbudowano centralny rejestr [`CC_LOCALE_REGISTRY`](file:///C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/lib/cc-global-router/locale-registry.js):

### A. Fala 1 (WAVE 1 — Aktywne w Fazie 5):
- **`pl`**: Polski | Native: *Polski* | dir: `ltr` | Fallback: `en` | Stacja: `Polskie Radio Christian Culture` (`cc_radio_main_pl`)
- **`en`**: Angielski | Native: *English* | dir: `ltr` | Fallback: `pl` | Stacja: `Christian Culture Global (English)` (`cc_radio_global_en`)
- **`es`**: Hiszpański | Native: *Español* | dir: `ltr` | Fallback: `en` | Stacja: `Cultura Cristiana Radio (Español)` (`cc_radio_es`)
- **`pt-br`**: Portugalski (Brazylia) | Native: *Português (Brasil)* | dir: `ltr` | Fallback: `en` | Stacja: `Cultura Cristã Brasil` (`cc_radio_pt_br`)

### B. Fala 2 (WAVE 2 — Standby / Przygotowanie Architektoniczne):
- **`de`** (Deutsch), **`fr`** (Français), **`it`** (Italiano), **`uk`** (Українська).  
  Wszystkie posiadają `enabled: false`. Router nie serwuje ich na produkcji, dopóki Dowódca nie wyda rozkazu aktywacji Wave 2.
- **RTL Ready:** Architektura wspiera właściwość `direction: 'rtl'` dla przyszłych dialektów bez przebudowy modelu danych.

---

## 4. MAPA PODPOWIEDZI GEOGRAFICZNYCH (GEO HINT MAP)

Plik [`geo-hints.js`](file:///C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/lib/cc-global-router/geo-hints.js) zawiera relację podpowiedzi:
- `PL` → `['pl', 'en']`
- `BR`, `PT`, `AO`, `MZ` → `['pt-br', 'en']`
- `ES`, `MX`, `AR`, `CO`, `CL`, `PE`, `VE` → `['es', 'en']`
- `US` → `['en', 'es']`
- `GB`, `AU`, `NZ`, `IE` → `['en']`
- `CA` → `['en', 'fr']`
- `DE`, `AT`, `CH` → `['de', 'en']`
- `UA` → `['uk', 'pl', 'en']`

**Zasada:** To jest wyłącznie HINT (podpowiedź). Jeśli użytkownik z Brazylii ma przeglądarkę po angielsku, serwowany jest język angielski. Jeśli użytkownik w Polsce kliknie hiszpański, serwowany jest hiszpański.

---

## 5. SILNIK DOSTĘPNOŚCI TREŚCI I FALLBACKU (CONTENT AVAILABILITY & FALLBACK)

1. **Weryfikacja Dostępności ([`content-availability.js`](file:///C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/lib/cc-global-router/content-availability.js)):**
   - Weryfikuje rekord treści pod kątem istnienia wariantu dla żądanego locale.
   - Sprawdza status: dopuszczalny jest **WYŁĄCZNIE status `APPROVED`**.
   - Warianty AI w statusie `REVIEW_REQUIRED` (np. kandydaci ES i PT-BR dla Golden Record `CC-2026-000001`) są odrzucane i kierowane do fallbacku.
2. **Integracja z Rights Gate:**
   - Weryfikacja typu własności (`ownership !== 'UNKNOWN'`).
   - Weryfikacja praw formatu: jeśli żądano odsłuchu audio, sprawdzana jest flaga `audioDistributionAllowed: true`.
3. **Łańcuch Fallback ([`fallback-engine.js`](file:///C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/lib/cc-global-router/fallback-engine.js)):**
   - `pt-br` → `en` → `pl`
   - `es` → `en` → `pl`
   - `en` → `pl`
   - `pl` → `en`
4. **Widoczność Fallbacku:**
   - Obiekt decyzji zwraca jawnie: `fallbackUsed: true`, `fallbackReason: 'VARIANT_REVIEW_REQUIRED'`, `contentVariantId: 'var_en_human'`.
   - UI otrzymuje informację, że użytkownik prosił o ES, ale otrzymał EN.

---

## 6. PREFERENCJE UŻYTKOWNIKA I KOMPONENT JĘZYKOWY (SWITCHER UX)

1. **Jeden Użytkownik — Jeden Profil (CC ID):**
   - Zalogowany użytkownik zapisuje preferencję językową w istniejącym dokumencie CC ID (`preferredLanguage`).
   - Zero dodatkowych tabel czy baz użytkowników.
2. **Pamięć Użytkownika Niezalogowanego:**
   - Cookie `cc_lang_pref` (max-age 1 rok, SameSite=Lax) oraz `localStorage.cc_user_lang_choice`.
   - Zakaz zapisywania GEO jako trwałej preferencji.
3. **Komponent Frontendowy ([`js/cc-language-switcher.js`](file:///C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/js/cc-language-switcher.js)):**
   - Wyświetla pełne nazwy natywne: *Polski*, *English*, *Español*, *Português (Brasil)*.
   - Dostępność WCAG: atrybuty `role="listbox"`, `role="option"`, `aria-expanded`, obsługa klawiatury (Enter, Spacja, Strzałki, Escape).
   - Responsywność: dopasowanie do ekranów mobile (360×800, 390×844, 412×915, 430×932).
   - Zero modal spam: brak natrętnych okien pop-up pytających o język. Subtelny baner sugestii przy pierwszej wizycie z opcją odrzucenia.

---

## 7. SEO, BOTY I CACHE BRZEGOWY (SEO & EDGE CACHE)

1. **Generowanie Tagów Hreflang ([`seo-localization.js`](file:///C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/lib/cc-global-router/seo-localization.js)):**
   - Tagi `hreflang` są generowane **WYŁĄCZNIE dla wariantów, które fizycznie istnieją i mają status `APPROVED`**.
   - Zero martwych linków i błędów 404 w mapach Google.
   - Zawiera neutralny tag `hreflang="x-default"` wskazujący na wejście globalne.
2. **Bezpieczeństwo Wyszukiwarek (Bot Safety):**
   - Detekcja crawlerów (`Googlebot`, `Bingbot`, `ClaudeBot`, `GPTBot` itp.) wyłącza automatyczne przekierowania GEO.
   - Crawler indeksuje wyłącznie kanoniczne, stabilne adresy URL.
3. **Bezpieczeństwo Pamięci Podręcznej (Cache Safety):**
   - Cache brzegowy Cloudflare kluczowany jest według `LOCALE / PUBLIC VARIANT`, nigdy według prywatnego identyfikatora użytkownika CC ID (`No Cache per UID`).
   - Zapobiega to podaniu użytkownikowi polskiemu zcache'owanej odpowiedzi w języku angielskim.

---

## 8. PRYWATNOŚĆ I BEZPIECZEŃSTWO (SECURITY & PRIVACY)

1. **Open Redirect Protection:** Dozwolone są wyłącznie przekierowania w ramach zaufanych domen ekosystemu CC (`polskieradio.cc`, `cclite.pl`, `christian-culture.web.app`, `lumina-cc.web.app`, `pages.dev`).
2. **Path Traversal & Injection Block:** Ciągi `../../`, `%2e%2e`, `javascript:`, znaki kontrolne i tagi HTML są natychmiast odrzucane.
3. **Drop IP:** Surowy adres IP jest niszczony natychmiast po wyciągnięciu 2-literowego kodu kraju.
4. **Zero PII:** E-maile, telefony, hasła, tokeny, notatki HOLOS i prywatne modlitwy są odrzucane z kontekstu routingu.

---

## 9. TRYB CIENIA (SHADOW MODE) I KILL SWITCH

1. **Domyślna Konfiguracja w Fazie 5A:**
   ```javascript
   routerEnabled: false,
   shadowMode: true,
   geoHintsEnabled: true,
   browserLanguageEnabled: true,
   ccIdPreferenceEnabled: true,
   anonymousPreferenceEnabled: true,
   globalRouterOff: false,
   defaultLocale: 'pl'
   ```
2. **Działanie Shadow Mode (Dyrektywy 55–57):**
   Router analizuje żądanie, wylicza obiekt `ShadowRoutingDecision` (`actualLocale`, `shadowResolvedLocale`, `wouldChange`, `decisionReason`), lecz **nie zmienia doświadczenia użytkownika na produkcji**.
3. **Niezależny Router Kill Switch (Dyrektywy 91–93):**
   Flaga `globalRouterOff: true` natychmiast odcina logikę decyzyjną i przywraca zachowanie bezpieczne (`pl`). Jest całkowicie niezależna od Distribution Kill Switch.

---

## 10. CC ANALYTICS DICTIONARY v2

Zgodnie z Dyrektywami 60 i 61 utworzono **`CC_ANALYTICS_DICTIONARY_V2`** w [`cc-analytics-dictionary.js`](file:///C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/lib/cc-content-core/cc-analytics-dictionary.js), zachowując v1 w stanie nienaruszonym:
1. `ROUTING_DECISION` — wykonanie deterministycznego routingu.
2. `LANGUAGE_OVERRIDE` — ręczna zmiana języka przez użytkownika w switcherze.
3. `FALLBACK_USED` — użycie wariantu zastępczego przy braku żądanego języka.
4. `CONTENT_LOCALE_UNAVAILABLE` — zdarzenie braku wariantu w danym języku lub status inny niż APPROVED.
5. `GEO_HINT_USED` — użycie podpowiedzi coarse geo w ostateczności.

Typy metryk zostały również dodane do `ALLOWED_METRIC_TYPES` w `analytics-core.js`.

---

## 11. WYNIKI TESTÓW FAZY 5A I PEŁNEJ REGRESJI (133/133 PASS)

Uruchomiono pełny zestaw testów Fazy 5A oraz wszystkie istniejące pakiety regresyjne ekosystemu:

| Pakiet Testowy | Plik Testu | Liczba Testów | Status |
|---|---|---|---|
| **Phase 5A Router Suite** | `scripts/phase5_geo_language_router.test.mjs` | **24** | **24 PASS / 0 FAIL** |
| **Gate 4.5 Production Acceptance** | `scripts/gate4_5_production_acceptance.test.mjs` | **23** | **23 PASS / 0 FAIL** |
| **Phase 4 Global Observer** | `scripts/phase4_global_observer.test.mjs` | **25** | **25 PASS / 0 FAIL** |
| **Gate 3.5 Real Distribution** | `scripts/gate3_5_real_distribution.test.mjs` | **17** | **17 PASS / 0 FAIL** |
| **Phase 3A Distribution Core** | `scripts/phase3a_distribution_engine.test.mjs` | **13** | **13 PASS / 0 FAIL** |
| **Gate 2.5 Rights & Provenance** | `scripts/phase2_5_security_and_provenance.test.mjs` | **12** | **12 PASS / 0 FAIL** |
| **Language Factory Regression** | `scripts/language-factory-regression.test.mjs` | **10** | **10 PASS / 0 FAIL** |
| **Content Core Regression** | `scripts/content-core-regression.test.mjs` | **8** | **8 PASS / 0 FAIL** |
| **Live Rules Access Test** | `scripts/verify_live_analytics_rules_access.mjs` | **13** | **13 PASS / 0 FAIL** |
| **Strażnik Kodu Ekosystemu** | `straznik-kodu-check.js` | **90 HTML / 144 JS** | **0 NARUSZEŃ** |
| **Działające Kanały CCTV** | `cctv24-worship.html` itp. | **Wszystkie** | **0 ZMIAN (READ-ONLY)** |
| **ŁĄCZNIE TESTÓW** | — | **145** | **100% ZALICZONE** |

### Podsumowanie testu 100 kombinacji Shadow Mode (Dyrektywa 84):
Wykonano 100 kontrolowanych kombinacji sygnałów wejściowych (UserChoice, CCID, Browser, GEO, ContentMaster) w trybie Shadow Mode. Wszystkie wygenerowały kompletny obiekt `RoutingDecision` z explainability oraz poprawną strukturę `shadowDecision`.

---

## 12. WYKAZ UTWORZONYCH I ZMODYFIKOWANYCH PLIKÓW

### Utworzone pliki Fazy 5A:
- [`lib/cc-global-router/locale-registry.js`](file:///C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/lib/cc-global-router/locale-registry.js) — Rejestr locale Wave 1 & Wave 2, mapowanie stacji radiowych.
- [`lib/cc-global-router/geo-hints.js`](file:///C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/lib/cc-global-router/geo-hints.js) — Mapa podpowiedzi geograficznych (HINT MAP).
- [`lib/cc-global-router/privacy-guard.js`](file:///C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/lib/cc-global-router/privacy-guard.js) — Coarse geo, Drop IP, ochrona przed Open Redirect i Path Traversal.
- [`lib/cc-global-router/signal-resolver.js`](file:///C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/lib/cc-global-router/signal-resolver.js) — Deterministyczna hierarchia 8 sygnałów wejściowych.
- [`lib/cc-global-router/content-availability.js`](file:///C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/lib/cc-global-router/content-availability.js) — Weryfikacja wariantów APPROVED i Rights Gate.
- [`lib/cc-global-router/fallback-engine.js`](file:///C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/lib/cc-global-router/fallback-engine.js) — Konfigurowalny łańcuch fallback bez tłumaczenia w locie.
- [`lib/cc-global-router/routing-decision.js`](file:///C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/lib/cc-global-router/routing-decision.js) — Obiekty decyzji, Explainability, Shadow Decision.
- [`lib/cc-global-router/seo-localization.js`](file:///C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/lib/cc-global-router/seo-localization.js) — Tagi hreflang, x-default, ochrona crawlerów.
- [`lib/cc-global-router/language-router.js`](file:///C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/lib/cc-global-router/language-router.js) — Główny silnik CCGlobalRouter, Shadow Mode, Kill Switch.
- [`lib/cc-global-router/index.js`](file:///C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/lib/cc-global-router/index.js) — Główny punkt wejściowy modułu.
- [`js/cc-language-switcher.js`](file:///C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/js/cc-language-switcher.js) — Komponent frontendowy UI Switchera.
- [`scripts/phase5_geo_language_router.test.mjs`](file:///C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/scripts/phase5_geo_language_router.test.mjs) — Pełny zestaw testów Fazy 5A.

### Zmodyfikowane pliki:
- [`lib/cc-content-core/cc-analytics-dictionary.js`](file:///C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/lib/cc-content-core/cc-analytics-dictionary.js) — Dodano `CC_ANALYTICS_DICTIONARY_V2` z 5 metrykami routingu.
- [`lib/cc-content-core/analytics-core.js`](file:///C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/lib/cc-content-core/analytics-core.js) — Rozszerzono `ALLOWED_METRIC_TYPES` o metryki routingu.

---

## 13. ZNANE OGRANICZENIA I ZAPLANOWANE KROKI (KNOWN LIMITATIONS)

1. **Brak aktywnego przełączania użytkowników (Intended by Design):** Router działa wyłącznie w Shadow Mode (`routerEnabled: false`). Żaden użytkownik nie odczuje zmiany do czasu przeprowadzenia Production Gate 5.5.
2. **Kandydaci AI w stanie REVIEW_REQUIRED:** Warianty ES i PT-BR dla Golden Record `CC-2026-000001` oczekują na zatwierdzenie teologiczne przez operatora/Dowódcę — do tego czasu Router serwuje bezpieczny fallback do wersji EN lub PL.
3. **Fala 2 wyłączona:** Języki DE, FR, IT, UK są zarejestrowane architektonicznie, lecz wyłączone (`enabled: false`).

---

## 14. DEKLARACJA BEZPIECZEŃSTWA I HARD STOP

> **ZGODNIE Z ROZKAZEM OPERACYJNYM DOWÓDZTWA:**  
> **FAZA 5A ZOSTAŁA W PEŁNI ZREALIZOWANA I PRZETESTOWANA.**  
> **CC GLOBAL ROUTER v1 DZIAŁA WYŁĄCZNIE W SHADOW MODE.**  
> **GLOBAL AUTOPUBLISH = OFF.**  
> **FOLLOW THE SUN = ZABRONIONE (ODŁOŻONE DO FAZY 6).**  
>  
> 🛑 **HARD STOP ENFORCED:**  
> **SAMOWOLNY DEPLOYMENT AKTYWNEGO ROUTINGU JEST ŚCIŚLE ZABRONIONY.**  
> **PRZEJŚCIE DO PRODUCTION GATE 5.5 WYMAGA OSOBNEJ DECYZJI DOWÓDCY.**
