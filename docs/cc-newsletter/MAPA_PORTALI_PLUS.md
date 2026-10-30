# MAPA PORTALI Z PANELEM `+` — EkoCC / CC NEWSLETTER (`CCNL-002`)

**Data aktualizacji:** 2026-10-30  
**Identyfikator:** `CCNL-002`  
**Komponent wspólny:** `js/cc-mobile-edge.js` + `js/cc-newsletter.js` + `css/cc-mobile-edge.css`

---

## 1. Zasada Działania Wspólnej Integracji w Panelu `+`

Wszystkie portale ekosystemu Christian Culture korzystające ze wspólnego panelu krawędziowego `+` (`js/cc-mobile-edge.js`) oraz portale z rodziny CCN News otrzymują automatycznie pozycję:
- **Ikona:** Koperta (`mail` SVG 24×24, cel dotykowy `44×44 px`)
- **Etykieta PL:** `Newsletter — Bądźmy w kontakcie` (podtytuł w panelu: `Zapisz się lub zarządzaj subskrypcją`)
- **Etykieta EN:** `Newsletter — Stay in touch` (`Subscribe or manage preferences`)
- **Etykieta DE:** `Newsletter — In Kontakt bleiben` (`Abonnieren oder verwalten`)
- **Działanie po kliknięciu:**
  1. Jeśli załadowany jest moduł `window.CCNewsletter` (`js/cc-newsletter.js`), otwiera dostępny modal/slide-over Newslettera bezpośrednio na bieżącym portalu, dziedzicząc jego motyw kolorystyczny i automatycznie przekazując `source_portal` oraz `locale`.
  2. Jeśli użytkownik otwiera link w nowej karcie lub bez JS, prowadzi bezpośrednio do kanonicznej strony `/newsletter?source=<portal>`.

---

## 2. Matryca Portali i Motywów Lokalnych

| ID Portalu (`source_portal`) | Kanoniczny URL | Profil Panelu `+` | Motyw / Paleta Lokalna | Domyślna Kategoria Sugerowana (Niezaznaczona lub Pomocnicza) | Status Integracji |
|---|---|---|---|---|---|
| `polskieradio-home` | `https://polskieradio.cc/` | `home` | Champagne Gold (`#C4A35A`) na `#07090F` | `nowosci-ekocc`, `muzyka-radio-tv` | `AKTYWNY` |
| `wyszukiwarka` | `https://polskieradio.cc/wyszukiwarka` | `search` | Klasyczny Pomarańczowy (`#FF7A00`) na `#0B0F19` | `nowosci-ekocc` | `AKTYWNY` |
| `lumina` | `https://polskieradio.cc/lumina` | `lumina` | LUMINA Dark (`#0B1120`) / Light (`#FFFAFF`) | `nowosci-ekocc`, `rodzina-zdrowie-rozwoj` | `AKTYWNY` |
| `lumina-tablica` | `https://polskieradio.cc/tablica` | `lumina` | LUMINA Dark (`#0B1120`) / Light (`#FFFAFF`) | `nowosci-ekocc` | `AKTYWNY` |
| `akademia` | `https://polskieradio.cc/akademia` | `ecosystem` | Champagne Gold (`#C4A35A`) na `#080B12` | `biblia-akademia` | `AKTYWNY` |
| `mojabiblia` | `https://polskieradio.cc/mojabiblia` | `ecosystem` | Biblical Parchment / Dark (`#C4A35A`) | `biblia-akademia` | `AKTYWNY` |
| `vod` | `https://polskieradio.cc/vod` | `ecosystem` | Cinema Dark (`#E50914` / `#C4A35A`) | `muzyka-radio-tv` | `AKTYWNY` |
| `player` | `https://polskieradio.cc/player` | `ecosystem` | Audio Studio Dark (`#FF7A00` / `#C4A35A`) | `muzyka-radio-tv` | `AKTYWNY` |
| `holos` | `https://polskieradio.cc/holos` | `ecosystem` | HOLOS Turquoise & Gold (`#00F2FE` / `#C4A35A`) | `rodzina-zdrowie-rozwoj` | `AKTYWNY` |
| `wioletta` | `https://polskieradio.cc/Wioletta` | `wioletta` | Literary Rose & Gold (`#D4AF37`) | `ksiazki-literatura` | `AKTYWNY` |
| `yis` | `https://polskieradio.cc/YIS` | `ecosystem` | YIS Creative Amber (`#FF7A00`) | `ksiazki-literatura`, `muzyka-radio-tv` | `AKTYWNY` |
| `global` | `https://polskieradio.cc/Global` | `ecosystem` | Global Navy & Gold (`#C4A35A`) | `muzyka-radio-tv`, `nowosci-ekocc` | `AKTYWNY` |
| `gerald-welch` | `https://polskieradio.cc/GeraldWelch` | `ecosystem` | Acoustic Gold (`#C4A35A`) | `muzyka-radio-tv` | `AKTYWNY` |
| `ccn-news` | `https://polskieradio.cc/news` | `ccn-react` + `ecosystem` | CCN Editorial Gold (`#C4A35A`) na `#000000` | `nowosci-ekocc` | `AKTYWNY` |
| `ccn-nauka` | `https://polskieradio.cc/nauka` | `ccn-react` + `ecosystem` | CCN Editorial (`#C4A35A`) | `nowosci-ekocc`, `biblia-akademia` | `AKTYWNY` |
| `ccn-historia` | `https://polskieradio.cc/historia` | `ccn-react` + `ecosystem` | CCN Editorial (`#C4A35A`) | `biblia-akademia`, `ksiazki-literatura` | `AKTYWNY` |
| `ccn-rodzina-seks` | `https://polskieradio.cc/seks` | `ccn-react` + `ecosystem` | CCN Editorial (`#C4A35A`) | `rodzina-zdrowie-rozwoj` | `AKTYWNY` |
| `ccn-ziu-kuchnia` | `https://polskieradio.cc/ziu`, `/kuchnia` | `ccn-react` + `ecosystem` | CCN Editorial (`#C4A35A`) | `rodzina-zdrowie-rozwoj` | `AKTYWNY` |
| `ccn-music` | `https://polskieradio.cc/music` | `ccn-react` + `ecosystem` | CCN Music (`#FF7A00` / `#C4A35A`) | `muzyka-radio-tv` | `AKTYWNY` |
| `ccn-biblioteka` | `https://polskieradio.cc/biblioteka` | `ccn-react` + `ecosystem` | CCN Library (`#C4A35A`) | `ksiazki-literatura` | `AKTYWNY` |
| `newsletter-standalone` | `https://polskieradio.cc/newsletter` | `ecosystem` | EkoCC Canonical (`#FF7A00` CTA + `#C4A35A` akcenty) | Wszystkie 5 kategorii v1 | `AKTYWNY` |

---

## 3. Wykluczenia Celowe (Ochrona Kanałów Live i Dzieci)

Zgodnie z regułami globalnymi EkoCC (`scripts/cc-page-standard.mjs`) panel `+` oraz widget newslettera **nie są wstrzykiwane** do:
- Zamrożonych ekranów emisyjnych OBS / TV (`cctv24-worship.html`, `stream-scene.html`, `cctv24.html`, `snadaniowa-live.html`, `zapolske-live.html`, `biblia-spiewana-live.html`),
- Aplikacji dziecięcej `lumi-kids/app` (ochrona osób niepełnoletnich — sekcja 4.3 specyfikacji),
- Wewnętrznego komunikatora `/mess` (dedykowany układ czatu).
