const { chromium } = require('playwright');

(async () => {
  console.log('=== VERIFYING LIVE PRODUCTION DEKALOG ON POLSKIERADIO.CC ===');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // 1. PRAWO
  console.log('1. Checking https://polskieradio.cc/prawo ...');
  await page.goto('https://polskieradio.cc/prawo', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  const prawoContent = await page.content();
  const hasPrawoDekalog = prawoContent.includes('Dziesięć przykazań') || prawoContent.includes('Jakuba Wujka');
  console.log('   ✓ Live /prawo has Dekalog BJW:', hasPrawoDekalog);

  // 2. APOLOGETYKA
  console.log('2. Checking https://polskieradio.cc/apologetyka ...');
  await page.goto('https://polskieradio.cc/apologetyka', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  const apoContent = await page.content();
  const hasApoDekalog = apoContent.includes('Dziesięć przykazań') || apoContent.includes('Jakuba Wujka');
  console.log('   ✓ Live /apologetyka has Dekalog BJW:', hasApoDekalog);

  // 3. BIBLIOTEKA
  console.log('3. Checking https://polskieradio.cc/biblioteka ...');
  await page.goto('https://polskieradio.cc/biblioteka', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  const bibContent = await page.content();
  const hasBibDekalog = bibContent.includes('Dziesięć przykazań') || bibContent.includes('Jakuba Wujka');
  console.log('   ✓ Live /biblioteka has Dekalog BJW:', hasBibDekalog);

  // 4. NEWS
  console.log('4. Checking https://polskieradio.cc/news ...');
  await page.goto('https://polskieradio.cc/news', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  const newsContent = await page.content();
  const hasNewsDekalog = newsContent.includes('Dziesięć przykazań') || newsContent.includes('Jakuba Wujka');
  console.log('   ✓ Live /news has Dekalog BJW:', hasNewsDekalog);

  await browser.close();

  if (!hasPrawoDekalog || !hasApoDekalog || !hasBibDekalog || !hasNewsDekalog) {
    console.error('FAIL: Verification on live production failed!');
    process.exit(1);
  }

  console.log('=== ALL 4 LIVE PRODUCTION PORTALS VERIFIED 100% OK! ===');
})();
