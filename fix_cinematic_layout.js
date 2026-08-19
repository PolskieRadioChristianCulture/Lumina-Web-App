const fs = require('fs');
let html = fs.readFileSync('cctv24-worship.html', 'utf8');

// 1. Move rds-bar down by 128px
html = html.replace(/\.rds-bar\s*\{\s*position:\s*fixed;\s*top:\s*0;/g, '.rds-bar {\n            position: fixed;\n            top: 128px;');

// 2. Adjust emission-grid to fit exactly between the 128px letterboxes
html = html.replace(/\.emission-grid\s*\{\s*position:\s*relative;\s*z-index:\s*10;\s*width:\s*1920px;\s*height:\s*1080px;/g, 
`.emission-grid {
            position: absolute;
            top: 128px;
            z-index: 10;
            width: 1920px;
            height: 824px;`);

// 3. Move wide-spectrum up to sit above the footer (128 + 60 = 188px)
html = html.replace(/\.wide-spectrum\s*\{\s*width:\s*100%;\s*height:\s*150px;\s*position:\s*absolute;\s*bottom:\s*128px;/g, 
`.wide-spectrum {
            width: 100%;
            height: 150px;
            position: absolute;
            bottom: 188px;`);

fs.writeFileSync('cctv24-worship.html', html);
console.log("Applied cinematic letterbox adjustments.");
