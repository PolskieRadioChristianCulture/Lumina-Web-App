import fs from 'node:fs';
import path from 'node:path';

const MIRROR = 'C:\\Users\\czark\\Desktop\\@ICC\\LUMINA';
const files = [
  'news.html',
  'news/index.html',
  'assets/news-index-BsnoeFpX.js',
  'data/ccn-public-feed.json',
  'szukaj/catalog.json',
  'data/cc-search-index.json',
  'finanse.html',
  'finanse/index.html',
  'nauka.html',
  'nauka/index.html',
  'historia.html',
  'historia/index.html',
  'prawo.html',
  'prawo/index.html'
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
