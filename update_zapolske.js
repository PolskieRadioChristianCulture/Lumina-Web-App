const fs = require('fs');

try {
    let content = fs.readFileSync('zapolske-live.html', 'utf8');

    // Replace the default background references
    content = content.replace(/Tapeta_ZaPolske\.jpg/g, 'Czwartek_za_Polske.jpg');
    content = content.replace(/Tapeta_ZaPolske/g, 'Czwartek_za_Polske');
    
    // Also, if the select menu has an option, let's update it
    content = content.replace(/<option value="Tapeta_ZaPolske\.jpg">/g, '<option value="Czwartek_za_Polske.jpg">');
    
    fs.writeFileSync('zapolske-live.html', content, 'utf8');
    console.log("Success");
} catch(e) {
    console.error(e);
}
