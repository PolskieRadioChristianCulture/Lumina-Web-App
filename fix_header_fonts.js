const fs = require('fs');
let c = fs.readFileSync('zapolske-live.html', 'utf8');

c = c.replace(/font-size: 1\.6rem;/g, 'font-size: 1.3rem; /* Aligned */');
c = c.replace(/font-size: 1\.1rem;/g, 'font-size: 1.3rem; /* Aligned */');
c = c.replace(/font-size: 1\.0rem;/g, 'font-size: 1.3rem; /* Aligned */');

fs.writeFileSync('zapolske-live.html', c, 'utf8');
