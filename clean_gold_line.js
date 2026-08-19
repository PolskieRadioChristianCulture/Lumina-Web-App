const fs = require('fs');
let html = fs.readFileSync('cctv24-worship.html', 'utf8');

// 1. Position rds-bar perfectly inside the top cinematic bar
html = html.replace(/\.rds-bar\s*\{\s*position:\s*absolute;\s*top:\s*128px;/g, 
`.rds-bar {
            position: absolute;
            top: 70px;`);

// 2. Remove the gold gradient and gold line from top cinematic bar
html = html.replace(/\.cinema-bar-top\s*\{\s*top:\s*0;\s*background:\s*linear-gradient\([\s\S]*?\);\s*\}/, 
`.cinema-bar-top {
            top: 0;
            background: #000000;
        }`);

html = html.replace(/\.cinema-bar-top::after\s*\{[\s\S]*?animation:\s*gold-shimmer[\s\S]*?\}/, '');

fs.writeFileSync('cctv24-worship.html', html);
console.log("Removed gold line and repositioned rds-bar.");
