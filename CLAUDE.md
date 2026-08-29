# 🤖 CLAUDE AGENT INSTRUCTIONS — CHRISTIAN CULTURE & LUMINA

## 🚨 NACZELNE HASŁO OPERACYJNE DOWÓDCY: `@ICC` (lub `@monit`)
Gdy Dowódca (Użytkownik) wpisze w czacie **`@ICC`** lub **`@monit`**, masz **bezwzględny obowiązek** natychmiast wygenerować pełny, ustrukturyzowany **Raport Gotowości Bojowej**:

```markdown
📡 PEŁNY MONIT OPERACYJNY [@ICC]:
* 🤖 **Aktywny Agent:** Claude (Anthropic)
* 🎯 **Bieżące Zadanie:** [Zadanie pobrane z .github/DISPATCH_BOARD.md]
* 📦 **Ostatni Commit:** [ID commita z git log -1] | Gałąź: main
* 🛡️ **Strażnik Kodu:** [Wynik: node scripts/straznik-kodu-check.js]
* 🌐 **Status Produkcji:** [Firebase Hosting: live / zsynchronizowano]
* 📋 **Następny Krok:** [Co robisz dalej / przekazanie do Antigravity na deploy]
```

---

## 🎯 SZTAB DYSPOZYCJI ZADAŃ (Antigravity ➔ Claude)
* **Główny Koordynator Zadań:** Antigravity (działa w imieniu Dowódcy Nazira).
* **Jak pobrać zadanie:** Sprawdź plik **`.github/DISPATCH_BOARD.md`**. Znajdź zadanie ze statusem `TODO` dopasowane do Twoich kompetencji (logika, audyt, UX, architektura), zmień na `IN_PROGRESS` i realizuj.
* **Po wykonaniu:** Uruchom `node scripts/straznik-kodu-check.js`, ustaw w `DISPATCH_BOARD.md` status `READY_FOR_REVIEW` i zamelduj: `@Antigravity - zadanie gotowe do weryfikacji i wdrożenia`.

---

## 📡 MONIT PRZY KAŻDEJ AKCJI („Aktualnie pracuję nad...”)
Zawsze przed i w trakcie wykonywania kroków zadeklaruj:
`📡 MONIT OPERACYJNY: Claude ➔ Aktualnie pracuję nad: [opis zadania/pliku]...`

---

## 🔄 ROTACJA I ZASTĘPOWALNOŚĆ (Token-Limit Resilience)
Dowódca korzysta z darmowych pakietów narzędzi AI. W każdej chwili innemu agentowi mogą skończyć się tokeny. Gdy zostajesz wywołany słowem *"kontynuuj"*, *"dokończ"* lub `@ICC`, sprawdź `git status`, pobierz stan z `DISPATCH_BOARD.md` i natychmiast podejmij zadanie w punkcie przerwania.

---

## 🛡️ PANCERNE ZASADY KODU
1. Przed commitem ZAWSZE uruchom: `node scripts/straznik-kodu-check.js` (musi być 0 naruszeń).
2. BEZWZGLĘDNY ZAKAZ dotykania działających kanałów nadawczych (`cctv24-worship.html`, `stream-scene.html` itp.).
3. PUSH do OBU repozytoriów: `git push origin main` oraz `git push lumina-repo main`.
4. Nigdy nie ujawniaj ani nie wyświetlaj tekstów "Mission Control" na stronach publicznych.
