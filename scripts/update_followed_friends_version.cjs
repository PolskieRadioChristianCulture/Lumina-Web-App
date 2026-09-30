const fs = require('fs');
const path = require('path');

const targetFiles = [
    'lumina-profile.html',
    'lumina.andrzejthiel.html',
    'lumina.cctv.html',
    'lumina.ccmen.html',
    'lumina.osobowoscplus.html',
    'lumina.radiocc.html',
    'lumina.pawelmurawski.html',
    'lumina.zofiadudek.html',
    'lumina.magdalena.html',
    'lumina.jolawojcik.html',
    'lumina.cezaryrgowski.html',
    'lumina.wiolettarogowska.html',
    'lumina.zbyszekgieron.html',
    'lumina.studiodobregoslowa.html',
    'lumina.ccwomen.html'
];

let updatedCount = 0;

for (const relPath of targetFiles) {
    const fullPath = path.resolve(relPath);
    if (!fs.existsSync(fullPath)) {
        console.warn(`File not found: ${relPath}`);
        continue;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    const oldPattern = /src="js\/lumina-followed-friends\.js(?:\?[^"]*)?"/g;
    const newReplacement = 'src="js/lumina-followed-friends.js?v=20260918_green_dot_clean"';

    if (oldPattern.test(content)) {
        content = content.replace(oldPattern, newReplacement);
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`✅ Updated: ${relPath}`);
        updatedCount++;
    } else {
        console.log(`ℹ️ Pattern not matched in: ${relPath}`);
    }
}

console.log(`\n🎉 Successfully updated ${updatedCount} HTML files!`);
