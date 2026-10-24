const fs = require('fs');
const cssPath = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/css/lumina-courses.css';
if (fs.existsSync(cssPath)) {
  const css = fs.readFileSync(cssPath, 'utf8');
  console.log('lumina-courses.css exists, length:', css.length);
  const idx = css.indexOf('.cin-hero');
  if (idx !== -1) {
    console.log(css.slice(idx, idx + 2500));
  } else {
    console.log('.cin-hero not found in lumina-courses.css');
  }
} else {
  console.log('lumina-courses.css does not exist at path');
}
