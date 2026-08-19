const fs = require('fs');
let html = fs.readFileSync('cctv24-worship.html', 'utf8');

const searchStr = `        /* --- Ticker elements sit in the black cinema bar --- */
        footer {
            /* No transform, sits naturally at the bottom (inside 128px letterbox) */
        }`;

const fixStr = `        /* --- Ticker elements sit in the black cinema bar --- */
        footer {
            /* Ensure footer is visible ON TOP of the black bar */
            position: relative !important;
            z-index: 100 !important;
        }`;

if (html.includes(searchStr)) {
    html = html.replace(searchStr, fixStr);
    fs.writeFileSync('cctv24-worship.html', html);
    console.log("Footer z-index fixed.");
} else {
    const normalizedHtml = html.replace(/\r\n/g, '\n');
    const normalizedSearch = searchStr.replace(/\r\n/g, '\n');
    if (normalizedHtml.includes(normalizedSearch)) {
        html = normalizedHtml.replace(normalizedSearch, fixStr);
        fs.writeFileSync('cctv24-worship.html', html);
        console.log("Footer z-index fixed (normalized).");
    } else {
        console.log("Could not find the footer CSS to fix z-index.");
    }
}
