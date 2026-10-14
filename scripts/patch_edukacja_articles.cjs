const fs = require('fs');

const targetPath = 'C:/Users/czark/.gemini/antigravity/brain/6171dbb4-faed-472d-ab3b-0ab4afdc2e53/scratch/edukacja_src/src/data/articles.ts';
let content = fs.readFileSync(targetPath, 'utf8');

const newArticles = `  {
    "id": "art-dzieci-halloween-jak-rozmawiac-alternatywa",
    "title": "JAK ROZMAWIAĆ Z DZIEĆMI O HALLOWEEN BEZ STRASZENIA I POCZUCIA ODRZUCENIA? MĄDRE PODEJŚCIE CHRZEŚCIJAŃSKIEGO RODZICA",
    "slug": "jak-rozmawiac-z-dziecmi-o-halloween-bez-straszenia-i-odrzucenia-poradnik-mamy",
    "excerpt": "Gdy całe przedszkole i szkoła ozdabiane są pajęczynami i szkieletami, dziecko pyta: „Mamo, dlaczego my tego nie robimy?”. Praktyczny poradnik dla rodziców: jak rozmawiać z miłością, bez potępiania innych, i jak zorganizować radosne Święto Światła.",
    "category": "dzieci",
    "categoryLabel": "CCN DZIECI · WYCHOWANIE W WIERZE",
    "publishedAt": "2026-10-14T06:00:00Z",
    "dateFormatted": "14 października 2026",
    "imageUrl": "/images/news/art-dzieci-halloween-jak-rozmawiac-alternatywa.jpg",
    "imageCaption": "Ilustracja AI: Ciepła, rodzinna kuchnia — mama z dziećmi wspólnie pieką domowe ciasteczka w kształcie serduszek i gwiazdek w atmosferze miłości i radości.",
    "readTimeMinutes": 7,
    "isHero": true,
    "isPopular": true,
    "popularRank": 1,
    "tags": ["Dzieci", "Wychowanie", "Halloween", "Rodzice", "Święto Światła", "Holy Wins", "Wioletta Rogowska", "Edukacja Domowa"],
    "author": {
      "id": "wioletta-rogowska",
      "name": "Wioletta Rogowska",
      "role": "Współzałożycielka Christian Culture",
      "avatarUrl": "/avatar_wioletta_official.jpg"
    },
    "scriptureReference": {
      "verse": "Księga Przysłów 22:6",
      "text": "Wychowuj dziecko w drodze, którą ma iść, a nie zboczy z niej nawet w starości.",
      "strongCode": "G3809 (paideia - wychowanie w miłości i prawdzie)"
    },
    "content": [
      "Koniec października to dla wielu chrześcijańskich mam i ojców moment niełatwych dylematów. Ze szkoły czy przedszkola dziecko przynosi pytania: „Dlaczego Jaś przebiera się za wampira, a ja nie?”, „Czy ja też mogę iść zbierać cukierki?”. Sposób, w jaki rodzic odpowie na to pytanie, może zaważyć na tym, jak dziecko będzie postrzegało wiarę: czy jako nudny zbiór surowych zakazów, czy jako fascynującą przygodę życia w Bożej miłości.",
      "1. Dziecięca percepcja: nie strasz, lecz tłumacz. Dzieci do pewnego wieku nie posiadają jeszcze w pełni rozwiniętego myślenia abstrakcyjnego. Widok potworów, grobów i kościotrupów budzi w nich realny, podświadomy lęk, nawet gdy dorośli nazywają to „zabawą”. Najgorsze, co może zrobić rodzic, to zacząć opowiadać dziecku przerażające historie o demonach czy piekle. Zamiast tego powiedzmy prosto: „W naszej rodzinie bardzo kochamy Pana Jezusa. Jezus uczy nas cieszyć się światłem, życiem i dobrem. Dlatego nie chcemy bawić się w straszenie ani w śmierć, bo mamy o wiele piękniejsze powody do radości”.",
      "2. Ucz szacunku bez poczucia wyższości. Ważne jest, aby dziecko nie stało się małym faryzeuszem, który w szkole wytyka palcami kolegów: „Wy idziecie do piekła, bo macie dynię”. Uczmy dzieci szacunku: „Inne rodziny mogą mieć inne zwyczaje, my ich nie osądzamy i jesteśmy dla nich mili. Ale w naszym domu wybieramy to, co niesie pokój i Bożą miłość”. Taka postawa uczy dziecko asertywności i szacunku do innych bez rezygnacji z własnych przekonań.",
      "3. Zbuduj niezapomnianą alternatywę: Święto Światła. Dziecko nie może mieć poczucia, że z powodu wiary coś traci. Niech wieczór 31 października stanie się w waszym domu jednym z najbardziej wyczekiwanych dni w roku! Upieczcie wspólnie pachnące cynamonem ciasteczka w kształcie gwiazdek i serduszek, zapalcie ciepłe lampiony, przygotujcie koszyczki ze słodyczami i kartkami z wersetami dla sąsiadów, zorganizujcie rodzinny quiz z nagrodami o wielkich bohaterach Biblii (Dawidzie, Esterze, Danielu). Gdy dziecko doświadczy obfitości domowego ciepła, sztuczny plastikowy mrok przestanie mieć dla niego jakąkolwiek atrakcyjność!"
    ]
  },
  {
    "id": "art-rodzina-chrzescijanski-dom-twierdza-pokoju",
    "title": "CHRZEŚCIJAŃSKI DOM JAKO TWIERDZA POKOJU: BUDOWANIE TRADYCJI ŻYCIA W ŚWIECIE PEŁNYM PRESJI",
    "slug": "chrzescijanski-dom-jako-twierdza-pokoju-budowanie-tradycji-zycia",
    "excerpt": "W świecie, który 31 października promuje zgiełk, upiory i komercję, chrześcijańska rodzina może stać się oazą bezpieczeństwa, ciepła i modlitwy. Odkryj siłę budowania domowych rytuałów zakorzenionych w zmartwychwstaniu Chrystusa.",
    "category": "rodzina",
    "categoryLabel": "CCN RODZINA · MAŁŻEŃSTWO I DOM",
    "publishedAt": "2026-10-14T06:00:00Z",
    "dateFormatted": "14 października 2026",
    "imageUrl": "/images/news/art-rodzina-chrzescijanski-dom-twierdza-pokoju.jpg",
    "imageCaption": "Ilustracja AI: Rodzina zebrana przy kominku o zmierzchu — wspólna lektura Biblii, poczucie bezpieczeństwa i ciepło domowego ogniska.",
    "readTimeMinutes": 7,
    "isHero": false,
    "isPopular": true,
    "popularRank": 2,
    "tags": ["Rodzina", "Dom", "Tradycja", "Pokój", "Małżeństwo", "Halloween", "Wioletta Rogowska", "Christian Culture"],
    "author": {
      "id": "wioletta-rogowska",
      "name": "Wioletta Rogowska",
      "role": "Współzałożycielka Christian Culture",
      "avatarUrl": "/avatar_wioletta_official.jpg"
    },
    "scriptureReference": {
      "verse": "Księga Jozuego 24:15",
      "text": "Ja i mój dom będziemy służyć PANU.",
      "strongCode": "H1004 (bayit - domostwo, przymierze)"
    },
    "content": [
      "Współczesna rodzina funkcjonuje pod bezprecedensową presją zewnętrznych bodźców. Każdego dnia przez smartfony, telewizję i media do naszych mieszkań wdzierają się chaos, zgiełk i komercyjna presja. Gdy nadchodzi jesień, przestrzeń publiczna staje się głośna i mroczna. W takim świecie dom chrześcijański musi na nowo stać się tym, czym z Bożego zamysłu był zawsze: twierdzą pokoju, sanktuarium miłości i bezpieczną przystanią dla każdego domownika.",
      "1. Jedność małżonków fundamentem bezpieczeństwa dzieci. Aby rodzina mogła zachować tożsamość w obliczu presji otoczenia, mąż i żona muszą mówić jednym głosem. Kiedy rodzice wspólnie, w spokojnej i dojrzałej rozmowie, ustalają granice i wartości, dzieci czują się bezpiecznie. Nie ma nic bardziej niszczącego niż rozłam, w którym jeden z rodziców wyśmiewa zasady drugiego. Deklaracja Jozuego: „Ja i mój dom będziemy służyć Panu” (Joz 24:15) to owoc dojrzałego, małżeńskiego przymierza opartego na Bożej prawdzie.",
      "2. Domowe rytuały pamięci i nadziei. Początek listopada w naszej tradycji kulturowej to czas wspominania bliskich zmarłych. Jakże pięknie i głęboko może przeżyć ten czas chrześcijańska rodzina! Zamiast udawania, że śmierć to zabawa w potwory, możemy zapalić świece przy rodzinnym stole, wyciągnąć stare albumy fotograficzne i opowiedzieć dzieciom o dziadkach i pradziadkach, którzy wierzyli w Jezusa. Możemy przeczytać 1 List do Tesaloniczan 4:13–18 i przypomnieć, że nasza rozłąka z wierzącymi zmarłymi jest tylko chwilowa, bo Pan powróci i wskrzesi Swoich świętych. To buduje w młodych sercach niezachwianą nadzieję.",
      "3. Otwórzmy drzwi ze światłem. Bycie twierdzą pokoju nie oznacza zamienienia domu w zaryglowaną twierdzę strachu przed światem. Jeśli do waszych drzwi 31 października zapukają sąsiedzkie dzieci, nie gaście świateł i nie udawajcie, że was nie ma. Otwórzcie z promiennym uśmiechem, poczęstujcie pysznymi, najlepszymi słodyczami i powiedzcie: „Życzymy wam pięknego, jasnego i dobrego wieczoru!”. Niech w waszym spojrzeniu zobaczą światło Chrystusa, które przyciąga, a nie odpycha. Zło zwycięża się dobrem!"
    ]
  },
  {
    "id": "art-wychowanie-nastolatki-odwaga-wiary-presja",
    "title": "WYCHOWANIE W ERZE POPKULTUROWEJ PRESJI: KSZTAŁTOWANIE SUMIENIA I ODWAGI U NASTOLATKÓW W KONFRONTACJI Z MODAMI",
    "slug": "wychowanie-w-erze-popkulturowej-presji-ksztaltowanie-sumienia-u-nastolatkow",
    "excerpt": "Dla nastolatka presja grupy rówieśniczej i szkolnych trendów bywa ogromna. Jak ojciec i matka mogą pomóc młodemu człowiekowi zbudować tożsamość opartą na Chrystusie, asertywność wiary i krytyczne myślenie wobec komercyjnych mód?",
    "category": "wychowanie",
    "categoryLabel": "CCN WYCHOWANIE · FORMACJA MŁODEGO POKOLENIA",
    "publishedAt": "2026-10-14T06:00:00Z",
    "dateFormatted": "14 października 2026",
    "imageUrl": "/images/news/art-wychowanie-nastolatki-odwaga-wiary-presja.jpg",
    "imageCaption": "Ilustracja AI: Ojciec rozmawiający z nastoletnim synem na ganku o złotej godzinie zachodu słońca — budowanie męstwa wiary, zaufania i autentycznego przewodnictwa.",
    "readTimeMinutes": 8,
    "isHero": false,
    "isPopular": true,
    "popularRank": 3,
    "tags": ["Wychowanie", "Nastolatki", "Presja Rówieśnicza", "Męstwo Wiary", "Tożsamość", "Ojcostwo", "Cezary Rogowski", "Christian Culture"],
    "author": {
      "id": "cezary-rogowski",
      "name": "Cezary Rogowski",
      "role": "Założyciel Christian Culture",
      "avatarUrl": "/avatar_cezary_official.jpg"
    },
    "scriptureReference": {
      "verse": "Księga Powtórzonego Prawa 6:6–7",
      "text": "Niechże te słowa, które ci dziś nakazuję, będą w twoim sercu; i będziesz je wpajał swoim dzieciom, i będziesz o nich mówił, siedząc w swoim domu, i idąc drogą...",
      "strongCode": "H8150 (shanan - wyostrzać jak miecz, uczyć wnikliwie)"
    },
    "content": [
      "Okres dorastania to dla młodego człowieka czas intensywnego poszukiwania własnej tożsamości. W erze algorytmów TikToka, Instagrama i presji grupy rówieśniczej w klasie, potrzeba akceptacji staje się często silniejsza niż cokolwiek innego. Gdy całe otoczenie nastolatka ekscytuje się imprezami halloweenowymi, mroczną estetyką i creepypastami, zakaz rzucony z pozycji siły („Bo ja ci zabraniam”) wywoła jedynie bunt i poczucie alienacji. Wychowanie młodego człowieka do dojrzałości wymaga zupełnie innego podejścia.",
      "1. Od ślepego zakazu do głębokiego zrozumienia. Nastolatek musi usłyszeć nie tylko „nie”, ale przede wszystkim zrozumieć „dlaczego”. Usiądź ze swoim synem lub córką jak partner do poważnej dyskusji. Porozmawiajcie o mechanizmach komercjalizacji, o tym, jak koncerny zarabiają miliardy na sprzedaży tanich emocji, i o tym, czym różni się kultura życia od kultury fascynacji śmiercią. Kiedy młody człowiek zrozumie, że nieuleganie modzie nie jest zacofaniem, lecz aktem intelektualnej i duchowej niezależności, zyskuje wewnętrzną dumę i siłę.",
      "2. Kształtowanie odwagi cywilnej i asertywności. Prawdziwe męstwo i dojrzałość polegają na tym, że potrafisz stać przy prawdzie, nawet gdy stoisz sam. W Piśmie Świętemu czytamy o trzech młodzieńcach w Babilonie — Szadraku, Meszaku i Abed-Nego — którzy odmówili pokłonu złotemu posągowi, mimo że całe imperium padło na twarz (Dn 3). Byli ludźmi wykształconymi, wpływowymi, a jednak mieli kręgosłup moralny. Powiedz swojemu nastolatkowi: „Nie musisz płynąć z prądem. Płynięcie z prądem jest łatwe tylko dla martwych ryb. Żywy człowiek płynie pod prąd ku źródłu!”.",
      "3. Relacja ojca i matki jako bezpieczna kotwica. Najpotężniejszą tarczą ochronną nastolatka przed destrukcyjnymi modami nie są kazania, lecz autentyczna, pełna miłości relacja z rodzicami. W Księdze Powtórzonego Prawa 6:6–7 Bóg nakazuje ojcom wpajać Słowo „siedząc w domu i idąc drogą” — czyli w normalnym, codziennym życiu, na spacerze, przy naprawianiu samochodu, przy wspólnej herbacie. Kiedy syn wie, że ojciec go szanuje, słucha i wspiera, a córka czuje się bezwarunkowo kochana przez rodziców, nie muszą szukać tandetnej akceptacji w mrocznych subkulturach. Mają w sercu światłość, która zwycięża świat."
    ]
  },`;

content = content.replace('"isHero": true,\n    "isPopular": true,\n    "popularRank": 1,', '"isHero": false,\n    "isPopular": true,\n    "popularRank": 4,');
content = content.replace('export const INITIAL_ARTICLES: Article[] = [', 'export const INITIAL_ARTICLES: Article[] = [\n' + newArticles);
content = content.replace('export const BREAKING_NEWS: string[] = [', 'export const BREAKING_NEWS: string[] = [\n  "Wychowanie & Rodzina: Jak rozmawiać z dziećmi o Halloween i budować tradycję światłości w domu (Pwt 6:6-7)",');

fs.writeFileSync(targetPath, content, 'utf8');
console.log('✓ Successfully patched edukacja_src articles.ts with 3 Halloween family articles');
