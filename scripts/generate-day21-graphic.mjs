import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const WIDTH = 1376;
const HEIGHT = 768;

async function generateDay21Graphic() {
  const outDir = path.resolve('images/academy/daily');
  fs.mkdirSync(outDir, { recursive: true });

  const bgPath = path.resolve('assets/pokonac-goliata-hero-bg.webp');
  let baseImage;
  if (fs.existsSync(bgPath)) {
    baseImage = sharp(bgPath).resize(WIDTH, HEIGHT, { fit: 'cover' });
  } else {
    baseImage = sharp({
      create: {
        width: WIDTH,
        height: HEIGHT,
        channels: 4,
        background: { r: 10, g: 14, b: 24, alpha: 1 }
      }
    });
  }

  // Cinematic SVG overlay with golden frames, vignette, badge, and typography
  const svgOverlay = `
  <svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="vignette" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#05070B" stop-opacity="0.85" />
        <stop offset="35%" stop-color="#0E121A" stop-opacity="0.5" />
        <stop offset="70%" stop-color="#07090E" stop-opacity="0.7" />
        <stop offset="100%" stop-color="#05070B" stop-opacity="0.95" />
      </linearGradient>

      <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#D4AF37" />
        <stop offset="50%" stop-color="#F3E5AB" />
        <stop offset="100%" stop-color="#AA7C11" />
      </linearGradient>

      <linearGradient id="badgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#2A200A" stop-opacity="0.9" />
        <stop offset="100%" stop-color="#141108" stop-opacity="0.95" />
      </linearGradient>

      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.9" />
      </filter>
    </defs>

    <!-- Base Tint Vignette -->
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#vignette)" />

    <!-- Subtle Golden Border -->
    <rect x="24" y="24" width="${WIDTH - 48}" height="${HEIGHT - 48}" rx="16" fill="none" stroke="#D4AF37" stroke-opacity="0.35" stroke-width="2" />
    <rect x="32" y="32" width="${WIDTH - 64}" height="${HEIGHT - 64}" rx="12" fill="none" stroke="#D4AF37" stroke-opacity="0.15" stroke-width="1" />

    <!-- Top Badge -->
    <g transform="translate(60, 60)">
      <rect width="480" height="42" rx="21" fill="url(#badgeGrad)" stroke="#D4AF37" stroke-width="1.5" filter="url(#shadow)" />
      <circle cx="24" cy="21" r="6" fill="#D4AF37" />
      <text x="42" y="27" font-family="'Cinzel', 'DejaVu Sans', serif" font-size="14" font-weight="bold" fill="#F3E5AB" letter-spacing="2">
        Z BIBLIĄ ZA PAN BRAT • DZIEŃ 21
      </text>
    </g>

    <!-- Scripture Reference Tag -->
    <g transform="translate(1080, 60)">
      <rect width="236" height="42" rx="21" fill="#0A0D14" stroke="#D4AF37" stroke-opacity="0.5" stroke-width="1" />
      <text x="118" y="26" font-family="'DejaVu Sans', sans-serif" font-size="13" font-weight="bold" fill="#D4AF37" text-anchor="middle" letter-spacing="1">
        RDZ 29:1 – 30:43
      </text>
    </g>

    <!-- Main Title -->
    <text x="60" y="360" font-family="'Cinzel', 'DejaVu Sans', serif" font-size="54" font-weight="900" fill="#FFFFFF" filter="url(#shadow)" letter-spacing="1">
      BÓG DZIAŁA POŚRÓD
    </text>
    <text x="60" y="430" font-family="'Cinzel', 'DejaVu Sans', serif" font-size="54" font-weight="900" fill="url(#goldGrad)" filter="url(#shadow)" letter-spacing="1">
      NIEDOSKONAŁYCH RODZIN
    </text>

    <!-- Subtitle -->
    <text x="62" y="490" font-family="'DejaVu Sans', 'Inter', sans-serif" font-size="22" font-weight="400" fill="#CBD5E1" letter-spacing="0.5">
      Miłość, oszustwo, rywalizacja i Boża wierność • Jakub, Rachela, Lea i narodziny Judy
    </text>

    <!-- Key Verse Quote Box -->
    <g transform="translate(60, 560)">
      <rect width="1256" height="120" rx="16" fill="#0A0D14" fill-opacity="0.85" stroke="#D4AF37" stroke-opacity="0.4" stroke-width="1.5" filter="url(#shadow)" />
      <line x1="0" y1="0" x2="0" y2="120" stroke="#D4AF37" stroke-width="6" />
      <text x="36" y="52" font-family="'DejaVu Serif', 'Georgia', serif" font-size="20" font-style="italic" fill="#F1E7D0">
        „Gdy PAN widział, że Lea była mniej kochana, otworzył jej łono (...)
      </text>
      <text x="36" y="86" font-family="'DejaVu Serif', 'Georgia', serif" font-size="20" font-style="italic" fill="#F3E5AB">
        Tym razem będę sławić PANA! Dlatego nazwała go Juda.”
      </text>
      <text x="1220" y="86" font-family="'DejaVu Sans', sans-serif" font-size="14" font-weight="bold" fill="#D4AF37" text-anchor="end">
        — KSIĘGA RODZAJU 29:31, 35
      </text>
    </g>

    <!-- Footer Attribution -->
    <text x="60" y="730" font-family="'DejaVu Sans', sans-serif" font-size="12" fill="#94A3B8" letter-spacing="1">
      CHRISTIAN CULTURE • LUMINA BIBLE ACADEMY • 21 PAŹDZIERNIKA 2026
    </text>
  </svg>`;

  const finalJpg = path.join(outDir, 'kc_day_21_bog_dziala_niedoskonale_rodziny.jpg');
  await baseImage
    .composite([{ input: Buffer.from(svgOverlay), blend: 'over' }])
    .jpeg({ quality: 92, mozjpeg: true })
    .toFile(finalJpg);

  console.log(`✅ Wygenerowano grafikę lekcji 21: ${finalJpg}`);

  // Aliasy graficzne dla kompatybilności wstecznej
  const aliasJpg = path.join(outDir, 'kc_day_21_jakub_rachela_lea.jpg');
  fs.copyFileSync(finalJpg, aliasJpg);
  console.log(`✅ Utworzono alias: ${aliasJpg}`);
}

generateDay21Graphic().catch(err => {
  console.error('Błąd generowania grafiki:', err);
  process.exit(1);
});
