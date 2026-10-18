# LUMI KIDS — raport z testów pilotażu

**Data:** 2026-10-18 · Dane i konta w testach automatycznych są fikcyjne.

## Testy reguł bezpieczeństwa (emulator Firestore) — `tests/lumi-kids-rules.test.mjs`

| # | Scenariusz (wymaganie z wytycznych) | Oczekiwany wynik |
|---|---|---|
| 1 | Dziecko loguje się i czyta własną rozmowę | dozwolone |
| 2 | Niezatwierdzony użytkownik — konfiguracja, rozmowa, wiadomości | odmowa |
| 3 | Rodzic wysyła wiadomość | dozwolone |
| 4 | Dziecko odpowiada rodzicowi z cytatem | dozwolone |
| 5 | Podszycie się pod nadawcę, pusta/za długa treść, fałszywy czas, dodatkowe pola (zdjęcie) | odmowa |
| 6 | Cofnięcie dostępu (`enabled=false`, `childUid=''`) — odczyt i zapis | odmowa |
| 7 | Obcy: odczyt, zapis, założenie rozmowy z dzieckiem, wizytówka dziecka | odmowa |
| 7b | Zatwierdzony kontakt zakłada własną rozmowę, nie czyta cudzej; dziecko nie zmienia listy kontaktów | zgodnie z opisem |
| 8 | Konto dziecka: publiczny profil, czat ogólny, wpisy — odmowa; zwykły użytkownik LUMINA — bez zmian | zgodnie z opisem |
| 8b | Bez konfiguracji: LUMINA działa, LUMI KIDS zamknięte | zgodnie z opisem |
| 9 | Bezpośrednie zapytania API o całe kolekcje `kids_*` | odmowa |
| 10 | Zaproszenie: obcy, niezweryfikowany adres, inny dostawca, przypisanie innemu UID, ponowne przyjęcie — odmowa; właściciel adresu — dozwolone; dziecko nie nadaje sobie roli | zgodnie z opisem |
| 11 | Reakcje: tylko własna, z listy, bez zmiany treści | zgodnie z opisem |

Wykonanie: skrypt wydania (krok 4b) uruchamia te testy oraz regresję reguł P0 w emulatorze na komputerze wydawniczym. **Reguły są wdrażane tylko, gdy oba zestawy przejdą.** Wynik zapisuje `WYDANIE-KANALY.log` (`REGULY_LUMI_KIDS_WDROZONE=True/False`). W środowisku Claude emulator nie mógł zostać pobrany (blokada sieci), dlatego wykonanie przeniesiono na komputer wydawniczy.

## Testy statyczne (każde wydanie, `test:cc-regression`)

- strona zapowiedzi: `noindex`, oznaczenie demo, brak zdjęć dziecka, brak adresów i haseł, brak połączeń sieciowych
- aplikacja: `noindex`, brak `innerHTML`/`console.`, tylko kolekcje `kids_*`, weryfikacja e-mail obecna
- reguły: wszystkie kolekcje `kids_*` zdefiniowane, ≥9 blokad `notKidsChild()`, przyjęcie zaproszenia wymaga zweryfikowanego adresu i hasła, brak `if true`

## Wymagania 10–12 z wytycznych

- **10. Odświeżenie strony:** stan pochodzi z Firebase Auth (sesja) i Firestore — po odświeżeniu aplikacja odtwarza ten sam widok.
- **11. LUMI Messenger bez regresji:** testy 8 i 8b + pełny `test:cc-regression` w wydaniu.
- **12. Brak danych uwierzytelniających w logach/repozytorium/API:** testy statyczne; hasła wyłącznie w Firebase Auth.

## Wynik na produkcji

Uzupełniany po wydaniu: weryfikacja na żywo (strona, logowanie, panel rodzica) — patrz raport w skrzynce agentów.
