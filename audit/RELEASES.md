# EkoCC v2 PREMIUM — KRONIKA WYDAŃ I WDROŻEŃ (RELEASES.md)

Rejestr wszystkich wdrożeń produkcyjnych i stagingowych wraz z SHA, adresami URL, dowodami testów i procedurą powrotu (rollback).

---

## Ostatnie Wydania Produkcyjne (Cloudflare Pages)

### Wydanie 2026-10-21 | Commit `84e4987c`
- **Zakres:** Dzień 21 Akademii Biblijnej — Pełna synchronizacja clean routing (`akademia/kurscodzienny/`, `kursy/kurscodzienny/`), przyciski Hero CTA (`CZYTAJ DZIEŃ 21 (21 PAŹDZIERNIKA) →` / `← DZIEŃ 20`) oraz pełny indeks wyszukiwarki @w (344 wpisy).
- **Adres produkcyjny:** `https://polskieradio.cc/akademia#kurscodzienny` & `https://polskieradio.cc/akademia/kurscodzienny/dzien-21`
- **Bateria testów przed wdrożeniem:**
  - `npm.cmd run test:guardian`: 0 naruszeń
  - `npm.cmd run test:mobile-premium`: 24/24 PASS
  - `npm.cmd run test:cc-regression`: 377 PASS / 0 FAIL
- **Ścieżka Rollback:** `git revert 84e4987c` -> `git push origin main` -> automatyczny deploy Cloudflare Pages.

### Wydanie 2026-10-21 | Commit `436e0ec7`
- **Zakres:** Inicjalizacja rejestru `audit/` (9 artefaktów + inwentarz 4,512 plików), naprawa wycieku pamięci w `components/lumi-agent-client.js` (F-006) oraz dodanie standardu WCAG 2.2 AA `prefers-reduced-motion` w `css/christian-culture-design-system.css` i `index.html` (F-003).
- **Adres produkcyjny:** `https://polskieradio.cc`
- **Bateria testów:**
  - `node --test tests/lumi-agent-client.test.mjs`: 5/5 PASS
  - `npm.cmd run test:guardian`: 0 naruszeń
  - `npm.cmd run test:mobile-premium`: 24/24 PASS
  - `npm.cmd run test:cc-regression`: 377 PASS / 0 FAIL
- **Ścieżka Rollback:** `git revert 436e0ec7` -> `git push origin main`.

### Wydanie 2026-10-20 | Commit `586596bd`
- **Zakres:** LUMI MESS: Widoczny Pokój Rodzinny — Rogowscy na pulpicie `mess.html` (karta VIP, przycisk szybkiego dostępu, dedykowany kanał).
- **Adres produkcyjny:** `https://polskieradio.cc/mess`
- **Wydanie Cloudflare Pages:** `https://52ff35d9.polskieradio.pages.dev`
- **Smoke check po wdrożeniu:** HTTP 200 na `https://polskieradio.cc/mess`.

---

## Wydania Stagingowe (Izolowane)

### Staging 2026-10-20 | Commit `9128bb82` (Gałąź `feat/p0-real-publication-recovery`)
- **Zakres:** P0 Etap 3: Samoczynny scheduler publikacji, Concurrency Lease Lock i transfer plików untracked do `.pages-release`.
- **Adres staging preview:** `https://12841d67.polskieradio.pages.dev/news/test-cc-p0-etap3-staging-20261020`
- **Marker dowodowy:** `CC-P0-STAGE-VERITAS-20261020-PASS`.
