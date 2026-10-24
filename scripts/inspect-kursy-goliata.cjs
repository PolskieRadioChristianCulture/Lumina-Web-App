const fs = require('fs');
const html = fs.readFileSync('C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/kursy.html', 'utf8');
const idx = html.indexOf('goliata');
console.log('goliata index:', idx);
if (idx !== -1) {
  console.log(html.slice(Math.max(0, idx - 300), idx + 1800));
}
