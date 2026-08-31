# 🏛️ MATRIX CC — REGULAMIN I DOKUMENTACJA DLA DEDYKOWANEGO AGENTA (@MCC)
### *Christian Culture Multi-Device Simulator & Automation Engine*

---

## 🎯 1. ROLA I PRZEZNACZENIE AGENTA @MCC

Agent dedykowany do modułu **MATRIX CC (@MCC)** odpowiada za:
1. Rozwój i utrzymanie wielourządzeniowego symulatora smartfonów (`scripts/agent-matrix/device_studio.html`).
2. Stabilność i niezależność równoległych sesji smartfonów (zarządzanie profilami Dowódcy, Wioletty Rogowskiej, członków społeczności i kanałów misyjnych).
3. Rozwój dedykowanych automatyzacji (Smart Blessings, modlitwy, radio, tablica, karty 9:16).
4. Integrację zewnętrznych serwisów (YouTube m.in. `@osobowośćPLUS`, Google Auth, PWA).

---

## 📁 2. KLUCZOWE PLIKI MODUŁU MATRIX CC

* `scripts/agent-matrix/device_studio.html` — Główny interfejs aplikacji desktopowej z realistycznymi obudowami telefonów, paskiem URL i panelami kontrolnymi.
* `scripts/agent-matrix/launch_studio.js` — Silnik startowy Playwright z mechanizmem *Keep-Alive*.
* `scripts/agent-matrix/yt_embed_viewer.html` — Dedykowany, bezpieczny odtwarzacz kanałów i filmów YouTube.
* `scripts/agent-matrix/scenarios.js` — Logika autonomicznych zachowań agentów w tle.
* `scripts/agent-matrix/config.json` — Baza domyślnych profili i metadanych.
* `run-matrix.bat` — Jednoklikowy plik startowy Windows.

---

## 🛡️ 3. ŻELAZNE ZASADY IMPLEMENTACYJNE

1. **State Persistence (`localStorage`):** Każda modyfikacja liczby telefonów, profilu lub automatyzacji musi być natychmiast utrwalana w kluczu `matrix_cc_phones_v2`.
2. **Układ Panoramiczny (1 Rząd):** Przy skali poniżej 50% telefony muszą bezwzględnie układać się w jednym poziomym rzędzie (`.mode-row`).
3. **Pasek Adresu URL:** Obsługuje linki `https://`, `www...`, wewnętrzne ścieżki oraz automatyczne przekierowania kanałów YouTube na dedykowane profile LUMINA (np. `@osobowośćPLUS` ➔ `lumina.osobowoscplus.html`).
4. **Wylogowanie Globalne:** Przycisk `Wyloguj ze Wszystkich` czyści sesje i przełącza wszystkie urządzenia na stronę logowania.
5. **Zero Regresji i Strażnik Kodu:** Zawsze weryfikować `node scripts/straznik-kodu-check.js` (0 naruszeń) przed zatwierdzeniem kodu.
