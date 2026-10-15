import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

export function runHealthCheck() {
  const publicIndexPath = path.join(rootDir, 'data/cc-public-index.json');
  const semanticHtmlPath = path.join(rootDir, 'semantic-index.html');

  if (!fs.existsSync(publicIndexPath)) {
    throw new Error('Brak pliku data/cc-public-index.json!');
  }
  if (!fs.existsSync(semanticHtmlPath)) {
    throw new Error('Brak pliku semantic-index.html!');
  }

  const data = JSON.parse(fs.readFileSync(publicIndexPath, 'utf8'));
  const htmlStats = fs.statSync(semanticHtmlPath);

  const total = data.records.length;
  const categories = data.taxonomy.length;

  let missingDesc = 0;
  let unverified = 0;
  const urls = new Set();
  let duplicates = 0;

  for (const r of data.records) {
    if (!r.description || r.description.trim().length === 0) missingDesc++;
    if (!r.verifiedAt) unverified++;
    if (urls.has(r.url)) duplicates++;
    urls.add(r.url);
  }

  const report = {
    timestamp: new Date().toISOString(),
    status: (duplicates === 0 && missingDesc === 0 && unverified === 0) ? 'HEALTHY' : 'WARNING',
    metrics: {
      totalPublicRecords: total,
      totalCategories: categories,
      uniqueCanonicalUrls: urls.size,
      duplicateUrls: duplicates,
      recordsMissingDescription: missingDesc,
      unverifiedRecords: unverified,
      htmlFileSizeKB: Math.round(htmlStats.size / 1024),
      lastUpdated: data.updatedAt
    }
  };

  return report;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const res = runHealthCheck();
  console.log('--- CC SEMANTIC INDEX HEALTH AUDIT ---');
  console.log(JSON.stringify(res, null, 2));
}
