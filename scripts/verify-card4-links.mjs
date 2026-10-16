import { chromium } from 'playwright';
import express from 'express';
import path from 'path';

const PORT = 8095;
const app = express();
const rootDir = process.cwd();
app.use('/Global', express.static(path.join(rootDir, 'Global')));
app.use(express.static(rootDir));
app.get('/Global/*', (req, res) => res.sendFile(path.join(rootDir, 'Global', 'index.html')));

const server = app.listen(PORT, async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
  await page.goto(`http://localhost:${PORT}/Global/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  // Check Card 4 in EN
  const card4 = page.locator('.playlist-card').nth(3);
  const card4Title = await card4.locator('.playlist-name').textContent();
  const card4Img = await card4.locator('.playlist-bg').getAttribute('src');
  console.log('Card 4 Title (EN):', card4Title, 'Img:', card4Img);

  // Switch to PL
  await page.click('[data-set-lang="pl"]');
  await page.waitForTimeout(400);
  const card4TitlePL = await card4.locator('.playlist-name').textContent();
  console.log('Card 4 Title (PL):', card4TitlePL);

  // Check footer links
  const footerLinks = await page.locator('.footer-links a').evaluateAll(links => links.map(a => a.href));
  console.log('Footer links:', footerLinks);
  const hasBadLink = footerLinks.some(h => h.includes('biblia.cclite.pl'));
  console.log('Has bad biblia.cclite.pl link:', hasBadLink);

  const artifactDir = 'C:/Users/czark/.gemini/antigravity/brain/6171dbb4-faed-472d-ab3b-0ab4afdc2e53';
  await page.locator('#personality').screenshot({ path: path.join(artifactDir, 'personality_section_verified.png') });
  console.log('Saved screenshot: personality_section_verified.png');

  await browser.close();
  server.close(() => process.exit(0));
});
