const fs = require('fs');
const path = require('path');

const dir = 'C:\\Users\\czark\\Christian_Culture_Projekty\\polskieradio.cc';

const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const oldGreetingRegex = /const greetingsText = `<span class="ticker-announcement">ZA CHWILĘ: GŁOS WIDZÓW 📺<\/span> <span class="ticker-highlight-msg">💬 Pozdrawiam serdecznie Kasię, Zosię, Pawła, Roberta i Bartka :\) niech dobry Bóg Was błogosławi Kochani! ~Czarek &nbsp;&nbsp;&nbsp; \| &nbsp;&nbsp;&nbsp; 💬 Pozdrawiam serdecznie księdza Jan Dubas z kościoła Opatrzności Bożej przy ul\. Świadka 5 w Rzeszowie ~Katarzyna Fedków<\/span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`;/g;

const newGreetingRegex = /const greetingsText = `<span class="ticker-announcement">ZA CHWILĘ: GŁOS WIDZÓW 📺<\/span> <span class="ticker-highlight-msg">.*?<\/span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`;/g;

const newGreeting = 'const greetingsText = `<span class="ticker-announcement">ZA CHWILĘ: GŁOS WIDZÓW 📺</span> <span class="ticker-highlight-msg">💬 Pozdrawiamy wszystkich uczestników wspólnej modlitwy! Niech ten dzień przyniesie Wam Boży pokój ~Redakcja CC &nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp; 💬 Dziękujemy za Wasze wiadomości i codzienne wsparcie naszej misji. Jesteście wspaniali! ~Zespół Christian Culture</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`;';

let updatedCount = 0;

for (const file of files) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // We try to replace the known old greeting, or just any greetingsText that matches the general structure.
    if (content.includes('const greetingsText = `<span class="ticker-announcement">ZA CHWILĘ: GŁOS WIDZÓW 📺</span>')) {
        content = content.replace(newGreetingRegex, newGreeting);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${file}`);
        updatedCount++;
    }
}

console.log(`Update complete. Modified ${updatedCount} files.`);
