import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const brainDir = 'C:/Users/czark/.gemini/antigravity/brain/6171dbb4-faed-472d-ab3b-0ab4afdc2e53/.user_uploaded';
const targetDir = 'portals/cc-global/assets';
const globalDir = 'Global/assets';

fs.mkdirSync(targetDir, { recursive: true });
fs.mkdirSync(globalDir, { recursive: true });

async function processAssets() {
  const imgStudio = path.join(brainDir, 'media_1792146231395_93b95085.jpg');
  const imgRadioLogo = path.join(brainDir, 'media_1792146265480_93245148.jpg');
  const imgPaypal = path.join(brainDir, 'media_1792147527093_baeaa948.jpg');

  // 1. Radio CC Global Logo (media_1792146265480_93245148.jpg) -> radio-global.webp
  if (fs.existsSync(imgRadioLogo)) {
    await sharp(imgRadioLogo)
      .resize(500, 500, { fit: 'cover' })
      .webp({ quality: 90 })
      .toFile(path.join(targetDir, 'radio-global.webp'));
    fs.copyFileSync(path.join(targetDir, 'radio-global.webp'), path.join(globalDir, 'radio-global.webp'));
    console.log('Generated radio-global.webp from new Radio CC logo');
  }

  // 2. Bible Audio Studio Presenters (media_1792146231395_93b95085.jpg) -> radio-bible.webp & article-biblical-worship.webp
  if (fs.existsSync(imgStudio)) {
    // Square crop for radio-bible
    await sharp(imgStudio)
      .resize(400, 400, { fit: 'cover', position: 'top' })
      .webp({ quality: 90 })
      .toFile(path.join(targetDir, 'radio-bible.webp'));
    fs.copyFileSync(path.join(targetDir, 'radio-bible.webp'), path.join(globalDir, 'radio-bible.webp'));

    // 16:9 crop for article-biblical-worship
    await sharp(imgStudio)
      .resize(720, 405, { fit: 'cover', position: 'center' })
      .webp({ quality: 90 })
      .toFile(path.join(targetDir, 'article-biblical-worship.webp'));
    fs.copyFileSync(path.join(targetDir, 'article-biblical-worship.webp'), path.join(globalDir, 'article-biblical-worship.webp'));
    console.log('Generated radio-bible.webp and article-biblical-worship.webp from new studio photo');
  }

  // 3. PayPal QR code (media_1792147527093_baeaa948.jpg) -> paypal-qr.webp
  if (fs.existsSync(imgPaypal)) {
    await sharp(imgPaypal)
      .resize(400, 400, { fit: 'contain', background: '#ffffff' })
      .webp({ quality: 90 })
      .toFile(path.join(targetDir, 'paypal-qr.webp'));
    fs.copyFileSync(path.join(targetDir, 'paypal-qr.webp'), path.join(globalDir, 'paypal-qr.webp'));
    console.log('Generated paypal-qr.webp');
  }

  // 4. Hero image: flip horizontally (flop)
  // Let's create hero-flipped.webp
  const heroSrc = 'portals/cc-global/assets/hero.webp';
  if (fs.existsSync(heroSrc)) {
    await sharp(heroSrc)
      .flop()
      .webp({ quality: 92 })
      .toFile(path.join(targetDir, 'hero-flipped.webp'));
    fs.copyFileSync(path.join(targetDir, 'hero-flipped.webp'), path.join(globalDir, 'hero-flipped.webp'));
    console.log('Generated hero-flipped.webp (horizontally mirrored)');
  }
}

processAssets().then(() => console.log('All user assets processed successfully.'));
