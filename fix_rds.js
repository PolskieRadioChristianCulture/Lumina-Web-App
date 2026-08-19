const fs = require('fs');
let c = fs.readFileSync('zapolske-live.html', 'utf8');
const target = 'if (cleanTitle && zenoTrackTitle.textContent !== cleanTitle) {';
const replacement = 'let cleanTitleFixed = cleanTitle;\n                                  const targetString = \"aplikacji Christian Culture cclite.pl\";\n                                  const targetIndex = cleanTitleFixed.indexOf(targetString);\n                                  if (targetIndex !== -1) {\n                                      cleanTitleFixed = cleanTitleFixed.substring(0, targetIndex + targetString.length) + \" oraz na www.polskieradio.cc\";\n                                  }\n                                  if (cleanTitleFixed && zenoTrackTitle.textContent !== cleanTitleFixed) {';
c = c.replace(target, replacement);
// We also need to change the inner assignment
c = c.replace('zenoTrackTitle.textContent = cleanTitle;', 'zenoTrackTitle.textContent = cleanTitleFixed;');
fs.writeFileSync('zapolske-live.html', c, 'utf8');
