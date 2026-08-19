const fs = require('fs');
let html = fs.readFileSync('cctv24-worship.html', 'utf8');

const searchStr = `        /* --- Move ticker elements ABOVE the 21:9 letterbox --- */
        footer {
            transform: translateY(-128px) !important;
        }
        .ticker-popup-tab {
            bottom: 213px !important; /* 85px footer + 128px bar */
        }`;

const fixStr = `        /* --- Ticker elements sit in the black cinema bar --- */
        footer {
            /* No transform, sits naturally at the bottom (inside 128px letterbox) */
        }
        .ticker-popup-tab {
            bottom: 85px !important; /* Right above the footer */
        }`;

if (html.includes(searchStr)) {
    html = html.replace(searchStr, fixStr);
    fs.writeFileSync('cctv24-worship.html', html);
    console.log("Footer moved back into the black bar.");
} else {
    const normalizedHtml = html.replace(/\r\n/g, '\n');
    const normalizedSearch = searchStr.replace(/\r\n/g, '\n');
    if (normalizedHtml.includes(normalizedSearch)) {
        html = normalizedHtml.replace(normalizedSearch, fixStr);
        fs.writeFileSync('cctv24-worship.html', html);
        console.log("Footer moved back into the black bar (normalized).");
    } else {
        console.log("Could not find the footer transform CSS.");
    }
}
