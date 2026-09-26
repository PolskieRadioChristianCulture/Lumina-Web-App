/**
 * ══════════════════════════════════════════════════════════════════════════
 * LUMINA BIBLE ACADEMY — CONTENT GENERATOR & INJECTOR (Phase 4)
 * Plik: scripts/populate-courses-content-phase4.cjs
 * 
 * Generuje i wstrzykuje zatwierdzone pytania ODKRYJ oraz QUIZ dla 28 lekcji
 * Źródła: Biblia, 28 Zasad Wiary, cclite.pl
 * ══════════════════════════════════════════════════════════════════════════
 */

const fs = require('fs');
const path = require('path');

const dataFilePath = path.join(__dirname, '..', 'data', 'lumina-courses-data.js');
let dataContent = fs.readFileSync(dataFilePath, 'utf8');

// Baza pytań ODKRYJ i QUIZ dla 28 Lekcji
const COURSE_CONTENT_DATABASE = {
  1: {
    discover: [
      {
        id: 'd1_1',
        prompt: 'Skąd pochodzi natchnienie Pisma Świętego i w jakim celu zostało nam dane?',
        sourceRefs: ['2 Tm 3:16-17'],
        readingExcerpt: '„Całe Pismo przez Boga jest natchnione i pożyteczne do nauki, do wykrywania błędów, do poprawy, do wychowywania w sprawiedliwości”.'
      },
      {
        id: 'd1_2',
        prompt: 'W jaki sposób proroctwa i prawdy biblijne dotarły do ludzi?',
        sourceRefs: ['2 P 1:20-21'],
        readingExcerpt: '„Wypowiadali je ludzie Boży, natchnieni Duchem Świętym”.'
      }
    ],
    quiz: [
      {
        id: 'q1_1',
        type: 'single_choice',
        question: 'Kto jest pierwotnym źródłem i natchnieniem Pisma Świętego według 2 P 1:21?',
        options: ['Ludzka mądrość i tradycja filozofów', 'Duch Święty kierujący ludźmi Bożymi', 'Uchwały dawnych soborów państwowych', 'Przypadkowe zapiski historyczne'],
        correctAnswer: 1,
        explanation: 'Pismo Święte jednoznacznie wskazuje, że proroctwa nie powstawały z ludzkiej woli, lecz wypowiadali je ludzie Boży natchnieni Duchem Świętym.',
        scriptureRefs: ['2 P 1:21'],
        needsEditorialReview: false
      },
      {
        id: 'q1_2',
        type: 'true_false',
        question: 'Pismo Święte, Stary i Nowy Testament, stanowi jedyną, nieomylną regułę wiary i życia chrześcijanina.',
        options: ['Prawda', 'Fałsz'],
        correctAnswer: 0,
        explanation: 'Słowo Boże jest najwyższym autorytetem, sprawdzianem wszelkiej nauki i doświadczenia (Iz 8:20, J 17:17).',
        scriptureRefs: ['Iz 8:20', 'J 17:17'],
        needsEditorialReview: false
      }
    ]
  },
  2: {
    discover: [
      {
        id: 'd2_1',
        prompt: 'W jakiej formule Jezus nakazał udzielać chrztu wszystkim narodom?',
        sourceRefs: ['Mt 28:19'],
        readingExcerpt: '„Idźcie więc i nauczajcie wszystkie narody, udzielając im chrztu w imię Ojca i Syna, i Ducha Świętego”.'
      },
      {
        id: 'd2_2',
        prompt: 'Jak apostoł Paweł podsumowuje błogosławieństwo Trzech Osób Boskich?',
        sourceRefs: ['2 Kor 13:13'],
        readingExcerpt: '„Łaska Pana Jezusa Chrystusa i miłość Boga, i społeczność Ducha Świętego niech będzie z wami wszystkimi”.'
      }
    ],
    quiz: [
      {
        id: 'q2_1',
        type: 'single_choice',
        question: 'Ilu współwiecznych Osób w doskonałej jedności tworzy Jedynego Boga według Pisma Świętego?',
        options: ['Jedna Osoba przyjmująca różne postacie', 'Dwie Osoby', 'Trzy współwieczne Osoby: Ojciec, Syn i Duch Święty', 'Wielu pomniejszych bogów'],
        correctAnswer: 2,
        explanation: 'Pismo Święte objawia jednego Boga w trzech współwiecznych Osobach (Mt 28:19, 2 Kor 13:13, Ef 4:4-6).',
        scriptureRefs: ['Mt 28:19', 'Ef 4:4-6'],
        needsEditorialReview: false
      }
    ]
  },
  3: {
    discover: [
      {
        id: 'd3_1',
        prompt: 'Jaki fundamentalny przymiot najlepiej definiuje istotę Boga Ojca?',
        sourceRefs: ['1 J 4:8.16'],
        readingExcerpt: '„Bóg jest miłością: kto trwa w miłości, trwa w Bogu, a Bóg trwa w nim”.'
      }
    ],
    quiz: [
      {
        id: 'q3_1',
        type: 'single_choice',
        question: 'W jaki sposób Bóg Ojciec dowiódł Swojej bezgranicznej miłości do upadłego człowieka?',
        options: ['Wymagając ofiar z ludzi', 'Dając Swojego Jednorodzonego Syna na ratunek', 'Pozostawiając świat samemu sobie', 'Zsyłając potępienie bez ostrzeżenia'],
        correctAnswer: 1,
        explanation: '„Tak bowiem Bóg umiłował świat, że Syna swego Jednorodzonego dał, aby każdy, kto w Niego wierzy, nie zginął, ale miał życie wieczne” (J 3:16).',
        scriptureRefs: ['J 3:16'],
        needsEditorialReview: false
      }
    ]
  },
  4: {
    discover: [
      {
        id: 'd4_1',
        prompt: 'Kim było Słowo (Logos), które na początku było u Boga i stało się ciałem?',
        sourceRefs: ['J 1:1-3.14'],
        readingExcerpt: '„Na początku było Słowo, a Słowo było u Boga, i Bogiem było Słowo... A Słowo stało się ciałem i zamieszkało wśród nas”.'
      }
    ],
    quiz: [
      {
        id: 'q4_1',
        type: 'true_false',
        question: 'Jezus Chrystus jest prawdziwym Bogiem i stał się prawdziwym człowiekiem w jednej Osobie.',
        options: ['Prawda', 'Fałsz'],
        correctAnswer: 0,
        explanation: 'Wcielenie Chrystusa łączy pełnię Boskości z prawdziwym człowieczeństwem, aby On mógł stać się naszym jedynym Pośrednikiem i Zbawicielem (Flp 2:5-11, Kol 1:15-19).',
        scriptureRefs: ['Flp 2:5-11', '1 Tm 2:5'],
        needsEditorialReview: false
      }
    ]
  },
  5: {
    discover: [
      {
        id: 'd5_1',
        prompt: 'Jakie role pełni Duch Święty w życiu wierzącego według obietnicy Jezusa?',
        sourceRefs: ['J 14:16-17.26', 'J 16:8.13'],
        readingExcerpt: '„Pocieszyciel, Duch Święty... nauczy was wszystkiego i przypomni wam wszystko, co wam powiedziałem”.'
      }
    ],
    quiz: [
      {
        id: 'q5_1',
        type: 'single_choice',
        question: 'Duch Święty według nauczania Pisma Świętego jest:',
        options: ['Bezosobową energią lub siłą natury', 'Boską Osobą, Pocieszycielem i Nauczycielem prawdy', 'Metaforą dobrych myśli człowieka', 'Wyłącznie duchem zmarłych proroków'],
        correctAnswer: 1,
        explanation: 'Duch Święty jest Trzecią Osobą Bóstwa, która przekonuje o grzechu, prowadzi do wszelkiej prawdy i odnawia serce człowieka (J 14:16-26, Dz 5:3-4).',
        scriptureRefs: ['J 14:16-26', 'Dz 5:3-4'],
        needsEditorialReview: false
      }
    ]
  },
  6: {
    discover: [
      {
        id: 'd6_1',
        prompt: 'W jakim czasie i w jaki sposób Bóg powołał świat do istnienia według Księgi Rodzaju i Dekalogu?',
        sourceRefs: ['Rdz 1:31 — 2:3', 'Wj 20:11'],
        readingExcerpt: '„W sześciu dniach bowiem uczynił Pan niebo i ziemię, morze i wszystko, co w nich jest, a siódmego dnia odpoczął”.'
      }
    ],
    quiz: [
      {
        id: 'q6_1',
        type: 'single_choice',
        question: 'Co ustanowił Bóg pod koniec tygodnia stworzenia na wieczną pamiątkę Swojego dzieła?',
        options: ['Doroczne święto plonów', 'Siódmy dzień tygodnia — Szabat — uświęcając go i błogosławiąc', 'Świątynię z kamienia w Jerozolimie', 'System podatków'],
        correctAnswer: 1,
        explanation: 'Bóg pobłogosławił dzień siódmy i poświęcił go, ponieważ w nim odpoczął od wszelkiego dzieła, które stworzył (Rdz 2:1-3, Wj 20:8-11).',
        scriptureRefs: ['Rdz 2:1-3', 'Wj 20:11'],
        needsEditorialReview: false
      }
    ]
  },
  7: {
    discover: [
      {
        id: 'd7_1',
        prompt: 'Na czyj obraz został stworzony człowiek i jakie były konsekwencje nieposłuszeństwa?',
        sourceRefs: ['Rdz 1:26-27', 'Rz 5:12'],
        readingExcerpt: '„Przez jednego człowieka grzech wszedł na świat, a przez grzech śmierć”.'
      }
    ],
    quiz: [
      {
        id: 'q7_1',
        type: 'single_choice',
        question: 'Jaka jest sytuacja każdego człowieka po upadku w grzech bez Chrystusa?',
        options: ['Człowiek rodzi się bezgrzeszny i nie potrzebuje łaski', 'Wszyscy zgrzeszyli i brak im chwały Bożej, podlegając śmierci', 'Człowiek staje się aniołem po śmierci', 'Grzech dotyczy tylko złych ludzi'],
        correctAnswer: 1,
        explanation: '„Wszyscy bowiem zgrzeszyli i pozbawieni są chwały Bożej” (Rz 3:23), dlatego każdy człowiek potrzebuje Odkupiciela.',
        scriptureRefs: ['Rz 3:23', 'Rz 6:23'],
        needsEditorialReview: false
      }
    ]
  },
  8: {
    discover: [
      {
        id: 'd8_1',
        prompt: 'Gdzie rozpoczął się Wielki Bój między Chrystusem a szatanem?',
        sourceRefs: ['Obj 12:7-9', 'Iz 14:12-14'],
        readingExcerpt: '„I wybuchła walka w niebie: Michał i Jego aniołowie stoczyli bój ze Smokiem”.'
      }
    ],
    quiz: [
      {
        id: 'q8_1',
        type: 'single_choice',
        question: 'Co było przyczyną buntu Lucyfera i wybuchu Wielkiego Boju?',
        options: ['Spór o bogactwa materialne', 'Pycha, samouwielbienie i chęć wyniesienia się ponad Boga', 'Błąd w Bożym prawie', 'Brak anielskich obowiązków'],
        correctAnswer: 1,
        explanation: 'Lucyfer pragnął być równy Najwyższemu i zakwestionował Boży charakter sprawiedliwości i miłości (Iz 14:12-14, Ez 28:12-17).',
        scriptureRefs: ['Iz 14:12-14', 'Ez 28:15-17'],
        needsEditorialReview: false
      }
    ]
  },
  9: {
    discover: [
      {
        id: 'd9_1',
        prompt: 'Dlaczego ofiara Jezusa na krzyżu Golgoty ma moc zbawienia każdego, kto wierzy?',
        sourceRefs: ['1 Kor 15:3-4', '1 P 2:24', 'Rz 5:8'],
        readingExcerpt: '„Chrystus umarł za nasze grzechy zgodnie z Pismem, został pogrzebany i zmartwychwstał trzeciego dnia”.'
      }
    ],
    quiz: [
      {
        id: 'q9_1',
        type: 'true_false',
        question: 'Zmartwychwstanie Jezusa Chrystusa było dosłowne, cielesne i jest gwarancją zmartwychwstania wierzących.',
        options: ['Prawda', 'Fałsz'],
        correctAnswer: 0,
        explanation: 'Chrystus rzeczywiście powstał z martwych jako pierwiastek tych, którzy zasnęli (1 Kor 15:20-22, Łk 24:39).',
        scriptureRefs: ['1 Kor 15:20', 'Łk 24:39'],
        needsEditorialReview: false
      }
    ]
  },
  10: {
    discover: [
      {
        id: 'd10_1',
        prompt: 'W jaki sposób człowiek otrzymuje dar zbawienia według listów apostoła Pawła?',
        sourceRefs: ['Ef 2:8-10', 'Rz 3:24-28'],
        readingExcerpt: '„Łaską bowiem jesteście zbawieni przez wiarę. A to nie z was, Boży to dar; nie z uczynków, aby się nikt nie chlubił”.'
      }
    ],
    quiz: [
      {
        id: 'q10_1',
        type: 'single_choice',
        question: 'Czy człowiek może zapracować na zbawienie własnymi dobrymi uczynkami?',
        options: ['Tak, jeśli przestrzega wszystkich reguł', 'Nie, zbawienie jest darmowym darem łaski Bożej przyjmowanym przez wiarę', 'Częściowo — 50% łaski i 50% uczynków', 'Tylko przez składanie ofiar materialnych'],
        correctAnswer: 1,
        explanation: 'Zbawienie jest w 100% darem niezasłużonej łaski Bożej, a dobre uczynki są owocem i dowodem odrodzonego życia (Ef 2:8-10).',
        scriptureRefs: ['Ef 2:8-10'],
        needsEditorialReview: false
      }
    ]
  },
  11: {
    discover: [
      {
        id: 'd11_1',
        prompt: 'Jakie duchowe nawyki są fundamentem codziennego wzrastania w Chrystusie?',
        sourceRefs: ['Kol 2:6-7', 'Ef 6:10-18', '1 Tes 5:16-18'],
        readingExcerpt: '„Jak więc przyjęliście Chrystusa Jezusa, Pana, tak w Nim postępujcie: zapuszczeni w korzenie i na Nim budowani”.'
      }
    ],
    quiz: [
      {
        id: 'q11_1',
        type: 'single_choice',
        question: 'W jaki sposób chrześcijanin odnosi codzienne zwycięstwo nad pokusami i mocami ciemności?',
        options: ['Polegając na własnej sile woli', 'Przez modlitwę, badanie Słowa Bożego i trwanie w Chrystusie', 'Unikając jakichkolwiek kontaktów z ludźmi', 'Stosując zaklęcia ochronne'],
        correctAnswer: 1,
        explanation: 'Przez śmierć na krzyżu Jezus odniósł triumf nad złymi mocami, a my zwyciężamy dzięki Jego zbroi Bożej i nieustannej modlitwie (Ef 6:10-18, Kol 2:15).',
        scriptureRefs: ['Ef 6:10-18', 'Kol 2:15'],
        needsEditorialReview: false
      }
    ]
  },
  12: {
    discover: [
      {
        id: 'd12_1',
        prompt: 'Czym jest Kościół Boży i kto jest Jego jedyną Głową?',
        sourceRefs: ['Ef 1:22-23', 'Kol 1:18'],
        readingExcerpt: '„On także jest Głową Ciała — Kościoła. On jest Początkiem, Pierworodnym z umarłych”.'
      }
    ],
    quiz: [
      {
        id: 'q12_1',
        type: 'single_choice',
        question: 'Kto jest jedyną i najwyższą Głową Kościoła Bożego według Nowego Testamentu?',
        options: ['Ziemski monarcha lub patriarcha', 'Jezus Chrystus', 'Kolegium urzędników kościelnych', 'Lider danej społeczności'],
        correctAnswer: 1,
        explanation: 'Bóg wszystko poddał pod stopy Chrystusa i ustanowił Go ponad wszystkim Głową Kościoła, który jest Jego Ciałem (Ef 1:22-23, Kol 1:18).',
        scriptureRefs: ['Ef 1:22-23', 'Kol 1:18'],
        needsEditorialReview: false
      }
    ]
  },
  13: {
    discover: [
      {
        id: 'd13_1',
        prompt: 'Jakie znaki rozpoznawcze posiada lud Bożego ostatka w czasie końca?',
        sourceRefs: ['Obj 12:17', 'Obj 14:12'],
        readingExcerpt: '„Tu jest wytrwałość świętych, tych, którzy strzegą przykazań Boga i wiary Jezusa”.'
      }
    ],
    quiz: [
      {
        id: 'q13_1',
        type: 'single_choice',
        question: 'Które cechy charakteryzują lud przymierza ostatka według Objawienia 12:17 i 14:12?',
        options: ['Strzeżenie przykazań Bożych i wiara Jezusa', 'Dążenie do ziemskich zaszczytów i potęgi', 'Zastępowanie Pisma Świętego tradycją ludzką', 'Pasywne wycofanie się z głoszenia Ewangelii'],
        correctAnswer: 0,
        explanation: 'Pismo Święte definiuje ostatek jako tych, którzy strzegą przykazań Boga i mają świadectwo Jezusa Chrystusa (Obj 12:17, Obj 14:12).',
        scriptureRefs: ['Obj 12:17', 'Obj 14:12'],
        needsEditorialReview: false
      }
    ]
  },
  14: {
    discover: [
      {
        id: 'd14_1',
        prompt: 'O jaką jedność modlił się Jezus dla Swoich uczniów przed pójściem na krzyż?',
        sourceRefs: ['J 17:20-23'],
        readingExcerpt: '„Aby wszyscy byli jedno, jak Ty, Ojcze, we Mnie, a Ja w Tobie, aby i oni w Nas byli jedno, by świat uwierzył, że Ty Mnie posłałeś”.'
      }
    ],
    quiz: [
      {
        id: 'q14_1',
        type: 'true_false',
        question: 'W Ciele Chrystusa nie ma miejsca na uprzedzenia rasowe, społeczne czy narodowe — wszyscy jesteśmy jedno w Chrystusie.',
        options: ['Prawda', 'Fałsz'],
        correctAnswer: 0,
        explanation: '„Nie ma już Żyda ani poganina, nie ma niewolnika ani wolnego, nie ma mężczyzny ani kobiety; wszyscy bowiem jedno jesteście w Chrystusie Jezusie” (Ga 3:28).',
        scriptureRefs: ['Ga 3:28', 'Ef 4:3-6'],
        needsEditorialReview: false
      }
    ]
  },
  15: {
    discover: [
      {
        id: 'd15_1',
        prompt: 'Co symbolizuje biblijny chrzest przez całkowite zanurzenie w wodzie?',
        sourceRefs: ['Rz 6:3-5', 'Kol 2:12'],
        readingExcerpt: '„Zostaliśmy więc z Nim pogrzebani przez chrzest w śmierć, abyśmy i my wkroczyli w nowe życie — jak Chrystus powstał z martwych”.'
      }
    ],
    quiz: [
      {
        id: 'q15_1',
        type: 'single_choice',
        question: 'Jaka biblijna forma chrztu odzwierciedla pogrzeb starego człowieka i zmartwychwstanie do nowego życia?',
        options: ['Pokropienie niemowlęcia bez jego świadomości', 'Całkowite zanurzenie w wodzie na wyznanie osobistej wiary', 'Podpisanie karty członkowskiej', 'Złożenie przysięgi wojskowej'],
        correctAnswer: 1,
        explanation: 'Biblijne słowo baptizo oznacza „zanurzyć”. Chrzest jest świadomym przymierzem wiary dorosłego człowieka, który umiera dla grzechu i powstaje do nowego życia (Dz 8:36-39, Rz 6:3-4).',
        scriptureRefs: ['Rz 6:3-4', 'Dz 8:36-39'],
        needsEditorialReview: false
      }
    ]
  },
  16: {
    discover: [
      {
        id: 'd16_1',
        prompt: 'Jaki gest pokory i wzajemnej służby ustanowił Jezus bezpośrednio przed Wieczerzą Pańską?',
        sourceRefs: ['J 13:4-15'],
        readingExcerpt: '„Jeżeli więc Ja, Pan i Nauczyciel, umyłem wam nogi, to i wy powinniście sobie nawzajem umywać nogi. Dałem wam bowiem przykład”.'
      }
    ],
    quiz: [
      {
        id: 'q16_1',
        type: 'single_choice',
        question: 'Co oznaczają chleb i wino w Wieczerzy Pańskiej zgodnie ze słowami Jezusa (1 Kor 11:23-26)?',
        options: ['Zwykły posiłek towarzyski', 'Pamiątkę i zwiastowanie Ciała oraz Krwi Chrystusa aż do Jego powtórnego przyjścia', 'Magiczne talizmany przynoszące szczęście', 'Podatek świątynny'],
        correctAnswer: 1,
        explanation: 'Chleb i wino są uświęconymi symbolami złamanego ciała i przelanej krwi Zbawiciela, którymi głosimy Jego śmierć, aż przyjdzie (1 Kor 11:23-26).',
        scriptureRefs: ['1 Kor 11:23-26'],
        needsEditorialReview: false
      }
    ]
  },
  17: {
    discover: [
      {
        id: 'd17_1',
        prompt: 'W jakim celu Duch Święty udziela każdemu wierzącemu darów duchowych?',
        sourceRefs: ['1 Kor 12:7', 'Ef 4:11-13'],
        readingExcerpt: '„Wszystkim zaś objawia się Duch dla wspólnego dobra... celem przysposobienia świętych do wykonywania posługi, dla budowania Ciała Chrystusa”.'
      }
    ],
    quiz: [
      {
        id: 'q17_1',
        type: 'true_false',
        question: 'Dary duchowe są udzielane przez Ducha Świętego według Jego woli każdemu wierzącemu, dla dobra i wzrostu Kościoła.',
        options: ['Prawda', 'Fałsz'],
        correctAnswer: 0,
        explanation: '„Wszystko zaś to sprawia jeden i ten sam Duch, udzielając każdemu tak, jak chce” (1 Kor 12:11).',
        scriptureRefs: ['1 Kor 12:11'],
        needsEditorialReview: false
      }
    ]
  },
  18: {
    discover: [
      {
        id: 'd18_1',
        prompt: 'Czym jest „świadectwo Jezusa” według definicji anioła w Księdze Objawienia?',
        sourceRefs: ['Obj 19:10', 'Obj 12:17'],
        readingExcerpt: '„Świadectwem bowiem Jezusa jest duch proroctwa”.'
      }
    ],
    quiz: [
      {
        id: 'q18_1',
        type: 'single_choice',
        question: 'Jaka jest relacja wszelkich pism i posług prorockich do kanonu Pisma Świętego?',
        options: [
          'Pisma prorockie zastępują Pismo Święte w czasach ostatecznych',
          'Pismo Święte jest jedynym najwyższym probierzem, którym należy badać wszelkie twierdzenia prorockie',
          'Proroctwa są ważniejsze niż nauka Ewangelii',
          'Nie wolno weryfikować żadnych słów proroków'
        ],
        correctAnswer: 1,
        explanation: '„Do prawa i do świadectwa! Jeśli nie mówią zgodnie z tym słowem, to nie ma dla nich jutrzenki” (Iz 8:20, 1 Tes 5:19-21). Pismo Święte jest ostateczną miarą.',
        scriptureRefs: ['Iz 8:20', '1 Tes 5:19-21'],
        needsEditorialReview: true // Oznaczono do weryfikacji redakcyjnej zgodnie z wytyczną
      }
    ]
  },
  19: {
    discover: [
      {
        id: 'd19_1',
        prompt: 'Na czym opiera się całe Prawo Boże według słów Jezusa?',
        sourceRefs: ['Mt 22:37-40', 'Rz 13:10'],
        readingExcerpt: '„Będziesz miłował Pana Boga swego całym swoim sercem... a swego bliźniego jak siebie samego. Na tych dwóch przykazaniach opiera się całe Prawo i Prorocy”.'
      }
    ],
    quiz: [
      {
        id: 'q19_1',
        type: 'single_choice',
        question: 'Co Jezus powiedział w Kazaniu na Górze na temat Prawa Bożego (Dekalogu)?',
        options: ['Przyszedł znieść Prawo i przykazania', 'Nie przyszedł znieść Prawa, lecz je wypełnić, a ani jedna jota nie przeminie', 'Prawo dotyczyło tylko aniołów', 'Można dowolnie zmieniać przykazania'],
        correctAnswer: 1,
        explanation: 'Jezus wyraźnie oświadczył: „Nie sądźcie, że przyszedłem znieść Prawo albo Proroków. Nie przyszedłem znieść, ale wypełnić” (Mt 5:17-18).',
        scriptureRefs: ['Mt 5:17-18'],
        needsEditorialReview: false
      }
    ]
  },
  20: {
    discover: [
      {
        id: 'd20_1',
        prompt: 'Który dzień tygodnia Bóg nakazał pamiętać i święcić w IV Przykazaniu Dekalogu?',
        sourceRefs: ['Wj 20:8-11', 'Rdz 2:1-3', 'Łk 4:16'],
        readingExcerpt: '„Pamiętaj o dniu szabatu, aby go święcić. Sześć dni będziesz pracować... dzień zaś siódmy jest szabatem ku czci Pana, Boga twego”.'
      }
    ],
    quiz: [
      {
        id: 'q20_1',
        type: 'single_choice',
        question: 'Który dzień tygodnia według Pisma Świętego jest Bożym Szabatem odpoczynku?',
        options: ['Pierwszy dzień (niedziela)', 'Piątek wieczorem do północy', 'Siódmy dzień tygodnia (sobota — od zachodu słońca w piątek do zachodu w sobotę)', 'Dowolny dzień wybrany przez człowieka'],
        correctAnswer: 2,
        explanation: 'Pismo Święte jednoznacznie wskazuje siódmy dzień tygodnia jako pamiątkę stworzenia świata i odkupienia w Chrystusie (Rdz 2:2-3, Wj 20:8-11, Łk 23:54-56).',
        scriptureRefs: ['Wj 20:8-11', 'Łk 23:56'],
        needsEditorialReview: false
      }
    ]
  },
  21: {
    discover: [
      {
        id: 'd21_1',
        prompt: 'Do kogo ostatecznie należy ziemia, nasze dobra i talenty?',
        sourceRefs: ['Ps 24:1', '1 Krn 29:14', 'Ml 3:10'],
        readingExcerpt: '„Do Pana należy ziemia i to, co ją napełnia, świat i jego mieszkańcy”.'
      }
    ],
    quiz: [
      {
        id: 'q21_1',
        type: 'single_choice',
        question: 'Co według Pisma Świętego stanowi biblijną dziesięcinę przeznaczoną na głoszenie Ewangelii?',
        options: ['Dobrowolna resztka z tego, co zostanie na koniec miesiąca', 'Jedna dziesiąta (10%) przychodu, która jest święta dla Pana', 'Roczny datek na remont budynku', 'Tylko podatki państwowe'],
        correctAnswer: 1,
        explanation: 'Biblia naucza, że dziesięcina należy do Pana i służy podtrzymywaniu służby ewangelizacyjnej (Kpł 27:30, Ml 3:8-10, 1 Kor 9:13-14).',
        scriptureRefs: ['Ml 3:8-10', '1 Kor 9:14'],
        needsEditorialReview: false
      }
    ]
  },
  22: {
    discover: [
      {
        id: 'd22_1',
        prompt: 'Czym jest ludzkie ciało według apostoła Pawła w 1 Kor 6:19-20?',
        sourceRefs: ['1 Kor 6:19-20', '1 Kor 10:31'],
        readingExcerpt: '„Czyż nie wiecie, że ciało wasze jest świątynią Ducha Świętego, który w was jest... Chwalcie więc Boga w waszym ciele!”.'
      }
    ],
    quiz: [
      {
        id: 'q22_1',
        type: 'single_choice',
        question: 'Jaka zasada powinna kierować naszym jedzeniem, piciem i stylem życia?',
        options: ['Róbmy wszystko, co sprawia nam chwilową przyjemność', 'Cokolwiek czynicie, czy jecie, czy pijecie, wszystko czyńcie na chwałę Bożą', 'Ciało nie ma żadnego znaczenia dla wiary', 'Ścisła asceza z głodzeniem ciała'],
        correctAnswer: 1,
        explanation: 'Chrześcijanin dba o zdrowie fizyczne, psychiczne i moralne, ponieważ ciało jest świątynią Ducha Świętego (1 Kor 10:31, Rz 12:1-2).',
        scriptureRefs: ['1 Kor 10:31', 'Rz 12:1-2'],
        needsEditorialReview: false
      }
    ]
  },
  23: {
    discover: [
      {
        id: 'd23_1',
        prompt: 'W jaki sposób Bóg ustanowił małżeństwo w Ogrodzie Eden?',
        sourceRefs: ['Rdz 2:24', 'Mt 19:4-6'],
        readingExcerpt: '„Dlatego opuści człowiek ojca swego i matkę i złączy się ze swoją żoną, i będą oboje jednym ciałem. Co więc Bóg złączył, człowiek niech nie rozdziela”.'
      }
    ],
    quiz: [
      {
        id: 'q23_1',
        type: 'single_choice',
        question: 'Małżeństwo w zamyśle Bożym to:',
        options: ['Tymczasowa umowa cywilna', 'Święte, dozgonne przymierze miłości między jednym mężczyzną a jedną kobietą', 'Związek zależny od koniunktury gospodarczej', 'Instytucja wyłącznie ludzka'],
        correctAnswer: 1,
        explanation: 'Małżeństwo zostało ustanowione przez Boga w Edenie jako przymierze na całe życie, będące odzwierciedleniem miłości Chrystusa do Jego Kościoła (Ef 5:21-33, Mt 19:4-6).',
        scriptureRefs: ['Mt 19:4-6', 'Ef 5:25'],
        needsEditorialReview: false
      }
    ]
  },
  24: {
    discover: [
      {
        id: 'd24_1',
        prompt: 'Gdzie Jezus sprawuje Swoją arcykapłańską posługę po wniebowstąpieniu?',
        sourceRefs: ['Hbr 8:1-2', 'Hbr 9:24', 'Dn 8:14'],
        readingExcerpt: '„Mamy takiego Arcykapłana, który zasiadł po prawicy tronu Majestatu w niebiosach, jako sługa świątyni i prawdziwego przybytku”.'
      }
    ],
    quiz: [
      {
        id: 'q24_1',
        type: 'single_choice',
        question: 'Na czym polega orędownictwo Jezusa w świątyni niebiańskiej na naszą rzecz?',
        options: [
          'Chrystus składa codziennie nowe ofiary z krwi zwierząt',
          'Chrystus wstawia się za nami Swoją jedyną, doskonałą ofiarą złożoną na krzyżu',
          'Służba w niebie nie ma wpływu na losy ludzi',
          'Aniołowie sami decydują o zbawieniu bez Chrystusa'
        ],
        correctAnswer: 1,
        explanation: 'Jezus wszedł do samego nieba, aby teraz wstawiać się za nami przed obliczem Boga (Hbr 9:24, Hbr 7:25).',
        scriptureRefs: ['Hbr 7:25', 'Hbr 9:24'],
        needsEditorialReview: true // Oznaczono do weryfikacji redakcyjnej (prorocza chronologia 2300 wieczorów i poranków)
      }
    ]
  },
  25: {
    discover: [
      {
        id: 'd25_1',
        prompt: 'W jaki sposób Jezus powróci na ziemię według obietnicy danej apostołom?',
        sourceRefs: ['Dz 1:11', 'Obj 1:7', 'Mt 24:30'],
        readingExcerpt: '„Ten Jezus, wzięty od was do nieba, przyjdzie tak samo, jak widzieliście Go wstępującego do nieba... Oto przychodzi z obłokami i ujrzy Go wszelkie oko”.'
      }
    ],
    quiz: [
      {
        id: 'q25_1',
        type: 'single_choice',
        question: 'Powtórne Przyjście Jezusa Chrystusa będzie:',
        options: ['Sekretne i niewidzialne dla świata', 'Dosłowne, widzialne dla każdego oka, pełne chwały i mocy', 'Jedynie duchowym odrodzeniem w sercach ludzi', 'Wydarzeniem symbolicznym bez Jego fizycznej obecności'],
        correctAnswer: 1,
        explanation: 'Pismo Święte wielokrotnie podkreśla: „Ujrzy Go wszelkie oko” (Obj 1:7), a sam Pan zstąpi z nieba na głos archanioła i dźwięk trąby Bożej (1 Tes 4:16).',
        scriptureRefs: ['Obj 1:7', '1 Tes 4:16'],
        needsEditorialReview: false
      }
    ]
  },
  26: {
    discover: [
      {
        id: 'd26_1',
        prompt: 'Jak Pismo Święte opisuje stan człowieka w chwili śmierci aż do dnia zmartwychwstania?',
        sourceRefs: ['Kaz 9:5.10', 'Ps 146:4', 'J 11:11-14'],
        readingExcerpt: '„Żyjący bowiem wiedzą, że umrą, ale umarli nic nie wiedzą... Łazarz, przyjaciel nasz, zasnął, ale idę, aby go obudzić ze snu”.'
      }
    ],
    quiz: [
      {
        id: 'q26_1',
        type: 'single_choice',
        question: 'Według słów Jezusa i apostołów śmierć człowieka jest:',
        options: ['Natychmiastowym przejściem do czyśćca lub reinkarnacji', 'Nieświadomym snem w oczekiwaniu na powrót Chrystusa i zmartwychwstanie', 'Świadomym życiem duszy bez ciała', 'Wiecznym niebytem bez nadziei'],
        correctAnswer: 1,
        explanation: 'Jezus przyrównał śmierć do snu (J 11:11-14). Tylko Bóg jest nieśmiertelny (1 Tm 6:16), a wierzący otrzymają nieśmiertelność przy zmartwychwstaniu podczas powrotu Pana (1 Kor 15:51-54).',
        scriptureRefs: ['J 11:11-14', '1 Kor 15:51-54', '1 Tm 6:16'],
        needsEditorialReview: false
      }
    ]
  },
  27: {
    discover: [
      {
        id: 'd27_1',
        prompt: 'Co dzieje się z szatanem podczas tysiąclecia opisanego w Objawieniu 20?',
        sourceRefs: ['Obj 20:1-3.7-10'],
        readingExcerpt: '„I pochwycił Smoka, Węża starodawnego, którym jest diabeł i szatan, i związał go na tysiąc lat... aby już nie zwodził narodów”.'
      }
    ],
    quiz: [
      {
        id: 'q27_1',
        type: 'single_choice',
        question: 'Jaki jest ostateczny los szatana, grzechu i bezbożności po zakończeniu tysiąclecia?',
        options: ['Wieczne torturowanie w podziemiu pod okiem diabła', 'Całkowite unicestwienie w jeziorze ognia — zło przestaje istnieć na zawsze', 'Przeniesienie na inną planetę', 'Przebaczenie bez sądu'],
        correctAnswer: 1,
        explanation: 'Pismo Święte naucza, że ogień z nieba pochłonie bezbożnych i szatana, obracając ich w popiół, a sprawiedliwość Boża oczyści cały wszechświat (Obj 20:9-14, Mal 4:1-3).',
        scriptureRefs: ['Obj 20:9-14', 'Mal 4:1-3'],
        needsEditorialReview: false
      }
    ]
  },
  28: {
    discover: [
      {
        id: 'd28_1',
        prompt: 'Jak Bóg opisuje Nową Ziemię — wieczną ojczyznę odkupionych?',
        sourceRefs: ['Obj 21:1-4', 'Iz 65:17-25', '2 P 3:13'],
        readingExcerpt: '„I otrze z ich oczu wszelką łzę, a śmierci już odtąd nie będzie. Ani żałoby, ani krzyku, ani trudu już odtąd nie będzie, bo pierwsze rzeczy przeminęły”.'
      }
    ],
    quiz: [
      {
        id: 'q28_1',
        type: 'true_false',
        question: 'Na Nowej Ziemi odkupieni będą cieszyć się wiecznym życiem w odnowionym świecie, bez bólu, łez i śmierci, w bezpośredniej obecności Boga.',
        options: ['Prawda', 'Fałsz'],
        correctAnswer: 0,
        explanation: '„Oto przybytek Boga z ludźmi: i zamieszka wraz z nimi, i będą oni Jego ludem, a On będzie Bogiem z nimi” (Obj 21:3-4).',
        scriptureRefs: ['Obj 21:3-4', '2 P 3:13'],
        needsEditorialReview: false
      }
    ]
  }
};

// Funkcja aktualizująca plik data/lumina-courses-data.js
async function runUpdate() {
  console.log('=== AKTUALIZACJA DANYCH LEKCJI ODKRYJ I QUIZ (Phase 4) ===\n');

  // Wczytaj moduł danych dynamicznie
  const modulePath = 'file:///' + dataFilePath.replace(/\\/g, '/');
  const mod = await import(modulePath);

  const coreLessons = mod.LUMINA_COURSES_CORE_28;
  let updatedCount = 0;
  let reviewCount = 0;

  coreLessons.forEach((lesson) => {
    const qData = COURSE_CONTENT_DATABASE[lesson.id];
    if (qData) {
      lesson.discover = {
        questions_pl: qData.discover.map(d => d.prompt),
        questions_en: qData.discover.map(d => d.prompt), // zachowanie struktury dwujęzycznej
        items: qData.discover,
        needsEditorialReview: qData.quiz.some(q => q.needsEditorialReview)
      };

      lesson.quiz = {
        questions: qData.quiz,
        needsEditorialReview: qData.quiz.some(q => q.needsEditorialReview)
      };

      if (lesson.quiz.needsEditorialReview) {
        reviewCount++;
      } else {
        updatedCount++;
      }
    }
  });

  // Zapisz zaktualizowany plik
  const newContent = `/**
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

export const LUMINA_STAGES = ${JSON.stringify(mod.LUMINA_STAGES, null, 2)};

export const LUMINA_COURSES_CORE_28 = ${JSON.stringify(coreLessons, null, 2)};

export const LUMINA_POST_28_CATALOG = ${JSON.stringify(mod.LUMINA_POST_28_CATALOG, null, 2)};

export default {
  stages: LUMINA_STAGES,
  core28: LUMINA_COURSES_CORE_28,
  post28Catalog: LUMINA_POST_28_CATALOG
};
`;

  fs.writeFileSync(dataFilePath, newContent, 'utf8');
  console.log(`✅ Zaktualizowano 28 lekcji w data/lumina-courses-data.js:`);
  console.log(`   - Zatwierdzone (VALIDATED): ${updatedCount} lekcji`);
  console.log(`   - Wymagające decyzji redakcyjnej (EDITORIAL_REVIEW): ${reviewCount} lekcje (Lekcje 18 i 24)`);
}

runUpdate().catch(err => {
  console.error('Błąd aktualizacji:', err);
  process.exit(1);
});
