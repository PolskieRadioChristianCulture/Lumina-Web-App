# KONTRAKT TECHNICZNY: MISSION CONTROL L0 „5 SEKUND” & ACTION CARDS (CONTRACT.md)

**Standard:** `EKOCC-V2-PREMIUM-MC-L0-V1`  
**Wersja schematu:** 1.0  
**Data:** 2026-10-21  
**Autorzy / Wdrożenie:** Gabinet @409 (Antigravity), @519 (Codex / Claude), @005 (Sekretariat)  
**Nadrzędny decydent:** Cezary Rogowski (Prezes L0)

---

## 1. Cel i Zasada „5 Sekund”
Każda karta prezentowana Prezesowi L0 w panelu Mission Control musi być zrozumiała w **maksymalnie 5 sekund**. Wszelkie logi, diffy, stosy błędów i telemetria znajdują się w plikach dowodowych (`audit/` i `skrzynka/`), dostępnych pod przyciskiem `📄 SZCZEGÓŁY` / `📄 DOWODY`.

---

## 2. Typy Kart Akcji (Action Card Kinds)

### A. Karta Decyzji (`kind: "decision"`)
Służy do uzyskania autoryzacji L0 na działania poziomu T4 (koszty, publikacja produkcyjna, uprawnienia, wrażliwe dane).
- **Maksymalna objętość:** 4 wiersze tekstu + przyciski akcji.
- **Wiersze:**
  1. `SPRAWA:` [jedno zdanie: co mamy zrobić]
  2. `MISJA CC:` [TAK / NIE / NIEPEWNE; jeśli NIE/NIEPEWNE — 1 krótkie wyjaśnienie]
  3. `KORZYŚĆ I RYZYKO:` [jedno zdanie o korzyści; przy istotnym ryzyku nazwij je po ludzku]
  4. `REKOMENDACJA:` **WDROŻYĆ — TAK / NIE** [jednozdaniowy powód]
- **Przyciski akcji:**
  - `approve` → `✅ ZATWIERDŹ` (uruchamia wykonanie po autoryzacji L0)
  - `reject` → `❌ ODRZUĆ` (anuluje zadanie z odnotowaniem w rejestrze)
  - `explain` → `❓ WYJAŚNIJ` (żąda doprecyzowania od agenta zgłaszającego)
  - `change_plan` → `✏️ ZMIEŃ PLAN` (odsyła do poprawki planu)

### B. Karta Wykonania (`kind: "execution"`)
Raport z wdrożonego przyrostu wartości lub naprawy usterki.
- **Maksymalna objętość:** 3 wiersze tekstu + przyciski akcji.
- **Wiersze:**
  1. `ZROBIONE:` [co rzeczywiście zmieniono]
  2. `DOWÓD:` [żywy adres URL / SHA / testy; jeśli brak wdrożenia — "NIEOPUBLIKOWANE"]
  3. `WERDYKT:` **JEST LEPIEJ / MAMY WYŻSZY STANDARD PREMIUM / BEZ POPRAWY / NIEZWERYFIKOWANE**
- **Przyciski akcji:**
  - `verify` → `🔎 SPRAWDŹ` (otwiera żywy URL w nowej karcie)
  - `next_task` → `➡️ NASTĘPNE ZADANIE` (przechodzi do kolejnej karty)
  - `details` → `📄 SZCZEGÓŁY` (otwiera modal z pełnym raportem w `audit/`)

### C. Karta Problemu (`kind: "problem"`)
Powiadomienie o blokerze lub awarii wymagającej decyzji.
- **Maksymalna objętość:** 3 wiersze tekstu + przyciski akcji.
- **Wiersze:**
  1. `PROBLEM:` [co przeszkadza]
  2. `WPŁYW:` [co to oznacza dla ludzi / misji]
  3. `REKOMENDACJA:` [co najlepiej zrobić dalej]
- **Przyciski akcji:**
  - `fix` → `🔧 NAPRAW` (przydziela natychmiastowe zadanie naprawcze P0)
  - `pause` → `⏸️ WSTRZYMAJ` (zatrzymuje proces bez skutków ubocznych)
  - `escalate` → `⬆️ ESKALUJ` (przekazuje do natychmiastowej decyzji telefonicznej/osobistej)

### D. Karta Koniec Zmiany (`kind: "shift_end"`)
Podsumowanie sesji wykonawczej przed wyczerpaniem tokenów.
- **Maksymalna objętość:** 3 wiersze tekstu + przyciski akcji.
- **Wiersze:**
  1. `UKOŃCZONO:` [co działa lub zostało przygotowane]
  2. `POZOSTAŁO:` [najbliższy krok]
  3. `STATUS:` [OPUBLIKOWANE / GOTOWE DO TESTÓW / ZABLOKOWANE / NIEZWERYFIKOWANE]
- **Przyciski akcji:**
  - `handoff` → `🔁 PRZEKAŻ ZMIANĘ` (potwierdza protokół HANDOFF_LATEST.md)
  - `continue` → `▶️ KONTYNUUJ` (rozpoczyna nową sesję jeśli są zasoby)
  - `evidence` → `📄 DOWODY` (otwiera pliki w `audit/`)

---

## 3. Schemat JSON `action_card` (v1.0)
```json
{
  "$schema": "https://polskieradio.cc/schemas/action-card-v1.json",
  "schema_version": "1.0",
  "task_id": "string (format: TASK-YYYYMMDD-NNN)",
  "card_id": "string (format: CARD-YYYYMMDD-NNN)",
  "revision": 1,
  "kind": "decision | execution | problem | shift_end",
  "priority": "P0 | P1 | P2 | P3",
  "agent_id": "@NNN (np. @409, @519, @007, @001)",
  "office_id": "string (np. CC-A12-02-agent-409)",
  "created_at": "ISO-8601 UTC timestamp",
  "lines": {
    "line1": "string (max 120 chars)",
    "line2": "string (max 120 chars)",
    "line3": "string (max 120 chars)",
    "line4": "string (opcjonalny, tylko dla kind=decision)"
  },
  "verdict": "JEST LEPIEJ | MAMY WYŻSZY STANDARD PREMIUM | BEZ POPRAWY | NIEZWERYFIKOWANE | null",
  "requires_l0": true,
  "actions": [
    {
      "id": "approve",
      "label": "✅ ZATWIERDŹ",
      "style": "primary-gold",
      "endpoint": "/api/mc/actions/approve"
    }
  ],
  "idempotency_key": "SHA-256 (task_id + revision + created_at)",
  "evidence_ref": "audit/RELEASES.md lub URL",
  "state": "awaiting_decision | approved | rejected | in_progress | completed | blocked"
}
```

---

## 4. Bramki Bezpieczeństwa Serwera (Backend Verification)
1. **Weryfikacja tożsamości L0:**
   - Wywołanie akcji `approve` / `reject` jest dozwolone WYŁĄCZNIE dla uwierzytelnionego konta Prezesa L0 (`nazirczarkes@gmail.com`).
   - Żadne ukrywanie przycisków w CSS nie zastępuje serwerowej autoryzacji (Token Bearer / Firebase Auth UID / Session cookie).
2. **Niezmienna Idempotencja:**
   - Każde kliknięcie przesyła `idempotency_key`. Podwójne kliknięcie nie wykonuje podwójnej operacji, lecz zwraca stan pierwotny (`status: ALREADY_PROCESSED`).
3. **Zdarzenie Audytowe:**
   - Każda akcja generuje niemutowalne zdarzenie w `JOMA_HANDOFFS.md` oraz w mostku zdarzeń Mission Control (`EventBus`).
