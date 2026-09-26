# CC GLOBAL 2030 — RAPORT IMPLEMENTACYJNY FAZY 6A
## FOLLOW THE SUN 24/7 — SHADOW SCHEDULER

**Status operacyjny:** PHASE 6A — FOLLOW THE SUN SHADOW READY  
**Data realizacji:** 2026-09-26  
**Source Baseline:** `9d5207d`  
**Runtime Code SHA:** `fc360ba`  
**Rollback Baseline:** `9d5207d` (Gate 5.6)  
**Long-term Rollback Baseline:** `7e849c3` (Phase 3 Production Baseline)  
**Global Autopublish:** `OFF` (`automationOff = true`)  
**Follow the Sun Engine:** `SIMULATION ONLY` (`simulationMode = true`, `followTheSunEnabled = false`)  
**Router Mode:** `CONTROLLED_ACTIVE` (Levels 1–4 aktywne, Levels 5–6 sugestie)  
**Status Zgodności ze Strażnikiem Kodu:** `0 NARUSZEŃ` (90 plików HTML, 144 pliki JS)  
**Status Testów Regresyjnych:** `226 / 226 ZALICZONYCH (100% PASS)`  

---

### 1. MISJA I ZASADA NADRZĘDNA FAZY 6A

Zgodnie z Rozkazem Operacyjnym Fazy 6A, misją modułu **Follow the Sun 24/7** jest odpowiedź na strategiczne pytanie:
> **„KIEDY zatwierdzona treść Christian Culture powinna zostać zaproponowana do emisji w poszczególnych regionach świata?”**

System operuje w trybie **SCHEDULING INTELLIGENCE**, a nie **AUTONOMOUS PUBLISHING**.  
Zasada nadrzędna: **CZAS LOKALNY ODBIORCY, NIE CZAS SERWERA**.

Każda propozycja emisyjna powstaje w oparciu o strefy czasowe IANA, bez sztywnych offsetów (`UTC+1`, `UTC-5`) i bez zewnętrznych płatnych API.

---

### 2. ARCHITEKTURA PRZEPŁYWU DANYCH

```
┌────────────────────────────────────────────────────────┐
│               APPROVED CONTENT (Content Core)          │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│            LANGUAGE VARIANT (np. PL, EN)               │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│       TARGET AUDIENCE WINDOW (MORNING, EVENING...)     │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│         TIMEZONE ENGINE (Standard IANA, DST Safe)      │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│       PLATFORM CAPABILITY (YouTube, Lumina, WWW...)    │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│          RIGHTS CHECK (Rights Gate & Approval)         │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│       QUOTA / HEALTH CHECK (Incident Registry)         │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│             SHADOW SCHEDULE (Simulated Slot)           │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│         MISSION CONTROL (Prywatny Pulpit Dowódcy)      │
└────────────────────────────────────────────────────────┘
                            │
                     ⛔ HARD STOP ⛔
   (Żaden Shadow Schedule nie uruchamia Distribution Engine)
```

---

### 3. REJESTR RYNKÓW DOCELOWYCH (TARGET MARKET REGISTRY — WAVE 1)

Rynek docelowy opisuje **obszar emisji i strefę czasową odbiorców**, a NIE historię lokalizacji konkretnego użytkownika (*Zero profilowania ludzi*).

| Market ID | Kraj / Nazwa | Kod Regionu | Strefa IANA | Preferowane Języki | Tryb Produkcyjny | Fala |
|:---|:---|:---|:---|:---|:---|:---:|
| `PL` | Polska | `PL` | `Europe/Warsaw` | `pl-PL`, `pl` | `false` (Shadow Only) | Wave 1 |
| `GB` | Wielka Brytania | `GB` | `Europe/London` | `en-GB`, `en` | `false` (Shadow Only) | Wave 1 |
| `US_EAST` | USA Wschód | `US-NY` | `America/New_York` | `en-US`, `en`, `es` | `false` (Shadow Only) | Wave 1 |
| `US_WEST` | USA Zachód | `US-CA` | `America/Los_Angeles` | `en-US`, `en`, `es` | `false` (Shadow Only) | Wave 1 |
| `ES` | Hiszpania | `ES` | `Europe/Madrid` | `es-ES`, `es` | `false` (Shadow Only) | Wave 1 |
| `MX` | Meksyk | `MX` | `America/Mexico_City` | `es-MX`, `es` | `false` (Shadow Only) | Wave 1 |
| `BR` | Brazylia | `BR-SP` | `America/Sao_Paulo` | `pt-BR`, `pt` | `false` (Shadow Only) | Wave 1 |

---

### 4. TIMEZONE ENGINE & OBSŁUGA DST (DAYLIGHT SAVING TIME)

- **Standard IANA:** Przyjmowane są wyłącznie oficjalne identyfikatory stref czasowych (`Europe/Warsaw`, `America/New_York` itp.). Odrzucane są skróty (`EST`, `PST`), pseudonazwy (`Poland`), twarde offsety (`UTC+1`) oraz próby injection (`<script>`, `../../`).
- **Dynamiczna obsługa DST:** Realizowana w 100% w runtime Node.js / `Intl.DateTimeFormat` bez zewnętrznych bibliotek i bez ręcznych tabel zmian czasu.
- **DST Edge Cases:**
  - *Spring Forward Gap (nieistniejąca godzina lokalna, np. 02:30 w marcu):* Wykrywana automatycznie (`wasNonexistentGap = true`) i wyrównywana deterministycznie do pierwszej ważnej godziny po przeskoku (03:00 / 03:30) bez generowania NaN ani błędów daty.
  - *Fall Back Overlap (powtórzona godzina lokalna, np. 02:30 w październiku):* Wykrywana automatycznie (`wasRepeatedOverlap = true`) i rozwiązywana deterministycznie (wybór wcześniejszego wystąpienia UTC), co wyklucza duplikację slotu.
- **Midnight Crossing (Przejście przez północ):** Okna typu `22:00–01:00` poprawnie kalkulują datę i czas UTC zakończenia w kolejnej dobie.
- **Granica roku i rok przestępny:** Przejście `31 XII -> 1 I` oraz `28 II -> 29 II -> 1 III` w pełni zweryfikowane testami jednostkowymi.

---

### 5. PROFILE CZASOWE TREŚCI I DETERMINISTYCZNE REGUŁY

| Profil Treści | Opis | Domyślne Okno Lokalne | Czas Preferowany | Scheduling Basis | Status w Fazie 6A |
|:---|:---|:---:|:---:|:---|:---|
| `MORNING` | Poranne rozważanie / inspiracja | 06:00 – 09:00 | 07:00 | `OPERATOR_RULE` | `SIMULATED` |
| `EVENING` | Wieczorny psalm / modlitwa | 18:00 – 21:00 | 19:00 | `OPERATOR_RULE` | `SIMULATED` |
| `EVERGREEN` | Treść ponadczasowa | 14:00 – 18:00 | 16:00 | `OPERATOR_RULE` | `SIMULATED` |
| `FIXED_TIME` | Stała godzina (ramówka radiowa) | Niezmienne | `fixedTime` | `OPERATOR_RULE` | `SIMULATED` (Brak przesunięć) |
| `SABBATH` | Treść szabatowa | Wg zachodu słońca | Zachód słońca | `ASTRONOMICAL` | `SUNSET_DATA_REQUIRED` (Brak zgadywania) |
| `BREAKING` | Wiadomość pilna | Wymaga człowieka | Manual | `OPERATOR_RULE` | `OPERATOR_REVIEW_REQUIRED` |
| `EVENT` | Wydarzenie na żywo | Zdefiniowane | Zdefiniowany | `OPERATOR_RULE` | `SIMULATED` |

#### Sabbath Safe Mode (Dyrektywy 23–26, 76)
W przypadku braku zweryfikowanego źródła astronomicznego zachodu słońca dla danej strefy czasowej, silnik zwraca status **`SUNSET_DATA_REQUIRED`**. Zabronione jest zgadywanie, uśrednianie lub używanie stałej godziny zegarowej dla szabatu.

#### "WHY THIS TIME?" (Wyjaśnialność i brak AI Black Box)
Każda propozycja posiada deterministyczne, audytowalne uzasadnienie:
```text
19:00 Europe/Warsaw
Basis: OPERATOR_RULE
Rule: EVENING_DEVOTIONAL_WINDOW
Data optimization: NOT USED (Zero fake AI optimal time)
```

---

### 6. PANCERNE BRAMKI BEZPIECZEŃSTWA (POLICY & SECURITY GATES)

1. **Content & Approval Gate:**  
   Treść i wariant MUSZĄ posiadać status `APPROVED` lub `ORIGINAL`. Warianty w statusie `REVIEW_REQUIRED` (np. hiszpański i portugalski kandydat AI dla `CC-2026-000001`) otrzymują bezwzględnie status **`BLOCKED_BY_APPROVAL`**.
2. **Rights Gate:**  
   Weryfikacja praw autorskich do tekstu, obrazu i audio. W przypadku audycji radiowych brak praw do audio skutkuje statusem **`BLOCKED_BY_RIGHTS`**.
3. **Platform Availability Gate:**  
   Wyłączona platforma (`FACEBOOK: DISABLED`) generuje status **`PLATFORM_UNAVAILABLE`**.
4. **Collision Guard:**  
   Wykrycie nakładających się slotów czasowych na tej samej platformie i tym samym kanale generuje status **`COLLISION`** z pełnymi szczegółami konfliktu (nie jest rozwiązywane autonomicznie).
5. **Content Fatigue Guard:**  
   Wykrywa ponowną propozycję tej samej treści na danym kanale w konfigurowalnym oknie (domyślnie 24h), wystawiając ostrzeżenie `CONTENT_FATIGUE_WARNING`.
6. **Distribution Firewall (Kluczowa Bariera Bezpieczeństwa):**  
   Silnik `FollowTheSunEngine` nie posiada fizycznych uprawnień ani metod publikacji. Wywołanie którejkolwiek z poniższych metod rzuca krytyczny błąd:
   - `publish()` $\rightarrow$ `FOLLOW_THE_SUN_SECURITY_VIOLATION`
   - `enqueueDistribution()` $\rightarrow$ `FOLLOW_THE_SUN_SECURITY_VIOLATION`
   - `schedulePublication()` $\rightarrow$ `FOLLOW_THE_SUN_SECURITY_VIOLATION`
   - `sendWhatsApp()` $\rightarrow$ `FOLLOW_THE_SUN_SECURITY_VIOLATION`
   - `changeRadioSchedule()` $\rightarrow$ `FOLLOW_THE_SUN_SECURITY_VIOLATION`
7. **Kill Switch (`FOLLOW_THE_SUN_OFF`):**  
   Niezależny wyłącznik awaryjny całkowicie blokuje generowanie nowych symulacji i ustawia stan zdrowia na `OFF`.
8. **Zakaz statusu `QUEUED`:**  
   Status `QUEUED` jest w Fazie 6A całkowicie zakazany, aby wykluczyć jakąkolwiek iluzję przekazania do kolejki wykonawczej.

---

### 7. SŁOWNIK ANALITYCZNY CC ANALYTICS DICTIONARY v4

Zgodnie z Dyrektywą 57, słownik v3 pozostał w 100% nienaruszony, a do systemu wprowadzono wersję **`v4`**:
- **`SCHEDULE_SIMULATED`** (`COUNT`, `SUM`, `FIRST_PARTY`) — fakt wyliczenia propozycji slotu w trybie symulacyjnym.
- **`SCHEDULE_COLLISION`** (`COUNT`, `SUM`, `FIRST_PARTY`) — wykrycie nakładających się slotów emisyjnych.
- **`SCHEDULE_BLOCKED`** (`COUNT`, `SUM`, `FIRST_PARTY`) — zablokowanie propozycji przez brak praw, brak akceptacji redakcyjnej lub brak zachodu słońca.

---

### 8. MISSION CONTROL — ROZSZERZENIE PULPITU DOWÓDCY

W plikach `content-registry.html` oraz `js/content-registry.js` wdrożono:
1. **Nagłówek Fazy 6A:** Badge `FAZA 6A: FOLLOW THE SUN` oraz przycisk szybkiego dostępu `Follow the Sun`.
2. **Dedykowaną Zakładkę (`tabFollowTheSun`):**
   - **Global Timeline:** Wspólna 24-godzinna oś czasu synchronizująca czas UTC oraz lokalne godziny dla: UTC, Warszawy, Londynu, Nowego Jorku, Los Angeles, São Paulo i Meksyku.
   - **World View:** Wizualizacja 7 rynków Wave 1 z etykietami `[SHADOW]` i deklaracją braku profilowania odbiorców.
   - **Content Card dla `CC-2026-000001`:** Prezentacja statusu symulacji dla wariantów `pl` (`SIMULATED`), `en` (`SIMULATED` w GB/US_EAST/US_WEST), oraz `es` i `pt-br` (`BLOCKED_BY_APPROVAL`).
   - **Safety & Idempotency Audit:** Licznik kolizji (`0 KOLIZJI`), weryfikacja deterministycznego hasha SHA-256 oraz wskaźnik `Sabbath Safe Mode`.
3. **Responsywność Mobilna:** Układ przetestowany dla szerokości 360px, 390px, 412px, 430px i 768px.
4. **Dostępność bez Koloru:** Etykiety i statusy posiadają jednoznaczne tekstowe oznaczenia klamrowe (np. `[SIMULATED]`, `[BLOCKED_BY_APPROVAL]`, `[SHADOW_HEALTHY]`).

---

### 9. WERYFIKACJA TESTOWA I REGRESYJNA

#### A. Dedykowany Pakiet Testowy Fazy 6A (`scripts/phase6_follow_the_sun_shadow.test.mjs`)
**41 testów / 41 ZALICZONYCH (0 BŁĘDÓW)**:
- Grupa 1: Target Market Registry (4 testy)
- Grupa 2: Timezone Engine & IANA DST Edge Cases (12 testów)
- Grupa 3: Scheduling Rules & Time Profiles (7 testów)
- Grupa 4: Follow the Sun Engine, Gates & Distribution Firewall (12 testów)
- Grupa 5: Multi-Market & Multi-Language E2E Simulations (2 testy)
- Grupa 6: Privacy Guard & CC Analytics Dictionary v4 (2 testy)
- Grupa 7: 100 Deterministycznych Shadow Fixtures & Zero Side Effects (2 testy)

#### B. Dowód Zerowego Efektu Ubocznego (Zero Side Effects)
Po wygenerowaniu 100 deterministycznych scenariuszy:
- `publicationsCreated = 0`
- `distributionJobsCreated = 0`
- `whatsAppMessagesSent = 0`
- `youtubeUploads = 0`
- `radioScheduleChanges = 0`

#### C. Pełna Regresja Ekosystemu (Fazy 1–5 + 6A)
- `phase6_follow_the_sun_shadow.test.mjs`: **41 PASS / 0 FAIL**
- `gate5_6_controlled_activation.test.mjs`: **25 PASS / 0 FAIL**
- `phase5_geo_language_router.test.mjs`: **39 PASS / 0 FAIL**
- `gate4_5_production_acceptance.test.mjs`: **23 PASS / 0 FAIL**
- `phase4_global_observer.test.mjs`: **25 PASS / 0 FAIL**
- `gate3_5_real_distribution.test.mjs`: **17 PASS / 0 FAIL**
- `phase3a_distribution_engine.test.mjs`: **13 PASS / 0 FAIL**
- `phase2_5_security_and_provenance.test.mjs`: **12 PASS / 0 FAIL**
- `language-factory-regression.test.mjs`: **10 PASS / 0 FAIL**
- `content-core-regression.test.mjs`: **8 PASS / 0 FAIL**
- `verify_live_analytics_rules_access.mjs`: **13 PASS / 0 FAIL**
- `straznik-kodu-check.js`: **0 naruszeń na 90 plikach HTML i 144 plikach JS**
- Ochrona Działających Kanałów Nadawczych (`cctv24-worship.html` itp.): **0 linii zmodyfikowanych (ZASADA PANCERNA ZACHOWANA)**

---

### 10. ZNANE OGRANICZENIA I STATUS KOŃCOWY

1. **Wave 1 Disabled:** Wszystkie 7 rynków docelowych posiada flagę `enabled = false` i operuje wyłącznie w trybie symulacji.
2. **Sabbath Sunset Data:** Silnik nie wyznacza godzin szabatowych bez dostarczenia autoryzowanych danych zachodu słońca.
3. **Breaking Content:** Wymaga wyłącznej dyspozycji manualnej operatora (`OPERATOR_REVIEW_REQUIRED`).
4. **Hard Stop:** Faza 6A zatrzymuje się na etapie lokalnego raportu i zapisu commitu `fc360ba`. Wdrożenie produkcyjne schedulera, podłączenie rzeczywistych zagregowanych danych Observera oraz aktywna linia czasu Mission Control podlegają procedurze **Production Gate 6.5**.

**Commit wdrożeniowy Fazy 6A:** `fc360ba`  
**Status końcowy:** `PHASE 6A — FOLLOW THE SUN SHADOW READY`
