# Quality Gate P0 i bezpieczeństwo

## Wizualny
[ ] Desktop pixel-by-pixel zgodność referencji: bez podmiany portretu, książki, palety i hierarchii
[ ] Mobile 320/360/390/430/768/1024/1440 px — brak powielonej kompozycji, brak poziomego scrolla
[ ] Menu w jednej linii tam, gdzie szerokość wystarcza; dotyk min. 44px, contrast, zoom 200%, focus visible
[ ] prefers-reduced-motion; obrazy WebP/AVIF responsive, poprawne CLS

## Czytnik
[ ] Bez konta: publiczny rozdział, motywy, font, share, lokalny postęp
[ ] Przy zmianie rozdziału i rewizji: zapis odpowiedniego akapitu; brak utraty preferencji
[ ] Audio: plik istnieje, play/pause, prędkości, pauza po błędzie, Safari/Android
[ ] Kalendarz i status „zaplanowany” nie ujawniają treści przed datą publikacji
[ ] Przycisk CZYTAJ rzeczywiście otwiera opublikowany rozdział

## Bezpieczeństwo
[ ] RBAC, ograniczenie administratora, 2FA dla redaktorów, CSRF, rate limits, audit log
[ ] Sanitizacja HTML/komentarzy, brak XSS, brak dostępu do draftów, CSP i nagłówki bezpieczeństwa
[ ] Bezpieczne przechowywanie danych użytkowników, eksport/usuwanie danych i retencja
[ ] Zgodna z prawem polityka prywatności, regulamin komentarzy, zgody komunikacji i analityki
[ ] QR @wioletj914 potwierdzony w realnej aplikacji; kwoty/wspierany podmiot potwierdzone
[ ] Backup oraz udany próbny restore, test stagingu i rollback

## SEO / telemetry
[ ] Semantyczny HTML i poprawny canonical, sitemap, JSON-LD, OG w narzędziu debug
[ ] Search Console i Bing Webmaster Tools zweryfikowane
[ ] GA4/GTM nie dublują page_view; odmowa zgody ogranicza zbieranie danych
[ ] Dziennik błędów, HTTP, wydajność 75p, publikacja faktycznie widoczna
