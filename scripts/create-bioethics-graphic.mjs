import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

async function createEditorialGraphic() {
  const baseImgPath = path.join(ROOT, 'images/player/art-dna.jpg');
  const outPath = path.join(ROOT, 'images/news/art-bioetyka-edycja-genomu-syntetyczne-embriony-biblia.jpg');

  const image = sharp(baseImgPath)
    .resize(1920, 1080, { fit: 'cover' })
    .modulate({ brightness: 0.92, saturation: 1.05 });

  const overlaySvg = Buffer.from(`
    <svg width="1920" height="1080" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bottomGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#000000" stop-opacity="0"/>
          <stop offset="55%" stop-color="#0a0e17" stop-opacity="0.6"/>
          <stop offset="100%" stop-color="#0a0e17" stop-opacity="0.92"/>
        </linearGradient>
        <linearGradient id="goldLine" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#C4A35A" stop-opacity="0"/>
          <stop offset="15%" stop-color="#C4A35A" stop-opacity="1"/>
          <stop offset="85%" stop-color="#FF7A00" stop-opacity="1"/>
          <stop offset="100%" stop-color="#FF7A00" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="1920" height="1080" fill="url(#bottomGrad)"/>
      <rect x="120" y="930" width="1680" height="3" fill="url(#goldLine)"/>
      <text x="130" y="975" font-family="Arial, sans-serif" font-size="26" font-weight="bold" fill="#C4A35A" letter-spacing="2">CCN NAUKA &amp; BIOETYKA • CHRISTIAN CULTURE NETWORK</text>
      <text x="130" y="1025" font-family="Georgia, serif" font-size="36" font-weight="bold" fill="#FFFFFF">Granice ingerencji w ludzki genom a biblijna prawda o początku życia</text>
    </svg>
  `);

  await image
    .composite([{ input: overlaySvg, blend: 'over' }])
    .jpeg({ quality: 92 })
    .toFile(outPath);

  console.log('✅ Utworzono grafikę redakcyjną 16:9:', outPath);
}

createEditorialGraphic().catch(console.error);
