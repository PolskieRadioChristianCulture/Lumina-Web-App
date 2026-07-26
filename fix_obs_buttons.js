const fs = require('fs');

let content = fs.readFileSync('nadawaj.html', 'utf8');
let original = content;

// 1. Add copyAndOpenOBS function and improve baseUrl handling in nadawaj.html
const oldModalJS = `            window.openEmbedModal = function(url) {
                const fullUrl = window.location.origin + "/" + url;`;

const newModalJS = `            window.copyAndOpenOBS = function(url) {
                const baseUrl = (window.location.protocol === "file:" || !window.location.origin || window.location.origin === "null") ? "https://polskieradio.cc" : window.location.origin;
                const fullUrl = baseUrl + "/" + url;
                
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(fullUrl).then(() => {
                        showToast("✅ Skopiowano link do schowka! Wklej w OBS jako Źródło Przeglądarki.");
                    }).catch(() => {
                        showToast("Otwarcia sceny OBS...");
                    });
                } else {
                    showToast("Otwieranie sceny OBS...");
                }
                window.open(fullUrl, '_blank');
            };

            window.openEmbedModal = function(url) {
                const baseUrl = (window.location.protocol === "file:" || !window.location.origin || window.location.origin === "null") ? "https://polskieradio.cc" : window.location.origin;
                const fullUrl = baseUrl + "/" + url;`;

content = content.replace(oldModalJS, newModalJS);

// 2. Update all <a href="*.html" target="_blank"...> Uruchom w OBS </a> to <button onclick="copyAndOpenOBS('*.html')">
content = content.replace(/<a href="([^"]+\.html)" target="_blank"([^>]*style="[^"]*")>\s*<i class="fa-solid fa-play"><\/i>\s*Uruchom w OBS\s*<\/a>/g, '<button onclick="copyAndOpenOBS(\'$1\')" $2 style="cursor: pointer; flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; font-weight: 800; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.5px; padding: 12px 10px; border-radius: 10px; transition: all 0.2s;"><i class="fa-solid fa-play"></i> Uruchom w OBS</button>');

// Fix double styles if any
content = content.replace(/style="[^"]*"\s*style="[^"]*"/g, (match) => {
    return match.split('style="')[1].split('"')[0] ? match : match;
});

if (content !== original) {
    fs.writeFileSync('nadawaj.html', content, 'utf8');
    console.log('Successfully updated OBS buttons and script in nadawaj.html!');
} else {
    console.log('No changes made to nadawaj.html');
}
