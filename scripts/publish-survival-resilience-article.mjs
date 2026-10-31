#!/usr/bin/env node
/**
 * PUBLIKACJA ARTYKUŁU SURVIVAL & BEZPIECZEŃSTWO EkoCC
 * Autor: Cezary Rogowski
 * Tytuł: Kryzys infrastrukturalny, blackout i 72 godziny w domu: Jak mądrze zabezpieczyć rodzinę bez ulegania panice według wytycznych RCB i biblijnej roztropności
 *
 * Zgodność z Podręcznikiem Redakcyjnym EkoCC Wersja 1.0 (30.10.2026):
 * 1. Zapisuje dane do scripts/current-article-data.json
 * 2. Generuje pakiet na Pulpicie (DOCX z osadzoną grafiką 16:9, TXT, SEO.txt, grafika, ZIP)
 * 3. Rejestruje artykuł w portals/ccn-news/src/data/articles.ts
 * 4. Uruchamia cc-universal-publish-discovery.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { packageEkoccArticle } from './package-ekocc-article.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const articleData = {
  portal: 'news',
  type: 'ANALIZA',
  id: 'art-kryzys-infrastrukturalny-blackout-72-godziny-rodzina-roztropnosc',
  slug: 'kryzys-infrastrukturalny-blackout-72-godziny-rodzina-roztropnosc',
  title: 'Kryzys infrastrukturalny, blackout i 72 godziny w domu: Jak mądrze zabezpieczyć rodzinę bez ulegania panice według wytycznych RCB i biblijnej roztropności',
  author: 'Cezary Rogowski',
  date: '2026-10-31',
  imagePath: path.join(ROOT, 'images/news/art-kryzys-infrastrukturalny-blackout-72-godziny-rodzina-roztropnosc.jpg'),
  imageCaption: 'Domowy pakiet przetrwania na 72 godziny: woda, żywność długoterminowa, alternatywne źródła energii i łączności w świetle wytycznych obrony cywilnej i biblijnej przezorności.',
  lead: 'W obliczu narastających napięć geopolitycznych, cyberataków na europejskie sieci przesyłowe oraz powtarzających się awarii infrastruktury komunalnej, temat gotowości na przerwę w dostawach prądu i wody przestaje być domeną entuzjastów survivalu, a staje się podstawową powinnością każdego odpowiedzialnego gospodarza. Rządowe Centrum Bezpieczeństwa (RCB) oraz europejskie agencje ochrony ludności rekomendują przygotowanie każdego gospodarstwa domowego na minimum 72 godziny całkowitej samowystarczalności. W biblijnej perspektywie roztropność nie jest przejawem braku wiary, lecz owocem mądrości, która pozwala zachować spokój w godzinie próby i stać się oparciem dla potrzebujących sąsiadów.',
  sections: [
    {
      heading: '1. Anatomia współczesnego blackoutu: Dlaczego 72 godziny to krytyczny próg bezpieczeństwa?',
      paragraphs: [
        'Współczesna cywilizacja opiera się na skrajnie zoptymalizowanych, lecz jednocześnie niezwykle kruchych łańcuchach dostaw typu just-in-time. Brak zasilania elektrycznego trwający dłużej niż kilka godzin nie oznacza jedynie zgaśnięcia żarówek w pokojach. W ciągu pierwszych 12–24 godzin dochodzi do wyczerpania baterii w stacjach bazowych telefonii komórkowej, zatrzymania pomp w miejskich wodociągach, paraliżu terminali płatniczych oraz wyłączenia systemów chłodniczych w supermarketach.',
        'Raporty Europejskiej Sieci Operatorów Elektroenergetycznych (ENTSO-E) oraz Agencji UE ds. Cyberbezpieczeństwa (ENISA) wskazują, że współczesne sieci przesyłowe są narażone na sprzężone ryzyka: od ekstremalnych zjawisk pogodowych, przez awarie transformatorów najwyższych napięć, po skoordynowane ataki hybrydowe na oprogramowanie SCADA. W przypadku rozległej awarii systemowej (blackoutu) procedury ponownego podnoszenia krajowego systemu elektroenergetycznego (tzw. black start) wymagają od 24 do 72 godzin skoordynowanych działań inżynieryjnych.',
        'Dlatego służby ratownicze i obrona cywilna na całym świecie przyjmują standard 72 godzin jako minimalny czas, w którym państwo koncentruje siły na zabezpieczeniu obiektów krytycznych (szpitali, ujęć wody, łączności państwowej). Przez pierwsze trzy doby każda rodzina musi być przygotowana do funkcjonowania w oparciu o własne rezerwy domowe.'
      ]
    },
    {
      heading: '2. Oficjalne wytyczne RCB i FEMA: Woda, żywność, energia i łączność w praktyce',
      paragraphs: [
        'Zgodnie z oficjalnym „Poradnikiem na czas kryzysu i wojny” opublikowanym przez Rządowe Centrum Bezpieczeństwa (RCB) oraz wytycznymi amerykańskiej agencji FEMA (Ready.gov), podstawą domowego pakietu bezpieczeństwa jest woda pitna. Absolutne minimum fizjologiczne i sanitarne wynosi 3 litry wody na osobę na dobę, co dla czteroosobowej rodziny oznacza konieczność posiadania w stałym zapasie co najmniej 36 litrów wody butelkowanej lub w atestowanych kanistrach spożywczych.',
        'Drugim filarem jest kaloryczna żywność o przedłużonym terminie przydatności, która nie wymaga gotowania ani przechowywania w lodówce. Zaleca się konserwy mięsne i rybne, suszone owoce, orzechy, kasze, suchary wojskowe oraz gotowe dania liofilizowane lub sterylizowane, a także prostą kuchenkę turystyczną (gazową na kartusze) z zachowaniem wszelkich zasad wentylacji.',
        'Trzecim i czwartym elementem są alternatywne źródła energii i informacji: latarki czołowe, zapas baterii, powerbanki naładowane do pełna oraz analogowe radio na baterie lub z dynamem (korbką). Gdy sieć komórkowa i internet milkną, jedynym źródłem oficjalnych komunikatów rządowych i ostrzeżeń ratunkowych stają się fale radiowe UKF/FM oraz fale długie Polskiego Radia.'
      ]
    },
    {
      heading: '3. Biblijna teologia przezorności: Józef w Egipcie i mądrość Księgi Przysłów (Prz 22:3 UBG)',
      paragraphs: [
        'Wielu wierzących popełnia poważny błąd teologiczny, myląc chrześcijańskie zaufanie Bogu z lekkomyślnością i biernością. Pismo Święte na kartach Starego i Nowego Testamentu wielokrotnie pochwala cnotę roztropności, planowania i odpowiedzialnego gospodarowania zasobami. Klasycznym tekstem normatywnym jest Księga Przysłów 22:3: „Roztropny widzi zło i ukrywa się, a prości idą dalej i ponoszą karę” (UBG).',
        'Słowo „roztropny” (hebr. arum, Strong H6175) oznacza człowieka mądrego, przewidującego i przenikliwego, który potrafi właściwie zinterpretować sygnały ostrzegawcze i podjąć odpowiednie działania ochronne. Człowiek naiwny (hebr. peti) ignoruje fakty, usprawiedliwiając własne lenistwo fałszywą duchowością, i w rezultacie ponosi bolesne konsekwencje.',
        'Najwspanialszym historycznym przykładem biblijnej przezorności w skali państwowej był patriarcha Józef w Egipcie. Otrzymawszy od Boga objawienie o nadchodzącym kryzysie, nie poprzestał na modlitwie, lecz wdrożył czternastoletni plan strategiczny: „Niech zbierają wszelką żywność w tych dobrych latach, które nadchodzą, i niech gromadzą zboże... Żywność ta będzie zapasem dla kraju na siedem lat głodu” (Rdz 41:35–36 UBG). Boża suwerenność nie wyklucza ludzkiego planowania — Bóg posługuje się mądrymi szafarzami, aby ratować życie tysięcy ludzi.'
      ]
    },
    {
      heading: '4. Troska o domowników a grzech zaniechania: Egzegeza 1 Listu do Tymoteusza 5:8',
      paragraphs: [
        'Odpowiedzialność za zabezpieczenie rodziny ma w Nowym Testamencie wymiar twardego nakazu moralnego. W 1 Liście do Tymoteusza apostoł Paweł formułuje jedno z najostrzejszych ostrzeżeń w całym kanonie biblijnym: „A jeśli ktoś o swoich, zwłaszcza o domowników, nie dba, wyparł się wiary i gorszy jest od niewierzącego” (1 Tm 5:8 UBG).',
        'Użyty w tekście greckim czasownik pronoéo (Strong G4306) dosłownie oznacza: „myśleć z wyprzedzeniem”, „przewidywać potrzeby”, „zatroszczyć się zawczasu”. Wiara, która nie przekłada się na praktyczną dbałość o chleb, wodę, leki i ciepło dla własnych dzieci i schorowanych rodziców, jest w oczach apostoła hipokryzją i duchowym bankructwem.',
        'Ojciec i matka nie mogą zasłaniać się frazesami w chwili, gdy z powodu braku podstawowych zapasów ich dzieci marzną i głodują podczas zimowego blackoutu. Przygotowanie apteczki, zapasu stale przyjmowanych leków na 30 dni, ciepłych koców i bezpiecznego źródła światła jest bezpośrednią realizacją Bożego powołania do opieki nad domem.'
      ]
    },
    {
      heading: '5. Odpowiedzialność zamiast egoizmu: Chrześcijański survival to służba i pomoc sąsiedzka',
      paragraphs: [
        'Istnieje fundamentalna różnica między świeckim nurtem tzw. „preppersów” a chrześcijańską szkołą przetrwania (SURVIVAL Christian Culture). Świecki surwiwalizm zbyt często wyrasta z paranoi, agresywnej izolacji, gromadzenia broni i budowy warownych bunkrów z założeniem, że każdy bliźni za drzwiami jest śmiertelnym wrogiem, którego należy odpędzić siłą.',
        'Chrześcijański etos przetrwania jest biegunowo odmienny: przygotowujemy się po to, aby nie być ciężarem dla innych, lecz by w chwili kryzysu mieć czym podzielić się z bezbronną wdową, samotną matką czy starszym sąsiadem z klatki obok. Pan Jezus nauczał: „Większa jest radość w dawaniu niż w braniu” (Dz 20:35 UBG). Gdy Twoja rodzina ma zabezpieczone podstawowe potrzeby, Twoje serce nie jest sparaliżowane walką o przetrwanie, lecz otwarte na służbę i ewangeliczne świadectwo miłości.',
        'W historii największych kataklizmów i wojen to właśnie zorganizowane, zintegrowane wspólnoty wierzących okazywały się najskuteczniejszymi centrami ratunku, dzielenia się chlebem i wnoszenia pokoju w serca zdesperowanych ludzi. Chrześcijanin nie buduje schronu po to, by patrzeć na ginący świat, lecz stawia dom na Skale, aby dawać schronienie wędrowcom w czasie nawałnicy.'
      ]
    },
    {
      heading: '6. Wolność od ducha lęku: Duchowa kotwica pokoju w Chrystusie (2 Tm 1:7; Ps 46:1–2 UBG)',
      paragraphs: [
        'Najważniejszym ekwipunkiem chrześcijanina w godzinie jakiegokolwiek kryzysu nie jest filtr do wody ani radiotelefon, lecz stan jego serca. Apostoł Paweł przypominał swojemu młodemu uczniowi: „Nie dał nam bowiem Bóg ducha lęku, ale mocy i miłości, i zdrowego umysłu” (2 Tm 1:7 UBG). Użyte tu słowo sophronismos (Strong G4995) oznacza zrównoważenie, trzeźwość myślenia, panowanie nad sobą i dyscyplinę umysłu ugruntowaną w Bożej prawdzie.',
        'Lęk jest złym doradcą, który paraliżuje proces decyzyjny i prowadzi do paniki. Przebudzony ze snu chrześcijanin wie, do Kogo należy jego życie: „Bóg jest naszą ucieczką i siłą, najpewniejszą pomocą w utrapieniu. Dlatego nie będziemy się bać, choćby się ziemia poruszyła i góry zapadły w środek morza” (Ps 46:1–2 UBG). Żadna awaria sieci energetycznej, żaden krach walutowy ani kryzys geopolityczny nie jest w stanie odłączyć nas od miłości Chrystusa (Rz 8:38–39).',
        'Zrób dzisiaj to, co do ciebie należy: uporządkuj dom, skompletuj 72-godzinny zapas, porozmawiaj z bliskimi o planie awaryjnym. Następnie zegnij kolana przed Stwórcą, oddaj Mu stery swojego życia i śpij spokojnie, bo Ten, który strzeże Twojego domu, nie drzemie ani nie śpi (Ps 121:4).'
      ]
    }
  ],
  conclusion: 'Blackout i awaria infrastruktury krytycznej to realne wyzwania współczesnego świata, które nie powinny budzić w nas paniki, lecz chrześcijańską roztropność. Wytyczne RCB dotyczące pakietu 72-godzinnego idealnie współgrają z biblijnym etosem mądrego szafarza. Łącząc praktyczne przygotowanie materialne z duchowym pokojem w Chrystusie, stajemy się ludźmi nadziei, gotowymi służyć wsparciem i miłością w najtrudniejszych chwilach próby.',
  cta: 'Trzy konkretne kroki dla Ciebie na dziś:\n1. Skompletuj domowy zapas wody pitnej (minimum 3 litry na osobę na dobę na 3 dni) oraz proste źródła światła (latarki czołowe, zapas baterii) i radio analogowe.\n2. Przygotuj plan awaryjny dla rodziny — wyznaczcie stały punkt zbiórki i alternatywny sposób komunikacji na wypadek wyłączenia sieci komórkowej.\n3. Oddaj swoje lęki Bogu w modlitwie — podziękuj za Jego wierność i proś o mądrość oraz odwagę, aby w chwili próby być oparciem dla swoich bliskich i sąsiadów.',
  tags: [
    '@CezaryRogowski',
    '@CCNNews',
    '@SurvivalCC',
    '@ChristianCulture',
    '#Survival',
    '#Blackout',
    '#Bezpieczeństwo',
    '#RCB',
    '#ObronaCywilna',
    '#KsięgaPrzysłów',
    '#Przezorność',
    '#1Tm58',
    '#UBG',
    '#Rodzina',
    '#Wiara'
  ],
  sources: [
    {
      name: 'Rządowe Centrum Bezpieczeństwa (RCB) — „Poradnik na czas kryzysu i wojny: Bądź gotowy na 72 godziny”',
      url: 'https://www.gov.pl/web/rcb/poradnik-na-czas-kryzysu-i-wojny'
    },
    {
      name: 'Agencja UE ds. Cyberbezpieczeństwa (ENISA) & ENTSO-E — „Critical Grid Security & Winter Outlook 2026”',
      url: 'https://www.enisa.europa.eu/publications'
    },
    {
      name: 'Federal Emergency Management Agency (FEMA) — „Ready.gov Emergency Supply Kit Standards”',
      url: 'https://www.ready.gov/kit'
    }
  ],
  scripture: 'Księga Przysłów 22:3; Rdz 41:33–36; 1 Tm 5:8; 2 Tm 1:7; Ps 46:1–3; Mt 6:31–34 (Uwspółcześniona Biblia Gdańska - UBG)',
  seo: {
    title: 'Blackout i 72h w domu: Jak zabezpieczyć rodzinę wg RCB i Biblii',
    description: 'Blackout i kryzys sieci: poradnik 72h samowystarczalności. Wytyczne RCB, FEMA i biblijna roztropność (Prz 22:3; 1 Tm 5:8). Analiza Cezarego Rogowskiego.',
    keywords: [
      'blackout', 'survival', '72 godziny', 'RCB', 'FEMA', 'zapasy domowe',
      'bezpieczeństwo rodziny', 'Cezary Rogowski', 'CCN News', 'Księga Przysłów',
      'przezorność', 'UBG', 'chrześcijański survival', 'odporność na kryzys'
    ]
  }
};

async function main() {
  console.log('🚀 EkoCC REDAKCJA: Rozpoczynam przygotowanie pakietu i publikację artykułu...');

  // 1. Zapisz dane do scripts/current-article-data.json
  const currentJsonPath = path.join(ROOT, 'scripts/current-article-data.json');
  fs.writeFileSync(currentJsonPath, JSON.stringify(articleData, null, 2), 'utf8');
  console.log(`✅ Zapisano dane artykułu w ${currentJsonPath}`);

  // 2. Wygeneruj kompletny pakiet redakcyjny na Pulpicie (DOCX, TXT, SEO.txt, grafika, ZIP)
  console.log('\n📦 Generowanie pakietu redakcyjnego za pomocą packageEkoccArticle...');
  const packResult = await packageEkoccArticle(articleData);
  console.log('✅ Utworzono pakiet na Pulpicie:');
  console.log('   - ZIP:', packResult.zipPath);
  console.log('   - DOCX:', packResult.docxPath);
  console.log('   - TXT:', packResult.txtPath);
  console.log('   - SEO:', packResult.seoPath);

  // 3. Rejestracja w bazie portals/ccn-news/src/data/articles.ts
  console.log('\n📝 Rejestracja artykułu w portals/ccn-news/src/data/articles.ts...');
  const articlesTsPath = path.join(ROOT, 'portals/ccn-news/src/data/articles.ts');
  let tsCode = fs.readFileSync(articlesTsPath, 'utf8');

  if (!tsCode.includes(articleData.id)) {
    const contentItems = [];
    for (const s of articleData.sections) {
      contentItems.push(`      '${s.heading.replace(/'/g, "\\'")}',`);
      for (const p of s.paragraphs) {
        contentItems.push(`      '${p.replace(/'/g, "\\'")}',`);
      }
    }
    contentItems.push(`      'PODSUMOWANIE REDAKCYJNE CCN',`);
    contentItems.push(`      '${articleData.conclusion.replace(/'/g, "\\'")}',`);
    contentItems.push(`      'WEZWANIE DO DZIAŁANIA I MODLITWA',`);
    contentItems.push(`      '${articleData.cta.replace(/'/g, "\\'").replace(/\n/g, ' ')}'`);

    const newArticleTsEntry = `  {
    id: '${articleData.id}',
    title: '${articleData.title.replace(/'/g, "\\'")}',
    slug: '${articleData.slug}',
    excerpt: '${articleData.lead.replace(/'/g, "\\'")}',
    content: [
${contentItems.join('\n')}
    ],
    category: 'Wiadomości i Społeczeństwo',
    categoryLabel: 'CCN SURVIVAL & BEZPIECZEŃSTWO • RAPORT 2026',
    publishedAt: '${articleData.date}T14:00:00+01:00',
    dateFormatted: '31 października 2026',
    author: AUTHORS.cezary,
    imageUrl: '/images/news/art-${articleData.slug}.jpg',
    imageCaption: '${articleData.imageCaption.replace(/'/g, "\\'")}',
    readTimeMinutes: 8,
    isHero: true,
    isPopular: true,
    popularRank: 1,
    tags: ${JSON.stringify(articleData.tags)},
    scriptureReference: {
      verse: 'Księga Przysłów 22:3; 1 Tm 5:8',
      text: 'Roztropny widzi zło i ukrywa się, a prości idą dalej i ponoszą karę. A jeśli ktoś o swoich, zwłaszcza o domowników, nie dba, wyparł się wiary i gorszy jest od niewierzącego.',
      strongCode: 'H6175'
    },
    sourceCitation: {
      sourceName: 'Rządowe Centrum Bezpieczeństwa (RCB) & FEMA Ready.gov',
      sourceUrl: 'https://www.gov.pl/web/rcb'
    }
  },
`;

    // A. Dodaj do BREAKING_NEWS
    const breakingMarker = 'export const BREAKING_NEWS: string[] = [\n';
    const bIdx = tsCode.indexOf(breakingMarker);
    if (bIdx !== -1) {
      const bPos = bIdx + breakingMarker.length;
      const breakingLine = `  "CCN SURVIVAL & SPOŁECZEŃSTWO: Kryzys infrastrukturalny, blackout i 72 godziny w domu. Jak mądrze zabezpieczyć rodzinę według wytycznych RCB i biblijnej roztropności — raport Cezarego Rogowskiego (Prz 22:3; 1 Tm 5:8; Ps 46)",\n`;
      tsCode = tsCode.slice(0, bPos) + breakingLine + tsCode.slice(bPos);
    }

    // B. Dodaj do INITIAL_ARTICLES na pierwszym miejscu
    const targetIdx = tsCode.indexOf('export const INITIAL_ARTICLES: Article[] = [\n');
    if (targetIdx !== -1) {
      const insertPos = targetIdx + 'export const INITIAL_ARTICLES: Article[] = [\n'.length;
      tsCode = tsCode.slice(0, insertPos) + newArticleTsEntry + tsCode.slice(insertPos);
      fs.writeFileSync(articlesTsPath, tsCode, 'utf8');
      console.log(`✅ Artykuł dodany do bazy portals/ccn-news/src/data/articles.ts`);
    } else {
      throw new Error('Nie znaleziono INITIAL_ARTICLES w articles.ts');
    }
  } else {
    console.log(`ℹ️ Artykuł ${articleData.id} już istnieje w articles.ts.`);
  }

  // 4. Uruchomienie centralnego pipeline discovery
  console.log('\n🌐 Uruchamianie centralnego pipeline discovery (scripts/cc-universal-publish-discovery.mjs)...');
  const checkUrl = `https://polskieradio.cc/news/${articleData.slug}`;
  execSync(`node scripts/cc-universal-publish-discovery.mjs --check-url=${checkUrl}`, {
    cwd: ROOT,
    stdio: 'inherit'
  });

  console.log('\n🎉 PROCES REDAKCYJNY I PUBLIKACJA ZAKOŃCZONE PEŁNYM SUKCESEM!');
}

main().catch(err => {
  console.error('❌ Błąd podczas publikacji:', err);
  process.exit(1);
});
