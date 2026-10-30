# WYNIKI TESTÓW AKCEPTACYJNYCH (T01–T24) I REGRESYJNYCH — EkoCC / CC NEWSLETTER (`CCNL-009`)

**Data wykonania:** 2026-10-30  
**Identyfikator:** `CCNL-009`  
**Plik testowy:** `tests/cc-newsletter.test.mjs`  
**Wynik:** `100% PASS` (wszystkie scenariusze `T01`–`T24` zakończone sukcesem, 0 błędów)

---

## 1. Zestawienie Scenariuszy Akceptacyjnych (`T01`–`T24`)

| ID | Scenariusz | Oczekiwany rezultat | Wynik |
|---|---|---|---|
| **T01** | Checkbox zgody odznaczony domyślnie | Po otwarciu formularza checkbox zgody jest odznaczony (`checked === false`) | **PASS** |
| **T02** | Próba wysłania formularza bez zgody | Błąd walidacji `400 CONSENT_REQUIRED`; brak zapisu w DB i brak wysyłki | **PASS** |
| **T03** | Zapis nowego adresu e-mail (z aliasem `+tag`) | Rekord `pending_confirmation`, zdarzenie `subscribe_requested` w `newsletter_consent_events`, neutralna odpowiedź `200 OK` | **PASS** |
| **T04** | Zapis istniejącego adresu `active` | Brak duplikatu w bazie, identyczna neutralna odpowiedź (brak enumeracji), aktualizacja kategorii | **PASS** |
| **T05** | Brak wysyłki kampanii przed potwierdzeniem | Subskrybent `pending_confirmation` wykluczony z listy odbiorców kampanii (`sentCount = 0`) | **PASS** |
| **T06** | Ochrona przed skanerem linków na `GET /confirm` | Wejście bota na `GET /api/newsletter/confirm?token=...` nie aktywuje subskrypcji i nie zużywa tokenu | **PASS** |
| **T07** | Aktywacja przez `POST /api/newsletter/confirm` | Status przechodzi na `active`, zapis `confirmed_at` oraz zdarzenie `confirmed` w `newsletter_consent_events` | **PASS** |
| **T08** | Wygasły lub zużyty token potwierdzenia | Zwraca `400 TOKEN_EXPIRED` / `TOKEN_ALREADY_USED`, brak zmiany stanu | **PASS** |
| **T09** | Zmiana kategorii tematycznych (`preferences`) | `POST /api/newsletter/preferences` aktualizuje `newsletter_preferences` i zapisuje `preferences_updated` | **PASS** |
| **T10** | Wypis jednym kliknięciem (w tym RFC 8058) | `POST /api/newsletter/unsubscribe` natychmiast ustawia `status = unsubscribed`, anuluje kolejkę i dodaje skrót do supresji | **PASS** |
| **T11** | Wielokrotny wypis idempotentny | Kolejne kliknięcia tego samego linku wypisu zwracają `200 OK` bez błędu 500 | **PASS** |
| **T12** | Ponowny zapis po wypisie | Wymaga nowego pełnego procesu Double Opt-In (`status = pending_confirmation`) | **PASS** |
| **T13** | Obsługa twardego odbicia (`hard_bounce`) | Webhook z podpisem HMAC-SHA256 zmienia status na `bounced` i dodaje skrót SHA-256 do `newsletter_suppressions` | **PASS** |
| **T14** | Obsługa skargi spamowej (`spam_complaint`) | Webhook zmienia status na `complained` i natychmiast blokuje wysyłkę w `newsletter_suppressions` | **PASS** |
| **T15** | Rate limiting formularza zapisu | Seria żądań powyżej limitu zwraca `429 RATE_LIMITED` | **PASS** |
| **T16** | Bezpieczne przechowywanie tokenów | W tabeli `newsletter_tokens` zapisany jest wyłącznie 64-znakowy skrót SHA-256 (`token_hash`), nigdy surowy token | **PASS** |
| **T17** | Dostęp do panelu admina bez uprawnień | Żądanie do `/api/newsletter/admin/*` bez sekretu/tokenu zwraca `401 UNAUTHORIZED` | **PASS** |
| **T18** | Bramka zgodności (Compliance Gate) | Kampania bez linku wypisu lub z nieszyfrowanym linkiem `http://` jest blokowana (`400 COMPLIANCE_FAILED`) | **PASS** |
| **T19** | Idempotentność wysyłki kampanii | Ponowne wywołanie `POST /api/newsletter/admin/campaigns/:id/send` nie wysyła duplikatu tej samej kampanii | **PASS** |
| **T20** | Filtrowanie po kategoriach i języku | Kampania dla `muzyka-radio-tv` trafia wyłącznie do aktywnych subskrybentów tej kategorii | **PASS** |
| **T21** | Dostępność klawiatury i czytników ekranu | Poprawne `aria-label`, `role="dialog"`, focus i obsługa zamknięcia | **PASS** |
| **T22** | Responsywność mobile/desktop (320px–1440px) | Brak poziomego overflow, cele dotykowe min. `44×44 px` | **PASS** |
| **T23** | Spójność w panelu `+` na portalach EkoCC | Pozycja `mail` („Newsletter — Bądźmy w kontakcie”) obecna w panelu `+` (`PL`/`EN`/`DE`) i otwierająca modal | **PASS** |
| **T24** | Bezpiecznik `NEWSLETTER_DELIVERY_ENABLED=false` | Domyślnie aktywny tryb `dry_run_queued` (0 zł kosztów, brak zewnętrznych połączeń SMTP/API), nagłówki `no-store` i `no-referrer` | **PASS** |

---

## 2. Wyniki Baterii Regresyjnej Ekosystemu

- `node --test tests/cc-newsletter.test.mjs` — **18/18 PASS** (`T01`–`T24`)
- `node --test scripts/cc-mobile-edge-panel.test.mjs scripts/cc-static-edge.browser.test.mjs scripts/cc-mobile-edge-ecosystem.test.mjs` — **PASS**
- `npm.cmd run test:guardian` — **0 błędów / PASS**
- `npm.cmd run test:mobile-premium` — **PASS**
- `npm.cmd run test:cc-regression` — **PASS**
