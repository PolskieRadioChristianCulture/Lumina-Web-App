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

## 👑 1. ZASADA DYNAMICZNEGO LIDERSTWA (ROTATING CHIEF LEADER)

> ⚡ **Naczelna Reguła Dowódcy Nazira:**
> **Rolę Lidera Sztabu i Koordynatora Zadań przejmuje TEN AGENT, który w danej chwili MA DOSTĘPNE TOKENY i może kontynuować pracę dla misji.**
> Brak tokenów u jednego agenta nie wstrzymuje misji ani na sekundę — aktywny agent automatycznie staje się Głównym Koordynatorem (Lead Dispatcher).

### Obowiązki Aktualnego Lidera:
1. **Przejęcie Pałeczki (Lead Takeover):** Od razu melduje w czacie i aktualizuje `.github/DISPATCH_BOARD.md` swoim statusem.
2. **Koordynacja & Egzekucja:** Prowadzi zadania, zleca kroki sobie lub dostępnym agentom i pilnuje spójności.
3. **Strażnik Jakości:** Przed każdym commitem bezwzględnie weryfikuje kod: `node scripts/straznik-kodu-check.js`.
4. **Deploy & PUSH:** Wypycha zmiany do obu repozytoriów (`origin` i `lumina-repo`) oraz wdraża na Firebase.

---

## 🔑 2. HASŁA OPERACYJNE DOWÓDCY (@ICC / @monit)

Gdy Dowódca wpisze w czacie **`@ICC`** lub **`@monit`**, aktualny Lider ma **bezwzględny obowiązek** natychmiast wygenerować raport:

```markdown
📡 PEŁNY MONIT OPERACYJNY [@ICC]:
* 👑 **Aktualny Lider:** [Nazwa Agenta posiadającego aktywne tokeny]
* 🎯 **Bieżące Zadanie:** [Zadanie pobrane z .github/DISPATCH_BOARD.md]
* 📦 **Ostatni Commit:** [ID commita z git log -1] | Gałąź: main
* 🛡️ **Strażnik Kodu:** [Wynik: node scripts/straznik-kodu-check.js]
* 🌐 **Status Produkcji:** [Firebase Hosting: live / zsynchronizowano]
* 📋 **Następny Krok:** [Co robimy dalej]
```

---

## 📡 3. OBOWIĄZKOWY MONIT BIEŻĄCY („AKTUALNIE PRACUJĘ NAD...”)

Każdy agent melduje swój status:
* **Na początku i w trakcie pracy:**
  `📡 MONIT OPERACYJNY: [Nazwa Agenta] ➔ Aktualnie pracuję nad: [konkretne zadanie / plik / funkcja]...`
* **Po zakończeniu zadania:**
  `✅ MONIT ZAKOŃCZENIA: [Nazwa Agenta] ➔ Ukończono: [zakres prac] | Strażnik Kodu: [wynik] | Gotowy do przekazania pałeczki.`

---

## 🏷️ 4. Format Podpisu Commitów (Standard Wieloosobowy)

```bash
git commit -m "<typ>(<moduł>): <opis zmiany> [<Nazwa Agenta>]"
```

Dozwolone prefiksy: `feat`, `fix`, `refactor`, `style`, `docs`, `ci`, `chore`, `perf`.

---

## 📋 5. Standard Notatki Przekazania (Handoff Template)

```markdown
### 📋 Raport Przekazania Zadania (Handoff)
* **Agent Wykonawczy / Ustępujący Lider:** [Nazwa Agenta]
* **Zmodyfikowane pliki:** `[lista plików]`
* **Wynik Strażnika Kodu:** `node scripts/straznik-kodu-check.js` ➔ ✅ 0 naruszeń
* **Stan wdrożenia:** Zacommitowano / Wypchnięto do obu repozytoriów / Wdrożono na Firebase
* **Zadanie dla Kolejnego Lidera (@kolejny_agent):** [Opis kolejnego kroku]
```

---

## 🛡️ 6. Pancerne Zasady Jakości i Bezpieczeństwa (Zero Kolizji)

1. **Egzekucja Strażnika Kodu:** Przed każdym commitem: `node scripts/straznik-kodu-check.js` (0 naruszeń).
2. **Ochrona Działających Kanałów Nadawczych (Read-Only):** `cctv24-worship.html`, `stream-scene.html` itp. są zamrożone.
3. **Poufność Mission Control:** Nigdy nie publikować nazw ani mechanizmów Mission Control.
4. **Dwukierunkowa Synchronizacja:** PUSH zawsze do `origin` i `lumina-repo`.

---

## 🏷️ 7. Wywołania i Etykiety Agentów (@mentions)

* `@Antigravity` — Zadania terminalowe, wdrożenia Firebase, skrypty wykonawcze, egzekucja Strażnika Kodu
* `@Claude` — Przegląd kodu (*Code Review*), optymalizacja kaskad stylów, logika biznesowa, dostępność i UX
* `@Copilot` — Sugestie składniowe, pipeline'y GitHub Actions, testy jednostkowe, automatyzacja repozytoriów
* `@Gemini` — Przetwarzanie obrazu, wideo, transkrypcje audio, konfiguracja promptów AI daemona
* `@AgentGPT` — Redakcja tekstów, bazy rozważań, komunikacja społecznościowa i dokumentacja
