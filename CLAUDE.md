# 🤖 CLAUDE INSTRUCTIONS — POLSKIERADIO.CC / CHRISTIAN CULTURE (@ICC)

> 🛡️ **DLA MODELI CLAUDE (SONNET / OPUS) W ANTIGRAVITY:**
> To repozytorium jest głównym kodem źródłowym stron WWW misji **Christian Culture** (Dowódca Nazir / Cezary Rogowski).
> Obowiązuje standard **Zero-QA dla Dowódcy** (JOMA-D005) oraz **Zakaz Regresji** (`CC_NO_REGRESSION_POLICY.md`).

---

## 👑 ZASADA DYNAMICZNEGO LIDERSTWA (ROTATING CHIEF LEADER)
Gdy poprzedniemu agentowi wyczerpią się tokeny, a Ty posiadasz aktywne okno kontekstu:
**AUTOMATYCZNIE PRZEJMUJESZ ROLĘ GŁÓWNEGO LIDERA I DYSPOZYTORA SZTABU W IMIENIU DOWÓDCY NAZIRA.**

### Jak działać jako Lider:
1. Sprawdź `git status`, ostatni commit i pliki w `C:\Users\czark\Desktop\Misja CC\JOMA_SHARED_MEMORY` (`JOMA_STATUS.md`, `JOMA_HANDOFFS.md`).
2. Prowadź implementację, pilnuj Strażnika Kodu (`npm.cmd run test:guardian`), testów regresji i wykonuj commity/wdrożenia.
3. Nigdy nie pytaj Dowódcy o podstawy ekosystemu.

---

## 🚨 SŁOWNIK KOMEND OPERACYJNYCH DOWÓDCY (@...)
Gdy Dowódca wpisze w czacie hasło z `@`:

- **`@ICC`** — Integracja Christian Culture. Zobacz `MISJA_INTEGRACJA.md`.
- **`@Joma`** — Protokół Wspólnej Pamięci AI. Rejestr: `C:\Users\czark\Desktop\Misja CC\JOMA_SHARED_MEMORY`. Przeczytaj `DLA_ANTIGRAVITY.md` i `JOMA_STATUS.md`.
- **`@Nazir` / `@N`** — Dowódca Cezary Rogowski. Standardy jakości, wirtualny audytor.
- **`@SMCC` / `@Strażnik`** — Strażnik Kodu (`npm.cmd run test:guardian`), touch min. 44px, zero regresji.
- **`@ProgresMCC` / `@Progres`** — Eliminacja długu technicznego i inspekcja całego systemu.
- **`@Lumina`** — Portal społecznościowy (`lumina.html`, `lumina-tablica.html`, `lumina-profile.html`), Champagne Gold (`#C4A35A`).
- **`@Player`** — Odtwarzacz Spotify-style (`player.html` na `polskieradio.cc/player`).
- **`@Akademia` / `@KC`** — Kurs Codzienny i Z Biblią Za Pan Brat (`akademia/kurscodzienny`).
- **`@MojaBiblia` / `@mb`** — Interlinearna Biblia (`mojabiblia.html`).
- **`@news` / `@CCN`** — Portale CCN News (`/news`, `/nauka`, `/historia` itd.). Zakaz fikcyjnych ekspertów.
- **`@live`** — Transmisja na żywo (`stream-scene.html`). Kategoryczny zakaz edycji `cctv24-worship.html`!
- **`@vod`** — Kino VOD (`vod.html`).

---

## 🛡️ PANCERNE ZASADY PRACY
1. **Zawsze `npm.cmd`** w konsoli Windows PowerShell (zamiast `npm`).
2. **Przed commitem ZAWSZE uruchom 3 testy:**
   ```powershell
   npm.cmd run test:cc-regression
   npm.cmd run test:guardian
   npm.cmd run test:mobile-premium
   ```
3. **Podwójny Git Push:**
   ```powershell
   git push origin main
   git push lumina-repo main
   ```
4. **Synchronizacja lustra:** Po zatwierdzeniu zmian skopiuj zmienione pliki do `C:\Users\czark\Desktop\@ICC\LUMINA`.
5. **JOMA Handoff:** Zaktualizuj `C:\Users\czark\Desktop\Misja CC\JOMA_SHARED_MEMORY\JOMA_HANDOFFS.md` ze statusem `done`.
6. **Poufność Mission Control:** Nigdy nie emituj ani nie wpisuj słów "Mission Control" na stronach publicznych.
