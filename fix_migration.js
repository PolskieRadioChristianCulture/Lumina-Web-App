const fs = require('fs');

try {
    let content = fs.readFileSync('zapolske-live.html', 'utf8');

    // Insert the migration snippet before line 2699
    const targetString = `            if (safeStorage.getItem("dzj_stream_image")) {
                customImgSrc = safeStorage.getItem("dzj_stream_image");`;
                
    const replacementString = `            // Migrate old wallpaper selection
            if (safeStorage.getItem("dzj_stream_image") === "Tapeta_ZaPolske.jpg") {
                safeStorage.setItem("dzj_stream_image", "Czwartek_za_Polske.jpg");
            }

            if (safeStorage.getItem("dzj_stream_image")) {
                customImgSrc = safeStorage.getItem("dzj_stream_image");`;

    content = content.replace(targetString, replacementString);
    
    // Also add to the updateClock logic just to be extra sure!
    const clockTarget = `if (safeStorage.getItem("dzj_stream_image") === "breakfast_presenters.jpg" || !safeStorage.getItem("dzj_stream_image")) {`;
    const clockReplacement = `if (safeStorage.getItem("dzj_stream_image") === "breakfast_presenters.jpg" || safeStorage.getItem("dzj_stream_image") === "Tapeta_ZaPolske.jpg" || !safeStorage.getItem("dzj_stream_image")) {`;
    content = content.replace(clockTarget, clockReplacement);

    fs.writeFileSync('zapolske-live.html', content, 'utf8');
    console.log("Success");
} catch(e) {
    console.error(e);
}
