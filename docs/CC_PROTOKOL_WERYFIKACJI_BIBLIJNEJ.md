# CHRISTIAN CULTURE — PROTOKÓŁ WERYFIKACJI BIBLIJNEJ
## Instrukcja operacyjna dla @001 (Antigravity), @150 i wszystkich agentów EkoCC
**Wersja:** 1.0 — 20.10.2026  
**Status:** standard redakcyjny do wdrożenia w procedurach wykonawczych i CI  
**Nadrzędna reguła:** @777 — zbiór wspólnych zasad, NIE agent  
**Właściciel publikacji:** @001 | **Niezależny recenzent:** @150 | **Decyzja doktrynalna:** L0

## 1. Misja i granice
Każda treść przedstawiająca Boga, Jezusa Chrystusa, Ducha Świętego, charakter Boga, grzech, łaskę, zbawienie, proroctwa, modlitwę i życie chrześcijańskie ma być wierna Pismu rozpatrywanemu w kontekście. Zasada ta dotyczy również materiałów publicystycznych z wątkiem biblijnym. Każde istotne twierdzenie należy sklasyfikować jako **dosłowny cytat Pisma**, **parafraza**, **interpretacja teologiczna**, **twierdzenie historyczne/faktograficzne**, **opinia**, **osobiste świadectwo** albo **utwór artystyczny**. Nigdy nie przedstawiać interpretacji lub opowieści autora jako dosłownego tekstu biblijnego ani ogłaszać wszystkich interpretacji bezspornymi.

Model AI jest narzędziem pomocniczym, nie autorytetem nad tekstem źródłowym. Nie dopisywać Bożych obietnic nieobecnych w Biblii, nie stawiać sensacyjnych tez o datach wydarzeń eschatologicznych, nie uzależniać łaski Bożej od finansowego wsparcia misji, nie obiecywać automatycznych uzdrowień, sukcesu materialnego lub uwolnienia od uzależnienia. Świadectwo osobiste przedstawia się jako relację konkretnego człowieka, nie jako powszechną gwarancję wyniku.

## 2. Źródła i hierarchia ich wykorzystania
1. **Podstawowy zatwierdzony przekład do cytowania: UBG (Uwspółcześniona Biblia Gdańska)** — właściciel dołącza plik referencyjny; bez weryfikacji dosłownego brzmienia nie wolno oznaczać tekstu jako cytat UBG.
2. **MojaBiblia CC:** https://www.polskieradio.cc/mojabiblia — narzędzie czytania kontekstu, wyszukiwania, porównania oraz analizy leksykalnej i interlinearnej.
3. **Źródła w repozytorium serwisu:** `bible/Pismo_Swiete_UBG.pdf`, `data/bible/*.json`, `data/bible/szukaj-ubg.json`, `scripts/build-bible-search.mjs`, `mojabiblia.html`, `mojabiblia-engine.js` i `tests/mojabiblia-regression.test.mjs`. Obecność plików w repozytorium nie dowodzi, że bieżące wdrożenie produkcyjne jest poprawne ani że każdy rekord JSON zgadza się z zatwierdzonym wydaniem. Sprawdzić spójność wersji, kompletność i licencję przed stosowaniem jako źródła kanonicznego.
4. Interlinia, hebrajski/greka, morfologia i leksykon Stronga wspierają analizę znaczeń, ale **numer Stronga ani pojedyncze hasło słownika nie rozstrzygają automatycznie doktryny**. Podawać kontekst, gramatykę i zakres znaczeń.
5. Dodatkowe komentarze i opracowania to źródła wtórne; wymagają atrybucji i odróżnienia od tekstu natchnionego. Nie zastępują Biblii.

## 3. Obowiązkowa kontrola w 12 krokach
**K1 — Inwentaryzacja twierdzeń:** wyodrębnij każde twierdzenie odwołujące się do Pisma lub obrazu Boga (również sugestię w tytule i miniaturze).

**K2 — Dopasowanie referencji:** sprawdź poprawność księgi, rozdziału i wersetu, zakres cytatu, spójność oznaczeń i przekładu. Brak pewności => `VERIFY_REQUIRED`.

**K3 — Kontrola dosłowności UBG:** porównaj cytat znak po znaku po normalizacji wyłącznie białych znaków; wszelkie skróty zaznacz wielokropkiem, a parafrazy oznacz „na podstawie”. Nie parafrazuj pod pozorem cudzysłowu.

**K4 — Kontekst lokalny:** czytaj przynajmniej sąsiednie wersety i rozdział; sprawdź, kto mówi do kogo, kiedy, w jakiej sytuacji oraz czy to nakaz, relacja, obietnica, przypowieść czy poezja.

**K5 — Kontekst całej Biblii:** rozważ powiązane fragmenty ST/NT, kontekst kanoniczny i chrystocentryczną oś Ewangelii. Nie twórz doktryny z pojedynczego wersetu wyrwanego z kontekstu.

**K6 — Rozróżnienie gatunków:** nie traktuj symbolicznej wizji i języka apokaliptycznego jako literalnego opisu wydarzeń bez uzasadnienia; nie przekładaj przypowieści bezpośrednio na przepisy.

**K7 — Ocena obrazu Boga i Ewangelii:** sprawdź, czy tekst wiernie przedstawia miłość, sprawiedliwość, miłosierdzie, świętość, wolność sumienia i dzieło Jezusa w ramach przyjętej redakcyjnej interpretacji Pisma; identyfikuj nieuzasadniony strach, szantaż emocjonalny, potępienie osób i manipulację.

**K8 — Doktryna i spory interpretacyjne:** w tematach spornych wskaż właściwe fragmenty i poziom pewności, a nie udawaj jednomyślności chrześcijan. Wierność przyjętej linii EkoCC nie uprawnia do fałszowania cytatów ani przypisywania odmiennym chrześcijanom motywów.

**K9 — Kontrola faktów:** oddziel fakty historyczne, medyczne, finansowe i bieżące wiadomości od egzegezy. Dla faktów pozabiblijnych użyj stosownych źródeł; w sytuacjach wysokiego ryzyka obowiązuje dodatkowa recenzja specjalistyczna.

**K10 — Kontrola formatu:** powtórz kontrolę dla SEO title, H1, opisu, miniatury, grafiki, podpisów, napisów, TTS, teledysku, piosenki, Shorts/Reels, social copy i tłumaczeń PL/EN. Inny format nie może zmienić sensu zatwierdzonego tekstu.

**K11 — Niezależny recenzent:** publikacje nauczające doktryny, proroctw, opisujące Boga w sposób polemiczny lub zawierające obietnice uzdrowienia / zbawienia wymagają @150 lub dostępnego niezależnego recenzenta oraz ewentualnie decyzji L0.

**K12 — Decyzja audytowa:** dokumentuj `PASS`, `REVISION_REQUIRED`, `ESCALATE_L0` albo `NOT_APPLICABLE` (z uzasadnieniem, np. czysto techniczny komunikat). Publikuj dopiero po wymaganym `PASS` i pozostałych bramkach.

## 4. Czerwone flagi — nie przepuszczać bez korekty
- „Biblia mówi...” bez możliwego do potwierdzenia fragmentu albo ze zmianą jego sensu.
- Zmiana cytatu i podszycie się pod dosłowną UBG.
- Przemilczenie sąsiednich wersetów zmieniających wniosek.
- „Bóg gwarantuje Ci...” dla korzyści doczesnej, zdrowia, majątku albo skutku modlitwy — bez solidnej podstawy i właściwego kontekstu.
- Utożsamienie publicznego wydarzenia z konkretnym proroctwem jako stwierdzony fakt bez wykazania podstaw interpretacji.
- Przypisywanie źródłom niepotwierdzonych słów, cudów, statystyk lub dat.
- Tytuł clickbaitowy, który stawia twierdzenie mocniejsze od treści artykułu.
- Łączenie możliwości zbawienia, Bożej akceptacji lub duchowego błogosławieństwa z koniecznością wpłaty.
- Niezweryfikowane świadectwo przedstawione jako medycznie potwierdzony fakt.
- Potępianie, znieważanie lub dehumanizowanie osób albo grup pod pozorem wierności Biblii.

## 5. Szczególne pola tematyczne
- **Zbawienie:** rozdziel łaskę, wiarę, uczynki, uświęcenie i ich relacje; przytocz pełny kontekst.
- **Dekalog i dzień odpoczynku:** cytuj dokładnie i prezentuj rozumowanie oparte na tekście, bez manipulacyjnego przekształcania innych tradycji.
- **Śmierć i zmartwychwstanie:** nie pomijaj kontekstu biblijnego ani rozbieżności interpretacyjnych.
- **Apokalipsa i proroctwa:** wyraźnie odróżniaj tekst, historyczne szkoły interpretacyjne i współczesną hipotezę; bez wyznaczania dat.
- **Modlitwa, uzdrowienie, uzależnienia:** świadectwo wiary nie może zastępować profesjonalnego leczenia ani obiecywać rezultatu każdemu.
- **Finanse, patronat i mecenat:** dobrowolność i przejrzystość; zero handlu łaską lub wzbudzania poczucia winy.
- **Życie publiczne:** nie przybieraj tonu boskiego potwierdzenia dla niezweryfikowanych wiadomości czy preferencji politycznych.

## 6. Przepływ redakcyjny i niezależność kontroli
`AUTOR / AGENT → KARTA TWIERDZEŃ → UBG + MojaBiblia → RECENZJA TREŚCI → @150 (gdy wymagane) → @001 BRAMKA EMISYJNA → PUBLIKACJA → AUDYT OPUBLIKOWANEGO MATERIAŁU`.

@001 jest odpowiedzialny za kompletność procesu, nie ma obowiązku być jedynym teologiem. Gdy @150 nie działa, należy przeprowadzić rzeczywisty niezależny przegląd przez uprawnionego zastępcę albo skierować ryzykowny materiał do L0. Brak tokenów i presja czasu nie uprawniają do ominięcia kontroli. Nie przedstawiać technicznie skonfigurowanej automatycznej klasyfikacji jako nieomylnego „sita doktrynalnego”.

## 7. Minimalny rekord kontroli (JOMA)
```yaml
review_id: BIBLE-REVIEW-YYYYMMDD-NNN
content_id: ""
content_version_sha: ""
asset_types: [article, image, audio, video, social]
claim_type: [quotation, paraphrase, interpretation, factual, testimony]
primary_translation: UBG
biblical_refs: []
source_location: "bible/Pismo_Swiete_UBG.pdf lub MojaBiblia + referencje"
context_checked: true
alternative_readings_noted: false
potential_distortion: []
corrections_required: []
reviewer_id: "@001"
independent_reviewer: "@150 or authorized backup / N/A with justification"
status: PASS  # or REVISION_REQUIRED / ESCALATE_L0 / NOT_APPLICABLE
evidence_paths: []
estimate_minutes: 15
eta_handoff: "set after real ACK"
publication_authorized: false
```
**Uwaga:** powyższe wartości to wzór, nie rzeczywisty wynik kontroli.

## 8. Walidacje automatyczne — zakres realny
Można automatycznie porównać: istniejące referencje, poprawne numery rozdziałów/wersetów, dosłowne fragmenty z zatwierdzoną bazą UBG, identyfikowalność źródeł, obowiązkowe pole review/status, spójność wersji treści z jej metadanymi. Nie można mechanicznie i bezbłędnie zagwarantować pełnej poprawności egzegezy lub doktryny — pozostaje przegląd kontekstowy, recenzja i L0. Przed integracją należy porównać lokalną bazę JSON z referencyjnym egzemplarzem UBG i upewnić się co do prawa użycia tekstu.

## 9. Odbiór wdrożenia przez @001 i @007
- [ ] Import UBG wersjonowany, legalny, w pełni identyfikowalny.
- [ ] Moduł wyszukiwania i referencji MojaBiblia działa na prawdziwych danych (po teście produkcyjnym).
- [ ] Dla reprezentatywnych błędów cytatu test blokuje publikację.
- [ ] Parafraza jest rozpoznawana i prawidłowo oznaczana.
- [ ] Materiał doktrynalny bez recenzji nie przechodzi bramki.
- [ ] Artefakty po publikacji odpowiadają zatwierdzonym wersjom.
- [ ] Wpis JOMA posiada właściciela, czas 5–10–15, ETA, ACK, decyzję i dowód.
- [ ] Prawidłowo działa tryb awaryjny operatorów (HANDOFF), bez obchodzenia bramek.

## 10. Zastosowanie i wdrożenie
Ta instrukcja jest obowiązkowym dodatkiem do polityki publikacyjnej @001 oraz wspólnej dyrektywy @777. @005 rozsyła właściwe mandaty i zbiera potwierdzenia ACK, @007 opracowuje narzędzia walidacyjne, @150 pełni niezależny przegląd. Każdy kolejny operator tego samego Gabinetu musi kontynuować na podstawie tej samej wersji instrukcji i istniejących dowodów. **Zapis dokumentu sam w sobie nie uruchamia mechanizmu kontroli.**
