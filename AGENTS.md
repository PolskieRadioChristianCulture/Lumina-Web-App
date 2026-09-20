# 🤖 MULTI-AGENT INSTRUCTIONS (AGENTS.md) — CHRISTIAN CULTURE & LUMINA

## 👑 ZASADA DYNAMICZNEGO LIDERSTWA (ROTATING CHIEF LEADER)
Gdy poprzedniemu agentowi wyczerpią się tokeny, a Ty posiadasz aktywne tokeny:
**AUTOMATYCZNIE PRZEJMUJESZ ROLĘ GŁÓWNEGO LIDERA I DYSPOZYTORA SZTABU W IMIENIU DOWÓDCY NAZIRA.**

### Jak przejąć stery jako Lider:
1. Sprawdź `git status`, ostatni commit i plik **`.github/DISPATCH_BOARD.md`**.
2. Zamelduj: `👑 MONIT PRZEJĘCIA LIDERA [@ICC]: [Twój Agent] ➔ Przejmuję dowodzenie sztabem (aktywne tokeny). Kontynuuję zadanie [ID]...`
3. Prowadź implementację, pilnuj Strażnika Kodu (`node scripts/straznik-kodu-check.js`) i wykonuj commity/wdrożenia.

---

## 🚨 NACZELNE HASŁO OPERACYJNE DOWÓDCY: `@ICC` (lub `@monit`)
Gdy Dowódca wpisze w czacie **`@ICC`** lub **`@monit`**, masz **bezwzględny obowiązek** natychmiast wygenerować pełny raport:

```markdown
📡 PEŁNY MONIT OPERACYJNY [@ICC]:
* 👑 **Aktualny Lider:** [Twoja Nazwa Agenta]
* 🎯 **Bieżące Zadanie:** [Zadanie pobrane z .github/DISPATCH_BOARD.md]
* 📦 **Ostatni Commit:** [ID commita z git log -1] | Gałąź: main
* 🛡️ **Strażnik Kodu:** [Wynik: node scripts/straznik-kodu-check.js]
* 🌐 **Status Produkcji:** [Firebase Hosting: live / zsynchronizowano]
* 📋 **Następny Krok:** [Co robisz dalej]
```

---

## 🛡️ PANCERNE ZASADY KODU
1. Przed commitem ZAWSZE uruchom: `node scripts/straznik-kodu-check.js` (musi być 0 naruszeń).
2. BEZWZGLĘDNY ZAKAZ dotykania działających kanałów nadawczych (`cctv24-worship.html`, `stream-scene.html` itp.).
3. PUSH do OBU repozytoriów: `git push origin main` oraz `git push lumina-repo main`.
4. Nigdy nie ujawniaj ani nie wyświetlaj tekstów "Mission Control" na stronach publicznych.

## 🔒 REGUŁA NADRZĘDNA PROFILI LUMINA — JEDEN STANDARD
Ta reguła ma pierwszeństwo przed pomysłami projektowymi, skrótami implementacyjnymi i lokalnymi poprawkami agentów.

1. **Każdy obecny i przyszły profil użytkownika korzysta z jednego kanonicznego renderera:** `lumina-profile.html?u=<slug>`.
2. **Nowy użytkownik jest rekordem danych, nie nowym plikiem HTML.** Nie wolno tworzyć kolejnych stron `lumina.<osoba>.html`, kopiować istniejącego profilu ani rozwijać osobnego wariantu układu.
3. Wszystkie pełne powierzchnie profilowe muszą ładować dokładnie jeden wspólny kontrakt `/css/lumina-profile-standard.css` po starszych warstwach CSS oraz posiadać klasę `lumina-profile-standard` na `<body>`.
4. Wspólne pozostają: geometria, responsywność, nagłówek, tło, awatar, działania, zakładki, karty, typografia, odstępy, stany oraz zachowanie mobilne. Indywidualne są wyłącznie dane i tokeny: treść, zdjęcia, rola, odznaki i kolor akcentu.
5. **Dodatki specjalne są zabronione bez wyraźnego polecenia Cezarego Rogowskiego.** Zgoda musi zostać udokumentowana w kodzie komentarzem:
   `<!-- LUMINA_PROFILE_EXCEPTION: approved-by=Cezary Rogowski; scope=<dokładny zakres>; reason=<powód> -->`.
   Wyjątek ma być minimalny, nie może kopiować całego profilu ani omijać wspólnego standardu.
6. Agent zmieniający profile musi uruchomić Strażnika i test `node --test scripts/mobile-premium-regression.test.mjs`. Naruszenie reguły L blokuje commit, merge i wdrożenie.
