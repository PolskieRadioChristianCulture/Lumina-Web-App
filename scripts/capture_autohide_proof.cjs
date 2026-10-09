const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT_DIR = path.resolve(__dirname, '..');
const ARTIFACT_DIR = 'C:/Users/czark/.gemini/antigravity/brain/16cbcd2a-11aa-4876-9bfa-0cd391b5ec41';

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp'
};

const server = http.createServer((req, res) => {
    let reqUrl = req.url.split('?')[0].split('#')[0];
    if (reqUrl === '/') reqUrl = '/lumina-tablica.html';
    const filePath = path.join(ROOT_DIR, reqUrl);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath).toLowerCase();
        res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream', 'Access-Control-Allow-Origin': '*' });
        fs.createReadStream(filePath).pipe(res);
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
    }
});

server.listen(8215, async () => {
    try {
        const browser = await chromium.launch({ headless: true });
        const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
        const page = await context.newPage();

        await page.goto('http://127.0.0.1:8215/lumina-tablica.html', { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(600);

        // Remove cookie banner and any overlay dock that might obstruct screenshots
        await page.evaluate(() => {
            const cookies = document.querySelectorAll('[id*="cookie"], [class*="cookie"], .cookie-notice, .lumina-cookie-banner');
            cookies.forEach(el => el.remove());
            const dock = document.querySelector('.bottom-nav-dock, .mobile-dock, .dock-container');
            if (dock) dock.remove();
        });

        const playerWrapper = page.locator('#card_live_tablica_community .mission-live-player-wrapper');
        await playerWrapper.waitFor({ state: 'visible', timeout: 5000 });
        await playerWrapper.scrollIntoViewIfNeeded();

        // 1. Initial visible overlay (buttons present)
        await playerWrapper.screenshot({ path: path.join(ARTIFACT_DIR, 'proof_overlay_visible.png') });
        console.log('1. Captured proof_overlay_visible.png');

        // 2. Wait 4 seconds for auto-hide without mouse movement
        await page.mouse.move(0, 0);
        await page.waitForTimeout(4000);
        await playerWrapper.screenshot({ path: path.join(ARTIFACT_DIR, 'proof_overlay_autohidden.png') });
        console.log('2. Captured proof_overlay_autohidden.png');

        // 3. User interaction restores overlay
        await playerWrapper.hover();
        await page.waitForTimeout(400);
        await playerWrapper.screenshot({ path: path.join(ARTIFACT_DIR, 'proof_overlay_restored.png') });
        console.log('3. Captured proof_overlay_restored.png');

        await browser.close();
        console.log('✅ Proof generation completed successfully!');
    } catch(e) {
        console.error('Error generating proofs:', e);
    } finally {
        server.close();
    }
});
