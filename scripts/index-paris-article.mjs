import fs from 'node:fs';

const targetItem = {
  title: 'Paryż pod godziną policyjną. Francja protestuje, a Jezus ostrzega przed oziębnięciem miłości',
  category: 'Wiadomości i artykuły',
  url: 'https://polskieradio.cc/news/paryz-godzina-policyjna-protesty-francja-biblia',
  description: 'Masowe protesty we Francji i nocna godzina policyjna w Paryżu. Fakty z 20 października 2026 oraz chrześcijańska refleksja nad gniewem, pokojem i przestrogą Jezusa z Mt 24:12: „a ponieważ bezprawie się rozmnoży, miłość wielu oziębnie”.',
  image: 'https://polskieradio.cc/images/news/paryz-godzina-policyjna-protesty-francja-biblia.jpg',
  tags: [
    'paryż',
    'francja',
    'protesty',
    'godzina policyjna',
    'oziębnięcie miłości',
    'mt 24',
    'ewangelia',
    'pokój',
    'bezpieczeństwo',
    'ccn news',
    'świat',
    '20 października 2026'
  ],
  featured: false
};

const paths = [
  'data/cc-search-index.json',
  'szukaj/catalog.json',
  'C:/Users/czark/Desktop/@ICC/LUMINA/data/cc-search-index.json',
  'C:/Users/czark/Desktop/@ICC/LUMINA/szukaj/catalog.json'
];

for (const p of paths) {
  if (!fs.existsSync(p)) continue;
  const raw = fs.readFileSync(p, 'utf8');
  const data = JSON.parse(raw);
  
  data.items = data.items.filter(i => (i.url || '').toLowerCase() !== targetItem.url.toLowerCase());
  
  const newsIdx = data.items.findIndex(i => (i.category || '').includes('Wiadomości') || (i.url || '').includes('/news/'));
  if (newsIdx >= 0) {
    data.items.splice(newsIdx, 0, targetItem);
  } else {
    data.items.unshift(targetItem);
  }
  
  data.totalItems = data.items.length;
  data.updatedAt = new Date().toISOString();
  
  fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf8');
  console.log('Updated search catalog:', p, '(totalItems:', data.totalItems, ')');
}
