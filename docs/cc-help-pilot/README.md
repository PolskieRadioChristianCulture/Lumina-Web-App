# CC Pomoc — kompletny wzór frontendu PL / EN

Osobny prototyp, 27.10.2026. Nie jest opublikowany na produkcji. Nie zawiera prywatnego katalogu kontaktów, bazy danych, kont, analityki ani sekretów.

## Uruchomienie

Wymaga Node.js, bez instalacji pakietów:

```powershell
node serve.cjs
```

Podgląd: http://127.0.0.1:4178 (tylko komputer lokalny). Angielski: http://127.0.0.1:4178/?lang=en. Zatrzymanie: Ctrl+C. Można też otworzyć `index.html` bezpośrednio; lokalny serwer zapewnia dodatkowo nagłówki bezpieczeństwa.

```powershell
node --test template.test.cjs
```

## Co działa

- Responsywny układ, dostarczone oficjalne logo PNG z przezroczystością, „Wspieram to” prowadzące do istniejącego `/wspieraj`.
- Pełne PL/EN: treść, formularze, komunikaty, opisy dostępności, metadane. Preferencja jest w URL, bez zapisu w przeglądarce.
- Natywny modalny panel krawędziowy i poradnik: focus containment, Escape, przywrócenie fokusu, zamykanie kliknięciem tła.
- Arkusz przychody minus wydatki w pełnych groszach, bez błędów odejmowania float, bez zapisu i transmisji.
- Formularz przygotowuje plik TXT i link mailto do polskiercctv@gmail.com. Użytkownik sam wysyła wiadomość. Nie jest to backend i nie potwierdza doręczenia. Zmiana pól unieważnia wcześniejszy szkic.
- Oficjalne odnośniki do Gov.pl i UOKiK, brak fikcyjnych specjalistów, partnerstw i dyżurów. Pomoc opisano jako dotyczącą Polski również w wersji EN.
- Reduced motion, czytelny fokus, etykiety, skip link, układ do druku.

## Pliki

`index.html` — cała struktura i polska treść; `styles.css` — responsywność i wygląd; `app.js` — angielskie tłumaczenia i zachowanie; `assets/` — lokalne logo i ilustracja hero; `serve.cjs` — lokalny serwer z zamkniętą listą plików; `template.test.cjs` — testy.

## Przed przyszłą publikacją

1. Ten wzór ma `noindex,nofollow` w HTML i serwerze. Dla zaakceptowanej publikacji przygotować odrębne adresy językowe, samowskazujące canonical i wzajemne hreflang. Nie indeksować parametrycznej makiety jako gotowego portalu.
2. Podłączyć istniejący wspólny panel EkoCC zamiast utrzymywać drugą wersję nawigacji. Oddzielny panel tutaj służy samodzielnemu wzorowi.
3. Jeżeli zgłoszenia mają trafiać bezpośrednio ze strony, zastąpić tryb szkicu bezpiecznym backendem, zatwierdzoną informacją o administratorze danych i retencji, antyspamem, walidacją serwera, rate limit oraz E2E rzeczywistego doręczenia. Nie zamieniać samego kliknięcia w status „wysłano”.
4. Zweryfikować ostateczne treści ze specjalistą oraz przyjęte zasady prywatności. Nie obiecywać rezultatu prawnego lub finansowego.
5. Oficjalny znak pochodzi z załącznika właściciela; PNG jest wariantem tła usuniętego przez imagegen, nie plikiem wektorowym ani kopią pikselową. Zdjęcie hero wygenerowane przez imagegen, martwa natura, bez przypisywania fotografowanej osobie świadectwa.
6. Zachować prywatność bazy rekrutacyjnej: nie przenosić jej do HTML, publicznego repo ani plików wdrożenia.
7. Publikacja portalu wymaga osobnego GO, właściwych testów repo i produkcyjnego smoke. Testy tego izolowanego wzoru nie dowodzą działania produkcji.

## Kierunek i źródła

Zaakceptowana makieta właściciela ma pierwszeństwo przed ogólnymi wskazówkami Taste: zachowano jej kremowe tło, numerowane kroki i złote podziały. Wzorzec `uneven-photographs` służył jako punkt odniesienia; nie wdrażano maskowania tekstu ani parallax, bo priorytetem jest czytelność pomocy. Żadne biblioteki ani usługi płatne nie są potrzebne.

- https://www.gov.pl/web/nieodplatna-pomoc/npp
- https://uokik.gov.pl/pomoc-dla-konsumentow-instytucje

Odczyt źródeł 27.10.2026. Ilustracja hero: prompt opisuje notatnik, kalkulator i koperty na stole przy oknie, bez osób, tekstu i logotypów; wygenerowano wbudowanym imagegen. Oryginał generacji zachowany poza prototypem.
