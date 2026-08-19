const fs = require('fs');
let html = fs.readFileSync('cctv24-worship.html', 'utf8');

// Remove backdrop-filter from footer to fix flickering/blinking caused by underlying animations
const search = `        footer {
            display: flex !important;
            align-items: center !important;
            background: rgba(0, 0, 0, 0.5) !important;
            backdrop-filter: blur(15px) !important;
            border-top: 1px solid rgba(255,255,255,0.1) !important;`;
            
const fix = `        footer {
            display: flex !important;
            align-items: center !important;
            background: rgba(0, 0, 0, 0.95) !important; /* Solid background, no blur */
            /* backdrop-filter removed to prevent GPU flickering bug with wide-spectrum */
            border-top: 1px solid rgba(255,255,255,0.1) !important;`;

if (html.includes(search)) {
    html = html.replace(search, fix);
    fs.writeFileSync('cctv24-worship.html', html);
    console.log("Removed backdrop-filter from footer.");
} else {
    const normalizedHtml = html.replace(/\r\n/g, '\n');
    const normalizedSearch = search.replace(/\r\n/g, '\n');
    if (normalizedHtml.includes(normalizedSearch)) {
        html = normalizedHtml.replace(normalizedSearch, fix);
        fs.writeFileSync('cctv24-worship.html', html);
        console.log("Removed backdrop-filter from footer (normalized).");
    } else {
        console.log("Could not find footer CSS to remove blur.");
    }
}
