import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '../..');
const ARTICLES_TS_PATH = path.join(ROOT, 'portals/ccn-news/src/data/articles.ts');

let code = fs.readFileSync(ARTICLES_TS_PATH, 'utf8');

const newBreaking1 = '  "NOWY ARTYKUŁ RODZINA & WIARA: Cyfrowy detoks w chrześcijańskim domu — jak odzyskać prawdziwą bliskość przy wspólnym stole? Praktyczny poradnik Wioletty Rogowskiej (https://polskieradio.cc/news/cyfrowy-detoks-rodziny-jak-odzyskac-bliskosc-i-spokoj)",\n';
const newBreaking2 = '  "TĘTNO MISJI CC INSIDE: Przegląd ekosystemu Christian Culture — nowe artykuły, lekcje Akademii Biblijnej i narzędzia duchowego wzrostu (https://polskieradio.cc/news/przeglad-ekosystemu-nowe-artykuly-i-lekcje-akademii)",\n';

if (!code.includes('cyfrowy-detoks-rodziny-jak-odzyskac-bliskosc-i-spokoj')) {
  // Insert breaking news at the beginning of BREAKING_NEWS array
  code = code.replace(
    /export const BREAKING_NEWS: string\[\] = \[\r?\n/,
    `export const BREAKING_NEWS: string[] = [\n${newBreaking1}${newBreaking2}`
  );

  const articleDetoks = `  {
    id: 'art-cyfrowy-detoks-rodziny-jak-odzyskac-bliskosc-i-spokoj',
    title: 'Cyfrowy detoks w chrześcijańskim domu: Jak odzyskać prawdziwą bliskość przy wspólnym stole',
    slug: 'cyfrowy-detoks-rodziny-jak-odzyskac-bliskosc-i-spokoj',
    excerpt: 'Żyjemy w świecie, w którym ekrany smartfonów zastąpiły rozmowę twarzą w twarz. Badania neuropsychologiczne i mądrość Pisma Świętego pokazują, że powrót do autentycznej relacji wymaga świadomej decyzji i codziennych granic w rodzinie.',
    content: [
      '1. Prawdziwa obecność w epoce cyfrowego hałasu',
      'Współczesna neuronauka potwierdza to, o czym Biblia mówi od tysiącleci: ludzki umysł potrzebuje wyciszenia i relacji opartej na fizycznej, skupionej obecności, a nie na nieustannym dopaminowym bodźcowaniu powiadomieniami. Zgodnie z badaniami Instytutu Badań Edukacyjnych nadmierna ekspozycja dzieci i młodzieży na krótkie formy wideo prowadzi do rozproszenia uwagi, osamotnienia i chronicznego lęku.',
      'Apostoł Paweł w Liście do Efezjan napomina nas: „Baczcie więc, abyście postępowali rozważnie, nie jak niemądrzy, lecz jak mądrzy; Odkupując czas, bo dni są złe” (Ef 5:15–16 UBG). Czas z rodziną jest bezcennym Bożym darem, którego nie da się cofnąć ani kupić za żadne pieniądze.',
      '2. Stół jadalny jako domowe sanktuarium przymierza',
      'W tradycji biblijnej wspólny posiłek nigdy nie był tylko zaspokojeniem głodu fizycznego. Był miejscem przymierza, rozmowy, dzielenia się sercem i błogosławieństwa. Gdy każdy członek rodziny zasiada do stołu z telefonem w dłoni, stół przestaje łączyć, a staje się zbiorem odizolowanych wysp.',
      'W Księdze Powtórzonego Prawa Bóg nakazuje rodzicom: „I będziesz je wpajał twoim synom, i będziesz o nich mówił, siedząc w swoim domu, i idąc drogą, i kładąc się, i wstając” (Pwt 6:7 UBG). Te słowa wymagają uważności — spojrzenia dziecku w oczy, wysłuchania jego obaw i wspólnego dziękowania Bogu za miniony dzień.',
      '3. Praktyczne zasady cyfrowego pokoju w domu',
      'Wprowadzenie cyfrowego detoksu nie oznacza walki z technologią, lecz przywrócenie jej właściwego miejsca służebnego. Oto cztery sprawdzone zasady chrześcijańskiego domu:',
      '• Zasada Kosza na Telefony: Podczas posiłków oraz rodzinnych wieczorów wszystkie telefony trafiają do drewnianego kosza w przedpokoju z wyłączonymi dźwiękami.',
      '• Złota Godzina przed snem: Ostatnia godzina przed pójściem spać to czas bez ekranów — czas na czytanie Pisma Świętego, rozmowę małżonków i spokojną modlitwę.',
      '• Sobotni Szabat Cyfrowy: Choćby jedno popołudnie w tygodniu spędzone na spacerze, w lesie lub przy planszówkach bez dotykania mediów społecznościowych.',
      '• Przykład idzie z góry: Dzieci nie słuchają tego, co mówimy, lecz naśladują to, co robimy. Jeśli rodzic sam nie potrafi odłożyć smartfona, żadne zakazy nie przyniosą owocu.',
      '4. Podsumowanie i modlitwa o relacje w rodzinie',
      'Największym spadkiem, jaki możemy zostawić naszym dzieciom, nie są nowoczesne gadżety ani dobra materialne, lecz poczucie bezpieczeństwa, miłości i zakorzenienia w Bogu. Prawdziwa bliskość rodzi się w ciszy, w cierpliwym słuchaniu i w Bożej łasce, która uczy nas kochać nie na pokaz, lecz czynem i prawdą (1 J 3:18).',
      'Zacznij dzisiaj od jednego wspólnego posiłku z odłożonymi telefonami. Pobłogosław swoich bliskich i pozwól, by Boży pokój na nowo zagościł w Waszym domu.'
    ],
    category: 'Wiadomości i Społeczeństwo',
    categoryLabel: 'Rodzina & Relacje',
    publishedAt: '2026-10-30T09:00:00+01:00',
    dateFormatted: '30 października 2026',
    author: AUTHORS.wioletta,
    imageUrl: '/images/news/art-cyfrowy-detoks-rodziny-jak-odzyskac-bliskosc-i-spokoj.jpg',
    imageCaption: 'Cyfrowy detoks przy wspólnym stole — ciepło rodzinnej obecności bez rozpraszaczy smartfonów (CCN News 2026)',
    readTimeMinutes: 7,
    isPopular: true,
    popularRank: 2,
    tags: ["@WiolettaRogowska","@RodzinaCC","@Lumina","#Rodzina","#Wychowanie","#CyfrowyDetoks","#Relacje","#PismoŚwięte","#Biblia","#PokójWDomu","#Mądrość"],
    scriptureReference: {
      verse: 'List do Efezjan 5:15–16',
      text: 'Baczcie więc, abyście postępowali rozważnie, nie jak niemądrzy, lecz jak mądrzy; Odkupując czas, bo dni są złe.',
      strongCode: 'G2540'
    }
  },`;

  const articleInside = `  {
    id: 'art-przeglad-ekosystemu-nowe-artykuly-i-lekcje-akademii',
    title: 'Tętno Misji: Nowe rozważanie, premiera artykułu o pokoju serca i lekcje Akademii Biblijnej',
    slug: 'przeglad-ekosystemu-nowe-artykuly-i-lekcje-akademii',
    excerpt: 'W ekosystemie Christian Culture każdy dzień przynosi nowe narzędzia duchowego wzrostu. Sprawdź, jakie materiały biblijne, formacyjne i multimedialne pojawiły się dzisiaj w naszych portalach, radiu i aplikacjach.',
    content: [
      '1. Boże Słowo dociera każdego dnia do tysięcy serc',
      'Misja Christian Culture rozwija się w dynamicznym rytmie codziennego zwiastowania Dobrej Nowiny. Naszym nadrzędnym celem jest dostarczenie każdemu człowiekowi darmowego, wolnego od komercyjnego hałasu i czystego źródła Bożej prawdy — poprzez radio, aplikacje mobilne, interaktywne portale wiedzy i systematyczne studium Pisma Świętego.',
      '2. Kluczowe publikacje dzisiejszego dnia w EkoCC',
      '• Premiera artykułu redakcyjnego: „Gdy lęk o jutro odbiera ci pokój — 5 biblijnych zasad uciszenia burzy w sercu”. Głęboka analiza Cezarego Rogowskiego w świetle Ewangelii św. Jana 14:27 i Listu do Filipian 4:6–7, dostępna w pełnej wersji tekstowej oraz z wielojęzycznym lektorem TTS w serwisie CCN News.',
      '• Akademia Biblijna i Kurs Codzienny: Dzisiejsza lekcja Dnia 30 z Księgi Rodzaju 48–49: „Błogosławieństwo Jakuba, proroctwo o berle Judy i Chrystus jako Lew i Baranek”. Każda lekcja oferuje czyste Clean URLs, dynamiczne odnośniki interlinearne i sekcję błyskawicznego dzielenia się Słowem.',
      '• Codzienne rozważanie formacyjne: Poranna inspiracja w aplikacji mobilnej oraz na stronach ekosystemu wzmacniająca wiarę i przypominająca o wierności Chrystusa pośród codziennych zmagań.',
      '• Nowoczesna Wyszukiwarka Ekosystemu (/wyszukiwarka, skrót Ctrl+K): Uruchomiono tętniący życiem silnik dynamicznych rekomendacji z pulami rotacji co 5.5s, prezentujący najświeższe treści, audycje i narzędzia misyjne w czasie rzeczywistym.',
      '3. Jak korzystać ze wszystkich zasobów ekosystemu?',
      'Wszystkie materiały tworzone w ramach misji Christian Culture są w 100% bezpłatne i dostępne dla każdego użytkownika bez konieczności zakładania płatnych subskrypcji. Możesz słuchać Radia CC 24/7, studiować interlinearną Moją Biblię z kodami Stronga, dołączyć do bezpiecznej społeczności LUMINA lub zainstalować lekką aplikację mobilną z cclite.pl.',
      'Dziękujemy wszystkim modlącym się i wspierającym to dzieło. Wspólnie niesiemy Ewangelię nadziei do każdego zakątka Polski i świata!'
    ],
    category: 'Wiadomości i Społeczeństwo',
    categoryLabel: 'CC Inside & Misja',
    publishedAt: '2026-10-30T09:30:00+01:00',
    dateFormatted: '30 października 2026',
    author: AUTHORS.redakcja,
    imageUrl: '/images/news/art-przeglad-ekosystemu-nowe-artykuly-i-lekcje-akademii.jpg',
    imageCaption: 'Tętno Misji Christian Culture — Słowo Boże, radio 24/7, studia biblijne i technologia dla Chrystusa (2026)',
    readTimeMinutes: 5,
    isPopular: true,
    popularRank: 3,
    tags: ["@CCN","@Akademia","@RadioCC","@Lumina","@VODCC","#Ewangelia","#BibliaAudio","#SłowoNaDziś","#MisjaChrześcijańska","#ChrystusPanem"],
    scriptureReference: {
      verse: 'Księga Izajasza 55:11',
      text: 'Tak będzie z moim słowem, które wyjdzie z moich ust: nie wróci do mnie bezowocne, ale uczyni to, co mi się podoba, i poszczęści mu się w tym, do czego je posłałem.',
      strongCode: 'H1697'
    }
  },`;

  code = code.replace(
    /export const INITIAL_ARTICLES: Article\[\] = \[\s*/,
    `export const INITIAL_ARTICLES: Article[] = [\n${articleDetoks}\n${articleInside}\n`
  );

  fs.writeFileSync(ARTICLES_TS_PATH, code, 'utf8');
  console.log('✅ portals/ccn-news/src/data/articles.ts zaktualizowane o 2 nowe artykuły!');
} else {
  console.log('Artykuły już istnieją w articles.ts');
}
