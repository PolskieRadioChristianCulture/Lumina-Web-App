#!/usr/bin/env node
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { TESTIMONIES } from './generate-swiadectwa.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const OUT_DIR = path.join(ROOT, 'images', 'swiadectwa');
fs.mkdirSync(OUT_DIR, { recursive: true });

const BG_SRC = path.join(ROOT, 'assets', 'pokonac-goliata-hero-bg.webp');
const BOOK_3D_SRC = path.join(ROOT, 'assets', 'pokonac-goliata-book-3d-780.webp');
const LOGO_SRC = path.join(ROOT, 'ccn-logo-square.png');

const WIDTH = 1200;
const HEIGHT = 675;

function escapeXml(unsafe) {
  return String(unsafe).replace(/[<>&'"]/g, c => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
    }
  });
}

function wrapText(text, maxCharsPerLine = 32) {
  const words = text.split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > maxCharsPerLine) {
      lines.push(cur.trim());
      cur = w;
    } else {
      cur = (cur + ' ' + w).trim();
    }
  }
  if (cur.length > 0) lines.push(cur.trim());
  return lines;
}

// 1. Generuj grafikę dla głównego Hubu (/swiadectwa)
async function generateHubHero() {
  console.log('🎨 Generowanie głównej grafiki Hero dla /swiadectwa...');
  
  // Tło z winietą i ciemnym filtrem
  const bg = await sharp(BG_SRC)
    .resize(WIDTH, HEIGHT, { fit: 'cover', position: 'center' })
    .modulate({ brightness: 0.35, saturation: 0.85 })
    .toBuffer();

  // Książka 3D po prawej stronie
  const bookHeight = 500;
  const bookResized = await sharp(BOOK_3D_SRC)
    .resize({ height: bookHeight })
    .toBuffer();
  const bookMeta = await sharp(bookResized).metadata();

  const svgOverlay = `
  <svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#F3E5AB" />
        <stop offset="50%" stop-color="#D4AF37" />
        <stop offset="100%" stop-color="#AA7C11" />
      </linearGradient>
      <linearGradient id="darkVignette" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#07090E" stop-opacity="0.95" />
        <stop offset="60%" stop-color="#07090E" stop-opacity="0.75" />
        <stop offset="100%" stop-color="#07090E" stop-opacity="0.3" />
      </linearGradient>
    </defs>

    <!-- Półprzezroczysty gradient pod tekstem -->
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#darkVignette)" />

    <!-- Ozdobna złota linia z lewej -->
    <rect x="60" y="70" width="4" height="535" fill="url(#goldGrad)" rx="2" />

    <!-- Badge górny -->
    <rect x="80" y="80" width="380" height="36" rx="18" fill="#D4AF37" fill-opacity="0.15" stroke="#D4AF37" stroke-width="1.5" />
    <text x="100" y="103" font-family="DejaVu Sans, Arial, sans-serif" font-size="13" font-weight="bold" fill="#D4AF37" letter-spacing="2">CHRISTIAN CULTURE · ŚWIADECTWA WIARY</text>

    <!-- Tytuł Główny -->
    <text x="80" y="180" font-family="DejaVu Serif, Georgia, serif" font-size="48" font-weight="bold" fill="#FFFFFF" letter-spacing="1">ŚWIADECTWA WIARY</text>
    <text x="80" y="240" font-family="DejaVu Serif, Georgia, serif" font-size="36" font-weight="bold" fill="url(#goldGrad)">&amp; MOCY BOŻEJ</text>

    <!-- Podtytuł -->
    <text x="80" y="300" font-family="DejaVu Sans, Arial, sans-serif" font-size="18" fill="#CBD5E1">Autentyczne historie nawrócenia, uzdrowienia i wolności</text>
    <text x="80" y="330" font-family="DejaVu Sans, Arial, sans-serif" font-size="18" fill="#CBD5E1">z książki Cezarego Rogowskiego „Pokonać Goliata”</text>

    <!-- Punkty kluczowe -->
    <g transform="translate(80, 380)">
      <circle cx="10" cy="10" r="4" fill="#D4AF37" />
      <text x="26" y="15" font-family="DejaVu Sans, Arial, sans-serif" font-size="15" fill="#94A3B8">19 świadectw spisanych i potwierdzonych</text>

      <circle cx="10" cy="40" r="4" fill="#D4AF37" />
      <text x="26" y="45" font-family="DejaVu Sans, Arial, sans-serif" font-size="15" fill="#94A3B8">Uwolnienie z nałogów, Boży ratunek i nowe życie</text>

      <circle cx="10" cy="70" r="4" fill="#D4AF37" />
      <text x="26" y="75" font-family="DejaVu Sans, Arial, sans-serif" font-size="15" fill="#94A3B8">CCTV Świadectwa TV Live 24/7 (16:9)</text>
    </g>

    <!-- Belka dolna -->
    <rect x="80" y="550" width="550" height="1" fill="#334155" />
    <text x="80" y="580" font-family="DejaVu Sans, Arial, sans-serif" font-size="13" font-weight="bold" fill="#D4AF37" letter-spacing="1">POLSKIERADIO.CC/SWIADECTWA</text>
    <text x="350" y="580" font-family="DejaVu Sans, Arial, sans-serif" font-size="13" fill="#64748B">Nowe Wydanie 2026 · Format 16:9</text>
  </svg>
  `;

  const svgBuffer = Buffer.from(svgOverlay);

  const bookLeft = WIDTH - bookMeta.width - 60;
  const bookTop = Math.round((HEIGHT - bookHeight) / 2);

  const finalImg = sharp(bg)
    .composite([
      { input: bookResized, left: bookLeft, top: bookTop },
      { input: svgBuffer, left: 0, top: 0 }
    ]);

  await finalImg.clone().webp({ quality: 92 }).toFile(path.join(OUT_DIR, 'hero-swiadectwa.webp'));
  await finalImg.clone().jpeg({ quality: 90, chromaSubsampling: '4:4:4' }).toFile(path.join(OUT_DIR, 'hero-swiadectwa.jpg'));
  await finalImg.clone().jpeg({ quality: 90 }).toFile(path.join(ROOT, 'images', 'og-swiadectwa.jpg'));
  console.log('✅ Zapisano hero-swiadectwa.webp, hero-swiadectwa.jpg i images/og-swiadectwa.jpg');
}

// 2. Generuj dedykowaną grafikę dla każdego z 19 świadectw
async function generateTestimonyImage(item) {
  // Tło ze zróżnicowanym tintem w zależności od kategorii
  let tintMod = { brightness: 0.30, saturation: 0.85 };
  if (item.category.includes('Uwolnienie')) {
    tintMod = { brightness: 0.28, saturation: 0.95 }; // głęboki mrok z rozbłyskiem
  } else if (item.category.includes('Cuda')) {
    tintMod = { brightness: 0.33, saturation: 0.90 }; // ciepłe światło
  } else if (item.category.includes('Nawrócenie')) {
    tintMod = { brightness: 0.32, saturation: 0.88 };
  }

  const bg = await sharp(BG_SRC)
    .resize(WIDTH, HEIGHT, { fit: 'cover', position: 'center' })
    .modulate(tintMod)
    .toBuffer();

  // Mniejsza książka w prawym narożniku
  const bookHeight = 440;
  const bookResized = await sharp(BOOK_3D_SRC)
    .resize({ height: bookHeight })
    .toBuffer();
  const bookMeta = await sharp(bookResized).metadata();

  // Formatowanie tytułu w 2–3 linijkach
  const titleLines = wrapText(item.title, 26);
  const titleTspans = titleLines.map((line, idx) => 
    `<tspan x="80" dy="${idx === 0 ? 0 : 44}">${escapeXml(line)}</tspan>`
  ).join('');

  // Skrót leadu
  const leadClean = item.lead.replace(/^„|”$/g, '').slice(0, 120) + '…';
  const leadLines = wrapText(leadClean, 44);
  const leadTspans = leadLines.map((line, idx) =>
    `<tspan x="80" dy="${idx === 0 ? 0 : 24}">${escapeXml(line)}</tspan>`
  ).join('');

  const svgOverlay = `
  <svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#F3E5AB" />
        <stop offset="50%" stop-color="#D4AF37" />
        <stop offset="100%" stop-color="#AA7C11" />
      </linearGradient>
      <linearGradient id="cardVignette" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#07090E" stop-opacity="0.96" />
        <stop offset="55%" stop-color="#07090E" stop-opacity="0.80" />
        <stop offset="100%" stop-color="#07090E" stop-opacity="0.35" />
      </linearGradient>
    </defs>

    <!-- Winieta pod tekstem -->
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#cardVignette)" />

    <!-- Ozdobny pasek boczny -->
    <rect x="55" y="60" width="4" height="555" fill="url(#goldGrad)" rx="2" />

    <!-- Plakietka ID i Kategorii -->
    <g transform="translate(80, 75)">
      <rect width="90" height="32" rx="16" fill="#D4AF37" />
      <text x="45" y="21" font-family="DejaVu Sans, Arial, sans-serif" font-size="14" font-weight="bold" fill="#000000" text-anchor="middle">${item.id}</text>
      
      <rect x="100" width="340" height="32" rx="16" fill="#D4AF37" fill-opacity="0.12" stroke="#D4AF37" stroke-width="1.2" />
      <text x="120" y="21" font-family="DejaVu Sans, Arial, sans-serif" font-size="12" font-weight="bold" fill="#D4AF37" letter-spacing="1">${escapeXml(item.category.toUpperCase())}</text>
    </g>

    <!-- Tytuł Świadectwa -->
    <text x="80" y="175" font-family="DejaVu Serif, Georgia, serif" font-size="36" font-weight="bold" fill="#FFFFFF" letter-spacing="0.5">
      ${titleTspans}
    </text>

    <!-- Cytat / Lead -->
    <text x="80" y="340" font-family="DejaVu Sans, Arial, sans-serif" font-size="15" font-style="italic" fill="#E2E8F0">
      ${leadTspans}
    </text>

    <!-- Autor i źródło -->
    <g transform="translate(80, 440)">
      <rect width="480" height="60" rx="12" fill="#0E121A" fill-opacity="0.85" stroke="#334155" stroke-width="1" />
      <circle cx="30" cy="30" r="16" fill="#D4AF37" fill-opacity="0.2" stroke="#D4AF37" stroke-width="1" />
      <text x="30" y="35" font-family="DejaVu Sans, Arial, sans-serif" font-size="14" font-weight="bold" fill="#D4AF37" text-anchor="middle">✝</text>
      
      <text x="60" y="26" font-family="DejaVu Sans, Arial, sans-serif" font-size="13" font-weight="bold" fill="#F1F5F9">${escapeXml(item.author)}</text>
      <text x="60" y="46" font-family="DejaVu Sans, Arial, sans-serif" font-size="11" fill="#94A3B8">Książka „Pokonać Goliata” · s. ${item.pages}</text>
    </g>

    <!-- Belka dolna -->
    <rect x="80" y="555" width="550" height="1" fill="#334155" />
    <text x="80" y="585" font-family="DejaVu Sans, Arial, sans-serif" font-size="12" font-weight="bold" fill="#D4AF37" letter-spacing="1">CHRISTIAN CULTURE NETWORK · POLSKIERADIO.CC</text>
    <text x="440" y="585" font-family="DejaVu Sans, Arial, sans-serif" font-size="12" fill="#64748B">Świadectwa Wiary</text>
  </svg>
  `;

  const svgBuffer = Buffer.from(svgOverlay);

  const bookLeft = WIDTH - bookMeta.width - 50;
  const bookTop = Math.round((HEIGHT - bookHeight) / 2) + 20;

  const finalImg = sharp(bg)
    .composite([
      { input: bookResized, left: bookLeft, top: bookTop },
      { input: svgBuffer, left: 0, top: 0 }
    ]);

  const webpPath = path.join(OUT_DIR, `${item.slug}.webp`);
  const jpgPath = path.join(OUT_DIR, `${item.slug}.jpg`);

  await finalImg.clone().webp({ quality: 90 }).toFile(webpPath);
  await finalImg.clone().jpeg({ quality: 88, chromaSubsampling: '4:4:4' }).toFile(jpgPath);

  console.log(`✅ [${item.id}] Wygenerowano grafikę: ${item.slug}.webp & .jpg`);
}

async function main() {
  console.log('🎨 Rozpoczynam generowanie kompletu grafik wysokiej jakości dla Świadectw Wiary...');
  await generateHubHero();
  for (const item of TESTIMONIES) {
    await generateTestimonyImage(item);
  }
  console.log('🎉 Wszystkie grafiki (Hub + 19 świadectw) wygenerowane pomyślnie w images/swiadectwa/!');
}

main().catch(err => {
  console.error('❌ Błąd generowania grafik:', err);
  process.exit(1);
});
