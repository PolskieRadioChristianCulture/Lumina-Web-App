// scripts/sync-apokalipsa29-and-search.mjs
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve('.');
const MIRROR = 'C:\\Users\\czark\\Desktop\\@ICC\\LUMINA';

// 1. Zaktualizuj data/cc-search-index.json
const searchIndexPath = path.join(ROOT, 'data', 'cc-search-index.json');
if (fs.existsSync(searchIndexPath)) {
  const searchIndex = JSON.parse(fs.readFileSync(searchIndexPath, 'utf8'));
  const items = searchIndex.items || searchIndex;
  const hasL29 = Array.isArray(items) && items.some(item => item.url === '/akademia/apokalipsa/lekcja-29' || item.id === 'apok-lekcja-29');
  if (!hasL29 && Array.isArray(items)) {
    items.push({
      id: 'apok-lekcja-29',
      title: 'Lekcja 29: Przesłanie z kosmosu cz. 2 i cz. 3 — Drugi i trzeci anioł (Ap 14:8–13)',
      category: 'Akademia Biblijna',
      group: 'Kino VOD & Kanały',
      description: 'Apokalipsa 14:8–13 — Upadek Babilonu, ostrzeżenie przed zwiedzeniem i znamieniem bestii oraz cierpliwość świętych. Wykłady: Pr. Wincenty Sieja (Studio Dobrego Słowa).',
      url: '/akademia/apokalipsa/lekcja-29',
      keywords: ['apokalipsa', 'lekcja 29', 'drugi anioł', 'trzeci anioł', 'babilon', 'znamię bestii', 'wincenty sieja', 'studio dobrego słowa', 'przesłanie z kosmosu']
    });
    if (searchIndex.items) {
      searchIndex.totalItems = items.length;
      searchIndex.updatedAt = new Date().toISOString();
    }
    fs.writeFileSync(searchIndexPath, JSON.stringify(searchIndex, null, 2), 'utf8');
    console.log('✅ Dodano Lekcję 29 Apokalipsy do data/cc-search-index.json');
  }
}

// 2. Zaktualizuj szukaj/catalog.json
const catalogPath = path.join(ROOT, 'szukaj', 'catalog.json');
if (fs.existsSync(catalogPath)) {
  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
  const items = catalog.items || catalog;
  const hasL29 = Array.isArray(items) && items.some(item => item.url === '/akademia/apokalipsa/lekcja-29' || item.id === 'apok-lekcja-29');
  if (!hasL29 && Array.isArray(items)) {
    items.push({
      id: 'apok-lekcja-29',
      title: 'Lekcja 29: Przesłanie z kosmosu cz. 2 i cz. 3 — Drugi i trzeci anioł (Ap 14:8–13)',
      category: 'Akademia Biblijna',
      group: 'Kino VOD & Kanały',
      description: 'Apokalipsa 14:8–13 — Upadek Babilonu, ostrzeżenie przed zwiedzeniem i znamieniem bestii oraz cierpliwość świętych. Studio Dobrego Słowa.',
      url: '/akademia/apokalipsa/lekcja-29',
      keywords: ['apokalipsa', 'lekcja 29', 'drugi anioł', 'trzeci anioł', 'babilon', 'znamię bestii', 'wincenty sieja', 'studio dobrego słowa']
    });
    if (catalog.items) {
      catalog.totalItems = items.length;
      catalog.updatedAt = new Date().toISOString();
    }
    fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2), 'utf8');
    console.log('✅ Dodano Lekcję 29 Apokalipsy do szukaj/catalog.json');
  }
}

// 3. Zaktualizuj data/ecosystem-map.json (@m)
const mapPath = path.join(ROOT, 'data', 'ecosystem-map.json');
if (fs.existsSync(mapPath)) {
  const mapData = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
  if (Array.isArray(mapData.recentUpdates)) {
    mapData.recentUpdates.unshift({
      date: '2026-10-25',
      agent: 'A',
      title: 'Akademia: Lekcja 29 Apokalipsy (Studio Dobrego Słowa) + Ujednolicenie Kursu Codziennego wg Dnia 1',
      scope: 'akademia/apokalipsa, akademia/kurscodzienny'
    });
    if (mapData.recentUpdates.length > 30) {
      mapData.recentUpdates = mapData.recentUpdates.slice(0, 30);
    }
  }
  mapData.lastUpdated = '2026-10-25';
  fs.writeFileSync(mapPath, JSON.stringify(mapData, null, 2), 'utf8');
  console.log('✅ Zaktualizowano Mapę Ekosystemu @m (data/ecosystem-map.json)');
}

// 4. Synchronizacja do mirrora LUMINA
function copyDirRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

if (fs.existsSync(MIRROR)) {
  console.log('Rozpoczynam synchronizację do mirrora LUMINA...');
  
  // Pliki pojedyncze
  const filesToCopy = [
    'akademia.html',
    'kursy.html',
    'js/lumina-courses-engine.js',
    'data/kurs-apokalipsa-baza-pelna.json',
    'data/cc-search-index.json',
    'szukaj/catalog.json',
    'data/ecosystem-map.json'
  ];
  filesToCopy.forEach(f => {
    const src = path.join(ROOT, f);
    const dest = path.join(MIRROR, f);
    if (fs.existsSync(src)) {
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.copyFileSync(src, dest);
    }
  });

  // Katalogi
  copyDirRecursive(path.join(ROOT, 'akademia'), path.join(MIRROR, 'akademia'));
  copyDirRecursive(path.join(ROOT, 'kursy'), path.join(MIRROR, 'kursy'));

  console.log('✅ Zsynchronizowano pliki do mirrora LUMINA');
}
