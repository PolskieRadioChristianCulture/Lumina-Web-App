const fs = require('fs');
let c = fs.readFileSync('zapolske-live.html', 'utf8');

c = c.replace(/\.header-brand\s*\{[\s\S]*?font-size:\s*1\.6rem;/g, (match) => match.replace('1.6rem', '1.3rem'));
c = c.replace(/\.tv-station-id\s*\{[\s\S]*?font-size:\s*1\.1rem;/g, (match) => match.replace('1.1rem', '1.3rem'));
c = c.replace(/\.live-badge\s*\{[\s\S]*?font-size:\s*1\.1rem;/g, (match) => match.replace('1.1rem', '1.3rem'));

c = c.replace(/font-size:\s*1\.1rem;\s*opacity:\s*0\.8;\s*margin-left:\s*10px;\s*margin-right:\s*10px;/g, 'font-size: 1.3rem; opacity: 0.8; margin-left: 10px; margin-right: 10px;');
c = c.replace(/font-size:\s*1\.0rem;\s*letter-spacing:\s*1px;/g, 'font-size: 1.3rem; letter-spacing: 1px;');

fs.writeFileSync('zapolske-live.html', c, 'utf8');
