# ARCHITEKTURA DECYZJI (ADR) — EkoCC / CC NEWSLETTER (`CCNL-003`..`008`)

**Data:** 2026-10-30  
**Status:** Zatwierdzona architektura wdrożeniowa (ZERO COST, Privacy-by-Design, P0)  
**Komponenty:** `migrations/001_cc_newsletter.sql`, `services/cc-newsletter/newsletter-service.js`, `services/cc-newsletter/templates.js`, `_worker.js`, `js/cc-newsletter.js`, `js/cc-mobile-edge.js`, `newsletter.html`

---

## ADR-001: Jedna Centralna Baza Subskrypcji w Cloudflare D1 z Izolacją od Kont Użytkowników

- **Kontekst:** Ekosystem EkoCC składa się z kilkudziesięciu portali i podstron (`/`, `/lumina`, `/news`, `/akademia`, `/mojabiblia`, `/vod`, `/Wioletta`, `/YIS`, `/Global`, `/holos`, `/wyszukiwarka`). Tworzenie osobnych list mailingowych dla każdego portalu utrudniłoby realizację praw RODO (cofnięcie zgody, eksport danych, prawo do usunięcia) oraz globalnej listy supresji.
- **Decyzja:**
  1. Wdrożono **jeden centralny schemat bazy danych D1 (SQLite)** (`migrations/001_cc_newsletter.sql`) składający się z 8 tabel:
     - `newsletter_subscribers`
     - `newsletter_topics`
     - `newsletter_preferences`
     - `newsletter_consent_events`
     - `newsletter_tokens`
     - `newsletter_campaigns`
     - `newsletter_deliveries`
     - `newsletter_suppressions`
  2. Baza subskrybentów newslettera jest **całkowicie odseparowana** od kont Firebase Auth (`lumina-cc`), kontaktów z formularzy pomocy, WhatsApp oraz LUMI KIDS. Żaden użytkownik nie trafia do tabeli `newsletter_subscribers` bez samodzielnego wypełnienia formularza i potwierdzenia linku Double Opt-In.
  3. Worker (`_worker.js`) wiąże bazę przez `env.newsletter_db` (lub w przypadku współdzielonego D1 przez `env.mission_control_db` / `env.milion_db` z wyizolowanymi tabelami `newsletter_*`), a w środowisku lokalnym/testowym bez D1 automatycznie uruchamia w pełni kompatybilny adapter SQLite/D1 w pamięci.

---

## ADR-002: Obowiązkowy Double Opt-In (DOI) Odporny na Skanery Poczty (Safe-GET + Mutating-POST)

- **Kontekst:** Korporacyjne i konsumenckie systemy antyfishingowe (Microsoft Defender SafeLinks, Mimecast, Proofpoint) automatycznie odwiedzają linki `GET` w wiadomościach e-mail. Gdyby samo wejście na `GET /newsletter/confirm?token=...` lub `GET /newsletter/unsubscribe?token=...` zmieniało stan w bazie, skaner aktywowałby lub wypisywał użytkownika bez jego wiedzy.
- **Decyzja:**
  1. **Tokeny:** 256-bitowe losowe tokeny (`crypto.getRandomValues`), kodowane URL-safe Base64. W bazie `newsletter_tokens` przechowywany jest **wyłącznie skrót SHA-256 (`token_hash`)**, czas wygaśnięcia (`expires_at`: 48h dla `confirm`, 30 min dla `manage`, 90 dni dla `unsubscribe`) oraz znacznik jednorazowego użycia (`used_at`).
  2. **Ochrona przed skanerami na `GET`:**
     - `GET /newsletter/confirm?token=...` oraz `GET /api/newsletter/confirm?token=...` wykonują wyłącznie bezstanową weryfikację istnienia i ważności tokenu (`used_at IS NULL AND expires_at > now`), **nie zmieniając stanu subskrybenta ani nie zużywając tokenu**.
     - Dopiero kliknięcie przycisku przez człowieka (lub wywołanie `POST /api/newsletter/confirm` z `{ token }`) zmienia status `pending_confirmation -> active`, zapisuje `confirmed_at`, oznacza `used_at` na tokenie i dopisuje niezmienny rekord `confirmed` w `newsletter_consent_events`.
  3. **Wypis 1-Click (RFC 8058) + Strona Wypisu:**
     - `GET /newsletter/unsubscribe?token=...` wyświetla stronę wypisu i wymaga kliknięcia przycisku wysyłającego `POST /api/newsletter/unsubscribe` (chroniąc przed skanerem `GET`).
     - `POST /api/newsletter/unsubscribe` obsługuje zarówno JSON `{ token }`, jak i nagłówek `List-Unsubscribe-Post: List-Unsubscribe=One-Click` (`application/x-www-form-urlencoded` z `List-Unsubscribe=One-Click`) wymagany przez Gmail / Yahoo / Apple Mail.

---

## ADR-003: Neutralne Odpowiedzi Publicznego API (Ochrona przed Enumeracją Adresów E-mail)

- **Kontekst:** Publiczny formularz zapisu lub zarządzania preferencjami nie może zdradzać osobie postronnej, czy dany adres e-mail znajduje się już w bazie subskrybentów EkoCC.
- **Decyzja:**
  - `POST /api/newsletter/subscribe` oraz `POST /api/newsletter/manage/request-link` dla każdego poprawnego składniowo żądania (z zaznaczoną zgodą i mieszczącego się w limitach rate-limit) zwracają identyczny kod `200 OK` oraz komunikat:
    - PL: *„Jeśli podany adres e-mail może odbierać wiadomości, wysłaliśmy link potwierdzający. Sprawdź skrzynkę i potwierdź zapis.”*
    - EN: *„If the provided email address can receive messages, we have sent a confirmation link. Please check your inbox to confirm.”*
  - W tle serwis podejmuje właściwą akcję:
    - nowy adres → tworzy rekord `pending_confirmation` i wysyła/kolejkuje e-mail DOI,
    - adres `pending_confirmation` → z zachowaniem cooldownu odświeża token i ponawia e-mail DOI,
    - adres `active` → aktualizuje wybrane kategorie lub wysyła bezpieczny link do zarządzania preferencjami bez duplikowania subskrybenta,
    - adres `unsubscribed` → pozwala na ponowny świadomy zapis wyłącznie przez nowy pełny proces DOI (`pending_confirmation`),
    - adres `suppressed` (twarde odbicie / skarga spamowa) → nie wysyła wiadomości i zapisuje próbę w logu audytowym.

---

## ADR-004: Architektura ZERO COST i Bezpiecznik Wysyłki Produkcyjnej (`NEWSLETTER_DELIVERY_ENABLED`)

- **Kontekst:** Dyrektywa L0 bezwzględnie zabrania generowania kosztów bez pisemnej zgody właściciela oraz zabrania używania prywatnych skrzynek Gmail do masowej wysyłki (ryzyko blokady konta i braku reputacji DKIM/SPF/DMARC).
- **Decyzja:**
  1. Domyślna wartość `NEWSLETTER_DELIVERY_ENABLED` wynosi `false` (tryb bezpiecznej kolejki `dry_run`).
  2. W trybie `NEWSLETTER_DELIVERY_ENABLED=false` cały proces aplikacyjny (formularz w panelu `+`, strona `/newsletter`, walidacja, tokeny SHA-256, potwierdzenie DOI, preferencje, wypis, panel admina, bramka zgodności i kolejkowanie kampanii) działa w 100%, a wygenerowane wiadomości e-mail trafiają do tabeli `newsletter_deliveries` ze statusem `dry_run_queued` i pełnym podglądem w panelu administratora.
  3. Po skonfigurowaniu przez właściciela darmowego transportu transakcyjnego/kampanijnego (np. Cloudflare Email Routing / Email Workers lub darmowy tier API z zweryfikowaną domeną SPF/DKIM/DMARC) i ustawieniu `NEWSLETTER_DELIVERY_ENABLED=true`, moduł kontroluje dzienny limit (`NEWSLETTER_DAILY_QUOTA_LIMIT`, bezpiecznik na poziomie 80% darmowego limitu) i automatycznie wstrzymuje wysyłkę przed przekroczeniem bezpłatnego progu.

---

## ADR-005: Wspólny Widget UI w Panelu `+` z Dziedziczeniem Motywu Portalu

- **Kontekst:** Użytkownik korzystający z przycisku `+` na dowolnym portalu EkoCC oczekuje natychmiastowego dostępu do newslettera w estetyce danego portalu, bez utraty kontekstu (np. odtwarzanego radia czy otwartego artykułu), a także dostępu pod bezpośrednim adresem `/newsletter`.
- **Decyzja:**
  - Stworzono lekki, bez-zależnościowy moduł `/js/cc-newsletter.js` (`window.CCNewsletter`), ładowany automatycznie przez `js/cc-mobile-edge.js` oraz dostępny na dedykowanej stronie `/newsletter` (`newsletter.html`).
  - Widget odczytuje aktywny profil i zmienne CSS portalu (`data-lumina-theme`, `data-profile`, kolory tła i akcentu `#FF7A00` / `#C4A35A`), zapewniając kontrast WCAG 2.2 AA, cele dotykowe min. `44×44 px`, obsługę klawiatury (`Tab`, `Shift+Tab`, `Escape`), pełną responsywność od `320px` oraz obsługę języków `pl`, `en`, `de`.
