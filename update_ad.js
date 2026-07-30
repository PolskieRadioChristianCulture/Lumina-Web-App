const fs = require('fs');

const liveFiles = [
    'zapolske-live.html',
    'bibleaudio-global.html',
    'cctv24-global.html',
    'cctv24-pl.html',
    'cctv24-worship.html',
    'cctv24.html'
];

// Part 1: Update the zoom ad overlay image from Za_Polske.jpg to B22vP.jpg
liveFiles.forEach(file => {
    try {
        let content = fs.readFileSync(file, 'utf8');
        content = content.replace(/Za_Polske\.jpg/g, 'B22vP.jpg');
        
        // Also update the ticker text
        // Let's insert the new marquee text just after the greeting text in defaultMissionText
        if (content.includes('defaultMissionText')) {
            const urgentMessage = ` <span style="background: #dc143c; color: #ffffff; padding: 2px 8px; border-radius: 4px; font-weight: 800; font-family: 'Montserrat', sans-serif; margin-right: 15px; display: inline-block;">🇵🇱 PILNE WEZWANIE DO MODLITWY 🙏🔥</span> `;
            // Insert it if not already there
            if (!content.includes('PILNE WEZWANIE DO MODLITWY')) {
                // Find where defaultMissionText is defined
                content = content.replace(
                    /(\$\{greetingsText\})/g,
                    `$1\n                    ${urgentMessage}`
                );
            }
        }
        
        fs.writeFileSync(file, content, 'utf8');
    } catch (e) {
        console.error("Error processing " + file, e);
    }
});

// Part 2: Update modlitwa.html
try {
    let modContent = fs.readFileSync('modlitwa.html', 'utf8');
    
    // Replace the bottom banner section
    const newBottomBanner = `<!-- Bottom Info Banner Section -->
        <div class="content-card" style="margin-top: 10px; padding: 30px; text-align: left; overflow: hidden;">
            <div style="margin-bottom: 25px; text-align: center;">
                <img src="B22vP.jpg" alt="Zjednoczeni za Polskę Pilne Wezwanie" style="max-width: 100%; height: auto; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08); box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
            </div>
            <div style="font-family: 'Outfit', sans-serif; font-size: 1.1rem; line-height: 1.6; color: #fff;">
                <h2 style="color: #ff4d6d; font-weight: 800; font-size: 1.5rem; text-align: center; margin-bottom: 20px;">🇵🇱 PILNE WEZWANIE DO MODLITWY 🙏🔥</h2>
                
                <p>W ostatnich godzinach wydarzenia na wschodzie Polski przypomniały nam, że jako Kościół jesteśmy powołani nie do życia w strachu, ale do czuwania i modlitwy.</p>

                <p>Dlatego dzisiaj o godz. 21:30 spotykamy się na dodatkowej modlitwie online w ramach Serc w Ogniu. Jest to narodowa grupa wstawiennicza, ekumeniczna, którą mam przywilej prowadzić. W porozumieniu ze Zjednoczonymi w Chrystusie zapraszam wszystkich serdecznie byśmy stanęli Zjednoczeni za Polskę ❤️🔥</p>

                <div style="background: rgba(255,255,255,0.05); border-left: 4px solid var(--gold-primary); padding: 15px; margin: 20px 0; font-style: italic; color: #d4d4d8;">
                    📖 „Na twoich murach, Jeruzalem, postawiłem strażników; przez cały dzień i przez całą noc nigdy nie umilkną.” (Iz 62,6)
                </div>

                <p>Podczas modlitwy będziemy wołać przede wszystkim:</p>
                <ul style="list-style-type: none; padding-left: 0; margin-bottom: 20px;">
                    <li style="margin-bottom: 8px;">🛡️ o Bożą ochronę nad Polską,</li>
                    <li style="margin-bottom: 8px;">🔥 o uszczelnienie naszej wschodniej granicy,</li>
                    <li style="margin-bottom: 8px;">🏙️ o Lublin oraz miasta i miejscowości przygraniczne,</li>
                    <li style="margin-bottom: 8px;">👮 o mądrość, ochronę i siłę dla wszystkich służb odpowiedzialnych za bezpieczeństwo naszego kraju,</li>
                    <li style="margin-bottom: 8px;">🤝 o pokój oraz Boże prowadzenie dla władz podejmujących decyzje.</li>
                </ul>

                <p style="font-weight: 700; color: #ffcc00;">Nie modlimy się z miejsca lęku. Modlimy się z miejsca wiary. ⚔️</p>

                <p>Wierzymy, że Bóg nadal szuka ludzi, którzy staną w wyłomie i będą wiernie pełnić straż na murach. Każda modlitwa ma znaczenie. Każdy wierny strażnik ma znaczenie.</p>

                <p>Jeśli czujesz, że Pan zachęca Cię, aby dołączyć do tej modlitwy, zapraszamy Cię dziś wieczorem.</p>

                <p>Niech w tym czasie Kościół będzie rozpoznawany nie po panice, lecz po modlitwie. Nie po strachu, lecz po wytrwałości. Nie po bezradności, lecz po gotowości, by stanąć przed Bogiem w imieniu naszego narodu.</p>

                <div style="background: rgba(255,255,255,0.05); border-left: 4px solid #ff4d6d; padding: 15px; margin: 20px 0; font-style: italic; color: #d4d4d8;">
                    📖 „Nie dał nam Bóg ducha bojaźni, lecz mocy, miłości i trzeźwego myślenia.” (2 Tm 1,7)
                </div>

                <p>Jeśli czujesz, że Pan zaprasza Cię dziś na mur modlitwy, wkrótce udostepnie tu link do spotkania na Zoomie.</p>

                <p>Czuj się też zaproszony do rozpowszechnienia tej informacji i zaproszenia ludzi o gorącym sercu chcącym stanąć wspólnie i odpowiedzieć na wydarzenia w świecie, wspólnym manifestem kościoła w Duchu 🙏</p>

                <p style="font-weight: 800; font-size: 1.2rem; text-align: center; margin-top: 30px;">🇵🇱 Do zobaczenia o 21:30.</p>
                
                <p style="text-align: center; font-size: 0.9rem; color: #999; margin-top: 20px;">
                    #SercaWOgniu #ModlitwaZaPolskę #StrażnicyNaMurach #ZjednoczeniZaPolskę
                </p>
            </div>
        </div>`;
    
    // Replace the old bottom banner section. 
    // It's defined as <!-- Bottom Info Banner Section --> to the end of the div.
    const pattern = /<!-- Bottom Info Banner Section -->[\s\S]*?<div class="content-card"[\s\S]*?zjednoczeni_tresc_1\.png[\s\S]*?<\/div>/;
    
    if (pattern.test(modContent)) {
        modContent = modContent.replace(pattern, newBottomBanner);
    } else {
        // If pattern fails, try to replace Za_Polske.jpg in modlitwa.html if it's there, but the user said "treść na stronę", meaning they want the text ON the page modlitwa.html.
        console.error("Could not find the bottom info banner section in modlitwa.html.");
    }
    
    fs.writeFileSync('modlitwa.html', modContent, 'utf8');
} catch (e) {
    console.error("Error processing modlitwa.html", e);
}
