const fs = require('fs');
const path = require('path');
const { chromium } = require('C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/node_modules/playwright');

const sourceDir = 'C:\\Users\\czark\\Downloads\\Grafika do kursu';

// Exact mapping based on the visual golden number on each image:
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
  24: 'Obraz ChatGPT 27 wrz 2026, 17_33_27.png', // 24 SŁUŻBA CHRYSTUSA
  25: 'Obraz ChatGPT 27 wrz 2026, 17_34_38.png', // 25 POWTÓRNE PRZYJŚCIE CHRYSTUSA
  26: 'Obraz ChatGPT 27 wrz 2026, 17_36_57.png', // 26 ŚMIERĆ I ZMARTWYCHWSTANIE
  27: 'Obraz ChatGPT 27 wrz 2026, 17_37_55.png', // 27 TYSIĄCLECIE I KONIEC GRZECHU
  28: 'Obraz ChatGPT 27 wrz 2026, 17_36_18.png'  // 28 NOWA ZIEMIA
};

async function verifyMapping() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 2600 } });

  let html = `<!DOCTYPE html><html><head><style>
    body { background: #0c0f17; color: #fff; font-family: sans-serif; padding: 20px; }
    .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; }
    .card { background: #161b26; border: 1px solid rgba(212,175,55,0.4); border-radius: 8px; overflow: hidden; padding: 10px; }
    .title { font-size: 14px; font-weight: bold; margin-bottom: 6px; color: #f5c747; }
    .fn { font-size: 10px; color: #888; margin-bottom: 6px; }
    img { width: 100%; aspect-ratio: 16/9; object-fit: cover; border-radius: 4px; display: block; }
  </style></head><body>
  <h1 style="color: #f6e09e;">Weryfikacja Przypisania 28 Grafik do Lekcji 1-28</h1>
  <div class="grid">`;

  for (let i = 1; i <= 28; i++) {
    const fn = lessonToFilename[i];
    const fp = path.join(sourceDir, fn);
    const dataUri = 'data:image/png;base64,' + fs.readFileSync(fp).toString('base64');
    html += `
      <div class="card">
        <div class="title">Lekcja ${i}</div>
        <div class="fn">${fn}</div>
        <img src="${dataUri}" />
      </div>
    `;
  }

  html += `</div></body></html>`;

  await page.setContent(html);
  await page.waitForTimeout(1000);

  const outPath = 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\6171dbb4-faed-472d-ab3b-0ab4afdc2e53\\course_graphics_verified_order.png';
  await page.screenshot({ path: outPath, fullPage: true });
  console.log('Saved verified mapping collage to:', outPath);

  await browser.close();
}

verifyMapping();
