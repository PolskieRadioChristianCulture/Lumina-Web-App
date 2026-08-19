const fs = require('fs');

try {
    let content = fs.readFileSync('zapolske-live.html', 'utf8');

    const targetBlock = `        onSnapshot(q, (snapshot) => {
            const approvedIntentions = [];`;

    const replacementBlock = `        // Fallback timeout in case Firebase fails to connect (e.g. OBS security restrictions)
        let firebaseConnected = false;
        setTimeout(() => {
            if (!firebaseConnected && activePrayersList.length === 0) {
                console.log("Firebase timeout. Using offline fallback for prayers.");
                activePrayersList = [{
                    id: "fallback1",
                    text: "Módlmy się o pokój i bezpieczeństwo dla naszej Ojczyzny oraz wszystkich strzegących jej granic.",
                    name: "Wspólnota",
                    city: "Polska"
                }, {
                    id: "fallback2",
                    text: "Panie, daj nam mądrość, odwagę i jedność w tym trudnym czasie.",
                    name: "Redakcja",
                    city: "Christian Culture"
                }];
                processQueue();
            }
        }, 6000);

        try {
            onSnapshot(q, (snapshot) => {
                firebaseConnected = true;
                const approvedIntentions = [];`;

    if (content.includes("onSnapshot(q, (snapshot) => {")) {
        content = content.replace(targetBlock, replacementBlock);
        
        // Fix the closing bracket of the try-catch for onSnapshot
        const endBlock = `            // Local sort: newest first`;
        const endReplacement = `            } catch(e) { console.error("Firebase onSnapshot error:", e); }
            
            // Local sort: newest first`;
        
        // Actually, onSnapshot isn't synchronous so try/catch around it only catches immediate setup errors,
        // but the fallback timeout will handle both setup errors and connection failures.
        // Let's just do the fallback injection!
        fs.writeFileSync('zapolske-live.html', content, 'utf8');
        console.log("Success! Fallback injected.");
    }
} catch(e) {
    console.error(e);
}
