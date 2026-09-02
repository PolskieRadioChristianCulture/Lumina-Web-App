/**
 * ══════════════════════════════════════════════════════════════════════════
 * LUMINA PROFILES DIRECTORY (SINGLE SOURCE OF TRUTH)
 * Centralna, jednolita baza danych wszystkich profili w ekosystemie LUMINA
 * ══════════════════════════════════════════════════════════════════════════
 */

export const PROFILES_DB = {
    'cezaryrgowski': {
        uid: 'cezaryrgowski',
        slug: 'cezaryrgowski',
        name: 'Cezary Rogowski',
        age: '51',
        city: 'Ostrowiec Świętokrzyski, Polska',
        avatar: 'avatar_cezary_official.jpg',
        cover: 'lumina_default_cover.jpg',
        coverPosY: '50%',
        job: 'Założyciel Christian Culture',
        role: 'Założyciel Christian Culture 👑',
        church: 'Wspólnota Uwielbieniowa',
        denom: 'Chrześcijanin',
        status: 'Żonaty',
        spouse: 'Wioletta Rogowska',
        pin: '7777',
        visibility: 'public',
        match: '98%',
        matchScore: '98%',
        isFounder: true,
        stats: { friends: '540', posts: '12', likes: '1.2k' },
        verse: '„Ja i mój dom służyć będziemy Panu.”',
        verseRef: '— Księga Jozuego 24, 15',
        bio: 'Moja relacja z Bogiem to fundament każdego dnia. Razem z moją ukochaną żoną Wiolettą tworzymy i rozwijamy misję Christian Culture oraz Radio Christian Culture. Wierzymy, że małżeństwo oparte na Chrystusie jest źródłem niesamowitej siły, pokoju i ewangelizacyjnego świadectwa.',
        tags: ['Muzyka Uwielbienia', 'Wędrówki Górskie', 'Pismo Święte', 'Ewangelizacja', 'Nowe Technologie', 'Głębokie Rozmowy'],
        photos: ['avatar_cezary_official.jpg', 'avatar_wioletta_official.jpg', 'lumina_default_cover.jpg'],
        posts: [
            {
                id: 'post_cr_1',
                author: 'Cezary Rogowski',
                authorSlug: 'cezaryrgowski',
                authorAvatar: 'avatar_cezary_official.jpg',
                authorRole: 'Założyciel Christian Culture 👑',
                time: 'Dzisiaj, 18:30 • 🌍 Publiczny',
                text: 'Witaj na moim profilu w LUMINA! Wierzę, że najpiękniejsze relacje rodzą się wtedy, gdy Chrystus jest w centrum każdego kroku. Razem z żoną Wiolettą rozwijamy to dzieło ku Bożej chwale! ☕✨',
                likes: 42,
                amen: 38,
                image: null
            },
            {
                id: 'post_cr_2',
                author: 'Cezary Rogowski',
                authorSlug: 'cezaryrgowski',
                authorAvatar: 'avatar_cezary_official.jpg',
                authorRole: 'Założyciel Christian Culture 👑',
                time: 'Wczoraj, 21:15 • 📖 Rozważanie',
                text: '„Nie troszczcie się zbytnio o jutro, albowiem jutrzejszy dzień sam o siebie troszczyć się będzie.” (Mt 6, 34). Niech ten werset przyniesie Wam dzisiaj pokój serca i siłę do działania! 🙏',
                likes: 56,
                amen: 49,
                image: 'lumina_default_cover.jpg'
            }
        ]
    },

    'wiolettarogowska': {
        uid: 'wiolettarogowska',
        slug: 'wiolettarogowska',
        name: 'Wioletta Rogowska',
        age: '49',
        city: 'Ostrowiec Świętokrzyski, Polska',
        avatar: 'avatar_wioletta_official.jpg',
        cover: 'lumina_default_cover.jpg',
        coverPosY: '50%',
        job: 'Współzałożycielka & Moderator Christian Culture',
        role: 'Współzałożycielka & Moderator LUMINA 🛡️🌸',
        church: 'Wspólnota Uwielbieniowa',
        denom: 'Chrześcijanka',
        status: 'Mężatka',
        spouse: 'Cezary Rogowski',
        pin: '7777',
        visibility: 'public',
        match: '98%',
        matchScore: '98%',
        isFounder: true,
        isModerator: true,
        stats: { friends: '490', posts: '8', likes: '980' },
        verse: '„Niewiastę dzielną któż znajdzie? Jej wartość przewyższa perły.”',
        verseRef: '— Księga Przysłów 31, 10',
        bio: 'Wspólnie z mężem Cezarym budujemy przestrzeń dla ludzi, którzy pragną kochać i żyć według Bożych wartości. Wierzę w siłę kobiecej delikatności połączonej z odwagą wiary.',
        tags: ['Kobiecość w Bogu', 'Modlitwa', 'Psychologia', 'Domowe Ognisko', 'Muzyka Chrześcijańska'],
        photos: ['avatar_wioletta_official.jpg', 'lumina_default_cover.jpg'],
        posts: [
            {
                id: 'post_wr_1',
                author: 'Wioletta Rogowska',
                authorSlug: 'wiolettarogowska',
                authorAvatar: 'avatar_wioletta_official.jpg',
                authorRole: 'Współzałożycielka & Moderator 🛡️🌸',
                time: 'Dzisiaj, 11:00 • 🌸 Kobiecość i Wiara',
                text: 'Serdecznie witam wszystkie kobiety i rodziny w społeczności LUMINA! Niech Boży pokój wypełnia Wasze serca każdego dnia. ✨🕊️',
                likes: 39,
                amen: 34,
                image: null
            }
        ]
    },

    'magdalena': {
        uid: 'magdalena',
        slug: 'magdalena',
        name: 'Magdalena',
        age: '43',
        city: 'Poznań, Polska',
        avatar: 'avatar_magdalena.png',
        cover: 'lumina_default_cover.jpg',
        coverPosY: '50%',
        job: 'Społeczność LUMINA 🕊️',
        role: 'Społeczność LUMINA 🕊️',
        church: 'Wspólnota Chrześcijańska w Poznaniu',
        denom: 'Rzymskokatolickie',
        status: 'Panna',
        pin: '7777',
        visibility: 'public',
        match: '98%',
        matchScore: '98%',
        isDemo: true,
        stats: { friends: '142', posts: '2', likes: '180' },
        verse: '„Chrześcijanin poszukujący Bożej relacji opartej na zaufaniu i miłości.”',
        verseRef: '— List do Filipian 4, 13',
        bio: 'Chrześcijanin poszukujący Bożej relacji opartej na zaufaniu i miłości. Wierzę w siłę wspólnej modlitwy, zaufanie Bogu i budowanie trwałej relacji na fundamencie Chrystusa.',
        tags: ['Modlitwa', 'Zaufanie', 'Wierność', 'Pismo Święte', 'Poznań'],
        photos: ['avatar_magdalena.png', 'avatar_new1.jpg', 'lumina_default_cover.jpg'],
        posts: [
            {
                id: 'post_magdalena_1',
                author: 'Magdalena',
                authorSlug: 'magdalena',
                authorAvatar: 'avatar_magdalena.png',
                authorRole: 'Poznań • Społeczność LUMINA 🕊️',
                time: 'Dzisiaj • 🌟 Nowy Profil',
                text: 'Szczęść Boże wszystkim! Wierzę, że najpiękniejsze relacje rodzą się z zaufania Bogu i otwartego serca. Pozdrawiam serdecznie całą społeczność LUMINA z Poznania! 🕊️✨',
                likes: 28,
                amen: 24,
                image: 'avatar_magdalena.png'
            }
        ]
    },

    'studiodobregoslowa': {
        uid: 'studiodobregoslowa',
        slug: 'studiodobregoslowa',
        name: 'Studio Dobrego Słowa',
        age: 'Misja',
        city: 'Polska',
        avatar: 'studiodobregoslowa_avatar.jpg',
        cover: 'lumina_default_cover.jpg',
        coverPosY: '50%',
        job: 'Kanał YouTube & Herbaciarnia 🎙️',
        role: 'Oficjalny Kanał YouTube & Misja 🎬',
        church: 'Dzieło Ewangelizacyjne',
        denom: 'Chrześcijańskie',
        status: 'Misja Medialna',
        pin: '7777',
        visibility: 'public',
        match: '100%',
        matchScore: '100%',
        isMissionAccount: true,
        stats: { friends: '1.4k', posts: '24', likes: '3.8k' },
        verse: '„Dobre słowo raduje serce i przynosi uzdrowienie duszy.”',
        verseRef: '— Księga Przysłów 12, 25',
        bio: 'Oficjalny profil Studia Dobrego Słowa (@StudioDeeS). Tworzymy podcasty, inspirujące rozmowy o wierze, relacjach i życiu z Bogiem. Zapraszamy także do naszej Herbaciarni Dobrego Słowa (studiods.pl)!',
        tags: ['Podcasty', 'Herbaciarnia', 'Słowo Boże', 'Ewangelizacja', 'Rozmowy o Wierze', 'YouTube'],
        latestYoutubeId: 'hHug_C6XDPU',
        photos: ['studiodobregoslowa_avatar.jpg', 'lumina_default_cover.jpg'],
        posts: [
            {
                id: 'post_sds_1',
                author: 'Studio Dobrego Słowa',
                authorSlug: 'studiodobregoslowa',
                authorAvatar: 'studiodobregoslowa_avatar.jpg',
                authorRole: 'Kanał YouTube @StudioDeeS 🎙️',
                time: 'Wczoraj • 🎬 Nowy Podcast Wideo',
                text: 'Premiera nowego odcinka! Zapraszamy do obejrzenia i wysłuchania głębokiej rozmowy o Bożym prowadzeniu w relacjach. Link: https://youtu.be/hHug_C6XDPU ☕🕊️',
                likes: 64,
                amen: 52,
                image: 'https://img.youtube.com/vi/hHug_C6XDPU/maxresdefault.jpg'
            }
        ]
    },

    'ccwomen': {
        uid: 'ccwomen',
        slug: 'ccwomen',
        name: 'CC Women Official',
        age: 'Misja',
        city: 'Polska',
        avatar: 'logo_cc_women.jpg',
        cover: 'lumina_default_cover.jpg',
        coverPosY: '50%',
        job: 'Oficjalny Kanał YouTube CC Women 🌸',
        role: 'Oficjalny Kanał YouTube CC Women 🌸',
        church: 'Służba Kobiet Christian Culture',
        denom: 'Chrześcijańskie',
        status: 'Konto Misyjne',
        pin: '7777',
        visibility: 'public',
        match: '100%',
        matchScore: '100%',
        isMissionAccount: true,
        stats: { friends: '820', posts: '15', likes: '2.1k' },
        verse: '„Niewiasta bojąca się Pana zasługuje na pochwałę.”',
        verseRef: '— Księga Przysłów 31, 30',
        bio: 'Oficjalna przestrzeń dla chrześcijańskich kobiet w społeczności LUMINA. Wzrastaj w wierze, odkrywaj Boże powołanie do piękna, mądrości i miłości.',
        tags: ['Kobiety Wiary', 'Biblia dla Kobiet', 'Wzrost Duchowy', 'Relacje', 'Świadectwa'],
        photos: ['logo_cc_women.jpg', 'lumina_default_cover.jpg'],
        posts: [
            {
                id: 'post_ccw_1',
                author: 'CC Women Official',
                authorSlug: 'ccwomen',
                authorAvatar: 'logo_cc_women.jpg',
                authorRole: 'Oficjalny Kanał YouTube CC Women 🌸',
                time: '2 dni temu • 🌸 Wzrost Kobiet',
                text: 'Nowy materiał dla kobiet wiary już dostępny na naszym kanale YouTube! Zobacz jak budować poczucie własnej wartości w Bożych oczach. 🌸🕊️',
                likes: 47,
                amen: 41,
                image: null
            }
        ]
    },

    'noemi': {
        uid: 'noemi',
        slug: 'noemi',
        name: 'Noemi',
        age: '28',
        city: 'Wrocław, Polska',
        avatar: 'avatar_noemi.jpg',
        cover: 'lumina_default_cover.jpg',
        coverPosY: '50%',
        job: 'Architekt Krajobrazu',
        role: 'Społeczność LUMINA 🌿',
        church: 'Wspólnota Uwielbienia',
        denom: 'Chrześcijanka',
        status: 'Panna',
        pin: '7777',
        visibility: 'public',
        match: '96%',
        matchScore: '96%',
        isDemo: true,
        stats: { friends: '210', posts: '5', likes: '320' },
        verse: '„Pan jest moją siłą i moją tarczą, Jemu zaufało moje serce.”',
        verseRef: '— Psalm 28, 7',
        bio: 'Głęboka wiara, miłość do muzyki chrześcijańskiej i pasja do natury. Szukam mężczyzny, dla którego Bóg jest przewodnikiem w codziennym życiu.',
        tags: ['Góry', 'Poezja', 'Fortepian', 'Ewangelizacja', 'Projektowanie'],
        photos: ['avatar_noemi.jpg', 'avatar_new1.jpg', 'lumina_default_cover.jpg'],
        posts: [
            {
                id: 'post_noemi_1',
                author: 'Noemi',
                authorSlug: 'noemi',
                authorAvatar: 'avatar_noemi.jpg',
                time: 'Dzisiaj, 09:15 • 🌿 Poranek',
                text: '„Poranek bez modlitwy to dzień bez ochrony, a wieczór bez modlitwy to noc bez pokoju.” Życzę Wam pięknego, błogosławionego dnia w Bożej obecności! ☕✨',
                likes: 38,
                amen: 31,
                image: null
            }
        ]
    },

    'jolawojcik': {
        uid: 'jolawojcik',
        slug: 'jolawojcik',
        name: 'Jola Wójcik',
        age: 'Polska',
        city: 'Polska',
        avatar: 'avatar_jolawojcik.jpg',
        cover: 'cover_jolawojcik.jpg',
        coverPosY: '50%',
        job: 'Biblijny Czas Modlitwy • Polskie Radio CC',
        role: 'Biblijny Czas Modlitwy 🕊️🌸',
        facebookUrl: 'https://www.facebook.com/jola.wojcik.940/',
        church: 'Wspólnota Modlitewna',
        denom: 'Chrześcijanka',
        status: 'Chrześcijanka',
        pin: '7777',
        visibility: 'public',
        match: '97%',
        matchScore: '97%',
        stats: { friends: '320', posts: '3', likes: '185' },
        verse: '„Nieustannie się módlcie. W każdym położeniu dziękujcie, taka jest bowiem wola Boża w Chrystusie Jezusie względem was.”',
        verseRef: '— 1 List do Tesaloniczan 5, 17-18',
        bio: 'Chrześcijanka zakorzeniona w modlitwie i Słowie Bożym. Razem z Polskim Radiem Christian Culture zapraszam do wspólnego trwania w Bożej obecności w ramach serii Biblijny Czas Modlitwy.',
        tags: ['Biblijny Czas Modlitwy', 'Modlitwa', 'Słowo Boże', 'Radio Christian Culture', 'Wspólnota Wiary', 'Uwielbienie'],
        photos: ['avatar_jolawojcik.jpg', 'cover_jolawojcik.jpg'],
        youtubePlaylistId: 'PLQBdxcl9HBc98HweGapf1brLPQBTf-6eN',
        youtubePlaylistUrl: 'https://youtube.com/playlist?list=PLQBdxcl9HBc98HweGapf1brLPQBTf-6eN',
        youtubeVideos: ['EWY-J2gSqwo', 'nFbfDqf42Q4'],
        posts: [
            {
                id: 'post_jola_1',
                author: 'Jola Wójcik',
                authorSlug: 'jolawojcik',
                authorAvatar: 'avatar_jolawojcik.jpg',
                authorRole: 'Biblijny Czas Modlitwy 🕊️🌸',
                time: 'Dzisiaj, 14:30 • 🕊️ Pasmo Modlitewne',
                text: 'Zapraszam Was serdecznie do wspólnej modlitwy w ramach serii „Biblijny Czas Modlitwy” Polskiego Radia Christian Culture! Wierzę, że gdy stajemy razem przed Panem, On odnawia nasze serca i napełnia je pokojem. 🙏✨',
                likes: 28,
                amen: 34,
                youtubeId: 'EWY-J2gSqwo',
                image: null
            },
            {
                id: 'post_jola_2',
                author: 'Jola Wójcik',
                authorSlug: 'jolawojcik',
                authorAvatar: 'avatar_jolawojcik.jpg',
                authorRole: 'Słowo Boże 📖',
                time: 'Wczoraj, 19:15 • 📖 Medytacja',
                text: '„Wzywaj mnie w dniu utrapienia, a wyzwolę cię, i będziesz mnie chwalił.” (Psalm 50, 15). Nie bój się powierzyć Bogu każdego ciężaru. Błogosławionego wieczoru! 🕊️',
                likes: 19,
                amen: 26,
                youtubeId: 'nFbfDqf42Q4',
                image: null
            }
        ]
    },

    'tomek': {
        uid: 'tomek',
        slug: 'tomek',
        name: 'Tomasz',
        age: '31',
        city: 'Kraków, Polska',
        avatar: 'avatar_widget_tomek.jpg',
        cover: 'lumina_default_cover.jpg',
        coverPosY: '50%',
        job: 'Inżynier Środowiska',
        role: 'Społeczność LUMINA 🌲',
        church: 'Mężczyźni św. Józefa',
        denom: 'Chrześcijanin',
        status: 'Kawaler',
        pin: '7777',
        visibility: 'public',
        match: '94%',
        matchScore: '94%',
        isDemo: true,
        stats: { friends: '185', posts: '4', likes: '260' },
        verse: '„Bądź mężny i mocny, nie lękaj się!”',
        verseRef: '— Księga Jozuego 1, 9',
        bio: 'Pasjonat leśnych wędrówek, natury i spokojnych rozmów o Bogu przy ognisku. Szukam kobiety o łagodnym sercu, z którą stworzymy bezpieczny i ciepły dom.',
        tags: ['Survival', 'Leśnictwo', 'Gotowanie', 'Kajaki', 'Biblia'],
        photos: ['avatar_widget_tomek.jpg', 'avatar_new1.jpg', 'lumina_default_cover.jpg'],
        posts: [
            {
                id: 'post_t1',
                author: 'Tomasz',
                authorSlug: 'tomek',
                authorAvatar: 'avatar_widget_tomek.jpg',
                time: 'Wczoraj, 14:20 • 🌲 Wyprawa',
                text: 'Niezwykły czas wyciszenia i modlitwy w górach. Bóg przemawia w ciszy! 🌄',
                likes: 29,
                amen: 22,
                image: 'lumina_default_cover.jpg'
            }
        ]
    }
};

/**
 * Pobiera dane profilu na podstawie slug / uid z uwzględnieniem pamięci lokalnej
 */
export function getLuminaProfile(slug) {
    if (!slug) slug = 'cezaryrgowski';
    const clean = slug.toLowerCase().replace(/^u_/, '');
    
    // 1. Sprawdzenie stałej bazy
    if (PROFILES_DB[clean]) return JSON.parse(JSON.stringify(PROFILES_DB[clean]));
    if (PROFILES_DB[slug]) return JSON.parse(JSON.stringify(PROFILES_DB[slug]));
    
    // 2. Sprawdzenie profilu zalogowanego użytkownika w localStorage
    try {
        const local = localStorage.getItem('lumina_profile_' + slug) || localStorage.getItem('lumina_profile_' + clean);
        if (local) return JSON.parse(local);
    } catch(e) {}
    
    // 3. Fallback domyślny
    return {
        uid: slug,
        slug: slug,
        name: 'Użytkownik LUMINA',
        age: '28',
        city: 'Polska',
        avatar: 'lumina_icon.jpg',
        needsRealPhoto: true,
        cover: 'lumina_default_cover.jpg',
        coverPosY: '50%',
        job: 'Społeczność LUMINA ✨',
        church: 'Wspólnota Chrześcijańska',
        denom: 'Chrześcijanin',
        status: 'Kawaler / Panna',
        pin: '7777',
        visibility: 'public',
        match: '95%',
        verse: '„Wszystko mogę w Tym, który mnie umacnia.”',
        verseRef: '— Flp 4, 13',
        bio: 'Witaj na moim profilu w chrześcijańskiej społeczności LUMINA!',
        tags: ['Wiara', 'Modlitwa', 'Wartości', 'Biblia'],
        photos: ['lumina_default_cover.jpg'],
        posts: []
    };
}

if (typeof window !== 'undefined') {
    window.PROFILES_DB = PROFILES_DB;
    window.getLuminaProfile = getLuminaProfile;
}
