const fs = require('fs');

try {
    let content = fs.readFileSync('zapolske-live.html', 'utf8');

    const targetBlock = `            safeStorage.setItem("dzj_stream_image", "Czwartek_za_Polske.jpg");
            customImgSrc = "Czwartek_za_Polske.jpg";
            if (bgImageSelect) bgImageSelect.value = customImgSrc;
            if (bgActiveImg) bgActiveImg.src = getDynamicBackground(customImgSrc); else {
                bgActiveImg.src = getDynamicBackground(customImgSrc);
            }`;

    const replaceBlock = `            if (safeStorage.getItem("dzj_stream_image")) {
                customImgSrc = safeStorage.getItem("dzj_stream_image");
                if (bgImageSelect) bgImageSelect.value = customImgSrc;
                if (bgActiveImg) bgActiveImg.src = getDynamicBackground(customImgSrc);
            } else {
                if (bgActiveImg) bgActiveImg.src = getDynamicBackground(customImgSrc);
            }`;

    if (content.includes(targetBlock)) {
        content = content.replace(targetBlock, replaceBlock);
        fs.writeFileSync('zapolske-live.html', content, 'utf8');
        console.log("Success! Found and replaced block exactly.");
    } else {
        console.error("Error: Could not find targetBlock in file.");
    }
} catch(e) {
    console.error(e);
}
