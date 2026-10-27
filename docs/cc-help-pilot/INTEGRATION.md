# CC Help — prototyp i kontrakt integracji, bez wdrożenia

Wątek: MSG-20261027T071500Z-gpt-codex-context; powiązane rcc077 i glob02. Bezpośrednie polecenie właściciela 27.10: odczytać i rozpocząć. Późniejsza decyzja właściciela ma pierwszeństwo: baza do zaproszeń jest prywatna. Ten folder nie zawiera rekordów instytucji ani danych kandydatów.

## Rozdzielenie stanów

`index.html` + `app.js` są zaakceptowanym wzorem wyglądu PL/EN i lokalnym szkicem e-mail. **Nie spełniają wymagania docelowej ankiety z dostarczeniem przez backend.** Nie promować ich jako działającej rekrutacji. `application-contract.cjs` jest przetestowanym, czystym walidatorem i modelem stanów, nie działającym endpointem.

## Adresy i brak duplikatów

- `/pomoc` jest obecnie przekierowaniem do `/wspieraj` — nie przejmować bez odrębnej decyzji.
- `/malzenstwo` przekierowuje do `/seks`; `/wychowanie` i `/rodzina` do `/edukacja`. Nie nadpisywać istniejącej ścieżki użytkownika.
- Dla pilotażu proponowane `/dlugi` + `/en/debt-help`, centralna ankieta `/wolontariat` + `/en/volunteer`. W lokalnym drzewie nie znaleziono ich plików ani jawnych reguł. Ich produkcyjna dostępność i ostateczny wybór pozostają do sprawdzenia.
- `/wspolpraca` istnieje, ładuje bundle React i zawiera kontakt `polskiercctv@gmail.com`; nie tworzyć drugiego ogólnego portalu współpracy. Należy go później połączyć z centralną ankietą.
- `/news` ma kanoniczne źródło `portals/ccn-news`; artykuł rekrutacyjny wymaga osobnego zatwierdzenia i ścieżki redakcyjnej. Nie dotykać bundle ręcznie.
- Miejsca CTA: istniejące index.html, lumina.html, Akademia, Biblia i wspolpraca.html. Dodawanie dopiero z działającą ankietą i po sprawdzeniu właścicieli plików.

## Docelowy kontrakt HTTP i trwałość

POST `/api/volunteer-applications`; JSON UTF-8, maks. 16 KiB, dokładna allowlista pól z walidatora. Nagłówek Idempotency-Key: losowe UUID, niewyprowadzane z danych osoby. Zezwalać tylko na ustaloną domenę same-origin; sprawdzać Content-Type i Origin. Weryfikacja antybot po stronie serwera, limity rozproszone i honeypot. Nie opierać ochrony wyłącznie na pamięci procesu lub samym CORS.

Przy przyjęciu wykonać atomowy zapis application + outbox + klucz idempotencji z hashem kanonicznej treści. Ten sam klucz/treść zwraca ten sam bezpieczny identyfikator; ten sam klucz z inną treścią = 409. Przed rozpoczęciem wysyłki atomowy claim/lease. Po niejednoznacznym timeout nie ponawiać automatycznie; reconciliacja z operatorem albo idempotencja dostawcy. Brak publicznego GET z listą lub treścią zgłoszeń. Nie używać Firestore publicznych kolekcji kontaktowych.

Odpowiedzi: 202 `accepted` oznacza trwale przyjęto do kolejki, nie wysłano; 400 błędne pola; 403 antybot/origin; 409 konflikt klucza; 413 rozmiar; 429 limit; 503 brak konfiguracji. Nie ujawniać wyjątków dostawcy lub danych osoby. Identyfikator zgłoszenia nie daje publicznego dostępu do niego.

Stały odbiorca po stronie serwera: `polskiercctv@gmail.com`. From musi należeć do zatwierdzonej zweryfikowanej domeny; adres kandydata wyłącznie jako zwalidowany Reply-To. Temat i body jako plain text, bez HTML z formularza. Sekrety tylko env. Pomyślne API dostawcy oznacza `PROVIDER_ACCEPTED`, nie `DELIVERED`. Potwierdzenie doręczenia z podpisanego webhooka i/lub potwierdzenia operatora skrzynki. Żadne testy offline nie zastępują E2E.

## Bezpieczeństwo i prywatność — przed faktycznym zbieraniem

Do ustalenia przez właściciela: administrator danych z adresem, podstawa/cel, retencja, wykonywanie praw, dostawca przetwarzania/region, klauzula PL/EN, bezpłatny kanał mailowy i uprawnienia do obsługi. Pytanie zostało zadane w rozmowie. Nie publikować zmyślonej klauzuli. Wbudowane `TEST-ONLY-v1` występuje wyłącznie w testach; pusta konfiguracja blokuje walidację.

Minimalizacja: bez CV/skanów, danych zdrowotnych i opisu problemów klientów. Wolne teksty wymagają jasnego ostrzeżenia; walidator nie jest detektorem semantycznym danych wrażliwych. Zgoda na następne nabory jest odrębna, fakultatywna i domyślnie false. Nie publikować numerów ani profilu specjalisty na podstawie samego zgłoszenia; osobna zgoda i weryfikacja kwalifikacji.

## Następne kontrole

### Aktualizacja po odpowiedzi właściciela 27.10.2026

Właściciel potwierdził, że CC jest jego inicjatywą, oraz podział retencji: bieżące zgłoszenie/współpraca + odrębna dobrowolna zgoda na przyszłe nabory na 12 miesięcy. Prywatny adres nie może znaleźć się w publicznym artefakcie. Robocza klauzula PL/EN jest w prywatnym JOMA, nie w tym folderze. `retention-policy.cjs` oblicza granicę 12 miesięcy i uprawnienie do przyszłego kontaktu; nie zapisuje, nie wysyła i nie usuwa żadnych danych. Czas zgody musi ustalać i zapisywać serwer, nie użytkownik ani odczyt rekordu. Podstawa prawna poszczególnych etapów, infrastruktura i finalna klauzula nadal do ustalenia przed zbieraniem danych.

Testy endpointu: walidacja serwera, antybot, limit, równoległe identyczne klucze, zmiana treści klucza, atomowość zapisu, restart/lease, twarde i niejednoznaczne błędy maila, podpis webhooka, niedostępność bazy, niezalogowany odczyt danych, brak PII w logach, E2E na zatwierdzonej skrzynce. Następnie niezależny audyt Claude i GO właściciela przed publikacją. Nie aktywować płatnych usług.

## Zakres tej gałęzi

Tylko samodzielny prototyp i kontrakty w docs/cc-help-pilot; nie dodano tras, produkcyjnego endpointu, publicznych kontaktów ani konfiguracji dostawcy. Rollback: nie integrować folderu w wydaniu; żadne zmiany danych ani migracje nie wymagają cofania.
