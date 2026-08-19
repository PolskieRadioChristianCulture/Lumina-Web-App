const fs = require('fs');
let c = fs.readFileSync('zapolske-live.html', 'utf8');

c = c.replace(/style="max-width: 400px; overflow: hidden; text-overflow: ellipsis;" style="font-family: 'Outfit', sans-serif;"/g, 
              'style="max-width: 400px; overflow: hidden; text-overflow: ellipsis; font-family: \'Outfit\', sans-serif;"');

fs.writeFileSync('zapolske-live.html', c, 'utf8');
