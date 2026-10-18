# LUMI KIDS — bezpieczeństwo pilotażu

**Data:** 2026-10-18 · **Zakres:** pilotaż rodzinny, jedno konto dziecka, opiekun = właściciel projektu

> **Aktualizacja 2026-10-18 (wersja „jeden wątek”):** zgodnie z planem CLAUDE_CODE_MASTER_PLAN rodzic korzysta ze zwykłego LUMI Messenger, a dziecko z LUMI KIDS — oboje piszą w **jednym** prywatnym wątku DM LUMINA (`lumina_direct_messages`, `lumina_chats/{chatId}`, `lumina_message_requests/{chatId}` ze statusem `accepted`). Osobny magazyn `kids_conversations` został usunięty. Panel rodzica tworzy wątek rodzinny i zapisuje `kids_pilot/config.familyChats[contactUid] = chatId`; w okienkach prywatnych rodzica rozmowa ma nazwę „Imię · LUMI KIDS”. Reguły: `kidsChildGate()` (odczyt/aktualizacja DM przez dziecko tylko gdy pilotaż aktywny), `kidsChildMayDm()` (zapis tylko do zatwierdzonych kontaktów, tylko tekst ≤1000 znaków), dziecko nie przyjmuje próśb o rozmowę od innych. Cofnięcie zgody = `enabled:false, revoked:true` (konto dziecka pozostaje zablokowane w publicznej LUMINA). Testy T01–T14 w `tests/lumi-kids-rules.test.mjs`. Hero: tło bez napisów (usunięte z ilustracji bez zasłaniania), treści i przyciski w HTML.

## Zasady (wszystkie egzekwowane po stronie serwera — reguły Firestore)

| Wymaganie | Realizacja |
|---|---|
| Tylko zweryfikowane konto dziecka dostaje rolę CHILD | `childUid` zapisuje wyłącznie opiekun; przyjęcie zaproszenia wymaga `email_verified == true`, dostawcy `password` i zgodnego adresu |
| Allowlista po niezmiennym ID, nie po e-mailu | `kids_pilot/config.childUid` i `contacts[]` to UID-y Firebase |
| Tylko opiekun zarządza uprawnieniami | zapis `kids_pilot/*`, `kids_invites` (tworzenie/usuwanie) — tylko `isMasterAdmin()` |
| Pozostali użytkownicy LUMINA bez dostępu | każda reguła `kids_*` wymaga UID z konfiguracji; zapytania o całe kolekcje są odrzucane |
| Dziecko niewidoczne w katalogach | konto dziecka nie może utworzyć `lumina_profiles` ani wpisów (`notKidsChild()`); wizytówka `kids_profiles` czytelna tylko w pilotażu |
| Brak publicznego czatu i obcych | `notKidsChild()` blokuje zapis w czacie ogólnym, DM, prośbach o kontakt, pokojach i wpisach; rozmowa w LUMI KIDS możliwa tylko w parze [dziecko, zatwierdzony kontakt] |
| Każde żądanie API autoryzowane po stronie serwera | reguły sprawdzają konfigurację przy każdym odczycie/zapisie wiadomości, także przez bezpośrednie wywołanie API |
| Natychmiastowe cofnięcie dostępu | `enabled=false`, `childUid=''` lub usunięcie kontaktu → kolejne odczyty i zapisy odrzucone; aplikacja dodatkowo nasłuchuje konfiguracji i zamyka rozmowę |
| Hasła | wyłącznie Firebase Auth (haszowanie po stronie Google). Brak haseł w kodzie, repozytorium, Markdown, logach i odpowiedziach. Reset hasła przez link Firebase |
| Logi | aplikacja nie loguje treści wiadomości ani danych logowania (test statyczny pilnuje braku `console.`) |
| XSS | treści wyłącznie przez `textContent` (test statyczny: brak `innerHTML`) |
| Walidacja danych | treść 1–1000 znaków, czas serwera, zamknięty zestaw pól, cytat ≤200 znaków, reakcje z zamkniętej listy, każdy zmienia tylko własną reakcję |
| Wizerunek dziecka | zdjęcia nie są publikowane na stronie publicznej; w v1 pilotażu awatar to inicjał |

## Zagrożenia i odpowiedzi (STRIDE w skrócie)

- **Podszycie się pod dziecko:** konto wymaga hasła ustawionego przez właściciela skrzynki + weryfikacji e-mail + zatwierdzenia UID przez opiekuna.
- **Podszycie się pod nadawcę wiadomości:** `senderUid == request.auth.uid`.
- **IDOR / BOLA:** identyfikator rozmowy nie daje dostępu; liczy się para UID w konfiguracji.
- **Przejęcie konta opiekuna:** opiekun = konto Google Master Admin. Zalecenie: weryfikacja dwuetapowa na koncie Google.
- **Wyścig przy cofnięciu dostępu:** każda operacja ocenia aktualną konfigurację; nasłuch aplikacji zamyka widok.
- **Zalew wiadomości:** limit długości; w pilotażu tylko rodzina. Ograniczenie częstotliwości wymagałoby płatnej funkcji serwerowej — poza zakresem ZERO COST.

## Ograniczenia znane i świadome

- Publiczny czat ogólny LUMINA jest **czytelny dla wszystkich** (także bez logowania) — dziecko nie może tam pisać, a aplikacja LUMI KIDS go nie pokazuje. Zalecenie: na urządzeniu dziecka używać tylko adresu `/lumi-kids/app/`.
- Powiadomienia działają, gdy aplikacja jest otwarta (licznik + komunikat). Powiadomienia push przy zamkniętej aplikacji wymagają funkcji serwerowej — kolejny etap.
- Opiekun nie ma „cichego podglądu” cudzych rozmów: widzi tylko rozmowy, w których sam uczestniczy (polityka przejrzystości).
- Przed udostępnieniem innym rodzinom: przegląd prawny (RODO art. 8, DPIA, standardy ochrony małoletnich).
