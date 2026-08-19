const fs = require('fs');
const path = require('path');

const dir = 'C:\\Users\\czark\\Christian_Culture_Projekty\\polskieradio.cc';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const oldWeatherBlockRegex = /const dayPresets = \{[\s\S]*?\};[\s\S]*?const eveningPresets = \{[\s\S]*?\};[\s\S]*?const nightPresets = \{[\s\S]*?\};/m;

const newWeatherBlock = `const dayPresets = {
                        "WARSZAWA": "🌤️ 26°C / Ciepło, przelotne burze",
                        "KRAKÓW": "☀️ 27°C / Słonecznie i upalnie",
                        "OSTROWIEC ŚW.": "🌤️ 25°C / Lekkie chmury",
                        "GDAŃSK": "☀️ 23°C / Słonecznie, morska bryza",
                        "STALOWA WOLA": "☀️ 26°C / Ciepło",
                        "WROCŁAW": "☀️ 28°C / Słonecznie",
                        "POZNAŃ": "⛈️ 25°C / Możliwe burze",
                        "ŁÓDŹ": "🌤️ 25°C / Przelotne opady",
                        "SZCZECIN": "☀️ 24°C / Pogodnie",
                        "BYDGOSZCZ": "☀️ 25°C / Słonecznie",
                        "LUBLIN": "🌤️ 26°C / Lekkie zachmurzenie",
                        "BIAŁYSTOK": "🌤️ 24°C / Chłodniej",
                        "KATOWICE": "☀️ 26°C / Słonecznie",
                        "RZESZÓW": "☀️ 27°C / Słonecznie"
                    };
                } else if (hour >= 18 && hour < 22) {
                    const eveningPresets = {
                        "WARSZAWA": "🌇 22°C / Ciepły Wieczór",
                        "KRAKÓW": "🌇 23°C / Ciepły Zmierzch",
                        "OSTROWIEC ŚW.": "☁️ 21°C / Rześki Wieczór",
                        "GDAŃSK": "🌊 20°C / Rześki Wiatr",
                        "STALOWA WOLA": "🌇 22°C / Spokojny Wieczór",
                        "WROCŁAW": "🌇 24°C / Ciepły Zmierzch",
                        "POZNAŃ": "☁️ 21°C / Pochmurnie",
                        "ŁÓDŹ": "🌇 22°C / Spokojny Wieczór",
                        "SZCZECIN": "🌇 20°C / Chłodny Wieczór",
                        "BYDGOSZCZ": "🌇 21°C / Pogodnie",
                        "LUBLIN": "🌇 22°C / Ciepły Zmierzch",
                        "BIAŁYSTOK": "☁️ 20°C / Pochmurno",
                        "KATOWICE": "🌇 22°C / Pogodny Wieczór",
                        "RZESZÓW": "🌇 23°C / Pogodny Wieczór"
                    };
                } else {
                    const nightPresets = {
                        "WARSZAWA": "🌙 18°C / Gwieździsta Noc",
                        "KRAKÓW": "🌙 19°C / Czyste Niebo",
                        "OSTROWIEC ŚW.": "🌙 17°C / Chłodna Noc",
                        "GDAŃSK": "🌙 16°C / Nadmorska Noc",
                        "STALOWA WOLA": "🌙 17°C / Spokojna Noc",
                        "WROCŁAW": "🌙 19°C / Ciepła Noc",
                        "POZNAŃ": "🌙 18°C / Możliwe opady",
                        "ŁÓDŹ": "🌙 17°C / Spokojna Noc",
                        "SZCZECIN": "🌙 16°C / Chłodna Noc",
                        "BYDGOSZCZ": "🌙 17°C / Pogodna Noc",
                        "LUBLIN": "🌙 18°C / Gwieździsta Noc",
                        "BIAŁYSTOK": "🌙 15°C / Chłodna Noc",
                        "KATOWICE": "🌙 18°C / Czyste Niebo",
                        "RZESZÓW": "🌙 18°C / Ciepła Noc"
                    };`;

let updatedCount = 0;

for (const file of files) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    if (content.match(oldWeatherBlockRegex)) {
        content = content.replace(oldWeatherBlockRegex, newWeatherBlock);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated weather in ${file}`);
        updatedCount++;
    }
}

console.log(`Update complete. Modified ${updatedCount} files.`);
