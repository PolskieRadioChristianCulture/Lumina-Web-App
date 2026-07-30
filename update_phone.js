const fs = require('fs');
const path = require('path');

const dir = __dirname;
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace all occurrences of 530 736 155 with 507 821 789
    // Note: The user provided "+48 507 821 789", so I will format it as "507 821 789" to match the original layout, but let's just use "507 821 789"
    if (content.includes('530 736 155')) {
        content = content.replace(/530 736 155/g, '507 821 789');
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated phone number in ${file}`);
    }
});
