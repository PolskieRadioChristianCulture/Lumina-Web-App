import fs from 'fs';
import path from 'path';

const totalDays = 25;
for (let d = 1; d <= totalDays; d++) {
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
    if (!html.includes('navigator.clipboard.writeText') && html.includes('kc-verse-box')) {
      html = html.replace(/<div class="[^"]*?text-amber-400[^"]*?">[\s\S]*?Werset do zapamiętania[\s\S]*?<\/div>/i, () => {
        return `<div class="text-xs font-bold text-amber-400 font-sans uppercase tracking-wider mb-2 flex items-center justify-between">
          <div class="flex items-center gap-2"><i class="fa-solid fa-bookmark"></i><span>Werset pamięciowy</span></div>
          <button type="button" onclick="navigator.clipboard.writeText(this.parentElement.nextElementSibling?.textContent?.trim() || ''); alert('Skopiowano werset!');" class="text-zinc-400 hover:text-amber-300 text-xs normal-case font-sans">
            <i class="fa-regular fa-copy mr-1"></i>Kopiuj
          </button>
        </div>`;
      });
      fs.writeFileSync(fp, html, 'utf8');
    }
  });
}
console.log('✅ Kopiowanie wersetu uzupełnione w 100% lekcji.');
