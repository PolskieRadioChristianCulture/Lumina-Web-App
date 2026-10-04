const fs = require('fs');
const path = require('path');

const LUMINA_ROOT = path.resolve('C:/Users/czark/Desktop/@ICC/LUMINA');
const PROJEKTY_ROOT = path.resolve('C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc');

const PORTALS = [
  'nauka',
  'historia',
  'biologia',
  'prawo',
  'seks',
  'biblioteka',
  'edukacja',
  'psychologia',
  'finanse',
  'technologie',
  'misje',
  'apologetyka'
];

console.log('=== CHECK AND UPDATE PORTAL SCRIPT TAGS ===');

for (const portal of PORTALS) {
  // Find newest JS and CSS in LUMINA/assets
  const jsFiles = fs.readdirSync(path.join(LUMINA_ROOT, 'assets'))
    .filter(f => f.startsWith(`${portal}-index-`) && f.endsWith('.js'))
    .map(f => {
      const full = path.join(LUMINA_ROOT, 'assets', f);
      const content = fs.readFileSync(full, 'utf8');
      return {
        file: f,
        mtime: fs.statSync(full).mtimeMs,
        hasX: content.includes('x.com/intent/tweet')
      };
    })
    .sort((a, b) => b.mtime - a.mtime);

  const cssFiles = fs.readdirSync(path.join(LUMINA_ROOT, 'assets'))
    .filter(f => f.startsWith(`${portal}-index-`) && f.endsWith('.css'))
    .map(f => ({
      file: f,
      mtime: fs.statSync(path.join(LUMINA_ROOT, 'assets', f)).mtimeMs
    }))
    .sort((a, b) => b.mtime - a.mtime);

  if (!jsFiles.length || !cssFiles.length) {
    console.warn(`WARNING: Missing assets for ${portal}`);
    continue;
  }

  const bestJs = jsFiles.find(j => j.hasX) || jsFiles[0];
  const bestCss = cssFiles[0];

  console.log(`\nPortal: ${portal}`);
  console.log(`  Target JS:  ${bestJs.file} (hasX: ${bestJs.hasX})`);
  console.log(`  Target CSS: ${bestCss.file}`);

  const jsUrl = `/assets/${bestJs.file}`;
  const cssUrl = `/assets/${bestCss.file}`;

  for (const root of [LUMINA_ROOT, PROJEKTY_ROOT]) {
    if (!fs.existsSync(root)) continue;
    const rootHtml = path.join(root, `${portal}.html`);
    const subHtml = path.join(root, portal, 'index.html');

    for (const filePath of [rootHtml, subHtml]) {
      if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        const oldJsMatch = content.match(/src="(\/assets\/[^"]+\.js)"/);
        const oldCssMatch = content.match(/href="(\/assets\/[^"]+\.css)"/);

        let modified = false;
        if (oldJsMatch && oldJsMatch[1] !== jsUrl) {
          content = content.replace(oldJsMatch[0], `src="${jsUrl}"`);
          modified = true;
        }
        if (oldCssMatch && oldCssMatch[1] !== cssUrl) {
          content = content.replace(oldCssMatch[0], `href="${cssUrl}"`);
          modified = true;
        }

        if (modified) {
          fs.writeFileSync(filePath, content, 'utf8');
          console.log(`  ✓ Updated ${filePath}`);
        } else {
          console.log(`  - Already up to date: ${path.basename(filePath)} (${oldJsMatch ? oldJsMatch[1] : 'no match'})`);
        }
      }
    }

    // Also ensure the assets are in PROJEKTY_ROOT/assets
    const projAssetsDir = path.join(root, 'assets');
    if (!fs.existsSync(projAssetsDir)) fs.mkdirSync(projAssetsDir, { recursive: true });
    fs.copyFileSync(path.join(LUMINA_ROOT, 'assets', bestJs.file), path.join(projAssetsDir, bestJs.file));
    fs.copyFileSync(path.join(LUMINA_ROOT, 'assets', bestCss.file), path.join(projAssetsDir, bestCss.file));
  }
}

console.log('\n=== DONE ===');
