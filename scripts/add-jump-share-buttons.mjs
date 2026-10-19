import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const dirs = [
  path.join(ROOT, 'akademia', 'kurscodzienny'),
  path.join(ROOT, 'kursy', 'kurscodzienny'),
];

const files = [];

for (const dir of dirs) {
  if (!fs.existsSync(dir)) continue;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isFile() && entry.name.startsWith('dzien-') && entry.name.endsWith('.html')) {
      files.push(path.join(dir, entry.name));
    } else if (entry.isDirectory() && entry.name.startsWith('dzien-')) {
      const idx = path.join(dir, entry.name, 'index.html');
      if (fs.existsSync(idx)) files.push(idx);
    }
  }
}

console.log(`Found ${files.length} lesson files.`);

const jumpSnippet = `      <!-- PRZYCISK SKOKU DO SEKCJI PODZIEL SIĘ TĄ LEKCJĄ -->
      <div class="kc-jump-to-share-wrap mb-3">
        <a href="#ccDailyShare" id="kcJumpShareBtn" class="kc-jump-to-share inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/90 border border-amber-500/40 text-amber-300 hover:bg-amber-500/20 hover:border-amber-300 hover:text-white transition-all text-xs font-semibold shadow-md min-h-[44px]" title="Przejdź do sekcji: Podziel się tą lekcją" aria-label="Przejdź do sekcji Podziel się tą lekcją">
          <i class="fa-solid fa-share-nodes text-amber-400 text-xs" aria-hidden="true"></i>
          <span>Podziel się tą lekcją</span>
          <i class="fa-solid fa-arrow-down text-amber-400 text-xs" aria-hidden="true"></i>
        </a>
      </div>

`;

let updatedCount = 0;
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('id="kcJumpShareBtn"')) {
    continue;
  }
  const match = content.match(/(\n[ \t]*)(<h1[\s\S]*?>)/);
  if (match) {
    const fullMatch = match[0];
    const indent = match[1];
    const h1Tag = match[2];
    content = content.replace(fullMatch, '\n' + jumpSnippet + indent.slice(1) + h1Tag);
    fs.writeFileSync(file, content, 'utf8');
    updatedCount++;
  } else {
    console.warn(`No <h1> found in: ${file}`);
  }
}

console.log(`Successfully updated ${updatedCount} files.`);
