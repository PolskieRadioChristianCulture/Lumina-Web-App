const fs = require('fs');
let html = fs.readFileSync('cctv24-worship.html', 'utf8');

// 1. Fix the override font-size for ticker-marquee-text
html = html.replace(/\.ticker-marquee-text \{ font-size: 1\.2rem !important;/g, 
'.ticker-marquee-text { font-size: 2.4rem !important;');

// 2. Reduce the padding and brightness of inline colored rectangles in the ticker
// Yellow/Gold rectangle (was #FFCC00) -> make it muted #B38F00
html = html.replace(/background: #FFCC00; color: #000000; padding: 2px 8px;/g, 
'background: #A68A00; color: #ffffff; padding: 0px 8px;');

// Red rectangle (was #dc143c) -> make it muted #8B0000 (DarkRed)
html = html.replace(/background: #dc143c; color: #ffffff; padding: 2px 8px;/g, 
'background: #8B0000; color: #ffffff; padding: 0px 8px;');

fs.writeFileSync('cctv24-worship.html', html);
console.log("Fixed ticker font size override and reduced rectangle sizes and brightness.");
