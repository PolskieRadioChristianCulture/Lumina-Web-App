# RUNBOOK WDROŻENIA, UTRZYMANIA I BEZPIECZEŃSTWA — EkoCC / CC NEWSLETTER (`CCNL-010`)

**Data aktualizacji:** 2026-10-30  
**Identyfikator:** `CCNL-010`  
**Środowisko docelowe:** Cloudflare Pages + Functions Worker (`polskieradio`) + Cloudflare D1

---

## 1. Architektura Działania w Trybie Domyślnym (ZERO COST / Safe Dry-Run)

Domyślnie wdrożony system działa z flagą `NEWSLETTER_DELIVERY_ENABLED=false`:
- Formularz zapisu w panelu `+` (`js/cc-mobile-edge.js` -> `js/cc-newsletter.js`) oraz strona `/newsletter` są w pełni aktywne.
- Zgłoszenia zapisu, weryfikacja Double Opt-In (`/newsletter/confirm`), zarządzanie preferencjami (`/newsletter/manage`), wypis 1-Click (`/newsletter/unsubscribe`) oraz panel admina (`/newsletter/admin`) działają w 100%.
- Żadna zewnętrzna usługa płatna nie jest wywoływana; wiadomości oczekują w tabeli `newsletter_deliveries` ze statusem `dry_run_queued`.

---

## 2. Procedura Migracji Bazy Danych Cloudflare D1

1. Tabele `newsletter_*` są automatycznie inicjalizowane przy pierwszym żądaniu przez metodę `ensureInitialized()` w `services/cc-newsletter/newsletter-service.js` na powiązanej bazie D1 (`env.newsletter_db` lub `env.mission_control_db`).
2. Aby wykonać jawną migrację z pliku SQL na bazie produkcyjnej D1 z poziomu terminala:
   ```powershell
   npx.cmd wrangler d1 execute mission-control-db --remote --file=migrations/001_cc_newsletter.sql
   ```

---

## 3. Konfiguracja DNS (SPF, DKIM, DMARC) Przed Włączeniem Wysyłki Produkcyjnej

Przed zmianą `NEWSLETTER_DELIVERY_ENABLED=true` w panelu Cloudflare DNS dla domeny `polskieradio.cc` należy zweryfikować:
1. **SPF (`TXT` na `polskieradio.cc`):**
   - Upewnić się, że rekord `v=spf1 ... ~all` zawiera autoryzowanego dostawcę darmowego transportu (np. Cloudflare Email Routing / wybrany darmowy przekaźnik transakcyjny).
2. **DKIM (`TXT` / `CNAME` na `<selector>._domainkey.polskieradio.cc`):**
   - Aktywny klucz kryptograficzny DKIM (min. 2048 bitów) podpisujący nagłówki `From`, `Subject`, `List-Unsubscribe`, `List-Unsubscribe-Post`.
3. **DMARC (`TXT` na `_dmarc.polskieradio.cc`):**
   - `v=DMARC1; p=quarantine; rua=mailto:radiochristianculture@gmail.com; adkim=r; aspf=r;`
4. **Adresy zwrotne i nadawcy:**
   - `From: Christian Culture • EkoCC Newsletter <newsletter@polskieradio.cc>`
   - `Reply-To: radiochristianculture@gmail.com`

---

## 4. Ustawienie Sekretów Produkcyjnych w Cloudflare Pages (L0 Gate)

Sekrety ustawia wyłącznie Właściciel (nigdy nie zapisujemy ich w plikach repozytorium):
```powershell
npx.cmd wrangler pages secret put NEWSLETTER_HASH_SALT --project-name polskieradio
npx.cmd wrangler pages secret put NEWSLETTER_ADMIN_SECRET --project-name polskieradio
npx.cmd wrangler pages secret put NEWSLETTER_WEBHOOK_SECRET --project-name polskieradio
```

---

## 5. Procedura Publikacji Kampanii Newslettera

1. Otwórz `/newsletter/admin` i podaj klucz `X-Newsletter-Admin-Secret`.
2. Utwórz szkic kampanii (`draft`), wybierając kategorie docelowe (np. `nowosci-ekocc`, `biblia-akademia`).
3. Wywołaj podgląd i **Bramkę Zgodności (`POST /api/newsletter/admin/campaigns/:id/preview`)** — system sprawdzi obecność stopki wypisu, linku preferencji i bezpieczeństwo protokołów `https://`.
4. Wyślij wiadomość testową (`POST /api/newsletter/admin/campaigns/:id/send-test`).
5. Zatwierdź kampanię (`POST /api/newsletter/admin/campaigns/:id/approve` -> status `approved`).
6. Uruchom wysyłkę (`POST /api/newsletter/admin/campaigns/:id/send`). System automatycznie pilnuje idempotentności (`UNIQUE(campaign_id, subscriber_id)`) oraz bezpiecznika 80% darmowego limitu dziennego.

---

## 6. Procedura Awaryjnego Zatrzymania Wysyłki i Obsługi Żądań RODO

- **Awaryjne zatrzymanie wysyłki (Kill-Switch):** Ustaw zmienną środowiskową `NEWSLETTER_DELIVERY_ENABLED=false` w Cloudflare Pages — natychmiast zatrzymuje wszelki ruch wychodzący.
- **Eksport danych RODO (Art. 15 / Art. 20):**
  - Wywołaj `POST /api/newsletter/admin/gdpr` z `{ "action": "export", "email": "adres@domena.pl" }` — zwraca pełną historię zgód i preferencji.
- **Prawo do usunięcia danych RODO (Art. 17):**
  - Wywołaj `POST /api/newsletter/admin/gdpr` z `{ "action": "erase", "email": "adres@domena.pl" }` — anonimizuje dane osobowe i unieważnia tokeny, zachowując wyłącznie nieodwracalny skrót SHA-256 w `newsletter_suppressions`, aby nigdy więcej nie wysłać wiadomości na ten adres.
