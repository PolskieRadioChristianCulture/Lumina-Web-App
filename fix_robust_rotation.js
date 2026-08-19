const fs = require('fs');
let c = fs.readFileSync('zapolske-live.html', 'utf8');

const regex = /let currentSrcFilename = bgActiveImg\.src\.substring\(bgActiveImg\.src\.lastIndexOf\('\/'\) \+ 1\);[\s\S]*?if \(currentSrcFilename !== currentBg\) \{[\s\S]*?bgActiveImg\.src = currentBg \+ "\?v=" \+ Math\.floor\(Date\.now\(\) \/ 60000\); \/\/ cache buster updated per minute[\s\S]*?applyBodyModeClass\(\);[\s\S]*?\}/;

const replaceWith = `
                      if (window._lastAppliedBg !== currentBg) {
                          bgActiveImg.src = currentBg + "?v=" + Math.floor(Date.now() / 60000); // cache buster updated per minute
                          window._lastAppliedBg = currentBg;
                          applyBodyModeClass();
                      }`;

c = c.replace(regex, replaceWith);

fs.writeFileSync('zapolske-live.html', c, 'utf8');
