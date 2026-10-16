import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const targetDir = 'portals/cc-global/assets';
fs.mkdirSync(targetDir, { recursive: true });

const tasks = [
  { src: 'images/player/art-chan-cc.jpg', dest: 'radio-global.webp', width: 400, height: 400 },
  { src: 'images/player/art-chan-biblia.jpg', dest: 'radio-bible.webp', width: 400, height: 400 },
  { src: 'images/player/art-chan-biblia.jpg', dest: 'article-biblical-worship.webp', width: 600, height: 400 },
  { src: 'images/player/art-worship.jpg', dest: 'article-power-of-worship.webp', width: 300, height: 300 },
  { src: 'images/news/art-bog-jest-miloscia.jpg', dest: 'article-psalms.webp', width: 300, height: 300 },
  { src: 'images/player/art-biblia-glow.jpg', dest: 'article-music-scripture.webp', width: 300, height: 300 },
  { src: 'images/mapa-bg-earth.webp', dest: 'article-global-gospel.webp', width: 300, height: 300 },
  { src: 'images/player/art-worship.jpg', dest: 'playlist-worship.webp', width: 500, height: 320 },
  { src: 'images/news/art-bog-jest-miloscia.jpg', dest: 'playlist-faith.webp', width: 500, height: 320 },
  { src: 'images/news/art-samotnosc-w-sieci-prawdziwe-relacje.jpg', dest: 'playlist-growth.webp', width: 500, height: 320 },
  { src: 'images/player/art-chan-biblia.jpg', dest: 'playlist-devotionals.webp', width: 500, height: 320 },
  { src: 'images/news/art-czy-swiat-potrzebuje-przebudzenia-duchowego.jpg', dest: 'playlist-season.webp', width: 500, height: 320 },
];

for (const t of tasks) {
  const fullSrc = path.resolve(t.src);
  const fullDest = path.join(targetDir, t.dest);
  if (fs.existsSync(fullSrc)) {
    await sharp(fullSrc)
      .resize(t.width, t.height, { fit: 'cover' })
      .webp({ quality: 85 })
      .toFile(fullDest);
    console.log(`Generated: ${t.dest}`);
  } else {
    console.warn(`Source not found: ${t.src}`);
  }
}
console.log('All Global assets prepared.');
