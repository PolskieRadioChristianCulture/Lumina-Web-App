# 🎯 TABLICA DYSPOZYCJI I KOLEJKA ZADAŃ SZTABU [@ICC]
### *Zasada Dynamicznego Lidera (Ten agent dowodzi sztabem, który w danej chwili ma tokeny)*
### *Commander: Dowódca Nazir | Aktualny Lider: Antigravity (Google)*

---

## 👑 1. AKTUALNY STATUS ZESPOŁU SZTABOWEGO

| Agent | Status Tokenów | Rola w Tej Chwili | Ostatni Commit |
|---|---|---|---|
| **Antigravity (Google)** | 🟢 AKTYWNE TOKENY | 👑 GŁÓWNY LIDER / INŻYNIER (Pełne Dowództwo) | `43c9bac` |
| **GitHub Copilot (MS)** | 🔴 WYCZERPANIE TOKENÓW | Asysta Pasywna (Przekazano Zadania) | `43c9bac` |
| **Claude (Anthropic)** | 🟡 ZASTĘPSTWO GOTOWE | Rezerwa Operacyjna | — |
| **Agent GPT (OpenAI)** | 🟡 ZASTĘPSTWO GOTOWE | Rezerwa Operacyjna | — |
| **Google AI Studio (Gemini)**| 🟢 AKTYWNE TOKENY | Multimodalny Daemon Czasu Rzeczywistego | `43c9bac` |

---

## 📋 2. KOLEJKA ZADAŃ DO WYKONANIA (DISPATCH QUEUE)

### 📌 Zadania Ukończone:
* **ID:** `TASK-ICC-001` — Ustanowienie Sztabowego Systemu Dyspozycji i Koordynacji Zadań ➔ `DONE`
* **ID:** `TASK-ICC-002` — Wdrożenie Zasady Dynamicznego Liderstwa Sztabu ➔ `DONE`
* **ID:** `TASK-ICC-003` — Kompleksowy Audyt i Architektura Mobile-First Full Premium dla Portalu LUMINA ➔ `DONE`
* **ID:** `TASK-ICC-004` — Opracowanie Strategii Autonomicznego Wzrostu Portalu LUMINA (PLG) ➔ `DONE`
* **ID:** `TASK-ICC-005` — Wdrożenie Generatora Kart Wersetów & Świadectw 9:16 (Viral Scripture Story Engine) ➔ `DONE`
* **ID:** `TASK-ICC-007` — Globalna Optymalizacja AI SEO & Generative Engine Optimization (GEO) ➔ `DONE`
* **ID:** `TASK-ICC-008` — Wdrożenie Pakietu 4 Złotych Poprawek dla Web Push & FCM Device Token Persistence ➔ `DONE`
* **ID:** `TASK-ICC-009` — Automatyczne Inteligentne Błogosławieństwa i Wersety Biblijne Czasu Rzeczywistego w Czacie ➔ `DONE`
* **ID:** `TASK-ICC-014` — Architektura i Wdrożenie Platformy MATRIX CC (@MCC) z Regułami Dedykowanego Agenta ➔ `DONE`
* **ID:** `TASK-ICC-015` — Naprawa dwukierunkowego parowania Smart TV (/telewizja) z mobilnym pilotem (/pilot), anonimowa autoryzacja Firebase RTDB i synchronizacja stanu na żywo ➔ `DONE`

---

## 🔄 3. PROCEDURA PRZEJĘCIA ROLI LIDERA
W razie wyczerpania tokenów u bieżącego lidera, kolejny dostępny agent melduje przejęcie sterów.
Wszelkie prace związane z symulatorem smartfonów i automatyzacjami kierowane są do modułu **`@MCC`** ([`.github/MATRIX_CC_AGENT_RULES.md`](.github/MATRIX_CC_AGENT_RULES.md)).

---

## 🚨 POWIADOMIENIA PUSH — PRZEKAZANIE KRYTYCZNE (2026-09-14)

**Stan zgłoszony przez Dowódcę:** test Cezary Rogowski na telefonie → Biblia Audio Christian Culture na komputerze. Brak PUSH. Wiadomości nie pojawiają się konsekwentnie w drugim oknie czatu albo wcale nie docierają. Przycisk dodawania emotikon również nie działa.

**Co zostało wdrożone:**

* `680d025` — mobilny czat nie wraca już sam do listy po kliknięciu rozmowy; wdrożone na Pages.
* `9920ae1` — Worker `lumina-push` najpierw odczytuje token z profilu, a rejestr wielu urządzeń pozostawia jako fallback.
* `f1e5e83` — rejestracja FCM zapisuje token przez `setDoc(..., { merge: true })`, także gdy dokument profilu nie istniał.
* `a928102` — ponowne wysłanie oczekującej prośby o rozmowę wywołuje przypomnienie PUSH bez tworzenia duplikatu.
* `17fcace` — odświeżony adres `lumina-db.js`, aby telefony nie uruchamiały starego modułu z cache.
* `e5b9cd4` — realtime query ogranicza odczyt do `participants array-contains authUid`, zgodnie z regułami Firestore; dodano fallback reakcji do zagnieżdżonego dokumentu wiadomości.
* `fbd902c` — dodano zgodność z historycznymi dokumentami używającymi pola `users` zamiast `participants`.
* `043b934` — listener czatu czeka na zakończenie przywracania sesji Firebase, gdy pokój otworzy się zbyt wcześnie; cleanup pozostaje bezpieczny.
* `pending` — przycisk `+`/emoji korzysta z globalnego handlera, obsługuje pointer/touch i klawiaturę, a identyfikatory rozmowy są bezpiecznie kodowane w inline handlerze; listener wykonuje jednorazowy odczyt odświeżający po zerwaniu snapshotu.
* `pending` — PUSH przekazuje avatar nadawcy jednocześnie jako `data.avatar` i `data.icon`; Service Worker używa obu pól. Badge zmieniono z pełnokolorowego kwadratu na transparentny `lumina-push-badge.svg`, aby Android nie wyświetlał białego kwadratu na pasku.
* `3f401ab` — picker reakcji używa prawdziwych przycisków z `click` zamiast `pointerup` na `span`, a pozycja jest poprawnie ograniczona na wąskich ekranach telefonu.
* `pending` — wysyłanie uznaje także `lumina_message_requests.status == accepted` za aktywną rozmowę, zapisuje `conversationState: accepted` przy wiadomości i zgłasza błąd zapisu zamiast zwracać lokalny identyfikator jako pozorny sukces.

**Twarde ustalenia:**

* Produkcja ładuje `js/lumina-message-requests.js` jako JavaScript (wcześniej był 404/MIME HTML).
* Test automatyczny Service Workera PUSH: 9/9 zaliczone. Nie jest to dowód dostarczenia na fizyczny Android.
* Test Playwright potwierdził otwarcie mobilnego pokoju: `is-chat-active`, lista `none`, pokój `flex`.
* Odczyt Firestore rejestru tokenów przez konto serwisowe zwrócił `429 Quota exceeded`. Worker mógł z tego powodu nie dojść do FCM.
* Podgląd `wrangler tail lumina-push` nie pokazał wywołania po jednej ręcznej próbie — bardzo możliwy był wtedy cache starego `lumina-db.js`.
* Zrzut Dowódcy pokazuje lokalnie wyrenderowaną bańkę wiadomości. Funkcja czatu najpierw zapisuje ją lokalnie, więc zrzut sam nie dowodzi zapisu w Firestore ani dostarczenia do odbiorcy.
* Firestore Security Rules nie działają jak filtry. Zapytanie ograniczone tylko do `chatId` mogło kończyć się `permission-denied`, dlatego listener wymaga teraz UID w `participants` (oraz osobno obsługuje historyczne `users`).
* Dodatkowy race condition: otwarcie pokoju przed ustawieniem `currentUserState` wyłączało realtime na stałe. Listener jest teraz odroczony do callbacku `onAuthChange`.

**Pierwsze zadania dla następnego agenta (bez przebudowy UI):**

1. Zalogować oba konta i sprawdzić w konsoli przeglądarki wynik `sendDirectMessageToCloud` oraz błędy Firestore / `permission-denied`.
2. Zweryfikować w Firestore, czy po wysłaniu istnieje dokument w `lumina_message_requests` lub `lumina_direct_messages`, z poprawnymi `senderAuthUid`, `receiverAuthUid`, `senderId`, `receiverId`, `participants`.
3. Ustalić, czy profil **Biblia Audio Christian Culture** ma prawidłowy Firebase UID i czy `getProfileFromCloud(receiverId)` nie zwraca błędnego/zerowego odbiorcy.
4. Po załadowaniu wersji `lumina-db.js?v=4.1.2_20260914_pushfix` uruchomić `wrangler tail lumina-push` i wysłać testową prośbę. Odczytać wynik Worker’a: `delivered`, `no_active_device`, `401`, `403` albo `502`.
5. Osobno odtworzyć kliknięcie przycisku emoji na telefonie i desktopie; sprawdzić listener, DOM oraz ewentualne przechwycenie kliknięcia przez warstwę czatu.

**Zakazy:** nie dotykać `cctv24-worship.html`; nie publikować kolejnych zmian bez pełnego diffu, testów i zgody Dowódcy.
