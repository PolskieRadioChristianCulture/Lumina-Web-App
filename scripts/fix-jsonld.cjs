const fs = require('fs');
const targets = [
  'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/kursy/pokonac-goliata.html',
  'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/kursy/pokonac-goliata/index.html',
  'C:/Users/czark/Desktop/@ICC/LUMINA/kursy/pokonac-goliata.html',
  'C:/Users/czark/Desktop/@ICC/LUMINA/kursy/pokonac-goliata/index.html'
];
for (const t of targets) {
  let c = fs.readFileSync(t, 'utf8');
  c = c.replace(
    '"description": "Chrześcijańsko-psychologiczny, interaktywny<br />kurs inspiracji i motywacji w 8 krokach',
    '"description": "Chrześcijańsko-psychologiczny, interaktywny kurs inspiracji i motywacji w 8 krokach'
  );
  fs.writeFileSync(t, c, 'utf8');
  console.log('Fixed JSON-LD description in:', t);
}
