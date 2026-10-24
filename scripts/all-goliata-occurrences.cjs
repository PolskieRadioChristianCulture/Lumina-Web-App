const fs = require('fs');
const html = fs.readFileSync('C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/kursy.html', 'utf8');
let pos = 0;
while (true) {
  const idx = html.indexOf('goliata', pos);
  if (idx === -1) break;
  console.log(`Found at index ${idx}:`);
  console.log(html.slice(Math.max(0, idx - 50), idx + 250));
  console.log('-------------------');
  pos = idx + 7;
}
