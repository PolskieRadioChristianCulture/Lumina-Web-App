# CC — zakaz regresji

ID: CC-NO-REGRESSION-20261003. Polecenie właściciela z 3 października 2026, Europe/Warsaw.

Obowiązuje cały ekosystem Christian Culture: WWW, LUMINA, CCN i portale tematyczne, PWA, Android, desktop, radio, TV, synchronizację, automatyzacje oraz wszystkich współpracujących ludzi i agentów.

**Nie wolno publikować zmiany, która cofa zaakceptowane działanie, wygląd, dostępność, dane lub integrację. Nieudany wymagany test blokuje publikację.** Nowa funkcja nie usprawiedliwia pogorszenia istniejącej.

## Obowiązkowa kontrola wydania

1. Ustal bieżący commit i wdrożenie produkcyjne, źródło komponentu, zaakceptowane zachowanie oraz równoległe zadania w JOMA. Nie publikuj starego checkoutu ani starego katalogu build. Scalenie nie może kasować cudzej pracy.
2. Zachowuj jeden kanoniczny kod komponentu i odtwarzalny build. Nie naprawiaj zminifikowanego bundle zamiast źródła. Zmiana HTML, generatora lub ścieżki publikacji musi zachować wcześniej przyjęte kontrakty. Dla CCN News źródłem jest `portals/ccn-news`, nie doraźna kopia w scratch.
3. Każda potwierdzona, powracająca usterka otrzymuje test lub powtarzalną kontrolę, która wykrywa starą wadę. Sprawdzaj również gotowy artifact, cache i publiczną trasę po wdrożeniu. Sam build ani obecność elementu w DOM nie dowodzą poprawnego działania.
4. Dla zmian UI: sprawdź co najmniej 320, 390 i 1280 px, odpowiednie jasne/ciemne motywy, dotyk lub przewijanie klawiaturą, widoczność kontrolek, brak poziomego rozlewania dokumentu, czytelność, fokus i sąsiadujące funkcje. Belka z linkami przewija się we własnym obszarze. Sprawdź pierwsze wejście i ponowne otwarcie; komunikat awarii nie może zastępować normalnego startu strony.
5. Dla innych komponentów dobierz kontrolę ich rzeczywistych kontraktów: synchronizacja i świeżość stanu, trwałość danych, logowanie i uprawnienia, odtwarzanie, offline, eksport oraz zgodność klientów — stosownie do zmienianego zakresu. Nie udawaj wykonania testu fizycznego urządzenia lub produkcji wynikiem lokalnym.
6. Przed publikacją pokaż scoped diff i wyniki kontroli, zachowaj wymagane zgody właściciela oraz znaną drogę wycofania. Zidentyfikuj pliki wydania i potwierdź, że staging zachowuje aktualne zasoby spoza poprawki. Nie umieszczaj QA, prywatnych rejestrów, kodu źródłowego lub sekretów na publicznym hostingu.
7. Wymagane testy muszą przejść. W tym repo: Strażnik Kodu, regresje mobilne oraz `npm run test:cc-regression`; dodatkowo testy i build zmienianego komponentu. Przy FAIL, konflikcie wersji, utracie zaakceptowanej funkcji lub braku kontroli krytycznej ścieżki: BLOCK DEPLOYMENT.
8. Po publikacji potwierdź wersję assetów i rzeczywisty render/obsługę zmienionej funkcji. Zapisz dowody, wdrożenie i ograniczenia w JOMA. Przy regresji zatrzymaj dalsze wydania i przywróć ostatnie sprawdzone działanie bez cofania niezwiązanych zmian; usuń przyczynę i uzupełnij test.

Zakaz jest wiążącą zasadą pracy i publikacji, a nie twierdzeniem, że wszystkie obecne systemy są bezbłędne lub zostały już objęte automatycznymi testami. Nie zmienia ochrony kanałów LIVE, zasad prywatności, doktryny, uprawnień ani kosztów. Wyjątek zmieniający zaakceptowany kontrakt musi wynikać z bezpośredniego polecenia właściciela i być zapisany z konkretnym zakresem.
