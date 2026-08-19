const fs = require('fs');
let html = fs.readFileSync('cctv24-worship.html', 'utf8');

// Stop the image rotator interval and hide images
html = html.replace(/const bgImages = \[[\s\S]*?\];/g, 'const bgImages = []; // Disabled for video background');
html = html.replace(/setInterval\(\(\) => \{[\s\S]*?\}, 30000\);/g, '// Image rotator disabled for video background');

// Make the video tag active and autoplay the mp4
html = html.replace(/<video id="bg-video-1" class="bg-layer bg-video" style="opacity: 0;" muted playsinline><\/video>/g, 
`<video id="bg-video-1" class="bg-layer bg-video" style="opacity: 1; object-fit: cover;" autoplay loop muted playsinline>
            <source src="background_worship.mp4" type="video/mp4">
        </video>`);

// Hide the images by default
html = html.replace(/<img id="bg-img-active" class="bg-layer bg-image" style="opacity: 1;"/g, 
`<img id="bg-img-active" class="bg-layer bg-image" style="opacity: 0;"`);

fs.writeFileSync('cctv24-worship.html', html);
console.log("Updated background to use MP4 video.");
