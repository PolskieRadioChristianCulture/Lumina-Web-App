const fs = require('fs');
const path = require('path');

// Part 1: Resolve Active YouTube Live Stream ID
async function updateLiveStreamId() {
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
            return false;
        }
        
        console.log("Detected active Live Stream ID:", detectedId);
        
        const indexHtmlPath = path.join(__dirname, 'index.html');
        let indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
        
        // Define replacement regex patterns
        const iframeRegex = /(www\.youtube\.com\/embed\/)([a-zA-Z0-9_-]+)(\?)/;
        const variableRegex = /(const streamId = ")([a-zA-Z0-9_-]+)(";)/;
        const urlRegex = /(youtube\.com\/live\/)([a-zA-Z0-9_-]+)('|"|\b)/;
        const urlRegexG = /(youtube\.com\/live\/)([a-zA-Z0-9_-]+)('|"|\b)/g;
        
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
            indexHtml = indexHtml.replace(urlRegexG, `$1${detectedId}$3`);
            modified = true;
        }
        
        if (modified) {
            fs.writeFileSync(indexHtmlPath, indexHtml, 'utf8');
            console.log("Updated index.html with new live stream ID:", detectedId);
            return true;
        }
        console.log("Stream ID on index.html is already up-to-date.");
        return false;
    } catch (error) {
        console.error("Error during live stream ID update:", error);
        return false;
    }
}

// Part 2: Fetch and parse real news from WP RSS
async function updateNews() {
    try {
        console.log("Fetching latest news from WP RSS...");
        const res = await fetch("https://wiadomosci.wp.pl/rss.xml", {
            headers: {
                'User-Agent': 'Mozilla/5.0'
            }
        });
        const xml = await res.text();
        
        const items = [];
        const itemRegex = /<item>([\s\S]*?)<\/item>/g;
        let match;
        while ((match = itemRegex.exec(xml)) !== null) {
            const itemContent = match[1];
            const titleRegex = /<title>(.*?)<\/title>/;
            const titleMatch = titleRegex.exec(itemContent);
            if (titleMatch) {
                let title = titleMatch[1];
                // Decode HTML entities
                title = title
                    .replace(/&#34;/g, '"')
                    .replace(/&quot;/g, '"')
                    .replace(/&#39;/g, "'")
                    .replace(/&apos;/g, "'")
                    .replace(/&amp;/g, '&')
                    .replace(/<!\[CDATA\[/g, '')
                    .replace(/\]\]>/g, '')
                    .trim();
                if (title && !items.includes(title)) {
                    items.push(title);
                }
            }
        }
        
        // Take top 12 news items
        const topNews = items.slice(0, 12);
        if (topNews.length === 0) {
            console.log("No news parsed from XML.");
            return false;
        }
        
        const newsJsonPath = path.join(__dirname, 'news.json');
        let currentNewsStr = "";
        if (fs.existsSync(newsJsonPath)) {
            currentNewsStr = fs.readFileSync(newsJsonPath, 'utf8');
        }
        
        const newNewsStr = JSON.stringify(topNews, null, 2);
        if (currentNewsStr !== newNewsStr) {
            fs.writeFileSync(newsJsonPath, newNewsStr, 'utf8');
            console.log("Updated news.json with fresh headlines.");
            return true;
        }
        console.log("News headlines are already up-to-date.");
        return false;
    } catch (error) {
        console.error("Error updating news:", error);
        return false;
    }
}

// Master execution cycle
async function runUpdateCycle() {
    try {
        let modified = false;
        
        // Run both updates
        const streamModified = await updateLiveStreamId();
        if (streamModified) modified = true;
        
        const newsModified = await updateNews();
        if (newsModified) modified = true;
        
        if (modified) {
            const { execSync } = require('child_process');
            execSync('git add index.html news.json', { cwd: __dirname });
            execSync('git commit -m "chore: auto-update live stream and news headlines"', { cwd: __dirname });
            execSync('git push origin main', { cwd: __dirname });
            console.log("Successfully pushed updates to GitHub.");
        } else {
            console.log("No modifications found. Git push skipped.");
        }
    } catch (e) {
        console.error("Master cycle error:", e);
    }
}

runUpdateCycle();
