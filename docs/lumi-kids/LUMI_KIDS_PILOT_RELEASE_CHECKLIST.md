# LUMI KIDS — lista kontrolna uruchomienia pilotażu

## Przed wdrożeniem (Claude)
- [x] Audyt infrastruktury LUMINA (Firebase Auth + Firestore, Cloudflare Pages)
- [x] Reguły `kids_*` + blokada zapisów konta dziecka w publicznej LUMINA
- [x] Testy reguł w emulatorze — 13 scenariuszy (`tests/lumi-kids-rules.test.mjs`), uruchamiane w skrypcie wydania przed wdrożeniem reguł
- [x] Test regresji reguł P0 (`scripts/p0-rules-test.mjs`) — warunek wdrożenia reguł
- [x] Testy statyczne aplikacji (brak sekretów, brak `innerHTML`, tylko kolekcje `kids_*`, `noindex`)
- [x] Strona publiczna bez wizerunku dziecka
- [ ] Reguły wdrożone na `lumina-cc` (skrypt wydania; wynik w `WYDANIE-KANALY.log`: `REGULY_LUMI_KIDS_WDROZONE=True`)

## Uruchomienie (właściciel — wyraźna zgoda)
1. [ ] Wejdź na `polskieradio.cc/lumi-kids/app/` → „Jestem rodzicem — logowanie Google” (konto Master Admin).
2. [ ] Wpisz swoją nazwę widoczną dla dziecka (np. „Tata”) → Zapisz.
3. [ ] „Zaproszenie konta dziecka” → wpisz adres e-mail dziecka → Zaproś.
4. [ ] Na urządzeniu dziecka: ta sama strona → „Mam zaproszenie — pierwsze logowanie” → nowe hasło (min. 10 znaków) → link z poczty. Jeśli konto już istnieje: „Nie pamiętam hasła / chcę ustawić nowe”.
5. [ ] W panelu rodzica: „Zatwierdź konto dziecka”, ustaw imię dziecka.
6. [ ] Wyślij pierwszą wiadomość i sprawdź odpowiedź, cytat i reakcję.
7. [ ] Sprawdź „Wstrzymaj dostęp” → dziecko traci dostęp → „Wznów dostęp”.
8. [ ] (Opcjonalnie) Mama: logowanie na tej stronie → przekazuje identyfikator → „Dodaj kontakt”.

## Zalecenia
- Włącz weryfikację dwuetapową na koncie Google opiekuna.
- Na telefonie dziecka dodaj skrót do `/lumi-kids/app/` (bez innych stron LUMINA).
- Rozszerzenie na inne rodziny dopiero po przeglądzie prawnym i niezależnym przeglądzie bezpieczeństwa.

## Wycofanie
Panel rodzica → „Cofnij dostęp dziecka” (natychmiast). Pełne: patrz `LUMI_KIDS_PILOT_ARCHITECTURE.md` §6.
