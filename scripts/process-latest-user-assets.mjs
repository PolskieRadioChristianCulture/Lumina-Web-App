import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const brainDir = 'C:/Users/czark/.gemini/antigravity/brain/6171dbb4-faed-472d-ab3b-0ab4afdc2e53/.user_uploaded';
const targetDir = 'portals/cc-global/assets';
const globalDir = 'Global/assets';

async function processNewAssets() {
  const imgRadioCg = path.join(brainDir, 'media_1792151718851_9c7e797c.jpg');
  const imgStudioSofa = path.join(brainDir, 'media_1792151725869_743a2045.jpg');

  // 1. Process Radio CG Logo
  if (fs.existsSync(imgRadioCg)) {
    console.log('Processing Radio CG logo from', imgRadioCg);
    await sharp(imgRadioCg)
      .resize(500, 500, { fit: 'cover' })
      .webp({ quality: 95 })
      .toFile(path.join(targetDir, 'logo-global.webp'));
      
    fs.copyFileSync(path.join(targetDir, 'logo-global.webp'), path.join(targetDir, 'radio-global.webp'));
    fs.copyFileSync(path.join(targetDir, 'logo-global.webp'), path.join(targetDir, 'radio-cg-logo.webp'));

    fs.copyFileSync(path.join(targetDir, 'logo-global.webp'), path.join(globalDir, 'logo-global.webp'));
    fs.copyFileSync(path.join(targetDir, 'logo-global.webp'), path.join(globalDir, 'radio-global.webp'));
    fs.copyFileSync(path.join(targetDir, 'logo-global.webp'), path.join(globalDir, 'radio-cg-logo.webp'));
    console.log('Generated logo-global.webp & radio-global.webp');
  } else {
    console.error('File not found:', imgRadioCg);
  }

  // 2. Process Magazine Lead Article & Global Bible Radio Art
  if (fs.existsSync(imgStudioSofa)) {
    console.log('Processing Studio Sofa photo from', imgStudioSofa);
    // 16:9 widescreen for magazine
    await sharp(imgStudioSofa)
      .resize(1024, 576, { fit: 'cover', position: 'center' })
      .webp({ quality: 95 })
      .toFile(path.join(targetDir, 'article-biblical-worship-v2.webp'));
      
    fs.copyFileSync(path.join(targetDir, 'article-biblical-worship-v2.webp'), path.join(targetDir, 'article-biblical-worship.webp'));
    fs.copyFileSync(path.join(targetDir, 'article-biblical-worship-v2.webp'), path.join(globalDir, 'article-biblical-worship-v2.webp'));
    fs.copyFileSync(path.join(targetDir, 'article-biblical-worship-v2.webp'), path.join(globalDir, 'article-biblical-worship.webp'));

    // Square crop for Global Bible Radio card
    await sharp(imgStudioSofa)
      .resize(500, 500, { fit: 'cover', position: 'center' })
      .webp({ quality: 95 })
      .toFile(path.join(targetDir, 'radio-bible.webp'));
    fs.copyFileSync(path.join(targetDir, 'radio-bible.webp'), path.join(globalDir, 'radio-bible.webp'));

    console.log('Generated article-biblical-worship-v2.webp & radio-bible.webp');
  } else {
    console.error('File not found:', imgStudioSofa);
  }
}

processNewAssets().then(() => console.log('Asset generation done.'));
