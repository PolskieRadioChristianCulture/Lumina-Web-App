const fs = require('fs');

try {
    let content = fs.readFileSync('zapolske-live.html', 'utf8');

    // Remove the previous migration logic
    const oldMigration = `            if (safeStorage.getItem("dzj_stream_image") === "Tapeta_ZaPolske.jpg") { safeStorage.setItem("dzj_stream_image", "Czwartek_za_Polske.jpg"); }`;
    content = content.replace(oldMigration, '');

    // Override the localStorage reading entirely
    const targetBlock = `            if (safeStorage.getItem("dzj_stream_image")) {
                customImgSrc = safeStorage.getItem("dzj_stream_image");
                bgImageSelect.value = customImgSrc;
                bgActiveImg.src = getDynamicBackground(customImgSrc);
            } else {
                bgActiveImg.src = getDynamicBackground(customImgSrc);
            }`;

    const overrideBlock = `            // --- FORCED OVERRIDE FOR TONIGHT ---
            safeStorage.setItem("dzj_stream_image", "Czwartek_za_Polske.jpg");
            customImgSrc = "Czwartek_za_Polske.jpg";
            if (bgImageSelect) bgImageSelect.value = customImgSrc;
            if (bgActiveImg) bgActiveImg.src = getDynamicBackground(customImgSrc);
            // -----------------------------------`;

    content = content.replace(targetBlock, overrideBlock);

    // Also forcefully overwrite inside updateClock
    const clockRegex = /if \(safeStorage\.getItem\("dzj_stream_image"\) === "breakfast_presenters\.jpg" \|\| safeStorage\.getItem\("dzj_stream_image"\) === "Tapeta_ZaPolske\.jpg" \|\| !safeStorage\.getItem\("dzj_stream_image"\)\) \{/g;
    content = content.replace(clockRegex, 'if (true) { // Force update clock to use current customImgSrc');

    fs.writeFileSync('zapolske-live.html', content, 'utf8');
    console.log("Forced override applied");
} catch(e) {
    console.error(e);
}
