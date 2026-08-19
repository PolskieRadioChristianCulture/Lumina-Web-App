const fs = require('fs');
let c = fs.readFileSync('zapolske-live.html', 'utf8');

// 1. Add bg-img-next to HTML
c = c.replace(/<img id="bg-img-active".*?>/, '<img id="bg-img-active" class="bg-layer bg-image" style="opacity: 1; transition: opacity 2s ease-in-out;" src="Czwartek_za_Polske.jpg" alt="Breakfast Studio">\n          <img id="bg-img-next" class="bg-layer bg-image" style="opacity: 0; transition: opacity 2s ease-in-out;" src="" alt="">');

// 2. Inject crossfade function
const crossfadeFunc = `
              function crossfadeBackground(newSrc) {
                  const active = document.getElementById("bg-img-active");
                  const next = document.getElementById("bg-img-next");
                  if (!active || !next) return;
                  
                  let currentSrc = active.src.substring(active.src.lastIndexOf('/') + 1).split('?')[0];
                  let targetSrc = newSrc.substring(newSrc.lastIndexOf('/') + 1).split('?')[0];
                  
                  if (currentSrc === targetSrc && active.style.opacity == 1) return;
                  
                  next.src = newSrc;
                  next.onload = () => {
                      next.style.opacity = 1;
                      active.style.opacity = 0;
                      setTimeout(() => {
                          active.id = "bg-img-temp";
                          next.id = "bg-img-active";
                          active.id = "bg-img-next";
                      }, 2000);
                  };
                  next.onerror = () => {
                      active.src = newSrc;
                  };
              }
`;
c = c.replace(/const opPanel = document.getElementById\("operatorPanel"\);/, crossfadeFunc + '\n              const opPanel = document.getElementById("operatorPanel");');

// 3. Replace direct src assignments with crossfadeBackground
c = c.replace(/if \(bgImg && img\) bgImg\.src = img;/g, 'if (img) crossfadeBackground(img);');
c = c.replace(/if \(bgActiveImg\) \{\s*bgActiveImg\.src = getDynamicBackground\(customImgSrc\);\s*\}/g, 'crossfadeBackground(getDynamicBackground(customImgSrc));');
c = c.replace(/if \(bgActiveImg\) bgActiveImg\.src = getDynamicBackground\(customImgSrc\);/g, 'crossfadeBackground(getDynamicBackground(customImgSrc));');
c = c.replace(/if \(bgActiveImg\) \{\s*bgActiveImg\.src = activeBg;\s*bgActiveImg\.style\.opacity = 1;\s*\}/g, 'crossfadeBackground(activeBg);');

// 4. Update the rotation loop to crossfade and 5 minutes
const rotateRegex = /if \(window\._lastAppliedBg !== currentBg\) \{[\s\S]*?bgActiveImg\.src = currentBg \+ "\?v=" \+ Math\.floor\(Date\.now\(\) \/ 60000\);[\s\S]*?window\._lastAppliedBg = currentBg;[\s\S]*?applyBodyModeClass\(\);[\s\S]*?\}/;
const rotateReplace = `if (window._lastAppliedBg !== currentBg) {
                          crossfadeBackground(currentBg + "?v=" + Math.floor(Date.now() / 60000));
                          window._lastAppliedBg = currentBg;
                          setTimeout(applyBodyModeClass, 1000); // Apply class halfway through fade
                      }`;
c = c.replace(rotateRegex, rotateReplace);

// 5. Update rotation interval from 1 min to 5 mins
c = c.replace(/const min = new Date\(\)\.getMinutes\(\);\s*const isPoranneTurn = \(min % 2 === 0\);/g, 
              'const min = new Date().getMinutes();\n                  const isPoranneTurn = (Math.floor(min / 5) % 2 === 0);');

// 6. Fix `applyBodyModeClass` to get current background from `window._lastAppliedBg` or `bg-img-active`
c = c.replace(/const currentBg = bgActiveImg\.src\.substring\(bgActiveImg\.src\.lastIndexOf\('\/'\) \+ 1\);/g, 
              'const activeEl = document.getElementById("bg-img-active");\n                  const currentBg = activeEl ? activeEl.src.substring(activeEl.src.lastIndexOf(\'/\') + 1) : "";');

fs.writeFileSync('zapolske-live.html', c, 'utf8');
