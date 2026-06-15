const fs = require('fs');
const filePath = 'C:\\Users\\czark\\Christian_Culture_Projekty\\polskieradio.cc\\app.js';
let content = fs.readFileSync(filePath, 'utf8');

const correctArray = `const BIBLE_DECALOGUE = [
  { num: "1", text: "I mówił Pan wszystkie te słowa:" },
  { num: "2", text: "„Jam jest Pan, Bóg twój, którym cię wywiódł z ziemi egipskiej, z domu niewoli." },
  { num: "3", text: "Nie będziesz miał bogów cudzych przede mną." },
  { num: "4", text: "Nie uczynisz sobie obrazu rytego ani żadnej podobizny tego, co jest na niebie w górze i co na ziemi nisko, ani z tych rzeczy, które są w wodach pod ziemią." },
  { num: "5", text: "Nie będziesz się im kłaniał ani służył. Ja jestem Pan, Bóg twój, mocny, zawistny, karzący nieprawość ojców na synach do trzeciego i czwartego pokolenia tych, którzy mnie nienawidzą," },
  { num: "6", text: "a czyniący miłosierdzie tysiącom tych, którzy mię miłują i strzegą przykazań moich." },
  { num: "7", text: "Nie będziesz brał imienia Pana, Boga twego, nadaremno; bo nie będzie miał Pan za niewinnego tego, który by wziął imię Pana, Boga swego, nadaremno." },
  { num: "8", text: "Pamiętaj, abyś dzień sobotni święcił." },
  { num: "9", text: "Sześć dni robić będziesz i będziesz wykonywał wszystkie roboty twoje;" },
  { num: "10", text: "ale dnia siódmego sabat Pana, Boga twego, jest: nie będziesz wykonywał weń żadnej roboty, ty i syn twój, i córka twoja, sługa twój i służebnica twoja, bydlę twoje i gość, który jest między bramami twymi." },
  { num: "11", text: "Przez sześć dni bowiem czynił Pan niebo i ziemię, i morze, i wszystko, co w nich jest, a odpoczął dnia siódmego; i dlatego pobłogosławił Pan dniowi sobotniemu i poświęcił go." },
  { num: "12", text: "Czcij ojca twego i matkę twoją, abyś długo żył na ziemi, którą Pan, Bóg twój, da tobie." },
  { num: "13", text: "Nie będziesz zabijał." },
  { num: "14", text: "Nie będziesz cudzołożył." },
  { num: "15", text: "Nie będziesz kradzieży czynił." },
  { num: "16", text: "Nie będziesz mówił fałszywego świadectwa przeciw bliźniemu twemu." },
  { num: "17", text: "Nie będziesz pożądał domu bliźniego twego, ani będziesz pragnął żony jego, ani sługi, ani służebnicy, ani wołu, ani osła, ani żadnej rzeczy, która jego jest”." }
];`;

const startIndex = content.indexOf('const BIBLE_DECALOGUE = [');
const endIndex = content.indexOf('];', startIndex) + 2;

if (startIndex !== -1 && endIndex !== -1) {
    content = content.substring(0, startIndex) + correctArray + content.substring(endIndex);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Zaktualizowano app.js!');
} else {
    console.log('Nie znaleziono BIBLE_DECALOGUE');
}
