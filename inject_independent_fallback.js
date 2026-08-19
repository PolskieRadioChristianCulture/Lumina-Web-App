const fs = require('fs');

try {
    let content = fs.readFileSync('zapolske-live.html', 'utf8');

    // First, fix the broken onSnapshot block if there's syntax left
    content = content.replace("        \n            const approvedIntentions", "        onSnapshot(q, (snapshot) => {\n            const approvedIntentions");

    // Independent Fallback Script
    const independentScript = `    <!-- Independent OBS Fallback Script -->
    <script>
        setTimeout(() => {
            const overlay = document.getElementById("livePrayerOverlay");
            const author = document.getElementById("livePrayerAuthor");
            const text = document.getElementById("livePrayerText");
            
            if (overlay && window.getComputedStyle(overlay).opacity === "0") {
                console.log("Independent Fallback triggered due to module/Firebase failure!");
                const fallbacks = [
                    {text:'"Módlmy się o pokój i bezpieczeństwo dla naszej Ojczyzny oraz wszystkich strzegących jej granic."', name:'Wspólnota, Polska'},
                    {text:'"Panie, daj nam mądrość, odwagę i jedność w tym trudnym czasie."', name:'Redakcja, Christian Culture'}
                ];
                let idx = 0;
                
                function showFallback() {
                    if (text && author) {
                        text.textContent = fallbacks[idx].text;
                        author.textContent = "- " + fallbacks[idx].name;
                    }
                    overlay.style.opacity = "1";
                    overlay.style.transform = "translateY(0)";
                    overlay.style.pointerEvents = "auto";
                    
                    setTimeout(() => {
                        overlay.style.opacity = "0";
                        overlay.style.transform = "translateY(20px)";
                        overlay.style.pointerEvents = "none";
                        
                        idx = (idx + 1) % fallbacks.length;
                        setTimeout(showFallback, 5000);
                    }, 20000);
                }
                showFallback();
            }
        }, 12000); // Wait 12 seconds for standard module to load
    </script>
</body>`;

    content = content.replace("</body>", independentScript);
    
    fs.writeFileSync('zapolske-live.html', content, 'utf8');
    console.log("Success! Independent fallback injected.");
} catch(e) {
    console.error(e);
}
