import fs from 'fs';

[3, 4, 5].forEach(d => {
  const pad = String(d).padStart(2, '0');
  const paths = [
    `akademia/kurscodzienny/dzien-${pad}.html`,
    `akademia/kurscodzienny/dzien-${pad}/index.html`,
    `kursy/kurscodzienny/dzien-${pad}.html`,
    `kursy/kurscodzienny/dzien-${pad}/index.html`
  ];
  paths.forEach(fp => {
    if (!fs.existsSync(fp)) return;
    let html = fs.readFileSync(fp, 'utf8');
    const regex = /<div class="text-xs font-bold text-amber-400 font-sans uppercase tracking-wider mb-2 flex items-center gap-2">[\s\S]*?<span>Werset do zapamiętania na dziś:<\/span>[\s\S]*?<\/div>/;
    const newBlock = `<div class="text-xs font-bold text-amber-400 font-sans uppercase tracking-wider mb-2 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <i class="fa-solid fa-bookmark"></i>
            <span>Werset do zapamiętania na dziś:</span>
          </div>
          <button type="button" onclick="navigator.clipboard.writeText(this.parentElement.nextElementSibling?.textContent?.trim() || ''); alert('Skopiowano werset!');" class="text-zinc-400 hover:text-amber-300 text-xs normal-case font-sans">
            <i class="fa-regular fa-copy mr-1"></i>Kopiuj
          </button>
        </div>`;
    if (regex.test(html)) {
      html = html.replace(regex, newBlock);
      fs.writeFileSync(fp, html, 'utf8');
    }
  });
});
console.log('✅ Uzupełniono przycisk kopiowania wersetu w dniach 3, 4, 5 (regex).');
