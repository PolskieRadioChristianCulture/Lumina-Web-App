#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

// Pełna baza 19 świadectw z książki Cezarego Rogowskiego „Pokonać Goliata” (wyd. 2026)
export const TESTIMONIES = [
  {
    id: "S01",
    slug: "s01-od-uzaleznienia-do-wolnosci",
    title: "Od uzależnienia do wolności — osobiste świadectwo autora",
    author: "Cezary Rogowski",
    authorTitle: "Założyciel Christian Culture & Redaktor Naczelny CCN News",
    authorAvatar: "/avatar_cezary_official.jpg",
    authorUrl: "https://polskieradio.cc/lumina.cezaryrgowski.html",
    type: "autorskie",
    pages: "9–10",
    category: "Uwolnienie z nałogów & Przemiana życia",
    tags: ["uzależnienia", "narkomania", "wolność w chrystusie", "świadectwo", "nawrócenie", "pokonać goliata", "cezary rogowski"],
    lead: "Byłem uzależniony tak bardzo, że już jedną nogą byłem w grobie. Byłem wrakiem człowieka, który prosił Boga o śmierć. Na szczęście Bóg miał nieco inne plany.",
    safetyNote: "Świadectwo dotyczy wyjścia z uzależnienia. Pismo Święte ukazuje moc Bożej łaski w Chrystusie. W sytuacjach kryzysu uzależnień zachęcamy również do kontaktu z profesjonalnymi ośrodkami leczenia uzależnień i specjalistami.",
    text: `Ja osobiście byłem bardzo wielkim grzesznikiem, grzech swego czasu był we mnie na każdej płaszczyźnie mojego życia. Kiedyś byłem niewolnikiem wielu grzechów. Grzech rodzi grzech. Po kilku dziedzicznych stałem się niewolnikiem wielkiego, trzymającego mnie w swych kajdanach grzechu narkomanii. Byłem uzależniony tak bardzo, że już jedną nogą byłem w grobie. Byłem wrakiem człowieka, który prosił Boga o śmierć. Na szczęście Bóg miał nieco inne plany. Zostałem uwolniony! Nadszedł w moim życiu czas, by powiedzieć grzechowi „nie”. Nie myśl, że już nie jestem grzesznikiem. Jestem nim. Ale w Chrystusie już jestem uwolniony od grzeszenia i nie muszę dalej grzeszyć, choć z przykrością muszę stwierdzić, że czasem mi się to zdarza.`
  },
  {
    id: "S02",
    slug: "s02-moja-modlitwa-pojednania-z-bogiem",
    title: "Moja modlitwa pojednania z Bogiem",
    author: "Cezary Rogowski",
    authorTitle: "Założyciel Christian Culture & Redaktor Naczelny CCN News",
    authorAvatar: "/avatar_cezary_official.jpg",
    authorUrl: "https://polskieradio.cc/lumina.cezaryrgowski.html",
    type: "autorskie",
    pages: "11–12",
    category: "Nawrócenie & Pojednanie",
    tags: ["modlitwa pojednania", "nawrócenie", "nowe narodzenie", "zbawienie z łaski", "pokonać goliata", "świadectwo wiary"],
    lead: "Wieczorem, kiedy byłem sam w swoim pokoju, a wokół mnie było ciemno, ukląkłem i cichutko zacząłem swoją rozmowę z Bogiem. Jeśli szczerze pomodlisz się modlitwą wiary, wykonasz najważniejszy krok na drodze nowego życia!",
    safetyNote: "Modlitwa pojednania jest osobistym krokiem wiary i decyzją serca. Prezentowana relacja opisuje duchowe narodziny i doświadczenie nawrócenia autora.",
    text: `Zacznijmy od tego, że koniecznie musisz pojednać się z Bogiem. Podpowiem ci, jak ja zrobiłem to blisko dziesięć lat temu. Wieczorem, kiedy byłem sam w swoim pokoju, a wokół mnie było ciemno, ukląkłem i cichutko zacząłem swoją rozmowę z Bogiem mniej więcej tak:

Panie Jezu, przepraszam Cię za to, że jestem grzesznikiem, wybacz mi, że przez tyle lat żyłem w rebelii przeciwko Tobie. Proszę Cię, przebacz mi wszystkie moje grzechy. Żałuję, że je popełniłem. Proszę, wejdź w moje życie i zmień je od wewnątrz na zewnątrz. Zapraszam Cię do mojego serca jako mojego osobistego Pana i Zbawiciela. Pozwól mi żyć nowym życiem. Uwolnij mnie od grzechu i grzeszenia. Proszę Cię, Boże Ojcze, o dokonanie we mnie cudu nawrócenia. W imieniu Jezusa Chrystusa o to proszę i dziękuję. Amen (Rz 10,9–10).

Takie było moje osobiste pojednanie. Jeśli szczerze pomodlisz się modlitwą wiary, to: gratuluję! Dziś stałeś się prawdziwym, wolnym, świadomie wierzącym chrześcijaninem:
1. Poprzez tę modlitwę wiary pojednałeś się z Bogiem (J 6,35).
2. On przyjął cię jako swoje dziecko (J 1,12).
3. Stałeś się chrześcijaninem, dzieckiem Bożym.
4. Twoje grzechy zostały ci przebaczone (1 J 1,9).
5. Jesteś wolnym człowiekiem, zostałeś uwolniony od swojej starej, grzesznej natury (2 Kor 5,17).
6. Otrzymałeś w darze nowe życie, to jest życie wieczne! (J 10,28).
7. Nie musisz już grzeszyć (Ef 4,28).
8. Jezus Chrystus wszedł w twoje życie w osobie Ducha Świętego.
9. Narodziłeś się z Ducha, dostąpiłeś nowonarodzenia (J 3,1–17).

Im bardziej zaufasz Jezusowi, im bardziej otworzysz swoje serce na działanie Ducha Świętego, tym więcej dobrodziejstw otrzymasz. Ja osobiście zostałem w wyniku nawrócenia uwolniony od palenia papierosów, ot tak, z dnia na dzień, po ośmiu latach palenia. Zostałem uwolniony od picia alkoholu i od ćpania. Ale były też problemy, których nie oddałem Bogu od razu i z tymi ja, moi bracia chrześcijanie i Bóg walczyliśmy wiele lat. Dlatego bardzo ważne jest to, by wyznać szczerze Bogu wszystkie grzechy, by zadośćuczynić o ile jest to możliwe i porzucić wszelki grzech.`
  },
  {
    id: "S03",
    slug: "s03-uwolnienie-od-papierosow-alkoholu-i-narkotykow",
    title: "Uwolnienie od papierosów, alkoholu i narkotyków",
    author: "Cezary Rogowski",
    authorTitle: "Założyciel Christian Culture & Redaktor Naczelny CCN News",
    authorAvatar: "/avatar_cezary_official.jpg",
    authorUrl: "https://polskieradio.cc/lumina.cezaryrgowski.html",
    type: "autorskie",
    pages: "12",
    category: "Uwolnienie z nałogów & Przemiana życia",
    tags: ["rzucenie palenia", "alkoholizm", "narkotyki", "uwolnienie", "pokonać goliata", "cezary rogowski"],
    lead: "Zostałem w wyniku nawrócenia uwolniony od palenia papierosów, ot tak, z dnia na dzień, po ośmiu latach palenia. Zostałem uwolniony od picia alkoholu i od ćpania.",
    safetyNote: "Świadectwo opisuje duchowe doświadczenie uwolnienia z nałogu. Nie sugerujemy rezygnacji ze specjalistycznej terapii uzależnień w procesie wychodzenia z nałogów.",
    text: `Ja osobiście zostałem w wyniku nawrócenia uwolniony od palenia papierosów, ot tak, z dnia na dzień, po ośmiu latach palenia. Zostałem uwolniony od picia alkoholu i od ćpania. Ale były też problemy, których nie oddałem Bogu od razu i z tymi ja, moi bracia chrześcijanie i Bóg walczyliśmy wiele lat. Dlatego bardzo ważne jest to, by wyznać szczerze Bogu wszystkie grzechy, by zadośćuczynić o ile jest to możliwe i porzucić wszelki grzech.`
  },
  {
    id: "S04",
    slug: "s04-bieganie-i-sila-do-praktykowania-wiary",
    title: "Bieganie i siła do praktykowania wiary",
    author: "Cezary Rogowski",
    authorTitle: "Założyciel Christian Culture & Redaktor Naczelny CCN News",
    authorAvatar: "/avatar_cezary_official.jpg",
    authorUrl: "https://polskieradio.cc/lumina.cezaryrgowski.html",
    type: "autorskie",
    pages: "20–21",
    category: "Praktykowanie Wiary & Siła",
    tags: ["bieganie", "siła fizyczna", "praktyka wiary", "pokonanie grzechu", "pokonać goliata"],
    lead: "Pewnego razu podczas modlitwy porannej prosiłem Pana o siły fizyczne podczas biegania. Tego poranka przebiegłem trzykrotnie dłuższy dystans niż poprzednio. Zrozumiałem, że wolność dla mnie jest tylko w Jezusie.",
    safetyNote: "Osobista refleksja i relacja autora o roli modlitwy w pokonywaniu słabości i praktykowaniu zdrowego stylu życia.",
    text: `DOŚWIADCZENIE PRAKTYKOWANIA WIARY. Pewnego razu podczas modlitwy porannej prosiłem Pana o siły fizyczne podczas biegania, a muszę przyznać, że bardzo mi ich brakowało, bo były to moje pierwsze próby regularnego uprawiania tego sportu. Tego poranka przebiegłem trzykrotnie dłuższy dystans niż poprzednio. Od tego czasu biegam na dłuższych odcinkach.

Zbyt banalne? Chodziłem już z Jezusem blisko dziesięć lat z grzechem, który był mi kulą u nogi. Czasem ciążył tak, że w ogóle nie mogłem iść, czasem jednak udawało mi się wziąć ją i oddać Jezusowi. I tak szliśmy: On i ja. Tyle że co jakiś czas odbierałem ją na nowo Jezusowi, a moja wędrówka za Nim stawała się długa i uciążliwa.

Nastał jednak ten upragniony czas, w którym zrozumiałem, że wolność dla mnie jest tylko w Jezusie. Oddałem Mu kulę i postanowiłem, że nie sięgnę już po nią nigdy więcej, a raczej uchwycę się mocno dłoni Jezusa, byśmy razem poszli dalszą drogą. I tak zostałem uwolniony z łaski na podstawie wiary. Celowo nie nazywam grzechu po imieniu, byś mógł, drogi czytelniku, wstawić sobie tu dowolny problem, z którym ty się borykasz, bo wierzę, że mój grzech był „goliatem” nie do pokonania dla mnie.`
  },
  {
    id: "S05",
    slug: "s05-upadek-nalogi-i-ratunek",
    title: "Moja osobista droga: upadek, nałogi i ratunek",
    author: "Cezary Rogowski",
    authorTitle: "Założyciel Christian Culture & Redaktor Naczelny CCN News",
    authorAvatar: "/avatar_cezary_official.jpg",
    authorUrl: "https://polskieradio.cc/lumina.cezaryrgowski.html",
    type: "autorskie (w książce pod pseudonimem „Adam”)",
    pages: "27–29",
    category: "Uwolnienie z nałogów & Przemiana życia",
    tags: ["świadectwo nawrócenia", "narkomania", "kryzys", "ocalenie", "pokonać goliata", "cezary rogowski"],
    lead: "Końcowa faza tej „przygody” była bardzo bolesna, upokarzająca i konsekwentnie prowadziła mnie do śmierci. Chciałem umrzeć. I ten „goliat” został pokonany! Bóg mnie ocalił!",
    safetyNote: "Świadectwo zawiera opis skrajnego kryzysu życiowego i uzależnienia. Jeśli przeżywasz myśli samobójcze lub kryzys psychiczny, natychmiast zadzwoń pod bezpłatny kryzysowy numer 116 123 lub 22 484 88 01. Bóg ma dla Ciebie ratunek, a specjaliści są gotowi Ci pomóc.",
    text: `Moja osobista droga jest bardzo bolesna, bo jestem człowiekiem o twardym karku i małej wiary. Nie umiem uczyć się na cudzych błędach. Nie lubię słuchać innych „nauczycieli” i często chodzę własnymi drogami. Jestem typem buntownika, czasem walczę z Bogiem i odchodzę jak obrażone dziecko, gniewam się na swego Ojca. Mój Bóg ma ze mną same problemy. Ale kocha mnie, a ja kocham Jego. Jesteśmy jak młode małżeństwo z tą tylko różnicą, że to ja zawsze nie mam racji i tylko ja popełniam błędy.

Poznawałem Boga, jak to w życiu bywa, poprzez innych ludzi. Mówiono mi, że On jest w swoim kościele. Że jest obecny na mszy. Lubiłem czasem pójść do kościoła i doświadczyć tej tajemniczości, poczuć ten klimat, chłód, przyciemniony nastrój, zapach kadzideł i świec. Tajemniczy Bóg, do którego się modlono, śpiewano pieśni i składano ofiary. Chciałem Go osobiście poznać. Ale Boga nie było. Nie odpowiadał na moje pytania. Nie dawał się poznać w sposób, w jaki oczekiwałem. Nie zmieniał mojego grzesznego stylu życia. Nie pokonywał też moich „goliatów”. Nauczyłem się żyć życiem egoistycznym, w którym dominowało zaspokajanie pożądliwości.

W naszym katolickim domu mama starała się być dla nas jak najlepsza, kochała nas najbardziej, jak tylko się da. Broniła nas własnym ciałem przed wszelkimi zagrożeniami. Chroniła nas od wszelkiego zła. Szatan nie próżnował jednak i wychowywał nas tak, jak chciał. Ja zacząłem pić alkohol i palić papierosy, a młodszy brat poszedł do poprawczaka. W moim życiu pojawiły się różne problemy, w szkole i w domu. Sam nie wiem, jak i dlaczego, odreagowałem, uciekając się do różnych diabelskich dewiacji, tak poniżających godność ludzką, że aż wstyd mi i nie godzi się tego opisywać. Rozwiązłość seksualna, narkotyki i jakieś niewytłumaczalnie niskie poczucie własnej wartości popchnęły mnie do skrajnych praktyk z dziedziny filozofii i magii. Byłem człowiekiem bardzo zdemonizowanym.

Szukałem ratunku u Boga. Bóg pozwolił się odnaleźć. Pamiętam kilka takich momentów w życiu, w których niepewnie, ale ze szczerym pragnieniem w sercu, stawiałem pierwsze kroki do Boga. Zapraszałem Go do swego serca jako mojego osobistego Pana i Zbawiciela. W różny sposób wyznawałem Mu swoje grzechy, a On działał i działał w moim życiu. Mijały lata, a On działał i działa po dziś dzień. Ja wierzę i doświadczam tego, że Bóg uwalnia mnie od moich „goliatów”.

Pierwszym „goliatem”, którego pamiętam, był nałóg palenia papierosów, który mnie zabijał. Paliłem już osiem lat. Jak wierzę, Bóg zabrał mi ten nałóg z dnia na dzień. Jestem od dziesięciu lat wolnym człowiekiem i wierzę, że już tak pozostanie. Bogu niech będzie za to chwała.

Był taki moment w moim życiu, że w obliczu śmierci (byłem mocno uzależniony od środków chemicznych) Bóg uwolnił mnie od ćpania. Zaczęło się bardzo niewinnie, ot tak, dla zabawy. Kolega powiedział: „Chodź, pokiramy sobie budeks, będzie niezły odlot”. Poszedłem, zakirałem i tak ćpałem z przerwami blisko cztery lata. Końcowa faza tej „przygody” była bardzo bolesna, upokarzająca i konsekwentnie prowadziła mnie do śmierci. Ćpałem po lasach, po polach, czy wewnątrz kanałów przeciwdeszczowych latem i zimą, cały rok na okrągło. Często w deszczu i śniegu. Tracąc przytomność i kontrolę nad czynnościami fizjologicznymi, tam gdzie upadłem, tam leżałem. Czasem budziłem się i nie umiałem znaleźć drogi do domu. Nawiedzały mnie w wizjach narkotycznych demony i, jak wierzę, zabijały mnie dzień po dniu. Wyłudzałem pieniądze i ćpałem i ćpałem. Chodziłem śmierdzący, brudny i głodny. Wrak człowieka. Bez wstydu, godności i wiary w to, że coś może się zmienić. Chciałem umrzeć.

I ten „goliat” został pokonany! Siedząc w piwnicy, do której schodziłem co piętnaście minut, by się odurzyć, pewnego razu miałem dwie butelki półlitrowe rozpuszczalnika „Nitro”. Modliłem się ze łzami w oczach o śmierć lub wybawienie. Bóg mnie ocalił! Jemu niech będzie za to chwała. Tak więc pierwszym krokiem w praktykowaniu wiary jest przyjście do Jezusa z odrobiną nadziei, czasem wbrew nadziei. Wiesz – gdyby Jezus zawodził, już od 10 lat bym nie żył.`
  },
  {
    id: "S06",
    slug: "s06-podroz-do-andrychowa-i-rozmowa-z-ojcem-rafala",
    title: "Podróż do Andrychowa i rozmowa z ojcem Rafała",
    author: "Cezary Rogowski",
    authorTitle: "Założyciel Christian Culture & Redaktor Naczelny CCN News",
    authorAvatar: "/avatar_cezary_official.jpg",
    authorUrl: "https://polskieradio.cc/lumina.cezaryrgowski.html",
    type: "autorskie",
    pages: "29–30",
    category: "Ewangelizacja & Nawrócenie",
    tags: ["ewangelizacja", "andrychów", "dobra nowina", "modlitwa", "pokonać goliata", "narodziny z ducha"],
    lead: "Rozmawialiśmy o Bożych sprawach. Mówiłem o zbawieniu z łaski przez wiarę, o przebaczeniu w Chrystusie i darze życia wiecznego. Pamiętam radość w jego oczach po słowie amen.",
    safetyNote: "Relacja z misyjnej podróży i dzielenia się Ewangelią. Imiona osób trzecich przytoczone zgodnie z wydaniem książkowym.",
    text: `Właśnie rozpoczynał się szabat, a było to w piątek wieczorem. Rafał opowiadał mi o swoim ojcu. Doszliśmy do wniosku, że warto by było przekazać mu Ewangelię o zbawieniu z łaski przez wiarę w Jezusie Chrystusie. Była gdzieś godzina 21, gdy pomyślałem, że można pojechać do niego jeszcze dziś. Do najbliższego miasta mieliśmy około piętnastu kilometrów drogi, a zważywszy na to, że mieszkaliśmy na wsi, gdzie nie było o tak późnej porze żadnego połączenia autobusem, konieczne wydawało nam się przebycie tej drogi pieszo.

Pomyślałem – a szybko odezwało się moje „ego” – „za daleko”. Zaraz potem przypomniałem sobie, że mój Pan, gdy było trzeba, nie wahał się ani chwili, by tylko dla jednej poganki, Syrofenicjanki, przejść aż 70 km. I nie miała ta odległość dla Niego większego znaczenia. Dla mnie te 15 km nie powinno więc mieć żadnego znaczenia. Bez zbędnego myślenia podjąłem dobrą decyzję – mogę iść. Pan jednak w swej łaskawości sprawił, że mieliśmy transport i nie musieliśmy iść.

Tak więc już za kilka godzin byliśmy na dworcu PKP w Nowym Sączu w drodze do Krakowa. 160 km do Krakowa i już o godz. 5.18 byliśmy na miejscu. Jeszcze tylko 50 km do Wadowic i stamtąd do celu, czyli do Andrychowa samochodem. Około godz. 8.00 byliśmy na miejscu. Po wspólnym śniadaniu tata Rafała zapytał: „Co chcecie tu robić?”. Zaprosiliśmy go więc na wspólne nabożeństwo do miejscowego zboru. Po nabożeństwie z inicjatywy gospodarza udaliśmy się do pobliskiego parku, gdzie było piękne jezioro. Pływały łabędzie, a my siedząc na ławce, rozmawialiśmy o Bożych sprawach. Czułem, że jest to dobry czas i właściwa pora, bo po to tu przyjechałem, by przekazać Dobrą Nowinę panu Henrykowi.

Mówiłem więc o zbawieniu z łaski przez wiarę, o przebaczeniu w Chrystusie i darze życia wiecznego. Zapytałem: „Czy zechciałby pan, gdyby Jezus dziś przyszedł, spotkać się z Nim osobiście i spędzić z Nim wieczność?”. Odpowiedział: „Tak”. Zaprosiłem go więc do wspólnej modlitwy. Pochyliliśmy głowy, modląc się wspólnie do Jezusa, aby przyjął tatę Rafała jako swoje dziecko i obdarzył go swym dziedzictwem. Pamiętam radość w jego oczach, gdy po wypowiedzeniu słowa „amen” popatrzyliśmy na siebie. Gratulując mu wspaniałego wyboru i najwspanialszej chwili w życiu (duchowych narodzin), uścisnąłem jego rękę, a Rafał objął ramionami swego ojca. A wszystko to miało miejsce 7 lipca 2007 r.`
  },
  {
    id: "S07",
    slug: "s07-konradek-wspomnienia-romy",
    title: "Konradek — fragment pamiętnika „Wspomnienia Romy”",
    author: "Roma",
    authorTitle: "Autorka pamiętnika „Wspomnienia Romy”, cytowana w książce Cezarego Rogowskiego",
    authorAvatar: "/ccn-logo-square.png",
    authorUrl: "https://polskieradio.cc/swiadectwa",
    type: "cudze / wspomnienia",
    pages: "23–25",
    category: "Cuda & Boży Ratunek",
    tags: ["tonięcie", "uratowanie dziecka", "modlitwa o cud", "psalm 30", "wspomnienia romy", "pokonać goliata"],
    lead: "Był to ewidentny cud, bo lekarze powiedzieli, że nawet jeśli przeżyje, to i tak będzie kaleką, bo zbyt długo nie oddychał. Bóg uczynił cud na oczach prawie całego zboru, byśmy jeszcze bardziej Mu zaufali.",
    safetyNote: "Świadectwo jest autentyczną relacją wiary i modlitwy w obliczu wypadku podtopienia. Relacje o cudownym ocaleniu nie zastępują zasad bezpieczeństwa nad wodą ani profesjonalnych procedur resuscytacji krążeniowo-oddechowej (RKO).",
    text: `„Konradek” (fragment pamiętnika pt. „Wspomnienia Romy”).

„W mojej Biblii obok Psalmu 30 widnieje napis granatowym długopisem: »14 VII 2001 Konradek«, a na marginesie napisałam: »Zmartwychwstanie«. Był ciepły lipcowy dzień. Byłam sama z dziećmi, bo mój mąż pracował w tym czasie za granicą. Byłam bardzo zadowolona, bo Marek M., szwagier mojej synowej, zainteresował się Ewangelią i po raz pierwszy miał przyjechać do zboru. Pojechaliśmy naszą starą Zastawką do zboru. Było bardzo przyjemnie, a także i Marek był bardzo zadowolony. Obiecał zabrać wraz ze swoimi dziećmi moją Dorotkę na basen, ale źle się poczuł i musiał odwołać swoją obietnicę. Zrobiło mi się przykro, że dzieci nie pojadą, i zaproponowałam, że ja zabiorę swoje i jego dzieci nad zalew Nowiny. Tak też się stało. Pojechało razem z nami jeszcze wiele osób ze zboru w Sandomierzu, a także cała grupa ze Stalowej Woli. Dużo rozmawialiśmy o Bogu, a dzieci bawiły się w wodzie. Było z nimi w wodzie kilku braci.

Nagle poczułam dziwny niepokój i razem z Ewą poszłam do wody i zobaczyłam, jak Konradek i Dawid podskakują w wodzie. Moją Dorotkę w tym czasie Marek B. uczył pływać, a obok niego był Wiesiu. Daniel z Renatką pływali przy drugim brzegu. Stałam w wodzie po kolana i rozmawiałam z Ewą. Nagle spostrzegłam, jak Marek zostawia Dorotkę, bierze na ręce Konradka i biegnie w naszym kierunku. Położył go na brzegu i rozpoczął masaż serca. Natychmiast dobiegł lekarz, który, jak się okazało, miał rozłożony koc obok. Przybiegł z innym lekarzem i natychmiast podjął akcję ratowniczą. Zadzwonił również na pogotowie. To było straszne. Byłam przerażona i nic innego nie miałam w myślach jak tylko: »Boże, ratuj!«. Za mną stało wielu braci i sióstr. A ja wciąż modliłam się: »Boże, ratuj!«.

Popatrzyłam na Marka, był bardzo zmęczony, a w jego oczach zobaczyłam rezygnację. Wtedy już byłam pewna, że Konradek nie żyje i że już nie ma dla niego ratunku. Byłam zszokowana! Nagle przypomniałam sobie, jak Pan Bóg wskrzesił Renatkę, i usłyszałam cichy głos: »Uklęknij i proś Boga o wskrzeszenie«. Myśli tłukły mi się w głowie: a jak się ośmieszę, a jeżeli Bóg go nie wskrzesi?! itp. Jednak z drugiej strony byłam pewna, że Bóg może mnie wysłuchać. Wokół nas stały setki osób i opór diabelski był straszny. To były sekundy, ale wszystko wydawało się wiecznością. Nagle uklękłam i na głos powiedziałam: »Boże, Ty możesz go wskrzesić, proszę, zrób to«.

I stało się… Konradek zaczął wymiotować. Odwracali go na bok i znowu sztuczne oddychanie i masaż serca na zmianę. Byłam już pewna, że będzie żył i od razu dziękowałam Bogu za cud. Gdy przyjechała karetka, lekarz Łopatka powiedział, że to dziecko nie żyło i że to jest ewidentny cud. Konradek, gdy go zabierali, bardzo krzyczał i rzucał się, ale był nadal nieprzytomny. Marek W. zawiózł mnie do szpitala, a tam spotkałam rodziców Konradka, których zawiadomił Daniel. Byłam przerażona, ale Marek powiedział, że gdy jechał do szpitala, był pewny, że szatan zaatakował jego dziecko, by odciągnąć ich od Boga, ale w drodze obiecał Panu Bogu, że cokolwiek się stanie, on pójdzie za Nim. Zuzia też przywitała mnie spokojnie, ale nie chciała rozmawiać i nie robiła mi wyrzutów. Było mi bardzo przykro, że nijak nie mogę im pomóc.

Modliliśmy się do późna w nocy, a następnego dnia spotkaliśmy się w Budowlance w Stalowej Woli i tam wszyscy zjednoczyliśmy się w modlitwie za Konradka. Co chwilę dostawaliśmy telefon od Marka, że jest coraz gorzej i żeby się cały czas modlić. W południe przyszedł ze szpitala Jasiu B. i powiedział, że Konradek usiadł na łóżku i poprosił o jedzenie. Był to ewidentny cud, bo lekarze powiedzieli, że nawet jeśli przeżyje, to i tak będzie kaleką, bo zbyt długo nie oddychał (ok. 30 minut), i z pewnością ma uszkodzone serce i wątrobę i może nie chodzić, a nawet nie mówić. Chwała Bogu, że nic takiego się nie stało, a w następny piątek wyszedł ze szpitala zupełnie zdrowy.

W sabat, 21 VII 2001 r., w zborze w Sandomierzu czytał Psalm 30, a mało kto powstrzymał się od łez. Bóg uczynił cud na oczach prawie całego zboru, byśmy jeszcze bardziej Mu zaufali. Boże, dziękuję Ci za Twoje dowody wielkiej miłości do nas!”.`
  },
  {
    id: "S08",
    slug: "s08-modlitwa-przy-chorym-jozefie",
    title: "Modlitwa przy chorym Józefie i odpowiedź przez śpiew dzieci",
    author: "Cezary Rogowski",
    authorTitle: "Założyciel Christian Culture & Redaktor Naczelny CCN News",
    authorAvatar: "/avatar_cezary_official.jpg",
    authorUrl: "https://polskieradio.cc/lumina.cezaryrgowski.html",
    type: "autorskie",
    pages: "34–35",
    category: "Modlitwa & Posługa",
    tags: ["hospicjum", "modlitwa nad chorym", "namaszczenie olejem", "nie lękaj się", "pokonać goliata"],
    lead: "23 lipca 2006 roku doświadczyłem po raz kolejny mocy Bożej. Modląc się nad umierającym, namaściłem go olejem w imieniu Pańskim. Bóg odpowiedział mi słowami piosenki śpiewanej przez dzieci na podwórku: NIE LĘKAJ SIĘ.",
    safetyNote: "Osobista relacja z posługi modlitewnej w hospicjum. Świadectwo ukazuje troskę o zbawienie człowieka i Bożą odpowiedź pocieszenia w modlitwie.",
    text: `23 lipca 2006 roku doświadczyłem po raz kolejny mocy Bożej. Zostałem posłany do śmiertelnie chorego człowieka. Zanim wyszedłem z domu, modliłem się do Boga o prowadzenie i odpowiednie postępowanie w chwili tak szczególnej. Po czym udałem się do pobliskiego hospicjum. Modląc się nad umierającym, namaściłem go olejem w imieniu Pańskim. Prosiłem, by pan Józef pojednał się z Bogiem. Gestem głowy potwierdził, że pragnie pojednania. Po modlitwie opuściłem go.

Przeżyłem coś tak poruszającego po raz pierwszy w życiu, nie miałem doświadczenia w takich sytuacjach, trudno o praktykę w podobnych przypadkach i nie życzyłbym ani sobie, ani nikomu, by nabywał takiej praktyki. Po powrocie do domu w modlitwie przedstawiłem Bogu swoje obawy i trwogę. Nie miałem pewności, czy postąpiłem dokładnie tak, jak życzyłby sobie tego Bóg. Byłem poruszony tym przykrym doświadczeniem, a troska o zbawienie tego człowieka była dla mnie szczególna. Przecież chodziło tu o jego „być czy nie być” na wieczność.

Usiadłem zamyślony i pogrążony w modlitwie na ławce przed blokiem. Pytałem Boga, czy wszystko było właściwe. Gdzieś jakby zza mgły, w głębokiej oddali, dobijał się do moich uszu szum. Dźwięk melodii. Coraz bliżej moich uszu, coraz wyraźniej zacząłem dostrzegać słowa piosenki. Dzieci kilka metrów przede mną, bawiąc się na huśtawce, śpiewały: „NIE LĘKAJ SIĘ, NIE LĘKAJ SIĘ”. Gdy zrozumiałem, co Bóg odpowiada mi ustami tych dzieci, one zamilkły, a ja uspokoiłem się, ufny w przekonaniu, że zbawienie stało się udziałem umierającego człowieka. Bóg jest zainteresowany dialogiem z każdym, kto się do Niego zwraca w modlitwie.`
  },
  {
    id: "S09",
    slug: "s09-dar-bozy-historia-renatki-po-wypadku",
    title: "Dar Boży — historia Renatki po wypadku",
    author: "Roma",
    authorTitle: "Autorka pamiętnika „Wspomnienia Romy”, cytowana w książce Cezarego Rogowskiego",
    authorAvatar: "/ccn-logo-square.png",
    authorUrl: "https://polskieradio.cc/swiadectwa",
    type: "cudze / wspomnienia",
    pages: "35–37",
    category: "Cuda & Boży Ratunek",
    tags: ["wypadek samochodowy", "uratowanie córki", "cud w szpitalu", "modlitwa matki", "wspomnienia romy", "pokonać goliata"],
    lead: "Gdy przyjechała pomoc, lekarz stwierdził stan krytyczny. Gdy dotarliśmy do szpitala, lekarz zawołał nas i powiedział, że mamy niesamowite szczęście, bo on pracując 23 lata w pogotowiu, jeszcze nie spotkał się z takim cudem.",
    safetyNote: "Świadectwo jest wspomnieniem matki o wypadku drogowym córki i Bożej opiece. Relacja stanowi świadectwo wiary rodziców i nie stanowi opinii orzeczniczej w rozumieniu medycznym.",
    text: `„Dar Boży” (fragment pamiętnika pt. „Wspomnienia Romy”)

„Był lipiec 1992 roku. Razem z mężem i moimi dwiema córkami, Renatką i ośmiomiesięczną Dorotką, pojechaliśmy po towar pod Myślenice. Ponieważ nie mogliśmy znaleźć hurtowni, postanowiłam wysiąść z samochodu i w zajeździe poczekać na Zygmunta, aż załatwi swoje sprawy. Był duży upał i dzieci były zmęczone długą jazdą. Postanowiłam je w międzyczasie nakarmić i napoić. Gdy wysiadłam z samochodu, przeszłam z Dorotką na drugą stronę drogi, a Renia, która siedziała z przodu, męczyła się, by odpiąć pasy. W chwili, gdy w końcu odpięła pasy i wyszła z samochodu, spostrzegłam pędzący na nią samochód. Na naszych oczach wjechał w nasze dziecko. Widziałam, jak wyrzuciło ją na samochód. Potem przeleciała w powietrzu, uderzyła głową o asfalt i jeszcze z dwa metry jechała po poboczu drogi.

W moim umyśle kłębiły się straszne myśli, pragnęłam krzyczeć, lecz nie mogłam wydobyć z siebie żadnego dźwięku. Było to straszne uczucie. Pomimo wielkiej chęci pomocy, byłam świadoma, że nic nie mogę zrobić. Byliśmy pewni, że nie żyje. Wokoło nas momentalnie zebrało się mnóstwo ludzi. Wszyscy ludzie mówili to samo. Twierdzili, że nieboszczykowi zawsze spada but z nogi, a nasza córka go nie miała. Mimo że nie wierzyłam w zabobony, bardzo uchwyciłam się słów tych ludzi i zaczęłam szukać tego buta. Pomyślałam, że jeśli go znajdę, moja córka będzie żyła. Zysiu (mój mąż) sprawdził tętno, oddech, nie było jednak żadnych oznak życia. Ogarnęło nas niesamowite uczucie otępienia i spokoju, nie słyszeliśmy, co wokół nas się dzieje.

Zysiu klęczał koło Renatki, a ja z Dorotką odeszłam do samochodu i tam się modliłam, by Bóg pozwolił nam to jakoś przetrwać. Wtedy przypomniałam sobie zdarzenie sprzed trzech dni. Byliśmy całą rodziną nad zalewem Chechło. Po drugiej stronie zalewu młoda dziewczyna pływała na materacu. W pewnym momencie wpadła do wody i zaczęła tonąć. Jej wujek skoczył jej na pomoc. Mimo szybkiej reakcji ratowników utonęli oboje. To wydarzenie wywołało w nas refleksję. Zaczęliśmy się zastanawiać, jak my przeżylibyśmy podobną tragedię. Zrozumiałam, że Bóg chciał nas przygotować na to nieszczęście. Pamiętam, że po raz pierwszy w moim życiu nie wołałam ludzi na pomoc, tylko udałam się do Boga.

Po modlitwie podeszłam do klęczącego nad Renią mego męża. Mój Pan po raz kolejny uczynił cud w naszym życiu! Nagle, ku naszemu zdumieniu, a zarazem wielkiej radości, Renia wciągnęła powietrze i zaczęła oddychać, a zaraz potem pytać, co się stało. Klęczeliśmy oboje koło niej i, mówiąc, staraliśmy się nie stracić z nią kontaktu. Nie wiem, ile czasu upłynęło do przyjazdu karetki. Dla nas była to wieczność.

Gdy przyjechała pomoc, lekarz stwierdził liczne obrażenia: uraz czaszki, otwarte złamanie nogi, połamaną miednicę, kręgosłup pod znakiem zapytania oraz całkowicie zdarty naskórek na ciele. Jednym słowem stan był krytyczny. Lekarz nie pozwolił nam jechać z nią w karetce. Gdy dotarliśmy do szpitala, dziecko było po prześwietleniu i ogólnym badaniu. Lekarz, który był przy wypadku, zawołał nas i powiedział, że mamy niesamowite szczęście, bo on, pracując 23 lata w pogotowiu, jeszcze nie spotkał się z takim cudem. W miejscu, gdzie poprzednio wystawała kość, pozostała tylko dziura, a po prześwietleniu okazało się, że nie ma nawet pęknięcia kości. Zarzekał się, że nie mógł się pomylić. Zresztą świadkami byli kierowca, sanitariusz i pielęgniarka.

Renia opuściła szpital już trzy dni później. Gdy wychodziła, ordynator powiedział nam, że to, iż nie jemy wieprzowiny miało duży wpływ na gojenie się ran. Kilka razy pytał, kim jesteśmy. Był to ewidentny cud dla całego szpitala. Wiedzieliśmy, że już drugie dziecko wyratował nam Pan od śmierci”.`
  },
  {
    id: "S10",
    slug: "s10-adrian-od-ateizmu-do-osobistej-wiary",
    title: "Adrian — od ateizmu do osobistej wiary",
    author: "Adrian",
    authorTitle: "Świadek wiary, relacja cytowana w książce Cezarego Rogowskiego",
    authorAvatar: "/ccn-logo-square.png",
    authorUrl: "https://polskieradio.cc/swiadectwa",
    type: "cudze / relacja",
    pages: "37–39",
    category: "Nawrócenie & Wiara",
    tags: ["ateizm", "nawrócenie ateisty", "ewolucjonizm a kreacjonizm", "biblia", "prawda was wyswobodzi", "pokonać goliata"],
    lead: "Księga, która wydawała mi się być zbiorem bajek i legend, okazała się niezwykle spójna, logiczna i wiarygodna. Kiedy przestałem być sceptykiem i pozwoliłem sobie na przywilej szczerości, odnalazłem pokój ducha, cel i nadzieję.",
    safetyNote: "Autentyczne świadectwo przejścia od sceptycyzmu naukowego i ateizmu do żywej wiary w Jezusa Chrystusa po samodzielnym studium Pisma Świętego.",
    text: `Od czasu, gdy Bóg uwolnił mnie od uzależnienia, odczuwałem moralny dług wdzięczności wobec mojego przyjaciela narkomana. Bardzo chciałem mu pomóc; w swej niemocy modlę się za niego i jego rodzinę już blisko dziesięć lat. W tym czasie zaprzyjaźniłem się z jego młodszym bratem, Adrianem, ateistą, za którego modliłem się, by zbawienie stało się jego udziałem. Po roku wspólnych spotkań i rozmów na temat Ewangelii Chrystusowej, Adrian stał się świadomie wierzącym chrześcijaninem. A oto, co sam mówi o tamtym czasie:

„Dałem się znaleźć tym, którzy mnie nie szukali. Objawiłem się tym, którzy o mnie nie pytali” (Rz 10,20).

„Pismo Święte jest niebiańskim darem dla wszystkich ludzi, lecz ten konkretny tekst jest dla mnie tak osobisty i bliski, że odnoszę wrażenie, jakby został napisany tylko i wyłącznie dla mnie i o mnie. Wychowałem się w zwyczajnej katolickiej rodzinie. Boga „znałem” głównie z kościoła i z lekcji religii. Niestety ani w kościele, ani na lekcjach religii, nie poznałem OSOBIŚCIE Jezusa Chrystusa. Moja mama była wtenczas religijną osobą, jednak jej wiara nie udzielała mi się w jakiś znaczący sposób. Mijały lata, a ja żyłem jak ta świnia w błocie, nie chcąc niczego zmienić na lepsze. Podczas tego długiego okresu mojego życia przeżywałem dużo cierpienia, zawodów i trosk. Te różne trudne doświadczenia skłoniły mnie do rozmyślań nad sensem cierpienia i istnienia człowieka w ogóle. Zacząłem interesować się świecką filozofią, lecz ona nie dała mi satysfakcjonującej odpowiedzi na nurtujące mnie dylematy.

I tak mijały kolejne miesiące… Aż pewnego dnia spotkałem na swej drodze człowieka, który również nie znał odpowiedzi na wszystkie dręczące mnie pytania, lecz stanowczo twierdził, że zna kogoś, kto wie wszystko. Ów człowiek nie owijał w bawełnę, lecz w prostocie serca mówił mi o Bogu, który zdziałał w jego życiu cuda. Ja w tym czasie byłem niestety ateistą, więc kpiłem sobie z niego i jego „średniowiecznych” poglądów. Przez długie miesiące nasze rozmowy oscylowały głównie wokół pytania, czy człowiek powstał z małpy, czy z ręki miłującego Boga? I ja, i on wiedzieliśmy swoje i nikt nie chciał ani na chwilę przyznać drugiemu racji. Moje argumenty opierały się na logice, filozofii i odkryciach naukowych, a jego jedynym argumentem było Słowo Boże.

Przez długi czas miałem krytyczny stosunek do Biblii. Będąc jednak człowiekiem szczerym, postanowiłem przeczytać tę księgę, aby móc się do niej ustosunkować, a znalazłszy w niej jakieś błędy czy nieścisłości – efektywniej wytrącać argumenty z ręki mego rozmówcy. WPADŁEM JAK ŚLIWKA W KOMPOT! Lektura Pisma Świętego zmieniła (i zmienia) moje życie nie do poznania. Księga, która wydawała mi się być zbiorem bajek i legend, okazała się być niezwykle spójna, logiczna i… wiarygodna. Powoli, ale systematycznie zaczynałem tracić asy z rękawa. Prawdy Biblii oraz publikacje naukowców kreacjonistów, które wówczas czytałem, zabiły we mnie ewolucjonistę, którym byłem przez całe lata.

Kiedy przestałem być sceptykiem i pozwoliłem sobie na przywilej szczerości, odnalazłem pokój ducha, cel i nadzieję. Wówczas wypełniły się w moim życiu słowa zapisane w Ewangelii Jana (J 8,32): „I poznacie prawdę, a prawda was wyswobodzi”. Jezus prawdziwie wyswobodził mnie z kłamstwa, w którym tkwiłem, lecz również z wielu grzechów, których wówczas nie uważałem za nic złego, lub myślałem, że sam dam sobie z nimi radę.

Dziś jestem innym człowiekiem. Mam mnóstwo wspaniałych doświadczeń z Bogiem, na które zabrakłoby miejsca w tej książce, gdyby je wszystkie spisać. Z sentymentem i żalem wspominam te czasy, kiedy byłem niewolnikiem grzechu, ludzkiej nauki i filozofii. Wierzę jednak w to, że każdy szczery człowiek znajdzie kiedyś w swym życiu Boga, jeśli tylko zacznie Go szukać. „Oto stoję u drzwi i kołaczę; jeśli kto usłyszy głos mój i otworzy drzwi, wstąpię do niego i będę z nim wieczerzał, a on ze mną” (Ap 3,20). Moje serce było zamknięte przez 18 lat. Przez 18 lat nie otwierałem drzwi swego serca dla Boga. Dziś niczego tak nie żałuję, jak tych 18 straconych lat. Tych 18 straconych lat, które mogłem poświęcić poznawaniu Boga, a które przepadły i nigdy nie powrócą. Kończąc tę historię, pragnę oddać Bogu chwałę za łaskę, którą mi wyświadczył, i życzyć wszystkim osobistego poznania naszego Pana i Zbawiciela Jezusa Chrystusa.”`
  },
  {
    id: "S11",
    slug: "s11-wieloletnia-modlitwa-wstawiennicza-i-uwolnienie",
    title: "Wieloletnia modlitwa wstawiennicza i poczucie uwolnienia",
    author: "Cezary Rogowski",
    authorTitle: "Założyciel Christian Culture & Redaktor Naczelny CCN News",
    authorAvatar: "/avatar_cezary_official.jpg",
    authorUrl: "https://polskieradio.cc/lumina.cezaryrgowski.html",
    type: "autorskie",
    pages: "39–40",
    category: "Modlitwa Wstawiennicza & Uwolnienie",
    tags: ["modlitwa wstawiennicza", "uwolnienie duchowe", "wspólnota", "pokonać goliata", "cezary rogowski"],
    lead: "Wiele może usilna modlitwa sprawiedliwego. Codzienne zabieganie moich braci i sióstr o mnie przed Bogiem, Jezusem Chrystusem – nie było daremne. Dziś jestem wolnym człowiekiem. Dziękuję wam, bracia!",
    safetyNote: "Świadectwo o sile wspólnotowej modlitwy wstawienniczej i przezwyciężaniu głębokiego kryzysu emocjonalnego i duchowego.",
    text: `Wiele może usilna modlitwa sprawiedliwego. Przez wiele lat prosiłem braci chrześcijan o modlitwę za mnie. Były to prośby o uwolnienie od pewnego demona, który w swej niszczycielskiej mocy rujnował moje zdrowie psychiczne, fizyczne i duchowe. Było to tak silne zjawisko, że odbierało mi chęć do życia, myślałem o tym, by skończyć ze sobą. Byłem przez tego demona zniewolony, pozbawiony radości, chęci do pracy, dystansowałem się społecznie, traciłem wiarę w Boga. Był to największy „goliat” w moim życiu. Był przyczyną większości moich problemów emocjonalnych, partnerskich i egzystencjalnych. Nie potrafiłem nic z nim zrobić. A Bóg był jakby „głuchy” na moje modlitwy.

Wiele lat przeminęło, aż nadszedł właściwy czas. A MOC MODLITWY WSTAWIENNICZEJ – codzienne zabieganie moich braci i sióstr o mnie przed Bogiem, Jezusem Chrystusem – nie była daremna. Dziś jestem wolnym człowiekiem. Dziękuję wam, bracia. Bogu niech będzie za to chwała!

Ważne jest, by w doświadczeniu modlitwy wstawienniczej modlić się, ale i też być przyjacielem w potrzebie. Konieczne jest, by w miarę możliwości zatroszczyć się w sposób praktyczny – osobiście lub pośrednio – o osobę, za którą się modlimy. Łatwiej ci będzie pokonywać własne „goliaty”, gdy, patrząc na Jezusa, będziesz zajmować się pomaganiem innym. Gdy ty będziesz pomagał innym, Bóg znajdzie osoby, które poświęcą się dla ciebie, byś i ty był w Chrystusie zwycięzcą! Jak już wcześniej wspomniałem, praktyczną wskazówką na drodze do skutecznej modlitwy, a zatem do zwycięstwa przez wiarę nad każdym „goliatem”, okaże się…`
  },
  {
    id: "S12",
    slug: "s12-wolanie-o-pomoc-historia-dorotki",
    title: "Wołanie o pomoc — historia Dorotki",
    author: "Roma",
    authorTitle: "Autorka pamiętnika „Wspomnienia Romy”, cytowana w książce Cezarego Rogowskiego",
    authorAvatar: "/ccn-logo-square.png",
    authorUrl: "https://polskieradio.cc/swiadectwa",
    type: "cudze / wspomnienia",
    pages: "46–47",
    category: "Cuda & Boży Ratunek",
    tags: ["poparzenie wrzątkiem", "dziecko", "modlitwa o pomoc", "uzdrowienie", "wspomnienia romy", "pokonać goliata"],
    lead: "Dorotka wykrzyknęła z wielkim żalem i płaczem niesamowite słowa: »Panie Jezu, jeżeli myślisz, że ja dłużej wytrzymam ten ból, to się mylisz!«. Ku mojemu zdziwieniu, gdy się obudziła, zaczęła biegać, jakby nic się nie stało.",
    safetyNote: "Świadectwo opisuje historyczną relację rodzinną. W razie oparzenia u dziecka natychmiast schładzaj ranę chłodną, czystą wodą przez 15–20 minut i wezwij pogotowie ratunkowe (tel. 112/999). Świadectwo wiary nie jest poradnikiem pierwszej pomocy medycznej.",
    text: `„Wołanie o pomoc” (fragment pamiętnika pt. „Wspomnienia Romy”).

„Pewnego dnia przyszła do mnie sąsiadka. Usiadłyśmy w kuchni przy świeżo zaparzonej herbacie. Dorotka, która miała wtedy około dwóch latek, weszła mi na kolana i zahaczyła rączką o wrzątek. Cała herbata wylała się na nią. Miała poparzoną całą klatkę piersiową i brzuszek. Zanim zdjęłam ubranka, już pojawiły się bąble. Bardzo płakała. Sąsiadka bez namysłu szybko pobiegła do domu po lód. Robiłyśmy jej okłady. Gdy troszkę się uspokoiła, powiedziałam jej, by spróbowała zasnąć, to przestanie ją boleć. Zamknęła oczka, a my wyszłyśmy z pokoju. Wiedziałyśmy, że to dopiero zacznie potem bardzo boleć i że musimy wezwać lekarza.

Gdy ona to usłyszała, wykrzyknęła z wielkim żalem i płaczem niesamowite słowa: »Panie Jezu, jeżeli myślisz, że ja dłużej wytrzymam ten ból, to się mylisz!«. Usnęła… A ja zastanawiałam się, co mam zrobić? Ku mojemu zdziwieniu, gdy się obudziła, zaczęła biegać, jakby nic się nie stało, nie czuła żadnego bólu i już po pewnym czasie bez żadnych leków i opatrunków wszystko się zagoiło. Pozostały tylko dwie małe prawie niewidoczne blizny, ale chyba tylko po to, by pamiętać, że Jezus jest najlepszym lekarzem…”.`
  },
  {
    id: "S13",
    slug: "s13-wspomnienia-romy-stan-wojenny-i-rodzina",
    title: "Wspomnienia Romy — stan wojenny, strajk i rodzina",
    author: "Roma",
    authorTitle: "Autorka pamiętnika „Wspomnienia Romy”, cytowana w książce Cezarego Rogowskiego",
    authorAvatar: "/ccn-logo-square.png",
    authorUrl: "https://polskieradio.cc/swiadectwa",
    type: "cudze / wspomnienia",
    pages: "50–52",
    category: "Historia & Boża Opieka",
    tags: ["stan wojenny 1981", "strajk górników", "kopalnia ziemowit", "modlitwa o męża", "wspomnienia romy", "pokonać goliata"],
    lead: "Była noc z 23 na 24 grudnia 1981 r. Uklękłyśmy do modlitwy: Boże, spraw by nasi mężowie wrócili, zanim się obudzimy. Rano, gdy otworzyłam oczy, mąż Grażyny i Zygmunt stali nad łóżkiem. Od tego momentu byłam pewna, że Bóg istnieje i pomaga.",
    safetyNote: "Świadectwo historyczne z okresu stanu wojennego w Polsce i strajku górników na Śląsku w grudniu 1981 roku.",
    text: `Był koniec 1981 roku. Ja i mój mąż Zygmunt razem z dziećmi: Robertem, Sebastianem i Danielem, mieszkaliśmy w Chrzanowie na ulicy Orkana. Miałam wtedy 24 lata. Były to trudne czasy. W grudniu wprowadzono stan wojenny. Wszystkie kopalnie strajkowały. Mój mąż pracował wtedy w kopalni Ziemowit w Lędzinach. Od 10 do 24 grudnia był uczestnikiem strajku.

W tym czasie zawiozłam dzieci do mamy i razem z sąsiadkami, żonami górników, zajęłyśmy się zbiórką żywności i lekarstw. Zorganizowałyśmy transport i pojechałyśmy na kopalnię z pomocą dla naszych mężów. Przez dwa tygodnie mieszkałyśmy w cechowni kopalni. Byłyśmy jak w transie: kawa, papieros, kawa, papieros i tak w kółko. Nie mogłyśmy skontaktować się z naszymi mężami. Często dzwoniłyśmy na dół, ale nie chcieli z nami rozmawiać, bo myśleli, że zomowcy zmuszają nas do tego, byśmy namawiały ich do zakończenia strajku. Koniecznością było codzienne zdobywanie dla nich żywności i leków.

Pewnej nocy właśnie w tym celu udałyśmy się autokarem kopalnianym do Tych. Przy kopalni Piast naszą uwagę przykuł straszny widok. Stały tam czołgi, a przed nimi kobiety z małymi dziećmi na rękach, starające się powstrzymać wojsko przed wejściem na teren kopalni… Była noc z 23 na 24 grudnia. Dyrektor kopalni postanowił nam pomóc i wysłał nas karetkami pogotowia do domów. Tego roku zima była bardzo sroga, pamiętam, że dowieźli nas tylko pod osiedle, bo były tam takie zaspy.

Razem z moją sąsiadką Grażynką postanowiłyśmy, że przenocuję u niej. Uklękłyśmy do modlitwy i po raz pierwszy w moim życiu miałam wątpliwości, co do istnienia Boga, a tak bardzo Go potrzebowałam. Pamiętam fragmenty modlitwy: »…Boże, jeżeli istniejesz, to okaż swoją moc i spraw, by nasi mężowie wrócili, zanim się obudzimy, a ja obiecuję, że w każdą niedzielę będę w kościele, ale jeżeli nie, to już więcej nie uwierzę w Twoją moc!«… To było ultimatum – nieładnie z mojej strony, ale Bóg zna serca i jest wyrozumiałym Bogiem. Poprosiłam Go o rzecz niemożliwą z mojego punktu widzenia.

A jednak! Rano, gdy otworzyłam oczy, mąż Grażyny i Zygmunt stali nad łóżkiem. Radości, jaką przeżyłam, nie jestem w stanie opisać. Od tego momentu byłam pewna, że Bóg istnieje i pomaga. Pamiętałam również o obietnicy i zawsze dbałam o to, by uczęszczać do kościoła. Coraz częściej zwracałam się do Boga z moimi prośbami i ufałam Mu z całego serca. Postanowiłam kontynuować moją naukę w liceum ogólnokształcącym. W kwietniu, ku naszej wspólnej radości, urodziła się nasza pierwsza córka, Renatka. Od tego czasu bardzo ciężko było mi pogodzić naukę z opieką nad dziećmi. Wielką pomocą w tym trudnym dla mnie czasie była nasza kochana sąsiadka – babcia Kościółkowa. Była to wspaniała kobieta, pełna miłości i zrozumienia dla innych. Stała się naszym przyjacielem na wiele lat”.`
  },
  {
    id: "S14",
    slug: "s14-codzienne-przemiany-charakteru-i-walka-z-nalogami",
    title: "Codzienne przemiany charakteru i walka z nałogami",
    author: "Cezary Rogowski",
    authorTitle: "Założyciel Christian Culture & Redaktor Naczelny CCN News",
    authorAvatar: "/avatar_cezary_official.jpg",
    authorUrl: "https://polskieradio.cc/lumina.cezaryrgowski.html",
    type: "autorskie",
    pages: "71–72",
    category: "Wzrost Duchowy & Uświęcenie",
    tags: ["samokontrola", "przemiana charakteru", "co zrobiłby jezus", "pokonać goliata", "cezary rogowski"],
    lead: "Aby uczyć się samokontroli na drodze do wszechstronnego zwycięstwa, pomocnym okaże się bardzo prosty nawyk zadawania sobie pytań: Co Jezus Chrystus zrobiłby na moim miejscu?",
    safetyNote: "Autorska refleksja formacyjna o codziennym procesie kształtowania chrześcijańskiego charakteru i samokontroli.",
    text: `Dla mnie osobiście dowodem i doświadczeniem na to, że Bóg może wszystko, jest to, co każdego dnia On czyni w moim życiu, zmieniając złe nawyki w dobre cechy. Oczywiście daleko mi do doskonałości, którą prezentował swoim życiem Chrystus, będąc na ziemi. To jednak Bóg krok po kroku bierze moje słabości, szlifuje je, przekształca i formuje na wzór i podobieństwo charakteru swojego Syna. Gdyby nie On:
– nigdy bym nie rzucił palenia papierosów, lubiłem palić, a gdy rzucałem, robiłem to wiele, wiele razy.
– nigdy bym sam z siebie nie przestał ćpać. Byłem zbyt uzależniony.
– nigdy bym nie przestał kłamać, bo uważałem, że się nie da. Tak jak nie przestałbym wulgaryzować itp.
– nigdy bym nie przyjął biblijnego chrztu, bo uważałem, że już jako dziecko byłem ochrzczony i że jest to właściwe.
– nie dożyłbym dzisiejszego dnia, bo umarłbym już dawno w swoich nałogach.

Bóg jest wszechmogący! Pamiętaj jednak, że nie musisz mi wierzyć, że Bóg jest wszechmogący. Najlepiej sprawdź to sam. Bóg jest zawsze gotowy do tego, by objawić ci swoją wszechmoc.

SAMOKONTROLA. Aby uczyć się samokontroli na drodze do wszechstronnego zwycięstwa, pomocnym okaże się bardzo prosty nawyk zadawania sobie pytań:
Czy Jezus Chrystus zrobiłby to, co chcę zrobić ja?
Czy Jezus Chrystus mówiłby tak, jak mówię ja?
Czy Jezus Chrystus odpowiadałby tak, jak odpowiadam ja?
Co Jezus Chrystus zrobiłby na moim miejscu?

Na początku znajomości, wtedy, gdy jeszcze twoja przyjaźń z Jezusem jest mało rozwinięta, pytania takie mogą wydawać się dość dziwne i mało konkretne. Jednak w miarę upływu czasu, gdy twoja znajomość będzie wzrastać i poznasz Jego sposób bycia, postępowania i zachowania, stwierdzisz, że pytania te są bardzo pomocne, a czasem wręcz niezastąpione i skutecznie pomagają utrzymać coraz wyższy stopień samokontroli i wzrostu.`
  },
  {
    id: "S15",
    slug: "s15-milosc-i-rozstanie-osobista-historia",
    title: "Miłość i rozstanie — osobista historia",
    author: "Cezary Rogowski",
    authorTitle: "Założyciel Christian Culture & Redaktor Naczelny CCN News",
    authorAvatar: "/avatar_cezary_official.jpg",
    authorUrl: "https://polskieradio.cc/lumina.cezaryrgowski.html",
    type: "autorskie",
    pages: "74",
    category: "Relacje & Miłość Boża",
    tags: ["miłość", "rozstanie", "złamane serce", "miłość bezinteresowna", "bóg jest miłością", "pokonać goliata"],
    lead: "Rozstanie to złamało mi serce. Dziś wiem, że była to ludzka, niedoskonała miłość. Prawdziwa miłość to wolność, a miłość bez Boga w sercu jest złudzeniem. Bóg jest Miłością!",
    safetyNote: "Osobista autobiograficzna relacja autora o młodzieńczym zakochaniu, bólu rozstania i odnalezieniu dojrzałej miłości w Bogu.",
    text: `Kiedy miałem siedemnaście lat, poznałem wspaniałą szesnastoletnią, zielonooką blondynkę, w której się prawdziwie zakochałem. Gdy po trzech miesiącach wyznałem jej swoje uczucie, tak kochałem ją kolejne czternaście lat. Jaka to była miłość? Bardzo krótka i bardzo krucha. Romantyczna i egoistyczna. Kwiaty i kłótnie. Radość i łzy. Ale dla mnie to była wielka, prawdziwa miłość na zawsze.

Mówią, że mężczyźni nie płaczą. Ja po naszym rozstaniu płakałem. A rozstanie to złamało mi serce. Dziś wiem, że była to ludzka, niedoskonała, niedojrzała miłość. Aby jednak żyć tak, jakby chciał tego mój Bóg, musiałem zostawić przeszłość i pogodzić się z nią. Modliłem się i walczyłem sam ze sobą i z Bogiem. Bo nie umiałem przestać kochać. Ale nie takiej miłości pragnął dla mnie Bóg.

Dziś, gdy uczę się bezinteresownej miłości od Jezusa Chrystusa, to wiem, że… Prawdziwa miłość to wolność. A miłość bez Boga w sercu jest złudzeniem. Możemy próbować kochać i wmawiać sobie, że ktoś nas kocha, ale bez Boga taka pseudomiłość to tylko złudzenia. Popatrz tylko na życie Jezusa, a sam zrozumiesz, o czym mówię. Jego styl, bezinteresowne oddanie się. Miłość to dar, który trzeba nabyć u źródła! Bóg jest Miłością!

Miłość jest cierpliwa
Miłość jest dobrotliwa
Miłość nie zazdrości
Miłość nie jest chełpliwa
Miłość nie nadyma się
Miłość nie postępuje nieprzystojnie
Miłość nie szuka swego
Miłość nie unosi się
Miłość nie myśli nic złego
Miłość nie raduje się z niesprawiedliwości
Miłość raduje się z prawdy
Miłość wszystko zakrywa
Miłość wszystkiemu wierzy
Miłość wszystkiego się spodziewa
Miłość wszystko znosi

TEST NA DUCHOWĄ DOSKONAŁOŚĆ, ZWYCIĘSTWO I SZCZĘŚCIE (sięgaj po niego co najmniej raz w roku)`
  },
  {
    id: "S16",
    slug: "s16-tecza-wspomnienie-przymierza",
    title: "Tęcza — wspomnienie przymierza",
    author: "Cezary Rogowski",
    authorTitle: "Założyciel Christian Culture & Redaktor Naczelny CCN News",
    authorAvatar: "/avatar_cezary_official.jpg",
    authorUrl: "https://polskieradio.cc/lumina.cezaryrgowski.html",
    type: "autorskie",
    pages: "77–78",
    category: "Przymierze z Bogiem",
    tags: ["tęcza", "przymierze", "znak na niebie", "modlitwa w górach", "pokonać goliata", "cezary rogowski"],
    lead: "Gdy nasze oczy otworzyły się tuż po modlitwie, przed nami rozpostarła się w całej pełni piękna tęcza. Mój Bóg nie zapomina o swoim przymierzu. Jest tak blisko i troszczy się o nas.",
    safetyNote: "Autorska relacja ze wspólnej modlitwy w górach i znaku tęczy jako biblijnego przypomnienia o przymierzu z Bogiem.",
    text: `„Tęcza”
„Łuk mój kładę na obłok, aby był znakiem przymierza między Mną a ziemią. Kiedy zbiorę chmury i obłok będzie nad ziemią, a na obłoku ukaże się łuk, wspomnę na przymierze moje, które jest między mną i wami (…)” (Rdz 9,13–15).

6 lipca 2007 r. Dzień chylił się ku końcowi, był to dzień przygotowania i nastawał szabat. Wymieniliśmy kilka myśli na temat zbawienia z człowiekiem innego wyznania i udaliśmy się na wędrówkę po zalewie i pobliskich górach. Na szczycie jednej z gór zatrzymaliśmy się na rozważaniu Słowa Bożego i na modlitwę. Dziś prosiłem Pana o dar miłości i o łaskę przebaczenia wszelkiej nieprawości. Czytając Ewangelię Jana, miałem bardzo dobre myśli.

Zachód słońca był już blisko, więc rozpoczęliśmy Psalmem, proroctwem o Jezusie Chrystusie i modlitwą. Pan okazał nam przychylność i gdy nasze oczy otworzyły się tuż po modlitwie, przed nami rozpostarła się w całej pełni piękna tęcza. Mój Bóg nie zapomina o swoim przymierzu. Jest tak blisko, troszczy się i przypomina o sobie w tak spektakularny sposób.

Osobiste przymierze z Bogiem jest najwspanialszym doświadczeniem życia, jest jego początkiem i dopełnieniem. „Łuk mój kładę na obłoku, aby był znakiem przymierza” – tak mówi Pan. Czy moje osobiste przymierze jest autentyczne i czy Bóg je afirmuje? – czasem zadaję sobie to pytanie. Dziś po raz kolejny On to potwierdził. A jak jest w twoim życiu? Co z twoim osobistym przymierzem? Pan Jezus czeka z otwartymi ramionami. Dziś twoje życie może nabrać nowego wymiaru. Wiecznego wymiaru z nieprzemijającą przyjaźnią! To dopiero perspektywa!`
  },
  {
    id: "S17",
    slug: "s17-studniowka-wspomnienie-romy-o-wypadku-synow",
    title: "Studniówka — wspomnienie Romy o wypadku synów",
    author: "Roma",
    authorTitle: "Autorka pamiętnika „Wspomnienia Romy”, cytowana w książce Cezarego Rogowskiego",
    authorAvatar: "/ccn-logo-square.png",
    authorUrl: "https://polskieradio.cc/swiadectwa",
    type: "cudze / wspomnienia",
    pages: "78–79",
    category: "Cuda & Boży Ratunek",
    tags: ["wypadek drogowy", "ocalenie synów", "studniówka", "anioł stróż", "wspomnienia romy", "pokonać goliata"],
    lead: "Policjant powiedział, że powinniśmy iść na kolanach do Częstochowy podziękować Bogu za cud. Naczepa dosłownie ścięła górę samochodu, a oni na nogach wrócili do domu. Bóg ochrania swoje dzieci.",
    safetyNote: "Świadectwo o dramatycznym wypadku drogowym w warunkach zimowych i ocaleniu życia. Zawsze pamiętaj o zapinaniu pasów i ostrożności na śliskiej nawierzchni.",
    text: `„Studniówka” (fragment pamiętnika pt. „Wspomnienia Romy”).

„Był styczeń 1995 roku. Mój syn Robert przyjechał na pierwszą przepustkę z wojska i razem z Sebastianem wybierali się do Stryszawy na studniówkę do ich koleżanki Kasi Wacławik. Był to bardzo mroźny dzień i droga była bardzo śliska. Był to piątek po południu. Pamiętam, że bardzo prosiłam, by nie wyjeżdżali w szabat, ale oni mnie nie usłuchali. Ja z Zygmuntem pojechaliśmy do Balina na spotkanie modlitewne. Był to zły okres w naszym życiu zborowym. Na Zysia padły bardzo poważne oskarżenia i stanął przed radą zboru. Byliśmy przerażeni tym wszystkim, wydawało nam się, że Bóg nas opuścił i wszyscy sprzysięgli się przeciwko nam.

Gdy wróciliśmy do domu, sąsiadka powiedziała, że mamy jechać na policję. Byliśmy przerażeni. Byłam przekonana, że wjechali w kogoś i rozbili samochód. Gdy jechaliśmy, córka Ali Gęborys, Marzenka, machała za nami, ale się nie zatrzymaliśmy. Gdy znaleźliśmy się na komendzie, a było to około 21, naszych dzieci już tam nie zastaliśmy, ale policjant powiedział, że powinniśmy iść na kolanach do Częstochowy podziękować Bogu za cud.

Okazało się, że kierowca samochodu ciężarowego z naczepą, jadący z przeciwka, na zakręcie stracił panowanie nad kierownicą i naczepa zjechała na przeciwny pas drogi i dosłownie ścięła górę samochodu do poziomu kierownicy i zmiażdżyła na wysokości tylnych siedzeń. Obaj siedzieli z przodu, ale jakimś cudem nie ścięło im głów. Do dzisiaj nie wiem jak, lecz jestem pewna, że Pan kiedyś pokaże mi, jak anioł osłonił ich w cudowny sposób. Sebastianowi nic się nie stało, a Robert miał tylko przecięte czoło i kilka szwów. Obaj na nogach wrócili do domu.

Wrócę jednak do Marzenki, o której wcześniej wspomniałam. Jechała z Wadowic i widziała wypadek, poznała samochód po rybce (znak chrześcijaństwa) i zasłonkach na szyby. Odjechała już z nimi karetka i wszyscy mówili, że nie żyją. Była przerażona. Obie z Alą do następnego dnia nie mogły się zebrać z przejęcia, by przyjść i zapytać, co się stało. Chwała niech będzie Bogu za ten kolejny cud w naszym życiu. Może wydawać wam się to dziwne, ale pomimo kłopotów, jakie mieliśmy w zborze, byliśmy pewni, że Bóg jest z nami i ochrania nasze dzieci. Dzięki wielkiej miłości Boga kolejne dwie osoby z mojego domu uniknęły śmierci”.`
  },
  {
    id: "S18",
    slug: "s18-zbyszek-nieoczekiwane-spotkanie",
    title: "Zbyszek — nieoczekiwane spotkanie po rozmowie z matką",
    author: "Cezary Rogowski",
    authorTitle: "Założyciel Christian Culture & Redaktor Naczelny CCN News",
    authorAvatar: "/avatar_cezary_official.jpg",
    authorUrl: "https://polskieradio.cc/lumina.cezaryrgowski.html",
    type: "autorskie",
    pages: "79–80",
    category: "Boże Prowadzenie & Ewangelizacja",
    tags: ["boże prowadzenie", "ewangelizacja", "alkoholizm", "spotkanie na budowie", "pokonać goliata", "cezary rogowski"],
    lead: "Zbyszek zaczął mi opowiadać, jak to matka namawiała go, by zadzwonił pod pewien numer, bo tam mógłby mu ktoś pomóc. Powiedziałem: Wiesz, to jest mój numer telefonu i to właśnie ja rozmawiałem z twoją mamą. Obaj byliśmy zdumieni.",
    safetyNote: "Świadectwo o niezwykłych zbiegach okoliczności pod Bożym prowadzeniem i wolnym wyborze człowieka wobec zaproszenia Ewangelii.",
    text: `Kilka lat temu wraz z jedną siostrą z kościoła podczas wycieczki ewangelizacyjnej, na jednym z osiedli domków jednorodzinnych, zostawialiśmy mieszkańcom literaturę chrześcijańską. Kilka dni później jakaś kobieta zadzwoniła do mnie. Ze wstępnej rozmowy wywnioskowałem, że materiały, które zostawiliśmy, dotarły również i do niej. Jak się zaraz dowiedziałem, dzwoniła do mnie w sprawie swego już dorosłego syna, który był uzależniony od alkoholu.

Zaproponowałem, by to on skontaktował się z nami osobiście. Wierzyłem, że Bóg chce mu pomóc pokonać tego potężnego „goliata”. Czas mijał, ale on nie zadzwonił, a i my zapomnieliśmy o całej sprawie. Ale Bóg nigdy nie zapomina.

Jakiś czas później przyjąłem się do pracy w firmie budowlanej i pracowałem przy remoncie miejskiego szpitala. Pierwszego dnia pracy dwóch ochotników miało pojechać i wykonać zleconą pracę w szkole gastronomicznej. Zgłosiłem się pierwszy, a zaraz po mnie jakiś inny pracownik. Miał na imię Zbyszek. Przez jakiś czas pracowaliśmy razem. Zaczęliśmy się bliżej poznawać. Wspólne rozmowy stawały się bardziej osobiste i konkretne.

Zbyszek, ku mojemu zdziwieniu, zaczął mi opowiadać, jak to kiedyś matka namawiała go, by zadzwonił pod pewien numer, bo tam mógłby mu ktoś pomóc. Już wcześniej nasze rozmowy przybierały charakter duchowy, więc bez wahania powiedziałem do Zbyszka: „Wiesz, to jest mój numer telefonu i to właśnie ja rozmawiałem z twoją mamą”. Obaj byliśmy zdumieni. A ja chwaliłem Pana za Jego miłość, troskę i pamięć.

Spędziliśmy kilka bardzo miłych chwil na rozmowie o Jezusie. Zapraszałem Zbyszka, by pojednał się z Bogiem i oddał swe życie Jezusowi. Nasze drogi dość szybko się rozeszły. On dokonał wyboru. Dziś, gdy wspominam to doświadczenie, modlę się za niego, bo nie przyjął wtedy Jezusa, a nałóg alkoholowy odbiera mu godne życie. A przecież nie musi się to tak skończyć.`
  },
  {
    id: "S19",
    slug: "s19-cud-w-hurtowni-historia-darka",
    title: "Cud w hurtowni — historia Darka",
    author: "Cezary Rogowski",
    authorTitle: "Założyciel Christian Culture & Redaktor Naczelny CCN News",
    authorAvatar: "/avatar_cezary_official.jpg",
    authorUrl: "https://polskieradio.cc/lumina.cezaryrgowski.html",
    type: "autorskie",
    pages: "107–108",
    category: "Nawrócenie & Nowe Życie",
    tags: ["hurtownia rzeszów", "nawrócenie", "chrzest biblijny", "modlitwa zbawienia", "pokonać goliata", "cezary rogowski"],
    lead: "Człowiek ten zamknął na chwilę drzwi hurtowni, uklękliśmy, a Darek razem z nami. Wśród sklepowych półek trzej mężczyźni klęcząc przed Wszechmogącym, proszą o zbawienie. Mój nowy brat w Chrystusie po jakimś czasie przyjął chrzest zanurzający.",
    safetyNote: "Świadectwo o spontanicznej modlitwie nawrócenia w miejscu pracy i biblijnym chrzcie wiary.",
    text: `„I w hurtowni może zdarzyć się cud”

Co jakiś czas wspominam wydarzenie, które miało miejsce w jednej z hurtowni rzeszowskich. Był taki okres, że z jednym z braci z kościoła jeździliśmy samochodem do różnych miast, by zaopatrzyć się w towar do handlu. Tym razem kolejnym miastem był właśnie Rzeszów. Paweł podczas podróży opowiadał mi o swoich pracach ewangelizacyjnych, a w Rzeszowie właśnie nabywał towar u jednego takiego hurtownika, z którym w międzyczasie rozmawiał o sprawach Bożych.

Tego dnia miałem przyjemność go poznać. Bardzo miły, sympatyczny człowiek obsłużył nas, po czym zamieniliśmy kilka zdań. Nadszedł taki moment, że ja powiedziałem kilka słów o zbawieniu w Chrystusie. Czasem zdarza się tak, że jestem bardzo bezpośredni. Wyjaśniłem więc naszemu słuchaczowi, że jeśli pragnie zbawienia, pojednania z Bogiem i życia wiecznego, to jego pragnienie może się spełnić nawet teraz. Zaproponowałem wspólną modlitwę, w której chciałem powierzyć go zbawiennej łasce Chrystusa. Zgodził się niemal bez wahania, zważywszy na to, że byliśmy w miejscu publicznym.

Człowiek ten zamknął na chwilę drzwi hurtowni, uklękliśmy, a Darek, bo takie było jego imię, razem z nami. Zacząłem mówić do Boga o naszym szczerym pragnieniu wyrzeczenia się wszelkiego grzechu. Prosiłem Boga, by przebaczył nam wszelką nieprawość, by stał się osobistym Zbawicielem Darka i wszedł do jego życia i odmienił je, a prawda wypełniła jego poznanie. Zakończyłem słowem „Amen”, a modlący się ze mną mężczyźni odpowiedzieli „Amen”.

Szczerze pogratulowałem Darkowi właściwej decyzji i narodzenia do nowego życia w Chrystusie. Wśród „sklepowych” półek, gdzieś pomiędzy ladą, a wejściowymi drzwiami, trzej mężczyźni klęcząc przed Wszechmogącym, proszą o zbawienie. Po chwili wszystko wróciło do normy. Darek wrócił do swojej pracy, a my, pożegnawszy się, odjechaliśmy.

Nasze drogi schodziły się już później bardzo rzadko. Ale zawsze otrzymywałem dobre wieści. Mój nowy brat w Chrystusie, po jakimś czasie przyjął chrzest zanurzający i oficjalnie dopełnił swe wieczne przymierze z Bogiem. Narodził się, jak wierzę, z Ducha Świętego w tamtej hurtowni, a dopełnił to, wychodząc z wody (por. J 3).`
  }
];

// Generowanie pojedynczej podstrony świadectwa
function renderTestimonyPage(item, prevItem, nextItem) {
  const canonicalUrl = `https://polskieradio.cc/swiadectwa/${item.slug}`;
  const shareTitle = `${item.title} — Świadectwa Wiary | Christian Culture`;
  const shareUrl = encodeURIComponent(canonicalUrl);
  const shareText = encodeURIComponent(item.title + ' — Świadectwo z książki „Pokonać Goliata” Cezarego Rogowskiego');
  const luminaShareUrl = `https://polskieradio.cc/tablica?share_url=${shareUrl}&share_title=${encodeURIComponent(item.title)}&share_source=swiadectwa`;
  const xShareUrl = `https://x.com/intent/tweet?url=${shareUrl}&text=${shareText}`;

  // Akapity tekstu
  const paragraphs = item.text.split('\n\n').filter(p => p.trim().length > 0).map(p => {
    const formatted = p.trim()
      .replace(/^„(.*)”$/s, '<blockquote>„$1”</blockquote>')
      .replace(/\n/g, '<br>');
    if (formatted.startsWith('<blockquote>')) return formatted;
    return `<p class="text-base sm:text-lg text-slate-300 leading-relaxed font-light mb-5">${formatted}</p>`;
  }).join('\n');

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${canonicalUrl}#article`,
        "isPartOf": {
          "@type": "WebSite",
          "@id": "https://polskieradio.cc/#website",
          "name": "Christian Culture",
          "url": "https://polskieradio.cc/"
        },
        "headline": item.title,
        "description": item.lead,
        "image": `https://polskieradio.cc/images/swiadectwa/${item.slug}.jpg`,
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": canonicalUrl
        },
        "datePublished": "2026-10-20T08:00:00+02:00",
        "dateModified": "2026-10-20T08:00:00+02:00",
        "inLanguage": "pl-PL",
        "isAccessibleForFree": true,
        "author": {
          "@type": "Person",
          "name": item.author,
          "url": item.authorUrl,
          "jobTitle": item.authorTitle,
          "image": `https://polskieradio.cc${item.authorAvatar}`
        },
        "publisher": {
          "@type": "NewsMediaOrganization",
          "@id": "https://polskieradio.cc/#organization",
          "name": "Christian Culture Network (CCN)",
          "url": "https://polskieradio.cc/",
          "logo": {
            "@type": "ImageObject",
            "url": "https://polskieradio.cc/ccn-logo-square.png"
          }
        },
        "isBasedOn": {
          "@type": "Book",
          "name": "Pokonać Goliata. Jak zwyciężać własne słabości",
          "author": {
            "@type": "Person",
            "name": "Cezary Rogowski"
          },
          "datePublished": "2026",
          "pagination": item.pages
        },
        "articleSection": item.category,
        "keywords": item.tags.join(', ')
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${canonicalUrl}#breadcrumb`,
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Christian Culture",
            "item": "https://polskieradio.cc/"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Świadectwa Wiary",
            "item": "https://polskieradio.cc/swiadectwa"
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": item.title,
            "item": canonicalUrl
          }
        ]
      }
    ]
  };

  return `<!doctype html>
<html lang="pl">
<head>
  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-Y4EFTVBPE3"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-Y4EFTVBPE3');
  </script>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  
  <title>${item.title} – Świadectwa Wiary | Christian Culture</title>
  <meta name="description" content="${item.lead.replace(/"/g, '&quot;')}" />
  <meta name="author" content="${item.author}" />
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
  <link rel="canonical" href="${canonicalUrl}" />
  <link rel="icon" type="image/png" href="/ccn-logo-square.png" />

  <!-- Open Graph -->
  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="Christian Culture — Świadectwa Wiary" />
  <meta property="og:url" content="${canonicalUrl}" />
  <meta property="og:title" content="${item.title} – Świadectwa Wiary" />
  <meta property="og:description" content="${item.lead.replace(/"/g, '&quot;')}" />
  <meta property="og:image" content="https://polskieradio.cc/images/swiadectwa/${item.slug}.jpg" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="675" />
  <meta property="og:image:alt" content="${item.title.replace(/"/g, '&quot;')}" />
  <meta property="article:published_time" content="2026-10-20T08:00:00+02:00" />
  <meta property="article:author" content="${item.author}" />
  <meta property="og:locale" content="pl_PL" />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:url" content="${canonicalUrl}" />
  <meta name="twitter:title" content="${item.title} – Świadectwa Wiary" />
  <meta name="twitter:description" content="${item.lead.replace(/"/g, '&quot;')}" />
  <meta name="twitter:image" content="https://polskieradio.cc/images/swiadectwa/${item.slug}.jpg" />

  <!-- Fonts & Icons -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800;900&family=Outfit:wght@300;400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <script src="https://cdn.tailwindcss.com"></script>

  <style>
    :root {
      --gold-primary: #D4AF37;
      --gold-light: #F3E5AB;
      --gold-dark: #AA7C11;
      --bg-dark: #07090E;
      --card-bg: rgba(14, 18, 26, 0.75);
    }
    body {
      background-color: var(--bg-dark);
      color: #E2E8F0;
      font-family: 'Outfit', sans-serif;
    }
    .font-cinzel { font-family: 'Cinzel', serif; }
    blockquote {
      border-left: 3px solid var(--gold-primary);
      padding-left: 1.25rem;
      font-style: italic;
      color: #E2E8F0;
      margin: 1.5rem 0;
      background: rgba(212, 175, 55, 0.05);
      padding-top: 0.75rem;
      padding-bottom: 0.75rem;
      border-radius: 0 0.75rem 0.75rem 0;
    }
  </style>

  <script type="application/ld+json">
${JSON.stringify(jsonLd, null, 2)}
  </script>
</head>

<body class="min-h-screen flex flex-col bg-[#07090E] text-slate-100 antialiased selection:bg-[#D4AF37]/30 selection:text-white">
  <!-- Top Navigation -->
  <header class="sticky top-0 z-50 backdrop-blur-md bg-[#07090E]/90 border-b border-[#D4AF37]/20">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
      <a href="/" class="flex items-center gap-3 group">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#8C6D1F] p-[1px] flex items-center justify-center shadow-lg shadow-[#D4AF37]/10 group-hover:shadow-[#D4AF37]/20 transition-all">
          <div class="w-full h-full bg-[#07090E] rounded-[11px] flex items-center justify-center">
            <span class="font-cinzel font-bold text-[#D4AF37] text-lg">CC</span>
          </div>
        </div>
        <div class="flex flex-col">
          <span class="font-cinzel font-bold tracking-wider text-sm sm:text-base text-white group-hover:text-[#D4AF37] transition-colors">CHRISTIAN CULTURE</span>
          <span class="text-[10px] tracking-widest text-[#D4AF37] uppercase font-semibold">Świadectwa Wiary</span>
        </div>
      </a>

      <div class="flex items-center gap-2 sm:gap-4">
        <a href="/swiadectwa" class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all">
          <i class="fa-solid fa-book-open text-[#D4AF37]"></i>
          <span>Wszystkie świadectwa</span>
        </a>
        <a href="/swiadectwa-live.html" class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-red-950/40 text-red-400 border border-red-800/40 hover:bg-red-900/60 transition-all">
          <span class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          <span>CCTV LIVE</span>
        </a>
      </div>
    </div>
  </header>

  <!-- Breadcrumbs -->
  <nav class="max-w-4xl mx-auto px-4 sm:px-6 pt-6 pb-2 w-full text-xs text-slate-400 flex items-center gap-2 flex-wrap" aria-label="Nawigacja okruszkowa">
    <a href="/" class="hover:text-[#D4AF37] transition-colors">Strona Główna</a>
    <span>/</span>
    <a href="/swiadectwa" class="hover:text-[#D4AF37] transition-colors">Świadectwa</a>
    <span>/</span>
    <span class="text-[#D4AF37] truncate">${item.title}</span>
  </nav>

  <!-- Main Content -->
  <main class="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-6 w-full">
    <article class="bg-[#0E121A]/80 border border-[#D4AF37]/20 rounded-2xl p-6 sm:p-10 shadow-2xl shadow-black/60 relative overflow-hidden">
      <!-- Glow effect -->
      <div class="absolute -top-24 -right-24 w-72 h-72 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none"></div>

      <!-- Header -->
      <header class="mb-8 border-b border-slate-800 pb-8">
        <div class="flex items-center gap-2 flex-wrap mb-4">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
            <i class="fa-solid fa-shield-halved text-[11px]"></i>
            ${item.id} · ${item.category}
          </span>
          <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800/60 text-slate-400 border border-slate-700/60">
            <i class="fa-solid fa-bookmark text-[10px]"></i>
            s. ${item.pages}
          </span>
        </div>

        <h1 class="text-2xl sm:text-3xl md:text-4xl font-cinzel font-bold text-white tracking-wide leading-tight mb-4">
          ${item.title}
        </h1>

        <!-- Author info & Source -->
        <div class="flex items-center justify-between gap-4 flex-wrap pt-2">
          <div class="flex items-center gap-3">
            <img src="${item.authorAvatar}" alt="${item.author}" class="w-11 h-11 rounded-full border border-[#D4AF37]/40 object-cover" />
            <div>
              <div class="font-medium text-sm text-slate-200">${item.author}</div>
              <div class="text-xs text-slate-400">${item.authorTitle}</div>
            </div>
          </div>

          <div class="text-right text-xs text-slate-400">
            <div class="text-slate-300 font-medium">Źródło: Książka „Pokonać Goliata”</div>
            <div>Wydanie 2026 · ss. ${item.pages}</div>
          </div>
        </div>
      </header>

      <!-- Hero Graphic Banner -->
      <div class="mb-8 rounded-2xl overflow-hidden border border-[#D4AF37]/30 shadow-2xl bg-[#07090E]">
        <picture>
          <source srcset="/images/swiadectwa/${item.slug}.webp" type="image/webp" />
          <img src="/images/swiadectwa/${item.slug}.jpg" alt="${item.title.replace(/"/g, '&quot;')}" class="w-full h-auto aspect-[16/9] object-cover" width="1200" height="675" fetchpriority="high" />
        </picture>
      </div>

      <!-- Lead -->
      <div class="bg-gradient-to-r from-[#D4AF37]/10 to-transparent p-5 rounded-xl border-l-4 border-[#D4AF37] mb-8">
        <p class="text-base sm:text-lg text-slate-200 font-medium italic leading-relaxed">
          „${item.lead}”
        </p>
      </div>

      <!-- Body text -->
      <div class="prose prose-invert max-w-none text-slate-300">
        ${paragraphs}
      </div>

      <!-- Safety & Editorial Note -->
      <div class="mt-10 p-5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 leading-relaxed">
        <div class="flex items-center gap-2 font-semibold text-slate-300 mb-2">
          <i class="fa-solid fa-circle-info text-[#D4AF37]"></i>
          <span>Oświadczenie redakcyjne CCN & Kontekst duchowy:</span>
        </div>
        <p>${item.safetyNote}</p>
        <p class="mt-2 text-[11px] text-slate-500">
          Niniejsza publikacja stanowi autentyczny fragment książki Cezarego Rogowskiego <em>„Pokonać Goliata. Jak zwyciężać własne słabości”</em> (2026). Wszystkie prawa zastrzeżone dla Christian Culture.
        </p>
      </div>

      <!-- Sharing bar -->
      <div class="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between gap-4 flex-wrap">
        <div class="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <i class="fa-solid fa-share-nodes text-[#D4AF37]"></i>
          <span>Podaj dalej:</span>
        </div>

        <div class="flex items-center gap-3">
          <!-- Lumina Share Button -->
          <a href="${luminaShareUrl}" target="_blank" rel="noopener" class="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#F3E5AB] text-black font-semibold text-xs sm:text-sm shadow-md shadow-[#D4AF37]/20 transition-all min-h-[44px]" title="Udostępnij na Tablicy Społeczności LUMINA">
            <span class="font-bold text-sm">L</span>
            <span>Udostępnij w LUMINA</span>
          </a>

          <!-- Twitter Share Button -->
          <a href="${xShareUrl}" target="_blank" rel="noopener" class="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs sm:text-sm border border-slate-700 transition-all min-h-[44px]" title="Udostępnij na platformie X">
            <i class="fa-brands fa-x-twitter text-sm"></i>
            <span class="hidden sm:inline">Post na X</span>
          </a>

          <!-- Copy link -->
          <button onclick="navigator.clipboard.writeText(window.location.href); alert('Skopiowano link do świadectwa!');" class="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs sm:text-sm border border-slate-700 transition-all min-h-[44px]" title="Kopiuj link">
            <i class="fa-regular fa-copy text-sm"></i>
          </button>
        </div>
      </div>
    </article>

    <!-- Prev / Next Navigation -->
    <div class="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
      ${prevItem ? `
      <a href="/swiadectwa/${prevItem.slug}" class="p-4 rounded-xl bg-[#0E121A]/60 border border-slate-800 hover:border-[#D4AF37]/40 transition-all flex flex-col group min-h-[64px] justify-center">
        <span class="text-[11px] text-[#D4AF37] font-semibold tracking-wider uppercase mb-1">← Poprzednie świadectwo (${prevItem.id})</span>
        <span class="text-sm font-medium text-slate-300 group-hover:text-white transition-colors truncate">${prevItem.title}</span>
      </a>
      ` : `<div class="p-4 rounded-xl bg-[#0E121A]/20 border border-slate-900 text-xs text-slate-600 flex items-center justify-center">To jest pierwsze świadectwo</div>`}

      ${nextItem ? `
      <a href="/swiadectwa/${nextItem.slug}" class="p-4 rounded-xl bg-[#0E121A]/60 border border-slate-800 hover:border-[#D4AF37]/40 transition-all flex flex-col text-right group min-h-[64px] justify-center">
        <span class="text-[11px] text-[#D4AF37] font-semibold tracking-wider uppercase mb-1">Następne świadectwo (${nextItem.id}) →</span>
        <span class="text-sm font-medium text-slate-300 group-hover:text-white transition-colors truncate">${nextItem.title}</span>
      </a>
      ` : `<div class="p-4 rounded-xl bg-[#0E121A]/20 border border-slate-900 text-xs text-slate-600 flex items-center justify-center">To jest ostatnie świadectwo w zbiorze</div>`}
    </div>

    <!-- Back to Hub -->
    <div class="mt-8 text-center">
      <a href="/swiadectwa" class="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 transition-all min-h-[44px]">
        <i class="fa-solid fa-arrow-left text-[#D4AF37]"></i>
        <span>Przejdź do katalogu wszystkich świadectw</span>
      </a>
    </div>
  </main>

  <!-- Footer -->
  <footer class="mt-16 border-t border-slate-800 bg-[#05070B] py-10 text-xs text-slate-500">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
      <div>
        <p class="font-cinzel text-slate-400 font-bold">Christian Culture Network (CCN) & Polskie Radio CC</p>
        <p class="mt-1 text-slate-600">Służba Bogu i człowiekowi zgodnie z Pismem Świętym. Wszelkie materiały bezpłatne.</p>
      </div>
      <div class="flex items-center gap-4 flex-wrap justify-center">
        <a href="/swiadectwa" class="hover:text-[#D4AF37] transition-colors">Świadectwa</a>
        <a href="/news" class="hover:text-[#D4AF37] transition-colors">CCN News</a>
        <a href="/akademia" class="hover:text-[#D4AF37] transition-colors">Akademia</a>
        <a href="/lumina" class="hover:text-[#D4AF37] transition-colors">LUMINA</a>
        <a href="/szukaj" class="hover:text-[#D4AF37] transition-colors">Szukaj</a>
      </div>
    </div>
  </footer>

  <script defer src="/components/cc-omni-search.js?v=20261017_discovery"></script>
  <script defer src="/js/cc-back-to-top.js?v=20261013_col2"></script>
  <script defer src="/js/cc-favorites.js?v=20261015_topbar1"></script>
</body>
</html>`;
}

// Generowanie strony głównej /swiadectwa
function renderHubPage(testimonies) {
  const canonicalUrl = "https://polskieradio.cc/swiadectwa";
  
  const cardsHtml = testimonies.map((t, idx) => {
    return `
      <div class="testimony-card group p-6 rounded-2xl bg-[#0E121A]/80 border border-slate-800/80 hover:border-[#D4AF37]/50 transition-all duration-300 flex flex-col justify-between shadow-xl hover:shadow-[#D4AF37]/10" data-category="${t.category.toLowerCase()}" data-author="${t.author.toLowerCase()}">
        <div>
          <!-- Thumbnail Image -->
          <a href="/swiadectwa/${t.slug}" class="block rounded-xl overflow-hidden mb-4 border border-slate-800 group-hover:border-[#D4AF37]/40 transition-colors focus:outline-none">
            <picture>
              <source srcset="/images/swiadectwa/${t.slug}.webp" type="image/webp" />
              <img src="/images/swiadectwa/${t.slug}.jpg" alt="${t.title.replace(/"/g, '&quot;')}" class="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500" width="600" height="338" loading="lazy" />
            </picture>
          </a>

          <div class="flex items-center justify-between gap-2 mb-3">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/25 font-cinzel">
              ${t.id} · ${t.type.toUpperCase()}
            </span>
            <span class="text-[11px] text-slate-500 font-mono">s. ${t.pages}</span>
          </div>

          <h3 class="text-lg font-cinzel font-bold text-white group-hover:text-[#D4AF37] transition-colors leading-snug mb-3">
            <a href="/swiadectwa/${t.slug}" class="focus:outline-none">
              ${t.title}
            </a>
          </h3>

          <p class="text-xs sm:text-sm text-slate-400 font-light leading-relaxed mb-4 line-clamp-3">
            „${t.lead}”
          </p>
        </div>

        <div class="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3 text-xs">
          <div class="flex items-center gap-2">
            <img src="${t.authorAvatar}" alt="${t.author}" class="w-6 h-6 rounded-full object-cover border border-slate-700" />
            <span class="text-slate-300 font-medium truncate max-w-[140px]">${t.author}</span>
          </div>
          <a href="/swiadectwa/${t.slug}" class="inline-flex items-center gap-1 font-semibold text-[#D4AF37] hover:text-[#F3E5AB] transition-colors min-h-[44px] items-center">
            <span>Czytaj</span>
            <span>→</span>
          </a>
        </div>
      </div>
    `;
  }).join('\n');

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${canonicalUrl}#collection`,
        "isPartOf": {
          "@type": "WebSite",
          "@id": "https://polskieradio.cc/#website",
          "name": "Christian Culture",
          "url": "https://polskieradio.cc/"
        },
        "name": "Świadectwa Wiary — Historie Przemiany Życia | Christian Culture",
        "description": "Zbiór 19 autentycznych świadectw wiary, nawrócenia i uwolnienia z książki „Pokonać Goliata” Cezarego Rogowskiego oraz nagrań wideo CCTV.",
        "url": canonicalUrl,
        "image": "https://polskieradio.cc/images/swiadectwa/hero-swiadectwa.jpg",
        "inLanguage": "pl-PL",
        "about": {
          "@type": "Book",
          "name": "Pokonać Goliata. Jak zwyciężać własne słabości",
          "author": {
            "@type": "Person",
            "name": "Cezary Rogowski"
          },
          "datePublished": "2026"
        },
        "hasPart": testimonies.map(t => ({
          "@type": "Article",
          "name": t.title,
          "url": `https://polskieradio.cc/swiadectwa/${t.slug}`,
          "image": `https://polskieradio.cc/images/swiadectwa/${t.slug}.jpg`,
          "author": { "@type": "Person", "name": t.author }
        }))
      }
    ]
  };

  return `<!doctype html>
<html lang="pl">
<head>
  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-Y4EFTVBPE3"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-Y4EFTVBPE3');
  </script>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  
  <title>Świadectwa Wiary — Prawdziwe Historie Przemiany Życia | Christian Culture</title>
  <meta name="description" content="Autentyczne świadectwa wiary, nawrócenia i uwolnienia z uzależnień z książki „Pokonać Goliata” Cezarego Rogowskiego. Prawdziwe historie Bożego ratunku, modlitwy i nowego życia." />
  <meta name="author" content="Cezary Rogowski" />
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
  <link rel="canonical" href="${canonicalUrl}" />
  <link rel="icon" type="image/png" href="/ccn-logo-square.png" />

  <!-- Open Graph -->
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Christian Culture" />
  <meta property="og:url" content="${canonicalUrl}" />
  <meta property="og:title" content="Świadectwa Wiary — Historie Przemiany Życia | Christian Culture" />
  <meta property="og:description" content="19 autentycznych świadectw wiary, nawrócenia i uwolnienia z uzależnień z książki „Pokonać Goliata” Cezarego Rogowskiego. Doświadczenie Bożej łaski w codziennym życiu." />
  <meta property="og:image" content="https://polskieradio.cc/images/swiadectwa/hero-swiadectwa.jpg" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="675" />
  <meta property="og:image:alt" content="Świadectwa Wiary — Pokonać Goliata" />
  <meta property="og:locale" content="pl_PL" />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:url" content="${canonicalUrl}" />
  <meta name="twitter:title" content="Świadectwa Wiary — Historie Przemiany Życia | Christian Culture" />
  <meta name="twitter:description" content="19 autentycznych świadectw wiary, nawrócenia i uwolnienia z uzależnień z książki „Pokonać Goliata” Cezarego Rogowskiego." />
  <meta name="twitter:image" content="https://polskieradio.cc/images/swiadectwa/hero-swiadectwa.jpg" />

  <!-- Fonts & Icons -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800;900&family=Outfit:wght@300;400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <script src="https://cdn.tailwindcss.com"></script>

  <style>
    :root {
      --gold-primary: #D4AF37;
      --gold-light: #F3E5AB;
      --gold-dark: #AA7C11;
      --bg-dark: #07090E;
    }
    body {
      background-color: var(--bg-dark);
      color: #E2E8F0;
      font-family: 'Outfit', sans-serif;
    }
    .font-cinzel { font-family: 'Cinzel', serif; }
  </style>

  <script type="application/ld+json">
${JSON.stringify(jsonLd, null, 2)}
  </script>
</head>

<body class="min-h-screen flex flex-col bg-[#07090E] text-slate-100 antialiased selection:bg-[#D4AF37]/30 selection:text-white">
  <!-- Top Navigation -->
  <header class="sticky top-0 z-50 backdrop-blur-md bg-[#07090E]/90 border-b border-[#D4AF37]/20">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
      <a href="/" class="flex items-center gap-3 group">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#8C6D1F] p-[1px] flex items-center justify-center shadow-lg shadow-[#D4AF37]/10 group-hover:shadow-[#D4AF37]/20 transition-all">
          <div class="w-full h-full bg-[#07090E] rounded-[11px] flex items-center justify-center">
            <span class="font-cinzel font-bold text-[#D4AF37] text-lg">CC</span>
          </div>
        </div>
        <div class="flex flex-col">
          <span class="font-cinzel font-bold tracking-wider text-sm sm:text-base text-white group-hover:text-[#D4AF37] transition-colors">CHRISTIAN CULTURE</span>
          <span class="text-[10px] tracking-widest text-[#D4AF37] uppercase font-semibold">Świadectwa Wiary</span>
        </div>
      </a>

      <div class="flex items-center gap-2 sm:gap-4">
        <a href="/swiadectwa-live.html" class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-red-950/40 text-red-400 border border-red-800/40 hover:bg-red-900/60 transition-all min-h-[44px]">
          <span class="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
          <span>CCTV LIVE 24</span>
        </a>
        <a href="/szukaj" class="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 hover:text-white transition-all min-h-[44px] min-w-[44px] flex items-center justify-center" title="Szukaj w ekosystemie">
          <i class="fa-solid fa-magnifying-glass text-sm"></i>
        </a>
      </div>
    </div>
  </header>

  <!-- Hero Section -->
  <section class="relative pt-12 pb-16 px-4 sm:px-6 border-b border-slate-800 overflow-hidden">
    <div class="absolute inset-0 bg-radial-gradient from-[#D4AF37]/10 via-transparent to-transparent pointer-events-none"></div>

    <div class="max-w-4xl mx-auto text-center relative z-10">
      <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 mb-6 font-cinzel">
        <i class="fa-solid fa-fire text-[#D4AF37]"></i>
        <span>MOC ŚWIADECTWA WIARY · APOKALIPSA 12:11</span>
      </div>

      <h1 class="text-3xl sm:text-4xl md:text-5xl font-cinzel font-extrabold text-white tracking-wide leading-tight mb-6">
        ŚWIADECTWA WIARY & BOŻEJ MOCY
      </h1>

      <p class="text-base sm:text-lg text-slate-300 font-light leading-relaxed max-w-2xl mx-auto mb-8">
        Zbiór 19 autentycznych historii przemiany życia, nawrócenia i uwolnienia z książki <strong>„Pokonać Goliata”</strong> Cezarego Rogowskiego. Odkryj, jak Bóg wkracza w ludzkie słabości, nałogi i tragedie, dając pełną wolność w Jezusie Chrystusie.
      </p>

      <div class="flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
        <a href="#katalog" class="px-6 py-3 rounded-xl bg-[#D4AF37] hover:bg-[#F3E5AB] text-black font-semibold text-sm shadow-lg shadow-[#D4AF37]/20 transition-all min-h-[48px] inline-flex items-center gap-2">
          <span>Przeglądaj 19 świadectw</span>
          <i class="fa-solid fa-arrow-down text-xs"></i>
        </a>
        <a href="/swiadectwa-live.html" class="px-6 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-medium text-sm border border-slate-700 transition-all min-h-[48px] inline-flex items-center gap-2">
          <i class="fa-solid fa-tv text-red-400"></i>
          <span>Oglądaj CCTV Świadectwa Live</span>
        </a>
      </div>

      <!-- Hero Graphic Banner -->
      <div class="mt-10 max-w-4xl mx-auto rounded-2xl overflow-hidden border border-[#D4AF37]/30 shadow-2xl shadow-black/80 bg-[#07090E]">
        <picture>
          <source srcset="/images/swiadectwa/hero-swiadectwa.webp" type="image/webp" />
          <img src="/images/swiadectwa/hero-swiadectwa.jpg" alt="Świadectwa Wiary — Pokonać Goliata — Christian Culture" class="w-full h-auto aspect-[16/9] object-cover" width="1200" height="675" fetchpriority="high" />
        </picture>
      </div>
    </div>
  </section>

  <!-- Book Banner -->
  <section class="max-w-6xl mx-auto px-4 sm:px-6 py-10 w-full">
    <div class="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#0E121A] to-[#141A26] border border-[#D4AF37]/30 flex flex-col md:flex-row items-center gap-6 justify-between shadow-2xl">
      <div class="flex items-center gap-5">
        <div class="w-16 h-20 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#8C6D1F] p-[2px] shadow-xl flex-shrink-0 flex items-center justify-center">
          <div class="w-full h-full bg-[#07090E] rounded-[6px] flex flex-col items-center justify-center p-1 text-center">
            <span class="text-[9px] font-cinzel text-[#D4AF37] uppercase font-bold">Książka</span>
            <span class="text-xs font-bold text-white">GOLIAT</span>
          </div>
        </div>
        <div>
          <span class="text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">Źródło świadectw</span>
          <h2 class="text-lg sm:text-xl font-cinzel font-bold text-white">Pokonać Goliata. Jak zwyciężać własne słabości</h2>
          <p class="text-xs sm:text-sm text-slate-400 mt-1">Autor: Cezary Rogowski · Nowe wydanie 2026 · 111 stron formacji duchowej i zwycięstwa</p>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <a href="/tablica" class="px-4 py-2.5 rounded-xl bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 text-[#D4AF37] border border-[#D4AF37]/40 text-xs font-semibold transition-all min-h-[44px] flex items-center gap-2">
          <span class="font-bold">L</span>
          <span>Dołącz do dyskusji na Tablicy LUMINA</span>
        </a>
      </div>
    </div>
  </section>

  <!-- Catalog Section -->
  <section id="katalog" class="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full flex-1">
    <div class="flex items-center justify-between gap-4 mb-8 flex-wrap">
      <div>
        <h2 class="text-2xl font-cinzel font-bold text-white">Katalog Świadectw (19 Historii)</h2>
        <p class="text-xs sm:text-sm text-slate-400 mt-1">Kliknij dowolną kartę, aby przeczytać pełną relację z Pismem Świętym.</p>
      </div>

      <div class="text-xs text-slate-400">
        Łącznie: <span class="font-bold text-[#D4AF37]">19 świadectw</span> pisanych + kanał wideo
      </div>
    </div>

    <!-- Grid of Testimonies -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      ${cardsHtml}
    </div>
  </section>

  <!-- Video Testimonies Section -->
  <section class="max-w-7xl mx-auto px-4 sm:px-6 py-12 w-full border-t border-slate-800 mt-12">
    <div class="flex items-center justify-between gap-4 mb-6 flex-wrap">
      <div>
        <div class="inline-flex items-center gap-1.5 text-xs text-red-400 font-semibold uppercase tracking-wider mb-2">
          <i class="fa-solid fa-video"></i>
          <span>Wideo & CCTV24</span>
        </div>
        <h2 class="text-2xl font-cinzel font-bold text-white">Świadectwa Wideo — O+ & Christian Culture TV</h2>
      </div>
      <a href="/swiadectwa-live.html" class="text-xs text-[#D4AF37] font-semibold hover:underline flex items-center gap-1">
        <span>Otwórz pełny kanał LIVE (16:9)</span>
        <span>→</span>
      </a>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="p-4 rounded-xl bg-[#0E121A]/60 border border-slate-800 flex flex-col justify-between">
        <div>
          <span class="text-[10px] text-red-400 font-semibold">YouTube CCTV</span>
          <h4 class="text-sm font-semibold text-white mt-1 mb-2">Nieuleczalna Choroba Pokonana Cudem!</h4>
          <p class="text-xs text-slate-400">Historia Agnieszki z Yorku o uzdrowieniu i odnalezieniu Boga.</p>
        </div>
        <a href="https://youtu.be/tGmHYArka0k" target="_blank" rel="noopener" class="mt-4 text-xs font-semibold text-[#D4AF37] hover:underline flex items-center gap-1">
          <span>Oglądaj nagranie</span>
          <i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
        </a>
      </div>

      <div class="p-4 rounded-xl bg-[#0E121A]/60 border border-slate-800 flex flex-col justify-between">
        <div>
          <span class="text-[10px] text-red-400 font-semibold">YouTube CCTV</span>
          <h4 class="text-sm font-semibold text-white mt-1 mb-2">Pokochałem alkohol, ale Jezus mnie uwolnił</h4>
          <p class="text-xs text-slate-400">Świadectwo Dominika o wyjściu z głębokiego nałogu alkoholowego.</p>
        </div>
        <a href="https://youtu.be/pz5dM_Aq9SQ" target="_blank" rel="noopener" class="mt-4 text-xs font-semibold text-[#D4AF37] hover:underline flex items-center gap-1">
          <span>Oglądaj nagranie</span>
          <i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
        </a>
      </div>

      <div class="p-4 rounded-xl bg-[#0E121A]/60 border border-slate-800 flex flex-col justify-between">
        <div>
          <span class="text-[10px] text-red-400 font-semibold">YouTube CCTV</span>
          <h4 class="text-sm font-semibold text-white mt-1 mb-2">Świadectwo nawrócenia Roberta</h4>
          <p class="text-xs text-slate-400">Z więzienia do nowego życia z Bogiem — poruszająca opowieść.</p>
        </div>
        <a href="https://youtu.be/90h-jZq_tUo" target="_blank" rel="noopener" class="mt-4 text-xs font-semibold text-[#D4AF37] hover:underline flex items-center gap-1">
          <span>Oglądaj nagranie</span>
          <i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
        </a>
      </div>

      <div class="p-4 rounded-xl bg-[#0E121A]/60 border border-slate-800 flex flex-col justify-between">
        <div>
          <span class="text-[10px] text-red-400 font-semibold">YouTube CCTV</span>
          <h4 class="text-sm font-semibold text-white mt-1 mb-2">Grzegorz Gzik — Uwolnienie</h4>
          <p class="text-xs text-slate-400">Narkotyki, alkohol, więzienie i osobiste spotkanie z Jezusem.</p>
        </div>
        <a href="https://youtu.be/tB0MkRS5W9o" target="_blank" rel="noopener" class="mt-4 text-xs font-semibold text-[#D4AF37] hover:underline flex items-center gap-1">
          <span>Oglądaj nagranie</span>
          <i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
        </a>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="mt-auto border-t border-slate-800 bg-[#05070B] py-10 text-xs text-slate-500">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
      <div>
        <p class="font-cinzel text-slate-400 font-bold">Christian Culture Network (CCN) & Polskie Radio CC</p>
        <p class="mt-1 text-slate-600">Służba Bogu i człowiekowi zgodnie z Pismem Świętym. Wszelkie materiały bezpłatne.</p>
      </div>
      <div class="flex items-center gap-4 flex-wrap justify-center">
        <a href="/swiadectwa" class="hover:text-[#D4AF37] transition-colors">Świadectwa</a>
        <a href="/news" class="hover:text-[#D4AF37] transition-colors">CCN News</a>
        <a href="/akademia" class="hover:text-[#D4AF37] transition-colors">Akademia</a>
        <a href="/lumina" class="hover:text-[#D4AF37] transition-colors">LUMINA</a>
        <a href="/szukaj" class="hover:text-[#D4AF37] transition-colors">Szukaj</a>
      </div>
    </div>
  </footer>

  <script defer src="/components/cc-omni-search.js?v=20261017_discovery"></script>
  <script defer src="/js/cc-back-to-top.js?v=20261013_col2"></script>
  <script defer src="/js/cc-favorites.js?v=20261015_topbar1"></script>
</body>
</html>`;
}

// Główna funkcja wykonawcza
export async function generateAll() {
  console.log('🚀 Rozpoczynam generowanie sekcji Świadectw Wiary (/swiadectwa)...');

  const swiadectwaDir = path.join(ROOT, 'swiadectwa');
  fs.mkdirSync(swiadectwaDir, { recursive: true });

  // 1. Generuj 19 podstron indywidualnych
  for (let i = 0; i < TESTIMONIES.length; i++) {
    const item = TESTIMONIES[i];
    const prevItem = i > 0 ? TESTIMONIES[i - 1] : null;
    const nextItem = i < TESTIMONIES.length - 1 ? TESTIMONIES[i + 1] : null;

    const html = renderTestimonyPage(item, prevItem, nextItem);

    // Zapis w dwóch wariantach routingu Clean URL:
    // a) swiadectwa/slug.html
    const file1 = path.join(swiadectwaDir, `${item.slug}.html`);
    fs.writeFileSync(file1, html, 'utf8');

    // b) swiadectwa/slug/index.html
    const subDir = path.join(swiadectwaDir, item.slug);
    fs.mkdirSync(subDir, { recursive: true });
    const file2 = path.join(subDir, 'index.html');
    fs.writeFileSync(file2, html, 'utf8');

    console.log(`✅ [${item.id}] Wygenerowano: /swiadectwa/${item.slug}`);
  }

  // 2. Generuj stronę główną katalogu /swiadectwa
  const hubHtml = renderHubPage(TESTIMONIES);
  fs.writeFileSync(path.join(ROOT, 'swiadectwa.html'), hubHtml, 'utf8');
  fs.writeFileSync(path.join(swiadectwaDir, 'index.html'), hubHtml, 'utf8');
  console.log(`✅ Wygenerowano stronę główną: /swiadectwa oraz /swiadectwa.html`);

  // 3. Generuj sitemap dedykowany sitemaps/swiadectwa.xml z tagami obrazów dla Google Images
  const sitemapEntries = [
    {
      loc: 'https://polskieradio.cc/swiadectwa',
      priority: '0.9',
      changefreq: 'daily',
      image: 'https://polskieradio.cc/images/swiadectwa/hero-swiadectwa.jpg',
      imageTitle: 'Świadectwa Wiary & Bożej Mocy — Pokonać Goliata'
    },
    ...TESTIMONIES.map(t => ({
      loc: `https://polskieradio.cc/swiadectwa/${t.slug}`,
      priority: '0.8',
      changefreq: 'weekly',
      image: `https://polskieradio.cc/images/swiadectwa/${t.slug}.jpg`,
      imageTitle: t.title
    }))
  ];

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${sitemapEntries.map(e => `  <url>
    <loc>${e.loc}</loc>
    <lastmod>2026-10-20</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
    <image:image>
      <image:loc>${e.image}</image:loc>
      <image:title>${e.imageTitle.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')}</image:title>
    </image:image>
  </url>`).join('\n')}
</urlset>`;

  const sitemapPath = path.join(ROOT, 'sitemaps', 'swiadectwa.xml');
  fs.writeFileSync(sitemapPath, sitemapXml, 'utf8');
  console.log(`✅ Zapisano sitemap ze znacznikami grafik: sitemaps/swiadectwa.xml (${sitemapEntries.length} URL-i)`);

  // 4. Dopisz sitemaps/swiadectwa.xml do sitemap.xml jeśli brak
  const rootSitemapPath = path.join(ROOT, 'sitemap.xml');
  if (fs.existsSync(rootSitemapPath)) {
    let rootSitemap = fs.readFileSync(rootSitemapPath, 'utf8');
    if (!rootSitemap.includes('https://polskieradio.cc/swiadectwa')) {
      const entryXml = `  <!-- Świadectwa Wiary — Pokonać Goliata -->
  <url>
    <loc>https://polskieradio.cc/swiadectwa</loc>
    <lastmod>2026-10-20</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
    <image:image>
      <image:loc>https://polskieradio.cc/images/swiadectwa/hero-swiadectwa.jpg</image:loc>
      <image:title>Świadectwa Wiary &amp; Bożej Mocy — Pokonać Goliata</image:title>
    </image:image>
  </url>\n`;
      rootSitemap = rootSitemap.replace('</urlset>', `${entryXml}</urlset>`);
      fs.writeFileSync(rootSitemapPath, rootSitemap, 'utf8');
      console.log(`✅ Zaktualizowano sitemap.xml o /swiadectwa`);
    }
  }

  // 5. Aktualizacja _redirects:
  // /swiadectwa -> /swiadectwa/index.html 200
  // /swiadectwa-live -> /swiadectwa-live.html 200
  const redirectsPath = path.join(ROOT, '_redirects');
  if (fs.existsSync(redirectsPath)) {
    let redirects = fs.readFileSync(redirectsPath, 'utf8');
    redirects = redirects.replace(/^\/swiadectwa\s+\/swiadectwa-live\.html\s+200\r?\n/m, '');
    redirects = redirects.replace(/^\/swiadectwa\s+\/swiadectwa-live\s+200\r?\n/m, '');
    redirects = redirects.replace(/^\/swiadectwa\s+\/misje\s+301\r?\n/m, '');

    const swiadectwaRules = `\n# === ŚWIADECTWA WIARY CC ===\n/swiadectwa /swiadectwa/index.html 200\n/swiadectwa/ /swiadectwa/index.html 200\n/swiadectwa-live /swiadectwa-live.html 200\n/swiadectwa-live/ /swiadectwa-live.html 200\n`;
    if (!redirects.includes('/swiadectwa /swiadectwa/index.html 200')) {
      redirects = swiadectwaRules + redirects;
      fs.writeFileSync(redirectsPath, redirects, 'utf8');
      console.log(`✅ Zaktualizowano _redirects o reguły dla /swiadectwa i /swiadectwa-live`);
    }
  }

  // 6. Aktualizacja indeksu wyszukiwarki: data/cc-search-index.json oraz szukaj/catalog.json
  const searchIndexPaths = [
    path.join(ROOT, 'data/cc-search-index.json'),
    path.join(ROOT, 'szukaj/catalog.json')
  ];

  const searchEntries = [
    {
      title: "Świadectwa Wiary — Prawdziwe Historie Przemiany Życia | Christian Culture",
      url: "https://polskieradio.cc/swiadectwa",
      category: "Biblia i formacja",
      description: "Zbiór 19 autentycznych świadectw wiary, nawrócenia i uwolnienia z uzależnień z książki „Pokonać Goliata” Cezarego Rogowskiego oraz nagrań wideo CCTV.",
      tags: ["świadectwa", "świadectwa wiary", "pokonać goliata", "nawrócenie", "uwolnienie", "cuda", "świadectwo", "cezary rogowski"],
      image: "/images/swiadectwa/hero-swiadectwa.webp",
      featured: true
    },
    ...TESTIMONIES.map(t => ({
      title: `${t.title} (${t.id})`,
      url: `https://polskieradio.cc/swiadectwa/${t.slug}`,
      category: "Biblia i formacja",
      description: `${t.lead} — Świadectwo z książki „Pokonać Goliata” Cezarego Rogowskiego (s. ${t.pages}).`,
      tags: [...t.tags, "świadectwo", "świadectwa", "pokonać goliata", t.author.toLowerCase(), t.id.toLowerCase()],
      image: `/images/swiadectwa/${t.slug}.webp`,
      featured: false
    }))
  ];

  const commonTimestamp = new Date().toISOString();
  let baseData = null;
  const primaryPath = searchIndexPaths[0];
  if (fs.existsSync(primaryPath)) {
    baseData = JSON.parse(fs.readFileSync(primaryPath, 'utf8'));
    const existingUrls = new Set(baseData.items.map(i => i.url));
    let added = 0;
    for (const item of searchEntries) {
      const existing = baseData.items.find(i => i.url === item.url);
      if (existing) {
        existing.image = item.image;
        existing.description = item.description;
        existing.tags = item.tags;
      } else {
        baseData.items.push(item);
        existingUrls.add(item.url);
        added++;
      }
    }
    baseData.totalItems = baseData.items.length;
    baseData.updatedAt = commonTimestamp;
    
    const serialized = JSON.stringify(baseData, null, 2);
    for (const p of searchIndexPaths) {
      fs.writeFileSync(p, serialized, 'utf8');
      console.log(`✅ Zaktualizowano indeks wyszukiwarki: ${path.basename(p)} (+${added} nowych, zaktualizowano grafiki, łącznie: ${baseData.totalItems})`);
    }
  }

  // 7. Synchronizacja do lustra LUMINA
  const mirrorSwiadectwaDir = 'C:\\Users\\czark\\Desktop\\@ICC\\LUMINA\\swiadectwa';
  const mirrorImagesDir = 'C:\\Users\\czark\\Desktop\\@ICC\\LUMINA\\images\\swiadectwa';
  try {
    fs.mkdirSync(mirrorSwiadectwaDir, { recursive: true });
    fs.mkdirSync(mirrorImagesDir, { recursive: true });
    
    // Kopiuj grafiki świadectw do lustra
    const localImagesDir = path.join(ROOT, 'images', 'swiadectwa');
    if (fs.existsSync(localImagesDir)) {
      const imgFiles = fs.readdirSync(localImagesDir);
      for (const imgFile of imgFiles) {
        fs.copyFileSync(path.join(localImagesDir, imgFile), path.join(mirrorImagesDir, imgFile));
      }
      console.log(`✨ Skopiowano ${imgFiles.length} grafik do lustra LUMINA/images/swiadectwa/`);
    }

    fs.copyFileSync(path.join(ROOT, 'swiadectwa.html'), 'C:\\Users\\czark\\Desktop\\@ICC\\LUMINA\\swiadectwa.html');
    fs.copyFileSync(path.join(swiadectwaDir, 'index.html'), path.join(mirrorSwiadectwaDir, 'index.html'));
    for (const item of TESTIMONIES) {
      fs.copyFileSync(path.join(swiadectwaDir, `${item.slug}.html`), path.join(mirrorSwiadectwaDir, `${item.slug}.html`));
      const mSub = path.join(mirrorSwiadectwaDir, item.slug);
      fs.mkdirSync(mSub, { recursive: true });
      fs.copyFileSync(path.join(swiadectwaDir, item.slug, 'index.html'), path.join(mSub, 'index.html'));
    }
    fs.copyFileSync(path.join(ROOT, 'sitemaps', 'swiadectwa.xml'), 'C:\\Users\\czark\\Desktop\\@ICC\\LUMINA\\sitemaps\\swiadectwa.xml');
    fs.copyFileSync(path.join(ROOT, 'data/cc-search-index.json'), 'C:\\Users\\czark\\Desktop\\@ICC\\LUMINA\\data/cc-search-index.json');
    fs.copyFileSync(path.join(ROOT, 'szukaj/catalog.json'), 'C:\\Users\\czark\\Desktop\\@ICC\\LUMINA\\szukaj/catalog.json');
    fs.copyFileSync(path.join(ROOT, '_redirects'), 'C:\\Users\\czark\\Desktop\\@ICC\\LUMINA\\_redirects');
    console.log(`✨ Zsynchronizowano wszystkie pliki świadectw i grafiki do lustra LUMINA.`);
  } catch (errMirror) {
    console.warn(`⚠️ Ostrzeżenie przy synchronizacji do lustra LUMINA:`, errMirror.message);
  }

  console.log('🎉 Kompletne generowanie i publikacja sekcji Świadectw zakończone sukcesem!');
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  await generateAll();
}
