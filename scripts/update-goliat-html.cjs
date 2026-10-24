const fs = require('fs');

const targets = [
  'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/kursy/pokonac-goliata.html',
  'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/kursy/pokonac-goliata/index.html',
  'C:/Users/czark/Desktop/@ICC/LUMINA/kursy/pokonac-goliata.html',
  'C:/Users/czark/Desktop/@ICC/LUMINA/kursy/pokonac-goliata/index.html'
];

for (const target of targets) {
  if (!fs.existsSync(target)) {
    console.log('Skipping missing:', target);
    continue;
  }
  let c = fs.readFileSync(target, 'utf8');
  c = c.replace(/index-[a-zA-Z0-9_-]+\.css/g, 'index-Bnbbz07S.css');
  c = c.replace(/index-[a-zA-Z0-9_-]+\.js/g, 'index-D5l_3dYT.js');
  c = c.replace('<span class="brand-emblem">♛</span>', '');
  c = c.replace(
    'Chrześcijańsko-psychologiczny, interaktywny kurs inspiracji i motywacji',
    'Chrześcijańsko-psychologiczny, interaktywny<br />kurs inspiracji i motywacji'
  );
  fs.writeFileSync(target, c, 'utf8');
  console.log('Successfully updated:', target);
}
