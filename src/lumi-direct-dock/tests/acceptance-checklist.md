# Kryteria akceptacji (P0 / P1)

## P0 — obligatoryjne przed publikacją
- [ ] Istniejący publiczny dymek czatu nadal otwiera **wyłącznie** pokój ogólny.
- [ ] Inny zalogowany użytkownik może wysłać DM; tylko adresat dostaje aktualizację Direct Dock.
- [ ] DM nie pokazuje się w pokoju publicznym ani w logach analitycznych z treścią.
- [ ] Nadawca nie może wysłać DM do wątku, którego nie jest członkiem (test backendowy 403).
- [ ] Zablokowany użytkownik nie może wysłać nowej wiadomości (egzekwowane przez backend).
- [ ] Przychodząca wiadomość nie powoduje automatycznego fokusu/otwarcia bez zgody.
- [ ] Zgoda na auto-open działa wyłącznie dla autoryzowanych wątków prywatnych.
- [ ] Zamknięcie do następnego DM oraz minimalizacja działają według ustalonej polityki (patrz README).
- [ ] Odświeżenie strony / druga karta / wylogowanie / zmiana konta nie ujawnia wiadomości poprzedniego użytkownika.
- [ ] Dwa różne DM nie mieszają treści; deduplikacja po message.id.
- [ ] Błędy wysyłki zachowują wpisaną treść; brak podwójnej wysyłki przy szybkich kliknięciach.
- [ ] Brak aktywnych przycisków audio/wideo/GIF/zdjęć bez implementacji i autoryzacji.
- [ ] Czat ogólny, radio, karaoke i nawigacja mobilna nie są zasłonięte.
- [ ] Brak niezamkniętych subskrypcji po odmontowaniu lub wylogowaniu.
- [ ] Testy E2E desktop i mobile oraz rollback potwierdzone raportem w skrzynka/.

## P1 — po bezpiecznym MVP
- [ ] Pełna lista wątków, także >6, otwierana z osobnej skrzynki DM.
- [ ] Synchronizacja read/unread między urządzeniami oraz kartami.
- [ ] Wznowienie subskrypcji po utracie sieci; idempotentne wznowienie.
- [ ] Obsługa klawiatury i czytników ekranu (WCAG 2.2 AA).
- [ ] Preferencje użytkownika na koncie / synchronizowane między urządzeniami, jeśli wymagane.
- [ ] Wysłanie reakcji serca, zdjęć, GIF i głosówek dopiero po wdrożeniu odpowiednich endpointów.
