import sharp from 'sharp';

const inputPath = 'C:/Users/czark/.gemini/antigravity/brain/d6fb6723-88d9-47dd-951a-c934e6675ed7/extracted_zip_2/WIOLETTA_ROGOWSKA_PREMIUM_PAKIET_2026-10-28/07_MATERIALY_ORIGINALNE/makieta_pierwsza_zatwierdzona.jpg';
const outJpg = 'images/wioletta/wioletta-hero-mobile.jpg';
const outWebp = 'images/wioletta/wioletta-hero-mobile.webp';

async function generate() {
  const extractLeft = 515;
  const extractTop = 76;
  const extractWidth = 850;
  const extractHeight = 692;

  const targetWidth = 800;
  const targetHeight = 650;

  const croppedResized = await sharp(inputPath)
    .extract({ left: extractLeft, top: extractTop, width: extractWidth, height: extractHeight })
    .resize(targetWidth, targetHeight)
    .toBuffer();

  const svg = `<svg width="${targetWidth}" height="${targetHeight}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="fadeLeft" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#05070a" stop-opacity="1"/>
        <stop offset="14%" stop-color="#05070a" stop-opacity="0.95"/>
        <stop offset="26%" stop-color="#05070a" stop-opacity="0"/>
      </linearGradient>
      <linearGradient id="fadeRight" x1="100%" y1="0%" x2="0%" y2="0%">
        <stop offset="0%" stop-color="#05070a" stop-opacity="0.9"/>
        <stop offset="6%" stop-color="#05070a" stop-opacity="0.5"/>
        <stop offset="16%" stop-color="#05070a" stop-opacity="0"/>
      </linearGradient>
      <linearGradient id="fadeTop" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#05070a" stop-opacity="1"/>
        <stop offset="8%" stop-color="#05070a" stop-opacity="0.7"/>
        <stop offset="16%" stop-color="#05070a" stop-opacity="0"/>
      </linearGradient>
      <linearGradient id="fadeBottom" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="74%" stop-color="#05070a" stop-opacity="0"/>
        <stop offset="90%" stop-color="#05070a" stop-opacity="0.85"/>
        <stop offset="100%" stop-color="#05070a" stop-opacity="1"/>
      </linearGradient>
    </defs>
    <rect width="${targetWidth}" height="${targetHeight}" fill="url(#fadeLeft)" />
    <rect width="${targetWidth}" height="${targetHeight}" fill="url(#fadeRight)" />
    <rect width="${targetWidth}" height="${targetHeight}" fill="url(#fadeTop)" />
    <rect width="${targetWidth}" height="${targetHeight}" fill="url(#fadeBottom)" />
  </svg>`;

  const maskBuf = await sharp(Buffer.from(svg), { density: 72 })
    .resize(targetWidth, targetHeight)
    .png()
    .toBuffer();

  await sharp(croppedResized)
    .composite([{ input: maskBuf, blend: 'over' }])
    .jpeg({ quality: 92 })
    .toFile(outJpg);

  await sharp(outJpg)
    .webp({ quality: 90 })
    .toFile(outWebp);

  console.log('Successfully written:', outJpg, outWebp);
}

generate().catch(err => {
  console.error(err);
  process.exit(1);
});
