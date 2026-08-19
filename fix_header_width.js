const fs = require('fs');
let c = fs.readFileSync('zapolske-live.html', 'utf8');

c = c.replace(/header\s*\{[\s\S]*?padding:\s*0\s*70px;/g, (m) => m + '\n            width: 100%;\n            box-sizing: border-box;');

fs.writeFileSync('zapolske-live.html', c, 'utf8');
