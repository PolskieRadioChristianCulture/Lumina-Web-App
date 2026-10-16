# Christian Culture Global — dokumentacja wdrożenia

## Zawartość

- `src/`: kod platformy, 10 języków UI, radio, premiery, artykuły, playlisty, LUMINA Auth.
- `assets/hero.webp`: hero 1920×1080 z grafiki przekazanej przez właściciela.
- `assets/now-is-the-time.webp`, `assets/written-in-heaven.webp`: grafiki promocyjne.
- `assets/design-reference.webp`: wizualizacja koncepcji (NIE zrzut działającej strony).
- `worker/`: opcjonalne zabezpieczone API szkiców artykułów, wymaga konfiguracji Firebase Admin custom claims i Cloudflare KV.
- `scripts/postbuild.mjs`: generuje strony artykułów, sitemap, robots i llms.txt.
- `docs/`: architektura, instrukcja wdrożenia, SEO i lista kontroli.

## Szybki start

1. Node.js 20+; `npm install`.
2. Skopiuj `.env.example` do `.env.local` i uzupełnij dane istniejącego projektu Firebase LUMINA.
3. Potwierdź produkcyjne strumienie Global Radio i Global Bible, wpisz do `.env.local`.
4. `npm run dev` do testów lokalnych; `npm run check` do testów i buildu.
5. Publikuj **zawartość `dist/` pod ścieżką `/Global/`**. Sprawdź sposób mapowania katalogów na aktualnym hostingu.
6. Przed publikacją sprawdź testy mobilne, login Google, wszystkie playlisty i oba strumienie.

## Co jest zaimplementowane

- Responsywny landing, hero, stacje, jeden odtwarzacz, karty premier, 5 playlist osadzanych na żądanie, artykuły, linki wsparcia.
- Lokalizacja UI w 10 językach, trwały wybór języka na urządzeniu.
- Google sign-in do istniejącego projektu Firebase, bez nowej bazy użytkowników.
- SEO: statyczne URL artykułów, JSON-LD, Open Graph, sitemap, robots, llms.txt, canonical.
- Opcjonalny Worker do zapisania szkiców artykułów przez uprawnionego administratora.

## Ograniczenia / blokery przed produkcją

- Dane Firebase LUMINA, reguły autoryzacji, autoryzowane domeny i provider Google nie zostały przekazane. Login jest kodem integracyjnym, **nie został przetestowany z prawdziwą LUMINA**.
- Global Bible URL nie został potwierdzony; przycisk komunikuje brak konfiguracji zamiast udawać odtwarzanie.
- Global Radio URL jest roboczy, pochodzi z wcześniejszych ustaleń; wymaga sprawdzenia.
- Oryginalne miniatury obu premier należy potwierdzić w bibliotece mediów. Dostarczone grafiki są adaptacjami promocyjnymi, nie oficjalnymi okładkami.
- 10 języków dotyczy interfejsu. Artykuły mają angielski tekst źródłowy i komunikat o braku zweryfikowanego tłumaczenia. Pełne 10 wersji artykułów i statycznych URL wymaga osobnego procesu redakcyjnego.
- Worker przechowuje **szkice**, nie publikuje ich automatycznie. Edytor CMS i pipeline zatwierdzania do wdrożenia w istniejącym panelu administratora.
- Brak produkcyjnego audytu repozytoriów, Cloudflare, LUMINA i praw autorskich. Nie ogłaszaj statusu READY FOR PRODUCTION.
- Przeglądarki i systemy mobilne mogą wstrzymywać radio w tle; brak gwarancji ciągłego odtwarzania przy blokadzie ekranu.
- Strumień i YouTube mogą wymagać dopasowania CSP do faktycznych domen końcowych.

## Wsparcie misji

Włączone linki do wsparcia przez zrzutka.pl i Revolut. Dobrowolne wpłaty, bez paywalla. Nie zbieramy danych płatniczych w aplikacji. Można podłączyć inne istniejące metody po weryfikacji.

## Bezpieczeństwo

Nigdy nie umieszczaj kluczy prywatnych Firebase, tokenów administracyjnych ani sekretów płatności w VITE_*. Konfiguracja Firebase Web jest publiczna, ale uprawnienia są wymuszane przez Firebase Rules / backend. Administratora nie rozpoznajemy po samym emailu. Opcjonalny Worker sprawdza podpis tokenu i `ccGlobalAdmin=true`. Claim musi być nadawany tylko przez zaufany backend. Zmiany CMS mają status `draft`.
