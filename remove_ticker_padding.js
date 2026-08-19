const fs = require('fs');
let html = fs.readFileSync('cctv24-worship.html', 'utf8');

const searchStr = `        .ticker-marquee-text {
            display: flex !important;
            align-items: center !important;
            padding-left: 100% !important;
            flex-shrink: 0 !important; /* CRITICAL: prevents text from being crushed by flexbox */
            white-space: nowrap !important;
        }`;

const fixStr = `        .ticker-marquee-text {
            display: flex !important;
            align-items: center !important;
            padding-left: 20px !important; /* Start immediately, just a tiny bit of padding */
            flex-shrink: 0 !important;
            white-space: nowrap !important;
        }`;

if (html.includes(searchStr)) {
    html = html.replace(searchStr, fixStr);
    fs.writeFileSync('cctv24-worship.html', html);
    console.log("Fixed ticker CSS - removed padding-left 100%.");
} else {
    const normalizedHtml = html.replace(/\r\n/g, '\n');
    const normalizedSearch = searchStr.replace(/\r\n/g, '\n');
    if (normalizedHtml.includes(normalizedSearch)) {
        html = normalizedHtml.replace(normalizedSearch, fixStr);
        fs.writeFileSync('cctv24-worship.html', html);
        console.log("Fixed ticker CSS - removed padding-left 100% (normalized).");
    } else {
        console.log("Could not find ticker CSS.");
    }
}
