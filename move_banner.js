const fs = require('fs');

try {
    let content = fs.readFileSync('modlitwa.html', 'utf8');

    // Regex to match the newly added Pilne Wezwanie banner block
    const bannerRegex = /(<!-- Bottom Info Banner Section -->[\s\S]*?<div class="content-card" style="margin-top: 10px; padding: 30px; text-align: left; overflow: hidden;">[\s\S]*?#ZjednoczeniZaPolskę\s*<\/p>\s*<\/div>\s*<\/div>)/;

    const match = content.match(bannerRegex);
    
    if (match) {
        const bannerCode = match[1];
        
        // Remove it from its original place at the bottom
        content = content.replace(bannerRegex, '');
        
        // Find the place to insert: right after `<div class="main-container">`
        // We will insert it and add some bottom margin to separate it from the grid-section below.
        
        const modifiedBanner = bannerCode.replace(/margin-top: 10px;/, 'margin-top: 10px; margin-bottom: 30px;');
        
        content = content.replace(
            /(<div class="main-container">\s*)/,
            `$1${modifiedBanner}\n\n`
        );
        
        fs.writeFileSync('modlitwa.html', content, 'utf8');
        console.log("Success");
    } else {
        console.log("Banner not found");
    }
} catch (e) {
    console.error(e);
}
