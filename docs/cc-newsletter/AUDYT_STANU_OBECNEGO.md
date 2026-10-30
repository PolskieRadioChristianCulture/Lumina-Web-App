# AUDYT STANU OBECNEGO — EkoCC / CC NEWSLETTER (`CCNL-001`)

**Data audytu:** 2026-10-30  
**Identyfikator:** `CCNL-001`  
**Autor:** Antigravity (`@A001`)  
**Repozytorium główne:** `C:\Users\czark\Christian_Culture_Projekty\polskieradio.cc` (mirror: `C:\Users\czark\Desktop\@ICC\LUMINA`)

---

## 1. Mapa Portali i Punktów Wejścia w Ekosystemie EkoCC

Ekosystem Christian Culture (`https://polskieradio.cc`) działa jako zunifikowana aplikacja krawędziowa na **Cloudflare Pages + Functions Worker (`_worker.js`)**. Wszystkie publiczne powierzchnie WWW dzielą się na dwa warianty wspólnego panelu krawędziowego otwieranego przyciskiem `+`:

1. **Warstwa Natywna / Statyczno-Hybrydowa (`js/cc-mobile-edge.js` + `css/cc-mobile-edge.css`):**
   - Wstrzykiwana automatycznie przez `scripts/cc-page-standard.mjs` oraz dedykowane profile (`data-cc-edge-profile="home|lumina|search|ecosystem|wioletta"`).
   - Obejmuje: Stronę główną (`/`), Wyszukiwarkę (`/wyszukiwarka`, `/szukaj`), Portal LUMINA (`/lumina`, `/tablica`, `/lumina-profile.html` i profile kanoniczne), Akademię Biblijną (`/akademia`, `/akademia/kurscodzienny/*`), MojaBiblia (`/mojabiblia`), Kino VOD (`/vod`), HOLOS (`/holos`), Odtwarzacz (`/player`), Powieść Wioletty (`/Wioletta`), Your Imagination Studio (`/YIS`), CC Global (`/Global`), Gerald Welch (`/GeraldWelch`), Biblijne Uwielbienie (`/biblijne-uwielbienie`), Misję Milion (`/milion`) oraz wszystkie publiczne strony HTML.
   - Obsługuje 3 języki interfejsu (`pl`, `en`, `de`) zsynchronizowane z `js/ekocc-i18n-core.js` oraz lokalne warianty kolorystyczne (`default` Champagne Gold `#C4A35A`, `lumina` dark/light, `search` `#FF7A00`).

2. **Warstwa Portali Publicystycznych React SSG (`portals/ccn-news/src/components/CCMobileEdgePanel.tsx`):**
   - Obejmuje 21 portali tematycznych: `/news`, `/nauka`, `/historia`, `/biologia`, `/prawo`, `/seks`, `/biznes`, `/kultura`, `/biblioteka`, `/ogloszenia`, `/ziu`, `/kuchnia`, `/wspolpraca`, `/edukacja`, `/psychologia`, `/finanse`, `/technologie`, `/misje`, `/apologetyka`, `/si`, `/music`.
   - Współdzieli globalny skrypt `/components/cc-omni-search.js` oraz `/js/cc-mobile-edge.js` na stronach wygenerowanych w katalogach portali.

---

## 2. Istniejąca Infrastruktura Backendowa, Bazy Danych i Mechanizmy Zabezpieczeń

| Obszar | Stan obecny w repozytorium | Zastosowanie w CC Newsletter |
|---|---|---|
| **Runtime / Router** | Cloudflare Pages Worker `_worker.js` | Obsługa endpointów `/api/newsletter/*` oraz czystych ścieżek `/newsletter`, `/newsletter/confirm`, `/newsletter/manage`, `/newsletter/unsubscribe`, `/newsletter/admin`. |
| **Baza danych** | Cloudflare D1 (`wrangler.toml`: `milion_db`, `mission_control_db`, `bu_votes_db`) | Moduł CC Newsletter wykorzystuje dedykowane bindowanie D1 `newsletter_db` z automatycznym fallbackiem na istniejące bindowanie D1 (`mission_control_db` / `milion_db`) z izolowanym prefiksem tabel `newsletter_*` oraz adapterem pamięciowym D1 dla środowiska lokalnego/testowego. |
| **Autoryzacja Admina** | Weryfikacja tokenów Firebase ID (`RS256` JWKS w `_worker.js`) oraz nagłówek sztabowy `x-mc-secret` / `NEWSLETTER_ADMIN_SECRET` | Dwustopniowa autoryzacja RBAC dla endpointów `/api/newsletter/admin/*` (weryfikacja tokenu Firebase ID właściciela `nazirczarkes@gmail.com` lub klucza administracyjnego `NEWSLETTER_ADMIN_SECRET`). |
| **Ochrona przed botami i Rate Limiting** | Skróty SHA-256 `CF-Connecting-IP + User-Agent` w `_worker.js` | Rozszerzony rate limiter per skrót IP (`ip_hash`) oraz per skrót e-maila (`email_hash`), walidacja `Origin`/`Referer`, pole pułapki antybotowej (`honeypot`) i opcjonalna weryfikacja Cloudflare Turnstile (`TURNSTILE_SECRET_KEY`). |
| **Polityka Prywatności** | `privacy.html` (`/privacy`, aktualizacja z 25.09.2026) | Zawiera dane Administratora, kontakt (`radiochristianculture@gmail.com`, `polskiercctv@gmail.com`), oświadczenie o niezależności od Polskie Radio S.A. oraz opis CC ID / LUMINA / HOLOS. Przygotowano gotowy moduł klauzul RODO/PKE dla Newslettera w `docs/cc-newsletter/RODO_I_ZGODY_DO_AKCEPTACJI.md`. |

---

## 3. Audyt Istniejących Formularzy Kontaktowych i Potencjalnych Punktów Zbierania E-maili

Przeprowadzono pełne przeszukanie repozytorium pod kątem zbierania adresów e-mail:
1. **Brak wcześniejszego systemu newslettera:** W repozytorium nie istniały tabele `newsletter_*`, endpointy `/api/newsletter/*` ani formularze zapisu na newsletter.
2. **Konta użytkowników CC ID / LUMINA (`lumina.html`, Firebase Auth):** Służą wyłącznie do logowania i funkcji społecznościowych. Zgodnie z sekcją 2 i 4 specyfikacji wprowadzono **twardą separację baz** — konta Firebase Auth / LUMINA / HOLOS / LUMI KIDS / WhatsApp **nie są** automatycznie importowane ani traktowane jako subskrybenci newslettera.
3. **Skrzynki kontaktowe (`mailto:radiochristianculture@gmail.com`, `mailto:polskiercctv@gmail.com`):** Korespondencja indywidualna nie stanowi zgody marketingowej.

---

## 4. Audyt Transportu E-mail i Zgodności ze Standardem ZERO COST

- **Stan obecny:** W repozytorium nie ma skonfigurowanego klucza produkcyjnego do zewnętrznego dostawcy SMTP/API transakcyjnego i masowego (brak zmiennych `SMTP_*`, `SES_*`, `RESEND_*`, `MAILCHANNELS_*` w `wrangler.toml`).
- **Decyzja architektoniczna (ZERO COST + Bezpieczeństwo P0):**
  - Zaimplementowano abstrakcję `EmailTransport` (`services/cc-newsletter/newsletter-service.js`) obsługującą:
    1. **Tryb bezpiecznej kolejki / Dry-Run (`NEWSLETTER_DELIVERY_ENABLED=false` — domyślny):** Wszystkie operacje zapisu, generowania tokenów SHA-256, Double Opt-In, zarządzania preferencjami, wypisu 1-click oraz kolejkowania kampanii wykonują się w 100% w bazie D1, a wychodzące wiadomości są zapisywane w dzienniku dostarczeń ze statusem `dry_run_queued` bez wykonywania płatnych lub nieautoryzowanych połączeń zewnętrznych.
    2. **Darmowy transport Cloudflare Email Workers / HTTP API Webhook / SMTP Relay (po włączeniu przez właściciela `NEWSLETTER_DELIVERY_ENABLED=true`):** Gotowy adapter obsługujący darmowe limity (Free Tier) z automatycznym bezpiecznikiem limitu dziennego (`NEWSLETTER_DAILY_QUOTA_LIMIT`, domyślnie zatrzymujący wysyłkę przy 80% darmowego limitu).

---

## 5. Wykryte Ryzyka i Zastosowane Zabezpieczenia

1. **Ryzyko skanerów linków pocztowych (Microsoft Defender SafeLinks, korporacyjne bramy AV):**
   - *Rozwiązanie:* Żądania `GET /newsletter/confirm?token=...` oraz `GET /newsletter/unsubscribe?token=...` są wyłącznie bezstanowymi odczytami (`safe read-only`) renderującymi stronę z przyciskiem potwierdzenia. Właściwa zmiana stanu (`pending_confirmation -> active` lub `-> unsubscribed`) następuje wyłącznie po żądaniu `POST /api/newsletter/confirm` lub `POST /api/newsletter/unsubscribe` (w tym RFC 8058 `List-Unsubscribe=One-Click`).
2. **Ryzyko enumeracji adresów e-mail (wyciek informacji, czy dany adres jest w bazie):**
   - *Rozwiązanie:* Endpointy publiczne (`POST /api/newsletter/subscribe`, `POST /api/newsletter/manage/request-link`) zwracają zawsze identyczny status HTTP `200 OK` i neutralny komunikat niezależnie od tego, czy adres istnieje, jest oczekujący, aktywny czy wypisany.
3. **Ryzyko wycieku tokenów z bazy danych:**
   - *Rozwiązanie:* Tokeny są generowane kryptograficznie (`crypto.getRandomValues`, 32 bajty = 256 bitów entropii), a w tabeli `newsletter_tokens` zapisywany jest **wyłącznie skrót SHA-256 (`token_hash`)**, nigdy surowy token.
4. **Ryzyko naruszenia układu 2 kolumn bez paska przewijania w panelu `+` (`js/cc-mobile-edge.js`):**
   - *Rozwiązanie:* Pozycja `mail` („Newsletter / Bądźmy w kontakcie”) została dodana do siatki 2-kolumnowej panelu krawędziowego z zachowaniem pełnej kompatybilności z istniejącymi testami regresji (`scripts/cc-static-edge.browser.test.mjs`, `scripts/cc-mobile-edge-ecosystem.test.mjs`).
