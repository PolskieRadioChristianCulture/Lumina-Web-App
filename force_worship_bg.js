const fs = require('fs');

let content = fs.readFileSync('cctv24-worship.html', 'utf8');

// Move the <link rel="stylesheet" href="live-window-manager.css"> BEFORE our custom <style> block so our styles override it
content = content.replace(/<link rel="stylesheet" href="live-window-manager\.css">\s*/g, '');
content = content.replace(/<style>/, '<link rel="stylesheet" href="live-window-manager.css">\n    <style>');

// Fix the storage override for the background
// We'll enforce the worship background by overriding the load from localStorage
content = content.replace(
    /if \(safeStorage\.getItem\("dzj_stream_image"\)\) \{/,
    `if (safeStorage.getItem("dzj_stream_image")) {
                safeStorage.setItem("dzj_stream_image", "INSTRUMENTAL WORSHIP MUSIC - CHRISTIAN CULTURE.jpg");`
);

// We should also replace the default customImgSrc initialization
content = content.replace(
    /let customImgSrc = "worship_bg\.jpg";/g,
    'let customImgSrc = "INSTRUMENTAL WORSHIP MUSIC - CHRISTIAN CULTURE.jpg";'
);

// Also update getDynamicBackground to strictly return the correct backgrounds for this page
content = content.replace(
    /function getDynamicBackground\(imagePath\) \{[\s\S]*?if \(hour >= 9 && hour < 12\)/,
    `function getDynamicBackground(imagePath) {
                const hour = new Date().getHours();
                if (hour >= 21 || hour < 6) return "CCTV NOCĄ.jpg";
                return "INSTRUMENTAL WORSHIP MUSIC - CHRISTIAN CULTURE.jpg";
                if (hour >= 9 && hour < 12)`
);

// Add !important to card-clock-widget background just to be absolutely sure
content = content.replace(
    /\.card-clock-widget \{[\s\S]*?background: transparent;/,
    `.card-clock-widget {
            background: transparent !important;`
);

fs.writeFileSync('cctv24-worship.html', content);
console.log("Forced worship background and fixed CSS specificity.");
