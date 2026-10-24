const fs = require('fs');
const html = fs.readFileSync('C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/kursy.html', 'utf8');
const matches = [...html.matchAll(/\.cin-hero[^{]*\{[^}]+\}/g)].map(m => m[0]);
console.log('cin-hero styles in kursy.html:');
console.log(matches.join('\n'));

// check styles around cin-hero in <style>
const styleIdx = html.indexOf('.cin-hero');
console.log('\nContext around .cin-hero:');
console.log(html.slice(styleIdx - 100, styleIdx + 1200));
