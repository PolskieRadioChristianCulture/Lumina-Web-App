const fs = require('fs');
let html = fs.readFileSync('cctv24-worship.html', 'utf8');

// Update PILNE WEZWANIE DO MODLITWY
html = html.replace(/PILNE WEZWANIE DO MODLITWY/g, 'PILNE WEZWANIE DO MODLITWY ZA OJCZYZNĘ');

fs.writeFileSync('cctv24-worship.html', html);
console.log("Updated PILNE WEZWANIE.");
