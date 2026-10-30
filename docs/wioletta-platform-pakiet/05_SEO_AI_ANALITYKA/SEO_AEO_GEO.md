# SEO + AI Search — EkoCC najwyższy standard
- Stale dostępny SSR/SSG HTML z publiczną treścią rozdziałów, semantyczne `h1`/`article`, logiczne breadcrumbs i `rel=canonical`.
- Unikalne opisy i title dla autorki/tomu/rozdziałów; Open Graph/Twitter cards, alt obrazu, stabilne URL, mapa XML automatyczna po publikacji.
- `robots.txt` oraz status 200/404/410/301; staging `noindex`, produkcja zależnie od decyzji autorki. Nie blokować przypadkiem CSS/JS potrzebnego indeksowaniu.
- Dane JSON-LD `Person`, `Book`, `BreadcrumbList`, `Article`/`CreativeWork` tylko gdzie uzasadnione i zgodne z treścią. Nie wymyślać ISBN, dat premiery, ocen, recenzji, wydawcy.
- Author canonical entity i `sameAs` tylko prawdziwe/zweryfikowane profile. Wyjaśnienie misji, biografia, informacje o cyklu i dostępnych rozdziałach.
- Google Search Console, Bing Webmaster Tools + IndexNow, raporty statusów indeksacji. Nie gwarantować wyświetlania w wynikach.
- Roboty AI (OAI-SearchBot, GPTBot etc.): osobne decyzje o wyszukiwaniu i treningu; zasad dostępu nie mylić. Sprawdzić aktualną oficjalną dokumentację, zamiast zakładać globalną regułę.
- Brak magii w `llms.txt`; opcjonalny dokument nie zastąpi treści i SEO.
- `hreflang` wyłącznie dla faktycznych, zgodnych wersji tłumaczeniowych; nie tłumaczyć tytułów automatycznie bez autoryzacji.
- Performance: LCP <= 2.5s, INP <= 200ms, CLS <= .1 na 75. percentylu; WCAG 2.2 AA; Core Web Vitals z realnych urządzeń.
- Publiczne fragmenty powieści wymagają decyzji dot. praw/licencjonowania. Żaden `robots.txt` nie gwarantuje ochrony przed kopiowaniem.

## Przykład strukturalny
Zobacz `schema-example.json`, pola przykładowe, nie publikować w ciemno.
