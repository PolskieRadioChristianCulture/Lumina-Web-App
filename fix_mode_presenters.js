const fs = require('fs');
let c = fs.readFileSync('zapolske-live.html', 'utf8');

c = c.replace(/\|\| currentBg\.includes\("tlo_poranne_live"\) \|\| customImgSrc\.includes\("tlo_poranne_live"\)\)/,
              '|| currentBg.includes("tlo_poranne_live") || customImgSrc.includes("tlo_poranne_live") || currentBg.includes("tlo_live_1") || customImgSrc.includes("tlo_live_1") || currentBg.includes("tlo_live_2") || customImgSrc.includes("tlo_live_2"))');

fs.writeFileSync('zapolske-live.html', c, 'utf8');
