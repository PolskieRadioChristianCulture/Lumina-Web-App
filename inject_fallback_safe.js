const fs = require('fs');

try {
    let content = fs.readFileSync('zapolske-live.html', 'utf8');

    const regex = /onSnapshot\(q, \(snapshot\) => \{/;

    const fallbackCode = `let firebaseConnected = false;
        setTimeout(() => {
            if (!firebaseConnected && activePrayersList.length === 0) {
                console.log('Firebase fallback activated.');
                activePrayersList = [
                    {id:'f1', text:'Módlmy się o pokój i bezpieczeństwo dla naszej Ojczyzny oraz wszystkich strzegących jej granic.', name:'Wspólnota', city:'Polska'},
                    {id:'f2', text:'Panie, daj nam mądrość, odwagę i jedność w tym trudnym czasie.', name:'Redakcja', city:'Christian Culture'}
                ];
                processQueue();
            }
        }, 6000);
        onSnapshot(q, (snapshot) => {
            firebaseConnected = true;`;

    if (regex.test(content)) {
        content = content.replace(regex, fallbackCode);
        fs.writeFileSync('zapolske-live.html', content, 'utf8');
        console.log("Success! Fallback injected safely with UTF-8.");
    } else {
        console.error("Error: Could not find onSnapshot in file.");
    }
} catch(e) {
    console.error(e);
}
