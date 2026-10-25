import fs from 'fs';
import path from 'path';

const JOMA_DIR = 'C:\\Users\\czark\\Desktop\\Misja CC\\JOMA_SHARED_MEMORY';

const entry = `## 2026-10-25 07:15 — Dyrektywa Dowódcy: Żelazny Standard Stron Kursu Codziennego wg Lekcji 1 + Nowa Lekcja 29 Apokalipsy (Studio Dobrego Słowa) (JOMA-D048) ✅
Antigravity (\`@A001\` / \`@001\`): Zrealizowano dyspozycję Dowódcy Nazira:
1. **Żelazny Standard Kursu Codziennego („Z Biblią za Pan Brat”) oparty w 100% na Lekcji 1 (\`dzien-01.html\`):**
   - **Mandat w @joma:** Każda obecna i przyszła lekcja Kursu Codziennego Pisma Świętego MUSI bezwzględnie zachowywać identyczny standard strony, oparty na wzorcu Lekcji 1 (\`dzien-01.html\`):
     - Nagłówek \`.ak-header\` ze zunifikowanymi ikonowymi kontrolkami 38–44px (przełącznik fontu \`btn-reader-font\` Lora/Inter, motyw \`btn-theme-toggle\` Jasny/Ciemny, zoom A-/A+, lektor audio TTS \`btn-audio-tts\`, serce Patronite, widget autoryzacji \`#cc-auth-nav-container\`).
     - Dołączone skrypty/style: \`cc-global-auth.js\`, \`lumina-courses.css\`, \`cc-course-theme.js\`.
     - Breadcrumb strip \`<nav class="bg-[#0A0D14] border-b border-brand-line ...">\` z mobilnym selektorem Lora, linkiem \`Spis Dni\` oraz nawigacją Dzień N-1 / Dzień N+1.
     - Hero lekcji z gradientem radialnym, etykietą \`MIESIĄC 1 • DZIEŃ N\`, przyciskiem skoku \`#kcJumpShareBtn\` (\`Podziel się tą lekcją ↓\`), formatem \`h1\`, podtytułem, meta-barem z linkiem do \`mojabiblia\`, panoramą 16:9 z pełnym cieniem, myślą przewodnią w \`.kc-card\` i wersetem pamięciowym \`.kc-verse-box\` z przyciskiem kopiowania i referencją UBG.
     - Pełny silnik JS: Lektor Audio TTS (\`toggleAudioLesson\`, \`updateTtsUi\`), Master Reader Typography Controller (\`initReaderSettings\`, \`toggleReaderFont\`, \`applyReaderFont\`, \`adjustFontSize\`, \`applyReaderZoom\`), checklist i stan ukończenia dnia.
   - **Wdrożenie we wszystkich lekcjach:** Zaktualizowano i ujednolicono wszystkie Dni 1–25 w 4 ścieżkach Clean URLs (\`akademia/kurscodzienny/\` i \`kursy/kurscodzienny/\`) oraz mirrorze LUMINA. Audyt potwierdził 100% zgodności parametrów \`akHeader\`, \`reader\`, \`tts\`, \`jump\`, \`theme\`, \`verseCopy\`, \`masterStyles\`.
2. **Akademia Biblijna — Apokalipsa (Lekcja 29: Przesłanie z kosmosu cz. 2 i cz. 3 — Drugi i trzeci anioł):**
   - Wideo Studio Dobrego Słowa (pastor Wincenty Sieja): YouTube ID \`gIKzt5aW9-k\`.
   - Zakres biblijny: Apokalipsa 14:8–13 (Upadek Babilonu, wino zwiedzenia, ostrzeżenie przed pokłonem bestii i jej znamieniem, cierpliwość i wiara świętych).
   - Opublikowano pełną podstronę Lekcji 29 z 15 sekcjami kanonicznymi i quizem w \`akademia/apokalipsa/\` oraz \`kursy/apokalipsa/\`.
   - Zaktualizowano nawigację w Lekcji 28: przycisk prowadzi do Lekcji 29, usunięto plakietkę PREMIERA.
   - Zaktualizowano katalogi na \`polskieradio.cc/akademia#apokalipsa\` oraz \`polskieradio.cc/kursy\`: liczniki zaktualizowane do 29 lekcji, Lekcja 29 oznaczona jako PREMIERA.
3. **Indeksy Ekosystemu:**
   - Dodano Lekcję 29 do wyszukiwarki \`@w\` (\`data/cc-search-index.json\`, \`szukaj/catalog.json\`).
   - Zaktualizowano Mapę Ekosystemu \`@m\` (\`data/ecosystem-map.json\`, symbol \`A\`).
\n`;

// 1. JOMA_STATUS.md
const statusPath = path.join(JOMA_DIR, 'JOMA_STATUS.md');
if (fs.existsSync(statusPath)) {
  let status = fs.readFileSync(statusPath, 'utf8');
  status = status.replace('# JOMA STATUS — Protokół Wspólnej Pamięci\n\n', '# JOMA STATUS — Protokół Wspólnej Pamięci\n\n' + entry);
  fs.writeFileSync(statusPath, status, 'utf8');
  console.log('✅ Zaktualizowano JOMA_STATUS.md');
}

// 2. JOMA_HANDOFFS.md
const handoffsPath = path.join(JOMA_DIR, 'JOMA_HANDOFFS.md');
if (fs.existsSync(handoffsPath)) {
  let handoffs = fs.readFileSync(handoffsPath, 'utf8');
  handoffs = handoffs.replace('# JOMA HANDOFFS — Raporty Przekazania Prac\n\n', '# JOMA HANDOFFS — Raporty Przekazania Prac\n\n' + entry);
  fs.writeFileSync(handoffsPath, handoffs, 'utf8');
  console.log('✅ Zaktualizowano JOMA_HANDOFFS.md');
}

// 3. DLA_ANTIGRAVITY.md
const dlaPath = path.join(JOMA_DIR, 'DLA_ANTIGRAVITY.md');
if (fs.existsSync(dlaPath)) {
  let dla = fs.readFileSync(dlaPath, 'utf8');
  const ruleNote = `\n### ⚠️ Żelazna Dyrektywa: Standard Wszystkich Lekcji Kursu Codziennego wg Lekcji 1 (2026-10-25)\n- **Wzorzec Nietykalny:** Każda obecna i przyszła lekcja Kursu Codziennego („Z Biblią za Pan Brat”) MUSI bezwzględnie posiadać standard strony w 100% oparty na Lekcji 1 (\`dzien-01.html\`): nagłówek \`.ak-header\` ze wszystkimi kontrolkami (font Lora/Inter, motyw, zoom A-/A+, lektor TTS, Patronite, auth), breadcrumb strip, przycisk skoku \`#kcJumpShareBtn\`, ilustracja 16:9, myśl przewodnia, werset pamięciowy z kopiowaniem oraz silniki JS Master Reader i Audio TTS.\n`;
  dla = dla + ruleNote;
  fs.writeFileSync(dlaPath, dla, 'utf8');
  console.log('✅ Zaktualizowano DLA_ANTIGRAVITY.md');
}

// 4. CC_AGENT_COMMON_STANDARD.md
const commonPath = path.join(JOMA_DIR, 'CC_AGENT_COMMON_STANDARD.md');
if (fs.existsSync(commonPath)) {
  let common = fs.readFileSync(commonPath, 'utf8');
  const commonRule = `\n## 13. Żelazny Standard Stron Kursu Codziennego Pisma Świętego (Dyrektywa 2026-10-25)
Każda obecna i przyszła lekcja Kursu Codziennego („Z Biblią za Pan Brat”) na \`polskieradio.cc/akademia/kurscodzienny\` MUSI bezwzględnie zachowywać jednolity standard strony wzorowany na Lekcji 1 (\`dzien-01.html\`):
1. **Nagłówek:** \`.ak-header\` z kompletem przycisków (Lora/Inter, Jasny/Ciemny, Zoom A-/A+, Lektor Audio TTS, Patronite, \`#cc-auth-nav-container\`).
2. **Nawigacja:** Breadcrumb strip ze skrótem Spis Dni, mobilnym przełącznikiem fontu i linkami do sąsiednich dni.
3. **Hero:** Gradient radialny, etykieta dnia, przycisk skoku \`#kcJumpShareBtn\` (\`Podziel się tą lekcją ↓\`), ilustracja 16:9 z pełnym cieniem, myśl przewodnia oraz werset pamięciowy z funkcją kopiowania do schowka.
4. **Interaktywność i Dostępność:** Pełny kontroler Master Reader Typography (\`initReaderSettings\`) oraz odtwarzacz lektora TTS (\`toggleAudioLesson\`). Zakaz oddawania podstron ze zredukowanymi lub niespójnymi nagłówkami.\n`;
  common = common + commonRule;
  fs.writeFileSync(commonPath, common, 'utf8');
  console.log('✅ Zaktualizowano CC_AGENT_COMMON_STANDARD.md');
}
