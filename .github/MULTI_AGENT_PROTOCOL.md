# 📜 PROTOKÓŁ WSPÓŁPRACY WIELOMODELOWEJ NA GITHUBIE
### *Christian Culture & LUMINA Multi-Agent Team*

Dokument ten określa zasady współpracy, formaty komunikacji i procedury operacyjne dla modeli sztucznej inteligencji działających w ramach ekosystemu **Christian Culture** oraz portalu **LUMINA**.

---

## 👥 Zespół Operacyjny AI i Podział Ról

| Agent / Model | Dostawca | Główny Obszar Odpowiedzialności |
|---|---|---|
| **Antigravity** | Google / DeepMind | Główny Inżynier Operacyjny, Architektura Kodu, Egzekucja w Środowisku, Strażnik Jakości i Wdrożenia Produkcyjne Firebase / Git |
| **Google AI Studio (Gemini)** | Google | Przetwarzanie Wielomodalne (Video, Audio, Grafika), Inteligencja Czasu Rzeczywistego & Daemon AI (`commander_ai_listener.js`) |
| **Claude** | Anthropic | Głęboka Logika Biznesowa, Audyt Jakościowy, Dopracowywanie UX/UI i Refaktoryzacja Kodu |
| **Agent GPT** | OpenAI | Synteza i Kreacja Treści, Dialogi, Komunikacja i Wsparcie Społecznościowe |
| **GitHub Copilot** | Microsoft | Asysta Programistyczna w Czasie Rzeczywistym, DevOps, Automatyzacja Workflows i Pipeline'y CI/CD na GitHubie |

---

## 📡 1. OBOWIĄZKOWY MONIT OPERACYJNY („AKTUALNIE PRACUJĘ NAD...”)

> 🔔 **Żelazny Obowiązek Każdego Agenta:**
> Każdy agent rozpoczynający, prowadzący lub wznawiający pracę ma **bezwzględny obowiązek** natychmiastowego zadeklarowania jasnego komunikatu statusu, aby Dowódca oraz inni agenci dokładnie wiedzieli, co się dzieje.

### Standard Monitu:
* **Na początku i w trakcie pracy:**
  `📡 MONIT OPERACYJNY: [Nazwa Agenta] ➔ Aktualnie pracuję nad: [konkretne zadanie / plik / funkcja]...`
* **Po zakończeniu zadania:**
  `✅ MONIT ZAKOŃCZENIA: [Nazwa Agenta] ➔ Ukończono: [zakres prac] | Strażnik Kodu: [wynik] | Gotowy do przekazania pałeczki.`

---

## 🔄 2. ZASADA DYNAMICZNEJ ZASTĘPOWALNOŚCI (TOKEN-LIMIT RESILIENCE)

> ⚡ **Kluczowa Reguła Operacyjna Dowódcy:**
> Dowództwo korzysta z bezpłatnych pakietów narzędzi AI. W dowolnym momencie danemu agentowi mogą wyczerpać się limity zapytań / tokenów (*Rate Limits / Quota*). 
> **Wszyscy agenci mają bezwzględny obowiązek inteligentnego, natychmiastowego i płynnego przejmowania zadań przerwanych przez poprzednika.**

### Zasady Płynnego Zastępstwa (Smart Handover):
1. **Natychmiastowa Kontynuacja:** Gdy nowy agent zostaje wywołany przez Dowódcę słowem *"kontynuuj"*, *"dokończ"* lub nowym poleceniem, sprawdza `git status`, ostatnie commity i natychmiast podejmuje pracę w punkcie przerwania — bez zbędnych pytań wstępnych.
2. **Niezależność od Narzędzia:** Każdy model w zespole posiada kompetencje do dokończenia prac każdego innego modelu (programowanie, refaktoryzacja, audyt, dokumentacja).
3. **Pamięć Stanu w Repozytorium:** Stan prac jest zawsze utrwalany w commitach, plikach konfiguracyjnych i raportach, co pozwala dowolnemu agentowi wejść do akcji w ułamku sekundy.

---

## 🏷️ 3. Format Podpisu Commitów (Standard Wieloosobowy)

Każdy commit w repozytorium musi jednoznacznie wskazywać typ zmiany, moduł oraz agenta wykonawczego:

```bash
# Schemat:
git commit -m "<typ>(<moduł>): <opis zmiany> [<Nazwa Agenta>]"

# Przykłady:
git commit -m "feat(lumina-chat): dodano wskaźnik pisania w czasie rzeczywistym [Antigravity]"
git commit -m "refactor(lumina-nav): optymalizacja kaskady CSS i responsywności [Claude]"
git commit -m "ci(github-actions): konfiguracja automatycznego testu Strażnika Kodu [GitHub Copilot]"
git commit -m "feat(daemon-ai): integracja promptów multimodalnych Gemini [Google AI Studio]"
git commit -m "docs(theology): aktualizacja bazy rozważań i wersetów biblijnych [Agent GPT]"
```

Dozwolone prefiksy: `feat`, `fix`, `refactor`, `style`, `docs`, `ci`, `chore`, `perf`.

---

## 📋 4. Standard Notatki Przekazania (Handoff Template)

Gdy agent kończy etap i przekazuje zadanie kolejnemu agentowi w Issue, PR lub dyskusji, stosuje standardowy raport:

```markdown
### 📋 Raport Przekazania Zadania (Handoff)
* **Agent Wykonawczy:** [np. Claude / Antigravity / Copilot / Gemini / Agent GPT]
* **Zmodyfikowane pliki:** `lumina-profile.html`, `lumina-db.js`
* **Wynik Strażnika Kodu:** `node scripts/straznik-kodu-check.js` ➔ ✅ 0 naruszeń
* **Stan wdrożenia:** Zacommitowano / Wypchnięto do origin i lumina-repo / Wdrożono na Firebase Hosting
* **Zadanie dla Następnego Agenta (@kolejny_agent):** [Opis kolejnego kroku]
```

---

## 🛡️ 5. Pancerne Zasady Jakości i Bezpieczeństwa (Zero Kolizji)

1. **Egzekucja Strażnika Kodu:**
   * Przed każdym zatwierdzeniem kodu (`git commit` / `git push`) **bezwzględnie uruchamiamy**:
     ```bash
     node scripts/straznik-kodu-check.js
     ```
   * Kod z jakimikolwiek naruszeniami regresji nie ma prawa trafić do gałęzi `main`.

2. **Ochrona Działających Kanałów Nadawczych (Read-Only):**
   * Pliki produkcyjne CCTV24 i działających stacji (`cctv24-worship.html`, `stream-scene.html`, `snadaniowa-live.html` itp.) są całkowicie zamrożone i służą wyłącznie jako wzorce do odczytu. Modyfikacje wolno nanosić wyłącznie w plikach dedykowanych dla danego zlecenia.

3. **Poufność Mission Control:**
   * Mission Control jest prywatnym zapleczem operacyjnym Dowódcy. Żaden agent nie ma prawa publikować nazw, tekstów ani mechanizmów Mission Control w publicznym kodzie portalu `polskieradio.cc`, belkach RDS czy w aplikacji.

4. **Dwukierunkowa Synchronizacja Repozytoriów:**
   * Wszystkie zatwierdzone zmiany są równolegle wypychane do obu powiązanych repozytoriów:
     - `origin` (`Strona-www-Christian-Culture`)
     - `lumina-repo` (`Lumina-Web-App`)

---

## 🏷️ 6. Wywołania i Etykiety Agentów (@mentions)

* `@Antigravity` — Zadania terminalowe, wdrożenia Firebase, skrypty wykonawcze, egzekucja Strażnika Kodu
* `@Claude` — Przegląd kodu (*Code Review*), optymalizacja kaskad stylów, logika biznesowa, dostępność i UX
* `@Copilot` — Sugestie składniowe, pipeline'y GitHub Actions, testy jednostkowe, automatyzacja repozytoriów
* `@Gemini` — Przetwarzanie obrazu, wideo, transkrypcje audio, konfiguracja promptów AI daemona
* `@AgentGPT` — Redakcja tekstów, bazy rozważań, komunikacja społecznościowa i dokumentacja
