# EkoCC v2 PREMIUM — REJESTR DECYZJI ARCHITEKTONICZNYCH (DECISIONS.md)

Rejestr kluczowych decyzji technicznych, organizacyjnych i bezpieczeństwa (ADR).

---

## ADR-001: Tryb Ciągłych Zmian Sesyjnych zamiast Fikcyjnej Pracy w Tle (2026-10-21)
- **Status:** ZAAKCEPTOWANE (Dyrektywa Wykonawcza L0).
- **Kontekst:** Modele AI (Claude, Codex, Antigravity) działają w izolowanych sesjach wykonawczych ograniczonych limitami tokenów, a nie jako ciągłe demony serwerowe 24/7.
- **Decyzja:** Jedna zmiana robocza = jedna realna sesja wykonawcza danego agenta. Stan i ciągłość są utrwalane w plikach `audit/STATE.md` i `audit/HANDOFF_LATEST.md`. Zakaz deklarowania, że agent działa samoczynnie po zakończeniu sesji.
- **Konsekwencje:** Pełna przejrzystość operacyjna, brak rozczarowań, bezpieczne wznawianie pracy z trwałych plików.

---

## ADR-002: Zespół Wykonawczy (Naprawa i Publikacja) zamiast Samego Audytu (2026-10-21)
- **Status:** ZAAKCEPTOWANE (Dyrektywa Wykonawcza L0).
- **Kontekst:** Sporządzanie samych raportów z usterek nie posuwa projektu do przodu i generuje dług technologiczny.
- **Decyzja:** Codex i Claude Code działają jako zespół wykonawczy. Rezultatem każdej zmiany roboczej ma być działający, przetestowany i — gdy spełnia bramki bezpieczeństwa — opublikowany przyrost jakości lub funkcjonalności.
- **Konsekwencje:** Rzeczywisty postęp technologiczny przy zachowaniu rygorystycznych bramek jakości.

---

## ADR-003: Zasada Zero-Distraction dla Zadań Wewnętrznych T0–T3 (2026-10-20)
- **Status:** ZAAKCEPTOWANE (JOMA @777 / Issue #4 / PR #5).
- **Kontekst:** Dowódca L0 był przeciążany ręcznym przekazywaniem meldunków i powiadomień technicznych pomiędzy agentami.
- **Decyzja:** Zadania inżynierskie, testy, refaktoryzacje i rutynowe aktualizacje (T0–T3) są obsługiwane autonomicznie wewnątrz Orkiestry bez generowania powiadomień do Dowódcy L0. Eskalacja następuje WYŁĄCZNIE dla poziomu T4 (koszty, produkcja, klucze, dane wrażliwe).
- **Konsekwencje:** Ochrona uwagi Dowódcy L0 przy zachowaniu pełnej audytowalności w Skrzynce Misji.

---

## ADR-004: Paleta Champagne Gold jako Standard Wizualny Marki CC (2026-10-20)
- **Status:** ZAAKCEPTOWANE.
- **Kontekst:** Rozproszenie odcieni złota i akcentów w różnych częściach portalu.
- **Decyzja:** Obowiązuje ścisła paleta Champagne Gold: bazowy `#C4A35A`, jasny akcent `#D4B578`, tło/kontrast `#E2CC9A`, ciemny/border `#A08040`.
- **Konsekwencje:** Spójny, elegancki i luksusowy charakter wizualny w stylu 2026+ bez obciążania interfejsu ciężkimi grafikami.

---

## ADR-005: Zamrożenie i Ochrona Sprawnych Kanałów LIVE (2026-10-09)
- **Status:** NIENEGOCJOWALNE (Żelazna reguła ekosystemu).
- **Kontekst:** Ryzyko przypadkowego uszkodzenia działających transmisji radiowych i wideo podczas prac nad nowymi funkcjami.
- **Decyzja:** Bezwzględny zakaz edycji plików `cctv24-worship.html`, `stream-scene.html` oraz algorytmów synchronizacji Biblii Śpiewanej bez wyraźnego, osobnego rozkazu L0.
- **Konsekwencje:** 100% stabilności ciągłej transmisji dla słuchaczy i widzów.
