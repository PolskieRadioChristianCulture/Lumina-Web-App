const fs = require('fs');
let js = fs.readFileSync('live-window-manager.js', 'utf8');

js = js.replace(/if \(bgImg\) bgImg\.src = src;/g, 
  'if (typeof window.crossfadeBackground === "function") { window.crossfadeBackground(src); } else if (bgImg) { bgImg.src = src; }');

fs.writeFileSync('live-window-manager.js', js, 'utf8');
