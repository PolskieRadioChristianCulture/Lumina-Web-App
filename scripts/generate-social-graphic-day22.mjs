import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const inputImagePath = 'images/academy/daily/kc_day_22_jakub_walczy_z_bogiem_jabbok.jpg';

async function generateSocialGraphics() {
  // 1. Generate 1:1 (1080x1080)
  const svgOverlay1080 = `
  <svg width="1080" height="1080" viewBox="0 0 1080 1080" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="topVignette" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#000000" stop-opacity="0.85"/>
        <stop offset="35%" stop-color="#000000" stop-opacity="0.5"/>
        <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
      </linearGradient>
      <linearGradient id="bottomVignette" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#000000" stop-opacity="0"/>
        <stop offset="50%" stop-color="#000000" stop-opacity="0.6"/>
        <stop offset="100%" stop-color="#000000" stop-opacity="0.95"/>
      </linearGradient>
    </defs>
    
    <!-- Top Gradient -->
    <rect x="0" y="0" width="1080" height="360" fill="url(#topVignette)" />
    
    <!-- Top Header -->
    <rect x="290" y="45" width="500" height="42" rx="21" fill="#000000" fill-opacity="0.65" stroke="#C4A35A" stroke-width="1.5" />
    <text x="540" y="72" font-family="'Cinzel', 'Playfair Display', Georgia, serif" font-size="19" font-weight="700" fill="#E2CC9A" letter-spacing="3" text-anchor="middle">Z BIBLIĄ ZA PAN BRAT • DZIEŃ 22</text>
    
    <text x="540" y="140" font-family="'Cinzel', 'Playfair Display', Georgia, serif" font-size="44" font-weight="800" fill="#FFFFFF" text-anchor="middle" filter="drop-shadow(0px 3px 12px rgba(0,0,0,0.9))">Jakub walczy z Bogiem</text>
    <text x="540" y="180" font-family="'Inter', -apple-system, sans-serif" font-size="22" font-weight="600" fill="#C4A35A" letter-spacing="1" text-anchor="middle">Przemiana człowieka nad Jabbokiem • Rdz 31–32</text>

    <!-- Bottom Gradient -->
    <rect x="0" y="700" width="1080" height="380" fill="url(#bottomVignette)" />
    
    <!-- Scripture quote banner -->
    <rect x="140" y="860" width="800" height="64" rx="12" fill="#000000" fill-opacity="0.75" stroke="#C4A35A" stroke-width="1.5" />
    <text x="540" y="900" font-family="'Cinzel', Georgia, serif" font-size="23" font-style="italic" font-weight="600" fill="#FFFFFF" text-anchor="middle">„Nie puszczę Cię, dopóki mi nie pobłogosławisz”</text>

    <!-- Bottom Verified URL Banner -->
    <rect x="90" y="948" width="900" height="80" rx="16" fill="#050505" fill-opacity="0.9" stroke="#C4A35A" stroke-width="2" />
    <text x="140" y="996" font-family="'Cinzel', serif" font-size="20" font-weight="700" fill="#C4A35A" letter-spacing="2">CHRISTIAN CULTURE</text>
    <text x="940" y="996" font-family="'Inter', -apple-system, monospace, sans-serif" font-size="22" font-weight="700" fill="#FFFFFF" text-anchor="end">polskieradio.cc/akademia/kurscodzienny/dzien-22</text>
  </svg>
  `;

  const bg1080 = await sharp(inputImagePath)
    .resize(1080, 1080, { fit: 'cover', position: 'center' })
    .toBuffer();

  await sharp(bg1080)
    .composite([{ input: Buffer.from(svgOverlay1080), top: 0, left: 0 }])
    .jpeg({ quality: 92 })
    .toFile('images/social/fb_day_22_jakub_jabbok_1080x1080.jpg');

  console.log('✅ Generated 1080x1080: images/social/fb_day_22_jakub_jabbok_1080x1080.jpg');

  // 2. Generate 4:5 (1080x1350)
  const svgOverlay1350 = `
  <svg width="1080" height="1350" viewBox="0 0 1080 1350" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="topVignette" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#000000" stop-opacity="0.9"/>
        <stop offset="40%" stop-color="#000000" stop-opacity="0.55"/>
        <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
      </linearGradient>
      <linearGradient id="bottomVignette" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#000000" stop-opacity="0"/>
        <stop offset="45%" stop-color="#000000" stop-opacity="0.65"/>
        <stop offset="100%" stop-color="#000000" stop-opacity="0.95"/>
      </linearGradient>
    </defs>
    
    <!-- Top Gradient -->
    <rect x="0" y="0" width="1080" height="440" fill="url(#topVignette)" />
    
    <!-- Top Header Badge -->
    <rect x="290" y="60" width="500" height="46" rx="23" fill="#000000" fill-opacity="0.7" stroke="#C4A35A" stroke-width="1.8" />
    <text x="540" y="90" font-family="'Cinzel', 'Playfair Display', Georgia, serif" font-size="20" font-weight="700" fill="#E2CC9A" letter-spacing="3" text-anchor="middle">Z BIBLIĄ ZA PAN BRAT • DZIEŃ 22</text>
    
    <text x="540" y="170" font-family="'Cinzel', 'Playfair Display', Georgia, serif" font-size="50" font-weight="800" fill="#FFFFFF" text-anchor="middle" filter="drop-shadow(0px 4px 14px rgba(0,0,0,0.95))">Jakub walczy z Bogiem</text>
    <text x="540" y="215" font-family="'Inter', -apple-system, sans-serif" font-size="24" font-weight="600" fill="#C4A35A" letter-spacing="1" text-anchor="middle">Przemiana człowieka nad potokiem Jabbok • Rdz 31–32</text>

    <!-- Bottom Gradient -->
    <rect x="0" y="850" width="1080" height="500" fill="url(#bottomVignette)" />
    
    <!-- Scripture quote banner -->
    <rect x="110" y="1100" width="860" height="74" rx="14" fill="#000000" fill-opacity="0.8" stroke="#C4A35A" stroke-width="1.8" />
    <text x="540" y="1146" font-family="'Cinzel', Georgia, serif" font-size="25" font-style="italic" font-weight="600" fill="#FFFFFF" text-anchor="middle">„Nie puszczę Cię, dopóki mi nie pobłogosławisz”</text>

    <!-- Bottom Verified URL Banner -->
    <rect x="70" y="1200" width="940" height="88" rx="18" fill="#050505" fill-opacity="0.95" stroke="#C4A35A" stroke-width="2.2" />
    <text x="120" y="1254" font-family="'Cinzel', serif" font-size="22" font-weight="700" fill="#C4A35A" letter-spacing="2">CHRISTIAN CULTURE</text>
    <text x="960" y="1254" font-family="'Inter', -apple-system, monospace, sans-serif" font-size="24" font-weight="700" fill="#FFFFFF" text-anchor="end">polskieradio.cc/akademia/kurscodzienny/dzien-22</text>
  </svg>
  `;

  const bg1350 = await sharp(inputImagePath)
    .resize(1080, 1350, { fit: 'cover', position: 'center' })
    .toBuffer();

  await sharp(bg1350)
    .composite([{ input: Buffer.from(svgOverlay1350), top: 0, left: 0 }])
    .jpeg({ quality: 92 })
    .toFile('images/social/fb_day_22_jakub_jabbok_1080x1350.jpg');

  console.log('✅ Generated 1080x1350: images/social/fb_day_22_jakub_jabbok_1080x1350.jpg');
}

generateSocialGraphics().catch(console.error);
