const fs = require('fs');
let c = fs.readFileSync('zapolske-live.html', 'utf8');
const oldText = '<span class="ticker-highlight-msg">💬 Pozdrawiam serdecznie Kasię, Zosię, Pawła, Roberta i Bartka :) niech dobry Bóg Was błogosławi Kochani! ~Czarek &nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp; 💬 Pozdrawiam serdecznie księdza Jan Dubas z kościoła Opatrzności Bożej przy ul. Świadka 5 w Rzeszowie ~Katarzyna Fedków</span>';
const newText = '<span class="ticker-highlight-msg">💬 Czekamy na Wasze pozdrowienia i intencje! Piszcie na radiowego WhatsAppa!</span>';
c = c.replace(oldText, newText);
fs.writeFileSync('zapolske-live.html', c, 'utf8');
