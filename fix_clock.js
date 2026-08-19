const fs = require('fs');

try {
    let content = fs.readFileSync('zapolske-live.html', 'utf8');

    // Inside updateClock:
    const searchString = `if (safeStorage.getItem("dzj_stream_image") === "breakfast_presenters.jpg" || !safeStorage.getItem("dzj_stream_image")) {
                    const currentBg = getDynamicBackground("breakfast_presenters.jpg");`;
    const replaceString = `if (safeStorage.getItem("dzj_stream_image") === "breakfast_presenters.jpg" || !safeStorage.getItem("dzj_stream_image")) {
                    const currentBg = getDynamicBackground(customImgSrc);`;

    // Also fixing the \r\n vs \n for cross platform matching
    content = content.replace(/if \(safeStorage\.getItem\("dzj_stream_image"\) === "breakfast_presenters\.jpg" \|\| !safeStorage\.getItem\("dzj_stream_image"\)\) \{\r?\n\s+const currentBg = getDynamicBackground\("breakfast_presenters\.jpg"\);/g, 
    'if (safeStorage.getItem("dzj_stream_image") === "breakfast_presenters.jpg" || !safeStorage.getItem("dzj_stream_image")) {\n                    const currentBg = getDynamicBackground(customImgSrc);');

    fs.writeFileSync('zapolske-live.html', content, 'utf8');
    console.log("Success");
} catch(e) {
    console.error(e);
}
