const fs = require('fs');
let html = fs.readFileSync('cctv24-worship.html', 'utf8');

const searchStr = `        .ticker-marquee-text {
            display: flex !important;
            align-items: center !important;
            padding-left: 20px !important; /* Start immediately, just a tiny bit of padding */
            flex-shrink: 0 !important;
            white-space: nowrap !important;
        }`;

const fixStr = `        .ticker-marquee-text {
            display: inline-block !important; /* NOT FLEX! Flex compresses child spans into a blinking line */
            padding-left: 20px !important; /* Start immediately */
            flex-shrink: 0 !important;
            white-space: nowrap !important;
            line-height: 60px !important; /* Vertically center in the 60px footer */
        }`;

if (html.includes(searchStr)) {
    html = html.replace(searchStr, fixStr);
    fs.writeFileSync('cctv24-worship.html', html);
    console.log("Fixed ticker CSS - removed display: flex.");
} else {
    const normalizedHtml = html.replace(/\r\n/g, '\n');
    const normalizedSearch = searchStr.replace(/\r\n/g, '\n');
    if (normalizedHtml.includes(normalizedSearch)) {
        html = normalizedHtml.replace(normalizedSearch, fixStr);
        fs.writeFileSync('cctv24-worship.html', html);
        console.log("Fixed ticker CSS - removed display: flex (normalized).");
    } else {
        console.log("Could not find ticker CSS.");
    }
}
