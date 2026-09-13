# LUMINA Push Worker

Bezplatny Worker Cloudflare wysyla powiadomienia FCM dla prywatnych wiadomosci
i prosb o rozmowe. Przegladarka wywoluje go dopiero po zapisie dokumentu w
Firestore. Worker ponownie odczytuje ten dokument i sprawdza, czy jego nadawca
zgadza sie z zalogowanym uzytkownikiem Firebase.

## Sekrety wymagane przed wdrozeniem

Utwórz konto usługi ograniczone do odczytu Firestore oraz wysyłania FCM, a jego
cały plik JSON zapisz jako sekret `FIREBASE_SERVICE_ACCOUNT_JSON`.
Klucz Web API Firebase jest publicznym identyfikatorem aplikacji i jest wpisany
w zmiennej Worker `FIREBASE_WEB_API_KEY`; nie daje on dostępu administracyjnego.

Wymagane role konta uslugi:

- `Firebase Cloud Messaging API Admin`
- rola tylko-do-odczytu do Cloud Firestore (np. `Cloud Datastore Viewer`)

Nie nadajemy temu kontu prawa zapisu ani administracji Firestore.

## Publikacja po akceptacji diffu

1. Zaloguj sie do bezplatnego konta Cloudflare.
2. W tym katalogu zainstaluj lokalnie Wrangler i ustaw sekret przez
   `wrangler secret put FIREBASE_SERVICE_ACCOUNT_JSON` (wartość wpisuje się
   interaktywnie, nie w terminalu ani w repozytorium).
3. Opublikuj Worker i wpisz otrzymany adres `workers.dev` do
   `window.LUMINA_PUSH_WORKER_URL` w `lumina-db.js`.
4. Opublikuj Hosting oraz wykonaj test na dwoch rzeczywistych kontach.

Nie publikuj sekretow ani pliku konta uslugi w Git.
