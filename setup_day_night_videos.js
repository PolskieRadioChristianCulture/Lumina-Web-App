const fs = require('fs');
let html = fs.readFileSync('cctv24-worship.html', 'utf8');

// Replace the old video tags with day and night video tags
const oldVideoTags = /<video id="bg-video-1"[\s\S]*?<\/video>\s*<video id="bg-video-2"[\s\S]*?<\/video>/;
const newVideoTags = `<video id="bg-video-day" class="bg-layer bg-video" style="opacity: 0; object-fit: cover; transition: opacity 3s ease-in-out;" autoplay loop muted playsinline>
            <source src="bg_video_day.mp4" type="video/mp4">
        </video>
        <video id="bg-video-night" class="bg-layer bg-video" style="opacity: 0; object-fit: cover; transition: opacity 3s ease-in-out;" autoplay loop muted playsinline>
            <source src="bg_video_night.mp4" type="video/mp4">
        </video>`;
html = html.replace(oldVideoTags, newVideoTags);

// Inject the time-based JS switcher
const scriptToInject = `
            // Background Video Day/Night Switcher
            function updateVideoBackground() {
                const now = new Date();
                const hour = now.getHours();
                
                const vidDay = document.getElementById("bg-video-day");
                const vidNight = document.getElementById("bg-video-night");
                
                // Night: 22:00 to 05:59
                if (hour >= 22 || hour < 6) {
                    if (vidDay) vidDay.style.opacity = 0;
                    if (vidNight) {
                        vidNight.style.opacity = 1;
                        if(vidNight.paused) vidNight.play().catch(e=>console.log(e));
                    }
                } else {
                    // Day: 06:00 to 21:59
                    if (vidNight) vidNight.style.opacity = 0;
                    if (vidDay) {
                        vidDay.style.opacity = 1;
                        if(vidDay.paused) vidDay.play().catch(e=>console.log(e));
                    }
                }
            }
            
            updateVideoBackground();
            setInterval(updateVideoBackground, 60000); // Check every minute
`;

// Insert the JS right after `const bgImages = [];`
html = html.replace(/const bgImages = \[\]; \/\/ Disabled for video background/, 
`const bgImages = []; // Disabled for video background\n${scriptToInject}`);

fs.writeFileSync('cctv24-worship.html', html);
console.log("Updated cctv24-worship.html for dynamic Day/Night video backgrounds.");
