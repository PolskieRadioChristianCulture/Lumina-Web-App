const fs = require('fs');
const path = require('path');

const directory = '.';
const searchString = 'cctv24';
const replaceString = 'cctv24';

function walkDir(dir) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.lstatSync(fullPath).isDirectory()) {
            if (file !== '.git' && file !== 'audio' && file !== 'images') {
                walkDir(fullPath);
            }
        } else {
            if (fullPath.endsWith('.html') || fullPath.endsWith('.js')) {
                let content = fs.readFileSync(fullPath, 'utf8');
                if (content.includes(searchString)) {
                    // Replace all occurrences using split and join to act as a global replace
                    content = content.split(searchString).join(replaceString);
                    fs.writeFileSync(fullPath, content, 'utf8');
                    console.log(`Updated ${fullPath}`);
                }
            }
        }
    });
}

walkDir(directory);
