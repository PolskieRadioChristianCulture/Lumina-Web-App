const fs = require('fs');

let content = fs.readFileSync('cctv24-worship.html', 'utf8');

// Update the img tags for backgrounds to point to the requested images
// Since paths with spaces and Polish characters in URLs can be tricky, they should be URL encoded if in CSS, but in HTML src it's usually fine or we just use them directly if they are in the same folder.
content = content.replace(
    /<img id="bg-img-active" class="bg-layer bg-image" style="opacity: 1;" src=".*?" alt="Instrumental Worship Studio">/,
    '<img id="bg-img-active" class="bg-layer bg-image" style="opacity: 1;" src="INSTRUMENTAL WORSHIP MUSIC - CHRISTIAN CULTURE.jpg" alt="Instrumental Worship Studio">'
);

content = content.replace(
    /<img id="bg-img-swap"   class="bg-layer bg-image" style="opacity: 0; transition: opacity 2s ease-in-out;" src=".*?" alt="Instrumental Worship Studio 2">/,
    '<img id="bg-img-swap"   class="bg-layer bg-image" style="opacity: 0; transition: opacity 2s ease-in-out;" src="CCTV NOCĄ.jpg" alt="Instrumental Worship Studio 2">'
);

// Also remove the tv bumper if we don't want it interrupting music
content = content.replace(
    /id="tvBumperOverlay" class="tv-bumper-overlay"/,
    'id="tvBumperOverlay" class="tv-bumper-overlay" style="display: none !important;"'
);

fs.writeFileSync('cctv24-worship.html', content);
console.log("Updated images.");
