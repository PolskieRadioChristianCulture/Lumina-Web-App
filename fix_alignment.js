const fs = require('fs');
let c = fs.readFileSync('zapolske-live.html', 'utf8');

// Fix flex alignment from center to baseline for the text containers
c = c.replace(/\.header-brand\s*\{[\s\S]*?align-items:\s*center;/g, (m) => m.replace('align-items: center;', 'align-items: baseline;'));
c = c.replace(/class="header-brand" style="display:flex; align-items:center;/g, 'class="header-brand" style="display:flex; align-items:baseline;');
c = c.replace(/id="zenoNowPlaying" style="display:flex; align-items:center;/g, 'id="zenoNowPlaying" style="display:flex; align-items:baseline;');

// The live-tag-container might be okay as center because of the badge, but let's make it center and adjust padding/margin if needed.
// Actually, let's keep live-tag-container as center, since it contains the badge block.

// Add cache buster to script
c = c.replace(/<script src="live-window-manager\.js.*?"><\/script>/g, `<script src="live-window-manager.js?v=${Date.now()}"></script>`);

fs.writeFileSync('zapolske-live.html', c, 'utf8');
