const fs = require('fs');
let html = fs.readFileSync('cctv24-worship.html', 'utf8');

const searchWrap = `        .ticker-marquee-wrap {
            display: flex !important;
            align-items: center !important;
            flex: 1 !important;
            width: 100% !important;
            overflow: hidden !important;
        }`;

const fixWrap = `        .ticker-marquee-wrap {
            display: block !important; /* Block instead of flex to prevent shrinking of child */
            flex: 1 !important;
            width: 100% !important;
            overflow: hidden !important;
            height: 60px !important; /* Match footer height */
            position: relative !important;
        }`;

const searchText = `        .ticker-marquee-text {
            display: inline-block !important; /* NOT FLEX! Flex compresses child spans into a blinking line */
            padding-left: 20px !important; /* Start immediately */
            flex-shrink: 0 !important;
            white-space: nowrap !important;
            line-height: 60px !important; /* Vertically center in the 60px footer */
        }`;

const fixText = `        .ticker-marquee-text {
            display: inline-block !important; 
            padding-left: 20px !important; 
            white-space: nowrap !important;
            line-height: 60px !important; 
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
        }`;


let changed = false;

if (html.includes(searchWrap)) {
    html = html.replace(searchWrap, fixWrap);
    changed = true;
} else {
    // Normalize
    const normalizedHtml = html.replace(/\r\n/g, '\n');
    const normalizedSearch = searchWrap.replace(/\r\n/g, '\n');
    if (normalizedHtml.includes(normalizedSearch)) {
        html = normalizedHtml.replace(normalizedSearch, fixWrap);
        changed = true;
    }
}

if (html.includes(searchText)) {
    html = html.replace(searchText, fixText);
    changed = true;
} else {
    // Normalize
    const normalizedHtml = html.replace(/\r\n/g, '\n');
    const normalizedSearch = searchText.replace(/\r\n/g, '\n');
    if (normalizedHtml.includes(normalizedSearch)) {
        html = normalizedHtml.replace(normalizedSearch, fixText);
        changed = true;
    }
}

if (changed) {
    fs.writeFileSync('cctv24-worship.html', html);
    console.log("Fixed ticker wrapping logic completely. Used absolute positioning for the text.");
} else {
    console.log("Could not find blocks to replace.");
}
