const fs = require('fs');
let html = fs.readFileSync('cctv24-worship.html', 'utf8');

// Move wide-spectrum up to sit above the footer (128 + 60 = 188px)
html = html.replace(/\.wide-spectrum\s*\{\s*position:\s*absolute;\s*bottom:\s*128px;/g, 
`.wide-spectrum {
            position: absolute;
            bottom: 188px;`);

fs.writeFileSync('cctv24-worship.html', html);
console.log("Applied spectrum adjustment.");
