# 🎯 TABLICA DYSPOZYCJI I KOLEJKA ZADAŃ SZTABU [@ICC]
### *Zasada Dynamicznego Lidera (Ten agent dowodzi sztabem, który w danej chwili ma tokeny)*
### *Commander: Dowódca Nazir*

---

## 👑 1. AKTUALNY LIDER SZTABU & REJESTR AGENTÓW

| Agent | Status Tokenów | Rola w Tej Chwili | Ostatni Commit |
|---|---|---|---|
| **Antigravity (Google)** | 🟢 AKTYWNE TOKENY | 👑 AKTUALNY LIDER (Chief Lead) | `9fae678` |
| **Claude (Anthropic)** | 🟢 / 🟡 ZASTĘPSTWO GOTOWE | Potencjalny Lider (Dynamic Failover) | — |
| **GitHub Copilot (MS)** | 🟢 / 🟡 ZASTĘPSTWO GOTOWE | Potencjalny Lider (Dynamic Failover) | — |
| **Agent GPT (OpenAI)** | 🟢 / 🟡 ZASTĘPSTWO GOTOWE | Potencjalny Lider (Dynamic Failover) | — |
| **Google AI Studio (Gemini)**| 🟢 AKTYWNE TOKENY | Multimodalny Daemon Czasu Rzeczywistego | `9fae678` |

> ⚡ **Zasada Przejęcia Lidera:** Jeśli Antigravity wyczerpie limit, Claude, Copilot lub Agent GPT natychmiast wpisuje się jako 👑 AKTUALNY LIDER i prowadzi zadania dalej bez przestoju!

---

## 📋 2. KOLEJKA ZADAŃ DO WYKONANIA (DISPATCH QUEUE)

### 📌 Zadanie Aktualne:
* **ID:** `TASK-ICC-002`
* **Nazwa:** Wdrożenie Zasady Dynamicznego Liderstwa Sztabu (Rotating Chief Leader)
* **Prowadzący Lider:** Antigravity
* **Status:** `DONE` (Ukończono & Zsynchronizowano)
* **Kryteria Akceptacji:** Wpisanie zasady płynnego przejmowania roli Lidera do wszystkich instrukcji AI, pomyślny test Strażnika Kodu (10/10).

---

## 🔄 3. PROCEDURA PRZEJĘCIA ROLI LIDERA

1. **Wykrycie braku tokenów u poprzednika:** Nowy agent wchodzący do czatu przejmuje stery.
2. **Monit Przejęcia:** Melduje:
   `👑 MONIT PRZEJĘCIA LIDERA [@ICC]: [Nazwa Nowego Agenta] ➔ Przejmuję rolę Lidera Sztabu (aktywne tokeny). Podejmuję zadanie [ID] z DISPATCH_BOARD.md`
3. **Prowadzenie & Deploy:** Nowy Lider weryfikuje kod Strażnikiem Kodu (`node scripts/straznik-kodu-check.js`) i wykonuje commit oraz deploy na Firebase.
