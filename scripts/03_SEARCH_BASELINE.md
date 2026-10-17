# CCN Global Discovery — stan pomiarów wyszukiwarki

Weryfikacja Codex: 2026-10-17. Poprzedni raport zawierał deklaracje niepotwierdzone przez test: 30 zapytań było wyłącznie polskich, test uruchamiał uproszczony osobny ranking, a nie silnik produkcyjny. Nie mierzył Top 1 ani czasu odpowiedzi. Wynik 0,75 nie jest dowodem jakości rzeczywistej wyszukiwarki ani poprawy względem baseline.

`scripts/ccn-semantic-evaluation.test.mjs` uruchamia teraz rzeczywisty `CCOmniSearch.performSearch` dla 30 dotychczasowych zapytań. Sprawdza obecność co najmniej jednego wyniku z oczekiwanym tematem w pierwszej piątce. To kontrola regresji oparta na słowach kluczowych, nie ręczna ocena trafności.

`scripts/ccn-discovery-runtime.test.mjs` kontroluje polskie i angielskie określenia CBDC, sortowanie najnowszych publikacji, polskie daty, duplikaty, rozróżnienie tematów pokrewnych oraz wykluczenie rekordów prywatnych i wycofanych. `scripts/verify-ccn-discovery.mjs` sprawdza stronę w przeglądarce przy szerokościach 320, 390 i 1280 px w obu motywach.

Otwarte kryteria pełnego odbioru specyfikacji: niezależna ręczna ocena minimum 30 zapytań PL/EN, porównanie Precision@5 i nDCG@10 przed/po na zamrożonym korpusie, budżet wydajności i pomiar świeżości po rzeczywistym publish/update/unpublish. Nie wykonano reprezentatywnego badania indeksacji przez zewnętrzne AI. Nie należy oznaczać całej specyfikacji jako zakończonej na podstawie tych testów regresji.

Szczegółowe dowody i ograniczenia wydania pozostają w prywatnym JOMA: `SKRZYNKA/raporty/CCN-DISCOVERY-VERIFY-20261017`.
