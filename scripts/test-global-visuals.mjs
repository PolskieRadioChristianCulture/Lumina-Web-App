import express from 'express';
import path from 'path';
import fs from 'fs';
import { chromium } from 'playwright';

const PORT = 8089;
const app = express();
const rootDir = process.cwd();

// Serve /Global specifically from Global/ directory
app.use('/Global', express.static(path.join(rootDir, 'Global')));
// Also serve all static root
app.use(express.static(rootDir));

// SPA fallback for /Global/articles/*
app.get('/Global/*', (req, res) => {
  res.sendFile(path.join(rootDir, 'Global', 'index.html'));
});

const server = app.listen(PORT, async () => {
  console.log(`Test server running at http://localhost:${PORT}/Global/`);

  const artifactDir = 'C:/Users/czark/.gemini/antigravity/brain/6171dbb4-faed-472d-ab3b-0ab4afdc2e53';
  const skrzynkaDir = path.join(rootDir, 'Repozytoria-CC', 'skrzynka', 'global-previews');
  fs.mkdirSync(skrzynkaDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });

  const viewports = [
    { name: 'desktop_1920x1080', width: 1920, height: 1080 },
    { name: 'desktop_1440x900', width: 1440, height: 900 },
    { name: 'mobile_390x844', width: 390, height: 844, isMobile: true },
    { name: 'mobile_360x800', width: 360, height: 800, isMobile: true }
  ];

  for (const vp of viewports) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      isMobile: !!vp.isMobile
    });
    const page = await context.newPage();
    await page.goto(`http://localhost:${PORT}/Global/`, { waitUntil: 'networkidle' });

    // Wait a brief moment for rendering and fonts
    await page.waitForTimeout(500);

    // Capture standard viewport screenshot
    const vpFile = `global_${vp.name}.png`;
    await page.screenshot({ path: path.join(artifactDir, vpFile) });
    await page.screenshot({ path: path.join(skrzynkaDir, vpFile) });
    console.log(`Saved screenshot: ${vpFile}`);

    // If 1920x1080, also test language switch and interactive player
    if (vp.name === 'desktop_1920x1080') {
      // Test PL language click
      const plBtn = page.locator('[data-set-lang="pl"]');
      if (await plBtn.count()) {
        await plBtn.click();
        await page.waitForTimeout(300);
        const plFile = `global_desktop_1920x1080_pl.png`;
        await page.screenshot({ path: path.join(artifactDir, plFile) });
        await page.screenshot({ path: path.join(skrzynkaDir, plFile) });
        console.log(`Saved PL screenshot: ${plFile}`);
        // Switch back to EN
        await page.locator('[data-set-lang="en"]').click();
        await page.waitForTimeout(300);
      }

      // Test Radio Play button
      const playBtn = page.locator('.circle-play-btn').first();
      if (await playBtn.count()) {
        await playBtn.click();
        await page.waitForTimeout(400);
        const playFile = `global_desktop_1920x1080_playing.png`;
        await page.screenshot({ path: path.join(artifactDir, playFile) });
        await page.screenshot({ path: path.join(skrzynkaDir, playFile) });
        console.log(`Saved Radio Playing screenshot: ${playFile}`);
      }

      // Test Playlist Modal
      const plCard = page.locator('.playlist-card').first();
      if (await plCard.count()) {
        await plCard.click();
        await page.waitForTimeout(400);
        const modalFile = `global_desktop_1920x1080_modal.png`;
        await page.screenshot({ path: path.join(artifactDir, modalFile) });
        await page.screenshot({ path: path.join(skrzynkaDir, modalFile) });
        console.log(`Saved Modal screenshot: ${modalFile}`);
        await page.locator('#close-modal').click();
        await page.waitForTimeout(300);
      }
    }

    await context.close();
  }

  await browser.close();
  server.close(() => {
    console.log('Visual test suite completed successfully.');
    process.exit(0);
  });
});
