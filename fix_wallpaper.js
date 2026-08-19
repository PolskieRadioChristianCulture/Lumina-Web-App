const fs = require('fs');

try {
    let content = fs.readFileSync('zapolske-live.html', 'utf8');

    // 1. Fix the hardcoded img src
    content = content.replace(
        /<img id="bg-img-active" class="bg-layer bg-image" style="opacity: 1;" src="[^"]+" alt="Breakfast Studio">/,
        '<img id="bg-img-active" class="bg-layer bg-image" style="opacity: 1;" src="Czwartek_za_Polske.jpg" alt="Breakfast Studio">'
    );

    // 2. Disable CCTV_NOCA logic for tonight
    const targetLogic = `if (hour >= 21 || hour < 6) {
                    return "CCTV_NOCA.jpg?v=1";
                }`;
    const replacementLogic = `// if (hour >= 21 || hour < 6) {
                //    return "CCTV_NOCA.jpg?v=1";
                // }`;
    
    content = content.replace(targetLogic, replacementLogic);
    
    // 3. Make customImgSrc default to the correct wallpaper instead of breakfast presenters
    content = content.replace(/let customImgSrc = "breakfast_presenters\.jpg";/, 'let customImgSrc = "Czwartek_za_Polske.jpg";');

    fs.writeFileSync('zapolske-live.html', content, 'utf8');
    console.log("Success");
} catch(e) {
    console.error(e);
}
