const fs = require('fs');
const html = fs.readFileSync('C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/kursy.html', 'utf8');
const start = html.indexOf('<div id="course-view-goliata"');
const end = html.indexOf('</section>', start + 1000);
console.log(html.slice(start, start + 3500));
