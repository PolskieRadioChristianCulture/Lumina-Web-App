const fs = require('fs');
let content = fs.readFileSync('cctv24-worship.html', 'utf8');

// Use regex to find and replace the function regardless of exact whitespace
const regex = /(function updateMediaSession\(track\) \{[\s\S]*?if \('mediaSession' in navigator[\s\S]*?\}\s*\})/;

const newFn = `function updateMediaSession(track) {
                // === RDS Live Track Display ===
                if (track && track.title) {
                    var rdsEl = document.getElementById('rds-track-name');
                    if (rdsEl) {
                        rdsEl.style.transition = 'opacity 0.6s ease';
                        rdsEl.style.opacity = '0';
                        setTimeout(function() {
                            var label = track.title;
                            if (track.artist) label += '  \u2013  ' + track.artist;
                            rdsEl.textContent = label;
                            rdsEl.style.opacity = '1';
                        }, 600);
                    }
                }
                if ('mediaSession' in navigator && track) {
                    navigator.mediaSession.metadata = new MediaMetadata({
                        title: track.title || "Instrumental Worship",
                        artist: track.artist || "Christian Culture Instrumental",
                        album: track.album || "Instrumental Worship - Christian Culture",
                        artwork: [{ src: 'worship_logo.png', sizes: '512x512', type: 'image/png' }]
                    });
                }
            }`;

const match = content.match(regex);
if (match) {
    console.log("Match found! Replacing...");
    content = content.replace(regex, newFn);
    fs.writeFileSync('cctv24-worship.html', content);
    console.log("SUCCESS: RDS live track hooked.");
} else {
    console.log("ERROR: regex did not match.");
}
