const fs = require('fs');

function inspectBundle(name, file) {
  if (!fs.existsSync(file)) {
    console.log(`[NOT FOUND] ${name}: ${file}`);
    return;
  }
  const content = fs.readFileSync(file, 'utf8');
  console.log(`=== ${name} (${file}) ===`);
  const matches = content.match(/id:"[a-zA-Z0-9_\-]+"/g) || [];
  console.log('Sample IDs found:', matches.slice(0, 15));
  const hasHalloween = content.includes('Halloween') || content.includes('Samhain');
  console.log('Has Halloween keyword:', hasHalloween);
}

inspectBundle('Kultura', 'assets/kultura-index-CbkHVouq.js');
inspectBundle('Historia', 'assets/historia-index-T3lD4n26.js');
inspectBundle('Psychologia', 'assets/psychologia-index-Psy2026A.js');
inspectBundle('Edukacja', 'assets/edukacja-index-Edu2026A.js');
