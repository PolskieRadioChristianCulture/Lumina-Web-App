const fs = require('fs');
const path = require('path');
const { chromium } = require('C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/node_modules/playwright');

const rootDir = path.resolve(__dirname, '..');
const sourceDir = 'C:\\Users\\czark\\Downloads\\Grafika do kursu';
const targetDir = path.join(rootDir, 'images', 'lessons');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// 100% verified mapping based on the visual golden number on each image
const lessonToFilename = {
  1: 'Obraz ChatGPT 27 wrz 2026, 17_02_55.png',
  2: 'Obraz ChatGPT 27 wrz 2026, 17_04_00.png',
  3: 'Obraz ChatGPT 27 wrz 2026, 17_05_00.png',
  4: 'Obraz ChatGPT 27 wrz 2026, 17_05_58.png',
  5: 'Obraz ChatGPT 27 wrz 2026, 17_06_57.png',
  6: 'Obraz ChatGPT 27 wrz 2026, 17_18_51.png', // 06 STWORZENIE
  7: 'Obraz ChatGPT 27 wrz 2026, 17_08_50.png', // 07 NATURA LUDZKA
  8: 'Obraz ChatGPT 27 wrz 2026, 17_09_52.png', // 08 WIELKI BÓJ
  9: 'Obraz ChatGPT 27 wrz 2026, 17_12_19.png', // 09 ŻYCIE, ŚMIERĆ I ZMARTWYCHWSTANIE
  10: 'Obraz ChatGPT 27 wrz 2026, 17_14_03.png', // 10 DOŚWIADCZENIE ZBAWIENIA
  11: 'Obraz ChatGPT 27 wrz 2026, 17_15_07.png', // 11
  12: 'Obraz ChatGPT 27 wrz 2026, 17_16_26.png', // 12
  13: 'Obraz ChatGPT 27 wrz 2026, 17_17_21.png', // 13
  14: 'Obraz ChatGPT 27 wrz 2026, 17_18_26.png', // 14
  15: 'Obraz ChatGPT 27 wrz 2026, 17_19_31.png', // 15
  16: 'Obraz ChatGPT 27 wrz 2026, 17_20_32.png', // 16
  17: 'Obraz ChatGPT 27 wrz 2026, 17_21_29.png', // 17
  18: 'Obraz ChatGPT 27 wrz 2026, 17_22_20.png', // 18
  19: 'Obraz ChatGPT 27 wrz 2026, 17_23_10.png', // 19
  20: 'Obraz ChatGPT 27 wrz 2026, 17_24_05.png', // 20
  21: 'Obraz ChatGPT 27 wrz 2026, 17_25_08.png', // 21
  22: 'Obraz ChatGPT 27 wrz 2026, 17_31_18.png', // 22 CHRZEŚCIJAŃSKIE PROWADZENIE SIĘ
  23: 'Obraz ChatGPT 27 wrz 2026, 17_32_30.png', // 23 MAŁŻEŃSTWO I RODZINA
  24: 'Obraz ChatGPT 27 wrz 2026, 17_33_27.png', // 24 SŁUŻBA CHRYSTUSA W NIEBIAŃSKIEJ ŚWIĄTYNI
  25: 'Obraz ChatGPT 27 wrz 2026, 17_34_38.png', // 25 POWTÓRNE PRZYJŚCIE CHRYSTUSA
  26: 'Obraz ChatGPT 27 wrz 2026, 17_36_57.png', // 26 ŚMIERĆ I ZMARTWYCHWSTANIE
  27: 'Obraz ChatGPT 27 wrz 2026, 17_37_55.png', // 27 TYSIĄCLECIE I KONIEC GRZECHU
  28: 'Obraz ChatGPT 27 wrz 2026, 17_36_18.png'  // 28 NOWA ZIEMIA
};

async function processGraphics() {
  console.log('--- 1. KOPIOWANIE ORYGINALNYCH PNG DO images/lessons/ ---');
  for (let id = 1; id <= 28; id++) {
    const srcFile = path.join(sourceDir, lessonToFilename[id]);
    const dstPng = path.join(targetDir, `${id}.png`);
    fs.copyFileSync(srcFile, dstPng);
    console.log(`[OK] Lekcja ${id} PNG: ${lessonToFilename[id]} -> ${dstPng}`);
  }

  console.log('\n--- 2. GENEROWANIE ZOPTYMALIZOWANYCH WEBP (PLAYWRIGHT CHROMIUM CANVAS) ---');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  for (let id = 1; id <= 28; id++) {
    const pngPath = path.join(targetDir, `${id}.png`);
    const webpPath = path.join(targetDir, `${id}.webp`);
    const base64Png = fs.readFileSync(pngPath).toString('base64');
    const dataUri = `data:image/png;base64,${base64Png}`;

    const webpBase64 = await page.evaluate(async (uri) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || 1920;
          canvas.height = img.naturalHeight || 1080;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          const webpUri = canvas.toDataURL('image/webp', 0.90);
          resolve(webpUri.replace(/^data:image\/webp;base64,/, ''));
        };
        img.onerror = reject;
        img.src = uri;
      });
    }, dataUri);

    fs.writeFileSync(webpPath, Buffer.from(webpBase64, 'base64'));
    const sizePng = (fs.statSync(pngPath).size / 1024 / 1024).toFixed(2);
    const sizeWebp = (fs.statSync(webpPath).size / 1024).toFixed(0);
    console.log(`[OK] Lekcja ${id} WebP wygenerowane: ${sizePng} MB PNG -> ${sizeWebp} KB WebP`);
  }

  await browser.close();

  console.log('\n--- 3. AKTUALIZACJA data/lumina-courses-data.js ---');
  const dataJsPath = path.join(rootDir, 'data', 'lumina-courses-data.js');
  let dataJs = fs.readFileSync(dataJsPath, 'utf8');

  // Replace image references "/images/lessons/X.svg" with "/images/lessons/X.webp"
  dataJs = dataJs.replace(/"image":\s*"\/images\/lessons\/(\d+)\.svg"/g, '"image": "/images/lessons/$1.webp"');
  fs.writeFileSync(dataJsPath, dataJs, 'utf8');
  console.log('[OK] Zaktualizowano data/lumina-courses-data.js na format WebP z fallbackiem PNG.');

  console.log('\n=== ZAKOŃCZONO WDROŻENIE 28 NOWYCH GRAFIK! ===');
}

processGraphics();
