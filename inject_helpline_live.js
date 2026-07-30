const fs = require('fs');

const files = [
  'cctv24-pl.html',
  'cctv24-worship.html',
  'cctv24.html',
  'zapolske-live.html',
  'dzj-vertical-live.html'
];

const cssKeyframes = `
        /* --- LIVE HELPLINE PANEL ANIMATIONS --- */
        @keyframes live-helpline-pulse {
            0%   { box-shadow: 0 0 0px rgba(245,197,24,0); border-color: rgba(245,197,24,0.25); }
            100% { box-shadow: 0 0 16px rgba(245,197,24,0.4); border-color: rgba(245,197,24,0.65); }
        }
        @keyframes live-phone-ring {
            0%   { transform: rotate(-14deg) scale(1); }
            100% { transform: rotate(14deg) scale(1.2); }
        }
`;

const helplineHtml = `
                    <!-- INFOLINIA NADZIEJA CC - between clock and program card -->
                    <a href="tel:+48730958583" class="live-helpline-panel" title="Zadzwon: Infolinia Nadzieja Christian Culture" style="display:flex; align-items:center; gap:14px; background:rgba(245,197,24,0.08); border:1.5px solid rgba(245,197,24,0.3); border-radius:14px; padding:10px 18px; margin:8px 0; text-decoration:none; cursor:pointer; transition:background 0.2s, border-color 0.2s; animation: live-helpline-pulse 2.4s infinite alternate;" onmouseover="this.style.background='rgba(245,197,24,0.18)'; this.style.borderColor='rgba(245,197,24,0.7)';" onmouseout="this.style.background='rgba(245,197,24,0.08)'; this.style.borderColor='rgba(245,197,24,0.3)';">
                        <div style="width:42px; height:42px; border-radius:50%; background:linear-gradient(135deg,#f5c518,#e6a817); display:flex; align-items:center; justify-content:center; flex-shrink:0; box-shadow:0 0 14px rgba(245,197,24,0.5);">
                            <i class="fa-solid fa-phone-volume" style="color:#000; font-size:1.15rem; animation:live-phone-ring 1.6s infinite alternate;"></i>
                        </div>
                        <div style="display:flex; flex-direction:column; line-height:1.3;">
                            <span style="font-size:0.58rem; font-weight:800; color:rgba(245,197,24,0.85); text-transform:uppercase; letter-spacing:1px; font-family:'Montserrat',sans-serif;">Infolinia &ldquo;Nadzieja Christian Culture&rdquo;</span>
                            <span style="font-size:1.15rem; font-weight:900; color:#fff; letter-spacing:0.5px; font-family:'Montserrat',sans-serif;">+48 730 958 583</span>
                        </div>
                    </a>
`;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  if (content.includes('live-helpline-pulse')) {
    console.log(`SKIP (already done): ${file}`);
    continue;
  }

  // 1. Inject CSS before existing helpline CSS comment
  content = content.replace(
    '/* --- HELPLINE WIDGET --- */',
    cssKeyframes + '\n        /* --- HELPLINE WIDGET --- */'
  );

  // 2. Inject HTML between clock widget closing tag and Main Glass Card Container comment
  //    The pattern: </div>\n\n                    <!-- Main Glass Card Container -->
  content = content.replace(
    /(<\/div>\s*\n\s*\n\s*)(<!-- Main Glass Card Container -->)/,
    '$1' + helplineHtml + '\n                    $2'
  );

  fs.writeFileSync(file, content, 'utf8');
  console.log(`UPDATED: ${file}`);
}

console.log('Done!');
