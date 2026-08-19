const fs = require('fs');
let c = fs.readFileSync('zapolske-live.html', 'utf8');
const oldCode = 'let customImgSrc = \"tlo_poranne_live.png\";';
const newCode = 'let customImgSrc = \"tlo_poranne_live.png\";\n              document.addEventListener(\"liveWindowManagerBgChange\", (e) => {\n                  if (e.detail && e.detail.src) {\n                      customImgSrc = e.detail.src;\n                      safeStorage.setItem(\"dzj_stream_image\", customImgSrc);\n                      if (bgImageSelect) bgImageSelect.value = customImgSrc;\n                      initBackground();\n                  }\n              });';
c = c.replace(oldCode, newCode);
fs.writeFileSync('zapolske-live.html', c, 'utf8');
