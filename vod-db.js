/**
 * ═══════════════════════════════════════════════════════════════════════════
 * VOD CHRISTIAN CULTURE — BAZA FILMÓW I MODUŁ SEANSU VOD 24/7
 * Ekosystem: Polskie Radio Christian Culture & Portal LUMINA
 * Domena: https://polskieradio.cc/vod
 * ═══════════════════════════════════════════════════════════════════════════
 */

(function(window) {
    'use strict';

    // Oficjalna reklama wideo / Pre-roll Intro Christian Culture
    const VOD_PREROLL_CONFIG = {
        enabled: true,
        videoId: '5SbmWSjPNJY',
        title: 'VOD Christian Culture • Zwiastun Misji i Kina',
        skipAfterSeconds: 5
    };

    // Katalog filmów fabularnych VOD (@vod)
    const VOD_MOVIES_CATALOG = [
        {
            id: 'przelecz-ocalonych-hacksaw-ridge',
            embedType: 'iframe',
            embedUrl: 'https://vider.info/embed/video/1mx8x1',
            embedId: '1mx8x1',
            title: 'Przełęcz ocalonych (Hacksaw Ridge)',
            origTitle: 'Hacksaw Ridge',
            year: 2016,
            duration: '139 min',
            category: 'Biograficzny / Wojenny',
            director: 'Mel Gibson',
            cast: 'Andrew Garfield, Sam Worthington, Vince Vaughn, Teresa Palmer, Luke Bracey, Hugo Weaving',
            description: 'Oparta na faktach, poruszająca historia Desmonda Dossa – młodego chrześcijanina, który z powodów wiary odmawia noszenia broni i zabijania podczas II wojny światowej. Jako sanitariusz bez jednego wystrzału, z nieustanną modlitwą „Panie, pomóż mi uratować jeszcze jednego”, ocala życie 75 rannym towarzyszy w piekle bitwy o Okinawę. Pierwszy w historii obdżektor odznaczony Medalem Honoru.',
            thumbnail: 'https://img.vider.info/i/1mx8x1/7/3/przecz-ocalonych-2016-lektor.png',
            featured: true,
            badge: 'MEGA HIT',
            tags: ['przełęcz ocalonych', 'hacksaw ridge', 'mel gibson', 'desmond doss', 'andrew garfield', 'wiara', 'bohaterstwo', 'cały film lektor pl']
        },
        {
            id: 'chata-the-shack',
            embedType: 'iframe',
            embedUrl: 'https://vider.info/embed/video/8m8nxv',
            embedId: '8m8nxv',
            title: 'Chata (The Shack)',
            origTitle: 'The Shack',
            year: 2017,
            duration: '132 min',
            category: 'Dramat / Wiara',
            director: 'Stuart Hazeldine',
            cast: 'Sam Worthington, Octavia Spencer, Tim McGraw, Radha Mitchell, Aviv Alush',
            description: 'Poruszająca ekranizacja światowego bestsellera. Po rodzinnej tragedii Mack Phillips pogrąża się w kryzysie wiary i żałobie. Otrzymuje tajemnicze zaproszenie do opuszczonej leśnej chaty, gdzie doświadcza niezwykłego spotkania, które prowadzi go przez drogę głębokiego przebaczenia, duchowego uzdrowienia i bezwarunkowej miłości Boga.',
            thumbnail: 'https://img.vider.info/i/8m8nxv/7/3/chata.png',
            featured: true,
            badge: 'POLECAMY',
            tags: ['chata', 'the shack', 'dramat chrześcijański', 'przebaczenie', 'miłość boża', 'octavia spencer', 'sam worthington', 'cały film lektor pl']
        },
        {
            id: 'film-jezus-ewangelia-lukasza',
            youtubeId: 'GMdQIwKh22A',
            title: 'JEZUS – Ewangelia wg św. Łukasza',
            origTitle: 'Jesus (The Jesus Film)',
            year: 1979,
            duration: '128 min',
            category: 'Biblijny / Historyczny',
            director: 'Peter Sykes, John Krish',
            cast: 'Brian Deacon, Rivka Neuman, Alexander Scourby, Joseph Shiloach',
            description: 'Klasyczna, najsłynniejsza w historii kina ekranizacja Ewangelii według św. Łukasza (1979). Wiernie ukazuje narodziny, nauczanie, niezwykłe cuda, śmierć na krzyżu oraz chwalebne zmartwychwstanie Jezusa Chrystusa. Przetłumaczona na ponad 2000 języków i obejrzana przez miliardy widzów na całym świecie.',
            thumbnail: 'https://i.ytimg.com/vi/GMdQIwKh22A/hqdefault.jpg',
            featured: true,
            badge: 'NOWOŚĆ',
            tags: ['film jezus', 'ewangelia według św łukasza', 'jezus chrystus', 'brian deacon', 'życie jezusa', 'cały film lektor pl']
        },
        {
            id: 'bog-nie-umar-1',
            youtubeId: 'Mxlw-eQFh-c',
            title: "Bóg nie umarł (God's Not Dead)",
            origTitle: "God's Not Dead",
            year: 2014,
            duration: '113 min',
            category: 'Dramat / Wiara',
            director: 'Harold Cronk',
            cast: 'Kevin Sorbo, Shane Harper, David A.R. White, Dean Cain',
            description: 'Młody student Josh Wheaton rozpoczyna studia na uniwersytecie, gdzie bezwzględny profesor filozofii Jeffrey Radisson żąda od studentów podpisania deklaracji „Bóg umarł”. Gdy Josh jako jedyny odmawia, musi przed całą aulą udowodnić istnienie Boga w serii fascynujących debat.',
            thumbnail: 'https://i.ytimg.com/vi/Mxlw-eQFh-c/hqdefault.jpg',
            featured: true,
            badge: 'HIT KINOWY',
            tags: ['bóg nie umarł', 'dramat chrześcijański', 'wiara i rozum', 'debata', 'cały film lektor pl']
        },
        {
            id: 'bog-nie-umar-2',
            youtubeId: '-_BPQcptdW8',
            title: "Bóg nie umarł 2 (God's Not Dead 2)",
            origTitle: "God's Not Dead 2",
            year: 2016,
            duration: '120 min',
            category: 'Dramat sądowy',
            director: 'Harold Cronk',
            cast: 'Melissa Joan Hart, Jesse Metcalfe, Ray Wise, Ernie Hudson',
            description: 'Nauczycielka historii Grace Wesley odpowiada na pytanie uczennicy dotyczące Jezusa Chrystusa, cytując Pismo Święte. Sprawa trafia do sądu, a proces staje się ogólnokrajową batalią o wolność wyznania i prawo do obecności Boga w przestrzeni publicznej.',
            thumbnail: 'https://i.ytimg.com/vi/-_BPQcptdW8/hqdefault.jpg',
            featured: true,
            badge: 'POLECAMY',
            tags: ['bóg nie umarł 2', 'proces sądowy', 'wolność religijna', 'świadectwo wiary', 'cały film']
        },
        {
            id: 'luter-czlowiek-ktory-zmienil-oblicze-kosciola',
            youtubeId: 'lug1BNspb8k',
            title: 'Luter – człowiek, który zmienił oblicze Kościoła',
            origTitle: 'Luther',
            year: 2003,
            duration: '123 min',
            category: 'Biograficzny / Historyczny',
            director: 'Eric Till',
            cast: 'Joseph Fiennes, Alfred Molina, Peter Ustinov, Bruno Ganz',
            description: 'Monumentalna superprodukcja historyczna przedstawiająca losy Marcina Lutra, młodego mnicha, który w poszukiwaniu łaski i prawdy Bożej sprzeciwił się handlowi odpustami i zapoczątkował powrót do autorytetu Słowa Bożego: „Tylko Pismo, tylko Wiara, tylko Łaska”.',
            thumbnail: 'https://i.ytimg.com/vi/lug1BNspb8k/hqdefault.jpg',
            featured: true,
            badge: 'KLASYKA',
            tags: ['luter', 'historia kościoła', 'reforma', 'pismo święte', 'dramat historyczny']
        },
        {
            id: 'spotkanie-2010',
            youtubeId: 'xJjFe-ALYNI',
            title: 'Spotkanie (The Encounter)',
            origTitle: 'The Encounter',
            year: 2010,
            duration: '85 min',
            category: 'Dramat / Obyczajowy',
            director: 'David A.R. White',
            cast: 'Bruce Marchiano, David A.R. White, Steve Borden, Jaci Velasquez',
            description: 'Pięcioro zupełnie obcych sobie ludzi z powodu gwałtownej burzy zostaje uwięzionych w przydrożnej knajpce na odludziu. Właścicielem lokalu okazuje się tajemniczy mężczyzna, który zna wszystkie ich sekrety, rany i życiowe błędy, oferując im odkupienie i drugą szansę.',
            thumbnail: 'https://i.ytimg.com/vi/xJjFe-ALYNI/hqdefault.jpg',
            featured: true,
            badge: 'WZRUSZAJĄCY',
            tags: ['spotkanie', 'jezus w knajpie', 'przebaczenie', 'nawrócenie', 'dramat']
        },
        {
            id: 'spotkanie-2-raj-utracony',
            youtubeId: 'L-6S8MZqLj4',
            title: 'Spotkanie 2: Raj utracony (The Encounter: Paradise Lost)',
            origTitle: 'The Encounter: Paradise Lost',
            year: 2012,
            duration: '90 min',
            category: 'Dramat / Przygodowy',
            director: 'Bobby Smyth',
            cast: 'Bruce Marchiano, David A.R. White, Robert Miano, Gary Daniels',
            description: 'Kontynuacja głośnego filmu. Na tropikalnej wyspie dochodzi do ataku kartelu narkotykowego. W obliczu śmiertelnego zagrożenia i nadciągającego tsunami tajemniczy Nieznajomy ponownie staje pośród uwięzionych ludzi, niosąc nadzieję i duchowe ocalenie.',
            thumbnail: 'https://i.ytimg.com/vi/L-6S8MZqLj4/hqdefault.jpg',
            featured: false,
            badge: 'CZĘŚĆ 2',
            tags: ['spotkanie 2', 'raj utracony', 'bruce marchiano', 'nadzieja', 'film chrześcijański']
        },
        {
            id: 'i-stanie-sie-swiatlo',
            youtubeId: 'AZ_Idt4VhrA',
            title: 'I stanie się światło (Let There Be Light)',
            origTitle: 'Let There Be Light',
            year: 2017,
            duration: '100 min',
            category: 'Dramat / Obyczajowy',
            director: 'Kevin Sorbo',
            cast: 'Kevin Sorbo, Sam Sorbo, Daniel Roebuck, Dionne Warwick',
            description: 'Znany na całym świecie ateistyczny publicysta dr Sol Harkens po tragicznej śmierci syna zatraca się w cynizmie i alkoholu. W wyniku wypadku samochodowego przeżywa śmierć kliniczną i mistyczne spotkanie, które całkowicie odmienia jego serce i życie jego rodziny.',
            thumbnail: 'https://i.ytimg.com/vi/AZ_Idt4VhrA/hqdefault.jpg',
            featured: false,
            badge: 'OPARTE NA FAKTACH',
            tags: ['i stanie się światło', 'kevin sorbo', 'nawrócenie ateisty', 'rodzina', 'miłość']
        }
    ];

    // Subtelne komunikaty paska informacyjnego (News Ticker CC)
    const VOD_TICKER_MESSAGES = [
        { icon: 'fa-film', text: 'VOD CHRISTIAN CULTURE: Dobre Kino 24/7, filmy chrześcijańskie i świadectwa wiary za darmo.' },
        { icon: 'fa-sun', text: 'PORTAL LUMINA: Dołącz do ogólnoświatowej społeczności wiary na lumina.cc — twórz profil, dyskutuj i dziel się świadectwem.' },
        { icon: 'fa-radio', text: 'POLSKIE RADIO CC: Muzyka uwielbienia, Biblia Śpiewana i codzienne audycje formacyjne na żywo w polskieradio.cc.' },
        { icon: 'fa-mobile-screen-button', text: 'APLIKACJA „DOBRZE, ŻE JESTEŚ”: Pobierz aplikację z codziennymi rozważaniami, Słowem Bożym i inspiracją na każdy dzień.' },
        { icon: 'fa-heart', text: 'WSPARCIE MISJI: Pomóż nam rozwijać chrześcijańskie kino, radio i aplikacje — dziękujemy za Twoje modlitwy i wsparcie!' },
        { icon: 'fa-tv', text: 'TELEWIZJA CCTV24: Całodobowy program ewangelizacyjny, wykłady prof. Waltera Veitha i studium Pisma Świętego.' }
    ];

    // Reklamy i wsparcie misji (np. Patronite)
    const VOD_SPONSORED_ADS = [
        {
            id: 'patronite-osobowoscplus',
            type: 'ad_card',
            targetUrl: 'https://patronite.pl/osobowoscplus',
            image: 'zostan-patronem-cc.gif',
            badge: 'PATRONITE',
            badgeColor: 'linear-gradient(135deg, #e11d48, #be123c)',
            title: 'Zostań Patronem Misji Christian Culture',
            subtitle: 'Wsparcie Twórczości • OsobowośćPLUS',
            description: 'Twoje wsparcie pozwala tworzyć i rozwijać dobre kino, 24/7 radio oraz bezpłatną ewangelizację multimedialną w całej Polsce i na świecie. Dołącz do grona Patronów!',
            ctaText: 'Zostań Patronem',
            ctaIcon: 'fa-heart',
            ctaColor: '#e11d48',
            insertAfterIndex: 2 // Po 2. filmie na liście
        }
    ];

    // API publiczne modułu VOD
    const VodDB = {
        preroll: VOD_PREROLL_CONFIG,
        movies: VOD_MOVIES_CATALOG,
        ticker: VOD_TICKER_MESSAGES,
        ads: VOD_SPONSORED_ADS,

        getMovieById: function(id) {
            if (!id) return VOD_MOVIES_CATALOG[0];
            return VOD_MOVIES_CATALOG.find(m => m.id === id || m.youtubeId === id || m.embedId === id) || VOD_MOVIES_CATALOG[0];
        },

        getNextMovie: function(currentId) {
            const idx = VOD_MOVIES_CATALOG.findIndex(m => m.id === currentId || m.youtubeId === currentId || m.embedId === currentId);
            if (idx === -1 || idx >= VOD_MOVIES_CATALOG.length - 1) {
                return VOD_MOVIES_CATALOG[0];
            }
            return VOD_MOVIES_CATALOG[idx + 1];
        },

        addMovie: function(movieObj) {
            if (movieObj && (movieObj.youtubeId || movieObj.embedUrl)) {
                VOD_MOVIES_CATALOG.push(movieObj);
                return true;
            }
            return false;
        }
    };

    window.VodDB = VodDB;

})(typeof window !== 'undefined' ? window : this);
