const fs = require('fs');
const html = fs.readFileSync('C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/kursy.html', 'utf8');
const regex = /id=["']course-panel-goliata["'][\s\S]*?(?=<section id=["']course-panel-|<\/main>)/;
const match = html.match(regex);
if (match) {
  console.log('Match found! Length:', match[0].length);
  console.log(match[0].slice(0, 3000));
} else {
  console.log('regex not matched, searching for goliata section');
  const idx = html.indexOf('course-panel-goliata');
  console.log('idx:', idx);
  if (idx !== -1) {
    console.log(html.slice(idx - 100, idx + 2500));
  }
}
