import fs from 'fs';
import { execSync } from 'child_process';

const portals = [
  'music.html', 'news.html', 'nauka.html', 'historia.html', 'biologia.html', 
  'prawo.html', 'seks.html', 'biznes.html', 'technologie.html', 'kultura.html', 
  'biblioteka.html', 'apologetyka.html'
];

for (const p of portals) {
  if (!fs.existsSync(p)) continue;
  const content = fs.readFileSync(p, 'utf8');
  const matches = content.match(/\/assets\/[a-zA-Z0-9_\-\.]+\.(?:js|css)/g) || [];
  for (const src of matches) {
    const localPath = '.' + src;
    const exists = fs.existsSync(localPath);
    let tracked = false;
    try {
      const gitOut = execSync(`git ls-files "${localPath.replace(/^\.\//, '')}"`, { encoding: 'utf8' }).trim();
      tracked = gitOut.length > 0;
    } catch (e) {}
    console.log(`${p} -> ${src} | Disk: ${exists ? 'OK' : 'MISSING'} | Git: ${tracked ? 'TRACKED' : 'UNTRACKED'}`);
  }
}
