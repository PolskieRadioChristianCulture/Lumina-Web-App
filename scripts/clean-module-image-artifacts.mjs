import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';

const repoDir = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc';
const assetsDir = path.join(repoDir, 'assets');
const courseAssetsDir = path.join(repoDir, 'assets/pokonac-goliata-course');
const zipAssetsDir = 'C:/Users/czark/.gemini/antigravity/brain/db144fde-c11f-407d-ac06-6b4bec418097/unpacked_zip/POKONAC_GOLIATA_PREMIUM_2026/public/assets';
const zipDistAssetsDir = 'C:/Users/czark/.gemini/antigravity/brain/db144fde-c11f-407d-ac06-6b4bec418097/unpacked_zip/POKONAC_GOLIATA_PREMIUM_2026/dist/assets';

async function cleanModuleImages() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  for (let i = 0; i < 10; i++) {
    const filename = `module-${String(i).padStart(2, '0')}.webp`;
    const origPath = path.join(assetsDir, filename);

    if (!fs.existsSync(origPath)) continue;

    const base64Data = fs.readFileSync(origPath).toString('base64');
    const dataUri = `data:image/webp;base64,${base64Data}`;

    // Process image on HTML5 canvas: apply gradient fade on the top 120px to erase all text artifacts
    const cleanedBase64 = await page.evaluate(async (src) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext('2d');

          // Draw original image
          ctx.drawImage(img, 0, 0);

          // Top gradient: erase ghost text in top 120px with deep navy/black #061019
          const grad = ctx.createLinearGradient(0, 0, 0, 140);
          grad.addColorStop(0, '#061019');
          grad.addColorStop(0.55, '#061019');
          grad.addColorStop(0.85, 'rgba(6, 16, 25, 0.7)');
          grad.addColorStop(1, 'rgba(6, 16, 25, 0)');

          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, canvas.width, 140);

          resolve(canvas.toDataURL('image/webp', 0.95));
        };
        img.src = src;
      });
    }, dataUri);

    const buffer = Buffer.from(cleanedBase64.replace(/^data:image\/webp;base64,/, ''), 'base64');

    // Save to all target asset directories
    [assetsDir, courseAssetsDir, zipAssetsDir, zipDistAssetsDir].forEach((dir) => {
      if (fs.existsSync(dir)) {
        fs.writeFileSync(path.join(dir, filename), buffer);
      }
    });

    console.log(`Cleaned artifacts from ${filename} (${buffer.length} bytes)`);
  }

  await browser.close();
  console.log('All 10 module images cleaned of text artifacts successfully!');
}

cleanModuleImages().catch(err => {
  console.error('Error cleaning images:', err);
  process.exit(1);
});
