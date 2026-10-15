const fs = require('fs');
const path = require('path');

const p = path.join(__dirname, '../portals/ccn-news/src/data/articles.ts');
let c = fs.readFileSync(p, 'utf8');

const newBreaking = '  "CCN AI & TECH: Czy sztuczna inteligencja może zastąpić ludzką mądrość? Analiza technologiczna i etyczna Cezarego Rogowskiego",\n  "STANDARD CCN 1.0: Oficjalna Polityka Redakcyjna Christian Culture Network przyjęta do realizacji we wszystkich 20 portalach sieci",\n';
if (!c.includes('Czy sztuczna inteligencja może zastąpić ludzką mądrość')) {
  c = c.replace('export const BREAKING_NEWS: string[] = [\n', 'export const BREAKING_NEWS: string[] = [\n' + newBreaking);

  const newArticle = `  {
    "id": "art-czy-ai-zastapi-ludzka-madrosc",
    "title": "Czy sztuczna inteligencja może zastąpić ludzką mądrość? Technologia stawia pytanie o przyszłość człowieka",
    "slug": "czy-ai-zastapi-ludzka-madrosc",
    "excerpt": "Systemy sztucznej inteligencji potrafią analizować ogromne ilości informacji i tworzyć teksty. Jednak wraz ze wzrostem ich możliwości pojawia się pytanie ważniejsze od samej wydajności: czy technologia, która potrafi udzielać odpowiedzi, może również zastąpić ludzką mądrość?",
    "content": [
      "Systemy sztucznej inteligencji potrafią analizować ogromne ilości informacji, tworzyć teksty, pomagać w programowaniu i wspierać podejmowanie decyzji. Jednak wraz ze wzrostem ich możliwości pojawia się pytanie ważniejsze od samej wydajności: czy technologia, która potrafi udzielać odpowiedzi, może również zastąpić ludzką mądrość?",
      "INTELIGENCJA A MĄDROŚĆ — CZY TO NAPRAWDĘ TO SAMO?",
      "Wyobraźmy sobie ucznia przygotowującego się do egzaminu. Zadaje pytanie systemowi AI i niemal natychmiast otrzymuje uporządkowaną odpowiedź. Następnie korzysta z narzędzia, które pomaga mu napisać wypracowanie, przetłumaczyć tekst i zaplanować naukę. Technologia wydaje się niezwykle pomocna. Ale czy uczeń rzeczywiście zrozumiał zagadnienie? Czy potrafi sprawdzić otrzymaną odpowiedź? A przede wszystkim — czy wie, w jakiej sytuacji i w jakim celu powinien wykorzystać zdobytą wiedzę?",
      "W tym miejscu zaczyna się różnica pomiędzy przetwarzaniem informacji a mądrym działaniem. Inteligencję można rozpatrywać między innymi jako zdolność rozwiązywania problemów i dostrzegania zależności. Mądrość natomiast obejmuje również ocenę celów, konsekwencji i wartości, jakimi kieruje się człowiek. Sama poprawność odpowiedzi nie przesądza jeszcze o tym, czy jej wykorzystanie będzie właściwe.",
      "SZTUCZNA INTELIGENCJA JAKO NARZĘDZIE O WIELKIM POTENCJALE",
      "Współczesne systemy AI mogą wspierać pracę naukowców, nauczycieli, programistów, przedsiębiorców i twórców. Pomagają porządkować dokumenty, wyszukiwać zależności w danych, automatyzować powtarzalne zadania oraz udostępniać wiedzę w różnych językach. Dzięki temu mogą oszczędzać czas i zwiększać dostępność wybranych usług.",
      "Nie oznacza to jednak, że każdy wynik wygenerowany przez sztuczną inteligencję jest wiarygodny. System może przedstawić błędną informację w przekonującej formie, pominąć istotny kontekst albo wygenerować odpowiedź nieodpowiednią do sytuacji. Amerykański Narodowy Instytut Standaryzacji i Technologii (NIST) w dokumencie AI Risk Management Framework 1.0 (2023) wskazuje, że wiarygodność systemów AI wymaga między innymi: rzetelności, bezpieczeństwa, przejrzystości, odpowiedzialności, ochrony prywatności oraz ograniczania szkodliwych uprzedzeń. To ważne przypomnienie: użyteczność technologii nie jest równoznaczna z jej niezawodnością.",
      "KTO PONOSI ODPOWIEDZIALNOŚĆ ZA DECYZJĘ?",
      "Załóżmy, że system AI pomaga przygotować rekomendację dotyczącą zatrudnienia, edukacji lub zdrowia. Nawet jeżeli algorytm przeanalizuje wiele danych, wynik może mieć realne konsekwencje dla konkretnej osoby. Kto powinien sprawdzić zasadność rekomendacji? Kto wyjaśni jej podstawy? Kto poniesie odpowiedzialność, jeżeli okaże się błędna?",
      "W Rekomendacji UNESCO dotyczącej etyki sztucznej inteligencji (2021) szczególne znaczenie przypisano godności człowieka, prawom człowieka oraz nadzorowi nad systemami AI. Dokument podkreśla, że ostateczna odpowiedzialność nie powinna zostać przeniesiona z ludzi na technologię. Jest to istotne niezależnie od przekonań religijnych. Odpowiedzialna technologia powinna wspierać ludzkie decyzje, a nie służyć jako usprawiedliwienie dla unikania odpowiedzialności.",
      "CZY MASZYNA MOŻE ROZUMIEĆ DOBRO I ZŁO?",
      "To pytanie wymaga ostrożności. System AI może analizować teksty filozoficzne, porównywać normy prawne, identyfikować sprzeczności w argumentacji i przedstawiać różne stanowiska etyczne. Zdolność do formułowania wypowiedzi o moralności nie rozstrzyga jednak, czy system posiada świadomość, subiektywne doświadczenie albo status podmiotu moralnego. Kwestie te pozostają przedmiotem badań i sporów filozoficznych. W praktyce ważniejsze jest inne pytanie: czy ludzie potrafią właściwie oceniać rekomendacje, które otrzymują? Nie wystarczy zapytać, co technologia może zrobić. Należy również zapytać, czy powinna to zrobić, komu przyniesie korzyść i kto może ponieść koszty jej zastosowania.",
      "PERSPEKTYWA BIBLIJNA: MĄDROŚĆ ZACZYNA SIĘ OD WŁAŚCIWEGO FUNDAMENTU",
      "Chrześcijaństwo wnosi do tej dyskusji własne rozumienie człowieka i mądrości. Księga Przysłów 9:10 wiąże początek mądrości z bojaźnią Pańską. W języku biblijnym oznacza ona postawę czci, uznania autorytetu Boga i moralnej odpowiedzialności, a nie wyłącznie emocjonalny strach. W tym ujęciu mądrość nie polega jedynie na gromadzeniu wiedzy. Obejmuje także rozeznanie, pokorę i sposób postępowania.",
      "Podobne rozróżnienie pojawia się w Liście Jakuba 3:13–18. Autor nie ogranicza mądrości do deklaracji ani intelektualnej sprawności. Łączy ją z dobrym postępowaniem, łagodnością, pokojem, miłosierdziem i szczerością. Z chrześcijańskiej perspektywy są to cechy o znaczeniu moralnym, których nie można sprowadzić do liczby poprawnie wygenerowanych odpowiedzi.",
      "Biblia przedstawia również człowieka jako stworzonego na obraz Boga (Rdz 1:26–27). Tekst ten nie jest wypowiedzią o technologii cyfrowej. Stanowi natomiast ważną podstawę chrześcijańskiego przekonania o szczególnej godności i odpowiedzialności człowieka. W odniesieniu do AI jest to zastosowanie zasady biblijnej do nowoczesnego problemu, a nie twierdzenie, że starożytny autor opisywał współczesne algorytmy.",
      "TECHNOLOGIA W SŁUŻBIE CZŁOWIEKA, A NIE CZŁOWIEK W SŁUŻBIE TECHNOLOGII",
      "Chrześcijańska refleksja nie musi prowadzić do odrzucenia nowoczesnych narzędzi. Sztuczna inteligencja może pomagać tłumaczyć materiały edukacyjne, wspierać dostępność informacji dla osób z niepełnosprawnościami, ułatwiać pracę społeczną i rozwijać projekty służące wspólnemu dobru. Może również wspierać działalność chrześcijańskich redakcji poprzez transkrypcję audycji, porządkowanie dokumentów i przygotowanie wielojęzycznych wersji publikacji.",
      "Jednak żadne narzędzie nie zwalnia wydawcy, nauczyciela, duszpasterza czy autora z obowiązku sprawdzania treści. Szczególnej ostrożności wymagają odpowiedzi dotyczące zdrowia, relacji rodzinnych, wiary i sytuacji kryzysowych. W tych obszarach potrzebne są nie tylko informacje, ale również odpowiedzialność, kompetencje i autentyczne relacje międzyludzkie.",
      "PIĘĆ PYTAŃ PRZED SKORZYSTANIEM Z AI:",
      "1. Czy otrzymana informacja jest prawdziwa? Sprawdź jej źródło i aktualność.",
      "2. Czy rozumiem odpowiedź? Nie zastępuj własnego myślenia bezrefleksyjnym kopiowaniem.",
      "3. Czy szanuję prywatność innych? Nie ujawniaj wrażliwych danych bez odpowiedniej podstawy.",
      "4. Czy moje działanie służy człowiekowi? Oceń możliwe korzyści i szkody.",
      "5. Czy jestem gotów wziąć odpowiedzialność? Nie traktuj algorytmu jako ostatecznego autorytetu.",
      "PRZYSZŁOŚĆ WYMAGA NIE TYLKO INTELIGENCJI",
      "Rozwój sztucznej inteligencji stawia przed ludzkością ogromne możliwości, ale także wymagające pytania o wolność, odpowiedzialność i godność człowieka. Nie trzeba przeciwstawiać technologii wierze ani uznawać wszystkich innowacji za zagrożenie. Ważne jest natomiast zachowanie właściwej kolejności: narzędzia powinny służyć celom, które człowiek potrafi odpowiedzialnie uzasadnić.",
      "W perspektywie chrześcijańskiej przypomina o tym również nauczanie Jezusa, który łączy miłość Boga z miłością bliźniego (Mt 22:37–40). Ostatecznie najważniejsze pytanie nie brzmi: jak inteligentne staną się nasze maszyny? Brzmi ono: czy wraz z rozwojem technologii będziemy stawać się ludźmi bardziej odpowiedzialnymi, prawdomównymi i troszczącymi się o innych?"
    ],
    "scriptureReference": {
      "verse": "Księga Przysłów 9:10 · List Jakuba 3:13–18",
      "text": "Bojaźń PANA jest początkiem mądrości, a poznanie Świętego – rozumem.",
      "strongCode": "H2451 (Chokmah — Mądrość Boża) / G4678 (Sophia)"
    },
    "sourceCitation": {
      "sourceName": "NIST AI RMF 1.0 & UNESCO Ethics of AI (2021/2023)",
      "sourceUrl": "https://airc.nist.gov/airmf-resources/airmf/3-sec-characteristics/",
      "quotationDate": "15 października 2026 r.",
      "originalTitle": "Czy sztuczna inteligencja może zastąpić ludzką mądrość? Technologia stawia pytanie o przyszłość człowieka"
    },
    "category": "nauka",
    "categoryLabel": "CCN AI & TECH · ANALIZA I ETYKA",
    "author": {
      "id": "cezary-rogowski",
      "name": "Cezary Rogowski",
      "role": "Założyciel Christian Culture & Redaktor Naczelny CCN",
      "status": "Żonaty",
      "avatarUrl": "/avatar_cezary_official.jpg",
      "bio": "Założyciel ekosystemu Christian Culture oraz portalu Lumina i stacji Polskie Radio CC."
    },
    "publishedAt": "2026-10-15T08:00:00Z",
    "dateFormatted": "15 października 2026",
    "imageUrl": "/images/news/art-czy-ai-zastapi-ludzka-madrosc.jpg",
    "imageCaption": "Ilustracja AI: Symboliczna dłoń człowieka i cyfrowa sieć neuronowa w szlachetnej palecie Champagne Gold (ilustracja poglądowa wygenerowana z pomocą AI).",
    "readTimeMinutes": 4,
    "isHero": true,
    "isPopular": true,
    "popularRank": 1,
    "tags": [
      "Sztuczna Inteligencja",
      "Etyka AI",
      "Mądrość Biblijna",
      "NIST AI RMF",
      "UNESCO",
      "Technologia i Wiara",
      "Analiza CCN"
    ]
  },
`;

  c = c.replace('export const INITIAL_ARTICLES: Article[] = [\n', 'export const INITIAL_ARTICLES: Article[] = [\n' + newArticle);
  fs.writeFileSync(p, c, 'utf8');
  console.log('Successfully patched articles.ts');
} else {
  console.log('Article already present');
}
