# Czytnik premium — kontrakt UX

1. Czytelny HTML SEO, jeden `h1` na rozdział i linki do spisu oraz sąsiednich opublikowanych rozdziałów.
2. Tryby: Papier, Noc, Biel. Rozmiar 15–26 px, dobór dostępnej czcionki, szerokość łamu, interlinia, tryb koncentracji.
3. Zakładki: lokalnie bez loginu (`localStorage`) i opcjonalny synchronizowany profil po autoryzacji; bez przecieku przez współdzielone urządzenie.
4. Postęp: procent jako pomocniczy; główny zapis na stabilnym identyfikatorze akapitu, z migracją między rewizjami tekstu.
5. Share rozdziału (native share / link, WhatsApp etc.), adres kanoniczny, bez tekstu książki w analityce.
6. Odsłuch tylko gdy istnieje opublikowany plik i autorka zgodziła się na jego publikację; `audio` HTML5: play/pause, 0.75×–2×, przewijanie, czas, napisy/transkrypt jeśli dostępne.
7. Audio działa w tle gdzie wspiera to przeglądarka; testować mobile Safari/Chrome. Nie obiecywać synchronizacji zdanie-po-zdaniu bez znaczników czasu.
8. Formularz komentarza nie blokuje lektury; oznaczanie spoilerów; dostępność oraz status moderacji.
9. Nie generować brakujących rozdziałów, cytatów i ocen.
10. Przy ukończeniu rozdziału: „Kontynuuj” i opcjonalny opt-in na powiadomienie, bez obowiązkowego logowania.

## Demonstrator
`08_STARTER_CZYTNIKA/index.html` działa lokalnie z bezpiecznym tekstem próbnym. To tylko demonstracja UX; nie jest pełnym modułem wydawniczym.
