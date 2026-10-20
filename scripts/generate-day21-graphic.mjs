import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const WIDTH = 1376;
const HEIGHT = 768;

async function generateDay21Graphic() {
  const outDir = path.resolve('images/academy/daily');
  fs.mkdirSync(outDir, { recursive: true });

  const srcPath = 'C:/Users/czark/.gemini/antigravity/brain/db144fde-c11f-407d-ac06-6b4bec418097/jacob_meets_rachel_well_v2_1792495402846.jpg';

  const buffer = await sharp(srcPath)
    .resize(WIDTH, HEIGHT, { fit: 'cover' })
    .jpeg({ quality: 92, mozjpeg: true })
    .toBuffer();

  const finalJpg = path.join(outDir, 'kc_day_21_bog_dziala_niedoskonale_rodziny.jpg');
  fs.writeFileSync(finalJpg, buffer);
  console.log(`✅ Zapisano autentyczną grafikę lekcji 21: ${finalJpg}`);

  const aliasJpg = path.join(outDir, 'kc_day_21_jakub_rachela_lea.jpg');
  fs.writeFileSync(aliasJpg, buffer);

  const newsJpg = path.resolve('images/news/art-z-biblia-za-pan-brat-dzien-21-bog-dziala-niedoskonale-rodziny.jpg');
  fs.mkdirSync(path.dirname(newsJpg), { recursive: true });
  fs.writeFileSync(newsJpg, buffer);
  console.log(`✅ Zapisano grafikę artykułu CCN: ${newsJpg}`);
}

generateDay21Graphic().catch(err => {
  console.error('Błąd generowania grafiki:', err);
  process.exit(1);
});
