# CC — podstawowy standard interfejsu: inteligentny minimalizm

Polecenie właściciela: 2026-10-08. Stosować w kolejnych zmianach UI, bez samowolnej przebudowy funkcji.

- Treść, zdjęcie i człowiek mają pierwszeństwo przed przyciskami oraz plakietkami. Nie zasłaniać awatarów narzędziami edycji.
- Na telefonie najważniejsze działania mają rozpoznawalne ikony, nazwę dostępną dla czytnika ekranu oraz pole dotykowe minimum44×44px. Niejednoznaczna ikona wymaga widocznego opisu w rozwiniętych opcjach.
- Pozostałe działania: jawny przycisk „Więcej” i panel z pełnymi nazwami. Nie tworzyć kolejnych nakładających się pływających kontrolek.
- Nie ukrywać usunięcia konta, rezygnacji, zgody, błędów ani kosztów. Nie zmieniać uprawnień, widoczności właścicielskich ani zachowania operacji przez zmianę wyglądu.
- Klawiatura, fokus, Escape oraz oba motywy są obowiązkowe; działać bez hover na telefonie.
- Zachować oryginalne kontrolki, ich zdarzenia i identyfikatory. Bez klonowania przycisków powodującego utratę obsługi.
- Brak poziomego rozlewania strony, brak pozornej aktywności i nieweryfikowanych liczb. Zmiany wdrażać komponentami, z testem regresji i odbiorem320/390/1280px.

Pierwszy zakres implementacji: wspólny pasek działań profili LUMINA i przeniesienie narzędzi z awatara. Nie oznacza to automatycznie ukończonej przebudowy całego ekosystemu.
