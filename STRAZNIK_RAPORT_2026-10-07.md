# Raport Strażnika Standardów — LUMINA, 2026-10-07 (Claude, Cowork)

Zlecenie Dowódcy: tablica, czat i profile społeczności „jak w szwajcarskim zegarku”;
na telefonie tablica miga; czat działa słabo; po pierwszym logowaniu obowiązkowe
uzupełnienie profilu i prawdziwe zdjęcie; karuzela pokazuje profile z samym logo.

Publikacja: `WYDANIE-STRAZNIK.bat` (uruchamia `scripts/straznik-wydanie-20261007.ps1`).

## Przyczyny znalezione (pomiar na żywej tablicy, widok telefonu 375 px)

1. **Moduł `lumina-db.js` ładował się 3 razy** (różne `?v=` = osobne kopie): 3× logowanie,
   3× nasłuch bazy, 3× „obecność online”, potrójne powiadomienia czatu.
2. **Tablica tasowała się od nowa przy każdej zmianie danych** (nowy losowy seed przy każdym
   renderze + `innerHTML` całej tablicy) → filmy i okna YouTube przeładowywały się = „miganie”.
3. **9 filmów z autoodtwarzaniem naraz**, także niewidocznych.
4. **Karuzela „Poznajmy się bliżej”** = stała lista 10 kont, głównie logotypów marek.
5. **Polubienia i „Amen” były fikcyjne** — zmieniała się tylko liczba na ekranie.
6. **Podmiana tożsamości po imieniu**: każdy „Cezary/Wioletta/Andrzej” dostawał cudzą twarz,
   nazwisko, wiek, miasto (profil, czat, komentarze, „mój profil”), a czat kierował wiadomości.
7. **Kod „7777”** otwierał panel właściciela każdego profilu; na stronie Cezarego panel
   otwierał się każdemu odwiedzającemu.
8. **Czat prywatny** pobierał 150 dowolnych wiadomości ze wszystkich rozmów — nowe wiadomości
   otwartej rozmowy mogły nie dojść.
9. **Zmyślone dane** nowych profili („Warszawa”, „Panna/Kawaler”, wyznanie, 100% dopasowania,
   wpis powitalny z 2 polubieniami) i 65 zmyślonych liczników reakcji na tablicy.
10. **Reguły Firestore** (krytyczne): każdy, także niezalogowany, mógł nadpisać profil Założyciela,
    pisać/usuwać wpisy jako Cezary i publikować fałszywe CKD (push do wszystkich). Plik
    `firestore.rules` w repo w ogóle się nie kompilował (nadmiarowy `}`).

## Zmiany

- Jedna wersja modułów `lumina-db.js`/`lumina-core.js` (`?v=20261007_straznik1`) na wszystkich stronach.
- `js/lumina-stable-render.js`: tablica i czaty podmieniają tylko zmienione elementy.
- Stały seed tablicy na czas wizyty, debounce 250 ms, odświeżanie tylko przy realnej zmianie.
- `js/lumina-media-economy.js`: wideo gra tylko, gdy widoczne.
- `js/lumina-community-people.js` + `getCommunityCarouselProfiles()`: karuzela z prawdziwymi ludźmi.
- `js/lumina-onboarding.js` + `completeOwnLuminaProfile()`: kreator profilu (imię i nazwisko,
  miejscowość, prawdziwe zdjęcie z aparatu/galerii — kontrola jakości, wykrywanie twarzy, gdy
  przeglądarka wspiera; dalej Cloud Vision w chmurze, jeśli wdrożona).
- Prawdziwe reakcje: `lumina_post_reactions` + licznik ±1 pilnowany regułami.
- Tożsamość wyłącznie po zweryfikowanym e-mailu/slugu (`detectLuminaOfficialIdentity`,
  `canEditLuminaProfile`, `window.LuminaGuard`); samonaprawa profili poszkodowanych.
- Panel właściciela wyłącznie dla zalogowanego właściciela (bez „7777”, bez `?access=granted`).
- E-mail i token FCM nie trafiają już do publicznych profili.
- Rolki: bez pływającego przełącznika motywu (zasłaniał przycisk).
- Indeksy: `lumina_direct_messages (participants, chatId)`, `lumina_notifications (recipientId, createdAt)`.
- Strażnik Kodu: nowa reguła **K-NAME-BASED-IDENTITY** (na starym kodzie wykrywa 59 przypadków).
- Testy: `scripts/lumina-straznik-20261007.test.mjs` (w `test:cc-regression`), `scripts/p0-rules-test.mjs`.

## Otwarte (dla kolejnych agentów)

- **Usunięcie e-maili z już istniejących profili** (`lumina_profiles.email`, `fcmToken`) — jednorazowo
  przez Admin SDK; kod już ich nie zapisuje.
- **Wpis powitalny** (`postWelcomeMessageForNewUser`) nie przechodzi reguł (autor `OFFICIAL_LUMINA_COMMUNITY`
  ≠ uid) — tak było też przed zmianą. Przenieść do Cloud Function `onLuminaProfileCreated`.
- **Zdjęcia profilowe jako base64 w Firestore** — docelowo Firebase Storage + miniatury.
- Pozostałe heurystyki „po imieniu” poza czatem/profilami: `lumina.html` (filtry odkrywania),
  `lumina-db.js` blok `subscribeToAllCommunityProfiles` (zneutralizowany, do uproszczenia).
- Komentarze: kolekcja nie ma reguł (spada do „tylko admin”) — sprawdzić, gdzie są zapisywane.
- `lumina-tablica-light.html`: zsynchronizowano czat i reakcje, bez przebudowy renderu tablicy.
- Dokładne adresy e-mail kont Wioletty i „bibliaaudio” do potwierdzenia w `LUMINA_OFFICIAL_ACCOUNTS`.
