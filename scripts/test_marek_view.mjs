import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const logs = [];
  page.on('console', msg => logs.push(msg.text()));
  page.on('pageerror', err => logs.push('ERROR: ' + err.message));
  
  // Test 1: Local file with query param
  await page.goto('file:///C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/lumina-profile.html?u=marekjakubowski', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  
  const currentUrl = page.url();
  const userName = await page.$eval('#userNameEl', el => el.textContent).catch(e => e.message);
  const avatarSrc = await page.$eval('#avatarImgEl', el => el.src).catch(e => e.message);
  
  console.log('--- Test Local File ---');
  console.log('Current URL:', currentUrl);
  console.log('User Name:', userName);
  console.log('Avatar Src:', avatarSrc);

  // Test 2: Live polskieradio.cc/lumina-profile.html?u=marekjakubowski
  await page.goto('https://polskieradio.cc/lumina-profile.html?u=marekjakubowski', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  const liveUrl = page.url();
  const liveUserName = await page.$eval('#userNameEl', el => el.textContent).catch(e => e.message);
  const liveAvatarSrc = await page.$eval('#avatarImgEl', el => el.src).catch(e => e.message);

  console.log('--- Test Live URL ---');
  console.log('Live URL:', liveUrl);
  console.log('Live User Name:', liveUserName);
  console.log('Live Avatar Src:', liveAvatarSrc);

  await browser.close();
}

run().catch(console.error);
