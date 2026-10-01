# ARCHITEKTURA I SPECYFIKACJA SYSTEMU 2009 LEKCJI
## „Z BIBLIĄ ZA PAN BRAT” (2026–2032)
### Biblijna Akademia LUMINA • Christian Culture

---

## 1. DOKTRYNA I FUNDAMENT PROJEKTU

> **66 KSIĄG → 66 MIESIĘCY → 1 KSIĘGA NA MIESIĄC → 1 LEKCJA DZIENNIE = 2009 LEKCJI**

- **Horyzont czasowy:** 1 października 2026 — 31 marca 2032 (dokładnie 2009 dni)
- **Klucz teologiczny:** 100% biblijny, chrystocentryczny, ewangeliczny, hermeneutyka natchnienia (J 5:39; Łk 24:27; Ps 119:105).
- **Wielka Meta-Narracja Biblii:**
  `STWORZENIE → UPADEK → OBIETNICA → PRZYMIERZE → ODKUPIENIE → JEZUS CHRYSTUS → KOŚCIÓŁ I MISJA → POWRÓT CHRYSTUSA → NOWE STWORZENIE`
- **Rozróżnienie formy i treści:** Jeden uniwersalny, responsywny silnik prezentacji (Level 1, Level 2, Level 3) + baza danych 2009 rekordów JSON. Elastyczna struktura blokowa pozwala na adaptację do różnych gatunków literackich (narracje historyczne, poezja Psalmów, proroctwa Daniela i Apokalipsy, dyskurs teologiczny Listów Pawła).

---

## 2. STRUKTURA TRÓJPOZIOMOWA SYSTEMU

```
POZIOM 1: PORTAL GŁÓWNY KURSU
(/akademia#kurscodzienny & /akademia/kurscodzienny)
  │
  ├── Dashboard 66 Miesięcy / 66 Ksiąg
  ├── Wskaźnik Progresu Globalnego: X / 2009 lekcji, X / 66 ksiąg
  ├── Tryb „Idę z Akademią” (bieżąca data)
  └── Tryb „Zaczynam od początku” (od Rdz 1)
        │
        ▼
POZIOM 2: PORTAL KSIĘGI / MIESIĄCA
(/akademia/kurscodzienny/{ksiega}/ lub widok siatki miesiąca)
  │
  ├── Karta Księgi: Tło historyczne, autor, klucz chrystologiczny, cel
  ├── Siatka Dni Miesiąca (28–31 lekcji)
  ├── Status per kafelek: NOWA / ROZPOCZĘTA / UKOŃCZONA
  └── Miniatury tematyczne z dedykowanymi motywami wizualnymi
        │
        ▼
POZIOM 3: CODZIENNA LEKCJA (1 z 2009)
(/akademia/kurscodzienny/dzien-{globalNumber} lub /{ksiega}/dzien-{dayNumber})
  │
  ├── Dynamiczna Kompozycja Blokowa (15 standardowych sekcji)
  ├── Odtwarzacz Audio TTS (Web Speech API)
  ├── Werset pamięciowy z kopiowaniem
  ├── Studium egzegetyczne i Spotlight „Jezus w centrum”
  ├── Interaktywny Quiz (3–6 pytań z walidacją)
  ├── Dziennik & Zadanie (autosave w localStorage)
  ├── Kontakt duszpasterski (Duchowny Mariusz, +48 608 337 477)
  └── Nawigacja łańcuchowa: Poprzednia ← | → Następna (z zapowiedzią jutra)
```

---

## 3. PEŁNY KALENDARZ 66 KSIĄG (2009 DNI)

| # | Miesiąc | Księga Biblii | Liczba dni | Zakres numerów lekcji |
|---:|---|---|---:|---|
| 1 | X 2026 | Rodzaju | 31 | 1 – 31 |
| 2 | XI 2026 | Wyjścia | 30 | 32 – 61 |
| 3 | XII 2026 | Kapłańska | 31 | 62 – 92 |
| 4 | I 2027 | Liczb | 31 | 93 – 123 |
| 5 | II 2027 | Powtórzonego Prawa | 28 | 124 – 151 |
| 6 | III 2027 | Jozuego | 31 | 152 – 182 |
| 7 | IV 2027 | Sędziów | 30 | 183 – 212 |
| 8 | V 2027 | Rut | 31 | 213 – 243 |
| 9 | VI 2027 | 1 Samuela | 30 | 244 – 273 |
| 10 | VII 2027 | 2 Samuela | 31 | 274 – 304 |
| 11 | VIII 2027 | 1 Królewska | 31 | 305 – 335 |
| 12 | IX 2027 | 2 Królewska | 30 | 336 – 365 |
| 13 | X 2027 | 1 Kronik | 31 | 366 – 396 |
| 14 | XI 2027 | 2 Kronik | 30 | 397 – 426 |
| 15 | XII 2027 | Ezdrasza | 31 | 427 – 457 |
| 16 | I 2028 | Nehemiasza | 31 | 458 – 488 |
| 17 | II 2028 | Estery (rok przestępny) | 29 | 489 – 517 |
| 18 | III 2028 | Hioba | 31 | 518 – 548 |
| 19 | IV 2028 | Psalmów | 30 | 549 – 578 |
| 20 | V 2028 | Przysłów | 31 | 579 – 609 |
| 21 | VI 2028 | Kaznodziei Salomona | 30 | 610 – 639 |
| 22 | VII 2028 | Pieśń nad Pieśniami | 31 | 640 – 670 |
| 23 | VIII 2028 | Izajasza | 31 | 671 – 701 |
| 24 | IX 2028 | Jeremiasza | 30 | 702 – 731 |
| 25 | X 2028 | Lamentacji | 31 | 732 – 762 |
| 26 | XI 2028 | Ezechiela | 30 | 763 – 792 |
| 27 | XII 2028 | Daniela | 31 | 793 – 823 |
| 28 | I 2029 | Ozeasza | 31 | 824 – 854 |
| 29 | II 2029 | Joela | 28 | 855 – 882 |
| 30 | III 2029 | Amosa | 31 | 883 – 913 |
| 31 | IV 2029 | Abdiasza | 30 | 914 – 943 |
| 32 | V 2029 | Jonasza | 31 | 944 – 974 |
| 33 | VI 2029 | Micheasza | 30 | 975 – 1004 |
| 34 | VII 2029 | Nahuma | 31 | 1005 – 1035 |
| 35 | VIII 2029 | Habakuka | 31 | 1036 – 1066 |
| 36 | IX 2029 | Sofoniasza | 30 | 1067 – 1096 |
| 37 | X 2029 | Aggeusza | 31 | 1097 – 1127 |
| 38 | XI 2029 | Zachariasza | 30 | 1128 – 1157 |
| 39 | XII 2029 | Malachiasza | 31 | 1158 – 1188 |
| 40 | I 2030 | Mateusza | 31 | 1189 – 1219 |
| 41 | II 2030 | Marka | 28 | 1220 – 1247 |
| 42 | III 2030 | Łukasza | 31 | 1248 – 1278 |
| 43 | IV 2030 | Jana | 30 | 1279 – 1308 |
| 44 | V 2030 | Dzieje Apostolskie | 31 | 1309 – 1339 |
| 45 | VI 2030 | Rzymian | 30 | 1340 – 1369 |
| 46 | VII 2030 | 1 Koryntian | 31 | 1370 – 1400 |
| 47 | VIII 2030 | 2 Koryntian | 31 | 1401 – 1431 |
| 48 | IX 2030 | Galatów | 30 | 1432 – 1461 |
| 49 | X 2030 | Efezjan | 31 | 1462 – 1492 |
| 50 | XI 2030 | Filipian | 30 | 1493 – 1522 |
| 51 | XII 2030 | Kolosan | 31 | 1523 – 1553 |
| 52 | I 2031 | 1 Tesaloniczan | 31 | 1554 – 1584 |
| 53 | II 2031 | 2 Tesaloniczan | 28 | 1585 – 1612 |
| 54 | III 2031 | 1 Tymoteusza | 31 | 1613 – 1643 |
| 55 | IV 2031 | 2 Tymoteusza | 30 | 1644 – 1673 |
| 56 | V 2031 | Tytusa | 31 | 1674 – 1704 |
| 57 | VI 2031 | Filemona | 30 | 1705 – 1734 |
| 58 | VII 2031 | Hebrajczyków | 31 | 1735 – 1765 |
| 59 | VIII 2031 | Jakuba | 31 | 1766 – 1796 |
| 60 | IX 2031 | 1 Piotra | 30 | 1797 – 1826 |
| 61 | X 2031 | 2 Piotra | 31 | 1827 – 1857 |
| 62 | XI 2031 | 1 Jana | 30 | 1858 – 1887 |
| 63 | XII 2031 | 2 Jana | 31 | 1888 – 1918 |
| 64 | I 2032 | 3 Jana | 31 | 1919 – 1949 |
| 65 | II 2032 | Judy (rok przestępny) | 29 | 1950 – 1978 |
| 66 | III 2032 | Apokalipsa | 31 | 1979 – 2009 |
| **SUMA** | **66 Miesięcy** | **66 Ksiąg Pisma Świętego** | **2009 dni** | **2009 LEKCJI** |

---

## 4. SCHEMAT REKORDU METADANYCH LEKCJI (28 PÓL)

Każda jednostka studium w bazie (`data/kurscodzienny/lessons/` lub Firestore) posiada znormalizowaną strukturę JSON:

```json
{
  "courseId": "z-biblia-za-pan-brat",
  "bookNumber": 1,
  "bookName": "Rodzaju",
  "bookSlug": "rodzaju",
  "testament": "OLD",
  "monthNumber": 1,
  "calendarMonth": "2026-10",
  "lessonGlobalNumber": 2,
  "lessonMonthNumber": 2,
  "publicationDate": "2026-10-02",
  "title": "STWORZENI DO RELACJI Z BOGIEM",
  "subtitle": "Odpoczynek, praca, bliskość i małżeństwo — Rdz 2:1–25",
  "scriptureRange": "Rdz 2:1–25",
  "memoryVerse": {
    "reference": "Rdz 2:3",
    "translation": "UBG",
    "text": "I Bóg pobłogosławił siódmy dzień i uświęcił go, bo w nim odpoczął od całego swego dzieła, które stworzył i uczynił."
  },
  "mainIdea": "Bóg nie stworzył człowieka jedynie po to, aby istniał i pracował. Stworzył nas do relacji — z Nim, z drugim człowiekiem i ze światem, który nam powierzył.",
  "introBeforeBible": "Wczoraj rozpoczęliśmy od pierwszych słów Pisma...",
  "studySections": [
    { "number": 1, "heading": "STWORZENIE ZOSTAŁO UKOŃCZONE", "content": "..." }
  ],
  "jesusInCenter": {
    "title": "PAN SABATU I ODNOWICIEL RELACJI",
    "content": "..."
  },
  "crossReferences": [
    { "from": "Rdz 2:1–3", "to": "Wj 20:8–11", "prompt": "Na jakim wydarzeniu Bóg opiera czwarte przykazanie?" }
  ],
  "truthForToday": "Rdz 2 pokazuje, że zdrowe życie posiada właściwy porządek: Bóg, Odpoczynek, Praca, Granice, Relacje, Małżeństwo.",
  "reflectionQuestions": [
    "Czy w moim tygodniu naprawdę istnieje czas oddzielony dla Boga?"
  ],
  "quiz": [
    {
      "question": "Który dzień Bóg pobłogosławił i uświęcił?",
      "options": ["Siódmy dzień (Rdz 2:2–3)", "Pierwszy dzień", "Wszystkie dni w równym stopniu"],
      "correctIndex": 0
    }
  ],
  "decision": "Panie Jezu, nie chcę tylko wiedzieć o Tobie. Chcę żyć z Tobą.",
  "prayer": "Ojcze w niebie, dziękuję Ci, że nie stworzyłeś mnie jedynie do pracy...",
  "dailyTask": {
    "reading": "Przeczytaj cały Rdz 2:1–25",
    "inputs": [
      "Rdz 2 pokazuje mi o Bogu, że…",
      "Najbardziej zaniedbaną relacją lub dziedziną mojego życia jest…",
      "Dzisiaj chcę oddać Bogu…"
    ],
    "action": "Zaplanuj konkretny czas, który oddzielisz na spotkanie z Bogiem bez telefonu i rozpraszaczy."
  },
  "visualMotif": "Eden o poranku, harmonia natury, człowiek odpoczywający w obecności Stwórcy, ciepłe złote światło",
  "historicalSetting": "Początki ludzkości, nieskażone stworzenie przed upadkiem, mezopotamski krajobraz Edenu",
  "image": {
    "sourceUrl": "/images/academy/daily/kc_day_0002_hero.jpg",
    "ratios": {
      "16_9": "/images/academy/daily/kc_day_0002_16x9.jpg",
      "1_1": "/images/academy/daily/kc_day_0002_1x1.jpg",
      "4_5": "/images/academy/daily/kc_day_0002_4x5.jpg",
      "9_16": "/images/academy/daily/kc_day_0002_9x16.jpg"
    }
  },
  "previousLesson": "/akademia/kurscodzienny/dzien-01",
  "nextLesson": "/akademia/kurscodzienny/dzien-03",
  "status": "PUBLISHED"
}
```

---

## 5. SYSTEM GENEROWANIA GRAFIK (2009 INDYWIDUALNYCH ILUSTRACJI)

### Żelazne reguły estetyki i wierności:
1. **Unikalność:** Każdy z 2009 dni posiada unikalną ilustrację wynikającą z konkretnego tekstu, a nie generyczną dla całej księgi.
2. **Czystość kadru (Zero typografii w obrazie):** Kategoryczny zakaz generowania napisów, numerów dni, cytatów czy logo wewnątrz obrazu. Wszelkie napisy nakładane są czystym CSS/HTML na stronie.
3. **Stylistyka:** Filmowy realizm, monumentalne oświetlenie, powaga, nadzieja, historyczna wierność realiom biblijnym, brak współczesnych rekwizytów i brak religijnego kiczu.
4. **Wizerunek Boga Ojca:** Kategoryczny zakaz przedstawiania Boga Ojca jako postaci ludzkiej (starca z brodą itp.). Zastępujemy Go światłem, majestatem stworzenia, symbolem obecności (Szekina).
5. **Wizerunek Chrystusa:** Przedstawiamy postać Jezusa wyłącznie tam, gdzie rzeczywiście występuje w tekście (Ewangelie, chrystofanie, Apokalipsa). Nie umieszczamy sztucznie Jezusa fizycznie w każdej scenie Starego Testamentu.
6. **Formuła promptu generatora:**
   > *„Stwórz wysokiej jakości ilustrację biblijną dla codziennej lekcji kursu 'Z Biblią za Pan Brat'. Temat: {title}. Tekst biblijny: {scriptureRange}. Motyw wizualny: {visualMotif}. Realia: {historicalSetting}. Główna myśl: {mainIdea}. Styl filmowy, realistyczny, poważny, pełen światła i nadziei, bez współczesnych elementów, bez napisów, bez typografii, bez logo. Kompozycja centralna z bezpiecznym marginesem do kadrowania w formatach 16:9, 1:1, 4:5 i 9:16. Nie przedstawiaj Boga Ojca jako postaci ludzkiej. Unikaj kiczu i elementów niewynikających z tekstu.”*

---

## 6. WORKFLOW REDAKCYJNY I PUBLIKACYJNY

```
[PLANOWANA]
    ↓ (Redakcja tekstu biblijnego, egzegeza, chrystocentryzm)
[W OPRACOWANIU]
    ↓ (5 Pytań Kontrolnych Hermeneutyki)
[DO WERYFIKACJI]
    ↓ (Zatwierdzenie teologiczne Dowódcy / Redaktora)
[ZATWIERDZONA]
    ↓ (Wygenerowanie ilustracji z motywem visualMotif)
[GRAFIKA GOTOWA]
    ↓ (Zaplanowanie daty w schedulerze)
[ZAPLANOWANA]
    ↓ (Automatyczna publikacja o 00:00 dnia publikacji)
[OPUBLIKOWANA] (Live na polskieradio.cc/akademia/kurscodzienny/...)
```

---

## 7. PIĘĆ PYTAŃ KONTROLNYCH PRZED PUBLIKACJĄ KAŻDEJ LEKCJI
1. **Czy wynika z tekstu?** (Nie wkładamy do fragmentu idei, których tekst nie wspiera).
2. **Czy zachowuje kontekst?** (Nie budujemy wniosków na wyrwanym fragmencie).
3. **Czy prowadzi do Chrystusa w sposób biblijnie uzasadniony?** (Prawdziwa typologia, proroctwo lub antyteza łaski — bez sztucznej alegoryzacji).
4. **Czy rozróżnia Ewangelię od uczynków?** (Zbawienie wyłącznie z łaski przez wiarę w Chrystusa; uświęcenie i posłuszeństwo jako owoc).
5. **Czy prowadzi do osobistej odpowiedzi?** (Konkretna decyzja, modlitwa i zadanie wiary na dany dzień).
