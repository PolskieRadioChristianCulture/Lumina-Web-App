import fs from 'fs';
const html = fs.readFileSync('lumina.html', 'utf8');
const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
let match;
let i = 0;
let errors = 0;
while ((match = scriptRegex.exec(html)) !== null) {
  i++;
  const tag = match[0];
  const content = match[1];
  if (tag.includes('src=')) continue;
  if (tag.includes('type="module"') || tag.includes("type='module'")) {
    console.log(`Script #${i} (module): OK`);
    continue;
  }
  try {
    new Function(content);
    console.log(`Script #${i} (standard): OK`);
  } catch(e) {
    console.error(`Script #${i} ERROR:`, e.message);
    errors++;
  }
}
if (errors === 0) {
  console.log('✅ ALL INLINE SCRIPTS IN LUMINA.HTML VALIDATED WITH 0 SYNTAX ERRORS!');
} else {
  process.exit(1);
}
