# Prawdziwe powiadomienia push dla czatu — wdrożenie

## Co to naprawia
Do tej pory nic w repozytorium nie wysyłało powiadomienia push (przez Firebase
Cloud Messaging) w reakcji na nową wiadomość czatu. `lumina-notifications.js`
i wczorajszy `initFirestoreRealtimeListener()` tylko WYŚWIETLAŁY powiadomienie
lokalnie — działało to wyłącznie, gdy przeglądarka miała otwartą kartę LUMINA.
Przy zamkniętej aplikacji nic się nie wykonywało, więc powiadomienie nigdy nie
powstawało — niezależnie od tego, że Service Worker (naprawiony wcześniej)
był już gotowy je odebrać.

Ten plik dodaje brakujące ogniwo: dwie funkcje serwerowe, które uruchamiają
się automatycznie przy każdej nowej wiadomości w Firestore i wysyłają
prawdziwy push przez serwery Google — niezależnie od tego, czy czyjakolwiek
przeglądarka jest otwarta.

## Dwie funkcje

1. **`onDirectMessageCreated`** — wiadomości prywatne (1:1). Push zawsze
   trafia do odbiorcy.
2. **`onPublicChatMessageCreated`** — czat ogólny/grupowy. **Świadoma decyzja
   projektowa**: push wysyłany jest tylko przy bezpośredniej wzmiance
   (`@ktoś`), nie przy każdej wiadomości. Wysyłanie push do całej społeczności
   za każdą wiadomość na czacie ogólnym zalałoby ludzi powiadomieniami przy
   aktywnej rozmowie — to zniechęca do trzymania powiadomień włączonych.
   Jeśli mimo to chcesz push przy każdej wiadomości ogólnej, to prosta zmiana
   — daj znać.

## Obsługa wielu urządzeń i porządków
Funkcja pobiera token z kolekcji `LuminaDeviceTokens` (obsługuje kilka
urządzeń na osobę — telefon + komputer), z awaryjnym fallbackiem do
pojedynczego `fcmToken` w profilu dla starszych kont. Martwe tokeny
(np. ktoś odinstalował appkę) są automatycznie usuwane po nieudanej próbie
wysyłki, żeby kolekcja nie rosła w nieskończoność śmieciami.

## Wdrożenie

```bash
# w katalogu functions/
firebase deploy --only functions:onDirectMessageCreated,functions:onPublicChatMessageCreated
```

Nie wymaga żadnej zmiany w kodzie front-endu — front-end już poprawnie
zapisuje tokeny (naprawione wcześniej), a wiadomości już trafiają do
`lumina_direct_messages` i `lumina_public_chat_messages`, więc trigger
zadziała automatycznie od pierwszego wdrożenia.

## Test
1. Zaloguj się na dwóch kontach testowych na dwóch urządzeniach (albo dwóch
   przeglądarkach).
2. Na urządzeniu B **zamknij kartę LUMINA całkowicie**.
3. Z urządzenia A wyślij wiadomość prywatną do B.
4. Powiadomienie powinno pojawić się na urządzeniu B **mimo zamkniętej karty**
   — to jest właściwy test tego, co wcześniej nie działało.
5. Dla wzmianki: napisz na czacie ogólnym "@slug_użytkownika cześć!" — ta
   osoba (z zamkniętą kartą) powinna dostać push.
