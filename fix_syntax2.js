const fs = require('fs');

try {
    let content = fs.readFileSync('zapolske-live.html', 'utf8');

    // 1. Remove the bad `/*`
    content = content.replace(/\/\*\r?\n\s*if \(hour >= 21 \|\| hour < 6\) {/g, '// if (hour >= 21 || hour < 6) {');
    content = content.replace(/\s*return "CCTV_NOCA\.jpg\?v=1";/g, '\n                // return "CCTV_NOCA.jpg?v=1";');
    content = content.replace(/\s*}\r?\n/g, '\n                // }\n');

    fs.writeFileSync('zapolske-live.html', content, 'utf8');
    console.log("Fixed syntax");
} catch(e) {
    console.error(e);
}
