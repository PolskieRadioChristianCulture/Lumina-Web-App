# GRAFIK ROZWOJU PROGRAMU TV & RAMÓWKA 24/7
## Christian Culture TV & Radio — Portal polskieradio.cc

Document Status: ACTIVE ROADMAP  
Ostatnia aktualizacja: 10 Sierpnia 2026

---

## 📑 1. WIZJA I STRATEGIA
Głównym celem jest zbudowanie nowoczesnej, spójnej estetycznie i duchowo całodobowej telewizji oraz radia chrześcijańskiego (**Christian Culture TV / CC TV 24/7**). Ramówka opiera się na automatycznym podziale pasmowym sterowanym przez **Master Control Room (`master-live.html`)**, gwarantując bogaty, różnorodny program przez 7 dni w tygodniu bez jakichkolwiek przerw w emisji.

---

## ⏰ 2. PEŁNY PLAN HARMONOGRAMU 24/7 (PONIEDZIAŁEK – NIEDZIELA)

| Godziny | Nazwa Bloku | Opis i Zawartość Programowa | Kanał / Trasa |
|---|---|---|---|
| **06:00 – 08:00** | **☀️ Poranek „Zjednoczeni za Polskę”** | Modlitwa poranna, werset dnia, intencje widzów na ekranie | `zapolske-live.html` |
| **08:00 – 09:00** | **📖 Studium Telewizyjne Pisma Świętego** | Głębokie studium Słowa Bożego werset po wersecie (572 odcinki) | `studium-live.html` |
| **09:00 – 09:06** | **📌 Apokalipsa Dzień po Dniu** | Krótka etiuda komentarzowa dnia | `apokalipsa-live.html` |
| **09:06 – 10:00** | **🌱 Wzrastanie w Wierze & Styl Życia** | Relacje, rodzina, dyskusje, chrześcijańska codzienność | `master-live.html` |
| **10:00 – 11:00** | **🔥 Apokalipsa: Księga Nadziei** | Kompletny Kurs Biblijny proroctw Księgi Objawienia | `apokalipsa-ksiega-nadziei-live.html` |
| **11:00 – 12:00** | **💬 Świadectwa Życia & Wywiady** | Historie nawróceń, przemiany życia, inspirujące reportaże | `master-live.html` |
| **12:00 – 15:00** | **🎶 Biblia Śpiewana & Worship** | Śpiewane Przypowieści Salomona i utwory uwielbienia | `biblia-spiewana-live.html` |
| **15:00 – 15:06** | **📌 Apokalipsa Dzień po Dniu** | Popołudniowy komentarz dnia | `apokalipsa-live.html` |
| **15:06 – 16:00** | **🎶 Biblia Śpiewana — Pasmo Popołudniowe** | Spokojne kompozycje muzyczne i wersety Pisma Świętego | `biblia-spiewana-live.html` |
| **16:00 – 18:00** | **🎵 Śpiewajmy Panu — Codzienny Blok Muzyczny** | 2-godzinny blok z utworami uwielbienia i nowościami Christian Culture Music (Odtwarzanie Losowe 24/7) | `spiewajmy-panu-live.html` |
| **18:00 – 20:00 (Sobota)** | **🎬 Chrześcijański Blok Filmowy & Dokumenty** | Filmy fabularne, kino chrześcijańskie, dokumenty, koncerty na żywo | `kino-live.html` |
| **18:00 – 20:00 (Niedziela)** | **💬 Świadectwa — Cykl Historii Wiary** | Poruszające historie nawróceń, przemiany życia i uzdrowień (Cykl 11 filmów w rotacji) | `swiadectwa-live.html` |
| **20:00 – 21:00** | **📖 Studium Telewizyjne Pisma Świętego** | Wydanie wieczorne wykładu werset po wersecie | `studium-live.html` |
| **21:00 – 21:06** | **📌 Apokalipsa Dzień po Dniu** | Wieczorny komentarz dnia | `apokalipsa-live.html` |
| **21:06 – 22:00** | **🎶 Biblia Śpiewana — Finał Dnia** | Zwieńczenie dnia muzyką uwielbienia | `biblia-spiewana-live.html` |
| **22:00 – 23:00** | **🔥 Apokalipsa: Księga Nadziei** | Wieczorne wydanie kursu biblijnego | `apokalipsa-ksiega-nadziei-live.html` |
| **23:00 – 06:00** | **🌙 Nocne Czuwanie & Worship — Pasmo Nocne** | 100% muzyki i relaksu z cyklem 23 rotacyjnych filmów nocnych (1 pozycja na dobę) | `nocne-czuwanie-live.html` |

---

## 🎬 3. CHRZEŚCIJAŃSKI BLOK FILMOWY (18:00 – 20:00 & WEEKENDY)
- **Kino Chrześcijańskie**: Filmy fabularne o wartościach ewangelicznych, historii Kościoła i bohaterach wiary.
- **Filmy Dokumentalne**: Reportaże i dokumenty biblijne, archeologia Pisma Świętego, misje na świecie.
- **Koncerty & Transmisje Uwielbienia**: Retransmisje wielkich wydarzeń muzycznych i wieczorów uwielbienia.

---

## 📺 4. MAPA KANAŁÓW NADAWCZYCH I SYSTEMÓW EMISYJNYCH

1. **Reżyserka Główna (MCR)**: [`master-live.html`](file:///C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/master-live.html)
   - Automatycznie steruje przełączaniem pasm według zegara serwera.
   - Odbiera sygnały `postMessage` po zakończeniu pojedynczych odcinków i wraca do głównego programu.
2. **Pasmo Poranne**: [`zapolske-live.html`](file:///C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/zapolske-live.html)
3. **Pasmo Uwielbienia**: [`biblia-spiewana-live.html`](file:///C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/biblia-spiewana-live.html)
4. **Pasmo Nocne**: [`cctv24-worship.html`](file:///C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/cctv24-worship.html) *(Stan produkcyjny – Zamrożony)*
5. **Kanały Specjalne i Seriale**:
   - Etiuda Dnia: [`apokalipsa-live.html`](file:///C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/apokalipsa-live.html)
   - Kurs Biblijny: [`apokalipsa-ksiega-nadziei-live.html`](file:///C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/apokalipsa-ksiega-nadziei-live.html)
   - Studium Biblijne: [`studium-live.html`](file:///C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/studium-live.html)
   - Panel Sterowania & OBS: [`nadawaj.html`](file:///C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/nadawaj.html)

---

## 🚀 5. ETAPY DALSZEGO ROZWOJU (ROADMAP)
- [x] Wdrożenie etiud "Apokalipsa Dzień po Dniu" z precyzyjnym celowaniem 1 odcinka dziennie.
- [x] Wdrożenie 24-lekcyjnego Kursu "Apokalipsa: Księga Nadziei" (10:00 & 22:00).
- [x] Wdrożenie 572-odcinkowego "Studium Telewizyjnego Pisma Świętego" (08:00 & 20:00).
- [x] Płynne 30-sekundowe autowygaszanie nakładek UI dla zachowania czystego obrazu.
- [ ] Utworzenie dedykowanego modułu dla **Chrześcijańskiego Bloku Filmowego (18:00 – 20:00)**.
- [ ] Rozbudowa pasm weekendowych (Sobota/Niedziela) z dedykowaną ramówką świąteczno-koncertową.
