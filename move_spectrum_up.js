const fs = require('fs');
let html = fs.readFileSync('cctv24-worship.html', 'utf8');

const searchStr = `        .wide-spectrum {
            position: absolute;
            bottom: 60px; /* Nad tickerem */
            left: 0;`;

const fixStr = `        .wide-spectrum {
            position: absolute;
            bottom: 128px; /* Zaczyna się równo z krawędzią grafiki (nad kinowym pasem) */
            left: 0;`;

if (html.includes(searchStr)) {
    html = html.replace(searchStr, fixStr);
    fs.writeFileSync('cctv24-worship.html', html);
    console.log("Wide spectrum moved up to 128px.");
} else {
    const normalizedHtml = html.replace(/\r\n/g, '\n');
    const normalizedSearch = searchStr.replace(/\r\n/g, '\n');
    if (normalizedHtml.includes(normalizedSearch)) {
        html = normalizedHtml.replace(normalizedSearch, fixStr);
        fs.writeFileSync('cctv24-worship.html', html);
        console.log("Wide spectrum moved up to 128px (normalized).");
    } else {
        console.log("Could not find the wide-spectrum CSS.");
    }
}
