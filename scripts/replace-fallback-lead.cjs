const fs = require('fs');

const targets = [
  'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/kursy/pokonac-goliata.html',
  'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/kursy/pokonac-goliata/index.html',
  'C:/Users/czark/Desktop/@ICC/LUMINA/kursy/pokonac-goliata.html',
  'C:/Users/czark/Desktop/@ICC/LUMINA/kursy/pokonac-goliata/index.html',
  'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/.pages-release/kursy/pokonac-goliata.html',
  'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/.pages-release/kursy/pokonac-goliata/index.html'
];

for (const t of targets) {
  if (!fs.existsSync(t)) continue;
  let c = fs.readFileSync(t, 'utf8');
  c = c.replace(
    '<p class="hero-lead">Chrześcijańsko-psychologiczny, interaktywny kurs inspiracji i motywacji</p>',
    '<p class="hero-lead">Chrześcijańsko-psychologiczny, interaktywny<br />kurs inspiracji i motywacji</p>'
  );
  fs.writeFileSync(t, c, 'utf8');
  console.log('Updated HTML fallback lead in:', t);
}
