// scripts/sync-all-rozwazania-baza.mjs
import fs from 'fs';
import path from 'path';

const day25Data = {
  id: "ref_day25_2026-10-25",
  day: 25,
  date: "2026-10-25",
  dayOfWeek: "Niedziela",
  title: "☀️ Z Biblią za Pan Brat — Dzień 25: Józef w domu Potifara i w więzieniu — A Pan był z nim",
  teaser: "Dzień 25 — Józef w domu Potifara i w więzieniu: Wierność w próbie, oskarżenie i Boża obecność w lochu (Rdz 38:1–39:23)",
  contentWeb: `☀️ Z Biblią za Pan Brat — Dzień 25: Józef w domu Potifara i w więzieniu — A Pan był z nim

Dwudziesty piąty dzień naszej 66-miesięcznej podróży przez Pismo Święte przenosi nas w sam środek dramatu Józefa w Egipcie oraz ukazuje głęboki kontrast z losem Judy w Kanaanie (Rdz 38:1–39:23).

W 38. rozdziale widzimy moralne zagubienie Judy, który odchodzi od braci, żeni się z Kananejką i ponosi bolesne konsekwencje nieprawości swoich synów. Dopiero gdy Tamar okazuje mu jego własny sygnet i laskę, z ust Judy padają przełomowe słowa: „Ona jest sprawiedliwsza ode mnie” (Rdz 38:26). To moment moralnego zwrotu, z którego Bóg wywodzi ród Dawida i Chrystusa! 

Z kolei w rozdziale 39. narrator przenosi nas do Egiptu. Siedemnastoletni Józef trafia do domu Potifara, dowódcy straży faraona. Pogański pan widzi niezwykłą prawdę: „że PAN był z nim i że wszystko, co czynił, PAN pomyślnie prowadził w jego ręku” (Rdz 39:3). Józef zostaje zarządcą całego domu. Gdy jednak żona Potifara codziennie namawia go do zdrady, Józef wypowiada słowa, które definiują dojrzałą wiarę: „Jakże mógłbym popełnić tak wielką niegodziwość i zgrzeszyć przeciwko Bogu?” (Rdz 39:9). Ucieka, zostawiając szatę. Za swoją prawość zostaje fałszywie oskarżony i wtrącony do więzienia. A jednak loch nie jest końcem: „Ale PAN był z Józefem i okazał mu miłosierdzie, i zjednał mu życzliwość w oczach przełożonego więzienia” (Rdz 39:21). Prawdziwy uczeń Chrystusa wie, że Boża obecność nie chroni przed niesprawiedliwością świata, lecz przeprowadza przez nią ze zwycięstwem!

Jezus mówi dziś do Ciebie:
„Ale PAN był z Józefem i okazał mu miłosierdzie, i zjednał mu życzliwość w oczach przełożonego więzienia.” (Rdz 39:21, UBG)

Zadanie Taktyczne (Czytaj | Wierz | Działaj):
* CZYTAJ: Przeczytaj uważnie Rdz 38 i 39. Zwróć uwagę na to, jak Józef reaguje na pokusę w ukryciu.
* WIERZ: Przyjmij wiarą, że Boża obecność towarzyszy Ci niezależnie od Twoich okoliczności zewnętrznych — w pracy, w domu i w chwilach niezawinionego cierpienia.
* DZIAŁAJ: Zadbaj o bezkompromisową uczciwość w jednym małym zadaniu, którego nikt prócz Boga nie widzi. Wybierz wierność zamiast pozorów.

W Christian Culture aplikacje i portale są zawsze BEZPŁATNE.

Dołącz do bazy i całej społeczności formacyjnej: https://chat.whatsapp.com/DBTRDxQWamZDWaOkjupSt0 – Wejdź do zespołu ludzi z pasją!

PODAJ DALEJ 🔴 DWUDZIESTY PIĄTY DZIEŃ SERII!
www.polskieradio.cc | www.polskieradio.cc/lumina | www.cclite.pl
Wspomóż misję: patronite.pl/osobowoscplus`,
  fullText: `Z Biblią za Pan Brat — Dzień Dwudziesty Piąty

Czy zdajesz sobie sprawę, że Twoja prawdziwa wartość i charakter objawiają się nie wtedy, gdy patrzą na Ciebie tłumy, ale wtedy, gdy jesteś zupełnie sam i stajesz przed wyborem między wiernością Bogu a łatwym kompromisem?

Zatrzymaj się na progu dwudziestego piątego dnia naszej wędrówki w Księdze Rodzaju i zbadaj z całą surowością swoje serce. Wypowiedz przed Ojcem to bezkompromisowe pytanie: Tato, czy moje serce szuka Twojej chwały w ukryciu, czy zadowala się jedynie pozorami pobożności przed ludźmi? Wchodząc dzisiaj w trzydziesty ósmy i trzydziesty dziewiąty rozdział Księgi Rodzaju, widzimy najpierw dramat Judy, który w obliczu własnego grzechu potrafi wreszcie uznać prawdę i powiedzieć o Tamar: ona jest sprawiedliwsza ode mnie. A potem przenosimy się do Egiptu, gdzie młody Józef w domu Potifara promieniuje Bożą obecnością. W obliczu natarczywej pokusy Józef nie kalkuluje zysków i strat, lecz ucieka, mówiąc: jakże mógłbym zgrzeszyć przeciwko Bogu? Płaci za to wysoką cenę: zostaje fałszywie oskarżony i wtrącony do lochu. A jednak w najciemniejszym więzieniu Bóg nie opuszcza swojego sługi. Pismo Święte powtarza jak refren: ale Pan był z Józefem i okazał mu miłosierdzie. Prawda Królestwa uderza z wyzwalającą mocą: Jezus Chrystus, niewinnie osądzony i odrzucony, wszedł w najciemniejszą dolinę śmierci, aby zmartwychwstać i otworzyć nam bramy życia wiecznego.

Jezus mówi dziś do Ciebie:
Ale Pan był z Józefem i okazał mu miłosierdzie, i zjednał mu życzliwość w oczach przełożonego więzienia. (Pierwsza Księga Mojżeszowa, rozdział trzydziesty dziewiąty, werset dwudziesty pierwszy, UBG)

Zadanie Taktyczne:
Zmiażdż dzisiaj wszelki kompromis ze złem, dwulicowość i udawanie na swoim niedzielnym posterunku. Twoim dzisiejszym rozkazem jest absolutna wierność Bogu w tym, co niewidoczne dla ludzkich oczu. Zakazuję Ci szukania ludzkiego uznania kosztem czystości sumienia. Zastąp to żywym wyznaniem wiary: Panie, choćby cały świat kusił mnie do grzechu lub niesłusznie oskarżał, wybieram wierność Twojemu Słowu, bo wiem, że Ty jesteś ze mną w każdym doświadczeniu!, czyniąc to z nienaganną, królewską klasą dziecka Bożego.

W Christian Culture aplikacje i portale są dla Ciebie zawsze bezpłatne.

Modlitwa Bojowa:
Ojcze w niebie, dziękuję Ci za świadectwo Józefa, który w pogańskim kraju i w samotności potrafił dochować wierności Twojemu Przymierzu. Przepraszam za chwile, gdy ulegałem pokusom, gdy szukałem wymówek dla grzechu i gdy brakowało mi odwagi, by uciekać przed złem. Panie Jezu, Ty jesteś ze mną w każdej próbie. Nawet gdy spotyka mnie niezrozumienie lub fałszywy osąd, napełnij moje serce Twoim pokojem i łaską. Daj mi siłę, bym żył w prawdzie i przynosił owoc Twojego Ducha w każdym miejscu, do którego mnie poślesz. Tobie chwała na wieki.

Rozkaz Dnia (Zadbaj o wzrost):
Nie idź w tę podróż sam. Wejdź do naszej bazy ludzi z pasją, zintegruj swoje siły z innymi i ruszaj ramię w ramię przez sześćdziesiąt sześć miesięcy formacji w unikalnym projekcie Z Biblią za Pan Brat.

Błogosławieństwo:
Niech Pan zastępów strzeże Twojego serca przed pokusą, obdarzy Cię odwagą prawości i niech Jego łaska rozpromienia każdą ciemność Twojego życia.

Dobrego dnia! Podaj dalej.`,
  imageUrl: "https://polskieradio.cc/images/academy/daily/kc_day_25_jozef_potifar_wiezienie_pan_byl_z_nim.jpg",
  authorName: "Cezary Rogowski",
  authorUid: "admin",
  authorSlug: "cezaryrgowski"
};

const jsonBazaPaths = [
  "C:\\Users\\czark\\Christian_Culture_Projekty\\polskieradio.cc\\rozwazania_baza.json",
  "C:\\Users\\czark\\Christian_Culture_Projekty\\polskieradio.cc\\.pages-release\\rozwazania_baza.json",
  "C:\\Users\\czark\\Christian_Culture_Projekty\\Wektor1_VideoFactory\\rozwazania_baza.json",
  "C:\\Users\\czark\\Christian_Culture_Projekty\\Wektor1_VideoFactory\\rozwazania_cuda_baza.json",
  "C:\\Users\\czark\\Christian_Culture_Projekty\\Christian-Culture-Web-App\\public\\rozwazania_baza.json",
  "C:\\Users\\czark\\Christian_Culture_Projekty\\cclite.pl\\public\\rozwazania_baza.json",
  "C:\\Users\\czark\\Christian_Culture_Projekty\\cclite.pl\\dist\\rozwazania_baza.json",
  "C:\\Users\\czark\\Desktop\\@ICC\\LUMINA\\rozwazania_baza.json"
];

let updatedCount = 0;
for (const jp of jsonBazaPaths) {
  if (fs.existsSync(jp)) {
    try {
      let list = JSON.parse(fs.readFileSync(jp, "utf8"));
      if (Array.isArray(list)) {
        list = list.filter(item => item.id !== day25Data.id && item.date !== day25Data.date);
        list.unshift(day25Data);
        fs.writeFileSync(jp, JSON.stringify(list, null, 2), "utf8");
        console.log(`✅ Zaktualizowano ${jp} o Dzień 25 (${day25Data.date})`);
        updatedCount++;
      }
    } catch (e) {
      console.error(`❌ Błąd zapisu do ${jp}:`, e.message);
    }
  } else {
    console.log(`ℹ️ Ścieżka nie istnieje: ${jp}`);
  }
}

console.log(`\n🎉 Zaktualizowano ${updatedCount} baz JSON o Dzień 25!`);
