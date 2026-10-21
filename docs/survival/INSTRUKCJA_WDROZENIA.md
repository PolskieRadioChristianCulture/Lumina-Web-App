# SURVIVAL CC — pakiet wdrożeniowy (wersja 1.0)

Docelowy URL: https://polskieradio.cc/survival

## Zawartość
- `index.html` — kompletna strona, HTML renderowany statycznie, SEO i dane strukturalne.
- `style.css` — responsywny design premium, bez zewnętrznych fontów ani bibliotek.
- `app.js` — filtrowanie, wyszukiwarka, rozwijane menu i trzy interaktywne checklisty.
- `assets/hero-survival.svg` — autorskie edytowalne tło z wolną przestrzenią po lewej.
- `assets/filar-01.svg` ... `filar-07.svg` — autorskie grafiki kategorii.
- `assets/MAKIETA_REFERENCYJNA_NIE_JAKO_TLO.png` — poglądowa wizualizacja strony, zawiera teksty graficzne, NIE WYKORZYSTYWAĆ jako tła ani gotowych materiałów wideo.
- `STRATEGIA_TRESCI.md` — rozpisane filary, programy, proces redakcyjny.

## Wdrożenie Antigravity
1. Rozpakuj folder w ścieżce routingu `/survival/` i zachowaj względną ścieżkę `assets/`.
2. Zweryfikuj routing `/survival` i `/survival/`, ustaw przekierowanie kanoniczne zgodnie z architekturą portalu.
3. Przejrzyj 24 podane adresy (status HTTP, kanoniczność, aktualność, zgodność tytułów). Zasoby dostarczone przez użytkownika; nie są automatycznie potwierdzone.
4. Przeprowadź testy 360px, 390px, 768px, 1280px, 1920px; klawiatura, kontrast, `prefers-reduced-motion`, wydajność.
5. Włącz do sitemap.xml, sprawdź `robots.txt`, dane Open Graph, czytelność HTML bez JS i Search Console.
6. Przeprowadź smoke test, dokumentację i ACK w skrzynce; nie publikuj bez weryfikacji.

## Ograniczenia
- Projekt nie ma backendu; stan checklist znika po przeładowaniu (brak localStorage i cookies).
- Karty nie obiecują filmów ani kursów, których nie opublikowano.
- Treści survivalowe wymagające wiedzy medycznej/ratowniczej i bezpieczeństwa nie powinny być publikowane bez kontroli merytorycznej.
- Zero zewnętrznych API, licencji płatnych i zależności JavaScript.

## Licencja
Autorski projekt demonstracyjny przygotowany dla Christian Culture. Obraz poglądowej makiety w `assets` jest materiałem koncepcyjnym, a nie dowodem istnienia przedstawionych filmów lub ekspertów.
