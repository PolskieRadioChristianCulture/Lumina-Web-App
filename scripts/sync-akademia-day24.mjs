#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc';
const LUMINA_ROOT = 'C:/Users/czark/Desktop/@ICC/LUMINA';

const akademiaPath = path.join(ROOT, 'akademia.html');
const kurscodziennyPath = path.join(ROOT, 'akademia/kurscodzienny.html');
const kursyHtml = path.join(ROOT, 'kursy/kurscodzienny.html');
const kursyIndex = path.join(ROOT, 'kursy/kurscodzienny/index.html');

console.log('🔄 Rozpoczynam synchronizację Akademii i Kursu Codziennego dla Dnia 24...');

// 1. Zaktualizuj akademia.html
if (fs.existsSync(akademiaPath)) {
  let akademiaHtml = fs.readFileSync(akademiaPath, 'utf8');

  // A. Przyciski Hero
  akademiaHtml = akademiaHtml.replace(
    /href="\/akademia\/kurscodzienny\/dzien-\d+" class="cin-btn-primary min-h-\[48px\]">\s*<span>CZYTAJ DZIEŃ \d+ \([^)]+\)<\/span>/g,
    'href="/akademia/kurscodzienny/dzien-24" class="cin-btn-primary min-h-[48px]">\n            <span>CZYTAJ DZIEŃ 24 (24 PAŹDZIERNIKA)</span>'
  );
  akademiaHtml = akademiaHtml.replace(
    /href="\/akademia\/kurscodzienny\/dzien-\d+" class="cin-btn-secondary min-h-\[48px\]">\s*<span>←? ?DZIEŃ \d+<\/span>/g,
    'href="/akademia/kurscodzienny/dzien-23" class="cin-btn-secondary min-h-[48px]">\n            <span>← DZIEŃ 23</span>'
  );

  // B. Badge licznika dni
  akademiaHtml = akademiaHtml.replace(
    /Dni 1–\d+ z 31 Dostępne[^\n<]*/g,
    'Dni 1–24 z 31 Dostępne (24 Października 2026)'
  );

  fs.writeFileSync(akademiaPath, akademiaHtml, 'utf8');
  console.log('✅ Zaktualizowano akademia.html');
}

// 2. Zaktualizuj akademia/kurscodzienny.html
if (fs.existsSync(kurscodziennyPath)) {
  let kcHtml = fs.readFileSync(kurscodziennyPath, 'utf8');

  kcHtml = kcHtml.replace(
    /href="\/akademia\/kurscodzienny\/dzien-\d+" class="cin-btn-primary min-h-\[48px\]">\s*<span>CZYTAJ DZIEŃ \d+ \([^)]+\)<\/span>/g,
    'href="/akademia/kurscodzienny/dzien-24" class="cin-btn-primary min-h-[48px]">\n          <span>CZYTAJ DZIEŃ 24 (24 PAŹDZIERNIKA)</span>'
  );
  kcHtml = kcHtml.replace(
    /href="\/akademia\/kurscodzienny\/dzien-\d+" class="cin-btn-secondary min-h-\[48px\]">\s*<span>←? ?DZIEŃ \d+<\/span>/g,
    'href="/akademia/kurscodzienny/dzien-23" class="cin-btn-secondary min-h-[48px]">\n          <span>← DZIEŃ 23</span>'
  );
  kcHtml = kcHtml.replace(
    /Dni 1–\d+ z 31 Dostępne[^\n<]*/g,
    'Dni 1–24 z 31 Dostępne (24 Października 2026)'
  );

  fs.writeFileSync(kurscodziennyPath, kcHtml, 'utf8');
  console.log('✅ Zaktualizowano akademia/kurscodzienny.html');
}

// 3. Zaktualizuj kursy/kurscodzienny.html i index.html
[kursyHtml, kursyIndex].forEach(p => {
  if (fs.existsSync(p)) {
    let html = fs.readFileSync(p, 'utf8');
    html = html.replace(
      /href="\/akademia\/kurscodzienny\/dzien-\d+" class="cin-btn-primary min-h-\[48px\]">\s*<span>CZYTAJ DZIEŃ \d+ \([^)]+\)<\/span>/g,
      'href="/akademia/kurscodzienny/dzien-24" class="cin-btn-primary min-h-[48px]">\n          <span>CZYTAJ DZIEŃ 24 (24 PAŹDZIERNIKA)</span>'
    );
    html = html.replace(
      /href="\/akademia\/kurscodzienny\/dzien-\d+" class="cin-btn-secondary min-h-\[48px\]">\s*<span>←? ?DZIEŃ \d+<\/span>/g,
      'href="/akademia/kurscodzienny/dzien-23" class="cin-btn-secondary min-h-[48px]">\n          <span>← DZIEŃ 23</span>'
    );
    html = html.replace(
      /Dni 1–\d+ z 31 Dostępne[^\n<]*/g,
      'Dni 1–24 z 31 Dostępne (24 Października 2026)'
    );
    fs.writeFileSync(p, html, 'utf8');
    console.log(`✅ Zaktualizowano ${p}`);
  }
});

// 4. Kopiuj do LUMINA mirror
[akademiaPath, kurscodziennyPath, kursyHtml, kursyIndex].forEach(src => {
  const rel = path.relative(ROOT, src);
  const dst = path.join(LUMINA_ROOT, rel);
  if (fs.existsSync(src)) {
    const dir = path.dirname(dst);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.copyFileSync(src, dst);
    console.log(`✅ Skopiowano do LUMINA: ${rel}`);
  }
});

console.log('🎉 Synchronizacja CTA i licznika dla Dnia 24 zakończona!');
