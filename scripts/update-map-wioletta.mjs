import fs from 'fs';

const mapPath = 'data/ecosystem-map.json';
const map = JSON.parse(fs.readFileSync(mapPath, 'utf8'));

// 1. Prepend update to updatesLog if not present
const newTopic = 'Wizytówka Autorska Wioletty Rogowskiej: Zunifikowany responsywny układ mobile bez duplikacji hero (DESIGN FREEZE), pełnoekranowe okna dialogowe (Revolut, Kontakt, Czytnik) i nawigacja 320-1440px';
if (!map.updatesLog.some(u => u.topic === newTopic)) {
  map.updatesLog.unshift({
    topic: newTopic,
    date: '2026-10-28',
    agent: 'A'
  });
}

// 2. Add node if not present
if (!map.nodes.some(n => n.id === 'wioletta-rogowska-author')) {
  map.nodes.push({
    id: 'wioletta-rogowska-author',
    branchId: 'spolecznosc',
    name: 'Wioletta Rogowska — Autorka & Czytnik Powieści',
    shortDesc: 'Oficjalna wizytówka autorska Wioletty Rogowskiej, cykl „Pardon, Czy To Miłość?” oraz czytnik online 25 rozdziałów.',
    fullDesc: 'Platforma autorska Wioletty Rogowskiej (polskieradio.cc/Wioletta) prezentująca cykl 7 powieści romantyczno-obyczajowych „Pardon, Czy To Miłość?”, pełnoekranowe moduły wsparcia Revolut (revolut.me/wioletj914), kontakt z autorką, sylwetkę twórczą oraz czytnik internetowy 25 rozdziałów Tomu I z zapamiętywaniem postępu i motywami czytania.',
    type: 'content',
    url: 'https://polskieradio.cc/Wioletta',
    status: 'active',
    lang: 'pl',
    icon: '📖',
    category: 'Społeczność & Literatura',
    verifiedDate: '2026-10-28',
    keywords: [
      'wioletta rogowska',
      'pardon czy to miłość',
      'autorka',
      'powieść',
      'czytnik',
      'romance author',
      'książki',
      'revolut'
    ],
    connections: [
      'lumina-profile',
      'lumina-main',
      'revolut-cc'
    ]
  });
}

map.lastUpdated = '2026-10-28';

fs.writeFileSync(mapPath, JSON.stringify(map, null, 2) + '\n', 'utf8');
console.log('Successfully updated data/ecosystem-map.json!');
