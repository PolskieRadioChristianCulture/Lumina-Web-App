#!/usr/bin/env node
// Naprawa szablonu lekcji Dni 24–26 (@007, 25.10.2026):
// 1) przypisania onclick do nieistniejących #kcFontToggle/#kcFontSizeUp/#kcFontSizeDown rzucały wyjątek,
//    przez co nie rejestrował się DOMContentLoaded i quiz zostawał pusty;
// 2) kod lektora/kroju/rozmiaru pisma był wewnątrz <script src=...> (przeglądarka go pomija).
import fs from 'node:fs';

const files = [24, 25, 26].flatMap((d) => ['akademia', 'kursy'].flatMap((b) => [
  `${b}/kurscodzienny/dzien-${d}.html`, `${b}/kurscodzienny/dzien-${d}/index.html`]));
const SHARE = /(<script src="\/js\/cc-daily-course-share\.js\?v=[^"]+" defer>)(\s*\n\s*\/\/ ── Lektor Audio TTS ──)/;
for (const f of files) {
  if (!fs.existsSync(f)) { console.log('brak', f); continue; }
  let s = fs.readFileSync(f, 'utf8');
  const before = s;
  for (const id of ['kcFontToggle', 'kcFontSizeUp', 'kcFontSizeDown']) {
    s = s.split(`document.getElementById('${id}').onclick =`).join(`(document.getElementById('${id}') || {}).onclick =`);
  }
  s = s.replace(SHARE, '$1</script>\n  <script>$2');
  fs.writeFileSync(f, s);
  console.log(s === before ? 'bez zmian' : 'naprawiono', f);
}
