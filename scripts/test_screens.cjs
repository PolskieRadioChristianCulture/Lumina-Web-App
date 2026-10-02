const fs = require('fs');
const http = require('http');
const path = require('path');
const { chromium } = require('C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/node_modules/playwright');

const root = 'C:/Users/czark/Desktop/@ICC/LUMINA';

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/biznes' || reqPath === '/biznes/') reqPath = '/biznes.html';
  if (reqPath === '/kultura' || reqPath === '/kultura/') reqPath = '/kultura.html';
  
  let filePath = path.join(root, reqPath);
  if (!fs.existsSync(filePath) && fs.existsSync(filePath + '.html')) {
    filePath += '.html';
  }
  
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath);
    let mime = 'text/plain';
    if (ext === '.html') mime = 'text/html';
    else if (ext === '.js') mime = 'application/javascript';
    else if (ext === '.css') mime = 'text/css';
    else if (ext === '.json') mime = 'application/json';
    else if (ext === '.png') mime = 'image/png';
    else if (ext === '.jpg' || ext === '.jpeg') mime = 'image/jpeg';
    else if (ext === '.svg') mime = 'image/svg+xml';
    
    res.writeHead(200, { 'Content-Type': mime });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404);
    res.end('Not found: ' + reqPath);
  }
});

server.listen(4201, async () => {
  console.log('Server started on 4201');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  
  // Test /biznes with seeded persona
  const page1 = await context.newPage();
  await page1.goto('http://localhost:4201/biznes');
  await page1.evaluate(() => {
    localStorage.setItem('cc_app_start_choice', 'true');
    localStorage.setItem('cc_user_persona_v3', JSON.stringify({
      name: 'Cezary Rogowski',
      gender: 'male',
      profilePicture: '/avatar_cezary_official.jpg',
      personalStatus: 'Założyciel Christian Culture',
      ageGroup: 'adult',
      maritalStatus: 'married',
      spiritualStatus: 'believer',
      appMode: 'standard',
      googleEmail: 'nazirczarkes@gmail.com',
      assignedMentor: 'Miriam',
      isFirstRun: false,
      autostartRadio: true,
      joshuaSystem: { enabled: true, disciplineMode: '5.10.15', driveSyncEnabled: true }
    }));
  });
  await page1.reload({ waitUntil: 'networkidle' });
  await page1.waitForTimeout(1500);
  await page1.screenshot({ path: 'C:/Users/czark/.gemini/antigravity/brain/6171dbb4-faed-472d-ab3b-0ab4afdc2e53/test_dashboard_biznes.png', fullPage: true });
  console.log('Biznes dashboard screenshot saved.');

  // Test /kultura with seeded persona
  const page2 = await context.newPage();
  await page2.goto('http://localhost:4201/kultura');
  await page2.evaluate(() => {
    localStorage.setItem('cc_app_start_choice', 'true');
    localStorage.setItem('cc_user_persona_v3', JSON.stringify({
      name: 'Cezary Rogowski',
      gender: 'male',
      profilePicture: '/avatar_cezary_official.jpg',
      personalStatus: 'Założyciel Christian Culture',
      ageGroup: 'adult',
      maritalStatus: 'married',
      spiritualStatus: 'believer',
      appMode: 'standard',
      googleEmail: 'nazirczarkes@gmail.com',
      assignedMentor: 'Miriam',
      isFirstRun: false,
      autostartRadio: true,
      joshuaSystem: { enabled: true, disciplineMode: '5.10.15', driveSyncEnabled: true }
    }));
  });
  await page2.reload({ waitUntil: 'networkidle' });
  await page2.waitForTimeout(1500);
  await page2.screenshot({ path: 'C:/Users/czark/.gemini/antigravity/brain/6171dbb4-faed-472d-ab3b-0ab4afdc2e53/test_dashboard_kultura.png', fullPage: true });
  console.log('Kultura dashboard screenshot saved.');

  // Mobile view tests
  const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const mobPage1 = await mobileContext.newPage();
  await mobPage1.goto('http://localhost:4201/biznes');
  await mobPage1.waitForTimeout(1000);
  await mobPage1.screenshot({ path: 'C:/Users/czark/.gemini/antigravity/brain/6171dbb4-faed-472d-ab3b-0ab4afdc2e53/test_biznes_mobile.png', fullPage: true });

  const mobPage2 = await mobileContext.newPage();
  await mobPage2.goto('http://localhost:4201/kultura');
  await mobPage2.waitForTimeout(1000);
  await mobPage2.screenshot({ path: 'C:/Users/czark/.gemini/antigravity/brain/6171dbb4-faed-472d-ab3b-0ab4afdc2e53/test_kultura_mobile.png', fullPage: true });

  await browser.close();
  server.close();
  console.log('Done!');
});
