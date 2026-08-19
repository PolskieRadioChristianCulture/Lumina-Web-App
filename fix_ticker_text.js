const fs = require('fs');
let html = fs.readFileSync('cctv24-worship.html', 'utf8');

// Fix 1: The CSS for ticker-marquee-text
const cssSearch = `        .ticker-marquee-text {
            display: flex !important;
            align-items: center !important;
            padding-left: 100% !important;
        }`;
const cssFix = `        .ticker-marquee-text {
            display: flex !important;
            align-items: center !important;
            padding-left: 100% !important;
            flex-shrink: 0 !important; /* CRITICAL: prevents text from being crushed by flexbox */
            white-space: nowrap !important;
        }`;

if (html.includes(cssSearch)) {
    html = html.replace(cssSearch, cssFix);
    console.log("Fixed ticker CSS.");
} else {
    const normalizedHtml = html.replace(/\r\n/g, '\n');
    const normalizedSearch = cssSearch.replace(/\r\n/g, '\n');
    if (normalizedHtml.includes(normalizedSearch)) {
        html = normalizedHtml.replace(normalizedSearch, cssFix);
        console.log("Fixed ticker CSS (normalized).");
    } else {
        console.log("Could not find ticker CSS.");
    }
}

// Fix 2: The stray </span> in the HTML
// The stray </span> is here:
// powiadomienia o nowych utworach.</span></span> <span class="ticker-highlight-msg">
const straySearch = `powiadomienia o nowych utworach.</span></span> <span class="ticker-highlight-msg">`;
const strayFix = `powiadomienia o nowych utworach.</span> <span class="ticker-highlight-msg">`;

if (html.includes(straySearch)) {
    html = html.replace(straySearch, strayFix);
    console.log("Fixed stray </span>.");
} else {
    const normalizedStraySearch = straySearch.replace(/\r\n/g, '\n');
    if (html.replace(/\r\n/g, '\n').includes(normalizedStraySearch)) {
        html = html.replace(/\r\n/g, '\n').replace(normalizedStraySearch, strayFix);
        console.log("Fixed stray </span> (normalized).");
    } else {
        console.log("Could not find stray </span>.");
    }
}

// Fix 3: Just in case there are multiple </span> tags at the end
// We should make sure the marqueeText spans properly.
// Let's just write it back.
fs.writeFileSync('cctv24-worship.html', html);
console.log("Fixes applied to cctv24-worship.html");
