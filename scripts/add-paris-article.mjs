import fs from 'node:fs';
import path from 'node:path';

const tsPath = path.resolve('portals/ccn-news/src/data/articles.ts');
let code = fs.readFileSync(tsPath, 'utf8');

const newArticleCode = `  {
      "id": "art-paryz-godzina-policyjna-protesty-francja-biblia",
      "title": "Paryż pod godziną policyjną. Francja protestuje, a Jezus ostrzega przed oziębnięciem miłości",
      "slug": "paryz-godzina-policyjna-protesty-francja-biblia",
      "excerpt": "Paryż pod nocną godziną policyjną po masowych protestach i aktach przemocy. Fakty z 20 października 2026 oraz chrześcijańska refleksja nad gniewem, pokojem i przestrogą Jezusa z Mt 24:12.",
      "content": [
          "Paryż, miasto kojarzone z kulturą, sztuką i ideą wolności, znalazł się w centrum społecznego napięcia. Po masowych protestach i aktach przemocy francuskie władze wprowadziły lokalne godziny policyjne. W kraju, w którym świeckość państwa odgrywa szczególną rolę, wraca pytanie: jak rozmawiać o sprawiedliwości, gniewie i pokoju? Ewangelia nie daje prostych odpowiedzi na spory gospodarcze, ale stawia wymagania wszystkim ich uczestnikom.",
          "CO WYDARZYŁO SIĘ WE FRANCJI?",
          "17 października przez Francję przeszły masowe demonstracje związane między innymi z kosztami życia, warunkami edukacji i niezadowoleniem z polityki państwa. Według „Le Monde” w protestach uczestniczyło około 550 tys. osób według Ministerstwa Spraw Wewnętrznych i około 800 tys. według organizatorów. Rozbieżność szacunków należy zachować w relacjach informacyjnych.",
          "Wiele zgromadzeń miało charakter pokojowy. Równocześnie doszło do starć z funkcjonariuszami, zniszczeń mienia i grabieży. Nie wolno utożsamiać wszystkich demonstrantów ze sprawcami tych czynów. Doniesienia o przemocy wymagają odrębnej oceny, podobnie jak zarzuty dotyczące proporcjonalności działań policji.",
          "19 października prefektura policji zarządziła godzinę policyjną w określonych rejonach Paryża, między innymi wokół Place de la République oraz Les Halles. Ograniczenie wprowadzono na noc z poniedziałku na wtorek. Burmistrz Paryża określił takie narzędzie jako nadzwyczajne i tymczasowe. Reuters 20 października informował o częściowym uspokojeniu sytuacji, ale i zapowiedziach dalszych protestów.",
          "DLACZEGO LUDZIE WYSZLI NA ULICE?",
          "Sprowadzanie sytuacji do obrazu „chaosu bez przyczyny” byłoby błędem. Wcześniejsze protesty uczniów i studentów dotyczyły m.in. warunków nauki, braków kadrowych i obaw o perspektywy młodych ludzi. Do tego dołączyły szersze niepokoje związane z poziomem życia.",
          "Prawo do pokojowego zgromadzania się i zgłaszania postulatów nie może być utożsamiane z przyzwoleniem na przemoc. Również państwo pozostaje zobowiązane do ochrony obywateli oraz proporcjonalnego stosowania środków porządkowych. Chrześcijańska analiza powinna dostrzegać zarówno krzywdę właścicieli zniszczonych sklepów, jak i obawy młodych ludzi o przyszłość.",
          "FRANCJA ŚWIECKA — CZY ZNACZY TO FRANCJA BEZ WIARY?",
          "Francuska zasada laickości oznacza świecki charakter instytucji publicznych i szczególny model relacji państwa z religią. Sama w sobie nie dowodzi zaniku wszystkich przekonań duchowych ani nie oznacza zakazu wiary.",
          "Nie ma dowodu, że obecne zamieszki są bezpośrednim skutkiem sekularyzacji. Podobne konflikty społeczne występują przecież również w społeczeństwach bardziej religijnych. Można natomiast postawić ważne pytanie: jakie wartości pomagają ludziom prowadzić spór bez odczłowieczania przeciwnika?",
          "Chrześcijaństwo może w tej rozmowie zaoferować język godności, miłosierdzia, uczciwości i pojednania. Nie zastępuje on reform gospodarczych czy sprawiedliwego prawa, lecz wskazuje, jak odnosić się do drugiego człowieka nawet w głębokim konflikcie.",
          "„MIŁOŚĆ WIELU OZIĘBNIE” — CO NAPRAWDĘ MÓWI JEZUS?",
          "W Ewangelii Mateusza 24,12 Jezus ostrzega, że wskutek narastającej nieprawości miłość wielu oziębnie. Słowa te należą do szerszej mowy dotyczącej kryzysów, prześladowań, zwiedzenia i wytrwałości uczniów. Nie są prostym kodem pozwalającym uznać pojedyncze zamieszki za jednoznaczne wypełnienie proroctwa.",
          "To jednak poważne wezwanie do autorefleksji. Kiedy przeciwnik staje się jedynie wrogiem, łatwo usprawiedliwić krzywdę. Kiedy uzasadniony gniew przechodzi w pogardę, cierpi wspólnota. Właśnie wobec takich postaw chrześcijanin powinien zachować czujność.",
          "List Jakuba 1,19–20 wzywa do gotowości słuchania i powściągliwości w gniewie, zaznaczając, że ludzki gniew nie urzeczywistnia sprawiedliwości Bożej. Nie jest to nakaz milczenia wobec niesprawiedliwości. Chodzi o sposób dochodzenia prawdy i obrony słabszych bez upodobniania się do przemocy, której się sprzeciwiamy.",
          "BŁOGOSŁAWIENI, KTÓRZY WPROWADZAJĄ POKÓJ",
          "W Mt 5,9 Jezus nazywa błogosławionymi czyniących pokój. Nie chodzi o pozorny spokój osiągany przez przemilczenie problemów. Pokój biblijny wiąże się z prawdą, sprawiedliwością i odpowiedzialnością.",
          "Chrześcijańska odpowiedź na kryzys we Francji nie powinna polegać na szyderstwie z kraju określanego jako świecki ani na ogłaszaniu Bożej kary. Jezus w Łk 13,1–5 odrzucał uproszczone wnioskowanie, że ofiary tragedii były większymi grzesznikami od innych. Zamiast wykorzystywać cudze cierpienie jako argument przeciw ludziom, kierował słuchaczy ku osobistemu nawróceniu.",
          "W praktyce oznacza to modlitwę za poszkodowanych, sprzeciw wobec przemocy, ochronę wolności pokojowego protestu oraz wezwanie do uczciwego dialogu. Wspólnoty chrześcijańskie mogą być miejscem pomocy i odbudowy zaufania, nie zaś kolejną stroną wojny na słowa.",
          "CZY JEST TO ZNAK CZASÓW KOŃCA?",
          "W historycystycznym odczytaniu Mt 24 kolejne konflikty i kryzysy mogą przypominać o kruchości świata oraz potrzebie duchowej gotowości. Jednak Jezus wyraźnie przestrzegał przed pochopną oceną wydarzeń i podkreślał, że samo występowanie niepokojów nie pozwala wyznaczać dat końca (Mt 24,4–8.36).",
          "Dlatego wydarzenia w Paryżu warto potraktować jako wezwanie do czujności moralnej, a nie jako dowód, że konkretny dzień proroczy właśnie się wypełnia. Wiara chrześcijańska prowadzi do wierności Chrystusowi, a nie do sensacyjnego wykorzystywania ludzkiego cierpienia.",
          "FRANCJA POTRZEBUJE POKOJU — TAK JAK KAŻDY NARÓD",
          "Gdy ucichnie hałas ulicznych starć, pozostaną realne problemy: zaufanie do instytucji, warunki życia młodych ludzi, bezpieczeństwo i możliwość rozmowy ponad podziałami. Żadne społeczeństwo nie rozwiąże ich samymi hasłami.",
          "Chrześcijańska nadzieja nie polega na przekonaniu, że wierzący są moralnie lepsi od reszty obywateli. Jej podstawą jest Jezus Chrystus, który wzywa do prawdy, miłości nieprzyjaciół i czynnego pokoju (Mt 5,9.44).",
          "Paryż przypomina dziś światu o cenie gniewu, ale także o ludzkim pragnieniu wysłuchania i sprawiedliwości. Najważniejsze pytanie brzmi nie tylko: „Kiedy zakończą się protesty?”, lecz również: „Co zrobimy, by po ich zakończeniu nie zabrakło miłości, prawdy i odpowiedzialności?”."
      ],
      "scriptureReference": {
          "verse": "Ewangelia Mateusza 24:4–12.36 · Ewangelia Mateusza 5:9.44 · List Jakuba 1:19–20 · Ewangelia Łukasza 13:1–5",
          "text": "A ponieważ bezprawie się rozmnoży, miłość wielu oziębnie. Lecz kto wytrwa do końca, ten będzie zbawiony.",
          "strongCode": "G4129 (Plethyno — rozmnożyć się) / G434 (Psycho — oziębnąć) / G26 (Agape — miłość ofiarna)"
      },
      "sourceCitation": {
          "sourceName": "Reuters, Associated Press, Le Monde, Presse Paris & Biblia UBG",
          "sourceUrl": "https://www.reuters.com/world/targeted-curfews-helped-keep-peace-overnight-france-pm-says-2026-10-20/",
          "quotationDate": "20 października 2026 r.",
          "originalTitle": "Reuters: „Curfews help calm France but more protests planned” (20.10.2026) · AP: „Paris police issue overnight curfew…” (19.10.2026)"
      },
      "category": "swiat",
      "categoryLabel": "CCN NEWS — ŚWIAT / ANALIZA SPOŁECZNA I KOMENTARZ BIBLIJNY",
      "author": {
          "id": "cezary-rogowski",
          "name": "Cezary Rogowski",
          "role": "Założyciel Christian Culture & Redaktor Naczelny CCN",
          "status": "Żonaty",
          "avatarUrl": "/avatar_cezary_official.jpg",
          "bio": "Założyciel ekosystemu Christian Culture oraz portalu Lumina i stacji Polskie Radio CC."
      },
      "publishedAt": "2026-10-20T16:00:00Z",
      "dateFormatted": "20 października 2026",
      "imageUrl": "/images/news/paryz-godzina-policyjna-protesty-francja-biblia.jpg",
      "imageCaption": "Fotoreportaż prasowy CCN News: Nocny Paryż podczas protestów pod godziną policyjną — płonące barykady na bulwarze, dym i kordon służb na tle architektury Haussmanna (20.10.2026).",
      "readTime": "6 min czytania",
      "tags": [
          "paryż",
          "francja",
          "protesty",
          "godzina policyjna",
          "oziębnięcie miłości",
          "mt 24",
          "ewangelia",
          "pokój",
          "bezpieczeństwo",
          "ccn news"
      ]
  },`;

const needle = 'export const INITIAL_ARTICLES: Article[] = [\n';
if (code.includes('art-paryz-godzina-policyjna-protesty-francja-biblia')) {
  console.log('Article already present');
} else {
  code = code.replace(needle, needle + newArticleCode + '\n');
  fs.writeFileSync(tsPath, code, 'utf8');
  console.log('Article successfully added to INITIAL_ARTICLES in ' + tsPath);
}
