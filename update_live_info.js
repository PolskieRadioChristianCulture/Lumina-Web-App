const fs = require('fs');
const path = require('path');

async function updateLiveStream() {
    try {
        const url = "https://www.youtube.com/@ChristianCultureTV/live";
        console.log("Fetching live redirect from:", url);
        const res = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        const finalUrl = res.url;
        let detectedId = null;
        
        const match = finalUrl.match(/v=([a-zA-Z0-9_-]+)/);
        if (match) {
            detectedId = match[1];
        } else {
            const html = await res.text();
            const canonMatch = html.match(/<link rel="canonical" href="https:\/\/www\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)"/);
            if (canonMatch) {
                detectedId = canonMatch[1];
            } else {
                const vidMatch = html.match(/"videoId"\s*:\s*"([a-zA-Z0-9_-]+)"/);
                if (vidMatch) {
                    detectedId = vidMatch[1];
                }
            }
        }
        
        if (!detectedId) {
            console.log("No active live stream ID detected.");
            return;
        }
        
        console.log("Detected active Live Stream ID:", detectedId);
        
        const indexHtmlPath = path.join(__dirname, 'index.html');
        let indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
        
        // Define replacement regex patterns
        const iframeRegex = /(www\.youtube\.com\/embed\/)([a-zA-Z0-9_-]+)(\?)/;
        const variableRegex = /(const streamId = ")([a-zA-Z0-9_-]+)(";)/;
        const urlRegex = /(youtube\.com\/live\/)([a-zA-Z0-9_-]+)('|"|\b)/;
        
        let modified = false;
        
        if (indexHtml.match(iframeRegex) && indexHtml.match(iframeRegex)[2] !== detectedId) {
            indexHtml = indexHtml.replace(iframeRegex, `$1${detectedId}$3`);
            modified = true;
        }
        if (indexHtml.match(variableRegex) && indexHtml.match(variableRegex)[2] !== detectedId) {
            indexHtml = indexHtml.replace(variableRegex, `$1${detectedId}$3`);
            modified = true;
        }
        if (indexHtml.match(urlRegex) && indexHtml.match(urlRegex)[2] !== detectedId) {
            indexHtml = indexHtml.replace(urlRegex, `$1${detectedId}$3`);
            modified = true;
        }
        
        if (modified) {
            fs.writeFileSync(indexHtmlPath, indexHtml, 'utf8');
            console.log("Updated index.html with new live stream ID:", detectedId);
            
            // Execute git commit and push
            const { execSync } = require('child_process');
            execSync('git commit -am "chore: auto-update YouTube Live Stream ID to ' + detectedId + '"', { cwd: __dirname });
            execSync('git push origin main', { cwd: __dirname });
            console.log("Successfully pushed update to GitHub.");
        } else {
            console.log("Stream ID on index.html is already up-to-date.");
        }
    } catch (error) {
        console.error("Error during update execution:", error);
    }
}

updateLiveStream();
