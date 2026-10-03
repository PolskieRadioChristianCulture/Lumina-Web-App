const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const results = [];

const LOGO_PATTERNS = [
  /ccn[-_]logo[^\s"'<>)]*/i,
  /ccn[-_]news[-_]logo[^\s"'<>)]*/i,
  /ccn_news_logo[^\s"'<>)]*/i
];

function scanDirectory(dir) {
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of list) {
    if (item.name.startsWith('.') || item.name === 'node_modules' || item.name === '.pages-release' || item.name === 'scratch') continue;
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      scanDirectory(fullPath);
    } else if (item.name.endsWith('.html')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      let hasMatch = false;
      for (const pat of LOGO_PATTERNS) {
        if (pat.test(content)) {
          hasMatch = true;
          break;
        }
      }
      
      if (hasMatch) {
        // Znajdźmy tagi <img> lub kontenery zawierające logo
        const regexImg = /<img[^>]+src=["'][^"']*(?:ccn[-_]logo|ccn_news)[^"']*["'][^>]*>/gi;
        let match;
        const occurrences = [];
        while ((match = regexImg.exec(content)) !== null) {
          // Sprawdzamy otaczający link <a>
          const startIdx = Math.max(0, match.index - 300);
          const endIdx = Math.min(content.length, match.index + match[0].length + 300);
          const contextStr = content.slice(startIdx, endIdx);
          
          // Szukamy najbliższego taga <a> przed img
          const beforeImg = content.slice(startIdx, match.index);
          const lastA = beforeImg.lastIndexOf('<a ');
          let href = null;
          let isWrappedInA = false;
          if (lastA !== -1) {
            const closingA = beforeImg.indexOf('</a>', lastA);
            if (closingA === -1) {
              isWrappedInA = true;
              const aTag = beforeImg.slice(lastA);
              const hrefMatch = aTag.match(/href=["']([^"']*)["']/i);
              href = hrefMatch ? hrefMatch[1] : null;
            }
          }
          
          occurrences.push({
            imgTag: match[0],
            isWrappedInA,
            href,
            index: match.index
          });
        }
        
        results.push({
          file: path.relative(rootDir, fullPath),
          occurrences
        });
      }
    }
  }
}

scanDirectory(rootDir);

console.log('Znaleziono ' + results.length + ' plików HTML z logo CCN:\n');
for (const r of results) {
  console.log(`FILE: ${r.file} (${r.occurrences.length} wystąpień)`);
  for (const o of r.occurrences) {
    console.log(`   Img: ${o.imgTag}`);
    console.log(`   Wrapped in <a>: ${o.isWrappedInA}, Href: ${o.href}`);
  }
}
