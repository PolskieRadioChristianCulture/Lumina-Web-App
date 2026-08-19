const fs = require('fs');
let html = fs.readFileSync('cctv24-worship.html', 'utf8');

// The rds-bar block
const rdsBarRegex = /(<div class="rds-bar" id="rdsWrap"[\s\S]*?<\/div>\s*<\/div>)/;
const match = html.match(rdsBarRegex);

if (match) {
    let rdsBarHtml = match[0];
    
    // Check if it's already inside app-container by looking at where it is.
    // If it is before <div id="app-container">, we need to move it.
    let indexRds = html.indexOf('id="rdsWrap"');
    let indexApp = html.indexOf('id="app-container"');
    
    if (indexRds < indexApp) {
        // Remove it from its current position
        html = html.replace(rdsBarRegex, '');
        // Insert it right after <div id="app-container">
        html = html.replace('<div id="app-container">', '<div id="app-container">\n\n' + rdsBarHtml);
        fs.writeFileSync('cctv24-worship.html', html);
        console.log('Moved rds-bar inside app-container');
    } else {
        console.log('rds-bar is already inside or after app-container');
    }
} else {
    console.log('rds-bar not found');
}
