# Lokalny test obecności — bez migracji historii

Uruchomienie: `node --test scripts/presence-pilot-runtime.test.mjs`.
Wykorzystuje istniejące Miniflare/esbuild. Nie tworzy zasobów w chmurze ani kosztów.
Sprawdza prawdziwe WebSockety w lokalnym runtime Cloudflare: dwie karty, osobne pokoje,
rozłączenie jednej z wielu sesji, odrzucenie obcych źródeł i domyślną blokadę.
`demo-a` i `demo-b` to oznaczone dane DEMO, nie profile społeczności.

Nie podłączono pilota do portalu ani Firestore. Nie ma operacji na historii,
profilach, tokenach Firebase ani telefonach. Wdrożenie jest domyślnie wyłączone.

Przed testem na prawdziwych kontach potrzebne są: weryfikacja Firebase ID tokena,
ograniczenie do zatwierdzonych uczestników, osobna ochrona danych dziecka,
kontrola limitu i zakresu widoczności, mierzenie opóźnień i test zaniku sieci.
Powrót: pozostawić pilot wyłączony; dotychczasowa baza pozostaje źródłem historii.

## Hybryda

Zalecany pierwszy etap to stały podział odpowiedzialności: Firestore przechowuje
wiadomości i uprawnienia, Cloudflare obsługuje krótkotrwałą obecność. Brak odczytu
Firestore nie może być interpretowany jako brak wiadomości ani przyzwolenie na nowy pokój.

Automatyczne przełączanie historii po błędzie limitu wymaga oddzielnego projektu:
autoryzowanej i sprawdzalnej repliki, stabilnych identyfikatorów wiadomości,
idempotentnego zapisu, kolejki odtwarzania, synchronizacji blokad i cofnięcia zgód,
jednoznacznego źródła prawdy i testu powrotu bez duplikatów lub utraty danych.
Sam zapis równocześnie do dwóch baz nie zapewnia tych warunków. Ten pilot tego nie włącza.
