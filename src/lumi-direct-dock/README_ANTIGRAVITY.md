# CHRISTIAN CULTURE | LUMI DIRECT DOCK
## Kompletny pakiet źródłowy MVP + dyrektywa implementacyjna dla Antigravity
**Wersja:** 1.0 | **Data:** 18.10.2026 | **Ścieżki docelowe:** polskieradio.cc/lumina, /mess oraz ekosystem CC (po audycie)

## 0. WAŻNE: status tego pakietu
Zawarte pliki `src/` to realny komponent React + TypeScript + CSS i kontrakt adaptera, **nie gotowa integracja z bazą produkcyjną**. Nie znamy aktualnego schematu DB, funkcji backendowych ani konfiguracji bundlera. NIE wolno imitować DM za pomocą localStorage, fikcyjnych danych ani zapisu publicznych kolekcji. Nie istnieją tutaj kompletne implementacje połączeń telefonicznych, uploadów, audio, GIF ani powiadomień push. MVP obsługuje **tekst, listę ostatnich 6 wątków, odczyt i wysyłkę przez adapter, minimalizację, zamknięcie, licznik, opt-in auto-open, mobilną prezentację**.

## 1. Cel architektoniczny
Zachowaj całkowicie niezmienioną funkcję głównego pływającego dymka, który otwiera pokój publiczny. Dodaj globalny Direct Dock wyłącznie dla autoryzowanych DM 1:1. Nie twórz drugiego backendu komunikacji. Użyj istniejącego CC ID, wątków, reguł dostępu, API i mechanizmu zdarzeń.

## 2. Krok obowiązkowy — audyt bez modyfikowania kodu
1. Zlokalizuj repozytorium faktycznie serwujące /lumina i /mess. Sprawdź mirroring repozytoriów Lumina-Web-App i Strona-www-Christian-Culture; nie zakładaj, że są niezależne.
2. Ustal framework (React/Vite lub inny), mount point, styl, routowanie, autoryzację i cykl życia globalnego dymka.
3. Znajdź system DM: modele rozmów i wiadomości, kolekcje, permissions/rules/RLS, mechanizm realtime, statusy read i blocking.
4. Ustal, czy DM jest 1:1 i jakie pole odróżnia publiczny pokój. Zweryfikuj po stronie serwera, nie ufaj `type` z przeglądarki.
5. Wypisz istniejące komponenty i ryzyko niekompatybilności. Zrób plan minimalnego diffu. Raport do `skrzynka/` przed implementacją.

## 3. Pliki pakietu
- `src/types.ts` — stabilny typowany kontrakt dla adaptera.
- `src/LumiDirectDock.tsx` — React UI i logika.
- `src/lumi-direct-dock.css` — neutralny scoped CSS w kolorach CC.
- `src/index.ts` — publiczne eksporty.
- `src/example-integration.tsx` — przykład montażu, nie autoryzowana konfiguracja produkcyjna.
- `tests/acceptance-checklist.md` — P0/P1.

## 4. Integracja z aplikacją
1. Skopiuj `src/` do obszaru aplikacji, gdzie buduje się realnie /lumina lub /mess. Nie dodawaj frameworka drugi raz; jeżeli nie React, przepisz UI na istniejący framework, pozostawiając niezmienione wymagania.
2. Zaimplementuj `DirectMessagingAdapter` jako cienki wrapper istniejącego backendu, z następującymi kontraktami:
   - `getCurrentUserId`: tożsamość z sesji CC ID, bez adresów e-mail na sztywno.
   - `listDirectConversations`: wyłącznie wątki prywatne danego użytkownika; uwzględniaj status blokad i uczestnictwa.
   - `listMessages`: paginowane, chronologiczne, tylko autoryzowana rozmowa; obecnie klient pobiera do 50.
   - `subscribeIncomingDM`: JEDEN nasłuch prywatnych wiadomości; zadbaj o `unsubscribe`, filtr typu i adresata po serwerze oraz obsługę reconnect.
   - `sendText`: walidacja, max 4000 znaków, rate limit, członkostwo, idempotencja po `clientRequestId` po stronie backendu.
   - `markRead`: tylko faktycznie odebrane i uprawnione wiadomości, bez ujawniania informacji osobom trzecim.
   - `subscribeConversation` opcjonalne; jeżeli backend go wspiera, połącz z subskrypcją wątku, deduplikuj ID.
3. Zamontuj dokładnie jeden `LumiDirectDock` we wspólnej powłoce zalogowanego użytkownika, **obok** (nie wewnątrz) istniejącego widgetu czatu publicznego.
4. Zweryfikuj offsety, z-index, safe-area, kolizje z cookie banner, player audio, karaoke, nawigacją i oknami modalnymi.
5. Nie używaj wartości demonstracyjnych jako rzeczywistych awatarów czy imion użytkowników.

Przykład mountu (własny adapter potrzebny):
```tsx
import { LumiDirectDock } from './lumi-direct-dock';
const dmAdapter = createActualDMAdapter(existingAuth, existingMessagingService);
// Renderować TYLKO po potwierdzeniu aktywnej sesji:
{authenticatedUser && <LumiDirectDock key={authenticatedUser.id} adapter={dmAdapter} />}
```
`createActualDMAdapter` oznacza **funkcję do napisania w realnej aplikacji**, a nie gotowe API w paczce.

## 5. Polityka UX i stanów
- Bez DM: główny dymek ogólny pozostaje bez zmian. Direct Dock może pokazać ustawienia i ostatnie rozmowy dopiero po zalogowaniu; przy braku wątków nie otwiera żadnego okna.
- Nowy DM: licznik na osobnym chat head. Auto-open DOMYŚLNIE WYŁĄCZONE, do włączenia w ustawieniach.
- Minimalizacja `−`: zamyka panel, zachowuje awatar rozmówcy na liście.
- Zamknięcie `×`: ukrywa chat head; kolejna prywatna wiadomość w tym wątku przywraca osobny awatar. Jeśli preferencja auto-open jest włączona, po nowym DM może też otworzyć okno.
- Wielowątkowość: jedno otwarte okno, do 6 awatarów. Przy >6 w MVP tylko oznaczenie +N; przed globalnym wdrożeniem P1 zapewnij pełną listę rozmów.
- Mobilnie: pojedynczy panel zamiast wielu nachodzących okien.
- Enter wysyła tekst, Shift+Enter wprowadza nową linię; brak wysyłki przy IME composition.
- Status online można pokazywać tylko przy potwierdzonym sygnale obecności. Żadnych fikcyjnych zielonych kropek.
- Nie wymuszaj focusu w przychodzących oknach; po świadomym otwarciu możesz ustawiać fokus zgodnie z regułami dostępności (do wdrożenia P1).

## 6. Bezpieczeństwo danych i prywatność — blocker P0
- Klient nie decyduje o prawach do DM. Backend sprawdza auth, participant IDs, typ wątku, blokady, limit szybkości oraz zakres wysyłki/odczytu.
- Odbiór tylko prywatnych eventów skierowanych do bieżącego użytkownika; public chat nigdy nie używa tego adaptera.
- Zapis wiadomości przez autoryzowane API. Brak treści prywatnych w localStorage, URL, telemetryce, analityce i publicznym HTML/SEO.
- Nie wyświetlaj surowego HTML z treści DM; JSX tekst jest domyślnie escapowany. Nie wstawiaj `dangerouslySetInnerHTML`.
- Po wylogowaniu wyczyść cache, drafty i subskrypcje; przełączenie konta musi remountować komponent (key = user.id).
- Weryfikuj prywatność i zgodność z zasadami LUMINA, w tym blokowanie i zgłaszanie; jeżeli te endpointy nie istnieją, nie maskuj luki.
- Pliki, głosówki, emoji/stickers, serca, call/video, push wymagają osobnych bezpiecznych procedur i dopiero potem włączenia ikon.

## 7. Governance i zero kosztów
- ZERO COST: tylko istniejące darmowe usługi, biblioteki free/open-source i darmowe limity. Nowych usług płatnych nie dodawać.
- Stosuj standard CC gold: #C4A35A, hover #D4B578, light #E2CC9A, dark #A08040.
- Najpierw branch + backup; potem review przez Claude, testy P0 desktop/mobile, podpisany raport `skrzynka/` dla innych agentów.
- Nie pushuj bezpośrednio na produkcję, nie zmieniaj historycznych rozmów ani ustawień publicznego pokoju.
- Przyjmij kryteria testów z `tests/acceptance-checklist.md`, wykonaj realne testy dwoma zalogowanymi kontami testowymi, oraz udokumentuj wyniki i rollback.

## 8. Dalsza rozbudowa (nie należy udawać, że jest gotowa)
P1: pełna skrzynka wątków >6, sync multi-tab, przetestowane reconnect, scroll pagination, ustawienia konta i dostępność WCAG 2.2 AA.
P2: reakcja ❤️, emoji picker, upload obrazów, GIF, voice messages, widmo Canvas/Web Audio oraz powiadomienia push za zgodą.
P3: rozmowy voice/video oparte na istniejącym, sprawdzonym i dozwolonym środowisku; bez obietnic „darmowego” skalowania bez przeglądu kosztów.

## 9. Polecenie końcowe do Antigravity
**ZAIMPLEMENTUJ komplet funkcji MVP pod realny backend. Najpierw audyt repo i usług, potem adapter, testy autoryzacji, UI, E2E i raport dla Claude w skrzynka/. Nie zmieniaj publicznego dymka. Nie nazywaj integracji ukończoną bez przeprowadzonych testów dwóch kont i zatwierdzenia wdrożenia. W przypadku braku danych lub niewspieranych endpointów podaj BLOCKER i konkretne brakujące elementy, nie zastępuj ich atrapami.**
