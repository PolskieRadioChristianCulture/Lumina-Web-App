import fs from 'node:fs';
import path from 'node:path';

const MIRROR = 'C:\\Users\\czark\\Desktop\\@ICC\\LUMINA';
const files = [
  'news/paryz-godzina-policyjna-protesty-francja-biblia.html',
  'news/paryz-godzina-policyjna-protesty-francja-biblia/index.html',
  'images/news/paryz-godzina-policyjna-protesty-francja-biblia.jpg',
  'images/news/art-paryz-godzina-policyjna-protesty-francja-biblia.jpg',
  'images/news/paryz-w-ogniu-protesty-2026.jpg',
  'data/ccn-article-routes.js',
  'sitemap.xml',
  'portals/ccn-news/src/data/articles.ts'
];

for (const rel of files) {
  const src = path.resolve(rel);
  const dst = path.join(MIRROR, rel);
  if (fs.existsSync(src)) {
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.copyFileSync(src, dst);
    console.log('Copied to mirror:', rel);
  }
}
