# 🤖 MULTI-AGENT INSTRUCTIONS (AGENTS.md) — CHRISTIAN CULTURE & LUMINA
### Standard Operacyjny dla Agenta: Antigravity, Gemini, Claude, ChatGPT, DeepSeek Harness
*Zgodny z `LUMINA_CONSTITUTION.md` (Wersja 1.0 — 2026)*

---

## 👑 1. ZASADA DYNAMICZNEGO LIDERSTWA (ROTATING CHIEF LEADER)
Gdy poprzedniemu agentowi wyczerpią się tokeny, a Ty posiadasz aktywne tokeny:
**AUTOMATYCZNIE PRZEJMUJESZ ROLĘ GŁÓWNEGO LIDERA I DYSPOZYTORA SZTABU W IMIENIU DOWÓDCY NAZIRA.**

### Jak przejąć stery jako Lider:
1. Sprawdź `git status`, ostatni commit i plik **`.github/DISPATCH_BOARD.md`**.
2. Zamelduj: `👑 MONIT PRZEJĘCIA LIDERA [@ICC]: [Twój Agent] ➔ Przejmuję dowodzenie sztabem (aktywne tokeny). Kontynuuję zadanie [ID]...`
3. Prowadź implementację, pilnuj Strażnika Kodu (`node scripts/straznik-kodu-check.js`) i wykonuj commity/wdrożenia.

---

## 🚨 2. NACZELNE HASŁO OPERACYJNE DOWÓDCY: `@ICC` (lub `@monit`)
Gdy Dowódca wpisze w czacie **`@ICC`** lub **`@monit`**, masz **bezwzględny obowiązek** natychmiast wygenerować pełny raport:

```markdown
📡 PEŁNY MONIT OPERACYJNY [@ICC]:
* 👑 **Aktualny Lider:** [Twoja Nazwa Agenta]
* 🎯 **Bieżące Zadanie:** [Zadanie pobrane z .github/DISPATCH_BOARD.md]
* 📦 **Ostatni Commit:** [ID commita z git log -1] | Gałąź: main
* 🛡️ **Strażnik Kodu:** [Wynik: node scripts/straznik-kodu-check.js]
* 🌐 **Status Produkcji:** [Cloudflare Pages: live / zsynchronizowano]
* 📋 **Następny Krok:** [Co robisz dalej]
```

---

## 📜 3. REGUŁY EGZEKWOWANIA KONSTYTUCJI LUMINA (RFC 2119 SPEC)

Każdy agent modyfikujący kod repozytorium **MUSI** bezwzględnie przestrzegać poniższych poziomów wymuszenia:

### 🔴 [MUST NOT] — KATEGORYCZNIE ZABRONIONE:
1. **[MUST NOT]** Tworzyć fałszywych profili, sztucznych kont, generowanych przez AI świadectw ani botów udających użytkowników.
2. **[MUST NOT]** Symulować sztucznej aktywności (fałszywe liczniki polubień, sztuczne `online`, generowane dopaminowe notyfikacje).
3. **[MUST NOT]** Projektować interfejsów manipulacyjnych (dark patterns) ani ukrywać przycisku „Usuń konto”.
4. **[MUST NOT]** Prezentować sztucznej inteligencji (AI) jako człowieka lub potencjalnego partnera romantycznego.
5. **[MUST NOT]** Przypisywać algorytmowi rozeznania woli Bożej (*„Bóg wybrał tę osobę dla Ciebie”*).
6. **[MUST NOT]** Oceniać wartości człowieka (zakaz ocen atrakcyjności fizycznej, duchowej czy religijnej).
7. **[MUST NOT]** Publikować ani przekazywać precyzyjnych współrzędnych GPS użytkowników do publicznego frontendu.
8. **[MUST NOT]** Wprowadzać do kodu sekretów, kluczy prywatnych ani tokenów (`API_KEY`, `ADMIN_KEY`, `PASSWORD`).
9. **[MUST NOT]** Dotykać ani modyfikować zamrożonych produkcyjnych kanałów nadawczych (`cctv24-worship.html`, `cctv24-worship-live.html`, `stream-scene.html`, `cctv24.html`, `snadaniowa-live.html`, `zapolske-live.html`).
10. **[MUST NOT]** Upubliczniać nazwy, logiki ani ekranów „Mission Control” na stronach publicznych.
11. **[MUST NOT]** Modyfikować plików niezwiązanych z powierzonym zadaniem (zakaz „przypadkowych refaktorów”).

### 🟢 [MUST] — BEZWZGLĘDNIE WYMAGANE:
1. **[MUST]** Weryfikować pełnoletniość użytkownika (18+) zarówno po stronie UI, jak i reguł bezpieczeństwa backendu/Firestore.
2. **[MUST]** Wymagać jawnej, świadomej zgody (explicit consent) na przetwarzanie danych szczególnych kategorii (wyznanie, preferencje relacyjne — RODO Art. 9).
3. **[MUST]** Zapewniać pełną wyjaśnialność rekomendacji w *Lumina Connect* (rozbicie na składowe wartości, brak „czarnej skrzynki”).
4. **[MUST]** Implementować trwały zapis danych (*Database First*) w Firestore przed wyświetleniem sukcesu w UI.
5. **[MUST]** Każdy profil użytkownika obsługiwać przez jeden kanoniczny renderer: `lumina-profile.html?u=<slug>`.
6. **[MUST]** Przejść pełną ścieżkę weryfikacji przed commitem:
   - `node scripts/straznik-kodu-check.js` (wymagane: **0 naruszeń**),
   - `node --test scripts/mobile-premium-regression.test.mjs` (wymagane: **100% testów zaliczonych**).
7. **[MUST]** Wypychać commity do **OBU** repozytoriów: `origin main` oraz `lumina-repo main`.
8. **[MUST]** Wdrożenie Cloudflare Pages wykonywać z czystym stanem repozytorium i przeprowadzić test produkcyjny (smoke test / screenshot).

### 🟡 [SHOULD] — ZALECANE STANDARDY JAKOŚCI:
1. **[SHOULD]** Projektować interfejsy z myślą o urządzeniach mobilnych (PWA, ergonomia dotyku min. 44px, brak przełamań na małych ekranach).
2. **[SHOULD]** Zapewniać dostępność WCAG 2.2 AA (kontrast, etykiety formularzy, czytniki ekranowe).
3. **[SHOULD]** Minimalizować wagę ładowanych skryptów JavaScript i stosować atrybuty `defer` / `loading="lazy"`.
4. **[SHOULD]** Logować zdarzenia bezpieczeństwa z poszanowaniem prywatności (bez haseł i treści prywatnych rozmów).

### ⛔ [BLOCK DEPLOYMENT] — KIEDY AGENT MA OBOWIĄZEK PRZERWAĆ PRACĘ:
Jeśli wystąpi którykolwiek z poniższych warunków, **DEPLOYMENT JEST ZABLOKOWANY**:
- `node scripts/straznik-kodu-check.js` zwróci jakikolwiek błąd lub naruszenie reguły.
- Jakikolwiek test w zestawie `node --test` zakończy się niepowodzeniem (`FAIL`).
- `git status` wykaże nieintencjonalne zmiany w produkcyjnych kanałach TV/Radio.
- Agent nie posiada pewności co do procedury wycofania zmiany (*Rollback plan*).

---

## 🔒 4. REGUŁA NADRZĘDNA PROFILI LUMINA — JEDEN STANDARD
1. **Każdy obecny i przyszły profil użytkownika korzysta z jednego kanonicznego renderera:** `lumina-profile.html?u=<slug>`.
2. **Nowy użytkownik jest rekordem danych, nie nowym plikiem HTML.** Nie wolno tworzyć kolejnych stron `lumina.<osoba>.html`, kopiować szablonów ani tworzyć odrębnych struktur DOM.
3. Wszystkie powierzchnie profilowe muszą ładować dokładnie jeden wspólny kontrakt `/css/lumina-profile-standard.css` oraz posiadać klasę `lumina-profile-standard` na tagu `<body>`.
4. Wspólne pozostają: geometria, responsywność, nagłówek, tło, awatar, działania, zakładki, karty, typografia, odstępy, stany oraz zachowanie mobilne. Indywidualne są wyłącznie dane i tokeny: treść, zdjęcia, rola, odznaki i kolor akcentu.
5. Dodatki specjalne są zabronione bez wyraźnego polecenia Cezarego Rogowskiego. Zgoda musi zostać udokumentowana komentarzem:
   `<!-- LUMINA_PROFILE_EXCEPTION: approved-by=Cezary Rogowski; scope=<dokładny zakres>; reason=<powód> -->`.

---

## 🚪 5. PLAN WDROŻENIA 5 BRAM P0 (ROADMAP ARCHITEKTURY)
Każdy agent podejmujący prace nad portalem LUMINA realizuje poniższy harmonogram priorytetów:

1. **Bramka P0-1 (Security & Auth):**
   - Likwidacja weryfikacji uprawnień administracyjnych opartej na lokalnym PIN-ie w przeglądarce.
   - Przeniesienie autoryzacji do Firebase Auth Custom Claims (`admin: true`) / bezpiecznego Cloudflare Worker z rejestracją sesji (Audit Log).
2. **Bramka P0-2 (Truth Audit):**
   - Przegląd wszystkich etykiet, liczników i statusów w UI (`online`, `followers`, `likes`, `match`).
   - Oznaczenie wszystkich zasobów testowych jednoznaczną etykietą `DEMO` lub ich zastąpienie realnymi zapytaniami do bazy.
3. **Bramka P0-3 (Privacy & RODO / DPIA):**
   - Sformalizowanie rejestru przetwarzania danych szczególnych kategorii (wyznanie, preferencje).
   - Zapewnienie pełnej procedury „Prawa do bycia zapomnianym” (1-kliknięcie trwałego usunięcia profilu z bazy).
4. **Bramka P0-4 (Safety & Anti-Scam):**
   - Rozbudowa filtrów wykrywających próby wyłudzeń finansowych (BLIK, telegram, pożyczki).
   - Dwustronna blokada użytkownika i formularz odwoławczy od decyzji moderacyjnej.
5. **Bramka P0-5 (Engineering & CI Pipeline):**
   - Włączenie weryfikatora konstytucyjnego do automatycznego skryptu `node scripts/straznik-kodu-check.js`.
