import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const src = 'C:/Users/czark/.gemini/antigravity/brain/6171dbb4-faed-472d-ab3b-0ab4afdc2e53/scratch/source-kobiety.png';
const ogDir = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/assets/og';

if (!fs.existsSync(ogDir)) {
  fs.mkdirSync(ogDir, { recursive: true });
}

async function buildAllOgImages() {
  // --- 1. Standard 1200x630 (Primary Open Graph) ---
  const extractHeight = 1100;
  const extractTop = 30;
  const targetH = 630;
  const targetW = Math.round(1254 * (targetH / extractHeight)); // ~718px

  const maskSvg1200 = `
    <svg width="${targetW}" height="${targetH}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="black" stop-opacity="0"/>
          <stop offset="9%" stop-color="white" stop-opacity="1"/>
          <stop offset="91%" stop-color="white" stop-opacity="1"/>
          <stop offset="100%" stop-color="black" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)"/>
    </svg>
  `;

  const mask1200 = await sharp(Buffer.from(maskSvg1200)).png().toBuffer();

  const fg1200 = await sharp(src)
    .extract({ left: 0, top: extractTop, width: 1254, height: extractHeight })
    .resize(targetW, targetH)
    .ensureAlpha()
    .composite([{ input: mask1200, blend: 'dest-in' }])
    .png()
    .toBuffer();

  const bg1200 = await sharp(src)
    .resize(1200, 630, { fit: 'cover', position: 'top' })
    .blur(30)
    .modulate({ brightness: 0.60 })
    .toBuffer();

  // Save 1200x630 JPG
  await sharp(bg1200)
    .composite([{ input: fg1200, left: Math.round((1200 - targetW) / 2), top: 0 }])
    .jpeg({ quality: 92, chromaSubsampling: '4:4:4' })
    .toFile(path.join(ogDir, 'biblijne-uwielbienie-og.jpg'));

  // Save 1200x630 PNG
  await sharp(bg1200)
    .composite([{ input: fg1200, left: Math.round((1200 - targetW) / 2), top: 0 }])
    .png({ quality: 95 })
    .toFile(path.join(ogDir, 'biblijne-uwielbienie-og.png'));

  // --- 2. Hi-Res 1600x840 (Backup / Hi-Res Display) ---
  const hiH = 840;
  const hiW_fg = Math.round(1254 * (hiH / extractHeight)); // ~957px

  const maskSvg1600 = `
    <svg width="${hiW_fg}" height="${hiH}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gradHi" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="black" stop-opacity="0"/>
          <stop offset="9%" stop-color="white" stop-opacity="1"/>
          <stop offset="91%" stop-color="white" stop-opacity="1"/>
          <stop offset="100%" stop-color="black" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#gradHi)"/>
    </svg>
  `;

  const mask1600 = await sharp(Buffer.from(maskSvg1600)).png().toBuffer();

  const fg1600 = await sharp(src)
    .extract({ left: 0, top: extractTop, width: 1254, height: extractHeight })
    .resize(hiW_fg, hiH)
    .ensureAlpha()
    .composite([{ input: mask1600, blend: 'dest-in' }])
    .png()
    .toBuffer();

  const bg1600 = await sharp(src)
    .resize(1600, 840, { fit: 'cover', position: 'top' })
    .blur(35)
    .modulate({ brightness: 0.60 })
    .toBuffer();

  await sharp(bg1600)
    .composite([{ input: fg1600, left: Math.round((1600 - hiW_fg) / 2), top: 0 }])
    .jpeg({ quality: 92, chromaSubsampling: '4:4:4' })
    .toFile(path.join(ogDir, 'biblijne-uwielbienie-og-1600x840.jpg'));

  console.log('All OG assets generated successfully in assets/og/');
}

buildAllOgImages().catch(err => {
  console.error('Error generating OG assets:', err);
  process.exit(1);
});
