const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const PORT = 8199;

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
        res.writeHead(200, {
            'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
            'Access-Control-Allow-Origin': '*'
        });
        fs.createReadStream(filePath).pipe(res);
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
    }
});

server.listen(PORT, async () => {
    console.log(`Test server running on http://127.0.0.1:${PORT}`);
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();

    try {
        console.log('0. Verifying TV Epafraz & Kino removal from master-live.html schedule...');
        const masterLiveHtml = fs.readFileSync(path.join(ROOT_DIR, 'master-live.html'), 'utf-8');
        if (masterLiveHtml.includes('tv-epafraz-live.html')) {
            throw new Error('master-live.html still contains references to tv-epafraz-live.html in schedule!');
        }
        if (masterLiveHtml.includes('kino-live.html')) {
            throw new Error('master-live.html still contains references to kino-live.html in schedule!');
        }
        console.log('✅ master-live.html completely free from tv-epafraz-live.html & kino-live.html!');

        console.log('1. Verifying Tablica Społeczności Live Stream & Mute/Unmute...');
        await page.goto(`http://127.0.0.1:${PORT}/lumina-tablica.html`, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(2000);

        const tablicaLiveCard = page.locator('#card_live_tablica_community');
        await tablicaLiveCard.waitFor({ state: 'visible', timeout: 5000 });
        const tablicaIframe = tablicaLiveCard.locator('iframe');
        const tablicaSrc = await tablicaIframe.getAttribute('src');
        console.log(`Tablica Live Iframe src: ${tablicaSrc}`);
        if (!tablicaSrc || !tablicaSrc.includes('master-live.html')) {
            throw new Error('Tablica Live iframe src does not contain master-live.html');
        }

        const unmuteBtnTablica = tablicaLiveCard.locator('.btn-unmute-live');
        const overlayTablica = tablicaLiveCard.locator('.mission-live-player-overlay');
        const isUnmuteTablicaVisible = await unmuteBtnTablica.isVisible();
        console.log(`Tablica Unmute button initially visible: ${isUnmuteTablicaVisible}`);

        // Check initial default muted state
        let tablicaBtnText = (await unmuteBtnTablica.innerText()).trim();
        let tablicaBtnUnmuted = await unmuteBtnTablica.getAttribute('data-unmuted');
        console.log(`Initial Tablica button state: text="${tablicaBtnText}", data-unmuted="${tablicaBtnUnmuted}"`);
        if (tablicaBtnUnmuted !== 'false' || !tablicaBtnText.includes('Włącz Dźwięk')) {
            throw new Error(`Tablica default state is not muted: ${tablicaBtnText}, data-unmuted=${tablicaBtnUnmuted}`);
        }

        // Test Auto-Hide: wait 4s without mouse activity and verify controls fade away
        console.log('Testing auto-hide after inactivity (waiting 4s)...');
        await page.waitForTimeout(4000);
        const isFadedAfterTimeout = await overlayTablica.evaluate(el => el.classList.contains('controls-faded'));
        console.log(`Controls faded after timeout: ${isFadedAfterTimeout}`);
        if (!isFadedAfterTimeout) {
            throw new Error('Overlay did not receive controls-faded class after inactivity!');
        }

        // Test Wake-up on user activity: hover over player restores buttons
        console.log('Testing wake-up on mouse hover...');
        await tablicaLiveCard.hover();
        await page.waitForTimeout(400);
        const isRestored = await overlayTablica.evaluate(el => !el.classList.contains('controls-faded'));
        console.log(`Controls restored after hover: ${isRestored}`);
        if (!isRestored) {
            throw new Error('Overlay did not restore visibility on hover!');
        }

        // Click to unmute
        await unmuteBtnTablica.click();
        await page.waitForTimeout(500);
        tablicaBtnText = (await unmuteBtnTablica.innerText()).trim();
        tablicaBtnUnmuted = await unmuteBtnTablica.getAttribute('data-unmuted');
        console.log(`Unmuted Tablica button state: text="${tablicaBtnText}", data-unmuted="${tablicaBtnUnmuted}"`);
        if (tablicaBtnUnmuted !== 'true' || !tablicaBtnText.includes('Wycisz Dźwięk')) {
            throw new Error(`Tablica failed to enter unmuted state: ${tablicaBtnText}`);
        }

        // Click again to mute back
        await unmuteBtnTablica.click();
        await page.waitForTimeout(500);
        tablicaBtnText = (await unmuteBtnTablica.innerText()).trim();
        tablicaBtnUnmuted = await unmuteBtnTablica.getAttribute('data-unmuted');
        console.log(`Muted-again Tablica button state: text="${tablicaBtnText}", data-unmuted="${tablicaBtnUnmuted}"`);
        if (tablicaBtnUnmuted !== 'false' || !tablicaBtnText.includes('Włącz Dźwięk')) {
            throw new Error(`Tablica failed to return to muted state: ${tablicaBtnText}`);
        }

        await tablicaLiveCard.screenshot({ path: 'C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138/verified_tablica_live_stream.png' });
        console.log('Saved screenshot: verified_tablica_live_stream.png');

        console.log('2. Verifying Cezary Personal Profile Live Stream & Mute/Unmute...');
        await page.goto(`http://127.0.0.1:${PORT}/lumina.cezaryrgowski.html`, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(500);

        const cezaryLiveCard = page.locator('#post_live_cezary_personal_stream');
        await cezaryLiveCard.waitFor({ state: 'visible', timeout: 5000 });
        const cezaryIframe = cezaryLiveCard.locator('iframe');
        const cezarySrc = await cezaryIframe.getAttribute('src');
        console.log(`Cezary Live Iframe src: ${cezarySrc}`);
        if (!cezarySrc || !cezarySrc.includes('master-live.html')) {
            throw new Error('Cezary Live iframe src does not contain master-live.html');
        }

        const unmuteBtnCezary = cezaryLiveCard.locator('.btn-unmute-live');
        const overlayCezary = cezaryLiveCard.locator('.mission-live-player-overlay');
        const isUnmuteCezaryVisible = await unmuteBtnCezary.isVisible();
        console.log(`Cezary Unmute button initially visible: ${isUnmuteCezaryVisible}`);

        // Check initial default muted state
        let cezaryBtnText = (await unmuteBtnCezary.innerText()).trim();
        let cezaryBtnUnmuted = await unmuteBtnCezary.getAttribute('data-unmuted');
        console.log(`Initial Cezary button state: text="${cezaryBtnText}", data-unmuted="${cezaryBtnUnmuted}"`);
        if (cezaryBtnUnmuted !== 'false' || !cezaryBtnText.includes('Włącz Dźwięk')) {
            throw new Error(`Cezary default state is not muted: ${cezaryBtnText}, data-unmuted=${cezaryBtnUnmuted}`);
        }

        // Test Auto-Hide: wait 4s without mouse activity and verify controls fade away
        console.log('Testing Cezary profile auto-hide after inactivity (waiting 4s)...');
        await page.mouse.move(0, 0);
        await page.waitForTimeout(4000);
        const isCezaryFaded = await overlayCezary.evaluate(el => el.classList.contains('controls-faded'));
        console.log(`Cezary controls faded after timeout: ${isCezaryFaded}`);
        if (!isCezaryFaded) {
            throw new Error('Cezary overlay did not receive controls-faded class after inactivity!');
        }

        // Test Wake-up on user activity: hover over player restores buttons
        console.log('Testing Cezary profile wake-up on mouse hover...');
        await cezaryLiveCard.locator('.post-header').hover();
        await page.waitForTimeout(400);
        const isCezaryRestored = await overlayCezary.evaluate(el => !el.classList.contains('controls-faded'));
        console.log(`Cezary controls restored after hover: ${isCezaryRestored}`);
        if (!isCezaryRestored) {
            throw new Error('Cezary overlay did not restore visibility on hover!');
        }

        // Click to unmute
        await unmuteBtnCezary.click();
        await page.waitForTimeout(500);
        cezaryBtnText = (await unmuteBtnCezary.innerText()).trim();
        cezaryBtnUnmuted = await unmuteBtnCezary.getAttribute('data-unmuted');
        console.log(`Unmuted Cezary button state: text="${cezaryBtnText}", data-unmuted="${cezaryBtnUnmuted}"`);
        if (cezaryBtnUnmuted !== 'true' || !cezaryBtnText.includes('Wycisz Dźwięk')) {
            throw new Error(`Cezary failed to enter unmuted state: ${cezaryBtnText}`);
        }

        // Click again to mute back
        await unmuteBtnCezary.click();
        await page.waitForTimeout(500);
        cezaryBtnText = (await unmuteBtnCezary.innerText()).trim();
        cezaryBtnUnmuted = await unmuteBtnCezary.getAttribute('data-unmuted');
        console.log(`Muted-again Cezary button state: text="${cezaryBtnText}", data-unmuted="${cezaryBtnUnmuted}"`);
        if (cezaryBtnUnmuted !== 'false' || !cezaryBtnText.includes('Włącz Dźwięk')) {
            throw new Error(`Cezary failed to return to muted state: ${cezaryBtnText}`);
        }

        await cezaryLiveCard.screenshot({ path: 'C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138/verified_cezary_live_stream.png' });
        console.log('Saved screenshot: verified_cezary_live_stream.png');

        console.log('🎉 ALL CHECKS PASSED: TV EPAFRAZ EXCLUDED & MUTE/UNMUTE WORKING FLAWLESSLY!');
    } catch (err) {
        console.error('❌ Test failed:', err);
        process.exitCode = 1;
    } finally {
        await browser.close();
        server.close();
    }
});
