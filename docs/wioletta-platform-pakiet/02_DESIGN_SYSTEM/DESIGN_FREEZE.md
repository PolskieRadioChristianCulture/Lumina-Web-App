# DESIGN FREEZE — NIE ZMIENIAĆ WYGLĄDU

## Referencje
`07_MATERIALY_ORIGINALNE/wzor_desktop.jpg` (zatwierdzony), `wzor_mobile.jpg` (do korekty układu, bez zmiany stylu), `oryginalny_portret.png`, `oryginalna_ksiazka_3D.png`.

## Obowiązuje
- Zachować istniejący desktopowy hero i rozmieszczenie materiałów, portret (orientacja dokładnie jak zatwierdzono), książka 3D z frontem i grzbietem (bez tylnej okładki).
- Granat/czerń, stonowane szampańskie złoto i pudrowy róż, elegancka typografia szeryfowa.
- Poprawić zawijanie menu „O AUTORCE”, „WSPIERAM TO”; nie dublować hero na mobile; nie tworzyć dwóch niezależnych ekranów jeden pod drugim.
- Nowe czytnik, modal wsparcia, biblioteczka i panel logowania czerpią z istniejących tokenów CSS strony, nigdy z przypadkowych kolorów gotowych widgetów.
- Subtelny ruch wyłącznie jako uzupełnienie; `prefers-reduced-motion` obowiązkowy, animacje nie obciążają głównego wątku.
- Nie generować alternatywnego wizerunku ani książki; używać wyłącznie dostarczonych plików.
- Nie dodawać dekoracyjnych guzików bez funkcji.

## Proponowane tokeny orientacyjne — skalibrować względem obecnego CSS, nie nadpisywać arbitralnie
`--wr-ink:#08090d; --wr-navy:#171721; --wr-gold:#c9a77e; --wr-rose:#d995a5; --wr-paper:#f3e9df; --wr-radius:16px;`.

## Mobile
Górny pasek w obrębie viewportu; jednolita hierarchia portret/książka/tytuł/CTA; duże obszary dotyku (min. 44x44 px); bez poziomego scrolla; teksty bez przycinania; modal wspierania przewijalny i z zamknięciem.
