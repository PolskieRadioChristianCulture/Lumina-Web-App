const fs = require('fs');
const path = require('path');
const { chromium } = require('C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/node_modules/playwright');

async function makeCollage() {
  const sourceDir = 'C:\\Users\\czark\\Downloads\\Grafika do kursu';
  const files = fs.readdirSync(sourceDir).filter(f => f.endsWith('.png'));

  // Sort files by timestamp
  files.sort((a, b) => {
    return fs.statSync(path.join(sourceDir, a)).mtimeMs - fs.statSync(path.join(sourceDir, b)).mtimeMs;
  });

  console.log(`Found ${files.length} files in ${sourceDir}`);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 2800 } });

  // Create an HTML page with thumbnails of the top-left 40% of each image showing the number and title
  let html = `<!DOCTYPE html><html><head><style>
    body { background: #111; color: #fff; font-family: sans-serif; padding: 20px; }
    .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; }
    .card { background: #222; border-radius: 8px; overflow: hidden; padding: 10px; }
    .title { font-size: 12px; margin-bottom: 6px; word-break: break-all; color: #f5c747; }
    .crop-wrap { width: 100%; aspect-ratio: 16/9; overflow: hidden; position: relative; border-radius: 4px; }
    .crop-wrap img { width: 180%; height: auto; position: absolute; top: -5%; left: -5%; object-fit: cover; }
  </style></head><body>
  <h2>28 Kart Kursu — Podgląd w kolejności czasowej</h2>
  <div class="grid">`;

  files.forEach((f, idx) => {
    const filePath = path.join(sourceDir, f);
    const dataUri = 'data:image/png;base64,' + fs.readFileSync(filePath).toString('base64');
    html += `
      <div class="card">
        <div class="title">#${idx + 1}: ${f}</div>
        <div class="crop-wrap">
          <img src="${dataUri}" />
        </div>
      </div>
    `;
  });

  html += `</div></body></html>`;

  await page.setContent(html);
  await page.waitForTimeout(1000);

  const outPath = 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\6171dbb4-faed-472d-ab3b-0ab4afdc2e53\\course_graphics_summary.png';
  await page.screenshot({ path: outPath, fullPage: true });
  console.log('Saved collage to:', outPath);

  await browser.close();
}

makeCollage();
