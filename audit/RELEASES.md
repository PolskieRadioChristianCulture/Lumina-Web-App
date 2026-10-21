# EkoCC v2 PREMIUM — KRONIKA WYDAŃ I WDROŻEŃ (RELEASES.md)

Rejestr wszystkich wdrożeń produkcyjnych i stagingowych wraz z SHA, adresami URL, dowodami testów i procedurą powrotu (rollback).

---

## Ostatnie Wydania Produkcyjne (Cloudflare Pages)

### Wydanie 2026-10-20 | Commit `586596bd`
- **Zakres:** LUMI MESS: Widoczny Pokój Rodzinny — Rogowscy na pulpicie `mess.html` (karta VIP, przycisk szybkiego dostępu, dedykowany kanał).
- **Adres produkcyjny:** `https://polskieradio.cc/mess`
- **Wydanie Cloudflare Pages:** `https://52ff35d9.polskieradio.pages.dev`
- **Bateria testów przed wdrożeniem:**
  - `node --test scripts/lumi-dashboard.test.mjs`: 11/11 PASS
  - `npm.cmd run test:guardian`: 0 naruszeń
  - `npm.cmd run test:mobile-premium`: 24/24 PASS
  - `npm.cmd run test:cc-regression`: 374 PASS / 0 FAIL
- **Smoke check po wdrożeniu:** HTTP 200 na `https://polskieradio.cc/mess`. Przycisk „👨‍👩‍👧‍👦 Rogowscy” widoczny dla uwierzytelnionych założycieli.
- **Ścieżka Rollback:** `git revert 586596bd` -> `git push origin main` -> automatyczny deploy Cloudflare Pages.

### Wydanie 2026-10-20 | Commit `031dddf4`
- **Zakres:** LUMI MESS: Optymalizacja limitów zapytań i timeoutu autoryzacji komunikatora.
- **Adres produkcyjny:** `https://polskieradio.cc/mess`
- **Wydanie Cloudflare Pages:** `https://bed6f91b.polskieradio.pages.dev`
- **Wynik smoke check:** HTTP 200, eliminacja błędu quota exceeded.

---

## Wydania Stagingowe (Izolowane)

### Staging 2026-10-20 | Commit `9128bb82` (Gałąź `feat/p0-real-publication-recovery`)
- **Zakres:** P0 Etap 3: Samoczynny scheduler publikacji, Concurrency Lease Lock i transfer plików untracked do `.pages-release`.
- **Adres staging preview:** `https://12841d67.polskieradio.pages.dev/news/test-cc-p0-etap3-staging-20261020`
- **Marker dowodowy:** `CC-P0-STAGE-VERITAS-20261020-PASS` (potwierdzony przez CLI verifier HTTP 200).
- **Izolacja:** Produkcja `https://polskieradio.cc` nienaruszona (brak testowych artykułów na produkcji).
