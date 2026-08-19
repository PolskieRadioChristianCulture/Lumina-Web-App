const fs = require('fs');
let html = fs.readFileSync('cctv24-worship.html', 'utf8');

const searchStr = `        .cinema-bar-bottom {
            bottom: 0;
            background: linear-gradient(
                0deg,
                #000000 0%,
                #000000 70%,
                rgba(20, 12, 0, 0.92) 88%,
                rgba(212, 175, 55, 0.06) 100%
            );
        }`;

const fixStr = `        .cinema-bar-bottom {
            bottom: 0;
            background: #000000;
        }`;

if (html.includes(searchStr)) {
    html = html.replace(searchStr, fixStr);
    fs.writeFileSync('cctv24-worship.html', html);
    console.log("Bottom bar background is now pure black.");
} else {
    // try to match with different line endings
    const normalizedHtml = html.replace(/\r\n/g, '\n');
    const normalizedSearch = searchStr.replace(/\r\n/g, '\n');
    if (normalizedHtml.includes(normalizedSearch)) {
        html = normalizedHtml.replace(normalizedSearch, fixStr);
        fs.writeFileSync('cctv24-worship.html', html);
        console.log("Bottom bar background is now pure black (normalized).");
    } else {
        console.log("Could not find the bottom bar CSS.");
    }
}
