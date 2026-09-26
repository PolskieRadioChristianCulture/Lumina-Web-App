/**
 * ══════════════════════════════════════════════════════════════════════════
 * LUMINA BIBLE ACADEMY — 28 BIBLIJNYCH ZASAD WIARY (KANONICZNA BAZA DANYCH)
 * Plik: data/lumina-courses-data.js
 * 
 * Źródło pierwotne: cclite.pl (services/biblicalSchoolLessonContent.ts)
 * Ekosystem: Christian Culture / LUMINA
 * Prawa autorskie: Christian Culture
 * Zgodność: Zero Atrap Policy, Content Validation Gate (Phase 4)
 * ══════════════════════════════════════════════════════════════════════════
 */

export const LUMINA_STAGES = [
  {
    "id": "etap-1",
    "order": 1,
    "title_pl": "POZNAJ BOGA",
    "title_en": "KNOW GOD",
    "description_pl": "Fundament wiary, natury Boga i stworzenia człowieka.",
    "lessonIds": [
      1,
      2,
      3,
      4,
      5,
      6,
      7
    ]
  },
  {
    "id": "etap-2",
    "order": 2,
    "title_pl": "ODKRYJ EWANGELIĘ",
    "title_en": "DISCOVER THE GOSPEL",
    "description_pl": "Kosmiczny bój, krzyż, zmartwychwstanie i nowe życie w Chrystusie.",
    "lessonIds": [
      8,
      9,
      10,
      11
    ]
  },
  {
    "id": "etap-3",
    "order": 3,
    "title_pl": "KOŚCIÓŁ BOŻY",
    "title_en": "THE CHURCH OF GOD",
    "description_pl": "Wspólnota przymierza, chrzest, dary Ducha i misja ostatka.",
    "lessonIds": [
      12,
      13,
      14,
      15,
      16,
      17,
      18
    ]
  },
  {
    "id": "etap-4",
    "order": 4,
    "title_pl": "ŻYJ SŁOWEM",
    "title_en": "LIVE BY THE WORD",
    "description_pl": "Prawo Boże, Szabat, biblijne szafarstwo, rodzina i styl życia.",
    "lessonIds": [
      19,
      20,
      21,
      22,
      23
    ]
  },
  {
    "id": "etap-5",
    "order": 5,
    "title_pl": "NADZIEJA",
    "title_en": "BLESSED HOPE",
    "description_pl": "Świątynia, powtórne przyjście, zmartwychwstanie i Nowa Ziemia.",
    "lessonIds": [
      24,
      25,
      26,
      27,
      28
    ]
  }
];

export const LUMINA_COURSES_CORE_28 = [
  {
    "id": 1,
    "courseId": "biblijne-zasady-wiary-28",
    "stageId": "etap-1",
    "order": 1,
    "slug": "01-pismo-swiete",
    "image": "/images/lessons/1.svg",
    "version": "1.0.0",
    "title": {
      "pl": "Pismo Święte",
      "en": "Pismo Święte"
    },
    "subtitle": {
      "pl": "Krok 1 z 28 • POZNAJ BOGA",
      "en": "Step 1 of 28 • KNOW GOD"
    },
    "introduction": {
      "pl": "Rozważamy zasady wiary opierając się wyłącznie na Piśmie Świętym. Tematem dzisiejszej lekcji jest: **Pismo Święte**.",
      "en": "We consider the principles of faith based solely on the Holy Scriptures. The topic of today's lesson is: **The Holy Scriptures**."
    },
    "content": {
      "pl": "Pismo Święte, Stary i Nowy Testament, jest Słowem Bożym przekazanym przez Boskie natchnienie za pośrednictwem świętych ludzi Bożych, którzy mówili i pisali pod wpływem Ducha Świętego. W tym Słowie Bóg przekazał ludzkości wiedzę niezbędną do zbawienia.\n\nPismo Święte jest nieomylnym objawieniem Jego woli. Jest ono wzorcem charakteru, sprawdzianem doświadczenia, autorytatywnym wykładowcą doktryn oraz wiarygodnym zapisem Bożych działań w historii.",
      "en": "The Holy Scriptures, Old and New Testaments, are the written Word of God, given by divine inspiration through holy men of God who spoke and wrote as they were moved by the Holy Spirit. In this Word, God has committed to humanity the knowledge necessary for salvation.\n\nThe Holy Scriptures are the infallible revelation of His will. They are the standard of character, the test of experience, the authoritative revealer of doctrines, and the trustworthy record of God’s acts in history."
    },
    "scripture": {
      "primaryQuotes_pl": [
        "\"Całe Pismo przez Boga jest natchnione i pożyteczne do nauki, do wykrywania błędów, do poprawy, do wychowywania w sprawiedliwości\" (2 Tm 3:16).",
        "\"Albowiem proroctwo nie przyszło nigdy z woli ludzkiej, lecz wypowiadali je ludzie Boży, natchnieni Duchem Świętym\" (2 P 1:21)."
      ],
      "primaryQuotes_en": [
        "\"All Scripture is breathed out by God and profitable for teaching, for reproof, for correction, and for training in righteousness\" (2 Tim 3:16).",
        "\"For no prophecy was ever produced by the will of man, but men spoke from God as they were carried along by the Holy Spirit\" (2 Pet 1:21)."
      ],
      "references": [
        "J 17:17; Ps 119:105; Prz 30:5.6; Iz 8:20."
      ]
    },
    "discover": {
      "questions_pl": [
        "Skąd pochodzi natchnienie Pisma Świętego i w jakim celu zostało nam dane?",
        "W jaki sposób proroctwa i prawdy biblijne dotarły do ludzi?"
      ],
      "questions_en": [
        "Skąd pochodzi natchnienie Pisma Świętego i w jakim celu zostało nam dane?",
        "W jaki sposób proroctwa i prawdy biblijne dotarły do ludzi?"
      ],
      "items": [
        {
          "id": "d1_1",
          "prompt": "Skąd pochodzi natchnienie Pisma Świętego i w jakim celu zostało nam dane?",
          "sourceRefs": [
            "2 Tm 3:16-17"
          ],
          "readingExcerpt": "„Całe Pismo przez Boga jest natchnione i pożyteczne do nauki, do wykrywania błędów, do poprawy, do wychowywania w sprawiedliwości”."
        },
        {
          "id": "d1_2",
          "prompt": "W jaki sposób proroctwa i prawdy biblijne dotarły do ludzi?",
          "sourceRefs": [
            "2 P 1:20-21"
          ],
          "readingExcerpt": "„Wypowiadali je ludzie Boży, natchnieni Duchem Świętym”."
        }
      ],
      "needsEditorialReview": false
    },
    "understand": {
      "summary_pl": "Pismo Święte, Stary i Nowy Testament, jest Słowem Bożym przekazanym przez Boskie natchnienie za pośrednictwem świętych ludzi Bożych, którzy mówili i pisali pod wpływem Ducha Świętego. W tym Słowie Bóg przekazał ludzkości wiedzę niezbędną do zbawienia...",
      "summary_en": "The Holy Scriptures, Old and New Testaments, are the written Word of God, given by divine inspiration through holy men of God who spoke and wrote as they were moved by the Holy Spirit. In this Word, God has committed to humanity the knowledge necessa...",
      "needsEditorialReview": false
    },
    "quiz": {
      "questions": [
        {
          "id": "q1_1",
          "type": "single_choice",
          "question": "Kto jest pierwotnym źródłem i natchnieniem Pisma Świętego według 2 P 1:21?",
          "options": [
            "Ludzka mądrość i tradycja filozofów",
            "Duch Święty kierujący ludźmi Bożymi",
            "Uchwały dawnych soborów państwowych",
            "Przypadkowe zapiski historyczne"
          ],
          "correctAnswer": 1,
          "explanation": "Pismo Święte jednoznacznie wskazuje, że proroctwa nie powstawały z ludzkiej woli, lecz wypowiadali je ludzie Boży natchnieni Duchem Świętym.",
          "scriptureRefs": [
            "2 P 1:21"
          ],
          "needsEditorialReview": false
        },
        {
          "id": "q1_2",
          "type": "true_false",
          "question": "Pismo Święte, Stary i Nowy Testament, stanowi jedyną, nieomylną regułę wiary i życia chrześcijanina.",
          "options": [
            "Prawda",
            "Fałsz"
          ],
          "correctAnswer": 0,
          "explanation": "Słowo Boże jest najwyższym autorytetem, sprawdzianem wszelkiej nauki i doświadczenia (Iz 8:20, J 17:17).",
          "scriptureRefs": [
            "Iz 8:20",
            "J 17:17"
          ],
          "needsEditorialReview": false
        }
      ],
      "needsEditorialReview": false
    },
    "application": {
      "pl": "Czy Pismo Święte jest dla Ciebie codziennym pokarmem? Bóg mówi do Ciebie bezpośrednio przez Swoje Słowo. Gdy stajesz wobec trudnych decyzji, pytaj najpierw: \"Co mówi Pan?\".\n\n---",
      "en": "Is the Holy Scripture your daily bread? God speaks to you directly through His Word. When facing hard decisions, ask first: \"What does the Lord say?\".\n\n---"
    },
    "prayer": {
      "pl": "Zrób to Dla Jezusa - On już czeka. Poświęć dziś czas, aby podziękować Bogu za to objawienie.",
      "en": "Do it for Jesus - He is already waiting. Take time today to thank God for this revelation."
    },
    "reflectionPrompts": {
      "pl": [
        "Co dzisiaj odkryłem w Słowie Bożym?",
        "Co konkretnie chcę zmienić lub zastosować?",
        "O co proszę Boga w modlitwie?"
      ],
      "en": [
        "What did I discover today in God’s Word?",
        "What specifically do I want to change or apply?",
        "What do I ask God for in prayer?"
      ]
    },
    "decisionPrompt": {
      "pl": "Przyjmuję prawdę o temacie: Pismo Święte do mojego osobistego życia z Bogiem.",
      "en": "I accept the biblical truth regarding Pismo Święte into my personal walk with God."
    },
    "seo": {
      "title_pl": "Pismo Święte — Kurs Biblijny | LUMINA Bible Academy",
      "title_en": "Pismo Święte — Bible Study | LUMINA Bible Academy",
      "description_pl": "Poznaj biblijne nauczanie na temat: Pismo Święte. Interaktywny kurs biblijny Christian Culture.",
      "description_en": "Discover biblical teaching on: Pismo Święte. Interactive Bible study by Christian Culture.",
      "canonicalUrl": "https://polskieradio.cc/kursy#lekcja-1"
    }
  },
  {
    "id": 2,
    "courseId": "biblijne-zasady-wiary-28",
    "stageId": "etap-1",
    "order": 2,
    "slug": "02-trojca",
    "image": "/images/lessons/2.svg",
    "version": "1.0.0",
    "title": {
      "pl": "Trójca",
      "en": "Trójca"
    },
    "subtitle": {
      "pl": "Krok 2 z 28 • POZNAJ BOGA",
      "en": "Step 2 of 28 • KNOW GOD"
    },
    "introduction": {
      "pl": "Rozważamy zasady wiary opierając się wyłącznie na Piśmie Świętym. Tematem dzisiejszej lekcji jest: **Trójca**.",
      "en": "We consider the principles of faith based solely on the Holy Scriptures. The topic of today's lesson is: **The Trinity**."
    },
    "content": {
      "pl": "Jeden jest Bóg: Ojciec, Syn i Duch Święty — jedność trzech współwiecznych Osób. Bóg jest nieśmiertelny, wszechmocny, wszechwiedzący, ponad wszystkim i wszędzie obecny. Jest nieskończony i przekraczający ludzkie pojmowanie, a jednak znany dzięki temu, że sam się objawił.\n\nJest On wiecznie godzien czci, uwielbienia i służby całego stworzenia. Choć natura Trójcy pozostaje tajemnicą, Pismo Święte wyraźnie ukazuje współdziałanie trzech Osób w dziele stworzenia i odkupienia człowieka.",
      "en": "There is one God: Father, Son, and Holy Spirit, a unity of three coeternal Persons. God is immortal, all-powerful, all-knowing, above all, and ever present. He is infinite and beyond human comprehension, yet known through His self-revelation.\n\nHe is forever worthy of worship, adoration, and service by the whole creation. While the nature of the Trinity remains a mystery, the Scriptures clearly show the cooperation of the three Persons in the work of creation and redemption."
    },
    "scripture": {
      "primaryQuotes_pl": [
        "\"Idźcie więc i nauczajcie wszystkie narody, udzielając im chrztu w imię Ojca i Syna, i Ducha Świętego\" (Mt 28:19).",
        "\"Łaska Pana Jezusa Chrystusa i miłość Boga, i społeczność Ducha Świętego niech będzie z wami wszystkimi\" (2 Kor 13:13)."
      ],
      "primaryQuotes_en": [
        "\"Go therefore and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit\" (Matt 28:19).",
        "\"The grace of the Lord Jesus Christ and the love of God and the fellowship of the Holy Spirit be with you all\" (2 Cor 13:14)."
      ],
      "references": [
        "Pwt 6:4; Ef 4:4-6; 1 P 1:2."
      ]
    },
    "discover": {
      "questions_pl": [
        "W jakiej formule Jezus nakazał udzielać chrztu wszystkim narodom?",
        "Jak apostoł Paweł podsumowuje błogosławieństwo Trzech Osób Boskich?"
      ],
      "questions_en": [
        "W jakiej formule Jezus nakazał udzielać chrztu wszystkim narodom?",
        "Jak apostoł Paweł podsumowuje błogosławieństwo Trzech Osób Boskich?"
      ],
      "items": [
        {
          "id": "d2_1",
          "prompt": "W jakiej formule Jezus nakazał udzielać chrztu wszystkim narodom?",
          "sourceRefs": [
            "Mt 28:19"
          ],
          "readingExcerpt": "„Idźcie więc i nauczajcie wszystkie narody, udzielając im chrztu w imię Ojca i Syna, i Ducha Świętego”."
        },
        {
          "id": "d2_2",
          "prompt": "Jak apostoł Paweł podsumowuje błogosławieństwo Trzech Osób Boskich?",
          "sourceRefs": [
            "2 Kor 13:13"
          ],
          "readingExcerpt": "„Łaska Pana Jezusa Chrystusa i miłość Boga, i społeczność Ducha Świętego niech będzie z wami wszystkimi”."
        }
      ],
      "needsEditorialReview": false
    },
    "understand": {
      "summary_pl": "Jeden jest Bóg: Ojciec, Syn i Duch Święty — jedność trzech współwiecznych Osób. Bóg jest nieśmiertelny, wszechmocny, wszechwiedzący, ponad wszystkim i wszędzie obecny. Jest nieskończony i przekraczający ludzkie pojmowanie, a jednak znany dzięki temu,...",
      "summary_en": "There is one God: Father, Son, and Holy Spirit, a unity of three coeternal Persons. God is immortal, all-powerful, all-knowing, above all, and ever present. He is infinite and beyond human comprehension, yet known through His self-revelation.\n\nHe is ...",
      "needsEditorialReview": false
    },
    "quiz": {
      "questions": [
        {
          "id": "q2_1",
          "type": "single_choice",
          "question": "Ilu współwiecznych Osób w doskonałej jedności tworzy Jedynego Boga według Pisma Świętego?",
          "options": [
            "Jedna Osoba przyjmująca różne postacie",
            "Dwie Osoby",
            "Trzy współwieczne Osoby: Ojciec, Syn i Duch Święty",
            "Wielu pomniejszych bogów"
          ],
          "correctAnswer": 2,
          "explanation": "Pismo Święte objawia jednego Boga w trzech współwiecznych Osobach (Mt 28:19, 2 Kor 13:13, Ef 4:4-6).",
          "scriptureRefs": [
            "Mt 28:19",
            "Ef 4:4-6"
          ],
          "needsEditorialReview": false
        }
      ],
      "needsEditorialReview": false
    },
    "application": {
      "pl": "Bóg nie jest samotną istotą, lecz wspólnotą miłości. Zostałeś stworzony na Jego obraz, aby żyć w relacji z Nim i z innymi ludźmi. Dzisiaj podziękuj Bogu za Jego potęgę i bliskość.\n\n---",
      "en": "God is not a solitary being, but a community of love. You were created in His image to live in relationship with Him and others. Today, thank God for His power and His presence.\n\n---"
    },
    "prayer": {
      "pl": "Zrób to Dla Jezusa - On już czeka. Poświęć dziś czas, aby podziękować Bogu za to objawienie.",
      "en": "Do it for Jesus - He is already waiting. Take time today to thank God for this revelation."
    },
    "reflectionPrompts": {
      "pl": [
        "Co dzisiaj odkryłem w Słowie Bożym?",
        "Co konkretnie chcę zmienić lub zastosować?",
        "O co proszę Boga w modlitwie?"
      ],
      "en": [
        "What did I discover today in God’s Word?",
        "What specifically do I want to change or apply?",
        "What do I ask God for in prayer?"
      ]
    },
    "decisionPrompt": {
      "pl": "Przyjmuję prawdę o temacie: Trójca do mojego osobistego życia z Bogiem.",
      "en": "I accept the biblical truth regarding Trójca into my personal walk with God."
    },
    "seo": {
      "title_pl": "Trójca — Kurs Biblijny | LUMINA Bible Academy",
      "title_en": "Trójca — Bible Study | LUMINA Bible Academy",
      "description_pl": "Poznaj biblijne nauczanie na temat: Trójca. Interaktywny kurs biblijny Christian Culture.",
      "description_en": "Discover biblical teaching on: Trójca. Interactive Bible study by Christian Culture.",
      "canonicalUrl": "https://polskieradio.cc/kursy#lekcja-2"
    }
  },
  {
    "id": 3,
    "courseId": "biblijne-zasady-wiary-28",
    "stageId": "etap-1",
    "order": 3,
    "slug": "03-bog-ojciec",
    "image": "/images/lessons/3.svg",
    "version": "1.0.0",
    "title": {
      "pl": "Bóg Ojciec",
      "en": "Bóg Ojciec"
    },
    "subtitle": {
      "pl": "Krok 3 z 28 • POZNAJ BOGA",
      "en": "Step 3 of 28 • KNOW GOD"
    },
    "introduction": {
      "pl": "Rozważamy zasady wiary opierając się wyłącznie na Piśmie Świętym. Tematem dzisiejszej lekcji jest: **Bóg Ojciec**.",
      "en": "We consider the principles of faith based solely on the Holy Scriptures. The topic of today's lesson is: **God the Father**."
    },
    "content": {
      "pl": "Bóg przedwieczny Ojciec jest Stwórcą, Źródłem, Sprawcą i Suwerenem całego stworzenia. Jest sprawiedliwy i święty, miłosierny i łaskawy, nieskory do gniewu oraz pełen niezmiennej miłości i wierności. Przymioty i potęga przejawiające się w Synu i Duchu Świętym są także objawieniem Ojca.",
      "en": "God the eternal Father is the Creator, Source, Sustainer, and Sovereign of all creation. He is just and holy, merciful and gracious, slow to anger, and abounding in steadfast love and faithfulness. The qualities and powers exhibited in the Son and the Holy Spirit are also revelations of the Father."
    },
    "scripture": {
      "primaryQuotes_pl": [
        "\"Łaska wam i pokój od Boga, Ojca naszego, i od Pana Jezusa Chrystusa\" (1 Kor 1:3).",
        "\"Bóg jest miłością\" (1 J 4:8).",
        "\"Gdyż tak Bóg umiłował świat, że Syna swego jednorodzonego dał...\" (J 3:16)."
      ],
      "primaryQuotes_en": [
        "\"Grace to you and peace from God our Father and the Lord Jesus Christ\" (1 Cor 1:3).",
        "\"God is love\" (1 John 4:8).",
        "\"For God so loved the world that He gave His only begotten Son...\" (John 3:16)."
      ],
      "references": [
        "Rdz 1:1; Obj 4:11; 1 Kor 15:28; J 3:16."
      ]
    },
    "discover": {
      "questions_pl": [
        "Jaki fundamentalny przymiot najlepiej definiuje istotę Boga Ojca?"
      ],
      "questions_en": [
        "Jaki fundamentalny przymiot najlepiej definiuje istotę Boga Ojca?"
      ],
      "items": [
        {
          "id": "d3_1",
          "prompt": "Jaki fundamentalny przymiot najlepiej definiuje istotę Boga Ojca?",
          "sourceRefs": [
            "1 J 4:8.16"
          ],
          "readingExcerpt": "„Bóg jest miłością: kto trwa w miłości, trwa w Bogu, a Bóg trwa w nim”."
        }
      ],
      "needsEditorialReview": false
    },
    "understand": {
      "summary_pl": "Bóg przedwieczny Ojciec jest Stwórcą, Źródłem, Sprawcą i Suwerenem całego stworzenia. Jest sprawiedliwy i święty, miłosierny i łaskawy, nieskory do gniewu oraz pełen niezmiennej miłości i wierności. Przymioty i potęga przejawiające się w Synu i Duchu...",
      "summary_en": "God the eternal Father is the Creator, Source, Sustainer, and Sovereign of all creation. He is just and holy, merciful and gracious, slow to anger, and abounding in steadfast love and faithfulness. The qualities and powers exhibited in the Son and th...",
      "needsEditorialReview": false
    },
    "quiz": {
      "questions": [
        {
          "id": "q3_1",
          "type": "single_choice",
          "question": "W jaki sposób Bóg Ojciec dowiódł Swojej bezgranicznej miłości do upadłego człowieka?",
          "options": [
            "Wymagając ofiar z ludzi",
            "Dając Swojego Jednorodzonego Syna na ratunek",
            "Pozostawiając świat samemu sobie",
            "Zsyłając potępienie bez ostrzeżenia"
          ],
          "correctAnswer": 1,
          "explanation": "„Tak bowiem Bóg umiłował świat, że Syna swego Jednorodzonego dał, aby każdy, kto w Niego wierzy, nie zginął, ale miał życie wieczne” (J 3:16).",
          "scriptureRefs": [
            "J 3:16"
          ],
          "needsEditorialReview": false
        }
      ],
      "needsEditorialReview": false
    },
    "application": {
      "pl": "Bóg nie jest tylko dalekim Absolutem, ale kochającym Ojcem, który troszczy się o każde Swoje dziecko. Nie musisz już być sierotą w tym świecie. Możesz wołać \"Abba, Ojcze!\" z pełnym przekonaniem, że On Cię słyszy i kocha.\n\n---",
      "en": "God is not just a distant Absolute, but a loving Father who cares for each of His children. You no longer have to be an orphan in this world. You can cry \"Abba, Father!\" with full confidence that He hears and loves you.\n\n---"
    },
    "prayer": {
      "pl": "Zrób to Dla Jezusa - On już czeka. Poświęć dziś czas, aby podziękować Bogu za to objawienie.",
      "en": "Do it for Jesus - He is already waiting. Take time today to thank God for this revelation."
    },
    "reflectionPrompts": {
      "pl": [
        "Co dzisiaj odkryłem w Słowie Bożym?",
        "Co konkretnie chcę zmienić lub zastosować?",
        "O co proszę Boga w modlitwie?"
      ],
      "en": [
        "What did I discover today in God’s Word?",
        "What specifically do I want to change or apply?",
        "What do I ask God for in prayer?"
      ]
    },
    "decisionPrompt": {
      "pl": "Przyjmuję prawdę o temacie: Bóg Ojciec do mojego osobistego życia z Bogiem.",
      "en": "I accept the biblical truth regarding Bóg Ojciec into my personal walk with God."
    },
    "seo": {
      "title_pl": "Bóg Ojciec — Kurs Biblijny | LUMINA Bible Academy",
      "title_en": "Bóg Ojciec — Bible Study | LUMINA Bible Academy",
      "description_pl": "Poznaj biblijne nauczanie na temat: Bóg Ojciec. Interaktywny kurs biblijny Christian Culture.",
      "description_en": "Discover biblical teaching on: Bóg Ojciec. Interactive Bible study by Christian Culture.",
      "canonicalUrl": "https://polskieradio.cc/kursy#lekcja-3"
    }
  },
  {
    "id": 4,
    "courseId": "biblijne-zasady-wiary-28",
    "stageId": "etap-1",
    "order": 4,
    "slug": "04-bog-syn",
    "image": "/images/lessons/4.svg",
    "version": "1.0.0",
    "title": {
      "pl": "Bóg Syn",
      "en": "Bóg Syn"
    },
    "subtitle": {
      "pl": "Krok 4 z 28 • POZNAJ BOGA",
      "en": "Step 4 of 28 • KNOW GOD"
    },
    "introduction": {
      "pl": "Rozważamy zasady wiary opierając się wyłącznie na Piśmie Świętym. Tematem dzisiejszej lekcji jest: **Bóg Syn**.",
      "en": "We consider the principles of faith based solely on the Holy Scriptures. The topic of today's lesson is: **God the Son**."
    },
    "content": {
      "pl": "Bóg przedwieczny Syn stał się człowiekiem w Jezusie Chrystusie. Przez Niego wszystko zostało stworzone, przez Niego objawiony został charakter Boga, dokonane zostało zbawienie ludzkości i przez Niego świat jest sądzony. Jezus Chrystus, będąc prawdziwym Bogiem, stał się także prawdziwym człowiekiem. Został poczęty z Ducha Świętego i narodzony z dziewicy Marii.",
      "en": "God the eternal Son became incarnate in Jesus Christ. Through Him all things were created, the character of God is revealed, the salvation of humanity is accomplished, and the world is judged. Jesus Christ, being truly God, became also truly man. He was conceived of the Holy Spirit and born of the virgin Mary."
    },
    "scripture": {
      "primaryQuotes_pl": [
        "\"Na początku było Słowo, a Słowo było u Boga, i Bogiem było Słowo\" (J 1:1).",
        "\"On jest obrazem Boga niewidzialnego, pierworodnym wszelkiego stworzenia\" (Kol 1:15)."
      ],
      "primaryQuotes_en": [
        "\"In the beginning was the Word, and the Word was with God, and the Word was God\" (John 1:1).",
        "\"He is the image of the invisible God, the firstborn over all creation\" (Col 1:15)."
      ],
      "references": [
        "J 1:1-3.14; Kol 1:15-19; J 10:30; 14:9; Rz 6:23; 2 Kor 5:17-19."
      ]
    },
    "discover": {
      "questions_pl": [
        "Kim było Słowo (Logos), które na początku było u Boga i stało się ciałem?"
      ],
      "questions_en": [
        "Kim było Słowo (Logos), które na początku było u Boga i stało się ciałem?"
      ],
      "items": [
        {
          "id": "d4_1",
          "prompt": "Kim było Słowo (Logos), które na początku było u Boga i stało się ciałem?",
          "sourceRefs": [
            "J 1:1-3.14"
          ],
          "readingExcerpt": "„Na początku było Słowo, a Słowo było u Boga, i Bogiem było Słowo... A Słowo stało się ciałem i zamieszkało wśród nas”."
        }
      ],
      "needsEditorialReview": false
    },
    "understand": {
      "summary_pl": "Bóg przedwieczny Syn stał się człowiekiem w Jezusie Chrystusie. Przez Niego wszystko zostało stworzone, przez Niego objawiony został charakter Boga, dokonane zostało zbawienie ludzkości i przez Niego świat jest sądzony. Jezus Chrystus, będąc prawdziw...",
      "summary_en": "God the eternal Son became incarnate in Jesus Christ. Through Him all things were created, the character of God is revealed, the salvation of humanity is accomplished, and the world is judged. Jesus Christ, being truly God, became also truly man. He ...",
      "needsEditorialReview": false
    },
    "quiz": {
      "questions": [
        {
          "id": "q4_1",
          "type": "true_false",
          "question": "Jezus Chrystus jest prawdziwym Bogiem i stał się prawdziwym człowiekiem w jednej Osobie.",
          "options": [
            "Prawda",
            "Fałsz"
          ],
          "correctAnswer": 0,
          "explanation": "Wcielenie Chrystusa łączy pełnię Boskości z prawdziwym człowieczeństwem, aby On mógł stać się naszym jedynym Pośrednikiem i Zbawicielem (Flp 2:5-11, Kol 1:15-19).",
          "scriptureRefs": [
            "Flp 2:5-11",
            "1 Tm 2:5"
          ],
          "needsEditorialReview": false
        }
      ],
      "needsEditorialReview": false
    },
    "application": {
      "pl": "Jezus nie jest tylko postacią historyczną. On jest Twoim Zbawicielem, Przyjacielem i Panem. Jego zwycięstwo na krzyżu jest Twoim zwycięstwem nad lękiem, grzechem i potępieniem. Dzisiaj wybierz posłuszeństwo Jemu.\n\n---",
      "en": "Jesus is not just a historical figure. He is your Savior, Friend, and Lord. His victory on the cross is your victory over fear, sin, and condemnation. Today, choose to follow Him.\n\n---"
    },
    "prayer": {
      "pl": "Zrób to Dla Jezusa - On już czeka. Poświęć dziś czas, aby podziękować Bogu za to objawienie.",
      "en": "Do it for Jesus - He is already waiting. Take time today to thank God for this revelation."
    },
    "reflectionPrompts": {
      "pl": [
        "Co dzisiaj odkryłem w Słowie Bożym?",
        "Co konkretnie chcę zmienić lub zastosować?",
        "O co proszę Boga w modlitwie?"
      ],
      "en": [
        "What did I discover today in God’s Word?",
        "What specifically do I want to change or apply?",
        "What do I ask God for in prayer?"
      ]
    },
    "decisionPrompt": {
      "pl": "Przyjmuję prawdę o temacie: Bóg Syn do mojego osobistego życia z Bogiem.",
      "en": "I accept the biblical truth regarding Bóg Syn into my personal walk with God."
    },
    "seo": {
      "title_pl": "Bóg Syn — Kurs Biblijny | LUMINA Bible Academy",
      "title_en": "Bóg Syn — Bible Study | LUMINA Bible Academy",
      "description_pl": "Poznaj biblijne nauczanie na temat: Bóg Syn. Interaktywny kurs biblijny Christian Culture.",
      "description_en": "Discover biblical teaching on: Bóg Syn. Interactive Bible study by Christian Culture.",
      "canonicalUrl": "https://polskieradio.cc/kursy#lekcja-4"
    }
  },
  {
    "id": 5,
    "courseId": "biblijne-zasady-wiary-28",
    "stageId": "etap-1",
    "order": 5,
    "slug": "05-bog-duch-swiety",
    "image": "/images/lessons/5.svg",
    "version": "1.0.0",
    "title": {
      "pl": "Bóg Duch Święty",
      "en": "Bóg Duch Święty"
    },
    "subtitle": {
      "pl": "Krok 5 z 28 • POZNAJ BOGA",
      "en": "Step 5 of 28 • KNOW GOD"
    },
    "introduction": {
      "pl": "Rozważamy zasady wiary opierając się wyłącznie na Piśmie Świętym. Tematem dzisiejszej lekcji jest: **Bóg Duch Święty**.",
      "en": "We consider the principles of faith based solely on the Holy Scriptures. The topic of today's lesson is: **God the Holy Spirit**."
    },
    "content": {
      "pl": "Bóg przedwieczny Duch Święty brał czynny udział wraz z Ojcem i Synem w dziele stworzenia, wcielenia i odkupienia. Inspirował pisarzy Pisma Świętego. Napełniał mocą życie Chrystusa. Przekonuje ludzi o grzechu, a tych, którzy odpowiadają na Jego wezwanie, odradza i przemienia na obraz Boży. Posłany przez Ojca i Syna, aby zawsze być z Jego dziećmi.",
      "en": "God the eternal Holy Spirit was active with the Father and the Son in Creation, Incarnation, and Redemption. He inspired the writers of Scripture. He filled Christ’s life with power. He draws and convicts human beings; and those who respond He renews and transforms into the image of God. Sent by the Father and the Son to be always with His children."
    },
    "scripture": {
      "primaryQuotes_pl": [
        "\"A ziemia była pustkowiem i chaosem... a Duch Boży unosił się nad powierzchnią wód\" (Rdz 1:2).",
        "\"Ale weźmiecie moc Ducha Świętego, kiedy zstąpi na was...\" (Dz 1:8)."
      ],
      "primaryQuotes_en": [
        "\"The earth was without form, and void... and the Spirit of God was hovering over the face of the waters\" (Gen 1:2).",
        "\"But you shall receive power when the Holy Spirit has come upon you...\" (Acts 1:8)."
      ],
      "references": [
        "Rdz 1:1.2; Łk 1:35; 2 P 1:21; Dz 1:8; 10:38; J 14:16-18.26; 16:7-13."
      ]
    },
    "discover": {
      "questions_pl": [
        "Jakie role pełni Duch Święty w życiu wierzącego według obietnicy Jezusa?"
      ],
      "questions_en": [
        "Jakie role pełni Duch Święty w życiu wierzącego według obietnicy Jezusa?"
      ],
      "items": [
        {
          "id": "d5_1",
          "prompt": "Jakie role pełni Duch Święty w życiu wierzącego według obietnicy Jezusa?",
          "sourceRefs": [
            "J 14:16-17.26",
            "J 16:8.13"
          ],
          "readingExcerpt": "„Pocieszyciel, Duch Święty... nauczy was wszystkiego i przypomni wam wszystko, co wam powiedziałem”."
        }
      ],
      "needsEditorialReview": false
    },
    "understand": {
      "summary_pl": "Bóg przedwieczny Duch Święty brał czynny udział wraz z Ojcem i Synem w dziele stworzenia, wcielenia i odkupienia. Inspirował pisarzy Pisma Świętego. Napełniał mocą życie Chrystusa. Przekonuje ludzi o grzechu, a tych, którzy odpowiadają na Jego wezwan...",
      "summary_en": "God the eternal Holy Spirit was active with the Father and the Son in Creation, Incarnation, and Redemption. He inspired the writers of Scripture. He filled Christ’s life with power. He draws and convicts human beings; and those who respond He renews...",
      "needsEditorialReview": false
    },
    "quiz": {
      "questions": [
        {
          "id": "q5_1",
          "type": "single_choice",
          "question": "Duch Święty według nauczania Pisma Świętego jest:",
          "options": [
            "Bezosobową energią lub siłą natury",
            "Boską Osobą, Pocieszycielem i Nauczycielem prawdy",
            "Metaforą dobrych myśli człowieka",
            "Wyłącznie duchem zmarłych proroków"
          ],
          "correctAnswer": 1,
          "explanation": "Duch Święty jest Trzecią Osobą Bóstwa, która przekonuje o grzechu, prowadzi do wszelkiej prawdy i odnawia serce człowieka (J 14:16-26, Dz 5:3-4).",
          "scriptureRefs": [
            "J 14:16-26",
            "Dz 5:3-4"
          ],
          "needsEditorialReview": false
        }
      ],
      "needsEditorialReview": false
    },
    "application": {
      "pl": "Duch Święty jest Bogiem mieszkającym w Tobie dzisiaj. On daje Ci moc do pokonywania słabości i bycia świadkiem Jezusa. Nie musisz walczyć o świętość własnymi siłami – poddaj się prowadzeniu Ducha, a On dokona w Tobie przemiany.\n\n---",
      "en": "The Holy Spirit is God living in you today. He gives you power to overcome weaknesses and be a witness for Jesus. You don't have to fight for holiness with your own strength – submit to the Spirit's guidance, and He will transform you.\n\n---"
    },
    "prayer": {
      "pl": "Zrób to Dla Jezusa - On już czeka. Poświęć dziś czas, aby podziękować Bogu za to objawienie.",
      "en": "Do it for Jesus - He is already waiting. Take time today to thank God for this revelation."
    },
    "reflectionPrompts": {
      "pl": [
        "Co dzisiaj odkryłem w Słowie Bożym?",
        "Co konkretnie chcę zmienić lub zastosować?",
        "O co proszę Boga w modlitwie?"
      ],
      "en": [
        "What did I discover today in God’s Word?",
        "What specifically do I want to change or apply?",
        "What do I ask God for in prayer?"
      ]
    },
    "decisionPrompt": {
      "pl": "Przyjmuję prawdę o temacie: Bóg Duch Święty do mojego osobistego życia z Bogiem.",
      "en": "I accept the biblical truth regarding Bóg Duch Święty into my personal walk with God."
    },
    "seo": {
      "title_pl": "Bóg Duch Święty — Kurs Biblijny | LUMINA Bible Academy",
      "title_en": "Bóg Duch Święty — Bible Study | LUMINA Bible Academy",
      "description_pl": "Poznaj biblijne nauczanie na temat: Bóg Duch Święty. Interaktywny kurs biblijny Christian Culture.",
      "description_en": "Discover biblical teaching on: Bóg Duch Święty. Interactive Bible study by Christian Culture.",
      "canonicalUrl": "https://polskieradio.cc/kursy#lekcja-5"
    }
  },
  {
    "id": 6,
    "courseId": "biblijne-zasady-wiary-28",
    "stageId": "etap-1",
    "order": 6,
    "slug": "06-stworzenie",
    "image": "/images/lessons/6.svg",
    "version": "1.0.0",
    "title": {
      "pl": "Stworzenie",
      "en": "Stworzenie"
    },
    "subtitle": {
      "pl": "Krok 6 z 28 • POZNAJ BOGA",
      "en": "Step 6 of 28 • KNOW GOD"
    },
    "introduction": {
      "pl": "Rozważamy zasady wiary opierając się wyłącznie na Piśmie Świętym. Tematem dzisiejszej lekcji jest: **Stworzenie**.",
      "en": "We consider the principles of faith based solely on the Holy Scriptures. The topic of today's lesson is: **Creation**."
    },
    "content": {
      "pl": "Bóg jest Stwórcą wszystkiego. Przekazał On nam w Piśmie Świętym wiarygodne sprawozdanie o swej stwórczej działalności. W ciągu sześciu dni Pan uczynił „niebo i ziemię” oraz wszystkie żywe istoty na ziemi, a siódmego dnia tego pierwszego tygodnia odpoczął. W ten sposób ustanowił On sabat jako wieczny pamiątkę swego dokonanego dzieła stworzenia.",
      "en": "God is Creator of all things, and has revealed in Scripture the authentic account of His creative activity. In six days the Lord made “the heaven and the earth” and all living things upon the earth, and rested on the seventh day of that first week. Thus He established the Sabbath as a perpetual memorial of His completed creative work."
    },
    "scripture": {
      "primaryQuotes_pl": [
        "\"Na początku stworzył Bóg niebo i ziemię\" (Rdz 1:1).",
        "\"Bo w sześciu dniach uczynił Pan niebo i ziemię, morze i wszystko, co w nich jest, a siódmego dnia odpoczął\" (Wj 20:11)."
      ],
      "primaryQuotes_en": [
        "\"In the beginning God created the heavens and the earth\" (Gen 1:1).",
        "\"For in six days the Lord made the heavens and the earth, the sea, and all that is in them, and rested the seventh day\" (Exod 20:11)."
      ],
      "references": [
        "Rdz 1; 2; Wj 20:8-11; Ps 19:2-7; 33:6.9; 104; Hbr 11:3."
      ]
    },
    "discover": {
      "questions_pl": [
        "W jakim czasie i w jaki sposób Bóg powołał świat do istnienia według Księgi Rodzaju i Dekalogu?"
      ],
      "questions_en": [
        "W jakim czasie i w jaki sposób Bóg powołał świat do istnienia według Księgi Rodzaju i Dekalogu?"
      ],
      "items": [
        {
          "id": "d6_1",
          "prompt": "W jakim czasie i w jaki sposób Bóg powołał świat do istnienia według Księgi Rodzaju i Dekalogu?",
          "sourceRefs": [
            "Rdz 1:31 — 2:3",
            "Wj 20:11"
          ],
          "readingExcerpt": "„W sześciu dniach bowiem uczynił Pan niebo i ziemię, morze i wszystko, co w nich jest, a siódmego dnia odpoczął”."
        }
      ],
      "needsEditorialReview": false
    },
    "understand": {
      "summary_pl": "Bóg jest Stwórcą wszystkiego. Przekazał On nam w Piśmie Świętym wiarygodne sprawozdanie o swej stwórczej działalności. W ciągu sześciu dni Pan uczynił „niebo i ziemię” oraz wszystkie żywe istoty na ziemi, a siódmego dnia tego pierwszego tygodnia odpo...",
      "summary_en": "God is Creator of all things, and has revealed in Scripture the authentic account of His creative activity. In six days the Lord made “the heaven and the earth” and all living things upon the earth, and rested on the seventh day of that first week. T...",
      "needsEditorialReview": false
    },
    "quiz": {
      "questions": [
        {
          "id": "q6_1",
          "type": "single_choice",
          "question": "Co ustanowił Bóg pod koniec tygodnia stworzenia na wieczną pamiątkę Swojego dzieła?",
          "options": [
            "Doroczne święto plonów",
            "Siódmy dzień tygodnia — Szabat — uświęcając go i błogosławiąc",
            "Świątynię z kamienia w Jerozolimie",
            "System podatków"
          ],
          "correctAnswer": 1,
          "explanation": "Bóg pobłogosławił dzień siódmy i poświęcił go, ponieważ w nim odpoczął od wszelkiego dzieła, które stworzył (Rdz 2:1-3, Wj 20:8-11).",
          "scriptureRefs": [
            "Rdz 2:1-3",
            "Wj 20:11"
          ],
          "needsEditorialReview": false
        }
      ],
      "needsEditorialReview": false
    },
    "application": {
      "pl": "Świat nie jest dziełem przypadku, ale wyrazem Bożej miłości i porządku. Ty również nie jesteś przypadkiem – zostałeś zaplanowany przez Stwórcę. Podziwiaj piękno natury i dziękuj Bogu za dar życia.\n\n---",
      "en": "The world is not a product of chance, but an expression of God's love and order. You are not an accident either – you were planned by the Creator. Admire the beauty of nature and thank God for the gift of life.\n\n---"
    },
    "prayer": {
      "pl": "Zrób to Dla Jezusa - On już czeka. Poświęć dziś czas, aby podziękować Bogu za to objawienie.",
      "en": "Do it for Jesus - He is already waiting. Take time today to thank God for this revelation."
    },
    "reflectionPrompts": {
      "pl": [
        "Co dzisiaj odkryłem w Słowie Bożym?",
        "Co konkretnie chcę zmienić lub zastosować?",
        "O co proszę Boga w modlitwie?"
      ],
      "en": [
        "What did I discover today in God’s Word?",
        "What specifically do I want to change or apply?",
        "What do I ask God for in prayer?"
      ]
    },
    "decisionPrompt": {
      "pl": "Przyjmuję prawdę o temacie: Stworzenie do mojego osobistego życia z Bogiem.",
      "en": "I accept the biblical truth regarding Stworzenie into my personal walk with God."
    },
    "seo": {
      "title_pl": "Stworzenie — Kurs Biblijny | LUMINA Bible Academy",
      "title_en": "Stworzenie — Bible Study | LUMINA Bible Academy",
      "description_pl": "Poznaj biblijne nauczanie na temat: Stworzenie. Interaktywny kurs biblijny Christian Culture.",
      "description_en": "Discover biblical teaching on: Stworzenie. Interactive Bible study by Christian Culture.",
      "canonicalUrl": "https://polskieradio.cc/kursy#lekcja-6"
    }
  },
  {
    "id": 7,
    "courseId": "biblijne-zasady-wiary-28",
    "stageId": "etap-1",
    "order": 7,
    "slug": "07-natura-ludzka",
    "image": "/images/lessons/7.svg",
    "version": "1.0.0",
    "title": {
      "pl": "Natura ludzka",
      "en": "Natura ludzka"
    },
    "subtitle": {
      "pl": "Krok 7 z 28 • POZNAJ BOGA",
      "en": "Step 7 of 28 • KNOW GOD"
    },
    "introduction": {
      "pl": "Rozważamy zasady wiary opierając się wyłącznie na Piśmie Świętym. Tematem dzisiejszej lekcji jest: **Natura ludzka**.",
      "en": "We consider the principles of faith based solely on the Holy Scriptures. The topic of today's lesson is: **The Nature of Humanity**."
    },
    "content": {
      "pl": "Mężczyzna i kobieta zostali stworzeni na obraz Boży, z indywidualnością oraz mocą i wolnością myślenia i działania. Choć stworzeni jako istoty wolne, są oni całością złożoną z ciała, duszy i ducha, zależną od Boga w kwestii życia, tchu i wszystkiego innego. Kiedy nasi pierwsi rodzice zgrzeszyli, natura ludzka uległa skażeniu, a śmierć stała się udziałem wszystkich.",
      "en": "Man and woman were made in the image of God with individuality, the power and freedom to think and to do. Though created free beings, each is an indivisible unity of body, mind, and spirit, dependent upon God for life and breath and all else. When our first parents disobeyed God, they denied their dependence upon Him and fell from their high position under God. Their descendants share this fallen nature and its consequences."
    },
    "scripture": {
      "primaryQuotes_pl": [
        "\"I stworzył Bóg człowieka na obraz swój...\" (Rdz 1:27).",
        "\"Ukształtował Pan Bóg człowieka z prochu ziemi i tchnął w nozdrza jego dech życia. Wtedy stał się człowiek istotą żywą\" (Rdz 2:7)."
      ],
      "primaryQuotes_en": [
        "\"So God created man in His own image...\" (Gen 1:27).",
        "\"And the Lord God formed man of the dust of the ground, and breathed into his nostrils the breath of life; and man became a living being\" (Gen 2:7)."
      ],
      "references": [
        "Rdz 1:26-28; 2:7; 3; Ps 8:5-9; Dz 17:24-28; Rz 5:12-17; 2 Kor 5:19.20."
      ]
    },
    "discover": {
      "questions_pl": [
        "Na czyj obraz został stworzony człowiek i jakie były konsekwencje nieposłuszeństwa?"
      ],
      "questions_en": [
        "Na czyj obraz został stworzony człowiek i jakie były konsekwencje nieposłuszeństwa?"
      ],
      "items": [
        {
          "id": "d7_1",
          "prompt": "Na czyj obraz został stworzony człowiek i jakie były konsekwencje nieposłuszeństwa?",
          "sourceRefs": [
            "Rdz 1:26-27",
            "Rz 5:12"
          ],
          "readingExcerpt": "„Przez jednego człowieka grzech wszedł na świat, a przez grzech śmierć”."
        }
      ],
      "needsEditorialReview": false
    },
    "understand": {
      "summary_pl": "Mężczyzna i kobieta zostali stworzeni na obraz Boży, z indywidualnością oraz mocą i wolnością myślenia i działania. Choć stworzeni jako istoty wolne, są oni całością złożoną z ciała, duszy i ducha, zależną od Boga w kwestii życia, tchu i wszystkiego ...",
      "summary_en": "Man and woman were made in the image of God with individuality, the power and freedom to think and to do. Though created free beings, each is an indivisible unity of body, mind, and spirit, dependent upon God for life and breath and all else. When ou...",
      "needsEditorialReview": false
    },
    "quiz": {
      "questions": [
        {
          "id": "q7_1",
          "type": "single_choice",
          "question": "Jaka jest sytuacja każdego człowieka po upadku w grzech bez Chrystusa?",
          "options": [
            "Człowiek rodzi się bezgrzeszny i nie potrzebuje łaski",
            "Wszyscy zgrzeszyli i brak im chwały Bożej, podlegając śmierci",
            "Człowiek staje się aniołem po śmierci",
            "Grzech dotyczy tylko złych ludzi"
          ],
          "correctAnswer": 1,
          "explanation": "„Wszyscy bowiem zgrzeszyli i pozbawieni są chwały Bożej” (Rz 3:23), dlatego każdy człowiek potrzebuje Odkupiciela.",
          "scriptureRefs": [
            "Rz 3:23",
            "Rz 6:23"
          ],
          "needsEditorialReview": false
        }
      ],
      "needsEditorialReview": false
    },
    "application": {
      "pl": "Twoja wartość nie wynika z tego, co posiadasz, ale z faktu, że jesteś stworzony na obraz Boży. Choć jesteśmy upadli, Bóg widzi w Tobie potencjał do odnowienia Jego obrazu przez łaskę Chrystusa.\n\n---",
      "en": "Your value does not come from what you possess, but from the fact that you are created in the image of God. Although we are fallen, God sees in you the potential to restore His image through the grace of Christ.\n\n---"
    },
    "prayer": {
      "pl": "Zrób to Dla Jezusa - On już czeka. Poświęć dziś czas, aby podziękować Bogu za to objawienie.",
      "en": "Do it for Jesus - He is already waiting. Take time today to thank God for this revelation."
    },
    "reflectionPrompts": {
      "pl": [
        "Co dzisiaj odkryłem w Słowie Bożym?",
        "Co konkretnie chcę zmienić lub zastosować?",
        "O co proszę Boga w modlitwie?"
      ],
      "en": [
        "What did I discover today in God’s Word?",
        "What specifically do I want to change or apply?",
        "What do I ask God for in prayer?"
      ]
    },
    "decisionPrompt": {
      "pl": "Przyjmuję prawdę o temacie: Natura ludzka do mojego osobistego życia z Bogiem.",
      "en": "I accept the biblical truth regarding Natura ludzka into my personal walk with God."
    },
    "seo": {
      "title_pl": "Natura ludzka — Kurs Biblijny | LUMINA Bible Academy",
      "title_en": "Natura ludzka — Bible Study | LUMINA Bible Academy",
      "description_pl": "Poznaj biblijne nauczanie na temat: Natura ludzka. Interaktywny kurs biblijny Christian Culture.",
      "description_en": "Discover biblical teaching on: Natura ludzka. Interactive Bible study by Christian Culture.",
      "canonicalUrl": "https://polskieradio.cc/kursy#lekcja-7"
    }
  },
  {
    "id": 8,
    "courseId": "biblijne-zasady-wiary-28",
    "stageId": "etap-2",
    "order": 8,
    "slug": "08-wielki-boj",
    "image": "/images/lessons/8.svg",
    "version": "1.0.0",
    "title": {
      "pl": "Wielki Bój",
      "en": "Wielki Bój"
    },
    "subtitle": {
      "pl": "Krok 8 z 28 • ODKRYJ EWANGELIĘ",
      "en": "Step 8 of 28 • DISCOVER THE GOSPEL"
    },
    "introduction": {
      "pl": "Rozważamy zasady wiary opierając się wyłącznie na Piśmie Świętym. Tematem dzisiejszej lekcji jest: **Wielki Bój**.",
      "en": "We consider the principles of faith based solely on the Holy Scriptures. The topic of today's lesson is: **The Great Controversy**."
    },
    "content": {
      "pl": "Cała ludzkość bierze obecnie udział w wielkim konflikcie między Chrystusem a szatanem, dotyczącym charakteru Boga, Jego prawa i Jego zwierzchnictwa nad wszechświatem. Konflikt ten rozpoczął się w niebie, kiedy jedno ze stworzeń, obdarzone wolnością wyboru, przez wywyższenie samego siebie stało się szatanem, przeciwnikiem Boga. Rozszerzył on ducha buntu na naszą ziemię, gdy zwiódł Adama i Ewę do grzechu.",
      "en": "All humanity is now involved in a great controversy between Christ and Satan regarding the character of God, His law, and His sovereignty over the universe. This conflict originated in heaven when a created being, endowed with freedom of choice, in self-exaltation became Satan, God’s adversary. He led Adam and Eve into sin and brought the spirit of rebellion to this earth."
    },
    "scripture": {
      "primaryQuotes_pl": [
        "\"I wybuchła walka w niebie: Michał i aniołowie jego walczyli ze smokiem...\" (Obj 12:7).",
        "\"Bądźcie trzeźwi, czuwajcie! Przeciwnik wasz, diabeł, krąży jak lew ryczący...\" (1 P 5:8)."
      ],
      "primaryQuotes_en": [
        "\"And war broke out in heaven: Michael and his angels fought with the dragon...\" (Rev 12:7).",
        "\"Be sober, be vigilant; because your adversary the devil walks about like a roaring lion...\" (1 Pet 5:8)."
      ],
      "references": [
        "Obj 12:4-9; Iz 14:12-14; Ez 28:12-18; Rdz 3; Rz 1:19-32; 5:12-21; 1 Kor 4:9; Hbr 1:14."
      ]
    },
    "discover": {
      "questions_pl": [
        "Gdzie rozpoczął się Wielki Bój między Chrystusem a szatanem?"
      ],
      "questions_en": [
        "Gdzie rozpoczął się Wielki Bój między Chrystusem a szatanem?"
      ],
      "items": [
        {
          "id": "d8_1",
          "prompt": "Gdzie rozpoczął się Wielki Bój między Chrystusem a szatanem?",
          "sourceRefs": [
            "Obj 12:7-9",
            "Iz 14:12-14"
          ],
          "readingExcerpt": "„I wybuchła walka w niebie: Michał i Jego aniołowie stoczyli bój ze Smokiem”."
        }
      ],
      "needsEditorialReview": false
    },
    "understand": {
      "summary_pl": "Cała ludzkość bierze obecnie udział w wielkim konflikcie między Chrystusem a szatanem, dotyczącym charakteru Boga, Jego prawa i Jego zwierzchnictwa nad wszechświatem. Konflikt ten rozpoczął się w niebie, kiedy jedno ze stworzeń, obdarzone wolnością w...",
      "summary_en": "All humanity is now involved in a great controversy between Christ and Satan regarding the character of God, His law, and His sovereignty over the universe. This conflict originated in heaven when a created being, endowed with freedom of choice, in s...",
      "needsEditorialReview": false
    },
    "quiz": {
      "questions": [
        {
          "id": "q8_1",
          "type": "single_choice",
          "question": "Co było przyczyną buntu Lucyfera i wybuchu Wielkiego Boju?",
          "options": [
            "Spór o bogactwa materialne",
            "Pycha, samouwielbienie i chęć wyniesienia się ponad Boga",
            "Błąd w Bożym prawie",
            "Brak anielskich obowiązków"
          ],
          "correctAnswer": 1,
          "explanation": "Lucyfer pragnął być równy Najwyższemu i zakwestionował Boży charakter sprawiedliwości i miłości (Iz 14:12-14, Ez 28:12-17).",
          "scriptureRefs": [
            "Iz 14:12-14",
            "Ez 28:15-17"
          ],
          "needsEditorialReview": false
        }
      ],
      "needsEditorialReview": false
    },
    "application": {
      "pl": "Jesteśmy częścią kosmicznego dramatu. Twoje codzienne wybory mają znaczenie w tym konflikcie. Wybieraj stronę Zwycięzcy – Jezusa Chrystusa, który już pokonał wroga na krzyżu.\n\n---",
      "en": "We are part of a cosmic drama. Your daily choices matter in this conflict. Choose the side of the Victor – Jesus Christ, who has already defeated the enemy on the cross.\n\n---"
    },
    "prayer": {
      "pl": "Zrób to Dla Jezusa - On już czeka. Poświęć dziś czas, aby podziękować Bogu za to objawienie.",
      "en": "Do it for Jesus - He is already waiting. Take time today to thank God for this revelation."
    },
    "reflectionPrompts": {
      "pl": [
        "Co dzisiaj odkryłem w Słowie Bożym?",
        "Co konkretnie chcę zmienić lub zastosować?",
        "O co proszę Boga w modlitwie?"
      ],
      "en": [
        "What did I discover today in God’s Word?",
        "What specifically do I want to change or apply?",
        "What do I ask God for in prayer?"
      ]
    },
    "decisionPrompt": {
      "pl": "Przyjmuję prawdę o temacie: Wielki Bój do mojego osobistego życia z Bogiem.",
      "en": "I accept the biblical truth regarding Wielki Bój into my personal walk with God."
    },
    "seo": {
      "title_pl": "Wielki Bój — Kurs Biblijny | LUMINA Bible Academy",
      "title_en": "Wielki Bój — Bible Study | LUMINA Bible Academy",
      "description_pl": "Poznaj biblijne nauczanie na temat: Wielki Bój. Interaktywny kurs biblijny Christian Culture.",
      "description_en": "Discover biblical teaching on: Wielki Bój. Interactive Bible study by Christian Culture.",
      "canonicalUrl": "https://polskieradio.cc/kursy#lekcja-8"
    }
  },
  {
    "id": 9,
    "courseId": "biblijne-zasady-wiary-28",
    "stageId": "etap-2",
    "order": 9,
    "slug": "09-zycie-smierc-i-zmartwychwstanie-chrystusa",
    "image": "/images/lessons/9.svg",
    "version": "1.0.0",
    "title": {
      "pl": "Życie, śmierć i zmartwychwstanie Chrystusa",
      "en": "Życie, śmierć i zmartwychwstanie Chrystusa"
    },
    "subtitle": {
      "pl": "Krok 9 z 28 • ODKRYJ EWANGELIĘ",
      "en": "Step 9 of 28 • DISCOVER THE GOSPEL"
    },
    "introduction": {
      "pl": "Rozważamy zasady wiary opierając się wyłącznie na Piśmie Świętym. Tematem dzisiejszej lekcji jest: **Życie, śmierć i zmartwychwstanie Chrystusa**.",
      "en": "We consider the principles of faith based solely on the Holy Scriptures. The topic of today's lesson is: **The Life, Death, and Resurrection of Christ**."
    },
    "content": {
      "pl": "W życiu Chrystusa, doskonałym świadectwie posłuszeństwa woli Bożej, w Jego cierpieniu, śmierci i zmartwychwstaniu Bóg dostarczył jedynego środka zadośćuczynienia za grzech ludzki, aby ci, którzy z wiarą przyjmują to zadośćuczynienie, mogli mieć życie wieczne. Ta doskonała ofiara wywyższa sprawiedliwość prawa Bożego i Jego łaskawy charakter.",
      "en": "In Christ’s life of perfect obedience to God’s will, His suffering, death, and resurrection, God provided the only means of atonement for human sin, so that those who by faith accept this atonement may have eternal life. This perfect sacrifice vindicates the justice of God’s law and the graciousness of His character."
    },
    "scripture": {
      "primaryQuotes_pl": [
        "\"Bóg zaś daje dowód swojej miłości ku nam przez to, że kiedy byliśmy jeszcze grzesznikami, Chrystus za nas umarł\" (Rz 5:8).",
        "\"A jeśli Chrystus nie został wzbudzony, tedy daremne jest zwiastowanie nasze, daremna też wiara wasza\" (1 Kor 15:14)."
      ],
      "primaryQuotes_en": [
        "\"But God demonstrates His own love toward us, in that while we were still sinners, Christ died for us\" (Rom 5:8).",
        "\"And if Christ is not risen, then our preaching is empty and your faith is also empty\" (1 Cor 15:14)."
      ],
      "references": [
        "J 3:16; Iz 53; 1 P 2:21.22; 1 Kor 15:3.4.20-22; 2 Kor 5:14.15.19-21."
      ]
    },
    "discover": {
      "questions_pl": [
        "Dlaczego ofiara Jezusa na krzyżu Golgoty ma moc zbawienia każdego, kto wierzy?"
      ],
      "questions_en": [
        "Dlaczego ofiara Jezusa na krzyżu Golgoty ma moc zbawienia każdego, kto wierzy?"
      ],
      "items": [
        {
          "id": "d9_1",
          "prompt": "Dlaczego ofiara Jezusa na krzyżu Golgoty ma moc zbawienia każdego, kto wierzy?",
          "sourceRefs": [
            "1 Kor 15:3-4",
            "1 P 2:24",
            "Rz 5:8"
          ],
          "readingExcerpt": "„Chrystus umarł za nasze grzechy zgodnie z Pismem, został pogrzebany i zmartwychwstał trzeciego dnia”."
        }
      ],
      "needsEditorialReview": false
    },
    "understand": {
      "summary_pl": "W życiu Chrystusa, doskonałym świadectwie posłuszeństwa woli Bożej, w Jego cierpieniu, śmierci i zmartwychwstaniu Bóg dostarczył jedynego środka zadośćuczynienia za grzech ludzki, aby ci, którzy z wiarą przyjmują to zadośćuczynienie, mogli mieć życie...",
      "summary_en": "In Christ’s life of perfect obedience to God’s will, His suffering, death, and resurrection, God provided the only means of atonement for human sin, so that those who by faith accept this atonement may have eternal life. This perfect sacrifice vindic...",
      "needsEditorialReview": false
    },
    "quiz": {
      "questions": [
        {
          "id": "q9_1",
          "type": "true_false",
          "question": "Zmartwychwstanie Jezusa Chrystusa było dosłowne, cielesne i jest gwarancją zmartwychwstania wierzących.",
          "options": [
            "Prawda",
            "Fałsz"
          ],
          "correctAnswer": 0,
          "explanation": "Chrystus rzeczywiście powstał z martwych jako pierwiastek tych, którzy zasnęli (1 Kor 15:20-22, Łk 24:39).",
          "scriptureRefs": [
            "1 Kor 15:20",
            "Łk 24:39"
          ],
          "needsEditorialReview": false
        }
      ],
      "needsEditorialReview": false
    },
    "application": {
      "pl": "Twoje zbawienie jest darmowym darem. Jezus zapłacił pełną cenę za Twoją wolność. Dzisiaj możesz odpocząć w Jego dokonanym dziele, wiedząc, że śmierć została pokonana, a niebo stoi przed Tobą otworem.\n\n---",
      "en": "Your salvation is a free gift. Jesus paid the full price for your freedom. Today, you can rest in His finished work, knowing that death has been defeated and heaven is open to you.\n\n---"
    },
    "prayer": {
      "pl": "Zrób to Dla Jezusa - On już czeka. Poświęć dziś czas, aby podziękować Bogu za to objawienie.",
      "en": "Do it for Jesus - He is already waiting. Take time today to thank God for this revelation."
    },
    "reflectionPrompts": {
      "pl": [
        "Co dzisiaj odkryłem w Słowie Bożym?",
        "Co konkretnie chcę zmienić lub zastosować?",
        "O co proszę Boga w modlitwie?"
      ],
      "en": [
        "What did I discover today in God’s Word?",
        "What specifically do I want to change or apply?",
        "What do I ask God for in prayer?"
      ]
    },
    "decisionPrompt": {
      "pl": "Przyjmuję prawdę o temacie: Życie, śmierć i zmartwychwstanie Chrystusa do mojego osobistego życia z Bogiem.",
      "en": "I accept the biblical truth regarding Życie, śmierć i zmartwychwstanie Chrystusa into my personal walk with God."
    },
    "seo": {
      "title_pl": "Życie, śmierć i zmartwychwstanie Chrystusa — Kurs Biblijny | LUMINA Bible Academy",
      "title_en": "Życie, śmierć i zmartwychwstanie Chrystusa — Bible Study | LUMINA Bible Academy",
      "description_pl": "Poznaj biblijne nauczanie na temat: Życie, śmierć i zmartwychwstanie Chrystusa. Interaktywny kurs biblijny Christian Culture.",
      "description_en": "Discover biblical teaching on: Życie, śmierć i zmartwychwstanie Chrystusa. Interactive Bible study by Christian Culture.",
      "canonicalUrl": "https://polskieradio.cc/kursy#lekcja-9"
    }
  },
  {
    "id": 10,
    "courseId": "biblijne-zasady-wiary-28",
    "stageId": "etap-2",
    "order": 10,
    "slug": "10-doswiadczenie-zbawienia",
    "image": "/images/lessons/10.svg",
    "version": "1.0.0",
    "title": {
      "pl": "Doświadczenie zbawienia",
      "en": "Doświadczenie zbawienia"
    },
    "subtitle": {
      "pl": "Krok 10 z 28 • ODKRYJ EWANGELIĘ",
      "en": "Step 10 of 28 • DISCOVER THE GOSPEL"
    },
    "introduction": {
      "pl": "Rozważamy zasady wiary opierając się wyłącznie na Piśmie Świętym. Tematem dzisiejszej lekcji jest: **Doświadczenie zbawienia**.",
      "en": "We consider the principles of faith based solely on the Holy Scriptures. The topic of today's lesson is: **The Experience of Salvation**."
    },
    "content": {
      "pl": "W nieskończonej miłości i miłosierdziu Bóg uczynił Chrystusa, który nie znał grzechu, grzechem za nas, abyśmy w Nim stali się sprawiedliwością Bożą. Prowadzeni przez Ducha Świętego dostrzegamy naszą potrzebę, wyznajemy naszą grzeszność i upamiętujemy się z naszych przestępstw, a przez wiarę w Jezusa przyjmujemy zbawienie.",
      "en": "In infinite love and mercy God made Christ, who knew no sin, to be sin for us, so that in Him we might be made the righteousness of God. Led by the Holy Spirit we sense our need, acknowledge our sinfulness, repent of our transgressions, and exercise faith in Jesus as Savior and Lord."
    },
    "scripture": {
      "primaryQuotes_pl": [
        "\"Łaską bowiem jesteście zbawieni przez wiarę, i to nie jest z was, jest to dar Boży\" (Ef 2:8).",
        "\"On zaś, gdy przyjdzie, przekona świat o grzechu...\" (J 16:8)."
      ],
      "primaryQuotes_en": [
        "\"For by grace you have been saved through faith, and that not of yourselves; it is the gift of God\" (Eph 2:8).",
        "\"And when He has come, He will convict the world of sin...\" (John 16:8)."
      ],
      "references": [
        "2 Kor 5:17-21; J 3:16; Gal 1:4; 4:4-7; Ef 2:4-10; Kol 1:13.14; Tt 3:3-7."
      ]
    },
    "discover": {
      "questions_pl": [
        "W jaki sposób człowiek otrzymuje dar zbawienia według listów apostoła Pawła?"
      ],
      "questions_en": [
        "W jaki sposób człowiek otrzymuje dar zbawienia według listów apostoła Pawła?"
      ],
      "items": [
        {
          "id": "d10_1",
          "prompt": "W jaki sposób człowiek otrzymuje dar zbawienia według listów apostoła Pawła?",
          "sourceRefs": [
            "Ef 2:8-10",
            "Rz 3:24-28"
          ],
          "readingExcerpt": "„Łaską bowiem jesteście zbawieni przez wiarę. A to nie z was, Boży to dar; nie z uczynków, aby się nikt nie chlubił”."
        }
      ],
      "needsEditorialReview": false
    },
    "understand": {
      "summary_pl": "W nieskończonej miłości i miłosierdziu Bóg uczynił Chrystusa, który nie znał grzechu, grzechem za nas, abyśmy w Nim stali się sprawiedliwością Bożą. Prowadzeni przez Ducha Świętego dostrzegamy naszą potrzebę, wyznajemy naszą grzeszność i upamiętujemy...",
      "summary_en": "In infinite love and mercy God made Christ, who knew no sin, to be sin for us, so that in Him we might be made the righteousness of God. Led by the Holy Spirit we sense our need, acknowledge our sinfulness, repent of our transgressions, and exercise ...",
      "needsEditorialReview": false
    },
    "quiz": {
      "questions": [
        {
          "id": "q10_1",
          "type": "single_choice",
          "question": "Czy człowiek może zapracować na zbawienie własnymi dobrymi uczynkami?",
          "options": [
            "Tak, jeśli przestrzega wszystkich reguł",
            "Nie, zbawienie jest darmowym darem łaski Bożej przyjmowanym przez wiarę",
            "Częściowo — 50% łaski i 50% uczynków",
            "Tylko przez składanie ofiar materialnych"
          ],
          "correctAnswer": 1,
          "explanation": "Zbawienie jest w 100% darem niezasłużonej łaski Bożej, a dobre uczynki są owocem i dowodem odrodzonego życia (Ef 2:8-10).",
          "scriptureRefs": [
            "Ef 2:8-10"
          ],
          "needsEditorialReview": false
        }
      ],
      "needsEditorialReview": false
    },
    "application": {
      "pl": "Zbawienie to nie tylko teoria, to doświadczenie pokoju i nowości życia. Jeśli przyjąłeś ten dar, jesteś nowym stworzeniem. Nie pozwól, aby Twoja przeszłość Cię definiowała – teraz definiuje Cię Boża łaska.\n\n---",
      "en": "Salvation is not just a theory; it is an experience of peace and newness of life. If you have accepted this gift, you are a new creation. Don't let your past define you – God's grace defines you now.\n\n---"
    },
    "prayer": {
      "pl": "Zrób to Dla Jezusa - On już czeka. Poświęć dziś czas, aby podziękować Bogu za to objawienie.",
      "en": "Do it for Jesus - He is already waiting. Take time today to thank God for this revelation."
    },
    "reflectionPrompts": {
      "pl": [
        "Co dzisiaj odkryłem w Słowie Bożym?",
        "Co konkretnie chcę zmienić lub zastosować?",
        "O co proszę Boga w modlitwie?"
      ],
      "en": [
        "What did I discover today in God’s Word?",
        "What specifically do I want to change or apply?",
        "What do I ask God for in prayer?"
      ]
    },
    "decisionPrompt": {
      "pl": "Przyjmuję prawdę o temacie: Doświadczenie zbawienia do mojego osobistego życia z Bogiem.",
      "en": "I accept the biblical truth regarding Doświadczenie zbawienia into my personal walk with God."
    },
    "seo": {
      "title_pl": "Doświadczenie zbawienia — Kurs Biblijny | LUMINA Bible Academy",
      "title_en": "Doświadczenie zbawienia — Bible Study | LUMINA Bible Academy",
      "description_pl": "Poznaj biblijne nauczanie na temat: Doświadczenie zbawienia. Interaktywny kurs biblijny Christian Culture.",
      "description_en": "Discover biblical teaching on: Doświadczenie zbawienia. Interactive Bible study by Christian Culture.",
      "canonicalUrl": "https://polskieradio.cc/kursy#lekcja-10"
    }
  },
  {
    "id": 11,
    "courseId": "biblijne-zasady-wiary-28",
    "stageId": "etap-2",
    "order": 11,
    "slug": "11-wzrastanie-w-chrystusie",
    "image": "/images/lessons/11.svg",
    "version": "1.0.0",
    "title": {
      "pl": "Wzrastanie w Chrystusie",
      "en": "Wzrastanie w Chrystusie"
    },
    "subtitle": {
      "pl": "Krok 11 z 28 • ODKRYJ EWANGELIĘ",
      "en": "Step 11 of 28 • DISCOVER THE GOSPEL"
    },
    "introduction": {
      "pl": "Rozważamy zasady wiary opierając się wyłącznie na Piśmie Świętym. Tematem dzisiejszej lekcji jest: **Wzrastanie w Chrystusie**.",
      "en": "We consider the principles of faith based solely on the Holy Scriptures. The topic of today's lesson is: **Growing in Christ**."
    },
    "content": {
      "pl": "Przez śmierć na krzyżu Jezus zwyciężył moce zła. On, który podczas swej ziemskiej misji zwyciężył duchy demoniczne, przełamał ich potęgę i uczynił pewnym ich ostateczny los. Zwycięstwo Jezusa daje nam zwycięstwo nad siłami zła, które wciąż starają się nas kontrolować. Teraz, żyjąc w Nim, trwamy w pokoju i ufności.\n\nWzrastanie w Chrystusie to codzienne poddawanie woli Bogu, modlitwa, studiowanie Słowa i świadczenie o Jego łasce.",
      "en": "By His death on the cross Jesus triumphed over the forces of evil. He who subjugated the demonic spirits during His earthly ministry has broken their power and made certain their ultimate doom. Jesus’ victory gives us victory over the evil forces that still seek to control us. Now we walk in the light and peace of His presence.\n\nGrowing in Christ means daily submission to His will, prayer, studying the Word, and witnessing to His grace."
    },
    "scripture": {
      "primaryQuotes_pl": [
        "\"Wszystko mogę w Tym, który mnie umacnia\" (Flp 4:13).",
        "\"Wzrastajcie zaś w łasce i poznaniu Pana naszego i Zbawiciela, Jezusa Chrystusa\" (2 P 3:18)."
      ],
      "primaryQuotes_en": [
        "\"I can do all things through Christ who strengthens me\" (Phil 4:13).",
        "\"But grow in the grace and knowledge of our Lord and Savior Jesus Christ\" (2 Pet 3:18)."
      ],
      "references": [
        "Ps 1:1, 2; 23:4; Łk 10:17-20; J 20:21; Rz 8:31-39; Kol 1:13, 14."
      ]
    },
    "discover": {
      "questions_pl": [
        "Jakie duchowe nawyki są fundamentem codziennego wzrastania w Chrystusie?"
      ],
      "questions_en": [
        "Jakie duchowe nawyki są fundamentem codziennego wzrastania w Chrystusie?"
      ],
      "items": [
        {
          "id": "d11_1",
          "prompt": "Jakie duchowe nawyki są fundamentem codziennego wzrastania w Chrystusie?",
          "sourceRefs": [
            "Kol 2:6-7",
            "Ef 6:10-18",
            "1 Tes 5:16-18"
          ],
          "readingExcerpt": "„Jak więc przyjęliście Chrystusa Jezusa, Pana, tak w Nim postępujcie: zapuszczeni w korzenie i na Nim budowani”."
        }
      ],
      "needsEditorialReview": false
    },
    "understand": {
      "summary_pl": "Przez śmierć na krzyżu Jezus zwyciężył moce zła. On, który podczas swej ziemskiej misji zwyciężył duchy demoniczne, przełamał ich potęgę i uczynił pewnym ich ostateczny los. Zwycięstwo Jezusa daje nam zwycięstwo nad siłami zła, które wciąż starają si...",
      "summary_en": "By His death on the cross Jesus triumphed over the forces of evil. He who subjugated the demonic spirits during His earthly ministry has broken their power and made certain their ultimate doom. Jesus’ victory gives us victory over the evil forces tha...",
      "needsEditorialReview": false
    },
    "quiz": {
      "questions": [
        {
          "id": "q11_1",
          "type": "single_choice",
          "question": "W jaki sposób chrześcijanin odnosi codzienne zwycięstwo nad pokusami i mocami ciemności?",
          "options": [
            "Polegając na własnej sile woli",
            "Przez modlitwę, badanie Słowa Bożego i trwanie w Chrystusie",
            "Unikając jakichkolwiek kontaktów z ludźmi",
            "Stosując zaklęcia ochronne"
          ],
          "correctAnswer": 1,
          "explanation": "Przez śmierć na krzyżu Jezus odniósł triumf nad złymi mocami, a my zwyciężamy dzięki Jego zbroi Bożej i nieustannej modlitwie (Ef 6:10-18, Kol 2:15).",
          "scriptureRefs": [
            "Ef 6:10-18",
            "Kol 2:15"
          ],
          "needsEditorialReview": false
        }
      ],
      "needsEditorialReview": false
    },
    "application": {
      "pl": "Czy czujesz się czasem przytłoczony walką duchową? Pamiętaj, że Jezus już zwyciężył. Twoim zadaniem nie jest wygrywanie wojny o własных siłach, ale trwanie w Zwycięzcy. Rozmawiaj dziś z Nim o każdym swoim lęku.\n\n---",
      "en": "How does this principle affect your daily life? Do you see the character of a loving Creator in it?\n\n---"
    },
    "prayer": {
      "pl": "Zrób to Dla Jezusa - On już czeka. Poświęć dziś czas, aby wzrastać w Jego obecności.",
      "en": "Do it for Jesus - He is already waiting. Take time today to grow in His presence."
    },
    "reflectionPrompts": {
      "pl": [
        "Co dzisiaj odkryłem w Słowie Bożym?",
        "Co konkretnie chcę zmienić lub zastosować?",
        "O co proszę Boga w modlitwie?"
      ],
      "en": [
        "What did I discover today in God’s Word?",
        "What specifically do I want to change or apply?",
        "What do I ask God for in prayer?"
      ]
    },
    "decisionPrompt": {
      "pl": "Przyjmuję prawdę o temacie: Wzrastanie w Chrystusie do mojego osobistego życia z Bogiem.",
      "en": "I accept the biblical truth regarding Wzrastanie w Chrystusie into my personal walk with God."
    },
    "seo": {
      "title_pl": "Wzrastanie w Chrystusie — Kurs Biblijny | LUMINA Bible Academy",
      "title_en": "Wzrastanie w Chrystusie — Bible Study | LUMINA Bible Academy",
      "description_pl": "Poznaj biblijne nauczanie na temat: Wzrastanie w Chrystusie. Interaktywny kurs biblijny Christian Culture.",
      "description_en": "Discover biblical teaching on: Wzrastanie w Chrystusie. Interactive Bible study by Christian Culture.",
      "canonicalUrl": "https://polskieradio.cc/kursy#lekcja-11"
    }
  },
  {
    "id": 12,
    "courseId": "biblijne-zasady-wiary-28",
    "stageId": "etap-3",
    "order": 12,
    "slug": "12-kosciol-bozy",
    "image": "/images/lessons/12.svg",
    "version": "1.0.0",
    "title": {
      "pl": "Kościół Boży",
      "en": "Kościół Boży"
    },
    "subtitle": {
      "pl": "Krok 12 z 28 • KOŚCIÓŁ BOŻY",
      "en": "Step 12 of 28 • THE CHURCH OF GOD"
    },
    "introduction": {
      "pl": "Rozważamy zasady wiary opierając się wyłącznie na Piśmie Świętym. Tematem dzisiejszej lekcji jest: **Kościół Boży**.",
      "en": "We consider the principles of faith based solely on the Holy Scriptures. The topic of today's lesson is: **The Church**."
    },
    "content": {
      "pl": "Kościół jest wspólnotą wierzących, którzy wyznają Jezusa Chrystusa jako Pana i Zbawiciela. Kontynuując starotestamentowy lud Boży, jesteśmy powołani ze świata i łączymy się dla wspólnego uwielbienia, dla społeczności, dla nauki Słowa Bożego, dla sprawowania Wieczerzy Pańskiej, dla służby całej ludzkości i dla ogłaszania Ewangelii całemu światu.\n\nKościół jest Ciałem Chrystusa, wspólnotą wiary, której On sam jest Głową.",
      "en": "The church is the community of believers who confess Jesus Christ as Lord and Savior. In continuity with the people of God in Old Testament times, we are called out from the world; and we join together for worship, for fellowship, for instruction in the Word, for the celebration of the Lord’s Supper, for service to humanity, and for the worldwide proclamation of the gospel.\n\nThe church is the body of Christ, a community of faith of which He Himself is the Head."
    },
    "scripture": {
      "primaryQuotes_pl": [
        "\"A On jest Głową Ciała, Kościoła\" (Kol 1:18).",
        "\"Wy zaś jesteście ciałem Chrystusowym, a z osobna członkami\" (1 Kor 12:27)."
      ],
      "primaryQuotes_en": [
        "\"And He is the head of the body, the church\" (Col 1:18).",
        "\"Now you are the body of Christ, and members individually\" (1 Cor 12:27)."
      ],
      "references": [
        "Rdz 12:1-3; Wj 19:3-7; Mt 16:13-20; 18:18; Ef 1:22, 23; 2:19-22."
      ]
    },
    "discover": {
      "questions_pl": [
        "Czym jest Kościół Boży i kto jest Jego jedyną Głową?"
      ],
      "questions_en": [
        "Czym jest Kościół Boży i kto jest Jego jedyną Głową?"
      ],
      "items": [
        {
          "id": "d12_1",
          "prompt": "Czym jest Kościół Boży i kto jest Jego jedyną Głową?",
          "sourceRefs": [
            "Ef 1:22-23",
            "Kol 1:18"
          ],
          "readingExcerpt": "„On także jest Głową Ciała — Kościoła. On jest Początkiem, Pierworodnym z umarłych”."
        }
      ],
      "needsEditorialReview": false
    },
    "understand": {
      "summary_pl": "Kościół jest wspólnotą wierzących, którzy wyznają Jezusa Chrystusa jako Pana i Zbawiciela. Kontynuując starotestamentowy lud Boży, jesteśmy powołani ze świata i łączymy się dla wspólnego uwielbienia, dla społeczności, dla nauki Słowa Bożego, dla spra...",
      "summary_en": "The church is the community of believers who confess Jesus Christ as Lord and Savior. In continuity with the people of God in Old Testament times, we are called out from the world; and we join together for worship, for fellowship, for instruction in ...",
      "needsEditorialReview": false
    },
    "quiz": {
      "questions": [
        {
          "id": "q12_1",
          "type": "single_choice",
          "question": "Kto jest jedyną i najwyższą Głową Kościoła Bożego według Nowego Testamentu?",
          "options": [
            "Ziemski monarcha lub patriarcha",
            "Jezus Chrystus",
            "Kolegium urzędników kościelnych",
            "Lider danej społeczności"
          ],
          "correctAnswer": 1,
          "explanation": "Bóg wszystko poddał pod stopy Chrystusa i ustanowił Go ponad wszystkim Głową Kościoła, który jest Jego Ciałem (Ef 1:22-23, Kol 1:18).",
          "scriptureRefs": [
            "Ef 1:22-23",
            "Kol 1:18"
          ],
          "needsEditorialReview": false
        }
      ],
      "needsEditorialReview": false
    },
    "application": {
      "pl": "Nie zostałeś powołany do samotności. Jesteś częścią wielkiej, Bożej rodziny. Twoje dary są potrzebne innym, a Ty potrzebujesz wsparcia braci i sióstr. Szukaj dziś okazji do budowania jedności w swojej wspólnocie.\n\n---",
      "en": "You were not called to be alone. You are part of a great, divine family. Your gifts are needed by others, and you need the support of your brothers and sisters. Look for opportunities today to build unity in your community.\n\n---"
    },
    "prayer": {
      "pl": "Zrób to Dla Jezusa - On już czeka. Bądź żywym członkiem Jego Ciała.",
      "en": "Do it for Jesus - He is already waiting. Be a living member of His Body."
    },
    "reflectionPrompts": {
      "pl": [
        "Co dzisiaj odkryłem w Słowie Bożym?",
        "Co konkretnie chcę zmienić lub zastosować?",
        "O co proszę Boga w modlitwie?"
      ],
      "en": [
        "What did I discover today in God’s Word?",
        "What specifically do I want to change or apply?",
        "What do I ask God for in prayer?"
      ]
    },
    "decisionPrompt": {
      "pl": "Przyjmuję prawdę o temacie: Kościół Boży do mojego osobistego życia z Bogiem.",
      "en": "I accept the biblical truth regarding Kościół Boży into my personal walk with God."
    },
    "seo": {
      "title_pl": "Kościół Boży — Kurs Biblijny | LUMINA Bible Academy",
      "title_en": "Kościół Boży — Bible Study | LUMINA Bible Academy",
      "description_pl": "Poznaj biblijne nauczanie na temat: Kościół Boży. Interaktywny kurs biblijny Christian Culture.",
      "description_en": "Discover biblical teaching on: Kościół Boży. Interactive Bible study by Christian Culture.",
      "canonicalUrl": "https://polskieradio.cc/kursy#lekcja-12"
    }
  },
  {
    "id": 13,
    "courseId": "biblijne-zasady-wiary-28",
    "stageId": "etap-3",
    "order": 13,
    "slug": "13-ostatek-i-jego-misja",
    "image": "/images/lessons/13.svg",
    "version": "1.0.0",
    "title": {
      "pl": "Ostatek i jego misja",
      "en": "Ostatek i jego misja"
    },
    "subtitle": {
      "pl": "Krok 13 z 28 • KOŚCIÓŁ BOŻY",
      "en": "Step 13 of 28 • THE CHURCH OF GOD"
    },
    "introduction": {
      "pl": "Rozważamy zasady wiary opierając się wyłącznie na Piśmie Świętym. Tematem dzisiejszej lekcji jest: **Ostatek i jego misja**.",
      "en": "We consider the principles of faith based solely on the Holy Scriptures. The topic of today's lesson is: **The Remnant and Its Mission**."
    },
    "content": {
      "pl": "Powszechny Kościół składa się ze wszystkich, którzy prawdziwie wierzą w Chrystusa. Jednak w dniach ostatecznych, w czasie powszechnego odstępstwa, powołany został ostatek, aby zachowywać przykazania Boże i wiarę Jezusa. Ten ostatek ogłasza nadejście godziny sądu, głosi zbawienie przez Chrystusa i zapowiada bliskość Jego powtórnego przyjścia.\n\nMisja ta jest symbolizowana przez trzech aniołów z 14. rozdziału Objawienia Jana.",
      "en": "The universal church is composed of all who truly believe in Christ, but in the last days, a time of widespread apostasy, a remnant has been called out to keep the commandments of God and the faith of Jesus. This remnant announces the arrival of the judgment hour, proclaims salvation through Christ, and heralds the approach of His second advent.\n\nThis mission is symbolized by the three angels of Revelation 14."
    },
    "scripture": {
      "primaryQuotes_pl": [
        "\"Tu się okaże wytrwanie świętych, którzy przestrzegają przykazań Bożych i wiary Jezusa\" (Obj 14:12).",
        "\"I rozgniewał się smok na niewiastę, i odszedł, by podjąć walkę z resztą jej potomstwa...\" (Obj 12:17)."
      ],
      "primaryQuotes_en": [
        "\"Here is the patience of the saints; here are those who keep the commandments of God and the faith of Jesus\" (Rev 14:12).",
        "\"And the dragon was enraged with the woman, and he went to make war with the rest of her offspring...\" (Rev 12:17)."
      ],
      "references": [
        "2 Kor 5:10; Obj 14:6-12; 18:1-4; 2 P 3:10-14."
      ]
    },
    "discover": {
      "questions_pl": [
        "Jakie znaki rozpoznawcze posiada lud Bożego ostatka w czasie końca?"
      ],
      "questions_en": [
        "Jakie znaki rozpoznawcze posiada lud Bożego ostatka w czasie końca?"
      ],
      "items": [
        {
          "id": "d13_1",
          "prompt": "Jakie znaki rozpoznawcze posiada lud Bożego ostatka w czasie końca?",
          "sourceRefs": [
            "Obj 12:17",
            "Obj 14:12"
          ],
          "readingExcerpt": "„Tu jest wytrwałość świętych, tych, którzy strzegą przykazań Boga i wiary Jezusa”."
        }
      ],
      "needsEditorialReview": false
    },
    "understand": {
      "summary_pl": "Powszechny Kościół składa się ze wszystkich, którzy prawdziwie wierzą w Chrystusa. Jednak w dniach ostatecznych, w czasie powszechnego odstępstwa, powołany został ostatek, aby zachowywać przykazania Boże i wiarę Jezusa. Ten ostatek ogłasza nadejście ...",
      "summary_en": "The universal church is composed of all who truly believe in Christ, but in the last days, a time of widespread apostasy, a remnant has been called out to keep the commandments of God and the faith of Jesus. This remnant announces the arrival of the ...",
      "needsEditorialReview": false
    },
    "quiz": {
      "questions": [
        {
          "id": "q13_1",
          "type": "single_choice",
          "question": "Które cechy charakteryzują lud przymierza ostatka według Objawienia 12:17 i 14:12?",
          "options": [
            "Strzeżenie przykazań Bożych i wiara Jezusa",
            "Dążenie do ziemskich zaszczytów i potęgi",
            "Zastępowanie Pisma Świętego tradycją ludzką",
            "Pasywne wycofanie się z głoszenia Ewangelii"
          ],
          "correctAnswer": 0,
          "explanation": "Pismo Święte definiuje ostatek jako tych, którzy strzegą przykazań Boga i mają świadectwo Jezusa Chrystusa (Obj 12:17, Obj 14:12).",
          "scriptureRefs": [
            "Obj 12:17",
            "Obj 14:12"
          ],
          "needsEditorialReview": false
        }
      ],
      "needsEditorialReview": false
    },
    "application": {
      "pl": "Czy słyszysz Boże wołanie do wierności w świecie pełnym kompromisów? Jako część ostatka jesteś posłańcem nadziei. Nie bój się stać przy prawdzie, nawet gdy większość idzie w inną stronę. Twoja wierność ma znaczenie wieczne.\n\n---",
      "en": "Do you hear God's call to faithfulness in a world full of compromise? As part of the remnant, you are a messenger of hope. Do not be afraid to stand for the truth, even when the majority goes the other way. Your faithfulness has eternal significance.\n\n---"
    },
    "prayer": {
      "pl": "Zrób to Dla Jezusa - On już czeka. Nieś światło w ciemnościach.",
      "en": "Do it for Jesus - He is already waiting. Carry the light in the darkness."
    },
    "reflectionPrompts": {
      "pl": [
        "Co dzisiaj odkryłem w Słowie Bożym?",
        "Co konkretnie chcę zmienić lub zastosować?",
        "O co proszę Boga w modlitwie?"
      ],
      "en": [
        "What did I discover today in God’s Word?",
        "What specifically do I want to change or apply?",
        "What do I ask God for in prayer?"
      ]
    },
    "decisionPrompt": {
      "pl": "Przyjmuję prawdę o temacie: Ostatek i jego misja do mojego osobistego życia z Bogiem.",
      "en": "I accept the biblical truth regarding Ostatek i jego misja into my personal walk with God."
    },
    "seo": {
      "title_pl": "Ostatek i jego misja — Kurs Biblijny | LUMINA Bible Academy",
      "title_en": "Ostatek i jego misja — Bible Study | LUMINA Bible Academy",
      "description_pl": "Poznaj biblijne nauczanie na temat: Ostatek i jego misja. Interaktywny kurs biblijny Christian Culture.",
      "description_en": "Discover biblical teaching on: Ostatek i jego misja. Interactive Bible study by Christian Culture.",
      "canonicalUrl": "https://polskieradio.cc/kursy#lekcja-13"
    }
  },
  {
    "id": 14,
    "courseId": "biblijne-zasady-wiary-28",
    "stageId": "etap-3",
    "order": 14,
    "slug": "14-jednosc-ciala-chrystusa",
    "image": "/images/lessons/14.svg",
    "version": "1.0.0",
    "title": {
      "pl": "Jedność Ciała Chrystusa",
      "en": "Jedność Ciała Chrystusa"
    },
    "subtitle": {
      "pl": "Krok 14 z 28 • KOŚCIÓŁ BOŻY",
      "en": "Step 14 of 28 • THE CHURCH OF GOD"
    },
    "introduction": {
      "pl": "Rozważamy zasady wiary opierając się wyłącznie na Piśmie Świętym. Tematem dzisiejszej lekcji jest: **Jedność Ciała Chrystusa**.",
      "en": "We consider the principles of faith based solely on the Holy Scriptures. The topic of today's lesson is: **Unity in the Body of Christ**."
    },
    "content": {
      "pl": "Kościół jest jednym ciałem z wieloma członkami, powołanymi z każdego narodu, pokolenia, języka i ludu. W Chrystusie jesteśmy nowym stworzeniem; różnice rasy, kultury, wykształcenia, narodowości, a także różnice między wysokim i niskim stanem, bogatym i biednym, mężczyzną i kobietą, nie powinny nas dzielić.\n\nWszyscy jesteśmy równi w Chrystusie, który przez jednego Ducha złączył nas w jedną społeczność z Nim i ze sobą nawzajem.",
      "en": "The church is one body with many members, called from every nation, kindred, tongue, and people. In Christ we are a new creation; distinctions of race, culture, learning, and nationality, and differences between high and low, rich and poor, male and female, must not be divisive among us.\n\nWe are all equal in Christ, who by one Spirit has bonded us into one fellowship with Him and with one another."
    },
    "scripture": {
      "primaryQuotes_pl": [
        "\"Nie masz Żyda ani Greka... albowiem wy wszyscy jedno jesteście w Chrystusie Jezusie\" (Gal 3:28).",
        "\"Starając się zachować jedność Ducha w pomostu pokoju\" (Ef 4:3)."
      ],
      "primaryQuotes_en": [
        "\"There is neither Jew nor Greek... for you are all one in Christ Jesus\" (Gal 3:28).",
        "\"Endeavoring to keep the unity of the Spirit in the bond of peace\" (Eph 4:3)."
      ],
      "references": [
        "Ps 133:1; 1 Kor 12:12-14; 2 Kor 5:16, 17; Gal 3:27-29."
      ]
    },
    "discover": {
      "questions_pl": [
        "O jaką jedność modlił się Jezus dla Swoich uczniów przed pójściem na krzyż?"
      ],
      "questions_en": [
        "O jaką jedność modlił się Jezus dla Swoich uczniów przed pójściem na krzyż?"
      ],
      "items": [
        {
          "id": "d14_1",
          "prompt": "O jaką jedność modlił się Jezus dla Swoich uczniów przed pójściem na krzyż?",
          "sourceRefs": [
            "J 17:20-23"
          ],
          "readingExcerpt": "„Aby wszyscy byli jedno, jak Ty, Ojcze, we Mnie, a Ja w Tobie, aby i oni w Nas byli jedno, by świat uwierzył, że Ty Mnie posłałeś”."
        }
      ],
      "needsEditorialReview": false
    },
    "understand": {
      "summary_pl": "Kościół jest jednym ciałem z wieloma członkami, powołanymi z każdego narodu, pokolenia, języka i ludu. W Chrystusie jesteśmy nowym stworzeniem; różnice rasy, kultury, wykształcenia, narodowości, a także różnice między wysokim i niskim stanem, bogatym...",
      "summary_en": "The church is one body with many members, called from every nation, kindred, tongue, and people. In Christ we are a new creation; distinctions of race, culture, learning, and nationality, and differences between high and low, rich and poor, male and ...",
      "needsEditorialReview": false
    },
    "quiz": {
      "questions": [
        {
          "id": "q14_1",
          "type": "true_false",
          "question": "W Ciele Chrystusa nie ma miejsca na uprzedzenia rasowe, społeczne czy narodowe — wszyscy jesteśmy jedno w Chrystusie.",
          "options": [
            "Prawda",
            "Fałsz"
          ],
          "correctAnswer": 0,
          "explanation": "„Nie ma już Żyda ani poganina, nie ma niewolnika ani wolnego, nie ma mężczyzny ani kobiety; wszyscy bowiem jedno jesteście w Chrystusie Jezusie” (Ga 3:28).",
          "scriptureRefs": [
            "Ga 3:28",
            "Ef 4:3-6"
          ],
          "needsEditorialReview": false
        }
      ],
      "needsEditorialReview": false
    },
    "application": {
      "pl": "Jedność nie oznacza jednolitości. Bóg kocha różnorodność, ale nienawidzi podziałów. Czy w Twoim sercu są bariery wobec innych ludzi? Proś dziś Pana, aby pomógł Ci widzieć innych Jego oczami – jako braci i siostry w tej samej rodzinie.\n\n---",
      "en": "Unity does not mean uniformity. God loves diversity but hates division. Are there barriers in your heart against other people? Ask the Lord today to help you see others through His eyes – as brothers and sisters in the same family.\n\n---"
    },
    "prayer": {
      "pl": "Zrób to Dla Jezusa - On już czeka. Buduj mosty, nie mury.",
      "en": "Do it for Jesus - He is already waiting. Build bridges, not walls."
    },
    "reflectionPrompts": {
      "pl": [
        "Co dzisiaj odkryłem w Słowie Bożym?",
        "Co konkretnie chcę zmienić lub zastosować?",
        "O co proszę Boga w modlitwie?"
      ],
      "en": [
        "What did I discover today in God’s Word?",
        "What specifically do I want to change or apply?",
        "What do I ask God for in prayer?"
      ]
    },
    "decisionPrompt": {
      "pl": "Przyjmuję prawdę o temacie: Jedność Ciała Chrystusa do mojego osobistego życia z Bogiem.",
      "en": "I accept the biblical truth regarding Jedność Ciała Chrystusa into my personal walk with God."
    },
    "seo": {
      "title_pl": "Jedność Ciała Chrystusa — Kurs Biblijny | LUMINA Bible Academy",
      "title_en": "Jedność Ciała Chrystusa — Bible Study | LUMINA Bible Academy",
      "description_pl": "Poznaj biblijne nauczanie na temat: Jedność Ciała Chrystusa. Interaktywny kurs biblijny Christian Culture.",
      "description_en": "Discover biblical teaching on: Jedność Ciała Chrystusa. Interactive Bible study by Christian Culture.",
      "canonicalUrl": "https://polskieradio.cc/kursy#lekcja-14"
    }
  },
  {
    "id": 15,
    "courseId": "biblijne-zasady-wiary-28",
    "stageId": "etap-3",
    "order": 15,
    "slug": "15-chrzest",
    "image": "/images/lessons/15.svg",
    "version": "1.0.0",
    "title": {
      "pl": "Chrzest",
      "en": "Chrzest"
    },
    "subtitle": {
      "pl": "Krok 15 z 28 • KOŚCIÓŁ BOŻY",
      "en": "Step 15 of 28 • THE CHURCH OF GOD"
    },
    "introduction": {
      "pl": "Rozważamy zasady wiary opierając się wyłącznie na Piśmie Świętym. Tematem dzisiejszej lekcji jest: **Chrzest**.",
      "en": "We consider the principles of faith based solely on the Holy Scriptures. The topic of today's lesson is: **Baptism**."
    },
    "content": {
      "pl": "Przez chrzest wyznajemy naszą wiarę w śmierć i zmartwychwstanie Jezusa Chrystusa oraz świadczymy o naszym uśmierceniu dla grzechu i o zamiarze chodzenia w odnowionym życiu. W ten sposób uznajemy Chrystusa jako Pana i Zbawiciela, stajemy się Jego ludem i zostajemy przyjęci w poczet członków Jego Kościoła.\n\nChrzest jest symbolem naszego połączenia z Chrystusem, przebaczenia grzechów i otrzymania Ducha Świętego. Jest on sprawowany przez zanurzenie w wodzie i jest uwarunkowany wyznaniem wiary w Jezusa oraz dowodami upamiętania.",
      "en": "By baptism we confess our faith in the death and resurrection of Jesus Christ, and testify of our death to sin and of our purpose to walk in newness of life. Thus we acknowledge Christ as Lord and Savior, become His people, and are received as members by His church.\n\nBaptism is a symbol of our union with Christ, the forgiveness of our sins, and our reception of the Holy Spirit. It is by immersion in water and is contingent on an affirmation of faith in Jesus and evidence of repentance of sin."
    },
    "scripture": {
      "primaryQuotes_pl": [
        "\"Idźcie więc i nauczajcie wszystkie narody, udzielając im chrztu w imię Ojca i Syna, i Ducha Świętego\" (Mt 28:19).",
        "\"Kto uwierzy i ochrzczony zostanie, będzie zbawiony\" (Mk 16:16)."
      ],
      "primaryQuotes_en": [
        "\"Go therefore and make disciples of all the nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit\" (Matt 28:19).",
        "\"He who believes and is baptized will be saved\" (Mark 16:16)."
      ],
      "references": [
        "Mt 3:13-17; Rz 6:1-6; Kol 2:12, 13; Dz 2:38; 8:36-39; 16:30-33; 22:16."
      ]
    },
    "discover": {
      "questions_pl": [
        "Co symbolizuje biblijny chrzest przez całkowite zanurzenie w wodzie?"
      ],
      "questions_en": [
        "Co symbolizuje biblijny chrzest przez całkowite zanurzenie w wodzie?"
      ],
      "items": [
        {
          "id": "d15_1",
          "prompt": "Co symbolizuje biblijny chrzest przez całkowite zanurzenie w wodzie?",
          "sourceRefs": [
            "Rz 6:3-5",
            "Kol 2:12"
          ],
          "readingExcerpt": "„Zostaliśmy więc z Nim pogrzebani przez chrzest w śmierć, abyśmy i my wkroczyli w nowe życie — jak Chrystus powstał z martwych”."
        }
      ],
      "needsEditorialReview": false
    },
    "understand": {
      "summary_pl": "Przez chrzest wyznajemy naszą wiarę w śmierć i zmartwychwstanie Jezusa Chrystusa oraz świadczymy o naszym uśmierceniu dla grzechu i o zamiarze chodzenia w odnowionym życiu. W ten sposób uznajemy Chrystusa jako Pana i Zbawiciela, stajemy się Jego lude...",
      "summary_en": "By baptism we confess our faith in the death and resurrection of Jesus Christ, and testify of our death to sin and of our purpose to walk in newness of life. Thus we acknowledge Christ as Lord and Savior, become His people, and are received as member...",
      "needsEditorialReview": false
    },
    "quiz": {
      "questions": [
        {
          "id": "q15_1",
          "type": "single_choice",
          "question": "Jaka biblijna forma chrztu odzwierciedla pogrzeb starego człowieka i zmartwychwstanie do nowego życia?",
          "options": [
            "Pokropienie niemowlęcia bez jego świadomości",
            "Całkowite zanurzenie w wodzie na wyznanie osobistej wiary",
            "Podpisanie karty członkowskiej",
            "Złożenie przysięgi wojskowej"
          ],
          "correctAnswer": 1,
          "explanation": "Biblijne słowo baptizo oznacza „zanurzyć”. Chrzest jest świadomym przymierzem wiary dorosłego człowieka, który umiera dla grzechu i powstaje do nowego życia (Dz 8:36-39, Rz 6:3-4).",
          "scriptureRefs": [
            "Rz 6:3-4",
            "Dz 8:36-39"
          ],
          "needsEditorialReview": false
        }
      ],
      "needsEditorialReview": false
    },
    "application": {
      "pl": "Czy Twój chrzest był momentem, w którym świadomie oddałeś życie Jezusowi? Jeśli jeszcze tego nie zrobiłeś, pamiętaj, że to publiczna deklaracja miłości i wierności Twojemu Zbawicielowi. To brama do nowej tożsamości.\n\n---",
      "en": "Was your baptism a moment when you consciously gave your life to Jesus? If you haven't done it yet, remember it's a public declaration of love and loyalty to your Savior. It's the gateway to a new identity.\n\n---"
    },
    "prayer": {
      "pl": "Zrób to Dla Jezusa - On już czeka. Niech Twoje życie świadczy o Jego mocy.",
      "en": "Do it for Jesus - He is already waiting. Let your life testify to His power."
    },
    "reflectionPrompts": {
      "pl": [
        "Co dzisiaj odkryłem w Słowie Bożym?",
        "Co konkretnie chcę zmienić lub zastosować?",
        "O co proszę Boga w modlitwie?"
      ],
      "en": [
        "What did I discover today in God’s Word?",
        "What specifically do I want to change or apply?",
        "What do I ask God for in prayer?"
      ]
    },
    "decisionPrompt": {
      "pl": "Przyjmuję prawdę o temacie: Chrzest do mojego osobistego życia z Bogiem.",
      "en": "I accept the biblical truth regarding Chrzest into my personal walk with God."
    },
    "seo": {
      "title_pl": "Chrzest — Kurs Biblijny | LUMINA Bible Academy",
      "title_en": "Chrzest — Bible Study | LUMINA Bible Academy",
      "description_pl": "Poznaj biblijne nauczanie na temat: Chrzest. Interaktywny kurs biblijny Christian Culture.",
      "description_en": "Discover biblical teaching on: Chrzest. Interactive Bible study by Christian Culture.",
      "canonicalUrl": "https://polskieradio.cc/kursy#lekcja-15"
    }
  },
  {
    "id": 16,
    "courseId": "biblijne-zasady-wiary-28",
    "stageId": "etap-3",
    "order": 16,
    "slug": "16-wieczerza-panska",
    "image": "/images/lessons/16.svg",
    "version": "1.0.0",
    "title": {
      "pl": "Wieczerza Pańska",
      "en": "Wieczerza Pańska"
    },
    "subtitle": {
      "pl": "Krok 16 z 28 • KOŚCIÓŁ BOŻY",
      "en": "Step 16 of 28 • THE CHURCH OF GOD"
    },
    "introduction": {
      "pl": "Rozważamy zasady wiary opierając się wyłącznie na Piśmie Świętym. Tematem dzisiejszej lekcji jest: **Wieczerza Pańska**.",
      "en": "We consider the principles of faith based solely on the Holy Scriptures. The topic of today's lesson is: **The Lord Supper**."
    },
    "content": {
      "pl": "Wieczerza Pańska jest uczestnictwem w symbolach ciała i krwi Jezusa, wyrażonych przez chleb i owoc winny. Jest ona wyrazem wiary w Pana jako Zbawiciela. W czasie obrzędu Wieczerzy Chrystus jest obecny przez Ducha, by spotykać się ze swym ludem i umacniać go. Sprawowanie Wieczerzy poprzedzone jest obrzędem umywania nóg, który jest symbolem ponownego oczyszczenia i wyrazem gotowości do służby braterskiej w pokorze Chrystusowej.\n\nNabożeństwo to jest pamiątką ofiary Jezusa i zapowiedzią Jego powtórnego przyjścia.",
      "en": "The Lord Supper is a participation in the emblems of the body and blood of Jesus as an expression of faith in Him, our Lord and Savior. In this experience of communion Christ is present to meet and strengthen His people. The service includes the ordinance of foot washing, signifying renewed cleansing and an expression of willingness to serve one another in Christ-like humility.\n\nThe communion service is a memorial of the sacrifice of Jesus and a proclamation of His second coming."
    },
    "scripture": {
      "primaryQuotes_pl": [
        "\"To czyńcie na pamiątkę moją\" (1 Kor 11:24, 25).",
        "\"Jeśli ja więc, Pan i Nauczyciel, umyłem nogi wasze, i wy powinniście sobie nawzajem nogi umywać\" (J 13:14)."
      ],
      "primaryQuotes_en": [
        "\"This do in remembrance of Me\" (1 Cor 11:24, 25).",
        "\"If I then, your Lord and Teacher, have washed your feet, you also ought to wash one another’s feet\" (John 13:14)."
      ],
      "references": [
        "Mt 26:17-30; 1 Kor 10:16, 17; J 6:33-63; Obj 19:9."
      ]
    },
    "discover": {
      "questions_pl": [
        "Jaki gest pokory i wzajemnej służby ustanowił Jezus bezpośrednio przed Wieczerzą Pańską?"
      ],
      "questions_en": [
        "Jaki gest pokory i wzajemnej służby ustanowił Jezus bezpośrednio przed Wieczerzą Pańską?"
      ],
      "items": [
        {
          "id": "d16_1",
          "prompt": "Jaki gest pokory i wzajemnej służby ustanowił Jezus bezpośrednio przed Wieczerzą Pańską?",
          "sourceRefs": [
            "J 13:4-15"
          ],
          "readingExcerpt": "„Jeżeli więc Ja, Pan i Nauczyciel, umyłem wam nogi, to i wy powinniście sobie nawzajem umywać nogi. Dałem wam bowiem przykład”."
        }
      ],
      "needsEditorialReview": false
    },
    "understand": {
      "summary_pl": "Wieczerza Pańska jest uczestnictwem w symbolach ciała i krwi Jezusa, wyrażonych przez chleb i owoc winny. Jest ona wyrazem wiary w Pana jako Zbawiciela. W czasie obrzędu Wieczerzy Chrystus jest obecny przez Ducha, by spotykać się ze swym ludem i umac...",
      "summary_en": "The Lord Supper is a participation in the emblems of the body and blood of Jesus as an expression of faith in Him, our Lord and Savior. In this experience of communion Christ is present to meet and strengthen His people. The service includes the ordi...",
      "needsEditorialReview": false
    },
    "quiz": {
      "questions": [
        {
          "id": "q16_1",
          "type": "single_choice",
          "question": "Co oznaczają chleb i wino w Wieczerzy Pańskiej zgodnie ze słowami Jezusa (1 Kor 11:23-26)?",
          "options": [
            "Zwykły posiłek towarzyski",
            "Pamiątkę i zwiastowanie Ciała oraz Krwi Chrystusa aż do Jego powtórnego przyjścia",
            "Magiczne talizmany przynoszące szczęście",
            "Podatek świątynny"
          ],
          "correctAnswer": 1,
          "explanation": "Chleb i wino są uświęconymi symbolami złamanego ciała i przelanej krwi Zbawiciela, którymi głosimy Jego śmierć, aż przyjdzie (1 Kor 11:23-26).",
          "scriptureRefs": [
            "1 Kor 11:23-26"
          ],
          "needsEditorialReview": false
        }
      ],
      "needsEditorialReview": false
    },
    "application": {
      "pl": "Kiedy ostatnio klękałeś, by służyć bratu lub siostrze? Wieczerza to nie tylko rytuał, to stanięcie twarzą w twarz z miłością Chrystusa, która uniżyła się dla Ciebie. Przyjdź do stołu Pana z czystym sercem i gotowością do przebaczenia.\n\n---",
      "en": "When was the last time you knelt to serve a brother or sister? Communion is not just a ritual; it's standing face to face with the love of Christ, who humbled Himself for you. Come to the Lord's table with a pure heart and a readiness to forgive.\n\n---"
    },
    "prayer": {
      "pl": "Zrób to Dla Jezusa - On już czeka. Świętuj Jego zwycięstwo.",
      "en": "Do it for Jesus - He is already waiting. Celebrate His victory."
    },
    "reflectionPrompts": {
      "pl": [
        "Co dzisiaj odkryłem w Słowie Bożym?",
        "Co konkretnie chcę zmienić lub zastosować?",
        "O co proszę Boga w modlitwie?"
      ],
      "en": [
        "What did I discover today in God’s Word?",
        "What specifically do I want to change or apply?",
        "What do I ask God for in prayer?"
      ]
    },
    "decisionPrompt": {
      "pl": "Przyjmuję prawdę o temacie: Wieczerza Pańska do mojego osobistego życia z Bogiem.",
      "en": "I accept the biblical truth regarding Wieczerza Pańska into my personal walk with God."
    },
    "seo": {
      "title_pl": "Wieczerza Pańska — Kurs Biblijny | LUMINA Bible Academy",
      "title_en": "Wieczerza Pańska — Bible Study | LUMINA Bible Academy",
      "description_pl": "Poznaj biblijne nauczanie na temat: Wieczerza Pańska. Interaktywny kurs biblijny Christian Culture.",
      "description_en": "Discover biblical teaching on: Wieczerza Pańska. Interactive Bible study by Christian Culture.",
      "canonicalUrl": "https://polskieradio.cc/kursy#lekcja-16"
    }
  },
  {
    "id": 17,
    "courseId": "biblijne-zasady-wiary-28",
    "stageId": "etap-3",
    "order": 17,
    "slug": "17-dary-i-poslugi-duchowe",
    "image": "/images/lessons/17.svg",
    "version": "1.0.0",
    "title": {
      "pl": "Dary i posługi duchowe",
      "en": "Dary i posługi duchowe"
    },
    "subtitle": {
      "pl": "Krok 17 z 28 • KOŚCIÓŁ BOŻY",
      "en": "Step 17 of 28 • THE CHURCH OF GOD"
    },
    "introduction": {
      "pl": "Rozważamy zasady wiary opierając się wyłącznie na Piśmie Świętym. Tematem dzisiejszej lekcji jest: **Dary i posługi duchowe**.",
      "en": "We consider the principles of faith based solely on the Holy Scriptures. The topic of today's lesson is: **Spiritual Gifts and Ministries**."
    },
    "content": {
      "pl": "Bóg udziela wszystkim członkom swego Kościoła w każdym wieku darów duchowych, które każdy z nich powinien wykorzystywać w służbie miłości dla wspólnego dobra Kościoła i ludzkości. Dary te, udzielane przez Ducha Świętego, obejmują takie posługi jak wiara, uzdrawianie, proroctwo, głoszenie, nauczanie, administracja, pojednanie, współczucie oraz ofiarna pomoc bliźnim.\n\nNiektórzy członkowie zostają powołani przez Boga i wyposażeni przez Ducha do szczególnych funkcji duszpasterskich, ewangelizacyjnych i nauczycielskich.",
      "en": "God bestows upon all members of His church in every age spiritual gifts, which each member is to employ in loving ministry for the common good of the church and of humanity. Given by the Holy Spirit, these gifts include such ministries as faith, healing, prophecy, proclamation, teaching, administration, reconciliation, compassion, and self-sacrificing service for the help and encouragement of people.\n\nSome members are called by God and endowed by the Spirit for functions recognized by the church in pastoral, evangelistic, and teaching ministries."
    },
    "scripture": {
      "primaryQuotes_pl": [
        "\"A dary są różne, lecz Duch ten sam\" (1 Kor 12:4).",
        "\"I On ustanowił jednych apostołami, drugich prorokami... dla budowania Ciała Chrystusowego\" (Ef 4:11, 12)."
      ],
      "primaryQuotes_en": [
        "\"There are diversities of gifts, but the same Spirit\" (1 Cor 12:4).",
        "\"And He Himself gave some to be apostles, some prophets... for the edifying of the body of Christ\" (Eph 4:11, 12)."
      ],
      "references": [
        "Rz 12:4-8; 1 Kor 12:9-11, 27, 28; Ef 4:8; Dz 6:1-7; 1 Tm 3:1-13."
      ]
    },
    "discover": {
      "questions_pl": [
        "W jakim celu Duch Święty udziela każdemu wierzącemu darów duchowych?"
      ],
      "questions_en": [
        "W jakim celu Duch Święty udziela każdemu wierzącemu darów duchowych?"
      ],
      "items": [
        {
          "id": "d17_1",
          "prompt": "W jakim celu Duch Święty udziela każdemu wierzącemu darów duchowych?",
          "sourceRefs": [
            "1 Kor 12:7",
            "Ef 4:11-13"
          ],
          "readingExcerpt": "„Wszystkim zaś objawia się Duch dla wspólnego dobra... celem przysposobienia świętych do wykonywania posługi, dla budowania Ciała Chrystusa”."
        }
      ],
      "needsEditorialReview": false
    },
    "understand": {
      "summary_pl": "Bóg udziela wszystkim członkom swego Kościoła w każdym wieku darów duchowych, które każdy z nich powinien wykorzystywać w służbie miłości dla wspólnego dobra Kościoła i ludzkości. Dary te, udzielane przez Ducha Świętego, obejmują takie posługi jak wi...",
      "summary_en": "God bestows upon all members of His church in every age spiritual gifts, which each member is to employ in loving ministry for the common good of the church and of humanity. Given by the Holy Spirit, these gifts include such ministries as faith, heal...",
      "needsEditorialReview": false
    },
    "quiz": {
      "questions": [
        {
          "id": "q17_1",
          "type": "true_false",
          "question": "Dary duchowe są udzielane przez Ducha Świętego według Jego woli każdemu wierzącemu, dla dobra i wzrostu Kościoła.",
          "options": [
            "Prawda",
            "Fałsz"
          ],
          "correctAnswer": 0,
          "explanation": "„Wszystko zaś to sprawia jeden i ten sam Duch, udzielając każdemu tak, jak chce” (1 Kor 12:11).",
          "scriptureRefs": [
            "1 Kor 12:11"
          ],
          "needsEditorialReview": false
        }
      ],
      "needsEditorialReview": false
    },
    "application": {
      "pl": "Bóg nie daje darów dla Twojej chwały, ale dla pożytku innych. Czy wiesz, jaki dar złożył w Tobie Duch Święty? Nie zakopuj swoich talentów. Każda, nawet najmniejsza służba, ma znaczenie w budowaniu Królestwa Bożego.\n\n---",
      "en": "God does not give gifts for your glory, but for the benefit of others. Do you know what gift the Holy Spirit has placed in you? Do not bury your talents. Every service, even the smallest, matters in building the Kingdom of God.\n\n---"
    },
    "prayer": {
      "pl": "Zrób to Dla Jezusa - On już czeka. Odkryj i użyj swojego daru.",
      "en": "Do it for Jesus - He is already waiting. Discover and use your gift."
    },
    "reflectionPrompts": {
      "pl": [
        "Co dzisiaj odkryłem w Słowie Bożym?",
        "Co konkretnie chcę zmienić lub zastosować?",
        "O co proszę Boga w modlitwie?"
      ],
      "en": [
        "What did I discover today in God’s Word?",
        "What specifically do I want to change or apply?",
        "What do I ask God for in prayer?"
      ]
    },
    "decisionPrompt": {
      "pl": "Przyjmuję prawdę o temacie: Dary i posługi duchowe do mojego osobistego życia z Bogiem.",
      "en": "I accept the biblical truth regarding Dary i posługi duchowe into my personal walk with God."
    },
    "seo": {
      "title_pl": "Dary i posługi duchowe — Kurs Biblijny | LUMINA Bible Academy",
      "title_en": "Dary i posługi duchowe — Bible Study | LUMINA Bible Academy",
      "description_pl": "Poznaj biblijne nauczanie na temat: Dary i posługi duchowe. Interaktywny kurs biblijny Christian Culture.",
      "description_en": "Discover biblical teaching on: Dary i posługi duchowe. Interactive Bible study by Christian Culture.",
      "canonicalUrl": "https://polskieradio.cc/kursy#lekcja-17"
    }
  },
  {
    "id": 18,
    "courseId": "biblijne-zasady-wiary-28",
    "stageId": "etap-3",
    "order": 18,
    "slug": "18-dar-proroctwa",
    "image": "/images/lessons/18.svg",
    "version": "1.0.0",
    "title": {
      "pl": "Dar proroctwa",
      "en": "Dar proroctwa"
    },
    "subtitle": {
      "pl": "Krok 18 z 28 • KOŚCIÓŁ BOŻY",
      "en": "Step 18 of 28 • THE CHURCH OF GOD"
    },
    "introduction": {
      "pl": "Rozważamy zasady wiary opierając się wyłącznie na Piśmie Świętym. Tematem dzisiejszej lekcji jest: **Dar proroctwa**.",
      "en": "We consider the principles of faith based solely on the Holy Scriptures. The topic of today's lesson is: **The Gift of Prophecy**."
    },
    "content": {
      "pl": "Pismo Święte świadczy, że jednym z darów Ducha Świętego jest proroctwo. Dar ten jest jednym z wyróżniających znamion ludu Bożego czasów ostatecznych (Obj 12:17, 19:10). Posługa prorocka niesie Kościołowi pociechę, prowadzenie, pouczenie i napomnienie.\n\nBiblia wyraźnie naucza, że Pismo Święte jest jedyną najwyższą normą i probierzem, według którego należy badać wszelkie nauczanie, dary i doświadczenia duchowe (Iz 8:20, 1 Tes 5:19-21).",
      "en": "The Scriptures testify that one of the gifts of the Holy Spirit is prophecy. This gift is an identifying mark of God's remnant church (Rev 12:17, 19:10). Prophetic ministry provides the church with comfort, guidance, instruction, and encouragement.\n\nThe Bible clearly teaches that the Holy Scriptures are the sole, ultimate standard by which all teaching, gifts, and spiritual experiences must be tested (Isa 8:20, 1 Thess 5:19-21)."
    },
    "scripture": {
      "primaryQuotes_pl": [
        "\"Uwierzcie prorokom jego, a poszczęści się wam\" (2 Krn 20:20).",
        "\"Proroctwa nie lekceważcie\" (1 Tes 5:20)."
      ],
      "primaryQuotes_en": [
        "\"Believe His prophets, and you shall prosper\" (2 Chron 20:20).",
        "\"Do not despise prophecies\" (1 Thess 5:20)."
      ],
      "references": [
        "Jl 2:28, 29; Dz 2:14-21; Hbr 1:1-3; Obj 12:17; 19:10."
      ]
    },
    "discover": {
      "questions_pl": [
        "Czym jest „świadectwo Jezusa” według definicji anioła w Księdze Objawienia?"
      ],
      "questions_en": [
        "Czym jest „świadectwo Jezusa” według definicji anioła w Księdze Objawienia?"
      ],
      "items": [
        {
          "id": "d18_1",
          "prompt": "Czym jest „świadectwo Jezusa” według definicji anioła w Księdze Objawienia?",
          "sourceRefs": [
            "Obj 19:10",
            "Obj 12:17"
          ],
          "readingExcerpt": "„Świadectwem bowiem Jezusa jest duch proroctwa”."
        }
      ],
      "needsEditorialReview": false
    },
    "understand": {
      "summary_pl": "Pismo Święte świadczy, że jednym z darów Ducha Świętego jest proroctwo. Dar ten jest znamieniem ludu Bożego w czasach ostatecznych. Pismo Święte pozostaje jedyną najwyższą normą i probierzem badania wszelkich darów duchowych.",
      "summary_en": "The Scriptures testify that prophecy is a gift of the Holy Spirit and a mark of God's people in the end times. The Holy Scriptures remain the sole, ultimate standard for testing all spiritual gifts.",
      "needsEditorialReview": false
    },
    "quiz": {
      "questions": [
        {
          "id": "q18_1",
          "type": "single_choice",
          "question": "Jaka jest relacja wszelkich pism i posług prorockich do kanonu Pisma Świętego?",
          "options": [
            "Pisma prorockie zastępują Pismo Święte w czasach ostatecznych",
            "Pismo Święte jest jedynym najwyższym probierzem, którym należy badać wszelkie twierdzenia prorockie",
            "Proroctwa są ważniejsze niż nauka Ewangelii",
            "Nie wolno weryfikować żadnych słów proroków"
          ],
          "correctAnswer": 1,
          "explanation": "„Do prawa i do świadectwa! Jeśli nie mówią zgodnie z tym słowem, to nie ma dla nich jutrzenki” (Iz 8:20, 1 Tes 5:19-21). Pismo Święte jest ostateczną miarą.",
          "scriptureRefs": [
            "Iz 8:20",
            "1 Tes 5:19-21"
          ],
          "needsEditorialReview": false
        }
      ],
      "needsEditorialReview": false
    },
    "application": {
      "pl": "Bóg nie przestał przemawiać do swojego ludu. Ceniąc dar proroctwa, zyskujemy głębsze zrozumienie Biblii i czasu, w którym żyjemy. Czy czytasz natchnione pisma, które przybliżają Cię do Jezusa?\n\n---",
      "en": "God has not stopped speaking to His people. By valuing the gift of prophecy, we gain a deeper understanding of the Bible and the time in which we live. Do you read inspired writings that bring you closer to Jesus?\n\n---"
    },
    "prayer": {
      "pl": "Zrób to Dla Jezusa - On już czeka. Słuchaj głosu natchnienia.",
      "en": "Do it for Jesus - He is already waiting. Listen to the voice of inspiration."
    },
    "reflectionPrompts": {
      "pl": [
        "Co dzisiaj odkryłem w Słowie Bożym?",
        "Co konkretnie chcę zmienić lub zastosować?",
        "O co proszę Boga w modlitwie?"
      ],
      "en": [
        "What did I discover today in God’s Word?",
        "What specifically do I want to change or apply?",
        "What do I ask God for in prayer?"
      ]
    },
    "decisionPrompt": {
      "pl": "Przyjmuję prawdę o temacie: Dar proroctwa do mojego osobistego życia z Bogiem.",
      "en": "I accept the biblical truth regarding Dar proroctwa into my personal walk with God."
    },
    "seo": {
      "title_pl": "Dar proroctwa — Kurs Biblijny | LUMINA Bible Academy",
      "title_en": "Dar proroctwa — Bible Study | LUMINA Bible Academy",
      "description_pl": "Poznaj biblijne nauczanie na temat: Dar proroctwa. Interaktywny kurs biblijny Christian Culture.",
      "description_en": "Discover biblical teaching on: Dar proroctwa. Interactive Bible study by Christian Culture.",
      "canonicalUrl": "https://polskieradio.cc/kursy#lekcja-18"
    }
  },
  {
    "id": 19,
    "courseId": "biblijne-zasady-wiary-28",
    "stageId": "etap-4",
    "order": 19,
    "slug": "19-prawo-boze",
    "image": "/images/lessons/19.svg",
    "version": "1.0.0",
    "title": {
      "pl": "Prawo Boże",
      "en": "Prawo Boże"
    },
    "subtitle": {
      "pl": "Krok 19 z 28 • ŻYJ SŁOWEM",
      "en": "Step 19 of 28 • LIVE BY THE WORD"
    },
    "introduction": {
      "pl": "Rozważamy zasady wiary opierając się wyłącznie na Piśmie Świętym. Tematem dzisiejszej lekcji jest: **Prawo Boże**.",
      "en": "We consider the principles of faith based solely on the Holy Scriptures. The topic of today's lesson is: **The Law of God**."
    },
    "content": {
      "pl": "Wielkie zasady prawa Bożego są zawarte w Dziesięciu Przykazaniach i uosobione w życiu Chrystusa. Wyrażają one miłość Boga, Jego wolę i cele dotyczące ludzkiego postępowania i relacji oraz obowiązują wszystkich ludzi we wszystkich wiekach. Przykazania te stanowią podstawę przymierza Boga z Jego ludem i są miernikiem Bożego sądu.\n\nPrzez działanie Ducha Świętego wskazują one na grzech i budzą potrzebę Zbawiciela. Zbawienie jest całkowicie z łaski, a nie z uczynków, ale jego owocem jest posłuszeństwo przykazaniom.",
      "en": "The great principles of God’s law are embodied in the Ten Commandments and exemplified in the life of Christ. They express God’s love, will, and purposes concerning human conduct and relationships and are binding upon all people in every age. These precepts are the basis of God’s covenant with His people and the standard in His judgment.\n\nThrough the agency of the Holy Spirit they point out sin and awaken a sense of need for a Savior. Salvation is all of grace and not of works, and its fruit is obedience to the Commandments."
    },
    "scripture": {
      "primaryQuotes_pl": [
        "\"Jeśli mnie miłujecie, przykazań moich przestrzegać będziecie\" (J 14:15).",
        "\"Tu się okaże wytrwanie świętych, którzy przestrzegają przykazań Bożych...\" (Obj 14:12)."
      ],
      "primaryQuotes_en": [
        "\"If you love Me, keep My commandments\" (John 14:15).",
        "\"Here is the patience of the saints; here are those who keep the commandments of God...\" (Rev 14:12)."
      ],
      "references": [
        "Wj 20:1-17; Ps 40:8, 9; Mt 5:17-20; Rz 3:20; 7:7."
      ]
    },
    "discover": {
      "questions_pl": [
        "Na czym opiera się całe Prawo Boże według słów Jezusa?"
      ],
      "questions_en": [
        "Na czym opiera się całe Prawo Boże według słów Jezusa?"
      ],
      "items": [
        {
          "id": "d19_1",
          "prompt": "Na czym opiera się całe Prawo Boże według słów Jezusa?",
          "sourceRefs": [
            "Mt 22:37-40",
            "Rz 13:10"
          ],
          "readingExcerpt": "„Będziesz miłował Pana Boga swego całym swoim sercem... a swego bliźniego jak siebie samego. Na tych dwóch przykazaniach opiera się całe Prawo i Prorocy”."
        }
      ],
      "needsEditorialReview": false
    },
    "understand": {
      "summary_pl": "Wielkie zasady prawa Bożego są zawarte w Dziesięciu Przykazaniach i uosobione w życiu Chrystusa. Wyrażają one miłość Boga, Jego wolę i cele dotyczące ludzkiego postępowania i relacji oraz obowiązują wszystkich ludzi we wszystkich wiekach. Przykazania...",
      "summary_en": "The great principles of God’s law are embodied in the Ten Commandments and exemplified in the life of Christ. They express God’s love, will, and purposes concerning human conduct and relationships and are binding upon all people in every age. These p...",
      "needsEditorialReview": false
    },
    "quiz": {
      "questions": [
        {
          "id": "q19_1",
          "type": "single_choice",
          "question": "Co Jezus powiedział w Kazaniu na Górze na temat Prawa Bożego (Dekalogu)?",
          "options": [
            "Przyszedł znieść Prawo i przykazania",
            "Nie przyszedł znieść Prawa, lecz je wypełnić, a ani jedna jota nie przeminie",
            "Prawo dotyczyło tylko aniołów",
            "Można dowolnie zmieniać przykazania"
          ],
          "correctAnswer": 1,
          "explanation": "Jezus wyraźnie oświadczył: „Nie sądźcie, że przyszedłem znieść Prawo albo Proroków. Nie przyszedłem znieść, ale wypełnić” (Mt 5:17-18).",
          "scriptureRefs": [
            "Mt 5:17-18"
          ],
          "needsEditorialReview": false
        }
      ],
      "needsEditorialReview": false
    },
    "application": {
      "pl": "Prawo Boże nie jest ciężarem, ale ochroną. To drogowskaz pokazujący, jak kochać Boga i ludzi. Czy postrzegasz przykazania jako ograniczenie, czy jako wyraz Bożej troski o Twoje szczęście? Proś dziś o serce, które kocha Boże Prawo.\n\n---",
      "en": "God's law is not a burden but a protection. It is a signpost showing how to love God and people. Do you perceive the commandments as a limitation or as an expression of God's concern for your happiness? Ask today for a heart that loves God's Law.\n\n---"
    },
    "prayer": {
      "pl": "Zrób to Dla Jezusa - On już czeka. Żyj w wolności posłuszeństwa.",
      "en": "Do it for Jesus - He is already waiting. Live in the freedom of obedience."
    },
    "reflectionPrompts": {
      "pl": [
        "Co dzisiaj odkryłem w Słowie Bożym?",
        "Co konkretnie chcę zmienić lub zastosować?",
        "O co proszę Boga w modlitwie?"
      ],
      "en": [
        "What did I discover today in God’s Word?",
        "What specifically do I want to change or apply?",
        "What do I ask God for in prayer?"
      ]
    },
    "decisionPrompt": {
      "pl": "Przyjmuję prawdę o temacie: Prawo Boże do mojego osobistego życia z Bogiem.",
      "en": "I accept the biblical truth regarding Prawo Boże into my personal walk with God."
    },
    "seo": {
      "title_pl": "Prawo Boże — Kurs Biblijny | LUMINA Bible Academy",
      "title_en": "Prawo Boże — Bible Study | LUMINA Bible Academy",
      "description_pl": "Poznaj biblijne nauczanie na temat: Prawo Boże. Interaktywny kurs biblijny Christian Culture.",
      "description_en": "Discover biblical teaching on: Prawo Boże. Interactive Bible study by Christian Culture.",
      "canonicalUrl": "https://polskieradio.cc/kursy#lekcja-19"
    }
  },
  {
    "id": 20,
    "courseId": "biblijne-zasady-wiary-28",
    "stageId": "etap-4",
    "order": 20,
    "slug": "20-szabat",
    "image": "/images/lessons/20.svg",
    "version": "1.0.0",
    "title": {
      "pl": "Szabat",
      "en": "Szabat"
    },
    "subtitle": {
      "pl": "Krok 20 z 28 • ŻYJ SŁOWEM",
      "en": "Step 20 of 28 • LIVE BY THE WORD"
    },
    "introduction": {
      "pl": "Rozważamy zasady wiary opierając się wyłącznie na Piśmie Świętym. Tematem dzisiejszej lekcji jest: **Szabat**.",
      "en": "We consider the principles of faith based solely on the Holy Scriptures. The topic of today's lesson is: **The Sabbath**."
    },
    "content": {
      "pl": "Dobrotliwy Stwórca po sześciu dniach stwarzania odpoczął siódmego dnia i ustanowił Szabat dla wszystkich ludzi jako pamiątkę stworzenia. Czwarte przykazanie niezmiennego prawa Bożego nakazuje zachowywanie siódmego dnia tygodnia, soboty, jako dnia odpoczynku, uwielbienia i służby, zgodnie z nauką i przykładem Jezusa, Pana Szabatu.\n\nSzabat jest dniem radosnej społeczności z Bogiem i bliźnimi. Jest symbolem naszego odkupienia w Chrystusie, znakiem naszego uświęcenia, dowodem naszej wierności oraz przedsmakiem naszej wiecznej przyszłości w Królestwie Bożym.",
      "en": "The gracious Creator, after the six days of Creation, rested on the seventh day and instituted the Sabbath for all people as a memorial of Creation. The fourth commandment of God’s unchangeable law requires the observance of this seventh-day Sabbath as the day of rest, worship, and ministry in harmony with the teaching and practice of Jesus, the Lord of the Sabbath.\n\nThe Sabbath is a day of delightful communion with God and one another. It is a symbol of our redemption in Christ, a sign of our sanctification, a token of our allegiance, and a foretaste of our eternal future in God’s kingdom."
    },
    "scripture": {
      "primaryQuotes_pl": [
        "\"Pamiętaj o dniu szabatu, aby go święcić\" (Wj 20:8).",
        "\"Szabat ustanowiony jest dla człowieka, a nie człowiek dla szabatu\" (Mk 2:27)."
      ],
      "primaryQuotes_en": [
        "\"Remember the Sabbath day, to keep it holy\" (Exod 20:8).",
        "\"The Sabbath was made for man, and not man for the Sabbath\" (Mark 2:27)."
      ],
      "references": [
        "Rdz 2:1-3; Wj 31:12-17; Łk 4:16; Iz 58:13, 14; Hbr 4:1-11."
      ]
    },
    "discover": {
      "questions_pl": [
        "Który dzień tygodnia Bóg nakazał pamiętać i święcić w IV Przykazaniu Dekalogu?"
      ],
      "questions_en": [
        "Który dzień tygodnia Bóg nakazał pamiętać i święcić w IV Przykazaniu Dekalogu?"
      ],
      "items": [
        {
          "id": "d20_1",
          "prompt": "Który dzień tygodnia Bóg nakazał pamiętać i święcić w IV Przykazaniu Dekalogu?",
          "sourceRefs": [
            "Wj 20:8-11",
            "Rdz 2:1-3",
            "Łk 4:16"
          ],
          "readingExcerpt": "„Pamiętaj o dniu szabatu, aby go święcić. Sześć dni będziesz pracować... dzień zaś siódmy jest szabatem ku czci Pana, Boga twego”."
        }
      ],
      "needsEditorialReview": false
    },
    "understand": {
      "summary_pl": "Dobrotliwy Stwórca po sześciu dniach stwarzania odpoczął siódmego dnia i ustanowił Szabat dla wszystkich ludzi jako pamiątkę stworzenia. Czwarte przykazanie niezmiennego prawa Bożego nakazuje zachowywanie siódmego dnia tygodnia, soboty, jako dnia odp...",
      "summary_en": "The gracious Creator, after the six days of Creation, rested on the seventh day and instituted the Sabbath for all people as a memorial of Creation. The fourth commandment of God’s unchangeable law requires the observance of this seventh-day Sabbath ...",
      "needsEditorialReview": false
    },
    "quiz": {
      "questions": [
        {
          "id": "q20_1",
          "type": "single_choice",
          "question": "Który dzień tygodnia według Pisma Świętego jest Bożym Szabatem odpoczynku?",
          "options": [
            "Pierwszy dzień (niedziela)",
            "Piątek wieczorem do północy",
            "Siódmy dzień tygodnia (sobota — od zachodu słońca w piątek do zachodu w sobotę)",
            "Dowolny dzień wybrany przez człowieka"
          ],
          "correctAnswer": 2,
          "explanation": "Pismo Święte jednoznacznie wskazuje siódmy dzień tygodnia jako pamiątkę stworzenia świata i odkupienia w Chrystusie (Rdz 2:2-3, Wj 20:8-11, Łk 23:54-56).",
          "scriptureRefs": [
            "Wj 20:8-11",
            "Łk 23:56"
          ],
          "needsEditorialReview": false
        }
      ],
      "needsEditorialReview": false
    },
    "application": {
      "pl": "Szabat to Boży prezent – czas zatrzymania w zabieganym świecie. Czy pozwalasz sobie na ten święty odpoczynek? To nie tylko zakaz pracy, to zaproszenie do zachwytu nad Bożym dziełem i do głębokiej relacji z Nim. Zaplanuj swój najbliższy Szabat jako czas radości.\n\n---",
      "en": "The Sabbath is God's gift – a time to stop in a busy world. Do you allow yourself this holy rest? It's not just a prohibition of work; it's an invitation to marvel at God's work and to have a deep relationship with Him. Plan your next Sabbath as a time of joy.\n\n---"
    },
    "prayer": {
      "pl": "Zrób to Dla Jezusa - On już czeka. Odpocznij w Jego miłości.",
      "en": "Do it for Jesus - He is already waiting. Rest in His love."
    },
    "reflectionPrompts": {
      "pl": [
        "Co dzisiaj odkryłem w Słowie Bożym?",
        "Co konkretnie chcę zmienić lub zastosować?",
        "O co proszę Boga w modlitwie?"
      ],
      "en": [
        "What did I discover today in God’s Word?",
        "What specifically do I want to change or apply?",
        "What do I ask God for in prayer?"
      ]
    },
    "decisionPrompt": {
      "pl": "Przyjmuję prawdę o temacie: Szabat do mojego osobistego życia z Bogiem.",
      "en": "I accept the biblical truth regarding Szabat into my personal walk with God."
    },
    "seo": {
      "title_pl": "Szabat — Kurs Biblijny | LUMINA Bible Academy",
      "title_en": "Szabat — Bible Study | LUMINA Bible Academy",
      "description_pl": "Poznaj biblijne nauczanie na temat: Szabat. Interaktywny kurs biblijny Christian Culture.",
      "description_en": "Discover biblical teaching on: Szabat. Interactive Bible study by Christian Culture.",
      "canonicalUrl": "https://polskieradio.cc/kursy#lekcja-20"
    }
  },
  {
    "id": 21,
    "courseId": "biblijne-zasady-wiary-28",
    "stageId": "etap-4",
    "order": 21,
    "slug": "21-szafarstwo",
    "image": "/images/lessons/21.svg",
    "version": "1.0.0",
    "title": {
      "pl": "Szafarstwo",
      "en": "Szafarstwo"
    },
    "subtitle": {
      "pl": "Krok 21 z 28 • ŻYJ SŁOWEM",
      "en": "Step 21 of 28 • LIVE BY THE WORD"
    },
    "introduction": {
      "pl": "Rozważamy zasady wiary opierając się wyłącznie na Piśmie Świętym. Tematem dzisiejszej lekcji jest: **Szafarstwo**.",
      "en": "We consider the principles of faith based solely on the Holy Scriptures. The topic of today's lesson is: **Stewardship**."
    },
    "content": {
      "pl": "Jesteśmy szafarzami Boga, którym powierzył On czas i okazje, możliwości i inteligencję oraz dobra ziemskie i zasoby ziemi. Odpowiadamy przed Nim za ich właściwe wykorzystanie. Boże prawo własności uznajemy przez wierną służbę Jemu i bliźnim oraz przez oddawanie dziesięcin i składanie dobrowolnych ofiar na rzecz ogłaszania Ewangelii i na wspieranie oraz rozwój Jego Kościoła.\n\nSzafarstwo jest przywilejem danym nam przez Boga dla pielęgnowania miłości oraz dla zwycięstwa nad egoizmem i chciwością.",
      "en": "We are God’s stewards, entrusted by Him with time and opportunities, abilities and possessions, and the blessings of the earth and its resources. We are responsible to Him for their proper use. We acknowledge God’s ownership by faithful service to Him and our fellow human beings, and by returning tithe and giving offerings for the proclamation of His gospel and the support and growth of His church.\n\nStewardship is a privilege given to us by God for our nurture in love and the victory over selfishness and covetousness."
    },
    "scripture": {
      "primaryQuotes_pl": [
        "\"Przynieście całą dziesięcinę do spichlerza\" (Mal 3:10).",
        "\"Bóg miłuje radosnego dawcę\" (2 Kor 9:7)."
      ],
      "primaryQuotes_en": [
        "\"Bring all the tithes into the storehouse\" (Mal 3:10).",
        "\"God loves a cheerful giver\" (2 Cor 9:7)."
      ],
      "references": [
        "Rdz 1:26-28; 2:15; Ag 1:3-11; 1 Kor 9:9-14; Mt 23:23."
      ]
    },
    "discover": {
      "questions_pl": [
        "Do kogo ostatecznie należy ziemia, nasze dobra i talenty?"
      ],
      "questions_en": [
        "Do kogo ostatecznie należy ziemia, nasze dobra i talenty?"
      ],
      "items": [
        {
          "id": "d21_1",
          "prompt": "Do kogo ostatecznie należy ziemia, nasze dobra i talenty?",
          "sourceRefs": [
            "Ps 24:1",
            "1 Krn 29:14",
            "Ml 3:10"
          ],
          "readingExcerpt": "„Do Pana należy ziemia i to, co ją napełnia, świat i jego mieszkańcy”."
        }
      ],
      "needsEditorialReview": false
    },
    "understand": {
      "summary_pl": "Jesteśmy szafarzami Boga, którym powierzył On czas i okazje, możliwości i inteligencję oraz dobra ziemskie i zasoby ziemi. Odpowiadamy przed Nim za ich właściwe wykorzystanie. Boże prawo własności uznajemy przez wierną służbę Jemu i bliźnim oraz prze...",
      "summary_en": "We are God’s stewards, entrusted by Him with time and opportunities, abilities and possessions, and the blessings of the earth and its resources. We are responsible to Him for their proper use. We acknowledge God’s ownership by faithful service to Hi...",
      "needsEditorialReview": false
    },
    "quiz": {
      "questions": [
        {
          "id": "q21_1",
          "type": "single_choice",
          "question": "Co według Pisma Świętego stanowi biblijną dziesięcinę przeznaczoną na głoszenie Ewangelii?",
          "options": [
            "Dobrowolna resztka z tego, co zostanie na koniec miesiąca",
            "Jedna dziesiąta (10%) przychodu, która jest święta dla Pana",
            "Roczny datek na remont budynku",
            "Tylko podatki państwowe"
          ],
          "correctAnswer": 1,
          "explanation": "Biblia naucza, że dziesięcina należy do Pana i służy podtrzymywaniu służby ewangelizacyjnej (Kpł 27:30, Ml 3:8-10, 1 Kor 9:13-14).",
          "scriptureRefs": [
            "Ml 3:8-10",
            "1 Kor 9:14"
          ],
          "needsEditorialReview": false
        }
      ],
      "needsEditorialReview": false
    },
    "application": {
      "pl": "Wszystko, co masz, należy do Boga. Ty jesteś tylko zarządcą. Jak zarządzasz swoim czasem, talentami i pieniędzmi? Czy Twoje wydatki odzwierciedlają Twoje niebiańskie priorytety? Pamiętaj, że hojność uwalnia serce z niewoli materializmu.\n\n---",
      "en": "Everything you have belongs to God. You are only the manager. How do you manage your time, talents, and money? Do your expenses reflect your heavenly priorities? Remember that generosity frees the heart from the bondage of materialism.\n\n---"
    },
    "prayer": {
      "pl": "Zrób to Dla Jezusa - On już czeka. Bądź wiernym szafarzem Jego dóbr.",
      "en": "Do it for Jesus - He is already waiting. Be a faithful steward of His goods."
    },
    "reflectionPrompts": {
      "pl": [
        "Co dzisiaj odkryłem w Słowie Bożym?",
        "Co konkretnie chcę zmienić lub zastosować?",
        "O co proszę Boga w modlitwie?"
      ],
      "en": [
        "What did I discover today in God’s Word?",
        "What specifically do I want to change or apply?",
        "What do I ask God for in prayer?"
      ]
    },
    "decisionPrompt": {
      "pl": "Przyjmuję prawdę o temacie: Szafarstwo do mojego osobistego życia z Bogiem.",
      "en": "I accept the biblical truth regarding Szafarstwo into my personal walk with God."
    },
    "seo": {
      "title_pl": "Szafarstwo — Kurs Biblijny | LUMINA Bible Academy",
      "title_en": "Szafarstwo — Bible Study | LUMINA Bible Academy",
      "description_pl": "Poznaj biblijne nauczanie na temat: Szafarstwo. Interaktywny kurs biblijny Christian Culture.",
      "description_en": "Discover biblical teaching on: Szafarstwo. Interactive Bible study by Christian Culture.",
      "canonicalUrl": "https://polskieradio.cc/kursy#lekcja-21"
    }
  },
  {
    "id": 22,
    "courseId": "biblijne-zasady-wiary-28",
    "stageId": "etap-4",
    "order": 22,
    "slug": "22-chrzescijanskie-zachowanie",
    "image": "/images/lessons/22.svg",
    "version": "1.0.0",
    "title": {
      "pl": "Chrześcijańskie zachowanie",
      "en": "Chrześcijańskie zachowanie"
    },
    "subtitle": {
      "pl": "Krok 22 z 28 • ŻYJ SŁOWEM",
      "en": "Step 22 of 28 • LIVE BY THE WORD"
    },
    "introduction": {
      "pl": "Rozważamy zasady wiary opierając się wyłącznie na Piśmie Świętym. Tematem dzisiejszej lekcji jest: **Chrześcijańskie prowadzenie się**.",
      "en": "We consider the principles of faith based solely on the Holy Scriptures. The topic of today's lesson is: **Christian Behavior**."
    },
    "content": {
      "pl": "Jesteśmy powołani, aby być ludem pobożnym, myślącym, czującym i działającym zgodnie z zasadami nieba. Dla Ducha Świętego, który odnawia w nas charakter naszego Pana, angażujemy się tylko w to, co przynosi chrześcijańską czystość, zdrowie i radość w naszym życiu. Oznacza to, że nasze rozrywki powinny odpowiadać najwyższym standardom chrześcijańskiego smaku i piękna.\n\nPonieważ nasze ciała są świątynią Ducha Świętego, musimy dbać o nie rozumnie, stosując odpowiednią dietę, ubiór oraz unikając wszystkiego, co szkodzi zdrowiu.",
      "en": "We are called to be a godly people who think, feel, and act in harmony with the principles of heaven. For the Spirit to recreate in us the character of our Lord we involve ourselves only in those things which will produce Christ-like purity, health, and joy in our lives. This means that our amusement and entertainment should meet the highest standards of Christian taste and beauty.\n\nBecause our bodies are the temples of the Holy Spirit, we are to care for them intelligently, applying proper diet and dress, and avoiding anything that harms health."
    },
    "scripture": {
      "primaryQuotes_pl": [
        "\"Czy jecie, czy pijecie, czy cokolwiek innego czynicie, wszystko na chwałę Bożą czyńcie\" (1 Kor 10:31).",
        "\"Ciało wasze jest świątynią Ducha Świętego\" (1 Kor 6:19)."
      ],
      "primaryQuotes_en": [
        "\"Whether you eat or drink, or whatever you do, do all to the glory of God\" (1 Cor 10:31).",
        "\"Your body is the temple of the Holy Spirit\" (1 Cor 6:19)."
      ],
      "references": [
        "Rz 12:1, 2; 1 J 2:6; Ef 5:1-21; Flp 4:8; 2 Kor 10:5."
      ]
    },
    "discover": {
      "questions_pl": [
        "Czym jest ludzkie ciało według apostoła Pawła w 1 Kor 6:19-20?"
      ],
      "questions_en": [
        "Czym jest ludzkie ciało według apostoła Pawła w 1 Kor 6:19-20?"
      ],
      "items": [
        {
          "id": "d22_1",
          "prompt": "Czym jest ludzkie ciało według apostoła Pawła w 1 Kor 6:19-20?",
          "sourceRefs": [
            "1 Kor 6:19-20",
            "1 Kor 10:31"
          ],
          "readingExcerpt": "„Czyż nie wiecie, że ciało wasze jest świątynią Ducha Świętego, który w was jest... Chwalcie więc Boga w waszym ciele!”."
        }
      ],
      "needsEditorialReview": false
    },
    "understand": {
      "summary_pl": "Jesteśmy powołani, aby być ludem pobożnym, myślącym, czującym i działającym zgodnie z zasadami nieba. Dla Ducha Świętego, który odnawia w nas charakter naszego Pana, angażujemy się tylko w to, co przynosi chrześcijańską czystość, zdrowie i radość w n...",
      "summary_en": "We are called to be a godly people who think, feel, and act in harmony with the principles of heaven. For the Spirit to recreate in us the character of our Lord we involve ourselves only in those things which will produce Christ-like purity, health, ...",
      "needsEditorialReview": false
    },
    "quiz": {
      "questions": [
        {
          "id": "q22_1",
          "type": "single_choice",
          "question": "Jaka zasada powinna kierować naszym jedzeniem, piciem i stylem życia?",
          "options": [
            "Róbmy wszystko, co sprawia nam chwilową przyjemność",
            "Cokolwiek czynicie, czy jecie, czy pijecie, wszystko czyńcie na chwałę Bożą",
            "Ciało nie ma żadnego znaczenia dla wiary",
            "Ścisła asceza z głodzeniem ciała"
          ],
          "correctAnswer": 1,
          "explanation": "Chrześcijanin dba o zdrowie fizyczne, psychiczne i moralne, ponieważ ciało jest świątynią Ducha Świętego (1 Kor 10:31, Rz 12:1-2).",
          "scriptureRefs": [
            "1 Kor 10:31",
            "Rz 12:1-2"
          ],
          "needsEditorialReview": false
        }
      ],
      "needsEditorialReview": false
    },
    "application": {
      "pl": "Twoje życie jest jedyną Biblią, którą niektórzy ludzie kiedykolwiek przeczytają. Czy Twoje wybory – to co oglądasz, co jesz, jak się ubierasz – zachęcają innych do poznania Jezusa? Pamiętaj, że Boże standardy nie mają nas ograniczać, ale pozwolić nam żyć pełnią życia.\n\n---",
      "en": "Your life is the only Bible some people will ever read. Do your choices – what you watch, what you eat, how you dress – encourage others to know Jesus? Remember that God's standards are not meant to limit us but to allow us to live life to the fullest.\n\n---"
    },
    "prayer": {
      "pl": "Zrób to Dla Jezusa - On już czeka. Bądź Jego godnym ambasadorem.",
      "en": "Do it for Jesus - He is already waiting. Be His worthy ambassador."
    },
    "reflectionPrompts": {
      "pl": [
        "Co dzisiaj odkryłem w Słowie Bożym?",
        "Co konkretnie chcę zmienić lub zastosować?",
        "O co proszę Boga w modlitwie?"
      ],
      "en": [
        "What did I discover today in God’s Word?",
        "What specifically do I want to change or apply?",
        "What do I ask God for in prayer?"
      ]
    },
    "decisionPrompt": {
      "pl": "Przyjmuję prawdę o temacie: Chrześcijańskie zachowanie do mojego osobistego życia z Bogiem.",
      "en": "I accept the biblical truth regarding Chrześcijańskie zachowanie into my personal walk with God."
    },
    "seo": {
      "title_pl": "Chrześcijańskie zachowanie — Kurs Biblijny | LUMINA Bible Academy",
      "title_en": "Chrześcijańskie zachowanie — Bible Study | LUMINA Bible Academy",
      "description_pl": "Poznaj biblijne nauczanie na temat: Chrześcijańskie zachowanie. Interaktywny kurs biblijny Christian Culture.",
      "description_en": "Discover biblical teaching on: Chrześcijańskie zachowanie. Interactive Bible study by Christian Culture.",
      "canonicalUrl": "https://polskieradio.cc/kursy#lekcja-22"
    }
  },
  {
    "id": 23,
    "courseId": "biblijne-zasady-wiary-28",
    "stageId": "etap-4",
    "order": 23,
    "slug": "23-malzenstwo-i-rodzina",
    "image": "/images/lessons/23.svg",
    "version": "1.0.0",
    "title": {
      "pl": "Małżeństwo i rodzina",
      "en": "Małżeństwo i rodzina"
    },
    "subtitle": {
      "pl": "Krok 23 z 28 • ŻYJ SŁOWEM",
      "en": "Step 23 of 28 • LIVE BY THE WORD"
    },
    "introduction": {
      "pl": "Rozważamy zasady wiary opierając się wyłącznie na Piśmie Świętym. Tematem dzisiejszej lekcji jest: **Małżeństwo i rodzina**.",
      "en": "We consider the principles of faith based solely on the Holy Scriptures. The topic of today's lesson is: **Marriage and the Family**."
    },
    "content": {
      "pl": "Małżeństwo zostało ustanowione przez Boga w Edenie i potwierdzone przez Jezusa jako dożywotni związek między mężczyzną i kobietą w miłości i oddaniu. Dla chrześcijanina zobowiązanie małżeńskie jest złożone zarówno Bogu, jak i współmałżonkowi i powinno być zawierane tylko między osobami tej samej wiary.\n\nRodzina jest podstawową komórką społeczeństwa, w której dzieci powinny wzrastać w miłości i posłuszeństwie Panu. Budowanie zdrowych relacji rodzinnych jest jednym z wyróżniających znamion końcowego poselstwa Ewangelii.",
      "en": "Marriage was divinely established in Eden and affirmed by Jesus to be a lifelong union between a man and a woman in loving companionship. For the Christian a marriage commitment is to God as well as to the spouse, and should be entered into only between partners who share a common faith.\n\nThe family is the basic unit of society, in which children are to be brought up in the love and admonition of the Lord. Building healthy family relationships is one of the hallmarks of the final gospel message."
    },
    "scripture": {
      "primaryQuotes_pl": [
        "\"Dlatego opuści mąż ojca swego i matkę swoją i połączy się z żoną swoją\" (Rdz 2:24).",
        "\"Co Bóg złączył, człowiek niech nie rozdziela\" (Mt 19:6)."
      ],
      "primaryQuotes_en": [
        "\"Therefore a man shall leave his father and mother and be joined to his wife\" (Gen 2:24).",
        "\"What God has joined together, let not man separate\" (Matt 19:6)."
      ],
      "references": [
        "Rdz 2:18-25; Ef 5:21-33; Mt 5:31, 32; Mal 4:5, 6; Ef 6:1-4."
      ]
    },
    "discover": {
      "questions_pl": [
        "W jaki sposób Bóg ustanowił małżeństwo w Ogrodzie Eden?"
      ],
      "questions_en": [
        "W jaki sposób Bóg ustanowił małżeństwo w Ogrodzie Eden?"
      ],
      "items": [
        {
          "id": "d23_1",
          "prompt": "W jaki sposób Bóg ustanowił małżeństwo w Ogrodzie Eden?",
          "sourceRefs": [
            "Rdz 2:24",
            "Mt 19:4-6"
          ],
          "readingExcerpt": "„Dlatego opuści człowiek ojca swego i matkę i złączy się ze swoją żoną, i będą oboje jednym ciałem. Co więc Bóg złączył, człowiek niech nie rozdziela”."
        }
      ],
      "needsEditorialReview": false
    },
    "understand": {
      "summary_pl": "Małżeństwo zostało ustanowione przez Boga w Edenie i potwierdzone przez Jezusa jako dożywotni związek między mężczyzną i kobietą w miłości i oddaniu. Dla chrześcijanina zobowiązanie małżeńskie jest złożone zarówno Bogu, jak i współmałżonkowi i powinn...",
      "summary_en": "Marriage was divinely established in Eden and affirmed by Jesus to be a lifelong union between a man and a woman in loving companionship. For the Christian a marriage commitment is to God as well as to the spouse, and should be entered into only betw...",
      "needsEditorialReview": false
    },
    "quiz": {
      "questions": [
        {
          "id": "q23_1",
          "type": "single_choice",
          "question": "Małżeństwo w zamyśle Bożym to:",
          "options": [
            "Tymczasowa umowa cywilna",
            "Święte, dozgonne przymierze miłości między jednym mężczyzną a jedną kobietą",
            "Związek zależny od koniunktury gospodarczej",
            "Instytucja wyłącznie ludzka"
          ],
          "correctAnswer": 1,
          "explanation": "Małżeństwo zostało ustanowione przez Boga w Edenie jako przymierze na całe życie, będące odzwierciedleniem miłości Chrystusa do Jego Kościoła (Ef 5:21-33, Mt 19:4-6).",
          "scriptureRefs": [
            "Mt 19:4-6",
            "Ef 5:25"
          ],
          "needsEditorialReview": false
        }
      ],
      "needsEditorialReview": false
    },
    "application": {
      "pl": "Twoja rodzina to Twoje pierwsze pole misyjne. Czy okazujesz miłość i cierpliwość tym, którzy są Ci najbliżsi? Małżeństwo to obraz relacji Chrystusa z Kościołem – pełnej poświęcenia i wierności. Pracuj dziś nad umocnieniem więzi z najbliższymi.\n\n---",
      "en": "Your family is your first mission field. Do you show love and patience to those who are closest to you? Marriage is a picture of Christ’s relationship with the Church – full of sacrifice and loyalty. Work today on strengthening your bonds with your loved ones.\n\n---"
    },
    "prayer": {
      "pl": "Zrób to Dla Jezusa - On już czeka. Buduj dom na Skale.",
      "en": "Do it for Jesus - He is already waiting. Build your home on the Rock."
    },
    "reflectionPrompts": {
      "pl": [
        "Co dzisiaj odkryłem w Słowie Bożym?",
        "Co konkretnie chcę zmienić lub zastosować?",
        "O co proszę Boga w modlitwie?"
      ],
      "en": [
        "What did I discover today in God’s Word?",
        "What specifically do I want to change or apply?",
        "What do I ask God for in prayer?"
      ]
    },
    "decisionPrompt": {
      "pl": "Przyjmuję prawdę o temacie: Małżeństwo i rodzina do mojego osobistego życia z Bogiem.",
      "en": "I accept the biblical truth regarding Małżeństwo i rodzina into my personal walk with God."
    },
    "seo": {
      "title_pl": "Małżeństwo i rodzina — Kurs Biblijny | LUMINA Bible Academy",
      "title_en": "Małżeństwo i rodzina — Bible Study | LUMINA Bible Academy",
      "description_pl": "Poznaj biblijne nauczanie na temat: Małżeństwo i rodzina. Interaktywny kurs biblijny Christian Culture.",
      "description_en": "Discover biblical teaching on: Małżeństwo i rodzina. Interactive Bible study by Christian Culture.",
      "canonicalUrl": "https://polskieradio.cc/kursy#lekcja-23"
    }
  },
  {
    "id": 24,
    "courseId": "biblijne-zasady-wiary-28",
    "stageId": "etap-5",
    "order": 24,
    "slug": "24-sluzba-chrystusa-w-niebianskiej-swiatyni",
    "image": "/images/lessons/24.svg",
    "version": "1.0.0",
    "title": {
      "pl": "Służba Chrystusa w niebiańskiej świątyni",
      "en": "Służba Chrystusa w niebiańskiej świątyni"
    },
    "subtitle": {
      "pl": "Krok 24 z 28 • NADZIEJA",
      "en": "Step 24 of 28 • BLESSED HOPE"
    },
    "introduction": {
      "pl": "Rozważamy zasady wiary opierając się wyłącznie na Piśmie Świętym. Tematem dzisiejszej lekcji jest: **Służba Chrystusa w niebiańskiej świątyni**.",
      "en": "We consider the principles of faith based solely on the Holy Scriptures. The topic of today's lesson is: **Christ Ministry in the Heavenly Sanctuary**."
    },
    "content": {
      "pl": "W niebie znajduje się świątynia, prawdziwy przybytek, który Pan zbudował, a nie człowiek (Hbr 8:1-2). Tam Chrystus usługuje w naszym imieniu jako Wielki Arcykapłan i jedyny Orędownik, udostępniając wierzącym owoce Swej doskonałej, odkupieńczej ofiary złożonej raz na zawsze na krzyżu (Hbr 7:25; 9:11-12.24).\n\nSłużba Chrystusa w świątyni niebiańskiej zapewnia każdemu wierzącemu całkowite pojednanie z Bogiem, przebaczenie i pewność zbawienia, prowadząc do ostatecznego oczyszczenia i triumfu Bożej sprawiedliwości (Dn 8:14; Hbr 4:14-16).",
      "en": "There is a sanctuary in heaven, the true tabernacle erected by the Lord and not by man (Heb 8:1-2). In it Christ ministers on our behalf as our great High Priest and sole Advocate, making available to believers the fruits of His perfect, atoning sacrifice offered once for all on the cross (Heb 7:25; 9:11-12,24).\n\nChrist's ministry in the heavenly sanctuary assures every believer of full reconciliation with God, forgiveness, and assurance of salvation, culminating in the ultimate vindication and triumph of God's righteousness (Dan 8:14; Heb 4:14-16)."
    },
    "scripture": {
      "primaryQuotes_pl": [
        "\"Mamy takiego arcykapłana, który usiadł po prawicy tronu Majestatu w niebie\" (Hbr 8:1).",
        "\"Aż do dwóch tysięcy trzystu wieczorów i poranków; wtedy świątynia zostanie oczyszczona\" (Dn 8:14)."
      ],
      "primaryQuotes_en": [
        "\"We have such a High Priest, who is seated at the right hand of the throne of the Majesty in the heavens\" (Heb 8:1).",
        "\"For two thousand three hundred days; then the sanctuary shall be cleansed\" (Dan 8:14)."
      ],
      "references": [
        "Hbr 4:14-16; 9:11-28; 10:19-22; Obj 1:5; 11:19."
      ]
    },
    "discover": {
      "questions_pl": [
        "Gdzie Jezus sprawuje Swoją arcykapłańską posługę po wniebowstąpieniu?"
      ],
      "questions_en": [
        "Gdzie Jezus sprawuje Swoją arcykapłańską posługę po wniebowstąpieniu?"
      ],
      "items": [
        {
          "id": "d24_1",
          "prompt": "Gdzie Jezus sprawuje Swoją arcykapłańską posługę po wniebowstąpieniu?",
          "sourceRefs": [
            "Hbr 8:1-2",
            "Hbr 9:24",
            "Dn 8:14"
          ],
          "readingExcerpt": "„Mamy takiego Arcykapłana, który zasiadł po prawicy tronu Majestatu w niebiosach, jako sługa świątyni i prawdziwego przybytku”."
        }
      ],
      "needsEditorialReview": false
    },
    "understand": {
      "summary_pl": "W niebie znajduje się prawdziwa świątynia, gdzie Chrystus jako nasz jedyny Arcykapłan i Pośrednik wstawia się za nami w oparciu o doskonałą ofiarę krzyża, zapewniając wierzącym pewność zbawienia i sprawiedliwość Bożą (Hbr 8:1-2, Dn 8:14).",
      "summary_en": "There is a true sanctuary in heaven where Christ, as our sole High Priest and Mediator, intercedes for us based on His perfect sacrifice on the cross, ensuring believers assurance of salvation and God's righteousness (Heb 8:1-2, Dan 8:14).",
      "needsEditorialReview": false
    },
    "quiz": {
      "questions": [
        {
          "id": "q24_1",
          "type": "single_choice",
          "question": "Na czym polega orędownictwo Jezusa w świątyni niebiańskiej na naszą rzecz?",
          "options": [
            "Chrystus składa codziennie nowe ofiary z krwi zwierząt",
            "Chrystus wstawia się za nami Swoją jedyną, doskonałą ofiarą złożoną na krzyżu",
            "Służba w niebie nie ma wpływu na losy ludzi",
            "Aniołowie sami decydują o zbawieniu bez Chrystusa"
          ],
          "correctAnswer": 1,
          "explanation": "Jezus wszedł do samego nieba, aby teraz wstawiać się za nami przed obliczem Boga (Hbr 9:24, Hbr 7:25).",
          "scriptureRefs": [
            "Hbr 7:25",
            "Hbr 9:24"
          ],
          "needsEditorialReview": false
        }
      ],
      "needsEditorialReview": false
    },
    "application": {
      "pl": "Czy masz świadomość, że w tej chwili Jezus wstawia się za Tobą przed Ojcem? Nie jesteś sam ze swoimi słabościami. Twój Obrońca zna Twoje imię i walczy o Twoje zbawienie. Przyjdź z ufnością do tronu łaski, aby otrzymać pomoc w stosownej porze.\n\n---",
      "en": "Are you aware that right now Jesus is interceding for you before the Father? You are not alone with your weaknesses. Your Advocate knows your name and fights for your salvation. Come boldly to the throne of grace, that you may obtain mercy and find grace to help in time of need.\n\n---"
    },
    "prayer": {
      "pl": "Zrób to Dla Jezusa - On już czeka. Zaufaj swojemu Arcykapłanowi.",
      "en": "Do it for Jesus - He is already waiting. Trust your High Priest."
    },
    "reflectionPrompts": {
      "pl": [
        "Co dzisiaj odkryłem w Słowie Bożym?",
        "Co konkretnie chcę zmienić lub zastosować?",
        "O co proszę Boga w modlitwie?"
      ],
      "en": [
        "What did I discover today in God’s Word?",
        "What specifically do I want to change or apply?",
        "What do I ask God for in prayer?"
      ]
    },
    "decisionPrompt": {
      "pl": "Przyjmuję prawdę o temacie: Służba Chrystusa w niebiańskiej świątyni do mojego osobistego życia z Bogiem.",
      "en": "I accept the biblical truth regarding Służba Chrystusa w niebiańskiej świątyni into my personal walk with God."
    },
    "seo": {
      "title_pl": "Służba Chrystusa w niebiańskiej świątyni — Kurs Biblijny | LUMINA Bible Academy",
      "title_en": "Służba Chrystusa w niebiańskiej świątyni — Bible Study | LUMINA Bible Academy",
      "description_pl": "Poznaj biblijne nauczanie na temat: Służba Chrystusa w niebiańskiej świątyni. Interaktywny kurs biblijny Christian Culture.",
      "description_en": "Discover biblical teaching on: Służba Chrystusa w niebiańskiej świątyni. Interactive Bible study by Christian Culture.",
      "canonicalUrl": "https://polskieradio.cc/kursy#lekcja-24"
    }
  },
  {
    "id": 25,
    "courseId": "biblijne-zasady-wiary-28",
    "stageId": "etap-5",
    "order": 25,
    "slug": "25-powtorne-przyjscie-chrystusa",
    "image": "/images/lessons/25.svg",
    "version": "1.0.0",
    "title": {
      "pl": "Powtórne przyjście Chrystusa",
      "en": "Powtórne przyjście Chrystusa"
    },
    "subtitle": {
      "pl": "Krok 25 z 28 • NADZIEJA",
      "en": "Step 25 of 28 • BLESSED HOPE"
    },
    "introduction": {
      "pl": "Rozważamy zasady wiary opierając się wyłącznie na Piśmie Świętym. Tematem dzisiejszej lekcji jest: **Powtórne przyjście Chrystusa**.",
      "en": "We consider the principles of faith based solely on the Holy Scriptures. The topic of today's lesson is: **The Second Coming of Christ**."
    },
    "content": {
      "pl": "Powtórne przyjście Chrystusa jest błogosławioną nadzieją Kościoła i wspaniałym ukoronowaniem Ewangelii. Przyjście Zbawiciela będzie literalne, osobiste, widzialne i ogólnoświatowe. Gdy On powróci, sprawiedliwi umarli zostaną wskrzeszeni i wraz ze sprawiedliwymi żyjącymi zostaną uwielbieni i zabrani do nieba, natomiast niesprawiedliwi umrą.\n\nWypełnienie się większości proroctw oraz obecny stan świata wskazują na to, że przyjście Chrystusa jest bliskie. Czas tego wydarzenia nie został objawiony, dlatego jesteśmy wezwani do stałej gotowości.",
      "en": "The second coming of Christ is the blessed hope of the church, the grand climax of the gospel. The Savior’s coming will be literal, personal, visible, and worldwide. When He returns, the righteous dead will be resurrected, and together with the righteous living will be glorified and caught up to meet their Lord, but the unrighteous will die.\n\nThe almost complete fulfillment of most lines of prophecy, together with the present condition of the world, indicates that Christ’s coming is near. The time of that event has not been revealed, and we are therefore exhorted to be ready at all times."
    },
    "scripture": {
      "primaryQuotes_pl": [
        "\"Oto przychodzę wkrótce, a zapłata moja jest ze mną\" (Obj 22:12).",
        "\"Ten Jezus... tak przyjdzie, jak go widzieliście idącego do nieba\" (Dz 1:11)."
      ],
      "primaryQuotes_en": [
        "\"Look, I am coming soon! My reward is with me\" (Rev 22:12).",
        "\"This same Jesus... will come back in the same way you have seen him go into heaven\" (Acts 1:11)."
      ],
      "references": [
        "Mt 24; Mk 13; Łk 21; J 14:1-3; 1 Tes 4:13-18; Tyt 2:13."
      ]
    },
    "discover": {
      "questions_pl": [
        "W jaki sposób Jezus powróci na ziemię według obietnicy danej apostołom?"
      ],
      "questions_en": [
        "W jaki sposób Jezus powróci na ziemię według obietnicy danej apostołom?"
      ],
      "items": [
        {
          "id": "d25_1",
          "prompt": "W jaki sposób Jezus powróci na ziemię według obietnicy danej apostołom?",
          "sourceRefs": [
            "Dz 1:11",
            "Obj 1:7",
            "Mt 24:30"
          ],
          "readingExcerpt": "„Ten Jezus, wzięty od was do nieba, przyjdzie tak samo, jak widzieliście Go wstępującego do nieba... Oto przychodzi z obłokami i ujrzy Go wszelkie oko”."
        }
      ],
      "needsEditorialReview": false
    },
    "understand": {
      "summary_pl": "Powtórne przyjście Chrystusa jest błogosławioną nadzieją Kościoła i wspaniałym ukoronowaniem Ewangelii. Przyjście Zbawiciela będzie literalne, osobiste, widzialne i ogólnoświatowe. Gdy On powróci, sprawiedliwi umarli zostaną wskrzeszeni i wraz ze spr...",
      "summary_en": "The second coming of Christ is the blessed hope of the church, the grand climax of the gospel. The Savior’s coming will be literal, personal, visible, and worldwide. When He returns, the righteous dead will be resurrected, and together with the right...",
      "needsEditorialReview": false
    },
    "quiz": {
      "questions": [
        {
          "id": "q25_1",
          "type": "single_choice",
          "question": "Powtórne Przyjście Jezusa Chrystusa będzie:",
          "options": [
            "Sekretne i niewidzialne dla świata",
            "Dosłowne, widzialne dla każdego oka, pełne chwały i mocy",
            "Jedynie duchowym odrodzeniem w sercach ludzi",
            "Wydarzeniem symbolicznym bez Jego fizycznej obecności"
          ],
          "correctAnswer": 1,
          "explanation": "Pismo Święte wielokrotnie podkreśla: „Ujrzy Go wszelkie oko” (Obj 1:7), a sam Pan zstąpi z nieba na głos archanioła i dźwięk trąby Bożej (1 Tes 4:16).",
          "scriptureRefs": [
            "Obj 1:7",
            "1 Tes 4:16"
          ],
          "needsEditorialReview": false
        }
      ],
      "needsEditorialReview": false
    },
    "application": {
      "pl": "Czy Twoje serce tęskni za spotkaniem z Królem? Powtórne przyjście to nie powód do strachu, ale do wielkiej radości dla tych, którzy Go kochają. Żyj tak, jakby Jezus miał powrócić dzisiaj – z miłością w sercu i gotowością na Jego wezwanie.\n\n---",
      "en": "Does your heart long to meet the King? The Second Coming is not a cause for fear, but for great joy for those who love Him. Live as if Jesus were to return today – with love in your heart and readiness for His call.\n\n---"
    },
    "prayer": {
      "pl": "Zrób to Dla Jezusa - On już czeka. Marana tha – Przyjdź, Panie Jezu!",
      "en": "Do it for Jesus - He is already waiting. Maranatha – Come, Lord Jesus!"
    },
    "reflectionPrompts": {
      "pl": [
        "Co dzisiaj odkryłem w Słowie Bożym?",
        "Co konkretnie chcę zmienić lub zastosować?",
        "O co proszę Boga w modlitwie?"
      ],
      "en": [
        "What did I discover today in God’s Word?",
        "What specifically do I want to change or apply?",
        "What do I ask God for in prayer?"
      ]
    },
    "decisionPrompt": {
      "pl": "Przyjmuję prawdę o temacie: Powtórne przyjście Chrystusa do mojego osobistego życia z Bogiem.",
      "en": "I accept the biblical truth regarding Powtórne przyjście Chrystusa into my personal walk with God."
    },
    "seo": {
      "title_pl": "Powtórne przyjście Chrystusa — Kurs Biblijny | LUMINA Bible Academy",
      "title_en": "Powtórne przyjście Chrystusa — Bible Study | LUMINA Bible Academy",
      "description_pl": "Poznaj biblijne nauczanie na temat: Powtórne przyjście Chrystusa. Interaktywny kurs biblijny Christian Culture.",
      "description_en": "Discover biblical teaching on: Powtórne przyjście Chrystusa. Interactive Bible study by Christian Culture.",
      "canonicalUrl": "https://polskieradio.cc/kursy#lekcja-25"
    }
  },
  {
    "id": 26,
    "courseId": "biblijne-zasady-wiary-28",
    "stageId": "etap-5",
    "order": 26,
    "slug": "26-smierc-i-zmartwychwstanie",
    "image": "/images/lessons/26.svg",
    "version": "1.0.0",
    "title": {
      "pl": "Śmierć i zmartwychwstanie",
      "en": "Śmierć i zmartwychwstanie"
    },
    "subtitle": {
      "pl": "Krok 26 z 28 • NADZIEJA",
      "en": "Step 26 of 28 • BLESSED HOPE"
    },
    "introduction": {
      "pl": "Rozważamy zasady wiary opierając się wyłącznie na Piśmie Świętym. Tematem dzisiejszej lekcji jest: **Śmierć i zmartwychwstanie**.",
      "en": "We consider the principles of faith based solely on the Holy Scriptures. The topic of today's lesson is: **Death and Resurrection**."
    },
    "content": {
      "pl": "Zapłatą za grzech jest śmierć. Ale Bóg, który jedyny jest nieśmiertelny, udzieli życia wiecznego swoim odkupionym. Do dnia powrotu Chrystusa śmierć jest dla wszystkich ludzi stanem nieświadomości. Gdy Chrystus, który jest naszym życiem, się pojawi, wskrzeszeni sprawiedliwi oraz żyjący sprawiedliwi zostaną uwielbieni i porwani na spotkanie swego Pana.\n\nDrugie zmartwychwstanie, zmartwychwstanie niesprawiedliwych, nastąpi tysiąc lat później.",
      "en": "The wages of sin is death. But God, who alone is immortal, will grant eternal life to His redeemed. Until the return of Christ, death is an unconscious state for all people. When Christ, who is our life, appears, the resurrected righteous and the living righteous will be glorified and caught up to meet their Lord.\n\nThe second resurrection, the resurrection of the unrighteous, will take place a thousand years later."
    },
    "scripture": {
      "primaryQuotes_pl": [
        "\"Żyjący wiedzą, że umrą, ale umarli nic nie wiedzą\" (Koh 9:5).",
        "\"Bo zapłatą za grzech jest śmierć, lecz darem łaski Bożej jest żywot wieczny\" (Rz 6:23)."
      ],
      "primaryQuotes_en": [
        "\"For the living know that they will die, but the dead know nothing\" (Eccl 9:5).",
        "\"For the wages of sin is death, but the gift of God is eternal life\" (Rom 6:23)."
      ],
      "references": [
        "1 Tm 6:15, 16; 1 Tes 4:13-17; Ps 146:3, 4; J 11:11-14; 1 Kor 15:51-54."
      ]
    },
    "discover": {
      "questions_pl": [
        "Jak Pismo Święte opisuje stan człowieka w chwili śmierci aż do dnia zmartwychwstania?"
      ],
      "questions_en": [
        "Jak Pismo Święte opisuje stan człowieka w chwili śmierci aż do dnia zmartwychwstania?"
      ],
      "items": [
        {
          "id": "d26_1",
          "prompt": "Jak Pismo Święte opisuje stan człowieka w chwili śmierci aż do dnia zmartwychwstania?",
          "sourceRefs": [
            "Kaz 9:5.10",
            "Ps 146:4",
            "J 11:11-14"
          ],
          "readingExcerpt": "„Żyjący bowiem wiedzą, że umrą, ale umarli nic nie wiedzą... Łazarz, przyjaciel nasz, zasnął, ale idę, aby go obudzić ze snu”."
        }
      ],
      "needsEditorialReview": false
    },
    "understand": {
      "summary_pl": "Zapłatą za grzech jest śmierć. Ale Bóg, który jedyny jest nieśmiertelny, udzieli życia wiecznego swoim odkupionym. Do dnia powrotu Chrystusa śmierć jest dla wszystkich ludzi stanem nieświadomości. Gdy Chrystus, który jest naszym życiem, się pojawi, w...",
      "summary_en": "The wages of sin is death. But God, who alone is immortal, will grant eternal life to His redeemed. Until the return of Christ, death is an unconscious state for all people. When Christ, who is our life, appears, the resurrected righteous and the liv...",
      "needsEditorialReview": false
    },
    "quiz": {
      "questions": [
        {
          "id": "q26_1",
          "type": "single_choice",
          "question": "Według słów Jezusa i apostołów śmierć człowieka jest:",
          "options": [
            "Natychmiastowym przejściem do czyśćca lub reinkarnacji",
            "Nieświadomym snem w oczekiwaniu na powrót Chrystusa i zmartwychwstanie",
            "Świadomym życiem duszy bez ciała",
            "Wiecznym niebytem bez nadziei"
          ],
          "correctAnswer": 1,
          "explanation": "Jezus przyrównał śmierć do snu (J 11:11-14). Tylko Bóg jest nieśmiertelny (1 Tm 6:16), a wierzący otrzymają nieśmiertelność przy zmartwychwstaniu podczas powrotu Pana (1 Kor 15:51-54).",
          "scriptureRefs": [
            "J 11:11-14",
            "1 Kor 15:51-54",
            "1 Tm 6:16"
          ],
          "needsEditorialReview": false
        }
      ],
      "needsEditorialReview": false
    },
    "application": {
      "pl": "Śmierć nie ma ostatniego słowa. Dla chrześcijanina jest ona tylko snem, z którego obudzi nas głos Jezusa. Czy boisz się przemijania? Pamiętaj, że Twoje życie jest ukryte w Chrystusie, który zwyciężył śmierć. Ta nadzieja pozwala nam patrzeć w przyszłość z pokojem.\n\n---",
      "en": "Death does not have the last word. For a Christian, it is only a sleep from which the voice of Jesus will wake us. Are you afraid of passing away? Remember that your life is hidden in Christ, who conquered death. This hope allows us to look to the future with peace.\n\n---"
    },
    "prayer": {
      "pl": "Zrób to Dla Jezusa - On już czeka. Śmierć została pokonana!",
      "en": "Do it for Jesus - He is already waiting. Death is defeated!"
    },
    "reflectionPrompts": {
      "pl": [
        "Co dzisiaj odkryłem w Słowie Bożym?",
        "Co konkretnie chcę zmienić lub zastosować?",
        "O co proszę Boga w modlitwie?"
      ],
      "en": [
        "What did I discover today in God’s Word?",
        "What specifically do I want to change or apply?",
        "What do I ask God for in prayer?"
      ]
    },
    "decisionPrompt": {
      "pl": "Przyjmuję prawdę o temacie: Śmierć i zmartwychwstanie do mojego osobistego życia z Bogiem.",
      "en": "I accept the biblical truth regarding Śmierć i zmartwychwstanie into my personal walk with God."
    },
    "seo": {
      "title_pl": "Śmierć i zmartwychwstanie — Kurs Biblijny | LUMINA Bible Academy",
      "title_en": "Śmierć i zmartwychwstanie — Bible Study | LUMINA Bible Academy",
      "description_pl": "Poznaj biblijne nauczanie na temat: Śmierć i zmartwychwstanie. Interaktywny kurs biblijny Christian Culture.",
      "description_en": "Discover biblical teaching on: Śmierć i zmartwychwstanie. Interactive Bible study by Christian Culture.",
      "canonicalUrl": "https://polskieradio.cc/kursy#lekcja-26"
    }
  },
  {
    "id": 27,
    "courseId": "biblijne-zasady-wiary-28",
    "stageId": "etap-5",
    "order": 27,
    "slug": "27-tysiaclecie-i-koniec-grzechu",
    "image": "/images/lessons/27.svg",
    "version": "1.0.0",
    "title": {
      "pl": "Tysiąclecie i koniec grzechu",
      "en": "Tysiąclecie i koniec grzechu"
    },
    "subtitle": {
      "pl": "Krok 27 z 28 • NADZIEJA",
      "en": "Step 27 of 28 • BLESSED HOPE"
    },
    "introduction": {
      "pl": "Rozważamy zasady wiary opierając się wyłącznie na Piśmie Świętym. Tematem dzisiejszej lekcji jest: **Tysiąclecie i koniec grzechu**.",
      "en": "We consider the principles of faith based solely on the Holy Scriptures. The topic of today's lesson is: **The Millennium and the End of Sin**."
    },
    "content": {
      "pl": "Tysiąclecie jest okresem panowania Chrystusa z Jego świętymi w niebie, między pierwszym a drugim zmartwychwstaniem. W tym czasie dokonywany będzie sąd nad niesprawiedliwymi. Ziemia będzie całkowicie pusta, zamieszkała jedynie przez szatana i jego aniołów.\n\nPrzy końcu tego okresu Chrystus wraz ze swymi świętymi i Miastem Świętym zstąpi z nieba na ziemię. Wtedy niesprawiedliwi zostaną wskrzeszeni i wraz z szatanem otoczą miasto, ale ogień od Boga pochłonie ich i oczyści ziemię. Wszechświat na zawsze zostanie uwolniony od grzechu i grzeszników.",
      "en": "The millennium is the thousand-year reign of Christ with His saints in heaven between the first and second resurrections. During this time the wicked dead will be judged; the earth will be utterly desolate, without living human inhabitants, but occupied by Satan and his angels.\n\nAt its close Christ with His saints and the Holy City will descend from heaven to earth. The unrighteous dead will then be resurrected, and with Satan and his angels will encompass the city; but fire from God will consume them and cleanse the earth. The universe will thus be freed of sin and sinners forever."
    },
    "scripture": {
      "primaryQuotes_pl": [
        "\"I będą kapłanami Boga i Chrystusa, i panować z nim będą przez tysiąc lat\" (Obj 20:6).",
        "\"A diabeł... został wrzucony do jeziora z ogniem\" (Obj 20:10)."
      ],
      "primaryQuotes_en": [
        "\"And they lived and reigned with Christ for a thousand years\" (Rev 20:4).",
        "\"The devil... was cast into the lake of fire\" (Rev 20:10)."
      ],
      "references": [
        "Obj 20; 1 Kor 6:2, 3; Jr 4:23-26; Mal 4:1; 2 P 3:13."
      ]
    },
    "discover": {
      "questions_pl": [
        "Co dzieje się z szatanem podczas tysiąclecia opisanego w Objawieniu 20?"
      ],
      "questions_en": [
        "Co dzieje się z szatanem podczas tysiąclecia opisanego w Objawieniu 20?"
      ],
      "items": [
        {
          "id": "d27_1",
          "prompt": "Co dzieje się z szatanem podczas tysiąclecia opisanego w Objawieniu 20?",
          "sourceRefs": [
            "Obj 20:1-3.7-10"
          ],
          "readingExcerpt": "„I pochwycił Smoka, Węża starodawnego, którym jest diabeł i szatan, i związał go na tysiąc lat... aby już nie zwodził narodów”."
        }
      ],
      "needsEditorialReview": false
    },
    "understand": {
      "summary_pl": "Tysiąclecie jest okresem panowania Chrystusa z Jego świętymi w niebie, między pierwszym a drugim zmartwychwstaniem. W tym czasie dokonywany będzie sąd nad niesprawiedliwymi. Ziemia będzie całkowicie pusta, zamieszkała jedynie przez szatana i jego ani...",
      "summary_en": "The millennium is the thousand-year reign of Christ with His saints in heaven between the first and second resurrections. During this time the wicked dead will be judged; the earth will be utterly desolate, without living human inhabitants, but occup...",
      "needsEditorialReview": false
    },
    "quiz": {
      "questions": [
        {
          "id": "q27_1",
          "type": "single_choice",
          "question": "Jaki jest ostateczny los szatana, grzechu i bezbożności po zakończeniu tysiąclecia?",
          "options": [
            "Wieczne torturowanie w podziemiu pod okiem diabła",
            "Całkowite unicestwienie w jeziorze ognia — zło przestaje istnieć na zawsze",
            "Przeniesienie na inną planetę",
            "Przebaczenie bez sądu"
          ],
          "correctAnswer": 1,
          "explanation": "Pismo Święte naucza, że ogień z nieba pochłonie bezbożnych i szatana, obracając ich w popiół, a sprawiedliwość Boża oczyści cały wszechświat (Obj 20:9-14, Mal 4:1-3).",
          "scriptureRefs": [
            "Obj 20:9-14",
            "Mal 4:1-3"
          ],
          "needsEditorialReview": false
        }
      ],
      "needsEditorialReview": false
    },
    "application": {
      "pl": "Bóg ostatecznie rozprawi się ze złem. Grzech nie będzie trwał wiecznie. Czy Twoje życie jest po stronie zwyciężającego Chrystusa? Wiara w sprawiedliwy sąd Boży daje nam siłę do znoszenia niesprawiedliwości, wiedząc, że ostatnie słowo należy do Boga miłości.\n\n---",
      "en": "God will ultimately deal with evil. Sin will not last forever. Is your life on the side of the victorious Christ? Faith in God's righteous judgment gives us strength to endure injustice, knowing that the last word belongs to the God of love.\n\n---"
    },
    "prayer": {
      "pl": "Zrób to Dla Jezusa - On już czeka. Zło przeminie na zawsze.",
      "en": "Do it for Jesus - He is already waiting. Evil will pass away forever."
    },
    "reflectionPrompts": {
      "pl": [
        "Co dzisiaj odkryłem w Słowie Bożym?",
        "Co konkretnie chcę zmienić lub zastosować?",
        "O co proszę Boga w modlitwie?"
      ],
      "en": [
        "What did I discover today in God’s Word?",
        "What specifically do I want to change or apply?",
        "What do I ask God for in prayer?"
      ]
    },
    "decisionPrompt": {
      "pl": "Przyjmuję prawdę o temacie: Tysiąclecie i koniec grzechu do mojego osobistego życia z Bogiem.",
      "en": "I accept the biblical truth regarding Tysiąclecie i koniec grzechu into my personal walk with God."
    },
    "seo": {
      "title_pl": "Tysiąclecie i koniec grzechu — Kurs Biblijny | LUMINA Bible Academy",
      "title_en": "Tysiąclecie i koniec grzechu — Bible Study | LUMINA Bible Academy",
      "description_pl": "Poznaj biblijne nauczanie na temat: Tysiąclecie i koniec grzechu. Interaktywny kurs biblijny Christian Culture.",
      "description_en": "Discover biblical teaching on: Tysiąclecie i koniec grzechu. Interactive Bible study by Christian Culture.",
      "canonicalUrl": "https://polskieradio.cc/kursy#lekcja-27"
    }
  },
  {
    "id": 28,
    "courseId": "biblijne-zasady-wiary-28",
    "stageId": "etap-5",
    "order": 28,
    "slug": "28-nowa-ziemia",
    "image": "/images/lessons/28.svg",
    "version": "1.0.0",
    "title": {
      "pl": "Nowa Ziemia",
      "en": "Nowa Ziemia"
    },
    "subtitle": {
      "pl": "Krok 28 z 28 • NADZIEJA",
      "en": "Step 28 of 28 • BLESSED HOPE"
    },
    "introduction": {
      "pl": "Rozważamy zasady wiary opierając się wyłącznie na Piśmie Świętym. Tematem dzisiejszej lekcji jest: **Nowa Ziemia**.",
      "en": "We consider the principles of faith based solely on the Holy Scriptures. The topic of today's lesson is: **The New Earth**."
    },
    "content": {
      "pl": "Na Nowej Ziemi, gdzie mieszka sprawiedliwość, Bóg przygotuje wieczny dom dla odkupionych oraz doskonałe środowisko dla wiecznego życia, miłości, radości i nauki w Jego obecności. Tutaj sam Bóg będzie przebywał ze swym ludem, a śmierć, ból i cierpienie przeminą na zawsze.\n\nWielki bój zostanie zakończony i grzech więcej się nie pojawi. Wszystko, co ożywione i nieożywione, będzie ogłaszać, że Bóg jest miłością; i będzie On panować na wieki.",
      "en": "On the New Earth, in which righteousness dwells, God will provide an eternal home for the redeemed and a perfect environment for everlasting life, love, joy, and learning in His presence. For here God Himself will dwell with His people, and suffering and death will have passed away.\n\nThe great controversy will be ended, and sin will be no more. All things, animate and inanimate, will declare that God is love; and He shall reign forever."
    },
    "scripture": {
      "primaryQuotes_pl": [
        "\"I widziałem nowe niebo i nową ziemię\" (Obj 21:1).",
        "\"I otrze wszelką łzę z oczu ich\" (Obj 21:4)."
      ],
      "primaryQuotes_en": [
        "\"Then I saw a new heaven and a new earth\" (Rev 21:1).",
        "\"He will wipe away every tear from their eyes\" (Rev 21:4)."
      ],
      "references": [
        "Iz 35; 65:17-25; Mt 5:5; 2 P 3:13; Obj 11:15; 22:1-5."
      ]
    },
    "discover": {
      "questions_pl": [
        "Jak Bóg opisuje Nową Ziemię — wieczną ojczyznę odkupionych?"
      ],
      "questions_en": [
        "Jak Bóg opisuje Nową Ziemię — wieczną ojczyznę odkupionych?"
      ],
      "items": [
        {
          "id": "d28_1",
          "prompt": "Jak Bóg opisuje Nową Ziemię — wieczną ojczyznę odkupionych?",
          "sourceRefs": [
            "Obj 21:1-4",
            "Iz 65:17-25",
            "2 P 3:13"
          ],
          "readingExcerpt": "„I otrze z ich oczu wszelką łzę, a śmierci już odtąd nie będzie. Ani żałoby, ani krzyku, ani trudu już odtąd nie będzie, bo pierwsze rzeczy przeminęły”."
        }
      ],
      "needsEditorialReview": false
    },
    "understand": {
      "summary_pl": "Na Nowej Ziemi, gdzie mieszka sprawiedliwość, Bóg przygotuje wieczny dom dla odkupionych oraz doskonałe środowisko dla wiecznego życia, miłości, radości i nauki w Jego obecności. Tutaj sam Bóg będzie przebywał ze swym ludem, a śmierć, ból i cierpieni...",
      "summary_en": "On the New Earth, in which righteousness dwells, God will provide an eternal home for the redeemed and a perfect environment for everlasting life, love, joy, and learning in His presence. For here God Himself will dwell with His people, and suffering...",
      "needsEditorialReview": false
    },
    "quiz": {
      "questions": [
        {
          "id": "q28_1",
          "type": "true_false",
          "question": "Na Nowej Ziemi odkupieni będą cieszyć się wiecznym życiem w odnowionym świecie, bez bólu, łez i śmierci, w bezpośredniej obecności Boga.",
          "options": [
            "Prawda",
            "Fałsz"
          ],
          "correctAnswer": 0,
          "explanation": "„Oto przybytek Boga z ludźmi: i zamieszka wraz z nimi, i będą oni Jego ludem, a On będzie Bogiem z nimi” (Obj 21:3-4).",
          "scriptureRefs": [
            "Obj 21:3-4",
            "2 P 3:13"
          ],
          "needsEditorialReview": false
        }
      ],
      "needsEditorialReview": false
    },
    "application": {
      "pl": "Czy potrafisz sobie wyobrazić świat bez łez, chorób i pożegnań? To nie jest bajka, to Boża obietnica dla Ciebie. Niech wizja Nowej Ziemi dodaje Ci sił w trudnych chwilach. To, co najlepsze, jest jeszcze przed nami. Twoja ojczyzna jest w niebie.\n\n---",
      "en": "Can you imagine a world without tears, sickness, and goodbyes? This is not a fairy tale; it is God's promise to you. Let the vision of the New Earth give you strength in difficult times. The best is yet to come. Your home is in heaven.\n\n---"
    },
    "prayer": {
      "pl": "Zrób to Dla Jezusa - On już czeka. Dom jest blisko.",
      "en": "Do it for Jesus - He is already waiting. Home is near."
    },
    "reflectionPrompts": {
      "pl": [
        "Co dzisiaj odkryłem w Słowie Bożym?",
        "Co konkretnie chcę zmienić lub zastosować?",
        "O co proszę Boga w modlitwie?"
      ],
      "en": [
        "What did I discover today in God’s Word?",
        "What specifically do I want to change or apply?",
        "What do I ask God for in prayer?"
      ]
    },
    "decisionPrompt": {
      "pl": "Przyjmuję prawdę o temacie: Nowa Ziemia do mojego osobistego życia z Bogiem.",
      "en": "I accept the biblical truth regarding Nowa Ziemia into my personal walk with God."
    },
    "seo": {
      "title_pl": "Nowa Ziemia — Kurs Biblijny | LUMINA Bible Academy",
      "title_en": "Nowa Ziemia — Bible Study | LUMINA Bible Academy",
      "description_pl": "Poznaj biblijne nauczanie na temat: Nowa Ziemia. Interaktywny kurs biblijny Christian Culture.",
      "description_en": "Discover biblical teaching on: Nowa Ziemia. Interactive Bible study by Christian Culture.",
      "canonicalUrl": "https://polskieradio.cc/kursy#lekcja-28"
    }
  }
];

export const LUMINA_POST_28_CATALOG = [
  {
    "id": 29,
    "courseId": "rozwoj-duchowy-post28",
    "order": 29,
    "slug": "29-moc-modlitwy",
    "isCore28": false,
    "title": {
      "pl": "Moc Modlitwy",
      "en": "Moc Modlitwy"
    },
    "introduction": {
      "pl": "Modlitwa to oddech dla duszy chrześcijanina. To nie tylko przedstawianie Bogu swoich próśb, ale intymna relacja, wymiana myśli i budowanie więzi z najlepszym Przyjacielem.",
      "en": "Prayer is the breath of the Christian soul. It is not just about presenting requests to God, but an intimate relationship, an exchange of thoughts, and building a bond with your best Friend."
    },
    "content": {
      "pl": "**1. Modlitwa jako Relacja:**  \nW Ewangelii Mateusza 6:9, Jezus uczy nas: *\"Wy więc tak się módlcie: Ojcze nasz...\"*. Modlitwa zaczyna się od uświadomienia sobie naszej tożsamości. Jesteśmy dziećmi Boga, które przychodzą do Ojca.\n\n**2. O co prosić?**\n* **O Królestwo Boże:** Najpierw szukajcie wpierw Królestwa Bożego (Mt 6:33).\n* **O chleb powszedni:** Nasze codzienne, zwykłe potrzeby obchodzą Boga (Flp 4:6).\n* **O odpuszczenie win:** Modlitwa oczyszcza nas i zachowuje nas w łasce.\n\n**3. Skuteczna modlitwa:**  \nList Jakuba 5:16 mówi: *\"Mocna jest i skuteczna modlitwa sprawiedliwego.\"*. Prawdziwa modlitwa to taka, która płynie z serca, nawet gdy brakuje nam słów. Duch Święty sam wstawia się za nami (Rz 8:26).\n\n### Podsumowanie\nNie musisz używać skomplikowanych słów. Jezus chce Twojej szczerości.\n\n---",
      "en": "**1. Prayer as Relationship:**  \nIn Matthew 6:9, Jesus teaches us: *\"Pray then like this: Our Father...\"*. Prayer starts with recognizing our identity. We are children coming to our Father.\n\n**2. What to ask for?**\n* **For God's Kingdom:** Seek first the Kingdom of God (Mt 6:33).\n* **For daily bread:** Our everyday, ordinary needs matter to God (Phil 4:6).\n* **For forgiveness:** Prayer purifies us and keeps us in grace.\n\n**3. Effective prayer:**  \nJames 5:16 says: *\"The prayer of a righteous person has great power as it is working.\"*. True prayer flows from the heart, even when we lack words. The Holy Spirit intercedes for us (Rom 8:26).\n\n### Summary\nYou don't need complex words. Jesus wants your honesty.\n\n---"
    },
    "application": {
      "pl": "",
      "en": ""
    },
    "prayer": {
      "pl": "Zrób to Dla Jezusa - On już czeka. Dzisiaj znajdź 5 minut, aby w ciszy powiedzieć Mu o tym, co naprawdę czujesz.",
      "en": "Do it for Jesus - He is already waiting. Today, find 5 minutes to sit in silence and tell Him how you truly feel."
    },
    "status": "future_expansion"
  },
  {
    "id": 30,
    "courseId": "rozwoj-duchowy-post28",
    "order": 30,
    "slug": "30-zycie-slowem-bozym",
    "isCore28": false,
    "title": {
      "pl": "Życie Słowem Bożym",
      "en": "Życie Słowem Bożym"
    },
    "introduction": {
      "pl": "Słowo Boże (Biblia) nie jest tylko książką historyczną. Jest \"żywe i skuteczne\", zdolne przemieniać ludzkie życie.",
      "en": "The Word of God (the Bible) is not just a historical book. It is \"living and active,\" capable of transforming human lives."
    },
    "content": {
      "pl": "**1. Biblia jest natchniona:**  \n*\"Całe Pismo przez Boga jest natchnione i pożyteczne do nauki, do wykrywania błędów...\"* (2 Tm 3:16). Oznacza to, że sam Bóg stoi za każdym wpisanym tam słowem ratunku dla Ciebie.\n\n**2. Światło mych ścieżek:**  \n*\"Słowo Twoje jest pochodnią nogom moim...\"* (Ps 119:105). Kiedy tracisz kierunek w świecie pełnym zamieszania, Słowo Boże jest kompasem moralnym.\n\n**3. Miecz Ducha:**  \nW zbroi chrześcijanina z Listu do Efezjan (Ef 6:17), Słowo Boże jest jedyną bronią ofensywną – Mieczem Ducha. To nim odpieramy ataki i wątpliwości przeciwnika w czasie prób.\n\n### Praktyka\nCzytaj codziennie. Nawet jeden mały werset przemyślany przez cały dzień ma większą moc niż 10 przeczytanych w pośpiechu rozdziałów.\n\n---",
      "en": "**1. The Bible is inspired:**  \n*\"All Scripture is breathed out by God and profitable for teaching, for reproof...\"* (2 Tim 3:16). This means God Himself stands behind every word of rescue written for you.\n\n**2. A light to my path:**  \n*\"Your word is a lamp to my feet...\"* (Ps 119:105). When you lose direction in a world full of confusion, the Word of God is your moral compass.\n\n**3. The Sword of the Spirit:**  \nIn the Christian armor from Ephesians (Eph 6:17), the Word of God is the only offensive weapon – the Sword of the Spirit. With it, we fend off the enemy's attacks and doubts during trials.\n\n### Practice\nRead daily. Even a single short verse contemplated throughout the day has more power than 10 chapters read in a rush.\n\n---"
    },
    "application": {
      "pl": "",
      "en": ""
    },
    "prayer": {
      "pl": "Zrób to Dla Jezusa - On już czeka. Otwórz dzisiaj swój ulubiony fragment i pomódl się nim.",
      "en": "Do it for Jesus - He is already waiting. Open your favorite passage today and pray with it."
    },
    "status": "future_expansion"
  },
  {
    "id": 31,
    "courseId": "rozwoj-duchowy-post28",
    "order": 31,
    "slug": "31-dyscyplina-postu",
    "isCore28": false,
    "title": {
      "pl": "Dyscyplina Postu",
      "en": "Dyscyplina Postu"
    },
    "introduction": {
      "pl": "Post to nie sztuczne potępianie własnego ciała. To narzędzie dyscyplinowania ciała i duszy, aby nasz duch mógł wyraźniej słyszeć głos Boga.",
      "en": "Fasting is not an artificial condemnation of one's body. It is a tool to discipline the body and soul so our spirit can more clearly hear God's voice."
    },
    "content": {
      "pl": "**1. Cel postu:**  \nKiedy się pościmy, odsuwamy to, co cielesne (jedzenie, rozrywkę, media), by móc karmić się tym, co duchowe. Jezus sam zachęcał do postu (Mt 6:16-18).\n\n**2. Prawdziwy post w sercu:**  \nKsięga Izajasza (Iz 58:6) mówi jasno, jakiego postu domaga się Bóg: *\"Czyż nie jest raczej ten post, który wybieram: To rozwiązać kajdany zła...\"*. Post jest wtedy ważny, gdy łączysz go z miłością do bliźnich.\n\n**3. Moc duchowa:**  \nPost, wraz z modlitwą, przygotowuje nas do przełomów w wierze. To czas szczególnego poświęcenia Ducha Świętego.",
      "en": "**1. The purpose of fasting:**  \nWhen we fast, we push away fleshly things (food, entertainment, media), to feed on the spiritual. Jesus Himself encouraged fasting (Mt 6:16-18).\n\n**2. True fasting from the heart:**  \nIsaiah (Isa 58:6) clearly states what kind of fast God requires: *\"Is not this the fast that I choose: to loose the bonds of wickedness...\"*. Fasting is valid when combined with love for your neighbor.\n\n**3. Spiritual power:**  \nFasting, paired with prayer, prepares us for breakthroughs in faith. It is a time of special consecration to the Holy Spirit."
    },
    "application": {
      "pl": "Zastanów się, czy jest jakaś mała przyjemność, czy chwila w social mediach, z której możesz dzisiaj zrezygnować na rzecz modlitwy.\n\n---",
      "en": "Consider if there is some small pleasure, or a moment on social media, you can give up today for prayer.\n\n---"
    },
    "prayer": {
      "pl": "Zrób to Dla Jezusa - On już czeka. Oddaj jedną rzecz dzisiaj, by zyskać bliższą relację z Nim.",
      "en": "Do it for Jesus - He is already waiting. Surrender one thing today to gain a closer relationship with Him."
    },
    "status": "future_expansion"
  },
  {
    "id": 32,
    "courseId": "rozwoj-duchowy-post28",
    "order": 32,
    "slug": "32-prowadzenie-ducha-swietego",
    "isCore28": false,
    "title": {
      "pl": "Prowadzenie Ducha Świętego",
      "en": "Prowadzenie Ducha Świętego"
    },
    "introduction": {
      "pl": "Chrześcijaństwo nie polega na stosowaniu surowych zasad lecz na poddaniu się żywej, aktywnej obecności Boga – Duchowi Świętemu.",
      "en": "Christianity is not about strictly following rules but submitting to the living, active presence of God – the Holy Spirit."
    },
    "content": {
      "pl": "**1. Nauczyciel i Pocieszyciel:**  \nJezus odszedł, ale obiecał: *\"Gdy zaś przyjdzie on Duch Prawdy, wprowadzi was we wszelką prawdę...\"* (J 16:13). Duch Święty nigdy Cię nie opuszcza.\n\n**2. Rozróżnianie Głosów:**  \nGłos Ducha Świętego przynosi Boży pokój i zachęca do miłości. Jak uczy Galacjan 5:22: *\"Owocem zaś Ducha jest miłość, radość, pokój, cierpliwość...\"*.\n\n**3. Posłuszeństwo w małych rzeczach:**  \nBóg prowadzi krok po kroku. Uważność na delikatne podszepty Ducha to klucz do dojrzałego chrześcijaństwa.\n\n### Podsumowanie\nProś codziennie, by Duch Boży Cię napełniał i dawał mądrość przed podejmowaniem jakiejkolwiek decyzji.\n\n---",
      "en": "**1. Teacher and Comforter:**  \nJesus left but promised: *\"When the Spirit of truth comes, he will guide you into all the truth...\"* (John 16:13). The Holy Spirit never leaves you.\n\n**2. Discerning Voices:**  \nThe voice of the Holy Spirit brings God's peace and encourages love. As Galatians 5:22 teaches: *\"But the fruit of the Spirit is love, joy, peace, patience...\"*.\n\n**3. Obedience in small things:**  \nGod leads step by step. Attentiveness to the gentle nudges of the Spirit is the key to mature Christianity.\n\n### Summary\nAsk daily for God's Spirit to fill you and give you wisdom before making any decision.\n\n---"
    },
    "application": {
      "pl": "",
      "en": ""
    },
    "prayer": {
      "pl": "Zrób to Dla Jezusa - On już czeka. Otwórz swoje serce, wycisz się i słuchaj Bożych wskazówek.",
      "en": "Do it for Jesus - He is already waiting. Open your heart, be still, and listen to God's guidance."
    },
    "status": "future_expansion"
  },
  {
    "id": 33,
    "courseId": "rozwoj-duchowy-post28",
    "order": 33,
    "slug": "33-nauka-o-trojjedynym-bogu",
    "isCore28": false,
    "title": {
      "pl": "Nauka o Trójjedynym Bogu",
      "en": "Nauka o Trójjedynym Bogu"
    },
    "introduction": {
      "pl": "Wiara w Trójjedynego Boga to fundament chrześcijaństwa. Bóg Objawia się nam jako Ojciec, Syn i Duch Święty – jedna natura, w trzech doskonałych i współistniejących osobach.",
      "en": "Belief in the Triune God is the foundation of Christianity. God reveals Himself as Father, Son, and Holy Spirit – one essence, in three perfect, co-existing persons."
    },
    "content": {
      "pl": "**1. Dowód Nowego Testamentu:**  \nPodczas chrztu Jezusa (Mt 3:16-17) w jednym momencie widoczne są trzy Osoby: Syn wychodzący z wody, Duch Święty w postaci gołębicy i głos Ojca z nieba.\n\n**2. Relacja ponad wszystko:**  \nBóg z samej Swojej natury (Jeden Bóg w Trzech Osobach) JEST Miłością, w wiecznej relacji, której my jesteśmy zaproszeni częścią.\n\n**3. Znaczenie praktyczne:**  \nModlimy się DO Ojca, PRZEZ Syna (Jezusa Chrystusa), W mocy Ducha Świętego. \n\n### Podsumowanie\nNie musisz tego pojąć matematycznymi równaniami – Bóg przewyższa nasz umysł. Wymaga on serca, które ufa.\n\n---",
      "en": "**1. New Testament Proof:**  \nAt the baptism of Jesus (Mt 3:16-17), three Persons are seen simultaneously: the Son emerging from the water, the Holy Spirit descending like a dove, and the Father's voice from heaven.\n\n**2. Relationship above all:**  \nGod by His very nature (One God in Three Persons) IS Love, living in eternal relationship, which we are invited to join.\n\n**3. Practical meaning:**  \nWe pray TO the Father, THROUGH the Son (Jesus Christ), IN the power of the Holy Spirit.\n\n### Summary\nYou don't have to comprehend this with mathematical equations – God transcends our minds. He requires a trusting heart.\n\n---"
    },
    "application": {
      "pl": "",
      "en": ""
    },
    "prayer": {
      "pl": "Zrób to Dla Jezusa - On już czeka. Uwielbij dzisiaj Boga w Jego pełnej, cudownej Trójcy.",
      "en": "Do it for Jesus - He is already waiting. Worship God today in His full, wonderful Trinity."
    },
    "status": "future_expansion"
  },
  {
    "id": 34,
    "courseId": "rozwoj-duchowy-post28",
    "order": 34,
    "slug": "34-kim-jest-jezus-chrystus",
    "isCore28": false,
    "title": {
      "pl": "Kim jest Jezus Chrystus?",
      "en": "Kim jest Jezus Chrystus?"
    },
    "introduction": {
      "pl": "W Ewangelii Mateusza (Mt 16:15) Jezus pyta: *\"A wy za kogo mnie uważacie?\"* To najważniejsze pytanie ludzkości, a od odpowiedzi na nie, zależy cała wieczność.",
      "en": "In Matthew's Gospel (Mt 16:15) Jesus asks: *\"But who do you say that I am?\"* This is the most important question of mankind, and eternity depends on the answer."
    },
    "content": {
      "pl": "**1. Prawdziwy Bóg i prawdziwy człowiek:**  \nJezus to Wcielone Słowo Boga (J 1:1, 14). Stał się człowiekiem, narodził się, czuł głód, ból, ulegał zmęczeniu, a jednocześnie posiadał autorytet równy Ojcu by wybaczać grzechy.\n\n**2. Skaza na krzyżu:**  \nAby zapłacić karę za nasze grzechy, potrzebna była bezgrzeszna ofiara. Tylko doskonały człowiek (i Bóg w jednej osobie) był w stanie odwrócić klątwę grzechu Adama (Rz 5:19).\n\n**3. Nasz Najwyższy Kapłan:**  \nW Liście do Hebrajczyków (Hbr 4:15) czytamy, że mamy kapłana, *\"który może współczuć w naszych słabościach, kuszonego we wszystkim (...), z wyjątkiem grzechu\"*. \n\n### Refleksja\nJezus wie jak Ci jest ciężko. On to wszystko przeszedł. \n\n---",
      "en": "**1. True God and true man:**  \nJesus is the Incarnate Word of God (John 1:1, 14). He became man, was born, felt hunger, pain, yielded to fatigue, yet possessed authority equal to the Father to forgive sins.\n\n**2. The blemish on the cross:**  \nTo pay the penalty for our sins, a sinless sacrifice was needed. Only a perfect man (and God in one person) was able to reverse the curse of Adam's sin (Rom 5:19).\n\n**3. Our High Priest:**  \nIn Hebrews (Heb 4:15) we read that we have a priest, *\"who is able to sympathize with our weaknesses, but one who in every respect has been tempted as we are, yet without sin.\"*\n\n### Reflection\nJesus knows how hard it is for you. He has been through it all.\n\n---"
    },
    "application": {
      "pl": "",
      "en": ""
    },
    "prayer": {
      "pl": "Zrób to Dla Jezusa - On już czeka. Jemu możesz zaufać w 100 procentach. Oddaj Mu to z czym walczysz.",
      "en": "Do it for Jesus - He is already waiting. You can trust Him 100 percent. Surrender to Him what you are fighting."
    },
    "status": "future_expansion"
  },
  {
    "id": 35,
    "courseId": "rozwoj-duchowy-post28",
    "order": 35,
    "slug": "35-zbawienie-przez-laske",
    "isCore28": false,
    "title": {
      "pl": "Zbawienie przez Łaskę",
      "en": "Zbawienie przez Łaskę"
    },
    "introduction": {
      "pl": "Jeśli sądzisz, że musisz zarobić na Niebo – nigdy Ci się nie uda. Na szczęście zbawienie to dar, a nie wypłata.",
      "en": "If you think you have to earn Heaven – you will never succeed. Fortunately, salvation is a gift, not a paycheck."
    },
    "content": {
      "pl": "**1. Łaską jesteście zbawieni:**  \n*\"Albowiem łaską zbawieni jesteście przez wiarę, i to nie z was, Boży to dar;* (Ef 2:8). Nie możesz dodać nic do tego, co Jezus zrobił na krzyżu. \n\n**2. Martwi z powodu grzechu:**  \nGrzech zniszczył ludzką naturę tak głęboko (Rz 3:23), że potrzebowaliśmy absolutnie Boskiej interwencji. \n\n**3. Dobre uczynki to OWOC a nie cena:**  \nCzytamy dalej (Ef 2:10), że *\"jesteśmy Jego dziełem, stworzeni w Chrystusie Jezusie do dobrych uczynków...\"*. Robimy dobre rzeczy z wdzięczności i przemienionego serca, a nie w celu zdobycia zgody od Boga. \n\n### Podsumowanie\nDarmowa woda życia jest dla Ciebie. Przyjdź do niej bez pieniędzy by pragnąć, lecz w uniżeniu i szczerym żalu.\n\n---",
      "en": "**1. Saved by grace:**  \n*\"For by grace you have been saved through faith. And this is not your own doing; it is the gift of God\"* (Eph 2:8). You cannot add anything to what Jesus did on the cross.\n\n**2. Dead due to sin:**  \nSin corrupted human nature so deeply (Rom 3:23) that we absolutely needed Divine intervention.\n\n**3. Good works are the FRUIT, not the price:**  \nWe read further (Eph 2:10) that *\"we are his workmanship, created in Christ Jesus for good works...\"*. We do good things out of gratitude from a transformed heart, not to win God's approval.\n\n### Summary\nThe free water of life is for you. Come to it without money to yearn, but in humility and genuine repentance.\n\n---"
    },
    "application": {
      "pl": "",
      "en": ""
    },
    "prayer": {
      "pl": "Zrób to Dla Jezusa - On już czeka. Podziękuj dziś Chrystusowi za Jego krew, która okupiła Twoją wolność.",
      "en": "Do it for Jesus - He is already waiting. Thank Christ today for His blood which bought your freedom."
    },
    "status": "future_expansion"
  },
  {
    "id": 36,
    "courseId": "rozwoj-duchowy-post28",
    "order": 36,
    "slug": "36-czasy-ostateczne",
    "isCore28": false,
    "title": {
      "pl": "Czasy Ostateczne",
      "en": "Czasy Ostateczne"
    },
    "introduction": {
      "pl": "Żyjemy w epoce, która zbliża się wielkimi krokami ku finalnym wydarzeniom w historii ziemi. Biblia jest przejrzystą księgą odsłaniającą ten bieg wydarzeń.",
      "en": "We live in an age that is rapidly moving towards final events in Earth's history. The Bible is a transparent book revealing this course of events."
    },
    "content": {
      "pl": "**1. Znaki Czasu:**  \nJezus w Ewangelii Mateusza rozdział 24, zapowiada m.in. wojny, głód, trzęsienia ziemi, odstępstwo i ostygnięcie miłości wielu ludzi. Jednak to nie koniec to - znaki ostrzegawcze.\n\n**2. Prawdziwa tożsamość:**  \nObjawienie św. Jana przypomina nam byśmy trwali. *\"Tu jest wytrwałość świętych, którzy przestrzegają przykazań Bożych i wiary w Jezusa.\"* (Obj 14:12). Odstępstwo jest łatwe, wierność kosztuje. \n\n**3. Zmartwychwstanie i Obietnica Życia:**  \nWkrótce powrót Zbawiciela: *\"ponieważ sam Pan zstąpi z nieba... my (...), zostaniemy porwani na obłoki, w powietrze, na spotkanie Pana\"* (1 Tes 4:16-17). Ten dzień dla wierzących to nie strach, ale tęsknota.\n\n### Praktyka\nNie lękaj się przyszłości, jeśli wierzysz Jezusowi i opierasz na tym jak na opoque. \n\n---",
      "en": "**1. Signs of the times:**  \nJesus, in Matthew chapter 24, foretells among other things wars, famines, earthquakes, apostasy, and the cooling of love in many people. Yet this is not the end - it is a warning sign.\n\n**2. True identity:**  \nThe Revelation reminds us to endure. *\"Here is a call for the endurance of the saints, those who keep the commandments of God and their faith in Jesus.\"* (Rev 14:12). Apostasy is easy, fidelity costs.\n\n**3. Resurrection and Promise of Life:**  \nSoon the Savior's return: *\"For the Lord himself will descend from heaven... we (...) will be caught up together with them in the clouds to meet the Lord in the air\"* (1 Thess 4:16-17). For believers, this day is not terror, but longing.\n\n### Practice\nDo not fear the future if you trust Jesus and stand on Him like a solid rock.\n\n---"
    },
    "application": {
      "pl": "",
      "en": ""
    },
    "prayer": {
      "pl": "Zrób to Dla Jezusa - On już czeka. Żyj tak, by w każdym momencie bez wstydu przywitać powracającego Króla!",
      "en": "Do it for Jesus - He is already waiting. Live in a way that, at any moment, you can greet the returning King without shame!"
    },
    "status": "future_expansion"
  },
  {
    "id": 37,
    "courseId": "rozwoj-duchowy-post28",
    "order": 37,
    "slug": "37-wielkie-poslannictwo",
    "isCore28": false,
    "title": {
      "pl": "Wielkie Posłannictwo",
      "en": "Wielkie Posłannictwo"
    },
    "introduction": {
      "pl": "Gdy Jezus opuszczał ziemię by zasiąść po prawicy Boga, zostawił nam bardzo konkretne zadanie. Czas działać.",
      "en": "When Jesus left the earth to sit at the right hand of God, He left us a very specific task. It's time to act."
    },
    "content": {
      "pl": "**1. Rozkaz samego Mistrza:**  \n*\"Idźcie więc i nauczajcie wszystkie narody, chrzcząc je w imię Ojca i Syna, i Ducha Świętego;\"* (Mt 28:19). Misją nie jest tylko chodzenie do zborów lub parafii w Sabat bądx Niedzielę, sam na sam.\n\n**2. Każdy jest wezwany:**  \nZadanie to nie jest tylko dla wyświęconych przywódców, papieży czy pastorów. *\"Wy zaś jesteście rodem wybranym, królewskim kapłaństwem.\"* (1 Piotra 2:9). \n\n**3. Na wzór Wojownika:**  \nSłowo Boże idzie przez internet, Twoją rodzinę, pracę zawodową. Kiedy wykonujesz swoją pracę najlepiej jak potrafisz – to budzi zapytania! (Kol 3:23).\n\n### Podsumowanie\nNie musisz ukończyć seminarium by powiedzieć sąsiadowi kim jest dla Ciebie Jezus. Twoje osobiste świadectwo jest kluczem.\n\n---",
      "en": "**1. The Master's command:**  \n*\"Go therefore and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit;\"* (Mt 28:19). The mission is not just going to church on Sabbath or Sunday, all by yourself.\n\n**2. Everyone is called:**  \nThis task is not only for ordained leaders, popes, or pastors. *\"But you are a chosen race, a royal priesthood.\"* (1 Pet 2:9).\n\n**3. After the pattern of a Warrior:**  \nThe Word of God goes out via the internet, your family, your professional work. When you do your job the best you can – it raises questions! (Col 3:23).\n\n### Summary\nYou do not need to graduate from the seminary to tell your neighbor who Jesus is to you. Your personal testimony is key.\n\n---"
    },
    "application": {
      "pl": "",
      "en": ""
    },
    "prayer": {
      "pl": "Zrób to Dla Jezusa - On już czeka. Opowiedz o Nim komuś z Twojego środowiska. Dziś.",
      "en": "Do it for Jesus - He is already waiting. Tell someone in your circle about Him. Today."
    },
    "status": "future_expansion"
  },
  {
    "id": 38,
    "courseId": "rozwoj-duchowy-post28",
    "order": 38,
    "slug": "38-skuteczne-swiadectwo",
    "isCore28": false,
    "title": {
      "pl": "Skuteczne Świadectwo",
      "en": "Skuteczne Świadectwo"
    },
    "introduction": {
      "pl": "Ludzie rzadko dają się przekonać teologicznym i suchym monologom, wolą dowody, realną siłę, realne przemiany. Jesteś żywą ewangelią!",
      "en": "People are rarely convinced by theological and dry monologues, they prefer proof, real strength, real transformation. You are a living gospel!"
    },
    "content": {
      "pl": "**1. Autentyczność wygrywa:**  \nNie pokazuj że jesteś \"idealnym\" i świętoszkowatym wierzącym, na którego nie działają słabości (to rzadko jest prawda!). Paweł powiedział do Tytusa by dziać tak, by w *\"każdej mierze stał się wzorem dla wierzących we wszystkim\"*. \n\n**2. Świadectwo własnego błędu:**  \nŚwiadectwo ma ogromną moc, jeśli powiesz: byłem zagubiony w hazardzie, w używkach, z pragnieniem grzechu a Jezus przemienił moje serce poprzez cierpienie.\n\n**3. Używaj empatii, a unikaj osądu:**  \nSądź zachowanie, ale oddaj miłosierdzie nad człowiekiem. \n\n### Podsumowanie\nDobry Wojownik potrafi pomóc słabemu wejść na górę tam gdzie sam miał rany. Miejcie zawsze odpowiedź o wierze każdemu kto zapyta (1 Pt 3:15)!\n\n---",
      "en": "**1. Authenticity wins:**  \nDo not act like a \"perfect\" or pious believer on whom weaknesses make no impact (it's rarely true!). Paul told Titus to act in a way to become *\"in every respect a model for believers in everything\"*.\n\n**2. Testimony of one's own failure:**  \nTestimony has enormous power if you say: I was lost in gambling, in substances, with the desire for sin, and Jesus changed my heart through suffering.\n\n**3. Use empathy and avoid judgment:**  \nJudge the behavior, but have mercy for the person.\n\n### Summary\nA good Warrior knows how to help the weak climb up the mountain where he himself was wounded. Always have an answer about faith to everyone who asks (1 Pet 3:15)!\n\n---"
    },
    "application": {
      "pl": "",
      "en": ""
    },
    "prayer": {
      "pl": "Zrób to Dla Jezusa - On już czeka. Skróć dystans dla tych co pobłądzili!",
      "en": "Do it for Jesus - He is already waiting. Bridge the gap for those who strayed!"
    },
    "status": "future_expansion"
  }
];

export default {
  stages: LUMINA_STAGES,
  core28: LUMINA_COURSES_CORE_28,
  post28Catalog: LUMINA_POST_28_CATALOG
};
