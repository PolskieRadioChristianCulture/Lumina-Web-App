# CC Wizytówki — audyt i pilotaż analityczny (18.11.2026)
Status: **TEST / nie publikować bez akceptacji L0**. ZERO COST. Gałąź `test/cc-wizytowki-analytics-20261118`.

## Ustalenia
- Źródło prawdy: `data/wizytowki-katalog.json` (pola `karty[].id`, `href`, `cats`), generator `scripts/wizytowki/buduj.mjs`.
- W kodzie jest już `G-Y4EFTVBPE3` oraz `js/cc-analytics.js` z `window.ccTrack`. Nie dodawać drugiego tagu GA4.
- Katalog miesza twórców, artystów i zasoby własne (kanały / książki). Segmentować je osobno. Profile prywatne LUMINA wykluczyć.
- Raport 4–17 XI: część kart ma pojedyncze odsłony; nie są to dowody konwersji na inne usługi. Search Console w ostatniej próbie nie zwrócił danych — nie interpretować braku wyniku jako zera wyświetleń.
- Demonstracja testowa: `/test/wizytowki-analityka/`. `noindex,nofollow`, bez danych osobowych i bez wysyłki zdarzeń.

## Wdrożenie pomiaru (DOPIERO po akceptacji i testach)
1. Znormalizować adresy z katalogu: trailing slash, kodowanie znaków, wersje `/pl/`, `/en/`; uwzględnić tylko potwierdzone, publiczne wizytówki. Osobno raportować katalog `/wizytowki` i stronę naboru `/wizytówka`.
2. Na publicznych wizytówkach po audycie istniejącego GA4/zgody uruchomić jedno zdarzenie `cc_card_ecosystem_click` przy kliknięciu **wewnętrznym** prowadzącym do innej sekcji CC. Parametry: `card_id`, `destination_group` (radio, tv, biblia, akademia, wspieraj, inne), `destination_path` (bez query/PII). Nie uruchamiać przy każdym kliknięciu; nie śledzić prywatnych wiadomości.
3. Zewnętrzne udostępnienia: generować link z `utm_source`, `utm_medium`, `utm_campaign=cc_wizytowki`, `utm_content=<card_id>`; nie używać UTM dla wewnętrznej nawigacji. Nie zastępować historycznych linków.
4. Raport GA4 tygodniowy (pon.–niedz.): `page_path`, `screen_page_views`, `sessions`, `active_users`, `session_source_medium`, `country`, `event_name`; porównać dwa pełne tygodnie. Rozdzielić: wejścia bezpośrednie na wizytówkę, ruch z kampanii twórców, przejścia do CC, zaangażowanie.
5. Raport GSC na URL wizytówki: `clicks`, `impressions`, `ctr`, `position`, segment PL/EN; opóźnienie danych jest normalne. Sprawdzić kanoniczne adresy, indeksowanie, sitemap i czy wizytówki nie konkurują ze sobą o tę samą frazę.
6. Raportować **brak pomiaru** jako N/D, nie jako 0. Udział wizytówek w wzroście całej witryny traktować jako hipotezę, dopóki nie mamy atrybucji.
7. W dashboardzie prywatnym pokazać ranking wizytówek, kraje wejścia (nie kraj autora), nowe osoby, przejścia do innych usług, SEO oraz trend tygodniowy.

## Testy i bramka
- `node --check` na nowych skryptach; sprawdzenie poprawności JSON; testy dla adresów PL/EN, unicode, query, linków wewnętrznych i zewnętrznych.
- Test w GA4 DebugView i Realtime na stagingu ze zgodą na analitykę; nie dopuszczać podwójnych eventów.
- Kontrola Core Web Vitals, noindex na teście, brak wycieku danych prywatnych, brak modyfikacji istniejących linków produkcyjnych.
- **Nie merge'ować PR i nie wdrażać produkcyjnie bez wyraźnej zgody właściciela.**
