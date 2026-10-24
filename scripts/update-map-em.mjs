import fs from 'fs';

const p = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/data/ecosystem-map.json';
const data = JSON.parse(fs.readFileSync(p, 'utf8'));

data.updatesLog.unshift({
  topic: 'eM • Motywacja CC: Publikacja artykułu Cezarego Rogowskiego „Kim jestem, gdy nikt nie patrzy? Uczciwość i sumienie według Biblii” (/news/kim-jestem-gdy-nikt-nie-patrzy-uczciwosc-sumienie)',
  date: '2026-10-24',
  agent: 'A'
});

fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf8');
console.log('Updated ecosystem-map.json successfully.');
