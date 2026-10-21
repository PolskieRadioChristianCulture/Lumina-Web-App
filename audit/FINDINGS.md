# EkoCC v2 PREMIUM — REJESTR USTEREK I WYNIKÓW AUDYTU (FINDINGS.md)

**Struktura klasyfikacji:**  
- **P0:** Zagrożenie bezpieczeństwa, wyciek danych, utrata integralności, blokada działania usługi.  
- **P1:** Błąd funkcjonalny kluczowej ścieżki użytkownika (odtwarzacz, formularz, autoryzacja).  
- **P2:** Ergonomia, dostępność (WCAG), spójność wizualna Design System v2, optymalizacja CWV.  
- **P3:** Udoskonalenia wizualne, mikrointerakcje, nowe warianty językowe.

---

## Rejestr Usterek i Stanów do Weryfikacji (Stan Bieżący)

| ID Usterki | Priorytet | Moduł / Ścieżka | Opis / Ryzyko | Status | Dowód / Test |
|---|---|---|---|---|---|
| **F-001** | P1 | `scripts/build-pages-release.mjs` | Ryzyko pomijania plików untracked z katalogu `news/` w paczce `.pages-release` | 🟢 ROZWIĄZANE LOKALNIE | `tests/p0-pages-release-sync.test.mjs` (PASS na gałęzi staging) |
| **F-002** | P2 | `components/lumi-dashboard.js` | Potrzeba ujednolicenia palety kolorystycznej z Champagne Gold `#C4A35A` | 🟡 W TOKU (Faza C) | Do wdrożenia w ramach v2 Design System |
| **F-003** | P2 | `index.html` & `css/christian-culture-design-system.css` | Brak reguł `@media (prefers-reduced-motion: reduce)` w głównym CSS i stronie głównej | 🟢 ROZWIĄZANE I PRZETESTOWANE | WCAG 2.2 AA reduced motion dodane do `index.html` i `css/` (`test:guardian` PASS) |
| **F-004** | P1 | `player.html` / `js/audio-player.js` | Utrzymanie płynnego odtwarzania audio w tle na urządzeniach mobilnych (iOS/Android) | 🟢 STABILNE / ZAMROŻONE | Wymagana ciągła weryfikacja zgodności z MediaSession API |
| **F-005** | P2 | `akademia/kurscodzienny/` | Spójność przycisków CTA hero oraz przycisku skoku `#kcJumpShareBtn` na nowych lekcjach | 🟢 PASS (Dzień 20) | Zgodne z Dyrektywą @Akademia |
| **F-006** | P0 | `components/lumi-agent-client.js` | Wyciek listenerów autoryzacji i wyścig zapisu transakcji po wylogowaniu/zamknięciu | 🟢 ROZWIĄZANE I PRZETESTOWANE | `tests/lumi-agent-client.test.mjs` (5/5 PASS) |
