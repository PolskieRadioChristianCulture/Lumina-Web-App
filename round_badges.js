const fs = require('fs');
let html = fs.readFileSync('cctv24-worship.html', 'utf8');

// Update border-radius, add font-size scaling and better padding for the inline badges
const replaceBadge = (match) => {
    return match
        .replace(/border-radius:\s*4px/g, 'border-radius: 30px')
        .replace(/padding:\s*0px\s*8px/g, 'padding: 4px 24px; font-size: 0.75em; vertical-align: middle; line-height: 1.2');
};

html = html.replace(/<span style="background: #[0-9A-Fa-f]{6};[^"]+">/g, replaceBadge);

fs.writeFileSync('cctv24-worship.html', html);
console.log("Rounded corners and optimized badge sizes.");
