const { chromium } = require('C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/node_modules/playwright');

async function test() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://polskieradio.cc/news', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);
  
  const content = await page.content();
  const hasLoop = content.includes('Pętla automatyczna');
  console.log('Produkcja polskieradio.cc/news zawiera "Pętla automatyczna":', hasLoop);
  
  const subDesc = await page.locator('text=Otwarte przestrzenie mediów').textContent().catch(() => null);
  console.log('Odczytany podtytuł:', subDesc);
  
  await browser.close();
}

test().catch(console.error);
