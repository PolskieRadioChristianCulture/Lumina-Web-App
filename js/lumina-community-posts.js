/**
 * ══════════════════════════════════════════════════════════════════════════
 * LUMINA COMMUNITY POSTS - IMMUTABLE PERMANENT POSTS REPOSITORY & SAFETY SHIELD
 * Centralny, zabezpieczony rejestr wszystkich wpisów społeczności LUMINA
 * Zapewnia 100% odporność na utratę treści i awarie skryptów.
 * ══════════════════════════════════════════════════════════════════════════
 */

(function(global) {
    'use strict';

    function safeFormatTimestamp(dateOrString, fallback) {
        if (!dateOrString) return fallback || 'Przed chwilą';
        try {
            let d;
            if (typeof dateOrString === 'object' && dateOrString instanceof Date) {
                d = dateOrString;
            } else if (typeof dateOrString === 'number') {
                d = new Date(dateOrString);
            } else if (typeof dateOrString === 'string') {
                const parsed = Date.parse(dateOrString);
                if (!isNaN(parsed) && (dateOrString.includes('-') || dateOrString.includes('T') || dateOrString.includes(':'))) {
                    d = new Date(parsed);
                } else {
                    return dateOrString;
                }
            } else {
                return fallback || 'Przed chwilą';
            }

            const now = new Date();
            const diffMs = now - d;
            const diffMin = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMin / 60);
            const pad = (n) => n < 10 ? '0' + n : n;
            const timeStr = `${pad(d.getHours())}:${pad(d.getMinutes())}`;

            if (diffMin < 60) return `${Math.max(1, diffMin)} min temu`;
            if (now.toDateString() === d.toDateString()) return `Dzisiaj o ${timeStr}`;

            const yesterday = new Date(now);
            yesterday.setDate(now.getDate() - 1);
            if (yesterday.toDateString() === d.toDateString()) return `Wczoraj o ${timeStr}`;

            return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}, ${timeStr}`;
        } catch(e) {
            return fallback || 'Przed chwilą';
        }
    }

    const LUMINA_CORE_POSTS_DATA = [
        {
            id: 'post_dzj_2026_08_26',
            type: 'post',
            author: 'Cezary Rogowski',
            authorRole: '☀️ Dobrze, że jesteś • Założyciel Christian Culture ✨',
            authorAvatar: 'avatar_cezary_official.jpg',
            authorSlug: 'cezaryrgowski',
            time: '26 Sierpnia 2026 • ☀️ Dobrze, że jesteś',
            title: '☀️ Lato z Jezusem — Wielkie Pytania (Dzień 26)',
            text: `☀️ **Lato z Jezusem — Wielkie Pytania**
**Dzień 26 — 31 bardzo osobistych pytań Syna/Córki do Ojca: Dlaczego tak łatwo ulegam lękowi przed odrzuceniem mojej wizji i marzeń?**

W dwudziestym szóstym dniu cyklu „Lato z Jezusem — Wielkie Pytania” rozbrajamy mechanizm lęku przed odrzuceniem naszych planów, celów i wizji przez niezrozumiejące otoczenie.

W psychologii twórczości zjawisko „lęku przed krytyką społeczną” opisuje barierę, w której jednostka rezygnuje ze swoich innowacyjnych pomysłów i marzeń pod wpływem presji otoczenia oczekującego konformizmu. Wróg bezwzględnie żeruje na tym lęku na duchowym froncie. Słowo Boże przypomina nam historię Józefa, którego wizje zostały wyśmiane przez najbliższych, a mimo to stały się narzędziem wielkiego ocalenia. Chrześcijański lider najwyższej klasy nie buduje swojego napędu na ludzkich oklaskach – realizuje Bożą wizję z nienaganną klasą, odwagą i profesjonalizmem, niezależnie od opinii tłumu.

**Jezus mówi dziś do Ciebie:**
„Kiedy opowiedział to ojcu i braciom, ojciec skarcił go i rzekł mu: 'Co to za sen, który śniłeś?...'” *(Księga Rodzaju 37,10)*

**Zadanie Taktyczne:**
Zmiażdż dziś lęk przed odrzuceniem Twoich planów na swoim polu bitwy. Jeśli Twoje projekty spotykają się z oporem lub brakiem wiary ze strony innych, nie trać determinacji. Skup się na precyzyjnym wykonaniu zadań i oddaj wynik Bogu. Wnieś do swojej firmy i domu standard odwagi, stabilności i dojrzałego autorytetu.

W Christian Culture aplikacje i portale są zawsze BEZPŁATNE.

**Modlitwa Bojowa:**
„Ojcze, odrzucam kłamstwa nieprzyjaciela i lęk przed odrzuceniem moich marzeń. Przepraszam, że wątpiłem z powodu ludzkiej krytyki. Dziękuję, że Twoje powołanie jest dla mnie prawem. Daj mi odwagę, rygor i wyrazisty charakter, bym z nienaganną klasą budował to, co mi powierzyłeś, zdobywając ten świat dla Twojej chwały.”

Baza i wzrost: https://chat.whatsapp.com/DBTRDxQWamZDWaOkjupSt0 – Wejdź do zespołu ludzi z pasją!

PODAJ DALEJ 🔴
www.polskieradio.cc | www.cclite.pl`,
            image: 'promo_dzj.jpg',
            likes: 88,
            amen: 82
        },
        {
            id: 'post_ckd_2026_08_25',
            type: 'post',
            author: 'Andrzej Thiel',
            authorRole: 'Opracowuje Rozważania „Cuda Każdego Dnia” ✨ • Sieradz',
            authorAvatar: 'avatar_andrzej_thiel.jpg',
            authorSlug: 'andrzejthiel',
            time: '25 Sierpnia 2026 • 📖 Cuda Każdego Dnia (Dzisiaj)',
            title: 'MODLITWA JEST NAJPOTĘŻNIEJSZĄ BRONIĄ! • Cuda Każdego Dnia ✨',
            text: `CUDA KAŻDEGO DNIA! 
25 SIERPNIA 2026.
Przeczytaj i zobacz jak Bóg przemienia twoje życie.

MODLITWA JEST NAJPOTĘŻNIEJSZĄ BRONIĄ!

W mediach dużo ostatnio mówi się o broni, o skutecznych sposobach walki i obrony. Tuż obok naszych granic trwa wojna, w której obie strony nieustannie pracują nad coraz nowszymi wynalazkami, które mają przeważyć szalę zwycięstwa. Systemy ochrony powietrznej, rakiety dalekiego zasięgu, drony itp. umożliwiają ochronę przed atakami, ale też precyzyjne niszczenie celów. Czy wiesz, że trwa znacznie ważniejsza, choć niewidoczna dla naszych oczu wojna? W której chodzi nie tylko o twoje doczesne życie, ale i to wieczne?

Pisze o tym Apostoł Paweł: „Nie walczymy przeciwko ludziom…, ale złym władcom niewidzialnego świata, potężnym siłom demonicznym i złym książętom ciemności rządzącymi tym światem…” (Ef.6,12). Powiesz: „To koniec ze mną”, „jestem za słaby”, „nie mam czym walczyć”. Bóg nie zostawił cię bezbronnym. Masz najbardziej skuteczną broń, która nie tylko cię ochroni, ale i dzięki której będziesz mógł skutecznie niszczyć diabelskie twierdze: „Gdyż oręż nasz, którym walczymy, nie jest cielesny, lecz ma moc burzenia warowni dla sprawy Bożej” (2 Kor. 10,4).

W co w takim razie Bóg ciebie i mnie wyposażył, byśmy nie zginęli na tej wojnie, a raczej zwyciężali? Dał nam swoje Słowo, które jest mieczem (zob. Ef.6,17) i przywilej modlitwy. Modlitwa jest najpotężniejszą bronią chrześcijan. Jej moc nie pochodzi od człowieka ani nie opiera się na ludzkich siłach, ale na Bogu, który ma wszelką władzę, mądrość i miłość. On czeka byś zaczął się modlić, bo wtedy masz wpływ na to co Bóg robi w tym świecie, ale też w tobie. Bardzo prawdziwe jest to, co odkryła między innymi Matka Teresa: “Kiedyś myślałam, że modlitwa zmienia świat wokół nas. Dziś wiem, że najpierw zmienia nas samych, a potem to my zmieniamy świat”.

Tak, Bóg często zaczyna swoje działanie od przemiany naszego serca, postawy i sposobu patrzenia. Kiedy zwalniamy i rozmawiamy z Bogiem, On może pokazać nam kto najbardziej potrzebuje miłości i jak możemy na tę potrzebę odpowiedzieć. Bądź otwarty dzisiaj na Jego impulsy. Módl się nieustannie, od chwili, kiedy się budzisz do momentu, kiedy idziesz spać. Módl się z wiarą i oczekuj, że Bóg będzie działał.

„Ojcze, wierzę, że Ty działasz, nawet kiedy tego nie widzę. Wierze, że modląc się burzę warownie wroga, które pobudował w moim sercu, moim umyśle. Niech moc Twojego Ducha działa we mnie i w życiu moich bliskich. Z Tobą mogę żyć zwycięsko!”.
/opr. na podst. wiad. B.K./.

Dziękuję, że jesteś! ❤️`,
            image: 'cuda_kazdego_dnia_25_sierpnia_2026.jpg',
            likes: 265,
            amen: 238
        },
        {
            id: 'post_dzj_2026_08_25',
            type: 'post',
            author: 'Cezary Rogowski',
            authorRole: '☀️ Dobrze, że jesteś • Założyciel Christian Culture ✨',
            authorAvatar: 'avatar_cezary_official.jpg',
            authorSlug: 'cezaryrgowski',
            time: '25 Sierpnia 2026 • ☀️ Dobrze, że jesteś',
            title: '☀️ Lato z Jezusem — Wielkie Pytania (Dzień 25)',
            text: `☀️ **Lato z Jezusem — Wielkie Pytania**
**Dzień 25 — 31 bardzo osobistych pytań Syna/Córki do Ojca: Dlaczego tak często ulegam lękowi przed utratą zdrowia i kruchością ciała?**

W dwudziestym piątym dniu cyklu „Lato z Jezusem — Wielkie Pytania” rozbrajamy mechanizm lęku przed chorobą, fizyczną słabością i przemijaniem.

W psychologii zdrowia zjawisko „lęku somatycznego i hipochondrii stresowej” opisuje stan, w którym obawa o utratę zdrowia paraliżuje codzienne funkcjonowanie i odbiera radość życia. Wróg bezwzględnie wykorzystuje tę wrażliwość, wpędzając nas w przewlekły stres. Słowo Boże przez świadectwo Pawła uderza w tę słabość: „Moc bowiem w słabości się doskonali”. Chrześcijański lider najwyższej klasy dba o swój organizm, ale nie panikuje wobec jego kruchości — powierza swoje życie Bogu z nienaganną, królewską klasą i wewnętrznym spokojem.

**Jezus mówi dziś do Ciebie:**
„Wystarczy ci mojej łaski; moc bowiem w słabości się doskonali.” *(2 Koryntian 12,9)*

**Zadanie Taktyczne:**
Zmiażdż dziś lęk o zdrowie i obsesyjne myśli o fizycznej kruchości na swoim polu bitwy. Zadbaj o siebie racjonalnie, ale oddaj niepokój o jutro w ręce Ojca. Wnieś do swojego domu i środowiska standard niezachwianego pokoju i ufności.

W Christian Culture aplikacje i portale są zawsze BEZPŁATNE.

**Modlitwa Bojowa:**
„Ojcze, odrzucam kłamstwa nieprzyjaciela i lęk przed chorobą. Przepraszam, że traciłem pokój z powodu kruchości mojego ciała. Dziękuję, że Twoja łaska podtrzymuje mnie w każdym stanie. Daj mi odwagę, rygor i wyrazisty charakter, bym z nienaganną klasą i spokojem ufał Twojej opiece, zdobywając ten świat dla Twojej chwały.”

Baza i wzrost: https://chat.whatsapp.com/DBTRDxQWamZDWaOkjupSt0 – Wejdź do zespołu ludzi z pasją!

PODAJ DALEJ 🔴
www.polskieradio.cc | www.cclite.pl`,
            image: 'promo_dzj.jpg',
            likes: 82,
            amen: 76
        },
        {
            id: 'post_ckd_2026_08_24',
            type: 'post',
            author: 'Andrzej Thiel',
            authorRole: 'Opracowuje Rozważania „Cuda Każdego Dnia” ✨ • Sieradz',
            authorAvatar: 'avatar_andrzej_thiel.jpg',
            authorSlug: 'andrzejthiel',
            time: '24 Sierpnia 2026 • 📖 Cuda Każdego Dnia (Dzisiaj)',
            title: 'KIEDY BRAKUJE SŁÓW! • Cuda Każdego Dnia ✨',
            text: `CUDA KAŻDEGO DNIA! 
24 SIERPNIA 2026.
Przeczytaj i zobacz jak Bóg przemienia twoje życie.

KIEDY BRAKUJE SŁÓW!

Znaleźliście się kiedyś w sytuacji, w której zabrakło wam słów? Pewnie niejeden raz, prawda? Tak bywa w chwilach ogromnego wzruszenia, radości, gdy spełnia się marzenie, na które czekaliśmy całe życie, czy gdy próbujemy wyrazić wdzięczność za czyjeś poświecenie. Ale też w chwilach ogromnego smutku, kiedy lekarz mówi „to nowotwór”, gdy tracimy kogoś bliskiego, gdy cierpimy fizycznie. W takich chwilach nasza modlitwa też często bywa ograniczona do kilku słów: „Panie kocham Cię!”, „Dziękuję!”, „Panie pomóż!”, „Panie, zmiłuj się”. I wiesz, twój Ojciec w niebie wie o tym i wcale nie oczekuje wielu słów. Jezus powiedział: „…wasz Ojciec wie, czego potrzebujecie, zanim Go poprosicie” (Mt.6,8).

Co więcej, kiedy nie macie siły wołać, doświadczacie bólu, wylaliście już wszystkie łzy lub po prostu czujecie się zagubieni i zdezorientowani, Bóg słyszy was nawet jeśli nie wydajecie głosu. On słyszy wasze serce, a Jego Duch jest przy was i wspiera was. Czytamy: „Podobnie i Duch wspiera nas w niemocy naszej; nie wiemy bowiem, o co się modlić, jak należy, ale sam Duch wstawia się za nami w niewysłowionych westchnieniach” (Rz.8,26).

Masz Ojca, który cię nie zostawi nigdy. On się troszczy o ciebie. On chce cię podnieść, zabrać twoje ciężary, twoją chorobę i przynieść uleczenie ducha, duszy i ciała. On mówi do ciebie dzisiaj: „Znam cię. Wiem, kiedy siedzisz i kiedy wstajesz. I jeszcze nie ma słowa na twoim języku żebym Ja go już nie znał (Ps.139,3-4). A jednak pragnę słyszeć wasz głos. Cieszę się, kiedy mówicie do mnie, tak jak kochający rodzic cieszy się słysząc głos swojego dziecka. Co chcielibyście abym uczynił dla was dzisiaj?”

Życzę wam, byście doświadczyli dzisiaj Jego cudownej obecności. Dotyku Jego silnych, pełnych miłości ramion, w których znajdziecie pocieszenie, podniesienie, nadzieję i siłę do kolejnego dnia.

/opr. na podst. wiad. B.K./.

Dziękuję, że jesteś! ❤️`,
            image: 'cuda_kazdego_dnia_24_sierpnia_2026.jpg',
            likes: 248,
            amen: 214
        },
        {
            id: 'post_dzj_2026_08_24',
            type: 'post',
            author: 'Cezary Rogowski',
            authorRole: '☀️ Dobrze, że jesteś • Założyciel Christian Culture ✨',
            authorAvatar: 'avatar_cezary_official.jpg',
            authorSlug: 'cezaryrgowski',
            time: '24 Sierpnia 2026 • ☀️ Dobrze, że jesteś',
            title: '☀️ Lato z Jezusem — Wielkie Pytania (Dzień 24)',
            text: `☀️ **Lato z Jezusem — Wielkie Pytania**
**Dzień 24 — 31 bardzo osobistych pytań Syna/Córki do Ojca: Dlaczego tak często ulegam lękowi przed oceną mojej przeszłości przez innych?**

W dwudziestym czwartym dniu cyklu „Lato z Jezusem — Wielkie Pytania” rozbrajamy mechanizm wstydu, lęku przed ludzką oceną oraz paraliżu związanego z dawnymi błędami.

W psychologii klinicznej zjawisko „lęku przed zdemaskowaniem” (imposter syndrome) opisuje stan, w którym człowiek żyje w ciągłym napięciu, obawiając się, że jego dawna niedoskonałość wyjdzie na jaw i zniszczy jego obecną pozycję. Wróg bezwzględnie żeruje na tym lęku na duchowym froncie. Słowo Boże przez świadectwo Apostoła Pawła uderza w tę iluzję: Paweł otwarcie przyznaje się do swojej trudnej przeszłości, czyniąc z niej świadectwo przemieniającej mocy Boga. Chrześcijański lider najwyższej klasy nie buduje swojego wizerunku na fałszywej bezbłędności — jego siłą jest autentyczne świadectwo łaski, realizowane z nienaganną, królewską klasą i odwagą.

**Jezus mówi dziś do Ciebie:**
„Ale dostąpiłem miłosierdzia, aby Jezus Chrystus na mnie pierwszym pokazał całą wielkoduszność jako przykład dla tych, którzy w Niego uwierzą...” *(1 Tymoteusza 1,16)*

**Zadanie Taktyczne:**
Zmiażdż dziś lęk przed osądem otoczenia na swoim polu bitwy. Przestań ukrywać swoją historię z lęku przed krytyką. Podejmij obowiązki nowego tygodnia z chirurgiczną precyzją, zdejmując z serca wszelki wstyd. Wnieś do swojej firmy i domu standard wolności, prawdy i niezachwianego autorytetu.

W Christian Culture aplikacje i portale są zawsze BEZPŁATNE.

**Modlitwa Bojowa:**
„Ojcze, odrzucam kłamstwa nieprzyjaciela i paraliżujący wstyd z powodu mojej przeszłości. Przepraszam, że lękałem się ludzkiego sądu. Dziękuję, że Twoje miłosierdzie całkowicie mnie odnowiło. Daj mi odwagę, rygor i wyrazisty charakter, bym z nienaganną klasą i dumą świadczył o Twojej łasce, zdobywając ten świat dla Twojej chwały.”

Baza i wzrost: https://chat.whatsapp.com/DBTRDxQWamZDWaOkjupSt0 – Wejdź do zespołu ludzi z pasją!

PODAJ DALEJ 🔴
www.polskieradio.cc | www.cclite.pl`,
            image: 'promo_dzj.jpg',
            likes: 74,
            amen: 68
        },
        {
            id: 'post_dzj_2026_08_23',
            type: 'post',
            author: 'Cezary Rogowski',
            authorRole: '☀️ Dobrze, że jesteś • Założyciel Christian Culture ✨',
            authorAvatar: 'avatar_cezary_official.jpg',
            authorSlug: 'cezaryrgowski',
            time: '23 Sierpnia 2026 • ☀️ Dobrze, że jesteś',
            title: '☀️ Lato z Jezusem — Wielkie Pytania (Dzień 23)',
            text: `☀️ **Lato z Jezusem — Wielkie Pytania**
**Dzień 23 — 31 bardzo osobistych pytań Syna/Córki do Ojca: Dlaczego tak łatwo ulegam lękowi przed utratą moich ludzi i zasobów?**

W dwudziestym trzecim dniu cyklu „Lato z Jezusem — Wielkie Pytania" rozbrajamy lęk przed zmianą, odejściem współpracowników oraz kurczeniem się dotychczasowych zasobów.

W psychologii zmiany pojęcie „awersji do straty" (loss aversion) opisuje mechanizm, w którym człowiek odczuwa ból straty znacznie silniej niż radość z nowego zysku, co prowadzi do obsesyjnego kurczowego trzymania się starych struktur. Wróg bezwzględnie żeruje na tym lęku na duchowym froncie. Słowo Ewangelii uderza w ten opór poprzez słowa Jezusa: „Pożyteczne jest dla was, abym Ja odszedł". Chrześcijański lider najwyższej klasy nie buduje swojego bezpieczeństwa na ludzkim monopolu – potrafi pożegnać odchodzących z nienaganną klasą i otworzyć się na nowe, potężniejsze prowadzenie Boga.

**Jezus mówi dziś do Ciebie:**
„Lecz mówię wam prawdę: Pożyteczne jest dla was, abym Ja odszedł..." *(Jana 16,7)*

**Zadanie Taktyczne:**
Zmiażdż dziś lęk przed utratą ludzi lub zasobów na swoim polu bitwy. Przeanalizuj zmiany, jakie dokonały się w Twoim otoczeniu, i odrzuć żal. Złóż podziękowanie za to, co było, i z całkowitym spokojem powierz przyszłość Bogu. Wnieś do swojego domu i środowiska standard dojrzałości, pokoju i niezachwianego autorytetu.

W Christian Culture aplikacje i portale są zawsze BEZPŁATNE.

**Modlitwa Bojowa:**
„Ojcze, odrzucam kłamstwa nieprzyjaciela i lęk przed pustką po odejściu ludzi. Przepraszam, że opierałem się zmianom z powodu egoizmu. Dziękuję, że każda strata w Twoich rękach staje się fundamentem nowego wzrostu. Daj mi odwagę, rygor i wyrazisty charakter, bym z nienaganną klasą i ufnością przyjmował nowe sezony, zdobywając ten świat dla Twojej chwały."

Baza i wzrost: https://chat.whatsapp.com/DBTRDxQWamZDWaOkjupSt0 – Wejdź do zespołu ludzi z pasją!

PODAJ DALEJ 🔴
www.polskieradio.cc | www.cclite.pl`,
            image: 'promo_dzj.jpg',
            likes: 64,
            amen: 58
        },
        {
            id: 'post_ckd_2026_08_23',
            type: 'post',
            author: 'Andrzej Thiel',
            authorRole: 'Cuda Każdego Dnia ✨ • Sieradz',
            authorAvatar: 'avatar_andrzej_thiel.jpg',
            authorSlug: 'andrzejthiel',
            time: '23 Sierpnia 2026 • 📖 Cuda Każdego Dnia (Dzisiaj)',
            title: 'ON SŁYSZY TWÓJ GŁOS! • Cuda Każdego Dnia ✨',
            text: `CUDA KAŻDEGO DNIA! 
23 SIERPNIA 2026.
Przeczytaj i zobacz jak Bóg przemienia twoje życie.

ON SŁYSZY TWÓJ GŁOS!

Czy wiesz, że pingwiny cesarskie i królewskie potrafią rozpoznać głos własnych piskląt spośród tysięcy młodych, zgromadzonych w tak zwanych żłobkach? Fascynujące! Jak to możliwe? Okazuje się, że pisklęta potrafią wydawać dźwięki o dwóch różnych częstotliwościach jednocześnie, co tworzy wyjątkowy „odcisk dźwiękowy”, który przypomina cyfrowy kod. Rodzice i pisklęta, jeszcze zanim się wyklują, uczą się tych dźwięków, by później móc wyfiltrować częstotliwości swojego malucha spośród hałasu tysięcy innych ptaków.

Choć jesteś jednym z tysięcy, jesteś słyszany! Psalmista pisał: „Miłuję Pana, bo usłyszał mój głos błagalny, bo nakłonił ku mnie swego ucha w dniu mego wołania” (Ps 116,1). Twój głos ma znaczenie, bo kiedy wołasz twój Ojciec w niebie odpowiada. Twój głos odróżnia się od wszystkich innych. Twoje pragnienie serca, twoja potrzeba ma dla Niego znaczenie. Bo kocha cię bardzo osobiście i czule. Chce okazywać ci łaskę przebaczenia, zaspakajać twoją potrzebę miłości, bezpieczeństwa, pokoju.

Kiedy będziesz wołał, On „skryje cię w dniu niedoli w szałasie swoim, schowa w ukryciu namiotu swego, postawi wysoko na skale” (Ps 27, 5). Wołaj do Niego w chwilach dobrych i złych. Kiedy jest ci dobrze i kiedy jest źle. Nie ma nic ważniejszego w co mógłbyś inwestować swoje życie tu na ziemi niż pielęgnowanie relacji ze swoim Bogiem. Bo choć wszystko przeminie, ona będzie trwała wiecznie!

Pamiętasz co Jezus powiedział do Marty, która w swojej chęci usłużenia Mu kompletnie się pogubiła? „Marto droga, tak wiele spraw cię zaprząta! A przecież jedno tylko się liczy w życiu naprawdę. Maria to właśnie wybrała i nie będzie tego pozbawiona” (Łk 10,41-42). Co wybrała? Budowanie relacji ze swoim Panem i Przyjacielem. Jezus tęskni by spędzać z tobą czas. On ma tyle miłości, którą chce się z tobą podzielić. Czy masz czas by się zatrzymać, spędzić go u Jego stóp i przyjąć to co On ma dla ciebie na dzisiaj?

„Ojcze, dziękuję Ci, że Twoje uszy są nakierowane na mój głos, który rozpoznajesz z daleka. Że słyszysz i odpowiadasz. Że znasz mnie i moją sytuację i będziesz działał w moim imieniu. Chcę inwestować w naszą relację. Pokieruj moim sercem i pomóż mi dzisiaj wybierać to, co przybliża mnie do Ciebie, nie oddala. Dziękuję, że otaczasz mnie łaską i miłością, bo Taki jesteś”.
/opr. na podst. wiad. B.K./.

Dziękuję, że jesteś! ❤️`,
            image: 'cuda_kazdego_dnia_23_sierpnia_2026.jpg',
            likes: 215,
            amen: 189
        },
        {
            id: 'post_ckd_2026_08_18',
            type: 'post',
            author: 'Andrzej Thiel',
            authorRole: 'Opracowuje Rozważania „Cuda Każdego Dnia” ✨ • Sieradz',
            authorAvatar: 'avatar_andrzej_thiel.jpg',
            authorSlug: 'andrzejthiel',
            time: '18 Sierpnia 2026 • 📖 Cuda Każdego Dnia',
            title: 'MASZ ZADANIE! • Cuda Każdego Dnia ✨',
            text: `CUDA KAŻDEGO DNIA! 
18 SIERPNIA 2026.
Przeczytaj i zobacz jak Bóg przemienia twoje życie.

MASZ ZADANIE!

Czytając Biblię zwróćcie uwagę na związek pomiędzy zadaniem, jakie Bóg dał Adamowi i Ewie w raju – „Rozradzajcie się i rozmnażajcie się, i napełniajcie ziemię, i czyńcie ją sobie poddaną (…) i wziął Pan Bóg człowieka i osadził go w ogrodzie Eden, aby go uprawiał i strzegł” (Rdz.1,28; Rdz.2,15) – i poleceniem Jezusa, które dał swoim uczniom: „Ja jestem krzewem winnym, wy jesteście latoroślami (…) wybrałem was i przeznaczyłem was, abyście szli i owoc wydawali i aby owoc wasz był trwały” (J.15,5,16). Czy dostrzegacie to podobieństwo? Sam Bóg chce, byśmy mieli wpływ na to, co dzieje się tu na ziemi. By nasze życie nie było bezowocne, ale zmieniało ten świat na lepsze. Jak to się nam udaje? Nie bardzo. Skutki tego widzimy. Nasza ingerencja stała się dewastacją tego, co zostało nam powierzone. Z powodu grzechu straciliśmy wrażliwość, empatię, czyste intencje, a co najważniejsze: nie czerpiemy mądrości z góry. A przecież dostaliśmy zadanie, by się troszczyć, by dbać i chronić to, co należy do Boga. To wielki honor i przywilej. Ziemia nie należy do nas: „Pańska jest ziemia i to, co ją napełnia, świat i ci, którzy na nim mieszkają (Ps.24,1). Mamy działać w najlepszym interesie właściciela, bo pewnego dnia będziemy musieli zdać z tego rachunek. Może czujesz przytłoczenie tym zdaniem? Myślisz: „Tak niewiele mogę”, „Sam nie zmienię świata”, „Czy to coś zmieni, jeśli ja przestanę używać foliowych torebek, palić czym popadnie? Co za różnica?”, „Po co się przejmować?”, „Uczciwość nie popłaca”. To bardzo niebezpieczna postawa. Wystrzegaj się jej. To, co robisz na co dzień, ma znaczenie. Jeśli nie dla ciebie bezpośrednio, z pewnością dotknie kogoś innego. Bóg widzi i docenia twoje wysiłki.

„Panie, pomóż mi być dobrym szafarzem tego, co mi powierzyłeś. Chcę odpowiedzialnie i mądrze zarządzać i przyczyniać się do tego, by piękno Twojego stworzenia nadal mogło cieszyć wszystkich dokoła”.
/opr. na podst. wiad. B.K./.

Dziękuję, że jesteś! ❤️`,
            image: 'ckd_art_2026_08_18.jpg',
            likes: 67,
            amen: 61
        },
        {
            id: 'post_ckd_2026_08_17',
            type: 'post',
            author: 'Andrzej Thiel',
            authorRole: 'Opracowuje Rozważania „Cuda Każdego Dnia” ✨ • Sieradz',
            authorAvatar: 'avatar_andrzej_thiel.jpg',
            authorSlug: 'andrzejthiel',
            time: 'Dzisiaj, 17 Sierpnia 2026 • 📖 Cuda Każdego Dnia',
            title: 'JAK KONIKI POLNE! • Cuda Każdego Dnia ✨',
            text: `CUDA KAŻDEGO DNIA! 
17 SIERPNIA 2026.
Przeczytaj i zobacz jak Bóg przemienia twoje życie.

JAK KONIKI POLNE!

Czujesz się czasem, kimś tak słabym, niewidocznym, bezsilnym – w porównaniu z górą problemów, wielką troską, zmartwieniem – jak jakiś mały robaczek? Ciąży to nad tobą jak groźny cień jastrzębia, szukającego swojej ofiary? Szpiedzy, którzy wrócili z misji wywiadowczej w Kanaanie, tak się właśnie czuli. Malutcy wobec olbrzymów. Oto co mówili: „Widzieliśmy tam olbrzymów, synów Anaka, z rodu olbrzymów, i wydawaliśmy się sobie w porównaniu z nimi jak szarańcza, i takimi też byliśmy w ich oczach” (Lb. 13,33).  Szarańcza! Czy jak czytamy w innym tłumaczeniu: koniki polne. Zwątpili. Strach ma wielkie oczy, mówi przysłowie. Kiedy zaczynasz się bać, zagrożenie rośnie, aż jego wielki cień odbiera ci nadzieję. A przecież szpiedzy nie mieli pojęcia, co tak naprawdę mogli myśleć ich wrogowie. Wiemy z późniejszej relacji, że Bóg wzbudził strach w sercach mieszkańców Kanaanu na wieść, że Izraelici zbliżają się pod mury Jerycha. Mieszkanka Jerycha, Rachab, tak powiedziała: „Wiem, że Pan dał wam tę ziemię, gdyż padł na nas strach przed wami i wszyscy mieszkańcy tej ziemi drżą przed wami” (Joz. 2,9). Widzisz to? Jeśli idziesz z Bogiem, nie ma takich olbrzymów, których On by nie mógł pokonać. Potrafi sprawić, że uciekną ze strachu.  Przed czym drżysz? Czego się boisz dzisiaj? Nazwij to, a potem przynieś Bogu, który wszystko może. Oddaj Mu to i zaufaj Mu. Nie warto ulegać strachowi, którym świetnie posługuje się szatan, by cię zniechęcić. Niestety jako ludzie niczego się nie uczymy na błędach innych, choć ten przykład jest tak wymowny.  Spełnienie obietnicy było na wyciągnięcie ręki. Nie musiało kosztować 40 lat tułaczki. Dlaczego nie skorzystali z cudu, który Bóg był gotowy dla nich uczynić? Masz wielkiego Boga, niezależnie jak słaby, mały i nic nie znaczący się sobie wydajesz! Idź z wiarą pomimo przeszkód i olbrzymów na drodze. Twój Bóg jest Bogiem cudów i to On będzie walczył za ciebie. Nie wycofuj się, nie stchórz. To, co widzisz i co cię przeraża, przepuść przez Boży teleskop, a doświadczysz cudu! 

„Boże, Ty jesteś wielki i łaskawy. Masz wspaniały plan, według którego chcesz mnie prowadzić. Pomóż mi ufać, dodaj odwagi, chcę widzieć Ciebie takiego, jakim jesteś”.
/opr. na podst. wiad. B.K./.

Dziękuję, że jesteś! ❤️`,
            image: 'ckd_art_2026_08_17.jpg',
            likes: 58,
            amen: 52
        },
        {
            id: 'post_dzj_2026_08_22',
            type: 'post',
            author: 'Cezary Rogowski',
            authorRole: '☀️ Dobrze, że jesteś • Założyciel Christian Culture ✨',
            authorAvatar: 'avatar_cezary_official.jpg',
            authorSlug: 'cezaryrgowski',
            time: '22 Sierpnia 2026 • ☀️ Dobrze, że jesteś',
            title: '☀️ Lato z Jezusem — Wielkie Pytania (Dzień 22)',
            text: `☀️ **Lato z Jezusem — Wielkie Pytania**
**Dzień 22 — 31 bardzo osobistych pytań Syna/Córki do Ojca: Dlaczego tak łatwo ulegam lękowi przed odrzuceniem moich granic?**

W dwudziestym drugim dniu cyklu „Lato z Jezusem — Wielkie Pytania” rozbrajamy pułapkę toksycznej uległości oraz nieumiejętności wyznaczania zdrowych, dojrzałych granic.

W psychologii relacyjnej zjawisko „syndromu zadowalacza ludzi” (people-pleasing syndrome) opisuje wzorzec zachowania, w którym jednostka rezygnuje z własnych granic i potrzeb ze strachu przed odrzuceniem lub konfliktem. Wróg bezwzględnie wykorzystuje tę słabość, prowadząc nas do chronicznego wypalenia. Słowo Ewangelii pokazuje nam postawę Jezusa, który potrafił usunąć się na miejsce pustynne wbrew oczekiwaniom tłumów. Chrześcijański lider najwyższej klasy dba o swoje zasoby i stawia jasne granice z nienaganną, królewską klasą, wiedząc, że nieprzemyślana uległość niszczy potencjał oddania.

**Jezus mówi dziś do Ciebie:**
„On jednak usunie się na miejsca pustynne i modlił się.” *(Łukasza 5,16)*

**Zadanie Taktyczne:**
Zmiażdż dziś lęk przed postawieniem granicy na swoim polu bitwy. Zidentyfikuj relację lub obszar, w którym z powodu uległości pozwaliasz nadwyrężać swój czas i energię. Wyznacz zdrową, jasną granicę z pełnym spokojem i szacunkiem. Wnieś do swojego domu i środowiska standard dojrzałości, ochrony zasobów i niezachwianego autorytetu.

W Christian Culture aplikacje i portale są zawsze BEZPŁATNE.

**Modlitwa Bojowa:**
„Ojcze, odrzucam kłamstwa nieprzyjaciela i lęk przed odrzuceniem z powodu stawiania granic. Przepraszam, że zaniedbywałem swoje zasoby przez źle pojętą uległość. Daj mi odwagę, rygor i wyrazisty charakter, bym z nienaganną klasą i mądrością zarządzał moim czasem i energią, zdobywając ten świat dla Twojej chwały.”

Baza i wzrost: https://chat.whatsapp.com/DBTRDxQWamZDWaOkjupSt0 – Wejdź do zespołu ludzi z pasją!

PODAJ DALEJ 🔴
www.polskieradio.cc | www.cclite.pl`,
            image: 'promo_dzj.jpg',
            likes: 72,
            amen: 65
        },
        {
            id: 'post_dzj_2026_08_21',
            type: 'post',
            author: 'Cezary Rogowski',
            authorRole: '☀️ Dobrze, że jesteś • Założyciel Christian Culture ✨',
            authorAvatar: 'avatar_cezary_official.jpg',
            authorSlug: 'cezaryrgowski',
            time: '21 Sierpnia 2026 • ☀️ Dobrze, że jesteś',
            title: '☀️ Lato z Jezusem — Wielkie Pytania (Dzień 21)',
            text: `☀️ **Lato z Jezusem — Wielkie Pytania**
**Dzień 21 — 31 bardzo osobistych pytań Syna/Córki do Ojca: Dlaczego tak łatwo ulegam lękowi przed utratą moich wpływów i pozycji?**

W dwudziestym pierwszym dniu cyklu „Lato z Jezusem — Wielkie Pytania” rozbrajamy mechanizm terytorialnej zazdrości oraz lęk przed tym, że ktoś inny zdobędzie większe uznanie lub pozycję.

W psychologii przywództwa zjawisko „syndromu strażnika bramy” (gatekeeper syndrome) opisuje lidera, który ze strachu przed utratą kontroli blokuje rozwój utalentowanych podwładnych. Wróg bezwzględnie żeruje na tym lęku, przekształcając nas w zaborczych rywali. Słowo Ewangelii uderza w ten egoizm poprzez postawę Jana Chrzciciela: „On musi rosnąć, ja zaś muszę maleć”. Chrześcijański lider najwyższej klasy nie boi się silnych ludzi wokół siebie — potrafi z nienaganną klasą i hojnością otwierać drzwi innym, wiedząc, że prawdziwa wielkość polega na służbie.

**Jezus mówi dziś do Ciebie:**
„On musi rosnąć, ja zaś muszę maleć.” *(Jana 3,30)*

**Zadanie Taktyczne:**
Zmiażdż dziś lęk przed konkurencją na swoim polu bitwy. Zidentyfikuj relację zawodową lub środowiskową, w której czułeś ukryty opór przed sukcesem innej osoby. Zmień nastawienie: zaoferuj jej wsparcie, pochwal jej osiągnięcie i ciesz się jej wzrostem. Wnieś do swojej firmy i domu standard wspaniałomyślności, bezpieczeństwa i dojrzałego autorytetu.

W Christian Culture aplikacje i portale są zawsze BEZPŁATNE.

**Modlitwa Bojowa:**
„Ojcze, odrzucam kłamstwa nieprzyjaciela i zaborczą zazdrość o wpływy. Przepraszam, że lękałem się cudzego sukcesu. Dziękuję, że moje miejsce u Twojego boku jest niewzruszone. Daj mi odwagę, rygor i wyrazisty charakter, bym z nienaganną klasą hojnie wspierał wzrost innych, zdobywając ten świat dla Twojej chwały.”

Baza i wzrost: https://chat.whatsapp.com/DBTRDxQWamZDWaOkjupSt0 – Wejdź do zespołu ludzi z pasją!

PODAJ DALEJ 🔴
www.polskieradio.cc | www.cclite.pl`,
            image: 'promo_dzj.jpg',
            likes: 64,
            amen: 58
        },
        {
            id: 'post_c1',
            type: 'post',
            author: 'Cezary Rogowski',
            authorRole: 'Założyciel Christian Culture ✨',
            authorAvatar: 'avatar_cezary_official.jpg',
            authorSlug: 'cezaryrgowski',
            get dynamicTime() { return safeFormatTimestamp(new Date(Date.now() - 22 * 3600 * 1000)) + ' • 🌍 Publiczny'; },
            title: 'Fundament Bożej Relacji',
            text: 'Witaj na portalu LUMINA! Wierzę, że najpiękniejsze relacje rodzą się wtedy, gdy Chrystus jest w centrum każdego kroku. Szukajmy bratnich dusz, z którymi będziemy wspólnie służyć, modlić się i budować Boże Królestwo! ☕✨',
            image: 'avatar_cezary_official.jpg',
            likes: 42,
            amen: 38
        },
        {
            id: 'post_c2',
            type: 'post',
            author: 'Cezary Rogowski',
            authorRole: 'Założyciel Christian Culture ✨',
            authorAvatar: 'avatar_cezary_official.jpg',
            authorSlug: 'cezaryrgowski',
            get dynamicTime() { return safeFormatTimestamp(new Date(Date.now() - 46 * 3600 * 1000)) + ' • 📖 Rozważanie'; },
            title: 'Pokój w Chrystusie',
            text: '„Nie troszczcie się zbytnio o jutro, albowiem jutrzejszy dzień sam o siebie troszczyć się będzie.” (Mt 6, 34). Niech ten werset przyniesie Wam dzisiaj pokój serca i siłę do działania! 🙏',
            image: 'tlo_pr_cc.jpg',
            likes: 58,
            amen: 51
        },
        {
            id: 'post_w1',
            type: 'post',
            author: 'Wioletta Rogowska',
            authorRole: 'Współzałożycielka Christian Culture 💕',
            authorAvatar: 'avatar_wioletta_official.jpg',
            authorSlug: 'wiolettarogowska',
            get dynamicTime() { return safeFormatTimestamp(new Date(Date.now() - 20 * 3600 * 1000)) + ' • 🌍 Publiczny'; },
            title: 'Miłość Przewyższająca Perły',
            text: 'Razem z moim mężem Cezarym wierzymy z całego serca, że Boże relacje budowane na fundamencie Chrystusa przynoszą niegasnący pokój, prawdziwą miłość i siłę na każdy dzień! 💕✨',
            image: 'avatar_wioletta_official.jpg',
            likes: 64,
            amen: 59
        },
        {
            id: 'post_w2',
            type: 'post',
            author: 'Wioletta Rogowska',
            authorRole: 'Współzałożycielka Christian Culture 💕',
            authorAvatar: 'avatar_wioletta_official.jpg',
            authorSlug: 'wiolettarogowska',
            get dynamicTime() { return safeFormatTimestamp(new Date(Date.now() - 44 * 3600 * 1000)) + ' • 📖 Słowo Życia'; },
            title: 'Gorąca Miłość Wzajemna',
            text: '„Przede wszystkim miejcie gorącą miłość jedni ku drugim, bo miłość zakrywa mnóstwo grzechów.” (1 P 4, 8). Błogosławionego i pełnego Bożej obecności wieczoru! 🙏',
            image: 'tlo_ksiega_nadziei.png',
            likes: 72,
            amen: 65
        },
        {
            id: 'post_sds_1',
            type: 'post',
            author: 'Studio Dobrego Słowa',
            authorRole: 'Kanał YouTube @StudioDeeS 🎙️',
            authorAvatar: 'studiodobregoslowa_avatar.jpg',
            authorSlug: 'studiodobregoslowa',
            get dynamicTime() { return safeFormatTimestamp(new Date(Date.now() - 30 * 3600 * 1000)) + ' • 🎬 Nowy Podcast Wideo'; },
            title: 'Nowy Podcast Wideo: Boże Prowadzenie w Relacjach',
            text: 'Premiera nowego odcinka! Zapraszamy do obejrzenia i wysłuchania głębokiej rozmowy o Bożym prowadzeniu w relacjach. Link: https://youtu.be/hHug_C6XDPU ☕🕊️ Zapraszamy także do naszej Herbaciarni Dobrego Słowa!',
            image: 'https://img.youtube.com/vi/hHug_C6XDPU/maxresdefault.jpg',
            likes: 64,
            amen: 52
        },
        {
            id: 'post_ccw_1',
            type: 'post',
            author: 'CC Women Official',
            authorRole: 'Oficjalny Kanał YouTube CC Women 🌸',
            authorAvatar: 'logo_cc_women.jpg',
            authorSlug: 'ccwomen',
            get dynamicTime() { return safeFormatTimestamp(new Date(Date.now() - 50 * 3600 * 1000)) + ' • 🌸 Wzrost Kobiet'; },
            title: 'Kobiety Wiary i Boże Powołanie',
            text: 'Nowy materiał dla kobiet wiary już dostępny na naszym kanale YouTube! Zobacz jak budować poczucie własnej wartości w Bożych oczach i odkrywać Boże powołanie do miłości i mądrości. 🌸🕊️',
            image: 'logo_cc_women.jpg',
            likes: 47,
            amen: 41
        },
        {
            id: 'post_magdalena_1',
            type: 'post',
            author: 'Magdalena',
            authorRole: 'Poznań • Społeczność LUMINA 🕊️',
            authorAvatar: 'avatar_magdalena.png',
            authorSlug: 'magdalena',
            get dynamicTime() { return safeFormatTimestamp(new Date(Date.now() - 14 * 3600 * 1000)) + ' • 🌟 Nowy Profil'; },
            title: 'Zaufanie Bogu i Otwarte Serce',
            text: 'Szczęść Boże wszystkim! Wierzę, że najpiękniejsze relacje rodzą się z zaufania Bogu i otwartego serca. Pozdrawiam serdecznie całą społeczność LUMINA z Poznania! 🕊️✨',
            image: 'avatar_magdalena.png',
            likes: 28,
            amen: 24
        },
        {
            id: 'post_tomek1',
            type: 'post',
            author: 'Tomasz',
            authorRole: 'Profil Poglądowy • Pasjonat Gór 🌲',
            authorAvatar: 'avatar_widget_tomek.jpg',
            authorSlug: 'tomek',
            get dynamicTime() { return safeFormatTimestamp(new Date(Date.now() - 16 * 3600 * 1000)) + ' • 🏔️ Wędrówki z Bogiem'; },
            title: 'Cisza i Boża Obecność na Szlaku',
            text: 'Nic tak nie przybliża do Stwórcy jak poranna modlitwa w górach przy wschodzie słońca. Pozdrawiam całą chrześcijańską społeczność portalu LUMINA! 🌲⛰️',
            image: 'worship_bg.jpg',
            likes: 31,
            amen: 27
        },
        {
            id: 'post_noemi1',
            type: 'post',
            author: 'Noemi',
            authorRole: 'Profil Poglądowy • Wrocław 🌿',
            authorAvatar: 'avatar_noemi.jpg',
            authorSlug: 'noemi',
            get dynamicTime() { return safeFormatTimestamp(new Date(Date.now() - 18 * 3600 * 1000)) + ' • ☕ Rozmowy o Wierze'; },
            title: 'Wdzięczność za Małe Rzeczy',
            text: '„Pan jest moją siłą i moją tarczą, w Nim zaufało moje serce i otrzymałem pomoc.” Życzę Wam pięknego dnia pełnego łaski! ✨🌿',
            image: 'avatar_noemi.jpg',
            likes: 45,
            amen: 39
        },
        {
            id: 'post_dawid1',
            type: 'post',
            author: 'Dawid',
            authorRole: 'Profil Poglądowy • Architekt & Muzyk 🎵',
            authorAvatar: 'avatar_sara.jpg',
            authorSlug: 'dawid',
            get dynamicTime() { return safeFormatTimestamp(new Date(Date.now() - 26 * 3600 * 1000)) + ' • 🎸 Muzyka Uwielbienia'; },
            title: 'Nowe Dźwięki Ku Bożej Chwale',
            text: 'Przygotowujemy z zespołem nową aranżację Psalmów. Nie ma nic piękniejszego niż łączenie talentów ze służbą dla Pana! 🎶🎸',
            image: '',
            likes: 53,
            amen: 48
        },
        {
            id: 'post_weronika1',
            type: 'post',
            author: 'Weronika',
            authorRole: 'Profil Poglądowy • Graficzka 🎨',
            authorAvatar: 'avatar_widget_ania.jpg',
            authorSlug: 'weronika',
            get dynamicTime() { return safeFormatTimestamp(new Date(Date.now() - 28 * 3600 * 1000)) + ' • 🎨 Sztuka i Wiara'; },
            title: 'Piękno Stworzenia',
            text: 'Każdy wschód słońca to nowe płótno namalowane ręką Boga. Szukajmy piękna i dobra we wszystkim, co nas otacza! ✨',
            image: 'avatar_widget_ania.jpg',
            likes: 39,
            amen: 34
        }
    ];

    /**
     * Zwraca bezpieczną, zaktualizowaną listę wszystkich postów z uwzględnieniem
     * dynamicznych zmian profili w localStorage (np. zmiana avatara lub imienia Cezarego/Wioletty/Andrzeja)
     */
    function getSafeCommunityPosts() {
        const posts = [];
        
        LUMINA_CORE_POSTS_DATA.forEach(baseItem => {
            try {
                const item = { ...baseItem };
                item.time = item.dynamicTime || item.time || 'Dzisiaj';

                // Synchronizacja dynamicznego avatara i imienia z localStorage
                if (item.authorSlug) {
                    try {
                        const localProfileStr = localStorage.getItem('lumina_profile_' + item.authorSlug);
                        if (localProfileStr) {
                            const p = JSON.parse(localProfileStr);
                            if (p && p.name) item.author = p.name;
                            if (p && p.avatar && !p.avatar.includes('avatar_new1')) item.authorAvatar = p.avatar;
                        }
                    } catch(e) {}
                }

                posts.push(item);
            } catch(e) {
                console.warn('Lumina Post parsing error:', e);
            }
        });

        return posts;
    }

    // Eksport globalny do window
    global.LUMINA_CORE_POSTS_DATA = LUMINA_CORE_POSTS_DATA;
    global.getSafeCommunityPosts = getSafeCommunityPosts;

})(typeof window !== 'undefined' ? window : globalThis);
