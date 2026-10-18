# LUMI KIDS — architektura pilotażu rodzinnego

**Data:** 2026-10-18 · **Autor:** Claude (Strażnik Standardów, Cowork) · **Status:** pilotaż zamknięty, jedno konto dziecka

## 1. Wynik audytu infrastruktury LUMINA

| Obszar | Stan faktyczny |
|---|---|
| Hosting | Cloudflare Pages (`polskieradio.cc`), wydanie z czystej kopii commita (`scripts/build-pages-release.mjs`) |
| Uwierzytelnianie | Firebase Auth, projekt `lumina-cc`; dostawcy używani w LUMINA: Google, e-mail+hasło, telefon |
| Baza danych | Cloud Firestore (`lumina-cc`), reguły w `firestore.rules` w repozytorium |
| Funkcje serwerowe | Brak płatnych Cloud Functions w pilotażu (zasada ZERO COST) — autoryzację po stronie serwera wykonują **reguły Firestore**, oceniane przez Google przy każdym odczycie i zapisie |
| Czas rzeczywisty | Nasłuch Firestore `onSnapshot` |
| Opiekun | Konta Master Admin (zweryfikowany e-mail z listy w `isMasterAdmin()`) |
| Wycofanie | Strona: ponowne wydanie poprzedniego commita. Reguły: ponowne wdrożenie poprzedniej wersji `firestore.rules` z historii Git |

Wniosek: istniejący backend pozwala bezpiecznie odseparować pilotaż przez **osobny zestaw kolekcji `kids_*`** i reguły, bez zmian w działaniu LUMI Messenger.

## 2. Model danych (osobna przestrzeń `kids_*`)

| Kolekcja | Zawartość | Kto zapisuje |
|---|---|---|
| `kids_pilot/config` | `enabled` (flaga **LUMI_KIDS_PILOT_ENABLED** po stronie serwera), `childUid` (jedyne konto dziecka — **niezmienny UID**), `contacts[]` (UID zatwierdzonych osób) | wyłącznie opiekun (Master Admin) |
| `kids_invites/{id}` | `email` (identyfikator zaproszenia, małe litery), `status` pending → claimed, `claimedUid` | opiekun tworzy; przyjąć może tylko właściciel zweryfikowanego adresu |
| `kids_profiles/{uid}` | `displayName`, `emoji` — wizytówka widoczna tylko w pilotażu | właściciel lub opiekun |
| `kids_conversations/{childUid_contactUid}` | `participants: [childUid, contactUid]` | dziecko lub zatwierdzony kontakt |
| `…/messages/{id}` | `senderUid`, `text` (≤1000), `createdAt` (czas serwera), `replyTo` (cytat), `reactions` {uid: emoji} | uczestnik rozmowy |

Brak dokumentu `kids_pilot/config` = pilotaż wyłączony (fail-closed).

## 3. Przepływ zaproszenia i powiązania z opiekunem

1. Opiekun loguje się w `/lumi-kids/app/` (Google, zweryfikowane konto Master Admin) → **Panel rodzica**.
2. Tworzy zaproszenie dla adresu e-mail dziecka (adres trafia tylko do Firestore, nie do repozytorium).
3. Dziecko: „Mam zaproszenie — pierwsze logowanie” → samo ustawia hasło (Firebase Auth, bezpieczne haszowanie po stronie Google) → link weryfikacyjny na e-mail (**dowód własności adresu**).
4. Po potwierdzeniu adresu aplikacja przyjmuje zaproszenie (`status: claimed`, `claimedUid = UID`). Reguły pozwalają na to wyłącznie kontu z dostawcą „hasło”, zweryfikowanym, o tym samym adresie.
5. Opiekun klika **„Zatwierdź konto dziecka”** → zapis `childUid` w konfiguracji (allowlista oparta o UID, nie o e-mail).
6. Jeśli konto już istnieje: „Nie pamiętam hasła / chcę ustawić nowe” — link Firebase do ustawienia nowego hasła (hasło nie przechodzi przez nasz kod).

## 4. Funkcje wersji 1

Ekran powitalny i logowanie · profil dziecka (inicjał, bez zdjęcia na tym etapie) · lista zatwierdzonych kontaktów · czat 1:1 z rodzicem · odpowiedź z cytatem · reakcje emoji (zamknięta lista) · licznik nowych wiadomości i komunikat w aplikacji · przycisk „Potrzebuję pomocy” (rozmowa z rodzicem, 112, 116 111) · panel rodzica (zaproszenia, zatwierdzanie, kontakty, wstrzymanie, cofnięcie dostępu) · wylogowanie · wyłączanie animacji.

Celowo **wyłączone**: publiczne pokoje, grupy, wyszukiwanie użytkowników, nieznajomi, załączniki i zdjęcia, połączenia, lokalizacja, publiczne profile.

## 5. Pliki

- `lumi-kids/index.html` — publiczna strona zapowiedzi (makieta, `noindex`, bez wizerunku dziecka)
- `lumi-kids/app/` — aplikacja pilotażowa (`index.html`, `app.css`, `app.js`)
- `firestore.rules` — sekcja „LUMI KIDS” + blokada zapisów konta dziecka w publicznej LUMINA (`notKidsChild()`)
- `tests/lumi-kids-rules.test.mjs` — testy reguł w emulatorze (konta fikcyjne)
- `scripts/lumina-straznik-20261007.test.mjs` — testy statyczne (izolacja kolekcji, brak sekretów)

## 6. Plan wycofania

1. Natychmiast, bez wdrożenia: Panel rodzica → „Cofnij dostęp dziecka” albo „Wstrzymaj dostęp” (reguły odcinają odczyt i zapis od razu).
2. Strona: wydanie poprzedniego commita (`git revert` + skrypt wydania).
3. Reguły: `git show <poprzedni>:firestore.rules > firestore.rules` i `firebase deploy --only firestore:rules --project lumina-cc`. Kolekcje `kids_*` bez reguł wracają pod regułę domyślną (tylko Master Admin).
