const fs = require('fs');
const repo = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc';
const luminaRepo = 'C:/Users/czark/Desktop/@ICC/LUMINA';

const p1 = repo + '/data/ecosystem-map.json';
const p2 = luminaRepo + '/data/ecosystem-map.json';

const mapData = JSON.parse(fs.readFileSync(p1, 'utf8'));
const newEntry = {
  topic: 'Akademia Biblijna: Publikacja Dnia 23 Kursu Codziennego „Pojednanie i powrót do Betel” (Rdz 33–35) wraz z kompletem 5 wersji redakcyjnych',
  date: '2026-10-23',
  agent: 'A'
};

mapData.updatesLog.unshift(newEntry);
fs.writeFileSync(p1, JSON.stringify(mapData, null, 2), 'utf8');
if (fs.existsSync(p2)) {
  fs.writeFileSync(p2, JSON.stringify(mapData, null, 2), 'utf8');
}
console.log('Added Day 23 to ecosystem-map.json updatesLog successfully!');
