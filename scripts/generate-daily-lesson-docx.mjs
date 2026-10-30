import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Header, Footer, PageNumber, NumberFormat, BorderStyle } from 'docx';
import fs from 'node:fs';
import path from 'node:path';

// Dzień 31: Rdz 50:1–26 (31 października 2026, Sobota)
const DAY_NUM = 31;
const DATE_STR = '2026-10-31';
const DATE_FORMATTED = 'Sobota, 31 października 2026 r.';
const BOOK = 'KSIĘGA RODZAJU';
const READING = 'Rdz 50:1–26';
const TITLE = 'BÓG OBRÓCIŁ TO W DOBRO — EWANGELIA OPATRZNOŚCI';
const SUBTITLE = 'Pochówek Jakuba, lęk braci przed zemstą i wiara Józefa sięgająca poza Egipt';
const MEMORY_VERSE = '„Wy wprawdzie myśleliście o złu przeciwko mnie, ale Bóg obrócił to w dobro, aby uczynić to, co dziś widzimy, by zachować przy życiu liczny lud.” (Rdz 50:20, UBG)';
const THEME = 'Finał Księgi Rodzaju łączy ból żałoby z triumfem Bożej suwerenności. Ludzkie zło i grzech nie niweczą Bożego planu odkupienia, a Józef wskazuje drogę do prawdziwego przebaczenia i niezłomnej nadziei przymierza.';

console.log('Rozpoczynam generowanie pełnej lekcji Dnia 31 (Rdz 50)...');

const lessonFullText = `66 KSIĄG • 66 MIESIĘCY • CODZIENNA PODRÓŻ PRZEZ PISMO ŚWIĘTE
KSIĘGA RODZAJU • MIESIĄC 1 • DZIEŃ 31
BÓG OBRÓCIŁ TO W DOBRO — EWANGELIA OPATRZNOŚCI
Pochówek Jakuba, lęk braci przed zemstą i wiara Józefa sięgająca poza Egipt
Sobota, 31 października 2026 r.  |  Czytanie: Rdz 50:1–26
TEKST PAMIĘCIOWY: „Wy wprawdzie myśleliście o złu przeciwko mnie, ale Bóg obrócił to w dobro, aby uczynić to, co dziś widzimy, by zachować przy życiu liczny lud.” (Rdz 50:20, UBG)
MYŚL PRZEWODNIA: Finał Księgi Rodzaju łączy ból żałoby z triumfem Bożej suwerenności. Ludzkie zło i grzech nie niweczą Bożego planu odkupienia, a Józef wskazuje drogę do prawdziwego przebaczenia i niezłomnej nadziei przymierza.

ZANIM OTWORZYSZ BIBLIĘ
Pięćdziesiąty rozdział Księgi Rodzaju stanowi monumentalne zamknięcie pierwszej i fundamentalnej księgi Pisma Świętego. Rozpoczynaliśmy tę podróż w Rdz 1 przy doskonałym stworzeniu świata z nicości przez potężne Boże Słowo. Przechodziliśmy przez tragedię upadku w Edenie, dramat potopu, powołanie Abrahama z Ur chaldejskiego, wędrowne ołtarze Izaaka oraz zmagania i przemianę Jakuba. Wczoraj staliśmy przy łożu umierającego patriarchy, słuchając błogosławieństw dla dwunastu plemion i mesjańskiej zapowiedzi berła Judy. Dziś stoimy w obliczu śmierci Jakuba i ostatnich dni samego Józefa.
Ten rozdział dotyka dwóch kluczowych napięć ludzkiej egzystencji. Pierwszym jest bolesna rzeczywistość żałoby i śmierci patriarchów w obcej ziemi. Choć rodzina żyje w dobrobycie krainy Goszen, Egipt nie jest ich ojczyzną. Drugim, jeszcze głębszym napięciem, jest powracający po śmierci ojca paraliżujący strach braci Józefa. Dręczeni poczuciem winy z przeszłości, obawiają się bezwzględnej zemsty ze strony egipskiego namiestnika.
Odpowiedź Józefa w Rdz 50:19–21 stanowi jeden z najwspanialszych szczytów teologicznych Starego Testamentu. Józef nie minimalizuje grzechu swoich braci ani nie relatywizuje zła, lecz podnosi wzrok ku transcendentnej Opatrzności Boga. Rozdział zamyka się przysięgą dotyczącą kości Józefa, która staje się pochodnią nadziei dla przyszłych pokoleń Izraela, zapowiadając wyjście z niewoli i wierność przymierzu.

CZĘŚĆ I — ŻAŁOBA I WIELKI POCHÓWEK JAKUBA (Rdz 50:1–14)
1. Płacz Józefa nad ojcem (50:1)
Gdy Jakub umiera, Józef przypada do twarzy swego ojca, płacze nad nim i go całuje. Pismo Święte nie nakazuje stoickiego tłumienia emocji; głęboka żałoba jest naturalną, godną i pełną miłości reakcją na śmierć ukochanej osoby.
2. Polecenie balsamowania (50:2)
Józef nakazuje lekarzom będącym w jego służbie zabalsamowanie ciała ojca. Zabieg ten, powierzony medykom, a nie egipskim kapłanom kultu zmarłych, miał cel czysto praktyczny: umożliwić transport zwłok w daleką podróż do Kanaanu.
3. Czterdzieści dni balsamowania i siedemdziesiąt dni żałoby (50:3)
Samo balsamowanie trwa czterdzieści dni, a ogólnonarodowa żałoba Egipcjan aż siedemdziesiąt dni. Okres ten, ustępujący w ceremoniale egipskim jedynie żałobie po samym faraonie (72 dni), świadczy o ogromnym autorytecie Józefa na dworze królewskim.
4. Prośba Józefa skierowana przez dworzan (50:4)
Będąc w żałobie (ze śladami żalu, nieogolonym zarostem i szatami żałobnymi), Józef nie staje bezpośrednio przed faraonem, lecz prosi dworzan o pośrednictwo. To wyraz nienagannej etykiety i szacunku dla obowiązujących reguł dworskich.
5. Przywołanie uroczystej przysięgi (50:5)
Józef powołuje się na przysięgę złożoną umierającemu ojcu (por. Rdz 47:29–31). Przysięga w grobie wykopanym w ziemi Kanaan jest dla niego świętym zobowiązaniem, którego nie unieważnia ani wysoka ranga państwowa, ani upływ czasu.
6. Zgoda faraona na podróż (50:6)
Faraon bez wahania wydaje zgodę: „Idź i pochowaj swego ojca, jak mu przysiągłeś”. Boża opaczność sprawia, że pogański władca respektuje wierność przymierzu i rodzinną lojalność hebrajskiego patriarchy.
7. Monumentalny konwój żałobny (50:7)
Wraz z Józefem wyruszają wszyscy słudzy faraona, starsi jego domu i wszyscy starsi ziemi Egiptu. Pogrzeb pasterza Jakuba staje się wydarzeniem o randze państwowej, w którym elita imperium oddaje hołd ojcu wybawiciela kraju.
8. Dom Józefa i jego bracia (50:8)
Do konwoju dołączają wszyscy bracia i cały dom Jakuba. W krainie Goszen pozostają jedynie małe dzieci oraz trzody i bydło, co świadczy o planowanym powrocie i braku intencji ucieczki z Egiptu w tamtym momencie.
9. Rydwany i jeźdźcy: ogromny orszak (50:9)
Tekst podkreśla obecność rydwanów i konnicy, tworzących „bardzo wielki orszak”. Zapewniało to ochronę przed koczowniczymi plemionami pustyni i podkreślało królewski charakter orszaku.
10. Żałoba na klepisku Atad (50:10)
Po przekroczeniu Jordanu orszak zatrzymuje się na klepisku Atad, gdzie odprawiają wielką i bardzo uroczystą żałobę trwającą siedem dni. Zwyczajowe lamentacje były wyrazem publicznego uznania wielkości zmarłego.
11. Świadectwo Kananejczyków: Abel-Micraim (50:11)
Mieszkańcy Kanaanu obserwują żałobę i mówią: „To jest ciężka żałoba Egipcjan”. Stąd miejsce to nazwano Abel-Micraim („Łąka/Żałoba Egiptu”). Wiara i ból ludu Bożego stają się czytelnym świadectwem dla otaczających narodów.
12. Pochówek w grocie Machpela i powrót (50:12–14)
Synowie składają ciało Jakuba w grocie Machpela na polu Efrona Hetyty naprzeciw Mamre, obok Abrahama, Sary, Izaaka, Rebeki i Lei (Rdz 49:30–31). Po wypełnieniu obowiązku Józef wraz z braćmi i orszakiem powraca do Egiptu, dochowując słowa danego faraonowi.

CZĘŚĆ II — POWRÓT STRACHU: BRACIA BŁAGAJĄ O ŁASKĘ (Rdz 50:15–18)
13. Zrozumienie nowej sytuacji przez braci (50:15)
Po śmierci ojca bracia uświadamiają sobie brak bufora ochronnego. Zaczynają mówić między sobą: „A jeśli Józef ma żal do nas i z pewnością odpłaci nam za całe zło, które mu wyrządziliśmy?”. Nieczyste sumienie rodzi nieustanny lęk, nawet po latach pozornego spokoju.
14. Mechanizm projekcji własnej winy (50:15)
Bracia mierzą Józefa własną miarą. Skoro sami byli zdolni do bezwzględności i zdrady, przypisują bratu pragnienie krwawej zemsty, odkładanej rzekomo jedynie ze względu na szacunek dla ojca.
15. Poselstwo do Józefa w imieniu ojca (50:16)
Bracia wysyłają posłańca do Józefa, twierdząc, że Jakub przed śmiercią nakazał przekazać prośbę o przebaczenie. Tekst biblijny nie notuje wcześniejszego nakazu Jakuba w tej sprawie; możliwe, że bracia użyli autorytetu zmarłego ojca jako tarczy obronnej.
16. Jawne nazwanie własnego występku (50:17)
W przekazanej wiadomości pojawiają się słowa: „Przebacz, proszę, występek twoich braci i ich grzech, gdyż wyrządzili ci zło”. Po raz pierwszy bracia tak jednoznacznie i bez ogródek nazywają swój czyn przestępstwem i grzechem.
17. Apel o wzgląd na Boga ich ojca (50:17)
Błagają: „Przebacz, prosimy, występek sług Boga twojego ojca”. Odwołują się do wspólnego przymierza i wiary w jedynego Boga, co stanowi właściwy fundament pojednania między wierzącymi.
18. Płacz Józefa w odpowiedzi na poselstwo (50:17)
Gdy Józef słyszy te słowa, wybucha płaczem. Płacze z bólu, że po tylu latach troski i zaopatrzenia bracia wciąż nie ufają jego miłości i podejrzewają go o złość i mściwość.
19. Bracia padają przed Józefem (50:18)
Bracia przychodzą osobiście, upadają na twarz przed Józefem i mówią: „Oto jesteśmy twoimi sługami”.
20. Ostateczne wypełnienie snów z młodości (50:18)
Scena ta stanowi domknięcie motywu snów Józefa z Rdz 37:5–11. Snopy braci i gwiazdy kłaniają się Józefowi, lecz nie jest to triumf pychy, lecz majestat przebaczenia i Bożej wierności.

CZĘŚĆ III — TEOLOGIA OPATRZNOŚCI I PRZEBACZENIA (Rdz 50:19–21)
21. „Czyż ja jestem na miejscu Boga?” (50:19)
Józef wypowiada fundamentalną zasadę biblijnej etyki: „Nie bójcie się. Czyż ja jestem na miejscu Boga?”. Prawdziwy mąż Boży nie uzurpuje sobie prawa do ferowania ostatecznego sądu ani wymierzania prywatnej zemsty. Sąd i odpłata należą wyłącznie do Pana (Pwt 32:35; Rz 12:19).
22. Uznanie realności zła (50:20)
Józef mówi otwarcie: „Wy wprawdzie myśleliście o złu przeciwko mnie”. Przebaczenie biblijne nie polega na relatywizowaniu winy ani na wmawianiu ofierze, że „nic się nie stało”. Zło braci było rzeczywistym, moralnie odrażającym grzechem.
23. Suwerenne działanie Boga: „Bóg obrócił to w dobro” (50:20)
Klucz teologiczny całej Księgi Rodzaju: Bóg potrafi wpleść grzeszne, złe intencje ludzi w realizację swojego suwerennego planu ocalenia. Grzech pozostaje winą człowieka, ale Boża mądrość triumfuje nad ludzką niegodziwością.
24. Cel ocalenia: „by zachować przy życiu liczny lud” (50:20)
Opatrzność Boża nie miała na celu jedynie osobistego sukcesu Józefa, lecz ocalenie rodziny przymierza, z której w przyszłości miał narodzić się Zbawiciel świata.
25. Rozproszenie lęku i obietnica troski (50:21)
„Nie bójcie się więc. Ja będę żywił was i wasze dzieci”. Józef odpowiada na grzech nie karą, lecz obietnicą trwałego zaopatrzenia materialnego i bezpieczeństwa dla kolejnego pokolenia.
26. Słowa pociechy trafiające do serca (50:21)
Narrator notuje: „Tak ich pocieszał i przemawiał do ich serca”. Przebaczenie chrześcijańskie nie jest chłodnym aktem prawnym, lecz duszpasterskim przywróceniem godności i pokoju zranionym relacjom.
27. Różnica między fatum a Bożą Opatrznością (50:20)
Boża opatrzność nie jest ślepym losem ani determinizmem zwalniającym człowieka z odpowiedzialności. Bracia ponoszą moralną odpowiedzialność za zdradę, a Bóg pozostaje całkowicie czysty i święty w wyprowadzaniu dobra.
28. Wzór dojrzałości duchowej Józefa (50:19–21)
Zamiast goryczy, pretensji i rozpamiętywania traumy niewoli i więzienia, Józef widzi swoje życie przez pryzmat Bożej misji. Przebaczenie uwalnia człowieka od niewoli przeszłości.

CZĘŚĆ IV — OSTATNIE DNI JÓZEFA I WIARA W OBIETNICĘ (Rdz 50:22–26)
29. Długie życie Józefa w Egipcie (50:22)
Józef mieszka w Egipcie wraz z domem swego ojca i dożywa stu dziesięciu lat. W kulturze egipskiej wiek 110 lat uchodził za symbol idealnego, spełnionego i pobłogosławionego przez Boga życia.
30. Radość z kolejnych pokoleń (50:23)
Józef ogląda synów Efraima aż do trzeciego pokolenia, a synowie Machira, syna Manassesa, rodzą się na jego kolanach (gest uznania i błogosławieństwa w rodzinie).
31. Proroctwo o Bożej interwencji (50:24)
Przed śmiercią Józef mówi do braci: „Ja umieram, ale Bóg z pewnością nawiedzi was i wyprowadzi z tej ziemi”. Jego wiara opiera się na słowie Boga danym Abrahamowi (Rdz 15:13–16).
32. Wierność przymierzu z przodkami (50:24)
Józef wskazuje cel wyjścia: „do ziemi, którą przysiągł Abrahamowi, Izaakowi i Jakubowi”. Choć doszedł do najwyższych godności w Egipcie, sercem pozostał wiernym pielgrzymem pragnącym Ziemi Obiecanej.
33. Zobowiązanie synów Izraela przysięgą (50:25)
Józef nakazuje synom Izraela złożyć przysięgę: „Gdy Bóg z pewnością was nawiedzi, wywieziecie stąd moje kości”.
34. Kości Józefa jako kotwica nadziei (50:25)
Niezłożona w egipskim piramidalnym grobowcu trumna Józefa stała się dla kolejnych pokoleń Izraelitów w niewoli widomym znakiem, że ich pobyt w Egipcie jest tymczasowy, a powrót do Kanaanu pewny (por. Wj 13:19; Joz 24:32).
35. Śmierć Józefa i balsamowanie (50:26)
Józef umiera w wieku stu dziesięciu lat. Jego ciało zostaje zabalsamowane i złożone w trumnie w Egipcie.
36. Zakończenie Księgi Rodzaju: trumna w Egipcie (50:26)
Ostatnie słowa Księgi Rodzaju brzmią: „i złożono go w trumnie w Egipcie”. To uderzające zawieszenie narracji: księga zaczyna się od światłości i życia w raju, a kończy trumną na obcej ziemi. Domaga się kontynuacji, którą przyniesie Księga Wyjścia!
37. Wiara Józefa w liście do Hebrajczyków (50:24–25)
Nowy Testament podsumowuje życie Józefa jednym kluczowym aktem wiary: „Przez wiarę Józef, umierając, wspominał o wyjściu synów Izraela i dał rozkaz co do swoich kości” (Hbr 11:22). Nie wspomina jego bogactwa ani władzy, lecz wiarę w Bożą obietnicę zmartwychwstania i ojczyzny.
38. Finał orędzia Księgi Rodzaju (50:1–26)
Księga Rodzaju dowodzi, że Bóg jest wierny swojemu przymierzu mimo słabości, grzechu i niewierności ludzi. Od obietnicy potomka niewiasty w Rdz 3:15 po berło Judy w Rdz 49:10 i wiarę Józefa w Rdz 50:20, Bóg nieustannie przygotowuje drogę dla przyjścia Jezusa Chrystusa.

JEZUS W CENTRUM — KRZYŻ, OPATRZNOŚĆ I ZWYCIĘSTWO
39. Zdrada Józefa i krzyż Chrystusa (Rdz 50:20 a Dz 2:23)
Podobnie jak Józef został zdradzony przez braci, tak Jezus został odrzucony przez swój lud i wydany na śmierć. Apostoł Piotr ogłasza: „Wydany według postanowionego planu i uprzedniej wiedzy Boga, został przez was ukrzyżowany”. Ludzie uczynili zło, lecz Bóg obrócił krzyż w zbawienie świata.
40. Modlitwa o przebaczenie na krzyżu (Rdz 50:19–21 a Łk 23:34)
Józef płacze nad braćmi, przebacza im i usuwa ich lęk. Jezus na krzyżu modli się za swoich oprawców: „Ojcze, przebacz im, bo nie wiedzą, co czynią”. W Chrystusie Boże miłosierdzie przewyższa ludzką niegodziwość.
41. Ocalenie licznego ludu (Rdz 50:20 a Hbr 2:10)
Cierpienie Józefa zachowało przy życiu naród przymierza. Cierpienie i śmierć Chrystusa doprowadziły „wielu synów do chwały”, tworząc z odkupionych lud Boży ze wszystkich narodów.
42. Karmienie tych, którzy zawinili (Rdz 50:21 a Rz 5:8)
Józef obiecuje żywić braci i ich dzieci z własnych zasobów. Jezus karmi nas Chlebem Żywota, gdy byliśmy jeszcze grzesznikami i nieprzyjaciółmi Boga.
43. Obietnica zmartwychwstania i wyjścia z niewoli (Rdz 50:24–25 a 1 Kor 15:20–23)
Rozkaz Józefa co do jego kości wypływał z wiary w zmartwychwstanie w ziemi obietnicy. Chrystus jako pierwszy zmartwychwstał, gwarantując wierzącym wyjście z grobów i wieczną ojczyznę w Królestwie Bożym.
44. Wszystko współdziała ku dobremu (Rdz 50:20 a Rz 8:28)
Apostoł Paweł formułuje nowotestamentowy odpowiednik wyznania Józefa: „A wiemy, że Bóg współdziała we wszystkim ku dobremu z tymi, którzy Go miłują”. Bóg nie jest autorem zła, lecz suwerennym Mistrzem, który wyprowadza z niego triumf łaski.

SPRAWDŹ W BIBLII — STUDIUM PORÓWNAWCZE
• Rdz 50:19–20 → Rz 12:19. Dlaczego wymierzanie zemsty jest uzurpacją Bożego autorytetu?
• Rdz 50:20 → Dz 4:27–28. Jak wrogość wobec Jezusa wypełniła odwieczny Boży plan zbawienia?
• Rdz 50:20 → Rz 8:28. Co oznacza, że Bóg obrócił zło w dobro dla miłujących Go?
• Rdz 50:21 → Mt 6:14–15. Jaki jest związek między doświadczeniem Bożej łaski a przebaczeniem bliźnim?
• Rdz 50:24–25 → Hbr 11:22. Dlaczego rozkaz Józefa dotyczący jego kości został nazwany czynem wielkiej wiary?
• Rdz 50:25 → Wj 13:19. Jak Mojżesz wypełnił przysięgę złożoną Józefowi po czterystu latach?
• Rdz 50:25 → Joz 24:32. Gdzie ostatecznie spoczęły kości Józefa w Ziemi Obiecanej?
• Rdz 50:15–17 → 1 J 4:18. Dlaczego bracia wciąż się bali i jak doskonała miłość usuwa lęk?
• Rdz 50:2–3 → J 19:39–40. Jak pochówek Jakuba i Józefa koresponduje z namaszczeniem ciała Jezusa przez Nikodema i Józefa z Arymatei?
• Rdz 50:26 → Rz 8:22–23. Dlaczego trumna w Egipcie przypomina o tęsknocie całego stworzenia za odkupieniem?
• Rdz 50:22–23 → Ps 128:5–6. Jak oglądanie kolejnych pokoleń łączy się z Bożym błogosławieństwem przymierza?
• Rdz 50:24 → Łk 1:68. W jaki sposób Bóg ostatecznie „nawiedził swój lud” w osobie Jezusa Chrystusa?

PRAWDA NA DZIŚ
• Boża suwerenność przewyższa ludzkie intencje: zło zaplanowane przez człowieka Bóg potrafi obrócić w zbawienne dobro.
• Przebaczenie wymaga stanięcia w prawdzie: nie polega na zaprzeczaniu krzywdzie, lecz na odmowie zemsty i powierzeniu sądu Bogu.
• Poczucie winy rodzi nieuzasadniony lęk, który leczy się jedynie w objęciach przebaczającej łaski.
• Człowiek dojrzały duchowo nie stawia siebie na miejscu Boga i nie wymierza prywatnej sprawiedliwości.
• Prawdziwe pojednanie przynosi konkretne owoce: troskę, życzliwość i pomoc materialną wobec tych, którzy zawinili.
• Nadzieja ludu Bożego wykracza poza doczesne granice sukcesu, opierając się na zmartwychwstaniu i wiecznej ojczyźnie.
• Księga Rodzaju uczy, że śmierć patriarchów nie kończy Bożej historii: Boże przymierze trwa przez wszystkie pokolenia.

POMYŚL — PYTANIA DO REFLEKSJI
1. Czy w Twoim życiu było bolesne doświadczenie zła, z którego Bóg ostatecznie wyprowadził duchowe dobro lub ochronę?
2. Czy potrafisz zrezygnować z chęci odwetu i powiedzieć w sercu: „Czyż ja jestem na miejscu Boga”?
3. Czy nosisz w sobie nieuzasadniony lęk przed karą za dawne, wyznane już winy, zapominając o pełnym przebaczeniu w Chrystusie?
4. Jak w praktyce możesz dziś „przemówić do serca” osobie, z którą łączy Cię trudna przeszłość relacyjna?
5. W jaki sposób postawa Józefa uczy nas odpowiedzialności za dobrobyt i bezpieczeństwo własnej rodziny?
6. Co w historii Józefa najbardziej przypomina Ci o krzyżu i ofierze Jezusa Chrystusa?
7. Czym dla Ciebie jest obietnica, że ten świat i doczesne osiągnięcia nie są Twoją ostateczną ojczyzną?
8. Jakie duchowe dziedzictwo i świadectwo wiary chciałbyś pozostawić po sobie swoim dzieciom i wnukom?

MAŁY QUIZ — 20 PYTAŃ I ODPOWIEDZI
1. Co zrobił Józef natychmiast po śmierci ojca?
Odpowiedź: Przypadł do twarzy ojca, płakał nad nim i go całował (Rdz 50:1).
2. Komu Józef polecił zabalsamowanie ciała Jakuba?
Odpowiedź: Swoim sługom lekarzom (Rdz 50:2).
3. Ile dni trwało balsamowanie Jakuba?
Odpowiedź: Czterdzieści dni (Rdz 50:3).
4. Jak długo trwała żałoba Egipcjan po Jakubie?
Odpowiedź: Siedemdziesiąt dni (Rdz 50:3).
5. Za czyim pośrednictwem Józef zwrócił się do faraona z prośbą o wyjazd?
Odpowiedź: Za pośrednictwem domowników/dworzan faraona (Rdz 50:4).
6. Na co powołał się Józef, prosząc faraona o zgodę na pogrzeb ojca?
Odpowiedź: Na przysięgę złożoną umierającemu ojcu (Rdz 50:5).
7. Kto wyruszył z Józefem na pogrzeb Jakuba do Kanaanu?
Odpowiedź: Wszyscy słudzy faraona, starsi jego domu, starsi ziemi Egiptu oraz cały dom Jakuba (Rdz 50:7–8).
8. Kto i co pozostało w ziemi Goszen podczas pogrzebu?
Odpowiedź: Jedynie małe dzieci oraz trzody i bydło (Rdz 50:8).
9. Jak nazywało się klepisko, na którym odprawiono siedmiodniową żałobę?
Odpowiedź: Klepisko Atad za Jordanem (Rdz 50:10).
10. Jak Kananejczycy nazwali miejsce żałoby Egipcjan?
Odpowiedź: Abel-Micraim (Rdz 50:11).
11. Gdzie synowie pochowali Jakuba?
Odpowiedź: W grocie na polu Machpela naprzeciw Mamre (Rdz 50:13).
12. Czego obawiali się bracia Józefa po śmierci Jakuba?
Odpowiedź: Że Józef będzie żywił urazę i zemści się za zło, które mu wyrządzili (Rdz 50:15).
13. O co bracia prosili Józefa w przesłaniu posłańca?
Odpowiedź: O przebaczenie ich występku i grzechu (Rdz 50:17).
14. Jak zareagował Józef, gdy usłyszał słowa swoich braci?
Odpowiedź: Rozpłakał się (Rdz 50:17).
15. Jakie słowa wypowiedział Józef, uwalniając braci od lęku przed zemstą?
Odpowiedź: „Nie bójcie się. Czyż ja jestem na miejscu Boga?” (Rdz 50:19).
16. Jak brzmi słynne wyznanie Józefa o Bożej Opatrzności z Rdz 50:20?
Odpowiedź: „Wy wprawdzie myśleliście o złu przeciwko mnie, ale Bóg obrócił to w dobro” (Rdz 50:20).
17. Co Józef obiecał zapewnić braciom i ich rodzinom w Rdz 50:21?
Odpowiedź: Że będzie żywił ich oraz ich dzieci (Rdz 50:21).
18. Ile lat żył Józef?
Odpowiedź: Sto dziesięć lat (Rdz 50:22, 26).
19. O czym Józef zapowiedział braciom tuż przed swoją śmiercią?
Odpowiedź: Że Bóg z pewnością nawiedzi ich i wyprowadzi z Egiptu do Ziemi Obiecanej (Rdz 50:24).
20. Jaką przysięgę Józef wymógł na synach Izraela odnośnie swojego ciała?
Odpowiedź: Że wywiozą stamtąd jego kości, gdy Bóg ich wyprowadzi (Rdz 50:25).

TWOJA DECYZJA
Księga Rodzaju kończy się wstrząsającym obrazem trumny w obcej ziemi, lecz nie jest to finał rozpaczy. Dla braci Józefa był to dzień wyzwolenia z wieloletniego lęku przed odwetem, a dla Józefa — dzień triumfu wiary, która widzi Bożą rękę ponad ludzkimi błędami i krzywdami. Józef nie stał się zgorzkniałym mścicielem, ponieważ zaufał suwerenności Boga, który ze zdrady potrafił wyprowadzić ratunek dla tysięcy istnień.
Dziś stoisz przed wyborem: czy pozwolisz, by doznane krzywdy zatruły Twoje serce pragnieniem zemsty i rozpamiętywaniem przeszłości, czy też oddasz sąd Bogu i przyjmiesz Jego Opatrzność? W Jezusie Chrystusie Bóg zamienił największą zbrodnię ludzkości — ukrzyżowanie Syna Bożego — w źródło wiecznego odkupienia dla każdego, kto wierzy. Możesz dziś przebaczyć, zdjąć ciężar z winnych i stać się narzędziem Bożej łaski.
MOJA DECYZJA: Panie Jezu, wyznaję, że Ty jesteś suwerennym Panem mojego życia. Odrzucam wszelką gorycz, chęć zemsty i urazę. Wierzę, że Ty potrafisz obrócić w dobro każdą dolinę mojego życia. Wybieram przebaczenie, zaufanie Twojej Opatrzności i wierność Twojemu Królestwu aż do końca.

MODLITWA NA 31 PAŹDZIERNIKA
Wszechmogący Boże, Stwórco nieba i ziemi, dziękuję Ci za ten niezwykły miesiąc wędrówki przez Księgę Rodzaju. Dziękuję Ci, że jesteś Bogiem, który z nicości powołuje światłość, zawiera wieczne przymierze z człowiekiem i pozostaje wierny, gdy my zawodzimy. Dziękuję Ci za świadectwo Józefa, który w obliczu zdrady potrafił dostrzec Twoją niewidzialną dłoń i przynieść przebaczenie swoim braciom.
Przebacz mi, Ojcze, każdą chwilę, gdy w obliczu cierpienia lub niesprawiedliwości ulegałem zgorzknieniu, wątpiłem w Twoją dobroć lub pragnąłem sam wymierzać sprawiedliwość. Oczyszczaj moje serce z mściwości i nieprzebaczenia. Daj mi pokorę, bym pamiętał, że nie jestem na Twoim miejscu i że to do Ciebie należy ostateczny sąd.
Dziękuję Ci za Pana Jezusa Chrystusa — prawdziwego Józefa, który przyszedł do swoich, a swoi Go nie przyjęli, lecz On przez swój krzyż obrócił ludzkie zło w wieczne zbawienie dla każdego z nas. Spraw, by nasza nadzieja, podobnie jak wiara Józefa, sięgała poza ten doczesny świat, ku wiecznemu zmartwychwstaniu i Twojej niebiańskiej ojczyźnie. Prowadź nas w kolejnym miesiącu studiowania Twojego Słowa. W imieniu Jezusa Chrystusa. Amen.

ZADANIE NA DZIŚ
☐ Przeczytaj uważnie Rdz 50:1–26, zwracając szczególną uwagę na wersety 19–21 i 24–25.
☐ Zapisz w notatniku jedną sytuację z przeszłości, w której Bóg w widoczny sposób wyprowadził duchowe dobro z trudnego doświadczenia.
☐ Podejmij świadomą decyzję o całkowitym odpuszczeniu żalu wobec osoby, która Cię skrzywdziła, i powierz sprawiedliwość Bogu.
☐ Przeczytaj modlitwę Jezusa z Łk 23:34 oraz słowa Piotra z Dz 2:22–24 i porównaj je z postawą Józefa z Rdz 50:20.
☐ Wyraź dziś wdzięczność Bogu za dar ukończenia pierwszej księgi Pisma Świętego — Księgi Rodzaju.
☐ Zachęć jedną bliską osobę lub członka rodziny do wspólnego rozpoczęcia od jutra Księgi Wyjścia w projekcie „Z Biblią za Pan Brat”.
☐ Złóż imienne świadectwo zaufania Bożej Opatrzności w rozmowie lub wiadomości do przyjaciela.
☐ PRZECZYTAŁEM     ☐ ZROZUMIAŁEM     ☐ ZASTOSUJĘ

JUTRO — 1 LISTOPADA 2026
MIESIĄC 2 • KSIĘGA WYJŚCIA • DZIEŃ 32 — „W NIESKRĘPOWANYM ROZROŚCIE: NOWY KRÓL, UCIEMIĘŻENIE I BOŻE OCALENIE”
Czytanie: Wj 1:1–22. Wkraczamy w drugą monumentalną księgę Biblii! Po śmierci Józefa w Egipcie powstaje nowy faraon, który nie znał Józefa. Zaczyna się czas ucisku i niewoli narodu wybranego, lecz Boża obietnica rozrasta się mimo ludzkich dekretów śmierci, otwierając drogę do narodzin wybawiciela.`;

// 1. Zapisujemy treść lekcji w scripts/content/kc-day31-lesson.txt
fs.writeFileSync(path.join(process.cwd(), 'scripts/content/kc-day31-lesson.txt'), lessonFullText, 'utf8');
console.log('✅ Zapisano scripts/content/kc-day31-lesson.txt');

// 2. Budujemy oficjalny plik Microsoft Word (.docx) wg wytycznych GPT
const doc = new Document({
  styles: {
    default: {
      document: {
        run: {
          font: 'Aptos',
          size: 22, // 11 pt
          color: '1A202C',
        },
      },
    },
  },
  sections: [{
    properties: {
      page: {
        margin: {
          top: 1276, // ~2.25 cm
          bottom: 1276,
          left: 1276,
          right: 1276,
        },
      },
    },
    headers: {
      default: new Header({
        children: [
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({ text: 'BIBLIJNA AKADEMIA | Z BIBLIĄ ZA PAN BRAT', size: 18, color: '718096', bold: true }),
            ],
          }),
        ],
      }),
    },
    footers: {
      default: new Footer({
        children: [
          new Paragraph({
            alignment: AlignmentType.SPACE_BETWEEN,
            children: [
              new TextRun({ text: `${BOOK} • DZIEŃ ${DAY_NUM} • ${DATE_STR}`, size: 18, color: '718096' }),
              new TextRun({ text: '   |   Strona ', size: 18, color: '718096' }),
              new TextRun({ children: [PageNumber.CURRENT], size: 18, color: '718096' }),
            ],
          }),
        ],
      }),
    },
    children: [
      // Metryka & Tytuł
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        children: [
          new TextRun({ text: '66 KSIĄG • 66 MIESIĘCY • CODZIENNA PODRÓŻ PRZEZ PISMO ŚWIĘTE', size: 20, color: 'C4A35A', bold: true }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        children: [
          new TextRun({ text: `${BOOK} • MIESIĄC 1 • DZIEŃ ${DAY_NUM}`, size: 22, color: '2B6CB0', bold: true }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [
          new TextRun({ text: TITLE, size: 36, bold: true, color: '0F2942' }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [
          new TextRun({ text: SUBTITLE, size: 24, italics: true, color: '4A5568' }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 },
        children: [
          new TextRun({ text: `${DATE_FORMATTED}   |   Czytanie: ${READING}`, size: 22, bold: true, color: '1A202C' }),
        ],
      }),

      // Ramka Tekst Pamięciowy
      new Paragraph({
        spacing: { before: 100, after: 100 },
        children: [
          new TextRun({ text: 'TEKST PAMIĘCIOWY: ', bold: true, color: 'C4A35A', size: 22 }),
          new TextRun({ text: MEMORY_VERSE, italics: true, bold: true, size: 22 }),
        ],
      }),
      new Paragraph({
        spacing: { after: 300 },
        children: [
          new TextRun({ text: 'MYŚL PRZEWODNIA: ', bold: true, color: '2B6CB0', size: 22 }),
          new TextRun({ text: THEME, size: 22 }),
        ],
      }),

      // Parsowanie akapitów i nagłówków z tekstu lekcji
      ...lessonFullText.split('\n\n').slice(2).map(block => {
        const trimmed = block.trim();
        if (!trimmed) return new Paragraph({});
        
        if (trimmed.startsWith('ZANIM OTWORZYSZ BIBLIĘ') ||
            trimmed.startsWith('CZĘŚĆ ') ||
            trimmed.startsWith('JEZUS W CENTRUM') ||
            trimmed.startsWith('SPRAWDŹ W BIBLII') ||
            trimmed.startsWith('PRAWDA NA DZIŚ') ||
            trimmed.startsWith('POMYŚL —') ||
            trimmed.startsWith('MAŁY QUIZ') ||
            trimmed.startsWith('TWOJA DECYZJA') ||
            trimmed.startsWith('MODLITWA NA') ||
            trimmed.startsWith('ZADANIE NA DZIŚ') ||
            trimmed.startsWith('JUTRO —')) {
          return new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 150 },
            children: [
              new TextRun({ text: trimmed, bold: true, size: 26, color: '0F2942' })
            ]
          });
        }
        
        // Numerowane podsekcje (np. "1. Tytuł (50:1)")
        if (/^\d+\.\s/.test(trimmed)) {
          const lines = trimmed.split('\n');
          return new Paragraph({
            spacing: { before: 140, after: 100 },
            children: [
              new TextRun({ text: lines[0], bold: true, size: 22, color: '2B6CB0' }),
              ...(lines[1] ? [new TextRun({ text: '\n' + lines.slice(1).join('\n'), size: 22 })] : [])
            ]
          });
        }

        return new Paragraph({
          spacing: { after: 140 },
          children: [
            new TextRun({ text: trimmed, size: 22 })
          ]
        });
      })
    ],
  }],
});

// Zapisujemy .docx na Pulpit
const docxPath = 'C:/Users/czark/Desktop/Z_Biblia_za_Pan_Brat_Dzien_31_2026-10-31.docx';
const buf = await Packer.toBuffer(doc);
fs.writeFileSync(docxPath, buf);
console.log(`✅ Utworzono plik DOCX na Pulpicie: ${docxPath} (${buf.length} bajtów)`);

// 3. Budujemy kompletny 5-wersyjny pakiet rozważań wg Standardu Antigravity
const pakiet5Wersji = `# Z BIBLIĄ ZA PAN BRAT — KOMPLET 5 WERSJI
## Dzień 31 (31 października 2026): Bóg obrócił to w dobro — Ewangelia Opatrzności (Rdz 50:1–26)

====================================================================
WERSJA 1: ROZWAŻANIE PORANNE (TTS / Aplikacja „Dobrze, że jesteś”)
====================================================================

☀️ Z Biblią za Pan Brat — Dzień Trzydziesty Pierwszy

Czy zdajesz sobie sprawę, że w rękach suwerennego Boga nawet najgorsze zło zaplanowane przez człowieka może zostać przekształcone w wieczne, ratujące życie dobro?

Zatrzymaj się na progu trzydziestego pierwszego dnia naszej wędrówki przez Słowo Boże i zbadaj z całą surowością swoje serce w ten sobotni poranek, trzydziestego pierwszego października. Wypowiedz przed Ojcem to bezkompromisowe pytanie: Tato, dlaczego w obliczu krzywd, odrzucenia i życiowych ran tak łatwo ulegam pragnieniu odwetu lub paraliżującemu lękowi, zamiast z pokorą wyznać, że to Ty jesteś jedynym, sprawiedliwym Sędzią, a w Twoich rękach każda ludzka zdrada może stać się narzędziem zbawienia? Wchodząc dzisiaj w pięćdziesiąty, finałowy rozdział Księgi Rodzaju, stajemy świadkami zamknięcia monumentalnej historii patriarchów. Po śmierci starego Jakuba bracia Józefa wpadają w panikę: sparaliżowani poczuciem dawnej winy boją się, że potężny namiestnik Egiptu odpłaci im bezwzględną zemstą. Przychodzą, padają na twarz i błagają o litość. Odpowiedź Józefa przechodzi do historii wiary jako jeden z najczystszych promieni Bożej łaski. Józef płacze z miłości i wypowiada słowa, które kruszą wszelką pychę: „Nie bójcie się. Czyż ja jestem na miejscu Boga? Wy wprawdzie myśleliście o złu przeciwko mnie, ale Bóg obrócił to w dobro, aby zachować przy życiu liczny lud”. Psychologia przebaczenia i traumy jednoznacznie potwierdza, że człowiek, który nie potrafi oddać sądu wyższej sprawiedliwości, sam staje się więźniem doznanej krzywdy, niszcząc swoje zdrowie i relacje. Prawda Królestwa uderza z wyzwalającą mocą: na krzyżu Golgoty szczyt ludzkiej nienawiści i zbrodni został przez Boga zamieniony w wieczne źródło przebaczenia, usprawiedliwienia i życia! Jezus Chrystus zmartwychwstał, pokonał śmierć i daje nam dziedzictwo, które nie przemija!

Jezus mówi dziś do Ciebie:
A wiemy, że Bóg współdziała we wszystkim ku dobremu z tymi, którzy Go miłują, to jest z tymi, którzy są powołani według Jego postanowienia. (List świętego Pawła do Rzymian, rozdział ósmy, werset dwudziesty ósmy, UBG)

Zadanie Taktyczne:
Zmiażdż dzisiaj wszelką chęć odwetu, rozpamiętywanie doznanych krzywd oraz paraliżujący lęk przed przeszłością na swoim sobotnim posterunku. Twoim dzisiejszym rozkazem jest całkowite zrzucenie ciężaru sędziowskiego: nie jesteś na miejscu Boga! Zakazuję Ci pielęgnowania goryczy i manipulowania winą innych ludzi. Zastąp to żywym wyznaniem wiary: „Panie Jezu, Ty jesteś moim Zbawicielem — oddaję Ci każdą ranę i wierzę, że Twoja mądrość obróci wszystko w dobro!”, czyniąc to z nienaganną, królewską klasą i całkowitym oddaniem dziecka Bożego.

W Christian Culture aplikacje i portale są dla Ciebie zawsze bezpłatne.

Modlitwa Bojowa:
„Ojcze w niebie, dziękuję Ci za ten sobotni poranek i za potęgę Twojej Opatrzności, która góruje nad ludzkim grzechem. Dziękuję Ci, że w Twoich rękach żadna krzywda nie ma ostatniego słowa. Wybacz mi każdą chwilę zgorzknienia i chęci wymierzania własnej sprawiedliwości. Panie Jezu, dziękuję Ci za Twój krzyż, na którym największe zło świata zamieniłeś w moje zbawienie. Daj mi serce Józefa — serce, które potrafi płakać z miłości, usuwać lęk braci i karmić potrzebujących. Tobie chwała na wieki.”

Rozkaz Dnia (Zadbaj o wzrost):
Nie idź w tę podróż sam. Wejdź do naszej bazy ludzi z pasją, zintegruj swoje siły z innymi i ruszaj ramię w ramię przez sześćdziesiąt sześć miesięcy formacji w unikalnym projekcie „Z Biblią za Pan Brat”.

Błogosławieństwo:
Niech Pan zastępów napełni Twoje serce pokojem Jego suwerennej łaski, uleczy każdą ranę przeszłości i prowadzi Cię w prawdzie przez cały dzisiejszy dzień.

Dobrego dnia! Podaj dalej.

====================================================================
WERSJA 2: ROZWAŻANIE NA CAŁY DZIEŃ (polskieradio.cc / cclite.pl)
====================================================================

☀️ Z Biblią za Pan Brat — Dzień 31: Bóg obrócił to w dobro — Ewangelia Opatrzności

Trzydziesty pierwszy dzień naszej 66-miesięcznej podróży przez Pismo Święte przynosi monumentalny finał Księgi Rodzaju (Rdz 50:1–26).

Po uroczystym pogrzebie Jakuba w jaskini Machpela w Kanaanie, bracia Józefa wpadają w panikę. Dręczeni nieczystym sumieniem, obawiają się krwawego odwetu i padają przed Józefem jako słudzy. Odpowiedź egipskiego namiestnika stanowi jeden z najwspanialszych szczytów biblijnej teologii łaski: „Nie bójcie się. Czyż ja jestem na miejscu Boga? Wy wprawdzie myśleliście o złu przeciwko mnie, ale Bóg obrócił to w dobro, aby zachować przy życiu liczny lud” (Rdz 50:19–20). Józef nie unieważnia winy braci, lecz powierza sąd Bogu, ucisza ich strach i obiecuje stałe zaopatrzenie dla nich i ich dzieci. Rozdział zamyka się śmiercią Józefa w wieku 110 lat i jego proroczym rozkazem dotyczącym wywiezienia jego kości do Ziemi Obiecanej (Rdz 50:24–25; por. Hbr 11:22). Historia ta znajduje swój ostateczny punkt kulminacyjny w krzyżu Jezusa Chrystusa, gdzie największa ludzka zbrodnia stała się narzędziem wiecznego zbawienia (Dz 2:23–24; Rz 8:28)! Wybieraj dzisiaj świadomie: odrzuć gorycz i odwet, zaufaj suwerennej Bożej Opatrzności i żyj nadzieją Królestwa!

Jezus mówi dziś do Ciebie:
„Wy wprawdzie myśleliście o złu przeciwko mnie, ale Bóg obrócił to w dobro.” (Rdz 50:20) oraz „A wiemy, że Bóg współdziała we wszystkim ku dobremu z tymi, którzy Go miłują.” (Rz 8:28)

Zadanie Taktyczne (Czytaj | Wierz | Działaj):
* CZYTAJ: Przeczytaj uważnie cały 50. rozdział Księgi Rodzaju oraz deklarację wiary z Hbr 11:22.
* WIERZ: Przyjmij prawdę, że żaden grzech ani ludzka zdrada nie są w stanie zniweczyć Bożego planu zbawienia w Twoim życiu.
* DZIAŁAJ: Zrezygnuj dziś z wypominania win komuś bliskiemu, przebacz w sercu doznaną krzywdę i skieruj słowa wsparcia do kogoś zalęknionego.

W Christian Culture aplikacje i portale są zawsze BEZPŁATNE.

Dołącz do bazy i całej społeczności formacyjnej: https://chat.whatsapp.com/DBTRDxQWamZDWaOkjupSt0 – Wejdź do zespołu ludzi z pasją!

PODAJ DALEJ 🔴 TRZYDZIESTY PIERWSZY DZIEŃ SERII!
www.polskieradio.cc | www.polskieradio.cc/lumina | www.cclite.pl
Wspomóż misję: patronite.pl/osobowoscplus

====================================================================
WERSJA 3: OFICJALNY KURS CODZIENNY (polskieradio.cc/akademia)
====================================================================

66 KSIĄG • 66 MIESIĘCY • CODZIENNA PODRÓŻ PRZEZ PISMO ŚWIĘTE
KSIĘGA RODZAJU • MIESIĄC 1 • DZIEŃ 31
BÓG OBRÓCIŁ TO W DOBRO — EWANGELIA OPATRZNOŚCI
Pochówek Jakuba, lęk braci przed zemstą i wiara Józefa sięgająca poza Egipt
Sobota, 31 października 2026 r.  |  Czytanie: Rdz 50:1–26

[Pełna treść kursowa wygenerowana wg wytycznych GPT znajduje się w pliku: Z_Biblia_za_Pan_Brat_Dzien_31_2026-10-31.docx oraz na platformie polskieradio.cc/akademia/kurscodzienny/dzien-31]

====================================================================
WERSJA 4: ROZWAŻANIE TELEWIZYJNE (Christian Culture TV — Noemi i Sara)
====================================================================

[OPRAWA GRAFICZNA & MUZYCZNA]
Eleganckie studio Christian Culture TV w głębokiej czerni i szlachetnym złocie. Ciepłe światło portretowe. Na ekranie głównym pojawia się panoramiczny obraz karawany żałobnej w Kanaanie oraz napis: DZIEŃ 31 — BÓG OBRÓCIŁ TO W DOBRO. W tle subtelny, majestatyczny motyw smyczkowy.

[INTRO: FINAŁ KSIĘGI RODZAJU I PRZEŁAMANIE LĘKU]
Noemi: Dzień dobry! Witamy państwa bardzo serdecznie w trzydziestym pierwszym dniu naszej wielkiej formacyjnej podróży „Z Biblią za Pan Brat” na antenie Christian Culture TV. Dzisiaj zamykamy pierwszą, fundamentalną księgę Pisma Świętego — pięćdziesiąty rozdział Księgi Rodzaju! Rozdział o łzach żałoby, ale przede wszystkim o triumfie przebaczenia i Bożej Opatrzności, która przewyższa ludzkie kalkulacje!
Sara: Dokładnie tak, Noemi! Po śmierci starego Jakuba bracia Józefa wpadają w paraliżujący strach. Boją się, że potężny władca Egiptu wreszcie wyciągnie miecz zemsty za to, co zrobili mu w młodości. Przychodzą, padają na twarz, a Józef... płacze! I wypowiada słowa, które każdy chrześcijanin powinien wyryć w swoim sercu: „Nie bójcie się. Czyż ja jestem na miejscu Boga? Wy wprawdzie myśleliście o złu przeciwko mnie, ale Bóg obrócił to w dobro!”.

[ANALIZA PROBLEMOWA: BOŻA OPATRZNOŚĆ A ZEMSTA]
Noemi: Spójrzmy na to z perspektywy naszego codziennego życia. Jak często nosimy w sobie truciznę zgorzknienia, czekając na dogodny moment, by komuś „odpłacić pięknym za nadobne”? Józef uczy nas czegoś rewolucyjnego: nie jesteś Bogiem, by wymierzać sąd! Prawdziwa siła polega na powierzeniu sprawiedliwości Najwyższemu i zamianie odwetu na aktywną pomoc!
Sara: I to prowadzi nas prosto na Golgotę! Na krzyżu zbiegły się najgorsze ludzkie intencje: zdrada, fałsz, pycha i okrucieństwo. A jednak Bóg obrócił krzyż w największe dobro w dziejach wszechświata — w nasze zbawienie! Jezus zmartwychwstał, a Józef kończy swoje życie, patrząc w przyszłość: nakazuje wywieźć swoje kości do Ziemi Obiecanej, bo wiedział, że Egipt nie jest jego domem!

[SŁOWO ROZKAZU: PERSPEKTYWA BIBLIJNA]
Noemi: Wyświetlamy kluczowe współrzędne na dzisiejszy dzień: „Wy wprawdzie myśleliście o złu przeciwko mnie, ale Bóg obrócił to w dobro” (Rdz 50:20) oraz „A wiemy, że Bóg współdziała we wszystkim ku dobremu z tymi, którzy Go miłują” (Rz 8:28).
Sara: Usłyszmy to jako ludzie Królestwa: Żadna krzywda ani zdrada nie zniweczy Bożego planu dla Twojego życia, jeśli Twoje serce spoczywa w Chrystusie!

[ZADANIE TAKTYCZNE: CZYTAJ, WIERZ, DZIAŁAJ]
Noemi: Nasze żelazne zasady: Czytaj, Wierz, Działaj!
Sara: Otwórzcie dziś pięćdziesiąty rozdział Księgi Rodzaju. Z wiarą oddajcie Bogu każdą ranę z przeszłości. A w działaniu — powiedzcie dziś komuś zalęknionemu słowa przebaczenia i zróbcie krok w stronę pojednania!

[MANIFEST: MODLITWA BOJOWA]
Sara: Powstańmy do wspólnej deklaracji wiary.
Noemi i Sara razem: „Wszechmogący Boże, dziękujemy Ci za Twoją świętą Opatrzność. Wyznajemy, że Ty panujesz nad historią i potrafisz z każdego zła wyprowadzić triumf dobra. Panie Jezu, oddajemy Ci nasze zranienia i wybieramy przebaczenie. Tobie chwała na wieki wieków. Amen.”

[OUTRO: BŁOGOSŁAWIEŃSTWO I WZROST]
Noemi: Dziękujemy za wspólny miesiąc z Księgą Rodzaju! Pamiętajcie, że wszystkie programy i aplikacje Christian Culture są dla państwa zawsze całkowicie bezpłatne (polskieradio.cc, cclite.pl, patronite.pl/osobowoscplus).
Sara: Niech Boża Opatrzność strzeże Waszych domów i napełnia Was pokojem!
Noemi: Do zobaczenia jutro w Księdze Wyjścia! Czytaj, wierz, działaj. Dla Jezusa!

====================================================================
WERSJA 5: PORTAL INFORMACYJNY (polskieradio.cc/news / @CCN)
====================================================================

🌐 CCN | WIADOMOŚCI Z KRAJU I ZE ŚWIATA / LEKSYKON BIBLIJNY
## @CCN: BOŻA OPATRZNOŚĆ W OBLICZU ZŁA — POCHÓWEK JAKUBA, ETYKA PRZEBACZENIA JÓZEFA I WIARA W ZMARTWYCHWSTANIE W RDZ 50
**Księga Rodzaju — Miesiąc 1 | Dzień 31 (31 października 2026 r.)**

W ramach ogólnopolskiego programu badań biblijnych „Z Biblią za Pan Brat”, redakcja leksykonu teologicznego portalu informacyjnego CCN publikuje analityczne podsumowanie pięćdziesiątego rozdziału Księgi Rodzaju. Stanowi on kanoniczne domknięcie pierwszej księgi Pentateuchu, integrując wątki żałoby dynastycznej patriarchów, mechanizmów psychologicznych poczucia winy oraz teologicznej doktryny Bożej Opatrzności (Gubernatio Dei) triumfującej nad ludzkim grzechem.

1. Ceremoniał żałobny i pogrzeb w Machpela (Rdz 50:1–14)
Pierwsza część rozdziału dokumentuje proces balsamowania ciała Jakuba (40 dni) oraz siedemdziesięciodniową żałobę państwową w Egipcie (Rdz 50:2–3). Następnie narrator opisuje monumentalny konwój żałobny z udziałem elity dworskiej i wojskowej imperium (rydwany i jeźdźcy), który udaje się do Kanaanu. Siedmiodniowa żałoba na klepisku Atad (Abel-Micraim) oraz złożenie ciała patriarchy w grocie Machpela obok Abrahama i Izaaka (Rdz 50:13) potwierdzają nienaruszalność więzi z Ziemią Obiecaną mimo osiedlenia w Egipcie.

2. Syndrom winy i teologia przebaczenia (Rdz 50:15–21)
Po śmierci ojca bracia Józefa ujawniają głęboki lęk przed odwetem, stosując projekcję własnej bezwzględności na postać namiestnika. Józef odpowiada płaczem i formułuje fundamentalną zasadę biblijnej teologii: „Czyż ja jestem na miejscu Boga?” (Rdz 50:19). Odrzucając uzurpację prawa do zemsty (por. Pwt 32:35; Rz 12:19), Józef wypowiada klasyczną formułę Opatrzności:
> „Wy wprawdzie myśleliście o złu przeciwko mnie, ale Bóg obrócił to w dobro, aby uczynić to, co dziś widzimy, by zachować przy życiu liczny lud.” (Rdz 50:20)
Prawdziwe przebaczenie łączy się z konkretnym działaniem: obietnicą zaopatrzenia i ochrony braci oraz ich potomstwa (Rdz 50:21).

3. Testament Józefa i eschatologiczna nadzieja wyjścia (Rdz 50:22–26)
Końcowa perykopa ukazuje Józefa dożywającego 110 lat i oglądającego prawnuki z linii Efraima i Manassesa. Przed śmiercią Józef składa uroczyste proroctwo: „Bóg z pewnością nawiedzi was i wyprowadzi z tej ziemi” (Rdz 50:24) oraz zobowiązuje synów Izraela przysięgą do wywiezienia jego kości do Kanaanu (Rdz 50:25). Przysięga ta, zrealizowana przez Mojżesza (Wj 13:19) i Jozuego (Joz 24:32), zostaje w Nowym Testamencie uznana za szczytowy dowód jego wiary w Boże obietnice (Hbr 11:22).

4. Chrystus w Centrum: Zwycięstwo krzyża nad złem
Wydarzenia z Rdz 50 znajdują pełną realizację w dziele odkupienia Jezusa Chrystusa. Krzyż Golgoty stanowi najdoskonalszą egzemplifikację zasady z Rdz 50:20: ludzki grzech i zdrada zostały przez Boga przekształcone w zbawienie świata (Dz 2:23; 4:27–28; Rz 8:28). Podobnie jak Józef, zmartwychwstały Chrystus usuwa lęk grzeszników, ogłasza pokój i karmi swój lud Chlebem Żywota.

📌 PODSUMOWANIE REDAKCYJNE CCN
Księga Rodzaju zamyka się trumną w Egipcie, lecz jest to zawieszenie pełne nadziei. Śmierć patriarchów nie przerywa biegu historii zbawienia; Bóg przymierza czuwa nad swoim ludem, prowadząc go ku obietnicy, która w pełni objawia się w Jezusie Chrystusie.

*Wszystkie materiały formacyjne i publicystyczne w ekosystemie Christian Culture są całkowicie bezpłatne. Dołącz do naszej bazy subskrybentów i śledź codzienne analizy w ramach projektu „Z Biblią za Pan Brat”.*

🌐 **Źródła i powiązane serwisy:** [polskieradio.cc](https://www.polskieradio.cc) | [polskieradio.cc/lumina](https://www.polskieradio.cc/lumina) | [cclite.pl](https://www.cclite.pl)  
💬 *Dołącz do społeczności:* [Grupa WhatsApp CCN / CC](https://chat.whatsapp.com/DBTRDxQWamZDWaOkjupSt0)
`;

fs.writeFileSync(path.join(process.cwd(), 'scripts/content/pakiet-day31-5wersji.md'), pakiet5Wersji, 'utf8');
console.log('✅ Zapisano scripts/content/pakiet-day31-5wersji.md');
console.log('🎉 KOMPLETNA LEKCJA I PAKIET DNIA 31 WYGENEROWANE Z SUKCESEM!');
