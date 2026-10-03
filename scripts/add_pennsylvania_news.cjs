const fs = require('fs');
const path = require('path');

const NEWS_SRC = path.resolve('C:/Users/czark/.gemini/antigravity/brain/6171dbb4-faed-472d-ab3b-0ab4afdc2e53/scratch/news_src');
const ARTICLES_PATH = path.join(NEWS_SRC, 'src/data/articles.ts');
const PORTALS_DATA_PATH = path.resolve(__dirname, 'portals_data.cjs');

console.log('=== DODAWANIE RAPORTU O PENSYLWANII DO WIADOMOŚCI CCN NEWS I PORTALI ===');

// 1. Aktualizacja articles.ts w news_src
let articlesContent = fs.readFileSync(ARTICLES_PATH, 'utf8');

const NEW_TICKER_ITEM = "'USA: Raport Wielkiej Ławy w Pensylwanii ujawnia ponad 300 duchownych i systemowe tuszowanie przestępstw',";

if (!articlesContent.includes('news-pennsylvania-grand-jury-report-20261003')) {
  // Dodaj do BREAKING_NEWS
  if (articlesContent.includes('export const BREAKING_NEWS: string[] = [')) {
    articlesContent = articlesContent.replace(
      'export const BREAKING_NEWS: string[] = [',
      `export const BREAKING_NEWS: string[] = [\n  ${NEW_TICKER_ITEM}`
    );
  }

  const ARTICLE_CODE = `  {
    id: "news-pennsylvania-grand-jury-report-20261003",
    title: "Raport Wielkiej Ławy Przysięgłych w Pensylwanii: Ponad 300 księży i 1000 ofiar. Anatomia systemowego tuszowania w świetle Biblii",
    slug: "raport-wielkiej-lawy-pensylwania-ponad-300-ksiezy-1000-ofiar-tuszowanie",
    category: "swiat",
    categoryLabel: "ŚWIAT · RAPORT ŚLEDCZY & PRAWO",
    excerpt: "Ponad 1350 stron dowodów, ponad 300 zidentyfikowanych duchownych i co najmniej tysiąc dziecięcych ofiar. Ujawniony przez prokuraturę generalną Pensylwanii raport obnażył dekady tuszowania przestępstw seksualnych przez hierarchię kościelną. Jak Boże prawo nakazuje bezwzględną obronę bezbronnych i odrzuca fałszywy immunitet instytucji.",
    content: [
      "Przełomowy, liczący 1356 stron raport Wielkiej Ławy Przysięgłych (Grand Jury) stanu Pensylwania, przygotowany pod przewodnictwem prokuratora generalnego Josha Shapiro, odsłonił jeden z największych i najbardziej wstrząsających kryzysów instytucjonalnych w nowożytnej historii chrześcijaństwa. Śledczy, po przeanalizowaniu ponad pół miliona stron tajnych archiwów z sześciu rzymskokatolickich diecezji (Allentown, Erie, Greensburg, Harrisburg, Pittsburgh oraz Scranton), zidentyfikowali ponad 300 księży drapieżców seksualnych oraz udokumentowali krzywdę ponad tysiąca dzieci w okresie siedmiu dekad.",
      "Ustalenia śledztwa wskazują, że rzeczywista liczba ofiar jest znacznie wyższa i sięga dziesiątek tysięcy, ponieważ wiele akt zniszczono, a zastraszone ofiary przez lata milczały. Raport ujawnił powtarzalny, wyrafinowany mechanizm instytucjonalnego tuszowania przestępstw: biskupi i kardynałowie, zamiast niezwłocznie zawiadomić organy ścigania i chronić dzieci, systemowo przenosili zidentyfikowanych sprawców z parafii do parafii, opłacali milczenie rodzin klauzulami poufności (NDAs), a raporty ofiar ukrywali w tajnych sejfach diecezjalnych pod pozorem 'ochrony dobrego imienia Kościoła'.",
      "Wymiar Prawny i Żądanie Sprawiedliwości: Raport wywołał ogólnoświatową debatę na temat odpowiedzialności karnej hierarchów oraz natychmiastowego zniesienia przedawnienia roszczeń cywilnych i karnych dla zbrodni przeciwko dzieciom. Prokuratura podkreśliła, że korporacyjna lojalność hierarchii stanęła wyżej niż ludzkie sumienie i elementarne normy prawa karnego.",
      "Biblijny Osąd: Chrystus a Fałszywy Immunitet. Pismo Święte nie pozostawia cienia wątpliwości co do Bożej oceny krzywdzenia najmłodszych i bezbronnych. Pan Jezus wypowiedział najbardziej kategoryczne ostrzeżenie w całej Ewangelii: 'Kto by zgorszył jednego z tych maluczkich, którzy we mnie wierzą, lepiej by mu było, aby zawieszono kamień młyński u szyi jego i utopiono go w głębokości morskiej' (Mt 18:6). W prawie Mojżeszowym oraz w nauczaniu apostolskim nie istnieje pojęcie immunitetu dla duchownych ukrywających przestępstwo. Wręcz przeciwnie — apostoł Paweł bezkompromisowo nakazuje: 'I nie miejcie społeczności z bezowocnymi uczynkami ciemności, ale je raczej karćcie... Wszystko zaś, co jest ganione, od światła bywa jawne' (Ef 5:11-13).",
      "Wnioski Redakcyjne CCN News: Prawdziwa wierność Ewangelii wymaga bezwzględnej prawdy, jawności i stanięcia po stronie ofiar. Instytucjonalna hipokryzja, która kazała stawiać prestiż organizacji ponad ochronę bezbronnych dzieci, jest jaskrawym zaprzeczeniem Chrystusowego krzyża. Kościół Chrystusowy nie buduje się na kłamstwie, zatajaniu grzechu i tajnych archiwach, lecz na prawdzie, pokucie i bezkompromisowej sprawiedliwości Bożej."
    ],
    publishedAt: "2026-10-03",
    dateFormatted: "3 października 2026",
    imageUrl: "https://i.ytimg.com/vi/T0NjiajqqRY/hqdefault.jpg",
    imageCaption: "Raport Wielkiej Ławy Przysięgłych w Pensylwanii: Ponad 300 księży i systemowe tuszowanie przestępstw seksualnych (NBC News / Grand Jury Report)",
    readTimeMinutes: 7,
    isHero: false,
    isPopular: true,
    popularRank: 2,
    youtubeVideoId: "T0NjiajqqRY",
    videoUrl: "https://youtu.be/T0NjiajqqRY",
    tags: [
      "Świat",
      "Raport Śledczy",
      "Pensylwania",
      "Wielka Ława",
      "Prawo a Biblia",
      "Ochrona Dzieci",
      "Prawda i Sprawiedliwość",
      "Cezary Rogowski"
    ],
    author: AUTHORS.cezary,
    scriptureReference: {
      verse: "Ewangelia wg św. Mateusza 18:6",
      text: "Lecz kto by zgorszył jednego z tych maluczkich, którzy we mnie wierzą, lepiej by mu było, aby zawieszono kamień młyński u szyi jego i utopiono go w głębokości morskiej.",
      strongCode: "G4624 (skandalizo - zwieść, wyrządzić krzywdę moralną, doprowadzić do upadku)"
    },
    sourceCitation: {
      sourceName: "The Guardian / Pennsylvania Attorney General Grand Jury Report",
      sourceUrl: "https://www.theguardian.com/us-news/2018/aug/14/more-than-300-pennsylvania-priests-committed-sexual-abuse-over-decades",
      quotationDate: "Raport Wielkiej Ławy Przysięgłych (Grand Jury)",
      originalTitle: "More than 300 Pennsylvania priests abused 1,000 children over decades, report says"
    },
    biblicalCommentary: {
      thesis: "Komentarz teologiczno-prawny: Ewangelia nie uznaje immunitetu dla grzechu i hipokryzji. Prawda Boża nakazuje bezwzględną ochronę dzieci i bezkompromisową jawność.",
      verses: [
        {
          ref: "Ef 5:11-13",
          text: "I nie miejcie społeczności z bezowocnymi uczynkami ciemności, ale je raczej karćcie. O tym bowiem, co się u nich po kryjomu dzieje, wstyd nawet mówić. Wszystko zaś, co jest ganione, od światła bywa jawne."
        },
        {
          ref: "Łk 12:2-3",
          text: "Nie ma bowiem nic ukrytego, co by nie miało być odkryte, ani nic tajemnego, co by nie miało być poznane."
        }
      ],
      explanation: "Chrześcijaństwo biblijne odrzuca jakąkolwiek formę korporacyjnego zatajania zbrodni pod pozorem ochrony autorytetu Kościoła. Chrystus jednoznacznie staje w obronie skrzywdzonych i żąda sprawiedliwości. Zatajanie przestępstwa przez hierarchię jest w oczach Bożych współudziałem w złu."
    },
    resourceLinks: [
      {
        label: "Raport The Guardian: More than 300 Pennsylvania priests",
        url: "https://www.theguardian.com/us-news/2018/aug/14/more-than-300-pennsylvania-priests-committed-sexual-abuse-over-decades"
      },
      {
        label: "Wideo NBC Nightly News (YouTube): Raport Grand Jury",
        url: "https://youtu.be/T0NjiajqqRY"
      }
    ]
  },`;

  articlesContent = articlesContent.replace(
    'export const INITIAL_ARTICLES: Article[] = [',
    `export const INITIAL_ARTICLES: Article[] = [\n${ARTICLE_CODE}`
  );

  fs.writeFileSync(ARTICLES_PATH, articlesContent, 'utf8');
  console.log('✓ Dodano raport o Pensylwanii do articles.ts w news_src');
}

// 2. Dodanie artykułu do portalu 'prawo' i 'seks' w portals_data.cjs
let portalsDataContent = fs.readFileSync(PORTALS_DATA_PATH, 'utf8');

const PORTAL_ARTICLE_CODE = `      {
        id: 'art-pensylwania-grand-jury-prawo-i-moralnosc',
        title: 'Raport z Pensylwanii: Ponad 300 księży i 1000 ofiar. Anatomia systemowego tuszowania w świetle Prawa Bożego i cywilnego',
        slug: 'raport-pensylwania-ponad-300-ksiezy-systemowe-tuszowanie-prawo-boze',
        excerpt: '1356 stron raportu Wielkiej Ławy Przysięgłych i analiza tajnych archiwów diecezjalnych. Dlaczego Boże prawo wyklucza immunitet instytucjonalny i nakazuje bezwzględną ochronę dzieci oraz pełną odpowiedzialność karną sprawców i ich mocodawców.',
        category: 'prawo',
        categoryLabel: 'PRAWO BOŻE A PRAWO KARNE',
        publishedAt: '2026-10-03T12:00:00Z',
        dateFormatted: '3 października 2026',
        imageUrl: 'https://i.ytimg.com/vi/T0NjiajqqRY/hqdefault.jpg',
        imageCaption: 'Śledztwo prokuratury w Pensylwanii: Tuszowanie zbrodni w świetle prawa karnego i moralności biblijnej.',
        readTimeMinutes: 7,
        isHero: false,
        isPopular: true,
        popularRank: 2,
        youtubeVideoId: 'T0NjiajqqRY',
        videoUrl: 'https://youtu.be/T0NjiajqqRY',
        tags: ['Pensylwania', 'Grand Jury', 'Prawo Boże', 'Sprawiedliwość', 'Ochrona Dzieci', 'Wideo', 'Cezary Rogowski'],
        author: {
          id: 'cezary-rogowski',
          name: 'Cezary Rogowski',
          role: 'Założyciel Christian Culture',
          avatarUrl: '/avatar_cezary_official.jpg'
        },
        scriptureReference: {
          verse: 'Ewangelia wg św. Mateusza 18:6',
          text: 'Lecz kto by zgorszył jednego z tych maluczkich, którzy we mnie wierzą, lepiej by mu było, aby zawieszono kamień młyński u szyi jego i utopiono go w głębokości morskiej.',
          strongCode: 'G4624 (skandalizo - zwieść, wyrządzić krzywdę)'
        },
        sourceCitation: {
          sourceName: 'The Guardian / Pennsylvania Attorney General Grand Jury Report',
          sourceUrl: 'https://www.theguardian.com/us-news/2018/aug/14/more-than-300-pennsylvania-priests-committed-sexual-abuse-over-decades',
          quotationDate: 'Raport Wielkiej Ławy Przysięgłych',
          originalTitle: 'More than 300 Pennsylvania priests abused 1,000 children over decades, report says'
        },
        content: [
          'Opublikowany przez Sąd Najwyższy Pensylwanii i prokuraturę generalną 1356-stronicowy raport Wielkiej Ławy Przysięgłych (Grand Jury) stanowi wstrząsający dokument zbrodni oraz ich instytucjonalnego tuszowania w sześciu diecezjach rzymskokatolickich w okresie siedmiu dekad.',
          'Ustalenia prokuratury opierają się na wnikliwym zbadaniu ponad pół miliona stron tajnych dokumentów diecezjalnych. Wynika z nich bezspornie, że biskupi posiadali pełną wiedzę o dewiacjach i gwałtach na dzieciach, jednak zamiast zgłaszać sprawy na policję, przenosili sprawców do nowych parafii, opłacali milczenie ofiar i prowadzili tajne kartoteki.',
          'W świetle biblijnego prawa nie istnieje żaden immunitet religijny chroniący sprawców przemocy. Jezus Chrystus w Ewangelii wg św. Mateusza (18:6) wypowiedział jedno z najsurowszych ostrzeżeń w całym Piśmie Świętym przeciwko tym, którzy krzywdzą dzieci. Prawo Boże żąda prawdy i jawności (Ef 5:11-13: „Nie miejcie społeczności z bezowocnymi uczynkami ciemności, ale je raczej karćcie”). Prawdziwe chrześcijaństwo jednoznacznie potępia fałszywą korporacyjną solidarność i domaga się sprawiedliwości dla skrzywdzonych.'
        ]
      },`;

if (!portalsDataContent.includes('art-pensylwania-grand-jury-prawo-i-moralnosc')) {
  // Wstawiamy pod id: 'prawo', articles: [
  const pravoIndex = portalsDataContent.indexOf("id: 'prawo'");
  if (pravoIndex !== -1) {
    const articlesIndex = portalsDataContent.indexOf("articles: [", pravoIndex);
    if (articlesIndex !== -1) {
      const insertPos = articlesIndex + "articles: [".length;
      portalsDataContent = portalsDataContent.slice(0, insertPos) + '\n' + PORTAL_ARTICLE_CODE + portalsDataContent.slice(insertPos);
      fs.writeFileSync(PORTALS_DATA_PATH, portalsDataContent, 'utf8');
      console.log('✓ Dodano raport o Pensylwanii do portalu PRAWO w portals_data.cjs');
    }
  }
}

console.log('=== ZAKOŃCZONO DODAWANIE MATERIAŁÓW DO BAZY ===');
