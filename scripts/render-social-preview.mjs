import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function testSocialCards() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 1400 } });

  const ogHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Social Media Preview Test</title>
    <style>
      body { background: #0f1115; color: #fff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; margin: 0; }
      h1 { color: #d4af37; margin-bottom: 24px; font-size: 24px; }
      .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
      .card { background: #1a1d24; border-radius: 12px; overflow: hidden; border: 1px solid #2d3139; }
      .card-header { padding: 12px 16px; background: #222630; font-size: 14px; font-weight: 600; color: #a0a6b5; border-bottom: 1px solid #2d3139; display: flex; align-items: center; gap: 8px; }
      .card img { width: 100%; height: auto; display: block; }
      .card-body { padding: 16px; font-size: 14px; line-height: 1.6; }
      
      /* WhatsApp style */
      .wa-card { background: #1f2c34; border-radius: 8px; border: 1px solid #2a3942; }
      .wa-card .card-header { background: #128c7e; color: #fff; font-weight: 600; }
      .wa-card-body { padding: 12px 14px; background: #2a3942; }
      .wa-title { font-weight: 600; font-size: 15px; color: #e9edef; line-height: 1.3; }
      .wa-desc { font-size: 13px; color: #8696a0; margin-top: 4px; line-height: 1.4; }
      .wa-url { font-size: 11px; color: #53bdeb; margin-top: 6px; }
      
      /* Facebook / Messenger style */
      .fb-card { background: #242526; border: 1px solid #3e4042; }
      .fb-card .card-header { background: #1877f2; color: #fff; }
      .fb-card-body { padding: 12px 16px; }
      .fb-site { font-size: 12px; text-transform: uppercase; color: #b0b3b8; }
      .fb-title { font-size: 16px; font-weight: 600; color: #e4e6eb; margin: 4px 0; line-height: 1.3; }
      .fb-desc { font-size: 13px; color: #b0b3b8; line-height: 1.4; }

      /* X / Twitter style */
      .x-card { background: #000; border: 1px solid #333; }
      .x-card .card-header { background: #111; color: #fff; }
      .x-card-body { padding: 12px 16px; }
      .x-site { font-size: 13px; color: #71767b; }
      .x-title { font-size: 15px; font-weight: 600; color: #e7e9ea; margin: 4px 0; line-height: 1.3; }
      .x-desc { font-size: 13px; color: #71767b; line-height: 1.4; }
    </style>
  </head>
  <body>
    <h1>Biblijne Uwielbienie — Podgląd Kart Udostępniania (Open Graph 1200x630)</h1>
    <div class="grid">
      <!-- WhatsApp Preview -->
      <div class="card wa-card">
        <div class="card-header">WhatsApp / iMessage / Telegram Preview</div>
        <img src="file:///C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/assets/og/biblijne-uwielbienie-og.jpg" alt="Biblijne Uwielbienie">
        <div class="wa-card-body">
          <div class="wa-title">Biblijne Uwielbienie – Cała Biblia w Muzyce | Christian Culture</div>
          <div class="wa-desc">Nowoczesne uwielbienie, ponadczasowe Słowo. Odkryj 66 ksiąg i 1189 rozdziałów Pisma Świętego w muzyce poruszającej serca.</div>
          <div class="wa-url">polskieradio.cc/BiblijneUwielbienie</div>
        </div>
      </div>

      <!-- Facebook / Messenger Preview -->
      <div class="card fb-card">
        <div class="card-header">Facebook / Messenger Feed Preview</div>
        <img src="file:///C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/assets/og/biblijne-uwielbienie-og.jpg" alt="Biblijne Uwielbienie">
        <div class="fb-card-body">
          <div class="fb-site">POLSKIERADIO.CC</div>
          <div class="fb-title">Biblijne Uwielbienie – Cała Biblia w Muzyce | Christian Culture</div>
          <div class="fb-desc">Nowoczesne uwielbienie, ponadczasowe Słowo. Odkryj 66 ksiąg i 1189 rozdziałów Pisma Świętego w muzyce poruszającej serca.</div>
        </div>
      </div>

      <!-- Twitter / X Large Summary Card -->
      <div class="card x-card">
        <div class="card-header">X / Twitter (summary_large_image)</div>
        <img src="file:///C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/assets/og/biblijne-uwielbienie-og.jpg" alt="Biblijne Uwielbienie">
        <div class="x-card-body">
          <div class="x-site">polskieradio.cc</div>
          <div class="x-title">Biblijne Uwielbienie – Cała Biblia w Muzyce | Christian Culture</div>
          <div class="x-desc">Nowoczesne uwielbienie, ponadczasowe Słowo. Odkryj 66 ksiąg i 1189 rozdziałów Pisma Świętego w muzyce poruszającej serca.</div>
        </div>
      </div>

      <!-- Technical Specifications -->
      <div class="card">
        <div class="card-header">Parametry Techniczne Obrazu</div>
        <div class="card-body">
          <p><strong>URL kanoniczny:</strong> <code>https://polskieradio.cc/BiblijneUwielbienie</code></p>
          <p><strong>Obraz OG:</strong> <code>https://polskieradio.cc/assets/og/biblijne-uwielbienie-og.jpg</code></p>
          <p><strong>Wymiary:</strong> 1200 × 630 px (proporcje 1.905:1)</p>
          <p><strong>Wersja PNG:</strong> <code>https://polskieradio.cc/assets/og/biblijne-uwielbienie-og.png</code></p>
          <p><strong>Wersja Hi-Res:</strong> <code>https://polskieradio.cc/assets/og/biblijne-uwielbienie-og-1600x840.jpg</code></p>
          <p><strong>Waga pliku:</strong> 226 KB JPG / 305 KB PNG (&lt; 1-2 MB)</p>
          <p><strong>Kadr:</strong> 100% zachowane twarze obu prezenterek, otwarta Biblia i mikrofon bez ucięć, eleganckie ciemne tło sceny.</p>
          <p><strong>Zero atrap:</strong> Brak starego obrazu z mężczyzną na krześle (usunięty).</p>
        </div>
      </div>
    </div>
  </body>
  </html>
  `;

  const htmlPath = 'C:/Users/czark/.gemini/antigravity/brain/6171dbb4-faed-472d-ab3b-0ab4afdc2e53/scratch/social-preview.html';
  fs.writeFileSync(htmlPath, ogHtml, 'utf8');

  await page.goto('file:///' + htmlPath.replace(/\\/g, '/'));
  await page.waitForTimeout(600);

  const screenshotPath = 'C:/Users/czark/.gemini/antigravity/brain/6171dbb4-faed-472d-ab3b-0ab4afdc2e53/social_cards_preview_verified.png';
  await page.screenshot({ path: screenshotPath, fullPage: true });

  console.log('Social preview screenshot saved to:', screenshotPath);
  await browser.close();
}

testSocialCards().catch(err => {
  console.error('Playwright error:', err);
  process.exit(1);
});
