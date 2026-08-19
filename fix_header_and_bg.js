const fs = require('fs');
let c = fs.readFileSync('zapolske-live.html', 'utf8');

// 1. Add white-space nowrap and ellipsis
c = c.replace(/\.header-brand\s*\{/, '.header-brand {\n            white-space: nowrap;');
c = c.replace(/\.tv-station-id\s*\{/, '.tv-station-id {\n            white-space: nowrap;');
c = c.replace(/\.live-badge\s*\{/, '.live-badge {\n            white-space: nowrap;');

c = c.replace(/<span id="zenoTrackTitle"/, '<span id="zenoTrackTitle" style="max-width: 400px; overflow: hidden; text-overflow: ellipsis;"');

// 2. Force the background to update
let bgScript = `
    <script>
        // Force the background to the user's new uploaded background just once
        if (localStorage.getItem('dzj_stream_image_forced_v1') !== 'true') {
            localStorage.setItem('dzj_stream_image', 'user_bg_3.jpg');
            localStorage.setItem('dzj_stream_image_forced_v1', 'true');
        }
    </script>
`;
c = c.replace(/<\/head>/, bgScript + '</head>');

fs.writeFileSync('zapolske-live.html', c, 'utf8');
