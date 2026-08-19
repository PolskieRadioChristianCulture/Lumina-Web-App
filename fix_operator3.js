const fs = require('fs');

try {
    let content = fs.readFileSync('zapolske-live.html', 'utf8');

    const regex = /safeStorage\.setItem\("dzj_stream_image", "Czwartek_za_Polske\.jpg"\);\s+customImgSrc = "Czwartek_za_Polske\.jpg";\s+if \(bgImageSelect\) bgImageSelect\.value = customImgSrc;\s+if \(bgActiveImg\) bgActiveImg\.src = getDynamicBackground\(customImgSrc\); else \{\s+bgActiveImg\.src = getDynamicBackground\(customImgSrc\);\s+\}/;

    const replaceBlock = `            if (safeStorage.getItem("dzj_stream_image")) {
                customImgSrc = safeStorage.getItem("dzj_stream_image");
                if (bgImageSelect) bgImageSelect.value = customImgSrc;
                if (bgActiveImg) bgActiveImg.src = getDynamicBackground(customImgSrc);
            } else {
                if (bgActiveImg) bgActiveImg.src = getDynamicBackground(customImgSrc);
            }`;

    if (regex.test(content)) {
        content = content.replace(regex, replaceBlock);
        fs.writeFileSync('zapolske-live.html', content, 'utf8');
        console.log("Success! Replaced block using regex.");
    } else {
        console.error("Error: Regex did not match any content.");
    }
} catch(e) {
    console.error(e);
}
