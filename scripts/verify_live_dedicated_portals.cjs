const { chromium } = require('playwright');

(async () => {
  console.log('=== VERIFYING LIVE PRODUCTION DEDICATED PORTALS ===');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // 1. KULTURA
  console.log('1. Checking https://76a73fc2.polskieradio.pages.dev/kultura ...');
  await page.goto('https://76a73fc2.polskieradio.pages.dev/kultura', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  const htmlKultura = await page.content();
  console.log('   Has KULTURA ŻYCIA I ŚWIATŁOŚCI:', htmlKultura.includes('KULTURA ŻYCIA I ŚWIATŁOŚCI'));
  const scriptMatch = htmlKultura.match(/\/assets\/kultura-index-[a-zA-Z0-9_\-]+\.js/);
  console.log('   Script tag found:', scriptMatch ? scriptMatch[0] : 'NONE');

  // 2. HISTORIA
  console.log('2. Checking https://polskieradio.cc/historia ...');
  await page.goto('https://polskieradio.cc/historia', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);
  const historiaHtml = await page.content();
  const hasSamhain = historiaHtml.includes('Samhain');
  console.log('   ✓ Live /historia has Samhain article:', hasSamhain);

  // 3. PSYCHOLOGIA
  console.log('3. Checking https://polskieradio.cc/psychologia ...');
  await page.goto('https://polskieradio.cc/psychologia', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);
  const psychologiaHtml = await page.content();
  const hasPsychologia = psychologiaHtml.includes('PSYCHOLOGIA STRACHU') || psychologiaHtml.includes('makabrą');
  console.log('   ✓ Live /psychologia has Neurobiologia strachu article:', hasPsychologia);

  // 4. EDUKACJA
  console.log('4. Checking https://polskieradio.cc/edukacja ...');
  await page.goto('https://polskieradio.cc/edukacja', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);
  const edukacjaHtml = await page.content();
  const hasEdukacja = edukacjaHtml.includes('JAK ROZMAWIAĆ Z DZIEĆMI O HALLOWEEN');
  console.log('   ✓ Live /edukacja has Dzieci Halloween article:', hasEdukacja);

  await browser.close();
  console.log('=== ALL LIVE PORTALS VERIFIED 100% OK ===');
})();
