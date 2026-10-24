const fs = require('fs');
const html = fs.readFileSync('C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/kursy.html', 'utf8');
const links = [...html.matchAll(/<link[^>]+stylesheet[^>]+>/g)].map(m => m[0]);
console.log('CSS links:', links);
const styles = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)];
console.log('Style count:', styles.length);
for (let i = 0; i < styles.length; i++) {
  if (styles[i][1].includes('cin-hero')) {
    console.log(`Found cin-hero in <style> #${i}!`);
    console.log(styles[i][1].slice(styles[i][1].indexOf('.cin-hero'), styles[i][1].indexOf('.cin-hero') + 1200));
  }
}
