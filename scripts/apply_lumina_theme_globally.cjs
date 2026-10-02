const fs = require('fs');
const path = require('path');

const targetFiles = [
  'lumina.html',
  'lumina-profile.html',
  'lumina.cezaryrgowski.html',
  'lumina.cezaryrogowski.html',
  'lumina.wiolettarogowska.html',
  'lumina.andrzejthiel.html',
  'lumina.radiocc.html',
  'lumina.studiodobregoslowa.html',
  'lumina.ccmen.html',
  'lumina.ccwomen.html',
  'lumina.cctv.html',
  'lumina.jolawojcik.html',
  'lumina.magdalena.html',
  'lumina.mariusz.html',
  'lumina.osobowoscplus.html',
  'lumina.pawelmurawski.html',
  'lumina.zbyszekgieron.html',
  'lumina.zofiadudek.html',
  'lumina-safety.html',
  'lumina-app.html',
  'lumina-shorts.html',
  'lumina-login.html',
  'lumina-tablica.html',
  'lumina-tablica-light.html'
];

const cssLink = '    <link rel="stylesheet" href="/css/lumina-light-edition.css?v=20261002_master">\n';
const jsScript = '    <script src="/js/lumina-theme-manager.js?v=20261002_master"></script>\n';

const buttonMarkup = `    <!-- ══════════ PŁYWAJĄCY PRZEŁĄCZNIK MOTYWU (LUMINA LIGHT & PURE EDITION) ══════════ -->
    <button type="button" class="lumina-theme-switch-pill" id="luminaThemeSwitchBtn" onclick="toggleLuminaTheme()" title="Przełącz motyw (Jasny / Ciemny)">
        <i class="fa-solid fa-moon theme-icon" id="luminaThemeIcon"></i>
        <span id="luminaThemeLabel">Motyw: Ciemny (Obsidian)</span>
    </button>
`;

let modifiedCount = 0;

targetFiles.forEach(file => {
  if (!fs.existsSync(file)) {
    console.log(`[SKIP] File not found: ${file}`);
    return;
  }

  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // 1. Add CSS if missing
  if (!content.includes('lumina-light-edition.css')) {
    // Try to insert after lumina-theme.css or lumina-mobile-premium.css or </head>
    if (content.includes('/css/lumina-mobile-premium.css')) {
      content = content.replace(
        /(\s*<link rel="stylesheet"[^>]+lumina-mobile-premium\.css[^>]*>)/i,
        `$1\n${cssLink.trimEnd()}`
      );
      changed = true;
    } else if (content.includes('</head>')) {
      content = content.replace('</head>', `${cssLink}</head>`);
      changed = true;
    }
  }

  // 2. Add JS script if missing
  if (!content.includes('lumina-theme-manager.js')) {
    if (content.includes('</head>')) {
      content = content.replace('</head>', `${jsScript}</head>`);
      changed = true;
    }
  }

  // 3. Add Switch button if missing
  if (!content.includes('id="luminaThemeSwitchBtn"')) {
    if (content.includes('</body>')) {
      content = content.replace('</body>', `${buttonMarkup}</body>`);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    modifiedCount++;
    console.log(`[UPDATED] ${file}`);
  } else {
    console.log(`[NO CHANGE] ${file} already configured`);
  }
});

console.log(`\nCompleted. Updated ${modifiedCount} files.`);
