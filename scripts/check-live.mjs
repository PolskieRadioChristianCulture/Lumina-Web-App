import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  await page.goto('https://polskieradio.cc/Global/?t=' + Date.now(), { waitUntil: 'networkidle' });
  
  // Test Polish switch
  const plBtn = page.locator('button[data-set-lang="pl"]');
  console.log('PL button count:', await plBtn.count());
  if (await plBtn.count()) {
    await plBtn.first().click();
    await page.waitForTimeout(600);
  }

  const card4 = await page.evaluate(() => {
    const c = document.querySelectorAll('.playlist-card')[3];
    return {
      title: c?.querySelector('.playlist-name')?.innerText,
      img: c?.querySelector('img')?.getAttribute('src'),
      aria: c?.getAttribute('aria-label')
    };
  });
  console.log('LIVE CARD 4 (PL):', JSON.stringify(card4));

  // Check bad link in entire DOM
  const badLinks = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a'))
      .map(a => a.href)
      .filter(h => h.includes('biblia.cclite.pl'));
  });
  console.log('LIVE BAD LINKS COUNT:', badLinks.length);

  // Check authentic CC links in footer
  const authenticLinks = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('footer a'))
      .map(a => a.href)
      .filter(h => h.includes('mojabiblia') || h.includes('akademia') || h.includes('cclite.pl'));
  });
  console.log('LIVE AUTHENTIC CC LINKS:', JSON.stringify(authenticLinks));

  const section = page.locator('#personality');
  await section.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await section.screenshot({ path: 'C:/Users/czark/.gemini/antigravity/brain/6171dbb4-faed-472d-ab3b-0ab4afdc2e53/live_card4_personality_pl.png' });

  await browser.close();
  console.log('Verification completed successfully!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
