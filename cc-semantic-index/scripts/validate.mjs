import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

export function validateRecords(records) {
  const taxonomyPath = path.join(rootDir, 'cc-semantic-index/config/taxonomy.json');
  const exclusionsPath = path.join(rootDir, 'cc-semantic-index/config/exclusions.json');

  const taxonomy = JSON.parse(fs.readFileSync(taxonomyPath, 'utf8'));
  const exclusions = JSON.parse(fs.readFileSync(exclusionsPath, 'utf8'));

  const validCategories = new Set(taxonomy.categories.map(c => c.id));
  const blockedPrefixes = exclusions.blockedPrefixes || [];
  const blockedUrls = new Set(exclusions.blockedUrls || []);

  const errors = [];
  const seenIds = new Set();
  const seenUrls = new Set();

  for (let i = 0; i < records.length; i++) {
    const r = records[i];
    const prefix = `Rekord #${i} [${r.id || 'brak ID'}]:`;

    // 1. Wymagane pola
    if (!r.id || typeof r.id !== 'string') errors.push(`${prefix} Brak poprawnego 'id'`);
    if (!r.title || typeof r.title !== 'string') errors.push(`${prefix} Brak poprawnego 'title'`);
    if (!r.url || typeof r.url !== 'string') errors.push(`${prefix} Brak poprawnego 'url'`);
    if (!r.description || typeof r.description !== 'string') errors.push(`${prefix} Brak 'description'`);
    if (!r.primaryCategory) errors.push(`${prefix} Brak 'primaryCategory'`);

    // 2. Kategoria
    if (r.primaryCategory && !validCategories.has(r.primaryCategory)) {
      errors.push(`${prefix} Nieznana kategoria: '${r.primaryCategory}'`);
    }

    // 3. Unikalność ID i URL
    if (seenIds.has(r.id)) {
      errors.push(`${prefix} Zduplikowany identyfikator: '${r.id}'`);
    }
    seenIds.add(r.id);

    if (seenUrls.has(r.url)) {
      errors.push(`${prefix} Zduplikowany kanoniczny URL: '${r.url}'`);
    }
    seenUrls.add(r.url);

    // 4. Bezpieczeństwo i blokady prywatności
    if (blockedUrls.has(r.url)) {
      errors.push(`${prefix} URL znajduje się na liście zablokowanych: '${r.url}'`);
    }

    const lowerUrl = (r.url || '').toLowerCase();
    for (const bPrefix of blockedPrefixes) {
      if (lowerUrl.includes(bPrefix.toLowerCase())) {
        errors.push(`${prefix} URL narusza regułę prywatności '${bPrefix}': '${r.url}'`);
      }
    }

    // Zakaz localhost i IP prywatnych
    if (lowerUrl.includes('localhost') || lowerUrl.includes('127.0.0.1') || lowerUrl.includes('192.168.')) {
      errors.push(`${prefix} URL wskazuje na sieć lokalną: '${r.url}'`);
    }

    // 5. Kodowanie UTF-8 (brak znaków zapytania w rombach \uFFFD)
    if (r.title.includes('\uFFFD') || r.description.includes('\uFFFD')) {
      errors.push(`${prefix} Wykryto uszkodzone kodowanie UTF-8 (znaki zastępcze)`);
    }
  }

  return {
    valid: errors.length === 0,
    totalRecords: records.length,
    errors
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { normalizeCatalogItems } = await import('./normalize.mjs');
  const items = normalizeCatalogItems();
  const res = validateRecords(items);
  if (!res.valid) {
    console.error(`BŁĘDY WALIDACJI (${res.errors.length}):`, res.errors);
    process.exit(1);
  }
  console.log(`WALIDACJA SUKCES: ${res.totalRecords} rekordów przeszło wszystkie reguły bezpieczeństwa i schematu.`);
}
