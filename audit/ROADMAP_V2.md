# EkoCC v2 PREMIUM — MAPA DROGOWA ROZWOJU (ROADMAP_V2.md)

Plan etapowej modernizacji i transformacji całego ekosystemu Christian Culture do standardu **v2 PREMIUM** (2026+).

---

## Faza A — Zabezpieczenie i Stan Bazowy (W Toku)
- [x] Utworzenie rejestru ewidencyjnego `audit/` (STATE, HANDOFF_LATEST, INVENTORY, inventory.csv, FINDINGS, ROADMAP_V2, RELEASES, DECISIONS, TEST_MATRIX).
- [x] Inwentaryzacja 4,512 plików źródłowych w `polskieradio.cc`.
- [x] Zabezpieczenie kanałów transmisyjnych LIVE (Biblia Śpiewana, CCTV24 — stan zamrożony, zakaz dotykania).
- [ ] Utworzenie pełnego snapshotu zapasowego bazy danych i konfiguracji (z testem przywrócenia).

---

## Faza B — Audyt Bezpieczeństwa i Naprawy P0/P1 (Priorytet)
- [ ] Audyt reguł Firestore i Cloudflare Workers pod kątem izolacji danych użytkowników i ochrony dzieci (LUMI KIDS).
- [ ] Weryfikacja nagłówków bezpieczeństwa (CSP, CORS, X-Content-Type-Options, Referrer-Policy).
- [ ] Audyt stabilności odtwarzania audio w tle (MediaSession API, wake lock, obsługa uśpienia ekranu w iOS/Android).
- [ ] Ciągła eliminacja fałszywych sukcesów CI/CD i weryfikacja realnych odpowiedzi HTTP 200.

---

## Faza C — Fundamenty v2 i Design System Champagne Gold
- [ ] Wdrożenie ujednoliconych tokenów stylów CSS (Champagne Gold: `#C4A35A`, `#D4B578`, `#E2CC9A`, `#A08040`).
- [ ] Ustandaryzowanie Global Shell (wspólny nagłówek z wyszukiwarką @w, odtwarzaczem radia, menu profilu i komunikatora LUMI).
- [ ] Ujednolicenie komponentu dobrowolnego wsparcia / mecenatu (`support_target_id`) bez paywalla.
- [ ] Spójne wzorce obsługi błędów i stanów ładowania (szkielety ładowania / skeletons).

---

## Faza D — Jakość PREMIUM (Mobile-First & Ergonomia)
- [ ] Rygorystyczny dotyk min. 44px na wszystkich przyciskach i kontrolkach mobilnych.
- [ ] Płynność animacji (60 fps) z obsługą `prefers-reduced-motion`.
- [ ] Spełnienie kryteriów dostępności WCAG 2.2 AA (kontrast, nawigacja klawiaturą, etykiety czytników).
- [ ] Pomiary Core Web Vitals (LCP <= 2.5s, INP <= 200ms, CLS <= 0.1).

---

## Faza E — Odporność Operacyjna i Ciągłość Sesyjna
- [ ] Pełna automatyzacja dyspozytorska zapytań z GitHub Issues (@005 Dispatcher).
- [ ] Trwały obieg zleceń i raportów z automatycznym zapisem ACK i logów HANDOFF.
- [ ] Regularny audyt regresji (Zero-QA: usterka raz naprawiona nie powraca).
