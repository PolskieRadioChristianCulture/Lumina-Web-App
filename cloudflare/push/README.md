# Migracja powiadomień LUMINA na Cloudflare

Status: transport FCM przygotowany lokalnie, NIE WDROŻONY. Nie jest jeszcze działającym Workerem.

Potwierdzone: istniejąca wysyłka `onDirectMessageCreated` w Google Cloud Functions jest blokowana przez wyłączone rozliczenia. Decyzja właściciela: przenieść wykonanie na Cloudflare, nie włączać ponownie płatnego Firebase.

`fcm.js` jest modułem serwerowym korzystającym z FCM HTTP v1 oraz Web Crypto. Nie wymaga Google Cloud Functions. Sekret konta serwisowego musi pochodzić z Cloudflare Secrets, nigdy z przeglądarki ani pliku w repozytorium. Konto serwisowe powinno mieć wyłącznie uprawnienia potrzebne do wysyłania FCM; odczyt zdarzeń z bazy należy zaprojektować osobno.

## Do dokończenia przed publikacją

1. Zweryfikować dostęp do rzeczywistego konta Cloudflare i istniejących zasobów przez nowo zainstalowaną wtyczkę. Sam status OAuth w CLI nie oznacza dostępnych narzędzi w rozmowie.
2. Dodać uwierzytelniony punkt przyjmowania zdarzeń. Odbiorcę i treść wiadomości ustala serwer z zapisanego zdarzenia, nie z dowolnych danych żądania.
3. Trwała kolejka i deduplikacja osobno dla pary zdarzenie–urządzenie; ponawianie błędów chwilowych, dead-letter queue, wygaszanie starych zdarzeń. Tag Androida zastępuje belkę, ale nie zastępuje deduplikacji serwerowej.
4. Mechanizm odzyskiwania zdarzeń, gdy przeglądarka nadawcy zamknie się pomiędzy zapisem wiadomości a zgłoszeniem wysyłki; harmonogram dla rozważań i komunikatów systemowych.
5. Respektowanie preferencji odbiorcy, wylogowania i zmiany właściciela urządzenia. Brak treści prywatnych, tokenów i kluczy w logach.
6. Skonfigurować sekret FCM, sprawdzić uprawnienia w trybie `validateOnly`, następnie wysłać test wyłącznie na wskazane urządzenie testowe.
7. Test Android: normalnie zamknięta aplikacja, zgaszony ekran, połączenie mobilne/Wi-Fi, przerwa w sieci, otwarcie właściwej rozmowy i brak dubli. Wymuszone zatrzymanie przeglądarki w ustawieniach Androida to osobny przypadek, nie zwykłe zamknięcie aplikacji.

Test modułu (bez dostępu do sieci i prawdziwych odbiorców): `node --test cloudflare/push/fcm.test.js`.

Odpowiedź FCM `accepted` oznacza przyjęcie przez usługę, a NIE potwierdzenie dostarczenia na telefon. Logika odbiorcy jest osobno sprawdzana przez `npm run test:push`.
