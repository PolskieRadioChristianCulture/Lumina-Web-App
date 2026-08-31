# 🏛️ LUMINA AGENT MATRIX (7-Grid Multi-Instance Simulator)

Wieloinstancyjny symulator agentów i użytkowników społeczności **LUMINA** oparty na silniku **Playwright Multi-Context Grid**.

---

## 🎯 Przeznaczenie

Symulator automatycznie uruchamia i rozmieszcza na ekranie komputera **7 odizolowanych okien telefonów komórkowych (iPhone / Pixel 390×844px)** w układzie kafelkowym (Grid), reprezentujących kluczowe role i tożsamości w społeczności:

1. **Cezary Rogowski** (`/lumina.cezaryrgowski`) – Założyciel & Dowódca
2. **Wioletta Rogowska** (`/lumina.wiolettarogowska`) – Liderka Społeczności CC
3. **Jola Wójcik** (`/lumina.jolawojcik`) – Użytkownik Zweryfikowany (Warszawa)
4. **Andrzej Thiel** (`/lumina.andrzejthiel`) – Lektor & Muzyk Uwielbienia
5. **Magdalena** (`/lumina.magdalena`) – Wstawiennik Modlitewny (Gdańsk)
6. **Mężczyźni CC** (`/lumina.ccmen`) – Wspólnota Mężczyzn Wiary
7. **Kobiety CC** (`/lumina.ccwomen`) – Wspólnota Kobiet Wiary

---

## 🚀 Jak uruchomić symulator na Twoim komputerze:

### 1. Wymagania wstępne (jednorazowo):
```bash
npm install -D playwright
npx playwright install chromium
```

### 2. Uruchomienie przeciwko produkcji (`https://polskieradio.cc`):
```bash
npm run matrix
```

### 3. Uruchomienie przeciwko serwerowi lokalnemu (`http://localhost:3000`):
```bash
npm run matrix:local
```

---

## 📁 Struktura Modułu:

* `config.json` – Konfiguracja 7 agentów, wymiary okien, pozycje X/Y na ekranie, adresy startowe.
* `launch_grid.js` – Główny silnik uruchomieniowy Playwright z trwałą pamięcią sesji (`.matrix_sessions/`).
* `scenarios.js` – Autonomiczne scenariusze zachowań w tle (przeglądanie profili, czat, tablica, odtwarzacz).
