const fs = require('fs');

const buf = fs.readFileSync('lumina.magdalena.html');
const search = Buffer.from('src="js/lumina-followed-friends.js"');
const replace = Buffer.from('src="js/lumina-followed-friends.js?v=20260918_green_dot_clean"');

const idx = buf.indexOf(search);
if (idx !== -1) {
    const newBuf = Buffer.concat([
        buf.subarray(0, idx),
        replace,
        buf.subarray(idx + search.length)
    ]);
    fs.writeFileSync('lumina.magdalena.html', newBuf);
    console.log('✅ Updated lumina.magdalena.html via binary buffer!');
} else {
    console.log('ℹ️ Search string not found in lumina.magdalena.html');
}
