const admin = require('firebase-admin');
const fs = require('fs');

// 1. Update HTML files parser
const htmlFiles = fs.readdirSync('.').filter(f => f.endsWith('.html') && (f.includes('live') || f.includes('bibleaudio')));

for (const file of htmlFiles) {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Update isDialogue regex/check
    content = content.replace(/const isDialogue = text\.includes\("\*\*Noemi"\) \|\| text\.includes\("\*\*Sara"\);/g, 'const isDialogue = text.includes("Noemi") || text.includes("Sara");');

    // Update speakerMatch regex
    content = content.replace(/const speakerMatch = line\.match\([\s\S]*?\);/g, 'const speakerMatch = line.match(/^(?:\\*\\*)?(Noemi|Sara|Gł?os Prowadzą?cych|Noemi i Sara)(?:\\*\\*)?\\s*(\\([.*?\\)])?\\s*(?::\\*\\*|\\*\\*:|:)?\\s*(.*)/i);');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Updated dialogue parser in HTML:', file);
    }
}

// 2. Format Day 24 reflection with bold speaker headers
const sa = require('../Wektor1_VideoFactory/serviceAccountKey.json');
admin.initializeApp({ credential: admin.credential.cert(sa) });
const db = admin.firestore();

const formattedChatText = `### INTRO: ZŁAMANIE FORMATU ŚNIADANIOWEGO
**Noemi:**
Dzień dobry! Witamy państwa bardzo serdecznie w porannym paśmie Christian Culture TV. Środek wakacji, słoneczna pogoda za oknem, a media komercyjne prześcigają się w pomysłach, jak uciec od trudnych tematów. Mogłybyśmy w tym miejscu porozmawiać o wakacyjnej pielęgnacji skóry albo przepisie na lekkie letnie smoothie. Ale państwo wiedzą, że Christian Culture TV to nie jest przestrzeń na puste wypełniacze. Lato to idealny czas na głęboki audyt naszej tożsamości i mentalnego nastawienia.

**Sara:**
Dokładnie tak, Noemi. Kiedy opada codzienne tempo pracy i zostajemy sam na sam ze swoimi myślami, bardzo często na powierzchnię wychodzą nasze najgłębsze kompleksy i ciche lęki. I dzisiaj, w dwudziesty czwarty dzień naszego programu „Lato ku Bożej chwale – Świat dla Jezusa”, otwieramy niezwykle powszechny temat z zakresu psychologii klinicznej i biznesu. Porozmawiamy o syndromie oszusta i o tym, jak poczucie niezasługiwania potrafi sparaliżować nawet najbardziej utalentowanego lidera.

### ANALIZA PROBLEMOWA: PSYCHOLOGIA NA FRONCIE
**Noemi:**
Przeanalizujmy ten mechanizm. Psychologia bardzo precyzyjnie diagnozuje syndrom oszusta. To powracające przeświadczenie, że nasze sukcesy zawodowe, pozycja w firmie czy szacunek w rodzinie są wyłącznie dziełem przypadku lub szczęśliwego zbiegu okoliczności. Żyjemy w ciągłym, podświadomym lęku, że za chwilę ktoś usunie maskę i powie: „widzicie, on się do tego wcale nie nadaje”.

**Sara:**
I to jest wymarzony teren działania nieprzyjaciela. Wróg uwielbia nas wtrącać w ten kompleks mniejszości. Szepcze: „kim ty jesteś, by reprezentować wysokie standardy”, „zobacz na swoje dawne błędy”, „zaraz i tak zaliczysz porażkę”. Dlaczego to robi? Bo wie, że zakompleksiony chrześcijanin, który wstydzi się własnego powołania, jest całkowicie bezobjawowy na linii frontu. Zmusza nas do wycofania się z walki o własne marzenia i wpływ na świat.

### SŁOWO ROZKAZU: PERSPEKTYWA BIBLIJNA
**Noemi:**
Na ekranach państwa telewizorów wyświetlamy teraz strategiczne współrzędne na ten poranek. Zobaczmy, jak tę iluzję wstydu rozbija Apostoł Paweł. To List do Efezjan, rozdział drugi:

> „Nawet gdy byliśmy umarli na skutek występków, razem z Chrystusie przywrócił nas do życia — łaską bowiem jesteście zbawieni — razem też wskrzesił i razem posadził na wyżynach niebieskich w Chrystusie Jezusie...”

**Sara:**
Proszę zwrócić uwagę na czas i przestrzeń! Słowo Boże nie mówi, że kiedyś, po śmierci, może trafimy na wyżyny. On nas już teraz posadził na wyżynach niebieskich w Chrystusie. Twoja wartość na froncie nie wynika z Twojego idealnego życiorysu, ale z królewskiego aktu adopcji. Nie jesteś sierotą wyproszoną na margines – jesteś dziedzicem Królestwa z suwerennym mandatem do działania!

### ZADANIE TAKTYCZNE: ROZKAZ NA DZIŚ
**Noemi:**
Przejdźmy do konkretnego wdrożenia w państwa dzisiejszy grafik. Jako program formacyjny nie zostawiamy państwa bez jasnych wytycznych na ten dwudziesty czwarty dzień walki. Dziś niszczymy syndrom oszusta!

**Sara:**
Zadanie dla państwa na najbliższe godziny: wyprostujcie plecy i wejdźcie w swoje obowiązki zawodowe i biznesowe z pozycją wolnych synów i córek Króla. Jeśli w pracy stajesz przed wyzwaniem, które dotąd Cię przerażało – wykonaj je dzisiaj z chirurgiczną precyzją i nienaganną klasą, wyciszając cichy głos wstydu.

**Noemi:**
I wytyczna popołudniowa dla relacji rodzinnych: przestań przepraszać za to, że masz swoje wartości i wymagania. Daj swoim bliskim poczucie stabilności, pokoju i nienagannego autorytetu, który płynie z zakorzenienia w Chrystusie. Zobaczysz, jak w tej postawie rodzi się szacunek i realny wpływ.

### MANIFEST: MODLITWA BOJOWA
**Sara:**
A teraz zapraszam państwa do stanięcia w pełnej, synowskiej śmiałości przed Bogiem. Zadeklarujmy to razem, na cały głos na ten dzień.

**Noemi i Sara:**
„Jezu, odrzucam dziś rano z anteny mojego życia wszelki duch wstydu, zakompleksienia i kłamstwo nieprzyjaciela, że jestem nie dość dobry. Przepraszam za chwile, gdy zachowywałem się jak sierota. Ogłaszam, że jestem Twoim wolnym dziedzicem posadzonym na wyżynach niebieskich. Daj mi odwagę, precyzję i królewską klasę, bym myślał i działał jak zwycięzca, zdobywając ten świat dla Twojej chwały.”

### OUTRO: BŁOGOSŁAWIEŃSTWO I WZROST
**Noemi:**
Przypominamy, że w Christian Culture subskrypcje i aplikacje są dla państwa zawsze bezpłatne, bo zależy nam na budowaniu silnych, dojrzałych liderów. Jeśli chcesz zintegrować swoje siły z innymi ludźmi z pasją, na dole ekranu wyświetlamy link do naszej letniej bazy formacyjnej: https://chat.whatsapp.com/DBTRDxQWamZDWaOkjupSt0. Dołącz do zespołu!

**Sara:**
Zostawiamy państwa z potężnym błogosławieństwem na ten letni dzień: Niech Pan zastępów ugruntuje dziś państwa tożsamość i napełni wasze domy nadprzyrodzonym pokojem. Niech Jego obecność usuwa wszelkie kompleksy, dając wam styl, precyzję i autorytet do zdobywania tego świata dla Jezusa.`;

async function updateAll() {
    const docRef = db.collection('web_inspirations').doc('ref_day24_2026-07-24');
    await docRef.set({
        title: '☀️ Lato ku Bożej chwale — Dzień 24',
        teaser: 'Dzień 24 – Syndrom Poczucia Niezasługiwania i Psychologia Królewskiego Dziedzictwa. Prowadzą Noemi i Sara.',
        contentWeb: formattedChatText,
        content: formattedChatText,
        fullText: formattedChatText,
        date: '2026-07-24',
        dayIndex: 24,
        published: true,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    console.log('Updated Firestore ref_day24_2026-07-24 with formatted chat text');

    // Re-sync JSON
    const snap = await db.collection('web_inspirations').get();
    const items = [];
    snap.forEach(doc => {
        const d = doc.data();
        let date = d.date;
        if (!date && doc.id.includes('_')) {
            const parts = doc.id.split('_');
            date = parts[parts.length - 1];
        }
        if (date && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
            items.push({
                id: doc.id,
                date: date,
                dayOfWeek: d.dayOfWeek || '',
                title: d.title || '',
                teaser: d.teaser || '',
                fullText: d.contentWeb || d.content || d.fullText || ''
            });
        }
    });

    items.sort((a, b) => a.date.localeCompare(b.date));

    fs.writeFileSync('./rozwazania_baza.json', JSON.stringify(items, null, 2), 'utf8');
    console.log('Re-synced rozwazania_baza.json');
    process.exit(0);
}

updateAll();
