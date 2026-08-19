const fs = require('fs');

try {
    let content = fs.readFileSync('zapolske-live.html', 'utf8');

    // 1. Fix the hardcoded img src
    content = content.replace(
        'src="CCTV_NOCA.jpg?v=1" alt="Breakfast Studio"',
        'src="Czwartek_za_Polske.jpg" alt="Breakfast Studio"'
    );

    // 2. Disable CCTV_NOCA logic for tonight
    const targetLogic = 'if (hour >= 21 || hour < 6) {\r\n                    return "CCTV_NOCA.jpg?v=1";\r\n                }';
    const replacementLogic = '// if (hour >= 21 || hour < 6) {\r\n                //    return "CCTV_NOCA.jpg?v=1";\r\n                // }';
    content = content.replace(targetLogic, replacementLogic);
    
    // Fallback for LF endings
    const targetLogicLF = 'if (hour >= 21 || hour < 6) {\n                    return "CCTV_NOCA.jpg?v=1";\n                }';
    const replacementLogicLF = '// if (hour >= 21 || hour < 6) {\n                //    return "CCTV_NOCA.jpg?v=1";\n                // }';
    content = content.replace(targetLogicLF, replacementLogicLF);

    // 3. Make customImgSrc default to the correct wallpaper instead of breakfast presenters
    content = content.replace(
        'let customImgSrc = "breakfast_presenters.jpg";', 
        'let customImgSrc = "Czwartek_za_Polske.jpg";'
    );

    fs.writeFileSync('zapolske-live.html', content, 'utf8');
    console.log("Success");
} catch(e) {
    console.error(e);
}
