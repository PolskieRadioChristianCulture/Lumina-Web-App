const fs = require('fs');
let html = fs.readFileSync('cctv24-worship.html', 'utf8');

const searchStr = `        /* --- Move ticker elements ABOVE the 21:9 letterbox --- */
        footer {
            margin-bottom: 128px !important;
        }`;

const fixStr = `        /* --- Move ticker elements ABOVE the 21:9 letterbox --- */
        footer {
            transform: translateY(-128px) !important;
        }`;

if (html.includes(searchStr)) {
    html = html.replace(searchStr, fixStr);
    fs.writeFileSync('cctv24-worship.html', html);
    console.log("Footer fixed - changed margin-bottom to transform.");
} else {
    const normalizedHtml = html.replace(/\r\n/g, '\n');
    const normalizedSearch = searchStr.replace(/\r\n/g, '\n');
    if (normalizedHtml.includes(normalizedSearch)) {
        html = normalizedHtml.replace(normalizedSearch, fixStr);
        fs.writeFileSync('cctv24-worship.html', html);
        console.log("Footer fixed (normalized).");
    } else {
        console.log("Could not find the footer margin CSS.");
    }
}
